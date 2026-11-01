"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function addLearner(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) redirect("/connexion");

  const { data: memberships } = await supabase
    .from("institution_memberships")
    .select("institution_id, role")
    .eq("user_id", claimsData.claims.sub)
    .eq("status", "active")
    .in("role", ["director", "school_admin", "secretary"])
    .limit(1);

  if (!memberships?.length) redirect("/espace/apprenants?error=permission");

  const institutionId = memberships[0].institution_id;
  const firstName = field(formData, "first_name");
  const lastName = field(formData, "last_name");
  const studentNumber = field(formData, "student_number");
  const classId = field(formData, "class_id");
  const dateOfBirth = field(formData, "date_of_birth");
  const gender = field(formData, "gender");
  const guardianName = field(formData, "guardian_name");
  const guardianEmail = field(formData, "guardian_email").toLowerCase();
  const guardianPhone = field(formData, "guardian_phone");

  if (firstName.length < 2 || firstName.length > 80 || lastName.length < 2 || lastName.length > 80) {
    redirect("/espace/apprenants?error=name");
  }
  if (studentNumber.length > 60 || guardianName.length > 120 || guardianPhone.length > 30) {
    redirect("/espace/apprenants?error=length");
  }
  if (guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
    redirect("/espace/apprenants?error=email");
  }
  if (dateOfBirth) {
    const parsed = new Date(dateOfBirth + "T00:00:00.000Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== dateOfBirth ||
      dateOfBirth > new Date().toISOString().slice(0, 10)
    ) {
      redirect("/espace/apprenants?error=date");
    }
  }
  if (gender && !["female", "male", "other", "undisclosed"].includes(gender)) {
    redirect("/espace/apprenants?error=gender");
  }

  const { error } = await supabase.from("learners").insert({
    institution_id: institutionId,
    class_id: classId || null,
    student_number: studentNumber || null,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dateOfBirth || null,
    gender: gender || null,
    guardian_name: guardianName || null,
    guardian_email: guardianEmail || null,
    guardian_phone: guardianPhone || null,
    status: "active",
  });

  if (error) {
    if (error.code === "23505") redirect("/espace/apprenants?error=duplicate");
    if (error.code === "23503") redirect("/espace/apprenants?error=class");
    if (error.code === "42501") redirect("/espace/apprenants?error=permission");
    redirect("/espace/apprenants?error=save");
  }

  revalidatePath("/espace");
  revalidatePath("/espace/apprenants");
  redirect("/espace/apprenants?created=1");
}
