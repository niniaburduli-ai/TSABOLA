'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

const HEADING_FONTS = [
  { label: 'Space Grotesk', value: '--font-space-grotesk' },
  { label: 'Playfair Display', value: '--font-display' },
  { label: 'Cormorant Garamond', value: '--font-cormorant' },
  { label: 'Lora', value: '--font-lora' },
  { label: 'Poppins', value: '--font-poppins' },
  { label: 'Raleway', value: '--font-raleway' },
]

const BODY_FONTS = [
  { label: 'Inter', value: '--font-sans' },
  { label: 'Poppins', value: '--font-poppins' },
  { label: 'Lora', value: '--font-lora' },
  { label: 'Space Grotesk', value: '--font-space-grotesk' },
]

export function ThemeEditor() {
  const { theme, setTheme } = useContentStore()

  return (
    <div className="max-w-sm space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Theme</h2>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Colors</p>
        {(
          [
            ['Wine Color', 'colorWine'],
            ['Charcoal Color', 'colorCharcoal'],
            ['Cream Color', 'colorCream'],
          ] as const
        ).map(([label, key]) => (
          <div key={key} className="flex items-center gap-4">
            <Label className="w-32 text-sm text-charcoal/70">{label}</Label>
            <input
              type="color"
              value={theme[key]}
              onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
              className="h-9 w-16 rounded border border-border-wine cursor-pointer"
            />
            <span className="text-xs text-charcoal/40 font-mono">{theme[key]}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Typography</p>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Heading Font</Label>
          <Select
            value={theme.headingFont ?? '--font-space-grotesk'}
            onValueChange={(v) => setTheme({ ...theme, headingFont: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HEADING_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Body Font</Label>
          <Select
            value={theme.bodyFont ?? '--font-sans'}
            onValueChange={(v) => setTheme({ ...theme, bodyFont: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BODY_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Heading Size</Label>
          <Select
            value={theme.headingSize ?? 'lg'}
            onValueChange={(v) => setTheme({ ...theme, headingSize: v as 'xs' | 'sm' | 'md' | 'lg' | 'xl' })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Extra Small</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Body Size</Label>
          <Select
            value={theme.bodySize ?? 'md'}
            onValueChange={(v) => setTheme({ ...theme, bodySize: v as 'xs' | 'sm' | 'md' | 'lg' })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Extra Small</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-charcoal/40">Changes apply live to the public site.</p>
    </div>
  )
}
