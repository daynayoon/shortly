import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import api from '../api/axios.js'
import { useToast } from '../components/Toast.jsx'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

const toChartData = (map) =>
  Object.entries(map ?? {}).map(([name, value]) => ({ name, value }))

export default function Analytics() {
  const { shortCode } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const showToast = useToast()

  useEffect(() => {
    api.get(`/api/analytics/${shortCode}`)
      .then(({ data }) => setData(data))
      .catch(() => showToast('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [shortCode])

  const handleExport = async () => {
    try {
      const response = await api.get(`/api/analytics/${shortCode}/export`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${shortCode}-analytics.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast('Failed to export CSV.')
    }
  }

  if (loading) return <div className="text-center text-slate-400 py-20">Loading…</div>
  if (!data) return null

  const dateData = toChartData(data.clicksByDate)
  const countryData = toChartData(data.clicksByCountry)
  const deviceData = toChartData(data.clicksByDevice)
  const browserData = toChartData(data.clicksByBrowser)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-600">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Analytics — <span className="text-indigo-600">{shortCode}</span></h1>
        </div>
        <button
          onClick={handleExport}
          className="text-sm border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-4xl font-bold text-indigo-600">{data.totalClicks.toLocaleString()}</p>
        <p className="text-sm text-slate-500 mt-1">Total Clicks</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-4">Clicks over time</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dateData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">Device</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name }) => name}>
                {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">Browser</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={browserData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Country</p>
          <ul className="flex flex-col gap-2">
            {countryData.slice(0, 6).map(({ name, value }) => (
              <li key={name} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate">{name || 'Unknown'}</span>
                <span className="text-slate-400 font-medium">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
