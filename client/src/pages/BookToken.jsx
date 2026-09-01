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

const parseDoctorName = (fullName) => {
  if (!fullName) return { name: '', qualifications: '', translation: '' };
  const tamilRegex = /\(([\u0B80-\u0BFF\s,().\-\u200B-\u200D]+)\)/;
  const tamilMatch = fullName.match(tamilRegex);
  let translation = '';
  let cleanName = fullName;
  if (tamilMatch) {
    translation = tamilMatch[1].trim();
    cleanName = fullName.replace(tamilRegex, '').trim();
  }
  const degreeRegex = /\b(MBBS|MD|DCH|DLO|D\.DIAB|MS|DrNB)\b/i;
  const degreeMatch = cleanName.match(degreeRegex);
  let name = cleanName;
  let qualifications = '';
  if (degreeMatch) {
    const index = degreeMatch.index;
    name = cleanName.substring(0, index).trim();
    qualifications = cleanName.substring(index).trim();
    name = name.replace(/^[,\s]+|[,\s]+$/g, '');
    qualifications = qualifications.replace(/^[,\s]+|[,\s]+$/g, '');
  }
  return { name, qualifications, translation };
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

const DatePicker = ({ value, onChange, isExtra = false }) => {
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

  const canPrev = isExtra 
    ? (viewYear > today.getFullYear() - 1 || (viewYear === today.getFullYear() - 1 && viewMonth > today.getMonth()))
    : (viewYear > today.getFullYear() || viewMonth > today.getMonth());
  const canNext = viewYear < maxDate.getFullYear() || (viewYear===maxDate.getFullYear() && viewMonth<maxDate.getMonth());

  const prevM = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextM = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const pick = (day) => {
    const cellDate = new Date(viewYear, viewMonth, day);
    cellDate.setHours(0,0,0,0);
    if ((!isExtra && cellDate < today) || cellDate > maxDate) return;
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
              const isDisabled = (!isExtra && cellDate < today) || cellDate > maxDate;
              const isToday = toDateStr(today)===ds;
              const isSel = value===ds;
              return (
                <button key={day} type="button" onClick={()=>pick(day)} disabled={isDisabled}
                  className={`h-8 w-full rounded-xl text-[12px] font-bold transition-all leading-none
                    ${isSel ? 'bg-ink text-white shadow-xl shadow-ink/20' : isToday ? 'text-blue-primary bg-blue-50' : isDisabled ? 'text-slate-300 bg-slate-50/50 line-through cursor-not-allowed opacity-40' : 'hover:bg-slate-50 text-ink'}`}>
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
  patientName: '', phone: '',
  patientAgeYears: '', patientAgeMonths: '', patientAgeDays: 0,
  doctorId: '', sessionId: '', date: '', location: '',
};

const BookToken = ({ onClose, initialDoctorId, initialCancelMode = false, isExtra = false }) => {
  const [form, setForm] = useState({
    ...initialFormState,
    doctorId: initialDoctorId || '',
    isExtra: isExtra,
  });
  const isDashboard = window.location.pathname.includes('/staff/dashboard') || window.location.pathname.includes('/admin');
  const isStaff = isDashboard && !!localStorage.getItem('adminToken');
  const getSessionRestrictionStatus = (s) => {
    if (!s || s.id === 'none') return null;
    const restriction = s.restriction_type || 'none';
    if (restriction === 'all') return 'closed';
    if (restriction === 'guest' && !isStaff) return 'unavailable';
    return null;
  };
  const [isDays, setIsDays] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [isDoctorAvailable, setIsDoctorAvailable] = useState(true);
  const [blockedSessions, setBlockedSessions] = useState([]);

  // Cancellation state
  const [cancelMode, setCancelMode] = useState(initialCancelMode);
  const [cancelPhone, setCancelPhone] = useState('');
  const [myBookings, setMyBookings] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [confirmPrompt, setConfirmPrompt] = useState(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  
  const [bookingRestriction, setBookingRestriction] = useState('none');

  useEffect(() => {
    if (!form.sessionId || !form.date) {
      setBookingRestriction('none');
      return;
    }
    fetch(`${API_URL}/api/sessions/${form.sessionId}/restrictions?date=${form.date}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.booking_restriction) {
          setBookingRestriction(data.booking_restriction);
        } else {
          setBookingRestriction('none');
        }
      })
      .catch(err => {
        console.error('Failed to fetch session settings:', err);
        setBookingRestriction('none');
      });
  }, [form.sessionId, form.date, API_URL]);

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

  useEffect(() => {
    if (form.doctorId && form.date) {
      fetch(`${API_URL}/api/admin/doctors/${form.doctorId}/availability?date=${form.date}`)
        .then(r => r.json())
        .then(data => {
          setIsDoctorAvailable(!data.is_full_day);
          setBlockedSessions(data.blocked_sessions || []);
        })
        .catch(e => console.error('Error fetching doctor availability:', e));
    } else {
      setIsDoctorAvailable(true);
      setBlockedSessions([]);
    }
  }, [form.doctorId, form.date]);

  // Sync sessions when doctor selection changes
  useEffect(() => {
    if (form.doctorId) {
      setNextAvailableDate(null);
      fetch(`${API_URL}/api/sessions/${form.doctorId}?date=${form.date}&_=${Date.now()}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSessions(data);
            // Auto-select if solo session
            if (data.length === 1) setForm(p => ({ ...p, sessionId: String(data[0].id) }));
          } else if (data && data.nextAvailableDate) {
            setSessions([]);
            setNextAvailableDate(data.nextAvailableDate);
          } else {
            setSessions([]);
          }
        })
        .catch((e) => {
          console.error('Fetch sessions error:', e);
          setSessions([]);
        });
    } else {
      setSessions([]);
      setForm(p => ({ ...p, sessionId: '' }));
    }
  }, [form.doctorId, form.date]);

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
    Array.isArray(sessions) ? sessions.find(s => String(s.id) === String(form.sessionId)) : null
  , [sessions, form.sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAgeComplete = isDays ? form.patientAgeDays !== '' : (form.patientAgeYears !== '' && form.patientAgeMonths !== '');
    if (!form.patientName || !form.phone || !form.doctorId || !form.date || !form.sessionId || !form.location || !isAgeComplete) {
      setError('Please complete all required fields (*)'); 
      return;
    }

    if (selectedSession) {
      const rest = getSessionRestrictionStatus(selectedSession);
      if (rest === 'closed') {
        setError('Booking is currently closed for this session.');
        return;
      }
      if (rest === 'unavailable') {
        setError('Booking is currently unavailable for guest users for this session.');
        return;
      }
    }
    
    setError(''); 
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const adminToken = localStorage.getItem('adminToken');
      if (isDashboard && adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
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
    const docInfo = selectedDoctor?.name ? parseDoctorName(selectedDoctor.name) : { name: selectedDoctor?.name || '—', qualifications: '', translation: '' };
    return (
      <div className="flex flex-col items-center text-center py-1 animate-fade-in relative w-full">
        {/* Top Header */}
        <div className={`w-12 h-12 rounded-full shadow-md text-white flex items-center justify-center mb-3 ${form.isExtra ? 'bg-purple-600 shadow-purple-600/20' : 'bg-brand-green shadow-brand-green/20'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p className={`text-[11px] font-bold tracking-[0.2em] mb-1 uppercase ${form.isExtra ? 'text-purple-600' : 'text-brand-green'}`}>Success</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          {form.isExtra ? 'Extra Appointment Confirmed.' : 'Appointment Confirmed.'}
        </h2>
        <p className="text-[13px] text-muted-text mb-4">Show this token number at reception for your turn.</p>

        {/* The Card - High-Contrast Ticket Aesthetic */}
        <div className="w-full bg-slate-50 rounded-2xl overflow-hidden shadow-sm mb-4 relative group text-left border border-slate-200/80">
          <div className={`absolute top-0 left-0 w-full h-[5px] ${form.isExtra ? 'bg-purple-600' : 'bg-brand-green'}`} />
          
          <div className="relative p-4 sm:p-6">
            {/* Card Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${form.isExtra ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-brand-green'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <span className="text-slate-800 font-bold text-xs uppercase tracking-wider">Appointment Token</span>
            </div>
            
            {/* Card Body */}
            <div className="grid grid-cols-[1fr_1.3fr] gap-3 mb-3">
              <div className="flex items-center justify-center border-r border-slate-200 pr-3">
                <span className="font-sans text-[64px] sm:text-[80px] leading-none text-blue-primary font-black drop-shadow-sm">{success.token_number}</span>
              </div>
              <div className="flex flex-col justify-center gap-1.5 pl-3 text-[13px]">
                <div className="flex items-start"><span className="text-slate-500 w-16 font-semibold shrink-0">Patient:</span> <span className="text-slate-900 font-bold truncate">{success.patient_name}</span></div>
                <div className="flex items-start"><span className="text-slate-500 w-16 font-semibold shrink-0">Age:</span> <span className="text-slate-900 font-bold truncate">{success.patient_age_days > 0 ? `${success.patient_age_days}d` : `${success.patient_age_years}y ${success.patient_age_months}m`}</span></div>
                <div className="flex items-start"><span className="text-slate-500 w-16 font-semibold shrink-0">Date:</span> <span className="text-slate-900 font-bold">{formatDateDisplay(success.booking_date)}</span></div>
                {!form.isExtra && (
                  <div className="flex items-start"><span className="text-slate-500 w-16 font-semibold shrink-0">Estimated:</span> <span className="text-slate-900 font-bold">{formatTimeAMPM(success.estimated_time)}</span></div>
                )}
                <div className="flex items-start"><span className="text-slate-500 w-16 font-semibold shrink-0">Specialty:</span> <span className="text-slate-900 font-bold capitalize truncate">{selectedDoctor?.specialty || (selectedDoctor?.type === 'child' ? 'Pediatrics' : 'General Medicine')}</span></div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-baseline gap-1.5 text-[13px]">
              <span className="text-slate-500 font-semibold">Doctor Specialist:</span>
              <span className="text-slate-900 font-extrabold">{docInfo.name}</span>
              {docInfo.qualifications && <span className="text-blue-primary text-[11px] font-bold">({docInfo.qualifications})</span>}
            </div>
          </div>
        </div>
        
        {/* Arrival Time Notice */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 sm:p-3.5 mb-4 w-full text-left animate-fade-in shadow-sm">
          <div className="flex items-start gap-2.5">
             <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
             </div>
             <div className="flex flex-col gap-0.5">
               <p className="text-amber-950 font-bold text-[12px] sm:text-[13px] leading-snug">
                 பதிவு செய்யப்பட்ட நேரத்திலிருந்து ஒரு மணி நேரத்திற்கு தாங்கள் வரவில்லை என்றால் டோக்கன் காலாவதி ஆகிவிடும்.
               </p>
               <p className="text-amber-800/90 font-medium text-[11px] sm:text-[12px] leading-snug">
                 If you do not arrive within one hour of the registered time, the token will expire.
               </p>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-1 pb-2">
          <button 
            type="button"
            onClick={() => { setSuccess(null); setForm(initialFormState); }} 
            className="w-full bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-bold text-sm h-12 rounded-xl border border-slate-200/80 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Book Another
          </button>
          
          <button 
            onClick={() => {
              const isAdmin = localStorage.getItem('adminToken');
              if (!isAdmin) {
                onClose();
                window.location.href = '/';
              } else {
                onClose();
              }
            }} 
            className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-bold text-sm uppercase tracking-wider h-12 rounded-xl shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Done
          </button>
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
            {cancelLoading ? 'Searching...' : 'Find Appointment'}
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
          <h2 className="font-serif text-xl sm:text-3xl font-semibold text-ink leading-tight">
            {form.isExtra ? 'Extra Appointment' : 'Book Appointment'}
          </h2>
          <p className="text-muted-text text-[10px] sm:text-sm mt-0.5 opacity-60 italic font-medium hidden xs:block">
            {form.isExtra ? 'Bypass current booking restrictions.' : 'Reserve your spot in minutes.'}
          </p>
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
          <div className="flex items-center justify-between mb-2">
            <label className="form-label-premium mb-0">Patient Age *</label>
            
            {/* Segmented Tab Control */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
              <button
                type="button"
                onClick={() => {
                  setIsDays(false);
                  setForm(p => ({ ...p, patientAgeYears: '', patientAgeMonths: '', patientAgeDays: 0 }));
                }}
                className={`px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  !isDays 
                    ? 'bg-white text-blue-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Years & Months
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDays(true);
                  setForm(p => ({ ...p, patientAgeYears: 0, patientAgeMonths: 0, patientAgeDays: '' }));
                }}
                className={`px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  isDays 
                    ? 'bg-white text-blue-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Days (Infants)
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {!isDays ? (
              <>
                <div className="relative group">
                  <select 
                    name="patientAgeYears" 
                    value={form.patientAgeYears} 
                    onChange={handleChange} 
                    className="input-premium h-[42px] appearance-none pr-10 cursor-pointer focus:ring-blue-primary w-full" 
                    required={!isDays}
                  >
                    <option value="">Years</option>
                    {[...Array(111).keys()].map(y => <option key={y} value={y}>{y} Years</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-primary transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
                <div className="relative group">
                  <select 
                    name="patientAgeMonths" 
                    value={form.patientAgeMonths} 
                    onChange={handleChange} 
                    className="input-premium h-[42px] appearance-none pr-10 cursor-pointer focus:ring-blue-primary w-full" 
                    required={!isDays}
                  >
                    <option value="">Months</option>
                    {[...Array(12).keys()].map(m => <option key={m} value={m}>{m} Months</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-primary transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 relative group">
                <select 
                  name="patientAgeDays" 
                  value={form.patientAgeDays} 
                  onChange={handleChange} 
                  className="input-premium h-[42px] appearance-none pr-10 cursor-pointer focus:ring-blue-primary w-full" 
                  required={isDays}
                >
                  <option value="">Select Days</option>
                  {[...Array(31).keys()].map(d => <option key={d+1} value={d+1}>{d+1} Days</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-primary transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            )}
          </div>
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
          <DatePicker value={form.date} onChange={handleDateChange} isExtra={form.isExtra} />
        </div>
      </div>

      {selectedDoctor && !isDoctorAvailable && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-[13px] text-amber-700 font-medium flex items-center gap-3 animate-fade-in mb-2 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <span className="flex-1 text-left line-clamp-2">
            Doctor is not available on {formatDateDisplay(form.date)}. Please choose another date.
          </span>
        </div>
      )}

      {/* Session Selection Section */}
      <div className={`transition-all duration-700 transform ${form.doctorId ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1 pointer-events-none'}`}>
        <label className="form-label-premium block mb-1">Available Sessions *</label>
        
        {form.doctorId && sessions.length === 0 ? (
          <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-2xl border border-slate-100 animate-fade-in relative transition-all">
             {nextAvailableDate ? (
               <button 
                 type="button" 
                 onClick={() => handleDateChange(nextAvailableDate)}
                 className="flex items-center gap-2 hover:bg-white/50 px-2 -ml-2 py-1 rounded-xl transition-all group/next"
               >
                 <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover/next:scale-110 transition-transform">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                 </div>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-left">
                   Next availability on {new Date(`${nextAvailableDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                   <span className="block text-[8px] opacity-60 font-bold uppercase tracking-widest mt-0.5">Click to switch to this date</span>
                 </span>
               </button>
             ) : (
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin"></div>
                 <span className="text-[11px] font-bold text-muted-text/40 uppercase tracking-widest italic">Checking availability…</span>
               </div>
             )}
          </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
             {(sessions.length > 0 ? sessions : [{ id: 'none', session_type: 'Pick a doctor first' }]).map(s => {
               const restriction = getSessionRestrictionStatus(s);
               const isBlocked = s.id !== 'none' && (blockedSessions.includes(s.session_type) || !isDoctorAvailable || restriction !== null);
               console.log('BookToken session debug:', s.session_type, 'restriction:', restriction, 'isBlocked:', isBlocked, 's.restriction_type:', s.restriction_type);
               return (
                 <button 
                   key={s.id} 
                   type="button" 
                   disabled={s.id === 'none' || isBlocked}
                   onClick={() => setForm(p => ({ ...p, sessionId: String(s.id) }))}
                   className={`flex flex-col items-start px-4 py-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                     form.sessionId === String(s.id)
                       ? 'bg-ink text-white border-ink shadow-lg'
                       : s.id === 'none' 
                         ? 'bg-slate-50 border-slate-100 text-slate-300' 
                         : isBlocked
                           ? 'bg-rose-50 border-rose-100 text-rose-400 opacity-60 cursor-not-allowed'
                           : 'bg-white border-slate-100 hover:border-blue-primary/40 text-ink shadow-sm'
                   }`}
                 >
                   <div className="flex w-full items-center justify-between pointer-events-none">
                     <span className="text-[11px] font-black uppercase tracking-[0.15em]">{s.session_type}</span>
                     {isBlocked && (
                       <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                         {restriction === 'closed' ? 'CLOSED' : (restriction === 'unavailable' ? 'STAFF ONLY' : 'UNAVAILABLE')}
                       </span>
                     )}
                   </div>
                   {s.start_time && (
                     <span className={`text-[10px] font-medium mt-1 ${form.sessionId === String(s.id) ? 'text-white/60' : 'text-slate-400'}`}>
                       Time: {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                     </span>
                   )}
                 </button>
               );
             })}
           </div>
        )}
        {selectedSession && getSessionRestrictionStatus(selectedSession) && (
           <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-[13px] text-rose-700 font-medium flex items-center gap-3 animate-fade-in mt-3 shadow-sm">
             <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
             </div>
             <span className="flex-1 text-left">
               {getSessionRestrictionStatus(selectedSession) === 'closed' 
                 ? 'Booking is currently closed for this session.' 
                 : 'Booking is currently unavailable for guest users for this session.'}
             </span>
           </div>
         )}
      </div>

      {/* Location */}
      <div className="flex flex-col">
        <label className="form-label-premium">Location(Area) *</label>
        <input 
          type="text"
          name="location" 
          value={form.location} 
          onChange={handleChange} 
          placeholder="e.g. City or Area name" 
          className="input-premium h-[42px] focus:ring-teal-500"
          required
        />
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col items-center gap-2 mt-2 w-full">
        <button 
          type="submit" 
          disabled={loading || (!form.isExtra && !isDoctorAvailable) || (selectedSession && getSessionRestrictionStatus(selectedSession) !== null)} 
          className={`w-full h-11 sm:h-12 rounded-xl text-white font-bold text-base shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-40 ${
            form.isExtra ? 'bg-purple-600 shadow-purple-600/20' : 'bg-[#00c389] shadow-[#00c389]/20'
          }`}
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
