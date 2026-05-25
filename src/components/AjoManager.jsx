import React, { useMemo, useState } from 'react';
import api from '../services/api';
import { toast } from '../services/toast';

const showToast = (message, type = 'success') =>
  type === 'error' ? toast.error(message) : toast.success(message);

const AjoManager = ({ group, isAdmin, onUpdate, currentUserId }) => {
  const ajo = group.activeAjo;
  const [busy, setBusy] = useState(false);
  const [requestHands, setRequestHands] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [assigningUser, setAssigningUser] = useState(null); // { userId, name, defaultHands }
  const [assignHands, setAssignHandsLocal] = useState('');

  if (!ajo) return null;

  const totalRounds = ajo.totalRounds || ajo.rotation.length;
  const baseAmount = ajo.contributionAmount;
  const currentCycle = ajo.currentCycle || 1;
  const isSetup = ajo.cycleStatus === 'setup';
  const isActive = ajo.cycleStatus === 'active';
  const isCompleted = ajo.cycleStatus === 'completed';

  // Filled / empty slots
  const filledSlots = ajo.rotation.filter((s) => s.user).length;
  const emptySlots = ajo.rotation.length - filledSlots;

  // Current user's slots
  const myHandSlots = ajo.rotation
    .map((s, i) => ({ slot: s, index: i }))
    .filter((x) => x.slot.user && (x.slot.user._id || x.slot.user) === currentUserId);
  const myHandCount = myHandSlots.length;
  const myPendingRequest = (ajo.handRequests || []).find(
    (r) => r.status === 'pending' && (r.user?._id || r.user) === currentUserId
  );

  // Paid status this cycle
  const paidThisCycle = useMemo(() => {
    const ids = new Set();
    (ajo.contributions || []).forEach((c) => {
      if (c.cycleIndex === currentCycle) ids.add(c.user?._id || c.user);
    });
    return ids;
  }, [ajo.contributions, currentCycle]);

  // Aggregate by unique users in rotation
  const uniqueParticipants = useMemo(() => {
    const map = new Map();
    ajo.rotation.forEach((s, i) => {
      if (!s.user) return;
      const uid = s.user._id || s.user;
      if (!map.has(uid)) {
        map.set(uid, { user: s.user, hands: 0, slotIndices: [] });
      }
      const entry = map.get(uid);
      entry.hands += 1;
      entry.slotIndices.push(i);
    });
    return [...map.values()];
  }, [ajo.rotation]);

  const totalPotPerRound = baseAmount * totalRounds;
  const potThisCycle = paidThisCycle.size * baseAmount * 0 +
    [...paidThisCycle].reduce((sum, uid) => {
      const p = uniqueParticipants.find((x) => (x.user._id || x.user) === uid);
      return sum + (p ? p.hands * baseAmount : 0);
    }, 0);
  const targetThisCycle = totalPotPerRound;

  // Members not yet in rotation, for admin "assign hands" UI
  const membersNotYetIn = (group.members || []).filter((m) => {
    const uid = m.user?._id || m.user;
    return !uniqueParticipants.some((p) => (p.user._id || p.user) === uid);
  });

  const pendingRequests = (ajo.handRequests || []).filter((r) => r.status === 'pending');

  // ---- ACTIONS ----

  const submitHandsRequest = async () => {
    const n = Number(requestHands);
    if (!Number.isInteger(n) || n < 1) {
      return showToast('Enter how many hands you want (whole number)', 'error');
    }
    setBusy(true);
    try {
      await api.post('/ajo/request-hands', {
        ajoId: ajo._id,
        hands: n,
        note: requestNote || undefined,
      });
      showToast(`Requested ${n} hand${n === 1 ? '' : 's'}. Waiting for admin.`);
      setRequestHands('');
      setRequestNote('');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't send request", 'error');
    } finally {
      setBusy(false);
    }
  };

  const approveRequest = async (requestId, requestedName, approvedHands) => {
    setBusy(true);
    try {
      await api.post('/ajo/approve-hand-request', {
        ajoId: ajo._id,
        requestId,
        approvedHands,
      });
      showToast(`Approved ${approvedHands} hand${approvedHands === 1 ? '' : 's'} for ${requestedName}`);
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't approve", 'error');
    } finally {
      setBusy(false);
    }
  };

  const rejectRequest = async (requestId, requestedName) => {
    if (!window.confirm(`Reject ${requestedName}'s hand request?`)) return;
    setBusy(true);
    try {
      await api.post('/ajo/reject-hand-request', { ajoId: ajo._id, requestId });
      showToast(`Rejected ${requestedName}'s request`);
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't reject", 'error');
    } finally {
      setBusy(false);
    }
  };

  const adminAssignHands = async () => {
    if (!assigningUser) return;
    const n = Number(assignHands);
    if (!Number.isInteger(n) || n < 1) {
      return showToast('Enter how many hands (whole number)', 'error');
    }
    if (n > emptySlots) {
      return showToast(`Only ${emptySlots} slot${emptySlots === 1 ? '' : 's'} left`, 'error');
    }
    setBusy(true);
    try {
      const emptyIndices = ajo.rotation
        .map((s, i) => (s.user ? -1 : i))
        .filter((i) => i >= 0)
        .slice(0, n);
      await api.post('/ajo/assign-hands', {
        ajoId: ajo._id,
        userId: assigningUser.userId,
        slotPositions: emptyIndices,
      });
      showToast(`Gave ${assigningUser.name} ${n} hand${n === 1 ? '' : 's'}`);
      setAssigningUser(null);
      setAssignHandsLocal('');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't assign", 'error');
    } finally {
      setBusy(false);
    }
  };

  const moveSlot = async (slotIndex, direction) => {
    setBusy(true);
    try {
      await api.post('/ajo/move-slot', { ajoId: ajo._id, slotIndex, direction });
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't move slot", 'error');
    } finally {
      setBusy(false);
    }
  };

  const unassignSlot = async (slotIndex) => {
    if (!window.confirm('Remove this slot assignment?')) return;
    setBusy(true);
    try {
      await api.post('/ajo/unassign-slot', { ajoId: ajo._id, slotIndex });
      showToast('Slot cleared');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't unassign", 'error');
    } finally {
      setBusy(false);
    }
  };

  const launchAjo = async () => {
    if (!window.confirm("Start the ajo? Members can't change hands once it starts.")) return;
    setBusy(true);
    try {
      await api.post('/ajo/launch', { ajoId: ajo._id });
      showToast('Ajo started!');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't start ajo", 'error');
    } finally {
      setBusy(false);
    }
  };

  const recordMyContribution = async () => {
    setBusy(true);
    try {
      await api.post('/ajo/contribute', { ajoId: ajo._id });
      showToast('Your payment is recorded');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't record payment", 'error');
    } finally {
      setBusy(false);
    }
  };

  const markMemberPaid = async (uid, name) => {
    setBusy(true);
    try {
      await api.post('/ajo/contribute', { ajoId: ajo._id, userId: uid });
      showToast(`${name} marked as paid`);
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't record payment", 'error');
    } finally {
      setBusy(false);
    }
  };

  const sendReminders = async () => {
    if (busy) return;
    const unpaidCount = uniqueParticipants.filter((p) => !paidThisCycle.has(p.user._id || p.user)).length;
    if (unpaidCount === 0) return showToast('Everyone has paid this round', 'error');
    if (!window.confirm(`Send WhatsApp reminders to ${unpaidCount} unpaid member${unpaidCount === 1 ? '' : 's'}? (Falls back to SMS if WhatsApp fails.)`)) return;

    setBusy(true);
    try {
      const { data } = await api.post('/ajo/send-reminders', { ajoId: ajo._id });
      const { sent, skippedNoPhone, skippedCooldown, failed } = data.summary || {};
      const bits = [];
      if (sent) bits.push(`Sent ${sent}`);
      if (skippedNoPhone) bits.push(`${skippedNoPhone} have no phone`);
      if (skippedCooldown) bits.push(`${skippedCooldown} reminded recently`);
      if (failed) bits.push(`${failed} failed`);
      showToast(bits.length ? bits.join(' · ') : 'No reminders to send', failed ? 'error' : 'success');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't send reminders", 'error');
    } finally {
      setBusy(false);
    }
  };

  const disburse = async (slotIndex, name) => {
    if (!window.confirm(`Send this round's pot of ₦${totalPotPerRound.toLocaleString()} to ${name}? Only do this after you've actually paid them.`)) return;
    setBusy(true);
    try {
      await api.post('/ajo/disburse', { ajoId: ajo._id, slotIndex });
      showToast('Pot disbursed. Moving to the next round.');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't disburse", 'error');
    } finally {
      setBusy(false);
    }
  };

  // ---- RENDER HELPERS ----

  const SlotRow = ({ slot, index }) => {
    const isRecipient = isActive && index + 1 === currentCycle;
    const slotUser = slot.user;
    const slotUserId = slotUser?._id || slotUser;
    const slotName = slotUser?.name || null;
    const isMine = slotUserId && slotUserId === currentUserId;
    const hasPaid = slotUserId && paidThisCycle.has(slotUserId);
    const myHandsHere = uniqueParticipants.find(
      (p) => (p.user._id || p.user) === slotUserId
    )?.hands;

    if (!slotUser) {
      return (
        <div className="flex items-center justify-between p-3 md:p-4 rounded-2xl border border-dashed border-slate-700 bg-slate-800/20 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm bg-slate-800 text-slate-500 shrink-0">
              {index + 1}
            </div>
            <p className="text-sm font-bold text-slate-400">Slot {index + 1} — empty</p>
          </div>
          {isAdmin && isSetup && (
            <span className="text-xs text-slate-500">Assign someone below</span>
          )}
        </div>
      );
    }

    return (
      <div
        className={`flex items-center justify-between p-3 md:p-4 rounded-2xl border transition-all gap-3 ${
          slot.isPaidOut
            ? 'bg-emerald-900/40 border-emerald-500/40'
            : hasPaid
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : isRecipient
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-slate-800/40 border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
              hasPaid || slot.isPaidOut
                ? 'bg-emerald-500 text-white'
                : isRecipient
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {slotName || 'Member'}
              {isMine && <span className="text-emerald-400 font-bold ml-1">(you)</span>}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {myHandsHere > 1 && (
                <span className="text-xs text-slate-400">
                  Hand {ajo.rotation
                    .slice(0, index + 1)
                    .filter((s) => s.user && (s.user._id || s.user) === slotUserId).length} of {myHandsHere}
                </span>
              )}
              {isRecipient && !slot.isPaidOut && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Collects this round
                </span>
              )}
              {slot.isPaidOut && (
                <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Already collected
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 items-center shrink-0">
          {isAdmin && isSetup && !slot.isPaidOut && (
            <>
              <button
                disabled={busy || index === 0}
                onClick={() => moveSlot(index, 'up')}
                className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-30"
                title="Move up"
              >
                ↑
              </button>
              <button
                disabled={busy || index === ajo.rotation.length - 1}
                onClick={() => moveSlot(index, 'down')}
                className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-30"
                title="Move down"
              >
                ↓
              </button>
              <button
                disabled={busy}
                onClick={() => unassignSlot(index)}
                className="w-8 h-8 rounded-lg bg-rose-900/40 text-rose-300 hover:bg-rose-800/60"
                title="Clear slot"
              >
                ✕
              </button>
            </>
          )}

          {isActive && isAdmin && isRecipient && !slot.isPaidOut && (
            <button
              disabled={busy}
              onClick={() => disburse(index, slotName)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-all disabled:opacity-50"
            >
              Send pot
            </button>
          )}
        </div>
      </div>
    );
  };

  // ---- MAIN RENDER ----

  return (
    <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-8 text-white shadow-2xl relative overflow-hidden mb-6 md:mb-8 border border-slate-800">
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

      {/* Header */}
      <header className="flex justify-between items-start mb-6 md:mb-8 relative z-10 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">{ajo.title}</h2>
            {isSetup && (
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                Setting up
              </span>
            )}
            {isCompleted && (
              <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Completed
              </span>
            )}
          </div>
          <p className="text-sm text-emerald-400 font-bold">
            ₦{baseAmount.toLocaleString()} per hand · {ajo.frequency}
          </p>
        </div>
        {isActive && (
          <div className="bg-slate-800 px-3 py-2 rounded-2xl border border-slate-700 text-center shrink-0">
            <p className="text-xs text-slate-500">Round</p>
            <p className="text-sm font-black text-emerald-400">
              {currentCycle} <span className="text-slate-500">of {totalRounds}</span>
            </p>
          </div>
        )}
      </header>

      {/* Setup status banner */}
      {isSetup && (
        <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-sm text-amber-200 font-bold mb-1">
            {emptySlots > 0
              ? `${filledSlots} of ${totalRounds} slot${totalRounds === 1 ? '' : 's'} filled`
              : 'All slots filled! Admin can start the ajo.'}
          </p>
          <p className="text-xs text-amber-200/70">
            {emptySlots > 0
              ? 'Members request hands and the admin assigns them to slots.'
              : 'Once started, members will see the round-by-round schedule and start paying.'}
          </p>
          {isAdmin && emptySlots === 0 && (
            <button
              onClick={launchAjo}
              disabled={busy}
              className="mt-3 w-full md:w-auto bg-emerald-500 text-slate-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50"
            >
              Start the ajo now
            </button>
          )}
        </div>
      )}

      {/* Stats — only when active */}
      {isActive && (
        <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
            <p className="text-xs text-slate-500 mb-1">Collected this round</p>
            <p className="text-lg md:text-xl font-black text-white">
              ₦{potThisCycle.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">of ₦{targetThisCycle.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
            <p className="text-xs text-slate-500 mb-1">Each round's pot</p>
            <p className="text-lg md:text-xl font-black text-emerald-500">
              ₦{totalPotPerRound.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">to one recipient</p>
          </div>
        </div>
      )}

      {/* Member's personal status */}
      {myHandCount > 0 && (
        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 relative z-10">
          <p className="text-xs text-emerald-300 font-bold mb-1">You have {myHandCount} hand{myHandCount === 1 ? '' : 's'}</p>
          <p className="text-sm text-white">
            You pay <span className="font-black">₦{(baseAmount * myHandCount).toLocaleString()}</span> each round.
            You'll collect <span className="font-black">₦{totalPotPerRound.toLocaleString()}</span> in round
            {myHandSlots.length > 1 ? 's ' : ' '}
            {myHandSlots.map((x) => x.index + 1).join(', ')}.
          </p>
          {isActive && !paidThisCycle.has(currentUserId) && (
            <button
              disabled={busy}
              onClick={recordMyContribution}
              className="mt-3 w-full md:w-auto bg-white text-emerald-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 disabled:opacity-50"
            >
              I've paid this round
            </button>
          )}
          {isActive && paidThisCycle.has(currentUserId) && (
            <p className="mt-3 text-sm text-emerald-300 font-bold">✓ Paid for round {currentCycle}</p>
          )}
        </div>
      )}

      {/* No hands yet — request UI */}
      {myHandCount === 0 && !isCompleted && (
        <div className="mb-5 bg-slate-800/40 border border-slate-700 rounded-2xl p-4 relative z-10">
          {myPendingRequest ? (
            <>
              <p className="text-sm text-amber-300 font-bold mb-1">
                Request pending — {myPendingRequest.requestedHands} hand{myPendingRequest.requestedHands === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-slate-400">Waiting for the admin to approve.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-white font-bold mb-1">Join this ajo</p>
              <p className="text-xs text-slate-400 mb-3">
                Pick how many hands you want. Each hand pays ₦{baseAmount.toLocaleString()} per round and gives you one collection turn.
              </p>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="number"
                  min="1"
                  max={emptySlots}
                  inputMode="numeric"
                  placeholder="Hands"
                  className="w-full md:w-24 px-3 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={requestHands}
                  onChange={(e) => setRequestHands(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  maxLength={200}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
                <button
                  disabled={busy || !requestHands}
                  onClick={submitHandsRequest}
                  className="bg-emerald-500 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-400 disabled:opacity-50"
                >
                  Request
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Admin: pending requests */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 relative z-10">
          <h4 className="text-sm font-bold text-amber-300 mb-3">
            Hand requests — {pendingRequests.length}
          </h4>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <PendingRequestCard
                key={req._id}
                req={req}
                baseAmount={baseAmount}
                emptySlots={emptySlots}
                busy={busy}
                onApprove={approveRequest}
                onReject={rejectRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Admin: assign hands directly to a member */}
      {isAdmin && isSetup && emptySlots > 0 && membersNotYetIn.length > 0 && (
        <div className="mb-5 bg-slate-800/40 border border-slate-700 rounded-2xl p-4 relative z-10">
          <h4 className="text-sm font-bold text-white mb-1">Assign hands directly</h4>
          <p className="text-xs text-slate-400 mb-3">Skip the request flow and assign hands yourself.</p>
          <div className="space-y-2">
            {membersNotYetIn.map((m) => {
              const uid = m.user?._id || m.user;
              const name = m.user?.name || 'Member';
              const isAssigning = assigningUser?.userId === uid;
              return (
                <div key={uid} className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-white font-medium flex-1 min-w-0 truncate">
                    {name}
                  </span>
                  {isAssigning ? (
                    <>
                      <input
                        type="number"
                        min="1"
                        max={emptySlots}
                        placeholder="Hands"
                        className="w-20 px-2 py-1.5 rounded-lg bg-slate-700 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={assignHands}
                        onChange={(e) => setAssignHandsLocal(e.target.value)}
                      />
                      <button
                        disabled={busy || !assignHands}
                        onClick={adminAssignHands}
                        className="bg-emerald-500 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setAssigningUser(null); setAssignHandsLocal(''); }}
                        className="text-slate-400 text-xs px-2"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setAssigningUser({ userId: uid, name }); setAssignHandsLocal('1'); }}
                      className="bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-600"
                    >
                      Assign
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rotation */}
      <div className="space-y-2 relative z-10">
        <h4 className="text-xs font-bold text-slate-400 mb-2">
          Rotation ({filledSlots}/{totalRounds} slots filled)
        </h4>
        {ajo.rotation.map((slot, index) => (
          <SlotRow key={index} slot={slot} index={index} />
        ))}
      </div>

      {/* Members list with paid status — admin only, when active */}
      {isAdmin && isActive && uniqueParticipants.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h4 className="text-xs font-bold text-slate-400">
              Who's paid round {currentCycle}
            </h4>
            {uniqueParticipants.some((p) => !paidThisCycle.has(p.user._id || p.user)) && (
              <button
                disabled={busy}
                onClick={sendReminders}
                className="text-xs font-bold bg-emerald-500 text-slate-900 px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-1.5"
                title="Send WhatsApp reminders to unpaid members"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.9-10 9.9zm5.5-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1-1.3-.5-2.4-1.5c-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6c.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5s.1-.4 0-.5-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3 2.1 3.2 5.1 4.5c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"/>
                </svg>
                Send reminders
              </button>
            )}
          </div>
          <div className="space-y-2">
            {uniqueParticipants.map((p) => {
              const uid = p.user._id || p.user;
              const name = p.user.name || 'Member';
              const paid = paidThisCycle.has(uid);
              const amountOwed = baseAmount * p.hands;
              return (
                <div
                  key={uid}
                  className={`flex items-center justify-between p-3 rounded-xl gap-3 ${
                    paid ? 'bg-emerald-500/10' : 'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                      paid ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{name}</p>
                      <p className="text-xs text-slate-400">
                        {p.hands} hand{p.hands === 1 ? '' : 's'} · ₦{amountOwed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {paid ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 shrink-0">
                      Paid
                    </span>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={() => markMemberPaid(uid, name)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50 shrink-0"
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const PendingRequestCard = ({ req, baseAmount, emptySlots, busy, onApprove, onReject }) => {
  const [editedHands, setEditedHands] = useState(req.requestedHands);
  const name = req.user?.name || 'Someone';
  const totalAmount = baseAmount * Number(editedHands || 0);

  return (
    <div className="bg-slate-900/50 rounded-xl p-3 border border-amber-500/20">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{name}</p>
          <p className="text-xs text-slate-400">
            Requested {req.requestedHands} hand{req.requestedHands === 1 ? '' : 's'}
          </p>
          {req.note && (
            <p className="text-xs text-slate-300 italic mt-1">"{req.note}"</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400">Approve for:</span>
        <input
          type="number"
          min="1"
          max={emptySlots}
          className="w-16 px-2 py-1.5 rounded-lg bg-slate-700 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          value={editedHands}
          onChange={(e) => setEditedHands(e.target.value)}
        />
        <span className="text-xs text-slate-400">
          hand{Number(editedHands) === 1 ? '' : 's'} (₦{totalAmount.toLocaleString()}/round)
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          disabled={busy || !Number(editedHands) || Number(editedHands) > emptySlots}
          onClick={() => onApprove(req._id, name, Number(editedHands))}
          className="flex-1 bg-emerald-500 text-slate-900 font-bold text-xs px-3 py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => onReject(req._id, name)}
          className="flex-1 bg-rose-900/40 text-rose-300 font-bold text-xs px-3 py-2 rounded-lg hover:bg-rose-800/60 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default AjoManager;
