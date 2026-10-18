import type {
  AmbassadorProfile,
  Announcement,
  AppNotification,
  AuditLog,
  College,
  Mission,
  PointTransaction,
  Reward,
  Submission,
  User,
} from "../types";
import { createEmptyStore, type StoreShape } from "./store";

/* Deterministic pseudo-random for stable demo data. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261018);
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

export const COLLEGES: College[] = [
  { id: "mec", name: "Muthayammal Engineering College", shortName: "MEC", color: "#5B5BF0" },
  { id: "ksr", name: "KSR College of Engineering", shortName: "KSR", color: "#16A34A" },
  { id: "kongu", name: "Kongu Engineering College", shortName: "KONGU", color: "#F59E0B" },
  { id: "psg", name: "PSG College of Technology", shortName: "PSG", color: "#2563EB" },
  { id: "sona", name: "Sona College of Technology", shortName: "SONA", color: "#E11D48" },
  { id: "srm", name: "SRM Ramapuram", shortName: "SRM", color: "#8B5CF6" },
];

export const DEMO_NAMES = [
  "Arjun Karthikeyan",
  "Priya Lakshmi",
  "Vignesh Kumar",
  "Divya Bharathi",
  "Karthik Raja",
  "Meena Sundaram",
  "Surya Prakash",
  "Anitha Rajesh",
  "Manoj Venkat",
  "Swetha Nair",
  "Ramesh Babu",
  "Lakshmi Priyaa",
  "Dinesh Murugan",
  "Fathima Noor",
  "Gokul Anand",
  "Harini Sridhar",
  "Immanuel John",
  "Jagan Mohan",
  "Keerthana Das",
  "Loganathan Pillai",
  "Monica Fernandes",
  "Naveen Chandra",
  "Oviya Shankar",
  "Pradeep Eswari",
];

export const LINKEDIN_TEMPLATE_EN = `Excited to share that I've joined Zyven as a Student Ambassador! 🎉

Zyven is building something special for students — real missions, real recognition, real growth.

Follow @Zyven to see what we're building.

#Zyven #StudentAmbassador`;

export const LINKEDIN_TEMPLATE_TA = `நான் Zyven-ன் Student Ambassador ஆவதை மகிழ்ச்சியுடன் பகிர்கிறேன்! 🎉

மாணவர்களுக்கான உண்மையான opportunities — real missions, real recognition, real growth.

@Zyven-ஐ follow செய்யுங்கள்.

#Zyven #StudentAmbassador`;

function missions(): Mission[] {
  return [
    {
      id: "mis_linkedin",
      slug: "linkedin-follow-post",
      title: "Follow & Post on LinkedIn",
      titleTa: "LinkedIn-ல் Follow & Post",
      description:
        "Follow the Zyven LinkedIn page and publish a post about the program. Earn 50 points for one verified post.",
      descriptionTa:
        "Zyven LinkedIn பக்கத்தை follow செய்து, நிகழ்ச்சி குறித்த post வெளியிடுங்கள். ஒரு verified post-க்கு 50 points.",
      category: "social",
      instructions: [
        {
          id: "follow",
          title: "Follow Zyven on LinkedIn",
          titleTa: "LinkedIn-ல் Zyven-ஐ follow செய்யவும்",
          body: "Open our company page in a new tab and hit Follow.",
          bodyTa: "எங்களுடைய company page-ஐ புதிய tab-ல் திறந்து Follow அழுத்தவும்.",
          action: { kind: "external", url: "https://www.linkedin.com/company/zyven" },
        },
        {
          id: "post",
          title: "Create your post",
          titleTa: "உங்களுடைய post-ஐ உருவாக்கவும்",
          body: "Use the template below (English or Tamil), edit it in your own voice, then publish.",
          bodyTa: "கீழே உள்ள template-ஐ பயன்படுத்தி, உங்கள் ஸ்டைலில் மாற்றி publish செய்யவும்.",
          action: { kind: "copy_template" },
        },
        {
          id: "proof",
          title: "Submit proof",
          titleTa: "Proof அனுப்பவும்",
          body: "Paste the URL of your published post. A screenshot is optional but speeds up review.",
          bodyTa: "உங்கள் post-ன் URL paste செய்யவும். Screenshot optional, ஆனால் review வேகமாகும்.",
          action: { kind: "input_url" },
        },
      ],
      points: 50,
      difficulty: "easy",
      estimatedMinutes: 10,
      startsAt: daysAgo(30),
      status: "live",
      proofTypes: ["url", "screenshot"],
      proofRequired: { url: true, screenshot: false },
      verification: "manual",
      externalUrl: "https://www.linkedin.com/company/zyven",
      brand: "linkedin",
      postTemplate: { en: LINKEDIN_TEMPLATE_EN, ta: LINKEDIN_TEMPLATE_TA },
    },
    {
      id: "mis_whatsapp",
      slug: "whatsapp-community",
      title: "Join the Zyven WhatsApp Community",
      titleTa: "Zyven WhatsApp Community-வில் இணையவும்",
      description:
        "Join the official Zyven student community on WhatsApp and share a screenshot of your membership. 30 points.",
      descriptionTa:
        "Zyven-ன் official student community-வில் WhatsApp-ல் இணைந்து membership screenshot பகிரவும். 30 points.",
      category: "community",
      instructions: [
        {
          id: "join",
          title: "Join the community",
          titleTa: "Community-வில் இணையவும்",
          body: "Tap the button to open the WhatsApp community link.",
          bodyTa: "WhatsApp community link-ஐ திறக்க button அழுத்தவும்.",
          action: { kind: "external", url: "https://chat.whatsapp.com/zyven-community" },
        },
        {
          id: "screenshot",
          title: "Upload a screenshot",
          titleTa: "Screenshot பதிவேற்றவும்",
          body: "Screenshot the community screen showing you are a member. Required for this mission.",
          bodyTa: "Member ஆக இருப்பதை காட்டும் community screen-ன் screenshot தேவை.",
          action: { kind: "upload" },
        },
        {
          id: "submit",
          title: "Submit for review",
          titleTa: "Review-க்காக submit செய்யவும்",
          body: "Verification usually takes up to 24 hours.",
          bodyTa: "Verification பொதுவாக 24 மணி நேரம் வரை ஆகலாம்.",
          action: { kind: "confirm" },
        },
      ],
      points: 30,
      difficulty: "easy",
      estimatedMinutes: 5,
      startsAt: daysAgo(30),
      status: "live",
      proofTypes: ["screenshot"],
      proofRequired: { url: false, screenshot: true },
      verification: "manual",
      externalUrl: "https://chat.whatsapp.com/zyven-community",
      brand: "whatsapp",
    },
    {
      id: "mis_instagram",
      slug: "instagram-story",
      title: "Instagram Story Shout-out",
      titleTa: "Instagram Story Shout-out",
      description: "Share Zyven on your Instagram story and tag the official handle.",
      descriptionTa: "Zyven-ஐ Instagram story-ல் share செய்து official handle tag செய்யவும்.",
      category: "social",
      instructions: [],
      points: 40,
      difficulty: "easy",
      estimatedMinutes: 5,
      startsAt: daysAgo(30),
      status: "coming_soon",
      proofTypes: ["screenshot"],
      proofRequired: { url: false, screenshot: true },
      verification: "manual",
      brand: "instagram",
    },
    {
      id: "mis_event",
      slug: "campus-event-host",
      title: "Campus Event Host",
      titleTa: "Campus Event Host",
      description: "Host a Zyven info session on your campus with our kit and support.",
      descriptionTa: "எங்கள் kit மற்றும் support-உடன் campus-ல் Zyven info session நடத்தவும்.",
      category: "event",
      instructions: [],
      points: 120,
      difficulty: "hard",
      estimatedMinutes: 120,
      startsAt: daysAgo(30),
      status: "coming_soon",
      proofTypes: ["screenshot", "text"],
      proofRequired: { url: false, screenshot: true },
      verification: "manual",
      brand: "event",
    },
    {
      id: "mis_referral",
      slug: "refer-three-friends",
      title: "Refer 3 Friends",
      titleTa: "3 நண்பர்களை Refer செய்யவும்",
      description: "Invite three classmates who complete their first mission.",
      descriptionTa: "முதல் mission முடிக்கும் மூன்று வகுப்பு நண்பர்களை அழைக்கவும்.",
      category: "referral",
      instructions: [],
      points: 90,
      difficulty: "medium",
      estimatedMinutes: 30,
      startsAt: daysAgo(30),
      status: "coming_soon",
      proofTypes: ["text"],
      proofRequired: { url: false, screenshot: false },
      verification: "auto",
      brand: "referral",
    },
    {
      id: "mis_college_week",
      slug: "college-challenge-week",
      title: "College Challenge Week",
      titleTa: "College Challenge Week",
      description: "A week-long college vs college push. Coming soon for launch season.",
      descriptionTa: "ஒரு வாரம் college vs college challenge. Launch season-க்கு வருகிறது.",
      category: "college",
      instructions: [],
      points: 200,
      difficulty: "hard",
      estimatedMinutes: 600,
      startsAt: daysAgo(30),
      status: "coming_soon",
      proofTypes: ["url", "screenshot"],
      proofRequired: { url: false, screenshot: true },
      verification: "manual",
      brand: "college",
    },
  ];
}

function rewards(): Reward[] {
  return [
    {
      id: "rew_bronze",
      tier: "bronze",
      threshold: 50,
      title: "Bronze Ambassador",
      titleTa: "Bronze Ambassador",
      perks: [
        "Digital badge for LinkedIn",
        "Founding Cohort certificate of recognition (planned)",
        "Early access to new missions",
      ],
    },
    {
      id: "rew_silver",
      tier: "silver",
      threshold: 150,
      title: "Silver Ambassador",
      titleTa: "Silver Ambassador",
      perks: [
        "Zyven merch pack (planned)",
        "Priority access to event hosting",
        "Featured on the wall of fame",
      ],
    },
    {
      id: "rew_gold",
      tier: "gold",
      threshold: 300,
      title: "Gold Ambassador",
      titleTa: "Gold Ambassador",
      perks: [
        "Signed certificate + recommendation letter (planned)",
        "Internship fast-track consideration",
        "Direct line to the Zyven team",
      ],
    },
    {
      id: "rew_champion",
      tier: "champion",
      threshold: 500,
      title: "Champion Ambassador",
      titleTa: "Champion Ambassador",
      perks: [
        "Top-of-leaderboard spotlight",
        "Speaking slot at launch event (planned)",
        "Champion swag box",
      ],
    },
  ];
}

/** Seed the whole mock database. Thangaraj starts clean: 0 points, no submissions. */
export function buildSeed(): StoreShape {
  const s = createEmptyStore();
  s.colleges = COLLEGES;
  s.missions = missions();
  s.rewards = rewards();

  /* Current demo ambassador — clean first-run experience. */
  const thangaraj: User = {
    id: "usr_thangaraj",
    role: "ambassador",
    name: "Thangaraj",
    email: "thangaraj@example.com",
  };
  s.users.push(thangaraj);
  s.profiles.push({
    userId: thangaraj.id,
    college: "Muthayammal Engineering College",
    department: "CSBS",
    year: 2,
    city: "Rasipuram",
    interests: ["social-media", "public-speaking"],
    skills: ["content"],
    whyJoin: "I want to build my network and represent my college.",
    status: "active",
    joinedAt: daysAgo(2),
    cohortNumber: 37,
    isDemo: false,
  });

  const admin: User = {
    id: "usr_admin",
    role: "admin",
    name: "Zyven Admin",
    email: "admin@zyven.app",
  };
  s.users.push(admin);

  /* 24 demo ambassadors across 6 colleges, varied points 20..420. */
  DEMO_NAMES.forEach((name, i) => {
    const user: User = { id: `usr_demo_${i}`, role: "ambassador", name, email: `${name.split(" ")[0]!.toLowerCase()}${i}@demo.zyven.app` };
    const college = COLLEGES[i % COLLEGES.length]!;
    s.users.push(user);
    s.profiles.push({
      userId: user.id,
      college: college.name,
      department: ["CSE", "ECE", "MECH", "CSBS", "IT", "CIVIL"][Math.floor(rand() * 6)]!,
      year: (1 + Math.floor(rand() * 4)) as 1 | 2 | 3 | 4,
      city: ["Namakkal", "Salem", "Erode", "Coimbatore", "Rasipuram", "Tiruchy"][Math.floor(rand() * 6)]!,
      interests: [],
      skills: [],
      whyJoin: "Demo profile.",
      status: "active",
      joinedAt: daysAgo(Math.floor(rand() * 25) + 3),
      cohortNumber: i + 1,
      isDemo: true,
    });

    const targetPoints = 20 + Math.floor(rand() * 400);
    // Compose ledger entries out of mission values so sums look organic.
    let remaining = targetPoints;
    let guard = 0;
    while (remaining > 0 && guard < 12) {
      guard += 1;
      const options = [50, 30, 40, 90, 120].filter((p) => p <= remaining);
      if (options.length === 0) break;
      const pts = options[Math.floor(rand() * options.length)]!;
      remaining -= pts;
      const missionId = ["mis_linkedin", "mis_whatsapp", "mis_instagram", "mis_referral", "mis_event"][
        Math.floor(rand() * 5)
      ]!;
      const subId = `sub_seed_${i}_${guard}`;
      const submittedAt = daysAgo(Math.floor(rand() * 20) + 1);
      s.submissions.push({
        id: subId,
        missionId,
        ambassadorId: user.id,
        state: "APPROVED",
        submittedAt,
        reviewedAt: submittedAt,
        reviewerId: admin.id,
      });
      s.ledger.push({
        id: `pt_${subId}`,
        ambassadorId: user.id,
        submissionId: subId,
        missionId,
        points: pts,
        reason: "seed",
        createdAt: submittedAt,
      });
    }
  });

  /* 3 pending submissions so the admin queue is not empty. */
  const pendables = [0, 3, 7];
  pendables.forEach((idx, i) => {
    const demoUser = s.users.find((u) => u.id === `usr_demo_${idx}`);
    if (!demoUser) return;
    const states: Submission["state"][] = ["SUBMITTED", "UNDER_REVIEW", "SUBMITTED"];
    const missionIds = ["mis_linkedin", "mis_whatsapp", "mis_linkedin"];
    s.submissions.push({
      id: `sub_pending_${i}`,
      missionId: missionIds[i]!,
      ambassadorId: demoUser.id,
      state: states[i]!,
      proofUrl:
        missionIds[i] === "mis_linkedin"
          ? `https://www.linkedin.com/feed/update/urn:li:activity:7${2000000000000 + i}/`
          : undefined,
      normalizedUrl:
        missionIds[i] === "mis_linkedin"
          ? `linkedin.com/feed/update/urn:li:activity:7${2000000000000 + i}`
          : undefined,
      note: "Please verify my submission.",
      submittedAt: daysAgo(i + 1),
    });
  });

  /* Announcements */
  s.announcements = [
    {
      id: "ann_1",
      title: "Founding Cohort is open",
      body: "The first 100 ambassadors get lifetime founding-member recognition. Bring a friend!",
      createdAt: daysAgo(1),
      pinned: true,
    },
    {
      id: "ann_2",
      title: "New missions drop every Friday",
      body: "Instagram Story and Campus Event Host are next. Keep an eye on the Missions tab.",
      createdAt: daysAgo(4),
      pinned: false,
    },
  ];

  /* Notifications + audit entries for a sample of the seeded approvals. */
  const notif: AppNotification[] = [];
  const audit: AuditLog[] = [];
  s.submissions
    .filter((sub) => sub.state === "APPROVED")
    .slice(0, 6)
    .forEach((sub) => {
      audit.push({
        id: `aud_${sub.id}`,
        actorId: admin.id,
        action: "submission.approve",
        entity: "submission",
        entityId: sub.id,
        createdAt: sub.reviewedAt ?? sub.submittedAt ?? daysAgo(5),
      });
      const mission = s.missions.find((m) => m.id === sub.missionId);
      notif.push({
        id: `not_${sub.id}`,
        userId: sub.ambassadorId,
        type: "points_awarded",
        title: "Mission approved",
        body: `+${mission?.points ?? 0} points added to your ledger.`,
        createdAt: sub.reviewedAt ?? sub.submittedAt ?? daysAgo(5),
        href: "/dashboard",
      });
    });

  /* One REJECTED submission (with notification) so the resubmit path is demoable. */
  const rejectedUser = s.users.find((u) => u.id === "usr_demo_2");
  if (rejectedUser) {
    const rejSubId = "sub_rejected_0";
    s.submissions.push({
      id: rejSubId,
      missionId: "mis_linkedin",
      ambassadorId: rejectedUser.id,
      state: "REJECTED",
      proofUrl: "https://www.linkedin.com/in/someone",
      normalizedUrl: "linkedin.com/in/someone",
      submittedAt: daysAgo(3),
      reviewedAt: daysAgo(2),
      reviewerId: admin.id,
      reviewReason: "That link points to a profile, not a post. Paste the post URL.",
    });
    audit.push({
      id: `aud_${rejSubId}`,
      actorId: admin.id,
      action: "submission.reject",
      entity: "submission",
      entityId: rejSubId,
      createdAt: daysAgo(2),
    });
    notif.push({
      id: `not_${rejSubId}`,
      userId: rejectedUser.id,
      type: "submission_rejected",
      title: "Changes needed on your LinkedIn submission",
      body: "That link points to a profile, not a post. Please resubmit with the post URL.",
      createdAt: daysAgo(2),
      href: "/missions/linkedin-follow-post",
    });
  }

  s.notifications = notif;
  s.auditLog = audit;

  return s;
}
