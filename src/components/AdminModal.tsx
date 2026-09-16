import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { csvCell } from '../utils/csv';
import { createMailto } from '../utils/mailto';
import {
  X,
  ShieldCheck,
  Mail,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Trash2,
  ChevronDown,
  Sparkles,
  DollarSign,
  Building,
  Check,
  Bell,
  BellRing,
  Copy,
  ExternalLink,
  Send,
  Volume2,
  FileText,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  approveBooking
} from '../services/firestoreService';
import {
  getAdminNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  generateConsumerConfirmationEmail,
  getMailDispatchLogs,
  EmailDispatchLog,
  playNotificationChime
} from '../services/notificationService';
import { BookingRecord, BookingStatus, AdminNotification } from '../types';

export const AdminModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAdminPanelOpen,
    closeAdminPanel,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    adminUser,
  } = useAuth();

  // Admin login form states
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Panel Dashboard states
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Notifications & Approvals
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showMailLogsModal, setShowMailLogsModal] = useState<boolean>(false);
  const [mailLogs, setMailLogs] = useState<EmailDispatchLog[]>([]);

  // Approval preview dialog
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState<BookingRecord | null>(null);
  const [approvalEmailData, setApprovalEmailData] = useState<{
    to: string;
    subject: string;
    body: string;
    mailtoUrl: string;
  } | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // Sync notifications and listen to real-time new booking events
  const refreshNotificationsState = () => {
    const list = getAdminNotifications();
    setNotifications(list);
    setUnreadNotifsCount(getUnreadNotificationCount());
  };

  useEffect(() => {
    refreshNotificationsState();

    const handleNewBooking = () => {
      refreshNotificationsState();
      fetchBookings();
    };

    const handleBookingDeleted = (e: any) => {
      const deletedId = e.detail?.bookingId;
      if (deletedId) {
        setBookings((prev) => prev.filter((b) => b.id !== deletedId));
      }
      refreshNotificationsState();
    };

    window.addEventListener('pxc-new-booking-notification', handleNewBooking);
    window.addEventListener('pxc-notifications-updated', handleNewBooking);
    window.addEventListener('pxc-booking-deleted', handleBookingDeleted);
    window.addEventListener('storage', handleNewBooking);

    return () => {
      window.removeEventListener('pxc-new-booking-notification', handleNewBooking);
      window.removeEventListener('pxc-notifications-updated', handleNewBooking);
      window.removeEventListener('pxc-booking-deleted', handleBookingDeleted);
      window.removeEventListener('storage', handleNewBooking);
    };
  }, [isAdminLoggedIn]);

  // Fetch bookings when modal opens and admin is authenticated
  useEffect(() => {
    if (!isAdminLoggedIn) {
      setBookings([]); setNotifications([]); setMailLogs([]); setSelectedBookingForApproval(null); setApprovalEmailData(null);
    }
    if (isAdminPanelOpen && isAdminLoggedIn) {
      fetchBookings();
      refreshNotificationsState();
    }
  }, [isAdminPanelOpen, isAdminLoggedIn]);

  const fetchBookings = async () => {
    if (!isAdminLoggedIn) return;
    setIsLoadingBookings(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setStatusUpdatingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (newStatus === 'approved') {
        setSuccessNotification(`Booking #${bookingId} status updated to APPROVED in Supabase!`);
        setTimeout(() => setSuccessNotification(null), 6000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /**
   * Handle official Admin approval of a booking:
   * Sets status to 'approved', syncs to Supabase, logs email dispatch,
   * updates the Admin Panel in real time and keeps the admin view open.
   */
  const handleApproveBooking = async (booking: BookingRecord) => {
    if (!booking.id) return;
    setIsApproving(true);
    setStatusUpdatingId(booking.id);

    try {
      const result = await approveBooking(booking, (adminUser?.email || ''));
      if (result) {
        setApprovalEmailData(result.emailDetails);
        setSelectedBookingForApproval({
          ...booking,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: (adminUser?.email || ''),
          consumerConfirmationSent: true,
        });

        // Update local state so it immediately reflects 'approved' in Admin Panel
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id
              ? {
                  ...b,
                  status: 'approved',
                  approvedAt: new Date().toISOString(),
                  approvedBy: (adminUser?.email || ''),
                  consumerConfirmationSent: true,
                }
              : b
          )
        );

        refreshNotificationsState();

        // Display clear feedback banner in Admin Panel
        setSuccessNotification(
          `Booking #${booking.id} was successfully APPROVED! Saved to Supabase database (status: approved) and updated in Dispatch.`
        );
        setTimeout(() => setSuccessNotification(null), 8000);
      }
    } catch (err) {
      console.error('Error approving booking:', err);
    } finally {
      setIsApproving(false);
      setStatusUpdatingId(null);
    }
  };

  /**
   * View the official consumer confirmation email for an already-confirmed booking
   */
  const handleViewConfirmationEmail = (booking: BookingRecord) => {
    const emailDetails = generateConsumerConfirmationEmail(booking);
    setApprovalEmailData(emailDetails);
    setSelectedBookingForApproval(booking);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setDeleteConfirmId(null);
      refreshNotificationsState();
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;

    const headers = [
      'Reference ID',
      'Date Booked',
      'Customer Name',
      'Email',
      'Phone',
      'Service',
      'Property Type',
      'Address',
      'Preferred Date',
      'Time Slot',
      'Status',
      'Approved At',
      'Approved By',
      'Notes'
    ];

    const rows = bookings.map((b) => [
      b.id,
      new Date(b.createdAt).toLocaleString(),
      b.customerName,
      b.customerEmail,
      b.customerPhone,
      b.serviceType,
      b.propertyType,
      b.address,
      b.preferredDate,
      b.preferredTimeSlot,
      b.status,
      b.approvedAt ? new Date(b.approvedAt).toLocaleString() : '',
      b.approvedBy,
      b.additionalNotes
    ]);

    const csvContent = [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\r\n');
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `primexpress_bookings_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(adminEmailInput, adminPasswordInput);
      if (!res.success) {
        setLoginError(res.error || 'Invalid Administrator ID or Password.');
      } else {
        setAdminPasswordInput('');
        setLoginError(null);
        fetchBookings();
        refreshNotificationsState();
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await logoutAdmin();
    setAdminEmailInput('');
    setAdminPasswordInput('');
    setLoginError(null);
  };

  if (!isAdminPanelOpen) return null;

  // If admin is not logged in, render the secure Admin Login portal
  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-scaleUp">
          {/* Header */}
          <div className="px-6 py-5 bg-[#063F4D] text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00A8AD] flex items-center justify-center text-white shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Admin Portal Login</h3>
                <p className="text-xs text-[#BFEDEE]">Prime X-Press Operations Dispatch</p>
              </div>
            </div>
            <button
              onClick={closeAdminPanel}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#BFEDEE]/50 text-[#00A8AD] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-extrabold text-[#063F4D]">Administrator Authentication</h4>
              <p className="text-xs text-slate-500">
                Enter your authorized administrator ID and password to access the Winnipeg dispatch operations.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admin ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-login-email-input"
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => {
                      setAdminEmailInput(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Enter admin email address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00A8AD] focus:border-transparent text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00A8AD] focus:border-transparent text-sm font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#063F4D] to-[#00A8AD] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Administrator Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Admin Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Filter calculations
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      b.status === statusFilter ||
      ((statusFilter === 'approved' || statusFilter === 'confirmed') &&
        (b.status === 'approved' || b.status === 'confirmed'));
    const matchesService = serviceFilter === 'all' || b.serviceType === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved' || b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  const uniqueServices = Array.from(new Set(bookings.map((b) => b.serviceType).filter(Boolean)));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 animate-scaleUp">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#063F4D] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A8AD] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Prime X-Press Admin Portal
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#063F4D] text-[10px] font-black uppercase tracking-wider">
                  DISPATCH
                </span>
              </div>
              <p className="text-xs text-[#BFEDEE]">
                Signed in as: <strong className="text-white font-medium">{(adminUser?.email || '')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell Button */}
            <button
              onClick={() => {
                setShowNotificationsModal(true);
                markAllNotificationsAsRead();
                refreshNotificationsState();
              }}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Real-Time Booking Notifications & Email Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Mail Logs Drawer Button */}
            <button
              onClick={() => {
                setMailLogs(getMailDispatchLogs());
                setShowMailLogsModal(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title="Inspect Outbound Email Dispatch History"
            >
              <Mail className="w-3.5 h-3.5 text-[#BFEDEE]" />
              <span>Mail Logs</span>
            </button>

            {/* Admin Sign Out / Log Out Button */}
            <button
              id="admin-portal-signout-btn"
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white text-xs font-bold border border-rose-400/30 transition-colors cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <button
              onClick={closeAdminPanel}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="space-y-6">
            {/* Metrics Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Total Bookings
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#063F4D] mt-1">
                    {totalCount}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('pending')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    pendingCount > 0
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5" />
                      <span>Pending Approval</span>
                    </div>
                    {pendingCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-1">
                    {pendingCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approved</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">
                    {approvedCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">
                    {completedCount}
                  </div>
                </div>
              </div>

              {/* ACTION REQUIRED: PENDING APPROVALS ALERT BANNER */}
              {pendingCount > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                      <BellRing className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                          Approval Required
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-amber-950">
                          {pendingCount} Booking Request{pendingCount > 1 ? 's' : ''} Awaiting Administrator Review
                        </h4>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                        When consumers submit bookings on the website, they receive a pending status. 
                        <strong> Consumers only receive an official confirmed booking once you click "Approve & Confirm".</strong> Alerts have been routed to <strong>{(adminUser?.email || '')}</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setStatusFilter('pending')}
                      className="w-full md:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Filter {pendingCount} Pending Request{pendingCount > 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              )}

              {/* Action and Filter Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by customer name, phone, email, reference ID, address..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00A8AD] text-[#063F4D]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchBookings}
                      disabled={isLoadingBookings}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-[#063F4D] text-xs font-bold transition-colors cursor-pointer"
                      title="Reload latest bookings from database"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-[#00A8AD] ${isLoadingBookings ? 'animate-spin' : ''}`}
                      />
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={handleExportCSV}
                      disabled={bookings.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      title="Download bookings as CSV file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Status and Service Filters */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['all', 'pending', 'approved', 'completed', 'cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          statusFilter === st
                            ? 'bg-[#063F4D] text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                        <span className="ml-1.5 opacity-70 text-[10px]">
                          {st === 'all'
                            ? totalCount
                            : st === 'pending'
                            ? pendingCount
                            : st === 'approved'
                            ? approvedCount
                            : st === 'completed'
                            ? completedCount
                            : cancelledCount}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Service Dropdown */}
                  {uniqueServices.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Service:</span>
                      <select
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="py-1 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#00A8AD]"
                      >
                        <option value="all">All Services</option>
                        {uniqueServices.map((srv) => (
                          <option key={srv} value={srv}>
                            {srv}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Feedback Notification Banner */}
              {successNotification && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span>{successNotification}</span>
                  </div>
                  <button
                    onClick={() => setSuccessNotification(null)}
                    className="text-emerald-800 hover:text-emerald-950 text-xs font-black underline cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Bookings List */}
              <div className="space-y-3">
                {isLoadingBookings ? (
                  <div className="py-16 text-center text-slate-500 space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#00A8AD] mx-auto" />
                    <p className="text-sm font-semibold">Fetching website bookings from database...</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="py-14 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3 p-6">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                      {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all'
                        ? 'No bookings match your selected filter or search query.'
                        : 'No bookings received yet.'}
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All booking submissions from the website forms will automatically appear in this list.
                    </p>
                    {(searchTerm || statusFilter !== 'all' || serviceFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setServiceFilter('all');
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#063F4D] hover:bg-slate-100 cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredBookings.map((b) => {
                    const isPending = b.status === 'pending';
                    const isApproved = b.status === 'approved' || b.status === 'confirmed';

                    return (
                      <div
                        key={b.id}
                        className={`p-4 sm:p-5 rounded-2xl bg-white shadow-xs transition-all space-y-4 text-left border ${
                          isPending
                            ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                            : isApproved
                            ? 'border-emerald-300 ring-1 ring-emerald-100 bg-emerald-50/10'
                            : 'border-slate-200 hover:border-[#00A8AD]/40'
                        }`}
                      >
                        {/* Booking Top Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-xs font-bold bg-slate-100 text-[#063F4D] px-2.5 py-1 rounded-lg">
                              {b.id}
                            </span>
                            <span className="text-xs text-slate-500">
                              Booked: {new Date(b.createdAt).toLocaleDateString()} at{' '}
                              {new Date(b.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#BFEDEE]/50 text-[#063F4D] text-[11px] font-extrabold">
                              {b.propertyType || 'Residential'}
                            </span>

                            {isPending && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                <Clock3 className="w-3 h-3" />
                                <span>Awaiting Approval</span>
                              </span>
                            )}

                            {isApproved && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Approved</span>
                              </span>
                            )}
                          </div>

                          {/* Top Quick Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* APPROVE BUTTON (prominent for pending) */}
                            {isPending && (
                              <button
                                onClick={() => handleApproveBooking(b)}
                                disabled={isApproving && statusUpdatingId === b.id}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                title="Approve booking and sync status to Supabase"
                              >
                                {isApproving && statusUpdatingId === b.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Approve Booking</span>
                              </button>
                            )}

                            {/* View Confirmation Email for approved bookings */}
                            {isApproved && (
                              <>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black tracking-wide">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Approved</span>
                                </span>
                                <button
                                  onClick={() => handleViewConfirmationEmail(b)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="View official consumer confirmation email prepared for this booking"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>View Email</span>
                                </button>
                                <button
                                  onClick={() => {
                                    closeAdminPanel();
                                    navigate(`/booking-confirmation/${b.id}`);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Close Admin Panel and show the consumer booking view"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Show Consumer Booking</span>
                                </button>
                              </>
                            )}

                            {/* Status Select Dropdown */}
                            <div className="relative">
                              <select
                                value={b.status === 'confirmed' ? 'approved' : b.status}
                                disabled={statusUpdatingId === b.id}
                                onChange={(e) =>
                                  handleStatusChange(b.id!, e.target.value as BookingStatus)
                                }
                                className={`text-xs font-bold px-3 py-1.5 pr-8 rounded-xl border focus:outline-none transition-all cursor-pointer ${
                                  b.status === 'approved' || b.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : b.status === 'completed'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : b.status === 'cancelled'
                                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-300'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>

                            {/* Delete action */}
                            {deleteConfirmId === b.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteBooking(b.id!)}
                                  className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(b.id!)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete booking"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Booking Main Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Customer Info */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Customer Details
                            </div>
                            <div className="font-extrabold text-[#063F4D] text-sm">
                              {b.customerName}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-[#00A8AD] shrink-0" />
                              <a
                                href={`tel:${b.customerPhone}`}
                                className="text-[#00A8AD] hover:underline font-bold"
                              >
                                {b.customerPhone || 'N/A'}
                              </a>
                            </div>
                            {b.customerEmail && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <a
                                  href={createMailto(b.customerEmail) || undefined}
                                  className="text-slate-600 hover:underline truncate"
                                >
                                  {b.customerEmail}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Service & Slot */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Service & Schedule
                            </div>
                            <div className="font-bold text-[#063F4D]">
                              {b.serviceType}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-[#00A8AD] shrink-0" />
                              <span>
                                Date: <strong>{b.preferredDate || 'Earliest available'}</strong>
                              </span>
                            </div>
                            {b.preferredTimeSlot && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-[#00A8AD] shrink-0" />
                                <span>Slot: {b.preferredTimeSlot}</span>
                              </div>
                            )}
                          </div>

                          {/* Address & Notes */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Location & Instructions
                            </div>
                            <div className="flex items-start gap-2 text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-[#00A8AD] shrink-0 mt-0.5" />
                              <span className="leading-snug">
                                {b.address || 'Winnipeg, MB (To be confirmed)'}
                              </span>
                            </div>
                            {b.additionalNotes && (
                              <div className="p-2 rounded-xl bg-slate-50 text-slate-600 text-[11px] italic border border-slate-100">
                                "{b.additionalNotes}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Approval Status Footer Bar */}
                        {isPending && (
                          <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs bg-amber-50/70 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 sm:p-4 rounded-b-2xl">
                            <div className="flex items-center gap-2 text-amber-900 font-semibold">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                Notice: The customer was informed that this booking is pending your review. Approve to confirm slot.
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleApproveBooking(b)}
                                disabled={isApproving}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Booking</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(b.id!, 'cancelled')}
                                className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}

                        {isApproved && (
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                Approved by Admin{' '}
                                {b.approvedAt
                                  ? `on ${new Date(b.approvedAt).toLocaleDateString()}`
                                  : ''}
                              </span>
                            </div>
                            <div className="text-slate-600">
                              Official Confirmation:{' '}
                              <strong>
                                {b.customerEmail
                                  ? `Ready for ${b.customerEmail}`
                                  : 'Phone dispatch verified'}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
          <div>
            Authorized dispatch email: <strong>{(adminUser?.email || '')}</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Live Operations Database Connected
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. OFFICIAL CONSUMER CONFIRMATION EMAIL MODAL                */}
      {/* ============================================================ */}
      {selectedBookingForApproval && approvalEmailData && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-[#063F4D]">
                  Booking Approved & Confirmed!
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedBookingForApproval(null);
                  setApprovalEmailData(null);
                  setCopiedEmail(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Consumer Official Confirmation Notice</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Booking <strong>{selectedBookingForApproval.id}</strong> has been marked as{' '}
                <strong className="uppercase">CONFIRMED</strong> by administrator ({(adminUser?.email || '')}).
                The official confirmation message below is ready to be sent to{' '}
                <strong>{approvalEmailData.to || selectedBookingForApproval.customerPhone}</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1">
                <div>
                  <strong>To:</strong> {approvalEmailData.to || 'Customer phone dispatch'}
                </div>
                <div className="font-semibold text-slate-500">
                  Ref: {selectedBookingForApproval.id?.slice(0, 8)}
                </div>
              </div>
              <div className="text-xs text-slate-700 font-bold bg-slate-100 px-3 py-1.5 rounded-lg">
                Subject: {approvalEmailData.subject}
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                {approvalEmailData.body}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 flex-wrap">
              <button
                onClick={() => {
                  const targetId = selectedBookingForApproval.id;
                  setSelectedBookingForApproval(null);
                  setApprovalEmailData(null);
                  setCopiedEmail(false);
                  closeAdminPanel();
                  if (targetId) {
                    navigate(`/booking-confirmation/${targetId}`);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                title="Exit admin and view official consumer confirmation view"
              >
                <Eye className="w-4 h-4" />
                <span>Show Consumer Booking</span>
              </button>

              {approvalEmailData.mailtoUrl && (
                <a
                  href={approvalEmailData.mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Email App</span>
                </a>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Subject: ${approvalEmailData.subject}\n\n${approvalEmailData.body}`
                  );
                  setCopiedEmail(true);
                  setTimeout(() => setCopiedEmail(false), 2500);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedEmail ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedBookingForApproval(null);
                  setApprovalEmailData(null);
                  setCopiedEmail(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. REAL-TIME NOTIFICATIONS CENTER MODAL                     */}
      {/* ============================================================ */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 text-[#063F4D]">
                <Bell className="w-5 h-5 text-[#00A8AD]" />
                <h3 className="font-extrabold text-base">
                  Dispatch Notifications Center
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playNotificationChime()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Test Notification Sound Chime"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F8F8] border border-slate-200 text-xs text-slate-600 flex items-center justify-between shrink-0">
              <span>Admin alerts are automatically logged whenever a user books a service.</span>
              <button
                onClick={() => {
                  markAllNotificationsAsRead();
                  refreshNotificationsState();
                }}
                className="text-xs text-[#00A8AD] hover:underline font-bold whitespace-nowrap ml-2 cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">No notifications yet. New booking alerts will appear here.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border text-xs transition-all space-y-2 ${
                      notif.status === 'pending'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            notif.status === 'pending'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`}
                        ></span>
                        <span className="font-extrabold text-[#063F4D]">
                          {notif.customerName}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {notif.bookingId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-slate-600 space-y-0.5">
                      <div>
                        <strong>Service:</strong> {notif.serviceType}
                      </div>
                      <div>
                        <strong>Phone:</strong> {notif.customerPhone} {notif.customerEmail ? `(${notif.customerEmail})` : ''}
                      </div>
                      <div>
                        <strong>Date:</strong> {notif.preferredDate || 'Earliest available'} ({notif.preferredTimeSlot || 'Standard'})
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            notif.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {notif.status === 'pending' ? 'Pending Approval' : 'Approved'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                            refreshNotificationsState();
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {notif.status === 'pending' && (
                        <button
                          onClick={() => {
                            setShowNotificationsModal(false);
                            setStatusFilter('pending');
                            setSearchTerm(notif.bookingId);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#00A8AD] text-white text-[11px] font-bold hover:bg-[#063F4D] transition-colors cursor-pointer"
                        >
                          Review & Approve →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. EMAIL DISPATCH AUDIT LOGS MODAL                          */}
      {/* ============================================================ */}
      {showMailLogsModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 text-[#063F4D]">
                <Mail className="w-5 h-5 text-[#00A8AD]" />
                <h3 className="font-extrabold text-base">
                  Outbound Email Dispatch Log
                </h3>
              </div>
              <button
                onClick={() => setShowMailLogsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 shrink-0">
              Tracks all notifications routed to <strong>{(adminUser?.email || '')}</strong> and confirmation notices prepared for consumers upon administrator approval.
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {mailLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Mail className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">No email dispatch logs recorded yet.</p>
                </div>
              ) : (
                mailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          log.type === 'admin_new_booking_alert'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.type === 'admin_new_booking_alert'
                          ? 'Admin Booking Alert'
                          : 'Consumer Booking Confirmed'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-bold text-[#063F4D]">
                      To: {log.recipient}
                    </div>
                    <div className="text-slate-600">
                      <strong>Subject:</strong> {log.subject}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
