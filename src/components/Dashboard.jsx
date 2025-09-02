import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Fab, Tooltip
} from '@mui/material'
import {
  Description, Pending, CheckCircle, Cancel, Upload
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import '../styles/MainContent.css'

function Dashboard() {
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending_review: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents')
      setDocuments(response.data)
      
      // Calculate stats
      const newStats = response.data.reduce((acc, doc) => {
        acc.total++
        acc[doc.status] = (acc[doc.status] || 0) + 1
        return acc
      }, { total: 0, draft: 0, pending_review: 0, pending_approval: 0, approved: 0, rejected: 0 })
      
      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending_review: 'warning',
      pending_approval: 'info',
      approved: 'success',
      rejected: 'error'
    }
    return colors[status] || 'default'
  }

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Description />,
      pending_review: <Pending />,
      pending_approval: <Pending />,
      approved: <CheckCircle />,
      rejected: <Cancel />
    }
    return icons[status] || <Description />
  }

  const handleDocumentClick = (doc) => {
    if (doc.can_review || doc.can_approve) {
      navigate(`/documents/${doc.id}/review`)
    } else if (doc.can_edit) {
      navigate(`/documents/${doc.id}/edit`)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Rascunho',
      pending_review: 'Em Revisão',
      pending_approval: 'Em Aprovação',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    }
    return labels[status] || status
  }

  return (
    <div className="main-content">
      {/* Header da página */}
      <div className="page-header">
        <h1 className="page-title">Sistema de Gestão</h1>
        <p className="page-subtitle">Dashboard</p>
      </div>

      {/* Grid de estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-number">{stats.total}</h3>
          <p className="stat-label">Total</p>
        </div>
        <div className="stat-card draft">
          <h3 className="stat-number">{stats.draft}</h3>
          <p className="stat-label">Rascunhos</p>
        </div>
        <div className="stat-card review">
          <h3 className="stat-number">{stats.pending_review}</h3>
          <p className="stat-label">Em Revisão</p>
        </div>
        <div className="stat-card approval">
          <h3 className="stat-number">{stats.pending_approval}</h3>
          <p className="stat-label">Em Aprovação</p>
        </div>
        <div className="stat-card approved">
          <h3 className="stat-number">{stats.approved}</h3>
          <p className="stat-label">Aprovados</p>
        </div>
        <div className="stat-card rejected">
          <h3 className="stat-number">{stats.rejected}</h3>
          <p className="stat-label">Rejeitados</p>
        </div>
      </div>

      {/* Tabela de documentos */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Status</th>
              <th>Versão</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="data-table-row"
                onClick={() => handleDocumentClick(doc)}
              >
                <td>{doc.title}</td>
                <td>{doc.author_name}</td>
                <td>
                  <Chip
                    label={getStatusLabel(doc.status)}
                    color={getStatusColor(doc.status)}
                    size="small"
                    icon={getStatusIcon(doc.status)}
                    sx={{ 
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}
                  />
                </td>
                <td>{doc.version}</td>
                <td>
                  {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <div className="table-actions">
                    {doc.can_review && (
                      <button className="action-btn view">Revisar</button>
                    )}
                    {doc.can_approve && (
                      <button className="action-btn edit">Aprovar</button>
                    )}
                    {doc.can_edit && (
                      <button className="action-btn edit">Editar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botão flutuante para novo documento */}
      {(hasRole('author') || hasRole('admin')) && (
        <Tooltip title="Novo Documento">
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
            onClick={() => navigate('/documents/upload')}
          >
            <Upload />
          </Fab>
        </Tooltip>
      )}

      {/* Estado vazio */}
      {documents.length === 0 && (
        <div className="empty-state">
          <Description sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
          <h3>Nenhum documento encontrado</h3>
          <p>Comece criando seu primeiro documento</p>
          {(hasRole('author') || hasRole('admin')) && (
            <button 
              className="action-btn view"
              onClick={() => navigate('/documents/upload')}
              style={{ marginTop: '16px' }}
            >
              Criar Primeiro Documento
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard