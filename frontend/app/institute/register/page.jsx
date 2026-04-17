// app/institute/register/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StepIndicator from "./components/StepIndicator";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2Location from "./components/Step2Location";
import Step3Account from "./components/Step3Account";
import Step4OTP from "./components/Step4OTP";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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
  const [isExistingUser, setIsExistingUser] = useState(false);

  const router = useRouter();

  // ✅ Check if already logged in user (adding new institute)
  useEffect(() => {
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const userData = localStorage.getItem("userData");
    if (userLoggedIn && userData) {
      try {
        const user = JSON.parse(userData);
        setFormData(prev => ({ ...prev, email: user.email, phone: user.phone || "" }));
        setIsExistingUser(true);
      } catch { }
    }
  }, []);

  // ✅ OTP countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // ✅ Reset secondary categories and teaching mode when primary changes
  useEffect(() => {
    const isStudyAbroad = formData.primaryCategory === "STUDY_ABROAD";
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

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value || "" }));
  };

  const handleSecondaryToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      secondaryCategories: prev.secondaryCategories.includes(value)
        ? prev.secondaryCategories.filter(c => c !== value)
        : [...prev.secondaryCategories, value],
    }));
  };

  // ✅ Step navigation — error passed up from step components
  const handleStep1Next = (error) => {
    if (error) { setError(error); return; }
    setError("");
    setStep(2);
  };

  const handleStep2Next = (error) => {
    if (error) { setError(error); return; }
    setError("");
    // Existing user: skip account + OTP steps, register directly
    if (isExistingUser) {
      handleRegisterExistingUser();
      return;
    }
    setStep(3);
  };

  const handleStep3Next = async (error) => {
    if (error) { setError(error); return; }
    setError("");
    await handleSendOTP();
  };

  // ✅ Send OTP (new user)
  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, instituteName: formData.instituteName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep(4);
      setTimer(600);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
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

  // ✅ Verify OTP + Register (new user)
  const handleVerifyAndRegister = async () => {
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

      localStorage.setItem("userLoggedIn", "true");
      localStorage.setItem("userToken", registerData.token);
      localStorage.setItem("userData", JSON.stringify(registerData.user));
      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", registerData.token);
      localStorage.setItem("instituteData", JSON.stringify(registerData.user));
      if (registerData.organizations) {
        localStorage.setItem("userOrgs", JSON.stringify(registerData.organizations));
      }
      window.dispatchEvent(new Event("authStateChanged"));
      window.dispatchEvent(new Event("storage"));
      router.push("/institute/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register new org for existing logged-in user (no OTP needed)
  const handleRegisterExistingUser = async () => {
    setError("");
    setLoading(true);
    try {
      const userToken = localStorage.getItem("userToken");
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          instituteName: formData.instituteName,
          email: formData.email,
          phone: formData.phone || "",
          password: "existing-user",
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", data.token);
      localStorage.setItem("instituteData", JSON.stringify(data.user));

      const existingOrgs = JSON.parse(localStorage.getItem("userOrgs") || "[]");
      const newOrg = {
        id: data.organization.id,
        name: data.organization.name,
        city: data.organization.city,
        role: "OWNER",
      };
      localStorage.setItem("userOrgs", JSON.stringify([...existingOrgs, newOrg]));
      window.dispatchEvent(new Event("authStateChanged"));
      router.push("/institute/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 pb-24 md:pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isExistingUser ? "Add New Institute" : "Register Your Institute"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isExistingUser
              ? "Add another institute to your account"
              : "Join Inscovia and reach more students"}
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} isExistingUser={isExistingUser} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">

          {/* Existing user notice */}
          {isExistingUser && step <= 2 && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              Adding a new institute to your existing account. No password needed.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Steps */}
          {step === 1 && (
            <Step1BasicInfo
              formData={formData}
              onChange={handleChange}
              onSecondaryToggle={handleSecondaryToggle}
              onNext={handleStep1Next}
            />
          )}
          {step === 2 && (
            <Step2Location
              formData={formData}
              onChange={handleChange}
              onNext={handleStep2Next}
              onBack={() => { setError(""); setStep(1); }}
            />
          )}
          {step === 3 && !isExistingUser && (
            <Step3Account
              formData={formData}
              onChange={handleChange}
              onPhoneChange={handlePhoneChange}
              onNext={handleStep3Next}
              onBack={() => { setError(""); setStep(2); }}
              loading={loading}
            />
          )}
          {step === 4 && !isExistingUser && (
            <Step4OTP
              email={formData.email}
              otp={otp}
              onOtpChange={setOtp}
              onSubmit={handleVerifyAndRegister}
              onResend={handleResendOTP}
              onBack={() => { setError(""); setStep(3); }}
              loading={loading}
              timer={timer}
              canResend={canResend}
            />
          )}
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Login here</Link>
        </p>
      </div>
    </main>
  );
}