// Sign up schema

import { z } from "zod";

export const  userNameValidation = z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers")

export const signUpSchema = z.object({
  userName: userNameValidation,
  email: z.email({ message: "Please provide a valid email" }),
   phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});