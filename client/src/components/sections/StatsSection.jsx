import React from 'react';

const StatsSection = () => {
  const stats = [
    { 
      val: "4.8 Rating", 
      label: "PATIENT TRUST", 
      icon: (
        <div className="flex text-amber-400">
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          ))}
        </div>
      )
    },
    { 
      val: "10+ Specialists", 
      label: "EXPERT CARE", 
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-primary/10 flex items-center justify-center text-blue-primary group-hover:bg-blue-primary group-hover:text-white transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M17 11l2 2 4-4"/></svg>
        </div>
      )
    },
    { 
      val: "5000+ Patients", 
      label: "HAPPY RECOVERY", 
      icon: (
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
      )
    }
  ];

  return (
    <div className="relative z-20 -mt-10 mb-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto glass-card rounded-[32px] p-8 md:p-12 flex flex-wrap justify-between items-center gap-10 md:gap-0 animate-slide-up">
        {stats.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-6 group hover:-translate-y-1 transition-transform duration-300">
              <div className="shrink-0">{s.icon}</div>
              <div>
                <div className="text-2xl font-serif font-bold text-ink mb-0.5 tracking-tight">{s.val}</div>
                <div className="text-[10px] font-bold text-muted-text/50 uppercase tracking-[0.25em]">{s.label}</div>
              </div>
            </div>
            {i < stats.length - 1 && (
              <div className="hidden lg:block h-10 w-px bg-slate-200/60"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
