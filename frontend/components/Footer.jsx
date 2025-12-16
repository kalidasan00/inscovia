import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  GraduationCap
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Inscovia</span>
            </div>
            <p className="text-sm mb-4">
              India's premier platform for discovering and comparing top IT & Non-IT training centers. Find your perfect course today.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/centers" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  Browse Centers
                </Link>
              </li>
              <li>
                <Link href="/centers?type=IT" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  IT Training
                </Link>
              </li>
              <li>
                <Link href="/centers?type=Non-IT" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  Non-IT Training
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Courses</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/centers?q=Python" className="hover:text-blue-400 transition-colors">
                  Python Programming
                </Link>
              </li>
              <li>
                <Link href="/centers?q=Data%20Science" className="hover:text-blue-400 transition-colors">
                  Data Science
                </Link>
              </li>
              <li>
                <Link href="/centers?q=Web%20Development" className="hover:text-blue-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/centers?q=Digital%20Marketing" className="hover:text-blue-400 transition-colors">
                  Digital Marketing
                </Link>
              </li>
              <li>
                <Link href="/centers?q=UI%20UX%20Design" className="hover:text-blue-400 transition-colors">
                  UI/UX Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                <span>
                  123, MG Road, Bangalore<br />
                  Karnataka, India - 560001
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <a href="mailto:info@inscovia.com" className="hover:text-blue-400 transition-colors">
                  info@inscovia.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <a href="tel:+911234567890" className="hover:text-blue-400 transition-colors">
                  +91 123 456 7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              © {currentYear} Inscovia. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}