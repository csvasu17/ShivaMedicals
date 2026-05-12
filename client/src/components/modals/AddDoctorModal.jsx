import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const AddDoctorModal = ({ isOpen, onClose, onDoctorAdded, editDoctor, existingDoctors = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    specialty: ''
  });
  const [sessions, setSessions] = useState([
    { day_of_week: null, session_type: 'morning', start_time: '09:00', end_time: '12:00', max_tokens: 200, booking_opens_at: '21:00', booking_closes_before_minutes: 60 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newType, setNewType] = useState('');

  const uniqueTypes = [...new Set(existingDoctors.map(d => d.type).filter(Boolean))];
  if (!uniqueTypes.includes('general')) uniqueTypes.unshift('general');
  if (!uniqueTypes.includes('child')) uniqueTypes.push('child');

  const days = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Every Day', value: null }
  ];

  useEffect(() => {
    if (editDoctor) {
      setFormData({
        name: editDoctor.name || '',
        type: editDoctor.type || 'general',
        specialty: editDoctor.specialty || ''
      });
      // Fetch existing sessions
      fetch(`${API_URL}/api/sessions/${editDoctor.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) setSessions(data);
        })
        .catch(err => console.error('Error fetching doctor sessions:', err));
    } else {
      setFormData({ name: '', type: 'general', specialty: '' });
      setSessions([{ day_of_week: null, session_type: 'morning', start_time: '09:00', end_time: '12:00', max_tokens: 200, booking_opens_at: '21:00', booking_closes_before_minutes: 60 }]);
    }
    setIsAddingNewType(false);
    setNewType('');
  }, [editDoctor, isOpen, API_URL]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSessionChange = (index, field, value) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    setSessions(updated);
  };

  const addSession = () => {
    setSessions([...sessions, { day_of_week: null, session_type: 'evening', start_time: '17:00', end_time: '20:00', max_tokens: 200, booking_opens_at: '21:00', booking_closes_before_minutes: 60 }]);
  };

  const removeSession = (index) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        sessions: sessions.map(s => ({
          ...s,
          start_time: s.start_time.length === 5 ? s.start_time + ':00' : s.start_time,
          end_time: s.end_time.length === 5 ? s.end_time + ':00' : s.end_time,
          booking_opens_at: s.booking_opens_at.length === 5 ? s.booking_opens_at + ':00' : s.booking_opens_at,
        }))
      };

      const url = editDoctor 
        ? `${API_URL}/api/admin/doctors/${editDoctor.id}`
        : `${API_URL}/api/admin/doctors`;

      const response = await fetch(url, {
        method: editDoctor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process doctor');
      }

      onDoctorAdded(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-6 right-6 z-10">
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="p-8 md:p-10 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-serif text-ink font-semibold tracking-tight">{editDoctor ? 'Edit Doctor Profile' : 'Register New Doctor'}</h2>
            <p className="text-muted-text text-[13px] mt-1 font-medium">{editDoctor ? 'Update professional details and consultation timings.' : 'Set up doctor details and recurring session schedules.'}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[13px] font-bold flex items-center gap-3 shadow-sm">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* CORE INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Doctor Name</label>
                <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm">
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. John Doe"
                    className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Specialty</label>
                <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm">
                  <input 
                    type="text" 
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder="e.g. Cardiologist"
                    className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Doctor Type</label>
                {isAddingNewType ? (
                  <div className="flex gap-2">
                    <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm flex-1">
                      <input 
                        type="text" 
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        placeholder="e.g. Cardiologist"
                        className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                        autoFocus
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (newType.trim()) {
                          setFormData({ ...formData, type: newType.trim() });
                        }
                        setIsAddingNewType(false);
                        setNewType('');
                      }}
                      className="h-14 px-4 bg-ink text-white rounded-2xl font-bold text-sm hover:bg-blue-primary transition-all"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm">
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={(e) => {
                        if (e.target.value === 'add_new') {
                          setIsAddingNewType(true);
                        } else {
                          handleChange(e);
                        }
                      }}
                      className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat capitalize"
                    >
                      {uniqueTypes.map(type => (
                        <option key={type} value={type}>{type === 'child' ? 'Child Specialist' : type}</option>
                      ))}
                      {formData.type && !uniqueTypes.includes(formData.type) && (
                        <option value={formData.type}>{formData.type}</option>
                      )}
                      <option value="add_new" className="font-bold text-blue-primary">+ Add New Type</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SESSIONS SECTION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Schedule & Timings</label>
                <button 
                  type="button"
                  onClick={addSession}
                  className="text-[10px] font-black uppercase text-blue-primary tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Session
                </button>
              </div>

              <div className="space-y-4">
                {sessions.map((session, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-5 relative group/session animate-scale-up">
                    <button 
                      type="button" 
                      onClick={() => removeSession(idx)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover/session:opacity-100 transition-all scale-75 group-hover/session:scale-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* DAY SELECTOR */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Day</span>
                        <div className="h-11 bg-white border border-slate-100 rounded-xl flex items-center px-3">
                          <select 
                            value={session.day_of_week === null ? 'null' : session.day_of_week}
                            onChange={(e) => handleSessionChange(idx, 'day_of_week', e.target.value === 'null' ? null : parseInt(e.target.value))}
                            className="bg-transparent border-none outline-none font-bold text-ink text-[13px] w-full cursor-pointer"
                          >
                            {days.map(d => <option key={d.label} value={d.value === null ? 'null' : d.value}>{d.label}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* SESSION TYPE */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Session</span>
                        <div className="h-11 bg-white border border-slate-100 rounded-xl flex items-center px-3">
                          <select 
                            value={session.session_type}
                            onChange={(e) => handleSessionChange(idx, 'session_type', e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-ink text-[13px] w-full cursor-pointer capitalize"
                          >
                            <option value="morning">Morning</option>
                            <option value="evening">Evening</option>
                          </select>
                        </div>
                      </div>

                      {/* START TIME */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start</span>
                        <div className="h-11 bg-white border border-slate-100 rounded-xl flex items-center px-3">
                          <input 
                            type="time"
                            value={session.start_time.slice(0,5)}
                            onChange={(e) => handleSessionChange(idx, 'start_time', e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-ink text-[13px] w-full"
                          />
                        </div>
                      </div>

                      {/* END TIME */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">End</span>
                        <div className="h-11 bg-white border border-slate-100 rounded-xl flex items-center px-3">
                          <input 
                            type="time"
                            value={session.end_time.slice(0,5)}
                            onChange={(e) => handleSessionChange(idx, 'end_time', e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-ink text-[13px] w-full"
                          />
                        </div>
                      </div>

                      {/* MAX TOKENS */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Tokens</span>
                        <div className="h-11 bg-white border border-slate-100 rounded-xl flex items-center px-3">
                          <input 
                            type="number"
                            value={session.max_tokens}
                            onChange={(e) => handleSessionChange(idx, 'max_tokens', parseInt(e.target.value))}
                            className="bg-transparent border-none outline-none font-bold text-ink text-[13px] w-full"
                          />
                        </div>
                      </div>

                      {/* BOOKING OPEN AT */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Opens @</span>
                        <div className="h-11 bg-white border border-slate-100 rounded-xl flex items-center px-3">
                          <input 
                            type="time"
                            value={session.booking_opens_at.slice(0,5)}
                            onChange={(e) => handleSessionChange(idx, 'booking_opens_at', e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-ink text-[13px] w-full"
                          />
                        </div>
                      </div>

                      {/* CLOSES BEFORE */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Closes (min)</span>
                        <div className="h-11 bg-white border border-slate-100 rounded-xl flex items-center px-3">
                          <input 
                            type="number"
                            value={session.booking_closes_before_minutes}
                            onChange={(e) => handleSessionChange(idx, 'booking_closes_before_minutes', parseInt(e.target.value))}
                            className="bg-transparent border-none outline-none font-bold text-ink text-[13px] w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {sessions.length === 0 && (
                  <div className="py-8 border-2 border-dashed border-slate-100 rounded-[24px] text-center">
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">No sessions defined</p>
                    <button type="button" onClick={addSession} className="text-blue-primary text-[11px] font-black mt-2 underline">Add your first session</button>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-10 h-16 rounded-[24px] bg-ink text-white font-black text-[13px] uppercase tracking-widest shadow-xl shadow-ink/10 hover:bg-blue-primary transition-all duration-300 flex items-center justify-center disabled:opacity-50 active:scale-95"
            >
              {loading ? (editDoctor ? 'Processing...' : 'Registering...') : (editDoctor ? 'Update Doctor & Schedule' : 'Complete Registration')}
            </button>
          </form>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes scale-up {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-slide-up {
              animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-scale-up {
              animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}} />
        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal;
