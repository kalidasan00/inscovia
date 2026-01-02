// components/SmartSearch.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, BookOpen, Building2 } from "lucide-react";

export default function SmartSearch({ centers = [], placeholder = "Search institutes, courses, locations..." }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState({
    institutes: [],
    courses: [],
    locations: []
  });
  const router = useRouter();
  const wrapperRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ institutes: [], courses: [], locations: [] });
      setIsOpen(false);
      return;
    }

    const searchTerm = query.toLowerCase().trim();

    // Search institutes
    const matchingInstitutes = centers
      .filter(c => c.name.toLowerCase().includes(searchTerm))
      .slice(0, 3)
      .map(c => ({
        type: 'institute',
        name: c.name,
        location: `${c.city}, ${c.state}`,
        id: c.id
      }));

    // Search courses (extract unique courses)
    const allCourses = new Set();
    centers.forEach(c => {
      c.courses?.forEach(course => {
        // Remove category prefix if exists
        const courseName = course.includes(':')
          ? course.split(':')[1].trim()
          : course;
        if (courseName.toLowerCase().includes(searchTerm)) {
          allCourses.add(courseName);
        }
      });
    });
    const matchingCourses = Array.from(allCourses).slice(0, 4);

    // Search locations (cities)
    const allLocations = new Set();
    centers.forEach(c => {
      const cityState = `${c.city}, ${c.state}`;
      if (cityState.toLowerCase().includes(searchTerm)) {
        allLocations.add(cityState);
      }
      if (c.location?.toLowerCase().includes(searchTerm)) {
        allLocations.add(`${c.location}, ${c.city}`);
      }
    });
    const matchingLocations = Array.from(allLocations).slice(0, 3);

    setSuggestions({
      institutes: matchingInstitutes,
      courses: matchingCourses,
      locations: matchingLocations
    });

    setIsOpen(true);
  }, [query, centers]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/centers?q=${encodeURIComponent(query.trim())}`);
  };

  const handleInstituteClick = (id) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/centers/${id}`);
  };

  const handleCourseClick = (course) => {
    setIsOpen(false);
    setQuery(course);
    router.push(`/centers?q=${encodeURIComponent(course)}`);
  };

  const handleLocationClick = (location) => {
    setIsOpen(false);
    setQuery("");
    const city = location.split(',')[0].trim();
    router.push(`/centers?city=${encodeURIComponent(city)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const totalResults =
    suggestions.institutes.length +
    suggestions.courses.length +
    suggestions.locations.length;

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-12 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm transition-all"
        />

        {/* Search Icon */}
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {totalResults === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              {/* Institutes */}
              {suggestions.institutes.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Institutes
                  </div>
                  {suggestions.institutes.map((institute, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInstituteClick(institute.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {institute.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {institute.location}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Courses */}
              {suggestions.courses.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Courses
                  </div>
                  {suggestions.courses.map((course, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCourseClick(course)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-gray-900">{course}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Locations */}
              {suggestions.locations.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Locations
                  </div>
                  {suggestions.locations.map((location, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLocationClick(location)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-sm text-gray-900">{location}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* View All Results */}
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={handleSearch}
                  className="w-full px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  View all results for "{query}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}