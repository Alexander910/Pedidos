import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@envios-ya/ui/src/index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ENVIOS-YA | Logística Express y Entregas Inteligentes en Guatemala',
  description: 'Conectamos pilotos express con hoteles, Airbnb, restaurantes y comercios. Entregas y GPS en tiempo real.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  );
}
