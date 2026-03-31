"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { JoinShopForm } from "@/components/user/join-shop-form";

type CustomerTabKey = "overview" | "wallet" | "join" | "activity";

type MembershipCard = {
  id: string;
  memberCode: string;
  pointsBalance: number;
  visitsCount: number;
  qrDataUrl: string;
  business: {
    name: string;
    description: string | null;
    rewardLabel: string;
    visitsPerReward: number;
  };
};

type ActivityItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
};

type AvailableBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type UserWalletTabsProps = {
  membershipCards: MembershipCard[];
  activities: ActivityItem[];
  availableBusinesses: AvailableBusiness[];
};

const tabs: Array<{ key: CustomerTabKey; label: string; subtitle: string }> = [
  {
    key: "overview",
    label: "Overview",
    subtitle: "Network summary",
  },
  {
    key: "wallet",
    label: "Wallet Cards",
    subtitle: "Multi-shop cards",
  },
  {
    key: "join",
    label: "Add Shop",
    subtitle: "Search network",
  },
  {
    key: "activity",
    label: "Activity",
    subtitle: "Chart table",
  },
];

function toReadableType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function UserWalletTabs({
  membershipCards,
  activities,
  availableBusinesses,
}: UserWalletTabsProps) {
  const [activeTab, setActiveTab] = useState<CustomerTabKey>("overview");

  const networkBusinesses = membershipCards.length;
  const totalPoints = membershipCards.reduce(
    (sum, card) => sum + card.pointsBalance,
    0,
  );
  const totalVisits = membershipCards.reduce(
    (sum, card) => sum + card.visitsCount,
    0,
  );

  const notificationTypeCounts = useMemo(
    () =>
      activities.reduce<Record<string, number>>((counts, activity) => {
        counts[activity.type] = (counts[activity.type] ?? 0) + 1;
        return counts;
      }, {}),
    [activities],
  );

  const typeSummary = useMemo(
    () => Object.entries(notificationTypeCounts).sort((a, b) => b[1] - a[1]),
    [notificationTypeCounts],
  );
  const maxTypeCount = Math.max(1, ...typeSummary.map((entry) => entry[1]));

  return (
    <section className="space-y-6">
      <header className="glass-surface rounded-3xl p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
          Member status
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Your network rewards wallet
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Manage multiple business memberships from one place. Use tabs to
          switch between wallet cards, shop discovery, and activity analytics.
        </p>
      </header>

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
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Network Businesses
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {networkBusinesses}
              </p>
            </article>
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Total Points
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {totalPoints}
              </p>
            </article>
            <article className="glass-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Total Visits
              </p>
              <p className="mt-3 text-4xl font-bold text-white">
                {totalVisits}
              </p>
            </article>
          </div>

          <article className="glass-surface rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
              Joined shops
            </p>
            {membershipCards.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">
                No memberships yet. Use Add Shop to join your first business.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {membershipCards.map((card) => (
                  <div key={card.id} className="glass-item rounded-xl p-4">
                    <p className="text-sm font-semibold text-white">
                      {card.business.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {card.memberCode}
                    </p>
                    <p className="mt-2 text-xs text-violet-200">
                      Reward: {card.business.rewardLabel}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      ) : null}

      {activeTab === "wallet" ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
            Your business memberships
          </p>
          {membershipCards.length === 0 ? (
            <article className="glass-surface rounded-2xl p-6 text-sm text-slate-300">
              No business memberships yet. Join a partner business to start
              collecting visits and points.
            </article>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {membershipCards.map((card) => {
                const threshold = card.business.visitsPerReward;
                const progress = Math.min(
                  (card.visitsCount / threshold) * 100,
                  100,
                );

                return (
                  <article
                    key={card.id}
                    className="glass-surface rounded-3xl p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                          {card.memberCode}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">
                          {card.business.name}
                        </h2>
                        <p className="mt-2 text-sm text-slate-300">
                          {card.business.description ??
                            "Loyalty network member"}
                        </p>
                      </div>
                      <span className="rounded-full border border-violet-300/40 bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-200">
                        {card.business.rewardLabel}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_170px]">
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="glass-item rounded-xl p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Points
                            </p>
                            <p className="mt-2 text-3xl font-bold text-white">
                              {card.pointsBalance}
                            </p>
                          </div>
                          <div className="glass-item rounded-xl p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Visits
                            </p>
                            <p className="mt-2 text-3xl font-bold text-white">
                              {card.visitsCount}
                            </p>
                          </div>
                        </div>

                        <div className="glass-item rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Progress to reward
                            </p>
                            <p className="text-sm font-semibold text-violet-300">
                              {card.visitsCount}/{threshold} visits
                            </p>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-slate-700/70">
                            <div
                              className="h-2 rounded-full bg-linear-to-r from-violet-500 to-indigo-400"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="glass-item rounded-2xl p-3 text-slate-100">
                        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                          Scan
                        </p>
                        <Image
                          src={card.qrDataUrl}
                          alt={`Loyalty QR code for ${card.business.name}`}
                          width={160}
                          height={160}
                          unoptimized
                          className="mx-auto mt-2 h-40 w-40"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "join" ? (
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <JoinShopForm availableBusinesses={availableBusinesses} />

          <article className="glass-surface rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Available shops
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Select and join from available businesses in the network.
            </p>
            <ul className="mt-4 space-y-3">
              {availableBusinesses.length === 0 ? (
                <li className="glass-item rounded-xl p-4 text-sm text-slate-300">
                  You already joined all available shops.
                </li>
              ) : (
                availableBusinesses.map((business) => (
                  <li key={business.id} className="glass-item rounded-xl p-4">
                    <p className="font-semibold text-white">{business.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {business.slug}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {business.description ??
                        "Partner business in the network"}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </article>
        </div>
      ) : null}

      {activeTab === "activity" ? (
        <article className="glass-surface rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Activity feed
          </p>
          {activities.length === 0 ? (
            <div className="mt-4 glass-item rounded-xl p-4 text-sm text-slate-300">
              No updates yet.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {typeSummary.map(([type, count]) => {
                  const barWidth = `${(count / maxTypeCount) * 100}%`;

                  return (
                    <div key={type} className="glass-item rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                        <span>{toReadableType(type)}</span>
                        <span>{count}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-700/70">
                        <div
                          className="h-1.5 rounded-full bg-linear-to-r from-cyan-400 to-violet-400"
                          style={{ width: barWidth }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/35">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-700/60 bg-slate-950/30 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="px-3 py-3 font-medium">Time</th>
                      <th className="px-3 py-3 font-medium">Event</th>
                      <th className="px-3 py-3 font-medium">Details</th>
                      <th className="px-3 py-3 font-medium">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => {
                      const intensity = activities.length - index;
                      const activityWidth = `${(intensity / activities.length) * 100}%`;
                      const activityDate = new Date(activity.createdAt);

                      return (
                        <tr
                          key={activity.id}
                          className="border-b border-slate-800/70 last:border-b-0 odd:bg-slate-900/15 even:bg-slate-900/5"
                        >
                          <td className="px-3 py-3 text-xs text-slate-300">
                            {activityDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-violet-200">
                            {toReadableType(activity.type)}
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-medium text-white">
                              {activity.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-300">
                              {activity.body}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-2 w-20 rounded-full bg-slate-700/70">
                              <div
                                className="h-2 rounded-full bg-linear-to-r from-violet-500 to-cyan-400"
                                style={{ width: activityWidth }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </article>
      ) : null}
    </section>
  );
}
