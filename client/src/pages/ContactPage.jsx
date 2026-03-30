import React from 'react';

const ContactPage = () => {
  return (
    <div className="relative min-h-screen pt-[110px] pb-20 px-6 md:px-12 lg:px-24">
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-20 animate-fade-in text-center md:text-left">
        <span className="eyebrow mx-auto md:mx-0">Get In Touch</span>
        <h1 className="sec-title">Contact Our Clinical Team</h1>
        <p className="sec-sub mx-auto md:mx-0">
          Have questions about our services or need to book an appointment? Our team is here to help you with expert care and guidance.
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 animate-slide-up">
          {[
            { 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
              title: "Phone",
              details: ["+91 97870 04716", "+91 81110 17743"],
              sub: "Mon-Sun, 24/7"
            },
            { 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
              title: "Email",
              details: ["info@shivamedical.com"],
              sub: "Reply within 24hrs"
            },
            { 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
              title: "Location",
              details: ["175/4, Shiva Medical, Check Post Corner, Aranthangi - 614616"],
              sub: ""
            },
            { 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              title: "Working Hours",
              details: ["Mon-Fri: 9AM-8PM", "Sat: 9AM-5PM"],
              sub: ""
            }
          ].map((item, idx) => (
            <div key={idx} className="p-card p-8 bg-white shadow-premium flex flex-col items-center text-center group hover:border-blue-primary/30 transition-all duration-500">
               <div className="w-16 h-16 rounded-3xl bg-blue-primary/5 text-blue-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
               </div>
               <h3 className="text-lg font-serif font-bold text-ink mb-3">{item.title}</h3>
               <div className="space-y-1">
                  {item.details.map((line, lidx) => (
                    <p key={lidx} className="text-[13px] font-medium text-muted-text whitespace-pre-wrap">{line}</p>
                  ))}
               </div>
               {item.sub && <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-primary/40">{item.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* CONTACT FORM */}
          <div className="animate-slide-up">
            <div className="p-card p-10 bg-white shadow-premium">
              <h2 className="text-3xl font-serif font-bold text-ink mb-2">Send us a Message</h2>
              <p className="text-muted-text/70 text-sm mb-10">Fill out the form below and we'll get back to you as soon as possible.</p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-ink/40 ml-1">Full Name *</label>
                    <input type="text" placeholder="Enter your full name" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary/30 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-ink/40 ml-1">Email Address *</label>
                    <input type="email" placeholder="your.email@example.com" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary/30 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-ink/40 ml-1">Phone Number *</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary/30 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-ink/40 ml-1">Subject *</label>
                    <input type="text" placeholder="What is this regarding?" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary/30 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-ink/40 ml-1">Message *</label>
                  <textarea rows="5" placeholder="Tell us how we can help you..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary/30 outline-none transition-all resize-none"></textarea>
                </div>

                <button type="submit" className="btn-premium w-full justify-center">
                  Send Message
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </form>
            </div>
          </div>

          {/* VISIT US & MAP */}
          <div className="animate-slide-up stagger-1 h-full">
            <div className="p-card bg-white p-2 h-full min-h-[500px] flex flex-col">
               <div className="relative rounded-[28px] overflow-hidden flex-1 border border-slate-100 shadow-inner">
                  <iframe 
                    title="Clinic Location"
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d4001545.9092997657!2d76.2292835!3d11.640467!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b006da3a70cc873%3A0xc2e0f5fc25b44525!2sSHIVA%20MEDICAL%26%20SEMMALAR%20CLINIC!5e0!3m2!1sen!2sin!4v1774719940866!5m2!1sen!2sin" 
                    className="w-full h-full border-none"
                    allowFullScreen="" 
                    loading="lazy"
                  ></iframe>

                  {/* SMALLER COMPACT NAVIGATE BUTTON */}
                  <div className="absolute top-6 left-6 z-10 animate-fade-in">
                    <a 
                      href="https://www.google.com/maps/dir/?api=1&destination=SHIVA+MEDICAL+%26+SEMMALAR+CLINIC" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-blue-primary text-white pl-4 pr-5 py-2.5 rounded-full text-[11px] font-bold hover:bg-blue-mid transition-all duration-300 shadow-lg active:scale-95 whitespace-nowrap group animate-slide-up"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="group-hover:rotate-12 transition-transform"><path d="M12 2L19 21L12 17L5 21L12 2Z"/></svg>
                      Get Directions
                    </a>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* EMERGENCY BANNER */}
        <div className="mt-20 bg-red-600 rounded-[40px] p-10 md:p-16 text-center text-white shadow-2xl shadow-red-600/20 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-all group-hover:bg-white/10"></div>
           <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-serif font-black mb-6">Medical Emergency?</h2>
              <p className="text-red-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">Call us immediately for urgent medical assistance. Our emergency team is available 24/7.</p>
              <a href="tel:+919787004716" className="inline-flex items-center gap-4 bg-white text-red-600 px-10 h-20 rounded-[32px] font-black text-2xl shadow-xl hover:scale-105 transition-all">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                 Emergency: +91 97870 04716
              </a>
           </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
