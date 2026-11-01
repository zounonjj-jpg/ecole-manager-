import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GraduationCap, Users, BookOpen, CalendarCheck, Wallet, ClipboardList, Settings, LogOut, Bell, Search, ArrowUpRight, CircleHelp } from "lucide-react";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  if (error || !claimsData?.claims) redirect("/connexion");
  const claims = claimsData.claims;
  const email = typeof claims.email === "string" ? claims.email : "Compte utilisateur";
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", claims.sub).maybeSingle();
  const { data: memberships } = await supabase.from("institution_memberships").select("institution_id, role").eq("user_id", claims.sub).eq("status", "active").limit(1);
  if (!memberships?.length) redirect("/configuration");
  const { data: institution } = await supabase.from("institutions").select("name, institution_type, currency_code").eq("id", memberships[0].institution_id).maybeSingle();
  const name = profile?.full_name || email.split("@")[0];

  return <main className="workspace">
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>School<span className="brand-accent">Manager</span></span></Link>
      <div className="workspace-label">ESPACE DE TRAVAIL</div>
      <nav className="side-nav"><a className="selected" href="#overview"><ClipboardList size={18}/> Vue d'ensemble</a><a href="#students"><Users size={18}/> Apprenants</a><a href="#academics"><BookOpen size={18}/> Pédagogie</a><a href="#attendance"><CalendarCheck size={18}/> Présences</a><a href="#finance"><Wallet size={18}/> Finances</a></nav>
      <div className="sidebar-bottom"><a href="#help"><CircleHelp size={18}/> Centre d'aide</a><a href="#settings"><Settings size={18}/> Paramètres</a><form action="/auth/signout" method="post"><button><LogOut size={18}/> Déconnexion</button></form></div>
    </aside>
    <section className="workspace-main" id="overview">
      <header className="workspace-top"><div className="workspace-search"><Search size={17}/><span>Rechercher dans votre espace...</span></div><div className="workspace-user"><button className="icon-button" aria-label="Notifications"><Bell size={18}/></button><div className="user-avatar">{name.slice(0,1).toUpperCase()}</div><div><b>{name}</b><small>{email}</small></div></div></header>
      <div className="workspace-content">
        <div className="welcome-row"><div><span className="eyebrow">VOTRE ESPACE SCHOOL MANAGER</span><h1>Bonjour, {name.split(" ")[0]} 👋</h1><p>Bienvenue. Voici votre espace de gestion.</p></div><span className="workspace-date">Votre espace sécurisé</span></div>
        <div className="setup-banner"><div className="setup-symbol"><GraduationCap size={23}/></div><div><b>{institution?.name || "Votre établissement"}</b><p>Votre espace est prêt. Vous pourrez maintenant organiser les classes, les équipes et les parcours de vos apprenants.</p></div><span className="setup-status">{memberships[0].role === "director" ? "Direction" : memberships[0].role}</span></div>
        <div className="workspace-section-head"><div><h2>Votre tableau de bord</h2><p>Les indicateurs seront actualisés à mesure que vous ajouterez vos données scolaires.</p></div></div>
        <div className="workspace-metrics"><article><span><Users size={18}/></span><small>Apprenants</small><b>—</b><em>À configurer</em></article><article><span><BookOpen size={18}/></span><small>Enseignants</small><b>—</b><em>À configurer</em></article><article><span><CalendarCheck size={18}/></span><small>Présences</small><b>—</b><em>À configurer</em></article><article><span><Wallet size={18}/></span><small>Finances</small><b>—</b><em>À configurer</em></article></div>
        <div className="workspace-lower"><article className="empty-panel"><div><h3>Commencez par configurer votre établissement</h3><p>Les modules seront activés progressivement selon le type d'établissement et les accès de chaque membre.</p></div><div className="empty-illustration"><GraduationCap size={42}/></div></article><article className="quick-panel"><h3>Accès rapides</h3><a href="#students"><Users size={17}/> Gestion des apprenants <ArrowUpRight size={15}/></a><a href="#academics"><BookOpen size={17}/> Suivi pédagogique <ArrowUpRight size={15}/></a><a href="#finance"><Wallet size={17}/> Suivi financier <ArrowUpRight size={15}/></a></article></div>
      </div>
    </section>
  </main>;
}
