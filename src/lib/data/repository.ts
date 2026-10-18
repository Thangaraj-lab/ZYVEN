import type {
  AdminStats,
  AmbassadorProfile,
  Announcement,
  AppNotification,
  AuditLog,
  CollegeLeaderboardEntry,
  LeaderboardEntry,
  LeaderboardPeriod,
  LeaderboardScope,
  Mission,
  MissionWithState,
  PointsSummary,
  RankInfo,
  RegisterInput,
  ReviewQueueItem,
  Reward,
  Session,
  Submission,
  SubmitProofInput,
  TierInfo,
} from "./types";

/**
 * The single data contract for the whole app. Components and hooks ONLY talk
 * to this interface. Today MockRepository implements it; later
 * `supabase/supabaseRepository.ts` will implement the same shape and the UI
 * will not change (flip NEXT_PUBLIC_USE_MOCK=false).
 */
export interface Repository {
  /* session + accounts */
  getSession(): Promise<Session>;
  loginWithEmail(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  registerAmbassador(input: RegisterInput): Promise<Session>;
  updateProfile(patch: Partial<AmbassadorProfile>): Promise<AmbassadorProfile>;
  getMe(): Promise<{ user: NonNullable<Session["user"]>; profile: AmbassadorProfile } | null>;

  /* missions */
  getMissions(): Promise<MissionWithState[]>;
  getMission(slug: string): Promise<MissionWithState | null>;
  startMission(missionId: string): Promise<Submission>;
  submitProof(input: SubmitProofInput): Promise<Submission>;
  resubmitProof(submissionId: string, input: SubmitProofInput): Promise<Submission>;
  getMySubmissions(): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | null>;

  /* points / rank / tier — all derived from the ledger */
  getMyPoints(): Promise<PointsSummary>;
  getMyRank(): Promise<RankInfo>;
  getLeaderboard(opts: {
    scope: LeaderboardScope;
    period: LeaderboardPeriod;
  }): Promise<{ individual: LeaderboardEntry[]; college: CollegeLeaderboardEntry[] }>;
  getRewards(): Promise<Reward[]>;
  getMyTier(): Promise<TierInfo>;

  /* notifications + announcements */
  getNotifications(): Promise<AppNotification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  getAnnouncements(): Promise<Announcement[]>;

  /* admin */
  listSubmissions(states?: Submission["state"][]): Promise<ReviewQueueItem[]>;
  reviewSubmission(
    id: string,
    decision: "approve" | "reject" | "requestChanges",
    reason?: string,
  ): Promise<Submission>;
  /** Atomic + idempotent: state update + PointTransaction + Notification + AuditLog in one step. */
  approveSubmission(id: string): Promise<Submission>;
  listAmbassadors(): Promise<Array<{ profile: AmbassadorProfile; user: { id: string; name: string; email: string }; points: number }>>;
  setAmbassadorStatus(userId: string, status: AmbassadorProfile["status"]): Promise<void>;
  listMissions(): Promise<Mission[]>;
  upsertMission(mission: Mission): Promise<Mission>;
  getAdminStats(): Promise<AdminStats>;
  getAuditLog(): Promise<AuditLog[]>;

  subscribe(cb: () => void): () => void;
}

let cached: Repository | null = null;

/** Factory that reads NEXT_PUBLIC_USE_MOCK and returns the right implementation. */
export async function getRepository(): Promise<Repository> {
  if (cached) return cached;
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
  if (!useMock) {
    throw new Error(
      "Supabase repository is not implemented yet. Set NEXT_PUBLIC_USE_MOCK=true.",
    );
  }
  const { MockRepository } = await import("./mock/mockRepository");
  cached = MockRepository.getInstance();
  return cached;
}
