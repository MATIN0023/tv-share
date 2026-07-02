// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import StyledComponentsRegistry from '@/lib/registry';
import { QueryProvider } from "@/providers/query-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { ToastContainer } from "@/components/ui/toast-container";
import { PwaProvider } from "@/components/pwa/pwa-provider";

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
  title: "MovieSync",
  description: "تماشای فیلم با دوستان",
  applicationName: "MovieSync",
  icons: {
    icon: [
      { url: "/icons/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MovieSync",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
            <I18nProvider>
              <QueryProvider>
                <PwaProvider>
                  {children}
                  <ToastContainer />
                </PwaProvider>
              </QueryProvider>
            </I18nProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
