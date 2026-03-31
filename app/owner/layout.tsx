import Link from "next/link";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060e20] text-slate-100">
      <header className="glass-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-300">
              Merchant Suite
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              The Precision Concierge
            </p>
          </div>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-300">
            <Link
              href="/owner/dashboard"
              className="transition hover:text-violet-200"
            >
              Dashboard
            </Link>
            <Link
              href="/owner/program"
              className="transition hover:text-violet-200"
            >
              Program Setup
            </Link>
            <Link
              href="/owner/menus"
              className="transition hover:text-violet-200"
            >
              Special Menus
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        {children}
      </div>
    </div>
  );
}
