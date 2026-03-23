import React, { useState, useEffect } from 'react';

const BookToken = ({ onClose }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    doctorId: '',
    sessionId: '',
    date: '',
    reasonForVisit: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doctors`);
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchSessions = async (doctorId) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/${doctorId}`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'doctorId') {
      setFormData(prev => ({ ...prev, sessionId: '' }));
      fetchSessions(value);
    }
  };

  const getNext3Days = () => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setBookingSuccess(data);
        setFormData({ patientName: '', phone: '', email: '', doctorId: '', sessionId: '', date: '', reasonForVisit: '' });
      } else {
        const data = await res.json();
        setError(data.message || data.error || 'Error booking token.');
      }
    } catch (err) {
      setError('System error. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="w-full max-w-xl mx-auto py-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-teal-primary/10 text-teal-primary rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform duration-500">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="text-3xl font-serif font-medium text-ink mb-2">Token Confirmed!</h2>
        <p className="text-muted-text text-sm mb-8 px-8">Your appointment has been successfully scheduled. Please arrive at least 10 minutes before your estimated time.</p>
        
        <div className="bg-slate-50 rounded-[32px] p-8 mb-8 border border-white shadow-inner relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-primary/10 transition-colors"></div>
           <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="text-left">
                 <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-2 opacity-60">Token Number</p>
                 <div className="flex items-baseline gap-1">
                    <p className="text-6xl font-serif font-bold text-ink">{bookingSuccess.token_number}</p>
                    <span className="text-blue-mid font-bold text-sm">#</span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-2 opacity-60">Booking ID</p>
                 <p className="text-lg font-bold text-ink bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm inline-block">{bookingSuccess.booking_ref}</p>
              </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-slate-200/50 flex justify-between items-center relative z-10">
              <div className="text-left">
                 <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1 opacity-60">Estimated Time</p>
                 <p className="text-2xl font-bold text-blue-mid">
                    {bookingSuccess.estimated_time.slice(0,5)} 
                    <span className="text-sm ml-1 opacity-70">
                       {parseInt(bookingSuccess.estimated_time.slice(0,2)) >= 12 ? 'PM' : 'AM'}
                    </span>
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1 opacity-60">Patient</p>
                 <p className="text-sm font-bold text-ink">{bookingSuccess.patient_name}</p>
              </div>
           </div>
        </div>
        
        <div className="flex flex-col gap-3">
           <button onClick={onClose} className="btn-dark w-full justify-center h-14 !rounded-2xl text-base shadow-xl shadow-ink/10">Done</button>
           <p className="text-center text-[11px] text-muted-text mt-2">A confirmation has been sent to your phone via SMS/WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-3 text-center">
        <span className="text-[9px] font-bold text-blue-mid uppercase tracking-[0.4em] mb-1 block">Quick Registration</span>
        <h2 className="text-2xl lg:text-3xl font-serif font-medium text-ink mb-0.5 tracking-tight">Book Your Token</h2>
        <p className="text-muted-text text-[13px]">Secure your digital consultation token in seconds.</p>
      </div>

      {error && (
        <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-xl text-[11px] border border-red-100 flex items-center gap-3">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleBook} className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5">
          
          <div className="md:col-span-2 group">
            <label className="block text-[10px] font-bold text-ink mb-1 uppercase tracking-widest pl-1">Patient Name</label>
            <div className="relative">
              <input 
                type="text" name="patientName" value={formData.patientName} onChange={handleChange} 
                className="w-full h-11 px-4 bg-cream-base border border-transparent rounded-lg focus:bg-white focus:border-blue-primary/30 outline-none transition-all placeholder:text-muted-text/50 font-medium text-ink text-[13px]"
                placeholder="Ex. Shiva Kumar" required 
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-text/30 group-focus-within:text-blue-primary/40 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-ink mb-1 uppercase tracking-widest pl-1">Phone Number</label>
            <div className="relative">
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                className="w-full h-11 px-4 bg-cream-base border border-transparent rounded-lg focus:bg-white focus:border-blue-primary/30 outline-none transition-all placeholder:text-muted-text/50 font-medium text-ink text-[13px]"
                placeholder="Mobile number" required 
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-text/30 group-focus-within:text-blue-primary/40 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.2 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-ink mb-1 uppercase tracking-widest pl-1">Email (Optional)</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} 
              className="w-full h-12 px-5 bg-cream-base border border-transparent rounded-xl focus:bg-white focus:border-blue-primary/30 focus:shadow-lg focus:shadow-blue-primary/5 outline-none transition-all placeholder:text-muted-text/50 font-medium text-ink text-sm"
              placeholder="For digital receipt" 
            />
          </div>

          <div className="md:col-span-2 group">
            <label className="block text-[10px] font-bold text-ink mb-1 uppercase tracking-widest pl-1">Specialist</label>
            <select 
              name="doctorId" value={formData.doctorId} onChange={handleChange} 
              className="w-full h-12 px-5 bg-cream-base border border-transparent rounded-xl focus:bg-white focus:border-blue-primary/30 focus:shadow-lg focus:shadow-blue-primary/5 outline-none transition-all appearance-none cursor-pointer font-medium text-ink text-sm"
              required
            >
              <option value="" disabled>Choose a doctor...</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
            </select>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-ink mb-1 uppercase tracking-widest pl-1">Session</label>
            <select 
              name="sessionId" value={formData.sessionId} onChange={handleChange} 
              className="w-full h-12 px-5 bg-cream-base border border-transparent rounded-xl focus:bg-white focus:border-blue-primary/30 focus:shadow-lg focus:shadow-blue-primary/5 outline-none transition-all appearance-none cursor-pointer font-medium text-ink text-sm disabled:opacity-40"
              required disabled={!formData.doctorId}
            >
              <option value="" disabled>Select session...</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.session_type} ({s.start_time.slice(0,5)})</option>)}
            </select>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-ink mb-1 uppercase tracking-widest pl-1">Preferred Date</label>
            <select 
              name="date" value={formData.date} onChange={handleChange} 
              className="w-full h-12 px-5 bg-cream-base border border-transparent rounded-xl focus:bg-white focus:border-blue-primary/30 focus:shadow-lg focus:shadow-blue-primary/5 outline-none transition-all appearance-none cursor-pointer font-medium text-ink text-sm"
              required
            >
              <option value="" disabled>Choose date...</option>
              {getNext3Days().map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 group">
            <label className="block text-[9px] font-bold text-ink mb-1 uppercase tracking-widest pl-1">Reason (Optional)</label>
            <textarea 
              name="reasonForVisit" value={formData.reasonForVisit} onChange={handleChange} rows="1" 
              className="w-full px-4 py-2 bg-cream-base border border-transparent rounded-lg focus:bg-white focus:border-blue-primary/30 outline-none transition-all placeholder:text-muted-text/50 font-medium text-ink text-[13px] resize-none"
              placeholder="Health concern details..."
            ></textarea>
          </div>
        </div>

        <div className="pt-1.5">
          <button 
            type="submit" disabled={loading} 
            className="w-full h-12 bg-ink hover:bg-blue-primary text-white font-bold rounded-xl shadow-xl shadow-ink/5 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2.5">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                Confirm Reservation
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </>
            )}
          </button>
          <p className="text-center text-[9px] text-muted-text mt-2 font-medium opacity-50">By clicking, you agree to our terms of service.</p>
        </div>
      </form>
    </div>
  );
};

export default BookToken;
