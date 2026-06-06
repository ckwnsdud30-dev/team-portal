"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id");

  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/admin/posts");
}
