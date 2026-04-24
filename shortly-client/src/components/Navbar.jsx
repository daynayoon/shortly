import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to="/" style={{ fontSize: 20, fontWeight: 700, color: '#6366f1', letterSpacing: '-0.5px', textDecoration: 'none' }}>
        Shortly
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <Link
              to="/dashboard"
              style={{ fontSize: 14, fontWeight: location.pathname === '/dashboard' ? 600 : 500, color: location.pathname === '/dashboard' ? '#6366f1' : '#334155', textDecoration: 'none' }}
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b', fontFamily: 'Inter, sans-serif', padding: '6px 0' }}
            >
              Logout
            </button>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {initial}
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            style={{ background: '#6366f1', color: '#fff', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
