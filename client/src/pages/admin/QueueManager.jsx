import React, { useState, useEffect } from 'react';

import { API_URL } from '../../constants/api';
import EditPatientModal from '../../components/modals/EditPatientModal';

export default function QueueManager({ setRoute, user, onAddPatient }) {
  const [doctors, setDoctors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [tokens, setTokens] = useState([]);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]); 
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 15 : 25);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 15 : 25);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      let newStatus = action === 'call' ? 'called' : action === 'complete' ? 'completed' : action === 'noshow' ? 'no_show' : action === 'reset' ? 'confirmed' : 'cancelled';
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

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/bookings/${deleteConfirm}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTokens();
        setDeleteConfirm(null);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to delete'}`);
      }
    } catch (err) {
      console.error('Error deleting booking', err);
      alert('Network error while deleting booking');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tokens.length / itemsPerPage);
  const displayedTokens = tokens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const downloadCSV = () => {
    if (tokens.length === 0) return;
    const headers = ["Token No", "Patient Name", "Mobile", "Email", "Location", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...tokens.map(t => [
        t.token_number,
        `"${t.patient_name}"`,
        t.patient_phone, 
        t.patient_email || "",
        `"${t.location || '-'}"`,
        t.status,
        `"\t${new Date(t.booking_date).toLocaleDateString('en-IN').split('/').join('-')}"` // Force text DD-MM-YYYY
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const metrics = {
    total: tokens.length,
    waiting: tokens.filter(t => t.status === 'confirmed').length,
    serving: tokens.filter(t => t.status === 'called').length,
    completed: tokens.filter(t => t.status === 'completed').length,
    noshow: tokens.filter(t => t.status === 'no_show' || t.status === 'cancelled').length,
  };

  const metricCards = [
    { label: "Total queue", val: metrics.total, color: "text-slate-800", iconColor: "bg-slate-50 text-slate-400", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Waiting", val: metrics.waiting, color: "text-orange-500", iconColor: "bg-orange-50 text-orange-400", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Now serving", val: metrics.serving, color: "text-blue-500", iconColor: "bg-blue-50 text-blue-400", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Completed", val: metrics.completed, color: "text-emerald-500", iconColor: "bg-emerald-50 text-emerald-400", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "No-show", val: metrics.noshow, color: "text-red-500", iconColor: "bg-red-50 text-red-400", icon: "M18 12H6" }
  ];

  const nowServing = tokens.find(t => t.status === 'called');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade-in relative z-10">
      
      {/* HEADER & CONTROLS SECTION */}
      <div className="bg-white rounded-3xl md:rounded-[32px] border border-slate-100 shadow-sm p-5 md:p-8 mb-6 md:mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-end">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Appointment Date</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group hover:border-blue-primary transition-all shadow-sm">
                <input 
                  type="date" 
                  value={dateStr} 
                  onChange={e => { setDateStr(e.target.value); setCurrentPage(1); }} 
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer w-full" 
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Doctor</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-5 relative group hover:border-blue-primary transition-all shadow-sm">
                <select 
                  value={selectedDoctor} 
                  onChange={e => { setSelectedDoctor(e.target.value); setCurrentPage(1); }} 
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer appearance-none w-full pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat"
                >
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Time Slot</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-5 relative group hover:border-blue-primary transition-all shadow-sm">
                <select 
                  value={selectedSession} 
                  onChange={e => { setSelectedSession(e.target.value); setCurrentPage(1); }} 
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer appearance-none w-full pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%20%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat capitalize"
                >
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.session_type} ({s.start_time.slice(0,5)})</option>)}
                </select>
              </div>
           </div>

           <button onClick={onAddPatient} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 w-full rounded-2xl text-[14px] shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.97]">
             Add patient
           </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-10">
        {metricCards.map((m, i) => (
          <div key={i} className="bg-white rounded-2xl md:rounded-[28px] p-5 md:p-6 border border-slate-100 shadow-sm flex justify-between items-center group hover:scale-[1.02] transition-all">
             <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 md:mb-3 ${m.label === 'Total queue' ? 'text-slate-400' : m.color}`}>
                   {m.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-ink leading-none">{m.val}</p>
             </div>
             <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${m.iconColor}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={m.icon}/></svg>
             </div>
          </div>
        ))}
      </div>

      {/* NOW SERVING BAR */}
      <div className="mb-6 md:mb-10">
        {nowServing ? (
          <div className="bg-blue-50 rounded-2xl md:rounded-[28px] border border-blue-200 p-4 md:p-5 flex flex-col sm:flex-row items-center sm:justify-between gap-4 shadow-sm shadow-blue-500/5">
            <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-xl md:text-2xl text-white shadow-lg shadow-blue-600/20 flex-shrink-0">
                #{nowServing.token_number}
              </div>
              <div className="min-w-0">
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Now Serving</p>
                <h3 className="text-xl md:text-3xl font-serif font-medium text-ink leading-none truncate">{nowServing.patient_name}</h3>
              </div>
            </div>
            <button 
              onClick={() => handleAction(nowServing.id, 'complete')}
              className="bg-green-600 text-white hover:bg-green-700 font-bold h-11 md:h-12 w-full sm:w-auto px-10 md:px-12 rounded-xl text-[12px] md:text-[13px] uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-md"
            >
              Finish Case
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/80 rounded-2xl md:rounded-[28px] border border-dashed border-slate-200 p-6 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No active session</p>
          </div>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
         <div className="px-5 md:px-10 py-6 md:py-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto">
               <h3 className="text-lg md:text-xl font-bold text-ink">Queue timeline</h3>
               <button 
                onClick={downloadCSV}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100/50 group"
               >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted-text group-hover:text-ink transition-colors"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-text group-hover:text-ink">Export</span>
               </button>
            </div>
            
            <div className="flex items-center gap-3 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100/50 self-start md:self-auto">
               <div className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
               </div>
               <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest">LIVE SYNC ACTIVE</span>
            </div>
         </div>

          <div className="overflow-x-auto">
            {/* DESKTOP VIEW */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-slate-50 text-xs text-gray-600 font-semibold tracking-wide">
                  <th className="pl-6 md:pl-12 pr-4 py-6">Appt. No</th>
                  <th className="px-4 md:px-6 py-6">Patient Name</th>
                  <th className="hidden lg:table-cell px-6 py-6">Mobile No</th>
                  <th className="hidden xl:table-cell px-6 py-6">Location</th>
                  <th className="px-4 md:px-6 py-6">Status</th>
                  <th className="px-4 md:px-6 py-6 text-right pr-6 md:pr-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {displayedTokens.map((t, idx) => {
                  const isActive = t.status === 'called';
                  return (
                    <tr key={t.id} className={`group hover:bg-slate-50/50 transition-all duration-300 ${isActive ? 'bg-blue-50/40' : ''}`}>
                      <td className="pl-6 md:pl-12 pr-4 py-4 md:py-6">
                         <div className="text-[15px] md:text-[17px] font-black text-ink">
                            #{t.token_number}
                         </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-6 transition-all border-b border-transparent">
                         <div className="flex flex-col min-w-0">
                            <div className="font-bold text-[14px] md:text-[16px] text-ink leading-tight truncate">{t.patient_name}</div>
                            <div className="hidden sm:block text-[11px] md:text-[12px] font-medium text-muted-text/30 mt-0.5 truncate">{t.patient_email || 'No email provided'}</div>
                         </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-6">
                         <div className="text-[14px] font-bold text-ink/70 tracking-tight">
                            {t.patient_phone}
                         </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-6 text-[14px] font-semibold text-ink/40 max-w-[200px] truncate">
                         {t.location || 'Not provided'}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-6">
                         {t.status === 'confirmed' && <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest">Waiting</span>}
                         {t.status === 'called' && <span className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Active</span>}
                         {t.status === 'completed' && <span className="bg-emerald-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Done</span>}
                         {(t.status === 'no_show' || t.status === 'cancelled') && <span className="text-red-500/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest line-through">Absent</span>}
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-6 text-right pr-6 md:pr-12">
                          <div className="flex justify-end gap-2 transition-all duration-300">
                             {(t.status === 'confirmed' || t.status === 'called') && (
                                <>
                                   {t.status === 'confirmed' ? (
                                      <button onClick={() => handleAction(t.id, 'call')} className="bg-ink hover:bg-blue-primary text-white font-bold h-9 md:h-10 px-3 md:px-5 rounded-xl text-[10px] md:text-[11px] shadow-lg shadow-ink/10 transition-all active:scale-95 whitespace-nowrap">Call</button>
                                   ) : (
                                      <button onClick={() => handleAction(t.id, 'complete')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 md:h-10 px-3 md:px-5 rounded-xl text-[10px] md:text-[11px] shadow-lg shadow-emerald-500/10 transition-all active:scale-95 whitespace-nowrap">Finish</button>
                                   )}
                                   <button onClick={() => handleAction(t.id, 'noshow')} className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 md:h-10 px-3 md:px-5 rounded-xl text-[10px] md:text-[11px] shadow-lg shadow-rose-600/10 transition-all active:scale-95 whitespace-nowrap" title="Mark as Absent">Absent</button>
                                </>
                             )}
                             {(t.status === 'completed' || t.status === 'no_show' || t.status === 'cancelled') && (
                                <button onClick={() => handleAction(t.id, 'reset')} className="bg-slate-50 border border-slate-200 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold h-9 md:h-10 px-3 md:px-5 rounded-xl text-[10px] md:text-[11px] transition-all active:scale-95 whitespace-nowrap">Re-call</button>
                             )}
                             {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <div className="flex gap-2">
                                  <button 
                                     onClick={() => setEditingPatient(t)} 
                                     className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm shadow-blue-500/5"
                                     title="Edit Patient"
                                  >
                                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                  <button 
                                     onClick={() => handleDelete(t.id)} 
                                     className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all flex-shrink-0"
                                     title="Delete Patient"
                                  >
                                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                                  </button>
                                </div>
                             )}
                          </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* MOBILE VIEW */}
            <div className="md:hidden divide-y divide-slate-50">
              {displayedTokens.map((t) => {
                const isActive = t.status === 'called';
                return (
                  <div key={t.id} className={`p-4 flex flex-col gap-4 ${isActive ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[16px] font-black text-ink">#{t.token_number}</span>
                          <span className="font-bold text-ink text-[15px] truncate max-w-[150px]">{t.patient_name}</span>
                        </div>
                        <span className="text-[11px] font-medium text-muted-text/50 truncate max-w-[200px]">
                          {t.patient_phone} • {t.location || 'Location N/A'}
                        </span>
                      </div>
                      <div>
                        {t.status === 'confirmed' && <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Waiting</span>}
                        {t.status === 'called' && <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Active</span>}
                        {t.status === 'completed' && <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Done</span>}
                        {(t.status === 'no_show' || t.status === 'cancelled') && <span className="text-red-500/40 text-[9px] font-black uppercase tracking-widest line-through">Absent</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      {(t.status === 'confirmed' || t.status === 'called') && (
                         <>
                            {t.status === 'confirmed' ? (
                               <button onClick={() => handleAction(t.id, 'call')} className="bg-ink text-white font-bold h-10 px-6 rounded-xl text-[11px] uppercase tracking-widest flex-1">Call</button>
                            ) : (
                               <button onClick={() => handleAction(t.id, 'complete')} className="bg-emerald-500 text-white font-bold h-10 px-6 rounded-xl text-[11px] uppercase tracking-widest flex-1">Finish</button>
                            )}
                            <button onClick={() => handleAction(t.id, 'noshow')} className="bg-rose-600 text-white font-bold h-10 px-6 rounded-xl text-[11px] uppercase tracking-widest flex-1">Absent</button>
                         </>
                      )}
                      {(t.status === 'completed' || t.status === 'no_show' || t.status === 'cancelled') && (
                         <button onClick={() => handleAction(t.id, 'reset')} className="bg-slate-50 border border-slate-200 text-slate-400 h-10 px-6 rounded-xl text-[11px] font-bold uppercase tracking-widest flex-1">Re-call</button>
                      )}
                       {(user?.role === 'admin' || user?.role === 'superadmin') && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingPatient(t)} 
                              className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm shadow-blue-500/5"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(t.id)} 
                              className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all flex-shrink-0"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                            </button>
                          </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>  
            
            {/* PAGINATION FOOTER */}
            {totalPages > 1 && (
              <div className="px-12 py-8 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[12px] font-bold text-muted-text/50 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}

            {tokens.length === 0 && (
               <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                  <h4 className="text-xl font-bold text-ink mb-2">Queue is empty</h4>
                  <p className="text-muted-text text-sm max-w-xs mx-auto">No patients are currently in the queue for this session.</p>
               </div>
            )}
         </div>

      {/* DELETE CONFIRMATION POPUP */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[400px] bg-white shadow-2xl rounded-[32px] border border-slate-100 p-8 animate-scale-up flex flex-col gap-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center shadow-inner relative overflow-hidden group">
               <div className="absolute inset-0 bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <svg className="relative z-10" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-ink">Delete Patient?</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed px-2">
                This will remove the patient and <span className="font-bold text-red-500/80">automatically reassign tokens</span> for everyone waiting in this session.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button 
                type="button"
                onClick={() => setDeleteConfirm(null)} 
                disabled={deleteLoading}
                className="w-full h-14 rounded-2xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold text-[14px] transition-all outline-none"
              >
                No, Keep
              </button>
              <button 
                type="button"
                onClick={executeDelete} 
                disabled={deleteLoading}
                className="w-full h-14 rounded-2xl text-white bg-red-500 hover:bg-red-600 font-bold text-[14px] transition-all shadow-lg shadow-red-500/20 active:scale-95 outline-none flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-100" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    Deleting...
                  </>
                ) : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PATIENT MODAL */}
      <EditPatientModal 
        isOpen={!!editingPatient} 
        patient={editingPatient} 
        onClose={() => setEditingPatient(null)} 
        onUpdated={fetchTokens} 
      />
    </div>
  );
}
