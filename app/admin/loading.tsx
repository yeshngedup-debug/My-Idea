export default function AdminLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading admin workspace">
      <div className="h-36 rounded-2xl border border-[#17352b]/10 bg-[#17352b]" />
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#17352b]/10 bg-[#17352b]/10 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[#fffefa]" />
        ))}
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-[#ded8cb] bg-[#fffefa]" />
        ))}
      </div>
      <span className="text-xs text-[#657069]">Loading</span>
    </div>
  );
}
