import { useMemo, useState } from 'react'
import AjoHero from './AjoHero'
import SetupBanner from './SetupBanner'
import MyHandsCard from './MyHandsCard'
import RequestHandsCard from './RequestHandsCard'
import HandRequests from './HandRequests'
import AssignHands from './AssignHands'
import Rotation from './Rotation'
import Payments from './Payments'
import ShareUpdateSheet from './ShareUpdateSheet'
import useAjoActions from '../../hooks/useAjoActions'
import { buildRoundSummary, deriveAjo } from '../../lib/ajo'

export default function AjoPanel({ group, isAdmin, currentUserId, onUpdate }) {
  const ajo = group.activeAjo
  const derived = useMemo(() => deriveAjo(ajo, group.members || [], currentUserId), [ajo, group.members, currentUserId])
  const actions = useAjoActions(ajo, onUpdate)
  const [sharing, setSharing] = useState(false)
  const { busy } = actions

  return (
    <div className="space-y-4">
      <AjoHero ajo={ajo} derived={derived} />

      {derived.isSetup && <SetupBanner derived={derived} isAdmin={isAdmin} busy={busy} onLaunch={actions.launch} />}

      {derived.myHandCount > 0 && <MyHandsCard derived={derived} busy={busy} onPay={actions.payMine} />}

      {derived.myMember && derived.myHandCount === 0 && !derived.isCompleted && <RequestHandsCard derived={derived} busy={busy} onRequest={actions.requestHands} />}

      {isAdmin && derived.pendingRequests.length > 0 && <HandRequests derived={derived} busy={busy} actions={actions} />}

      {isAdmin && derived.isSetup && derived.emptySlots > 0 && derived.membersNotYetIn.length > 0 && (
        <AssignHands ajo={ajo} derived={derived} busy={busy} onAssign={actions.assignHands} />
      )}

      {isAdmin && derived.isActive && derived.uniqueParticipants.length > 0 && <Payments ajo={ajo} derived={derived} busy={busy} actions={actions} onShare={() => setSharing(true)} />}

      <Rotation ajo={ajo} derived={derived} isAdmin={isAdmin} busy={busy} actions={actions} />

      <ShareUpdateSheet open={sharing} onClose={() => setSharing(false)} text={sharing ? buildRoundSummary({ groupName: group.name, ajo, derived }) : ''} />
    </div>
  )
}
