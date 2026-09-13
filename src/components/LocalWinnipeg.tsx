import React, { useState } from 'react';
import { MapPin, CheckCircle, Navigation, Phone, Sparkles } from 'lucide-react';
import { WINNIPEG_NEIGHBORHOODS, COMPANY_INFO } from '../data/cleaningData';

export const LocalWinnipeg: React.FC = () => {
  const [activeArea, setActiveArea] = useState<string>('River Heights');

  return (
    <section id="service-area" className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Text and SEO Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>LOCALLY SERVING MANITOBA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight leading-[1.18]">
              Professional Cleaning Services in Winnipeg
            </h2>

            <p className="text-base text-[#17343A]/85 leading-relaxed font-normal">
              Prime X-Press Cleaning Inc. proudly serves residential and commercial customers throughout Winnipeg, Manitoba and surrounding communities.
            </p>

            {/* Natural SEO paragraph formatted thoughtfully */}
            <div className="p-5 rounded-2xl bg-[#F5F8F8] border border-slate-200 text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                From seasonal heating turn-on to spring refreshes, our specialized crews deliver high-standard <strong className="text-[#063F4D] font-bold">Air Duct Cleaning Winnipeg</strong> homeowners trust to reduce dust and airborne allergens.
              </p>
              <p>
                Whether you need deep restoration with <strong className="text-[#063F4D] font-bold">Carpet Cleaning Winnipeg</strong>, streak-free clarity through <strong className="text-[#063F4D] font-bold">Window Cleaning Winnipeg</strong>, or scheduled <strong className="text-[#063F4D] font-bold">Commercial Cleaning Winnipeg</strong> contracts, our technicians are equipped for Manitoba homes and businesses.
              </p>
            </div>

            {/* Serving location badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#063F4D] text-white text-xs font-bold shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-[#00A8AD]" />
                  <span>Winnipeg, Manitoba</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BFEDEE]/50 text-[#063F4D] text-xs font-bold border border-[#00A8AD]/30">
                  <Navigation className="w-3.5 h-3.5 text-[#00A8AD]" />
                  <span>Winnipeg & Surrounding Areas</span>
                </div>
              </div>
            </div>

            {/* Quick dispatch phone bar */}
            <div className="pt-2 flex items-center gap-4">
              <a
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Winnipeg Dispatch: {COMPANY_INFO.primaryPhone}</span>
              </a>
            </div>
          </div>

          {/* Stylized Winnipeg Map & Area Graphic Column */}
          <div className="lg:col-span-6">
            <div className="bg-[#063F4D] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-200">
              {/* Background river aesthetic representation */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Stylized Red River & Assiniboine River junction (The Forks) */}
                  <path d="M 250 0 Q 240 180 250 250 T 260 500" stroke="#00A8AD" strokeWidth="24" strokeLinecap="round" />
                  <path d="M 0 240 Q 120 230 250 250" stroke="#BFEDEE" strokeWidth="18" strokeLinecap="round" />
                  <circle cx="250" cy="250" r="14" fill="#00A8AD" />
                </svg>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#BFEDEE] tracking-wider uppercase block">
                      GREATER WINNIPEG METRO AREA
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      Coverage Zones & Neighborhoods
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#00A8AD]/20 border border-[#00A8AD]/40 flex items-center justify-center text-[#BFEDEE]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                {/* Interactive Area Chips Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WINNIPEG_NEIGHBORHOODS.map((neighborhood) => {
                    const isSelected = activeArea === neighborhood;
                    return (
                      <button
                        key={neighborhood}
                        onClick={() => setActiveArea(neighborhood)}
                        className={`text-left text-xs font-semibold py-2 px-3 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#00A8AD] text-white shadow-md font-bold'
                            : 'bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white'
                        }`}
                      >
                        <MapPin className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'text-[#00A8AD]'}`} />
                        <span className="truncate">{neighborhood}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected area service promise card */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-300 block text-[11px]">Active Service Zone:</span>
                    <span className="font-extrabold text-[#BFEDEE] text-sm">{activeArea}, MB</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#00A8AD]/30 text-white font-bold border border-[#00A8AD]/40">
                    Daily Van Dispatch Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
