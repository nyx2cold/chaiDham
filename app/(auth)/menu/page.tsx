"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Search, Plus, Minus, Loader2, UtensilsCrossed, X } from "lucide-react";
import { useCart } from "@/context/cartContext";
import { toast } from "sonner";
import { CafeClosedBanner } from "@/components/menu/CafeClosedBanner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
}

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "chai", label: "Chai", emoji: "🍵" },
  { key: "snacks", label: "Snacks", emoji: "🥟" },
  { key: "maggi", label: "Maggi", emoji: "🍜" },
  { key: "cold-drinks", label: "Cold Drinks", emoji: "🥤" },
  { key: "specials", label: "Specials", emoji: "⭐" },
] as const;

// ── Veg badge ─────────────────────────────────────────────────────────────────
function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <div
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={`flex h-4 w-4 items-center justify-center rounded-sm border-2 flex-shrink-0 ${isVeg ? "border-green-500" : "border-red-500"
        }`}
    >
      <div className={`h-2 w-2 rounded-full ${isVeg ? "bg-green-500" : "bg-red-500"}`} />
    </div>
  );
}

// ── Item image ────────────────────────────────────────────────────────────────
function ItemImage({ src, name }: { src: string; name: string }) {
  const [errored, setErrored] = useState(false);

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-zinc-800/80">
      <UtensilsCrossed className="h-7 w-7 text-zinc-600" />
      <span className="text-[10px] text-zinc-600 font-medium tracking-wide">Photo coming soon</span>
    </div>
  );
}

// ── Animated card wrapper ─────────────────────────────────────────────────────
function AnimatedCard({
  children,
  index,
  animKey,
}: {
  children: React.ReactNode;
  index: number;
  animKey: string;
}) {
  const [visible, setVisible] = useState(false);
  const prevKey = useRef(animKey);

  useEffect(() => {
    if (prevKey.current !== animKey) {
      setVisible(false);
      prevKey.current = animKey;
    }
    const t = setTimeout(() => setVisible(true), index * 45);
    return () => clearTimeout(t);
  }, [animKey, index]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
      }}
    >
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState("init");

  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();

  const getQty = (id: string) => cartItems.find((i) => i._id === id)?.quantity ?? 0;

  // Fetch
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await axios.get("/api/menu");
        setItems(res.data.data);
      } catch {
        toast.error("Could not load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  // Bump animKey whenever filters change so cards re-animate
  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    setAnimKey(`${key}-${Date.now()}`);
  };

  const handleVegChange = (v: "all" | "veg" | "nonveg") => {
    setVegFilter(v);
    setAnimKey(`veg-${v}-${Date.now()}`);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setAnimKey(`search-${Date.now()}`);
  };

  // Filtered
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesVeg =
        vegFilter === "all" ||
        (vegFilter === "veg" && item.isVeg) ||
        (vegFilter === "nonveg" && !item.isVeg);
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [items, activeCategory, search, vegFilter]);

  // Grouped
  const grouped = useMemo(() => {
    if (activeCategory !== "all") return { [activeCategory]: filtered };
    const groups: Record<string, MenuItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered, activeCategory]);

  const categoryOrder = CATEGORIES.slice(1).map((c) => c.key as string);
  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  const getCategoryLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key;
  const getCategoryEmoji = (key: string) => CATEGORIES.find((c) => c.key === key)?.emoji ?? "";

  const hasActiveFilters = search !== "" || vegFilter !== "all" || activeCategory !== "all";

  async function handleAddToCart(item: MenuItem) {
    setAddingId(item._id);
    await new Promise((r) => setTimeout(r, 180));
    addToCart({ _id: item._id, name: item.name, price: item.price, image: item.image });
    toast.success(`${item.name} added!`, { description: `₹${item.price}` });
    setAddingId(null);
  }

  function handleIncrement(item: MenuItem) {
    const qty = getQty(item._id);
    if (qty === 0) handleAddToCart(item);
    else updateQuantity(item._id, qty + 1);
  }

  function handleDecrement(item: MenuItem) {
    const qty = getQty(item._id);
    if (qty <= 1) removeFromCart(item._id);
    else updateQuantity(item._id, qty - 1);
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10">
        {/* <CafeClosedBanner /> */}
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-xl bg-zinc-800/60 animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-zinc-800/60 animate-pulse" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-24 rounded-full bg-zinc-800/60 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden animate-pulse">
                <div className="h-40 bg-zinc-800/80" />
                <div className="p-3 space-y-2.5">
                  <div className="h-3.5 bg-zinc-800 rounded-lg w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded-lg w-full" />
                  <div className="h-3 bg-zinc-800 rounded-lg w-2/3" />
                  <div className="flex justify-between items-center pt-1">
                    <div className="h-4 bg-zinc-800 rounded-lg w-10" />
                    <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-30 border-b border-white/[0.05] bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 space-y-3">

          {/* Row 1: search + veg filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">

            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search chai, samosa, maggi…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-9 pr-9 rounded-xl text-sm
                  bg-white/[0.05] border border-white/[0.08]
                  text-white placeholder:text-zinc-500
                  focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.07]
                  transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Veg filter */}
            <div className="flex gap-1.5 flex-shrink-0 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              {(["all", "veg", "nonveg"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => handleVegChange(v)}
                  className={`flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold transition-all duration-200 ${vegFilter === v
                    ? v === "veg"
                      ? "bg-green-500/20 text-green-400 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.3)]"
                      : v === "nonveg"
                        ? "bg-red-500/20 text-red-400 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.3)]"
                        : "bg-amber-500/20 text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)]"
                    : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  {v !== "all" && (
                    <span className={`h-1.5 w-1.5 rounded-full ${v === "veg" ? "bg-green-500" : "bg-red-500"}`} />
                  )}
                  {v === "all" ? "All" : v === "veg" ? "Veg" : "Non-veg"}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: category pills */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`flex items-center gap-1.5 px-4 h-8 rounded-full text-xs font-semibold flex-shrink-0 transition-all duration-200 ${activeCategory === cat.key
                  ? "bg-amber-500 text-zinc-950 shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                  : "bg-white/[0.04] border border-white/[0.07] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* Active filter pills row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-zinc-600 font-medium">Filters:</span>
            {activeCategory !== "all" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                {getCategoryEmoji(activeCategory)} {getCategoryLabel(activeCategory)}
                <button onClick={() => handleCategoryChange("all")} className="hover:text-amber-200 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {vegFilter !== "all" && (
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${vegFilter === "veg"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${vegFilter === "veg" ? "bg-green-500" : "bg-red-500"}`} />
                {vegFilter === "veg" ? "Veg" : "Non-veg"}
                <button onClick={() => handleVegChange("all")} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-zinc-400 text-xs font-medium">
                "{search}"
                <button onClick={() => handleSearchChange("")} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <span className="text-xs text-zinc-600 ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.07]">
              <Search className="h-6 w-6 text-zinc-600" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <X className="h-2.5 w-2.5 text-zinc-500" />
              </div>
            </div>
            <div>
              <p className="text-white font-semibold">Nothing found</p>
              <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
            <button
              onClick={() => {
                handleSearchChange("");
                handleCategoryChange("all");
                handleVegChange("all");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium
                bg-white/[0.05] border border-white/[0.08]
                text-zinc-400 hover:text-white hover:bg-white/[0.08]
                transition-all duration-200"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Grouped sections */}
        {sortedGroups.map(([category, categoryItems]) => {
          // Compute a per-group start index for stagger offset
          const groupStartIndex = sortedGroups
            .slice(0, sortedGroups.findIndex(([k]) => k === category))
            .reduce((acc, [, arr]) => acc + arr.length, 0);

          return (
            <section key={category} className="mb-14">

              {/* Section heading — only in "all" view */}
              {activeCategory === "all" && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-lg leading-none">{getCategoryEmoji(category)}</span>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {getCategoryLabel(category)}
                  </h2>
                  <span className="text-[11px] text-zinc-600 font-medium tabular-nums">
                    {categoryItems.length} item{categoryItems.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryItems.map((item, i) => (
                  <AnimatedCard
                    key={item._id}
                    index={groupStartIndex + i}
                    animKey={animKey}
                  >
                    <div
                      className="group relative flex flex-col h-full rounded-2xl overflow-hidden
                        bg-zinc-900/50 border border-white/[0.07]
                        hover:border-amber-500/25 hover:bg-zinc-900
                        transition-colors duration-200"
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden bg-zinc-800/60 flex-shrink-0">
                        <ItemImage src={item.image} name={item.name} />

                        {/* Dim overlay on hover lifted by image scale */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

                        {item.isBestseller && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full
                            bg-amber-500 text-zinc-950 text-[10px] font-bold tracking-wider uppercase">
                            Bestseller
                          </span>
                        )}

                        <div className="absolute top-2 right-2">
                          <VegBadge isVeg={item.isVeg} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 p-3 gap-1">
                        <p className="text-sm font-semibold text-white leading-snug line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 flex-1">
                          {item.description}
                        </p>

                        {/* Price + stepper */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                          <span className="text-sm font-bold text-amber-400 tabular-nums">
                            ₹{item.price}
                          </span>

                          {getQty(item._id) === 0 ? (
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={addingId === item._id}
                              className="flex h-8 w-8 items-center justify-center rounded-lg
                                bg-amber-500 hover:bg-amber-400 text-zinc-950
                                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-150"
                              aria-label={`Add ${item.name}`}
                            >
                              {addingId === item._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDecrement(item)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg
                                  bg-white/[0.07] hover:bg-white/[0.12]
                                  border border-white/[0.09]
                                  text-white active:scale-90
                                  transition-all duration-100"
                                aria-label="Remove one"
                              >
                                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                              </button>

                              <span className="min-w-[22px] text-center text-sm font-bold text-white tabular-nums">
                                {getQty(item._id)}
                              </span>

                              <button
                                onClick={() => handleIncrement(item)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg
                                  bg-amber-500 hover:bg-amber-400 text-zinc-950
                                  active:scale-90 transition-all duration-100"
                                aria-label="Add one more"
                              >
                                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}