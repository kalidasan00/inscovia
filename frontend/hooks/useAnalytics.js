// hooks/useAnalytics.js
"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export function useAnalytics() {

  // Call this when user searches something
  const logSearch = async (query, city = null, category = null, source = "browse") => {
    if (!query || query.trim().length < 2) return;
    try {
      await fetch(`${API_URL}/analytics/log-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, city, category, source })
      });
    } catch {
      // Silent fail — never break user experience
    }
  };

  // Call this when user views a center page
  const logView = async (centerId, centerName, city = null, category = null) => {
    if (!centerId) return;
    try {
      await fetch(`${API_URL}/analytics/log-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centerId, centerName, city, category })
      });
    } catch {
      // Silent fail
    }
  };

  return { logSearch, logView };
}