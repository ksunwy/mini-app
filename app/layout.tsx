import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Оформление отправлений',
  description: 'Многошаговая форма и история заявок',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} font-[family-name:var(--font-manrope)]`}>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
