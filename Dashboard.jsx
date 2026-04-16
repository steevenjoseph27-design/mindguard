import { useState, useEffect, useRef } from "react";
import { supabase } from "./App";

const C = {
  bg: "#080E09", bgCard: "#0D1610", bgCard2: "#111D13",
  border: "#1C2E1E", borderLight: "#2A4030",
  forest: "#1B3A2D", orange: "#E8650A", orangeLight: "#F5850A",
  orangeDim: "#2A1505", cream: "#F5EDD6", creamDim: "#1A1710",
  text: "#F0EDE6", textSec: "#7A8C7D", textMuted: "#2E4033",
  green: "#2D6A4F", greenBright: "#52B788", greenDim: "#0A1F14",
  red: "#C1440E", redDim: "#1A0A05", amber: "#D4A017", amberDim: "#1A1405",
};

const ANTHROPIC_KEY = "";

const QUESTIONS = [
  { id: "sleep",  emoji: "🌙", label: "Comment as-tu dormi cette nuit ?",       opts: ["Très mal", "Mal", "Moyen", "Bien", "Très bien"],            scores: [0,2,5,8,10] },
  { id: "energy", emoji: "⚡", label: "Ton niveau d'énergie ce matin ?",         opts: ["Épuisé(e)", "Fatigué(e)", "Neutre", "Énergique", "Au top"], scores: [0,2,5,8,10] },
  { id: "mood",   emoji: "💭", label: "Comment tu te sens émotionnellement ?",   opts: ["Très bas", "Bas", "Neutre", "Bien", "Excellent"],            scores: [0,2,5,8,10] },
  { id: "stress", emoji: "🌊", label: "Ton niveau de stress aujourd'hui ?",      opts: ["Extrême", "Élevé", "Modéré", "Faible", "Aucun"],            scores: [0,2,5,8,10] },
  { id: "social", emoji: "🤝", label: "As-tu envie de voir des gens ?",          opts: ["Pas du tout", "Plutôt non", "Neutre", "Oui", "Absolument"], scores: [0,2,5,8,10] },
];

const NAV = [
  { id: "home",      icon: "⌂",  label: "Accueil" },
  { id: "checkin",   icon: "◎",  label: "Bilan" },
  { id: "history",   icon: "◑",  label: "Historique" },
  { id: "ai",        icon: "🦊", label: "Coach" },
  { id: "resources", icon: "❤",  label: "Aide" },
];

function risk(score) {
  if (score == null) return { label: "—", color: C.textMuted };
  if (score >= 75) return { label: "Faible", color: C.greenBright };
  if (score >= 50) return { label: "Modéré", color: C.amber };
  return { label: "Élevé", color: C.red };
}

function ScoreRing({ score, size = 90 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? score / 100 : 0;
  const rk = risk(score);
  const stroke = score == null ? C.border : score >= 75 ? C.greenBright : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={stroke} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 6px ${stroke}80)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size > 60 ? 22 : 14, fontWeight: 800, color: stroke, letterSpacing: -1, fontFamily: "'Fraunces', serif" }}>
          {score != null ? score : "?"}
        </span>
        {size > 60 && <span style={{ fontSize: 10, color: rk.color, marginTop: 2, fontWeight: 600 }}>{rk.label}</span>}
      </div>
    </div>
  );
}

function HistBar({ day, score, isToday }) {
  const h = score != null ? Math.max(8, (score / 100) * 80) : 6;
  const col = score == null ? C.textMuted : score >= 75 ? C.greenBright : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ fontSize: 10, color: isToday ? C.orange : C.textMuted, fontWeight: isToday ? 700 : 400 }}>{score != null ? score : "—"}</div>
      <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ width: "75%", height: h, borderRadius: "4px 4px 0 0", background: isToday ? `${C.orange}44` : col, border: isToday ? `1.5px dashed ${C.orange}` : "none", transition: "height 0.9s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: score != null && !isToday ? `0 0 8px ${col}40` : "none" }} />
      </div>
      <div style={{ fontSize: 10, color: isToday ? C.orange : C.textMuted, fontWeight: isToday ? 700 : 400 }}>{day}</div>
    </div>
  );
}

function CheckIn({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fading, setFading] = useState(false);
  const q = QUESTIONS[step];

  function select(idx) {
    if (fading) return;
    const newA = { ...answers, [q.id]: { idx, score: q.scores[idx], label: q.opts[idx] } };
    setAnswers(newA);
    setFading(true);
    setTimeout(() => {
      setFading(false);
      if (step === QUESTIONS.length - 1) {
        const total = Math.round(Object.values(newA).reduce((s, a) => s + a.score, 0) / QUESTIONS.length * 10);
        onComplete(total, newA);
      } else setStep(s => s + 1);
    }, 300);
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 36 }}>
        {QUESTIONS.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? C.orange : C.border, transition: "background 0.3s", boxShadow: i === step ? `0 0 8px ${C.orange}80` : "none" }} />)}
      </div>
      <div style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(12px)" : "translateY(0)", transition: "all 0.28s" }}>
        <div style={{ fontSize: 40, marginBottom: 18 }}>{q.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.cream, marginBottom: 8, lineHeight: 1.35, fontFamily: "'Fraunces', serif", letterSpacing: -0.3 }}>{q.label}</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 32, letterSpacing: 1.5, textTransform: "uppercase" }}>Question {step + 1} / {QUESTIONS.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.opts.map((opt, i) => {
            const sel = answers[q.id]?.idx === i;
            return (
              <button key={i} onClick={() => select(i)} style={{ padding: "15px 20px", borderRadius: 14, textAlign: "left", cursor: "pointer", border: `1px solid ${sel ? C.orange : C.border}`, background: sel ? C.orangeDim : C.bgCard, color: sel ? C.cream : C.textSec, fontSize: 14, fontWeight: sel ? 600 : 400, transition: "all 0.18s", display: "flex", alignItems: "center", gap: 14, boxShadow: sel ? `0 0 20px ${C.orange}30, inset 0 1px 0 ${C.orange}20` : "none", fontFamily: "'Outfit', sans-serif" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sel ? C.orange : C.textMuted}`, background: sel ? C.orange : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: sel ? `0 0 10px ${C.orange}50` : "none" }}>
                  {sel && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "block" }} />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

async function callClaude(messages, system) {
  if (!ANTHROPIC_KEY) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
    });
    const d = await res.json();
    return d.content?.[0]?.text || null;
  } catch { return null; }
}

function staticTip(score) {
  if (score >= 75) return "Tu es en pleine forme ! C'est le moment idéal pour avancer sur un projet important ou planifier quelque chose qui te tient à cœur.";
  if (score >= 50) return "Quelques signaux de fatigue. Essaie la technique 4-7-8 : inspire 4 secondes, retiens 7, expire lentement sur 8. Répète 3 fois.";
  return "Ton corps et ton esprit demandent du repos. Accorde-toi 20 minutes sans écran et parle à quelqu'un de confiance si tu en ressens le besoin.";
}

function AICoach({ user, todayScore, answers }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: `Bonjour ${user.prenom} ! 🦊 Je suis ton coach bien-être MindGuard. ${todayScore != null ? `Ton score de ${todayScore}/100 aujourd'hui m'indique que` + (todayScore >= 75 ? " tu es en bonne forme !" : todayScore >= 50 ? " tu traverses une période un peu chargée." : " tu as besoin de soutien.") : ""} Comment puis-je t'aider ?` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const system = `Tu es le coach bien-être IA de MindGuard, incarné par le renard 🦊 — symbole d'intelligence et de bienveillance.
Utilisateur : ${user.prenom}. Score aujourd'hui : ${todayScore ?? "pas encore fait"}/100.
${answers ? `Détail : sommeil=${answers.sleep?.label}, énergie=${answers.energy?.label}, humeur=${answers.mood?.label}, stress=${answers.stress?.label}, social=${answers.social?.label}` : ""}
Règles : jamais de diagnostic médical. Si détresse grave → oriente vers 3114. Conseils concrets basés sur TCC/pleine conscience. Français uniquement. Chaleureux et direct. 2-4 phrases max.`;

  async function send() {
    if (!input.trim() || loading) return;
    const txt = input.trim();
    setInput("");
    const newMsgs = [...msgs, { role: "user", content: txt }];
    setMsgs(newMsgs);
    setLoading(true);
    const reply = await callClaude(newMsgs.map(m => ({ role: m.role, content: m.content })), system);
    setMsgs(m => [...m, { role: "assistant", content: reply || `Pour activer le vrai coach IA Claude 🦊, ajoute ta clé API Anthropic dans Dashboard.jsx (ligne ANTHROPIC_KEY). Obtiens-la sur console.anthropic.com` }]);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${C.forest} 0%, ${C.orangeDim} 100%)`, border: `1.5px solid ${C.orange}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 4px 16px ${C.orange}30` }}>🦊</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.cream }}>Coach MindGuard</div>
          <div style={{ fontSize: 11, color: ANTHROPIC_KEY ? C.greenBright : C.amber }}>{ANTHROPIC_KEY ? "● Connecté · Claude AI" : "● Mode démo · Clé API requise"}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            {m.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.forest}, ${C.orangeDim})`, border: `1px solid ${C.orange}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, marginRight: 10, marginTop: 2 }}>🦊</div>}
            <div style={{ maxWidth: "78%", padding: "13px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${C.forest}, ${C.orange}80)` : C.bgCard, border: m.role === "user" ? "none" : `1px solid ${C.border}`, color: C.text, fontSize: 13.5, lineHeight: 1.75, boxShadow: m.role === "user" ? `0 4px 16px ${C.orange}30` : "none" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.forest}, ${C.orangeDim})`, border: `1px solid ${C.orange}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🦊</div>
            <div style={{ padding: "13px 18px", borderRadius: "18px 18px 18px 4px", background: C.bgCard, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.orange, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input style={{ flex: 1, padding: "13px 18px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.bgCard, color: C.text, fontSize: 13, outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" }}
          placeholder="Pose ta question au renard..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
        <button onClick={send} disabled={!input.trim() || loading} style={{ padding: "0 18px", borderRadius: 14, background: input.trim() ? `linear-gradient(135deg, ${C.forest}, ${C.orange})` : C.border, color: C.cream, border: "none", cursor: input.trim() ? "pointer" : "not-allowed", fontSize: 18, boxShadow: input.trim() ? `0 4px 16px ${C.orange}40` : "none" }}>↑</button>
      </div>
      <div style={{ fontSize: 10.5, color: C.textMuted, textAlign: "center", marginTop: 8 }}>MindGuard AI n'est pas médecin · Détresse : <strong style={{ color: C.text }}>3114</strong></div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.2);opacity:1} }`}</style>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [screen, setScreen] = useState("home");
  const [todayScore, setTodayScore] = useState(null);
  const [todayAnswers, setTodayAnswers] = useState(null);
  const [aiTip, setAiTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [history, setHistory] = useState([
    { day: "Lun", score: null }, { day: "Mar", score: null }, { day: "Mer", score: null },
    { day: "Jeu", score: null }, { day: "Ven", score: null }, { day: "Sam", score: null }, { day: "Auj", score: null },
  ]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { if (user?.token) loadData(); }, []);

  async function loadData() {
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const checkins = await supabase.dbFetch("checkins", "GET", null, `?user_id=eq.${user.id}&date=gte.${since}&order=date.desc&select=*`, user.token);
      if (Array.isArray(checkins) && checkins.length > 0) {
        const todayCheckin = checkins.find(c => c.date === today);
        if (todayCheckin) { setTodayScore(todayCheckin.score); setTodayAnswers(todayCheckin.answers); if (todayCheckin.ai_tip) setAiTip(todayCheckin.ai_tip); }
        const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Auj"];
        setHistory(days.map((day, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          const match = checkins.find(c => c.date === d.toISOString().split("T")[0]);
          return { day, score: match?.score ?? null };
        }));
      }
    } catch (e) { console.error(e); }
  }

  async function generateTip(score, answers) {
    setTipLoading(true);
    const system = `Tu es MindGuard AI 🦊. Génère UN conseil bien-être court (2 phrases max), concret et actionnable, en français. Pas de diagnostic médical.`;
    const msg = `Utilisateur : ${user.prenom}. Score : ${score}/100. Sommeil=${answers.sleep?.label}, Énergie=${answers.energy?.label}, Humeur=${answers.mood?.label}, Stress=${answers.stress?.label}.`;
    const tip = await callClaude([{ role: "user", content: msg }], system) || staticTip(score);
    setAiTip(tip); setTipLoading(false); return tip;
  }

  async function handleCheckin(score, answers) {
    setTodayScore(score); setTodayAnswers(answers); setScreen("result");
    const tip = await generateTip(score, answers);
    if (user?.token && user?.id) {
      try {
        await supabase.dbFetch("checkins", "POST", { user_id: user.id, date: today, score, answers, risk_level: score >= 75 ? "low" : score >= 50 ? "medium" : "high", ai_tip: tip }, "", user.token);
        loadData();
      } catch (e) { console.error(e); }
    }
  }

  const weekAvg = Math.round(history.filter(d => d.score != null && d.day !== "Auj").reduce((s, d, _, a) => s + d.score / a.length, 0));
  const todayDate = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text, maxWidth: 430, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      {/* Atmospheric glow */}
      <div style={{ position: "fixed", top: -100, right: -50, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.orange}15 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ padding: "18px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.forest} 0%, #0D2018 100%)`, border: `1.5px solid ${C.orange}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 14px ${C.orange}25` }}>🦊</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, fontFamily: "'Fraunces', serif", color: C.cream }}>MindGuard</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>Bonjour, {user.prenom} {user.plan === "premium" ? "⭐" : ""}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textSec, padding: "6px 14px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>Déco</button>
      </div>

      <div style={{ padding: "14px 20px 110px", animation: "fadeUp 0.4s ease-out" }}>

        {/* HOME */}
        {screen === "home" && (
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 22, textTransform: "capitalize", letterSpacing: 0.3 }}>{todayDate}</div>

            {/* Hero card */}
            <div style={{ background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.forest}40 50%, ${C.orangeDim} 100%)`, border: `1px solid ${C.borderLight}`, borderRadius: 22, padding: 22, marginBottom: 16, display: "flex", alignItems: "center", gap: 20, boxShadow: `0 8px 40px ${C.orange}15, 0 2px 0 ${C.orange}20 inset` }}>
              <ScoreRing score={todayScore} size={96} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Bien-être · Aujourd'hui</div>
                <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 5, letterSpacing: -0.3, lineHeight: 1.3, fontFamily: "'Fraunces', serif", color: C.cream }}>
                  {todayScore == null ? "Bilan en attente 🦊" : todayScore >= 75 ? "Tu es en forme ! 🌟" : todayScore >= 50 ? "Reste vigilant(e) ⚠️" : "Prends soin de toi 💙"}
                </div>
                {weekAvg > 0 && <div style={{ fontSize: 11, color: C.textMuted }}>Moyenne semaine : {weekAvg}/100</div>}
              </div>
            </div>

            {/* CTA */}
            {todayScore == null ? (
              <button onClick={() => setScreen("checkin")} style={{ width: "100%", padding: 17, borderRadius: 18, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.forest} 0%, ${C.orange} 100%)`, color: C.cream, fontSize: 15, fontWeight: 700, marginBottom: 16, boxShadow: `0 8px 32px ${C.orange}40, 0 1px 0 ${C.orangeLight}60 inset`, fontFamily: "'Outfit', sans-serif", letterSpacing: 0.2 }}>
                🦊 Faire mon bilan du jour — 5 questions
              </button>
            ) : (
              <button onClick={() => setScreen("result")} style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.borderLight}`, cursor: "pointer", background: C.bgCard, color: C.orange, fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
                Voir mon résultat du jour →
              </button>
            )}

            {/* Conseil IA */}
            {(aiTip || tipLoading) && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.borderLight}`, borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>🦊</span>
                  <div style={{ fontSize: 11, color: C.orange, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Conseil du jour</div>
                </div>
                {tipLoading ? <div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div>
                  : <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{aiTip}</div>}
              </div>
            )}

            {/* Alerte */}
            {todayScore != null && todayScore < 50 && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠️ Alerte précoce</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>Ton score est bas. Si tu te sens dépassé(e), appelle le <strong style={{ color: C.cream }}>3114</strong> (gratuit, 24h/24).</div>
              </div>
            )}

            {/* Graphique */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Fraunces', serif", color: C.cream }}>Cette semaine</div>
                {weekAvg > 0 && <div style={{ fontSize: 11, color: C.textMuted }}>Moy. {weekAvg}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>{history.map((d, i) => <HistBar key={i} day={d.day} score={d.score} isToday={d.day === "Auj"} />)}</div>
            </div>
          </div>
        )}

        {/* CHECK-IN */}
        {screen === "checkin" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 6 }}>
              <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: C.textSec, fontSize: 24, cursor: "pointer", lineHeight: 1, padding: 0 }}>←</button>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.cream }}>Bilan du jour</div>
            </div>
            <CheckIn onComplete={handleCheckin} />
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && todayScore != null && (
          <div style={{ paddingTop: 14 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 20, letterSpacing: 2.5, textTransform: "uppercase" }}>Résultat du jour</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}><ScoreRing score={todayScore} size={130} /></div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 12, fontFamily: "'Fraunces', serif", color: C.cream }}>
                {todayScore >= 75 ? "Bonne forme ! 🌟" : todayScore >= 50 ? "Reste vigilant(e) ⚠️" : "Prends soin de toi 💙"}
              </div>
              <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.8, maxWidth: 320, margin: "0 auto" }}>
                {todayScore >= 75 ? "Ton état mental est solide aujourd'hui. Continue à cultiver tes bonnes habitudes." : todayScore >= 50 ? "Quelques signaux de fatigue. Accorde-toi du repos et réduis les sources de stress." : "Des signes de surmenage sont présents. Il est important de chercher du soutien."}
              </div>
            </div>

            {todayAnswers && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 16, letterSpacing: 1.5, textTransform: "uppercase" }}>Détail du bilan</div>
                {QUESTIONS.map(q => {
                  const ans = todayAnswers[q.id];
                  const col = ans?.score >= 7 ? C.greenBright : ans?.score >= 4 ? C.amber : C.red;
                  return (
                    <div key={q.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{q.emoji}</span>
                        <span style={{ fontSize: 12.5, color: C.textSec }}>{q.label.slice(0, 30)}...</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{ans?.label || "—"}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {todayScore < 50 && <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠️ Alerte précoce</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>Si tu te sens dépassé(e), appelle le <strong style={{ color: C.cream }}>3114</strong> (gratuit, 24h/24).</div>
            </div>}

            {(aiTip || tipLoading) && <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span>🦊</span>
                <div style={{ fontSize: 11, color: C.orange, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Recommandation</div>
              </div>
              {tipLoading ? <div style={{ fontSize: 13, color: C.textMuted }}>Génération en cours...</div> : <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{aiTip}</div>}
            </div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setScreen("ai")} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.orangeDim, color: C.orange, border: `1px solid ${C.orange}40`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Coach 🦊 →</button>
              <button onClick={() => setScreen("home")} style={{ flex: 1, padding: 14, borderRadius: 14, background: `linear-gradient(135deg, ${C.forest}, ${C.orange})`, color: C.cream, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: `0 4px 16px ${C.orange}40` }}>Accueil</button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {screen === "history" && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 22, fontFamily: "'Fraunces', serif", color: C.cream }}>Historique</div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 }}>7 derniers jours</div>
              <div style={{ display: "flex", gap: 6 }}>{history.map((d, i) => <HistBar key={i} day={d.day} score={d.score} isToday={d.day === "Auj"} />)}</div>
            </div>
            {[...history].reverse().filter(d => d.score != null).map((d, i) => (
              <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.cream }}>{d.day === "Auj" ? "Aujourd'hui" : d.day}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Risque {risk(d.score).label}</div>
                </div>
                <ScoreRing score={d.score} size={46} />
              </div>
            ))}
            {history.every(d => d.score == null) && <div style={{ textAlign: "center", padding: 40, color: C.textMuted, fontSize: 13 }}>Aucun bilan cette semaine.<br />Fais ton premier check-in ! 🦊</div>}
            <div style={{ background: C.orangeDim, border: `1px solid ${C.orange}30`, borderRadius: 14, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: C.orange, fontWeight: 700, marginBottom: 5 }}>⭐ Premium — Historique illimité</div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>Accède à 1 an d'historique complet et des rapports PDF pour ton médecin.</div>
            </div>
          </div>
        )}

        {screen === "ai" && <AICoach user={user} todayScore={todayScore} answers={todayAnswers} />}

        {/* RESOURCES */}
        {screen === "resources" && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 22, fontFamily: "'Fraunces', serif", color: C.cream }}>Ressources</div>
            {[
              { title: "Respiration 4-7-8", desc: "Technique anti-stress validée cliniquement", emoji: "🌬️", color: C.greenBright },
              { title: "Méditation guidée 5 min", desc: "Pleine conscience pour réduire l'anxiété", emoji: "🧘", color: C.orange },
              { title: "Journal de gratitude", desc: "3 choses positives du jour — impact prouvé", emoji: "📝", color: C.amber },
              { title: "Trouver un psychologue", desc: "Annuaire certifié près de chez toi", emoji: "🤝", color: C.cream },
            ].map((r, i) => (
              <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${r.color}18`, border: `1px solid ${r.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.cream, marginBottom: 3 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{r.desc}</div>
                </div>
                <div style={{ fontSize: 18, color: C.textMuted }}>›</div>
              </div>
            ))}
            <div style={{ background: `linear-gradient(135deg, ${C.forest}80, ${C.orangeDim})`, border: `1px solid ${C.orange}40`, borderRadius: 18, padding: 22, marginTop: 8, marginBottom: 14 }}>
              <div style={{ fontSize: 14, color: C.orange, fontWeight: 700, marginBottom: 8, fontFamily: "'Fraunces', serif" }}>🦊 Premium · 7,99€/mois</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75, marginBottom: 18 }}>Coach IA illimité · Historique complet · Rapports PDF · Alertes avancées · Séances guidées</div>
              <button style={{ padding: "13px 26px", borderRadius: 12, background: `linear-gradient(135deg, ${C.forest}, ${C.orange})`, color: C.cream, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: `0 4px 16px ${C.orange}40` }}>Essai 7 jours gratuits →</button>
            </div>
            <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 13, color: C.red, fontWeight: 700, marginBottom: 8 }}>🆘 Urgence</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75 }}>
                <strong style={{ color: C.cream }}>3114</strong> — Prévention suicide (gratuit, 24h/24)<br />
                <strong style={{ color: C.cream }}>15</strong> — SAMU · <strong style={{ color: C.cream }}>3114.fr</strong> — Chat
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${C.bgCard}F0`, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0 22px", backdropFilter: "blur(20px)" }}>
        {NAV.map(tab => {
          const active = screen === tab.id || (tab.id === "checkin" && screen === "result");
          return (
            <button key={tab.id} onClick={() => setScreen(tab.id === "checkin" && todayScore != null ? "result" : tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: active ? C.orange : C.textMuted, fontFamily: "'Outfit', sans-serif", transition: "color 0.2s", padding: "0 10px" }}>
              <span style={{ fontSize: 18, transition: "transform 0.2s, filter 0.2s", transform: active ? "scale(1.25)" : "scale(1)", filter: active ? `drop-shadow(0 0 6px ${C.orange})` : "none" }}>{tab.icon}</span>
              <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 400, letterSpacing: 0.5, textTransform: "uppercase" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
