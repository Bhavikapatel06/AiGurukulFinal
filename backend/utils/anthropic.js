const Anthropic = require("@anthropic-ai/sdk");

const isOpenRouter = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith("sk-or-v1-");

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
async function callClaudeChat(systemPrompt, messages, maxTokens = 400) {
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
 * Helper for OpenRouter API calls using fetch.
 */
async function callOpenRouter(systemPrompt, messages, maxTokens) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      "HTTP-Referer": "https://aigurukul.app",
      "X-Title": "AI Gurukul",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openrouter/free", // Using free model to prevent credit exhaustion
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      max_tokens: maxTokens
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("[OpenRouter Error]", data.error || data);
    throw new Error(data.error?.message || `OpenRouter error: ${response.status}`);
  }
  return data.choices[0].message.content;
}

/**
 * Call Claude and parse the response as JSON.
 */
async function callClaudeJSON(systemPrompt, userMessage, maxTokens = 1200) {
  const raw = await callClaude(systemPrompt, userMessage, maxTokens);
  let cleaned = raw.trim();
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[Claude JSON parse error]", cleaned.slice(0, 200));
    throw new Error("Claude returned invalid JSON. Please retry.");
  }
}

module.exports = { callClaude, callClaudeJSON, callClaudeChat };
