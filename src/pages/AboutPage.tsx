import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Home as HomeIcon, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Target 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface AboutPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenQuoteModal }) => {
  const values = [
    {
      title: 'Health-First Cleaning',
      desc: 'We focus on what you breathe and touch every day, removing microscopic particulate, dust mites, and chemical residues.',
    },
    {
      title: 'Honest Upfront Pricing',
      desc: 'No hidden surcharges or surprise trip fees. We provide clear, accurate quotes before any technician begins work.',
    },
    {
      title: 'Winnipeg Craftsmanship',
      desc: 'We are proud members of the local Manitoba community and treat each customer’s home with the respect of our own neighbors.',
    },
    {
      title: 'Dependability & Punctuality',
      desc: 'We arrive within scheduled time windows and communicate clearly throughout the entire cleaning process.',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
            <HomeIcon className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Local Manitoba Cleaning Company</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            About Prime X-Press Cleaning Inc.
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Dedicated to providing Winnipeg residents and commercial businesses with a cleaner, healthier, and more welcoming indoor environment.
          </p>

          <div className="inline-block p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#BFEDEE] font-bold text-sm">
            “{COMPANY_INFO.tagline}”
          </div>
        </div>
      </section>

      {/* Company Story & Mission */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">
              Our Journey & Commitment
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#063F4D] tracking-tight">
              A Company Built on Thoroughness & Reliability
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Prime X-Press Cleaning Inc. was founded in Winnipeg with a singular purpose: to deliver premium-grade cleaning services that go beyond surface dusting. In a city where indoor air recirculates heavily through long winters, the cleanliness of HVAC ducts, carpets, and windows directly influences health, comfort, and peace of mind.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Whether working in a single-family bungalow in St. Vital, an expansive residence in Tuxedo, or a downtown commercial office, our trained crew uses modern, high-grade equipment to get the job done right the first time.
            </p>

            <div className="p-4 rounded-2xl bg-[#BFEDEE]/30 border border-[#00A8AD]/30 text-xs text-[#063F4D] font-semibold">
              ✓ Fully insured & operating throughout Winnipeg & adjacent communities.
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop"
                alt="Professional team"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063F4D]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="text-xs font-bold text-[#BFEDEE] uppercase">Winnipeg, Manitoba</div>
                <div className="text-lg font-extrabold">Dedicated to Quality Craftsmanship</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Our Core Principles
            </h2>
            <p className="text-sm text-slate-600">
              How we approach every home, business, and service appointment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#F5F8F8] border border-slate-200 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#BFEDEE] text-[#00A8AD] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#063F4D]">
                  {v.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strong CTA */}
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal()} />
    </div>
  );
};
