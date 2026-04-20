import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useToast } from '../components/Toast.jsx'

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [title, setTitle] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const showToast = useToast()

  const isLoggedIn = !!localStorage.getItem('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!originalUrl.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/urls/shorten', { originalUrl, title })
      setResult(data)
    } catch {
      showToast('Failed to shorten URL. Please check the link and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.shortUrl)
    showToast('Copied to clipboard!', 'success')
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Shorten any link</h1>
          <p className="text-slate-500 mt-2">Paste a long URL and get a short, shareable link instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
          <input
            type="url"
            placeholder="https://example.com/very/long/url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Shortening…' : 'Shorten'}
          </button>
        </form>

        {result && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Your short link</p>
            <div className="flex items-center gap-3">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-medium text-sm hover:underline truncate"
              >
                {result.shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="shrink-0 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-100 font-medium"
              >
                Copy
              </button>
            </div>
            {!isLoggedIn && (
              <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                Want to track clicks and manage your links?{' '}
                <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
