import { useState, useEffect, useRef } from "react";
import { supabase } from "./App";

const C = {
  bg: "#080C18", card: "#0D1220", cardBorder: "#151D30", cardHover: "#111827",
  accent: "#6C63FF", accentLight: "#9B95FF", accentDim: "#11103A",
  green: "#10B981", greenDim: "#062016",
  amber: "#F59E0B", amberDim: "#1C1200",
  red: "#EF4444", redDim: "#1A0808",
  text: "#F0F4FF", textSec: "#7A8499", textMuted: "#2E3A52",
};

// ⚠️ Remplace par ta vraie clé API Anthropic (console.anthropic.com)
// En production, utilise une variable d'environnement Vercel : import.meta.env.VITE_ANTHROPIC_KEY
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
  { id: "ai",        icon: "✦",  label: "Coach IA" },
  { id: "resources", icon: "❤",  label: "Aide" },
];

function risk(score) {
  if (score == null) return { label: "—", color: C.textMuted };
  if (score >= 75) return { label: "Faible", color: C.green };
  if (score >= 50) return { label: "Modéré", color: C.amber };
  return { label: "Élevé", color: C.red };
}

function ScoreRing({ score, size = 90 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? score / 100 : 0;
  const rk = risk(score);
  const stroke = score == null ? C.cardBorder : score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.cardBorder} strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={stroke} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size > 60 ? 20 : 13, fontWeight: 800, color: stroke, letterSpacing: -1 }}>
          {score != null ? score : "?"}
        </span>
        {size > 60 && <span style={{ fontSize: 10, color: rk.color, marginTop: 1, fontWeight: 600 }}>{rk.label}</span>}
      </div>
    </div>
  );
}

function HistBar({ day, score, isToday }) {
  const h = score != null ? Math.max(8, (score / 100) * 80) : 6;
  const col = score == null ? C.textMuted : score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ fontSize: 10, color: isToday ? C.accent : C.textMuted, fontWeight: isToday ? 700 : 400 }}>{score != null ? score : "—"}</div>
      <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ width: "80%", height: h, borderRadius: "3px 3px 0 0", background: isToday ? `${C.accent}44` : col, border: isToday ? `1.5px dashed ${C.accent}` : "none", transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
      <div style={{ fontSize: 10, color: isToday ? C.accent : C.textMuted, fontWeight: isToday ? 700 : 400 }}>{day}</div>
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
    }, 320);
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
        {QUESTIONS.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? C.accent : C.cardBorder, transition: "background 0.3s", boxShadow: i === step ? `0 0 8px ${C.accent}` : "none" }} />)}
      </div>
      <div style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)", transition: "all 0.28s" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>{q.emoji}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.4, letterSpacing: -0.3 }}>{q.label}</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 30, letterSpacing: 1 }}>QUESTION {step + 1} / {QUESTIONS.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.opts.map((opt, i) => {
            const sel = answers[q.id]?.idx === i;
            return (
              <button key={i} onClick={() => select(i)} style={{ padding: "14px 18px", borderRadius: 14, textAlign: "left", cursor: "pointer", border: `1px solid ${sel ? C.accent : C.cardBorder}`, background: sel ? C.accentDim : C.card, color: sel ? C.accentLight : C.textSec, fontSize: 14, fontWeight: sel ? 600 : 400, transition: "all 0.18s", display: "flex", alignItems: "center", gap: 12, boxShadow: sel ? `0 0 20px ${C.accent}30` : "none" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sel ? C.accent : C.textMuted}`, background: sel ? C.accent : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s" }}>
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
  if (score >= 75) return "Tu es en forme aujourd'hui ! C'est le bon moment pour avancer sur quelque chose d'important ou de planifier une activité qui te fait plaisir.";
  if (score >= 50) return "Quelques signaux de fatigue détectés. Essaie la technique 4-7-8 : inspire 4 secondes, retiens 7, expire lentement sur 8. Répète 3 fois.";
  return "Des signes de surmenage sont présents. Accorde-toi 20 minutes de repos sans écran, et n'hésite pas à en parler à quelqu'un de confiance.";
}

function AICoach({ user, todayScore, answers }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: `Bonjour ${user.prenom} ! Je suis ton coach bien-être IA. ${todayScore != null ? `J'ai vu ton score de ${todayScore}/100 aujourd'hui.` : ""} Comment puis-je t'aider ? 🧠` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const system = `Tu es MindGuard AI, coach bien-être bienveillant basé sur Claude.
Utilisateur : ${user.prenom}, score aujourd'hui : ${todayScore ?? "pas encore fait"}/100${answers ? `, détail : sommeil=${answers.sleep?.label}, énergie=${answers.energy?.label}, humeur=${answers.mood?.label}, stress=${answers.stress?.label}, social=${answers.social?.label}` : ""}.
Règles : Tu n'es PAS médecin, jamais de diagnostic. Si détresse grave → oriente vers 3114. Conseils concrets, bienveillants, basés sur TCC/pleine conscience. Réponds en français, 2-4 phrases max sauf si plus demandé.`;

  async function send() {
    if (!input.trim() || loading) return;
    const txt = input.trim();
    setInput("");
    const newMsgs = [...msgs, { role: "user", content: txt }];
    setMsgs(newMsgs);
    setLoading(true);
    const reply = await callClaude(newMsgs.map(m => ({ role: m.role, content: m.content })), system);
    setMsgs(m => [...m, { role: "assistant", content: reply || `Pour activer le vrai coach IA Claude, ajoute ta clé API dans Dashboard.jsx (ligne ANTHROPIC_KEY). Obtiens-la sur console.anthropic.com 🔑` }]);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 16px ${C.accent}40` }}>✦</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Coach IA MindGuard</div>
          <div style={{ fontSize: 11, color: ANTHROPIC_KEY ? C.green : C.amber }}>● {ANTHROPIC_KEY ? "Connecté · Claude API" : "Mode démo · Ajoute ta clé API"}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            {m.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 10, marginTop: 2 }}>✦</div>}
            <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? C.accent : C.card, border: m.role === "user" ? "none" : `1px solid ${C.cardBorder}`, color: C.text, fontSize: 13.5, lineHeight: 1.75, boxShadow: m.role === "user" ? `0 4px 16px ${C.accent}40` : "none" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✦</div>
            <div style={{ padding: "12px 18px", borderRadius: "18px 18px 18px 4px", background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accentLight, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 10, paddingBottom: 4 }}>
        <input style={{ flex: 1, padding: "13px 16px", borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: C.card, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          placeholder="Pose ta question..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
        <button onClick={send} disabled={!input.trim() || loading} style={{ padding: "0 18px", borderRadius: 14, background: input.trim() ? C.accent : C.cardBorder, color: "#fff", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", fontSize: 20, transition: "background 0.2s", boxShadow: input.trim() ? `0 4px 16px ${C.accent}50` : "none" }}>↑</button>
      </div>
      <div style={{ fontSize: 10.5, color: C.textMuted, textAlign: "center", marginTop: 8, lineHeight: 1.6 }}>MindGuard AI n'est pas médecin · Détresse immédiate : <strong style={{ color: C.text }}>3114</strong></div>
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
    { day: "Lun", score: null }, { day: "Mar", score: null },
    { day: "Mer", score: null }, { day: "Jeu", score: null },
    { day: "Ven", score: null }, { day: "Sam", score: null },
    { day: "Auj", score: null },
  ]);
  const [dbLoading, setDbLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  // Charge les données depuis Supabase au démarrage
  useEffect(() => {
    if (!user?.token) return;
    loadData();
  }, []);

  async function loadData() {
    setDbLoading(true);
    try {
      // Check-ins des 7 derniers jours
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const checkins = await supabase.dbFetch("checkins", "GET", null,
        `?user_id=eq.${user.id}&date=gte.${since}&order=date.desc&select=*`, user.token);

      if (Array.isArray(checkins) && checkins.length > 0) {
        // Trouve le check-in d'aujourd'hui
        const todayCheckin = checkins.find(c => c.date === today);
        if (todayCheckin) {
          setTodayScore(todayCheckin.score);
          setTodayAnswers(todayCheckin.answers);
          if (todayCheckin.ai_tip) setAiTip(todayCheckin.ai_tip);
        }
        // Remplit l'historique
        const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Auj"];
        const newHistory = days.map((day, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split("T")[0];
          const match = checkins.find(c => c.date === dateStr);
          return { day, score: match?.score ?? null };
        });
        setHistory(newHistory);
      }
    } catch (e) { console.error("Erreur chargement données:", e); }
    setDbLoading(false);
  }

  async function generateTip(score, answers) {
    setTipLoading(true);
    const system = `Tu es MindGuard AI. Génère UN conseil bien-être court (2 phrases max), concret et actionnable, en français, sans formule de politesse. Pas de diagnostic médical.`;
    const msg = `Utilisateur : ${user.prenom}. Score bien-être : ${score}/100. Détail : sommeil=${answers.sleep?.label}, énergie=${answers.energy?.label}, humeur=${answers.mood?.label}, stress=${answers.stress?.label}, social=${answers.social?.label}.`;
    const tip = await callClaude([{ role: "user", content: msg }], system) || staticTip(score);
    setAiTip(tip);
    setTipLoading(false);
    return tip;
  }

  async function handleCheckin(score, answers) {
    setTodayScore(score);
    setTodayAnswers(answers);
    setScreen("result");

    // Génère le conseil IA
    const tip = await generateTip(score, answers);

    // Sauvegarde dans Supabase
    if (user?.token && user?.id) {
      try {
        await supabase.dbFetch("checkins", "POST", {
          user_id: user.id,
          date: today,
          score,
          answers,
          risk_level: score >= 75 ? "low" : score >= 50 ? "medium" : "high",
          ai_tip: tip,
        }, "", user.token);
        // Recharge l'historique
        loadData();
      } catch (e) { console.error("Erreur sauvegarde check-in:", e); }
    }
  }

  const weekAvg = Math.round(history.filter(d => d.score != null && d.day !== "Auj").reduce((s, d, _, a) => s + d.score / a.length, 0));
  const todayDate = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif", color: C.text, maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 14px ${C.orange}40`, overflow: 'hidden' }}><img src="/fox_logo_transparent.png" width="26" height="26" style={{objectFit:'contain',display:'block'}} /></div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>MindGuard</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>Bonjour, {user.prenom} {user.plan === "premium" ? "⭐" : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {dbLoading && <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${C.cardBorder}`, borderTop: `2px solid ${C.accent}`, animation: "spin 0.8s linear infinite" }} />}
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.cardBorder}`, color: C.textSec, padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontSize: 12 }}>Déco</button>
        </div>
      </div>

      <div style={{ padding: "14px 20px 100px" }}>

        {/* HOME */}
        {screen === "home" && (
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20, textTransform: "capitalize" }}>{todayDate}</div>

            {/* Hero score */}
            <div style={{ background: `linear-gradient(135deg, ${C.card} 0%, ${C.accentDim} 100%)`, border: `1px solid ${C.cardBorder}`, borderRadius: 22, padding: 22, marginBottom: 16, display: "flex", alignItems: "center", gap: 20, boxShadow: `0 8px 40px ${C.accent}15` }}>
              <ScoreRing score={todayScore} size={96} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Bien-être aujourd'hui</div>
                <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4, letterSpacing: -0.5, lineHeight: 1.3 }}>
                  {todayScore == null ? "Bilan en attente" : todayScore >= 75 ? "Tu es en forme ! 🌟" : todayScore >= 50 ? "Sois vigilant(e) ⚠️" : "Prends soin de toi 💙"}
                </div>
                {weekAvg > 0 && <div style={{ fontSize: 11, color: C.textMuted }}>Moy. semaine : {weekAvg}/100</div>}
              </div>
            </div>

            {/* CTA */}
            {todayScore == null ? (
              <button onClick={() => setScreen("checkin")} style={{ width: "100%", padding: 17, borderRadius: 16, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.accent}, #8B5CF6)`, color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 16, boxShadow: `0 8px 32px ${C.accent}50` }}>
                ◎ Faire mon bilan du jour — 5 questions
              </button>
            ) : (
              <button onClick={() => setScreen("result")} style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.cardBorder}`, cursor: "pointer", background: C.card, color: C.accentLight, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                Voir mon résultat du jour →
              </button>
            )}

            {/* Conseil IA */}
            {(aiTip || tipLoading) && (
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 16, boxShadow: `0 4px 20px rgba(0,0,0,0.3)` }}>
                <div style={{ fontSize: 11, color: C.accent, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>✦ Conseil IA du jour</div>
                {tipLoading ? (
                  <div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accentLight, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div>
                ) : (
                  <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{aiTip}</div>
                )}
              </div>
            )}

            {/* Alerte rouge */}
            {todayScore != null && todayScore < 50 && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠️ Alerte précoce</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>Ton score est bas. Si tu te sens dépassé(e), parle à un proche ou appelle le <strong style={{ color: C.text }}>3114</strong> (gratuit, 24h/24).</div>
              </div>
            )}

            {/* Graphique */}
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Cette semaine</div>
                {weekAvg > 0 && <div style={{ fontSize: 11, color: C.textMuted }}>Moy. {weekAvg}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {history.map((d, i) => <HistBar key={i} day={d.day} score={d.score} isToday={d.day === "Auj"} />)}
              </div>
            </div>
          </div>
        )}

        {/* CHECK-IN */}
        {screen === "checkin" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 6 }}>
              <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: C.textSec, fontSize: 24, cursor: "pointer", lineHeight: 1, padding: 0 }}>←</button>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Bilan du jour</div>
            </div>
            <CheckIn onComplete={handleCheckin} />
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && todayScore != null && (
          <div style={{ paddingTop: 14 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 18, letterSpacing: 2, textTransform: "uppercase" }}>Résultat du jour</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
                <ScoreRing score={todayScore} size={130} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12 }}>
                {todayScore >= 75 ? "Bonne forme ! 🌟" : todayScore >= 50 ? "Sois vigilant(e) ⚠️" : "Prends soin de toi 💙"}
              </div>
              <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.8, maxWidth: 320, margin: "0 auto" }}>
                {todayScore >= 75 ? "Ton état mental est solide. Continue à maintenir tes bonnes habitudes." : todayScore >= 50 ? "Quelques signaux de fatigue. Accorde-toi du repos et réduis les sources de stress." : "Des signes de surmenage sont présents. Cherche du soutien et ralentis."}
              </div>
            </div>

            {todayAnswers && (
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Détail du bilan</div>
                {QUESTIONS.map(q => {
                  const ans = todayAnswers[q.id];
                  const col = ans?.score >= 7 ? C.green : ans?.score >= 4 ? C.amber : C.red;
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

            {todayScore < 50 && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠️ Alerte précoce</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>Si tu te sens dépassé(e), parle à un médecin ou appelle le <strong style={{ color: C.text }}>3114</strong> (gratuit, 24h/24).</div>
              </div>
            )}

            {(aiTip || tipLoading) && (
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.accent, marginBottom: 10, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700 }}>✦ Recommandation IA</div>
                {tipLoading ? <div style={{ fontSize: 13, color: C.textMuted }}>Génération en cours...</div> : <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{aiTip}</div>}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setScreen("ai")} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.accentDim, color: C.accentLight, border: `1px solid ${C.accent}40`, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Coach IA →</button>
              <button onClick={() => setScreen("home")} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 16px ${C.accent}50` }}>Accueil</button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {screen === "history" && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 22, letterSpacing: -0.3 }}>Historique</div>
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>7 derniers jours</div>
              <div style={{ display: "flex", gap: 6 }}>{history.map((d, i) => <HistBar key={i} day={d.day} score={d.score} isToday={d.day === "Auj"} />)}</div>
            </div>
            {[...history].reverse().filter(d => d.score != null).map((d, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{d.day === "Auj" ? "Aujourd'hui" : d.day}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Risque {risk(d.score).label}</div>
                </div>
                <ScoreRing score={d.score} size={46} />
              </div>
            ))}
            {history.every(d => d.score == null) && (
              <div style={{ textAlign: "center", padding: 40, color: C.textMuted, fontSize: 13 }}>Aucun bilan enregistré cette semaine.<br />Fais ton premier check-in ! 😊</div>
            )}
            <div style={{ background: C.accentDim, border: `1px solid ${C.accent}30`, borderRadius: 14, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: C.accentLight, fontWeight: 700, marginBottom: 5 }}>🔒 Premium — Historique illimité</div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>Accède à 1 an d'historique, des graphiques détaillés et des rapports PDF pour ton médecin.</div>
            </div>
          </div>
        )}

        {/* AI */}
        {screen === "ai" && <AICoach user={user} todayScore={todayScore} answers={todayAnswers} />}

        {/* RESOURCES */}
        {screen === "resources" && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 22, letterSpacing: -0.3 }}>Ressources</div>
            {[
              { title: "Respiration 4-7-8", desc: "Technique anti-stress validée cliniquement", emoji: "🌬️", color: C.green },
              { title: "Méditation guidée 5 min", desc: "Pleine conscience pour réduire l'anxiété", emoji: "🧘", color: C.accent },
              { title: "Journal de gratitude", desc: "3 choses positives du jour — impact prouvé", emoji: "📝", color: C.amber },
              { title: "Trouver un psychologue", desc: "Annuaire certifié près de chez toi", emoji: "🤝", color: C.accentLight },
            ].map((r, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "border-color 0.2s" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{r.desc}</div>
                </div>
                <div style={{ fontSize: 18, color: C.textMuted }}>›</div>
              </div>
            ))}
            <div style={{ background: `linear-gradient(135deg, ${C.accentDim}, ${C.card})`, border: `1px solid ${C.accent}40`, borderRadius: 18, padding: 20, marginTop: 8, marginBottom: 14, boxShadow: `0 4px 24px ${C.accent}20` }}>
              <div style={{ fontSize: 13, color: C.accentLight, fontWeight: 700, marginBottom: 8 }}>✦ Premium · 7,99€/mois</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7, marginBottom: 16 }}>Coach IA illimité · Historique complet · Rapports PDF · Alertes avancées · Séances guidées</div>
              <button style={{ padding: "12px 24px", borderRadius: 12, background: C.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${C.accent}50` }}>Essai 7 jours gratuits →</button>
            </div>
            <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 13, color: C.red, fontWeight: 700, marginBottom: 8 }}>🆘 Urgence</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75 }}>
                <strong style={{ color: C.text }}>3114</strong> — Prévention suicide (gratuit, 24h/24, 7j/7)<br />
                <strong style={{ color: C.text }}>15</strong> — SAMU (urgences médicales)<br />
                <strong style={{ color: C.text }}>3114.fr</strong> — Chat en ligne
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${C.card}EE`, borderTop: `1px solid ${C.cardBorder}`, display: "flex", justifyContent: "space-around", padding: "10px 0 20px", backdropFilter: "blur(16px)" }}>
        {NAV.map(tab => {
          const active = screen === tab.id || (tab.id === "checkin" && screen === "result");
          return (
            <button key={tab.id} onClick={() => setScreen(tab.id === "checkin" && todayScore != null ? "result" : tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: active ? C.accent : C.textMuted, transition: "color 0.2s", padding: "0 10px" }}>
              <span style={{ fontSize: 18, transition: "transform 0.2s", transform: active ? "scale(1.2)" : "scale(1)", filter: active ? `drop-shadow(0 0 6px ${C.accent})` : "none" }}>{tab.icon}</span>
              <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 400, letterSpacing: 0.3 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.2);opacity:1} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1A2035; border-radius: 2px; }
      `}</style>
    </div>
  );
}
