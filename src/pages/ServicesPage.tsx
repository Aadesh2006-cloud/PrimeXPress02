import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Wind, 
  Sparkles, 
  Maximize2, 
  Home as HomeIcon, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Wrench,
  Layers,
  Award
} from 'lucide-react';
import { COMPANY_INFO, SERVICES_DATA } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface ServicesPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenQuoteModal }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'residential' | 'commercial'>('all');

  const detailedServices = [
    {
      id: 'air-duct-cleaning',
      title: 'Air Duct Cleaning',
      category: 'Air Quality & HVAC',
      tag: 'Most Popular for Winnipeg Winters',
      shortDesc: 'Comprehensive mechanical rotary brush agitation and high-suction negative air vacuuming through your entire ventilation system.',
      icon: Wind,
      image: '/images/ducts/air-duct-service.jpg',
      href: '/services/air-duct-cleaning',
      suitableFor: ['residential', 'commercial'],
      highlights: [
        'Main trunk supply & return lines cleaned',
        'All individual registers & vents brushed',
        'HEPA negative air containment equipment',
        'Helps relieve winter allergens & furnace odor',
      ],
      idealFrequency: 'Every 2 to 3 years, or immediately post-renovation',
    },
    {
      id: 'carpet-cleaning',
      title: 'Carpet Deep Steam Cleaning',
      category: 'Floor & Fabric Restoration',
      tag: 'Deep Fiber Extraction',
      shortDesc: 'Professional commercial-grade hot water extraction that reaches deep into carpet fibers to remove stubborn soil, pet dander, and embedded grit.',
      icon: Sparkles,
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1000&auto=format&fit=crop',
      href: '/services/carpet-cleaning',
      suitableFor: ['residential', 'commercial'],
      highlights: [
        'High-temperature hot water extraction',
        'Targeted pre-treatment for heavy stains',
        'Safe, non-toxic, pet-friendly products',
        'Quick drying with fiber grooming',
      ],
      idealFrequency: 'Every 6 to 12 months for active households & offices',
    },
    {
      id: 'window-cleaning',
      title: 'Streak-Free Window Cleaning',
      category: 'Glass & Architectural Clarity',
      tag: 'Interior & Exterior Polish',
      shortDesc: 'Crystal-clear glass care for homes, storefronts, and commercial facilities. We clean panes, screens, window tracks, and sills with precision.',
      icon: Maximize2,
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop',
      href: '/services/window-cleaning',
      suitableFor: ['residential', 'commercial'],
      highlights: [
        'Interior and exterior glass washing',
        'Sill, track, and frame detailing',
        'Pure water technology for spotless finish',
        'Multi-story residential & storefront capabilities',
      ],
      idealFrequency: 'Spring and Autumn, or quarterly for retail businesses',
    },
    {
      id: 'residential-packages',
      title: 'Residential Whole-Home Packages',
      category: 'Whole-Home Solutions',
      tag: 'Bundle & Save',
      shortDesc: 'Designed for Winnipeg homeowners moving in, moving out, or completing seasonal spring/autumn refreshes.',
      icon: HomeIcon,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
      href: '/services/residential',
      suitableFor: ['residential'],
      highlights: [
        'Combined Air Duct + Carpet + Window cleaning',
        'Ideal for possession dates & property listings',
        'Coordinated single-day team scheduling',
        'Priority booking in peak seasons',
      ],
      idealFrequency: 'Move-in/out, seasonal changeovers, or post-construction',
    },
    {
      id: 'commercial-services',
      title: 'Commercial Cleaning Services',
      category: 'Facility Maintenance',
      tag: 'Offices & Retail Stores',
      shortDesc: 'Tailored commercial cleaning solutions for Winnipeg businesses, clinic lobbies, retail shops, and property management turnovers.',
      icon: Building2,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
      href: '/services/commercial',
      suitableFor: ['commercial'],
      highlights: [
        'Off-peak & weekend scheduling to prevent disruption',
        'Compliant with commercial safety & insurance standards',
        'High-traffic commercial carpet & entryway care',
        'Recurring maintenance agreements available',
      ],
      idealFrequency: 'Monthly, quarterly, or customized turnover schedule',
    },
  ];

  const filteredServices = detailedServices.filter((svc) => {
    if (activeFilter === 'all') return true;
    return svc.suitableFor.includes(activeFilter);
  });

  return (
    <div className="bg-[#F5F8F8] min-h-screen">
      <Breadcrumbs items={[{ label: 'Services' }]} />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-20 bg-[#063F4D] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1800&auto=format&fit=crop"
            alt="Cleaning services Winnipeg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/25 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Professional Cleaning Services</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Specialized Cleaning Services in Winnipeg
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            From deep ventilation duct care to high-powered steam extraction and crystal-clear windows, Prime X-Press Cleaning delivers thorough, dependable results for every property.
          </p>

          {/* Service Filter Tabs */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#00A8AD] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              All Services ({detailedServices.length})
            </button>
            <button
              onClick={() => setActiveFilter('residential')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'residential'
                  ? 'bg-[#00A8AD] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Residential Homes
            </button>
            <button
              onClick={() => setActiveFilter('commercial')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'commercial'
                  ? 'bg-[#00A8AD] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Commercial Properties
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#063F4D]/90 via-[#063F4D]/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-[#00A8AD] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                        {service.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-[#BFEDEE]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-[#BFEDEE]">
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 sm:p-7 space-y-4 text-left">
                    <h3 className="text-xl font-extrabold text-[#063F4D] tracking-tight group-hover:text-[#00A8AD] transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Key Service Inclusions:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {service.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A8AD] shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F8F8] border border-slate-200 text-[11px] text-slate-500">
                      <strong>Recommended Frequency:</strong> {service.idealFrequency}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0 space-y-2">
                  <Link
                    to={service.href}
                    className="w-full py-3 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Read Full Service Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => onOpenQuoteModal(service.title)}
                    className="w-full py-2.5 rounded-xl bg-[#BFEDEE]/40 hover:bg-[#BFEDEE] text-[#063F4D] font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Book This Service Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Matrix / Overview */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063F4D]">
              How Our Core Services Compare
            </h2>
            <p className="text-sm text-slate-600">
              Each service targets different aspects of indoor hygiene, cleanliness, and overall comfort.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-[#F5F8F8]">
                  <th className="p-4 text-xs font-extrabold text-[#063F4D] uppercase">Service</th>
                  <th className="p-4 text-xs font-extrabold text-[#063F4D] uppercase">Primary Focus</th>
                  <th className="p-4 text-xs font-extrabold text-[#063F4D] uppercase">Main Benefit</th>
                  <th className="p-4 text-xs font-extrabold text-[#063F4D] uppercase">Equipment Utilized</th>
                  <th className="p-4 text-xs font-extrabold text-[#063F4D] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-[#063F4D]">Air Duct Cleaning</td>
                  <td className="p-4 text-slate-600">HVAC supply, return, and registers</td>
                  <td className="p-4 text-slate-600">Reduces airborne dust, allergens & furnace load</td>
                  <td className="p-4 text-slate-600">HEPA vacuum, rotary agitating brushes</td>
                  <td className="p-4">
                    <Link to="/services/air-duct-cleaning" className="text-xs font-bold text-[#00A8AD] hover:underline">
                      Learn More →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-[#063F4D]">Carpet Cleaning</td>
                  <td className="p-4 text-slate-600">Deep fiber carpet pile & high-traffic zones</td>
                  <td className="p-4 text-slate-600">Stain lifting, odor neutralization & fiber revival</td>
                  <td className="p-4 text-slate-600">High-temperature hot water extractors</td>
                  <td className="p-4">
                    <Link to="/services/carpet-cleaning" className="text-xs font-bold text-[#00A8AD] hover:underline">
                      Learn More →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-[#063F4D]">Window Cleaning</td>
                  <td className="p-4 text-slate-600">Interior & exterior glass, screens, sills</td>
                  <td className="p-4 text-slate-600">Maximum natural light clarity & streak-free finish</td>
                  <td className="p-4 text-slate-600">Pure water systems & professional squeegees</td>
                  <td className="p-4">
                    <Link to="/services/window-cleaning" className="text-xs font-bold text-[#00A8AD] hover:underline">
                      Learn More →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal()} />
    </div>
  );
};
