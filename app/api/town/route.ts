import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = (searchParams.get("slug") || "").trim().toLowerCase();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const supabaseUrl = mustEnv("SUPABASE_URL");
    const supabaseServiceKey = mustEnv("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 1) municipality by slug
    const { data: muni, error: muniErr } = await supabase
      .from("municipalities")
      .select("id, name, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (muniErr) {
      return NextResponse.json({ error: muniErr.message }, { status: 500 });
    }
    if (!muni) {
      return NextResponse.json({ error: "Town not found" }, { status: 404 });
    }

    // 2) latest insight for that municipality
    const { data: insight, error: insErr } = await supabase
      .from("town_insights")
      .select("transparency_score, transparency_grade, as_of_date")
      .eq("municipality_id", muni.id)
      .order("as_of_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // If no insights yet, still return municipality so Squarespace can link
    return NextResponse.json({
      slug: muni.slug,
      name: muni.name,
      grade: insight?.transparency_grade ?? null,
      score: insight?.transparency_score ?? null,
      as_of_date: insight?.as_of_date ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
