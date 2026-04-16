import { useState } from "react";
import { supabase } from "./App";

const C = {
  bg: "#080C18", card: "#0D1220", cardBorder: "#151D30",
  accent: "#6C63FF", accentLight: "#9B95FF", accentDim: "#11103A",
  green: "#10B981", greenDim: "#062016",
  amber: "#F59E0B", amberDim: "#1C1200",
  red: "#EF4444", redDim: "#1A0808",
  text: "#F0F4FF", textSec: "#7A8499", textMuted: "#2E3A52",
};

const inp = {
  width: "100%", padding: "14px 16px", borderRadius: 12,
  border: `1px solid ${C.cardBorder}`, background: C.card,
  color: C.text, fontSize: 14, outline: "none", marginBottom: 14,
  fontFamily: "system-ui, sans-serif", transition: "border-color 0.2s",
  boxSizing: "border-box",
};

function Check({ checked, onChange, children, color = C.accent }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: checked ? `${color}10` : "transparent", border: `1px solid ${checked ? color + "40" : "transparent"}`, transition: "all 0.2s" }}>
      <div onClick={onChange} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${checked ? color : C.textMuted}`, background: checked ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>{children}</span>
    </label>
  );
}

function Modal({ title, badge, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: "20px 20px 0 0", border: `1px solid ${C.cardBorder}`, padding: 24, maxWidth: 440, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
            {badge && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${C.green}20`, color: C.green, border: `1px solid ${C.green}40`, fontWeight: 700, letterSpacing: 0.5 }}>{badge}</span>}
          </div>
          <button onClick={onClose} style={{ background: C.cardBorder, border: "none", color: C.textSec, width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
        {children}
        <button onClick={onClose} style={{ width: "100%", padding: 13, borderRadius: 12, background: C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>Fermer</button>
      </div>
    </div>
  );
}

function PrivacyModal({ onClose }) {
  const items = [
    ["1. Responsable", "MindGuard SAS — Cayenne, Guyane française — privacy@mindguard.app — RGPD (UE 2016/679)"],
    ["2. Données collectées", "Email, prénom, âge, profession (compte). Humeur, sommeil, stress, énergie (bien-être). Ces données de santé mentale sont des données sensibles (Art. 9 RGPD)."],
    ["3. Base légale", "Données de compte : exécution du contrat. Données bien-être : consentement explicite. Données optionnelles : consentement opt-in séparé."],
    ["4. Partage", "Aucune donnée identifiable vendue. Seules des données 100% anonymisées (k-anonymat ≥10) peuvent être partagées avec consentement opt-in."],
    ["5. Vos droits", "Accès · Rectification · Suppression · Portabilité · Opposition · Retrait consentement. Contact : privacy@mindguard.app (30 jours max). Réclamation : cnil.fr"],
    ["6. Sécurité", "TLS 1.3 en transit · AES-256 au repos · Hébergement UE uniquement · Mots de passe hachés bcrypt"],
    ["7. Conservation", "Compte : durée + 30j. Bien-être : 3 ans glissants. Logs : 12 mois. Marketing : jusqu'au retrait + 3 ans."],
  ];
  return (
    <Modal title="Politique de confidentialité" badge="RGPD CONFORME V1.0" onClose={onClose}>
      {items.map(([t, d], i) => (
        <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < items.length - 1 ? `1px solid ${C.cardBorder}` : "none" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.accentLight, marginBottom: 5 }}>{t}</div>
          <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>{d}</div>
        </div>
      ))}
      <div style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.amber, fontWeight: 700, marginBottom: 4 }}>⚕️ Avertissement médical</div>
        <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>MindGuard est un outil de bien-être, pas un dispositif médical. Ne remplace pas un médecin. Détresse grave : <strong style={{ color: C.text }}>3114</strong> ou <strong style={{ color: C.text }}>15</strong>.</div>
      </div>
    </Modal>
  );
}

function CGUModal({ onClose }) {
  const arts = [
    ["Art. 1 — Service", "MindGuard propose un check-in quotidien, un score bien-être algorithmique, des alertes précoces non médicales et des conseils personnalisés."],
    ["Art. 2 — Limites", "MindGuard n'est PAS un dispositif médical, ne pose aucun diagnostic, ne remplace pas un professionnel de santé, n'est pas un service d'urgence."],
    ["Art. 3 — Âge", "Utilisation réservée aux 16 ans et plus. Pour les 16-18 ans : accord d'un représentant légal requis."],
    ["Art. 4 — Compte", "Un compte par personne. L'utilisateur est responsable de ses identifiants."],
    ["Art. 5 — Tarifs", "Gratuit : check-in, score hebdo, historique 7j. Premium (7,99€/mois) : historique illimité, alertes avancées, coach IA, rapport PDF médecin."],
    ["Art. 6 — Responsabilité", "MindGuard SAS ne peut être tenu responsable des décisions prises sur la base des informations de l'app ni d'une dégradation de l'état de santé."],
    ["Art. 7 — Résiliation", "Suppression du compte possible à tout moment. Données effacées sous 30 jours."],
    ["Art. 8 — Droit applicable", "Droit français. Tribunaux de Cayenne (Guyane). Médiation consommateur disponible (Art. L.612-1 C. conso)."],
  ];
  return (
    <Modal title="Conditions Générales d'Utilisation" badge="VERSION 1.0 — AVRIL 2026" onClose={onClose}>
      {arts.map(([t, d], i) => (
        <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < arts.length - 1 ? `1px solid ${C.cardBorder}` : "none" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 5 }}>{t}</div>
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
  const [modal, setModal] = useState(null); // "privacy" | "cgu" | null
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
      // Récupère le profil
      const profiles = await supabase.dbFetch("profiles", "GET", null, `?user_id=eq.${data.user.id}&select=*`, data.access_token);
      const profile = Array.isArray(profiles) && profiles[0] ? profiles[0] : {};
      onSuccess({
        id: data.user.id,
        email: data.user.email,
        prenom: profile.prenom || data.user.email.split("@")[0],
        token: data.access_token,
        expires_at: data.expires_at,
        consents: profile.consents || {},
        plan: profile.plan || "free",
      });
    } catch (err) {
      setErrors({ submit: err.message });
    }
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
      const token = data.session?.access_token;

      // Crée le profil — on ignore l'erreur si ça échoue (RLS ou déjà existant)
      try {
        await supabase.dbFetch("profiles", "POST", {
          user_id: data.user.id,
          prenom: form.prenom,
          age: +form.age,
          profession: form.profession || null,
          consents: consentRecord,
          plan: consents.partner_anon ? "premium" : "free",
          premium_until: consents.partner_anon ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          created_at: new Date().toISOString(),
        }, "", token);
      } catch (profileErr) {
        console.warn("Profil non créé:", profileErr);
        // On continue quand même — le compte Auth est créé
      }

      // Connexion réussie même si le profil n'a pas pu être créé
      onSuccess({
        id: data.user.id,
        email: form.email,
        prenom: form.prenom,
        token: token,
        expires_at: data.session?.expires_at,
        consents: consentRecord,
        plan: consents.partner_anon ? "premium" : "free",
        newUser: true,
      });
    } catch (err) {
      setErrors({ submit: err.message });
    }
    setLoading(false);
  }

  const steps = ["Compte", "Profil", "Confidentialité"];
  const btn = (onClick, label, full = true, disabled = false) => (
    <button onClick={onClick} disabled={disabled || loading} style={{ width: full ? "100%" : "auto", flex: full ? undefined : 1, padding: "14px 20px", borderRadius: 12, background: disabled || loading ? C.textMuted : C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: disabled || loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
      {label}
    </button>
  );
  const btnGhost = (onClick, label) => (
    <button onClick={onClick} style={{ flex: 1, padding: "14px 20px", borderRadius: 12, background: "transparent", color: C.textSec, border: `1px solid ${C.cardBorder}`, fontSize: 13, cursor: "pointer" }}>
      {label}
    </button>
  );
  const err = (k) => errors[k] && <div style={{ fontSize: 11, color: C.red, marginTop: -10, marginBottom: 10 }}>{errors[k]}</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif", color: C.text }}>
      {modal === "privacy" && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === "cgu" && <CGUModal onClose={() => setModal(null)} />}

      {/* Glow */}
      <div style={{ position: "fixed", top: -150, left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}18 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 20px 60px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ paddingTop: 44, paddingBottom: 36, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.accent} 0%, ${C.green} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 20px ${C.accent}40` }}>🧠</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>MindGuard</div>
            <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>Bien-être mental</div>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", gap: 4, background: C.card, borderRadius: 14, padding: 4, marginBottom: 32, border: `1px solid ${C.cardBorder}` }}>
          {[["register", "Créer un compte"], ["login", "Se connecter"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setStep(1); setErrors({}); }} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", cursor: "pointer", background: mode === m ? C.accent : "transparent", color: mode === m ? "#fff" : C.textSec, fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* LOGIN */}
        {mode === "login" && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Bon retour 👋</div>
            <div style={{ fontSize: 13, color: C.textSec, marginBottom: 28 }}>Connecte-toi pour accéder à ton espace.</div>
            <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Email</label>
            <input style={inp} type="email" placeholder="toi@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            {err("email")}
            <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Mot de passe</label>
            <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
            {err("password")}
            {errors.submit && <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12.5, color: C.red }}>{errors.submit}</div>}
            {btn(handleLogin, loading ? "Connexion en cours..." : "Se connecter →")}
          </div>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <div>
            {/* Steps */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, background: i + 1 < step ? C.green : i + 1 === step ? C.accent : C.cardBorder, color: i + 1 <= step ? "#fff" : C.textMuted, transition: "all 0.3s", boxShadow: i + 1 === step ? `0 0 16px ${C.accent}60` : "none" }}>
                      {i + 1 < step ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: i + 1 === step ? C.text : C.textMuted, fontWeight: i + 1 === step ? 700 : 400 }}>{s}</div>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: i + 1 < step ? C.green : C.cardBorder, margin: "0 6px", marginBottom: 18, transition: "background 0.3s" }} />}
                </div>
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Crée ton compte</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Ton email ne sera jamais partagé ni vendu.</div>
                <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Adresse email</label>
                <input style={inp} type="email" placeholder="toi@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                {err("email")}
                <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Mot de passe</label>
                <input style={inp} type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={e => set("password", e.target.value)} />
                {err("password")}
                <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Confirmer</label>
                <input style={inp} type="password" placeholder="Répète ton mot de passe" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
                {err("confirm")}
                <div style={{ background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 12, color: C.green, lineHeight: 1.6 }}>
                  🔒 Chiffrement bcrypt · Connexion TLS 1.3 · Serveurs UE uniquement
                </div>
                {btn(() => val1() && setStep(2), "Continuer →")}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Ton profil</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Pour personnaliser tes conseils. Reste privé.</div>
                <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Prénom *</label>
                <input style={inp} type="text" placeholder="Ton prénom" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
                {err("prenom")}
                <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Âge * (min. 16 ans)</label>
                <input style={inp} type="number" placeholder="Ton âge" value={form.age} onChange={e => set("age", e.target.value)} />
                {err("age")}
                <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 6, display: "block" }}>Profession (optionnel)</label>
                <select style={{ ...inp, marginBottom: 20 }} value={form.profession} onChange={e => set("profession", e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {["Salarié(e)", "Indépendant(e) / Freelance", "Étudiant(e)", "Sans emploi", "Retraité(e)", "Professionnel de santé", "Enseignant(e)", "Autre"].map(p => <option key={p}>{p}</option>)}
                </select>
                <div style={{ display: "flex", gap: 10 }}>{btnGhost(() => setStep(1), "← Retour")}{btn(() => val2() && setStep(3), "Continuer →", false)}</div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Tes choix</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>Tu contrôles tout. Chaque consentement est indépendant et révocable.</div>

                <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.red, letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>⚠️ Obligatoires</div>
                  <Check checked={consents.cgu} onChange={() => tog("cgu")}>
                    J'accepte les <span onClick={() => setModal("cgu")} style={{ color: C.accentLight, cursor: "pointer", textDecoration: "underline" }}>Conditions Générales d'Utilisation</span>. MindGuard est un outil de bien-être, non un dispositif médical.
                  </Check>
                  <Check checked={consents.rgpd} onChange={() => tog("rgpd")}>
                    J'accepte la <span onClick={() => setModal("privacy")} style={{ color: C.accentLight, cursor: "pointer", textDecoration: "underline" }}>Politique de confidentialité</span>. Mes données sont traitées conformément au RGPD.
                  </Check>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Optionnel · Partage anonymisé</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12, lineHeight: 1.6 }}>Données 100% anonymisées — impossible de t'identifier. K-anonymat ≥10. Révocable à tout moment.</div>
                  <Check checked={consents.analytics_anon} onChange={() => tog("analytics_anon")} color={C.amber}>Améliorer l'algorithme MindGuard avec mes données anonymisées.</Check>
                  <Check checked={consents.partner_anon} onChange={() => tog("partner_anon")} color={C.amber}>
                    Partager mes données anonymisées avec nos partenaires certifiés (mutuelles, DRH, chercheurs).
                    <span style={{ display: "block", fontSize: 11, color: C.amber, marginTop: 3, fontWeight: 700 }}>🎁 1 mois Premium offert</span>
                  </Check>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Optionnel · Communications</div>
                  <Check checked={consents.research} onChange={() => tog("research")} color={C.green}>Participer à des études scientifiques anonymes sur la santé mentale.</Check>
                  <Check checked={consents.marketing} onChange={() => tog("marketing")} color={C.green}>Recevoir conseils bien-être et actualités par email (max. 2/mois, désinscription 1 clic).</Check>
                </div>

                {consents.partner_anon && (
                  <div style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: C.amber, fontWeight: 700, marginBottom: 4 }}>🎉 1 mois Premium activé !</div>
                    <div style={{ fontSize: 12, color: C.textSec }}>Ton mois Premium sera activé automatiquement après confirmation de ton email.</div>
                  </div>
                )}

                {errors.submit && <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12.5, color: C.red, lineHeight: 1.6 }}>{errors.submit}</div>}

                <div style={{ display: "flex", gap: 10 }}>{btnGhost(() => setStep(2), "← Retour")}{btn(handleRegister, loading ? "Création..." : "Créer mon compte ✓", false)}</div>
                <div style={{ fontSize: 10.5, color: C.textMuted, textAlign: "center", marginTop: 16, lineHeight: 1.7 }}>
                  Consentements horodatés · Conformité Art. 7 RGPD · privacy@mindguard.app
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
