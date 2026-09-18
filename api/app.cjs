var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server/vercelHandler.ts
var vercelHandler_exports = {};
__export(vercelHandler_exports, {
  default: () => handler
});
module.exports = __toCommonJS(vercelHandler_exports);
var import_node_path = __toESM(require("node:path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);

// src/server/createApp.ts
var import_express = __toESM(require("express"), 1);

// src/server/securityMiddleware.ts
var import_cors = __toESM(require("cors"), 1);
var import_helmet = __toESM(require("helmet"), 1);
function allowedOrigins() {
  const fromEnv = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const appUrl = process.env.APP_URL?.trim();
  const defaults = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.aurahealth.co.ke",
    "https://aurahealth.co.ke",
    "https://aurahealth-delta.vercel.app"
  ];
  const set = /* @__PURE__ */ new Set([...defaults, ...fromEnv]);
  if (appUrl) {
    try {
      set.add(new URL(appUrl).origin);
    } catch {
    }
  }
  return [...set];
}
function sanitizeFunnelMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return void 0;
  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    if (Object.keys(out).length >= 12) break;
    const k = key.slice(0, 40).toLowerCase();
    if (/email|password|token|phone|note|message|prompt|image|base64/.test(k)) continue;
    if (typeof value === "string") out[key.slice(0, 40)] = value.slice(0, 120);
    else if (typeof value === "number" && Number.isFinite(value)) out[key.slice(0, 40)] = value;
    else if (typeof value === "boolean") out[key.slice(0, 40)] = value;
  }
  return Object.keys(out).length ? out : void 0;
}
function isSafeHttpUrl(raw) {
  if (typeof raw !== "string" || !raw.trim()) return false;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
function applySecurityMiddleware(app3) {
  app3.disable("x-powered-by");
  const isProd = process.env.NODE_ENV === "production";
  app3.use(
    (0, import_helmet.default)({
      contentSecurityPolicy: isProd ? {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          fontSrc: ["'self'", "data:", "https:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://*.googleapis.com",
            "https://*.gstatic.com"
          ],
          connectSrc: [
            "'self'",
            "https://*.googleapis.com",
            "https://*.firebaseio.com",
            "https://*.firebaseapp.com",
            "https://identitytoolkit.googleapis.com",
            "https://securetoken.googleapis.com",
            "https://firestore.googleapis.com",
            "https://www.googleapis.com"
          ],
          workerSrc: ["'self'", "blob:"],
          upgradeInsecureRequests: []
        }
      } : false,
      frameguard: { action: "deny" },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: { policy: "same-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: isProd ? { maxAge: 31536e3, includeSubDomains: true } : false
    })
  );
  app3.use(
    (0, import_cors.default)({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins().includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      maxAge: 86400
    })
  );
  app3.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    next();
  });
}

// src/server/commerceStore.ts
var plans = /* @__PURE__ */ new Map();
var metrics = [];
var funnel = [];
var corporateLeads = [];
var PUBLIC_PROOF_USER_ID = "public-proof";
function isoDate(offsetDays = 0) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
function seedDemoMetrics(userId = PUBLIC_PROOF_USER_ID) {
  if (userId !== PUBLIC_PROOF_USER_ID) return;
  if (metrics.some((m) => m.userId === PUBLIC_PROOF_USER_ID)) return;
  for (let i = 13; i >= 0; i--) {
    const t = i / 13;
    metrics.push({
      userId: PUBLIC_PROOF_USER_ID,
      moodScore: Math.round(2 + (1 - t) * 2.4),
      anxietyLevel: Math.round(8.4 - (1 - t) * 4.4),
      sleepQuality: Math.round(5.2 + (1 - t) * 3.4),
      sessionDate: isoDate(-i),
      language: "sw",
      source: "seed"
    });
  }
}
var PLAN_INTERVALS = ["monthly", "annual", "lifetime", "corporate"];
var MAX_METRICS = 5e3;
var MAX_FUNNEL = 2e3;
var MAX_LEADS = 500;
function isPlanInterval(value) {
  return typeof value === "string" && PLAN_INTERVALS.includes(value);
}
function unpaidCheckoutAllowed() {
  if (process.env.ALLOW_UNPAID_CHECKOUT === "1") return true;
  return process.env.NODE_ENV !== "production";
}
function getOrCreatePlan(userId) {
  const existing = plans.get(userId);
  if (existing) {
    if (existing.plan === "trial" && existing.trialEndsAt && new Date(existing.trialEndsAt) < /* @__PURE__ */ new Date()) {
      const converted = {
        ...existing,
        plan: "free",
        status: "canceled",
        autoRenew: false,
        trialEndsAt: existing.trialEndsAt,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      plans.set(userId, converted);
      trackFunnel(userId, "trial_expired", { from: "trial" });
      return converted;
    }
    return existing;
  }
  const created = {
    userId,
    plan: "free",
    status: "active",
    trialEndsAt: null,
    autoRenew: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  plans.set(userId, created);
  return created;
}
function startTrial(userId, interval = "monthly") {
  const safeInterval = isPlanInterval(interval) ? interval : "monthly";
  const now = /* @__PURE__ */ new Date();
  const trialEnds = new Date(now.getTime() + 7 * 864e5);
  const plan = {
    userId,
    plan: "trial",
    interval: safeInterval,
    status: "active",
    trialEndsAt: trialEnds.toISOString(),
    autoRenew: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  plans.set(userId, plan);
  trackFunnel(userId, "trial_start", { interval: safeInterval });
  return plan;
}
var CheckoutDisabledError = class extends Error {
  constructor(message = "Paid checkout is not enabled. Connect a payment provider or set ALLOW_UNPAID_CHECKOUT=1 for demos.") {
    super(message);
    this.code = "payment_required";
    this.name = "CheckoutDisabledError";
  }
};
function checkout(userId, interval) {
  if (!unpaidCheckoutAllowed()) {
    throw new CheckoutDisabledError();
  }
  if (!isPlanInterval(interval)) {
    throw new Error("invalid_interval");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const plan = {
    userId,
    plan: interval === "lifetime" ? "lifetime" : interval === "corporate" ? "corporate" : "premium",
    interval,
    status: "active",
    trialEndsAt: null,
    autoRenew: interval !== "lifetime",
    createdAt: plans.get(userId)?.createdAt || now,
    updatedAt: now
  };
  plans.set(userId, plan);
  trackFunnel(userId, "conversion", { interval, plan: plan.plan });
  return plan;
}
function recordMetric(row) {
  metrics.push({
    ...row,
    moodScore: Math.min(5, Math.max(1, Number(row.moodScore) || 1)),
    anxietyLevel: Math.min(10, Math.max(1, Number(row.anxietyLevel) || 1)),
    language: row.language ? String(row.language).slice(0, 16) : void 0,
    source: row.source ? String(row.source).slice(0, 40) : void 0,
    sessionDate: String(row.sessionDate || "").slice(0, 32)
  });
  if (metrics.length > MAX_METRICS) {
    metrics.splice(0, metrics.length - MAX_METRICS);
  }
  trackFunnel(row.userId, "metric_logged", { mood: row.moodScore, anxiety: row.anxietyLevel });
}
function listMetrics(userId) {
  return metrics.filter((m) => m.userId === userId).sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
}
function getPublicProof() {
  seedDemoMetrics(PUBLIC_PROOF_USER_ID);
  return impactSummary(PUBLIC_PROOF_USER_ID);
}
function impactSummary(userId) {
  const rows = listMetrics(userId);
  const last14 = rows.slice(-14);
  const first3 = last14.slice(0, 3);
  const last3 = last14.slice(-3);
  const avg = (xs, key) => xs.length ? xs.reduce((s, r) => s + r[key], 0) / xs.length : 0;
  const anxietyStart = avg(first3, "anxietyLevel");
  const anxietyNow = avg(last3, "anxietyLevel");
  const dropPct = anxietyStart > 0 ? Math.round((anxietyStart - anxietyNow) / anxietyStart * 100) : 0;
  const isPublicProof = userId === PUBLIC_PROOF_USER_ID;
  const dayCount = Math.min(14, last14.length);
  return {
    claim: isPublicProof ? "Self-reported check-ins in this demo sample trend toward lower anxiety over two weeks \u2014 not a clinical result." : "Self-reported check-ins \u2014 not a clinical result. Individual trends vary.",
    days: last14.length,
    anxietyStart: Number(anxietyStart.toFixed(1)),
    anxietyNow: Number(anxietyNow.toFixed(1)),
    dropPct,
    headline: isPublicProof ? dropPct > 0 ? `Anxiety check-ins dropped ${dropPct}% in ${dayCount} days.` : "Demo sample of 14-day sleep and anxiety logs." : dropPct > 0 ? `Your anxiety check-ins dropped ${dropPct}% in ${dayCount} days.` : "Keep logging mood so Astra can show your 14-day anxiety trend.",
    series: last14.map((r) => ({
      date: r.sessionDate,
      anxiety: r.anxietyLevel,
      mood: r.moodScore,
      sleep: r.sleepQuality ?? Math.round(10 - r.anxietyLevel * 0.6)
    }))
  };
}
function trackFunnel(userId, event, meta) {
  funnel.push({
    userId: String(userId).slice(0, 128),
    event: String(event).slice(0, 64),
    meta: sanitizeFunnelMeta(meta),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (funnel.length > MAX_FUNNEL) {
    funnel.splice(0, funnel.length - MAX_FUNNEL);
  }
}
function funnelSummary() {
  const counts = {};
  for (const e of funnel) counts[e.event] = (counts[e.event] || 0) + 1;
  const uniqueUsers = new Set(funnel.map((e) => e.userId)).size;
  const trials = funnel.filter((e) => e.event === "trial_start").length;
  const conversions = funnel.filter((e) => e.event === "conversion").length;
  return {
    uniqueUsers,
    trials,
    conversions,
    conversionRate: trials ? Number((conversions / trials * 100).toFixed(1)) : 0,
    events: counts,
    // Redact full userIds in admin feed — keep a short fingerprint only.
    recent: funnel.slice(-25).reverse().map((e) => ({
      event: e.event,
      createdAt: e.createdAt,
      userFingerprint: e.userId.slice(0, 8),
      meta: e.meta
    }))
  };
}
function addCorporateLead(lead) {
  const row = {
    company: String(lead.company || "").slice(0, 200),
    contactEmail: String(lead.contactEmail || "").slice(0, 200),
    seats: Math.min(1e4, Math.max(1, Number(lead.seats) || 25)),
    packageId: String(lead.packageId || "team").slice(0, 40),
    notes: lead.notes != null ? String(lead.notes).slice(0, 500) : void 0,
    sourceIp: lead.sourceIp != null ? String(lead.sourceIp).slice(0, 64) : void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  corporateLeads.push(row);
  if (corporateLeads.length > MAX_LEADS) {
    corporateLeads.splice(0, corporateLeads.length - MAX_LEADS);
  }
  return row;
}
function listCorporateLeads() {
  return corporateLeads;
}

// src/content/valueProps.ts
var VALUE_PROPS = {
  microSessions: "Aura Health helps professionals reduce stress in 5 minutes a day with AI-guided micro-sessions in natural language.",
  culturalRelevance: "Culturally relevant sessions designed to support sleep and focus. Early self-reported logs suggest many people feel a difference within a week \u2014 not a clinical guarantee.",
  realtimeMood: "Astra adapts to how you say you feel. Demo check-in samples show anxiety scores trending down over two weeks of daily logs \u2014 results are individual, not a medical claim.",
  heroSubtext: "Start your journey today \u2014 free trial available.",
  ctaHeadline: "Ready to reduce stress and improve focus?"
};
var SESSION_LANGUAGES = [
  { id: "en", label: "English", native: "English" },
  { id: "sw", label: "Swahili", native: "Kiswahili" },
  { id: "luo", label: "Luo", native: "Dholuo" },
  { id: "kik", label: "Kikuyu", native: "G\u0129k\u0169y\u0169" },
  { id: "yo", label: "Yoruba", native: "Yor\xF9b\xE1" },
  { id: "ha", label: "Hausa", native: "Hausa" }
];
function isSessionLanguageId(value) {
  return typeof value === "string" && SESSION_LANGUAGES.some((lang) => lang.id === value);
}
function resolveSessionLanguage(value) {
  if (isSessionLanguageId(value)) {
    return SESSION_LANGUAGES.find((lang) => lang.id === value) ?? SESSION_LANGUAGES[0];
  }
  if (typeof value === "string") {
    const needle = value.trim().toLowerCase();
    const match = SESSION_LANGUAGES.find(
      (lang) => lang.native.toLowerCase() === needle || lang.label.toLowerCase() === needle
    );
    if (match) return match;
  }
  return SESSION_LANGUAGES[0];
}
var SUBSCRIPTION_TIERS = [
  {
    id: "monthly",
    name: "Premium Monthly",
    priceUsd: 6.99,
    cadence: "month",
    highlight: "7-day free trial, then auto-renews"
  },
  {
    id: "annual",
    name: "Premium Annual",
    priceUsd: 59.99,
    cadence: "year",
    highlight: "Save ~28% vs monthly"
  },
  {
    id: "lifetime",
    name: "Lifetime",
    priceUsd: 149,
    cadence: "once",
    highlight: "One-time purchase, no renewal"
  }
];
var CORPORATE_PACKAGES = [
  { id: "team", name: "Team Wellness", seats: 25, priceUsd: 199, cadence: "month" },
  { id: "org", name: "Organization", seats: 100, priceUsd: 649, cadence: "month" },
  { id: "enterprise", name: "Enterprise Africa", seats: 500, priceUsd: 2400, cadence: "month" }
];
function moodAdaptiveSession(mood, languageId = "en") {
  const lang = SESSION_LANGUAGES.find((l) => l.id === languageId) ?? SESSION_LANGUAGES[0];
  const scripts = {
    sleepy: {
      title: "Sunset rest reset",
      script: `A 5-minute wind-down in ${lang.native}: slow breath, gratitude for the day, and a short body scan for sleep.`
    },
    focused: {
      title: "Market-day focus",
      script: `A 5-minute attention drill in ${lang.native}: one breath, one task, one intention \u2014 built for busy professionals.`
    },
    energetic: {
      title: "Sunrise energy",
      script: `A 5-minute activation in ${lang.native}: posture, breath, and a short affirmation before the workday.`
    },
    eager: {
      title: "Community lift",
      script: `A 5-minute encouragement in ${lang.native}: name one person you care for, then one next healthy step.`
    },
    joyful: {
      title: "Ubuntu pause",
      script: `A 5-minute joy practice in ${lang.native}: smile, breath, and a culturally grounded gratitude prompt.`
    }
  };
  const pick = scripts[mood] ?? scripts.joyful;
  return { ...pick, minutes: 5, language: lang.native };
}

// src/content/crisisSupport.ts
var CRISIS_RESOURCES = [
  { name: "Kenya emergency services", href: "tel:999", detail: "Call 999 or 112" },
  { name: "Kenya Red Cross", href: "tel:1199", detail: "Call 1199" },
  { name: "Befrienders Kenya", href: "tel:+254722178177", detail: "+254 722 178 177" },
  {
    name: "Find a local helpline",
    href: "https://www.iasp.info/suicidalthoughts/",
    detail: "IASP directory for your country"
  }
];
var CRISIS_REPLY = "I'm really glad you reached out. I'm Astra, an AI companion \u2014 not a clinician, and I can't help in an emergency. If you might hurt yourself or feel unsafe, please contact a helpline or emergency services now. You don't have to handle this alone.";
var CRISIS_PATTERN = /\b(suicid(?:e|al)?|kill(?:ing)? myself|want to die|end(?:ing)? my life|end it all|self[- ]harm|hurt myself|don'?t want to (?:live|be alive)|no reason to live|better off dead|kujiua|nataka kufa)\b/i;
function looksLikeCrisis(text) {
  return CRISIS_PATTERN.test(String(text || ""));
}

// src/content/healthBriefContent.ts
var HEALTH_BRIEF_ITEMS = [
  {
    id: "hydrate-hot",
    title: "Hydration on warm days",
    body: "Sip water steadily through the day \u2014 especially after walking, market runs, or shamba work. Aim for regular glasses rather than large gulps once.",
    category: "hydration"
  },
  {
    id: "sukuma-plate",
    title: "Balance your plate",
    body: "Pair staples like ugali or rice with sukuma wiki or managu and a protein. Estimated nutrition in Food Lens is for guidance, not medical advice.",
    category: "nutrition"
  },
  {
    id: "stairs-count",
    title: "Everyday movement counts",
    body: "Stairs, carrying water, and walking to work all add Movement Points in Shamba Fit. You do not need a gym for an active day.",
    category: "fitness"
  },
  {
    id: "uko-sawa",
    title: "Uko sawa? Check in once",
    body: "A quick Uko Sawa? check helps Astra suggest lighter mobility when sleep or energy is low \u2014 without diagnosing illness.",
    category: "recovery"
  },
  {
    id: "local-care",
    title: "Know your local care options",
    body: "For medical concerns, visit a licensed clinician or facility. Aura is a wellness companion, not a substitute for professional care.",
    category: "local"
  }
];

// src/server/firebaseAdmin.ts
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_firestore = require("firebase-admin/firestore");
var FALLBACK_PROJECT_ID = "aura-health-f478f";
function projectId() {
  return process.env.FIREBASE_PROJECT_ID || FALLBACK_PROJECT_ID;
}
function serviceAccountFromEnv() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id || projectId(),
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key
        };
      }
    } catch (err) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:", err);
    }
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (clientEmail && privateKey) {
    return { projectId: projectId(), clientEmail, privateKey };
  }
  return null;
}
var app;
var db;
function getAdminApp() {
  if (app !== void 0) return app;
  if ((0, import_app.getApps)().length) {
    app = (0, import_app.getApps)()[0];
    return app;
  }
  const sa = serviceAccountFromEnv();
  try {
    if (sa) {
      app = (0, import_app.initializeApp)({
        credential: (0, import_app.cert)({
          projectId: sa.projectId,
          clientEmail: sa.clientEmail,
          privateKey: sa.privateKey
        }),
        projectId: sa.projectId
      });
      return app;
    }
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      app = (0, import_app.initializeApp)({
        credential: (0, import_app.applicationDefault)(),
        projectId: projectId()
      });
      return app;
    }
  } catch (err) {
    console.warn("Firebase Admin failed to initialize:", err);
    app = null;
    return null;
  }
  console.warn(
    "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY). Cowries/streaks will not persist for signed-in users."
  );
  app = null;
  return null;
}
function getAdminDb() {
  if (db !== void 0) return db;
  const adminApp = getAdminApp();
  if (!adminApp) {
    db = null;
    return null;
  }
  db = (0, import_firestore.getFirestore)(adminApp);
  return db;
}
async function verifyIdTokenWithAdmin(idToken) {
  const adminApp = getAdminApp();
  if (!adminApp) return null;
  try {
    const decoded = await (0, import_auth.getAuth)(adminApp).verifyIdToken(idToken, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: Boolean(decoded.email_verified)
    };
  } catch {
    return null;
  }
}

// src/server/auth.ts
function firebaseWebApiKey() {
  const key = process.env.FIREBASE_WEB_API_KEY?.trim();
  if (key) return key;
  return "AIzaSyD7JptGcJbWRAt44G3GCGj0zTZ-UwpF0W0";
}
function splitList(raw) {
  return (raw || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
function getAdminAllowlist() {
  return splitList(process.env.ADMIN_EMAILS);
}
function bearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}
async function verifyViaIdentityToolkit(idToken) {
  const apiKey = firebaseWebApiKey();
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data.users?.[0];
    if (!user?.localId || user.disabled) return null;
    return {
      uid: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified)
    };
  } catch (err) {
    console.warn("Firebase token lookup failed");
    return null;
  }
}
async function verifyFirebaseIdToken(idToken) {
  const viaAdmin = await verifyIdTokenWithAdmin(idToken);
  if (viaAdmin) return viaAdmin;
  return verifyViaIdentityToolkit(idToken);
}
async function requireAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Sign in required" });
  }
  const user = await verifyFirebaseIdToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  req.user = user;
  next();
}
function requireEmailVerified(req, res, next) {
  if (!req.user?.emailVerified) {
    return res.status(403).json({
      error: "Verify your email to continue",
      code: "email_unverified"
    });
  }
  next();
}
function requireAdmin(req, res, next) {
  const allowlist = getAdminAllowlist();
  const email = req.user?.email?.trim().toLowerCase();
  if (!allowlist.length || !email || !allowlist.includes(email)) {
    return res.status(403).json({ error: "Admin only" });
  }
  if (!req.user?.emailVerified) {
    return res.status(403).json({ error: "Verified admin email required" });
  }
  next();
}
function requireSelf(paramName = "userId") {
  return (req, res, next) => {
    const requested = req.params[paramName];
    if (requested && requested !== req.user?.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
var rateBuckets = /* @__PURE__ */ new Map();
function rateLimit(opts) {
  return (req, res, next) => {
    const key = opts.key(req);
    const now = Date.now();
    let bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.reset) {
      bucket = { n: 0, reset: now + opts.windowMs };
      rateBuckets.set(key, bucket);
    }
    bucket.n += 1;
    if (rateBuckets.size > 8e3) {
      for (const [k, v] of rateBuckets) {
        if (now > v.reset) rateBuckets.delete(k);
      }
    }
    if (bucket.n > opts.max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.reset - now) / 1e3)));
      return res.status(429).json({ error: "Too many requests" });
    }
    next();
  };
}
function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}
function uidKey(prefix) {
  return (req) => `${prefix}:${req.user?.uid || clientIp(req)}`;
}
function ipKey(prefix) {
  return (req) => `${prefix}:${clientIp(req)}`;
}

// src/server/rewards.ts
var import_firestore2 = require("firebase-admin/firestore");

// src/server/rewardsCatalog.ts
var CHECKIN_REWARDS = {
  cowries: 80,
  cowriesWithMedication: 120,
  xpBase: 150,
  xpPerActivityMinute: 1.5,
  maxActivityMinutesForXp: 180
};
var MISSION_REWARDS = {
  m1: { xp: 50, cowries: 30 },
  m2: { xp: 50, cowries: 30 },
  m3: { xp: 120, cowries: 80 },
  m4: { xp: 50, cowries: 30 },
  grand_onboarding_completion: { xp: 150, cowries: 100 }
};
var HABIT_REWARDS = {
  water: { xp: 50, cowries: 30 },
  meds: { xp: 80, cowries: 50 },
  sleep: { xp: 60, cowries: 40 },
  movement: { xp: 70, cowries: 45 },
  /** Daily 90-day calisthenics workout (once per UTC day). */
  calisthenics: { xp: 90, cowries: 55 },
  /** Yoga / breathwork recovery flow (once per UTC day). */
  yoga: { xp: 70, cowries: 40 }
};
var QUICK_LOG_REWARDS = {
  hydration: { xp: 8, cowries: 5 },
  medication: { xp: 8, cowries: 5 },
  sleep: { xp: 8, cowries: 5 },
  mood: { xp: 8, cowries: 5 }
};
var WHEEL_MAX_SPINS_PER_DAY = 3;
var WHEEL_REWARDS = {
  "1": { label: "100 Cowries", type: "cowries", cowries: 100, xp: 0 },
  "2": { label: "250 XP", type: "xp", cowries: 0, xp: 250 },
  "3": { label: "Care Pass", type: "boost", cowries: 0, xp: 0 },
  "4": { label: "50 Cowries", type: "cowries", cowries: 50, xp: 0 },
  "5": { label: "Raffle Ticket", type: "avax_ticket", cowries: 0, xp: 0 },
  "6": { label: "Aether Aura", type: "cosmetic", cowries: 0, xp: 0 },
  "7": { label: "500 XP Surge", type: "xp", cowries: 0, xp: 500 },
  "8": { label: "Mystery Box", type: "cowries", cowries: 200, xp: 0 }
};
var BENEFIT_COSTS = {
  "b-1": { cowriesCost: 250, title: "$2.50 Clinic Medication Voucher" },
  "b-2": { cowriesCost: 250, title: "1.25 GB Mobile Health Data Top-Up" },
  "b-3": { cowriesCost: 200, title: "Clean Water Care Grant Token" },
  "b-4": { cowriesCost: 150, title: "7-Day Streak Insurance Shield" },
  "b-5": { cowriesCost: 400, title: "$10 Partner Gym Pass" }
};
function checkinPayout(medicationTaken, activityMinutes) {
  const mins = Math.max(
    0,
    Math.min(CHECKIN_REWARDS.maxActivityMinutesForXp, Math.floor(Number(activityMinutes) || 0))
  );
  return {
    cowries: medicationTaken ? CHECKIN_REWARDS.cowriesWithMedication : CHECKIN_REWARDS.cowries,
    xp: CHECKIN_REWARDS.xpBase + Math.floor(mins * CHECKIN_REWARDS.xpPerActivityMinute)
  };
}
function utcToday() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function utcDayDiff(fromYmd, toYmd) {
  const from = Date.parse(`${fromYmd}T00:00:00.000Z`);
  const to = Date.parse(`${toYmd}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.POSITIVE_INFINITY;
  return Math.round((to - from) / 864e5);
}
function nextStreak(lastCheckInDate, today, currentStreak) {
  if (!lastCheckInDate) return 1;
  const diff = utcDayDiff(lastCheckInDate, today);
  if (diff <= 0) return Math.max(1, currentStreak);
  if (diff === 1) return currentStreak + 1;
  return 1;
}

// src/server/rewards.ts
var RewardsError = class extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
};
function asNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function asStringList(value) {
  return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
}
function asStringMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}
function snapshot(row) {
  return {
    cowriesBalance: row.cowriesBalance,
    totalXp: row.totalXp,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastCheckInDate: row.lastCheckInDate,
    completedRewardKeys: row.completedRewardKeys
  };
}
function readLedger(uid, email, data) {
  return {
    uid,
    email: typeof data?.email === "string" ? data.email : email || "",
    displayName: typeof data?.displayName === "string" ? data.displayName : "",
    photoURL: typeof data?.photoURL === "string" ? data.photoURL : "",
    cowriesBalance: asNumber(data?.cowriesBalance),
    totalXp: asNumber(data?.totalXp),
    currentStreak: asNumber(data?.currentStreak),
    longestStreak: asNumber(data?.longestStreak),
    lastCheckInDate: typeof data?.lastCheckInDate === "string" ? data.lastCheckInDate : null,
    completedRewardKeys: asStringList(data?.completedRewardKeys),
    habitClaims: asStringMap(data?.habitClaims)
  };
}
async function withUserLedger(uid, email, mutate) {
  const db2 = getAdminDb();
  if (!db2) {
    throw new RewardsError(503, "ledger_unavailable", "Rewards ledger is not configured");
  }
  const ref = db2.collection("users").doc(uid);
  return db2.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const row = readLedger(uid, email, snap.exists ? snap.data() : void 0);
    const result = mutate(row);
    tx.set(
      ref,
      {
        uid: row.uid,
        email: row.email || email || "",
        cowriesBalance: row.cowriesBalance,
        totalXp: row.totalXp,
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        lastCheckInDate: row.lastCheckInDate,
        completedRewardKeys: row.completedRewardKeys,
        habitClaims: row.habitClaims,
        updatedAt: import_firestore2.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return result;
  });
}
async function applyCheckinRewards(uid, email, input) {
  const today = utcToday();
  const payout = checkinPayout(input.medicationTaken === true, input.activityMinutes);
  return withUserLedger(uid, email, (row) => {
    const alreadyToday = row.lastCheckInDate === today;
    const cowriesEarned = alreadyToday ? 0 : payout.cowries;
    const xpEarned = alreadyToday ? 0 : payout.xp;
    row.cowriesBalance += cowriesEarned;
    row.totalXp += xpEarned;
    row.currentStreak = nextStreak(row.lastCheckInDate, today, row.currentStreak);
    row.longestStreak = Math.max(row.longestStreak, row.currentStreak);
    row.lastCheckInDate = today;
    return {
      ...snapshot(row),
      cowriesEarned,
      xpEarned,
      awarded: !alreadyToday
    };
  });
}
async function applyGrant(uid, email, kind, id) {
  const catalogs = {
    mission: MISSION_REWARDS,
    habit: HABIT_REWARDS,
    quicklog: QUICK_LOG_REWARDS
  };
  const reward = catalogs[kind][id];
  if (!reward) {
    throw new RewardsError(400, "unknown_reward", "Unknown reward");
  }
  const today = utcToday();
  return withUserLedger(uid, email, (row) => {
    if (kind === "habit" || kind === "quicklog") {
      const claimKey = kind === "quicklog" ? `quick:${id}` : id;
      if (row.habitClaims[claimKey] === today) {
        throw new RewardsError(409, "already_claimed", "Already claimed today");
      }
      row.habitClaims[claimKey] = today;
    } else {
      const key = `mission:${id}`;
      if (row.completedRewardKeys.includes(key)) {
        throw new RewardsError(409, "already_claimed", "Already claimed");
      }
      if (row.completedRewardKeys.length >= 4e3) {
        throw new RewardsError(429, "ledger_full", "Reward history is full");
      }
      row.completedRewardKeys.push(key);
    }
    row.cowriesBalance += reward.cowries;
    row.totalXp += reward.xp;
    return {
      ...snapshot(row),
      cowriesEarned: reward.cowries,
      xpEarned: reward.xp
    };
  });
}
function pickWheelPrizeId() {
  const ids = Object.keys(WHEEL_REWARDS);
  return ids[Math.floor(Math.random() * ids.length)];
}
async function applyWheelSpin(uid, email) {
  const today = utcToday();
  const prefix = `wheel:${today}:`;
  return withUserLedger(uid, email, (row) => {
    const spinsToday = row.completedRewardKeys.filter((k) => k.startsWith(prefix)).length;
    if (spinsToday >= WHEEL_MAX_SPINS_PER_DAY) {
      throw new RewardsError(429, "spin_limit", "Daily spin limit reached");
    }
    if (row.completedRewardKeys.length >= 4e3) {
      throw new RewardsError(429, "ledger_full", "Reward history is full");
    }
    const prizeId = pickWheelPrizeId();
    const prize = WHEEL_REWARDS[prizeId];
    if (!prize) {
      throw new RewardsError(500, "wheel_empty", "Wheel catalog is empty");
    }
    row.completedRewardKeys.push(`${prefix}${spinsToday + 1}:${prizeId}`);
    row.cowriesBalance += prize.cowries;
    row.totalXp += prize.xp;
    return {
      ...snapshot(row),
      prizeId,
      label: prize.label,
      type: prize.type,
      cowriesEarned: prize.cowries,
      xpEarned: prize.xp,
      spinsRemaining: WHEEL_MAX_SPINS_PER_DAY - spinsToday - 1
    };
  });
}
async function applySpend(uid, email, benefitId) {
  const benefit = BENEFIT_COSTS[benefitId];
  if (!benefit) {
    throw new RewardsError(400, "unknown_benefit", "Unknown benefit");
  }
  return withUserLedger(uid, email, (row) => {
    const key = `benefit:${benefitId}`;
    if (row.completedRewardKeys.includes(key)) {
      throw new RewardsError(409, "already_claimed", "Already redeemed");
    }
    if (row.cowriesBalance < benefit.cowriesCost) {
      throw new RewardsError(400, "insufficient_cowries", "Insufficient Cowries");
    }
    if (row.completedRewardKeys.length >= 4e3) {
      throw new RewardsError(429, "ledger_full", "Reward history is full");
    }
    row.cowriesBalance -= benefit.cowriesCost;
    row.completedRewardKeys.push(key);
    return {
      ...snapshot(row),
      cowriesSpent: benefit.cowriesCost,
      title: benefit.title
    };
  });
}

// src/server/ai.ts
var import_genai = require("@google/genai");

// src/server/coachTurn.ts
var APP_CONTEXT_TERMS = /\b(streak|cowrie|cowries|xp|level|badge|companion|astra|wheel|sponsor|check-?in|cosmic|egg|hatchling|vitality|harmony|mission|quest|mfululizo|shamba|food lens|ugali|sukuma|uko sawa|movement points|recovery score|nutrition)\b/i;
var PRACTICE_REQUEST = /\b(start|guide me|walk me|lead me|let'?s (?:do|start)|5-minute|five[- ]minute|micro-?session|anza zoezi|adapt (?:a |my )?session|badilisha zoezi|breath(?:e|ing)? with me|gratitude practice)\b/i;
var FACTUAL_QUESTION = /\b(?:what(?:'s| is| are)|how (?:much|many|long)\b|why (?:is|does|do)\b|is it (?:safe|true|normal|ok)|side effects?|according to|who (?:says|recommends)|latest (?:research|study|guidelines?)|recommended (?:dose|amount|hours))\b/i;
var HEALTH_SCOPE = /\b(health|medical|medicin(?:e|al)?|clinic|doctor|hospital|physician|nurse|symptom|pains?|aches?|fever|cough|nausea|vomit|injur(?:y|ies|ed)?|wound|sleep|insomni|stress|anxi(?:ety|ous)?|depress(?:ion|ed)?|mood|mental|hydrat(?:e|ion)?|water|nutrition|diet|calorie|protein|carb(?:s|ohydrate)?s?|meal|food|eat(?:ing)?|ugali|sukuma|exercise|workout|fitness|train(?:ing)?|yoga|calisthen|breath|meditat|recover(?:y|ing)?|sore(?:ness)?|fatigue|tired|energy|mobility|stretch|wellness|session|reset|shamba|uko\s*sawa|food\s*lens|vitality|harmony|medication|pill|dose|dosing|tablet|supplement|vitamin|melatonin|ibuprofen|paracetamol|panadol|antibiotic|blood\s*pressure|diabetes|heart|stomach|headaches?|migraines?|dizz(?:y|iness)|back\s*pains?|period|pregnan|allerg(?:y|ies|ic)?|illness|sick|ill\b|cold\b|flu\b|infection|inflam|hydration|glasses of water|litres?|liters?|kichwa|maumivu|ninaumwa|umwa|homa|tumbo|maji|usingizi|kulala|msongo|wasiwasi|chakula|lishe|mazoezi|zoezi|afya|daktari|hospitali|dawa)\b/i;
var FEELING_SHARE = /\b(i (?:feel|am|'m|have)|i'm|im |feeling|nimechoka|ninaumwa|nina wasiwasi|sijalala|my (?:body|head|back|chest|stomach|sleep|mood|anxiety|stress|energy))\b/i;
var SESSION_CONTINUATION = /^(ok|okay|yes|yeah|yep|yup|done|next|ready|continue|go|sure|sawa|ndiyo|proceed|thanks|thank you|asante|got it|continue)[.!]?$/i;
var OFF_TOPIC_HEALTH_REPLY = "I only answer health and wellness questions \u2014 symptoms to discuss with a clinician, sleep, stress, nutrition, movement, recovery, and Aura Health habits. I'm not a doctor and I don't cover off-topic chat. What health topic can I help with?";
function isHealthScopedMessage(text) {
  const t = text.trim();
  if (!t) return false;
  if (SESSION_CONTINUATION.test(t)) return true;
  if (PRACTICE_REQUEST.test(t)) return true;
  if (HEALTH_SCOPE.test(t)) return true;
  if (APP_CONTEXT_TERMS.test(t)) return true;
  if (FEELING_SHARE.test(t)) return true;
  return false;
}
function shouldSearch(text) {
  const t = text.trim();
  if (t.length < 12) return false;
  if (!isHealthScopedMessage(t)) return false;
  if (APP_CONTEXT_TERMS.test(t) && !HEALTH_SCOPE.test(t)) return false;
  if (PRACTICE_REQUEST.test(t)) return false;
  return FACTUAL_QUESTION.test(t) && HEALTH_SCOPE.test(t);
}
function normalizeAnxiety(value) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(10, Math.max(1, Math.round(n)));
}
var SKIP_MODEL_TURN = /^(Hi, I'm Astra|Hello! I'm Astra|Habari, mimi ni Astra|Mosi, an Astra|Wĩ mwega, niĩ Astra|Ẹ n lẹ, èmi ni Astra|Sannu, ni Astra|Sign in|Confirm the link|Astra AI is not configured|Astra could not|Astra took too long|Something went wrong|Too many messages|Your session expired|Astra[’']s API)/i;
function toGeminiContents(history, userTurnText) {
  const turns = [];
  for (const item of (Array.isArray(history) ? history : []).slice(-16)) {
    const text = String(item?.text || "").trim().slice(0, 2e3);
    if (!text) continue;
    if (item.kind === "greeting" || item.kind === "error") continue;
    const role = item.sender === "user" ? "user" : "model";
    if (role === "model" && SKIP_MODEL_TURN.test(text)) continue;
    const last2 = turns[turns.length - 1];
    if (last2 && last2.role === role) {
      last2.text = `${last2.text}
${text}`.slice(0, 4e3);
    } else {
      turns.push({ role, text });
    }
  }
  while (turns[0]?.role === "model") turns.shift();
  const last = turns[turns.length - 1];
  if (last?.role === "user") {
    last.text = `${last.text}
${userTurnText}`.slice(0, 6e3);
  } else {
    turns.push({ role: "user", text: userTurnText });
  }
  return turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] }));
}
function formatSearchContext(userText, searchResults) {
  if (!searchResults.length) return userText;
  const block = searchResults.map((hit, i) => `${i + 1}. ${hit.title} (${hit.url})
${hit.content}`).join("\n\n");
  return `${userText}

[Live web search results for reference \u2014 use if relevant, ignore for casual chit-chat]
${block}`;
}
function buildCoachInstruction(input) {
  const stage = input.companionState?.stage || "Hatchling";
  const level = input.companionState?.level || 1;
  const streak = input.companionState?.streakDays ?? 0;
  const mood = input.companionState?.mood || "joyful";
  const anxiety = normalizeAnxiety(input.latestAnxiety);
  const anxietyLine = anxiety == null ? "No anxiety check-in yet \u2014 do not invent a number. You may ask once how they feel today." : `Last self-reported anxiety check-in: ${anxiety}/10.`;
  const sessionTitle = input.sessionTitle || "Ubuntu pause";
  const sessionScript = input.sessionScript || `A 5-minute joy practice in ${input.languageName}: smile, breath, and a short gratitude prompt.`;
  const searchNote = input.hasSearch ? `Live web snippets are attached to the latest user turn. Use them only for factual health questions inside scope. If they are off-topic, ignore them. Never paste URLs as a dump \u2014 mention one useful takeaway.` : "You do not have live web results for this turn. Do not invent studies, statistics, or news.";
  const lifestyleBlock = input.lifestyleContext?.trim() ? `Lifestyle data the user logged in-app (Shamba Fit / Kenyan Food Lens / Uko Sawa) \u2014 use when they ask what to do for health today, whether they are active enough, what they ate, or recovery advice. Treat calories and recovery as estimates, never medical fact:
${input.lifestyleContext.trim()}` : "No lifestyle logs were attached for this turn. Do not invent Shamba Fit minutes, meals, or recovery scores.";
  return `You are Astra, the AI health companion inside Aura Health, a Kenya-first wellness app.

Hard scope \u2014 medical and wellness only
- ONLY discuss health and wellness: symptoms (with clinician referral), sleep, stress, anxiety, mood, hydration, nutrition, movement/exercise, recovery, injury prevention, when to seek care, and Aura Health habits that support wellbeing (check-ins, Train, Shamba Fit, Food Lens, Uko Sawa, streaks).
- If the user asks anything outside that scope (coding, politics, sports scores, homework, general trivia, unrelated jokes, shopping, etc.), refuse briefly and redirect to a health topic. Do not answer the off-topic request even partially.
- You are an AI wellness guide, never a doctor. No diagnosis, dosing, or prescriptions. For serious or urgent symptoms, say so plainly and point to a licensed clinician or emergency services.

Voice
- Warm, specific, culturally grounded in East African work/life (commute, family, long days, market walks, household work). No stereotypes, no slang you cannot use naturally.
- Chat replies: 2\u20134 short sentences, one question max.

App context you may mention when asked (never invent the user's balances)
- Daily check-in, Cowries (points), XP and companion levels, streaks, loot wheel, Train (yoga/calisthenics).
- MOVE: Shamba Fit (everyday activity). EAT: Kenyan Food Lens. RECOVER: Uko Sawa?
- Companion: Stage ${stage}, Level ${level}, Streak ${streak} days, Mood ${mood}.
- ${anxietyLine}
- Mood-matched 5-minute theme: "${sessionTitle}" \u2014 ${sessionScript}
- ${lifestyleBlock}

Language
- Reply in ${input.languageName} only. Crisis/safety wording stays in clear English.

Micro-sessions (stress, sleep, anxiety, or "start a reset")
- Run a 5-minute practice as 3\u20134 steps of about 30\u201360 seconds each.
- Give ONLY the next step now, then wait for them to say done/ok/next.
- Start step 1 immediately. Do not ask permission again.
- After the last step, close with one tiny habit they can keep today.

${searchNote}

Crisis
- If they may be at risk of harming themselves, drop character. You are not a clinician. Urge emergency services or a helpline now: Kenya 999 / 112, Kenya Red Cross 1199, Befrienders Kenya +254 722 178 177, https://www.iasp.info/suicidalthoughts/. Do not discuss methods.

Memory
- Use earlier turns in this chat. Do not repeat the greeting or restart the session unless they ask.`;
}

// src/server/ai.ts
var DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
function geminiModel() {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  return fromEnv || DEFAULT_GEMINI_MODEL;
}
function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
function hasTavilyKey() {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new import_genai.GoogleGenAI({ apiKey });
}
function aiHealthStatus() {
  return {
    configured: hasGeminiKey(),
    model: geminiModel(),
    searchConfigured: hasTavilyKey()
  };
}
async function tavilySearch(query) {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query, max_results: 4, search_depth: "basic" })
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r) => ({
      title: r.title || r.url || "Source",
      url: r.url || "",
      content: String(r.content || "").slice(0, 600)
    }));
  } catch (err) {
    console.warn("Tavily search failed:", err instanceof Error ? err.message : "unknown");
    return [];
  }
}
var CHECKIN_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    score: {
      type: "INTEGER",
      description: "Completeness and adherence sincerity score from 60 to 100."
    },
    feedback: {
      type: "STRING",
      description: "Warm, encouraging 2-3 sentence feedback for the user and Astra."
    },
    riskFlags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Short wellness watch-outs such as Low hydration, or empty if none."
    }
  },
  required: ["score", "feedback", "riskFlags"],
  propertyOrdering: ["score", "feedback", "riskFlags"]
};
function parseCheckinAttestation(raw, fallback) {
  if (!raw) return fallback;
  try {
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    const rawScore = Number(parsed.score);
    const flags = Array.isArray(parsed.riskFlags) ? parsed.riskFlags.filter((flag) => typeof flag === "string" && flag.trim().length > 0).map((flag) => flag.trim().slice(0, 80)).slice(0, 6) : [];
    return {
      score: Number.isFinite(rawScore) ? Math.min(100, Math.max(60, Math.round(rawScore))) : fallback.score,
      feedback: String(parsed.feedback || fallback.feedback).slice(0, 500),
      riskFlags: flags
    };
  } catch {
    return fallback;
  }
}
var ALLOWED_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);
function parseCheckinImage(imageBase64) {
  if (typeof imageBase64 !== "string" || !imageBase64) return null;
  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const mimeType = match ? match[1].toLowerCase().replace("image/jpg", "image/jpeg") : "image/jpeg";
  const data = match ? match[2] : imageBase64.replace(/^data:image\/\w+;base64,/, "");
  if (!ALLOWED_IMAGE_TYPES.has(mimeType) || !data) return null;
  if (data.length > 75e4) return { tooLarge: true };
  return { mimeType, data };
}
function buildCheckinPrompt(input) {
  return `You are an AI Health Adherence Verifier for the AuraHealth Wellness App.
Evaluate this user's health report:
- Hydration: ${input.hydrationLiters ?? "n/a"} litres
- Sleep: ${Number.isFinite(input.sleep) ? input.sleep : "n/a"} hours
- Medication Taken: ${input.medicationTaken ? "YES" : "NO"}
- Mood Rating: ${Number.isFinite(input.mood) ? input.mood : "n/a"}/5
- Activity: ${Number.isFinite(input.activity) ? input.activity : "n/a"} minutes
- User Notes: "${input.notes || "No notes provided"}"

Score completeness, health consistency, and adherence sincerity. Do not diagnose or prescribe.`;
}
function heuristicCheckin(medicationTaken, sleep) {
  let score = 92;
  if (medicationTaken) score += 5;
  if (sleep >= 7) score += 3;
  return {
    score: Math.min(100, score),
    feedback: "Daily health log recorded cleanly. Consistency verified!",
    riskFlags: []
  };
}
var CoachGenerateError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "CoachGenerateError";
  }
};
async function generateCoachReply(input) {
  const userText = String(input.userMessage || "").trim().slice(0, 4e3);
  if (!userText) {
    throw new CoachGenerateError("empty_message", "Message required");
  }
  if (!isHealthScopedMessage(userText)) {
    return { reply: OFF_TOPIC_HEALTH_REPLY, sources: [], searched: false };
  }
  const language = resolveSessionLanguage(input.language);
  const mood = input.companionState?.mood || "joyful";
  const session = moodAdaptiveSession(mood, language.id);
  const searchFn = input.search || tavilySearch;
  const searchResults = shouldSearch(userText) ? await searchFn(userText) : [];
  const instruction = buildCoachInstruction({
    companionState: input.companionState,
    latestAnxiety: input.latestAnxiety,
    languageName: language.native,
    languageId: language.id,
    hasSearch: searchResults.length > 0,
    sessionTitle: session.title,
    sessionScript: session.script,
    lifestyleContext: typeof input.lifestyleContext === "string" ? input.lifestyleContext.slice(0, 2e3) : void 0
  });
  const contents = toGeminiContents(input.history, formatSearchContext(userText, searchResults));
  const ai = getGeminiAI();
  const response = await ai.models.generateContent({
    model: geminiModel(),
    contents,
    config: {
      systemInstruction: instruction,
      temperature: 0.65,
      maxOutputTokens: 640
    }
  });
  const reply = String(response.text || "").trim();
  if (!reply) {
    throw new CoachGenerateError("empty_reply", "Astra returned an empty reply");
  }
  return { reply, sources: searchResults, searched: searchResults.length > 0 };
}

// src/server/createApp.ts
function createApiApp() {
  const app3 = (0, import_express.default)();
  app3.set("trust proxy", 1);
  applySecurityMiddleware(app3);
  const jsonDefault = import_express.default.json({ limit: "32kb" });
  const jsonCheckin = import_express.default.json({ limit: "1mb" });
  app3.use((req, res, next) => {
    if (req.path === "/api/verify-checkin") return jsonCheckin(req, res, next);
    return jsonDefault(req, res, next);
  });
  const geminiUserLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 30, key: uidKey("gemini") });
  const geminiIpLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 60, key: ipKey("gemini") });
  const geminiGlobalLimit = rateLimit({
    windowMs: 60 * 60 * 1e3,
    max: 300,
    key: () => "gemini:global"
  });
  const geminiLimit = [geminiUserLimit, geminiIpLimit, geminiGlobalLimit];
  const checkinLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 20, key: uidKey("checkin") });
  const leadLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 8, key: ipKey("lead") });
  const funnelLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 60, key: uidKey("funnel") });
  const adminLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 30, key: uidKey("admin") });
  const rewardsLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 40, key: uidKey("rewards") });
  const checkoutLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 10, key: uidKey("checkout") });
  const metricsLimit = rateLimit({ windowMs: 60 * 60 * 1e3, max: 60, key: uidKey("metrics") });
  const sendRewardsError = (res, err) => {
    if (err instanceof RewardsError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.warn("Rewards ledger error:", err);
    return res.status(500).json({ error: "Rewards ledger failed", code: "ledger_error" });
  };
  app3.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      network: "AuraHealth Verification Engine",
      ai: aiHealthStatus()
    });
  });
  seedDemoMetrics(PUBLIC_PROOF_USER_ID);
  app3.post("/api/verify-checkin", requireAuth, requireEmailVerified, checkinLimit, ...geminiLimit, async (req, res) => {
    try {
      const {
        waterLiters,
        waterOz,
        sleepHours,
        medicationTaken,
        moodRating,
        activityMinutes,
        notes,
        imageBase64
      } = req.body || {};
      const hydrationLiters = typeof waterLiters === "number" ? waterLiters : typeof waterOz === "number" ? Number((waterOz / 33.814).toFixed(2)) : void 0;
      const sleep = typeof sleepHours === "number" ? sleepHours : Number(sleepHours);
      const mood = typeof moodRating === "number" ? moodRating : Number(moodRating);
      const activity = typeof activityMinutes === "number" ? activityMinutes : Number(activityMinutes);
      const safeNotes = String(notes || "").slice(0, 500);
      const image = parseCheckinImage(imageBase64);
      if (image && "tooLarge" in image) {
        return res.status(413).json({ success: false, error: "Photo too large" });
      }
      const photo = image && !("tooLarge" in image) ? image : null;
      let attestation = heuristicCheckin(medicationTaken === true, sleep);
      if (hasGeminiKey()) {
        try {
          const ai = getGeminiAI();
          const parts = [
            {
              text: buildCheckinPrompt({
                hydrationLiters,
                sleep,
                medicationTaken: medicationTaken === true,
                mood,
                activity,
                notes: safeNotes
              })
            }
          ];
          if (photo) parts.push({ inlineData: photo });
          const response = await ai.models.generateContent({
            model: geminiModel(),
            contents: [{ role: "user", parts }],
            config: {
              responseMimeType: "application/json",
              responseSchema: CHECKIN_RESPONSE_SCHEMA
            }
          });
          attestation = parseCheckinAttestation(response.text, attestation);
        } catch (err) {
          console.warn("Gemini AI Verification fallback used:", err instanceof Error ? err.message : "unknown");
          attestation = heuristicCheckin(medicationTaken === true, sleep);
        }
      }
      res.json({
        success: true,
        aiAttestationScore: attestation.score,
        aiFeedback: attestation.feedback,
        riskFlags: attestation.riskFlags,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
      res.status(500).json({ success: false, error: "Verification failed" });
    }
  });
  app3.post("/api/rewards/checkin", requireAuth, requireEmailVerified, rewardsLimit, async (req, res) => {
    try {
      const body = req.body || {};
      const result = await applyCheckinRewards(req.user.uid, req.user.email, {
        medicationTaken: body.medicationTaken === true,
        activityMinutes: Number(body.activityMinutes)
      });
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });
  app3.post("/api/rewards/grant", requireAuth, requireEmailVerified, rewardsLimit, async (req, res) => {
    try {
      const { kind, id } = req.body || {};
      if (kind !== "mission" && kind !== "habit" && kind !== "quicklog") {
        return res.status(400).json({ error: "kind must be mission, habit, or quicklog", code: "invalid_kind" });
      }
      if (typeof id !== "string" || !id || id.length > 64) {
        return res.status(400).json({ error: "id required", code: "invalid_id" });
      }
      const result = await applyGrant(req.user.uid, req.user.email, kind, id);
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });
  app3.post("/api/rewards/spin", requireAuth, requireEmailVerified, rewardsLimit, async (req, res) => {
    try {
      const result = await applyWheelSpin(req.user.uid, req.user.email);
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });
  app3.post("/api/rewards/spend", requireAuth, requireEmailVerified, rewardsLimit, async (req, res) => {
    try {
      const benefitId = String(req.body?.benefitId || "");
      if (!benefitId || benefitId.length > 64) {
        return res.status(400).json({ error: "benefitId required", code: "invalid_id" });
      }
      const result = await applySpend(req.user.uid, req.user.email, benefitId);
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });
  app3.get("/api/plans", (_req, res) => {
    res.json({
      valueProps: VALUE_PROPS,
      tiers: SUBSCRIPTION_TIERS,
      corporate: CORPORATE_PACKAGES
    });
  });
  app3.get("/api/subscriptions/me", requireAuth, (req, res) => {
    res.json({ plan: getOrCreatePlan(req.user.uid) });
  });
  app3.get("/api/subscriptions/:userId", requireAuth, requireSelf("userId"), (req, res) => {
    res.json({ plan: getOrCreatePlan(req.user.uid) });
  });
  app3.post("/api/subscriptions/trial", requireAuth, requireEmailVerified, checkoutLimit, (req, res) => {
    const { interval } = req.body || {};
    const safe = isPlanInterval(interval) ? interval : "monthly";
    res.json({ plan: startTrial(req.user.uid, safe) });
  });
  app3.post("/api/subscriptions/checkout", requireAuth, requireEmailVerified, checkoutLimit, (req, res) => {
    const { interval } = req.body || {};
    if (!isPlanInterval(interval)) return res.status(400).json({ error: "interval required" });
    try {
      res.json({ plan: checkout(req.user.uid, interval) });
    } catch (err) {
      if (err instanceof CheckoutDisabledError) {
        return res.status(402).json({ error: err.message, code: err.code });
      }
      return res.status(400).json({ error: "Checkout failed" });
    }
  });
  app3.post("/api/metrics", requireAuth, metricsLimit, (req, res) => {
    const { moodScore, anxietyLevel, sessionDate, language, source } = req.body || {};
    if (moodScore == null || anxietyLevel == null) {
      return res.status(400).json({ error: "moodScore and anxietyLevel required" });
    }
    recordMetric({
      userId: req.user.uid,
      moodScore: Number(moodScore),
      anxietyLevel: Number(anxietyLevel),
      sessionDate: sessionDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      language,
      source
    });
    res.json({ ok: true });
  });
  app3.get("/api/metrics/proof", (_req, res) => {
    res.json(getPublicProof());
  });
  app3.get("/api/metrics/me/impact", requireAuth, (req, res) => {
    res.json(impactSummary(req.user.uid));
  });
  app3.get("/api/metrics/:userId/impact", requireAuth, requireSelf("userId"), (req, res) => {
    res.json(impactSummary(req.user.uid));
  });
  app3.get("/api/metrics/me", requireAuth, (req, res) => {
    res.json({ metrics: listMetrics(req.user.uid) });
  });
  app3.get("/api/metrics/:userId", requireAuth, requireSelf("userId"), (req, res) => {
    res.json({ metrics: listMetrics(req.user.uid) });
  });
  app3.post("/api/funnel/event", requireAuth, funnelLimit, (req, res) => {
    const { event, meta } = req.body || {};
    if (!event) return res.status(400).json({ error: "event required" });
    trackFunnel(req.user.uid, String(event), meta);
    res.json({ ok: true });
  });
  app3.get("/api/admin/session", requireAuth, adminLimit, requireAdmin, (req, res) => {
    res.json({ ok: true, email: req.user.email });
  });
  app3.get("/api/funnel/summary", requireAuth, adminLimit, requireAdmin, (_req, res) => {
    res.json(funnelSummary());
  });
  const saveCorporateLead = (req, res) => {
    const { company, contactEmail, seats, packageId, notes } = req.body || {};
    if (!company || !contactEmail) {
      return res.status(400).json({ error: "company and contactEmail required" });
    }
    addCorporateLead({
      company: String(company).slice(0, 200),
      contactEmail: String(contactEmail).slice(0, 200),
      seats: Number(seats) || 25,
      packageId: String(packageId || "team").slice(0, 40),
      notes: notes != null ? String(notes).slice(0, 500) : void 0,
      sourceIp: clientIp(req)
    });
    res.json({ ok: true });
  };
  app3.post("/api/corporate", leadLimit, saveCorporateLead);
  app3.post("/api/corporate/packages", leadLimit, saveCorporateLead);
  app3.get("/api/corporate/leads", requireAuth, adminLimit, requireAdmin, (_req, res) => {
    res.json({ leads: listCorporateLeads() });
  });
  app3.get("/api/corporate", (_req, res) => {
    res.json({ packages: CORPORATE_PACKAGES });
  });
  app3.get("/api/corporate/packages", (_req, res) => {
    res.json({ packages: CORPORATE_PACKAGES });
  });
  app3.get("/api/health-brief", (_req, res) => {
    res.json({ items: HEALTH_BRIEF_ITEMS, source: "aura-curated" });
  });
  app3.post("/api/ai-coach", requireAuth, ...geminiLimit, async (req, res) => {
    try {
      const { userMessage, companionState, history, language, latestAnxiety, lifestyleContext } = req.body || {};
      const userText = String(userMessage || "").trim().slice(0, 4e3);
      if (!userText) {
        return res.status(400).json({ error: "Message required", code: "empty_message" });
      }
      if (looksLikeCrisis(userText)) {
        return res.json({
          reply: CRISIS_REPLY,
          crisis: true,
          resources: CRISIS_RESOURCES,
          sources: []
        });
      }
      if (!req.user?.emailVerified) {
        return res.status(403).json({
          error: "Verify your email to continue",
          code: "email_unverified"
        });
      }
      if (!hasGeminiKey()) {
        return res.status(503).json({
          error: "Astra AI is not configured on this server yet.",
          code: "ai_unconfigured"
        });
      }
      const result = await generateCoachReply({
        userMessage: userText,
        history: Array.isArray(history) ? history : [],
        companionState,
        language,
        latestAnxiety,
        lifestyleContext: typeof lifestyleContext === "string" ? lifestyleContext.slice(0, 2e3) : void 0
      });
      res.json({
        reply: result.reply,
        sources: result.sources.filter((r) => isSafeHttpUrl(r.url)).map((r) => ({ title: String(r.title || "").slice(0, 200), uri: r.url }))
      });
    } catch (err) {
      if (err instanceof CoachGenerateError && err.code === "empty_message") {
        return res.status(400).json({ error: err.message, code: err.code });
      }
      const detail = err instanceof Error ? err.message : "unknown";
      console.warn("AI coach error:", detail);
      const overloaded = /503|unavailable|high demand|resource.?exhausted|overloaded|quota/i.test(detail);
      res.status(503).json({
        error: overloaded ? "Astra\u2019s AI provider is busy right now. Please try again in a moment." : "Astra could not reach the AI service just then. Please try again.",
        code: overloaded ? "ai_overloaded" : "ai_unavailable"
      });
    }
  });
  app3.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found", code: "not_found" });
  });
  return app3;
}

// src/server/vercelHandler.ts
try {
  import_dotenv.default.config({ path: import_node_path.default.join(process.cwd(), "src", ".env") });
  import_dotenv.default.config();
} catch (err) {
  console.warn("[api] dotenv load skipped:", err);
}
var app2 = null;
var initError = null;
try {
  app2 = createApiApp();
} catch (err) {
  initError = err instanceof Error ? err.stack || err.message : String(err);
  console.error("[api] createApiApp failed:", initError);
}
function sendInitError(res) {
  if (res.headersSent) return;
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: "API function failed to start",
      code: "api_init_failed",
      detail: (initError || "createApiApp returned null").slice(0, 800)
    })
  );
}
async function handler(req, res) {
  if (!app2) {
    sendInitError(res);
    return;
  }
  const url = req.url || "/";
  if (!url.startsWith("/api")) {
    const suffix = url.startsWith("/") ? url : `/${url}`;
    req.url = suffix === "/" ? "/api" : `/api${suffix}`;
  }
  await new Promise((resolve, reject) => {
    const onDone = () => {
      res.off("finish", onDone);
      res.off("close", onDone);
      resolve();
    };
    res.on("finish", onDone);
    res.on("close", onDone);
    try {
      app2(req, res);
    } catch (err) {
      res.off("finish", onDone);
      res.off("close", onDone);
      reject(err);
    }
  });
}
module.exports = module.exports.default;
