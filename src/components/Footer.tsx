import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Phone, MapPin, Instagram, Mail, ArrowUp, ShieldCheck, Lock, Bell } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadNotificationCount } from '../services/notificationService';

interface FooterProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuoteModal }) => {
  const { openAdminPanel, isAdmin } = useAuth();
  const [pendingNotifsCount, setPendingNotifsCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      setPendingNotifsCount(getUnreadNotificationCount());
    };
    updateCount();
    window.addEventListener('pxc-notifications-updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('pxc-notifications-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#063F4D] text-white pt-16 pb-24 lg:pb-12 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#00A8AD] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <div className="relative">
                  <Home className="w-5 h-5" />
                  <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE] absolute -top-1.5 -right-1.5" />
                </div>
              </div>
              <div>
                <div className="font-extrabold tracking-tight text-lg text-white">
                  PRIME X-PRESS
                </div>
                <div className="text-[11px] font-semibold text-[#BFEDEE] tracking-wider uppercase">
                  CLEANING INC.
                </div>
              </div>
            </Link>

            <p className="text-sm text-slate-300 max-w-sm leading-relaxed font-normal">
              Professional residential and commercial cleaning company based in Winnipeg, Manitoba. Dedicated to fresher air, deeper carpet restoration, and streak-free windows.
            </p>

            <div className="text-xs font-bold text-[#BFEDEE] tracking-wider uppercase py-2 px-3.5 rounded-xl bg-white/5 border border-white/10 inline-block">
              Tagline: “{COMPANY_INFO.tagline}”
            </div>
          </div>

          {/* Services Col */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-xs font-bold tracking-widest text-[#BFEDEE] uppercase">
              OUR SERVICES
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/services/air-duct-cleaning"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Air Duct Cleaning
                </Link>
              </li>
              <li>
                <Link
                  to="/services/carpet-cleaning"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Carpet Cleaning
                </Link>
              </li>
              <li>
                <Link
                  to="/services/window-cleaning"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Window Cleaning
                </Link>
              </li>
              <li>
                <Link
                  to="/services/residential"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Residential Cleaning
                </Link>
              </li>
              <li>
                <Link
                  to="/services/commercial"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Commercial Cleaning
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-[#00A8AD] hover:text-[#BFEDEE] font-semibold transition-colors"
                >
                  View All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Col */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-xs font-bold tracking-widest text-[#BFEDEE] uppercase">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/why-choose-us" className="text-slate-300 hover:text-white transition-colors">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link to="/our-work" className="text-slate-300 hover:text-white transition-colors">
                  Our Work Gallery
                </Link>
              </li>
              <li>
                <Link to="/service-area" className="text-slate-300 hover:text-white transition-colors">
                  Winnipeg Service Area
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact & Bookings
                </Link>
              </li>
              <li>
                <Link to="/our-bookings" className="text-[#BFEDEE] hover:text-white font-semibold transition-colors flex items-center gap-1.5">
                  <span>Track Booking Status</span>
                  <span className="text-[9px] bg-[#00A8AD] text-white px-1.5 py-0.2 rounded font-bold">LIVE</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-white/10">
                <button
                  id="footer-admin-panel-link"
                  onClick={openAdminPanel}
                  className="text-[#BFEDEE] hover:text-white font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Prime X-Press Dispatch Admin Login"
                >
                  <Lock className="w-3 h-3 text-[#00A8AD]" />
                  <span>Admin Panel</span>
                  {pendingNotifsCount > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#063F4D] text-[10px] font-black animate-pulse flex items-center gap-1">
                      <Bell className="w-2.5 h-2.5" />
                      {pendingNotifsCount} PENDING
                    </span>
                  ) : isAdmin ? (
                    <span className="text-[9px] bg-amber-400 text-[#063F4D] px-1 py-0.2 rounded font-black">
                      ACTIVE
                    </span>
                  ) : null}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-xs font-bold tracking-widest text-[#BFEDEE] uppercase">
              WINNIPEG DISPATCH
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00A8AD] shrink-0 mt-1" />
                <span>{COMPANY_INFO.location}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <a href={`tel:${COMPANY_INFO.primaryPhoneRaw}`} className="hover:text-white transition-colors font-bold text-white">
                  {COMPANY_INFO.primaryPhone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <a href={`tel:${COMPANY_INFO.secondaryPhoneRaw}`} className="hover:text-white transition-colors">
                  {COMPANY_INFO.secondaryPhone}
                </a>
              </div>

              {/* Instagram link button */}
              <div className="pt-2">
                <a
                  href={COMPANY_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#BFEDEE] hover:text-white text-xs font-semibold transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#00A8AD]" />
                  <span>{COMPANY_INFO.instagramHandle}</span>
                </a>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onOpenQuoteModal()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00A8AD] hover:bg-white hover:text-[#063F4D] text-white font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Prime X-Press Cleaning Inc. All Rights Reserved.
          </div>

          <div className="flex items-center gap-4">
            {/* The single site-wide Admin Access Button */}
            <button
              id="footer-admin-panel-btn"
              onClick={openAdminPanel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
              title="Prime X-Press Admin Login & Dispatch Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Admin Login</span>
              {pendingNotifsCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#063F4D] text-[10px] font-black animate-pulse flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5" />
                  {pendingNotifsCount} PENDING
                </span>
              ) : isAdmin ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ) : null}
            </button>

            <span>Winnipeg, MB</span>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
