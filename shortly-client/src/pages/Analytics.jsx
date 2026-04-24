import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import api from '../api/axios.js'
import { useToast } from '../components/Toast.jsx'

const toChartData = (map) =>
  Object.entries(map ?? {}).map(([name, value]) => ({ name, value }))

const DEVICE_COLORS = ['#6366f1', '#a5b4fc', '#e0e7ff']

export default function Analytics() {
  const { shortCode } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
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

  if (loading) return (
    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px 0', fontSize: 15 }}>Loading…</div>
  )
  if (!data) return null

  const dateData = toChartData(data.clicksByDate)
  const deviceData = toChartData(data.clicksByDevice).map((d, i) => ({ ...d, color: DEVICE_COLORS[i % DEVICE_COLORS.length] }))
  const browserData = toChartData(data.clicksByBrowser)
  const countryData = toChartData(data.clicksByCountry)
  const totalMax = browserData.reduce((s, d) => s + d.value, 0) || 1

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 12px' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 24, padding: 0 }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
      >
        ← Dashboard
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.6px', color: '#0f172a', marginBottom: 4 }}>Analytics</h1>
          <a href={state?.shortUrl ?? shortCode} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 500, color: '#6366f1', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >{state?.shortUrl ?? shortCode}</a>
        </div>
        <button
          onClick={handleExport}
          style={{ background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Hero card */}
      <div style={{ background: '#6366f1', borderRadius: 20, padding: '32px 40px', marginBottom: 20, color: '#fff' }}>
        <p style={{ fontSize: 13, fontWeight: 500, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Total Clicks
        </p>
        <p style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1 }}>
          {data.totalClicks.toLocaleString()}
        </p>
      </div>

      {/* Clicks over time */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', border: '1px solid #e2e8f0', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 20 }}>Clicks over time</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dateData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#6366f1', stroke: '#fff', strokeWidth: 2, r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 3-col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {/* Devices */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 16 }}>Devices</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={42}>
                {deviceData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {deviceData.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                  <span style={{ fontSize: 13, color: '#475569' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 16 }}>Browsers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {browserData.map((b) => (
              <div key={b.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>{b.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{b.value}</span>
                </div>
                <div style={{ height: 7, background: '#f1f5f9', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${Math.round((b.value / totalMax) * 100)}%`, background: '#6366f1', borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 16 }}>Top Countries</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {countryData.slice(0, 7).map(({ name, value }, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#94a3b8', width: 16, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>{name || 'Unknown'}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
