import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from '../services/toast';

const CreateGroup = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast.error("You're offline. Connect to the internet to create a group.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/groups', { name, description });
      toast.success(`Group "${name}" created`);
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't create the group. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 py-6 md:p-4 relative">
      <div className="max-w-md w-full bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 opacity-60"></div>

        <div className="relative z-10">
          <header className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tight">New Group</h2>
            <p className="text-sm text-slate-500 mt-2">A group is the place where you run an ajo with your guys, your office, or your family.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Group name</label>
              <input
                type="text"
                required
                maxLength={60}
                className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder-slate-300"
                placeholder="e.g. Office Adashi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">
                What's this group for? <span className="text-slate-300 font-normal">(optional)</span>
              </label>
              <textarea
                maxLength={280}
                className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder-slate-300 resize-none"
                placeholder="e.g. 10-month ajo for our office, ₦50k per hand"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none"
              >
                {loading ? 'Creating…' : 'Create Group'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
