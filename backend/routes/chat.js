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

    const reply = await callClaudeChat(systemPrompt, messages, 350);

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
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const systemPrompt = `You are an expert traditional Ayurvedic physician (Vaidya) with deep knowledge of Charaka Samhita and Sushruta Samhita.

Based on the user's health concern, generate a personalized Ayurvedic healing protocol.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no code fences, no explanation text. Start your response with { and end with }.

The JSON must follow this EXACT structure:
{
  "success": true,
  "title": "A specific title describing the healing protocol (e.g. 'Pitta Pacification Protocol for Acid Reflux')",
  "doshaAnalysis": "2-3 sentences explaining which doshas are imbalanced and why, based on the symptoms described",
  "steps": [
    {
      "step": 1,
      "title": "Phase 1: Cleansing & Detox (Weeks 1-2)",
      "desc": "Specific dietary adjustments and herbal teas to begin with. Name specific herbs and foods."
    },
    {
      "step": 2,
      "title": "Phase 2: Core Herbal Remedy (Weeks 2-6)",
      "desc": "Main herbal formulas, dosages, and preparation methods. Be specific about herb names."
    },
    {
      "step": 3,
      "title": "Phase 3: Lifestyle & Maintenance",
      "desc": "Daily routines (dinacharya), yoga asanas, pranayama, and dietary habits for long-term balance."
    }
  ],
  "warning": "Safety warnings, contraindications, and when to consult a physician."
}`;

    let flowData;
    try {
      flowData = await callClaudeJSON(systemPrompt, `Patient's concern: ${message.trim()}`, 1500);
      // Ensure required fields exist
      if (!flowData.title || !flowData.steps || !Array.isArray(flowData.steps) || flowData.steps.length === 0) {
        throw new Error("Incomplete flow data returned");
      }
      flowData.success = true;
    } catch (parseErr) {
      console.error("[Flow parse error]", parseErr.message);
      // Return a meaningful fallback instead of 500
      flowData = {
        success: true,
        title: "General Ayurvedic Wellness Protocol",
        doshaAnalysis: "Based on your concern, a tridoshic (Vata, Pitta, Kapha) balancing approach is recommended. Please consult a qualified Vaidya for a complete personalized assessment.",
        steps: [
          {
            step: 1,
            title: "Phase 1: Ama (Toxin) Cleanse",
            desc: "Begin with warm water with ginger and lemon each morning. Avoid heavy, processed, and cold foods for 1-2 weeks. Triphala churna (1 tsp in warm water) before bed supports digestive detox."
          },
          {
            step: 2,
            title: "Phase 2: Core Herbal Support",
            desc: "Ashwagandha for Vata (nervous system), Shatavari or Guduchi for Pitta (inflammation), and Trikatu for Kapha (digestion). Take as advised by a practitioner — typically 500mg twice daily with warm water."
          },
          {
            step: 3,
            title: "Phase 3: Lifestyle Integration",
            desc: "Follow a regular sleep schedule (10pm–6am). Practice Anulom Vilom pranayama daily (10 min). Eat warm, cooked meals. Minimize stress through meditation and gentle yoga."
          }
        ],
        warning: "These guidelines are for general wellness only. Always consult a qualified Ayurvedic practitioner before starting any herbal regimen, especially if pregnant, nursing, or on medications."
      };
    }

    res.json(flowData);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
