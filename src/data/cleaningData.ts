import { BeforeAfterItem, ServiceCardData } from '../types';

export const COMPANY_INFO = {
  name: 'PRIME X-PRESS CLEANING INC.',
  legalName: 'Prime X-Press Cleaning Inc.',
  shortName: 'Prime X-Press',
  tagline: 'Fresher • Cleaner • Healthier',
  primaryPhone: '204-557-9565',
  secondaryPhone: '204-619-9565',
  primaryPhoneRaw: '2045579565',
  secondaryPhoneRaw: '2046199565',
  email: 'info@primexpresscleaning.ca',
  location: 'Winnipeg, Manitoba, Canada',
  serviceAreaText: 'Winnipeg & Surrounding Areas',
  instagramUrl: 'https://www.instagram.com/primexpresscleaning/',
  instagramHandle: '@primexpresscleaning',
  hours: 'Monday – Saturday: 8:00 AM – 7:00 PM | Sunday: On Request',
};

export const SERVICES_DATA: ServiceCardData[] = [
  {
    id: 'air-duct',
    title: 'AIR DUCT CLEANING',
    shortDesc: 'Cleaner ducts. Fresher indoor air.',
    fullDesc: 'Dust, debris and contaminants can accumulate inside your HVAC system over time. Our professional air duct cleaning service helps remove unwanted buildup from your ductwork, helping create a cleaner indoor environment for your home or business.',
    icon: 'Wind',
    image: '/images/ducts/air-duct-service.jpg', // Professional HVAC ductwork and ventilation system
    features: [
      'Professional duct cleaning',
      'Residential properties',
      'Commercial properties',
      'Dust & debris removal',
      'Cleaner indoor environment',
    ],
    ctaText: 'Book Duct Cleaning →',
  },
  {
    id: 'carpet',
    title: 'CARPET CLEANING',
    shortDesc: 'Deep cleaning for fresher carpets.',
    fullDesc: 'Bring tired carpets back to life with professional deep cleaning. Our carpet cleaning service helps remove dirt, stains and everyday buildup while leaving your carpets looking cleaner, fresher and better maintained.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1200&auto=format&fit=crop', // Deep carpet steam cleaner wand
    features: [
      'Deep carpet cleaning',
      'Dirt & stain treatment',
      'Residential carpet cleaning',
      'Commercial carpet cleaning',
      'Fresh, clean finish',
    ],
    ctaText: 'Book Carpet Cleaning →',
  },
  {
    id: 'window',
    title: 'WINDOW CLEANING',
    shortDesc: 'Clearer windows. Brighter spaces.',
    fullDesc: 'Clean windows can completely transform how bright and welcoming your property feels. Prime X-Press Cleaning provides professional window cleaning for residential and commercial properties throughout Winnipeg.',
    icon: 'Maximize2',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop', // Window squeegee cleaning professional
    features: [
      'Interior window cleaning',
      'Exterior window cleaning',
      'Residential properties',
      'Commercial properties',
      'Clear streak-free appearance',
    ],
    ctaText: 'Book Window Cleaning →',
  },
];

export const WHY_CHOOSE_US = [
  {
    title: 'PROFESSIONAL SERVICE',
    description: 'Reliable cleaning carried out with attention to detail.',
    icon: 'ShieldCheck',
  },
  {
    title: 'RESIDENTIAL & COMMERCIAL',
    description: 'Solutions for homes, offices and commercial properties.',
    icon: 'Building2',
  },
  {
    title: 'LOCAL WINNIPEG SERVICE',
    description: 'Proudly serving Winnipeg and surrounding communities.',
    icon: 'MapPin',
  },
  {
    title: 'MODERN EQUIPMENT',
    description: 'Professional cleaning equipment for effective results.',
    icon: 'Wrench',
  },
  {
    title: 'CONVENIENT BOOKING',
    description: 'Simply call or book online to arrange your service appointment.',
    icon: 'CalendarCheck',
  },
  {
    title: 'CUSTOMER-FOCUSED',
    description: 'Clear communication and professional service from start to finish.',
    icon: 'HeartHandshake',
  },
];

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'BOOK YOUR CLEANING',
    description: 'Select your preferred services and appointment time online or call us directly.',
    action: 'Instant confirmation & fast 2-hour scheduling response',
  },
  {
    step: '02',
    title: 'SCHEDULE YOUR SERVICE',
    description: 'Choose a convenient morning or afternoon slot for your home or business.',
    action: 'Flexible morning, afternoon & weekend appointments',
  },
  {
    step: '03',
    title: 'ENJOY A FRESHER SPACE',
    description: 'Our certified team completes the deep cleaning so you can enjoy a healthier property.',
    action: '100% focused on quality, safety and customer satisfaction',
  },
];

export const CANADIAN_PRICING_STANDARDS = {
  currency: 'CAD',
  region: 'Winnipeg, Manitoba & Canada Standard',
  airDuct: {
    startingPrice: 279,
    unit: 'CAD',
    label: 'Standard Residential Bundle (Up to 10 Vents)',
    detail: 'Includes primary HVAC hookup, HEPA negative air containment system, inspection, and cleaning of up to 10 supply/return vents.',
    extraVentCost: 15,
    packages: [
      { name: 'Starter / Bungalow (Up to 10 vents)', price: 279, desc: 'Ideal for condos, bungalows, and starter homes.' },
      { name: '2-Storey Family Home (Up to 15 vents)', price: 354, desc: 'Most popular Winnipeg two-storey home package.' },
      { name: 'Large Residential (Up to 20 vents)', price: 429, desc: 'Spacious properties with extensive ductwork.' },
    ],
    popularAddOns: [
      { name: 'Dryer Vent Exhaust Cleanout', price: 79, desc: 'Prevents lint fires & speeds drying cycles' },
      { name: 'Botanical Sanitizer & Deodorizer', price: 49, desc: 'Hospital-grade eco disinfectant through all ducts' },
      { name: 'Furnace Blower Motor Deep Clean', price: 69, desc: 'Removes motor dust & restores airflow speed' },
    ],
  },
  carpet: {
    startingPrice: 129,
    unit: 'CAD',
    label: '2-Room Starter Deep Steam Package',
    detail: 'Commercial-grade hot water extraction, pet-safe pre-spray, spot agitation, and neutral fiber rinse.',
    extraRoomCost: 45,
    packages: [
      { name: '2 Rooms / Starter Apartment', price: 129, desc: 'Living room + master bedroom deep steam extraction.' },
      { name: '3 Rooms or 2 Rooms + Hallway', price: 169, desc: 'Most common residential layout refresh.' },
      { name: 'Whole Home (4 to 5 Rooms)', price: 249, desc: 'Complete main floor and upstairs bedrooms clean.' },
    ],
    popularAddOns: [
      { name: 'Carpeted Flight of Stairs (Up to 14 steps)', price: 49, desc: 'High-traffic tread and riser hand scrubbing' },
      { name: 'Pet Urine Enzyme & Odor Neutralizer', price: 39, desc: 'Breaks down sub-surface crystals & bacteria' },
      { name: 'Fiber Protective Sealant (Per room)', price: 29, desc: 'Repels future liquid spills & everyday soil' },
    ],
  },
  window: {
    startingPrice: 149,
    unit: 'CAD',
    label: 'Standard Residential (Up to 10 Panes)',
    detail: 'Complete interior and exterior pane cleaning with pure deionized water rinse for streak-free shine.',
    extraPaneCost: 12,
    packages: [
      { name: 'Bungalow / Townhome (Up to 12 panes)', price: 169, desc: 'Full exterior & interior streak-free clarity.' },
      { name: '2-Storey Home (Up to 20 panes)', price: 259, desc: 'Upper and main level glass detailing.' },
      { name: 'Ground Floor Commercial / Storefront', price: 129, desc: 'Welcoming transparent display glass.' },
    ],
    popularAddOns: [
      { name: 'Screen Hand-Washing (Per screen)', price: 4, desc: 'Removes airborne dust and spring pollen' },
      { name: 'Deep Track & Sill Vacuum & Wipe', price: 5, desc: 'Clears accumulated grit, dirt, and dead insects' },
    ],
  },
  bundles: [
    {
      title: 'Fresh Start Essential Bundle',
      price: 399,
      savings: 'Save $40 CAD',
      badge: 'Popular for Move-Ins',
      includes: [
        'Complete Air Duct Cleaning (up to 10 vents)',
        'HEPA negative air furnace hookup',
        '2 Carpeted Rooms deep steam extracted',
        'Complimentary furnace filter inspection',
      ],
    },
    {
      title: 'Whole-Home Comfort Bundle',
      price: 499,
      savings: 'Save $65 CAD',
      badge: 'Best Value for Families',
      includes: [
        'Complete Air Duct Cleaning (up to 12 vents)',
        'Dryer Vent Exhaust deep cleanout',
        '3 Carpeted Rooms or 2 rooms + hallway',
        'Botanical air duct deodorizer application',
      ],
    },
    {
      title: 'Ultimate Total Home Revival',
      price: 699,
      savings: 'Save $110 CAD',
      badge: 'Complete Property Refresh',
      includes: [
        'Complete Air Duct Cleaning (up to 15 vents)',
        'Dryer Vent Exhaust cleanout',
        '4 Carpeted Rooms deep hot water extracted',
        'Interior & exterior window cleaning (up to 12 panes)',
        'Priority same-week scheduling in Winnipeg',
      ],
    },
  ],
  commercial: {
    startingPrice: 175,
    unit: 'CAD',
    label: 'Commercial Scheduled Service',
    detail: 'Routine janitorial, HVAC filtration maintenance, and commercial carpet care custom-tailored to facility footprint.',
  },
};

export const BEFORE_AFTER_DATA: BeforeAfterItem[] = [
  {
    id: 'ba-carpet-1',
    title: 'High-Traffic Living Room Carpet Restoration',
    category: 'Carpet Cleaning',
    description: 'Deep fiber steam extraction eliminating embedded dirt, pet marks, and everyday footwear soil in River Heights residence.',
    beforeImage: '/images/before-after/carpet-before.jpg',
    afterImage: '/images/before-after/carpet-after.jpg',
    tag: 'Carpet Deep Extraction',
    specs: ['Deep hot water extraction', 'Eco-friendly pre-treatment', 'Fiber refresh'],
  },
  {
    id: 'ba-duct-1',
    title: 'Residential Main Supply & Return Duct Buildup Removal',
    category: 'Air Duct Cleaning',
    description: 'Comprehensive mechanical rotary brush agitation and high-suction negative air vacuuming through full home HVAC vents.',
    beforeImage: '/images/before-after/duct-before.jpg',
    afterImage: '/images/before-after/duct-after.jpg',
    tag: 'HVAC Vent Sanitization',
    specs: ['Rotary brush sweep', 'HEPA negative air suction', 'Vent register cleanse'],
  },
  {
    id: 'ba-window-1',
    title: 'Multi-Pane Architectural Glass Streak-Free Polish',
    category: 'Window Cleaning',
    description: 'Mineral stain, water spot, and road-dust removal on multi-story living room glass windows in Tuxedo.',
    beforeImage: '/images/before-after/window-before.jpg',
    afterImage: '/images/before-after/window-after.jpg',
    tag: 'Streak-Free Window Polish',
    specs: ['Pure water filtration', 'Frame & sill detail', 'Streak-free finish'],
  },
];

export const WINNIPEG_NEIGHBORHOODS = [
  'Downtown Winnipeg',
  'River Heights',
  'Tuxedo',
  'St. Vital',
  'Fort Garry',
  'St. Boniface',
  'St. James',
  'Transcona',
  'North Kildonan',
  'East Kildonan',
  'West Kildonan',
  'Charleswood',
  'Linden Woods',
  'Whyte Ridge',
  'Bridgwater',
  'Sage Creek',
  'Headingley',
  'East St. Paul',
  'West St. Paul',
  'Oakbank',
];

export const TESTIMONIAL_PLACEHOLDERS = [
  {
    id: 't-1',
    clientType: 'Residential Homeowner • Air Duct Cleaning',
    service: 'Air Duct Cleaning',
    stars: 5,
    area: 'Winnipeg (River Heights)',
    note: 'Add actual Google/Instagram customer review here.',
    highlight: 'Ductwork & Indoor Air Refresh',
    dateLabel: 'Verified Customer Review Placeholder',
  },
  {
    id: 't-2',
    clientType: 'Home & Rental Property Owner • Carpet Cleaning',
    service: 'Carpet Cleaning',
    stars: 5,
    area: 'Winnipeg (St. Vital)',
    note: 'Add actual Google/Instagram customer review here.',
    highlight: 'Deep Carpet Stain Removal',
    dateLabel: 'Verified Customer Review Placeholder',
  },
  {
    id: 't-3',
    clientType: 'Commercial Property Manager • Window & Duct Care',
    service: 'Commercial Window Cleaning',
    stars: 5,
    area: 'Winnipeg (Downtown)',
    note: 'Add actual Google/Instagram customer review here.',
    highlight: 'Streak-Free Windows & Punctual Service',
    dateLabel: 'Verified Customer Review Placeholder',
  },
];
