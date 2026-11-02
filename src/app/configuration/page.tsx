import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/server";
import { InstitutionSetupForm } from "@/components/institution-setup-form";

export default async function ConfigurationPage() {
  const supabase=await createClient();
  const {data:claimsData,error}=await supabase.auth.getClaims();
  if(error||!claimsData?.claims) redirect("/connexion");
  const {data:memberships}=await supabase.from("institution_memberships").select("id").eq("user_id",claimsData.claims.sub).eq("status","active").limit(1);
  if(memberships?.length) redirect("/espace");
  const {data:profile}=await supabase.from("profiles").select("intended_role").eq("id",claimsData.claims.sub).maybeSingle();
  return <main className="setup-page">
    <header><Link href="/" className="brand"><span className="brand-mark brand-mark-image"><BrandLogo size={46}/></span><span>School<span className="brand-accent">Manager</span></span></Link><span><ShieldCheck size={16}/> Configuration sécurisée</span></header>
    <section className="setup-card"><span className="eyebrow">PREMIÈRE ÉTAPE</span>{profile?.intended_role && profile.intended_role !== "director" ? <><h1>Votre compte est prêt.</h1><p>Votre profil est enregistré. Pour accéder à un établissement, demandez à son directeur ou à son administrateur de vous inviter avec votre adresse e-mail.</p><div className="invitation-note">Rôle choisi : <b>{profile.intended_role}</b><br/>L'accès aux données scolaires sera activé uniquement après invitation et validation de votre appartenance à un établissement.</div><Link className="button auth-submit" href="/">Retour à l'accueil</Link></> : <><h1>Créons votre espace établissement.</h1><p>Renseignez les informations de base. Vous pourrez ensuite ajouter les classes, les enseignants et les apprenants.</p><InstitutionSetupForm/><small>Votre établissement sera isolé des autres espaces. Vous pourrez inviter votre équipe ensuite.</small></>}</section>
  </main>;
}
