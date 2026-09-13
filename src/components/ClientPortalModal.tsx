import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  Sparkles,
  Shield,
  Star,
  RefreshCw,
  Send,
  Search,
  Phone,
  CalendarCheck,
  FileText,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  updateBookingStatus,
  saveReview,
  findBookingsByQuery,
  getStoredLocalBookings,
} from '../services/firestoreService';
import { BookingRecord, BookingStatus } from '../types';
import { COMPANY_INFO } from '../data/cleaningData';

interface ClientPortalModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNewBookingClick?: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onNewBookingClick,
}) => {
  const { isPortalModalOpen, closePortalModal } = useAuth();
  const navigate = useNavigate();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isPortalModalOpen;
  const onClose = propOnClose || closePortalModal;

  const [activeTab, setActiveTab] = useState<'lookup' | 'leaveReview'>('lookup');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Search / Lookup state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookingRecord[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [guestBookings, setGuestBookings] = useState<BookingRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewService, setReviewService] = useState('Air Duct Cleaning');
  const [reviewNeighborhood, setReviewNeighborhood] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const local = getStoredLocalBookings();
      setGuestBookings(local);
    }
  }, [isOpen]);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await findBookingsByQuery(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search booking error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setHasSearched(false);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setStatusUpdating(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setGuestBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (searchResults) {
        setSearchResults((prev) =>
          prev ? prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)) : null
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await saveReview({
        userId: 'guest_' + Date.now(),
        authorName: reviewerName.trim() || 'Winnipeg Resident',
        rating: reviewRating,
        service: reviewService,
        neighborhood: reviewNeighborhood.trim() || 'Winnipeg, MB',
        comment: reviewComment,
        verified: true,
      });
      setReviewSuccess(true);
      setReviewComment('');
      setReviewerName('');
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 shadow-2xs">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" /> Pending Dispatch
          </span>
        );
    }
  };

  // Render a unified booking card
  const renderBookingCard = (booking: BookingRecord) => {
    return (
      <div
        key={booking.id || Math.random().toString()}
        className="p-5 rounded-2xl border border-slate-200 hover:border-[#00A8AD]/50 transition-colors bg-white shadow-xs space-y-3.5 text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold text-[#063F4D]">
                {booking.serviceType || 'Prime Cleaning Service'}
              </span>
              {booking.packageTier && (
                <span className="px-2 py-0.5 rounded-md bg-[#BFEDEE]/40 text-[#063F4D] text-[10px] font-bold uppercase tracking-wider">
                  {booking.packageTier}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-mono">
                Ref: {booking.id ? (booking.id.length > 18 ? booking.id.slice(0, 18) + '...' : booking.id) : 'PXC-PENDING'}
              </span>
              {booking.id && (
                <button
                  type="button"
                  onClick={() => handleCopyId(booking.id!)}
                  className="text-[10px] text-[#00A8AD] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                  title="Copy Reference ID"
                >
                  {copiedId === booking.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <span>Copy ID</span>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(booking.status)}
            <div className="text-right">
              <span className="text-xs text-slate-400 block text-[10px] font-medium">ESTIMATED (CAD)</span>
              <span className="text-sm sm:text-base font-extrabold text-[#063F4D]">
                ${(booking.estimatedPriceCAD || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00A8AD] shrink-0" />
            <span className="truncate">
              <strong>Date:</strong> {booking.preferredDate || 'To be scheduled'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00A8AD] shrink-0" />
            <span className="truncate">
              <strong>Time:</strong> {booking.preferredTimeSlot || 'Standard Arrival Window'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
            <MapPin className="w-4 h-4 text-[#00A8AD] shrink-0" />
            <span className="truncate">
              <strong>Location:</strong> {booking.address ? `${booking.address}, Winnipeg` : 'Winnipeg, MB'}
            </span>
          </div>
        </div>

        {/* CLIENT DETAILS IF AVAILABLE */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span>Contact: <strong>{booking.customerName || 'Client'}</strong></span>
            {booking.customerPhone && <span className="ml-2 font-mono">({booking.customerPhone})</span>}
          </div>

          <div className="flex items-center gap-3">
            {booking.id && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/booking-confirmation/${booking.id}`);
                }}
                className="text-[11px] text-[#00A8AD] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>View Full Receipt</span>
              </button>
            )}

            {booking.status === 'pending' && booking.id && (
              <button
                type="button"
                onClick={() => handleStatusChange(booking.id!, 'cancelled')}
                disabled={statusUpdating === booking.id}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer disabled:opacity-50"
              >
                {statusUpdating === booking.id ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#063F4D]/75 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 text-left">
        
        {/* MODAL HEADER */}
        <div className="bg-[#063F4D] text-white p-5 sm:p-6 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-extrabold uppercase tracking-wider text-[#BFEDEE] flex items-center gap-1">
                <CalendarCheck className="w-3 h-3 text-[#BFEDEE]" />
                Winnipeg Booking Status & Client Services
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              Track Appointments & Services
            </h2>

            <p className="text-xs text-slate-300">
              Look up appointments by Reference ID or Phone, track live status, or leave a review.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="portal-close-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('lookup')}
            className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'border-[#00A8AD] text-[#063F4D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Track & Lookup Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('leaveReview')}
            className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaveReview'
                ? 'border-[#00A8AD] text-[#063F4D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">

          {/* TAB 1: LOOKUP & RECENT BOOKINGS */}
          {activeTab === 'lookup' && (
            <div className="space-y-6">
              {/* SEARCH & LOOKUP BAR */}
              <div className="bg-[#F5F8F8] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#063F4D] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-[#00A8AD]" />
                    <span>Instant Booking Lookup</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Search by Reference ID, Phone Number, or Email
                  </span>
                </div>

                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="booking-lookup-input"
                      type="text"
                      placeholder="e.g. 2045550199 or pxc_... or your email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 outline-none focus:border-[#00A8AD] shadow-xs"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    id="booking-lookup-search-btn"
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Check Booking</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* SEARCH RESULTS VIEW (if a search was performed) */}
              {hasSearched && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-extrabold text-[#063F4D] flex items-center gap-1.5">
                      <span>Lookup Results</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {searchResults?.length || 0} found
                      </span>
                    </h3>

                    <button
                      onClick={handleClearSearch}
                      className="text-xs text-[#00A8AD] hover:underline font-bold cursor-pointer"
                    >
                      Show All / Clear Search
                    </button>
                  </div>

                  {isSearching ? (
                    <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00A8AD]" />
                      <span>Searching cloud records...</span>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((b) => renderBookingCard(b))}
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-3 bg-slate-50">
                      <Clock3 className="w-8 h-8 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">No Booking Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        We couldn't find a record matching "{searchQuery}". Please verify your reference ID or the phone number used when submitting your quote.
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <a
                          href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                          className="px-4 py-2 rounded-xl bg-[#063F4D] text-white text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#BFEDEE]" />
                          <span>Call Dispatch: {COMPANY_INFO.primaryPhone}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DEFAULT VIEW (when not searching) */}
              {!hasSearched && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-[#063F4D]">
                        {guestBookings.length > 0 ? 'Your Recent Bookings' : 'Check Appointment Status'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {guestBookings.length > 0
                          ? 'Appointments scheduled on this device are displayed below.'
                          : 'Enter your Booking Reference ID or Phone number above to track your technician.'}
                      </p>
                    </div>

                    {onNewBookingClick && (
                      <button
                        onClick={() => {
                          onClose();
                          onNewBookingClick();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE]" />
                        <span>Book New Service</span>
                      </button>
                    )}
                  </div>

                  {guestBookings.length > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Found <strong>{guestBookings.length}</strong> booking{guestBookings.length > 1 ? 's' : ''} saved on this device. Live status is shown below:
                        </span>
                      </div>
                      {guestBookings.map((b) => renderBookingCard(b))}
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl p-6 space-y-4 bg-slate-50/50">
                      <div className="w-12 h-12 rounded-2xl bg-[#BFEDEE]/50 text-[#00A8AD] flex items-center justify-center mx-auto">
                        <CalendarCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-[#063F4D]">
                          Look Up Your Cleaning Service
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Have a scheduled air duct, carpet, or window cleaning appointment? Enter your Booking Reference ID, Phone number, or Email in the search box above to check live dispatch status.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        {onNewBookingClick && (
                          <button
                            onClick={() => {
                              onClose();
                              onNewBookingClick();
                            }}
                            className="px-5 py-2.5 rounded-xl bg-[#00A8AD] text-white font-extrabold text-xs shadow-md hover:bg-[#063F4D] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE]" />
                            <span>Book Online Now</span>
                          </button>
                        )}

                        <a
                          href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#063F4D] font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#00A8AD]" />
                          <span>Direct Dispatch: {COMPANY_INFO.primaryPhone}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LEAVE A REVIEW */}
          {activeTab === 'leaveReview' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#063F4D]">
                  Customer Review & Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Share your experience with our cleaning crew. Verified reviews are saved directly to our community records.
                </p>
              </div>

              {reviewSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Thank you! Your verified review has been submitted to the database.</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Service Performed
                  </label>
                  <select
                    value={reviewService}
                    onChange={(e) => setReviewService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                  >
                    <option>Air Duct Cleaning</option>
                    <option>Carpet Cleaning</option>
                    <option>Window Cleaning</option>
                    <option>Residential Deep Cleaning</option>
                    <option>Commercial Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Winnipeg Neighborhood
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St. Vital, River Heights, Linden Woods, Charleswood..."
                    value={reviewNeighborhood}
                    onChange={(e) => setReviewNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Rating (Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Your Review & Experience
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the technician's punctuality, air quality results, or carpet cleanliness..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting to Database...' : 'Submit Verified Review'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
