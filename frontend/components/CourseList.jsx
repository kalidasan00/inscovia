// components/CourseList.jsx - WITH DEBUG LOGS
"use client";
import { useState, useEffect } from "react";
import { IndianRupee, Clock } from "lucide-react";

export default function CourseList({ center }) {
  const [activeTab, setActiveTab] = useState(null);

  // Debug: Check what we receive
  console.log("🎯 CourseList - center:", center?.name);
  console.log("🎯 CourseList - courseDetails:", center?.courseDetails);

  const getCoursesByCategory = () => {
    const coursesByCategory = {
      TECHNOLOGY: [],
      MANAGEMENT: [],
      SKILL_DEVELOPMENT: [],
      EXAM_COACHING: []
    };

    if (center?.courseDetails && Array.isArray(center.courseDetails) && center.courseDetails.length > 0) {
      console.log("✅ Using courseDetails (new format)");
      center.courseDetails.forEach(course => {
        const category = course.category || center.primaryCategory;
        if (coursesByCategory[category]) {
          coursesByCategory[category].push(course);
        }
      });
      return coursesByCategory;
    }

    console.log("⚠️ Falling back to old courses array");
    if (!center?.courses || center.courses.length === 0) return coursesByCategory;

    center.courses.forEach(course => {
      if (course.includes(':')) {
        const [category, courseName] = course.split(':').map(s => s.trim());
        if (coursesByCategory[category]) {
          coursesByCategory[category].push({
            name: courseName,
            category: category
          });
        }
      } else {
        if (center?.primaryCategory) {
          coursesByCategory[center.primaryCategory].push({
            name: course,
            category: center.primaryCategory
          });
        }
      }
    });

    return coursesByCategory;
  };

  const getCategoriesWithCourses = (coursesByCategory) => {
    const categories = [];
    if (center?.primaryCategory && coursesByCategory[center.primaryCategory]?.length > 0) {
      categories.push(center.primaryCategory);
    }
    center?.secondaryCategories?.forEach(cat => {
      if (coursesByCategory[cat]?.length > 0) {
        categories.push(cat);
      }
    });
    return categories;
  };

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const formatFees = (fees) => {
    if (fees === null || fees === undefined) return null;
    return `₹${fees.toLocaleString('en-IN')}`;
  };

  const coursesByCategory = getCoursesByCategory();
  const categoriesWithCourses = getCategoriesWithCourses(coursesByCategory);

  useEffect(() => {
    if (categoriesWithCourses.length > 0 && !activeTab) {
      setActiveTab(categoriesWithCourses[0]);
    }
  }, [categoriesWithCourses, activeTab]);

  if (categoriesWithCourses.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Courses Offered</h2>

      {/* Category Tabs */}
      {categoriesWithCourses.length > 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {categoriesWithCourses.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formatCategory(cat)} ({coursesByCategory[cat].length})
            </button>
          ))}
        </div>
      )}

      {/* Course Cards */}
      {activeTab && coursesByCategory[activeTab] && (
        <div className="grid grid-cols-1 gap-3">
          {coursesByCategory[activeTab].map((course, i) => {
            // Debug each course
            console.log(`\n📚 Course ${i + 1}: ${course.name}`);
            console.log(`   Raw course object:`, course);
            console.log(`   fees:`, course.fees, `(type: ${typeof course.fees})`);
            console.log(`   duration:`, course.duration, `(type: ${typeof course.duration})`);

            const hasFees = course.fees !== null && course.fees !== undefined;
            const hasDuration = course.duration !== null && course.duration !== undefined;

            console.log(`   hasFees:`, hasFees);
            console.log(`   hasDuration:`, hasDuration);

            return (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-lg transition-all duration-300"
              >
                {/* Course Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <svg
                      className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                        {formatCategory(course.category)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Details - ALWAYS SHOW FOR DEBUGGING */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                  {/* Fees Section - ALWAYS SHOW */}
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Course Fee</p>
                      <p className="text-sm font-bold text-green-700">
                        {hasFees ? formatFees(course.fees) : '❌ Not set'}
                      </p>
                    </div>
                  </div>

                  {/* Duration Section - ALWAYS SHOW */}
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {hasDuration ? course.duration : '❌ Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}