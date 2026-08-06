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
      className={`relative ${className} flex-shrink-0 select-none cursor-pointer group`}
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
      {/* Icon Only Logo (Default) */}
      <img 
        src="/logo_icon.png" 
        alt="Shiva Medical & Semmalar Clinic Icon" 
        className="absolute inset-0 w-full h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105"
        style={{ 
          opacity: active ? 0 : 1,
          visibility: active ? 'hidden' : 'visible',
          transform: active ? 'translateY(-2px)' : 'translateY(6px)'
        }}
      />
      {/* Full Logo with Bottom Text (Hover/Click) */}
      <img 
        src="/logo_full.png" 
        alt="Shiva Medical & Semmalar Clinic Full Logo" 
        className="absolute inset-0 w-full h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105"
        style={{ 
          opacity: active ? 1 : 0,
          visibility: active ? 'visible' : 'hidden',
          transform: active ? 'translateY(1px)' : 'translateY(1px)'
        }}
      />
    </div>
  );
};

export default ClinicLogo;
