import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Maximize2, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  Sun, 
  ShieldCheck, 
  Building2, 
  Home as HomeIcon, 
  ChevronDown 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface WindowCleaningPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const WindowCleaningPage: React.FC<WindowCleaningPageProps> = ({ onOpenQuoteModal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const windowFeatures = [
    {
      title: 'Interior & Exterior Panes',
      desc: 'Complete dual-sided cleaning to maximize the flow of natural daylight into your home or commercial office.',
    },
    {
      title: 'Window Screens & Track Detailing',
      desc: 'We brush screen mesh and vacuum out accumulated dead bugs, pollen, and dust from window tracks and sills.',
    },
    {
      title: 'Streak-Free Hand Squeegee & Pure Water',
      desc: 'De-ionized pure water leaves zero spotty mineral deposits, allowing windows to dry completely clear.',
    },
    {
      title: 'Multi-Story Residential & Storefront Reach',
      desc: 'Equipped with water-fed extension poles and safety equipment to reach second and third-story architectural glass safely.',
    },
  ];

  const faqs = [
    {
      q: 'Do you clean both inside and outside windows?',
      a: 'Yes, we offer complete interior and exterior window cleaning. You can also request exterior-only or interior-only services depending on your preference.',
    },
    {
      q: 'Are screens and tracks included?',
      a: 'Yes, our standard full-service package includes basic screen brushing and wiping down of window sills and reachable tracks.',
    },
    {
      q: 'What happens if it rains on the day of my appointment?',
      a: 'Light rain does not actually dirty clean windows (dirt is caused by dust on dirty windows mixing with water). However, in cases of severe storms or high winds, we will contact you to reschedule to the next available dry day without any penalty.',
    },
    {
      q: 'Can you clean high 2-story windows safely?',
      a: 'Yes! We use carbon-fiber water-fed poles and specialized window cleaning safety gear to reach high windows without risking property damage.',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs
        items={[
          { label: 'Services', to: '/services' },
          { label: 'Window Cleaning' },
        ]}
      />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1800&auto=format&fit=crop"
            alt="Window cleaning in Winnipeg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
              <Maximize2 className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Crystal Clear Glass Specialists</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Streak-Free Window Cleaning in Winnipeg
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
              Transform your property with crystal-clear clarity. We clean residential and commercial windows, tracks, screens, and sills throughout Winnipeg and surrounding areas.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onOpenQuoteModal('Window Cleaning')}
                className="px-7 py-4 rounded-xl bg-[#00A8AD] hover:bg-[#008d91] text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BOOK WINDOW CLEANING NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4 text-[#BFEDEE]" />
                <span>Call {COMPANY_INFO.primaryPhone}</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Interior & Exterior Glass</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Tracks, Sills & Screens</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Spotless Pure Water Rinse</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Include */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Complete Window Care for Your Property
            </h2>
            <p className="text-sm text-slate-600">
              We pay meticulous attention to the edges, frames, and hardware that ordinary quick-washes miss.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {windowFeatures.map((item, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-[#F5F8F8] border border-slate-200 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#BFEDEE] text-[#00A8AD] flex items-center justify-center font-bold">
                  <Sun className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#063F4D]">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Canadian Standard Window Pricing Guide */}
      <section className="py-16 lg:py-20 bg-[#F5F8F8] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
              CANADIAN INDUSTRY BENCHMARKS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Transparent Window Cleaning Rates (CAD)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clear per-pane pricing including interior and exterior glass with pure-water spotless rinse.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">Starter / Bungalow</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$149 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Standard Canadian residential base rate. Up to 10 standard exterior or interior/exterior window panes.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 10 Standard Window Panes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Exterior & Interior Glass Washing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Microfiber Sill & Frame Wipe Down</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Window Cleaning')}
                className="mt-6 w-full py-3 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Book This Package
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#00A8AD] shadow-lg relative flex flex-col justify-between">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#00A8AD] text-white text-[10px] font-extrabold tracking-wide uppercase">
                Most Popular
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">2-Storey Family Home</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$249 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Complete multi-story clarity across Winnipeg homes (Up to 20 window panes included).</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 20 Standard Window Panes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Pure-Water Water-Fed Pole System</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Upper-Storey Safely Reached</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Window Cleaning')}
                className="mt-6 w-full py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center shadow-md"
              >
                Book This Package
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">Executive Estate</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$349 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Comprehensive window cleaning package for large properties with up to 30 panes.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 30 Panes & Transoms</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Patio Slider Glass Included</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Extra Panes: $12 CAD each</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Window Cleaning')}
                className="mt-6 w-full py-3 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Book This Package
              </button>
            </div>
          </div>

          {/* Add-ons banner */}
          <div className="mt-8 max-w-5xl mx-auto p-4 rounded-2xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#00A8AD] shrink-0" />
              <div>
                <strong>Window Add-On Standards:</strong> Full Screen Detailing ($5 CAD/screen) • Deep Track Vacuuming & Scrubbing ($6 CAD/track) • Vintage Storm Window Care ($18 CAD/set)
              </div>
            </div>
            <button
              onClick={() => onOpenQuoteModal('Window Cleaning')}
              className="px-4 py-2 rounded-xl bg-[#BFEDEE]/50 hover:bg-[#BFEDEE] text-[#063F4D] font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Book Add-On With Service
            </button>
          </div>
        </div>
      </section>

      {/* Window Cleaning FAQ */}
      <section className="py-16 lg:py-20 bg-[#F5F8F8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Frequently Asked Questions: Window Cleaning
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers to your questions about our residential and commercial window washing.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#063F4D] hover:text-[#00A8AD] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#00A8AD] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal('Window Cleaning')} />
    </div>
  );
};
