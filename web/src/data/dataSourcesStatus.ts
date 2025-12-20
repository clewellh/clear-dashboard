import { supabase } from "../lib/supabaseClient";
import type { DataResult } from "./result";

export type DataSourcesStatusRow = {
  municipality_id: string;
  last_updated_at: string;
  has_meetings: boolean;
  has_meeting_documents: boolean;
  has_contracts: boolean;
  has_opra_metrics: boolean;
  has_audit_data: boolean;
  has_population: boolean;
  sources_count: number;
  metrics_filled_count: number;
  metrics_total_count: number;
  missing: string[];
};

export async function fetchDataSourcesStatusByMunicipalityId(
  municipalityId: string
): Promise<DataResult<DataSourcesStatusRow | null>> {
  const { data, error } = await supabase
    .from("data_sources_status")
    .select(
      "municipality_id,last_updated_at,has_meetings,has_meeting_documents,has_contracts,has_opra_metrics,has_audit_data,has_population,sources_count,metrics_filled_count,metrics_total_count,missing"
    )
    .eq("municipality_id", municipalityId)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data: (data ?? null) as any, error: null };
}
