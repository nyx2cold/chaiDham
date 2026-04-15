"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import axios, { AxiosError } from "axios"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
    <div className="flex min-h-screen bg-zinc-950">

      {/* ══════════════════════════════════════
          LEFT PANEL — desktop only (40%)
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex w-[40%] flex-col justify-between bg-zinc-900 border-r border-zinc-800 px-12 py-10 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-amber-600/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase mb-6">
            Almost there
          </p>
          <h1 className="text-[clamp(3.5rem,6vw,5.5rem)] font-black leading-[0.9] tracking-tight text-white">
            Reset<br />
            <span className="text-amber-400">Password.</span>
          </h1>
          <p className="mt-8 text-zinc-400 text-base leading-relaxed max-w-xs">
            We sent a 6-digit code to{" "}
            <span className="text-amber-400 font-medium break-all">{email}</span>.
            Enter it along with your new password.
          </p>
        </div>

        <p className="relative z-10 text-zinc-600 text-xs">
          © {new Date().getFullYear()} ChaiDham · All rights reserved
        </p>
      </div>

      {/* ══════════════════════════════════════
          RIGHT / MOBILE — full screen on mobile
      ══════════════════════════════════════ */}
      <div className="flex flex-1 flex-col lg:items-center lg:justify-center">

        {/* ── MOBILE HERO ── */}
        <div
          className="lg:hidden relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #18181b 0%, #111110 60%, #1c1508 100%)",
            minHeight: "52vw",
            paddingTop: "3.5rem",
            paddingBottom: "3rem",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: "280px", height: "280px",
              top: "-80px", right: "-80px",
              background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: "180px", height: "180px",
              bottom: "-40px", left: "-40px",
              background: "radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute left-0 top-8 bottom-8 w-1 rounded-r-full"
            style={{ background: "linear-gradient(180deg, transparent, #f59e0b, transparent)" }}
          />

          <div className="relative z-10">
            <p
              className="font-semibold uppercase mb-2"
              style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#a16207" }}
            >
              Almost there
            </p>
            <h1
              className="font-black text-white leading-none tracking-tight"
              style={{ fontSize: "clamp(3.2rem, 16vw, 5.5rem)" }}
            >
              Reset<br />
              <span className="text-amber-400">Password.</span>
            </h1>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-xs">
              Check your inbox for the 6-digit code.
            </p>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.5) 50%, transparent 100%)" }}
          />
        </div>

        {/* ── FORM AREA ── */}
        <div className="flex-1 flex items-start lg:items-center justify-center w-full px-6 pt-8 pb-10 lg:px-16 lg:py-14">
          <div className="w-full max-w-sm">

            {/* desktop heading */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-semibold text-white mb-1">
                Set a new password
              </h2>
              <p className="text-zinc-400 text-sm">
                Code sent to{" "}
                <span className="text-amber-400 font-medium">{email}</span>
              </p>
            </div>

            {/* mobile label */}
            <p className="lg:hidden text-zinc-400 text-sm mb-2">
              Code sent to{" "}
              <span className="text-amber-400 font-medium break-all">{email}</span>
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6">

              {/* OTP slots */}
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
                            className="bg-zinc-900 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500 focus:ring-amber-500/20"
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
                  New password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("newPassword")}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-red-400">{form.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("confirmPassword")}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || form.watch("code").length < 6}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-semibold transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Resetting…" : "Reset password"}
              </Button>
            </form>

            {/* Back to sign in */}
            <p className="mt-6 text-center text-sm text-zinc-500">
              Remembered your password?{" "}
              <a
                href="/sign-in"
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Sign in
              </a>
            </p>

            {/* mobile footer */}
            <p className="lg:hidden mt-3 text-center text-zinc-700 text-xs">
              © {new Date().getFullYear()} ChaiDham · All rights reserved
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}