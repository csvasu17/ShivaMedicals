import React, { useState, useEffect, useMemo } from 'react';

import { API_URL } from '../constants/api';

export default function StatusBoard() {
  const [doctors, setDoctors] = useState([]);
  const [currentTokens, setCurrentTokens] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

        const sessionSummaries = [];
        for (const sess of sessions) {
          const queueRes = await fetch(`${API_URL}/api/queue/live/${sess.id}/${date}`);
          const liveToken = await queueRes.json();

          sessionSummaries.push({
            id: sess.id,
            label: sess.session_type,
            start: sess.start_time?.slice(0, 5) || '--:--',
            token: liveToken?.token_number || null,
            patientName: liveToken?.patient_name || null
          });
        }

        const firstActiveSession = sessionSummaries.find((session) => session.token);
        tokenData[doc.id] = {
          activeSession: firstActiveSession || null,
          sessions: sessionSummaries
        };
      }

      setCurrentTokens(tokenData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching live queue:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const liveCount = useMemo(
    () => Object.values(currentTokens).filter((token) => token.activeSession?.token).length,
    [currentTokens]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-ink font-serif pt-20">
        <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-primary shadow-[0_20px_40px_-10px_rgba(24,71,194,0.3)] animate-pulse-slow">
          <svg className="h-8 w-8 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium tracking-tight">Syncing Live Board</div>
          <p className="mt-2 text-sm text-muted-text font-sans">Connecting to clinical appointment streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-[88px] pb-20 px-6 md:px-12 lg:px-24">
      
      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto mb-16 animate-fade-in">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-primary animate-pulse"></span>
              Public Queue Status
            </span>
            <h1 className="sec-title">Live Appointment board for faster, calmer arrivals.</h1>
            <p className="sec-sub">
              Check real-time consultation progress from anywhere. We update the board every few seconds to ensure you arrive exactly when needed.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 xl:min-w-[480px]">
            <div className="p-card p-6 flex flex-col justify-between h-32 bg-slate-50/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-text/60">Current Time</p>
              <p className="text-3xl font-serif text-ink">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
            <div className="p-card p-6 flex flex-col justify-between h-32 bg-slate-50/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-text/60">Active Rooms</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-serif text-blue-primary">{liveCount}</span>
                <span className="h-2 w-2 rounded-full bg-teal-primary animate-pulse"></span>
              </div>
            </div>
            <div className="p-card p-6 flex flex-col justify-between h-32 bg-blue-primary text-white col-span-2 md:col-span-1 shadow-lg shadow-blue-primary/20">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Today</p>
              <p className="text-lg font-bold leading-tight">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 px-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-text/50 mb-2">Clinical Excellence</p>
            <h2 className="text-3xl font-serif font-medium text-ink">Active Consultation Status</h2>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm text-[11px] font-bold text-muted-text/70 animate-pulse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            AUTO-SYNC ENABLED
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doc, idx) => {
            const doctorQueue = currentTokens[doc.id];
            const activeSession = doctorQueue?.activeSession;

            return (
              <article key={doc.id} className="p-card p-8 group animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <span className="inline-block bg-slate-100 text-muted-text px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                      Room {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-ink mb-1 group-hover:text-blue-primary transition-colors">{doc.name}</h3>
                    <p className="text-[11px] font-bold text-muted-text/50 uppercase tracking-widest">{doc.specialty || 'General Practitioner'}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border transition-all ${
                    activeSession 
                    ? 'bg-teal-50 text-teal-600 border-teal-100' 
                    : 'bg-slate-50 text-muted-text/40 border-slate-100'
                  }`}>
                    {activeSession ? '● Live' : 'Offline'}
                  </div>
                </div>

                <div className="rounded-[32px] bg-slate-50 border border-slate-100 p-8 text-center mb-8 transition-all group-hover:bg-white group-hover:shadow-inner group-hover:border-blue-primary/5">
                  {activeSession ? (
                    <div className="animate-fade-in text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-primary/40 mb-2">Now Calling</p>
                      <div className="text-[84px] font-serif font-black leading-none text-ink group-hover:text-blue-primary transition-colors mb-4 italic tracking-tighter">
                        {activeSession.token}
                      </div>
                      <div className="inline-block bg-blue-primary/5 text-blue-primary px-5 py-2 rounded-2xl text-xs font-bold border border-blue-primary/10">
                        {activeSession.patientName}
                      </div>
                      <div className="mt-6 flex items-center justify-center gap-3 text-[11px] font-bold text-muted-text/60 uppercase tracking-widest">
                        <span>{activeSession.label}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Starts {activeSession.start}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 opacity-40">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-text mb-4">Current Appointment</p>
                      <div className="text-4xl font-serif italic mb-4">Standby</div>
                      <p className="text-[11px] font-medium text-muted-text px-4 leading-relaxed">System will update when active consultation begins.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/30 px-2 mb-4">Sessions Today</p>
                  {(doctorQueue?.sessions || []).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 shadow-sm transition-all hover:border-blue-primary/10">
                      <div>
                        <p className="text-sm font-bold text-ink">{session.label}</p>
                        <p className="text-[10px] font-medium text-muted-text/50 uppercase tracking-widest mt-0.5">{session.start}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                        session.token 
                        ? 'bg-blue-primary/10 text-blue-primary' 
                        : 'bg-slate-50 text-muted-text/40'
                      }`}>
                        {session.token ? `T-${session.token}` : 'Queue'}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
        
        <div className="mt-16 p-8 rounded-[32px] bg-ink text-white text-center animate-fade-in shadow-2xl shadow-ink/10">
           <p className="text-[13px] md:text-base font-medium text-white/70 max-w-2xl mx-auto leading-relaxed">
             The board refreshes every 5 seconds. To ensure a smooth experience, please arrive at the clinic <span className="text-blue-400 font-bold">10 minutes before</span> your appointment is expected to be called.
           </p>
        </div>
      </main>
    </div>
  );
}
