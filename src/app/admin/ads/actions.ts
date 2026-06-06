"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export async function saveAdCode(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id");
  const code = formData.get("code") as string;
  const enabled = formData.has("enabled");

  await supabase
    .from("ad_settings")
    .update({ code, enabled, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/ads");
}
