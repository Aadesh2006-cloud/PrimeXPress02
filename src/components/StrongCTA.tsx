import React from 'react';
import { Phone, Sparkles, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';

interface StrongCTAProps {
  onOpenQuoteModal: () => void;
}

export const StrongCTA: React.FC<StrongCTAProps> = ({ onOpenQuoteModal }) => {
  return (
    <section className="py-20 lg:py-24 relative overflow-hidden bg-gradient-to-r from-[#063F4D] via-[#084958] to-[#00A8AD] text-white">
      {/* Decorative background lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#BFEDEE]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#BFEDEE] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE]" />
          <span>Quick Same-Week Scheduling In Winnipeg</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
          Ready for a Cleaner, Fresher Space?
        </h2>

        <p className="text-base sm:text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed font-normal">
          Tell us what you need cleaned and we'll help you arrange the right service for your property.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            id="strong-cta-quote-btn"
            onClick={onOpenQuoteModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#063F4D] font-extrabold text-base shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <span>BOOK NOW</span>
            <ArrowRight className="w-5 h-5 text-[#00A8AD]" />
          </button>

          <a
            id="strong-cta-call-btn"
            href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#063F4D]/80 hover:bg-[#063F4D] text-white font-extrabold text-base border border-white/20 hover:border-white/40 shadow-xl transition-all duration-200"
          >
            <Phone className="w-5 h-5 text-[#BFEDEE]" />
            <span>CALL {COMPANY_INFO.primaryPhone}</span>
          </a>
        </div>

        {/* Secondary text */}
        <div className="pt-2 flex items-center justify-center gap-2 text-sm text-[#BFEDEE] font-semibold">
          <MapPin className="w-4 h-4 text-[#BFEDEE]" />
          <span>Serving Winnipeg & Surrounding Areas</span>
        </div>
      </div>
    </section>
  );
};
