export default function StudentApplications() {
  return (
    <main className="min-h-screen bg-[#0c0b10] p-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">Applications</h1>
        <p className="text-white/50 mt-2">View your submitted applications and approval status.</p>
      </header>
      <section aria-label="Your applications" className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
          <h2 className="font-bold text-white tracking-tighter">Mobile UI Redesign</h2>
          <p className="text-sm text-white/50 mt-2">Submitted to Dorji Labs. Awaiting founder review.</p>
          <span className="inline-block mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300">In Progress</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
          <h2 className="font-bold text-white tracking-tighter">API Integration</h2>
          <p className="text-sm text-white/50 mt-2">Submitted to Thimphu Tech. In the review stage.</p>
          <span className="inline-block mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-400/10 text-blue-300">Review</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
          <h2 className="font-bold text-white tracking-tighter">Data Visualization</h2>
          <p className="text-sm text-white/50 mt-2">Accepted by Green Valley. Work delivered and paid.</p>
          <span className="inline-block mt-4 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300">Completed</span>
        </div>
      </section>
    </main>
  );
}
