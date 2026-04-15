"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: z.infer<typeof forgotSchema>) => {
    setIsSubmitting(true)
    const toastId = toast.loading("Sending reset code...")
    try {
      await axios.post("/api/forgot-password", { email: data.email })
      toast.success("Reset code sent! Check your email.", { id: toastId })
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(axiosError.response?.data.message ?? "Something went wrong.", { id: toastId })
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
            No worries
          </p>
          <h1 className="text-[clamp(3.5rem,6vw,5.5rem)] font-black leading-[0.9] tracking-tight text-white">
            Forgot<br />
            <span className="text-amber-400">Password.</span>
          </h1>
          <p className="mt-8 text-zinc-400 text-base leading-relaxed max-w-xs">
            Enter your email and we'll send you a 6-digit reset code straight to your inbox.
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
              No worries
            </p>
            <h1
              className="font-black text-white leading-none tracking-tight"
              style={{ fontSize: "clamp(3.2rem, 16vw, 5.5rem)" }}
            >
              Forgot<br />
              <span className="text-amber-400">Password.</span>
            </h1>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-xs">
              We'll send a reset code to your inbox.
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
                Reset your password
              </h2>
              <p className="text-zinc-400 text-sm">
                We'll send a 6-digit code to your email address.
              </p>
            </div>

            {/* mobile label */}
            <p className="lg:hidden text-zinc-400 text-sm mb-2">
              Enter your email to receive a reset code.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-semibold transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Sending…" : "Send reset code"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Remembered it?{" "}
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