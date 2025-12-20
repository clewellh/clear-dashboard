import { supabase } from "../lib/supabaseClient";
import type { MunicipalityRow } from "../types/municipality";
import type { DataResult } from "./result";

export async function fetchMunicipalities(): Promise<DataResult<MunicipalityRow[]>> {
  const { data, error } = await supabase
    .from("municipalities")
    .select("id, name, county, slug, state, website_url, population, created_at")
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message ?? "Unknown Supabase error" };
  return { data: (data ?? []) as MunicipalityRow[], error: null };
}

export async function fetchMunicipalityBySlug(
  slug: string
): Promise<DataResult<MunicipalityRow | null>> {
  const { data, error } = await supabase
    .from("municipalities")
    .select("id, name, county, slug, state, website_url, population, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return { data: null, error: error.message ?? "Unknown Supabase error" };
  return { data: (data ?? null) as MunicipalityRow | null, error: null };
}
