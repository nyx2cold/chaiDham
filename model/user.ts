import mongoose, { Schema, Document } from "mongoose"

export interface User extends Document {
  userName: string
  email: string
  phone: string
  password: string
  role: "admin" | "user"
  verifyCode: string
  verifyCodeExpire: Date
  isVerified: boolean
  isAcceptingOrders: boolean
  resetCode: string | null
  resetCodeExpire: Date | null
  browniePoints: number
}

const UserSchema: Schema<User> = new Schema(
  {
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
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number",
      ],
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
    resetCode: {
      type: String,
      default: null,
    },
    resetCodeExpire: {
      type: Date,
      default: null,
    },
    browniePoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
)

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema)

export default UserModel
