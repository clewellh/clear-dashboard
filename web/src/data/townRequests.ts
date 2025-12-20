import { supabase } from "../lib/supabaseClient";
import type { DataResult } from "./result";

export async function createTownRequest(input: {
  municipality_id: string;
  contact_email?: string;
  note?: string;
}): Promise<DataResult<true>> {
  const { error } = await supabase.from("town_requests").insert({
    municipality_id: input.municipality_id,
    contact_email: input.contact_email ?? null,
    note: input.note ?? null,
  });

  if (error) return { data: null, error: error.message ?? "Unknown Supabase error" };
  return { data: true, error: null };
}
