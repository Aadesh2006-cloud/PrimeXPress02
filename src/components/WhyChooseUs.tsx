import React from 'react';
import { ShieldCheck, Building2, MapPin, Wrench, CalendarCheck, HeartHandshake } from 'lucide-react';
import { WHY_CHOOSE_US } from '../data/cleaningData';

export const WhyChooseUs: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-7 h-7 text-[#00A8AD]" />;
      case 'Building2':
        return <Building2 className="w-7 h-7 text-[#00A8AD]" />;
      case 'MapPin':
        return <MapPin className="w-7 h-7 text-[#00A8AD]" />;
      case 'Wrench':
        return <Wrench className="w-7 h-7 text-[#00A8AD]" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-7 h-7 text-[#00A8AD]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-7 h-7 text-[#00A8AD]" />;
      default:
        return <ShieldCheck className="w-7 h-7 text-[#00A8AD]" />;
    }
  };

  return (
    <section id="why-choose-us" className="py-20 lg:py-28 bg-[#063F4D] text-white relative overflow-hidden">
      {/* Background subtle radial elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A8AD]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BFEDEE]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#BFEDEE] text-xs font-extrabold uppercase tracking-widest border border-white/15">
            OUR REPUTATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Why Winnipeg Chooses Prime X-Press Cleaning
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal">
            Committed to quality, safety, and pristine standards for Manitoba properties.
          </p>
        </div>

        {/* 6 Modern Icon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_US.map((item, index) => (
            <div
              key={index}
              id={`why-card-${index}`}
              className="bg-white/5 hover:bg-white/10 rounded-2xl p-7 border border-white/10 hover:border-[#00A8AD]/50 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#00A8AD]/20 border border-[#00A8AD]/30 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#00A8AD] group-hover:text-white transition-all duration-300">
                  {getIcon(item.icon)}
                </div>
                <h3 className="text-base font-extrabold text-white tracking-wide uppercase mb-2 group-hover:text-[#BFEDEE] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#BFEDEE]/70 font-mono">
                <span>STANDARD 0{index + 1}</span>
                <span className="text-[#00A8AD] font-semibold">Verified Quality</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
