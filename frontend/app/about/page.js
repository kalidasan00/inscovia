import { GraduationCap, Target, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-gray-50 min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">About Inscovia</h1>
          <p className="text-lg sm:text-xl text-white/90">
            India's Premier Training Center Discovery Platform
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Our Story */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Inscovia was founded by <strong>Kalidasan V V</strong> with a frustration many students know —
            spending hours searching for the right coaching center, only to find outdated information or
            unreliable reviews. We built Inscovia to fix that: a single platform where students across
            India can find, compare, and review verified training centers with confidence.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our platform brings together a growing network of verified training centers, offering
            comprehensive information about courses, facilities, and authentic reviews to help you
            make informed decisions about your educational journey.
          </p>
        </section>

        {/* Mission & Values */}
        <section className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              To empower learners by providing transparent, comprehensive information about training
              centers — enabling every student to make the right educational choice for their future,
              regardless of where they are in India.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              To become India's most trusted platform for training center discovery — helping every
              student find the right institute, in their city, for their goal.
            </p>
          </div>
        </section>

        {/* What We Offer */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: GraduationCap,
                title: "Verified Centers",
                desc: "Every training center on Inscovia is verified and kept up to date so you always get accurate information."
              },
              {
                icon: Users,
                title: "Authentic Reviews",
                desc: "Real reviews from real students — helping you choose with confidence based on genuine experiences."
              },
              {
                icon: Target,
                title: "Smart Search",
                desc: "Powerful filters by category, location, teaching mode, rating, and price — find exactly what you need, fast."
              },
              {
                icon: Award,
                title: "Course Comparison",
                desc: "Compare multiple centers side by side and make a smarter decision before you enroll."
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}