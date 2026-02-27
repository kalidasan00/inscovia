// app/admin/notifications/page.js
"use client";
import { useState, useEffect } from "react";
import { Bell, Send, Trash2, X, Search, ChevronDown, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const TYPE_CONFIG = {
  INFO:    { label: "ℹ️ Info",    style: "bg-blue-50 text-blue-700" },
  SUCCESS: { label: "✅ Success", style: "bg-green-50 text-green-700" },
  WARNING: { label: "⚠️ Warning", style: "bg-yellow-50 text-yellow-700" },
  ALERT:   { label: "🚨 Alert",   style: "bg-red-50 text-red-700" },
};

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <p className="text-gray-800 font-medium mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [instituteSearch, setInstituteSearch] = useState("");
  const [form, setForm] = useState({ title: "", message: "", type: "INFO", instituteId: "", instituteName: "" });

  useEffect(() => {
    fetchNotifications();
    fetchInstitutes();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/institutes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInstitutes(data.institutes || []);
    } catch {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) { setError("Title and message required"); return; }
    setSending(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const body = { title: form.title, message: form.message, type: form.type };
      if (form.instituteId) body.instituteId = form.instituteId;

      const res = await fetch(`${API_URL}/admin/notifications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setForm({ title: "", message: "", type: "INFO", instituteId: "", instituteName: "" });
      fetchNotifications();
    } catch (err) {
      setError(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (n) => {
    setConfirm({
      message: `Delete notification "${n.title}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const token = localStorage.getItem("adminToken");
          await fetch(`${API_URL}/admin/notifications/${n.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          setSuccess("Deleted.");
          fetchNotifications();
        } catch {
          setError("Failed to delete");
        }
      }
    });
  };

  const filteredInstitutes = institutes.filter(i =>
    i.instituteName?.toLowerCase().includes(instituteSearch.toLowerCase()) ||
    i.email?.toLowerCase().includes(instituteSearch.toLowerCase())
  );

  const filteredNotifications = notifications.filter(n =>
    !search ||
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.institute?.instituteName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">Send messages to institutes</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-sm">
          {error}<button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-green-700 text-sm">
          {success}<button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Compose */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" /> Compose Notification
        </h3>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Target dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
              <button type="button" onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                <span className={form.instituteId ? "text-gray-900" : "text-gray-400"}>
                  {form.instituteName || "All Institutes (Broadcast)"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {showDropdown && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input type="text" placeholder="Search institutes..."
                      value={instituteSearch}
                      onChange={e => setInstituteSearch(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    <button type="button"
                      onClick={() => { setForm({ ...form, instituteId: "", instituteName: "" }); setShowDropdown(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 font-medium text-primary border-b border-gray-50">
                      📢 All Institutes (Broadcast)
                    </button>
                    {filteredInstitutes.map(inst => (
                      <button key={inst.id} type="button"
                        onClick={() => { setForm({ ...form, instituteId: inst.id, instituteName: inst.instituteName }); setShowDropdown(false); setInstituteSearch(""); }}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <p className="font-medium text-gray-900">{inst.instituteName}</p>
                        <p className="text-xs text-gray-400">{inst.email}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" placeholder="e.g. Profile Approved, Action Required"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea placeholder="Write your message here..."
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button type="submit" disabled={sending}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {sending
                ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Sending...</>
                : <><Send className="w-4 h-4" />Send</>}
            </button>
            {!form.instituteId && (
              <p className="text-xs text-orange-600 font-medium">⚠️ Broadcasts to ALL institutes</p>
            )}
            {form.instituteId && (
              <p className="text-xs text-gray-500">To: <span className="font-medium">{form.instituteName}</span></p>
            )}
          </div>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-900">Sent History</h3>
          <div className="relative w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map(n => (
              <div key={n.id} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_CONFIG[n.type]?.style}`}>
                      {n.type}
                    </span>
                    {n.isRead
                      ? <span className="text-xs text-gray-400">Read</span>
                      : <span className="text-xs text-blue-600 font-medium">Unread</span>
                    }
                  </div>
                  <p className="text-xs text-gray-500 truncate">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    → {n.institute?.instituteName || "All institutes"} · {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => handleDelete(n)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}