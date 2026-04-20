"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search, Download, FileText, BookOpen, Filter, X,
  ChevronRight, Bookmark, BookmarkCheck, Share2,
  CheckCircle2, Clock, TrendingUp, AlertCircle
} from "lucide-react";
import Link from "next/link";

// ── Download Modal ────────────────────────────────────────────────────────────
function DownloadModal({ paper, onConfirm, onClose, downloading }) {
  if (!paper) return null;
  const color = paper.examCategory?.color || "#6b7280";
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="h-1 w-full" style={{ backgroundColor: color }} />
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: color }}>
                {paper.examName?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">{paper.examName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{paper.examCategory?.name}</p>
              </div>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                ["Year",      paper.year],
                ["Shift",     paper.shift],
                ["Subject",   paper.subject],
                ["Language",  paper.language],
                ["Size",      paper.fileSize],
                ["Downloads", paper.downloads > 0 ? paper.downloads?.toLocaleString() : null],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4 p-2.5 bg-amber-50 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">PDF opens in a new tab. Allow pop-ups if blocked.</p>
            </div>

            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={downloading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: color }}>
                {downloading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Opening...</>
                  : <><Download className="w-3.5 h-3.5" />Download PDF</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 rounded-xl shadow-xl text-sm font-medium text-white whitespace-nowrap">
        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        {message}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PreviousYearPapers() {
  const [papers, setPapers]                 = useState([]);
  const [categories, setCategories]         = useState([]); // ✅ from DB
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [search, setSearch]                 = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [modalPaper, setModalPaper]         = useState(null);
  const [downloading, setDownloading]       = useState(false);
  const [toast, setToast]                   = useState(null);
  const [bookmarks, setBookmarks]           = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("paperBookmarks") || "[]"); } catch { return []; }
  });
  const [recentIds, setRecentIds]           = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("recentPapers") || "[]"); } catch { return []; }
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    // ✅ Fetch both papers and categories from DB in parallel
    Promise.all([
      fetch(`${API_URL}/papers`).then(r => r.json()),
      fetch(`${API_URL}/categories`).then(r => r.json()),
    ]).then(([papersData, catsData]) => {
      setPapers(papersData.papers || []);
      setCategories(catsData.categories || []);
    }).catch(() => setError("Failed to load papers"))
      .finally(() => setLoading(false));
  }, []);

  const openModal = (paper) => {
    setModalPaper(paper);
    const updated = [paper.id, ...recentIds.filter(id => id !== paper.id)].slice(0, 6);
    setRecentIds(updated);
    localStorage.setItem("recentPapers", JSON.stringify(updated));
  };

  const handleConfirmDownload = async () => {
    if (!modalPaper) return;
    setDownloading(true);
    try {
      const res  = await fetch(`${API_URL}/papers/${modalPaper.id}/download`, { method: "POST" });
      const data = await res.json();
      window.open(data.pdfUrl || modalPaper.pdfUrl, "_blank");
      setToast("PDF opened successfully!");
      setPapers(prev => prev.map(p =>
        p.id === modalPaper.id ? { ...p, downloads: (p.downloads || 0) + 1 } : p
      ));
    } catch {
      window.open(modalPaper.pdfUrl, "_blank");
      setToast("PDF opened in new tab");
    } finally {
      setDownloading(false);
      setModalPaper(null);
    }
  };

  const toggleBookmark = useCallback((paperId, e) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const isBookmarked = prev.includes(paperId);
      const updated = isBookmarked ? prev.filter(id => id !== paperId) : [...prev, paperId];
      localStorage.setItem("paperBookmarks", JSON.stringify(updated));
      setToast(isBookmarked ? "Bookmark removed" : "Paper bookmarked!");
      return updated;
    });
  }, []);

  const handleShare = useCallback(async (paper, e) => {
    e.stopPropagation();
    const text = `${paper.examName} ${paper.year} Question Paper — Free on Inscovia`;
    try {
      if (navigator.share) await navigator.share({ title: text, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setToast("Link copied!"); }
    } catch {}
  }, []);

  // ✅ Filter using examCategoryId from DB
  const filteredPapers = papers.filter(p => {
    const matchCat    = selectedCategoryId === "all" || p.examCategoryId === selectedCategoryId;
    const matchSearch = !search ||
      p.examName.toLowerCase().includes(search.toLowerCase()) ||
      p.examCategory?.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.subject && p.subject.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  // ✅ Group by category name (from relation)
  const filteredGrouped = filteredPapers.reduce((acc, p) => {
    const catName = p.examCategory?.name || "Other";
    if (!acc[catName]) acc[catName] = { color: p.examCategory?.color || "#6b7280", papers: [] };
    acc[catName].papers.push(p);
    return acc;
  }, {});

  const recentPapers = recentIds.map(id => papers.find(p => p.id === id)).filter(Boolean).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Previous Year Question Papers</h1>
          </div>
          <p className="text-gray-400 text-xs mb-4">
            Free downloads for all top Indian competitive exams
          </p>
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search exam (JEE, NEET, UPSC...)"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">

        {/* ✅ Category pills — from DB */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-0.5" />
          <button onClick={() => setSelectedCategoryId("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategoryId === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
            }`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? "text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
              style={selectedCategoryId === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}>
              {cat.name}
              {cat.paperCount > 0 && (
                <span className={`ml-1 ${selectedCategoryId === cat.id ? "opacity-75" : "text-gray-400"}`}>
                  ({cat.paperCount})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Recently Viewed */}
        {recentPapers.length > 0 && !search && selectedCategoryId === "all" && (
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Recently Viewed</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {recentPapers.map(paper => (
                <button key={paper.id} onClick={() => openModal(paper)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shrink-0 hover:border-blue-300 transition-colors">
                  <div className="w-5 h-5 rounded-full shrink-0"
                    style={{ backgroundColor: paper.examCategory?.color || "#6b7280" }} />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{paper.examName}</p>
                    <p className="text-[10px] text-gray-400">{paper.year}{paper.subject ? ` · ${paper.subject}` : ""}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks */}
        {bookmarks.length > 0 && !search && selectedCategoryId === "all" && (
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Bookmark className="w-3 h-3 text-amber-500" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Bookmarked</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {bookmarks.map(id => {
                const paper = papers.find(p => p.id === id);
                if (!paper) return null;
                return (
                  <button key={id} onClick={() => openModal(paper)}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shrink-0 hover:border-amber-400 transition-colors">
                    <div className="w-5 h-5 rounded-full shrink-0"
                      style={{ backgroundColor: paper.examCategory?.color || "#6b7280" }} />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{paper.examName}</p>
                      <p className="text-[10px] text-gray-400">{paper.year}{paper.subject ? ` · ${paper.subject}` : ""}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading papers...</p>
          </div>
        )}
        {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}
        {!loading && !error && filteredPapers.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-gray-400 text-sm">
              {search ? `No papers found for "${search}"` : "No papers uploaded yet"}
            </p>
          </div>
        )}

        {/* Papers grouped by category */}
        {!loading && !error && Object.keys(filteredGrouped).length > 0 && (
          <div className="space-y-6">
            {Object.entries(filteredGrouped).map(([categoryName, { color, papers: catPapers }]) => {
              // Group by examName within category
              const byExam = catPapers.reduce((acc, paper) => {
                if (!acc[paper.examName]) acc[paper.examName] = [];
                acc[paper.examName].push(paper);
                return acc;
              }, {});

              return (
                <div key={categoryName}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <h2 className="text-sm font-bold text-gray-800">{categoryName}</h2>
                    <span className="text-xs text-gray-400">
                      {catPapers.length} paper{catPapers.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(byExam).map(([examName, examPapers]) => (
                      <div key={examName} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">

                        {/* Exam header */}
                        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: color }}>
                            {examName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{examName}</p>
                            <p className="text-[10px] text-gray-400">
                              {examPapers.length} paper{examPapers.length !== 1 ? "s" : ""} available
                            </p>
                          </div>
                        </div>

                        {/* Paper rows */}
                        <div className="divide-y divide-gray-50">
                          {examPapers.map(paper => (
                            <div key={paper.id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors group">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">
                                  {paper.year}
                                  {paper.shift   ? <span className="text-gray-400"> · {paper.shift}</span>   : ""}
                                  {paper.subject ? <span className="text-gray-400"> · {paper.subject}</span> : ""}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {paper.language && <span className="text-[10px] text-gray-400">{paper.language}</span>}
                                  {paper.downloads > 0 && (
                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                      <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                                      {paper.downloads >= 1000
                                        ? `${(paper.downloads / 1000).toFixed(1)}k`
                                        : paper.downloads}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={e => toggleBookmark(paper.id, e)}
                                  className="p-1 rounded-md hover:bg-gray-100 transition-colors" title="Bookmark">
                                  {bookmarks.includes(paper.id)
                                    ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                                    : <Bookmark className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400" />}
                                </button>
                                <button onClick={e => handleShare(paper, e)}
                                  className="p-1 rounded-md hover:bg-gray-100 transition-colors" title="Share">
                                  <Share2 className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400" />
                                </button>
                                <button onClick={() => openModal(paper)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white rounded-lg hover:opacity-90 ml-1"
                                  style={{ backgroundColor: color }}>
                                  <Download className="w-3 h-3" />PDF
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Find coaching CTA */}
                        <Link href={`/centers?q=${encodeURIComponent(examName)}`}
                          className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100 hover:bg-gray-100 transition-colors">
                          <span className="text-[11px] text-blue-600 font-medium">
                            Find {examName} coaching near you
                          </span>
                          <ChevronRight className="w-3 h-3 text-blue-400" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DownloadModal
        paper={modalPaper}
        onConfirm={handleConfirmDownload}
        onClose={() => setModalPaper(null)}
        downloading={downloading}
      />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}