import { privateStorage } from './privateData';
import { BookingRecord, AdminNotification } from '../types';
import { COMPANY_INFO } from '../data/cleaningData';
import { createMailto } from '../utils/mailto';

const NOTIFICATIONS_STORAGE_KEY = 'pxc_admin_notifications';
const MAIL_DISPATCH_LOG_KEY = 'pxc_mail_dispatch_logs';
export const MASTER_ADMIN_EMAIL = 'primexpress33@gmail.com';

export interface EmailDispatchLog {
  id: string;
  type: 'admin_new_booking_alert' | 'consumer_booking_confirmed';
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  bookingId: string;
  delivered: boolean;
}

/**
 * Play a gentle Web Audio API chime
 */
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    // Audio might be blocked by browser autoplay policy before user gesture
    console.debug('Notification audio notice:', err);
  }
};

/**
 * Fetch all admin notifications
 */
export const getAdminNotifications = (): AdminNotification[] => {
  try {
    const stored = privateStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Get count of unread admin notifications
 */
export const getUnreadNotificationCount = (): number => {
  const list = getAdminNotifications();
  return list.filter((n) => !n.read && n.status === 'pending').length;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = (notificationId: string): void => {
  const list = getAdminNotifications();
  const updated = list.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  privateStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('pxc-notifications-updated'));
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = (): void => {
  const list = getAdminNotifications();
  const updated = list.map((n) => ({ ...n, read: true }));
  privateStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('pxc-notifications-updated'));
};

/**
 * Delete a single notification
 */
export const deleteNotification = (notificationId: string): void => {
  const list = getAdminNotifications();
  const updated = list.filter((n) => n.id !== notificationId);
  privateStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('pxc-notifications-updated'));
};

/**
 * Permanently delete any notification matching a deleted booking ID
 */
export const deleteNotificationByBookingId = (bookingId: string): void => {
  const list = getAdminNotifications();
  const updated = list.filter((n) => n.bookingId !== bookingId);
  privateStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('pxc-notifications-updated'));
};

/**
 * Generate Admin Email Alert when a new booking request is created by consumer
 */
export const generateAdminBookingAlertEmail = (booking: BookingRecord) => {
  const subject = `🚨 NEW BOOKING REQUEST: ${booking.customerName} - ${booking.serviceType} (Ref: ${booking.id?.slice(0, 8)})`;
  const body = `PRIME X-PRESS DISPATCH — NEW BOOKING SUBMISSION
==================================================

A customer has requested a cleaning service on the website.
Action Required: Please log into your Admin Portal at the website footer to Approve or Decline this booking.

BOOKING DETAILS:
- Reference ID: ${booking.id}
- Customer Name: ${booking.customerName}
- Customer Phone: ${booking.customerPhone}
- Customer Email: ${booking.customerEmail || 'Not Provided'}
- Service Requested: ${booking.serviceType}
- Property Type: ${booking.propertyType || 'Residential'}
- Service Address: ${booking.address || 'Winnipeg, MB (To be confirmed)'}
- Requested Date: ${booking.preferredDate || 'Earliest Available'}
- Requested Time Window: ${booking.preferredTimeSlot || 'Standard'}
- Special Instructions / Notes: ${booking.additionalNotes || 'None'}
- Submission Time: ${new Date(booking.createdAt).toLocaleString()}

CURRENT STATUS: PENDING ADMIN APPROVAL
* Note: The customer has been informed that their booking is NOT confirmed until you approve it in the Admin Portal.

To approve:
1. Scroll down to the website footer.
2. Click 'Admin Login'.
3. Click 'Approve & Confirm' next to this booking.

Prime X-Press Cleaning Inc. Dispatch Center
Winnipeg, Manitoba | ${COMPANY_INFO.primaryPhone}`;

  const mailtoUrl = createMailto(MASTER_ADMIN_EMAIL, subject, body);

  return {
    to: MASTER_ADMIN_EMAIL,
    subject,
    body,
    mailtoUrl,
  };
};

/**
 * Generate Consumer Official Confirmation Email when Admin Approves
 */
export const generateConsumerConfirmationEmail = (booking: BookingRecord) => {
  const recipient = booking.customerEmail || '';
  const refShort = booking.id ? booking.id.slice(0, 8) : 'CONFIRMED';
  const subject = `Booking Confirmed: Prime X-Press Cleaning Winnipeg (Ref: #${refShort})`;

  const body = `Dear ${booking.customerName || 'Valued Customer'},

Great news! Your booking with Prime X-Press Cleaning Inc. has been reviewed and officially APPROVED by our dispatch administrator.

CONFIRMED APPOINTMENT DETAILS:
----------------------------------------------
- Booking Reference: ${booking.id}
- Service: ${booking.serviceType}
- Property Type: ${booking.propertyType || 'Residential'}
- Scheduled Date: ${booking.preferredDate || 'Confirmed'}
- Arrival Time Window: ${booking.preferredTimeSlot || 'Standard Dispatch'}
- Service Address: ${booking.address || 'Winnipeg, MB'}
- Approval Status: Officially Confirmed by Dispatch

WHAT TO EXPECT ON YOUR SERVICE DAY:
1. Certified Technicians: Our trained, insured cleaning technicians will arrive in a Prime X-Press service vehicle during your scheduled time window.
2. Professional Equipment: We bring specialized commercial truck-mounted extraction units and hospital-grade sanitization tools.
3. Transparent Standards: Canadian CAD rates with no surprise hidden fees.

NEED TO MAKE CHANGES OR CONTACT DISPATCH?
If you have any questions, gate access codes, or need to reschedule, please contact us:
- Phone: ${COMPANY_INFO.primaryPhone} (Direct Dispatch)
- Secondary: ${COMPANY_INFO.secondaryPhone}
- Email: ${MASTER_ADMIN_EMAIL}
- Location: ${COMPANY_INFO.location}

Thank you for choosing Prime X-Press Cleaning Inc.!
Fresher • Cleaner • Healthier
https://primexpresscleaning.ca`;

  const mailtoUrl = createMailto(recipient, subject, body);

  return {
    to: recipient,
    subject,
    body,
    mailtoUrl,
  };
};

/**
 * Log mail dispatch history
 */
const logMailDispatch = (log: Omit<EmailDispatchLog, 'id' | 'timestamp'>) => {
  try {
    const stored = privateStorage.getItem(MAIL_DISPATCH_LOG_KEY);
    const list: EmailDispatchLog[] = stored ? JSON.parse(stored) : [];
    const newEntry: EmailDispatchLog = {
      ...log,
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEntry);
    privateStorage.setItem(MAIL_DISPATCH_LOG_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.error('Error logging mail dispatch:', err);
  }
};

/**
 * Trigger notification when a customer submits a booking:
 * 1. Logs notification to Admin Portal
 * 2. Prepares an email draft to primexpress33@gmail.com
 * 3. Triggers notification event for active admin listeners
 */
export const dispatchNewBookingNotification = (booking: BookingRecord): void => {
  try {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newNotif: AdminNotification = {
      id: notifId,
      bookingId: booking.id || `temp_${Date.now()}`,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      serviceType: booking.serviceType,
      propertyType: String(booking.propertyType || 'Residential'),
      address: booking.address,
      preferredDate: booking.preferredDate,
      preferredTimeSlot: booking.preferredTimeSlot,
      createdAt: booking.createdAt || new Date().toISOString(),
      read: false,
      status: 'pending',
    };

    const currentList = getAdminNotifications();
    // Avoid duplicate for same booking
    const filtered = currentList.filter((n) => n.bookingId !== booking.id);
    filtered.unshift(newNotif);
    privateStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered.slice(0, 100)));

    // Generate & log email alert for admin
    const emailData = generateAdminBookingAlertEmail(booking);
    logMailDispatch({
      type: 'admin_new_booking_alert',
      recipient: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      bookingId: booking.id || '',
      delivered: false,
    });

    // Play chime sound
    playNotificationChime();

    // Dispatch custom event so any open Admin Modal updates immediately
    window.dispatchEvent(
      new CustomEvent('pxc-new-booking-notification', { detail: { booking, notification: newNotif } })
    );
    window.dispatchEvent(new CustomEvent('pxc-notifications-updated'));
  } catch (err) {
    console.error('Error dispatching new booking notification:', err);
  }
};

/**
 * Handle Admin Approval of a Booking:
 * Sets approval metadata and generates/logs consumer confirmation email
 */
export const processAdminBookingApproval = (
  booking: BookingRecord,
  adminEmail: string = MASTER_ADMIN_EMAIL
): { emailDetails: ReturnType<typeof generateConsumerConfirmationEmail> } => {
  // Update the notification record if present
  const list = getAdminNotifications();
  const updatedList = list.map((n) =>
    n.bookingId === booking.id
      ? { ...n, status: 'approved' as const, read: true, approvedAt: new Date().toISOString() }
      : n
  );
  privateStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedList));

  // Generate confirmation email for the consumer
  const emailDetails = generateConsumerConfirmationEmail(booking);

  // Log consumer confirmation mail dispatch
  logMailDispatch({
    type: 'consumer_booking_confirmed',
    recipient: emailDetails.to || 'phone_dispatch',
    subject: emailDetails.subject,
    body: emailDetails.body,
    bookingId: booking.id || '',
    delivered: false,
  });

  window.dispatchEvent(new CustomEvent('pxc-notifications-updated'));

  return { emailDetails };
};

/**
 * Get recent mail dispatch logs
 */
export const getMailDispatchLogs = (): EmailDispatchLog[] => {
  try {
    const stored = privateStorage.getItem(MAIL_DISPATCH_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
