/**
 * PersonaSelect.js
 * Renders the persona selection screen.
 * Uses dynamic metadata from state.personas (loaded from /api/persona).
 */

import { state, actions } from '../hooks/useGurukul.js';

// Fallback if API metadata hasn't loaded yet
const FALLBACK_PERSONAS = {
  krishna: {
    emoji: '🧘', name: 'Krishna',
    tagline: 'Act without attachment to outcome',
    style_adjectives: ['Calm', 'Philosophical', 'Compassionate'],
    accent_color_hex: '#7B68EE',
    bg_color_hex: 'rgba(123,104,238,0.08)',
    border_color_hex: 'rgba(123,104,238,0.35)',
    tradition: 'Bhagavad Gita',
  },
  chanakya: {
    emoji: '👁️', name: 'Chanakya',
    tagline: 'Strategy is the sharpest form of wisdom',
    style_adjectives: ['Strategic', 'Bold', 'Practical'],
    accent_color_hex: '#C46B3A',
    bg_color_hex: 'rgba(196,107,58,0.08)',
    border_color_hex: 'rgba(196,107,58,0.35)',
    tradition: 'Arthashastra',
  },
  guru: {
    emoji: '🧑‍🏫', name: 'Guru',
    tagline: 'The simplest truth is always the deepest',
    style_adjectives: ['Warm', 'Simple', 'Nurturing'],
    accent_color_hex: '#3A9B8C',
    bg_color_hex: 'rgba(58,155,140,0.08)',
    border_color_hex: 'rgba(58,155,140,0.35)',
    tradition: 'Panchatantra',
  },
};

export function renderPersonaSelect(container) {
  const personas = Object.keys(FALLBACK_PERSONAS).reduce((acc, key) => {
    acc[key] = { ...FALLBACK_PERSONAS[key], ...(state.personas[key] || {}) };
    return acc;
  }, {});

  container.innerHTML = `
    <div class="screen-header">
      <button class="btn btn-ghost" id="back-btn">← Back</button>
      <span class="screen-header-title">Choose Your Guide</span>
    </div>

    <div class="persona-body">
      <h2 class="text-center anim-fade-up">Choose Your Guide</h2>
      ${state.solveMode !== 'chat' && state.solveMode !== 'ayurveda' ? `
      <p class="text-center anim-fade-up delay-1">
        Same wisdom, different lenses. Choose the perspective that resonates.
      </p>` : ''}

      ${state.solveMode !== 'chat' && state.solveMode !== 'ayurveda' ? `
      <div class="problem-preview anim-fade-up delay-2">
        <span class="problem-preview-label">Your question</span>
        <span class="problem-preview-text">"${escapeHtml(state.problem)}"</span>
      </div>` : ''}

      <div class="persona-grid">
        ${Object.entries(personas).map(([key, p], i) => `
          <button
            class="persona-card anim-fade-up delay-${i + 2}"
            data-persona="${key}"
            style="
              --p-accent: ${p.accent_color_hex};
              --p-bg:     ${p.bg_color_hex};
              --p-border: ${p.border_color_hex};
            "
          >
            <div class="persona-emoji">${p.emoji}</div>
            <div class="persona-name" style="color:${p.accent_color_hex}">${p.name}</div>
            <div class="persona-tradition">${p.tradition}</div>
            <div class="persona-tagline">"${p.tagline}"</div>
            <div class="persona-tags">
              ${(p.style_adjectives || []).slice(0, 3).map(adj =>
    `<span class="persona-tag" style="color:${p.accent_color_hex};border-color:${p.border_color_hex}">${adj}</span>`
  ).join('')}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.persona-card').forEach(card => {
    card.addEventListener('click', () => {
      // Visual selection feedback before API call
      container.querySelectorAll('.persona-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const persona = card.dataset.persona;
      setTimeout(() => actions.selectPersona(persona), 280);
    });
  });

  container.querySelector('#back-btn').addEventListener('click', () => {
    if (state.solveMode === 'chat') {
      actions.goTo('landing');
    } else if (state.comingFromKnowledgeGraph) {
      actions.goTo('knowledgeGraph');
    } else {
      actions.goTo('problem');
    }
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
