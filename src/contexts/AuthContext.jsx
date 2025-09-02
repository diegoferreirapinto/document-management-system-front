import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      setError(null)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      delete api.defaults.headers.common['Authorization']
      setError('Sessão expirada. Faça login novamente.')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      formData.append('grant_type', 'password')

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('userData', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      setUser(userData)
      setError(null)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setError(null)
    navigate('/login')
  }

  const isAuthenticated = () => {
    return !!localStorage.getItem('token')
  }

  const hasRole = (role) => {
    if (!user) return false
    
    // Verifica se user.roles é string (CSV) ou array
    const userRoles = typeof user.roles === 'string' 
      ? user.roles.split(',').map(r => r.trim())
      : user.roles || []
    
    return userRoles.includes(role)
  }

  const hasAnyRole = (roles) => {
    if (!user || !roles || roles.length === 0) return false
    
    const userRoles = typeof user.roles === 'string' 
      ? user.roles.split(',').map(r => r.trim())
      : user.roles || []
    
    return roles.some(role => userRoles.includes(role))
  }

  const updateUser = (userData) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData))
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    setUser: updateUser, // Fornece setUser para outros componentes
    setError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext