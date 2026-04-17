// app/institute/register/components/Step2Location.jsx
import { useState, useEffect } from "react";
import { getStateNames, getDistrictsByState } from "../../../../lib/locationUtils";

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function Step2Location({ formData, onChange, onNext, onBack }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    try { setStates(getStateNames()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (formData.state) {
      try { setDistricts(getDistrictsByState(formData.state)); }
      catch { setDistricts([]); }
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

  const validate = () => {
    if (!formData.state)    return "Please select a state";
    if (!formData.district) return "Please select a district";
    if (!formData.city)     return "City is required";
    if (!formData.location) return "Full address is required";
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
        <h2 className="text-xl font-bold text-gray-900">Location</h2>
        <p className="text-gray-500 text-sm mt-1">Where is your institute located?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>State *</label>
          <select name="state" value={formData.state}
            onChange={onChange} className={`${inputClass} bg-white`}>
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>District *</label>
          <select name="district" value={formData.district}
            onChange={onChange} disabled={!formData.state}
            className={`${inputClass} bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}>
            <option value="">{formData.state ? "Select District" : "Select State First"}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input type="text" name="city" value={formData.city}
            onChange={onChange} placeholder="Kozhikode" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Full Address *</label>
          <input type="text" name="location" value={formData.location}
            onChange={onChange} placeholder="MG Road, Near City Center" className={inputClass} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={handleNext}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}