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
    role: 'Student',
    hostel_block: '',
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // if role changes, reset room/hostel if not Student
      ...(name === 'role' && value !== 'Student' ? { hostel_block: '', room_number: '' } : {}),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // prepare clean data
    const dataToSend = { ...formData }
    if (formData.role !== 'Student') {
      delete dataToSend.hostel_block
      delete dataToSend.room_number
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
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
              <option value="Worker">Maintenance / Worker</option>
            </select>
          </div>

          {/* Conditionally render these only for Students */}
          {formData.role === 'Student' && (
            <>
              <div className="form-group">
                <label>Hostel Block</label>
                <select
                  name="hostel_block"
                  value={formData.hostel_block}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Hostel Block</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  name="room_number"
                  placeholder="e.g., 101"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                />
              </div>
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
