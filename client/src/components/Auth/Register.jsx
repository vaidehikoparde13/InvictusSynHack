import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { testAPIConnection } from '../../utils/debug'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'resident',
    student_id: '',
    phone: '',
    floor: '',
    room: '',
  })
  const [loading, setLoading] = useState(false)
  const [apiConnected, setApiConnected] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if backend is running
    testAPIConnection().then(connected => {
      setApiConnected(connected)
      if (!connected) {
        toast.error('Cannot connect to backend server. Please ensure the backend is running on port 5000.')
      }
    })
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // ✅ Mobile number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number.')
      setLoading(false)
      return
    }

    try {
      const result = await register(formData)

      if (result.success) {
        toast.success('Registration successful!')
        const user = JSON.parse(localStorage.getItem('user'))
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (user.role === 'worker') {
          navigate('/worker/dashboard')
        } else {
          navigate('/resident/dashboard')
        }
      } else {
        console.error('Registration failed:', result.message)
        toast.error(result.message || 'Registration failed. Please check your details and try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Register</h1>
        {apiConnected === false && (
          <div className="error" style={{ marginBottom: '20px' }}>
            ⚠️ Backend server is not running. Please start the backend server first.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="resident">Resident</option>
              <option value="admin">Admin</option>
              <option value="worker">Worker</option>
            </select>
          </div>

          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                // Allow only digits, max 10
                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                setFormData({ ...formData, phone: value })
              }}
              placeholder="Enter 10-digit mobile number"
              required
            />
            <small style={{ color: 'gray' }}>Must be a 10-digit number</small>
          </div>

          <div className="form-group">
            <label>Floor</label>
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Room</label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  )
}

export default Register
