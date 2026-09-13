import React from 'react';
import { Home, Building, CheckCircle2, ArrowRight } from 'lucide-react';

interface ResidentialCommercialProps {
  onSelectPropertyType: (type: 'Residential' | 'Commercial') => void;
}

export const ResidentialCommercial: React.FC<ResidentialCommercialProps> = ({ onSelectPropertyType }) => {
  return (
    <section className="py-20 lg:py-28 bg-[#F5F8F8] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
            TAILORED SOLUTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight">
            Residential & Commercial Cleaning Excellence
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Whether caring for your family home or maintaining high commercial standards for clients and staff.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: RESIDENTIAL */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop"
                  alt="Beautiful modern Canadian house interior"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#063F4D]/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/95 text-[#063F4D] text-xs font-extrabold flex items-center gap-2 shadow-sm">
                  <Home className="w-3.5 h-3.5 text-[#00A8AD]" />
                  <span>FOR HOMEOWNERS</span>
                </div>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    RESIDENTIAL CLEANING
                  </h3>
                </div>
              </div>

              <div className="p-8 space-y-5">
                <p className="text-base text-[#17343A]/85 leading-relaxed font-normal">
                  Helping Winnipeg homeowners maintain cleaner, fresher and more comfortable living spaces.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#063F4D]">
                    Available Residential Services:
                  </div>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                      <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                      <span>Carpet Cleaning</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                      <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                      <span>Air Duct Cleaning</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                      <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                      <span>Window Cleaning</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0">
              <button
                onClick={() => onSelectPropertyType('Residential')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors duration-200 cursor-pointer"
              >
                <span>Residential Services →</span>
              </button>
            </div>
          </div>

          {/* RIGHT: COMMERCIAL */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
                  alt="Modern office and commercial property"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#063F4D]/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/95 text-[#063F4D] text-xs font-extrabold flex items-center gap-2 shadow-sm">
                  <Building className="w-3.5 h-3.5 text-[#00A8AD]" />
                  <span>FOR BUSINESSES</span>
                </div>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    COMMERCIAL CLEANING
                  </h3>
                </div>
              </div>

              <div className="p-8 space-y-5">
                <p className="text-base text-[#17343A]/85 leading-relaxed font-normal">
                  Professional cleaning solutions for offices, commercial spaces and businesses throughout Winnipeg.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#063F4D]">
                    Available Commercial Services:
                  </div>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                      <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                      <span>Commercial Carpet Cleaning</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                      <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                      <span>Commercial Duct Cleaning</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                      <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                      <span>Commercial Window Cleaning</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0">
              <button
                onClick={() => onSelectPropertyType('Commercial')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors duration-200 cursor-pointer"
              >
                <span>Commercial Services →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
