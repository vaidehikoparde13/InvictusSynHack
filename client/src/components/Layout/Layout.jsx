import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getNavLinks = () => {
    if (user?.role === 'resident') {
      return (
        <>
          <Link to="/resident/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/resident/complaints" className="navbar-link">My Complaints</Link>
        </>
      )
    }
    if (user?.role === 'admin') {
      return (
        <>
          <Link to="/admin/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/admin/complaints" className="navbar-link">Complaints</Link>
          <Link to="/admin/analytics" className="navbar-link">Analytics</Link>
        </>
      )
    }
    if (user?.role === 'worker') {
      return (
        <>
          <Link to="/worker/dashboard" className="navbar-link">Dashboard</Link>
        </>
      )
    }
    return null
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">VNIT Grievance System</div>
          <div className="navbar-menu">
            {getNavLinks()}
            <div className="navbar-user">
              <span>{user?.full_name} ({user?.role})</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

