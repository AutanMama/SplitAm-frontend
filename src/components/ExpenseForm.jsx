import React, { useState } from 'react';
import api from '../services/api';
import { addToOfflineQueue } from '../services/offlineSync';

const ExpenseForm = ({ groupId, onExpenseAdded, showToast }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation check before even hitting the API
    if (Number(amount) <= 0) {
      return showToast("Please enter a valid amount", "error");
    }

    const payload = { 
      groupId, 
      description: desc, 
      amount: Number(amount), 
      splitType: 'EQUAL' 
    };

    // Handle Offline State
    if (!navigator.onLine) {
      addToOfflineQueue('CREATE_EXPENSE', payload);
      showToast("Offline: Expense saved and will sync later!", "success");
      setDesc(''); 
      setAmount('');
      // Optimistically update the UI if possible
      onExpenseAdded(); 
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/expenses', payload);
      showToast(`Added: ${desc}`);
      setDesc(''); 
      setAmount('');
      onExpenseAdded(); // Refresh parent list
    } catch (err) {
      showToast(err.response?.data?.error || "Error adding expense", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-emerald-900 p-8 rounded-[2rem] shadow-2xl shadow-emerald-900/20 relative overflow-hidden transition-all border border-emerald-800">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-6 bg-emerald-400 rounded-full"></div>
          <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Add New Expense</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Description Input */}
          <div className="group">
            <input 
              className="w-full bg-emerald-800/50 border border-emerald-700/50 text-white rounded-2xl p-4 placeholder-emerald-400 outline-none focus:bg-emerald-800 focus:border-emerald-500 transition-all text-sm font-medium"
              placeholder="What's this for? (e.g. Fuel, Dinner)"
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              required
            />
          </div>

          {/* Amount Input */}
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-lg">₦</span>
            <input 
              type="number"
              step="0.01"
              className="w-full bg-emerald-800/50 border border-emerald-700/50 text-white rounded-2xl p-4 pl-12 placeholder-emerald-400 outline-none focus:bg-emerald-800 focus:border-emerald-500 transition-all text-xl font-black tracking-tight"
              placeholder="0.00"
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`mt-2 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isSubmitting 
              ? 'bg-emerald-800 text-emerald-600 cursor-not-allowed' 
              : 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-emerald-950/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                Recording...
              </>
            ) : (
              'Split Expense'
            )}
          </button>
        </form>
      </div>

      <p className="mt-4 text-[9px] text-emerald-400 font-bold uppercase tracking-widest text-center opacity-60">
        This amount will be split equally among all members
      </p>
    </div>
  );
};

export default ExpenseForm;