import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@envios-ya/ui/src/index.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Console | ENVIOS-YA Core',
  description: 'Sistema ERP, Logística y Finanzas - ENVIOS-YA',
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
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
