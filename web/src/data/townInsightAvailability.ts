import { supabase } from "../lib/supabaseClient";
import type { DataResult } from "./result";

/**
 * One query: returns municipality_ids that have a row in town_insights.
 * Used to show "Report available" badges without N queries.
 */
export async function fetchInsightMunicipalityIds(): Promise<DataResult<Set<string>>> {
  const { data, error } = await supabase
    .from("town_insights")
    .select("municipality_id");

  if (error) return { data: null, error: error.message ?? "Unknown Supabase error" };

  const ids = new Set<string>();
  for (const row of data ?? []) {
    const id = (row as any).municipality_id;
    if (typeof id === "string") ids.add(id);
  }
  return { data: ids, error: null };
}
