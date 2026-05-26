import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from '../services/toast';

import AjoManager from '../components/AjoManager';
import AddMemberModal from '../components/AddMemberModal';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStartingAjo, setIsStartingAjo] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAjoModal, setShowAjoModal] = useState(false);

  const [ajoForm, setAjoForm] = useState({ title: '', amount: '', totalRounds: '', frequency: 'monthly' });

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const gRes = await api.get('/groups');
      const currentGroup = gRes.data.find((g) => g._id === groupId);

      if (!currentGroup) {
        setGroup(null);
        return;
      }

      try {
        const aRes = await api.get(`/ajo/${groupId}`);
        currentGroup.activeAjo = aRes.data;
      } catch (e) {
        currentGroup.activeAjo = null;
      }

      setGroup(currentGroup);
    } catch (err) {
      toast.error("Couldn't load this group. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const handleRemoveMember = async (memberUserId) => {
    if (memberUserId === user.id) return toast.error("You can't remove yourself.");
    if (!window.confirm('Remove this person from the group?')) return;

    try {
      await api.delete(`/groups/${groupId}/members/${memberUserId}`);
      toast.success('Member removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't remove that member");
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Leave this group? You'll lose access to its ajo.")) {
      try {
        await api.delete(`/groups/${groupId}/members/${user.id}`);
        toast.success('You left the group');
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.error || "Couldn't leave the group");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Delete this group? The ajo and all its history will be gone forever. This can't be undone.")) {
      try {
        await api.delete(`/groups/${groupId}`);
        toast.success('Group deleted');
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.error || "Couldn't delete the group");
      }
    }
  };

  const handleStartAjo = async () => {
    if (!ajoForm.title.trim()) return toast.error('Give your ajo a name');
    if (!ajoForm.amount || Number(ajoForm.amount) <= 0) {
      return toast.error('Enter the amount per hand');
    }
    const rounds = Number(ajoForm.totalRounds);
    if (!Number.isInteger(rounds) || rounds < 1) {
      return toast.error('Enter how many rounds total (1 hand = 1 round)');
    }

    setIsStartingAjo(true);
    try {
      await api.post('/ajo', {
        groupId,
        title: ajoForm.title.trim(),
        contributionAmount: Number(ajoForm.amount),
        totalRounds: rounds,
        frequency: ajoForm.frequency,
      });

      toast.success('Ajo set up! Members can now request hands.');
      setShowAjoModal(false);
      setAjoForm({ title: '', amount: '', totalRounds: '', frequency: 'monthly' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't start the ajo");
    } finally {
      setIsStartingAjo(false);
    }
  };

  if (loading && !group) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading your group…</p>
      </div>
    );
  }

  if (!group) {
    return <div className="p-10 text-center text-rose-500 font-bold">We couldn't find this group.</div>;
  }

  const isAdmin = group.owner === user.id || group.owner?._id === user.id;
  const memberCount = group.members.length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 md:space-y-8 px-3 py-4 md:p-8 relative">

      {/* Header */}
      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-emerald-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 opacity-40"></div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-4xl font-black text-emerald-900 tracking-tight leading-none">
                {group.name}
              </h1>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
            {group.description && (
              <p className="text-slate-500 max-w-xl text-sm leading-relaxed">{group.description}</p>
            )}
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto md:min-w-[160px]">
            <div className="text-left md:text-right">
              <p className="text-xs font-bold text-slate-500 mb-1">Invite code</p>
              <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm font-mono font-black shadow-xl inline-block">
                {group.inviteCode}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl transition-all"
              >
                <span className="text-lg leading-none">+</span> Add people
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending requests */}
      {isAdmin && group.joinRequests && group.joinRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem]">
          <h3 className="text-amber-800 font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            People waiting to join
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.joinRequests.map((request) => (
              <div key={request._id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-amber-100 gap-2">
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{request.name || 'New person'}</p>
                  <p className="text-xs text-slate-500 truncate">{request.email}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.post('/groups/approve-request', { groupId: group._id, userId: request._id });
                      toast.success(`${request.name || 'They'} can now access the group`);
                      fetchData();
                    } catch (err) {
                      toast.error(err.response?.data?.error || "Couldn't approve. Try again.");
                    }
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shrink-0"
                >
                  Let in
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ajo — the main event */}
      {group.activeAjo ? (
        <AjoManager
          group={group}
          isAdmin={isAdmin}
          onUpdate={fetchData}
          currentUserId={user.id}
        />
      ) : (
        <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border-2 border-dashed border-emerald-200 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Start an ajo</h2>
          <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
            You set the amount per hand and the total rounds. Members request hands — admin approves and orders the rotation. Each round, one slot collects the whole pot.
          </p>
          {isAdmin ? (
            <button
              onClick={() => setShowAjoModal(true)}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-[0.98]"
            >
              Start ajo
            </button>
          ) : (
            <div className="bg-slate-50 py-2 px-5 rounded-full text-xs font-bold text-slate-500">
              Only the admin can start one
            </div>
          )}
        </div>
      )}

      {/* Members list */}
      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-base md:text-lg font-bold text-slate-800 mb-5">Members</h3>
        <div className="space-y-3">
          {group.members.map((m) => {
            const memberId = m._id;
            const memberName = m.name || 'Member';
            const memberEmail = m.email || '';
            const memberPhone = m.phone || '';
            const isMe = m.userId && m.userId.toString() === user.id;
            const memberIsAdmin = m.role === 'ADMIN';
            const isGhost = m.isGhost || m.status === 'ghost' || !m.userId;

            const handleInvite = async () => {
              try {
                await api.post(`/groups/${groupId}/members/${memberId}/invite`);
                toast.success(`Invite sent to ${memberName}`);
              } catch (err) {
                toast.error(err.response?.data?.error || "Couldn't send invite");
              }
            };

            return (
              <div key={memberId} className="flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${
                    isMe ? 'bg-slate-900 text-white' : isGhost ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                      {memberName}
                      {isMe && <span className="text-emerald-600 font-bold">(you)</span>}
                      {isGhost && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">GHOST</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {memberIsAdmin ? 'Admin · ' : ''}{memberEmail || memberPhone || 'No contact'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && isGhost && memberPhone && (
                    <button
                      onClick={handleInvite}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                      title="Send WhatsApp invite"
                    >
                      Invite
                    </button>
                  )}
                  {isAdmin && !isMe && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                      title="Remove from group"
                      aria-label={`Remove ${memberName}`}
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

      {/* Risky actions */}
      <div className="pt-4 md:pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="text-center md:text-left">
          <h4 className="text-base font-bold text-slate-900">Risky actions</h4>
          <p className="text-sm text-slate-500">These can't be undone. Be sure before you tap.</p>
        </div>
        <div className="flex gap-3">
          {!isAdmin && (
            <button onClick={handleLeaveGroup} className="px-6 md:px-8 py-3 rounded-2xl border border-rose-100 text-rose-500 text-sm font-bold hover:bg-rose-50 transition-all">
              Leave group
            </button>
          )}
          {isAdmin && (
            <button onClick={handleDeleteGroup} className="px-6 md:px-8 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all">
              Delete group
            </button>
          )}
        </div>
      </div>

      {/* Start ajo modal */}
      {showAjoModal && (
        <div className="fixed inset-0 z-[210] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 max-h-[85dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1">Set up an ajo</h3>
            <p className="text-slate-500 text-sm mb-5">
              You set the amount per hand and the total rounds. Members then request how many hands they want.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">Name this ajo</label>
                <input
                  type="text"
                  placeholder="e.g. January savings"
                  maxLength={60}
                  className="w-full p-4 bg-slate-50 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={ajoForm.title}
                  onChange={(e) => setAjoForm({ ...ajoForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">
                  Amount per hand
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₦</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    placeholder="50000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={ajoForm.amount}
                    onChange={(e) => setAjoForm({ ...ajoForm, amount: e.target.value })}
                  />
                </div>
                <p className="text-xs text-slate-400 ml-1 mt-1">
                  Each hand pays this every round. A 2-hand member pays double.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">
                  Total rounds
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  inputMode="numeric"
                  placeholder="10"
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={ajoForm.totalRounds}
                  onChange={(e) => setAjoForm({ ...ajoForm, totalRounds: e.target.value })}
                />
                <p className="text-xs text-slate-400 ml-1 mt-1">
                  1 round = 1 hand collects. If 5 people each have 2 hands, that's 10 rounds.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">How often?</label>
                <div className="grid grid-cols-3 gap-2">
                  {['daily', 'weekly', 'monthly'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setAjoForm({ ...ajoForm, frequency: f })}
                      className={`py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                        ajoForm.frequency === f
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {ajoForm.amount && ajoForm.totalRounds && Number(ajoForm.amount) > 0 && Number(ajoForm.totalRounds) > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mt-2">
                  <p className="text-xs font-bold text-emerald-700 mb-1">Each round's pot</p>
                  <p className="text-lg font-black text-emerald-900">
                    ₦{(Number(ajoForm.amount) * Number(ajoForm.totalRounds)).toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {Number(ajoForm.totalRounds)} round{Number(ajoForm.totalRounds) === 1 ? '' : 's'} × ₦{Number(ajoForm.amount).toLocaleString()} per hand
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAjoModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartAjo}
                  className="flex-[2] bg-emerald-600 py-4 rounded-2xl font-bold text-sm text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-60"
                  disabled={isStartingAjo}
                >
                  {isStartingAjo ? 'Setting up…' : 'Set up ajo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddMemberModal
        groupId={groupId}
        inviteCode={group.inviteCode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMemberAdded={() => { fetchData(); toast.success('Member added'); }}
      />
    </div>
  );
};

export default GroupDetails;
