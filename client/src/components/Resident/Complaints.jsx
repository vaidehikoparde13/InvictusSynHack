import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { residentAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 })
  const [pagination, setPagination] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [problemType, setProblemType] = useState('') // NEW: Common or Room
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: 'Medium',
    image: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchComplaints()
  }, [filters])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await residentAPI.getComplaints(filters)
      setComplaints(response.data.data.complaints)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    })
  }

  const handleFormChange = (e) => {
    const { name, value, files } = e.target
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Prepare payload for backend
      const complaintData = new FormData()
      complaintData.append('title', formData.title)
      complaintData.append('description', formData.description)
      complaintData.append('category', formData.category)
      complaintData.append('subcategory', formData.subcategory)
      complaintData.append('priority', formData.priority)
      if (formData.image) complaintData.append('files', formData.image)

      const response = await residentAPI.createComplaint(complaintData)

      toast.success('Complaint submitted successfully!')
      setShowForm(false)
      setProblemType('')
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        priority: 'Medium',
        image: null,
      })
      fetchComplaints()
      navigate(`/resident/complaints/${response.data.data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setSubmitting(false)
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

  return (
    <div className="container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Complaints</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Submit New Complaint'}
        </button>
      </div>

      {/* Complaint Submission Section */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Submit New Complaint</h2>

          {!problemType ? (
            <>
              <p>Select the type of issue you want to report:</p>
              <button
                onClick={() => setProblemType('common')}
                className="btn btn-outline-primary"
                style={{ marginRight: '10px' }}
              >
                🏢 Common Problem
              </button>
              <button onClick={() => setProblemType('room')} className="btn btn-outline-secondary">
                🚪 Personal Room Issue
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleFormChange} required />
              </div>

              {problemType === 'common' && (
                <>
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleFormChange} required>
                      <option value="">Select Category</option>
                      <option value="Washroom">Washroom</option>
                      <option value="Hallway">Hallway</option>
                      <option value="Canteen">Canteen</option>
                      <option value="Mess">Mess</option>
                      <option value="Library">Library</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subcategory *</label>
                    <select name="subcategory" value={formData.subcategory} onChange={handleFormChange} required>
                      <option value="">Select Subcategory</option>
                      <option value="Light">Light</option>
                      <option value="Fan">Fan</option>
                      <option value="Water Leakage">Water Leakage</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Complaint *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Describe the issue (e.g., Light not working near washroom)"
                      required
                    />
                  </div>
                </>
              )}

              {problemType === 'room' && (
                <>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" name="category" value="Room" readOnly />
                  </div>
                  <div className="form-group">
                    <label>Subcategory *</label>
                    <select name="subcategory" value={formData.subcategory} onChange={handleFormChange} required>
                      <option value="">Select Subcategory</option>
                      <option value="Light">Light</option>
                      <option value="Fan">Fan</option>
                      <option value="Plug Point">Plug Point</option>
                      <option value="Window">Window</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Describe the room issue (e.g., Fan not working)"
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Priority *</label>
                <select name="priority" value={formData.priority} onChange={handleFormChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Upload Image (Optional)</label>
                <input type="file" name="image" accept="image/*" onChange={handleFormChange} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Complaint List Section */}
      <div className="filters">
        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Room">Room</option>
            <option value="Washroom">Washroom</option>
            <option value="Hallway">Hallway</option>
            <option value="Canteen">Canteen</option>
            <option value="Library">Library</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          {complaints.length === 0 ? (
            <div className="card">
              <p>No complaints found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.title}</td>
                    <td>{complaint.category}</td>
                    <td>{getStatusBadge(complaint.status)}</td>
                    <td>{complaint.priority}</td>
                    <td>{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/resident/complaints/${complaint.id}`)}
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        View
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

export default Complaints
