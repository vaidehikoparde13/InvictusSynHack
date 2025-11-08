import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { residentAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const ComplaintDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchComplaint()
  }, [id])

  const fetchComplaint = async () => {
    try {
      const response = await residentAPI.getComplaint(id)
      setComplaint(response.data.data)
      setFiles(response.data.data.attachments || [])
    } catch (error) {
      toast.error('Failed to load complaint details')
      navigate('/resident/complaints')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      await residentAPI.uploadAttachments(id, selectedFiles)
      toast.success('Files uploaded successfully')
      fetchComplaint()
    } catch (error) {
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'badge-pending',
      Approved: 'badge-approved',
      Assigned: 'badge-assigned',
      'In Progress': 'badge-in-progress',
      Completed: 'badge-completed',
      Resolved: 'badge-resolved',
      Rejected: 'badge-rejected',
    }
    return <span className={`badge ${badges[status] || ''}`}>{status}</span>
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!complaint) return null

  return (
    <div className="container" style={{ padding: '20px' }}>
      <button onClick={() => navigate('/resident/complaints')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Complaints
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1>{complaint.title}</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>
              Created: {format(new Date(complaint.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div>
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Details</h3>
          <p><strong>Category:</strong> {complaint.category}</p>
          {complaint.subcategory && <p><strong>Subcategory:</strong> {complaint.subcategory}</p>}
          <p><strong>Priority:</strong> {complaint.priority}</p>
          {complaint.floor && <p><strong>Floor:</strong> {complaint.floor}</p>}
          {complaint.room && <p><strong>Room:</strong> {complaint.room}</p>}
          {complaint.worker_name && <p><strong>Assigned Worker:</strong> {complaint.worker_name}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Description</h3>
          <p>{complaint.description}</p>
        </div>

        {complaint.resolution && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
            <h3>Resolution</h3>
            <p>{complaint.resolution}</p>
            {complaint.resolved_at && (
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Resolved: {format(new Date(complaint.resolved_at), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        )}

        {complaint.rejection_reason && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
            <h3>Rejection Reason</h3>
            <p>{complaint.rejection_reason}</p>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3>Attachments</h3>
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

        {complaint.comments && complaint.comments.length > 0 && (
          <div>
            <h3>Comments</h3>
            {complaint.comments.map((comment, index) => (
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

export default ComplaintDetail

