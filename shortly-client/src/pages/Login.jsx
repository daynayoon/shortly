import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../api/axios.js'
import { useToast } from '../components/Toast.jsx'

export default function Login() {
  const navigate = useNavigate()
  const showToast = useToast()

  const handleSuccess = async (credentialResponse) => {
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
      navigate('/dashboard')
    } catch {
      showToast('Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Shortly</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your links</p>
        </div>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => showToast('Login failed. Please try again.')}
          width="100%"
          theme="outline"
          shape="rectangular"
        />
      </div>
    </div>
  )
}
