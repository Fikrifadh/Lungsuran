import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lungsuran - Katalog Jual Beli Badr",
  description: "Etalase digital resmi dari Badr Interactive. Dapatkan barang berkualitas dengan harga transparan dan beli langsung via WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans antialiased text-slate-900 bg-white`}>
        {children}
      </body>
    </html>
  );
}
