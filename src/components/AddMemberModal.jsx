import React, { useState } from 'react';
import api from '../services/api';

const AddMemberModal = ({ groupId, inviteCode, isOpen, onClose, onMemberAdded, showToast }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. Handle Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    showToast("Invite code copied to clipboard!");
    
    // Reset "Copied" text after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. Handle Add by Email
  const handleAddByEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/groups/add-member', { groupId, email });
      showToast(`${email} added to the group!`);
      setEmail('');
      onMemberAdded(); // Refresh parent data
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "User not found or already in group";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-emerald-50 relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full opacity-50 blur-3xl"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-emerald-900 tracking-tight">Invite Friends</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Grow your circle</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Share Invite Code Section */}
        <div className="bg-emerald-50/50 p-6 rounded-[2rem] mb-8 border border-emerald-100/50 group">
          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.15em] mb-3">Share This Code</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-3xl font-mono font-black text-emerald-900 tracking-tighter">
              {inviteCode}
            </span>
            <button 
              onClick={handleCopy}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-sm ${
                copied 
                ? 'bg-emerald-500 text-white scale-95 shadow-emerald-200' 
                : 'bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-400 active:scale-95'
              }`}
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100"></span>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="bg-white px-4 text-slate-300">Or send direct invite</span>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleAddByEmail} className="space-y-4">
          <div className="relative group">
            <input
              type="email"
              required
              placeholder="friend@email.com"
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            disabled={loading || !email}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none"
          >
            {loading ? 'Processing...' : 'Add Member'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Invited members will see this group<br/>in their dashboard immediately.
        </p>
      </div>
    </div>
  );
};

export default AddMemberModal;