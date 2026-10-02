export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery skeleton */}
        <div className="space-y-3">
          <div className="aspect-[3/4] rounded-2xl bg-gray-100" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
        {/* Details skeleton */}
        <div className="space-y-4">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="h-20 bg-gray-100 rounded w-full" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
