// app/institute/register/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Footer from "../../../components/Footer";
import { getStateNames, getDistrictsByState } from "../../../lib/locationUtils";

// ── Category config ──────────────────────────────────────────────────────────
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

// Allowed secondary categories for each primary
const ALLOWED_SECONDARY = {
  SCHOOL_TUITION:    ["LANGUAGES", "EXAM_COACHING"],
  STUDY_ABROAD:      ["LANGUAGES"],
  LANGUAGES:         ["SCHOOL_TUITION", "STUDY_ABROAD", "IT_TECHNOLOGY", "DESIGN_CREATIVE", "MANAGEMENT", "SKILL_DEVELOPMENT", "EXAM_COACHING"],
  IT_TECHNOLOGY:     ["LANGUAGES", "MANAGEMENT", "SKILL_DEVELOPMENT", "DESIGN_CREATIVE"],
  DESIGN_CREATIVE:   ["IT_TECHNOLOGY", "SKILL_DEVELOPMENT", "LANGUAGES"],
  MANAGEMENT:        ["IT_TECHNOLOGY", "LANGUAGES", "EXAM_COACHING"],
  SKILL_DEVELOPMENT: ["IT_TECHNOLOGY", "DESIGN_CREATIVE", "LANGUAGES"],
  EXAM_COACHING:     ["MANAGEMENT", "LANGUAGES", "SCHOOL_TUITION"],
};

export default function RegisterInstitute() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    instituteName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    primaryCategory: "",
    secondaryCategories: [],
    teachingMode: "",
    state: "",
    district: "",
    city: "",
    location: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const isStudyAbroad = formData.primaryCategory === "STUDY_ABROAD";

  // Available secondary categories based on primary selection
  const availableSecondary = formData.primaryCategory
    ? CATEGORIES.filter(cat =>
        ALLOWED_SECONDARY[formData.primaryCategory]?.includes(cat.value)
      )
    : [];

  useEffect(() => {
    try { setStates(getStateNames()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (formData.state) {
      try { setDistricts(getDistrictsByState(formData.state)); }
      catch (e) { setDistricts([]); }
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Reset secondary + teachingMode when primary changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      secondaryCategories: [],
      teachingMode: isStudyAbroad ? "" : prev.teachingMode,
    }));
  }, [formData.primaryCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "state" ? { district: "" } : {}),
    }));
  };

  const handleSecondaryToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      secondaryCategories: prev.secondaryCategories.includes(value)
        ? prev.secondaryCategories.filter(c => c !== value)
        : [...prev.secondaryCategories, value],
    }));
  };

  const validateStep1 = () => {
    const { instituteName, email, phone, password, confirmPassword,
            primaryCategory, teachingMode, state, district, city, location } = formData;

    if (!instituteName || !email || !phone || !password || !confirmPassword ||
        !primaryCategory || !state || !district || !city || !location) {
      return "Please fill in all required fields";
    }
    if (!isStudyAbroad && !teachingMode) return "Please select a teaching mode";
    if (password !== confirmPassword) return "Passwords do not match";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const validationError = validateStep1();
    if (validationError) { setError(validationError); return; }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, instituteName: formData.instituteName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep(2);
      setTimer(600);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError("Please enter a valid 6-digit OTP"); return; }

    setError("");
    setLoading(true);
    try {
      const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Invalid OTP");

      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instituteName: formData.instituteName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          primaryCategory: formData.primaryCategory,
          secondaryCategories: formData.secondaryCategories,
          teachingMode: formData.teachingMode || "ONLINE",
          state: formData.state,
          district: formData.district,
          city: formData.city,
          location: formData.location,
          otpVerified: true,
        }),
      });
      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerData.error || "Registration failed");

      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", registerData.token);
      localStorage.setItem("instituteData", JSON.stringify(registerData.user));
      window.dispatchEvent(new Event("authStateChanged"));
      window.dispatchEvent(new Event("storage"));
      router.push("/institute/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, instituteName: formData.instituteName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setTimer(600);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <>
      <main className="min-h-screen bg-gray-50 px-4 py-12 pb-24 md:pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">

            {/* ── STEP 1 ─────────────────────────────────────────────────── */}
            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Register Your Institute</h1>
                  <p className="text-gray-500 mt-1 text-sm">Join Inscovia and reach more students</p>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                )}

                <form onSubmit={handleSendOTP} className="space-y-7">

                  {/* Institute Details */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b">Institute Details</h3>
                    <div className="space-y-4">

                      <div>
                        <label className={labelClass}>Institute Name *</label>
                        <input type="text" name="instituteName" value={formData.instituteName}
                          onChange={handleChange} placeholder="e.g. Brilliant Academy"
                          className={inputClass} required />
                      </div>

                      {/* Primary Category */}
                      <div>
                        <label className={labelClass}>
                          Primary Category *
                          <span className="text-gray-400 font-normal ml-1">(Main focus area)</span>
                        </label>
                        <select name="primaryCategory" value={formData.primaryCategory}
                          onChange={handleChange} className={`${inputClass} bg-white`} required>
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
                            Secondary Categories
                            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableSecondary.map(cat => {
                              const selected = formData.secondaryCategories.includes(cat.value);
                              return (
                                <button key={cat.value} type="button"
                                  onClick={() => handleSecondaryToggle(cat.value)}
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
                          {formData.secondaryCategories.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1.5">{formData.secondaryCategories.length} selected</p>
                          )}
                        </div>
                      )}

                      {/* Study Abroad note */}
                      {isStudyAbroad && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                          As a study abroad consultancy, you can add countries, services, and partner universities from your dashboard after registration.
                        </div>
                      )}

                      {/* Teaching Mode — hidden for Study Abroad */}
                      {!isStudyAbroad && (
                        <div>
                          <label className={labelClass}>
                            Teaching Mode *
                            <span className="text-gray-400 font-normal ml-1">(How do you teach?)</span>
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: "ONLINE",  label: "Online",  icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                              { value: "OFFLINE", label: "Offline", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                              { value: "HYBRID",  label: "Hybrid",  icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
                            ].map(mode => (
                              <button key={mode.value} type="button"
                                onClick={() => setFormData(p => ({ ...p, teachingMode: mode.value }))}
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
                    </div>
                  </section>

                  {/* Contact Details */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b">Contact Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Email Address *</label>
                        <input type="email" name="email" value={formData.email}
                          onChange={handleChange} placeholder="contact@institute.com"
                          className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number *</label>
                        <PhoneInput international defaultCountry="IN"
                          value={formData.phone}
                          onChange={v => setFormData(p => ({ ...p, phone: v || "" }))}
                          className="phone-input-custom" placeholder="Enter phone number" />
                        <style jsx global>{`
                          .phone-input-custom .PhoneInputInput { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:0.5rem; font-size:14px; outline:none; }
                          .phone-input-custom .PhoneInputInput:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
                          .phone-input-custom .PhoneInputCountry { margin-right:8px; }
                        `}</style>
                      </div>
                    </div>
                  </section>

                  {/* Location */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b">Location</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>State *</label>
                        <select name="state" value={formData.state} onChange={handleChange}
                          className={`${inputClass} bg-white`} required>
                          <option value="">Select State</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>District *</label>
                        <select name="district" value={formData.district} onChange={handleChange}
                          disabled={!formData.state}
                          className={`${inputClass} bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`} required>
                          <option value="">{formData.state ? "Select District" : "Select State First"}</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>City *</label>
                        <input type="text" name="city" value={formData.city}
                          onChange={handleChange} placeholder="Kozhikode"
                          className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Full Address *</label>
                        <input type="text" name="location" value={formData.location}
                          onChange={handleChange} placeholder="MG Road, Near City Center"
                          className={inputClass} required />
                      </div>
                    </div>
                  </section>

                  {/* Security */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b">Security</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Password *</label>
                        <input type="password" name="password" value={formData.password}
                          onChange={handleChange} placeholder="Min. 6 characters"
                          className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Confirm Password *</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword}
                          onChange={handleChange} placeholder="Repeat password"
                          className={inputClass} required />
                      </div>
                    </div>
                  </section>

                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300" required />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <span className="text-blue-600 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 cursor-pointer">Privacy Policy</span>
                    </label>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {loading ? "Sending OTP..." : "Continue"}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 2 ─────────────────────────────────────────────────── */}
            {step === 2 && (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                  <p className="text-gray-500 mt-1 text-sm">We sent a 6-digit code to <span className="font-semibold text-gray-800">{formData.email}</span></p>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                )}

                <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter OTP Code</label>
                    <input type="text" value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000" maxLength={6}
                      className="w-full px-4 py-4 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest" />
                  </div>

                  {timer > 0 && (
                    <p className="text-center text-sm text-gray-500">
                      Code expires in <span className="font-semibold text-blue-600">{formatTime(timer)}</span>
                    </p>
                  )}

                  <button type="submit" disabled={loading || otp.length !== 6}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Verifying..." : "Verify & Register"}
                  </button>

                  <div className="text-center space-y-2">
                    <button type="button" onClick={handleResendOTP} disabled={!canResend || loading}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed block mx-auto">
                      {canResend ? "Resend OTP" : "Resend available after timer expires"}
                    </button>
                    <button type="button" onClick={() => setStep(1)}
                      className="text-sm text-gray-500 hover:text-gray-700 block mx-auto">
                      Back to form
                    </button>
                  </div>
                </form>
              </>
            )}

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/institute/login" className="text-blue-600 hover:text-blue-700 font-medium">Login here</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}