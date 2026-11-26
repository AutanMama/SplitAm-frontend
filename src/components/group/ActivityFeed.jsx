import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import api from '../../services/api';
import { relativeTime } from '../../lib/format';

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

const GOOD = new Set(['GROUP_CREATED', 'MEMBER_ADDED_EMAIL', 'MEMBER_JOINED', 'MEMBER_APPROVED', 'MEMBER_INVITED', 'AJO_LAUNCHED', 'AJO_COMPLETED', 'HAND_REQUEST_APPROVED', 'HANDS_ASSIGNED', 'CONTRIBUTION_RECORDED'])
const WAITING = new Set(['MEMBER_ADDED_GHOST', 'HAND_REQUEST_SUBMITTED', 'POT_DISBURSED'])
const BAD = new Set(['GROUP_DELETED', 'MEMBER_REMOVED', 'HAND_REQUEST_REJECTED'])

const dotFor = (type) => (GOOD.has(type) ? 'bg-paid' : WAITING.has(type) ? 'bg-due' : BAD.has(type) ? 'bg-danger' : 'bg-muted/50')

const ActivityFeed = ({ groupId, refreshKey }) => {
  // Loading is derived: we're loading until the stored result belongs to the current request.
  const requestKey = `${groupId}:${refreshKey}`;
  const [result, setResult] = useState({ key: null, entries: [] });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/groups/${groupId}/activity?limit=50`)
      .then(({ data }) => {
        if (!cancelled) setResult({ key: requestKey, entries: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, entries: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, requestKey]);

  const loading = result.key !== requestKey && result.entries.length === 0;
  const { entries } = result;
  const visible = expanded ? entries : entries.slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="Activity"
        description="Every action in this group, visible to everyone."
        action={
          entries.length > 5 && (
            <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Show recent' : `Show all (${entries.length})`}
            </Button>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">Nothing has happened yet. Actions will show up here.</p>
      ) : (
        <ol>
          {visible.map((entry, i) => (
            <li key={entry._id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < visible.length - 1 && <span className="absolute top-4 bottom-0 left-[4px] w-px bg-line" aria-hidden />}
              <span className={`relative mt-1.5 size-2.5 shrink-0 rounded-full ${dotFor(entry.actionType)}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{formatLine(entry)}</p>
                <p className="mt-0.5 text-xs text-muted">{relativeTime(entry.createdAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
};

export default ActivityFeed;
