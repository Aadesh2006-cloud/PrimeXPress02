import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BeforeAfterGallery } from '../components/BeforeAfterGallery';
import { Instagram, Sparkles, CheckCircle2, ArrowRight, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface OurWorkPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const OurWorkPage: React.FC<OurWorkPageProps> = ({ onOpenQuoteModal }) => {
  const recentCaseStudies = [
    {
      neighborhood: 'River Heights, Winnipeg',
      service: 'Air Duct Cleaning + Carpet Refresh',
      property: '1940s Character Two-Story Home',
      outcome: 'Eliminated 5+ years of accumulated dust in cold-air returns and lifted mud/salt marks from main hall wool-blend carpeting.',
    },
    {
      neighborhood: 'Tuxedo, Winnipeg',
      service: 'Complete Architectural Window Cleaning',
      property: 'Contemporary Multi-Level Residence',
      outcome: 'Washed 36 multi-pane living room picture windows, skylights, screens, and sills with spotless pure water rinse.',
    },
    {
      neighborhood: 'St. Vital, Winnipeg',
      service: 'Carpet Pet Stain & Odor Treatment',
      property: 'Family Bungalow with Two Dogs',
      outcome: 'Enzymatic sub-surface extraction restored heavy traffic family room carpets to original color and freshness.',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs items={[{ label: 'Our Work & Gallery' }]} />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Real Winnipeg Results</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Our Work: Real Transformations
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            See the difference professional cleaning makes. Explore our interactive before-and-after comparisons across air ducts, carpets, and windows throughout Winnipeg.
          </p>

          <div className="pt-2">
            <a
              href={COMPANY_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#BFEDEE] border border-white/20 text-xs font-bold transition-all shadow-md"
            >
              <Instagram className="w-4 h-4 text-[#00A8AD]" />
              <span>Follow Daily Jobs on Instagram: {COMPANY_INFO.instagramHandle}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Gallery Section */}
      <div className="py-8">
        <BeforeAfterGallery />
      </div>

      {/* Recent Case Highlights */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">
              Local Winnipeg Field Work
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Recent Job Highlights in Winnipeg
            </h2>
            <p className="text-sm text-slate-600">
              A snapshot of recent challenges solved for Winnipeg property owners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {recentCaseStudies.map((study, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-[#F5F8F8] border border-slate-200 space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#00A8AD]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{study.neighborhood}</span>
                </div>
                <h3 className="text-base font-extrabold text-[#063F4D]">
                  {study.service}
                </h3>
                <div className="text-xs text-slate-500 font-medium">
                  Property: {study.property}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-3">
                  {study.outcome}
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
