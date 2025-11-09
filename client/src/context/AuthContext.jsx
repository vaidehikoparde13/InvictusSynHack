import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      try {
        if (token && savedUser) {
          setUser(JSON.parse(savedUser))
          await authAPI.getMe()
        }
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { token, user: userData } = response.data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { token, user: newUser } = response.data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
      return { success: true }
    } catch (error) {
      let errorMessage = 'Registration failed'
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.join(', ')
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.'
      } else {
        errorMessage = error.message || errorMessage
      }
      return { success: false, message: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = { user, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
