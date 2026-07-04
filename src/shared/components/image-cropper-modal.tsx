'use client'

import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

import { getCroppedImageBlob, padImageToAspect } from '@/shared/utils/crop-image'

type Props = {
  imageSrc: string
  aspect: number
  onCancel: () => void
  onCropped: (blob: Blob) => void
}

export function ImageCropperModal({ imageSrc, aspect, onCancel, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  async function handleSave() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    setError(null)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels)
      onCropped(blob)
    } catch {
      setError('მოჭრა ვერ მოხერხდა, სცადეთ ხელახლა')
    } finally {
      setProcessing(false)
    }
  }

  async function handleFitWhole(background: string | null) {
    setProcessing(true)
    setError(null)
    try {
      const blob = await padImageToAspect(imageSrc, aspect, background)
      onCropped(blob)
    } catch {
      setError('მორგება ვერ მოხერხდა, სცადეთ ხელახლა')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4">
      <div className="w-full max-w-lg bg-white rounded shadow-lg flex flex-col gap-4 p-4">
        <div className="relative w-full h-96 bg-charcoal/5 rounded overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-charcoal/60">მასშტაბი</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-wine"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex flex-col gap-2 pt-2 border-t border-charcoal/10">
          <p className="text-xs text-charcoal/60">
            არ გსურთ სურათის მოჭრა? სრული სურათი მოარგეთ padding-ის დამატებით:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFitWhole('#ffffff')}
              disabled={processing}
              className="px-3 py-1.5 text-xs font-medium border border-charcoal/20 text-charcoal rounded hover:bg-charcoal/5 disabled:opacity-50"
            >
              სრული სურათი (თეთრი ფონი)
            </button>
            <button
              type="button"
              onClick={() => handleFitWhole(null)}
              disabled={processing}
              className="px-3 py-1.5 text-xs font-medium border border-charcoal/20 text-charcoal rounded hover:bg-charcoal/5 disabled:opacity-50"
            >
              სრული სურათი (გამჭვირვალე ფონი)
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="px-3 py-1.5 text-xs font-medium border border-charcoal/20 text-charcoal rounded hover:bg-charcoal/5 disabled:opacity-50"
          >
            გაუქმება
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={processing || !croppedAreaPixels}
            className="px-3 py-1.5 text-xs font-medium bg-wine text-white rounded hover:bg-wine/90 disabled:opacity-50"
          >
            {processing ? 'ინახება…' : 'შენახვა'}
          </button>
        </div>
      </div>
    </div>
  )
}
