import { TsabolaMarketingPost } from '@/features/tsabola/components/tsabola-marketing-post'

export const metadata = {
  title: 'ცაბო — Brand',
}

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-lg">
        <TsabolaMarketingPost />
      </div>
    </div>
  )
}
