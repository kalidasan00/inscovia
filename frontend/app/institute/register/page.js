"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getStateNames, getDistrictsByState } from "../../../lib/locationUtils";

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
    location: ""
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Location state
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  // ✅ UPDATED: New 8-category system
  const categories = [
    { value: "TECHNOLOGY", label: "Technology & IT Training" },
    { value: "COMPETITIVE_EXAMS", label: "Competitive Exam Coaching" },
    { value: "LANGUAGE_TRAINING", label: "Language & Communication" },
    { value: "MANAGEMENT", label: "Management & Business" },
    { value: "PROFESSIONAL_COURSES", label: "Professional Courses (CA/CMA/CS)" },
    { value: "DESIGN_CREATIVE", label: "Design & Creative Arts" },
    { value: "DIGITAL_MARKETING", label: "Digital Marketing" },
    { value: "SKILL_DEVELOPMENT", label: "Skill Development & Training" }
  ];

  // Load states on mount
  useEffect(() => {
    try {
      const stateList = getStateNames();
      setStates(stateList);
    } catch (error) {
      console.error("Error loading states:", error);
    }
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (formData.state) {
      try {
        const districtList = getDistrictsByState(formData.state);
        setDistricts(districtList);
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset district when state changes
    if (name === 'state') {
      setFormData({
        ...formData,
        [name]: value,
        district: ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phone: value || ""
    });
  };

  const handleSecondaryToggle = (category) => {
    setFormData(prev => {
      const isSelected = prev.secondaryCategories.includes(category);
      return {
        ...prev,
        secondaryCategories: isSelected
          ? prev.secondaryCategories.filter(c => c !== category)
          : [...prev.secondaryCategories, category]
      };
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.instituteName || !formData.email || !formData.phone ||
        !formData.password || !formData.confirmPassword || !formData.primaryCategory ||
        !formData.teachingMode || !formData.state || !formData.district ||
        !formData.city || !formData.location) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Check if primary category is in secondary categories
    if (formData.secondaryCategories.includes(formData.primaryCategory)) {
      setError("Primary category cannot be selected as secondary category");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          instituteName: formData.instituteName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep(2);
      setTimer(600);
      setCanResend(false);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const verifyResponse = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Invalid OTP");
      }

      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instituteName: formData.instituteName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          primaryCategory: formData.primaryCategory,
          secondaryCategories: formData.secondaryCategories,
          teachingMode: formData.teachingMode,
          state: formData.state,
          district: formData.district,
          city: formData.city,
          location: formData.location,
          otpVerified: true
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error || "Registration failed");
      }

      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", registerData.token);
      localStorage.setItem("instituteData", JSON.stringify(registerData.user));

      window.dispatchEvent(new Event('authStateChanged'));
      window.dispatchEvent(new Event('storage'));

      setLoading(false);
      router.push("/institute/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          instituteName: formData.instituteName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setTimer(600);
      setCanResend(false);
      setOtp("");
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableSecondaryCategories = () => {
    return categories.filter(cat => cat.value !== formData.primaryCategory);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 px-4 py-12 pb-24 md:pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">

            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Register Your Institute</h1>
                  <p className="text-gray-600 mt-2">Join Inscovia and reach more students</p>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendOTP} className="space-y-6">
                  {/* Institute Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Institute Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institute Name *
                        </label>
                        <input
                          type="text"
                          name="instituteName"
                          value={formData.instituteName}
                          onChange={handleChange}
                          placeholder="TechWave Academy"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Primary Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Category * <span className="text-gray-500 font-normal">(Main focus area)</span>
                        </label>
                        <select
                          name="primaryCategory"
                          value={formData.primaryCategory}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select primary category</option>
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Secondary Categories */}
                      {formData.primaryCategory && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Categories <span className="text-gray-500 font-normal">(Optional - Select all that apply)</span>
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {getAvailableSecondaryCategories().map(cat => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => handleSecondaryToggle(cat.value)}
                                className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                                  formData.secondaryCategories.includes(cat.value)
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{cat.label}</span>
                                  {formData.secondaryCategories.includes(cat.value) && (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Selected: {formData.secondaryCategories.length}/{getAvailableSecondaryCategories().length}
                          </p>
                        </div>
                      )}

                      {/* Teaching Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teaching Mode * <span className="text-gray-500 font-normal">(How do you teach?)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, teachingMode: 'ONLINE'})}
                            className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                              formData.teachingMode === 'ONLINE'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>Online</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({...formData, teachingMode: 'OFFLINE'})}
                            className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                              formData.teachingMode === 'OFFLINE'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>Offline</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({...formData, teachingMode: 'HYBRID'})}
                            className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                              formData.teachingMode === 'HYBRID'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <span>Hybrid</span>
                            </div>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {formData.teachingMode === 'ONLINE' && '📱 Classes conducted entirely online'}
                          {formData.teachingMode === 'OFFLINE' && '🏢 In-person classes at physical location'}
                          {formData.teachingMode === 'HYBRID' && '🔄 Mix of online and offline classes'}
                          {!formData.teachingMode && 'Select your preferred teaching mode'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="contact@institute.com"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <PhoneInput
                          international
                          defaultCountry="IN"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className="phone-input-custom"
                          placeholder="Enter phone number"
                          required
                        />
                        <style jsx global>{`
                          .phone-input-custom .PhoneInputInput {
                            width: 100%;
                            padding: 10px 14px;
                            border: 1px solid #d1d5db;
                            border-radius: 0.5rem;
                            font-size: 14px;
                            outline: none;
                          }
                          .phone-input-custom .PhoneInputInput:focus {
                            border-color: #3b82f6;
                            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                          }
                          .phone-input-custom .PhoneInputCountry {
                            margin-right: 8px;
                          }
                        `}</style>
                      </div>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Location</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          required
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          disabled={!formData.state}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Bangalore"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="MG Road, Near City Center"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Security</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300" required />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending OTP..." : "Continue →"}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification - Same as before */}
            {step === 2 && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                  <p className="text-gray-600 mt-2">
                    We've sent a 6-digit code to<br />
                    <span className="font-semibold text-gray-900">{formData.email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      Enter OTP Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-4 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest"
                      required
                    />
                  </div>

                  {timer > 0 && (
                    <div className="text-center text-sm text-gray-600">
                      Code expires in <span className="font-semibold text-blue-600">{formatTime(timer)}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify & Register"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={!canResend || loading}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {canResend ? "Resend OTP" : "Resend available after timer expires"}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      ← Back to form
                    </button>
                  </div>
                </form>
              </>
            )}

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/institute/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}