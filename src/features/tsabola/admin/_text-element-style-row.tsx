'use client'

import type { TextElementStyle } from '@/features/tsabola/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { HEADING_FONT_OPTIONS } from '@/shared/const/heading-font.const'
import { HEADING_SIZE_LABEL, HEADING_SIZE_OPTIONS } from '@/shared/const/heading-size.const'

type Props = {
  label: string
  style: TextElementStyle
  onChange: (patch: Partial<TextElementStyle>) => void
}

export function TextElementStyleRow({ label, style, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      <span className="w-28 text-sm text-charcoal/70 flex-shrink-0">{label}</span>
      <input
        type="color"
        value={style.color}
        onChange={(e) => onChange({ color: e.target.value })}
        className="h-9 w-14 rounded border border-border-wine cursor-pointer"
      />
      <Select value={style.font} onValueChange={(v) => onChange({ font: v })}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HEADING_FONT_OPTIONS.map((f) => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={style.size} onValueChange={(v) => onChange({ size: v as TextElementStyle['size'] })}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HEADING_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={size}>{HEADING_SIZE_LABEL[size]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
