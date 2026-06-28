'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'

export function ExportReset() {
  const { content, theme, visibility, resetToDefaults } = useContentStore()

  const handleExport = () => {
    const data = JSON.stringify({ content, theme, visibility }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tsabola-content.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-sm space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Actions</h2>

      <div className="space-y-4">
        <div className="p-4 border border-border-wine rounded">
          <p className="text-sm font-medium text-charcoal mb-2">Export Content</p>
          <p className="text-xs text-charcoal/50 mb-4">
            Downloads current content, theme, and visibility as JSON. Use to back up or import into a future CMS.
          </p>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-wine text-wine hover:bg-wine/5"
          >
            Download tsabola-content.json
          </Button>
        </div>

        <div className="p-4 border border-red-200 rounded">
          <p className="text-sm font-medium text-charcoal mb-2">Reset to Defaults</p>
          <p className="text-xs text-charcoal/50 mb-4">
            Restores all content, theme, and visibility to their original defaults. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all content?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restore all content, theme, and section visibility to their defaults. All your
                  edits will be lost. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetToDefaults}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
