"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star, MapPin, Users, Globe, Phone, Mail, ExternalLink,
  CheckCircle, TrendingUp, Award, Clock, ChevronLeft, Building2
} from "lucide-react";
import consultants from "../../../data/studyAbroadData.json";

export default function ConsultantDetailPage({ params }) {
  const consultant = consultants.find((c) => c.slug === params.slug);
  if (!consultant) notFound();

  const countryFlags = {
    USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦", Australia: "🇦🇺",
    Germany: "🇩🇪", Ireland: "🇮🇪", "New Zealand": "🇳🇿",
    Singapore: "🇸🇬", France: "🇫🇷", Malaysia: "🇲🇾",
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link href="/study-abroad" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Study Abroad
          </Link>
        </div>
      </div>

      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={consultant.image} alt={consultant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 pb-6">
          <div className="flex items-end justify-between">
            <div>
              {consultant.featured && (
                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md mb-2">
                  ⭐ Featured Consultant
                </span>
              )}
              <h1 className="text-3xl font-bold text-white">{consultant.name}</h1>
              <p className="text-white/80 text-sm mt-1">{consultant.tagline}</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/95 px-4 py-3 rounded-xl">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold text-gray-800">{consultant.rating}</span>
                </div>
                <p className="text-xs text-gray-400">{consultant.reviews.toLocaleString()} reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Students Placed", value: (consultant.studentsPlaced / 1000).toFixed(0) + "K+", icon: <Users className="w-4 h-4 text-blue-500" /> },
                { label: "Success Rate", value: consultant.successRate + "%", icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
                { label: "Branches", value: consultant.branches + "+", icon: <Building2 className="w-4 h-4 text-purple-500" /> },
                { label: "Est.", value: consultant.established, icon: <Clock className="w-4 h-4 text-orange-500" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{consultant.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {consultant.highlights.map((h) => (
                  <span key={h} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
                    <CheckCircle className="w-3 h-3" />{h}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Services Offered</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {consultant.services.map((service) => (
                  <div key={service} className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Countries Covered</h2>
              <div className="flex flex-wrap gap-3">
                {consultant.countriesHandled.map((country) => (
                  <div key={country} className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                    <span className="text-xl">{countryFlags[country] || "🌍"}</span>
                    <span className="text-sm font-medium text-gray-700">{country}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Top Universities Placed In</h2>
              <div className="space-y-2">
                {consultant.topUniversities.map((uni, i) => (
                  <div key={uni} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-gray-50">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700 font-medium">{uni}</span>
                    <Award className="w-4 h-4 text-yellow-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-20">
              <h3 className="text-base font-bold text-gray-900 mb-1">Get Free Counselling</h3>
              <p className="text-xs text-gray-500 mb-5">Talk to an expert from {consultant.name}</p>
              <div className="space-y-3 mb-5">
                <a href={`tel:${consultant.phone}`} className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Phone className="w-4 h-4" />{consultant.phone}
                </a>
                <a href={`mailto:${consultant.email}`} className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Mail className="w-4 h-4" />{consultant.email}
                </a>
                <a href={consultant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:border-blue-300 transition-colors">
                  <Globe className="w-4 h-4" />Visit Website<ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">{consultant.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <p className="text-xs text-gray-600">
                    <span className="font-bold text-gray-800">{consultant.rating}</span> / 5 &nbsp;·&nbsp; {consultant.reviews.toLocaleString()} reviews
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Average Scholarship</p>
                <p className="text-xl font-bold text-green-600 mt-0.5">{consultant.avgScholarship}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}