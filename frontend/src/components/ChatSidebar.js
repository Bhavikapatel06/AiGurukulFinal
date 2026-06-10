/**
 * ChatSidebar.js
 * Renders the sidebar chat panel.
 * Appends new messages as state.chatHistory updates.
 */

import { state, actions } from '../hooks/useGurukul.js';

const PERSONA_OPENERS = {
  krishna: 'Namaste 🙏 The wisdom above is your foundation. Ask me to go deeper, explain simpler, or show you what to do right now.',
  chanakya: 'The words above are your strategy. Ask me to sharpen them, give you an example, or tell you your immediate next move.',
  guru: 'Sit with what you have read. If anything is unclear, ask me. I will make it as simple as sharing a cup of chai.',
};

export function renderChatSidebar(container) {
  container.innerHTML = `
    <div class="sidebar-header">
      <span>💬 Ask the Guru</span>
      <span class="sidebar-persona-name">${state.persona}</span>
    </div>

    <div class="chat-messages" id="chat-messages">
      <div class="chat-bubble assistant">
        ${PERSONA_OPENERS[state.persona] || PERSONA_OPENERS.guru}
      </div>
      ${renderMessageList(state.chatHistory)}
    </div>

    <div class="sidebar-input-wrap">
      <input
        type="text"
        class="input sidebar-input"
        id="chat-input"
        placeholder="Ask anything..."
        autocomplete="off"
        maxlength="300"
      />
      <button class="send-btn" id="send-btn" aria-label="Send">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <div class="quick-prompts">
      <button class="quick-btn" data-msg="Explain this simpler">Explain simpler</button>
      <button class="quick-btn" data-msg="Give me a real example">Give example</button>
      <button class="quick-btn" data-msg="What should I do right now?">Next step</button>
    </div>
  `;

  const input = container.querySelector('#chat-input');
  const sendBtn = container.querySelector('#send-btn');
  const messagesEl = container.querySelector('#chat-messages');

  function send() {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    actions.sendChat(msg);
  }

  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  sendBtn.addEventListener('click', send);

  container.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.msg;
      send();
    });
  });
}

/** Append only new messages since last render to avoid full re-render flicker */
export function updateChatMessages(container, prevLength) {
  const messagesEl = container.querySelector('#chat-messages');
  if (!messagesEl) return;

  const newMessages = state.chatHistory.slice(prevLength);
  newMessages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'} anim-fade-in`;
    div.textContent = msg.content;
    messagesEl.appendChild(div);
  });

  // Show/hide loading indicator
  let typingEl = messagesEl.querySelector('.typing-indicator');
  if (state.loading && state.chatHistory.length > 0) {
    if (!typingEl) {
      typingEl = document.createElement('div');
      typingEl.className = 'chat-bubble assistant typing-indicator';
      typingEl.innerHTML = '<span class="dot-pulse"></span><span class="dot-pulse"></span><span class="dot-pulse"></span>';
      messagesEl.appendChild(typingEl);
    }
  } else if (typingEl) {
    typingEl.remove();
  }

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMessageList(history) {
  return history.map(msg => `
    <div class="chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}">
      ${escapeHtml(msg.content)}
    </div>
  `).join('');
}
