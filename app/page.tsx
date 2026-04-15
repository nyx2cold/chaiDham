"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  motion, useScroll, useTransform, AnimatePresence,
  useInView, useMotionValue, useSpring, type Variants,
} from "framer-motion"
import {
  ChevronRight, UtensilsCrossed, Clock, Star, Package,
  Coffee, ArrowRight, ChevronLeft,
} from "lucide-react"

// ─── DATA ────────────────────────────────────────────────────────────────────

const menuHighlights = [
  { name: "Masala Chai", desc: "Classic spiced tea brewed with ginger, cardamom, and fresh milk", price: "₹30", tag: "Bestseller", category: "Chai", color: "from-amber-600/30 to-orange-900/20", accent: "#f59e0b", image: "/photos/masala_chai.jpg" },
  { name: "Cutting Chai", desc: "Half-glass strong tea, Mumbai-style. Bold, brisk, and straight to the point", price: "₹20", tag: "Fan Favourite", category: "Chai", color: "from-orange-600/25 to-red-900/20", accent: "#ea580c", image: "/photos/cutting_chai.jpg" },
  { name: "Special Momos", desc: "Traditional UK styled momo — steamed, spiced, and served with sauce", price: "₹99", tag: "Chef's Pick", category: "Snacks", color: "from-rose-600/25 to-pink-900/20", accent: "#e11d48", image: "/photos/momo.jpg" },
  { name: "Maggi", desc: "Desi-style masala noodles loaded with veggies and spice", price: "₹50", tag: "Popular", category: "Maggi", color: "from-yellow-600/25 to-amber-900/20", accent: "#ca8a04", image: "/photos/maggi.jpg" },
  { name: "Mango Lassi", desc: "Thick chilled yoghurt blended with sweet Alphonso mango", price: "₹55", tag: "Refreshing", category: "Cold Drinks", color: "from-yellow-500/25 to-orange-800/20", accent: "#f59e0b", image: "/photos/mango-lassi.jpg" },
  { name: "Kulhad Chai", desc: "Our signature chai served in a traditional clay cup for that earthy warmth", price: "₹40", tag: "Signature", category: "Chai", color: "from-amber-700/30 to-stone-900/20", accent: "#d97706", image: "/photos/kulhad_chai.jpg" },
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

const stats = [
  { value: "4.9", suffix: "★", label: "Rating" },
  { value: "15", suffix: "min", label: "Avg. ready time" },
  { value: "100", suffix: "+", label: "Happy customers" },
]

// ─── VARIANTS ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeInOut", delay } }),
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({ opacity: 1, transition: { duration: 0.6, delay } }),
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeInOut" } },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full pointer-events-none blur-[120px] ${className}`} />
}

function NoiseOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "256px 256px",
      }} />
  )
}

// ─── STEAM LINES ─────────────────────────────────────────────────────────────

function SteamLines({ count = 10 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-px"
          style={{
            left: `${8 + i * 10}%`,
            height: `${100 + i * 40}px`,
            background: "linear-gradient(to top, transparent, rgba(245,158,11,0.18), transparent)",
          }}
          animate={{ y: [0, "-90vh"], opacity: [0, 1, 0.2, 0], scaleX: [1, 1.5, 2] }}
          transition={{ duration: 3 + i * 0.4, delay: i * 0.3, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  )
}

// ─── MENU CAROUSEL ───────────────────────────────────────────────────────────

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeInOut" } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.98, transition: { duration: 0.3 } }),
}

function MenuCarousel() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const startX = useRef(0)
  const isDragging = useRef(false)

  const changeTo = (index: number, dir: number) => {
    setDirection(dir)
    setActive(index)
  }

  const prev = () => changeTo((active - 1 + menuHighlights.length) % menuHighlights.length, -1)
  const next = () => changeTo((active + 1) % menuHighlights.length, 1)

  useEffect(() => {
    const t = setInterval(() => changeTo((active + 1) % menuHighlights.length, 1), 6000)
    return () => clearInterval(t)
  }, [active])

  const item = menuHighlights[active]

  return (
    <div
      className="relative w-full max-w-4xl mx-auto select-none"
      onMouseDown={(e) => { isDragging.current = true; startX.current = e.clientX }}
      onMouseUp={(e) => {
        if (!isDragging.current) return
        isDragging.current = false
        const diff = startX.current - e.clientX
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
      }}
    >
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`relative rounded-3xl overflow-hidden border border-white/[0.10] bg-gradient-to-br ${item.color} backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative h-72 sm:h-96 overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
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
              <div className="flex items-start justify-between md:gap-6">
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
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-6 px-2">
        <motion.button onClick={prev} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.10] text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-colors backdrop-blur-md">
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        <div className="flex items-center gap-2">
          {menuHighlights.map((_, i) => (
            <motion.button key={i} onClick={() => changeTo(i, i > active ? 1 : -1)}
              animate={{ width: i === active ? 24 : 8, backgroundColor: i === active ? "#f59e0b" : "#52525b" }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full" />
          ))}
        </div>

        <motion.button onClick={next} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.10] text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-colors backdrop-blur-md">
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  )
}

// ─── TESTIMONIAL CAROUSEL ────────────────────────────────────────────────────

const testimonialVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: "easeInOut" } },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.3 } }),
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const t = setInterval(() => { setDirection(1); setActive((a) => (a + 1) % testimonials.length) }, 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] min-h-[160px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={active} custom={direction} variants={testimonialVariants} initial="enter" animate="center" exit="exit"
            className="px-8 py-8">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-zinc-300 text-base leading-relaxed mb-5 italic">"{testimonials[active].text}"</p>
            <p className="text-amber-400 text-sm font-semibold">— {testimonials[active].name}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <motion.button key={i} onClick={() => { setDirection(i > active ? 1 : -1); setActive(i) }}
            animate={{ width: i === active ? 20 : 6, backgroundColor: i === active ? "#f59e0b" : "#52525b" }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full" />
        ))}
      </div>
    </div>
  )
}

// ─── SECTION WRAPPER (scroll-triggered fade-up) ───────────────────────────────

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"}
      variants={fadeUp} className={className}>
      {children}
    </motion.div>
  )
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────

function AnimatedStat({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 })
  const [display, setDisplay] = useState("0")
  const numeric = parseFloat(value)

  useEffect(() => {
    if (isInView) motionVal.set(numeric)
  }, [isInView, numeric, motionVal])

  useEffect(() => {
    return spring.on("change", (v) => {
      setDisplay(Number.isInteger(numeric) ? Math.round(v).toString() : v.toFixed(1))
    })
  }, [spring, numeric])

  return (
    <motion.div ref={ref} className="text-center" initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
      <p className="text-2xl font-black text-white tabular-nums">
        <span className="text-amber-400">{display}</span>
        <span className="text-amber-500/80 text-xl">{suffix}</span>
      </p>
      <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-medium">{label}</p>
    </motion.div>
  )
}

// ─── FEATURE CARDS (extracted to own component to fix hook-in-render bug) ────

function FeatureCards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
      {features.map(({ icon: Icon, title, desc, stat, statLabel }) => (
        <motion.div key={title} variants={cardVariant}
          whileHover={{ y: -4, borderColor: "rgba(245,158,11,0.25)" }}
          className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors duration-300">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <motion.div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none"
            initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
            <Icon className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-5">{desc}</p>
          <div className="inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/[0.08] border border-amber-500/[0.15]">
            <span className="text-amber-400 font-black text-lg tabular-nums">{stat}</span>
            <span className="text-zinc-500 text-[11px] font-medium">{statLabel}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { data: session } = useSession()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 60])

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <NoiseOverlay />

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[95vh] px-4 text-center">
        <GlowOrb className="w-[700px] h-[700px] bg-amber-500/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <GlowOrb className="w-[400px] h-[400px] bg-orange-600/[0.06] top-20 right-10" />
        <GlowOrb className="w-[300px] h-[300px] bg-amber-400/[0.05] bottom-20 left-10" />

        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)" }} />

        <motion.div style={{ y: heroY }}>
          <SteamLines count={10} />
        </motion.div>

        <motion.div className="relative z-10 max-w-4xl mx-auto" initial="hidden" animate="visible" variants={staggerContainer}>

          <motion.div variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/[0.08] backdrop-blur-md text-amber-400 text-sm font-medium mb-8 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <motion.span className="h-1.5 w-1.5 rounded-full bg-amber-400"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
            Now taking orders in Dehradun
          </motion.div>

          <motion.h1 variants={fadeUp} custom={0.1}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8">
            Where every cup<br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">tells a story</span>
              <motion.span className="absolute -bottom-1 left-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent"
                initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 0.8, ease: "easeOut" }} />
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={0.25}
            className="text-zinc-400 text-lg sm:text-xl max-w-lg mx-auto mb-12 leading-relaxed">
            ChaiDham brings you freshly brewed chai and authentic Indian snacks — hot, fast, and made with love in the heart of Dehradun.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.35}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={session ? "/menu" : "/sign-up"}>
              <motion.span whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,158,11,0.6)" }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-base cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.4),0_4px_20px_rgba(0,0,0,0.3)]">
                <span>Order Now</span>
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
              </motion.span>
            </Link>
            <Link href="/menu">
              <motion.span whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/[0.10] bg-white/[0.04] backdrop-blur-md text-zinc-300 hover:text-white font-medium text-base cursor-pointer">
                <UtensilsCrossed className="h-4 w-4" />
                View Menu
              </motion.span>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.5}
            className="flex items-center justify-center gap-10 mt-16">
            {stats.map((s) => <AnimatedStat key={s.label} {...s} />)}
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
          animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-amber-500/60" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── MENU CAROUSEL ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[500px] h-[500px] bg-amber-500/[0.06] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <RevealSection className="text-center mb-14">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">Our Menu</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">Crowd favourites</h2>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed">From steaming chai to crispy snacks — everything made fresh, every time.</p>
          </RevealSection>
          <RevealSection>
            <MenuCarousel />
          </RevealSection>
          <RevealSection className="text-center mt-10">
            <Link href="/menu" className="group inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Explore full menu
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ChevronRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </RevealSection>
        </div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── FEATURES ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[600px] h-[400px] bg-orange-600/[0.05] top-0 right-0" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <RevealSection className="text-center mb-14">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">Why ChaiDham</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">More than just chai</h2>
          </RevealSection>
          <FeatureCards />
        </div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[400px] h-[400px] bg-amber-500/[0.06] bottom-0 left-0" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <RevealSection className="text-center mb-14">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">Reviews</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">What they&apos;re saying</h2>
          </RevealSection>
          <RevealSection>
            <TestimonialCarousel />
          </RevealSection>
        </div>
      </section>

      <div className="relative h-px mx-8 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── CTA ── */}
      <section className="relative py-28 px-4">
        <GlowOrb className="w-[600px] h-[600px] bg-amber-500/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <RevealSection>
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.10] bg-white/[0.04] backdrop-blur-2xl p-12 sm:p-16 text-center shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
              <SteamLines count={6} />
              <div className="relative z-10">
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25 mx-auto mb-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  animate={{ rotate: [0, -3, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <Coffee className="h-7 w-7 text-amber-400" />
                </motion.div>
                <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Ready for a hot cup?</h2>
                <p className="text-zinc-400 mb-10 text-base sm:text-lg max-w-sm mx-auto leading-relaxed">Sign up in seconds and place your first order. Your chai is waiting.</p>
                <Link href={session ? "/menu" : "/sign-up"}>
                  <motion.span whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(245,158,11,0.7)" }}
                    whileTap={{ scale: 0.98 }}
                    className="relative inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-base cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.5),0_4px_20px_rgba(0,0,0,0.3)]">
                    <span>Get Started</span>
                    <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
                  </motion.span>
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-white/[0.05] py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <motion.span className="text-white font-bold text-5xl tracking-tight"
            whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <span className="text-amber-500">Chai</span>Dham
          </motion.span>
          <p className="text-zinc-600 text-xs text-center">© {new Date().getFullYear()} ChaiDham. Making chai with love in Dehradun.</p>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            {[{ href: "/sign-in", label: "Sign in" }, { href: "/sign-up", label: "Sign up" }, { href: "/menu", label: "Menu" }].map(({ href, label }) => (
              <Link key={href} href={href}>
                <motion.span whileHover={{ color: "#fff" }} className="transition-colors cursor-pointer">{label}</motion.span>
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  )
}