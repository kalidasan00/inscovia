"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, ChevronDown, LogIn, Check, Plus, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// mode: "user" = currently on user dashboard, "institute" = currently on institute dashboard
// currentOrgId / currentOrgName: only relevant when mode === "institute"
export default function AccountSwitcher({ mode = "user", currentOrgId, currentOrgName }) {
  const router = useRouter();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [switching, setSwitching] = useState(null); // null | orgId string

  // ── load persisted state ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) setUser(JSON.parse(userData));

      // OrgSwitcher used "instituteOrgs"; AccountSwitcher used "userOrgs".
      // Support both keys so nothing breaks regardless of which flow set them.
      const orgsData =
        localStorage.getItem("userOrgs") ||
        localStorage.getItem("instituteOrgs");
      if (orgsData) setOrgs(JSON.parse(orgsData));
    } catch {}
  }, []);

  // ── close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── switch to any org (works from both "user" and "institute" mode) ───────
  const handleSwitchToInstitute = async (org) => {
    // If already on this org in institute mode, just close
    if (mode === "institute" && org.id === currentOrgId) {
      setOpen(false);
      return;
    }

    setSwitching(org.id);
    try {
      const token =
        localStorage.getItem("userToken") ||
        localStorage.getItem("instituteToken");

      const res = await fetch(`${API_URL}/org/switch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", data.token);
      localStorage.setItem("instituteData", JSON.stringify(user));
      localStorage.setItem("instituteOrgs", JSON.stringify(orgs));
      window.dispatchEvent(new Event("authStateChanged"));
      setOpen(false);

      if (mode === "institute") {
        // Already on institute dashboard — refresh in place (OrgSwitcher behaviour)
        router.refresh();
        window.location.reload();
      } else {
        router.push("/institute/dashboard");
      }
    } catch (err) {
      console.error("Switch error:", err.message);
    } finally {
      setSwitching(null);
    }
  };

  const handleGoToUserDashboard = () => {
    setOpen(false);
    router.push("/user/dashboard");
  };

  if (!user) return null;

  // ── resolve display name for trigger button ───────────────────────────────
  const triggerLabel =
    mode === "institute" ? (currentOrgName || "Select Org") : user.name;

  return (
    <div ref={ref} className="relative mb-3">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            mode === "institute"
              ? "bg-gradient-to-br from-indigo-500 to-purple-600"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          }`}
        >
          {mode === "institute" ? (
            <Building2 className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{triggerLabel}</p>
          <p className="text-[10px] text-gray-500">
            {mode === "institute" ? "Institute Account" : "Personal Account"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              mode === "institute"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {mode === "institute" ? "Institute" : "Personal"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            Switch Account
          </p>

          <div className="p-2 space-y-0.5">
            {/* Personal account row */}
            <button
              onClick={handleGoToUserDashboard}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                mode === "user" ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500">Personal Account</p>
              </div>
              {mode === "user" && (
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  Active
                </span>
              )}
            </button>

            {/* Institute / org rows */}
            {orgs.length > 0 && (
              <>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">
                  Institutes
                </p>
                <div className="max-h-60 overflow-y-auto">
                  {orgs.map((org) => {
                    const isActive = mode === "institute" && org.id === currentOrgId;
                    const isSwitching = switching === org.id;

                    return (
                      <button
                        key={org.id}
                        onClick={() => handleSwitchToInstitute(org)}
                        disabled={isSwitching}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-left ${
                          isActive ? "bg-indigo-50" : "hover:bg-indigo-50"
                        }`}
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{org.name}</p>
                          <p className="text-[10px] text-gray-500 capitalize">
                            {org.role?.toLowerCase()} · {org.city}
                          </p>
                        </div>

                        {/* Right-side indicator */}
                        {isSwitching ? (
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                        ) : isActive ? (
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <LogIn className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Add New Institute — from OrgSwitcher */}
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/institute/register");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Institute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}