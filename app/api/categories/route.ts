import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import CategoryModel from "@/model/category";

export async function GET() {
    try {
        await dbConnect();
        const categories = await CategoryModel.find().sort({ createdAt: 1 });
        return NextResponse.json({ success: true, data: categories });
    } catch {
        return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        await dbConnect();
        const { name, icon } = await req.json();
        if (!name?.trim()) {
            return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
        }
        const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
        const category = await CategoryModel.create({ name: name.trim(), slug, icon: icon ?? "UtensilsCrossed" });
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (err: any) {
        if (err.code === 11000) {
            return NextResponse.json({ success: false, message: "Category already exists" }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // DB connect
        await dbConnect();

        // Parse body
        const { slug, icon } = await req.json();

        // Validation
        if (!slug) {
            return NextResponse.json(
                { success: false, message: "Slug required" },
                { status: 400 }
            );
        }

        // Update
        const updated = await CategoryModel.findOneAndUpdate(
            { slug },
            { $set: { icon } },
            { new: true }
        );

        // Not found case
        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        // Success
        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error("[PATCH /api/categories]", error);

        return NextResponse.json(
            { success: false, message: "Failed to update category" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        await dbConnect();
        const { slug } = await req.json();
        await CategoryModel.findOneAndDelete({ slug });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: "Failed to delete category" }, { status: 500 });
    }
}