import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const AttendanceManager = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/attendance?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setAttendanceData(data);
            }
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (userId, updates) => {
        setUpdating(userId);
        const staff = attendanceData.find(a => a.id === userId);
        const current = staff.attendance;
        
        const payload = {
            userId,
            date,
            status: updates.status !== undefined ? updates.status : current.status,
            checkIn: updates.checkIn !== undefined ? updates.checkIn : current.check_in,
            checkOut: updates.checkOut !== undefined ? updates.checkOut : current.check_out,
            notes: updates.notes !== undefined ? updates.notes : current.notes
        };

        try {
            const res = await fetch(`${API_URL}/api/attendance/mark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const updatedRecord = await res.json();
                setAttendanceData(prev => prev.map(a => 
                    a.id === userId ? { ...a, attendance: updatedRecord } : a
                ));
            }
        } catch (err) {
            console.error('Failed to mark attendance:', err);
        } finally {
            setUpdating(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'absent': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'leave': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-serif font-medium text-ink">Staff Attendance</h3>
                    <p className="text-muted-text/70 font-medium mt-1">Track and manage daily presence of your team.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Date</label>
                        <div className="h-12 bg-white border border-slate-200 rounded-xl flex items-center px-4 shadow-sm group hover:border-blue-primary transition-all">
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent border-none outline-none font-bold text-ink text-sm cursor-pointer w-full"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={fetchAttendance}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-primary hover:bg-blue-50 transition-all mt-5"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-primary/20 border-t-blue-primary rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Staff Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {attendanceData.map((staff) => (
                        <div key={staff.id} className={`p-card p-0 ${updating === staff.id ? 'opacity-70 pointer-events-none' : ''}`}>
                            <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                {/* Staff Info */}
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-ink leading-tight">{staff.name}</h4>
                                        <p className="text-sm text-muted-text/60 font-bold mt-1">@{staff.username} • <span className="uppercase text-[11px] tracking-widest">{staff.role}</span></p>
                                    </div>
                                </div>

                                {/* Status Controls */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {['present', 'absent', 'leave'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleMarkAttendance(staff.id, { status })}
                                            className={`h-11 px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all border-2 ${
                                                staff.attendance.status === status 
                                                ? getStatusColor(status) 
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>

                                {/* Check-in/Out */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 lg:border-l lg:border-slate-100 lg:pl-8">
                                    <div className="space-y-1 w-full sm:w-auto">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Check-in</label>
                                        <input 
                                            type="time" 
                                            value={staff.attendance.check_in ? new Date(staff.attendance.check_in).toTimeString().slice(0,5) : ''}
                                            onChange={(e) => {
                                                const time = e.target.value;
                                                const fullDate = `${date}T${time}:00`;
                                                handleMarkAttendance(staff.id, { checkIn: fullDate });
                                            }}
                                            className="h-10 bg-slate-50 border border-slate-100 rounded-lg px-3 text-xs font-bold text-ink outline-none focus:border-blue-primary/30 w-full sm:w-32"
                                        />
                                    </div>
                                    <div className="space-y-1 w-full sm:w-auto">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Check-out</label>
                                        <input 
                                            type="time" 
                                            value={staff.attendance.check_out ? new Date(staff.attendance.check_out).toTimeString().slice(0,5) : ''}
                                            onChange={(e) => {
                                                const time = e.target.value;
                                                const fullDate = `${date}T${time}:00`;
                                                handleMarkAttendance(staff.id, { checkOut: fullDate });
                                            }}
                                            className="h-10 bg-slate-50 border border-slate-100 rounded-lg px-3 text-xs font-bold text-ink outline-none focus:border-blue-primary/30 w-full sm:w-32"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="flex-1 lg:max-w-[200px]">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes</label>
                                        <input 
                                            type="text" 
                                            placeholder="Add remarks..."
                                            defaultValue={staff.attendance.notes || ''}
                                            onBlur={(e) => handleMarkAttendance(staff.id, { notes: e.target.value })}
                                            className="h-10 bg-slate-50 border border-slate-100 rounded-lg px-4 text-xs font-medium text-ink placeholder:text-slate-300 outline-none focus:border-blue-primary/30 w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && attendanceData.length === 0 && (
                <div className="p-card p-24 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[24px] flex items-center justify-center mb-6">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <h4 className="text-xl font-bold text-ink mb-2">No Staff Found</h4>
                    <p className="text-muted-text text-sm max-w-xs mx-auto">Please add staff members in the Staff tab first.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceManager;
