import { supabase } from '../lib/supabase';
import { BookingRecord, BookingStatus, ReviewRecord } from '../types';
import { deleteNotificationByBookingId } from './notificationService';
import { calculateBookingAmount } from '../utils/bookingPricing';

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
 * Deduplicate booking records to guarantee every booking appears strictly once.
 * Handles duplicate records caused by dual-backends (Supabase + Firestore)
 * or local storage cache discrepancies.
 */
export const deduplicateBookings = (records: BookingRecord[]): BookingRecord[] => {
  if (!records || !Array.isArray(records)) return [];

  const result: BookingRecord[] = [];

  for (const b of records) {
    if (!b) continue;
    const bId = (b.id || '').trim();

    // 1. Exact ID match (case-insensitive)
    const existingByIdIndex = result.findIndex(
      (r) => r.id && bId && r.id.toLowerCase() === bId.toLowerCase()
    );
    if (existingByIdIndex !== -1) {
      const existing = result[existingByIdIndex];
      const isBetter =
        (b.status === 'approved' || b.status === 'confirmed') &&
        existing.status !== 'approved' &&
        existing.status !== 'confirmed';
      if (isBetter || (!existing.estimatedPriceCAD && b.estimatedPriceCAD)) {
        result[existingByIdIndex] = { ...existing, ...b };
      }
      continue;
    }

    // 2. Content fingerprint match:
    // Same customer email (or phone), same service type, and either same preferred date or created within 1 hour
    const existingFingerprintIndex = result.findIndex((r) => {
      const emailA = (r.customerEmail || '').trim().toLowerCase();
      const emailB = (b.customerEmail || '').trim().toLowerCase();
      const sameEmail = emailA && emailB && emailA === emailB;

      const phoneA = (r.customerPhone || '').replace(/\D/g, '');
      const phoneB = (b.customerPhone || '').replace(/\D/g, '');
      const samePhone =
        phoneA && phoneB && phoneA.length >= 7 && (phoneA === phoneB || phoneA.endsWith(phoneB) || phoneB.endsWith(phoneA));

      if (!sameEmail && !samePhone) return false;

      const serviceA = (r.serviceType || '').trim().toLowerCase();
      const serviceB = (b.serviceType || '').trim().toLowerCase();
      const sameService =
        serviceA === serviceB ||
        serviceA.includes(serviceB) ||
        serviceB.includes(serviceA);

      if (!sameService) return false;

      const dateA = (r.preferredDate || '').trim();
      const dateB = (b.preferredDate || '').trim();
      const sameDate = Boolean(dateA && dateB && dateA === dateB);

      const timeA = new Date(r.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      const closeInTime = !isNaN(timeA) && !isNaN(timeB) && Math.abs(timeA - timeB) < 1000 * 60 * 90; // within 90 minutes

      return sameDate || closeInTime;
    });

    if (existingFingerprintIndex !== -1) {
      const existing = result[existingFingerprintIndex];
      const bHasOfficialId = bId && !bId.startsWith('sb_bk_');
      const existingHasOfficialId = existing.id && !existing.id.startsWith('sb_bk_');
      const bIsApproved = b.status === 'approved' || b.status === 'confirmed';

      if (bIsApproved || (bHasOfficialId && !existingHasOfficialId)) {
        result[existingFingerprintIndex] = {
          ...existing,
          ...b,
          id: bHasOfficialId ? b.id : existing.id,
        };
      } else {
        result[existingFingerprintIndex] = {
          ...b,
          ...existing,
          id: existingHasOfficialId ? existing.id : (b.id || existing.id),
        };
      }
      continue;
    }

    result.push(b);
  }

  return result;
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

// Remove a specific local booking ID (e.g. temporary sb_bk_ record after database confirmation)
export const removeLocalBookingById = (bookingId: string) => {
  if (!bookingId) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    const existing: BookingRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((b) => b.id !== bookingId);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not remove booking from local storage:', e);
  }
};

// Helper to get local bookings backup with automatic deduplication
export const getStoredLocalBookings = (): BookingRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    const parsed: BookingRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = filterOutDeletedBookings(parsed);
    const deduped = deduplicateBookings(filtered);
    if (deduped.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(deduped));
    }
    return deduped;
  } catch {
    return [];
  }
};

// Helper to save local bookings backup with deduplication
export const saveLocalBookingRecord = (booking: BookingRecord) => {
  try {
    const existing = getStoredLocalBookings();
    // Remove if same ID
    const filtered = existing.filter((b) => b.id !== booking.id);
    const updated = deduplicateBookings([booking, ...filtered]);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
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
  const localId = 'PXC-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();
  const normalizedEmail = (booking.customerEmail || '').trim().toLowerCase();
  const amount = calculateBookingAmount(
    booking.serviceType,
    booking.propertyType,
    booking.estimatedPriceCAD
  );

  const newBookingRecord: BookingRecord = {
    ...booking,
    customerEmail: normalizedEmail,
    estimatedPriceCAD: amount,
    id: localId,
    createdAt: now,
  };

  // Payload with snake_case (standard Supabase / Postgres convention)
  const snakePayload: Record<string, any> = {
    customer_name: booking.customerName,
    customer_email: normalizedEmail,
    customer_phone: booking.customerPhone,
    service_type: booking.serviceType,
    property_type: booking.propertyType,
    address: booking.address,
    preferred_date: booking.preferredDate,
    preferred_time_slot: booking.preferredTimeSlot || null,
    estimated_price_cad: amount,
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
    customerEmail: normalizedEmail,
    customerPhone: booking.customerPhone,
    serviceType: booking.serviceType,
    propertyType: booking.propertyType,
    address: booking.address,
    preferredDate: booking.preferredDate,
    preferredTimeSlot: booking.preferredTimeSlot || null,
    estimatedPriceCAD: amount,
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

  // Fallback: save single local record with clean reference ID so booking is never lost
  saveLocalBookingRecord(newBookingRecord);
  return localId;
};

/**
 * Fetch bookings strictly connected to a specific user/Gmail from Supabase (and local backup)
 */
export const getUserBookingsFromSupabase = async (
  userId: string,
  userEmail?: string
): Promise<BookingRecord[]> => {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const cleanUserId = (userId || '').trim();

  // If no user context, return empty
  if (!cleanEmail && !cleanUserId) {
    return [];
  }

  const localBookings = getStoredLocalBookings().filter(
    (b) =>
      (cleanUserId && b.userId === cleanUserId) ||
      (cleanEmail && b.customerEmail?.trim().toLowerCase() === cleanEmail)
  );

  const supabaseBookings: BookingRecord[] = [];
  const tableCandidates = ['bookings', 'booking'];

  for (const tableName of tableCandidates) {
    try {
      let query = supabase.from(tableName).select('*').order('created_at', { ascending: false });

      if (cleanEmail && cleanUserId) {
        query = query.or(`customer_email.ilike.${cleanEmail},user_id.eq.${cleanUserId}`);
      } else if (cleanEmail) {
        query = query.ilike('customer_email', cleanEmail);
      } else if (cleanUserId) {
        query = query.eq('user_id', cleanUserId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const mapped = mapRowToBookingRecord(row);
          if (
            (cleanEmail && mapped.customerEmail?.trim().toLowerCase() === cleanEmail) ||
            (cleanUserId && mapped.userId === cleanUserId)
          ) {
            supabaseBookings.push(mapped);
          }
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

  const validRecords = filterOutDeletedBookings(merged).filter(
    (b) =>
      (cleanEmail && b.customerEmail?.trim().toLowerCase() === cleanEmail) ||
      (cleanUserId && b.userId === cleanUserId)
  );

  return deduplicateBookings(validRecords).sort(
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

  return deduplicateBookings(validRecords).sort(
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

  // Sync any fetched Supabase records into local cache
  for (const r of supabaseResults) {
    saveLocalBookingRecord(r);
  }

  // Merge unique
  const merged = [...supabaseResults];
  for (const lb of locals) {
    if (!merged.some((m) => m.id === lb.id)) {
      merged.push(lb);
    }
  }

  const validRecords = filterOutDeletedBookings(merged);

  return deduplicateBookings(validRecords).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Fetch a single booking by ID directly from Supabase backend
 */
export const getBookingByIdFromSupabase = async (bookingId: string): Promise<BookingRecord | null> => {
  if (!bookingId) return null;
  const cleanId = bookingId.trim();
  const tableCandidates = ['bookings', 'booking'];

  for (const tableName of tableCandidates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (!error && data) {
        const record = mapRowToBookingRecord(data);
        saveLocalBookingRecord(record);
        return record;
      }
    } catch {
      // try next table
    }
  }

  // Also try case-insensitive or partial if exact match failed
  for (const tableName of tableCandidates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .ilike('id', `%${cleanId}%`)
        .limit(1);

      if (!error && Array.isArray(data) && data.length > 0) {
        const record = mapRowToBookingRecord(data[0]);
        saveLocalBookingRecord(record);
        return record;
      }
    } catch {}
  }

  return null;
};

/**
 * Synchronize bookings for the current consumer against Supabase
 * Updates local storage so any approved status is immediately available to the consumer.
 */
export const syncConsumerBookings = async (
  bookingIds: string[] = [],
  userEmail?: string
): Promise<BookingRecord[]> => {
  const syncedMap = new Map<string, BookingRecord>();
  const cleanEmail = (userEmail || '').trim().toLowerCase();

  // 1. If userEmail is provided, fetch all bookings for that email from Supabase
  if (cleanEmail) {
    try {
      const userRecords = await getUserBookingsFromSupabase('', cleanEmail);
      for (const r of userRecords) {
        if (r.id) {
          syncedMap.set(r.id, r);
          saveLocalBookingRecord(r);
        }
      }
    } catch (err) {
      console.debug('syncConsumerBookings userEmail notice:', err);
    }
  }

  // 2. For any specific bookingIds, fetch latest live record from Supabase
  for (const id of bookingIds) {
    if (!id || syncedMap.has(id)) continue;
    try {
      const fromSb = await getBookingByIdFromSupabase(id);
      if (fromSb && fromSb.id) {
        if (!cleanEmail || fromSb.customerEmail?.trim().toLowerCase() === cleanEmail) {
          syncedMap.set(fromSb.id, fromSb);
          saveLocalBookingRecord(fromSb);
        }
      }
    } catch (err) {
      console.debug('syncConsumerBookings bookingId notice:', err);
    }
  }

  // 3. Keep existing local bookings for any that couldn't be reached, strictly matching userEmail if present
  const locals = getStoredLocalBookings().filter((lb) => {
    if (!cleanEmail) return true;
    return lb.customerEmail?.trim().toLowerCase() === cleanEmail;
  });
  for (const lb of locals) {
    if (lb.id && !syncedMap.has(lb.id)) {
      syncedMap.set(lb.id, lb);
    }
  }

  const result = Array.from(syncedMap.values()).filter((b) => {
    if (!cleanEmail) return true;
    return b.customerEmail?.trim().toLowerCase() === cleanEmail;
  });

  return deduplicateBookings(filterOutDeletedBookings(result)).sort(
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
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(deduplicateBookings(updated)));

  const tableCandidates = ['bookings', 'booking'];
  for (const tableName of tableCandidates) {
    try {
      // snake_case updates
      const snakeUpdates: Record<string, any> = {};
      if (updates.status) snakeUpdates.status = updates.status;
      if (updates.preferredDate) snakeUpdates.preferred_date = updates.preferredDate;
      if (updates.preferredTimeSlot) snakeUpdates.preferred_time_slot = updates.preferredTimeSlot;
      if (updates.estimatedPriceCAD !== undefined) snakeUpdates.estimated_price_cad = updates.estimatedPriceCAD;
      if (updates.additionalNotes) snakeUpdates.additional_notes = updates.additionalNotes;
      if (updates.approvedAt) snakeUpdates.approved_at = updates.approvedAt;
      if (updates.approvedBy) snakeUpdates.approved_by = updates.approvedBy;

      await supabase.from(tableName).update(snakeUpdates).eq('id', bookingId);
      break;
    } catch {
      // try next
    }
  }

  // Also update Firestore if reachable
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    await updateDoc(doc(db, 'bookings', bookingId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch {}

  window.dispatchEvent(new CustomEvent('pxc-booking-updated', { detail: { bookingId } }));
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
  const serviceType = row.service_type || row.serviceType || 'Air Duct Cleaning';
  const propertyType = row.property_type || row.propertyType || 'Residential';
  const rawPrice = Number(row.estimated_price_cad ?? row.estimatedPriceCAD ?? row.amount ?? row.price);
  const estimatedPriceCAD = calculateBookingAmount(
    serviceType,
    propertyType,
    !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : undefined
  );

  return {
    id: String(row.id),
    userId: row.user_id || row.userId || undefined,
    customerName: row.customer_name || row.customerName || 'Customer',
    customerEmail: row.customer_email || row.customerEmail || '',
    customerPhone: row.customer_phone || row.customerPhone || '',
    serviceType,
    propertyType,
    address: row.address || '',
    preferredDate: row.preferred_date || row.preferredDate || '',
    preferredTimeSlot: row.preferred_time_slot || row.preferredTimeSlot || undefined,
    estimatedPriceCAD,
    additionalNotes: row.additional_notes || row.additionalNotes || undefined,
    status: (row.status as BookingStatus) || 'pending',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    approvedAt: row.approved_at || row.approvedAt || undefined,
    approvedBy: row.approved_by || row.approvedBy || undefined,
    consumerConfirmationSent: row.consumer_confirmation_sent || row.consumerConfirmationSent || false,
  };
}
