import React, { useState } from 'react';
import api from '../services/api';
import { toast } from '../services/toast';

const showToast = (message, type = 'success') =>
  type === 'error' ? toast.error(message) : toast.success(message);

const AddMemberModal = ({ groupId, inviteCode, isOpen, onClose, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      showToast('Invite code copied. Paste it into a chat.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast("Couldn't copy. Try selecting the code manually.", 'error');
    }
  };

  const handleAddByEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/groups/add-member', { groupId, email: email.trim() });
      showToast(`${email} was added to the group`);
      setEmail('');
      onMemberAdded();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Couldn't add that person. Are they signed up?";
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[210] p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-emerald-50 relative overflow-y-auto max-h-[85dvh] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" aria-hidden="true" />

        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10 gap-4">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-black text-emerald-900 tracking-tight">Add members</h2>
            <p className="text-sm text-slate-500 mt-1">Share the code or invite by email.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl mb-6 border border-emerald-100/50 relative z-10">
          <p className="text-sm font-bold text-emerald-800 mb-2">Invite code</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl md:text-3xl font-mono font-black text-emerald-900 tracking-tighter break-all">
              {inviteCode}
            </span>
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-400 active:scale-95'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">Anyone with this code can join.</p>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100"></span>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-bold text-slate-400">or invite by email</span>
          </div>
        </div>

        <form onSubmit={handleAddByEmail} className="space-y-3">
          <input
            type="email"
            required
            placeholder="friend@example.com"
            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            disabled={loading || !email.trim()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none"
          >
            {loading ? 'Adding…' : 'Add to group'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          They need to be signed up on SplitAm already.
        </p>
      </div>
    </div>
  );
};

export default AddMemberModal;
