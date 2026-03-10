import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get auth token to fetch context
    const authHeader = req.headers.get("Authorization");
    let contextBlock = "";
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );

        const [assessRes, flagsRes] = await Promise.all([
          supabase
            .from("assessments")
            .select("id, borrower_name, sector, composite_score, status, loan_requested, loan_recommended, character_score, capacity_score, capital_score, collateral_score, conditions_score")
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("fraud_flags")
            .select("id, fraud_type, severity, variance_amount, source_a, source_b, evidence, assessment_id")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        if (assessRes.data?.length) {
          contextBlock += `\n\n## Recent Assessments (${assessRes.data.length})\n`;
          contextBlock += JSON.stringify(assessRes.data, null, 2);
        }
        if (flagsRes.data?.length) {
          contextBlock += `\n\n## Recent Fraud Flags (${flagsRes.data.length})\n`;
          contextBlock += JSON.stringify(flagsRes.data, null, 2);
        }
      } catch (e) {
        console.error("Context fetch error:", e);
      }
    }

    const systemPrompt = `You are CAM-AI Assistant, a senior credit intelligence advisor for Indian banks. You help credit officers with:

1. **Assessment Analysis**: Explain Five-Cs scores (Character, Capacity, Capital, Collateral, Conditions), recommend loan structuring, and flag risks.
2. **Fraud Intelligence**: Identify fraud typologies (GSTR-3B Suppression, GSTR-2A Mismatch, Revenue Inflation, Circular Trading, Shell Vendor Payments), explain severity, and suggest investigation steps.
3. **Regulatory Guidance**: Reference RBI circulars, SARFAESI Act, IBC provisions, and NPA classification norms.
4. **Best Practices**: Advise on documentation, covenant structuring, and collateral valuation.

Keep responses concise and actionable. Use bullet points. Reference specific data when available. Use ₹ for currency. Format numbers in Indian notation (lakhs/crores).

${contextBlock ? `\n--- LIVE DATABASE CONTEXT ---${contextBlock}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
