// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";

// ── GET — admin fetches all orders ────────────────────────────────────────────
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");

        const query = status && status !== "all" ? { status } : {};
        const orders = await OrderModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, orders });
    } catch (err) {
        console.error("[GET /api/orders]", err);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

// ── POST — user places a new order ────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { items, total, type } = body;

        // Basic validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
        }
        if (!total || typeof total !== "number") {
            return NextResponse.json({ error: "Invalid total" }, { status: 400 });
        }
        if (!type || !["dine-in", "takeaway"].includes(type)) {
            return NextResponse.json({ error: "Type must be dine-in or takeaway" }, { status: 400 });
        }

        const user = session.user as any;

        const order = await OrderModel.create({
            items,
            total,
            type,
            customerName: user.username ?? user.name ?? "Guest",
            customerEmail: user.email,
            customerId: user._id ?? user.id,
            status: "pending",
        });

        // 🔔 Emit real-time notification to all connected admins
        const io = (global as any).io;
        if (io) {
            io.to("admins").emit("new:order", {
                id: order._id.toString(),
                customer: order.customerName,
                items: order.items,
                total: order.total,
                type: order.type,
                placedAt: new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            });
        }

        return NextResponse.json({
            success: true,
            orderId: order._id.toString(),
            order,
        }, { status: 201 });

    } catch (err) {
        console.error("[POST /api/orders]", err);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}