/**
 * AyurvedaChat.js
 * Premium split-pane Ayurveda chatbot.
 * Left panel  → Herb process / properties info
 * Right panel → Chat interface
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
}

/* ─── Inject styles once ──────────────────────────────────────────── */
function injectStyles() {
  if (document.getElementById('ayur-chat-styles')) return;
  const s = document.createElement('style');
  s.id = 'ayur-chat-styles';
  s.textContent = `
    /* ── Wrapper ── */
    .ayc-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      background: #0d0b08;
      font-family: 'Lato', sans-serif;
      overflow: hidden;
      position: relative;
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
      flex: 1;
      overflow: hidden;
      gap: 0;
    }

    /* ── Left: Info Panel ── */
    .ayc-info-panel {
      width: 60%;
      min-width: 320px;
      max-width: 900px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(212,175,55,0.13);
      background: rgba(14, 11, 7, 0.6);
      flex-shrink: 0;
      overflow: hidden;
    }
    .ayc-herb-selector {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(212,175,55,0.13);
      background: rgba(22, 17, 11, 0.95);
    }
    .ayc-herb-selector label {
      display: block;
      font-family: 'Cinzel', serif;
      font-size: 10px;
      color: rgba(212,175,55,0.5);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .ayc-herb-select {
      width: 100%;
      background: #1a1410;
      border: 1px solid rgba(212,175,55,0.2);
      color: #EDE8D5;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13.5px;
      font-family: 'Lato', sans-serif;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4AF37' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }
    .ayc-herb-select:focus { border-color: var(--gold, #D4AF37); }

    .ayc-info-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 22px 22px 32px;
      -webkit-overflow-scrolling: touch;
    }
    .ayc-info-scroll::-webkit-scrollbar { width: 4px; }
    .ayc-info-scroll::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.15); border-radius: 4px; }

    /* Herb info blocks */
    .ayc-herb-name-wrap { margin-bottom: 18px; }
    .ayc-herb-lat { font-size: 11px; color: rgba(212,175,55,0.4); font-style: italic; letter-spacing: 1px; margin-bottom: 4px; }
    .ayc-herb-name {
      font-family: 'Noto Sans Devanagari', serif;
      font-size: 28px;
      color: var(--gold, #D4AF37);
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 3px;
    }
    .ayc-herb-ro { font-size: 15px; color: #C8BFA8; font-style: italic; margin-bottom: 2px; }
    .ayc-herb-en { font-family: 'Cinzel', serif; font-size: 13px; color: rgba(212,175,55,0.6); }

    .ayc-props-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 16px 0;
    }
    .ayc-prop {
      background: rgba(212,175,55,0.04);
      border: 1px solid rgba(212,175,55,0.12);
      border-radius: 8px;
      padding: 9px 10px;
      text-align: center;
    }
    .ayc-prop-lbl {
      display: block;
      font-size: 9px;
      color: rgba(212,175,55,0.45);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .ayc-prop-val { font-size: 11px; color: var(--gold, #D4AF37); font-weight: 600; }

    .ayc-tags-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
    .ayc-tag {
      font-size: 10px;
      padding: 3px 10px;
      border-radius: 20px;
      background: rgba(58,155,140,0.08);
      border: 1px solid rgba(58,155,140,0.22);
      color: #3A9B8C;
      letter-spacing: 0.5px;
    }

    .ayc-divider {
      height: 1px;
      background: linear-gradient(90deg, rgba(212,175,55,0.2), transparent);
      margin: 16px 0;
    }

    .ayc-info-sec { margin-bottom: 18px; }
    .ayc-info-lbl {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(212,175,55,0.55);
      margin-bottom: 7px;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .ayc-info-lbl::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(212,175,55,0.1);
    }
    .ayc-info-val { font-size: 13.5px; color: #B8AF98; line-height: 1.75; }
    .ayc-how-box {
      background: rgba(58,155,140,0.04);
      border-left: 3px solid rgba(58,155,140,0.5);
      border-radius: 0 8px 8px 0;
      padding: 13px 16px;
      font-size: 13.5px;
      color: #B8AF98;
      line-height: 1.75;
    }
    .ayc-warn-box {
      background: rgba(226,75,74,0.06);
      border: 1px solid rgba(226,75,74,0.2);
      border-radius: 8px;
      padding: 12px 15px;
      font-size: 13px;
      color: #ff6b6a;
      line-height: 1.65;
    }

    /* ── Right: Chat Panel ── */
    .ayc-chat-panel {
      flex: 1;
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
      flex: 1;
      overflow-y: auto;
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
      color: #fff;
      box-shadow: 0 4px 14px rgba(139,105,20,0.2);
      border-bottom-right-radius: 4px;
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
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
    }
    .ayc-chips::-webkit-scrollbar {
      display: none; /* Safari/Chrome */
    }
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
      .ayc-topbar {
        padding: 12px 16px;
      }
      .ayc-header-title { font-size: 15px; }
      .ayc-input {
        font-size: 16px; /* Prevents auto-zoom on input focus on iOS */
      }
      .ayc-input-area {
        padding-bottom: calc(14px + env(safe-area-inset-bottom, 12px));
      }
      .ayc-flow-title {
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .ayc-back-btn span { display: none; }
      .ayc-bubble { max-width: 90%; font-size: 13px; }
      .ayc-props-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* ── Left tabs & custom flow ── */
    .ayc-left-tabs {
      display: flex;
      background: rgba(22, 17, 11, 0.95);
      border-bottom: 1px solid rgba(212,175,55,0.15);
      flex-shrink: 0;
    }
    .ayc-left-tab {
      flex: 1;
      padding: 12px 8px;
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 1.5px;
      color: rgba(212,175,55,0.45);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      font-weight: bold;
    }
    .ayc-left-tab.active {
      color: var(--gold, #D4AF37);
      border-bottom-color: var(--gold, #D4AF37);
      background: rgba(212,175,55,0.02);
    }
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
    @keyframes ayc-spin {
      to { transform: rotate(360deg); }
    }
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
    .ayc-flow-step-content {
      flex: 1;
    }
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
  `;
  document.head.appendChild(s);
}

/* ─── Build full layout ──────────────────────────────────────────── */
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

        <!-- LEFT: Custom Remedy Flow Panel -->
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

/* ─── Render dynamic left content ────────────────────────────────── */
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
        <div style="font-size: 32px; margin-bottom: 12px;">⚡</div>
        <div style="font-family: 'Cinzel', serif; color: var(--gold); font-size: 15px; margin-bottom: 8px;">Dynamic Healing Protocol</div>
        <p style="color: rgba(212,175,55,0.6); font-size: 13px; line-height: 1.6; max-width: 280px; margin: 0 auto;">
          Ask the Guru any health concern or remedy question in the chat. A step-by-step Ayurvedic protocol will be generated here in real-time.
        </p>
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
  const contentEl = document.getElementById('ayc-left-content');
  if (contentEl) {
    contentEl.innerHTML = renderLeftContent();
  }
}

/* ─── HTML builders ──────────────────────────────────────────────── */
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

/* ─── Event binding ──────────────────────────────────────────────── */
function bindEvents() {
  // Back button
  document.getElementById('ayc-back').onclick = () => {
    actions.setSolveMode('chat');
    if (_container) _container.innerHTML = '';
    actions.goTo('learn');
  };

  // Send button
  const input = document.getElementById('ayc-input');
  const sendBtn = document.getElementById('ayc-send');
  if (sendBtn) sendBtn.onclick = handleSend;
  if (input) {
    input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  }

  // Chips
  rebindChips();

  // Mobile tabs
  document.getElementById('ayc-tab-info')?.addEventListener('click', () => switchMobileTab('info'));
  document.getElementById('ayc-tab-chat')?.addEventListener('click', () => switchMobileTab('chat'));

  // Init correct mobile tab
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

/* ─── Chat message handling ──────────────────────────────────────── */
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
    const data = await res.json();
    if (data.success) {
      currentFlowData = data;
    } else {
      currentFlowData = {
        title: "Ayurvedic Healing Protocol",
        doshaAnalysis: "Consult with our Guru for custom dosha details.",
        steps: [
          { step: 1, title: "Remedy Strategy", desc: "Consult the recommendations in your active chat conversation." }
        ],
        warning: "Always practice caution when taking herbal formulas."
      };
    }
  } catch (err) {
    console.error("Failed to fetch custom flow:", err);
    currentFlowData = {
      title: "Ayurvedic Healing Protocol",
      doshaAnalysis: "Could not generate flow because the backend is offline.",
      steps: [
        { step: 1, title: "Online Chat", desc: "Please ask your question in the chat and consult the Guru." }
      ],
      warning: "Ensure your backend is running on port 3001."
    };
  } finally {
    isFlowLoading = false;
    updateLeftContent();
  }
}

async function sendMessage(msg) {
  state.chatHistory.push({ role: 'user', content: msg });
  refreshMessages();
  scrollChat();

  // Asynchronously trigger custom flow generation on the left panel
  fetchCustomFlow(msg);

  // Show thinking bubble
  const messagesDiv = document.getElementById('ayc-messages');
  const thinkingId = 'ayc-thinking-' + Date.now();
  const thinking = document.createElement('div');
  thinking.className = 'ayc-bubble thinking';
  thinking.id = thinkingId;
  thinking.textContent = 'Guru is reflecting…';
  messagesDiv?.appendChild(thinking);
  scrollChat();

  // Disable send while waiting
  const sendBtn = document.getElementById('ayc-send');
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        persona: 'guru', 
        message: msg, 
        history: state.chatHistory.slice(-10) 
      }),
    });
    const data = await res.json();
    document.getElementById(thinkingId)?.remove();
    state.chatHistory.push({
      role: 'assistant',
      content: data.success ? data.reply : 'The Guru is in deep meditation. Please try again.',
    });
  } catch (err) {
    console.error("Chat API error:", err);
    document.getElementById(thinkingId)?.remove();
    state.chatHistory.push({ role: 'assistant', content: 'Connection lost. Please try again.' });
  }

  if (sendBtn) sendBtn.disabled = false;
  refreshMessages();
  scrollChat();
}

function refreshMessages() {
  const messagesDiv = document.getElementById('ayc-messages');
  if (!messagesDiv) return;
  messagesDiv.innerHTML = renderWelcome() + renderHistory(state.chatHistory);
}

function renderHistory(history) {
  return history.map(m => `
    <div class="ayc-bubble ${m.role}">${escapeHtml(m.content)}</div>
  `).join('');
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
