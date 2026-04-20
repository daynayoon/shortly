import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import UrlCard from '../components/UrlCard.jsx'
import { useToast } from '../components/Toast.jsx'

export default function Dashboard() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const showToast = useToast()

  useEffect(() => {
    api.get('/api/urls')
      .then(({ data }) => setUrls(data))
      .catch(() => showToast('Failed to load your links.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleted = (id) => setUrls((prev) => prev.filter((u) => u.id !== id))

  const handleToggled = (id) =>
    setUrls((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u))

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Links</h1>
        <Link
          to="/"
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New Link
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-20">Loading…</div>
      ) : urls.length === 0 ? (
        <div className="text-center text-slate-400 py-20">
          <p>No links yet.</p>
          <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
            Shorten your first URL →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
