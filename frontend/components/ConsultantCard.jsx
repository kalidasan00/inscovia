// components/ConsultantCard.jsx
"use client";
import Link from "next/link";

export default function ConsultantCard({ center }) {
  return (
    <Link href={`/centers/${center.slug}`}>
      <article className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-4 flex gap-4 items-start">

        {/* Logo */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
          {center.logo ? (
            <img src={center.logo} alt={center.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">{center.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {center.city}, {center.state}
              </p>
            </div>
            {center.rating > 0 && (
              <div className="flex items-center gap-0.5 text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md flex-shrink-0">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                {center.rating}
              </div>
            )}
          </div>

          {/* Stats row */}
          {(center.studentsPlaced || center.successRate) && (
            <div className="flex gap-3 mt-2">
              {center.studentsPlaced && (
                <div className="text-xs">
                  <span className="font-bold text-blue-700">{center.studentsPlaced.toLocaleString()}+</span>
                  <span className="text-gray-400 ml-1">placed</span>
                </div>
              )}
              {center.successRate && (
                <div className="text-xs">
                  <span className="font-bold text-green-700">{center.successRate}</span>
                  <span className="text-gray-400 ml-1">success</span>
                </div>
              )}
              {center.avgScholarship && (
                <div className="text-xs">
                  <span className="font-bold text-purple-700">{center.avgScholarship}</span>
                  <span className="text-gray-400 ml-1">avg scholarship</span>
                </div>
              )}
            </div>
          )}

          {/* Countries */}
          {center.countries?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {center.countries.slice(0, 5).map((country, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                  {country}
                </span>
              ))}
              {center.countries.length > 5 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                  +{center.countries.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Services preview */}
          {center.services?.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1.5 truncate">
              {center.services.slice(0, 3).join(" · ")}
              {center.services.length > 3 && ` · +${center.services.length - 3} more`}
            </p>
          )}

          <div className="mt-2.5">
            <span className="text-[10px] sm:text-xs font-medium px-3 py-1.5 bg-accent text-white rounded-lg">
              View Profile →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}