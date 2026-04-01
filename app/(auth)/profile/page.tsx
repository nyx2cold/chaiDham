// This page is used to display the user profile
"use client";

import { useState } from "react";
import type React from "react";

interface User {
    name: string;
    email: string;
    phone: string;
    initials: string;
    memberSince: string;
    totalOrders: number;
    totalSpent: number;
    favoriteItem: string;
}

interface Order {
    id: string;
    date: string;
    items: string[];
    total: number;
    status: "Delivered" | "Pending" | "Cancelled";
    type: "Dine In" | "Takeaway";
}

interface Address {
    label: string;
    address: string;
}

interface EditableField {
    label: string;
    value: string;
    editable: boolean;
}

type TabType = "orders" | "addresses" | "account";

const INITIAL_USER: User = {
    name: "Shivam",
    email: "shivam@example.com",
    phone: "+91 98765 43210",
    initials: "SH",
    memberSince: "March 2026",
    totalOrders: 12,
    totalSpent: 1480,
    favoriteItem: "Masala Chai",
};

const recentOrders: Order[] = [
    { id: "#CHD001", date: "29 Mar 2026", items: ["Cutting Chai", "Samosa x2"], total: 60, status: "Delivered", type: "Dine In" },
    { id: "#CHD002", date: "27 Mar 2026", items: ["Masala Chai", "Maggi"], total: 85, status: "Delivered", type: "Takeaway" },
    { id: "#CHD003", date: "25 Mar 2026", items: ["Elaichi Chai", "Veg Sandwich"], total: 75, status: "Cancelled", type: "Dine In" },
];

const addresses: Address[] = [
    { label: "Home", address: "42 Rajpur Road, Dehradun, Uttarakhand 248001" },
    { label: "College", address: "UPES Campus, Bidholi, Dehradun, Uttarakhand 248007" },
];

const statusStyle: Record<Order["status"], { bg: string; text: string; border: string }> = {
    Delivered: { bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
    Pending: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
    Cancelled: { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.3)" },
};

const glassCard: React.CSSProperties = {
    position: "relative",
    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.3)",
    borderRadius: 20,
};

const glassRow: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
};

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<TabType>("orders");
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [draftValue, setDraftValue] = useState<string>("");

    function startEdit(label: string, value: string): void {
        setEditingField(label);
        setDraftValue(value);
    }

    function saveEdit(label: string): void {
        const keyMap: Record<string, keyof User> = {
            "Full Name": "name",
            Email: "email",
            Phone: "phone",
        };
        const key = keyMap[label];
        if (key) setUser((u) => ({ ...u, [key]: draftValue }));
        setEditingField(null);
    }

    const editableFields: EditableField[] = [
        { label: "Full Name", value: user.name, editable: true },
        { label: "Email", value: user.email, editable: true },
        { label: "Phone", value: user.phone, editable: true },
        { label: "Member Since", value: user.memberSince, editable: false },
    ];

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0c0c0c",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            color: "#f5f0e8",
            padding: "2rem 1rem 4rem",
            overflowX: "hidden",
        }}>
            {/* Ambient glows */}
            <div style={{ position: "fixed", top: "-15%", left: "-10%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "fixed", bottom: "-10%", right: "-8%", width: "38vw", height: "38vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

            <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg,#eab308,#f59e0b)", boxShadow: "0 0 8px rgba(234,179,8,0.5)" }} />
                    <span style={{ fontSize: 11, color: "#6b5e3e", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>ChaiDham / Profile</span>
                </div>

                {/* ── Hero Card ── */}
                <div style={{ ...glassCard, padding: "1.75rem 2rem", marginBottom: "1.25rem", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(245,158,11,0.08)", filter: "blur(40px)", pointerEvents: "none" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", position: "relative" }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{
                                width: 76, height: 76, borderRadius: "50%",
                                background: "linear-gradient(135deg,#eab308,#f59e0b)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 26, fontWeight: 800, color: "#0c0c0c", letterSpacing: "-0.03em",
                                boxShadow: "0 0 0 3px rgba(234,179,8,0.2), 0 0 24px rgba(234,179,8,0.3)",
                            }}>{user.initials}</div>
                            <div style={{ position: "absolute", bottom: 3, right: 3, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "2px solid #0c0c0c", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 150 }}>
                            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.03em", color: "#fff" }}>{user.name}</h1>
                            <p style={{ fontSize: 13, color: "#a89060", margin: "3px 0 0" }}>{user.email}</p>
                            <p style={{ fontSize: 11, color: "#4a3f28", margin: "3px 0 0", letterSpacing: "0.04em" }}>Member since {user.memberSince}</p>
                        </div>

                        {/* Edit Profile → switches to account tab */}
                        <button
                            onClick={() => setActiveTab("account")}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "0.5rem 1.1rem",
                                background: "rgba(245,158,11,0.12)",
                                border: "1px solid rgba(245,158,11,0.35)",
                                borderRadius: 10,
                                color: "#fbbf24",
                                fontSize: 12, fontWeight: 700,
                                cursor: "pointer",
                                letterSpacing: "0.04em",
                                backdropFilter: "blur(8px)",
                                boxShadow: "0 2px 12px rgba(245,158,11,0.15)",
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.875rem", marginBottom: "1.25rem" }}>
                    {[
                        { label: "Total Orders", value: user.totalOrders },
                        { label: "Total Spent", value: `₹${user.totalSpent}` },
                        { label: "Favourite", value: user.favoriteItem },
                    ].map((s) => (
                        <div key={s.label} style={{ ...glassCard, padding: "1.1rem 1rem", textAlign: "center", borderRadius: 16 }}>
                            <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fbbf24", letterSpacing: "-0.03em", textShadow: "0 0 20px rgba(245,158,11,0.4)" }}>{s.value}</p>
                            <p style={{ fontSize: 10, color: "#6b5e3e", margin: "5px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <div style={{
                    display: "flex", gap: 4, marginBottom: "1.1rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 13, padding: 4,
                    backdropFilter: "blur(12px)",
                }}>
                    {["orders", "addresses", "account"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1, padding: "0.5rem 0", border: "none", cursor: "pointer",
                                fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                                borderRadius: 10, transition: "all 0.2s ease",
                                background: activeTab === tab ? "linear-gradient(135deg,#eab308,#f59e0b)" : "transparent",
                                color: activeTab === tab ? "#0c0c0c" : "#5a4e35",
                                boxShadow: activeTab === tab ? "0 2px 12px rgba(245,158,11,0.4)" : "none",
                            }}
                        >{tab}</button>
                    ))}
                </div>

                {/* ── Tab: Orders ── */}
                {activeTab === "orders" && (
                    <div style={{ ...glassCard, overflow: "hidden" }}>
                        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, transparent 100%)", display: "flex", alignItems: "center", gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Recent Orders</p>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }}>
                                {recentOrders.length}
                            </span>
                            <span style={{ marginLeft: 4, fontSize: 10, color: "#4a3f28" }}>Live kitchen feed</span>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        {["Order", "Items", "Type", "Status", "Date", "Total"].map((h) => (
                                            <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#4a3f28", textTransform: "uppercase", letterSpacing: "0.12em" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, i) => {
                                        const s = statusStyle[order.status];
                                        return (
                                            <tr key={order.id} style={{
                                                borderBottom: i < recentOrders.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                                                background: i % 2 !== 0 ? "rgba(255,255,255,0.015)" : "transparent",
                                            }}>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#fbbf24" }}>{order.id}</span>
                                                </td>
                                                <td style={{ padding: "12px 16px", color: "#a89060", maxWidth: 180 }}>
                                                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.items.join(", ")}</span>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                                                        background: order.type === "Dine In" ? "rgba(14,165,233,0.12)" : "rgba(139,92,246,0.12)",
                                                        color: order.type === "Dine In" ? "#38bdf8" : "#a78bfa",
                                                        border: order.type === "Dine In" ? "1px solid rgba(14,165,233,0.25)" : "1px solid rgba(139,92,246,0.25)",
                                                    }}>{order.type}</span>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px 16px", color: "#6b5e3e", fontSize: 11 }}>{order.date}</td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <span style={{ fontWeight: 800, color: "#fff", fontSize: 13, textShadow: "0 0 20px rgba(245,158,11,0.3)" }}>₹{order.total}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Tab: Addresses ── */}
                {activeTab === "addresses" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {addresses.map((addr) => (
                            <div key={addr.label} style={{ ...glassRow, padding: "1.1rem 1.4rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                                }}>
                                    {addr.label === "Home" ? "🏠" : "🎓"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.1em" }}>{addr.label}</p>
                                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "#a89060", lineHeight: 1.5 }}>{addr.address}</p>
                                </div>
                                <button style={{
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8, padding: "0.3rem 0.8rem",
                                    color: "#6b5e3e", fontSize: 11, fontWeight: 600, cursor: "pointer",
                                }}>Edit</button>
                            </div>
                        ))}
                        <button style={{
                            background: "rgba(245,158,11,0.06)", border: "1px dashed rgba(245,158,11,0.25)",
                            borderRadius: 14, padding: "0.9rem", color: "#fbbf24",
                            fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em",
                        }}>+ Add New Address</button>
                    </div>
                )}

                {/* ── Tab: Account (inline editable) ── */}
                {activeTab === "account" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {editableFields.map((field) => {
                            const isEditing = editingField === field.label;
                            return (
                                <div key={field.label} style={{
                                    ...glassRow,
                                    padding: "1rem 1.4rem",
                                    display: "flex", alignItems: "center", gap: "1rem",
                                    border: isEditing ? "1px solid rgba(245,158,11,0.45)" : "1px solid rgba(255,255,255,0.08)",
                                    boxShadow: isEditing ? "0 0 0 3px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
                                    transition: "border 0.2s ease, box-shadow 0.2s ease",
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#4a3f28", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                            {field.label}
                                        </p>
                                        {isEditing ? (
                                            <input
                                                autoFocus
                                                value={draftValue}
                                                onChange={(e) => setDraftValue(e.target.value)}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                    if (e.key === "Enter") saveEdit(field.label);
                                                    if (e.key === "Escape") setEditingField(null);
                                                }}
                                                style={{
                                                    marginTop: 6, width: "100%",
                                                    background: "rgba(255,255,255,0.06)",
                                                    border: "1px solid rgba(245,158,11,0.4)",
                                                    borderRadius: 8, padding: "0.45rem 0.75rem",
                                                    color: "#fff", fontSize: 14, fontWeight: 500,
                                                    outline: "none", fontFamily: "inherit",
                                                }}
                                            />
                                        ) : (
                                            <p style={{ margin: "5px 0 0", fontSize: 14, fontWeight: 500, color: "#e2d5b8" }}>{field.value}</p>
                                        )}
                                    </div>

                                    {field.editable && (
                                        isEditing ? (
                                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                                <button
                                                    onClick={() => saveEdit(field.label)}
                                                    style={{
                                                        padding: "0.35rem 0.9rem", borderRadius: 8, border: "none", cursor: "pointer",
                                                        background: "linear-gradient(135deg,#eab308,#f59e0b)",
                                                        color: "#0c0c0c", fontSize: 11, fontWeight: 800,
                                                        boxShadow: "0 2px 10px rgba(245,158,11,0.35)",
                                                    }}
                                                >Save</button>
                                                <button
                                                    onClick={() => setEditingField(null)}
                                                    style={{
                                                        padding: "0.35rem 0.75rem", borderRadius: 8, cursor: "pointer",
                                                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                                        color: "#6b5e3e", fontSize: 11, fontWeight: 600,
                                                    }}
                                                >Cancel</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(field.label, field.value)}
                                                style={{
                                                    background: "transparent", border: "none",
                                                    color: "#fbbf24", fontSize: 12, fontWeight: 700,
                                                    cursor: "pointer", flexShrink: 0, letterSpacing: "0.03em",
                                                    padding: "0.25rem 0.5rem",
                                                }}
                                            >Change</button>
                                        )
                                    )}
                                </div>
                            );
                        })}

                        <button style={{
                            marginTop: 4, width: "100%",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: 14, padding: "0.875rem",
                            color: "#f87171", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.04em",
                            backdropFilter: "blur(8px)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                        }}>
                            Log Out
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}