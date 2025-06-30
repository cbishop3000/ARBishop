import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Model3D {
  id: string
  name: string
  description: string | null
  fileUrl: string
  qrCodeUrl: string | null
  createdAt: string
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model3D[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch models')
      }

      setModels(data.models)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = (qrCodeUrl: string, modelName: string) => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${modelName}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyViewerLink = (modelId: string) => {
    const arUrl = `${window.location.origin}/ar/${modelId}`
    navigator.clipboard.writeText(arUrl).then(() => {
      alert('AR link copied to clipboard!')
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchModels}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">3D Models</h1>
            <div className="space-x-4">
              <Link
                href="/upload"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Upload New Model
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {models.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">No models uploaded yet</h2>
            <Link
              href="/upload"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Upload Your First Model
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div key={model.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Model Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{model.name}</h3>
                  {model.description && (
                    <p className="text-gray-600 mb-4">{model.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-4">
                    Uploaded: {new Date(model.createdAt).toLocaleDateString()}
                  </p>

                  {/* QR Code */}
                  {model.qrCodeUrl && (
                    <div className="mb-4 text-center">
                      <p className="text-sm font-medium text-gray-700 mb-2">QR Code:</p>
                      <div className="inline-block p-2 bg-gray-50 rounded">
                        <Image
                          src={model.qrCodeUrl}
                          alt={`QR Code for ${model.name}`}
                          width={128}
                          height={128}
                          className="mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/ar/${model.id}`}
                        className="block text-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        AR View
                      </Link>
                      <Link
                        href={`/view/${model.id}`}
                        className="block text-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        3D View
                      </Link>
                    </div>

                    <button
                      onClick={() => copyViewerLink(model.id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Copy AR Link
                    </button>

                    {model.qrCodeUrl && (
                      <button
                        onClick={() => downloadQRCode(model.qrCodeUrl!, model.name)}
                        className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                      >
                        Download QR Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
