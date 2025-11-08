import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { testAPIConnection } from '../../utils/debug'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    student_id: '',
    role: 'Student',
    hostel_block: 'Dr. Anandi Bai Joshi', // ✅ Default and only hostel
    floor: '', // ✅ New field
    room_number: '',
  })

  const [loading, setLoading] = useState(false)
  const [apiConnected, setApiConnected] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    testAPIConnection().then(connected => {
      setApiConnected(connected)
      if (!connected) {
        toast.error('Cannot connect to backend server. Please ensure it is running.')
      }
    })
  }, [])

  // ✅ Generate room numbers dynamically based on floor
  const getRoomNumbers = (floor) => {
    let rooms = []
    if (!floor) return rooms

    const start = floor * 100 + 1
    const end = floor * 100 + 52 // 52 rooms per floor
    for (let i = start; i <= end; i++) {
      rooms.push(i.toString())
    }
    return rooms
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value !== 'Student'
        ? { hostel_block: '', floor: '', room_number: '', student_id: '' }
        : {}),
      ...(name === 'floor' ? { room_number: '' } : {}), // reset room when floor changes
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const dataToSend = { ...formData }

    // 🧹 Remove student-specific fields for non-students
    if (formData.role !== 'Student') {
      delete dataToSend.hostel_block
      delete dataToSend.room_number
      delete dataToSend.student_id
      delete dataToSend.floor
    }

    try {
      const result = await register(dataToSend)
      if (result.success) {
        toast.success('Registration successful!')
        navigate('/login')
      } else {
        toast.error(result.message || 'Registration failed.')
      }
    } catch (error) {
      toast.error('Unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const roomOptions =
    formData.role === 'Student' && formData.floor
      ? getRoomNumbers(formData.floor)
      : []

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome</h1>
        <p>Sign in to your account or create a new one</p>

        {apiConnected === false && (
          <div className="error">
            ⚠️ Backend server not running. Please start it first.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter your name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@vnit.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your mobile number"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
              <option value="Worker">Maintenance / Worker</option>
            </select>
          </div>

          {/* ✅ Student-specific fields */}
          {formData.role === 'Student' && (
            <>
              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  name="student_id"
                  placeholder="Enter your Student ID"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hostel Block</label>
                <input
                  type="text"
                  name="hostel_block"
                  value="Dr. Anandi Bai Joshi"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Floor</label>
                <select
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Floor</option>
                  {[...Array(12).keys()].map(num => (
                    <option key={num} value={num}>
                      Floor {num}
                    </option>
                  ))}
                </select>
              </div>

              {formData.floor && (
                <div className="form-group">
                  <label>Room Number</label>
                  <select
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Room</option>
                    {roomOptions.map(room => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="demo-info">
          <p>
            ℹ️ <strong>Demo Accounts:</strong> You can create test accounts for different roles to explore the system.
          </p>
        </div>

        <p className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  )
}

export default Register
