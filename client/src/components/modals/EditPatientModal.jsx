import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const EditPatientModal = ({ isOpen, onClose, patient, onUpdated }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_age_years: '',
    patient_age_months: '',
    patient_age_days: 0,
    location: '',
    remarks: ''
  });
  const [isDays, setIsDays] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        patient_name: patient.patient_name || '',
        patient_phone: patient.patient_phone || '',
        patient_age_years: patient.patient_age_years ?? '',
        patient_age_months: patient.patient_age_months ?? '',
        patient_age_days: patient.patient_age_days ?? 0,
        location: patient.location || '',
        remarks: patient.remarks || ''
      });
      setIsDays(!!patient.patient_age_days && patient.patient_age_days > 0);
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
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-5 right-5 z-20">
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6 pr-10">
            <h2 className="text-2xl font-serif text-slate-900 font-semibold leading-tight">Edit Patient Details</h2>
            <p className="text-muted-text text-[13px] mt-1 font-medium">Update the patient's record and status in the system.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[13px] font-bold flex items-center gap-3 animate-fade-in shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="form-label-premium">Patient Name</label>
              <input 
                type="text" 
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                className="input-premium h-[42px] focus:ring-blue-primary"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="form-label-premium">Mobile Number</label>
              <input 
                type="tel" 
                name="patient_phone"
                value={formData.patient_phone}
                onChange={handleChange}
                className="input-premium h-[42px] focus:ring-blue-primary"
                required
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label-premium mb-0">Patient Age *</label>
                
                {/* Segmented Tab Control */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDays(false);
                      setFormData(p => ({ ...p, patient_age_years: '', patient_age_months: '', patient_age_days: 0 }));
                    }}
                    className={`px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      !isDays 
                        ? 'bg-white text-blue-primary shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Y & M
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDays(true);
                      setFormData(p => ({ ...p, patient_age_years: 0, patient_age_months: 0, patient_age_days: '' }));
                    }}
                    className={`px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      isDays 
                        ? 'bg-white text-blue-primary shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Days
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {!isDays ? (
                  <>
                    <div className="relative group">
                      <select 
                        name="patient_age_years" 
                        value={formData.patient_age_years} 
                        onChange={handleChange} 
                        className="input-premium h-[42px] appearance-none pr-10 cursor-pointer focus:ring-blue-primary w-full" 
                        required={!isDays}
                      >
                        <option value="">Years</option>
                        {[...Array(111).keys()].map(y => <option key={y} value={y}>{y}y</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                    </div>
                    <div className="relative group">
                      <select 
                        name="patient_age_months" 
                        value={formData.patient_age_months} 
                        onChange={handleChange} 
                        className="input-premium h-[42px] appearance-none pr-10 cursor-pointer focus:ring-blue-primary w-full" 
                        required={!isDays}
                      >
                        <option value="">Months</option>
                        {[...Array(12).keys()].map(m => <option key={m} value={m}>{m}m</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 relative group">
                    <select 
                      name="patient_age_days" 
                      value={formData.patient_age_days} 
                      onChange={handleChange} 
                      className="input-premium h-[42px] appearance-none pr-10 cursor-pointer focus:ring-blue-primary w-full" 
                      required={isDays}
                    >
                      <option value="">Select Days</option>
                      {[...Array(31).keys()].map(d => <option key={d+1} value={d+1}>{d+1} Days</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="form-label-premium">Location *</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-premium h-[42px] focus:ring-blue-primary"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="form-label-premium">Remarks</label>
              <textarea 
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Specific clinical notes..."
                className="input-premium py-3 h-20 resize-none focus:ring-blue-primary"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-primary hover:bg-blue-primary/95 text-white font-bold text-[12px] h-12 rounded-xl uppercase tracking-wider shadow-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 active:scale-[0.98] cursor-pointer mt-4"
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
