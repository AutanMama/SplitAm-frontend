import React, { useEffect, useState } from 'react';
import api from '../services/api';

const fmtAmount = (n) => `₦${Number(n || 0).toLocaleString()}`;

/**
 * Turn an activity entry into a human-readable sentence.
 * Falls back to a generic line if the actionType isn't recognized.
 */
const formatLine = (entry) => {
  const actor = entry.actorName || 'Someone';
  const target = entry.targetMemberName || '';
  const m = entry.metadata || {};

  switch (entry.actionType) {
    case 'GROUP_CREATED':
      return `${actor} created this group`;
    case 'GROUP_DELETED':
      return `${actor} deleted the group`;
    case 'MEMBER_ADDED_GHOST':
      return `${actor} added ${target} (no signup yet)`;
    case 'MEMBER_ADDED_EMAIL':
      return m.matchedExistingUser
        ? `${actor} added ${target} (matched an existing account by phone)`
        : `${actor} added ${target}`;
    case 'MEMBER_JOINED':
      return `${target || actor} joined the group`;
    case 'MEMBER_APPROVED':
      return `${actor} approved ${target} to join`;
    case 'MEMBER_REMOVED':
      return m.selfRemoval ? `${target} left the group` : `${actor} removed ${target}`;
    case 'MEMBER_INVITED':
      return m.ok
        ? `${actor} sent ${target} a WhatsApp invite`
        : `${actor} tried to invite ${target} (delivery failed)`;
    case 'AJO_CREATED':
      return `${actor} set up "${m.ajoTitle}" — ${m.totalRounds} rounds at ${fmtAmount(m.contributionAmount)} per hand`;
    case 'AJO_LAUNCHED':
      return `${actor} started "${m.ajoTitle}"`;
    case 'AJO_COMPLETED':
      return `"${m.ajoTitle}" completed — all ${m.totalRounds} rounds paid out`;
    case 'HAND_REQUEST_SUBMITTED':
      return `${target} requested ${m.hands} hand${m.hands === 1 ? '' : 's'} in "${m.ajoTitle}"`;
    case 'HAND_REQUEST_APPROVED':
      return `${actor} approved ${target} for ${m.hands} hand${m.hands === 1 ? '' : 's'} in "${m.ajoTitle}"`;
    case 'HAND_REQUEST_REJECTED':
      return `${actor} rejected ${target}'s request for ${m.hands} hand${m.hands === 1 ? '' : 's'}`;
    case 'HANDS_ASSIGNED':
      return `${actor} assigned ${m.hands} hand${m.hands === 1 ? '' : 's'} to ${target} in "${m.ajoTitle}"`;
    case 'SLOT_MOVED':
      return `${actor} moved a slot from #${(m.fromIndex ?? 0) + 1} to #${(m.toIndex ?? 0) + 1} in "${m.ajoTitle}"`;
    case 'SLOT_UNASSIGNED':
      return target
        ? `${actor} cleared ${target} from slot #${(m.slotIndex ?? 0) + 1} in "${m.ajoTitle}"`
        : `${actor} cleared an empty slot in "${m.ajoTitle}"`;
    case 'CONTRIBUTION_RECORDED':
      return m.recordedBySelf
        ? `${target} paid ${fmtAmount(m.amount)} for round ${m.cycleIndex} of "${m.ajoTitle}"`
        : `${actor} marked ${target} as paid for round ${m.cycleIndex} of "${m.ajoTitle}" (${fmtAmount(m.amount)})`;
    case 'POT_DISBURSED':
      return `${actor} sent the round-${m.cycleIndex} pot of ${fmtAmount(m.amount)} to ${target} in "${m.ajoTitle}"`;
    case 'REMINDERS_SENT': {
      const sentBits = [`Sent ${m.count}`];
      if (m.skippedNoPhone) sentBits.push(`${m.skippedNoPhone} had no phone`);
      if (m.skippedCooldown) sentBits.push(`${m.skippedCooldown} reminded recently`);
      if (m.failed) sentBits.push(`${m.failed} failed`);
      return `${actor} sent reminders for round ${m.cycleIndex} of "${m.ajoTitle}" — ${sentBits.join(' · ')}`;
    }
    default:
      return `${actor} did ${entry.actionType}`;
  }
};

const relativeTime = (iso) => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const COLOR_BY_ACTION = {
  GROUP_CREATED: 'bg-emerald-100 text-emerald-700',
  GROUP_DELETED: 'bg-rose-100 text-rose-700',
  MEMBER_ADDED_GHOST: 'bg-amber-100 text-amber-700',
  MEMBER_ADDED_EMAIL: 'bg-emerald-100 text-emerald-700',
  MEMBER_JOINED: 'bg-emerald-100 text-emerald-700',
  MEMBER_APPROVED: 'bg-emerald-100 text-emerald-700',
  MEMBER_REMOVED: 'bg-rose-100 text-rose-700',
  MEMBER_INVITED: 'bg-emerald-100 text-emerald-700',
  AJO_CREATED: 'bg-slate-200 text-slate-700',
  AJO_LAUNCHED: 'bg-emerald-100 text-emerald-700',
  AJO_COMPLETED: 'bg-emerald-100 text-emerald-700',
  HAND_REQUEST_SUBMITTED: 'bg-amber-100 text-amber-700',
  HAND_REQUEST_APPROVED: 'bg-emerald-100 text-emerald-700',
  HAND_REQUEST_REJECTED: 'bg-rose-100 text-rose-700',
  HANDS_ASSIGNED: 'bg-emerald-100 text-emerald-700',
  SLOT_MOVED: 'bg-slate-200 text-slate-700',
  SLOT_UNASSIGNED: 'bg-slate-200 text-slate-700',
  CONTRIBUTION_RECORDED: 'bg-emerald-100 text-emerald-700',
  POT_DISBURSED: 'bg-amber-100 text-amber-700',
  REMINDERS_SENT: 'bg-slate-200 text-slate-700',
};

const ActivityFeed = ({ groupId, refreshKey }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/groups/${groupId}/activity?limit=50`)
      .then(({ data }) => {
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [groupId, refreshKey]);

  const visible = expanded ? entries : entries.slice(0, 5);

  return (
    <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-800">Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">Every action in this group, visible to everyone.</p>
        </div>
        {entries.length > 5 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all shrink-0"
          >
            {expanded ? 'Show recent' : `Show all (${entries.length})`}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center">
          Nothing has happened yet. Actions will show up here.
        </p>
      ) : (
        <ol className="space-y-3 relative">
          {visible.map((entry, i) => {
            const dot = COLOR_BY_ACTION[entry.actionType] || 'bg-slate-200 text-slate-700';
            const isLast = i === visible.length - 1;
            return (
              <li key={entry._id} className="flex gap-3 relative">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${dot}`} aria-hidden="true" />
                  {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm text-slate-700 leading-snug">{formatLine(entry)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{relativeTime(entry.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default ActivityFeed;
