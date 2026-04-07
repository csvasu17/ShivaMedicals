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
        <ClinicLogo className="w-10 h-10 md:w-14 md:h-14" />
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
            className="text-[12px] font-bold uppercase tracking-[0.15em] text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 group"
          >
             <span className="hidden sm:inline">Log Out</span>
             <svg className="group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        ) : (
          <>
            <button 
              onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} 
              className="hidden lg:flex text-[15px] font-bold text-slate-500 hover:text-ink transition-all duration-300 items-center gap-2 group whitespace-nowrap"
            >
               Staff
               <svg className="group-hover:rotate-12 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </button>
            <button 
              onClick={() => { setIsBookingModalOpen(true); setIsMobileMenuOpen(false); }} 
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 md:px-5 h-[38px] md:h-[42px] rounded-full text-[11px] md:text-[13px] font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-lg shadow-teal-500/20 hover:shadow-teal-600/40 flex items-center gap-2 group whitespace-nowrap"
            >
              <span className="hidden sm:inline">Book Token</span>
              <span className="sm:hidden">Book</span>
              <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </>
        )}

        {/* MOBILE MENU TOGGLE */}
        {!user && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden w-10 h-10 flex items-center justify-center text-ink"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 8h16M4 16h16"/></svg>
            )}
          </button>
        )}
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] bg-white z-[999] animate-fade-in xl:hidden overflow-y-auto pb-10">
          <div className="flex flex-col p-8 gap-6">
            {[
              { id: 'home', label: 'Home' },
              { id: 'doctors', label: 'Doctors' },
              { id: 'features', label: 'Features' },
              { id: 'status', label: 'Live Board' },
              { id: 'contact', label: 'Contact' },
              { id: 'login', label: 'Staff Login', action: () => setIsLoginModalOpen(true) },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setRoute(item.id);
                    if (item.id === 'home') window.history.pushState({}, '', '/');
                    else window.history.pushState({}, '', `/${item.id}`);
                  }
                  setIsMobileMenuOpen(false);
                }} 
                className={`text-left text-2xl font-serif font-medium tracking-tight ${
                  currentRoute === item.id ? 'text-blue-primary' : 'text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
