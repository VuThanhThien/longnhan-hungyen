import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Long Nhãn Admin',
  description: 'Trang quản trị Long Nhãn Hưng Yên',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased bg-gray-50">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
