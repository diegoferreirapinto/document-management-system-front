import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, TextField, Button, Typography, Alert,
  Container, LinearProgress, IconButton, Card, CardContent
} from '@mui/material'
import { CloudUpload, ArrowBack, Description, CheckCircle } from '@mui/icons-material'
import api from '../services/api'

function DocumentUpload() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos')
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 10MB')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Por favor, selecione um arquivo PDF')
      return
    }
    
    setLoading(true)
    setError('')
    
    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('file', file)
    
    try {
      const response = await api.post('/documents/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro ao fazer upload do documento')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 3 }}
        >
          Voltar ao Dashboard
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Novo Documento
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Título do Documento"
              variant="outlined"
              margin="normal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={loading || success}
            />
            
            <TextField
              fullWidth
              label="Descrição"
              variant="outlined"
              margin="normal"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading || success}
            />

            <Card
              sx={{
                mt: 3,
                mb: 3,
                border: '2px dashed',
                borderColor: file ? 'primary.main' : 'grey.300',
                bgcolor: file ? 'primary.50' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <CardContent>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-upload"
                  disabled={loading || success}
                />
                <label htmlFor="file-upload">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 3
                    }}
                  >
                    {file ? (
                      <>
                        <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6">{file.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6">Clique para selecionar um PDF</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Máximo 10MB
                        </Typography>
                      </>
                    )}
                  </Box>
                </label>
              </CardContent>
            </Card>

            {loading && (
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                Documento enviado com sucesso! Redirecionando...
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || success}
              startIcon={loading ? null : <CloudUpload />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b4199 100%)',
                }
              }}
            >
              {loading ? `Enviando... ${uploadProgress}%` : 'Enviar Documento'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default DocumentUpload