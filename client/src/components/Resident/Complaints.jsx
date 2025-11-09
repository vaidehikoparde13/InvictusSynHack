import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { residentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [complaintType, setComplaintType] = useState('common'); // 'common' or 'room'
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    whichWashroom: '',
    floor: '',
    room: '',
    description: '',
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Common complaint category → subcategory mapping
  const commonSubcategories = {
    Corridor: ['Light', 'Fan', 'Cleaning'],
    'Common Hall': ['Light', 'Fan', 'Projector', 'Seating'],
    Washroom: ['Flush not working', 'Water leaking from tap', 'Geyser not working'],
    'Water Cooler': ['Filter Issue', 'Leakage'],
    'Washing Machine': ['Machine 1', 'Machine 2', 'Dryer Issue'],
  };

  const washroomOptions = ['T1', 'T2', 'T3'];

  // Room complaint category → subcategory mapping
  const roomSubcategories = {
    Light: ['Not Working', 'Flickering', 'Tube Broken'],
    Fan: ['Not Working', 'Makes Noise', 'Loose Connection'],
    Table: ['Broken Leg', 'Drawer Issue', 'Unstable'],
    Window: ['Jammed', 'Broken Glass', 'Lock Issue'],
  };

  // Fetch complaints
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
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({
      ...formData,
      category: selectedCategory,
      subcategory: '',
      whichWashroom: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const complaintData = new FormData();
      complaintData.append('category', formData.category);
      if (formData.subcategory) complaintData.append('subcategory', formData.subcategory);
      if (formData.whichWashroom) complaintData.append('whichWashroom', formData.whichWashroom);
      complaintData.append('floor', formData.floor);
      complaintData.append('description', formData.description);
      if (complaintType === 'room') complaintData.append('room', formData.room);
      if (formData.image) complaintData.append('files', formData.image);

      // Dynamic Title
      const titlePrefix = complaintType === 'room' ? 'Room Complaint' : 'Common Complaint';
      let titleSuffix = '';

      if (complaintType === 'room') {
        titleSuffix = formData.subcategory
          ? `${formData.category} - ${formData.subcategory}`
          : formData.category;
      } else if (formData.category === 'Washroom') {
        titleSuffix = `${formData.category} - ${formData.subcategory} (${formData.whichWashroom})`;
      } else {
        titleSuffix = formData.subcategory
          ? `${formData.category} - ${formData.subcategory}`
          : formData.category;
      }

      complaintData.append('title', `${titlePrefix}: ${titleSuffix}`);

      const response = await residentAPI.createComplaint(complaintData);
      toast.success('Complaint submitted successfully!');
      setShowForm(false);
      setFormData({
        category: '',
        subcategory: '',
        whichWashroom: '',
        floor: '',
        room: '',
        description: '',
        image: null,
      });
      fetchComplaints();
      navigate(`/resident/complaints/${response.data.data.id}`);
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

      {/* Complaint Form */}
      {showForm ? (
        <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
          <h2>Submit New Complaint</h2>

          {/* Complaint Type */}
          <div className="form-group">
            <label>Complaint Type *</label>
            <div>
              <label style={{ marginRight: '15px' }}>
                <input
                  type="radio"
                  name="type"
                  value="common"
                  checked={complaintType === 'common'}
                  onChange={() => {
                    setComplaintType('common');
                    setFormData({
                      category: '',
                      subcategory: '',
                      whichWashroom: '',
                      floor: '',
                      room: '',
                      description: '',
                      image: null,
                    });
                  }}
                />{' '}
                Common Complaint
              </label>
              <label>
                <input
                  type="radio"
                  name="type"
                  value="room"
                  checked={complaintType === 'room'}
                  onChange={() => {
                    setComplaintType('room');
                    setFormData({
                      category: '',
                      subcategory: '',
                      whichWashroom: '',
                      floor: '',
                      room: '',
                      description: '',
                      image: null,
                    });
                  }}
                />{' '}
                Room Complaint
              </label>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select Category</option>

              {complaintType === 'common'
                ? Object.keys(commonSubcategories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                : Object.keys(roomSubcategories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          {formData.category && (
            <div className="form-group">
              <label>Subcategory *</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Subcategory</option>
                {complaintType === 'common'
                  ? commonSubcategories[formData.category]?.map((sub, index) => (
                      <option key={index} value={sub}>
                        {sub}
                      </option>
                    ))
                  : roomSubcategories[formData.category]?.map((sub, index) => (
                      <option key={index} value={sub}>
                        {sub}
                      </option>
                    ))}
              </select>
            </div>
          )}

          {/* Extra Field for Washroom */}
          {complaintType === 'common' && formData.category === 'Washroom' && (
            <div className="form-group">
              <label>Which Washroom *</label>
              <select
                name="whichWashroom"
                value={formData.whichWashroom}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Washroom Location</option>
                {washroomOptions.map((w, index) => (
                  <option key={index} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Floor */}
          <div className="form-group">
            <label>Floor *</label>
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleFormChange}
              required
            />
          </div>

          {/* Room (only for room complaints) */}
          {complaintType === 'room' && (
            <div className="form-group">
              <label>Room Number *</label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleFormChange}
                required
              />
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Describe the issue"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Upload Image (Optional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFormChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      ) : (
        <>
          {/* FILTER SECTION */}
          <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
            <h3>Filter Complaints</h3>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div>
                <label>Category</label>
                <select name="category" value={filters.category} onChange={handleFilterChange}>
                  <option value="">All</option>
                  <option value="Room">Room</option>
                  <option value="Washroom">Washroom</option>
                  <option value="Mess">Mess</option>
                  <option value="Canteen">Canteen</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
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

export default Complaints;
