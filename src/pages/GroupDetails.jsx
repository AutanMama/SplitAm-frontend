import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Components
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import BalanceSummary from '../components/BalanceSummary';
import AjoManager from '../components/AjoManager'; // Swapped from AjoTracker
import AddMemberModal from '../components/AddMemberModal';
import SettleUpModal from '../components/SettleUpModal';

/**
 * GroupDetails Page - Final Version
 * Includes: Premium Toasts, Skeleton State, and Privacy Approvals.
 */
const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  // --- State Management ---
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isStartingAjo, setIsStartingAjo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // NEW: Premium Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const user = JSON.parse(localStorage.getItem('user'));

  // Helper to trigger the beautiful notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      // Fetching group details which now includes ajoRounds
      const gRes = await api.get('/groups');
      const currentGroup = gRes.data.find(g => g._id === groupId);
      setGroup(currentGroup);

      // Fetching expenses for the ledger
      const eRes = await api.get(`/expenses/${groupId}`);
      setExpenses(eRes.data);

    } catch (err) {
      showToast("Failed to load group data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [groupId]);

  // --- Member & Group Management Logic ---
  const handleRemoveMember = async (memberUserId) => {
    if (memberUserId === user.id) return showToast("You cannot remove yourself!", "error");
    
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/groups/${groupId}/members/${memberUserId}`);
      showToast("Member removed successfully");
      fetchData(); 
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to remove member", "error");
    }
  };

  const handleLeaveGroup = async () => {
    if(window.confirm("Are you sure you want to leave this group?")) {
      try {
        await api.delete(`/groups/${groupId}/members/${user.id}`);
        navigate('/dashboard');
      } catch (err) {
        showToast("Error leaving group", "error");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if(window.confirm("FATAL: Delete this entire group? This cannot be undone.")) {
      try {
        await api.delete(`/groups/${groupId}`);
        navigate('/dashboard');
      } catch (err) {
        showToast("Error deleting group", "error");
      }
    }
  };

  const handleStartAjo = async () => {
    const amount = prompt("Enter contribution amount (e.g. 50000):");
    if (!amount) return;

    setIsStartingAjo(true);
    try {
      // This creates the initial ajoRounds structure in the backend
      await api.post(`/groups/${groupId}/ajo/start`, {
        contributionAmount: Number(amount)
      });
      showToast("Ajo Cycle Started!");
      fetchData();
    } catch (err) {
      showToast("Failed to start Ajo cycle", "error");
    } finally {
      setIsStartingAjo(false);
    }
  };

  if (loading && !group) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600"></div>
        <p className="mt-4 text-slate-400 font-bold animate-pulse">Syncing Finances...</p>
      </div>
    );
  }

  if (!group) return <div className="p-10 text-center text-rose-500 font-bold">Group not found.</div>;

  const isAdmin = group.owner === user.id || group.owner?._id === user.id;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8 relative">
      
      {/* --- PREMIUM TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-900 border-emerald-800 text-emerald-50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`} />
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">{toast.message}</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 opacity-40"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-black text-emerald-900 tracking-tight leading-none">
                {group.name}
              </h1>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {group.members.length} Members
              </span>
            </div>
            <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
              {group.description || "Share expenses and save together."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-4 min-w-[150px]">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invite Code</p>
              <div className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-sm font-mono font-black shadow-xl">
                {group.inviteCode}
              </div>
            </div>
            
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl transition-all"
              >
                <span className="text-lg">+</span> Invite Members
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. PENDING REQUESTS SECTION */}
      {isAdmin && group.joinRequests && group.joinRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] mb-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-amber-800 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            Pending Join Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.joinRequests.map((request) => (
              <div key={request._id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-amber-100">
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 text-sm truncate">{request.name || "New User"}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{request.email}</p>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await api.post('/groups/approve-request', { groupId: group._id, userId: request._id });
                      showToast(`${request.name} approved!`);
                      fetchData(); 
                    } catch(err) { showToast("Approval failed", "error"); }
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-all shadow-md shrink-0 ml-2"
                >
                  APPROVE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Expenses Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100">
            <ExpenseForm groupId={groupId} onExpenseAdded={() => { fetchData(); showToast("Expense Added!"); }} />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 px-4">Transaction History</h2>
            <ExpenseList expenses={expenses} />
          </div>
        </div>

        {/* 4. Sidebar: Balances & Ajo Manager */}
        <div className="space-y-6">
          <div className="space-y-6">
            <BalanceSummary 
              expenses={expenses} 
              members={group.members} 
              currentUserId={user.id} 
              isAdmin={isAdmin}
              onRemoveMember={handleRemoveMember}
              loading={loading}
            />
            
            <button 
              onClick={() => setIsSettleModalOpen(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              Settle Up Balances
            </button>
          </div>
          
          {/* Ajo Section - Dynamically switched to AjoManager */}
          <div className="relative">
            {group.ajoRounds && group.ajoRounds.length > 0 ? (
              <AjoManager 
                group={group} 
                isAdmin={isAdmin} 
                showToast={showToast} 
                onUpdate={(updatedGroup) => setGroup(updatedGroup)}
              />
            ) : (
              <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-emerald-100 text-center flex flex-col items-center">
                <p className="text-emerald-900 font-black mb-1 text-sm uppercase">Ajo Contribution</p>
                <p className="text-slate-400 text-[11px] mb-6 italic text-center">No active cycle found.</p>
                {isAdmin ? (
                   <button onClick={handleStartAjo} disabled={isStartingAjo} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all">
                    {isStartingAjo ? 'Starting...' : 'Start Ajo Now'}
                   </button>
                ) : (
                  <div className="bg-slate-50 py-2 px-6 rounded-full text-[10px] font-black text-slate-400 uppercase">Waiting for Admin</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 5. Danger Zone */}
      <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Danger Zone</h4>
          <p className="text-xs text-slate-400 font-medium">Be careful, these actions are permanent.</p>
        </div>
        <div className="flex gap-4">
          {!isAdmin && (
            <button onClick={handleLeaveGroup} className="px-8 py-3 rounded-2xl border border-rose-100 text-rose-500 text-xs font-black hover:bg-rose-50 transition-all">
              Leave Group
            </button>
          )}
          {isAdmin && (
            <button onClick={handleDeleteGroup} className="px-8 py-3 rounded-2xl bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all">
              Delete Group
            </button>
          )}
        </div>
      </div>

      {/* --- Overlays --- */}
      <AddMemberModal 
        groupId={groupId}
        inviteCode={group.inviteCode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMemberAdded={() => { fetchData(); showToast("Member Added!"); }}
      />

      <SettleUpModal 
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        members={group.members}
        expenses={expenses}
        currentUserId={user.id}
        groupId={groupId}
        onSettled={() => { fetchData(); showToast("Balances Settled!"); }}
      />
    </div>
  );
};

export default GroupDetails;