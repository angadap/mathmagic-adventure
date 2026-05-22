// api/payment.js — Razorpay + UPI payment handler

import crypto from "crypto";

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;

const ALLOWED_ORIGINS = [
  "https://mathmagic-virid.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const VALID_PLANS = { monthly: 199, yearly: 999, reg: 599, lesson: 300 };
const UUID_RE     = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (s) => typeof s === "string" && UUID_RE.test(s);

// ── Rate limiter ───────────────────────────────────────────────────
const rateLimitMap = new Map();
function rateLimit(ip, maxReq = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const e = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > e.resetAt) { e.count = 0; e.resetAt = now + windowMs; }
  e.count++;
  rateLimitMap.set(ip, e);
  if (e.count > maxReq) return { limited: true, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  return { limited: false };
}

// ── Security headers ───────────────────────────────────────────────
function setHeaders(res, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cache-Control", "no-store");
}

// ── Supabase helpers ───────────────────────────────────────────────
async function verifyToken(token) {
  if (!token) return null;
  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_SERVICE, Authorization: `Bearer ${token}` },
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

async function sbQuery(table, method, body, params = "") {
  const r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  try { return { ok: r.ok, data: JSON.parse(txt) }; }
  catch { return { ok: r.ok, data: txt }; }
}

async function childBelongsToUser(childId, userId) {
  if (!isValidUUID(childId) || !isValidUUID(userId)) return false;
  const r = await sbQuery("children", "GET", null,
    `?id=eq.${encodeURIComponent(childId)}&parent_id=eq.${encodeURIComponent(userId)}&select=id`);
  return Array.isArray(r.data) && r.data.length > 0;
}

async function setPremium(childId, plan, txnId, gateway) {
  const expiresAt = new Date(
    Date.now() + (plan === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
  ).toISOString();
  await sbQuery("children", "PATCH", {
    is_premium: true, premium_plan: plan,
    premium_expires_at: expiresAt, premium_txn_id: txnId,
    premium_gateway: gateway, premium_activated_at: new Date().toISOString(),
  }, `?id=eq.${encodeURIComponent(childId)}`);
  sbQuery("analytics", "POST", {
    event_type: "payment_success",
    event_data: { child_id: childId, plan, gateway, txn_id: txnId },
    created_at: new Date().toISOString(),
  }).catch(() => {});
}

// ── Razorpay ───────────────────────────────────────────────────────
async function createRazorpayOrder(amount, receipt) {
  if (!RZP_KEY_ID || !RZP_SECRET) throw new Error("Razorpay not configured");
  const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt, notes: { source: "mathmagic" } }),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.error?.description || "Order failed"); }
  return r.json();
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac("sha256", RZP_SECRET)
    .update(`${orderId}|${paymentId}`).digest("hex");
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ── Main handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !origin.includes("localhost"))
    return res.status(403).json({ error: "Forbidden" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const { limited, retryAfter } = rateLimit(ip);
  if (limited) return res.status(429).json({ error: `Too many requests. Wait ${retryAfter}s.` });

  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  const { action: earlyAction } = req.body || {};
  // Public actions — no auth required
  if (earlyAction === "get_rzp_key") return res.status(200).json({ key: RZP_KEY_ID || "" });
  if (earlyAction === "create_reg_order") {
    try {
      const order = await createRazorpayOrder(599, `mm_reg_${Date.now()}`);
      return res.status(200).json({ order_id: order.id });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }
  if (earlyAction === "verify_reg_payment") {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ error: "Missing payment details" });
    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
      return res.status(400).json({ error: "Payment verification failed." });
    return res.status(200).json({ ok: true, reg_token: razorpay_payment_id });
  }
  if (earlyAction === "verify_reg_upi") {
    const { utr } = req.body;
    if (!utr || utr.length < 10) return res.status(400).json({ error: "Invalid UTR" });
    if (!/^[A-Z0-9]{10,22}$/i.test(utr)) return res.status(400).json({ error: "Invalid UTR format." });
    const dup = await sbQuery("children","GET",null,`?reg_payment_id=eq.${encodeURIComponent(utr)}&select=id`);
    if (Array.isArray(dup.data) && dup.data.length > 0)
      return res.status(400).json({ error: "UTR already used." });
    return res.status(200).json({ ok: true, reg_token: utr });
  }
  const user  = await verifyToken(token);
  if (!user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });

  try {
    // ── Create Razorpay order ──────────────────────────────────
    if (action === "create_razorpay_order") {
      const { plan, amount, child_id } = req.body;
      if (!VALID_PLANS[plan] || VALID_PLANS[plan] !== amount)
        return res.status(400).json({ error: "Invalid plan or amount" });
      if (!(await childBelongsToUser(child_id, user.id)))
        return res.status(403).json({ error: "Forbidden" });
      const order = await createRazorpayOrder(amount, `mm_${child_id.slice(0,8)}_${Date.now()}`);
      return res.status(200).json({ order_id: order.id });
    }

    // ── Verify Razorpay payment ────────────────────────────────
    if (action === "verify_razorpay") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, child_id, plan } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
        return res.status(400).json({ error: "Missing payment details" });
      if (!(await childBelongsToUser(child_id, user.id)))
        return res.status(403).json({ error: "Forbidden" });
      if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
        return res.status(400).json({ error: "Payment verification failed. Contact support." });
      await setPremium(child_id, plan, razorpay_payment_id, "razorpay");
      return res.status(200).json({ ok: true });
    }

    // ── Verify UPI (manual UTR) ────────────────────────────────
    if (action === "verify_upi") {
      const { utr, child_id, plan, amount } = req.body;
      if (!utr || utr.length < 10) return res.status(400).json({ error: "Invalid UTR" });
      if (!VALID_PLANS[plan] || VALID_PLANS[plan] !== amount)
        return res.status(400).json({ error: "Invalid plan or amount" });
      if (!(await childBelongsToUser(child_id, user.id)))
        return res.status(403).json({ error: "Forbidden" });

      // Prevent duplicate UTR
      const dup = await sbQuery("children", "GET", null,
        `?premium_txn_id=eq.${encodeURIComponent(utr)}&select=id`);
      if (Array.isArray(dup.data) && dup.data.length > 0)
        return res.status(400).json({ error: "UTR already used." });

      if (!/^[A-Z0-9]{10,22}$/i.test(utr))
        return res.status(400).json({ error: "Invalid UTR format." });

      await setPremium(child_id, plan, utr, "upi");
      return res.status(200).json({ ok: true });
    }


    // -- Create registration order (no auth needed — pre-signup)
    if (action === "create_reg_order") {
      const order = await createRazorpayOrder(599, `mm_reg_${Date.now()}`);
      return res.status(200).json({ order_id: order.id, key: RZP_KEY_ID });
    }

    // -- Verify registration payment
    if (action === "verify_reg_payment") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
        return res.status(400).json({ error: "Missing payment details" });
      if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
        return res.status(400).json({ error: "Payment verification failed." });
      // Store payment token in session for register flow
      return res.status(200).json({ ok: true, reg_token: razorpay_payment_id });
    }

    // -- Verify registration UPI
    if (action === "verify_reg_upi") {
      const { utr } = req.body;
      if (!utr || utr.length < 10) return res.status(400).json({ error: "Invalid UTR" });
      if (!/^[A-Z0-9]{10,22}$/i.test(utr)) return res.status(400).json({ error: "Invalid UTR format." });
      const dup = await sbQuery("children", "GET", null, `?reg_payment_id=eq.${encodeURIComponent(utr)}&select=id`);
      if (Array.isArray(dup.data) && dup.data.length > 0)
        return res.status(400).json({ error: "UTR already used." });
      return res.status(200).json({ ok: true, reg_token: utr });
    }

    // -- Create lesson order (requires auth)
    if (action === "create_lesson_order") {
      const { lesson_id, child_id, amount } = req.body;
      if (!lesson_id || !child_id) return res.status(400).json({ error: "Missing fields" });
      if (amount !== 300) return res.status(400).json({ error: "Invalid amount" });
      if (!(await childBelongsToUser(child_id, user.id)))
        return res.status(403).json({ error: "Forbidden" });
      const order = await createRazorpayOrder(300, `mm_lesson_${child_id.slice(0,8)}_${lesson_id}_${Date.now()}`);
      return res.status(200).json({ order_id: order.id, key: RZP_KEY_ID });
    }

    // -- Verify lesson payment
    if (action === "verify_lesson_payment") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, lesson_id, child_id } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !lesson_id)
        return res.status(400).json({ error: "Missing fields" });
      if (!(await childBelongsToUser(child_id, user.id)))
        return res.status(403).json({ error: "Forbidden" });
      if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
        return res.status(400).json({ error: "Payment verification failed." });
      await sbQuery("lesson_purchases", "POST", { child_id, lesson_id, txn_id: razorpay_payment_id, gateway: "razorpay", purchased_at: new Date().toISOString() });
      return res.status(200).json({ ok: true });
    }

    // -- Verify lesson UPI
    if (action === "verify_lesson_upi") {
      const { utr, lesson_id, child_id, amount } = req.body;
      if (!utr || utr.length < 10 || !lesson_id) return res.status(400).json({ error: "Missing fields" });
      if (amount !== 300) return res.status(400).json({ error: "Invalid amount" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      if (!/^[A-Z0-9]{10,22}$/i.test(utr)) return res.status(400).json({ error: "Invalid UTR format." });
      const dup = await sbQuery("lesson_purchases", "GET", null, `?txn_id=eq.${encodeURIComponent(utr)}&select=id`);
      if (Array.isArray(dup.data) && dup.data.length > 0)
        return res.status(400).json({ error: "UTR already used." });
      await sbQuery("lesson_purchases", "POST", { child_id, lesson_id, txn_id: utr, gateway: "upi", purchased_at: new Date().toISOString() });
      return res.status(200).json({ ok: true });
    }

    // Public: return Razorpay key ID (no auth needed)
    if (action === "get_rzp_key") {
      return res.status(200).json({ key: RZP_KEY_ID || "" });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("[payment error]", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
