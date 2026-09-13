import { supabase } from '../lib/supabase';
import { BookingRecord, BookingStatus, ReviewRecord } from '../types';
import { deleteNotificationByBookingId } from './notificationService';

const STORAGE_KEY_BOOKINGS = 'pxc_local_bookings';
const STORAGE_KEY_REVIEWS = 'pxc_local_reviews';
const STORAGE_KEY_DELETED = 'pxc_deleted_booking_ids';

/**
 * Retrieve the persistent list of deleted booking IDs (tombstones)
 * to guarantee that deleted bookings never reappear even if backend caches return them.
 */
export const getDeletedBookingIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Record a booking ID as permanently deleted
 */
export const markBookingAsPermanentlyDeleted = (bookingId: string): void => {
  if (!bookingId) return;
  try {
    const existing = getDeletedBookingIds();
    if (!existing.includes(bookingId)) {
      const updated = [...existing, bookingId];
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Could not save deleted booking ID:', e);
  }
};

/**
 * Filter out any bookings that have been deleted
 */
const filterOutDeletedBookings = (records: BookingRecord[]): BookingRecord[] => {
  const deletedIds = new Set(getDeletedBookingIds());
  return records.filter((b) => {
    if (!b || !b.id) return false;
    if (deletedIds.has(b.id)) return false;
    if (b.status === 'deleted' || (b as any).isDeleted) return false;
    if (b.customerName && b.customerName.includes('[DELETED]')) return false;
    return true;
  });
};

// Helper to get local bookings backup
export const getStoredLocalBookings = (): BookingRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    const parsed: BookingRecord[] = raw ? JSON.parse(raw) : [];
    return filterOutDeletedBookings(parsed);
  } catch {
    return [];
  }
};

// Helper to save local bookings backup
export const saveLocalBookingRecord = (booking: BookingRecord) => {
  try {
    const existing = getStoredLocalBookings();
    const filtered = existing.filter((b) => b.id !== booking.id);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify([booking, ...filtered]));
  } catch (e) {
    console.warn('Could not save booking to local storage:', e);
  }
};

/**
 * Save booking into Supabase backend
 * Supports standard snake_case and camelCase column definitions, and both 'bookings' / 'booking' table names.
 */
export const saveBookingToSupabase = async (
  booking: Omit<BookingRecord, 'id' | 'createdAt'>
): Promise<string> => {
  const localId = 'sb_bk_' + Date.now().toString(36);
  const now = new Date().toISOString();
  const newBookingRecord: BookingRecord = {
    ...booking,
    id: localId,
    createdAt: now,
  };

  // Keep local backup for instant client portal availability
  saveLocalBookingRecord(newBookingRecord);

  // Payload with snake_case (standard Supabase / Postgres convention)
  const snakePayload: Record<string, any> = {
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    customer_phone: booking.customerPhone,
    service_type: booking.serviceType,
    property_type: booking.propertyType,
    address: booking.address,
    preferred_date: booking.preferredDate,
    preferred_time_slot: booking.preferredTimeSlot || null,
    additional_notes: booking.additionalNotes || null,
    status: booking.status || 'pending',
    created_at: now,
  };
  if (booking.userId) {
    snakePayload.user_id = booking.userId;
  }

  // Payload with camelCase (alternative convention)
  const camelPayload: Record<string, any> = {
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    serviceType: booking.serviceType,
    propertyType: booking.propertyType,
    address: booking.address,
    preferredDate: booking.preferredDate,
    preferredTimeSlot: booking.preferredTimeSlot || null,
    additionalNotes: booking.additionalNotes || null,
    status: booking.status || 'pending',
    createdAt: now,
  };
  if (booking.userId) {
    camelPayload.userId = booking.userId;
  }

  const tableCandidates = ['bookings', 'booking'];

  for (const tableName of tableCandidates) {
    try {
      // 1. Try snake_case insert
      const { data, error } = await supabase
        .from(tableName)
        .insert([snakePayload])
        .select('id')
        .single();

      if (!error && data?.id) {
        const savedId = String(data.id);
        saveLocalBookingRecord({ ...newBookingRecord, id: savedId });
        console.log(`Successfully saved booking to Supabase '${tableName}' with ID:`, savedId);
        return savedId;
      }

      // If error indicates column not found, try camelCase insert
      if (error && (error.code === '42703' || error.message?.includes('column'))) {
        const { data: camelData, error: camelError } = await supabase
          .from(tableName)
          .insert([camelPayload])
          .select('id')
          .single();

        if (!camelError && camelData?.id) {
          const savedId = String(camelData.id);
          saveLocalBookingRecord({ ...newBookingRecord, id: savedId });
          console.log(`Successfully saved booking to Supabase '${tableName}' (camelCase) with ID:`, savedId);
          return savedId;
        }
      }

      // If error is table not found, continue to next table candidate
      if (error && error.code === 'PGRST205') {
        continue;
      }

      if (error) {
        console.warn(`Supabase insert to '${tableName}' notice:`, error.message);
      }
    } catch (err) {
      console.warn(`Exception during Supabase save to '${tableName}':`, err);
    }
  }

  // If table is not yet created in Supabase dashboard, return local ID so booking is never lost
  console.info('Saved booking with local ID. To sync to Supabase, ensure the "bookings" table is created in Supabase SQL editor.');
  return localId;
};

/**
 * Fetch bookings for a specific user from Supabase (and local backup)
 */
export const getUserBookingsFromSupabase = async (
  userId: string,
  userEmail?: string
): Promise<BookingRecord[]> => {
  const localBookings = getStoredLocalBookings().filter(
    (b) =>
      (userId && b.userId === userId) ||
      (userEmail && b.customerEmail?.toLowerCase() === userEmail.toLowerCase())
  );

  const supabaseBookings: BookingRecord[] = [];
  const tableCandidates = ['bookings', 'booking'];

  for (const tableName of tableCandidates) {
    try {
      let query = supabase.from(tableName).select('*').order('created_at', { ascending: false });

      if (userEmail && userId) {
        query = query.or(`customer_email.eq.${userEmail},user_id.eq.${userId}`);
      } else if (userEmail) {
        query = query.eq('customer_email', userEmail);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          supabaseBookings.push(mapRowToBookingRecord(row));
        }
        break; // found and fetched from this table
      }
    } catch {
      // ignore and continue
    }
  }

  // Merge unique records and filter out any deleted bookings
  const merged = [...supabaseBookings];
  for (const lb of localBookings) {
    if (!merged.some((m) => m.id === lb.id)) {
      merged.push(lb);
    }
  }

  const validRecords = filterOutDeletedBookings(merged);

  return validRecords.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Fetch all bookings (Admin view)
 */
export const getAllBookingsFromSupabase = async (): Promise<BookingRecord[]> => {
  const localBookings = getStoredLocalBookings();
  const supabaseBookings: BookingRecord[] = [];
  const tableCandidates = ['bookings', 'booking'];

  for (const tableName of tableCandidates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          supabaseBookings.push(mapRowToBookingRecord(row));
        }
        break;
      }
    } catch {
      // continue
    }
  }

  const merged = [...supabaseBookings];
  for (const lb of localBookings) {
    if (!merged.some((m) => m.id === lb.id)) {
      merged.push(lb);
    }
  }

  const validRecords = filterOutDeletedBookings(merged);

  return validRecords.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Search and check booking by Reference ID, Phone number, or Customer Email
 */
export const findBookingsByQuery = async (searchQuery: string): Promise<BookingRecord[]> => {
  const qClean = searchQuery.trim().toLowerCase();
  if (!qClean) return [];

  // 1. Search in local storage
  const locals = getStoredLocalBookings().filter((b) => {
    const idMatch = b.id?.toLowerCase().includes(qClean);
    const emailMatch = b.customerEmail?.toLowerCase().includes(qClean);
    const phoneClean = b.customerPhone?.replace(/\D/g, '') || '';
    const searchDigits = qClean.replace(/\D/g, '');
    const phoneMatch = (searchDigits.length >= 4 && phoneClean.includes(searchDigits)) || b.customerPhone?.toLowerCase().includes(qClean);
    const nameMatch = b.customerName?.toLowerCase().includes(qClean);
    return idMatch || emailMatch || phoneMatch || nameMatch;
  });

  // 2. Search in Supabase backend
  const supabaseResults: BookingRecord[] = [];
  const tableCandidates = ['bookings', 'booking'];

  for (const tableName of tableCandidates) {
    try {
      // Try ID match
      if (qClean.length >= 6) {
        const { data: idData } = await supabase.from(tableName).select('*').eq('id', qClean).limit(5);
        if (Array.isArray(idData) && idData.length > 0) {
          for (const r of idData) supabaseResults.push(mapRowToBookingRecord(r));
        }
      }

      // Try email match
      if (qClean.includes('@')) {
        const { data: emailData } = await supabase.from(tableName).select('*').ilike('customer_email', `%${qClean}%`).limit(10);
        if (Array.isArray(emailData) && emailData.length > 0) {
          for (const r of emailData) supabaseResults.push(mapRowToBookingRecord(r));
        }
      }

      // Try phone match
      const phoneDigits = qClean.replace(/\D/g, '');
      if (phoneDigits.length >= 7) {
        const { data: phoneData } = await supabase.from(tableName).select('*').ilike('customer_phone', `%${phoneDigits}%`).limit(10);
        if (Array.isArray(phoneData) && phoneData.length > 0) {
          for (const r of phoneData) supabaseResults.push(mapRowToBookingRecord(r));
        }
      }

      // General fallback if no matches yet
      if (supabaseResults.length === 0) {
        const { data: genData } = await supabase
          .from(tableName)
          .select('*')
          .or(`customer_email.ilike.%${qClean}%,customer_name.ilike.%${qClean}%`)
          .limit(10);
        if (Array.isArray(genData) && genData.length > 0) {
          for (const r of genData) supabaseResults.push(mapRowToBookingRecord(r));
        }
      }

      if (supabaseResults.length > 0) break;
    } catch {
      // ignore and try next
    }
  }

  // Merge unique
  const merged = [...supabaseResults];
  for (const lb of locals) {
    if (!merged.some((m) => m.id === lb.id)) {
      merged.push(lb);
    }
  }

  const validRecords = filterOutDeletedBookings(merged);

  return validRecords.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Update booking status in Supabase
 */
export const updateBookingStatusInSupabase = async (
  bookingId: string,
  status: BookingStatus
): Promise<void> => {
  return updateBookingDetailsInSupabase(bookingId, { status });
};

/**
 * Update arbitrary booking fields in Supabase & local storage
 */
export const updateBookingDetailsInSupabase = async (
  bookingId: string,
  updates: Partial<BookingRecord>
): Promise<void> => {
  // Update local storage copy immediately
  const locals = getStoredLocalBookings();
  const updated = locals.map((b) => (b.id === bookingId ? { ...b, ...updates } : b));
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));

  const tableCandidates = ['bookings', 'booking'];
  for (const tableName of tableCandidates) {
    try {
      // Primary column to update is status
      if (updates.status) {
        const { error: statusErr } = await supabase
          .from(tableName)
          .update({ status: updates.status })
          .eq('id', bookingId);

        if (statusErr) {
          console.warn(`Supabase status update error on table '${tableName}':`, statusErr.message);
        } else {
          console.log(`Supabase booking '${bookingId}' status successfully updated to '${updates.status}' in '${tableName}'`);
        }
      }

      // If additional notes updated
      if (updates.additionalNotes !== undefined) {
        try {
          await supabase.from(tableName).update({ additional_notes: updates.additionalNotes }).eq('id', bookingId);
        } catch {}
      }
    } catch (err) {
      console.warn(`Exception during Supabase update for table '${tableName}':`, err);
    }
  }
};

/**
 * Delete booking permanently from Supabase, Firestore, and local storage.
 * Ensures the deleted booking will NEVER come back across any view or refresh.
 */
export const deleteBookingFromSupabase = async (bookingId: string): Promise<void> => {
  if (!bookingId) return;

  // 1. Mark in persistent deleted set (tombstone) so it can NEVER return in any query
  markBookingAsPermanentlyDeleted(bookingId);

  // 2. Remove from local storage
  const locals = getStoredLocalBookings();
  const updated = locals.filter((b) => b.id !== bookingId);
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));

  // 3. Remove from notifications
  try {
    deleteNotificationByBookingId(bookingId);
  } catch (err) {
    console.debug('Notification removal notice:', err);
  }

  // 4. In Supabase: update status to 'deleted' and also trigger delete
  const tableCandidates = ['bookings', 'booking'];
  for (const tableName of tableCandidates) {
    try {
      // Mark as deleted status first (in case RLS blocks row deletion for anon)
      await supabase
        .from(tableName)
        .update({ status: 'deleted', additional_notes: '[DELETED]' })
        .eq('id', bookingId);

      // Attempt hard deletion
      await supabase.from(tableName).delete().eq('id', bookingId);
    } catch {
      // ignore
    }
  }

  // 5. Also delete from Firestore if present
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (fsErr) {
    console.debug('Firestore delete notice:', fsErr);
  }

  // 6. Broadcast event so open tabs and modals re-render immediately
  window.dispatchEvent(new CustomEvent('pxc-booking-deleted', { detail: { bookingId } }));
  window.dispatchEvent(new CustomEvent('pxc-notifications-updated'));
};

/**
 * Save review into Supabase
 */
export const saveReviewToSupabase = async (
  review: Omit<ReviewRecord, 'id' | 'createdAt'>
): Promise<string> => {
  const localId = 'review_' + Date.now().toString(36);
  const now = new Date().toISOString();
  const newReview: ReviewRecord = {
    ...review,
    id: localId,
    createdAt: now,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify([newReview, ...existing]));
  } catch (e) {
    console.warn('Could not save review locally:', e);
  }

  try {
    const { data } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: review.userId || null,
          author_name: review.authorName,
          rating: review.rating,
          service: review.service,
          neighborhood: review.neighborhood,
          comment: review.comment,
          verified: review.verified ?? true,
          created_at: now,
        },
      ])
      .select('id')
      .single();

    if (data?.id) return String(data.id);
  } catch (err) {
    console.warn('Supabase review insert notice:', err);
  }

  return localId;
};

/**
 * Fetch reviews
 */
export const getReviewsFromSupabase = async (): Promise<ReviewRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((r: any) => ({
        id: String(r.id),
        userId: r.user_id || r.userId,
        authorName: r.author_name || r.authorName || 'Winnipeg Resident',
        rating: Number(r.rating) || 5,
        service: r.service || 'Air Duct Cleaning',
        neighborhood: r.neighborhood || 'Winnipeg, MB',
        comment: r.comment || '',
        verified: r.verified ?? true,
        createdAt: r.created_at || r.createdAt || new Date().toISOString(),
      }));
    }
  } catch {
    // fallback
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Map raw database row (snake_case or camelCase) to standard BookingRecord
 */
function mapRowToBookingRecord(row: any): BookingRecord {
  return {
    id: String(row.id),
    userId: row.user_id || row.userId || undefined,
    customerName: row.customer_name || row.customerName || 'Customer',
    customerEmail: row.customer_email || row.customerEmail || '',
    customerPhone: row.customer_phone || row.customerPhone || '',
    serviceType: row.service_type || row.serviceType || 'Air Duct Cleaning',
    propertyType: row.property_type || row.propertyType || 'Residential',
    address: row.address || '',
    preferredDate: row.preferred_date || row.preferredDate || '',
    preferredTimeSlot: row.preferred_time_slot || row.preferredTimeSlot || undefined,
    additionalNotes: row.additional_notes || row.additionalNotes || undefined,
    status: (row.status as BookingStatus) || 'pending',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}
