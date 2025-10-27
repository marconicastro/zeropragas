import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MetaPixelDefinitivo from '@/components/MetaPixelDefinitivo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Controle de Trips - Ebook Agronegócio',
  description: 'Sistema de 4 Fases que elimina o trips de vez e economiza até R$ 5.000 por hectare em defensivos ineficazes. Método validado pela EMBRAPA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <MetaPixelDefinitivo />
        {children}
      </body>
    </html>
  );
}
