'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  ChevronRight, UtensilsCrossed, Clock, Star, Package,
  Flame, Coffee, ArrowRight, ChevronLeft, Sparkles, Wind,
} from "lucide-react"

const menuHighlights = [
  { name: "Masala Chai", desc: "Classic spiced tea brewed with ginger, cardamom, and fresh milk", price: "₹30", tag: "Bestseller", category: "Chai", color: "from-amber-600/30 to-orange-900/20", accent: "#f59e0b", Image: "/photos/masala_chai.jpg" },
  { name: "Cutting Chai", desc: "Half-glass strong tea, Mumbai-style. Bold, brisk, and straight to the point", price: "₹20", tag: "Fan Favourite", category: "Chai", color: "from-orange-600/25 to-red-900/20", accent: "#ea580c", Image: "/photos/cutting_chai.jpg" },
  { name: "Special Momos", desc: "Traditional UK styled momo — steamed, spiced, and served with sauce", price: "₹99", tag: "Chef's Pick", category: "Snacks", color: "from-rose-600/25 to-pink-900/20", accent: "#e11d48", Image: "/photos/momo.jpg" },
  { name: "Maggi", desc: "Desi-style masala noodles loaded with veggies and spice", price: "₹50", tag: "Popular", category: "Maggi", color: "from-yellow-600/25 to-amber-900/20", accent: "#ca8a04", Image: "/photos/maggi.jpg" },
  { name: "Mango Lassi", desc: "Thick chilled yoghurt blended with sweet Alphonso mango", price: "₹55", tag: "Refreshing", category: "Cold Drinks", color: "from-yellow-500/25 to-orange-800/20", accent: "#f59e0b", Image: "/photos/mango-lassi.jpg" },
  { name: "Kulhad Chai", desc: "Our signature chai served in a traditional clay cup for that earthy warmth", price: "₹40", tag: "Signature", category: "Chai", color: "from-amber-700/30 to-stone-900/20", accent: "#d97706", Image: "/photos/kulhad_chai.jpg" },
]

const features = [
  { icon: Clock, title: "Fresh & Fast", desc: "Hot chai and snacks ready in minutes. No waiting, no hassle — just flavour.", stat: "~15 min", statLabel: "avg. prep time" },
  { icon: Star, title: "Authentic Taste", desc: "Recipes passed down through generations. Every cup tells a story from Dehradun.", stat: "4.9★", statLabel: "customer rating" },
  { icon: Package, title: "Easy Orders", desc: "Browse the menu, tap your order — done. Simple as sipping chai on a rainy evening.", stat: "100+", statLabel: "happy customers" },
]

const testimonials = [
  { name: "Priya S.", text: "Best masala chai I've had outside home. The kulhad makes it taste even better!", rating: 5 },
  { name: "Rahul M.", text: "Momos are absolutely top-tier. Ordered twice in the same evening — no regrets.", rating: 5 },
  { name: "Anjali K.", text: "The ordering experience is so smooth. Chai arrived piping hot. Highly recommend!", rating: 5 },
  { name: "Dev T.", text: "Cutting chai hits different here. Pure nostalgia in every sip.", rating: 5 },
]

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full pointer-events-none blur-[120px] ${className}`} />
}

function NoiseOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />
  )
}

function MenuCarousel() {
  const [active, setActive] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)

  const changeTo = (index: number) => {
    setIsVisible(false)
    setTimeout(() => {
      setActive(index)
      setIsVisible(true)
    }, 300)
  }

  const prev = () => changeTo((active - 1 + menuHighlights.length) % menuHighlights.length)
  const next = () => changeTo((active + 1) % menuHighlights.length)

  const onMouseDown = (e: React.MouseEvent) => { setDragging(true); startX.current = e.clientX }
  const onMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return
    setDragging(false)
    const diff = startX.current - e.clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }

  useEffect(() => {
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [active])

  const item = menuHighlights[active]

  return (
    <div className="relative w-full max-w-4xl mx-auto select-none" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      <div
        className={`relative rounded-3xl overflow-hidden border border-white/[0.10] bg-gradient-to-br ${item.color} backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-500`}
        style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "scale(1)" : "scale(0.98)", transition: "opacity 0.3s ease, transform 0.3s ease" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative h-72 sm:h-96 overflow-hidden">
          {item.Image ? (
            <img
              src={item.Image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
              <div className="flex flex-col items-center gap-3 opacity-40">
                <Coffee className="h-16 w-16 text-zinc-400" />
                <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">Photo coming soon</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        <div className="relative px-5 sm:px-10 pb-6 sm:pb-10 -mt-10">
          <div className="flex items-start justify-between md:gap-6 sm:gap-0">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  style={{ color: item.accent, borderColor: `${item.accent}40`, background: `${item.accent}15` }}>
                  {item.tag}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{item.category}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight pt-2">{item.name}</h3>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg">{item.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: item.accent }}>{item.price}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 px-2">
        <button onClick={prev} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.10] text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-all backdrop-blur-md">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {menuHighlights.map((_, i) => (
            <button key={i} onClick={() => changeTo(i)}
              className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-2 bg-amber-500" : "w-2 h-2 bg-zinc-600 hover:bg-zinc-400"}`} />
          ))}
        </div>
        <button onClick={next} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.10] text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-all backdrop-blur-md">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % testimonials.length), 6000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-8 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] min-h-[160px] transition-all duration-500">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonials[active].rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-zinc-300 text-base leading-relaxed mb-5 italic">"{testimonials[active].text}"</p>
        <p className="text-amber-400 text-sm font-semibold">— {testimonials[active].name}</p>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-1.5 bg-amber-500" : "w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400"}`} />
        ))}
      </div>
    </div>
  )
}

export default function Page() {
  const { data: session } = useSession()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <NoiseOverlay />

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[95vh] px-4 text-center">
        <GlowOrb className="w-[700px] h-[700px] bg-amber-500/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <GlowOrb className="w-[400px] h-[400px] bg-orange-600/[0.06] top-20 right-10" />
        <GlowOrb className="w-[300px] h-[300px] bg-amber-400/[0.05] bottom-20 left-10" />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)" }} />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute bottom-0 w-px animate-steam"
              style={{ left: `${8 + i * 10}%`, height: `${100 + i * 40}px`, background: "linear-gradient(to top, transparent, rgba(245,158,11,0.18), transparent)", animationDelay: `${i * 0.3}s`, animationDuration: `${3 + i * 0.4}s`, transform: `translateY(${scrollY * 0.1}px)` }} />
          ))}
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/[0.08] backdrop-blur-md text-amber-400 text-sm font-medium mb-8 animate-fade-in shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Now taking orders in Dehradun
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8 animate-fade-in-up">
            Where every cup<br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">tells a story</span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            </span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-lg mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-200">
            ChaiDham brings you freshly brewed chai and authentic Indian snacks — hot, fast, and made with love in the heart of Dehradun.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <Link href={session ? "/menu" : "/sign-up"} className="group relative flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-base transition-all shadow-[0_0_30px_rgba(245,158,11,0.4),0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-100">
              <span>Order Now</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
            </Link>
            <Link href="/menu" className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/[0.10] bg-white/[0.04] backdrop-blur-md text-zinc-300 hover:border-white/[0.20] hover:text-white font-medium text-base transition-all hover:bg-white/[0.07]">
              <UtensilsCrossed className="h-4 w-4" />
              View Menu
            </Link>
          </div>
          <div className="flex items-center justify-center gap-10 mt-16 animate-fade-in-up animation-delay-500">
            {[{ value: "4.9", suffix: "★", label: "Rating" }, { value: "15", suffix: "min", label: "Avg. ready time" }, { value: "100", suffix: "+", label: "Happy customers" }].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white tabular-nums">
                  <span className="text-amber-400">{s.value}</span>
                  <span className="text-amber-500/80 text-xl">{s.suffix}</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-amber-500/60" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── MENU CAROUSEL ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[500px] h-[500px] bg-amber-500/[0.06] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">Our Menu</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">Crowd favourites</h2>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed">From steaming chai to crispy snacks — everything made fresh, every time.</p>
          </div>
          <MenuCarousel />
          <div className="text-center mt-10">
            <Link href="/menu" className="group inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Explore full menu
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── FEATURES ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[600px] h-[400px] bg-orange-600/[0.05] top-0 right-0" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">Why ChaiDham</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">More than just chai</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, stat, statLabel }, i) => (
              <div key={title} className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 hover:border-amber-500/25 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5 group-hover:bg-amber-500/15 transition-colors">
                  <Icon className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-5">{desc}</p>
                <div className="inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/[0.08] border border-amber-500/[0.15]">
                  <span className="text-amber-400 font-black text-lg tabular-nums">{stat}</span>
                  <span className="text-zinc-500 text-[11px] font-medium">{statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[400px] h-[400px] bg-amber-500/[0.06] bottom-0 left-0" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">Reviews</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">What they're saying</h2>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── CTA ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[600px] h-[600px] bg-amber-500/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.10] bg-white/[0.04] backdrop-blur-2xl p-12 sm:p-16 text-center shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute bottom-0 w-px animate-steam"
                  style={{ left: `${15 + i * 15}%`, height: `${80 + i * 20}px`, background: "linear-gradient(to top, transparent, rgba(245,158,11,0.15), transparent)", animationDelay: `${i * 0.4}s`, animationDuration: `${2.5 + i * 0.3}s` }} />
              ))}
            </div>
            <div className="relative z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25 mx-auto mb-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Coffee className="h-7 w-7 text-amber-400" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Ready for a hot cup?</h2>
              <p className="text-zinc-400 mb-10 text-base sm:text-lg max-w-sm mx-auto leading-relaxed">Sign up in seconds and place your first order. Your chai is waiting.</p>
              <Link href={session ? "/menu" : "/sign-up"} className="group relative inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-base transition-all shadow-[0_0_30px_rgba(245,158,11,0.5),0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-100">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-white/[0.05] py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-white font-bold text-5xl tracking-tight">
            <span className="text-amber-500">Chai</span>Dham
          </span>
          <p className="text-zinc-600 text-xs text-center">© {new Date().getFullYear()} ChaiDham. Making chai with love in Dehradun.</p>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/sign-in" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">Sign up</Link>
            <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes steam {
          0%   { transform: translateY(0) scaleX(1); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.2; }
          100% { transform: translateY(-90vh) scaleX(2); opacity: 0; }
        }
        @keyframes fade-in      { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up   { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        .animate-steam          { animation: steam linear infinite; }
        .animate-fade-in        { animation: fade-in 0.9s ease forwards; }
        .animate-fade-in-up     { animation: fade-in-up 0.8s ease forwards; }
        .animation-delay-200    { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-300    { animation-delay: 0.35s; opacity: 0; }
        .animation-delay-500    { animation-delay: 0.55s; opacity: 0; }
      `}</style>
    </div>
  )
}