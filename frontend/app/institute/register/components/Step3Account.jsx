// app/institute/register/components/Step3Account.jsx
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function Step3Account({ formData, onChange, onPhoneChange, onNext, onBack, loading }) {
  const validate = () => {
    if (!formData.email)           return "Email is required";
    if (!formData.phone)           return "Phone number is required";
    if (!formData.password)        return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
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
        <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
        <p className="text-gray-500 text-sm mt-1">Set up your login credentials</p>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email Address *</label>
        <input type="email" name="email" value={formData.email}
          onChange={onChange} placeholder="contact@institute.com"
          className={inputClass} />
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>Phone Number *</label>
        <PhoneInput international defaultCountry="IN"
          value={formData.phone}
          onChange={v => onPhoneChange(v || "")}
          className="phone-input-custom" />
        <style jsx global>{`
          .phone-input-custom .PhoneInputInput { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:0.5rem; font-size:14px; outline:none; }
          .phone-input-custom .PhoneInputInput:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
          .phone-input-custom .PhoneInputCountry { margin-right:8px; }
        `}</style>
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Password *</label>
          <input type="password" name="password" value={formData.password}
            onChange={onChange} placeholder="Min. 6 characters" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Confirm Password *</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword}
            onChange={onChange} placeholder="Repeat password" className={inputClass} />
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2">
        <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300" required />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the{" "}
          <span className="text-blue-600 cursor-pointer">Terms of Service</span> and{" "}
          <span className="text-blue-600 cursor-pointer">Privacy Policy</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={handleNext} disabled={loading}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? "Sending OTP..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}