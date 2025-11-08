import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { toast } from 'react-toastify'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics()
      setAnalytics(response.data.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!analytics) return null

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>Analytics Dashboard</h1>

      <div className="dashboard-stats" style={{ marginTop: '30px' }}>
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <div className="stat-value">{analytics.totalComplaints}</div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Shows workload and scale of issues
          </p>
        </div>
        <div className="stat-card">
          <h3>Resolved Complaints</h3>
          <div className="stat-value">{analytics.resolvedComplaints}</div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Indicates overall efficiency
          </p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-value">{analytics.inProgressComplaints}</div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Active issues under repair
          </p>
        </div>
        <div className="stat-card">
          <h3>Pending Complaints</h3>
          <div className="stat-value">{analytics.pendingComplaints}</div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Shows backlog or unassigned issues
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Resolution Time</h3>
          <div className="stat-value">{analytics.avgResolutionTimeDays} days</div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Performance KPI
          </p>
        </div>
        <div className="stat-card">
          <h3>Active Workers</h3>
          <div className="stat-value">{analytics.activeWorkers} / {analytics.totalWorkers}</div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Available maintenance staff
          </p>
        </div>
      </div>

      {analytics.pendingTimeStats && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Pending Time Analysis</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {analytics.pendingTimeStats.pending_24h || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Pending up to 24 hours</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {analytics.pendingTimeStats.pending_48h || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Pending up to 48 hours</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14' }}>
                {analytics.pendingTimeStats.pending_72h || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Pending up to 72 hours</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {analytics.pendingTimeStats.pending_120h || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Pending up to 120 hours</div>
            </div>
          </div>
        </div>
      )}

      {analytics.categoryStats && analytics.categoryStats.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Complaints by Category</h2>
          <table style={{ marginTop: '20px' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {analytics.categoryStats.map((stat) => (
                <tr key={stat.category}>
                  <td>{stat.category}</td>
                  <td>{stat.count}</td>
                  <td>{stat.resolved}</td>
                  <td>{stat.count - stat.resolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Analytics

