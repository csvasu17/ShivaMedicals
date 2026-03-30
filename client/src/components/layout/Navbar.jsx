import React from 'react';

const Navbar = ({ setRoute, user, setIsLoginModalOpen, setIsBookingModalOpen, isScrolled, currentRoute, onLogout }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-[2000] flex items-center justify-between px-6 md:px-12 h-[72px] transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => { setRoute('home'); window.history.pushState({}, '', '/'); }}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-blue-100 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-primary/10">
          <img src="/shiva-logo.jpg" alt="Semmalar Clinic & Shiva Medical Logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-serif text-xl md:text-2xl font-medium text-ink tracking-tight whitespace-nowrap transition-colors group-hover:text-blue-primary">
          Semmalar Clinic & Shiva Medical
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

      <div className="flex items-center gap-5">
        {user ? (
          <button 
            onClick={onLogout}
            className="text-[12px] font-bold uppercase tracking-[0.15em] text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 group"
          >
             Log Out
             <svg className="group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        ) : (
          <>
            <button 
              onClick={() => setIsLoginModalOpen(true)} 
              className="text-[16px] font-bold text-slate-500 hover:text-ink transition-all duration-300 flex items-center gap-2 group whitespace-nowrap"
            >
               Staff Login
               <svg className="group-hover:rotate-12 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </button>
            <button 
              onClick={() => setIsBookingModalOpen(true)} 
              className="bg-blue-primary hover:bg-blue-mid text-white px-5 h-[42px] rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-lg shadow-blue-primary/20 flex items-center gap-2 group whitespace-nowrap"
            >
              Book Appointment
              <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
