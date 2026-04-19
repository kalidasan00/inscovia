// frontend/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

// ✅ Which admin routes require which permission
const ADMIN_ROUTE_PERMISSIONS = {
  "/admin/dashboard":     "dashboard:read",
  "/admin/analytics":     "analytics:read",
  "/admin/papers":        "papers:read",
  "/admin/institutes":    "institutes:read",
  "/admin/centers":       "centers:read",
  "/admin/users":         "users:read",
  "/admin/notifications": "notifications:read",
  "/admin/blog":          "blog:read",
  "/admin/study-abroad":  "study-abroad:read",
  "/admin/aptitude":      "aptitude:read",
  "/admin/banners":       "banners:read",
  "/admin/admins":        null, // SUPER_ADMIN only — checked separately
};

function getRequiredPermission(pathname) {
  const match = Object.keys(ADMIN_ROUTE_PERMISSIONS).find(route =>
    pathname === route || pathname.startsWith(route + "/")
  );
  return match ? ADMIN_ROUTE_PERMISSIONS[match] : undefined;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ── Only handle /admin/* routes (skip /admin/login) ──
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ── Get token from cookie or Authorization header ──
  const token =
    req.cookies.get("adminToken")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // ── Must be ADMIN role ──
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const isSuperAdmin = payload.adminRole === "SUPER_ADMIN";
    const permissions = payload.permissions || [];

    // ── /admin/admins — SUPER_ADMIN only ──
    if (pathname.startsWith("/admin/admins") && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
    }

    // ── Check permission for this route ──
    if (!isSuperAdmin) {
      const required = getRequiredPermission(pathname);

      if (required === undefined) {
        // Unknown admin route — block by default
        return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
      }

      if (required !== null) {
        // write permission also grants read access
        const hasRead = permissions.includes(required);
        const hasWrite = permissions.includes(required.replace(":read", ":write"));

        if (!hasRead && !hasWrite) {
          return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
        }
      }
    }

    // ── Pass permissions in headers to page ──
    const res = NextResponse.next();
    res.headers.set("x-admin-role", payload.adminRole || "ADMIN");
    res.headers.set("x-admin-permissions", JSON.stringify(permissions));
    return res;

  } catch {
    // Token invalid or expired
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};