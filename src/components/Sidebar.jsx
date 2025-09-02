import React, { useState, useEffect } from 'react'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Popover,
  Paper
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  Description as DocumentIcon,
  Error as NCIcon,
  Analytics as IndicatorIcon,
  Folder as ProcedureIcon,
  Assignment as CertificateIcon,
  Settings as AdminIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = ({ open, mobileOpen, onToggle, onMobileClose, isMobile }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [openProcedures, setOpenProcedures] = useState(false)
  const [openNC, setOpenNC] = useState(false)
  const [openDocs, setOpenDocs] = useState(false)
  const [openAdmin, setOpenAdmin] = useState(false)
  const [popoverAnchor, setPopoverAnchor] = useState(null)
  const [popoverContent, setPopoverContent] = useState(null)

  // Auto-abrir menu quando a rota correspondente estiver ativa
  useEffect(() => {
    if (location.pathname.startsWith('/procedures')) {
      setOpenProcedures(true)
    } else if (location.pathname.startsWith('/non-conformities')) {
      setOpenNC(true)
    } else if (location.pathname.startsWith('/documents')) {
      setOpenDocs(true)
    } else if (location.pathname.startsWith('/admin')) {
      setOpenAdmin(true)
    }
  }, [location.pathname])

  // Defina os itens do menu aqui
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Procedimentos',
      icon: <ProcedureIcon />,
      key: 'procedures',
      subItems: [
        { text: 'Vigentes', path: '/procedures?status=vigente' },
        { text: 'Em Elaboração', path: '/procedures?status=elaboracao' },
        { text: 'Cancelados', path: '/procedures?status=cancelado' },
        { text: 'Todos', path: '/procedures' }
      ]
    },
    {
      text: 'Não Conformidades',
      icon: <NCIcon />,
      key: 'nc',
      subItems: [
        { text: 'Em Trâmite', path: '/non-conformities?status=tramite' },
        { text: 'Arquivadas', path: '/non-conformities?status=arquivada' },
        { text: 'Todas', path: '/non-conformities' }
      ]
    },
    {
      text: 'Indicadores',
      icon: <IndicatorIcon />,
      path: '/indicators'
    },
    {
      text: 'Documentos',
      icon: <DocumentIcon />,
      key: 'docs',
      subItems: [
        { text: 'Certificados e Logomarcas', path: '/documents/certificates' },
        { text: 'Documentos Diversos', path: '/documents/diversos' },
        { text: 'Macroprocessos', path: '/documents/macroprocessos' },
        { text: 'Manuais', path: '/documents/manuais' },
        { text: 'Manual De Gestão Da Qualidade', path: '/documents/manual-gestao' },
        { text: 'Normas', path: '/documents/normas' },
        { text: 'Relatório De Análise Crítica', path: '/documents/analise-critica' },
        { text: 'Relatórios De Auditoria', path: '/documents/relatorios-auditoria' }
      ]
    },
    {
      text: 'Administração',
      icon: <AdminIcon />,
      key: 'admin',
      subItems: [
        { text: 'Elementos Organizacionais', path: '/admin/elementos' },
        { text: 'Item Das Normas', path: '/admin/itens-normas' },
        { text: 'Normas', path: '/admin/normas' },
        { text: 'Organizações Militares', path: '/admin/organizacoes' },
        { text: 'Periodicidades', path: '/admin/periodicidades' },
        { text: 'Períodos', path: '/admin/periodos' },
        { text: 'Tipos De Auditoria', path: '/admin/tipos-auditoria' },
        { text: 'Tipos De Elemento Organizacional', path: '/admin/tipos-elemento' },
        { text: 'Tipos De Procedimentos', path: '/admin/tipos-procedimento' }
      ]
    }
  ]

  const handleItemClick = (path) => {
    navigate(path)
    if (isMobile) {
      onMobileClose()
    }
  }

  const handleMenuClick = (item) => {
    if (item.key === 'procedures') {
      setOpenProcedures(!openProcedures)
    } else if (item.key === 'nc') {
      setOpenNC(!openNC)
    } else if (item.key === 'docs') {
      setOpenDocs(!openDocs)
    } else if (item.key === 'admin') {
      setOpenAdmin(!openAdmin)
    }
  }

  const handleSubItemClick = (path) => {
    navigate(path)
    if (isMobile) {
      onMobileClose()
    }
  }

  const handlePopoverOpen = (event, item) => {
    if (!open && !isMobile && item.subItems) {
      setPopoverAnchor(event.currentTarget)
      setPopoverContent(item)
    }
  }

  const handlePopoverClose = () => {
    setPopoverAnchor(null)
    setPopoverContent(null)
  }

  const isActive = (path) => {
    const basePath = path.split('?')[0]
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/')
  }

  const isMenuActive = (item) => {
    if (item.path) return isActive(item.path)
    if (item.subItems) return item.subItems.some(subItem => isActive(subItem.path))
    return false
  }

  const drawerWidth = open ? 280 : 60

  const drawerContent = (
    <>
      {/* Header com botão de toggle */}
      <Toolbar 
        sx={{ 
          justifyContent: open ? 'space-between' : 'center',
          minHeight: '64px !important',
          px: open ? 2 : 1
        }}
      >
        {open && (
          <Typography variant="h6" color="primary" noWrap>
            Gestão da Qualidade
          </Typography>
        )}
        
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      <Divider />

      <List sx={{ px: open ? 1 : 0.5 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.subItems ? (
              <>
                <Tooltip 
                  title={!open ? item.text : ''} 
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    onClick={() => open ? handleMenuClick(item) : null}
                    onMouseEnter={(e) => handlePopoverOpen(e, item)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      justifyContent: open ? 'initial' : 'center',
                      px: open ? 2 : 1,
                      minHeight: 48,
                      bgcolor: isMenuActive(item) ? 'primary.light' : 'transparent',
                      color: isMenuActive(item) ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    
                    {open && (
                      <>
                        <ListItemText 
                          primary={item.text} 
                          sx={{ opacity: open ? 1 : 0 }}
                        />
                        {item.key === 'procedures' ? (openProcedures ? <ExpandLess /> : <ExpandMore />) :
                         item.key === 'nc' ? (openNC ? <ExpandLess /> : <ExpandMore />) :
                         item.key === 'docs' ? (openDocs ? <ExpandLess /> : <ExpandMore />) :
                         item.key === 'admin' ? (openAdmin ? <ExpandLess /> : <ExpandMore />) : null}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {open && (
                  <Collapse 
                    in={
                      (item.key === 'procedures' && openProcedures) ||
                      (item.key === 'nc' && openNC) ||
                      (item.key === 'docs' && openDocs) ||
                      (item.key === 'admin' && openAdmin)
                    } 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          sx={{
                            pl: 4,
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: isActive(subItem.path) ? 'primary.main' : 'transparent',
                            color: isActive(subItem.path) ? 'primary.contrastText' : 'text.primary',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText'
                            }
                          }}
                          onClick={() => handleSubItemClick(subItem.path)}
                        >
                          <ListItemText 
                            primary={subItem.text} 
                            sx={{ 
                              '& .MuiTypography-root': {
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </>
            ) : (
              <Tooltip 
                title={!open ? item.text : ''} 
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2 : 1,
                    minHeight: 48,
                    bgcolor: isActive(item.path) ? 'primary.main' : 'transparent',
                    color: isActive(item.path) ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: 'inherit'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.text} 
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            )}
          </React.Fragment>
        ))}
      </List>

      <Divider />

      {open && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Sistema de Gestão
          </Typography>
        </Box>
      )}
    </>
  )

  // Popover para mostrar subitems quando sidebar está fechado
  const popoverOpen = Boolean(popoverAnchor) && !open && !isMobile

  return (
    <>
      {/* Desktop Drawer - Permanente */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open={open}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer - Temporário com Overlay */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{
            keepMounted: true, // Melhor performance no mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Popover para submenu quando sidebar está fechado */}
      <Popover
        open={popoverOpen}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        sx={{
          pointerEvents: 'none',
          '& .MuiPopover-paper': {
            pointerEvents: 'auto',
            ml: 1,
          }
        }}
      >
        {popoverContent && (
          <Paper sx={{ p: 1, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
              {popoverContent.text}
            </Typography>
            <Divider />
            <List dense>
              {popoverContent.subItems.map((subItem) => (
                <ListItemButton
                  key={subItem.text}
                  onClick={() => {
                    handleSubItemClick(subItem.path)
                    handlePopoverClose()
                  }}
                  sx={{
                    borderRadius: 1,
                    bgcolor: isActive(subItem.path) ? 'primary.main' : 'transparent',
                    color: isActive(subItem.path) ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }}
                >
                  <ListItemText primary={subItem.text} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Popover>
    </>
  )
}

export default Sidebar