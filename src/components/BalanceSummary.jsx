import React, { useMemo } from 'react';

/**
 * BalanceSummary Component - Premium Production Version
 * Calculates net balances with safety checks and skeleton loading.
 */
const BalanceSummary = ({ expenses, members, currentUserId, isAdmin, onRemoveMember, loading }) => {
  
  // Memoized calculation to prevent lag with many expenses
  const { balances, currentUserBalance } = useMemo(() => {
    const netBalances = {}; 

    expenses.forEach((exp) => {
      // Safety check for payer population
      const payerId = exp.paidBy?._id || exp.paidBy;
      if (!payerId) return;
      
      // 1. Credit the person who paid the bill
      netBalances[payerId] = (netBalances[payerId] || 0) + exp.amount;

      // 2. Debit everyone based on their split share
      exp.splits.forEach((split) => {
        const splitUserId = split.user?._id || split.user;
        if (!splitUserId) return;
        netBalances[splitUserId] = (netBalances[splitUserId] || 0) - (split.amount || 0);
      });
    });

    return {
      balances: netBalances,
      currentUserBalance: netBalances[currentUserId] || 0,
    };
  }, [expenses, currentUserId]);

  // --- 1. SKELETON LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-pulse">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="h-2 w-20 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 w-32 bg-slate-200 rounded"></div>
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-slate-100 rounded"></div>
                  <div className="h-2 w-12 bg-slate-50 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-16 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isPositive = currentUserBalance >= 0;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-right duration-500">
      
      {/* 2. Header: User's Personal Net Position */}
      <div className={`p-6 ${isPositive ? 'bg-emerald-50/50' : 'bg-rose-50/50'} border-b border-slate-50`}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Your Net Balance
        </p>
        <div className={`text-3xl font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? '+' : '-'}₦{Math.abs(currentUserBalance).toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-medium italic">
          {currentUserBalance === 0 
            ? "You're all settled up!" 
            : isPositive ? 'Overall, you are owed' : 'Overall, you owe others'}
        </p>
      </div>

      {/* 3. Body: Member Breakdown List */}
      <div className="p-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          Member Breakdown
          <span className="h-[1px] flex-grow bg-slate-100"></span>
        </h4>
        
        <div className="space-y-5">
          {members.map((m, index) => {
            // Safety extraction of user data
            const memberId = m.user?._id || m.user;
            const memberName = m.user?.name || "Member";
            const bal = balances[memberId] || 0;
            const memberIsPositive = bal >= 0;
            const isMe = memberId === currentUserId;

            return (
              <div key={memberId || index} className="flex justify-between items-center group relative">
                {/* Member Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110 
                    ${isMe ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-500'}`}>
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isMe ? 'text-slate-900' : 'text-slate-700'}`}>
                      {memberName} 
                      {isMe && <span className="text-[10px] text-emerald-600 ml-1 font-black underline">YOU</span>}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {m.role || 'MEMBER'}
                    </p>
                  </div>
                </div>

                {/* Balance & Admin Actions */}
                <div className="flex items-center gap-3 text-right">
                  <div className="flex flex-col items-end">
                    <p className={`text-sm font-mono font-black ${bal === 0 ? 'text-slate-300' : memberIsPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {bal === 0 ? '—' : (memberIsPositive ? '+' : '-')}₦{Math.abs(bal).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">
                      {bal === 0 ? 'Settled' : (memberIsPositive ? 'Owed' : 'Owes')}
                    </p>
                  </div>

                  {isAdmin && !isMe && (
                    <button 
                      onClick={() => onRemoveMember(memberId)}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-200"
                      title="Remove Member"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Footer */}
      <div className="px-6 pb-6 mt-2">
        <button className="w-full py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95">
          Generate Full Statement
        </button>
      </div>
    </div>
  );
};

export default BalanceSummary;