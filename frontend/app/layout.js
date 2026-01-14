// app/layout.js
import "./globals.css";
import BottomNav from "../components/BottomNav";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { CompareProvider } from "../contexts/CompareContext";

// 🎯 PRODUCTION-LEVEL SEO CONFIGURATION
export const metadata = {
  metadataBase: new URL('https://www.inscovia.com'),

  title: {
    default: 'Inscovia - Find Best Training Centers & Coaching Institutes in India',
    template: '%s | Inscovia'
  },

  description: 'Discover and compare top-rated training centers and coaching institutes across India. Technology, Management, Skill Development, and Exam Preparation courses.',

  keywords: [
    'training centers India',
    'coaching institutes',
    'skill development courses',
    'technology training',
    'management courses',
    'exam preparation',
    'IT coaching',
    'professional training'
  ],

  authors: [{ name: 'Inscovia' }],
  creator: 'Inscovia',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.inscovia.com',
    siteName: 'Inscovia',
    title: 'Inscovia - Find Best Training Centers in India',
    description: 'Compare 1000+ verified training centers across India',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Inscovia',
    }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Inscovia - Find Best Training Centers in India',
    description: 'Discover and compare training centers across India',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <FavoritesProvider>
          <CompareProvider>
            {children}
            <BottomNav />
          </CompareProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}