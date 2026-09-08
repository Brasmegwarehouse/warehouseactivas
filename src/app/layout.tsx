import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WarehouseOne',
  description: 'Controle de estoque para armazém geral'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
