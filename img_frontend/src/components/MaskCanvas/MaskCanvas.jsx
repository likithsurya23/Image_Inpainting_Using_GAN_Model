import React, { useRef, useEffect, useState } from 'react'

const MaskCanvas = ({
  originalImage,
  onMaskChange,
  disabled = false,
  isLoading = false
}) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(30)
  const [tool, setTool] = useState('brush')
  const [hasDrawn, setHasDrawn] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.onload = () => {
      const maxWidth = 800
      const maxHeight = 600
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height
      setCanvasSize({ width, height })
      ctx.drawImage(img, 0, 0, width, height)
    }

    img.onerror = () => {
      console.error('Failed to load image')
    }

    img.src = originalImage
  }, [originalImage])

  const getMousePos = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (event) => {
    if (disabled || isLoading) return

    setIsDrawing(true)
    const pos = getMousePos(event)
    drawAtPosition(pos.x, pos.y)
  }

  const draw = (event) => {
    if (!isDrawing || disabled || isLoading) return

    const pos = getMousePos(event)
    drawAtPosition(pos.x, pos.y)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      updateMaskData()
    }
  }

  const drawAtPosition = (x, y) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(255, 0, 0, 0.6)'
    } 
    else {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    }

    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, Math.PI * 2)
    ctx.fill()

    if (!hasDrawn) {
      setHasDrawn(true)
    }
  }

  const updateMaskData = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = canvas.width
    maskCanvas.height = canvas.height
    const maskCtx = maskCanvas.getContext('2d')

    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const maskData = maskCtx.createImageData(canvas.width, canvas.height)

    let hasMask = false

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]

      if (r > 200 && g < 100 && b < 100) {
        maskData.data[i] = 255
        maskData.data[i + 1] = 255
        maskData.data[i + 2] = 255
        maskData.data[i + 3] = 255
        hasMask = true
      } else {
        maskData.data[i] = 0
        maskData.data[i + 1] = 0
        maskData.data[i + 2] = 0
        maskData.data[i + 3] = 255
      }
    }

    maskCtx.putImageData(maskData, 0, 0)
    const maskDataUrl = maskCanvas.toDataURL('image/png')
    onMaskChange(hasMask ? maskDataUrl : null)
  }

  const clearMask = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (originalImage) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
        updateMaskData()
      }
      img.src = originalImage
    }
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (disabled || isLoading) return

      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault()
          setTool('brush')
          break
        case 'e':
          event.preventDefault()
          setTool('eraser')
          break
        case '[':
          event.preventDefault()
          setBrushSize(prev => Math.max(5, prev - 5))
          break
        case ']':
          event.preventDefault()
          setBrushSize(prev => Math.min(100, prev + 5))
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [disabled, isLoading])

  if (!originalImage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-3xl bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-10">
        <div className="text-slate-300 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Image Uploaded</h3>
        <p className="text-slate-400 text-sm">Upload an image to start drawing masks</p>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-4xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg ${disabled ? 'opacity-70 pointer-events-none' : ''} ${isLoading ? 'relative' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${tool === 'brush' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            {tool === 'brush' ? '🖌️ Brush' : '🧽 Eraser'}
          </span>
          {canvasSize.width > 0 && (
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-500 font-medium">
              {canvasSize.width} × {canvasSize.height}px
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white border-b border-slate-200">
        {/* Tools */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tools</label>
          <div className="flex gap-2">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${tool === 'brush'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-slate-100 text-slate-600 border-2 border-slate-200 hover:border-primary-500 hover:text-primary-500'}
              `}
              onClick={() => setTool('brush')}
              disabled={disabled || isLoading}
              title="Brush Tool (B)"
            >
              <span>🖌️</span>
              Brush
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${tool === 'eraser'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-slate-100 text-slate-600 border-2 border-slate-200 hover:border-primary-500 hover:text-primary-500'}
              `}
              onClick={() => setTool('eraser')}
              disabled={disabled || isLoading}
              title="Eraser Tool (E)"
            >
              <span>🧽</span>
              Eraser
            </button>
          </div>
        </div>

        {/* Brush Size */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Brush Size: <span className="text-primary-500">{brushSize}px</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              disabled={disabled || isLoading}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
              <div
                className="rounded-full transition-all"
                style={{
                  width: `${Math.min(brushSize, 40)}px`,
                  height: `${Math.min(brushSize, 40)}px`,
                  backgroundColor: tool === 'brush' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                  border: tool === 'brush' ? '2px solid #ef4444' : '2px solid #64748b'
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</label>
          <button
            onClick={clearMask}
            disabled={disabled || isLoading || !hasDrawn}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-400 text-red-500 rounded-xl font-semibold text-sm transition-all hover:bg-red-500 hover:text-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title="Clear entire mask"
          >
            <span>🗑️</span>
            Clear Mask
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="p-6 bg-slate-100 flex justify-center">
        <div className="relative inline-block rounded-xl border border-slate-300 bg-white shadow-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="block max-w-full h-auto cursor-crosshair"
          />

          {isLoading && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 rounded-xl">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-semibold">Processing your mask...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MaskCanvas