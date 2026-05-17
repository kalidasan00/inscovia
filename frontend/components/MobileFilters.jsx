// components/MobileFilters.jsx
"use client";
import { useState, useEffect } from "react";
import { X, MapPin, Check, Tag, Monitor, Map, Star, IndianRupee, Navigation } from "lucide-react";

export default function MobileFilters({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  categories,
  teachingModes,
  states
}) {
  const [activeSection, setActiveSection] = useState("distance");
  const [distanceKm, setDistanceKm] = useState(filters.distanceKm || 30);
  const [hasUserLocation, setHasUserLocation] = useState(false);

  useEffect(() => {
    try {
      const lat = localStorage.getItem("userLat");
      const lng = localStorage.getItem("userLng");
      setHasUserLocation(!!(lat && lng));
    } catch { }
  }, []);

  const filterSections = [
    { id: "distance", label: "Distance", Icon: Navigation },
    {
      id: "categories", label: "Category", Icon: Tag,
      options: categories.map(cat => ({ value: cat, label: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
    },
    {
      id: "teachingMode", label: "Mode", Icon: Monitor,
      options: teachingModes.map(mode => ({ value: mode, label: mode }))
    },
    {
      id: "state", label: "State", Icon: Map,
      options: states.map(state => ({ value: state, label: state }))
    },
    {
      id: "rating", label: "Rating", Icon: Star,
      options: [
        { value: "4.5", label: "4.5 & above" },
        { value: "4.0", label: "4.0 & above" },
        { value: "3.5", label: "3.5 & above" },
        { value: "3.0", label: "3.0 & above" },
      ]
    },
    {
      id: "priceRange", label: "Price", Icon: IndianRupee,
      options: [
        { value: "0-5000", label: "Under ₹5,000" },
        { value: "5000-10000", label: "₹5,000 - ₹10,000" },
        { value: "10000-25000", label: "₹10,000 - ₹25,000" },
        { value: "25000-50000", label: "₹25,000 - ₹50,000" },
        { value: "50000-100000", label: "₹50,000 - ₹1L" },
        { value: "100000+", label: "Above ₹1L" },
      ]
    },
  ];

  const handleReset = () => {
    setDistanceKm(30);
    onFilterChange({ categories: [], teachingModes: [], state: "", city: "", priceRange: "", distanceKm: null });
    setActiveSection("distance");
  };

  const handleApply = () => {
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
      onFilterChange({ ...filters, state: filters.state === value ? "" : value, city: "" });
    } else if (sectionId === "priceRange") {
      onFilterChange({ ...filters, priceRange: filters.priceRange === value ? "" : value });
    } else if (sectionId === "rating") {
      onFilterChange({ ...filters, minRating: filters.minRating === parseFloat(value) ? null : parseFloat(value) });
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

  const getSectionBadge = (sectionId) => {
    if (sectionId === "categories") return filters.categories?.length || 0;
    if (sectionId === "teachingMode") return filters.teachingModes?.length || 0;
    if (sectionId === "state") return filters.state ? 1 : 0;
    if (sectionId === "priceRange") return filters.priceRange ? 1 : 0;
    if (sectionId === "rating") return filters.minRating ? 1 : 0;
    if (sectionId === "distance") return filters.distanceKm ? 1 : 0;
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <p className="text-xs text-indigo-600 font-medium">{getActiveFilterCount()} applied</p>
          )}
        </div>
        <button onClick={handleReset}
          className="text-xs text-indigo-600 font-medium px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors">
          Reset
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <div className="w-[38%] bg-gray-50 overflow-y-auto border-r border-gray-100">
          {filterSections.map((section) => {
            const badge = getSectionBadge(section.id);
            const isActive = activeSection === section.id;
            const { Icon } = section;
            return (
              <button key={section.id} onClick={() => setActiveSection(section.id)}
                className={`w-full px-3 py-3.5 text-left transition-all border-b border-gray-100 ${
                  isActive ? 'bg-white border-l-[3px] border-l-indigo-500' : 'hover:bg-gray-100'
                }`}>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${isActive ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {section.label}
                    </span>
                  </div>
                  {badge > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto bg-white">

          {/* Distance */}
          {activeSection === "distance" && (
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-4">Show centers within a radius of your location</p>
              <div className="bg-indigo-50 rounded-xl p-4 mb-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {distanceKm >= 100 ? "100+" : distanceKm}
                  <span className="text-sm font-normal text-indigo-400 ml-1">km</span>
                </p>
                <p className="text-xs text-indigo-400 mt-0.5">from your location</p>
              </div>
              <input type="range" min={5} max={100} step={5} value={distanceKm}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setDistanceKm(val);
                  onFilterChange({ ...filters, distanceKm: val });
                }}
                className="w-full accent-indigo-600 mb-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>5 km</span>
                <span>100+ km</span>
              </div>
              {!hasUserLocation && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Enable GPS from navbar for distance filtering.</p>
                </div>
              )}
            </div>
          )}

          {/* Other filters */}
          {activeSection && activeSection !== "distance" && (
            <div className="p-3">
              {filterSections.find(s => s.id === activeSection)?.options.map((option) => {
                const active = isFilterActive(activeSection, option.value);
                return (
                  <button key={option.value} onClick={() => toggleFilter(activeSection, option.value)}
                    className={`w-full flex items-center justify-between px-3 py-3 mb-1.5 rounded-xl border transition-all text-left ${
                      active
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                    }`}>
                    <span className="text-sm font-medium">{option.label}</span>
                    {active && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 pb-24 border-t border-gray-100 bg-white">
        <button onClick={handleApply}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
          Apply Filters{getActiveFilterCount() > 0 ? ` (${getActiveFilterCount()})` : ""}
        </button>
      </div>

    </div>
  );
}