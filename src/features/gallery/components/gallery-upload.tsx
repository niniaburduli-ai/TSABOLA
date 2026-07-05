'use client'

import { useRef, useState } from 'react'

import { ImageCropperModal } from '@/shared/components/image-cropper-modal'

const GALLERY_ASPECT = 1

type UploadedImage = { id: string; url: string; publicId: string }

type Props = {
  onUploaded: (image: UploadedImage) => void
}

export function GalleryUpload({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cropModeRef = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)

    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10 MB limit')
      return
    }

    if (cropModeRef.current) {
      setCropSrc(URL.createObjectURL(file))
      return
    }

    await uploadFile(file)
  }

  async function handleCropped(blob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    await uploadFile(new File([blob], 'crop.jpg', { type: blob.type }))
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function uploadFile(file: File) {
    setUploading(true)

    try {
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'tsabola/gallery' }),
      })
      if (!signRes.ok) throw new Error('Failed to get upload signature')
      const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', String(timestamp))
      formData.append('api_key', apiKey)
      formData.append('folder', folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed')
      const { secure_url, public_id } = await uploadRes.json()

      const saveRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: secure_url, publicId: public_id }),
      })
      if (!saveRes.ok) throw new Error('Failed to save image')
      const saved = await saveRes.json()

      onUploaded({ id: saved._id, url: secure_url, publicId: public_id })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => {
            cropModeRef.current = false
            inputRef.current?.click()
          }}
          className={
            'flex items-center gap-2 px-4 py-2 bg-wine text-white text-sm font-medium ' +
            'rounded hover:bg-wine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          }
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            '+ Upload Image'
          )}
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={() => {
            cropModeRef.current = true
            inputRef.current?.click()
          }}
          className={
            'px-4 py-2 border border-wine/40 text-wine text-sm font-medium ' +
            'rounded hover:bg-wine/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          }
        >
          + Upload & Crop
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {cropSrc && (
        <ImageCropperModal
          imageSrc={cropSrc}
          aspect={GALLERY_ASPECT}
          onCancel={handleCropCancel}
          onCropped={handleCropped}
        />
      )}
    </div>
  )
}
