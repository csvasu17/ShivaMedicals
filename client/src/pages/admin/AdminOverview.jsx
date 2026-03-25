import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const AdminOverview = ({ user }) => {
  const [stats, setStats] = useState({
    todayPatients: 0,
    monthRevenue: '—',
    topDoctor: '—',
    activeSessions: 0,
  });

  useEffect(() => {
    // Mocking some stats for the overview
    setStats({
      todayPatients: 42,
      monthRevenue: '₹12,450',
      topDoctor: 'Dr. Ramesh Kumar',
      activeSessions: 2,
    });
  }, []);

  const cards = [
    { label: "Patients Today", val: stats.todayPatients, label2: "+12 from yesterday", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 11-8 0 4 4 0 018 0", color: "bg-blue-primary/10 text-blue-primary" },
    { label: "Estimated Revenue", val: stats.monthRevenue, label2: "Past 30 days", icon: "M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", color: "bg-teal-primary/10 text-teal-primary" },
    { label: "Top Performer", val: stats.topDoctor, label2: "Highest consultation rate", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z", color: "bg-purple-100 text-purple-600" },
    { label: "Active Sessions", val: stats.activeSessions, label2: "Morning & Evening", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-pink-100 text-pink-600" },
  ];

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
         <div>
            <h2 className="text-3xl font-serif font-medium text-ink tracking-tight mb-1">Performance Overview</h2>
            <p className="text-muted-text text-sm">Real-time analytics and clinic activity logs.</p>
         </div>
         <button className="bg-white border text-ink h-11 px-6 rounded-xl flex items-center gap-2 font-bold text-[13px] shadow-sm hover:border-blue-primary/30 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 17v-2a4 4 0 014-4h5M20 20l-3-3m0 0l-3 3m3-3V4"/></svg>
            Export data
         </button>
      </div>

      {/* TREND SECTION MOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-ink rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-blue-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-serif font-medium text-white mb-1">Queue Traffic</h3>
                  <p className="text-white/40 text-sm">Peak hours during the morning session.</p>
               </div>
               <div className="flex gap-2">
                  <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-white/60 tracking-widest uppercase">Weekly view</div>
               </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4">
               {[40, 65, 30, 85, 55, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                     <div className="w-full relative bg-white/5 rounded-t-xl overflow-hidden group-hover:bg-white/10 transition-colors" style={{ height: `${h}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-blue-mid h-[100%] transition-all duration-1000 origin-bottom scale-y-0 group-hover:scale-y-100" style={{ transform: 'scaleY(1)', transitionDelay: `${i*100}ms` }}></div>
                     </div>
                     <p className="mt-4 text-[10px] font-black text-white/30 uppercase tracking-widest">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm shadow-slate-200/40">
            <h3 className="text-2xl font-serif font-medium text-ink mb-10">Recent Activity</h3>
            <div className="space-y-8">
               {[
                 { t: "New admin user added", time: "2h ago", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                 { t: "Dr. Sarah changed evening slot", time: "4h ago", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                 { t: "Monthly report generated", time: "Yesterday", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
               ].map((act, i) => (
                  <div key={i} className="flex items-start gap-5 group">
                     <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:border-blue-primary/20 transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7490" strokeWidth="2.5"><path d={act.icon} /></svg>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-ink leading-snug mb-1">{act.t}</p>
                        <p className="text-[11px] text-muted-text font-medium">{act.time}</p>
                     </div>
                  </div>
               ))}
            </div>
            <button className="w-full mt-12 py-4 border-2 border-slate-50 bg-slate-50/30 rounded-2xl text-[12px] font-bold text-ink/60 uppercase tracking-widest hover:bg-slate-50 hover:text-ink transition-all active:scale-95">View all history</button>
         </div>
      </div>
    </div>
  );
};

export default AdminOverview;
