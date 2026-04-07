import React, { useState } from 'react';
import { API_URL } from '../constants/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message === 'Failed to fetch' ? 'Connection failed. Please ensure the server is running.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* HEADER */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md relative group cursor-default transition-transform hover:scale-105 duration-500">
          <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif font-semibold text-gray-900 tracking-tight mb-2">Staff Portal</h2>
        <p className="text-sm text-gray-600 font-medium">Please enter your specialized credentials.</p>
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
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 focus:border-transparent focus:outline-none transition-all duration-300 font-medium"
              placeholder="Ex. receptionist_1"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Keep-Safe Password</label>
              <button type="button" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors hover:underline">Forgot password?</button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 focus:border-transparent focus:outline-none transition-all duration-300 font-medium"
                placeholder="••••••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-base shadow-lg shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-100" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Verifying...
              </>
            ) : (
                <>
                  Access Dashboard
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
            )}
          </button>
        </div>
      </form>

      {/* FOOTER NOTE */}
      <p className="text-center text-xs text-gray-400 mt-6">
        Secure access. Protected data.
      </p>
    </div>
  );
}
