/**
 * ChatGPT Integration for Skin Cancer Detection Web App
 * 
 * This edge function handles all AI chat requests securely on the backend.
 * It uses Lovable AI Gateway to access OpenAI GPT models.
 * 
 * Endpoint: POST /api/chat
 * 
 * Request Body:
 * {
 *   "message": "User's question",
 *   "scanResult": { "risk": "High", "confidence": "89%" } // Optional
 * }
 * 
 * Response:
 * {
 *   "reply": "AI generated response"
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for frontend integration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hard-coded system prompt to prevent random/off-topic answers
const SYSTEM_PROMPT = `You are ChatGPT, a medical-support AI assistant for a skin cancer detection web app.

STRICT RULES:
1. You ONLY answer questions related to:
   - Skin cancer (types, symptoms, risk factors, prevention)
   - AI-based skin cancer detection technology
   - Convolutional Neural Networks (CNNs) and how they work for image analysis
   - How to use this app and interpret results
   - General skin health and sun protection

2. You do NOT:
   - Provide medical diagnosis or treatment plans
   - Prescribe medications or treatments
   - Replace professional medical advice
   - Answer questions unrelated to skin cancer or this app

3. You MUST:
   - Encourage users to consult a dermatologist or healthcare professional when risk is medium or high
   - Be empathetic and supportive
   - Provide accurate, evidence-based information
   - Clarify that AI detection is a screening tool, not a diagnosis

4. When a scan result is provided in context:
   - Reference the risk level and confidence appropriately
   - Provide relevant guidance based on the risk level
   - Always recommend professional consultation for medium/high risk

If asked about anything outside these topics, politely decline and redirect to skin cancer or app-related questions.`;

// Interface for scan result context
interface ScanResult {
  risk?: string;
  confidence?: string;
  prediction?: string;
}

// Interface for request body
interface ChatRequest {
  message: string;
  scanResult?: ScanResult;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { message, scanResult }: ChatRequest = await req.json();

    // Validate message
    if (!message || typeof message !== "string" || message.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Message is required and must be a non-empty string" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get API key from environment (auto-provisioned by Lovable)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured. Please try again later." }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Build user message with optional scan context
    let userMessage = message;
    if (scanResult) {
      const contextInfo = [];
      if (scanResult.risk) contextInfo.push(`Risk Level: ${scanResult.risk}`);
      if (scanResult.confidence) contextInfo.push(`Confidence: ${scanResult.confidence}`);
      if (scanResult.prediction) contextInfo.push(`Prediction: ${scanResult.prediction}`);
      
      if (contextInfo.length > 0) {
        userMessage = `[Context: User's latest skin scan shows - ${contextInfo.join(", ")}]\n\nUser Question: ${message}`;
      }
    }

    // Call Lovable AI Gateway (OpenAI-compatible API)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini", // Cost-effective model with good performance
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7, // Balanced between creativity and consistency
        max_completion_tokens: 1000, // Reasonable response length
      }),
    });

    // Handle rate limiting
    if (response.status === 429) {
      console.error("Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Handle payment required
    if (response.status === 402) {
      console.error("Payment required - credits exhausted");
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
        { 
          status: 402, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Handle other errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to process your request. Please try again." }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse AI response
    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content;

    if (!aiReply) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "Received empty response from AI. Please try again." }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({ reply: aiReply }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
