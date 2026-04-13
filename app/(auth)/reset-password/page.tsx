"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import axios, { AxiosError } from "axios"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const resetSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  })

  const onSubmit = async (data: z.infer<typeof resetSchema>) => {
    setIsSubmitting(true)
    const toastId = toast.loading("Resetting your password...")

    try {
      await axios.post("/api/reset-password", {
        email,
        code: data.code,
        newPassword: data.newPassword,
      })
      toast.success("Password reset successfully! Please sign in.", { id: toastId })
      router.push("/sign-in")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.response?.data.message ?? "Reset failed.", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className={cn("flex flex-col gap-6 w-full max-w-md")}>
        <Card className="bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-white">
              Reset password
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Enter the code sent to{" "}
              <span className="text-amber-400 font-medium">{email}</span> and your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* OTP */}
              <div className="flex flex-col items-center space-y-3">
                <Controller
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="bg-zinc-800 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-red-400">{form.formState.errors.code.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-sm font-medium text-zinc-300">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("newPassword")}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-red-400">{form.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("confirmPassword")}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || form.watch("code").length < 6}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50"
              >
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}