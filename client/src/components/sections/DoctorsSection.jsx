import React from 'react';

const DoctorsSection = ({ setIsBookingModalOpen }) => {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-24 bg-[#FAFBFF]" id="doctors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-serif font-medium text-ink tracking-tight mb-4">Dedicated Specialists</h2>
            <p className="text-muted-text text-lg leading-relaxed">Consult with our leading practitioners. Real-time availability updated every 60 seconds.</p>
          </div>
          <button className="text-blue-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group">
            View All Doctors
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* DR RAMESH */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm shadow-slate-200/50 flex flex-col sm:flex-row gap-8 items-center group transition-all hover:shadow-xl hover:translate-y-[-4px]">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shrink-0 shadow-lg border-4 border-slate-50">
              <img src="/doctor_male_profile_1774320340939.png" alt="Dr. Ramesh Kumar" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-teal-primary/10 text-teal-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Acting Now</span>
                <span className="text-[11px] font-bold text-muted-text/60">MD · GENERAL MEDICINE</span>
              </div>
              <h3 className="text-2xl font-serif font-medium text-ink mb-6">Dr. Ramesh Kumar</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-text/40 uppercase tracking-widest mb-1">Slots left</p>
                  <p className="text-xl font-black text-blue-primary">12 slots</p>
                </div>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-blue-primary hover:bg-blue-mid text-white h-12 px-8 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-blue-primary/20"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* DR PRIYA */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm shadow-slate-200/50 flex flex-col sm:flex-row gap-8 items-center group transition-all hover:shadow-xl hover:translate-y-[-4px]">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shrink-0 shadow-lg border-4 border-slate-50">
              <img src="/doctor_female_profile_1774320363632.png" alt="Dr. Priya Sundar" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-amber-400/10 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Filling Fast</span>
                <span className="text-[11px] font-bold text-muted-text/60">DCH · CHILD SPECIALIST</span>
              </div>
              <h3 className="text-2xl font-serif font-medium text-ink mb-6">Dr. Priya Sundar</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-text/40 uppercase tracking-widest mb-1">Slots left</p>
                  <p className="text-xl font-black text-blue-primary">04 slots</p>
                </div>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-blue-primary hover:bg-blue-mid text-white h-12 px-8 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-blue-primary/20"
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
