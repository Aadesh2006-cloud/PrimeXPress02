import { supabase, adminSupabase } from '../supabaseClient.js';
import type { BookingRecord, BookingStatus, ReviewRecord } from '../types';
import { requireAdmin, requireUser } from './authService';
import { privateStorage, privateDataVersion, assertPrivateDataVersion } from './privateData';
import { calculateBookingAmount } from '../utils/bookingPricing';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GUEST_KEY = 'pxc_guest_capabilities_v2';
const CACHE_KEY = 'customer-bookings';
const guestTokens = (): Record<string, string> => {
  try { return JSON.parse(sessionStorage.getItem(GUEST_KEY) || '{}'); } catch { return {}; }
};
export const getDeletedBookingIds = (): string[] => [];
export const markBookingAsPermanentlyDeleted = (_id: string) => {};
export const deduplicateBookings = (records: BookingRecord[]): BookingRecord[] =>
  [...new Map(records.filter(b => b.id).map(b => [b.id, b])).values()];
export const getStoredLocalBookings = (): BookingRecord[] => JSON.parse(privateStorage.getItem(CACHE_KEY) || '[]');
export const saveLocalBookingRecord = (booking: BookingRecord) => {
  privateStorage.setItem(CACHE_KEY, JSON.stringify(deduplicateBookings([booking, ...getStoredLocalBookings()])));
};
export const removeLocalBookingById = (id: string) => {
  privateStorage.setItem(CACHE_KEY, JSON.stringify(getStoredLocalBookings().filter(b => b.id !== id)));
};
const fail = (error: unknown) => { if (error) throw new Error('Unable to complete this request. Please check your access and try again.'); };
const changed = (id: string) => window.dispatchEvent(new CustomEvent('pxc-booking-updated', { detail: { bookingId: id } }));

export async function saveBookingToSupabase(booking: Omit<BookingRecord, 'id' | 'createdAt'>): Promise<string> {
  const version = privateDataVersion();
  // A guest capability is random, scoped to one record, expires server-side,
  // and is never put in a URL. Its hash alone is stored in a private schema.
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
  const { data, error } = await supabase.rpc('submit_booking', {
    p_booking: {
      customer_name: booking.customerName, customer_email: booking.customerEmail,
      customer_phone: booking.customerPhone, service_type: booking.serviceType,
      property_type: booking.propertyType, address: booking.address,
      preferred_date: booking.preferredDate, preferred_time_slot: booking.preferredTimeSlot,
      estimated_price_cad: calculateBookingAmount(booking.serviceType, booking.propertyType, booking.estimatedPriceCAD),
      additional_notes: booking.additionalNotes,
    }, p_guest_token: token,
  });
  fail(error);
  assertPrivateDataVersion(version);
  if (typeof data !== 'string' || !UUID.test(data)) throw new Error('Booking confirmation was not received.');
  const tokens = guestTokens(); tokens[data] = token;
  try { sessionStorage.setItem(GUEST_KEY, JSON.stringify(tokens)); } catch { /* Signed-in ownership remains available. */ }
  // Only display the server-confirmed record, never fabricate a successful save.
  try {
    const record = await getBookingByIdFromSupabase(data);
    if (record) saveLocalBookingRecord(record);
  } catch { /* The write is confirmed. Record retrieval can be retried independently. */ }
  assertPrivateDataVersion(version);
  return data;
}

export async function getUserBookingsFromSupabase(_userId: string, _email?: string): Promise<BookingRecord[]> {
  const version = privateDataVersion();
  const user = await requireUser(supabase);
  const claim = await supabase.rpc('claim_guest_bookings'); fail(claim.error);
  const { data, error } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  fail(error);
  assertPrivateDataVersion(version);
  const rows = (data || []).map(mapRowToBookingRecord);
  privateStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  return rows;
}
export async function getAllBookingsFromSupabase(): Promise<BookingRecord[]> {
  const version = privateDataVersion();
  await requireAdmin(adminSupabase);
  const { data, error } = await adminSupabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(1000);
  fail(error); assertPrivateDataVersion(version); return (data || []).map(mapRowToBookingRecord);
}
export async function getBookingByIdFromSupabase(id: string): Promise<BookingRecord | null> {
  const version = privateDataVersion();
  if (!UUID.test(id)) return null;
  const { data: session } = await supabase.auth.getSession();
  if (session.session) {
    const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
    fail(error);
    assertPrivateDataVersion(version);
    if (data) { const record = mapRowToBookingRecord(data); saveLocalBookingRecord(record); return record; }
  }
  const token = guestTokens()[id];
  if (!token) return null;
  const { data, error } = await supabase.rpc('get_guest_booking', { p_id: id, p_token: token });
  fail(error);
  assertPrivateDataVersion(version);
  if (!data) { removeLocalBookingById(id); return null; }
  const record = mapRowToBookingRecord(data); saveLocalBookingRecord(record); return record;
}
export async function syncConsumerBookings(ids: string[], _email?: string): Promise<BookingRecord[]> {
  const version = privateDataVersion();
  const { data } = await supabase.auth.getSession();
  if (data.session) return getUserBookingsFromSupabase(data.session.user.id);
  const records = await Promise.all([...new Set([...ids, ...Object.keys(guestTokens())])].map(getBookingByIdFromSupabase));
  assertPrivateDataVersion(version);
  const rows = records.filter((b): b is BookingRecord => Boolean(b));
  privateStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  return rows;
}
export async function findBookingsByQuery(search: string): Promise<BookingRecord[]> {
  const query = search.trim().toLowerCase();
  if (!query) return [];
  // Search is limited to records already authorized by RLS or guest capability.
  // User input is never interpolated into PostgREST filter expressions.
  const rows = await syncConsumerBookings([]);
  return rows.filter(b => [b.id, b.customerEmail, b.customerPhone, b.customerName].some(value => value?.toLowerCase().includes(query)));
}
export async function updateBookingDetailsInSupabase(id: string, updates: Partial<BookingRecord>): Promise<void> {
  await requireAdmin(adminSupabase);
  const payload: Record<string, unknown> = {};
  const keys = { status: 'status', preferredDate: 'preferred_date', preferredTimeSlot: 'preferred_time_slot', estimatedPriceCAD: 'estimated_price_cad', additionalNotes: 'additional_notes' };
  for (const [key, column] of Object.entries(keys)) if (updates[key] !== undefined) payload[column] = updates[key];
  const { data, error } = await adminSupabase.from('bookings').update(payload).eq('id', id).select('id').single();
  fail(error); if (!data) throw new Error('Booking was not updated.');
  removeLocalBookingById(id); changed(id);
}
export async function updateBookingStatusInSupabase(id: string, status: BookingStatus): Promise<void> {
  const { data } = await adminSupabase.auth.getSession();
  if (data.session) return updateBookingDetailsInSupabase(id, { status });
  if (status !== 'cancelled') throw new Error('Only an administrator can change this booking status.');
  const result = await supabase.rpc('cancel_booking', { p_id: id, p_token: guestTokens()[id] || null });
  fail(result.error); if (result.data !== true) throw new Error('Booking cannot be cancelled.');
  removeLocalBookingById(id); changed(id);
}
export async function deleteBookingFromSupabase(id: string): Promise<void> {
  await requireAdmin(adminSupabase);
  const { data, error } = await adminSupabase.from('bookings').delete().eq('id', id).select('id').single();
  fail(error); if (!data) throw new Error('Booking was not deleted.');
  removeLocalBookingById(id);
  window.dispatchEvent(new CustomEvent('pxc-booking-deleted', { detail: { bookingId: id } }));
}
export async function saveReviewToSupabase(review: Omit<ReviewRecord, 'id' | 'createdAt'>): Promise<string> {
  await requireUser(supabase);
  const { data, error } = await supabase.rpc('submit_review', { p_review: { author_name: review.authorName, rating: review.rating, service: review.service, neighborhood: review.neighborhood, comment: review.comment } });
  fail(error); if (!data) throw new Error('Review was not saved.'); return String(data);
}
export async function getReviewsFromSupabase(): Promise<ReviewRecord[]> {
  const { data, error } = await supabase.from('reviews').select('id,author_name,rating,service,neighborhood,comment,verified,created_at').order('created_at', { ascending: false });
  fail(error);
  return (data || []).map(r => ({ id: r.id, authorName: r.author_name, rating: r.rating, service: r.service, neighborhood: r.neighborhood, comment: r.comment, verified: r.verified, createdAt: r.created_at }));
}
function mapRowToBookingRecord(row: any): BookingRecord {
  return {
    id: String(row.id), userId: row.user_id || undefined, customerName: row.customer_name,
    customerEmail: row.customer_email, customerPhone: row.customer_phone, serviceType: row.service_type,
    propertyType: row.property_type, address: row.address, preferredDate: row.preferred_date,
    preferredTimeSlot: row.preferred_time_slot, estimatedPriceCAD: Number(row.estimated_price_cad) || undefined,
    additionalNotes: row.additional_notes, status: row.status, createdAt: row.created_at,
    approvedAt: row.approved_at, approvedBy: row.approved_by, consumerConfirmationSent: row.consumer_confirmation_sent,
  };
}
