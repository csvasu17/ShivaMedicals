import React from 'react';

const DoctorsSection = ({ setIsBookingModalOpen }) => {
  return (
    <section className="px-6 md:px-12 lg:px-24 pt-[88px] pb-32 bg-transparent" id="doctors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 animate-slide-up">
          <div className="max-w-2xl">
            <span className="eyebrow">Expert Team</span>
            <h2 className="sec-title">Dedicated Specialists</h2>
            <p className="sec-sub">Consult with our leading practitioners. Real-time availability updated every 60 seconds to ensure prompt care.</p>
          </div>
          <button className="text-blue-primary font-bold text-sm uppercase tracking-[0.2em] flex items-center gap-2 group mb-6">
            View All Doctors
            <div className="w-8 h-8 rounded-full border border-blue-primary/20 flex items-center justify-center group-hover:bg-blue-primary group-hover:text-white transition-all duration-300">
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* DR RAMESH */}
          <div className="p-card p-8 md:p-10 flex flex-col sm:flex-row gap-10 items-center group animate-slide-up stagger-1">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[40px] overflow-hidden shrink-0 shadow-lg border-8 border-slate-50 relative">
              <img src="/doctor_male_profile_1774320340939.png" alt="Dr. Ramesh Kumar" className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 mb-4">
                <span className="bg-teal-500/10 text-teal-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-500/10 animate-pulse">Acting Now</span>
                <span className="text-[11px] font-bold text-muted-text/70 uppercase tracking-widest">MD · GENERAL MEDICINE</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-ink mb-8 tracking-tight p-card-title">Dr. Ramesh Kumar</h3>
              
              <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-muted-text/50 uppercase tracking-[0.2em] mb-1">Slots left</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-black text-blue-primary">12</span>
                    <span className="text-xs font-bold text-blue-primary/60 uppercase">slots</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-ink hover:bg-blue-primary text-white h-14 px-8 rounded-2xl font-bold text-[13px] uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-ink/10"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* DR PRIYA */}
          <div className="p-card p-8 md:p-10 flex flex-col sm:flex-row gap-10 items-center group animate-slide-up stagger-2">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[40px] overflow-hidden shrink-0 shadow-lg border-8 border-slate-50 relative">
              <img src="/doctor_female_profile_1774320363632.png" alt="Dr. Priya Sundar" className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 mb-4">
                <span className="bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/10">Filling Fast</span>
                <span className="text-[11px] font-bold text-muted-text/70 uppercase tracking-widest">DCH · CHILD SPECIALIST</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-ink mb-8 tracking-tight p-card-title">Dr. Priya Sundar</h3>
              
              <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-muted-text/50 uppercase tracking-[0.2em] mb-1">Slots left</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-black text-blue-primary">04</span>
                    <span className="text-xs font-bold text-blue-primary/60 uppercase">slots</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-ink hover:bg-blue-primary text-white h-14 px-8 rounded-2xl font-bold text-[13px] uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-ink/10"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
