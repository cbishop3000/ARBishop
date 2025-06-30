import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center, Html, useProgress } from '@react-three/drei'
import { Suspense } from 'react'
import Head from 'next/head'

interface Model3D {
  id: string
  name: string
  description: string | null
  fileUrl: string
  qrCodeUrl: string | null
  createdAt: string
}

function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
        <div className="text-lg font-medium">Loading 3D Model</div>
        <div className="text-sm opacity-75">{Math.round(progress)}% loaded</div>
      </div>
    </Html>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function ViewModelPage() {
  const router = useRouter()
  const { id } = router.query
  const [model, setModel] = useState<Model3D | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!id || typeof id !== 'string') return

    const fetchModel = async () => {
      try {
        const response = await fetch(`/api/models/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch model')
        }

        setModel(data.model)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchModel()
  }, [id])

  // Auto-hide controls on mobile after 3 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showControls])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleCanvasClick = () => {
    setShowControls(true)
  }

  const handleShare = async () => {
    const shareData = {
      title: model?.name || '3D Model',
      text: model?.description || 'Check out this 3D model!',
      url: window.location.href
    }

    if (navigator.share && isMobile) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Model not found'}</p>
          <button
            onClick={() => router.push('/models')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Models
          </button>
        </div>
      </div>
    )
  }

  const containerClasses = `min-h-screen bg-gray-900 relative overflow-hidden mobile-viewer no-zoom touch-none ${
    isFullscreen ? 'fullscreen-viewer' : ''
  }`

  return (
    <>
      <Head>
        <title>{model?.name || 'Loading...'} - 3D Model Viewer</title>
        <meta name="description" content={model?.description || 'Interactive 3D model viewer'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <div className={containerClasses}>
        {/* Mobile-optimized Header */}
        <div className={`absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-50 text-white transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">{model.name}</h1>
                {model.description && (
                  <p className="text-sm text-gray-300 truncate">{model.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {isMobile && (
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                    title="Share"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isFullscreen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                </button>
                {!isMobile && (
                  <button
                    onClick={() => router.push('/models')}
                    className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                    title="Back to Models"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Viewer - Full Screen */}
        <div
          className="absolute inset-0 w-full h-full"
          onClick={handleCanvasClick}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance"
            }}
            dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          >
            <Suspense fallback={<Loader />}>
              <Environment preset="studio" />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <Center>
                <ModelViewer url={model.fileUrl} />
              </Center>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={0.5}
                maxDistance={50}
                // Mobile-optimized touch controls
                touches={{
                  ONE: 2, // TOUCH.ROTATE
                  TWO: 1  // TOUCH.DOLLY_PAN
                }}
                // Smooth controls
                enableDamping={true}
                dampingFactor={0.05}
                // Auto-rotate when idle (optional)
                autoRotate={false}
                autoRotateSpeed={0.5}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Mobile Controls Info - Bottom */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 bg-black bg-opacity-50 text-white transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="px-4 py-3 text-center">
            <p className="text-sm">
              <strong>Touch Controls:</strong> One finger to rotate • Two fingers to zoom & pan
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Tap screen to show/hide controls
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
