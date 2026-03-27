import dbConnect from "@/lib/dbconnect";
import MenuItemModel from "@/model/menuItem";

export async function GET() {
  try {
    await dbConnect();

    const items = await MenuItemModel.find({ isAvailable: true }).sort({
      isFeatured: -1,
      createdAt: 1,
    });

    return Response.json(
      { success: true, items },
      { status: 200 }
    );

  } catch (error) {
    console.error("Menu fetch error:", error);
    return Response.json(
      { success: false, message: "Failed to fetch menu." },
      { status: 500 }
    );
  }
}