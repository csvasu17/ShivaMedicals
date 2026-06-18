import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_URL } from '../constants/api';

const parseDoctorName = (fullName) => {
  if (!fullName) return { name: '', qualifications: '', translation: '' };
  
  // 1. Extract Tamil text in parentheses
  const tamilRegex = /\(([\u0B80-\u0BFF\s,().\-\u200B-\u200D]+)\)/;
  const tamilMatch = fullName.match(tamilRegex);
  let translation = '';
  let cleanName = fullName;
  
  if (tamilMatch) {
    translation = tamilMatch[1].trim();
    cleanName = fullName.replace(tamilRegex, '').trim();
  }
  
  // 2. Separate name from degrees (MBBS, MD, DCH, DLO, D.DIAB, etc.)
  const degreeRegex = /\b(MBBS|MD|DCH|DLO|D\.DIAB)\b/i;
  const degreeMatch = cleanName.match(degreeRegex);
  
  let name = cleanName;
  let qualifications = '';
  
  if (degreeMatch) {
    const index = degreeMatch.index;
    name = cleanName.substring(0, index).trim();
    qualifications = cleanName.substring(index).trim();
    
    // Clean trailing/leading commas/spaces from name and qualifications
    name = name.replace(/^[,\s]+|[,\s]+$/g, '');
    qualifications = qualifications.replace(/^[,\s]+|[,\s]+$/g, '');
  }
  
  return { name, qualifications, translation };
};

export default function StatusBoard() {
  const [doctors, setDoctors] = useState([]);
  const [currentTokens, setCurrentTokens] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const voiceEnabledRef = useRef(false);
  const isInitialized = useRef(false);
  const lastAnnouncedTokens = useRef({}); // maps doctorId-sessionId -> tokenNumber
  
  const currentAudio = useRef(null);
  const audioQueue = useRef([]);
  const isAudioPlaying = useRef(false);

  // Keep ref in sync to avoid closure issues in setInterval
  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timeInterval);
      // Clean up fallback audio playback on unmount
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.src = "";
      }
    };
  }, []);

  const getIndianEnglishVoice = () => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => {
      const lang = v.lang.replace('_', '-').toLowerCase();
      return lang === 'en-in' || lang.includes('en-in');
    })
      || voices.find(v => v.name.toLowerCase().includes('india'))
      || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0] || null;
  };

  const getTamilVoice = () => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => {
      const lang = v.lang.replace('_', '-').toLowerCase();
      return lang === 'ta-in' || lang.startsWith('ta');
    }) || null;
  };

  const cancelFallbackAudio = () => {
    audioQueue.current = [];
    isAudioPlaying.current = false;
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.src = "";
      currentAudio.current = null;
    }
  };

  const processAudioQueue = () => {
    if (audioQueue.current.length === 0) {
      isAudioPlaying.current = false;
      return;
    }

    try {
      isAudioPlaying.current = true;
      const { message, langCode } = audioQueue.current.shift();
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(message)}`;
      
      const audio = new Audio(url);
      currentAudio.current = audio;

      const next = () => {
        currentAudio.current = null;
        processAudioQueue();
      };

      audio.onended = next;
      audio.onerror = next;

      audio.play().catch(err => {
        console.error('Audio playback failed on TV browser:', err);
        next();
      });
    } catch (e) {
      console.error('Error in processAudioQueue:', e);
      isAudioPlaying.current = false;
    }
  };

  const playAudioFallback = (message, langCode) => {
    audioQueue.current.push({ message, langCode });
    if (!isAudioPlaying.current) {
      processAudioQueue();
    }
  };

  const announceToken = (tokenNumber, patientName, roomNumber) => {
    if (!window.speechSynthesis) {
      const message = `டோக்கன் எண் ${tokenNumber}, ${patientName || 'நோயாளி'}, தயவுசெய்து அறை ${roomNumber}க்கு செல்லவும்.`;
      playAudioFallback(message, 'ta');
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const taVoice = getTamilVoice();

    if (taVoice) {
      const message = `டோக்கன் எண் ${tokenNumber}, ${patientName || 'நோயாளி'}, தயவுசெய்து அறை ${roomNumber}க்கு செல்லவும்.`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.voice = taVoice;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else if (voices.length > 0) {
      const message = `Token number ${tokenNumber}, ${patientName || 'Patient'}, please proceed to Room ${roomNumber}.`;
      const utterance = new SpeechSynthesisUtterance(message);
      const enVoice = getIndianEnglishVoice();
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      const message = `டோக்கன் எண் ${tokenNumber}, ${patientName || 'நோயாளி'}, தயவுசெய்து அறை ${roomNumber}க்கு செல்லவும்.`;
      playAudioFallback(message, 'ta');
    }
  };

  const handleToggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    
    // Always cancel active speech and release resources when toggled
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    cancelFallbackAudio();

    if (nextState) {
      const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      const taVoice = getTamilVoice();

      if (taVoice) {
        const utterance = new SpeechSynthesisUtterance("குரல் அறிவிப்புகள் செயல்படுத்தப்பட்டன.");
        utterance.voice = taVoice;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } else if (voices.length > 0) {
        const utterance = new SpeechSynthesisUtterance("Voice announcements enabled.");
        const enVoice = getIndianEnglishVoice();
        if (enVoice) {
          utterance.voice = enVoice;
        }
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } else {
        playAudioFallback("குரல் அறிவிப்புகள் செயல்படுத்தப்பட்டன.", "ta");
      }

      // Immediately read aloud the currently visible tokens on the screen after the confirmation finishes
      setTimeout(() => {
        doctors.forEach((doc, idx) => {
          const doctorQueue = currentTokens[doc.id];
          const activeSession = doctorQueue?.activeSession;
          if (activeSession && activeSession.token) {
            announceToken(activeSession.token, activeSession.patientName, idx + 1);
          }
        });
      }, 2500);
    }
  };

  const fetchData = async () => {
    try {
      const docRes = await fetch(`${API_URL}/api/doctors`);
      const docs = await docRes.json();
      setDoctors(docs);

      const tokenData = {};
      const date = new Date().toISOString().split('T')[0];
      const activeAnnouncementsToPlay = [];

      for (let idx = 0; idx < docs.length; idx++) {
        const doc = docs[idx];
        const sessRes = await fetch(`${API_URL}/api/sessions/${doc.id}`);
        const sessions = await sessRes.json();

        const sessionSummaries = [];
        for (const sess of sessions) {
          const queueRes = await fetch(`${API_URL}/api/queue/live/${sess.id}/${date}`);
          const liveToken = await queueRes.json();

          const nextRes = await fetch(`${API_URL}/api/admin/bookings?date=${date}&sessionId=${sess.id}`);
          const bookings = await nextRes.json();
          const nextPatients = (bookings || [])
            .filter(b => b.status === 'confirmed')
            .sort((a, b) => a.token_number - b.token_number)
            .slice(0, 3)
            .map(b => ({
              token_number: b.token_number,
              patient_name: b.patient_name
            }));

          sessionSummaries.push({
            id: sess.id,
            label: sess.session_type,
            start: sess.start_time?.slice(0, 5) || '--:--',
            token: liveToken?.token_number || null,
            patientName: liveToken?.patient_name || null,
            nextPatients: nextPatients
          });

          // Check if token changed
          const tokenKey = `${doc.id}-${sess.id}`;
          const currentLiveToken = liveToken?.token_number;

          if (currentLiveToken) {
            const lastAnnounced = lastAnnouncedTokens.current[tokenKey];
            if (lastAnnounced !== currentLiveToken) {
              if (isInitialized.current) {
                activeAnnouncementsToPlay.push({
                  docName: doc.name,
                  tokenNumber: currentLiveToken,
                  patientName: liveToken?.patient_name,
                  roomNumber: idx + 1
                });
              }
              lastAnnouncedTokens.current[tokenKey] = currentLiveToken;
            }
          } else {
            delete lastAnnouncedTokens.current[tokenKey];
          }
        }

        let firstActiveSession = sessionSummaries.find((session) => session.token);
        if (!firstActiveSession && sessionSummaries.length > 0) {
          firstActiveSession = sessionSummaries[0];
        }

        tokenData[doc.id] = {
          activeSession: firstActiveSession || null,
          sessions: sessionSummaries
        };
      }

      setCurrentTokens(tokenData);

      // Play queued announcements
      if (isInitialized.current && voiceEnabledRef.current && activeAnnouncementsToPlay.length > 0) {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        cancelFallbackAudio();
        activeAnnouncementsToPlay.forEach(ann => {
          announceToken(ann.tokenNumber, ann.patientName, ann.roomNumber);
        });
      }

      isInitialized.current = true;
      setLoading(false);
    } catch (err) {
      console.error('Error fetching live queue:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="relative min-h-screen pt-20 md:pt-[88px] pb-12 md:pb-20 px-4 md:px-12 lg:px-24 bg-transparent">
      
      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto w-full mb-10 md:mb-16 animate-fade-in">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 md:gap-12 animate-fade-in">
          <div className="max-w-3xl">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-primary animate-pulse"></span>
              Public Queue Status
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif font-medium leading-tight md:leading-[1.1] tracking-tight mb-4 md:mb-6">Live Appointment board for faster, calmer arrivals.</h1>
            <p className="text-muted-text text-[15px] md:text-lg leading-relaxed max-w-2xl opacity-80">
              Check real-time consultation progress from anywhere. We update the board every few seconds to ensure you arrive exactly when needed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5 xl:w-[600px] xl:shrink-0">
            <div className="rounded-3xl md:rounded-[32px] p-5 md:p-6 flex flex-col justify-between h-28 md:h-32 bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-muted-text/50">Current Time</p>
              <p className="text-2xl md:text-3xl font-sans font-black text-ink tracking-tight leading-none mb-1">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>
            <div className="rounded-3xl md:rounded-[32px] p-5 md:p-6 flex flex-col justify-between h-28 md:h-32 bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-muted-text/50">Active Rooms</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl md:text-4xl font-sans font-black text-blue-primary tracking-tight leading-none">{liveCount}</span>
                <span className="h-2.5 w-2.5 rounded-full bg-teal-primary animate-pulse shrink-0"></span>
              </div>
            </div>
            <div className="rounded-3xl md:rounded-[32px] p-5 md:p-6 flex flex-col justify-between h-28 md:h-32 bg-blue-primary text-white col-span-2 sm:col-span-1 shadow-lg shadow-blue-primary/20 transition-all hover:shadow-xl hover:bg-blue-mid">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Today</p>
              <p className="text-base md:text-lg font-sans font-black leading-tight tracking-tight mb-1">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 px-2 gap-4">
          <div>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-muted-text/50 mb-1 md:mb-2">Clinical Excellence</p>
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-ink">Active Consultation Status</h2>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto select-none">
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-[10px] md:text-[11px] font-bold tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer ${
                voiceEnabled
                  ? 'bg-blue-primary text-white border-blue-primary shadow-blue-primary/10'
                  : 'bg-white text-muted-text/70 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {voiceEnabled ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  VOICE ON
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>
                  VOICE OFF
                </>
              )}
            </button>

            <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm text-[10px] md:text-[11px] font-bold text-muted-text/70 animate-pulse shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              AUTO-SYNC
            </div>
          </div>
        </div>

        <div className={`grid gap-8 grid-cols-1 justify-center ${
          doctors.length === 1 
            ? 'max-w-md mx-auto' 
            : doctors.length === 2 
              ? 'md:grid-cols-2 max-w-7xl mx-auto w-full' 
              : 'md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto w-full'
        }`}>
          {doctors.map((doc, idx) => {
            const doctorQueue = currentTokens[doc.id];
            const activeSession = doctorQueue?.activeSession;
            const { name, qualifications, translation } = parseDoctorName(doc.name);

            return (
              <article key={doc.id} className="p-card p-6 sm:p-8 group animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="mb-8 flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-4 text-left">
                    <span className="inline-block bg-slate-100 text-muted-text px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-3">
                      Room {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-sans font-extrabold text-ink mb-1 group-hover:text-blue-primary transition-colors leading-tight" title={name}>{name}</h3>
                    {qualifications && (
                      <p className="text-[12px] font-bold text-blue-mid uppercase tracking-wider mb-1">{qualifications}</p>
                    )}
                    {translation && (
                      <p className="text-[13px] font-semibold text-muted-text/75 leading-snug mb-3 max-w-full">({translation})</p>
                    )}
                    <p className="text-[10px] font-bold text-muted-text/40 uppercase tracking-widest mt-2">{doc.specialty || 'General Practitioner'}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border transition-all shrink-0 ${
                    activeSession 
                    ? 'bg-teal-50 text-teal-600 border-teal-100' 
                    : 'bg-slate-50 text-muted-text/40 border-slate-100'
                  }`}>
                    {activeSession ? '● Live' : 'Offline'}
                  </div>
                </div>

                <div className="rounded-3xl md:rounded-[32px] bg-slate-50 border border-slate-100 p-5 sm:p-6 md:p-8 text-center mb-8 transition-all group-hover:bg-white group-hover:shadow-lg group-hover:border-blue-primary/5">
                  {activeSession ? (
                    <div className="animate-fade-in text-center">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-primary/40 mb-2">Now Calling</p>
                      <div className="text-7xl md:text-[96px] font-sans font-black leading-none text-blue-primary group-hover:text-blue-mid transition-colors mb-4 tracking-tighter">
                        {activeSession.token}
                      </div>
                      <div className="inline-block bg-slate-100 text-ink px-6 py-2.5 rounded-2xl text-base md:text-xl font-extrabold border border-slate-200/60 truncate max-w-full shadow-sm">
                        {activeSession.patientName}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 md:py-10 opacity-40">
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-muted-text mb-3 md:mb-4">Current Appointment</p>
                      <div className="text-3xl md:text-4xl font-sans font-extrabold uppercase tracking-wider mb-3 text-slate-400">Standby</div>
                      <p className="text-[10px] md:text-[11px] font-medium text-muted-text px-4 leading-relaxed">System will update when sessions begin.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/30 px-2 mb-4">Next Patients</p>
                  {doctorQueue?.activeSession?.nextPatients && doctorQueue.activeSession.nextPatients.length > 0 ? (
                    doctorQueue.activeSession.nextPatients.map((patient, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 shadow-sm transition-all hover:border-blue-primary/10 animate-fade-in">
                        <div className="flex items-center gap-3 min-w-0">
                          <p className="text-base font-black text-ink text-left uppercase truncate max-w-[180px] sm:max-w-[240px] md:max-w-[280px]">
                            {patient.patient_name}
                          </p>
                        </div>
                        <div className="px-5 py-2 rounded-xl text-xl md:text-2xl font-black uppercase tracking-wider bg-blue-primary/10 text-blue-primary shrink-0">
                          T-{patient.token_number}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                      No upcoming patients in queue
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        
        <div className="mt-12 md:mt-16 p-6 md:p-8 rounded-3xl md:rounded-[32px] bg-ink text-white text-center animate-fade-in shadow-2xl shadow-ink/10">
           <p className="text-xs md:text-base font-medium text-white/70 max-w-2xl mx-auto leading-relaxed">
             The board refreshes every 5 seconds. To ensure a smooth experience, please arrive at the clinic <span className="text-blue-400 font-bold">10 minutes before</span> your appointment is expected.
           </p>
        </div>
      </main>
    </div>
  );
}
