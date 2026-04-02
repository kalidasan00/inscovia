// components/OrgSwitcher.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Check, Plus, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function OrgSwitcher({ currentOrgId, currentOrgName }) {
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [switching, setSwitching] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // ✅ Load orgs from localStorage (set on login)
    try {
      const saved = localStorage.getItem("instituteOrgs");
      if (saved) setOrgs(JSON.parse(saved));
    } catch { }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = async (org) => {
    if (org.id === currentOrgId) { setOpen(false); return; }
    setSwitching(true);
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/org/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // ✅ Update token with new org context
      localStorage.setItem("instituteToken", data.token);
      window.dispatchEvent(new Event("authStateChanged"));
      setOpen(false);
      // ✅ Reload dashboard with new org
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Switch org error:", err.message);
    } finally {
      setSwitching(false);
    }
  };

  // ✅ Only show if more than 1 org
  if (orgs.length <= 1) return null;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
      >
        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="max-w-[100px] truncate">{currentOrgName || "Select Org"}</span>
        {switching
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <ChevronDown className="w-3 h-3" />
        }
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[999] overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            Your Organizations
          </p>
          <div className="py-1 max-h-60 overflow-y-auto">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSwitch(org)}
                disabled={switching}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{org.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{org.role?.toLowerCase()} · {org.city}</p>
                </div>
                {org.id === currentOrgId && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => { setOpen(false); router.push("/institute/register"); }}
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