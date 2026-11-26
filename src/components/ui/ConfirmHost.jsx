import { useCallback, useEffect, useState } from 'react'
import Sheet from './Sheet'
import Button from './Button'
import { subscribeToConfirm } from '../../services/confirm'

export default function ConfirmHost() {
  const [request, setRequest] = useState(null)

  useEffect(() => subscribeToConfirm(setRequest), [])

  const settle = useCallback(
    (answer) => {
      request?.resolve(answer)
      setRequest(null)
    },
    [request],
  )

  const cancel = useCallback(() => settle(false), [settle])

  return (
    <Sheet
      open={Boolean(request)}
      onClose={cancel}
      title={request?.title}
      description={request?.body}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={cancel}>
            {request?.cancelLabel || 'Cancel'}
          </Button>
          <Button variant={request?.danger ? 'danger' : 'primary'} className="flex-[1.4]" onClick={() => settle(true)}>
            {request?.confirmLabel || 'Continue'}
          </Button>
        </>
      }
    />
  )
}
