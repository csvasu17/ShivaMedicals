import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const parseDoctorName = (fullName) => {
  if (!fullName) return { name: '', qualifications: '', translation: '' };
  
  // 1. Extract Tamil text in parentheses
  const tamilRegex = /\(([\u0B80-\u0BFF\s,().\-\u200B-\u200D]+)\)/;
  const tamilMatch = fullName.match(tamilRegex);
  let translation = '';
  let cleanName = fullName;
  
  if (tamilMatch) {
    translation = tamilMatch[1].trim();
    cleanName = fullName.replace(tamilRegex, '').trim();
  }
  
  // 2. Separate name from degrees (MBBS, MD, DCH, DLO, D.DIAB, MS, DrNB, etc.)
  const degreeRegex = /\b(MBBS|MD|DCH|DLO|D\.DIAB|MS|DrNB)\b/i;
  const degreeMatch = cleanName.match(degreeRegex);
  
  let name = cleanName;
  let qualifications = '';
  
  if (degreeMatch) {
    const index = degreeMatch.index;
    name = cleanName.substring(0, index).trim();
    qualifications = cleanName.substring(index).trim();
    
    // Clean trailing/leading commas/spaces from name and qualifications
    name = name.replace(/^[,\s]+|[,\s]+$/g, '');
    qualifications = qualifications.replace(/^[,\s]+|[,\s]+$/g, '');
  }
  
  return { name, qualifications, translation };
};

const DoctorsSection = ({ setIsBookingModalOpen }) => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/doctors`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDoctors(data.filter(d => d.is_active !== false));
        }
      })
      .catch(err => console.error('Error fetching doctors:', err));
  }, []);

  const getDoctorImage = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('anand')) return '/anand.jpg';
    if (lowerName.includes('venkatesh')) return '/venkatesh.jpg';
    // Dummy image for other doctors
    return '/doctor_male_profile_1774320340939.png';
  };

  return (
    <section className="px-6 md:px-12 lg:px-24 pt-[88px] pb-32 bg-transparent" id="doctors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 mb-12 md:mb-20 animate-slide-up">
          <div className="max-w-2xl">
            <span className="eyebrow">Expert Team</span>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-medium leading-tight md:leading-[1.1] tracking-tight mb-4 md:mb-6">Dedicated Specialists</h2>
            <p className="text-muted-text text-[15px] md:text-lg leading-relaxed max-w-2xl opacity-80">Consult with our leading practitioners. Real-time availability updated every 60 seconds to ensure prompt care.</p>
          </div>
          <button className="text-blue-primary font-bold text-sm uppercase tracking-[0.2em] flex items-center gap-2 group mb-6">
            View All Doctors
            <div className="w-8 h-8 rounded-full border border-blue-primary/20 flex items-center justify-center group-hover:bg-blue-primary group-hover:text-white transition-all duration-300">
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {doctors.map((doctor, idx) => (
            <div key={doctor.id} className={`p-card p-6 md:p-10 flex flex-col sm:flex-row gap-8 md:gap-10 items-center group animate-slide-up stagger-${(idx % 4) + 1}`}>
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl md:rounded-[40px] overflow-hidden shrink-0 shadow-lg border-6 md:border-8 border-slate-50 relative">
                <img src={getDoctorImage(doctor.name)} alt={doctor.name} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 mb-4">
                  <span className="bg-teal-500/10 text-teal-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-teal-500/10 animate-pulse">Acting Now</span>
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-text/70 uppercase tracking-widest">{doctor.specialty ? doctor.specialty.toUpperCase() : (doctor.type === 'child' ? 'CHILD SPECIALIST' : doctor.type.toUpperCase())}</span>
                </div>
                {(() => {
                  const { name, qualifications, translation } = parseDoctorName(doctor.name);
                  return (
                    <div className="mb-6 md:mb-8 text-left">
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-1.5 tracking-tight p-card-title break-words">{name}</h3>
                      {qualifications && (
                        <p className="text-[11px] md:text-[12px] font-bold text-blue-primary uppercase tracking-wider mb-1.5">{qualifications}</p>
                      )}
                      {translation && (
                        <p className="text-[13px] md:text-[14px] font-semibold text-muted-text/80 leading-snug">({translation})</p>
                      )}
                    </div>
                  );
                })()}
                
                <div className="flex flex-col sm:flex-row items-center sm:justify-between bg-slate-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 gap-4 w-full">
                  <div className="text-center sm:text-left">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-text/50 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1">Status</p>
                    <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                      <span className="text-xl md:text-2xl font-serif font-black text-blue-primary">Available</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsBookingModalOpen(doctor.id)}
                    className="bg-ink hover:bg-blue-primary text-white h-11 md:h-12 px-6 md:px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all transform active:scale-95 shadow-lg shadow-ink/10 shrink-0 w-full sm:w-auto"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
