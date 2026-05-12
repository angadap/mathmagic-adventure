// api/db.js — Vercel Serverless Function
// All DB operations server-side only. JWT verified before every write.

import { notifyNewUser } from "./notify.js";

// ── ENV (all from Vercel environment variables — never in client code) ──
const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const SB_ANON    = process.env.SUPABASE_ANON_KEY;

// ── ALLOWED ORIGINS ────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://mathmagic-virid.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ── SECURITY HEADERS (applied to every response) ──────────────────
function setSecurityHeaders(res, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
}

// ── INPUT VALIDATION ───────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID  = (s) => typeof s === "string" && UUID_RE.test(s);
const sanitizeStr  = (s, max = 200) => typeof s === "string" ? s.replace(/[<>]/g, "").slice(0, max).trim() : "";
const sanitizeInt  = (n, min, max) => { const i = parseInt(n); return isNaN(i) ? min : Math.min(Math.max(i, min), max); };

// ── RATE LIMITER (in-memory — resets on cold start, sufficient for MVP) ──
const rateLimitMap = new Map();
function rateLimit(ip, action, maxReq, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const e = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > e.resetAt) { e.count = 0; e.resetAt = now + windowMs; }
  e.count++;
  rateLimitMap.set(key, e);
  if (e.count > maxReq) return { limited: true, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  return { limited: false };
}

const LIMITS = {
  add_child:       { max: 5,   windowMs: 60 * 60 * 1000 },
  save_progress:   { max: 200, windowMs: 60 * 60 * 1000 },
  submit_feedback: { max: 10,  windowMs: 60 * 60 * 1000 },
  save_rating:     { max: 3,   windowMs: 24 * 60 * 60 * 1000 },
  delete_account:  { max: 2,   windowMs: 24 * 60 * 60 * 1000 },
  reset_password:  { max: 3,   windowMs: 60 * 60 * 1000 },
  default:         { max: 60,  windowMs: 60 * 1000 },
};

// ── JWT VERIFICATION ───────────────────────────────────────────────
async function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_SERVICE, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ── SUPABASE REST HELPER ───────────────────────────────────────────
async function sbQuery(table, method, body, params = "", useAnon = false) {
  const key = useAnon ? SB_ANON : SB_SERVICE;
  const res = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(txt) }; }
  catch { return { ok: res.ok, status: res.status, data: txt }; }
}

// ── OWNERSHIP CHECK ────────────────────────────────────────────────
async function childBelongsToUser(childId, userId) {
  if (!isValidUUID(childId) || !isValidUUID(userId)) return false;
  const r = await sbQuery("children", "GET", null,
    `?id=eq.${encodeURIComponent(childId)}&parent_id=eq.${encodeURIComponent(userId)}&select=id`);
  return Array.isArray(r.data) && r.data.length > 0;
}

// ── MAIN HANDLER ──────────────────────────────────────────────────
export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setSecurityHeaders(res, origin);

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Block unknown origins in production
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !origin.includes("localhost")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });

  const limit = LIMITS[action] || LIMITS.default;
  const { limited, retryAfter } = rateLimit(ip, action, limit.max, limit.windowMs);
  if (limited) return res.status(429).json({ error: `Rate limit exceeded. Wait ${retryAfter}s.`, retryAfter });

  const token = req.headers.authorization?.replace("Bearer ", "").trim();

  try {
    // ── PUBLIC READS (no auth) ─────────────────────────────────
    if (action === "get_questions") {
      const lesson_id = sanitizeStr(req.body.lesson_id, 20);
      if (!lesson_id) return res.status(400).json({ error: "lesson_id required" });
      const r = await sbQuery("questions", "GET", null,
        `?lesson_id=eq.${encodeURIComponent(lesson_id)}&order=question_index&limit=20`);
      return res.status(200).json({ data: r.data });
    }

    if (action === "get_daily_challenge") {
      const class_num = sanitizeInt(req.body.class_num, 1, 5);
      const seq_num   = req.body.seq_num ? sanitizeInt(req.body.seq_num, 1, 250) : null;
      const params = seq_num
        ? `?class_num=eq.${class_num}&seq_num=eq.${seq_num}&is_pool=eq.true&limit=1`
        : `?class_num=eq.${class_num}&is_pool=eq.true&order=seq_num&limit=250`;
      const r = await sbQuery("daily_challenges", "GET", null, params);
      const data = Array.isArray(r.data) ? r.data : [];
      return res.status(200).json({ data: seq_num ? (data[0] || null) : data });
    }

    if (action === "get_daily_puzzle") {
      const today = new Date().toISOString().slice(0, 10);
      const r = await sbQuery("daily_puzzles", "GET", null, `?date=eq.${today}&limit=1`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data[0] : null });
    }

    // ── AUTHENTICATED ──────────────────────────────────────────
    const user = await verifyToken(token);
    if (!user?.id) return res.status(401).json({ error: "Unauthorized — please log in" });

    if (action === "get_children") {
      if (!isValidUUID(req.body.parent_id) || req.body.parent_id !== user.id)
        return res.status(403).json({ error: "Forbidden" });
      const r = await sbQuery("children", "GET", null,
        `?parent_id=eq.${encodeURIComponent(user.id)}&order=created_at`);
      return res.status(200).json({ data: r.data });
    }

    if (action === "add_child") {
      const name     = sanitizeStr(req.body.name, 50);
      const avatar   = sanitizeStr(req.body.avatar, 10);
      const pin_hash = sanitizeStr(req.body.pin_hash, 100);
      const class_num = sanitizeInt(req.body.class_num, 1, 5);
      if (!name || !pin_hash) return res.status(400).json({ error: "Missing fields" });

      const r = await sbQuery("children", "POST", {
        parent_id: user.id, name, avatar, class_num, pin_hash,
        xp: 0, level: 1, coins: 50, streak_days: 0, is_premium: false,
        created_at: new Date().toISOString(),
      });
      if (!r.ok) return res.status(400).json({ error: "Failed to create child" });
      const child = Array.isArray(r.data) ? r.data[0] : r.data;

      // Telegram notification (fire-and-forget)
      notifyNewUser({ name, classNum: class_num, avatar, email: user.email }).catch(() => {});

      return res.status(200).json({ data: child });
    }

    if (action === "save_progress") {
      const { child_id, lesson_id, correct_count, total_questions, stars_earned, xp_earned } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });

      const lid   = sanitizeStr(lesson_id, 30);
      const xp    = sanitizeInt(xp_earned, 0, 1000);
      const stars = sanitizeInt(stars_earned, 0, 3);

      await sbQuery("progress", "POST", {
        child_id, lesson_id: lid,
        correct_count: sanitizeInt(correct_count, 0, 100),
        total_questions: sanitizeInt(total_questions, 0, 100),
        stars_earned: stars, xp_earned: xp,
        completed_at: new Date().toISOString(),
      }, "?on_conflict=child_id,lesson_id");

      // Fetch current child to update XP
      const cur = await sbQuery("children", "GET", null, `?id=eq.${encodeURIComponent(child_id)}&select=xp,coins`);
      const c = Array.isArray(cur.data) ? cur.data[0] : {};
      const nx = Math.min((c.xp || 0) + xp, 999999);
      const nc = Math.min((c.coins || 0) + Math.floor(xp / 10), 999999);
      await sbQuery("children", "PATCH",
        { xp: nx, coins: nc, level: Math.floor(nx / 200) + 1, last_active: new Date().toISOString() },
        `?id=eq.${encodeURIComponent(child_id)}`);
      return res.status(200).json({ ok: true, xp: nx, coins: nc });
    }

    if (action === "get_daily_completion") {
      const { child_id, date } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      const r = await sbQuery("daily_completions", "GET", null,
        `?child_id=eq.${encodeURIComponent(child_id)}&date=eq.${sanitizeStr(date, 10)}&limit=1`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    if (action === "complete_daily_challenge") {
      const { child_id, challenge_id, date, correct } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      await sbQuery("daily_completions", "POST", {
        child_id,
        challenge_id: challenge_id || null,
        date: sanitizeStr(date, 10) || new Date().toISOString().slice(0, 10),
        correct: !!correct,
        completed_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "complete_puzzle") {
      const { child_id, puzzle_id, date, answer_given, correct } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      await sbQuery("puzzle_completions", "POST", {
        child_id, puzzle_id: puzzle_id || null,
        date: sanitizeStr(date, 10) || new Date().toISOString().slice(0, 10),
        answer_given: sanitizeStr(answer_given, 200),
        correct: !!correct,
        completed_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "get_puzzle_completion") {
      const { child_id, date } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      const r = await sbQuery("puzzle_completions", "GET", null,
        `?child_id=eq.${encodeURIComponent(child_id)}&date=eq.${sanitizeStr(date, 10)}&limit=1`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    if (action === "submit_feedback") {
      const { child_id, child_name, category, description, screen, app_version } = req.body;
      await sbQuery("feedback", "POST", {
        child_id: sanitizeStr(child_id, 36) || "guest",
        child_name: sanitizeStr(child_name, 50) || "Unknown",
        category: sanitizeStr(category, 50),
        description: sanitizeStr(description, 1000),
        screen: sanitizeStr(screen, 50) || "unknown",
        device_info: "",
        app_version: sanitizeStr(app_version, 20) || "1.0.0",
        status: "open",
        created_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "save_rating") {
      const rating = sanitizeInt(req.body.rating, 1, 5);
      if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });
      await sbQuery("app_ratings", "POST", {
        parent_id: user.id, rating,
        review: sanitizeStr(req.body.review, 500) || "",
        app_version: "1.0.0", platform: "web",
        created_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "track_event") {
      const { child_id, event_type, event_data, session_id } = req.body;
      sbQuery("analytics", "POST", {
        child_id: child_id || null, parent_id: user.id,
        event_type: sanitizeStr(event_type, 50),
        event_data: event_data || {},
        app_version: "1.0.0", platform: "web",
        session_id: session_id || null,
        created_at: new Date().toISOString(),
      }).catch(() => {});
      return res.status(200).json({ ok: true });
    }

    if (action === "reset_password") {
      // Uses email from authenticated user's token — prevents resetting other accounts
      const email = user.email;
      if (!email) return res.status(400).json({ error: "No email on account" });
      const r = await fetch(`${SB_URL}/auth/v1/recover`, {
        method: "POST",
        headers: { apikey: SB_SERVICE, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return res.status(200).json({ ok: r.ok });
    }

    if (action === "delete_account") {
      const { user_id } = req.body;
      if (!isValidUUID(user_id) || user.id !== user_id)
        return res.status(403).json({ error: "Forbidden" });

      const chk = await sbQuery("children", "GET", null,
        `?parent_id=eq.${encodeURIComponent(user_id)}&select=id`);
      const ids = Array.isArray(chk.data) ? chk.data.map((c) => c.id) : [];

      for (const cid of ids) {
        await sbQuery("progress", "DELETE", null, `?child_id=eq.${encodeURIComponent(cid)}`).catch(() => {});
        await sbQuery("daily_completions", "DELETE", null, `?child_id=eq.${encodeURIComponent(cid)}`).catch(() => {});
        await sbQuery("puzzle_completions", "DELETE", null, `?child_id=eq.${encodeURIComponent(cid)}`).catch(() => {});
      }
      await sbQuery("children", "DELETE", null, `?parent_id=eq.${encodeURIComponent(user_id)}`).catch(() => {});
      await fetch(`${SB_URL}/auth/v1/admin/users/${encodeURIComponent(user_id)}`, {
        method: "DELETE",
        headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}` },
      }).catch(() => {});

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error("[db API error]", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
