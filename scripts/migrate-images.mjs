import { v2 as cloudinary } from 'cloudinary'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const publicDir = join(__dirname, '..', 'public')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const IMAGES = [
  { file: 'HERO RTVELI.png', folder: 'tsabola/hero', key: 'hero-rtveli' },
  { file: 'HERO VENAXI.png', folder: 'tsabola/hero', key: 'hero-venaxi' },
  { file: 'white wine.png', folder: 'tsabola/wines', key: 'white-wine' },
  { file: 'red wine.png', folder: 'tsabola/wines', key: 'red-wine' },
  { file: 'gallery white.png', folder: 'tsabola/gallery', key: 'gallery-white' },
  { file: 'gallery red.png', folder: 'tsabola/gallery', key: 'gallery-red' },
  { file: 'GALLERY RTVELI .png', folder: 'tsabola/gallery', key: 'gallery-rtveli' },
  { file: 'gallery supra.png', folder: 'tsabola/gallery', key: 'gallery-supra' },
  { file: 'VAZI.png', folder: 'tsabola/about', key: 'about-vazi' },
  { file: 'LA.PNG', folder: 'tsabola/content', key: 'logo-la' },
]

const results = {}

for (const img of IMAGES) {
  const filePath = join(publicDir, img.file)
  let data
  try {
    data = readFileSync(filePath)
  } catch {
    console.error(`SKIP (not found): ${img.file}`)
    continue
  }

  const base64 = `data:image/png;base64,${data.toString('base64')}`
  try {
    const res = await cloudinary.uploader.upload(base64, {
      folder: img.folder,
      public_id: img.key,
      overwrite: false,
      resource_type: 'image',
    })
    results[img.key] = res.secure_url
    console.log(`OK: ${img.file} → ${res.secure_url}`)
  } catch (err) {
    console.error(`FAIL: ${img.file} — ${err.message}`)
  }
}

console.log('\n--- URL MAP ---')
console.log(JSON.stringify(results, null, 2))
