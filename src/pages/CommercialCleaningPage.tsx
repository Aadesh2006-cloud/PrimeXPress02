import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Building2, 
  Sparkles, 
  Wind, 
  Maximize2, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Briefcase 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface CommercialCleaningPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const CommercialCleaningPage: React.FC<CommercialCleaningPageProps> = ({ onOpenQuoteModal }) => {
  const commercialSectors = [
    {
      title: 'Corporate Offices & Workspaces',
      desc: 'High-traffic commercial carpet cleaning, cubicle upholstery, clean indoor air ducts to reduce employee sick days, and spotless window clarity.',
    },
    {
      title: 'Retail Storefronts & Boutiques',
      desc: 'Immaculate street-facing glass windows and clean entrance carpets that create an exceptional first impression for shoppers.',
    },
    {
      title: 'Property Managers & Landlords',
      desc: 'Fast apartment and condominium turnover cleans between tenant lease dates, including carpet steam cleaning and HVAC sanitizing.',
    },
    {
      title: 'Medical Clinics & Salons',
      desc: 'Hygienic, chemical-safe cleaning maintaining superior indoor air quality and spotless reception waiting zones.',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs
        items={[
          { label: 'Services', to: '/services' },
          { label: 'Commercial Cleaning' },
        ]}
      />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1800&auto=format&fit=crop"
            alt="Commercial cleaning Winnipeg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Commercial & Facility Services</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Commercial Cleaning Services in Winnipeg
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
              Maintain a clean, professional, and healthy environment for your staff and clients. Flexible evening and weekend scheduling to ensure zero operational downtime.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onOpenQuoteModal('Commercial Cleaning')}
                className="px-7 py-4 rounded-xl bg-[#00A8AD] hover:bg-[#008d91] text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BOOK COMMERCIAL SERVICE</span>
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
                <span>Fully Insured & WCB Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Evening & Weekend Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Invoicing & Commercial Terms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Served */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
            Sectors We Service Across Winnipeg
          </h2>
          <p className="text-sm text-slate-600">
            Tailored cleaning protocols structured for the unique foot-traffic and hygiene demands of commercial facilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {commercialSectors.map((sector, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#BFEDEE]/50 text-[#00A8AD] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-[#063F4D]">
                {sector.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {sector.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Commercial Strong CTA */}
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal('Commercial Cleaning')} />
    </div>
  );
};
