import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: "chai" | "snacks" | "maggi" | "cold-drinks" | "specials";
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    category:    {
      type: String,
      required: true,
      enum: ["chai", "snacks", "maggi", "cold-drinks", "specials"],
    },
    image:        { type: String, default: "" },
    isVeg:        { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    isAvailable:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;