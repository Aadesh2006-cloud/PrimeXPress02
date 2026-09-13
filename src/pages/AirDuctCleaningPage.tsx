import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Wind, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  ThermometerSnowflake, 
  ChevronDown 
} from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface AirDuctCleaningPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const AirDuctCleaningPage: React.FC<AirDuctCleaningPageProps> = ({ onOpenQuoteModal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const signs = [
    {
      title: 'Visible Dust Around Register Vents',
      desc: 'Dark smudges or rings of dust clinging to the walls or ceiling around your heating and cooling registers.',
    },
    {
      title: 'Increased Allergy or Respiratory Discomfort',
      desc: 'Frequent sneezing, itchy eyes, or morning congestion when your Winnipeg furnace turns on in autumn and winter.',
    },
    {
      title: 'Recent Home Renovation or Construction',
      desc: 'Drywall dust, sawdust, and paint particulate quickly settle into return air grilles during home improvements.',
    },
    {
      title: 'Musty or Stale Air Odors',
      desc: 'Persistent uninviting odors circulating whenever the HVAC fan or furnace blower runs.',
    },
    {
      title: 'High Heating & Cooling Bills',
      desc: 'Airflow restriction caused by heavy dust accumulations forces furnace fans to work harder and consume more power.',
    },
    {
      title: 'Pet Ownership & Dander Accumulation',
      desc: 'Animal fur and microscopic dander get drawn directly into return ducts, continuously circulating in your living zones.',
    },
  ];

  const steps = [
    {
      step: '01',
      name: 'System Assessment & Register Prep',
      desc: 'Our technicians inspect the furnace plenum, main supply lines, and register layout, sealing registers to create high static negative pressure.',
    },
    {
      step: '02',
      name: 'High-Volume HEPA Negative Air Hookup',
      desc: 'We attach a powerful HEPA filtration vacuum system to the main duct trunk, preventing any loosened debris from escaping into your living space.',
    },
    {
      step: '03',
      name: 'Mechanical Rotary Brush Agitation',
      desc: 'Flexible rotating whip lines and agitation brushes travel through each run to scrub adhered dust, debris, and pet fur loose from duct walls.',
    },
    {
      step: '04',
      name: 'Register Cleansing & Airflow Verification',
      desc: 'All supply and return covers are thoroughly cleaned, registers remounted, and the HVAC system tested for balanced, unobstructed airflow.',
    },
  ];

  const faqs = [
    {
      q: 'How often should air ducts be cleaned in Winnipeg?',
      a: 'For most Winnipeg homes, we recommend professional air duct cleaning every 2 to 3 years. Because our Manitoba winters require homes to remain tightly sealed with furnaces running constantly for 5-6 months, indoor air re-circulates constantly. If you have pets, smokers, or recently renovated, cleaning every 1.5 to 2 years is advised.',
    },
    {
      q: 'Will duct cleaning make a mess inside my house?',
      a: 'Not at all. Prime X-Press Cleaning uses dedicated negative air containment with multi-stage HEPA filtration. All loosened dust is drawn directly through sealed hoses into our extraction units, ensuring zero dust enters your living rooms or furniture.',
    },
    {
      q: 'How long does a residential air duct cleaning appointment take?',
      a: 'A typical single-family Winnipeg home (1,200 to 2,500 sq. ft.) usually takes between 2 to 3.5 hours depending on the number of vents, furnace accessibility, and duct complexity.',
    },
    {
      q: 'Do you clean both supply and return duct runs?',
      a: 'Yes, absolutely. Both the supply (warm/cool air going into rooms) and return (air traveling back to the furnace) duct lines are thoroughly agitated and vacuumed clean.',
    },
    {
      q: 'Do you also service commercial properties and offices?',
      a: 'Yes, we provide commercial duct cleaning for retail spaces, medical clinics, offices, and multi-family residential complexes throughout Winnipeg.',
    },
  ];

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs
        items={[
          { label: 'Services', to: '/services' },
          { label: 'Air Duct Cleaning' },
        ]}
      />

      {/* Page Hero */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/images/ducts/air-duct-hero.jpg"
            alt="Air duct cleaning in Winnipeg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
              <Wind className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>HVAC & Indoor Air Quality Specialists</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Professional Air Duct Cleaning in Winnipeg
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
              Remove built-up dust, allergens, pet dander, and renovation debris from your heating and cooling system. Breathe cleaner air and optimize furnace efficiency through harsh Manitoba seasons.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onOpenQuoteModal('Air Duct Cleaning')}
                className="px-7 py-4 rounded-xl bg-[#00A8AD] hover:bg-[#008d91] text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BOOK DUCT CLEANING NOW</span>
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
                <span>HEPA Negative Air Filtration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Rotary Agitation Whip Cleansing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8AD]" />
                <span>Residential & Commercial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Winnipeg Homes Need Regular Duct Cleaning */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#00A8AD] uppercase tracking-wider">
                <ThermometerSnowflake className="w-4 h-4" />
                <span>Manitoba Climate Factor</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#063F4D] tracking-tight">
                Why Winnipeg Air Ducts Accumulate More Debris
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Winnipeg experiences some of North America’s most extreme seasonal temperature shifts. From -35°C in January to +30°C in July, our doors and windows stay closed for the majority of the calendar year.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                When your home is sealed, whatever dust, skin cells, pet fur, and microscopic contaminants enter the house cannot escape naturally. They circulate repeatedly through your HVAC ductwork, coating the interior walls of your supply and return vents.
              </p>

              <div className="p-4 rounded-2xl bg-[#BFEDEE]/30 border border-[#00A8AD]/30 text-xs text-[#063F4D] font-semibold flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#00A8AD] shrink-0 mt-0.5" />
                <span>
                  <strong>Cleaner air for the whole family:</strong> Clean ducts reduce the burden on your furnace filter and help lower the level of airborne dust settling on furniture daily.
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src="/images/ducts/air-duct-process.jpg"
                  alt="Duct cleaning equipment"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#063F4D]/90 backdrop-blur-md text-white border border-white/20">
                  <div className="text-xs font-bold text-[#BFEDEE] uppercase">Equipment Standard</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">High-Pressure Rotary Whip & HEPA Suction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signs You Need Duct Cleaning */}
      <section className="py-16 lg:py-20 bg-[#F5F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Signs Your Air Ducts Are Due for Cleaning
            </h2>
            <p className="text-sm text-slate-600">
              Notice any of the following common indicators in your Winnipeg property?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {signs.map((sign, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#BFEDEE]/50 text-[#00A8AD] flex items-center justify-center font-extrabold text-sm">
                  {idx + 1}
                </div>
                <h3 className="font-extrabold text-base text-[#063F4D]">
                  {sign.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {sign.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our 4-Step Duct Cleaning Process */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="text-xs font-extrabold text-[#00A8AD] uppercase tracking-wider">
              Step-by-Step Methodology
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Our Professional 4-Step Process
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="p-6 rounded-3xl bg-[#F5F8F8] border border-slate-200 space-y-3">
                <span className="text-3xl font-extrabold text-[#00A8AD]">
                  {s.step}
                </span>
                <h3 className="font-extrabold text-base text-[#063F4D]">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Canadian Standard Pricing Guide */}
      <section className="py-16 lg:py-20 bg-[#F5F8F8] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
              CANADIAN INDUSTRY STANDARD RATES
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Transparent Air Duct Pricing (CAD)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              No hidden trip fees or surprise surcharges. Rates strictly adhere to Canadian HVAC cleaning benchmarks in Winnipeg.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">Starter / Condo</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$279 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Standard Canadian residential base rate. Covers negative air hookup, furnace inspection, and up to 10 vents.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 10 Vents / Registers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Main Supply & Return Trunks</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> High-Velocity Agitation Whip</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Air Duct Cleaning')}
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
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">2-Storey Home</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$354 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">Standard Canadian pricing for two-storey family properties in Winnipeg (Up to 15 total vents included).</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 15 Vents / Registers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> High-Static Negative HEPA</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Full Furnace Filter Check</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Air Duct Cleaning')}
                className="mt-6 w-full py-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center shadow-md"
              >
                Book This Package
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">Large Residence</span>
                <div className="text-3xl font-extrabold text-[#063F4D]">$429 <span className="text-xs font-normal text-slate-500">CAD</span></div>
                <p className="text-xs text-slate-600">For large family estates with multiple zones or up to 20 vents across multiple levels.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Up to 20 Vents / Registers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Extended Agitation Sweep</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD]" /> Extra vents at $15 CAD each</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteModal('Air Duct Cleaning')}
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
                <strong>Popular Canadian Add-Ons:</strong> Dryer Vent Cleanout ($79 CAD) • Botanical Sanitizing Fog ($49 CAD) • Blower Motor Scrub ($69 CAD)
              </div>
            </div>
            <button
              onClick={() => onOpenQuoteModal('Air Duct Cleaning')}
              className="px-4 py-2 rounded-xl bg-[#BFEDEE]/50 hover:bg-[#BFEDEE] text-[#063F4D] font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Book Add-On With Service
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-[#F5F8F8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              Frequently Asked Questions: Air Duct Cleaning
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers to your common questions about furnace and ductwork maintenance.
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
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal('Air Duct Cleaning')} />
    </div>
  );
};
