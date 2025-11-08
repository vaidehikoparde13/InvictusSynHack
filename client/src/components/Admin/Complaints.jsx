import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    page: 1,
  })
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchComplaints()
    fetchWorkers()
  }, [filters])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getComplaints(filters)
      setComplaints(response.data.data.complaints)
    } catch (error) {
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkers = async () => {
    try {
      const response = await adminAPI.getWorkers()
      setWorkers(response.data.data)
    } catch (error) {
      console.error('Failed to load workers')
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    })
  }

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveComplaint(id)
      toast.success('Complaint approved')
      fetchComplaints()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve complaint')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      await adminAPI.rejectComplaint(selectedComplaint.id, rejectionReason)
      toast.success('Complaint rejected')
      setShowModal(false)
      setSelectedComplaint(null)
      setRejectionReason('')
      fetchComplaints()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject complaint')
    }
  }

  const handleAssign = async () => {
    if (!workerId) {
      toast.error('Please select a worker')
      return
    }
    try {
      await adminAPI.assignComplaint(selectedComplaint.id, workerId)
      toast.success('Complaint assigned to worker')
      setShowModal(false)
      setSelectedComplaint(null)
      setWorkerId('')
      fetchComplaints()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign complaint')
    }
  }

  const openModal = (complaint, actionType) => {
    setSelectedComplaint(complaint)
    setAction(actionType)
    setShowModal(true)
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
      <h1>Manage Complaints</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Assigned">Assigned</option>
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
            <option value="Infrastructure">Infrastructure</option>
            <option value="Hostel">Hostel</option>
            <option value="Canteen">Canteen</option>
            <option value="Library">Library</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search complaints..."
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Resident</th>
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
                  <td>{complaint.resident_name}</td>
                  <td>{complaint.category}</td>
                  <td>{getStatusBadge(complaint.status)}</td>
                  <td>{complaint.priority}</td>
                  <td>{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {complaint.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(complaint.id)}
                            className="btn btn-success"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openModal(complaint, 'reject')}
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {complaint.status === 'Approved' && (
                        <button
                          onClick={() => openModal(complaint, 'assign')}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Assign
                        </button>
                      )}
                      {complaint.status === 'Completed' && (
                        <button
                          onClick={() => openModal(complaint, 'verify')}
                          className="btn btn-success"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {action === 'reject' && 'Reject Complaint'}
                {action === 'assign' && 'Assign to Worker'}
                {action === 'verify' && 'Verify Work'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {action === 'reject' && (
              <div>
                <div className="form-group">
                  <label>Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
                <button onClick={handleReject} className="btn btn-danger">Reject</button>
              </div>
            )}
            {action === 'assign' && (
              <div>
                <div className="form-group">
                  <label>Select Worker *</label>
                  <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} required>
                    <option value="">Select worker</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.full_name} ({worker.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={handleAssign} className="btn btn-primary">Assign</button>
              </div>
            )}
            {action === 'verify' && (
              <div>
                <p>Approve or request changes for this completed work?</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={async () => {
                      try {
                        await adminAPI.verifyWork(selectedComplaint.id, 'approve')
                        toast.success('Work approved')
                        setShowModal(false)
                        fetchComplaints()
                      } catch (error) {
                        toast.error('Failed to verify work')
                      }
                    }}
                    className="btn btn-success"
                  >
                    Approve
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await adminAPI.verifyWork(selectedComplaint.id, 'reject', 'Please make corrections')
                        toast.success('Work sent back for revision')
                        setShowModal(false)
                        fetchComplaints()
                      } catch (error) {
                        toast.error('Failed to verify work')
                      }
                    }}
                    className="btn btn-danger"
                  >
                    Request Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Complaints

