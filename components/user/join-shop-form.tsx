"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AvailableBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type JoinShopFormProps = {
  availableBusinesses: AvailableBusiness[];
};

export function JoinShopForm({ availableBusinesses }: JoinShopFormProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const hasAvailableList = availableBusinesses.length > 0;
  const selectedBusiness = useMemo(
    () =>
      availableBusinesses.find((business) => business.slug === businessSlug) ??
      null,
    [availableBusinesses, businessSlug],
  );
  const canSubmit = selectedBusiness !== null;

  const filteredBusinesses = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return availableBusinesses.slice(0, 8);
    }

    return availableBusinesses
      .filter(
        (business) =>
          business.name.toLowerCase().includes(query) ||
          business.slug.toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [availableBusinesses, searchText]);

  function selectBusiness(business: AvailableBusiness) {
    setBusinessSlug(business.slug);
    setSearchText(`${business.name} (${business.slug})`);
    setFeedback("");
    setIsPickerOpen(false);
  }

  function handleSearchChange(value: string) {
    setSearchText(value);
    setIsPickerOpen(true);

    const normalized = value.trim().toLowerCase();
    const exactMatch = availableBusinesses.find(
      (business) =>
        business.slug.toLowerCase() === normalized ||
        `${business.name} (${business.slug})`.toLowerCase() === normalized,
    );

    setBusinessSlug(exactMatch?.slug ?? "");
  }

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setFeedback("Select a shop from the search results before adding.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    const response = await fetch("/api/user/join-shop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessSlug,
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      alreadyJoined?: boolean;
      error?: string;
      business?: {
        name: string;
      };
      membership?: {
        memberCode: string;
      };
    };

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Could not add this shop right now.");
      setIsSubmitting(false);
      return;
    }

    const businessName =
      payload.business?.name ?? selectedBusiness?.name ?? businessSlug;

    if (payload.alreadyJoined) {
      setFeedback(`You are already in ${businessName}.`);
    } else {
      setFeedback(
        `Added ${businessName}. Membership ID: ${payload.membership?.memberCode ?? "created"}.`,
      );
    }

    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleJoin} className="glass-surface rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
        Add Shop To Network
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        Join another business
      </h3>
      <p className="mt-2 text-sm text-slate-300">
        Add a partner shop so its rewards card appears in your wallet.
      </p>

      {hasAvailableList ? (
        <div className="mt-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">
              Search available shops
            </span>
            <input
              value={searchText}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setIsPickerOpen(true)}
              onBlur={() => {
                setTimeout(() => {
                  setIsPickerOpen(false);
                }, 120);
              }}
              placeholder="Search by shop name or slug"
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </label>

          {isPickerOpen ? (
            <ul className="glass-item mt-2 max-h-56 space-y-1 overflow-auto rounded-xl p-2">
              {filteredBusinesses.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-300">
                  No shops found for this search.
                </li>
              ) : (
                filteredBusinesses.map((business) => (
                  <li key={business.id}>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectBusiness(business);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-violet-500/20"
                    >
                      <p className="text-sm font-medium text-white">
                        {business.name}
                      </p>
                      <p className="text-xs text-slate-400">{business.slug}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}

          {selectedBusiness ? (
            <p className="mt-2 text-sm text-violet-200">
              Selected: {selectedBusiness.name}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Pick a shop from the dropdown list.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
          No unjoined shops were found in the network list.
        </p>
      )}

      <Button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="mt-4 rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-6"
      >
        {isSubmitting ? "Adding shop..." : "Add Shop"}
      </Button>

      {feedback ? (
        <p className="mt-3 text-sm text-slate-300">{feedback}</p>
      ) : null}
    </form>
  );
}
