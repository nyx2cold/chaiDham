import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbconnect"
import OrderModel from "@/model/order"
import UserModel from "@/model/user"
import type { Session } from "next-auth"

// Typed session user — matches your User model + next-auth.d.ts
interface SessionUser {
    id: string
    email: string
    name?: string
    username?: string
    role: "admin" | "user"
    isBanned: boolean
}

interface OrderPostBody {
    items: Array<{
        menuItemId: string
        name: string
        price: number
        quantity: number
        orderDetails?: string
    }>
    total: number
    type: "dine-in" | "takeaway"
}

// ─── GET /api/orders  (admin only) ───────────────────────────────────────────
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as SessionUser | undefined

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status")
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)

        const query = status && status !== "all" ? { status } : {}

        const orders = await OrderModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()

        return NextResponse.json({ success: true, orders })
    } catch (err) {
        console.error("[GET /api/orders]", err)
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
}

// ─── POST /api/orders  (authenticated users) ─────────────────────────────────
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as SessionUser | undefined

        if (!user) {
            return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 })
        }

        await dbConnect()

        // Always re-check ban status from DB — never trust the token alone for writes
        const freshUser = await UserModel.findById(user.id).select("isBanned").lean()
        if (!freshUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        if (freshUser.isBanned) {
            return NextResponse.json(
                { error: "Your account has been suspended. You cannot place orders." },
                { status: 403 }
            )
        }

        const body = await req.json() as Partial<OrderPostBody>
        const { items, total, type } = body

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 })
        }
        if (typeof total !== "number" || total <= 0) {
            return NextResponse.json({ error: "Invalid total" }, { status: 400 })
        }
        if (!type || !["dine-in", "takeaway"].includes(type)) {
            return NextResponse.json({ error: "Type must be dine-in or takeaway" }, { status: 400 })
        }

        // Validate each item has required fields
        for (const item of items) {
            if (!item.menuItemId || !item.name || typeof item.price !== "number" || item.quantity < 1) {
                return NextResponse.json({ error: "Invalid item in order" }, { status: 400 })
            }
        }

        const order = await OrderModel.create({
            items,
            total,
            type,
            customer: {
                // username is your app's primary display name; fall back to name from OAuth
                name: user.username ?? user.name ?? "Guest",
                email: user.email,
                userId: user.id,
            },
            status: "pending",
        })

        // NOTE: Points are awarded only on completion (PATCH handler).
        // Awarding on placement then again on completion causes double-counting.
        // If you want "pending points" shown to users, store them separately as
        // pendingPoints and only move them to browniePoints on completion.

        return NextResponse.json(
            { success: true, orderId: order._id.toString(), order },
            { status: 201 }
        )
    } catch (err) {
        console.error("[POST /api/orders]", err)
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 })
    }
}