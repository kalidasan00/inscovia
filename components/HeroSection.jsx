// components/HeroSection.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const router = useRouter();

  function onSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    router.push(`/centers?${params.toString()}`);
  }

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-lg p-6 bg-white shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold">Find training centers near you</h1>
          <p className="text-gray-600 mt-2">Search IT & non-IT coaching centers, compare courses and ratings.</p>

          <form onSubmit={onSearch} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search center or course (e.g. Data Science)"
              className="px-3 py-2 border rounded-md w-full"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All types</option>
              <option value="IT">IT</option>
              <option value="Non-IT">Non-IT</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md w-full">Search</button>
              <button type="button" onClick={() => { setQ(""); setType(""); router.push("/centers"); }} className="px-4 py-2 border rounded-md w-full">Reset</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
