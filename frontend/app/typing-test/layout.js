export const metadata = {
  title: "Free Typing Test – Check Your WPM & Accuracy",
  description:
    "Take a free online typing test to check your WPM and accuracy. Choose 15, 30 or 60 seconds and Easy, Medium or Hard, then compete on the leaderboard.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Inscovia",
    url: "https://www.inscovia.com/typing-test",
    title: "Free Typing Test – Check Your WPM & Accuracy | Inscovia",
    description:
      "How fast can you type? Take a free online typing test and see your WPM and accuracy instantly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inscovia Free Typing Test",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Typing Test – Check Your WPM & Accuracy | Inscovia",
    description: "Take a free online typing test and compete on the leaderboard.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/typing-test",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Inscovia Typing Test",
  url: "https://www.inscovia.com/typing-test",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  description:
    "Free online typing test to measure typing speed (WPM) and accuracy.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

export default function TypingTestLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}