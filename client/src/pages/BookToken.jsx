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
        className={`input-premium w-full flex items-center justify-between gap-2 text-left h-[48px] ${!value ? 'text-muted-text/55' : 'text-ink'}`}
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
                    ${isSel ? 'bg-ink text-white shadow-xl shadow-ink/20' : isToday ? 'text-blue-primary bg-blue-50/50' : isDisabled ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-ink'}`}>
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
        <h2 className="font-serif text-3xl font-semibold text-ink mb-2">Token Confirmed.</h2>
        <p className="text-sm text-muted-text max-w-xs mb-8">Your token is reserved. Arrive 10 minutes prior to your estimated time.</p>
        
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
        
        <button onClick={onClose} className="btn-dark w-full justify-center !rounded-2xl !py-4 shadow-xl shadow-ink/10 font-bold">Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-black text-ink">Book a token</h2>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100/50 p-4 text-[13px] text-red-600 font-medium flex items-center gap-3 animate-fade-in shadow-sm shadow-red-100/20">
          <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Inputs Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label-premium">Patient name *</label>
            <input type="text" name="patientName" value={form.patientName} onChange={handleChange} placeholder="Ramesh Kumar" className="input-premium h-[48px]" required/>
          </div>
          <div>
            <label className="form-label-premium">Phone *</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Mobile number" className="input-premium h-[48px]" required/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label-premium">Doctor *</label>
            <select name="doctorId" value={form.doctorId} onChange={handleChange} className="input-premium h-[48px]" required>
              <option value="">Select doctor…</option>
              {doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label-premium">Preferred Date *</label>
            <DatePicker value={form.date} onChange={handleDateChange}/>
          </div>
        </div>

        {/* SESSION SELECTOR — Visually disabled if no doctor */}
        <div className={`transition-all duration-500 transform ${form.doctorId ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1 pointer-events-none'}`}>
          <label className="form-label-premium">Available Session *</label>
          {form.doctorId && sessions.length === 0 ? (
            <div className="h-[52px] flex items-center px-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-[11px] font-bold text-muted-text/50 uppercase tracking-widest italic animate-pulse">Checking availability…</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(sessions.length > 0 ? sessions : [{id:'none', session_type:'Select doctor first'}]).map(s=>(
                <button key={s.id} type="button" disabled={s.id==='none'}
                  onClick={()=>setForm(p=>({...p,sessionId:String(s.id)}))}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                    form.sessionId===String(s.id)
                      ?'bg-ink text-white border-ink shadow-2xl shadow-ink/20 scale-[1.02]'
                      : s.id==='none' ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-slate-50/80 border-slate-100 hover:border-blue-primary/30 hover:bg-white text-ink active:scale-95'
                  }`}>
                  <span className="text-[12px] font-black uppercase tracking-[0.15em] mb-1">{s.session_type}</span>
                  {s.start_time && <span className={`text-[10px] font-medium tracking-tight ${form.sessionId===String(s.id)?'text-white/50':'text-muted-text/70'}`}>{s.start_time.slice(0,5)} – {s.end_time.slice(0,5)}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="form-label-premium">Reason for visit <span className="normal-case font-medium text-muted-text/50 ml-1">(Optional)</span></label>
          <input type="text" name="reasonForVisit" value={form.reasonForVisit} onChange={handleChange} placeholder="Brief note..." className="input-premium h-[48px]"/>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-dark w-full justify-center !rounded-[20px] !h-[58px] !text-base shadow-2xl shadow-ink/20 mt-2 transform active:scale-[0.98] disabled:opacity-50">
        {loading ? (
          <div className="flex items-center gap-3">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle className="opacity-20" cx="12" cy="12" r="10"/><path className="opacity-100" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            Confirming Booking…
          </div>
        ) : (
          <div className="flex items-center gap-2">
            Confirm booking 
            <svg className="group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        )}
      </button>

      <p className="text-center text-[10px] font-black text-muted-text/30 uppercase tracking-[0.2em] -mt-1">
        Your security is our priority
      </p>
    </form>
  );
};

export default BookToken;
