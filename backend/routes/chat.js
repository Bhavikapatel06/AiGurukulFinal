const express = require("express");
const router = express.Router();
const { callClaudeChat, callClaudeJSON } = require("../utils/anthropic");
const { buildChatPrompt, buildChatMessages } = require("../prompts/chatContinuation");
const { validateChatRequest } = require("../middleware/validate");

/**
 * POST /api/chat
 * Body: {
 *   persona: 'krishna'|'chanakya'|'guru',
 *   message: string,
 *   history: [{ role: 'user'|'assistant', content: string }],
 *   previousResponseSummary: string   (1–2 sentence summary of wisdom delivered)
 * }
 * Returns: { reply: string }
 *
 * history should be the running conversation — frontend stores it and sends it each time.
 * Max history kept: last 10 messages (5 turns) to stay within context.
 */
router.post("/", validateChatRequest, async (req, res, next) => {
  try {
    const { persona, message, history, previousResponseSummary = "", isAyurveda = false } = req.body;

    // Keep last 10 messages max to avoid bloating context
    let trimmedHistory = history.slice(-10);
    if (trimmedHistory.length > 0 && trimmedHistory[trimmedHistory.length - 1].role === 'user') {
      trimmedHistory = trimmedHistory.slice(0, -1);
    }

    const systemPrompt = buildChatPrompt(persona, previousResponseSummary, isAyurveda);
    const messages = buildChatMessages(trimmedHistory, message);

    const reply = await callClaudeChat(systemPrompt, messages, 300);

    res.json({
      success: true,
      reply,
      persona,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chat/flow
 * Body: { message: string }
 * Returns a structured Ayurvedic healing protocol/flow.
 */
router.post("/flow", async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const systemPrompt = `You are an expert Ayurvedic wellness assistant.
Based on the user's health concern, generate a personalized healing protocol.

RESPONSE RULES:
1. FIRST CHECK: Determine if the query is related to health concerns, symptoms, Ayurveda, wellness, or herbs. If it is NOT (for example: general knowledge, history, programming, or queries like 'who is arjun'), you MUST return exactly this JSON:
{
  "success": false,
  "error": "unrelated"
}
Do not generate a wellness protocol or do any analysis for unrelated queries.
2. Identify the user's condition correctly.
3. Use simple, everyday English. Avoid complex Ayurvedic terminology such as: Kapha, Pitta, Vata, Ama, Srotas, Agni, Dinacharya, Nasya, Pranayama. Explain health concerns in plain English.
4. Focus on practical advice: what to do, what to avoid, when to seek medical help.
5. Do not provide medicine dosages.
6. Keep steps concise and clear.
7. For serious conditions (cancer, heart disease, stroke, severe breathing problems), provide supportive wellness guidance only and clearly recommend consulting a doctor.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no code fences, no explanation text. Start your response with { and end with }.

The JSON must follow this EXACT structure for related queries:
{
  "success": true,
  "title": "A specific title (e.g. 'Cooling Protocol for Acid Reflux')",
  "doshaAnalysis": "1-2 sentences in plain English explaining the possible cause of the symptoms",
  "steps": [
    {
      "step": 1,
      "title": "Phase 1: Initial Care (Week 1)",
      "desc": "Simple daily tips and foods to try. Focus on practical suggestions."
    },
    {
      "step": 2,
      "title": "Phase 2: Core Remedies (Weeks 2-4)",
      "desc": "Simple herbal teas or natural foods to eat and drink. No dosages."
    },
    {
      "step": 3,
      "title": "Phase 3: Long-term Habits",
      "desc": "Simple lifestyle practices and things to continue for long-term health."
    }
  ],
  "warning": "A short safety warning if needed."
}`;

    let flowData;
    try {
      flowData = await callClaudeJSON(systemPrompt, `Patient's concern: ${message.trim()}`, 1500);
      if (flowData.success === false || flowData.error === "unrelated") {
        // Safe to return, it's unrelated
      } else {
        // Ensure required fields exist
        if (!flowData.title || !flowData.steps || !Array.isArray(flowData.steps) || flowData.steps.length === 0) {
          throw new Error("Incomplete flow data returned");
        }
        flowData.success = true;
      }
    } catch (parseErr) {
      console.error("[Flow parse error]", parseErr.message);
      // Return a meaningful fallback instead of 500
      flowData = {
        success: true,
        title: "General Wellness Protocol",
        doshaAnalysis: "Based on your concern, we recommend starting with basic digestive wellness and a regular daily routine.",
        steps: [
          {
            step: 1,
            title: "Phase 1: Clear Liquids",
            desc: "Begin with sipping warm water throughout the day. Avoid cold drinks and heavy foods for a few days to let your digestion rest."
          },
          {
            step: 2,
            title: "Phase 2: Light Meals",
            desc: "Focus on warm, freshly cooked, easily digestible meals. Include mild spices like ginger and cumin in your cooking."
          },
          {
            step: 3,
            title: "Phase 3: Steady Rest",
            desc: "Follow a regular sleep schedule. Take gentle walks after your meals and practice slow, deep breathing to manage daily stress."
          }
        ],
        warning: "These guidelines are for general wellness only. Always consult a healthcare professional for persistent, severe, or worsening symptoms."
      };
    }
    res.json(flowData);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
