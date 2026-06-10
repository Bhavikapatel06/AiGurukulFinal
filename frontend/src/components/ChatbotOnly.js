import { state, actions } from '../hooks/useGurukul.js';

const PERSONA_OPENERS = {
  krishna: 'Namaste 🙏 Ask me anything, and I shall answer in my true spirit.',
  chanakya: 'Ask your question. Be direct, and I shall provide the strategy.',
  guru: 'Speak your mind. I am listening.',
};

const hindiLayout = {
  default: [
    "१ २ ३ ४ ५ ६ ७ ८ ९ ० - =",
    "ौ ै ा ी ू ब ह ग द ज ड",
    "ो े ् ि ु प र क त च ट",
    "ओ ए अ इ उ फ ल म न व स",
    "{shift} {space} {bksp}"
  ],
  shift: [
    "१ २ ३ ४ ५ ६ ७ ८ ९ ० - =",
    "औ ऐ आ ई ऊ भ ङ घ ध झ ढ",
    "ओ ऍ ऋ ॠ ळ फ ऱ ख थ छ ठ",
    "ऊ ए ङ इ उ ण ळ श ञ श ष",
    "{shift} {space} {bksp}"
  ]
};

const gujaratiLayout = {
  default: [
    "૧ ૨ ૩ ૪ ૫ ૬ ૭ ૮ ૯ ૦ - =",
    "ૌ ૈ ા ી ૂ બ હ ગ દ જ ડ",
    "ો ે ્ િ ુ પ ર ક ત ચ ટ",
    "ઓ એ અ ઇ ઉ ફ લ મ ન વ સ",
    "{shift} {space} {bksp}"
  ],
  shift: [
    "૧ ૨ ૩ ૪ ૫ ૬ ૭ ૮ ૯ ૦ - =",
    "ઔ ઐ આ ઈ ઊ ભ ઞ ઘ ધ ઝ ઢ",
    "ઓ ઍ ઋ ૠ ળ ફ ષ ખ થ છ ઠ",
    "ઊ એ ઞ ઇ ઉ ણ ળ શ ઞ શ ષ",
    "{shift} {space} {bksp}"
  ]
};

export function renderChatbotOnly(container) {
  const savedLang = state.chatLanguage || 'en';

  if (!document.getElementById('chatbot-only-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'chatbot-only-styles';
    styleEl.textContent = `
      .chatbot-only-wrapper {
        display: flex;
        flex-direction: column;
        height: 100vh;
        height: 100dvh;
        background: var(--bg, #0d0b08);
        overflow: hidden;
        position: relative;
        width: 100%;
      }

      .chatbot-header {
        padding: 14px 20px;
        border-bottom: 1px solid var(--gold-border, rgba(212,175,55,0.15));
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'Cinzel', serif;
        font-size: 13px;
        color: var(--gold, #D4AF37);
        background: var(--surface, #13100c);
        flex-shrink: 0;
        gap: 12px;
      }

      .chatbot-header-title {
        flex: 1;
        font-weight: bold;
        letter-spacing: 0.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chatbot-lang-select {
        background: #1e1810;
        border: 1px solid rgba(212, 175, 55, 0.3);
        color: var(--gold, #D4AF37);
        padding: 6px 28px 6px 12px;
        font-size: 12.5px;
        border-radius: 6px;
        outline: none;
        cursor: pointer;
        font-family: 'Cinzel', serif;
        transition: all 0.2s ease;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23D4AF37' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
      }

      .chatbot-lang-select:focus {
        border-color: var(--gold, #D4AF37);
        box-shadow: 0 0 6px rgba(212, 175, 55, 0.2);
      }

      .chatbot-messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
      }
      .chatbot-messages-container::-webkit-scrollbar { width: 4px; }
      .chatbot-messages-container::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.15); border-radius: 4px; }

      .chatbot-input-area {
        border-top: 1px solid var(--gold-border, rgba(212,175,55,0.15));
        padding: 16px;
        background: var(--surface, #13100c);
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .chatbot-input-wrap {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .chatbot-input-field {
        flex: 1;
        font-size: 15px;
        padding: 12px 16px;
        background: #181410;
        border: 1px solid rgba(212, 175, 55, 0.25);
        border-radius: 8px;
        color: #EDE8D5;
        outline: none;
        transition: all 0.2s;
        caret-color: #facc15;
      }

      .chatbot-input-field:focus {
        border-color: var(--gold, #D4AF37);
        box-shadow: 0 0 6px rgba(212, 175, 55, 0.15);
      }

      .chatbot-send-btn {
        width: 46px;
        height: 46px;
        border-radius: 8px;
        background: linear-gradient(135deg, #3A9B8C 0%, #2E7D71 100%);
        border: none;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(58,155,140,0.2);
      }

      .chatbot-send-btn:hover {
        background: linear-gradient(135deg, #46b5a5 0%, #35907f 100%);
        transform: translateY(-1px);
      }

      .chatbot-keyboard-container {
        max-width: 800px;
        margin: 8px auto 0;
        padding: 0;
        box-sizing: border-box;
        overflow: hidden;
        width: 100%;
      }

      .simple-keyboard {
        background-color: #16120e !important;
        padding: 8px !important;
        border-radius: 12px !important;
        border: 1px solid rgba(212, 175, 55, 0.2) !important;
        font-family: 'Lato', sans-serif !important;
      }
      .simple-keyboard .hg-row {
        margin-bottom: 4px !important;
      }
      .simple-keyboard .hg-row:last-child {
        margin-bottom: 0 !important;
      }
      .simple-keyboard .hg-button {
        height: 44px !important;
        background: rgba(212, 175, 55, 0.05) !important;
        border: 1px solid rgba(212, 175, 55, 0.15) !important;
        border-bottom: 2px solid rgba(212, 175, 55, 0.3) !important;
        color: #EDE8D5 !important;
        font-size: 15px !important;
        border-radius: 6px !important;
        margin: 3px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
        transition: all 0.15s ease !important;
      }
      .simple-keyboard .hg-button:active,
      .simple-keyboard .hg-button:hover {
        background: linear-gradient(135deg, #8B6914 0%, #D4AF37 100%) !important;
        color: #fff !important;
        border-color: #D4AF37 !important;
        transform: translateY(1px) !important;
        box-shadow: 0 0px 2px rgba(0,0,0,0.5) !important;
      }

      .simple-keyboard .hg-button[data-skbtn="{shift}"],
      .simple-keyboard .hg-button[data-skbtn="{lock}"],
      .simple-keyboard .hg-button[data-skbtn="{bksp}"],
      .simple-keyboard .hg-button[data-skbtn="{enter}"] {
        background: rgba(212, 175, 55, 0.12) !important;
        font-size: 12px !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
        min-width: 60px !important;
      }

      @media (max-width: 767px) {
        .chatbot-header {
          padding: 12px 14px;
          gap: 8px;
        }
        .chatbot-header-title {
          font-size: 12px;
        }
        .chatbot-lang-select {
          font-size: 11.5px;
          padding: 5px 22px 5px 8px;
          max-width: 90px;
          background-position: right 6px center;
        }
        .chatbot-messages-container {
          padding: 14px;
        }
        .chatbot-input-area {
          padding: 12px;
        }
        .chatbot-input-field {
          font-size: 16px;
          padding: 10px 12px;
        }
        .chatbot-send-btn {
          width: 42px;
          height: 42px;
        }
        .simple-keyboard .hg-button {
          height: 40px !important;
          font-size: 13.5px !important;
          margin: 2px !important;
        }
        .simple-keyboard .hg-button[data-skbtn="{shift}"],
        .simple-keyboard .hg-button[data-skbtn="{lock}"],
        .simple-keyboard .hg-button[data-skbtn="{bksp}"],
        .simple-keyboard .hg-button[data-skbtn="{enter}"] {
          min-width: 50px !important;
          font-size: 11px !important;
        }
      }

      @media (max-width: 480px) {
        .chatbot-header-title {
          max-width: 140px;
        }
        .simple-keyboard .hg-button {
          height: 38px !important;
          font-size: 12px !important;
          margin: 1.5px !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  container.innerHTML = `
    <div class="chatbot-only-wrapper">
      <div class="chatbot-header">
        <button class="btn btn-ghost" id="chatbot-back-btn">← Back</button>
        <span class="chatbot-header-title">💬 Ask ${state.persona} directly</span>
        <select id="chat-only-lang" class="chatbot-lang-select">
          <option value="en" ${savedLang === 'en' ? 'selected' : ''}>English</option>
          <option value="hi" ${savedLang === 'hi' ? 'selected' : ''}>Hindi</option>
          <option value="gu" ${savedLang === 'gu' ? 'selected' : ''}>Gujarati</option>
        </select>
      </div>

      <div class="chatbot-messages-container" id="chat-only-messages">
        <div class="chat-bubble assistant">
          ${PERSONA_OPENERS[state.persona] || PERSONA_OPENERS.guru}
        </div>
        ${renderMessageList(state.chatHistory)}
      </div>

      <div class="chatbot-input-area">
        <div class="chatbot-input-wrap">
          <input
            type="text"
            class="input chatbot-input-field"
            id="chat-only-input"
            placeholder="Ask anything..."
            autocomplete="off"
          />
          <button class="chatbot-send-btn" id="send-only-btn" aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div class="chatbot-keyboard-container" id="kb-only-container" style="display:none;">
          <div class="simple-keyboard" style="color: black;"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('chatbot-back-btn').onclick = () => actions.goTo('persona');

  const input = container.querySelector('#chat-only-input');
  const sendBtn = container.querySelector('#send-only-btn');
  const langSelect = container.querySelector('#chat-only-lang');
  const kbContainer = container.querySelector('#kb-only-container');

  let defaultKeyboardOptions = {
    onChange: inputVal => {
      const oldLen = input.value.length;
      const oldCaret = input.selectionStart;
      input.value = inputVal;
      input.focus();
      
      if (keyboard && typeof keyboard.getCaretPosition === 'function') {
        try {
          const kbCaret = keyboard.getCaretPosition();
          if (typeof kbCaret === 'number') {
            input.setSelectionRange(kbCaret, kbCaret);
            return;
          }
        } catch (err) {
          console.warn("SimpleKeyboard getCaretPosition error:", err);
        }
      }
      
      // Fallback: move caret naturally
      const newLen = inputVal.length;
      if (newLen > oldLen) {
        const diff = newLen - oldLen;
        input.setSelectionRange(oldCaret + diff, oldCaret + diff);
      } else {
        input.setSelectionRange(oldCaret, oldCaret);
      }
    },
    onKeyPress: button => {
      if (button === "{shift}" || button === "{lock}") handleShift();
      if (button === "{enter}") send();
    },
    theme: "hg-theme-default",
    layout: hindiLayout,
    preventMouseDownDefault: true // Prevents input focus loss when clicking keyboard
  };

  let keyboard = null;

  function initKeyboard(lang) {
    if (keyboard) {
      keyboard.destroy();
      keyboard = null;
    }
    
    if (lang === 'en') {
      kbContainer.style.display = 'none';
      return;
    }
    
    kbContainer.style.display = 'block';
    
    const layout = lang === 'hi' ? hindiLayout : gujaratiLayout;
    if (window.SimpleKeyboard) {
       keyboard = new window.SimpleKeyboard.default({
         ...defaultKeyboardOptions,
         layout: layout
       });
       if (input.value) keyboard.setInput(input.value);
    }
  }

  function handleShift() {
    if (!keyboard) return;
    let currentLayout = keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";

    keyboard.setOptions({
      layoutName: shiftToggle
    });
  }

  initKeyboard(savedLang);

  langSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    actions.setChatLanguage(lang);
    initKeyboard(lang);
  });

  input.addEventListener('input', (event) => {
    if (keyboard) {
       keyboard.setInput(event.target.value);
    }
  });

  // Keep virtual keyboard caret index in sync with user manual navigation/selection
  const handleCaretChange = (e) => {
    if (keyboard && typeof keyboard.setCaretPosition === 'function') {
      try {
        keyboard.setCaretPosition(e.target.selectionStart);
      } catch (err) {
        // ignore
      }
    }
  };

  input.addEventListener("mouseup", handleCaretChange);
  input.addEventListener("keyup", handleCaretChange);
  input.addEventListener("touchend", handleCaretChange);
  input.addEventListener("focus", handleCaretChange);

  function send() {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    if (keyboard) keyboard.clearInput();
    actions.sendChat(msg);
  }

  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  sendBtn.addEventListener('click', send);
}

export function updateChatbotMessages(container, prevLength) {
  const messagesEl = container.querySelector('#chat-only-messages');
  if (!messagesEl) return;

  const newMessages = state.chatHistory.slice(prevLength);
  newMessages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'} anim-fade-in`;
    div.textContent = msg.content;
    messagesEl.appendChild(div);
  });

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
