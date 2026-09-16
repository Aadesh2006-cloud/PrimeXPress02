// Compatibility entry point for existing UI imports. Supabase is the only
// backend; no Firestore or local-data fallback can bypass database permissions.
import type { BookingRecord, ReviewRecord } from '../types';
import { adminSupabase } from '../supabaseClient.js';
import { requireAdmin } from './authService';
import {
  saveBookingToSupabase, getUserBookingsFromSupabase, getAllBookingsFromSupabase,
  getBookingByIdFromSupabase, updateBookingStatusInSupabase,
  updateBookingDetailsInSupabase, deleteBookingFromSupabase, saveReviewToSupabase, getReviewsFromSupabase,
} from './supabaseService';
import { dispatchNewBookingNotification, processAdminBookingApproval, deleteNotificationByBookingId } from './notificationService';
export { calculateBookingAmount, getBookingAmount } from '../utils/bookingPricing';
export { getStoredLocalBookings, saveLocalBookingRecord, getBookingByIdFromSupabase, syncConsumerBookings, findBookingsByQuery, updateBookingDetailsInSupabase, getDeletedBookingIds, markBookingAsPermanentlyDeleted, deduplicateBookings } from './supabaseService';

export async function saveBooking(booking: Omit<BookingRecord, 'id' | 'createdAt'>): Promise<string> {
  const id = await saveBookingToSupabase(booking);
  // Notifications are display-only and occur only after a successful write.
  dispatchNewBookingNotification({ ...booking, id, status: 'pending', createdAt: new Date().toISOString() });
  return id;
}
export async function approveBooking(booking: BookingRecord, _email?: string) {
  if (!booking.id) throw new Error('A booking reference is required.');
  const admin = await requireAdmin(adminSupabase);
  await updateBookingDetailsInSupabase(booking.id, { status: 'approved' });
  const { data, error } = await adminSupabase.from('bookings').select('*').eq('id', booking.id).single();
  if (error) throw new Error('Unable to retrieve the updated booking.');
  const confirmed = { ...booking, status: data.status, approvedAt: data.approved_at, approvedBy: data.approved_by };
  return processAdminBookingApproval(confirmed, admin.email!);
}
export const getUserBookings = (id = '', email?: string) => getUserBookingsFromSupabase(id, email);
export const getBookingById = getBookingByIdFromSupabase;
export const getAllBookings = getAllBookingsFromSupabase;
export const updateBookingStatus = updateBookingStatusInSupabase;
export async function deleteBooking(id: string) {
  await deleteBookingFromSupabase(id);
  deleteNotificationByBookingId(id);
}
export const saveReview = (review: Omit<ReviewRecord, 'id' | 'createdAt'>) => saveReviewToSupabase(review);
export const getRecentReviews = getReviewsFromSupabase;
