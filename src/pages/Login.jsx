import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from '../services/toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);

      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6 relative animate-in fade-in duration-700">
      
      <div className="max-w-md w-full bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-50 rounded-tr-full opacity-40"></div>

        <div className="relative z-10">
          <header className="mb-8 md:mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-2">Run ajo with your guys, your office, your family.</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-4">Email</label>
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
              <label className="text-xs font-bold text-slate-600 ml-4">Password</label>
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
              className="w-full bg-slate-900 text-white font-bold text-sm py-4 md:py-5 rounded-2xl shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Signing in…
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <footer className="mt-8 md:mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?
              <Link to="/register" className="text-emerald-600 ml-2 font-bold hover:underline">Create one</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;