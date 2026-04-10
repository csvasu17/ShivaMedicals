import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const EditPatientModal = ({ isOpen, onClose, patient, onUpdated }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        patient_name: patient.patient_name || '',
        patient_phone: patient.patient_phone || '',
        patient_email: patient.patient_email || '',
        location: patient.location || ''
      });
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/bookings/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update patient');
      }

      onUpdated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-6 right-6">
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-serif text-ink font-semibold">Edit Patient Details</h2>
            <p className="text-muted-text text-[13px] mt-1">Update the patient's identification and contact information.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[13px] font-bold flex items-center gap-3 animate-fade-in shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Patient Name</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm">
                <input 
                  type="text" 
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mobile Number</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm">
                <input 
                  type="tel" 
                  name="patient_phone"
                  value={formData.patient_phone}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address (Optional)</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm">
                <input 
                  type="email" 
                  name="patient_email"
                  value={formData.patient_email}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Location</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-blue-primary transition-all shadow-sm">
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 h-14 rounded-2xl bg-blue-primary text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-primary/20 hover:bg-blue-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;
