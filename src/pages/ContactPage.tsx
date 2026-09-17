import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Clock, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Database,
  Clock3,
  ArrowRight
} from 'lucide-react';
import { COMPANY_INFO, SERVICES_DATA } from '../data/cleaningData';
import { PropertyType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { saveBooking } from '../services/firestoreService';
import { calculateBookingAmount } from '../utils/bookingPricing';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();

  const [propertyType, setPropertyType] = useState<PropertyType>('Residential');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactDbId, setContactDbId] = useState<string | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  // Auto-connect with user Gmail if logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
    if (user?.displayName && user.displayName !== 'Consumer' && !fullName) {
      setFullName(user.displayName);
    }
  }, [user]);

  const toggleService = (title: string) => {
    if (selectedServices.includes(title)) {
      setSelectedServices(selectedServices.filter((s) => s !== title));
    } else {
      setSelectedServices([...selectedServices, title]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalEmail = (email || user?.email || '').trim().toLowerCase();
      const serviceStr = selectedServices.length > 0 ? selectedServices.join(', ') : 'Residential Air Duct Cleaning';
      const amount = calculateBookingAmount(serviceStr, propertyType);
      setCalculatedAmount(amount);

      const docId = await saveBooking({
        userId: user ? user.uid : undefined,
        customerName: fullName.trim(),
        customerEmail: finalEmail,
        customerPhone: phone.trim(),
        serviceType: serviceStr,
        propertyType: propertyType,
        address: address.trim(),
        preferredDate: preferredDate,
        estimatedPriceCAD: amount,
        additionalNotes: notes.trim(),
        status: 'pending',
      });
      setContactDbId(docId);
      setSubmitted(true);
      window.dispatchEvent(new CustomEvent('pxc-booking-updated'));
    } catch (err) {
      console.error('Error saving contact booking:', err);
      window.alert('Unable to submit your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Fast Winnipeg Response</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Contact Prime X-Press Cleaning
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Get in touch to book your cleaning appointment or call our local Winnipeg dispatch team directly. We are ready to assist you.
          </p>
        </div>
      </section>

      {/* Contact Info & Inquiry Form Grid */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-[#063F4D]">
                  Direct Dispatch Lines
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Speak directly with a Winnipeg cleaning coordinator.
                </p>
              </div>

              <div className="space-y-4">
                {/* Primary Phone */}
                <a
                  href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#F5F8F8] hover:bg-[#BFEDEE]/30 border border-slate-200 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00A8AD] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Primary Dispatch
                    </div>
                    <div className="text-lg font-extrabold text-[#063F4D] group-hover:text-[#00A8AD] transition-colors">
                      {COMPANY_INFO.primaryPhone}
                    </div>
                  </div>
                </a>

                {/* Secondary Phone */}
                <a
                  href={`tel:${COMPANY_INFO.secondaryPhoneRaw}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#F5F8F8] hover:bg-[#BFEDEE]/30 border border-slate-200 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#063F4D] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Secondary / Mobile Line
                    </div>
                    <div className="text-lg font-extrabold text-[#063F4D] group-hover:text-[#00A8AD] transition-colors">
                      {COMPANY_INFO.secondaryPhone}
                    </div>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href={COMPANY_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#F5F8F8] hover:bg-[#BFEDEE]/30 border border-slate-200 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#063F4D] to-[#00A8AD] text-white flex items-center justify-center shrink-0">
                    <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Instagram Portfolio & DMs
                    </div>
                    <div className="text-sm font-extrabold text-[#063F4D] group-hover:text-[#00A8AD] transition-colors">
                      {COMPANY_INFO.instagramHandle}
                    </div>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-[#00A8AD] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider">
                      Headquarters & Dispatch Zone
                    </div>
                    <div className="font-extrabold text-sm text-[#063F4D]">
                      {COMPANY_INFO.location}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Serving all perimeter neighborhoods & surrounding Manitoba communities.
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-[#00A8AD] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider">
                      Operating Hours
                    </div>
                    <div className="font-extrabold text-sm text-[#063F4D]">
                      Monday – Saturday: 8:00 AM – 10:00 PM
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Sunday: Special commercial & emergency appointments by request.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#BFEDEE] text-[#00A8AD] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      <Database className="w-3.5 h-3.5" />
                      <span>Logged to Winnipeg Dispatch Database</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#063F4D]">
                      Thank You, {fullName || 'Valued Customer'}!
                    </h3>
                  </div>
                  {contactDbId && (
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-100 py-1 px-3 rounded-lg inline-block">
                      Booking Reference: {contactDbId}
                    </div>
                  )}

                  {/* Amount of Booking */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-slate-800 max-w-md mx-auto flex items-center justify-between shadow-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Amount of Booking:
                    </span>
                    <span className="text-base font-extrabold text-emerald-800">
                      ${calculatedAmount.toFixed(2)} CAD
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your booking request has been received and securely stored in our cloud scheduling database. A representative will contact you shortly via <strong>{phone || 'your phone'}</strong> to confirm your scheduled appointment slot.
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to={contactDbId ? `/our-bookings?ref=${contactDbId}` : '/our-bookings'}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A8AD] text-white text-xs font-bold hover:bg-[#063F4D] shadow-sm transition-colors"
                    >
                      <Clock3 className="w-4 h-4 text-[#BFEDEE]" />
                      <span>Track Status on Our Bookings Page</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Book Another Service
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-[#063F4D]">
                      Book Your Cleaning Service
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Fill out the details below and specify your preferred date. We'll confirm your booking swiftly according to Canadian standards.
                    </p>
                  </div>

                  {/* Property Type Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Property Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Residential', 'Commercial'] as PropertyType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPropertyType(type)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            propertyType === type
                              ? 'bg-[#00A8AD] text-white border-[#00A8AD] shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {type} Property
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Services Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Services Needed (Select all that apply)
                    </label>
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {['Air Duct Cleaning', 'Carpet Cleaning', 'Window Cleaning'].map((service) => {
                        const isSelected = selectedServices.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#BFEDEE]/40 border-[#00A8AD] text-[#063F4D]'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{service}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Inputs */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. David Miller"
                        autoComplete="off"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="204-555-0199"
                        autoComplete="off"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Neighborhood / Street Area</label>
                      <input
                        type="text"
                        placeholder="e.g. River Heights, Tuxedo, St. Vital"
                        autoComplete="off"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Preferred Service Date</label>
                    <input
                      type="date"
                      autoComplete="off"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Additional Details & Special Requests</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your home size, pet stains, renovation dust, or preferred days of the week..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#00A8AD]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#00A8AD] hover:bg-[#008d91] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>BOOK APPOINTMENT NOW</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
