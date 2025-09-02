import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Container } from '@mui/material'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import Dashboard from './components/Dashboard'
import Layout from './components/Layout'
import ProceduresPage from './components/ProceduresPage'
import NonConformitiesPage from './components/NonConformitiesPage'
import IndicatorsPage from './components/IndicatorsPage'
import DocumentsPage from './components/DocumentsPage'
import AdminPage from './components/AdminPage'
import DocumentUpload from './components/DocumentUpload'
import DocumentReview from './components/DocumentReview'
import AuditLogTable from './components/AuditLogTable'
import ProtectedRoute from './components/ProtectedRoute'
import api from './services/api'

function AppContent() {
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Tenta buscar dados do usuário
          try {
            const response = await api.get('/auth/me')
            setUser(response.data)
          } catch (error) {
            console.error('Failed to fetch user data:', error)
            // Se falhar, tenta usar dados do localStorage
            const userData = localStorage.getItem('userData')
            if (userData) {
              setUser(JSON.parse(userData))
            } else {
              throw error
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        delete api.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [setUser])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth={false} sx={{ padding: 0, margin: 0 }}>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/procedures" element={
          <ProtectedRoute>
            <Layout>
              <ProceduresPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/non-conformities" element={
          <ProtectedRoute>
            <Layout>
              <NonConformitiesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/indicators" element={
          <ProtectedRoute>
            <Layout>
              <IndicatorsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents/upload" element={
          <ProtectedRoute allowedRoles={['author', 'admin']}>
            <Layout>
              <DocumentUpload />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents/:id/review" element={
          <ProtectedRoute allowedRoles={['reviewer', 'approver', 'admin']}>
            <Layout>
              <DocumentReview />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents/*" element={
          <ProtectedRoute>
            <Layout>
              <DocumentsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/audit" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AuditLogTable />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Container>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App