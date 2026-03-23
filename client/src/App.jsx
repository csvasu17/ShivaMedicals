import React, { useState, useEffect } from 'react';
import BookToken from './pages/BookToken';
import QueueManager from './pages/admin/QueueManager';
import Login from './pages/Login';
import StatusBoard from './pages/StatusBoard';

function App() {
  const [route, setRoute] = useState('home'); 
  const [user, setUser] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const path = window.location.pathname;
    if (path === '/status') {
      setRoute('status');
    } else if (path === '/admin' || path === '/staff/dashboard') {
      setRoute('admin');
    } else {
      setRoute('home');
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoginModalOpen(false);
    setRoute('admin');
    window.history.pushState({}, '', '/staff/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setRoute('home');
    window.history.pushState({}, '', '/');
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupPhone) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await fetch(`${API_URL}/api/bookings/my?phone=${lookupPhone}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLookupResult(data[0]);
      } else {
        setLookupResult({ error: 'No booking found for this number.' });
      }
    } catch (err) {
      setLookupResult({ error: 'System error. Please try later.' });
    } finally {
      setLookupLoading(false);
    }
  };

  if (route === 'status') return <StatusBoard />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans scroll-smooth">
      
      {/* PREMIUM BACKGROUND MESH */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[100px]"></div>
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-purple-100/20 rounded-full blur-[80px]"></div>
      </div>

      {/* REWRITTEN BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop Overlay */}
           <div 
             className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity cursor-pointer" 
             onClick={() => setIsBookingModalOpen(false)}
           ></div>

           {/* Modal Container - Simplified & Bulletproof */}
           <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl relative z-[110] max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-scale-up">
              {/* Header / Close Button */}
              <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120]">
                <button 
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-ink transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 overflow-hidden">
                <BookToken onClose={() => setIsBookingModalOpen(false)} />
              </div>
           </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-navy/60 backdrop-blur-md animate-fade-in" onClick={() => setIsLoginModalOpen(false)}></div>
           <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative animate-scale-up z-[110]">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsLoginModalOpen(false); }}
                className="absolute top-10 right-10 p-2.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-[120] click-press border border-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <Login onLoginSuccess={handleLoginSuccess} />
           </div>
        </div>
      )}

      {/* CAtoken PREMIUM NAV */}
      {!isBookingModalOpen && (
        <nav className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 md:px-12 h-[68px] transition-all duration-500 ${isScrolled ? 'bg-white/88 backdrop-blur-xl border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { setRoute('home'); window.history.pushState({}, '', '/'); }}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <img src="/shiva-logo.jpg" alt="Shiva Medicals Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-xl font-medium text-ink tracking-tight">Shiva Medicals</span>
        </div>
        
        <ul className="hidden lg:flex items-center gap-9">
          <li><button onClick={() => setRoute('home')} className="text-sm font-medium text-muted-text hover:text-ink transition-colors">Home</button></li>
          <li><button className="text-sm font-medium text-muted-text hover:text-ink transition-colors">How it works</button></li>
          <li><button className="text-sm font-medium text-muted-text hover:text-ink transition-colors">Features</button></li>
          <li><button onClick={() => setRoute('status')} className="text-sm font-medium text-muted-text hover:text-ink transition-colors">Live Board</button></li>
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => setRoute('admin')} className="text-sm font-medium text-ink px-4 py-2 rounded-lg hover:bg-cream-base transition-colors">Dashboard</button>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="text-sm font-medium text-ink px-4 py-2 rounded-lg hover:bg-cream-base transition-colors">Staff Portal</button>
          )}
          <button onClick={() => setIsBookingModalOpen(true)} className="bg-ink hover:bg-blue-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all transform active:scale-95 shadow-lg shadow-ink/10">Book a token</button>
        </div>
      </nav>
      )}

      <main className={`flex-1 transition-all duration-500 ${!isBookingModalOpen ? 'mt-[68px]' : 'mt-0'}`}>
        {route === 'home' && (
          <div className="animate-fade-in">
            {/* SHIVA MEDICALS HERO */}
            <section className="min-h-[calc(100vh-68px)] grid grid-cols-1 lg:grid-cols-[1.05fr,0.95fr] items-center relative overflow-hidden">
              {/* Subtle Medical Background Texture */}
              <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.06]">
                <img src="/medical-bg.png" className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/80"></div>
              </div>

              {/* Left Column: Content */}
              <div className="px-6 md:px-12 py-12 lg:py-0 relative z-10">
                <div className="eyebrow animate-fade-in">
                   <span className="w-2 h-2 rounded-full bg-blue-mid animate-pulse"></span>
                   Sessions open — book for today
                </div>
                <h1 className="text-5xl lg:text-[72px] leading-[1.05] font-serif font-medium text-ink mb-4 tracking-tight animate-slide-up">
                   Your clinic visit,<br />
                   <span className="accent-italic">without</span> the<br />
                   <span className="text-teal-primary">waiting room.</span>
                </h1>
                <p className="sec-sub animate-slide-up stagger-1">
                   Reserve your token online. Get an estimated time, arrive only when it's your turn, and receive real-time updates on your phone.
                </p>
                <div className="flex flex-wrap gap-4 mb-10 animate-slide-up stagger-2">
                   <button onClick={() => setIsBookingModalOpen(true)} className="btn-dark px-10 h-14 text-base">
                      Book a token
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                   </button>
                   <button className="text-muted-text hover:text-ink font-medium flex items-center gap-2 group transition-colors py-4 px-6">
                      How it works <span className="group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                </div>

                <div className="flex items-center gap-0 animate-fade-in stagger-3">
                   {[ {c:"#E6F1FB", t:"KR"}, {c:"#E1F5EE", t:"SM"}, {c:"#FAEEDA", t:"AP"}, {c:"#EDE9FE", t:"RV"} ].map((a,i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white flex items-center justify-center text-[11px] font-bold -ml-3 first:ml-0 shadow-sm" style={{backgroundColor:a.c}}>
                         {a.t}
                      </div>
                   ))}
                   <p className="ml-4 text-sm text-muted-text leading-tight">
                      <strong>200+ patients</strong> booked<br />their token this week
                   </p>
                </div>
              </div>

              {/* Right Column: Visual Component - Viewport Perfect Fitting */}
              <div className="min-h-[400px] lg:min-h-full flex items-center justify-center p-6 md:p-12 lg:p-12 relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-slate-50/30"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(24,71,194,0.03)_0%,transparent_50%)]"></div>
                
                <div className="relative w-full max-w-[760px] max-h-[70vh] aspect-[1.4] md:aspect-[1.6] rounded-[40px] md:rounded-[65px] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.12)] border border-white animate-fade-in group">
                   <img 
                     src="/hero-healthcare.png" 
                     alt="Shiva Medicals Premium Clinic" 
                     className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" 
                   />
                   {/* Pill Tag at Bottom Left - Clear and Pill-shaped */}
                   <div className="absolute bottom-8 left-8">
                      <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/95 backdrop-blur-sm shadow-xl rounded-full border border-slate-50">
                         <div className="w-2.5 h-2.5 rounded-full bg-[#10B891] animate-pulse"></div>
                         <span className="text-[11px] font-bold text-ink uppercase tracking-wider">Premium Care Standard</span>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* SHIVA MEDICALS STATS BAND slice */}
            <div className="bg-ink px-6 md:px-12 py-10 lg:py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
              <div className="lg:pr-10 lg:border-r border-white/10 animate-fade-in">
                <div className="font-serif text-4xl lg:text-[42px] font-medium text-white leading-none mb-1.5 flex items-baseline">Expert<span className="text-2xl ml-2"> Doctors</span></div>
                <div className="text-[13px] text-white/45 font-normal tracking-wide">Professional Medical Team</div>
              </div>
              <div className="lg:px-12 lg:border-r border-white/10 animate-fade-in stagger-1 text-left lg:text-center">
                <div className="font-serif text-4xl lg:text-[42px] font-medium text-white leading-none mb-1.5">Daily</div>
                <div className="text-[13px] text-white/45 font-normal tracking-wide">Flexible session slots</div>
              </div>
              <div className="lg:px-12 lg:border-r border-white/10 animate-fade-in stagger-2 text-left lg:text-center">
                <div className="font-serif text-4xl lg:text-[42px] font-medium text-white leading-none mb-1.5">~6<span className="text-2xl ml-1"> min</span></div>
                <div className="text-[13px] text-white/45 font-normal tracking-wide">Average per patient</div>
              </div>
              <div className="lg:pl-12 animate-fade-in stagger-3 text-left lg:text-right">
                <div className="font-serif text-4xl lg:text-[42px] font-medium text-white leading-none mb-1.5">0</div>
              </div>
            </div>
            
            {/* SHIVA MEDICALS DOCTORS */}
            <section className="px-6 md:px-12 py-24 bg-white relative overflow-hidden" id="doctors">
              <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none">
                <img src="/medical-bg.png" className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
              </div>
              
              <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 items-start">
                  <div className="lg:col-span-1 animate-slide-up lg:sticky lg:top-32">
                    <span className="eyebrow">Medical Team</span>
                    <h2 className="sec-title text-4xl lg:text-5xl leading-[1.2] mb-6">Clinical Excellence.<br />Available Daily.</h2>
                    <p className="sec-sub text-lg opacity-80 mb-0">Consult with our expert medical team across multiple daily sessions. Real-time availability ensures absolute accuracy for your visit.</p>
                  </div>
                  
                  <div className="lg:col-span-2 lg:max-w-3xl animate-slide-up stagger-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* DR RAMESH */}
                      <div className="p-card group cursor-default h-full flex flex-col">
                        <div className="p-6 border-b border-slate-50">
                          <div className="flex items-center gap-5 mb-6">
                             <div className="w-14 h-14 rounded-2xl bg-blue-primary/5 text-blue-primary font-serif text-xl font-semibold flex items-center justify-center transition-transform group-hover:scale-110">RK</div>
                             <div>
                                <h3 className="text-xl font-bold text-ink mb-0.5">Dr. Ramesh Kumar</h3>
                                <p className="text-[13px] text-muted-text">General Medicine · MD</p>
                             </div>
                          </div>
                          <span className="inline-block bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-[11px]">Available today</span>
                        </div>
                        <div className="p-6 space-y-3 flex-1">
                          <div className="flex justify-between items-center bg-cream-base/50 p-4 rounded-xl border border-transparent hover:border-blue-primary/10 transition-colors">
                             <div>
                                <p className="text-[13px] font-bold text-ink">Morning Session</p>
                                <span className="text-[11px] text-muted-text">9:00 AM – 12:00 PM</span>
                             </div>
                             <span className="text-[11px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">12 slots</span>
                          </div>
                          <div className="flex justify-between items-center bg-cream-base/50 p-4 rounded-xl border border-transparent hover:border-blue-primary/10 transition-colors">
                             <div>
                                <p className="text-[13px] font-bold text-ink">Evening Session</p>
                                <span className="text-[11px] text-muted-text">5:00 PM – 8:00 PM</span>
                             </div>
                             <span className="text-[11px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">18 slots</span>
                          </div>
                        </div>
                        <div className="px-6 pb-6 mt-auto">
                          <button onClick={() => setIsBookingModalOpen(true)} className="w-full bg-ink hover:bg-blue-primary text-white py-3.5 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-ink/5">Book token</button>
                        </div>
                      </div>

                      {/* CHILD SPECIALIST */}
                      <div className="p-card group cursor-default h-full flex flex-col animate-slide-up stagger-2">
                        <div className="p-6 border-b border-slate-50">
                          <div className="flex items-center gap-5 mb-6">
                             <div className="w-14 h-14 rounded-2xl bg-teal-primary/5 text-teal-primary font-serif text-xl font-semibold flex items-center justify-center transition-transform group-hover:scale-110">PS</div>
                             <div>
                                <h3 className="text-xl font-bold text-ink mb-0.5">Dr. Priya Sundar</h3>
                                <p className="text-[13px] text-muted-text">Child Specialist · DCH</p>
                             </div>
                          </div>
                          <span className="inline-block bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-[11px]">Available today</span>
                        </div>
                        <div className="p-6 space-y-3 flex-1">
                          <div className="flex justify-between items-center bg-cream-base/50 p-4 rounded-xl border border-transparent hover:border-teal-primary/10 transition-colors">
                             <div>
                                <p className="text-[13px] font-bold text-ink">Morning Session</p>
                                <span className="text-[11px] text-muted-text">9:30 AM – 11:30 AM</span>
                             </div>
                             <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">3 slots</span>
                          </div>
                          <div className="flex justify-between items-center bg-cream-base/50 p-4 rounded-xl border border-transparent hover:border-teal-primary/10 transition-colors">
                             <div>
                                <p className="text-[13px] font-bold text-ink">Evening Session</p>
                                <span className="text-[11px] text-muted-text">5:30 PM – 7:30 PM</span>
                             </div>
                             <span className="text-[11px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">11 slots</span>
                          </div>
                        </div>
                        <div className="px-6 pb-6 mt-auto">
                          <button onClick={() => setIsBookingModalOpen(true)} className="w-full bg-ink hover:bg-teal-primary text-white py-3.5 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-ink/5">Book token</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SHIVA MEDICALS HOW IT WORKS */}
            <section className="px-6 md:px-12 py-16 bg-cream-base relative overflow-hidden" id="how">
              <div className="absolute inset-0 -z-10 opacity-[0.04] pointer-events-none">
                <img src="/medical-bg.png" className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-cream-base via-transparent to-cream-base"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="animate-slide-up">
                  <span className="eyebrow">Simple process</span>
                  <h2 className="sec-title">Book your token<br />in 4 steps.</h2>
                  <p className="sec-sub">No queues. No uncertainty. Know exactly when your turn is before you leave home.</p>
                  
                  <div className="space-y-0 mt-12 bg-white/30 rounded-3xl p-2">
                     {[
                       { n:1, t: "Choose your doctor", d: "Select General or Child Specialist and pick Morning or Evening session." },
                       { n:2, t: "Verify with OTP", d: "Enter your mobile number. A quick OTP confirms your identity — no signup needed." },
                       { n:3, t: "Get your token", d: "Instantly receive a token number with your estimated consultation time." },
                       { n:4, t: "Arrive when it's your turn", d: "WhatsApp reminder 30 min before your turn. Walk in, zero wait." }
                     ].map((s,i)=>(
                       <div key={i} className="flex gap-6 py-5 px-6 border-b border-slate-200/50 last:border-0 group cursor-default">
                         <div className="w-11 h-11 rounded-xl bg-ink text-white font-serif text-lg font-medium flex items-center justify-center shrink-0 group-hover:bg-blue-primary transition-colors">{s.n}</div>
                         <div className="pt-2">
                           <h4 className="text-base font-bold text-ink mb-1.5">{s.t}</h4>
                           <p className="text-sm text-muted-text leading-relaxed">{s.d}</p>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-32 animate-slide-up stagger-1">
                  <div className="bg-ink p-5 flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] uppercase tracking-widest text-muted-text font-bold mb-5">Select session</p>
                    <div className="space-y-3 mb-8">
                       <div className="flex justify-between items-center p-4 rounded-xl bg-blue-primary/5 border border-blue-primary/20">
                          <div>
                             <p className="text-[13px] font-bold text-ink">Morning Session</p>
                             <span className="text-[11px] text-muted-text">9:00 AM – 12:00 PM</span>
                          </div>
                          <span className="bg-blue-primary/10 text-blue-mid px-3 py-1 rounded-full text-[11px] font-bold">12 left</span>
                       </div>
                       <div className="flex justify-between items-center p-4 rounded-xl bg-cream-base/50 border border-transparent">
                          <div>
                             <p className="text-[13px] font-bold text-ink">Evening Session</p>
                             <span className="text-[11px] text-muted-text">5:00 PM – 8:00 PM</span>
                          </div>
                          <span className="text-[11px] font-bold text-green-700">18 left</span>
                       </div>
                    </div>
                    <div className="bg-ink rounded-2xl p-6 text-center text-white">
                       <p className="text-[11px] text-white/50 mb-1">Your token number</p>
                       <strong className="block text-4xl font-serif font-bold mb-1">08</strong>
                       <span className="text-[11px] text-white/60 font-medium">Est. time: 9:42 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SHIVA MEDICALS FEATURES */}
            <section className="px-6 md:px-12 py-16 bg-ink" id="features">
              <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up">
                <span className="eyebrow bg-white/5 border-white/10 text-teal-primary">Why Shiva Medicals</span>
                <h2 className="sec-title text-white">Every detail, considered.</h2>
                <p className="text-white/55 text-lg leading-relaxed">Built for patients who value their time and clinics that care about experience.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { t: "Real-time availability", d: "Live slot counts update instantly. See exactly how many tokens remain before you book.", i: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", c: "rgba(24,71,194,0.25)", s: "#7BA7FF" },
                  { t: "WhatsApp reminder", d: "Auto-notification 30 minutes before your estimated turn. No app install required.", i: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.2 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z", c: "rgba(11,143,115,0.25)", s: "#5DCAA5" },
                  { t: "OTP-secured booking", d: "Every booking tied to your phone number. Safe, private, no passwords to remember.", i: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", c: "rgba(201,147,58,0.2)", s: "#E8B455" },
                  { t: "Precise wait estimate", d: "Know your approximate consultation time the moment you book — plan your day accordingly.", i: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", c: "rgba(255,255,255,0.08)", s: "rgba(255,255,255,0.6)" },
                  { t: "Easy cancellation", d: "Cancel anytime more than 1 hour before your session. Your slot is released for others.", i: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", c: "rgba(255,255,255,0.08)", s: "rgba(255,255,255,0.6)" },
                  { t: "Instant confirmation", d: "Token confirmed immediately with your booking ID, time, and doctor details.", i: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", c: "rgba(255,255,255,0.08)", s: "rgba(255,255,255,0.6)" }
                ].map((f,idx)=>(
                  <div key={idx} className="p-6 rounded-[28px] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group animate-slide-up">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{backgroundColor:f.c}}>
                       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={f.s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.i} /></svg>
                    </div>
                    <h4 className="text-[17px] font-bold text-white mb-3 tracking-tight">{f.t}</h4>
                    <p className="text-white/45 text-sm leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SHIVA MEDICALS FINAL CTA */}
            <section className="px-6 md:px-12 py-16 bg-white">
              <div className="bg-ink rounded-[48px] p-8 md:p-12 lg:p-16 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,71,194,0.15)_0%,transparent_70%)]"></div>
                
                <div className="relative z-10 max-w-2xl mx-auto">
                  <span className="eyebrow bg-white/5 border-white/10 text-blue-light">Ready to book?</span>
                  <h2 className="text-4xl lg:text-6xl font-serif font-medium text-white mb-8 tracking-tight">Your digital token is<br />one click away.</h2>
                  
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-md mx-auto mb-8">
                     <input 
                       type="tel" 
                       placeholder="Enter phone number" 
                       className="flex-1 bg-transparent border-0 px-6 py-4 text-white outline-none placeholder:text-white/30 font-medium"
                     />
                     <button onClick={() => setIsBookingModalOpen(true)} className="bg-blue-primary hover:bg-white hover:text-ink text-white px-8 py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-xl">
                        Book now
                     </button>
                  </div>
                  <p className="text-white/40 text-[13px]">No registration required. Just your mobile number.</p>
                </div>
              </div>
            </section>
          </div>
        )}
        
        {route === 'admin' && (
          <div className="animate-fade-in py-8">
            <QueueManager setRoute={setRoute} user={user} onAddPatient={() => setIsBookingModalOpen(true)} />
          </div>
        )}
      </main>

      {/* SHIVA MEDICALS FOOTER */}
      {/* SHIVA MEDICAL PREMIUM FOOTER */}
      <footer className="bg-ink px-6 md:px-12 pt-16 pb-10 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-lg">
                <img src="/shiva-logo.jpg" alt="SM Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-2xl font-medium text-white tracking-tight">Shiva Medicals</span>
            </div>
            <p className="text-white/90 font-medium text-sm mb-4">Your Health, Our Priority</p>
            <p className="text-white/45 text-sm leading-relaxed mb-10 max-w-[240px]">
              Providing quality healthcare services with compassion and excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-8 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'Tokenomics', 'Roadmap', 'Our Team', 'Whitepaper', 'Contact'].map(l => (
                <li key={l}><button className="text-white/45 text-sm hover:text-white transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-sm mb-8 uppercase tracking-widest">Contact Us</h4>
            <div className="flex gap-4">
              <div className="mt-1 text-blue-mid">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                175/4, Shiva Medical, Check Post<br />Corner, Aranthangi – 614616
              </p>
            </div>
            <div className="space-y-3">
              {[ '+91 97870 04716', '+91 81110 17743' ].map(p => (
                <div key={p} className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer text-sm">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                   {p}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              info@shivamedical.com
            </div>
          </div>

          {/* Working Hours & Follow */}
          <div>
            <h4 className="font-bold text-white text-sm mb-8 uppercase tracking-widest">Working Hours</h4>
            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4">
                <svg className="mt-1 text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div className="text-sm text-white/50 leading-loose">
                  Monday – Friday: 9:00 AM – 8:00 PM<br />
                  Saturday: 9:00 AM – 5:00 PM<br />
                  Sunday: 10:00 AM – 2:00 PM<br />
                  <span className="text-white/30">(Emergency Only)</span>
                </div>
              </div>
            </div>

            <h4 className="font-bold text-white text-sm mb-6 uppercase tracking-widest">Follow Us</h4>
            <div className="flex gap-3">
              {[
                { n: 'fb', i: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { n: 'tw', i: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { n: 'ig', i: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01' },
                { n: 'in', i: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 2a2 2 0 11-2 2 2 2 0 012-2z' }
              ].map(s => (
                <div key={s.n} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 cursor-pointer transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.i}/></svg>
                </div>
              ))}
            </div>
            <button onClick={() => setIsLoginModalOpen(true)} className="mt-8 text-[11px] text-white/20 hover:text-white uppercase tracking-widest transition-colors">Staff Access</button>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex justify-center">
          <p className="text-white/30 text-[13px] tracking-wide text-center">
            © 2026 Shiva Medicals. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
