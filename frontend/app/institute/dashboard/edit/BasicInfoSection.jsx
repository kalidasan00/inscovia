// app/institute/dashboard/edit/BasicInfoSection.jsx
"use client";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const CATEGORIES = [
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "SKILL_DEVELOPMENT", label: "Skill Development" },
  { value: "EXAM_COACHING", label: "Exam Coaching" }
];

const TEACHING_MODES = [
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" },
  { value: "HYBRID", label: "Hybrid" }
];

export default function BasicInfoSection({
  formData,
  states,
  districts,
  onInputChange,
  onPhoneChange,
  onSecondaryCategoryToggle
}) {
  const availableSecondaryCategories = CATEGORIES.filter(
    cat => cat.value !== formData.primaryCategory
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Institute Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="instituteName"
            value={formData.instituteName}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            required
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            international
            defaultCountry="IN"
            value={formData.phone}
            onChange={onPhoneChange}
            className="phone-input-edit"
            placeholder="Enter phone number"
            required
          />
          <style jsx global>{`
            .phone-input-edit .PhoneInputInput {
              width: 100%;
              padding: 8px 12px;
              border: 1px solid #d1d5db;
              border-radius: 0.375rem;
              font-size: 14px;
              outline: none;
            }
            .phone-input-edit .PhoneInputInput:focus {
              border-color: var(--accent-color, #3b82f6);
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            }
            .phone-input-edit .PhoneInputCountry {
              margin-right: 8px;
            }
          `}</style>
        </div>

        {/* Primary Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Category <span className="text-red-500">*</span>
          </label>
          <select
            name="primaryCategory"
            value={formData.primaryCategory}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select Primary Category</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Teaching Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teaching Mode <span className="text-red-500">*</span>
          </label>
          <select
            name="teachingMode"
            value={formData.teachingMode}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select Teaching Mode</option>
            {TEACHING_MODES.map(mode => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>

        {/* Secondary Categories */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Categories (Optional - Max 3)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSecondaryCategories.map(cat => {
              const isSelected = formData.secondaryCategories?.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onSecondaryCategoryToggle(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                  {isSelected && (
                    <span className="ml-2">✓</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {formData.secondaryCategories?.length || 0}/3
          </p>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District <span className="text-red-500">*</span>
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={onInputChange}
            disabled={!formData.state}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {formData.state ? 'Select District' : 'Select State First'}
            </option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {formData.state && districts.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {districts.length} districts available
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location/Area <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onInputChange}
            required
            placeholder="e.g., MG Road, Gandhi Nagar"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows="4"
            placeholder="Tell students about your institute, courses, facilities, achievements..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
    </div>
  );
}