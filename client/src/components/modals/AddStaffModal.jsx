import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants/api';

const AddStaffModal = ({ isOpen, onClose, onStaffAdded, editStaff }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    role: 'staff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editStaff) {
      setFormData({
        name: editStaff.name || '',
        phone: editStaff.phone || '',
        username: editStaff.username || '',
        password: '', // Don't show password
        role: editStaff.role || 'staff'
      });
    } else {
      setFormData({ name: '', phone: '', username: '', password: '', role: 'staff' });
    }
  }, [editStaff, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = editStaff 
        ? `${API_URL}/api/admin/staff/${editStaff.id}`
        : `${API_URL}/api/admin/staff`;
      
      const response = await fetch(url, {
        method: editStaff ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process staff');
      }

      onStaffAdded(data);
      onClose();
      // Reset form
      setFormData({ name: '', phone: '', username: '', password: '', role: 'staff' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4 pb-12 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden animate-slide-up"
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
            <h2 className="text-3xl font-serif text-ink font-semibold">{editStaff ? 'Edit Staff Member' : 'Add New Staff'}</h2>
            <p className="text-muted-text text-[13px] mt-1">{editStaff ? 'Update profile information for this team member.' : 'Create a user account for a new team member.'}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[13px] font-bold flex items-center gap-3 animate-fade-in shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-emerald-500 transition-all shadow-sm">
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phone Number</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-emerald-500 transition-all shadow-sm">
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Username</label>
                <div className={`h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-emerald-500 transition-all shadow-sm ${editStaff ? 'opacity-50' : ''}`}>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    readOnly={!!editStaff}
                    className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
                <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-emerald-500 transition-all shadow-sm">
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editStaff ? 'Leave blank to keep' : '••••••••'}
                    className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full"
                    required={!editStaff}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Role</label>
              <div className="h-14 bg-white border border-slate-200 rounded-2xl flex items-center px-4 relative group focus-within:border-emerald-500 transition-all shadow-sm">
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none font-bold text-ink text-sm w-full cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%230A0F1E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_center] bg-no-repeat"
                >
                  <option value="staff">Staff Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 h-14 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 active:scale-95"
            >
              {loading ? (editStaff ? 'Updating...' : 'Creating...') : (editStaff ? 'Save Changes' : 'Create Staff Member')}
            </button>
          </form>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up {
              animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}} />
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
