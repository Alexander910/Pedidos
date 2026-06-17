import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pedidos Ya — Todo lo que querés, en minutos",
  description: "Restaurantes, supermercados, farmacias y tiendas favoritas — un solo carrito, una sola entrega. Rápido, confiable, sin vueltas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
