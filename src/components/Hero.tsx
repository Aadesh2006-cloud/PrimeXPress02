import React from 'react';
import { Phone, CheckCircle2, Star, ArrowRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { COMPANY_INFO } from '../data/cleaningData';

interface HeroProps {
  onOpenQuoteModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuoteModal }) => {
  return (
    <section id="home" className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-[#063F4D]">
      {/* Background Image with optimized dark teal gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
          alt="Technician professionally cleaning inside modern Canadian home"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 scale-105 transform motion-safe:animate-subtle-zoom"
        />
        {/* Dark teal multi-stop overlay for crystal contrast and brand immersion */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#063F4D]/95 via-[#063F4D]/85 to-[#063F4D]/75" />
        <div className="absolute inset-0 bg-radial-at-t from-transparent via-[#063F4D]/40 to-[#063F4D]/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-8 space-y-7 text-left">
            {/* Location Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs sm:text-sm font-semibold backdrop-blur-md shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Proudly Serving Winnipeg & Surrounding Areas</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
            >
              A Cleaner Home.<br />
              <span className="text-[#00A8AD]">Fresher Air.</span><br />
              A <span className="text-[#BFEDEE]">Healthier Space.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl font-medium text-[#BFEDEE] max-w-2xl leading-relaxed"
            >
              Professional Air Duct, Carpet & Window Cleaning for Homes and Businesses Across Winnipeg.
            </motion.p>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-base text-slate-200 max-w-2xl leading-relaxed font-normal"
            >
              From deep carpet cleaning to cleaner air ducts and crystal-clear windows, Prime X-Press Cleaning helps keep your property fresh, comfortable and professionally maintained.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                id="hero-quote-cta-btn"
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#00A8AD] hover:bg-[#008d91] text-white font-bold text-base shadow-lg shadow-[#00A8AD]/30 hover:shadow-[#00A8AD]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <span>BOOK NOW</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                id="hero-phone-cta-btn"
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-base border border-white/20 hover:border-white/35 backdrop-blur-md transition-all duration-200"
              >
                <Phone className="w-5 h-5 text-[#BFEDEE] animate-bounce" />
                <span>CALL {COMPANY_INFO.primaryPhone}</span>
              </a>
            </motion.div>

            {/* Three Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3.5"
            >
              <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Residential & Commercial</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Winnipeg Local Service</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Professional Cleaning Equipment</span>
              </div>
            </motion.div>
          </div>

          {/* Right Floating Card / Visual */}
          <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              {/* Rating Visual */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-[#BFEDEE] mt-1 tracking-wide">
                    “Professional Cleaning in Winnipeg”
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#00A8AD]/30 flex items-center justify-center text-[#BFEDEE] border border-[#00A8AD]/40">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Core Services Quick Snapshot */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">Our Main Focus:</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <span className="font-semibold text-white">Air Duct Cleaning</span>
                    <span className="text-[#00A8AD] font-bold">HVAC Freshening</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <span className="font-semibold text-white">Carpet Cleaning</span>
                    <span className="text-[#00A8AD] font-bold">Deep Extraction</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <span className="font-semibold text-white">Window Cleaning</span>
                    <span className="text-[#00A8AD] font-bold">Streak-Free Clarity</span>
                  </div>
                </div>
              </div>

              {/* Tagline Badge */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#063F4D] to-[#00A8AD]/40 border border-[#00A8AD]/30 text-center">
                <div className="text-[11px] font-bold tracking-widest text-[#BFEDEE] uppercase">
                  PRIME X-PRESS MOTTO
                </div>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  {COMPANY_INFO.tagline}
                </div>
              </div>

              {/* Call prompt button */}
              <a
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                className="w-full block py-2.5 px-4 text-center rounded-xl bg-[#BFEDEE] hover:bg-white text-[#063F4D] font-extrabold text-xs transition-colors duration-200"
              >
                Direct Booking: {COMPANY_INFO.primaryPhone}
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
