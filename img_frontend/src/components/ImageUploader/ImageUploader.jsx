import React, { useRef, useState } from 'react'

const ImageUploader = ({ onImageUpload, isLoading = false }) => {
  const fileInputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    processFile(file)
  }

  const processFile = (file) => {
    if (!file) return

    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, WebP, etc.)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)

    onImageUpload(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragActive(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragActive(false)
  }

  const handleUploadClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveImage = (event) => {
    event.stopPropagation()
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReplaceImage = (event) => {
    event.stopPropagation()
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`
          relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden
          ${previewUrl
            ? 'p-0 border-2 border-slate-200 bg-slate-50 hover:border-primary-500 hover:shadow-lg'
            : `p-12 border-2 border-dashed bg-gradient-to-br from-white to-slate-50 
               ${isDragActive
              ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 scale-[1.02] shadow-xl shadow-primary-500/20'
              : 'border-slate-300 hover:border-primary-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10'
            }`
          }
          ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleUploadClick}
      >
        {isLoading && (
          <div className="flex flex-col items-center gap-4 text-slate-500 relative z-10">
            <div className="w-12 h-12 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-base font-medium">Processing image...</p>
          </div>
        )}

        {!isLoading && previewUrl ? (
          <div className="relative w-full h-80 rounded-xl overflow-hidden group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain bg-gradient-to-br from-slate-50 to-slate-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-5 py-3 bg-primary-500/90 hover:bg-primary-500 text-white rounded-xl font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  onClick={handleReplaceImage}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Replace
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-3 bg-white/95 hover:bg-white text-slate-700 hover:text-red-500 rounded-xl font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  onClick={handleRemoveImage}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 relative z-10">
            <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 rounded-full text-primary-500 transition-all group-hover:scale-110 group-hover:shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Image</h3>
              <p className="text-slate-500 mb-2">Click or drag an image here to upload</p>
              <small className="text-slate-400">Supports JPG, PNG, WebP • Max 10MB</small>
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Choose File
            </button>
          </div>
        )}

        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/95 to-purple-500/95 flex items-center justify-center rounded-xl z-20">
            <div className="text-white text-center">
              <svg className="w-12 h-12 mx-auto mb-4 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xl font-semibold">Drop image here</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

export default ImageUploader