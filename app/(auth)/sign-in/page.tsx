"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    defaultValues: {
      identifier: "",
      password: "",
    },
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

      // Redirect based on role handled in menu
      router.replace("/dashboard");

    } catch (error) {
      toast.error("Something went wrong. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className={cn("flex flex-col gap-6 w-full max-w-md")}>
        <Card className="bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in with your email or username
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
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
                  
                  <a  href="#"
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
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-all shadow-lg shadow-amber-900/30"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              {/* Google */}
              <Button
                variant="outline"
                type="button"
                className="w-full border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              
               <a href="/sign-up"
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}