import React, { useState, useEffect } from 'react';
import QueueManager from './admin/QueueManager';
import AdminOverview from './admin/AdminOverview';
import AddStaffModal from '../components/modals/AddStaffModal';
import AddDoctorModal from '../components/modals/AddDoctorModal';
import { API_URL } from '../constants/api';

const Dashboard = ({ user, setRoute, onAddPatient, onLogout }) => {
  const [stats, setStats] = useState({
    totalPatients: 142,
    waiting: 12,
    present: 4,
    served: 118,
    absent: 8,
    staffMembers: 6,
    doctors: 2,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Default to overview for admin, queue for staff
  useEffect(() => {
    if (user?.role === 'receptionist' || user?.role === 'staff') {
      setActiveTab('patients'); // or 'overview'
    }
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      fetchStaffs();
      fetchDoctors();
    }
  }, [user]);

  const fetchStaffs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/staff`);
      if (res.ok) {
        const data = await res.json();
        setStaffs(data);
        setStats(prev => ({ ...prev, staffMembers: data.length }));
      }
    } catch (err) {
      console.error('Failed to fetch staffs', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        setStats(prev => ({ ...prev, doctors: data.length }));
      }
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStaffs(staffs.filter(s => s.id !== id));
        setStats(prev => ({ ...prev, staffMembers: staffs.length - 1 }));
      }
    } catch (err) {
      console.error('Failed to delete staff', err);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDoctors(doctors.filter(d => d.id !== id));
        setStats(prev => ({ ...prev, doctors: doctors.length - 1 }));
      }
    } catch (err) {
      console.error('Failed to delete doctor', err);
    }
  };

  const handleStaffAddedOrUpdated = (staff) => {
    if (editingStaff) {
      setStaffs(staffs.map(s => s.id === staff.id ? staff : s));
    } else {
      setStaffs([staff, ...staffs]);
      setStats(prev => ({ ...prev, staffMembers: staffs.length + 1 }));
    }
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  const handleDoctorAddedOrUpdated = (doctor) => {
    if (editingDoctor) {
      setDoctors(doctors.map(d => d.id === doctor.id ? doctor : d));
    } else {
      setDoctors([doctor, ...doctors]);
      setStats(prev => ({ ...prev, doctors: doctors.length + 1 }));
    }
    setIsDoctorModalOpen(false);
    setEditingDoctor(null);
  };

  const cards = [
    { label: "Total Patients", val: stats.totalPatients, icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 11-8 0 4 4 0 018 0", color: "text-blue-primary", bg: "bg-blue-primary/5" },
    { label: "Waiting", val: stats.waiting, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Present", val: stats.present, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-blue-mid", bg: "bg-blue-mid/5" },
    { label: "Served", val: stats.served, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-teal-primary", bg: "bg-teal-primary/5" },
    { label: "Absent", val: stats.absent, icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z M3 20a6 6 0 0112 0v1H3v-1z", color: "text-red-500", bg: "bg-red-50" },
    { label: "Staff Members", val: stats.staffMembers, icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z M3 20a6 6 0 0112 0v1H3v-1z", color: "text-purple-600", bg: "bg-purple-50", show: user?.role === 'admin' || user?.role === 'superadmin' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview user={user} />;
      case 'patients': return <QueueManager user={user} setRoute={setRoute} onAddPatient={onAddPatient} />;
      case 'staff': return (
        <div className="animate-fade-in space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-serif font-medium text-ink">Staff Management</h3>
              <button 
                onClick={() => { setEditingStaff(null); setIsStaffModalOpen(true); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 rounded-xl flex items-center gap-2 font-bold text-[13px] shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 9v6m3-3h-6M11 7a4 4 0 11-8 0 4 4 0 018 0z M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                 Add Staff
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffs.map((s, i) => (
                <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm shadow-slate-200/50 flex justify-between items-start group">
                   <div className="flex-1">
                      <h4 className="text-xl font-bold text-ink mb-1">{s.name}</h4>
                      <p className="text-sm text-muted-text/50 font-bold mb-4">@{s.username}</p>
                      <div className="flex items-center gap-2 text-muted-text text-[13px] font-medium">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                         {s.phone || 'No phone provided'}
                      </div>
                      <div className="mt-3 text-xs font-bold uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
                        {s.role}
                      </div>
                   </div>
                   <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={() => { setEditingStaff(s); setIsStaffModalOpen(true); }}
                        className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(s.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <AddStaffModal 
             isOpen={isStaffModalOpen} 
             editStaff={editingStaff}
             onClose={() => { setIsStaffModalOpen(false); setEditingStaff(null); }} 
             onStaffAdded={handleStaffAddedOrUpdated} 
           />
        </div>
      );
      case 'doctors': return (
        <div className="animate-fade-in space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-serif font-medium text-ink">Doctors Management</h3>
              <button 
                onClick={() => { setEditingDoctor(null); setIsDoctorModalOpen(true); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 rounded-xl flex items-center gap-2 font-bold text-[13px] shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 9v6m3-3h-6M11 7a4 4 0 11-8 0 4 4 0 018 0z M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                 Add Doctor
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((d, i) => (
                <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm shadow-slate-200/50 flex justify-between items-start group">
                   <div className="flex-1">
                      <h4 className="text-xl font-bold text-ink mb-1">{d.name}</h4>
                      <p className="text-sm text-muted-text/50 font-bold mb-4">{d.specialty || 'General Practitioner'}</p>
                      
                      <div className="mt-3 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                        {d.type === 'child' ? 'Child Specialist' : 'General'}
                      </div>
                      {!d.is_active && (
                         <div className="mt-3 ml-2 text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                           Inactive
                         </div>
                      )}
                   </div>
                   <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={() => { setEditingDoctor(d); setIsDoctorModalOpen(true); }}
                        className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteDoctor(d.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <AddDoctorModal 
             isOpen={isDoctorModalOpen} 
             editDoctor={editingDoctor}
             onClose={() => { setIsDoctorModalOpen(false); setEditingDoctor(null); }} 
             onDoctorAdded={handleDoctorAddedOrUpdated} 
           />
        </div>
      );
      case 'analytics': return <AdminOverview user={user} />;
      case 'settings': return (
        <div className="animate-fade-in space-y-8">
           <h3 className="text-3xl font-serif font-medium text-ink">System Settings</h3>
           <div className="p-card p-12">
              <p className="text-muted-text font-medium text-lg">System configurations and security settings will appear here.</p>
           </div>
        </div>
      );
      default: return <AdminOverview user={user} />;
    }
  };

  return (
    <div className="bg-transparent font-sans min-h-[calc(100vh-72px)]">
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-[88px] pb-14 animate-fade-in relative z-10">
        
        {/* LOGOUT BUTTON */}
        <div className="absolute top-8 right-6 lg:right-12">
           <button 
             onClick={onLogout}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-ink font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
           >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Sign out
           </button>
        </div>

        {/* PREMIUM STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-14">
           {cards.filter(c => c.show !== false).map((c, i) => (
             <div key={i} className="p-card p-6 group transition-all hover:scale-[1.02]">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-3xl font-serif font-medium text-ink leading-tight">{c.val}</p>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${c.bg} ${c.color}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={c.icon}/></svg>
                   </div>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-text/60">{c.label}</p>
             </div>
           ))}
        </div>

        {/* Tab Toggle - Premium Navigation */}
        <div className="flex items-center gap-6 border-b border-slate-200 pb-px mb-12">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'patients', label: 'Patients' },
              { id: 'doctors', label: 'Doctors', show: user?.role === 'admin' || user?.role === 'superadmin' },
              { id: 'staff', label: 'Staff', show: user?.role === 'admin' || user?.role === 'superadmin' },
              { id: 'analytics', label: 'Analytics', show: user?.role === 'admin' || user?.role === 'superadmin' },
              { id: 'settings', label: 'Settings', show: user?.role === 'admin' || user?.role === 'superadmin' },
            ].filter(t => t.show !== false).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`h-12 px-6 text-[13px] font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id ? 'text-blue-primary' : 'text-muted-text hover:text-ink'
                }`}
              >
                 {tab.label}
                 {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-primary rounded-t-full shadow-[0_-4px_10px_rgba(24,71,194,0.3)]"></div>}
              </button>
            ))}
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
