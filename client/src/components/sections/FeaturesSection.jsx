import React from 'react';

const FeaturesSection = () => {
  const features = [
    { 
      t: "Real-time availability", 
      d: "Every slot on the system will hit the doctor's current book status flawlessly.", 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><polyline points="12 8 12 12 16 14" /></svg>,
      bg: "bg-blue-primary/10",
      color: "text-blue-primary",
      shadow: "shadow-blue-primary/10"
    },
    { 
      t: "WhatsApp reminder", 
      d: "Automated alerts sent to your phone so you never miss a medical slot.", 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
      bg: "bg-teal-primary/10",
      color: "text-teal-primary",
      shadow: "shadow-teal-primary/10"
    },
    { 
      t: "OTP-secured booking", 
      d: "Safe, secure, and authenticated access to your private medical sessions.", 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>,
      bg: "bg-indigo-500/10",
      color: "text-blue-mid",
      shadow: "shadow-blue-mid/10"
    },
    { 
      t: "Precise wait estimate", 
      d: "Smart algorithms calculate your wait time based on real patient flow.", 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
      bg: "bg-purple-500/10",
      color: "text-purple-600",
      shadow: "shadow-purple-600/10"
    }
  ];

  return (
    <section className="px-6 md:px-12 lg:px-24 py-24 bg-white relative overflow-hidden" id="features">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 animate-slide-up">
           <span className="eyebrow mx-auto mb-6">Cutting Edge Platform</span>
           <h2 className="sec-title !text-4xl md:!text-5xl lg:max-w-3xl mx-auto">Smart features for a <span className="text-blue-primary">Modern Clinic</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 md:p-10 rounded-[48px] bg-white border border-slate-100 hover:border-blue-primary/20 hover:shadow-2xl hover:shadow-blue-primary/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in flex flex-col items-start" 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-3xl ${f.bg} ${f.color} flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg ${f.shadow}`}>
                {f.icon}
              </div>
              <h4 className="text-2xl font-serif font-bold text-ink mb-4 tracking-tight leading-tight">{f.t}</h4>
              <p className="text-muted-text text-[15px] leading-relaxed mb-8 flex-grow">
                {f.d}
              </p>
              
              <div className="flex items-center gap-2 text-blue-primary font-bold text-[12px] uppercase tracking-widest opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 cursor-pointer">
                Learn more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
