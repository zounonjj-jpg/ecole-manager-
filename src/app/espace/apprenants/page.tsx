import Link from "next/link";
import { redirect } from "next/navigation";
import {
  GraduationCap, Users, BookOpen, CalendarCheck, Wallet, ClipboardList,
  Settings, LogOut, Bell, CircleHelp, UserPlus, ChevronLeft, ChevronRight,
  ShieldCheck, ArrowUpRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addLearner } from "./actions";

type PageProps = {
  searchParams: Promise<{ page?: string; created?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  permission: "Votre compte n'a pas les droits nécessaires pour ajouter un apprenant.",
  name: "Vérifiez les noms : chacun doit contenir au moins 2 caractères.",
  length: "Un des champs dépasse la longueur autorisée.",
  email: "L'adresse e-mail du parent est invalide.",
  date: "La date de naissance n'est pas valide.",
  gender: "Le genre sélectionné n'est pas valide.",
  duplicate: "Ce numéro d'élève existe déjà dans cet établissement.",
  class: "La classe sélectionnée n'est pas valide. Actualisez la page et réessayez.",
  save: "L'enregistrement a échoué. Vérifiez les informations et réessayez.",
};

const statusLabels: Record<string, string> = {
  active: "Actif",
  inactive: "Inactif",
  graduated: "Diplômé",
  transferred: "Transféré",
};

export default async function LearnersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const pageSize = 30;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) redirect("/connexion");

  const { data: memberships } = await supabase
    .from("institution_memberships")
    .select("institution_id, role")
    .eq("user_id", claimsData.claims.sub)
    .eq("status", "active")
    .limit(1);

  if (!memberships?.length) redirect("/configuration");

  const membership = memberships[0];
  const institutionId = membership.institution_id;
  const canManage = ["director", "school_admin", "secretary"].includes(membership.role);

  const [{ data: institution }, { data: learners, count, error: learnersError }, { data: classes }] = await Promise.all([
    supabase.from("institutions").select("name").eq("id", institutionId).maybeSingle(),
    supabase
      .from("learners")
      .select("id, student_number, first_name, last_name, date_of_birth, status, class_id", { count: "exact" })
      .eq("institution_id", institutionId)
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true })
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1),
    supabase.from("classes").select("id, name").eq("institution_id", institutionId).order("name"),
  ]);

  const classNames = new Map((classes || []).map((item) => [item.id, item.name]));
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rows = learners || [];

  return (
    <main className="workspace">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>School<span className="brand-accent">Manager</span></span></Link>
        <div className="workspace-label">ESPACE DE TRAVAIL</div>
        <nav className="side-nav">
          <Link href="/espace"><ClipboardList size={18}/> Vue d'ensemble</Link>
          <Link className="selected" href="/espace/apprenants"><Users size={18}/> Apprenants</Link>
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

      <section className="workspace-main">
        <header className="workspace-top">
          <div className="workspace-search"><Users size={17}/><span>Gestion des apprenants</span></div>
          <div className="workspace-user"><span className="workspace-secure"><ShieldCheck size={15}/> Espace sécurisé</span><Bell size={18}/></div>
        </header>

        <div className="workspace-content">
          <div className="module-heading">
            <div>
              <span className="eyebrow">GESTION SCOLAIRE</span>
              <h1>Apprenants</h1>
              <p>{institution?.name || "Votre établissement"} · Liste des élèves et étudiants</p>
            </div>
            <div className="module-total"><b>{total.toLocaleString("fr-FR")}</b><span>inscrit(s)</span></div>
          </div>

          {params.created === "1" && <div className="module-alert success">L'apprenant a été enregistré avec succès.</div>}
          {params.error && <div className="module-alert error">{errorMessages[params.error] || "Une erreur est survenue. Réessayez."}</div>}
          {learnersError && <div className="module-alert error">Impossible de charger la liste des apprenants. Vérifiez les autorisations et la connexion à la base de données.</div>}

          {canManage && (
            <section className="module-card learner-create">
              <div className="module-card-heading"><div><span className="module-icon"><UserPlus size={18}/></span><div><h2>Ajouter un apprenant</h2><p>Enregistrez un élève ou un étudiant dans votre établissement.</p></div></div></div>
              <form action={addLearner} className="learner-form">
                <div className="learner-fields">
                  <label>Prénom *<input name="first_name" required minLength={2} maxLength={80} placeholder="Prénom"/></label>
                  <label>Nom *<input name="last_name" required minLength={2} maxLength={80} placeholder="Nom de famille"/></label>
                  <label>Numéro d'élève<input name="student_number" maxLength={60} placeholder="Ex. SM-2026-001"/></label>
                  <label>Classe<select name="class_id" defaultValue=""><option value="">Sans classe pour le moment</option>{(classes || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label>Date de naissance<input name="date_of_birth" type="date" max={new Date().toISOString().slice(0, 10)}/></label>
                  <label>Genre<select name="gender" defaultValue=""><option value="">Non renseigné</option><option value="female">Féminin</option><option value="male">Masculin</option><option value="other">Autre</option><option value="undisclosed">Non communiqué</option></select></label>
                  <label>Nom du parent / responsable<input name="guardian_name" maxLength={120} placeholder="Nom du responsable"/></label>
                  <label>E-mail du parent<input name="guardian_email" type="email" maxLength={254} placeholder="parent@exemple.com"/></label>
                  <label>Téléphone du parent<input name="guardian_phone" type="tel" maxLength={30} placeholder="+229 ..."/></label>
                </div>
                <div className="learner-form-footer"><span>Les champs marqués * sont obligatoires.</span><button className="button" type="submit"><UserPlus size={16}/> Enregistrer l'apprenant</button></div>
              </form>
            </section>
          )}

          <section className="module-card learner-list">
            <div className="module-card-heading"><div><span className="module-icon"><Users size={18}/></span><div><h2>Liste des apprenants</h2><p>Les données affichées appartiennent uniquement à votre établissement.</p></div></div></div>
            {rows.length ? (
              <>
                <div className="table-scroll"><table className="learner-table"><thead><tr><th>Apprenant</th><th>Numéro</th><th>Classe</th><th>Date de naissance</th><th>Statut</th></tr></thead>
                  <tbody>{rows.map((learner) => (
                    <tr key={learner.id}>
                      <td><div className="learner-name"><span>{learner.first_name.slice(0, 1).toUpperCase()}{learner.last_name.slice(0, 1).toUpperCase()}</span><b>{learner.first_name} {learner.last_name}</b></div></td>
                      <td>{learner.student_number || "—"}</td>
                      <td>{learner.class_id ? classNames.get(learner.class_id) || "Classe inconnue" : "Non affecté"}</td>
                      <td>{learner.date_of_birth ? new Date(learner.date_of_birth + "T00:00:00").toLocaleDateString("fr-FR") : "—"}</td>
                      <td><span className={"learner-status " + learner.status}>{statusLabels[learner.status] || learner.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
                <div className="table-pagination"><span>Page {currentPage} sur {pageCount} · {total.toLocaleString("fr-FR")} apprenant(s)</span><div>{currentPage > 1 && <Link href={"/espace/apprenants?page=" + (currentPage - 1)}><ChevronLeft size={16}/> Précédent</Link>}{currentPage < pageCount && <Link href={"/espace/apprenants?page=" + (currentPage + 1)}>Suivant <ChevronRight size={16}/></Link>}</div></div>
              </>
            ) : (
              <div className="module-empty"><span><Users size={26}/></span><h3>Aucun apprenant enregistré</h3><p>Ajoutez votre premier élève ou étudiant à l'aide du formulaire ci-dessus.</p>{canManage && <a href="#top" className="text-link">Remplir le formulaire <ArrowUpRight size={14}/></a>}</div>
            )}
          </section>
          <p className="module-footnote">Affichage de 30 apprenants par page. Les autorisations sont contrôlées par la base de données.</p>
        </div>
      </section>
    </main>
  );
}
