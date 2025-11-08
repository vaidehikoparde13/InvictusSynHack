import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await workerAPI.getTasks(params)
      const data = response.data.data
      setTasks(data.all || [])
      setPendingTasks(data.pending || [])
      setCompletedTasks(data.completed || [])
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      Assigned: 'badge-assigned',
      'In Progress': 'badge-in-progress',
      'Worker Pending': 'badge-pending',
      Completed: 'badge-completed',
      Resolved: 'badge-resolved',
      Rejected: 'badge-rejected',
    }
    return <span className={`badge ${badges[status] || ''}`}>{status}</span>
  }

  const displayTasks = filter === 'pending' ? pendingTasks : filter === 'completed' ? completedTasks : tasks

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>My Tasks</h1>

      <div className="filters" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Pending ({pendingTasks.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          {displayTasks.length === 0 ? (
            <div className="card">
              <p>No tasks found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.category}</td>
                    <td>{getStatusBadge(task.status)}</td>
                    <td>{task.priority}</td>
                    <td>{format(new Date(task.assigned_at || task.created_at), 'MMM dd, yyyy')}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/worker/tasks/${task.id}`)}
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default Tasks

