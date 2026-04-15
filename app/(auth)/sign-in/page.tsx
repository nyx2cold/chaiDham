"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const { isSubmitting, errors } = form.formState;

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const toastId = toast.loading("Signing in...");
    try {
      const result = await signIn("Credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error, { id: toastId });
        return;
      }
      toast.success("Signed in successfully!", { id: toastId });
      router.replace("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.", { id: toastId });
    }
  };

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
            Welcome back
          </p>
          <h1 className="text-[clamp(3.5rem,6vw,5.5rem)] font-black leading-[0.9] tracking-tight text-white">
            Sign<br />
            <span className="text-amber-400">In.</span>
          </h1>
          <p className="mt-8 text-zinc-400 text-base leading-relaxed max-w-xs">
            Your favourite chai is waiting. Pick up right where you left off.
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
          {/* large amber circle glow top-right */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: "280px",
              height: "280px",
              top: "-80px",
              right: "-80px",
              background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)",
            }}
          />
          {/* smaller glow bottom-left */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: "180px",
              height: "180px",
              bottom: "-40px",
              left: "-40px",
              background: "radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)",
            }}
          />

          {/* decorative vertical amber bar */}
          <div
            className="absolute left-0 top-8 bottom-8 w-1 rounded-r-full"
            style={{ background: "linear-gradient(180deg, transparent, #f59e0b, transparent)" }}
          />

          {/* logo */}
          {/* <div className="relative z-10 mb-10">
            <span className="text-xl font-bold">
              <span className="text-amber-400">Chai</span>
              <span className="text-white">Dham</span>
            </span>
          </div> */}

          {/* headline */}
          <div className="relative z-10">
            <p
              className="font-semibold uppercase mb-2"
              style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#a16207" }}
            >
              Welcome back
            </p>
            <h1
              className="font-black text-white leading-none tracking-tight"
              style={{ fontSize: "clamp(4rem, 18vw, 5.5rem)" }}
            >
              Sign<br />
              <span className="text-amber-400">In.</span>
            </h1>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-xs">
              Your favourite chai is waiting for you.
            </p>
          </div>

          {/* bottom divider — amber fade line */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.5) 50%, transparent 100%)" }}
          />
        </div>

        {/* ── FORM AREA ── */}
        <div className="flex-1 flex items-start lg:items-center justify-center w-full px-6 pt-8 pb-10 lg:px-16 lg:py-14">
          <div className="w-full max-w-sm">

            {/* desktop heading only */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-semibold text-white mb-1">
                Sign in to your account
              </h2>
              <p className="text-zinc-400 text-sm">
                Enter your email or username to continue
              </p>
            </div>

            {/* mobile form label */}
            <p className="lg:hidden text-zinc-400 text-sm mb-6">
              Enter your details to continue
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email or Username */}
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-sm font-medium text-zinc-300">
                  Email or Username
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com or username"
                  {...form.register("identifier")}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
                {errors.identifier && (
                  <p className="text-xs text-red-400">{errors.identifier.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    Password
                  </Label>
                  <a
                    href="/forgot-password"
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-semibold transition-all shadow-lg shadow-amber-900/30 mt-2"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            {/* Sign up link */}
            <p className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <a
                href="/sign-up"
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Sign up
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
  );
}
