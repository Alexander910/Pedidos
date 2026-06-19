import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@envios-ya/ui/src/index.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pilotos | ENVIOS-YA',
  description: 'Aplicación de Ruta para Pilotos - ENVIOS-YA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pilotos Ya',
  },
};

export const viewport: Viewport = {
  themeColor: '#E85D1B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground select-none">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
