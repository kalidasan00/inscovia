// components/MobileFilters.jsx
"use client";
import { useState, useEffect } from "react";
import { X, ChevronRight, MapPin } from "lucide-react";

export default function MobileFilters({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  categories,
  teachingModes,
  states
}) {
  const [activeSection, setActiveSection] = useState(null);
  // ✅ ADDED: distance slider state
  const [distanceKm, setDistanceKm] = useState(filters.distanceKm || 30);
  const [hasUserLocation, setHasUserLocation] = useState(false);

  // ✅ ADDED: check if user has location saved
  useEffect(() => {
    try {
      const lat = localStorage.getItem("userLat");
      const lng = localStorage.getItem("userLng");
      setHasUserLocation(!!(lat && lng));
    } catch { }
  }, []);

  const filterSections = [
    {
      id: "distance",
      label: "Distance",
    },
    {
      id: "categories",
      label: "Category",
      options: categories.map(cat => ({
        value: cat,
        label: cat.replace(/_/g, ' '),
        count: 0
      }))
    },
    {
      id: "teachingMode",
      label: "Teaching Mode",
      options: teachingModes.map(mode => ({
        value: mode,
        label: mode,
        count: 0
      }))
    },
    {
      id: "state",
      label: "State",
      options: states.map(state => ({
        value: state,
        label: state,
        count: 0
      }))
    },
    {
      id: "rating",
      label: "Rating",
      options: [
        { value: "4.5", label: "4.5 & above" },
        { value: "4.0", label: "4.0 & above" },
        { value: "3.5", label: "3.5 & above" },
        { value: "3.0", label: "3.0 & above" }
      ]
    },
    {
      id: "priceRange",
      label: "Price Range",
      options: [
        { value: "0-5000", label: "Under ₹5,000" },
        { value: "5000-10000", label: "₹5,000 - ₹10,000" },
        { value: "10000-25000", label: "₹10,000 - ₹25,000" },
        { value: "25000-50000", label: "₹25,000 - ₹50,000" },
        { value: "50000-100000", label: "₹50,000 - ₹1,00,000" },
        { value: "100000+", label: "Above ₹1,00,000" }
      ]
    }
  ];

  const handleReset = () => {
    setDistanceKm(30);
    onFilterChange({
      categories: [],
      teachingModes: [],
      state: "",
      city: "",
      priceRange: "",
      distanceKm: null,
    });
    setActiveSection(null);
  };

  const handleApply = () => {
    // ✅ ADDED: apply distance filter
    if (activeSection === "distance" && hasUserLocation) {
      onFilterChange({ ...filters, distanceKm });
    }
    onClose();
  };

  const toggleFilter = (sectionId, value) => {
    if (sectionId === "categories") {
      const newCategories = filters.categories.includes(value)
        ? filters.categories.filter(c => c !== value)
        : [...filters.categories, value];
      onFilterChange({ ...filters, categories: newCategories });
    } else if (sectionId === "teachingMode") {
      const newModes = filters.teachingModes.includes(value)
        ? filters.teachingModes.filter(m => m !== value)
        : [...filters.teachingModes, value];
      onFilterChange({ ...filters, teachingModes: newModes });
    } else if (sectionId === "state") {
      onFilterChange({ ...filters, state: value, city: "" });
    } else if (sectionId === "priceRange") {
      onFilterChange({ ...filters, priceRange: value });
    } else if (sectionId === "rating") {
      onFilterChange({ ...filters, minRating: parseFloat(value) });
    }
  };

  const isFilterActive = (sectionId, value) => {
    if (sectionId === "categories") return filters.categories.includes(value);
    if (sectionId === "teachingMode") return filters.teachingModes.includes(value);
    if (sectionId === "state") return filters.state === value;
    if (sectionId === "priceRange") return filters.priceRange === value;
    if (sectionId === "rating") return filters.minRating === parseFloat(value);
    return false;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.categories?.length || 0;
    count += filters.teachingModes?.length || 0;
    if (filters.state) count++;
    if (filters.priceRange) count++;
    if (filters.minRating) count++;
    if (filters.distanceKm) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={onClose} className="p-2 -ml-2">
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          Filter ({getActiveFilterCount()} applied)
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Content - Sidebar Layout */}
      <div className="flex h-[calc(100vh-220px)]">
        {/* Left Sidebar */}
        <div className="w-2/5 bg-gray-50 overflow-y-auto border-r border-gray-200">
          {filterSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full px-4 py-4 text-left border-b border-gray-200 transition-colors ${
                activeSection === section.id
                  ? 'bg-white border-l-4 border-l-accent font-medium'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{section.label}</span>
                {activeSection === section.id && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white overflow-y-auto">
          {/* ✅ ADDED: Distance slider section */}
          {activeSection === "distance" && (
            <div className="p-5">
                  <>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Within <span className="text-blue-600 font-bold">
                      {distanceKm >= 100 ? "100+ km" : `${distanceKm} km`}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mb-4">from your location</p>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={distanceKm}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setDistanceKm(val);
                      onFilterChange({ ...filters, distanceKm: val });
                    }}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5 km</span>
                    <span>100+ km</span>
                  </div>
                  {/* ✅ FIXED: warn if no GPS coords */}
                  {!hasUserLocation && (
                    <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Enable GPS from navbar for accurate distance filtering.
                      </p>
                    </div>
                  )}
                </>
            </div>
          )}

          {/* Other filter options */}
          {activeSection && activeSection !== "distance" && (
            <div className="p-4">
              {filterSections
                .find(s => s.id === activeSection)
                ?.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-2 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isFilterActive(activeSection, option.value)}
                        onChange={() => toggleFilter(activeSection, option.value)}
                        className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
            </div>
          )}

          {!activeSection && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a filter category
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-20 flex gap-3 shadow-lg">
        <button
          onClick={handleReset}
          className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}