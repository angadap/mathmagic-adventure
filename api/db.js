// api/db.js — Vercel Serverless Function
// All sensitive DB writes go through here server-side
// Client sends JWT token, server verifies it before any write

const SB_URL     = process.env.SUPABASE_URL;

// Telegram notification — free, no dependencies
async function notifyTelegram(msg) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat  = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ chat_id:chat, text:msg, parse_mode:"Markdown" })
    });
  } catch(e) {}
}
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const SB_ANON    = process.env.SUPABASE_ANON_KEY;

// Rate limiter (same pattern as auth.js)
const rateLimitMap = new Map();
function rateLimit(ip, action, maxReq, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const e = rateLimitMap.get(key) || { count:0, resetAt: now+windowMs };
  if (now > e.resetAt) { e.count=0; e.resetAt=now+windowMs; }
  e.count++;
  rateLimitMap.set(key, e);
  if (e.count > maxReq) return { limited:true, retryAfter: Math.ceil((e.resetAt-now)/1000) };
  return { limited:false };
}

const LIMITS = {
  add_child:     { max:5,  windowMs: 60*60*1000 },   // 5 children per hour
  save_progress: { max:200, windowMs: 60*60*1000 },  // 200 saves per hour
  submit_feedback:{ max:10, windowMs: 60*60*1000 },  // 10 feedbacks per hour
  save_rating:   { max:3,  windowMs: 24*60*60*1000 },// 3 ratings per day
  default:       { max:60, windowMs: 60*1000 },
};

// Verify JWT token with Supabase — returns user or null
async function verifyToken(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { "apikey": SB_SERVICE, "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

// Query Supabase REST (server-side, uses service key — bypasses RLS safely)
async function sbQuery(table, method, body, params="", useAnon=false) {
  const key = useAnon ? SB_ANON : SB_SERVICE;
  const res = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": method==="POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  try { return { ok:res.ok, status:res.status, data:JSON.parse(txt) }; }
  catch(e) { return { ok:res.ok, status:res.status, data:txt }; }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error:"Method not allowed" });

  const origin = req.headers.origin || "";
  const allowed = ["https://mathmagic-virid.vercel.app","http://localhost:5173","http://localhost:3000"];
  if (allowed.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error:"Missing action" });

  // Rate limit
  const limit = LIMITS[action] || LIMITS.default;
  const { limited, retryAfter } = rateLimit(ip, action, limit.max, limit.windowMs);
  if (limited) return res.status(429).json({ error:`Rate limit exceeded. Wait ${retryAfter}s.`, retryAfter });

  // Extract token from Authorization header
  const token = req.headers.authorization?.replace("Bearer ","");

  try {
    // ── PUBLIC READS (no auth needed) ──────────────────────────
    if (action === "get_questions") {
      const { lesson_id } = req.body;
      if (!lesson_id) return res.status(400).json({ error:"lesson_id required" });
      // lesson_id arrives as "c1-l1_s0" (combined format)
      const r = await sbQuery("questions","GET",null,`?lesson_id=eq.${encodeURIComponent(lesson_id)}&order=question_index&limit=20`);
      return res.status(200).json({ data: r.data });
    }

    if (action === "get_daily_challenge") {
      const { class_num, seq_num, is_pool } = req.body;
      let params;
      if (seq_num) {
        // Rotation-based: fetch by seq_num
        params = `?class_num=eq.${class_num||1}&seq_num=eq.${seq_num}&is_pool=eq.true&limit=1`;
      } else {
        // Fallback: fetch all for this class
        params = `?class_num=eq.${class_num||1}&is_pool=eq.true&order=seq_num&limit=250`;
      }
      const r = await sbQuery("daily_challenges","GET",null, params);
      const data = Array.isArray(r.data) ? r.data : [];
      return res.status(200).json({ data: seq_num ? (data[0]||null) : data });
    }

    if (action === "get_daily_puzzle") {
      const today = new Date().toISOString().slice(0,10);
      const r = await sbQuery("daily_puzzles","GET",null,`?date=eq.${today}&limit=1`);
      return res.status(200).json({ data: Array.isArray(r.data)?r.data[0]:null });
    }

    // ── AUTHENTICATED OPERATIONS — verify token first ──────────
    const user = await verifyToken(token);
    if (!user?.id) return res.status(401).json({ error:"Unauthorized — please log in" });

    if (action === "get_children") {
      const { parent_id } = req.body;
      if (parent_id !== user.id) return res.status(403).json({ error:"Forbidden" });
      const r = await sbQuery("children","GET",null,`?parent_id=eq.${encodeURIComponent(parent_id)}&order=created_at`);
      return res.status(200).json({ data: r.data });
    }

    if (action === "add_child") {
      const { name, avatar, class_num, pin_hash } = req.body;
      if (!name||!pin_hash) return res.status(400).json({ error:"Missing fields" });
      const r = await sbQuery("children","POST",{
        parent_id:user.id, name, avatar, class_num, pin_hash,
        xp:0, level:1, coins:50, streak_days:0, is_premium:false,
        created_at:new Date().toISOString()
      });
      if (!r.ok) return res.status(400).json({ error:"Failed to create child" });
      const child = Array.isArray(r.data)?r.data[0]:r.data;
      // Fire-and-forget Telegram notification
      const classEmoji = ["","🌍","🌙","☄️","⭐","🚀"][class_num]||"🎓";
      notifyTelegram(`🎉 *New MathMagic User!*\n${avatar||"🧒"} *${name}* | ${classEmoji} Class ${class_num}\n📧 ${user.email||"—"}\n🕐 ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST`).catch(()=>{});
      return res.status(200).json({ data: child });
    }

    if (action === "save_progress") {
      const { child_id, lesson_id, correct_count, total_questions, stars_earned, xp_earned } = req.body;
      // Verify child belongs to this user
      const chk = await sbQuery("children","GET",null,`?id=eq.${encodeURIComponent(child_id)}&parent_id=eq.${encodeURIComponent(user.id)}`);
      if (!Array.isArray(chk.data)||!chk.data[0]) return res.status(403).json({ error:"Forbidden" });
      await sbQuery("progress","POST",{
        child_id, lesson_id, correct_count, total_questions,
        stars_earned, xp_earned, completed_at:new Date().toISOString()
      },"?on_conflict=child_id,lesson_id");
      // Update XP
      const cur = chk.data[0];
      const nx = (cur.xp||0)+xp_earned, nc = (cur.coins||0)+Math.floor(xp_earned/10);
      await sbQuery("children","PATCH",{ xp:nx, coins:nc, level:Math.floor(nx/200)+1, last_active:new Date().toISOString() },`?id=eq.${encodeURIComponent(child_id)}`);
      return res.status(200).json({ ok:true, xp:nx, coins:nc });
    }

    if (action === "submit_feedback") {
      const { child_id, child_name, category, description, screen, app_version } = req.body;
      await sbQuery("feedback","POST",{
        child_id:child_id||"guest", child_name:child_name||"Unknown",
        category, description, screen:screen||"unknown",
        device_info:"", app_version:app_version||"1.0.0",
        status:"open", created_at:new Date().toISOString()
      });
      return res.status(200).json({ ok:true });
    }

    if (action === "save_rating") {
      const { rating, review } = req.body;
      if (rating<1||rating>5) return res.status(400).json({ error:"Rating must be 1-5" });
      await sbQuery("app_ratings","POST",{
        parent_id:user.id, rating, review:review||"",
        app_version:"1.0.0", platform:"web", created_at:new Date().toISOString()
      });
      return res.status(200).json({ ok:true });
    }

    if (action === "track_event") {
      const { child_id, event_type, event_data, session_id } = req.body;
      // Fire and forget — don't await
      sbQuery("analytics","POST",{
        child_id:child_id||null, parent_id:user.id,
        event_type, event_data:event_data||{},
        app_version:"1.0.0", platform:"web",
        session_id:session_id||null, created_at:new Date().toISOString()
      }).catch(()=>{});
      return res.status(200).json({ ok:true });
    }

    if (action === "reset_password") {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error:"Email required" });
      const r = await fetch(`${SB_URL}/auth/v1/recover`,{method:"POST",headers:{"apikey":SB_SERVICE,"Content-Type":"application/json"},body:JSON.stringify({email})});
      return res.status(200).json({ ok:r.ok });
    }

    if (action === "delete_account") {
      const { user_id } = req.body;
      if (!user?.id || user.id !== user_id) return res.status(403).json({ error:"Forbidden" });
      const chk = await sbQuery("children","GET",null,`?parent_id=eq.${encodeURIComponent(user_id)}&select=id`);
      const ids = Array.isArray(chk.data)?chk.data.map(c=>c.id):[];
      for (const cid of ids) {
        await sbQuery("progress","DELETE",null,`?child_id=eq.${encodeURIComponent(cid)}`).catch(()=>{});
        await sbQuery("daily_completions","DELETE",null,`?child_id=eq.${encodeURIComponent(cid)}`).catch(()=>{});
      }
      await sbQuery("children","DELETE",null,`?parent_id=eq.${encodeURIComponent(user_id)}`).catch(()=>{});
      await fetch(`${SB_URL}/auth/v1/admin/users/${encodeURIComponent(user_id)}`,{method:"DELETE",headers:{"apikey":SB_SERVICE,"Authorization":`Bearer ${SB_SERVICE}`}}).catch(()=>{});
      return res.status(200).json({ ok:true });
    }

    if (action === "complete_puzzle") {
      const { child_id, puzzle_id, date, answer_given, correct } = req.body;
      if (!child_id) return res.status(400).json({ error:"child_id required" });
      await sbQuery("puzzle_completions","POST",{child_id,puzzle_id:puzzle_id||null,date:date||new Date().toISOString().slice(0,10),answer_given:answer_given||"",correct:correct||false,completed_at:new Date().toISOString()});
      return res.status(200).json({ ok:true });
    }

    if (action === "get_puzzle_completion") {
      const { child_id, date } = req.body;
      if (!child_id) return res.status(400).json({ error:"child_id required" });
      const r = await sbQuery("puzzle_completions","GET",null,`?child_id=eq.${encodeURIComponent(child_id)}&date=eq.${date}&limit=1`);
      return res.status(200).json({ data:Array.isArray(r.data)?r.data:[] });
    }

        return res.status(400).json({ error:"Unknown action" });

  } catch(err) {
    console.error("[db API error]", err);
    return res.status(500).json({ error:"Server error. Please try again." });
  }
}
