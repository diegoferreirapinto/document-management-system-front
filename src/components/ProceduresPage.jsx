import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import api from '../services/api'

const ProceduresPage = () => {
  const [procedures, setProcedures] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')

  useEffect(() => {
    fetchProcedures()
  }, [statusFilter])

  const fetchProcedures = async () => {
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (searchTerm) params.search = searchTerm
      
      const response = await api.get('/procedures', { params })
      setProcedures(response.data)
    } catch (error) {
      console.error('Failed to fetch procedures:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'vigente': return 'success'
      case 'elaboracao': return 'warning'
      case 'cancelado': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Procedimentos
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Buscar procedimentos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: <SearchIcon />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="vigente">Vigentes</MenuItem>
                  <MenuItem value="elaboracao">Em Elaboração</MenuItem>
                  <MenuItem value="cancelado">Cancelados</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Grupo</InputLabel>
                <Select
                  value={groupFilter}
                  label="Grupo"
                  onChange={(e) => setGroupFilter(e.target.value)}
                >
                  <MenuItem value="">Todos os Grupos</MenuItem>
                  <MenuItem value="meu">Meu Grupo</MenuItem>
                  <MenuItem value="geral">Gerais</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={fetchProcedures}
              >
                Aplicar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {procedures.map((procedure) => (
          <Grid item xs={12} md={6} lg={4} key={procedure.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {procedure.title}
                  </Typography>
                  <Chip
                    label={procedure.status}
                    color={getStatusColor(procedure.status)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Código: {procedure.code}
                </Typography>
                
                {procedure.version && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Versão: {procedure.version}
                  </Typography>
                )}
                
                {procedure.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {procedure.description.length > 100 
                      ? `${procedure.description.substring(0, 100)}...` 
                      : procedure.description
                    }
                  </Typography>
                )}
                
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                  Criado em: {new Date(procedure.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ProceduresPage