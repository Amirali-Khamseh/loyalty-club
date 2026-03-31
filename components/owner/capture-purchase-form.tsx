"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CapturePurchaseFormProps = {
  businessSlug: string;
};

export function CapturePurchaseForm({
  businessSlug,
}: CapturePurchaseFormProps) {
  const [memberCode, setMemberCode] = useState("LC-9821");
  const [amountDollars, setAmountDollars] = useState("18.99");
  const [note, setNote] = useState("Checkout capture");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitCapture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setIsSubmitting(true);

    const parsedAmount = Number(amountDollars);
    const amountCents = Number.isFinite(parsedAmount)
      ? Math.round(parsedAmount * 100)
      : NaN;

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setFeedback("Amount must be a positive number.");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessSlug,
        memberCode,
        amountCents,
        note,
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
      pointsEarned?: number;
      visitsCount?: number;
      unlockedReward?: {
        title: string;
      } | null;
    };

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Capture failed");
    } else {
      setFeedback(
        `Captured. +${payload.pointsEarned ?? 0} points. Visits now ${payload.visitsCount ?? 0}${
          payload.unlockedReward
            ? `, unlocked: ${payload.unlockedReward.title}`
            : ""
        }`,
      );
    }

    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={submitCapture}
      className="glass-surface space-y-4 rounded-2xl p-5"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          QR Capture
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Record checkout purchase
        </h3>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Member code</span>
        <input
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          value={memberCode}
          onChange={(event) => setMemberCode(event.target.value)}
          placeholder="LC-9821"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Purchase amount (USD)</span>
        <input
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          value={amountDollars}
          onChange={(event) => setAmountDollars(event.target.value)}
          placeholder="18.99"
          inputMode="decimal"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Note</span>
        <input
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional capture note"
        />
      </label>

      <Button
        type="submit"
        className="rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 px-6 text-slate-950 hover:from-cyan-400 hover:to-indigo-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Recording..." : "Capture Purchase"}
      </Button>

      {feedback ? <p className="text-sm text-slate-300">{feedback}</p> : null}
    </form>
  );
}
