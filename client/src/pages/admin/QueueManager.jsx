import React, { useState, useEffect } from 'react';

export default function QueueManager({ setRoute, user, onAddPatient }) {
  const [doctors, setDoctors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [tokens, setTokens] = useState([]);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]); 

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

  useEffect(() => {
    fetch(`${API_URL}/api/doctors`)
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        if (data.length > 0) setSelectedDoctor(data[0].id);
      })
      .catch(err => console.error('Error fetching doctors:', err));
  }, [API_URL]);

  useEffect(() => {
    if (!selectedDoctor) return;
    fetch(`${API_URL}/api/sessions/${selectedDoctor}`)
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        if (data.length > 0) setSelectedSession(data[0].id);
        else setSelectedSession('');
      })
      .catch(err => console.error(err));
  }, [selectedDoctor, API_URL]);

  const fetchTokens = () => {
    if (!selectedSession) {
      setTokens([]);
      return;
    }
    fetch(`${API_URL}/api/admin/bookings?date=${dateStr}&sessionId=${selectedSession}`)
      .then(res => res.json())
      .then(data => setTokens(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 5000);
    return () => clearInterval(interval);
  }, [selectedSession, dateStr, API_URL]);

  const handleAction = async (id, action) => {
    try {
      let newStatus = action === 'call' ? 'called' : action === 'complete' ? 'completed' : action === 'noshow' ? 'no_show' : 'cancelled';
      await fetch(`${API_URL}/api/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus })
      });
      fetchTokens();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const metrics = {
    total: tokens.length,
    waiting: tokens.filter(t => t.status === 'confirmed').length,
    present: tokens.filter(t => t.status === 'called').length,
    served: tokens.filter(t => t.status === 'completed').length,
    absent: tokens.filter(t => t.status === 'no_show' || t.status === 'cancelled').length,
  };

  const metricCards = [
    { label: "Total queue", val: metrics.total, color: "text-ink" },
    { label: "Waiting", val: metrics.waiting, color: "text-blue-mid" },
    { label: "In consultation", val: metrics.present, color: "text-ink" },
    { label: "Completed", val: metrics.served, color: "text-teal-primary" },
    { label: "Absent/No-show", val: metrics.absent, color: "text-ink/40" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <span className="eyebrow mb-4">Staff Dashboard</span>
          <h2 className="text-4xl lg:text-5xl font-serif font-medium text-ink tracking-tight mb-2">Live Queue Manager</h2>
          <p className="text-muted-text text-lg">Manage real-time patient flow and session updates.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-4 shadow-sm">
             <input 
               type="date" 
               value={dateStr} 
               onChange={e => setDateStr(e.target.value)} 
               className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer" 
             />
           </div>
           <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 shadow-sm">
             <select 
               value={selectedDoctor} 
               onChange={e => setSelectedDoctor(e.target.value)} 
               className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat"
             >
               {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
             </select>
           </div>
           <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 shadow-sm">
             <select 
               value={selectedSession} 
               onChange={e => setSelectedSession(e.target.value)} 
               className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat capitalize"
             >
               {sessions.map(s => <option key={s.id} value={s.id}>{s.session_type} ({s.start_time.slice(0,5)})</option>)}
             </select>
           </div>
           <button onClick={onAddPatient} className="btn-dark !h-14 px-8 !rounded-2xl text-[14px]">
             Add patient
           </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="bg-ink rounded-[40px] p-8 md:p-12 mb-12 grid grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(24,71,194,0.15)_0%,transparent_70%)] opacity-50"></div>
        {metricCards.map((m, i) => (
          <div key={i} className={`relative z-10 lg:px-10 first:pl-0 last:pr-0 ${i !== metricCards.length-1 ? 'lg:border-r border-white/5' : ''} animate-fade-in`} style={{animationDelay: `${i * 100}ms`}}>
             <p className={`text-[32px] md:text-[40px] font-serif font-medium leading-none mb-2 ${m.color.includes('ink') ? 'text-white' : m.color}`}>{m.val}</p>
             <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{m.label}</p>
          </div>
        ))}
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 relative z-10 overflow-hidden">
         <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-ink">Queue timeline</h3>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={fetchTokens}>
               <span className="text-[11px] font-bold text-muted-text uppercase tracking-widest">Auto-refreshing</span>
               <div className="w-2 h-2 rounded-full bg-teal-primary animate-pulse"></div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cream-base/30 text-[11px] uppercase font-bold tracking-widest text-ink/40">
                  <th className="pl-10 pr-6 py-5">Token</th>
                  <th className="px-6 py-5">Patient Details</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right pr-10">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tokens.map((t, idx) => (
                  <tr key={t.id} className="group hover:bg-cream-base/20 transition-all">
                    <td className="pl-10 pr-6 py-8">
                       <div className="w-14 h-14 bg-ink text-white rounded-2xl flex items-center justify-center text-2xl font-serif font-medium group-hover:bg-blue-primary transition-colors">
                          {t.token_number}
                       </div>
                       <p className="text-[10px] font-bold text-muted-text mt-3 uppercase tracking-wider">ETA: {t.estimated_time?.slice(0,5)}</p>
                    </td>
                    <td className="px-6 py-8">
                       <div className="font-bold text-lg text-ink leading-tight mb-1">{t.patient_name}</div>
                       <div className="text-[13px] font-medium text-muted-text">{t.patient_phone}</div>
                    </td>
                    <td className="px-6 py-8">
                       {t.status === 'confirmed' && <span className="bg-cream-base-dark text-ink/60 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border border-cream2">Waiting</span>}
                       {t.status === 'called' && <span className="bg-blue-primary/10 text-blue-primary px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border border-blue-primary/10 flex items-center gap-2 w-fit">In Consultation</span>}
                       {t.status === 'completed' && <span className="bg-teal-primary/10 text-teal-primary px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border border-teal-primary/10">Completed</span>}
                       {(t.status === 'no_show' || t.status === 'cancelled') && <span className="bg-slate-100 text-slate-400 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider">No-show</span>}
                    </td>
                    <td className="px-6 py-8 text-right pr-10">
                       <div className="flex justify-end gap-3">
                          {t.status === 'confirmed' && (
                             <button onClick={() => handleAction(t.id, 'call')} className="btn-dark !h-11 !px-6 !text-[12px] !rounded-xl">Call Now</button>
                          )}
                          {t.status === 'called' && (
                             <>
                                <button onClick={() => handleAction(t.id, 'complete')} className="bg-teal-primary hover:bg-ink text-white font-bold h-11 px-6 rounded-xl text-[12px] transition-all">Finish</button>
                                <button onClick={() => handleAction(t.id, 'noshow')} className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-muted-text font-bold h-11 px-6 rounded-xl text-[12px] transition-all">No-show</button>
                             </>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tokens.length === 0 && (
               <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-cream-base text-muted-text/30 rounded-2xl flex items-center justify-center mb-6">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                  <h4 className="text-xl font-bold text-ink mb-2">Queue is empty</h4>
                  <p className="text-muted-text text-sm max-w-xs mx-auto">No patients are currently in the queue for this session.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
