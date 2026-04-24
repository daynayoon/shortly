import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../api/axios.js'
import { useToast } from '../components/Toast.jsx'

export default function Login() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/google', {
        credential: credentialResponse.credential,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        name: data.name,
        profilePicture: data.profilePicture,
      }))
      showToast('Signed in with Google!', 'success')
      navigate('/dashboard')
    } catch {
      showToast('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: '#6366f1', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.7px', color: '#0f172a', marginBottom: 8 }}>
            Sign in to Shortly
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5 }}>
            Track clicks, manage links, and view analytics.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 8px 32px rgba(99,102,241,0.06)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {loading ? (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 0', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15, fontWeight: 600, color: '#64748b', background: '#f8fafc' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Signing in…
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => showToast('Login failed. Please try again.')}
                width="336"
                theme="outline"
                shape="rectangular"
                size="large"
              />
            )}
          </div>

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Secure sign-in</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '1.', text: 'Your data is encrypted and never shared' },
              { icon: '2.', text: 'Full analytics and link management' },
              { icon: '3.', text: 'Free to get started, no credit card' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
          By continuing, you agree to Shortly's{' '}
          <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
          {' '}and{' '}
          <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}
