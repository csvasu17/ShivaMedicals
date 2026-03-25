import React, { useState } from 'react';

const testimonials = [
  {
    quote: "Got my token online before leaving home. By the time I arrived, there were only 2 patients ahead of me. Never experienced this in any clinic before.",
    name: "Karthik R.",
    role: "Software Engineer, Aranthangi",
    initials: "KR",
    color: "#E6F1FB",
  },
  {
    quote: "I book my child's slot with Dr. Priya every week. The WhatsApp reminder is very helpful — I don't have to guess when to arrive. Zero waiting time.",
    name: "Sangeetha M.",
    role: "Homemaker, Karaikudi",
    initials: "SM",
    color: "#E1F5EE",
  },
  {
    quote: "Doctor doesn't rush through. Takes time to listen and explains everything clearly. The token system made the overall experience much smoother.",
    name: "Arjun P.",
    role: "Teacher, Aranthangi",
    initials: "AP",
    color: "#FAEEDA",
  },
];

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const TestimonialsSection = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="px-6 md:px-12 py-20 bg-white relative overflow-hidden" id="testimonials">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-5%] w-[35%] h-[60%] bg-blue-primary/3 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-teal-primary/3 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="animate-slide-up lg:sticky lg:top-32">
            <span className="eyebrow">Patient Stories</span>
            <h2 className="sec-title">Trusted by families<br />across Aranthangi.</h2>
            <p className="sec-sub">
              Real experiences from patients who've replaced waiting-room frustration with a calm, predictable clinic visit.
            </p>

            <div className="inline-flex items-center gap-4 bg-cream-base rounded-2xl px-5 py-4 border border-slate-100 mt-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>
              <div>
                <p className="text-[13px] font-bold text-ink">5.0 rating</p>
                <p className="text-[11px] text-muted-text">Based on 500+ patient visits</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 animate-slide-up stagger-1">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                onClick={() => setActive(idx)}
                className={`rounded-[28px] border p-6 cursor-pointer transition-all duration-400 ${
                  active === idx
                    ? 'border-blue-primary/20 bg-blue-50/40 shadow-lg shadow-blue-primary/5'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                </div>
                <p className="text-[15px] leading-7 text-ink/80 mb-5">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-ink border-2 border-white shadow-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-ink">{t.name}</p>
                    <p className="text-[12px] text-muted-text">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
