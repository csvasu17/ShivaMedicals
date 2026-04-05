import React from 'react';

const services = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    title: 'General Consultation',
    desc: 'Expert diagnosis and personalized treatment plans for all age groups.',
    bg: "bg-blue-500/10",
    color: "text-blue-600",
    glow: "from-blue-400/20 via-blue-100/10 to-transparent",
    glowPos: "bottom-[-10%] left-[-10%] w-[120%] h-[100%]"
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    title: 'Pediatric Care',
    desc: 'Specialized care for infants, children, and adolescents by experienced pediatricians.',
    bg: "bg-emerald-500/10",
    color: "text-emerald-600",
    glow: "from-emerald-400/20 via-emerald-100/10 to-transparent",
    glowPos: "bottom-[-10%] left-[-10%] w-[120%] h-[100%]"
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>,
    title: 'Diagnostic Services',
    desc: 'State-of-the-art lab tests and imaging services for accurate diagnosis.',
    bg: "bg-blue-500/10",
    color: "text-blue-600",
    glow: "from-blue-400/20 via-blue-100/10 to-transparent",
    glowPos: "bottom-[-10%] left-[-10%] w-[120%] h-[100%]",
    showLearnMore: true
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    title: 'Pharmacy & Medications',
    desc: 'Full-service pharmacy providing prescriptions and healthcare products.',
    bg: "bg-purple-500/10",
    color: "text-purple-600",
    glow: "from-purple-400/20 via-pink-100/10 to-transparent",
    glowPos: "top-[-10%] right-[-10%] w-[130%] h-[120%] rotate-[15deg] origin-center",
    secondaryGlow: "from-pink-400/15 to-transparent",
    secondaryGlowPos: "bottom-[-10%] left-[-10%] w-[80%] h-[70%]"
  },
];

const ServicesSection = ({ setIsBookingModalOpen }) => {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-32 bg-transparent relative overflow-hidden" id="services">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24 animate-slide-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ink mb-6">Our Medical Services</h2>
          <p className="text-muted-text text-xl max-w-2xl mx-auto font-medium opacity-80">
            Comprehensive Care Tailored to Your Needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* EXTERNAL BLOOM GLOW (The "Background Shadow") */}
              <div 
                className={`absolute -inset-4 bg-gradient-to-tr ${s.glow} rounded-[50px] blur-3xl opacity-0 group-hover:opacity-60 transition-all duration-700 pointer-events-none group-hover:-translate-y-2`}
              ></div>

              <div className="relative p-8 md:p-10 p-card flex flex-col items-start h-full bg-white/90 backdrop-blur-sm">
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
                  <div className={`w-14 h-14 rounded-[24px] ${s.bg} ${s.color} flex items-center justify-center mb-10 p-card-icon border border-white/50 backdrop-blur-md`}>
                    {s.icon}
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-ink mb-4 tracking-tight leading-tight p-card-title">{s.title}</h4>
                  <p className="text-muted-text text-[15px] leading-relaxed mb-10 flex-grow font-medium opacity-80">
                    {s.desc}
                  </p>
                  
                  {s.showLearnMore && (
                    <div className={`flex items-center gap-2 ${s.color} font-black text-[12px] uppercase tracking-widest transition-all duration-700 cursor-pointer hover:gap-4 underline-offset-4 hover:underline`}>
                      Learn more
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 p-12 bg-slate-50/50 backdrop-blur-md rounded-[48px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] animate-fade-in relative z-10">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-2">Need a specialized consultation?</h3>
            <p className="text-muted-text">Our specialists are available for both in-person and digital consultations.</p>
          </div>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="btn-premium whitespace-nowrap"
          >
            Book a consultation
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
