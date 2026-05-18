import type { Metadata } from "next";
import { Quicksand, Dancing_Script } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const title = 'Baby Shower · Olivia';
const description = 'Te invitamos a celebrar la llegada de nuestra dulzura.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: title,
    type: 'website',
    locale: 'es_DO',
    images: [
      {
        url: '/images/bunny-flowers.png',
        width: 800,
        height: 800,
        alt: 'Baby Shower Olivia',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/bunny-flowers.png'],
  },
  icons: {
    icon: '/images/bunny-flowers.png',
    apple: '/images/bunny-flowers.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${quicksand.variable} ${dancingScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
