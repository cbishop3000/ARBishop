import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query
  
  if (!file || !Array.isArray(file)) {
    return res.status(400).json({ error: 'Invalid file path' })
  }
  
  const filePath = path.join(process.cwd(), 'public', 'qr-codes', ...file)
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    const fileBuffer = fs.readFileSync(filePath)
    
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    res.send(fileBuffer)
  } catch (error) {
    console.error('Error serving QR code:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
