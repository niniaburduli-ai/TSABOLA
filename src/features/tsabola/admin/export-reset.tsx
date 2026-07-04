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
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-sm space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">მოქმედებები</h2>

      <div className="space-y-4">
        <div className="p-4 border border-border-wine rounded">
          <p className="text-sm font-medium text-charcoal mb-2">კონტენტის ექსპორტი</p>
          <p className="text-xs text-charcoal/50 mb-4">
            ჩამოტვირთეთ მიმდინარე კონტენტი, თემა და ხილვადობა JSON ფორმატში. გამოიყენეთ სარეზერვო ასლისთვის ან
            მომავალ CMS-ში იმპორტისთვის.
          </p>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-wine text-wine hover:bg-wine/5"
          >
            ჩამოტვირთვა tsabola-content.json
          </Button>
        </div>

        <div className="p-4 border border-red-200 rounded">
          <p className="text-sm font-medium text-charcoal mb-2">ნაგულისხმევზე დაბრუნება</p>
          <p className="text-xs text-charcoal/50 mb-4">
            აღადგენს მთელ კონტენტს, თემასა და ხილვადობას საწყის მდგომარეობაში. ამის გაუქმება შეუძლებელია.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                ნაგულისხმევზე დაბრუნება
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>გსურთ მთელი კონტენტის გადატვირთვა?</AlertDialogTitle>
                <AlertDialogDescription>
                  ეს აღადგენს მთელ კონტენტს, თემასა და სექციების ხილვადობას საწყის მდგომარეობაში. თქვენი ყველა
                  ცვლილება დაიკარგება. ამის გაუქმება შეუძლებელია.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetToDefaults}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  გადატვირთვა
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
