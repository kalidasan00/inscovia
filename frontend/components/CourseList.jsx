// components/CourseList.jsx
"use client";
import { useState, useEffect } from "react";
import { IndianRupee, Clock } from "lucide-react";

const formatCategory = (category) =>
  category?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "";

// ✅ School Tuition — special display using courseDetails JSON object
function SchoolTuitionDetails({ center }) {
  const meta = center?.courseDetails && !Array.isArray(center.courseDetails)
    ? center.courseDetails
    : null;

  const boards   = meta?.boards   || [];
  const classes  = meta?.classes  || [];
  const subjects = meta?.subjects || [];
  const programs = meta?.specialPrograms || center?.services || [];
  const studentsCount = meta?.studentsCount;
  const batchSize     = meta?.batchSize;
  const feeRange      = meta?.feeRange;

  if (!boards.length && !classes.length && !subjects.length && !programs.length) return null;

  return (
    <div className="mb-3 space-y-4">
      <h2 className="text-sm font-bold text-gray-900">Classes & Subjects</h2>

      {/* Stats */}
      {(studentsCount || batchSize || feeRange) && (
        <div className="grid grid-cols-3 gap-2">
          {studentsCount && (
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <p className="text-base font-bold text-blue-700">{studentsCount}+</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          )}
          {batchSize && (
            <div className="text-center p-2 bg-indigo-50 rounded-lg">
              <p className="text-base font-bold text-indigo-700">{batchSize}</p>
              <p className="text-xs text-gray-500">Batch Size</p>
            </div>
          )}
          {feeRange && (
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-base font-bold text-green-700">{feeRange}</p>
              <p className="text-xs text-gray-500">Monthly Fee</p>
            </div>
          )}
        </div>
      )}

      {/* Boards */}
      {boards.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Boards</p>
          <div className="flex flex-wrap gap-1.5">
            {boards.map((b, i) => (
              <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Classes */}
      {classes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Classes</p>
          <div className="flex flex-wrap gap-1.5">
            {classes.map((c, i) => (
              <span key={i} className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Subjects */}
      {subjects.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Subjects</p>
          <div className="grid grid-cols-2 gap-1.5">
            {subjects.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <svg className="w-3 h-3 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-700">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Programs */}
      {programs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Special Programs & Services</p>
          <div className="grid grid-cols-2 gap-1.5">
            {programs.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <svg className="w-3 h-3 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-700">{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ All valid schema enum categories
const ALL_CATEGORIES = [
  "SCHOOL_TUITION", "STUDY_ABROAD", "LANGUAGES",
  "IT_TECHNOLOGY", "DESIGN_CREATIVE", "MANAGEMENT",
  "SKILL_DEVELOPMENT", "EXAM_COACHING"
];

export default function CourseList({ center }) {
  const [activeTab, setActiveTab] = useState(null);

  // School tuition uses special component
  if (center?.primaryCategory === "SCHOOL_TUITION") {
    return <SchoolTuitionDetails center={center} />;
  }

  const getCoursesByCategory = () => {
    const map = {};
    ALL_CATEGORIES.forEach(cat => { map[cat] = []; });

    if (center?.courseDetails && Array.isArray(center.courseDetails) && center.courseDetails.length > 0) {
      center.courseDetails.forEach(course => {
        const cat = course.category || center.primaryCategory;
        if (map[cat]) map[cat].push(course);
      });
      return map;
    }

    if (!center?.courses || center.courses.length === 0) return map;

    center.courses.forEach(course => {
      if (course.includes(":")) {
        const [cat, name] = course.split(":").map(s => s.trim());
        if (map[cat]) map[cat].push({ name, category: cat });
      } else {
        const cat = center.primaryCategory;
        if (cat && map[cat]) map[cat].push({ name: course, category: cat });
      }
    });

    return map;
  };

  const coursesByCategory = getCoursesByCategory();

  const categoriesWithCourses = [
    center?.primaryCategory,
    ...(center?.secondaryCategories || [])
  ].filter(cat => cat && coursesByCategory[cat]?.length > 0);

  useEffect(() => {
    if (categoriesWithCourses.length > 0 && !activeTab) {
      setActiveTab(categoriesWithCourses[0]);
    }
  }, [categoriesWithCourses.join(",")]);

  if (categoriesWithCourses.length === 0) return null;

  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Courses Offered</h2>

      {categoriesWithCourses.length > 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {categoriesWithCourses.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === cat ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {formatCategory(cat)} ({coursesByCategory[cat].length})
            </button>
          ))}
        </div>
      )}

      {activeTab && coursesByCategory[activeTab] && (
        <div className="grid grid-cols-1 gap-3">
          {coursesByCategory[activeTab].map((course, i) => {
            const hasFees = course.fees != null;
            const hasDuration = course.duration != null;

            return (
              <div key={i}
                className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <svg className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                      {formatCategory(course.category)}
                    </span>
                  </div>
                </div>

                {(hasFees || hasDuration) && (
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                    {hasFees && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <IndianRupee className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Course Fee</p>
                          <p className="text-sm font-bold text-green-700">₹{course.fees.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    )}
                    {hasDuration && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Duration</p>
                          <p className="text-sm font-semibold text-gray-900">{course.duration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}