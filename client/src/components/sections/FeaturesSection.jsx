import React from 'react';

const FeaturesSection = () => {
  const features = [
    { 
      t: "Real-time availability", 
      d: "Every slot on the system will hit the doctor's current book status flawlessly.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      bg: "bg-blue-500/10",
      color: "text-blue-600",
      glow: "from-blue-400/20 via-blue-100/10 to-transparent",
      glowPos: "bottom-[-10%] left-[-10%] w-[120%] h-[100%]"
    },
    { 
      t: "WhatsApp reminder", 
      d: "Automated alerts sent to your phone so you never miss a medical slot.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
      bg: "bg-emerald-500/10",
      color: "text-emerald-600",
      glow: "from-emerald-400/20 via-emerald-100/10 to-transparent",
      glowPos: "bottom-[-10%] left-[-10%] w-[120%] h-[100%]"
    },
    { 
      t: "OTP-secured booking", 
      d: "Safe, secure, and authenticated access to your private medical sessions.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>,
      bg: "bg-blue-500/10",
      color: "text-blue-600",
      glow: "from-blue-400/20 via-blue-100/10 to-transparent",
      glowPos: "bottom-[-10%] left-[-10%] w-[120%] h-[100%]",
      showLearnMore: true
    },
    { 
      t: "Precise wait estimate", 
      d: "Smart algorithms calculate your wait time based on real patient flow.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      bg: "bg-purple-500/10",
      color: "text-purple-600",
      glow: "from-purple-400/20 via-pink-100/10 to-transparent",
      glowPos: "top-[-10%] right-[-10%] w-[130%] h-[120%] rotate-[15deg] origin-center",
      secondaryGlow: "from-pink-400/15 to-transparent",
      secondaryGlowPos: "bottom-[-10%] left-[-10%] w-[80%] h-[70%]"
    }
  ];

  return (
    <section className="px-6 md:px-12 lg:px-24 py-24 bg-transparent relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 animate-slide-up">
           <span className="eyebrow mx-auto mb-6">Cutting Edge Platform</span>
           <h2 className="sec-title !text-4xl md:!text-5xl lg:max-w-3xl mx-auto">Smart features for a <span className="text-brand-green">Modern Clinic</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="relative group animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* EXTERNAL BLOOM GLOW (The "Background Shadow") */}
              <div 
                className={`absolute -inset-4 bg-gradient-to-tr ${f.glow} rounded-[50px] blur-3xl opacity-0 group-hover:opacity-60 transition-all duration-700 pointer-events-none group-hover:-translate-y-2`}
              ></div>

              <div className="relative p-8 md:p-10 p-card flex flex-col items-start h-full h-full bg-white/90 backdrop-blur-sm">
                {/* STARDUST NOISE OVERLAY */}
                <div 
                  className="absolute inset-0 z-1 pointer-events-none opacity-[0.2] mix-blend-overlay group-hover:opacity-[0.35] transition-opacity duration-1000" 
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                ></div>

                {/* GLASS EDGE HIGHLIGHT */}
                <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-[40px] border-t border-x border-white/90 shadow-[inset_0_2px_12px_rgba(255,255,255,1)] pointer-events-none z-[1]"></div>

                {/* CONTENT */}
                <div className="relative z-10 flex flex-col h-full w-full">
                  <div className={`w-14 h-14 rounded-[24px] ${f.bg} ${f.color} flex items-center justify-center mb-10 p-card-icon border border-white/50 backdrop-blur-md`}>
                    {f.icon}
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-ink mb-4 tracking-tight leading-tight p-card-title">{f.t}</h4>
                  <p className="text-muted-text text-[15px] leading-relaxed mb-10 flex-grow font-medium opacity-80">
                    {f.d}
                  </p>
                  
                  {f.showLearnMore && (
                    <div className={`flex items-center gap-2 ${f.color} font-black text-[12px] uppercase tracking-widest transition-all duration-700 cursor-pointer hover:gap-4`}>
                      Learn more
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
