import React from 'react';

const HowItWorks = () => {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-24 bg-[#F8FAFC] relative overflow-hidden" id="how">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-serif font-medium text-ink mb-4">Book in 4 steps</h2>
          <p className="text-muted-text text-lg max-w-2xl mx-auto font-medium opacity-80">Our digitized workflow eliminates wait time uncertainty.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* LEFT: STEPS */}
          <div className="space-y-12 animate-slide-up">
            {[
              { n: 1, t: "Select Specialist", d: "Choose your doctor based on clinical expertise and real-time slot availability." },
              { n: 2, t: "Secure with OTP", d: "Verify your mobile number to ensure a secure and authenticated booking." },
              { n: 3, t: "Instant Token Generation", d: "Receive your unique clinical token with an estimated consultation time." },
              { n: 4, t: "Track Live Progress", d: "Arrive exactly when you're needed. Monitor the live queue from home." }
            ].map((s, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="w-10 h-10 rounded-full bg-blue-primary text-white font-bold flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-lg shadow-blue-primary/20">
                  {s.n}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-ink mb-2">{s.t}</h4>
                  <p className="text-base text-muted-text leading-relaxed font-normal opacity-80">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: TOKEN PREVIEW */}
          <div className="relative animate-slide-up stagger-1">
            <div className="absolute inset-0 bg-blue-primary/5 rounded-[48px] rotate-3 -z-10"></div>
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.12)] p-10 relative overflow-hidden">
               <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-bold text-ink tracking-tight transition-transform">Your Token</h3>
                  <span className="bg-blue-primary/10 text-blue-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Confirmed</span>
               </div>
               
               <div className="text-center mb-12">
                  <div className="text-[120px] font-black text-blue-primary leading-none tracking-tighter mb-4 animate-scale-up">#08</div>
                  <p className="text-xs font-bold text-muted-text/50 uppercase tracking-[0.2em] mb-1">Current Token: <span className="text-ink">#04</span></p>
               </div>

               <div className="space-y-6 pt-10 border-t border-slate-50 italic">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-text font-medium opacity-60">Est. Appointment</span>
                    <span className="text-sm font-bold text-ink">11:45 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-text font-medium opacity-60">Wait Duration</span>
                    <span className="text-sm font-bold text-blue-primary">~ 35 mins</span>
                  </div>
               </div>

               <div className="mt-10 bg-blue-primary/5 rounded-2xl p-4 flex items-center gap-4 border border-blue-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path d="M12 3v18" /><path d="M3 12h18" /></svg>
                  </div>
                  <p className="text-[11px] font-bold text-blue-primary uppercase tracking-widest leading-relaxed">We will WhatsApp you 15 min before your turn</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
