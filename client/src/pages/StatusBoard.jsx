import React, { useState, useEffect } from 'react';

export default function StatusBoard() {
  const [doctors, setDoctors] = useState([]);
  const [currentTokens, setCurrentTokens] = useState({}); // {doctorId: {tokenNumber, patientName}}
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const fetchData = async () => {
    try {
      const docRes = await fetch(`${API_URL}/api/doctors`);
      const docs = await docRes.json();
      setDoctors(docs);

      const tokenData = {};
      const date = new Date().toISOString().split('T')[0];

      for (const doc of docs) {
        const sessRes = await fetch(`${API_URL}/api/sessions/${doc.id}`);
        const sessions = await sessRes.json();
        
        for (const sess of sessions) {
          const queueRes = await fetch(`${API_URL}/api/queue/live/${sess.id}/${date}`);
          const liveToken = await queueRes.json();
          if (liveToken) {
            tokenData[doc.id] = {
               token: liveToken.token_number,
               name: liveToken.patient_name,
               session: sess.session_type
            };
            break;
          }
        }
      }
      setCurrentTokens(tokenData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching live queue:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-white font-serif">
      <div className="w-20 h-20 bg-blue-primary rounded-[30px] animate-float mb-12 flex items-center justify-center shadow-[0_0_50px_rgba(24,71,194,0.3)]">
         <svg className="w-10 h-10 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
      </div>
      <div className="text-2xl font-medium tracking-tight animate-pulse">Initializing Board</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink text-white p-8 lg:p-12 flex flex-col overflow-hidden relative">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-primary/10 rounded-full blur-[250px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal-primary/5 rounded-full blur-[200px] -z-10"></div>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10 mb-16 border-b border-white/5 pb-10 animate-fade-in relative z-10">
         <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-2 h-2 rounded-full bg-teal-primary animate-pulse shadow-[0_0_15px_rgba(11,143,115,0.8)]"></div>
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.4em]">Live Consultation Sync</span>
            </div>
            <h1 className="text-6xl lg:text-[84px] font-serif font-medium tracking-tight leading-none">
              Care<span className="text-blue-light italic">Token</span>
            </h1>
         </div>
         <div className="flex flex-col items-start lg:items-end">
            <div className="text-7xl lg:text-8xl font-serif font-medium tabular-nums tracking-tighter text-white animate-fade-in">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            <div className="text-[11px] font-bold text-white/30 uppercase tracking-[0.5em] mt-2 pl-2">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
         </div>
      </div>

      {/* DOCTORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1 relative z-10">
         {doctors.map((doc, idx) => (
            <div key={doc.id} className={`bg-white/[0.03] border border-white/5 rounded-[32px] p-10 flex flex-col justify-between relative overflow-hidden backdrop-blur-3xl hover:bg-white/[0.06] transition-all duration-700 animate-slide-up style={{animationDelay: '${idx * 150}ms'}} group`}>
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-primary/10 rounded-full blur-[100px] group-hover:bg-blue-primary/20 transition-all duration-1000 translate-x-1/2 -translate-y-1/2"></div>
               
               <div>
                  <div className="flex items-center gap-4 mb-6">
                     <span className="eyebrow !text-blue-light/60 !bg-transparent !p-0">#{idx + 1} Specialist</span>
                  </div>
                  <h2 className="text-4xl font-serif font-medium mb-1 text-white leading-tight">{doc.name}</h2>
                  <p className="text-white/30 text-sm font-medium uppercase tracking-widest">{doc.specialty || 'Medical Officer'}</p>
               </div>

               <div className="my-10 text-center relative py-6 scale-110 lg:scale-125">
                  {currentTokens[doc.id] ? (
                    <div className="animate-fade-in">
                       <p className="text-blue-light font-bold uppercase text-[10px] tracking-[0.5em] mb-6 opacity-70">Now Consulting</p>
                       <div className="text-[140px] leading-none font-serif font-medium text-white drop-shadow-[0_20px_60px_rgba(74,123,255,0.4)] mb-6 tracking-tighter group-hover:scale-105 transition-transform duration-700 animate-float">
                          {currentTokens[doc.id].token}
                       </div>
                       <div className="px-8 py-3.5 bg-white/10 rounded-2xl inline-block font-bold text-white text-[10px] tracking-[0.4em] uppercase border border-white/5 shadow-2xl backdrop-blur-sm">
                          {currentTokens[doc.id].name}
                       </div>
                    </div>
                  ) : (
                    <div className="py-20 opacity-20 group-hover:opacity-30 transition-opacity">
                       <div className="text-white font-serif italic text-5xl tracking-widest">Available</div>
                       <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-6">Awaiting Next Token</p>
                    </div>
                  )}
               </div>

               <div className="flex items-center justify-between border-t border-white/5 pt-10">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-teal-primary shadow-[0_0_10px_rgba(11,143,115,0.8)]"></div>
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Consultation Room 0{idx + 1}</span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="mt-16 text-center animate-fade-in border-t border-white/5 pt-10">
         <p className="text-white/20 font-bold uppercase tracking-[0.6em] text-[10px]">
           Please wait for your token number to be displayed. Thank you for your patience.
         </p>
      </div>
    </div>
  );
}
