'use client'

import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

import type { L } from '../../types'

interface Props {
  label: string
  value: L
  onChange: (val: L) => void
  multiline?: boolean
}

export function BilingualField({ label, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-charcoal/70">{label}</Label>
      <Tabs defaultValue="ka">
        <TabsList className="h-8">
          <TabsTrigger value="ka" className="text-xs">KA</TabsTrigger>
          <TabsTrigger value="en" className="text-xs">EN</TabsTrigger>
        </TabsList>
        {(['ka', 'en'] as const).map((lang) => (
          <TabsContent key={lang} value={lang}>
            <Input
              value={value[lang]}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              className="w-full"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
