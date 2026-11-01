"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, ArrowLeft, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";
const roles = [
  { value: "director", label: "Directeur / Directrice" },
  { value: "school_admin", label: "Administration scolaire" },
  { value: "teacher", label: "Enseignant / Formateur" },
  { value: "student", label: "Élève / Étudiant" },
  { value: "parent", label: "Parent / Responsable" },
  { value: "accountant", label: "Comptable" },
  { value: "secretary", label: "Secrétaire" },
];

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("director");
  const [school, setSchool] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setNotice("");
    try {
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") || "").trim();
      const password = String(form.get("password") || "");
      const supabase = createClient();
      if (isRegister) {
        const { data, error: authError } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName.trim(), intended_role: role, institution_name: school.trim() } },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push("/espace");
          router.refresh();
        } else setNotice("Votre compte a été créé. Connectez-vous avec votre adresse e-mail et votre mot de passe.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push("/espace");
        router.refresh();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue. Réessayez.");
    } finally { setLoading(false); }
  }

  return <main className="auth-shell">
    <div className="auth-side">
      <Link href="/" className="auth-back"><ArrowLeft size={16}/> Retour à l'accueil</Link>
      <div className="auth-side-content">
        <span className="auth-brand"><span className="brand-mark"><GraduationCap size={22}/></span> School<span>Manager</span></span>
        <div className="auth-side-message"><span className="eyebrow">LA RÉUSSITE SE CONSTRUIT ENSEMBLE</span><h1>Une école mieux organisée. Un avenir mieux préparé.</h1><p>Retrouvez les outils essentiels de votre communauté éducative dans un espace simple, sécurisé et accessible.</p></div>
        <div className="auth-side-foot">Une plateforme pour les établissements du monde entier.</div>
      </div>
    </div>
    <section className="auth-main">
      <div className="auth-card">
        <div className="auth-mobile-brand"><span className="brand-mark"><GraduationCap size={20}/></span> School<span>Manager</span></div>
        <div className="auth-tabs"><Link className={!isRegister ? "active" : ""} href="/connexion">Connexion</Link><Link className={isRegister ? "active" : ""} href="/inscription">Inscription</Link></div>
        <span className="eyebrow">{isRegister ? "REJOIGNEZ SCHOOL MANAGER" : "HEUREUX DE VOUS RETROUVER"}</span>
        <h2>{isRegister ? "Créez votre compte" : "Connectez-vous"}</h2>
        <p className="auth-subtitle">{isRegister ? "Commencez à organiser votre communauté éducative." : "Accédez à votre espace de travail sécurisé."}</p>
        <form onSubmit={handleSubmit} className="auth-fields">
          {isRegister && <>
            <label>Nom complet<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Votre nom et prénom" autoComplete="name"/></label>
            <label>Votre rôle<select value={role} onChange={e=>setRole(e.target.value)}>{roles.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            {role === "director" && <label>Nom de l'établissement<input required value={school} onChange={e=>setSchool(e.target.value)} placeholder="Ex. Groupe scolaire Les Lumières"/></label>}
          </>}
          <label>Adresse e-mail<input name="email" required type="email" placeholder="vous@exemple.com" autoComplete="email"/></label>
          <label>Mot de passe<span className="password-wrap"><input name="password" required type={showPassword ? "text" : "password"} minLength={8} placeholder="8 caractères minimum" autoComplete={isRegister ? "new-password" : "current-password"}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
          {error && <div className="form-alert error">{error}</div>}
          {notice && <div className="form-alert success">{notice}</div>}
          <button className="button auth-submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={17}/> Patientez...</> : isRegister ? "Créer mon compte" : "Se connecter"}</button>
        </form>
        <p className="auth-legal">En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.</p>
        <p className="auth-switch">{isRegister ? "Vous avez déjà un compte ?" : "Vous n'avez pas encore de compte ?"} <Link href={isRegister ? "/connexion" : "/inscription"}>{isRegister ? "Connexion" : "Créer un compte"}</Link></p>
      </div>
    </section>
  </main>;
}
