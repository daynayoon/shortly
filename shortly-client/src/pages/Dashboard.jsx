import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import UrlCard from '../components/UrlCard.jsx'
import { useToast } from '../components/Toast.jsx'

const inputStyle = { width: '100%', padding: '11px 14px', fontSize: 14, color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, fontFamily: 'Inter, sans-serif', outline: 'none', display: 'block' }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
      {[80, 100, 60].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 14 : 12, width: `${w}%`, background: '#f1f5f9', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
      <div style={{ height: 36, background: '#f1f5f9', borderRadius: 8, marginTop: 16, animation: 'pulse 1.4s ease-in-out infinite' }} />
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ width: 80, height: 80, background: '#eef2ff', borderRadius: 20, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No links yet</h3>
      <p style={{ fontSize: 15, color: '#64748b', marginBottom: 24 }}>Create your first short link to get started</p>
      <button
        onClick={onNew}
        style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
      >
        Shorten your first URL →
      </button>
    </div>
  )
}

export default function Dashboard() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const showToast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/urls')
      .then(({ data }) => setUrls(data))
      .catch(() => showToast('Failed to load your links.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newUrl.trim()) { showToast('Enter a URL'); return }
    setCreating(true)
    try {
      const { data } = await api.post('/api/urls/shorten', { originalUrl: newUrl, title: newTitle })
      setUrls((prev) => [data, ...prev])
      showToast('Link created!', 'success')
      setShowModal(false); setNewUrl(''); setNewTitle('')
    } catch {
      showToast('Failed to create link.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleted = (id) => setUrls((prev) => prev.filter((u) => u.id !== id))
  const handleToggled = (id) => setUrls((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u))

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.6px', color: '#0f172a', marginBottom: 4 }}>My Links</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>{urls.length} link{urls.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Link
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(2px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>New Short Link</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>URL</label>
              <input
                autoFocus
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="https://example.com/…"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = '#fff' }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Title <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="My link"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = '#fff' }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{ flex: 2, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: creating ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: creating ? 0.8 : 1 }}
              >
                {creating ? 'Creating…' : 'Create link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : urls.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 16 }}>
          {urls.map((url) => (
            <UrlCard
              key={url.id}
              url={url}
              onDeleted={handleDeleted}
              onToggled={handleToggled}
            />
          ))}
        </div>
      )}
    </div>
  )
}
