/**
 * ResponseCards.js
 * Renders the main response area — 5 structured wisdom cards.
 * Also renders the persona switcher and XP bar in the header.
 */

import { state, actions } from '../hooks/useGurukul.js';

const PERSONA_META = {
  krishna: { emoji: '🧘', label: 'Krishna', color: '#7B68EE' },
  chanakya: { emoji: '👁️', label: 'Chanakya', color: '#C46B3A' },
  guru:     { emoji: '🧑‍🏫', label: 'Guru',    color: '#3A9B8C' },
};

const CARD_CONFIG = [
  { id: 'story',       icon: '📖', label: 'Ancient Story' },
  { id: 'lesson',      icon: '🧠', label: 'The Lesson' },
  { id: 'advice',      icon: '💡', label: 'Real-Life Advice' },
  { id: 'science',     icon: '🔬', label: 'Science Connection' },
  { id: 'action_plan', icon: '⚡', label: '3-Step Action Plan' },
];

export function renderResponseCards(container) {
  if (state.loading) {
    renderLoading(container);
    return;
  }

  if (!state.wisdom) return;

  const pm = PERSONA_META[state.persona];
  const w  = state.wisdom;

  container.innerHTML = `
    <div class="persona-switcher">
      <span class="switcher-label">Switch perspective:</span>
      ${Object.entries(PERSONA_META).map(([key, p]) => `
        <button
          class="switch-btn ${key === state.persona ? 'active' : ''}"
          data-persona="${key}"
          style="${key === state.persona
            ? `border-color:${p.color};color:${p.color};background:${p.color}18`
            : ''}"
        >
          ${p.emoji} ${p.label}
        </button>
      `).join('')}
    </div>

    <div class="context-bar">
      <span class="context-label">Your question</span>
      <span class="context-text">"${escapeHtml(state.problem)}"</span>
      <span class="badge badge-${state.persona}">${pm.emoji} ${pm.label}</span>
    </div>

    ${state.error ? `<div class="error-banner">${state.error}</div>` : ''}

    <!-- Card 1: Story -->
    <div class="response-card anim-fade-up" style="border-color:${pm.color}22">
      <div class="card-header">
        <span class="card-icon">📖</span>
        <span class="card-label">Ancient Story</span>
      </div>
      <div class="card-body">${w.story}</div>
    </div>

    <!-- Card 2: Lesson -->
    <div class="response-card anim-fade-up delay-1">
      <div class="card-header">
        <span class="card-icon">🧠</span>
        <span class="card-label">The Lesson</span>
      </div>
      <blockquote class="quote-block">${w.lesson}</blockquote>
    </div>

    <!-- Card 3: Advice -->
    <div class="response-card anim-fade-up delay-2">
      <div class="card-header">
        <span class="card-icon">💡</span>
        <span class="card-label">Real-Life Advice</span>
      </div>
      <div class="advice-grid">
        <div class="advice-item">
          <span class="advice-tag do">Do</span>
          <p>${w.advice?.do || ''}</p>
        </div>
        <div class="advice-item">
          <span class="advice-tag avoid">Avoid</span>
          <p>${w.advice?.avoid || ''}</p>
        </div>
        <div class="advice-item">
          <span class="advice-tag think">Think</span>
          <p>${w.advice?.think || ''}</p>
        </div>
      </div>
    </div>

    <!-- Card 4: Science -->
    <div class="response-card anim-fade-up delay-3">
      <div class="card-header">
        <span class="card-icon">🔬</span>
        <span class="card-label">Science Connection</span>
      </div>
      <div class="card-body">${w.science}</div>
    </div>

    <!-- Card 5: Action Plan -->
    <div class="response-card anim-fade-up delay-4">
      <div class="card-header">
        <span class="card-icon">⚡</span>
        <span class="card-label">Your 3-Step Action Plan</span>
      </div>
      <ul class="action-list">
        ${(w.actionPlan || []).map((step, i) => `
          <li>
            <div class="action-num">${i + 1}</div>
            <div>${step}</div>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="gold-divider"></div>

    <div class="reflect-cta text-center mb-4">
      <button class="btn btn-primary" id="reflect-btn">
        🪞 Reflect on This Wisdom
      </button>
    </div>

    <div id="quiz-container"></div>
  `;

  // Persona switch buttons
  container.querySelectorAll('.switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newPersona = btn.dataset.persona;
      if (newPersona !== state.persona) {
        actions.switchPersona(newPersona);
      }
    });
  });

  // Reflection quiz trigger
  container.querySelector('#reflect-btn').addEventListener('click', async () => {
    container.querySelector('#reflect-btn').disabled = true;
    container.querySelector('#reflect-btn').textContent = 'Loading reflection…';
    await actions.loadQuiz();
  });
}

export function renderLoading(container) {
  container.innerHTML = `
    <div class="loading-wrap">
      <div class="spinner"></div>
      <p class="loading-label">Summoning wisdom…</p>
    </div>
  `;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
