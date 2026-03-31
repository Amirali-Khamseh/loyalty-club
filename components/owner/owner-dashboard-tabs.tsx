"use client";

import { useMemo, useState } from "react";
import { CapturePurchaseForm } from "@/components/owner/capture-purchase-form";
import { NewsletterComposer } from "@/components/owner/newsletter-composer";

type OwnerTabKey = "overview" | "operations" | "communications" | "menus";

type DailySeriesPoint = {
  day: string;
  visits: number;
  revenueCents: number;
  rewards: number;
};

type RewardSummary = {
  id: string;
  title: string;
  requiredVisits: number | null;
  requiredPoints: number | null;
  claims: number;
};

type MenuItemSummary = {
  id: string;
  title: string;
  description: string | null;
  networkPriceCents: number;
  publicPriceCents: number | null;
};

type LoyaltyProgramSummary = {
  title: string;
  visitsPerReward: number;
  pointsPerDollar: number;
  rewardLabel: string;
  rewardDescription: string | null;
};

type OwnerDashboardTabsProps = {
  businessName: string;
  businessSlug: string;
  metrics: {
    activeMembers: number;
    rewardsClaimed: number;
    monthlyPurchases: number;
    monthlyRevenueCents: number;
    retentionRate: number;
    activeOffers: number;
    redemptionEfficiency: number;
  };
  loyaltyProgram: LoyaltyProgramSummary | null;
  topRewards: RewardSummary[];
  dailySeries: DailySeriesPoint[];
  activeMenu: {
    title: string;
    description: string | null;
    items: MenuItemSummary[];
  } | null;
};

const tabs: Array<{ key: OwnerTabKey; label: string; subtitle: string }> = [
  {
    key: "overview",
    label: "Overview",
    subtitle: "Metrics + charts",
  },
  {
    key: "operations",
    label: "Operations",
    subtitle: "Capture + settings",
  },
  {
    key: "communications",
    label: "Communications",
    subtitle: "Newsletter workflow",
  },
  {
    key: "menus",
    label: "Special Menus",
    subtitle: "Member-only offers",
  },
];

function formatCurrency(cents: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(cents / 100);
}

export function OwnerDashboardTabs({
  businessName,
  businessSlug,
  metrics,
  loyaltyProgram,
  topRewards,
  dailySeries,
  activeMenu,
}: OwnerDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<OwnerTabKey>("overview");

  const maxVisits = useMemo(
    () => Math.max(1, ...dailySeries.map((point) => point.visits)),
    [dailySeries],
  );
  const maxRevenue = useMemo(
    () => Math.max(1, ...dailySeries.map((point) => point.revenueCents)),
    [dailySeries],
  );

  const totalVisitsLast14Days = dailySeries.reduce(
    (sum, point) => sum + point.visits,
    0,
  );
  const totalRevenueLast14Days = dailySeries.reduce(
    (sum, point) => sum + point.revenueCents,
    0,
  );
  const totalRewardsLast14Days = dailySeries.reduce(
    (sum, point) => sum + point.rewards,
    0,
  );
  const avgDailyVisits =
    dailySeries.length > 0
      ? (totalVisitsLast14Days / dailySeries.length).toFixed(1)
      : "0.0";

  return (
    <section className="space-y-6">
      <div className="glass-surface rounded-3xl p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
          Performance Overview
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Loyalty Program Insights
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          {businessName} dashboard organized by task so you can manage
          operations, campaigns, and premium menus without everything sitting on
          one page.
        </p>
      </div>

      <nav className="glass-surface rounded-2xl p-2">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-violet-300/60 bg-violet-500/20 text-white"
                      : "border-slate-700/60 bg-slate-900/35 text-slate-300 hover:border-violet-300/40 hover:text-white"
                  }`}
                >
                  <p className="text-sm font-semibold">{tab.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{tab.subtitle}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {activeTab === "overview" ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Active Members
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {metrics.activeMembers}
              </p>
            </article>
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Rewards Claimed
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {metrics.rewardsClaimed}
              </p>
              <p className="mt-2 text-sm text-violet-300">
                {Math.round(metrics.redemptionEfficiency)}% efficiency
              </p>
            </article>
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Monthly Revenue
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {formatCurrency(metrics.monthlyRevenueCents)}
              </p>
              <p className="mt-2 text-sm text-cyan-300">
                {metrics.monthlyPurchases} purchases
              </p>
            </article>
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Retention Rate
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {Math.round(metrics.retentionRate)}%
              </p>
              <p className="mt-2 text-sm text-violet-300">
                {metrics.activeOffers} active offers
              </p>
            </article>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <article className="glass-surface rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                    Daily Visits
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    Last 14 days
                  </h3>
                </div>
                <p className="text-sm font-medium text-slate-300">
                  {totalVisitsLast14Days} visits total
                </p>
              </div>

              <div className="mt-5 flex h-44 items-end gap-2">
                {dailySeries.map((point) => {
                  const height =
                    point.visits > 0
                      ? `${(point.visits / maxVisits) * 100}%`
                      : "6%";

                  return (
                    <div
                      key={`visits-${point.day}`}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="relative h-full rounded-md bg-slate-900/40 p-1">
                        <div
                          className="absolute bottom-1 left-1 right-1 rounded-md bg-linear-to-t from-violet-500/80 to-indigo-300/90"
                          style={{ height }}
                        />
                      </div>
                      <p className="mt-2 text-center text-[10px] text-slate-400">
                        {point.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="glass-surface rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                    Daily Revenue
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    Last 14 days
                  </h3>
                </div>
                <p className="text-sm font-medium text-slate-300">
                  {formatCurrency(totalRevenueLast14Days, true)}
                </p>
              </div>

              <div className="mt-5 flex h-44 items-end gap-2">
                {dailySeries.map((point) => {
                  const height =
                    point.revenueCents > 0
                      ? `${(point.revenueCents / maxRevenue) * 100}%`
                      : "6%";

                  return (
                    <div
                      key={`revenue-${point.day}`}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="relative h-full rounded-md bg-slate-900/40 p-1">
                        <div
                          className="absolute bottom-1 left-1 right-1 rounded-md bg-linear-to-t from-cyan-500/80 to-indigo-300/85"
                          style={{ height }}
                        />
                      </div>
                      <p className="mt-2 text-center text-[10px] text-slate-400">
                        {point.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                Popular Redemptions
              </p>
              <ul className="mt-4 space-y-3">
                {topRewards.length === 0 ? (
                  <li className="text-sm text-slate-400">
                    No reward activity yet.
                  </li>
                ) : (
                  topRewards.map((reward) => (
                    <li key={reward.id} className="glass-item rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {reward.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            Visits: {reward.requiredVisits ?? "-"} | Points:{" "}
                            {reward.requiredPoints ?? "-"}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-violet-300">
                          {reward.claims} claims
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </article>

            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Snapshot
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="glass-item rounded-xl p-4">
                  Avg daily visits:{" "}
                  <span className="font-semibold text-white">
                    {avgDailyVisits}
                  </span>
                </li>
                <li className="glass-item rounded-xl p-4">
                  Daily rewards redeemed:{" "}
                  <span className="font-semibold text-white">
                    {totalRewardsLast14Days}
                  </span>
                </li>
                <li className="glass-item rounded-xl p-4">
                  Total tracked revenue:{" "}
                  <span className="font-semibold text-white">
                    {formatCurrency(totalRevenueLast14Days)}
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      ) : null}

      {activeTab === "operations" ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <CapturePurchaseForm businessSlug={businessSlug} />

          <article className="glass-surface rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-violet-300">
              Loyalty Blueprint
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {loyaltyProgram?.title ?? "Program not configured"}
            </h2>
            <p className="mt-3 text-sm text-slate-200">
              {loyaltyProgram
                ? `${loyaltyProgram.pointsPerDollar} points per $1 and ${loyaltyProgram.visitsPerReward} visits per reward.`
                : "Set points and visits criteria in the program setup tab."}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="glass-item rounded-xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Reward label
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {loyaltyProgram?.rewardLabel ?? "Reward"}
                </p>
              </div>
              <div className="glass-item rounded-xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Active offers
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {metrics.activeOffers}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              {loyaltyProgram?.rewardDescription ??
                "Create a clear reward message so members understand what they unlock and when."}
            </p>
          </article>
        </div>
      ) : null}

      {activeTab === "communications" ? (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <NewsletterComposer businessSlug={businessSlug} />

          <article className="glass-surface rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Campaign Signals
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Communication-ready metrics
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="glass-item rounded-xl p-4">
                Members reachable now:{" "}
                <span className="font-semibold text-white">
                  {metrics.activeMembers}
                </span>
              </li>
              <li className="glass-item rounded-xl p-4">
                Monthly redemptions:{" "}
                <span className="font-semibold text-white">
                  {metrics.rewardsClaimed}
                </span>
              </li>
              <li className="glass-item rounded-xl p-4">
                Best promo indicator:{" "}
                <span className="font-semibold text-white">
                  {Math.round(metrics.redemptionEfficiency)}% engagement
                </span>
              </li>
            </ul>

            <p className="mt-4 text-sm text-slate-300">
              Start with weekly drops and connect each campaign to specific
              metrics so business owners can verify message impact quickly.
            </p>
          </article>
        </div>
      ) : null}

      {activeTab === "menus" ? (
        <article className="glass-surface rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Special Menu
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {activeMenu?.title ?? "No active menu"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {activeMenu?.description ??
              "Create premium offers for members in your loyalty network."}
          </p>

          <ul className="mt-4 space-y-3">
            {(activeMenu?.items ?? []).map((item) => (
              <li key={item.id} className="glass-item rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {item.description ?? "No description"}
                    </p>
                  </div>
                  <p className="text-sm text-violet-300">
                    Network {formatCurrency(item.networkPriceCents)}
                    {item.publicPriceCents
                      ? ` (Public ${formatCurrency(item.publicPriceCents)})`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
