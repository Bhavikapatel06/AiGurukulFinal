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
    const { persona, message, history, previousResponseSummary = "" } = req.body;

    // Keep last 10 messages max to avoid bloating context
    const trimmedHistory = history.slice(-10);

    const systemPrompt = buildChatPrompt(persona, previousResponseSummary);
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

    const systemPrompt = `You are an expert traditional Ayurvedic physician (Vaidya).
Based on the user's query/concern, create a personalized step-by-step Ayurvedic healing protocol.
Return ONLY a valid JSON object in this exact structure, with no markdown code blocks or other text:
{
  "success": true,
  "title": "Ayurvedic Healing Protocol",
  "steps": [
    {
      "step": 1,
      "title": "Phase 1: Cleansing & Preparation",
      "desc": "What to do first (e.g. dietary adjustments, detoxification, or basic teas)."
    },
    {
      "step": 2,
      "title": "Phase 2: Core Remedy",
      "desc": "The main herbs, preparations, or remedies to use and how to take them."
    },
    {
      "step": 3,
      "title": "Phase 3: Integration & Balance",
      "desc": "Long-term changes, lifestyle practices, or pranayama to prevent recurrence."
    }
  ],
  "doshaAnalysis": "Brief explanation of which doshas (Vata, Pitta, Kapha) are likely out of balance and how this protocol addresses them.",
  "warning": "Key safety warnings and contraindications for this specific protocol."
}`;

    const flowData = await callClaudeJSON(systemPrompt, `User Query: ${message}`);
    res.json(flowData);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
