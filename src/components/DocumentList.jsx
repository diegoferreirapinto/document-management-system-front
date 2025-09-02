import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, CardActions, Typography,
  Button, Chip, TextField, FormControl, InputLabel, Select,
  MenuItem, IconButton, Tooltip, Pagination
} from '@mui/material'
import {
  Visibility, Edit, Send, FilterList, Search,
  Description, Schedule, Person
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { format } from 'date-fns'

function DocumentList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    my_documents: false
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    fetchDocuments()
  }, [filters, page])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.my_documents) params.append('my_documents', 'true')
      
      const response = await api.get(`/documents?${params}`)
      
      // Filter by search term
      let filteredDocs = response.data
      if (filters.search) {
        filteredDocs = filteredDocs.filter(doc =>
          doc.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          doc.description?.toLowerCase().includes(filters.search.toLowerCase())
        )
      }
      
      // Pagination
      setTotalPages(Math.ceil(filteredDocs.length / itemsPerPage))
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setDocuments(filteredDocs.slice(startIndex, endIndex))
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
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

  const handleAction = (doc) => {
    if (doc.can_review || doc.can_approve) {
      navigate(`/documents/${doc.id}/review`)
    } else if (doc.can_edit) {
      navigate(`/documents/${doc.id}/edit`)
    } else {
      navigate(`/documents/${doc.id}/view`)
    }
  }

  const DocumentCard = ({ doc }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Description color="primary" sx={{ fontSize: 40 }} />
          <Chip
            label={doc.status.replace('_', ' ')}
            color={getStatusColor(doc.status)}
            size="small"
          />
        </Box>
        
        <Typography variant="h6" gutterBottom noWrap>
          {doc.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {doc.description || 'Sem descrição'}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="caption" display="block" gutterBottom>
            <Person sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            {doc.author_name}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            <Schedule sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            {format(new Date(doc.created_at), 'dd/MM/yyyy')}
          </Typography>
          <Typography variant="caption" display="block">
            Versão: {doc.version}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box>
          {doc.can_edit && (
            <Tooltip title="Editar">
              <IconButton size="small" color="primary">
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          {doc.author_id === user?.id && doc.status === 'draft' && (
            <Tooltip title="Enviar para revisão">
              <IconButton size="small" color="warning">
                <Send />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Button
          size="small"
          variant="contained"
          startIcon={<Visibility />}
          onClick={() => handleAction(doc)}
          sx={{
            background: doc.can_review || doc.can_approve
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : undefined
          }}
        >
          {doc.can_review ? 'Revisar' :
           doc.can_approve ? 'Aprovar' :
           'Visualizar'}
        </Button>
      </CardActions>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar documentos..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="pending_review">Em Revisão</MenuItem>
                <MenuItem value="pending_approval">Em Aprovação</MenuItem>
                <MenuItem value="approved">Aprovado</MenuItem>
                <MenuItem value="rejected">Rejeitado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant={filters.my_documents ? "contained" : "outlined"}
              onClick={() => setFilters({ ...filters, my_documents: !filters.my_documents })}
            >
              Meus Documentos
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilters({ status: '', search: '', my_documents: false })}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Document Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum documento encontrado
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <DocumentCard doc={doc} />
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default DocumentList