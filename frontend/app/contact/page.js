import ContactClient from './contact-client';

export const metadata = {
  title: 'Contact Us | Inscovia',
  description: 'Get in touch with the Inscovia team.',
  alternates: { canonical: 'https://www.inscovia.com/contact' },
};

export default function ContactPage() {
  return <ContactClient />;
}