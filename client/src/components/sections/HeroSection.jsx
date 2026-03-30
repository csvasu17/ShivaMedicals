import React from 'react';

const HeroSection = ({ setIsBookingModalOpen }) => {
  return (
    <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden">
      {/* Background with the generated image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/modern_clinic_hero_bg_1774320276486.png" 
          alt="Modern Clinic" 
          className="w-full h-full object-cover scale-105 animate-pulse-slow"
        />
        {/* Advanced overlay for depth and readability */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent md:w-[70%] lg:w-[60%]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent h-1/3 bottom-0"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="eyebrow">
            <span className="w-2 h-2 rounded-full bg-blue-primary animate-pulse"></span>
            ★ Aranthangi's Best Clinic
          </div>

          {/* Headline */}
          <h1 className="sec-title animate-slide-up">
            Clinical <span className="text-blue-primary relative inline-block">
              Precision
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </span><br />
            Defined.
          </h1>

          {/* Subheading */}
          <p className="sec-sub animate-slide-up stagger-1">
            Experience advanced care powered by technology, delivered with compassion. Secure your appointment with real-time appointment tracking and zero waiting room fatigue.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-6 animate-slide-up stagger-2">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="btn-premium group"
            >
              <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              Book Appointment
              <svg className="group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button 
              onClick={() => { window.location.href = '/status'; }}
              className="px-10 h-14 rounded-2xl text-[14px] font-bold uppercase tracking-widest text-ink border-2 border-slate-200 hover:border-blue-primary hover:bg-white transition-all transform active:scale-95 flex items-center gap-3 bg-white/60 backdrop-blur-md"
            >
              View Live Wait Time
            </button>
          </div>

          {/* Floating Stats Quick-bar */}
          <div className="mt-20 flex flex-wrap items-center gap-12 border-t border-slate-200/50 pt-10 animate-fade-in stagger-3">
             <div className="flex items-center gap-3">
               <div className="flex">
                 {[1,2,3,4,5].map(i => (
                   <svg key={i} className="text-amber-400" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                 ))}
               </div>
               <span className="font-bold text-ink">4.8 Rating</span>
             </div>
             <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-blue-primary/10 flex items-center justify-center text-blue-primary">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 14l-7 7-7-7m14-8l-7 7-7-7"/></svg>
               </div>
               <span className="font-bold text-ink">10+ Specialists</span>
             </div>
             <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
               </div>
               <span className="font-bold text-ink">5000+ Happy Patients</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
