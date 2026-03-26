// app/privacy/page.js
import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-gray-50 min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-white/90">Inscovia's commitment to your privacy</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10 text-center">

          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Our Privacy Policy is Being Finalized
          </h2>

          <p className="text-gray-600 leading-relaxed mb-6">
            We are currently working on a comprehensive privacy policy for Inscovia.
            We are fully committed to protecting your personal data and handling it
            with the highest standards of care and transparency.
          </p>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6 text-left space-y-3">
            <p className="text-sm font-semibold text-indigo-800 mb-2">What we promise in the meantime:</p>
            <div className="flex items-start gap-2 text-sm text-indigo-700">
              <span className="mt-0.5">✅</span>
              <span>We never sell your personal data to third parties</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-indigo-700">
              <span className="mt-0.5">✅</span>
              <span>We only collect data necessary to provide our services</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-indigo-700">
              <span className="mt-0.5">✅</span>
              <span>Your data is stored securely and never shared without your consent</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-indigo-700">
              <span className="mt-0.5">✅</span>
              <span>You can request deletion of your account and data at any time</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            For any privacy concerns or data-related requests, please reach out to us at{" "}
            <a href="mailto:support@inscovia.com"
              className="text-indigo-600 font-medium hover:underline">
              support@inscovia.com
            </a>
          </p>

          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            ← Back to Home
          </Link>

        </div>
      </div>
    </main>
  );
}