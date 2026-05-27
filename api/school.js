// api/school.js — School management API
// Admin: create/manage schools+teachers
// Teacher: login, manage students, view progress

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_KEY  = process.env.ADMIN_SECRET_KEY; // set in Vercel — your private key

const ALLOWED    = ["https://mathmagic-virid.vercel.app","http://localhost:5173","http://localhost:3000"];
const UUID_RE    = /^[0-9a-f-]{36}$/i;
const isUUID     = s => UUID_RE.test(s||"");
const clean      = (s,n=100) => typeof s==="string" ? s.replace(/[<>]/g,"").slice(0,n).trim() : "";
const cleanInt   = (n,min,max) => { const i=parseInt(n); return isNaN(i)?min:Math.min(Math.max(i,min),max); };

// Rate limiter
const rl = new Map();
function rateLimit(ip, max=30, ms=60000) {
  const now=Date.now(), e=rl.get(ip)||{c:0,r:now+ms};
  if(now>e.r){e.c=0;e.r=now+ms;} e.c++; rl.set(ip,e);
  return e.c>max ? {limited:true,retryAfter:Math.ceil((e.r-now)/1000)} : {limited:false};
}

async function sb(table, method, body, params="") {
  const headers = {
    apikey:SB_SERVICE, Authorization:`Bearer ${SB_SERVICE}`,
    "Content-Type":"application/json",
    Prefer: method==="POST"?"return=representation":"return=minimal",
  };
  // For GET requests, request up to 10000 rows (overrides PostgREST default of 1000)
  if (method==="GET") headers["Range-Unit"] = "items", headers["Range"] = "0-9999";
  const r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method, headers, body: body?JSON.stringify(body):undefined
  });
  const t = await r.text();
  try { return {ok:r.ok, data:JSON.parse(t)}; } catch { return {ok:r.ok, data:t}; }
}

// Simple PIN hash (server-side)
async function hashPin(pin) {
  const { createHash } = await import("crypto");
  return createHash("sha256").update("mm_school_"+pin).digest("hex");
}

export default async function handler(req, res) {
  const origin = req.headers.origin||"";
  if (ALLOWED.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Cache-Control","no-store");

  if (req.method==="OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");
    return res.status(200).end();
  }
  if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()||"unknown";
  const {limited,retryAfter} = rateLimit(ip);
  if (limited) return res.status(429).json({error:`Rate limit. Wait ${retryAfter}s.`});

  const {action} = req.body||{};
  if (!action) return res.status(400).json({error:"Missing action"});

  const authHeader = req.headers.authorization||"";

  try {
    // ══════════════════════════════════════════════════════
    // ADMIN ACTIONS — protected by ADMIN_SECRET_KEY
    // ══════════════════════════════════════════════════════
    if (action.startsWith("admin_")) {
      if (!ADMIN_KEY || authHeader !== `Bearer ${ADMIN_KEY}`)
        return res.status(403).json({error:"Forbidden"});

      // Create school
      if (action==="admin_create_school") {
        const name = clean(req.body.name, 100);
        const city = clean(req.body.city, 50);
        const school_code = clean(req.body.school_code, 20).toUpperCase();
        if (!name||!city||!school_code) return res.status(400).json({error:"Missing fields"});
        const r = await sb("schools","POST",{name,city,school_code,is_active:true});
        if (!r.ok) return res.status(400).json({error:"School code may already exist"});
        return res.status(200).json({data: Array.isArray(r.data)?r.data[0]:r.data});
      }

      // Update school code
      if (action==="admin_update_school") {
        const {school_id, school_code, name, city, is_active} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const update = {};
        if (school_code) update.school_code = clean(school_code,20).toUpperCase();
        if (name)        update.name        = clean(name,100);
        if (city)        update.city        = clean(city,50);
        if (is_active !== undefined) update.is_active = !!is_active;
        const r = await sb("schools","PATCH",update,`?id=eq.${school_id}`);
        return res.status(200).json({ok:r.ok});
      }

      // List all schools
      if (action==="admin_list_schools") {
        const r = await sb("schools","GET",null,"?order=created_at.desc");
        return res.status(200).json({data:r.data});
      }

      // Create teacher
      if (action==="admin_create_teacher") {
        const {school_id, name, email, pin, permissions} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        if (!email||!pin||!name) return res.status(400).json({error:"Missing fields"});
        const pin_hash = await hashPin(String(pin).slice(0,6));
        const validPerms = ["change_student_pin","modify_student","delete_student","add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question","view_analytics"];
        const perms = Array.isArray(permissions) ? permissions.filter(p=>validPerms.includes(p)) : [];
        const r = await sb("teachers","POST",{
          school_id, name:clean(name,50),
          email:clean(email,100).toLowerCase(),
          pin_hash, is_active:true, permissions:perms
        });
        if (!r.ok) return res.status(400).json({error:"Email may already exist"});
        return res.status(200).json({data: Array.isArray(r.data)?r.data[0]:r.data});
      }

      // List ALL teachers across all schools (for dashboard tiles)
      if (action==="admin_list_all_teachers") {
        const {search, school_id} = req.body;
        let params = "?order=created_at.desc";
        if (school_id && isUUID(school_id)) params += `&school_id=eq.${school_id}`;
        const r = await sb("teachers","GET",null,params);
        let data = r.data||[];
        if (search) { const s=search.toLowerCase(); data=data.filter(t=>t.name?.toLowerCase().includes(s)||t.email?.toLowerCase().includes(s)); }
        return res.status(200).json({data});
      }

      // List ALL students across all schools
      if (action==="admin_list_all_students") {
        const {search, school_id, class_num, section} = req.body;
        let params = "?order=class_num,section,roll_no";
        if (school_id && isUUID(school_id)) params += `&school_id=eq.${school_id}`;
        if (class_num !== undefined) params += `&class_num=eq.${cleanInt(class_num,0,12)}`;
        if (section) params += `&section=eq.${clean(section,5).toUpperCase()}`;
        const r = await sb("students","GET",null,params);
        let data = r.data||[];
        if (search) { const s=search.toLowerCase(); data=data.filter(t=>t.name?.toLowerCase().includes(s)||String(t.roll_no).includes(s)); }
        return res.status(200).json({data});
      }

      // List ALL classes (distinct class_num+section across all schools or one school)
      if (action==="admin_list_all_classes") {
        const {school_id, search} = req.body;
        let params = "?select=class_num,section,school_id&order=class_num,section";
        if (school_id && isUUID(school_id)) params += `&school_id=eq.${school_id}`;
        const r = await sb("students","GET",null,params);
        const seen = new Set(); const rows = [];
        for (const s of (r.data||[])) {
          const key = `${s.school_id}__${s.class_num}__${s.section}`;
          if (!seen.has(key)) { seen.add(key); rows.push(s); }
        }
        return res.status(200).json({data:rows});
      }

      // List teachers for a school
      if (action==="admin_list_teachers") {
        const {school_id} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const r = await sb("teachers","GET",null,`?school_id=eq.${school_id}&order=created_at`);
        return res.status(200).json({data:r.data});
      }

      if (action==="admin_list_students") {
      const {school_id, teacher_id} = req.body;
      if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
      let params = `?school_id=eq.${school_id}&order=class_num,section,roll_no`;
      if (teacher_id && isUUID(teacher_id)) params += `&teacher_id=eq.${teacher_id}`;
      const r = await sb("students","GET",null,params);
      return res.status(200).json({data:r.data});
    }
        if (action==="create_student_admin") {
      const {school_id, teacher_id, name, roll_no, pin, class_num, section} = req.body;
      if (!school_id||!name||!roll_no||!pin) return res.status(400).json({error:"Missing fields"});
      const pin_hash = await hashPin(String(pin).slice(0,4));
      const r = await sb("students","POST",{
        school_id:clean(school_id,36), teacher_id:teacher_id||null,
        name:clean(name,50), roll_no:clean(String(roll_no),10),
        username:clean(req.body.username||roll_no||name,30).toLowerCase().replace(/\s+/g,'_'),
        class_num:cleanInt(class_num,0,7), section:clean(String(section||"A"),5).toUpperCase(),
        pin_hash, xp:0, coins:50, level:1, streak_days:0
      });
      if (!r.ok) return res.status(400).json({error:"Duplicate roll number"});
      return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
    }
      if (action==="admin_modify_teacher") {
      const {teacher_id, name, email, permissions} = req.body;
      if (!teacher_id) return res.status(400).json({error:"Missing teacher_id"});
      const update = {};
      if (name)  update.name  = clean(name,100);
      if (email) update.email = clean(email,100).toLowerCase();
      if (Array.isArray(permissions)) {
        const validPerms = ["change_student_pin","modify_student","delete_student","add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question","view_analytics"];
        update.permissions = permissions.filter(p=>validPerms.includes(p));
      }
      const r = await sb("teachers","PATCH",update,`?id=eq.${teacher_id}`);
      if (!r.ok) return res.status(400).json({error:"Update failed"});
      return res.status(200).json({data:true});
    }
      if (action==="admin_delete_teacher") {
      const {teacher_id} = req.body;
      if (!teacher_id) return res.status(400).json({error:"Missing teacher_id"});
      await sb("students","PATCH",{teacher_id:null},`?teacher_id=eq.${teacher_id}`);
      const r = await sb("teachers","DELETE",null,`?id=eq.${teacher_id}`);
      if (!r.ok) return res.status(400).json({error:"Delete failed"});
      return res.status(200).json({data:true});
    }
      if (action==="admin_modify_student") {
      const {student_id, name, roll_no, class_num, section, pin} = req.body;
      if (!student_id) return res.status(400).json({error:"Missing student_id"});
      const update = {};
      if (name)      update.name      = clean(name,50);
      if (roll_no)   update.roll_no   = clean(String(roll_no),10);
      if (class_num !== undefined) update.class_num = cleanInt(class_num,0,12);
      if (section)   update.section   = clean(String(section),5).toUpperCase();
      if (pin) { update.pin_hash = await hashPin(String(pin).slice(0,6)); }
      const r = await sb("students","PATCH",update,`?id=eq.${student_id}`);
      if (!r.ok) return res.status(400).json({error:"Update failed"});
      return res.status(200).json({data:true});
    }
      if (action==="admin_delete_student") {
      const {student_id} = req.body;
      if (!student_id) return res.status(400).json({error:"Missing student_id"});
      await sb("student_progress","DELETE",null,`?student_id=eq.${student_id}`);
      const r = await sb("students","DELETE",null,`?id=eq.${student_id}`);
      if (!r.ok) return res.status(400).json({error:"Delete failed"});
      return res.status(200).json({data:true});
    }

      // Delete school
      if (action==="admin_delete_school") {
        const {school_id} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        await sb("students","DELETE",null,`?school_id=eq.${school_id}`).catch(()=>{});
        await sb("teachers","DELETE",null,`?school_id=eq.${school_id}`).catch(()=>{});
        const r = await sb("schools","DELETE",null,`?id=eq.${school_id}`);
        return res.status(200).json({ok:r.ok});
      }

      // List classes (distinct class_num+section from students)
      if (action==="admin_list_classes") {
        const {school_id} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const r = await sb("students","GET",null,`?school_id=eq.${school_id}&select=class_num,section&order=class_num,section`);
        if (!r.ok) return res.status(400).json({error:"Failed"});
        const seen = new Set(); const rows = [];
        for (const s of (r.data||[])) {
          const key = `${s.class_num}__${s.section}`;
          if (!seen.has(key)) { seen.add(key); rows.push(s); }
        }
        return res.status(200).json({data:rows});
      }

      // Add a class (creates a teacher placeholder to represent the class)
      if (action==="admin_add_class") {
        const {school_id, class_num, section, teacher_name} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const cn = cleanInt(class_num,0,12);
        const sec = clean(String(section||"A"),5).toUpperCase();
        const labels = {10:"Nursery",11:"Jr KG",12:"Sr KG",1:"Class 1",2:"Class 2",3:"Class 3",4:"Class 4",5:"Class 5"};
        const label = labels[cn]||`Class ${cn}`;
        const name = clean(teacher_name||`${label}-${sec} Teacher`,100);
        const email = `class${cn}${sec.toLowerCase()}_${school_id.slice(0,6)}@mathmagic.internal`;
        const pin_hash = await hashPin("1234");
        const r = await sb("teachers","POST",{school_id,name,email,pin_hash,class_label:`${label}-${sec}`});
        if (!r.ok) return res.status(400).json({error:"Class/teacher may already exist"});
        return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
      }

      // Bulk create teachers (CSV-style [{name,email,pin}])
      if (action==="admin_bulk_create_teachers") {
        const {school_id, rows} = req.body;
        if (!isUUID(school_id)||!Array.isArray(rows)) return res.status(400).json({error:"Missing fields"});
        const results = [];
        for (const row of rows.slice(0,50)) {
          const pin_hash = await hashPin(String(row.pin||"1234").slice(0,6));
          const r = await sb("teachers","POST",{school_id,name:clean(row.name,100),email:clean(row.email,100).toLowerCase(),pin_hash});
          results.push({name:row.name,ok:r.ok,error:r.ok?null:"Failed (duplicate?)"});
        }
        return res.status(200).json({data:results});
      }

      // Bulk create students [{name,roll_no,class_num,section,pin}]
      if (action==="admin_bulk_create_students") {
        const {school_id, teacher_id, rows} = req.body;
        if (!isUUID(school_id)||!Array.isArray(rows)) return res.status(400).json({error:"Missing fields"});
        const results = [];
        for (const row of rows.slice(0,200)) {
          const pin_hash = await hashPin(String(row.pin||"1234").slice(0,6));
          const username = `${clean(row.name||"",20).toLowerCase().replace(/\s+/g,"")}_${String(row.roll_no||"").padStart(3,"0")}`;
          const r = await sb("students","POST",{school_id,teacher_id:teacher_id||null,name:clean(row.name,50),roll_no:clean(String(row.roll_no),10),class_num:cleanInt(row.class_num,0,12),section:clean(String(row.section||"A"),5).toUpperCase(),username,pin_hash,xp:0,level:1,streak_days:0});
          results.push({name:row.name,ok:r.ok,error:r.ok?null:"Failed"});
        }
        return res.status(200).json({data:results});
      }

      // Questions: list lessons for a class
      if (action==="admin_list_lessons_for_class") {
        const {class_num} = req.body;
        const cn = cleanInt(class_num,0,12);
        const prefixMap = {10:"n",11:"jk",12:"sk",1:"c1",2:"c2",3:"c3",4:"c4",5:"c5"};
        const LESSON_TITLES = {
          10:["Counting 1–5","Counting 6–10","Shapes","Colors & Numbers","Big & Small","Patterns","More & Less","Number Writing","Sorting"],
          11:["Numbers 1–20","Addition Basics","Subtraction Basics","Shapes & Sizes","Patterns","Comparing Numbers","Missing Numbers","Simple Word Problems","Measurement Basics"],
          12:["Numbers 1–50","Addition to 20","Subtraction to 20","Multiplication Intro","Division Intro","Geometry Basics","Fractions Intro","Word Problems","Data Handling"],
          1:["Number Sense","Addition Basics","Subtraction Basics","Shapes & Space","Measurement","Patterns","Data Handling","Money Basics","Time Basics"],
          2:["Numbers to 100","Addition with Carry","Subtraction with Borrow","Multiplication Tables 2–5","Division Basics","Geometry","Fractions","Measurement","Data & Graphs"],
          3:["Numbers to 1000","Addition & Subtraction","Multiplication Tables","Division","Fractions","Decimals Intro","Geometry","Measurement","Time & Calendar"],
          4:["Large Numbers","Operations","Fractions & Decimals","Factors & Multiples","Geometry","Measurement","Data Handling","Patterns","Problem Solving"],
          5:["Number Systems","Fractions & Decimals","Algebra Basics","Geometry","Ratio & Proportion","Percentage","Data Handling","Mensuration","Problem Solving"],
        };
        const prefix = prefixMap[cn]||`c${cn}`;
        const titles = LESSON_TITLES[cn]||[];
        // Fetch with large range to get all rows
        const r = await sb("questions","GET",null,`?lesson_id=like.${prefix}-%25&select=lesson_id&order=lesson_id&limit=50000`);
        const seen = new Set(); const lessons = [];
        for (const q of (r.data||[])) {
          const raw = q.lesson_id||"";
          const lid = raw.includes("_s") ? raw.split("_s")[0] : raw;
          if (lid && !seen.has(lid)) { seen.add(lid); lessons.push(lid); }
        }
        // Also include expected lesson IDs from LESSONS constant that may exist in DB
        // Sort by lesson number
        const sorted = lessons.sort((a,b)=>{
          const na=parseInt(a.split("-l")[1]||0), nb=parseInt(b.split("-l")[1]||0);
          return na-nb;
        });
        // Attach title to each
        const withTitles = sorted.map(lid=>{
          const n=parseInt(lid.split("-l")[1]||1)-1;
          return {id:lid, title:titles[n]||`Lesson ${n+1}`};
        });
        return res.status(200).json({data:withTitles});
      }

      // Questions: list sets for a lesson
      if (action==="admin_list_sets_for_lesson") {
        const {lesson_id_prefix} = req.body;
        const safe = clean(lesson_id_prefix,30);
        const r = await sb("questions","GET",null,`?lesson_id=like.${safe}%25&select=set_index&order=set_index`);
        if (!r.ok) return res.status(400).json({error:"Failed"});
        const seen = new Set(); const sets = [];
        for (const q of (r.data||[])) { if (!seen.has(q.set_index)) { seen.add(q.set_index); sets.push(q.set_index); } }
        return res.status(200).json({data:sets.sort((a,b)=>a-b)});
      }

      // Questions: list questions in a set
      if (action==="admin_list_questions") {
        const {lesson_id_prefix, set_index} = req.body;
        const safe = clean(lesson_id_prefix,30);
        const si = cleanInt(set_index,0,99);
        const r = await sb("questions","GET",null,`?lesson_id=like.${safe}%25&set_index=eq.${si}&order=question_index`);
        return res.status(200).json({data:r.data||[]});
      }

      // Questions: add single question
      if (action==="admin_add_question") {
        const {lesson_id,set_index,question_index,question,options,correct_answer,hint} = req.body;
        if (!lesson_id||!question||!Array.isArray(options)||options.length!==4) return res.status(400).json({error:"Need lesson_id, question, 4 options"});
        const r = await sb("questions","POST",{lesson_id:clean(lesson_id,50),set_index:cleanInt(set_index,0,99),question_index:cleanInt(question_index||0,0,99),question:clean(question,500),options:options.map(o=>clean(String(o),200)),correct_answer:cleanInt(correct_answer,0,3),hint:clean(hint||"",200)});
        if (!r.ok) return res.status(400).json({error:"Failed — duplicate index?"});
        return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
      }

      // Questions: update question
      if (action==="admin_update_question") {
        const {id,question,options,correct_answer,hint} = req.body;
        if (!isUUID(id)) return res.status(400).json({error:"Invalid id"});
        const update = {};
        if (question) update.question = clean(question,500);
        if (options&&Array.isArray(options)&&options.length===4) update.options = options.map(o=>clean(String(o),200));
        if (correct_answer!==undefined) update.correct_answer = cleanInt(correct_answer,0,3);
        if (hint!==undefined) update.hint = clean(hint,200);
        const r = await sb("questions","PATCH",update,`?id=eq.${id}`);
        return res.status(200).json({ok:r.ok});
      }

      // Questions: delete question
      if (action==="admin_delete_question") {
        const {id} = req.body;
        if (!isUUID(id)) return res.status(400).json({error:"Invalid id"});
        const r = await sb("questions","DELETE",null,`?id=eq.${id}`);
        return res.status(200).json({ok:r.ok});
      }

      // Questions: create new lesson (returns next lesson_id)
      if (action==="admin_add_lesson") {
        const {class_num} = req.body;
        const cn = cleanInt(class_num,0,12);
        const prefixMap = {10:"n",11:"jk",12:"sk",1:"c1",2:"c2",3:"c3",4:"c4",5:"c5"};
        const prefix = prefixMap[cn]||`c${cn}`;
        const r = await sb("questions","GET",null,`?lesson_id=like.${prefix}-%25&select=lesson_id&order=lesson_id`);
        const existing = new Set((r.data||[]).map(q=>q.lesson_id.includes("_s")?q.lesson_id.split("_s")[0]:q.lesson_id));
        let n = 1; while (existing.has(`${prefix}-l${n}`)) n++;
        const new_lesson_id = `${prefix}-l${n}`;
        return res.status(200).json({data:{lesson_id:new_lesson_id,class_num:cn}});
      }

      // Questions: bulk add questions to a set
      if (action==="admin_bulk_add_questions") {
        const {lesson_id,set_index,questions} = req.body;
        if (!lesson_id||!Array.isArray(questions)) return res.status(400).json({error:"Missing fields"});
        const si = cleanInt(set_index,0,99);
        const existing = await sb("questions","GET",null,`?lesson_id=eq.${clean(lesson_id,50)}&set_index=eq.${si}&select=question_index&order=question_index.desc&limit=1`);
        let nextIdx = existing.data&&existing.data.length>0 ? existing.data[0].question_index+1 : 0;
        const results = [];
        for (const [i,q] of questions.slice(0,100).entries()) {
          if (!q.question||!Array.isArray(q.options)||q.options.length!==4) { results.push({ok:false,error:"Bad row "+i}); continue; }
          const r = await sb("questions","POST",{lesson_id:clean(lesson_id,50),set_index:si,question_index:nextIdx+i,question:clean(q.question,500),options:q.options.map(o=>clean(String(o),200)),correct_answer:cleanInt(q.correct_answer,0,3),hint:clean(q.hint||"",200)});
          results.push({ok:r.ok,error:r.ok?null:"Failed"});
        }
        return res.status(200).json({data:results});
      }

        return res.status(400).json({error:"Unknown admin action"});
    }

    // ══════════════════════════════════════════════════════
    // TEACHER LOGIN
    // ══════════════════════════════════════════════════════
    if (action==="teacher_login") {
      const {email, pin} = req.body;
      if (!email||!pin) return res.status(400).json({error:"Missing fields"});
      const pin_hash = await hashPin(String(pin).slice(0,6));
      const r = await sb("teachers","GET",null,
        `?email=eq.${encodeURIComponent(clean(email,100).toLowerCase())}&pin_hash=eq.${pin_hash}&is_active=eq.true&limit=1`);
      if (!Array.isArray(r.data)||!r.data[0])
        return res.status(401).json({error:"Invalid email or PIN"});
      const t = r.data[0];
      // Generate session token and store in DB
      const { randomBytes } = await import("crypto");
      const session_token = randomBytes(32).toString("hex");
      await sb("teachers","PATCH",{session_token},`?id=eq.${t.id}`);
      return res.status(200).json({teacher:{id:t.id,name:t.name,email:t.email,school_id:t.school_id,permissions:Array.isArray(t.permissions)?t.permissions:[]},session_token});
    }

    // ══════════════════════════════════════════════════════
    // TEACHER ACTIONS — verified by teacher_id + pin_hash
    // ══════════════════════════════════════════════════════
    // Teacher auth: simple session token stored server-side in teachers table
    async function verifyTeacher(teacher_id, session_token) {
      if (!isUUID(teacher_id)||!session_token) return null;
      const r = await sb("teachers","GET",null,
        `?id=eq.${teacher_id}&session_token=eq.${encodeURIComponent(session_token)}&is_active=eq.true&select=id,school_id,name,email,permissions&limit=1`);
      return Array.isArray(r.data)&&r.data[0] ? r.data[0] : null;
    }

    const {teacher_id, session_token} = req.body;

    // Create student
    if (action==="create_student") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {name, roll_no, pin} = req.body;
      const class_num = cleanInt(req.body.class_num, 1, 5);
      const section   = clean(req.body.section, 5).toUpperCase();
      if (!name||!roll_no||!pin) return res.status(400).json({error:"Missing fields"});
      const pin_hash = await hashPin(String(pin).slice(0,4));
      const r = await sb("students","POST",{
        school_id:teacher.school_id, teacher_id,
        name:clean(name,50), roll_no:clean(roll_no,10),
        class_num, section, pin_hash,
        xp:0, coins:50, level:1, streak_days:0
      });
      if (!r.ok) return res.status(400).json({error:"Roll number may already exist in this class/section"});
      return res.status(200).json({data: Array.isArray(r.data)?r.data[0]:r.data});
    }

    // List students
    if (action==="list_students") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {class_num, section} = req.body;
      let params = `?school_id=eq.${teacher.school_id}&order=class_num,section,roll_no`;
      if (class_num) params += `&class_num=eq.${cleanInt(class_num,1,5)}`;
      if (section)   params += `&section=eq.${encodeURIComponent(clean(section,5).toUpperCase())}`;
      const r = await sb("students","GET",null,params);
      return res.status(200).json({data:r.data});
    }

    // Get student progress
    if (action==="get_student_progress") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {student_id} = req.body;
      if (!isUUID(student_id)) return res.status(400).json({error:"Invalid student_id"});
      // Verify student belongs to same school
      const sc = await sb("students","GET",null,`?id=eq.${student_id}&school_id=eq.${teacher.school_id}&select=id&limit=1`);
      if (!Array.isArray(sc.data)||!sc.data[0]) return res.status(403).json({error:"Forbidden"});
      const r = await sb("student_progress","GET",null,`?student_id=eq.${student_id}&order=completed_at.desc`);
      return res.status(200).json({data:r.data});
    }

    // Get class dashboard (all students + their progress summary)
    if (action==="get_class_dashboard") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {class_num, section} = req.body;
      let params = `?school_id=eq.${teacher.school_id}&select=id,name,roll_no,class_num,section,xp,level,coins,streak_days,last_active&order=class_num,section,xp.desc`;
      if (class_num) params += `&class_num=eq.${cleanInt(class_num,1,5)}`;
      if (section)   params += `&section=eq.${encodeURIComponent(clean(section,5).toUpperCase())}`;
      const r = await sb("students","GET",null,params);
      return res.status(200).json({data:r.data});
    }

    // ══════════════════════════════════════════════════════
    // STUDENT LOGIN — school_code + roll_no + PIN
    // ══════════════════════════════════════════════════════
    if (action==="student_login") {
      const {school_code, pin, class_num, section} = req.body;
      const nameOrRoll = clean(req.body.name||req.body.roll_no||"",50);
      if (!school_code||!nameOrRoll||!pin) return res.status(400).json({error:"Missing fields"});
      // Find school
      const sc = await sb("schools","GET",null,
        `?school_code=eq.${encodeURIComponent(clean(school_code,20).toUpperCase())}&is_active=eq.true&select=id&limit=1`);
      if (!Array.isArray(sc.data)||!sc.data[0]) return res.status(401).json({error:"Invalid school code"});
      const school_id = sc.data[0].id;
      // Find student by name (case-insensitive via ilike) + PIN
      const pin_hash = await hashPin(String(pin).slice(0,4));
      const searchName = nameOrRoll.toLowerCase();
      // Try username match first
      const byUser = await sb("students","GET",null,`?school_id=eq.${school_id}&username=eq.${encodeURIComponent(searchName)}&pin_hash=eq.${pin_hash}&limit=1`);
      if (Array.isArray(byUser.data)&&byUser.data[0]) {
        const s=byUser.data[0]; sb("students","PATCH",{last_active:new Date().toISOString()},`?id=eq.${s.id}`).catch(()=>{});
        return res.status(200).json({student:{id:s.id,name:s.name,roll_no:s.roll_no,class_num:s.class_num,section:s.section,school_id:s.school_id,xp:s.xp,coins:s.coins,level:s.level,streak_days:s.streak_days}});
      }
      // Fetch all students in school then match name case-insensitively
      let params = `?school_id=eq.${school_id}&pin_hash=eq.${pin_hash}&limit=20`;
      if (class_num) params += `&class_num=eq.${cleanInt(class_num,1,5)}`;
      if (section)   params += `&section=eq.${encodeURIComponent(clean(section,5).toUpperCase())}`;
      const r = await sb("students","GET",null,params);
      if (!Array.isArray(r.data)||!r.data.length) return res.status(401).json({error:"Invalid credentials"});
      const s = r.data.find(st=>st.name.toLowerCase()===searchName)||r.data[0];
      if (!s) return res.status(401).json({error:"Invalid credentials"});
      // Update last_active
      sb("students","PATCH",{last_active:new Date().toISOString()},`?id=eq.${s.id}`).catch(()=>{});
      return res.status(200).json({student:{id:s.id,name:s.name,roll_no:s.roll_no,class_num:s.class_num,section:s.section,school_id:s.school_id,xp:s.xp,coins:s.coins,level:s.level,streak_days:s.streak_days}});
    }

    // Save student progress
    if (action==="save_student_progress") {
      const {student_id, school_code, lesson_id, correct_count, total_questions, stars_earned, xp_earned} = req.body;
      if (!isUUID(student_id)) return res.status(400).json({error:"Invalid student_id"});
      // Verify student exists in the school
      const sc = await sb("schools","GET",null,`?school_code=eq.${encodeURIComponent(clean(school_code||"",20).toUpperCase())}&select=id&limit=1`);
      if (!Array.isArray(sc.data)||!sc.data[0]) return res.status(403).json({error:"Forbidden"});
      const xp = Math.min(parseInt(xp_earned)||0, 1000);
      await sb("student_progress","POST",{
        student_id, lesson_id:clean(lesson_id,30),
        correct_count:Math.min(parseInt(correct_count)||0,100),
        total_questions:Math.min(parseInt(total_questions)||0,100),
        stars_earned:Math.min(parseInt(stars_earned)||0,3),
        xp_earned:xp, completed_at:new Date().toISOString()
      },"?on_conflict=student_id,lesson_id");
      // Update student XP
      const cur = await sb("students","GET",null,`?id=eq.${student_id}&select=xp,coins&limit=1`);
      const c = Array.isArray(cur.data)?cur.data[0]:{};
      const nx = Math.min((c.xp||0)+xp, 999999);
      const nc = Math.min((c.coins||0)+Math.floor(xp/10), 999999);
      await sb("students","PATCH",{xp:nx,coins:nc,level:Math.floor(nx/200)+1,last_active:new Date().toISOString()},`?id=eq.${student_id}`);
      return res.status(200).json({ok:true,xp:nx,coins:nc});
    }


    // Bulk create students (from Excel import)
    if (action==="bulk_create_students") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {students} = req.body; // array of {name,roll_no,class_num,section,pin}
      if (!Array.isArray(students)||students.length===0) return res.status(400).json({error:"No students"});
      if (students.length>200) return res.status(400).json({error:"Max 200 students per import"});
      const results = {success:0, failed:[], };
      for (const s of students) {
        if (!s.name||!s.roll_no||!s.pin) { results.failed.push({roll_no:s.roll_no,reason:"Missing fields"}); continue; }
        const pin_hash = await hashPin(String(s.pin).slice(0,4));
        const r = await sb("students","POST",{
          school_id:teacher.school_id, teacher_id,
          name:clean(s.name,50), roll_no:clean(String(s.roll_no),10),
          class_num:cleanInt(s.class_num,1,5), section:clean(String(s.section||"A"),5).toUpperCase(),
          pin_hash, xp:0, coins:50, level:1, streak_days:0
        });
        if (r.ok) results.success++; else results.failed.push({roll_no:s.roll_no,reason:"Duplicate roll number"});
      }
      return res.status(200).json({ok:true, ...results});
    }
    // Teacher: add student to specific class/section
    if (action==="add_student_to_class") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {name, roll_no, pin, class_num, section} = req.body;
      if (!name||!roll_no||!pin) return res.status(400).json({error:"Missing fields"});
      const pin_hash = await hashPin(String(pin).slice(0,4));
      const r = await sb("students","POST",{
        school_id:teacher.school_id, teacher_id,
        name:clean(name,50), roll_no:clean(String(roll_no),10),
        class_num:cleanInt(class_num,1,5), section:clean(String(section||"A"),5).toUpperCase(),
        pin_hash, xp:0, coins:50, level:1, streak_days:0
      });
      if (!r.ok) return res.status(400).json({error:"Duplicate roll number in this class/section"});
      return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
    }

    // Teacher: create custom lesson
    if (action==="create_lesson") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {title, class_num, emoji} = req.body;
      if (!title) return res.status(400).json({error:"Title required"});
      // Store as a custom lesson record
      const lesson_id = `school_${teacher.school_id.slice(0,8)}_${Date.now()}`;
      const r = await sb("custom_lessons","POST",{
        lesson_id, title:clean(title,80), class_num:cleanInt(class_num,1,5),
        emoji:clean(emoji||"📚",5), school_id:teacher.school_id,
        teacher_id, created_at:new Date().toISOString()
      });
      if (!r.ok) return res.status(400).json({error:"Failed to create lesson"});
      return res.status(200).json({data:{lesson_id,title,class_num}});
    }

    // Teacher: create question in a lesson set
    if (action==="create_question") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {lesson_id, set_index, question_index, question, options, correct_answer, hint} = req.body;
      if (!lesson_id||!question||!options) return res.status(400).json({error:"Missing fields"});
      if (!Array.isArray(options)||options.length!==4) return res.status(400).json({error:"Need exactly 4 options"});
      const r = await sb("questions","POST",{
        lesson_id: clean(lesson_id,40),
        set_index: cleanInt(set_index,0,19),
        question_index: cleanInt(question_index,0,19),
        question: clean(question,500),
        options: options.map(o=>clean(String(o),200)),
        correct_answer: cleanInt(correct_answer,0,3),
        hint: clean(hint||"",200),
      });
      if (!r.ok) return res.status(400).json({error:"Failed to create question (duplicate index?)"});
      return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
    }

    // Teacher: list custom lessons for their school
    if (action==="list_custom_lessons") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      const {class_num} = req.body;
      let params = `?school_id=eq.${teacher.school_id}&order=created_at`;
      if (class_num) params += `&class_num=eq.${cleanInt(class_num,1,5)}`;
      const r = await sb("custom_lessons","GET",null,params);
      return res.status(200).json({data:r.data});
    }

    if (action==="update_student_pin"||action==="delete_student"||action==="modify_student") {
      const teacher = await verifyTeacher(teacher_id, session_token);
      if (!teacher) return res.status(401).json({error:"Unauthorized"});
      // Server-side permission enforcement
      const tPerms = Array.isArray(teacher.permissions) ? teacher.permissions : [];
      const hasPerms = tPerms.length > 0; // if empty array → legacy teacher, allow all
      if (hasPerms) {
        const PERM_MAP = {
          "update_student_pin": "change_student_pin",
          "delete_student":     "delete_student",
          "modify_student":     "modify_student",
        };
        const required = PERM_MAP[action];
        if (required && !tPerms.includes(required))
          return res.status(403).json({error:`Permission denied. Your account does not have '${required}' permission.`});
      }
      const {student_id} = req.body;
      if (!isUUID(student_id)) return res.status(400).json({error:"Invalid student_id"});

      if (action==="update_student_pin") {
        const {new_pin} = req.body;
        if (!new_pin) return res.status(400).json({error:"Missing pin"});
        const pin_hash = await hashPin(String(new_pin).slice(0,4));
        const r = await sb("students","PATCH",{pin_hash},`?id=eq.${student_id}&school_id=eq.${teacher.school_id}`);
        return res.status(200).json({ok:r.ok});
      }
      if (action==="delete_student") {
        await sb("student_progress","DELETE",null,`?student_id=eq.${student_id}`).catch(()=>{});
        const r = await sb("students","DELETE",null,`?id=eq.${student_id}&school_id=eq.${teacher.school_id}`);
        return res.status(200).json({ok:r.ok});
      }
      if (action==="modify_student") {
        const {name, roll_no, class_num, section, username} = req.body;
        const update = {};
        if (name)     update.name     = clean(name,50);
        if (roll_no)  update.roll_no  = clean(String(roll_no),10);
        if (class_num)update.class_num= cleanInt(class_num,0,7);
        if (section)  update.section  = clean(String(section),5).toUpperCase();
        if (username) update.username = clean(username,30).toLowerCase();
        const r = await sb("students","PATCH",update,`?id=eq.${student_id}&school_id=eq.${teacher.school_id}`);
        return res.status(200).json({ok:r.ok});
      }
    }
    return res.status(400).json({error:"Unknown action"});

  } catch(err) {
    console.error("[school API]", err.message);
    return res.status(500).json({error:"Server error"});
  }
}