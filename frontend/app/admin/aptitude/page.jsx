"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, Trash2, LogOut, Menu, X,
  Home, Building2, Users, MessageSquare, FileText,
  Plus, AlertCircle, Edit2, Check, ChevronDown
} from "lucide-react";

const TOPICS = ["Quantitative", "Logical", "Verbal"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const SUBTOPICS = {
  Quantitative: ["Percentage", "Profit & Loss", "Time & Work", "Speed & Distance", "Number Series", "Simple & Compound Interest", "Average", "HCF & LCM", "Mensuration", "Ratio & Proportion", "Probability", "Permutation & Combination", "Squares & Roots", "Mixture & Alligation", "Number System"],
  Logical: ["Blood Relations", "Coding-Decoding", "Seating Arrangement", "Syllogism", "Ranking & Order", "Direction Sense", "Odd One Out", "Analogy", "Calendar"],
  Verbal: ["Synonyms & Antonyms", "Fill in the Blanks", "Grammar"],
};

const emptyForm = {
  question: "", optionA: "", optionB: "", optionC: "", optionD: "",
  answer: "A", explanation: "", topic: "Quantitative",
  subtopic: "Percentage", difficulty: "EASY"
};

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { id: "papers", label: "Question Papers", icon: FileText, href: "/admin/papers" },
  { id: "aptitude", label: "Aptitude Questions", icon: Brain, href: "/admin/aptitude" },
  { id: "institutes", label: "Institutes", icon: Building2, href: "/admin/institutes" },
  { id: "centers", label: "Centers", icon: Building2, href: "/admin/centers" },
  { id: "users", label: "Users", icon: Users, href: "/admin/users" },
  { id: "reviews", label: "Reviews", icon: MessageSquare, href: "/admin/reviews" },
];

export default function AdminAptitude() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterTopic, setFilterTopic] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterSubtopic, setFilterSubtopic] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { router.push("/admin/login"); return; }
    fetchQuestions(token);
  }, []);

  const fetchQuestions = async (token) => {
    setLoading(true);
    try {
      const t = token || localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/aptitude/questions?limit=1000`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const token = localStorage.getItem("adminToken");
    try {
      const url = editingId
        ? `${API_URL}/aptitude/questions/${editingId}`
        : `${API_URL}/aptitude/questions`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSuccess(editingId ? "Question updated!" : "Question added!");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q) => {
    setForm({
      question: q.question, optionA: q.optionA, optionB: q.optionB,
      optionC: q.optionC, optionD: q.optionD, answer: q.answer,
      explanation: q.explanation, topic: q.topic, subtopic: q.subtopic,
      difficulty: q.difficulty
    });
    setEditingId(q.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this question? Cannot be undone.")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_URL}/aptitude/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      setSuccess("Question deleted!");
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (id) => {
    const token = localStorage.getItem("adminToken");
    try {
      await fetch(`${API_URL}/aptitude/questions/${id}/toggle`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions();
    } catch (err) {
      setError("Failed to toggle");
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // Filter
  const filtered = questions.filter(q => {
    if (filterTopic !== "All" && q.topic !== filterTopic) return false;
    if (filterDifficulty !== "All" && q.difficulty !== filterDifficulty) return false;
    if (filterSubtopic !== "All" && q.subtopic !== filterSubtopic) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const diffColor = { EASY: "bg-green-100 text-green-700", MEDIUM: "bg-yellow-100 text-yellow-700", HARD: "bg-red-100 text-red-700" };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-bold text-gray-900">Inscovia Admin</h1>
            </div>
            <button onClick={() => { localStorage.removeItem("adminToken"); router.push("/admin/login"); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "aptitude";
              return (
                <a key={item.id} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-accent text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Aptitude Questions</h2>
              <p className="text-sm text-gray-500 mt-1">{questions.length} questions total</p>
            </div>
            <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
              <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center justify-between">
              {success}<button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? "Edit Question" : "Add New Question"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Topic / Subtopic / Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                    <select value={form.topic}
                      onChange={e => setForm({ ...form, topic: e.target.value, subtopic: SUBTOPICS[e.target.value][0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                      {TOPICS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic *</label>
                    <select value={form.subtopic} onChange={e => setForm({ ...form, subtopic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                      {SUBTOPICS[form.topic]?.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                      {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                  <textarea rows={3} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
                    placeholder="Enter the question..." required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["A", "B", "C", "D"].map(opt => (
                    <div key={opt}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option {opt} {form.answer === opt && <span className="text-green-600 text-xs">(Correct)</span>}
                      </label>
                      <div className="flex gap-2">
                        <input type="text" value={form[`option${opt}`]}
                          onChange={e => setForm({ ...form, [`option${opt}`]: e.target.value })}
                          placeholder={`Option ${opt}`} required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                        <button type="button" onClick={() => setForm({ ...form, answer: opt })}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${form.answer === opt ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
                          {form.answer === opt ? <Check className="w-4 h-4" /> : "✓"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Explanation *</label>
                  <textarea rows={2} value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
                    placeholder="Explain the correct answer..." required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Saving...</> : <>{editingId ? "Update" : "Add"} Question</>}
                  </button>
                  <button type="button" onClick={cancelForm}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search questions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <div className="flex flex-wrap gap-2">
              {/* Topic filter */}
              {["All", ...TOPICS].map(t => (
                <button key={t} onClick={() => { setFilterTopic(t); setFilterSubtopic("All"); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterTopic === t ? "bg-accent text-white border-accent" : "bg-white text-gray-600 border-gray-200 hover:border-accent"}`}>
                  {t}
                </button>
              ))}
              <div className="w-px bg-gray-200 mx-1" />
              {/* Difficulty filter */}
              {["All", ...DIFFICULTIES].map(d => (
                <button key={d} onClick={() => { setFilterDifficulty(d); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterDifficulty === d ? "bg-accent text-white border-accent" : "bg-white text-gray-600 border-gray-200 hover:border-accent"}`}>
                  {d === "All" ? "All Levels" : d}
                </button>
              ))}
            </div>
            {/* Subtopic filter when topic selected */}
            {filterTopic !== "All" && (
              <div className="flex flex-wrap gap-2">
                {["All", ...(SUBTOPICS[filterTopic] || [])].map(s => (
                  <button key={s} onClick={() => { setFilterSubtopic(s); setPage(1); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterSubtopic === s ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200"}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">Showing {filtered.length} of {questions.length} questions</p>
          </div>

          {/* Questions Table */}
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-accent border-t-transparent mx-auto" /></div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No questions found</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-accent font-medium text-sm">Add first question →</button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Question</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Topic</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Answer</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Difficulty</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((q, i) => (
                      <tr key={q.id} className={`hover:bg-gray-50 ${!q.isActive ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900 line-clamp-2 text-sm">{q.question}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{q.subtopic}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">{q.topic}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold">{q.answer}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(q)} title="Edit"
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(q.id)} title="Delete"
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                  <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}