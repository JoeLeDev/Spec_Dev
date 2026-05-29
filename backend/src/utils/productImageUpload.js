import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads')

// Assure que le dossier uploads existe.
export const ensureUploadsDir = () => {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}
