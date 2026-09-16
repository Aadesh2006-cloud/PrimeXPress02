import { privateStorage } from '../services/privateData';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Sparkles, X, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';
import { playNotificationChime } from '../services/notificationService';
import { BookingRecord } from '../types';

interface ApprovedBookingNotificationData {
  bookingId: string;
  serviceType?: string;
  customerName?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  timestamp: number;
}

const DISMISSED_STORAGE_KEY = 'pxc_dismissed_approved_notifications';

export const ConsumerApprovalNotifier: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState<ApprovedBookingNotificationData | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const getDismissedIds = (): string[] => {
    try {
      const stored = sessionStorage.getItem(DISMISSED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const markDismissed = (id: string) => {
    try {
      const dismissed = getDismissedIds();
      if (!dismissed.includes(id)) {
        dismissed.push(id);
        sessionStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(dismissed));
      }
    } catch {}
    setIsVisible(false);
  };

  const checkApprovedBooking = (data?: ApprovedBookingNotificationData | null) => {
    let candidate = data;

    if (!candidate) {
      try {
        const stored = privateStorage.getItem('pxc_consumer_latest_approved');
        if (stored) {
          candidate = JSON.parse(stored);
        }
      } catch {
        candidate = null;
      }
    }

    if (!candidate || !candidate.bookingId) {
      return;
    }

    // Do not show if dismissed in this session
    const dismissed = getDismissedIds();
    if (dismissed.includes(candidate.bookingId)) {
      return;
    }

    // Only show if approved recently (e.g. within 30 minutes)
    const thirtyMinutesMs = 30 * 60 * 1000;
    if (Date.now() - (candidate.timestamp || 0) > thirtyMinutesMs) {
      return;
    }

    // Don't show toast if user is already on the exact booking confirmation page
    if (location.pathname.includes(candidate.bookingId)) {
      return;
    }

    setNotification(candidate);
    setIsVisible(true);
  };

  useEffect(() => {
    checkApprovedBooking();

    const handleApprovedEvent = (e: any) => {
      const b: BookingRecord = e?.detail?.booking;
      if (b && b.id) {
        const payload: ApprovedBookingNotificationData = {
          bookingId: b.id,
          serviceType: b.serviceType,
          customerName: b.customerName,
          preferredDate: b.preferredDate,
          preferredTimeSlot: b.preferredTimeSlot,
          timestamp: Date.now(),
        };
        try {
          playNotificationChime();
        } catch {}
        checkApprovedBooking(payload);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'pxc_consumer_latest_approved' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          checkApprovedBooking(parsed);
        } catch {}
      }
    };

    window.addEventListener('pxc-booking-approved', handleApprovedEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('pxc-booking-approved', handleApprovedEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [location.pathname]);

  if (!isVisible || !notification) {
    return null;
  }

  return (
    <div
      id="consumer-approval-toast"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-4 sm:p-5 text-left animate-slideUp transition-all duration-300"
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Winnipeg Dispatch Approved</span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-[#063F4D]">
              Booking Approved & Scheduled!
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your appointment for{' '}
              <strong className="text-[#063F4D]">{notification.serviceType || 'Cleaning Service'}</strong>{' '}
              has been approved by Winnipeg Central Dispatch.
            </p>

            {notification.preferredDate && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Date: {notification.preferredDate} ({notification.preferredTimeSlot || 'Morning Window'})
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => markDismissed(notification.bookingId)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => markDismissed(notification.bookingId)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Dismiss
        </button>

        <button
          type="button"
          onClick={() => {
            markDismissed(notification.bookingId);
            navigate(`/booking-confirmation/${notification.bookingId}`);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>View Confirmed Booking</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
