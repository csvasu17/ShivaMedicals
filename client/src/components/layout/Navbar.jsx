import React, { useState } from 'react';
import ClinicLogo from './ClinicLogo';

const Navbar = ({ setRoute, user, setIsLoginModalOpen, setIsBookingModalOpen, isScrolled, currentRoute, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 md:px-12 h-[72px] transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-md' 
        : 'bg-transparent'
    }`}>
      <div 
        className="flex items-center gap-2 md:gap-3 cursor-pointer group" 
        onClick={() => { setRoute('home'); window.history.pushState({}, '', '/'); setIsMobileMenuOpen(false); }}
      >
        <ClinicLogo className="w-14 h-10 md:w-20 md:h-14" />
        <span className="font-serif text-lg md:text-2xl font-medium text-ink tracking-tight whitespace-nowrap transition-colors group-hover:text-blue-primary">
          Semmalar Clinic
          <span className="hidden sm:inline"> & Shiva Medical</span>
        </span>
      </div>
      
      {!user && (
        <ul className="hidden xl:flex items-center gap-8">
          {[
            { id: 'home', label: 'Home' },
            { id: 'doctors', label: 'Doctors' },
            { id: 'features', label: 'Features' },
            { id: 'status', label: 'Live Board' },
            { id: 'contact', label: 'Contact' },
          ].map(item => (
            <li key={item.id} className="relative group">
              <button 
                onClick={() => {
                  if (item.id === 'status' || item.id === 'home' || item.id === 'doctors' || item.id === 'features' || item.id === 'contact') setRoute(item.id);
                  if (item.id === 'home') window.history.pushState({}, '', '/');
                  if (item.id === 'status') window.history.pushState({}, '', '/status');
                  if (item.id === 'doctors') window.history.pushState({}, '', '/doctors');
                  if (item.id === 'features') window.history.pushState({}, '', '/features');
                  if (item.id === 'contact') window.history.pushState({}, '', '/contact');
                }} 
                className={`text-[15px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  (currentRoute === item.id) ? 'text-blue-primary' : 'text-slate-500 hover:text-ink'
                }`}
              >
                {item.label}
              </button>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-blue-primary transition-all duration-300 ${
                (currentRoute === item.id) ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3 md:gap-5">
        {user ? (
          <button 
            onClick={onLogout}
            className="text-[12px] font-bold uppercase tracking-[0.15em] text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 group cursor-pointer"
          >
             <span className="hidden sm:inline">Log Out</span>
             <svg className="group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        ) : (
          <>
            <button 
              onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} 
              className="hidden lg:flex text-[14px] font-bold text-slate-500 hover:text-ink transition-all duration-250 items-center gap-1.5 group whitespace-nowrap cursor-pointer"
            >
               Staff
               <svg className="group-hover:rotate-12 transition-transform text-slate-400 group-hover:text-ink" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </button>
            <button 
              onClick={() => { setIsBookingModalOpen(); setIsMobileMenuOpen(false); }} 
              className="bg-blue-primary hover:bg-blue-primary/95 text-white px-5 h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center gap-2 group whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
              <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </>
        )}
 
      {/* MOBILE MENU TOGGLE BUTTON */}
      {!user && (
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden w-10 h-10 flex items-center justify-center text-ink rounded-lg hover:bg-slate-100 transition-colors z-[2100] cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      )}
      </div>
 
      {/* MOBILE MENU OVERLAY - FULL SCREEN COVERAGE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-white z-[2000] xl:hidden overflow-hidden flex flex-col animate-fade-in"
          style={{ top: '0', left: '0', height: '100vh', width: '100vw' }}
        >
          {/* Menu Top padding (matching navbar height) */}
          <div className="h-[72px] flex-shrink-0 border-b border-slate-100"></div>
          
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between">
            {/* Nav list */}
            <div className="flex flex-col gap-1">
              {[
                { id: 'home', label: 'Home' },
                { id: 'doctors', label: 'Doctors' },
                { id: 'features', label: 'Features' },
                { id: 'status', label: 'Live Board' },
                { id: 'contact', label: 'Contact' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => {
                    setRoute(item.id);
                    if (item.id === 'home') window.history.pushState({}, '', '/');
                    else window.history.pushState({}, '', `/${item.id}`);
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`text-left h-12 flex items-center text-2xl font-sans font-bold tracking-tight transition-colors duration-150 cursor-pointer ${
                    currentRoute === item.id ? 'text-blue-primary' : 'text-slate-800 hover:text-blue-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Bottom Panel */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <button 
                onClick={() => { setIsBookingModalOpen(); setIsMobileMenuOpen(false); }}
                className="w-full bg-blue-primary hover:bg-blue-primary/95 text-white h-12 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                Book Appointment
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[11px] font-bold text-muted-text uppercase tracking-wider mb-0.5">Staff Portal</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-none">Internal clinic operations</p>
                </div>
                <button
                  onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
