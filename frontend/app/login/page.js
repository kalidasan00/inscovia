// app/login/page.js
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import LocationPrompt from "../../components/LocationPrompt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const redirect = searchParams.get("redirect");

  const [activeTab, setActiveTab] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "", email: "", phone: "", gender: "", password: "", confirmPassword: ""
  });

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      if (activeTab === "otp") setOtpExpired(true);
      return;
    }
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, activeTab]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ After login — always go to user dashboard
  const handlePostLogin = async (data) => {
    // ✅ Save user auth
    localStorage.setItem("userToken", data.token);
    localStorage.setItem("userLoggedIn", "true");
    localStorage.setItem("userData", JSON.stringify(data.user));

    // ✅ Save organizations for institute switcher in navbar
    if (data.organizations && data.organizations.length > 0) {
      localStorage.setItem("userOrgs", JSON.stringify(data.organizations));
    } else {
      localStorage.removeItem("userOrgs");
    }

    window.dispatchEvent(new Event("authStateChanged"));
    window.dispatchEvent(new Event("storage"));

    // ✅ If invite token present — accept it first
    if (inviteToken) {
      await acceptInvite(inviteToken, data.token);
      return;
    }

    // ✅ Always go to user dashboard — institute switch happens from navbar
    const savedCity = localStorage.getItem("userCity");
    if (!savedCity) {
      setShowLocationPrompt(true);
    } else {
      router.push(redirect || "/user/dashboard");
    }
  };

  // ✅ Accept invite after login
  const acceptInvite = async (token, authToken) => {
    try {
      const res = await fetch(`${API_URL}/org/invite/${token}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invite");

      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", data.token);
      window.dispatchEvent(new Event("authStateChanged"));
      router.push("/institute/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Switch to selected org
  const handleSelectOrg = async (org) => {
    try {
      const res = await fetch(`${API_URL}/org/switch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pendingAuthData.token}`,
        },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("instituteToken", data.token);
      localStorage.setItem("instituteOrgs", JSON.stringify(organizations));
      window.dispatchEvent(new Event("authStateChanged"));
      router.push("/institute/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Unified login — one endpoint for everyone
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // ✅ Try institute login first (has orgs)
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      let data = await res.json();

      if (res.ok) {
        await handlePostLogin(data);
        return;
      }

      // ✅ If institute login fails, try user login
      const userRes = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const userData = await userRes.json();

      if (userRes.ok) {
        await handlePostLogin({ ...userData, organizations: [] });
        return;
      }

      setError(data.error || "Invalid email or password");
    } catch {
      setError("Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register (user)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!signupData.gender) { setError("Please select your gender"); return; }
    if (signupData.password !== signupData.confirmPassword) { setError("Passwords do not match"); return; }
    if (signupData.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, name: signupData.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setActiveTab("otp");
      setTimer(600);
      setCanResend(false);
      setOtpExpired(false);
      setOtp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) { setError("Please enter a valid 6-digit OTP"); return; }
    if (otpExpired) { setError("OTP has expired. Please request a new one."); return; }
    setLoading(true);
    try {
      const verifyRes = await fetch(`${API_URL}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Invalid OTP");

      const registerRes = await fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          gender: signupData.gender,
          password: signupData.password,
        }),
      });
      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerData.error || "Registration failed");

      await handlePostLogin({ ...registerData, organizations: [] });
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
      const res = await fetch(`${API_URL}/user/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, name: signupData.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setTimer(600);
      setCanResend(false);
      setOtpExpired(false);
      setOtp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm";

  // ── Location prompt ──
  if (showLocationPrompt) {
    return (
      <LocationPrompt onDone={() => {
        setShowLocationPrompt(false);
        router.push(redirect || "/user/dashboard");
      }} />
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 pb-24">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md border border-gray-200">

        {/* ── Menu ── */}
        {activeTab === "menu" && (
          <>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white text-center rounded-t-xl">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Welcome to Inscovia</h1>
              <p className="text-blue-100 text-sm mt-1">Students & Institutes — one login</p>
            </div>
            <div className="p-6 space-y-3">
              <button onClick={() => { setActiveTab("login"); setError(""); }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Login
              </button>
              <button onClick={() => { setActiveTab("signup"); setError(""); }}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Create Account
              </button>
            </div>
          </>
        )}

        {/* ── Login ── */}
        {activeTab === "login" && (
          <>
            <div className="border-b border-gray-200 p-5 rounded-t-xl">
              <button onClick={() => { setActiveTab("menu"); setError(""); }}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-3 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
              {inviteToken && (
                <p className="text-xs text-indigo-600 mt-1 font-medium">🎉 Login to accept your invite</p>
              )}
            </div>
            {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required value={loginData.email}
                  onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                  className={inputClass} placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" required value={loginData.password}
                  onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                  className={inputClass} placeholder="••••••••" />
              </div>
              <div className="flex justify-end text-sm">
                <Link href="/user/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
                {loading ? "Logging in..." : "Login"}
              </button>
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  No account?{" "}
                  <button type="button" onClick={() => { setActiveTab("signup"); setError(""); }}
                    className="text-blue-600 font-medium">Sign Up</button>
                </p>
              </div>
            </form>
          </>
        )}

        {/* ── Signup ── */}
        {activeTab === "signup" && (
          <>
            <div className="border-b border-gray-200 p-5 rounded-t-xl">
              <button onClick={() => { setActiveTab("menu"); setError(""); }}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-3 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
              {inviteToken && (
                <p className="text-xs text-indigo-600 mt-1 font-medium">🎉 Register to accept your invite</p>
              )}
            </div>
            {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleSendOTP} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" required value={signupData.name}
                  onChange={e => setSignupData(p => ({ ...p, name: e.target.value }))}
                  className={inputClass} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" required value={signupData.email}
                  onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))}
                  className={inputClass} placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <PhoneInput international defaultCountry="IN"
                  value={signupData.phone}
                  onChange={v => setSignupData(p => ({ ...p, phone: v || "" }))}
                  className="phone-input-user" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Male", "Female", "Other"].map(g => (
                    <label key={g} className={`flex items-center justify-center p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                      signupData.gender === g ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-700"
                    }`}>
                      <input type="radio" name="gender" value={g}
                        checked={signupData.gender === g}
                        onChange={e => setSignupData(p => ({ ...p, gender: e.target.value }))}
                        className="sr-only" required />
                      <span className="text-sm font-medium">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <input type="password" required value={signupData.password}
                  onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))}
                  className={inputClass} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                <input type="password" required value={signupData.confirmPassword}
                  onChange={e => setSignupData(p => ({ ...p, confirmPassword: e.target.value }))}
                  className={inputClass} placeholder="Re-enter password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
                {loading ? "Sending OTP..." : "Continue →"}
              </button>
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already registered?{" "}
                  <button type="button" onClick={() => { setActiveTab("login"); setError(""); }}
                    className="text-blue-600 font-medium">Login</button>
                </p>
              </div>
            </form>
          </>
        )}

        {/* ── OTP ── */}
        {activeTab === "otp" && (
          <>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white text-center rounded-t-xl">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-1">Verify Email</h2>
              <p className="text-blue-100 text-sm">Code sent to <span className="font-medium text-white">{signupData.email}</span></p>
            </div>
            {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleVerifyAndRegister} className="p-6 space-y-5">
              <input type="text" value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (error) setError(""); }}
                placeholder="000000" maxLength={6}
                className={`w-full px-4 py-3 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest ${
                  otpExpired ? "border-red-300 bg-red-50" : "border-gray-300"
                }`} />
              {otpExpired
                ? <p className="text-center text-sm text-red-500">⚠️ OTP expired. Request a new one.</p>
                : timer > 0 && <p className="text-center text-sm text-gray-600">Expires in <span className="font-semibold text-blue-600">{formatTime(timer)}</span></p>
              }
              <button type="submit" disabled={loading || otp.length !== 6 || otpExpired}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Verifying..." : "Verify & Register"}
              </button>
              <div className="text-center space-y-2">
                <button type="button" onClick={handleResendOTP} disabled={!canResend || loading}
                  className="text-sm text-blue-600 font-medium disabled:text-gray-400">
                  {canResend ? "Resend OTP" : "Resend after timer"}
                </button>
                <div>
                  <button type="button" onClick={() => { setActiveTab("signup"); setError(""); setOtp(""); }}
                    className="text-sm text-gray-600">← Change email</button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>

      <style jsx global>{`
        .phone-input-user .PhoneInputInput { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:0.5rem; font-size:14px; outline:none; }
        .phone-input-user .PhoneInputInput:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
        .phone-input-user .PhoneInputCountry { margin-right:8px; }
      `}</style>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}