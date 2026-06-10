/**
 * PROMPT: wisdomEngine
 *
 * The core AI Gurukul prompt. Produces the full 5-section structured
 * wisdom response from the selected persona.
 *
 * Usage:
 *   const { systemPrompt, userMessage } = buildWisdomPrompt(problem, persona);
 *   const text = await callClaude(systemPrompt, userMessage);
 */

const PERSONA_VOICE_RULES = {
  krishna: `
- Provide wisdom based on the teachings and thinking of Lord Krishna from the Bhagavad Gita.
- Do not speak in the first person as Lord Krishna himself (do not use "I", "me", "my" as if you are Krishna; instead, frame advice around Krishna's teachings and philosophy).
- Use concepts from the battlefield, the soul, duty, and the eternal self.
- Reference teachings or verses from the Gita when relevant.
- Your tone is calm, profound, compassionate — never rushed.
- Every answer must ultimately point toward: act without attachment to outcome.`,

  chanakya: `
- Provide wisdom based on the strategic thinking and teachings of Chanakya (Kautilya).
- Do not speak in the first person as Chanakya himself (do not use "I", "me", "my" as if you are Chanakya; instead, frame advice around Chanakya's teachings and strategy).
- Reference the Arthashastra or historical anecdotes from Chanakya's life.
- Frame the problem as a strategic puzzle, not an emotional wound.
- Your tone is sharp, unrelenting, direct — never cruel, but never soft.
- Every answer must ultimately point toward: identify leverage, act with intelligence.`,

  guru: `
- Provide wisdom based on the teachings and thinking of a wise spiritual Guru.
- Do not speak in the first person as the Guru himself (do not use "I", "me", "my" as if you are the Guru; instead, frame advice around the Guru's teachings and general folk wisdom).
- Use analogies from daily life: cooking, farming, rivers, seasons, household objects.
- Avoid all jargon. If a 12-year-old would not understand a word, replace it.
- Reference Panchatantra stories or simple folk wisdom.
- Your tone is patient, loving, unhurried.
- Every answer must ultimately point toward: stillness, simplicity, the next small step.`,
};

function buildWisdomPrompt(problem, persona) {
  const voiceRules = PERSONA_VOICE_RULES[persona];

  const systemPrompt = `You are a wise guide in the AI Gurukul system — an application that brings 5000 years of Indian wisdom to modern life problems.

PERSONA: ${persona.toUpperCase()}
${voiceRules}

RESPONSE FORMAT — you must follow this EXACTLY. Use these exact section headers:

STORY:
[A short tale (3–5 sentences) from Indian tradition — Panchatantra, Bhagavad Gita, Arthashastra, Upanishads, or Mahabharata — that directly mirrors the user's situation. The story must end with a moment of realisation or turning point.]

LESSON:
[One single sentence. The sharpest possible distillation of the moral. Make it memorable enough to tattoo.]

ADVICE:
DO: [One specific thing to do today or this week]
AVOID: [One specific behaviour, thought, or habit to stop]
THINK: [One reframe — a new way to see the situation]

SCIENCE:
[2–3 sentences connecting the ancient wisdom to modern psychology, neuroscience, or behavioural science. Name the specific concept (e.g. "cognitive reframing", "default mode network", "autonomy paradox"). Make the bridge feel real, not forced.]

ACTION_PLAN:
1. [Concrete step — doable within 7 days, specific and measurable]
2. [Concrete step — doable within 7 days, specific and measurable]
3. [Concrete step — doable within 7 days, specific and measurable]

RULES:
- Stay fully in persona voice throughout.
- Never use generic self-help language ("believe in yourself", "you've got this").
- The story must be genuinely from Indian tradition — not invented.
- Science section must name a real psychological concept.
- Action steps must be specific enough that the user knows exactly what to do.`;

  const userMessage = `User's problem: "${problem}"

Please provide your wisdom as ${persona}.`;

  return { systemPrompt, userMessage };
}

/**
 * Parse the raw Claude text response into a structured object.
 */
function parseWisdomResponse(rawText) {
  // Normalize by stripping markdown bold asterisks
  const raw = rawText.replace(/\*\*/g, "");

  const extract = (label, nextLabels) => {
    // Match label case-insensitively with colon
    const regex = new RegExp(`${label}:`, 'i');
    const match = raw.match(regex);
    if (!match) return "";
    const start = match.index;
    let end = raw.length;
    for (const next of nextLabels) {
      const nextRegex = new RegExp(`${next}:`, 'i');
      const nextMatch = raw.slice(start + match[0].length).match(nextRegex);
      if (nextMatch) {
        const idx = start + match[0].length + nextMatch.index;
        if (idx < end) end = idx;
      }
    }
    return raw.slice(start + match[0].length, end).trim();
  };

  const adviceRaw = extract("ADVICE", ["SCIENCE", "ACTION_PLAN"]);
  const parseAdviceLine = (prefix) => {
    const regex = new RegExp(`${prefix}:\\s*(.+)`, 'i');
    const match = adviceRaw.match(regex);
    return match ? match[1].trim() : "";
  };

  const actionRaw = extract("ACTION_PLAN", []);
  const actions = actionRaw
    .split("\n")
    .filter((l) => /^\d\./.test(l.trim()))
    .map((l) => l.replace(/^\d\.\s*/, "").trim());

  return {
    story: extract("STORY", ["LESSON", "ADVICE", "SCIENCE", "ACTION_PLAN"]),
    lesson: extract("LESSON", ["ADVICE", "SCIENCE", "ACTION_PLAN"]),
    advice: {
      do: parseAdviceLine("DO"),
      avoid: parseAdviceLine("AVOID"),
      think: parseAdviceLine("THINK"),
    },
    science: extract("SCIENCE", ["ACTION_PLAN"]),
    actionPlan: actions,
  };
}

module.exports = { buildWisdomPrompt, parseWisdomResponse };
