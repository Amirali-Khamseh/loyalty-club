import Link from "next/link";
import { getCurrentSession } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getCurrentSession();

  return (
    <main className="relative flex min-h-screen flex-1 overflow-hidden bg-[#050c1f] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(139,92,246,0.28),transparent_35%),radial-gradient(circle_at_82%_72%,rgba(59,130,246,0.22),transparent_42%)]" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 md:px-10">
        <header className="glass-surface flex flex-col gap-5 rounded-3xl p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
            The Precision Concierge
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] text-white md:text-6xl">
            Loyalty Club for both merchants and members.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Run visit and points rewards, scan member QR codes at checkout,
            publish special menus, and keep your network engaged with monthly
            insights plus newsletters.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {session?.user ? (
              <>
                <Button
                  asChild
                  className="rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-8"
                >
                  <Link href="/owner/dashboard">Open owner dashboard</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-slate-600 bg-slate-900/60 px-8 text-white hover:bg-slate-800"
                >
                  <Link href="/user/wallet">Open user wallet</Link>
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-8"
              >
                <Link href="/auth/sign-in">Sign in to start</Link>
              </Button>
            )}
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="glass-surface rounded-3xl p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Business Interface
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Manage rewards and growth
            </h2>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
              <li>Track monthly purchases, retention, and redemption rates</li>
              <li>Set visit thresholds and points-per-dollar rules</li>
              <li>Create special menus for network members</li>
              <li>Draft newsletters and in-app updates</li>
            </ul>
            <Button
              asChild
              className="mt-6 rounded-xl bg-violet-500/95 hover:bg-violet-500"
            >
              <Link href="/owner/dashboard">Go to owner dashboard</Link>
            </Button>
          </article>

          <article className="glass-surface rounded-3xl p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              User Interface
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Your wallet, perfectly curated
            </h2>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
              <li>Carry loyalty cards from participating businesses</li>
              <li>Show your QR or code at checkout to record purchases</li>
              <li>Monitor visits, points, and unlocked rewards</li>
              <li>Receive in-app updates and newsletter drops</li>
            </ul>
            <Button
              asChild
              className="mt-6 rounded-xl bg-cyan-500/90 text-slate-950 hover:bg-cyan-400"
            >
              <Link href="/user/wallet">Go to user wallet</Link>
            </Button>
          </article>
        </div>
      </section>
    </main>
  );
}
