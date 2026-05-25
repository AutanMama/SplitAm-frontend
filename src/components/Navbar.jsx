import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = !!storedUser; // legacy variable name; truthy when logged in

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Even if the request fails (offline, network), still clear local state
    }
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100/50 py-3 px-8 flex justify-around items-center z-[200] md:top-0 md:bottom-auto md:border-t-0 md:border-b md:h-20 md:px-12 shadow-2xl shadow-slate-200/20">
      
      {/* Desktop Logo */}
      <Link to="/" className="hidden md:flex items-center gap-2 group">
        <div className="w-8 h-8 bg-emerald-600 rounded-xl rotate-3 group-hover:rotate-0 transition-transform duration-300 flex items-center justify-center text-white font-black text-xs">S</div>
        <span className="font-black text-slate-900 text-xl tracking-tighter">
          Split<span className="text-emerald-600">Am.</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 w-full md:w-auto justify-around md:justify-end md:gap-10">
        {token ? (
          <>
            {/* Nav Item: Groups */}
            <Link 
              to="/" 
              className={`flex flex-col items-center gap-1 group relative ${isActive('/') ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <span className="text-xs font-bold transition-colors group-hover:text-emerald-500">Groups</span>
              {isActive('/') && <div className="w-1 h-1 bg-emerald-600 rounded-full absolute -bottom-2"></div>}
            </Link>

            {/* Nav Item: Create (The 'Plus' Action) */}
            <Link 
              to="/create-group" 
              className={`flex flex-col items-center gap-1 group relative ${isActive('/create-group') ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <span className="text-xs font-bold transition-colors group-hover:text-emerald-500">New</span>
              {isActive('/create-group') && <div className="w-1 h-1 bg-emerald-600 rounded-full absolute -bottom-2"></div>}
            </Link>

            {/* Nav Item: Profile Avatar */}
            <Link 
              to="/profile"
              className="relative group transition-transform active:scale-90"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-300 shadow-lg
                ${isActive('/profile') 
                  ? 'bg-emerald-600 text-white shadow-emerald-200 -rotate-3' 
                  : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'}`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {isActive('/profile') && <div className="w-1 h-1 bg-emerald-600 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2"></div>}
            </Link>

            {/* Desktop Logout - Styled as a ghost button */}
            <button
              onClick={logout}
              className="hidden md:block text-xs font-bold text-rose-400 hover:text-rose-600 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-rose-100"
            >
              Sign out
            </button>
          </>
        ) : (
          /* LOGGED OUT STATE */
          <div className="flex items-center gap-3 w-full justify-center md:justify-end">
            {!isAuthPage ? (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 transition-all">
                  Sign in
                </Link>
                <Link to="/register" className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-emerald-600 active:scale-95 transition-all">
                  Sign up
                </Link>
              </>
            ) : (
              <Link to={location.pathname === '/login' ? "/register" : "/login"} className="group flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
                  {location.pathname === '/login' ? "New here?" : "Have an account?"}
                </span>
                <span className="text-sm font-bold text-emerald-600 underline decoration-2 underline-offset-4">
                  {location.pathname === '/login' ? "Sign up" : "Sign in"}
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;