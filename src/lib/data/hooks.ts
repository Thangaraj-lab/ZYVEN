"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRepository } from "@/lib/data/repository";
import type { Repository } from "@/lib/data/repository";
import type { RegisterInput, SubmitProofInput, Mission } from "@/lib/data/types";

/**
 * TanStack Query hooks — the ONLY way components touch data.
 * Every hook resolves the repository lazily via getRepository().
 */

export function useRepo() {
  return getRepository();
}

const keys = {
  session: ["session"] as const,
  me: ["me"] as const,
  missions: ["missions"] as const,
  mission: (slug: string) => ["mission", slug] as const,
  mySubmissions: ["my-submissions"] as const,
  submission: (id: string) => ["submission", id] as const,
  points: ["points"] as const,
  rank: ["rank"] as const,
  tier: ["tier"] as const,
  leaderboard: (scope: string, period: string) => ["leaderboard", scope, period] as const,
  rewards: ["rewards"] as const,
  notifications: ["notifications"] as const,
  announcements: ["announcements"] as const,
  adminQueue: ["admin-queue"] as const,
  adminAmbassadors: ["admin-ambassadors"] as const,
  adminMissions: ["admin-missions"] as const,
  adminStats: ["admin-stats"] as const,
  auditLog: ["audit-log"] as const,
};

async function call<T>(fn: (repo: Repository) => Promise<T>): Promise<T> {
  const repo = await getRepository();
  return fn(repo);
}

/** Invalidates every read query — used when the mock store emits a change. */
export function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries();
}

/** Subscribe to mock store changes so approvals show up live everywhere. */
export function useMockLiveUpdates() {
  const qc = useQueryClient();
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let alive = true;
    void call((repo) => repo.subscribe(() => invalidateAll(qc))).then((u) => {
      if (alive) unsub = u;
      else u();
    });
    return () => {
      alive = false;
      unsub?.();
    };
  }, [qc]);
}

/* ---------------- session ---------------- */

export function useSession() {
  return useQuery({ queryKey: keys.session, queryFn: () => call((r) => r.getSession()) });
}

export function useMe() {
  return useQuery({ queryKey: keys.me, queryFn: () => call((r) => r.getMe()) });
}

export function useLoginGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email?: string) => call((r) => r.loginWithGoogleMock(email)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useLoginEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      call((r) => r.loginWithEmail(email, password)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useLoginAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => call((r) => r.loginAdminMock()),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => call((r) => r.logout()),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useRegisterAmbassador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => call((r) => r.registerAmbassador(input)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<Repository["updateProfile"]>[0]) =>
      call((r) => r.updateProfile(patch)),
    onSuccess: () => invalidateAll(qc),
  });
}

/* ---------------- missions ---------------- */

export function useMissions() {
  return useQuery({ queryKey: keys.missions, queryFn: () => call((r) => r.getMissions()) });
}

export function useMission(slug: string) {
  return useQuery({
    queryKey: keys.mission(slug),
    queryFn: () => call((r) => r.getMission(slug)),
    enabled: Boolean(slug),
  });
}

export function useStartMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (missionId: string) => call((r) => r.startMission(missionId)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useSubmitProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitProofInput) => call((r) => r.submitProof(input)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useResubmitProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, input }: { submissionId: string; input: SubmitProofInput }) =>
      call((r) => r.resubmitProof(submissionId, input)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useMySubmissions() {
  return useQuery({
    queryKey: keys.mySubmissions,
    queryFn: () => call((r) => r.getMySubmissions()),
  });
}

export function useSubmission(id: string | null) {
  return useQuery({
    queryKey: keys.submission(id ?? ""),
    queryFn: () => call((r) => r.getSubmission(id ?? "")),
    enabled: Boolean(id),
  });
}

/* ---------------- derived ---------------- */

export function useMyPoints() {
  return useQuery({ queryKey: keys.points, queryFn: () => call((r) => r.getMyPoints()) });
}

export function useMyRank() {
  return useQuery({ queryKey: keys.rank, queryFn: () => call((r) => r.getMyRank()) });
}

export function useLeaderboard(scope: "individual" | "college", period: "all" | "weekly" | "monthly") {
  return useQuery({
    queryKey: keys.leaderboard(scope, period),
    queryFn: () => call((r) => r.getLeaderboard({ scope, period })),
  });
}

export function useRewards() {
  return useQuery({ queryKey: keys.rewards, queryFn: () => call((r) => r.getRewards()) });
}

export function useMyTier() {
  return useQuery({ queryKey: keys.tier, queryFn: () => call((r) => r.getMyTier()) });
}

/* ---------------- notifications ---------------- */

export function useNotifications() {
  return useQuery({
    queryKey: keys.notifications,
    queryFn: () => call((r) => r.getNotifications()),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => call((r) => r.markNotificationRead(id)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => call((r) => r.markAllNotificationsRead()),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: keys.announcements,
    queryFn: () => call((r) => r.getAnnouncements()),
  });
}

/* ---------------- admin ---------------- */

export function useReviewQueue() {
  return useQuery({
    queryKey: keys.adminQueue,
    queryFn: () => call((r) => r.listSubmissions()),
  });
}

export function useReviewSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      reason,
    }: {
      id: string;
      decision: "approve" | "reject" | "requestChanges";
      reason?: string;
    }) => call((r) => r.reviewSubmission(id, decision, reason)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAmbassadors() {
  return useQuery({
    queryKey: keys.adminAmbassadors,
    queryFn: () => call((r) => r.listAmbassadors()),
  });
}

export function useSetAmbassadorStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "suspended" | "pending" | "rejected" }) =>
      call((r) => r.setAmbassadorStatus(userId, status)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAdminMissions() {
  return useQuery({
    queryKey: keys.adminMissions,
    queryFn: () => call((r) => r.listMissions()),
  });
}

export function useUpsertMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mission: Mission) => call((r) => r.upsertMission(mission)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAdminStats() {
  return useQuery({ queryKey: keys.adminStats, queryFn: () => call((r) => r.getAdminStats()) });
}

export function useAuditLog() {
  return useQuery({ queryKey: keys.auditLog, queryFn: () => call((r) => r.getAuditLog()) });
}

/* ---------------- dev ---------------- */

export function useDevActions() {
  const qc = useQueryClient();
  const onDone = () => invalidateAll(qc);
  return {
    resetSeed: useMutation({ mutationFn: () => call((r) => r.resetSeed()), onSuccess: onDone }),
    loadProgressDemo: useMutation({
      mutationFn: () => call((r) => r.loadProgressDemo()),
      onSuccess: onDone,
    }),
    simulateApproveLatest: useMutation({
      mutationFn: () => call((r) => r.simulateAdminApproveLatest()),
      onSuccess: onDone,
    }),
    setSubmissionState: useMutation({
      mutationFn: ({
        id,
        state,
      }: {
        id: string;
        state: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
      }) => call((r) => r.setSubmissionState(id, state)),
      onSuccess: onDone,
    }),
    setApprovalRequired: useMutation({
      mutationFn: (v: boolean) => call((r) => r.setApprovalRequired(v)),
      onSuccess: onDone,
    }),
    setSlowNetwork: useMutation({
      mutationFn: (v: boolean) => call((r) => r.setSlowNetwork(v)),
      onSuccess: onDone,
    }),
  };
}

/** Live snapshot of mock settings (approvalRequired / slowNetwork). */
export function useSettingsSnapshot() {
  const [snap, setSnap] = useState<{ approvalRequired: boolean; slowNetwork: boolean }>({
    approvalRequired: false,
    slowNetwork: false,
  });
  useEffect(() => {
    let alive = true;
    let unsub: (() => void) | undefined;
    void (async () => {
      const repo = await getRepository();
      const read = async () => {
        const session = await repo.getSession();
        if (!alive) return;
        void session;
        const { store } = await import("@/lib/data/mock/store");
        if (alive) setSnap({ ...store.get().settings });
      };
      await read();
      unsub = repo.subscribe(() => void read());
    })();
    return () => {
      alive = false;
      unsub?.();
    };
  }, []);
  return snap;
}
