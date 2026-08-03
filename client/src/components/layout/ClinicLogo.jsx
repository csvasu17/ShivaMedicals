import React, { useState, useEffect } from 'react';

const ClinicLogo = ({ className = "w-10 h-10" }) => {
  const [active, setActive] = useState(false);
  const [timerId, setTimerId] = useState(null);

  const handleTrigger = () => {
    setActive(true);
    if (timerId) clearTimeout(timerId);
    const id = setTimeout(() => {
      setActive(false);
    }, 2500);
    setTimerId(id);
  };

  useEffect(() => {
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timerId]);

  return (
    <div 
      className={`relative ${className} flex-shrink-0 select-none cursor-pointer`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        if (timerId) return; // Keep active if click timer is running
        setActive(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleTrigger();
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Swirl & Cross Group with smooth transitions */}
        <g 
          className="transition-all duration-500 ease-out origin-center"
          style={{
            transform: active ? 'translate(0px, -9px) scale(0.82)' : 'translate(0px, 0px) scale(1)'
          }}
        >
          {/* Top-Left Main Swosh */}
          <path 
            d="M 24,56 C 18,33 36,17 62,17 C 48,19 35,30 35,48 C 35,60 41,68 51,72 C 39,70 29,66 24,56 Z" 
            fill="#1072b8" 
          />
          {/* Top-Left Inner Swosh */}
          <path 
            d="M 32.5,46.5 C 32.5,35.5 41.5,27.5 53.5,25.5 C 45.5,27 38.5,33.5 38.5,43.5 C 38.5,49.5 42.5,54.5 47.5,57 C 39.5,55 32.5,52 32.5,46.5 Z" 
            fill="#1072b8" 
          />
          
          {/* Bottom-Right Swirl Group (180 degree rotation of Top-Left) */}
          <g transform="rotate(180 50 50)">
            {/* Bottom-Right Main Swosh */}
            <path 
              d="M 24,56 C 18,33 36,17 62,17 C 48,19 35,30 35,48 C 35,60 41,68 51,72 C 39,70 29,66 24,56 Z" 
              fill="#1072b8" 
            />
            {/* Bottom-Right Inner Swosh */}
            <path 
              d="M 32.5,46.5 C 32.5,35.5 41.5,27.5 53.5,25.5 C 45.5,27 38.5,33.5 38.5,43.5 C 38.5,49.5 42.5,54.5 47.5,57 C 39.5,55 32.5,52 32.5,46.5 Z" 
              fill="#1072b8" 
            />
          </g>

          {/* Central White Mask */}
          <circle cx="50" cy="50" r="21" fill="white" />

          {/* Medical Cross (Pink/Magenta) */}
          <rect x="46" y="34" width="8" height="32" rx="2" fill="#e21a7a" />
          <rect x="34" y="46" width="32" height="8" rx="2" fill="#e21a7a" />
        </g>

        {/* Corporate Brand Name Text with fade and slide transitions */}
        <g 
          className="transition-all duration-500 ease-out"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'translate(0, 0)' : 'translate(0, 4px)'
          }}
        >
          <text 
            x="50" 
            y="83" 
            textAnchor="middle" 
            fill="#e21a7a" 
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900, fontSize: '9px', letterSpacing: '0.04em' }}
          >
            SHIVA MEDICAL
          </text>
          <text 
            x="50" 
            y="93" 
            textAnchor="middle" 
            fill="#1072b8" 
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: '5.2px', letterSpacing: '0.04em' }}
          >
            SEMMALAR CLINIC
          </text>
        </g>
      </svg>
    </div>
  );
};

export default ClinicLogo;
