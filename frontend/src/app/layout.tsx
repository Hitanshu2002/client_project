import './globals.css';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'House of Ramyaa | Authentic Women\'s Rajasthani Clothing',
  description: 'Shop luxury Bandhani suit sets, hand-dyed Leheriya sarees, Gota Patti occasionwear, Bagru block prints & Kota Doria textiles direct from Jaipuri artisans.',
  keywords: ['Rajasthani Clothing', 'Bandhani Suit', 'Leheriya Saree', 'Gota Patti Kurti', 'Jaipuri Textiles', 'House of Ramyaa'],
  icons: {
    icon: '/images/logo/Color Logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="flex min-h-screen flex-col font-sans bg-white text-ramyaa-charcoal antialiased">
        <AuthProvider>
          <CartProvider>
            <LoadingScreen />
            <Header />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
