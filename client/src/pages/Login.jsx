import React, { useState } from 'react';
import { API_URL } from '../constants/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials. Please try again.');

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      console.error('Login error:', err);
      // Fallback to relative URL if localhost fails (useful for remote dev/mixed content)
      if (API_URL.includes('localhost')) {
         try {
            const relRes = await fetch(`/api/admin/login`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
            });
            const relData = await relRes.json();
            if (relRes.ok) {
              localStorage.setItem('adminToken', relData.token);
              localStorage.setItem('adminUser', JSON.stringify(relData.user));
              onLoginSuccess(relData.user);
              return;
            }
         } catch(e) {}
      }
      setError(err.message === 'Failed to fetch' ? 'Connection failed. Please ensure the server is running.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* HEADER */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-ink rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-mid mb-2">Authenticated Access</p>
        <h2 className="text-3xl font-serif font-semibold text-ink leading-tight">Staff Portal</h2>
        <p className="text-sm text-muted-text mt-2 font-medium">Please enter your specialized credentials.</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[13px] font-bold flex items-center gap-3 animate-fade-in shadow-sm">
          <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="form-label-premium">Username</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text/40 group-focus-within:text-blue-primary transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-premium !pl-12 !h-[56px]"
              placeholder="Ex. receptionist_1"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="form-label-premium">Keep-Safe Password</label>
          <div className="relative group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text/40 group-focus-within:text-blue-primary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
             </div>
             <input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="input-premium !pl-12 !h-[56px]"
               placeholder="••••••••••••"
               required
             />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-dark w-full !h-[60px] !rounded-2xl justify-center font-bold text-base shadow-2xl shadow-ink/15 group"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-100" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Verifying...
              </div>
            ) : (
                <div className="flex items-center gap-2">
                  Access Dashboard
                  <svg className="group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
            )}
          </button>
        </div>
      </form>

      {/* FOOTER NOTE */}
      <p className="text-center text-[10px] font-black text-muted-text/30 uppercase tracking-[0.3em] mt-8">
        Secure 256-bit encrypted session
      </p>
    </div>
  );
}
