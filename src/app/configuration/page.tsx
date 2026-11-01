import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InstitutionSetupForm } from "@/components/institution-setup-form";

export default async function ConfigurationPage() {
  const supabase=await createClient();
  const {data:claimsData,error}=await supabase.auth.getClaims();
  if(error||!claimsData?.claims) redirect("/connexion");
  const {data:memberships}=await supabase.from("institution_memberships").select("id").eq("user_id",claimsData.claims.sub).eq("status","active").limit(1);
  if(memberships?.length) redirect("/espace");
  return <main className="setup-page">
    <header><Link href="/" className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>School<span className="brand-accent">Manager</span></span></Link><span><ShieldCheck size={16}/> Configuration sécurisée</span></header>
    <section className="setup-card"><span className="eyebrow">PREMIÈRE ÉTAPE</span><h1>Créons votre espace établissement.</h1><p>Renseignez les informations de base. Vous pourrez ensuite ajouter les classes, les enseignants et les apprenants.</p><InstitutionSetupForm/><small>Votre établissement sera isolé des autres espaces. Vous pourrez inviter votre équipe ensuite.</small></section>
  </main>;
}
