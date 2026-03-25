import React from 'react';

const HeroSection = ({ setIsBookingModalOpen }) => {
  return (
    <section className="relative min-h-screen flex items-start pt-[84px] lg:pt-[96px] overflow-hidden">
      {/* Background with the generated image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/modern_clinic_hero_bg_1774320276486.png" 
          alt="Modern Clinic" 
          className="w-full h-full object-cover"
        />
        {/* Soft overlay for text readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent md:w-3/4"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10 py-0">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-blue-primary/10 border border-blue-primary/15 text-blue-mid py-1.5 px-4 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-primary animate-pulse"></span>
            Aranthangi's Best Clinic
          </div>

          {/* Headline */}
          <h1 className="font-serif font-black text-ink leading-[1.04] tracking-tight mb-6 animate-slide-up"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.2rem)' }}>
            Clinical <span className="text-blue-primary">Precision</span><br />
            Defined.
          </h1>

          {/* Sub */}
          <p className="text-muted-text text-xl leading-relaxed max-w-xl mb-10 animate-slide-up stagger-1 opacity-90 font-medium">
            Experience a healthcare journey where technology meets human touch. Secure your appointment with real-time token tracking and zero waiting room fatigue.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-6 animate-slide-up stagger-2">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-blue-primary hover:bg-blue-mid text-white px-10 h-[64px] rounded-2xl text-[15px] font-bold uppercase tracking-[0.1em] transition-all transform active:scale-95 shadow-[0_20px_40px_-12px_rgba(24,71,194,0.35)] flex items-center gap-3 group"
            >
              Book a token
              <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button 
              onClick={() => { window.location.href = '/status'; }}
              className="px-10 h-[64px] rounded-2xl text-[15px] font-bold uppercase tracking-[0.1em] text-ink border-2 border-slate-100 hover:border-ink/10 hover:bg-white transition-all transform active:scale-95 flex items-center gap-3 bg-white/80 backdrop-blur-md"
            >
              View Live Wait Time
            </button>
          </div>
        </div>
      </div>

      {/* Stats Quick-bar floating? Or separate section. The image shows it as a bar below hero. */}
    </section>
  );
};

export default HeroSection;
