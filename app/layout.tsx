import type { Metadata } from 'next';
import { Barlow_Condensed, Manrope } from 'next/font/google';
import './globals.css';
import './contrast.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-barlow', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://geralveiculos.vercel.app'),
  title: 'Geral Veículos | Veículos em Ubá - MG',
  description: 'Conheça os veículos disponíveis na Geral Veículos em Ubá - MG. Consulte nosso estoque e fale diretamente com nossa equipe.',
  openGraph: { title: 'Geral Veículos | Veículos em Ubá - MG', description: 'Consulte nosso estoque e fale diretamente com nossa equipe.', images: ['/assets/fotoloja.png'] },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body className={`${manrope.variable} ${barlow.variable}`}>{children}</body></html>;
}
