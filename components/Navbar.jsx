// components/Navbar.jsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center text-white font-bold">IS</div>
            <div className="text-lg font-semibold">Inscovia</div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/centers" className="hover:text-accent">Centers</Link>
            <Link href="/about" className="hover:text-accent">About</Link>
            <Link href="/contact" className="hover:text-accent">Contact</Link>

            {/* NEW: Dashboard Link */}
            <Link href="/institute/dashboard" className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50">
              Dashboard
            </Link>

            {/* Login */}
            <Link href="/auth/login" className="px-3 py-2 border rounded-md text-sm">Login</Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Open menu"
              className="p-2 rounded-md border"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link href="/centers" onClick={() => setOpen(false)}>Centers</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>

            {/* NEW: Dashboard Link */}
            <Link
              href="/institute/dashboard"
              onClick={() => setOpen(false)}
              className="px-3 py-2 border rounded-md w-max"
            >
              Dashboard
            </Link>

            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2 border rounded-md w-max"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
