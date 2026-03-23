import React, { useMemo, useState, useEffect } from 'react';

const initialFormState = {
  patientName: '',
  phone: '',
  email: '',
  doctorId: '',
  sessionId: '',
  date: '',
  reasonForVisit: ''
};

const steps = [
  { id: 1, title: 'Patient details', description: 'Tell us who is visiting.' },
  { id: 2, title: 'Visit preferences', description: 'Choose doctor, session, and date.' },
  { id: 3, title: 'Review & confirm', description: 'Check your booking summary.' }
];

const formatDisplayDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

const BookToken = ({ onClose }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [doctors, setDoctors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'doctorId') {
      setFormData((prev) => ({ ...prev, doctorId: value, sessionId: '' }));
      fetchSessions(value);
    }
  };

  const getNext3Days = () => {
    const dates = [];
    for (let i = 0; i < 3; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.id) === String(formData.doctorId)),
    [doctors, formData.doctorId]
  );

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(formData.sessionId)),
    [sessions, formData.sessionId]
  );

  const completionPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.patientName || !formData.phone) {
        setError('Please enter the patient name and phone number to continue.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.doctorId || !formData.sessionId || !formData.date) {
        setError('Please choose a doctor, session, and preferred date.');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePreviousStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

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
        setFormData(initialFormState);
        setCurrentStep(1);
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
      <div className="w-full max-w-3xl mx-auto py-4 text-center animate-fade-in">
        <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-[linear-gradient(135deg,#f6fffb_0%,#f8fbff_55%,#eef6ff_100%)] p-8 md:p-10 shadow-[0_30px_80px_-30px_rgba(18,66,127,0.35)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-primary via-blue-primary to-cyan-400"></div>
          <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-[24px] bg-teal-primary text-white shadow-lg shadow-teal-primary/20">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-teal-primary">Booking confirmed</p>
          <h2 className="mb-3 text-3xl font-serif font-medium text-ink md:text-4xl">Your visit is reserved.</h2>
          <p className="mx-auto mb-8 max-w-xl text-sm leading-6 text-muted-text md:text-base">
            We’ve placed you in the live queue. Arrive close to your estimated time and keep an eye on the status board for updates.
          </p>

          <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[28px] bg-ink p-6 text-left text-white shadow-2xl shadow-ink/15">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/45">Token</p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-7xl font-serif leading-none">{bookingSuccess.token_number}</span>
                <span className="mb-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">Live queue</span>
              </div>
              <div className="mt-8 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">Estimated time</p>
                  <p className="mt-2 text-2xl font-semibold">{bookingSuccess.estimated_time.slice(0, 5)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">Booking reference</p>
                  <p className="mt-2 text-lg font-semibold">{bookingSuccess.booking_ref}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-blue-mid">Patient summary</p>
              <div className="mt-5 space-y-4 text-sm text-ink">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-text">Patient</p>
                  <p className="mt-1 text-base font-semibold">{bookingSuccess.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-text">Arrival guidance</p>
                  <p className="mt-1 leading-6 text-muted-text">Please arrive 10 minutes early with prior prescriptions or reports if available.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-muted-text">
                  You’ll receive faster updates by checking the public live board before heading to the clinic.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={onClose} className="btn-dark min-w-[180px] justify-center !rounded-2xl !px-8 !py-4">Done</button>
            <button onClick={() => setBookingSuccess(null)} className="btn-outline min-w-[180px] justify-center !rounded-2xl !px-8 !py-4">Book another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.32)] md:p-8">
          <div className="mb-8 flex flex-col gap-5 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-blue-mid">Smart booking flow</p>
                <h2 className="text-3xl font-serif font-medium text-ink md:text-4xl">Book your clinic token in minutes.</h2>
              </div>
              <div className="rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-muted-text">
                Step {currentStep} of {steps.length}
              </div>
            </div>

            <div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-primary via-blue-mid to-teal-primary transition-all duration-500" style={{ width: `${completionPercent}%` }}></div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {steps.map((step) => {
                  const isActive = currentStep === step.id;
                  const isDone = currentStep > step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        if (step.id < currentStep || validateStep()) {
                          setCurrentStep(step.id);
                        }
                      }}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? 'border-blue-primary/30 bg-blue-50/60 shadow-sm'
                          : isDone
                            ? 'border-emerald-200 bg-emerald-50/70'
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${isActive ? 'bg-blue-primary text-white' : isDone ? 'bg-teal-primary text-white' : 'bg-white text-muted-text border border-slate-200'}`}>
                          {isDone ? '✓' : step.id}
                        </div>
                        <p className="text-sm font-semibold text-ink">{step.title}</p>
                      </div>
                      <p className="text-sm leading-6 text-muted-text">{step.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-6">
            {currentStep === 1 && (
              <div className="grid gap-5 md:grid-cols-2 animate-fade-in">
                <div className="md:col-span-2">
                  <label className="form-label-premium">Patient name</label>
                  <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="input-premium" placeholder="Ex. Shiva Kumar" required />
                </div>
                <div>
                  <label className="form-label-premium">Phone number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-premium" placeholder="Mobile number" required />
                </div>
                <div>
                  <label className="form-label-premium">Email address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-premium" placeholder="For a digital reminder" />
                </div>
                <div className="md:col-span-2 rounded-[24px] border border-blue-100 bg-[linear-gradient(135deg,rgba(239,246,255,0.9),rgba(248,250,252,0.95))] p-5">
                  <p className="text-sm font-semibold text-ink">A calmer arrival experience.</p>
                  <p className="mt-2 text-sm leading-6 text-muted-text">We use your phone number to help you track your place in the live queue and reduce waiting inside the clinic.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-5 md:grid-cols-2 animate-fade-in">
                <div className="md:col-span-2">
                  <label className="form-label-premium">Select specialist</label>
                  <select name="doctorId" value={formData.doctorId} onChange={handleChange} className="input-premium" required>
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name} ({doctor.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label-premium">Session</label>
                  <select name="sessionId" value={formData.sessionId} onChange={handleChange} className="input-premium disabled:cursor-not-allowed disabled:opacity-50" disabled={!formData.doctorId} required>
                    <option value="">Select session...</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>{session.session_type} ({session.start_time.slice(0, 5)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label-premium">Preferred date</label>
                  <select name="date" value={formData.date} onChange={handleChange} className="input-premium" required>
                    <option value="">Choose date...</option>
                    {getNext3Days().map((date) => (
                      <option key={date} value={date}>{formatDisplayDate(date)}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="form-label-premium">Reason for visit</label>
                  <textarea name="reasonForVisit" value={formData.reasonForVisit} onChange={handleChange} rows="4" className="input-premium min-h-[120px] resize-none py-4" placeholder="Add a brief note for the clinic team (optional)."></textarea>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="summary-label">Patient</p>
                      <p className="summary-value">{formData.patientName || '—'}</p>
                    </div>
                    <div>
                      <p className="summary-label">Phone</p>
                      <p className="summary-value">{formData.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="summary-label">Specialist</p>
                      <p className="summary-value">{selectedDoctor ? `${selectedDoctor.name} · ${selectedDoctor.specialty}` : '—'}</p>
                    </div>
                    <div>
                      <p className="summary-label">Session</p>
                      <p className="summary-value">{selectedSession ? `${selectedSession.session_type} · ${selectedSession.start_time.slice(0, 5)}` : '—'}</p>
                    </div>
                    <div>
                      <p className="summary-label">Preferred date</p>
                      <p className="summary-value">{formData.date ? formatDisplayDate(formData.date) : '—'}</p>
                    </div>
                    <div>
                      <p className="summary-label">Contact email</p>
                      <p className="summary-value">{formData.email || 'Not provided'}</p>
                    </div>
                  </div>
                  {formData.reasonForVisit && (
                    <div className="mt-5 border-t border-slate-200 pt-5">
                      <p className="summary-label">Visit note</p>
                      <p className="mt-2 text-sm leading-6 text-muted-text">{formData.reasonForVisit}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-amber-100 bg-amber-50/80 p-5 text-sm leading-6 text-amber-900">
                  Token numbers are assigned automatically after confirmation. Your estimated consultation time will be shown instantly on the next screen.
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={currentStep === 1 ? onClose : handlePreviousStep} className="btn-outline justify-center !rounded-2xl !px-6 !py-3.5">
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              {currentStep < steps.length ? (
                <button type="button" onClick={handleNextStep} className="btn-dark justify-center !rounded-2xl !px-7 !py-3.5">
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-dark justify-center !rounded-2xl !px-7 !py-3.5 disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? 'Confirming booking...' : 'Confirm reservation'}
                </button>
              )}
            </div>
          </form>
        </div>

        <aside className="space-y-5 rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#0f1c33_0%,#13294f_100%)] p-6 text-white shadow-[0_24px_80px_-45px_rgba(15,23,42,0.7)] md:p-8">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-blue-200">Booking concierge</p>
            <h3 className="text-2xl font-serif font-medium">A premium flow built for less waiting.</h3>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/55">Live preview</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Patient</p>
                <p className="mt-2 text-base font-semibold text-white">{formData.patientName || 'Your name will appear here'}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Doctor</p>
                  <p className="mt-2 text-sm font-semibold text-white">{selectedDoctor?.name || 'Choose a specialist'}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Date</p>
                  <p className="mt-2 text-sm font-semibold text-white">{formData.date ? formatDisplayDate(formData.date) : 'Pick your visit day'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm leading-6 text-white/75">
            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-xs font-bold">01</span>
              <div>
                <p className="font-semibold text-white">Structured intake</p>
                <p>Simple step-by-step guidance reduces drop-offs and helps patients complete bookings confidently.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-xs font-bold">02</span>
              <div>
                <p className="font-semibold text-white">Clear review before submission</p>
                <p>Every booking detail is summarized before confirmation, lowering mistakes and support effort.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-xs font-bold">03</span>
              <div>
                <p className="font-semibold text-white">Designed for mobile-first use</p>
                <p>Large tap targets, high contrast, and clear hierarchy make the flow more comfortable on phones.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookToken;
