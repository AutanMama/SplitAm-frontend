import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { addToOfflineQueue } from '../services/offlineSync';

const CreateGroup = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { name, description };

    if (!navigator.onLine) {
      addToOfflineQueue('CREATE_GROUP', payload);
      showToast("Offline: Group will sync when you're back!", "success");
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    try {
      await api.post('/groups', payload);
      showToast(`Group "${name}" created!`);
      // Give the user a moment to see the success toast before redirecting
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create group", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative">
      
      {/* Premium Toast */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-900 border-emerald-800 text-emerald-50'
        }`}>
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-slate-50 relative overflow-hidden">
        {/* Aesthetic Background Shape */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 opacity-60"></div>

        <div className="relative z-10">
          <header className="mb-8">
            <h2 className="text-3xl font-black text-emerald-900 tracking-tight leading-none">New Group</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Start sharing expenses</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 placeholder-slate-300"
                placeholder="e.g. Apartment Mates"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
              <textarea
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder-slate-300 resize-none"
                placeholder="What is this group for?"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-colors"
              >
                Go Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;