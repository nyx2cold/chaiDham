"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import * as z from "zod"
import { signUpSchema } from "@/schemas/signUpSchema"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    const toastId = toast.loading("Creating your account...")

    try {
      // Step 1 — Check username availability
      const usernameCheck = await axios.get(
        `/api/check-username-unique?username=${encodeURIComponent(data.userName)}`
      )

      if (!usernameCheck.data.success) {
        toast.error(usernameCheck.data.message, { id: toastId })
        setIsSubmitting(false)
        return
      }

      // Step 2 — Register user
      const response = await axios.post("/api/sign-up", data)
      toast.success(response.data.message, { id: toastId })
      router.push(`/verify-code?email=${encodeURIComponent(data.email)}`)

    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data.message ?? "Unable to register",
        { id: toastId }
      )
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
              Create account
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Register to place or manage orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Username */}
              <div className="space-y-1">
                <Label htmlFor="userName" className="text-sm font-medium text-zinc-300">
                  Username
                </Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="username"
                  {...form.register("userName")}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.userName && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.userName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-all shadow-lg shadow-amber-900/30"
              >
                {isSubmitting ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
            
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    
  )
}
