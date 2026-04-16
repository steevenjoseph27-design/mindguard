import { useState } from "react";
import { supabase } from "./App";

// ─── PALETTE RENARD ───────────────────────────────────────────────────────────
const C = {
  // Backgrounds
  bg: "#080E09",           // Noir forêt profond
  bgCard: "#0D1610",       // Vert très sombre
  bgCardHover: "#111D13",
  border: "#1C2E1E",       // Bordure verte sombre
  borderLight: "#2A4030",

  // Brand colors — tirées du logo
  forest: "#1B3A2D",       // Vert forêt du logo
  orange: "#E8650A",       // Orange vif du logo
  orangeLight: "#F5850A",  // Orange clair
  orangeDim: "#2A1505",    // Orange très sombre
  cream: "#F5EDD6",        // Crème du logo
  creamDim: "#1A1710",

  // UI
  text: "#F0EDE6",         // Blanc crème chaud
  textSec: "#7A8C7D",      // Vert gris
  textMuted: "#2E4033",

  // States
  green: "#2D6A4F",        // Vert succès
  greenBright: "#52B788",
  greenDim: "#0A1F14",
  red: "#C1440E",
  redDim: "#1A0A05",
  amber: "#D4A017",
  amberDim: "#1A1405",
};

const inp = {
  width: "100%", padding: "14px 18px", borderRadius: 14,
  border: `1px solid ${C.border}`, background: C.bgCard,
  color: C.text, fontSize: 14, outline: "none", marginBottom: 14,
  fontFamily: "'Outfit', sans-serif", transition: "border-color 0.25s, box-shadow 0.25s",
  boxSizing: "border-box",
};

// SVG Renard inline simplifié basé sur la forme du logo
function FoxIcon({ size = 32, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Corps vert forêt */}
      <path d="M20 110 Q15 80 25 60 Q30 45 45 35 Q55 28 60 20 L70 10 Q75 5 80 15 Q85 25 75 35 Q70 40 72 50 Q75 65 65 80 Q55 95 45 105 Q35 115 20 110Z" fill="#1B3A2D"/>
      {/* Queue */}
      <path d="M20 110 Q10 100 8 85 Q6 70 15 65 Q22 62 28 70 Q35 80 30 95 Q27 105 20 110Z" fill="#1B3A2D"/>
      {/* Orange corps */}
      <path d="M35 75 Q30 65 38 55 Q45 48 55 50 Q62 53 60 65 Q58 77 48 82 Q38 85 35 75Z" fill="#E8650A"/>
      {/* Orange tête */}
      <path d="M55 28 Q58 20 65 18 Q72 16 74 25 Q76 33 68 38 Q60 42 55 36 Q52 32 55 28Z" fill="#E8650A"/>
      {/* Crème ventre */}
      <path d="M42 72 Q40 65 45 60 Q50 56 55 60 Q58 65 55 72 Q51 78 45 77 Q41 76 42 72Z" fill="#F5EDD6"/>
      {/* Queue orange */}
      <path d="M10 88 Q8 78 14 72 Q19 67 24 73 Q29 80 25 90 Q22 98 16 97 Q11 95 10 88Z" fill="#E8650A"/>
      {/* Queue crème tip */}
      <path d="M8 82 Q7 76 11 74 Q14 72 16 77 Q18 83 15 87 Q12 89 9 86 Q7 84 8 82Z" fill="#F5EDD6"/>
    </svg>
  );
}

function Check({ checked, onChange, children, color = C.orange }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 10, padding: "10px 14px", borderRadius: 12, background: checked ? `${color}12` : "transparent", border: `1px solid ${checked ? color + "50" : "transparent"}`, transition: "all 0.2s" }}>
      <div onClick={onChange} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${checked ? color : C.textMuted}`, background: checked ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: checked ? `0 0 10px ${color}40` : "none" }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: checked ? C.text : C.textSec, lineHeight: 1.6 }}>{children}</span>
    </label>
  );
}

function Modal({ title, badge, badgeColor, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.bgCard, borderRadius: "24px 24px 0 0", border: `1px solid ${C.border}`, borderBottom: "none", padding: 28, maxWidth: 460, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: "'Fraunces', serif" }}>{title}</div>
            {badge && <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: `${badgeColor || C.green}25`, color: badgeColor || C.greenBright, border: `1px solid ${badgeColor || C.green}50`, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{badge}</span>}
          </div>
          <button onClick={onClose} style={{ background: C.border, border: "none", color: C.textSec, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {children}
        <button onClick={onClose} style={{ width: "100%", padding: 14, borderRadius: 14, background: `linear-gradient(135deg, ${C.forest}, ${C.orange}80)`, color: C.cream, border: `1px solid ${C.orange}40`, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 8 }}>Fermer</button>
      </div>
    </div>
  );
}

function PrivacyModal({ onClose }) {
  const items = [
    ["1. Responsable du traitement", "MindGuard SAS — Cayenne, Guyane française — privacy@mindguard.app — Conforme au RGPD (UE 2016/679)"],
    ["2. Données collectées", "Identité : email, prénom, âge, profession. Bien-être : humeur, sommeil, stress, énergie (données sensibles Art. 9 RGPD). Technique : logs de connexion."],
    ["3. Base légale", "Compte : exécution du contrat. Bien-être : consentement explicite révocable. Options : consentement opt-in séparé pour chaque finalité."],
    ["4. Partage de données", "Aucune donnée identifiable vendue. Partage uniquement de données 100% anonymisées (k-anonymat ≥10) avec consentement opt-in explicite."],
    ["5. Vos droits RGPD", "Accès · Rectification · Suppression · Portabilité · Opposition · Retrait consentement. Contact : privacy@mindguard.app — Réponse sous 30 jours. Réclamation : cnil.fr"],
    ["6. Sécurité", "Chiffrement TLS 1.3 en transit · AES-256 au repos · Hébergement exclusif UE · Mots de passe hachés bcrypt"],
    ["7. Conservation", "Compte : durée + 30j · Bien-être : 3 ans glissants · Logs : 12 mois · Marketing : retrait + 3 ans"],
  ];
  return (
    <Modal title="Politique de confidentialité" badge="RGPD CONFORME V1.0" badgeColor={C.greenBright} onClose={onClose}>
      {items.map(([t, d], i) => (
        <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 6, letterSpacing: 0.3 }}>{t}</div>
          <div style={{ fontSize: 12.5, color: C.textSec, lineHeight: 1.75 }}>{d}</div>
        </div>
      ))}
      <div style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.amber, fontWeight: 700, marginBottom: 5 }}>⚕️ Avertissement médical important</div>
        <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.65 }}>MindGuard est un outil de bien-être et prévention. Il ne constitue pas un dispositif médical, ne pose aucun diagnostic et ne remplace pas un professionnel de santé. En cas de détresse : <strong style={{ color: C.cream }}>3114</strong> ou <strong style={{ color: C.cream }}>15</strong>.</div>
      </div>
    </Modal>
  );
}

function CGUModal({ onClose }) {
  const arts = [
    ["Art. 1 — Nature du service", "MindGuard propose un suivi quotidien du bien-être mental, un score algorithmique, des alertes précoces non médicales et des conseils personnalisés par IA."],
    ["Art. 2 — Ce que MindGuard n'est PAS", "MindGuard n'est pas un dispositif médical, ne pose aucun diagnostic, ne remplace pas un médecin ou psychologue, et n'est pas un service d'urgence."],
    ["Art. 3 — Conditions d'accès", "Réservé aux 16 ans et plus. Pour 16-18 ans : accord d'un représentant légal requis. Un compte par personne."],
    ["Art. 4 — Tarification", "Plan Gratuit : check-in, score hebdo, historique 7j. Plan Premium (7,99€/mois) : historique illimité, alertes avancées, coach IA complet, rapport PDF."],
    ["Art. 5 — Responsabilité", "MindGuard SAS n'est pas responsable des décisions prises sur la base des informations de l'app ni d'une dégradation de l'état de santé."],
    ["Art. 6 — Résiliation", "Suppression du compte à tout moment depuis les paramètres. Données effacées sous 30 jours."],
    ["Art. 7 — Droit applicable", "Droit français · Tribunaux de Cayenne (Guyane) · Médiation consommateur disponible (Art. L.612-1 C. conso)"],
  ];
  return (
    <Modal title="Conditions Générales d'Utilisation" badge="VERSION 1.0 — AVRIL 2026" badgeColor={C.orange} onClose={onClose}>
      {arts.map(([t, d], i) => (
        <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < arts.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.cream, marginBottom: 6 }}>{t}</div>
          <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>{d}</div>
        </div>
      ))}
    </Modal>
  );
}

export default function Auth({ onSuccess }) {
  const [mode, setMode] = useState("register");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", confirm: "", prenom: "", age: "", profession: "" });
  const [consents, setConsents] = useState({ cgu: false, rgpd: false, analytics_anon: false, partner_anon: false, marketing: false, research: false });
  const [modal, setModal] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tog = k => setConsents(c => ({ ...c, [k]: !c[k] }));

  function val1() {
    const e = {};
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (form.password.length < 8) e.password = "8 caractères minimum";
    if (mode === "register" && form.password !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e); return Object.keys(e).length === 0;
  }
  function val2() {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Prénom requis";
    if (!form.age || +form.age < 16 || +form.age > 120) e.age = "Âge invalide (min. 16 ans)";
    setErrors(e); return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!val1()) return;
    setLoading(true); setErrors({});
    try {
      const data = await supabase.signIn(form.email, form.password);
      if (data.error || !data.access_token) throw new Error(data.error?.message || "Email ou mot de passe incorrect");
      const profiles = await supabase.dbFetch("profiles", "GET", null, `?user_id=eq.${data.user.id}&select=*`, data.access_token);
      const profile = Array.isArray(profiles) && profiles[0] ? profiles[0] : {};
      onSuccess({ id: data.user.id, email: data.user.email, prenom: profile.prenom || data.user.email.split("@")[0], token: data.access_token, expires_at: data.expires_at, consents: profile.consents || {}, plan: profile.plan || "free" });
    } catch (err) { setErrors({ submit: err.message }); }
    setLoading(false);
  }

  async function handleRegister() {
    if (!consents.cgu || !consents.rgpd) { setErrors({ submit: "Tu dois accepter les CGU et la politique de confidentialité." }); return; }
    setLoading(true); setErrors({});
    try {
      const data = await supabase.signUp(form.email, form.password);
      if (data.error) throw new Error(data.error?.message || "Erreur lors de la création du compte");
      if (!data.user) throw new Error("Compte non créé — vérifie ton email");
      const consentRecord = { ...consents, timestamp: new Date().toISOString(), version: "1.0" };
      try {
        await supabase.dbFetch("profiles", "POST", { user_id: data.user.id, prenom: form.prenom, age: +form.age, profession: form.profession || null, consents: consentRecord, plan: consents.partner_anon ? "premium" : "free", premium_until: consents.partner_anon ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null, created_at: new Date().toISOString() }, "", data.session?.access_token);
      } catch (e) { console.warn("Profil non créé:", e); }
      onSuccess({ id: data.user.id, email: form.email, prenom: form.prenom, token: data.session?.access_token, expires_at: data.session?.expires_at, consents: consentRecord, plan: consents.partner_anon ? "premium" : "free", newUser: true });
    } catch (err) { setErrors({ submit: err.message }); }
    setLoading(false);
  }

  const steps = ["Compte", "Profil", "Confidentialité"];
  const errStyle = { fontSize: 11, color: C.red, marginTop: -10, marginBottom: 10, paddingLeft: 4 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text, position: "relative", overflow: "hidden" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        input:focus { border-color: ${C.orange} !important; box-shadow: 0 0 0 3px ${C.orange}20 !important; }
        select:focus { border-color: ${C.orange} !important; box-shadow: 0 0 0 3px ${C.orange}20 !important; }
      `}</style>

      {modal === "privacy" && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === "cgu" && <CGUModal onClose={() => setModal(null)} />}

      {/* Atmospheric background */}
      <div style={{ position: "fixed", top: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.orange}20 0%, transparent 65%)`, pointerEvents: "none", animation: "glow 4s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: -150, left: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.forest}60 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 22px 80px", minHeight: "100vh", animation: "fadeUp 0.5s ease-out" }}>

        {/* Header avec logo renard */}
        <div style={{ paddingTop: 48, paddingBottom: 40, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.forest} 0%, #0D2018 100%)`, border: `1.5px solid ${C.orange}60`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px ${C.orange}30, inset 0 1px 0 ${C.orange}20` }}>
            <FoxIcon size={30} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.8, fontFamily: "'Fraunces', serif", color: C.cream, lineHeight: 1 }}>MindGuard</div>
            <div style={{ fontSize: 10, color: C.orange, letterSpacing: 2.5, textTransform: "uppercase", marginTop: 3, fontWeight: 500 }}>Bien-être mental</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 3, background: C.bgCard, borderRadius: 16, padding: 4, marginBottom: 36, border: `1px solid ${C.border}` }}>
          {[["register", "Créer un compte"], ["login", "Se connecter"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setStep(1); setErrors({}); }} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", cursor: "pointer", background: mode === m ? `linear-gradient(135deg, ${C.forest}, ${C.orange}60)` : "transparent", color: mode === m ? C.cream : C.textSec, fontSize: 13, fontWeight: 600, transition: "all 0.25s", fontFamily: "'Outfit', sans-serif", boxShadow: mode === m ? `0 2px 12px ${C.orange}30` : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* LOGIN */}
        {mode === "login" && (
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: -1, fontFamily: "'Fraunces', serif", color: C.cream }}>Bon retour 🦊</div>
            <div style={{ fontSize: 14, color: C.textSec, marginBottom: 32, lineHeight: 1.6 }}>Reconnecte-toi pour accéder à ton espace bien-être.</div>
            <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.5, textTransform: "uppercase" }}>Email</label>
            <input style={inp} type="email" placeholder="toi@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            {errors.email && <div style={errStyle}>{errors.email}</div>}
            <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.5, textTransform: "uppercase" }}>Mot de passe</label>
            <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            {errors.password && <div style={errStyle}>{errors.password}</div>}
            {errors.submit && <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: "#E87060", lineHeight: 1.6 }}>{errors.submit}</div>}
            <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 16, borderRadius: 14, background: loading ? C.border : `linear-gradient(135deg, ${C.forest} 0%, ${C.orange} 100%)`, color: C.cream, border: "none", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: loading ? "none" : `0 6px 24px ${C.orange}40`, transition: "all 0.25s" }}>
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </div>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <div>
            {/* Steps */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, background: i + 1 < step ? C.orange : i + 1 === step ? `linear-gradient(135deg, ${C.forest}, ${C.orange})` : C.bgCard, color: i + 1 <= step ? "#fff" : C.textMuted, border: `2px solid ${i + 1 <= step ? C.orange : C.border}`, transition: "all 0.3s", boxShadow: i + 1 === step ? `0 0 20px ${C.orange}50` : "none" }}>
                      {i + 1 < step ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: i + 1 === step ? C.orange : C.textMuted, fontWeight: i + 1 === step ? 700 : 400, letterSpacing: 0.5, textTransform: "uppercase" }}>{s}</div>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: i + 1 < step ? C.orange : C.border, margin: "0 6px", marginBottom: 24, transition: "background 0.4s", borderRadius: 1 }} />}
                </div>
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, letterSpacing: -1, fontFamily: "'Fraunces', serif", color: C.cream }}>Crée ton compte</div>
                <div style={{ fontSize: 14, color: C.textSec, marginBottom: 28 }}>Ton email ne sera jamais partagé ni vendu.</div>
                {[["email", "Email", "toi@example.com", "email"], ["password", "Mot de passe", "Minimum 8 caractères", "password"], ["confirm", "Confirmer le mot de passe", "Répète ton mot de passe", "password"]].map(([key, label, placeholder, type]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</label>
                    <input style={inp} type={type} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} />
                    {errors[key] && <div style={errStyle}>{errors[key]}</div>}
                  </div>
                ))}
                <div style={{ background: C.greenDim, border: `1px solid ${C.green}50`, borderRadius: 12, padding: 13, marginBottom: 24, fontSize: 12.5, color: C.greenBright, lineHeight: 1.6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔒</span> Chiffrement bcrypt · TLS 1.3 · Serveurs Union Européenne
                </div>
                <button onClick={() => val1() && setStep(2)} style={{ width: "100%", padding: 16, borderRadius: 14, background: `linear-gradient(135deg, ${C.forest} 0%, ${C.orange} 100%)`, color: C.cream, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: `0 6px 24px ${C.orange}40` }}>
                  Continuer →
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, letterSpacing: -1, fontFamily: "'Fraunces', serif", color: C.cream }}>Ton profil</div>
                <div style={{ fontSize: 14, color: C.textSec, marginBottom: 28 }}>Pour personnaliser tes conseils. Ces informations restent privées.</div>
                <label style={{ fontSize: 11, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.8, textTransform: "uppercase" }}>Prénom *</label>
                <input style={inp} type="text" placeholder="Ton prénom" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
                {errors.prenom && <div style={errStyle}>{errors.prenom}</div>}
                <label style={{ fontSize: 11, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.8, textTransform: "uppercase" }}>Âge * (min. 16 ans)</label>
                <input style={inp} type="number" placeholder="Ton âge" value={form.age} onChange={e => set("age", e.target.value)} />
                {errors.age && <div style={errStyle}>{errors.age}</div>}
                <label style={{ fontSize: 11, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block", letterSpacing: 0.8, textTransform: "uppercase" }}>Profession (optionnel)</label>
                <select style={{ ...inp, marginBottom: 24 }} value={form.profession} onChange={e => set("profession", e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {["Salarié(e)", "Indépendant(e) / Freelance", "Étudiant(e)", "Sans emploi", "Retraité(e)", "Professionnel de santé", "Enseignant(e)", "Autre"].map(p => <option key={p}>{p}</option>)}
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 15, borderRadius: 14, background: "transparent", color: C.textSec, border: `1px solid ${C.border}`, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>← Retour</button>
                  <button onClick={() => val2() && setStep(3)} style={{ flex: 2, padding: 15, borderRadius: 14, background: `linear-gradient(135deg, ${C.forest} 0%, ${C.orange} 100%)`, color: C.cream, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: `0 4px 16px ${C.orange}40` }}>Continuer →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, letterSpacing: -1, fontFamily: "'Fraunces', serif", color: C.cream }}>Tes choix</div>
                <div style={{ fontSize: 14, color: C.textSec, marginBottom: 24 }}>Tu contrôles tout. Chaque consentement est indépendant et révocable à tout moment.</div>

                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.red, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>⚠️ Obligatoires</div>
                  <Check checked={consents.cgu} onChange={() => tog("cgu")} color={C.orange}>
                    J'accepte les <span onClick={() => setModal("cgu")} style={{ color: C.orange, cursor: "pointer", textDecoration: "underline" }}>Conditions Générales d'Utilisation</span>. MindGuard est un outil de bien-être, non un dispositif médical.
                  </Check>
                  <Check checked={consents.rgpd} onChange={() => tog("rgpd")} color={C.orange}>
                    J'accepte la <span onClick={() => setModal("privacy")} style={{ color: C.orange, cursor: "pointer", textDecoration: "underline" }}>Politique de confidentialité</span>. Mes données sont traitées conformément au RGPD.
                  </Check>
                </div>

                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Optionnel · Partage anonymisé</div>
                  <div style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 14, lineHeight: 1.65 }}>Données 100% anonymisées — impossible de t'identifier. K-anonymat ≥10. Révocable à tout moment.</div>
                  <Check checked={consents.analytics_anon} onChange={() => tog("analytics_anon")} color={C.amber}>Améliorer l'algorithme MindGuard avec mes données anonymisées.</Check>
                  <Check checked={consents.partner_anon} onChange={() => tog("partner_anon")} color={C.amber}>
                    Partager mes données anonymisées avec nos partenaires certifiés (mutuelles, DRH, chercheurs).
                    <span style={{ display: "block", fontSize: 11, color: C.orange, marginTop: 4, fontWeight: 700 }}>🎁 1 mois Premium offert en échange</span>
                  </Check>
                </div>

                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
                  <div style={{ fontSize: 10, color: C.greenBright, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Optionnel · Communications</div>
                  <Check checked={consents.research} onChange={() => tog("research")} color={C.greenBright}>Participer à des études scientifiques anonymes sur la santé mentale.</Check>
                  <Check checked={consents.marketing} onChange={() => tog("marketing")} color={C.greenBright}>Recevoir conseils bien-être et actualités par email (max. 2/mois, désinscription 1 clic).</Check>
                </div>

                {consents.partner_anon && (
                  <div style={{ background: C.orangeDim, border: `1px solid ${C.orange}40`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
                    <div style={{ fontSize: 13, color: C.orange, fontWeight: 700, marginBottom: 5 }}>🎉 1 mois Premium activé !</div>
                    <div style={{ fontSize: 12.5, color: C.textSec }}>Ton mois Premium sera actif automatiquement après création de ton compte.</div>
                  </div>
                )}

                {errors.submit && <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: "#E87060", lineHeight: 1.6 }}>{errors.submit}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, padding: 15, borderRadius: 14, background: "transparent", color: C.textSec, border: `1px solid ${C.border}`, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>← Retour</button>
                  <button onClick={handleRegister} disabled={loading} style={{ flex: 2, padding: 15, borderRadius: 14, background: loading ? C.border : `linear-gradient(135deg, ${C.forest} 0%, ${C.orange} 100%)`, color: C.cream, border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: loading ? "none" : `0 4px 20px ${C.orange}40` }}>
                    {loading ? "Création..." : "Créer mon compte 🦊"}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginTop: 18, lineHeight: 1.7 }}>
                  Consentements horodatés · Art. 7 RGPD · privacy@mindguard.app
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
