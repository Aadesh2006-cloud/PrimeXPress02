import React from 'react';
import { Star, MessageSquare, PlusCircle } from 'lucide-react';
import { TESTIMONIAL_PLACEHOLDERS, COMPANY_INFO } from '../data/cleaningData';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#F5F8F8] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
            CLIENT FEEDBACK
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Real feedback from Winnipeg homeowners and businesses.
          </p>
        </div>

        {/* 3 Premium Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIAL_PLACEHOLDERS.map((t, index) => (
            <div
              key={t.id}
              id={`testimonial-card-${index}`}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col justify-between hover:border-[#00A8AD] transition-all duration-300"
            >
              <div>
                {/* Visual Stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-[#00A8AD] bg-[#BFEDEE]/30 px-2 py-0.5 rounded-full">
                    {t.service}
                  </span>
                </div>

                {/* Review Highlight / Category */}
                <h3 className="text-base font-bold text-[#063F4D] mb-3">
                  {t.highlight}
                </h3>

                {/* Clearly Marked Placeholder Text as mandated */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-slate-600 text-sm italic leading-relaxed my-2">
                  “{t.note}”
                </div>
              </div>

              {/* Client Info footer */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#063F4D]">
                    {t.clientType}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {t.area}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00A8AD]/10 text-[#00A8AD] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Review Invitation / Google Link */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Recently received service from Prime X-Press Cleaning? Share your experience with us or tag us on Instagram{' '}
            <a
              href={COMPANY_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00A8AD] font-bold underline hover:text-[#063F4D]"
            >
              {COMPANY_INFO.instagramHandle}
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
};
