import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import FloatingContactWidget from '@/components/layout/floating-contact-widget';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { LANDING_SEO } from '@/data/landing-page-content';
import { SITE_URL } from '@/lib/constants';
import { PWA_CONFIG } from '@/lib/pwa-config';
import { buildSeoMetadata } from '@/lib/seo';
import { buildOrganizationSchema } from '@/lib/structured-data';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const seagullDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/UTM SeagullBold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/UTM SeagullBoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-seagull',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: PWA_CONFIG.themeColor,
  colorScheme: 'light',
};

const landingMetadata = buildSeoMetadata({
  title: LANDING_SEO.title,
  description: LANDING_SEO.description,
  canonicalPath: '/',
  ogImage: {
    url: PWA_CONFIG.heroImage.path,
    width: PWA_CONFIG.heroImage.width,
    height: PWA_CONFIG.heroImage.height,
    alt: PWA_CONFIG.heroImage.alt,
  },
});

export const metadata: Metadata = {
  ...landingMetadata,
  metadataBase: new URL(SITE_URL),
  title: {
    default: PWA_CONFIG.documentTitle,
    template: '%s | Long Nhãn Tống Trân',
  },
  keywords: [...LANDING_SEO.keywords],
  applicationName: PWA_CONFIG.name,
  category: 'food',
  icons: {
    icon: [{ url: PWA_CONFIG.icons.src, type: 'image/png' }],
    apple: [{ url: PWA_CONFIG.icons.src, type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: PWA_CONFIG.name,
    statusBarStyle: 'black-translucent',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const orgSchema = buildOrganizationSchema();

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${seagullDisplay.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AppProviders>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <FloatingContactWidget />
          <BackToTopButton />
        </AppProviders>
      </body>
    </html>
  );
}
