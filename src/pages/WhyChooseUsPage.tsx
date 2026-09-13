import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Wrench, 
  CalendarCheck, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  ArrowRight,
  Award
} from 'lucide-react';
import { COMPANY_INFO, WHY_CHOOSE_US } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface WhyChooseUsPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const WhyChooseUsPage: React.FC<WhyChooseUsPageProps> = ({ onOpenQuoteModal }) => {
  const pillarIcons = [
    ShieldCheck,
    Building2,
    MapPin,
    Wrench,
    CalendarCheck,
    HeartHandshake,
  ];

  const equipmentDetails = [
    {
      title: 'HEPA Negative Air Duct Extraction',
      desc: 'Our commercial negative air containment systems capture 99.97% of particulates down to 0.3 microns, preventing recirculated dust inside your home.',
    },
    {
      title: 'Rotary Mechanical Brushes & Air Whips',
      desc: 'High-torque flexible shafts rotate through square and round ductwork to break loose stubborn pet hair and drywall debris.',
    },
    {
      title: 'High-Temperature Steam Extraction',
      desc: 'Heated to 200°F+ at the wand tip, our deep carpet extractors dissolve grease and neutralize bacteria before lifting them into recovery tanks.',
    },
    {
      title: 'Deionized Pure Water Window Cleaning',
      desc: 'Removes dissolved minerals from water so glass dries completely spotless with no chemical films or soapy haze.',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs items={[{ label: 'Why Choose Us' }]} />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>The Prime X-Press Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Why Winnipeg Properties Trust Prime X-Press Cleaning
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            We don’t cut corners or rush through appointments. We combine powerful equipment, courteous technicians, and genuine Winnipeg reliability to deliver exceptional cleaning results.
          </p>
        </div>
      </section>

      {/* 6 Core Pillars */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#063F4D] tracking-tight">
            Our Core Pillars of Service
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Built on values of craftsmanship, punctuality, and clear communication.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_CHOOSE_US.map((item, idx) => {
            const Icon = pillarIcons[idx] || ShieldCheck;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#BFEDEE]/50 text-[#00A8AD] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#063F4D]">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Equipment Spotlight */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">
              Professional Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Modern Equipment Makes the Real Difference
            </h2>
            <p className="text-sm text-slate-600">
              Consumer vacuums and rental machines lack the heat, suction, and CFM volume required for true deep sanitization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {equipmentDetails.map((eq, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-[#F5F8F8] border border-slate-200 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00A8AD] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <h3 className="text-base font-extrabold text-[#063F4D]">
                    {eq.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                  {eq.desc}
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
