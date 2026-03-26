// components/LoginPromptModal.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, UserPlus, LogIn, BookOpen, Star, Heart } from "lucide-react";

const SESSION_KEY = "loginPromptDismissed";
const PAGE_COUNT_KEY = "centerPagesViewed";

export default function LoginPromptModal() {
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const timerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check login
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const instituteLoggedIn = localStorage.getItem("instituteLoggedIn") === "true";
    const loggedIn = userLoggedIn || instituteLoggedIn;
    setIsLoggedIn(loggedIn);

    // Don't show if logged in or on auth pages
    if (
      loggedIn ||
      pathname?.includes("/user-menu") ||
      pathname?.includes("/login") ||
      pathname?.includes("/register") ||
      pathname?.includes("/admin")
    ) return;

    // Don't show if already dismissed this session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // ── Trigger 1: count center detail page views ──
    if (pathname?.startsWith("/centers/")) {
      const count = parseInt(sessionStorage.getItem(PAGE_COUNT_KEY) || "0") + 1;
      sessionStorage.setItem(PAGE_COUNT_KEY, String(count));
      if (count >= 2) {
        // Slight delay so page loads first
        const t = setTimeout(() => setShowModal(true), 800);
        return () => clearTimeout(t);
      }
    }

    // ── Trigger 2: 3 minutes on site ──
    timerRef.current = setTimeout(() => {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        setShowModal(true);
      }
    }, 3 * 60 * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  const handleClose = () => {
    setShowModal(false);
    sessionStorage.setItem(SESSION_KEY, "true");
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleGoToMenu = () => {
    setShowModal(false);
    sessionStorage.setItem(SESSION_KEY, "true");
    router.push("/user-menu");
  };

  if (isLoggedIn || !showModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 pointer-events-auto"
          style={{ animation: "slideUp 0.3s ease-out" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-900 mb-1.5">
              Join Inscovia Free
            </h2>
            <p className="text-sm text-gray-500">
              Save centers, compare courses, and get personalized recommendations.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5 space-y-2.5">
            {[
              { icon: Heart,    text: "Save & shortlist your favourite centers" },
              { icon: BookOpen, text: "Compare courses side by side" },
              { icon: Star,     text: "Write reviews and help others" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-gray-700">{text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoToMenu}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create Free Account
            </button>
            <button
              onClick={handleGoToMenu}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Already have an account? Sign In
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={handleClose}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}