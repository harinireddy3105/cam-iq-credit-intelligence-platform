import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a senior Indian credit analyst at a commercial bank. You perform Credit Appraisal Memorandum (CAM) analysis using the Five-Cs methodology:

1. **Character** (0-100): Promoter track record, CIN/MCA filing history, legal disputes, credit bureau score, management integrity signals.
2. **Capacity** (0-100): Revenue trends, debt service coverage ratio (DSCR), cash flow adequacy, GST return consistency, bank statement analysis.
3. **Capital** (0-100): Net worth, debt-to-equity ratio, capital adequacy, retained earnings trend.
4. **Collateral** (0-100): Asset coverage ratio, collateral quality, valuation recency, lien position.
5. **Conditions** (0-100): Industry outlook, regulatory environment, macroeconomic factors, sector-specific risks.

For each assessment, you must return a JSON object with this exact structure:
{
  "composite_score": <number 0-100>,
  "character_score": <number 0-100>,
  "capacity_score": <number 0-100>,
  "capital_score": <number 0-100>,
  "collateral_score": <number 0-100>,
  "conditions_score": <number 0-100>,
  "recommendation": "approved" | "conditional" | "rejected",
  "loan_recommended": <number in crore>,
  "interest_rate": <number percentage>,
  "tenure_months": <number>,
  "rationale": "<2-3 paragraph analysis explaining the recommendation>",
  "fraud_flags": [
    {
      "fraud_type": "<string>",
      "source_a": "<string>",
      "source_b": "<string>",
      "variance_amount": "<string>",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "evidence": "<string>"
    }
  ],
  "research_findings": [
    {
      "source": "<string>",
      "finding": "<string>",
      "sentiment": "positive" | "neutral" | "negative" | "critical"
    }
  ],
  "covenants": ["<string>"]
}

Base your analysis on the company details and sector provided. Generate realistic fraud flags by looking for common Indian banking fraud patterns (GST vs ITR mismatch, circular trading, related party transactions, evergreening). Generate 2-5 fraud flags and 3-6 research findings. Always suggest 3-5 covenants.

Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, cin, sector, loan_amount, purpose } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Perform a full CAM credit analysis for:
- Company: ${company_name}
- CIN: ${cin || "Not provided"}
- Sector: ${sector}
- Loan Requested: ₹${loan_amount} Crore
- Purpose: ${purpose || "General working capital"}

Generate a comprehensive Five-Cs analysis with realistic scores, fraud flags, research findings, and recommended covenants. The analysis should reflect typical risk patterns for the ${sector} sector in India.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("credit-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
