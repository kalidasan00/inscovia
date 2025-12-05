// components/Footer.jsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="text-base font-semibold">Inscovia</div>
            <div>Find training centers across India.</div>
          </div>

          <div className="flex gap-6">
            <div>
              <div className="font-medium">Company</div>
              <Link href="/about" className="block mt-2">About</Link>
              <Link href="/contact" className="block mt-1">Contact</Link>
            </div>

            <div>
              <div className="font-medium">Resources</div>
              <a className="block mt-2">Blog</a>
              <a className="block mt-1">Privacy</a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          © {new Date().getFullYear()} Inscovia — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
