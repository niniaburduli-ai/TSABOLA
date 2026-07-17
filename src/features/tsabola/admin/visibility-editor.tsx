'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { SITE_SECTIONS } from '@/shared/const/site-section.const'

export function VisibilityEditor() {
  const { visibility, setVisibility } = useContentStore()

  return (
    <div className="max-w-sm space-y-6">
      <h2 className="font-display text-2xl font-bold text-charcoal">სექციების ხილვადობა</h2>
      <p className="text-sm text-charcoal/50">ჰედერი და ფუტერი ყოველთვის ხილულია.</p>

      <div className="space-y-4">
        {SITE_SECTIONS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-border-wine">
            <Label className="text-sm font-medium text-charcoal">{label}</Label>
            <Switch
              checked={visibility[key]}
              onCheckedChange={(checked) => setVisibility({ ...visibility, [key]: checked })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
