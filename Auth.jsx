import { useState } from "react";

const C = {
  bg: "#0D1117", card: "#161B22", cardBorder: "#21262D",
  purple: "#7C6FE0", purpleLight: "#A89FF0", purpleDim: "#1E1A3A",
  green: "#3FB68A", greenDim: "#0E2A1F",
  amber: "#E8A838", amberDim: "#2A1E08",
  red: "#E05555", redDim: "#2A0E0E",
  text: "#E6EDF3", textSec: "#8B949E", textMuted: "#484F58",
};

const inp = {
  width: "100%", padding: "13px 14px", borderRadius: 12,
  border: `0.5px solid ${C.cardBorder}`, background: C.card,
  color: C.text, fontSize: 14, outline: "none",
  marginBottom: 10, fontFamily: "'DM Sans', sans-serif",
};

function Checkbox({ checked, onChange, children, accent = C.purple }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 12 }}>
      <div onClick={onChange} style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
        border: `1.5px solid ${checked ? accent : C.textMuted}`,
        background: checked ? accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", cursor: "pointer",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>{children}</span>
    </label>
  );
}

function PrivacyModal({ onClose }) {
  const sections = [
    { title: "1. Données collectées", text: "Nous collectons votre email, prénom, âge, profession et vos réponses au check-in quotidien (humeur, sommeil, énergie, stress). Nous ne collectons jamais votre localisation, vos contacts ou vos données financières." },
    { title: "2. Utilisation de vos données", text: "Vos données servent uniquement à calculer votre score bien-être, vous envoyer des alertes précoces et personnaliser vos conseils. Elles ne sont jamais vendues à des tiers sous forme identifiable." },
    { title: "3. Partage anonymisé (opt-in)", text: "Si vous y consentez, vos données sont agrégées et anonymisées (impossible de vous identifier) avant tout partage avec des partenaires. Exemple : '68% des utilisateurs ont un score bas le lundi.' Vous pouvez retirer ce consentement à tout moment." },
    { title: "4. Vos droits RGPD", text: "Accès, rectification, suppression, portabilité, opposition. Contactez : privacy@mindguard.app. Délai de réponse : 30 jours. Réclamation possible auprès de la CNIL : cnil.fr" },
    { title: "5. Sécurité", text: "Chiffrement TLS 1.3 en transit, AES-256 au repos. Hébergement en Union Européenne uniquement." },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: "20px 20px 0 0", border: `0.5px solid ${C.cardBorder}`, padding: 24, maxWidth: 420, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Politique de confidentialité</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>{s.text}</div>
          </div>
        ))}
        <div style={{ background: C.amberDim, border: `0.5px solid ${C.amber}`, borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 3 }}>Important</div>
          <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>MindGuard est une application de bien-être, pas un dispositif médical. Elle ne remplace pas un avis médical professionnel. En cas de détresse sérieuse, consultez un médecin ou appelez le 3114.</div>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 13, borderRadius: 12, background: C.purple, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Fermer</button>
      </div>
    </div>
  );
}

export default function Auth({ onSuccess }) {
  const [mode, setMode] = useState("register"); // register | login
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", confirm: "", prenom: "", age: "", profession: "" });
  const [consents, setConsents] = useState({ cgu: false, rgpd: false, analytics_anon: false, partner_anon: false, marketing: false, research: false });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = k => setConsents(c => ({ ...c, [k]: !c[k] }));

  function validateStep1() {
    const e = {};
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (form.password.length < 8) e.password = "Minimum 8 caractères";
    if (mode === "register" && form.password !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
    if (!form.prenom) e.prenom = "Requis";
    if (!form.age || form.age < 16 || form.age > 120) e.age = "Âge invalide (min. 16 ans)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleLogin() {
    if (!validateStep1()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess({ prenom: form.email.split("@")[0], email: form.email, consents }); }, 1200);
  }

  function handleSubmit() {
    if (!consents.cgu || !consents.rgpd) { setErrors({ submit: "Vous devez accepter les CGU et la politique de confidentialité." }); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess({ prenom: form.prenom, email: form.email, consents }); }, 1500);
  }

  const btnPrimary = { width: "100%", padding: 14, borderRadius: 12, background: loading ? C.textMuted : C.purple, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" };
  const btnSecondary = { flex: 1, padding: 14, borderRadius: 12, background: "none", color: C.textSec, border: `0.5px solid ${C.cardBorder}`, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
  const errStyle = { fontSize: 11, color: C.red, marginTop: -6, marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text, maxWidth: 420, margin: "0 auto" }}>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `0.5px solid ${C.cardBorder}` }}>
        <div style={{ fontSize: 11, color: C.purple, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>MindGuard</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Bien-être mental, détection précoce</div>
      </div>

      <div style={{ padding: "0 20px 40px" }}>

        {/* Toggle register / login */}
        <div style={{ display: "flex", gap: 0, margin: "20px 0 24px", background: C.card, borderRadius: 12, padding: 4, border: `0.5px solid ${C.cardBorder}` }}>
          {["register", "login"].map(m => (
            <button key={m} onClick={() => { setMode(m); setStep(1); setErrors({}); }} style={{
              flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
              background: mode === m ? C.purple : "transparent",
              color: mode === m ? "#fff" : C.textSec,
              fontSize: 13, fontWeight: mode === m ? 600 : 400, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>{m === "register" ? "Inscription" : "Connexion"}</button>
          ))}
        </div>

        {/* LOGIN */}
        {mode === "login" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Bon retour !</div>
            <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Connecte-toi à ton espace MindGuard.</div>
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Email</label>
            <input style={inp} type="email" placeholder="toi@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            {errors.email && <div style={errStyle}>{errors.email}</div>}
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Mot de passe</label>
            <input style={inp} type="password" placeholder="Ton mot de passe" value={form.password} onChange={e => set("password", e.target.value)} />
            {errors.password && <div style={errStyle}>{errors.password}</div>}
            <button onClick={handleLogin} disabled={loading} style={{ ...btnPrimary, marginTop: 8 }}>{loading ? "Connexion..." : "Se connecter"}</button>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.textSec }}>
              Pas encore de compte ?{" "}
              <span onClick={() => setMode("register")} style={{ color: C.purpleLight, cursor: "pointer" }}>S'inscrire</span>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <div>
            {/* Progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {["Compte", "Profil", "Consentements"].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 3, borderRadius: 2, marginBottom: 5, background: i < step ? C.purple : i === step - 1 ? C.purple : C.cardBorder, transition: "background 0.3s" }} />
                  <div style={{ fontSize: 10, color: i === step - 1 ? C.purpleLight : C.textMuted }}>{s}</div>
                </div>
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Créer ton compte</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Tes données restent privées et sécurisées.</div>
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Adresse email</label>
                <input style={inp} type="email" placeholder="toi@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                {errors.email && <div style={errStyle}>{errors.email}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Mot de passe</label>
                <input style={inp} type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={e => set("password", e.target.value)} />
                {errors.password && <div style={errStyle}>{errors.password}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Confirmer le mot de passe</label>
                <input style={inp} type="password" placeholder="Répète ton mot de passe" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
                {errors.confirm && <div style={errStyle}>{errors.confirm}</div>}
                <div style={{ background: C.greenDim, border: `0.5px solid ${C.green}`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: C.green, lineHeight: 1.5 }}>🔒 Ton email ne sera jamais partagé. Il sert uniquement à te connecter et t'envoyer tes alertes bien-être.</div>
                </div>
                <button onClick={() => validateStep1() && setStep(2)} style={btnPrimary}>Continuer →</button>
                <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.textSec }}>
                  Déjà un compte ?{" "}
                  <span onClick={() => setMode("login")} style={{ color: C.purpleLight, cursor: "pointer" }}>Se connecter</span>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Ton profil</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Ces infos permettent de personnaliser tes conseils.</div>
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Prénom</label>
                <input style={inp} type="text" placeholder="Ton prénom" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
                {errors.prenom && <div style={errStyle}>{errors.prenom}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Âge</label>
                <input style={inp} type="number" placeholder="Ton âge (min. 16 ans)" value={form.age} onChange={e => set("age", e.target.value)} />
                {errors.age && <div style={errStyle}>{errors.age}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 5, display: "block" }}>Profession (optionnel)</label>
                <select style={{ ...inp, marginBottom: 20 }} value={form.profession} onChange={e => set("profession", e.target.value)}>
                  <option value="">Sélectionner...</option>
                  <option>Salarié(e)</option>
                  <option>Indépendant(e) / Freelance</option>
                  <option>Étudiant(e)</option>
                  <option>Sans emploi</option>
                  <option>Retraité(e)</option>
                  <option>Autre</option>
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={btnSecondary}>← Retour</button>
                  <button onClick={() => validateStep2() && setStep(3)} style={{ ...btnPrimary, flex: 2 }}>Continuer →</button>
                </div>
              </div>
            )}

            {/* STEP 3 — Consentements */}
            {step === 3 && (
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Tes choix de confidentialité</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 20 }}>Tu es en contrôle total. Lis chaque option avant d'accepter.</div>

                {/* Obligatoires */}
                <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.red, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>Obligatoires</div>
                  <Checkbox checked={consents.cgu} onChange={() => toggle("cgu")}>
                    J'accepte les Conditions Générales d'Utilisation. MindGuard est un outil de bien-être, pas un dispositif médical.
                  </Checkbox>
                  <Checkbox checked={consents.rgpd} onChange={() => toggle("rgpd")}>
                    J'ai lu et j'accepte la{" "}
                    <span onClick={() => setShowPrivacy(true)} style={{ color: C.purpleLight, textDecoration: "underline", cursor: "pointer" }}>Politique de confidentialité</span>.
                    Mes données sont traitées conformément au RGPD.
                  </Checkbox>
                </div>

                {/* Partage anonymisé */}
                <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.amber, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>Optionnels — Partage anonymisé</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12, lineHeight: 1.5 }}>Données 100% anonymisées — impossible de t'identifier. Tu peux changer d'avis à tout moment.</div>
                  <Checkbox checked={consents.analytics_anon} onChange={() => toggle("analytics_anon")} accent={C.amber}>
                    Partager mes données anonymisées pour améliorer l'algorithme MindGuard.
                  </Checkbox>
                  <Checkbox checked={consents.partner_anon} onChange={() => toggle("partner_anon")} accent={C.amber}>
                    Partager mes données anonymisées avec nos partenaires (mutuelles, RH, chercheurs).
                    <span style={{ display: "block", fontSize: 11, color: C.textMuted, marginTop: 3 }}>Contrepartie : 1 mois Premium offert.</span>
                  </Checkbox>
                </div>

                {/* Communications */}
                <div style={{ background: C.card, border: `0.5px solid ${C.cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>Optionnels — Communications</div>
                  <Checkbox checked={consents.research} onChange={() => toggle("research")} accent={C.green}>
                    Participer à des études scientifiques anonymes sur la santé mentale.
                  </Checkbox>
                  <Checkbox checked={consents.marketing} onChange={() => toggle("marketing")} accent={C.green}>
                    Recevoir des conseils bien-être et actualités MindGuard par email (max. 2/mois).
                  </Checkbox>
                </div>

                {consents.partner_anon && (
                  <div style={{ background: C.amberDim, border: `0.5px solid ${C.amber}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 3 }}>Merci !</div>
                    <div style={{ fontSize: 12, color: C.textSec }}>Tu recevras 1 mois Premium gratuit pour ton partage de données anonymisées.</div>
                  </div>
                )}

                {errors.submit && (
                  <div style={{ background: C.redDim, border: `0.5px solid ${C.red}`, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 12, color: C.red }}>{errors.submit}</div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={btnSecondary}>← Retour</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, flex: 2 }}>{loading ? "Création du compte..." : "Créer mon compte ✓"}</button>
                </div>

                <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
                  Conformément au RGPD, tu peux exercer tes droits à tout moment en écrivant à privacy@mindguard.app
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
