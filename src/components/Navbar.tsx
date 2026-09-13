import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Phone, 
  Sparkles, 
  Home as HomeIcon, 
  Menu, 
  X, 
  Clock, 
  MapPin, 
  ChevronDown, 
  Wind, 
  Maximize2, 
  Building2, 
  Clock3,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { COMPANY_INFO } from '../data/cleaningData';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onOpenQuoteModal: (service?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuoteModal }) => {
  const { openPortalModal, user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  // Scroll listener for elevation styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const serviceSublinks = [
    {
      name: 'Air Duct Cleaning',
      desc: 'HVAC dust & debris extraction',
      to: '/services/air-duct-cleaning',
      icon: Wind,
    },
    {
      name: 'Carpet Cleaning',
      desc: 'Deep steam & stain extraction',
      to: '/services/carpet-cleaning',
      icon: Sparkles,
    },
    {
      name: 'Window Cleaning',
      desc: 'Streak-free interior & exterior',
      to: '/services/window-cleaning',
      icon: Maximize2,
    },
    {
      name: 'Residential Cleaning',
      desc: 'Whole-home refresh packages',
      to: '/services/residential',
      icon: HomeIcon,
    },
    {
      name: 'Commercial Cleaning',
      desc: 'Offices, retail & property turnovers',
      to: '/services/commercial',
      icon: Building2,
    },
  ];

  return (
    <>
      {/* Micro announcement bar */}
      <div className="bg-[#063F4D] text-white/90 text-xs border-b border-white/10 hidden md:block py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-[#BFEDEE]">
              <MapPin className="w-3.5 h-3.5 text-[#00A8AD]" />
              Proudly Serving Winnipeg & Surrounding Areas
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <Clock className="w-3.5 h-3.5 text-[#00A8AD]" />
              Mon–Sat 8am–7pm
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
              className="text-[#BFEDEE] hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#00A8AD]" />
              <span>{COMPANY_INFO.primaryPhone}</span>
            </a>
            <span className="text-white/40">|</span>
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="text-[#BFEDEE] hover:text-white font-semibold transition-colors"
            >
              {COMPANY_INFO.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main sticky navigation */}
      <header
        id="navbar"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-[#063F4D]/10'
            : 'bg-white py-3.5 border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="group flex items-center gap-2.5 text-left focus:outline-none"
              id="brand-logo"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#063F4D] to-[#00A8AD] flex items-center justify-center text-white shadow-sm shadow-[#063F4D]/20 group-hover:scale-105 transition-transform duration-200">
                <div className="relative">
                  <HomeIcon className="w-5 h-5 text-white" />
                  <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE] absolute -top-1.5 -right-1.5 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold tracking-tight text-lg text-[#063F4D]">PRIME X-PRESS</span>
                </div>
                <div className="text-[11px] font-semibold text-[#00A8AD] tracking-wider uppercase leading-tight">
                  Cleaning Inc.
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-6" aria-label="Main Navigation">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#00A8AD] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00A8AD]'
                      : 'text-[#17343A] hover:text-[#00A8AD]'
                  }`
                }
              >
                Home
              </NavLink>

              {/* Services Dropdown */}
              <div 
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <NavLink
                    to="/services"
                    className={({ isActive }) =>
                      `text-sm font-semibold transition-colors py-1 flex items-center gap-1 relative ${
                        isActive || location.pathname.startsWith('/services')
                          ? 'text-[#00A8AD] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00A8AD]'
                          : 'text-[#17343A] hover:text-[#00A8AD]'
                      }`
                    }
                  >
                    <span>Services</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180 text-[#00A8AD]' : ''}`} />
                  </NavLink>
                </div>

                {/* Dropdown Menu */}
                {servicesDropdownOpen && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 mt-1 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <Link
                        to="/services"
                        className="text-xs font-bold text-[#063F4D] hover:text-[#00A8AD] flex items-center justify-between"
                      >
                        <span>All Services Overview</span>
                        <span className="text-[10px] text-[#00A8AD] uppercase">View All →</span>
                      </Link>
                    </div>
                    {serviceSublinks.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.to}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#BFEDEE]/30 transition-colors group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#F5F8F8] group-hover:bg-[#00A8AD] group-hover:text-white text-[#00A8AD] flex items-center justify-center shrink-0 transition-colors mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#063F4D] group-hover:text-[#00A8AD]">
                              {sub.name}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {sub.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <NavLink
                to="/why-choose-us"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#00A8AD] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00A8AD]'
                      : 'text-[#17343A] hover:text-[#00A8AD]'
                  }`
                }
              >
                Why Choose Us
              </NavLink>

              <NavLink
                to="/our-work"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#00A8AD] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00A8AD]'
                      : 'text-[#17343A] hover:text-[#00A8AD]'
                  }`
                }
              >
                Our Work
              </NavLink>

              <NavLink
                to="/service-area"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#00A8AD] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00A8AD]'
                      : 'text-[#17343A] hover:text-[#00A8AD]'
                  }`
                }
              >
                Service Area
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#00A8AD] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00A8AD]'
                      : 'text-[#17343A] hover:text-[#00A8AD]'
                  }`
                }
              >
                About
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#00A8AD] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00A8AD]'
                      : 'text-[#17343A] hover:text-[#00A8AD]'
                  }`
                }
              >
                Contact
              </NavLink>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00A8AD]/10 text-[#063F4D] text-xs font-bold">
                    <User className="w-3.5 h-3.5 text-[#00A8AD]" />
                    <span className="max-w-[110px] truncate">{user.displayName || user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/signin"
                  id="menu-sign-in-btn"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-[#00A8AD] text-white shadow-sm'
                        : 'bg-[#00A8AD]/10 text-[#00A8AD] hover:bg-[#00A8AD] hover:text-white'
                    }`
                  }
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </NavLink>
              )}
            </nav>

            {/* Right CTAs */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-2.5">
              {/* Public Booking Lookup Button */}
              <button
                id="header-track-booking-btn"
                type="button"
                onClick={openPortalModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[#063F4D] hover:text-[#00A8AD] bg-[#BFEDEE]/25 hover:bg-[#BFEDEE]/45 font-bold text-xs transition-all border border-[#063F4D]/15 hover:border-[#00A8AD]/40 cursor-pointer shadow-xs"
                title="Lookup & Track Booking"
                aria-label="Track Booking"
              >
                <Clock3 className="w-3.5 h-3.5 text-[#00A8AD]" />
                <span className="whitespace-nowrap">Track Booking</span>
              </button>

              {/* Book Now CTA button */}
              <button
                id="header-get-quote-btn"
                type="button"
                onClick={() => onOpenQuoteModal()}
                className="bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>BOOK NOW</span>
                <Sparkles className="w-4 h-4 text-[#BFEDEE]" />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              <a
                href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                id="mobile-nav-call-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#063F4D] text-white text-xs font-bold"
                aria-label="Call Now"
              >
                <Phone className="w-3.5 h-3.5 text-[#BFEDEE]" />
                <span>Call</span>
              </a>

              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#063F4D] hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Quick Action Strip */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openPortalModal();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#BFEDEE]/30 text-[#063F4D] font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200/80 cursor-pointer transition-colors"
              >
                <Clock3 className="w-3.5 h-3.5 text-[#00A8AD]" />
                <span>Track Booking</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#00A8AD] hover:bg-[#063F4D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#BFEDEE]" />
                <span>Book Now</span>
              </button>
            </div>

            <div className="space-y-1 text-left">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-sm font-bold ${
                    isActive ? 'bg-[#BFEDEE]/40 text-[#00A8AD]' : 'text-[#063F4D]'
                  }`
                }
              >
                Home
              </NavLink>

              <div className="px-3 pt-2 pb-1 text-xs font-extrabold uppercase text-[#00A8AD] tracking-wider">
                Services
              </div>
              <NavLink
                to="/services"
                end
                className={({ isActive }) =>
                  `block px-4 py-1.5 text-xs font-semibold ${
                    isActive ? 'text-[#00A8AD] font-bold' : 'text-slate-700'
                  }`
                }
              >
                • All Services Overview
              </NavLink>
              {serviceSublinks.map((sub) => (
                <NavLink
                  key={sub.name}
                  to={sub.to}
                  className={({ isActive }) =>
                    `block px-4 py-1.5 text-xs font-semibold ${
                      isActive ? 'text-[#00A8AD] font-bold' : 'text-slate-700'
                    }`
                  }
                >
                  • {sub.name}
                </NavLink>
              ))}

              <div className="pt-2 border-t border-slate-100 my-1" />

              <NavLink
                to="/why-choose-us"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-sm font-bold ${
                    isActive ? 'bg-[#BFEDEE]/40 text-[#00A8AD]' : 'text-[#063F4D]'
                  }`
                }
              >
                Why Choose Us
              </NavLink>

              <NavLink
                to="/our-work"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-sm font-bold ${
                    isActive ? 'bg-[#BFEDEE]/40 text-[#00A8AD]' : 'text-[#063F4D]'
                  }`
                }
              >
                Our Work & Before/After
              </NavLink>

              <NavLink
                to="/service-area"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-sm font-bold ${
                    isActive ? 'bg-[#BFEDEE]/40 text-[#00A8AD]' : 'text-[#063F4D]'
                  }`
                }
              >
                Service Area (Winnipeg)
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-sm font-bold ${
                    isActive ? 'bg-[#BFEDEE]/40 text-[#00A8AD]' : 'text-[#063F4D]'
                  }`
                }
              >
                About Us
              </NavLink>

              <NavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-sm font-bold ${
                    isActive ? 'bg-[#BFEDEE]/40 text-[#00A8AD]' : 'text-[#063F4D]'
                  }`
                }
              >
                Contact
              </NavLink>

              {user ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#063F4D] truncate">
                    <User className="w-4 h-4 text-[#00A8AD] shrink-0" />
                    <span className="truncate">{user.displayName || user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer pl-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/signin"
                  id="mobile-menu-sign-in-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      isActive ? 'bg-[#00A8AD] text-white' : 'bg-[#00A8AD]/10 text-[#00A8AD] hover:bg-[#00A8AD] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </div>
                </NavLink>
              )}
            </div>

            {/* Mobile Contact Box */}
            <div className="p-4 rounded-2xl bg-[#F5F8F8] border border-slate-200 space-y-3 text-left">
              <div className="text-xs font-bold text-[#063F4D] uppercase">
                Call Us Directly
              </div>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={`tel:${COMPANY_INFO.primaryPhoneRaw}`}
                  className="flex items-center gap-2 text-sm font-bold text-[#00A8AD]"
                >
                  <Phone className="w-4 h-4" />
                  <span>{COMPANY_INFO.primaryPhone} (Primary)</span>
                </a>
                <a
                  href={`tel:${COMPANY_INFO.secondaryPhoneRaw}`}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{COMPANY_INFO.secondaryPhone} (Secondary)</span>
                </a>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full py-3 rounded-xl bg-[#00A8AD] text-white font-extrabold text-xs shadow-md text-center cursor-pointer"
              >
                BOOK NOW
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
