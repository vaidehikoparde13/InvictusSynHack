import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { residentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
  })
  const [pagination, setPagination] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    priority: 'Medium',
  })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!showForm) fetchComplaints();
  }, [filters, showForm]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await residentAPI.getComplaints(filters);
      setComplaints(response.data.data.complaints || []);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await residentAPI.createComplaint(formData)
      toast.success('Complaint submitted successfully!')
      setShowForm(false)
      setFormData({
        category: '',
        subcategory: '',
        priority: 'Medium',
      })
      fetchComplaints()
      navigate(`/resident/complaints/${response.data.data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>My Complaints</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Submit New Complaint'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Submit New Complaint</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleFormChange} required>
                <option value="">Select category</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Hostel">Hostel</option>
                <option value="Canteen">Canteen</option>
                <option value="Library">Library</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Subcategory</label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleFormChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}

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
            <option value="Infrastructure">Infrastructure</option>
            <option value="Hostel">Hostel</option>
            <option value="Canteen">Canteen</option>
            <option value="Library">Library</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

          {/* COMPLAINT LIST */}
          {loading ? (
            <p>Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            <div className="complaint-list">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="card"
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/resident/complaints/${complaint.id}`)}
                >
                  <h3>{complaint.title}</h3>
                  <p>
                    <strong>Category:</strong> {complaint.category}
                  </p>
                  <p>
                    <strong>Status:</strong> {complaint.status}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {format(new Date(complaint.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Complaints

