"use client";

import { RewardType } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ProgramSnapshot = {
  title: string;
  visitsPerReward: number;
  pointsPerDollar: number;
  rewardLabel: string;
  rewardDescription: string | null;
  rewardType: RewardType;
  pointsExpireInDays: number | null;
};

type RewardSummary = {
  id: string;
  title: string;
  description: string | null;
  requiredVisits: number | null;
  requiredPoints: number | null;
  isSpecialMenuAccess: boolean;
  isActive: boolean;
};

type ProgramCrudPanelProps = {
  program: ProgramSnapshot | null;
  rewards: RewardSummary[];
};

type ProgramFormState = {
  title: string;
  visitsPerReward: string;
  pointsPerDollar: string;
  rewardLabel: string;
  rewardDescription: string;
  rewardType: RewardType;
  pointsExpireInDays: string;
};

type RewardDraft = {
  title: string;
  description: string;
  requiredVisits: string;
  requiredPoints: string;
  isSpecialMenuAccess: boolean;
  isActive: boolean;
};

type NewRewardState = {
  title: string;
  description: string;
  requiredVisits: string;
  requiredPoints: string;
  isSpecialMenuAccess: boolean;
};

const defaultProgramState: ProgramFormState = {
  title: "Loyalty Blueprint",
  visitsPerReward: "10",
  pointsPerDollar: "10",
  rewardLabel: "Reward",
  rewardDescription: "",
  rewardType: RewardType.HYBRID,
  pointsExpireInDays: "365",
};

const defaultNewRewardState: NewRewardState = {
  title: "",
  description: "",
  requiredVisits: "",
  requiredPoints: "",
  isSpecialMenuAccess: false,
};

function toProgramFormState(program: ProgramSnapshot | null): ProgramFormState {
  if (!program) {
    return defaultProgramState;
  }

  return {
    title: program.title,
    visitsPerReward: String(program.visitsPerReward),
    pointsPerDollar: String(program.pointsPerDollar),
    rewardLabel: program.rewardLabel,
    rewardDescription: program.rewardDescription ?? "",
    rewardType: program.rewardType,
    pointsExpireInDays:
      program.pointsExpireInDays === null
        ? ""
        : String(program.pointsExpireInDays),
  };
}

function toRewardDraft(reward: RewardSummary): RewardDraft {
  return {
    title: reward.title,
    description: reward.description ?? "",
    requiredVisits:
      reward.requiredVisits === null ? "" : String(reward.requiredVisits),
    requiredPoints:
      reward.requiredPoints === null ? "" : String(reward.requiredPoints),
    isSpecialMenuAccess: reward.isSpecialMenuAccess,
    isActive: reward.isActive,
  };
}

function parsePositiveIntOrNull(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseNonNegativeIntOrNull(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function ProgramCrudPanel({ program, rewards }: ProgramCrudPanelProps) {
  const router = useRouter();
  const [programState, setProgramState] = useState<ProgramFormState>(() =>
    toProgramFormState(program),
  );
  const [newReward, setNewReward] = useState<NewRewardState>(
    defaultNewRewardState,
  );
  const [rewardDrafts, setRewardDrafts] = useState<Record<string, RewardDraft>>(
    () =>
      Object.fromEntries(
        rewards.map((reward) => [reward.id, toRewardDraft(reward)]),
      ),
  );
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProgramState(toProgramFormState(program));
  }, [program]);

  useEffect(() => {
    setRewardDrafts(
      Object.fromEntries(
        rewards.map((reward) => [reward.id, toRewardDraft(reward)]),
      ),
    );
  }, [rewards]);

  const rewardCountText = useMemo(
    () => `${rewards.length} reward${rewards.length === 1 ? "" : "s"}`,
    [rewards.length],
  );

  async function updateProgram(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const visitsPerReward = parsePositiveIntOrNull(
      programState.visitsPerReward,
    );
    const pointsPerDollar = parseNonNegativeIntOrNull(
      programState.pointsPerDollar,
    );
    const pointsExpireInDays = parseNonNegativeIntOrNull(
      programState.pointsExpireInDays,
    );

    if (visitsPerReward === null) {
      setFeedback("Visits per reward must be a positive whole number.");
      return;
    }

    if (pointsPerDollar === null) {
      setFeedback("Points per dollar must be zero or more.");
      return;
    }

    if (programState.pointsExpireInDays.trim() && pointsExpireInDays === null) {
      setFeedback("Expiration days must be zero or more.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/owner/program", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: programState.title,
        visitsPerReward,
        pointsPerDollar,
        rewardLabel: programState.rewardLabel,
        rewardDescription: programState.rewardDescription.trim()
          ? programState.rewardDescription.trim()
          : null,
        rewardType: programState.rewardType,
        pointsExpireInDays: programState.pointsExpireInDays.trim()
          ? pointsExpireInDays
          : null,
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
    };

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to update program settings.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Program settings saved.");
    setIsSubmitting(false);
    router.refresh();
  }

  async function createReward(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const requiredVisits = parsePositiveIntOrNull(newReward.requiredVisits);
    const requiredPoints = parsePositiveIntOrNull(newReward.requiredPoints);

    if (requiredVisits === null && requiredPoints === null) {
      setFeedback("Add at least one reward threshold (visits or points).");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/owner/rewards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newReward.title,
        description: newReward.description.trim()
          ? newReward.description.trim()
          : null,
        requiredVisits,
        requiredPoints,
        isSpecialMenuAccess: newReward.isSpecialMenuAccess,
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
    };

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to create reward.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Reward created.");
    setNewReward(defaultNewRewardState);
    setIsSubmitting(false);
    router.refresh();
  }

  function updateRewardDraft(rewardId: string, patch: Partial<RewardDraft>) {
    setRewardDrafts((current) => ({
      ...current,
      [rewardId]: {
        ...current[rewardId],
        ...patch,
      },
    }));
  }

  async function saveReward(rewardId: string) {
    const draft = rewardDrafts[rewardId];
    if (!draft) {
      return;
    }

    setFeedback("");

    const requiredVisits = parsePositiveIntOrNull(draft.requiredVisits);
    const requiredPoints = parsePositiveIntOrNull(draft.requiredPoints);

    if (requiredVisits === null && requiredPoints === null) {
      setFeedback("Each reward needs visits or points criteria.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/owner/rewards", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rewardId,
        data: {
          title: draft.title,
          description: draft.description.trim()
            ? draft.description.trim()
            : null,
          requiredVisits,
          requiredPoints,
          isSpecialMenuAccess: draft.isSpecialMenuAccess,
          isActive: draft.isActive,
        },
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
    };

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to update reward.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Reward updated.");
    setIsSubmitting(false);
    router.refresh();
  }

  async function deleteReward(rewardId: string) {
    const shouldDelete = window.confirm("Delete this reward?");
    if (!shouldDelete) {
      return;
    }

    setFeedback("");
    setIsSubmitting(true);

    const response = await fetch("/api/owner/rewards", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rewardId }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
    };

    if (!response.ok || !payload.ok) {
      setFeedback(payload.error ?? "Unable to delete reward.");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Reward deleted.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <article className="glass-surface rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Program CRUD
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Edit frequency and loyalty rules
        </h2>

        <form
          onSubmit={updateProgram}
          className="mt-5 grid gap-4 md:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Program title</span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={programState.title}
              onChange={(event) =>
                setProgramState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Loyalty Blueprint"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Reward label</span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={programState.rewardLabel}
              onChange={(event) =>
                setProgramState((current) => ({
                  ...current,
                  rewardLabel: event.target.value,
                }))
              }
              placeholder="Free Coffee"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Visits per reward</span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={programState.visitsPerReward}
              onChange={(event) =>
                setProgramState((current) => ({
                  ...current,
                  visitsPerReward: event.target.value,
                }))
              }
              inputMode="numeric"
              placeholder="10"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Points per dollar</span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={programState.pointsPerDollar}
              onChange={(event) =>
                setProgramState((current) => ({
                  ...current,
                  pointsPerDollar: event.target.value,
                }))
              }
              inputMode="numeric"
              placeholder="10"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Reward type</span>
            <select
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
              value={programState.rewardType}
              onChange={(event) =>
                setProgramState((current) => ({
                  ...current,
                  rewardType: event.target.value as RewardType,
                }))
              }
            >
              <option value={RewardType.HYBRID}>Hybrid</option>
              <option value={RewardType.VISIT}>Visit</option>
              <option value={RewardType.POINTS}>Points</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">
              Points expire in days
            </span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={programState.pointsExpireInDays}
              onChange={(event) =>
                setProgramState((current) => ({
                  ...current,
                  pointsExpireInDays: event.target.value,
                }))
              }
              inputMode="numeric"
              placeholder="365"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-slate-300">Reward description</span>
            <textarea
              className="glass-input h-24 w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={programState.rewardDescription}
              onChange={(event) =>
                setProgramState((current) => ({
                  ...current,
                  rewardDescription: event.target.value,
                }))
              }
              placeholder="Describe what members unlock."
            />
          </label>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-6"
            >
              {isSubmitting ? "Saving..." : "Save Program"}
            </Button>
          </div>
        </form>
      </article>

      <article className="glass-surface rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Rewards CRUD
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Rules and reward offers
            </h2>
          </div>
          <p className="text-sm text-slate-300">{rewardCountText}</p>
        </div>

        <form
          onSubmit={createReward}
          className="mt-5 grid gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/35 p-4 md:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Reward title</span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={newReward.title}
              onChange={(event) =>
                setNewReward((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Free dessert"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Required visits</span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={newReward.requiredVisits}
              onChange={(event) =>
                setNewReward((current) => ({
                  ...current,
                  requiredVisits: event.target.value,
                }))
              }
              inputMode="numeric"
              placeholder="10"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">Required points</span>
            <input
              className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={newReward.requiredPoints}
              onChange={(event) =>
                setNewReward((current) => ({
                  ...current,
                  requiredPoints: event.target.value,
                }))
              }
              inputMode="numeric"
              placeholder="200"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/35 px-4 py-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={newReward.isSpecialMenuAccess}
              onChange={(event) =>
                setNewReward((current) => ({
                  ...current,
                  isSpecialMenuAccess: event.target.checked,
                }))
              }
            />
            Unlocks special menu access
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-slate-300">Description</span>
            <textarea
              className="glass-input h-20 w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
              value={newReward.description}
              onChange={(event) =>
                setNewReward((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Describe this reward."
            />
          </label>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 px-6 text-slate-950"
            >
              {isSubmitting ? "Creating..." : "Create Reward"}
            </Button>
          </div>
        </form>

        <div className="mt-5 space-y-3">
          {rewards.length === 0 ? (
            <div className="glass-item rounded-xl p-4 text-sm text-slate-300">
              No rewards yet. Create your first reward above.
            </div>
          ) : (
            rewards.map((reward) => {
              const draft = rewardDrafts[reward.id];
              if (!draft) {
                return null;
              }

              return (
                <article key={reward.id} className="glass-item rounded-xl p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Title
                      </span>
                      <input
                        className="glass-input w-full rounded-xl px-3 py-2 text-sm text-white"
                        value={draft.title}
                        onChange={(event) =>
                          updateRewardDraft(reward.id, {
                            title: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Required visits
                      </span>
                      <input
                        className="glass-input w-full rounded-xl px-3 py-2 text-sm text-white"
                        value={draft.requiredVisits}
                        onChange={(event) =>
                          updateRewardDraft(reward.id, {
                            requiredVisits: event.target.value,
                          })
                        }
                        inputMode="numeric"
                        placeholder="None"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Required points
                      </span>
                      <input
                        className="glass-input w-full rounded-xl px-3 py-2 text-sm text-white"
                        value={draft.requiredPoints}
                        onChange={(event) =>
                          updateRewardDraft(reward.id, {
                            requiredPoints: event.target.value,
                          })
                        }
                        inputMode="numeric"
                        placeholder="None"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Description
                      </span>
                      <input
                        className="glass-input w-full rounded-xl px-3 py-2 text-sm text-white"
                        value={draft.description}
                        onChange={(event) =>
                          updateRewardDraft(reward.id, {
                            description: event.target.value,
                          })
                        }
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-200">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draft.isSpecialMenuAccess}
                        onChange={(event) =>
                          updateRewardDraft(reward.id, {
                            isSpecialMenuAccess: event.target.checked,
                          })
                        }
                      />
                      Menu access reward
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(event) =>
                          updateRewardDraft(reward.id, {
                            isActive: event.target.checked,
                          })
                        }
                      />
                      Active
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => saveReward(reward.id)}
                      disabled={isSubmitting}
                      className="rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-5"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => deleteReward(reward.id)}
                      disabled={isSubmitting}
                      className="rounded-xl border border-red-400/50 bg-red-500/20 px-5 text-red-100 hover:bg-red-500/30"
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </article>

      {feedback ? <p className="text-sm text-slate-200">{feedback}</p> : null}
    </div>
  );
}
