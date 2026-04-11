import React from 'react';

const ExpenseList = ({ expenses }) => {
  // Helper to format dates into "Today", "Yesterday", or Date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction History</h3>
        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {expenses.length} Total
        </span>
      </div>

      <div className="space-y-3">
        {expenses.map((exp) => {
          const isSettlement = exp.description?.toLowerCase().includes('settle');
          const payerName = exp.paidBy?.name || "Member";
          const initials = payerName.split(' ').map(n => n[0]).join('').toUpperCase();

          return (
            <div 
              key={exp._id} 
              className="group bg-white p-4 rounded-[2rem] border border-slate-50 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">
                {/* Avatar / Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110 ${
                  isSettlement 
                  ? 'bg-amber-50 text-amber-600' 
                  : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isSettlement ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-sm leading-tight mb-1">
                    {exp.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {isSettlement ? 'Payment' : `Paid by ${payerName}`}
                    </p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {formatDate(exp.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Styling */}
              <div className="text-right">
                <p className={`text-sm font-black tracking-tight ${
                  isSettlement ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  ₦{exp.amount.toLocaleString()}
                </p>
                {isSettlement && (
                  <span className="text-[8px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                    Settle
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {expenses.length === 0 && (
          <div className="py-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;