// app/notifications/page.js
"use client";
import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const TYPE_CONFIG = {
  INFO:    { icon: Info,          bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700" },
  SUCCESS: { icon: CheckCircle,   bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700" },
  WARNING: { icon: AlertTriangle, bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
  ALERT:   { icon: AlertCircle,   bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const router = useRouter();

  // Detect who is logged in and return token + API path
  const getAuth = () => {
    const isInstitute = localStorage.getItem("instituteLoggedIn") === "true";
    const isUser = localStorage.getItem("userLoggedIn") === "true";

    if (isInstitute) {
      return {
        token: localStorage.getItem("instituteToken"),
        base: `${API_URL}/auth/notifications`
      };
    }
    if (isUser) {
      return {
        token: localStorage.getItem("userToken"),
        base: `${API_URL}/user/notifications`
      };
    }
    return null;
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/user-menu"); return; }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      if (!auth) return;
      const res = await fetch(auth.base, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const auth = getAuth();
      if (!auth) return;
      await fetch(`${auth.base}/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const auth = getAuth();
      if (!auth) return;
      await fetch(`${auth.base}/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" /> Notifications
            </h1>
            {unreadCount > 0 && <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <CheckCheck className="w-4 h-4" />
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We'll notify you about important updates here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
              const Icon = config.icon;
              return (
                <div key={n.id}
                  className={`relative rounded-xl border p-4 transition-all ${n.isRead ? "bg-white border-gray-200" : `${config.bg} ${config.border}`}`}>
                  {!n.isRead && <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${n.isRead ? "bg-gray-100" : config.bg}`}>
                      <Icon className={`w-4 h-4 ${n.isRead ? "text-gray-400" : config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className={`font-semibold text-sm ${n.isRead ? "text-gray-700" : "text-gray-900"}`}>{n.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>{n.type}</span>
                      </div>
                      <p className={`text-sm ${n.isRead ? "text-gray-400" : "text-gray-600"}`}>{n.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                        {!n.isRead && (
                          <button onClick={() => markRead(n.id)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <Check className="w-3 h-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
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