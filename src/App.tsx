import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { QuoteModal } from './components/QuoteModal';
import { AuthProvider } from './contexts/AuthContext';
import { ClientPortalModal } from './components/ClientPortalModal';
import { AdminModal } from './components/AdminModal';

// Multi-page imports
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { AirDuctCleaningPage } from './pages/AirDuctCleaningPage';
import { CarpetCleaningPage } from './pages/CarpetCleaningPage';
import { WindowCleaningPage } from './pages/WindowCleaningPage';
import { ResidentialCleaningPage } from './pages/ResidentialCleaningPage';
import { CommercialCleaningPage } from './pages/CommercialCleaningPage';
import { WhyChooseUsPage } from './pages/WhyChooseUsPage';
import { OurWorkPage } from './pages/OurWorkPage';
import { AboutPage } from './pages/AboutPage';
import { ServiceAreaPage } from './pages/ServiceAreaPage';
import { ContactPage } from './pages/ContactPage';
import { OurBookingsPage } from './pages/OurBookingsPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

export default function App() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [modalService, setModalService] = useState<string | undefined>(undefined);

  const handleOpenQuoteModal = (service?: string) => {
    setModalService(service);
    setIsQuoteModalOpen(true);
  };

  const handleCloseQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setModalService(undefined);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-[#F5F8F8] text-[#17343A] flex flex-col selection:bg-[#BFEDEE] selection:text-[#063F4D]">
          {/* Persistent Multi-Page Navigation */}
          <Navbar onOpenQuoteModal={handleOpenQuoteModal} />

          {/* Multi-Page Route Views */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/services" element={<ServicesPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/services/air-duct-cleaning" element={<AirDuctCleaningPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/services/carpet-cleaning" element={<CarpetCleaningPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/services/window-cleaning" element={<WindowCleaningPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/services/residential" element={<ResidentialCleaningPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/services/commercial" element={<CommercialCleaningPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/why-choose-us" element={<WhyChooseUsPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/our-work" element={<OurWorkPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/about" element={<AboutPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/service-area" element={<ServiceAreaPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/login" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              <Route path="/register" element={<SignUpPage />} />
              <Route path="/our-bookings" element={<OurBookingsPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/booking-confirmation" element={<BookingConfirmationPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/confirmation" element={<BookingConfirmationPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/confirmation/:id" element={<BookingConfirmationPage onOpenQuoteModal={handleOpenQuoteModal} />} />
              <Route path="/booking-status" element={<Navigate to="/our-bookings" replace />} />
              <Route path="/track-booking" element={<Navigate to="/our-bookings" replace />} />
              <Route path="/my-bookings" element={<Navigate to="/our-bookings" replace />} />
              <Route path="/estimator" element={<Navigate to="/contact" replace />} />
              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Persistent Multi-Page Footer */}
          <Footer onOpenQuoteModal={handleOpenQuoteModal} />

          {/* Mobile Sticky Action Bar */}
          <MobileBottomBar onOpenQuoteModal={() => handleOpenQuoteModal()} />

          {/* Global Instant Quote Modal */}
          <QuoteModal
            isOpen={isQuoteModalOpen}
            onClose={handleCloseQuoteModal}
            defaultService={modalService}
          />

          {/* Customer & Admin Client Portal Modal (Lookup & Tracking) */}
          <ClientPortalModal onNewBookingClick={() => handleOpenQuoteModal()} />

          {/* Secure Admin Panel Modal */}
          <AdminModal />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
