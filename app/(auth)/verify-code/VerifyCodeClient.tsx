"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import axios, { AxiosError } from "axios"
import * as z from "zod"
import { verifyEmailSchema } from "@/schemas/verifyEmailSchema"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    defaultValues: {
      code: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof verifyEmailSchema>) => {
    setIsSubmitting(true)
    const toastId = toast.loading("Verifying your code...")

    try {
      const response = await axios.post("/api/verify-code", {
  email,  
  code: data.code,
})
      toast.success(response.data.message, { id: toastId })
      router.push("/sign-in")
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      toast.error(
        axiosError.response?.data.message ?? "Verification failed.",
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
              Verify your email
            </CardTitle>
            <CardDescription className="text-zinc-400">
              We sent a 6-digit code to{" "}
              <span className="text-amber-400 font-medium">{email}</span>.
              Enter it below.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* OTP Input */}
              <div className="flex flex-col items-center space-y-3">
                <Controller
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot
                          index={0}
                          className="bg-zinc-800 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500"
                        />
                        <InputOTPSlot
                          index={1}
                          className="bg-zinc-800 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500"
                        />
                        <InputOTPSlot
                          index={2}
                          className="bg-zinc-800 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500"
                        />
                        <InputOTPSlot
                          index={3}
                          className="bg-zinc-800 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500"
                        />
                        <InputOTPSlot
                          index={4}
                          className="bg-zinc-800 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500"
                        />
                        <InputOTPSlot
                          index={5}
                          className="bg-zinc-800 border-zinc-700 text-white text-lg w-12 h-12 rounded-md focus:border-amber-500"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                {form.formState.errors.code && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || form.watch("code").length < 6}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Button>
            </form>

            {/* Resend code */}
            <p className="text-center text-sm text-zinc-500">
              Didn't receive the code?{" "}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}