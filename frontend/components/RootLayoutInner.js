// components/RootLayoutInner.js
"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import LoginPromptModal from "./LoginPromptModal";

export default function RootLayoutInner({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <BottomNav />}
      {/* ✅ ADDED: login prompt modal — shows globally, handles its own logic */}
      {!isAdmin && <LoginPromptModal />}
    </>
  );
}