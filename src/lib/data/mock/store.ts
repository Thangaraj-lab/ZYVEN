import type {
  AmbassadorProfile,
  Announcement,
  AppNotification,
  AuditLog,
  College,
  Mission,
  MockSettings,
  PointTransaction,
  Reward,
  Submission,
  User,
} from "../types";

export interface StoreShape {
  users: User[];
  profiles: AmbassadorProfile[];
  missions: Mission[];
  submissions: Submission[];
  ledger: PointTransaction[];
  rewards: Reward[];
  notifications: AppNotification[];
  announcements: Announcement[];
  auditLog: AuditLog[];
  colleges: College[];
  settings: MockSettings;
  sessionUserId: string | null;
  /** mock-only credential vault (userId -> password). Never exposed via hooks. */
  passwords: Record<string, string>;
  seenTiers: Record<string, string[]>; // userId -> tiers already celebrated
  version: number;
}

const STORAGE_KEY = "zyven-mock-store-v2";
export const STORE_VERSION = 2;

type Listener = () => void;

/** Build a fresh store (seed injected by seed.ts to avoid circular imports). */
export function createEmptyStore(): StoreShape {
  return {
    users: [],
    profiles: [],
    missions: [],
    submissions: [],
    ledger: [],
    rewards: [],
    notifications: [],
    announcements: [],
    auditLog: [],
    colleges: [],
    settings: { approvalRequired: false, slowNetwork: false },
    sessionUserId: null,
    passwords: {},
    seenTiers: {},
    version: STORE_VERSION,
  };
}

class MockStore {
  private data: StoreShape = createEmptyStore();
  private listeners = new Set<Listener>();
  private hydrated = false;

  /** Hydrate from localStorage or seed on first access (client only). */
  hydrate(seedFn: () => StoreShape) {
    if (this.hydrated) return;
    this.hydrated = true;
    if (typeof window === "undefined") {
      this.data = seedFn();
      return;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreShape;
        if (parsed.version === STORE_VERSION) {
          this.data = parsed;
          return;
        }
      }
    } catch {
      /* fall through to seed */
    }
    this.data = seedFn();
    this.persist();
  }

  get(): StoreShape {
    return this.data;
  }

  set(updater: (draft: StoreShape) => void) {
    updater(this.data);
    this.persist();
    this.emit();
  }

  replace(next: StoreShape) {
    this.data = next;
    this.persist();
    this.emit();
  }

  persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      /* storage full — mock keeps in-memory copy */
    }
  }

  subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  emit() {
    this.listeners.forEach((l) => l());
  }

  clearStorage() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const store = new MockStore();

/** Artificial latency so skeletons are real. 300-700ms, 2s when slow-network is toggled. */
export async function simulateLatency(settings?: MockSettings): Promise<void> {
  const slow = settings?.slowNetwork ?? store.get().settings.slowNetwork;
  const ms = slow ? 2000 : 300 + Math.random() * 400;
  await new Promise((r) => setTimeout(r, ms));
}

let idCounter = 0;
export function uid(prefix: string): string {
  idCounter += 1;
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}${idCounter}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
