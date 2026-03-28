"use client";

import { useState } from "react";
import {
    Plus, Pencil, Trash2, X, Check, UtensilsCrossed, Search,
    ToggleLeft, ToggleRight,
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
        <div className="flex flex-col gap-4">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                    <p className="text-base font-bold text-white">Menu Items</p>
                    <p className="text-xs text-zinc-500">{items.length} items across {CATEGORIES.length} categories</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search items…"
                            className="w-full h-9 pl-8 pr-3 rounded-xl text-xs
                bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-zinc-600
                focus:outline-none focus:border-amber-500/40 transition-all"
                        />
                    </div>

                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold
              bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors flex-shrink-0"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {["all", ...CATEGORIES].map((c) => (
                    <button
                        key={c}
                        onClick={() => setCatFilter(c)}
                        className={`px-3 h-7 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${catFilter === c
                                ? "bg-amber-500 text-zinc-950"
                                : "bg-white/[0.04] border border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                            }`}
                    >
                        {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}
                    </button>
                ))}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((item) => (
                    <div
                        key={item._id}
                        className={`relative rounded-2xl border p-4 transition-all ${item.isAvailable
                                ? "bg-zinc-900/50 border-white/[0.07]"
                                : "bg-zinc-900/20 border-white/[0.03] opacity-60"
                            }`}
                    >
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                                {item.isBestseller && (
                                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Bestseller</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => openEdit(item)}
                                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                                >
                                    <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => setDeleteId(item._id)}
                                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm font-semibold text-white leading-snug line-clamp-1">{item.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{item.description}</p>

                        <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-bold text-amber-400 tabular-nums">₹{item.price}</span>

                            <button
                                onClick={() => toggleAvailable(item._id)}
                                className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
                            >
                                {item.isAvailable ? (
                                    <><ToggleRight className="h-4 w-4 text-green-400" /><span className="text-green-400">On</span></>
                                ) : (
                                    <><ToggleLeft className="h-4 w-4 text-zinc-600" /><span className="text-zinc-600">Off</span></>
                                )}
                            </button>
                        </div>

                        <span className="mt-2 inline-block text-[10px] text-zinc-600 capitalize">
                            {item.category.replace("-", " ")}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Add/Edit form modal ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowForm(false)}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.1] bg-zinc-900 p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-base font-bold text-white">
                                {editingId ? "Edit Item" : "Add New Item"}
                            </p>
                            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Name */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 mb-1 block">Name *</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Masala Chai"
                                    className="w-full h-9 px-3 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 mb-1 block">Description</label>
                                <input
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Short description…"
                                    className="w-full h-9 px-3 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all"
                                />
                            </div>

                            {/* Price + Category */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1 block">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={form.price || ""}
                                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full h-9 px-3 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1 block">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full h-9 px-3 rounded-xl text-sm bg-zinc-800 border border-white/[0.08] text-white focus:outline-none focus:border-amber-500/40 transition-all"
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
                            <div className="flex items-center gap-4 pt-1">
                                {[
                                    { key: "isVeg", label: "Veg" },
                                    { key: "isBestseller", label: "Bestseller" },
                                    { key: "isAvailable", label: "Available" },
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form[key as keyof typeof form] as boolean}
                                            onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                                            className="hidden"
                                        />
                                        <div
                                            className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${form[key as keyof typeof form]
                                                    ? "bg-amber-500 border-amber-500"
                                                    : "bg-transparent border-zinc-600"
                                                }`}
                                        >
                                            {form[key as keyof typeof form] && <Check className="h-3 w-3 text-zinc-950" />}
                                        </div>
                                        <span className="text-xs text-zinc-400">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 h-9 rounded-xl text-sm font-medium border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!form.name.trim() || form.price <= 0}
                                className="flex-1 h-9 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                {editingId ? "Save Changes" : "Add Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete confirm ── */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.1] bg-zinc-900 p-5 shadow-2xl text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
                            <Trash2 className="h-5 w-5 text-red-400" />
                        </div>
                        <p className="text-sm font-bold text-white mb-1">Delete item?</p>
                        <p className="text-xs text-zinc-500 mb-5">This action cannot be undone.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteId(null)} className="flex-1 h-9 rounded-xl text-sm border border-white/[0.08] text-zinc-400 hover:text-white transition-all">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteId)} className="flex-1 h-9 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}