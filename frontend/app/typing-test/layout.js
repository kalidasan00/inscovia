export const metadata = {
  title: "Free Typing Speed Test — Check Your WPM & Accuracy",
  description:
    "Test your typing speed for free. Choose Easy, Medium, or Hard difficulty and a 15s, 30s, or 60s test to check your WPM and accuracy, then compete on the leaderboard.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Inscovia",
    url: "https://www.inscovia.com/typing-test",
    title: "Free Typing Speed Test — Inscovia",
    description:
      "How fast can you type? Take a free typing speed test and see your WPM and accuracy instantly.",
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
    title: "Free Typing Speed Test — Inscovia",
    description: "Test your typing speed for free and compete on the leaderboard.",
  },
  alternates: {
    canonical: "/typing-test",
  },
};

export default function TypingTestLayout({ children }) {
  return children;
}