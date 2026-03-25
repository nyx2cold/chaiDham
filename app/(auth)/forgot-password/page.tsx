"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className={cn("flex flex-col gap-6 w-full max-w-md")}>
        <Card className="bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-white">
              Forgot password
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your email and we'll send you a reset code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-all shadow-lg shadow-amber-900/30"
              >
                {isSubmitting ? "Sending..." : "Send reset code"}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-500">
              Remembered it?{" "}
              <a href="/sign-in" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}