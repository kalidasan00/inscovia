// components/LoginPromptModal.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, UserPlus, LogIn } from "lucide-react";

export default function LoginPromptModal() {
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const instituteLoggedIn = localStorage.getItem("instituteLoggedIn") === "true";
    const loggedIn = userLoggedIn || instituteLoggedIn;

    setIsLoggedIn(loggedIn);

    // Don't show modal if already logged in or on auth pages
    if (loggedIn || pathname?.includes('/user-menu') || pathname?.includes('/login') || pathname?.includes('/register')) {
      return;
    }

    // Check if modal was dismissed in this session
    const dismissed = sessionStorage.getItem("loginPromptDismissed");
    if (dismissed) return;

    // Show modal after 2 minutes (120000ms)
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setShowModal(false);
    // Remember dismissal for this session only
    sessionStorage.setItem("loginPromptDismissed", "true");
  };

  const handleLogin = () => {
    setShowModal(false);
    router.push("/user-menu");
  };

  const handleRegister = () => {
    setShowModal(false);
    router.push("/user-menu");
  };

  // Don't render if logged in or modal not shown
  if (isLoggedIn || !showModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 pointer-events-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join Inscovia Today! 🎓
            </h2>
            <p className="text-gray-600">
              Create a free account to save your favorite centers, compare courses, and write reviews to help others!
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Save & compare training centers</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Write & manage reviews</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Get personalized recommendations</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRegister}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Create Free Account
            </button>

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Already have an account? Sign In
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={handleClose}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}