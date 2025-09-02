import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Button, TextField, Alert,
  Container, Chip, Card, CardContent, Divider, CircularProgress, Grid
} from '@mui/material';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent
} from '@mui/lab';

import {
  ArrowBack, CheckCircle, Cancel, Description,
  Person, Comment, Schedule
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import PDFViewer from './PDFViewer'

function DocumentReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const [document, setDocument] = useState(null)
  const [history, setHistory] = useState([])
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDocument()
    fetchHistory()
  }, [id])

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`)
      setDocument(response.data)
    } catch (error) {
      setError('Erro ao carregar documento')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/documents/${id}/history`)
      setHistory(response.data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  const handleReview = async (action) => {
    if (!comments.trim()) {
      setError('Por favor, adicione um comentário')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api.post(`/documents/${id}/review`, {
        action,
        comments
      })

      setSuccess(`Documento ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro ao processar revisão')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitForReview = async () => {
    setSubmitting(true)
    try {
      await api.put(`/documents/${id}/submit`)
      setSuccess('Documento enviado para revisão!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro ao enviar documento')
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!document) {
    return (
      <Container>
        <Alert severity="error">Documento não encontrado</Alert>
      </Container>
    )
  }

  const canSubmit = document.author_id === user?.id &&
    (document.status === 'draft' || document.status === 'rejected')
  const canReview = document.can_review
  const canApprove = document.can_approve

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="xl">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 3 }}
        >
          Voltar ao Dashboard
        </Button>

        <Grid container spacing={3}>
          {/* Document Info and Actions */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {document.title}
              </Typography>

              <Chip
                label={document.status.replace('_', ' ')}
                color={getStatusColor(document.status)}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" paragraph>
                {document.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Autor: {document.author_name}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  <Schedule sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Versão: {document.version}
                </Typography>
              </Box>

              {/* Action Buttons */}
              {canSubmit && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitForReview}
                  disabled={submitting}
                  sx={{ mb: 2 }}
                >
                  Enviar para Revisão
                </Button>
              )}

              {(canReview || canApprove) && (
                <Card sx={{ mt: 3, bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ação de Revisão
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Comentários (obrigatório)"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      disabled={submitting}
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleReview('approve')}
                        disabled={submitting || !comments.trim()}
                      >
                        Aprovar
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleReview('reject')}
                        disabled={submitting || !comments.trim()}
                      >
                        Rejeitar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}
            </Paper>

            {/* History Timeline */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Histórico
              </Typography>

              <Timeline position="alternate">
                {history.map((item, index) => (
                  <TimelineItem key={item.id}>
                    <TimelineSeparator>
                      <TimelineDot color={
                        item.action === 'approved' ? 'success' :
                          item.action === 'rejected' ? 'error' :
                            'primary'
                      }>
                        {item.action === 'approved' ? <CheckCircle /> :
                          item.action === 'rejected' ? <Cancel /> :
                            <Comment />}
                      </TimelineDot>
                      {index < history.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">
                        {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.reviewer_name} - {new Date(item.created_at).toLocaleString('pt-BR')}
                      </Typography>
                      {item.comments && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          "{item.comments}"
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>
          </Grid>

          {/* PDF Viewer */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, height: '80vh' }}>
              <PDFViewer fileUrl={`/${document.file_path}`} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DocumentReview