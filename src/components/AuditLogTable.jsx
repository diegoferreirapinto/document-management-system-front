import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Button, TextField, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Menu, MenuItem,
  AppBar, Toolbar, Avatar
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import {
  ArrowBack, FilterList, GetApp, Refresh,
  Person, Logout, DateRange
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { format } from 'date-fns'

function AuditLogTable() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    date_from: '',
    date_to: ''
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [anchorEl, setAnchorEl] = useState(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [filters, page, rowsPerPage])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.action) params.append('action', filters.action)
      if (filters.user_id) params.append('user_id', filters.user_id)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      
      params.append('skip', page * rowsPerPage)
      params.append('limit', rowsPerPage)
      
      const response = await api.get(`/audit/logs?${params}`)
      setLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action) => {
    const colors = {
      'POST': 'success',
      'PUT': 'warning',
      'DELETE': 'error',
      'GET': 'info'
    }
    return colors[action] || 'default'
  }

  const columns = [
    {
      field: 'timestamp',
      headerName: 'Data/Hora',
      width: 180,
      valueFormatter: (params) => {
        return format(new Date(params.value), 'dd/MM/yyyy HH:mm:ss')
      }
    },
    {
      field: 'action',
      headerName: 'Ação',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={getActionColor(params.value)}
        />
      )
    },
    {
      field: 'entity_type',
      headerName: 'Tipo',
      width: 120
    },
    {
      field: 'user',
      headerName: 'Usuário',
      width: 150,
      valueGetter: (params) => params.row.user?.username || 'Sistema'
    },
    {
      field: 'request_path',
      headerName: 'Endpoint',
      width: 250
    },
    {
      field: 'ip_address',
      headerName: 'IP',
      width: 120
    },
    {
      field: 'response_status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value < 400 ? 'success' : 'error'}
        />
      )
    }
  ]

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.user_id) params.append('user_id', filters.user_id)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      params.append('format', 'csv')
      
      const response = await api.get(`/audit/export?${params}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit_logs_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Logs de Auditoria
          </Typography>
          
          <Typography sx={{ mr: 2 }}>
            {user?.full_name || user?.username}
          </Typography>
          
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => navigate('/dashboard')}>
              <ArrowBack sx={{ mr: 1 }} /> Dashboard
            </MenuItem>
            <MenuItem onClick={() => navigate('/profile')}>
              <Person sx={{ mr: 1 }} /> Perfil
            </MenuItem>
            <MenuItem onClick={logout}>
              <Logout sx={{ mr: 1 }} /> Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Ação"
              size="small"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              sx={{ width: 150 }}
            />
            
            <TextField
              label="Data Inicial"
              type="date"
              size="small"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 180 }}
            />
            
            <TextField
              label="Data Final"
              type="date"
              size="small"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 180 }}
            />

            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchAuditLogs}
            >
              Atualizar
            </Button>

            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={handleExport}
            >
              Exportar CSV
            </Button>
          </Box>
        </Paper>

        {/* Data Grid */}
        <Paper elevation={3} sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={logs}
            columns={columns}
            pageSize={rowsPerPage}
            onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
            rowsPerPageOptions={[10, 25, 50, 100]}
            loading={loading}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'action.hover',
                fontWeight: 'bold',
              },
            }}
          />
        </Paper>
      </Box>
    </Box>
  )
}

export default AuditLogTable