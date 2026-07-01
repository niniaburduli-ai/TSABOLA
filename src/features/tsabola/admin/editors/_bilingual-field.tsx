'use client'

import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'

import type { L } from '../../types'

type Props = {
  label: string
  value: L
  onChange: (val: L) => void
  multiline?: boolean
  hint?: string
}

export function BilingualField({ label, value, onChange, multiline, hint }: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-charcoal/70">{label}</Label>
      {hint && <p className="text-xs text-charcoal/40">{hint}</p>}
      <Tabs defaultValue="ka">
        <TabsList className="h-8">
          <TabsTrigger value="ka" className="text-xs">KA</TabsTrigger>
          <TabsTrigger value="en" className="text-xs">EN</TabsTrigger>
        </TabsList>
        {(['ka', 'en'] as const).map((lang) => (
          <TabsContent key={lang} value={lang}>
            {multiline ? (
              <Textarea
                value={value[lang]}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                className="w-full"
              />
            ) : (
              <Input
                value={value[lang]}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                className="w-full"
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
