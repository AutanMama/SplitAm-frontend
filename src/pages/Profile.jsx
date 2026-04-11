import React, { useState } from 'react';

const Profile = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const handleLogout = () => {
    localStorage.clear();
    // Use window.location for a hard reset of the app state
    window.location.href = '/login';
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you absolutely sure? This will permanently delete your financial history and remove you from all Ajo cycles.")) {
      showToast("Request sent to admin", "error");
      // Logic for account deletion would go here
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-900 border-emerald-800 text-emerald-50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`} />
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden text-center">
        {/* Decorative Background Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        
        {/* Profile Avatar Section */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-emerald-200 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
            <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">{user.email}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50 text-left group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Type</p>
            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
              Premium Member
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            </p>
          </div>
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50 text-left group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Currency</p>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">Naira (₦) — NGN</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-[0.98]"
          >
            Logout of SplitAm
          </button>
          
          <button 
            onClick={handleDeleteAccount}
            className="w-full py-4 text-rose-400 text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>

      <p className="mt-12 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">
        SplitAm v3.0.4 • Secure Encryption Active
      </p>
    </div>
  );
};

export default Profile;