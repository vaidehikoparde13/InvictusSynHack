import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workerAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [resolution, setResolution] = useState('')
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      const response = await workerAPI.getTask(id)
      setTask(response.data.data)
      setStatus(response.data.data.status)
      setFiles(response.data.data.proof_of_work || [])
    } catch (error) {
      toast.error('Failed to load task details')
      navigate('/worker/tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!status) {
      toast.error('Please select a status')
      return
    }

    setUpdating(true)
    try {
      await workerAPI.updateTaskStatus(id, status, resolution)
      toast.success('Status updated successfully')
      fetchTask()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      await workerAPI.uploadProof(id, selectedFiles)
      toast.success('Proof of work uploaded successfully')
      fetchTask()
    } catch (error) {
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
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

  if (loading) return <div className="loading">Loading...</div>
  if (!task) return null

  return (
    <div className="container" style={{ padding: '20px' }}>
      <button onClick={() => navigate('/worker/tasks')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Tasks
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1>{task.title}</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>
              Assigned: {format(new Date(task.assigned_at || task.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div>
            {getStatusBadge(task.status)}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Details</h3>
          <p><strong>Category:</strong> {task.category}</p>
          {task.subcategory && <p><strong>Subcategory:</strong> {task.subcategory}</p>}
          <p><strong>Priority:</strong> {task.priority}</p>
          {task.floor && <p><strong>Floor:</strong> {task.floor}</p>}
          {task.room && <p><strong>Room:</strong> {task.room}</p>}
          {task.resident_name && <p><strong>Resident:</strong> {task.resident_name}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Description</h3>
          <p>{task.description}</p>
        </div>

        {task.attachments && task.attachments.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Complaint Attachments</h3>
            {task.attachments.map((file, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <a href={`http://localhost:5000${file.file_path}`} target="_blank" rel="noopener noreferrer">
                  {file.filename}
                </a>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <h3>Update Status</h3>
          <div className="form-group">
            <label>Status *</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          {status === 'Completed' && (
            <div className="form-group">
              <label>Resolution Notes</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe what was done to resolve this issue..."
              />
            </div>
          )}
          <button onClick={handleStatusUpdate} className="btn btn-primary" disabled={updating}>
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Upload Proof of Work</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            Upload before/after images or completion reports
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ marginBottom: '10px' }}
          />
          {uploading && <p>Uploading...</p>}
          {files.length > 0 && (
            <div>
              <h4>Uploaded Proof:</h4>
              {files.map((file, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <a href={`http://localhost:5000${file.file_path}`} target="_blank" rel="noopener noreferrer">
                    {file.filename}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {task.comments && task.comments.length > 0 && (
          <div>
            <h3>Comments</h3>
            {task.comments.map((comment, index) => (
              <div key={index} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <p><strong>{comment.full_name || comment.commented_by}</strong> - {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}</p>
                <p>{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskDetail

