import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from '../services/toast';

const Profile = () => {
  const stored = localStorage.getItem('user');
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [phoneInput, setPhoneInput] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Refresh from server on mount so phone is up-to-date even if localStorage is stale
  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setPhoneInput(data.user.phone || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Even if the server call fails, we still log out locally.
    }
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      const { data } = await api.post('/auth/phone', { phone: phoneInput.trim() || '' });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setEditingPhone(false);
      toast.success(phoneInput.trim() ? 'Phone saved' : 'Phone removed');
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't save phone");
    } finally {
      setSavingPhone(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-500 font-bold">You're not signed in.</p>
      </div>
    );
  }

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    // 2348012345678 → 0801 234 5678
    if (phone.startsWith('234') && phone.length === 13) {
      const local = '0' + phone.slice(3);
      return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12 px-4 relative animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden text-center">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl font-black text-white shadow-2xl shadow-emerald-200 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
            <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
          <p className="text-slate-500 font-medium text-sm mt-2 break-all">{user.email}</p>
        </div>

        {/* Phone row */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100/50 text-left mb-4 relative z-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Phone (for ajo reminders)</p>
          {editingPhone ? (
            <div className="space-y-2">
              <input
                type="tel"
                inputMode="tel"
                placeholder="0801 234 5678"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingPhone(false); setPhoneInput(user.phone || ''); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
                  disabled={savingPhone}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  className="flex-[2] bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-60"
                >
                  {savingPhone ? 'Saving…' : 'Save phone'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {user.phone ? (
                <p className="text-sm font-bold text-slate-800">{formatPhoneForDisplay(user.phone)}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">Not set — add one to get WhatsApp reminders</p>
              )}
              <button
                onClick={() => { setEditingPhone(true); setPhoneInput(user.phone || ''); }}
                className="text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all shrink-0"
              >
                {user.phone ? 'Change' : 'Add'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100/50 text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Account</p>
            <p className="text-sm font-bold text-slate-800">Free</p>
          </div>
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100/50 text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Currency</p>
            <p className="text-sm font-bold text-slate-800">Naira (₦)</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
