import { NextApiRequest, NextApiResponse } from 'next'
import { getModel } from '../../../lib/storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid model ID' })
  }

  try {
    const model = getModel(id)

    if (!model) {
      return res.status(404).json({ error: 'Model not found' })
    }

    return res.status(200).json({ model })
  } catch (error) {
    console.error('Error fetching model:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
