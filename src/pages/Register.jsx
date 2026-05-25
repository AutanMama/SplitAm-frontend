import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from '../services/toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);

      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Account created. Welcome, ${data.user.name.split(' ')[0]}!`);

      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't create your account. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-3 py-6 md:p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="max-w-md w-full bg-white p-6 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-br-full -ml-10 -mt-10 opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-slate-50 rounded-tl-full opacity-40"></div>

        <div className="relative z-10">
          <header className="mb-8 md:mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Create your account</h2>
            <p className="text-slate-500 text-sm mt-2">Save together. No drama. No chasing.</p>
          </header>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-4">Full name</label>
              <input
                type="text"
                placeholder="e.g. Chinedu Okafor"
                maxLength={60}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-4">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-4">
                Phone <span className="text-slate-400 font-normal">(optional, for reminders)</span>
              </label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="0801 234 5678"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <p className="text-xs text-slate-400 ml-4 mt-1">
                We'll send WhatsApp reminders when your ajo payment is due. You can add this later.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 ml-4">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                minLength={8}
                maxLength={128}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <p className="text-xs text-slate-400 ml-4 mt-1">At least 8 characters.</p>
            </div>

            <button
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold text-sm py-4 md:py-5 rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Creating your account…
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <footer className="mt-8 md:mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:underline whitespace-nowrap">
                Sign in
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;