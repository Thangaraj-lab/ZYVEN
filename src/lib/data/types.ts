import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Core enums                                                          */
/* ------------------------------------------------------------------ */

export const roleSchema = z.enum(["ambassador", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const missionCategorySchema = z.enum([
  "social",
  "community",
  "content",
  "event",
  "referral",
  "college",
]);
export type MissionCategory = z.infer<typeof missionCategorySchema>;

export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const missionStatusSchema = z.enum([
  "draft",
  "live",
  "paused",
  "archived",
  "coming_soon",
]);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

export const proofTypeSchema = z.enum(["url", "screenshot", "text"]);
export type ProofType = z.infer<typeof proofTypeSchema>;

export const verificationSchema = z.enum(["manual", "auto"]);
export type Verification = z.infer<typeof verificationSchema>;

export const brandSchema = z.enum([
  "linkedin",
  "whatsapp",
  "instagram",
  "event",
  "referral",
  "college",
]);
export type Brand = z.infer<typeof brandSchema>;

export const submissionStateSchema = z.enum([
  "STARTED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
]);
export type SubmissionState = z.infer<typeof submissionStateSchema>;

/** Derived UI state for a mission as seen by one ambassador. */
export const missionUIStateSchema = z.enum([
  "AVAILABLE",
  "STARTED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "LOCKED",
]);
export type MissionUIState = z.infer<typeof missionUIStateSchema>;

export const profileStatusSchema = z.enum(["pending", "active", "rejected", "suspended"]);
export type ProfileStatus = z.infer<typeof profileStatusSchema>;

export const tierSchema = z.enum(["bronze", "silver", "gold", "champion"]);
export type Tier = z.infer<typeof tierSchema>;

export const leaderboardScopeSchema = z.enum(["individual", "college"]);
export type LeaderboardScope = z.infer<typeof leaderboardScopeSchema>;

export const leaderboardPeriodSchema = z.enum(["all", "weekly", "monthly"]);
export type LeaderboardPeriod = z.infer<typeof leaderboardPeriodSchema>;

export const notificationTypeSchema = z.enum([
  "application_approved",
  "new_mission",
  "deadline_soon",
  "submission_approved",
  "submission_rejected",
  "changes_requested",
  "points_awarded",
  "rank_changed",
  "reward_unlocked",
  "announcement",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

/* ------------------------------------------------------------------ */
/* Entities                                                            */
/* ------------------------------------------------------------------ */

export const userSchema = z.object({
  id: z.string(),
  role: roleSchema,
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

export const ambassadorProfileSchema = z.object({
  userId: z.string(),
  college: z.string(),
  department: z.string(),
  year: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  city: z.string(),
  studentId: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  interests: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  whyJoin: z.string(),
  status: profileStatusSchema,
  joinedAt: z.string(),
  cohortNumber: z.number(),
  isDemo: z.boolean().default(false),
});
export type AmbassadorProfile = z.infer<typeof ambassadorProfileSchema>;

export const stepSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleTa: z.string(),
  body: z.string().optional(),
  bodyTa: z.string().optional(),
  action: z
    .object({
      kind: z.enum(["external", "copy_template", "upload", "input_url", "confirm"]),
      url: z.string().optional(),
    })
    .optional(),
});
export type Step = z.infer<typeof stepSchema>;

export const postTemplateSchema = z.object({ en: z.string(), ta: z.string() });
export type PostTemplate = z.infer<typeof postTemplateSchema>;

export const missionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  titleTa: z.string(),
  description: z.string(),
  descriptionTa: z.string(),
  category: missionCategorySchema,
  instructions: z.array(stepSchema),
  points: z.number().int().positive(),
  difficulty: difficultySchema,
  estimatedMinutes: z.number().int().positive(),
  startsAt: z.string(),
  deadline: z.string().optional(),
  status: missionStatusSchema,
  proofTypes: z.array(proofTypeSchema),
  proofRequired: z.object({ url: z.boolean(), screenshot: z.boolean() }),
  verification: verificationSchema,
  externalUrl: z.string().optional(),
  brand: brandSchema,
  postTemplate: postTemplateSchema.optional(),
});
export type Mission = z.infer<typeof missionSchema>;

export const submissionSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  ambassadorId: z.string(),
  state: submissionStateSchema,
  proofUrl: z.string().optional(),
  normalizedUrl: z.string().optional(),
  screenshotDataUrl: z.string().optional(),
  note: z.string().optional(),
  submittedAt: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewerId: z.string().optional(),
  reviewReason: z.string().optional(),
});
export type Submission = z.infer<typeof submissionSchema>;

export const pointTransactionSchema = z.object({
  id: z.string(),
  ambassadorId: z.string(),
  submissionId: z.string(),
  missionId: z.string(),
  points: z.number().int(),
  reason: z.string(),
  createdAt: z.string(),
});
export type PointTransaction = z.infer<typeof pointTransactionSchema>;

export const rewardSchema = z.object({
  id: z.string(),
  tier: tierSchema,
  threshold: z.number().int().positive(),
  title: z.string(),
  titleTa: z.string(),
  perks: z.array(z.string()),
});
export type Reward = z.infer<typeof rewardSchema>;

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  readAt: z.string().optional(),
  href: z.string().optional(),
});
export type AppNotification = z.infer<typeof notificationSchema>;

export const announcementSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  pinned: z.boolean().default(false),
});
export type Announcement = z.infer<typeof announcementSchema>;

export const auditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string(),
  createdAt: z.string(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;

export const collegeSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  color: z.string(),
});
export type College = z.infer<typeof collegeSchema>;

export const mockSettingsSchema = z.object({
  approvalRequired: z.boolean().default(false),
  slowNetwork: z.boolean().default(false),
});
export type MockSettings = z.infer<typeof mockSettingsSchema>;

/* ------------------------------------------------------------------ */
/* Derived view models                                                 */
/* ------------------------------------------------------------------ */

export interface Session {
  user: User | null;
  profile: AmbassadorProfile | null;
}

export interface MissionWithState extends Mission {
  uiState: MissionUIState;
  mySubmission: Submission | null;
}

export interface PointsSummary {
  total: number;
  ledger: PointTransaction[];
}

export interface RankInfo {
  rank: number;
  totalAmbassadors: number;
}

export interface TierInfo {
  current: Reward | null;
  next: Reward | null;
  pointsToNext: number | null;
  progressPercent: number;
}

export interface LeaderboardEntry {
  rank: number;
  ambassadorId: string;
  name: string;
  college: string;
  collegeShort: string;
  points: number;
  isMe: boolean;
  isDemo: boolean;
  tier: Tier | null;
}

export interface CollegeLeaderboardEntry {
  rank: number;
  collegeId: string;
  name: string;
  shortName: string;
  color: string;
  totalPoints: number;
  memberCount: number;
  averagePoints: number;
  topAmbassador: { name: string; points: number } | null;
}

export interface AdminStats {
  totalAmbassadors: number;
  pendingReviews: number;
  pointsAwarded: number;
  approvalRate: number; // 0..1
}

export interface ReviewQueueItem {
  submission: Submission;
  mission: Mission;
  ambassador: { id: string; name: string; college: string };
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  college: string;
  department: string;
  year: 1 | 2 | 3 | 4;
  city: string;
  studentId?: string;
  linkedin?: string;
  instagram?: string;
  interests: string[];
  skills: string[];
  whyJoin: string;
}

export interface SubmitProofInput {
  missionId: string;
  proofUrl?: string;
  screenshotDataUrl?: string;
  note?: string;
}
