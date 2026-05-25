import React, { useState, useMemo } from 'react';
import api from '../services/api';

const SettleUpModal = ({ isOpen, onClose, members, expenses, currentUserId, groupId, onSettled, showToast }) => {
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const myDebts = useMemo(() => {
    const debts = {};
    expenses.forEach((exp) => {
      const payerId = exp.paidBy?._id || exp.paidBy;
      const mySplit = exp.splits?.find((s) => (s.user?._id || s.user) === currentUserId);

      if (payerId !== currentUserId && mySplit) {
        debts[payerId] = (debts[payerId] || 0) + mySplit.amount;
      } else if (payerId === currentUserId) {
        exp.splits?.forEach((s) => {
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
      return showToast('Pick a person and enter an amount.', 'error');
    }

    setLoading(true);
    try {
      const recipientName =
        members.find((m) => (m.user?._id || m.user) === selectedRecipient)?.user?.name || 'them';

      await api.post('/expenses', {
        groupId,
        description: `Paid ${recipientName}`,
        amount: Number(amount),
        paidBy: currentUserId,
        splitType: 'SETTLEMENT',
        recipientId: selectedRecipient,
      });

      showToast(`Recorded ₦${Number(amount).toLocaleString()} paid to ${recipientName}`);
      onSettled();
      onClose();
      setAmount('');
      setSelectedRecipient('');
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't record that payment", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[210] p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-slate-100 relative overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">

        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Pay someone back</h2>
          <p className="text-sm text-slate-500 mt-1">Record cash or transfers you've already made outside the app.</p>
        </div>

        <form onSubmit={handleSettle} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 ml-1">Who did you pay?</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none text-sm font-bold text-slate-700 transition-all"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                required
              >
                <option value="">Choose a person</option>
                {members
                  .filter((m) => (m.user?._id || m.user) !== currentUserId)
                  .map((m) => {
                    const id = m.user?._id || m.user;
                    const debt = myDebts[id] || 0;
                    return (
                      <option key={id} value={id}>
                        {m.user?.name} {debt > 0 ? `— you owe ₦${debt.toLocaleString()}` : ''}
                      </option>
                    );
                  })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 ml-1">How much did you pay?</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg">₦</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-xl tracking-tight transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {selectedRecipient && myDebts[selectedRecipient] > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(myDebts[selectedRecipient])}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Pay all
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRecipient || !amount}
              className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving…
                </div>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
          This only records the payment. It doesn't actually move money.
        </p>
      </div>
    </div>
  );
};

export default SettleUpModal;
