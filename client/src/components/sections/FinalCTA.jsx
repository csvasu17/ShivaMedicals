import React from 'react';

const FinalCTA = ({ setIsBookingModalOpen }) => {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-24 bg-white">
      <div className="bg-blue-primary rounded-[56px] p-12 md:p-20 lg:p-24 relative overflow-hidden text-center group">
        {/* Decorative Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none">
          <span className="text-[200px] font-black text-white leading-none rotate-[-5deg] tracking-tighter">SAFE FOR<br/>VISIT</span>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-tight animate-slide-up">Ready for<br/>your visit?</h2>
          <p className="text-white/80 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Join 500+ patients who experience zero-wait healthcare at Shiva Medicals every week.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 animate-slide-up stagger-2">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-blue-primary px-10 h-[64px] rounded-2xl text-[15px] font-black uppercase tracking-[0.1em] transition-all transform active:scale-95 shadow-2xl shadow-blue-primary/40"
            >
              Book Your Token Now
            </button>
            <button className="px-10 h-[64px] rounded-2xl text-[15px] font-black uppercase tracking-[0.1em] text-white border-2 border-white/20 hover:border-white transition-all transform active:scale-95 bg-white/5 backdrop-blur-md">
              Contact Clinic
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
