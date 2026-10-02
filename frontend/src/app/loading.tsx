export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-16 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="rounded-3xl bg-gray-100 h-[520px] my-4" />

      {/* Category Section Skeleton */}
      <div className="space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-7 bg-gray-200 rounded w-64" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Products Section Skeleton */}
      <div className="space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-7 bg-gray-200 rounded w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-5 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
