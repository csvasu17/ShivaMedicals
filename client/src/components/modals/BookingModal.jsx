import React from 'react';
import BookToken from '../../pages/BookToken';

const BookingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-[1010] bg-white rounded-[28px] w-full max-w-lg shadow-2xl border border-slate-100 animate-scale-up max-h-[95vh] flex flex-col">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-[1020] p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-ink transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 md:p-8 scrollbar-hide">
          <BookToken onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
