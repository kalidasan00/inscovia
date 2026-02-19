"use client";
import { useState, useEffect } from "react";
import { Search, Download, FileText, BookOpen, Filter, X, ChevronRight } from "lucide-react";
import Link from "next/link";

const CATEGORY_META = {
  "Engineering":     { icon: "⚙️", color: "#2563eb", bg: "#eff6ff" },
  "Medical":         { icon: "🏥", color: "#dc2626", bg: "#fef2f2" },
  "Civil Services":  { icon: "🏛️", color: "#7c3aed", bg: "#f5f3ff" },
  "Banking":         { icon: "🏦", color: "#059669", bg: "#ecfdf5" },
  "SSC & Railway":   { icon: "🚂", color: "#d97706", bg: "#fffbeb" },
  "Defence":         { icon: "🎖️", color: "#0f766e", bg: "#f0fdfa" },
  "Law":             { icon: "⚖️", color: "#be185d", bg: "#fdf2f8" },
  "Management":      { icon: "📊", color: "#ea580c", bg: "#fff7ed" },
  "Teaching":        { icon: "📚", color: "#0284c7", bg: "#f0f9ff" },
  "State PSC":       { icon: "🗳️", color: "#4f46e5", bg: "#eef2ff" },
};

const DEFAULT_META = { icon: "📄", color: "#6b7280", bg: "#f9fafb" };

export default function PreviousYearPapers() {
  const [papers, setPapers] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await fetch(`${API_URL}/papers`);
      const data = await res.json();
      setPapers(data.papers || []);
      setGrouped(data.grouped || {});
    } catch (err) {
      setError("Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (paper) => {
    try {
      const res = await fetch(`${API_URL}/papers/${paper.id}/download`, { method: "POST" });
      const data = await res.json();
      window.open(data.pdfUrl, "_blank");
    } catch {
      window.open(paper.pdfUrl, "_blank");
    }
  };

  // Filter papers
  const filteredPapers = papers.filter(p => {
    const matchCat = selectedCategory === "All" || p.examCategory === selectedCategory;
    const matchSearch = !search ||
      p.examName.toLowerCase().includes(search.toLowerCase()) ||
      p.examCategory.toLowerCase().includes(search.toLowerCase()) ||
      (p.subject && p.subject.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Re-group filtered papers
  const filteredGrouped = filteredPapers.reduce((acc, paper) => {
    if (!acc[paper.examCategory]) acc[paper.examCategory] = [];
    acc[paper.examCategory].push(paper);
    return acc;
  }, {});

  const categories = ["All", ...Object.keys(grouped)];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Previous Year Question Papers</h1>
          </div>
          <p className="text-gray-500 text-sm mb-5">
            Download free previous year papers for all top Indian competitive exams
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exam (e.g. JEE, NEET, UPSC...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading papers...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        )}

        {/* No papers */}
        {!loading && !error && filteredPapers.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">
              {search ? `No papers found for "${search}"` : "No papers uploaded yet"}
            </p>
          </div>
        )}

        {/* Papers grouped by category */}
        {!loading && !error && Object.keys(filteredGrouped).length > 0 && (
          <div className="space-y-8">
            {Object.entries(filteredGrouped).map(([category, categoryPapers]) => {
              const meta = CATEGORY_META[category] || DEFAULT_META;

              // Group by examName within category
              const byExam = categoryPapers.reduce((acc, paper) => {
                if (!acc[paper.examName]) acc[paper.examName] = [];
                acc[paper.examName].push(paper);
                return acc;
              }, {});

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{meta.icon}</span>
                    <h2 className="text-sm font-bold text-gray-800">{category}</h2>
                    <span className="text-xs text-gray-400">({categoryPapers.length} papers)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(byExam).map(([examName, examPapers]) => (
                      <div key={examName} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {/* Exam header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: meta.bg, color: meta.color }}>
                            {examName.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{examName}</p>
                            <p className="text-xs text-gray-400">{examPapers.length} paper{examPapers.length > 1 ? "s" : ""} available</p>
                          </div>
                        </div>

                        {/* Papers list */}
                        <div className="divide-y divide-gray-50">
                          {examPapers.map(paper => (
                            <div key={paper.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {paper.year}{paper.shift ? ` • ${paper.shift}` : ""}{paper.subject ? ` • ${paper.subject}` : ""}
                                  </p>
                                  <p className="text-xs text-gray-400">{paper.language}{paper.fileSize ? ` • ${paper.fileSize}` : ""}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownload(paper)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg shrink-0 ml-2 transition-opacity hover:opacity-90"
                                style={{ backgroundColor: meta.color }}
                              >
                                <Download className="w-3 h-3" />
                                PDF
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Find coaching CTA */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                          <Link
                            href={`/centers?q=${encodeURIComponent(examName)}`}
                            className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <span>Find {examName} coaching near you</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}