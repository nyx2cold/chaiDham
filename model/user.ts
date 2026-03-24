import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
  role: "admin" | "user";
  verifyCode: string;
  verifyCodeExpire: Date;
  isVerified: boolean;
  isAcceptingOrders: boolean; // Only meaningful for admin
}

const UserSchema: Schema<User> = new Schema({
  userName: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"],
  },
  verifyCodeExpire: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingOrders: {
    type: Boolean,
    default: true,
  },
});

const UserModel =
  mongoose.models.User as mongoose.Model<User> ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;