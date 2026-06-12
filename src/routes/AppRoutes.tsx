import { Navigate, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import TransactionsPage from '../pages/TransactionsPage'
import DailyOverviewPage from '../pages/DailyOverviewPage'
import CategoriesPage from '../pages/CategoriesPage'
import DashboardPage from '../pages/DashboardPage'
import ProfilePage from '../pages/ProfilePage'

function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">Loading session...</div>
  }

  return user ? <Navigate to="/transactions" replace /> : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}> 
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/daily-overview" element={<DailyOverviewPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
