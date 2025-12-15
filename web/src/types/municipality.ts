// web/src/types/municipality.ts

export type MunicipalityRow = {
  id: string; // uuid
  name: string;
  county: string | null;
  slug: string | null;
  state?: string | null;
  website_url?: string | null;
  created_at?: string | null;
};
