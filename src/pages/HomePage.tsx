import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { QuickServiceStrip } from '../components/QuickServiceStrip';
import { Introduction } from '../components/Introduction';
import { Services } from '../components/Services';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { BeforeAfterGallery } from '../components/BeforeAfterGallery';
import { ProcessTimeline } from '../components/ProcessTimeline';
import { ResidentialCommercial } from '../components/ResidentialCommercial';
import { LocalWinnipeg } from '../components/LocalWinnipeg';
import { Testimonials } from '../components/Testimonials';
import { AboutSection } from '../components/AboutSection';
import { HomeFAQ } from '../components/HomeFAQ';
import { StrongCTA } from '../components/StrongCTA';
import { QuoteSection } from '../components/QuoteSection';
import { PropertyType } from '../types';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';

interface HomePageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenQuoteModal }) => {
  const navigate = useNavigate();

  const handleSelectServiceFromStrip = (serviceId: string) => {
    if (serviceId === 'air-duct') {
      navigate('/services/air-duct-cleaning');
    } else if (serviceId === 'carpet') {
      navigate('/services/carpet-cleaning');
    } else if (serviceId === 'window') {
      navigate('/services/window-cleaning');
    } else {
      navigate('/services');
    }
  };

  const handleBookService = (serviceTitle: string) => {
    onOpenQuoteModal(serviceTitle);
  };

  const handleSelectPropertyType = (type: PropertyType) => {
    if (type === 'Residential') {
      navigate('/services/residential');
    } else {
      navigate('/services/commercial');
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <Hero onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* Quick Service Strip */}
      <QuickServiceStrip onSelectService={handleSelectServiceFromStrip} />

      {/* Introduction Section */}
      <Introduction onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* Direct Scheduling Highlight Banner */}
      <section className="py-6 bg-[#BFEDEE]/30 border-y border-[#00A8AD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00A8AD] text-white flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#063F4D]">
                  Ready to schedule your cleaning in Winnipeg?
                </h3>
                <p className="text-xs text-slate-600">
                  Book directly online or explore our full range of residential and commercial services.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenQuoteModal()}
                className="px-5 py-2.5 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Book Service Online</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#063F4D] border border-slate-200 text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <span>View All Services</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <div className="relative">
        <Services onBookService={handleBookService} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#063F4D] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#00A8AD] transition-colors shadow-md"
          >
            <span>Explore In-Depth Service Guides & Subpages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Before & After Interactive Showcase */}
      <div className="relative">
        <BeforeAfterGallery />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-center">
          <Link
            to="/our-work"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#00A8AD]/40 text-[#063F4D] font-bold text-xs uppercase tracking-wider hover:bg-[#BFEDEE]/40 transition-colors shadow-sm"
          >
            <span>View Full Before & After Gallery & Instagram Portfolio</span>
            <ArrowRight className="w-4 h-4 text-[#00A8AD]" />
          </Link>
        </div>
      </div>

      {/* 3-Step Process Timeline */}
      <ProcessTimeline onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* Split Residential & Commercial Section */}
      <ResidentialCommercial onSelectPropertyType={handleSelectPropertyType} />

      {/* Local Winnipeg & Manitoba Section */}
      <div className="relative">
        <LocalWinnipeg />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 text-center">
          <Link
            to="/service-area"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#063F4D] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#00A8AD] transition-colors shadow-md"
          >
            <span>Check All Covered Winnipeg Neighborhoods & Scheduling Info</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Customer Testimonials */}
      <Testimonials />

      {/* About Section */}
      <AboutSection onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* Frequently Asked Questions (FAQ) Section */}
      <HomeFAQ onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* Strong CTA Banner */}
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal()} />

      {/* Quote Request & Direct Online Booking Form */}
      <QuoteSection />
    </div>
  );
};
