import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExpeditionForm } from "@/components/ExpeditionForm";

export default async function EditExpeditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: expedition } = await supabase.from("expeditions").select("*").eq("id", id).single();
  if (!expedition) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактировать: {expedition.title}</h1>
      <ExpeditionForm expedition={expedition} />
    </div>
  );
}
