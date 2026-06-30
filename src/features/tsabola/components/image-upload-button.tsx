'use client'

import { useRef, useState } from 'react'

const MAX_BYTES = 10 * 1024 * 1024

type Props = {
  onUpload: (url: string) => void
  folder?: string
  disabled?: boolean
}

export function ImageUploadButton({ onUpload, folder = 'tsabola/content', disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)

    if (file.size > MAX_BYTES) {
      setError('File exceeds 10 MB limit')
      return
    }

    setUploading(true)
    try {
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      })
      if (!signRes.ok) throw new Error('Failed to get upload signature')
      const { signature, timestamp, cloudName, apiKey, folder: signedFolder } =
        await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', String(timestamp))
      formData.append('api_key', apiKey)
      formData.append('folder', signedFolder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed')
      const { secure_url } = await uploadRes.json()
      onUpload(secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1">
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
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className={
          'flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded ' +
          'border-wine/40 text-wine hover:bg-wine/5 ' +
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        }
      >
        {uploading ? (
          <>
            <span
              className={
                'w-3 h-3 border border-wine/30 border-t-wine rounded-full animate-spin'
              }
            />
            Uploading…
          </>
        ) : (
          'Upload image'
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
