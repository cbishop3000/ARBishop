import fs from 'fs'
import path from 'path'

const STORAGE_FILE = path.join(process.cwd(), 'data', 'models.json')

// Ensure data directory exists
const dataDir = path.dirname(STORAGE_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export interface Model3D {
  id: string
  name: string
  description: string | null
  fileUrl: string
  qrCodeUrl: string | null
  createdAt: string
}

let nextId = 1

export function loadModels(): Model3D[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      const parsed = JSON.parse(data)
      // Update nextId to avoid conflicts
      if (parsed.models && parsed.models.length > 0) {
        const maxId = Math.max(...parsed.models.map((m: Model3D) => 
          parseInt(m.id.replace('model_', '')) || 0
        ))
        nextId = maxId + 1
      }
      return parsed.models || []
    }
  } catch (error) {
    console.error('Error loading models:', error)
  }
  return []
}

export function saveModels(models: Model3D[]): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify({ models }, null, 2))
  } catch (error) {
    console.error('Error saving models:', error)
  }
}

export function addModel(model: Omit<Model3D, 'id' | 'createdAt'>): Model3D {
  const models = loadModels()
  const newModel: Model3D = {
    ...model,
    id: `model_${nextId++}`,
    createdAt: new Date().toISOString()
  }
  models.push(newModel)
  saveModels(models)
  return newModel
}

export function getModel(id: string): Model3D | null {
  const models = loadModels()
  return models.find(m => m.id === id) || null
}

export function getAllModels(): Model3D[] {
  return loadModels().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function updateModel(id: string, updates: Partial<Model3D>): Model3D | null {
  const models = loadModels()
  const index = models.findIndex(m => m.id === id)
  if (index === -1) return null
  
  models[index] = { ...models[index], ...updates }
  saveModels(models)
  return models[index]
}
