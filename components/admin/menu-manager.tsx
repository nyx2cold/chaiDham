"use client";

import { useState } from "react";
import {
    Plus, Pencil, Trash2, X, Check, UtensilsCrossed, Search,
    ToggleLeft, ToggleRight, Sparkles,
} from "lucide-react";

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    isVeg: boolean;
    isBestseller: boolean;
    isAvailable: boolean;
}

const CATEGORIES = ["chai", "snacks", "maggi", "cold-drinks", "specials"];

const INITIAL_ITEMS: MenuItem[] = [
    { _id: "1", name: "Masala Chai", description: "Spiced milk tea with ginger", price: 20, category: "chai", isVeg: true, isBestseller: true, isAvailable: true },
    { _id: "2", name: "Adrak Chai", description: "Strong ginger tea", price: 25, category: "chai", isVeg: true, isBestseller: false, isAvailable: true },
    { _id: "3", name: "Samosa", description: "Crispy fried samosa", price: 15, category: "snacks", isVeg: true, isBestseller: true, isAvailable: true },
    { _id: "4", name: "Classic Maggi", description: "The OG Maggi noodles", price: 50, category: "maggi", isVeg: true, isBestseller: false, isAvailable: true },
    { _id: "5", name: "Cheese Maggi", description: "Maggi loaded with cheese", price: 60, category: "maggi", isVeg: true, isBestseller: false, isAvailable: true },
    { _id: "6", name: "Coca Cola", description: "Chilled cola 250ml", price: 30, category: "cold-drinks", isVeg: true, isBestseller: false, isAvailable: true },
    { _id: "7", name: "Special Thali", description: "Chef's daily special", price: 120, category: "specials", isVeg: false, isBestseller: true, isAvailable: true },
];

const BLANK: Omit<MenuItem, "_id"> = {
    name: "", description: "", price: 0,
    category: "chai", isVeg: true, isBestseller: false, isAvailable: true,
};

export function MenuManager() {
    const [items, setItems] = useState<MenuItem[]>(INITIAL_ITEMS);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<MenuItem, "_id">>(BLANK);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filtered = items.filter((i) => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter === "all" || i.category === catFilter;
        return matchSearch && matchCat;
    });

    function openAdd() {
        setForm(BLANK);
        setEditingId(null);
        setShowForm(true);
    }

    function openEdit(item: MenuItem) {
        const { _id, ...rest } = item;
        setForm(rest);
        setEditingId(_id);
        setShowForm(true);
    }

    function handleSave() {
        if (!form.name.trim() || form.price <= 0) return;
        if (editingId) {
            setItems((prev) => prev.map((i) => i._id === editingId ? { ...form, _id: editingId } : i));
        } else {
            setItems((prev) => [...prev, { ...form, _id: Date.now().toString() }]);
        }
        setShowForm(false);
        setEditingId(null);
    }

    function handleDelete(id: string) {
        setItems((prev) => prev.filter((i) => i._id !== id));
        setDeleteId(null);
    }

    function toggleAvailable(id: string) {
        setItems((prev) => prev.map((i) => i._id === id ? { ...i, isAvailable: !i.isAvailable } : i));
    }

    return (
        <div className="flex flex-col gap-5">

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                    <p className="text-base font-bold text-white">Menu Items</p>
                    <p className="text-xs text-zinc-500">{items.length} items across {CATEGORIES.length} categories</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Glass search bar */}
                    <div className="relative flex-1 sm:w-52">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search items…"
                            className="w-full h-9 pl-9 pr-3 rounded-xl text-xs
                                bg-white/[0.06] backdrop-blur-md
                                border border-white/[0.10]
                                text-white placeholder:text-zinc-600
                                shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_4px_12px_rgba(0,0,0,0.3)]
                                focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.09]
                                transition-all duration-200"
                        />
                    </div>

                    {/* Glass add button */}
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold flex-shrink-0
                            bg-amber-500/90 hover:bg-amber-400
                            text-zinc-950
                            shadow-[0_0_20px_rgba(245,158,11,0.35),0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]
                            hover:shadow-[0_0_28px_rgba(245,158,11,0.5),0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
                            transition-all duration-200 active:scale-[0.97]"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* ── Category filter pills ── */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {["all", ...CATEGORIES].map((c) => (
                    <button
                        key={c}
                        onClick={() => setCatFilter(c)}
                        className={`px-3.5 h-7 rounded-full text-xs font-semibold flex-shrink-0 transition-all duration-200 ${catFilter === c
                                ? "bg-amber-500/90 text-zinc-950 shadow-[0_0_14px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                                : "bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.09] hover:border-white/[0.14]"
                            }`}
                    >
                        {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}
                    </button>
                ))}
            </div>

            {/* ── Items grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((item) => (
                    <div
                        key={item._id}
                        className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 ${item.isAvailable
                                ? "bg-white/[0.05] backdrop-blur-xl border-white/[0.09] hover:border-white/[0.18] hover:bg-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]"
                                : "bg-white/[0.02] backdrop-blur-md border-white/[0.04] opacity-50"
                            }`}
                    >
                        {/* Inner top gloss sheen */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                        {/* Subtle inner glow on hover */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-amber-500/[0.02] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative p-4">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    {/* Veg/Non-veg dot with glow */}
                                    <div className={`h-2 w-2 rounded-full flex-shrink-0 shadow-[0_0_6px_currentColor] ${item.isVeg ? "bg-green-400 text-green-400" : "bg-red-400 text-red-400"
                                        }`} />
                                    {item.isBestseller && (
                                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            Bestseller
                                        </span>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="flex h-6 w-6 items-center justify-center rounded-lg
                                            bg-white/[0.07] border border-white/[0.10]
                                            text-zinc-400 hover:text-white hover:bg-white/[0.14]
                                            backdrop-blur-sm transition-all duration-150
                                            shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(item._id)}
                                        className="flex h-6 w-6 items-center justify-center rounded-lg
                                            bg-red-500/[0.08] border border-red-500/[0.15]
                                            text-red-500/60 hover:text-red-400 hover:bg-red-500/[0.18]
                                            backdrop-blur-sm transition-all duration-150"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm font-semibold text-white leading-snug line-clamp-1">{item.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{item.description}</p>

                            {/* Price + toggle row */}
                            <div className="flex items-center justify-between mt-3.5">
                                <span className="text-sm font-bold text-amber-400 tabular-nums
                                    drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                                    ₹{item.price}
                                </span>

                                <button
                                    onClick={() => toggleAvailable(item._id)}
                                    className="flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-200"
                                >
                                    {item.isAvailable ? (
                                        <>
                                            <ToggleRight className="h-4 w-4 text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
                                            <span className="text-green-400">On</span>
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="h-4 w-4 text-zinc-600" />
                                            <span className="text-zinc-600">Off</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Category chip */}
                            <div className="mt-3 pt-3 border-t border-white/[0.06]">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium
                                    bg-white/[0.06] border border-white/[0.08] text-zinc-500 capitalize
                                    backdrop-blur-sm">
                                    {item.category.replace("-", " ")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Add / Edit Modal ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Blurred backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowForm(false)}
                    />

                    {/* Glass modal */}
                    <div className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden
                        bg-white/[0.07] backdrop-blur-2xl
                        border border-white/[0.12]
                        shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2)]">

                        {/* Top sheen */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                        {/* Ambient glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-transparent pointer-events-none rounded-2xl" />

                        <div className="relative p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-base font-bold text-white">
                                    {editingId ? "Edit Item" : "Add New Item"}
                                </p>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg
                                        bg-white/[0.07] border border-white/[0.10]
                                        text-zinc-400 hover:text-white hover:bg-white/[0.14]
                                        transition-all duration-150"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Name */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Name *</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Masala Chai"
                                        className="w-full h-9 px-3 rounded-xl text-sm
                                            bg-white/[0.06] backdrop-blur-sm
                                            border border-white/[0.10]
                                            text-white placeholder:text-zinc-600
                                            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                                            focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.09]
                                            transition-all duration-200"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description</label>
                                    <input
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Short description…"
                                        className="w-full h-9 px-3 rounded-xl text-sm
                                            bg-white/[0.06] backdrop-blur-sm
                                            border border-white/[0.10]
                                            text-white placeholder:text-zinc-600
                                            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                                            focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.09]
                                            transition-all duration-200"
                                    />
                                </div>

                                {/* Price + Category */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Price (₹) *</label>
                                        <input
                                            type="number"
                                            value={form.price || ""}
                                            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                            placeholder="0"
                                            className="w-full h-9 px-3 rounded-xl text-sm
                                                bg-white/[0.06] backdrop-blur-sm
                                                border border-white/[0.10]
                                                text-white placeholder:text-zinc-600
                                                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                                                focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.09]
                                                transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full h-9 px-3 rounded-xl text-sm
                                                bg-zinc-800/80 backdrop-blur-sm
                                                border border-white/[0.10]
                                                text-white
                                                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                                                focus:outline-none focus:border-amber-500/50
                                                transition-all duration-200"
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>
                                                    {c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="flex items-center gap-5 pt-1">
                                    {[
                                        { key: "isVeg", label: "Veg" },
                                        { key: "isBestseller", label: "Bestseller" },
                                        { key: "isAvailable", label: "Available" },
                                    ].map(({ key, label }) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer group/check">
                                            <input
                                                type="checkbox"
                                                checked={form[key as keyof typeof form] as boolean}
                                                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                                                className="hidden"
                                            />
                                            <div className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all duration-200 ${form[key as keyof typeof form]
                                                    ? "bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                                                    : "bg-white/[0.04] border-white/[0.15] group-hover/check:border-white/[0.25]"
                                                }`}>
                                                {form[key as keyof typeof form] && <Check className="h-3 w-3 text-zinc-950" strokeWidth={3} />}
                                            </div>
                                            <span className="text-xs text-zinc-400 group-hover/check:text-zinc-200 transition-colors">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 h-9 rounded-xl text-sm font-medium
                                        bg-white/[0.05] backdrop-blur-sm
                                        border border-white/[0.09]
                                        text-zinc-400 hover:text-white hover:bg-white/[0.10]
                                        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                                        transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!form.name.trim() || form.price <= 0}
                                    className="flex-1 h-9 rounded-xl text-sm font-bold
                                        bg-amber-500/90 hover:bg-amber-400
                                        text-zinc-950
                                        shadow-[0_0_20px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
                                        hover:shadow-[0_0_28px_rgba(245,158,11,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]
                                        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                                        transition-all duration-200 active:scale-[0.98]"
                                >
                                    {editingId ? "Save Changes" : "Add Item"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete confirm modal ── */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeleteId(null)} />

                    <div className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden
                        bg-white/[0.07] backdrop-blur-2xl
                        border border-white/[0.12]
                        shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]
                        text-center p-5">

                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.04] via-transparent to-transparent pointer-events-none rounded-2xl" />

                        <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-4
                                bg-red-500/[0.10] backdrop-blur-sm
                                border border-red-500/[0.20]
                                shadow-[0_0_20px_rgba(239,68,68,0.15),inset_0_1px_0_rgba(255,100,100,0.1)]">
                                <Trash2 className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-sm font-bold text-white mb-1">Delete item?</p>
                            <p className="text-xs text-zinc-500 mb-5">This action cannot be undone.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 h-9 rounded-xl text-sm
                                        bg-white/[0.05] backdrop-blur-sm
                                        border border-white/[0.09]
                                        text-zinc-400 hover:text-white hover:bg-white/[0.10]
                                        transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteId)}
                                    className="flex-1 h-9 rounded-xl text-sm font-bold
                                        bg-red-500/80 hover:bg-red-500
                                        text-white
                                        shadow-[0_0_18px_rgba(239,68,68,0.3),inset_0_1px_0_rgba(255,150,150,0.15)]
                                        hover:shadow-[0_0_26px_rgba(239,68,68,0.45)]
                                        transition-all duration-200 active:scale-[0.98]"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}