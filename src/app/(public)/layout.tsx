import { cookies } from 'next/headers';

import { TsabolaContentProvider } from '@/features/tsabola/components/tsabola-content-provider';
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '@/features/tsabola/content/site-content';
import { getSiteContent } from '@/features/tsabola/service/site-content.service';
import type { SectionVisibility, SiteContent, ThemeConfig } from '@/features/tsabola/types';
import { LANG_COOKIE_NAME } from '@/shared/const/cookie.const';
import { SessionProvider } from '@/shared/providers/session-provider';
import { StoreProvider } from '@/shared/providers/store-provider';

import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [siteContentResult, cookieStore] = await Promise.all([getSiteContent(), cookies()]);
  const siteContentData = siteContentResult.data;

  const initialContent = ('error' in siteContentData ? DEFAULT_CONTENT : siteContentData.content) as SiteContent;
  const initialTheme = ('error' in siteContentData ? DEFAULT_THEME : siteContentData.theme) as ThemeConfig;
  const initialVisibility = ('error' in siteContentData ? DEFAULT_VISIBILITY : siteContentData.visibility) as SectionVisibility;
  const initialLang = cookieStore.get(LANG_COOKIE_NAME)?.value === 'en' ? 'en' : 'ka';

  return (
    <SessionProvider>
      <StoreProvider>
        <TsabolaContentProvider
          initialContent={initialContent}
          initialTheme={initialTheme}
          initialVisibility={initialVisibility}
          initialLang={initialLang}
        >
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </TsabolaContentProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
