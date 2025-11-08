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

  // ✅ Function to generate room numbers dynamically
  const getRoomNumbers = (hostel) => {
    let rooms = []
    if (hostel === 'Kalpana Chawla') {
      const blocks = ['G', 'F', 'S', 'T']
      blocks.forEach(block => {
        for (let i = 1; i <= 23; i++) {
          const room = `${block}-${i.toString().padStart(2, '0')}`
          rooms.push(room)
        }
      })
    } else if (hostel === 'Dr. Anandi Bai Joshi') {
      // floors: 2xx to 11xx
      for (let floor = 2; floor <= 11; floor++) {
        const start = floor * 100 + 1
        const end = floor * 100 + (floor === 2 ? 52 : 52) // all have 52 rooms
        for (let i = start; i <= end; i++) {
          rooms.push(i.toString())
        }
      }
    }
    return rooms
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value !== 'Student' ? { hostel_block: '', room_number: '' } : {}),
      ...(name === 'hostel_block' ? { room_number: '' } : {}), // reset room if hostel changes
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

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

  // Get rooms dynamically based on selected hostel
  const roomOptions =
    formData.role === 'Student' && formData.hostel_block
      ? getRoomNumbers(formData.hostel_block)
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
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
              <option value="Worker">Maintenance / Worker</option>
            </select>
          </div>

          {/* Show hostel and room only for students */}
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
                  <option value="Kalpana Chawla">Kalpana Chawla</option>
                  <option value="Dr. Anandi Bai Joshi">Dr. Anandi Bai Joshi</option>
                </select>
              </div>

              {formData.hostel_block && (
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
