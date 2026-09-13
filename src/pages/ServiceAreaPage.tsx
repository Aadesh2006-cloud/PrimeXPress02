import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  MapPin, 
  Search, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Compass 
} from 'lucide-react';
import { COMPANY_INFO, WINNIPEG_NEIGHBORHOODS } from '../data/cleaningData';
import { StrongCTA } from '../components/StrongCTA';

interface ServiceAreaPageProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const ServiceAreaPage: React.FC<ServiceAreaPageProps> = ({ onOpenQuoteModal }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const zones = [
    {
      region: 'South & Southwest Winnipeg',
      neighborhoods: ['River Heights', 'Tuxedo', 'Fort Garry', 'Linden Woods', 'Whyte Ridge', 'Bridgwater', 'St. Norbert', 'Richmond West'],
      desc: 'Frequent residential service for single-family homes, heritage properties, and new construction developments.',
    },
    {
      region: 'East & Southeast Winnipeg',
      neighborhoods: ['St. Boniface', 'St. Vital', 'Transcona', 'Island Lakes', 'Sage Creek', 'Southdale', 'Windsor Park'],
      desc: 'Full coverage for residential and commercial spaces along key transit corridors and commercial districts.',
    },
    {
      region: 'North & Northwest Winnipeg',
      neighborhoods: ['North Kildonan', 'East Kildonan', 'West Kildonan', 'Garden City', 'Maples', 'Amber Trails', 'Old Kildonan'],
      desc: 'Prompt scheduling for bungalow homes, rental properties, and local businesses.',
    },
    {
      region: 'Central & West Winnipeg',
      neighborhoods: ['Downtown Winnipeg', 'The Forks / Exchange District', 'West End', 'Wolseley', 'St. James', 'Charleswood', 'Crestview'],
      desc: 'Convenient scheduling for multi-story condos, retail storefronts, character houses, and offices.',
    },
    {
      region: 'Surrounding Communities & Capital Region',
      neighborhoods: ['Headingley', 'East St. Paul', 'West St. Paul', 'Oakbank', 'Birds Hill', 'La Salle', 'Lorette'],
      desc: 'Service available across the greater capital region. Call ahead to coordinate scheduling.',
    },
  ];

  const filteredNeighborhoods = WINNIPEG_NEIGHBORHOODS.filter((n) =>
    n.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="bg-[#F5F8F8] min-h-screen text-left">
      <Breadcrumbs items={[{ label: 'Service Area' }]} />

      {/* Hero Header */}
      <section className="relative py-16 lg:py-24 bg-[#063F4D] text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A8AD]/20 border border-[#00A8AD]/40 text-[#BFEDEE] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#00A8AD]" />
            <span>Manitoba Coverage Area</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Serving Winnipeg & Surrounding Areas
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Prime X-Press Cleaning proudly provides professional air duct, carpet, and window cleaning to every corner of Winnipeg with prompt dispatch and zero hidden travel surcharges.
          </p>
        </div>
      </section>

      {/* Neighborhood Search & Zone Overview */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Box */}
        <div className="max-w-xl mx-auto mb-14 text-center space-y-3">
          <h2 className="text-2xl font-extrabold text-[#063F4D]">
            Search Your Neighborhood
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Check if your Winnipeg area is within our regular daily service routes.
          </p>

          <div className="relative mt-4">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type your area (e.g. River Heights, St. Vital, Tuxedo...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-[#00A8AD] text-sm text-[#063F4D] shadow-sm outline-none"
            />
          </div>

          {searchTerm && (
            <div className="pt-2 text-xs text-slate-600">
              {filteredNeighborhoods.length > 0 ? (
                <span>Found <strong>{filteredNeighborhoods.length}</strong> matching area(s): {filteredNeighborhoods.join(', ')}</span>
              ) : (
                <span>Don't see your specific area? We likely still serve you! <a href={`tel:${COMPANY_INFO.primaryPhoneRaw}`} className="text-[#00A8AD] font-bold underline">Call {COMPANY_INFO.primaryPhone} to check.</a></span>
              )}
            </div>
          )}
        </div>

        {/* Zones Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#00A8AD]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Service Zone</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#063F4D]">
                  {zone.region}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {zone.desc}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Key Neighborhoods Covered:
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {zone.neighborhoods.map((n) => (
                      <span
                        key={n}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F8F8] text-[11px] font-semibold text-[#063F4D] border border-slate-200"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onOpenQuoteModal(`Service in ${zone.region}`)}
                  className="w-full py-2.5 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Book In This Area →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Travel Fee Policy Callout */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#BFEDEE] text-[#00A8AD] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#063F4D]">
            No Hidden Travel Fees Within Winnipeg Perimeter
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All residential and commercial properties within the Perimeter Highway receive standard transparent pricing without unexpected fuel or travel surcharges.
          </p>
        </div>
      </section>

      {/* Strong CTA */}
      <StrongCTA onOpenQuoteModal={() => onOpenQuoteModal()} />
    </div>
  );
};
