import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (err) {
      showToast("Could not sync groups", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCode) return;
    setIsJoining(true);
    try {
      await api.post(`/groups/join/${inviteCode}`);
      setInviteCode('');
      showToast("Request sent! Admin must approve you.");
      fetchGroups(); 
    } catch (err) {
      showToast(err.response?.data?.error || "Invalid code or already requested", "error");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-12 relative animate-in fade-in duration-700">
      
      {/* Premium Toast */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-900 border-emerald-800 text-emerald-50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`} />
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Financial Circles</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-3">Overview of your shared wealth</p>
        </div>
        <Link to="/create-group" className="group bg-emerald-600 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2">
          <span className="text-lg">+</span> Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Join Logic */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Have an Invite?</h2>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <input 
                type="text" 
                placeholder="AX72J"
                className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none uppercase font-mono font-black text-emerald-900 text-center text-xl tracking-widest transition-all"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isJoining || !inviteCode}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-xl shadow-slate-100"
              >
                {isJoining ? 'Processing...' : 'Request Access'}
              </button>
            </form>
            <p className="mt-6 text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed text-center">
              Admins will be notified of<br/>your request automatically.
            </p>
          </div>
        </div>

        {/* Right Column: Groups List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 px-4 mb-2">
            <div className="w-2 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Groups ({groups.length})</h3>
          </div>

          {loading ? (
            /* Skeleton Loading */
            [1,2,3].map(i => (
              <div key={i} className="h-28 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
            ))
          ) : groups.length > 0 ? (
            groups.map(group => (
              <Link 
                key={group._id} 
                to={`/group/${group._id}`} 
                className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 flex justify-between items-center overflow-hidden relative"
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-12 -mt-12 opacity-0 group-hover:opacity-40 transition-opacity"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      {group.members.length} Members
                    </span>
                    <span className="text-slate-300 text-[10px] font-medium truncate max-w-[150px]">
                      {group.description || 'No description provided'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:bg-slate-900 group-hover:rotate-45 transition-all duration-500 relative z-10">
                  <svg className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:-rotate-45 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Your circle is empty</p>
              <p className="text-[10px] text-slate-300 font-medium mt-1">Create a group to start managing finances.</p>
            </div>
          )}
        </div>
      </div>
    </div> 
  );
};

export default Dashboard;