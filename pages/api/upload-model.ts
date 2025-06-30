import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import QRCode from 'qrcode'
import { addModel, updateModel } from '../../lib/storage'

// Create directories if they don't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
const qrCodesDir = path.join(process.cwd(), 'public', 'qr-codes')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir, { recursive: true })
}

export const config = {
  api: { bodyParser: false }, // Required for formidable
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const form = formidable({
    keepExtensions: true,
    uploadDir: uploadsDir
  })

  try {
    console.log('Starting upload process...')
    const [fields, files] = await form.parse(req)
    console.log('Form parsed successfully')

    // ✅ Extract fields
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!name || !file) return res.status(400).json({ error: 'Missing name or file' })

    // ✅ Move file to public directory
    const fileName = `${Date.now()}-${file.originalFilename}`
    const publicFilePath = path.join(uploadsDir, fileName)

    // Copy file to public directory
    fs.copyFileSync(file.filepath, publicFilePath)

    // Clean up temp file
    fs.unlinkSync(file.filepath)

    const fileUrl = `/uploads/${fileName}`
    console.log('File saved locally:', fileUrl)

    // ✅ Create model record
    const model = addModel({
      name,
      description: description || null,
      fileUrl,
      qrCodeUrl: null
    })

    // ✅ Generate QR code that links to the AR viewer page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const viewerUrl = `${baseUrl}/ar/${model.id}`
    console.log('Generating QR code for:', viewerUrl)

    const qrCodeDataUrl = await QRCode.toDataURL(viewerUrl, {
      width: 512,  // Higher resolution for better mobile scanning
      margin: 3,   // More margin for better scanning
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'  // High error correction for better scanning
    })

    // ✅ Save QR code to public directory
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64')
    const qrCodeFileName = `qr-${model.id}.png`
    const qrCodePath = path.join(qrCodesDir, qrCodeFileName)

    fs.writeFileSync(qrCodePath, qrCodeBuffer)

    const qrCodeUrl = `/qr-codes/${qrCodeFileName}`

    console.log('QR code saved:', qrCodeUrl)

    // ✅ Update model with QR code URL
    const updatedModel = updateModel(model.id, { qrCodeUrl })

    res.status(200).json({ model: updatedModel })
  } catch (err: any) {
    console.error('Upload failed:', err)
    console.error('Error stack:', err.stack)
    res.status(500).json({
      error: err.message || 'Upload error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
}
