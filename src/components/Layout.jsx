import React, { useState } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  const handleMobileClose = () => {
    setMobileOpen(false)
  }

  const drawerWidth = sidebarOpen ? 280 : 0

  return (
    // <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Box sx={{ display: 'flex'}}>
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
        onMobileClose={handleMobileClose}
        isMobile={isMobile}
      />
      
      {/* Conteúdo principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          // Ajusta margin apenas no desktop
          // ml: isMobile ? 0 : `${drawerWidth}px`,
          ml: 0,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Header onMenuClick={toggleSidebar} isMobile={isMobile} />
        
        {/* Área de conteúdo */}
        <Box
          sx={{
            flexGrow: 1,
            ml: 3,
            p: 0,
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 64px)',
            width: '100%'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout