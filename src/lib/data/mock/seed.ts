import type { AppNotification, AuditLog, College, Mission, Reward, User } from "../types";
import { createEmptyStore, type StoreShape } from "./store";

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

export const COLLEGES: College[] = [
  { id: "mec", name: "Muthayammal Engineering College", shortName: "MEC", color: "#5B5BF0" },
  { id: "ksr", name: "KSR College of Engineering", shortName: "KSR", color: "#16A34A" },
  { id: "kongu", name: "Kongu Engineering College", shortName: "KONGU", color: "#F59E0B" },
  { id: "psg", name: "PSG College of Technology", shortName: "PSG", color: "#2563EB" },
  { id: "sona", name: "Sona College of Technology", shortName: "SONA", color: "#E11D48" },
  { id: "srm", name: "SRM Ramapuram", shortName: "SRM", color: "#8B5CF6" },
];

/** Colleges offered in the registration searchable select. */
export const COLLEGE_OPTIONS = COLLEGES.map((c) => c.name);

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

/**
 * Seed data for the mock backend. Each account is a REAL login (email +
 * password) so authentication behaves like a production system:
 *   student → thangaraj@student.zyven.app / student123  (starts clean: 0 pts)
 *   history → priya@student.zyven.app / student123      (approved + rejected items)
 *   admin   → admin@zyven.app / admin123
 * No duplicate users, profiles, submissions or ledger rows exist per user.
 */
export function buildSeed(): StoreShape {
  const s = createEmptyStore();
  s.colleges = COLLEGES;
  s.missions = missions();
  s.rewards = rewards();

  /* ---- accounts (passwords live only inside the mock store) ---- */
  const accounts: Array<{ user: User; password: string }> = [
    {
      user: {
        id: "usr_thangaraj",
        role: "ambassador",
        name: "Thangaraj",
        email: "thangaraj@student.zyven.app",
        phone: "+91 90000 00001",
      },
      password: "student123",
    },
    {
      user: { id: "usr_priya", role: "ambassador", name: "Priya Lakshmi", email: "priya@student.zyven.app" },
      password: "student123",
    },
    {
      user: { id: "usr_vignesh", role: "ambassador", name: "Vignesh Kumar", email: "vignesh@student.zyven.app" },
      password: "student123",
    },
    {
      user: { id: "usr_divya", role: "ambassador", name: "Divya Bharathi", email: "divya@student.zyven.app" },
      password: "student123",
    },
    {
      user: { id: "usr_karthik", role: "ambassador", name: "Karthik Raja", email: "karthik@student.zyven.app" },
      password: "student123",
    },
    {
      user: { id: "usr_admin", role: "admin", name: "Zyven Admin", email: "admin@zyven.app" },
      password: "admin123",
    },
  ];
  accounts.forEach((a) => s.users.push(a.user));
  s.passwords = Object.fromEntries(accounts.map((a) => [a.user.id, a.password]));

  /* ---- profiles (exactly one per ambassador) ---- */
  s.profiles = [
    {
      userId: "usr_thangaraj",
      college: "Muthayammal Engineering College",
      department: "CSBS",
      year: 2,
      city: "Rasipuram",
      linkedin: "https://www.linkedin.com/in/thangaraj",
      interests: ["social-media", "tech"],
      skills: ["content", "public speaking"],
      whyJoin: "I want to build my network and represent my college in the founding cohort.",
      status: "active",
      joinedAt: daysAgo(6),
      cohortNumber: 1,
      isDemo: false,
    },
    {
      userId: "usr_priya",
      college: "Kongu Engineering College",
      department: "CSE",
      year: 3,
      city: "Erode",
      linkedin: "https://www.linkedin.com/in/priyalakshmi",
      interests: ["content", "design"],
      skills: ["video editing"],
      whyJoin: "Love building communities and creating content.",
      status: "active",
      joinedAt: daysAgo(28),
      cohortNumber: 2,
      isDemo: false,
    },
    {
      userId: "usr_vignesh",
      college: "SRM Ramapuram",
      department: "IT",
      year: 4,
      city: "Chennai",
      interests: ["events", "speaking"],
      skills: ["anchoring"],
      whyJoin: "Campus events are my thing.",
      status: "active",
      joinedAt: daysAgo(26),
      cohortNumber: 3,
      isDemo: false,
    },
    {
      userId: "usr_divya",
      college: "PSG College of Technology",
      department: "ECE",
      year: 1,
      city: "Coimbatore",
      interests: ["community", "branding"],
      skills: ["writing"],
      whyJoin: "First year already, first ambassador always.",
      status: "active",
      joinedAt: daysAgo(20),
      cohortNumber: 4,
      isDemo: false,
    },
    {
      userId: "usr_karthik",
      college: "Sona College of Technology",
      department: "MECH",
      year: 2,
      city: "Salem",
      interests: ["tech", "social-media"],
      skills: ["canva"],
      whyJoin: "Want early exposure to industry.",
      status: "active",
      joinedAt: daysAgo(15),
      cohortNumber: 5,
      isDemo: false,
    },
  ];

  /* ---- approved history (one row per submission in both tables) ---- */
  const mkApproved = (id: string, missionId: string, userId: string, pts: number, ago: number) => {
    const at = daysAgo(ago);
    s.submissions.push({
      id,
      missionId,
      ambassadorId: userId,
      state: "APPROVED",
      submittedAt: at,
      reviewedAt: at,
      reviewerId: "usr_admin",
    });
    s.ledger.push({
      id: `pt_${id}`,
      ambassadorId: userId,
      submissionId: id,
      missionId,
      points: pts,
      reason: "Approved mission",
      createdAt: at,
    });
  };
  mkApproved("sub_priya_li", "mis_linkedin", "usr_priya", 50, 20);
  mkApproved("sub_priya_wa", "mis_whatsapp", "usr_priya", 30, 18);
  mkApproved("sub_vig_li", "mis_linkedin", "usr_vignesh", 50, 12);
  mkApproved("sub_div_wa", "mis_whatsapp", "usr_divya", 30, 9);

  /* ---- review queue (pending items from real accounts) ---- */
  s.submissions.push(
    {
      id: "sub_queue_1",
      missionId: "mis_linkedin",
      ambassadorId: "usr_vignesh",
      state: "SUBMITTED",
      proofUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7123456789012/",
      normalizedUrl: "linkedin.com/feed/update/urn:li:activity:7123456789012",
      note: "Posted about Zyven launch week!",
      submittedAt: daysAgo(1),
    },
    {
      id: "sub_queue_2",
      missionId: "mis_whatsapp",
      ambassadorId: "usr_karthik",
      state: "UNDER_REVIEW",
      note: "Joined the community, screenshot attached during signup.",
      submittedAt: daysAgo(2),
    },
    {
      id: "sub_queue_3",
      missionId: "mis_linkedin",
      ambassadorId: "usr_divya",
      state: "SUBMITTED",
      proofUrl: "https://www.linkedin.com/posts/zyven-community-first-post-activity-7123456789013",
      normalizedUrl: "linkedin.com/posts/zyven-community-first-post-activity-7123456789013",
      submittedAt: daysAgo(3),
    },
  );

  /* ---- one rejected example so the resubmit path exists ---- */
  s.submissions.push({
    id: "sub_rejected_1",
    missionId: "mis_whatsapp",
    ambassadorId: "usr_priya",
    state: "REJECTED",
    note: "Oops, uploaded the wrong screenshot.",
    submittedAt: daysAgo(5),
    reviewedAt: daysAgo(4),
    reviewerId: "usr_admin",
    reviewReason: "The screenshot does not show your name in the member list. Please retake it.",
  });

  /* ---- announcements ---- */
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

  /* ---- notifications (scoped per user, no duplicates) ---- */
  const notif: AppNotification[] = [
    {
      id: "not_priya_rej",
      userId: "usr_priya",
      type: "submission_rejected",
      title: "Changes needed on your WhatsApp submission",
      body: "The screenshot does not show your name in the member list. Please retake it.",
      createdAt: daysAgo(4),
      href: "/missions/whatsapp-community",
    },
    {
      id: "not_priya_pts",
      userId: "usr_priya",
      type: "points_awarded",
      title: "Mission approved 🎉",
      body: '+30 points for "Join the Zyven WhatsApp Community". Keep going!',
      createdAt: daysAgo(18),
      href: "/dashboard",
    },
    {
      id: "not_vig_sub",
      userId: "usr_vignesh",
      type: "submission_approved",
      title: "Submission received",
      body: 'We received your proof for "Follow & Post on LinkedIn". Verification usually takes up to 24 hours.',
      createdAt: daysAgo(1),
      href: "/submissions",
    },
  ];
  s.notifications = notif;

  /* ---- audit log ---- */
  const audit: AuditLog[] = [
    { id: "aud_1", actorId: "usr_admin", action: "submission.reject", entity: "submission", entityId: "sub_rejected_1", createdAt: daysAgo(4) },
    { id: "aud_2", actorId: "usr_admin", action: "submission.approve", entity: "submission", entityId: "sub_priya_wa", createdAt: daysAgo(18) },
    { id: "aud_3", actorId: "usr_admin", action: "submission.approve", entity: "submission", entityId: "sub_priya_li", createdAt: daysAgo(20) },
    { id: "aud_4", actorId: "usr_karthik", action: "ambassador.register", entity: "profile", entityId: "usr_karthik", createdAt: daysAgo(15) },
    { id: "aud_5", actorId: "usr_thangaraj", action: "ambassador.register", entity: "profile", entityId: "usr_thangaraj", createdAt: daysAgo(6) },
  ];
  s.auditLog = audit;

  return s;
}
