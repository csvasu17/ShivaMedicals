import React from 'react';
import Login from '../../pages/Login';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
       {/* Backdrop */}
       <div 
         className="fixed inset-0 bg-ink/60 backdrop-blur-xl animate-fade-in cursor-pointer" 
         onClick={onClose}
       ></div>

       {/* Modal Container */}
       <div className="bg-white rounded-[40px] w-full max-w-lg p-8 sm:p-12 shadow-[0_48px_110px_-25px_rgba(0,0,0,0.3)] relative animate-scale-up z-[2010] border border-white flex flex-col my-auto">
          {/* Close button - Highly Visible */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-50 text-muted-text/30 hover:text-ink transition-all active:scale-90 group z-[2020]"
          >
            <svg 
              className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Login Form Content */}
          <div className="relative">
            <Login onLoginSuccess={onLoginSuccess} />
          </div>
       </div>
    </div>
  );
};

export default LoginModal;
