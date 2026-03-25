import React from 'react';

const FeaturesSection = () => {
  const features = [
    { 
      t: "Real-time availability", 
      d: "Every slot on the system will hit the doctor's current book status.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><polyline points="12 8 12 12 16 14" /></svg>,
      bg: "bg-blue-50",
      color: "text-blue-primary"
    },
    { 
      t: "WhatsApp reminder", 
      d: "Automated alerts sent to your phone so you never miss a slot.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
      bg: "bg-teal-50",
      color: "text-teal-primary"
    },
    { 
      t: "OTP-secured booking", 
      d: "Safe, secure, and authenticated access to your medical sessions.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>,
      bg: "bg-indigo-50",
      color: "text-blue-mid"
    },
    { 
      t: "Precise wait estimate", 
      d: "Smart algorithms calculate your wait time based on patient flow.", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
      bg: "bg-purple-50",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="px-6 md:px-12 lg:px-24 py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-50 hover:border-slate-100 hover:shadow-xl hover:translate-y-[-4px] transition-all group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-10 transition-transform group-hover:scale-110 shadow-sm shadow-slate-200/50`}>
                {f.icon}
              </div>
              <h4 className="text-xl font-bold text-ink mb-4 tracking-tight leading-tight">{f.t}</h4>
              <p className="text-muted-text/80 text-[15px] leading-relaxed font-medium">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
