// components/CenterFilter.jsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CenterFilter({ locations = [] }) {
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply() {
    const params = new URLSearchParams();
    if (searchParams.get("q")) params.set("q", searchParams.get("q"));
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    router.push(`/centers?${params.toString()}`);
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <div className="mb-3 font-medium">Filters</div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border px-2 py-2 rounded-md">
            <option value="">All</option>
            <option value="IT">IT</option>
            <option value="Non-IT">Non-IT</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border px-2 py-2 rounded-md">
            <option value="">All</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        <button onClick={apply} className="w-full px-3 py-2 bg-accent text-white rounded-md">Apply</button>
      </div>
    </div>
  );
}
