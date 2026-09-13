import React from 'react';
import { PhoneCall, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { PROCESS_STEPS, COMPANY_INFO } from '../data/cleaningData';

interface ProcessTimelineProps {
  onOpenQuoteModal: () => void;
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ onOpenQuoteModal }) => {
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <PhoneCall className="w-6 h-6 text-[#00A8AD]" />;
      case 1:
        return <Calendar className="w-6 h-6 text-[#00A8AD]" />;
      case 2:
        return <Sparkles className="w-6 h-6 text-[#00A8AD]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#00A8AD]" />;
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/50 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
            SIMPLE WORKFLOW
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight">
            A Cleaner Property in 3 Simple Steps
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Effortless booking, prompt arrivals, and dependable cleaning for your Winnipeg home or office.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#00A8AD]/20 via-[#00A8AD] to-[#00A8AD]/20 -translate-y-8 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {PROCESS_STEPS.map((step, index) => (
              <div
                key={step.step}
                id={`process-step-${index}`}
                className="bg-[#F5F8F8] rounded-3xl p-8 border border-slate-200 hover:border-[#00A8AD] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-center md:text-left group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center group-hover:scale-110 group-hover:border-[#00A8AD] transition-all">
                      {getStepIcon(index)}
                    </div>
                    <span className="font-mono text-3xl font-black text-[#00A8AD]/40 group-hover:text-[#00A8AD] transition-colors">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#063F4D] tracking-tight mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#17343A]/85 leading-relaxed font-normal mb-4">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 text-xs font-medium text-slate-500">
                  {step.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick prompt */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenQuoteModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            <span>Start Step 01: Book Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
