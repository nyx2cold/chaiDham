import mongoose, { Schema, Document } from "mongoose";

export interface Order extends Document {
  orderNumber: number;
  customer: {
    userId: string;
    name: string;
    email: string;
  };
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    orderDetails?: string;
  }[];
  total: number;
  type: "dine-in" | "takeaway";
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<Order>(
  {
    orderNumber: { type: Number, unique: true },
    customer: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    items: [
      {
        menuItemId: String,
        name: String,
        price: Number,
        quantity: Number,
        orderDetails: String,
      },
    ],
    total: { type: Number, required: true },
    type: { type: String, enum: ["dine-in", "takeaway"], required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Auto-increment orderNumber
OrderSchema.pre("save", async function () {
  if (this.isNew) {
    const last = await mongoose
      .model("Order")
      .findOne()
      .sort({ orderNumber: -1 });
    this.orderNumber = last ? last.orderNumber + 1 : 1000;
  }
});

export default mongoose.models.Order ||
  mongoose.model<Order>("Order", OrderSchema);