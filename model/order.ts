import mongoose, { Schema, Document } from "mongoose";

export interface Order extends Document {
  content: string;
  customerName: string;
  customerEmail: string;
  customerId: mongoose.Types.ObjectId;  // reference to User
  status: "pending" | "accepted" | "rejected" | "delivered";
  createdAt: Date;
}

const OrderSchema: Schema<Order> = new Schema(
  
  {
    content: {
      type: String,
      required: [true, "Order content is required"],
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",                       // links to User model
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "delivered"],
      default: "pending",
    },
  },
  {
    timestamps: true,                    // auto createdAt & updatedAt
  }
);

const OrderModel =
  mongoose.models.Order as mongoose.Model<Order> ||
  mongoose.model<Order>("Order", OrderSchema);

export default OrderModel;