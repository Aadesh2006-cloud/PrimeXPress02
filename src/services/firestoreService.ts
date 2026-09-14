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
  saveLocalBookingRecord,
  getBookingByIdFromSupabase,
  syncConsumerBookings,
  findBookingsByQuery,
  getDeletedBookingIds,
  markBookingAsPermanentlyDeleted,
  deduplicateBookings,
} from './supabaseService';
import { calculateBookingAmount, getBookingAmount } from '../utils/bookingPricing';
import { BookingRecord, BookingStatus, ReviewRecord } from '../types';
import {
  dispatchNewBookingNotification,
  processAdminBookingApproval,
  generateConsumerConfirmationEmail,
  deleteNotificationByBookingId,
  MASTER_ADMIN_EMAIL
} from './notificationService';
import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export {
  getStoredLocalBookings,
  saveLocalBookingRecord,
  getBookingByIdFromSupabase,
  syncConsumerBookings,
  findBookingsByQuery,
  updateBookingDetailsInSupabase,
  getDeletedBookingIds,
  markBookingAsPermanentlyDeleted,
  deduplicateBookings,
  calculateBookingAmount,
  getBookingAmount,
};

/**
 * Save booking to Supabase and Firestore backends and dispatch notifications:
 * 1. Alerts Admin mail (primexpress33@gmail.com)
 * 2. Alerts Admin Portal with pending status badge
 * 3. Saves to Cloud Firestore & Supabase with normalized Gmail/email
 */
export const saveBooking = async (
  booking: Omit<BookingRecord, 'id' | 'createdAt'>
): Promise<string> => {
  const normalizedEmail = (booking.customerEmail || '').trim().toLowerCase();
  const amount = calculateBookingAmount(
    booking.serviceType,
    booking.propertyType,
    booking.estimatedPriceCAD
  );
  const normalizedBooking = {
    ...booking,
    customerEmail: normalizedEmail,
    estimatedPriceCAD: amount,
    status: (booking.status || 'pending') as BookingStatus,
  };

  const savedId = await saveBookingToSupabase(normalizedBooking);

  const fullRecord: BookingRecord = {
    ...normalizedBooking,
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
      customerEmail: normalizedEmail,
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
    status: 'approved' as const,
    approvedAt: new Date().toISOString(),
    approvedBy: adminEmail,
    consumerConfirmationSent: true,
  };

  const updatedBookingRecord: BookingRecord = {
    ...booking,
    ...updates,
  };

  // 1. Immediately update local storage so consumer views have the approved record
  saveLocalBookingRecord(updatedBookingRecord);

  // 2. Mark in local storage as latest approved booking for consumer alerts
  try {
    localStorage.setItem(
      'pxc_consumer_latest_approved',
      JSON.stringify({
        bookingId: booking.id,
        serviceType: booking.serviceType,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        preferredDate: booking.preferredDate,
        preferredTimeSlot: booking.preferredTimeSlot,
        timestamp: Date.now(),
      })
    );
  } catch {}

  // 3. Update Supabase backend
  await updateBookingDetailsInSupabase(booking.id, updates);

  // 4. Update Firestore if present
  try {
    const bookingRef = doc(db, 'bookings', booking.id);
    await updateDoc(bookingRef, updates);
  } catch (err) {
    console.debug('Firestore booking approval sync note:', err);
  }

  // 5. Broadcast custom event for immediate consumer view updates
  window.dispatchEvent(
    new CustomEvent('pxc-booking-approved', {
      detail: { bookingId: booking.id, booking: updatedBookingRecord },
    })
  );

  return processAdminBookingApproval(
    updatedBookingRecord,
    adminEmail
  );
};

/**
 * Fetch bookings strictly connected to a consumer's Gmail / email or user ID.
 * Queries both Supabase and Firestore, deduplicates records, and guarantees that
 * no other user's bookings are returned.
 */
export const getUserBookings = async (
  userId?: string,
  userEmail?: string
): Promise<BookingRecord[]> => {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const cleanUserId = (userId || '').trim();

  // If neither email nor userId is available, consumer has no connected bookings
  if (!cleanEmail && !cleanUserId) {
    return [];
  }

  const results: BookingRecord[] = [];
  const seenIds = new Set<string>();

  // 1. Fetch from Supabase
  try {
    const fromSb = await getUserBookingsFromSupabase(cleanUserId, cleanEmail);
    for (const b of fromSb) {
      if (b.id && !seenIds.has(b.id)) {
        seenIds.add(b.id);
        results.push(b);
      }
    }
  } catch (err) {
    console.debug('Supabase getUserBookings notice:', err);
  }

  // 2. Query Cloud Firestore dual database
  try {
    const bookingsColl = collection(db, 'bookings');

    if (cleanEmail) {
      const qEmail = query(bookingsColl, where('customerEmail', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      snapEmail.forEach((docSnap) => {
        const data = docSnap.data() as BookingRecord;
        const id = docSnap.id || data.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          results.push({ ...data, id });
        }
      });
    }

    if (cleanUserId) {
      const qUser = query(bookingsColl, where('userId', '==', cleanUserId));
      const snapUser = await getDocs(qUser);
      snapUser.forEach((docSnap) => {
        const data = docSnap.data() as BookingRecord;
        const id = docSnap.id || data.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          results.push({ ...data, id });
        }
      });
    }
  } catch (err) {
    console.debug('Firestore getUserBookings query notice:', err);
  }

  // 3. Filter out deleted bookings and strictly verify email / userId connection
  const deletedIds = new Set(getDeletedBookingIds());
  const valid = results.filter((b) => {
    if (!b || !b.id) return false;
    if (deletedIds.has(b.id)) return false;
    if (b.status === 'deleted' || (b as any).isDeleted) return false;
    
    const matchesEmail = Boolean(
      cleanEmail && b.customerEmail?.trim().toLowerCase() === cleanEmail
    );
    const matchesUser = Boolean(cleanUserId && b.userId === cleanUserId);
    return matchesEmail || matchesUser;
  });

  return deduplicateBookings(valid).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Fetch a single booking by its ID across Supabase, Firestore, and local cache.
 * Queries Supabase first to ensure the live approved status is returned to the consumer.
 */
export const getBookingById = async (bookingId: string): Promise<BookingRecord | null> => {
  if (!bookingId) return null;

  // 1. Try Supabase FIRST to get live database status (e.g. approved by admin)
  try {
    const fromSb = await getBookingByIdFromSupabase(bookingId);
    if (fromSb) {
      saveLocalBookingRecord(fromSb);
      return fromSb;
    }
  } catch (err) {
    console.debug('Supabase getBookingById note:', err);
  }

  // 2. Try Firestore
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const snap = await getDoc(bookingRef);
    if (snap.exists()) {
      const record = snap.data() as BookingRecord;
      saveLocalBookingRecord(record);
      return record;
    }
  } catch (err) {
    console.debug('Firestore getBookingById note:', err);
  }

  // 3. Fallback to local cache
  try {
    const localList = getStoredLocalBookings();
    const localFound = localList.find((b) => b.id === bookingId);
    if (localFound) return localFound;
  } catch {
    // ignore
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

