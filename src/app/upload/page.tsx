import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UploadForm } from "./UploadForm";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expeditions } = await supabase
    .from("expeditions")
    .select("id, year, title")
    .order("year", { ascending: false });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Загрузить фото</h1>
      <UploadForm expeditions={expeditions || []} />
    </div>
  );
}
