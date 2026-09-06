// app/colleges/[slug]/page.jsx
import CollegeDetailClient from "./college-detail-client";
import Footer from "../../../components/Footer";

export default function CollegeDetailPage() {
  return (
    <>
      <CollegeDetailClient />
      <Footer />
    </>
  );
}