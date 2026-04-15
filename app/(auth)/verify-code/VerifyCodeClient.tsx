"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import axios, { AxiosError } from "axios"
import * as z from "zod"
import { verifyEmailSchema } from "@/schemas/verifyEmailSchema"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export default function VerifyCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  })

  const onSubmit = async (data: z.infer<typeof verifyEmailSchema>) => {
    setIsSubmitting(true)
    const toastId = toast.loading("Verifying your code...")
    try {
      const response = await axios.post("/api/verify-code", { email, code: data.code })
      toast.success(response.data.message, { id: toastId })
      router.push("/sign-in")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.response?.data.message ?? "Verification failed.", { id: toastId })
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
            One last step
          </p>
          <h1 className="text-[clamp(3.5rem,6vw,5.5rem)] font-black leading-[0.9] tracking-tight text-white">
            Verify<br />
            <span className="text-amber-400">Email.</span>
          </h1>
          <p className="mt-8 text-zinc-400 text-base leading-relaxed max-w-xs">
            We sent a 6-digit code to{" "}
            <span className="text-amber-400 font-medium break-all">{email}</span>.
            Enter it to activate your account.
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
              One last step
            </p>
            <h1
              className="font-black text-white leading-none tracking-tight"
              style={{ fontSize: "clamp(3.2rem, 16vw, 5.5rem)" }}
            >
              Verify<br />
              <span className="text-amber-400">Email.</span>
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
                Check your inbox
              </h2>
              <p className="text-zinc-400 text-sm">
                We sent a 6-digit code to{" "}
                <span className="text-amber-400 font-medium">{email}</span>
              </p>
            </div>

            {/* mobile label */}
            <p className="lg:hidden text-zinc-400 text-sm mb-2">
              Code sent to{" "}
              <span className="text-amber-400 font-medium break-all">{email}</span>
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">

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

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || form.watch("code").length < 6}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-semibold transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Verifying…" : "Verify email"}
              </Button>
            </form>

            {/* Resend */}
            <p className="mt-6 text-center text-sm text-zinc-500">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={async () => {
                  const toastId = toast.loading("Resending code...")
                  try {
                    await axios.post("/api/resend-code", { email })
                    toast.success("New code sent to your email.", { id: toastId })
                  } catch (error) {
                    const axiosError = error as AxiosError<{ message: string }>
                    toast.error(
                      axiosError.response?.data.message ?? "Failed to resend code.",
                      { id: toastId }
                    )
                  }
                }}
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Resend
              </button>
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