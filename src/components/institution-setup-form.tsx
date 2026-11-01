"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LoaderCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const institutionTypes = [
  ["kindergarten","Maternelle"],["primary","Primaire"],["middle_school","Collège"],["high_school","Lycée"],
  ["university","Université"],["institute","Institut supérieur"],["training_center","Centre de formation"],["school","Établissement polyvalent"]
];

export function InstitutionSetupForm() {
  const router = useRouter();
  const [name,setName]=useState("");
  const [type,setType]=useState("school");
  const [country,setCountry]=useState("BJ");
  const [currency,setCurrency]=useState("XOF");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const supabase=createClient();
    try {
      const {data:{user},error:userError}=await supabase.auth.getUser();
      if(userError || !user) throw new Error("Votre session a expiré. Reconnectez-vous.");
      const {data:institution,error:institutionError}=await supabase.from("institutions").insert({
        name:name.trim(), institution_type:type, country_code:country, currency_code:currency, created_by:user.id
      }).select("id").single();
      if(institutionError) throw institutionError;
      const {error:membershipError}=await supabase.from("institution_memberships").insert({
        institution_id:institution.id,user_id:user.id,role:"director",status:"active"
      });
      if(membershipError) {
        await supabase.from("institutions").delete().eq("id",institution.id);
        throw membershipError;
      }
      router.push("/espace"); router.refresh();
    } catch(cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de créer votre établissement pour le moment.");
    } finally { setLoading(false); }
  }

  return <form className="setup-form" onSubmit={submit}>
    <label>Nom de l'établissement<input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. Groupe scolaire Les Lumières"/></label>
    <label>Type d'établissement<select value={type} onChange={e=>setType(e.target.value)}>{institutionTypes.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <div className="setup-fields-row"><label>Pays<select value={country} onChange={e=>setCountry(e.target.value)}><option value="BJ">Bénin</option><option value="TG">Togo</option><option value="CI">Côte d'Ivoire</option><option value="SN">Sénégal</option><option value="GH">Ghana</option><option value="NG">Nigeria</option><option value="FR">France</option><option value="BE">Belgique</option><option value="CA">Canada</option><option value="US">États-Unis</option><option value="OTHER">Autre pays</option></select></label><label>Devise<select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="XOF">FCFA (XOF)</option><option value="XAF">FCFA (XAF)</option><option value="EUR">Euro (EUR)</option><option value="USD">Dollar US (USD)</option><option value="GBP">Livre sterling (GBP)</option><option value="GHS">Cedi (GHS)</option><option value="NGN">Naira (NGN)</option></select></label></div>
    {error&&<div className="form-alert error">{error}</div>}
    <button className="button auth-submit" disabled={loading}>{loading?<><LoaderCircle className="spin" size={17}/> Création...</>:"Créer mon établissement"} {!loading&&<ArrowRight size={17}/>}</button>
  </form>;
}
