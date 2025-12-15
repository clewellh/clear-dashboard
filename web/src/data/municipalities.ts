// web/src/data/municipalities.ts

import { supabase } from '../lib/supabaseClient';
import type { MunicipalityRow } from '../types/municipality';
import type { DataResult } from './result';

export async function fetchMunicipalities(): Promise<DataResult<MunicipalityRow[]>> {
  const { data, error } = await supabase
    .from('municipalities')
    .select('id, name, county, slug, state, website_url, created_at')
    .order('name', { ascending: true });

  if (error) return { data: null, error: error.message ?? 'Unknown Supabase error' };

  return { data: (data ?? []) as MunicipalityRow[], error: null };
}
