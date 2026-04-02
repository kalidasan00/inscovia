// app/invite/page.js
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | valid | invalid | accepting | accepted | error
  const [invite, setInvite] = useState(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load invite info on mount
  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    fetchInviteInfo();
  }, [token]);

  const fetchInviteInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/org/invite/${token}`);
      const data = await res.json();
      if (!res.ok) { setStatus("invalid"); setError(data.error || "Invalid invite"); return; }
      setInvite(data.invite);
      setHasAccount(data.hasAccount);
      setStatus("valid");
    } catch {
      setStatus("invalid");
      setError("Failed to load invite. Please check your link.");
    }
  };

  const handleAccept = async () => {
    // ✅ Check if user is logged in
    const token_auth = localStorage.getItem("instituteToken");
    if (!token_auth) {
      // Not logged in — redirect to login/register with invite token
      const path = hasAccount
        ? `/institute/login?invite=${token}`
        : `/institute/register?invite=${token}`;
      router.push(path);
      return;
    }

    // ✅ Logged in — accept directly
    setStatus("accepting");
    try {
      const res = await fetch(`${API_URL}/org/invite/${token}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token_auth}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invite");

      // ✅ Update token with new org
      localStorage.setItem("instituteToken", data.token);
      localStorage.setItem("instituteLoggedIn", "true");
      window.dispatchEvent(new Event("authStateChanged"));

      setStatus("accepted");
      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push("/institute/dashboard"), 2000);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  const roleLabel = invite?.role === "MANAGER" ? "Manager" : "Staff";
  const roleColor = invite?.role === "MANAGER" ? "text-blue-600 bg-blue-50" : "text-green-600 bg-green-50";

  // ── Loading ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading invite...</p>
        </div>
      </div>
    );
  }

  // ── Invalid ──
  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invite</h2>
          <p className="text-gray-500 text-sm mb-6">{error || "This invite link is invalid or has expired."}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">← Back to Home</Link>
        </div>
      </div>
    );
  }

  // ── Accepted ──
  if (status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome aboard! 🎉</h2>
          <p className="text-gray-500 text-sm mb-2">
            You've joined <strong>{invite?.org?.name}</strong> as <strong>{roleLabel}</strong>.
          </p>
          <p className="text-xs text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Valid invite ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">You're Invited!</h1>
        </div>

        {/* Invite details */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <p className="text-xs text-gray-500 mb-1">Organization</p>
            <p className="font-bold text-gray-900 text-lg">{invite?.org?.name}</p>
            <p className="text-xs text-gray-500 mt-1">{invite?.org?.city}</p>
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Your Role</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Role permissions */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-600 mb-2">As {roleLabel} you can:</p>
            {invite?.role === "MANAGER" ? (
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Edit institute details</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Manage courses</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Invite staff members</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> View analytics</li>
                <li className="flex items-center gap-2"><span className="text-red-400">✗</span> Cannot delete institute</li>
              </ul>
            ) : (
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> View dashboard</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Update course info</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Upload gallery photos</li>
                <li className="flex items-center gap-2"><span className="text-red-400">✗</span> Cannot edit core details</li>
                <li className="flex items-center gap-2"><span className="text-red-400">✗</span> Cannot invite others</li>
              </ul>
            )}
          </div>

          {/* Expiry notice */}
          <p className="text-xs text-gray-400 text-center mb-4">
            Invite expires: {new Date(invite?.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
          )}

          {/* Accept button */}
          <button
            onClick={handleAccept}
            disabled={status === "accepting"}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {status === "accepting"
              ? "Accepting..."
              : hasAccount
              ? "Login & Accept Invite"
              : "Create Account & Accept"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            {hasAccount
              ? "You'll be asked to login with your existing account"
              : "You'll need to create a free account to join"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvitePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <InvitePage />
    </Suspense>
  );
}