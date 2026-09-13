import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Home as HomeIcon, 
  Sparkles, 
  Wind, 
  Maximize2, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Clock 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface ResidentialCleaningPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const ResidentialCleaningPage: React.FC<ResidentialCleaningPageProps> = ({ onOpenQuoteModal }) => {
  const packages = [
    {
      title: 'Move-In / Move-Out Fresh Start',
      tag: 'New Homeowners & Tenants',
      desc: 'Ensure your new home is truly pristine before unpacking furniture, or leave your previous rental spotless to secure your full security deposit.',
      includes: [
        'Furnace duct & vent sanitization',
        'Deep carpet hot-water extraction throughout all bedrooms & stairs',
        'Full interior & exterior window washing',
        'Baseboard and entryway surface detailing',
      ],
      idealFor: 'Possession dates, tenancy turnovers, real estate showings',
    },
    {
      title: 'Manitoba Spring Clean & Air Refresh',
      tag: 'Seasonal Rejuvenation',
      desc: 'Purge the months of winter dust, salt, pet fur, and furnace residue after Winnipeg’s cold season.',
      includes: [
        'Complete supply & return air duct clearing',
        'Deep living room, hallway & bedroom carpet steam cleaning',
        'Winter mineral deposit removal from exterior glass',
        'Window sill and screen wash',
      ],
      idealFor: 'March through June annual home refresh',
    },
    {
      title: 'Post-Renovation Clean',
      tag: 'After Construction & Remodels',
      desc: 'Eliminate fine airborne drywall dust and sawdust that sneaks into vents and carpets during renovations.',
      includes: [
        'Rotary agitation brush through every duct run',
        'HEPA negative air vacuuming to protect new finishes',
        'Intensive carpet extraction and spot treatment',
        'Glass, mirror, and window frame detailing',
      ],
      idealFor: 'Basement finishing, kitchen/bath remodels, flooring updates',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs
        items={[
          { label: 'Services', to: '/services' },
          { label: 'Residential Cleaning' },
        ]}
      />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1800&auto=format&fit=crop"
            alt="Residential cleaning Winnipeg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
              <HomeIcon className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>Winnipeg Residential Care</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Residential Cleaning for Winnipeg Homes
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
              Tailored cleaning packages for single-family houses, townhomes, and condominiums across Winnipeg. From individual services to whole-home refreshes, we take care of your living environment with pride.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onOpenQuoteModal('Residential Cleaning')}
                className="px-7 py-4 rounded-xl bg-[#00A8AD] hover:bg-[#008d91] text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BOOK RESIDENTIAL CLEANING</span>
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
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
            Popular Residential Service Packages
          </h2>
          <p className="text-sm text-slate-600">
            Combine services into a coordinated single-visit appointment for maximum convenience and cost savings.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-slate-200 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-[11px] font-extrabold uppercase tracking-wider">
                  {pkg.tag}
                </span>
                <h3 className="text-xl font-extrabold text-[#063F4D]">
                  {pkg.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pkg.desc}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Included in Package:
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {pkg.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onOpenQuoteModal(pkg.title)}
                  className="w-full py-3 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer text-center"
                >
                  Book This Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strong CTA */}
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal('Residential Cleaning')} />
    </div>
  );
};
