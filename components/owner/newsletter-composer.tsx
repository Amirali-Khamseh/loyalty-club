"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type NewsletterComposerProps = {
  businessSlug: string;
};

export function NewsletterComposer({ businessSlug }: NewsletterComposerProps) {
  const [subject, setSubject] = useState("Double Points Weekend");
  const [content, setContent] = useState(
    "Earn 2x points this weekend across all partner categories.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    const response = await fetch("/api/owner/newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        content,
        businessSlug,
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
      newsletter?: {
        id: string;
      };
    };

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to save newsletter draft.");
    } else {
      setFeedback(`Draft saved (${payload.newsletter?.id ?? "draft"}).`);
    }

    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-surface space-y-4 rounded-2xl p-5"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Newsletter Draft
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Send an update to your network
        </h3>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Subject</span>
        <input
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Write newsletter subject"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Content</span>
        <textarea
          className="glass-input h-32 w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your newsletter content"
        />
      </label>

      <Button
        type="submit"
        className="rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving draft..." : "Save Draft"}
      </Button>

      {feedback ? <p className="text-sm text-slate-300">{feedback}</p> : null}
    </form>
  );
}
