import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_URL } from '../constants/api';

/* ─────────────────────────────────────────
   Compact Popover Date Picker
───────────────────────────────────────── */
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDisplay = (ds) => {
  if (!ds) return 'Pick a date…';
  return new Date(`${ds}T00:00:00`).toLocaleDateString(undefined,{
    weekday:'short', month:'short', day:'numeric', year:'numeric'
  });
};

const DatePicker = ({ value, onChange }) => {
  const [open, setOpen]  = useState(false);
  const today = useRef((() => { const d=new Date(); d.setHours(0,0,0,0); return d; })()).current;
  const maxDate = useRef((() => { const d=new Date(today); d.setDate(d.getDate()+29); return d; })()).current;
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const canPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();
  const canNext = viewYear < maxDate.getFullYear() || (viewYear===maxDate.getFullYear() && viewMonth<maxDate.getMonth());

  const prevM = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextM = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const pick = (day) => {
    const cellDate = new Date(viewYear, viewMonth, day);
    cellDate.setHours(0,0,0,0);
    if (cellDate < today || cellDate > maxDate) return;
    onChange(toDateStr(cellDate));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o=>!o)}
        className={`input-premium w-full flex items-center justify-between gap-2 text-left h-[42px] ${!value ? 'text-muted-text/55' : 'text-ink'}`}
      >
        <span className="text-[14px] font-medium tracking-tight">{value ? formatDisplay(value) : 'Pick a date…'}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-text/40">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 bottom-[calc(100%+8px)] sm:bottom-auto sm:top-[calc(100%+8px)] z-[300] bg-white rounded-2xl shadow-2xl shadow-ink/15 border border-slate-100 p-4 w-72 animate-scale-up">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevM} disabled={!canPrev} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 disabled:opacity-20 transition text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-[13px] font-bold text-ink uppercase tracking-wider">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextM} disabled={!canNext} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 disabled:opacity-20 transition text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d=>(<div key={d} className="text-center text-[10px] font-black text-muted-text/40 py-1 uppercase tracking-widest">{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day,i) => {
              if (!day) return <div key={`e${i}`}/>;
              const cellDate = new Date(viewYear, viewMonth, day);
              cellDate.setHours(0,0,0,0);
              const ds = toDateStr(cellDate);
              const isDisabled = (cellDate < today || cellDate > maxDate);
              const isToday = toDateStr(today)===ds;
              const isSel = value===ds;
              return (
                <button key={day} type="button" onClick={()=>pick(day)} disabled={isDisabled}
                  className={`h-8 w-full rounded-xl text-[12px] font-bold transition-all leading-none
                    ${isSel ? 'bg-ink text-white shadow-xl shadow-ink/20' : isToday ? 'text-teal-600 bg-teal-50/50' : isDisabled ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-ink'}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main BookToken
───────────────────────────────────────── */
const initialFormState = {
  patientName:'', phone:'', email:'',
  doctorId:'', sessionId:'', date:'', reasonForVisit:'',
};

const BookToken = ({ onClose }) => {
  const [form, setForm] = useState(initialFormState);
  const [doctors, setDoctors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Cancellation state
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelPhone, setCancelPhone] = useState('');
  const [myBookings, setMyBookings] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [confirmPrompt, setConfirmPrompt] = useState(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/doctors`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDoctors(data);
        } else {
          throw new Error(data.error || 'Failed to load doctors');
        }
      })
      .catch((e) => {
        console.error('Fetch doctors error:', e);
        setError(e.message || 'Unable to reach server. Please try again later.');
        setDoctors([]);
      });
  }, []);

  // Sync sessions when doctor selection changes
  useEffect(() => {
    if (form.doctorId) {
      fetch(`${API_URL}/api/sessions/${form.doctorId}`)
        .then(r => r.json())
        .then(data => {
          setSessions(data);
          // Auto-select if solo session
          if (data.length === 1) setForm(p => ({ ...p, sessionId: String(data[0].id) }));
        })
        .catch((e) => console.error('Fetch sessions error:', e));
    } else {
      setSessions([]);
      setForm(p => ({ ...p, sessionId: '' }));
    }
  }, [form.doctorId]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    if (name === 'doctorId') {
      // Pick today as default if no date set yet
      setForm(p => ({ ...p, doctorId: value, sessionId: '', date: p.date || toDateStr(new Date()) }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const handleDateChange = (ds) => setForm(p => ({ ...p, date: ds }));

  const selectedDoctor = useMemo(() => 
    Array.isArray(doctors) ? doctors.find(d => String(d.id) === String(form.doctorId)) : null
  , [doctors, form.doctorId]);

  const selectedSession = useMemo(() => 
    sessions.find(s => String(s.id) === String(form.sessionId))
  , [sessions, form.sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.phone || !form.doctorId || !form.date || !form.sessionId) {
      setError('Please complete all required fields (*)'); 
      return;
    }
    
    setError(''); 
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data);
      } else {
        setError(data.message || data.error || 'Server rejected the booking. Try another token.');
      }
    } catch (err) {
      setError('Connection failed. Ensure you are connected and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async (e) => {
    e.preventDefault();
    if (!cancelPhone) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      const res = await fetch(`${API_URL}/api/bookings/my?phone=${cancelPhone}`);
      const data = await res.json();
      if (res.ok) {
         setMyBookings(data.filter(b => b.status === 'confirmed')); // only show confirmed
      } else {
         setCancelError(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setCancelError('Network error. Check connection.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelBooking = (booking) => {
    setConfirmPrompt(booking);
  };

  const executeCancelBooking = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, { method: 'PUT' });
      if (res.ok) {
        setMyBookings(prev => prev.filter(b => b.id !== id));
        setCancelSuccessMsg(`Token was cancelled successfully.`);
        setConfirmPrompt(null);
        setTimeout(() => setCancelSuccessMsg(''), 4000);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel');
      }
    } catch (err) {
      alert('Network error while cancelling.');
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-2 animate-fade-in relative w-full">
        {/* Top Header */}
        <div className="w-[60px] h-[60px] rounded-full bg-[#00c389] shadow-lg shadow-[#00c389]/30 text-white flex items-center justify-center mb-5 rotate-0">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p className="text-[12px] font-bold tracking-[0.2em] text-[#00c389] mb-2 uppercase">Success</p>
        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-2">Appointment Confirmed.</h2>
        <p className="text-[15px] text-slate-500 mb-8">Show this token number at reception for your turn.</p>

        {/* The Card */}
        <div className="w-full bg-[#111c24] rounded-[24px] overflow-hidden shadow-2xl mb-7 relative group text-left border border-slate-800">
          <div className="absolute top-0 left-0 w-full h-[140px] bg-gradient-to-b from-[#00c389]/40 to-transparent mix-blend-screen pointer-events-none" />
          
          <div className="relative p-7 sm:px-9">
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#00c389]/20 p-1.5 rounded-lg text-[#00c389]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <span className="text-white font-medium text-base">Token Number</span>
            </div>
            
            {/* Card Body */}
            <div className="grid grid-cols-[1fr_1.3fr] gap-6 mb-7">
              <div className="flex items-center justify-center border-r border-white/10 pr-6">
                <span className="font-serif text-[110px] leading-none text-white font-normal drop-shadow-md">{success.token_number}</span>
              </div>
              <div className="flex flex-col justify-center gap-3 pl-4 text-[15px]">
                <div className="flex items-start"><span className="text-slate-400/80 w-20 font-medium">Patient:</span> <span className="text-white font-medium truncate">{success.patient_name}</span></div>
                <div className="flex items-start"><span className="text-slate-400/80 w-20 font-medium">Date:</span> <span className="text-white font-medium">{formatDateDisplay(success.booking_date)}</span></div>
                <div className="flex items-start"><span className="text-slate-400/80 w-20 font-medium">Time:</span> <span className="text-white font-medium">{formatTimeAMPM(selectedSession?.start_time || success.estimated_time)}</span></div>
                <div className="flex items-start"><span className="text-slate-400/80 w-20 font-medium">Depart:</span> <span className="text-white font-medium capitalize">{selectedDoctor?.specialty || (selectedDoctor?.type === 'child' ? 'Pediatrics' : 'General Medicine')}</span></div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-5 border-t border-white/10 flex text-[14px]">
              <div className="flex gap-2"><span className="text-slate-400/80 font-medium">Doctor:</span><span className="text-white font-medium">{selectedDoctor?.name || '—'}</span></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <button 
          onClick={onClose} 
          className="w-full bg-[#00c389] text-white font-medium text-[17px] py-4 rounded-xl shadow-[0_8px_20px_rgba(0,195,137,0.3)] hover:opacity-90 hover:-translate-y-0.5 transition-all outline-none"
        >
          Go to Dashboard
        </button>
        
        <div className="mt-8 flex items-center justify-center gap-4 w-full text-slate-400">
          <div className="flex-1 h-px bg-slate-200"></div>
          <button 
            type="button"
            onClick={() => { setSuccess(null); setForm(initialFormState); }} 
            className="text-[14px] font-medium text-[#498894] hover:text-teal-700 transition"
          >
            Book Another Appointment
          </button>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>
      </div>
    );
  }

  if (cancelMode) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in w-full min-h-[400px]">
        <div className="flex items-start justify-between gap-4 pr-8 sm:pr-12 md:pr-14">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-ink leading-tight">Cancel Appointment</h2>
            <p className="text-muted-text text-sm mt-0.5 opacity-60 italic font-medium">Enter your phone number to find active tokens.</p>
          </div>
          <button 
            type="button" 
            onClick={() => { setCancelMode(false); setMyBookings(null); setCancelPhone(''); }}
            className="px-4 py-2 text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors border border-slate-200 shadow-sm outline-none whitespace-nowrap mt-1"
          >
            ← BACK
          </button>
        </div>

        <form onSubmit={fetchMyBookings} className="flex gap-3">
          <input 
            type="tel" 
            value={cancelPhone}
            onChange={e => setCancelPhone(e.target.value)}
            placeholder="Enter Phone Number..." 
            className="input-premium h-12 flex-1 focus:ring-red-500 border-2"
            required
          />
          <button type="submit" disabled={cancelLoading} className="px-6 h-12 bg-ink text-white font-bold rounded-xl hover:bg-ink2 transition-colors disabled:opacity-50">
            {cancelLoading ? 'Searching...' : 'Find tokens'}
          </button>
        </form>

        {cancelError && <p className="text-red-500 text-sm font-medium">{cancelError}</p>}

        {myBookings && (
           <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {myBookings.length === 0 ? (
               <div className="text-center text-slate-500 text-sm py-10 font-medium">No active appointments found for this number.</div>
             ) : (
               myBookings.map(b => (
                 <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between group">
                   <div className="flex flex-col">
                     <span className="text-ink font-bold text-lg leading-none mb-1">Token: {b.token_number}</span>
                     <span className="text-slate-500 text-xs font-medium">
                       {formatDateDisplay(b.booking_date)} • {formatTimeAMPM(b.estimated_time)}
                     </span>
                     <span className="text-slate-400 text-xs mt-1 capitalize">{b.doctor_name ? `Dr. ${b.doctor_name}` : ''} • {b.session_type}</span>
                   </div>
                   <button 
                     type="button"
                     onClick={() => handleCancelBooking(b)}
                     className="px-4 py-2 bg-white text-red-500 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                   >
                     Cancel Token
                   </button>
                 </div>
               ))
             )}
           </div>
        )}

        {/* Confirmation Popup */}
        {confirmPrompt && (
          <div className="fixed top-6 right-6 z-[4000] w-[340px] bg-white shadow-[-10px_10px_40px_rgba(0,0,0,0.1)] rounded-[24px] border border-slate-100 p-6 animate-slide-up flex flex-col gap-5 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-ink text-[16px] leading-tight mb-1">Cancel Token?</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">This action cannot be undone. Are you sure you wish to proceed?</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <button 
                type="button"
                onClick={() => setConfirmPrompt(null)} 
                className="flex-1 h-12 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold text-[13px] transition-colors outline-none"
              >
                Keep It
              </button>
              <button 
                type="button"
                onClick={() => executeCancelBooking(confirmPrompt.id)} 
                className="flex-1 h-12 rounded-xl text-white bg-red-500 hover:bg-red-600 font-bold text-[13px] transition-all shadow-lg shadow-red-500/20 active:scale-95 outline-none"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {cancelSuccessMsg && (
          <div className="fixed top-6 right-6 z-[4000] w-[320px] bg-white shadow-[-10px_10px_40px_rgba(0,0,0,0.1)] rounded-[20px] border border-slate-100 p-5 animate-slide-up flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#00c389]/10 text-[#00c389] flex items-center justify-center shrink-0">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-ink text-[14px]">Success</h3>
              <p className="text-slate-500 text-[12px] mt-0.5">{cancelSuccessMsg}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setCancelSuccessMsg('')}
              className="ml-auto text-slate-400 hover:text-ink transition-colors outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-row justify-between items-center gap-3 pr-8 sm:pr-12 md:pr-14 mb-1">
        <div>
          <h2 className="font-serif text-xl sm:text-3xl font-semibold text-ink leading-tight">Book Appointment</h2>
          <p className="text-muted-text text-[10px] sm:text-sm mt-0.5 opacity-60 italic font-medium hidden xs:block">Reserve your spot in minutes.</p>
        </div>
        <button 
          type="button" 
          onClick={() => setCancelMode(true)}
          className="px-3 py-1.5 text-[9px] sm:text-[11px] font-bold tracking-widest uppercase text-red-500 hover:text-red-600 hover:bg-red-100 bg-red-50/80 rounded-lg transition-colors border border-red-500/20 shadow-sm outline-none whitespace-nowrap"
        >
          <span className="hidden sm:inline">CANCEL APPOINTMENT</span>
          <span className="sm:hidden">CANCEL</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100/50 p-4 text-[13px] text-red-600 font-medium flex items-center gap-3 animate-fade-in mb-2 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <span className="flex-1 text-left">{error}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2">
        {/* Patient Name */}
        <div className="flex flex-col">
          <label className="form-label-premium">Patient Name *</label>
          <input 
            type="text" 
            name="patientName" 
            value={form.patientName} 
            onChange={handleChange} 
            placeholder="e.g. Ramesh Kumar" 
            className="input-premium h-[42px] focus:ring-teal-500" 
            required
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label className="form-label-premium">Phone Number *</label>
          <input 
            type="tel" 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            placeholder="Mobile number" 
            className="input-premium h-[42px] focus:ring-teal-500" 
            required
          />
        </div>

        <div className="flex flex-col lg:col-span-2">
          <label className="form-label-premium">Email Address (Optional)</label>
          <input 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="e.g. name@example.com" 
            className="input-premium h-[42px] focus:ring-teal-500" 
          />
        </div>

        {/* Doctor Selection */}
        <div className="flex flex-col">
          <label className="form-label-premium">Doctor Specialist *</label>
          <div className="relative group">
            <select 
              name="doctorId" 
              value={form.doctorId} 
              onChange={handleChange} 
              className="input-premium h-[42px] appearance-none pr-10 cursor-pointer focus:ring-teal-500" 
              required
            >
              <option value="">Select a specialist…</option>
              {Array.isArray(doctors) && doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text/30 group-focus-within:text-teal-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex flex-col">
          <label className="form-label-premium">Preferred Date *</label>
          {/* Ensure datepicker also uses h-12 if I can find the class inside */}
          <DatePicker value={form.date} onChange={handleDateChange} />
        </div>
      </div>

      {/* Session Selection Section */}
      <div className={`transition-all duration-700 transform ${form.doctorId ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1 pointer-events-none'}`}>
        <label className="form-label-premium block mb-1">Available Sessions *</label>
        
        {form.doctorId && sessions.length === 0 ? (
          <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-[11px] font-bold text-muted-text/40 uppercase tracking-widest italic animate-pulse">
            Checking availability…
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
            {(sessions.length > 0 ? sessions : [{ id: 'none', session_type: 'Pick a doctor first' }]).map(s => (
              <button 
                key={s.id} 
                type="button" 
                disabled={s.id === 'none'}
                onClick={() => setForm(p => ({ ...p, sessionId: String(s.id) }))}
                className={`flex flex-col items-start px-3 py-1.5 rounded-xl border text-left transition-all duration-500 relative overflow-hidden group ${
                  form.sessionId === String(s.id)
                    ? 'bg-ink text-white border-ink shadow-2xl shadow-ink/10 scale-[1.01]'
                    : s.id === 'none' 
                      ? 'bg-slate-50 border-slate-100 text-slate-300' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-teal-500/40 hover:bg-white text-ink hover:shadow-lg active:scale-95'
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.15em] mb-1">{s.session_type}</span>
                {s.start_time && (
                  <span className={`text-[9.5px] font-medium tracking-tight ${form.sessionId === String(s.id) ? 'text-white/40' : 'text-muted-text/60'}`}>
                    Slots: {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reason for Visit */}
      <div className="flex flex-col">
        <label className="form-label-premium">Reason for consultation (Optional)</label>
        <textarea 
          name="reasonForVisit" 
          value={form.reasonForVisit} 
          onChange={handleChange} 
          placeholder="Briefly describe your concern..." 
          rows="1"
          className="input-premium py-2 resize-none h-[38px] focus:border-teal-500"
        />
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col items-center gap-2 mt-2 w-full">
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full h-11 sm:h-12 rounded-xl bg-[#00c389] text-white font-bold text-base shadow-lg shadow-[#00c389]/20 hover:opacity-90 hover:shadow-2xl hover:shadow-[#00c389]/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? (
            <div className="flex items-center gap-3 justify-center">
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle className="opacity-20" cx="12" cy="12" r="10"/><path className="opacity-100" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Securing...
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              Confirm Appointment
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          )}
        </button>

          <div className="flex items-center gap-2 opacity-20">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em]">End-to-end encrypted</span>
          </div>
        </div>
    </form>
  );
};

export default BookToken;
