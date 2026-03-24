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
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-white font-serif">
        <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-[32px] bg-blue-primary shadow-[0_0_60px_rgba(24,71,194,0.38)]">
          <svg className="h-10 w-10 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </div>
        <div className="text-center">
          <div className="text-3xl font-medium tracking-tight">Preparing the live board</div>
          <p className="mt-3 text-base text-white/60">Syncing clinic sessions and active consultations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#081223] px-5 py-6 text-white md:px-8 lg:px-10 lg:py-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(42,91,230,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(11,143,115,0.16),transparent_32%),linear-gradient(180deg,#091325_0%,#08101d_100%)]"></div>
      <div className="absolute right-[-10%] top-[-10%] -z-10 h-[420px] w-[420px] rounded-full bg-blue-primary/10 blur-[120px]"></div>
      <div className="absolute bottom-[-15%] left-[-8%] -z-10 h-[340px] w-[340px] rounded-full bg-teal-primary/10 blur-[120px]"></div>

      <header className="mx-auto mb-8 max-w-7xl rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_24px_100px_-60px_rgba(15,23,42,1)] md:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-white/65">
              <span className="h-2 w-2 rounded-full bg-teal-primary animate-pulse"></span>
              Public queue status
            </div>
            <h1 className="text-4xl font-serif font-medium tracking-tight text-white md:text-6xl">Live token board for faster, calmer arrivals.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              Patients can check the currently called token and session activity before leaving home, reducing crowding in the clinic.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[420px] xl:max-w-[460px]">
            <div className="rounded-[24px] border border-white/10 bg-[#0d1a30] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Current time</p>
              <p className="mt-3 text-3xl font-serif">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[#0d1a30] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Doctors live</p>
              <p className="mt-3 text-3xl font-serif">{liveCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[#0d1a30] p-4 sm:col-span-3 xl:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Today</p>
              <p className="mt-3 text-lg font-semibold text-white/85">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between px-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/45">Clinic specialists</p>
            <h2 className="mt-2 text-2xl font-serif text-white md:text-3xl">Now serving across all active rooms</h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 md:block">Auto refresh every 5 seconds</div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doc, idx) => {
            const doctorQueue = currentTokens[doc.id];
            const activeSession = doctorQueue?.activeSession;

            return (
              <article key={doc.id} className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_32px_90px_-60px_rgba(59,130,246,0.6)] md:p-7">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-primary/10 blur-3xl transition-all duration-500 group-hover:bg-blue-primary/20"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
                        Room {String(idx + 1).padStart(2, '0')}
                      </div>
                      <h3 className="text-2xl font-serif text-white">{doc.name}</h3>
                      <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/40">{doc.specialty || 'Medical Officer'}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${activeSession ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-white/40'}`}>
                      {activeSession ? 'Consulting now' : 'Awaiting patients'}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#0b1629] p-5 text-center shadow-inner shadow-black/10">
                    {activeSession ? (
                      <>
                        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-blue-200/70">Current token</p>
                        <div className="my-4 text-[88px] font-serif leading-none tracking-tight text-white md:text-[110px]">{activeSession.token}</div>
                        <p className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75">{activeSession.patientName}</p>
                        <div className="mt-5 flex items-center justify-center gap-3 text-sm text-white/55">
                          <span>{activeSession.label}</span>
                          <span className="h-1 w-1 rounded-full bg-white/30"></span>
                          <span>{activeSession.start}</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-8">
                        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/35">Current token</p>
                        <div className="my-6 text-4xl font-serif italic text-white/35">Available</div>
                        <p className="text-sm text-white/45">The next confirmed patient will appear here.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Session overview</p>
                      <span className="text-xs text-white/35">{doctorQueue?.sessions?.length || 0} sessions</span>
                    </div>
                    <div className="space-y-3">
                      {(doctorQueue?.sessions || []).map((session) => (
                        <div key={session.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#0d1a30] px-4 py-3 text-sm">
                          <div>
                            <p className="font-semibold text-white/85">{session.label}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">Starts {session.start}</p>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${session.token ? 'bg-blue-primary/20 text-blue-100' : 'bg-white/8 text-white/40'}`}>
                            {session.token ? `Token ${session.token}` : 'Waiting'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="mt-8 rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 text-center text-sm leading-7 text-white/55 backdrop-blur-xl">
          This board refreshes automatically. Patients should proceed to the clinic when their token is close to being called.
        </footer>
      </main>
    </div>
  );
}
