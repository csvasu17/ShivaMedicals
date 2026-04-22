import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const ActiveStaffMonitor = () => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActiveUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/staff/active`);
            if (res.ok) {
                const data = await res.json();
                setActiveUsers(data);
            }
        } catch (err) {
            console.error('Failed to fetch active users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveUsers();
        const interval = setInterval(fetchActiveUsers, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-serif font-medium text-ink">Active Staff Monitor</h3>
                    <p className="text-muted-text text-sm mt-1">Currently logged-in staff members active in the last 10 minutes.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Monitoring</span>
                </div>
            </div>

            {loading ? (
                <div className="p-20 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-primary/20 border-t-blue-primary rounded-full animate-spin" />
                    <p className="mt-4 text-muted-text font-bold text-xs uppercase tracking-widest">Loading active sessions...</p>
                </div>
            ) : activeUsers.length === 0 ? (
                <div className="p-card p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7490" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 11-8 0 4 4 0 018 0 M23 21l-6-6M17 21l6-6"/></svg>
                    </div>
                    <h4 className="text-xl font-serif font-medium text-ink mb-2">No active sessions</h4>
                    <p className="text-muted-text max-w-xs mx-auto">There are no staff members currently active in the system.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeUsers.map((user) => (
                        <div key={user.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-bold text-ink group-hover:scale-110 transition-transform">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-ink truncate">{user.name}</h4>
                                    <p className="text-xs text-muted-text font-bold uppercase tracking-widest">@{user.username}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest p-3 bg-slate-50 rounded-xl">
                                    <span className="text-muted-text/60">Category</span>
                                    <span className="text-purple-600">{user.role}</span>
                                </div>
                                
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest p-3 bg-slate-50 rounded-xl">
                                    <span className="text-muted-text/60">Last login time</span>
                                    <span className="text-ink">
                                        {new Date(user.last_active_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-emerald-600">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em]">Active Now</div>
                                <div className="flex-1 h-px bg-emerald-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveStaffMonitor;
