import React, { useMemo, useState } from 'react';
import api from '../services/api';
import { toast } from '../services/toast';

const showToast = (message, type = 'success') =>
  type === 'error' ? toast.error(message) : toast.success(message);

// Helper: pull an id-string out of either a populated doc or raw ObjectId
const idStr = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val._id) return val._id.toString();
  return val.toString();
};

const AjoManager = ({ group, isAdmin, onUpdate, currentUserId }) => {
  const ajo = group.activeAjo;
  const [busy, setBusy] = useState(false);
  const [requestHandsInput, setRequestHandsInput] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [assigningMember, setAssigningMember] = useState(null); // { memberId, name }
  const [assignHandsInput, setAssignHandsInput] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  if (!ajo) return null;

  const totalRounds = ajo.totalRounds || ajo.rotation.length;
  const baseAmount = ajo.contributionAmount;
  const currentCycle = ajo.currentCycle || 1;
  const isSetup = ajo.cycleStatus === 'setup';
  const isActive = ajo.cycleStatus === 'active';
  const isCompleted = ajo.cycleStatus === 'completed';

  const filledSlots = ajo.rotation.filter((s) => s.member).length;
  const emptySlots = ajo.rotation.length - filledSlots;

  // Find my own Member doc in this group (so I can match "mine" in rotation by member._id)
  const myMember = useMemo(
    () => (group.members || []).find((m) => m.userId && m.userId.toString() === currentUserId),
    [group.members, currentUserId]
  );
  const myMemberId = myMember?._id;

  const myHandSlots = useMemo(() => {
    if (!myMemberId) return [];
    return ajo.rotation
      .map((s, i) => ({ slot: s, index: i }))
      .filter((x) => idStr(x.slot.member) === idStr(myMemberId));
  }, [ajo.rotation, myMemberId]);
  const myHandCount = myHandSlots.length;

  const myPendingRequest = useMemo(
    () =>
      (ajo.handRequests || []).find(
        (r) => r.status === 'pending' && idStr(r.member) === idStr(myMemberId)
      ),
    [ajo.handRequests, myMemberId]
  );

  const paidThisCycle = useMemo(() => {
    const ids = new Set();
    (ajo.contributions || []).forEach((c) => {
      if (c.cycleIndex === currentCycle) ids.add(idStr(c.member));
    });
    return ids;
  }, [ajo.contributions, currentCycle]);

  const uniqueParticipants = useMemo(() => {
    const map = new Map();
    ajo.rotation.forEach((s, i) => {
      if (!s.member) return;
      const memberId = idStr(s.member);
      if (!map.has(memberId)) {
        map.set(memberId, { member: s.member, hands: 0, slotIndices: [] });
      }
      const entry = map.get(memberId);
      entry.hands += 1;
      entry.slotIndices.push(i);
    });
    return [...map.values()];
  }, [ajo.rotation]);

  const totalPotPerRound = baseAmount * totalRounds;
  const potThisCycle = [...paidThisCycle].reduce((sum, mid) => {
    const p = uniqueParticipants.find((x) => idStr(x.member) === mid);
    return sum + (p ? p.hands * baseAmount : 0);
  }, 0);

  // Group members not yet in the rotation — admin can directly assign hands to them
  const membersNotYetIn = useMemo(() => {
    return (group.members || []).filter((m) => {
      const memberId = idStr(m._id);
      return !uniqueParticipants.some((p) => idStr(p.member) === memberId);
    });
  }, [group.members, uniqueParticipants]);

  const pendingRequests = (ajo.handRequests || []).filter((r) => r.status === 'pending');

  // ---- ACTIONS ----

  const submitHandsRequest = async () => {
    const n = Number(requestHandsInput);
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
      setRequestHandsInput('');
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
    if (!assigningMember) return;
    const n = Number(assignHandsInput);
    if (!Number.isInteger(n) || n < 1) {
      return showToast('Enter how many hands (whole number)', 'error');
    }
    if (n > emptySlots) {
      return showToast(`Only ${emptySlots} slot${emptySlots === 1 ? '' : 's'} left`, 'error');
    }
    setBusy(true);
    try {
      const emptyIndices = ajo.rotation
        .map((s, i) => (s.member ? -1 : i))
        .filter((i) => i >= 0)
        .slice(0, n);
      await api.post('/ajo/assign-hands', {
        ajoId: ajo._id,
        memberId: assigningMember.memberId,
        slotPositions: emptyIndices,
      });
      showToast(`Gave ${assigningMember.name} ${n} hand${n === 1 ? '' : 's'}`);
      setAssigningMember(null);
      setAssignHandsInput('');
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

  const markMemberPaid = async (memberId, name) => {
    setBusy(true);
    try {
      await api.post('/ajo/contribute', { ajoId: ajo._id, memberId });
      showToast(`${name} marked as paid`);
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't record payment", 'error');
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

  const toggleAutoReminders = async () => {
    if (busy) return;
    const newValue = !ajo.autoRemindersEnabled;
    setBusy(true);
    try {
      await api.post('/ajo/toggle-reminders', { ajoId: ajo._id, enabled: newValue });
      showToast(newValue ? 'Auto-reminders turned on' : 'Auto-reminders turned off');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't update setting", 'error');
    } finally {
      setBusy(false);
    }
  };

  const buildSummary = () => {
    const recipientSlot = ajo.rotation[currentCycle - 1];
    const recipientName = recipientSlot?.member?.name || 'TBD';
    const paid = uniqueParticipants.filter((p) => paidThisCycle.has(idStr(p.member)));
    const pending = uniqueParticipants.filter((p) => !paidThisCycle.has(idStr(p.member)));

    const lines = [];
    lines.push(`📊 ${group.name || 'Group'} — ${ajo.title}`);
    lines.push('');
    lines.push(`Round ${currentCycle} of ${totalRounds}`);
    lines.push(`🎯 This round's pot: ₦${totalPotPerRound.toLocaleString()}`);
    lines.push(`👤 Going to: ${recipientName}`);
    lines.push('');

    if (paid.length > 0) {
      lines.push(`✓ Paid (${paid.length}):`);
      paid.forEach((p) => lines.push(`• ${p.member?.name || 'Member'}`));
      lines.push('');
    }
    if (pending.length > 0) {
      lines.push(`⏳ Still pending (${pending.length}):`);
      pending.forEach((p) => lines.push(`• ${p.member?.name || 'Member'}`));
      lines.push('');
    }

    lines.push('Run your ajo on SplitAm 👇');
    lines.push('https://split-am-frontend.vercel.app');
    return lines.join('\n');
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setSummaryCopied(true);
      showToast('Summary copied — paste it in your WhatsApp group');
      setTimeout(() => setSummaryCopied(false), 2000);
    } catch {
      showToast("Couldn't copy. Long-press the text below to select it.", 'error');
    }
  };

  const shareSummaryWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(buildSummary())}`;
    window.open(url, '_blank', 'noopener');
  };

  const sendReminders = async () => {
    if (busy) return;
    const unpaidCount = uniqueParticipants.filter((p) => !paidThisCycle.has(idStr(p.member))).length;
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

  // ---- RENDER HELPERS ----

  const SlotRow = ({ slot, index }) => {
    const isRecipient = isActive && index + 1 === currentCycle;
    const slotMember = slot.member;
    const slotMemberId = idStr(slotMember);
    const slotName = slotMember?.name || null;
    const slotIsGhost = slotMember?.isGhost || slotMember?.status === 'ghost' || !slotMember?.userId;
    const isMine = !!myMemberId && slotMemberId === idStr(myMemberId);
    const hasPaid = slotMemberId && paidThisCycle.has(slotMemberId);
    const myHandsHere = uniqueParticipants.find((p) => idStr(p.member) === slotMemberId)?.hands;

    if (!slotMember) {
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
            <p className="text-sm font-bold text-white truncate flex items-center gap-1.5 flex-wrap">
              {slotName || 'Member'}
              {isMine && <span className="text-emerald-400 font-bold">(you)</span>}
              {slotIsGhost && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">GHOST</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {myHandsHere > 1 && (
                <span className="text-xs text-slate-400">
                  Hand {ajo.rotation
                    .slice(0, index + 1)
                    .filter((s) => idStr(s.member) === slotMemberId).length} of {myHandsHere}
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
            <p className="text-xs text-slate-500 mt-1">of ₦{totalPotPerRound.toLocaleString()}</p>
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
          {isActive && myMemberId && !paidThisCycle.has(idStr(myMemberId)) && (
            <button
              disabled={busy}
              onClick={recordMyContribution}
              className="mt-3 w-full md:w-auto bg-white text-emerald-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 disabled:opacity-50"
            >
              I've paid this round
            </button>
          )}
          {isActive && myMemberId && paidThisCycle.has(idStr(myMemberId)) && (
            <p className="mt-3 text-sm text-emerald-300 font-bold">✓ Paid for round {currentCycle}</p>
          )}
        </div>
      )}

      {/* No hands yet — request UI */}
      {myMember && myHandCount === 0 && !isCompleted && (
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
                  value={requestHandsInput}
                  onChange={(e) => setRequestHandsInput(e.target.value)}
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
                  disabled={busy || !requestHandsInput}
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

      {/* Admin: assign hands directly */}
      {isAdmin && isSetup && emptySlots > 0 && membersNotYetIn.length > 0 && (
        <div className="mb-5 bg-slate-800/40 border border-slate-700 rounded-2xl p-4 relative z-10">
          <h4 className="text-sm font-bold text-white mb-1">Assign hands directly</h4>
          <p className="text-xs text-slate-400 mb-3">Skip the request flow and assign hands yourself.</p>
          <div className="space-y-2">
            {membersNotYetIn.map((m) => {
              const memberId = m._id;
              const name = m.name || 'Member';
              const isGhost = m.isGhost || m.status === 'ghost' || !m.userId;
              const isAssigningThis = assigningMember?.memberId === memberId;
              return (
                <div key={memberId} className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-white font-medium flex-1 min-w-0 truncate flex items-center gap-1.5">
                    {name}
                    {isGhost && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">GHOST</span>
                    )}
                  </span>
                  {isAssigningThis ? (
                    <>
                      <input
                        type="number"
                        min="1"
                        max={emptySlots}
                        placeholder="Hands"
                        className="w-20 px-2 py-1.5 rounded-lg bg-slate-700 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        value={assignHandsInput}
                        onChange={(e) => setAssignHandsInput(e.target.value)}
                      />
                      <button
                        disabled={busy || !assignHandsInput}
                        onClick={adminAssignHands}
                        className="bg-emerald-500 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setAssigningMember(null); setAssignHandsInput(''); }}
                        className="text-slate-400 text-xs px-2"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setAssigningMember({ memberId, name }); setAssignHandsInput('1'); }}
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

      {/* Who's paid this cycle — admin only, when active */}
      {isAdmin && isActive && uniqueParticipants.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h4 className="text-xs font-bold text-slate-400">
              Who's paid round {currentCycle}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                disabled={busy}
                onClick={toggleAutoReminders}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                  ajo.autoRemindersEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
                title={ajo.autoRemindersEnabled ? 'Daily auto-reminders are ON' : 'Daily auto-reminders are OFF'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ajo.autoRemindersEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                Auto {ajo.autoRemindersEnabled ? 'ON' : 'OFF'}
              </button>
              <button
                disabled={busy}
                onClick={() => setShowSummary(true)}
                className="text-xs font-bold bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50"
                title="Generate a shareable WhatsApp summary"
              >
                Share update
              </button>
              {uniqueParticipants.some((p) => !paidThisCycle.has(idStr(p.member))) && (
                <button
                  disabled={busy}
                  onClick={sendReminders}
                  className="text-xs font-bold bg-emerald-500 text-slate-900 px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  title="Send WhatsApp reminders to unpaid members now"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.9-10 9.9zm5.5-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1-1.3-.5-2.4-1.5c-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6c.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5s.1-.4 0-.5-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3 2.1 3.2 5.1 4.5c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"/>
                  </svg>
                  Send now
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {uniqueParticipants.map((p) => {
              const memberId = idStr(p.member);
              const name = p.member?.name || 'Member';
              const paid = paidThisCycle.has(memberId);
              const amountOwed = baseAmount * p.hands;
              const isGhost = p.member?.isGhost || p.member?.status === 'ghost' || !p.member?.userId;
              return (
                <div
                  key={memberId}
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
                      <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                        {name}
                        {isGhost && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">GHOST</span>
                        )}
                      </p>
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
                      onClick={() => markMemberPaid(memberId, name)}
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

      {/* Summary share modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[210] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white text-slate-800 rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 max-h-[85dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" aria-hidden="true" />

            <div className="flex justify-between items-start mb-4 gap-3">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">Share round update</h3>
                <p className="text-sm text-slate-500 mt-1">Send to your WhatsApp group. Everyone sees who paid and who hasn't.</p>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <pre className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 font-mono whitespace-pre-wrap break-words mb-4 leading-relaxed">
              {buildSummary()}
            </pre>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={copySummary}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  summaryCopied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {summaryCopied ? 'Copied!' : 'Copy text'}
              </button>
              <button
                onClick={shareSummaryWhatsApp}
                className="flex-[2] bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.9-10 9.9zm5.5-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1-1.3-.5-2.4-1.5c-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6c.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5s.1-.4 0-.5-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3 2.1 3.2 5.1 4.5c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"/>
                </svg>
                Share on WhatsApp
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              The message includes a "Powered by SplitAm" footer — viral distribution in your group.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const PendingRequestCard = ({ req, baseAmount, emptySlots, busy, onApprove, onReject }) => {
  const [editedHands, setEditedHands] = useState(req.requestedHands);
  const name = req.member?.name || 'Someone';
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
