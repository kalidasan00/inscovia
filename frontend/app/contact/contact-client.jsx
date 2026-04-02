// app/contact/metadata.js  ← new file
export const metadata = {
  title: 'Contact Us | Inscovia',
  description: 'Get in touch with the Inscovia team. We are here to help you find the right training center or answer any questions about our platform.',
  alternates: {
    canonical: 'https://www.inscovia.com/contact',
  },
  openGraph: {
    title: 'Contact Us | Inscovia',
    description: 'Get in touch with the Inscovia team.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Contact Inscovia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Inscovia',
    description: 'Get in touch with the Inscovia team.',
    images: ['/og-image.png'],
  },
};