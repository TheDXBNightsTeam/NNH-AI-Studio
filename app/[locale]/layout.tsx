import type React from "react"
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from "sonner"
import { Providers } from '../providers';

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;
  if (locale !== 'en') {
    notFound();
  }
  const messages = await getMessages();

  return (
    <div lang="en">
      <NextIntlClientProvider messages={messages} locale="en">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </NextIntlClientProvider>
    </div>
  )
}
