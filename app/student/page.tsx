import Link from 'next/link';
import { User, BookOpen, FileText, PlusCircle } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <main className="min-h-screen bg-[#0c0b10]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 p-6 z-40">
        <div className="flex items-center gap-2 mb-10">
          <span className="font-extrabold text-xl text-white tracking-tighter">Student</span>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/student" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]">
            <BookOpen className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/student/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]">
            <FileText className="w-4 h-4" /> Projects
          </Link>
          <Link href="/student/applications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]">
            <PlusCircle className="w-4 h-4" /> Applications
          </Link>
          <Link href="/student/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]">
            <User className="w-4 h-4" /> Profile
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="ml-72 p-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">Welcome back, Tashi</h1>
          <p className="text-white/50 mt-1">Here's what's happening with your projects.</p>
        </header>
        <section aria-label="Key stats" className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Active Projects", value: "2", label: "In progress" },
            { title: "Completed", value: "8", label: "Total delivered" },
            { title: "Total Earned", value: "Nu. 18,000", label: "Lifetime earnings" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
              <h3 className="text-white/40 text-sm mb-1">{stat.title}</h3>
              <div className="text-4xl font-extrabold text-white tracking-tighter">{stat.value}</div>
              <div className="text-amber-400 text-xs mt-2">{stat.label}</div>
            </div>
          ))}
        </section>
        <section aria-label="Your projects" className="bg-[#13111a] border border-white/10 rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold text-white tracking-tighter">Your Projects</h2>
            <Link href="/student/projects" className="text-sm font-medium text-amber-400 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10] rounded-full">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th scope="col" className="text-left px-6 py-3 font-semibold">Project</th>
                <th scope="col" className="text-left px-6 py-3 font-semibold">Founder</th>
                <th scope="col" className="text-left px-6 py-3 font-semibold">Status</th>
                <th scope="col" className="text-left px-6 py-3 font-semibold">Timeline</th>
                <th scope="col" className="text-left px-6 py-3 font-semibold">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: "Mobile UI Redesign", founder: "Dorji Labs", status: "In Progress", timeline: "2 weeks", budget: "Nu. 5,000" },
                { name: "API Integration", founder: "Thimphu Tech", status: "Review", timeline: "1 week", budget: "Nu. 2,500" },
                { name: "Data Visualization", founder: "Green Valley", status: "Completed", timeline: "3 weeks", budget: "Nu. 7,000" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-6 py-4 text-white/50">{row.founder}</td>
                  <td className="px-6 py-4"><span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${row.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-300' : row.status === 'In Progress' ? 'bg-amber-400/10 text-amber-300' : 'bg-blue-400/10 text-blue-300'}`}>{row.status}</span></td>
                  <td className="px-6 py-4 text-white/50">{row.timeline}</td>
                  <td className="px-6 py-4 font-medium text-white">{row.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
