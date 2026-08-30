import React from 'react';
import BookToken from '../../pages/BookToken';

const BookingModal = ({ isOpen, onClose, initialDoctorId, initialCancelMode = false, isExtra = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-[3010] p-modal-card !p-0 w-full max-w-2xl animate-scale-up max-h-[95vh] flex flex-col overflow-hidden sm:overflow-visible">
        {/* Absolute Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto sm:overflow-visible scrollbar-hide">
          <div className="p-4 sm:p-6 md:px-10 md:py-6">
            <BookToken 
              onClose={onClose} 
              initialDoctorId={initialDoctorId} 
              initialCancelMode={initialCancelMode} 
              isExtra={isExtra}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
