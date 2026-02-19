"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Users, Globe, ChevronRight, Filter, X, TrendingUp, ChevronDown } from "lucide-react";
import consultants from "../../data/studyAbroadData.json";

const studyAbroadConsultants = consultants;
const allCountries = [...new Set(consultants.flatMap((c) => c.countriesHandled))];
const allCities = [...new Set(consultants.map((c) => c.city))];

export default function StudyAbroadPage() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = studyAbroadConsultants.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline.toLowerCase().includes(search.toLowerCase()) ||
      c.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchCountry = selectedCountry === "All" || c.countriesHandled.includes(selectedCountry);
    const matchCity = selectedCity === "All" || c.city === selectedCity;
    return matchSearch && matchCountry && matchCity;
  });

  const activeFilters = (selectedCountry !== "All" ? 1 : 0) + (selectedCity !== "All" ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Study Abroad Consultants</h1>
          <p className="text-gray-500 text-sm mb-4">Visa, SOP, scholarships & more — trusted consultants in India</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search consultant or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{filtered.length}</span> consultants
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Country</p>
              <div className="flex flex-wrap gap-1.5">
                {["All", ...allCountries].map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedCountry === country
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">City</p>
              <div className="flex flex-wrap gap-1.5">
                {["All", ...allCities].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedCity === city
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={() => { setSelectedCountry("All"); setSelectedCity("All"); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No consultants found. Try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((consultant) => (
              <Link
                key={consultant.slug}
                href={`/study-abroad/${consultant.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={consultant.image}
                    alt={consultant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {consultant.featured && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md">
                      ⭐ Featured
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-white font-bold text-base leading-tight">{consultant.name}</p>
                      <p className="text-white/80 text-xs">{consultant.city}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-800">{consultant.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {(consultant.studentsPlaced / 1000).toFixed(0)}K+ placed
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-600 font-medium">{consultant.successRate}% success</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {consultant.countriesHandled.slice(0, 4).map((country) => (
                      <span key={country} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                        {country}
                      </span>
                    ))}
                    {consultant.countriesHandled.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">
                        +{consultant.countriesHandled.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-sm font-bold text-green-600">{consultant.avgScholarship} avg</p>
                    <span className="flex items-center gap-1 text-blue-600 text-xs font-medium group-hover:gap-2 transition-all">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}