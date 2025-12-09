// app/contact/page.js
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Contact</h1>
        <p className="mt-2 text-gray-600">For partnerships or support, email: <strong>hello@inscovia.example</strong></p>

        <form className="mt-6 bg-white p-4 rounded-md shadow-sm space-y-3">
          <input placeholder="Your name" className="w-full px-3 py-2 border rounded-md" />
          <input placeholder="Email" className="w-full px-3 py-2 border rounded-md" />
          <textarea placeholder="Message" rows="5" className="w-full px-3 py-2 border rounded-md" />
          <button className="px-4 py-2 bg-accent text-white rounded-md">Send</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
