const Anthropic = require("@anthropic-ai/sdk");

const isOpenRouter = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith("sk-or-v1-");

// Free models on OpenRouter — ordered by preference (quality first).
// If the first is rate-limited, the next one is tried automatically.
const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
];

/**
 * Call Claude or OpenRouter with a system prompt + user message.
 */
async function callClaude(systemPrompt, userMessage, maxTokens = 1200) {
  if (isOpenRouter) {
    return callOpenRouter(systemPrompt, [{ role: "user", content: userMessage }], maxTokens);
  }
  
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  return response.content[0].text;
}

/**
 * Call Claude or OpenRouter with multi-turn conversation history.
 */
async function callClaudeChat(systemPrompt, messages, maxTokens = 600) {
  if (isOpenRouter) {
    return callOpenRouter(systemPrompt, messages, maxTokens);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });
  return response.content[0].text;
}

/**
 * OpenRouter API call with automatic model fallback.
 * Tries each model in FREE_MODELS until one succeeds.
 */
async function callOpenRouter(systemPrompt, messages, maxTokens) {
  const modelsToTry = process.env.OPENROUTER_MODEL
    ? [process.env.OPENROUTER_MODEL, ...FREE_MODELS]
    : FREE_MODELS;

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          "HTTP-Referer": "https://aigurukul.app",
          "X-Title": "AI Gurukul",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const code = data?.error?.code || response.status;
        const msg = data?.error?.message || data?.message || `HTTP ${response.status}`;
        console.warn(`[OpenRouter] Model ${model} failed (${code}): ${msg.substring(0, 120)}`);
        // Rate-limited or not found — try next model
        if (code === 429 || code === 404 || response.status === 429 || response.status === 404) {
          lastError = new Error(msg);
          continue;
        }
        // Other errors — throw immediately
        throw new Error(msg);
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content || !content.trim()) {
        console.warn(`[OpenRouter] Model ${model} returned empty content, trying next...`);
        lastError = new Error("Empty response");
        continue;
      }

      console.log(`[OpenRouter] Success with model: ${model}`);
      return content.trim();

    } catch (err) {
      console.warn(`[OpenRouter] Model ${model} threw: ${err.message}`);
      lastError = err;
      continue;
    }
  }

  // All models exhausted
  throw lastError || new Error("All OpenRouter models failed. Please try again.");
}

/**
 * Call Claude and parse the response as JSON.
 */
async function callClaudeJSON(systemPrompt, userMessage, maxTokens = 1500) {
  const raw = await callClaude(systemPrompt, userMessage, maxTokens);
  let cleaned = raw.trim();
  // Strip markdown code fences if model wrapped the JSON
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[Claude JSON parse error]", cleaned.slice(0, 300));
    throw new Error("Model returned invalid JSON. Please retry.");
  }
}

module.exports = { callClaude, callClaudeJSON, callClaudeChat };
