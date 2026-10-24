import Link from 'next/link';
import { ShieldCheck, Users, CreditCard, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#0c0b10]">
      <aside className="fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 p-6 z-40">
        <div className="flex items-center gap-2 mb-10"><span className="font-extrabold text-xl text-white tracking-tighter">Admin</span></div>
        <nav className="flex flex-col gap-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><ShieldCheck className="w-4 h-4" /> Dashboard</Link>
          <Link href="/admin/students" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><Users className="w-4 h-4" /> Students</Link>
          <Link href="/admin/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><BarChart3 className="w-4 h-4" /> Projects</Link>
          <Link href="/admin/payments" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b10]"><CreditCard className="w-4 h-4" /> Payments</Link>
        </nav>
      </aside>
      <div className="ml-72 p-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">Admin Dashboard</h1>
          <p className="text-white/50 mt-1">Oversee platform activity, users, and payments.</p>
        </header>
        <section aria-label="Key stats" className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Total Users", value: "312", label: "Registered" },
            { title: "Active Projects", value: "35", label: "Live" },
            { title: "Payments", value: "Nu. 1.2M", label: "Disbursed" },
            { title: "Revenue", value: "Nu. 340K", label: "Platform" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
              <h3 className="text-white/40 text-sm mb-1">{stat.title}</h3>
              <div className="text-4xl font-extrabold text-white tracking-tighter">{stat.value}</div>
              <div className="text-amber-400 text-xs mt-2">{stat.label}</div>
            </div>
          ))}
        </section>
        <section aria-label="Platform health" className="bg-[#13111a] border border-white/10 rounded-3xl p-8">
          <h2 className="font-bold text-white tracking-tighter mb-4">Platform Health</h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-white/50">
            <div><strong className="text-white">Student Signups:</strong> 214</div>
            <div><strong className="text-white">Founder Signups:</strong> 98</div>
            <div><strong className="text-white">Projects Completed:</strong> 120</div>
            <div><strong className="text-white">Pending Payments:</strong> 8</div>
          </div>
        </section>
      </div>
    </main>
  );
}
