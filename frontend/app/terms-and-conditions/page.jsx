import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-gray-50 min-h-screen pb-20 md:pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-lg text-white/90">
              Last updated: January 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6">

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Inscovia's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Services</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Use the service in any way that violates any applicable law or regulation</li>
                <li>Impersonate or attempt to impersonate Inscovia or any other person or entity</li>
                <li>Engage in any conduct that restricts or inhibits anyone's use of the service</li>
                <li>Use any automated system to access the service without our permission</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed">
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account. You must notify us immediately of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Training Center Listings</h2>
              <p className="text-gray-700 leading-relaxed">
                Inscovia acts as a platform to connect users with training centers. We do not directly provide training services. While we strive to ensure the accuracy of information listed on our platform, we cannot guarantee the quality of services provided by training centers. Users are advised to conduct their own research before enrolling in any course.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Reviews and Ratings</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Users may post reviews and ratings for training centers. By posting a review, you agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Your review is based on your genuine experience</li>
                <li>You will not post false, misleading, or defamatory content</li>
                <li>You grant us a non-exclusive license to use, reproduce, and publish your review</li>
                <li>We reserve the right to remove any review that violates our guidelines</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The service and its original content, features, and functionality are owned by Inscovia and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the operation of our service or the information, content, or materials included on our website. To the fullest extent permissible by applicable law, we disclaim all warranties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Inscovia shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of our services. Our total liability shall not exceed the amount you paid us, if any, for accessing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service may contain links to third-party websites or services that are not owned or controlled by Inscovia. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@inscovia.com<br />
                  <strong>Phone:</strong> +91 123 456 7890<br />
                  <strong>Address:</strong> 123, MG Road, Bangalore, Karnataka, India - 560001
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}