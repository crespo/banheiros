import { createClient } from "npm:@supabase/supabase-js@2";
import { evaluateModeration, type Attribute, type Scores } from "./evaluate.ts";
import { extractText } from "./extract-text.ts";
import { parseThresholds } from "./thresholds.ts";
import { shouldPublish } from "./should-publish.ts";

type ReviewSubmission = {
  type: "review";
  bathroom_id: string;
  comment: string;
  accessibility: number;
  lighting: number;
  odor: number;
  maintenance: number;
  cleanliness: number;
  show_username: boolean;
};

type PinSubmission = {
  type: "pin";
  name: string;
  address: string;
  kind: "public" | "instore";
  paid: boolean;
  open_time: string;
  close_time: string;
  lat: number;
  lon: number;
};

async function callPerspective(text: string, apiKey: string): Promise<Scores> {
  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        comment: { text },
        languages: ["pt", "en"],
        requestedAttributes: { TOXICITY: {}, PROFANITY: {}, THREAT: {}, IDENTITY_ATTACK: {} },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`perspective request failed with status ${response.status}`);
  }
  const body = await response.json();
  const attribute = (name: Attribute) => body.attributeScores[name].summaryScore.value;
  return {
    TOXICITY: attribute("TOXICITY"),
    PROFANITY: attribute("PROFANITY"),
    THREAT: attribute("THREAT"),
    IDENTITY_ATTACK: attribute("IDENTITY_ATTACK"),
  };
}

function mockScores(): Scores {
  return { TOXICITY: 0, PROFANITY: 0, THREAT: 0, IDENTITY_ATTACK: 0 };
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("missing authorization", { status: 401 });
  }

  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response("unauthorized", { status: 401 });
  }

  const submission: ReviewSubmission | PinSubmission = await req.json();
  const text = extractText(submission);
  const apiKey = Deno.env.get("PERSPECTIVE_API_KEY");

  let verdict: "approved" | "rejected" | "pending";
  let reason: Attribute | null = null;

  try {
    const scores = apiKey ? await callPerspective(text, apiKey) : mockScores();
    const result = evaluateModeration(scores, parseThresholds(Deno.env.toObject()));
    verdict = result.verdict;
    reason = result.reason;
  } catch (error) {
    console.error("moderate-submit: perspective call failed, marking pending", error);
    verdict = "pending";
  }

  const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (submission.type === "review") {
    const { data: existing } = await adminClient
      .from("reviews")
      .select("status")
      .eq("bathroom_id", submission.bathroom_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (shouldPublish(verdict, existing?.status ?? null)) {
      const { error } = await adminClient
        .from("reviews")
        .upsert(
          {
            bathroom_id: submission.bathroom_id,
            user_id: user.id,
            comment: submission.comment,
            accessibility: submission.accessibility,
            lighting: submission.lighting,
            odor: submission.odor,
            maintenance: submission.maintenance,
            cleanliness: submission.cleanliness,
            show_username: submission.show_username,
            status: verdict,
          },
          { onConflict: "bathroom_id,user_id" },
        );
      if (error) {
        console.error("moderate-submit: failed to save review", error);
        return new Response("failed to save review", { status: 500 });
      }
    }
  } else {
    const { error } = await adminClient.from("bathrooms").insert({
      source: "community",
      kind: submission.kind,
      paid: submission.paid,
      name: submission.name,
      address: submission.address,
      open_time: submission.open_time,
      close_time: submission.close_time,
      location: `SRID=4326;POINT(${submission.lon} ${submission.lat})`,
      created_by: user.id,
      status: verdict,
    });
    if (error) {
      console.error("moderate-submit: failed to save pin", error);
      return new Response("failed to save pin", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ verdict, reason }), {
    headers: { "content-type": "application/json" },
  });
});
