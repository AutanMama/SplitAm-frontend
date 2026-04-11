import React, { useState } from 'react';
import api from '../services/api'; // Ensure this points to your api service

const AjoManager = ({ group, isAdmin, showToast, onUpdate }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const { members, _id: groupId, ajoRounds } = group;
  
  const totalRounds = members.length;
  const contributionAmount = group.ajoContributionAmount || 50000; 

  // Toggle payment status via Backend
  const togglePayment = async (memberId) => {
    if (!isAdmin) return showToast("Only Admins can mark payments", "error");
    
    try {
      // Point this to your ajoController's recordContribution route
      const { data } = await api.post(`/ajo/contribute`, {
        ajoId: group.activeAjoId, // You'll need to pass the Ajo ID
        userId: memberId,
        amount: contributionAmount
      });
      
      onUpdate(data); 
      showToast("Payment recorded!");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to sync payment", "error");
    }
  };

  // Find the specific round data from the group object
  const currentRoundData = ajoRounds?.find(r => r.roundNumber === currentRound);
  
  // Calculate stats based on actual DB data
  const paidCount = currentRoundData?.payments?.filter(p => p.status === 'PAID').length || 0;
  const totalPot = paidCount * contributionAmount;

  return (
    <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden mb-8 border border-slate-800">
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black tracking-tighter italic">Ajo Cycle</h2>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Rotating Savings Tracker</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl border border-slate-700">
          <button 
            onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
            className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-30"
            disabled={currentRound === 1}
          >
            ←
          </button>
          <div className="text-center px-2">
            <p className="text-[8px] font-black uppercase text-slate-500">Round</p>
            <p className="text-sm font-black text-emerald-400">{currentRound} <span className="text-slate-500">/ {totalRounds}</span></p>
          </div>
          <button 
            onClick={() => setCurrentRound(Math.min(totalRounds, currentRound + 1))}
            className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-30"
            disabled={currentRound === totalRounds}
          >
            →
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Pot Collected</p>
          <p className="text-xl font-black text-white">₦{totalPot.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Amount</p>
          <p className="text-xl font-black text-emerald-500">₦{(contributionAmount * totalRounds).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-4">Contribution List</h3>
        
        {members.map((member, index) => {
          // Check payment status from the database array
          const paymentRecord = currentRoundData?.payments?.find(p => p.user === member.user._id || p.user._id === member.user._id);
          const isPaid = paymentRecord?.status === 'PAID';
          const isRecipient = (index + 1) === currentRound;

          return (
            <div 
              key={member.user._id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                isPaid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                  isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {member.user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    {member.user.name}
                    {isRecipient && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Recipient</span>
                    )}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    {isPaid ? 'Confirmed' : 'Pending Payment'}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => togglePayment(member.user._id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isPaid 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {isPaid ? 'PAID ✅' : 'MARK PAID'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {paidCount === totalRounds && totalRounds > 0 && (
        <div className="mt-8 bg-emerald-500 p-4 rounded-2xl flex items-center justify-center gap-3 animate-bounce">
          <span className="text-white font-black text-[10px] uppercase tracking-widest">Round {currentRound} Complete! 🏆</span>
        </div>
      )}
    </div>
  );
};

export default AjoManager;