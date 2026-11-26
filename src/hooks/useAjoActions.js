import { useCallback, useState } from 'react'
import api from '../services/api'
import { confirm } from '../services/confirm'
import { toast } from '../services/toast'
import { apiError, naira, plural } from '../lib/format'

// Every ajo mutation in one place. Each call shows a toast and refreshes the group.
export default function useAjoActions(ajo, onUpdate) {
  const [busy, setBusy] = useState(false)

  const run = useCallback(
    async (request, success, fallback) => {
      setBusy(true)
      try {
        const res = await request()
        if (success) toast.success(typeof success === 'function' ? success(res) : success)
        onUpdate()
        return res
      } catch (err) {
        toast.error(apiError(err, fallback))
        return null
      } finally {
        setBusy(false)
      }
    },
    [onUpdate],
  )

  const id = ajo._id

  return {
    busy,

    requestHands: (hands, note) =>
      run(() => api.post('/ajo/request-hands', { ajoId: id, hands, note: note || undefined }), `Requested ${plural(hands, 'hand')}. Waiting for the admin.`, "Couldn't send request"),

    approveRequest: (requestId, name, approvedHands) =>
      run(() => api.post('/ajo/approve-hand-request', { ajoId: id, requestId, approvedHands }), `Approved ${plural(approvedHands, 'hand')} for ${name}`, "Couldn't approve"),

    rejectRequest: async (requestId, name) => {
      const ok = await confirm({ title: `Reject ${name}'s request?`, body: 'They can send a new request later.', confirmLabel: 'Reject', danger: true })
      if (ok) return run(() => api.post('/ajo/reject-hand-request', { ajoId: id, requestId }), `Rejected ${name}'s request`, "Couldn't reject")
      return null
    },

    assignHands: (memberId, name, slotPositions) =>
      run(() => api.post('/ajo/assign-hands', { ajoId: id, memberId, slotPositions }), `Gave ${name} ${plural(slotPositions.length, 'hand')}`, "Couldn't assign"),

    moveSlot: (slotIndex, direction) => run(() => api.post('/ajo/move-slot', { ajoId: id, slotIndex, direction }), null, "Couldn't move slot"),

    unassignSlot: async (slotIndex) => {
      const ok = await confirm({ title: `Clear slot ${slotIndex + 1}?`, body: 'The member keeps their place in the group. You can assign this slot again.', confirmLabel: 'Clear slot', danger: true })
      if (ok) return run(() => api.post('/ajo/unassign-slot', { ajoId: id, slotIndex }), 'Slot cleared', "Couldn't unassign")
      return null
    },

    launch: async () => {
      const ok = await confirm({ title: 'Start the ajo?', body: 'Members can’t change their hands once it starts. Round 1 begins now.', confirmLabel: 'Start ajo' })
      if (ok) return run(() => api.post('/ajo/launch', { ajoId: id }), 'Ajo started!', "Couldn't start ajo")
      return null
    },

    payMine: () => run(() => api.post('/ajo/contribute', { ajoId: id }), 'Your payment is recorded', "Couldn't record payment"),

    markPaid: (memberId, name) => run(() => api.post('/ajo/contribute', { ajoId: id, memberId }), `${name} marked as paid`, "Couldn't record payment"),

    disburse: async (slotIndex, name, pot) => {
      const ok = await confirm({
        title: `Send ${naira(pot)} to ${name}?`,
        body: 'Only do this after you’ve actually paid them. The ajo moves to the next round.',
        confirmLabel: 'Yes, pot sent',
      })
      if (ok) return run(() => api.post('/ajo/disburse', { ajoId: id, slotIndex }), 'Pot sent. Moving to the next round.', "Couldn't disburse")
      return null
    },

    toggleReminders: () => {
      const enabled = !ajo.autoRemindersEnabled
      return run(() => api.post('/ajo/toggle-reminders', { ajoId: id, enabled }), enabled ? 'Daily reminders turned on' : 'Daily reminders turned off', "Couldn't update setting")
    },

    sendReminders: async (unpaidCount) => {
      if (unpaidCount === 0) {
        toast.error('Everyone has paid this round')
        return null
      }
      const ok = await confirm({
        title: `Remind ${plural(unpaidCount, 'member')}?`,
        body: 'We’ll send a WhatsApp message to everyone who hasn’t paid this round, with SMS as a fallback.',
        confirmLabel: 'Send reminders',
      })
      if (!ok) return null
      return run(
        () => api.post('/ajo/send-reminders', { ajoId: id }),
        ({ data }) => {
          const { sent, skippedNoPhone, skippedCooldown, failed } = data.summary || {}
          const bits = []
          if (sent) bits.push(`Sent ${sent}`)
          if (skippedNoPhone) bits.push(`${skippedNoPhone} have no phone`)
          if (skippedCooldown) bits.push(`${skippedCooldown} reminded recently`)
          if (failed) bits.push(`${failed} failed`)
          return bits.length ? bits.join(' · ') : 'No reminders to send'
        },
        "Couldn't send reminders",
      )
    },
  }
}
