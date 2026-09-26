// app/institute/dashboard/edit/CollegeBasicInfoSection.jsx
"use client";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const COLLEGE_CATEGORIES = [
  { value: "ENGINEERING",          label: "Engineering" },
  { value: "MEDICAL",              label: "Medical" },
  { value: "NURSING",              label: "Nursing" },
  { value: "PHARMACY",             label: "Pharmacy" },
  { value: "AYURVEDA_HOMEOPATHY",  label: "Ayurveda / Homeopathy" },
  { value: "ARTS_SCIENCE",         label: "Arts & Science" },
  { value: "MANAGEMENT",           label: "Management" },
  { value: "LAW",                  label: "Law" },
  { value: "ARCHITECTURE",         label: "Architecture" },
  { value: "DEGREE",               label: "Degree" },
  { value: "PG",                   label: "PG" },
  { value: "POLYTECHNIC",          label: "Polytechnic" },
];

const COLLEGE_TYPES = [
  { value: "UNIVERSITY", label: "University" },
  { value: "COLLEGE",    label: "College" },
  { value: "INSTITUTE",  label: "Institute" },
];

const OWNERSHIP_TYPES = [
  { value: "GOVERNMENT", label: "Government" },
  { value: "PRIVATE",    label: "Private" },
  { value: "PUBLIC",     label: "Public" },
];

export default function CollegeBasicInfoSection({
  formData,
  states,
  districts,
  onInputChange,
  onCheckboxChange,
  onPhoneChange,
  onSecondaryCategoryToggle,
}) {
  const availableSecondaryCategories = COLLEGE_CATEGORIES.filter(
    (cat) => cat.value !== formData.collegePrimaryCategory
  );

  return (
    <>
      {/* ── Basic Information ── */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* College Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="instituteName" value={formData.instituteName}
              onChange={onInputChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select name="collegeType" value={formData.collegeType}
              onChange={onInputChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white">
              <option value="">Select Type</option>
              {COLLEGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Ownership */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ownership <span className="text-red-500">*</span>
            </label>
            <select name="ownership" value={formData.ownership}
              onChange={onInputChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white">
              <option value="">Select Ownership</option>
              {OWNERSHIP_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Primary Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Category <span className="text-red-500">*</span>
            </label>
            <select name="collegePrimaryCategory" value={formData.collegePrimaryCategory}
              onChange={onInputChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white">
              <option value="">Select Category</option>
              {COLLEGE_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>

          {/* Established Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
            <input type="number" name="established" value={formData.established}
              onChange={onInputChange} min="1800" max={new Date().getFullYear()}
              placeholder="e.g. 1998"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          {/* Secondary Categories */}
          {availableSecondaryCategories.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Categories{" "}
                <span className="text-gray-400 font-normal">(Optional, max 3)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSecondaryCategories.map(cat => {
                  const isSelected = formData.collegeSecondaryCategories?.includes(cat.value);
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
                {formData.collegeSecondaryCategories?.length || 0} of 3 selected
              </p>
            </div>
          )}

          {/* Affiliated University */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliated University</label>
            <input type="text" name="affiliatedUniversity" value={formData.affiliatedUniversity}
              onChange={onInputChange} placeholder="e.g. Anna University"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          {/* Recognition checkboxes */}
          <div className="md:col-span-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="autonomous" checked={!!formData.autonomous}
                onChange={onCheckboxChange} className="rounded border-gray-300 text-accent focus:ring-accent" />
              Autonomous
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="deemedUniversity" checked={!!formData.deemedUniversity}
                onChange={onCheckboxChange} className="rounded border-gray-300 text-accent focus:ring-accent" />
              Deemed University
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="ugcRecognized" checked={!!formData.ugcRecognized}
                onChange={onCheckboxChange} className="rounded border-gray-300 text-accent focus:ring-accent" />
              UGC Recognized
            </label>
          </div>

        </div>
      </div>

      {/* ── Rankings & Accreditation ── */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Rankings & Accreditation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NAAC Grade</label>
            <input type="text" name="naacGrade" value={formData.naacGrade}
              onChange={onInputChange} placeholder="e.g. A++"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NAAC Score</label>
            <input type="number" step="0.01" name="naacScore" value={formData.naacScore}
              onChange={onInputChange} placeholder="e.g. 3.51"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NAAC Year</label>
            <input type="number" name="naacYear" value={formData.naacYear}
              onChange={onInputChange} placeholder="e.g. 2023"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIRF Rank</label>
            <input type="number" name="nirfRank" value={formData.nirfRank}
              onChange={onInputChange} placeholder="e.g. 45"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIRF Category</label>
            <input type="text" name="nirfCategory" value={formData.nirfCategory}
              onChange={onInputChange} placeholder="e.g. Engineering"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIRF Year</label>
            <input type="number" name="nirfYear" value={formData.nirfYear}
              onChange={onInputChange} placeholder="e.g. 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Body</label>
            <input type="text" name="regulatoryBody" value={formData.regulatoryBody}
              onChange={onInputChange} placeholder="e.g. AICTE, Bar Council of India, MCI"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div className="flex items-center gap-4 md:col-span-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="aicteApproved" checked={!!formData.aicteApproved}
                onChange={onCheckboxChange} className="rounded border-gray-300 text-accent focus:ring-accent" />
              AICTE Approved
            </label>
          </div>
          <div className="flex items-center gap-4 md:col-span-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="nbaAccredited" checked={!!formData.nbaAccredited}
                onChange={onCheckboxChange} className="rounded border-gray-300 text-accent focus:ring-accent" />
              NBA Accredited
            </label>
          </div>

        </div>
      </div>

      {/* ── Contact & Location ── */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Contact & Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input type="text" name="whatsapp" value={formData.whatsapp}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="text" name="website" value={formData.website}
              onChange={onInputChange} placeholder="https://"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input type="text" name="city" value={formData.city}
              onChange={onInputChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
            <input type="text" name="pinCode" value={formData.pinCode}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location/Area <span className="text-red-500">*</span>
            </label>
            <input type="text" name="location" value={formData.location}
              onChange={onInputChange} required placeholder="e.g. MG Road, Gandhi Nagar"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
            <input type="text" name="mapsUrl" value={formData.mapsUrl}
              onChange={onInputChange} placeholder="https://maps.google.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description}
              onChange={onInputChange} rows={4}
              placeholder="Tell students about your college, courses, facilities, achievements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

        </div>
      </div>

      {/* ── Social Links ── */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input type="text" name="facebook" value={formData.facebook}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input type="text" name="instagram" value={formData.instagram}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input type="text" name="linkedin" value={formData.linkedin}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
            <input type="text" name="youtube" value={formData.youtube}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>
      </div>
    </>
  );
}