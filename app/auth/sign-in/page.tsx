"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const canSubmitEmail = email.trim().length > 3;

  async function handleEmailSignIn() {
    if (!canSubmitEmail) {
      return;
    }
    setIsLoadingEmail(true);
    setStatusText("");
    const response = await signIn("email", {
      email,
      callbackUrl: "/",
      redirect: false,
    });

    if (response?.ok) {
      setStatusText("Magic link sent. Check your inbox.");
    } else {
      setStatusText(
        "Email sign-in is not configured yet. Add EMAIL_SERVER and EMAIL_FROM.",
      );
    }

    setIsLoadingEmail(false);
  }

  async function handleGoogleSignIn() {
    setIsLoadingGoogle(true);
    await signIn("google", {
      callbackUrl: "/",
    });
    setIsLoadingGoogle(false);
  }

  async function handleDemoSignIn() {
    if (!canSubmitEmail) {
      setStatusText("Enter an email to continue with demo login.");
      return;
    }

    setStatusText("");
    await signIn("credentials", {
      email,
      callbackUrl: "/",
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060e20] px-6 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(186,158,255,0.24),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(107,87,255,0.2),transparent_40%)]" />
      <section className="glass-surface relative w-full max-w-md rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
          The Precision Concierge
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-white">
          Sign in to your loyalty network
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Use Google or a magic link to access both member and business
          interfaces.
        </p>

        <div className="mt-8 space-y-3">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-200"
          >
            Email magic link
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
          <Button
            className="w-full rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 py-6 text-base"
            disabled={isLoadingEmail || !canSubmitEmail}
            onClick={handleEmailSignIn}
          >
            {isLoadingEmail ? "Sending magic link..." : "Send magic link"}
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          or
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <Button
          variant="outline"
          className="glass-item w-full rounded-xl py-6 text-base text-white hover:bg-slate-800/60"
          disabled={isLoadingGoogle}
          onClick={handleGoogleSignIn}
        >
          {isLoadingGoogle ? "Redirecting..." : "Continue with Google"}
        </Button>

        <Button
          variant="secondary"
          className="mt-3 w-full rounded-xl bg-slate-200 py-6 text-base text-slate-950 hover:bg-white"
          onClick={handleDemoSignIn}
        >
          Continue with demo login
        </Button>

        {statusText ? (
          <p className="mt-5 text-sm text-slate-300">{statusText}</p>
        ) : null}
      </section>
    </main>
  );
}
