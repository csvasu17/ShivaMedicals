import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const StaffAttendance = () => {
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'report'
  
  // Mark Attendance State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Report State
  const [reportStartDate, setReportStartDate] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0] // First day of current month
  );
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    if (viewMode === 'mark') {
      fetchAttendance(selectedDate);
    } else {
      fetchReport(reportStartDate, reportEndDate);
    }
  }, [viewMode, selectedDate, reportStartDate, reportEndDate]);

  const fetchAttendance = async (date) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/attendance?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReport = async (start, end) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/attendance/report?startDate=${start}&endDate=${end}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance report', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (staffId, status) => {
    setAttendanceData(prev => prev.map(item => 
      item.staff_id === staffId ? { ...item, status } : item
    ));
    setHasUnsavedChanges(true);
  };

  const submitAttendance = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, attendance: attendanceData })
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        showToast('success', 'Attendance submitted successfully!');
      } else {
        console.error('Failed to submit attendance');
        showToast('error', 'Failed to submit attendance. Please ensure your backend is restarted.');
      }
    } catch (err) {
      console.error('Failed to submit attendance', err);
      showToast('error', 'Network error: Could not submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-3xl font-serif font-medium text-ink">Staff Attendance</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('mark')}
            className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${
              viewMode === 'mark' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mark Attendance
          </button>
          <button 
            onClick={() => setViewMode('report')}
            className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${
              viewMode === 'report' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            View Report
          </button>
        </div>
      </div>

      {viewMode === 'mark' ? (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-muted-text uppercase tracking-wider">Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-ink font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <button
               onClick={submitAttendance}
               disabled={isSubmitting || !hasUnsavedChanges || attendanceData.length === 0}
               className={`h-11 px-6 rounded-xl flex items-center gap-2 font-bold text-[13px] transition-all active:scale-95 ${
                 hasUnsavedChanges 
                   ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' 
                   : 'bg-slate-100 text-slate-400 cursor-not-allowed'
               }`}
            >
               {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
               )}
               Submit Attendance
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No staff members found.</div>
          ) : (
            <div className="space-y-4">
              {attendanceData.map((staff) => (
                <div key={staff.staff_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-ink mb-2">@{staff.username}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                        {staff.role}
                      </span>
                      {staff.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium border-l border-slate-200 pl-3">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          {staff.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleStatusChange(staff.staff_id, 'present')}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 ${
                        staff.status === 'present'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500 hover:text-emerald-500'
                      }`}
                    >
                      {staff.status === 'present' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                      Present
                    </button>
                    <button 
                      onClick={() => handleStatusChange(staff.staff_id, 'absent')}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 ${
                        staff.status === 'absent'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-red-500 hover:text-red-500'
                      }`}
                    >
                      {staff.status === 'absent' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-muted-text uppercase tracking-wider">From</label>
              <input 
                type="date" 
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-ink font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-muted-text uppercase tracking-wider">To</label>
              <input 
                type="date" 
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-ink font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No report data found for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="pb-4 px-2 sm:px-4 font-bold text-muted-text uppercase tracking-wider text-[10px] sm:text-xs border-b border-slate-100 w-12 sm:w-16">S.No</th>
                    <th className="pb-4 px-2 sm:px-4 font-bold text-muted-text uppercase tracking-wider text-[10px] sm:text-xs border-b border-slate-100">Staff Name</th>
                    <th className="pb-4 px-2 sm:px-4 font-bold text-emerald-600 uppercase tracking-wider text-[10px] sm:text-xs border-b border-slate-100">Present Days</th>
                    <th className="pb-4 px-2 sm:px-4 font-bold text-red-600 uppercase tracking-wider text-[10px] sm:text-xs border-b border-slate-100">Absent Days</th>
                    <th className="hidden sm:table-cell pb-4 px-2 sm:px-4 font-bold text-blue-600 uppercase tracking-wider text-[10px] sm:text-xs border-b border-slate-100">Total Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 sm:px-4 text-[13px] sm:text-sm font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-4 px-2 sm:px-4 font-bold text-ink text-[13px] sm:text-base">{row.name}</td>
                      <td className="py-4 px-2 sm:px-4 font-bold text-emerald-600 text-[13px] sm:text-base">{row.present_days}</td>
                      <td className="py-4 px-2 sm:px-4 font-bold text-red-500 text-[13px] sm:text-base">{row.absent_days}</td>
                      <td className="hidden sm:table-cell py-4 px-2 sm:px-4 font-bold text-blue-600 text-[13px] sm:text-base">
                        {parseInt(row.present_days) + parseInt(row.absent_days)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Custom Toast Message */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[5000] animate-fade-in">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-500/10' 
              : 'bg-red-50 border-red-100 text-red-700 shadow-red-500/10'
          }`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-200/50' : 'bg-red-200/50'
            }`}>
              {toast.type === 'success' ? (
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </div>
            <p className="font-bold text-[14px]">{toast.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;
