import Link from "next/link";
import { redirect } from "next/navigation";
import {
  GraduationCap, Users, BookOpen, CalendarCheck, Wallet, ClipboardList,
  Settings, LogOut, Bell, Search, ArrowUpRight, CircleHelp, ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  if (error || !claimsData?.claims) redirect("/connexion");

  const claims = claimsData.claims;
  const email = typeof claims.email === "string" ? claims.email : "Compte utilisateur";
  const userId = String(claims.sub);
  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    supabase.from("institution_memberships").select("institution_id, role").eq("user_id", userId).eq("status", "active").limit(1),
  ]);
  if (!memberships?.length) redirect("/configuration");

  const membership = memberships[0];
  const institutionId = membership.institution_id;
  const [{ data: institution }, learnersResult, staffResult, attendanceResult, invoicesResult] = await Promise.all([
    supabase.from("institutions").select("name, institution_type, currency_code").eq("id", institutionId).maybeSingle(),
    supabase.from("learners").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
    supabase.from("staff").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
    supabase.from("attendance_records").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
  ]);

  const name = profile?.full_name || email.split("@")[0];
  const metric = (count: number | null, error: unknown) => error ? "—" : (count ?? 0).toLocaleString("fr-FR");

  return <main className="workspace">
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>School<span className="brand-accent">Manager</span></span></Link>
      <div className="workspace-label">ESPACE DE TRAVAIL</div>
      <nav className="side-nav">
        <Link className="selected" href="/espace"><ClipboardList size={18}/> Vue d'ensemble</Link>
        <Link href="/espace/apprenants"><Users size={18}/> Apprenants</Link>
        <span className="side-nav-disabled"><BookOpen size={18}/> Pédagogie</span>
        <span className="side-nav-disabled"><CalendarCheck size={18}/> Présences</span>
        <span className="side-nav-disabled"><Wallet size={18}/> Finances</span>
      </nav>
      <div className="sidebar-bottom">
        <span><CircleHelp size={18}/> Centre d'aide</span>
        <span><Settings size={18}/> Paramètres</span>
        <form action="/auth/signout" method="post"><button><LogOut size={18}/> Déconnexion</button></form>
      </div>
    </aside>

    <section className="workspace-main" id="overview">
      <header className="workspace-top">
        <div className="workspace-search"><Search size={17}/><span>Rechercher dans votre espace...</span></div>
        <div className="workspace-user"><span className="workspace-secure"><ShieldCheck size={15}/> Espace sécurisé</span><button className="icon-button" aria-label="Notifications"><Bell size={18}/></button><div className="user-avatar">{name.slice(0,1).toUpperCase()}</div><div><b>{name}</b><small>{email}</small></div></div>
      </header>

      <div className="workspace-content">
        <div className="welcome-row">
          <div><span className="eyebrow">VOTRE ESPACE SCHOOL MANAGER</span><h1>Bonjour, {name.split(" ")[0]} 👋</h1><p>Bienvenue dans votre espace de gestion.</p></div>
          <span className="workspace-date">Votre espace sécurisé</span>
        </div>

        <div className="setup-banner">
          <div className="setup-symbol"><GraduationCap size={23}/></div>
          <div><b>{institution?.name || "Votre établissement"}</b><p>Votre espace de gestion scolaire est prêt. Ajoutez vos apprenants pour commencer à suivre vos effectifs.</p></div>
          <span className="setup-status">{membership.role === "director" ? "Direction" : membership.role}</span>
        </div>

        <div className="workspace-section-head"><div><h2>Indicateurs de votre établissement</h2><p>Chiffres issus des données enregistrées dans votre espace.</p></div></div>
        <div className="workspace-metrics">
          <article><span><Users size={18}/></span><small>Apprenants</small><b>{metric(learnersResult.count, learnersResult.error)}</b><em>Effectif enregistré</em></article>
          <article><span><BookOpen size={18}/></span><small>Personnel</small><b>{metric(staffResult.count, staffResult.error)}</b><em>Fiches du personnel</em></article>
          <article><span><CalendarCheck size={18}/></span><small>Présences saisies</small><b>{metric(attendanceResult.count, attendanceResult.error)}</b><em>Enregistrements</em></article>
          <article><span><Wallet size={18}/></span><small>Factures</small><b>{metric(invoicesResult.count, invoicesResult.error)}</b><em>Documents financiers</em></article>
        </div>

        <div className="workspace-lower">
          <article className="empty-panel">
            <div><h3>Commencez par enregistrer vos apprenants</h3><p>Ajoutez les élèves ou étudiants, rattachez-les à leurs classes et organisez progressivement votre établissement.</p><Link className="button button-small" href="/espace/apprenants">Ouvrir la gestion des apprenants <ArrowUpRight size={15}/></Link></div>
            <div className="empty-illustration"><GraduationCap size={42}/></div>
          </article>
          <article className="quick-panel">
            <h3>Modules School Manager</h3>
            <Link href="/espace/apprenants"><Users size={17}/> Gestion des apprenants <ArrowUpRight size={15}/></Link>
            <span><BookOpen size={17}/> Classes et pédagogie · En préparation</span>
            <span><CalendarCheck size={17}/> Présences · En préparation</span>
            <span><Wallet size={17}/> Finances · En préparation</span>
          </article>
        </div>
      </div>
    </section>
  </main>;
}
