import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GtmScript } from '@/components/gtm-script';
import { FacebookPixelScript } from '@/components/facebook-pixel-script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maracujá Zero Pragas - Elimine o Trips de Vez',
  description: 'Descubra o Sistema de 4 Fases que elimina o trips e economiza até R$ 5.000 por hectare em defensivos.',
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        
        {/* Adiciona os componentes de script diretamente no final do body */}
        <GtmScript />
        <FacebookPixelScript />
      </body>
    </html>
  );
}