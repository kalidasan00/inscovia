// app/contact/page.js
"use client";

export const metadata = {
  title: 'Contact Us | Inscovia',
  description: 'Get in touch with the Inscovia team.',
  alternates: { canonical: 'https://www.inscovia.com/contact' },
};

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-6">Get in touch with the Inscovia team.</p>
      <a href="mailto:support@inscovia.com"
        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        support@inscovia.com
      </a>
    </main>
  );
}