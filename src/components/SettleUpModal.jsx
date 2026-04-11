import React, { useState, useMemo } from 'react';
import api from '../services/api';

const SettleUpModal = ({ isOpen, onClose, members, expenses, currentUserId, groupId, onSettled, showToast }) => {
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoize debt calculation so it doesn't re-run on every keystroke
  const myDebts = useMemo(() => {
    const debts = {};
    expenses.forEach(exp => {
      const payerId = exp.paidBy?._id || exp.paidBy;
      const mySplit = exp.splits?.find(s => (s.user?._id || s.user) === currentUserId);
      
      if (payerId !== currentUserId && mySplit) {
        debts[payerId] = (debts[payerId] || 0) + mySplit.amount;
      } else if (payerId === currentUserId) {
        exp.splits?.forEach(s => {
          const otherId = s.user?._id || s.user;
          if (otherId !== currentUserId) {
            debts[otherId] = (debts[otherId] || 0) - s.amount;
          }
        });
      }
    });
    return debts;
  }, [expenses, currentUserId]);

  if (!isOpen) return null;

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!selectedRecipient || !amount || Number(amount) <= 0) {
      return showToast("Please enter a valid recipient and amount", "error");
    }
    
    setLoading(true);
    try {
      const recipientName = members.find(m => (m.user?._id || m.user) === selectedRecipient)?.user?.name || "Member";
      
      await api.post('/expenses', {
        groupId,
        description: `Settle Up: Paid ${recipientName}`,
        amount: Number(amount),
        paidBy: currentUserId,
        splitType: 'SETTLEMENT', // Using a specific type helps the backend/UI distinguish this
        recipientId: selectedRecipient 
      });

      showToast(`Settled ₦${Number(amount).toLocaleString()} with ${recipientName}`);
      onSettled();
      onClose();
      setAmount('');
      setSelectedRecipient('');
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to record settlement", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settle Up</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Clear your balances</p>
        </div>

        <form onSubmit={handleSettle} className="space-y-6">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pay To</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none text-sm font-bold text-slate-700 transition-all"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                required
              >
                <option value="">Choose a member</option>
                {members
                  .filter(m => (m.user?._id || m.user) !== currentUserId)
                  .map(m => {
                    const id = m.user?._id || m.user;
                    const debt = myDebts[id] || 0;
                    return (
                      <option key={id} value={id}>
                        {m.user?.name} {debt > 0 ? `(You owe: ₦${debt.toLocaleString()})` : '(No debt)'}
                      </option>
                    );
                  })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount Paid</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg">₦</span>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-xl tracking-tight transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {/* Quick-fill Button if debt exists */}
              {selectedRecipient && myDebts[selectedRecipient] > 0 && (
                <button 
                  type="button"
                  onClick={() => setAmount(myDebts[selectedRecipient])}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  PAY ALL
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !selectedRecipient || !amount}
              className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Syncing...
                </div>
              ) : 'Confirm Payment'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Recording a settlement creates a special transaction<br/>that offsets existing group balances.
        </p>
      </div>
    </div>
  );
};

export default SettleUpModal;