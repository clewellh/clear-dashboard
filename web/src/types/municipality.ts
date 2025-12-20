export type MunicipalityRow = {
  id: string; // uuid
  name: string;
  county: string | null;
  slug: string | null;
  state?: string | null;
  website_url?: string | null;
  population?: number | null;
  created_at?: string | null;
};
