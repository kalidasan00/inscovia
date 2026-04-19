// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { CompareProvider } from "../contexts/CompareContext";
import RootLayoutInner from "../components/RootLayoutInner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata = {
  metadataBase: new URL("https://www.inscovia.com"),

  title: {
    default: "Inscovia - Find Best Training Centers & Coaching Institutes in India",
    template: "%s | Inscovia",
  },

  description:
    "Discover and compare top-rated training centers and coaching institutes across India. Technology, Management, Skill Development, and Exam Preparation courses.",

  authors: [{ name: "Inscovia" }],
  creator: "Inscovia",

  // ✅ REMOVED canonical from layout — each page sets its own
  // Having homepage canonical here was telling Google every page = duplicate of homepage

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.inscovia.com",
    siteName: "Inscovia",
    title: "Inscovia - Find Best Training Centers in India",
    description: "Discover and compare top-rated training centers across India",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inscovia",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Inscovia - Find Best Training Centers in India",
    description: "Discover and compare training centers across India",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        {/* ✅ Preconnect to Cloudinary — saves 200-400ms on first image */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* ✅ GA4 via App Router — _document.js is Pages Router only and was being ignored */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-0KHJ3KVE37"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0KHJ3KVE37', { page_path: window.location.pathname });
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        {/* ✅ Providers scoped only where needed — move these down to only the
            pages/layouts that actually use favorites or compare if possible.
            For now kept here but memoize your context values in the provider files. */}
        <FavoritesProvider>
          <CompareProvider>
            <RootLayoutInner>{children}</RootLayoutInner>
          </CompareProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}