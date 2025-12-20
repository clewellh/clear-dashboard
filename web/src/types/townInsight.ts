import { supabase } from "../lib/supabaseClient";
import type { TownInsight } from "../types/townInsight";

type DataResult<T> = { data: T | null; error: Error | null };

export async function fetchTownInsightByMunicipalitySlug(
  slug: string
): Promise<DataResult<TownInsight & { municipalities?: { population: number | null } | null }>> {
  try {
    // 1) Get municipality ID + population in one call
    const { data: municipality, error: muniError } = await supabase
      .from("municipalities")
      .select("id, population")
      .eq("slug", slug)
      .maybeSingle();

    if (muniError) {
      return { data: null, error: muniError };
    }
    if (!municipality?.id) {
      return { data: null, error: new Error("Municipality not found") };
    }

    // 2) Get latest insight + join population for convenience (authoritative source stays municipalities)
    const { data: insight, error: insightError } = await supabase
      .from("town_insights")
      .select(
        `
        *,
        municipalities:municipality_id (
          population
        )
      `
      )
      .eq("municipality_id", municipality.id)
      .order("as_of_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (insightError) {
      return { data: null, error: insightError };
    }

    if (!insight) {
      return { data: null, error: null };
    }

    return { data: insight as any, error: null };
  } catch (e) {
    return { data: null, error: e as Error };
  }
}

