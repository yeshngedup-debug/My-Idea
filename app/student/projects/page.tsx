export default function StudentProjects() {
  return (
    <main className="min-h-screen bg-[#0c0b10] p-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">Available Projects</h1>
        <p className="text-white/50 mt-2">Browse open projects and apply to ones that match your skills.</p>
      </header>
      <section aria-label="Open projects" className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
          <h2 className="font-bold text-white tracking-tighter">Mobile UI Redesign</h2>
          <p className="text-sm text-white/50 mt-2">Redesign the mobile experience for a fintech product.</p>
          <span className="inline-block mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300">Nu. 5,000</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
          <h2 className="font-bold text-white tracking-tighter">API Integration</h2>
          <p className="text-sm text-white/50 mt-2">Connect third-party services into an existing platform.</p>
          <span className="inline-block mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-400/10 text-blue-300">Nu. 2,500</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
          <h2 className="font-bold text-white tracking-tighter">Data Visualization</h2>
          <p className="text-sm text-white/50 mt-2">Build dashboards that make impact metrics easy to read.</p>
          <span className="inline-block mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300">Nu. 7,000</span>
        </div>
      </section>
    </main>
  );
}
