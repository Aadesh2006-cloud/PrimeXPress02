import {
  saveBookingToSupabase,
  getUserBookingsFromSupabase,
  getAllBookingsFromSupabase,
  updateBookingStatusInSupabase,
  updateBookingDetailsInSupabase,
  deleteBookingFromSupabase,
  saveReviewToSupabase,
  getReviewsFromSupabase,
  getStoredLocalBookings,
  findBookingsByQuery,
  getDeletedBookingIds,
  markBookingAsPermanentlyDeleted,
} from './supabaseService';
import { BookingRecord, BookingStatus, ReviewRecord } from '../types';
import {
  dispatchNewBookingNotification,
  processAdminBookingApproval,
  generateConsumerConfirmationEmail,
  deleteNotificationByBookingId,
  MASTER_ADMIN_EMAIL
} from './notificationService';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export {
  getStoredLocalBookings,
  findBookingsByQuery,
  updateBookingDetailsInSupabase,
  getDeletedBookingIds,
  markBookingAsPermanentlyDeleted
};

/**
 * Save booking to Supabase and Firestore backends and dispatch notifications:
 * 1. Alerts Admin mail (primexpress33@gmail.com)
 * 2. Alerts Admin Portal with pending status badge
 * 3. Saves to Cloud Firestore & Supabase
 */
export const saveBooking = async (
  booking: Omit<BookingRecord, 'id' | 'createdAt'>
): Promise<string> => {
  const savedId = await saveBookingToSupabase({
    ...booking,
    status: 'pending',
  });

  const fullRecord: BookingRecord = {
    ...booking,
    id: savedId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminNotificationSent: true,
  };

  // Dispatch notification to Admin Portal and Admin Email
  dispatchNewBookingNotification(fullRecord);

  // Cloud Firestore dual persistence
  try {
    const bookingRef = doc(db, 'bookings', savedId);
    await setDoc(bookingRef, {
      ...fullRecord,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.debug('Firestore booking sync note:', err);
  }

  return savedId;
};

/**
 * Approve a booking (Admin only):
 * 1. Changes status to 'confirmed'
 * 2. Generates & logs official consumer confirmation email
 * 3. Only after this approval does the consumer receive the confirmed booking
 */
export const approveBooking = async (
  booking: BookingRecord,
  adminEmail: string = MASTER_ADMIN_EMAIL
) => {
  if (!booking.id) return null;

  const updates = {
    status: 'confirmed' as const,
    approvedAt: new Date().toISOString(),
    approvedBy: adminEmail,
    consumerConfirmationSent: true,
  };

  await updateBookingDetailsInSupabase(booking.id, updates);

  try {
    const bookingRef = doc(db, 'bookings', booking.id);
    await updateDoc(bookingRef, updates);
  } catch (err) {
    console.debug('Firestore booking approval sync note:', err);
  }

  return processAdminBookingApproval(
    {
      ...booking,
      ...updates,
    },
    adminEmail
  );
};

/**
 * Fetch bookings for a user from Supabase
 */
export const getUserBookings = async (
  userId: string,
  userEmail?: string
): Promise<BookingRecord[]> => {
  return await getUserBookingsFromSupabase(userId, userEmail);
};

/**
 * Fetch a single booking by its ID across local cache, Firestore, and Supabase
 */
export const getBookingById = async (bookingId: string): Promise<BookingRecord | null> => {
  if (!bookingId) return null;

  // 1. Try local cache first for instant retrieval
  try {
    const localList = getStoredLocalBookings();
    const localFound = localList.find((b) => b.id === bookingId);
    if (localFound) return localFound;
  } catch {
    // ignore
  }

  // 2. Try Firestore
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const snap = await getDoc(bookingRef);
    if (snap.exists()) {
      return snap.data() as BookingRecord;
    }
  } catch (err) {
    console.debug('Firestore getBookingById note:', err);
  }

  // 3. Try Supabase query search
  try {
    const results = await findBookingsByQuery(bookingId);
    const matched = results.find((b) => b.id === bookingId);
    if (matched) return matched;
  } catch (err) {
    console.debug('Supabase getBookingById note:', err);
  }

  return null;
};

/**
 * Fetch all bookings for admin from Supabase
 */
export const getAllBookings = async (): Promise<BookingRecord[]> => {
  return await getAllBookingsFromSupabase();
};

/**
 * Update a booking status in Supabase & Firestore
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<void> => {
  await updateBookingStatusInSupabase(bookingId, status);
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.debug('Firestore status update note:', err);
  }
};

/**
 * Delete a booking permanently across Supabase, Firestore, local storage, and notifications.
 * It will NEVER reappear.
 */
export const deleteBooking = async (bookingId: string): Promise<void> => {
  if (!bookingId) return;

  // 1. Mark in tombstone list
  markBookingAsPermanentlyDeleted(bookingId);

  // 2. Remove notification
  deleteNotificationByBookingId(bookingId);

  // 3. Remove from Firestore
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingRef);
  } catch (err) {
    console.debug('Firestore delete doc note:', err);
  }

  // 4. Remove from Supabase & localStorage
  await deleteBookingFromSupabase(bookingId);
};

/**
 * Save a review in Supabase
 */
export const saveReview = async (
  review: Omit<ReviewRecord, 'id' | 'createdAt'>
): Promise<string> => {
  return await saveReviewToSupabase(review);
};

/**
 * Get recent reviews from Supabase
 */
export const getRecentReviews = async (): Promise<ReviewRecord[]> => {
  return await getReviewsFromSupabase();
};

