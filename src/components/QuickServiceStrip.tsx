import React from 'react';
import { Wind, Sparkles, Maximize2, ArrowRight } from 'lucide-react';

interface QuickServiceStripProps {
  onSelectService: (serviceId: string) => void;
}

export const QuickServiceStrip: React.FC<QuickServiceStripProps> = ({ onSelectService }) => {
  const items = [
    {
      id: 'air-duct',
      title: 'AIR DUCT CLEANING',
      desc: 'Cleaner ducts. Fresher indoor air.',
      icon: Wind,
      badge: 'HVAC Vent Care',
    },
    {
      id: 'carpet',
      title: 'CARPET CLEANING',
      desc: 'Deep cleaning for fresher carpets.',
      icon: Sparkles,
      badge: 'Deep Fiber Extraction',
    },
    {
      id: 'window',
      title: 'WINDOW CLEANING',
      desc: 'Clearer windows. Brighter spaces.',
      icon: Maximize2,
      badge: 'Streak-Free Finish',
    },
  ];

  return (
    <section className="relative -mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={`quick-strip-${item.id}`}
              onClick={() => onSelectService(item.id)}
              className="group bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 hover:border-[#00A8AD] hover:shadow-2xl hover:shadow-[#00A8AD]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#BFEDEE]/40 text-[#063F4D] group-hover:bg-[#00A8AD] group-hover:text-white flex items-center justify-center transition-colors duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A8AD] bg-[#BFEDEE]/30 px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#063F4D] group-hover:text-[#00A8AD] transition-colors mb-1.5 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-[#00A8AD] group-hover:text-[#063F4D] transition-colors">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
