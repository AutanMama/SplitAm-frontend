import React, { useMemo } from 'react';

const BalanceSummary = ({ expenses, members, currentUserId, isAdmin, onRemoveMember, loading }) => {

  const { balances, currentUserBalance } = useMemo(() => {
    const netBalances = {};

    expenses.forEach((exp) => {
      const payerId = exp.paidBy?._id || exp.paidBy;
      if (!payerId) return;

      netBalances[payerId] = (netBalances[payerId] || 0) + exp.amount;

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
  const isEven = Math.abs(currentUserBalance) < 1;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-right duration-500">

      <div className={`p-6 ${isEven ? 'bg-slate-50/50' : isPositive ? 'bg-emerald-50/50' : 'bg-rose-50/50'} border-b border-slate-50`}>
        <p className="text-xs font-bold text-slate-500 mb-1">Your balance</p>
        <div className={`text-3xl font-black ${isEven ? 'text-slate-700' : isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isEven ? '₦0' : `${isPositive ? '+' : '-'}₦${Math.abs(currentUserBalance).toLocaleString()}`}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {isEven
            ? "You're all settled up."
            : isPositive
              ? 'The group owes you this much.'
              : "You owe the group this much."}
        </p>
      </div>

      <div className="p-6">
        <h4 className="text-xs font-bold text-slate-500 mb-5 flex items-center gap-2">
          Who owes who
          <span className="h-px flex-grow bg-slate-100"></span>
        </h4>

        <div className="space-y-4">
          {members.map((m, index) => {
            const memberId = m.user?._id || m.user;
            const memberName = m.user?.name || 'Member';
            const bal = balances[memberId] || 0;
            const memberIsPositive = bal >= 0;
            const memberIsEven = Math.abs(bal) < 1;
            const isMe = memberId === currentUserId;

            return (
              <div key={memberId || index} className="flex justify-between items-center group relative">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110 shrink-0
                    ${isMe ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-500'}`}>
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${isMe ? 'text-slate-900' : 'text-slate-700'}`}>
                      {memberName}
                      {isMe && <span className="text-xs text-emerald-600 ml-2 font-bold">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{m.role === 'ADMIN' ? 'Admin' : 'Member'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right shrink-0">
                  <div className="flex flex-col items-end">
                    <p className={`text-sm font-mono font-black ${memberIsEven ? 'text-slate-300' : memberIsPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {memberIsEven ? '—' : `${memberIsPositive ? '+' : '-'}₦${Math.abs(bal).toLocaleString()}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {memberIsEven ? 'Settled' : memberIsPositive ? 'Is owed' : 'Owes'}
                    </p>
                  </div>

                  {isAdmin && !isMe && (
                    <button
                      onClick={() => onRemoveMember(memberId)}
                      className="opacity-0 group-hover:opacity-100 ml-1 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-200"
                      title="Remove this person from the group"
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
    </div>
  );
};

export default BalanceSummary;
