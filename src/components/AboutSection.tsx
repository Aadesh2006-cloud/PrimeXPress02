import React from 'react';
import { Sparkles, CheckCircle2, Shield, Award, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';

interface AboutSectionProps {
  onOpenQuoteModal: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenQuoteModal }) => {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Content Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
              ABOUT OUR COMPANY
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight leading-[1.18]">
              Your Local Cleaning Professionals
            </h2>

            {/* Prominent Brand Tagline Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#063F4D] to-[#00A8AD] text-white shadow-md">
              <div className="text-[11px] font-bold text-[#BFEDEE] tracking-widest uppercase">
                COMPANY MISSION & PROMISE
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-wider uppercase mt-1">
                {COMPANY_INFO.tagline}
              </div>
            </div>

            <div className="space-y-4 text-base text-[#17343A]/85 leading-relaxed font-normal">
              <p>
                Prime X-Press Cleaning Inc. is a Winnipeg-based cleaning company providing air duct, carpet and window cleaning services for residential and commercial properties.
              </p>
              <p>
                Our goal is simple — help our customers maintain cleaner, fresher and healthier spaces through dependable professional cleaning.
              </p>
              <p>
                We proudly serve Winnipeg and surrounding areas and aim to make booking professional cleaning straightforward and convenient.
              </p>
            </div>

            {/* Credibility bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#063F4D]">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Winnipeg Owned & Operated</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#063F4D]">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>High-Powered Truck-Mounted & Portable Units</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#063F4D]">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Honest, Transparent Estimates</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#063F4D]">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Respect for Your Property</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenQuoteModal}
                className="px-6 py-3.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-sm shadow-md transition-all"
              >
                Work With Our Team
              </button>
              <a
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#063F4D] hover:text-[#00A8AD] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#00A8AD]" />
                <span>Direct: {COMPANY_INFO.primaryPhone}</span>
              </a>
            </div>
          </div>

          {/* Visual Team / Equipment Image Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1200&auto=format&fit=crop"
                alt="Professional cleaning equipment and team van setup"
                referrerPolicy="no-referrer"
                className="w-full h-[440px] sm:h-[500px] object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063F4D]/85 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#BFEDEE]">
                  COMMITTED TO MANITOBA EXCELLENCE
                </span>
                <h4 className="text-xl font-bold">
                  Quality Equipment, Thorough Procedures
                </h4>
                <p className="text-xs text-slate-200">
                  We use commercial-grade HEPA filtration vacuuming, powerful rotary duct whips, and hot water extraction systems that penetrate deep without harsh chemical fumes.
                </p>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-[#BFEDEE]/40 rounded-3xl -z-0" />
            <div className="absolute -top-6 -right-6 w-48 h-48 bg-[#063F4D]/10 rounded-3xl -z-0" />
          </div>
        </div>
      </div>
    </section>
  );
};
