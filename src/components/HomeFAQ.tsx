import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageSquare, Sparkles, ShieldCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';

interface HomeFAQProps {
  onOpenQuoteModal: (service?: string) => void;
}

interface FAQItem {
  id: string;
  category: 'all' | 'booking' | 'services' | 'pricing';
  question: string;
  answer: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-quote-booking',
    category: 'booking',
    question: 'How do I request a free quote or schedule a cleaning service?',
    answer:
      'You can request a free quote instantly online by clicking any "Get Free Quote" button, filling out our interactive booking form below, or by calling our dispatch line directly at 204-557-9565. We provide transparent upfront pricing with zero hidden fees, and you can track your booking status in real-time.',
  },
  {
    id: 'faq-service-area',
    category: 'booking',
    question: 'Which areas do you service in and around Winnipeg?',
    answer:
      'We proudly service all neighborhoods across Winnipeg (including Downtown, St. Vital, Fort Garry, River Heights, Transcona, Charleswood, St. James, North Kildonan, and Bridgwater) as well as surrounding Manitoba communities including Headingley, East St. Paul, West St. Paul, Oakbank, and Selkirk.',
  },
  {
    id: 'faq-duct-frequency',
    category: 'services',
    question: 'How often should I have my air ducts and HVAC system cleaned?',
    answer:
      'For most residential homes in Manitoba, we recommend professional air duct cleaning every year. However, if you have recently completed home renovations, moved into a new property, have family members with allergies or asthma, or live with multiple shedding pets, an annual cleaning is recommended to maintain optimal indoor air quality.',
  },
  {
    id: 'faq-carpet-dry-time',
    category: 'services',
    question: 'How long does it take for carpets to dry after professional deep cleaning?',
    answer:
      'Thanks to our high-powered truck-mounted extraction technology, the majority of moisture is recovered immediately during the process. Under standard room temperatures and good ventilation, carpets typically dry completely within 4 to 8 hours. We also provide airflow recommendations to expedite drying time.',
  },
  {
    id: 'faq-pet-safe',
    category: 'pricing',
    question: 'Are your cleaning products safe for children and household pets?',
    answer:
      'Yes, absolutely. We strictly utilize professional-grade, eco-friendly, and non-toxic cleaning agents that are hypoallergenic and biodegradable. Our cleaning solutions break down dirt, stains, and odors effectively without leaving behind harmful chemical residues or volatile organic compounds (VOCs).',
  },
  {
    id: 'faq-preparation',
    category: 'services',
    question: 'What should I do to prepare before the cleaning technicians arrive?',
    answer:
      'To ensure a seamless visit, please clear small decorative items, toys, and breakables from the areas being serviced. For duct cleaning, ensure our technicians have clear access to your furnace and registers. For carpet or window cleaning, ensure pets are secured in a comfortable room and driveway access is available for our service vehicles.',
  },
  {
    id: 'faq-tracking',
    category: 'booking',
    question: 'How do I track my booking or check my technician dispatch status?',
    answer:
      'Every appointment booked receives a unique Reference ID (e.g., PXC-XXXX). You can view your real-time status anytime under the "Track Booking" tab on our website, or log in with your Google account / email to view all your connected invoices, scheduled dates, and technician updates in one place.',
  },
  {
    id: 'faq-insurance',
    category: 'pricing',
    question: 'Is Prime X-Press Cleaning licensed, bonded, and insured?',
    answer:
      'Yes, Prime X-Press Cleaning Inc. is 100% locally owned, fully licensed, bonded, and backed by comprehensive commercial general liability insurance. Our technicians are thoroughly background-checked and trained to meet strict industry safety standards.',
  },
  {
    id: 'faq-payment-methods',
    category: 'pricing',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), Interac debit, Interac e-Transfer, cash, and corporate invoicing for commercial facilities upon approved account terms.',
  },
];

export const HomeFAQ: React.FC<HomeFAQProps> = ({ onOpenQuoteModal }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'booking' | 'services' | 'pricing'>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-quote-booking');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = FAQS_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq-section" className="py-20 bg-[#F5F8F8] border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BFEDEE]/60 border border-[#00A8AD]/30 text-[#063F4D] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Got Questions? We Have Answers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063F4D] tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our residential and commercial cleaning services, scheduling in Winnipeg, and technician dispatch.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            type="button"
            id="faq-cat-all"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#063F4D] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Questions ({FAQS_DATA.length})
          </button>
          <button
            type="button"
            id="faq-cat-booking"
            onClick={() => setActiveCategory('booking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'booking'
                ? 'bg-[#063F4D] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Booking & Service Area
          </button>
          <button
            type="button"
            id="faq-cat-services"
            onClick={() => setActiveCategory('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'services'
                ? 'bg-[#063F4D] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Services, Ducts & Carpet Drying
          </button>
          <button
            type="button"
            id="faq-cat-pricing"
            onClick={() => setActiveCategory('pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'pricing'
                ? 'bg-[#063F4D] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Safety, Pricing & Insurance
          </button>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  id={faq.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs ${
                    isOpen ? 'border-[#00A8AD]/60 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm sm:text-base text-[#063F4D] leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-[#BFEDEE] text-[#063F4D] rotate-180'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-sm text-slate-500">No questions found matching your search.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 text-xs font-bold text-[#00A8AD] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Direct Contact / Still Have Questions Card */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-[#00A8AD]" />
              <h3 className="text-base sm:text-lg font-extrabold text-[#063F4D]">
                Have a specific question not covered here?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Our Winnipeg dispatch team is here to assist Monday through Saturday from 8:00 AM to 7:00 PM.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              type="button"
              id="faq-book-quote-btn"
              onClick={() => onOpenQuoteModal()}
              className="px-5 py-2.5 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Get Free Estimate</span>
            </button>
            <a
              href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
              id="faq-call-btn"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#063F4D] text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#00A8AD]" />
              <span>Call {COMPANY_INFO.primaryPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
