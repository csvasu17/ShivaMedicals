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
  
  const persistentAudioRef = useRef(null);
  const audioQueue = useRef([]);
  const isAudioPlaying = useRef(false);

  // Keep ref in sync to avoid closure issues in setInterval
  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Warm up and handle asynchronous voice loading for SpeechSynthesis
  useEffect(() => {
    // Instantiate persistent audio player on mount
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = "auto";
      persistentAudioRef.current = audio;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timeInterval);
      // Clean up fallback audio playback on unmount
      if (persistentAudioRef.current) {
        persistentAudioRef.current.pause();
        persistentAudioRef.current.src = "";
      }
    };
  }, []);


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
    if (persistentAudioRef.current) {
      persistentAudioRef.current.pause();
      persistentAudioRef.current.src = "";
      try {
        persistentAudioRef.current.load();
      } catch (e) {}
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
      const url = `${API_URL}/api/tts?lang=${encodeURIComponent(langCode)}&text=${encodeURIComponent(message)}`;
      
      if (persistentAudioRef.current) {
        const audio = persistentAudioRef.current;
        
        audio.src = url;
        audio.load(); // Force Tizen browser engine to reload the new media source!

        const next = () => processAudioQueue();

        audio.addEventListener('ended', next, { once: true });
        audio.addEventListener('error', next, { once: true });

        audio.play().catch(err => {
          console.error('Audio playback failed on TV browser:', err);
          next();
        });
      } else {
        isAudioPlaying.current = false;
      }
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
    const message = `டோக்கன் எண் ${tokenNumber}, ${patientName || 'நோயாளி'}, தயவுசெய்து அறை ${roomNumber}க்கு செல்லவும்.`;

    const isTizen = typeof navigator !== 'undefined' && /Tizen/i.test(navigator.userAgent);
    const taVoice = getTamilVoice();

    if (!window.speechSynthesis || isTizen || !taVoice) {
      playAudioFallback(message, 'ta');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = taVoice;
    utterance.lang = 'ta-IN';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
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
      const message = "குரல் அறிவிப்புகள் செயல்படுத்தப்பட்டன.";

      const isTizen = typeof navigator !== 'undefined' && /Tizen/i.test(navigator.userAgent);
      const taVoice = getTamilVoice();

      // Unlock persistent audio player with a user gesture
      if (persistentAudioRef.current) {
        persistentAudioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        persistentAudioRef.current.load(); // Load the silent data URI to prime the player
        persistentAudioRef.current.play().then(() => {
          setTimeout(() => {
            if (!window.speechSynthesis || isTizen || !taVoice) {
              playAudioFallback(message, "ta");
            } else {
              const utterance = new SpeechSynthesisUtterance(message);
              utterance.voice = taVoice;
              utterance.lang = 'ta-IN';
              utterance.rate = 0.9;
              window.speechSynthesis.speak(utterance);
            }
          }, 100);
        }).catch(err => {
          console.warn("Audio unlock failed, playing fallback direct:", err);
          if (!window.speechSynthesis || isTizen || !taVoice) {
            playAudioFallback(message, "ta");
          } else {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.voice = taVoice;
            utterance.lang = 'ta-IN';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
          }
        });
      } else {
        if (!window.speechSynthesis || isTizen || !taVoice) {
          playAudioFallback(message, "ta");
        } else {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.voice = taVoice;
          utterance.lang = 'ta-IN';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
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
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_URL}/api/liveboard?date=${date}`);
      const board = await res.json();

      const tokenData = {};
      const activeAnnouncementsToPlay = [];
      const docs = board.map(({ sessions: _s, ...d }) => d);

      board.forEach((doc, idx) => {
        const sessionSummaries = doc.sessions;

        sessionSummaries.forEach(sess => {
          const tokenKey = `${doc.id}-${sess.id}`;
          const currentLiveToken = sess.token;
          if (currentLiveToken) {
            const lastAnnounced = lastAnnouncedTokens.current[tokenKey];
            if (lastAnnounced !== currentLiveToken && isInitialized.current) {
              activeAnnouncementsToPlay.push({
                tokenNumber: currentLiveToken,
                patientName: sess.patientName,
                roomNumber: idx + 1
              });
            }
            lastAnnouncedTokens.current[tokenKey] = currentLiveToken;
          } else {
            delete lastAnnouncedTokens.current[tokenKey];
          }
        });

        const firstActiveSession = sessionSummaries.find(s => s.token) || sessionSummaries[0] || null;
        tokenData[doc.id] = { activeSession: firstActiveSession, sessions: sessionSummaries };
      });

      setDoctors(docs);
      setCurrentTokens(tokenData);

      if (isInitialized.current && voiceEnabledRef.current && activeAnnouncementsToPlay.length > 0) {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
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

  const pollTimeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      await fetchData();
      if (!cancelled) {
        pollTimeoutRef.current = setTimeout(poll, 5000);
      }
    };

    poll();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(pollTimeoutRef.current);
        poll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      clearTimeout(pollTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[11px] font-bold tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer ${
                voiceEnabled
                  ? 'bg-blue-primary text-white border-blue-primary shadow-blue-primary/10'
                  : 'bg-white text-muted-text/70 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {voiceEnabled ? (
                <>
                  <div className="flex items-center gap-[2.5px] h-3.5 w-4 shrink-0 justify-center">
                    <span className="w-[3px] bg-white rounded-full animate-bounce h-3"></span>
                    <span className="w-[3px] bg-white rounded-full animate-bounce h-2 stagger-1"></span>
                    <span className="w-[3px] bg-white rounded-full animate-bounce h-3.5 stagger-2"></span>
                  </div>
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

        <div className={`grid gap-8 justify-center w-full max-w-7xl mx-auto ${
          doctors.length === 1 
            ? 'grid-cols-1 max-w-xl' 
            : doctors.length === 2 
              ? 'grid-cols-1 md:grid-cols-2 max-w-5xl' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {doctors.map((doc, idx) => {
            const doctorQueue = currentTokens[doc.id];
            const activeSession = doctorQueue?.activeSession;
            const { name, qualifications, translation } = parseDoctorName(doc.name);

            return (
              <article key={doc.id} className="p-card p-6 sm:p-8 group animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="mb-6 flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-4 text-left">
                    <span className="inline-block bg-slate-100 text-muted-text px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-3">
                      Room {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-sans font-bold text-ink mb-1 group-hover:text-blue-primary transition-colors leading-tight" title={name}>{name}</h3>
                    {qualifications && (
                      <p className="text-[11px] font-bold text-blue-primary uppercase tracking-wider mb-0.5">{qualifications}</p>
                    )}
                    {translation && (
                      <p className="text-[13px] font-semibold text-muted-text/80 leading-snug mb-2 max-w-full">({translation})</p>
                    )}
                    <p className="text-[10px] font-bold text-muted-text/50 uppercase tracking-widest mt-2">{doc.specialty || 'General Practitioner'}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all shrink-0 ${
                    activeSession 
                    ? 'bg-emerald-50 text-brand-green border-emerald-100' 
                    : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {activeSession ? '● Live' : 'Offline'}
                  </div>
                </div>

                <div className={`rounded-2xl bg-slate-50 border border-slate-200/50 p-5 text-center mb-6 transition-all group-hover:bg-white group-hover:shadow-lg group-hover:border-blue-primary/10 ${
                  doctors.length <= 2 ? 'sm:p-8 md:p-10' : 'sm:p-6'
                }`}>
                  {activeSession ? (
                    <div className="animate-fade-in text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-primary/60 mb-1">Now Calling</p>
                      <div className={`font-sans font-black leading-none text-blue-primary group-hover:text-blue-mid transition-colors mb-3 tracking-tighter ${
                        doctors.length <= 2 ? 'text-8xl sm:text-[100px] md:text-[120px]' : 'text-7xl md:text-[88px]'
                      }`}>
                        {activeSession.token}
                      </div>
                      <div className="inline-block bg-white text-ink px-4 py-2 rounded-xl text-sm md:text-base font-extrabold border border-slate-200/60 truncate max-w-full shadow-sm">
                        {activeSession.patientName}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 opacity-45">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-text mb-2">Current Appointment</p>
                      <div className="text-2xl font-bold uppercase tracking-wider mb-2 text-slate-400">Standby</div>
                      <p className="text-[11px] font-medium text-slate-400 px-4 leading-relaxed">System will update when sessions begin.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-text/40 px-1 mb-2">Next Patients</p>
                  {doctorQueue?.activeSession?.nextPatients && doctorQueue.activeSession.nextPatients.length > 0 ? (
                    doctorQueue.activeSession.nextPatients.map((patient, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all hover:border-blue-primary/10 animate-fade-in">
                        <div className="flex items-center gap-3 min-w-0">
                          <p className="text-[14px] font-bold text-ink text-left uppercase truncate max-w-[180px] sm:max-w-[240px] md:max-w-[280px]">
                            {patient.patient_name}
                          </p>
                        </div>
                        <div className="px-4 py-1.5 rounded-lg text-lg md:text-xl font-bold uppercase tracking-wider bg-blue-primary/5 text-blue-primary shrink-0">
                          T-{patient.token_number}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200/30">
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
