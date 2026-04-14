import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import FloatingContactWidget from '@/components/layout/floating-contact-widget';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { buildOrganizationSchema } from '@/lib/structured-data';
import { SITE_URL } from '@/lib/constants';
import { LANDING_SEO } from '@/data/landing-page-content';

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

export const metadata: Metadata = {
  title: {
    default: LANDING_SEO.title,
    template: '%s | Long Nhãn Tống Trân',
  },
  description: LANDING_SEO.description,
  keywords: [...LANDING_SEO.keywords],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Long Nhãn Tống Trân',
    title: LANDING_SEO.title,
    description: LANDING_SEO.description,
    url: SITE_URL,
    images: [
      {
        url: '/banner-web2.png',
        width: 1200,
        height: 630,
        alt: LANDING_SEO.title,
      },
    ],
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
