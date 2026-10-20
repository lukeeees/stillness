import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600'] 
});

export const metadata: Metadata = {
  title: 'Stillness',
  description: 'Breathe. Rest. Be.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0F2A4D] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}