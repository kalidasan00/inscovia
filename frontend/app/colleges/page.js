// app/colleges/page.jsx
import { Suspense } from "react";
import CollegesClient from "./colleges-client";
import Footer from "../../components/Footer";

export default function CollegesPage() {
  return (
    <>
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">Loading colleges...</div>}>
        <CollegesClient />
      </Suspense>
      <Footer />
    </>
  );
}