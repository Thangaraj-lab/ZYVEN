import normalizeUrl from "normalize-url";
import { buildSeed } from "./seed";
import { nowIso, simulateLatency, store, uid } from "./store";
import type { Repository } from "../repository";
import type {
  AmbassadorProfile,
  CollegeLeaderboardEntry,
  LeaderboardEntry,
  Mission,
  MissionUIState,
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
  User,
} from "../types";

/* ------------------------------------------------------------------ */
/* Pure helpers (exported for unit tests)                              */
/* ------------------------------------------------------------------ */

/** Normalize a URL for duplicate detection: strip tracking params, www, trailing slash. */
export function normalizeForDedupe(raw: string): string {
  try {
    const n = normalizeUrl(raw, {
      stripHash: true,
      stripProtocol: true,
      removeSingleSlash: true,
      sortQueryParameters: true,
    });
    // Remove common tracking params
    const url = new URL(`https://${n}`);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "li_fat_id"].forEach(
      (p) => url.searchParams.delete(p),
    );
    let out = `${url.host}${url.pathname}${url.search ? "?" + url.searchParams.toString() : ""}`;
    out = out.replace(/^www\./, "").replace(/\/$/, "");
    return out.toLowerCase();
  } catch {
    return raw.trim().toLowerCase().replace(/\/$/, "");
  }
}

/** LinkedIn post URLs must look like linkedin.com/posts/... or /feed/update/... */
export function isValidLinkedInPostUrl(raw: string): boolean {
  if (!raw) return false;
  let host = "";
  let path = "";
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    host = u.hostname.replace(/^www\./, "");
    path = u.pathname;
  } catch {
    return false;
  }
  if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return false;
  return /^\/(posts|feed\/update)\//.test(path);
}

export function sumPoints(ledger: { points: number }[]): number {
  return ledger.reduce((acc, t) => acc + t.points, 0);
}

/** Tie-break: earliest timestamp that reached the score wins (tested in B10). */
export function rankEntries(
  entries: Array<{ id: string; total: number; reachedAt: string }>,
): Array<{ id: string; rank: number }> {
  const sorted = [...entries].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.reachedAt < b.reachedAt ? -1 : a.reachedAt > b.reachedAt ? 1 : 0;
  });
  return sorted.map((e, i) => ({ id: e.id, rank: i + 1 }));
}

/* ------------------------------------------------------------------ */
/* MockRepository                                                      */
/* ------------------------------------------------------------------ */

const ADMIN_EMAIL = "admin@zyven.app";

export class MockRepository implements Repository {
  private static instance: MockRepository | null = null;
  static getInstance(): MockRepository {
    if (!MockRepository.instance) MockRepository.instance = new MockRepository();
    return MockRepository.instance;
  }

  constructor() {
    store.hydrate(buildSeed);
  }

  private db() {
    return store.get();
  }

  private requireUser(): User {
    const u = this.db().users.find((x) => x.id === this.db().sessionUserId);
    if (!u) throw new Error("NOT_LOGGED_IN");
    return u;
  }

  private profileOf(userId: string): AmbassadorProfile | undefined {
    return this.db().profiles.find((p) => p.userId === userId);
  }

  /* ---------------- accounts + session ---------------- */

  async getSession(): Promise<Session> {
    const id = this.db().sessionUserId;
    if (!id) return { user: null, profile: null };
    const user = this.db().users.find((u) => u.id === id) ?? null;
    const profile = user ? this.profileOf(user.id) : null;
    return { user: user ? { ...user } : null, profile: profile ? { ...profile } : null };
  }

  /**
   * Email + password login. Unknown email and wrong password return the SAME
   * generic error so account existence is never leaked to potential attackers.
   */
  async loginWithEmail(email: string, password: string): Promise<Session> {
    await simulateLatency();
    const e = email.trim().toLowerCase();
    if (!e || !password) throw new Error("INVALID_CREDENTIALS");
    const user = this.db().users.find((u) => u.email.toLowerCase() === e);
    if (!user) throw new Error("INVALID_CREDENTIALS");
    if (this.db().passwords[user.id] !== password) throw new Error("INVALID_CREDENTIALS");
    const profile = this.profileOf(user.id);
    if (profile && profile.status === "rejected") throw new Error("APPLICATION_REJECTED");
    store.set((d) => {
      d.sessionUserId = user.id;
    });
    return { user: { ...user }, profile: profile ? { ...profile } : null };
  }

  async logout(): Promise<void> {
    await simulateLatency();
    store.set((d) => {
      d.sessionUserId = null;
    });
  }

  /** Creates a real account (email + password) with status "pending". */
  async registerAmbassador(input: RegisterInput): Promise<Session> {
    await simulateLatency();
    const email = input.email.trim().toLowerCase();
    if (!email) throw new Error("REQUIRED");
    if (!input.password || input.password.length < 6) throw new Error("PASSWORD_TOO_SHORT");
    if (this.db().users.some((u) => u.email.toLowerCase() === email)) throw new Error("EMAIL_TAKEN");
    const userId = uid("usr");
    const now = nowIso();
    const user: User = {
      id: userId,
      role: "ambassador",
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || undefined,
    };
    const profile: AmbassadorProfile = {
      userId,
      college: input.college.trim(),
      department: input.department.trim(),
      year: input.year,
      city: input.city.trim(),
      studentId: input.studentId?.trim() || undefined,
      linkedin: input.linkedin?.trim() || undefined,
      instagram: input.instagram?.trim() || undefined,
      interests: input.interests,
      skills: input.skills,
      whyJoin: input.whyJoin,
      status: "pending",
      joinedAt: now,
      cohortNumber: this.db().profiles.length + 1,
      isDemo: false,
    };
    store.set((d) => {
      d.users.push(user);
      d.passwords[userId] = input.password;
      d.profiles.push(profile);
      d.sessionUserId = userId;
      d.auditLog.unshift({
        id: uid("aud"),
        actorId: userId,
        action: "ambassador.register",
        entity: "profile",
        entityId: userId,
        createdAt: now,
      });
    });
    return { user: { ...user }, profile: { ...profile } };
  }

  async updateProfile(patch: Partial<AmbassadorProfile>): Promise<AmbassadorProfile> {
    await simulateLatency();
    const me = this.requireUser();
    let updated: AmbassadorProfile | null = null;
    store.set((d) => {
      const p = d.profiles.find((x) => x.userId === me.id);
      if (!p) return;
      Object.assign(p, patch);
      updated = { ...p };
    });
    if (!updated) throw new Error("NO_PROFILE");
    return updated;
  }

  async getMe() {
    const id = this.db().sessionUserId;
    if (!id) return null;
    const user = this.db().users.find((u) => u.id === id);
    const profile = this.profileOf(id);
    if (!user || !profile) return null;
    return { user, profile };
  }

  /* ---------------- missions ---------------- */

  private deriveUiState(mission: Mission, userId: string | null): { uiState: MissionUIState; mySubmission: Submission | null } {
    if (mission.status === "coming_soon" || mission.status === "draft") {
      return { uiState: "LOCKED", mySubmission: null };
    }
    const sub = userId
      ? this.db().submissions.find((s) => s.missionId === mission.id && s.ambassadorId === userId) ?? null
      : null;
    if (!sub) return { uiState: "AVAILABLE", mySubmission: null };
    switch (sub.state) {
      case "STARTED":
        return { uiState: "STARTED", mySubmission: sub };
      case "SUBMITTED":
        return { uiState: "SUBMITTED", mySubmission: sub };
      case "UNDER_REVIEW":
        return { uiState: "UNDER_REVIEW", mySubmission: sub };
      case "APPROVED":
        return { uiState: "APPROVED", mySubmission: sub };
      case "REJECTED":
      case "CHANGES_REQUESTED":
        return { uiState: "REJECTED", mySubmission: sub };
    }
  }

  async getMissions(): Promise<MissionWithState[]> {
    await simulateLatency();
    const userId = this.db().sessionUserId;
    return this.db().missions
      .filter((m) => m.status !== "archived" && m.status !== "draft")
      .map((m) => ({ ...m, ...this.deriveUiState(m, userId) }));
  }

  async getMission(slug: string): Promise<MissionWithState | null> {
    await simulateLatency();
    const m = this.db().missions.find((x) => x.slug === slug);
    if (!m) return null;
    return { ...m, ...this.deriveUiState(m, this.db().sessionUserId) };
  }

  async startMission(missionId: string): Promise<Submission> {
    await simulateLatency();
    const me = this.requireUser();
    const existing = this.db().submissions.find((s) => s.missionId === missionId && s.ambassadorId === me.id);
    if (existing) return existing;
    const sub: Submission = {
      id: uid("sub"),
      missionId,
      ambassadorId: me.id,
      state: "STARTED",
    };
    store.set((d) => {
      d.submissions.push(sub);
    });
    return sub;
  }

  private validateProof(mission: Mission, input: SubmitProofInput, excludeSubmissionId?: string) {
    if (mission.proofRequired.url) {
      if (!input.proofUrl) throw new Error("URL_REQUIRED");
      if (mission.brand === "linkedin" && !isValidLinkedInPostUrl(input.proofUrl)) {
        throw new Error("INVALID_LINKEDIN_URL");
      }
      const normalized = normalizeForDedupe(input.proofUrl);
      const dupe = this.db().submissions.find(
        (s) =>
          s.id !== excludeSubmissionId &&
          s.missionId === mission.id &&
          s.normalizedUrl === normalized &&
          s.state !== "REJECTED",
      );
      if (dupe) throw new Error("DUPLICATE_URL");
    }
    if (mission.proofRequired.screenshot && !input.screenshotDataUrl) {
      throw new Error("SCREENSHOT_REQUIRED");
    }
  }

  async submitProof(input: SubmitProofInput): Promise<Submission> {
    await simulateLatency();
    const me = this.requireUser();
    const mission = this.db().missions.find((m) => m.id === input.missionId);
    if (!mission) throw new Error("MISSION_NOT_FOUND");
    if (mission.status === "paused") throw new Error("MISSION_PAUSED");
    if (mission.deadline && new Date(mission.deadline) < new Date()) throw new Error("DEADLINE_PASSED");
    this.validateProof(mission, input);

    const normalized = mission.proofRequired.url ? normalizeForDedupe(input.proofUrl ?? "") : undefined;
    const now = nowIso();
    let result: Submission | null = null;
    store.set((d) => {
      let sub = d.submissions.find((s) => s.missionId === mission.id && s.ambassadorId === me.id);
      if (!sub) {
        sub = { id: uid("sub"), missionId: mission.id, ambassadorId: me.id, state: "STARTED" };
        d.submissions.push(sub);
      }
      sub.state = "UNDER_REVIEW";
      sub.proofUrl = input.proofUrl;
      sub.normalizedUrl = normalized;
      sub.screenshotDataUrl = input.screenshotDataUrl;
      sub.note = input.note;
      sub.submittedAt = now;
      sub.reviewReason = undefined;
      result = sub;
      d.notifications.unshift({
        id: uid("not"),
        userId: me.id,
        type: "submission_approved", // reused channel: review lifecycle notification
        title: "Submission received",
        body: `We received your proof for "${mission.title}". Verification usually takes up to 24 hours.`,
        createdAt: now,
        href: "/submissions",
      });
    });
    if (!result) throw new Error("UNKNOWN");
    return result;
  }

  async resubmitProof(submissionId: string, input: SubmitProofInput): Promise<Submission> {
    await simulateLatency();
    const me = this.requireUser();
    const sub = this.db().submissions.find((s) => s.id === submissionId);
    if (!sub || sub.ambassadorId !== me.id) throw new Error("NOT_FOUND");
    const mission = this.db().missions.find((m) => m.id === sub.missionId);
    if (!mission) throw new Error("MISSION_NOT_FOUND");
    this.validateProof(mission, input, submissionId);
    const normalized = mission.proofRequired.url ? normalizeForDedupe(input.proofUrl ?? "") : undefined;
    let result: Submission | null = null;
    store.set((d) => {
      const s = d.submissions.find((x) => x.id === submissionId)!;
      s.state = "UNDER_REVIEW";
      s.proofUrl = input.proofUrl ?? s.proofUrl;
      s.normalizedUrl = normalized ?? s.normalizedUrl;
      s.screenshotDataUrl = input.screenshotDataUrl ?? s.screenshotDataUrl;
      s.note = input.note ?? s.note;
      s.submittedAt = nowIso();
      s.reviewReason = undefined;
      result = s;
    });
    if (!result) throw new Error("UNKNOWN");
    return result;
  }

  async getMySubmissions(): Promise<Submission[]> {
    await simulateLatency();
    const me = this.requireUser();
    return this.db()
      .submissions.filter((s) => s.ambassadorId === me.id && s.state !== "STARTED")
      .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  }

  async getSubmission(id: string): Promise<Submission | null> {
    await simulateLatency();
    return this.db().submissions.find((s) => s.id === id) ?? null;
  }

  /* ---------------- derived points / rank / tier ---------------- */

  async getMyPoints(): Promise<PointsSummary> {
    await simulateLatency();
    const me = this.requireUser();
    const ledger = this.db()
      .ledger.filter((t) => t.ambassadorId === me.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { total: sumPoints(ledger), ledger };
  }

  private totalsByAmbassador(): Map<string, { total: number; reachedAt: string }> {
    const map = new Map<string, { total: number; reachedAt: string }>();
    for (const t of this.db().ledger) {
      const cur = map.get(t.ambassadorId) ?? { total: 0, reachedAt: t.createdAt };
      cur.total += t.points;
      if (t.createdAt > cur.reachedAt) cur.reachedAt = t.createdAt;
      map.set(t.ambassadorId, cur);
    }
    return map;
  }

  async getMyRank(): Promise<RankInfo> {
    await simulateLatency();
    const me = this.requireUser();
    const totals = this.totalsByAmbassador();
    const activeProfiles = this.db().profiles.filter((p) => p.status === "active");
    const entries = activeProfiles.map((p) => ({
      id: p.userId,
      total: totals.get(p.userId)?.total ?? 0,
      reachedAt: totals.get(p.userId)?.reachedAt ?? p.joinedAt,
    }));
    const ranked = rankEntries(entries);
    const mine = ranked.find((r) => r.id === me.id);
    return { rank: mine?.rank ?? entries.length, totalAmbassadors: entries.length };
  }

  async getLeaderboard(opts: { scope: "individual" | "college"; period: "all" | "weekly" | "monthly" }) {
    await simulateLatency();
    const me = this.db().sessionUserId;
    const totals = this.totalsByAmbassador();
    const profiles = this.db().profiles.filter((p) => p.status === "active");

    const individual: LeaderboardEntry[] = (() => {
      const rawEntries = profiles.map((p) => {
        const t = totals.get(p.userId);
        return {
          ambassadorId: p.userId,
          name: this.db().users.find((u) => u.id === p.userId)?.name ?? "Unknown",
          college: p.college,
          collegeShort: this.db().colleges.find((c) => c.name === p.college)?.shortName ?? p.college.slice(0, 4).toUpperCase(),
          points: t?.total ?? 0,
          reachedAt: t?.reachedAt ?? p.joinedAt,
          isDemo: p.isDemo,
        };
      });
      const ranked = rankEntries(
        rawEntries.map((e) => ({ id: e.ambassadorId, total: e.points, reachedAt: e.reachedAt })),
      );
      const entries = rawEntries;
      const rewards = this.db().rewards;
      return entries
        .map((e) => {
          const rank = ranked.find((r) => r.id === e.ambassadorId)!.rank;
          const tier = [...rewards].reverse().find((rw) => rw.threshold <= e.points) ?? null;
          return {
            rank,
            ambassadorId: e.ambassadorId,
            name: e.name,
            college: e.college,
            collegeShort: e.collegeShort,
            points: e.points,
            isMe: e.ambassadorId === me,
            isDemo: e.isDemo,
            tier: tier?.tier ?? null,
          } satisfies LeaderboardEntry;
        })
        .sort((a, b) => a.rank - b.rank);
    })();

    const college: CollegeLeaderboardEntry[] = (() => {
      const byCollege = new Map<string, { pts: number; members: number; top: { name: string; points: number } | null }>();
      for (const p of profiles) {
        const key = p.college;
        const cur = byCollege.get(key) ?? { pts: 0, members: 0, top: null };
        const pts = totals.get(p.userId)?.total ?? 0;
        cur.pts += pts;
        cur.members += 1;
        const name = this.db().users.find((u) => u.id === p.userId)?.name ?? "";
        if (!cur.top || pts > cur.top.points) cur.top = { name, points: pts };
        byCollege.set(key, cur);
      }
      const rows = [...byCollege.entries()].map(([collegeName, v]) => {
        const c = this.db().colleges.find((x) => x.name === collegeName);
        return {
          collegeId: c?.id ?? collegeName,
          name: collegeName,
          shortName: c?.shortName ?? collegeName.slice(0, 4).toUpperCase(),
          color: c?.color ?? "var(--primary)",
          totalPoints: v.pts,
          memberCount: v.members,
          averagePoints: Math.round(v.pts / Math.max(1, v.members)),
          topAmbassador: v.top,
        };
      });
      rows.sort((a, b) => b.totalPoints - a.totalPoints);
      return rows.map((r, i) => ({ rank: i + 1, ...r }));
    })();

    return { individual, college };
  }

  async getRewards(): Promise<Reward[]> {
    await simulateLatency();
    return this.db().rewards;
  }

  async getMyTier(): Promise<TierInfo> {
    await simulateLatency();
    const me = this.requireUser();
    const total = sumPoints(this.db().ledger.filter((t) => t.ambassadorId === me.id));
    return deriveTier(total, this.db().rewards);
  }

  /* ---------------- notifications ---------------- */

  async getNotifications() {
    await simulateLatency();
    const me = this.requireUser();
    return this.db()
      .notifications.filter((n) => n.userId === me.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markNotificationRead(id: string) {
    store.set((d) => {
      const n = d.notifications.find((x) => x.id === id);
      if (n && !n.readAt) n.readAt = nowIso();
    });
  }

  async markAllNotificationsRead() {
    const me = this.db().sessionUserId;
    store.set((d) => {
      d.notifications.forEach((n) => {
        if (n.userId === me && !n.readAt) n.readAt = nowIso();
      });
    });
  }

  async getAnnouncements() {
    await simulateLatency();
    return [...this.db().announcements].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt),
    );
  }

  /* ---------------- admin ---------------- */

  async listSubmissions(states?: Submission["state"][]): Promise<ReviewQueueItem[]> {
    await simulateLatency();
    const wanted = states ?? ["SUBMITTED", "UNDER_REVIEW"];
    return this.db()
      .submissions.filter((s) => wanted.includes(s.state))
      .map((s) => {
        const mission = this.db().missions.find((m) => m.id === s.missionId)!;
        const user = this.db().users.find((u) => u.id === s.ambassadorId);
        const profile = this.profileOf(s.ambassadorId);
        return {
          submission: s,
          mission,
          ambassador: { id: s.ambassadorId, name: user?.name ?? "Unknown", college: profile?.college ?? "" },
        };
      })
      .sort((a, b) => (a.submission.submittedAt ?? "").localeCompare(b.submission.submittedAt ?? ""));
  }

  /**
   * ATOMIC + IDEMPOTENT approve — simulates a server function.
   * One step: state update + PointTransaction + Notification + AuditLog.
   * Guarded by unique submissionId so double-approve never double-awards.
   */
  async approveSubmission(id: string): Promise<Submission> {
    await simulateLatency();
    const admin = this.requireUser();
    if (admin.role !== "admin") throw new Error("FORBIDDEN");
    const sub = this.db().submissions.find((s) => s.id === id);
    if (!sub) throw new Error("NOT_FOUND");
    if (sub.state === "APPROVED") return sub; // idempotent fast-path
    const alreadyAwarded = this.db().ledger.some((t) => t.submissionId === id);
    if (alreadyAwarded) {
      // state was somehow not APPROVED but points exist — fix state only, never re-award.
      store.set((d) => {
        const s = d.submissions.find((x) => x.id === id)!;
        s.state = "APPROVED";
        s.reviewedAt = nowIso();
        s.reviewerId = admin.id;
      });
      return this.db().submissions.find((s) => s.id === id)!;
    }
    const mission = this.db().missions.find((m) => m.id === sub.missionId);
    if (!mission) throw new Error("MISSION_NOT_FOUND");
    const now = nowIso();
    let result: Submission | null = null;
    store.set((d) => {
      const s = d.submissions.find((x) => x.id === id)!;
      s.state = "APPROVED";
      s.reviewedAt = now;
      s.reviewerId = admin.id;
      s.reviewReason = undefined;
      result = s;
      d.ledger.push({
        id: uid("pt"),
        ambassadorId: s.ambassadorId,
        submissionId: s.id,
        missionId: s.missionId,
        points: mission.points,
        reason: `Approved: ${mission.title}`,
        createdAt: now,
      });
      d.notifications.unshift({
        id: uid("not"),
        userId: s.ambassadorId,
        type: "submission_approved",
        title: "Mission approved 🎉",
        body: `+${mission.points} points for "${mission.title}". Keep going!`,
        createdAt: now,
        href: "/dashboard",
      });
      d.auditLog.unshift({
        id: uid("aud"),
        actorId: admin.id,
        action: "submission.approve",
        entity: "submission",
        entityId: s.id,
        createdAt: now,
      });
    });
    if (!result) throw new Error("UNKNOWN");
    return result;
  }

  async reviewSubmission(
    id: string,
    decision: "approve" | "reject" | "requestChanges",
    reason?: string,
  ): Promise<Submission> {
    if (decision === "approve") return this.approveSubmission(id);
    await simulateLatency();
    const admin = this.requireUser();
    if (admin.role !== "admin") throw new Error("FORBIDDEN");
    const now = nowIso();
    let result: Submission | null = null;
    store.set((d) => {
      const s = d.submissions.find((x) => x.id === id);
      if (!s) return;
      s.state = decision === "reject" ? "REJECTED" : "CHANGES_REQUESTED";
      s.reviewedAt = now;
      s.reviewerId = admin.id;
      s.reviewReason = reason ?? (decision === "reject" ? "Proof did not meet requirements." : "Please update your proof.");
      result = s;
      const mission = d.missions.find((m) => m.id === s.missionId);
      d.notifications.unshift({
        id: uid("not"),
        userId: s.ambassadorId,
        type: decision === "reject" ? "submission_rejected" : "changes_requested",
        title: decision === "reject" ? "Submission needs attention" : "Changes requested",
        body: `${mission ? `For "${mission.title}": ` : ""}${s.reviewReason}`,
        createdAt: now,
        href: `/missions/${mission?.slug ?? ""}`,
      });
      d.auditLog.unshift({
        id: uid("aud"),
        actorId: admin.id,
        action: decision === "reject" ? "submission.reject" : "submission.request_changes",
        entity: "submission",
        entityId: s.id,
        createdAt: now,
      });
    });
    if (!result) throw new Error("NOT_FOUND");
    return result;
  }

  async listAmbassadors() {
    await simulateLatency();
    const totals = this.totalsByAmbassador();
    return this.db()
      .profiles.filter((p) => this.db().users.find((u) => u.id === p.userId)?.role === "ambassador")
      .map((p) => {
        const u = this.db().users.find((x) => x.id === p.userId)!;
        return { profile: p, user: { id: u.id, name: u.name, email: u.email }, points: totals.get(p.userId)?.total ?? 0 };
      })
      .sort((a, b) => b.points - a.points);
  }

  async setAmbassadorStatus(userId: string, status: AmbassadorProfile["status"]) {
    await simulateLatency();
    const admin = this.requireUser();
    store.set((d) => {
      const p = d.profiles.find((x) => x.userId === userId);
      if (p) p.status = status;
      d.auditLog.unshift({
        id: uid("aud"),
        actorId: admin.id,
        action: `ambassador.status.${status}`,
        entity: "profile",
        entityId: userId,
        createdAt: nowIso(),
      });
    });
  }

  async listMissions(): Promise<Mission[]> {
    await simulateLatency();
    return this.db().missions;
  }

  async upsertMission(mission: Mission): Promise<Mission> {
    await simulateLatency();
    const admin = this.requireUser();
    if (admin.role !== "admin") throw new Error("FORBIDDEN");
    let result = mission;
    store.set((d) => {
      const idx = d.missions.findIndex((m) => m.id === mission.id);
      if (idx >= 0) {
        d.missions[idx] = mission;
      } else {
        d.missions.push({ ...mission, id: uid("mis") });
        result = { ...mission, id: d.missions[d.missions.length - 1]!.id };
      }
      d.auditLog.unshift({
        id: uid("aud"),
        actorId: admin.id,
        action: "mission.upsert",
        entity: "mission",
        entityId: result.id,
        createdAt: nowIso(),
      });
    });
    return result;
  }

  async getAdminStats() {
    await simulateLatency();
    const d = this.db();
    const pending = d.submissions.filter((s) => s.state === "SUBMITTED" || s.state === "UNDER_REVIEW").length;
    const approved = d.submissions.filter((s) => s.state === "APPROVED").length;
    const decided = d.submissions.filter((s) => ["APPROVED", "REJECTED"].includes(s.state)).length;
    return {
      totalAmbassadors: d.profiles.filter((p) => p.status === "active").length,
      pendingReviews: pending,
      pointsAwarded: sumPoints(d.ledger),
      approvalRate: decided === 0 ? 1 : approved / decided,
    };
  }

  async getAuditLog() {
    await simulateLatency();
    return this.db().auditLog.slice(0, 50);
  }

  subscribe(cb: () => void) {
    return store.subscribe(cb);
  }
}

/* ------------------------------------------------------------------ */
/* Shared derivation (used by repo + tests)                            */
/* ------------------------------------------------------------------ */

export function deriveTier(total: number, rewards: Reward[]): TierInfo {
  const sorted = [...rewards].sort((a, b) => a.threshold - b.threshold);
  const current = [...sorted].reverse().find((r) => r.threshold <= total) ?? null;
  const next = sorted.find((r) => r.threshold > total) ?? null;
  const floor = current?.threshold ?? 0;
  const ceil = next?.threshold ?? Math.max(1, floor + 1);
  const progressPercent = next
    ? Math.min(100, Math.round(((total - floor) / (ceil - floor)) * 100))
    : 100;
  return {
    current,
    next,
    pointsToNext: next ? next.threshold - total : null,
    progressPercent,
  };
}
