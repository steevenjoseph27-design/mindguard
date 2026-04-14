import { useState } from "react";

const C = {
  bg: "#0D1117", card: "#161B22", cardBorder: "#21262D",
  purple: "#7C6FE0", purpleLight: "#A89FF0", purpleDim: "#1E1A3A",
  green: "#3FB68A", greenDim: "#0E2A1F",
  amber: "#E8A838", amberDim: "#2A1E08",
  red: "#E05555", redDim: "#2A0E0E",
  text: "#E6EDF3", textSec: "#8B949E", textMuted: "#484F58",
};

const QUESTIONS = [
  { id: "sleep",  icon: "◑", label: "Comment as-tu dormi cette nuit ?",        options: ["Très mal","Mal","Moyen","Bien","Très bien"],       scores: [0,2,5,8,10] },
  { id: "energy", icon: "⚡", label: "Ton niveau d'énergie ce matin ?",          options: ["Épuisé","Fatigué","Neutre","Énergique","Plein d'énergie"], scores: [0,2,5,8,10] },
  { id: "mood",   icon: "◎", label: "Comment tu te sens émotionnellement ?",    options: ["Très bas","Bas","Neutre","Bien","Excellent"],      scores: [0,2,5,8,10] },
  { id: "stress", icon: "◈", label: "Ton niveau de stress aujourd'hui ?",       options: ["Extrême","Élevé","Modéré","Faible","Aucun"],       scores: [0,2,5,8,10] },
  { id: "social", icon: "◉", label: "As-tu envie de voir des gens ?",           options: ["Pas du tout","Plutôt non","Indifférent","Oui","Absolument"], scores: [0,2,5,8,10] },
];

const TIPS = [
  "Une marche de 10 min réduit le cortisol de 15%. Essaie avant 10h.",
  "Ton pattern de sommeil suggère un coucher trop tardif. Vise 22h30 ce soir.",
  "3 respirations profondes (4-7-8) avant chaque réunion stressante.",
  "Ton humeur est corrélée avec ton activité sociale. Appelle quelqu'un aujourd'hui.",
  "Désactive les notifications de 12h à 14h — ton pic de stress correspond à cette heure.",
];

const HISTORY = [
  { day: "Lun", score: 68 }, { day: "Mar", score: 74 },
  { day: "Mer", score: 61 }, { day: "Jeu", score: 55 },
  { day: "Ven", score: 70 }, { day: "Sam", score: 82 },
  { day: "Auj", score: null },
];

const RESOURCES = [
  { title: "Respiration 4-7-8", desc: "Technique anti-stress en 3 cycles",    icon: "◎", color: C.green, bg: C.greenDim },
  { title: "Méditation 5 min",  desc: "Pleine conscience guidée",             icon: "◑", color: C.purple, bg: C.purpleDim },
  { title: "Journal de gratitude", desc: "3 choses positives du jour",         icon: "◈", color: C.amber, bg: C.amberDim },
  { title: "Contacter un pro",  desc: "Trouver un psychologue près de toi",   icon: "◉", color: C.red, bg: C.redDim },
];

function getRisk(score) {
  if (score === null) return { label: "—", color: C.textMuted };
  if (score >= 75) return { label: "Faible", color: C.green };
  if (score >= 50) return { label: "Modéré", color: C.amber };
  return { label: "Élevé", color: C.red };
}

function getRiskBg(score) {
  if (score >= 75) return C.greenDim;
  if (score >= 50) return C.amberDim;
  return C.redDim;
}

function ScoreRing({ score, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score !== null ? score / 100 : 0;
  const risk = getRisk(score);
  const stroke = score === null ? C.cardBorder : score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.cardBorder} strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={stroke} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size > 60 ? 20 : 13, fontWeight: 700, color: score !== null ? stroke : C.textMuted, fontFamily: "'DM Mono', monospace" }}>
          {score !== null ? score : "?"}
        </span>
        {size > 60 && <span style={{ fontSize: 10, color: risk.color, marginTop: 1 }}>{risk.label}</span>}
      </div>
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
    const newA = { ...answers, [q.id]: { idx, score: q.scores[idx] } };
    setAnswers(newA);
    setFading(true);
    setTimeout(() => {
      setFading(false);
      if (step === QUESTIONS.length - 1) {
        const total = Math.round(Object.values(newA).reduce((s, a) => s + a.score, 0) / QUESTIONS.length * 10);
        onComplete(total, newA);
      } else {
        setStep(s => s + 1);
      }
    }, 380);
  }

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? C.purple : C.cardBorder, transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(8px)" : "translateY(0)", transition: "all 0.3s" }}>
        <div style={{ fontSize: 26, marginBottom: 12 }}>{q.icon}</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.4, fontFamily: "'Playfair Display', serif" }}>{q.label}</div>
        <div style={{ fontSize: 12, color: C.textSec, marginBottom: 24 }}>Question {step + 1} sur {QUESTIONS.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const sel = answers[q.id]?.idx === i;
            return (
              <button key={i} onClick={() => select(i)} style={{
                padding: "13px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: `0.5px solid ${sel ? C.purple : C.cardBorder}`,
                background: sel ? C.purpleDim : C.card,
                color: sel ? C.purpleLight : C.textSec,
                fontSize: 14, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${sel ? C.purple : C.textMuted}`, background: sel ? C.purple : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sel && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
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

function HistBar({ day, score, isToday }) {
  const maxH = 64;
  const h = score !== null ? Math.round((score / 100) * maxH) : 0;
  const col = score !== null ? (score >= 75 ? C.green : score >= 50 ? C.amber : C.red) : C.textMuted;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'DM Mono', monospace" }}>{score !== null ? score : "—"}</div>
      <div style={{ width: "100%", height: maxH, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ width: isToday ? "80%" : "60%", height: score !== null ? h : 4, background: score !== null ? col : C.cardBorder, borderRadius: 4, opacity: isToday ? 1 : 0.7, transition: "height 0.8s ease", border: isToday ? `1px solid ${col}` : "none" }} />
      </div>
      <div style={{ fontSize: 11, color: isToday ? C.text : C.textSec, fontWeight: isToday ? 600 : 400 }}>{day}</div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [screen, setScreen] = useState("home");
  const [todayScore, setTodayScore] = useState(null);
  const [todayAnswers, setTodayAnswers] = useState(null);
  const [history, setHistory] = useState(HISTORY);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  function handleCheckin(score, answers) {
    setTodayScore(score);
    setTodayAnswers(answers);
    setHistory(h => h.map(d => d.day === "Auj" ? { ...d, score } : d));
    setScreen("result");
  }

  const risk = getRisk(todayScore);
  const weekAvg = history.filter(d => d.score !== null).reduce((s, d, _, a) => s + d.score / a.length, 0);

  const NAV = [
    { id: "home", label: "Accueil", icon: "◉" },
    { id: "checkin", label: "Check-in", icon: "◈" },
    { id: "history", label: "Historique", icon: "◑" },
    { id: "resources", label: "Ressources", icon: "◎" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text, maxWidth: 420, margin: "0 auto", position: "relative" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>MindGuard</div>
          <div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.purpleDim, border: `1px solid ${C.purple}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.purpleLight, fontWeight: 600 }}>
            {user.prenom?.[0]?.toUpperCase() || "M"}
          </div>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Déco.</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px 100px" }}>

        {/* HOME */}
        {screen === "home" && (
          <div>
            <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 20, padding: 20, marginTop: 20, marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
              <ScoreRing score={todayScore} size={88} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 4 }}>Score bien-être</div>
                {todayScore !== null ? (
                  <>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                      {todayScore >= 75 ? "Tu vas bien !" : todayScore >= 50 ? "Vigilance modérée" : "Attention requise"}
                    </div>
                    <div style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 20, background: getRiskBg(todayScore), color: risk.color, border: `0.5px solid ${risk.color}` }}>
                      Risque {risk.label}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>Bonjour, {user.prenom} !</div>
                    <div style={{ fontSize: 12, color: C.textSec }}>Fais ton bilan du jour</div>
                  </>
                )}
              </div>
            </div>

            {/* Signaux */}
            {todayScore !== null && todayAnswers && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {QUESTIONS.map(q => {
                  const ans = todayAnswers[q.id];
                  const s = ans?.score ?? 0;
                  const col = s >= 8 ? C.green : s >= 5 ? C.amber : C.red;
                  return (
                    <div key={q.id} style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderLeft: `2px solid ${col}`, borderRadius: 12, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: C.textSec, marginBottom: 3 }}>{q.icon} {q.id.charAt(0).toUpperCase() + q.id.slice(1)}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: col }}>{ans ? q.options[ans.idx] : "—"}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {todayScore === null && (
              <button onClick={() => setScreen("checkin")} style={{ width: "100%", padding: 15, borderRadius: 16, background: C.purple, color: "#fff", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                Commencer le check-in du jour
              </button>
            )}

            <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.purple, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Conseil IA</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{tip}</div>
            </div>

            <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Cette semaine</div>
                {weekAvg > 0 && <div style={{ fontSize: 12, color: C.textSec, fontFamily: "'DM Mono', monospace" }}>Moy. {Math.round(weekAvg)}</div>}
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
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: C.textSec, fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Bilan du jour</div>
            </div>
            <CheckIn onComplete={handleCheckin} />
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && todayScore !== null && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Résultat du jour</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <ScoreRing score={todayScore} size={120} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'Playfair Display', serif", color: C.text, marginBottom: 8 }}>
                {todayScore >= 75 ? "Bonne forme !" : todayScore >= 50 ? "Sois vigilant" : "Prends soin de toi"}
              </div>
              <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                {todayScore >= 75
                  ? "Ton état mental est solide aujourd'hui. Continue à maintenir tes bonnes habitudes."
                  : todayScore >= 50
                  ? "Quelques signaux de fatigue détectés. Accorde-toi du repos et réduis les sources de stress."
                  : "Des signes de surmenage sont présents. Il est important de prendre du recul et de te reposer."}
              </div>
            </div>

            {todayScore < 50 && (
              <div style={{ background: C.redDim, border: `0.5px solid ${C.red}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 6 }}>Alerte précoce</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>Ton score est bas. Si tu te sens dépassé(e), parle à un médecin ou appelle le 3114 (numéro national prévention suicide, gratuit 24h/24).</div>
              </div>
            )}

            <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.purple, marginBottom: 8, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Recommandation IA</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{tip}</div>
            </div>

            <button onClick={() => setScreen("home")} style={{ width: "100%", padding: 14, borderRadius: 14, background: C.purple, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Retour au tableau de bord
            </button>
          </div>
        )}

        {/* HISTORY */}
        {screen === "history" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Historique</div>
            <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>Scores — 7 derniers jours</div>
              <div style={{ display: "flex", gap: 6 }}>
                {history.map((d, i) => <HistBar key={i} day={d.day} score={d.score} isToday={d.day === "Auj"} />)}
              </div>
            </div>
            {history.filter(d => d.score !== null).map((d, i) => (
              <div key={i} style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 14, padding: "12px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{d.day === "Auj" ? "Aujourd'hui" : d.day}</div>
                  <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>Risque {getRisk(d.score).label}</div>
                </div>
                <ScoreRing score={d.score} size={44} />
              </div>
            ))}
          </div>
        )}

        {/* RESOURCES */}
        {screen === "resources" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Ressources</div>
            {RESOURCES.map((r, i) => (
              <div key={i} style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: r.color, flexShrink: 0 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{r.desc}</div>
                </div>
                <div style={{ color: C.textMuted, fontSize: 18 }}>›</div>
              </div>
            ))}
            <div style={{ background: C.purpleDim, border: `0.5px solid ${C.purple}`, borderRadius: 16, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: C.purpleLight, fontWeight: 600, marginBottom: 6 }}>Premium — Coach IA personnalisé</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5, marginBottom: 12 }}>Accède à des séances guidées, un suivi personnalisé et des rapports détaillés.</div>
              <button style={{ padding: "10px 20px", borderRadius: 10, background: C.purple, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Essayer 7 jours gratuits
              </button>
            </div>

            <div style={{ background: C.redDim, border: `0.5px solid ${C.red}`, borderRadius: 16, padding: 16, marginTop: 12 }}>
              <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 6 }}>Urgence</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>Si tu es en détresse, appelle le <strong style={{ color: C.text }}>3114</strong> (numéro national prévention suicide, gratuit, 24h/24) ou le <strong style={{ color: C.text }}>15</strong> (SAMU).</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: C.card, borderTop: `0.5px solid ${C.cardBorder}`, display: "flex", justifyContent: "space-around", padding: "10px 0 16px" }}>
        {NAV.map(tab => {
          const active = screen === tab.id || (tab.id === "checkin" && screen === "result");
          return (
            <button key={tab.id} onClick={() => setScreen(tab.id === "checkin" && todayScore !== null ? "result" : tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: active ? C.purple : C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
