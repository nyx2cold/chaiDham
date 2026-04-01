'use client'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Coffee, Flame } from "lucide-react"
import Link from "next/link"
import { UtensilsCrossed, Clock, Star, ChevronRight, Package } from "lucide-react";
import { useSession } from "next-auth/react";

const features = [
  { icon: Clock, title: "Fresh & Fast", desc: "Hot chai and snacks ready in minutes — no waiting, no hassle." },
  { icon: Star, title: "Authentic Taste", desc: "Recipes passed down through generations. Every cup tells a story." },
  { icon: Package, title: "Easy Orders", desc: "Browse the menu, tap your order — done. Simple as sipping chai." },
];

const menuHighlights = [
  { name: "Masala Chai", desc: "Classic spiced tea brewed to perfection", price: "₹30", tag: "Bestseller", emoji: "☕" },
  { name: "Samosa", desc: "Crispy golden pastry with spiced potato filling", price: "₹20", tag: "Hot", emoji: "🥟" },
  { name: "Maggi", desc: "Desi-style masala noodles, loaded with veggies", price: "₹50", tag: "Popular", emoji: "🍜" },
  { name: "Bread Pakoda", desc: "Stuffed and fried, served with mint chutney", price: "₹40", tag: "Crispy", emoji: "🍞" },
];

export default function Page() {
  const { data: session } = useSession();

  return (
    /*
      FIXED: was bg-white — the entire page was white while all sections
      used zinc-900/zinc-800 cards, creating jarring contrast on every scroll.
      Now bg-zinc-950 to match the navbar and card surfaces.
    */
    <div className="min-h-screen bg-zinc-950 overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-600/5 blur-[80px]" />
        </div>

        {/* Floating steam lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-px bg-gradient-to-t from-transparent via-amber-500/20 to-transparent animate-steam"
              style={{
                left: `${15 + i * 14}%`,
                height: `${120 + i * 30}px`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-8 animate-fade-in">
          <Flame className="h-3.5 w-3.5" />
          Now taking orders online
        </div>

        {/* Heading */}
        {/* FIXED: was text-black — invisible on zinc-950 background */}
        <h1 className="relative z-10 text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight mb-6 animate-fade-in-up">
          Chai that warms
          <br />
          <span className="text-amber-500 relative">
            the soul.
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-amber-500/0 rounded-full" />
          </span>
        </h1>

        {/* FIXED: was text-zinc-950 — black on dark bg */}
        <p className="relative z-10 text-zinc-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
          ChaiDham brings you freshly brewed chai and authentic Indian snacks —
          hot, fast, and made with love.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-300">
          <Link
            href={session ? "/menu" : "/sign-up"}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-base transition-all shadow-lg shadow-amber-900/40 hover:shadow-amber-900/60 hover:scale-105"
          >
            Order Now
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          {/* FIXED: was text-zinc-950 + hover:text-white — the default text was black on dark */}
          <Link
            href="/menu"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white font-medium text-base transition-all hover:bg-zinc-800/50"
          >
            <UtensilsCrossed className="h-4 w-4" />
            View Menu
          </Link>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex items-center gap-8 mt-16 animate-fade-in-up animation-delay-500">
          {[
            { value: "4.9★", label: "Average Rating" },
            { value: "15min", label: "Avg. cooking time" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
              {/* FIXED: was text-zinc-950 — black on dark bg */}
              <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Why ChaiDham
          </p>
          {/* FIXED: was text-black */}
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-white mb-16">
            More than just chai
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-amber-500/30 hover:bg-zinc-900 transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="h-5 w-5 text-amber-400" />
                </div>
                {/* FIXED: was text-black inside a zinc-900 card */}
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                {/* FIXED: was text-zinc-950 */}
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENU HIGHLIGHTS ── */}
      <section className="py-24 px-4 relative">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-600/5 blur-[80px]" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <p className="text-center text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">
            What we serve
          </p>
          {/* FIXED: was text-black */}
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-white mb-4">
            Our crowd favourites
          </h2>
          {/* FIXED: was text-zinc-950 */}
          <p className="text-center text-zinc-400 mb-16 max-w-md mx-auto">
            From steaming chai to crispy snacks — everything made fresh, every time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Floating steam lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 w-px bg-gradient-to-t from-transparent via-amber-500/20 to-transparent animate-steam"
                  style={{
                    left: `${15 + i * 14}%`,
                    height: `${120 + i * 30}px`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + i * 0.5}s`,
                  }}
                />
              ))}
            </div>
            {menuHighlights.map((item) => (
              <div
                key={item.name}
                className="group flex items-center gap-5 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-amber-500/20 hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl group-hover:bg-zinc-700 transition-colors">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* FIXED: was text-black */}
                    <span className="text-white font-semibold">{item.name}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                      {item.tag}
                    </span>
                  </div>
                  {/* FIXED: was text-zinc-950 */}
                  <p className="text-zinc-400 text-sm truncate">{item.desc}</p>
                </div>
                <span className="shrink-0 text-amber-400 font-bold text-lg">{item.price}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              See full menu
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 px-8 py-16 rounded-3xl border border-amber-500/20 bg-zinc-900/80 backdrop-blur">
            <Coffee className="h-10 w-10 text-amber-500 mx-auto mb-6" />
            {/* FIXED: was text-black inside a zinc-900/80 card */}
            {/* Floating steam lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 w-px bg-gradient-to-t from-transparent via-amber-500/20 to-transparent animate-steam"
                  style={{
                    left: `${15 + i * 14}%`,
                    height: `${120 + i * 30}px`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + i * 0.5}s`,
                  }}
                />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {/* Background glow */}
              {/* <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
                <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-600/5 blur-[80px]" />
              </div> */}
              Ready for a hot cup?
            </h2>
            {/* FIXED: was text-zinc-950 */}
            <p className="text-zinc-400 mb-8 text-lg">
              Sign up in seconds and place your first order. Your chai is waiting.
            </p>
            <Link
              href={session ? "/menu" : "/sign-up"}
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-base transition-all shadow-lg shadow-amber-900/40 hover:scale-105"
            >
              Log In / Sign Up
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
              <UtensilsCrossed className="h-3.5 w-3.5 text-zinc-950" />
            </div>
            {/* FIXED: was text-black */}
            <span className="text-white font-bold">
              Chai<span className="text-amber-500">Dham</span>
            </span>
          </div>
          {/* FIXED: was text-zinc-950 */}
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} ChaiDham. Making chai with Love in Dehradun.
          </p>
          {/* FIXED: was text-zinc-950 with hover:text-zinc-300 — the default was black */}
          <div className="flex items-center gap-5 text-sm text-zinc-400">
            <Link href="/sign-in" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">Sign up</Link>
            <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
          </div>
        </div>
      </footer>

      {/* ── ANIMATIONS ── */}
      <style jsx>{`
        @keyframes steam {
          0% { transform: translateY(0) scaleX(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-80vh) scaleX(1.5); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-steam { animation: steam linear infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.7s ease forwards; }
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
        .animation-delay-500 { animation-delay: 0.5s; opacity: 0; }
      `}</style>
    </div>
  );
}