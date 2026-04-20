import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useToast } from './Toast.jsx'

export default function UrlCard({ url, onDeleted, onToggled }) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const showToast = useToast()

  const shortCode = url.shortUrl.split('/').pop()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url.shortUrl)
    showToast('Copied to clipboard!', 'success')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this link?')) return
    setLoading(true)
    try {
      await api.delete(`/api/urls/${url.id}`)
      onDeleted(url.id)
    } catch {
      showToast('Failed to delete link.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setLoading(true)
    try {
      await api.patch(`/api/urls/${url.id}/toggle`)
      onToggled(url.id)
    } catch {
      showToast('Failed to update link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white border rounded-xl p-4 flex flex-col gap-2 ${url.isActive ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-800 truncate">{url.title || url.originalUrl}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{url.originalUrl}</p>
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${url.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
          {url.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={url.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 text-sm font-medium hover:underline truncate"
        >
          {url.shortUrl}
        </a>
        <button onClick={copyToClipboard} className="shrink-0 text-xs text-slate-400 hover:text-slate-700">
          Copy
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
        <span>{url.clickCount} clicks</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/analytics/${shortCode}`)}
            className="hover:text-indigo-600"
          >
            Analytics
          </button>
          <button
            onClick={handleToggle}
            disabled={loading}
            className="hover:text-slate-700"
          >
            {url.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="hover:text-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
