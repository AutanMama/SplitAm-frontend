import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const navigate = useNavigate();

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Small delay for UX so it doesn't just "snap" away
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      showToast(err.response?.data?.error || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6 relative animate-in fade-in duration-700">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-3 animate-in slide-in-from-top-10 duration-300">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="max-w-md w-full bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-50 rounded-tr-full opacity-40"></div>

        <div className="relative z-10">
          <header className="mb-10 text-center">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Secure Access
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Welcome Back.</h2>
            <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">Sign in to your account</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
              <input 
                type="email" 
                placeholder="name@email.com" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : 'Enter Dashboard'}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">
              Don't have an account? 
              <Link to="/register" className="text-emerald-600 ml-2 hover:underline">Register Now</Link>
            </p>
          </footer>
        </div>
      </div>

      <p className="mt-8 text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">
        SplitAm Financial Services • 2026
      </p>
    </div>
  );
};

export default Login;