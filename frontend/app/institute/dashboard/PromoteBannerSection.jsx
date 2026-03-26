// components/PromoteBannerSection.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, CheckCircle, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function PromoteBannerSection({ centerId, centerName }) {
  const router = useRouter();
  const [myBanners, setMyBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!centerId) return;
    const token = localStorage.getItem("instituteToken");
    fetch(`${API_URL}/banners/institute/${centerId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(d => setMyBanners(d.banners || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [centerId]);

  const activeBanners  = myBanners.filter(b => b.isActive && new Date(b.endDate) >= new Date());
  const pendingBanners = myBanners.filter(b => !b.isActive && new Date(b.endDate) >= new Date());

  return (
    <div className="mb-3 border rounded-xl overflow-hidden">
      <button
        onClick={() => router.push("/institute/dashboard/promote")}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Promote My Institute</p>
            <p className="text-[10px] text-gray-500">Get featured on Inscovia search</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          ) : (
            <>
              {activeBanners.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> {activeBanners.length} Active
                </span>
              )}
              {pendingBanners.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> {pendingBanners.length} Pending
                </span>
              )}
            </>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </button>
    </div>
  );
}