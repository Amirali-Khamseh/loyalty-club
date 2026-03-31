import { ProgramCrudPanel } from "@/components/owner/program-crud-panel";
import { resolveOwnerBusinessId } from "@/lib/owner-context";
import { prisma } from "@/lib/prisma";

async function getProgramData() {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return null;
  }

  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
    include: {
      loyaltyProgram: true,
      rewards: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return business;
}

export default async function ProgramSetupPage() {
  const business = await getProgramData();

  if (!business) {
    return (
      <div className="glass-surface rounded-3xl p-8 text-slate-200">
        No business data found. Run db setup and seed scripts to begin.
      </div>
    );
  }

  const program = business.loyaltyProgram;

  return (
    <section className="space-y-6">
      <header className="glass-surface rounded-3xl p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
          Configuration Phase
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Design your rewards ecosystem
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Configure points and visit criteria. Values update your user-facing
          loyalty experience in real time.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <article className="glass-surface rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white">
            Program parameters
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="glass-item rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Visits per reward
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {program?.visitsPerReward ?? 10}
              </p>
            </div>
            <div className="glass-item rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Points per dollar
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {program?.pointsPerDollar ?? 10}
              </p>
            </div>
            <div className="glass-item rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Reward mode
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {program?.rewardType ?? "HYBRID"}
              </p>
            </div>
            <div className="glass-item rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Expiration (days)
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {program?.pointsExpireInDays ?? 365}
              </p>
            </div>
          </div>
        </article>

        <article className="glass-surface rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Live preview
          </p>
          <div className="glass-item mt-4 rounded-2xl p-5">
            <p className="text-sm text-slate-300">{business.name}</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {(program?.rewardLabel ?? "Reward").toUpperCase()}
            </p>
            <p className="mt-3 text-sm text-slate-300">
              {program?.rewardDescription ??
                "Your loyalty message appears here as soon as your criteria are published."}
            </p>
          </div>
        </article>
      </div>

      <ProgramCrudPanel
        program={
          program
            ? {
                title: program.title,
                visitsPerReward: program.visitsPerReward,
                pointsPerDollar: program.pointsPerDollar,
                rewardLabel: program.rewardLabel,
                rewardDescription: program.rewardDescription,
                rewardType: program.rewardType,
                pointsExpireInDays: program.pointsExpireInDays,
              }
            : null
        }
        rewards={business.rewards.map((reward) => ({
          id: reward.id,
          title: reward.title,
          description: reward.description,
          requiredVisits: reward.requiredVisits,
          requiredPoints: reward.requiredPoints,
          isSpecialMenuAccess: reward.isSpecialMenuAccess,
          isActive: reward.isActive,
        }))}
      />
    </section>
  );
}
