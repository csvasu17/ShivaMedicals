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
  const [remarkingPatient, setRemarkingPatient] = useState(null);
  const [isFullDayBlocked, setIsFullDayBlocked] = useState(false);
  const [blockedSessions, setBlockedSessions] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 15 : 25);
  const [isExtraMode, setIsExtraMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setStatusFilter('all');
  }, [selectedDoctor, selectedSession]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 15 : 25);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!dateStr) return;
    fetch(`${API_URL}/api/doctors?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        let filteredDoctors = data;
        if (user?.role === 'doctor' && user?.doctor_id) {
          filteredDoctors = data.filter(d => d.id === user.doctor_id);
        }
        setDoctors(filteredDoctors);
        if (filteredDoctors.length > 0) {
          // Keep selection if still in list, else pick first (e.g. Anand)
          if (!filteredDoctors.find(d => d.id === selectedDoctor)) {
            setSelectedDoctor(filteredDoctors[0].id);
          }
        } else {
          setSelectedDoctor('');
        }
      })
      .catch(err => console.error('Error fetching doctors:', err));
  }, [dateStr, API_URL, user]);

  useEffect(() => {
    if (!selectedDoctor || !dateStr) return;
    fetch(`${API_URL}/api/admin/doctors/${selectedDoctor}/availability?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        setIsFullDayBlocked(data.is_full_day);
        setBlockedSessions(data.blocked_sessions);
      })
      .catch(err => console.error('Error fetching availability:', err));
  }, [selectedDoctor, dateStr, API_URL]);

  useEffect(() => {
    if (!selectedDoctor) return;
    fetch(`${API_URL}/api/sessions/${selectedDoctor}?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        // Handle both old (array) and new (object with sessions key) response formats
        const sessionList = Array.isArray(data) ? data : (data.sessions || []);
        setSessions(sessionList);
        if (sessionList.length > 0) setSelectedSession(sessionList[0].id);
        else setSelectedSession('');
      })
      .catch(err => console.error('Error fetching sessions:', err));
  }, [selectedDoctor, dateStr, API_URL]);

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

  const handlePaymentStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
      await fetch(`${API_URL}/api/admin/bookings/${id}/payment`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ payment_status: newStatus })
      });
      fetchTokens();
    } catch (err) {
      console.error('Error updating payment status', err);
    }
  };

  const handleRemark = async (id, remark) => {
    try {
      await fetch(`${API_URL}/api/admin/bookings/${id}/payment`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ remarks: remark })
      });
      fetchTokens();
      setRemarkingPatient(null);
    } catch (err) {
      console.error('Error updating remark', err);
    }
  };
  
  const handlePresenceToggle = async (sessionType, shouldBlock) => {
    if (!selectedDoctor || !dateStr) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/doctors/${selectedDoctor}/availability`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          is_available: !shouldBlock, 
          date: dateStr,
          session_type: sessionType 
        })
      });
      if (res.ok) {
        // Refresh availability
        const refresh = await fetch(`${API_URL}/api/admin/doctors/${selectedDoctor}/availability?date=${dateStr}`);
        const data = await refresh.json();
        setIsFullDayBlocked(data.is_full_day);
        setBlockedSessions(data.blocked_sessions);
        setShowAvailabilityModal(false);
      }
    } catch (err) {
      console.error('Error updating doctor availability', err);
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
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Search and Pagination Logic
  const filteredTokens = tokens.filter(t => {
    const matchesSearch = 
      t.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.patient_phone.includes(searchTerm) ||
      String(t.token_number).includes(searchTerm);
      
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    if (statusFilter === 'confirmed') return t.status === 'confirmed';
    if (statusFilter === 'called') return t.status === 'called';
    if (statusFilter === 'completed') return t.status === 'completed';
    if (statusFilter === 'no_show') return t.status === 'no_show' || t.status === 'cancelled';
    
    return true;
  });

  const totalPages = Math.ceil(filteredTokens.length / itemsPerPage);
  const displayedTokens = filteredTokens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const downloadCSV = () => {
    if (tokens.length === 0) return;
    const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff' || user?.role === 'receptionist' || user?.role === 'doctor';
    const finalHeaders = ["Token No", "Patient Name", "Age", "Mobile", "Arrival Time", "Location", "Status", "Date", "Payment", "Remarks"];
    const csvContent = [
      finalHeaders.join(","),
      ...tokens.map(t => [
        t.token_number,
        `"${t.patient_name}"`,
        `"${t.patient_age_days > 0 ? t.patient_age_days + 'd' : t.patient_age_years + 'y ' + t.patient_age_months + 'm'}"`,
        t.patient_phone, 
        `"${t.estimated_time || ''}"`,
        `"${t.location}"`,
        t.status,
        `"\t${new Date(t.booking_date).toLocaleDateString('en-IN').split('/').join('-')}"`,
        t.payment_status === 'paid' ? 'Paid' : 'Pending',
        `"${t.remarks || ''}"`
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
    link.remove();
  };

  const metrics = {
    total: tokens.length,
    waiting: tokens.filter(t => t.status === 'confirmed').length,
    serving: tokens.filter(t => t.status === 'called').length,
    completed: tokens.filter(t => t.status === 'completed').length,
    noshow: tokens.filter(t => t.status === 'no_show' || t.status === 'cancelled').length,
  };

  const metricCards = [
    { id: 'all', label: "Total queue", val: metrics.total, color: "text-slate-800", activeBorder: "border-slate-300 ring-2 ring-slate-100", iconColor: "bg-slate-50 text-slate-400", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: 'confirmed', label: "Waiting", val: metrics.waiting, color: "text-orange-500", activeBorder: "border-orange-300 ring-2 ring-orange-100", iconColor: "bg-orange-50 text-orange-400", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: 'called', label: "Now serving", val: metrics.serving, color: "text-blue-500", activeBorder: "border-blue-300 ring-2 ring-blue-100", iconColor: "bg-blue-50 text-blue-400", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: 'completed', label: "Completed", val: metrics.completed, color: "text-emerald-500", activeBorder: "border-emerald-300 ring-2 ring-emerald-100", iconColor: "bg-emerald-50 text-emerald-400", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: 'no_show', label: "No-show", val: metrics.noshow, color: "text-red-500", activeBorder: "border-red-300 ring-2 ring-red-100", iconColor: "bg-red-50 text-red-400", icon: "M18 12H6" }
  ];

  const nowServing = tokens.find(t => t.status === 'called');

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff' || user?.role === 'receptionist' || user?.role === 'doctor';

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

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
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex justify-between items-center">
                <span>Select Doctor</span>
                {selectedDoctor && (
                   <span className={`text-[9px] font-black tracking-widest ${isFullDayBlocked ? 'text-rose-500' : (blockedSessions.length > 0 ? 'text-amber-500' : 'text-emerald-500')}`}>
                      {isFullDayBlocked ? 'ABSENT' : (blockedSessions.length > 0 ? 'PARTIAL' : 'PRESENT')}
                   </span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-5 relative group hover:border-blue-primary transition-all shadow-sm flex-1">
                  <select 
                    value={selectedDoctor} 
                    onChange={e => { setSelectedDoctor(e.target.value); setCurrentPage(1); }} 
                    className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full pr-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat disabled:bg-none"
                    disabled={user?.role === 'doctor'}
                  >
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                {(user?.role === 'superadmin' || user?.role === 'admin') && (
                  <button 
                    onClick={() => setShowAvailabilityModal(true)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${
                      isFullDayBlocked
                        ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                        : (blockedSessions.length > 0 ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100')
                    }`}
                    title="Manage Availability"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                )}
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Time Slot</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-5 relative group hover:border-blue-primary transition-all shadow-sm">
                <select 
                  value={selectedSession} 
                  onChange={e => { setSelectedSession(e.target.value); setCurrentPage(1); }} 
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer appearance-none w-full pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat capitalize"
                >
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.session_type} ({s.start_time.slice(0,5)})</option>)}
                </select>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Extra Option</label>
              <button 
                onClick={() => setIsExtraMode(!isExtraMode)}
                className={`h-14 w-full rounded-2xl border-2 flex items-center justify-center gap-2 transition-all font-bold text-[12px] uppercase tracking-widest ${
                  isExtraMode 
                    ? 'bg-purple-50 border-purple-200 text-purple-600 shadow-lg shadow-purple-500/10' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-purple-200 hover:text-purple-400'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isExtraMode ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                   {isExtraMode ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                   ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                   )}
                </div>
                Extra
              </button>
           </div>


        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-10">
        {metricCards.map((m, i) => {
          const isActive = statusFilter === m.id;
          return (
            <button 
              key={i} 
              onClick={() => { setStatusFilter(m.id); setCurrentPage(1); }}
              className={`bg-white text-left rounded-2xl md:rounded-[28px] p-5 md:p-6 border shadow-sm flex justify-between items-center group hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full outline-none ${
                isActive ? m.activeBorder : 'border-slate-100 hover:border-slate-200'
              }`}
            >
               <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 md:mb-3 ${m.label === 'Total queue' && !isActive ? 'text-slate-400' : m.color}`}>
                     {m.label}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-ink leading-none">{m.val}</p>
               </div>
               <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${
                 isActive ? 'bg-ink text-white shadow-md' : m.iconColor
               }`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={m.icon}/></svg>
               </div>
            </button>
          );
        })}
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
            {user?.role !== 'doctor' && (
              <button 
                onClick={() => handleAction(nowServing.id, 'complete')}
                className="bg-green-600 text-white hover:bg-green-700 font-bold h-11 md:h-12 w-full sm:w-auto px-10 md:px-12 rounded-xl text-[12px] md:text-[13px] uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-md"
              >
                Finish Case
              </button>
            )}
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
               {user?.role !== 'doctor' && (
                 <button 
                    onClick={() => onAddPatient(selectedDoctor, false, isExtraMode)}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-95 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span className="text-[11px] font-bold uppercase tracking-widest">Add Patient</span>
                  </button>
               )}
            </div>
            
            <div className="w-full md:w-auto md:flex-1 md:max-w-sm">
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-primary transition-colors">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input 
                     type="text" 
                     placeholder="Search name, mobile or token..."
                     value={searchTerm}
                     onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                     className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-sm font-medium text-ink placeholder:text-slate-400 focus:bg-white focus:border-blue-primary/30 focus:ring-4 focus:ring-blue-primary/5 transition-all outline-none"
                  />
               </div>
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
                <tr className="border-b border-slate-100 text-xs text-slate-500 font-bold tracking-wider uppercase">
                  <th className="pl-6 md:pl-10 pr-2 py-5">No</th>
                  <th className="px-4 py-5">Patient Details</th>
                  {isStaffOrAdmin && <th className="px-4 py-5">Est. Arrival & Area</th>}
                  <th className="px-4 py-5">Status</th>
                  {user?.role !== 'doctor' && <th className="px-4 py-5 text-right">Actions</th>}
                  {user?.role !== 'doctor' && <th className="px-6 py-5 text-center">Controls</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedTokens.map((t, idx) => {
                  const isActive = t.status === 'called';
                  return (
                    <tr key={t.id} className={`group hover:bg-slate-50/40 transition-all duration-150 ${isActive ? 'bg-blue-50/20' : ''}`}>
                      <td className="pl-6 md:pl-10 pr-2 py-4 md:py-5 whitespace-nowrap">
                         <div className="text-[16px] font-bold text-slate-800">
                            #{t.token_number}
                         </div>
                      </td>
                      <td className="px-4 py-4 md:py-5">
                         <div className="flex flex-col min-w-0">
                            <div className="font-bold text-[15px] text-slate-900 leading-tight mb-1 truncate">{t.patient_name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-text font-semibold">
                              <span>{t.patient_age_days > 0 ? `${t.patient_age_days}d` : `${t.patient_age_years}y ${t.patient_age_months}m`}</span>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono">{t.patient_phone}</span>
                            </div>
                         </div>
                      </td>
                       {isStaffOrAdmin && (
                        <td className="px-4 py-4 md:py-5 whitespace-nowrap">
                          <div className="flex flex-col text-left">
                            <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 inline-block shadow-sm mb-1 self-start leading-none">
                              {formatTime(t.estimated_time)}
                            </div>
                            <div className="text-xs text-muted-text font-bold truncate max-w-[140px] pl-0.5">{t.location || '--'}</div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-4 md:py-5">
                         {t.status === 'confirmed' && <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Waiting</span>}
                         {t.status === 'called' && <span className="bg-blue-primary text-white px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm">Active</span>}
                         {t.status === 'completed' && <span className="bg-brand-green text-white px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm">Done</span>}
                         {(t.status === 'no_show' || t.status === 'cancelled') && <span className="text-red-500 bg-red-50 px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider line-through border border-red-100">Absent</span>}
                      </td>
                      {user?.role !== 'doctor' && (
                        <td className="px-4 py-4 md:py-5">
                            <div className="flex items-center justify-end gap-2">
                               {(t.status === 'confirmed' || t.status === 'called') && (
                                  <div className="flex gap-1.5">
                                     {t.status === 'confirmed' ? (
                                        <button onClick={() => handleAction(t.id, 'call')} className="bg-ink hover:bg-blue-primary text-white font-bold h-9 px-4 rounded-lg text-[11px] shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer">Call</button>
                                     ) : (
                                        <button onClick={() => handleAction(t.id, 'complete')} className="bg-brand-green hover:bg-emerald-600 text-white font-bold h-9 px-4 rounded-lg text-[11px] shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer">Finish</button>
                                     )}
                                     <button onClick={() => handleAction(t.id, 'noshow')} className="bg-red-500 hover:bg-red-600 text-white font-bold h-9 px-4 rounded-lg text-[11px] shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer" title="Mark as Absent">Absent</button>
                                  </div>
                               )}
                               {(t.status === 'completed' || t.status === 'no_show' || t.status === 'cancelled') && (
                                  <button onClick={() => handleAction(t.id, 'reset')} className="bg-white border border-slate-200 text-slate-600 hover:bg-blue-primary hover:text-white hover:border-blue-primary font-bold h-9 px-4 rounded-lg text-[11px] transition-all active:scale-95 whitespace-nowrap cursor-pointer">Re-call</button>
                               )}
                            </div>
                        </td>
                      )}
                      {user?.role !== 'doctor' && (
                        <td className="px-6 py-4 md:py-5 text-center border-l border-slate-100">
                            <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handlePaymentStatus(t.id, t.payment_status)}
                                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                    t.payment_status === 'paid' 
                                      ? 'bg-brand-green text-white shadow-sm' 
                                      : 'bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white'
                                  }`}
                                  title={t.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                </button>
                                
                                <button 
                                  onClick={() => setRemarkingPatient(t)}
                                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all border cursor-pointer ${
                                    t.remarks
                                      ? 'bg-slate-800 text-white border-slate-850 shadow-sm' 
                                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-850 hover:text-white'
                                  }`}
                                  title={t.remarks || 'Add Remark'}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </button>

                               {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff' || user?.role === 'receptionist') && (
                                  <div className="flex gap-2 border-l border-slate-100 pl-2">
                                    <button 
                                       onClick={() => setEditingPatient(t)} 
                                       className="w-8 h-8 rounded-lg bg-blue-50 text-blue-primary hover:bg-blue-primary hover:text-white flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                                       title="Edit Patient"
                                    >
                                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                      <button 
                                         onClick={() => handleDelete(t.id)} 
                                         className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                                         title="Delete Patient"
                                      >
                                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                                      </button>
                                    )}
                                  </div>
                               )}
                            </div>
                            {t.remarks && <div className="text-[10px] mt-1.5 font-bold text-slate-500 italic leading-snug max-w-[140px] mx-auto break-words">"{t.remarks}"</div>}
                        </td>
                      )}
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
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-muted-text/50">
                            {t.patient_phone} • {t.patient_age_days > 0 ? `${t.patient_age_days}d` : `${t.patient_age_years}y ${t.patient_age_months}m`}
                          </span>
                          {isStaffOrAdmin && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LOC: <span className="text-slate-600 font-bold">{t.location || '--'}</span></span>
                            </div>
                          )}
                          {!isStaffOrAdmin && <span className="text-[11px] font-medium text-muted-text/50 truncate max-w-[180px] mt-0.5">{t.location}</span>}
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                          {t.status === 'confirmed' && <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Waiting</span>}
                          {t.status === 'called' && <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Active</span>}
                          {t.status === 'completed' && <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Done</span>}
                          {(t.status === 'no_show' || t.status === 'cancelled') && <span className="text-red-500/40 text-[9px] font-black uppercase tracking-widest line-through">Absent</span>}
                          {t.payment_status === 'paid' && (
                            <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                            </span>
                          )}
                        </div>
                    </div>
                    
                    {user?.role === 'doctor' ? (
                      <div className="flex justify-end items-center mt-1 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-black text-amber-605 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-100 uppercase tracking-widest shadow-sm">
                          ARRIVAL: {formatTime(t.estimated_time)}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handlePaymentStatus(t.id, t.payment_status)}
                             className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all shadow-sm cursor-pointer ${
                               t.payment_status === 'paid' 
                                 ? 'bg-emerald-500 text-white' 
                                 : 'bg-slate-100 text-slate-400'
                             }`}
                           >
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                           </button>
                           <button 
                             onClick={() => setRemarkingPatient(t)}
                             className={`h-10 w-10 border flex items-center justify-center rounded-xl transition-all shadow-sm cursor-pointer ${
                               t.remarks ? 'bg-ink text-white border-ink' : 'bg-white border-slate-200 text-slate-400'
                             }`}
                           >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                           </button>
                          {(t.status === 'confirmed' || t.status === 'called') && (
                             <>
                                {t.status === 'confirmed' ? (
                                   <button onClick={() => handleAction(t.id, 'call')} className="bg-ink text-white font-bold h-10 px-4 rounded-xl text-[10px] uppercase tracking-widest flex-1 shadow-md cursor-pointer">Call</button>
                                ) : (
                                   <button onClick={() => handleAction(t.id, 'complete')} className="bg-emerald-500 text-white font-bold h-10 px-4 rounded-xl text-[10px] uppercase tracking-widest flex-1 shadow-md cursor-pointer">Finish</button>
                                )}
                                <button onClick={() => handleAction(t.id, 'noshow')} className="bg-rose-600 text-white font-bold h-10 px-4 rounded-xl text-[10px] uppercase tracking-widest flex-1 shadow-md cursor-pointer">Absent</button>
                             </>
                          )}
                          {(t.status === 'completed' || t.status === 'no_show' || t.status === 'cancelled') && (
                             <button onClick={() => handleAction(t.id, 'reset')} className="bg-slate-50 border border-slate-200 text-slate-400 h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest flex-1 cursor-pointer">Re-call</button>
                          )}
                        </div>
                        {t.remarks && <div className="text-[10px] font-bold text-ink/40 italic px-1 mt-1">"{t.remarks}"</div>}
                        {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff' || user?.role === 'receptionist') && (
                              <div className="flex gap-2 mt-2">
                                <button 
                                  onClick={() => setEditingPatient(t)} 
                                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm shadow-blue-500/5 cursor-pointer"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                  <button 
                                    onClick={() => handleDelete(t.id)} 
                                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                                  </button>
                                )}
                                {isStaffOrAdmin && (
                                   <div className="flex-1 flex justify-end items-center">
                                     <span className="text-[10px] font-black text-amber-600 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-100 uppercase tracking-widest shadow-sm">
                                       ARRIVAL: {formatTime(t.estimated_time)}
                                     </span>
                                   </div>
                                 )}
                              </div>
                           )}
                      </>
                    )}
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
        onClose={() => setEditingPatient(null)} 
        patient={editingPatient} 
        onUpdated={() => {
          fetchTokens();
          setEditingPatient(null);
        }} 
      />

      {remarkingPatient && (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setRemarkingPatient(null)}>
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-scale-up p-8" onClick={e => e.stopPropagation()}>
             <h3 className="text-2xl font-serif text-ink font-semibold mb-2">Patient Remark</h3>
             <p className="text-muted-text text-[13px] mb-6">Add a note for <span className="font-bold text-ink">{remarkingPatient.patient_name}</span></p>
             
             <textarea 
                autoFocus
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-ink focus:border-blue-primary focus:ring-1 focus:ring-blue-primary outline-none transition-all resize-none"
                placeholder="Enter payment details or notes..."
                defaultValue={remarkingPatient.remarks || ''}
                id="remarkInput"
             />
             
             <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setRemarkingPatient(null)}
                  className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const val = document.getElementById('remarkInput').value;
                    handleRemark(remarkingPatient.id, val);
                  }}
                  className="flex-1 h-12 rounded-xl bg-ink text-white font-bold text-[11px] uppercase tracking-widest hover:bg-blue-primary transition-all shadow-lg shadow-ink/20"
                >
                  Save Remark
                </button>
             </div>
          </div>
        </div>
      )}      {/* Availability Selection Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" 
             onClick={() => setShowAvailabilityModal(false)}
           />

           {/* Modal Container */}
           <div className="relative z-[6010] bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-scale-up border border-slate-100 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 pb-0 flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-serif font-medium text-ink">Manage Availability</h3>
                    <p className="text-[11px] font-bold text-muted-text/60 uppercase tracking-widest mt-1">
                       {doctors.find(d => d.id === selectedDoctor)?.name || 'Doctor'} • {dateStr}
                    </p>
                 </div>
                 <button onClick={() => setShowAvailabilityModal(false)} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-ink/40 hover:text-ink transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
                 {[
                   { id: 'morning', label: 'Morning Session' },
                   { id: 'evening', label: 'Evening Session' },
                   { id: 'both', label: 'Full Day Absence' }
                 ].map((opt) => {
                    const isBlocked = opt.id === 'both' ? isFullDayBlocked : blockedSessions.includes(opt.id);
                    return (
                       <button 
                         key={opt.id}
                         onClick={() => handlePresenceToggle(opt.id, !isBlocked)}
                         className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                           isBlocked 
                             ? 'bg-rose-50/50 border-rose-200 text-rose-700' 
                             : 'bg-white border-slate-100 text-ink/60 hover:border-blue-primary/30'
                         }`}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isBlocked ? 'bg-rose-100' : 'bg-slate-50 group-hover:scale-110'}`}>
                                {opt.id === 'both' ? (
                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                ) : (
                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      {opt.id === 'morning' ? <path d="M12 7V3M5 12H1M23 12h-4M7.05 7.05L4.22 4.22M19.78 19.78l-2.83-2.83M12 17v4M7.05 16.95l-2.83 2.83M19.78 4.22l-2.83 2.83M12 8a4 4 0 100 8 4 4 0 000-8z"/> : <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>}
                                   </svg>
                                )}
                             </div>
                             <span className="font-bold text-[13px] tracking-tight">{opt.label}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isBlocked ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-200 bg-white'}`}>
                             {isBlocked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
                          </div>
                       </button>
                    );
                 })}
              </div>

              {/* Footer */}
              <div className="p-5 bg-slate-50/50 border-t border-slate-100">
                 <p className="text-[10px] font-bold text-muted-text/40 uppercase tracking-[0.2em] text-center px-4 leading-relaxed">
                    Changes will disable online bookings for selected sessions on this date.
                 </p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
