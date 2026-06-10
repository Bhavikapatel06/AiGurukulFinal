/**
 * useGurukul.js — Central application state manager
 *
 * Manages all state: current screen, problem, persona, wisdom response,
 * chat history, XP system, and loading/error states.
 *
 * Usage (vanilla JS module pattern):
 *   import { state, actions } from './hooks/useGurukul.js';
 *   actions.submitProblem('I cannot focus');
 */

import { fetchWisdom, switchPersona, fetchChat, fetchQuiz, fetchPersonas } from '../utils/api.js';
import { BACKEND_URL } from '../config.js';

// ── State ──────────────────────────────────────────────────────────────────
export const state = {
  screen: 'landing',          // 'landing' | 'problem' | 'persona' | 'response' | 'learn'
  problem: '',
  persona: '',
  previousPersona: '',
  personas: {},               // metadata from /api/persona
  wisdom: null,               // { story, lesson, advice, science, actionPlan }
  wisdomSummary: '',          // 1-line summary passed to chat
  chatHistory: [],            // [{ role, content }]
  chatLanguage: 'en',         // 'en' | 'hi' | 'gu'
  quizData: null,             // { question, options, feedback, tradition_reference }
  loading: false,
  error: null,
  xp: 0,
  level: 0,
  solveMode: 'chat',          // 'chat' | 'ayurveda'
  comingFromKnowledgeGraph: false,
  user: JSON.parse(localStorage.getItem('gurukul_user')),
  token: localStorage.getItem('gurukul_token'),
  game: {
    coins: 0,
    selectedUser: null,
    currentLevel: 1,
    unlockedLevels: { ramayana: 1, mahabharata: 1, ayurveda: 1, temples: 1 },
    inventory: [],
    completedLevels: [],
  },
  listeners: [],
};

const LEVELS = ['Seeker', 'Learner', 'Thinker', 'Philosopher', 'Acharya'];

// ── Notify listeners on state change ──────────────────────────────────────
function notify() {
  state.listeners.forEach(fn => fn({ ...state }));
}

export function subscribe(fn) {
  state.listeners.push(fn);
  return () => { state.listeners = state.listeners.filter(l => l !== fn); };
}

// ── XP System ─────────────────────────────────────────────────────────────
function addXP(amount) {
  state.xp += amount;
  if (state.xp >= 100) {
    state.xp = state.xp - 100;
    state.level = Math.min(LEVELS.length - 1, state.level + 1);
  }
  notify();
}

export function getLevelName() { return LEVELS[state.level]; }

// ── Actions ────────────────────────────────────────────────────────────────
export const actions = {

  /** Navigate to a named screen */
  goTo(screen) {
    // If not logged in, force 'auth'
    if (!state.token && screen !== 'auth') {
      state.screen = 'auth';
    } else {
      state.screen = screen;
    }
    state.error = null;
    if (screen === 'landing') {
      state.comingFromKnowledgeGraph = false;
    }
    notify();
  },

  // ── Auth Actions ────────────────────────────────────────────────────────
  async signup(username, password) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Signup failed');
      
      state.user = data.user;
      state.token = data.token;
      state.game = { ...state.game, ...data.user };
      localStorage.setItem('gurukul_token', data.token);
      localStorage.setItem('gurukul_user', JSON.stringify(data.user));
      actions.goTo('landing');
      return { success: true };
    } catch (err) {
      state.error = err.message;
      notify();
      return { success: false, message: err.message };
    }
  },

  async login(username, password) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Login failed');

      state.user = data.user;
      state.token = data.token;
      state.game = { ...state.game, ...data.user };
      localStorage.setItem('gurukul_token', data.token);
      localStorage.setItem('gurukul_user', JSON.stringify(data.user));
      actions.goTo('landing');
      return { success: true };
    } catch (err) {
      state.error = err.message;
      notify();
      return { success: false, message: err.message };
    }
  },

  async loginWithGoogle(credential) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Google login failed');

      state.user = data.user;
      state.token = data.token;
      state.game = { ...state.game, ...data.user };
      localStorage.setItem('gurukul_token', data.token);
      localStorage.setItem('gurukul_user', JSON.stringify(data.user));
      actions.goTo('landing');
      return { success: true };
    } catch (err) {
      state.error = err.message;
      notify();
      return { success: false, message: err.message };
    }
  },

  logout() {
    state.user = null;
    state.token = null;
    localStorage.removeItem('gurukul_token');
    localStorage.removeItem('gurukul_user');
    actions.goTo('auth');
  },

  async syncGame() {
    if (!state.token) return;
    try {
      await fetch(`${BACKEND_URL}/api/user/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(state.game)
      });
    } catch (err) {
      console.warn('Sync failed', err);
    }
  },

  setFromKnowledgeGraph(val) {
    state.comingFromKnowledgeGraph = val;
    notify();
  },

  setSolveMode(mode) {
    state.solveMode = mode;
    notify();
  },

  /** Set the problem text */
  setProblem(text) {
    state.problem = text;
    notify();
  },

  /** Load all persona metadata from backend (call once on app init) */
  async loadPersonas() {
    try {
      const data = await fetchPersonas();
      state.personas = data.personas;
      notify();
    } catch (err) {
      // Non-fatal: UI falls back to hardcoded values
      console.warn('[loadPersonas] Failed:', err.message);
    }
  },

  /** Select a persona and fetch wisdom */
  async selectPersona(persona) {
    // In chat or ayurveda mode, we skip problem validation
    if (state.solveMode !== 'chat' && state.solveMode !== 'ayurveda' && !state.problem.trim()) {
      state.error = 'Please enter your problem first.';
      notify();
      return;
    }

    state.persona = persona;
    state.previousPersona = '';
    state.chatHistory = [];
    state.quizData = null;
    state.loading = true;
    state.error = null;
    
    if (state.solveMode === 'chat' || state.solveMode === 'ayurveda') {
      state.screen = 'chatbot';
      state.loading = false;
      notify();
      return;
    }

    state.screen = 'response';
    notify();

    try {
      const data = await fetchWisdom(state.problem, persona);
      state.wisdom = data.wisdom;
      state.wisdomSummary = buildSummary(data.wisdom);
      state.loading = false;
      addXP(20);
    } catch (err) {
      state.loading = false;
      state.error = err.message;
      notify();
    }
  },

  /** Switch to a different persona — contrasting perspective */
  async switchPersona(newPersona) {
    if (newPersona === state.persona) return;

    state.previousPersona = state.persona;
    state.persona = newPersona;
    state.chatHistory = [];
    state.loading = true;
    state.error = null;
    notify();

    try {
      const data = await switchPersona(state.problem, state.previousPersona, newPersona);
      state.wisdom = data.wisdom;
      state.wisdomSummary = buildSummary(data.wisdom);
      state.loading = false;
      addXP(10);
    } catch (err) {
      state.loading = false;
      state.error = err.message;
      notify();
    }
  },

  /** Send a chat message in the sidebar */
  async sendChat(message) {
    if (!message.trim()) return;

    // We keep englishContent for the backend, content for the UI
    const finalHistoryLength = state.chatHistory.length;
    let englishMessage = message;

    // If not English, translate user's message TO English
    if (state.chatLanguage && state.chatLanguage !== 'en') {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${state.chatLanguage}&tl=en&dt=t&q=${encodeURIComponent(message)}`);
        const json = await res.json();
        englishMessage = json[0].map(item => item[0]).join('');
      } catch (e) {
        console.error("User message translation failed", e);
      }
    }

    const userMsg = { role: 'user', content: message, englishContent: englishMessage };
    state.chatHistory.push(userMsg);
    state.loading = true;
    notify();

    try {
      // Send English message and English history back to the server
      const englishHistory = state.chatHistory.slice(-10).map(m => ({ 
        role: m.role, 
        content: m.englishContent || m.content 
      }));

      const data = await fetchChat(
        state.persona,
        englishMessage,
        englishHistory,
        state.wisdomSummary
      );
      
      let reply = data.reply;
      if (state.chatLanguage && state.chatLanguage !== 'en') {
        try {
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${state.chatLanguage}&dt=t&q=${encodeURIComponent(reply)}`);
          const json = await res.json();
          reply = json[0].map(item => item[0]).join('');
        } catch (e) {
          console.error("Translation failed", e);
        }
      }
      
      state.chatHistory.push({ role: 'assistant', content: reply, englishContent: data.reply });
      state.loading = false;
      addXP(5);
    } catch (err) {
      state.chatHistory.push({
        role: 'assistant',
        content: 'My words failed to reach you just now. Please ask again.',
        englishContent: 'My words failed to reach you just now. Please ask again.'
      });
      state.loading = false;
      notify();
    }
  },

  /** Load reflection quiz */
  async loadQuiz() {
    state.loading = true;
    state.error = null;
    notify();

    try {
      const data = await fetchQuiz(state.problem, state.persona);
      state.quizData = data.quiz;
      state.loading = false;
      notify();
    } catch (err) {
      state.loading = false;
      state.error = err.message;
      notify();
    }
  },

  /** Award XP for completing reflection */
  completeReflection() {
    addXP(30);
  },

  setChatLanguage(lang) {
    state.chatLanguage = lang;
    notify();
  },

  clearError() {
    state.error = null;
    notify();
  },

  // ── Game Actions ────────────────────────────────────────────────────────
  gameSwitchUser(user) {
    state.game.selectedUser = user;
    state.screen = 'game-levels';
    notify();
  },

  gameSelectLevel(lvl) {
    state.game.currentLevel = lvl;
    state.screen = 'game-play';
    notify();
  },

  async gameAwardCoins(amount) {
    state.game.coins += amount;
    notify();
    await actions.syncGame();
  },

  async gameCompleteLevel(user, lvl) {
    const tag = `${user}-${lvl}`;
    if (!state.game.completedLevels.includes(tag)) {
      state.game.completedLevels.push(tag);
      const next = lvl + 1;
      if (next <= 20) {
        state.game.unlockedLevels[user] = Math.max(state.game.unlockedLevels[user], next);
      }
    }
    notify();
    await actions.syncGame();
  },

  async gamePurchaseItem(item) {
    if (state.game.coins >= item.price) {
      state.game.coins -= item.price;
      state.game.inventory.push({ 
        id: item.id, 
        purchasedFor: state.game.selectedUser 
      });
      notify();
      await actions.syncGame();
      return true;
    }
    return false;
  }
};

// ── Helper: build a short summary string from wisdom for chat context ──────
function buildSummary(wisdom) {
  if (!wisdom) return '';
  return `Lesson: "${wisdom.lesson}". Advice: Do — ${wisdom.advice?.do}. Avoid — ${wisdom.advice?.avoid}.`;
}
