// app/institute/dashboard/college/ranking/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RankingTab() {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setCollege(data.college);
    } catch {
      // layout handles redirect on auth failure
    } finally {
      setLoading(false);
    }
  };

  if (loading || !college) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent mx-auto" />
      </div>
    );
  }

  const hasRankingData = college.naacGrade || college.nirfRank;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Ranking & Accreditation</h2>
        <Link href="/institute/dashboard/college/edit" className="text-accent text-xs font-medium">
          {hasRankingData ? "Manage" : "Add"}
        </Link>
      </div>

      {hasRankingData ? (
        <div className="grid grid-cols-2 gap-2">
          {college.nirfRank && (
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-700">#{college.nirfRank}</p>
              <p className="text-xs text-gray-500 mt-1">NIRF Rank</p>
            </div>
          )}
          {college.naacGrade && (
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-2xl font-bold text-indigo-700">{college.naacGrade}</p>
              <p className="text-xs text-gray-500 mt-1">NAAC Grade</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-xs text-gray-500 mb-1">No ranking info added yet</p>
          <Link href="/institute/dashboard/college/edit" className="text-accent text-xs font-medium">Add ranking details →</Link>
        </div>
      )}
    </div>
  );
}