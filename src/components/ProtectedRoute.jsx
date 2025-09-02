import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Alert, Container } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, hasAnyRole } = useAuth()

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          Você não tem permissão para acessar esta página.
          Roles necessárias: {allowedRoles.join(', ')}
        </Alert>
      </Container>
    )
  }

  return children
}

export default ProtectedRoute