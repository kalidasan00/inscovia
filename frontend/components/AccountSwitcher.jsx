"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, ChevronDown, ChevronRight, LogIn, Check, Loader2, Plus, LogOut, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function AccountSwitcher({ mode = "user", currentOrgId, currentOrgName }) {
  const router = useRouter();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [switching, setSwitching] = useState(null);
  const [lastActive, setLastActive] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);

  // ── load persisted state (mirrors BottomNav's checkAuth) ─────────────────
  useEffect(() => {
    const loadAuth = () => {
      try {
        const instLoggedIn = localStorage.getItem("instituteLoggedIn") === "true";
        const usrLoggedIn = localStorage.getItem("userLoggedIn") === "true";
        setIsInstituteLoggedIn(instLoggedIn);
        setIsUserLoggedIn(usrLoggedIn);

        const last = localStorage.getItem("lastActiveDashboard");
        if (last) setLastActive(last);

        const userData = localStorage.getItem("userData");
        if (userData) setUser(JSON.parse(userData));

        // ✅ Always use userOrgs (matches BottomNav)
        const orgsData = localStorage.getItem("userOrgs");
        if (orgsData) setOrgs(JSON.parse(orgsData));
      } catch {}
    };

    loadAuth();
    window.addEventListener("authStateChanged", loadAuth);
    window.addEventListener("storage", loadAuth);
    return () => {
      window.removeEventListener("authStateChanged", loadAuth);
      window.removeEventListener("storage", loadAuth);
    };
  }, []);

  // ── close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── derived values (mirrors BottomNav) ───────────────────────────────────
  const activeAccount =
    mode === "institute" ? "institute"
    : mode === "user" ? "user"
    : lastActive ?? (isInstituteLoggedIn ? "institute" : isUserLoggedIn ? "user" : null);

  const activeOrg = orgs?.[0] ?? null;

  // ✅ BUG 2 FIX: Read currentOrgId from localStorage so it stays fresh
  // after a switch, not just from the prop (which is stale until page reload)
  const [activeOrgId, setActiveOrgId] = useState(
    currentOrgId || (typeof window !== "undefined" ? localStorage.getItem("currentOrgId") : null)
  );

  useEffect(() => {
    const stored = localStorage.getItem("currentOrgId");
    if (stored) setActiveOrgId(stored);
    const onAuth = () => {
      const s = localStorage.getItem("currentOrgId");
      if (s) setActiveOrgId(s);
    };
    window.addEventListener("authStateChanged", onAuth);
    return () => window.removeEventListener("authStateChanged", onAuth);
  }, []);

  const instituteName = activeOrg?.name || currentOrgName || "Institute";
  const instituteInitial = instituteName[0]?.toUpperCase() || "I";

  // ── trigger label ─────────────────────────────────────────────────────────
  const triggerLabel = mode === "institute" ? instituteName : (user?.name || "Account");

  // ── ProfileAvatar — exact copy from BottomNav ────────────────────────────
  const isInst = activeAccount === "institute";
  const avatarLabel = isInst
    ? instituteInitial
    : (user?.name?.[0] || "U").toUpperCase();
  const ringColor = isInst ? "ring-indigo-500" : "ring-blue-500";
  const bgColor = isInst
    ? "bg-gradient-to-br from-indigo-500 to-purple-600"
    : "bg-gradient-to-br from-blue-500 to-cyan-500";

  // ── switch to org (always uses userToken — mirrors BottomNav) ────────────
  const handleSwitchToInstitute = async (org) => {
    if (mode === "institute" && org.id === activeOrgId) {
      setOpen(false);
      return;
    }

    setSwitching(org.id);
    try {
      // ✅ Always userToken for switching (matches BottomNav)
      const token = localStorage.getItem("userToken");

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

      // ✅ BUG 1 FIX: Save org+center from API response (not stale user data)
      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", data.token);
      localStorage.setItem("instituteData", JSON.stringify(data.organization));
      localStorage.setItem("instituteCenter", JSON.stringify(data.center));
      localStorage.setItem("instituteOrgs", JSON.stringify(orgs));
      localStorage.setItem("currentOrgId", data.organization?.id || org.id);
      localStorage.setItem("currentOrgRole", data.role);
      localStorage.setItem("lastActiveDashboard", "institute");
      setLastActive("institute");

      window.dispatchEvent(new Event("authStateChanged"));
      setOpen(false);

      // ✅ BUG 3 FIX: Single hard navigation — ensures localStorage is committed
      // before the dashboard page re-reads it
      window.location.href = "/institute/dashboard";
    } catch (err) {
      console.error("Switch error:", err.message);
    } finally {
      setSwitching(null);
    }
  };

  const handleGoToUserDashboard = () => {
    localStorage.setItem("lastActiveDashboard", "user");
    setLastActive("user");
    setOpen(false);
    router.push("/user/dashboard");
  };

  // ✅ Logout — was missing, now matches BottomNav exactly
  const handleLogout = () => {
    [
      "userLoggedIn", "userData", "userToken", "userOrgs",
      "userCity", "userLat", "userLng",
      "instituteLoggedIn", "instituteToken", "instituteData", "instituteOrgs",
      "lastActiveDashboard",
    ].forEach((k) => localStorage.removeItem(k));
    setLastActive(null);
    window.dispatchEvent(new Event("authStateChanged"));
    setOpen(false);
    router.push("/");
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative mb-3">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
      >
        {/* ✅ Avatar matches BottomNav exactly — initials + dot badge */}
        <div className={`relative w-8 h-8 rounded-full ring-2 ${ringColor} ring-offset-1 ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-[10px] font-bold leading-none">{avatarLabel}</span>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
            isInst ? "bg-indigo-500" : "bg-blue-500"
          }`} />
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{triggerLabel}</p>
          <p className="text-[10px] text-gray-500">
            {mode === "institute" ? "Institute Account" : "Personal Account"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isInst ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"
          }`}>
            {isInst ? "Institute" : "Personal"}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">

          {/* Active account banner — matches BottomNav sheet */}
          {activeAccount && (
            <div className={`flex items-center gap-3 p-3 m-2 rounded-xl ${
              activeAccount === "institute"
                ? "bg-indigo-50 border border-indigo-100"
                : "bg-blue-50 border border-blue-100"
            }`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${bgColor}`}>
                {avatarLabel}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Active account</p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {activeAccount === "institute" ? instituteName : (user?.name || "User")}
                </p>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                activeAccount === "institute" ? "bg-indigo-500" : "bg-blue-500"
              }`} />
            </div>
          )}

          <div className="p-2 space-y-0.5">
            {/* Personal account row */}
            {isUserLoggedIn && (
              <button
                onClick={handleGoToUserDashboard}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                  activeAccount === "user" ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                {activeAccount === "user" && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* Institutes list */}
            {orgs.length > 0 && (
              <>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">
                  Your Institutes
                </p>
                <div className="max-h-60 overflow-y-auto">
                  {orgs.map((org) => {
                    const isActive = mode === "institute" && org.id === activeOrgId;
                    const isSwitching = switching === org.id;

                    return (
                      <button
                        key={org.id}
                        onClick={() => handleSwitchToInstitute(org)}
                        disabled={isSwitching}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-left ${
                          isActive ? "bg-indigo-50 border border-indigo-100" : "hover:bg-indigo-50"
                        }`}
                      >
                        <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{org.name}</p>
                          <p className="text-[10px] text-gray-500 capitalize">
                            {org.role?.toLowerCase()} · {org.city}
                          </p>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        )}
                        {isSwitching ? (
                          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        ) : isActive ? (
                          <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-gray-100 p-2 space-y-0.5">
            {/* Add New Institute */}
            <button
              onClick={() => { setOpen(false); router.push("/institute/register"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-800 flex-1">Add Institute</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* ✅ Logout — was missing, now matches BottomNav */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-600">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}