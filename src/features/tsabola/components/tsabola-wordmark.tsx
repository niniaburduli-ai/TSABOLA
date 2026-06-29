'use client'

import Image from 'next/image'

import { useLang } from '../hooks/use-lang'

type TsabolaWordmarkProps = {
  size?: 'sm' | 'lg'
}

export function TsabolaWordmark({ size = 'sm' }: TsabolaWordmarkProps) {
  const { lang } = useLang()
  const core = lang === 'ka' ? 'ცაბო' : 'TSABO'
  const isLg = size === 'lg'

  return (
    <span className={`inline-flex items-center ${isLg ? 'gap-5' : 'gap-2'}`}>
      <span
        className={`font-display font-bold tracking-widest text-white uppercase ${
          isLg ? 'text-6xl sm:text-7xl lg:text-8xl' : 'text-xl'
        }`}
      >
        {core}
      </span>
      <Image
        src="/LA.PNG"
        alt=""
        width={90}
        height={90}
        className={`flex-shrink-0 invert ${isLg ? 'h-14 w-auto' : 'h-4 w-auto'}`}
      />
    </span>
  )
}
