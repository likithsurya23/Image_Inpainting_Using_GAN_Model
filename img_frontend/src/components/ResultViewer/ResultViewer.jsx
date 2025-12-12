import React, { useState } from 'react'

  const ResultViewer = ({ resultImage, isLoading, processingTime, originalImage }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleDownload = () => {
    if (!resultImage) return

    const link = document.createElement('a')
    link.href = resultImage
    link.download = `inpainted-result-${new Date().getTime()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyToClipboard = async () => {
    try {
      const response = await fetch(resultImage)
      const blob = await response.blob()

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])

      alert('Image copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy image: ', err)
      alert('Failed to copy image to clipboard')
    }
  }

  const formatProcessingTime = (seconds) => {
    if (!seconds) return null
    return `${seconds.toFixed(1)} seconds`
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="flex flex-col items-center justify-center p-16 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
              <div className="absolute inset-2 border-3 border-transparent border-t-purple-400 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">AI is Working Its Magic</h3>
              <p className="text-slate-500 text-sm mb-4">Removing objects and reconstructing your image...</p>
              <div className="space-y-3">
                {['Processing image', 'Analyzing content', 'Generating result'].map((step, i) => (
                  <div key={step} className={`flex items-center gap-3 text-sm ${i === 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-xs">This usually takes 10-30 seconds depending on image size</p>
        </div>
      </div>
    )
  }

  if (!resultImage) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="flex flex-col items-center justify-center p-16 bg-gradient-to-br from-slate-50 to-slate-100 text-center">
          <div className="text-slate-300 mb-6">
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-3">Inpainted Result</h3>
          <p className="text-slate-500 mb-8 max-w-sm">Upload an image and mark areas to remove. The AI-powered result will appear here.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: '🎯', text: 'Mark objects to remove' },
              { icon: '⚡', text: 'AI-powered removal' },
              { icon: '💾', text: 'Download high-quality results' }
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-slate-600">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
   <div className="w-full max-w-[90vw] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-700">Inpainted Result</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {processingTime && (
            <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              ⏱️ Processed in {formatProcessingTime(processingTime)}
            </span>
          )}
          {originalImage && (
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showComparison ? 'bg-white text-slate-600 border border-slate-200 hover:border-primary-500 hover:text-primary-500' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-500 hover:text-primary-500'}`}
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide Comparison' : 'Show Comparison'}
            </button>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div className={`p-6 bg-slate-50 ${showComparison ? 'py-8' : ''}`}>
        {showComparison && originalImage ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <img
                src={originalImage}
                alt="Original"
                className="max-w-[300px] max-h-[300px] rounded-xl shadow-lg border border-slate-200"
              />
              <span className="text-sm font-semibold text-slate-600 bg-white px-4 py-1.5 rounded-full border border-slate-200">Original</span>
            </div>
            <div className="text-3xl text-slate-600 font-bold md:rotate-0 rotate-90">→</div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={resultImage}
                  alt="Result"
                  className="max-w-[300px] max-h-[300px] rounded-xl shadow-lg border border-slate-200"
                  onLoad={handleImageLoad}
                />
                <span className="text-sm font-semibold text-slate-600 bg-white px-4 py-1.5 rounded-full border border-slate-200">Result</span>
              </div>
            </div>
          </div>
        ) : (
            <div className="relative flex justify-center overflow-auto w-full h-full">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
                </div>
              )}

              <img
                src={resultImage}
                alt="Inpainted result"
                className={`rounded-xl shadow-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  width: "auto",      
                  height: "auto",     
                  display: "block"
                }}
                onLoad={handleImageLoad}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">

          {/* LEFT SIDE BUTTON */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 
                      text-slate-700 border border-slate-200 hover:border-primary-500 
                      hover:text-primary-500 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Image
          </button>

          {/* RIGHT SIDE BUTTON */}
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 
                      text-slate-700 border border-slate-200 hover:border-primary-500 
                      hover:text-primary-500 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy to Clipboard
          </button>
        </div>

      {/* Quality Indicator */}
      <div className="px-6 py-4 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 font-medium">Result Quality:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1.5 rounded-sm transition-all ${bar <= 4 ? 'bg-gradient-to-t from-primary-500 to-cyan-400' : 'bg-slate-200'}`}
                style={{ height: `${8 + bar * 2}px` }}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-primary-500 ml-auto">Excellent</span>
        </div>
      </div>
    </div>
  )
}

export default ResultViewer
