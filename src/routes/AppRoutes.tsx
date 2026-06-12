import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import TransactionsPage from '../pages/TransactionsPage'
import DailyOverviewPage from '../pages/DailyOverviewPage'
import CategoriesPage from '../pages/CategoriesPage'
import DashboardPage from '../pages/DashboardPage'
import ProfilePage from '../pages/ProfilePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TransactionsPage />} />
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
