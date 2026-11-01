import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Users, WalletCards, BarChart3, CalendarDays, Globe2, CheckCircle2 } from "lucide-react";

const features = [
  { icon: Users, title: "Gestion des apprenants", text: "Dossiers, inscriptions, classes, groupes et parcours réunis au même endroit." },
  { icon: BookOpen, title: "Suivi pédagogique", text: "Notes, évaluations, présences, devoirs et bulletins en quelques gestes." },
  { icon: WalletCards, title: "Gestion financière", text: "Frais de scolarité, factures, reçus et suivi des paiements." },
  { icon: BarChart3, title: "Pilotage clair", text: "Des indicateurs utiles pour prendre les bonnes décisions." },
  { icon: CalendarDays, title: "Organisation", text: "Emplois du temps, périodes scolaires et communication centralisés." },
  { icon: ShieldCheck, title: "Données protégées", text: "Chaque établissement dispose d'un espace isolé et de permissions adaptées." },
];

const audiences = [
  { icon: GraduationCap, title: "Établissements", text: "Une direction mieux informée, une administration plus efficace et une vision globale de l'école." },
  { icon: BookOpen, title: "Enseignants", text: "Préparez vos cours, suivez les présences et partagez les résultats sans perdre du temps." },
  { icon: Users, title: "Parents & apprenants", text: "Consultez les informations scolaires et restez connectés au parcours éducatif." },
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <Link href="/" className="brand"><span className="brand-mark"><GraduationCap size={22}/></span><span>School<span className="brand-accent">Manager</span></span></Link>
        <nav className="nav-links"><a href="#fonctionnalites">Fonctionnalités</a><a href="#publics">Pour qui ?</a><a href="#securite">Sécurité</a></nav>
        <div className="nav-actions"><Link className="login-link" href="/connexion">Connexion</Link><Link className="button button-small" href="/inscription">Créer mon espace <ArrowRight size={16}/></Link></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> LA GESTION SCOLAIRE, NOUVELLE GÉNÉRATION</div>
          <h1>Votre établissement.<br/><span>Tout sous contrôle.</span></h1>
          <p className="hero-lead">La plateforme qui simplifie la gestion de votre établissement, valorise le travail des enseignants et rapproche les familles de la réussite des apprenants.</p>
          <div className="hero-actions"><Link className="button" href="/inscription">Commencer gratuitement <ArrowRight size={18}/></Link><a className="text-link" href="#fonctionnalites">Découvrir la plateforme <span>↓</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><i>É</i><i>En</i><i>P</i></div><span>Une plateforme pensée pour toute la communauté éducative</span></div>
        </div>
        <div className="hero-visual">
          <div className="visual-glow"/>
          <div className="dashboard-preview">
            <div className="preview-head"><div><small>ESPACE ÉTABLISSEMENT</small><strong>Vue d'ensemble</strong></div><span className="live-dot">● En direct</span></div>
            <div className="preview-welcome"><div><small>Bonjour, Directeur 👋</small><strong>Votre école en un regard</strong></div><span className="school-avatar">SM</span></div>
            <div className="metric-grid"><div className="metric"><small>Apprenants</small><b>1 248</b><em>↗ Suivi global</em></div><div className="metric"><small>Enseignants</small><b>64</b><em>Équipe active</em></div><div className="metric"><small>Présences</small><b>94,8%</b><em>Cette semaine</em></div></div>
            <div className="preview-bottom"><div><small>ACTIVITÉ ACADÉMIQUE</small><strong>Suivi de la semaine</strong><div className="bar-chart"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="chart-labels"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span></div></div><div className="progress-card"><span>Objectifs</span><b>78%</b><div className="progress-track"><i/></div><small>Progression du trimestre</small></div></div>
          </div>
          <div className="floating-card floating-one"><span className="float-icon green"><CheckCircle2 size={18}/></span><div><b>Présence enregistrée</b><small>Classe de 3e A</small></div></div>
          <div className="floating-card floating-two"><span className="float-icon purple"><BarChart3 size={18}/></span><div><b>Rapport disponible</b><small>Résultats du trimestre</small></div></div>
        </div>
      </section>

      <section className="trust-strip"><div><Globe2 size={19}/> <span>Accessible partout dans le monde</span></div><div><ShieldCheck size={19}/> <span>Espaces de données séparés</span></div><div><Users size={19}/> <span>Une plateforme pour toute l'équipe</span></div></section>

      <section className="section" id="fonctionnalites"><div className="section-heading"><span className="eyebrow">UN ÉCOSYSTÈME COMPLET</span><h2>Tout ce dont votre établissement<br/>a besoin, au même endroit.</h2><p>Moins de tâches répétitives. Plus de temps pour l'essentiel : apprendre et faire progresser.</p></div><div className="feature-grid">{features.map(({icon:Icon,title,text})=><article className="feature-card" key={title}><span className="feature-icon"><Icon size={21}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="audience-section" id="publics"><div className="section-heading"><span className="eyebrow">POUR TOUTE LA COMMUNAUTÉ</span><h2>Chacun trouve sa place.</h2><p>Des espaces adaptés aux responsabilités de chaque membre de votre communauté éducative.</p></div><div className="audience-grid">{audiences.map(({icon:Icon,title,text})=><article className="audience-card" key={title}><Icon size={26}/><h3>{title}</h3><p>{text}</p><span>Un espace adapté <ArrowRight size={15}/></span></article>)}</div></section>

      <section className="security-section" id="securite"><div className="security-icon"><ShieldCheck size={28}/></div><div><span className="eyebrow">CONFIANCE & CONFIDENTIALITÉ</span><h2>Vos données scolaires restent les vôtres.</h2><p>Chaque établissement travaille dans un espace indépendant. Les accès sont contrôlés selon les rôles et les responsabilités.</p></div><Link href="/inscription" className="button button-light">Créer mon espace <ArrowRight size={17}/></Link></section>

      <footer className="footer"><Link href="/" className="brand"><span className="brand-mark"><GraduationCap size={20}/></span><span>School<span className="brand-accent">Manager</span></span></Link><span>© {new Date().getFullYear()} School Manager. Tous droits réservés.</span><div><Link href="/connexion">Connexion</Link><Link href="/inscription">Inscription</Link></div></footer>
    </main>
  );
}
