'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

export function ThemeEditor() {
  const { theme, setTheme } = useContentStore()

  return (
    <div className="max-w-sm space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Theme</h2>

      <div className="space-y-4">
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
        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Heading Size</Label>
          <Select
            value={theme.headingSize}
            onValueChange={(v) => setTheme({ ...theme, headingSize: v as 'sm' | 'md' | 'lg' })}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Body Size</Label>
          <Select
            value={theme.bodySize}
            onValueChange={(v) => setTheme({ ...theme, bodySize: v as 'sm' | 'md' })}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-charcoal/40">Color changes apply live to the public site.</p>
    </div>
  )
}
