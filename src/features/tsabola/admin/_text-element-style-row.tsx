'use client'

import type { TextElementStyle, ThemeConfig } from '@/features/tsabola/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { BODY_FONT_OPTIONS, HEADING_FONT_OPTIONS } from '@/shared/const/heading-font.const'
import { HEADING_SIZE_LABEL, HEADING_SIZE_OPTIONS } from '@/shared/const/heading-size.const'
import { resolveElementRoleBaseHex, resolveElementStyle, type SectionElementDef } from '@/shared/const/site-section-elements.const'

type Props = {
  def: SectionElementDef
  theme: ThemeConfig
  style: TextElementStyle
  onChange: (patch: Partial<TextElementStyle>) => void
}

export function TextElementStyleRow({ def, theme, style, onChange }: Props) {
  const resolved = resolveElementStyle(def, theme, style)
  const fontOptions = def.kind === 'heading' ? HEADING_FONT_OPTIONS : BODY_FONT_OPTIONS

  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      <span className="w-28 text-sm text-charcoal/70 flex-shrink-0">{def.label}</span>

      <div className="flex items-center gap-1">
        <input
          type="color"
          value={style.color ?? resolveElementRoleBaseHex(def.role, theme)}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-9 w-14 rounded border border-border-wine cursor-pointer"
        />
        {style.color && (
          <button
            type="button"
            onClick={() => onChange({ color: undefined })}
            className="text-xs text-charcoal/40 underline"
          >
            თემა
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Select value={resolved.font} onValueChange={(v) => onChange({ font: v })}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {style.font && (
          <button
            type="button"
            onClick={() => onChange({ font: undefined })}
            className="text-xs text-charcoal/40 underline"
          >
            თემა
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Select value={resolved.size} onValueChange={(v) => onChange({ size: v as TextElementStyle['size'] })}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEADING_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size}>{HEADING_SIZE_LABEL[size]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {style.size && (
          <button
            type="button"
            onClick={() => onChange({ size: undefined })}
            className="text-xs text-charcoal/40 underline"
          >
            თემა
          </button>
        )}
      </div>
    </div>
  )
}
