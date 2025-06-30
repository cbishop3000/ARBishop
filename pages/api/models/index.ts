import { NextApiRequest, NextApiResponse } from 'next'
import { getAllModels } from '../../../lib/storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const models = getAllModels()
    return res.status(200).json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
