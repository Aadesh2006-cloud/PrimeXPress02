import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake, 
  Clock, 
  Droplet, 
  ChevronDown 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface CarpetCleaningPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const CarpetCleaningPage: React.FC<CarpetCleaningPageProps> = ({ onOpenQuoteModal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const carpetBenefits = [
    {
      title: 'Commercial Steam Hot Water Extraction',
      desc: 'Reaches the base of carpet pile where vacuums cannot penetrate, dislodging compacted sand, salt, and dirt tracked in from Winnipeg sidewalks.',
    },
    {
      title: 'Stubborn Spot & Stain Pre-Treatment',
      desc: 'Targeted spot cleaning for wine, coffee, pet accidents, mud, and everyday kitchen grease spills.',
    },
    {
      title: 'Pet Odor & Dander Neutralization',
      desc: 'Non-toxic, pet-safe deodorizing enzymes break down odor-causing bacteria rather than temporarily masking them.',
    },
    {
      title: 'High-Traffic Lane Rejuvenation',
      desc: 'Specialized fiber lifters restore matted carpet pile in hallways, stairs, and entryways to a soft, fluffy touch.',
    },
  ];

  const faqs = [
    {
      q: 'How long do carpets take to dry after steam cleaning?',
      a: 'With our high-powered commercial extraction equipment, moisture is removed during the cleaning cycle. Typical drying times range between 4 to 8 hours depending on airflow and humidity. You can walk on the carpet immediately with clean indoor socks or clean shoe covers.',
    },
    {
      q: 'Are your carpet cleaning formulas safe for babies and pets?',
      a: 'Yes, 100%. We utilize eco-friendly, phosphate-free cleaning agents that rinse out thoroughly, leaving zero sticky residue behind.',
    },
    {
      q: 'Can you remove pet stains and biological odors?',
      a: 'Yes! We apply specialized enzymatic pre-sprays that penetrate deep into the carpet padding to digest urine crystals and neutralize underlying odors.',
    },
    {
      q: 'Do I need to move heavy furniture before your arrival?',
      a: 'We ask that you clear smaller items, toys, and fragile electronics. Our technicians can clean around larger pieces or help shift light chairs and tables as needed.',
    },
    {
      q: 'Do you clean area rugs and stairs as well?',
      a: 'Yes, we clean carpeted staircases, hallway runners, synthetic area rugs, and commercial entrance mats.',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs
        items={[
          { label: 'Services', to: '/services' },
          { label: 'Carpet Cleaning' },
        ]}
      />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1800&auto=format&fit=crop"
            alt="Carpet cleaning in Winnipeg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Deep Steam Extraction Specialists</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Professional Carpet Cleaning in Winnipeg
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
              Restore the original warmth, comfort, and cleanliness of your carpets. Our high-temperature steam extraction dissolves ingrained grime, pet soils, and winter street salt safely.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onOpenQuoteModal('Carpet Cleaning')}
                className="px-7 py-4 rounded-xl bg-[#00A8AD] hover:bg-[#008d91] text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BOOK CARPET CLEANING NOW</span>
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
                <span>Deep Hot Water Extraction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Eco-Friendly & Pet-Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Fast 4–8 Hr Dry Times</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Why Our Carpet Cleaning Stands Apart
            </h2>
            <p className="text-sm text-slate-600">
              We treat carpet restoration as a precise science combining heat, agitation, and rapid vacuum extraction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {carpetBenefits.map((item, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-[#F5F8F8] border border-slate-200 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#BFEDEE] text-[#00A8AD] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
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

      {/* Canadian Standard Carpet Pricing Guide */}
      <section className="py-16 lg:py-20 bg-[#F5F8F8] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
              CANADIAN INDUSTRY BENCHMARKS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Transparent Carpet Cleaning Rates (CAD)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clean, upfront pricing based on room count. We use commercial hot-water extraction equipment with zero detergent residue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">2-Room Starter</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$129 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Standard Canadian residential base package. Ideal for apartments, condos, or living room + primary bedroom.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> 2 Standard Rooms (up to 200 sq ft each)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Pre-Spray Traffic Treatment</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> High-Heat Deep Steam Rinse</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Carpet Cleaning')}
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
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">3 to 4 Rooms</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$199 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Our most popular family home package across Winnipeg. Delivers thorough sanitization and deodorization.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 4 Living / Bedroom Areas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Heavy Traffic Lane Agitation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Fast Drying Fiber Grooming</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Carpet Cleaning')}
                className="mt-6 w-full py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center shadow-md"
              >
                Book This Package
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">Whole Home / 5+ Rooms</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$279 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Comprehensive floor restoration for larger family homes and multi-level residences in Winnipeg.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 5 Complete Rooms</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Deep Pet Soil Enzyme Pre-Wash</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Additional Rooms: $45 CAD each</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Carpet Cleaning')}
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
                <strong>Carpet Add-On Standards:</strong> Flight of Stairs ($45 CAD) • Connecting Hallway ($30 CAD) • Pet Odor Neutralizer ($40 CAD) • Scotchgard Protection ($35 CAD/room)
              </div>
            </div>
            <button
              onClick={() => onOpenQuoteModal('Carpet Cleaning')}
              className="px-4 py-2 rounded-xl bg-[#BFEDEE]/50 hover:bg-[#BFEDEE] text-[#063F4D] font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Book Add-On With Service
            </button>
          </div>
        </div>
      </section>

      {/* Carpet Cleaning FAQ */}
      <section className="py-16 lg:py-20 bg-[#F5F8F8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Frequently Asked Questions: Carpet Cleaning
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about our carpet cleaning process and care.
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
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal('Carpet Cleaning')} />
    </div>
  );
};
