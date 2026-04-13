"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus, Pencil, Trash2, X, Check, Search,
    ToggleLeft, ToggleRight, Sparkles, Loader2,
    ImagePlus, UtensilsCrossed, Settings2,
} from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from "lucide-react";

// Icon map for categories
const CATEGORY_ICONS: Record<string, string> = {
    Coffee: "Coffee",
    Sandwich: "Sandwich",
    Soup: "Soup",
    GlassWater: "GlassWater",
    Star: "Star",
    Pizza: "Pizza",
    Beef: "Beef",
    Salad: "Salad",
    IceCream: "IceCream",
    Cookie: "Cookie",
    Cake: "Cake",
    Utensils: "Utensils",
    UtensilsCrossed: "UtensilsCrossed",
    ShoppingBag: "ShoppingBag",
    Flame: "Flame",
};

// Dynamic icon renderer
function CategoryIcon({ name, className }: { name: string; className?: string }) {
    const Icon = (LucideIcons as any)[name] as React.FC<{ className?: string }>;
    if (!Icon) return <LucideIcons.UtensilsCrossed className={className} />;
    return <Icon className={className} />;
}

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

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon: string;
}

type FormData = Omit<MenuItem, "_id">;

const BLANK: FormData = {
    name: "", description: "", price: 0,
    category: "", image: "",
    isVeg: true, isBestseller: false, isAvailable: true,
};

const ICON_OPTIONS = Object.keys(CATEGORY_ICONS);
// ── Upload helper ─────────────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Upload failed");
    return data.url as string;
}

// ── Item image ────────────────────────────────────────────────────────────────

function ItemImage({ src, name }: { src: string; name: string }) {
    const [errored, setErrored] = useState(false);
    if (src && !errored) {
        return <img src={src} alt={name} onError={() => setErrored(true)} className="h-full w-full object-cover" />;
    }
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-zinc-800/60">
            <UtensilsCrossed className="h-6 w-6 text-zinc-600" />
            <span className="text-[10px] text-zinc-600">No photo</span>
        </div>
    );
}

// ── Image upload zone ─────────────────────────────────────────────────────────

function ImageUploadZone({ current, onUpload }: { current: string; onUpload: (url: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState(current);
    const [localUploading, setLocalUploading] = useState(false);

    useEffect(() => { setPreview(current); }, [current]);

    async function handleFile(file: File) {
        if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
        setPreview(URL.createObjectURL(file));
        setLocalUploading(true);
        try {
            const url = await uploadImage(file);
            onUpload(url);
            toast.success("Image uploaded!");
        } catch {
            setPreview(current);
            toast.error("Image upload failed");
        } finally {
            setLocalUploading(false);
        }
    }

    return (
        <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Photo</label>
            <div
                onClick={() => !localUploading && inputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onDragOver={(e) => e.preventDefault()}
                className={`relative h-32 rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${localUploading ? "border-amber-500/40 cursor-not-allowed" : "border-white/[0.12] hover:border-amber-500/40 hover:bg-white/[0.03]"}`}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to change</span>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]"><ImagePlus className="h-5 w-5 text-zinc-500" /></div>
                        <p className="text-xs text-zinc-500">Click or drag to upload</p>
                        <p className="text-[10px] text-zinc-700">PNG, JPG up to 5MB</p>
                    </div>
                )}
                {localUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                        <span className="text-xs text-amber-400">Uploading…</span>
                    </div>
                )}
                {preview && !localUploading && (
                    <button onClick={(e) => { e.stopPropagation(); setPreview(""); onUpload(""); }}
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors">
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </div>
    );
}

// ── Category Manager Modal ────────────────────────────────────────────────────

function CategoryManager({ categories, onClose, onUpdate }: {
    categories: Category[];
    onClose: () => void;
    onUpdate: (cats: Category[]) => void;
}) {
    const [newName, setNewName] = useState("");
    const [newIcon, setNewIcon] = useState(ICON_OPTIONS[0]);
    const [adding, setAdding] = useState(false);
    const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

    async function handleAdd() {
        if (!newName.trim()) return;
        setAdding(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim(), icon: newIcon }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            onUpdate([...categories, data.data]);
            setNewName("");
            setNewIcon(ICON_OPTIONS[0]);
            toast.success("Category added!");
        } catch (err: any) {
            toast.error(err.message ?? "Failed to add category");
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(slug: string) {
        setDeletingSlug(slug);
        try {
            const res = await fetch("/api/categories", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            onUpdate(categories.filter((c) => c.slug !== slug));
            toast.success("Category deleted");
        } catch (err: any) {
            toast.error(err.message ?? "Failed to delete category");
        } finally {
            setDeletingSlug(null);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-bold text-white">Manage Categories</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Add or remove menu categories</p>
                        </div>
                        <button onClick={onClose}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.07] border border-white/[0.10] text-zinc-400 hover:text-white transition-all">
                            <X className="h-4 w-4" />
                        </button>
                    </div>


                    {/* Existing categories */}
                    <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
                        {categories.length === 0 && (
                            <p className="text-xs text-zinc-600 text-center py-4">No categories yet</p>
                        )}

                        {categories.map((cat) => (
                            <div key={cat._id}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                                <div className="flex items-center gap-2.5">
                                    <CategoryIcon name={cat.icon} className="h-4 w-4 text-zinc-300" />
                                    <div>
                                        <p className="text-xs font-semibold text-white">{cat.name}</p>
                                        <p className="text-[10px] text-zinc-600">{cat.slug}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.slug)}
                                    disabled={deletingSlug === cat.slug}
                                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                                >
                                    {deletingSlug === cat.slug
                                        ? <Loader2 className="h-3 w-3 animate-spin" />
                                        : <Trash2 className="h-3 w-3" />
                                    }
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add new */}
                    <div className="border-t border-white/[0.06] pt-4">
                        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Add New Category</p>

                        {/* Icon picker */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {ICON_OPTIONS.map((iconName) => (
                                <button key={iconName} onClick={() => setNewIcon(iconName)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newIcon === iconName
                                        ? "bg-amber-500/20 border border-amber-500/40"
                                        : "bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08]"}`}>
                                    <CategoryIcon name={iconName} className="h-4 w-4 text-zinc-300" />
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                placeholder="Category name…"
                                className="flex-1 h-9 px-3 rounded-xl text-sm bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={adding || !newName.trim()}
                                className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold bg-amber-500/90 hover:bg-amber-400 text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                            >
                                {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5" />Add</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MenuManager() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [showCatManager, setShowCatManager] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(BLANK);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    async function fetchAll() {
        try {
            const [menuRes, catRes] = await Promise.all([
                fetch("/api/menu?all=true"),
                fetch("/api/categories"),
            ]);
            const menuData = await menuRes.json();
            const catData = await catRes.json();
            if (menuData.success) setItems(menuData.data);
            if (catData.success) {
                setCategories(catData.data);
                // set default category for blank form
                if (catData.data.length > 0) {
                    setForm((prev) => ({ ...prev, category: prev.category || catData.data[0].slug }));
                }
            }
        } catch {
            toast.error("Failed to load menu");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchAll(); }, []);

    const filtered = items.filter((i) => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter === "all" || i.category === catFilter;
        return matchSearch && matchCat;
    });

    // ── Open forms ────────────────────────────────────────────────────────────
    function openAdd() {
        setForm({ ...BLANK, category: categories[0]?.slug ?? "" });
        setEditingId(null);
        setShowForm(true);
    }

    function openEdit(item: MenuItem) {
        const { _id, ...rest } = item;
        setForm(rest);
        setEditingId(_id);
        setShowForm(true);
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    async function handleSave() {
        if (!form.name.trim() || form.price <= 0) return;
        setSaving(true);
        try {
            if (editingId) {
                const res = await fetch(`/api/menu/${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                setItems((prev) => prev.map((i) => i._id === editingId ? data.data : i));
                toast.success("Item updated!");
            } else {
                const res = await fetch("/api/menu", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                setItems((prev) => [data.data, ...prev]);
                toast.success("Item added!");
            }
            setShowForm(false);
            setEditingId(null);
        } catch (err: any) {
            toast.error(err.message ?? "Failed to save item");
        } finally {
            setSaving(false);
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setItems((prev) => prev.filter((i) => i._id !== id));
            toast.success("Item deleted");
        } catch (err: any) {
            toast.error(err.message ?? "Failed to delete item");
        } finally {
            setDeleteId(null);
        }
    }

    // ── Toggle ────────────────────────────────────────────────────────────────
    async function toggleAvailable(item: MenuItem) {
        setTogglingId(item._id);
        try {
            const res = await fetch(`/api/menu/${item._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAvailable: !item.isAvailable }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setItems((prev) => prev.map((i) => i._id === item._id ? data.data : i));
        } catch {
            toast.error("Failed to update availability");
        } finally {
            setTogglingId(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading menu…</span>
            </div>
        );
    }

    const getCatIcon = (slug: string) => categories.find((c) => c.slug === slug)?.icon ?? "";
    const getCatName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

    return (
        <div className="flex flex-col gap-5">

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                    <p className="text-base font-bold text-white">Menu Items</p>
                    <p className="text-xs text-zinc-500">{items.length} items across {categories.length} categories</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-52">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items…"
                            className="w-full h-9 pl-9 pr-3 rounded-xl text-xs bg-white/[0.06] backdrop-blur-md border border-white/[0.10] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all" />
                    </div>
                    {/* Manage categories button */}
                    <button onClick={() => setShowCatManager(true)}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold flex-shrink-0 bg-white/[0.05] border border-white/[0.09] text-zinc-400 hover:text-white hover:bg-white/[0.09] transition-all">
                        <Settings2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Categories</span>
                    </button>
                    <button onClick={openAdd}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold flex-shrink-0 bg-amber-500/90 hover:bg-amber-400 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all active:scale-[0.97]">
                        <Plus className="h-3.5 w-3.5" />Add Item
                    </button>
                </div>
            </div>

            {/* ── Category pills ── */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button onClick={() => setCatFilter("all")}
                    className={`px-3.5 h-7 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${catFilter === "all" ? "bg-amber-500/90 text-zinc-950 shadow-[0_0_14px_rgba(245,158,11,0.4)]" : "bg-white/[0.05] border border-white/[0.08] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.09]"}`}>
                    All
                </button>
                {categories.map((cat) => (
                    <button key={cat.slug} onClick={() => setCatFilter(cat.slug)}
                        className={`flex items-center gap-1.5 px-3.5 h-7 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${catFilter === cat.slug ? "bg-amber-500/90 text-zinc-950 shadow-[0_0_14px_rgba(245,158,11,0.4)]" : "bg-white/[0.05] border border-white/[0.08] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.09]"}`}>
                        <CategoryIcon name={cat.icon} className="h-3 w-3" />{cat.name}
                    </button>
                ))}
            </div>

            {/* ── Items grid ── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.07]">
                        <UtensilsCrossed className="h-6 w-6 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">No items found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map((item) => (
                        <div key={item._id}
                            className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 ${item.isAvailable
                                ? "bg-white/[0.05] backdrop-blur-xl border-white/[0.09] hover:border-white/[0.18] hover:bg-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]"
                                : "bg-white/[0.02] border-white/[0.04] opacity-50"}`}>
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                            <div className="h-36 overflow-hidden"><ItemImage src={item.image} name={item.name} /></div>
                            <div className="p-3.5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]"}`} />
                                        {item.isBestseller && (
                                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                                                <Sparkles className="h-2.5 w-2.5" />Bestseller
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(item)}
                                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.07] border border-white/[0.10] text-zinc-400 hover:text-white hover:bg-white/[0.14] transition-all">
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button onClick={() => setDeleteId(item._id)}
                                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/[0.08] border border-red-500/[0.15] text-red-500/60 hover:text-red-400 hover:bg-red-500/[0.18] transition-all">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-white line-clamp-1">{item.name}</p>
                                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{item.description}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-sm font-bold text-amber-400 tabular-nums drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">₹{item.price}</span>
                                    <button onClick={() => toggleAvailable(item)} disabled={togglingId === item._id}
                                        className="flex items-center gap-1.5 text-[11px] font-semibold transition-all disabled:opacity-50">
                                        {togglingId === item._id
                                            ? <Loader2 className="h-4 w-4 text-zinc-500 animate-spin" />
                                            : item.isAvailable
                                                ? <><ToggleRight className="h-4 w-4 text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]" /><span className="text-green-400">On</span></>
                                                : <><ToggleLeft className="h-4 w-4 text-zinc-600" /><span className="text-zinc-600">Off</span></>
                                        }
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-500">
                                        <CategoryIcon name={getCatIcon(item.category)} className="h-3 w-3 inline-block mr-1" />
                                        {getCatName(item.category)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Add / Edit Modal ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !saving && setShowForm(false)} />
                    <div className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] max-h-[90vh] overflow-y-auto">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-transparent pointer-events-none rounded-2xl" />

                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-base font-bold text-white">{editingId ? "Edit Item" : "Add New Item"}</p>
                                <button onClick={() => !saving && setShowForm(false)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.07] border border-white/[0.10] text-zinc-400 hover:text-white transition-all">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <ImageUploadZone
                                    current={form.image}
                                    onUpload={(url) => setForm((prev) => ({ ...prev, image: url }))}
                                />

                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Name *</label>
                                    <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Masala Chai"
                                        className="w-full h-9 px-3 rounded-xl text-sm bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all" />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description</label>
                                    <input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Short description…"
                                        className="w-full h-9 px-3 rounded-xl text-sm bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Price (₹) *</label>
                                        <input type="number" value={form.price || ""} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                                            placeholder="0"
                                            className="w-full h-9 px-3 rounded-xl text-sm bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Category</label>
                                        {/* ── shadcn Select ── */}
                                        <Select
                                            value={form.category}
                                            onValueChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                                        >
                                            <SelectTrigger className="w-full h-9 rounded-xl text-sm bg-zinc-800/90 border border-white/[0.10] text-white focus:ring-amber-500/50 focus:border-amber-500/50">
                                                <SelectValue placeholder="Select category">
                                                    {form.category && (
                                                        <span className="flex items-center gap-2">
                                                            <CategoryIcon name={getCatIcon(form.category)} className="h-3.5 w-3.5" />
                                                            <span>{getCatName(form.category)}</span>
                                                        </span>
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border border-white/[0.12] rounded-xl shadow-xl">
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.slug} value={cat.slug}
                                                        className="text-white hover:bg-white/[0.07] focus:bg-white/[0.07] rounded-lg cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                                                            <span>{cat.name}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                                {categories.length === 0 && (
                                                    <div className="px-3 py-4 text-xs text-zinc-500 text-center">
                                                        No categories yet —{" "}
                                                        <button onClick={() => { setShowForm(false); setShowCatManager(true); }}
                                                            className="text-amber-400 underline">add one first</button>
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 pt-1">
                                    {[
                                        { key: "isVeg", label: "Veg" },
                                        { key: "isBestseller", label: "Bestseller" },
                                        { key: "isAvailable", label: "Available" },
                                    ].map(({ key, label }) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer group/check">
                                            <input type="checkbox" checked={form[key as keyof FormData] as boolean}
                                                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }))} className="hidden" />
                                            <div className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all ${form[key as keyof FormData]
                                                ? "bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                                                : "bg-white/[0.04] border-white/[0.15] group-hover/check:border-white/[0.25]"}`}>
                                                {form[key as keyof FormData] && <Check className="h-3 w-3 text-zinc-950" strokeWidth={3} />}
                                            </div>
                                            <span className="text-xs text-zinc-400 group-hover/check:text-zinc-200 transition-colors">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button onClick={() => !saving && setShowForm(false)}
                                    className="flex-1 h-9 rounded-xl text-sm bg-white/[0.05] border border-white/[0.09] text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving || !form.name.trim() || form.price <= 0 || !form.category}
                                    className="flex-1 h-9 rounded-xl text-sm font-bold bg-amber-500/90 hover:bg-amber-400 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : editingId ? "Save Changes" : "Add Item"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete confirm ── */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeleteId(null)} />
                    <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] text-center p-5">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent pointer-events-none" />
                        <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-4 bg-red-500/10 border border-red-500/20">
                                <Trash2 className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-sm font-bold text-white mb-1">Delete item?</p>
                            <p className="text-xs text-zinc-500 mb-5">This action cannot be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setDeleteId(null)}
                                    className="flex-1 h-9 rounded-xl text-sm bg-white/[0.05] border border-white/[0.09] text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-all">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteId)}
                                    className="flex-1 h-9 rounded-xl text-sm font-bold bg-red-500/80 hover:bg-red-500 text-white shadow-[0_0_18px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98]">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Category manager modal ── */}
            {showCatManager && (
                <CategoryManager
                    categories={categories}
                    onClose={() => setShowCatManager(false)}
                    onUpdate={(cats) => {
                        setCategories(cats);
                        if (cats.length > 0 && !cats.find((c) => c.slug === form.category)) {
                            setForm((prev) => ({ ...prev, category: cats[0].slug }));
                        }
                    }}
                />
            )}
        </div>
    );
}