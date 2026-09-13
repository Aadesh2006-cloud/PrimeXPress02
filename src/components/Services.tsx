import React from 'react';
import { Check, ArrowRight, Wind, Sparkles, Maximize2 } from 'lucide-react';
import { SERVICES_DATA, COMPANY_INFO } from '../data/cleaningData';

interface ServicesProps {
  onBookService: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onBookService }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wind':
        return <Wind className="w-6 h-6" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'Maximize2':
        return <Maximize2 className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <section id="services" className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/50 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
            OUR SERVICES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight">
            Professional Cleaning Solutions for Your Property
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Residential and commercial cleaning services throughout Winnipeg.
          </p>
        </div>

        {/* 3 Premium Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service, index) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className="bg-[#F5F8F8] rounded-3xl overflow-hidden border border-slate-200/80 hover:border-[#00A8AD] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image header */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={`${service.title} in Winnipeg`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#063F4D]/80 via-transparent to-transparent" />
                  
                  {/* Floating Icon badge */}
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md text-[#063F4D] flex items-center justify-center shadow-md">
                    {getIcon(service.icon)}
                  </div>

                  {/* Card number */}
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#063F4D]/70 backdrop-blur-md text-white font-mono text-xs font-bold">
                    0{index + 1}
                  </div>

                  {/* Service Title on image */}
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <h3 className="text-xl font-extrabold tracking-tight text-white">
                      {service.title}
                    </h3>
                    <p className="text-xs font-medium text-[#BFEDEE] mt-0.5">
                      {service.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-7 space-y-6">
                  <p className="text-sm text-[#17343A]/85 leading-relaxed font-normal">
                    {service.fullDesc}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#063F4D]">
                      Key Highlights
                    </div>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-[#17343A]">
                          <div className="w-4 h-4 rounded-full bg-[#BFEDEE] text-[#00A8AD] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="p-7 pt-0">
                <button
                  id={`book-service-btn-${service.id}`}
                  onClick={() => onBookService(service.title)}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#063F4D] group-hover:bg-[#00A8AD] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
                >
                  <span>{service.ctaText}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Supporting quick callout */}
        <div className="mt-14 p-6 rounded-2xl bg-[#BFEDEE]/30 border border-[#00A8AD]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-base font-bold text-[#063F4D]">
              Need multiple services combined for maximum savings?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Bundle Air Duct + Carpet + Window cleaning for whole-home restoration.
            </p>
          </div>
          <button
            onClick={() => onBookService('Multiple Services')}
            className="px-6 py-2.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs tracking-wide transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            Book Service Bundle Now
          </button>
        </div>
      </div>
    </section>
  );
};
