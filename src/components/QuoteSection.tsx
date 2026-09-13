import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Send, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  FileText, 
  AlertCircle,
  Database,
  Clock3,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';
import { COMPANY_INFO, WINNIPEG_NEIGHBORHOODS } from '../data/cleaningData';
import { PropertyType, ServiceType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { saveBooking } from '../services/firestoreService';

interface QuoteSectionProps {
  initialService?: string;
  initialPropertyType?: PropertyType;
}

export const QuoteSection: React.FC<QuoteSectionProps> = ({
  initialService,
  initialPropertyType = 'Residential',
}) => {
  const { user } = useAuth();

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>(initialPropertyType);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(
    initialService ? [initialService as ServiceType] : []
  );
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const availableServices: ServiceType[] = [
    'Air Duct Cleaning',
    'Carpet Cleaning',
    'Window Cleaning',
    'Multiple Services',
  ];

  const handleServiceToggle = (svc: ServiceType) => {
    if (svc === 'Multiple Services') {
      if (selectedServices.includes('Multiple Services')) {
        setSelectedServices(['Air Duct Cleaning']);
      } else {
        setSelectedServices([
          'Multiple Services',
          'Air Duct Cleaning',
          'Carpet Cleaning',
          'Window Cleaning',
        ]);
      }
      return;
    }

    if (selectedServices.includes(svc)) {
      const filtered = selectedServices.filter((s) => s !== svc && s !== 'Multiple Services');
      setSelectedServices(filtered.length > 0 ? filtered : ['Air Duct Cleaning']);
    } else {
      setSelectedServices([...selectedServices, svc]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const docId = await saveBooking({
        userId: user ? user.uid : undefined,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        serviceType: selectedServices.join(', '),
        propertyType: propertyType,
        address: address,
        preferredDate: preferredDate,
        preferredTimeSlot: timeSlot,
        additionalNotes: message,
        status: 'pending',
      });
      setBookingId(docId);
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving quote section booking:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#F5F8F8] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
            DIRECT ONLINE SCHEDULING • CANADIAN RATES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight">
            Book Your Cleaning Now
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Reserve your preferred date for professional air duct, carpet, or window cleaning in Winnipeg.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Main Booking Form Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
            {submitted ? (
                <div className="py-12 text-center space-y-5 animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Clock3 className="w-9 h-9" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                      <Clock3 className="w-3.5 h-3.5" />
                      <span>Status: Awaiting Administrator Approval</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
                      Booking Request Forwarded to Dispatch!
                    </h3>
                  </div>
                  {bookingId && (
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-100 py-1 px-3 rounded-lg inline-block">
                      Booking Reference: {bookingId}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 text-xs text-slate-700 max-w-md mx-auto text-left space-y-2">
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

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 max-w-md mx-auto text-left space-y-1">
                    <div><strong>Customer:</strong> {fullName}</div>
                    <div><strong>Phone:</strong> {phone}</div>
                    <div><strong>Email:</strong> {email}</div>
                    <div><strong>Service Requested:</strong> {selectedServices.join(', ')}</div>
                    <div><strong>Preferred Date:</strong> {preferredDate || 'Earliest Available'}</div>
                    <div><strong>Time Preference:</strong> {timeSlot}</div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to={bookingId ? `/booking-confirmation?id=${bookingId}` : '/booking-confirmation'}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <FileCheck2 className="w-4 h-4 text-white" />
                      <span>View Confirmation Page</span>
                    </Link>

                    <a
                      href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                      className="px-6 py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Need Immediate Same-Day Service? Call: {COMPANY_INFO.primaryPhone}
                    </a>

                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Book Another Service
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-left" autoComplete="off">
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        autoComplete="off"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 204-555-0199"
                        autoComplete="off"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Property Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. sarah@example.com"
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                        Property Type
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors cursor-pointer"
                      >
                        <option value="Residential">Residential (House, Condo, Townhome)</option>
                        <option value="Commercial">Commercial (Office, Retail, Facility)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Service Needed (Checkboxes) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D]">
                      Service Needed (Select all that apply):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {availableServices.map((svc) => {
                        const isChecked = selectedServices.includes(svc);
                        return (
                          <label
                            key={svc}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#BFEDEE]/30 border-[#00A8AD] text-[#063F4D] font-bold shadow-sm'
                                : 'bg-[#F5F8F8] border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleServiceToggle(svc)}
                              className="w-4 h-4 rounded text-[#00A8AD] accent-[#00A8AD] focus:ring-[#00A8AD]"
                            />
                            <span className="text-xs sm:text-sm">{svc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 4: Address/Area, Preferred Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                        Address / Winnipeg Area
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. River Heights, Tuxedo..."
                        autoComplete="off"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        autoComplete="off"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                        Time Slot
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors cursor-pointer"
                      >
                        <option value="">Select Time Slot...</option>
                        <option value="Morning (8:00 AM – 12:00 PM)">Morning (8:00 AM – 12:00 PM)</option>
                        <option value="Afternoon (12:00 PM – 4:00 PM)">Afternoon (12:00 PM – 4:00 PM)</option>
                        <option value="Late Afternoon (4:00 PM – 7:00 PM)">Late Afternoon (4:00 PM – 7:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#063F4D] mb-2">
                      Message / Property Specifics
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Approximate square footage, number of vents, pet stains, or specific requests..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F8F8] border border-slate-200 focus:border-[#00A8AD] focus:bg-white focus:outline-none text-sm text-[#17343A] transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      id="quote-form-submit-btn"
                      disabled={submitting}
                      className="w-full py-4 px-6 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-extrabold text-base shadow-lg shadow-[#00A8AD]/20 hover:shadow-[#063F4D]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <span>Processing your booking...</span>
                      ) : (
                        <>
                          <span>BOOK NOW</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-500 mt-3">
                      🔒 No payment required today. Rates adhere strictly to transparent Canadian standards (CAD).
                    </p>
                  </div>
                </form>
              )}
          </div>

          {/* Beside the form: Company Details as requested */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6">
              <div>
                <div className="text-[11px] font-bold text-[#00A8AD] uppercase tracking-widest">
                  DIRECT CONTACT
                </div>
                <h3 className="text-xl font-extrabold text-[#063F4D] mt-1">
                  {COMPANY_INFO.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {COMPANY_INFO.location}
                </p>
              </div>

              {/* Call prompt line */}
              <div className="p-4 rounded-2xl bg-[#BFEDEE]/30 border border-[#00A8AD]/30 text-xs font-semibold text-[#063F4D] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#00A8AD] shrink-0 mt-0.5" />
                <span>“Call today to discuss your cleaning needs.”</span>
              </div>

              {/* Phone Numbers */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Phone Numbers
                </div>
                <div className="space-y-2">
                  <a
                    href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F8F8] hover:bg-[#BFEDEE]/40 border border-slate-200 text-[#063F4D] font-bold text-sm transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#00A8AD] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-normal uppercase">Primary Line</span>
                      <span>{COMPANY_INFO.primaryPhone}</span>
                    </div>
                  </a>

                  <a
                    href={`tel:${COMPANY_INFO.secondaryPhoneRaw}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F8F8] hover:bg-[#BFEDEE]/40 border border-slate-200 text-[#063F4D] font-bold text-sm transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-normal uppercase">Secondary Line</span>
                      <span>{COMPANY_INFO.secondaryPhone}</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Instagram
                </div>
                <a
                  href={COMPANY_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 border border-rose-200/60 text-[#063F4D] font-bold text-xs hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-normal">Follow Our Work</span>
                    <span className="text-[#063F4D]">{COMPANY_INFO.instagramHandle}</span>
                  </div>
                </a>
              </div>

              {/* Business Hours */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#063F4D]">
                  <Clock className="w-3.5 h-3.5 text-[#00A8AD]" />
                  <span>Operating Hours</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {COMPANY_INFO.hours}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
