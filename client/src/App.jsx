import React, { useState, useEffect } from 'react';
import StatusBoard from './pages/StatusBoard';
import Dashboard from './pages/Dashboard';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BookingModal from './components/modals/BookingModal';
import LoginModal from './components/modals/LoginModal';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import DoctorsSection from './components/sections/DoctorsSection';
import HowItWorks from './components/sections/HowItWorks';
import FeaturesSection from './components/sections/FeaturesSection';
import TestimonialsSection from './components/sections/TestimonialsSection';
import FinalCTA from './components/sections/FinalCTA';
import ContactPage from './pages/ContactPage';

function App() {
  const [route, setRoute] = useState('home'); 
  const [user, setUser] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInitialDoctorId, setBookingInitialDoctorId] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [bookingCancelMode, setBookingCancelMode] = useState(false);
  const [bookingIsExtra, setBookingIsExtra] = useState(false);

  const openBookingModal = (doctorId = null, isCancel = false, isExtra = false) => {
    setBookingInitialDoctorId(doctorId);
    setBookingCancelMode(isCancel);
    setBookingIsExtra(isExtra);
    setIsBookingModalOpen(true);
  };
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const path = window.location.pathname;
    if (path === '/status') {
      setRoute('status');
    } else if (path === '/doctors') {
      setRoute('doctors');
    } else if (path === '/features') {
      setRoute('features');
    } else if (path === '/contact') {
      setRoute('contact');
    } else if (path === '/admin' || path === '/staff/dashboard') {
      setRoute('admin');
    } else {
      setRoute('home');
    }

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/status') setRoute('status');
      else if (path === '/doctors') setRoute('doctors');
      else if (path === '/features') setRoute('features');
      else if (path === '/contact') setRoute('contact');
      else if (path === '/admin' || path === '/staff/dashboard') setRoute('admin');
      else setRoute('home');
    };

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoginModalOpen(false);
    setRoute('admin');
    window.history.pushState({}, '', '/staff/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setRoute('home');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F8FB] to-[#EAF2F8] flex flex-col relative overflow-hidden font-sans scroll-smooth">
      
      {/* PREMIUM BACKGROUND MESH */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-50/50 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50/30 rounded-full blur-[100px]"></div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        initialDoctorId={bookingInitialDoctorId}
        initialCancelMode={bookingCancelMode}
        isExtra={bookingIsExtra}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* NAVBAR */}
      <Navbar 
        setRoute={setRoute} 
        user={user} 
        setIsLoginModalOpen={setIsLoginModalOpen} 
        setIsBookingModalOpen={openBookingModal} 
        isScrolled={isScrolled || route === 'admin' || route === 'doctors' || route === 'features' || route === 'status' || route === 'contact'} 
        currentRoute={route}
        onLogout={logout}
      />

      <main className="flex-1 transition-all duration-500">
        {route === 'home' && (
          <div className="animate-fade-in">
            <HeroSection setIsBookingModalOpen={openBookingModal} />
            <ServicesSection setIsBookingModalOpen={openBookingModal} />
            <TestimonialsSection />
            <FinalCTA setIsBookingModalOpen={openBookingModal} />
          </div>
        )}

        {route === 'doctors' && (
          <div className="animate-fade-in">
            <DoctorsSection setIsBookingModalOpen={openBookingModal} />
            <FinalCTA setIsBookingModalOpen={openBookingModal} />
          </div>
        )}

        {route === 'features' && (
          <div className="animate-fade-in">
            <FeaturesSection />
            <FinalCTA setIsBookingModalOpen={openBookingModal} />
          </div>
        )}

        {route === 'status' && (
          <div className="animate-fade-in">
            <StatusBoard />
          </div>
        )}

        {route === 'contact' && (
          <div className="animate-fade-in">
            <ContactPage />
          </div>
        )}
        
        {route === 'admin' && (
          <div className="animate-fade-in transition-all">
            <Dashboard 
              user={user} 
              setRoute={setRoute} 
              onAddPatient={openBookingModal}
              onLogout={logout}
            />
          </div>
        )}
      </main>

      {(route === 'home' || route === 'doctors' || route === 'features' || route === 'status' || route === 'contact') && <Footer setIsLoginModalOpen={setIsLoginModalOpen} />}
    </div>
  );
}

export default App;
