import React, { useState } from 'react'
import ImageUploader from './components/ImageUploader/ImageUploader'
import MaskCanvas from './components/MaskCanvas/MaskCanvas'
import ResultViewer from './components/ResultViewer/ResultViewer'
import IterationControls from './components/IterationControls/IterationControls'
import HistorySidebar from './components/HistorySidebar/HistorySidebar'
import { inpaintImage } from './api/inpaintApi'

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [maskData, setMaskData] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [history, setHistory] = useState([])
  const [iterations, setIterations] = useState(2)
  const [currentStep, setCurrentStep] = useState(1)

  const handleImageUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target.result)
      setResultImage(null)
      setMaskData(null)
      setCurrentStep(2)
    }
    reader.readAsDataURL(file)
  }

  const handleMaskChange = (mask) => {
    setMaskData(mask)
    if (mask && !resultImage) {
      setCurrentStep(3)
    }
  }

  const handleInpaint = async () => {
    if (!originalImage || !maskData) {
      alert('Please upload an image and draw a mask first')
      return
    }

    setIsProcessing(true)
    setCurrentStep(4)
    try {
      const response = await inpaintImage(originalImage, maskData, iterations)
      setResultImage(response.result_image)
      setJobId(response.job_id)

      const historyItem = {
        id: response.job_id || Date.now(),
        original: originalImage,
        result: response.result_image,
        mask: maskData,
        timestamp: new Date().toISOString(),
        iterations: iterations
      }

      setHistory(prev => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      console.error('Inpainting failed:', error)
      alert('Inpainting failed. Please try again.')
      setCurrentStep(3)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleIterationChange = (newIterations) => {
    setIterations(newIterations)
  }

  const handleHistorySelect = (historyItem) => {
    setOriginalImage(historyItem.original)
    setResultImage(historyItem.result)
    setMaskData(historyItem.mask)
    setIterations(historyItem.iterations || 2)
    setCurrentStep(4)
  }

  const handleNewImage = () => {
    setOriginalImage(null)
    setMaskData(null)
    setResultImage(null)
    setCurrentStep(1)
  }

  const handleEditMask = () => {
    setCurrentStep(2)
  }

  const getStepStatus = (step) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'active'
    return 'pending'
  }

  const steps = [
    { number: 1, label: 'Upload Image' },
    { number: 2, label: 'Draw Mask' },
    { number: 3, label: 'Configure' },
    { number: 4, label: 'View Result' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-gray-100 relative overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-[-50%] right-[-20%] w-[600px] h-[600px] bg-gradient-radial from-primary-500/10 to-transparent pointer-events-none" />
      <div className="fixed bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-gradient-radial from-purple-500/10 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-8 overflow-hidden">
        {/* Header decorative gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-purple-500/5 to-pink-500/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white via-primary-200 to-purple-200 bg-clip-text text-transparent">
            AI IMAGE INPAINTING
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-md mx-auto">
            Remove unwanted objects from your images with AI magic
          </p>
        </div>

        {/* Progress Steps */}
        <div className="relative z-10 flex items-center justify-center max-w-4xl mx-auto mt-8 px-6 gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-2 px-2 md:px-4">
                <div className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300
                  ${getStepStatus(step.number) === 'pending'
                    ? 'bg-white/10 text-white/50 border-2 border-white/20'
                    : getStepStatus(step.number) === 'active'
                      ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/40 scale-110 animate-pulse-glow'
                      : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'}
                `}>
                  {getStepStatus(step.number) === 'completed' ? '✓' : step.number}
                </div>
                <span className={`
                  text-xs font-semibold uppercase tracking-wider hidden sm:block transition-colors duration-200
                  ${getStepStatus(step.number) === 'pending'
                    ? 'text-white/40'
                    : getStepStatus(step.number) === 'active'
                      ? 'text-primary-300'
                      : 'text-emerald-300'}
                `}>
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 min-w-[20px] max-w-[60px] mb-6 rounded-full transition-all duration-500
                  ${getStepStatus(step.number) === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 to-primary-500'
                    : 'bg-white/15'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto p-6 min-h-[calc(100vh-250px)]">
        {/* History Sidebar */}
        <HistorySidebar
          history={history}
          onSelect={handleHistorySelect}
          selectedId={jobId}
        />

        {/* Main Workspace */}
        <main className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 relative overflow-hidden">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />

          {/* Step 1: Image Upload */}
          {currentStep === 1 && (
            <div className="animate-fade-in-up flex flex-col items-center gap-10">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                  Upload Your Image
                </h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                  Start by uploading the image you want to edit
                </p>
              </div>

              <ImageUploader
                onImageUpload={handleImageUpload}
                isLoading={isProcessing}
              />

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 max-w-lg w-full">
                <h4 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">📝</span> How it works:
                </h4>
                <ol className="text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Upload a JPG or PNG image (max 10MB)</li>
                  <li>Draw over objects you want to remove</li>
                  <li>AI will intelligently fill in the missing areas</li>
                  <li>Download your perfected image</li>
                </ol>
              </div>
            </div>
          )}

          {/* Step 2: Mask Drawing */}
          {currentStep === 2 && originalImage && (
            <div className="animate-fade-in-up flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                  Mark Areas to Remove
                </h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                  Draw over the objects you want to remove from the image
                </p>
              </div>

              <div className="flex justify-center items-center w-full p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <MaskCanvas
                  originalImage={originalImage}
                  onMaskChange={handleMaskChange}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                <button
                  onClick={handleNewImage}
                  className="btn-secondary"
                >
                  ← Upload New Image
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!maskData}
                  className="btn-primary"
                >
                  Continue to Settings →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && originalImage && maskData && (
            <div className="animate-fade-in-up flex flex-col gap-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                  Configure Processing
                </h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                  Adjust settings for optimal results
                </p>
              </div>

              <div className="max-w-3xl mx-auto w-full space-y-6">
                <IterationControls
                  iterations={iterations}
                  onIterationChange={handleIterationChange}
                  isLoading={isProcessing}
                />

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h4 className="text-slate-700 font-semibold mb-5">Preview</h4>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-48 h-36 object-cover rounded-xl border-2 border-slate-200 shadow-md hover:scale-105 transition-transform"
                      />
                      <span className="text-sm text-slate-500 font-medium">Original Image</span>
                    </div>
                    <div className="text-2xl text-primary-500 font-bold animate-pulse md:rotate-0 rotate-90">→</div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-48 h-36 rounded-xl border-2 border-slate-200 overflow-hidden shadow-md">
                        <img src={originalImage} alt="With mask" className="w-full h-full object-cover" />
                        <div
                          className="absolute inset-0 bg-cover opacity-70 mix-blend-multiply"
                          style={{ backgroundImage: `url(${maskData})` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500 font-medium">Areas to Remove</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  ← Edit Mask
                </button>
                <button
                  onClick={handleInpaint}
                  disabled={isProcessing}
                  className="btn-primary px-10 py-4 text-lg bg-gradient-to-r from-primary-500 to-purple-500 shadow-lg shadow-purple-500/30"
                >
                  🎨 Start Inpainting
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && (
            <div className="animate-fade-in-up flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                  Inpainting Result
                </h2>
                <p className="text-slate-500 text-lg">
                  {isProcessing
                    ? 'AI is processing your image...'
                    : 'Your image has been processed successfully!'
                  }
                </p>
              </div>

              <div className="flex justify-center">
                <ResultViewer
                  resultImage={resultImage}
                  isLoading={isProcessing}
                  originalImage={originalImage}
                  processingTime={isProcessing ? null : 5.2}
                />
              </div>

              {!isProcessing && resultImage && (
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button
                    onClick={handleEditMask}
                    className="btn-secondary"
                  >
                    ✏️ Edit Mask
                  </button>
                  <button
                    onClick={handleNewImage}
                    className="btn-primary"
                  >
                    🆕 New Image
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="btn-ghost"
                  >
                    ⚙️ Change Settings
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App