require("dotenv").config();

process.on('uncaughtException', (err) => {
  console.error("Uncaught Exception:", err);
});

process.on('unhandledRejection', (err) => {
  console.error("Unhandled Rejection:", err);
});

const express = require('express');
const cors = require('cors');
const { Pinecone } = require("@pinecone-database/pinecone");
const { CohereClient } = require("cohere-ai");
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

// 1. Initialize Pinecone and Cohere safely
let pc = null;
let index = null;
let cohere = null;

try {
  if (process.env.PINECONE_API_KEY) {
    pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    index = pc.index("aigurukul-index");
  } else {
    console.warn("⚠️ PINECONE_API_KEY is missing. RAG functionality will fall back to AI.");
  }
} catch (err) {
  console.warn("⚠️ Pinecone failed to initialize:", err.message);
}

try {
  if (process.env.COHERE_API_KEY) {
    cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
  } else {
    console.warn("⚠️ COHERE_API_KEY is missing. RAG functionality will fall back to AI.");
  }
} catch (err) {
  console.warn("⚠️ Cohere failed to initialize:", err.message);
}
// Keywords for auto-detecting persona if not specified
const keywords = {
  krishna: ['karma', 'peace', 'arjuna', 'meditation', 'dharma', 'gita', 'detachment'],
  chanakya: ['strategy', 'success', 'money', 'power', 'enemy', 'king', 'policy', 'study'],
  guru: ['health', 'dosha', 'ayurveda', 'nature', 'yoga', 'study', 'balance', 'learn']
};

function detectPersona(message) {
  message = message.toLowerCase();
  for (const [persona, words] of Object.entries(keywords)) {
    if (words.some(word => message.includes(word))) {
      return persona;
    }
  }
  return 'guru'; // Default persona
}
// Common retrieval function (Step 2: Query Pinecone)
async function getContext(collectionName, query, nResults = 2) {
  try {
    // 1. Embed the user's question using Cohere v3 (inputType: "search_query" is required for queries)
    const queryEmbeddingResponse = await cohere.embed({
      model: "embed-english-v3.0",
      texts: [query],
      input_type: "search_query"
    });
    
    // Safely extract the embedding
    const queryVector = queryEmbeddingResponse.embeddings[0];

    if (!queryVector) throw new Error("Query Embedding failed");

    // 2. Search Pinecone in the specific namespace matching the persona
    const queryResult = await index.namespace(collectionName).query({
      topK: nResults,
      vector: queryVector,
      includeMetadata: true,
    });

    // 3. Extract text from results
    if (queryResult.matches && queryResult.matches.length > 0) {
      return queryResult.matches.map(r => r.metadata.text).join('\n\n');
    }
  } catch (error) {
    console.error(`Error querying Pinecone namespace ${collectionName}:`, error);
  }
  return '';
}

// Base agent to call LLM using Cohere
async function runAgentPrompt(systemPrompt, context, query) {
  const strictSystemPrompt = `${systemPrompt} 

*** CRITICAL DIRECTIVE ***
1. You are strictly a closed-domain bot. You MUST ONLY use the facts provided in the 'Context knowledge retrieved from database'. 
2. If the user's question asks for information not explicitly mentioned in the context (or if the context says 'No matching context found'), YOU MUST REFUSE TO ANSWER. 
3. If you refuse, reply exactly: "Please ask questions according to the topics covered in my texts. I can only provide answers based on the ancient wisdom provided to me."
4. DO NOT make up information. DO NOT use your internal training data. DO NOT attempt to answer general knowledge questions.`;

  const combinedPrompt = `Context knowledge retrieved from database:
${context || 'No matching context found.'}

User Query: ${query}`;

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 60000)
  );

  // Use Cohere's highly capable command-r-plus model for generation
  const response = await Promise.race([
    cohere.chat({
      model: "command-r-plus-08-2024", // Exchanged command-r for command-r-plus due to deprecation
      message: combinedPrompt,
      preamble: strictSystemPrompt // Preamble acts as the system prompt instructions
    }),
    timeout
  ]);

  return response.text;
}
// 1. Krishna Agent
async function krishnaAgent(query, history = []) {
  const context = await getContext('krishna_collection', query);
  const systemPrompt = "You are Krishna. Your tone is calm, philosophical, and spiritual. You give wisdom, detachment, and life guidance based on the Bhagavad Gita and Mahabharata.";
  console.log("Retrieved Context:", context);
  return runAgentPrompt(systemPrompt, context, query);
}

// 2. Chanakya Agent
async function chanakyaAgent(query, history = []) {
  const context = await getContext('chanakya_collection', query);
  const systemPrompt = "You are Chanakya. Your tone is practical, strategic, and logical. You give actionable, real-world advice drawing from Chanakya Neeti and Arthashastra.";
  return runAgentPrompt(systemPrompt, context, query);
}

// 3. Guru Agent
async function guruAgent(query, history = []) {
  const context = await getContext('guru_collection', query);
  const systemPrompt = "You are a traditional Indian Guru. Your tone is simple, teacher-like, and you use easy explanations. You explain concepts from Ayurveda and the Indian Knowledge System in simple terms.";
  return runAgentPrompt(systemPrompt, context, query);
}

// Main Agent Executor
async function agentExecutor({ message, persona, history = [] }) {
  const selectedPersona = persona ? persona.toLowerCase() : detectPersona(message);

  let response;
  switch (selectedPersona) {
    case 'krishna':
      response = await krishnaAgent(message, history);
      break;
    case 'chanakya':
      response = await chanakyaAgent(message, history);
      break;
    case 'guru':
    default:
      response = await guruAgent(message, history);
      break;
  }

  return { personaUsed: selectedPersona, response };
}

app.post('/chat', async (req, res) => {
  console.log("🔥 RAG API HIT");
  try {
    const { message, persona } = req.body;

    console.log("Incoming:", req.body);

    if (!cohere || !index) {
      return res.status(500).json({ success: false, error: "Pinecone or Cohere API key is missing. Falling back to AI." });
    }

    const result = await agentExecutor(req.body);
    res.json({ success: true, reply: result.response });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// QUIZ GENERATOR — File Upload + Topic-Based
// ═══════════════════════════════════════════════════════════

// Multer config — store uploads in /tmp/uploads for Render free-tier
const uploadsDir = '/tmp/uploads';
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Unsupported file type. Use TXT or DOCX.'));
  }
});

// Helper: chunk text into overlapping segments
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 20) chunks.push(chunk.trim());
  }
  return chunks;
}

// Helper: extract text from uploaded file
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    // For txt, md, doc — just read as text
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`Error extracting text from ${ext} file:`, err);
    throw err;
  }
}

// Helper: generate quiz from context using LLM
async function generateQuizFromContext(context, numQuestions, source = 'document') {
  const prompt = `You are a quiz generator. Based ONLY on the following context, generate exactly ${numQuestions} multiple-choice quiz questions. Each question must have exactly 4 options (A, B, C, D) with only one correct answer.

Context:
${context}

IMPORTANT: Return ONLY valid JSON in this exact format, no extra text:
{
  "questions": [
    {
      "question": "What is...?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Generate exactly ${numQuestions} questions. Make them thoughtful and educational. Vary difficulty. Return ONLY the JSON object.`;

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 60000)
  );
  
  const response = await Promise.race([
      cohere.chat({
        model: "command-r-08-2024",
        message: prompt,
        max_tokens: 4000,
        preamble: `You are an expert quiz generator. You MUST output exactly ${numQuestions} questions. Do not stop early. You output ONLY valid JSON. No markdown, no code fences.`
      }),
    timeout
  ]);

  let raw = response.text.trim();
  const startIdx = raw.indexOf('{');
  const endIdx = raw.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
    raw = raw.substring(startIdx, endIdx + 1);
  }
  const quiz = JSON.parse(raw);
  if (quiz.questions && quiz.questions.length > numQuestions) {
    quiz.questions = quiz.questions.slice(0, numQuestions);
  }
  return quiz;
}

// ── POST /quiz/upload — Upload file → extract text → generate quiz directly ──
app.post('/quiz/upload', upload.single('file'), async (req, res) => {
  console.log("📝 Quiz Upload API HIT");
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const numQuestions = Math.min(15, Math.max(1, parseInt(req.body.numQuestions) || 5));
    const filePath = req.file.path;

    console.log(`Processing file: ${req.file.originalname}, questions: ${numQuestions}`);

    // 1. Extract text from the file
    let text;
    try {
      text = await extractText(filePath);
    } catch (extractErr) {
      console.error('Text extraction error:', extractErr);
      return res.status(400).json({ success: false, error: `Failed to read the file (${extractErr.message || 'Unknown error'}). Make sure it is a valid PDF, DOCX, or text file.` });
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ success: false, error: 'Could not extract enough text from file. Minimum 50 characters needed.' });
    }

    console.log(`Extracted ${text.length} characters from file`);

    // 2. Chunk text and pick the most content-rich chunks
    const chunks = chunkText(text, 400, 30);
    console.log(`Created ${chunks.length} chunks`);

    // 3. Take up to 8 chunks (spread evenly across the document for variety)
    let selectedChunks;
    if (chunks.length <= 8) {
      selectedChunks = chunks;
    } else {
      const step = Math.floor(chunks.length / 8);
      selectedChunks = [];
      for (let i = 0; i < chunks.length && selectedChunks.length < 8; i += step) {
        selectedChunks.push(chunks[i]);
      }
    }

    const context = selectedChunks.join('\n\n');
    console.log(`Using ${selectedChunks.length} chunks as context (${context.length} chars)`);

    // 4. Generate quiz directly from the extracted content
    const prompt = `You are a quiz generator. Based on the following document content, generate exactly ${numQuestions} multiple-choice quiz questions. The questions should test understanding of the key concepts, facts, and ideas in this document.

Document content:
${context}

RULES:
- Generate questions ONLY about the content provided above.
- Each question must have exactly 4 options (A, B, C, D) with only one correct answer.
- Make questions educational and varied in difficulty.
- Questions should test comprehension of the material.
- If the document content is primarily in Sanskrit, generate the quiz questions, options, and explanations entirely in the Sanskrit language. Otherwise, use English.

Return ONLY valid JSON in this exact format, no extra text:
{
  "questions": [
    {
      "question": "What is...?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Generate exactly ${numQuestions} questions. Return ONLY the JSON object.`;

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 90000));
    const response = await Promise.race([
      cohere.chat({
        model: "command-r-08-2024",
        message: prompt,
        max_tokens: 4000,
        preamble: `You are an expert quiz generator. You MUST output exactly ${numQuestions} questions. Do not stop early. You output ONLY valid JSON. No markdown, no code fences.`
      }),
      timeout
    ]);

    let raw = response.text.trim();
    const startIdx = raw.indexOf('{');
    const endIdx = raw.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      raw = raw.substring(startIdx, endIdx + 1);
    }
    const quiz = JSON.parse(raw);
    if (quiz.questions && quiz.questions.length > numQuestions) {
      quiz.questions = quiz.questions.slice(0, numQuestions);
    }

    res.json({ success: true, quiz: quiz.questions, source: req.file.originalname });

  } catch (error) {
    console.error('Quiz upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate quiz' });
  }
});

// ── POST /quiz/topic — Topic string → generate quiz directly about the topic ──
app.post('/quiz/topic', async (req, res) => {
  console.log("📝 Quiz Topic API HIT");
  try {
    const { topic, numQuestions: nq } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const numQuestions = Math.min(15, Math.max(1, parseInt(nq) || 5));
    console.log(`Generating quiz for topic: "${topic}", questions: ${numQuestions}`);

    // Try to get supplementary context from RAG collections
    let ragContext = '';
    const collections = ['krishna_collection', 'chanakya_collection', 'guru_collection'];

    for (const colName of collections) {
      try {
        const ctx = await getContext(colName, topic, 2);
        if (ctx) ragContext += ctx + '\n';
      } catch (e) {
        // skip
      }
    }

    // Build a topic-focused prompt (RAG is supplementary, not primary)
    const prompt = `You are a quiz generator. Generate exactly ${numQuestions} multiple-choice quiz questions specifically about the topic: "${topic}".

${ragContext ? `Here is some supplementary reference material that may help (use it only if relevant to "${topic}"):\n${ragContext}\n` : ''}

CRITICAL RULES:
- Every question MUST be directly about "${topic}" — do not generate questions about unrelated topics.
- Each question must have exactly 4 options (A, B, C, D) with only one correct answer.
- Make questions educational, factual, and varied in difficulty.
- Use your own knowledge about "${topic}" to create accurate questions.
- If the topic "${topic}" is written in Sanskrit, you MUST generate the quiz questions, options, and explanations entirely in the Sanskrit language. Otherwise, use English.

Return ONLY valid JSON in this exact format, no extra text:
{
  "questions": [
    {
      "question": "What is...?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Generate exactly ${numQuestions} questions about "${topic}". Return ONLY the JSON object.`;

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 90000));
    const response = await Promise.race([
      cohere.chat({
        model: "command-r-08-2024",
        message: prompt,
        max_tokens: 4000,
        preamble: `You are an expert quiz generator. You MUST output exactly ${numQuestions} questions. Do not stop early. You output ONLY valid JSON. No markdown, no code fences.`
      }),
      timeout
    ]);

    let raw = response.text.trim();
    const startIdx = raw.indexOf('{');
    const endIdx = raw.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      raw = raw.substring(startIdx, endIdx + 1);
    }
    const quiz = JSON.parse(raw);
    if (quiz.questions && quiz.questions.length > numQuestions) {
      quiz.questions = quiz.questions.slice(0, numQuestions);
    }

    res.json({ success: true, quiz: quiz.questions, source: topic });

  } catch (error) {
    console.error('Quiz topic error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate quiz' });
  }
});

// Production Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// Health Route for Render
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "RAG Backend" });
});

app.get('/', (req, res) => {
  res.send('RAG Backend is running securely.');
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`RAG Backend running on port ${PORT}`);
});
