// app/layout.tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import StyledComponentsRegistry from '@/lib/registry';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const peyda = localFont({
  src: [
    {
      path: './fonts/Peyda-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Peyda-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Peyda-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Peyda-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    
  ],
  variable: '--font-peyda',
});

export const metadata: Metadata = {
  title: 'MovieSync',
  description: 'تماشای فیلم با دوستان',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={peyda.variable}>
        <StyledComponentsRegistry>
          <ThemeProvider>
          {children}
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
