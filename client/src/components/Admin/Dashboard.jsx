import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getAnalytics()
      const data = response.data.data
      setStats({
        total: data.totalComplaints,
        pending: data.pendingComplaints,
        inProgress: data.inProgressComplaints,
        resolved: data.resolvedComplaints,
      })
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <Link to="/admin/complaints" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>Manage Complaints</h2>
          <p>View, approve, reject, and assign complaints</p>
        </Link>
        <Link to="/admin/analytics" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>Analytics</h2>
          <p>View detailed analytics and reports</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

