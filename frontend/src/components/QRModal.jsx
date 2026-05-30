import { useEffect } from 'react'
import { X } from 'lucide-react'
import QRCode from 'react-qr-code'

export default function QRModal({ open, onClose, value, title = 'Scan to pay' }) {
  useEffect(() => {
    if (!open) return
    const onKeydown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Scan this QR code with any UPI app to authorize the mandate.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <div className="rounded-2xl bg-slate-50 p-6">
            <QRCode value={value ?? 'https://example.com'} size={168} />
          </div>
        </div>
      </div>
    </div>
  )
}
