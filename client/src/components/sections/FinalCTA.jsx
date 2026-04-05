import React from 'react';

const FinalCTA = ({ setIsBookingModalOpen }) => {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-16 bg-transparent relative overflow-hidden">
      {/* Dynamic Background elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100/20 rounded-full blur-[80px] -z-10"></div>

      <div className="bg-ink rounded-[40px] md:rounded-[56px] p-10 md:p-14 lg:p-20 relative overflow-hidden text-center group">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        
        {/* Decorative Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <span className="text-[100px] md:text-[180px] font-black text-white leading-none rotate-[-5deg] tracking-tighter uppercase whitespace-nowrap">SHIVA MEDICAL</span>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 py-1.5 px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-mid animate-pulse"></span>
            Available Now
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6 tracking-tight leading-[1.1] animate-slide-up">
            Ready for <br className="hidden md:block" /> <span className="italic text-blue-mid">Your Visit?</span>
          </h2>
          
          <p className="text-white/60 text-base md:text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Join 500+ patients who experience zero-wait healthcare at <span className="text-white">Shiva Medical</span> every week.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 animate-slide-up stagger-2">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-white hover:bg-teal-50 text-teal-600 px-10 h-14 rounded-2xl text-[14px] font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-xl shadow-teal-500/30 flex items-center gap-3 group"
            >
              Book Appointment
              <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button 
              onClick={() => { window.location.href = 'tel:+919787004716'; }}
              className="px-10 h-14 rounded-2xl text-[14px] font-bold uppercase tracking-widest text-white border-2 border-white/10 hover:border-white transition-all transform active:scale-95 bg-white/5 backdrop-blur-md flex items-center gap-3 group"
            >
              Contact Clinic
              <svg className="group-hover:translate-y-[-2px] transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
