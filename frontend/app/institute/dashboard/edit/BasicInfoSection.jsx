// app/institute/dashboard/edit/BasicInfoSection.jsx
"use client";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const CATEGORIES = [
  { value: "SCHOOL_TUITION",    label: "School Tuition" },
  { value: "STUDY_ABROAD",      label: "Study Abroad" },
  { value: "LANGUAGES",         label: "Languages" },
  { value: "IT_TECHNOLOGY",     label: "IT & Technology" },
  { value: "DESIGN_CREATIVE",   label: "Design & Creative" },
  { value: "MANAGEMENT",        label: "Management" },
  { value: "SKILL_DEVELOPMENT", label: "Skill Development" },
  { value: "EXAM_COACHING",     label: "Exam Coaching" },
];

const TEACHING_MODES = [
  { value: "ONLINE",  label: "Online" },
  { value: "OFFLINE", label: "Offline" },
  { value: "HYBRID",  label: "Hybrid" },
];

// ✅ Synced exactly with Step1BasicInfo.jsx — single source of truth
const ALLOWED_SECONDARY = {
  SCHOOL_TUITION:    ["LANGUAGES", "EXAM_COACHING"],
  STUDY_ABROAD:      ["LANGUAGES"],
  LANGUAGES:         ["IT_TECHNOLOGY", "DESIGN_CREATIVE", "MANAGEMENT", "SKILL_DEVELOPMENT", "EXAM_COACHING"],
  IT_TECHNOLOGY:     ["LANGUAGES", "DESIGN_CREATIVE", "MANAGEMENT", "SKILL_DEVELOPMENT", "EXAM_COACHING"],
  DESIGN_CREATIVE:   ["LANGUAGES", "IT_TECHNOLOGY", "MANAGEMENT", "SKILL_DEVELOPMENT", "EXAM_COACHING"],
  MANAGEMENT:        ["LANGUAGES", "IT_TECHNOLOGY", "DESIGN_CREATIVE", "SKILL_DEVELOPMENT", "EXAM_COACHING"],
  SKILL_DEVELOPMENT: ["LANGUAGES", "IT_TECHNOLOGY", "DESIGN_CREATIVE", "MANAGEMENT", "EXAM_COACHING"],
  EXAM_COACHING:     ["LANGUAGES", "IT_TECHNOLOGY", "DESIGN_CREATIVE", "MANAGEMENT", "SKILL_DEVELOPMENT"],
};

export default function BasicInfoSection({
  formData,
  states,
  districts,
  onInputChange,
  onPhoneChange,
  onSecondaryCategoryToggle
}) {
  const isStudyAbroad = formData.primaryCategory === "STUDY_ABROAD";

  const availableSecondaryCategories = formData.primaryCategory
    ? CATEGORIES.filter(cat =>
        ALLOWED_SECONDARY[formData.primaryCategory]?.includes(cat.value)
      )
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Institute Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute Name <span className="text-red-500">*</span>
          </label>
          <input type="text" name="instituteName" value={formData.instituteName}
            onChange={onInputChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={formData.email}
            onChange={onInputChange} disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed" />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <PhoneInput international defaultCountry="IN"
            value={formData.phone} onChange={onPhoneChange}
            className="phone-input-edit" placeholder="Enter phone number" />
          <style jsx global>{`
            .phone-input-edit .PhoneInputInput { width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:0.375rem; font-size:14px; outline:none; }
            .phone-input-edit .PhoneInputInput:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
            .phone-input-edit .PhoneInputCountry { margin-right:8px; }
          `}</style>
        </div>

        {/* Primary Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Category <span className="text-red-500">*</span>
          </label>
          <select name="primaryCategory" value={formData.primaryCategory}
            onChange={onInputChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white">
            <option value="">Select Primary Category</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Teaching Mode — hidden for Study Abroad */}
        {!isStudyAbroad && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teaching Mode <span className="text-red-500">*</span>
            </label>
            <select name="teachingMode" value={formData.teachingMode}
              onChange={onInputChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white">
              <option value="">Select Teaching Mode</option>
              {TEACHING_MODES.map(mode => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Secondary Categories */}
        {availableSecondaryCategories.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Categories{" "}
              <span className="text-gray-400 font-normal">(Optional, max 3)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSecondaryCategories.map(cat => {
                const isSelected = formData.secondaryCategories?.includes(cat.value);
                return (
                  <button key={cat.value} type="button"
                    onClick={() => onSecondaryCategoryToggle(cat.value)}
                    className={`px-3 py-2.5 border-2 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between gap-2
                      ${isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                      }`}>
                    <span>{cat.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {formData.secondaryCategories?.length || 0} of 3 selected
            </p>
          </div>
        )}

        {/* Study Abroad notice */}
        {isStudyAbroad && (
          <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            As a study abroad consultancy, you can manage countries and services from your dashboard.
          </div>
        )}

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select name="state" value={formData.state} onChange={onInputChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white">
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District <span className="text-red-500">*</span>
          </label>
          <select name="district" value={formData.district} onChange={onInputChange}
            disabled={!formData.state} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
            <option value="">{formData.state ? "Select District" : "Select State First"}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input type="text" name="city" value={formData.city}
            onChange={onInputChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location/Area <span className="text-red-500">*</span>
          </label>
          <input type="text" name="location" value={formData.location}
            onChange={onInputChange} required placeholder="e.g. MG Road, Gandhi Nagar"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={formData.description}
            onChange={onInputChange} rows={4}
            placeholder="Tell students about your institute, courses, facilities, achievements..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>

      </div>
    </div>
  );
}