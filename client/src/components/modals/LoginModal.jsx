import React from 'react';
import Login from '../../pages/Login';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
       {/* Backdrop */}
       <div 
         className="fixed inset-0 bg-ink/60 backdrop-blur-xl animate-fade-in cursor-pointer" 
         onClick={onClose}
       ></div>

        {/* Modal Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md p-8 sm:p-10 shadow-2xl relative animate-scale-up z-[3010] border border-white/20 flex flex-col my-auto transition-all duration-500">
           {/* Close button */}
           <button 
             type="button"
             onClick={onClose}
             className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95 group z-[3020]"
           >
             <svg 
               className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24" 
               strokeWidth="2.5"
             >
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>

           {/* Login Form Content */}
           <Login onLoginSuccess={onLoginSuccess} />
        </div>
    </div>
  );
};

export default LoginModal;
