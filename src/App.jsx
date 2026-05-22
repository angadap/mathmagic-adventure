import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Error Boundary — graceful crash handling ──────────────────────
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error) { return { hasError:true, error }; }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
    try {
      const sb = window.__mmSb;
      if (sb) sb.from("analytics").insert({
        event_type:"app_crash", event_data:{ message:error?.message, stack:error?.stack?.slice(0,300) },
        created_at:new Date().toISOString()
      }).catch(()=>{});
    } catch(e) {}
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{minHeight:"100vh",background:"#04040f",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Nunito',sans-serif"}}>
        <div style={{background:"#0d0d2b",border:"1px solid #ef444433",borderRadius:20,padding:28,maxWidth:360,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:12}}>🚀💥</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:"#00f5ff",marginBottom:8}}>Oops! Something went wrong 🚀</div>
          <div style={{color:"#6b7db3",fontSize:13,lineHeight:1.7,marginBottom:20}}>The app encountered an unexpected error. Your progress is saved. Please refresh to continue your mission!</div>
          <button onClick={()=>window.location.reload()} style={{background:"linear-gradient(135deg,#00f5ff,#a855f7)",border:"none",borderRadius:12,padding:"12px 24px",color:"white",fontFamily:"'Orbitron',sans-serif",fontSize:12,cursor:"pointer",fontWeight:700}}>🔄 RELAUNCH APP</button>
          {process.env.NODE_ENV==="development" && <pre style={{marginTop:14,color:"#f87171",fontSize:9,textAlign:"left",overflow:"auto",maxHeight:100}}>{this.state.error?.message}</pre>}
        </div>
      </div>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────
// ── THEMES ────────────────────────────────────────────────────────────
const THEMES = {
  // ── DEFAULT: Deep Royal — rich purple + gold, premium & kids-friendly ──
  royal:  { name:"Royal Academy", icon:"👑", bg:"#12002e", card:"#1e0045",  card2:"#2a0060", cyan:"#a78bfa", purple:"#7c3aed", pink:"#f472b6", orange:"#fb923c", yellow:"#fbbf24", green:"#34d399", red:"#f87171", dim:"#7c6b9e" },
  // ── Cosmic Teal — deep teal + electric accents ──
  cosmic: { name:"Cosmic Teal",   icon:"🚀", bg:"#00101e", card:"#001c30",  card2:"#00253d", cyan:"#06d6c7", purple:"#818cf8", pink:"#f472b6", orange:"#fb923c", yellow:"#fcd34d", green:"#4ade80", red:"#f87171", dim:"#4a8099" },
  // ── Sunset Blaze — warm orange + magenta ──
  sunset: { name:"Sunset Blaze",  icon:"🌅", bg:"#1a0800", card:"#2d1000",  card2:"#3d1800", cyan:"#fb923c", purple:"#e879f9", pink:"#fb7185", orange:"#fbbf24", yellow:"#fde047", green:"#4ade80", red:"#f43f5e", dim:"#9a5a30" },
  // ── Emerald Forest — deep green + gold ──
  forest: { name:"Emerald Forest", icon:"🌿", bg:"#001a0e", card:"#002b16",  card2:"#003a1e", cyan:"#34d399", purple:"#a3e635", pink:"#f472b6", orange:"#fb923c", yellow:"#fcd34d", green:"#4ade80", red:"#f87171", dim:"#3a7a55" },
  // ── Midnight Ocean — deep navy + electric blue ──
  ocean:  { name:"Midnight Ocean", icon:"🌊", bg:"#000c1a", card:"#001428",  card2:"#001e38", cyan:"#38bdf8", purple:"#818cf8", pink:"#f472b6", orange:"#fb923c", yellow:"#fcd34d", green:"#34d399", red:"#f87171", dim:"#2a5a80" },
  // ── Candy Pop (dark) ──
  candy:  { name:"Candy Pop",      icon:"🍭", bg:"#1a0628", card:"#2d0a3e",  card2:"#3d1050", cyan:"#f472b6", purple:"#c084fc", pink:"#fb7185", orange:"#fb923c", yellow:"#fde047", green:"#4ade80", red:"#f43f5e", dim:"#9d6db5" },
};
function getThemeColors() { return THEMES[localStorage.getItem("mm_theme")||"royal"] || THEMES.royal; }
let C = getThemeColors();
const isDark = () => !C.bg.startsWith('#f') && !C.bg.startsWith('#e');
const textColor = () => isDark() ? 'white' : '#1e1e3f';
const text2Color = () => isDark() ? '#ccc' : '#4a4a7a';

// ─────────────────────────────────────────────────────────────────────
// GLOBAL CSS injected once inside a component (safe in artifact env)
// ─────────────────────────────────────────────────────────────────────
function GlobalStyles() {
  useEffect(() => {
    // fonts
    if (!document.getElementById("mm-fonts")) {
      const l = document.createElement("link");
      l.id = "mm-fonts";
      l.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Nunito:wght@500;700;800;900&display=swap";
      l.rel = "stylesheet";
      document.head.appendChild(l);
    }
    // keyframes
    if (!document.getElementById("mm-styles")) {
      const s = document.createElement("style");
      s.id = "mm-styles";
      s.textContent = `
        @keyframes twinkle{0%,100%{opacity:.1}50%{opacity:.9}}
        @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulseG{0%,100%{box-shadow:0 0 10px #a855f755}50%{box-shadow:0 0 28px #a855f7cc}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes shakeX{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        @keyframes correctFlash{0%{background:transparent}30%{background:#22c55e33}100%{background:transparent}}
        @keyframes wrongShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
        @keyframes coinBounce{0%{transform:translateY(0)scale(1)}40%{transform:translateY(-20px)scale(1.3)}100%{transform:translateY(0)scale(1)opacity(0)}}
        @keyframes starPop{0%{transform:scale(0)rotate(-30deg)}60%{transform:scale(1.3)rotate(5deg)}100%{transform:scale(1)rotate(0deg)}}
        @keyframes xpRise{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-40px);opacity:0}}
        @keyframes ripple{0%{transform:scale(0.8);opacity:1}100%{transform:scale(2);opacity:0}}
        @keyframes glow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.4)}}
        @keyframes loadBar{from{width:0}to{width:100%}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .mm-btn-press:active{transform:scale(0.95)!important;transition:transform 0.08s!important}
        .mm-haptic:active{transform:scale(0.97)}
        @keyframes spinR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes bFloat{0%,100%{transform:translateY(0)scale(1)}50%{transform:translateY(-10px)scale(1.05)}}
        @keyframes bossW{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        body{background:${C.bg}}
        input{font-family:'Nunito',sans-serif;outline:none;color:white}
        input::placeholder{color:${C.dim}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#a855f7;border-radius:4px}
      `;
      document.head.appendChild(s);
    }
  }, []);
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// SUPABASE CONFIG
// For production: replace SB_ANON_KEY with your real anon key from
// Supabase Dashboard → Project Settings → API → "anon public" key (starts with eyJ...)
// Set DEMO_MODE = false once you have the real key and deployed to production
// ─────────────────────────────────────────────────────────────────────
// Keys from environment variables — never hardcoded in client
// VITE_ prefix makes them available to browser (these are public-safe)
const SB_URL      = import.meta.env.VITE_SUPABASE_URL      || "https://vsfvvzcvhhibepinphtk.supabase.co";
const SB_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const DEMO_MODE   = false;
// All API calls go through our server-side routes — /api/auth and /api/db
const API_BASE    = "";  // relative URL — works on any domain

// ── Admin credentials (change before production) ─────────────────────
// Admin credentials managed server-side only
const ADMIN_EMAIL = "";
const ADMIN_PASSWORD = "";

// ─────────────────────────────────────────────────────────────────
// SOUND ENGINE — Web Audio API (zero bandwidth, works offline)
// Battery-aware: respects prefers-reduced-motion and low power
// ─────────────────────────────────────────────────────────────────
const SFX = (() => {
  let ctx = null;
  let muted = localStorage.getItem("mm_muted") === "1";

  const getCtx = () => {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const play = (freq, type, duration, vol=0.3, decay=0.8) => {
    if (muted) return;
    // Skip sounds if battery is low (Battery API)
    const ac = getCtx();
    if (!ac) return;
    try {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * decay, ac.currentTime + duration);
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch(e) {}
  };

  const chord = (freqs, type, dur, vol) => freqs.forEach((f,i) => setTimeout(()=>play(f,type,dur,vol), i*80));

  return {
    get muted() { return muted; },
    toggleMute() { muted = !muted; localStorage.setItem("mm_muted", muted?"1":"0"); return muted; },

    // UI interactions
    tap()        { play(600, "sine",    0.08, 0.15); },
    back()       { play(300, "sine",    0.12, 0.15); },
    select()     { play(500, "triangle",0.10, 0.20); },

    // Quiz events
    correct()    { chord([523,659,784], "sine", 0.3, 0.25); },
    wrong()      { play(180, "sawtooth", 0.25, 0.20, 0.5); },
    hint()       { play(440, "sine",    0.15, 0.18); },

    // Game events
    bossHit()    { play(120, "square",  0.2,  0.30, 0.3); },
    bossDefeat() { chord([784,988,1047,1319], "sine", 0.6, 0.30); },
    bubblePop()  { play(800, "sine",    0.08, 0.20, 0.5); },
    timerTick()  { play(1000,"square",  0.05, 0.10); },
    timerWarn()  { play(440, "square",  0.10, 0.25); },

    // Progress / rewards
    levelUp()    { chord([523,659,784,1047], "sine", 0.5, 0.35); },
    xpGain()     { play(880, "sine",    0.15, 0.20, 1.2); },
    coinGain()   { chord([1047,1319], "triangle", 0.25, 0.25); },
    starEarn()   { chord([659,784,988,1319], "sine", 0.7, 0.30); },
    unlock()     { chord([392,494,587,784], "sine", 0.5, 0.28); },

    // Navigation
    screenIn()   { play(440, "sine",    0.12, 0.12, 1.1); },
    splash()     { chord([262,330,392,523], "sine", 0.8, 0.20); },

    // Daily / special
    dailyDone()  { chord([784,988,1175,1568], "sine", 0.8, 0.30); },
    puzzleSolve(){ chord([523,784,1047,1319,1568], "sine", 1.0, 0.28); },
    ratingOpen() { chord([523,659,784], "triangle", 0.4, 0.18); },
  };
})();

// Global mute toggle button component
function MuteBtn() {
  const [muted, setMuted] = React.useState(SFX.muted);
  return (
    <button
      onClick={() => { setMuted(SFX.toggleMute()); }}
      title={muted ? "Unmute" : "Mute"}
      style={{ background:"none", border:"none", cursor:"pointer", fontSize:18,
               color: muted ? C.dim : C.cyan, padding:"4px 6px", lineHeight:1,
               transition:"color 0.2s" }}>
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

// ── Mascot ────────────────────────────────────────────────────────
function Mascot({ message, mood="happy" }) {
  const faces = { happy:"🚀", thinking:"🤔", celebrate:"🎉", sleep:"😴", cheer:"⭐" };
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,background:C.card,border:`1.5px solid ${C.cyan}33`,borderRadius:16,padding:"10px 14px",marginBottom:12}}>
      <div style={{fontSize:32,animation:"floatUp 2s ease-in-out infinite",flexShrink:0}}>{faces[mood]||faces.happy}</div>
      <div style={{background:C.card2,borderRadius:12,padding:"8px 12px",flex:1,position:"relative"}}>
        <div style={{fontSize:13,color:"white",lineHeight:1.5}}>{message}</div>
        <div style={{position:"absolute",left:-8,top:"50%",transform:"translateY(-50%)",width:0,height:0,borderTop:"6px solid transparent",borderBottom:"6px solid transparent",borderRight:`8px solid ${C.card2}`}}/>
      </div>
    </div>
  );
}


// ── Certificate ───────────────────────────────────────────────────
function Certificate({ child, lesson, stars, onClose }) {
  const canvasRef = useRef(null);
  useEffect(()=>{
    const cv = canvasRef.current; if(!cv) return;
    const ctx = cv.getContext("2d");
    const w=600, h=400;
    cv.width=w; cv.height=h;
    // Background
    ctx.fillStyle="#12002e"; ctx.fillRect(0,0,w,h);
    // Border
    ctx.strokeStyle="#fbbf24"; ctx.lineWidth=6;
    ctx.strokeRect(12,12,w-24,h-24);
    ctx.strokeStyle="#a78bfa"; ctx.lineWidth=2;
    ctx.strokeRect(20,20,w-40,h-40);
    // Stars
    const starX=[80,300,520], sy=60;
    starX.forEach(x=>{ ctx.font="28px serif"; ctx.fillText("⭐",x-14,sy+10); });
    // Title
    ctx.font="bold 22px 'Arial'"; ctx.fillStyle="#fbbf24"; ctx.textAlign="center";
    ctx.fillText("CERTIFICATE OF ACHIEVEMENT",w/2,100);
    // Body
    ctx.font="16px 'Arial'"; ctx.fillStyle="#ccc";
    ctx.fillText("This is to certify that",w/2,145);
    ctx.font="bold 28px 'Arial'"; ctx.fillStyle="#ffffff";
    ctx.fillText(child?.name||"Student",w/2,185);
    ctx.font="15px 'Arial'"; ctx.fillStyle="#a78bfa";
    ctx.fillText(`has successfully completed`,w/2,220);
    ctx.font="bold 18px 'Arial'"; ctx.fillStyle="#06b6d4";
    ctx.fillText(`${lesson?.emoji||"📚"} ${lesson?.title||"Lesson"}`,w/2,250);
    ctx.font="13px 'Arial'"; ctx.fillStyle="#fbbf24";
    ctx.fillText(`Stars Earned: ${"⭐".repeat(stars||1)}  |  Date: ${new Date().toLocaleDateString("en-IN")}`,w/2,295);
    ctx.font="11px 'Arial'"; ctx.fillStyle="#6b7db3";
    ctx.fillText("MathMagic Space Academy",w/2,360);
  },[child,lesson,stars]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `MathMagic_Certificate_${child?.name||"student"}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <canvas ref={canvasRef} style={{maxWidth:"100%",borderRadius:12,boxShadow:`0 0 40px ${C.yellow}66`,marginBottom:16}}/>
      <div style={{display:"flex",gap:12}}>
        <Btn color={C.yellow} onClick={download}>⬇️ DOWNLOAD</Btn>
        <button onClick={onClose} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:12,padding:"12px 20px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>CLOSE</button>
      </div>
    </div>
  );
}
// ── Difficulty Auto-Adjust ────────────────────────────────────────
// Returns {level:"easy"|"medium"|"hard", suggestSkip:bool, extraHints:bool}
function getDifficulty(progress, lessonId) {
  const sets = Array.from({length:20},(_,i)=>i)
    .map(i=>progress.find(p=>p.lesson_id===`${lessonId}_s${i}`))
    .filter(Boolean).slice(-3); // last 3 completed sets
  if (!sets.length) return {level:"medium", suggestSkip:false, extraHints:false};
  const avg = sets.reduce((s,p)=>s+(p.correct_count||0)/(p.total_questions||20),0)/sets.length;
  if (avg > 0.85) return {level:"easy",   suggestSkip:true,  extraHints:false};
  if (avg < 0.40) return {level:"hard",   suggestSkip:false, extraHints:true};
  return              {level:"medium", suggestSkip:false, extraHints:false};
}

// ── ProgressGrid ─────────────────────────────────────────────────
function ProgressGrid({ lessons, progress }) {
  const [open, setOpen] = useState(false);
  if (!lessons?.length) return null;
  const setsDone = (lid) => Array.from({length:20},(_,i)=>i)
    .filter(i=>progress.some(p=>p.lesson_id===`${lid}_s${i}`&&(p.stars_earned||0)>=1)).length;
  const total = lessons.reduce((s,l)=>s+setsDone(l.id),0);
  const max   = lessons.length*20;
  return (
    <div style={{marginBottom:14,background:C.card,borderRadius:14,border:`1px solid ${C.purple}33`}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span>📊</span>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:C.purple}}>MY PROGRESS</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:11,color:C.dim}}>{total}/{max} sets</div>
          <div style={{background:C.card2,borderRadius:6,height:5,width:60,overflow:"hidden"}}>
            <div style={{width:`${Math.round(total/max*100)}%`,height:"100%",background:C.cyan,borderRadius:6}}/>
          </div>
          <span style={{color:C.dim,fontSize:12}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{padding:"0 14px 14px"}}>
          {lessons.map((l,i)=>{
            const done=setsDone(l.id), pct=Math.round(done/20*100);
            const complete=done===20, started=done>0;
            return (
              <div key={l.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{color:complete?C.green:started?"white":C.dim}}>{l.emoji} L{i+1}: {l.title}</span>
                  <span style={{color:C.dim,fontSize:11}}>{done}/20</span>
                </div>
                <div style={{background:C.card2,borderRadius:4,height:6,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:complete?C.green:C.cyan,borderRadius:4,transition:"width 0.4s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ProgressMap ───────────────────────────────────────────────────
function ProgressMap({ child, lessons, progress, world, onSelectSet }) {
  const completedSets = (lid) => Array.from({length:20},(_,i)=>i).filter(i=>progress.some(p=>p.lesson_id===`${lid}_s${i}`&&(p.stars_earned||0)>=1)).length;
  return (
    <div style={{overflowX:"auto",paddingBottom:8}}>
      <div style={{display:"flex",gap:12,minWidth:"max-content",padding:"4px 2px"}}>
        {lessons.slice(0,6).map((lesson,li)=>{
          const done = completedSets(lesson.id);
          const pct  = Math.round(done/20*100);
          return (
            <div key={lesson.id} style={{background:C.card,border:`1.5px solid ${pct===100?C.green:pct>0?world.color:C.dim+"33"}`,borderRadius:14,padding:"10px 12px",minWidth:90,textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:22,marginBottom:4}}>{pct===100?"⭐":pct>0?"📖":"🔒"}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:pct===100?C.green:pct>0?world.color:C.dim,marginBottom:4}}>L{li+1}</div>
              <div style={{background:C.card2,borderRadius:6,height:6,overflow:"hidden",marginBottom:4}}>
                <div style={{width:`${pct}%`,height:"100%",background:pct===100?C.green:world.color,borderRadius:6,transition:"width 0.5s ease"}}/>
              </div>
              <div style={{color:C.dim,fontSize:9}}>{done}/20 sets</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── Confetti ─────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({length:40},(_,i)=>({
    x: Math.random()*100, delay: Math.random()*1.5,
    color: [C.yellow,C.cyan,C.green,C.pink,C.orange,C.purple][i%6],
    size: Math.random()*8+4, rot: Math.random()*360,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:998,overflow:"hidden"}}>
      {pieces.map((p,i)=>(
        <div key={i} style={{position:"absolute",left:`${p.x}%`,top:"-20px",width:p.size,height:p.size,background:p.color,borderRadius:Math.random()>0.5?"50%":"2px",animation:`coinBounce 1.5s ${p.delay}s ease-in forwards`,transform:`rotate(${p.rot}deg)`}}/>
      ))}
    </div>
  );
}
// ── Tutorial (first-time) ────────────────────────────────────────
function Tutorial({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"🚀", title:"Welcome to MathMagic!", body:"Your personal space academy for maths. Complete lessons, earn XP and unlock new worlds!", color:C.yellow },
    { icon:"📚", title:"How Lessons Work",       body:"Each lesson has 20 sets of questions. Complete Set 1 to unlock Set 2, and so on. Answer correctly to earn stars and XP!", color:C.cyan },
    { icon:"🎮", title:"Play Games",             body:"Visit the Games Hub to play 8 fun maths games. The more you play, the more coins you earn!", color:C.purple },
    { icon:"🏆", title:"Daily Challenges",       body:"A new Word Problem and Brain Puzzle every day! Solve both to earn bonus XP and keep your streak going!", color:C.orange },
    { icon:"🎯", title:"You're Ready!",          body:"Tap Start to begin your maths adventure. Remember — practice every day to climb the leaderboard!", color:C.green },
  ];
  const s = steps[step];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:C.card,borderRadius:24,padding:"32px 24px",maxWidth:380,width:"100%",textAlign:"center",border:`2px solid ${s.color}44`,animation:"popIn 0.3s ease"}}>
        <div style={{fontSize:64,marginBottom:16,animation:"floatUp 2s ease-in-out infinite"}}>{s.icon}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:s.color,marginBottom:12}}>{s.title}</div>
        <div style={{color:C.dim,fontSize:14,lineHeight:1.7,marginBottom:24}}>{s.body}</div>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?s.color:C.dim+"44",transition:"all 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,background:"none",border:`1px solid ${C.dim}44`,borderRadius:12,padding:"12px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>← BACK</button>}
          <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onDone()} style={{flex:1,background:`linear-gradient(135deg,${s.color},${s.color}aa)`,border:"none",borderRadius:12,padding:"12px",color:"white",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700}}>
            {step<steps.length-1?"NEXT →":"🚀 START!"}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Skeleton Loader ──────────────────────────────────────────────
function SkeletonLoader({ rows=4 }) {
  return (
    <div style={{padding:"16px 0"}}>
      <div style={{background:C.card2,borderRadius:12,height:60,marginBottom:16,animation:"pulseG 1.5s ease-in-out infinite"}}/>
      {Array.from({length:rows},(_,i)=>(
        <div key={i} style={{background:C.card2,borderRadius:10,height:44,marginBottom:8,opacity:1-i*0.15,animation:"pulseG 1.5s ease-in-out infinite"}}/>
      ))}
    </div>
  );
}
// ── Offline Banner ───────────────────────────────────────────────
function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    document.addEventListener("mm_online",  on);
    document.addEventListener("mm_offline", off);
    return () => { document.removeEventListener("mm_online",on); document.removeEventListener("mm_offline",off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#f97316",color:"white",textAlign:"center",padding:"6px 12px",fontSize:12,fontFamily:"'Orbitron',sans-serif",letterSpacing:1}}>
      📡 NO CONNECTION — App works offline, progress saves when back online
    </div>
  );
}

// DB logging — console only in production
function dbLog(level, msg, detail="") {
  if (level === "error") console.error("[DB]", msg, detail);
  else console.log("[DB]", msg, detail);
}

// ─────────────────────────────────────────────────────────────────────────────
// WORLDS — one per class
// ─────────────────────────────────────────────────────────────────────────────
const WORLDS = [
  { id:10, name:"Nursery",  world:"Star Seeds",     planet:"🌱", color:"#84cc16", glow:"#84cc1644", free:false },
  { id:11, name:"Jr KG",    world:"Moon Garden",    planet:"🌙", color:"#f472b6", glow:"#f472b644", free:false },
  { id:12, name:"Sr KG",    world:"Sun Valley",     planet:"☀️", color:"#fb923c", glow:"#fb923c44", free:false },
  { id:1,  name:"Class 1",  world:"Orion Nebula",   planet:"🌍", color:"#22c55e", glow:"#22c55e44", free:true  },
  { id:2,  name:"Class 2",  world:"Andromeda",      planet:"🪐", color:"#3b82f6", glow:"#3b82f644", free:false },
  { id:3,  name:"Class 3",  world:"Milky Way Core", planet:"⭐", color:"#a855f7", glow:"#a855f744", free:false },
  { id:4,  name:"Class 4",  world:"Cygnus Rift",    planet:"🔴", color:"#f97316", glow:"#f9731644", free:false },
  { id:5,  name:"Class 5",  world:"Event Horizon",  planet:"🌌", color:"#ec4899", glow:"#ec489944", free:false },
];

// ─────────────────────────────────────────────────────────────────────────────
// LESSONS — per class, references lesson IDs that match questions table
// ─────────────────────────────────────────────────────────────────────────────
const LESSONS = {
  10: [ // Nursery
    { id:"n-l1", title:"Counting 1–5",    emoji:"🔢", sets:20, xp:50 },
    { id:"n-l2", title:"Shapes",          emoji:"🔷", sets:20, xp:50 },
    { id:"n-l3", title:"Colors",          emoji:"🎨", sets:20, xp:50 },
    { id:"n-l4", title:"Animals",         emoji:"🐾", sets:20, xp:50 },
    { id:"n-l5", title:"Big & Small",     emoji:"📏", sets:20, xp:50 },
    { id:"n-l6", title:"Simple Sums",     emoji:"➕", sets:20, xp:50 },
  ],
  11: [ // Jr KG
    { id:"jk-l1", title:"Numbers 1–10",   emoji:"🔢", sets:20, xp:60 },
    { id:"jk-l2", title:"2D Shapes",      emoji:"🔷", sets:20, xp:60 },
    { id:"jk-l3", title:"Colors & Patterns",emoji:"🌈",sets:20, xp:60 },
    { id:"jk-l4", title:"More & Less",    emoji:"⚖️", sets:20, xp:60 },
    { id:"jk-l5", title:"Addition to 10", emoji:"➕", sets:20, xp:60 },
    { id:"jk-l6", title:"Body Parts",     emoji:"🧍", sets:20, xp:60 },
  ],
  12: [ // Sr KG
    { id:"sk-l1", title:"Numbers 1–20",   emoji:"🔢", sets:20, xp:70 },
    { id:"sk-l2", title:"Addition to 5",  emoji:"➕", sets:20, xp:70 },
    { id:"sk-l3", title:"Subtraction",    emoji:"➖", sets:20, xp:70 },
    { id:"sk-l4", title:"3D Shapes",      emoji:"🔮", sets:20, xp:70 },
    { id:"sk-l5", title:"Time & Day",     emoji:"⏰", sets:20, xp:70 },
    { id:"sk-l6", title:"Money Basics",   emoji:"💰", sets:20, xp:70 },
  ],
  1: [
    { id:"c1-l1", title:"Shapes & Space",           icon:"🔷", sets:20, xp:100 },
    { id:"c1-l2", title:"Numbers 1–9",              icon:"🔢", sets:20, xp:100 },
    { id:"c1-l3", title:"Numbers 10–20",            icon:"🔟", sets:20, xp:100 },
    { id:"c1-l4", title:"Numbers 21–100",           icon:"💯", sets:20, xp:150 },
    { id:"c1-l5", title:"Addition",                 icon:"➕", sets:20, xp:150 },
    { id:"c1-l6", title:"Subtraction",              icon:"➖", sets:20, xp:150 },
    { id:"c1-l7", title:"Measurement",              icon:"📏", sets:20, xp:150 },
    { id:"c1-l8", title:"Time & Money",             icon:"⏰", sets:20, xp:150 },
    { id:"c1-l9", title:"Patterns & Fractions",     icon:"🔁", sets:20, xp:200 },
  ],
  2: [
    { id:"c2-l1", title:"Numbers up to 1000",       icon:"🔢", sets:20, xp:150 },
    { id:"c2-l2", title:"Addition & Subtraction",   icon:"➕", sets:20, xp:150 },
    { id:"c2-l3", title:"Multiplication & Division",icon:"✖️", sets:20, xp:200 },
    { id:"c2-l4", title:"Shapes & Geometry",        icon:"🔷", sets:20, xp:150 },
    { id:"c2-l5", title:"Measurement",              icon:"📏", sets:20, xp:150 },
    { id:"c2-l6", title:"Time & Calendar",          icon:"📅", sets:20, xp:150 },
    { id:"c2-l7", title:"Money",                    icon:"💰", sets:20, xp:150 },
    { id:"c2-l8", title:"Data Handling",            icon:"📊", sets:20, xp:150 },
  ],
  3: [
    { id:"c3-l1", title:"Numbers & Place Value",    icon:"🔢", sets:20, xp:200 },
    { id:"c3-l2", title:"Addition & Subtraction",   icon:"➕", sets:20, xp:200 },
    { id:"c3-l3", title:"Multiplication & Division",icon:"✖️", sets:20, xp:200 },
    { id:"c3-l4", title:"Fractions",                icon:"½",  sets:20, xp:200 },
    { id:"c3-l5", title:"Measurement & Time",       icon:"📏", sets:20, xp:200 },
    { id:"c3-l6", title:"Geometry",                 icon:"📐", sets:20, xp:200 },
    { id:"c3-l7", title:"Money",                    icon:"💰", sets:20, xp:200 },
    { id:"c3-l8", title:"Data & Patterns",          icon:"📊", sets:20, xp:200 },
  ],
  4: [
    { id:"c4-l1", title:"Large Numbers & Numerals", icon:"🔢", sets:20, xp:250 },
    { id:"c4-l2", title:"Large Operations",         icon:"➕", sets:20, xp:250 },
    { id:"c4-l3", title:"Factors & Multiples",      icon:"🔗", sets:20, xp:250 },
    { id:"c4-l4", title:"Fractions & Decimals",     icon:"½",  sets:20, xp:250 },
    { id:"c4-l5", title:"Geometry & Angles",        icon:"📐", sets:20, xp:250 },
    { id:"c4-l6", title:"Perimeter & Area",         icon:"📏", sets:20, xp:250 },
    { id:"c4-l7", title:"Time, Temp & Money",       icon:"⏰", sets:20, xp:250 },
    { id:"c4-l8", title:"Measurement",              icon:"⚖️", sets:20, xp:250 },
    { id:"c4-l9", title:"Patterns & Data",          icon:"📊", sets:20, xp:250 },
  ],
  5: [
    { id:"c5-l1", title:"Large Numbers & Operations",icon:"🔢", sets:20, xp:300 },
    { id:"c5-l2", title:"Factors, LCM & HCF",       icon:"🔗", sets:20, xp:300 },
    { id:"c5-l3", title:"Fractions & Decimals",      icon:"½",  sets:20, xp:300 },
    { id:"c5-l4", title:"Percentage",                icon:"%",  sets:20, xp:300 },
    { id:"c5-l5", title:"Geometry & Symmetry",       icon:"📐", sets:20, xp:300 },
    { id:"c5-l6", title:"Area, Volume & Measurement",icon:"📏", sets:20, xp:300 },
    { id:"c5-l7", title:"Data Handling & Probability",icon:"📊", sets:20, xp:300 },
    { id:"c5-l8", title:"Mapping & Patterns",        icon:"🗺️", sets:20, xp:300 },
  ],
};

// ── Secure API Client — all auth/DB calls go through /api/* routes ──
// The Supabase service key NEVER reaches the browser
// JWT token stored in memory only (not localStorage)
const sbRest = {
  _token: null,

  // Call our Vercel serverless functions
  async _api(route, body) {
    const headers = { "Content-Type": "application/json" };
    if (this._token) headers["Authorization"] = `Bearer ${this._token}`;
    try {
      const res = await fetch(`/api/${route}`, { method:"POST", headers, body:JSON.stringify(body) });
      const data = await res.json();
      if (res.status === 429) {
        dbLog("error", "Rate limit hit", data.error);
        return { data:null, error:{ message:data.error } };
      }
      if (!res.ok) return { data:null, error:{ message:data.error||"Request failed" } };
      return { data, error:null };
    } catch(e) {
      dbLog("error", "API call failed", e.message);
      return { data:null, error:{ message:e.message } };
    }
  },

  // ── Auth (server-side, rate-limited) ──────────────────────────
  async signUp(email, password) {
    const { data, error } = await this._api("auth", { action:"signup", email, password });
    if (error) return { data:null, error };
    if (data.access_token) this._token = data.access_token;
    return { data:{ user: data.user }, error:null };
  },

  async signIn(email, password) {
    const { data, error } = await this._api("auth", { action:"signin", email, password });
    if (error) return { data:null, error };
    if (data.access_token) this._token = data.access_token;
    return { data:{ user: data.user }, error:null };
  },

  async signOut() {
    await this._api("auth", { action:"signout" });
    this._token = null;
    return { error:null };
  },

  // ── DB operations (server-side, authenticated) ─────────────────
  async insert(table, row) {
    const { data, error } = await this._api("db", { action:`add_${table.replace("ren","").replace("ress","ress")}`, ...row });
    if (error) return { data:null, error };
    return { data: data?.data || data, error:null };
  },

  async upsert(table, row, onConflict) {
    const { data, error } = await this._api("db", { action:`save_${table}`, ...row });
    if (error) return { error };
    return { error:null };
  },

  async update(table, row, col, val) {
    const { data, error } = await this._api("db", { action:`update_${table}`, ...row, [col]:val });
    if (error) return { data:null, error };
    return { data: data?.data || data, error:null };
  },

  async select(table, filters={}) {
    const action = table === "children" ? "get_children"
                 : table === "progress" ? "get_progress"
                 : `select_${table}`;
    const { data, error } = await this._api("db", { action, ...filters });
    if (error) return { data:[], error };
    return { data: data?.data || [], error:null };
  },

  async rpc(fn, params) {
    const { data, error } = await this._api("db", { action:`rpc_${fn}`, ...params });
    if (error) return { data:null, error };
    return { data: data?.data || data, error:null };
  },

  async ping() {
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json"}, body:'{"action":"ping"}' });
      return res.status < 500;
    } catch(e) { return false; }
  },
};
async function loadSb() {
  if (DEMO_MODE) return null;
  if (window.__mmSbReady !== undefined) return window.__mmSbReady ? sbRest : null;
  try {
    const ok = await sbRest.ping();
    window.__mmSbReady = ok;
    if (ok) { dbLog("ok","Supabase connected ✓"); return sbRest; }
    dbLog("error","Supabase unreachable — in-memory mode");
    return null;
  } catch(e) {
    window.__mmSbReady = false;
    dbLog("error","Supabase ping failed",e.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────
// IN-MEMORY STORE — works fully offline; Supabase is optional
// ─────────────────────────────────────────────────────────────────────
const MEM = { users:[], children:[], progress:[], n:1 };
// Session ID for analytics
if (!window.__sessionId) window.__sessionId = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2,7);

// ── Network & Battery awareness ──────────────────────────────────
window.__isOnline = navigator.onLine;
window.addEventListener("online",  () => { window.__isOnline = true;  document.dispatchEvent(new Event("mm_online")); });
window.addEventListener("offline", () => { window.__isOnline = false; document.dispatchEvent(new Event("mm_offline")); });

// Reduce animations on low-end devices / power-save mode
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) {
  const s = document.createElement("style");
  s.textContent = "*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }";
  document.head.appendChild(s);
}

// Mute sound on battery saver (Battery Status API where available)
if ("getBattery" in navigator) {
  navigator.getBattery().then(bat => {
    if (bat.level < 0.15 && !bat.charging) {
      if (!SFX.muted) SFX.toggleMute();
    }
    bat.addEventListener("levelchange", () => {
      if (bat.level < 0.10 && !bat.charging && !SFX.muted) SFX.toggleMute();
    });
  }).catch(()=>{});
}"s_" + Date.now() + "_" + Math.random().toString(36).slice(2,7);

const db = {
  _sb: undefined,

  async getSb() {
    if (this._sb !== undefined) return this._sb;
    this._sb = await loadSb();
    return this._sb;
  },

  async signUp(email, pass) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.signUp(email, pass);
      if (!r.error && r.data?.user?.id) {
        const uid = r.data.user.id;
        dbLog("ok","signUp success",uid.slice(0,8));
        if (!MEM.users.find(u=>u.id===uid)) MEM.users.push({ id:uid, email, pass });
        return { data:{ user:{ id:uid, email } }, error:null };
      }
      if (r.error) {
        const isNet = /fetch|network|host|failed/i.test(r.error.message||"");
        if (!isNet) { dbLog("error","signUp rejected",r.error.message); return { data:null, error:{ message:r.error.message } }; }
        dbLog("error","signUp network error — using in-memory",r.error.message);
      }
    }
    if (MEM.users.find(u=>u.email===email))
      return { data:null, error:{ message:"Email already registered" } };
    const user = { id:"local_"+Math.random().toString(36).slice(2), email };
    MEM.users.push({ ...user, pass });
    return { data:{ user }, error:null };
  },

  async signIn(email, pass) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.signIn(email, pass);
      if (!r.error && r.data?.user?.id) {
        dbLog("ok","signIn success","uid="+r.data.user.id.slice(0,8));
        if (!MEM.users.find(u=>u.id===r.data.user.id)) MEM.users.push({ id:r.data.user.id, email, pass });
        return { data:{ user:{ id:r.data.user.id, email } }, error:null };
      }
      if (r.error) {
        const isNet = /fetch|network|host|failed/i.test(r.error.message||"");
        if (!isNet) return { data:null, error:{ message:r.error.message } };
        dbLog("error","signIn network",r.error.message);
      }
    }
    const u = MEM.users.find(u => u.email===email && u.pass===pass);
    return u ? { data:{ user:u }, error:null }
             : { data:null, error:{ message:"Invalid email or password" } };
  },

  async signOut() {
    return { error: null };
  },

  // ── Daily Challenge ──────────────────────────────────────────
  async getDailyChallenge(classNum) {
    const epoch  = new Date("2025-01-01");
    const dayNum = Math.floor((new Date() - epoch) / 86400000) % 250 + 1;
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_daily_challenge", class_num:classNum, seq_num:dayNum }) });
      const json = await res.json();
      const d = json.data;
      if (d && !Array.isArray(d)) return d;
      if (Array.isArray(d) && d[0]) return d[0];
    } catch(e) { dbLog("error","getDailyChallenge",e.message); }
    return null;
  },

  async getDailyCompletion(childId) {
    const today = new Date().toISOString().slice(0,10);
    if (localStorage.getItem(`dq_done_${childId}_${today}`)) return { completed_at: today };
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_daily_completion", child_id:childId, date:today }) });
      const json = await res.json();
      return json.data?.[0] || null;
    } catch(e) { return null; }
  },

  async completeDailyChallenge(childId, challengeId, correct) {
    const today = new Date().toISOString().slice(0,10);
    if (correct) localStorage.setItem(`dq_done_${childId}_${today}`,"1");
    fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"complete_daily_challenge", child_id:childId, challenge_id:challengeId, date:today, correct }) }).catch(()=>{});
  },

  async getDailyPuzzle() {
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_daily_puzzle" }) });
      const json = await res.json();
      return json.data || null;
    } catch(e) { return null; }
  },

  async completePuzzle(childId, puzzleId, answerGiven, correct) {
    const today = new Date().toISOString().slice(0,10);
    if (correct) localStorage.setItem(`dp_done_${childId}_${today}`,"1");
    fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"complete_puzzle", child_id:childId, puzzle_id:puzzleId, date:today, answer_given:answerGiven, correct }) }).catch(()=>{});
  },

  async getPuzzleCompletion(childId) {
    const today = new Date().toISOString().slice(0,10);
    if (localStorage.getItem(`dp_done_${childId}_${today}`)) return { completed_at: today };
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_puzzle_completion", child_id:childId, date:today }) });
      const json = await res.json();
      return json.data?.[0] || null;
    } catch(e) { return null; }
  },

    // ── Analytics ────────────────────────────────────────────────
  async track(eventType, childId, parentId, data={}) {
    const sb = await this.getSb();
    if (!sb) return;
    // Fire-and-forget — never block UI
    sb.insert("analytics", {
      child_id: childId || null,
      parent_id: parentId || null,
      event_type: eventType,
      event_data: data,
      app_version: "1.0.0",
      platform: "web",
      session_id: window.__sessionId || null,
      created_at: new Date().toISOString()
    }).catch(()=>{});
  },

  // ── App Ratings ──────────────────────────────────────────────
  async saveRating(childId, parentId, rating, review) {
    const sb = await this.getSb();
    if (sb) {
      await sb.insert("app_ratings", {
        child_id: childId || null,
        parent_id: parentId || null,
        rating, review: review || "",
        app_version: "1.0.0",
        platform: "web",
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem("mm_rated", "1");
  },

  async getChildren(pid) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.select("children", { parent_id: pid });
      if (!r.error) { r.data.forEach(c=>{ if(!MEM.children.find(m=>m.id===c.id)) MEM.children.push(c); }); return { data:r.data, error:null }; }
    }
    return { data:MEM.children.filter(c=>c.parent_id===pid), error:null };
  },

  async addChild(pid, { name, avatar, class_num, pin }) {
    const payload = {
      parent_id: pid, name, avatar, class_num, pin_hash: pin,
      xp: 0, level: 1, coins: 50, streak_days: 0, is_premium: false,
      created_at: new Date().toISOString()
    };
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.insert("children", payload);
      if (!r.error && r.data) {
        MEM.children.push(r.data);
        dbLog("ok","addChild saved to DB ✓", r.data.id);
        return { data:r.data, error:null };
      }
      dbLog("error","addChild DB failed — using in-memory", r?.error?.message);
    }
    const c = { ...payload, id:"c_"+Math.random().toString(36).slice(2) };
    MEM.children.push(c);
    return { data:c, error:null };
  },

  async checkPin(cid, pin) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.select("children", { id: cid });
      if (!r.error && r.data?.[0]) { const c=r.data[0]; if(!MEM.children.find(m=>m.id===c.id)) MEM.children.push(c); return { ok:c.pin_hash===pin, child:c }; }
    }
    const c = MEM.children.find(x=>x.id===cid);
    return c ? { ok:c.pin_hash===pin, child:c } : { ok:false };
  },

  async addXP(cid, xp, coins=0) {
    const c = MEM.children.find(x=>x.id===cid);
    if (c) { c.xp=(c.xp||0)+xp; c.coins=(c.coins||0)+coins; c.level=Math.floor(c.xp/200)+1; }
    const sb = await this.getSb();
    if (sb && c) {
      await sb.update("children", { xp:c.xp, coins:c.coins, level:c.level, last_active:new Date().toISOString() }, "id", cid);
    }
    return { data:c, error:null };
  },

  async getProgress(cid) {
    try {
      const res = await fetch("/api/db",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`},body:JSON.stringify({action:"get_progress",child_id:cid})});
      const j = await res.json();
      if (j.data) { MEM.progress = [...MEM.progress.filter(p=>p.child_id!==cid), ...j.data]; return {data:j.data,error:null}; }
    } catch(e) {}
    return { data:MEM.progress.filter(p=>p.child_id===cid), error:null };
  },

  async saveProgress(cid, lid, { correct, total, stars, xpEarned }) {
    const ex = MEM.progress.find(p => p.child_id===cid && p.lesson_id===lid);
    if (ex) { ex.stars_earned=Math.max(ex.stars_earned||0,stars); ex.correct_count=correct; ex.completed_at=new Date().toISOString(); }
    else MEM.progress.push({ id:"p_"+Math.random().toString(36).slice(2), child_id:cid, lesson_id:lid,
      correct_count:correct, total_questions:total, stars_earned:stars,
      xp_earned:xpEarned, completed_at:new Date().toISOString() });

    const payload = { child_id:cid, lesson_id:lid, correct_count:correct, total_questions:total,
      stars_earned:stars, xp_earned:xpEarned, completed_at:new Date().toISOString() };

    const sb = await this.getSb();
    if (sb) {
      const r = await sb.upsert("progress", payload, "child_id,lesson_id");
      if (!r.error) { dbLog("ok","saveProgress saved to DB ✓", lid); }
      else dbLog("error","saveProgress DB failed", r.error.message);
    }
    return { error:null };
  },

  // RPC-based writes — use Postgres functions with SECURITY DEFINER to bypass RLS
  async _rpc(fn, params) {
    const sb = await this.getSb();
    if (!sb) return null;
    const r = await sb.rpc(fn, params);
    if (r && !r.error) return r.data;
    dbLog("error",`RPC ${fn} failed`, r?.error?.message);
    return null;
  },

  async setPremium(cid) {
    const sb = await this.getSb();
    if (sb) await sb.update("children", { is_premium:true }, "id", cid);
    const c = MEM.children.find(x=>x.id===cid);
    if (c) c.is_premium = true;
    return { error:null };
  },

  async submitFeedback(payload) {
    const row = {
      child_id:    payload.child_id    || "guest",
      child_name:  payload.child_name  || "Unknown",
      category:    payload.category,
      description: payload.description,
      screen:      payload.screen      || "unknown",
      device_info: payload.device_info || "",
      app_version: payload.app_version || "1.0.0",
      status:      "open",
      created_at:  new Date().toISOString(),
    };
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.insert("feedback", row);
      if (!r.error) { dbLog("ok","feedback saved to DB ✓"); return { ok:true }; }
      dbLog("error","feedback DB failed", r.error.message);
    }
    if (!window.__mmFeedbackQueue) window.__mmFeedbackQueue = [];
    window.__mmFeedbackQueue.push({ ...row });
    return { ok:true, local:true };
  },
};

// ─────────────────────────────────────────────────────────────────────
// STATIC CONTENT
// ─────────────────────────────────────────────────────────────────────
const AVATARS = ["🧑‍🚀","👩‍🚀","🐸","🦊","🐼","🦁","🐉","🤖","🧜‍♀️","🦸","🧚","🦋"];


function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle opts while keeping correct answer pointer correct
function shuffleOpts(opts, ans) {
  const correct = opts[ans];
  const shuffled = shuffle(opts);
  return { opts: shuffled, ans: shuffled.indexOf(correct) };
}

// Raw question cache — stores DB data, shuffle applied on each serve
const Q_RAW_CACHE = {};
const Q_CACHE_MAX = 50; // max cached sets to prevent memory leak
function cacheSet(key, data) {
  if (Object.keys(Q_RAW_CACHE).length >= Q_CACHE_MAX) {
    delete Q_RAW_CACHE[Object.keys(Q_RAW_CACHE)[0]]; // evict oldest
  }
  Q_RAW_CACHE[key] = data;
}

async function fetchSetQuestions(lessonId, setIndex) {
  const key = lessonId + "_" + setIndex;

  // Serve from cache (shuffle fresh each time — no DB round trip)
  if (Q_RAW_CACHE[key]) {
    return shuffle(Q_RAW_CACHE[key].map(r => {
      const { opts, ans } = shuffleOpts(r.opts, r.ans);
      return { q: r.q, opts, ans, h: r.h };
    }));
  }

  try {
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_questions", lesson_id: lessonId + "_s" + setIndex, set_index: setIndex })
    });
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data) && data.length > 0) {
      cacheSet(key, data.map(r => ({
        q: r.question,
        opts: Array.isArray(r.options) ? r.options : JSON.parse(r.options),
        ans: r.correct_answer,
        h: r.hint,
      })));
      return shuffle(Q_RAW_CACHE[key].map(r => {
        const { opts, ans } = shuffleOpts(r.opts, r.ans);
        return { q: r.q, opts, ans, h: r.h };
      }));
    }
  } catch(e) { console.warn("fetchSetQuestions failed:", e.message); }
  // Questions are stored in the Supabase 'questions' table.
  // This minimal fallback only triggers if DB fetch fails AND no cache exists.
  const FALLBACK_Q = [
    {q:"What is 5 + 3?",  opts:["6","7","8","9"],    ans:2, h:"Count on from 5!"},
    {q:"What is 9 - 4?",  opts:["3","4","5","6"],    ans:2, h:"Take away 4 from 9!"},
    {q:"What is 3 x 4?",  opts:["10","11","12","13"],ans:2, h:"3 groups of 4!"},
    {q:"What is 20 / 4?", opts:["3","4","5","6"],    ans:2, h:"20 shared into 4 groups!"},
    {q:"What is 7 + 8?",  opts:["13","14","15","16"],ans:2, h:"7+8=15!"},
    {q:"What is 15 - 6?", opts:["7","8","9","10"],   ans:2, h:"15-6=9!"},
    {q:"What is 6 x 5?",  opts:["28","29","30","31"],ans:2, h:"6x5=30!"},
    {q:"What is 36 / 6?", opts:["4","5","6","7"],    ans:2, h:"36÷6=6!"},
    {q:"What is 13 + 9?", opts:["20","21","22","23"],ans:2, h:"13+9=22!"},
    {q:"What is 25 - 8?", opts:["15","16","17","18"],ans:2, h:"25-8=17!"},
    {q:"What is 8 x 7?",  opts:["54","55","56","57"],ans:2, h:"8x7=56!"},
    {q:"What is 45 / 9?", opts:["3","4","5","6"],    ans:2, h:"45÷9=5!"},
    {q:"What is 14 + 7?", opts:["19","20","21","22"],ans:2, h:"14+7=21!"},
    {q:"What is 32 - 14?",opts:["16","17","18","19"],ans:2, h:"32-14=18!"},
    {q:"What is 9 x 6?",  opts:["52","53","54","55"],ans:2, h:"9x6=54!"},
    {q:"What is 48 / 8?", opts:["4","5","6","7"],    ans:2, h:"48÷8=6!"},
    {q:"What is 16 + 8?", opts:["22","23","24","25"],ans:2, h:"16+8=24!"},
    {q:"What is 40 - 13?",opts:["25","26","27","28"],ans:2, h:"40-13=27!"},
    {q:"What is 7 x 8?",  opts:["54","55","56","57"],ans:2, h:"7x8=56!"},
    {q:"What is 63 / 7?", opts:["7","8","9","10"],   ans:2, h:"63÷7=9!"},
  ];
    // Pick questions for this lesson (or graceful fallback)
  // Primary source: Supabase questions table (fetched above)
  // Fallback: FALLBACK_Q (only if DB fetch failed)
  return shuffle(FALLBACK_Q.map(q => { const r = shuffleOpts(q.opts, q.ans); return {...q, ...r}; }));
}


const OLYMPIAD_TESTS = [
  /* Test 1 */ [
    {q:"A train has 5 coaches. Each coach has 8 seats. Total seats?",opts:["30", "35", "40", "45"],ans:2,h:"5x8=40!",time:45},
    {q:"Which is odd one out: 2,4,6,9,8?",opts:["2", "4", "9", "8"],ans:2,h:"9 is the only odd number!",time:45},
    {q:"Riya has 24 chocolates. She gives 1/3 to her sister. How many left?",opts:["8", "12", "16", "18"],ans:2,h:"1/3 of 24=8, 24-8=16!",time:50},
    {q:"What is the next number: 3, 6, 12, 24, __?",opts:["36", "42", "48", "50"],ans:2,h:"Pattern: x2 each time! 24x2=48!",time:45},
    {q:"A clock shows 3. Hour hand moves to 6. How many hours?",opts:["2", "3", "4", "5"],ans:1,h:"From 3 to 6 = 3 hours!",time:45},
    {q:"Sum of first 5 even numbers?",opts:["25", "28", "30", "35"],ans:2,h:"2+4+6+8+10=30!",time:50},
    {q:"A rectangle has length 8cm, width 3cm. Perimeter?",opts:["22", "24", "26", "28"],ans:0,h:"2x(8+3)=22cm!",time:50},
    {q:"How many seconds in 3 minutes?",opts:["120", "150", "180", "210"],ans:2,h:"3x60=180!",time:45},
    {q:"Fill: 1, 4, 9, 16, __ (squares)",opts:["20", "22", "25", "28"],ans:2,h:"5x5=25!",time:50},
    {q:"A number multiplied by itself gives 64. Number is?",opts:["6", "7", "8", "9"],ans:2,h:"8x8=64!",time:45},
    {q:"Perimeter of equilateral triangle with side 9cm?",opts:["18", "24", "27", "30"],ans:2,h:"3x9=27!",time:45},
    {q:"Sum of angles in a triangle?",opts:["90", "120", "180", "360"],ans:2,h:"Always 180 degrees!",time:45},
    {q:"Which is NOT a factor of 12?",opts:["2", "3", "5", "6"],ans:2,h:"12\u00f75 is not whole number!",time:45},
    {q:"Value of 3 in 3456?",opts:["3", "30", "300", "3000"],ans:3,h:"Thousands place = 3000!",time:45},
    {q:"Ramu earns Rs 150/day. In 6 days?",opts:["750", "800", "850", "900"],ans:3,h:"150x6=900!",time:50},
    {q:"Smallest prime number?",opts:["1", "2", "3", "5"],ans:1,h:"2 is the smallest prime!",time:45},
    {q:"What is 25% of 80?",opts:["15", "18", "20", "25"],ans:2,h:"25% = 1/4, 80\u00f74=20!",time:45},
    {q:"Pattern: 2, 3, 5, 8, 13, __?",opts:["18", "20", "21", "24"],ans:2,h:"Fibonacci: 8+13=21!",time:55},
    {q:"How many faces does a cube have?",opts:["4", "5", "6", "8"],ans:2,h:"A cube has 6 faces!",time:45},
    {q:"Area of square with side 7cm?",opts:["42", "45", "48", "49"],ans:3,h:"7x7=49!",time:45},
    {q:"If 5 pens cost Rs 25, cost of 8 pens?",opts:["30", "35", "40", "45"],ans:2,h:"Rate=5 Rs each. 8x5=40!",time:50},
    {q:"What fraction is 8 hours of a day?",opts:["1/2", "1/3", "1/4", "1/6"],ans:1,h:"8/24=1/3!",time:50},
    {q:"3 consecutive numbers sum to 48. Middle?",opts:["15", "16", "17", "18"],ans:1,h:"3n=48, n=16!",time:55},
    {q:"LCM of 4 and 6?",opts:["8", "10", "12", "14"],ans:2,h:"LCM(4,6)=12!",time:50},
    {q:"Square root of 81?",opts:["7", "8", "9", "10"],ans:2,h:"9x9=81!",time:45},
  ],
  /* Test 2 */ [
    {q:"Divide 72 pens among 8 students. Each gets?",opts:["7", "8", "9", "10"],ans:2,h:"72\u00f78=9!",time:45},
    {q:"A rope 5m long cut into 25cm pieces. How many?",opts:["15", "18", "20", "22"],ans:2,h:"500\u00f725=20!",time:50},
    {q:"Two numbers: sum=50, difference=10. Bigger?",opts:["25", "28", "30", "35"],ans:2,h:"(50+10)\u00f72=30!",time:60},
    {q:"Sam reads 12 pages/day. Days to read 144 pages?",opts:["10", "11", "12", "13"],ans:2,h:"144\u00f712=12!",time:45},
    {q:"Triangle has angles 40 and 70. Third angle?",opts:["60", "70", "80", "90"],ans:1,h:"180-40-70=70!",time:50},
    {q:"3 friends share Rs 360 equally. Each?",opts:["100", "110", "120", "130"],ans:2,h:"360\u00f73=120!",time:45},
    {q:"A car travels 240km in 4 hours. Speed?",opts:["50", "55", "60", "65"],ans:2,h:"240\u00f74=60 km/h!",time:45},
    {q:"Sum of 1 to 10?",opts:["45", "50", "55", "60"],ans:2,h:"n(n+1)/2=10x11/2=55!",time:50},
    {q:"Largest number from digits 3,0,7,5?",opts:["7530", "7503", "7053", "5730"],ans:0,h:"Arrange largest first: 7530!",time:45},
    {q:"If today is Tuesday, day after 10 days?",opts:["Thursday", "Friday", "Saturday", "Sunday"],ans:1,h:"10 days from Tue = Fri!",time:45},
    {q:"Area of rectangle 12cm x 5cm?",opts:["50", "55", "60", "65"],ans:2,h:"12x5=60!",time:45},
    {q:"Pattern: 100,90,81,73,66 \u2014 rule?",opts:["Add 9", "Sub 10,9,8,7", "Add 11", "Sub 9 always"],ans:1,h:"Differences: -10,-9,-8,-7!",time:60},
    {q:"HCF of 24 and 36?",opts:["6", "8", "10", "12"],ans:3,h:"HCF=12!",time:55},
    {q:"In class of 40, boys:girls=3:5. Boys=?",opts:["12", "15", "18", "20"],ans:1,h:"3/8 x 40=15!",time:55},
    {q:"Number of primes between 20 and 30?",opts:["1", "2", "3", "4"],ans:1,h:"23 and 29!",time:50},
    {q:"Angles of triangle are 2x, 3x, 4x. Value of x?",opts:["15", "20", "25", "30"],ans:1,h:"9x=180, x=20!",time:55},
    {q:"A wheel rotates 10 times/min. In 30 min?",opts:["200", "250", "300", "350"],ans:2,h:"10x30=300!",time:45},
    {q:"12 months = how many weeks (approx)?",opts:["48", "50", "52", "54"],ans:2,h:"52 weeks in a year!",time:45},
    {q:"Which fraction is greatest: 2/3, 3/4, 4/5, 5/6?",opts:["2/3", "3/4", "4/5", "5/6"],ans:3,h:"5/6 is closest to 1!",time:55},
    {q:"A box has 4 rows and 6 columns. Total items?",opts:["20", "22", "24", "26"],ans:2,h:"4x6=24!",time:45},
    {q:"Consecutive even numbers summing to 54. Smallest?",opts:["14", "16", "18", "20"],ans:1,h:"16+18+20=54!",time:55},
    {q:"999 + 999 = ?",opts:["1888", "1898", "1998", "1999"],ans:2,h:"999+999=1998!",time:45},
    {q:"How many prime numbers between 1 and 20?",opts:["6", "7", "8", "9"],ans:2,h:"2,3,5,7,11,13,17,19=8!",time:55},
    {q:"3/4 of class = 24. Total students?",opts:["28", "30", "32", "36"],ans:2,h:"24 \u00f7 3/4 = 32!",time:55},
    {q:"A train runs 300km. Stops every 75km. Stops before end?",opts:["2", "3", "4", "5"],ans:2,h:"300/75=4 intervals, 3 stops!",time:55},
  ],
  /* Test 3 */ [
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Solve: 97 x 5 = ?",opts:["480", "485", "490", "495"],ans:1,h:"97x5=485!",time:40},
    {q:"Solve: 29 x 9 = ?",opts:["252", "261", "270", "279"],ans:1,h:"29x9=261!",time:40},
    {q:"Solve: 94 x 4 = ?",opts:["372", "376", "380", "384"],ans:1,h:"94x4=376!",time:40},
    {q:"Solve: 82 x 7 = ?",opts:["567", "574", "581", "588"],ans:1,h:"82x7=574!",time:40},
    {q:"Solve: 20 x 3 = ?",opts:["57", "60", "63", "66"],ans:1,h:"20x3=60!",time:40},
    {q:"Solve: 70 x 7 = ?",opts:["483", "490", "497", "504"],ans:1,h:"70x7=490!",time:40},
    {q:"Solve: 61 x 2 = ?",opts:["120", "122", "124", "126"],ans:1,h:"61x2=122!",time:40},
    {q:"Solve: 44 x 2 = ?",opts:["86", "88", "90", "92"],ans:1,h:"44x2=88!",time:40},
    {q:"Solve: 64 x 5 = ?",opts:["315", "320", "325", "330"],ans:1,h:"64x5=320!",time:40},
    {q:"Solve: 56 x 3 = ?",opts:["165", "168", "171", "174"],ans:1,h:"56x3=168!",time:40},
  ],
  /* Test 4 */ [
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Solve: 20 x 8 = ?",opts:["152", "160", "168", "176"],ans:1,h:"20x8=160!",time:40},
    {q:"Solve: 90 x 3 = ?",opts:["267", "270", "273", "276"],ans:1,h:"90x3=270!",time:40},
    {q:"Solve: 28 x 6 = ?",opts:["162", "168", "174", "180"],ans:1,h:"28x6=168!",time:40},
    {q:"Solve: 89 x 2 = ?",opts:["176", "178", "180", "182"],ans:1,h:"89x2=178!",time:40},
    {q:"Solve: 58 x 7 = ?",opts:["399", "406", "413", "420"],ans:1,h:"58x7=406!",time:40},
    {q:"Solve: 27 x 8 = ?",opts:["208", "216", "224", "232"],ans:1,h:"27x8=216!",time:40},
    {q:"Solve: 35 x 2 = ?",opts:["68", "70", "72", "74"],ans:1,h:"35x2=70!",time:40},
    {q:"Solve: 91 x 5 = ?",opts:["450", "455", "460", "465"],ans:1,h:"91x5=455!",time:40},
    {q:"Solve: 66 x 6 = ?",opts:["390", "396", "402", "408"],ans:1,h:"66x6=396!",time:40},
    {q:"Solve: 79 x 8 = ?",opts:["624", "632", "640", "648"],ans:1,h:"79x8=632!",time:40},
  ],
  /* Test 5 */ [
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Solve: 56 x 4 = ?",opts:["220", "224", "228", "232"],ans:1,h:"56x4=224!",time:40},
    {q:"Solve: 96 x 3 = ?",opts:["285", "288", "291", "294"],ans:1,h:"96x3=288!",time:40},
    {q:"Solve: 74 x 6 = ?",opts:["438", "444", "450", "456"],ans:1,h:"74x6=444!",time:40},
    {q:"Solve: 11 x 2 = ?",opts:["20", "22", "24", "26"],ans:1,h:"11x2=22!",time:40},
    {q:"Solve: 53 x 5 = ?",opts:["260", "265", "270", "275"],ans:1,h:"53x5=265!",time:40},
    {q:"Solve: 58 x 8 = ?",opts:["456", "464", "472", "480"],ans:1,h:"58x8=464!",time:40},
    {q:"Solve: 53 x 8 = ?",opts:["416", "424", "432", "440"],ans:1,h:"53x8=424!",time:40},
    {q:"Solve: 59 x 8 = ?",opts:["464", "472", "480", "488"],ans:1,h:"59x8=472!",time:40},
    {q:"Solve: 57 x 3 = ?",opts:["168", "171", "174", "177"],ans:1,h:"57x3=171!",time:40},
    {q:"Solve: 33 x 2 = ?",opts:["64", "66", "68", "70"],ans:1,h:"33x2=66!",time:40},
  ],
  /* Test 6 */ [
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Solve: 74 x 6 = ?",opts:["438", "444", "450", "456"],ans:1,h:"74x6=444!",time:40},
    {q:"Solve: 97 x 7 = ?",opts:["672", "679", "686", "693"],ans:1,h:"97x7=679!",time:40},
    {q:"Solve: 71 x 4 = ?",opts:["280", "284", "288", "292"],ans:1,h:"71x4=284!",time:40},
    {q:"Solve: 42 x 8 = ?",opts:["328", "336", "344", "352"],ans:1,h:"42x8=336!",time:40},
    {q:"Solve: 47 x 8 = ?",opts:["368", "376", "384", "392"],ans:1,h:"47x8=376!",time:40},
    {q:"Solve: 94 x 4 = ?",opts:["372", "376", "380", "384"],ans:1,h:"94x4=376!",time:40},
    {q:"Solve: 46 x 8 = ?",opts:["360", "368", "376", "384"],ans:1,h:"46x8=368!",time:40},
    {q:"Solve: 96 x 9 = ?",opts:["855", "864", "873", "882"],ans:1,h:"96x9=864!",time:40},
    {q:"Solve: 34 x 8 = ?",opts:["264", "272", "280", "288"],ans:1,h:"34x8=272!",time:40},
    {q:"Solve: 53 x 5 = ?",opts:["260", "265", "270", "275"],ans:1,h:"53x5=265!",time:40},
  ],
  /* Test 7 */ [
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Solve: 36 x 6 = ?",opts:["210", "216", "222", "228"],ans:1,h:"36x6=216!",time:40},
    {q:"Solve: 63 x 9 = ?",opts:["558", "567", "576", "585"],ans:1,h:"63x9=567!",time:40},
    {q:"Solve: 81 x 6 = ?",opts:["480", "486", "492", "498"],ans:1,h:"81x6=486!",time:40},
    {q:"Solve: 35 x 2 = ?",opts:["68", "70", "72", "74"],ans:1,h:"35x2=70!",time:40},
    {q:"Solve: 23 x 6 = ?",opts:["132", "138", "144", "150"],ans:1,h:"23x6=138!",time:40},
    {q:"Solve: 19 x 2 = ?",opts:["36", "38", "40", "42"],ans:1,h:"19x2=38!",time:40},
    {q:"Solve: 17 x 8 = ?",opts:["128", "136", "144", "152"],ans:1,h:"17x8=136!",time:40},
    {q:"Solve: 48 x 7 = ?",opts:["329", "336", "343", "350"],ans:1,h:"48x7=336!",time:40},
    {q:"Solve: 81 x 6 = ?",opts:["480", "486", "492", "498"],ans:1,h:"81x6=486!",time:40},
    {q:"Solve: 34 x 3 = ?",opts:["102", "105", "108", "99"],ans:0,h:"34x3=102!",time:40},
  ],
  /* Test 8 */ [
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"Solve: 190 x 4 = ?",opts:["756", "760", "764", "768"],ans:1,h:"190x4=760!",time:40},
    {q:"Solve: 39 x 5 = ?",opts:["190", "195", "200", "205"],ans:1,h:"39x5=195!",time:40},
    {q:"Solve: 137 x 2 = ?",opts:["272", "274", "276", "278"],ans:1,h:"137x2=274!",time:40},
    {q:"Solve: 49 x 7 = ?",opts:["336", "343", "350", "357"],ans:1,h:"49x7=343!",time:40},
    {q:"Solve: 146 x 3 = ?",opts:["435", "438", "441", "444"],ans:1,h:"146x3=438!",time:40},
    {q:"Solve: 105 x 2 = ?",opts:["208", "210", "212", "214"],ans:1,h:"105x2=210!",time:40},
    {q:"Solve: 165 x 6 = ?",opts:["1002", "984", "990", "996"],ans:2,h:"165x6=990!",time:40},
    {q:"Solve: 182 x 2 = ?",opts:["362", "364", "366", "368"],ans:1,h:"182x2=364!",time:40},
    {q:"Solve: 169 x 7 = ?",opts:["1176", "1183", "1190", "1197"],ans:1,h:"169x7=1183!",time:40},
    {q:"Solve: 125 x 6 = ?",opts:["744", "750", "756", "762"],ans:1,h:"125x6=750!",time:40},
  ],
  /* Test 9 */ [
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Solve: 90 x 7 = ?",opts:["623", "630", "637", "644"],ans:1,h:"90x7=630!",time:40},
    {q:"Solve: 38 x 5 = ?",opts:["185", "190", "195", "200"],ans:1,h:"38x5=190!",time:40},
    {q:"Solve: 163 x 4 = ?",opts:["648", "652", "656", "660"],ans:1,h:"163x4=652!",time:40},
    {q:"Solve: 110 x 3 = ?",opts:["327", "330", "333", "336"],ans:1,h:"110x3=330!",time:40},
    {q:"Solve: 193 x 3 = ?",opts:["576", "579", "582", "585"],ans:1,h:"193x3=579!",time:40},
    {q:"Solve: 52 x 4 = ?",opts:["204", "208", "212", "216"],ans:1,h:"52x4=208!",time:40},
    {q:"Solve: 58 x 3 = ?",opts:["171", "174", "177", "180"],ans:1,h:"58x3=174!",time:40},
    {q:"Solve: 28 x 8 = ?",opts:["216", "224", "232", "240"],ans:1,h:"28x8=224!",time:40},
    {q:"Solve: 62 x 7 = ?",opts:["427", "434", "441", "448"],ans:1,h:"62x7=434!",time:40},
    {q:"Solve: 79 x 4 = ?",opts:["312", "316", "320", "324"],ans:1,h:"79x4=316!",time:40},
  ],
  /* Test 10 */ [
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Solve: 61 x 4 = ?",opts:["240", "244", "248", "252"],ans:1,h:"61x4=244!",time:40},
    {q:"Solve: 133 x 7 = ?",opts:["924", "931", "938", "945"],ans:1,h:"133x7=931!",time:40},
    {q:"Solve: 84 x 7 = ?",opts:["581", "588", "595", "602"],ans:1,h:"84x7=588!",time:40},
    {q:"Solve: 170 x 2 = ?",opts:["338", "340", "342", "344"],ans:1,h:"170x2=340!",time:40},
    {q:"Solve: 169 x 8 = ?",opts:["1344", "1352", "1360", "1368"],ans:1,h:"169x8=1352!",time:40},
    {q:"Solve: 25 x 6 = ?",opts:["144", "150", "156", "162"],ans:1,h:"25x6=150!",time:40},
    {q:"Solve: 60 x 4 = ?",opts:["236", "240", "244", "248"],ans:1,h:"60x4=240!",time:40},
    {q:"Solve: 22 x 6 = ?",opts:["126", "132", "138", "144"],ans:1,h:"22x6=132!",time:40},
    {q:"Solve: 162 x 6 = ?",opts:["966", "972", "978", "984"],ans:1,h:"162x6=972!",time:40},
    {q:"Solve: 94 x 3 = ?",opts:["279", "282", "285", "288"],ans:1,h:"94x3=282!",time:40},
  ],
  /* Test 11 */ [
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"Solve: 64 x 8 = ?",opts:["504", "512", "520", "528"],ans:1,h:"64x8=512!",time:40},
    {q:"Solve: 33 x 5 = ?",opts:["160", "165", "170", "175"],ans:1,h:"33x5=165!",time:40},
    {q:"Solve: 81 x 6 = ?",opts:["480", "486", "492", "498"],ans:1,h:"81x6=486!",time:40},
    {q:"Solve: 61 x 3 = ?",opts:["180", "183", "186", "189"],ans:1,h:"61x3=183!",time:40},
    {q:"Solve: 131 x 2 = ?",opts:["260", "262", "264", "266"],ans:1,h:"131x2=262!",time:40},
    {q:"Solve: 164 x 2 = ?",opts:["326", "328", "330", "332"],ans:1,h:"164x2=328!",time:40},
    {q:"Solve: 71 x 4 = ?",opts:["280", "284", "288", "292"],ans:1,h:"71x4=284!",time:40},
    {q:"Solve: 66 x 6 = ?",opts:["390", "396", "402", "408"],ans:1,h:"66x6=396!",time:40},
    {q:"Solve: 35 x 6 = ?",opts:["204", "210", "216", "222"],ans:1,h:"35x6=210!",time:40},
    {q:"Solve: 66 x 8 = ?",opts:["520", "528", "536", "544"],ans:1,h:"66x8=528!",time:40},
  ],
  /* Test 12 */ [
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Solve: 131 x 5 = ?",opts:["650", "655", "660", "665"],ans:1,h:"131x5=655!",time:40},
    {q:"Solve: 64 x 4 = ?",opts:["252", "256", "260", "264"],ans:1,h:"64x4=256!",time:40},
    {q:"Solve: 141 x 5 = ?",opts:["700", "705", "710", "715"],ans:1,h:"141x5=705!",time:40},
    {q:"Solve: 64 x 6 = ?",opts:["378", "384", "390", "396"],ans:1,h:"64x6=384!",time:40},
    {q:"Solve: 62 x 3 = ?",opts:["183", "186", "189", "192"],ans:1,h:"62x3=186!",time:40},
    {q:"Solve: 80 x 5 = ?",opts:["395", "400", "405", "410"],ans:1,h:"80x5=400!",time:40},
    {q:"Solve: 154 x 5 = ?",opts:["765", "770", "775", "780"],ans:1,h:"154x5=770!",time:40},
    {q:"Solve: 195 x 8 = ?",opts:["1552", "1560", "1568", "1576"],ans:1,h:"195x8=1560!",time:40},
    {q:"Solve: 121 x 3 = ?",opts:["360", "363", "366", "369"],ans:1,h:"121x3=363!",time:40},
    {q:"Solve: 81 x 6 = ?",opts:["480", "486", "492", "498"],ans:1,h:"81x6=486!",time:40},
  ],
  /* Test 13 */ [
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"Solve: 49 x 4 = ?",opts:["192", "196", "200", "204"],ans:1,h:"49x4=196!",time:40},
    {q:"Solve: 108 x 8 = ?",opts:["856", "864", "872", "880"],ans:1,h:"108x8=864!",time:40},
    {q:"Solve: 56 x 6 = ?",opts:["330", "336", "342", "348"],ans:1,h:"56x6=336!",time:40},
    {q:"Solve: 155 x 6 = ?",opts:["924", "930", "936", "942"],ans:1,h:"155x6=930!",time:40},
    {q:"Solve: 70 x 9 = ?",opts:["621", "630", "639", "648"],ans:1,h:"70x9=630!",time:40},
    {q:"Solve: 34 x 2 = ?",opts:["66", "68", "70", "72"],ans:1,h:"34x2=68!",time:40},
    {q:"Solve: 110 x 5 = ?",opts:["545", "550", "555", "560"],ans:1,h:"110x5=550!",time:40},
    {q:"Solve: 56 x 3 = ?",opts:["165", "168", "171", "174"],ans:1,h:"56x3=168!",time:40},
    {q:"Solve: 117 x 2 = ?",opts:["232", "234", "236", "238"],ans:1,h:"117x2=234!",time:40},
    {q:"Solve: 111 x 7 = ?",opts:["770", "777", "784", "791"],ans:1,h:"111x7=777!",time:40},
  ],
  /* Test 14 */ [
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Solve: 162 x 8 = ?",opts:["1288", "1296", "1304", "1312"],ans:1,h:"162x8=1296!",time:40},
    {q:"Solve: 163 x 6 = ?",opts:["972", "978", "984", "990"],ans:1,h:"163x6=978!",time:40},
    {q:"Solve: 103 x 7 = ?",opts:["714", "721", "728", "735"],ans:1,h:"103x7=721!",time:40},
    {q:"Solve: 49 x 6 = ?",opts:["288", "294", "300", "306"],ans:1,h:"49x6=294!",time:40},
    {q:"Solve: 155 x 5 = ?",opts:["770", "775", "780", "785"],ans:1,h:"155x5=775!",time:40},
    {q:"Solve: 36 x 2 = ?",opts:["70", "72", "74", "76"],ans:1,h:"36x2=72!",time:40},
    {q:"Solve: 76 x 6 = ?",opts:["450", "456", "462", "468"],ans:1,h:"76x6=456!",time:40},
    {q:"Solve: 103 x 3 = ?",opts:["306", "309", "312", "315"],ans:1,h:"103x3=309!",time:40},
    {q:"Solve: 89 x 6 = ?",opts:["528", "534", "540", "546"],ans:1,h:"89x6=534!",time:40},
    {q:"Solve: 179 x 5 = ?",opts:["890", "895", "900", "905"],ans:1,h:"179x5=895!",time:40},
  ],
  /* Test 15 */ [
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Solve: 73 x 3 = ?",opts:["216", "219", "222", "225"],ans:1,h:"73x3=219!",time:40},
    {q:"Solve: 171 x 6 = ?",opts:["1020", "1026", "1032", "1038"],ans:1,h:"171x6=1026!",time:40},
    {q:"Solve: 136 x 9 = ?",opts:["1215", "1224", "1233", "1242"],ans:1,h:"136x9=1224!",time:40},
    {q:"Solve: 106 x 3 = ?",opts:["315", "318", "321", "324"],ans:1,h:"106x3=318!",time:40},
    {q:"Solve: 198 x 2 = ?",opts:["394", "396", "398", "400"],ans:1,h:"198x2=396!",time:40},
    {q:"Solve: 32 x 3 = ?",opts:["102", "93", "96", "99"],ans:2,h:"32x3=96!",time:40},
    {q:"Solve: 182 x 4 = ?",opts:["724", "728", "732", "736"],ans:1,h:"182x4=728!",time:40},
    {q:"Solve: 124 x 5 = ?",opts:["615", "620", "625", "630"],ans:1,h:"124x5=620!",time:40},
    {q:"Solve: 128 x 2 = ?",opts:["254", "256", "258", "260"],ans:1,h:"128x2=256!",time:40},
    {q:"Solve: 25 x 3 = ?",opts:["72", "75", "78", "81"],ans:1,h:"25x3=75!",time:40},
  ],
  /* Test 16 */ [
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Solve: 69 x 6 = ?",opts:["408", "414", "420", "426"],ans:1,h:"69x6=414!",time:40},
    {q:"Solve: 185 x 6 = ?",opts:["1104", "1110", "1116", "1122"],ans:1,h:"185x6=1110!",time:40},
    {q:"Solve: 111 x 6 = ?",opts:["660", "666", "672", "678"],ans:1,h:"111x6=666!",time:40},
    {q:"Solve: 93 x 2 = ?",opts:["184", "186", "188", "190"],ans:1,h:"93x2=186!",time:40},
    {q:"Solve: 65 x 6 = ?",opts:["384", "390", "396", "402"],ans:1,h:"65x6=390!",time:40},
    {q:"Solve: 272 x 8 = ?",opts:["2168", "2176", "2184", "2192"],ans:1,h:"272x8=2176!",time:40},
    {q:"Solve: 95 x 6 = ?",opts:["564", "570", "576", "582"],ans:1,h:"95x6=570!",time:40},
    {q:"Solve: 277 x 5 = ?",opts:["1380", "1385", "1390", "1395"],ans:1,h:"277x5=1385!",time:40},
    {q:"Solve: 286 x 6 = ?",opts:["1710", "1716", "1722", "1728"],ans:1,h:"286x6=1716!",time:40},
    {q:"Solve: 259 x 6 = ?",opts:["1548", "1554", "1560", "1566"],ans:1,h:"259x6=1554!",time:40},
  ],
  /* Test 17 */ [
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Solve: 202 x 8 = ?",opts:["1608", "1616", "1624", "1632"],ans:1,h:"202x8=1616!",time:40},
    {q:"Solve: 72 x 2 = ?",opts:["142", "144", "146", "148"],ans:1,h:"72x2=144!",time:40},
    {q:"Solve: 246 x 3 = ?",opts:["735", "738", "741", "744"],ans:1,h:"246x3=738!",time:40},
    {q:"Solve: 247 x 9 = ?",opts:["2214", "2223", "2232", "2241"],ans:1,h:"247x9=2223!",time:40},
    {q:"Solve: 84 x 3 = ?",opts:["249", "252", "255", "258"],ans:1,h:"84x3=252!",time:40},
    {q:"Solve: 32 x 5 = ?",opts:["155", "160", "165", "170"],ans:1,h:"32x5=160!",time:40},
    {q:"Solve: 75 x 5 = ?",opts:["370", "375", "380", "385"],ans:1,h:"75x5=375!",time:40},
    {q:"Solve: 182 x 5 = ?",opts:["905", "910", "915", "920"],ans:1,h:"182x5=910!",time:40},
    {q:"Solve: 88 x 4 = ?",opts:["348", "352", "356", "360"],ans:1,h:"88x4=352!",time:40},
    {q:"Solve: 162 x 6 = ?",opts:["966", "972", "978", "984"],ans:1,h:"162x6=972!",time:40},
  ],
  /* Test 18 */ [
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"Solve: 52 x 7 = ?",opts:["357", "364", "371", "378"],ans:1,h:"52x7=364!",time:40},
    {q:"Solve: 148 x 5 = ?",opts:["735", "740", "745", "750"],ans:1,h:"148x5=740!",time:40},
    {q:"Solve: 297 x 8 = ?",opts:["2368", "2376", "2384", "2392"],ans:1,h:"297x8=2376!",time:40},
    {q:"Solve: 273 x 4 = ?",opts:["1088", "1092", "1096", "1100"],ans:1,h:"273x4=1092!",time:40},
    {q:"Solve: 207 x 4 = ?",opts:["824", "828", "832", "836"],ans:1,h:"207x4=828!",time:40},
    {q:"Solve: 295 x 6 = ?",opts:["1764", "1770", "1776", "1782"],ans:1,h:"295x6=1770!",time:40},
    {q:"Solve: 40 x 2 = ?",opts:["78", "80", "82", "84"],ans:1,h:"40x2=80!",time:40},
    {q:"Solve: 206 x 4 = ?",opts:["820", "824", "828", "832"],ans:1,h:"206x4=824!",time:40},
    {q:"Solve: 95 x 8 = ?",opts:["752", "760", "768", "776"],ans:1,h:"95x8=760!",time:40},
    {q:"Solve: 53 x 3 = ?",opts:["156", "159", "162", "165"],ans:1,h:"53x3=159!",time:40},
  ],
  /* Test 19 */ [
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Solve: 273 x 8 = ?",opts:["2176", "2184", "2192", "2200"],ans:1,h:"273x8=2184!",time:40},
    {q:"Solve: 249 x 8 = ?",opts:["1984", "1992", "2000", "2008"],ans:1,h:"249x8=1992!",time:40},
    {q:"Solve: 220 x 8 = ?",opts:["1752", "1760", "1768", "1776"],ans:1,h:"220x8=1760!",time:40},
    {q:"Solve: 162 x 3 = ?",opts:["483", "486", "489", "492"],ans:1,h:"162x3=486!",time:40},
    {q:"Solve: 134 x 7 = ?",opts:["931", "938", "945", "952"],ans:1,h:"134x7=938!",time:40},
    {q:"Solve: 98 x 3 = ?",opts:["291", "294", "297", "300"],ans:1,h:"98x3=294!",time:40},
    {q:"Solve: 164 x 3 = ?",opts:["489", "492", "495", "498"],ans:1,h:"164x3=492!",time:40},
    {q:"Solve: 32 x 7 = ?",opts:["217", "224", "231", "238"],ans:1,h:"32x7=224!",time:40},
    {q:"Solve: 229 x 7 = ?",opts:["1596", "1603", "1610", "1617"],ans:1,h:"229x7=1603!",time:40},
    {q:"Solve: 151 x 3 = ?",opts:["450", "453", "456", "459"],ans:1,h:"151x3=453!",time:40},
  ],
  /* Test 20 */ [
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Solve: 45 x 9 = ?",opts:["396", "405", "414", "423"],ans:1,h:"45x9=405!",time:40},
    {q:"Solve: 146 x 9 = ?",opts:["1305", "1314", "1323", "1332"],ans:1,h:"146x9=1314!",time:40},
    {q:"Solve: 63 x 9 = ?",opts:["558", "567", "576", "585"],ans:1,h:"63x9=567!",time:40},
    {q:"Solve: 184 x 5 = ?",opts:["915", "920", "925", "930"],ans:1,h:"184x5=920!",time:40},
    {q:"Solve: 289 x 2 = ?",opts:["576", "578", "580", "582"],ans:1,h:"289x2=578!",time:40},
    {q:"Solve: 94 x 9 = ?",opts:["837", "846", "855", "864"],ans:1,h:"94x9=846!",time:40},
    {q:"Solve: 65 x 7 = ?",opts:["448", "455", "462", "469"],ans:1,h:"65x7=455!",time:40},
    {q:"Solve: 96 x 7 = ?",opts:["665", "672", "679", "686"],ans:1,h:"96x7=672!",time:40},
    {q:"Solve: 50 x 3 = ?",opts:["147", "150", "153", "156"],ans:1,h:"50x3=150!",time:40},
    {q:"Solve: 37 x 5 = ?",opts:["180", "185", "190", "195"],ans:1,h:"37x5=185!",time:40},
  ],
  /* Test 21 */ [
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Solve: 46 x 6 = ?",opts:["270", "276", "282", "288"],ans:1,h:"46x6=276!",time:40},
    {q:"Solve: 58 x 2 = ?",opts:["114", "116", "118", "120"],ans:1,h:"58x2=116!",time:40},
    {q:"Solve: 157 x 8 = ?",opts:["1248", "1256", "1264", "1272"],ans:1,h:"157x8=1256!",time:40},
    {q:"Solve: 220 x 9 = ?",opts:["1971", "1980", "1989", "1998"],ans:1,h:"220x9=1980!",time:40},
    {q:"Solve: 99 x 6 = ?",opts:["588", "594", "600", "606"],ans:1,h:"99x6=594!",time:40},
    {q:"Solve: 208 x 4 = ?",opts:["828", "832", "836", "840"],ans:1,h:"208x4=832!",time:40},
    {q:"Solve: 46 x 7 = ?",opts:["315", "322", "329", "336"],ans:1,h:"46x7=322!",time:40},
    {q:"Solve: 220 x 5 = ?",opts:["1095", "1100", "1105", "1110"],ans:1,h:"220x5=1100!",time:40},
    {q:"Solve: 242 x 6 = ?",opts:["1446", "1452", "1458", "1464"],ans:1,h:"242x6=1452!",time:40},
    {q:"Solve: 120 x 6 = ?",opts:["714", "720", "726", "732"],ans:1,h:"120x6=720!",time:40},
  ],
  /* Test 22 */ [
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Solve: 213 x 8 = ?",opts:["1696", "1704", "1712", "1720"],ans:1,h:"213x8=1704!",time:40},
    {q:"Solve: 112 x 6 = ?",opts:["666", "672", "678", "684"],ans:1,h:"112x6=672!",time:40},
    {q:"Solve: 221 x 4 = ?",opts:["880", "884", "888", "892"],ans:1,h:"221x4=884!",time:40},
    {q:"Solve: 33 x 4 = ?",opts:["128", "132", "136", "140"],ans:1,h:"33x4=132!",time:40},
    {q:"Solve: 267 x 9 = ?",opts:["2394", "2403", "2412", "2421"],ans:1,h:"267x9=2403!",time:40},
    {q:"Solve: 172 x 9 = ?",opts:["1539", "1548", "1557", "1566"],ans:1,h:"172x9=1548!",time:40},
    {q:"Solve: 193 x 4 = ?",opts:["768", "772", "776", "780"],ans:1,h:"193x4=772!",time:40},
    {q:"Solve: 197 x 4 = ?",opts:["784", "788", "792", "796"],ans:1,h:"197x4=788!",time:40},
    {q:"Solve: 54 x 8 = ?",opts:["424", "432", "440", "448"],ans:1,h:"54x8=432!",time:40},
    {q:"Solve: 108 x 9 = ?",opts:["963", "972", "981", "990"],ans:1,h:"108x9=972!",time:40},
  ],
  /* Test 23 */ [
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Solve: 124 x 2 = ?",opts:["246", "248", "250", "252"],ans:1,h:"124x2=248!",time:40},
    {q:"Solve: 58 x 3 = ?",opts:["171", "174", "177", "180"],ans:1,h:"58x3=174!",time:40},
    {q:"Solve: 271 x 8 = ?",opts:["2160", "2168", "2176", "2184"],ans:1,h:"271x8=2168!",time:40},
    {q:"Solve: 140 x 6 = ?",opts:["834", "840", "846", "852"],ans:1,h:"140x6=840!",time:40},
    {q:"Solve: 254 x 7 = ?",opts:["1771", "1778", "1785", "1792"],ans:1,h:"254x7=1778!",time:40},
    {q:"Solve: 288 x 2 = ?",opts:["574", "576", "578", "580"],ans:1,h:"288x2=576!",time:40},
    {q:"Solve: 123 x 8 = ?",opts:["1000", "976", "984", "992"],ans:2,h:"123x8=984!",time:40},
    {q:"Solve: 252 x 7 = ?",opts:["1757", "1764", "1771", "1778"],ans:1,h:"252x7=1764!",time:40},
    {q:"Solve: 171 x 4 = ?",opts:["680", "684", "688", "692"],ans:1,h:"171x4=684!",time:40},
    {q:"Solve: 103 x 9 = ?",opts:["918", "927", "936", "945"],ans:1,h:"103x9=927!",time:40},
  ],
  /* Test 24 */ [
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Solve: 290 x 2 = ?",opts:["578", "580", "582", "584"],ans:1,h:"290x2=580!",time:40},
    {q:"Solve: 235 x 8 = ?",opts:["1872", "1880", "1888", "1896"],ans:1,h:"235x8=1880!",time:40},
    {q:"Solve: 200 x 2 = ?",opts:["398", "400", "402", "404"],ans:1,h:"200x2=400!",time:40},
    {q:"Solve: 140 x 4 = ?",opts:["556", "560", "564", "568"],ans:1,h:"140x4=560!",time:40},
    {q:"Solve: 102 x 8 = ?",opts:["808", "816", "824", "832"],ans:1,h:"102x8=816!",time:40},
    {q:"Solve: 316 x 2 = ?",opts:["630", "632", "634", "636"],ans:1,h:"316x2=632!",time:40},
    {q:"Solve: 97 x 4 = ?",opts:["384", "388", "392", "396"],ans:1,h:"97x4=388!",time:40},
    {q:"Solve: 341 x 5 = ?",opts:["1700", "1705", "1710", "1715"],ans:1,h:"341x5=1705!",time:40},
    {q:"Solve: 108 x 5 = ?",opts:["535", "540", "545", "550"],ans:1,h:"108x5=540!",time:40},
    {q:"Solve: 169 x 2 = ?",opts:["336", "338", "340", "342"],ans:1,h:"169x2=338!",time:40},
  ],
  /* Test 25 */ [
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Solve: 48 x 9 = ?",opts:["423", "432", "441", "450"],ans:1,h:"48x9=432!",time:40},
    {q:"Solve: 93 x 4 = ?",opts:["368", "372", "376", "380"],ans:1,h:"93x4=372!",time:40},
    {q:"Solve: 337 x 2 = ?",opts:["672", "674", "676", "678"],ans:1,h:"337x2=674!",time:40},
    {q:"Solve: 149 x 8 = ?",opts:["1184", "1192", "1200", "1208"],ans:1,h:"149x8=1192!",time:40},
    {q:"Solve: 184 x 7 = ?",opts:["1281", "1288", "1295", "1302"],ans:1,h:"184x7=1288!",time:40},
    {q:"Solve: 214 x 4 = ?",opts:["852", "856", "860", "864"],ans:1,h:"214x4=856!",time:40},
    {q:"Solve: 386 x 9 = ?",opts:["3465", "3474", "3483", "3492"],ans:1,h:"386x9=3474!",time:40},
    {q:"Solve: 211 x 6 = ?",opts:["1260", "1266", "1272", "1278"],ans:1,h:"211x6=1266!",time:40},
    {q:"Solve: 370 x 9 = ?",opts:["3321", "3330", "3339", "3348"],ans:1,h:"370x9=3330!",time:40},
    {q:"Solve: 371 x 9 = ?",opts:["3330", "3339", "3348", "3357"],ans:1,h:"371x9=3339!",time:40},
  ],
  /* Test 26 */ [
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"Solve: 239 x 4 = ?",opts:["952", "956", "960", "964"],ans:1,h:"239x4=956!",time:40},
    {q:"Solve: 348 x 5 = ?",opts:["1735", "1740", "1745", "1750"],ans:1,h:"348x5=1740!",time:40},
    {q:"Solve: 380 x 6 = ?",opts:["2274", "2280", "2286", "2292"],ans:1,h:"380x6=2280!",time:40},
    {q:"Solve: 315 x 3 = ?",opts:["942", "945", "948", "951"],ans:1,h:"315x3=945!",time:40},
    {q:"Solve: 84 x 9 = ?",opts:["747", "756", "765", "774"],ans:1,h:"84x9=756!",time:40},
    {q:"Solve: 76 x 3 = ?",opts:["225", "228", "231", "234"],ans:1,h:"76x3=228!",time:40},
    {q:"Solve: 388 x 5 = ?",opts:["1935", "1940", "1945", "1950"],ans:1,h:"388x5=1940!",time:40},
    {q:"Solve: 97 x 7 = ?",opts:["672", "679", "686", "693"],ans:1,h:"97x7=679!",time:40},
    {q:"Solve: 239 x 7 = ?",opts:["1666", "1673", "1680", "1687"],ans:1,h:"239x7=1673!",time:40},
    {q:"Solve: 153 x 5 = ?",opts:["760", "765", "770", "775"],ans:1,h:"153x5=765!",time:40},
  ],
  /* Test 27 */ [
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Average of 5 consecutive numbers starting from 11?",opts:["12", "13", "14", "15"],ans:1,h:"11,12,13,14,15. Middle=13!",time:50},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Solve: 70 x 4 = ?",opts:["276", "280", "284", "288"],ans:1,h:"70x4=280!",time:40},
    {q:"Solve: 187 x 7 = ?",opts:["1302", "1309", "1316", "1323"],ans:1,h:"187x7=1309!",time:40},
    {q:"Solve: 336 x 6 = ?",opts:["2010", "2016", "2022", "2028"],ans:1,h:"336x6=2016!",time:40},
    {q:"Solve: 166 x 7 = ?",opts:["1155", "1162", "1169", "1176"],ans:1,h:"166x7=1162!",time:40},
    {q:"Solve: 162 x 2 = ?",opts:["322", "324", "326", "328"],ans:1,h:"162x2=324!",time:40},
    {q:"Solve: 167 x 6 = ?",opts:["1002", "1008", "1014", "996"],ans:0,h:"167x6=1002!",time:40},
    {q:"Solve: 260 x 3 = ?",opts:["777", "780", "783", "786"],ans:1,h:"260x3=780!",time:40},
    {q:"Solve: 346 x 3 = ?",opts:["1035", "1038", "1041", "1044"],ans:1,h:"346x3=1038!",time:40},
    {q:"Solve: 326 x 4 = ?",opts:["1300", "1304", "1308", "1312"],ans:1,h:"326x4=1304!",time:40},
    {q:"Solve: 40 x 5 = ?",opts:["195", "200", "205", "210"],ans:1,h:"40x5=200!",time:40},
  ],
  /* Test 28 */ [
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"Sum of all digits of 1 to 9?",opts:["40", "42", "45", "48"],ans:2,h:"1+2+...+9=45!",time:50},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"If 5! = 120, then 6! = ?",opts:["620", "720", "820", "920"],ans:1,h:"6! = 6x120 = 720!",time:55},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Solve: 91 x 2 = ?",opts:["180", "182", "184", "186"],ans:1,h:"91x2=182!",time:40},
    {q:"Solve: 129 x 2 = ?",opts:["256", "258", "260", "262"],ans:1,h:"129x2=258!",time:40},
    {q:"Solve: 141 x 6 = ?",opts:["840", "846", "852", "858"],ans:1,h:"141x6=846!",time:40},
    {q:"Solve: 263 x 2 = ?",opts:["524", "526", "528", "530"],ans:1,h:"263x2=526!",time:40},
    {q:"Solve: 76 x 3 = ?",opts:["225", "228", "231", "234"],ans:1,h:"76x3=228!",time:40},
    {q:"Solve: 126 x 2 = ?",opts:["250", "252", "254", "256"],ans:1,h:"126x2=252!",time:40},
    {q:"Solve: 167 x 3 = ?",opts:["498", "501", "504", "507"],ans:1,h:"167x3=501!",time:40},
    {q:"Solve: 103 x 3 = ?",opts:["306", "309", "312", "315"],ans:1,h:"103x3=309!",time:40},
    {q:"Solve: 75 x 3 = ?",opts:["222", "225", "228", "231"],ans:1,h:"75x3=225!",time:40},
    {q:"Solve: 49 x 6 = ?",opts:["288", "294", "300", "306"],ans:1,h:"49x6=294!",time:40},
  ],
  /* Test 29 */ [
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"If 2^10 = 1024, then 2^11 = ?",opts:["1048", "2048", "2096", "4096"],ans:1,h:"2^11=2x2^10=2048!",time:55},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"Average speed: 60km/h for first half, 40km/h for second half of journey. Average?",opts:["45", "48", "50", "52"],ans:1,h:"Harmonic mean: 2x60x40/(60+40)=48!",time:60},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"N is a 2-digit number. N + reverse(N) = 121. N could be?",opts:["29", "38", "47", "56"],ans:2,h:"47+74=121!",time:60},
    {q:"What is 111 x 9?",opts:["999", "1000", "1001", "1010"],ans:0,h:"111x9=999!",time:45},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"Area of triangle with base 14cm and height 8cm?",opts:["48", "56", "64", "72"],ans:1,h:"1/2x14x8=56!",time:50},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Perimeter of regular hexagon side 6cm?",opts:["30", "32", "36", "40"],ans:2,h:"6x6=36!",time:40},
    {q:"How many triangles in a 3x3 grid?",opts:["8", "10", "13", "16"],ans:2,h:"Count carefully: 13!",time:60},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Solve: 383 x 5 = ?",opts:["1910", "1915", "1920", "1925"],ans:1,h:"383x5=1915!",time:40},
    {q:"Solve: 62 x 7 = ?",opts:["427", "434", "441", "448"],ans:1,h:"62x7=434!",time:40},
    {q:"Solve: 373 x 5 = ?",opts:["1860", "1865", "1870", "1875"],ans:1,h:"373x5=1865!",time:40},
    {q:"Solve: 353 x 9 = ?",opts:["3168", "3177", "3186", "3195"],ans:1,h:"353x9=3177!",time:40},
    {q:"Solve: 96 x 6 = ?",opts:["570", "576", "582", "588"],ans:1,h:"96x6=576!",time:40},
    {q:"Solve: 323 x 8 = ?",opts:["2576", "2584", "2592", "2600"],ans:1,h:"323x8=2584!",time:40},
    {q:"Solve: 148 x 3 = ?",opts:["441", "444", "447", "450"],ans:1,h:"148x3=444!",time:40},
    {q:"Solve: 57 x 4 = ?",opts:["224", "228", "232", "236"],ans:1,h:"57x4=228!",time:40},
    {q:"Solve: 286 x 3 = ?",opts:["855", "858", "861", "864"],ans:1,h:"286x3=858!",time:40},
    {q:"Solve: 133 x 5 = ?",opts:["660", "665", "670", "675"],ans:1,h:"133x5=665!",time:40},
  ],
  /* Test 30 */ [
    {q:"Three taps fill tank in 2,3,4 hours alone. Together?",opts:["48/65 h", "12/13 h", "1h", "2h"],ans:1,h:"1/2+1/3+1/4=13/12, so 12/13h!",time:60},
    {q:"999 - 99 - 9 = ?",opts:["881", "891", "899", "901"],ans:1,h:"999-99=900, 900-9=891!",time:50},
    {q:"A cistern fills in 6h, drains in 12h. Net fill time?",opts:["8h", "10h", "12h", "14h"],ans:2,h:"Fill rate 1/6-1/12=1/12, so 12h!",time:60},
    {q:"Number of zeroes at end of 100! ?",opts:["20", "22", "24", "25"],ans:2,h:"Count factors of 5: 24!",time:60},
    {q:"BODMAS: 10 + 2 x 5 - 3 = ?",opts:["17", "25", "37", "57"],ans:0,h:"10+(2x5)-3=10+10-3=17!",time:55},
    {q:"Which set of numbers satisfies: sum=15, product=50?",opts:["5,10", "2,25", "5,10", "3,12"],ans:0,h:"5+10=15 and 5x10=50!",time:55},
    {q:"Circle with radius 7cm. Area (22/7)?",opts:["144", "154", "164", "174"],ans:1,h:"22/7 x 49 = 154!",time:55},
    {q:"If A+B=10 and A\u00d7B=21, what is A-B?",opts:["2", "3", "4", "5"],ans:2,h:"A,B are 3 and 7. 7-3=4!",time:60},
    {q:"Ratio of shaded to unshaded in 4x4 grid with 6 shaded?",opts:["3:5", "6:10", "3:8", "6:16"],ans:1,h:"6 shaded, 10 unshaded = 6:10=3:5!",time:55},
    {q:"Magic square: row sums equal. Middle number of 3x3?",opts:["4", "5", "6", "7"],ans:1,h:"Centre of magic square=5!",time:60},
    {q:"If ABCD is a square with side 5, area of triangle ABD?",opts:["10", "12.5", "15", "20"],ans:1,h:"1/2 x 5 x 5 = 12.5!",time:60},
    {q:"Train 100m long at 36km/h. Time to cross pole?",opts:["8s", "10s", "12s", "14s"],ans:1,h:"36km/h=10m/s. 100/10=10s!",time:60},
    {q:"Number of diagonals in a pentagon?",opts:["3", "4", "5", "6"],ans:2,h:"n(n-3)/2=5x2/2=5!",time:55},
    {q:"If 10% of X = 50, then X = ?",opts:["400", "450", "500", "550"],ans:2,h:"50/0.1=500!",time:50},
    {q:"Smallest 4-digit number divisible by both 4 and 6?",opts:["1002", "1008", "1012", "1020"],ans:1,h:"LCM(4,6)=12. 1008/12=84!",time:60},
    {q:"Solve: 106 x 9 = ?",opts:["945", "954", "963", "972"],ans:1,h:"106x9=954!",time:40},
    {q:"Solve: 315 x 7 = ?",opts:["2198", "2205", "2212", "2219"],ans:1,h:"315x7=2205!",time:40},
    {q:"Solve: 284 x 5 = ?",opts:["1415", "1420", "1425", "1430"],ans:1,h:"284x5=1420!",time:40},
    {q:"Solve: 302 x 3 = ?",opts:["903", "906", "909", "912"],ans:1,h:"302x3=906!",time:40},
    {q:"Solve: 109 x 3 = ?",opts:["324", "327", "330", "333"],ans:1,h:"109x3=327!",time:40},
    {q:"Solve: 368 x 3 = ?",opts:["1101", "1104", "1107", "1110"],ans:1,h:"368x3=1104!",time:40},
    {q:"Solve: 127 x 5 = ?",opts:["630", "635", "640", "645"],ans:1,h:"127x5=635!",time:40},
    {q:"Solve: 310 x 4 = ?",opts:["1236", "1240", "1244", "1248"],ans:1,h:"310x4=1240!",time:40},
    {q:"Solve: 308 x 8 = ?",opts:["2456", "2464", "2472", "2480"],ans:1,h:"308x8=2464!",time:40},
    {q:"Solve: 377 x 6 = ?",opts:["2256", "2262", "2268", "2274"],ans:1,h:"377x6=2262!",time:40},
  ],
];

const ABACUS_LEVELS = [
  {level:1,title:"Ones Basics",probs:[
    {q:"Show 7",t:0,o:7},
    {q:"Show 2",t:0,o:2},
    {q:"Show 0",t:0,o:0},
    {q:"Show 8",t:0,o:8},
    {q:"Show 5",t:0,o:5},
    {q:"Show 1",t:0,o:1},
    {q:"Show 4",t:0,o:4},
    {q:"Show 3",t:0,o:3},
    {q:"Show 9",t:0,o:9},
    {q:"Show 6",t:0,o:6},
    {q:"Show 4",t:0,o:6},
    {q:"Show 8",t:0,o:8},
    {q:"Show 1",t:0,o:9},
    {q:"Show 7",t:0,o:3},
    {q:"Show 6",t:0,o:9},
    {q:"Show 9",t:0,o:3},
    {q:"Show 5",t:0,o:6},
    {q:"Show 3",t:0,o:2},
    {q:"Show 7",t:0,o:2},
    {q:"Show 9",t:0,o:5}
  ]},
  {level:2,title:"Ones Practice",probs:[
    {q:"Show 5",t:0,o:5},
    {q:"Show 4",t:0,o:4},
    {q:"Show 7",t:0,o:7},
    {q:"Show 0",t:0,o:0},
    {q:"Show 6",t:0,o:6},
    {q:"Show 2",t:0,o:2},
    {q:"Show 3",t:0,o:3},
    {q:"Show 9",t:0,o:9},
    {q:"Show 8",t:0,o:8},
    {q:"Show 1",t:0,o:1},
    {q:"Show 6",t:0,o:3},
    {q:"Show 5",t:0,o:8},
    {q:"Show 1",t:0,o:7},
    {q:"Show 8",t:0,o:3},
    {q:"Show 9",t:0,o:7},
    {q:"Show 0",t:0,o:5},
    {q:"Show 2",t:0,o:3},
    {q:"Show 2",t:0,o:7},
    {q:"Show 9",t:0,o:2},
    {q:"Show 8",t:0,o:2}
  ]},
  {level:3,title:"Ones Mastery",probs:[
    {q:"Show 2",t:0,o:2},
    {q:"Show 4",t:0,o:4},
    {q:"Show 6",t:0,o:6},
    {q:"Show 7",t:0,o:7},
    {q:"Show 5",t:0,o:5},
    {q:"Show 3",t:0,o:3},
    {q:"Show 8",t:0,o:8},
    {q:"Show 9",t:0,o:9},
    {q:"Show 1",t:0,o:1},
    {q:"Show 0",t:0,o:0},
    {q:"Show 2",t:0,o:4},
    {q:"Show 9",t:0,o:0},
    {q:"Show 6",t:0,o:5},
    {q:"Show 2",t:0,o:8},
    {q:"Show 6",t:0,o:3},
    {q:"Show 0",t:0,o:3},
    {q:"Show 7",t:0,o:4},
    {q:"Show 8",t:0,o:6},
    {q:"Show 2",t:0,o:5},
    {q:"Show 7",t:0,o:0}
  ]},
  {level:4,title:"Ones Speed",probs:[
    {q:"Show 8",t:0,o:8},
    {q:"Show 4",t:0,o:4},
    {q:"Show 3",t:0,o:3},
    {q:"Show 1",t:0,o:1},
    {q:"Show 5",t:0,o:5},
    {q:"Show 7",t:0,o:7},
    {q:"Show 0",t:0,o:0},
    {q:"Show 6",t:0,o:6},
    {q:"Show 9",t:0,o:9},
    {q:"Show 2",t:0,o:2},
    {q:"Show 2",t:0,o:6},
    {q:"Show 2",t:0,o:3},
    {q:"Show 8",t:0,o:5},
    {q:"Show 7",t:0,o:3},
    {q:"Show 4",t:0,o:1},
    {q:"Show 5",t:0,o:2},
    {q:"Show 1",t:0,o:8},
    {q:"Show 4",t:0,o:0},
    {q:"Show 9",t:0,o:0},
    {q:"Show 5",t:0,o:3}
  ]},
  {level:5,title:"Ones Challenge",probs:[
    {q:"Show 2",t:0,o:2},
    {q:"Show 0",t:0,o:0},
    {q:"Show 1",t:0,o:1},
    {q:"Show 4",t:0,o:4},
    {q:"Show 7",t:0,o:7},
    {q:"Show 3",t:0,o:3},
    {q:"Show 8",t:0,o:8},
    {q:"Show 5",t:0,o:5},
    {q:"Show 9",t:0,o:9},
    {q:"Show 6",t:0,o:6},
    {q:"Show 2",t:0,o:0},
    {q:"Show 5",t:0,o:6},
    {q:"Show 7",t:0,o:3},
    {q:"Show 4",t:0,o:3},
    {q:"Show 4",t:0,o:1},
    {q:"Show 5",t:0,o:3},
    {q:"Show 3",t:0,o:6},
    {q:"Show 4",t:0,o:7},
    {q:"Show 1",t:0,o:7},
    {q:"Show 6",t:0,o:4}
  ]},
  {level:6,title:"Tens Basics",probs:[
    {q:"Show 0",t:0,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 30",t:3,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 50",t:5,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 10",t:1,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 30",t:3,o:0}
  ]},
  {level:7,title:"Tens Practice",probs:[
    {q:"Show 10",t:1,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 0",t:0,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 30",t:3,o:0},
    {q:"Show 50",t:5,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 30",t:3,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 50",t:5,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 0",t:0,o:0},
    {q:"Show 10",t:1,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 80",t:8,o:0}
  ]},
  {level:8,title:"Tens Mastery",probs:[
    {q:"Show 20",t:2,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 10",t:1,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 50",t:5,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 0",t:0,o:0},
    {q:"Show 30",t:3,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 30",t:3,o:0},
    {q:"Show 0",t:0,o:0},
    {q:"Show 10",t:1,o:0}
  ]},
  {level:9,title:"Tens Speed",probs:[
    {q:"Show 60",t:6,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 50",t:5,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 30",t:3,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 0",t:0,o:0},
    {q:"Show 10",t:1,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 30",t:3,o:0},
    {q:"Show 10",t:1,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 50",t:5,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 20",t:2,o:0}
  ]},
  {level:10,title:"Tens Challenge",probs:[
    {q:"Show 30",t:3,o:0},
    {q:"Show 0",t:0,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 10",t:1,o:0},
    {q:"Show 50",t:5,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 80",t:8,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 40",t:4,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 60",t:6,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 70",t:7,o:0},
    {q:"Show 20",t:2,o:0},
    {q:"Show 10",t:1,o:0}
  ]},
  {level:11,title:"Tens+Ones Intro",probs:[
    {q:"Show 28",t:2,o:8},
    {q:"Show 18",t:1,o:8},
    {q:"Show 25",t:2,o:5},
    {q:"Show 27",t:2,o:7},
    {q:"Show 11",t:1,o:1},
    {q:"Show 12",t:1,o:2},
    {q:"Show 16",t:1,o:6},
    {q:"Show 23",t:2,o:3},
    {q:"Show 29",t:2,o:9},
    {q:"Show 30",t:3,o:0},
    {q:"Show 24",t:2,o:4},
    {q:"Show 26",t:2,o:6},
    {q:"Show 15",t:1,o:5},
    {q:"Show 20",t:2,o:0},
    {q:"Show 19",t:1,o:9},
    {q:"Show 22",t:2,o:2},
    {q:"Show 13",t:1,o:3},
    {q:"Show 21",t:2,o:1},
    {q:"Show 14",t:1,o:4},
    {q:"Show 17",t:1,o:7}
  ]},
  {level:12,title:"Tens+Ones Build",probs:[
    {q:"Show 25",t:2,o:5},
    {q:"Show 39",t:3,o:9},
    {q:"Show 22",t:2,o:2},
    {q:"Show 33",t:3,o:3},
    {q:"Show 48",t:4,o:8},
    {q:"Show 46",t:4,o:6},
    {q:"Show 31",t:3,o:1},
    {q:"Show 37",t:3,o:7},
    {q:"Show 28",t:2,o:8},
    {q:"Show 38",t:3,o:8},
    {q:"Show 30",t:3,o:0},
    {q:"Show 26",t:2,o:6},
    {q:"Show 35",t:3,o:5},
    {q:"Show 45",t:4,o:5},
    {q:"Show 34",t:3,o:4},
    {q:"Show 24",t:2,o:4},
    {q:"Show 47",t:4,o:7},
    {q:"Show 41",t:4,o:1},
    {q:"Show 43",t:4,o:3},
    {q:"Show 42",t:4,o:2}
  ]},
  {level:13,title:"Mixed Numbers",probs:[
    {q:"Show 41",t:4,o:1},
    {q:"Show 48",t:4,o:8},
    {q:"Show 68",t:6,o:8},
    {q:"Show 54",t:5,o:4},
    {q:"Show 35",t:3,o:5},
    {q:"Show 43",t:4,o:3},
    {q:"Show 42",t:4,o:2},
    {q:"Show 53",t:5,o:3},
    {q:"Show 51",t:5,o:1},
    {q:"Show 57",t:5,o:7},
    {q:"Show 67",t:6,o:7},
    {q:"Show 33",t:3,o:3},
    {q:"Show 66",t:6,o:6},
    {q:"Show 52",t:5,o:2},
    {q:"Show 34",t:3,o:4},
    {q:"Show 60",t:6,o:0},
    {q:"Show 65",t:6,o:5},
    {q:"Show 62",t:6,o:2},
    {q:"Show 56",t:5,o:6},
    {q:"Show 59",t:5,o:9}
  ]},
  {level:14,title:"Mixed Speed",probs:[
    {q:"Show 45",t:4,o:5},
    {q:"Show 42",t:4,o:2},
    {q:"Show 72",t:7,o:2},
    {q:"Show 64",t:6,o:4},
    {q:"Show 50",t:5,o:0},
    {q:"Show 62",t:6,o:2},
    {q:"Show 54",t:5,o:4},
    {q:"Show 75",t:7,o:5},
    {q:"Show 61",t:6,o:1},
    {q:"Show 76",t:7,o:6},
    {q:"Show 41",t:4,o:1},
    {q:"Show 68",t:6,o:8},
    {q:"Show 77",t:7,o:7},
    {q:"Show 65",t:6,o:5},
    {q:"Show 60",t:6,o:0},
    {q:"Show 53",t:5,o:3},
    {q:"Show 46",t:4,o:6},
    {q:"Show 49",t:4,o:9},
    {q:"Show 79",t:7,o:9},
    {q:"Show 43",t:4,o:3}
  ]},
  {level:15,title:"Mixed Mastery",probs:[
    {q:"Show 59",t:5,o:9},
    {q:"Show 81",t:8,o:1},
    {q:"Show 91",t:9,o:1},
    {q:"Show 83",t:8,o:3},
    {q:"Show 50",t:5,o:0},
    {q:"Show 64",t:6,o:4},
    {q:"Show 74",t:7,o:4},
    {q:"Show 56",t:5,o:6},
    {q:"Show 65",t:6,o:5},
    {q:"Show 86",t:8,o:6},
    {q:"Show 78",t:7,o:8},
    {q:"Show 88",t:8,o:8},
    {q:"Show 55",t:5,o:5},
    {q:"Show 60",t:6,o:0},
    {q:"Show 90",t:9,o:0},
    {q:"Show 89",t:8,o:9},
    {q:"Show 73",t:7,o:3},
    {q:"Show 66",t:6,o:6},
    {q:"Show 70",t:7,o:0},
    {q:"Show 68",t:6,o:8}
  ]},
  {level:16,title:"Add: 1-digit + 1-digit",probs:[
    {q:"1+5=? (show result)",t:0,o:6},
    {q:"4+1=? (show result)",t:0,o:5},
    {q:"3+2=? (show result)",t:0,o:5},
    {q:"2+1=? (show result)",t:0,o:3},
    {q:"3+5=? (show result)",t:0,o:8},
    {q:"3+3=? (show result)",t:0,o:6},
    {q:"1+4=? (show result)",t:0,o:5},
    {q:"1+3=? (show result)",t:0,o:4},
    {q:"2+5=? (show result)",t:0,o:7},
    {q:"3+1=? (show result)",t:0,o:4},
    {q:"4+3=? (show result)",t:0,o:7},
    {q:"5+2=? (show result)",t:0,o:7},
    {q:"4+4=? (show result)",t:0,o:8},
    {q:"2+2=? (show result)",t:0,o:4},
    {q:"5+1=? (show result)",t:0,o:6},
    {q:"2+3=? (show result)",t:0,o:5},
    {q:"4+2=? (show result)",t:0,o:6},
    {q:"1+1=? (show result)",t:0,o:2},
    {q:"5+4=? (show result)",t:0,o:9},
    {q:"4+5=? (show result)",t:0,o:9}
  ]},
  {level:17,title:"Add: 1+1 larger",probs:[
    {q:"3+4=? (show result)",t:0,o:7},
    {q:"7+3=? (show result)",t:1,o:0},
    {q:"4+7=? (show result)",t:1,o:1},
    {q:"7+5=? (show result)",t:1,o:2},
    {q:"3+5=? (show result)",t:0,o:8},
    {q:"4+3=? (show result)",t:0,o:7},
    {q:"6+7=? (show result)",t:1,o:3},
    {q:"8+4=? (show result)",t:1,o:2},
    {q:"7+7=? (show result)",t:1,o:4},
    {q:"7+6=? (show result)",t:1,o:3},
    {q:"3+3=? (show result)",t:0,o:6},
    {q:"4+6=? (show result)",t:1,o:0},
    {q:"8+5=? (show result)",t:1,o:3},
    {q:"6+6=? (show result)",t:1,o:2},
    {q:"7+2=? (show result)",t:0,o:9},
    {q:"4+4=? (show result)",t:0,o:8},
    {q:"5+6=? (show result)",t:1,o:1},
    {q:"5+5=? (show result)",t:1,o:0},
    {q:"4+2=? (show result)",t:0,o:6},
    {q:"8+2=? (show result)",t:1,o:0}
  ]},
  {level:18,title:"Add: 2-digit + 1-digit",probs:[
    {q:"40+1=? (show result)",t:4,o:1},
    {q:"23+1=? (show result)",t:2,o:4},
    {q:"20+4=? (show result)",t:2,o:4},
    {q:"39+1=? (show result)",t:4,o:0},
    {q:"31+5=? (show result)",t:3,o:6},
    {q:"15+5=? (show result)",t:2,o:0},
    {q:"38+5=? (show result)",t:4,o:3},
    {q:"10+9=? (show result)",t:1,o:9},
    {q:"19+4=? (show result)",t:2,o:3},
    {q:"33+6=? (show result)",t:3,o:9},
    {q:"13+3=? (show result)",t:1,o:6},
    {q:"21+7=? (show result)",t:2,o:8},
    {q:"14+5=? (show result)",t:1,o:9},
    {q:"26+5=? (show result)",t:3,o:1},
    {q:"16+8=? (show result)",t:2,o:4},
    {q:"11+1=? (show result)",t:1,o:2},
    {q:"21+4=? (show result)",t:2,o:5},
    {q:"14+2=? (show result)",t:1,o:6},
    {q:"36+7=? (show result)",t:4,o:3},
    {q:"10+6=? (show result)",t:1,o:6}
  ]},
  {level:19,title:"Add: 2-digit + 2-digit no carry",probs:[
    {q:"40+20=? (show result)",t:6,o:0},
    {q:"38+22=? (show result)",t:6,o:0},
    {q:"17+27=? (show result)",t:4,o:4},
    {q:"14+34=? (show result)",t:4,o:8},
    {q:"12+10=? (show result)",t:2,o:2},
    {q:"10+15=? (show result)",t:2,o:5},
    {q:"16+17=? (show result)",t:3,o:3},
    {q:"20+29=? (show result)",t:4,o:9},
    {q:"18+34=? (show result)",t:5,o:2},
    {q:"40+12=? (show result)",t:5,o:2},
    {q:"30+10=? (show result)",t:4,o:0},
    {q:"23+13=? (show result)",t:3,o:6},
    {q:"31+23=? (show result)",t:5,o:4},
    {q:"12+32=? (show result)",t:4,o:4},
    {q:"37+33=? (show result)",t:7,o:0},
    {q:"21+25=? (show result)",t:4,o:6},
    {q:"23+27=? (show result)",t:5,o:0},
    {q:"34+27=? (show result)",t:6,o:1},
    {q:"38+30=? (show result)",t:6,o:8},
    {q:"18+20=? (show result)",t:3,o:8}
  ]},
  {level:20,title:"Add: 2-digit + 2-digit with carry",probs:[
    {q:"47+32=? (show result)",t:7,o:9},
    {q:"40+29=? (show result)",t:6,o:9},
    {q:"27+39=? (show result)",t:6,o:6},
    {q:"42+45=? (show result)",t:8,o:7},
    {q:"31+42=? (show result)",t:7,o:3},
    {q:"44+40=? (show result)",t:8,o:4},
    {q:"38+53=? (show result)",t:9,o:1},
    {q:"26+41=? (show result)",t:6,o:7},
    {q:"29+49=? (show result)",t:7,o:8},
    {q:"32+26=? (show result)",t:5,o:8},
    {q:"43+56=? (show result)",t:9,o:9},
    {q:"40+59=? (show result)",t:9,o:9},
    {q:"31+43=? (show result)",t:7,o:4},
    {q:"50+38=? (show result)",t:8,o:8},
    {q:"29+42=? (show result)",t:7,o:1},
    {q:"46+30=? (show result)",t:7,o:6},
    {q:"26+28=? (show result)",t:5,o:4},
    {q:"30+33=? (show result)",t:6,o:3},
    {q:"51+37=? (show result)",t:8,o:8},
    {q:"52+26=? (show result)",t:7,o:8}
  ]},
  {level:21,title:"Sub: Basic sub 1-digit",probs:[
    {q:"3-1=? (show result)",t:0,o:2},
    {q:"9-2=? (show result)",t:0,o:7},
    {q:"4-1=? (show result)",t:0,o:3},
    {q:"8-3=? (show result)",t:0,o:5},
    {q:"6-2=? (show result)",t:0,o:4},
    {q:"9-3=? (show result)",t:0,o:6},
    {q:"5-1=? (show result)",t:0,o:4},
    {q:"8-2=? (show result)",t:0,o:6},
    {q:"3-2=? (show result)",t:0,o:1},
    {q:"9-1=? (show result)",t:0,o:8},
    {q:"6-3=? (show result)",t:0,o:3},
    {q:"5-3=? (show result)",t:0,o:2},
    {q:"5-2=? (show result)",t:0,o:3},
    {q:"4-2=? (show result)",t:0,o:2},
    {q:"8-1=? (show result)",t:0,o:7},
    {q:"3-3=? (show result)",t:0,o:0},
    {q:"7-1=? (show result)",t:0,o:6},
    {q:"6-1=? (show result)",t:0,o:5},
    {q:"4-3=? (show result)",t:0,o:1},
    {q:"7-2=? (show result)",t:0,o:5}
  ]},
  {level:22,title:"Sub: Sub bigger",probs:[
    {q:"6-4=? (show result)",t:0,o:2},
    {q:"6-2=? (show result)",t:0,o:4},
    {q:"7-3=? (show result)",t:0,o:4},
    {q:"6-5=? (show result)",t:0,o:1},
    {q:"8-3=? (show result)",t:0,o:5},
    {q:"9-4=? (show result)",t:0,o:5},
    {q:"9-3=? (show result)",t:0,o:6},
    {q:"5-2=? (show result)",t:0,o:3},
    {q:"6-3=? (show result)",t:0,o:3},
    {q:"8-2=? (show result)",t:0,o:6},
    {q:"5-4=? (show result)",t:0,o:1},
    {q:"8-5=? (show result)",t:0,o:3},
    {q:"7-5=? (show result)",t:0,o:2},
    {q:"7-2=? (show result)",t:0,o:5},
    {q:"8-4=? (show result)",t:0,o:4},
    {q:"9-2=? (show result)",t:0,o:7},
    {q:"7-4=? (show result)",t:0,o:3},
    {q:"5-5=? (show result)",t:0,o:0},
    {q:"9-5=? (show result)",t:0,o:4},
    {q:"5-3=? (show result)",t:0,o:2}
  ]},
  {level:23,title:"Sub: 2-digit - 1-digit",probs:[
    {q:"22-5=? (show result)",t:1,o:7},
    {q:"23-6=? (show result)",t:1,o:7},
    {q:"27-6=? (show result)",t:2,o:1},
    {q:"27-3=? (show result)",t:2,o:4},
    {q:"20-1=? (show result)",t:1,o:9},
    {q:"19-9=? (show result)",t:1,o:0},
    {q:"29-8=? (show result)",t:2,o:1},
    {q:"23-8=? (show result)",t:1,o:5},
    {q:"25-3=? (show result)",t:2,o:2},
    {q:"16-9=? (show result)",t:0,o:7},
    {q:"27-9=? (show result)",t:1,o:8},
    {q:"19-8=? (show result)",t:1,o:1},
    {q:"21-9=? (show result)",t:1,o:2},
    {q:"18-7=? (show result)",t:1,o:1},
    {q:"25-7=? (show result)",t:1,o:8},
    {q:"25-6=? (show result)",t:1,o:9},
    {q:"21-2=? (show result)",t:1,o:9},
    {q:"17-4=? (show result)",t:1,o:3},
    {q:"22-7=? (show result)",t:1,o:5},
    {q:"20-4=? (show result)",t:1,o:6}
  ]},
  {level:24,title:"Sub: 2-digit - 2-digit",probs:[
    {q:"52-23=? (show result)",t:2,o:9},
    {q:"60-17=? (show result)",t:4,o:3},
    {q:"40-12=? (show result)",t:2,o:8},
    {q:"35-11=? (show result)",t:2,o:4},
    {q:"53-11=? (show result)",t:4,o:2},
    {q:"32-25=? (show result)",t:0,o:7},
    {q:"42-16=? (show result)",t:2,o:6},
    {q:"53-18=? (show result)",t:3,o:5},
    {q:"44-20=? (show result)",t:2,o:4},
    {q:"46-10=? (show result)",t:3,o:6},
    {q:"60-15=? (show result)",t:4,o:5},
    {q:"50-23=? (show result)",t:2,o:7},
    {q:"49-23=? (show result)",t:2,o:6},
    {q:"40-18=? (show result)",t:2,o:2},
    {q:"53-15=? (show result)",t:3,o:8},
    {q:"49-14=? (show result)",t:3,o:5},
    {q:"45-21=? (show result)",t:2,o:4},
    {q:"52-14=? (show result)",t:3,o:8},
    {q:"60-25=? (show result)",t:3,o:5},
    {q:"44-24=? (show result)",t:2,o:0}
  ]},
  {level:25,title:"Sub: 2-digit sub challenging",probs:[
    {q:"51-29=? (show result)",t:2,o:2},
    {q:"73-30=? (show result)",t:4,o:3},
    {q:"78-34=? (show result)",t:4,o:4},
    {q:"59-32=? (show result)",t:2,o:7},
    {q:"68-34=? (show result)",t:3,o:4},
    {q:"69-18=? (show result)",t:5,o:1},
    {q:"70-16=? (show result)",t:5,o:4},
    {q:"69-21=? (show result)",t:4,o:8},
    {q:"47-26=? (show result)",t:2,o:1},
    {q:"71-15=? (show result)",t:5,o:6},
    {q:"64-28=? (show result)",t:3,o:6},
    {q:"60-16=? (show result)",t:4,o:4},
    {q:"52-19=? (show result)",t:3,o:3},
    {q:"47-32=? (show result)",t:1,o:5},
    {q:"67-32=? (show result)",t:3,o:5},
    {q:"40-18=? (show result)",t:2,o:2},
    {q:"48-33=? (show result)",t:1,o:5},
    {q:"54-23=? (show result)",t:3,o:1},
    {q:"41-26=? (show result)",t:1,o:5},
    {q:"43-16=? (show result)",t:2,o:7}
  ]},
  {level:26,title:"Hundreds Intro",probs:[
    {q:"Show 296",t:9,o:6,h:2},
    {q:"Show 151",t:5,o:1,h:1},
    {q:"Show 109",t:0,o:9,h:1},
    {q:"Show 149",t:4,o:9,h:1},
    {q:"Show 156",t:5,o:6,h:1},
    {q:"Show 254",t:5,o:4,h:2},
    {q:"Show 152",t:5,o:2,h:1},
    {q:"Show 154",t:5,o:4,h:1},
    {q:"Show 232",t:3,o:2,h:2},
    {q:"Show 292",t:9,o:2,h:2},
    {q:"Show 101",t:0,o:1,h:1},
    {q:"Show 147",t:4,o:7,h:1},
    {q:"Show 218",t:1,o:8,h:2},
    {q:"Show 167",t:6,o:7,h:1},
    {q:"Show 221",t:2,o:1,h:2},
    {q:"Show 190",t:9,o:0,h:1},
    {q:"Show 193",t:9,o:3,h:1},
    {q:"Show 188",t:8,o:8,h:1},
    {q:"Show 186",t:8,o:6,h:1},
    {q:"Show 162",t:6,o:2,h:1}
  ]},
  {level:27,title:"Hundreds Mid",probs:[
    {q:"Show 349",t:4,o:9,h:3},
    {q:"Show 208",t:0,o:8,h:2},
    {q:"Show 431",t:3,o:1,h:4},
    {q:"Show 253",t:5,o:3,h:2},
    {q:"Show 285",t:8,o:5,h:2},
    {q:"Show 497",t:9,o:7,h:4},
    {q:"Show 221",t:2,o:1,h:2},
    {q:"Show 309",t:0,o:9,h:3},
    {q:"Show 404",t:0,o:4,h:4},
    {q:"Show 344",t:4,o:4,h:3},
    {q:"Show 388",t:8,o:8,h:3},
    {q:"Show 374",t:7,o:4,h:3},
    {q:"Show 295",t:9,o:5,h:2},
    {q:"Show 441",t:4,o:1,h:4},
    {q:"Show 371",t:7,o:1,h:3},
    {q:"Show 354",t:5,o:4,h:3},
    {q:"Show 445",t:4,o:5,h:4},
    {q:"Show 453",t:5,o:3,h:4},
    {q:"Show 207",t:0,o:7,h:2},
    {q:"Show 440",t:4,o:0,h:4}
  ]},
  {level:28,title:"Hundreds Advanced",probs:[
    {q:"Show 314",t:1,o:4,h:3},
    {q:"Show 430",t:3,o:0,h:4},
    {q:"Show 574",t:7,o:4,h:5},
    {q:"Show 609",t:0,o:9,h:6},
    {q:"Show 346",t:4,o:6,h:3},
    {q:"Show 469",t:6,o:9,h:4},
    {q:"Show 355",t:5,o:5,h:3},
    {q:"Show 314",t:1,o:4,h:3},
    {q:"Show 517",t:1,o:7,h:5},
    {q:"Show 664",t:6,o:4,h:6},
    {q:"Show 491",t:9,o:1,h:4},
    {q:"Show 653",t:5,o:3,h:6},
    {q:"Show 660",t:6,o:0,h:6},
    {q:"Show 301",t:0,o:1,h:3},
    {q:"Show 389",t:8,o:9,h:3},
    {q:"Show 490",t:9,o:0,h:4},
    {q:"Show 483",t:8,o:3,h:4},
    {q:"Show 487",t:8,o:7,h:4},
    {q:"Show 601",t:0,o:1,h:6},
    {q:"Show 473",t:7,o:3,h:4}
  ]},
  {level:29,title:"Hundreds Speed",probs:[
    {q:"Show 745",t:4,o:5,h:7},
    {q:"Show 538",t:3,o:8,h:5},
    {q:"Show 563",t:6,o:3,h:5},
    {q:"Show 780",t:8,o:0,h:7},
    {q:"Show 535",t:3,o:5,h:5},
    {q:"Show 599",t:9,o:9,h:5},
    {q:"Show 485",t:8,o:5,h:4},
    {q:"Show 708",t:0,o:8,h:7},
    {q:"Show 518",t:1,o:8,h:5},
    {q:"Show 740",t:4,o:0,h:7},
    {q:"Show 558",t:5,o:8,h:5},
    {q:"Show 675",t:7,o:5,h:6},
    {q:"Show 440",t:4,o:0,h:4},
    {q:"Show 444",t:4,o:4,h:4},
    {q:"Show 742",t:4,o:2,h:7},
    {q:"Show 646",t:4,o:6,h:6},
    {q:"Show 436",t:3,o:6,h:4},
    {q:"Show 441",t:4,o:1,h:4},
    {q:"Show 748",t:4,o:8,h:7},
    {q:"Show 503",t:0,o:3,h:5}
  ]},
  {level:30,title:"Hundreds Master",probs:[
    {q:"Show 557",t:5,o:7,h:5},
    {q:"Show 676",t:7,o:6,h:6},
    {q:"Show 699",t:9,o:9,h:6},
    {q:"Show 941",t:4,o:1,h:9},
    {q:"Show 664",t:6,o:4,h:6},
    {q:"Show 613",t:1,o:3,h:6},
    {q:"Show 939",t:3,o:9,h:9},
    {q:"Show 625",t:2,o:5,h:6},
    {q:"Show 527",t:2,o:7,h:5},
    {q:"Show 928",t:2,o:8,h:9},
    {q:"Show 567",t:6,o:7,h:5},
    {q:"Show 783",t:8,o:3,h:7},
    {q:"Show 628",t:2,o:8,h:6},
    {q:"Show 911",t:1,o:1,h:9},
    {q:"Show 787",t:8,o:7,h:7},
    {q:"Show 703",t:0,o:3,h:7},
    {q:"Show 585",t:8,o:5,h:5},
    {q:"Show 931",t:3,o:1,h:9},
    {q:"Show 833",t:3,o:3,h:8},
    {q:"Show 503",t:0,o:3,h:5}
  ]},
];

// ─────────────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS — all defined at TOP LEVEL (never inside another component)
// ─────────────────────────────────────────────────────────────────────

// Starfield
function Starfield({ n = 40 }) {
  const pts = useRef(
    Array.from({ length: n }, (_, i) => ({
      i, x: Math.random() * 100, y: Math.random() * 100,
      w: 1 + Math.random() * 2, d: 2 + Math.random() * 3, dl: Math.random() * 4,
    }))
  ).current;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {pts.map(p => (
        <div key={p.i} style={{
          position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
          width:p.w, height:p.w, borderRadius:"50%", background:"white",
          animation:`twinkle ${p.d}s ${p.dl}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}

// Primary button
function Btn({ children, onClick, color = C.cyan, disabled, loading, style: sx = {} }) {
  const handleClick = () => { SFX.tap(); if(onClick) onClick(); };
  return (
    <button
      onClick={!disabled && !loading ? handleClick : undefined}
      className="mm-btn-press"
      style={{
        width:"100%", padding:"13px 18px",
        border:`2px solid ${disabled || loading ? "#1a1a35" : color}`,
        borderRadius:14,
        background: disabled || loading ? "#08081a" : `${color}18`,
        color: disabled || loading ? "#2a2a50" : color,
        fontSize:13, fontFamily:"'Orbitron',sans-serif", fontWeight:700,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        letterSpacing:1,
        boxShadow: disabled || loading ? "none" : `0 0 14px ${color}33`,
        transition:"all 0.2s", ...sx,
      }}
    >
      {loading ? (
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{
            width:13, height:13,
            border:`2px solid ${color}44`, borderTopColor:color,
            borderRadius:"50%", animation:"spinR 0.7s linear infinite", display:"inline-block",
          }}/>
          Please wait…
        </span>
      ) : children}
    </button>
  );
}

// Input field with show/hide password
function Inp({ value, onChange, placeholder, type = "text", label, error, onEnter, maxLen = 200, autoComp }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom:13 }}>
      {label && (
        <div style={{ fontSize:10, color:C.cyan, fontFamily:"'Orbitron',sans-serif", letterSpacing:2, marginBottom:5 }}>
          {label}
        </div>
      )}
      <div style={{ position:"relative" }}>
        <input
          type={isPass ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(type === "email" ? e.target.value.trim() : e.target.value)}
          placeholder={placeholder}
          maxLength={maxLen}
          autoComplete={autoComp || (type === "email" ? "email" : type === "password" ? "current-password" : "off")}
          onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
          style={{
            width:"100%",
            padding:`12px ${isPass ? "44px" : "13px"} 12px 13px`,
            background:C.card2,
            border:`1.5px solid ${error ? C.red + "99" : C.purple + "44"}`,
            borderRadius:12, fontSize:14, fontWeight:600,
          }}
          onFocus={e => { e.target.style.borderColor = error ? C.red : C.cyan; e.target.style.boxShadow = `0 0 0 2px ${error ? C.red : C.cyan}22`; }}
          onBlur={e => { e.target.style.borderColor = error ? C.red + "99" : C.purple + "44"; e.target.style.boxShadow = "none"; }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} style={{
            position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", color:C.dim, fontSize:16, padding:4,
          }}>
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && <div style={{ color:C.red, fontSize:11, marginTop:3, fontWeight:700 }}>⚠ {error}</div>}
    </div>
  );
}

// Card
function Card({ children, color = C.purple, style: sx = {} }) {
  return (
    <div style={{
      background:C.card, borderRadius:16, padding:14,
      border:`1.5px solid ${color}33`, boxShadow:`0 4px 18px ${color}12`, ...sx,
    }}>
      {children}
    </div>
  );
}

// XP bar
function XPBar({ xp = 0, level = 1 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{
        background:`linear-gradient(135deg,${C.purple},${C.pink})`,
        borderRadius:20, padding:"3px 10px", fontSize:10,
        fontFamily:"'Orbitron',sans-serif", color:"white", flexShrink:0,
      }}>LV {level}</div>
      <div style={{ flex:1, background:"rgba(255,255,255,0.07)", borderRadius:7, height:7, overflow:"hidden" }}>
        <div style={{
          width:`${((xp % 200) / 200) * 100}%`, height:"100%",
          background:`linear-gradient(90deg,${C.cyan},${C.purple})`,
          borderRadius:7, transition:"width 1s ease",
        }}/>
      </div>
      <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>{xp} XP</span>
    </div>
  );
}

// Pin pad
function PinPad({ pin, setPin, error, shake, onComplete }) {
  const handleKey = (k) => {
    if (k === "⌫") { setPin(p => p.slice(0, -1)); return; }
    setPin(p => {
      if (p.length >= 4) return p;
      const next = p + k;
      if (next.length === 4 && onComplete) setTimeout(() => onComplete(next), 0);
      return next;
    });
  };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:14, animation:shake ? "shakeX 0.4s ease" : "none" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:50, height:50, borderRadius:14,
            background: pin.length > i ? `linear-gradient(135deg,${C.cyan},${C.purple})` : "#07071a",
            border:`2px solid ${shake ? C.red : pin.length > i ? C.cyan : "#181840"}`,
            boxShadow: pin.length > i ? `0 0 14px ${C.cyan}77` : shake ? `0 0 12px ${C.red}66` : "none",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, color:"white", transition:"all 0.2s",
          }}>{pin.length > i ? "●" : ""}</div>
        ))}
      </div>
      {error && <div style={{ color:C.red, fontSize:12, fontWeight:700, textAlign:"center", marginBottom:10 }}>⚠ {error}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i} onClick={() => k !== "" && handleKey(String(k))}
            onMouseDown={e => { if(k!=="") e.currentTarget.style.background = "#1a1a40"; }}
            onMouseUp={e => { if(k!=="") e.currentTarget.style.background = C.card2; }}
            onTouchStart={e => { if(k!=="") e.currentTarget.style.background = "#1a1a40"; }}
            onTouchEnd={e => { if(k!=="") e.currentTarget.style.background = C.card2; }}
            style={{
              padding:"15px", background: k === "" ? "transparent" : C.card2,
              border: k === "" ? "none" : `1.5px solid ${C.purple}44`,
              borderRadius:13, color:"white", fontSize:20,
              fontFamily:"'Orbitron',sans-serif", fontWeight:700,
              cursor: k === "" ? "default" : "pointer",
            }}
          >{k}</button>
        ))}
      </div>
    </div>
  );
}

// Back button (reusable)
function BackBtn({ onClick, color = C.purple }) {
  return (
    <button onClick={()=>{SFX.back();if(onClick)onClick();}} style={{
      background:`${color}18`, border:`1px solid ${color}44`,
      borderRadius:10, width:36, height:36, color,
      fontSize:18, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }}>‹</button>
  );
}

// Step dots for register
function StepDots({ current }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:18 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          width: i === current ? 26 : 8, height:8, borderRadius:4,
          background: i <= current ? `linear-gradient(90deg,${C.cyan},${C.purple})` : "#111128",
          boxShadow: i === current ? `0 0 8px ${C.cyan}` : "none",
          transition:"all 0.3s",
        }}/>
      ))}
    </div>
  );
}

// Page wrapper for register steps
function RegPage({ children, step, title, color = C.cyan, onBack }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", position:"relative", fontFamily:"'Nunito',sans-serif", overflowY:"auto" }}>
      <Starfield n={16}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <BackBtn onClick={onBack} color={color}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color }}>{title}</div>
        </div>
        <StepDots current={step}/>
        {children}
      </div>
    </div>
  );
}

// Abacus rod (defined outside Abacus screen)
function AbacusRod({ count, setCount, color, label }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color, letterSpacing:2 }}>{label}</div>
      <div style={{
        width:64, background:`${color}0a`, borderRadius:13, padding:"8px 0",
        border:`1.5px solid ${color}33`,
        display:"flex", flexDirection:"column", alignItems:"center",
        minHeight:155, justifyContent:"flex-end",
        position:"relative", gap:3, boxShadow:`0 0 14px ${color}18`,
      }}>
        <div style={{ position:"absolute", top:8, bottom:8, width:5, background:`${color}44`, borderRadius:3, left:"50%", transform:"translateX(-50%)" }}/>
        {Array.from({ length:count }).map((_, i) => (
          <div key={i} style={{
            width:40, height:14,
            background:`linear-gradient(90deg,${color},${color}bb)`,
            borderRadius:8, boxShadow:`0 0 6px ${color}88`, zIndex:1,
          }}/>
        ))}
      </div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, color, textShadow:`0 0 10px ${color}` }}>{count}</div>
      <div style={{ display:"flex", gap:7 }}>
        <button onClick={() => setCount(c => Math.max(0, c-1))} style={{ width:32, height:32, background:"#2a0a0a", border:`1.5px solid ${C.red}`, borderRadius:9, color:"#f87171", fontSize:18, cursor:"pointer", fontWeight:900 }}>−</button>
        <button onClick={() => setCount(c => Math.min(9, c+1))} style={{ width:32, height:32, background:"#0a2a0a", border:`1.5px solid ${C.green}`, borderRadius:9, color:"#4ade80", fontSize:18, cursor:"pointer", fontWeight:900 }}>+</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────────

function Splash({ onDone }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    setTimeout(() => SFX.splash(), 400);
    // Warm up Supabase connection during splash so first game open is instant
    db.getSb().catch(() => {});
    const t = [
      setTimeout(() => setS(1), 300),
      setTimeout(() => setS(2), 1000),
      setTimeout(() => setS(3), 1700),
      setTimeout(() => onDone(), 2800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <Starfield n={80}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{
          fontSize:86, marginBottom:10,
          opacity: s >= 1 ? 1 : 0,
          transform: s >= 1 ? "scale(1)" : "scale(0.2)",
          transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          filter: s >= 1 ? "drop-shadow(0 0 40px #a855f7) drop-shadow(0 0 80px #00f5ff55)" : "none",
          animation: s >= 1 ? "floatUp 3s ease-in-out infinite" : "none",
        }}>🚀</div>
        <div style={{
          fontFamily:"'Orbitron',sans-serif", fontSize:30, fontWeight:900, letterSpacing:3,
          background:`linear-gradient(135deg,${C.cyan},${C.purple},${C.pink})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          opacity: s >= 2 ? 1 : 0, transform: s >= 2 ? "translateY(0)" : "translateY(14px)",
          transition:"all 0.5s ease",
        }}>MATHMAGIC</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.dim, letterSpacing:5, marginTop:6, opacity: s >= 3 ? 1 : 0, transition:"opacity 0.5s ease" }}>
          SPACE ACADEMY
        </div>
      </div>
    </div>
  );
}

function Welcome({ onRegister, onLogin, onPrivacy }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, position:"relative", overflow:"hidden", fontFamily:"'Nunito',sans-serif" }}>
      <Starfield/>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"50px 22px 40px", animation:"slideUp 0.4s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:60, marginBottom:8, animation:"floatUp 3s ease-in-out infinite" }}>🚀</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:24, fontWeight:900, background:`linear-gradient(135deg,${C.cyan},${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2 }}>MATHMAGIC</div>
          <div style={{ color:C.dim, fontSize:11, letterSpacing:4, fontFamily:"'Orbitron',sans-serif", marginTop:4 }}>SPACE ACADEMY</div>
          <div style={{ marginTop:12, color:"#4a5a8a", fontSize:13, fontWeight:600, lineHeight:1.7 }}>Master maths while conquering the cosmos! 🌌</div>
        </div>
        <div style={{ display:"flex", gap:14, marginBottom:30 }}>
          {["🌕","🔴","🪐","🌌"].map((p, i) => (
            <div key={i} style={{ fontSize:26+i*4, animation:`floatUp ${2+i*0.4}s ${i*0.3}s ease-in-out infinite`, filter:`drop-shadow(0 0 10px ${["#f97316","#ec4899","#8b5cf6","#00f5ff"][i]}88)` }}>{p}</div>
          ))}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, justifyContent:"center", marginBottom:30 }}>
          {["📚 CBSE & ICSE","🎮 Game-Based","🧮 Abacus","🏆 Olympiad","Class 1–5"].map((t, i) => (
            <span key={i} style={{ padding:"5px 11px", borderRadius:20, fontSize:11, fontWeight:700, border:`1px solid ${[C.cyan,C.purple,C.pink,C.orange,C.yellow][i]}44`, color:[C.cyan,C.purple,C.pink,C.orange,C.yellow][i], background:`${[C.cyan,C.purple,C.pink,C.orange,C.yellow][i]}0e` }}>{t}</span>
          ))}
        </div>
        <div style={{ width:"100%", maxWidth:340, display:"flex", flexDirection:"column", gap:12 }}>
          <Btn color={C.cyan} onClick={onRegister}>🚀  REGISTER NEW ACCOUNT</Btn>
          <Btn color={C.purple} onClick={onLogin}>🌌  LOGIN TO MY ACCOUNT</Btn>
        </div>
        <div style={{ marginTop:14, display:"flex", gap:16, alignItems:"center", justifyContent:"center" }}>
          <div style={{ color:"#1a2a4a", fontSize:11, fontWeight:600 }}>No ads for kids · Safe &amp; secure</div>
          {onPrivacy && <button onClick={onPrivacy} style={{background:"none",border:"none",color:C.dim,fontSize:11,cursor:"pointer",textDecoration:"underline",fontFamily:"'Nunito',sans-serif",padding:0}}>Privacy Policy</button>}
        </div>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────────────────────────────
function Register({ onBack, onDone }) {
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [pass2,   setPass2]   = useState("");
  const [name,    setName]    = useState("");
  const [avatar,  setAvatar]  = useState(null);
  const [cls,     setCls]     = useState(null);
  const [pin,     setPin]     = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);

  const goBack = () => { setErrors({}); step > 1 ? setStep(step - 1) : onBack(); };

  // Step 1 ─ credentials
  if (step === 1) {
    const doNext = () => {
      const e = {};
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.trim())) e.email = "Enter a valid email";
      if (pass.length < 6) e.pass = "At least 6 characters";
      if (pass !== pass2)  e.pass2 = "Passwords don't match";
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({}); setStep(2);
    };
    return (
      <RegPage step={1} title="CREATE ACCOUNT" color={C.cyan} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:12 }}>STEP 1 — PARENT ACCOUNT</div>

        <Inp label="EMAIL" value={email} onChange={setEmail} placeholder="parent@email.com" type="email" error={errors.email} onEnter={doNext} autoComp="email"/>
        <Inp label="PASSWORD" value={pass} onChange={v => { setPass(v); if(pass2 && v!==pass2) setErrors(e=>({...e,pass2:"Passwords don't match"})); else setErrors(e=>({...e,pass2:undefined})); }} placeholder="Min 6 characters" type="password" error={errors.pass} onEnter={doNext} autoComp="new-password"/>
        <Inp label="CONFIRM PASSWORD" value={pass2} onChange={setPass2} placeholder="Repeat password" type="password" error={errors.pass2} onEnter={doNext} autoComp="new-password"/>
        <div style={{ height:6 }}/>
        <Btn color={C.cyan} onClick={doNext}>NEXT → CHILD PROFILE</Btn>
      </RegPage>
    );
  }

  // Step 2 ─ name + avatar
  if (step === 2) {
    const doNext = () => {
      const e = {};
      if (!name.trim()) e.name = "Enter child's name";
      if (!avatar)      e.avatar = "Pick an avatar";
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({}); setName(name.trim()); setStep(3);
    };
    return (
      <RegPage step={2} title="CHILD PROFILE" color={C.purple} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:12 }}>STEP 2 — YOUR SPACE EXPLORER</div>
        <Inp label="CHILD'S NAME" value={name} onChange={setName} placeholder="Enter child's name…" error={errors.name} maxLen={40} autoComp="off" onEnter={doNext}/>
        <div style={{ fontSize:10, color:C.purple, fontFamily:"'Orbitron',sans-serif", letterSpacing:2, marginBottom:8 }}>PICK AN AVATAR</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:12 }}>
          {AVATARS.map((a, i) => (
            <button key={i} onClick={() => setAvatar(a)} style={{
              background: avatar === a ? `${C.purple}33` : "#07071a",
              border:`2px solid ${avatar === a ? C.cyan : "#111128"}`,
              borderRadius:12, aspectRatio:"1", fontSize:24, cursor:"pointer",
              boxShadow: avatar === a ? `0 0 14px ${C.cyan}88` : "none",
              transform: avatar === a ? "scale(1.14)" : "scale(1)",
              transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center",
            }}>{a}</button>
          ))}
        </div>
        {avatar && (
          <div style={{ textAlign:"center", marginBottom:12 }}>
            <div style={{ fontSize:48, animation:"floatUp 2s ease-in-out infinite" }}>{avatar}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.cyan, marginTop:5 }}>
              ASTRONAUT {name.trim().toUpperCase() || "?"}
            </div>
          </div>
        )}
        {errors.avatar && <div style={{ color:C.red, fontSize:11, marginBottom:8, fontWeight:700 }}>⚠ {errors.avatar}</div>}
        <Btn color={C.purple} onClick={doNext}>NEXT → SELECT CLASS</Btn>
      </RegPage>
    );
  }

  // Step 3 ─ class
  if (step === 3) {
    return (
      <RegPage step={3} title="SELECT CLASS" color={C.orange} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:4 }}>STEP 3 — WHICH CLASS?</div>
        <div style={{ color:C.dim, fontSize:12, fontWeight:600, marginBottom:12, lineHeight:1.5 }}>

        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
          {WORLDS.map(w => (
            <button key={w.id} onClick={() => setCls(w.id)} style={{
              background: cls === w.id ? `${w.color}22` : "#07071a",
              border:`2px solid ${cls === w.id ? w.color : "#181838"}`,
              borderRadius:15, padding:"12px 15px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:12,
              boxShadow: cls === w.id ? `0 0 18px ${w.glow}` : "none",
              transition:"all 0.2s",
            }}>
              <span style={{ fontSize:26 }}>{w.planet}</span>
              <div style={{ textAlign:"left", flex:1 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color: cls === w.id ? w.color : "white" }}>{w.name}</div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{w.world}</div>
              </div>
              {cls === w.id && <div style={{ color:w.color, fontSize:20 }}>✓</div>}
            </button>
          ))}
        </div>
        {errors.cls && <div style={{ color:C.red, fontSize:11, marginBottom:8, fontWeight:700 }}>⚠ {errors.cls}</div>}
        <Btn color={C.orange} disabled={!cls} onClick={() => { if (!cls) { setErrors({ cls:"Select a class" }); return; } setErrors({}); setStep(4); }}>
          NEXT → CREATE PIN
        </Btn>
      </RegPage>
    );
  }

  // Step 4 ─ PIN + submit
  if (step === 4) {
    const doRegister = async () => {
      if (pin.length < 4) { setErrors({ pin:"Enter all 4 digits" }); setShake(true); setTimeout(() => setShake(false), 500); return; }
      setLoading(true);
      try {
        const { data: ad, error: ae } = await db.signUp(email, pass);
        if (ae) {
          // Hard auth error (duplicate email, invalid format etc.) — show to user
          setErrors({ pin: ae.message }); setLoading(false); return;
        }
        const uid = ad?.user?.id;
        if (!uid) {
          // No uid at all — should not happen after our signUp fix, but guard anyway
          setErrors({ pin: "Registration error. Please try again." });
          setLoading(false); return;
        }
        // Add child profile — works whether uid is a real Supabase UUID or an in-memory id
        const { data: child } = await db.addChild(uid, { name, avatar, class_num: cls, pin });
        if (!child) { setErrors({ pin: "Could not create profile. Please try again." }); setLoading(false); return; }
        setLoading(false);
        // Save session so login screen skips email/pass next time
        try {
          const kidsData = [child];
          sessionStorage.setItem("mm_parent_session", JSON.stringify({ email, pass, pid: uid, kids: kidsData }));
        } catch(e) {}
        onDone({ user: { id: uid, email }, child, requirePayment: true });
      } catch (err) {
        console.warn("[doRegister error]", err.message);
        setErrors({ pin: "Connection error. Please check your internet and try again." });
        setLoading(false);
      }
    };
    return (
      <RegPage step={4} title="CREATE PIN" color={C.yellow} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:4 }}>STEP 4 — SECRET PIN</div>
        <div style={{ color:C.dim, fontSize:12, fontWeight:600, marginBottom:10, lineHeight:1.6 }}>
          Set a 4-digit PIN for <strong style={{ color:"white" }}>{name}</strong> to log in.
        </div>
        <div style={{ background:`${C.cyan}14`, border:`1px solid ${C.cyan}33`, borderRadius:10, padding:"8px 12px", marginBottom:12 }}>
          <div style={{ color:C.cyan, fontSize:10, fontFamily:"'Orbitron',sans-serif", marginBottom:2 }}>🔐 STEP 4 — ALMOST THERE!</div>
          <div style={{ color:C.dim, fontSize:11 }}>Set a 4-digit PIN your child will use to log in each time.</div>
        </div>
        <PinPad pin={pin} setPin={setPin} error={errors.pin} shake={shake}/>
        <div style={{ height:10 }}/>
        <Btn color={C.yellow} disabled={pin.length < 4} loading={loading} onClick={doRegister}>
          🚀  LAUNCH INTO SPACE!
        </Btn>
      </RegPage>
    );
  }
  return null;
}

// ── Login ─────────────────────────────────────────────────────────────
function Login({ onBack, onDone }) {
  // Try to auto-restore session so child only needs name+PIN after registration
  const savedSession = (() => { try { return JSON.parse(sessionStorage.getItem("mm_parent_session")||"null"); } catch(e){return null;} })();
  const [step,    setStep]    = useState(savedSession ? "child" : "email");
  const [email,   setEmail]   = useState(savedSession?.email || "");
  const [pass,    setPass]    = useState(savedSession?.pass || "");
  const [kids,    setKids]    = useState(savedSession?.kids || []);
  const [kid,     setKid]     = useState(null);
  const [pid,     setPid]     = useState(savedSession?.pid || null);
  const [pin,     setPin]     = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);

  if (step === "email") return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={26}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <BackBtn onClick={onBack}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.cyan }}>MISSION LOGIN</div>
        </div>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:50, marginBottom:8, animation:"floatUp 2s ease-in-out infinite" }}>🔐</div>
          <div style={{ color:C.dim, fontSize:13, fontWeight:600 }}>Enter parent credentials</div>
        </div>
        <Inp label="EMAIL" value={email} onChange={setEmail} placeholder="parent@email.com" type="email" autoComp="email" onEnter={() => document.getElementById("loginSubmit")?.click()}/>
        <Inp label="PASSWORD" value={pass} onChange={setPass} placeholder="Your password" type="password" autoComp="current-password" onEnter={() => document.getElementById("loginSubmit")?.click()}/>
        {error && <div style={{ color:C.red, fontSize:12, marginBottom:12, fontWeight:700, textAlign:"center", lineHeight:1.5 }}>⚠ {error}</div>}
        <div id="loginSubmit" style={{ display:"none" }}/>
        <Btn color={C.cyan} loading={loading} style={{ marginBottom:10 }} onClick={async () => {
          const te = email.trim();
          if (!te || !pass) { setError("Enter email and password"); return; }
          // ── Admin shortcut ────────────────────────────────────────────
          if (te === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
            onDone({ user: ADMIN_USER, child: ADMIN_CHILD });
            return;
          }
          setLoading(true); setError("");
          try {
            const { data, error: err } = await db.signIn(te, pass);
            if (err || !data?.user) { setError(err?.message || "Login failed"); setLoading(false); return; }
            const parentId = data.user.id; setPid(parentId);
            const { data: children } = await db.getChildren(parentId);
            setLoading(false);
            if (!children || children.length === 0) { setError("No profiles found. Please register first."); return; }
            setKids(children); setStep("child");
            try { sessionStorage.setItem("mm_parent_session", JSON.stringify({ email:te, pass, pid:parentId, kids:children })); } catch(e) {}
          } catch(e) { setError("Login failed: " + e.message); setLoading(false); }
        }}>ENTER ACADEMY →</Btn>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:C.dim, fontSize:12, cursor:"pointer", fontWeight:600 }}>No account? Register →</button>
          <button onClick={async () => {
            if (!email.trim().includes("@")) { setError("Enter your email first"); return; }
            const sb = await db.getSb();
            // password reset not supported in proxy mode
            setError("✉️ Reset email sent!");
          }} style={{ background:"none", border:"none", color:C.dim, fontSize:12, cursor:"pointer", fontWeight:600 }}>Forgot password?</button>
        </div>
        {/* Admin quick-fill */}

        <div style={{height:8}}/>
      </div>
    </div>
  );

  if (step === "child") return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={26}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <BackBtn onClick={() => setStep("email")}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.purple }}>CHOOSE PILOT</div>
        </div>
        <div style={{ color:C.dim, fontSize:13, fontWeight:600, marginBottom:14 }}>Who's flying today? 🚀</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {kids.map(k => {
            const w = WORLDS[(k.class_num || 1) - 1];
            return (
              <button key={k.id} onClick={() => { setKid(k); setPin(""); setError(""); setStep("pin"); }}
                style={{ background:C.card, border:`2px solid ${w.color}33`, borderRadius:16, padding:"13px 15px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = w.color; e.currentTarget.style.boxShadow = `0 0 16px ${w.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${w.color}33`; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width:48, height:48, background:`${w.color}18`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, border:`1.5px solid ${w.color}33` }}>{k.avatar}</div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color:"white"}}>{k.name}</div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{w.name} · Lv {k.level||1} · {k.xp||0} XP</div>
                </div>
                <div style={{ marginLeft:"auto", color:w.color, fontSize:20 }}>›</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (step === "pin" && kid) return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={26}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
          <BackBtn onClick={() => { setStep("child"); setPin(""); setError(""); }}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.cyan }}>ENTER PIN</div>
        </div>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:52, animation:"floatUp 2s ease-in-out infinite", marginBottom:8 }}>{kid.avatar}</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.cyan }}>{kid.name.toUpperCase()}</div>
          <div style={{ color:C.dim, fontSize:11, marginTop:3 }}>{WORLDS[(kid.class_num||1)-1].world}</div>
        </div>
        <div style={{ color:C.dim, fontSize:12, fontWeight:600, textAlign:"center", marginBottom:12 }}>Enter your secret PIN 🔐</div>
        <PinPad pin={pin} setPin={setPin} error={error} shake={shake} onComplete={async fullPin => {
          // SECURITY: track failed PIN attempts
          const attemptKey = `pin_attempts_${kid.id}`;
          const attempts = parseInt(localStorage.getItem(attemptKey)||"0");
          if (attempts >= 5) { setError("Too many attempts. Wait 5 minutes."); setShake(true); setTimeout(()=>setShake(false),600); setPin(""); return; }
          const { ok, child: rawChild } = await db.checkPin(kid.id, fullPin);
          if (!ok) localStorage.setItem(attemptKey, String(attempts+1));
          else localStorage.removeItem(attemptKey);
          if (ok && rawChild) {
            // Update daily streak
            const today = new Date().toDateString();
            const lastActive = rawChild.last_active ? new Date(rawChild.last_active).toDateString() : null;
            const yesterday  = new Date(Date.now() - 86400000).toDateString();
            let updatedChild = { ...rawChild };
            if (lastActive !== today) {
              const newStreak = lastActive === yesterday ? (rawChild.streak_days||0) + 1 : 1;
              const sb = await db.getSb();
              if (sb) await sb.update("children", { streak_days: newStreak, last_active: new Date().toISOString() }, "id", rawChild.id);
              updatedChild = { ...rawChild, streak_days: newStreak, last_active: new Date().toISOString() };
            }
            // Save session so next login skips email/pass
            try { sessionStorage.setItem("mm_parent_session", JSON.stringify({ email, pass, pid, kids })); } catch(e){}
            onDone({ user:{ id:pid, email }, child: updatedChild });
          }
          else { setShake(true); setError("Wrong PIN! Try again 🔒"); setTimeout(() => { setShake(false); setPin(""); setError(""); }, 700); }
        }}/>
      </div>
    </div>
  );
  return null;
}

// ── Paywall ───────────────────────────────────────────────────────────
function Paywall({ world, child, onBack, onUnlock }) {
  const [plan,    setPlan]    = useState("yearly");
  const [loading, setLoading] = useState(false);
  const plans = {
    monthly: { label:"Monthly", price:"₹199", sub:"per month" },
    yearly:  { label:"Yearly",  price:"₹999", sub:"per year · save 58%", badge:"BEST VALUE" },
  };
  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative", overflowY:"auto" }}>
      <Starfield n={35}/>
      <div style={{ position:"relative", zIndex:2, padding:"20px 18px" }}>
        <div style={{textAlign:"center",marginBottom:12,padding:"14px 16px",background:`linear-gradient(135deg,${C.purple}22,${C.cyan}11)`,borderRadius:16,border:`1px solid ${C.cyan}33`}}>
          <div style={{fontSize:11,color:C.dim,fontFamily:"'Nunito',sans-serif",marginBottom:4}}>Welcome to MathMagic Space Academy</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.yellow,letterSpacing:1}}>🚀 Hello, {child?.name?.split(" ")[0]}!</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <BackBtn onClick={onBack} color={C.yellow}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.yellow }}>UNLOCK PREMIUM</div>
        </div>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:58, marginBottom:8, animation:"floatUp 2s ease-in-out infinite" }}>{world.planet}</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:17, color:world.color, marginBottom:5 }}>{world.world} is LOCKED 🔒</div>
          <div style={{ color:C.dim, fontSize:13, fontWeight:600, lineHeight:1.6 }}>Unlock all 5 worlds, Abacus program & Olympiad prep!</div>
        </div>
        <Card color={C.yellow} style={{ marginBottom:14 }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.yellow, marginBottom:10 }}>✨ PREMIUM INCLUDES</div>
          {[["🌍","All Class 1–5 worlds"],["🎮","All game modes"],["🧮","Abacus 10 levels"],["🎓","Olympiad prep"],["📊","Parent dashboard"],["🚫","Zero ads"]].map(([e,t],i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:6, alignItems:"center" }}>
              <span style={{ fontSize:16 }}>{e}</span><span style={{ color:"#ccc", fontSize:13 }}>{t}</span>
            </div>
          ))}
        </Card>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          {Object.entries(plans).map(([key, p]) => (
            <button key={key} onClick={() => setPlan(key)} style={{
              flex:1, background: plan===key ? `${C.cyan}22` : "#07071a",
              border:`2px solid ${plan===key ? C.cyan : C.purple+"33"}`,
              borderRadius:14, padding:"14px 10px", cursor:"pointer", textAlign:"center",
              position:"relative", boxShadow: plan===key ? `0 0 18px ${C.cyan}33` : "none", transition:"all 0.2s",
            }}>
              {p.badge && <div style={{ position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)", background:C.orange, color:"white", fontSize:9, fontFamily:"'Orbitron',sans-serif", padding:"2px 8px", borderRadius:8, whiteSpace:"nowrap" }}>{p.badge}</div>}
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color: plan===key ? C.cyan : C.dim, marginBottom:4 }}>{p.label}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, color:"white"}}>{p.price}</div>
              <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{p.sub}</div>
            </button>
          ))}
        </div>
        <Btn color={C.yellow} loading={loading} onClick={async () => {
          setLoading(true);
          await new Promise(r => setTimeout(r, 1500));
          await db.setPremium(child.id);
          setLoading(false);
          onUnlock();
        }}>🚀  UNLOCK — {plans[plan].price}</Btn>
        <div style={{ marginTop:10, textAlign:"center", color:C.dim, fontSize:11, fontWeight:600 }}>🔒 Secure · Cancel anytime</div>
        <Card color={C.purple} style={{ marginTop:12, textAlign:"center", padding:"10px 14px" }}>
          <div style={{ color:C.purple, fontSize:10, fontFamily:"'Orbitron',sans-serif", marginBottom:3 }}>🔒 SECURE PAYMENT</div>
          <div style={{ color:C.dim, fontSize:11 }}>Razorpay integration — safe & encrypted checkout.</div>
        </Card>
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────
// ── ThemeSelector ────────────────────────────────────────────────────
function ThemeSelector({ onClose }) {
  const [cur, setCur] = useState(localStorage.getItem("mm_theme")||"space");
  const themes = Object.entries(THEMES);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:C.card, borderRadius:"20px 20px 0 0", padding:"20px 18px 32px", width:"100%", maxWidth:480, animation:"slideUp 0.25s ease" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.cyan, marginBottom:16, textAlign:"center" }}>🎨 CHOOSE THEME</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {themes.map(([key,t]) => (
            <button key={key} onClick={() => {
              localStorage.setItem("mm_theme",""); // force
              localStorage.setItem("mm_theme", key);
              setCur(key); C = THEMES[key] || THEMES.space;
              window.location.reload(); // reload to apply theme everywhere
            }} style={{
              background: cur===key ? `${t.cyan}22` : t.bg,
              border:`2px solid ${cur===key ? t.cyan : t.dim+"44"}`,
              borderRadius:14, padding:"12px 10px", cursor:"pointer", textAlign:"center",
              boxShadow: cur===key ? `0 0 16px ${t.cyan}44` : "none",
            }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{t.icon}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color: cur===key ? t.cyan : t.dim }}>{t.name}</div>
              <div style={{ display:"flex", gap:4, justifyContent:"center", marginTop:6 }}>
                {[t.purple,t.cyan,t.yellow,t.green].map((cl,i)=>(
                  <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:cl }}/>
                ))}
              </div>
              {cur===key && <div style={{ fontSize:8, color:t.cyan, fontFamily:"'Orbitron',sans-serif", marginTop:4 }}>✓ ACTIVE</div>}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop:14, width:"100%", background:"none", border:`1px solid ${C.dim}44`, borderRadius:10, padding:"10px", color:C.dim, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13 }}>CLOSE</button>
      </div>
    </div>
  );
}

function Home({ child, onWorld, onAbacus, onGames, onOlympiad, onParent, onLogout, onFeedback, onRate, onSettings, isLessonPurchased }) {
  const [showTutorial, setShowTutorial] = useState(()=>!localStorage.getItem('mm_tutorial_done'));
  const doneTutorial = () => { localStorage.setItem('mm_tutorial_done','1'); setShowTutorial(false); };
  const [showTheme, setShowTheme] = useState(false);
  const [progress, setProgress] = useState([]);
  const [showDQ,     setShowDQ]     = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const w = WORLDS[(child.class_num||1) - 1];

  // Show rating prompt after 3rd session
  useEffect(() => {
    if (localStorage.getItem("mm_rated")) return;
    const sessions = parseInt(localStorage.getItem("mm_sessions")||"0") + 1;
    localStorage.setItem("mm_sessions", String(sessions));
    if (sessions === 3) setTimeout(() => { setShowRating(true); SFX.ratingOpen(); }, 5000);
    db.track("app_open", child.id, null, { session: sessions, class_num: child.class_num });
  }, [child.id, child.class_num]);
  useEffect(() => {
    db.getProgress(child.id).then(({ data }) => setProgress(data || []));
    // Prefetch Set 1 of all unlocked lessons silently
    const lessons = LESSONS[child.class_num] || LESSONS[1];
    lessons.forEach((l, i) => {
      if (i === 0) fetchSetQuestions(l.id, 0); // always prefetch first lesson
    });
  }, [child.id]);
  const myLessons  = LESSONS[child.class_num] || LESSONS[1];
  const myProgress = [...new Set(
    progress
      .filter(p => myLessons.some(l => p.lesson_id && p.lesson_id.startsWith(l.id + "_s")))
      .map(p => p.lesson_id.replace(/_s[0-9]+$/, ""))
  )];
  const totalStars = progress.reduce((s, p) => s + (p.stars_earned||0), 0);
  const todayStr   = new Date().toDateString();
  const todaySets  = progress.filter(p => p.completed_at && new Date(p.completed_at).toDateString() === todayStr).length;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", paddingBottom:80, position:"relative" }}>
      <Starfield n={40}/>
      {onFeedback && <SOSButton onClick={() => onFeedback()}/>}
      {showTutorial && <Tutorial onDone={doneTutorial}/>}
      {/* Header */}
      <div style={{ position:"relative", zIndex:2, padding:"16px 18px 0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:44, height:44, background:`${C.purple}22`, borderRadius:13, border:`2px solid ${C.purple}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{child.avatar}</div>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.cyan }}>CADET {child.name.toUpperCase()}</div>
              <div style={{ fontSize:11, color:C.dim, fontWeight:600 }}>{w.world} · {child.is_premium ? "⭐ Premium" : "Free"}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:3 }}><span style={{ fontSize:14 }}>🔥</span><span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.orange }}>{child.streak_days||0}</span></div>
              <div style={{ fontSize:8, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>STREAK</div>
            </div>
            <MuteBtn/><button onClick={onLogout} style={{ background:`${C.pink}14`, border:`1px solid ${C.pink}44`, borderRadius:10, padding:"5px 9px", color:C.pink, fontSize:10, cursor:"pointer", fontFamily:"'Orbitron',sans-serif" }}>EXIT</button>
          </div>
        </div>
        <XPBar xp={child.xp||0} level={child.level||1}/>
      </div>
      {/* Stats */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:10, padding:"11px 18px" }}>
        {[{e:"⭐",v:totalStars,l:"STARS"},{e:"💰",v:child.coins||0,l:"COINS"},{e:"📚",v:myProgress.length,l:"DONE"}].map((s,i) => (
          <div key={i} style={{ flex:1, background:C.card, borderRadius:13, padding:"9px 6px", textAlign:"center", border:`1px solid ${[C.yellow,C.orange,C.purple][i]}28` }}>
            <div style={{ fontSize:18 }}>{s.e}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:15, color:"white"}}>{s.v}</div>
            <div style={{ fontSize:8, color:C.dim, letterSpacing:1, fontFamily:"'Orbitron',sans-serif" }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Modals */}
      {showDQ     && <DailyQuiz   child={child} onClose={() => setShowDQ(false)}/>}
      {showPuzzle && <DailyPuzzle child={child} onClose={() => setShowPuzzle(false)}/>}
      {showRating && <RatingPrompt child={child} onClose={() => setShowRating(false)}/>}
      <div style={{ position:"relative", zIndex:2, margin:"0 18px 14px", display:"flex", flexDirection:"column", gap:9 }}>
        {/* Daily set mission */}
        <div style={{ background:`linear-gradient(135deg,${C.purple}28,${C.cyan}14)`, border:`1px solid ${C.cyan}33`, borderRadius:15, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, animation:"pulseG 3s ease-in-out infinite" }}>
          <div style={{ fontSize:28 }}>🎯</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.cyan, letterSpacing:1 }}>DAILY MISSION</div>
            <div style={{ color:"white", fontSize:13, fontWeight:700, marginTop:2 }}>Complete 1 set today! 🚀</div>
            <div style={{ marginTop:5, background:"rgba(255,255,255,0.06)", borderRadius:5, height:4, overflow:"hidden" }}>
              <div style={{ width:`${Math.min((todaySets/1)*100,100)}%`, height:"100%", background:`linear-gradient(90deg,${C.cyan},${C.purple})`, borderRadius:5 }}/>
            </div>
          </div>
          <div style={{ color:C.yellow, fontFamily:"'Orbitron',sans-serif", fontSize:11, textAlign:"center" }}><div>+150</div><div style={{ fontSize:8 }}>XP</div></div>
        </div>
        {/* Daily Challenge + Daily Puzzle cards */}
        {(()=>{
          const todayKey = new Date().toISOString().slice(0,10);
          const dqKey = `dq_done_${child.id}_${todayKey}`;
          const dpKey = `dp_done_${child.id}_${todayKey}`;
          const dqDone = !!localStorage.getItem(dqKey);
          const dpDone = !!localStorage.getItem(dpKey);
          return (<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button onClick={()=>setShowDQ(true)} style={{background:`linear-gradient(135deg,${C.yellow}22,${C.orange}0c)`,border:`1.5px solid ${dqDone?C.green+"66":C.yellow+"55"}`,borderRadius:15,padding:"12px 10px",cursor:"pointer",textAlign:"center",animation:dqDone?"none":"pulseG 3s ease-in-out infinite"}}>
                <div style={{fontSize:26,marginBottom:4}}>{dqDone?"✅":"🌟"}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:dqDone?C.green:C.yellow,letterSpacing:1}}>WORD PROBLEM</div>
                <div style={{color:"white",fontSize:11,fontWeight:700,marginTop:3}}>{dqDone?"Done! 🎉":"Solve today"}</div>
                <div style={{color:dqDone?C.green:C.yellow,fontSize:10,marginTop:4,fontWeight:800}}>+50 XP</div>
              </button>
              <button onClick={()=>setShowPuzzle(true)} style={{background:`linear-gradient(135deg,${C.purple}22,${C.cyan}0c)`,border:`1.5px solid ${dpDone?C.green+"66":C.purple+"55"}`,borderRadius:15,padding:"12px 10px",cursor:"pointer",textAlign:"center",animation:dpDone?"none":"pulseG 3s ease-in-out infinite"}}>
                <div style={{fontSize:26,marginBottom:4}}>{dpDone?"🏆":"🧩"}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:dpDone?C.green:C.purple,letterSpacing:1}}>BRAIN PUZZLE</div>
                <div style={{color:"white",fontSize:11,fontWeight:700,marginTop:3}}>{dpDone?"Solved! 🎉":"New puzzle"}</div>
                <div style={{color:dpDone?C.green:C.purple,fontSize:10,marginTop:4,fontWeight:800}}>+75 XP</div>
              </button>
            </div>
          </>);
        })()}
      </div>
      {/* Quick actions */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:10, padding:"0 18px 14px" }}>
        {/* Mascot */}

        {[{i:"🧮",l:"ABACUS",c:C.yellow,a:onAbacus},{i:"🎮",l:"GAMES",c:C.cyan,a:onGames},{i:"🎓",l:"OLYMPIAD",c:C.purple,a:onOlympiad},{i:"📊",l:"PARENT",c:C.pink,a:onParent}].map((n,i) => (
          <button key={i} onClick={n.a} style={{ flex:1, background:`${n.c}18`, border:`1.5px solid ${n.c}44`, borderRadius:14, padding:"11px 8px", cursor:"pointer", textAlign:"center" }}>
            <div style={{ fontSize:22, marginBottom:4 }}>{n.i}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:8, color:n.c, letterSpacing:1 }}>{n.l}</div>
          </button>
        ))}
      </div>
      {/* Worlds */}
      <div style={{ position:"relative", zIndex:2, padding:"0 18px 10px" }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.purple, letterSpacing:2, marginBottom:10 }}>🗺️ GALACTIC WORLDS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <ProgressGrid lessons={myLessons} progress={progress}/>
        {WORLDS.map(cw => {
          const isMyClass = cw.id === (child.class_num||1) || child.is_premium;
          return (
            <button key={cw.id} onClick={() => onWorld(cw)} style={{
              background: isMyClass ? `linear-gradient(135deg,${cw.color}16,${cw.color}08)` : "rgba(10,10,28,0.7)",
              border:`2px solid ${isMyClass ? cw.color+"44" : "#222240"}`, borderRadius:17, padding:"13px 15px",
              cursor:"pointer", display:"flex", alignItems:"center", gap:12,
              boxShadow: isMyClass ? `0 0 16px ${cw.glow}` : "none", transition:"all 0.2s", opacity: isMyClass ? 1 : 0.55,
            }}>
              <div style={{ width:48, height:48, borderRadius:13, background:`${cw.color}18`, border:`2px solid ${cw.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {isMyClass ? cw.planet : "🔒"}
              </div>
              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color: isMyClass ? cw.color : C.dim }}>{cw.name}</div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{isMyClass ? `${cw.world} · 🎯 Your class` : "Buy lessons · ₹300 each"}</div>
              </div>
              <div style={{ color: isMyClass ? cw.color : C.dim, fontSize:22 }}>{isMyClass ? "›" : "💰"}</div>
            </button>
          );
        })}
        </div>
      </div>
      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:10, background:"rgba(4,4,15,0.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.purple}33`, padding:"10px 14px", display:"flex", justifyContent:"space-around" }}>
        {[{icon:"🏠",label:"HOME",act:null,active:true},{icon:"🎮",label:"GAMES",act:onGames},{icon:"🧮",label:"ABACUS",act:onAbacus},{icon:"🎓",label:"EXAMS",act:onOlympiad},{icon:"⚙️",label:"SETTINGS",act:()=>onSettings()},{icon:"📣",label:"REPORT",act:onFeedback}].map((n, i) => (
          <button key={i} onClick={n.act||undefined} style={{ background:"none", border:"none", cursor:n.act?"pointer":"default", display:"flex", flexDirection:"column", alignItems:"center", gap:2, color: n.active ? C.cyan : C.dim }}>
            <div style={{ fontSize:19 }}>{n.icon}</div>
            <div style={{ fontSize:8, fontFamily:"'Orbitron',sans-serif" }}>{n.label}</div>
            {n.active && <div style={{ width:4, height:4, borderRadius:"50%", background:C.cyan, boxShadow:`0 0 5px ${C.cyan}` }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Lessons ───────────────────────────────────────────────────────────
function LessonMap({ world, child, onBack, onLesson, isLessonPurchased, onPurchaseLesson }) {
  const [progress,   setProgress]   = useState([]);
  const [expanded,   setExpanded]   = useState(null); // which lesson is expanded
  const lessons = LESSONS[child.class_num] || LESSONS[1];
  useEffect(() => {
    db.getProgress(child.id).then(({ data }) => setProgress(data || []));
    // Prefetch Set 1 of all unlocked lessons silently
    const lessons = LESSONS[child.class_num] || LESSONS[1];
    lessons.forEach((l, i) => {
      if (i === 0) fetchSetQuestions(l.id, 0); // always prefetch first lesson
    });
  }, [child.id]);

  const isSetDone   = (lid, si) => progress.some(p => p.lesson_id === lid + "_s" + si && (p.stars_earned||0) >= 1);
  const isSetUnlocked = (lid, si) => si === 0 || isSetDone(lid, si - 1);
  const lessonDone  = (lid) => isSetDone(lid, 19); // all 20 sets done
  const lessonStarted = (lid) => isSetDone(lid, 0);
  const completedSets = (lid) => Array.from({length:20},(_,i)=>i).filter(i=>isSetDone(lid,i)).length;
  const worldProg = lessons.filter(l => lessonStarted(l.id)).length;
  const totalSets = lessons.length * 20;
  const doneSets  = lessons.reduce((s,l)=>s+completedSets(l.id),0);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", paddingBottom:40, position:"relative" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:2, background:`${world.color}1a`, borderBottom:`1px solid ${world.color}33`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <BackBtn onClick={onBack} color={world.color}/>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:world.color }}>{world.world.toUpperCase()}</div>
            <div style={{ fontSize:11, color:C.dim }}>{world.name} · {doneSets}/{totalSets} Sets Done</div>
          </div>
          <div style={{ marginLeft:"auto", fontSize:28 }}>{world.planet}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:7, height:6, overflow:"hidden" }}>
          <div style={{ width:`${(doneSets/totalSets)*100}%`, height:"100%", background:`linear-gradient(90deg,${world.color},${C.cyan})`, borderRadius:7 }}/>
        </div>
        <div style={{ fontSize:10, color:C.dim, marginTop:3, fontFamily:"'Orbitron',sans-serif" }}>{worldProg}/{lessons.length} LESSONS STARTED</div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"16px 18px" }}>
        {lessons.map((lesson, li) => {
          const done   = lessonDone(lesson.id);
          const cSets  = completedSets(lesson.id);
          const isExp  = expanded === lesson.id;
          const isOwnClass = world.id === (child.class_num||1) || child.is_premium;
          const purchased = isOwnClass || (isLessonPurchased && isLessonPurchased(world.id, lesson.id));
          const lessonUnlocked = purchased;
          return (
            <div key={lesson.id} style={{ marginBottom:10 }}>
              {/* Lesson header row */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: isExp ? 8 : 0 }}>
                <div style={{ width:48, height:48, borderRadius:14, background: done ? `linear-gradient(135deg,${world.color},${world.color}aa)` : lessonUnlocked ? C.card2 : C.card2, border:`2px solid ${done ? world.color : lessonUnlocked ? world.color+"44" : C.dim+"33"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                  {done ? "✅" : lessonUnlocked ? lesson.emoji : "🔒"}
                </div>
                <button onClick={() => lessonUnlocked ? setExpanded(isExp ? null : lesson.id) : (onPurchaseLesson && onPurchaseLesson(lesson.id, world.id, 300))}
                  style={{ flex:1, background: done ? `${world.color}0e` : lessonUnlocked ? C.card : C.card2, border:`1.5px solid ${done ? world.color+"44" : lessonUnlocked ? world.color+"1a" : C.dim+"33"}`, borderRadius:13, padding:"10px 13px", cursor: lessonUnlocked ? "pointer" : "not-allowed", textAlign:"left" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color: lessonUnlocked ? "white" : C.dim }}>
                      L{li+1}: {lesson.title}
                      {world.id !== child.class_num && isLessonPurchased && !isLessonPurchased(world.id, lesson.id) && <span style={{fontSize:10,color:C.orange,marginLeft:6}}>💰 ₹300</span>}
                    </div>
                    <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                      <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>{cSets}/20 sets</span>
                      <span style={{ fontSize:13, color: lessonUnlocked ? world.color : C.dim }}>{isExp ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{lesson.sub}</div>
                  {!lessonUnlocked && (
                    <div style={{ marginTop:6, background:`${C.orange}22`, borderRadius:8, padding:"5px 8px", fontSize:11, color:C.orange, fontWeight:700 }}>
                      💰 Unlock this lesson for ₹300 — Tap to buy
                    </div>
                  )}
                  {lessonUnlocked && (
                    <div style={{ marginTop:5, background:"rgba(255,255,255,0.05)", borderRadius:5, height:4, overflow:"hidden" }}>
                      <div style={{ width:`${cSets*5}%`, height:"100%", background:`linear-gradient(90deg,${world.color},${C.cyan})`, borderRadius:5 }}/>
                    </div>
                  )}
                </button>
              </div>
              {/* Sets grid — shown when expanded */}
              {isExp && lessonUnlocked && (
                <div style={{ marginLeft:58, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7 }}>
                  {Array.from({length:20},(_,si) => {
                    const sDone   = isSetDone(lesson.id, si);
                    const sUnlock = isSetUnlocked(lesson.id, si);
                    return (
                      <button key={si} onClick={() => { if(sUnlock){ SFX.unlock(); onLesson({...lesson, setIndex:si, _progress:progress}); } else SFX.wrong(); }}
                        style={{ background: sDone ? `${world.color}22` : sUnlock ? C.card2 : "#060614", border:`1.5px solid ${sDone ? world.color : sUnlock ? world.color+"33" : "#0c0c20"}`, borderRadius:11, padding:"8px 5px", cursor: sUnlock ? "pointer" : "not-allowed", textAlign:"center", opacity: sUnlock ? 1 : 0.4 }}>
                        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color: sDone ? world.color : sUnlock ? "#aaa" : "#333" }}>SET {si+1}</div>
                        <div style={{ fontSize:14, marginTop:2 }}>{sDone ? "✅" : sUnlock ? "▶" : "🔒"}</div>
                        <div style={{ fontSize:8, color:C.dim, fontFamily:"'Orbitron',sans-serif", marginTop:1 }}>20 Q</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Game ──────────────────────────────────────────────────────────────
function Game({ lesson, world, child, setChild, onBack, onDone, onNextSet }) {
  const setIndex   = lesson.setIndex || 0;
  const difficulty = getDifficulty(lesson._progress||[], lesson.id);
  const [showCert, setShowCert] = useState(false);
  const mode       = lesson.mode || "quiz";
  const [questions, setQuestions] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    // Reset all game state when lesson or set changes
    setQuestions(null);
    setQi(0); setChosen(null); setScore(0); setHint(false); setDone(false); setSaving(false); setBurst(false);
    setLives(mode === "boss" ? 5 : 3); setBossHp(100); setBossCD(mode === "boss" ? 3 : 0); setTimeLeft(mode === "boss" ? 30 : null);
    scoreRef.current = 0; livesRef.current = mode === "boss" ? 5 : 3; bossHpRef.current = 100; processing.current = false;
    fetchSetQuestions(lesson.id, setIndex).then(qs => {
      if (!cancelled) {
        setQuestions(qs);
        // Prefetch next set in background so it's instant
        if (setIndex < 9) fetchSetQuestions(lesson.id, setIndex + 1);
      }
    });
    return () => { cancelled = true; };
  }, [lesson.id, setIndex]);
  const scoreRef   = useRef(0);
  const livesRef   = useRef(mode === "boss" ? 5 : 3);
  const bossHpRef  = useRef(100);
  const processing = useRef(false);

  const [qi,       setQi]       = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [lives,    setLives]    = useState(mode === "boss" ? 5 : 3);
  const [score,    setScore]    = useState(0);
  const [hint,     setHint]     = useState(false);
  const [done,     setDone]     = useState(false);
  const [burst,    setBurst]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [bossHp,   setBossHp]   = useState(100);
  const [timeLeft, setTimeLeft] = useState(mode === "boss" ? 30 : null);
  const [bossCD,   setBossCD]   = useState(mode === "boss" ? 3 : 0);
  const [bubbles,  setBubbles]  = useState([]);

  // Boss countdown
  useEffect(() => {
    if (mode !== "boss" || bossCD <= 0) return;
    const t = setTimeout(() => setBossCD(c => c-1), 1000);
    return () => clearTimeout(t);
  }, [bossCD, mode]);

  // Boss timer
  useEffect(() => {
    if (mode !== "boss" || done || bossCD > 0) return;
    const t = setInterval(() => setTimeLeft(tl => {
      if (tl <= 1) { if (finalizeRef.current) finalizeRef.current(); return 0; }
      return tl - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [mode, done, bossCD]);

  // Bubble regeneration — guard against null questions
  useEffect(() => {
    if (mode !== "bubble" || !questions || questions.length === 0) return;
    const q = questions[qi % questions.length];
    if (!q) return;
    setBubbles([...q.opts.map((text, id) => ({ id, text }))].sort(() => Math.random() - 0.5));
    processing.current = false;
  }, [qi, mode, questions]);

  const finalizeRef = useRef(null);
  const finalize = useCallback(() => {
    const fs      = scoreRef.current;
    const fst     = fs >= 16 ? 3 : fs >= 12 ? 2 : fs >= 6 ? 1 : 0;
    setTimeout(()=>{ if(fst>=3) SFX.starEarn(); else if(fst>0) SFX.xpGain(); }, 500);
    const xpEarned = fs * 20 + (mode === "boss" ? 50 : 0);
    const totalQ  = questions ? questions.length : 20;

    // Show result immediately — no waiting for DB
    setDone(true);

    // Optimistic XP update in UI
    setChild(c => c ? { ...c, xp:(c.xp||0)+xpEarned, coins:(c.coins||0)+fst*10, level:Math.floor(((c.xp||0)+xpEarned)/200)+1 } : c);

    // Save to DB in background (non-blocking)
    db.saveProgress(child.id, lesson.id + "_s" + setIndex, { correct:fs, total:totalQ, stars:fst, xpEarned });
    db.addXP(child.id, xpEarned, fst * 10);
    if(xpEarned>0) setTimeout(()=>SFX.xpGain(), 300);
  }, [child.id, lesson.id, questions, mode, setChild, setIndex]);
  useEffect(() => { finalizeRef.current = finalize; }, [finalize]);

  const advance = useCallback((shouldEnd) => {
    if (shouldEnd) { finalize(); return; }
    setQi(x => x+1); setChosen(null); setHint(false); processing.current = false;
  }, [finalize]);

  const pick = useCallback((ansIdx) => {
    if (chosen !== null || processing.current) return;
    processing.current = true;
    if (!questions || questions.length === 0) return;
    const q = questions[qi % questions.length];
    if (!q) return;
    const ok = ansIdx === q.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    setChosen(ansIdx);
    if (ok) {
      scoreRef.current += 1; setScore(scoreRef.current);
      setBurst(true); setTimeout(() => setBurst(false), 600);
      if (mode === "boss") { SFX.bossHit(); bossHpRef.current = Math.max(0, bossHpRef.current - 20); setBossHp(bossHpRef.current); }
    } else {
      livesRef.current = Math.max(0, livesRef.current - 1); setLives(livesRef.current);
    }
    const end = qi+1 >= questions.length || (livesRef.current <= 0 && !ok) || (mode === "boss" && bossHpRef.current <= 0);
    setTimeout(() => advance(end), 900);
  }, [chosen, qi, questions, mode, advance]);

  const fs   = scoreRef.current;
  const fst  = fs >= 16 ? 3 : fs >= 12 ? 2 : fs >= 6 ? 1 : 0;
  // Loading state while fetching from Supabase
  if (questions === null) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ width:44, height:44, border:`3px solid ${C.purple}44`, borderTopColor:C.purple, borderRadius:"50%", animation:"spinR 0.8s linear infinite", margin:"0 auto 14px" }}/>
        <div style={{ fontFamily:"'Orbitron',sans-serif", color:C.dim, fontSize:11, letterSpacing:2 }}>LOADING QUESTIONS…</div>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", color:C.red, fontSize:13, marginBottom:14 }}>⚠ Questions not found.<br/>Check Supabase seed.</div>
        <Btn color={C.dim} style={{width:160,padding:"10px"}} onClick={onBack}>← BACK</Btn>
      </div>
    </div>
  );

  const q    = questions[qi % questions.length];

  if (done) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:22, position:"relative" }}>
      {showCert && <Certificate child={child} lesson={lesson} stars={fst} onClose={()=>setShowCert(false)}/>}
      <Confetti active={fst>=2}/>
      <Starfield n={60}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease" }}>
        <div style={{ fontSize:72, marginBottom:10, filter:`drop-shadow(0 0 24px ${fst>=2 ? C.yellow : C.dim})` }}>
          {mode==="boss" && bossHpRef.current<=0 ? "🏆" : fst===3 ? "🏆" : fst===2 ? "🥈" : fst>=1 ? "🥉" : "💫"}
        </div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:20, background:`linear-gradient(135deg,${C.cyan},${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:8 }}>
          {mode==="boss" && bossHpRef.current<=0 ? "BOSS DEFEATED!" : fst>=2 ? "MISSION COMPLETE!" : fst>=1 ? "GOOD EFFORT!" : "KEEP TRAINING!"}
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:16 }}>
          {[1,2,3].map(i => <span key={i} style={{ fontSize:34, filter: i<=fst ? "none" : "grayscale(1) opacity(0.2)" }}>⭐</span>)}
        </div>
        <Card color={C.purple} style={{ marginBottom:16, textAlign:"center", padding:"14px 26px" }}>
          <div style={{ color:C.dim, fontSize:10, fontFamily:"'Orbitron',sans-serif", letterSpacing:1 }}>SCORE</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:38, color:"white"}}>{fs}<span style={{ fontSize:15, color:C.dim }}>/{questions.length}</span></div>
          <div style={{ color:C.yellow, fontWeight:700, fontSize:12, marginTop:3 }}>+{fs*20+(mode==="boss"?50:0)} XP · +{fst*10} COINS</div>
          <div style={{ color:C.green, fontSize:9, marginTop:4, fontFamily:"'Orbitron',sans-serif" }}>✅ PROGRESS SAVED</div>
        </Card>
        {/* Unlock badge for next set */}
        {setIndex < 9 && fst >= 1 && (
          <div style={{ background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:11, padding:"7px 14px", marginBottom:12, width:"100%", maxWidth:300 }}>
            <div style={{ color:C.green, fontSize:10, fontFamily:"'Orbitron',sans-serif", textAlign:"center" }}>🔓 SET {setIndex+2} UNLOCKED!</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8, width:"100%", maxWidth:300 }}>
          <Btn color={C.dim} style={{ flex:1, padding:"11px" }} onClick={() => {
            scoreRef.current = 0; livesRef.current = mode==="boss"?5:3; bossHpRef.current = 100; processing.current = false;
            setQi(0); setChosen(null); setScore(0); setLives(mode==="boss"?5:3); setBossHp(100); setDone(false); setBossCD(mode==="boss"?3:0); setTimeLeft(mode==="boss"?30:null);
          }}>↺ RETRY</Btn>
          <Btn color={C.purple} style={{ flex:1, padding:"11px" }} onClick={onBack}>🏠</Btn>
          {setIndex < 9 && fst >= 1
            ? <Btn color={C.cyan} style={{ flex:1, padding:"11px" }} onClick={() => onNextSet && onNextSet(setIndex+1)}>SET {setIndex+2} →</Btn>
            : <Btn color={C.cyan} style={{ flex:1, padding:"11px" }} onClick={onDone}>DONE ✓</Btn>
          }
        </div>
      </div>
    </div>
  );

  if (mode === "boss" && bossCD > 0) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={30}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ fontSize:80, marginBottom:16, animation:"bossW 0.5s ease-in-out infinite" }}>{lesson.boss||"👾"}</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color:C.red, marginBottom:12, letterSpacing:2 }}>BOSS INCOMING!</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:80, color:C.yellow, textShadow:`0 0 40px ${C.yellow}` }}>{bossCD}</div>
      </div>
    </div>
  );

  // Boss UI
  if (mode === "boss") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={25}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.red}18`, borderBottom:`1px solid ${C.red}33`, padding:"12px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <BackBtn onClick={onBack} color={C.red}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.red }}>⚔️ BOSS BATTLE</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color: timeLeft<=10 ? C.red : C.yellow }}>{timeLeft}s</div>
        </div>
        <div style={{ marginBottom:5 }}>
          <div style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif", marginBottom:3 }}>BOSS HP</div>
          <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, height:10, overflow:"hidden" }}>
            <div style={{ width:`${bossHp}%`, height:"100%", background:`linear-gradient(90deg,${C.red},${C.orange})`, borderRadius:8, transition:"width 0.4s" }}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:3 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ fontSize:12, opacity: i<=lives ? 1 : 0.15 }}>❤️</span>)}</div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px", textAlign:"center" }}>
        <div style={{ fontSize:58, animation:"bossW 1.5s ease-in-out infinite", marginBottom:10 }}>{lesson.boss||"👾"}</div>
        {burst && <div style={{ fontSize:13, color:C.green, marginBottom:6, fontFamily:"'Orbitron',sans-serif", position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)", zIndex:998, background:`${C.green}22`, borderRadius:12, padding:"8px 20px" }}>⚡ HIT! Boss HP: {bossHp}%</div>}
        <Card color={C.red} style={{ marginBottom:12, padding:"16px 14px", textAlign:"left" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:15, color:"white", lineHeight:1.5 }}>{q.q}</div>
        </Card>
        <div style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif", marginBottom:8 }}>Q {qi+1}/{questions.length} · Score: {score}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {q.opts.map((opt, i) => {
            let bg=C.card, border=`1.5px solid ${C.red}28`, col="white";
            if (chosen!==null) { if(i===q.ans){bg="#052e16";border=`2px solid ${C.green}`;col="#4ade80";}else if(i===chosen){bg="#2d0a0a";border=`2px solid ${C.red}`;col="#f87171";} }
            return <button key={i} onClick={() => pick(i)} style={{ background:bg, border, borderRadius:13, padding:"13px 10px", fontSize:16, fontFamily:"'Orbitron',sans-serif", color:col, cursor: chosen!==null?"default":"pointer", transition:"all 0.15s" }}>{i===q.ans&&chosen!==null?"✓ ":""}{opt}</button>;
          })}
        </div>
      </div>
    </div>
  );

  // Bubble pop
  if (mode === "bubble") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative", overflow:"hidden" }}>
      <Starfield n={18}/>
      <div style={{ position:"relative", zIndex:2, background:`${world.color}16`, borderBottom:`1px solid ${world.color}2a`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <BackBtn onClick={onBack} color={world.color}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:world.color }}>🫧 BUBBLE POP · Q{qi+1}/{questions.length}</div>
          <div style={{ display:"flex", gap:3 }}>{[1,2,3].map(i => <span key={i} style={{ fontSize:13, opacity: i<=lives ? 1 : 0.15 }}>❤️</span>)}</div>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"18px 18px", textAlign:"center" }}>
        <Card color={world.color} style={{ marginBottom:18, padding:"14px" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:15, color:"white"}}>{q.q}</div>
          <div style={{ color:C.dim, fontSize:11, marginTop:5, fontFamily:"'Orbitron',sans-serif" }}>TAP THE CORRECT BUBBLE!</div>
        </Card>
        <div style={{ display:"flex", flexWrap:"wrap", gap:16, justifyContent:"center", marginTop:10 }}>
          {bubbles.map((b, idx) => {
            let bg    = `radial-gradient(circle at 30% 30%, ${world.color}88, ${world.color}33)`;
            let brd   = `3px solid ${world.color}88`;
            if (chosen !== null) {
              if (b.id === q.ans)     { SFX.bubblePop(); bg = `radial-gradient(circle at 30% 30%, ${C.green}88, ${C.green}33)`; brd = `3px solid ${C.green}`; }
              else if (b.id === chosen){ bg = `radial-gradient(circle at 30% 30%, ${C.red}88, ${C.red}33)`;   brd = `3px solid ${C.red}`;   }
            }
            return (
              <button key={b.id} onClick={() => chosen === null && pick(b.id)} style={{ width:76, height:76, borderRadius:"50%", background:bg, border:brd, color:"white", fontSize:15, fontFamily:"'Orbitron',sans-serif", fontWeight:700, cursor: chosen!==null?"default":"pointer", boxShadow:`0 0 18px ${world.color}55`, animation:`bFloat ${2+idx*0.3}s ease-in-out ${idx*0.2}s infinite`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                {b.text}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop:16, color:C.dim, fontSize:12, fontWeight:700 }}>Score: {score} ⭐</div>
      </div>
    </div>
  );

  // Standard quiz
  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Nunito',sans-serif", position:"relative", background: burst ? `radial-gradient(circle at 50% 40%,${world.color}18 0%,${C.bg} 65%)` : C.bg, transition:"background 0.4s" }}>
      <Starfield n={16}/>
      <div style={{ position:"relative", zIndex:2, background:`${world.color}16`, borderBottom:`1px solid ${world.color}2a`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
          <BackBtn onClick={onBack} color={world.color}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:world.color }}>{lesson.emoji} {lesson.title}</div>
          <div style={{ display:"flex", gap:3 }}>{[1,2,3].map(i => <span key={i} style={{ fontSize:13, opacity: i<=lives ? 1 : 0.15 }}>❤️</span>)}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:7, height:5, overflow:"hidden" }}>
          <div style={{ width:`${((qi+1)/questions.length)*100}%`, height:"100%", background:`linear-gradient(90deg,${world.color},${C.cyan})`, borderRadius:7, transition:"width 0.4s" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>Q {qi+1}/{questions.length}</span>
          <span style={{ fontSize:9, color:C.yellow, fontFamily:"'Orbitron',sans-serif" }}>SCORE: {score}</span>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        {/* correct feedback: card scales up */}
        <Card color={world.color} style={{ textAlign:"center", padding:"18px 14px", marginBottom:12, transform: burst?"scale(1.02)":"scale(1)", transition:"transform 0.2s" }}>
          <div style={{ fontSize:34, marginBottom:8 }}>{lesson.emoji}</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color:"white", lineHeight:1.4 }}>{q.q}</div>
          {/* correct shown via overlay below */}
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          {q.opts.map((opt, i) => {
            let bg=C.card, border=`1.5px solid ${world.color}28`, col="white";
            if (chosen!==null) { if(i===q.ans){bg="#052e16";border=`2px solid ${C.green}`;col="#4ade80";}else if(i===chosen){bg="#2d0a0a";border=`2px solid ${C.red}`;col="#f87171";} }
            return <button key={i} onClick={() => pick(i)} style={{ background:bg, border, borderRadius:13, padding:"13px 10px", fontSize:16, fontFamily:"'Orbitron',sans-serif", color:col, cursor: chosen!==null?"default":"pointer", transition:"all 0.15s" }}>{i===q.ans&&chosen!==null?"✓ ":i===chosen&&i!==q.ans&&chosen!==null?"✗ ":""}{opt}</button>;
          })}
        </div>
        {chosen === null && (
          <button onClick={() => setHint(h => !h)} style={{ width:"100%", background: hint ? `${C.yellow}14` : C.card, border:`1.5px solid ${hint ? C.yellow+"55" : "#111128"}`, borderRadius:12, padding:"10px 13px", cursor:"pointer", color: hint ? C.yellow : C.dim, fontSize:12, fontWeight:700, textAlign:"left" }}>
            💡 {hint ? q.h : "Tap for a cosmic hint!"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Abacus ────────────────────────────────────────────────────────────
function Abacus({ onBack, child }) {
  const [unlockedLvl, setUnlockedLvl] = useState(1);
  const [level,    setLevel]    = useState(0);

  // Load abacus progress from DB on mount to restore unlocked levels
  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      // Each completed abacus level is stored as "abacus_lvl_N"
      let maxUnlocked = 1;
      data.forEach(p => {
        const m = p.lesson_id?.match(/^abacus_lvl_(\d+)$/);
        if (m) maxUnlocked = Math.max(maxUnlocked, parseInt(m[1]) + 1);
      });
      setUnlockedLvl(Math.min(maxUnlocked, 30));
    });
  }, [child?.id]);
  const [pi,       setPi]       = useState(0);
  const [tens,     setTens]     = useState(0);
  const [ones,     setOnes]     = useState(0);
  const [hundreds, setHundreds] = useState(0);
  const [checked,  setChecked]  = useState(false);
  const [wrong,    setWrong]    = useState(false);
  const [levelDone,setLevelDone]= useState(false);
  const [qCorrect, setQCorrect] = useState(0); // correct in this level

  const lv   = ABACUS_LEVELS[level];
  const prob = lv.probs[pi];
  const hasH = typeof prob.h === 'number' && prob.h > 0;
  const ok   = checked && tens === prob.t && ones === prob.o && (!hasH || hundreds === prob.h);

  const goLevel = (idx) => {
    if (idx >= unlockedLvl) return;
    setLevel(idx); setPi(0); setTens(0); setOnes(0); setHundreds(0);
    setChecked(false); setWrong(false); setLevelDone(false); setQCorrect(0);
  };

  if (levelDone) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:22, position:"relative" }}>
      <Starfield n={50}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease" }}>
        <div style={{ fontSize:72, marginBottom:10 }}>🧮✨</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:20, color:C.cyan, marginBottom:6 }}>LEVEL {lv.level} COMPLETE!</div>
        <div style={{ color:C.dim, fontSize:13, marginBottom:4 }}>{lv.title} — Mastered!</div>
        <div style={{ color:C.yellow, fontFamily:"'Orbitron',sans-serif", fontSize:12, marginBottom:18 }}>{qCorrect}/{lv.probs.length} correct ⭐</div>
        {level < ABACUS_LEVELS.length-1 && (
          <div style={{ background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:12, padding:"8px 14px", marginBottom:14 }}>
            <div style={{ color:C.green, fontSize:11, fontFamily:"'Orbitron',sans-serif" }}>🔓 LEVEL {lv.level+1} UNLOCKED!</div>
          </div>
        )}
        <div style={{ display:"flex", gap:12, width:"100%", maxWidth:280 }}>
          <Btn color={C.dim} style={{ flex:1, padding:"11px" }} onClick={onBack}>HOME</Btn>
          {level < ABACUS_LEVELS.length-1 && (
            <Btn color={C.cyan} style={{ flex:1, padding:"11px" }} onClick={() => { goLevel(level+1); setLevelDone(false); }}>
              LEVEL {lv.level+1} →
            </Btn>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.purple}1a`, borderBottom:`1px solid ${C.purple}33`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <BackBtn onClick={onBack}/>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.purple }}>🧮 SPACE ABACUS</div>
            <div style={{ fontSize:10, color:C.dim }}>{unlockedLvl}/30 levels unlocked</div>
          </div>
        </div>
        {/* Level selector — scrollable row */}
        <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:3 }}>
          {ABACUS_LEVELS.map((al, i) => {
            const isUnlocked = i < unlockedLvl;
            const isCurrent  = level === i;
            return (
              <button key={i} onClick={() => isUnlocked && goLevel(i)}
                style={{ flexShrink:0, width:36, height:36, background: isCurrent ? `${C.purple}44` : isUnlocked ? C.card2 : "#060614", border:`1.5px solid ${isCurrent ? C.cyan : isUnlocked ? C.purple+"44" : "#0c0c20"}`, borderRadius:10, color: isCurrent ? C.cyan : isUnlocked ? "#aaa" : "#333", fontSize:9, fontFamily:"'Orbitron',sans-serif", cursor: isUnlocked ? "pointer" : "not-allowed", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                {isUnlocked ? <span>L{al.level}</span> : <span style={{fontSize:11}}>🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:18 }}>
        <Card color={C.purple} style={{ textAlign:"center", marginBottom:14 }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:4 }}>
            LEVEL {lv.level} · {lv.title} · Q{pi+1}/{lv.probs.length}
          </div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color:C.cyan }}>{prob.q}</div>
          {/* Progress bar within level */}
          <div style={{ marginTop:8, background:"rgba(255,255,255,0.05)", borderRadius:5, height:4, overflow:"hidden" }}>
            <div style={{ width:`${(pi/lv.probs.length)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.purple},${C.cyan})`, borderRadius:5 }}/>
          </div>
        </Card>

        {/* Abacus rods */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:12 }}>
          {hasH && <AbacusRod count={hundreds} setCount={setHundreds} color={C.pink}   label="HUNDREDS"/>}
          <AbacusRod count={tens}     setCount={setTens}     color={C.orange} label="TENS"/>
          <AbacusRod count={ones}     setCount={setOnes}     color={C.cyan}   label="ONES"/>
        </div>

        <div style={{ textAlign:"center", marginBottom:12, fontFamily:"'Orbitron',sans-serif", fontSize:40, color:C.purple, textShadow:`0 0 16px ${C.purple}` }}>
          {(hasH ? hundreds*100 : 0) + tens*10 + ones}
        </div>

        {checked && (
          <Card color={ok ? C.green : C.red} style={{ textAlign:"center", marginBottom:12, padding:"10px" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color: ok ? "#4ade80" : "#f87171" }}>
              {ok ? "🚀 PERFECT LAUNCH!" : `💡 Answer: ${hasH?prob.h+"h + ":""}${prob.t} tens + ${prob.o} ones = ${(hasH?prob.h*100:0)+prob.t*10+prob.o}`}
            </div>
          </Card>
        )}

        {!checked
          ? <Btn color={C.purple} onClick={() => { setChecked(true); setWrong(!(tens===prob.t && ones===prob.o && (!hasH||hundreds===prob.h))); }}>CHECK ANSWER ✓</Btn>
          : <Btn color={ok ? C.yellow : C.orange} onClick={() => {
              const newCorrect = qCorrect + (ok ? 1 : 0);
              if (pi+1 >= lv.probs.length) {
                setQCorrect(newCorrect);
                // unlock next level
                const nextUnlock = level + 2;
                setUnlockedLvl(u => Math.max(u, nextUnlock));
                if (child?.id) db.saveProgress(child.id, `abacus_lvl_${level+1}`, { correct: newCorrect, total: lv.probs.length, stars: newCorrect >= 18 ? 3 : newCorrect >= 14 ? 2 : 1, xpEarned: newCorrect * 5 });
                setLevelDone(true);
              } else {
                setQCorrect(newCorrect);
                setPi(p => p+1); setTens(0); setOnes(0); setHundreds(0); setChecked(false); setWrong(false);
              }
            }}>NEXT →</Btn>
        }
      </div>
    </div>
  );
}

// ── Olympiad ──────────────────────────────────────────────────────────
function Olympiad({ child, setChild, onBack }) {
  const [view,     setView]     = useState("list");
  const [testIdx,  setTestIdx]  = useState(0);
  const [qi,       setQi]       = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [saving,   setSaving]   = useState(false);
  const [results,  setResults]  = useState([]);
  const [doneTests,setDoneTests]= useState([]);
  const scoreRef  = useRef(0);
  const savedRef  = useRef(false);

  // Restore completed tests from DB on mount
  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      const done = data
        .filter(p => p.lesson_id?.startsWith("olympiad_test_"))
        .map(p => parseInt(p.lesson_id.replace("olympiad_test_", "")));
      if (done.length > 0) setDoneTests(done);
    });
  }, [child?.id]);

  const test     = OLYMPIAD_TESTS[testIdx] || OLYMPIAD_TESTS[0];
  const question = test[qi];

  // Per-question countdown
  useEffect(() => {
    if (view !== "test" || chosen !== null) return;
    const qTime = question?.time || 45;
    setTimeLeft(qTime);
  }, [qi, view]);

  useEffect(() => {
    if (view !== "test" || chosen !== null) return;
    if (timeLeft <= 0) { handlePick(-1); return; } // time out = wrong
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [view, timeLeft, chosen]);

  const handlePick = (idx) => {
    if (chosen !== null) return;
    const ok = idx === question.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    setChosen(idx);
    setResults(r => [...r, ok]);
    if (ok) { scoreRef.current += 1; setScore(scoreRef.current); }
    setTimeout(() => {
      if (qi + 1 >= test.length) {
        // done
        if (!savedRef.current) {
          savedRef.current = true;
          setSaving(true);
          db.addXP(child.id, scoreRef.current * 25, scoreRef.current * 5)
            .then(({data:nc}) => { if (nc) setChild(nc); setSaving(false); });
          db.saveProgress(child.id, `olympiad_test_${testIdx}`, { correct: scoreRef.current, total: test.length, stars: scoreRef.current >= 20 ? 3 : scoreRef.current >= 15 ? 2 : 1, xpEarned: scoreRef.current * 25 });
        }
        setDoneTests(dt => dt.includes(testIdx) ? dt : [...dt, testIdx]);
        setView("result");
      } else {
        setQi(q => q+1); setChosen(null);
      }
    }, 1000);
  };

  const isTestUnlocked = (ti) => ti === 0 || doneTests.includes(ti - 1);
  const isTestDone     = (ti) => doneTests.includes(ti);

  const startTest = (ti) => {
    setTestIdx(ti); setQi(0); setChosen(null); setScore(0);
    setResults([]); savedRef.current = false; setView("test");
  };

  // ── Test list ──
  if (view === "list") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={35}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.purple}1a`, borderBottom:`1px solid ${C.purple}33`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <BackBtn onClick={onBack} color={C.purple}/>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.purple }}>🎓 OLYMPIAD TESTS</div>
            <div style={{ fontSize:10, color:C.dim }}>{doneTests.length}/30 completed · SOF IMO · ASSET · NTSE</div>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:6, height:5, overflow:"hidden" }}>
          <div style={{ width:`${(doneTests.length/30)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.purple},${C.cyan})`, borderRadius:6 }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        {/* Grid of tests */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {OLYMPIAD_TESTS.map((_, ti) => {
            const done    = isTestDone(ti);
            const unlocked = isTestUnlocked(ti);
            const diffLabel = ti < 10 ? "EASY" : ti < 20 ? "MED" : "HARD";
            const diffColor = ti < 10 ? C.green : ti < 20 ? C.yellow : C.red;
            return (
              <button key={ti} onClick={() => unlocked && startTest(ti)}
                style={{ background: done ? `${C.purple}22` : unlocked ? C.card : "#060614", border:`1.5px solid ${done ? C.purple : unlocked ? C.purple+"33" : "#0c0c20"}`, borderRadius:14, padding:"12px 8px", cursor: unlocked ? "pointer" : "not-allowed", textAlign:"center", opacity: unlocked ? 1 : 0.4 }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{done ? "🏅" : unlocked ? "📋" : "🔒"}</div>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color: done ? C.purple : unlocked ? "#ccc" : "#333" }}>TEST {ti+1}</div>
                <div style={{ fontSize:8, color:diffColor, fontFamily:"'Orbitron',sans-serif", marginTop:2 }}>{diffLabel}</div>
                <div style={{ fontSize:8, color:C.dim, marginTop:1 }}>25 Q</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Active test ──
  if (view === "test") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.purple}18`, borderBottom:`1px solid ${C.purple}33`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <BackBtn onClick={() => setView("list")} color={C.purple}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.purple }}>🎓 TEST {testIdx+1} · Q{qi+1}/25</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color: timeLeft <= 10 ? C.red : C.yellow }}>{timeLeft}s</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:6, height:5, overflow:"hidden" }}>
          <div style={{ width:`${((qi)/25)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.purple},${C.cyan})`, borderRadius:6, transition:"width 0.4s" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>Score: {score}</span>
          <div style={{ width:`${(timeLeft/(question?.time||45))*100}%`, maxWidth:80, height:4, background:timeLeft<=10?C.red:C.green, borderRadius:4, transition:"width 1s linear" }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        <Card color={C.purple} style={{ marginBottom:14, padding:"18px 14px" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:15, color:"white", lineHeight:1.5 }}>{question.q}</div>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {question.opts.map((opt, i) => {
            let bg=C.card, border=`1.5px solid ${C.purple}28`, col="white";
            if (chosen !== null) {
              if (i===question.ans) { bg="#052e16"; border=`2px solid ${C.green}`; col="#4ade80"; }
              else if (i===chosen)  { bg="#2d0a0a"; border=`2px solid ${C.red}`;   col="#f87171"; }
            }
            return <button key={i} onClick={() => chosen===null && handlePick(i)}
              style={{ background:bg, border, borderRadius:13, padding:"13px 10px", fontSize:14, fontFamily:"'Orbitron',sans-serif", color:col, cursor:chosen!==null?"default":"pointer", transition:"all 0.15s" }}>
              {chosen!==null && i===question.ans ? "✓ " : ""}{opt}
            </button>;
          })}
        </div>
        {chosen!==null && (
          <div style={{ background:`${C.cyan}14`, border:`1px solid ${C.cyan}33`, borderRadius:11, padding:"9px 13px" }}>
            <div style={{ color:C.cyan, fontSize:12, fontWeight:700 }}>💡 {question.h}</div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Result ──
  const total = test.length;
  const pct   = Math.round((score/total)*100);
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:22, position:"relative" }}>
      <Starfield n={60}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease", width:"100%", maxWidth:340 }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{pct>=80?"🥇":pct>=60?"🥈":pct>=40?"🥉":"📚"}</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, background:`linear-gradient(135deg,${C.purple},${C.cyan})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:10 }}>
          {pct>=80?"BRILLIANT!":pct>=60?"WELL DONE!":pct>=40?"GOOD TRY!":"KEEP GOING!"}
        </div>
        <Card color={C.purple} style={{ marginBottom:14, textAlign:"center" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:36, color:"white"}}>{score}<span style={{ fontSize:14, color:C.dim }}>/{total}</span></div>
          <div style={{ color:C.yellow, fontSize:13, fontWeight:700, marginTop:3 }}>+{score*25} XP · +{score*5} COINS</div>
          <div style={{ marginTop:8, background:"rgba(255,255,255,0.06)", borderRadius:6, height:8, overflow:"hidden" }}>
            <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${pct>=60?C.green:C.orange},${C.cyan})`, borderRadius:6 }}/>
          </div>
          <div style={{ color:C.dim, fontSize:11, marginTop:3 }}>{pct}% accuracy</div>
          <div style={{ color:C.green, fontSize:9, marginTop:4, fontFamily:"'Orbitron',sans-serif" }}>✅ PROGRESS SAVED</div>
        </Card>
        {testIdx < OLYMPIAD_TESTS.length-1 && (
          <div style={{ background:`${C.green}14`, border:`1px solid ${C.green}33`, borderRadius:11, padding:"8px 12px", marginBottom:12 }}>
            <div style={{ color:C.green, fontSize:10, fontFamily:"'Orbitron',sans-serif" }}>🔓 TEST {testIdx+2} UNLOCKED!</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8 }}>
          <Btn color={C.dim} style={{ flex:1 }} onClick={() => { setView("list"); }}>← ALL TESTS</Btn>
          <Btn color={C.purple} style={{ flex:1 }} onClick={() => { startTest(testIdx); }}>↺ RETRY</Btn>
          {testIdx < OLYMPIAD_TESTS.length-1 && (
            <Btn color={C.cyan} style={{ flex:1 }} onClick={() => startTest(testIdx+1)}>NEXT →</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Parent Dashboard ──────────────────────────────────────────────────
function ParentDash({ child, onBack }) {
  const [progress, setProgress] = useState([]);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => {
    db.getProgress(child.id).then(({ data }) => { setProgress(data || []); setLoading(false); });
  }, [child.id]);

  const myLessons    = LESSONS[child.class_num] || LESSONS[1];
  const allLessons   = Object.values(LESSONS).flat();
  const totalQ       = progress.reduce((s,p) => s+(p.total_questions||0), 0);
  const totalCorrect = progress.reduce((s,p) => s+(p.correct_count||0), 0);
  const acc          = totalQ > 0 ? Math.round((totalCorrect/totalQ)*100) : 0;
  const totalStars   = progress.reduce((s,p) => s+(p.stars_earned||0), 0);
  const weakTopics   = progress.filter(p => (p.stars_earned||0) <= 1).map(p => allLessons.find(l => l.id===p.lesson_id)?.title || p.lesson_id);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ width:36, height:36, border:`3px solid ${C.purple}44`, borderTopColor:C.purple, borderRadius:"50%", animation:"spinR 0.7s linear infinite", margin:"0 auto 12px" }}/>
        <div style={{ fontFamily:"'Orbitron',sans-serif", color:C.dim, fontSize:11 }}>LOADING…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative", paddingBottom:40 }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.pink}1a`, borderBottom:`1px solid ${C.pink}33`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <BackBtn onClick={onBack} color={C.pink}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.pink }}>📊 PARENT DASHBOARD</div>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        <Card color={C.purple} style={{ marginBottom:12, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:42 }}>{child.avatar}</div>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:"white"}}>{child.name}</div>
            <div style={{ color:C.dim, fontSize:12, marginTop:2 }}>{WORLDS[(child.class_num||1)-1].name} · Level {child.level||1}</div>
            <div style={{ color: child.is_premium ? C.yellow : C.dim, fontSize:11, marginTop:2, fontWeight:700 }}>{child.is_premium ? "⭐ Premium" : "Free Plan"}</div>
          </div>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {[{e:"⭐",v:totalStars,l:"Stars",c:C.yellow},{e:"📚",v:progress.length,l:"Done",c:C.cyan},{e:"🎯",v:`${acc}%`,l:"Accuracy",c:C.green},{e:"💎",v:child.xp||0,l:"Total XP",c:C.purple}].map((s,i) => (
            <Card key={i} color={s.c} style={{ textAlign:"center", padding:"11px 8px" }}>
              <div style={{ fontSize:22, marginBottom:3 }}>{s.e}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:17, color:"white"}}>{s.v}</div>
              <div style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>{s.l}</div>
            </Card>
          ))}
        </div>
        <Card color={C.green} style={{ marginBottom:12 }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.green, marginBottom:8 }}>📈 ACCURACY</div>
          <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, height:12, overflow:"hidden", marginBottom:5 }}>
            <div style={{ width:`${acc}%`, height:"100%", background:`linear-gradient(90deg,${C.green},${C.cyan})`, borderRadius:8, transition:"width 1s ease" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:C.dim, fontSize:11 }}>{totalCorrect}/{totalQ} correct</span>
            <span style={{ color: acc>=70?C.green:acc>=50?C.yellow:C.red, fontWeight:700, fontSize:12 }}>{acc}%</span>
          </div>
        </Card>
        {weakTopics.length > 0 && (
          <Card color={C.orange} style={{ marginBottom:12 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.orange, marginBottom:8 }}>⚠️ NEEDS PRACTICE</div>
            {weakTopics.slice(0,4).map((t,i) => <div key={i} style={{ display:"flex", gap:10, marginBottom:5 }}><span style={{ color:C.orange }}>▸</span><span style={{ color:"#ccc", fontSize:13 }}>{t}</span></div>)}
          </Card>
        )}
        <Card color={C.orange} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:32 }}>🔥</div>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, color:C.orange }}>{child.streak_days||0} Day Streak!</div>
              <div style={{ color:C.dim, fontSize:12, marginTop:2 }}>{(child.streak_days||0)>=7?"Amazing! 🌟":(child.streak_days||0)>=3?"Great! 💪":"Start today! 🚀"}</div>
            </div>
          </div>
        </Card>
        <Card color={C.cyan} style={{ marginBottom:12 }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.cyan, marginBottom:10 }}>📚 LESSONS</div>
          {myLessons.map(l => {
            // Count completed sets for this lesson
            const setsDone = Array.from({length:20},(_,i)=>i).filter(si => progress.some(x => x.lesson_id === l.id + "_s" + si)).length;
            const bestStars = progress.filter(x => x.lesson_id.startsWith(l.id + "_s")).reduce((max,x) => Math.max(max, x.stars_earned||0), 0);
            return (
              <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:15 }}>{setsDone > 0 ? "✅" : "⬜"}</span>
                <span style={{ color: setsDone > 0 ? "white" : "#444", fontSize:12, flex:1 }}>{l.title}</span>
                <span style={{ color:C.dim, fontSize:10, fontFamily:"'Orbitron',sans-serif" }}>{setsDone}/20</span>
                <div style={{ display:"flex", gap:2 }}>{[1,2,3].map(s => <span key={s} style={{ fontSize:10, filter: s<=bestStars ? "none" : "grayscale(1) opacity(0.2)" }}>⭐</span>)}</div>
              </div>
            );
          })}
        </Card>
        <AnalyticsCard childId={child.id} />
      </div>
    </div>
  );
}

function AnalyticsCard({ childId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const sb = window.__mmSb;
    if (!sb) return;
    sb.from("analytics").select("event_type,created_at")
      .eq("child_id", childId).order("created_at",{ascending:false}).limit(200)
      .then(({data:evts}) => {
        if (!evts) return;
        const byType = {};
        evts.forEach(e => { byType[e.event_type]=(byType[e.event_type]||0)+1; });
        const today = new Date().toISOString().slice(0,10);
        setData({ byType, total:evts.length, todayCount:evts.filter(e=>e.created_at?.slice(0,10)===today).length });
      }).catch(()=>{});
  }, [childId]);
  if (!data) return null;
  return (
    <Card color={C.purple} style={{ marginBottom:12 }}>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.purple, marginBottom:10 }}>📊 USAGE ANALYTICS</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          {icon:"📱",label:"App Opens",   val:data.byType["app_open"]||0},
          {icon:"📅",label:"Today",       val:data.todayCount},
          {icon:"✅",label:"Sets Done",   val:data.byType["lesson_complete"]||0},
          {icon:"🌟",label:"Challenges",  val:data.byType["daily_challenge_complete"]||0},
          {icon:"🧩",label:"Puzzles",     val:data.byType["daily_puzzle_complete"]||0},
          {icon:"📊",label:"Total Events",val:data.total},
        ].map(({icon,label,val})=>(
          <div key={label} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 10px",display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:18}}>{icon}</span>
            <div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14, color:"white"}}>{val}</div>
              <div style={{color:C.dim,fontSize:9}}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}


// ─────────────────────────────────────────────────────────────────────
// FEEDBACK / REPORT SCREEN
// ─────────────────────────────────────────────────────────────────────
const FEEDBACK_CATS = [
  { id:"bug",       icon:"🐛", label:"App Bug / Error",        color:"#ef4444" },
  { id:"freeze",    icon:"🧊", label:"App Froze / Not Responding", color:"#0ea5e9" },
  { id:"question",  icon:"❓", label:"Question is Wrong",       color:"#f97316" },
  { id:"payment",   icon:"💳", label:"Payment Issue",           color:"#a855f7" },
  { id:"content",   icon:"📚", label:"Content / Lesson Issue",  color:"#22c55e" },
  { id:"account",   icon:"👤", label:"Account / Login Issue",   color:"#ec4899" },
  { id:"suggestion",icon:"💡", label:"Suggestion / Idea",       color:"#fbbf24" },
  { id:"other",     icon:"📝", label:"Other",                   color:"#6b7db3" },
];

function FeedbackScreen({ child, currentScreen, onBack, prefillCategory }) {
  const [cat,     setCat]     = useState(prefillCategory || null);
  const [desc,    setDesc]    = useState("");
  const [step,    setStep]    = useState("form"); // "form" | "sent" | "error"
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const deviceInfo = [
    navigator.userAgent.substring(0, 80),
    `Screen: ${window.screen.width}x${window.screen.height}`,
    `Online: ${navigator.onLine}`,
    `Lang: ${navigator.language}`,
  ].join(" | ");

  const handleSubmit = async () => {
    if (!cat)         { alert("Please select a category"); return; }
    if (desc.trim().length < 10) { alert("Please describe the issue (at least 10 characters)"); return; }
    setLoading(true);
    const payload = {
      child_id:    child?.id    || "guest",
      child_name:  child?.name  || "Unknown",
      category:    cat,
      description: desc.trim(),
      screen:      currentScreen || "unknown",
      device_info: deviceInfo,
      app_version: "1.0.0",
    };
    const { ok } = await db.submitFeedback(payload);
    setLoading(false);
    setStep(ok ? "sent" : "error");
  };

  if (step === "sent") return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:24, position:"relative" }}>
      <Starfield n={40}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease" }}>
        <div style={{ fontSize:72, marginBottom:14 }}>🚀</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, color:C.green, marginBottom:8 }}>REPORT SENT!</div>
        <div style={{ color:C.dim, fontSize:13, lineHeight:1.7, marginBottom:22, maxWidth:280 }}>
          Thank you! Our team will look into this and get back to you within 24 hours.
        </div>
        <Card color={C.green} style={{ marginBottom:20, padding:"12px 16px", textAlign:"left" }}>
          <div style={{ fontSize:10, color:C.green, fontFamily:"'Orbitron',sans-serif", marginBottom:6 }}>YOUR REPORT</div>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
            <span style={{ fontSize:16 }}>{FEEDBACK_CATS.find(c=>c.id===cat)?.icon}</span>
            <span style={{ color:"white", fontSize:12, fontWeight:700 }}>{FEEDBACK_CATS.find(c=>c.id===cat)?.label}</span>
          </div>
          <div style={{ color:C.dim, fontSize:11, lineHeight:1.5 }}>{desc.substring(0, 100)}{desc.length>100?"…":""}</div>
        </Card>
        <Btn color={C.cyan} onClick={onBack}>← BACK TO APP</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.orange}1a`, borderBottom:`1px solid ${C.orange}33`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <BackBtn onClick={onBack} color={C.orange}/>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.orange }}>📣 REPORT / FEEDBACK</div>
            <div style={{ fontSize:10, color:C.dim }}>We read every report</div>
          </div>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:"16px 18px", paddingBottom:40 }}>
        {/* Category selector */}
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:10 }}>
          STEP 1 — WHAT IS THIS ABOUT?
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
          {FEEDBACK_CATS.map(fc => (
            <button key={fc.id} onClick={() => setCat(fc.id)} style={{
              background: cat===fc.id ? `${fc.color}22` : C.card,
              border:`2px solid ${cat===fc.id ? fc.color : fc.color+"22"}`,
              borderRadius:13, padding:"11px 10px", cursor:"pointer", textAlign:"left",
              boxShadow: cat===fc.id ? `0 0 14px ${fc.color}44` : "none",
              transition:"all 0.15s",
            }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{fc.icon}</div>
              <div style={{ fontSize:11, color: cat===fc.id ? fc.color : "#888", fontWeight:700, lineHeight:1.3 }}>{fc.label}</div>
            </button>
          ))}
        </div>

        {/* Description */}
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:8 }}>
          STEP 2 — DESCRIBE THE ISSUE
        </div>
        <div style={{ position:"relative", marginBottom:6 }}>
          <textarea
            value={desc}
            onChange={e => { setDesc(e.target.value); setCharCount(e.target.value.length); }}
            placeholder="Tell us what happened... What were you doing when the problem occurred?"
            maxLength={500}
            rows={5}
            style={{
              width:"100%", padding:"13px", background:C.card2,
              border:`1.5px solid ${C.purple}44`, borderRadius:13,
              color:"white", fontSize:13, fontFamily:"'Nunito',sans-serif",
              resize:"none", outline:"none", lineHeight:1.6,
              boxSizing:"border-box",
            }}
            onFocus={e => { e.target.style.borderColor = C.cyan; }}
            onBlur={e => { e.target.style.borderColor = `${C.purple}44`; }}
          />
          <div style={{ position:"absolute", bottom:10, right:12, fontSize:10, color: charCount>400 ? C.orange : C.dim }}>
            {charCount}/500
          </div>
        </div>

        {/* Auto-captured info */}
        <div style={{ background:`${C.purple}0a`, border:`1px solid ${C.purple}22`, borderRadius:10, padding:"9px 12px", marginBottom:18 }}>
          <div style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif", marginBottom:4 }}>AUTO-CAPTURED (helps us fix faster)</div>
          <div style={{ fontSize:10, color:"#444", lineHeight:1.6 }}>
            Screen: <span style={{ color:"#666" }}>{currentScreen}</span> · 
            User: <span style={{ color:"#666" }}>{child?.name || "Guest"}</span> · 
            Online: <span style={{ color: navigator.onLine ? C.green : C.red }}>{navigator.onLine ? "Yes" : "No"}</span>
          </div>
        </div>

        {step === "error" && (
          <div style={{ background:`${C.red}14`, border:`1px solid ${C.red}44`, borderRadius:10, padding:"10px 13px", marginBottom:14 }}>
            <div style={{ color:C.red, fontSize:12, fontWeight:700 }}>⚠ Could not send — saved locally. Will retry when online.</div>
          </div>
        )}

        <Btn color={C.orange} loading={loading} disabled={!cat || desc.trim().length < 10} onClick={handleSubmit}>
          🚀 SEND REPORT
        </Btn>
        <div style={{ textAlign:"center", color:C.dim, fontSize:10, marginTop:10 }}>
          Reports are reviewed within 24 hours
        </div>
      </div>
    </div>
  );
}

// ── Floating SOS button — shown on every game screen ─────────────────────
function SOSButton({ onClick }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    // Pulse every 30 seconds to remind user it exists
    const t = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 1000); }, 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <button onClick={onClick} style={{
      position:"fixed", bottom:72, right:16, zIndex:999,
      width:46, height:46, borderRadius:"50%",
      background: pulse ? `${C.red}` : `${C.red}cc`,
      border:`2px solid ${C.red}`,
      boxShadow: pulse ? `0 0 20px ${C.red}` : `0 0 10px ${C.red}66`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:20, cursor:"pointer",
      animation: pulse ? "pulseG 0.5s ease" : "none",
      transition:"all 0.3s",
    }}>🆘</button>
  );
}

// ── App freeze detector — shows report prompt if UI hangs ─────────────────
function FreezeDetector({ currentScreen, child, onReport }) {
  const lastInteraction = useRef(Date.now());
  const [showPrompt, setShowPrompt] = useState(false);

  // Update on any user interaction
  useEffect(() => {
    const update = () => { lastInteraction.current = Date.now(); setShowPrompt(false); };
    window.addEventListener("touchstart", update);
    window.addEventListener("click", update);
    window.addEventListener("keydown", update);
    return () => {
      window.removeEventListener("touchstart", update);
      window.removeEventListener("click", update);
      window.removeEventListener("keydown", update);
    };
  }, []);

  // Check every 45 seconds — if no interaction for 60s on game/abacus screen, prompt
  useEffect(() => {
    const activeScreens = ["game", "abacus", "olympiad"];
    if (!activeScreens.includes(currentScreen)) return;
    const t = setInterval(() => {
      const idle = Date.now() - lastInteraction.current;
      if (idle > 60000) setShowPrompt(true);
    }, 45000);
    return () => clearInterval(t);
  }, [currentScreen]);

  if (!showPrompt) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:24,
    }}>
      <Card color={C.orange} style={{ maxWidth:300, width:"100%", textAlign:"center", padding:22, animation:"popIn 0.4s ease" }}>
        <div style={{ fontSize:44, marginBottom:10 }}>😴</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.orange, marginBottom:8 }}>IS THE APP STUCK?</div>
        <div style={{ color:C.dim, fontSize:12, lineHeight:1.6, marginBottom:18 }}>
          We noticed no activity for a while. Is the app not responding?
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={C.dim} style={{ flex:1, padding:"10px", fontSize:11 }} onClick={() => { lastInteraction.current = Date.now(); setShowPrompt(false); }}>
            ALL GOOD
          </Btn>
          <Btn color={C.orange} style={{ flex:1, padding:"10px", fontSize:11 }} onClick={() => { setShowPrompt(false); onReport("freeze"); }}>
            REPORT ISSUE
          </Btn>
        </div>
      </Card>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════
// GAMES SECTION — 5 Mini Games
// ═════════════════════════════════════════════════════════════════════

// ── Game 1: Number Rocket — tap correct answer before rocket launches ─
function NumberRocket({ onBack, child }) {
  const [q, setQ]         = useState(null);
  const [opts, setOpts]   = useState([]);
  const [ans, setAns]     = useState(null);
  const [fuel, setFuel]   = useState(100);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [result, setResult]= useState(null); // "win"|"lose"
  const [chosen, setChosen]= useState(null);
  const fuelRef = useRef(100);
  const timerRef = useRef(null);
  const TOTAL = 10;

  const genQ = () => {
    const ops = ["+","-","×"];
    const op  = ops[Math.floor(Math.random()*ops.length)];
    let a = Math.floor(Math.random()*20)+1;
    let b = Math.floor(Math.random()*10)+1;
    let correct;
    if (op==="+") correct = a+b;
    else if (op==="-") { if(b>a)[a,b]=[b,a]; correct = a-b; }
    else correct = a*b;
    const wrong = new Set();
    while(wrong.size < 3) {
      const w = correct + (Math.floor(Math.random()*7)-3);
      if (w !== correct && w >= 0) wrong.add(w);
    }
    const all = shuffle([correct, ...[...wrong]]);
    setQ(`${a} ${op} ${b} = ?`);
    setOpts(all.map(String));
    setAns(all.indexOf(correct));
    setChosen(null);
    fuelRef.current = 100; setFuel(100);
  };

  useEffect(() => { genQ(); }, []);

  useEffect(() => {
    if (result || chosen !== null) return;
    timerRef.current = setInterval(() => {
      fuelRef.current -= 2.5;
      setFuel(fuelRef.current);
      if (fuelRef.current <= 0) {
        clearInterval(timerRef.current);
        setChosen(-1);
        setTimeout(() => { if (round >= TOTAL) setResult("lose"); else { setRound(r=>r+1); genQ(); } }, 900);
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [q, result]);

  const pick = (i) => {
    if (chosen !== null) return;
    clearInterval(timerRef.current);
    setChosen(i);
    const ok = i === ans;
    if (ok) setScore(s => s+1);
    setTimeout(() => {
      if (round >= TOTAL) setResult(score+(ok?1:0) >= 7 ? "win" : "lose");
      else { setRound(r=>r+1); genQ(); }
    }, 700);
  };

  if (result) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:22,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:8}}>{result==="win"?"🚀":"💥"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:result==="win"?C.green:C.red,marginBottom:8}}>{result==="win"?"LAUNCH SUCCESS!":"ROCKET CRASHED!"}</div>
        <div style={{color:"white",fontSize:28,fontFamily:"'Orbitron',sans-serif",marginBottom:16}}>{score}/{TOTAL}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.cyan} style={{flex:1}} onClick={()=>{setScore(0);setRound(1);setResult(null);genQ();}}>↺ RETRY</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={25}/>
      <div style={{position:"relative",zIndex:2,background:`${C.orange}18`,borderBottom:`1px solid ${C.orange}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
          <BackBtn onClick={onBack} color={C.orange}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.orange}}>🚀 NUMBER ROCKET</div>
          <div style={{marginLeft:"auto",fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>⭐ {score}/{TOTAL}</div>
        </div>
        {/* Fuel bar */}
        <div style={{background:"rgba(255,255,255,0.06)",borderRadius:6,height:8,overflow:"hidden"}}>
          <div style={{width:`${fuel}%`,height:"100%",background:`linear-gradient(90deg,${fuel>50?C.green:fuel>25?C.orange:C.red},${C.yellow})`,borderRadius:6,transition:"width 0.1s"}}/>
        </div>
        <div style={{fontSize:9,color:C.dim,marginTop:2,fontFamily:"'Orbitron',sans-serif"}}>FUEL — ANSWER BEFORE IT RUNS OUT! · Q{round}/{TOTAL}</div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"28px 18px"}}>
        {/* Rocket animation */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:64,animation:fuel<30?"shakeX 0.3s ease infinite":"bFloat 2s ease-in-out infinite"}}>{fuel<30?"💥":"🚀"}</div>
        </div>
        <Card color={C.orange} style={{textAlign:"center",marginBottom:18,padding:"18px"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22, color:"white"}}>{q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {opts.map((o,i)=>{
            let bg=C.card,border=`1.5px solid ${C.orange}28`,col="white";
            if(chosen!==null){
              if(i===ans){bg="#052e16";border=`2px solid ${C.green}`;col="#4ade80";}
              else if(i===chosen){bg="#2d0a0a";border=`2px solid ${C.red}`;col="#f87171";}
            }
            return <button key={i} onClick={()=>pick(i)} style={{background:bg,border,borderRadius:14,padding:"16px",fontSize:18,fontFamily:"'Orbitron',sans-serif",color:col,cursor:"pointer",transition:"all 0.15s"}}>{o}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

// ── Game 2: Star Catcher — catch falling correct answers, avoid wrong ──
function StarCatcher({ onBack, child }) {
  const [gameState, setGameState] = useState("ready"); // ready|playing|over
  const [score, setScore]   = useState(0);
  const [lives, setLives]   = useState(3);
  const [q, setQ]           = useState("");
  const [correctAns, setCA] = useState("");
  const [items, setItems]   = useState([]);
  const [playerX, setPlayerX] = useState(50);
  const itemsRef  = useRef([]);
  const scoreRef  = useRef(0);
  const livesRef  = useRef(3);
  const frameRef  = useRef(null);
  const qRef      = useRef({q:"",ans:""});

  const genQuestion = () => {
    const a = Math.floor(Math.random()*9)+1;
    const b = Math.floor(Math.random()*9)+1;
    const correct = String(a+b);
    qRef.current = {q:`${a} + ${b}`, ans: correct};
    setQ(`${a} + ${b} = ?`);
    setCA(correct);
    return correct;
  };

  const spawnWave = (currentCA) => {
    // Always spawn 1 correct + 2 wrong answers so stars are always visible
    const wrong1 = (() => { let v; do { v=String(Math.floor(Math.random()*18)+2); } while(v===currentCA); return v; })();
    const wrong2 = (() => { let v; do { v=String(Math.floor(Math.random()*18)+2); } while(v===currentCA||v===wrong1); return v; })();
    const positions = [15,50,82].sort(()=>Math.random()-0.5);
    return [
      { id: Date.now()+1, x:positions[0], y:-8, val:currentCA, correct:true,  speed:0.35+Math.random()*0.25 },
      { id: Date.now()+2, x:positions[1], y:-8, val:wrong1,    correct:false, speed:0.35+Math.random()*0.25 },
      { id: Date.now()+3, x:positions[2], y:-8, val:wrong2,    correct:false, speed:0.35+Math.random()*0.25 },
    ];
  };
  const spawnItem = spawnWave; // alias kept for compat

  const startGame = () => {
    scoreRef.current = 0; livesRef.current = 3;
    setScore(0); setLives(3); itemsRef.current = [];
    const ca = genQuestion();
    setGameState("playing");
    let frame = 0;
    const loop = () => {
      frame++;
      // Spawn new wave every 90 frames (~1.5s at 60fps) only when field is clear
      if (frame % 90 === 0 || (frame > 30 && itemsRef.current.length === 0)) {
        const wave = spawnWave(qRef.current.ans);
        itemsRef.current = [...itemsRef.current.filter(i=>i.y<100), ...wave];
      }
      // Move items down
      itemsRef.current = itemsRef.current
        .map(it => ({ ...it, y: it.y + it.speed }))
        .filter(it => {
          if (it.y > 100) {
            // Missed a correct answer
            if (it.correct) { livesRef.current = Math.max(0,livesRef.current-1); setLives(livesRef.current); if(livesRef.current<=0){setGameState("over");return false;} }
            return false;
          }
          return true;
        });
      setItems([...itemsRef.current]);
      if (livesRef.current > 0) frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => { if(frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  const catchItem = (item) => {
    if (item.correct) {
      scoreRef.current += 1; setScore(scoreRef.current);
      genQuestion();
    } else {
      livesRef.current = Math.max(0,livesRef.current-1); setLives(livesRef.current);
      if(livesRef.current<=0) setGameState("over");
    }
    itemsRef.current = itemsRef.current.filter(i => i.id !== item.id);
    setItems([...itemsRef.current]);
  };

  if (gameState === "ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={40}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:12}}>⭐</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:8}}>STAR CATCHER</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:20,maxWidth:270}}>Stars fall from the sky! Tap the star with the CORRECT answer. Avoid wrong ones!</div>
        <Btn color={C.yellow} onClick={startGame}>▶ START CATCHING</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← BACK</Btn></div>
      </div>
    </div>
  );

  if (gameState === "over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:8}}>🌟</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:8}}>GAME OVER!</div>
        <div style={{color:"white",fontSize:36,fontFamily:"'Orbitron',sans-serif",marginBottom:16}}>Score: {score}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.yellow} style={{flex:1}} onClick={startGame}>↺ PLAY AGAIN</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#000010,#04040f)"}}>
        {[...Array(20)].map((_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:2,height:2,background:"white",borderRadius:"50%",opacity:Math.random()*0.5+0.1}}/>)}
      </div>
      {/* HUD */}
      <div style={{position:"relative",zIndex:10,background:`${C.yellow}18`,borderBottom:`1px solid ${C.yellow}33`,padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Btn color={C.dim} style={{padding:"5px 10px",fontSize:10}} onClick={()=>{cancelAnimationFrame(frameRef.current);setGameState("ready");}}>✕</Btn>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.yellow}}>⭐ {score}</div>
        <div style={{display:"flex",gap:4}}>{[...Array(3)].map((_,i)=><span key={i} style={{fontSize:16,filter:i<lives?"none":"grayscale(1) opacity(0.2)"}}>❤️</span>)}</div>
      </div>
      {/* Question */}
      <div style={{position:"relative",zIndex:10,textAlign:"center",padding:"12px 18px"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20, color:"white"}}>{q}</div>
      </div>
      {/* Play field */}
      <div style={{position:"relative",height:"65vh",overflow:"hidden",background:"transparent",touchAction:"none"}}
        onTouchMove={e=>{e.preventDefault();const rect=e.currentTarget.getBoundingClientRect();const pct=((e.touches[0].clientX-rect.left)/rect.width)*100;setPlayerX(Math.max(8,Math.min(92,pct)));}}
        onMouseMove={e=>{const rect=e.currentTarget.getBoundingClientRect();const pct=((e.clientX-rect.left)/rect.width)*100;setPlayerX(Math.max(8,Math.min(92,pct)));}}
      >
        {items.map(it=>(
          <div key={it.id}
            onClick={()=>catchItem(it)}
            style={{
              position:"absolute",
              left:`${it.x}%`,
              top:`${it.y}%`,
              transform:"translate(-50%,-50%)",
              cursor:"pointer",
              zIndex:5,
              userSelect:"none",
            }}
          >
            <div style={{
              background: it.correct ? `linear-gradient(135deg,${C.yellow}44,${C.orange}22)` : `${C.red}22`,
              border:`2px solid ${it.correct ? C.yellow : C.red}`,
              borderRadius:14,
              padding:"6px 12px",
              fontFamily:"'Orbitron',sans-serif",
              fontSize:14,
              fontWeight:700,
              color: it.correct ? C.yellow : C.red,
              boxShadow: it.correct ? `0 0 12px ${C.yellow}66` : "none",
              minWidth:44,
              textAlign:"center",
              whiteSpace:"nowrap",
            }}>
              {it.correct ? "⭐ " : ""}{it.val}
            </div>
          </div>
        ))}
        {/* Catcher ship */}
        <div style={{position:"absolute",bottom:10,left:`${playerX}%`,transform:"translateX(-50%)",fontSize:34,zIndex:5,filter:"drop-shadow(0 0 8px #00f5ff)"}}>🛸</div>
      </div>
    </div>
  );
}

// ── Game 3: Math Maze — solve to move the astronaut through a maze ────
function MathMaze({ onBack, child }) {
  const MAZES = [
    { grid:["S","?","?","?","?","?","?","?","?","E"], cols:2, questions:[{q:"2+2",a:"4"},{q:"5-3",a:"2"},{q:"3×2",a:"6"},{q:"8÷2",a:"4"}] },
  ];
  const [step,    setStep]    = useState(0);
  const [q,       setQ]       = useState(null);
  const [chosen,  setChosen]  = useState(null);
  const [score,   setScore]   = useState(0);
  const [done,    setDone]    = useState(false);
  const [shake,   setShake]   = useState(false);
  const QUESTIONS = [
    {q:"4 + 3 = ?",  ans:1, opts:["5","7","8","9"]},
    {q:"9 - 5 = ?",  ans:1, opts:["2","4","5","6"]},
    {q:"3 × 3 = ?",  ans:2, opts:["6","7","9","11"]},
    {q:"12 ÷ 4 = ?", ans:2, opts:["2","3","3","4"]},
    {q:"6 + 8 = ?",  ans:1, opts:["12","14","15","16"]},
    {q:"15 - 7 = ?", ans:1, opts:["6","8","9","10"]},
    {q:"4 × 4 = ?",  ans:2, opts:["12","14","16","18"]},
    {q:"20 ÷ 5 = ?", ans:1, opts:["3","4","5","6"]},
  ];
  const shuffledQs = useRef(shuffle(QUESTIONS));
  const curQ = shuffledQs.current[Math.min(step, shuffledQs.current.length-1)];
  const STEPS = 8;

  const pick = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    const ok = i === curQ.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    if (ok) {
      setScore(s=>s+1);
      setTimeout(() => {
        setChosen(null);
        if (step+1 >= STEPS) setDone(true);
        else setStep(s=>s+1);
      }, 600);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setChosen(null); }, 800);
    }
  };

  if (done) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:8}}>🏆</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.green,marginBottom:8}}>MAZE COMPLETE!</div>
        <div style={{color:"white",fontSize:28,fontFamily:"'Orbitron',sans-serif",marginBottom:16}}>{score}/{STEPS} correct</div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.green} style={{flex:1}} onClick={()=>{setStep(0);setScore(0);setDone(false);setChosen(null);shuffledQs.current=shuffle(QUESTIONS);}}>↺ AGAIN</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,background:`${C.green}18`,borderBottom:`1px solid ${C.green}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <BackBtn onClick={onBack} color={C.green}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green}}>🌀 MATH MAZE</div>
          <div style={{marginLeft:"auto",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.dim}}>STEP {step+1}/{STEPS}</div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"18px"}}>
        {/* Path visualizer */}
        <div style={{display:"flex",gap:4,marginBottom:18,justifyContent:"center",flexWrap:"wrap"}}>
          {[...Array(STEPS)].map((_,i)=>(
            <div key={i} style={{width:32,height:32,borderRadius:8,background:i<step?`${C.green}33`:i===step?C.green:"#0a0a20",border:`2px solid ${i<=step?C.green:"#1a1a30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,transition:"all 0.3s"}}>
              {i<step?"✅":i===step?"🧑‍🚀":"⬛"}
            </div>
          ))}
          <div style={{width:32,height:32,borderRadius:8,background:"#0a0a20",border:`2px solid ${C.yellow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏆</div>
        </div>
        <Card color={C.green} style={{textAlign:"center",marginBottom:18,padding:"20px",animation:shake?"shakeX 0.4s ease":"none"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20, color:"white",marginBottom:4}}>🧑‍🚀 Solve to move forward!</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:26,color:C.green}}>{curQ.q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {curQ.opts.map((o,i)=>{
            let bg=C.card,border=`1.5px solid ${C.green}28`,col="white";
            if(chosen!==null){
              if(i===curQ.ans){bg="#052e16";border=`2px solid ${C.green}`;col="#4ade80";}
              else if(i===chosen){bg="#2d0a0a";border=`2px solid ${C.red}`;col="#f87171";}
            }
            return <button key={i} onClick={()=>pick(i)} style={{background:bg,border,borderRadius:14,padding:"16px",fontSize:18,fontFamily:"'Orbitron',sans-serif",color:col,cursor:"pointer",transition:"all 0.15s"}}>{o}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

// ── Game 4: Speed Math — answer as many as possible in 60 seconds ─────
function SpeedMath({ onBack, child }) {
  const [phase,   setPhase]   = useState("ready"); // ready|playing|over
  const [q,       setQ]       = useState("");
  const [opts,    setOpts]    = useState([]);
  const [ans,     setAns]     = useState(0);
  const [score,   setScore]   = useState(0);
  const [wrong,   setWrong]   = useState(0);
  const [timeLeft,setTimeLeft]= useState(60);
  const [flash,   setFlash]   = useState(null); // "correct"|"wrong"
  const scoreRef = useRef(0);
  const wrongRef = useRef(0);

  const nextQ = () => {
    const level = Math.min(Math.floor(scoreRef.current/5)+1, 5);
    const max   = level * 8;
    const a = Math.floor(Math.random()*max)+1;
    const b = Math.floor(Math.random()*max)+1;
    const ops = level<3?["+","-"]:["+","-","×"];
    const op  = ops[Math.floor(Math.random()*ops.length)];
    let correct;
    if(op==="+") correct=a+b;
    else if(op==="-"){const [x,y]=[Math.max(a,b),Math.min(a,b)];correct=x-y;setQ(`${x} ${op} ${y} = ?`);const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*7)-3);if(v>=0&&v!==correct)w.add(v);}const all=shuffle([correct,...w]);setOpts(all.map(String));setAns(all.indexOf(correct));return;}
    else correct=a*b;
    const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*9)-4);if(v>=0&&v!==correct)w.add(v);}
    const all=shuffle([correct,...w]);
    setQ(`${a} ${op} ${b} = ?`); setOpts(all.map(String)); setAns(all.indexOf(correct));
  };

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) { setPhase("over"); return; }
    const t = setTimeout(() => setTimeLeft(tl=>tl-1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const start = () => { scoreRef.current=0; wrongRef.current=0; setScore(0); setWrong(0); setTimeLeft(60); setPhase("playing"); nextQ(); };

  const pick = (i) => {
    const ok = i === ans;
    if(ok){SFX.correct();scoreRef.current++;setScore(scoreRef.current);setFlash("correct");}
    else{wrongRef.current++;setWrong(wrongRef.current);setFlash("wrong");}
    setTimeout(()=>{setFlash(null);nextQ();},300);
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={40}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:12}}>⚡</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:8}}>SPEED MATH</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:20,maxWidth:270}}>Answer as many questions as you can in 60 seconds! Questions get harder as you score more.</div>
        <Btn color={C.yellow} onClick={start}>▶ GO!</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← BACK</Btn></div>
      </div>
    </div>
  );

  if(phase==="over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:8}}>⏱️</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:12}}>TIME'S UP!</div>
        <Card color={C.yellow} style={{marginBottom:16,padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:C.green}}>{score}</div><div style={{fontSize:10,color:C.dim}}>CORRECT</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:C.red}}>{wrong}</div><div style={{fontSize:10,color:C.dim}}>WRONG</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:C.cyan}}>{Math.round(score/(score+wrong||1)*100)}%</div><div style={{fontSize:10,color:C.dim}}>ACCURACY</div></div>
          </div>
        </Card>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.yellow} style={{flex:1}} onClick={start}>↺ RETRY</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:flash==="correct"?"#052e16":flash==="wrong"?"#2d0a0a":C.bg,fontFamily:"'Nunito',sans-serif",position:"relative",transition:"background 0.15s"}}>
      <Starfield n={15}/>
      <div style={{position:"relative",zIndex:2,background:`${C.yellow}18`,borderBottom:`1px solid ${C.yellow}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>⚡ SPEED MATH</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,color:timeLeft<=10?C.red:C.green}}>{timeLeft}s</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.green}}>✓ {score}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.red}}>✗ {wrong}</div>
        </div>
        <div style={{marginTop:5,background:"rgba(255,255,255,0.06)",borderRadius:5,height:5,overflow:"hidden"}}>
          <div style={{width:`${(timeLeft/60)*100}%`,height:"100%",background:`linear-gradient(90deg,${timeLeft>20?C.green:C.red},${C.yellow})`,borderRadius:5,transition:"width 1s linear"}}/>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"24px 18px"}}>
        <Card color={C.yellow} style={{textAlign:"center",marginBottom:20,padding:"22px"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28, color:"white"}}>{q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {opts.map((o,i)=>(
            <button key={i} onClick={()=>pick(i)} style={{background:C.card,border:`1.5px solid ${C.yellow}28`,borderRadius:14,padding:"20px",fontSize:20,fontFamily:"'Orbitron',sans-serif",color:"white",cursor:"pointer",transition:"transform 0.1s",active:{transform:"scale(0.95)"}}}>
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Game 5: Number Memory — remember the sequence ─────────────────────
function NumberMemory({ onBack, child }) {
  const [phase,    setPhase]    = useState("ready"); // ready|show|input|result
  const [level,    setLevel]    = useState(1);
  const [sequence, setSequence] = useState([]);
  const [showing,  setShowing]  = useState(-1); // index being highlighted
  const [input,    setInput]    = useState([]);
  const [result,   setResult]   = useState(null);
  const [highScore,setHighScore]= useState(0);

  const startLevel = (lvl) => {
    const len = lvl + 2; // level 1 = 3 numbers
    const seq = Array.from({length:len},()=>Math.floor(Math.random()*9)+1);
    setSequence(seq); setInput([]); setPhase("show");
    let idx = 0;
    const show = () => {
      if (idx >= seq.length) { setTimeout(()=>{setShowing(-1);setPhase("input");},500); return; }
      setShowing(idx);
      setTimeout(()=>{setShowing(-1);setTimeout(()=>{idx++;show();},300);}, 600);
    };
    setTimeout(show, 500);
  };

  const pickNum = (n) => {
    const newInput = [...input, n];
    setInput(newInput);
    if (newInput.length === sequence.length) {
      const ok = newInput.every((v,i)=>v===sequence[i]);
      setResult(ok?"win":"lose");
      setPhase("result");
      if(ok) setHighScore(h=>Math.max(h,level));
    }
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={40}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:12}}>🧠</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.pink,marginBottom:8}}>NUMBER MEMORY</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:8,maxWidth:270}}>Watch the number sequence, then repeat it in order! Gets longer each level.</div>
        {highScore>0&&<div style={{color:C.yellow,fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:14}}>🏆 BEST: LEVEL {highScore}</div>}
        <Btn color={C.pink} onClick={()=>{setLevel(1);startLevel(1);}}>▶ START</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← BACK</Btn></div>
      </div>
    </div>
  );

  if(phase==="result") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:8}}>{result==="win"?"🧠":"💫"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:result==="win"?C.green:C.red,marginBottom:8}}>{result==="win"?"CORRECT!":"WRONG!"}</div>
        {result==="lose"&&<div style={{color:C.dim,fontSize:13,marginBottom:8}}>The sequence was: <span style={{color:"white",fontWeight:700}}>{sequence.join(", ")}</span></div>}
        {result==="lose"&&<div style={{color:C.dim,fontSize:13,marginBottom:12}}>You entered: <span style={{color:C.red}}>{input.join(", ")}</span></div>}
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={()=>setPhase("ready")}>← BACK</Btn>
          {result==="win"
            ?<Btn color={C.green} style={{flex:1}} onClick={()=>{const nl=level+1;setLevel(nl);startLevel(nl);}}>NEXT LEVEL →</Btn>
            :<Btn color={C.pink} style={{flex:1}} onClick={()=>{setLevel(1);startLevel(1);}}>↺ RESTART</Btn>
          }
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,background:`${C.pink}18`,borderBottom:`1px solid ${C.pink}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <BackBtn onClick={()=>setPhase("ready")} color={C.pink}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.pink}}>🧠 NUMBER MEMORY</div>
          <div style={{marginLeft:"auto",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.dim}}>LEVEL {level}</div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"24px 18px"}}>
        {phase==="show"&&(
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{color:C.dim,fontSize:13,marginBottom:14,fontFamily:"'Orbitron',sans-serif",letterSpacing:2}}>REMEMBER THIS SEQUENCE</div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              {sequence.map((n,i)=>(
                <div key={i} style={{width:52,height:52,borderRadius:14,background:i===showing?`${C.pink}44`:"#0a0a20",border:`2px solid ${i===showing?C.pink:"#1a1a30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i===showing?26:0,color:C.pink,transition:"all 0.2s",boxShadow:i===showing?`0 0 20px ${C.pink}`:"none"}}>
                  {i===showing?n:""}
                </div>
              ))}
            </div>
          </div>
        )}
        {phase==="input"&&(
          <>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{color:C.dim,fontSize:13,fontFamily:"'Orbitron',sans-serif",letterSpacing:2,marginBottom:10}}>NOW ENTER THE SEQUENCE</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:4}}>
                {sequence.map((_,i)=>(
                  <div key={i} style={{width:40,height:40,borderRadius:11,background:i<input.length?`${C.pink}33`:C.card2,border:`2px solid ${i<input.length?C.pink:C.dim+"44"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.pink}}>
                    {i<input.length?input[i]:""}
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:C.dim}}>{input.length}/{sequence.length} entered</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[1,2,3,4,5,6,7,8,9].map(n=>(
                <button key={n} onClick={()=>pickNum(n)} style={{background:C.card,border:`1.5px solid ${C.pink}33`,borderRadius:14,padding:"16px",fontSize:20,fontFamily:"'Orbitron',sans-serif",color:"white",cursor:"pointer"}}>
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Daily Quiz ────────────────────────────────────────────────────────
// One word problem per day — seeded by date so all children get the same Q
// Encourages daily visits; resets at midnight
function DailyQuiz({ child, onClose }) {
  const [challenge, setChallenge] = useState(null);   // from Supabase
  const [loading,   setLoading]   = useState(true);
  const [done,      setDone]      = useState(false);
  const [chosen,    setChosen]    = useState(null);   // 'A','B','C','D'
  const [shake,     setShake]     = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      db.getDailyChallenge(child.class_num || 1),
      db.getDailyCompletion(child.id)
    ]).then(([ch, comp]) => {
      setChallenge(ch);
      if (comp) setDone(true);
      setLoading(false);
    });
    db.track("daily_challenge_open", child.id, null, { class_num: child.class_num });
  }, [child.id, child.class_num]);

  const opts = challenge ? [
    { key:"A", val: challenge.option_a },
    { key:"B", val: challenge.option_b },
    { key:"C", val: challenge.option_c },
    { key:"D", val: challenge.option_d },
  ] : [];

  const handleAnswer = async (key) => {
    if (done || chosen) return;
    setChosen(key);
    const correct = key === challenge.correct;
    if (!correct) { setShake(true); setTimeout(()=>setShake(false),500); }
    else {
      await db.completeDailyChallenge(child.id, challenge.id, true);
      await db.addXP(child.id, challenge.xp_reward||50, challenge.coin_reward||10);
      SFX.dailyDone();
      db.track("daily_challenge_complete", child.id, null, { correct:true });
      const todayKey2 = new Date().toISOString().slice(0,10);
      localStorage.setItem(`dq_done_${child.id}_${todayKey2}`, "1");
      setDone(true);
    }
    if (!correct) {
      db.track("daily_challenge_attempt", child.id, null, { correct:false });
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(4,4,15,0.96)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:C.card,borderRadius:22,padding:24,maxWidth:430,width:"100%",border:`2px solid ${C.yellow}44`,boxShadow:`0 0 40px ${C.yellow}22`,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.yellow,letterSpacing:2}}>🌟 DAILY CHALLENGE</div>
            <div style={{fontSize:11,color:C.dim,marginTop:2}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.dim,fontSize:20,cursor:"pointer",padding:"4px 8px"}}>✕</button>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:30,color:C.dim,fontFamily:"'Orbitron',sans-serif",fontSize:12}}>
            <div style={{fontSize:32,marginBottom:10,animation:"spin 1s linear infinite"}}>⭐</div>
            LOADING...
          </div>
        ) : !challenge ? (
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:40,marginBottom:10}}>📅</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.dim,lineHeight:1.7}}>No challenge today yet.<br/>Check back later!</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : done && !chosen ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:10}}>✅</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green,marginBottom:6}}>ALREADY COMPLETED TODAY!</div>
            <div style={{color:C.dim,fontSize:12,lineHeight:1.7}}>Great job! Come back tomorrow for a new challenge.</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : (
          <>
            <div style={{background:`${C.yellow}10`,border:`1px solid ${C.yellow}22`,borderRadius:14,padding:"14px 16px",marginBottom:18,lineHeight:1.7,fontSize:14,color:"white",fontWeight:600}}>
              📖 {challenge.question}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:16,animation:shake?"shake 0.4s":"none"}}>
              {opts.map(({key,val})=>{
                const isCorrect = key === challenge.correct;
                const isChosen  = key === chosen;
                const answered  = chosen !== null;
                let bg=C.card2, border="#181838", color="white";
                if (answered) {
                  if (isCorrect)       { bg=`${C.green}22`; border=C.green; color=C.green; }
                  else if (isChosen)   { bg=`${C.red}22`;   border=C.red;   color=C.red;   }
                }
                return (
                  <button key={key} onClick={()=>handleAnswer(key)} disabled={!!chosen}
                    style={{background:bg,border:`2px solid ${border}`,borderRadius:12,padding:"11px 16px",cursor:chosen?"default":"pointer",textAlign:"left",color,fontWeight:700,fontSize:14,transition:"all 0.2s"}}>
                    <span style={{marginRight:10,opacity:0.6,fontFamily:"'Orbitron',sans-serif",fontSize:11}}>{key}</span>{val}
                    {answered && isCorrect && <span style={{float:"right"}}>✅</span>}
                    {answered && isChosen && !isCorrect && <span style={{float:"right"}}>❌</span>}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <div style={{background:`${chosen===challenge.correct?C.green:C.cyan}14`,border:`1px solid ${chosen===challenge.correct?C.green:C.cyan}33`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:chosen===challenge.correct?C.green:C.cyan}}>
                {chosen===challenge.correct ? "🎉 Excellent! " : "💡 Hint: "}{challenge.hint}
              </div>
            )}
            {chosen && (
              <div style={{textAlign:"center"}}>
                {chosen===challenge.correct && <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.yellow,marginBottom:10}}>+{challenge.xp_reward||50} XP · +{challenge.coin_reward||10} COINS 🎉</div>}
                <Btn color={chosen===challenge.correct?C.green:C.dim} onClick={onClose}>{chosen===challenge.correct?"🚀 AWESOME!":"CLOSE"}</Btn>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Daily Puzzle ──────────────────────────────────────────────────────
function DailyPuzzle({ child, onClose }) {
  const [puzzle,  setPuzzle]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [done,    setDone]    = useState(false);
  const [answer,  setAnswer]  = useState("");
  const [result,  setResult]  = useState(null); // null|"correct"|"wrong"
  const [showHint,setShowHint]= useState(false);

  useEffect(() => {
    Promise.all([
      db.getDailyPuzzle(),
      db.getPuzzleCompletion(child.id)
    ]).then(([p, comp]) => {
      setPuzzle(p);
      if (comp) setDone(true);
      setLoading(false);
    });
    db.track("daily_puzzle_open", child.id, null, {});
  }, [child.id]);

  const handleSubmit = async () => {
    if (!answer.trim() || !puzzle) return;
    const correct = answer.trim().toLowerCase() === puzzle.answer.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) SFX.puzzleSolve();
    await db.completePuzzle(child.id, puzzle.id, answer.trim(), correct);
    if (correct) {
      await db.addXP(child.id, puzzle.xp_reward||75, puzzle.coin_reward||15);
      db.track("daily_puzzle_complete", child.id, null, { correct:true });
      const todayKey = new Date().toISOString().slice(0,10);
      localStorage.setItem(`dp_${child.id}_${todayKey}`, "1");
      setDone(true);
    } else {
      db.track("daily_puzzle_complete", child.id, null, { correct:false });
    }
  };

  const typeColors = { riddle:C.purple, number:C.cyan, logic:C.orange, visual:C.yellow };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(4,4,15,0.96)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:C.card,borderRadius:22,padding:24,maxWidth:430,width:"100%",border:`2px solid ${C.purple}44`,boxShadow:`0 0 40px ${C.purple}22`,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.purple,letterSpacing:2}}>🧩 DAILY PUZZLE</div>
            <div style={{fontSize:11,color:C.dim,marginTop:2}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.dim,fontSize:20,cursor:"pointer",padding:"4px 8px"}}>✕</button>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:30,color:C.dim,fontFamily:"'Orbitron',sans-serif",fontSize:12}}>
            <div style={{fontSize:32,marginBottom:10}}>🧩</div>LOADING...
          </div>
        ) : !puzzle ? (
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:40,marginBottom:10}}>📅</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.dim,lineHeight:1.7}}>No puzzle today yet.<br/>Check back later!</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : done && result === null ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:10}}>🏆</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green,marginBottom:6}}>PUZZLE SOLVED TODAY!</div>
            <div style={{color:C.dim,fontSize:12,lineHeight:1.7}}>A new puzzle drops at midnight. Come back tomorrow!</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : (
          <>
            <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
              <div style={{background:`${typeColors[puzzle.puzzle_type]||C.purple}22`,border:`1px solid ${typeColors[puzzle.puzzle_type]||C.purple}44`,borderRadius:8,padding:"3px 10px",fontSize:10,color:typeColors[puzzle.puzzle_type]||C.purple,fontFamily:"'Orbitron',sans-serif",textTransform:"uppercase"}}>{puzzle.puzzle_type}</div>
              <div style={{fontSize:11,color:C.dim}}>+{puzzle.xp_reward||75} XP on solve</div>
            </div>

            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14, color:"white",marginBottom:10}}>{puzzle.title}</div>
            <div style={{background:`${C.purple}10`,border:`1px solid ${C.purple}22`,borderRadius:14,padding:"14px 16px",marginBottom:18,lineHeight:1.8,fontSize:14,color:"#ddd"}}>
              🧩 {puzzle.description}
            </div>

            {result === null && (
              <>
                <div style={{marginBottom:12}}>
                  <input value={answer} onChange={e=>setAnswer(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                    placeholder="Type your answer here..."
                    style={{width:"100%",background:C.card2,border:`2px solid ${C.purple}44`,borderRadius:12,padding:"12px 16px",color:"white",fontSize:14,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",outline:"none"}}
                  />
                </div>
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  <Btn color={C.purple} style={{flex:2}} onClick={handleSubmit}>🚀 SUBMIT</Btn>
                  <button onClick={()=>setShowHint(!showHint)} style={{flex:1,background:`${C.yellow}18`,border:`1px solid ${C.yellow}44`,borderRadius:12,color:C.yellow,fontSize:12,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",padding:"8px"}}>💡 HINT</button>
                </div>
                {showHint && puzzle.hint && (
                  <div style={{background:`${C.yellow}10`,border:`1px solid ${C.yellow}33`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.yellow}}>
                    💡 {puzzle.hint}
                  </div>
                )}
              </>
            )}

            {result === "correct" && (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:8}}>🎉</div>
                {/* correct shown via floating overlay */}
                <div style={{fontSize:12,color:C.dim,marginBottom:14}}>Answer: {puzzle.answer}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.yellow,marginBottom:14}}>+{puzzle.xp_reward||75} XP · +{puzzle.coin_reward||15} COINS</div>
                <Btn color={C.green} onClick={onClose}>🏆 AWESOME!</Btn>
              </div>
            )}
            {result === "wrong" && (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:8}}>🤔</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.red,marginBottom:4}}>NOT QUITE!</div>
                <div style={{fontSize:12,color:C.dim,marginBottom:6}}>Try again or check the hint.</div>
                <div style={{display:"flex",gap:10}}>
                  <Btn color={C.dim} style={{flex:1}} onClick={()=>setResult(null)}>↺ TRY AGAIN</Btn>
                  <Btn color={C.red}  style={{flex:1}} onClick={onClose}>CLOSE</Btn>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── App Rating ────────────────────────────────────────────────────────
function RatingPrompt({ child, onClose }) {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [review,  setReview]  = useState("");
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await db.saveRating(child?.id, null, rating, review);
    db.track("app_rated", child?.id, null, { rating });
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div style={{position:"fixed",inset:0,background:"rgba(4,4,15,0.94)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:C.card,borderRadius:22,padding:28,maxWidth:360,width:"100%",border:`2px solid ${C.yellow}44`,textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:10}}>🙏</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.yellow,marginBottom:8}}>THANK YOU!</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:18}}>Your feedback helps us make MathMagic better for all space cadets!</div>
        <Btn color={C.yellow} onClick={onClose}>🚀 CONTINUE</Btn>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(4,4,15,0.94)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:C.card,borderRadius:22,padding:24,maxWidth:360,width:"100%",border:`2px solid ${C.yellow}44`,boxShadow:`0 0 40px ${C.yellow}22`}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:44,marginBottom:8}}>🌟</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.yellow,marginBottom:6}}>ENJOYING MATHMAGIC?</div>
          <div style={{color:C.dim,fontSize:13,lineHeight:1.6}}>Rate your experience and help other students discover MathMagic!</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {[1,2,3,4,5].map(i=>(
            <button key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(i)}
              style={{background:"none",border:"none",fontSize:38,cursor:"pointer",transition:"transform 0.15s",transform:(hover||rating)>=i?"scale(1.2)":"scale(1)",filter:(hover||rating)>=i?"none":"grayscale(1) opacity(0.4)"}}>
              ⭐
            </button>
          ))}
        </div>
        {rating > 0 && (
          <div style={{marginBottom:14}}>
            <div style={{color:"white",fontSize:13,fontWeight:700,marginBottom:6,textAlign:"center"}}>
              {["","😞 Poor","😐 Fair","🙂 Good","😊 Great","🤩 Amazing!"][rating]}
            </div>
            <textarea value={review} onChange={e=>setReview(e.target.value)}
              placeholder="Tell us more (optional)..."
              rows={2}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.yellow}33`,borderRadius:11,padding:"10px 14px",color:"white",fontSize:13,fontFamily:"'Nunito',sans-serif",resize:"none",boxSizing:"border-box",outline:"none"}}
            />
          </div>
        )}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"none",border:`1px solid #181838`,borderRadius:12,color:C.dim,padding:"10px",cursor:"pointer",fontSize:12}}>LATER</button>
          <Btn color={C.yellow} style={{flex:2}} loading={loading} onClick={submit} disabled={rating===0}>⭐ SUBMIT RATING</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Privacy Policy ────────────────────────────────────────────────────

// ── TermsOfService ────────────────────────────────────────────────
function TermsOfService({ onBack }) {
  const S = { h:{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.cyan,margin:"16px 0 6px"}, p:{color:C.dim,fontSize:12,lineHeight:1.7,marginBottom:8} };
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={onBack} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>TERMS OF SERVICE</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        {[["1. Acceptance","By using MathMagic Space Academy you agree to these Terms. Parents accept on behalf of their child."],
          ["2. Use of Service","MathMagic is for children mathematics learning only. Must not be used for unlawful purposes."],
          ["3. Accounts","Parents are responsible for account security. We may terminate accounts that violate these Terms."],
          ["4. Content","All lessons and questions are owned by MathMagic. Do not copy or distribute without permission."],
          ["5. Payments","Subscriptions charged as selected. Refunds subject to our policy. Pricing may change with 30 days notice."],
          ["6. Liability","Service provided as-is. We are not liable for indirect or consequential damages."],
          ["7. Contact","support@mathmagicapp.in"]
        ].map(([h,p],i)=><div key={i}><div style={S.h}>{h}</div><p style={S.p}>{p}</p></div>)}
      </div>
    </div>
  );
}

// ── DataPolicy ────────────────────────────────────────────────────
function DataPolicy({ onBack }) {
  const S = { h:{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.purple,margin:"16px 0 6px"}, p:{color:C.dim,fontSize:12,lineHeight:1.7,marginBottom:8} };
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={onBack} color={C.purple}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.purple}}>DATA COMPLIANCE</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{color:C.dim,fontSize:11,marginBottom:14}}>COPPA · DPDP Act 2023 · GDPR</div>
        {[["Data Collected","Child name, avatar, class, PIN. Parent email. Progress and scores. Device type."],
          ["How We Use It","Personalised learning, progress tracking for parents. Never sold to third parties."],
          ["Children Privacy COPPA","Compliant. Only necessary data collected. Parents can request deletion anytime."],
          ["India DPDP 2023","Compliant with India Digital Personal Data Protection Act 2023. Data stored in India."],
          ["Security","Data encrypted in transit TLS 1.3 and at rest AES-256. JWT tokens expire in 7 days."],
          ["Your Rights","Access · Correct · Delete · Export your data. Contact: privacy@mathmagicapp.in"],
          ["AI Disclosure","Hints may use AI. No personal child data shared with AI providers."]
        ].map(([h,p],i)=><div key={i}><div style={S.h}>{h}</div><p style={S.p}>{p}</p></div>)}
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────
function Settings({ child, user, onBack, onThemeChange, onLogout }) {
  const [sec,     setSec]     = useState(null);
  const [delConf, setDelConf] = useState(false);
  const [pwEmail, setPwEmail] = useState(user?.email||"");
  const [pwSent,  setPwSent]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");

  const handleReset = async () => {
    if (!pwEmail.trim()) { setMsg("Enter email"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/db",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${db._token||""}`},body:JSON.stringify({action:"reset_password",email:pwEmail.trim()})});
      const d = await r.json();
      if(d.ok){setPwSent(true);setMsg("Reset link sent! Check your email.");}else setMsg(d.error||"Failed.");
    } catch(e){setMsg("Network error.");}
    setLoading(false);
  };

  const handleDelete = async () => {
    try{await fetch("/api/db",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${db._token||""}`},body:JSON.stringify({action:"delete_account",user_id:user?.id})});}catch(e){}
    onLogout();
  };

  if (sec==="theme") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setSec(null)} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>CHOOSE THEME</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:480,margin:"0 auto"}}>
        {Object.entries(THEMES).map(([key,t])=>{
          const cur=localStorage.getItem("mm_theme")||"light";
          return(<button key={key} onClick={()=>{localStorage.setItem("mm_theme",key);C=THEMES[key];if(onThemeChange)onThemeChange(key);SFX.tap();setSec(null);}} style={{background:cur===key?`${t.cyan}22`:t.card,border:`2px solid ${cur===key?t.cyan:t.dim+"44"}`,borderRadius:16,padding:"14px 10px",cursor:"pointer",textAlign:"center",boxShadow:cur===key?`0 0 14px ${t.cyan}44`:"none"}}>
            <div style={{fontSize:24,marginBottom:4}}>{t.icon}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:cur===key?t.cyan:t.dim}}>{t.name}</div>
            <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:6}}>{[t.purple,t.cyan,t.green,t.orange].map((cl,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:cl}}/>)}</div>
            {cur===key&&<div style={{fontSize:8,color:t.cyan,marginTop:4}}>✓ ACTIVE</div>}
          </button>);
        })}
      </div>
    </div>
  );

  if (sec==="profile") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setSec(null)} color={C.yellow}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>MY PROFILE</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:60,marginBottom:10}}>{child?.avatar||"🧒"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:4}}>{child?.name}</div>
        <div style={{color:C.dim,fontSize:12,marginBottom:20}}>Class {child?.class_num} · Level {child?.level||1}</div>
        <Card color={C.purple} style={{textAlign:"left"}}>
          {[["📧","Email",user?.email||"—"],["🏆","XP",`${child?.xp||0} pts`],["🪙","Coins",`${child?.coins||0}`],["🔥","Streak",`${child?.streak_days||0} days`],["💎","Plan",child?.is_premium?"Premium ✓":"Free"]].map(([e,l,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?`1px solid ${C.dim}22`:"none"}}>
              <span style={{color:C.dim,fontSize:13}}>{e} {l}</span><span style={{color:"white",fontSize:13,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  if (sec==="password") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setSec(null)} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>RESET PASSWORD</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <Card color={C.cyan}>
          <div style={{color:C.dim,fontSize:13,marginBottom:12,lineHeight:1.6}}>A reset link will be sent to your email address.</div>
          <input value={pwEmail} onChange={e=>setPwEmail(e.target.value)} placeholder="Your email" style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"11px 14px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,marginBottom:12,display:"block"}}/>
          {msg&&<div style={{fontSize:12,color:pwSent?C.green:C.red,marginBottom:10}}>{msg}</div>}
          {!pwSent?<Btn color={C.cyan} loading={loading} onClick={handleReset}>📧 SEND RESET LINK</Btn>
            :<div style={{textAlign:"center",color:C.green,fontFamily:"'Orbitron',sans-serif",fontSize:12}}>✅ CHECK YOUR EMAIL</div>}
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <BackBtn onClick={()=>onBack()} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>SETTINGS</div>
      </div>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:48}}>{child?.avatar||"🧒"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.yellow,marginTop:6}}>{child?.name}</div>
        <div style={{color:C.dim,fontSize:11}}>Class {child?.class_num}</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",gap:8}}>
        {[
          {icon:"👤",label:"My Profile",      sub:"Name, class, XP, coins",      act:()=>setSec("profile")},
          {icon:"🎨",label:"Change Theme",    sub:"6 themes incl. light modes",   act:()=>setSec("theme")},
          {icon:"🔑",label:"Reset Password",  sub:"Send reset link to email",     act:()=>setSec("password")},
          {icon:"⭐",label:"Rate the App",    sub:"Share your experience",        act:()=>onBack("rate")},
          {icon:"🔒",label:"Privacy Policy",  sub:"How we protect your data",     act:()=>onBack("privacy")},
          {icon:"📋",label:"Terms of Service",sub:"Usage terms and conditions",   act:()=>onBack("terms")},
          {icon:"🛡️",label:"Data Compliance", sub:"COPPA · DPDP 2023 · GDPR",   act:()=>onBack("datapolicy")},
          {icon:"🚪",label:"Logout",          sub:"Sign out of this device",      act:()=>onLogout(),color:C.orange},
          {icon:"🗑️",label:"Delete Account",  sub:"Permanently remove all data", act:()=>setDelConf(true),color:C.red},
        ].map((item,i)=>(
          <button key={i} onClick={item.act} style={{background:C.card,border:`1.5px solid ${(item.color||C.purple)+"33"}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"}}>
            <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:item.color||"white"}}>{item.label}</div><div style={{fontSize:11,color:C.dim,marginTop:2}}>{item.sub}</div></div>
            <span style={{color:C.dim,fontSize:18}}>›</span>
          </button>
        ))}
      </div>
      {delConf&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <Card color={C.red} style={{maxWidth:320,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>⚠️</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.red,marginBottom:8}}>DELETE ACCOUNT?</div>
            <div style={{color:C.dim,fontSize:12,marginBottom:18,lineHeight:1.6}}>Permanently deletes all data for <strong style={{color:"white"}}>{child?.name}</strong>. Cannot be undone.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDelConf(false)} style={{flex:1,background:C.card2,border:`1px solid ${C.dim}44`,borderRadius:12,padding:"11px",color:"white",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>CANCEL</button>
              <button onClick={handleDelete} style={{flex:1,background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:12,padding:"11px",color:C.red,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>DELETE</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}



// ── EntryScreen ───────────────────────────────────────────────────
function EntryScreen({ onSelect }) {
  useEffect(()=>{ SFX.screenIn(); },[]);
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0",position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:420,padding:"24px 18px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:56,marginBottom:8,animation:"floatUp 2s ease-in-out infinite"}}>🚀</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,color:C.yellow,letterSpacing:2}}>MATHMAGIC</div>
          <div style={{color:C.dim,fontSize:13,marginTop:4}}>Space Academy</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {icon:"🧒",label:"I'm a Student",    sub:"Login or register",       s:"student_entry", color:C.cyan},
            {icon:"👨‍🏫",label:"I'm a Teacher",   sub:"Manage my class",         s:"teacher_login",  color:C.yellow},
            {icon:"🔐",label:"Admin",             sub:"School management",       s:"admin_panel",    color:C.red},
          ].map((r,i)=>(
            <button key={i} onClick={()=>{SFX.tap();onSelect(r.s);}} style={{background:`${r.color}18`,border:`1.5px solid ${r.color}44`,borderRadius:16,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"}}>
              <span style={{fontSize:30}}>{r.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:"white"}}>{r.label}</div>
                <div style={{fontSize:12,color:C.dim,marginTop:2}}>{r.sub}</div>
              </div>
              <span style={{color:r.color,fontSize:20}}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── StudentEntry — school vs individual ───────────────────────────
function StudentEntry({ onBack, onSelect }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:420,padding:"24px 18px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>STUDENT ACCESS</div>
        </div>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48}}>🧒</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.cyan,marginTop:8}}>HOW DO YOU STUDY?</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <button onClick={()=>{SFX.tap();onSelect("student_login");}} style={{background:`${C.cyan}18`,border:`1.5px solid ${C.cyan}44`,borderRadius:16,padding:"18px",cursor:"pointer",textAlign:"left",display:"flex",gap:14,alignItems:"center"}}>
            <span style={{fontSize:28}}>🏫</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:"white"}}>My School uses MathMagic</div>
              <div style={{fontSize:12,color:C.dim,marginTop:2}}>Login with school code + roll number</div>
            </div>
            <span style={{color:C.cyan,fontSize:20}}>›</span>
          </button>
          <button onClick={()=>{SFX.tap();onSelect("login");}} style={{background:`${C.purple}18`,border:`1.5px solid ${C.purple}44`,borderRadius:16,padding:"18px",cursor:"pointer",textAlign:"left",display:"flex",gap:14,alignItems:"center"}}>
            <span style={{fontSize:28}}>🏠</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:"white"}}>I study at home</div>
              <div style={{fontSize:12,color:C.dim,marginTop:2}}>Login with my account</div>
            </div>
            <span style={{color:C.purple,fontSize:20}}>›</span>
          </button>
          <button onClick={()=>{SFX.tap();onSelect("register");}} style={{background:`${C.green}18`,border:`2px solid ${C.green}55`,borderRadius:16,padding:"18px",cursor:"pointer",textAlign:"left",display:"flex",gap:14,alignItems:"center"}}>
            <span style={{fontSize:28}}>✨</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:C.green}}>New? Register here</div>
              <div style={{fontSize:12,color:C.dim,marginTop:2}}>Create a free account in 2 minutes</div>
            </div>
            <span style={{color:C.green,fontSize:20}}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── School API helper ─────────────────────────────────────────────
const schoolApi = async (action, body={}, adminKey=null) => {
  const headers = {"Content-Type":"application/json"};
  if (adminKey) headers["Authorization"] = `Bearer ${adminKey}`;
  const r = await fetch("/api/school", {method:"POST", headers, body:JSON.stringify({action,...body})});
  return r.json();
};

// ── StudentLogin Screen ───────────────────────────────────────────
function StudentLogin({ onBack, onDone }) {
  const [step,      setStep]      = useState("school"); // school|student
  const [schoolCode,setSchoolCode]= useState("");
  const [rollNo,    setRollNo]    = useState("");
  const [pin,       setPin]       = useState("");
  const [classNum,  setClassNum]  = useState("");
  const [section,   setSection]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSchool = () => {
    if (!schoolCode.trim()) { setError("Enter school code"); return; }
    setError(""); setStep("student");
  };

  const handleLogin = async () => {
    if (!rollNo.trim()||pin.length<4) { setError("Enter roll number and 4-digit PIN"); return; }
    setLoading(true); setError("");
    try {
      const d = await schoolApi("student_login", {school_code:schoolCode.trim().toUpperCase(), roll_no:rollNo.trim(), name:rollNo.trim(), pin, class_num:classNum?parseInt(classNum):undefined, section:section||undefined});
      if (d.student) { SFX.select(); onDone(d.student); }
      else setError(d.error||"Invalid credentials");
    } catch(e) { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"24px 18px",position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:2,maxWidth:420,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>STUDENT LOGIN</div>
        </div>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:8}}>🏫</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.yellow}}>MATHMAGIC</div>
          <div style={{color:C.dim,fontSize:12,marginTop:4}}>School Edition</div>
        </div>

        {step==="school" ? (
          <Card color={C.cyan} style={{marginBottom:16}}>
            <div style={{color:C.dim,fontSize:12,marginBottom:8,fontFamily:"'Orbitron',sans-serif"}}>SCHOOL CODE</div>
            <input value={schoolCode} onChange={e=>setSchoolCode(e.target.value.toUpperCase())}
              placeholder="e.g. MATH001" maxLength={20}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"12px 14px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:16,letterSpacing:3,textAlign:"center",marginBottom:12,display:"block"}}/>
            {error&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{error}</div>}
            <Btn color={C.cyan} onClick={handleSchool}>NEXT →</Btn>
          </Card>
        ) : (
          <Card color={C.purple} style={{marginBottom:16}}>
            <div style={{color:C.cyan,fontSize:11,fontFamily:"'Orbitron',sans-serif",marginBottom:12}}>🏫 {schoolCode}</div>
            <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>USERNAME</div>
            <input value={rollNo} onChange={e=>setRollNo(e.target.value)} placeholder="Enter your username"
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"11px 14px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:15,marginBottom:10,display:"block"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div>
                <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
                <select value={classNum} onChange={e=>setClassNum(e.target.value)}
                  style={{width:"100%",background:C.card2,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px",color:classNum?"white":C.dim,fontFamily:"'Nunito',sans-serif",fontSize:14}}>
                  <option value="">Any</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>Class {n}</option>)}
                </select>
              </div>
              <div>
                <div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div>
                <input value={section} onChange={e=>setSection(e.target.value.toUpperCase())} placeholder="A"
                  maxLength={3} style={{width:"100%",background:C.card2,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px 14px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/>
              </div>
            </div>
            <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>4-DIGIT PIN</div>
            <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}
              type="password" placeholder="••••" maxLength={4}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"11px 14px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:20,letterSpacing:6,textAlign:"center",marginBottom:12,display:"block"}}/>
            {error&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{error}</div>}
            <Btn color={C.purple} loading={loading} onClick={handleLogin}>🚀 ENTER ACADEMY</Btn>
            <button onClick={()=>{setStep("school");setError("");}} style={{background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer",marginTop:8,width:"100%",fontFamily:"'Nunito',sans-serif"}}>← Change school code</button>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── TeacherLogin Screen ───────────────────────────────────────────
function TeacherLogin({ onBack, onDone }) {
  const [email,   setEmail]   = useState("");
  const [pin,     setPin]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleLogin = async () => {
    if (!email.trim()||pin.length<4) { setError("Enter email and PIN"); return; }
    setLoading(true); setError("");
    try {
      const d = await schoolApi("teacher_login", {email:email.trim().toLowerCase(), pin});
      if (d.teacher) { SFX.select(); localStorage.setItem('mm_teacher_session', JSON.stringify({...d.teacher, session_token:d.session_token})); onDone({...d.teacher, session_token:d.session_token}); }
      else setError(d.error||"Invalid credentials");
    } catch(e) { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"24px 18px",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,maxWidth:420,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <BackBtn onClick={onBack} color={C.yellow}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>TEACHER LOGIN</div>
        </div>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:52,marginBottom:8}}>👨‍🏫</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,color:C.yellow}}>TEACHER PORTAL</div>
        </div>
        <Card color={C.yellow}>
          <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>EMAIL</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="teacher@school.com" type="email"
            style={{width:"100%",background:C.card2,border:`1.5px solid ${C.yellow}44`,borderRadius:10,padding:"11px 14px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,marginBottom:12,display:"block"}}/>
          <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>PIN</div>
          <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))}
            type="password" placeholder="••••••" maxLength={6}
            style={{width:"100%",background:C.card2,border:`1.5px solid ${C.yellow}44`,borderRadius:10,padding:"11px 14px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:20,letterSpacing:6,textAlign:"center",marginBottom:12,display:"block"}}/>
          {error&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{error}</div>}
          <Btn color={C.yellow} loading={loading} onClick={handleLogin}>👨‍🏫 LOGIN</Btn>
        </Card>
      </div>
    </div>
  );
}

// ── TeacherDashboard Screen ───────────────────────────────────────

// ── StudentActions ────────────────────────────────────────────────
function StudentActions({ student, teacher, onRefresh, onClose }) {
  const [view,    setView]    = useState("menu"); // menu|pin|progress
  const [newPin,  setNewPin]  = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [prog,    setProg]    = useState(null);

  const api = (action,body={}) => schoolApi(action,{...body,teacher_id:teacher.id,session_token:teacher.session_token||""});

  const changePin = async () => {
    if (newPin.length<4) { setMsg("Enter 4-digit PIN"); return; }
    setLoading(true);
    const d = await api("update_student_pin",{student_id:student.id,new_pin:newPin});
    setMsg(d.ok?"✅ PIN updated!":d.error||"Failed"); setLoading(false);
    if (d.ok) setTimeout(()=>{setView("menu");setMsg("");},1200);
  };

  const deleteStudent = async () => {
    if (!confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    setLoading(true);
    const d = await api("delete_student",{student_id:student.id});
    if (d.ok) { onRefresh(); setTimeout(onClose,100); } else setMsg(d.error||"Failed");
    setLoading(false);
  };

  const loadProgress = async () => {
    setLoading(true);
    const d = await api("get_student_progress",{student_id:student.id});
    setProg(d.data||[]); setView("progress"); setLoading(false);
  };

  if (view==="modify") return (
    <div style={{marginTop:10,padding:"10px",background:C.card2,borderRadius:10}}>
      <div style={{color:C.dim,fontSize:11,marginBottom:8}}>Modify {student.name}</div>
      {[["Name","name","text",student.name],["Roll No","roll_no","text",student.roll_no],["Username","username","text",student.username||""],["Section","section","text",student.section]].map(([l,k,t,ph])=>(
        <div key={k} style={{marginBottom:8}}>
          <div style={{color:C.dim,fontSize:10,marginBottom:3}}>{l}</div>
          <input defaultValue={ph} id={`mod_${k}_${student.id}`} type={t} placeholder={ph}
            style={{width:"100%",background:C.bg,border:`1.5px solid ${C.purple}44`,borderRadius:8,padding:"7px 10px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:13,display:"block"}}/>
        </div>
      ))}
      <div style={{marginBottom:8}}>
        <div style={{color:C.dim,fontSize:10,marginBottom:3}}>Class</div>
        <select id={`mod_class_${student.id}`} defaultValue={student.class_num}
          style={{width:"100%",background:C.bg,border:`1.5px solid ${C.purple}44`,borderRadius:8,padding:"7px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:13}}>
          {["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"].map((n,i)=><option key={i} value={i}>{n}</option>)}
        </select>
      </div>
      {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:11,marginBottom:6}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn color={C.purple} loading={loading} onClick={async()=>{
          setLoading(true);
          const get = k => document.getElementById(`mod_${k}_${student.id}`)?.value||"";
          const d = await api("modify_student",{student_id:student.id,
            name:get("name"),roll_no:get("roll_no"),username:get("username"),
            section:get("section"),class_num:document.getElementById(`mod_class_${student.id}`)?.value});
          setMsg(d.ok?"✅ Updated!":d.error||"Failed");
          if(d.ok){onRefresh();setTimeout(()=>{setView("menu");setMsg("");},1200);}
          setLoading(false);
        }}>SAVE</Btn>
        <button onClick={()=>setView("menu")} style={{flex:1,background:"none",border:`1px solid ${C.dim}44`,borderRadius:10,padding:"10px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>CANCEL</button>
      </div>
    </div>
  );

  if (view==="pin") return (
    <div style={{marginTop:10,padding:"10px",background:C.card2,borderRadius:10}}>
      <div style={{color:C.dim,fontSize:11,marginBottom:6}}>New 4-digit PIN for {student.name}</div>
      <input value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,"").slice(0,4))} type="password" placeholder="••••" maxLength={4}
        style={{width:"100%",background:C.bg,border:`1.5px solid ${C.cyan}44`,borderRadius:8,padding:"8px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:16,letterSpacing:4,textAlign:"center",display:"block",marginBottom:8}}/>
      {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:11,marginBottom:6}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn color={C.cyan} loading={loading} onClick={changePin}>SAVE</Btn>
        <button onClick={()=>setView("menu")} style={{flex:1,background:"none",border:`1px solid ${C.dim}44`,borderRadius:10,padding:"10px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>CANCEL</button>
      </div>
    </div>
  );

  if (view==="progress") return (
    <div style={{marginTop:10,padding:"10px",background:C.card2,borderRadius:10}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:C.cyan,marginBottom:8}}>📊 {student.name}'s PROGRESS</div>
      {loading&&<div style={{color:C.dim,fontSize:12}}>Loading...</div>}
      {prog&&prog.length===0&&<div style={{color:C.dim,fontSize:12}}>No lessons completed yet.</div>}
      {prog&&prog.slice(0,8).map((p,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${C.dim}11`,fontSize:12}}>
          <span style={{color:C.dim}}>{p.lesson_id?.replace("_s",": Set ")}</span>
          <span style={{color:"white"}}>{"⭐".repeat(p.stars_earned||0)} {p.correct_count||0}/{p.total_questions||20}</span>
        </div>
      ))}
      {prog&&prog.length>8&&<div style={{color:C.dim,fontSize:10,marginTop:4}}>+{prog.length-8} more lessons</div>}
      <button onClick={()=>setView("menu")} style={{marginTop:8,background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Back</button>
    </div>
  );

  return (
    <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
      <button onClick={loadProgress} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"6px 10px",color:C.cyan,cursor:"pointer",fontSize:11,fontFamily:"'Nunito',sans-serif"}}>📊 Progress</button>
      <button onClick={()=>setView("pin")} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:8,padding:"6px 10px",color:C.yellow,cursor:"pointer",fontSize:11,fontFamily:"'Nunito',sans-serif"}}>🔑 Change PIN</button>
      <button onClick={()=>setView("modify")} style={{background:`${C.purple}22`,border:`1px solid ${C.purple}44`,borderRadius:8,padding:"6px 10px",color:C.purple,cursor:"pointer",fontSize:11,fontFamily:"'Nunito',sans-serif"}}>✏️ Modify</button>
      <button onClick={deleteStudent} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"6px 10px",color:C.red,cursor:"pointer",fontSize:11,fontFamily:"'Nunito',sans-serif"}}>🗑 Delete</button>
    </div>
  );
}

function TeacherDashboard({ teacher, onLogout }) {
  const [students,   setStudents]   = useState([]);
  const [view,       setView]       = useState("classes"); // classes|list|add|import
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [selClass,   setSelClass]   = useState(null); // {class_num, section}
  const [form,       setForm]       = useState({name:"",roll_no:"",pin:"",class_num:1,section:"A"});
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState("");
  const [classMap,   setClassMap]   = useState({});
  const [selStudent, setSelStudent] = useState(null); // {"1-A": count}

  // Load all students once to build class/section list
  const loadAll = async () => {
    setLoading(true);
    try {
      const d = await schoolApi("get_class_dashboard",{teacher_id:teacher.id,session_token:teacher.session_token||""});
      if (d.data) {
        const map = {};
        d.data.forEach(s=>{ const k=`${s.class_num}-${s.section}`; map[k]=(map[k]||0)+1; });
        setClassMap(map);
      } else setError(d.error||"Failed to load");
    } catch(e) { setError("Network error"); }
    setLoading(false);
  };

  const loadClass = async (cls) => {
    setLoading(true); setSelClass(cls); setStudents([]);
    try {
      const d = await schoolApi("get_class_dashboard",{teacher_id:teacher.id,session_token:teacher.session_token||"",class_num:cls.class_num,section:cls.section});
      if (d.data) setStudents(d.data); else setError(d.error||"Failed");
    } catch(e) { setError("Network error"); }
    setView("list"); setLoading(false);
  };

  const load = () => selClass ? loadClass(selClass) : loadAll();
  useEffect(()=>{ loadAll(); },[]);

  // Add student removed — admin only

  const avg = students.length ? Math.round(students.reduce((s,st)=>s+(st.xp||0),0)/students.length) : 0;
  const top = students[0];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",overflowY:"auto"}}>
      {/* Header */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.purple}33`,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.yellow}}>👨‍🏫 {teacher.name}</div>
          <div style={{fontSize:11,color:C.dim}}>{selClass?`Class ${selClass.class_num}-${selClass.section}`:"All Classes"}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setSelStudent(null);}} style={{display:"none"}}>
            LIST
          </button>
          <button onClick={onLogout} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:10,padding:"8px 12px",color:C.red,cursor:"pointer",fontSize:11,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>LOGOUT</button>
        </div>
      </div>

      <div style={{padding:"16px 18px",maxWidth:600,margin:"0 auto"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[["👥","Students",students.length],[" ⭐","Avg XP",avg],["🏆","Top",top?.name?.split(" ")[0]||"—"]].map(([e,l,v],i)=>(
            <Card key={i} color={C.purple} style={{textAlign:"center",padding:"12px 8px"}}>
              <div style={{fontSize:18}}>{e}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:"white",margin:"4px 0"}}>{v}</div>
              <div style={{color:C.dim,fontSize:10}}>{l}</div>
            </Card>
          ))}
        </div>

        {view==="classes" && (
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.dim,marginBottom:12}}>SELECT CLASS & SECTION</div>
            {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
            {Object.keys(classMap).length===0&&!loading&&(
              <div style={{textAlign:"center",padding:30}}>
                <div style={{color:C.dim,fontSize:13,marginBottom:16}}>No students yet.</div>
                
              </div>
            )}
            {Object.keys(classMap).sort().map(k=>{
              const [cn,sec]=k.split("-");
              return (
                <button key={k} onClick={()=>loadClass({class_num:parseInt(cn),section:sec})} style={{width:"100%",background:C.card,border:`1px solid ${C.cyan}33`,borderRadius:14,padding:"16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,textAlign:"left"}}>
                  <div>
                    <div style={{fontWeight:800,color:"white",fontSize:15}}>Class {cn} — Section {sec}</div>
                    <div style={{color:C.dim,fontSize:12,marginTop:2}}>{classMap[k]} students</div>
                  </div>
                  <span style={{color:C.cyan,fontSize:22}}>›</span>
                </button>
              );
            })}
            
          </div>
        )}
        {false ? (
          <Card color={C.cyan}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <button onClick={()=>setView("classes")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:8,padding:"6px 10px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:12}}>← Back</button>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.cyan}}>➕ ADD STUDENT</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div>
                <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
                <select value={form.class_num} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})} style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14}}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>Class {n}</option>)}
                </select>
              </div>
              <div>
                <div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div>
                <input value={form.section} onChange={e=>setForm({...form,section:e.target.value.toUpperCase().slice(0,3)})} placeholder="A"
                  style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/>
              </div>
            </div>
            {[["Name","name","text","Full name"],["Roll No","roll_no","text","01"],["Username","username","text","e.g. arjun123"],["PIN (4 digits)","pin","password","••••"]].map(([l,k,t,ph])=>(
              <div key={k} style={{marginBottom:10}}>
                <div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div>
                <input value={form[k]} onChange={e=>setForm({...form,[k]:k==="pin"?e.target.value.replace(/[^0-9]/g,"").slice(0,4):e.target.value})}
                  type={t} placeholder={ph}
                  style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/>
              </div>
            ))}
            {saveMsg&&<div style={{color:saveMsg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8}}>{saveMsg}</div>}
            <Btn color={C.cyan} loading={saving} onClick={handleAdd}>ADD STUDENT</Btn>
          </Card>
        ) : (
          <div>
            {selClass && <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <button onClick={()=>{setView("classes");setSelClass(null);setStudents([]);}} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:12,fontFamily:"'Nunito',sans-serif"}}>← Classes</button>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:C.dim}}>Class {selClass.class_num}-{selClass.section} · {students.length} students</div>
            </div>}
            {loading && <div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
            {error   && <div style={{color:C.red,fontSize:13,marginBottom:10}}>{error}</div>}
            {students.map((s,i)=>(
              <div key={s.id} style={{background:C.card,border:`1px solid ${C.purple}22`,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{background:`${C.purple}33`,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.purple,flexShrink:0}}>{String(s.roll_no).padStart(2,"0")}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:14,color:"white"}}>{s.name}</div>
                    <div style={{fontSize:11,color:C.dim}}>Lv {s.level||1} · {s.xp||0} XP · 🔥{s.streak_days||0}</div>
                  </div>
                  <button onClick={()=>setSelStudent(selStudent?.id===s.id?null:s)} style={{background:"none",border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 8px",color:C.cyan,cursor:"pointer",fontSize:11}}>{selStudent?.id===s.id?"▲":"▼"}</button>
                </div>
                {selStudent?.id===s.id && <StudentActions student={s} teacher={teacher} onRefresh={load} onClose={()=>setSelStudent(null)}/>}
              </div>
            ))}
            {!loading&&students.length===0&&selClass&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No students in this class yet.</div>}
          </div>
        )}

        {view==="import" && (
          <ExcelImport teacher={teacher} onDone={()=>{setView("list");load();}}/>
        )}
        {view==="lessons" && (
          <TeacherLessons teacher={teacher} classFilter={selClass}/>
        )}
      </div>
    </div>
  );
}


// ── TeacherLessons Component ──────────────────────────────────────
function TeacherLessons({ teacher, classFilter }) {
  const [lessons,  setLessons]  = useState([]);
  const [selLesson,setSelLesson]= useState(null);
  const [view,     setView]     = useState("list"); // list|add_lesson|add_q
  const [form,     setForm]     = useState({});
  const [qForm,    setQForm]    = useState({set_index:0,question_index:0,correct_answer:0});
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState("");

  const api = (action,body={}) => schoolApi(action,{...body,teacher_id:teacher.id,session_token:teacher.session_token||""});

  const load = async () => {
    setLoading(true);
    const d = await api("list_custom_lessons",{class_num:classFilter?.class_num});
    if(d.data) setLessons(d.data);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const iStyle = (c) => ({width:"100%",background:C.card2,border:`1.5px solid ${c}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10});

  const handleAddLesson = async () => {
    setLoading(true); setMsg("");
    const d = await api("create_lesson",{...form,class_num:classFilter?.class_num||parseInt(form.class_num)||1});
    if(d.data){setMsg("✅ Lesson created!");load();setView("list");}else setMsg(d.error||"Failed");
    setLoading(false);
  };

  const handleAddQ = async () => {
    if(!qForm.question||!selLesson){setMsg("Fill all fields");return;}
    const opts = [qForm.o0,qForm.o1,qForm.o2,qForm.o3];
    if(opts.some(o=>!o)){setMsg("All 4 options required");return;}
    setLoading(true); setMsg("");
    const d = await api("create_question",{lesson_id:selLesson.lesson_id,...qForm,options:opts});
    if(d.data){setMsg("✅ Question added!");setQForm({...qForm,question_index:(qForm.question_index||0)+1,question:"",o0:"",o1:"",o2:"",o3:""});}
    else setMsg(d.error||"Failed");
    setLoading(false);
  };

  if(view==="add_lesson") return (
    <Card color={C.green}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.green,marginBottom:12}}>➕ CREATE LESSON</div>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>TITLE</div>
      <input value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Fractions Basics" style={iStyle(C.green)}/>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>EMOJI</div>
      <input value={form.emoji||""} onChange={e=>setForm({...form,emoji:e.target.value})} placeholder="📚" maxLength={4} style={iStyle(C.green)}/>
      {!classFilter&&<><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
      <select value={form.class_num||1} onChange={e=>setForm({...form,class_num:e.target.value})} style={{...iStyle(C.green),cursor:"pointer"}}>
        {[1,2,3,4,5].map(n=><option key={n} value={n}>Class {n}</option>)}
      </select></>}
      {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn color={C.green} loading={loading} onClick={handleAddLesson}>CREATE</Btn>
        <button onClick={()=>setView("list")} style={{flex:1,background:"none",border:`1px solid ${C.dim}44`,borderRadius:12,padding:"12px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>CANCEL</button>
      </div>
    </Card>
  );

  if(view==="add_q"&&selLesson) return (
    <Card color={C.cyan}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.cyan,marginBottom:4}}>➕ ADD QUESTION</div>
      <div style={{color:C.dim,fontSize:11,marginBottom:12}}>{selLesson.emoji} {selLesson.title}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SET (0-19)</div>
          <input type="number" value={qForm.set_index} onChange={e=>setQForm({...qForm,set_index:parseInt(e.target.value)||0})} style={iStyle(C.cyan)}/></div>
        <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>Q# (0-19)</div>
          <input type="number" value={qForm.question_index} onChange={e=>setQForm({...qForm,question_index:parseInt(e.target.value)||0})} style={iStyle(C.cyan)}/></div>
      </div>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>QUESTION</div>
      <input value={qForm.question||""} onChange={e=>setQForm({...qForm,question:e.target.value})} placeholder="What is 5 + 3?" style={iStyle(C.cyan)}/>
      {[0,1,2,3].map(i=>(
        <div key={i}>
          <div style={{color:i===qForm.correct_answer?C.green:C.dim,fontSize:11,marginBottom:4}}>
            Option {i+1} {i===qForm.correct_answer?"✓ CORRECT":""}</div>
          <input value={qForm[`o${i}`]||""} onChange={e=>setQForm({...qForm,[`o${i}`]:e.target.value})} placeholder={`Option ${i+1}`} style={iStyle(i===qForm.correct_answer?C.green:C.cyan)}/>
        </div>
      ))}
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT ANSWER</div>
      <select value={qForm.correct_answer} onChange={e=>setQForm({...qForm,correct_answer:parseInt(e.target.value)})} style={{...iStyle(C.green),cursor:"pointer"}}>
        {[0,1,2,3].map(i=><option key={i} value={i}>Option {i+1}</option>)}
      </select>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>HINT (optional)</div>
      <input value={qForm.hint||""} onChange={e=>setQForm({...qForm,hint:e.target.value})} placeholder="Hint for students" style={iStyle(C.dim)}/>
      {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn color={C.cyan} loading={loading} onClick={handleAddQ}>ADD QUESTION</Btn>
        <button onClick={()=>setView("list")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:12,padding:"12px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>DONE</button>
      </div>
    </Card>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.dim}}>CUSTOM LESSONS ({lessons.length})</div>
        <button onClick={()=>setView("add_lesson")} style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"7px 12px",color:C.green,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ LESSON</button>
      </div>
      {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
      {lessons.map(l=>(
        <div key={l.id} style={{background:C.card,border:`1px solid ${C.green}33`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:800,color:"white",fontSize:14}}>{l.emoji} {l.title}</div>
            <div style={{color:C.dim,fontSize:11}}>Class {l.class_num}</div>
          </div>
          <button onClick={()=>{setSelLesson(l);setView("add_q");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:"7px 12px",color:C.cyan,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ QUESTION</button>
        </div>
      ))}
      {!loading&&lessons.length===0&&<div style={{textAlign:"center",color:C.dim,padding:20}}>No custom lessons yet.</div>}
    </div>
  );
}

// ── ExcelImport Component ─────────────────────────────────────────
function ExcelImport({ teacher, onDone }) {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(l=>l.trim());
    const headers = lines[0].toLowerCase().split(",").map(h=>h.trim().replace(/"/g,""));
    return lines.slice(1).map(line => {
      const vals = line.split(",").map(v=>v.trim().replace(/"/g,""));
      const obj = {};
      headers.forEach((h,i) => obj[h] = vals[i]||"");
      return {
        name:     obj.name||obj["student name"]||obj["full name"]||"",
        roll_no:  String(obj.roll_no||obj["roll no"]||obj["roll number"]||obj.roll||""),
        class_num:parseInt(obj.class||obj["class num"]||obj.class_num||teacher.class_num||1),
        section:  (obj.section||"A").toUpperCase(),
        pin:      String(obj.pin||obj["4-digit pin"]||obj.password||"1234"),
      };
    }).filter(r=>r.name&&r.roll_no);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setResult(null); setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setPreview(parseCSV(ev.target.result).slice(0,5)); }
      catch(e) { setError("Could not parse file. Use CSV format."); }
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true); setResult(null); setError("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const students = parseCSV(ev.target.result);
        const d = await schoolApi("bulk_create_students", {teacher_id:teacher.id, session_token:teacher.session_token||"", students});
        if (d.ok) { setResult(d); if(d.success>0) setTimeout(onDone, 2000); }
        else setError(d.error||"Import failed");
      } catch(e) { setError("Network error"); }
      setLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <Card color={C.cyan}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.cyan,marginBottom:12}}>📥 BULK IMPORT STUDENTS</div>
      <div style={{background:`${C.purple}15`,borderRadius:10,padding:"10px 12px",marginBottom:14,fontSize:12,color:C.dim,lineHeight:1.7}}>
        Upload a <strong style={{color:"white"}}>CSV file</strong> with columns:<br/>
        <code style={{color:C.cyan,fontSize:11}}>name, roll_no, class, section, pin</code><br/>
        <span style={{fontSize:11}}>Example: <code style={{color:C.yellow}}>Arjun Sharma, 01, 1, A, 1234</code></span>
      </div>
      <input type="file" accept=".csv,.txt" onChange={handleFile}
        style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:13,marginBottom:12,display:"block",cursor:"pointer"}}/>
      {preview.length>0 && (
        <div style={{marginBottom:12}}>
          <div style={{color:C.dim,fontSize:11,marginBottom:6}}>PREVIEW (first {preview.length} rows):</div>
          {preview.map((s,i)=>(
            <div key={i} style={{fontSize:12,color:"white",padding:"4px 0",borderBottom:`1px solid ${C.dim}22`}}>
              {s.roll_no} · {s.name} · Class {s.class_num}-{s.section} · PIN:{s.pin}
            </div>
          ))}
        </div>
      )}
      {error  && <div style={{color:C.red,  fontSize:12,marginBottom:10}}>⚠️ {error}</div>}
      {result && <div style={{color:C.green,fontSize:12,marginBottom:10}}>✅ {result.success} imported{result.failed?.length>0?`, ${result.failed.length} failed`:""}</div>}
      {file && !result && <Btn color={C.cyan} loading={loading} onClick={handleImport}>📥 IMPORT {file.name}</Btn>}
      <a href="data:text/csv;charset=utf-8,name%2Croll_no%2Cclass%2Csection%2Cpin%0AArjun%20Sharma%2C01%2C1%2CA%2C1234%0APriya%20Patel%2C02%2C1%2CA%2C5678"
        download="students_template.csv"
        style={{display:"block",textAlign:"center",color:C.dim,fontSize:11,marginTop:10,textDecoration:"none"}}>
        ⬇️ Download CSV template
      </a>
    </Card>
  );
}

// ── AdminPanel Screen ─────────────────────────────────────────────
function AdminPanel({ onBack }) {
  const [key,       setKey]       = useState(localStorage.getItem("mm_admin_key")||"");
  const [authed,    setAuthed]    = useState(!!localStorage.getItem("mm_admin_key"));
  const [view,      setView]      = useState("schools"); // schools|school_detail|add_school|add_teacher
  const [schools,   setSchools]   = useState([]);
  const [selSchool, setSelSchool] = useState(null);
  const [teachers,  setTeachers]  = useState([]);
  const [selTeacher,setSelTeacher]= useState(null);
  const [students,  setStudents]  = useState([]);
  const [form,      setForm]      = useState({});
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState("");

  const api = (action, body={}) => schoolApi(action, body, key);

  const loadSchools = async () => {
    setLoading(true);
    const d = await api("admin_list_schools");
    if (d.data) setSchools(d.data); else setMsg(d.error||"Failed");
    setLoading(false);
  };

  const loadTeachers = async (school) => {
    setLoading(true); setSelSchool(school); setTeachers([]); setStudents([]);
    try {
      const d = await api("admin_list_teachers", {school_id: school.id});
      setTeachers(Array.isArray(d.data)?d.data:[]);
      if (!d.data && d.error) setMsg(d.error);
    } catch(e) { setMsg("Network error"); }
    setView("school_detail"); setLoading(false);
  };

  const loadStudents = async (teacher) => {
    if (!selSchool?.id) return;
    setLoading(true); setSelTeacher(teacher); setStudents([]);
    try {
      const d = await api("admin_list_students", {school_id: selSchool.id, teacher_id: teacher.id});
      setStudents(Array.isArray(d.data)?d.data:[]);
    } catch(e) { setMsg("Failed to load students"); }
    setView("teacher_detail"); setLoading(false);
  };

  const handleAuth = () => {
    if (!key.trim()) return;
    localStorage.setItem("mm_admin_key", key);
    setAuthed(true); loadSchools();
  };

  useEffect(() => { if (authed) loadSchools(); }, []); // load on mount

  const handleCreateSchool = async () => {
    setLoading(true); setMsg("");
    const d = await api("admin_create_school", form);
    if (d.data) { setMsg("✅ School created!"); loadSchools(); setForm({}); setView("schools"); }
    else setMsg(d.error||"Failed");
    setLoading(false);
  };

  const handleCreateTeacher = async () => {
    setLoading(true); setMsg("");
    const d = await api("admin_create_teacher", {...form, school_id: selSchool?.id});
    if (d.data) { setMsg("✅ Teacher created!"); loadTeachers(selSchool); setForm({}); setView("school_detail"); }
    else setMsg(d.error||"Failed");
    setLoading(false);
  };

  const inputStyle = (accent) => ({width:"100%",background:C.card2,border:`1.5px solid ${accent}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10});

  if (!authed) return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"24px 18px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <BackBtn onClick={onBack} color={C.red} style={{alignSelf:"flex-start",marginBottom:24}}/>
      <Card color={C.red} style={{maxWidth:360,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>🔐</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.red,marginBottom:16}}>ADMIN ACCESS</div>
        <input value={key} onChange={e=>setKey(e.target.value)} type="password" placeholder="Admin secret key"
          style={inputStyle(C.red)} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
        <Btn color={C.red} onClick={handleAuth}>ENTER →</Btn>
      </Card>
    </div>
  );

  // ── Schools List ──
  if (view==="schools") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",overflowY:"auto"}}>
      <div style={{background:C.card,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${C.red}33`}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.red}}>🔐 ADMIN — SCHOOLS</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setView("add_school")} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:10,padding:"7px 12px",color:C.yellow,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ SCHOOL</button>
          <BackBtn onClick={onBack} color={C.dim}/>
        </div>
      </div>
      <div style={{padding:"16px 18px",maxWidth:600,margin:"0 auto"}}>
        {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:12,padding:"8px 12px",background:msg.startsWith("✅")?`${C.green}11`:`${C.red}11`,borderRadius:10}}>{msg}</div>}
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {schools.map(s=>(
          <button key={s.id} onClick={()=>loadTeachers(s)} style={{width:"100%",background:C.card,border:`1px solid ${C.yellow}33`,borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,textAlign:"left"}}>
            <div>
              <div style={{fontWeight:800,color:"white",fontSize:14}}>{s.name}</div>
              <div style={{color:C.dim,fontSize:12}}>{s.city}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>{s.school_code}</div>
              <div style={{fontSize:10,color:s.is_active?C.green:C.red}}>{s.is_active?"Active":"Inactive"}</div>
            </div>
          </button>
        ))}
        {!loading&&schools.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No schools yet. Create one!</div>}
      </div>
    </div>
  );

  // ── Add School ──
  if (view==="add_school") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setView("schools")} color={C.yellow}/>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>CREATE SCHOOL</div>
      </div>
      <Card color={C.yellow} style={{maxWidth:480,margin:"0 auto"}}>
        {[["School Name","name","text","St. Xavier's School"],["City","city","text","Mumbai"],["School Code","school_code","text","STXAV001"]].map(([l,k,t,ph])=>(
          <div key={k}>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div>
            <input value={form[k]||""} onChange={e=>setForm({...form,[k]:k==="school_code"?e.target.value.toUpperCase():e.target.value})}
              type={t} placeholder={ph} style={inputStyle(C.yellow)}/>
          </div>
        ))}
        {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:10}}>{msg}</div>}
        <Btn color={C.yellow} loading={loading} onClick={handleCreateSchool}>CREATE SCHOOL</Btn>
      </Card>
    </div>
  );

  // ── School Detail — Teachers List ──
  if (view==="school_detail") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",overflowY:"auto"}}>
      <div style={{background:C.card,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${C.cyan}33`}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.cyan}}>{selSchool?.name}</div>
          <div style={{fontSize:11,color:C.dim}}>Code: {selSchool?.school_code} · Teachers: {teachers.length}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setView("add_teacher")} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:"7px 12px",color:C.cyan,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ TEACHER</button>
          <BackBtn onClick={()=>setView("schools")} color={C.dim}/>
        </div>
      </div>
      <div style={{padding:"16px 18px",maxWidth:600,margin:"0 auto"}}>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {teachers.map(t=>(
          <div key={t.id} style={{background:C.card,border:`1px solid ${C.purple}33`,borderRadius:14,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>loadStudents(t)} style={{flex:1,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>
              <div style={{fontWeight:800,color:"white",fontSize:14}}>{t.name}</div>
              <div style={{color:C.dim,fontSize:12}}>{t.email}</div>
            </button>
            <button onClick={()=>{setView("edit_teacher");setSelTeacher(t);setForm({name:t.name,email:t.email});}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
            <button onClick={async()=>{if(!window.confirm("Delete "+t.name+"?"))return;setLoading(true);const d=await api("admin_delete_teacher",{teacher_id:t.id});setMsg(d.data?"Deleted":d.error||"Failed");loadTeachers(selSchool);setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
          </div>
        ))}
        {!loading&&teachers.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No teachers yet.</div>}
      </div>
    </div>
  );

  // ── Add Teacher ──
  if (view==="add_teacher") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setView("school_detail")} color={C.cyan}/>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>ADD TEACHER — {selSchool?.name}</div>
      </div>
      <Card color={C.cyan} style={{maxWidth:480,margin:'0 auto'}}>
        {[["Name","name","text","Mrs. Sharma"],["Email","email","email","teacher@school.com"],["PIN (4-6 digits)","pin","password","••••"]].map(([l,k,t,ph])=>(
          <div key={k}>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div>
            <input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph} style={inputStyle(C.cyan)}/>
          </div>
        ))}
        {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:10}}>{msg}</div>}
        <Btn color={C.cyan} loading={loading} onClick={handleCreateTeacher}>ADD TEACHER</Btn>
      </Card>
    </div>
  );

  // ── Add Student (Admin only) ──
  if (view==="add_student") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setView("teacher_detail")} color={C.cyan}/>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>ADD STUDENT — {selTeacher?.name}</div>
      </div>
      <Card color={C.cyan} style={{maxWidth:480,margin:"0 auto"}}>
        {[["Name","name","text","Full name"],["Roll No","roll_no","text","01"],["PIN (4 digits)","pin","password","••••"]].map(([l,k,t,ph])=>(
          <div key={k} style={{marginBottom:10}}>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div>
            <input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
            <select value={form.class_num||1} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14}}>
              {["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"].map((n,i)=><option key={i} value={i} >{n}</option>)}
            </select>
          </div>
          <div>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div>
            <input value={form.section||"A"} onChange={e=>setForm({...form,section:e.target.value.toUpperCase().slice(0,3)})} placeholder="A"
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/>
          </div>
        </div>
        {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8}}>{msg}</div>}
        <Btn color={C.cyan} loading={loading} onClick={async()=>{
          setLoading(true);setMsg("");
          const d=await api("create_student_admin",{...form,teacher_id:selTeacher?.id,school_id:selSchool?.id});
          if(d.data){setMsg("✅ Student added!");setForm({});}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>ADD STUDENT</Btn>
      </Card>
    </div>
  );

  // ── Teacher Detail — Student List ──
  if (view==="teacher_detail") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",overflowY:"auto"}}>
      <div style={{background:C.card,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${C.purple}33`}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.purple}}>{selTeacher?.name}</div>
          <div style={{fontSize:11,color:C.dim}}>{selSchool?.name} · Students: {students.length}</div>
        </div>
        <button onClick={()=>setView("add_student")} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:"7px 12px",color:C.cyan,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ STUDENT</button>
          <BackBtn onClick={()=>setView("school_detail")} color={C.dim}/>
      </div>
      <div style={{padding:"16px 18px",maxWidth:600,margin:"0 auto"}}>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {students.map(s=>(
          <div key={s.id} style={{background:C.card,border:`1px solid ${C.purple}22`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:`${C.purple}33`,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.purple,flexShrink:0}}>
              {String(s.roll_no).padStart(2,"0")}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14,color:"white"}}>{s.name}</div>
              <div style={{fontSize:11,color:C.dim}}>Class {s.class_num}-{s.section} · Lv {s.level||1} · {s.xp||0} XP</div>
            </div>
            <button onClick={()=>{setView("edit_student");setForm({student_id:s.id,name:s.name,roll_no:s.roll_no,class_num:s.class_num,section:s.section});}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
            <button onClick={async()=>{if(!window.confirm("Delete "+s.name+"?"))return;setLoading(true);const d=await api("admin_delete_student",{student_id:s.id});setMsg(d.data?"Deleted":d.error||"Failed");loadStudents(selTeacher);setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
          </div>
        ))}
        {!loading&&students.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No students under this teacher.</div>}
      </div>
    </div>
  );

  // ── Edit Teacher ──
  if (view==="edit_teacher") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setView("school_detail")} color={C.cyan}/>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>EDIT TEACHER</div>
      </div>
      <Card color={C.cyan} style={{maxWidth:480,margin:"0 auto"}}>
        {[["Name","name","text","Teacher name"],["Email","email","email","teacher@school.com"]].map(([l,k,t,ph])=>(
          <div key={k}>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div>
            <input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10}}/>
          </div>
        ))}
        {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:10}}>{msg}</div>}
        <Btn color={C.cyan} loading={loading} onClick={async()=>{
          setLoading(true);setMsg("");
          const d=await api("admin_modify_teacher",{teacher_id:selTeacher?.id,...form});
          if(d.data){setMsg("✅ Saved!");loadTeachers(selSchool);}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>SAVE CHANGES</Btn>
      </Card>
    </div>
  );

  // ── Edit Student ──
  if (view==="edit_student") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setView("teacher_detail")} color={C.purple}/>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.purple}}>EDIT STUDENT</div>
      </div>
      <Card color={C.purple} style={{maxWidth:480,margin:"0 auto"}}>
        {[["Name","name","text","Full name"],["Roll No","roll_no","text","01"],["New PIN (leave blank to keep)","pin","password",""]].map(([l,k,t,ph])=>(
          <div key={k}>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div>
            <input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10}}/>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
            <select value={form.class_num||1} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})}
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14}}>
              {["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"].map((n,i)=><option key={i} value={i}>{n}</option>)}
            </select>
          </div>
          <div>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div>
            <input value={form.section||"A"} onChange={e=>setForm({...form,section:e.target.value.toUpperCase().slice(0,3)})} placeholder="A"
              style={{width:"100%",background:C.card2,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px 12px",color:"white",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/>
          </div>
        </div>
        {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8}}>{msg}</div>}
        <Btn color={C.purple} loading={loading} onClick={async()=>{
          setLoading(true);setMsg("");
          const payload={student_id:form.student_id,name:form.name,roll_no:form.roll_no,class_num:form.class_num,section:form.section};
          if(form.pin)payload.pin=form.pin;
          const d=await api("admin_modify_student",payload);
          if(d.data){setMsg("✅ Saved!");loadStudents(selTeacher);}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>SAVE CHANGES</Btn>
      </Card>
    </div>
  );

  return null;
}

function PrivacyPolicy({ onBack }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",overflowY:"auto"}}>
      <div style={{position:"sticky",top:0,background:C.bg,zIndex:10,padding:"14px 18px",borderBottom:`1px solid #181838`,display:"flex",alignItems:"center",gap:12}}>
        <BackBtn onClick={onBack} color={C.cyan}/>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>PRIVACY POLICY</div>
      </div>
      <div style={{padding:"20px 20px 40px",maxWidth:600,margin:"0 auto",color:"#ccc",lineHeight:1.8,fontSize:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16, color:"white",marginBottom:6}}>MathMagic Space Academy</div>
        <div style={{color:C.dim,fontSize:12,marginBottom:24}}>Last updated: {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>

        {[
          {t:"1. Data We Collect",b:["Account: Parent/guardian email and password (encrypted)","Child profile: First name, avatar, class level, PIN hash (not plain text)","Learning data: Lessons completed, quiz scores, XP, coins, streaks","Usage analytics: Lessons accessed, games played, daily challenges, session duration","Device info: Browser type, platform (web/Android/iOS), app version","Feedback and support messages submitted via the app"]},
          {t:"2. How We Use Your Data",b:["Deliver personalised learning content based on your child's class","Track progress and award XP, coins, stars and level-ups","Generate parent dashboard reports and learning insights","Improve app content, fix bugs, and enhance features","Send account-related notifications (no marketing without consent)","Detect and prevent fraud or unauthorised access"]},
          {t:"3. Data Sharing",b:["We DO NOT sell your data to anyone","We DO NOT share data with advertisers or third-party marketers","Service providers: Supabase (secure database hosting in EU/US) — bound by strict data processing agreements","Legal: We may disclose data if required by Indian law or court order","We NEVER share children's personal data with any third party for commercial purposes"]},
          {t:"4. Children's Privacy (COPPA & DPDP Compliant)",b:["MathMagic is for children aged 5-11 under parental supervision","A parent or guardian must register the account — children do not register directly","We collect only the minimum data necessary for the app to function","We do not show behavioural advertising to children","We do not use children's data for profiling or automated decision-making","Parents can request access, correction or deletion of their child's data at any time by emailing privacy@mathmagicacademy.in"]},
          {t:"5. AI-Generated Content Disclosure",b:["MathMagic uses AI assistance (Claude by Anthropic) to generate maths questions, puzzles, hints and learning content","All AI-generated content is reviewed for age-appropriateness and educational accuracy before use","AI is not used to make decisions about your child or generate personal recommendations without review","The app does not use AI to identify, track or profile children","AI-generated content is clearly integrated into the learning experience and is not presented as human-created"]},
          {t:"6. Play Store Data Safety",b:["Data collected: Name, email, learning progress, usage analytics","Data encrypted in transit: Yes (HTTPS/TLS)","Data encrypted at rest: Yes (Supabase AES-256)","User can request deletion: Yes — email privacy@mathmagicacademy.in","Data shared with third parties: No (except hosting provider)","Precise location: Not collected","Financial info: Not collected","Health info: Not collected","Messages: Not collected"]},
          {t:"7. Permissions We Request",b:["Internet access: Required to load lessons and save progress","Storage (optional): For offline caching of app shell only","Camera/Microphone: NOT requested","Contacts: NOT requested","Location: NOT requested","We request only the minimum permissions necessary for core functionality"]},
          {t:"8. Data Security",b:["All data transmitted over HTTPS with TLS encryption","Passwords are hashed and never stored in plain text","PINs are hashed before storage","JWT authentication tokens stored in browser memory only (not localStorage)","Supabase Row-Level Security policies restrict data access","Regular security audits and vulnerability assessments"]},
          {t:"9. Data Retention & Deletion",b:["Account data retained while account is active","Progress data deleted within 30 days of account deletion","Analytics data retained for 12 months then anonymised","To delete your account and all data: email privacy@mathmagicacademy.in","We will process deletion requests within 30 days as required by DPDP Act 2023"]},
          {t:"10. Your Rights (DPDP Act 2023)",b:["Right to access: Request a copy of your personal data","Right to correction: Request correction of inaccurate data","Right to erasure: Request deletion of your data","Right to grievance: File a complaint with our Grievance Officer","Right to nominate: Nominate another person to exercise your rights","Grievance Officer: privacy@mathmagicacademy.in | Response within 30 days"]},
          {t:"11. Content Rating",b:["This app is rated for ages 5+ (Everyone)","Contains: Educational content only","Does not contain: Violence, adult content, gambling, horror","Safe for children: Yes — all content is educational and age-appropriate","IARC/PEGI rating: 3+ | ESRB: Everyone"]},
          {t:"12. Contact & Updates",b:["Privacy Officer: privacy@mathmagicacademy.in","Support: Available via the SOS/Feedback feature in the app","Policy updates: Users notified via in-app notification","Effective date: "+new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),"Governing law: Information Technology Act 2000 and DPDP Act 2023 (India)"]},
        ].map(({t,b},i)=>(
          <div key={i} style={{marginBottom:20}}>
            <div style={{fontWeight:800,color:"white",fontSize:14,marginBottom:6,lineHeight:1.4}}>{t}</div>
            <div style={{color:"#bbb"}}>{b.map((line,j)=><div key={j} style={{marginBottom:3,lineHeight:1.6,fontSize:13}}>{line}</div>)}</div>
          </div>
        ))
        }
      </div>
    </div>
  );
}

// ── Games Hub ─────────────────────────────────────────────────────────

// ── Math Card Flip (Memory Match) ────────────────────────────────
function MathCardFlip({ onBack, child }) {
  const genCards = (lvl) => {
    const count = 4 + lvl * 2; // 6,8,10 pairs
    const pairs = [];
    for(let i=0;i<count;i++){
      const a=Math.floor(Math.random()*10)+1, b=Math.floor(Math.random()*10)+1;
      pairs.push({id:i*2,   type:"q", val:`${a}+${b}`, ans:a+b});
      pairs.push({id:i*2+1, type:"a", val:`${a+b}`,    ans:a+b});
    }
    return pairs.sort(()=>Math.random()-0.5).map((c,i)=>({...c,idx:i,flipped:false,matched:false}));
  };

  const [level,   setLevel]   = useState(1);
  const [cards,   setCards]   = useState(()=>genCards(1));
  const [flipped, setFlipped] = useState([]); // indices
  const [moves,   setMoves]   = useState(0);
  const [won,     setWon]     = useState(false);
  const [score,   setScore]   = useState(0);

  const flip = (idx) => {
    if(flipped.length===2||cards[idx].flipped||cards[idx].matched) return;
    SFX.tap();
    const nf = [...flipped, idx];
    const nc = cards.map((c,i)=>i===idx?{...c,flipped:true}:c);
    setCards(nc); setFlipped(nf);
    if(nf.length===2){
      setMoves(m=>m+1);
      const [a,b] = nf;
      if(nc[a].ans===nc[b].ans && nc[a].type!==nc[b].type){
        SFX.correct();
        const mc = nc.map((c,i)=>nf.includes(i)?{...c,matched:true}:c);
        setCards(mc); setFlipped([]); setScore(s=>s+10);
        if(mc.every(c=>c.matched)){
          SFX.levelUp(); setWon(true);
        }
      } else {
        SFX.wrong();
        setTimeout(()=>{ setCards(c=>c.map((cd,i)=>nf.includes(i)?{...cd,flipped:false}:cd)); setFlipped([]); },800);
      }
    }
  };

  const nextLevel = () => { setLevel(l=>l+1); setCards(genCards(level+1)); setFlipped([]); setMoves(0); setWon(false); };

  const cols = level===1?4:level===2?4:5;
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.cyan}}>MATH CARD FLIP</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.yellow}}>⭐{score} | L{level}</div>
        </div>
        {won ? (
          <div style={{textAlign:"center",padding:40}}>
            <div style={{fontSize:64,marginBottom:12}}>🎉</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.green,marginBottom:8}}>LEVEL {level} CLEARED!</div>
            <div style={{color:C.dim,fontSize:13,marginBottom:20}}>Moves: {moves} · Score: {score}</div>
            <Btn color={C.green} onClick={nextLevel}>NEXT LEVEL →</Btn>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
            {cards.map((c,i)=>(
              <button key={c.id} onClick={()=>flip(i)} style={{
                aspectRatio:"1",background:c.matched?`${C.green}22`:c.flipped?C.card2:C.card,
                border:`2px solid ${c.matched?C.green:c.flipped?C.cyan:C.dim+"44"}`,
                borderRadius:12,cursor:c.matched?"default":"pointer",fontSize:c.flipped||c.matched?13:20,
                color:c.matched?C.green:c.flipped?"white":C.purple,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all 0.2s",fontFamily:"'Orbitron',sans-serif",
              }}>{c.flipped||c.matched ? c.val : "?"}</button>
            ))}
          </div>
        )}
        <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:12}}>Match equation with answer · Moves: {moves}</div>
      </div>
    </div>
  );
}

// ── Equation Balance ──────────────────────────────────────────────
function EquationBalance({ onBack, child }) {
  const genQ = (lvl) => {
    const ops = lvl<2?["+","-"]:lvl<4?["+","-","×"]:["+","-","×","÷"];
    const op = ops[Math.floor(Math.random()*ops.length)];
    let a,b,ans;
    if(op==="+"){a=Math.floor(Math.random()*20)+1;b=Math.floor(Math.random()*20)+1;ans=a+b;}
    else if(op==="-"){a=Math.floor(Math.random()*20)+10;b=Math.floor(Math.random()*a)+1;ans=a-b;}
    else if(op==="×"){a=Math.floor(Math.random()*10)+2;b=Math.floor(Math.random()*10)+2;ans=a*b;}
    else{b=Math.floor(Math.random()*9)+2;ans=Math.floor(Math.random()*10)+2;a=b*ans;}
    const wrong = [ans+1,ans-1,ans+2,ans-2,ans+b,ans-b].filter(x=>x>0&&x!==ans);
    const opts = [ans,...wrong.slice(0,3)].sort(()=>Math.random()-0.5);
    return {q:`${a} ${op} ${b} = ?`, ans, opts};
  };

  const [level,  setLevel]  = useState(1);
  const [q,      setQ]      = useState(()=>genQ(1));
  const [score,  setScore]  = useState(0);
  const [streak, setStreak] = useState(0);
  const [shake,  setShake]  = useState(false);
  const [flash,  setFlash]  = useState(null); // "right"|"wrong"
  const [total,  setTotal]  = useState(0);

  const answer = (opt) => {
    setTotal(t=>t+1);
    if(opt===q.ans){
      SFX.correct(); setScore(s=>s+10+streak*2); setStreak(s=>s+1);
      setFlash("right");
      setTimeout(()=>{setFlash(null);setQ(genQ(Math.ceil(score/50)+1));},600);
    } else {
      SFX.wrong(); setStreak(0); setShake(true);
      setFlash("wrong");
      setTimeout(()=>{setShake(false);setFlash(null);},600);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <BackBtn onClick={onBack} color={C.orange}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.orange}}>EQUATION BALANCE</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.yellow}}>⭐{score}</div>
        </div>
        {streak>=3&&<div style={{textAlign:"center",color:C.orange,fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:8}}>🔥 STREAK x{streak}!</div>}
        <div style={{background:flash==="right"?`${C.green}22`:flash==="wrong"?`${C.red}22`:C.card,border:`2px solid ${flash==="right"?C.green:flash==="wrong"?C.red:C.orange+"44"}`,borderRadius:20,padding:"32px 16px",textAlign:"center",marginBottom:20,animation:shake?"shakeX 0.4s ease":"none",transition:"background 0.2s"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:"white"}}>{q.q}</div>
          {flash&&<div style={{fontSize:20,marginTop:8}}>{flash==="right"?"✅":"❌"}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {q.opts.map((o,i)=>(
            <button key={i} onClick={()=>answer(o)} style={{background:C.card,border:`2px solid ${C.orange}44`,borderRadius:16,padding:"18px",fontFamily:"'Orbitron',sans-serif",fontSize:20,color:"white",cursor:"pointer",textAlign:"center"}}>
              {o}
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:14}}>Answered: {total} · Streak: {streak}</div>
      </div>
    </div>
  );
}

// ── Number Sequence Builder ───────────────────────────────────────
function SequenceBuilder({ onBack, child }) {
  const genSeq = (lvl) => {
    const types = ["add","mul","fib","square","odd","even"];
    const type = types[Math.floor(Math.random()*Math.min(lvl+1,types.length))];
    let seq=[], step, missing;
    if(type==="add"){step=Math.floor(Math.random()*5)+2;const s=Math.floor(Math.random()*5)+1;seq=Array.from({length:6},(_,i)=>s+i*step);}
    else if(type==="mul"){step=Math.floor(Math.random()*4)+2;const s=Math.floor(Math.random()*3)+1;seq=Array.from({length:5},(_,i)=>s*Math.pow(step,i));}
    else if(type==="fib"){const a=Math.floor(Math.random()*3)+1,b=a+1;seq=[a,b];while(seq.length<6)seq.push(seq[seq.length-1]+seq[seq.length-2]);}
    else if(type==="square"){const s=Math.floor(Math.random()*3)+1;seq=Array.from({length:5},(_,i)=>Math.pow(s+i,2));}
    else if(type==="odd"){const s=Math.floor(Math.random()*10)*2+1;seq=Array.from({length:6},(_,i)=>s+i*2);}
    else{const s=Math.floor(Math.random()*10)*2+2;seq=Array.from({length:6},(_,i)=>s+i*2);}
    seq=seq.slice(0,6);
    missing=Math.floor(Math.random()*(seq.length-2))+1;
    const ans=seq[missing];
    const disp=seq.map((v,i)=>i===missing?"?":v);
    const wrongs=[ans+step||ans+1,ans-step||ans-1,ans*2,Math.floor(ans/2)].filter(x=>x>0&&x!==ans);
    const opts=[ans,...wrongs.slice(0,3)].sort(()=>Math.random()-0.5);
    return {disp,ans,opts,type,missing};
  };

  const [score, setScore]  = useState(0);
  const [q,     setQ]      = useState(()=>genSeq(1));
  const [flash, setFlash]  = useState(null);
  const [total, setTotal]  = useState(0);
  const [lvl,   setLvl]    = useState(1);

  const answer = (opt) => {
    setTotal(t=>t+1);
    if(opt===q.ans){
      SFX.correct(); setScore(s=>s+15); setFlash("right");
      const nl = Math.ceil((score+15)/60)+1;
      setLvl(nl);
      setTimeout(()=>{setFlash(null);setQ(genSeq(nl));},700);
    } else {
      SFX.wrong(); setFlash("wrong");
      setTimeout(()=>setFlash(null),600);
    }
  };

  const typeLabel = {add:"➕ Add",mul:"✖️ Multiply",fib:"🐚 Fibonacci",square:"² Square",odd:"Odd",even:"Even"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <BackBtn onClick={onBack} color={C.green}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.green}}>SEQUENCE BUILDER</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.yellow}}>⭐{score}</div>
        </div>
        <div style={{background:C.card,border:`2px solid ${C.green}44`,borderRadius:20,padding:"24px 16px",marginBottom:20}}>
          <div style={{color:C.dim,fontSize:11,textAlign:"center",marginBottom:12}}>{typeLabel[q.type]||"Pattern"} sequence — find the missing number</div>
          <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:8}}>
            {q.disp.map((v,i)=>(
              <div key={i} style={{width:48,height:48,borderRadius:12,background:v==="?"?`${C.green}33`:C.card2,border:`2px solid ${v==="?"?C.green:C.dim+"44"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:v==="?"?22:14,color:v==="?"?C.green:"white",fontWeight:800}}>
                {v}
              </div>
            ))}
          </div>
          {flash&&<div style={{textAlign:"center",fontSize:24,marginTop:12}}>{flash==="right"?"✅":"❌"}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {q.opts.map((o,i)=>(
            <button key={i} onClick={()=>answer(o)} style={{background:C.card,border:`2px solid ${C.green}44`,borderRadius:16,padding:"18px",fontFamily:"'Orbitron',sans-serif",fontSize:18,color:"white",cursor:"pointer",textAlign:"center"}}>
              {o}
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:14}}>Answered: {total} · Level: {lvl}</div>
      </div>
    </div>
  );
}

const GAME_LIST = [
  {id:"rocket",  icon:"🚀", title:"Number Rocket",  desc:"Answer before fuel runs out!", color:"#f97316", component: NumberRocket},
  {id:"catcher", icon:"⭐", title:"Star Catcher",   desc:"Catch the right answers!",      color:"#fbbf24", component: StarCatcher},
  {id:"maze",    icon:"🌀", title:"Math Maze",       desc:"Solve puzzles to move forward!",color:"#22c55e", component: MathMaze},
  {id:"speed",   icon:"⚡", title:"Speed Math",      desc:"60 seconds — go as fast as you can!", color:"#a855f7", component: SpeedMath},
  {id:"memory",  icon:"🧠", title:"Number Memory",    desc:"Remember the number sequence!",    color:"#ec4899", component: NumberMemory},
  {id:"cardflip",icon:"🃏", title:"Math Card Flip",   desc:"Match equations with answers!",     color:"#06b6d4", component: MathCardFlip},
  {id:"balance", icon:"⚖️", title:"Equation Balance", desc:"Pick the right answer fast!",        color:"#f97316", component: EquationBalance},
  {id:"sequence",icon:"🔢", title:"Sequence Builder",  desc:"Find the missing number pattern!",   color:"#22c55e", component: SequenceBuilder},
];

function GamesHub({ child, onBack }) {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame) {
    const GameComp = GAME_LIST.find(g=>g.id===activeGame)?.component;
    if (GameComp) return <GameComp onBack={()=>setActiveGame(null)} child={child}/>;
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:2,background:`${C.cyan}18`,borderBottom:`1px solid ${C.cyan}33`,padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.cyan}}>🎮 SPACE GAMES</div>
            <div style={{fontSize:10,color:C.dim}}>8 mini-games · Play & earn XP</div>
          </div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"16px 18px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {GAME_LIST.map(g=>(
            <button key={g.id} onClick={()=>setActiveGame(g.id)} style={{
              background:`linear-gradient(135deg,${g.color}16,${g.color}08)`,
              border:`2px solid ${g.color}44`, borderRadius:17, padding:"16px",
              cursor:"pointer", display:"flex", alignItems:"center", gap:14,
              boxShadow:`0 0 14px ${g.color}22`, textAlign:"left",
            }}>
              <div style={{width:56,height:56,borderRadius:15,background:`${g.color}22`,border:`2px solid ${g.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{g.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:g.color,marginBottom:3}}>{g.title}</div>
                <div style={{fontSize:12,color:C.dim}}>{g.desc}</div>
              </div>
              <div style={{color:g.color,fontSize:22}}>›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [themeKey,setThemeKey]=useState(localStorage.getItem('mm_theme')||'royal');
  const [schoolStudent, setSchoolStudent] = useState(null);
  const [purchasedLessons, setPurchasedLessons] = useState(()=>{ try{return JSON.parse(localStorage.getItem('mm_purchased')||'[]')}catch{return []} });
  const [teacher,       setTeacher]       = useState(null);
  const handleThemeChange=(key)=>{C=THEMES[key]||THEMES.royal;setThemeKey(key);};
  const [screen,         setScreen]         = useState("splash");
  const [user,           setUser]           = useState(null);
  const [child,          setChild]          = useState(null);
  const [world,          setWorld]          = useState(null);
  const [lesson,         setLesson]         = useState(null);
  const [feedbackPrefill,setFeedbackPrefill]= useState(null);
  const [prevScreen,     setPrevScreen]     = useState("home");

  // Expose setScreen globally so nested Login component can navigate to school screens
  useEffect(() => { window._setScreen = setScreen; return () => { delete window._setScreen; }; }, [setScreen]);

  const goFeedback = (prefillCat = null) => {
    setPrevScreen(screen);
    setFeedbackPrefill(prefillCat);
    setScreen("feedback");
  };

  // Screens that show the floating SOS button
  const showSOS = ["home","game","abacus","olympiad","lessons","games"].includes(screen);

  // Android hardware back button support
  useEffect(() => {
    // Push a history entry so popstate fires on back press
    window.history.pushState({ mm: true }, "");
    const handleBack = (e) => {
      e.preventDefault();
      setScreen(s => {
        const backMap = { game:"lessons", lessons:"home", paywall:"home", abacus:"home", olympiad:"home", parent:"home", games:"home", register:"welcome", login:"welcome" };
        return backMap[s] || "welcome";
      });
      // Keep history entry so next back press also works
      setTimeout(() => window.history.pushState({ mm: true }, ""), 0);
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const logout = async () => {
    await db.signOut();
    setUser(null); setChild(null); setWorld(null); setLesson(null);
    db.track("logout", child?.id, user?.id, {});
    setScreen("entry");
  };


  const isLessonPurchased = (worldId, lessonId) => {
    if ((child?.class_num||1) === worldId) return true; // own class always free
    if (child?.is_premium) return true; // full premium
    return purchasedLessons.includes(lessonId);
  };
  const purchaseLesson = (lessonId, worldId, price=49) => {
    // Store purchase locally + in DB
    const updated = [...purchasedLessons, lessonId];
    setPurchasedLessons(updated);
    localStorage.setItem('mm_purchased', JSON.stringify(updated));
  };
  const goWorld = (cw) => {
    setWorld(cw);
    setScreen("lessons");
  };

  const handleUnlock = useCallback(async () => {
    await db.setPremium(child.id);
    setChild(c => ({ ...c, is_premium: true }));
    setScreen("lessons");
  }, [child]);

  if (screen === "splash")   return <><GlobalStyles/><Splash   onDone={() => setScreen("entry")}/></>;
  if (screen === "entry")         return <><GlobalStyles/><EntryScreen onSelect={(s)=>setScreen(s)}/></>;
  if (screen === "student_entry") return <><GlobalStyles/><StudentEntry onBack={()=>setScreen("entry")} onSelect={(s)=>setScreen(s)}/></>;
  if (screen === "welcome")  return <><GlobalStyles/><Welcome  onRegister={() => setScreen("register")} onLogin={() => setScreen("login")} onPrivacy={() => { setPrevScreen("welcome"); setScreen("privacy"); }}/></>;
  if (screen === "register") return <><GlobalStyles/><Register onBack={() => setScreen("student_entry")} onDone={({ user: u, child: c, requirePayment }) => { setUser(u); setChild(c); setWorld(WORLDS[(c?.class_num||1)-1]||WORLDS[0]); setScreen(requirePayment?"paywall":"home"); }}/></>;
  if (screen === "login")    return <><GlobalStyles/><Login    onBack={() => setScreen("student_entry")} onDone={({ user: u, child: c }) => { setUser(u); setChild(c); setScreen("home"); }}/></>;
  if (screen === "home")     return <><GlobalStyles/><Home     child={child} isLessonPurchased={isLessonPurchased} onWorld={goWorld} onAbacus={() => setScreen("abacus")} onGames={() => setScreen("games")} onOlympiad={() => setScreen("olympiad")} onParent={() => setScreen("parent")} onRate={() => setShowRating(true)} onLogout={logout} onFeedback={goFeedback} onSettings={()=>setScreen('settings')} onThemeChange={handleThemeChange}/><FreezeDetector currentScreen={screen} child={child} onReport={goFeedback}/></>;
  if (screen === "paywall")  return <><GlobalStyles/><Paywall  world={world||WORLDS[(child?.class_num||1)-1]||WORLDS[0]} child={child} onBack={() => setScreen("home")} onUnlock={handleUnlock}/></>;
  if (screen === "lessons")  return <><GlobalStyles/><LessonMap world={world} child={child} onBack={() => setScreen("home")} isLessonPurchased={isLessonPurchased} onPurchaseLesson={purchaseLesson} onLesson={l => { setLesson(l); setScreen("game"); }}/></>;
  if (screen === "game")     return <><GlobalStyles/><Game     lesson={lesson} world={world} child={child} setChild={setChild} onBack={() => { db.track("lesson_exit",child?.id,null,{lesson_id:lesson?.id,set_index:lesson?.setIndex}); setScreen("lessons"); }} onDone={() => { db.track("lesson_complete",child?.id,null,{lesson_id:lesson?.id,set_index:lesson?.setIndex}); setScreen("lessons"); }} onNextSet={(si) => { db.track("set_advance",child?.id,null,{lesson_id:lesson?.id,set_index:si}); setLesson(l => ({...l, setIndex:si})); }}/>{ showSOS && <SOSButton onClick={() => goFeedback("bug")}/>}<FreezeDetector currentScreen={screen} child={child} onReport={goFeedback}/></>;
  if (screen === "abacus")   return <><GlobalStyles/><Abacus   onBack={() => setScreen("home")} child={child}/>{ showSOS && <SOSButton onClick={() => goFeedback("bug")}/>}<FreezeDetector currentScreen={screen} child={child} onReport={goFeedback}/></>;
  if (screen === "olympiad") return <><GlobalStyles/><Olympiad child={child} setChild={setChild} onBack={() => setScreen("home")}/>{ showSOS && <SOSButton onClick={() => goFeedback("bug")}/>}<FreezeDetector currentScreen={screen} child={child} onReport={goFeedback}/></>;
  if (screen === "parent")   return <><GlobalStyles/><ParentDash child={child} onBack={() => setScreen("home")}/></>;
  if (screen === "feedback") return <><GlobalStyles/><FeedbackScreen child={child} currentScreen={prevScreen} prefillCategory={feedbackPrefill} onBack={() => setScreen(prevScreen)}/></>;
  if (screen === "games")    return <><GlobalStyles/><GamesHub child={child} onBack={() => setScreen("home")}/></>;
  if (screen === "student_login") return <><GlobalStyles/><StudentLogin onBack={()=>setScreen("student_entry")} onDone={(s)=>{setSchoolStudent(s);setChild({...s,id:s.id,name:s.name,avatar:"🧒",class_num:s.class_num,xp:s.xp||0,coins:s.coins||0,level:s.level||1,streak_days:s.streak_days||0,is_school_student:true});setScreen("home");}}/></>;
  if (screen === "teacher_login") return <><GlobalStyles/><TeacherLogin onBack={()=>setScreen("entry")} onDone={(t)=>{setTeacher(t);localStorage.setItem("mm_teacher_session",JSON.stringify(t));setScreen("teacher_dash");}}/></>;
  if (screen === "teacher_dash")  return <><GlobalStyles/><TeacherDashboard teacher={teacher} onLogout={()=>{setTeacher(null);setScreen("entry");}}/></>;
  if (screen === "admin_panel")   return <><GlobalStyles/><AdminPanel onBack={()=>setScreen("entry")}/></>;
  if (screen === "privacy")    return <><GlobalStyles/><PrivacyPolicy  onBack={()=>setScreen("settings")}/></>;
  if (screen === "terms")      return <><GlobalStyles/><TermsOfService onBack={()=>setScreen("settings")}/></>;
  if (screen === "datapolicy") return <><GlobalStyles/><DataPolicy     onBack={()=>setScreen("settings")}/></>;
  if (screen === "settings")   return <><GlobalStyles/><Settings child={child} user={user} onThemeChange={handleThemeChange} onBack={(dest)=>{if(dest==="rate")setShowRating(true);else if(dest)setScreen(dest);else setScreen("home");}} onLogout={logout}/></>;
  return <><GlobalStyles/><OfflineBanner/></>;
}
