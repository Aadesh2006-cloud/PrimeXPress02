import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  Download,
  Copy,
  Check,
  RefreshCw,
  Printer,
  ChevronRight,
  Info,
  CalendarPlus,
  HelpCircle,
  ArrowRight,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { COMPANY_INFO } from '../data/cleaningData';
import {
  findBookingsByQuery,
  getUserBookings,
  syncConsumerBookings,
  calculateBookingAmount,
  deduplicateBookings,
} from '../services/firestoreService';
import { BookingRecord, BookingStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface OurBookingsPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const OurBookingsPage: React.FC<OurBookingsPageProps> = ({ onOpenQuoteModal }) => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('ref') || searchParams.get('q') || searchParams.get('query') || '';

  const [searchInput, setSearchInput] = useState<string>(initialQuery);
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<BookingRecord[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);
  const [isLoadingUserBookings, setIsLoadingUserBookings] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load bookings strictly connected to the logged-in user's Gmail / email
  const loadUserConnectedBookings = async () => {
    if (!user || !user.email) {
      setUserBookings([]);
      setIsLoadingUserBookings(false);
      return;
    }

    setIsLoadingUserBookings(true);
    try {
      const records = await getUserBookings(user.uid, user.email);
      const cleanRecords = deduplicateBookings(records || []);
      setUserBookings(cleanRecords);

      // Background live sync for status updates
      const bookingIds = cleanRecords.map((b) => b.id).filter(Boolean) as string[];
      if (bookingIds.length > 0) {
        const synced = await syncConsumerBookings(bookingIds, user.email);
        if (synced && synced.length > 0) {
          setUserBookings(deduplicateBookings(synced));
        }
      }
    } catch (err) {
      console.error('Error fetching user connected bookings:', err);
      setUserBookings([]);
    } finally {
      setIsLoadingUserBookings(false);
    }
  };

  useEffect(() => {
    loadUserConnectedBookings();

    const handleUpdate = () => {
      loadUserConnectedBookings();
      if (searchedQuery) {
        executeSearch(searchedQuery);
      }
    };

    window.addEventListener('pxc-booking-updated', handleUpdate);
    window.addEventListener('pxc-booking-approved', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('pxc-booking-updated', handleUpdate);
      window.removeEventListener('pxc-booking-approved', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user?.email, user?.uid, searchedQuery]);

  // If URL has ref or query parameter, auto execute search on mount
  useEffect(() => {
    if (initialQuery) {
      setSearchInput(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const executeSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchedQuery(q);

    try {
      const results = await findBookingsByQuery(q);
      const dedupedResults = deduplicateBookings(results);

      if (user && !isAdmin) {
        const cleanUserEmail = (user.email || '').trim().toLowerCase();
        // Regular consumer: strictly filter so only their bookings or exact reference ID are viewable
        const filtered = dedupedResults.filter(
          (b) =>
            (cleanUserEmail && b.customerEmail?.trim().toLowerCase() === cleanUserEmail) ||
            (user.uid && b.userId === user.uid) ||
            (b.id && b.id.toLowerCase() === q.toLowerCase())
        );
        setSearchResults(filtered);
      } else if (!user && !isAdmin) {
        // Guest consumer: strictly filter so only their matching booking is viewable
        const cleanQuery = q.toLowerCase();
        const cleanQueryDigits = q.replace(/\D/g, '');
        const filtered = dedupedResults.filter((b) => {
          const matchId = b.id && b.id.toLowerCase() === cleanQuery;
          const matchEmail = b.customerEmail && b.customerEmail.toLowerCase() === cleanQuery;
          const matchPhone = cleanQueryDigits.length >= 7 && b.customerPhone && b.customerPhone.replace(/\D/g, '') === cleanQueryDigits;
          return matchId || matchEmail || matchPhone;
        });
        setSearchResults(filtered);
      } else {
        setSearchResults(dedupedResults);
      }
    } catch (err) {
      console.error('Error finding booking:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ ref: searchInput.trim() });
    executeSearch(searchInput);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  /**
   * Generates a standard .ics calendar invite for the customer
   */
  const handleDownloadCalendar = (booking: BookingRecord) => {
    const bookingDate = booking.preferredDate || new Date().toISOString().split('T')[0];
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
      `SUMMARY:Prime X-Press Cleaning: ${booking.serviceType}`,
      `DESCRIPTION:Prime X-Press Cleaning appointment in Winnipeg for ${booking.customerName}. Service: ${booking.serviceType}. Reference: ${booking.id}. Dispatch: 204-515-7440.`,
      `LOCATION:${booking.address || 'Winnipeg, MB'}`,
      `DTSTART:${cleanDate}T${startTime}`,
      `DTEND:${cleanDate}T${endTime}`,
      `STATUS:${booking.status === 'confirmed' || booking.status === 'approved' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PrimeXPress_Booking_${booking.id || 'Appointment'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs items={[{ label: 'Our Bookings & Service Status' }]} />

      {/* Hero Header Section */}
      <section className="relative py-14 lg:py-20 bg-[#063F4D] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#00A8AD_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Winnipeg Real-Time Dispatch Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Our Bookings & Service Status
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Check your appointment status in real-time. Simply enter your{' '}
            <strong className="text-white font-bold">Booking Reference ID</strong>,{' '}
            <strong className="text-white font-bold">Phone Number</strong>, or{' '}
            <strong className="text-white font-bold">Email Address</strong> below.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-slate-800"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Reference (e.g. PXC-...), Phone, or Email"
                  className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm text-[#063F4D] placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setHasSearched(false);
                      setSearchResults([]);
                      setSearchParams({});
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchInput.trim()}
                className="px-6 py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60 shrink-0"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Status</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick helper pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-300">
              <span className="text-slate-400 text-[11px]">Instant Lookup:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('204-515-7440');
                  executeSearch('204-515-7440');
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#BFEDEE] text-[11px] font-medium transition-colors cursor-pointer border border-white/10"
              >
                Dispatch Phone (204-515-7440)
              </button>
              {user && userBookings.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const latest = userBookings[0];
                    if (latest?.id) {
                      setSearchInput(latest.id);
                      executeSearch(latest.id);
                    }
                  }}
                  className="px-2.5 py-1 rounded-full bg-amber-400 text-[#063F4D] text-[11px] font-bold transition-transform hover:scale-105 cursor-pointer shadow-xs"
                >
                  View My Booking ({userBookings[0].id?.slice(0, 10)}...)
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 lg:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* If Search was performed */}
        {hasSearched ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#063F4D]">
                  Search Results for "{searchedQuery}"
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {searchResults.length === 1
                    ? '1 booking record matched your query in the Winnipeg dispatch system.'
                    : `${searchResults.length} booking records found.`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => executeSearch(searchedQuery)}
                  disabled={isSearching}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#063F4D] hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#00A8AD] ${isSearching ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {searchResults.length > 0 && (
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    title="Print or save booking receipt"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Slip</span>
                  </button>
                )}
              </div>
            </div>

            {/* Results Display */}
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#063F4D]">
                    No Booking Found for "{searchedQuery}"
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    We could not locate an active booking record matching that query.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs text-slate-600">
                  <div className="font-bold text-[#063F4D] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#00A8AD]" />
                    <span>Tips to find your booking:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Check for typos in your 10-digit phone number (e.g. 204-515-7440).</li>
                    <li>Verify the email address provided during quote submission.</li>
                    <li>Reference IDs typically start with <strong>PXC-</strong> or <strong>sb_bk_</strong>.</li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Dispatch: {COMPANY_INFO.primaryPhone}</span>
                  </a>

                  <button
                    onClick={() => onOpenQuoteModal()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#063F4D] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00A8AD]" />
                    <span>Book a New Cleaning</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults.map((booking) => (
                  <BookingStatusCard
                    key={booking.id}
                    booking={booking}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    onDownloadCalendar={handleDownloadCalendar}
                    onOpenQuoteModal={onOpenQuoteModal}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* When not actively searching: Show Connected Consumer Bookings or Clean Guest Welcome */}
        {!hasSearched && (
          <div>
            {user ? (
              // Consumer is Logged In: Show strictly bookings connected to their Gmail / email
              <div className="space-y-6">
                {isLoadingUserBookings ? (
                  <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#BFEDEE]/50 text-[#00A8AD] flex items-center justify-center mx-auto animate-spin">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#063F4D]">
                        Checking Bookings Connected to {user.email}...
                      </h3>
                      <p className="text-xs text-slate-500">
                        Synchronizing with Winnipeg dispatch and cloud records
                      </p>
                    </div>
                  </div>
                ) : userBookings.length === 0 ? (
                  // CLEAN BOOKING PAGE FOR NEW / CURRENT CONSUMER (ZERO FOREIGN DATA)
                  <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200/90 shadow-sm space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                      <CalendarCheck className="w-8 h-8" />
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        <Mail className="w-3.5 h-3.5 text-[#00A8AD]" />
                        <span>Connected Google Account: {user.email}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-[#063F4D]">
                        Your Booking History is Clean
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        No cleaning appointments are currently linked to <strong className="text-[#063F4D]">{user.email}</strong>. Whenever you book an Air Duct, Carpet, Window, or Deep Cleaning service, all your real-time dispatch updates, time slots, and confirmation receipts will automatically connect here.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenQuoteModal()}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Book a Cleaning Service</span>
                      </button>

                      <a
                        href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#063F4D] text-xs sm:text-sm font-bold transition-colors"
                      >
                        <Phone className="w-4 h-4 text-[#00A8AD]" />
                        <span>Call Dispatch: {COMPANY_INFO.primaryPhone}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  // Consumer has bookings linked to their Gmail: Display them cleanly
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-extrabold text-[#063F4D]">
                            My Bookings & Invoices ({userBookings.length})
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Linked to {user.email}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Real-time cleaning appointments, technician dispatch status, and official receipts.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={loadUserConnectedBookings}
                          disabled={isLoadingUserBookings}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#063F4D] hover:bg-slate-50 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-[#00A8AD] ${isLoadingUserBookings ? 'animate-spin' : ''}`} />
                          <span>Refresh</span>
                        </button>
                        <button
                          onClick={handlePrint}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Print Slip</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {userBookings.map((booking) => (
                        <BookingStatusCard
                          key={booking.id}
                          booking={booking}
                          onCopy={handleCopy}
                          copiedId={copiedId}
                          onDownloadCalendar={handleDownloadCalendar}
                          onOpenQuoteModal={onOpenQuoteModal}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Guest Visitor (Not Signed In): Clean Portal explaining how to access bookings
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-sm space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#BFEDEE]/50 text-[#00A8AD] flex items-center justify-center mx-auto border border-[#00A8AD]/20 shadow-xs">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#063F4D]">
                    Connect with Your Gmail to View Bookings
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Sign in with your Google account or email to view all past and upcoming cleaning appointments connected to your account.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/signin"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Sign In with Gmail / Email</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => onOpenQuoteModal()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#063F4D] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#00A8AD]" />
                    <span>Book a Cleaning Service</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200/80 max-w-md mx-auto text-left text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-[#063F4D] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#00A8AD]" />
                    <span>Looking for a Guest Booking?</span>
                  </div>
                  <p>
                    If you booked as a guest without signing in, you can look up your dispatch status anytime by entering your Reference ID (e.g. <strong>PXC-...</strong>) or phone number in the search bar above.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How Booking & Approval Works Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-left">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold text-[#00A8AD] uppercase tracking-wider">
              Transparent Dispatch System
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#063F4D]">
              Understanding Your Booking Lifecycle
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Here is how your cleaning appointment moves through our Winnipeg operations from submission to completion:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#F5F8F8] border border-slate-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div className="font-extrabold text-[#063F4D] text-sm">
                1. Request Received (Pending)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you submit a quote or booking request online, it is automatically logged with a 
                <strong className="text-amber-800 font-bold"> Pending Approval</strong> status. An immediate dispatch notification is routed to our administrator at <strong className="text-[#063F4D]">primexpress33@gmail.com</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#F5F8F8] border border-slate-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div className="font-extrabold text-[#063F4D] text-sm">
                2. Admin Review & Confirmation
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our Winnipeg dispatch coordinator inspects truck equipment routing and technician availability. Once reviewed, the admin clicks <strong className="text-blue-800 font-bold">Approve & Confirm</strong>, locking your time slot and issuing your official confirmation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#F5F8F8] border border-slate-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                3
              </div>
              <div className="font-extrabold text-[#063F4D] text-sm">
                3. Service Execution & Invoice
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our certified technicians arrive at your Winnipeg address with high-suction truck-mounted vacuums and hospital-grade sanitizers. Once complete, your status transitions to <strong className="text-emerald-800 font-bold">Completed</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Regarding Booking Statuses */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#BFEDEE]/50 text-[#00A8AD]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#063F4D]">
                Frequently Asked Status Questions
              </h3>
              <p className="text-xs text-slate-500">
                Answers to common customer scheduling inquiries
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-[#063F4D] text-sm">
                How quickly will my booking be reviewed?
              </div>
              <p className="text-slate-600 leading-relaxed">
                Bookings submitted during business hours (Monday to Saturday, 8:00 AM – 7:00 PM) are typically reviewed by our dispatch administrator within 15–30 minutes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-[#063F4D] text-sm">
                Can I reschedule or change my preferred date?
              </div>
              <p className="text-slate-600 leading-relaxed">
                Yes! We offer flexible rescheduling with at least 24 hours advance notice. Call our direct line at <strong>204-515-7440</strong> or reply to your booking confirmation email.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-[#063F4D] text-sm">
                Will the technicians call before arriving?
              </div>
              <p className="text-slate-600 leading-relaxed">
                Yes, our crew provides a courtesy call approximately 20–30 minutes before arrival at your Winnipeg property to confirm you are ready.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-[#063F4D] text-sm">
                How does payment work?
              </div>
              <p className="text-slate-600 leading-relaxed">
                No upfront payment is charged at booking time! Payment is only completed on-site after our technicians finish the service and you have inspected the results. We accept Visa, Mastercard, Interac Debit, and e-Transfer.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Dispatch Help Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#063F4D] to-[#0A5666] text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00A8AD]/30 text-[#BFEDEE] text-xs font-bold">
              <Phone className="w-3.5 h-3.5" />
              <span>Direct Customer Support</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Need Assistance with an Existing Appointment?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              Our Winnipeg dispatch coordinator is available to answer questions, accommodate urgent arrival windows, or update your service requirements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00A8AD] hover:bg-white hover:text-[#063F4D] text-white font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call 204-515-7440</span>
            </a>

            <button
              onClick={() => onOpenQuoteModal()}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#BFEDEE]" />
              <span>Book Another Service</span>
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};

/**
 * Status Badge Component
 */
const StatusBadge: React.FC<{ status?: BookingStatus }> = ({ status }) => {
  if (status === 'approved' || status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Approved & Scheduled</span>
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold">
        <Check className="w-3 h-3 text-blue-600" />
        <span>Service Completed</span>
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        <span>Cancelled</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold animate-pulse">
      <Clock3 className="w-3 h-3 text-amber-600" />
      <span>Pending Dispatch Review</span>
    </span>
  );
};

/**
 * Detailed Booking Card with Progress Stepper and Action Tools
 */
interface BookingStatusCardProps {
  booking: BookingRecord;
  onCopy: (id: string) => void;
  copiedId: string | null;
  onDownloadCalendar: (booking: BookingRecord) => void;
  onOpenQuoteModal: (service?: string) => void;
}

const BookingStatusCard: React.FC<BookingStatusCardProps> = ({
  booking,
  onCopy,
  copiedId,
  onDownloadCalendar,
  onOpenQuoteModal,
}) => {
  const isPending = !booking.status || booking.status === 'pending';
  const isApproved = booking.status === 'approved' || booking.status === 'confirmed';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  const bookingAmount = calculateBookingAmount(
    booking.serviceType,
    booking.propertyType,
    booking.estimatedPriceCAD
  );

  // Determine active step index: 1 (Submitted), 2 (Review), 3 (Approved/Confirmed), 4 (Completed)
  let activeStep = 1;
  if (isPending) activeStep = 2;
  if (isApproved) activeStep = 3;
  if (isCompleted) activeStep = 4;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden text-left transition-all">
      {/* Top Banner based on status */}
      <div
        className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isPending
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : isApproved
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : isCompleted
            ? 'bg-blue-50/80 border-blue-200 text-blue-900'
            : 'bg-rose-50/80 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPending
                ? 'bg-amber-200 text-amber-900'
                : isApproved
                ? 'bg-emerald-200 text-emerald-900'
                : isCompleted
                ? 'bg-blue-200 text-blue-900'
                : 'bg-rose-200 text-rose-900'
            }`}
          >
            {isPending ? (
              <Clock3 className="w-5 h-5 animate-pulse" />
            ) : isApproved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isCompleted ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                Current Status:
              </span>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs font-medium opacity-90 mt-0.5">
              {isPending &&
                'Your request has been logged. Our dispatch administrator is currently reviewing truck schedules.'}
              {isApproved &&
                'Approved by Administrator! Your appointment is locked into our Winnipeg service schedule.'}
              {isCompleted &&
                'Service has been completed to hospital-grade sanitization standards.'}
              {isCancelled &&
                'This booking is cancelled. Please call dispatch if you need assistance.'}
            </p>
          </div>
        </div>

        {/* Amount of Booking and Copy Reference ID */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-emerald-900 border border-emerald-300 shadow-2xs text-xs font-extrabold">
            <span className="text-slate-500 font-bold text-[10px] uppercase">Amount:</span>
            <span className="text-emerald-800">${bookingAmount.toFixed(2)} CAD</span>
          </div>

          {/* Copy Reference ID button */}
          {booking.id && (
            <button
              onClick={() => onCopy(booking.id!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-mono font-bold text-[#063F4D] border border-black/10 shadow-2xs transition-all cursor-pointer"
              title="Click to copy Reference ID"
            >
              <span>{booking.id}</span>
              {copiedId === booking.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Visual 4-Step Progress Stepper */}
      {!isCancelled && (
        <div className="px-6 py-6 bg-slate-50/70 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Step 1 */}
            <div className="text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-bold shadow-xs">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-[#063F4D]">Submitted</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">Logged in DB</div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow-xs ${
                  activeStep >= 2
                    ? isPending
                      ? 'bg-amber-500 text-white ring-4 ring-amber-200'
                      : 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {activeStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="text-[11px] font-bold text-[#063F4D]">
                {isPending ? 'Under Review' : 'Reviewed'}
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block">Dispatch Check</div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow-xs ${
                  activeStep >= 3
                    ? isApproved
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                      : 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {activeStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <div className="text-[11px] font-bold text-[#063F4D]">Approved</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">Truck Assigned</div>
            </div>

            {/* Step 4 */}
            <div className="text-center space-y-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow-xs ${
                  activeStep === 4
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {activeStep === 4 ? <Check className="w-4 h-4" /> : '4'}
              </div>
              <div className="text-[11px] font-bold text-[#063F4D]">Completed</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">Sanitized & Done</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Column 1: Service & Appointment */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Service & Appointment
            </div>
            
            <div className="space-y-1">
              <div className="text-base font-extrabold text-[#063F4D]">
                {booking.serviceType}
              </div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#BFEDEE]/50 text-[#063F4D] text-[11px] font-bold">
                {booking.propertyType || 'Residential'} Property
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span className="font-semibold text-slate-800">
                  {booking.preferredDate || 'Earliest available date'}
                </span>
              </div>
              {booking.preferredTimeSlot && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00A8AD] shrink-0" />
                  <span>Window: <strong>{booking.preferredTimeSlot}</strong></span>
                </div>
              )}
            </div>

            {/* Amount of Booking card */}
            <div className="mt-3 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Amount of Booking
                </span>
                <span className="text-base font-black text-emerald-900">
                  ${bookingAmount.toFixed(2)} CAD
                </span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                Pay On-Site
              </span>
            </div>
          </div>

          {/* Column 2: Location & Customer */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Customer & Service Address
            </div>

            <div className="space-y-1">
              <div className="font-bold text-[#063F4D] text-sm">
                {booking.customerName || 'Customer'}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-[#00A8AD] shrink-0" />
                <a href={`tel:${booking.customerPhone}`} className="text-[#00A8AD] font-bold hover:underline">
                  {booking.customerPhone || 'N/A'}
                </a>
              </div>
              {booking.customerEmail && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{booking.customerEmail}</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 text-slate-700 pt-1">
              <MapPin className="w-4 h-4 text-[#00A8AD] shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">
                {booking.address || 'Winnipeg, MB'}
              </span>
            </div>
          </div>

          {/* Column 3: Dispatch & Approval Details */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dispatch Verification
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Submission Time:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(booking.createdAt).toLocaleString()}
                </span>
              </div>

              {booking.approvedAt ? (
                <div>
                  <span className="text-slate-500 block text-[10px]">Admin Approved At:</span>
                  <span className="font-bold text-blue-800">
                    {new Date(booking.approvedAt).toLocaleString()}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Authorized by: {booking.approvedBy || 'Dispatch Admin'}
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-slate-500 block text-[10px]">Approval Status:</span>
                  <span className="text-amber-700 font-bold">
                    Pending Dispatch Coordinator Review
                  </span>
                </div>
              )}

              {booking.additionalNotes && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Notes / Instructions:</span>
                  <span className="italic text-slate-700">"{booking.additionalNotes}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Add to Calendar */}
            <button
              onClick={() => onDownloadCalendar(booking)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Add appointment to Apple Calendar, Outlook, or Google Calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Add to Calendar (.ics)</span>
            </button>

            {/* Direct Call to Dispatch */}
            <a
              href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              title="Call Winnipeg Dispatch for questions or time adjustments"
            >
              <Phone className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Call Dispatch ({COMPANY_INFO.primaryPhone})</span>
            </a>

            {/* Email Dispatch */}
            <a
              href={`mailto:${COMPANY_INFO.email}?subject=Inquiry%20regarding%20Booking%20${booking.id}&body=Hello%20Prime%20X-Press%20Dispatch,%0A%0AI%20am%20inquiring%20about%20my%20booking%20reference%20${booking.id}.%0A%0A`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email Us</span>
            </a>

            {/* Official Confirmation Page Link */}
            <Link
              to={`/booking-confirmation?id=${booking.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
              title="View official dispatch confirmation page"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confirmation Page</span>
            </Link>
          </div>

          <div>
            <button
              onClick={() => onOpenQuoteModal(booking.serviceType)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE]" />
              <span>Book Another Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
