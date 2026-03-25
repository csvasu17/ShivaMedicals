import React from 'react';

const StatsSection = () => {
  const stats = [
    { 
      val: "25+", 
      label: "EXPERT DOCTORS", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14l-7 7-7-7m14-4l-7 7-7-7" /></svg>,
      bg: "bg-blue-50/50"
    },
    { 
      val: "150+", 
      label: "DAILY SESSIONS", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      bg: "bg-indigo-50/50"
    },
    { 
      val: "12 min", 
      label: "AVG WAIT TIME", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      bg: "bg-teal-50/50"
    }
  ];

  return (
    <div className="bg-white border-y border-slate-100 py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-12 lg:gap-0">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-6 group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`w-14 h-14 rounded-2xl ${s.bg} text-blue-primary flex items-center justify-center transition-transform group-hover:scale-110`}>
              {s.icon}
            </div>
            <div>
              <div className="text-3xl font-black text-ink leading-none mb-1">{s.val}</div>
              <div className="text-[11px] font-bold text-muted-text/60 uppercase tracking-[0.2em]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
