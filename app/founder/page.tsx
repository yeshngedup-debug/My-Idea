import Link from 'next/link';
import { Building2, Search, HeartHandshake, PlusCircle } from 'lucide-react';

export default function FounderDashboard() {
  return (
    <main className="min-h-screen bg-[#0c0b10]">
      <aside className="fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 p-6 z-40">
        <div className="flex items-center gap-2 mb-10">
          <span className="font-extrabold text-xl text-white tracking-tighter">Founder</span>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/founder" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><Building2 className="w-4 h-4" /> Dashboard</Link>
          <Link href="/founder/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><PlusCircle className="w-4 h-4" /> Projects</Link>
          <Link href="/founder/browse-students" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><Search className="w-4 h-4" /> Browse Students</Link>
          <Link href="/founder/shortlists" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><HeartHandshake className="w-4 h-4" /> Shortlists</Link>
        </nav>
      </aside>
      <div className="ml-72 p-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">Founder Dashboard</h1>
          <p className="text-white/50 mt-1">Manage your projects, find students, and build your team.</p>
        </header>
        <section aria-label="Key stats" className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Active Projects", value: "3", label: "Open for applications" },
            { title: "Students Shortlisted", value: "12", label: "Ready to hire" },
            { title: "Completed", value: "5", label: "Projects delivered" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
              <h3 className="text-white/40 text-sm mb-1">{stat.title}</h3>
              <div className="text-4xl font-extrabold text-white tracking-tighter">{stat.value}</div>
              <div className="text-amber-400 text-xs mt-2">{stat.label}</div>
            </div>
          ))}
        </section>
        <section aria-label="Quick actions" className="bg-white/[0.04] border border-white/10 rounded-3xl p-8">
          <h2 className="font-bold text-white tracking-tighter mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/founder/projects/post" className="block bg-amber-400 hover:bg-amber-300 rounded-xl p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]">
              <h3 className="font-bold text-black">Post a new project</h3>
              <p className="text-sm text-black/70 mt-1">Define requirements, budget, and timeline for student applications.</p>
            </Link>
            <Link href="/founder/browse-students" className="block bg-[#13111a] hover:bg-white/[0.06] rounded-xl p-6 border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]">
              <h3 className="font-bold text-white">Browse students</h3>
              <p className="text-sm text-white/50 mt-1">Search by skills, college, and availability.</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
