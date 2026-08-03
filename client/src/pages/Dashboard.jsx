import React, { useState, useEffect } from 'react';
import QueueManager from './admin/QueueManager';
import AdminOverview from './admin/AdminOverview';
import ActiveStaffMonitor from './admin/ActiveStaffMonitor';
import StaffAttendance from './admin/StaffAttendance';
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
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type, name }
  const [staffs, setStaffs] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Default to overview for admin, queue for staff
  useEffect(() => {
    if (user?.role === 'receptionist' || user?.role === 'staff') {
      setActiveTab('patients'); // or 'overview'
    }
    if (user?.role === 'doctor') {
      setActiveTab('overview');
    }
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      fetchStaffs();
      fetchDoctors();
    }
  }, [user]);

  // Pulse activity to tracking last active timestamp
  useEffect(() => {
    if (user?.id) {
      const pulseActivity = async () => {
        try {
          await fetch(`${API_URL}/api/auth/active`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
        } catch (err) {
          console.error('Activity pulse failed', err);
        }
      };
      
      pulseActivity();
      const interval = setInterval(pulseActivity, 60000 * 2); // Pulse every 2 minutes
      return () => clearInterval(interval);
    }
  }, [user, API_URL]);

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

  const handleDeleteStaff = (staff) => {
    setDeleteConfirm({ id: staff.id, type: 'staff', name: staff.name });
  };

  const handleDeleteDoctor = (doctor) => {
    setDeleteConfirm({ id: doctor.id, type: 'doctor', name: doctor.name });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    try {
      const endpoint = type === 'staff' ? `/api/admin/staff/${id}` : `/api/admin/doctors/${id}`;
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'staff') {
          setStaffs(staffs.filter(s => s.id !== id));
          setStats(prev => ({ ...prev, staffMembers: staffs.length - 1 }));
        } else {
          setDoctors(doctors.filter(d => d.id !== id));
          setStats(prev => ({ ...prev, doctors: doctors.length - 1 }));
        }
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error(`Failed to delete ${type}`, err);
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
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs font-bold uppercase text-purple-605 bg-purple-50 px-2 py-1 rounded inline-block">
                          {s.role}
                        </span>
                        {s.role === 'doctor' && s.doctor_name && (
                          <span className="text-xs font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                            Profile: {s.doctor_name}
                          </span>
                        )}
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
                        onClick={() => handleDeleteStaff(s)}
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
                        {d.type === 'child' ? 'Child Specialist' : d.type}
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
                        onClick={() => handleDeleteDoctor(d)}
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
             existingDoctors={doctors}
             onClose={() => { setIsDoctorModalOpen(false); setEditingDoctor(null); }} 
             onDoctorAdded={handleDoctorAddedOrUpdated} 
           />
        </div>
      );
      case 'monitoring': return <ActiveStaffMonitor />;
      case 'attendance': return <StaffAttendance />;
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
      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 pt-[88px] pb-14 animate-fade-in relative z-10">
        
        {/* DYNAMIC HEADER SECTION */}
        <div className="mb-12">
           <h1 className="text-4xl md:text-5xl font-serif font-medium text-ink tracking-tight">
              {user?.role === 'doctor' 
                ? 'Doctor Dashboard' 
                : (user?.role === 'admin' || user?.role === 'superadmin') 
                  ? 'Admin Dashboard' 
                  : 'Staff Board'}
           </h1>
           <p className="mt-3 text-muted-text/70 font-medium max-w-xl">
              {user?.role === 'doctor'
                ? 'Access patient lists, check waiting queues, and view daily consultation flow in read-only mode.'
                : (user?.role === 'admin' || user?.role === 'superadmin')
                  ? 'Manage your clinical operations, monitor staff performance, and oversee patient flow in real-time.' 
                  : 'Access patient records, manage the active consultation queue, and coordinate daily clinic visits.'}
           </p>
        </div>

        {/* Tab Toggle - Premium Navigation */}
        <div className="flex items-center gap-2 md:gap-6 border-b border-slate-200 pb-px mb-12 overflow-x-auto scrollbar-hide flex-nowrap">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'patients', label: 'Patients' },
              { id: 'doctors', label: 'Doctors', show: user?.role === 'admin' || user?.role === 'superadmin' },
              { id: 'staff', label: 'Staff', show: user?.role === 'admin' || user?.role === 'superadmin' },
              { id: 'attendance', label: 'Attendance', show: user?.role === 'admin' || user?.role === 'superadmin' },
              { id: 'monitoring', label: 'Monitor', show: user?.role === 'admin' || user?.role === 'superadmin' },
              { id: 'settings', label: 'Settings', show: user?.role === 'admin' || user?.role === 'superadmin' },
            ].filter(t => {
              if (user?.role === 'doctor') {
                return t.id === 'overview' || t.id === 'patients';
              }
              return t.show !== false;
            }).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`h-12 px-4 md:px-6 text-[11px] md:text-[13px] font-bold uppercase tracking-widest transition-all relative flex-shrink-0 ${
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
         <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-ink/60 backdrop-blur-md cursor-pointer" onClick={() => setDeleteConfirm(null)} />
           <div className="relative z-10 w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl animate-scale-up border border-slate-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[28px] bg-red-50 text-red-500 flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3 leading-tight">Remove {deleteConfirm.type}?</h3>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed mb-10 px-4">
                Are you sure you want to remove <span className="text-ink font-bold text-lg pr-1">"{deleteConfirm.name}"</span>? 
                This action may affect historical schedules, and you will need to re-add them manually if needed.
              </p>
              
              <div className="flex items-center gap-4 w-full">
                 <button 
                   onClick={() => setDeleteConfirm(null)}
                   className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95 outline-none"
                 >
                   Keep It
                 </button>
                 <button 
                    onClick={executeDelete}
                    className="flex-1 h-14 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-95 outline-none"
                 >
                   Yes, Remove
                 </button>
              </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default Dashboard;
