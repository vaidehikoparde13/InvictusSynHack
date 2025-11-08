import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import ResidentDashboard from './components/Resident/Dashboard'
import ResidentComplaints from './components/Resident/Complaints'
import ResidentComplaintDetail from './components/Resident/ComplaintDetail'
import AdminDashboard from './components/Admin/Dashboard'
import AdminComplaints from './components/Admin/Complaints'
import AdminAnalytics from './components/Admin/Analytics'
import WorkerDashboard from './components/Worker/Dashboard'
import WorkerTasks from './components/Worker/Tasks'
import WorkerTaskDetail from './components/Worker/TaskDetail'
import Layout from './components/Layout/Layout'
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (user) {
    // Redirect based on role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />
    return <Navigate to="/resident/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Resident Routes */}
          <Route path="/resident" element={
            <ProtectedRoute allowedRoles={['resident']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ResidentDashboard />} />
            <Route path="complaints" element={<ResidentComplaints />} />
            <Route path="complaints/:id" element={<ResidentComplaintDetail />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Worker Routes */}
          <Route path="/worker" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="tasks" element={<WorkerTasks />} />
            <Route path="tasks/:id" element={<WorkerTaskDetail />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  )
}

export default App

