import React from 'react';

const Footer = ({ setIsLoginModalOpen }) => {
  return (
    <footer className="bg-ink px-6 md:px-12 pt-16 pb-10 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 mb-16">
        {/* Brand Column */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-lg">
              <img src="/shiva-logo.jpg" alt="SM Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-2xl font-medium text-white tracking-tight">Shiva Medicals</span>
          </div>
          <p className="text-white/90 font-medium text-sm mb-4">Your Health, Our Priority</p>
          <p className="text-white/45 text-sm leading-relaxed mb-10 max-w-[240px]">
            Providing quality healthcare services with compassion and excellence in Aranthangi.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-white text-sm mb-8 uppercase tracking-widest">Quick Links</h4>
          <ul className="space-y-4">
            {[
              { label: 'Home', action: null },
              { label: 'How It Works', action: null },
              { label: 'Our Doctors', action: null },
              { label: 'Services', action: null },
              { label: 'Live Board', action: null },
              { label: 'Book a Token', action: null },
            ].map(l => (
              <li key={l.label}><button className="text-white/45 text-sm hover:text-white transition-colors uppercase tracking-wider">{l.label}</button></li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div className="space-y-6">
          <h4 className="font-bold text-white text-sm mb-8 uppercase tracking-widest">Contact Us</h4>
          <div className="flex gap-4">
            <div className="mt-1 text-blue-mid">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              175/4, Shiva Medical, Check Post<br />Corner, Aranthangi – 614616
            </p>
          </div>
          <div className="space-y-3">
            {[ '+91 97870 04716', '+91 81110 17743' ].map(p => (
              <div key={p} className="flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer text-sm">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                 {p}
              </div>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <h4 className="font-bold text-white text-sm mb-8 uppercase tracking-widest">Working Hours</h4>
          <div className="space-y-4 mb-10">
            <div className="flex items-start gap-4">
              <svg className="mt-1 text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div className="text-sm text-white/50 leading-loose">
                Mon – Fri: 9:00 AM – 8:00 PM<br />
                Saturday: 9:00 AM – 5:00 PM<br />
                Sunday: 10:00 AM – 2:00 PM<br />
              </div>
            </div>
          </div>
          <button onClick={() => setIsLoginModalOpen(true)} className="text-[11px] text-white/20 hover:text-white uppercase tracking-[0.2em] transition-colors">Staff Login</button>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5 flex justify-center">
        <p className="text-white/30 text-[13px] tracking-wide text-center">
          © 2026 Shiva Medicals. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
