'use client'

import { useRef, useState } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { getCroppedImageBlob, padImageToAspect, type PixelCrop as CropRect } from '@/shared/utils/crop-image'

type Props = {
  imageSrc: string
  aspect: number
  onCancel: () => void
  onCropped: (blob: Blob) => void
}

export function ImageCropperModal({ imageSrc, aspect, onCancel, onCropped }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>({ unit: '%', x: 0, y: 0, width: 100, height: 100 })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCompletedCrop({ unit: 'px', x: 0, y: 0, width, height })
  }

  function toNaturalCropRect(pixelCrop: PixelCrop): CropRect {
    const image = imgRef.current
    const scaleX = image ? image.naturalWidth / image.width : 1
    const scaleY = image ? image.naturalHeight / image.height : 1
    return {
      x: Math.round(pixelCrop.x * scaleX),
      y: Math.round(pixelCrop.y * scaleY),
      width: Math.round(pixelCrop.width * scaleX),
      height: Math.round(pixelCrop.height * scaleY),
    }
  }

  async function handleSave() {
    if (!completedCrop) return
    setProcessing(true)
    setError(null)
    try {
      const blob = await getCroppedImageBlob(imageSrc, toNaturalCropRect(completedCrop))
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
        <div className="flex items-center justify-center bg-charcoal/5 rounded overflow-hidden max-h-96">
          <ReactCrop
            crop={crop}
            onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt=""
              onLoad={handleImageLoad}
              className="max-h-96 w-auto"
            />
          </ReactCrop>
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
            disabled={processing || !completedCrop}
            className="px-3 py-1.5 text-xs font-medium bg-wine text-white rounded hover:bg-wine/90 disabled:opacity-50"
          >
            {processing ? 'ინახება…' : 'შენახვა'}
          </button>
        </div>
      </div>
    </div>
  )
}
