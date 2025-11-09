import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerAPI } from '../../services/api' // or '../../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const WorkerDashboard = () => {
  const [pendingTasks, setPendingTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [dropdownOpenId, setDropdownOpenId] = useState(null) // track which task dropdown is open
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await workerAPI.getTasks({})
      const data = response.data.data

      setPendingTasks(data.pending || [])
      setCompletedTasks(data.completed || [])
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await workerAPI.updateTaskStatus(id, newStatus, '')
      toast.success(`Task marked as ${newStatus}`)
      setDropdownOpenId(null)
      fetchTasks()
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id)
  }

  const getStatusBadge = (status) => {
    const badges = {
      Assigned: 'badge-assigned',
      'In Progress': 'badge-in-progress',
      'Worker Pending': 'badge-pending',
      Completed: 'badge-completed',
      Resolved: 'badge-resolved',
      'Cannot be Resolved': 'badge-rejected',
    }
    return <span className={`badge ${badges[status] || ''}`}>{status}</span>
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>Worker Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* LEFT SIDE (70%) — Pending Tasks */}
        <div style={{ flex: 7 }}>
          <h2 style={{ marginBottom: '10px' }}>Pending Tasks</h2>
          {pendingTasks.length === 0 ? (
            <div className="card">
              <p>No pending tasks found.</p>
            </div>
          ) : (
            <table className="task-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Title</th>
                  <th style={{ padding: '10px' }}>Assigned</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTasks.map((task) => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{task.id}</td>
                    <td style={{ padding: '10px' }}>{task.title}</td>
                    <td style={{ padding: '10px' }}>
                      {format(new Date(task.assigned_at || task.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td style={{ padding: '10px' }}>{getStatusBadge(task.status)}</td>
                    <td style={{ padding: '10px', position: 'relative' }}>
                      <button
                        className="btn btn-primary"
                        style={{ marginRight: '10px', padding: '5px 10px' }}
                        onClick={() => navigate(`/worker/tasks/${task.id}`)}
                      >
                        View Details
                      </button>

                      {/* Update Status Dropdown */}
                      <div style={{ display: 'inline-block', position: 'relative' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px' }}
                          onClick={() => toggleDropdown(task.id)}
                        >
                          Update Status ▾
                        </button>
                        {dropdownOpenId === task.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '35px',
                              left: 0,
                              background: '#fff',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                              zIndex: 10,
                              width: '160px',
                            }}
                          >
                            <button
                              style={dropdownItemStyle}
                              onClick={() => handleUpdateStatus(task.id, 'Resolved')}
                            >
                              Resolved
                            </button>
                            <button
                              style={dropdownItemStyle}
                              onClick={() => handleUpdateStatus(task.id, 'Cannot be Resolved')}
                            >
                              Can't be Resolved
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT SIDE (30%) — Completed Tasks */}
        <div style={{ flex: 3 }}>
          <h2 style={{ marginBottom: '10px' }}>Completed Tasks</h2>
          {completedTasks.length === 0 ? (
            <div className="card">
              <p>No completed tasks yet.</p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '8px',
                maxHeight: '75vh',
                overflowY: 'auto',
              }}
            >
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <h4 style={{ margin: 0 }}>{task.title}</h4>
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    {format(new Date(task.assigned_at || task.created_at), 'MMM dd, yyyy')}
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '5px 10px', fontSize: '13px' }}
                    onClick={() => navigate(`/worker/tasks/${task.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const dropdownItemStyle = {
  display: 'block',
  width: '100%',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: '14px',
}

export default WorkerDashboard
