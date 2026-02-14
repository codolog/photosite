"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

type ExpeditionPayload = {
  year: number;
  title: string;
  date_from: string | null;
  date_to: string | null;
  place: string | null;
  participant_list: string | null;
  description: string | null;
  sort_order: number;
};

export async function createExpedition(payload: ExpeditionPayload) {
  if (!(await isAdmin())) redirect("/");
  const supabase = await createClient();
  const { error } = await supabase.from("expeditions").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/admin/expeditions");
  revalidatePath("/history");
  revalidatePath("/");
  return {};
}

export async function updateExpedition(id: string, payload: ExpeditionPayload) {
  if (!(await isAdmin())) redirect("/");
  const supabase = await createClient();
  const { error } = await supabase.from("expeditions").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/expeditions");
  revalidatePath("/history");
  revalidatePath("/");
  revalidatePath(`/expedition/${id}`);
  return {};
}

export async function deleteExpedition(id: string) {
  if (!(await isAdmin())) redirect("/");
  const supabase = await createClient();
  await supabase.from("expeditions").delete().eq("id", id);
  revalidatePath("/admin/expeditions");
  revalidatePath("/history");
  revalidatePath("/");
  redirect("/admin/expeditions");
}
