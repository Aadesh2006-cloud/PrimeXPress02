import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, Send, CheckCircle, Sparkles, MapPin, Database, Check, Clock3, Mail, ShieldAlert, ArrowRight, FileCheck2 } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { PropertyType, ServiceType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { saveBooking } from '../services/firestoreService';
import { calculateBookingAmount } from '../utils/bookingPricing';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, defaultService }) => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Residential');
  const [selectedService, setSelectedService] = useState<string>(
    defaultService || ''
  );
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingDbId, setBookingDbId] = useState<string | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  // Initialize fields when modal opens, linking to user Gmail if logged in
  useEffect(() => {
    if (isOpen) {
      setFullName(user?.displayName && user.displayName !== 'Consumer' ? user.displayName : '');
      setPhone('');
      setEmail(user?.email || '');
      setPropertyType('Residential');
      setSelectedService(defaultService || '');
      setPreferredTimeSlot('');
      setAddress('');
      setPreferredDate('');
      setNotes('');
      setSubmitted(false);
      setBookingDbId(null);
      setCalculatedAmount(calculateBookingAmount(defaultService || 'Residential Air Duct Cleaning', 'Residential'));
    }
  }, [isOpen, defaultService, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalEmail = (email || user?.email || '').trim().toLowerCase();
      const amount = calculateBookingAmount(selectedService, propertyType);
      setCalculatedAmount(amount);

      const docId = await saveBooking({
        userId: user ? user.uid : undefined,
        customerName: fullName.trim(),
        customerEmail: finalEmail,
        customerPhone: phone.trim(),
        serviceType: selectedService,
        propertyType: propertyType,
        address: address.trim(),
        preferredDate: preferredDate,
        preferredTimeSlot: preferredTimeSlot,
        estimatedPriceCAD: amount,
        additionalNotes: notes.trim(),
        status: 'pending',
      });
      setBookingDbId(docId);
      setSubmitted(true);

      // Dispatch event to instantly sync OurBookingsPage
      window.dispatchEvent(new CustomEvent('pxc-booking-updated'));
    } catch (error) {
      console.error('Error saving booking to Supabase:', error);
      window.alert('Unable to submit your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleResetAndClose = () => {
    setSubmitted(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPreferredDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#063F4D]/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-[#063F4D] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Clock3 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                <Clock3 className="w-3.5 h-3.5" />
                <span>Status: Awaiting Administrator Approval</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#063F4D]">
                Booking Request Forwarded to Dispatch!
              </h3>
            </div>
            {bookingDbId && (
              <p className="text-[11px] font-mono text-slate-500 bg-slate-100 py-1 px-3 rounded-lg inline-block">
                Reference ID: {bookingDbId}
              </p>
            )}

            {/* Amount of booking */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-slate-800 max-w-sm mx-auto flex items-center justify-between shadow-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Amount of Booking:
              </span>
              <span className="text-base font-extrabold text-emerald-800">
                ${calculatedAmount.toFixed(2)} CAD
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 text-xs text-slate-700 max-w-sm mx-auto text-left space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#00A8AD] shrink-0 mt-0.5" />
                <div>
                  <strong>Notification Dispatched:</strong> An alert has been routed to our dispatch administrator at <strong>primexpress33@gmail.com</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Admin Approval Required:</strong> Your booking is NOT confirmed yet. Our administrator will review our truck schedules and approve your booking. Once approved, you will receive an official confirmation email.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Selected: <strong>{selectedService}</strong> • Preferred: <strong>{preferredTimeSlot}</strong>
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => {
                  handleResetAndClose();
                  navigate(bookingDbId ? `/booking-confirmation?id=${bookingDbId}` : '/booking-confirmation');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-white" />
                <span>View Confirmation Page</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                onClick={() => {
                  handleResetAndClose();
                  navigate(bookingDbId ? `/our-bookings?ref=${bookingDbId}` : '/our-bookings');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Clock3 className="w-3.5 h-3.5 text-[#BFEDEE]" />
                <span>Track on Our Bookings</span>
              </button>

              <a
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs shadow-md transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: {COMPANY_INFO.primaryPhone}</span>
              </a>
            </div>
            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="text-xs font-semibold text-slate-500 hover:text-[#063F4D] cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00A8AD]" />
                <span>Direct Winnipeg Booking</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#063F4D]">
                Book Your Cleaning Service
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Air Duct (from $279 CAD) • Carpet (from $129 CAD) • Windows (from $149 CAD)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="204-555-0199"
                    autoComplete="off"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] text-sm outline-none cursor-pointer"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                    Primary Service *
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] text-sm outline-none cursor-pointer"
                  >
                    <option value="">Select Service...</option>
                    <option value="Air Duct Cleaning">Air Duct Cleaning (from $279 CAD)</option>
                    <option value="Carpet Cleaning">Carpet Cleaning (from $129 CAD)</option>
                    <option value="Window Cleaning">Window Cleaning (from $149 CAD)</option>
                    <option value="Multiple Services">Multiple / Whole Home Bundle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                    Preferred Window
                  </label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none cursor-pointer"
                  >
                    <option value="">Select Window...</option>
                    <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                    <option value="Flexible / Any Time">Flexible / Any Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                  Winnipeg Neighborhood / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. River Heights, St. Vital, Tuxedo..."
                  autoComplete="off"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#063F4D] mb-1">
                  Brief Details / Property Scope (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Number of rooms, vents, or urgent scheduling needs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Processing booking request...</span>
                ) : (
                  <>
                    <span>BOOK NOW</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center text-xs text-slate-500">
                Prefer immediate booking by phone?{' '}
                <a
                  href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                  className="text-[#00A8AD] font-bold underline"
                >
                  Call {COMPANY_INFO.primaryPhone}
                </a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
