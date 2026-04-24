import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useToast } from '../components/Toast.jsx'

const card = { background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 8px 32px rgba(99,102,241,0.06)' }
const inputStyle = { width: '100%', padding: '11px 14px', fontSize: 14, color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, fontFamily: 'Inter, sans-serif', outline: 'none', display: 'block' }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [title, setTitle] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const showToast = useToast()

  const isLoggedIn = !!localStorage.getItem('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!originalUrl.trim()) return
    if (!originalUrl.startsWith('http')) { showToast('URL must start with http:// or https://'); return }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/urls/shorten', { originalUrl, title })
      setResult(data)
      showToast('Link shortened!', 'success')
    } catch {
      showToast('Failed to shorten URL. Please check the link and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.shortUrl).catch(() => {})
    setCopied(true)
    showToast('Copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1.5px', color: '#0f172a', lineHeight: 1.1, marginBottom: 12 }}>
            Shorten any link
          </h1>
          <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.6 }}>
            Paste a long URL and get a short, shareable link instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ ...card, padding: 28 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>URL</label>
            <input
              type="url"
              placeholder="https://example.com/very/long/url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Title <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="My awesome link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? '#818cf8' : '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = '#4f46e5' }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = '#6366f1' }}
          >
            {loading ? 'Shortening…' : 'Shorten link'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 16, ...card, padding: '20px 24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Your short link
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a href={result.shortUrl} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 18, fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
                {result.shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                style={{ background: copied ? '#10b981' : '#eef2ff', color: copied ? '#fff' : '#6366f1', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {!isLoggedIn && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: '#eef2ff', borderRadius: 10, fontSize: 13, color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Want to track clicks?</span>
                <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
