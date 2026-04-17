// app/institute/register/components/Step1BasicInfo.jsx

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

// Secondary category rules:
// SCHOOL_TUITION → Languages, Exam Coaching only
// STUDY_ABROAD   → Languages only
// All others     → any category except SCHOOL_TUITION, STUDY_ABROAD, and themselves
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

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function Step1BasicInfo({ formData, onChange, onSecondaryToggle, onNext }) {
  const isStudyAbroad = formData.primaryCategory === "STUDY_ABROAD";

  const availableSecondary = formData.primaryCategory
    ? CATEGORIES.filter(cat => ALLOWED_SECONDARY[formData.primaryCategory]?.includes(cat.value))
    : [];

  const validate = () => {
    if (!formData.instituteName) return "Institute name is required";
    if (!formData.primaryCategory) return "Please select a primary category";
    if (!isStudyAbroad && !formData.teachingMode) return "Please select a teaching mode";
    return null;
  };

  const handleNext = () => {
    const error = validate();
    if (error) { onNext(error); return; }
    onNext(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-gray-500 text-sm mt-1">Tell us about your institute</p>
      </div>

      {/* Institute Name */}
      <div>
        <label className={labelClass}>Institute Name *</label>
        <input type="text" name="instituteName" value={formData.instituteName}
          onChange={onChange} placeholder="e.g. Brilliant Academy"
          className={inputClass} />
      </div>

      {/* Primary Category */}
      <div>
        <label className={labelClass}>
          Primary Category * <span className="text-gray-400 font-normal ml-1">(Main focus area)</span>
        </label>
        <select name="primaryCategory" value={formData.primaryCategory}
          onChange={onChange} className={`${inputClass} bg-white`}>
          <option value="">Select primary category</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Secondary Categories */}
      {formData.primaryCategory && availableSecondary.length > 0 && (
        <div>
          <label className={labelClass}>
            Secondary Categories <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableSecondary.map(cat => {
              const selected = formData.secondaryCategories.includes(cat.value);
              return (
                <button key={cat.value} type="button"
                  onClick={() => onSecondaryToggle(cat.value)}
                  className={`px-3 py-2.5 border-2 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between gap-2 ${
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}>
                  <span>{cat.label}</span>
                  {selected && (
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Study Abroad notice */}
      {isStudyAbroad && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          As a study abroad consultancy, you can add countries and services from your dashboard after registration.
        </div>
      )}

      {/* Teaching Mode — hidden for Study Abroad */}
      {!isStudyAbroad && (
        <div>
          <label className={labelClass}>
            Teaching Mode * <span className="text-gray-400 font-normal ml-1">(How do you teach?)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "ONLINE",  label: "Online",  icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { value: "OFFLINE", label: "Offline", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
              { value: "HYBRID",  label: "Hybrid",  icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
            ].map(mode => (
              <button key={mode.value} type="button"
                onClick={() => onChange({ target: { name: "teachingMode", value: mode.value } })}
                className={`py-3 px-2 border-2 rounded-lg text-sm font-medium transition-all ${
                  formData.teachingMode === mode.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}>
                <div className="flex flex-col items-center gap-1.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.icon} />
                  </svg>
                  {mode.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="button" onClick={handleNext}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Next →
      </button>
    </div>
  );
}