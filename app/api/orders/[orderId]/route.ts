import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";

const VALID_STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];

const NEXT_STATUS: Record<string, string> = {
  pending:   "preparing",
  preparing: "ready",
  ready:     "completed",
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await OrderModel.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 🔔 Emit real-time status update to the specific customer
    const io = (global as any).io;
    if (io) {
      // Notify the specific user's room
      io.to(`user:${(order as any).customerId}`).emit("order:statusUpdate", {
        orderId:     params.id,
        orderNumber: (order as any).orderNumber,
        status,
        updatedAt:   new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit",
        }),
      });

      // Also broadcast to all admins so their tables update
      io.to("admins").emit("order:statusUpdate", {
        orderId: params.id,
        status,
      });
    }

    return NextResponse.json({ success: true, order });

  } catch (err) {
    console.error("[PATCH /api/orders/[id]/status]", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

// GET a single order — used by user to check their order status
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const order = await OrderModel.findById(params.id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Users can only see their own orders; admins can see all
    const user = session.user as any;
    const isAdmin = user?.role === "admin";
    const isOwner = (order as any).customerId?.toString() === (user._id ?? user.id)?.toString();

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });

  } catch (err) {
    console.error("[GET /api/orders/[id]/status]", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}