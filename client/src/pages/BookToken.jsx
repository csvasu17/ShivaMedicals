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
        className={`input-premium w-full flex items-center justify-between gap-2 text-left h-14 ${!value ? 'text-muted-text/55' : 'text-ink'}`}
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

  useEffect(() => {
    fetch(`${API_URL}/api/doctors`)
      .then(r => r.json())
      .then(setDoctors)
      .catch((e) => {
        console.error('Fetch doctors error:', e);
        setError('Unable to reach server. Please try again later.');
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

  const selectedDoctor = useMemo(() => doctors.find(d => String(d.id) === String(form.doctorId)), [doctors, form.doctorId]);

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
      console.error('Submit error:', err);
      // Fallback relative fetch if localhost fails (helps with mixed content/remote dev)
      if (API_URL.includes('localhost')) {
         try {
           const relRes = await fetch(`/api/bookings`, {
             method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
           });
           const relData = await relRes.json();
           if (relRes.ok) { setSuccess(relData); return; }
         } catch(e) {}
      }
      setError('Connection failed. Ensure you are connected and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-teal-primary flex items-center justify-center mb-6 shadow-2xl shadow-teal-primary/20 rotate-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-primary mb-2">Success</p>
        <h2 className="font-serif text-3xl font-semibold text-ink mb-2">Appointment Confirmed.</h2>
        <p className="text-sm text-muted-text max-w-xs mb-8">Your appointment is reserved. Arrive 10 minutes prior to your estimated time.</p>
        
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="bg-ink rounded-[24px] p-5 text-left text-white shadow-xl shadow-ink/10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">Token</p>
            <p className="font-serif text-5xl font-black leading-none mb-4">{success.token_number}</p>
            <div className="pt-4 border-t border-white/10">
               <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Est. Time</p>
               <p className="text-xl font-bold">{success.estimated_time?.slice(0,5)}</p>
            </div>
          </div>
          <div className="bg-slate-50/80 rounded-[24px] p-5 text-left border border-slate-100 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-muted-text uppercase tracking-widest font-black mb-1">Patient</p>
              <p className="font-bold text-sm text-ink truncate">{success.patient_name}</p>
            </div>
            <div className="mt-4">
              <p className="text-[10px] text-muted-text uppercase tracking-widest font-black mb-1">Doctor</p>
              <p className="font-bold text-sm text-ink truncate">{selectedDoctor?.name||'—'}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="w-full justify-center h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-emerald-600 hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-3xl font-semibold text-ink leading-tight">Book Appointment</h2>
        <p className="text-muted-text text-sm mt-0.5 opacity-60 italic font-medium">Reserve your spot in minutes — hassle-free visit.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100/50 p-3.5 text-[13px] text-red-600 font-medium flex items-center gap-3 animate-fade-in">
          <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {/* Patient Name */}
        <div className="flex flex-col">
          <label className="form-label-premium">Patient Name *</label>
          <input 
            type="text" 
            name="patientName" 
            value={form.patientName} 
            onChange={handleChange} 
            placeholder="e.g. Ramesh Kumar" 
            className="input-premium h-12 focus:ring-teal-500" 
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
            className="input-premium h-12 focus:ring-teal-500" 
            required
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
              className="input-premium h-12 appearance-none pr-10 cursor-pointer focus:ring-teal-500" 
              required
            >
              <option value="">Select a specialist…</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
        <label className="form-label-premium block mb-2">Available Sessions *</label>
        
        {form.doctorId && sessions.length === 0 ? (
          <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-[11px] font-bold text-muted-text/40 uppercase tracking-widest italic animate-pulse">
            Checking availability…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(sessions.length > 0 ? sessions : [{ id: 'none', session_type: 'Pick a doctor first' }]).map(s => (
              <button 
                key={s.id} 
                type="button" 
                disabled={s.id === 'none'}
                onClick={() => setForm(p => ({ ...p, sessionId: String(s.id) }))}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-500 relative overflow-hidden group ${
                  form.sessionId === String(s.id)
                    ? 'bg-ink text-white border-ink shadow-2xl shadow-ink/10 scale-[1.01]'
                    : s.id === 'none' 
                      ? 'bg-slate-50 border-slate-100 text-slate-300' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-teal-500/40 hover:bg-white text-ink hover:shadow-lg active:scale-95'
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.15em] mb-1">{s.session_type}</span>
                {s.start_time && (
                  <span className={`text-[10px] font-medium tracking-tight ${form.sessionId === String(s.id) ? 'text-white/40' : 'text-muted-text/60'}`}>
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
          className="input-premium py-3 resize-none h-12 focus:ring-teal-500"
        />
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col items-center gap-3">
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full h-14 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-emerald-600 hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-40"
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
