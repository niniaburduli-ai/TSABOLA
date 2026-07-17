'use client'

import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { IMAGE_SIZE_LABEL, IMAGE_SIZE_OPTIONS } from '@/shared/const/image-size.const'
import type { ImageSize } from '@/shared/types/common'

type Props = {
  value: ImageSize
  onChange: (val: ImageSize) => void
}

export function ImageSizeSelect({ value, onChange }: Props) {
  return (
    <div className="flex-1 space-y-1">
      <Label className="text-xs text-charcoal/50">ზომა</Label>
      <Select value={value} onValueChange={(v) => onChange(v as ImageSize)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {IMAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={size}>{IMAGE_SIZE_LABEL[size]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
