import { supabase } from "../lib/supabaseClient";
import type { TownInsight } from "../types/townInsight";

type DataResult<T> = { data: T | null; error: Error | null };

export async function fetchTownInsightByMunicipalitySlug(
  slug: string
): Promise<DataResult<TownInsight>> {
  try {
    const { data, error } = await supabase
      .from("town_insights")
      .select(
        `
        *,
        municipalities!inner (
          id,
          slug
        )
      `
      )
      .eq("municipalities.slug", slug)
      .order("as_of_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { data: null, error };

    // Supabase returns joined data; we only want the town_insights shape.
    // `municipalities` field will exist; we can ignore it safely.
    return { data: data as unknown as TownInsight, error: null };
  } catch (e) {
    return { data: null, error: e as Error };
  }
}
