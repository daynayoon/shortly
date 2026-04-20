import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-indigo-600 tracking-tight text-lg">
          Shortly
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900">
                Logout
              </button>
              {user.profilePicture && (
                <img src={user.profilePicture} alt="" className="w-7 h-7 rounded-full" />
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
