import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AdvancedTracking from "@/components/AdvancedTracking";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maracujá Zero Pragas - Sistema de Controle de Trips",
  description: "Elimine o trips de vez e economize até R$ 5.000 por hectare com o método validado pela EMBRAPA.",
  keywords: ["trips", "controle de trips", "maracujá", "pragas", "defensivos", "EMBRAPA"],
  authors: [{ name: "Maracujá Zero Pragas" }],
  openGraph: {
    title: "Maracujá Zero Pragas - Sistema de Controle de Trips",
    description: "Elimine o trips de vez e economize até R$ 5.000 por hectare com o método validado pela EMBRAPA.",
    url: "https://www.maracujazeropragas.com",
    siteName: "Maracujá Zero Pragas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maracujá Zero Pragas - Sistema de Controle de Trips",
    description: "Elimine o trips de vez e economize até R$ 5.000 por hectare com o método validado pela EMBRAPA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance optimizations - Preconnects críticos */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//www.facebook.com" />
        <link rel="dns-prefetch" href="//ipapi.co" />
        
        {/* Prefetch de recursos críticos */}
        <link rel="prefetch" href="/ebook-logo.webp" />
        <link rel="prefetch" href="/frutos-manchados.jpg" />
        <link rel="prefetch" href="/travamento-ponteiras.jpg" />
        <link rel="prefetch" href="/viroses-plantas.jpg" />
        
        {/* Google Tag Manager - Otimizado */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-567XZCDX');
            `,
          }}
        />
        
        {/* Google Analytics 4 - Configuração Global */}
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CZ0XMXL3RX', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: false // PageView será gerenciado pelo AdvancedTracking
              });
              console.log('✅ Google Analytics 4 configurado com ID: G-CZ0XMXL3RX');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-567XZCDX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        <AdvancedTracking />
        {children}
        <Toaster />
      </body>
    </html>
  );
}