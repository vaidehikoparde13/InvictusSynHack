import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { workerAPI } from '../../services/api'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await workerAPI.getTasks({})
      const data = response.data.data
      setStats({
        pending: data.pending?.length || 0,
        completed: data.completed?.length || 0,
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
        <h1>Worker Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link to="/worker/tasks" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <h2>View All Tasks</h2>
          <p>Manage your assigned tasks and update their status</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

