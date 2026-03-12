// src/app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { registerSchema, type RegisterInput } from "@/lib/validation/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Registration failed");
        return;
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to KWELI!");
        router.push("/");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-semibold tracking-[0.2em]">
            KWELI
          </Link>
        </div>

        <h1 className="font-display text-3xl font-light mb-2">
          Create your account
        </h1>
        <p className="text-muted text-sm mb-8">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              {...register("name")}
              className="input-field"
              placeholder="Jane Mwangi"
              autoComplete="name"
            />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input
              {...register("email")}
              type="email"
              className="input-field"
              placeholder="jane@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label">Phone Number (optional)</label>
            <input
              {...register("phone")}
              className="input-field"
              placeholder="0712345678"
              autoComplete="tel"
            />
            {errors.phone && (
              <p className="error-message">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="input-field pr-10"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="label">Confirm Password *</label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="input-field"
              placeholder="Repeat password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 mt-2"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Creating account...</>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-muted mt-6">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-charcoal">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-charcoal">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
