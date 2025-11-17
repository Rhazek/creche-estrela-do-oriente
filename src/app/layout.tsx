import './globals.css';
import { Inter } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Creche-Escola - Sistema de Gestão de Matrículas',
  description: 'Sistema completo de gestão de matrículas para creche-escola pública com foco em acessibilidade e usabilidade',
  keywords: 'creche, escola, matrícula, educação, gestão, acessibilidade',
  authors: [{ name: 'Creche-Escola' }],
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}