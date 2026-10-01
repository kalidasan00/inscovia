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
    default: "Find Training Institutes & Colleges in India | Inscovia",
    template: "%s | Inscovia",
  },

  description:
    "Compare top training institutes and colleges across India. Browse IT courses, exam coaching, engineering and MBA, check fees and enquire free.",

  authors: [{ name: "Inscovia" }],
  creator: "Inscovia",

  // Canonical is NOT set here. Each page sets its own via alternates.canonical.

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
    siteName: "Inscovia",
    title: "Find Training Institutes & Colleges in India | Inscovia",
    description:
      "Compare top training institutes and colleges across India. IT courses, exam coaching, engineering and MBA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inscovia - Training Institutes & Colleges in India",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Find Training Institutes & Colleges in India | Inscovia",
    description: "Compare top training institutes and colleges across India.",
    images: ["/og-image.png"],
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
        <link rel="preconnect" href="https://res.cloudinary.com" />
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
        {/* Site-wide structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Inscovia",
              url: "https://www.inscovia.com/",
            }),
          }}
        />

        <FavoritesProvider>
          <CompareProvider>
            <RootLayoutInner>{children}</RootLayoutInner>
          </CompareProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}