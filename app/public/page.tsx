import Link from 'next/link';
import { ArrowRight, Mountain, Users, Briefcase, CheckCircle, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="overflow-x-hidden w-full max-w-full bg-[#0c0b10] text-white font-sans">
      {/* Floating Glass Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl shadow-black/20 flex items-center gap-4 md:gap-8">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight"><Mountain className="w-5 h-5 text-amber-400" /> Bhutan Tech</Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
          <Link href="#work" className="hover:text-white transition-colors">Work</Link>
          <Link href="#founders" className="hover:text-white transition-colors">Founders</Link>
          <Link href="#students" className="hover:text-white transition-colors">Students</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Log in</Link>
          <Link href="/signup" className="text-sm font-semibold bg-amber-400 text-black px-5 py-2 rounded-full hover:bg-amber-300 transition-colors">Start now</Link>
        </div>
      </nav>

      {/* Attention — Cinematic Center Hero */}
      <section className="relative isolate overflow-hidden min-h-[100dvh] flex items-center justify-center px-6 pt-32 pb-20">
        <div className="absolute inset-0 -z-10">
          <img src="https://picsum.photos/seed/bhutanhero/1920/1080" alt="" aria-hidden="true" className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity contrast-125 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0b10]/60 via-transparent to-[#0c0b10]" />
        </div>
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.92] mb-6">
            Build your <span className="text-amber-400">portfolio</span>.<br />
            Launch your <span className="text-amber-400">startup</span>.
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">Students meet founders. Real projects. Paid work.</p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-amber-400/30 hover:bg-amber-300 transition-all hover:-translate-y-1">Get started <ArrowRight className="w-5 h-5" /></Link>
            <Link href="#work" className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg border border-white/10 hover:bg-white/20 transition-all">See work</Link>
          </div>
        </div>
      </section>

      {/* Interest — Gapless Bento Grid (dense, no voids) */}
      <section id="work" className="py-32 px-6 bg-[#0c0b10]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-4">How it works</h2>
            <p className="text-xl text-white/50 max-w-xl">Founders post. Students apply. Work gets done.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 grid-flow-dense">
            <div className="md:col-span-7 md:row-span-2 relative overflow-hidden rounded-3xl group">
              <img src="https://picsum.photos/seed/founderpost/1200/800" alt="" className="w-full h-full min-h-[400px] object-cover transition-transform duration-700 ease-out group-hover:scale-105 grayscale contrast-125" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-3xl font-extrabold tracking-tight mb-2">Founders post</h3>
                <p className="text-white/70">Define requirements, budget, and timeline. Get applications within days.</p>
              </div>
            </div>
            <div className="md:col-span-5 relative overflow-hidden rounded-3xl bg-amber-400 text-black p-10 flex flex-col justify-between">
              <Sparkles className="w-10 h-10 mb-4" />
              <div>
                <h3 className="text-3xl font-extrabold tracking-tight mb-2">Students apply</h3>
                <p className="text-black/70 leading-relaxed">Browse projects by skill stack. Submit your portfolio and get shortlisted.</p>
              </div>
            </div>
            <div className="md:col-span-5 relative overflow-hidden rounded-3xl bg-white text-black p-10 flex flex-col justify-between">
              <Users className="w-10 h-10 mb-4" />
              <div>
                <h3 className="text-3xl font-extrabold tracking-tight mb-2">Build & get paid</h3>
                <p className="text-black/60 leading-relaxed">Complete the project. Get paid. Build real experience for your resume.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desire — GSAP Scroll Reveal + Scrub Text */}
      <section id="founders" className="py-32 px-6 bg-gradient-to-b from-[#13111a] to-[#0c0b10]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-6">For founders</h2>
            <p className="text-xl text-white/50 leading-relaxed mb-8">Post a short paid project, browse student profiles, and hire within days. No long contracts, no overhead. Too busy to search? Buy a Premium Shortlist and we hand-pick and rank students for you.</p>
            <div className="flex gap-3">
              <Link href="/founder" className="bg-amber-400 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-300 transition">Founder dashboard</Link>
              <Link href="/signup" className="bg-white/10 text-white px-6 py-3 rounded-full font-bold border border-white/10 hover:bg-white/20 transition">Post a project</Link>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden">
            <img src="https://picsum.photos/seed/foundersdesk/800/600" alt="" className="w-full h-auto object-cover grayscale mix-blend-luminosity contrast-125" />
          </div>
        </div>
      </section>

      <section id="students" className="py-32 px-6 bg-[#0c0b10]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden">
            <img src="https://picsum.photos/seed/studentwork/800/600" alt="" className="w-full h-auto object-cover grayscale mix-blend-luminosity contrast-125" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-6">For students</h2>
            <p className="text-xl text-white/50 leading-relaxed mb-8">Browse paid projects, apply with your portfolio, get shortlisted, and earn while learning. Build real experience for your resume.</p>
            <Link href="/student" className="inline-flex items-center gap-2 bg-amber-400 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-300 transition">Student dashboard <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* Horizontal Accordion (reactbits-style) */}
      <section className="py-32 px-6 bg-[#13111a] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-16">What you get</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Reviewed profiles", desc: "Our team reviews profiles and marks verified students, so founders can hire with confidence.", img: "https://picsum.photos/seed/verify/600/400" },
              { title: "Short-term contracts", desc: "Projects run from one week to a few months. Clear deliverables and fixed budgets.", img: "https://picsum.photos/seed/short/600/400" },
              { title: "Portfolio growth", desc: "Every completed project builds real experience and a track record for your resume.", img: "https://picsum.photos/seed/portfolio/600/400" },
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.06] transition-colors">
                <img src={item.img} alt="" className="w-full h-40 object-cover rounded-xl mb-6 grayscale contrast-125 group-hover:scale-[1.03] transition-transform duration-700" />
                <h3 className="text-2xl font-extrabold tracking-tight mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action — Massive CTA */}
      <section className="py-48 px-6 bg-gradient-to-b from-amber-400 to-amber-500 text-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl md:text-9xl font-extrabold tracking-tighter leading-[0.9] mb-8">Start building.</h2>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="bg-black text-white px-10 py-5 rounded-full font-extrabold text-xl shadow-2xl hover:bg-zinc-900 transition-all hover:-translate-y-1">Sign up free</Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-[#0c0b10] border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-extrabold text-xl"><Mountain className="w-6 h-6 text-amber-400" /> Bhutan Tech Connect</div>
          <p className="text-sm text-white/30">Built for Bhutan. Connecting students with real opportunity.</p>
        </div>
      </footer>
    </main>
  );
}
