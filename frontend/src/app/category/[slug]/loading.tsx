export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-72 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
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
  );
}
