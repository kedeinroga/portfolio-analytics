import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Providers } from './providers';
import { GA_TRACKING_ID } from '@/lib/gtag';
import AnalyticsTracker from '@/components/AnalyticsTracker'; // Importar el componente

export const metadata: Metadata = {
  title: "Kedein Rodriguez - Software Engineer",
  description: "Portfolio of Kedein Rodriguez Gatica, Software Engineer.",
  keywords: "Software Engineer, Backend Developer, Portfolio, Kedein Rodriguez Gatica, Full-Stack Developer, Web Developer",
  authors: [{ name: 'Kedein Rodriguez Gatica', url: 'https://kedein.com' }],
  openGraph: {
    title: "Kedein Rodriguez - Software Engineer",
    description: "Portfolio of Kedein Rodriguez Gatica, Software Engineer.",
    url: "https://kedein.com",
    images: [
      {
        url: "https://kedein.com/og-image.png",
        width: 800,
        height: 600,
        alt: "Kedein Rodriguez - Software Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {GA_TRACKING_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="font-body antialiased">
        <Providers>
          <AnalyticsTracker /> {/* Añadir el componente aquí */}
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
