"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Building2,
  MapPin,
  Map,
  Home,
  Navigation,
  X,
  ChevronDown,
  Search
} from "lucide-react";

export default function CenterFilter({
  types,
  states,
  districts,
  cities,
  locations,
  totalCount = 0,
  filteredCount = 0
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "";
  const currentState = searchParams.get("state") || "";
  const currentDistrict = searchParams.get("district") || "";
  const currentCity = searchParams.get("city") || "";
  const currentLocation = searchParams.get("location") || "";

  // State for cascading filters
  const [availableDistricts, setAvailableDistricts] = useState(districts);
  const [availableCities, setAvailableCities] = useState(cities);
  const [availableLocations, setAvailableLocations] = useState(locations);

  // Update cascading filters when state/district/city changes
  useEffect(() => {
    setAvailableDistricts(districts);
    setAvailableCities(cities);
    setAvailableLocations(locations);
  }, [currentState, currentDistrict, currentCity, districts, cities, locations]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);

      // Clear dependent filters when parent filter changes
      if (key === "state") {
        params.delete("district");
        params.delete("city");
        params.delete("location");
      } else if (key === "district") {
        params.delete("city");
        params.delete("location");
      } else if (key === "city") {
        params.delete("location");
      }
    } else {
      params.delete(key);
    }

    router.push(`/centers?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/centers');
  };

  const activeFilters = [
    currentType,
    currentState,
    currentDistrict,
    currentCity,
    currentLocation
  ].filter(Boolean);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-base font-bold text-gray-900">Filters</h3>
          {filteredCount > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {filteredCount} of {totalCount} centers
            </p>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentType && (
            <FilterTag
              label={currentType}
              onRemove={() => updateFilter("type", "")}
            />
          )}
          {currentState && (
            <FilterTag
              label={currentState}
              onRemove={() => updateFilter("state", "")}
            />
          )}
          {currentDistrict && (
            <FilterTag
              label={currentDistrict}
              onRemove={() => updateFilter("district", "")}
            />
          )}
          {currentCity && (
            <FilterTag
              label={currentCity}
              onRemove={() => updateFilter("city", "")}
            />
          )}
          {currentLocation && (
            <FilterTag
              label={currentLocation}
              onRemove={() => updateFilter("location", "")}
            />
          )}
        </div>
      )}

      {/* Type Filter */}
      <FilterSelect
        label="Institute Type"
        value={currentType}
        onChange={(value) => updateFilter("type", value)}
        options={types}
        placeholder="All Types"
        icon={Building2}
      />

      {/* State Filter */}
      <FilterSelect
        label="State"
        value={currentState}
        onChange={(value) => updateFilter("state", value)}
        options={states}
        placeholder="All States"
        icon={MapPin}
      />

      {/* District Filter */}
      <FilterSelect
        label="District"
        value={currentDistrict}
        onChange={(value) => updateFilter("district", value)}
        options={availableDistricts}
        placeholder="All Districts"
        icon={Map}
        disabled={!currentState}
        disabledMessage="Select a state first"
      />

      {/* City Filter */}
      <FilterSelect
        label="City"
        value={currentCity}
        onChange={(value) => updateFilter("city", value)}
        options={availableCities}
        placeholder="All Cities"
        icon={Home}
        disabled={!currentState}
        disabledMessage="Select a state first"
      />

      {/* Location Filter */}
      <FilterSelect
        label="Area/Location"
        value={currentLocation}
        onChange={(value) => updateFilter("location", value)}
        options={availableLocations}
        placeholder="All Locations"
        icon={Navigation}
        disabled={!currentCity}
        disabledMessage="Select a city first"
      />

      {/* Results Summary */}
      {hasActiveFilters && filteredCount === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            No centers match your filters. Try adjusting your selection.
          </p>
        </div>
      )}
    </div>
  );
}

// Filter Tag Component
function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors ml-1"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// Filter Select Component
function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  icon: Icon,
  disabled = false,
  disabledMessage = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const hasValue = Boolean(value);
  const showSearch = options.length > 5; // Show search if more than 5 options

  // Filter options based on search
  const filteredOptions = searchTerm
    ? options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
      </label>

      {disabled ? (
        <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
          {disabledMessage}
        </div>
      ) : (
        <>
          {/* Select Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all text-left ${
              hasValue
                ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            {value || placeholder}
          </button>

          {/* Dropdown arrow */}
          <div className="absolute right-3 top-[42px] pointer-events-none">
            <ChevronDown className={`w-4 h-4 transition-all ${
              isOpen ? 'rotate-180' : ''
            } ${hasValue ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>

          {/* Clear button when value selected */}
          {hasValue && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-[42px] p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {/* Search Input */}
              {showSearch && (
                <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={`Search ${label.toLowerCase()}...`}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                        value === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No results found
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Option count hint */}
      {!disabled && options?.length > 0 && (
        <p className="text-xs text-gray-400 mt-1">
          {options.length} {options.length === 1 ? 'option' : 'options'}
        </p>
      )}
    </div>
  );
}