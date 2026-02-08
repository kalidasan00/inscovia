// app/components/DynamicLoader.jsx - CODE SPLITTING HELPER
"use client";
import dynamic from 'next/dynamic';

// ✅ Lazy load heavy components (only load when needed)

// Reviews Section (only load when visible)
export const ReviewSection = dynamic(
  () => import('./ReviewSection'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: false, // Don't render on server (faster initial load)
  }
);

// Course List (can be lazy loaded)
export const CourseList = dynamic(
  () => import('./CourseList'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  }
);

// Map Component (heavy - only load when needed)
export const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    loading: () => (
      <div className="animate-pulse h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
    ssr: false,
  }
);

// Chart Component (heavy libraries)
export const ChartComponent = dynamic(
  () => import('./ChartComponent'),
  {
    loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse"></div>,
    ssr: false,
  }
);

// ✅ USAGE:
// Instead of:
// import ReviewSection from './ReviewSection';

// Use:
// import { ReviewSection } from './DynamicLoader';
// Component loads only when user scrolls to it!