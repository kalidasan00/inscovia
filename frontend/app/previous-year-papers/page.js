// app/previous-year-papers/page.js
import PreviousYearPapersClient from "./previous-year-papers-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const metadata = {
  title: "Previous Year Question Papers - Free PDF Download | Inscovia",
  description:
    "Download free previous year question papers for JEE, NEET, UPSC, CAT, GATE and all top Indian competitive exams. Free PDF downloads with solutions.",
  alternates: {
    canonical: "https://www.inscovia.com/previous-year-papers",
  },
  openGraph: {
    title: "Previous Year Question Papers - Free PDF Download | Inscovia",
    description:
      "Download free previous year question papers for JEE, NEET, UPSC, CAT, GATE and all top Indian competitive exams.",
    type: "website",
    siteName: "Inscovia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Previous Year Question Papers - Free PDF Download | Inscovia",
    description:
      "Download free previous year question papers for all top Indian competitive exams.",
  },
};

async function getPapers() {
  try {
    const res = await fetch(`${API_URL}/papers`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.papers || [];
  } catch {
    return [];
  }
}

export default async function PreviousYearPapersPage() {
  const papers = await getPapers();

  // ✅ JSON-LD — ItemList of papers for Google
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Previous Year Question Papers",
    description: "Free previous year question papers for Indian competitive exams",
    url: "https://www.inscovia.com/previous-year-papers",
    numberOfItems: papers.length,
    itemListElement: papers.slice(0, 20).map((paper, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${paper.examName} ${paper.year}${paper.subject ? ` - ${paper.subject}` : ""}`,
      url: "https://www.inscovia.com/previous-year-papers",
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.inscovia.com" },
      { "@type": "ListItem", position: 2, name: "Previous Year Papers", item: "https://www.inscovia.com/previous-year-papers" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PreviousYearPapersClient />
    </>
  );
}