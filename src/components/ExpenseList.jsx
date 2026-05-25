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
    <div className="space-y-5">
      <div className="flex justify-between items-center px-2 md:px-4">
        <h3 className="text-sm font-bold text-slate-600">Recent activity</h3>
        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
          {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
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

                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">
                    {exp.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-slate-500">
                      {isSettlement ? 'Direct payment' : `Paid by ${payerName}`}
                    </p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <p className="text-xs text-slate-400">
                      {formatDate(exp.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-sm font-black tracking-tight ${
                  isSettlement ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  ₦{exp.amount.toLocaleString()}
                </p>
                {isSettlement && (
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    Payment
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {expenses.length === 0 && (
          <div className="py-12 md:py-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 px-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-bold text-slate-600">No expenses yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first expense above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;