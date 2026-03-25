import React from 'react';

const services = [
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'General Medicine',
    desc: 'Consultations for fever, infections, chronic conditions, and routine health checks.',
    color: 'rgba(24,71,194,0.08)',
    stroke: '#2B5CE6',
  },
  {
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    title: 'Pediatric Care',
    desc: 'Expert child health consultations for infants, toddlers, and growing children.',
    color: 'rgba(11,143,115,0.08)',
    stroke: '#0B8F73',
  },
  {
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    title: "Women's Wellness",
    desc: "Comprehensive care for women's health needs, from routine checks to specialized support.",
    color: 'rgba(236,72,153,0.08)',
    stroke: '#db2777',
  },
  {
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    title: 'Minor Surgery',
    desc: 'Safe in-clinic minor procedures including wound care, suturing, and excisions.',
    color: 'rgba(245,158,11,0.08)',
    stroke: '#d97706',
  },
  {
    icon: 'M15.536 8.464a5 5 0 010 7.072M12 18.364l-.364-.364m0 0a5 5 0 01-7.071-7.072L12 3.636l7.435 7.292a5 5 0 01-7.071 7.072l-.364-.364z',
    title: 'ENT Care',
    desc: 'Ear, nose and throat consultations for infections, allergies, and related conditions.',
    color: 'rgba(124,58,237,0.08)',
    stroke: '#7c3aed',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    title: 'Lifestyle Medicine',
    desc: 'Management of diabetes, blood pressure, thyroid disorders, and long-term wellness plans.',
    color: 'rgba(16,185,129,0.08)',
    stroke: '#10b981',
  },
];

const ServicesSection = ({ setIsBookingModalOpen }) => {
  return (
    <section className="px-6 md:px-12 py-20 bg-cream-base relative overflow-hidden" id="services">
      <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-base via-transparent to-cream-base"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
          <span className="eyebrow">Our Specialties</span>
          <h2 className="sec-title">Comprehensive care,<br />under one roof.</h2>
          <p className="sec-sub mx-auto text-center">
            From everyday ailments to specialized consultations — our expert doctors cover all your family's health needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-blue-primary/10 transition-all duration-500 group animate-slide-up cursor-default"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: s.color }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </div>
              <h4 className="text-[17px] font-bold text-ink mb-2 tracking-tight">{s.title}</h4>
              <p className="text-muted-text text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="text-center animate-fade-in">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="btn-dark px-10 h-14 text-base"
          >
            Book a consultation
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <p className="text-muted-text text-sm mt-4">No registration needed · Just your mobile number</p>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
