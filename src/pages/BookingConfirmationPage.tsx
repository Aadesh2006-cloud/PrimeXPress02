import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Printer,
  CalendarPlus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Search,
  RefreshCw,
  Home,
  FileCheck2,
  Truck,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { getBookingById, findBookingsByQuery, getStoredLocalBookings, calculateBookingAmount } from '../services/firestoreService';
import { BookingRecord } from '../types';
import { COMPANY_INFO } from '../data/cleaningData';
import { useAuth } from '../contexts/AuthContext';

interface BookingConfirmationPageProps {
  onOpenQuoteModal?: (service?: string) => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({
  onOpenQuoteModal,
}) => {
  const [searchParams] = useSearchParams();
  const { id: pathId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryId = searchParams.get('id') || searchParams.get('ref') || pathId || '';

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Manual lookup state if no ID is passed or not found
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTargetBooking = async () => {
      setLoading(true);
      setSearchError(null);

      if (queryId) {
        try {
          const found = await getBookingById(queryId);
          if (isMounted && found) {
            setBooking(found);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error fetching booking by ID:', err);
        }
      }

      // If no ID or not found yet, check local storage for recent bookings
      const localBookings = getStoredLocalBookings();
      if (queryId && localBookings.length > 0) {
        const localMatch = localBookings.find((b) => b.id === queryId);
        if (isMounted && localMatch) {
          setBooking(localMatch);
          setLoading(false);
          return;
        }
      }

      // Fallback: only if user has a booking matching their email
      if (!queryId) {
        if (user && user.email) {
          const userEmailClean = user.email.trim().toLowerCase();
          const userMatchingBooking = localBookings.find(
            (b) => b.customerEmail?.trim().toLowerCase() === userEmailClean || b.userId === user.uid
          );
          if (userMatchingBooking) {
            if (userMatchingBooking.id) {
              try {
                const found = await getBookingById(userMatchingBooking.id);
                if (isMounted && found) {
                  setBooking(found);
                  setLoading(false);
                  return;
                }
              } catch {}
            }
            if (isMounted) {
              setBooking(userMatchingBooking);
              setLoading(false);
              return;
            }
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadTargetBooking();

    const handleLiveUpdate = () => {
      loadTargetBooking();
    };

    window.addEventListener('pxc-booking-updated', handleLiveUpdate);
    window.addEventListener('pxc-booking-approved', handleLiveUpdate);
    window.addEventListener('storage', handleLiveUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('pxc-booking-updated', handleLiveUpdate);
      window.removeEventListener('pxc-booking-approved', handleLiveUpdate);
      window.removeEventListener('storage', handleLiveUpdate);
    };
  }, [queryId]);

  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      // 1. Try getBookingById
      const direct = await getBookingById(query);
      if (direct) {
        setBooking(direct);
        navigate(`/booking-confirmation?id=${direct.id}`, { replace: true });
        setIsSearching(false);
        return;
      }

      // 2. Try findBookingsByQuery
      const list = await findBookingsByQuery(query);
      if (list && list.length > 0) {
        setBooking(list[0]);
        navigate(`/booking-confirmation?id=${list[0].id}`, { replace: true });
      } else {
        setSearchError(`No booking found matching "${query}". Please check your reference ID or phone number.`);
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setSearchError('Unable to retrieve booking at this moment. Please call dispatch directly.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = (targetBooking: BookingRecord) => {
    const bookingDate = targetBooking.preferredDate || new Date().toISOString().split('T')[0];
    const cleanDate = bookingDate.replace(/-/g, '');
    const startTime = '090000';
    const endTime = '120000';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Prime X-Press Cleaning Inc//Winnipeg Dispatch//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:Prime X-Press Cleaning: ${targetBooking.serviceType}`,
      `DESCRIPTION:Prime X-Press Cleaning appointment in Winnipeg for ${targetBooking.customerName}. Service: ${targetBooking.serviceType}. Reference: ${targetBooking.id}. Dispatch: 204-515-7440. Status: ${targetBooking.status.toUpperCase()}.`,
      `LOCATION:${targetBooking.address || 'Winnipeg, MB'}`,
      `DTSTART:${cleanDate}T${startTime}`,
      `DTEND:${cleanDate}T${endTime}`,
      `STATUS:${targetBooking.status === 'confirmed' || targetBooking.status === 'approved' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PrimeXPress_Confirmation_${targetBooking.id || 'Appointment'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#063F4D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/our-bookings"
            className="text-xs font-bold text-[#00A8AD] hover:text-[#063F4D] transition-colors"
          >
            View All Bookings
          </Link>
          <span className="text-slate-300">•</span>
          <a
            href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
            className="text-xs font-bold text-slate-600 hover:text-[#00A8AD] flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>{COMPANY_INFO.primaryPhone}</span>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <RefreshCw className="w-10 h-10 text-[#00A8AD] animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#063F4D]">Loading Official Booking Confirmation...</h2>
          <p className="text-xs text-slate-500 mt-1">Connecting to Winnipeg Dispatch records</p>
        </div>
      ) : booking ? (
        (() => {
          const isConfirmed = booking.status === 'confirmed' || booking.status === 'approved';
          return (
            <div className="space-y-6">
              {/* Main Confirmation Hero Banner */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left">
                {/* Header Stripe */}
                <div
                  className={`p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${
                    isConfirmed
                      ? 'bg-gradient-to-r from-[#063F4D] via-[#054c5d] to-[#00A8AD]'
                      : 'bg-gradient-to-r from-amber-700 via-amber-800 to-[#063F4D]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        isConfirmed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-400 text-amber-950'
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <Clock className="w-8 h-8" />
                      )}
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold uppercase tracking-wider text-white mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#BFEDEE]" />
                        <span>
                          {isConfirmed
                            ? 'Official Dispatch Authorization • Verified'
                            : 'Dispatch Review In Progress'}
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {isConfirmed
                          ? 'Booking Approved & Confirmed!'
                          : 'Booking Request Received'}
                      </h1>

                      <p className="text-xs sm:text-sm text-[#BFEDEE] mt-1 max-w-xl">
                        {isConfirmed
                          ? 'Your appointment has been officially approved by Winnipeg Central Dispatch and scheduled on our active service route.'
                          : 'Your request has been delivered to Winnipeg Central Dispatch. An administrator will verify truck availability and finalize your confirmation.'}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill on Right */}
                  <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                      Verification Status
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs ${
                        isConfirmed
                          ? 'bg-emerald-400 text-emerald-950'
                          : 'bg-amber-300 text-amber-950'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved & Scheduled</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Pending Dispatch Review</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

            {/* Verification & Reference ID Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-[#00A8AD]" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Booking Reference ID
                  </span>
                  <span className="font-mono font-extrabold text-base text-[#063F4D]">
                    {booking.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => booking.id && handleCopyId(booking.id)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#00A8AD] text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Reference</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="print:hidden px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Core Appointment Details */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Approval Info Alert (if approved) */}
              {booking.approvedAt && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm text-emerald-950">
                      Approved & Authorized by Winnipeg Dispatch
                    </span>
                    <span className="text-emerald-800">
                      Authorized by <strong>{booking.approvedBy || 'Winnipeg Dispatch Coordinator'}</strong> on{' '}
                      <strong>{new Date(booking.approvedAt).toLocaleString()}</strong>. A direct confirmation copy was sent to{' '}
                      <strong>{booking.customerEmail}</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* 2-Column Appointment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Service & Schedule Details */}
                <div className="p-5 rounded-2xl bg-[#F5F8F8] border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Service & Schedule
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#BFEDEE]/50 text-[#063F4D] text-xs font-extrabold">
                      {booking.propertyType ? `${booking.propertyType} Property` : 'Residential'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Requested Cleaning Service</span>
                      <span className="text-base font-extrabold text-[#063F4D] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00A8AD]" />
                        {booking.serviceType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold mb-1">
                          <Calendar className="w-3.5 h-3.5 text-[#00A8AD]" />
                          <span>Appointment Date</span>
                        </div>
                        <div className="font-extrabold text-sm text-slate-800">
                          {booking.preferredDate || 'Earliest Available'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold mb-1">
                          <Clock className="w-3.5 h-3.5 text-[#00A8AD]" />
                          <span>Arrival Window</span>
                        </div>
                        <div className="font-extrabold text-sm text-slate-800">
                          {booking.preferredTimeSlot || 'Morning 8am-12pm'}
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const amount = calculateBookingAmount(booking.serviceType, booking.propertyType, booking.estimatedPriceCAD);
                      return (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                              Amount of Booking
                            </span>
                            <span className="text-xl font-black text-emerald-950">
                              ${amount.toFixed(2)} CAD
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-md shadow-2xs">
                            Guaranteed Fixed Rate
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Column 2: Client & Property Location */}
                <div className="p-5 rounded-2xl bg-[#F5F8F8] border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Client & Location
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Winnipeg Region
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Customer Name</span>
                      <span className="text-sm font-bold text-[#063F4D]">
                        {booking.customerName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Phone Number</span>
                        <a
                          href={`tel:${booking.customerPhone}`}
                          className="font-bold text-[#00A8AD] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{booking.customerPhone}</span>
                        </a>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Email Address</span>
                        <span className="font-medium text-slate-700 truncate block">
                          {booking.customerEmail}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] text-slate-500 block mb-1">Service Address</span>
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2 text-slate-800">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="font-semibold leading-relaxed">
                          {booking.address || 'Winnipeg, MB (Specific address on file)'}
                        </span>
                      </div>
                    </div>

                    {booking.additionalNotes && (
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                        <span className="font-bold block text-slate-900 mb-0.5">
                          Notes / Instructions for Technicians:
                        </span>
                        <span className="italic">"{booking.additionalNotes}"</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Day Preparation Workflow */}
              <div className="border-t border-slate-200 pt-8">
                <div className="text-left mb-5">
                  <h3 className="text-base font-extrabold text-[#063F4D] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#00A8AD]" />
                    <span>What to Expect on Your Service Day</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our Winnipeg mobile team ensures a seamless, transparent experience from start to finish.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-[#063F4D] text-[#BFEDEE] font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-[#063F4D]">30-Min Courtesy Call</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Our technicians will telephone you 30 minutes prior to arrival to verify access.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-[#063F4D] text-[#BFEDEE] font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-[#063F4D]">Pre-Service Inspection</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      We inspect vents, registers, or carpets with protective corner guards in place.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-[#063F4D] text-[#BFEDEE] font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-[#063F4D]">Commercial Cleaning</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Heavy-duty negative air vacuum or hot-water extraction cleans all contamination.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-[#063F4D] text-[#BFEDEE] font-black text-xs flex items-center justify-center">
                      4
                    </div>
                    <h4 className="text-xs font-bold text-[#063F4D]">Final Walkthrough</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      We walk you through completed work and provide your itemized payment receipt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDownloadCalendar(booking)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <CalendarPlus className="w-4 h-4 text-[#BFEDEE]" />
                    <span>Add to Calendar (.ics)</span>
                  </button>

                  <a
                    href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#00A8AD]" />
                    <span>Call Winnipeg Dispatch ({COMPANY_INFO.primaryPhone})</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/our-bookings"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#00A8AD] text-slate-700 text-xs font-bold transition-colors"
                  >
                    <span>Our Bookings Board</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00A8AD]" />
                  </Link>

                  {onOpenQuoteModal && (
                    <button
                      type="button"
                      onClick={() => onOpenQuoteModal()}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE]" />
                      <span>Book Another Service</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
          );
        })()
      ) : (
        /* No Booking Found / Manual Lookup */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#BFEDEE]/50 text-[#063F4D] flex items-center justify-center mx-auto">
            <FileCheck2 className="w-9 h-9 text-[#00A8AD]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#063F4D]">
              Booking Confirmation Lookup
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Enter your Booking Reference ID or the phone number used during reservation to view your official confirmation details.
            </p>
          </div>

          {searchError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          <form onSubmit={handleManualLookup} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-1.5">
                Reference ID or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. PXC-123456 or 204-555-0199"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching || !lookupQuery.trim()}
              className="w-full py-3.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching Dispatch Cloud Records...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>View Confirmation</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-bold">
            <Link to="/our-bookings" className="text-[#00A8AD] hover:underline">
              Check Our Bookings List
            </Link>
            <span className="text-slate-300">•</span>
            <a href={`tel:${COMPANY_INFO.primaryPhoneRaw}`} className="text-slate-600 hover:text-[#063F4D]">
              Call Dispatch: {COMPANY_INFO.primaryPhone}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
