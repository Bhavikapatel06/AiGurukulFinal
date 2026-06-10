/**
 * api.js — All backend API calls for AI Gurukul frontend
 *
 * Usage:
 *   import { fetchWisdom, fetchPersonas, fetchChat, fetchQuiz, switchPersona } from './utils/api.js';
 */

import { BACKEND_URL } from '../config.js';

const BASE_URL = `${BACKEND_URL}/api`;
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

/**
 * GET all persona metadata for rendering selection cards
 * Returns: { personas: { krishna: {...}, chanakya: {...}, guru: {...} } }
 */
export async function fetchPersonas() {
  const res = await fetch(`${BASE_URL}/persona`);
  return handleResponse(res);
}

/**
 * POST wisdom request — main 5-section response
 * @param {string} problem
 * @param {string} persona
 */
export async function fetchWisdom(problem, persona) {
  const res = await fetch(`${BASE_URL}/wisdom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem, persona }),
  });
  return handleResponse(res);
}

/**
 * POST switch persona — different story, contrasting perspective
 * @param {string} problem
 * @param {string} previousPersona
 * @param {string} newPersona
 */
export async function switchPersona(problem, previousPersona, newPersona) {
  const res = await fetch(`${BASE_URL}/wisdom/switch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem, previousPersona, newPersona }),
  });
  return handleResponse(res);
}

/**
 * POST chat message
 * @param {string} persona
 * @param {string} message
 * @param {Array}  history  — [{ role, content }, ...]
 * @param {string} previousResponseSummary
 */
export async function fetchChat(persona, message, history, previousResponseSummary) {
  console.log("👉 Calling OpenRouter Chat API...");
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona, message, history, previousResponseSummary }),
  });
  return handleResponse(res);
}

/**
 * POST reflection quiz generation
 * @param {string} problem
 * @param {string} persona
 */
export async function fetchQuiz(problem, persona) {
  const res = await fetch(`${BASE_URL}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem, persona }),
  });
  return handleResponse(res);
}
