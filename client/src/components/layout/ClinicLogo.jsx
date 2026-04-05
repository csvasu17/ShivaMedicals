import React from 'react';

const ClinicLogo = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative ${className} group-hover:scale-110 transition-transform duration-500`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        {/* Outer Circular Text Path */}
        <defs>
          <path id="circlePathTop" d="M 20, 50 a 30,30 0 1,1 60,0" />
          <path id="circlePathBottom" d="M 80, 50 a 30,30 0 1,1 -60,0" />
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0B8F73', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1847C2', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Central Cross */}
        <rect x="38" y="25" width="24" height="50" rx="4" fill="url(#logoGradient)" />
        <rect x="25" y="38" width="50" height="24" rx="4" fill="url(#logoGradient)" />

        {/* Stethoscope Silhouette */}
        <path 
          d="M 50,35 A 8,8 0 0,0 42,43 M 50,35 A 8,8 0 0,1 58,43 M 50,35 V 55 M 50,55 A 4,4 0 1,0 50,63" 
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
        />
        <circle cx="42" cy="43" r="1.5" fill="white" />
        <circle cx="58" cy="43" r="1.5" fill="white" />

        {/* Circular Text */}
        <text className="text-[7.5px] font-bold tracking-[0.1em]" fill="#0B8F73">
          <textPath href="#circlePathTop" startOffset="50%" textAnchor="middle">
            SEMMALAR CLINIC
          </textPath>
        </text>
        <text className="text-[7.5px] font-bold tracking-[0.1em]" fill="#1847C2">
          <textPath href="#circlePathBottom" startOffset="50%" textAnchor="middle">
            SHIVA MEDICALS
          </textPath>
        </text>

        {/* Side Dots */}
        <circle cx="15" cy="50" r="2" fill="#0B8F73" />
        <circle cx="85" cy="50" r="2" fill="#1847C2" />
      </svg>
    </div>
  );
};

export default ClinicLogo;
