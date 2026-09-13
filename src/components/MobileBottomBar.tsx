import React from 'react';
import { Phone, Sparkles } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';

interface MobileBottomBarProps {
  onOpenQuoteModal: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenQuoteModal }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 sm:hidden shadow-2xl">
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
        {/* Call Now button */}
        <a
          id="mobile-sticky-call-btn"
          href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
          className="flex items-center justify-center gap-1.5 h-11 rounded-xl bg-[#063F4D] text-white font-extrabold text-xs tracking-wide shadow-md active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-[#BFEDEE]" />
          <span>CALL US</span>
        </a>

        {/* Book Now button */}
        <button
          id="mobile-sticky-quote-btn"
          onClick={onOpenQuoteModal}
          className="flex items-center justify-center gap-1.5 h-11 rounded-xl bg-[#00A8AD] text-white font-extrabold text-xs tracking-wide shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#BFEDEE]" />
          <span>BOOK NOW</span>
        </button>
      </div>
    </div>
  );
};
