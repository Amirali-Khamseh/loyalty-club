"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type MenuItem = {
  id: string;
  title: string;
  description: string | null;
  publicPriceCents: number | null;
  networkPriceCents: number;
  isActive: boolean;
};

type SpecialMenuWithItems = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  items: MenuItem[];
};

type SpecialMenuCrudPanelProps = {
  menus: SpecialMenuWithItems[];
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function parseDollarsToCents(value: string, required: boolean) {
  const normalized = value.trim();

  if (!normalized) {
    return required ? null : null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

function toDateTimeLocalValue(iso: string | null) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

async function parseJsonResponse(response: Response) {
  return (await response.json()) as {
    ok: boolean;
    error?: string;
  };
}

export function SpecialMenuCrudPanel({ menus }: SpecialMenuCrudPanelProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createMenu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const startsAtValue = String(formData.get("startsAt") ?? "");
    const endsAtValue = String(formData.get("endsAt") ?? "");

    setIsSubmitting(true);

    const response = await fetch("/api/owner/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? "").trim() || null,
        isActive: formData.get("isActive") === "on",
        startsAt: toIsoOrNull(startsAtValue),
        endsAt: toIsoOrNull(endsAtValue),
      }),
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to create special menu.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Special menu created.");
    setIsSubmitting(false);
    form.reset();
    router.refresh();
  }

  async function updateMenu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const formData = new FormData(event.currentTarget);
    const menuId = String(formData.get("menuId") ?? "");

    setIsSubmitting(true);

    const response = await fetch("/api/owner/menus", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuId,
        data: {
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? "").trim() || null,
          isActive: formData.get("isActive") === "on",
          startsAt: toIsoOrNull(String(formData.get("startsAt") ?? "")),
          endsAt: toIsoOrNull(String(formData.get("endsAt") ?? "")),
        },
      }),
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to update menu.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Menu updated.");
    setIsSubmitting(false);
    router.refresh();
  }

  async function deleteMenu(menuId: string) {
    const shouldDelete = window.confirm("Delete this menu and all its items?");
    if (!shouldDelete) {
      return;
    }

    setFeedback("");
    setIsSubmitting(true);

    const response = await fetch("/api/owner/menus", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ menuId }),
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to delete menu.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Menu deleted.");
    setIsSubmitting(false);
    router.refresh();
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const networkPriceCents = parseDollarsToCents(
      String(formData.get("networkPrice") ?? ""),
      true,
    );
    const publicPriceRaw = String(formData.get("publicPrice") ?? "");
    const publicPriceCents = publicPriceRaw.trim()
      ? parseDollarsToCents(publicPriceRaw, false)
      : null;

    if (!networkPriceCents) {
      setFeedback("Network price must be a positive amount.");
      return;
    }

    if (publicPriceRaw.trim() && publicPriceCents === null) {
      setFeedback("Public price must be a positive amount when provided.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/owner/menu-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuId: String(formData.get("menuId") ?? ""),
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? "").trim() || null,
        networkPriceCents,
        publicPriceCents,
        isActive: formData.get("isActive") === "on",
      }),
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to create menu item.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Menu item created.");
    setIsSubmitting(false);
    form.reset();
    router.refresh();
  }

  async function updateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const formData = new FormData(event.currentTarget);
    const itemId = String(formData.get("itemId") ?? "");

    const networkPriceCents = parseDollarsToCents(
      String(formData.get("networkPrice") ?? ""),
      true,
    );
    const publicPriceRaw = String(formData.get("publicPrice") ?? "");
    const publicPriceCents = publicPriceRaw.trim()
      ? parseDollarsToCents(publicPriceRaw, false)
      : null;

    if (!networkPriceCents) {
      setFeedback("Network price must be a positive amount.");
      return;
    }

    if (publicPriceRaw.trim() && publicPriceCents === null) {
      setFeedback("Public price must be a positive amount when provided.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/owner/menu-items", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId,
        data: {
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? "").trim() || null,
          networkPriceCents,
          publicPriceCents,
          isActive: formData.get("isActive") === "on",
        },
      }),
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to update menu item.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Menu item updated.");
    setIsSubmitting(false);
    router.refresh();
  }

  async function deleteItem(itemId: string) {
    const shouldDelete = window.confirm("Delete this menu item?");
    if (!shouldDelete) {
      return;
    }

    setFeedback("");
    setIsSubmitting(true);

    const response = await fetch("/api/owner/menu-items", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to delete menu item.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Menu item deleted.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <article className="glass-surface rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Special Menu CRUD
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Create special menu offers
        </h2>

        <form onSubmit={createMenu} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Menu title</span>
            <input
              name="title"
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
              placeholder="Spring specials"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Starts at (optional)</span>
            <input
              name="startsAt"
              type="datetime-local"
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Ends at (optional)</span>
            <input
              name="endsAt"
              type="datetime-local"
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/35 px-4 py-3 text-sm text-slate-200">
            <input name="isActive" type="checkbox" defaultChecked />
            Active menu
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-slate-300">Description</span>
            <textarea
              name="description"
              className="glass-input h-24 w-full rounded-xl px-4 py-3 text-sm text-white"
              placeholder="Offers available to loyalty members."
            />
          </label>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 px-6 text-slate-950"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Create Menu"}
            </Button>
          </div>
        </form>
      </article>

      {menus.map((menu) => (
        <article key={menu.id} className="glass-surface rounded-2xl p-6">
          <form
            onSubmit={updateMenu}
            className="grid gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/25 p-4 md:grid-cols-2"
          >
            <input type="hidden" name="menuId" value={menu.id} />

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Menu title</span>
              <input
                name="title"
                defaultValue={menu.title}
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Starts at</span>
              <input
                name="startsAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(menu.startsAt)}
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Ends at</span>
              <input
                name="endsAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(menu.endsAt)}
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/35 px-4 py-3 text-sm text-slate-200">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={menu.isActive}
              />
              Active menu
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-slate-300">Description</span>
              <textarea
                name="description"
                defaultValue={menu.description ?? ""}
                className="glass-input h-20 w-full rounded-xl px-4 py-3 text-sm text-white"
                placeholder="Describe who should use this menu."
              />
            </label>

            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-5"
              >
                {isSubmitting ? "Saving..." : "Save Menu"}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => deleteMenu(menu.id)}
                className="rounded-xl border border-red-400/50 bg-red-500/20 px-5 text-red-100 hover:bg-red-500/30"
              >
                Delete Menu
              </Button>
            </div>
          </form>

          <div className="mt-5 space-y-4">
            <h3 className="text-xl font-semibold text-white">Menu offers</h3>

            <form
              onSubmit={createItem}
              className="grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/25 p-4 md:grid-cols-2"
            >
              <input type="hidden" name="menuId" value={menu.id} />

              <label className="space-y-2">
                <span className="text-sm text-slate-300">Offer title</span>
                <input
                  name="title"
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                  placeholder="Member burger combo"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-300">
                  Network price (USD)
                </span>
                <input
                  name="networkPrice"
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                  inputMode="decimal"
                  placeholder="9.99"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-300">
                  Public price (USD)
                </span>
                <input
                  name="publicPrice"
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                  inputMode="decimal"
                  placeholder="12.49"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/35 px-4 py-3 text-sm text-slate-200">
                <input name="isActive" type="checkbox" defaultChecked />
                Active offer
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-slate-300">Description</span>
                <textarea
                  name="description"
                  className="glass-input h-20 w-full rounded-xl px-4 py-3 text-sm text-white"
                  placeholder="Short offer details"
                />
              </label>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 px-5 text-slate-950"
                >
                  {isSubmitting ? "Creating..." : "Add Offer"}
                </Button>
              </div>
            </form>

            {menu.items.length === 0 ? (
              <div className="glass-item rounded-xl p-4 text-sm text-slate-300">
                No offers in this menu yet.
              </div>
            ) : (
              menu.items.map((item) => (
                <form
                  key={item.id}
                  onSubmit={updateItem}
                  className="grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/25 p-4 md:grid-cols-2"
                >
                  <input type="hidden" name="itemId" value={item.id} />

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Offer title</span>
                    <input
                      name="title"
                      defaultValue={item.title}
                      className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">
                      Network price (USD)
                    </span>
                    <input
                      name="networkPrice"
                      defaultValue={(item.networkPriceCents / 100).toFixed(2)}
                      className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                      inputMode="decimal"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">
                      Public price (USD)
                    </span>
                    <input
                      name="publicPrice"
                      defaultValue={
                        item.publicPriceCents
                          ? (item.publicPriceCents / 100).toFixed(2)
                          : ""
                      }
                      className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
                      inputMode="decimal"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/35 px-4 py-3 text-sm text-slate-200">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={item.isActive}
                    />
                    Active offer
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-slate-300">Description</span>
                    <textarea
                      name="description"
                      defaultValue={item.description ?? ""}
                      className="glass-input h-20 w-full rounded-xl px-4 py-3 text-sm text-white"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300 md:col-span-2">
                    <span>
                      Current: Network {formatCurrency(item.networkPriceCents)}
                      {item.publicPriceCents
                        ? ` | Public ${formatCurrency(item.publicPriceCents)}`
                        : ""}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-5"
                      >
                        {isSubmitting ? "Saving..." : "Save Offer"}
                      </Button>
                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => deleteItem(item.id)}
                        className="rounded-xl border border-red-400/50 bg-red-500/20 px-5 text-red-100 hover:bg-red-500/30"
                      >
                        Delete Offer
                      </Button>
                    </div>
                  </div>
                </form>
              ))
            )}
          </div>
        </article>
      ))}

      {menus.length === 0 ? (
        <div className="glass-surface rounded-2xl p-5 text-sm text-slate-300">
          No menus yet. Create your first special menu above.
        </div>
      ) : null}

      {feedback ? <p className="text-sm text-slate-200">{feedback}</p> : null}
    </div>
  );
}
