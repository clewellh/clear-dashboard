// lib/municipalityService.ts
// This file pretends to fetch data from a database.
// For now, it just returns a hard-coded example town.

export type MunicipalityMetrics = {
  municipality_id: string;
  name: string;
  county: string;
  latest_budget_year: number | null;
  latest_total_budget: number | null;
  total_corruption_lost: number;
  total_corruption_recovered: number;
  estimated_jobs_lost: number;
};

export type BudgetRecord = {
  year: number;
  total_budget: number;
  general_government: number | null;
  public_safety: number | null;
  public_works: number | null;
  education: number | null;
  health_human_services: number | null;
  other_spending: number | null;
};

export type CorruptionCase = {
  id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  amount_lost: number;
  amount_recovered: number | null;
  incident_date: string | null;
  case_type: string | null;
};

export type MunicipalityData = {
  metrics: MunicipalityMetrics | null;
  budgets: BudgetRecord[];
  corruptionCases: CorruptionCase[];
};

// This is our fake "database" for now.
const EXAMPLE_MUNICIPALITY_ID = 'demo-town';

const exampleMunicipalityData: MunicipalityData = {
  metrics: {
    municipality_id: EXAMPLE_MUNICIPALITY_ID,
    name: 'Example Township',
    county: 'Sample County',
    latest_budget_year: 2024,
    latest_total_budget: 25000000,
    total_corruption_lost: 1200000,
    total_corruption_recovered: 300000,
    estimated_jobs_lost: 15, // pretend this is based on a formula
  },
  budgets: [
    {
      year: 2022,
      total_budget: 22000000,
      general_government: 4000000,
      public_safety: 6000000,
      public_works: 3000000,
      education: 7000000,
      health_human_services: 800000,
      other_spending: 2000000,
    },
    {
      year: 2023,
      total_budget: 23500000,
      general_government: 4200000,
      public_safety: 6200000,
      public_works: 3200000,
      education: 7200000,
      health_human_services: 900000,
      other_spending: 2100000,
    },
    {
      year: 2024,
      total_budget: 25000000,
      general_government: 4500000,
      public_safety: 6500000,
      public_works: 3500000,
      education: 7500000,
      health_human_services: 1000000,
      other_spending: 2300000,
    },
  ],
  corruptionCases: [
    {
      id: 'case-1',
      title: 'Bid-rigging in public works contract',
      description:
        'A series of contracts were steered to a favored vendor in exchange for kickbacks.',
      source_url: 'https://example.com/comptroller-report',
      amount_lost: 800000,
      amount_recovered: 200000,
      incident_date: '2021-06-15',
      case_type: 'Bid-rigging',
    },
    {
      id: 'case-2',
      title: 'Fraudulent overtime claims',
      description:
        'Certain employees claimed overtime for hours never worked, costing the town hundreds of thousands.',
      source_url: 'https://example.com/overtime-fraud',
      amount_lost: 400000,
      amount_recovered: 100000,
      incident_date: '2019-09-10',
      case_type: 'Fraud',
    },
  ],
};

// This is the function our API will call.
export async function getMunicipalityData(
  municipalityId: string
): Promise<MunicipalityData> {
  // Normally we'd query Supabase here.
  // For now, we just return the example data if the ID matches.
  if (municipalityId === EXAMPLE_MUNICIPALITY_ID) {
    return exampleMunicipalityData;
  }

  // If the ID doesn't match, we return "no data"
  return {
    metrics: null,
    budgets: [],
    corruptionCases: [],
  };
}

// Export the example ID so the frontend knows what to request.
export { EXAMPLE_MUNICIPALITY_ID };
