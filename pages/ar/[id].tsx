import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'

interface Model3D {
  id: string
  name: string
  description: string | null
  fileUrl: string
  qrCodeUrl: string | null
  createdAt: string
}

export default function ARViewerPage() {
  const router = useRouter()
  const { id } = router.query
  const [model, setModel] = useState<Model3D | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [arSupported, setArSupported] = useState(false)

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

  useEffect(() => {
    // Check AR support
    if (typeof navigator !== 'undefined') {
      const checkARSupport = async () => {
        if ('xr' in navigator) {
          try {
            const isSupported = await (navigator as any).xr?.isSessionSupported('immersive-ar')
            setArSupported(isSupported)
          } catch (e) {
            setArSupported(false)
          }
        } else {
          // Fallback to AR.js for devices without WebXR
          setArSupported(true)
        }
      }
      checkARSupport()
    }
  }, [])

  const initializeAR = () => {
    if (!model) return

    // Initialize AR.js scene
    const scene = document.querySelector('a-scene')
    if (scene) {
      // Add the 3D model to the AR scene
      const modelEntity = document.createElement('a-entity')
      modelEntity.setAttribute('gltf-model', model.fileUrl)
      modelEntity.setAttribute('scale', '0.5 0.5 0.5')
      modelEntity.setAttribute('position', '0 0 -2')
      modelEntity.setAttribute('rotation', '0 0 0')
      
      const marker = document.querySelector('a-marker')
      if (marker) {
        marker.appendChild(modelEntity)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading AR Experience...</p>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Model not found'}</p>
          <button
            onClick={() => router.push('/models')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Models
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{model.name} - AR Viewer</title>
        <meta name="description" content={`View ${model.name} in Augmented Reality`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      {/* Load AR.js and A-Frame */}
      <Script 
        src="https://aframe.io/releases/1.4.0/aframe.min.js"
        onLoad={() => {
          // Load AR.js after A-Frame
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js'
          script.onload = initializeAR
          document.head.appendChild(script)
        }}
      />

      <div className="relative w-full h-screen overflow-hidden">
        {/* AR Scene */}
        <a-scene
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Camera */}
          <a-entity camera></a-entity>
          
          {/* Marker - This is where the 3D model will appear */}
          <a-marker preset="hiro" raycaster="objects: .clickable" emitevents="true" cursor="fuse: false; rayOrigin: mouse;">
            {/* 3D Model will be added here by JavaScript */}
          </a-marker>
        </a-scene>

        {/* UI Overlay */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-black bg-opacity-50 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{model.name}</h1>
              <p className="text-sm opacity-75">AR Mode</p>
            </div>
            <button
              onClick={() => router.push(`/view/${model.id}`)}
              className="px-3 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 text-sm"
            >
              3D View
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-black bg-opacity-50 text-white p-4">
          <div className="text-center">
            <p className="text-sm mb-2">
              <strong>Point your camera at the Hiro marker</strong>
            </p>
            <p className="text-xs opacity-75">
              The 3D model will appear on the marker. Move your phone to view from different angles.
            </p>
            <div className="mt-2">
              <a 
                href="https://github.com/AR-js-org/AR.js/blob/master/data/images/hiro.png"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline text-xs"
              >
                Download Hiro Marker
              </a>
            </div>
          </div>
        </div>

        {/* Fallback for non-AR devices */}
        {!arSupported && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
            <div className="text-white text-center p-6">
              <h2 className="text-xl font-bold mb-4">AR Not Supported</h2>
              <p className="mb-4">Your device doesn't support AR. Try the 3D viewer instead.</p>
              <button
                onClick={() => router.push(`/view/${model.id}`)}
                className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View in 3D
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
