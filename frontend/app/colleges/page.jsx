"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, GraduationCap } from "lucide-react";

const colleges = [
  {
    slug: "iit-madras",
    name: "Indian Institute of Technology (IIT) Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "Institute",
    ownership: "Government",
    tags: ["ENGINEERING", "RESEARCH"],
    mode: "OFFLINE",
    rating: 4.7,
    description: "Premier engineering and technology institute, known for research and innovation.",
  },
  {
    slug: "nit-calicut",
    name: "National Institute of Technology (NIT) Calicut",
    city: "Kozhikode",
    state: "Kerala",
    type: "Institute",
    ownership: "Government",
    tags: ["ENGINEERING", "TECHNOLOGY"],
    mode: "OFFLINE",
    rating: 4.4,
    description: "Top-ranked NIT offering undergraduate and postgraduate engineering programs.",
  },
  {
    slug: "cusat",
    name: "Cochin University of Science and Technology (CUSAT)",
    city: "Kochi",
    state: "Kerala",
    type: "University",
    ownership: "Government",
    tags: ["SCIENCE", "LAW"],
    mode: "OFFLINE",
    rating: 4.1,
    description: "State university known for science, engineering, and law programs.",
  },
  {
    slug: "st-aloysius",
    name: "St. Aloysius College (Deemed to be University)",
    city: "Mangaluru",
    state: "Karnataka",
    type: "University",
    ownership: "Private",
    tags: ["DATA SCIENCE", "MANAGEMENT"],
    mode: "OFFLINE",
    rating: 4.3,
    description: "Reputed institution offering undergraduate and postgraduate programs including Data Science.",
  },
  {
    slug: "iim-kozhikode",
    name: "Indian Institute of Management (IIM) Kozhikode",
    city: "Kozhikode",
    state: "Kerala",
    type: "Institute",
    ownership: "Government",
    tags: ["MANAGEMENT", "MBA"],
    mode: "OFFLINE",
    rating: 4.6,
    description: "Leading management institute offering MBA and executive education programs.",
  },
  {
    slug: "cet-trivandrum",
    name: "College of Engineering Trivandrum (CET)",
    city: "Thiruvananthapuram",
    state: "Kerala",
    type: "College",
    ownership: "Government",
    tags: ["ENGINEERING", "SKILL DEVELOPMENT"],
    mode: "OFFLINE",
    rating: 4.0,
    description: "One of Kerala's oldest and most respected engineering colleges.",
  },
];

function CollegeCard({ college }) {
  return (
    <Link
      href={`/colleges/${college.slug}`}
      className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      <div className="relative h-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="absolute -bottom-6 left-3">
          <div className="w-14 h-14 bg-white rounded-lg shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
            <GraduationCap className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
      </div>

      <div className="pt-8 px-3 pb-3 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {college.name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{college.city}, {college.state}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-700">
            {college.tags[0]}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-green-100 text-green-700">
            {college.mode}
          </span>
          {college.rating > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
              ★ {college.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">{college.description}</p>
      </div>
    </Link>
  );
}

export default function CollegesPage() {
  const [query, setQuery] = useState("");

  const filtered = colleges.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-20 md:pb-8">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Colleges</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Explore top colleges and universities across India.
        </p>

        <div className="relative mt-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search colleges by name, city, or course..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
        {filtered.length} {filtered.length === 1 ? "college" : "colleges"} found
        {query && ` for "${query}"`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border">
          <p className="text-gray-700 font-medium mb-1">No colleges found</p>
          <p className="text-sm text-gray-500 mb-3">Try a different search term</p>
          <button onClick={() => setQuery("")} className="text-accent hover:text-accent/80 font-medium text-sm">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 items-stretch">
          {filtered.map((college) => (
            <CollegeCard key={college.slug} college={college} />
          ))}
        </div>
      )}
    </main>
  );
}