// Pure helpers for reading an ajo document from the API.

// Pull an id string out of either a populated doc or a raw ObjectId.
export const idStr = (val) => {
  if (!val) return null
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val._id) return val._id.toString()
  return val.toString()
}

export const isGhostMember = (m) => Boolean(m && (m.isGhost || m.status === 'ghost' || !m.userId))

export const findMyMember = (members = [], userId) => members.find((m) => m.userId && m.userId.toString() === userId)

// Everything the ajo screens need, derived once from the raw ajo + group.
export function deriveAjo(ajo, members, currentUserId) {
  const rotation = ajo.rotation || []
  const totalRounds = ajo.totalRounds || rotation.length
  const baseAmount = ajo.contributionAmount
  const currentCycle = ajo.currentCycle || 1
  const status = ajo.cycleStatus

  const myMember = findMyMember(members, currentUserId)
  const myMemberId = idStr(myMember?._id)

  const filledSlots = rotation.filter((s) => s.member).length
  const emptySlots = rotation.length - filledSlots

  const myHandSlots = myMemberId
    ? rotation.map((slot, index) => ({ slot, index })).filter((x) => idStr(x.slot.member) === myMemberId)
    : []

  const paidThisCycle = new Set(
    (ajo.contributions || []).filter((c) => c.cycleIndex === currentCycle).map((c) => idStr(c.member)),
  )

  const participants = new Map()
  rotation.forEach((slot, index) => {
    if (!slot.member) return
    const id = idStr(slot.member)
    if (!participants.has(id)) participants.set(id, { id, member: slot.member, hands: 0, slotIndices: [] })
    const entry = participants.get(id)
    entry.hands += 1
    entry.slotIndices.push(index)
  })
  const uniqueParticipants = [...participants.values()]

  const potPerRound = baseAmount * totalRounds
  const collectedThisRound = uniqueParticipants
    .filter((p) => paidThisCycle.has(p.id))
    .reduce((sum, p) => sum + p.hands * baseAmount, 0)

  const pendingRequests = (ajo.handRequests || []).filter((r) => r.status === 'pending')
  const myPendingRequest = pendingRequests.find((r) => idStr(r.member) === myMemberId)

  const membersNotYetIn = members.filter((m) => !participants.has(idStr(m._id)))
  const recipientSlot = rotation[currentCycle - 1]

  return {
    totalRounds,
    baseAmount,
    currentCycle,
    isSetup: status === 'setup',
    isActive: status === 'active',
    isCompleted: status === 'completed',
    myMember,
    myMemberId,
    myHandSlots,
    myHandCount: myHandSlots.length,
    iHavePaid: Boolean(myMemberId && paidThisCycle.has(myMemberId)),
    filledSlots,
    emptySlots,
    paidThisCycle,
    uniqueParticipants,
    unpaidCount: uniqueParticipants.filter((p) => !paidThisCycle.has(p.id)).length,
    potPerRound,
    collectedThisRound,
    pendingRequests,
    myPendingRequest,
    membersNotYetIn,
    recipientSlot,
  }
}

// Dashboard summary for one ajo from /ajo/mine.
export function myStakeIn(ajo, currentUserId) {
  const rotation = ajo.rotation || []
  const mine = rotation
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => slot.member?.userId && slot.member.userId.toString() === currentUserId)
  const nextTurn = mine.find(({ slot, index }) => !slot.isPaidOut && index + 1 >= (ajo.currentCycle || 1))
  return {
    hands: mine.length,
    perRound: (ajo.contributionAmount || 0) * mine.length,
    nextTurnRound: nextTurn ? nextTurn.index + 1 : null,
    pot: (ajo.contributionAmount || 0) * (ajo.totalRounds || rotation.length),
  }
}

export function buildRoundSummary({ groupName, ajo, derived }) {
  const { currentCycle, totalRounds, potPerRound, recipientSlot, uniqueParticipants, paidThisCycle } = derived
  const paid = uniqueParticipants.filter((p) => paidThisCycle.has(p.id))
  const pending = uniqueParticipants.filter((p) => !paidThisCycle.has(p.id))
  const lines = [
    `📊 ${groupName || 'Group'} — ${ajo.title}`,
    '',
    `Round ${currentCycle} of ${totalRounds}`,
    `🎯 This round's pot: ₦${potPerRound.toLocaleString()}`,
    `👤 Going to: ${recipientSlot?.member?.name || 'TBD'}`,
    '',
  ]
  if (paid.length) lines.push(`✓ Paid (${paid.length}):`, ...paid.map((p) => `• ${p.member?.name || 'Member'}`), '')
  if (pending.length) lines.push(`⏳ Still pending (${pending.length}):`, ...pending.map((p) => `• ${p.member?.name || 'Member'}`), '')
  lines.push('Run your ajo on SplitAm 👇', 'https://split-am-frontend.vercel.app')
  return lines.join('\n')
}
