import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
    name: string;
    qty: number;
    price: number;
}

export interface IOrder extends Document {
    items: IOrderItem[];
    total: number;
    type: "dine-in" | "takeaway";
    customerName: string;
    customerEmail: string;
    customerId: mongoose.Types.ObjectId;
    status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (v: IOrderItem[]) => v.length > 0,
                message: "Order must have at least one item",
            },
        },
        total: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["dine-in", "takeaway"],
            required: true,
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
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "preparing", "ready", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const OrderModel =
    (mongoose.models.Order as mongoose.Model<IOrder>) ||
    mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;