// lib/municipalityService.ts
import { supabase } from './supabaseClient';

export type BudgetYear = {
  year: number;
  total_budget: number;
  source_url: string | null;
};

export type MunicipalityDashboardData = {
  slug: string;
  name: string;
  county: string | null;
  latestBudgetYear: number | null;
  latestBudget: number | null;
  latestBudgetSourceUrl: string | null;
  budgets: BudgetYear[];
  totalCorruptionLost: number;
  totalCorruptionRecovered: number;
  estimatedJobsLost: number;
  transparencyScoreYear: number | null;
  transparencyFinalScore: number | null;
};

const JOB_COST_CONSTANT = 120000; // $120k per job (salary + benefits + training)

export async function getMunicipalityDashboardData(
  slug: string
): Promise<MunicipalityDashboardData | null> {
  // 1. Look up the municipality by slug
  const { data: muni, error: muniError } = await supabase
    .from('municipalities')
    .select('id, slug, name, county')
    .eq('slug', slug)
    .maybeSingle();

  if (muniError) {
    console.error('Error fetching municipality:', muniError.message);
    return null;
  }

  if (!muni) {
    // No such municipality in the DB
    return null;
  }

  const municipalityId = muni.id as string;

  // 2. Get all budgets for this municipality, ordered by year
  const { data: budgetRows, error: budgetError } = await supabase
    .from('municipal_budgets')
    .select('year, total_budget, source_url')
    .eq('municipality_id', municipalityId)
    .order('year', { ascending: true });

  if (budgetError) {
    console.error('Error fetching budgets:', budgetError.message);
  }

  const budgets: BudgetYear[] =
    budgetRows?.map((row) => ({
      year: row.year as number,
      total_budget: row.total_budget ? Number(row.total_budget) : 0,
      source_url: (row as any).source_url ?? null,
    })) || [];

  const latestBudget = budgets.length > 0 ? budgets[budgets.length - 1] : null;

  // 3. Corruption metrics from the view (total lost, recovered, jobs lost)
  const { data: metricsRow, error: metricsError } = await supabase
    .from('municipality_metrics_simple')
    .select('total_corruption_lost, total_corruption_recovered, estimated_jobs_lost')
    .eq('municipality_id', municipalityId)
    .maybeSingle();

  if (metricsError) {
    console.error('Error fetching corruption metrics:', metricsError.message);
  }

  const totalCorruptionLost = metricsRow
    ? Number(metricsRow.total_corruption_lost || 0)
    : 0;
  const totalCorruptionRecovered = metricsRow
    ? Number(metricsRow.total_corruption_recovered || 0)
    : 0;
  const estimatedJobsLost = metricsRow
    ? Number(metricsRow.estimated_jobs_lost || 0)
    : Number((totalCorruptionLost / JOB_COST_CONSTANT).toFixed(1));

  // 4. Latest transparency score (your 1–100 grade, if present)
  const { data: scoreRows, error: scoreError } = await supabase
    .from('municipal_transparency_scores')
    .select('score_year, final_score')
    .eq('municipality_id', municipalityId)
    .order('score_year', { ascending: false })
    .limit(1);

  if (scoreError) {
    console.error('Error fetching transparency scores:', scoreError.message);
  }

  const latestScore = scoreRows && scoreRows.length > 0 ? scoreRows[0] : null;

  console.log('CLEAR DEBUG – municipality dashboard data', {
    slug,
    muni,
    budgets,
    metricsRow,
    latestScore,
  });

  return {
    slug: muni.slug as string,
    name: muni.name as string,
    county: (muni.county as string) || null,
    latestBudgetYear: latestBudget ? latestBudget.year : null,
    latestBudget: latestBudget ? latestBudget.total_budget : null,
    latestBudgetSourceUrl: latestBudget ? latestBudget.source_url : null,
    budgets,
    totalCorruptionLost,
    totalCorruptionRecovered,
    estimatedJobsLost,
    transparencyScoreYear: latestScore ? (latestScore.score_year as number) : null,
    transparencyFinalScore: latestScore
      ? Number(latestScore.final_score || 0)
      : null,
  };
}
