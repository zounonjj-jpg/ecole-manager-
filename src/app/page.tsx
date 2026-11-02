import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
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
        <Link href="/" className="brand"><span className="brand-mark brand-mark-image"><BrandLogo size={50}/></span><span>School<span className="brand-accent">Manager</span></span></Link>
        <nav className="nav-links"><a href="#fonctionnalites">Fonctionnalités</a><a href="#publics">Pour qui ?</a><a href="#securite">Sécurité</a></nav>
        <div className="nav-actions"><Link className="login-link" href="/connexion">Connexion</Link><Link className="button button-small" href="/inscription">Créer mon espace <ArrowRight size={16}/></Link></div>
      </header>

      <section className="hero-banner" aria-label="Présentation de School Manager">
        <div className="hero-banner-frame">
          <Image
            src="/brand/school-manager-hero.avif"
            alt="School Manager, la solution de gestion des écoles et universités, avec une équipe éducative et un tableau de bord."
            width={1200}
            height={675}
            priority
            sizes="100vw"
            className="hero-banner-image"
          />
          <Link href="/inscription" className="hero-banner-cta" aria-label="Commencer maintenant">
            Commencer maintenant
          </Link>
        </div>
        <div className="hero-mobile-summary">
          <span className="eyebrow">GÉREZ · SUIVEZ · RÉUSSISSEZ</span>
          <h1>La gestion de votre établissement, <span>en toute simplicité.</span></h1>
          <p>Centralisez les apprenants, le personnel, le suivi pédagogique et les informations essentielles de votre école ou université.</p>
          <Link className="button" href="/inscription">Commencer maintenant <ArrowRight size={18}/></Link>
        </div>
      </section>

      <section className="trust-strip"><div><Globe2 size={19}/> <span>Accessible partout dans le monde</span></div><div><ShieldCheck size={19}/> <span>Espaces de données séparés</span></div><div><Users size={19}/> <span>Une plateforme pour toute l'équipe</span></div></section>

      <section className="section" id="fonctionnalites"><div className="section-heading"><span className="eyebrow">UN ÉCOSYSTÈME COMPLET</span><h2>Tout ce dont votre établissement<br/>a besoin, au même endroit.</h2><p>Moins de tâches répétitives. Plus de temps pour l'essentiel : apprendre et faire progresser.</p></div><div className="feature-grid">{features.map(({icon:Icon,title,text})=><article className="feature-card" key={title}><span className="feature-icon"><Icon size={21}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="audience-section" id="publics"><div className="section-heading"><span className="eyebrow">POUR TOUTE LA COMMUNAUTÉ</span><h2>Chacun trouve sa place.</h2><p>Des espaces adaptés aux responsabilités de chaque membre de votre communauté éducative.</p></div><div className="audience-grid">{audiences.map(({icon:Icon,title,text})=><article className="audience-card" key={title}><Icon size={26}/><h3>{title}</h3><p>{text}</p><span>Un espace adapté <ArrowRight size={15}/></span></article>)}</div></section>

      <section className="security-section" id="securite"><div className="security-icon"><ShieldCheck size={28}/></div><div><span className="eyebrow">CONFIANCE & CONFIDENTIALITÉ</span><h2>Vos données scolaires restent les vôtres.</h2><p>Chaque établissement travaille dans un espace indépendant. Les accès sont contrôlés selon les rôles et les responsabilités.</p></div><Link href="/inscription" className="button button-light">Créer mon espace <ArrowRight size={17}/></Link></section>

      <footer className="footer"><Link href="/" className="brand"><span className="brand-mark brand-mark-image"><BrandLogo size={42}/></span><span>School<span className="brand-accent">Manager</span></span></Link><span>© {new Date().getFullYear()} School Manager. Tous droits réservés.</span><div><Link href="/connexion">Connexion</Link><Link href="/inscription">Inscription</Link></div></footer>
    </main>
  );
}
