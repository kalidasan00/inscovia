// app/admin/layout.js
"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, FileText, Building2, Users, BarChart3,
  Bell, LogOut, Menu, X, Shield, BookOpen,
  Globe, Target, Image
} from "lucide-react";

// ✅ Full menu — filtered by permissions at runtime
const ALL_MENU_ITEMS = [
  { id: "dashboard",     label: "Dashboard",       icon: Home,      href: "/admin/dashboard",     permission: "dashboard:read" },
  { id: "analytics",     label: "Analytics",        icon: BarChart3, href: "/admin/analytics",     permission: "analytics:read" },
  { id: "papers",        label: "Question Papers",  icon: FileText,  href: "/admin/papers",        permission: "papers:read" },
  { id: "institutes",    label: "Institutes",        icon: Building2, href: "/admin/institutes",    permission: "institutes:read" },
  { id: "centers",       label: "Centers",           icon: Building2, href: "/admin/centers",       permission: "centers:read" },
  { id: "users",         label: "Users",             icon: Users,     href: "/admin/users",         permission: "users:read" },
  { id: "notifications", label: "Notifications",     icon: Bell,      href: "/admin/notifications", permission: "notifications:read" },
  { id: "blog",          label: "Blog",              icon: BookOpen,  href: "/admin/blog",          permission: "blog:read" },
  { id: "study-abroad",  label: "Study Abroad",      icon: Globe,     href: "/admin/study-abroad",  permission: "study-abroad:read" },
  { id: "aptitude",      label: "Aptitude",          icon: Target,    href: "/admin/aptitude",      permission: "aptitude:read" },
  { id: "banners",       label: "Banners",           icon: Image,     href: "/admin/banners",       permission: "banners:read" },
  // ✅ Only visible to SUPER_ADMIN
  { id: "admins",        label: "Manage Admins",     icon: Shield,    href: "/admin/admins",        permission: null },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Skip layout rendering on login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("adminToken");
    const info = localStorage.getItem("adminInfo");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (info) {
      try {
        setAdminInfo(JSON.parse(info));
      } catch { }
    }
  }, [isLoginPage, router]);

  // ✅ Filter sidebar items by permissions
  const visibleMenuItems = useMemo(() => {
    if (!adminInfo) return [];
    const isSuperAdmin = adminInfo.adminRole === "SUPER_ADMIN";
    const permissions = adminInfo.permissions || [];

    return ALL_MENU_ITEMS.filter(item => {
      // SUPER_ADMIN sees everything
      if (isSuperAdmin) return true;
      // null permission = SUPER_ADMIN only
      if (item.permission === null) return false;
      // Check read or write permission
      return (
        permissions.includes(item.permission) ||
        permissions.includes(item.permission.replace(":read", ":write"))
      );
    });
  }, [adminInfo]);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    // ✅ Clear cookie too
    document.cookie = "adminToken=; path=/; max-age=0";
    router.push("/admin/login");
  };

  // ✅ Login page renders without layout chrome
  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="text-xl font-bold text-gray-900">Inscovia Admin</span>
              {/* ✅ Show admin role badge */}
              {adminInfo?.adminRole === "SUPER_ADMIN" && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                  <Shield className="w-3 h-3" /> Super Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {adminInfo && (
                <span className="hidden md:block text-sm text-gray-600 truncate max-w-[160px]">
                  {adminInfo.name || adminInfo.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 z-40 overflow-y-auto
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <nav className="p-4 space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm
                    ${isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}