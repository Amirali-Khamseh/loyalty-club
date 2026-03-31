import { SpecialMenuCrudPanel } from "@/components/owner/special-menu-crud-panel";
import { resolveOwnerBusinessId } from "@/lib/owner-context";
import { prisma } from "@/lib/prisma";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function OwnerMenusPage() {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return (
      <div className="glass-surface rounded-3xl p-8 text-slate-200">
        No business data found. Run db setup and seed scripts to begin.
      </div>
    );
  }

  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
    include: {
      specialMenus: {
        include: {
          items: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!business) {
    return (
      <div className="glass-surface rounded-3xl p-8 text-slate-200">
        No business data found. Run db setup and seed scripts to begin.
      </div>
    );
  }

  const menu =
    business.specialMenus.find((item) => item.isActive) ??
    business.specialMenus[0];
  const activeItemsCount =
    menu?.items.filter((item) => item.isActive).length ?? 0;

  return (
    <section className="space-y-6">
      <header className="glass-surface rounded-3xl p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
          Merchant Suite
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Rewards &amp; special menus
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Curate premium experiences for members connected to your loyalty
          network.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="glass-surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Active Menus
          </p>
          <p className="mt-3 text-4xl font-bold text-white">
            {
              business.specialMenus.filter(
                (specialMenu) => specialMenu.isActive,
              ).length
            }
          </p>
        </article>
        <article className="glass-surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Items
          </p>
          <p className="mt-3 text-4xl font-bold text-white">
            {activeItemsCount}
          </p>
        </article>
        <article className="glass-surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Access
          </p>
          <p className="mt-3 text-2xl font-semibold text-violet-300">
            All network members
          </p>
        </article>
      </div>

      <article className="glass-surface rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-white">
          {menu?.title ?? "No active menu"}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {menu?.description ??
            "Create your first special menu from dashboard."}
        </p>

        <ul className="mt-5 space-y-4">
          {(menu?.items.filter((item) => item.isActive) ?? []).map((item) => (
            <li key={item.id} className="glass-item rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {item.description ?? "No description"}
                  </p>
                </div>
                <div className="text-right">
                  {item.publicPriceCents ? (
                    <p className="text-sm text-slate-400 line-through">
                      {formatCurrency(item.publicPriceCents)}
                    </p>
                  ) : null}
                  <p className="text-xl font-semibold text-violet-300">
                    {formatCurrency(item.networkPriceCents)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <SpecialMenuCrudPanel
        menus={business.specialMenus.map((specialMenu) => ({
          id: specialMenu.id,
          title: specialMenu.title,
          description: specialMenu.description,
          isActive: specialMenu.isActive,
          startsAt: specialMenu.startsAt
            ? specialMenu.startsAt.toISOString()
            : null,
          endsAt: specialMenu.endsAt ? specialMenu.endsAt.toISOString() : null,
          items: specialMenu.items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            publicPriceCents: item.publicPriceCents,
            networkPriceCents: item.networkPriceCents,
            isActive: item.isActive,
          })),
        }))}
      />
    </section>
  );
}
