"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe, ChevronDown, Star } from "lucide-react";

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const LinkedInIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const YoutubeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const WhatsAppIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const collegesData = {
  "iit-madras": {
    name: "Indian Institute of Technology (IIT) Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "Institute",
    ownership: "Government",
    tags: ["ENGINEERING", "RESEARCH"],
    mode: "OFFLINE",
    rating: 4.7,
    established: 1959,
    affiliatedUniversity: "Autonomous (Institute of National Importance)",
    website: "https://www.iitm.ac.in",
    phone: "+914422578000",
    whatsapp: "9876543210",
    email: "contact@iitm.ac.in",
    facebook: "https://facebook.com/iitmadras",
    instagram: "https://instagram.com/iitmadras",
    linkedin: "https://linkedin.com/school/iit-madras",
    youtube: "https://youtube.com/iitmadras",
    description:
      "IIT Madras is one of India's premier engineering institutions, known for cutting-edge research, strong industry partnerships, and a highly selective undergraduate and postgraduate program across engineering, sciences, and humanities. The institute has consistently ranked as the top engineering college in India and hosts one of the largest startup incubation programs among Indian academic institutions.",
    courses: [
      { name: "B.Tech Computer Science", duration: "4 Years", fee: "₹2,00,000/year" },
      { name: "M.Tech Data Science", duration: "2 Years", fee: "₹1,00,000/year" },
    ],
    placements: { placementPercentage: 96, averagePackage: "₹21.5 LPA", highestPackage: "₹1.68 Cr" },
    gallery: [],
  },
  "nit-calicut": {
    name: "National Institute of Technology (NIT) Calicut",
    city: "Kozhikode",
    state: "Kerala",
    type: "Institute",
    ownership: "Government",
    tags: ["ENGINEERING", "TECHNOLOGY"],
    mode: "OFFLINE",
    rating: 4.4,
    established: 1961,
    affiliatedUniversity: "Autonomous (Institute of National Importance)",
    website: "https://www.nitc.ac.in",
    phone: "+914952286100",
    whatsapp: "9876543211",
    email: "contact@nitc.ac.in",
    facebook: "https://facebook.com/nitcalicut",
    instagram: "https://instagram.com/nitcalicut",
    linkedin: "https://linkedin.com/school/nit-calicut",
    youtube: "https://youtube.com/nitcalicut",
    description:
      "NIT Calicut is a top-ranked National Institute of Technology offering undergraduate, postgraduate, and doctoral programs in engineering and architecture, with strong placement records and research output across core and emerging disciplines.",
    courses: [{ name: "B.Tech Electronics and Communication", duration: "4 Years", fee: "₹1,45,000/year" }],
    placements: { placementPercentage: 90, averagePackage: "₹14 LPA", highestPackage: "₹52 LPA" },
    gallery: [],
  },
  "cusat": {
    name: "Cochin University of Science and Technology (CUSAT)",
    city: "Kochi",
    state: "Kerala",
    type: "University",
    ownership: "Government",
    tags: ["SCIENCE", "LAW"],
    mode: "OFFLINE",
    rating: 4.1,
    established: 1971,
    affiliatedUniversity: "Self-affiliating State University",
    website: "https://www.cusat.ac.in",
    phone: "+914842575000",
    whatsapp: "9876543212",
    email: "contact@cusat.ac.in",
    facebook: "https://facebook.com/cusatofficial",
    instagram: "https://instagram.com/cusatofficial",
    linkedin: "https://linkedin.com/school/cusat",
    youtube: "https://youtube.com/cusatofficial",
    description:
      "CUSAT is a state university offering a wide range of programs in science, engineering, law, and management, known for its strong research culture and industry-linked curriculum spread across its Kalamassery campus.",
    courses: [
      { name: "B.Tech Computer Science", duration: "4 Years", fee: "₹90,000/year" },
      { name: "LLB", duration: "3 Years", fee: "₹40,000/year" },
    ],
    placements: { placementPercentage: 82, averagePackage: "₹8.5 LPA", highestPackage: "₹28 LPA" },
    gallery: [],
  },
  "st-aloysius": {
    name: "St. Aloysius College (Deemed to be University)",
    city: "Mangaluru",
    state: "Karnataka",
    type: "University",
    ownership: "Private",
    tags: ["DATA SCIENCE", "MANAGEMENT"],
    mode: "OFFLINE",
    rating: 4.3,
    established: 1880,
    affiliatedUniversity: "Deemed to be University",
    website: "https://www.staloysius.edu.in",
    phone: "+918242449700",
    whatsapp: "9876543213",
    email: "contact@staloysius.edu.in",
    facebook: "https://facebook.com/staloysiuscollege",
    instagram: "https://instagram.com/staloysiuscollege",
    linkedin: "https://linkedin.com/school/st-aloysius-college",
    youtube: "https://youtube.com/staloysiuscollege",
    description:
      "St. Aloysius College is a reputed deemed university offering undergraduate and postgraduate programs including Data Science, Management, and Arts, with a strong focus on research and holistic education and one of the oldest institutions on the west coast of India.",
    courses: [{ name: "MSc Data Science", duration: "2 Years", fee: "₹75,000/year" }],
    placements: { placementPercentage: 78, averagePackage: "₹6.2 LPA", highestPackage: "₹18 LPA" },
    gallery: [],
  },
  "iim-kozhikode": {
    name: "Indian Institute of Management (IIM) Kozhikode",
    city: "Kozhikode",
    state: "Kerala",
    type: "Institute",
    ownership: "Government",
    tags: ["MANAGEMENT", "MBA"],
    mode: "OFFLINE",
    rating: 4.6,
    established: 1996,
    affiliatedUniversity: "Autonomous (Institute of National Importance)",
    website: "https://www.iimk.ac.in",
    phone: "+14954012805",
    whatsapp: "9876543214",
    email: "contact@iimk.ac.in",
    facebook: "https://facebook.com/iimkofficial",
    instagram: "https://instagram.com/iimkofficial",
    linkedin: "https://linkedin.com/school/iim-kozhikode",
    youtube: "https://youtube.com/iimkofficial",
    description:
      "IIM Kozhikode is a leading management institute offering full-time MBA, executive MBA, and doctoral programs, recognized for its academic rigor and strong corporate connections, consistently ranking among the top management schools in India.",
    courses: [{ name: "MBA", duration: "2 Years", fee: "₹11,00,000 (total)" }],
    placements: { placementPercentage: 100, averagePackage: "₹26 LPA", highestPackage: "₹75 LPA" },
    gallery: [],
  },
  "cet-trivandrum": {
    name: "College of Engineering Trivandrum (CET)",
    city: "Thiruvananthapuram",
    state: "Kerala",
    type: "College",
    ownership: "Government",
    tags: ["ENGINEERING", "SKILL DEVELOPMENT"],
    mode: "OFFLINE",
    rating: 4.0,
    established: 1939,
    affiliatedUniversity: "APJ Abdul Kalam Technological University",
    website: "https://www.cet.ac.in",
    phone: "+914712515022",
    whatsapp: "9876543215",
    email: "contact@cet.ac.in",
    facebook: "https://facebook.com/cetofficial",
    instagram: "https://instagram.com/cetofficial",
    linkedin: "https://linkedin.com/school/cet-trivandrum",
    youtube: "https://youtube.com/cetofficial",
    description:
      "CET is one of Kerala's oldest and most respected engineering colleges, offering undergraduate and postgraduate programs across core and emerging engineering disciplines, with a legacy dating back to 1939.",
    courses: [{ name: "B.Tech Mechanical Engineering", duration: "4 Years", fee: "₹45,000/year" }],
    placements: { placementPercentage: 75, averagePackage: "₹5.8 LPA", highestPackage: "₹22 LPA" },
    gallery: [],
  },
};

function formatTag(tag) {
  return tag?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "";
}

export default function CollegeDetailPage({ params }) {
  const college = collegesData[params.slug];
  const [showFullDescription, setShowFullDescription] = useState(false);

  const shouldShowReadMore = useMemo(
    () => college?.description && college.description.length > 150,
    [college]
  );
  const truncatedDescription = useMemo(() => {
    if (!college?.description) return "";
    return college.description.length > 150
      ? college.description.substring(0, 150) + "..."
      : college.description;
  }, [college]);

  const whatsappUrl = useMemo(() => {
    if (!college?.whatsapp) return null;
    const number = college.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi! I found *${college.name}* on Inscovia. I'm interested in your programs. Could you please share more details?`
    );
    return `https://wa.me/${number}?text=${message}`;
  }, [college]);

  if (!college) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">College Not Found</h2>
          <p className="text-gray-600 mb-4">The college you're looking for doesn't exist.</p>
          <Link href="/colleges" className="text-accent hover:text-accent/80">← Back to Colleges</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed z-50 flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95"
          style={{ bottom: "24px", right: "16px", background: "#25D366", borderRadius: "9999px", padding: "12px 16px" }}
          aria-label="Enquire on WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-white text-xs font-semibold whitespace-nowrap">Enquire Now</span>
        </a>
      )}

      <nav className="max-w-5xl mx-auto px-3 sm:px-4 py-2 text-xs border-b bg-gray-50" aria-label="Breadcrumb">
        <p className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span className="mx-1 text-gray-400">/</span>
          <Link href="/colleges" className="hover:text-indigo-600">Colleges</Link>
          <span className="mx-1 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{college.name}</span>
        </p>
      </nav>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-24 md:pb-8">
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-600 to-purple-600">
            <div className="absolute -bottom-10 left-3 z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-6.16-3.42A12.083 12.083 0 006 18.75c0 .966.784 1.75 1.75 1.75h8.5a1.75 1.75 0 001.75-1.75 12.083 12.083 0 00-.84-4.42L12 14z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-12 px-3 sm:px-4 pb-4">
            <div className="mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{college.name}</h1>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{college.city}, {college.state}</span>
                </div>
                {college.rating > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded border border-yellow-200">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-yellow-700">{college.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b">
              {college.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                  {formatTag(tag)}
                </span>
              ))}
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                {college.mode}
              </span>
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                {college.type}
              </span>
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                {college.ownership}
              </span>
            </div>

            {college.placements && (
              <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-700">{college.placements.placementPercentage}%</p>
                  <p className="text-xs text-gray-500">Placement Rate</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-700">{college.placements.averagePackage}</p>
                  <p className="text-xs text-gray-500">Avg Package</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-700">{college.placements.highestPackage}</p>
                  <p className="text-xs text-gray-500">Highest Package</p>
                </div>
              </div>
            )}

            <div className="mb-3">
              <h2 className="text-sm font-bold text-gray-900 mb-1.5">About</h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {showFullDescription || !shouldShowReadMore ? college.description : truncatedDescription}
              </p>
              {shouldShowReadMore && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-1 text-indigo-600 text-xs font-medium flex items-center gap-0.5"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFullDescription ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            <div className="mb-3 pb-3 border-b">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Established</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Year</span>
                  <span className="font-medium text-gray-900">{college.established}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-gray-500">Affiliation</span>
                  <span className="font-medium text-gray-900 text-right">{college.affiliatedUniversity}</span>
                </div>
              </div>
            </div>

            {college.courses?.length > 0 && (
              <div className="mb-3 pb-3 border-b">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Courses</h2>
                <div className="space-y-1.5">
                  {college.courses.map((course, i) => (
                    <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 border rounded-lg">
                      <span className="text-xs text-gray-700 font-medium">{course.name}</span>
                      <span className="text-xs text-gray-500">{course.duration} • {course.fee}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(college.facebook || college.instagram || college.linkedin || college.youtube) && (
              <div className="mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
                  {college.facebook && (
                    <a href={college.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                       className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <FacebookIcon className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {college.instagram && (
                    <a href={college.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                       className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                      <InstagramIcon className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {college.linkedin && (
                    <a href={college.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                       className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                      <LinkedInIcon className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {college.youtube && (
                    <a href={college.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                       className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                      <YoutubeIcon className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mb-3">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Contact</h2>
              <div className="grid grid-cols-2 gap-2">
                {college.phone && (
                  <a href={`tel:${college.phone}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs text-gray-900 font-medium truncate">{college.phone}</p>
                  </a>
                )}
                {college.whatsapp && (
                  <a href={`https://wa.me/${college.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <WhatsAppIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-xs text-gray-900 font-medium truncate">{college.whatsapp}</p>
                  </a>
                )}
                {college.email && (
                  <a href={`mailto:${college.email}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors col-span-2">
                    <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs text-gray-900 font-medium truncate">{college.email}</p>
                  </a>
                )}
                {college.website && (
                  <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors col-span-2">
                    <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs text-indigo-600 font-medium truncate">Visit Website</p>
                  </a>
                )}
              </div>
            </div>

            <div className="pt-3 border-t mt-3">
              <Link href="/colleges" className="inline-flex items-center gap-1 text-indigo-600 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Colleges
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}