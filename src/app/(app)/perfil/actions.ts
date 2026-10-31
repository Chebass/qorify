"use server";

import { createClient } from "@/lib/supabase/server";
import { isMode, toProfile } from "@/lib/landscape/prefs";

export async function updateLandscape(mode: string): Promise<{ ok: boolean }> {
  if (!isMode(mode)) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("profiles").update(toProfile(mode)).eq("id", user.id);
  return { ok: !error };
}
