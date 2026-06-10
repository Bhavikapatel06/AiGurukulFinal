/**
 * AyurvedaChat.js
 * Premium split-pane Ayurveda chatbot.
 * Left panel  → Personalized Ayurvedic remedy flow (AI-generated)
 * Right panel → Chat interface (AI-powered via Anthropic API)
 * Fully responsive: stacks on mobile with tab toggle.
 */

import { state, actions } from '../hooks/useGurukul.js';
import { BACKEND_URL } from '../config.js';

let _container = null;
let _mobilePanelTab = 'info'; // 'info' | 'chat'
let currentFlowData = null;
let isFlowLoading = false;

export function renderAyurvedaChat(container) {
  _container = container;
  _mobilePanelTab = 'chat'; // start on chat tab on mobile
  currentFlowData = null;
  isFlowLoading = false;

  injectStyles();
  buildLayout();
  updateLayoutState();
}

/* ─── Inject styles once ──────────────────────────────────────────────────── */
function injectStyles() {
  const existing = document.getElementById('ayur-chat-styles');
  if (existing) existing.remove();
  const s = document.createElement('style');
  s.id = 'ayur-chat-styles';
  s.textContent = `
    /* ── Screen override ── */
    body:has(#screen-chatbot.active),
    html:has(#screen-chatbot.active) {
      height: 100vh !important;
      height: 100dvh !important;
      overflow: hidden !important;
    }

    #screen-chatbot.active {
      display: flex !important;
      flex-direction: column !important;
      height: 100vh !important;
      height: 100dvh !important;
      overflow: hidden !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 9999 !important;
      background: #0d0b08 !important;
    }

    /* ── Wrapper ── */
    .ayc-wrapper {
      display: flex;
      flex-direction: column;
      width: 100% !important;
      height: 100% !important;
      background: #0d0b08;
      font-family: 'Lato', sans-serif;
      overflow: hidden;
      position: relative !important;
    }

    /* ── Top Header ── */
    .ayc-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 24px;
      border-bottom: 1px solid rgba(212,175,55,0.18);
      background: rgba(20, 16, 10, 0.97);
      flex-shrink: 0;
      gap: 12px;
      backdrop-filter: blur(8px);
    }
    .ayc-back-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      background: transparent;
      border: 1px solid rgba(212,175,55,0.25);
      border-radius: 8px;
      color: var(--text-muted, #C8BFA8);
      padding: 8px 16px;
      font-size: 13px;
      font-family: 'Lato', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .ayc-back-btn:hover {
      border-color: var(--gold, #D4AF37);
      color: var(--gold, #D4AF37);
    }
    .ayc-header-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 0;
    }
    .ayc-header-title {
      font-family: 'Cinzel', serif;
      font-size: 17px;
      font-weight: 700;
      color: var(--gold, #D4AF37);
      letter-spacing: 1px;
    }
    .ayc-header-sub {
      font-size: 11px;
      color: rgba(212,175,55,0.5);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .ayc-herb-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(58,155,140,0.1);
      border: 1px solid rgba(58,155,140,0.3);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      color: #3A9B8C;
      font-family: 'Cinzel', serif;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── Mobile tab toggle ── */
    .ayc-mobile-tabs {
      display: none;
      border-bottom: 1px solid rgba(212,175,55,0.15);
      background: rgba(20, 16, 10, 0.98);
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    }
    .ayc-mob-tab {
      flex: 1;
      padding: 14px 8px;
      font-family: 'Cinzel', serif;
      font-size: 12px;
      letter-spacing: 1px;
      color: rgba(212,175,55,0.45);
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .ayc-mob-tab.active {
      color: var(--gold, #D4AF37);
      border-bottom-color: var(--gold, #D4AF37);
      background: rgba(212,175,55,0.03);
      text-shadow: 0 0 6px rgba(212,175,55,0.3);
    }
    @media (max-width: 820px) {
      .ayc-mobile-tabs { display: flex; }
      .ayc-herb-badge { display: none; }
    }

    /* ── Main split body ── */
    .ayc-body {
      display: flex;
      flex: 1 !important;
      min-height: 0 !important;
      overflow: hidden;
      gap: 0;
    }

    /* ── Left: Info Panel ── */
    .ayc-info-panel {
      width: 60%;
      min-width: 320px;
      max-width: 900px;
      min-height: 0 !important;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(212,175,55,0.13);
      background: rgba(14, 11, 7, 0.6);
      flex-shrink: 0;
      overflow: hidden;
    }
    .ayc-info-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 22px 22px 32px;
      -webkit-overflow-scrolling: touch;
    }
    .ayc-info-scroll::-webkit-scrollbar { width: 4px; }
    .ayc-info-scroll::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.15); border-radius: 4px; }

    .ayc-flow-empty, .ayc-flow-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px 20px;
      text-align: center;
    }
    .ayc-flow-spinner {
      width: 40px;
      height: 40px;
      border: 2px solid rgba(212,175,55,0.1);
      border-radius: 50%;
      border-top-color: var(--gold, #D4AF37);
      animation: ayc-spin 1s linear infinite;
    }
    @keyframes ayc-spin { to { transform: rotate(360deg); } }
    .ayc-flow-container {
      padding: 24px 20px;
      animation: ayc-fadein 0.3s ease both;
    }
    .ayc-flow-title {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      color: var(--gold, #D4AF37);
      margin-bottom: 18px;
      line-height: 1.4;
      text-align: center;
      border-bottom: 1px solid rgba(212,175,55,0.15);
      padding-bottom: 12px;
    }
    .ayc-flow-analysis {
      background: rgba(212,175,55,0.03);
      border: 1px solid rgba(212,175,55,0.1);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 24px;
    }
    .ayc-flow-subtitle {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(212,175,55,0.6);
      margin-bottom: 6px;
      font-weight: bold;
    }
    .ayc-flow-analysis p {
      font-size: 13px;
      color: #C8BFA8;
      line-height: 1.6;
      margin: 0;
    }
    .ayc-flow-steps {
      position: relative;
      padding-left: 20px;
      margin-bottom: 24px;
    }
    .ayc-flow-steps::before {
      content: '';
      position: absolute;
      left: 31px;
      top: 10px;
      bottom: 10px;
      width: 1px;
      background: linear-gradient(180deg, rgba(212,175,55,0.4) 0%, rgba(212,175,55,0.05) 100%);
    }
    .ayc-flow-step-item {
      display: flex;
      gap: 16px;
      margin-bottom: 22px;
      position: relative;
    }
    .ayc-flow-step-badge {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #1a1410;
      border: 1px solid var(--gold, #D4AF37);
      color: var(--gold, #D4AF37);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(212,175,55,0.25);
      z-index: 1;
    }
    .ayc-flow-step-content { flex: 1; }
    .ayc-flow-step-title {
      font-family: 'Cinzel', serif;
      font-size: 13.5px;
      color: var(--gold, #D4AF37);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .ayc-flow-step-desc {
      font-size: 13px;
      color: #B8AF98;
      line-height: 1.65;
    }
    .ayc-flow-warning {
      background: rgba(226,75,74,0.05);
      border: 1px solid rgba(226,75,74,0.18);
      border-radius: 8px;
      padding: 14px 16px;
    }
    .ayc-flow-warning-title {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 1px;
      color: #ff6b6a;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 6px;
    }
    .ayc-flow-warning p {
      font-size: 12.5px;
      color: #ff8e8d;
      line-height: 1.55;
      margin: 0;
    }

    /* ── Right: Chat Panel ── */
    .ayc-chat-panel {
      flex: 1 !important;
      min-height: 0 !important;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: rgba(10, 8, 6, 0.98);
      min-width: 0;
    }
    .ayc-chat-topbar {
      padding: 14px 20px;
      border-bottom: 1px solid rgba(212,175,55,0.13);
      font-family: 'Cinzel', serif;
      font-size: 13px;
      color: var(--gold, #D4AF37);
      letter-spacing: 0.5px;
      background: rgba(20, 16, 10, 0.95);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ayc-chat-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #3A9B8C;
      font-family: 'Lato', sans-serif;
    }
    .ayc-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #3A9B8C;
      animation: ayc-pulse 2s ease-in-out infinite;
    }
    @keyframes ayc-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* Messages */
    .ayc-messages {
      flex: 1 !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 13px;
      -webkit-overflow-scrolling: touch;
    }
    .ayc-messages::-webkit-scrollbar { width: 4px; }
    .ayc-messages::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.15); border-radius: 4px; }

    .ayc-bubble {
      padding: 13px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.65;
      max-width: 82%;
      word-wrap: break-word;
      animation: ayc-fadein 0.3s ease both;
    }
    @keyframes ayc-fadein {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ayc-bubble.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #7a5a10 0%, #c49a28 100%);
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(139,105,20,0.2);
      border-bottom-right-radius: 4px;
    }
    .ayc-bubble.user p,
    .ayc-bubble.user span,
    .ayc-bubble.user strong {
      color: #fff !important;
    }
    .ayc-bubble.assistant {
      align-self: flex-start;
      background: #1e1810;
      border: 1px solid rgba(212,175,55,0.15);
      color: #EDE8D5;
      border-bottom-left-radius: 4px;
    }
    .ayc-bubble.assistant strong { color: var(--gold, #D4AF37); }
    .ayc-bubble.thinking {
      align-self: flex-start;
      background: #1a1510;
      border: 1px solid rgba(212,175,55,0.1);
      color: rgba(212,175,55,0.5);
      font-size: 13px;
      font-style: italic;
    }

    /* Suggestion chips */
    .ayc-chips {
      padding: 10px 18px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      background: rgba(16, 12, 8, 0.5);
      border-top: 1px solid rgba(212,175,55,0.07);
      flex-shrink: 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .ayc-chips::-webkit-scrollbar { display: none; }
    .ayc-chip {
      background: rgba(212,175,55,0.05);
      border: 1px solid rgba(212,175,55,0.2);
      border-radius: 20px;
      color: rgba(212,175,55,0.7);
      padding: 7px 14px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      font-family: 'Lato', sans-serif;
      flex-shrink: 0;
    }
    .ayc-chip:hover {
      background: rgba(212,175,55,0.12);
      color: var(--gold, #D4AF37);
      border-color: var(--gold, #D4AF37);
      transform: translateY(-1px);
    }

    /* Input area */
    .ayc-input-area {
      padding: 14px 18px;
      border-top: 1px solid rgba(212,175,55,0.15);
      background: rgba(20, 16, 10, 0.97);
      flex-shrink: 0;
    }
    .ayc-input-row {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .ayc-input {
      flex: 1;
      padding: 12px 16px;
      background: #13100c;
      border: 1px solid rgba(212,175,55,0.2);
      border-radius: 10px;
      font-size: 14px;
      color: #EDE8D5;
      font-family: 'Lato', sans-serif;
      outline: none;
      transition: all 0.25s;
      resize: none;
      caret-color: #facc15;
    }
    .ayc-input:focus {
      border-color: rgba(212,175,55,0.5);
      box-shadow: 0 0 0 3px rgba(212,175,55,0.06);
      background: #17130f;
    }
    .ayc-input::placeholder { color: rgba(212,175,55,0.3); }
    .ayc-send-btn {
      width: 46px;
      height: 46px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3A9B8C 0%, #2E7D71 100%);
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(58,155,140,0.25);
      flex-shrink: 0;
    }
    .ayc-send-btn:hover {
      background: linear-gradient(135deg, #46b5a5 0%, #35907f 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(58,155,140,0.35);
    }
    .ayc-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* ── Responsive stacking on mobile ── */
    @media (max-width: 820px) {
      .ayc-info-panel,
      .ayc-chat-panel {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      .ayc-info-panel[data-hidden="false"],
      .ayc-chat-panel[data-hidden="false"] {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(0);
      }
      .ayc-info-panel[data-hidden="true"] {
        opacity: 0;
        pointer-events: none;
        transform: translateX(-20px);
      }
      .ayc-chat-panel[data-hidden="true"] {
        opacity: 0;
        pointer-events: none;
        transform: translateX(20px);
      }
      .ayc-body {
        position: relative;
        overflow: hidden;
      }
      .ayc-topbar { padding: 12px 16px; }
      .ayc-header-title { font-size: 15px; }
      .ayc-input { font-size: 16px; }
      .ayc-input-area {
        padding-bottom: calc(14px + env(safe-area-inset-bottom, 12px));
      }
      .ayc-flow-title { font-size: 16px; }
    }

    @media (max-width: 480px) {
      .ayc-back-btn span { display: none; }
      .ayc-bubble { max-width: 90%; font-size: 13px; }
    }

    /* ── No Flow layout overrides (full-width ChatGPT-style mode) ── */
    .ayc-wrapper.no-flow .ayc-info-panel {
      display: none !important;
    }
    .ayc-wrapper.no-flow .ayc-mobile-tabs {
      display: none !important;
    }
    .ayc-wrapper.no-flow .ayc-body {
      justify-content: center;
      background: rgba(10, 8, 6, 0.98);
    }
    .ayc-wrapper.no-flow .ayc-chat-panel {
      flex: 1 1 auto !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      max-width: 860px !important;
      height: 100% !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      transform: none !important;
      border-left: none !important;
      border-right: none !important;
      background: transparent !important;
    }
    /* Hide the redundant "Consult with Guru" sub-header in full-width mode */
    .ayc-wrapper.no-flow .ayc-chat-topbar {
      display: none !important;
    }
    /* Chips: wrap and center them */
    .ayc-wrapper.no-flow .ayc-chips {
      overflow-x: unset !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      gap: 8px !important;
      padding: 10px 20px !important;
    }
    /* Remove chip flex-shrink so they wrap naturally */
    .ayc-wrapper.no-flow .ayc-chip {
      flex-shrink: 1 !important;
      white-space: normal !important;
      text-align: center !important;
    }
    /* Bigger padding for messages in full-width mode */
    .ayc-wrapper.no-flow .ayc-messages {
      padding: 24px 24px !important;
    }
    /* User/assistant bubbles already have max-width 82% which is fine */
  `;
  document.head.appendChild(s);
}

/* ─── Build full layout ──────────────────────────────────────────────────── */
function buildLayout() {
  _container.innerHTML = `
    <div class="ayc-wrapper" id="ayc-root">

      <!-- Top header -->
      <div class="ayc-topbar">
        <button class="ayc-back-btn" id="ayc-back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Back to Learn</span>
        </button>
        <div class="ayc-header-center">
          <div class="ayc-header-title">🌿 Ayurvedic Consult</div>
          <div class="ayc-header-sub">Ancient herbal wisdom &amp; remedies</div>
        </div>
        <div style="width: 120px; flex-shrink: 0;"></div>
      </div>

      <!-- Mobile tab switcher -->
      <div class="ayc-mobile-tabs">
        <button class="ayc-mob-tab ${_mobilePanelTab === 'info' ? 'active' : ''}" data-tab="info" id="ayc-tab-info">📋 Remedy Flow</button>
        <button class="ayc-mob-tab ${_mobilePanelTab === 'chat' ? 'active' : ''}" data-tab="chat" id="ayc-tab-chat">💬 Chat</button>
      </div>

      <!-- Main split body -->
      <div class="ayc-body" id="ayc-body">

        <!-- LEFT: Remedy Flow Panel -->
        <div class="ayc-info-panel" id="ayc-info-panel" data-hidden="${_mobilePanelTab === 'info' ? 'false' : 'true'}">
          <div id="ayc-left-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            ${renderLeftContent()}
          </div>
        </div>

        <!-- RIGHT: Chat Panel -->
        <div class="ayc-chat-panel" id="ayc-chat-panel" data-hidden="${_mobilePanelTab === 'chat' ? 'false' : 'true'}">
          <div class="ayc-chat-topbar">
            <span>💬 Consult with Guru</span>
            <div class="ayc-chat-status">
              <div class="ayc-status-dot"></div>
              Online
            </div>
          </div>
          <div class="ayc-messages" id="ayc-messages">
            ${renderWelcome()}
          </div>
          <div class="ayc-chips" id="ayc-chips">
            ${renderChips()}
          </div>
          <div class="ayc-input-area">
            <div class="ayc-input-row">
              <input
                type="text"
                class="ayc-input"
                id="ayc-input"
                placeholder="Ask about your symptoms or health concern…"
                autocomplete="off"
              />
              <button class="ayc-send-btn" id="ayc-send">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  bindEvents();
}

/* ─── Left panel content ─────────────────────────────────────────────────── */
function renderLeftContent() {
  if (isFlowLoading) {
    return `
      <div class="ayc-flow-loading">
        <div class="ayc-flow-spinner"></div>
        <div style="font-family: 'Cinzel', serif; color: var(--gold); font-size: 14px; margin-top: 16px; letter-spacing: 1px;">Formulating Healing Flow...</div>
        <div style="color: rgba(212,175,55,0.5); font-size: 12px; margin-top: 6px;">Consulting ancient texts for your concern...</div>
      </div>
    `;
  }
  if (!currentFlowData) {
    return `
      <div class="ayc-flow-empty">
        <div style="font-size: 36px; margin-bottom: 14px;">🌿</div>
        <div style="font-family: 'Cinzel', serif; color: var(--gold); font-size: 15px; margin-bottom: 10px;">Ayurvedic Healing Protocol</div>
        <p style="color: rgba(212,175,55,0.55); font-size: 13px; line-height: 1.65; max-width: 290px; margin: 0 auto 20px;">
          Share your health concern in the chat and a personalized step-by-step Ayurvedic protocol will appear here automatically.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 290px;">
          <div style="background: rgba(212,175,55,0.04); border: 1px solid rgba(212,175,55,0.1); border-radius: 8px; padding: 12px 14px; text-align: left;">
            <div style="font-family: 'Cinzel', serif; font-size: 10px; color: rgba(212,175,55,0.5); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px;">Dosha Analysis</div>
            <div style="font-size: 12px; color: rgba(200,191,168,0.4); font-style: italic;">Will update after your first message...</div>
          </div>
          <div style="background: rgba(212,175,55,0.04); border: 1px solid rgba(212,175,55,0.1); border-radius: 8px; padding: 12px 14px; text-align: left;">
            <div style="font-family: 'Cinzel', serif; font-size: 10px; color: rgba(212,175,55,0.5); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px;">Remedy Strategy</div>
            <div style="font-size: 12px; color: rgba(200,191,168,0.4); font-style: italic;">Personalized protocol loading...</div>
          </div>
          <div style="background: rgba(212,175,55,0.04); border: 1px solid rgba(212,175,55,0.1); border-radius: 8px; padding: 12px 14px; text-align: left;">
            <div style="font-family: 'Cinzel', serif; font-size: 10px; color: rgba(212,175,55,0.5); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px;">Healing Protocol</div>
            <div style="font-size: 12px; color: rgba(200,191,168,0.4); font-style: italic;">Steps will appear here...</div>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="ayc-info-scroll" style="flex: 1;">
      <div class="ayc-flow-container">
        <h3 class="ayc-flow-title">${currentFlowData.title}</h3>
        <div class="ayc-flow-analysis">
          <div class="ayc-flow-subtitle">Dosha Analysis</div>
          <p>${currentFlowData.doshaAnalysis}</p>
        </div>
        <div class="ayc-flow-steps">
          ${currentFlowData.steps.map((s, idx) => `
            <div class="ayc-flow-step-item">
              <div class="ayc-flow-step-badge">${s.step || idx + 1}</div>
              <div class="ayc-flow-step-content">
                <div class="ayc-flow-step-title">${s.title}</div>
                <div class="ayc-flow-step-desc">${s.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
        ${currentFlowData.warning ? `
          <div class="ayc-flow-warning">
            <div class="ayc-flow-warning-title">⚠️ Safety &amp; Cautions</div>
            <p>${currentFlowData.warning}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function updateLeftContent() {
  const el = document.getElementById('ayc-left-content');
  if (el) el.innerHTML = renderLeftContent();
}

function updateLayoutState() {
  const root = document.getElementById('ayc-root');
  if (!root) return;

  const hasFlow = currentFlowData !== null || isFlowLoading;
  if (hasFlow) {
    root.classList.remove('no-flow');
  } else {
    root.classList.add('no-flow');
  }
}

/* ─── HTML helpers ───────────────────────────────────────────────────────── */
function renderWelcome() {
  return `<div class="ayc-bubble assistant">
    Namaste 🙏🌿 I'm your Ayurvedic Guru. Please share your symptoms or health concern, and I will formulate a customized step-by-step healing remedy flow for you.
  </div>`;
}

function renderChips() {
  const chips = [
    "Remedy for acid reflux?",
    "Natural way to improve sleep?",
    "How to manage stress and anxiety?",
    "Ayurvedic cure for dry cough?"
  ];
  return chips.map(c => `<button class="ayc-chip" data-q="${c}">${c}</button>`).join('');
}

/* ─── Event binding ──────────────────────────────────────────────────────── */
function bindEvents() {
  document.getElementById('ayc-back').onclick = () => {
    actions.setSolveMode('chat');
    if (_container) _container.innerHTML = '';
    actions.goTo('learn');
  };

  const input = document.getElementById('ayc-input');
  const sendBtn = document.getElementById('ayc-send');
  if (sendBtn) sendBtn.onclick = handleSend;
  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };
  }

  rebindChips();

  document.getElementById('ayc-tab-info')?.addEventListener('click', () => switchMobileTab('info'));
  document.getElementById('ayc-tab-chat')?.addEventListener('click', () => switchMobileTab('chat'));

  setMobileTab(_mobilePanelTab);
}

function switchMobileTab(tab) {
  _mobilePanelTab = tab;
  setMobileTab(tab);
}

function setMobileTab(tab) {
  const infoPanel = document.getElementById('ayc-info-panel');
  const chatPanel = document.getElementById('ayc-chat-panel');
  const tabInfo = document.getElementById('ayc-tab-info');
  const tabChat = document.getElementById('ayc-tab-chat');
  if (!infoPanel || !chatPanel) return;

  if (tab === 'info') {
    infoPanel.setAttribute('data-hidden', 'false');
    chatPanel.setAttribute('data-hidden', 'true');
    tabInfo?.classList.add('active');
    tabChat?.classList.remove('active');
  } else {
    infoPanel.setAttribute('data-hidden', 'true');
    chatPanel.setAttribute('data-hidden', 'false');
    tabChat?.classList.add('active');
    tabInfo?.classList.remove('active');
  }
}

function rebindChips() {
  document.querySelectorAll('.ayc-chip').forEach(btn => {
    btn.onclick = () => sendMessage(btn.getAttribute('data-q'));
  });
}

async function handleSend() {
  const input = document.getElementById('ayc-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  await sendMessage(msg);
}

async function fetchCustomFlow(msg) {
  isFlowLoading = true;
  updateLeftContent();
  
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat/flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.title && Array.isArray(data.steps) && data.steps.length > 0) {
      currentFlowData = data;
    } else {
      currentFlowData = buildLocalFlow(msg);
    }
  } catch (err) {
    console.warn("Flow API unavailable, using local protocol:", err.message);
    currentFlowData = buildLocalFlow(msg);
  } finally {
    isFlowLoading = false;
    updateLeftContent();
  }
}

/** Build a keyword-smart local flow when the API is unavailable */
function buildLocalFlow(msg) {
  const q = msg.toLowerCase();
  
  // Keyword detection for common health topics
  const is = (keys) => keys.some(k => q.includes(k));

  if (is(['acid', 'reflux', 'acidity', 'heartburn', 'stomach', 'digestion', 'digestive', 'gastric'])) {
    return {
      title: "Pitta Pacification Protocol — Digestive Health",
      doshaAnalysis: "Excess Pitta dosha is the primary cause of acid reflux and digestive fire imbalance. Aggravated Pitta creates excess heat and acid in the digestive tract, leading to burning sensations and discomfort.",
      steps: [
        { step: 1, title: "Phase 1: Cooling & Soothing (Week 1)", desc: "Drink cooled fennel seed tea (saunf) 3x daily. Avoid spicy, sour, and fried foods. Eat meals at fixed times. Start with Amla (Indian gooseberry) powder — 1 tsp in water before meals." },
        { step: 2, title: "Phase 2: Core Remedies (Weeks 2-4)", desc: "Take Avipattikar Churna (1 tsp before meals) to neutralize excess acid. Licorice root (Mulethi) tea soothes the stomach lining. Shatavari (500mg) twice daily helps heal gastric mucosa." },
        { step: 3, title: "Phase 3: Long-term Balance", desc: "Practice Sheetali pranayama (cooling breath) daily. Sleep on left side. Avoid eating 3 hours before bed. Include ghee, coconut, and cooling foods like cucumber and coriander in your diet." }
      ],
      warning: "Avoid Triphala if you have active ulcers. Consult a physician if symptoms persist beyond 2 weeks or if there is blood in stool."
    };
  }

  if (is(['sleep', 'insomnia', 'rest', 'wakeful', 'sleepless', 'night'])) {
    return {
      title: "Vata Calming Protocol — Sleep Restoration",
      doshaAnalysis: "Disturbed sleep is a classic sign of aggravated Vata dosha, which governs the nervous system. Excess Vata creates mental restlessness, light sleep, and early waking.",
      steps: [
        { step: 1, title: "Phase 1: Grounding Routine (Week 1)", desc: "Warm sesame oil self-massage (Abhyanga) on feet and scalp before bed. Drink warm milk with 1/4 tsp nutmeg and 1 tsp ghee at 9pm. Set a strict sleep schedule — lights out by 10pm." },
        { step: 2, title: "Phase 2: Herbal Support (Weeks 2-4)", desc: "Ashwagandha (600mg at night) is the premier nervine tonic for sleep. Brahmi (Bacopa) 300mg supports the mind. Jatamansi powder (1/4 tsp in warm milk) calms deep anxiety and induces sleep." },
        { step: 3, title: "Phase 3: Mind-Body Integration", desc: "Practice Yoga Nidra or Nadi Shodhana pranayama before sleep. Minimize screens after 8pm. Keep the bedroom cool and dark. A walk after dinner supports digestion and reduces evening Vata." }
      ],
      warning: "Ashwagandha may interact with thyroid medications. Nutmeg is safe in small amounts only — do not exceed 1/4 tsp. Consult a doctor if sleep problems last more than 2 weeks."
    };
  }

  if (is(['stress', 'anxiety', 'worry', 'nervous', 'tension', 'mental', 'mind', 'calm'])) {
    return {
      title: "Vata-Pitta Balance Protocol — Stress & Anxiety",
      doshaAnalysis: "Stress and anxiety reflect a combined Vata-Pitta imbalance. Vata creates fear and racing thoughts; Pitta adds irritability and intensity. Grounding and cooling practices are essential.",
      steps: [
        { step: 1, title: "Phase 1: Immediate Relief (Week 1)", desc: "Brahmi tea (boil 1 tsp brahmi leaves in water) 2x daily. Cold rose water on the forehead. Daily 10-minute Anulom Vilom pranayama (alternate nostril breathing) to calm the nervous system immediately." },
        { step: 2, title: "Phase 2: Adaptogen Protocol (Weeks 2-6)", desc: "Ashwagandha (500mg morning) is the king adaptogen for stress. Shankhapushpi syrup (2 tsp daily) improves mental calm. Tagar (Valerian) 250mg at night reduces anxiety and promotes rest." },
        { step: 3, title: "Phase 3: Lifestyle Reset", desc: "Daily Abhyanga (oil massage) with warm sesame oil calms the nervous system. Minimize caffeine and news intake. Practice gratitude journaling each morning. Swimming or walking in nature is highly therapeutic." }
      ],
      warning: "Do not stop prescribed medications without doctor guidance. If you experience panic attacks, consult a mental health professional alongside Ayurvedic care."
    };
  }

  if (is(['cough', 'cold', 'sore throat', 'throat', 'respiratory', 'breathing', 'lung', 'mucus', 'phlegm'])) {
    return {
      title: "Kapha Cleansing Protocol — Respiratory Health",
      doshaAnalysis: "Respiratory issues are typically Kapha-dominant conditions. Excess Kapha causes mucus buildup, congestion, and sluggish lung function. Warming and expectorant herbs are the primary treatment.",
      steps: [
        { step: 1, title: "Phase 1: Steam & Warm Therapy (Days 1-7)", desc: "Steam inhalation with eucalyptus or tulsi leaves 2x daily. Ginger-tulsi-black pepper tea (Kadha) 3x daily. Apply warm sesame oil on the chest at night. Avoid cold foods, dairy, and bananas." },
        { step: 2, title: "Phase 2: Herbal Expectorants (Weeks 2-3)", desc: "Sitopaladi Churna (1/2 tsp with honey) 3x daily is the classic Kapha respiratory formula. Vasaka (Malabar Nut) syrup clears bronchial passages. Trikatu (ginger, pepper, pippali) in warm water breaks mucus." },
        { step: 3, title: "Phase 3: Lung Strengthening", desc: "Pranayama: Kapalabhati (skull-shining breath) 5 minutes daily strengthens lung capacity. Triphala taken nightly supports immunity. Avoid exposure to cold winds and ensure adequate vitamin D." }
      ],
      warning: "Seek immediate medical attention if you have high fever, difficulty breathing, or blood in mucus. These remedies are for mild respiratory concerns only."
    };
  }

  if (is(['weight', 'fat', 'obese', 'obesity', 'slim', 'thin', 'metabolism'])) {
    return {
      title: "Kapha Reduction Protocol — Metabolism & Weight",
      doshaAnalysis: "Weight imbalance typically reflects Kapha dominance with sluggish Agni (digestive fire). Slow metabolism, water retention, and low energy are classic Kapha signs requiring stimulation and detox.",
      steps: [
        { step: 1, title: "Phase 1: Agni Activation (Week 1-2)", desc: "Drink warm water with ginger and lemon first thing each morning. Take Trikatu powder (1/4 tsp) before meals to ignite digestive fire. Follow a light, warm, cooked diet. Avoid heavy grains, dairy, and fried foods." },
        { step: 2, title: "Phase 2: Metabolic Herbs (Weeks 2-6)", desc: "Guggul (500mg twice daily) is the premier Ayurvedic fat-metabolism herb. Triphala (1 tsp at night) cleanses the colon and reduces Ama. Garcinia (Vrikshamla) before meals reduces appetite naturally." },
        { step: 3, title: "Phase 3: Active Lifestyle Integration", desc: "Vigorous exercise (brisk walk, sun salutations) for 30 minutes each morning. Dry brushing (Garshana) with raw silk gloves stimulates lymph flow. Intermittent fasting (16:8) works excellently with Kapha constitution." }
      ],
      warning: "Do not use Guggul if pregnant or nursing. Consult a physician before starting any herbal supplement if you have thyroid conditions."
    };
  }

  if (is(['skin', 'acne', 'pimple', 'eczema', 'rash', 'itching', 'psoriasis', 'glow', 'complexion'])) {
    return {
      title: "Pitta-Kapha Balancing Protocol — Skin Health",
      doshaAnalysis: "Skin issues primarily reflect excess Pitta (causing inflammation, redness, and heat) combined with Kapha (causing oiliness and toxin buildup). Blood purification is essential.",
      steps: [
        { step: 1, title: "Phase 1: Blood Purification (Week 1-2)", desc: "Neem leaf tea (2 cups daily) is the most potent blood purifier in Ayurveda. Apply neem and turmeric paste topically on affected areas. Eliminate dairy, sugar, and spicy foods completely for 2 weeks." },
        { step: 2, title: "Phase 2: Core Skin Herbs (Weeks 2-6)", desc: "Manjistha (500mg twice daily) is the premier Rasa-Rakta shodhan (blood cleanser). Sariva (Hemidesmus indicus) cools the blood. Khadirarishta (20ml after meals) purifies deeply. Aloe vera gel internally (30ml morning)." },
        { step: 3, title: "Phase 3: Topical Care & Diet", desc: "Rose water and sandalwood paste as a face mask 3x/week. Drink 3-4 liters of water daily. Include pomegranate, coconut water, and amla in your diet. Avoid alcohol and reduce sun exposure between 10am-4pm." }
      ],
      warning: "If skin condition is severe, infected, or covers large areas, consult a dermatologist. Internal herbal use during pregnancy requires physician guidance."
    };
  }

  // Generic comprehensive fallback for any other query
  const topic = msg.length > 60 ? msg.substring(0, 57) + '...' : msg;
  return {
    title: `Ayurvedic Wellness Protocol`,
    doshaAnalysis: `Based on your concern — "${topic}" — a thorough assessment of all three doshas (Vata, Pitta, Kapha) is recommended. The Guru will analyze your specific symptoms in the chat to determine which dosha is most imbalanced and prescribe the appropriate herbal protocol.`,
    steps: [
      { step: 1, title: "Phase 1: Ama (Toxin) Cleanse", desc: "Begin with warm water, ginger, and lemon each morning to kindle Agni (digestive fire). Triphala churna (1 tsp in warm water before bed) gently cleanses the digestive tract and eliminates Ama. Follow a light, warm, freshly cooked diet for 7-14 days." },
      { step: 2, title: "Phase 2: Dosha-Specific Herbs", desc: "Ashwagandha (Vata/stress), Guduchi (Pitta/immunity), and Trikatu (Kapha/digestion) are foundational Ayurvedic herbs. Once the Guru identifies your primary imbalance from the chat, a more targeted formulation will be recommended." },
      { step: 3, title: "Phase 3: Dinacharya (Daily Routine)", desc: "Rise at 6am, self-massage with warm sesame oil (Abhyanga), practice 10 minutes of Anulom Vilom pranayama, eat meals at regular fixed times, and sleep by 10pm. This daily rhythm is the most powerful Ayurvedic medicine." }
    ],
    warning: "All recommendations are for general wellness only. For serious, chronic, or worsening conditions, always consult a qualified Ayurvedic practitioner or medical doctor."
  };
}

async function sendMessage(msg) {
  // Guard: never send or display empty messages
  if (!msg || !msg.trim()) return;
  const cleanMsg = msg.trim();

  state.chatHistory.push({ role: 'user', content: cleanMsg });
  refreshMessages();
  scrollChat();

  // Asynchronously trigger custom flow generation on the left panel
  fetchCustomFlow(cleanMsg);

  // Left-panel flow generation runs in parallel via fetchCustomFlow(cleanMsg)

  // Show animated thinking bubble
  const messagesDiv = document.getElementById('ayc-messages');
  const thinkingId = 'ayc-thinking-' + Date.now();
  const thinking = document.createElement('div');
  thinking.className = 'ayc-bubble thinking';
  thinking.id = thinkingId;
  thinking.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:8px;">
      <span style="display:inline-flex;gap:4px;">
        <span style="width:6px;height:6px;border-radius:50%;background:rgba(212,175,55,0.5);animation:ayc-dot-bounce 1.2s ease-in-out infinite;animation-delay:0s;"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:rgba(212,175,55,0.5);animation:ayc-dot-bounce 1.2s ease-in-out infinite;animation-delay:0.2s;"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:rgba(212,175,55,0.5);animation:ayc-dot-bounce 1.2s ease-in-out infinite;animation-delay:0.4s;"></span>
      </span>
      <span>Guru is reflecting…</span>
    </span>
  `;
  if (!document.getElementById('ayc-dot-bounce-style')) {
    const style = document.createElement('style');
    style.id = 'ayc-dot-bounce-style';
    style.textContent = `@keyframes ayc-dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`;
    document.head.appendChild(style);
  }
  messagesDiv?.appendChild(thinking);
  scrollChat();

  const sendBtn = document.getElementById('ayc-send');
  if (sendBtn) sendBtn.disabled = true;

  let reply = null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        persona: 'guru', 
        message: cleanMsg, 
        history: state.chatHistory.slice(-10) 
      }),
    });

    document.getElementById(thinkingId)?.remove();

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data = await res.json();
    const reply = data.success && data.reply && data.reply.trim()
      ? data.reply.trim()
      : buildLocalChatReply(cleanMsg);

    state.chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    console.error("Chat API error:", err);
    document.getElementById(thinkingId)?.remove();
    state.chatHistory.push({
      role: 'assistant',
      content: buildLocalChatReply(cleanMsg)
    });
  }

  document.getElementById(thinkingId)?.remove();
  state.chatHistory.push({ role: 'assistant', content: reply });

  if (sendBtn) sendBtn.disabled = false;
  refreshMessages();
  scrollChat();
}

/** Generate a local Ayurvedic reply based on keywords when API is unavailable */
function buildLocalChatReply(msg) {
  const q = msg.toLowerCase();
  const is = (keys) => keys.some(k => q.includes(k));

  if (is(['acid', 'reflux', 'acidity', 'heartburn', 'gastric', 'stomach', 'digestion'])) {
    return `**Possible Cause:** Excess Pitta (heat) and increased acidity in the stomach.

**Try:**
* Take Amla powder (1 tsp) in cool water before meals.
* Drink warm fennel seed tea after meals.
* Eat cooling foods like cucumber and coconut water.

**Avoid:**
* Spicy, sour, and fried foods.
* Caffeine, alcohol, and hot spices.

**Safety Note:** If you experience severe burning or persistent chest pain, consult a doctor.`;
  }

  if (is(['sleep', 'insomnia', 'sleepless', 'wakeful', 'tired', 'fatigue'])) {
    return `**Possible Cause:** Aggravated Vata causing nervous system restlessness.

**Try:**
* Massage warm sesame oil onto your feet and scalp before bed.
* Drink warm milk with a pinch of nutmeg.
* Switch off screens 1 hour before sleep.

**Avoid:**
* Cold beverages in the evening.
* Strenuous exercise late at night.

**Safety Note:** If insomnia is chronic or accompanied by severe anxiety, consult a doctor.`;
  }

  if (is(['stress', 'anxiety', 'worry', 'nervous', 'tension', 'panic', 'calm'])) {
    return `**Possible Cause:** Vata-Pitta disturbance in the mind.

**Try:**
* Practice 5 minutes of Anulom Vilom pranayama.
* Take Ashwagandha with warm water.
* Drink Brahmi tea twice daily.

**Avoid:**
* Excessive caffeine and stimulants.
* Overworking and skipping meals.

**Safety Note:** If stress leads to panic attacks or chest pain, consult a doctor.`;
  }

  if (is(['cough', 'cold', 'throat', 'respiratory', 'mucus', 'phlegm', 'breathing'])) {
    return `**Possible Cause:** Excess Kapha (mucus) and reduced digestive fire.

**Try:**
* Drink warm Tulsi-ginger-black pepper tea (Kadha).
* Take 1/2 tsp Sitopaladi Churna with honey.
* Practice steam inhalation with eucalyptus.

**Avoid:**
* Cold drinks, ice cream, and yogurt.
* Heavy meals and dairy products.

**Safety Note:** If cough lasts more than a week or breathing is difficult, consult a doctor.`;
  }

  if (is(['skin', 'acne', 'pimple', 'rash', 'eczema', 'itching', 'glow'])) {
    return `**Possible Cause:** Aggravated Pitta and toxins (Ama) in the blood.

**Try:**
* Drink Neem tea twice daily to purify blood.
* Apply a paste of neem and turmeric to affected areas.
* Eat sweet, juicy fruits like pomegranates.

**Avoid:**
* Spicy, sour, and fermented foods.
* Refined sugar and heavy dairy.

**Safety Note:** If skin condition is severe, painful, or spreads rapidly, consult a doctor.`;
  }

  if (is(['weight', 'fat', 'obese', 'metabolism', 'slim'])) {
    return `**Possible Cause:** Sluggish Agni (digestive fire) and Kapha accumulation.

**Try:**
* Drink warm water with ginger and lemon each morning.
* Take Trikatu powder (1/4 tsp) before meals.
* Walk briskly for 30 minutes daily.

**Avoid:**
* Fried foods and cold drinks.
* Sleeping during the day.

**Safety Note:** For sudden weight changes or chronic metabolic issues, consult a doctor.`;
  }

  // Generic helpful response for unknown queries
  const topic = msg.length > 40 ? msg.substring(0, 40) + '...' : msg;
  return `**Possible Cause:** Imbalance in your bodily doshas related to: "${topic}".

**Try:**
* Drink warm ginger water in the morning.
* Take 1 tsp Triphala in warm water before bed.
* Practice 10 minutes of Anulom Vilom daily.

**Avoid:**
* Cold, stale, or highly processed foods.
* Eating when not hungry.

**Safety Note:** For severe, chronic, or worsening symptoms, consult a doctor.`;
}

function refreshMessages() {
  const messagesDiv = document.getElementById('ayc-messages');
  if (!messagesDiv) return;
  // Remove any orphaned thinking bubbles before full re-render
  messagesDiv.querySelectorAll('[id^="ayc-thinking-"]').forEach(el => el.remove());
  messagesDiv.innerHTML = renderWelcome() + renderHistory(state.chatHistory);
}

function renderHistory(history) {
  // Filter out any empty, null, or whitespace-only messages before rendering
  return history
    .filter(m => m && m.role && m.content && typeof m.content === 'string' && m.content.trim().length > 0)
    .map(m => `
      <div class="ayc-bubble ${m.role === 'user' ? 'user' : 'assistant'}">${formatMessage(m.content)}</div>
    `).join('');
}

// Format AI responses with simple markdown-like improvements
function formatMessage(content) {
  if (typeof content !== 'string') return '';
  const escaped = escapeHtml(content);
  // Convert **bold** to <strong>
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '</p><p style="margin:8px 0 0;">')
    .replace(/\n/g, '<br>');
}

function scrollChat() {
  const d = document.getElementById('ayc-messages');
  if (d) d.scrollTop = d.scrollHeight;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}