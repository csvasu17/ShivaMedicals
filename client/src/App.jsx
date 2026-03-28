import React, { useState, useEffect } from 'react';
import StatusBoard from './pages/StatusBoard';
import Dashboard from './pages/Dashboard';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BookingModal from './components/modals/BookingModal';
import LoginModal from './components/modals/LoginModal';
import HeroSection from './components/sections/HeroSection';
import StatsSection from './components/sections/StatsSection';
import ServicesSection from './components/sections/ServicesSection';
import DoctorsSection from './components/sections/DoctorsSection';
import HowItWorks from './components/sections/HowItWorks';
import FeaturesSection from './components/sections/FeaturesSection';
import TestimonialsSection from './components/sections/TestimonialsSection';
import FinalCTA from './components/sections/FinalCTA';

function App() {
  const [route, setRoute] = useState('home'); 
  const [user, setUser] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
      else if (path === '/admin' || path === '/staff/dashboard') setRoute('admin');
      else setRoute('home');
    };

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    
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

  if (route === 'status') return <StatusBoard />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans scroll-smooth">
      
      {/* PREMIUM BACKGROUND MESH */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[100px]"></div>
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-purple-100/20 rounded-full blur-[80px]"></div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* NAVBAR: Always visible, even in Dashboard per USER REQUEST */}
      {!isBookingModalOpen && !isLoginModalOpen && (
        <Navbar 
          setRoute={setRoute} 
          user={user} 
          setIsLoginModalOpen={setIsLoginModalOpen} 
          setIsBookingModalOpen={setIsBookingModalOpen} 
          isScrolled={isScrolled || route === 'admin'} 
          currentRoute={route}
          onLogout={logout}
        />
      )}

      <main className={`flex-1 transition-all duration-500 mt-[68px]`}>
        {route === 'home' && (
          <div className="animate-fade-in">
            <HeroSection setIsBookingModalOpen={setIsBookingModalOpen} />
            <StatsSection />
            <ServicesSection setIsBookingModalOpen={setIsBookingModalOpen} />
            <TestimonialsSection />
            <FinalCTA setIsBookingModalOpen={setIsBookingModalOpen} />
          </div>
        )}

        {route === 'doctors' && (
          <div className="animate-fade-in pt-12">
            <DoctorsSection setIsBookingModalOpen={setIsBookingModalOpen} />
            <FinalCTA setIsBookingModalOpen={setIsBookingModalOpen} />
          </div>
        )}

        {route === 'features' && (
          <div className="animate-fade-in pt-12">
            <FeaturesSection />
            <FinalCTA setIsBookingModalOpen={setIsBookingModalOpen} />
          </div>
        )}
        
        {route === 'admin' && (
          <div className="animate-fade-in transition-all">
            <Dashboard 
              user={user} 
              setRoute={setRoute} 
              onAddPatient={() => setIsBookingModalOpen(true)}
              onLogout={logout}
            />
          </div>
        )}
      </main>

      {(route === 'home' || route === 'doctors' || route === 'features') && <Footer setIsLoginModalOpen={setIsLoginModalOpen} />}
    </div>
  );
}

export default App;
