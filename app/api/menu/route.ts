// app/api/menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import MenuItem from "@/model/MenuItem";

// ── GET /api/menu — public, returns all available items ──────────────────────
export async function GET() {
  try {
    await dbConnect();
    const items = await MenuItem.find({ isAvailable: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/menu]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch menu" }, { status: 500 });
  }
}

// ── POST /api/menu — admin only, creates a new menu item ────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, description, price, category, image, isVeg, isBestseller } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { success: false, message: "name, description, price and category are required" },
        { status: 400 }
      );
    }

    const item = await MenuItem.create({
      name,
      description,
      price: Number(price),
      category,
      image: image ?? "",
      isVeg: isVeg ?? true,
      isBestseller: isBestseller ?? false,
      isAvailable: true,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/menu]", error);
    return NextResponse.json({ success: false, message: "Failed to create item" }, { status: 500 });
  }
}