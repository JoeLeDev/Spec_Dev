import multer from 'multer'
import { UPLOADS_DIR, ensureUploadsDir } from '../utils/productImageUpload.js'

ensureUploadsDir()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadsDir()
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const extension = file.mimetype === 'image/jpeg' ? '.jpg' : ''
    const suffix =
      extension ||
      (file.mimetype === 'image/png'
        ? '.png'
        : file.mimetype === 'image/webp'
          ? '.webp'
          : file.mimetype === 'image/gif'
            ? '.gif'
            : '')
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${suffix}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.mimetype)) {
    cb(new Error('Format image non autorisé'))
    return
  }
  cb(null, true)
}

export const MAX_PRODUCT_IMAGES = 10

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).array('images', MAX_PRODUCT_IMAGES)
