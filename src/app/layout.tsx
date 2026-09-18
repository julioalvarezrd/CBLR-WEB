import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CBLR-WEB",
  description:
    "Plataforma web institucional del Cuerpo de Bomberos de La Romana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
