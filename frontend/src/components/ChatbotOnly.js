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

  container.innerHTML = `
    <div class="chatbot-header" style="padding: 16px 20px; border-bottom: 1px solid var(--gold-border); display: flex; align-items: center; justify-content: space-between; font-family: 'Cinzel', serif; font-size: 13px; color: var(--gold); background: var(--surface);">
      <button class="btn btn-ghost" id="chatbot-back-btn" style="margin-right: 10px;">← Back</button>
      <span style="flex:1;">💬 Ask ${state.persona} directly</span>
      <select id="chat-only-lang" style="margin: 0 10px; padding: 4px; font-size:12px; border-radius:4px; max-width:100px;">
        <option value="en" ${savedLang === 'en' ? 'selected' : ''}>English</option>
        <option value="hi" ${savedLang === 'hi' ? 'selected' : ''}>Hindi</option>
        <option value="gu" ${savedLang === 'gu' ? 'selected' : ''}>Gujarati</option>
      </select>
    </div>

    <div class="chat-messages" id="chat-only-messages" style="flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 10px; max-width: 800px; margin: 0 auto; width: 100%;">
      <div class="chat-bubble assistant">
        ${PERSONA_OPENERS[state.persona] || PERSONA_OPENERS.guru}
      </div>
      ${renderMessageList(state.chatHistory)}
    </div>

    <div style="border-top: 1px solid var(--gold-border); padding: 16px; background: var(--surface);">
      <div class="sidebar-input-wrap" style="max-width: 800px; margin: 0 auto; display: flex; gap: 8px;">
        <input
          type="text"
          class="input sidebar-input"
          id="chat-only-input"
          placeholder="Ask anything..."
          autocomplete="off"
          style="flex: 1; font-size: 15px; padding: 12px 14px;"
        />
        <button class="send-btn" id="send-only-btn" style="width: 44px; height: 44px;" aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="simple-keyboard-container" id="kb-only-container" style="display:none; max-width: 800px; margin: 8px auto 0; padding:0; box-sizing:border-box;">
        <div class="simple-keyboard" style="color: black;"></div>
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
      input.value = inputVal;
    },
    onKeyPress: button => {
      if (button === "{shift}" || button === "{lock}") handleShift();
      if (button === "{enter}") send();
    },
    theme: "hg-theme-default",
    layout: hindiLayout
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
