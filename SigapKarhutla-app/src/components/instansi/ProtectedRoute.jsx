import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Memuat…</div>
  }

  if (!session) {
    return <Navigate to="/instansi/login" replace />
  }

  return children
}
