// frontend/app/feed/lib/feedUtils.js

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
export const MAX_CHARS = 500;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken") || sessionStorage.getItem("userToken") || null;
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}