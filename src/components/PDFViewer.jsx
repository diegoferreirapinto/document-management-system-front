import React, { useState, useEffect } from 'react'
import { Box, IconButton, Typography, LinearProgress } from '@mui/material'
import { ZoomIn, ZoomOut, NavigateBefore, NavigateNext } from '@mui/icons-material'
import * as pdfjsLib from 'pdfjs-dist/webpack'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function PDFViewer({ fileUrl }) {
  const [pdf, setPdf] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [scale, setScale] = useState(1.0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = React.useRef(null)

  useEffect(() => {
    loadPdf()
  }, [fileUrl])

  useEffect(() => {
    if (pdf) {
      renderPage()
    }
  }, [pdf, pageNumber, scale])

  const loadPdf = async () => {
    try {
      setLoading(true)
      const loadingTask = pdfjsLib.getDocument(fileUrl)
      const pdfDoc = await loadingTask.promise
      setPdf(pdfDoc)
      setNumPages(pdfDoc.numPages)
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar PDF')
      setLoading(false)
      console.error('Error loading PDF:', err)
    }
  }

  const renderPage = async () => {
    if (!pdf || !canvasRef.current) return

    try {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
    } catch (err) {
      console.error('Error rendering page:', err)
    }
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset
      if (newPageNumber > 0 && newPageNumber <= numPages) {
        return newPageNumber
      }
      return prevPageNumber
    })
  }

  const changeZoom = (delta) => {
    setScale(prevScale => {
      const newScale = prevScale + delta
      if (newScale >= 0.5 && newScale <= 3) {
        return newScale
      }
      return prevScale
    })
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Carregando PDF...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box>
          <IconButton 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
          >
            <NavigateBefore />
          </IconButton>
          <Typography component="span" sx={{ mx: 2 }}>
            Página {pageNumber} de {numPages}
          </Typography>
          <IconButton 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= numPages}
          >
            <NavigateNext />
          </IconButton>
        </Box>
        
        <Box>
          <IconButton onClick={() => changeZoom(-0.1)}>
            <ZoomOut />
          </IconButton>
          <Typography component="span" sx={{ mx: 2 }}>
            {Math.round(scale * 100)}%
          </Typography>
          <IconButton onClick={() => changeZoom(0.1)}>
            <ZoomIn />
          </IconButton>
        </Box>
      </Box>

      {/* PDF Canvas */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        display: 'flex', 
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2
      }}>
        <canvas 
          ref={canvasRef}
          style={{ 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }}
        />
      </Box>
    </Box>
  )
}

export default PDFViewer