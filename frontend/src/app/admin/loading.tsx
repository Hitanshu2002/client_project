export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-48" />
        </div>
        <div className="h-10 bg-gray-200 rounded-2xl w-40" />
      </div>
      <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 p-4">
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center p-4 border-t border-gray-50 space-x-4">
            <div className="h-12 w-10 rounded-lg bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-48" />
              <div className="h-3 bg-gray-50 rounded w-32" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
