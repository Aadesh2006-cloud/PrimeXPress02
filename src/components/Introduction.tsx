import React from 'react';
import { ArrowRight, CheckCircle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';

interface IntroductionProps {
  onOpenQuoteModal: () => void;
}

export const Introduction: React.FC<IntroductionProps> = ({ onOpenQuoteModal }) => {
  return (
    <section id="about-intro" className="py-20 lg:py-28 bg-[#F5F8F8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Column */}
          <div className="lg:col-span-6 relative">
            {/* Main clean image */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop"
                alt="Professional cleaner working inside modern Canadian home in Winnipeg"
                referrerPolicy="no-referrer"
                className="w-full h-[420px] sm:h-[480px] object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063F4D]/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8AD] text-white text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Winnipeg Certified Cleaning</span>
                </div>
                <h4 className="text-lg font-bold text-white leading-snug">
                  High-Grade Industrial Vacuums & Rotary Brushes
                </h4>
                <p className="text-xs text-slate-200 mt-1">
                  Tailored for Manitoba seasonal dust, pollen, and winter salt residue.
                </p>
              </div>
            </div>

            {/* Subtle background decorative shapes adhering to anti-slop */}
            <div className="absolute -top-6 -left-6 w-36 h-36 bg-[#BFEDEE]/40 rounded-3xl -z-0" />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#063F4D]/10 rounded-3xl -z-0" />

            {/* Floating Trust Pill */}
            <div className="absolute top-8 -right-4 sm:-right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3.5 z-20">
              <div className="w-11 h-11 rounded-xl bg-[#00A8AD]/15 flex items-center justify-center text-[#00A8AD]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#063F4D]">Insured & Reliable</div>
                <div className="text-[11px] text-slate-500 font-medium">Safe for families & pets</div>
              </div>
            </div>
          </div>

          {/* Copy Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>{COMPANY_INFO.name}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight leading-[1.18]">
              Cleaning That Goes Beyond the Surface
            </h2>

            <div className="space-y-4 text-base text-[#17343A]/85 leading-relaxed font-normal">
              <p className="font-semibold text-lg text-[#063F4D]">
                Your home or workplace deserves more than a quick clean.
              </p>
              <p>
                Prime X-Press Cleaning Inc. provides professional cleaning solutions designed to remove built-up dirt, dust, debris and everyday grime from some of the most important areas of your property.
              </p>
              <p>
                Whether you need your air ducts refreshed, carpets deep cleaned, or windows restored to a clear shine, our team provides dependable service throughout Winnipeg and surrounding communities.
              </p>
            </div>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                <CheckCircle className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Deep contaminant extraction</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                <CheckCircle className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Commercial & Residential</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                <CheckCircle className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Respectful & timely crews</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#063F4D]">
                <CheckCircle className="w-4 h-4 text-[#00A8AD] shrink-0" />
                <span>Clear upfront estimates</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                id="intro-quote-cta"
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-sm shadow-md transition-all duration-200 cursor-pointer group"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#00A8AD] hover:text-[#063F4D] transition-colors py-2"
              >
                <span>Or call {COMPANY_INFO.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
