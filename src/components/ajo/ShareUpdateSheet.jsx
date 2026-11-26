import { useState } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'
import { toast } from '../../services/toast'

export default function ShareUpdateSheet({ open, onClose, text }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Summary copied. Paste it in your WhatsApp group.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy. Long-press the text to select it.")
    }
  }

  function shareOnWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Share round update"
      description="Send it to your WhatsApp group so everyone sees who has paid."
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={copy}>
            <Copy className="size-4" aria-hidden /> {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button className="flex-[1.6]" onClick={shareOnWhatsApp}>
            <MessageCircle className="size-4" aria-hidden /> Share on WhatsApp
          </Button>
        </>
      }
    >
      <pre className="rounded-2xl bg-sunk p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">{text}</pre>
    </Sheet>
  )
}
