import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface UploadedModel {
  id: string
  name: string
  description: string | null
  fileUrl: string
  qrCodeUrl: string | null
}

export default function UploadPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [uploadedModel, setUploadedModel] = useState<UploadedModel | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !file) {
      setMessage('Please provide a name and .glb file')
      return
    }

    setUploading(true)
    setMessage('')
    setUploadedModel(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-model', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Successfully uploaded: ${data.model.name}`)
        setUploadedModel(data.model)
        setName('')
        setDescription('')
        setFile(null)
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Upload 3D Model</h1>
            <Link
              href="/models"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              View All Models
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload GLB File</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter model name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GLB File *
                </label>
                <input
                  type="file"
                  accept=".glb"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {uploading ? 'Uploading...' : 'Upload Model'}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded ${
                message.includes('✅')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Success Display */}
          {uploadedModel && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Successful!</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{uploadedModel.name}</h3>
                  {uploadedModel.description && (
                    <p className="text-gray-600 text-sm">{uploadedModel.description}</p>
                  )}
                </div>

                {uploadedModel.qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">QR Code:</p>
                    <div className="inline-block p-4 bg-gray-50 rounded-lg">
                      <Image
                        src={uploadedModel.qrCodeUrl}
                        alt={`QR Code for ${uploadedModel.name}`}
                        width={200}
                        height={200}
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Scan this QR code to view the 3D model
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/ar/${uploadedModel.id}`}
                      className="block text-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      AR View
                    </Link>
                    <Link
                      href={`/view/${uploadedModel.id}`}
                      className="block text-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      3D View
                    </Link>
                  </div>

                  {uploadedModel.qrCodeUrl && (
                    <a
                      href={uploadedModel.qrCodeUrl}
                      download={`${uploadedModel.name}-qr-code.png`}
                      className="w-full block text-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Download QR Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
