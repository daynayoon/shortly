import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useToast } from './Toast.jsx'

export default function UrlCard({ url, onDeleted, onToggled }) {
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()
  const showToast = useToast()

  const shortCode = url.shortUrl?.split('/').pop() ?? ''
  const createdDate = url.createdAt ? new Date(url.createdAt).toISOString().slice(0, 10) : ''

  const copy = () => {
    navigator.clipboard.writeText(url.shortUrl).catch(() => {})
    setCopied(true)
    showToast('Copied!', 'success')
    setTimeout(() => setCopied(false), 2000)
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
      showToast(url.isActive ? 'Link deactivated' : 'Link activated', 'success')
    } catch {
      showToast('Failed to update link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 20,
        border: '1px solid #e2e8f0',
        boxShadow: hover ? '0 4px 20px rgba(99,102,241,0.09)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s, transform 0.15s',
        transform: hover ? 'translateY(-1px)' : 'none',
        position: 'relative',
      }}
    >
      {/* Status dot */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: url.isActive ? '#10b981' : '#cbd5e1' }} />
        <span style={{ fontSize: 12, color: url.isActive ? '#10b981' : '#94a3b8', fontWeight: 500 }}>
          {url.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div style={{ paddingRight: 70 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {url.title || 'Untitled'}
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 14 }}>
          {url.originalUrl}
        </p>
      </div>

      {/* Short URL + copy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <a href={url.shortUrl} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', flex: 1, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >{url.shortUrl}</a>
        <button
          onClick={copy}
          style={{ background: copied ? '#10b981' : '#eef2ff', color: copied ? '#fff' : '#6366f1', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>

      {/* Clicks + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          {(url.clickCount ?? 0).toLocaleString()} clicks
        </span>
        {createdDate && <span style={{ fontSize: 12, color: '#94a3b8' }}>Created {createdDate}</span>}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
        <button
          onClick={() => navigate(`/analytics/${shortCode}`, { state: { shortUrl: url.shortUrl } })}
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 12px', fontSize: 13, color: '#334155', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Analytics
        </button>

        {/* Toggle */}
        <div onClick={handleToggle} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, cursor: loading ? 'default' : 'pointer' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>{url.isActive ? 'Enabled' : 'Disabled'}</span>
          <div style={{ width: 36, height: 20, background: url.isActive ? '#6366f1' : '#cbd5e1', borderRadius: 10, position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: url.isActive ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{ background: 'none', border: 'none', padding: '6px 8px', cursor: 'pointer', color: '#94a3b8', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
