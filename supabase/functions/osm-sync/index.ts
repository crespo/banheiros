import { createClient } from "npm:@supabase/supabase-js@2";
import { mapElement } from "./map-element.ts";
import { planSync } from "./plan-sync.ts";

// Bounding box covering Maceio, AL (south,west,north,east). Widen when coverage expands.
const MACEIO_BBOX = "-9.72,-35.83,-9.45,-35.63";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

async function fetchOverpassElements() {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="toilets"](${MACEIO_BBOX});
      way["amenity"="toilets"](${MACEIO_BBOX});
      node["toilets"="yes"](${MACEIO_BBOX});
      way["toilets"="yes"](${MACEIO_BBOX});
    );
    out center tags;
  `;
  const response = await fetch(OVERPASS_URL, { method: "POST", body: query });
  if (!response.ok) {
    throw new Error(`overpass request failed with status ${response.status}`);
  }
  const body = await response.json();
  return body.elements;
}

function toBathroomRow(element: Parameters<typeof mapElement>[0]) {
  const { lat, lon, ...row } = mapElement(element);
  return {
    ...row,
    location: lat != null && lon != null ? `SRID=4326;POINT(${lon} ${lat})` : null,
    osm_seen_at: new Date().toISOString(),
  };
}

Deno.serve(async () => {
  let elements;
  try {
    elements = await fetchOverpassElements();
  } catch (error) {
    console.error("osm-sync: overpass fetch failed, aborting without touching the database", error);
    return new Response("overpass fetch failed", { status: 502 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: existingRows, error: selectError } = await supabase
    .from("bathrooms")
    .select("id, osm_id, reviews(count), favorites(count), reports(count)")
    .eq("source", "osm");

  if (selectError) {
    console.error("osm-sync: failed to read existing osm bathrooms, aborting", selectError);
    return new Response("failed to read existing bathrooms", { status: 500 });
  }

  const existing = existingRows.map((row) => ({
    id: row.id,
    osm_id: row.osm_id,
    hasContent: [row.reviews, row.favorites, row.reports].some(
      (relation) => (relation?.[0]?.count ?? 0) > 0,
    ),
  }));

  const plan = planSync(elements, existing);

  if (plan.toUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from("bathrooms")
      .upsert(plan.toUpsert.map(toBathroomRow), { onConflict: "osm_id" });
    if (upsertError) {
      console.error("osm-sync: upsert failed", upsertError);
      return new Response("upsert failed", { status: 500 });
    }
  }

  if (plan.toRemove.length > 0) {
    const { error: deleteError } = await supabase.from("bathrooms").delete().in("id", plan.toRemove);
    if (deleteError) {
      console.error("osm-sync: delete failed", deleteError);
      return new Response("delete failed", { status: 500 });
    }
  }

  return new Response(
    JSON.stringify({ upserted: plan.toUpsert.length, removed: plan.toRemove.length }),
    { headers: { "content-type": "application/json" } },
  );
});
