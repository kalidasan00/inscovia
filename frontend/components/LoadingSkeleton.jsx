// frontend/components/LoadingSkeleton.jsx - BEAUTIFUL LOADING STATES
export function CenterCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden animate-pulse">
      {/* Cover image skeleton */}
      <div className="h-32 sm:h-40 bg-gray-200"></div>

      <div className="pt-12 px-3 sm:px-4 pb-4">
        {/* Logo skeleton */}
        <div className="absolute -top-10 left-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-xl"></div>
        </div>

        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

        {/* Location skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>

        {/* Tags skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export function CenterListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CenterCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CenterDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-6 animate-pulse">
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        {/* Cover skeleton */}
        <div className="h-32 sm:h-40 bg-gray-200"></div>

        <div className="pt-12 px-3 sm:px-4 pb-4">
          {/* Title */}
          <div className="h-7 bg-gray-200 rounded w-2/3 mb-3"></div>

          {/* Tags */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div className="aspect-square bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ✅ USAGE:
// import { CenterListSkeleton, CenterDetailSkeleton } from './LoadingSkeleton';
//
// if (loading) return <CenterListSkeleton count={6} />;