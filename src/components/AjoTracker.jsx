import React from 'react';
import api from '../services/api';

const AjoTracker = ({ ajo, members, onUpdate, isAdmin }) => {
  const currentUserId = JSON.parse(localStorage.getItem('user')).id;

  // 1. Claim a slot
  const handleClaim = async (index) => {
    try {
      await api.post('/ajo/claim', { ajoId: ajo._id, slotIndex: index });
      onUpdate(); 
    } catch (err) {
      alert(err.response?.data?.error || "Selection failed");
    }
  };

  // 2. Pay contribution
  const handlePay = async () => {
    try {
      await api.post('/ajo/contribute', { 
        ajoId: ajo._id, 
        amount: ajo.contributionAmount 
      });
      onUpdate();
    } catch (err) {
      alert("Contribution failed");
    }
  };

  // 3. Admin: Mark pot as disbursed (sent to winner)
  const handleDisburse = async (slotIndex) => {
    if (!window.confirm("Verify: Have you sent the total pot to this member?")) return;
    try {
      await api.post('/ajo/disburse', { ajoId: ajo._id, slotIndex });
      onUpdate();
    } catch (err) {
      alert("Failed to record payout");
    }
  };

  const totalPot = ajo.contributionAmount * ajo.rotation.length;

  return (
    <div className="bg-white rounded-[2rem] border border-emerald-100 p-6 shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-emerald-900 font-black text-sm uppercase tracking-widest">{ajo.title}</h3>
          <p className="text-[10px] text-slate-400 font-bold">₦{ajo.contributionAmount.toLocaleString()} / member</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          Month {ajo.currentCycle || 1}
        </div>
      </div>

      {/* Rotation List */}
      <div className="space-y-3">
        {ajo.rotation.map((slot, index) => {
          const isTaken = slot.user;
          const memberId = slot.user?._id || slot.user;
          const isMe = memberId === currentUserId;
          const hasPaid = ajo.contributions?.some(c => (c.user?._id === memberId || c.user === memberId));
          const isAlreadyPaidOut = slot.isPaidOut;

          return (
            <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              isMe ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 w-4">#{index + 1}</span>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {isTaken ? (slot.user.name || "Member") : "Available Slot"}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                    {isAlreadyPaidOut ? "Pot Received ✓" : (isTaken ? (hasPaid ? "Payment Verified" : "Awaiting Funds") : "Unclaimed")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* 1. Claim Logic */}
                {!isTaken && (
                  <button onClick={() => handleClaim(index)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-700 shadow-md transition-all active:scale-95">
                    CLAIM
                  </button>
                )}

                {/* 2. Admin Disburse Button (Visible only to admin for the current cycle) */}
                {isAdmin && isTaken && !isAlreadyPaidOut && (index + 1 === ajo.currentCycle) && (
                  <button 
                    onClick={() => handleDisburse(index)}
                    className="bg-amber-500 text-white px-3 py-2 rounded-xl text-[9px] font-black shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95"
                  >
                    DISBURSE POT
                  </button>
                )}

                {/* 3. User Pay Button */}
                {isMe && isTaken && !hasPaid && (
                  <button onClick={handlePay} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-600 transition-all active:scale-95">
                    PAY
                  </button>
                )}

                {/* 4. Status Checkmark */}
                {hasPaid && !isAlreadyPaidOut && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pot</span>
          <p className="text-sm font-black text-emerald-600">₦{totalPot.toLocaleString()}</p>
        </div>
        {isAdmin && (
           <div className="text-right">
             <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase">Admin Controls</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default AjoTracker;