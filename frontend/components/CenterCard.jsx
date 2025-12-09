// components/CenterCard.jsx
import Link from "next/link";

export default function CenterCard({ center }) {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Banner Image */}
      <div className="relative h-32 w-full bg-gradient-to-br from-gray-100 to-gray-50">
        <img
          src={center.image}
          alt={center.name}
          className="object-cover h-full w-full"
        />

        {/* Logo Badge - Bottom Left */}
        <div className="absolute -bottom-5 left-3">
          <div className="w-12 h-12 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
            <img
              src={center.logo || center.image}
              alt={`${center.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Rating Badge - Top Right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-white px-2 py-1 rounded-md shadow-sm">
          {center.rating}
          <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="pt-7 px-3 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">{center.name}</h3>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {center.location}
            </span>
            <span>•</span>
            <span>{center.type}</span>
          </div>
        </div>

        {/* Courses */}
        <div className="mt-2 flex flex-wrap gap-1">
          {center.courses.slice(0, 2).map((course, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
            >
              {course}
            </span>
          ))}
          {center.courses.length > 2 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              +{center.courses.length - 2}
            </span>
          )}
        </div>

        {/* View Button */}
        <Link
          href={`/centers/${center.id}`}
          className="mt-3 block w-full text-center text-xs font-medium px-3 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}