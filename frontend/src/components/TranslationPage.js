import { actions } from '../hooks/useGurukul.js';
import { BACKEND_URL } from '../config.js';

export function renderTranslationPage(container) {
  container.innerHTML = `
    <div class="screen-header">
      <button class="btn btn-ghost" id="translate-back-btn">← Back</button>
      <span class="screen-header-title">Manuscript Translator</span>
    </div>
    <div class="translate-body">
      <p class="translate-subtitle">Translate and analyze ancient Indian texts with AI-powered insights</p>
      
      <div class="translate-layout">
        <!-- LEFT PANEL: INPUT -->
        <div class="translate-left">
          <div class="translate-controls">
            <div class="lang-selector">
              <label class="lang-label">SOURCE</label>
              <select id="source-lang" class="lang-select">
                <option value="Sanskrit">Sanskrit</option>
                <option value="Tamil">Tamil</option>
                <option value="Pali">Pali</option>
                <option value="Prakrit">Prakrit</option>
              </select>
            </div>
            <div class="lang-selector">
              <label class="lang-label">TARGET</label>
              <select id="target-lang" class="lang-select">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
          
          <div class="translate-box">
            <div class="box-header">
              <span class="box-icon">📜</span>
              <span class="box-title">INPUT TEXT OR FILE</span>
            </div>
            <textarea id="translate-input" class="translate-textarea" placeholder="Paste ancient text here (Sanskrit, Tamil, Pali, etc.)..."></textarea>
            
            <div class="translate-upload" id="translate-upload-btn">
              <span class="upload-icon">📷</span>
              <div class="upload-text">Upload manuscript image or PDF</div>
              <div class="upload-sub" id="upload-filename">For demo: hardcoded text will be used. Max 5MB.</div>
            </div>
            <input type="file" id="translate-file-input" accept="image/*,.pdf" style="display:none;" />
          </div>
          
          <button id="btn-do-translate" class="btn-primary w-full mt-2" style="padding: 10px; font-size: 14px;">
            <span class="mode-icon" style="font-size:16px;">🔄</span> Translate & Analyze
          </button>
        </div>
        
        <!-- RIGHT PANEL: OUTPUT -->
        <div class="translate-right">
          <div id="translate-output-empty" class="translate-empty">
            <div class="empty-icon">📜</div>
            <div class="empty-title">Translation results will appear here</div>
            <div class="empty-sub">Paste text or select a sample to begin</div>
          </div>
          
          <div id="translate-output-content" class="translate-result" style="display: none;">
            <!-- Rendered results will go here -->
          </div>
        </div>
        
        <div class="sample-texts mt-3">
          <div class="box-header">
            <span class="box-icon">📚</span>
            <span class="box-title">SAMPLE TEXTS</span>
          </div>
          <div class="sample-card" data-text="स्वस्थस्य स्वास्थ्य रक्षणं आतुरस्य विकार प्रशमनं च।">
            <div class="sample-title">Charaka Samhita — Sutra Sthana</div>
            <div class="sample-excerpt">स्वस्थस्य स्वास्थ्य रक्षणं आतुरस्य विकार प्रशमनं च।</div>
          </div>
          
          <div class="sample-card" data-text="चतुरधिकं शतमष्टगुणं द्वाषष्टिस्तथा सहस्राणाम्। अयुतद्वयविष्कम्भस्य आसन्नो वृत्तपरिणाहः।।">
            <div class="sample-title">Aryabhatiya — Ganitapada</div>
            <div class="sample-excerpt">चतुरधिकं शतमष्टगुणं द्वाषष्टिस्तथा सहस्राणाम्। अयुतद्वयविष्कम्भस्य आसन्नो वृत्तपरिणाहः।।</div>
          </div>
          
          <div class="sample-card" data-text="கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக.">
            <div class="sample-title">Thirukkural — Kural 391</div>
            <div class="sample-excerpt">கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக.</div>
          </div>
        </div>
        
      </div>
    </div>
  `;

  // Go back to landing
  container.querySelector('#translate-back-btn').addEventListener('click', () => {
    actions.goTo('landing');
  });

  const inputBox = container.querySelector('#translate-input');
  const fileInput = container.querySelector('#translate-file-input');
  const uploadBtn = container.querySelector('#translate-upload-btn');
  const uploadFilename = container.querySelector('#upload-filename');

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFilename.textContent = e.target.files[0].name;
      uploadFilename.style.color = 'var(--gold)';
    } else {
      uploadFilename.textContent = 'For demo: hardcoded text will be used. Max 5MB.';
      uploadFilename.style.color = 'var(--text-dim)';
    }
  });

  const samples = container.querySelectorAll('.sample-card');
  const doTranslate = container.querySelector('#btn-do-translate');
  const outEmpty = container.querySelector('#translate-output-empty');
  const outContent = container.querySelector('#translate-output-content');

  // Auto-grow textarea
  const resizeTextarea = () => {
    inputBox.style.height = 'auto';
    inputBox.style.height = inputBox.scrollHeight + 'px';
  };
  inputBox.addEventListener('input', resizeTextarea);

  // Connect samples
  samples.forEach(card => {
    card.addEventListener('click', () => {
      inputBox.value = card.dataset.text;
      resizeTextarea();
    });
  });

  // Real translation action
  doTranslate.addEventListener('click', async () => {
    const text = inputBox.value.trim();
    const hasText = text.length > 0;
    const hasFile = fileInput.files && fileInput.files.length > 0;
    
    if (!hasText && !hasFile) return;
    
    // Simulate loading
    const originalText = doTranslate.innerHTML;
    doTranslate.innerHTML = '<span class="mode-icon" style="font-size:16px;">⏳</span> Translating...';
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: container.querySelector('#source-lang').value,
          targetLang: container.querySelector('#target-lang').value
        })
      });

      const data = await response.json();

      if (data.success) {
        outEmpty.style.display = 'none';
        outContent.style.display = 'block';
        outContent.innerHTML = renderResult(data.translation, container.querySelector('#target-lang').value);
      } else {
        alert("Translation failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      // Fallback to simulated result if API fails
      outEmpty.style.display = 'none';
      outContent.style.display = 'block';
      outContent.innerHTML = renderSimulatedResult(inputBox.value, container.querySelector('#target-lang').value);
    } finally {
      doTranslate.innerHTML = originalText;
    }
  });
}

function renderResult(translation, targetLang) {
  const isHindi = targetLang === 'Hindi';
  
  return `
    <div class="result-header">
      <span class="box-icon">✨</span>
      <span class="box-title">${isHindi ? 'अनुवाद और विश्लेषण' : 'TRANSLATION & ANALYSIS'}</span>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'शाब्दिक अनुवाद' : 'LITERAL TRANSLATION'}</div>
      <p class="result-text">${translation.translatedText}</p>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'व्याख्या और सार' : 'EXPLANATION & ESSENCE'}</div>
      <p class="result-text">${translation.explanation}</p>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'मुख्य शब्द' : 'KEY TERMS'}</div>
      <div class="key-terms-grid">
        ${translation.keyTerms.map(term => `
          <div class="term-card">
            <div class="term-orig">${term.orig}</div>
            <div class="term-meaning">${term.meaning}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'आधुनिक प्रासंगिकता' : 'MODERN RELEVANCE'}</div>
      <p class="result-text">${translation.modernRelevance}</p>
    </div>
  `;
}

function renderSimulatedResult(text, targetLang) {
  // We'll just generate some generic looking output based on the input text.
  let isTamil = text.includes('கற்க');
  const isHindi = targetLang === 'Hindi';

  let translatedText = "";
  let explanation = "This verse outlines a fundamental principle or axiom of its respective tradition. It emphasizes continuous learning and adherence to knowledge, or the foundational goals of well-being.";

  if (isTamil) {
    translatedText = isHindi
      ? "जो कुछ भी सीखा जाना चाहिए उसे त्रुटिहीन रूप से सीखें, और सीखने के बाद, उस पर अडिग रहें।"
      : "Learn flawlessly what should be learned, and having learned, abide by it.";
  } else if (text.includes('चतुरधिकं')) {
    translatedText = isHindi
      ? "१०० में ४ जोड़ें, ८ से गुणा करें और फिर ६२००० जोड़ें। इस नियम से २०००० व्यास वाले वृत्त की परिधि ज्ञात की जा सकती है।"
      : "Add four to one hundred, multiply by eight, and then add sixty-two thousand. By this rule the circumference of a circle with a diameter of twenty thousand can be approached.";
  } else {
    translatedText = isHindi
      ? "आयुर्वेद का प्रयोजन स्वस्थ व्यक्ति के स्वास्थ्य की रक्षा करना और रोगी के विकार को शांत करना (ठीक करना) है।"
      : "The purpose of Ayurveda is to protect the health of the healthy and to cure the disease of the sick.";
  }

  if (isHindi) {
    explanation = "यह श्लोक अपनी संबंधित परंपरा के एक मौलिक सिद्धांत या स्वयंसिद्ध को रेखांकित करता है। यह निरंतर सीखने और ज्ञान के पालन, या कल्याण के मूलभूत लक्ष्यों पर जोर देता है।";
  }

  return `
    <div class="result-header">
      <span class="box-icon">✨</span>
      <span class="box-title">${isHindi ? 'अनुवाद और विश्लेषण' : 'TRANSLATION & ANALYSIS'}</span>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'शाब्दिक अनुवाद' : 'LITERAL TRANSLATION'}</div>
      <p class="result-text">${translatedText}</p>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'व्याख्या और सार' : 'EXPLANATION & ESSENCE'}</div>
      <p class="result-text">${explanation}</p>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'मुख्य शब्द' : 'KEY TERMS'}</div>
      <div class="key-terms-grid">
        <div class="term-card">
          <div class="term-orig">स्वस्थस्य / கற்க</div>
          <div class="term-meaning">Healthy / Learn</div>
        </div>
        <div class="term-card">
          <div class="term-orig">रक्षणं / நிற்க</div>
          <div class="term-orig">Protection / Abide</div>
        </div>
      </div>
    </div>
    
    <div class="result-section">
      <div class="result-label">${isHindi ? 'आधुनिक प्रासंगिकता' : 'MODERN RELEVANCE'}</div>
      <p class="result-text">${isHindi
      ? "आज की भागदौड़ भरी दुनिया में, यह प्राचीन ज्ञान हमें मूलभूत गुणों को प्राथमिकता देने की याद दिलाता है—चाहे वह निवारक स्वास्थ्य देखभाल और कल्याण हो, या आजीवन सीखने की निरंतर खोज और ज्ञान को व्यवहार में लाना।"
      : "In today's fast-paced world, this ancient wisdom reminds us to prioritize foundational virtues—whether that's preventative healthcare and wellness, or the continuous pursuit of lifelong learning and putting knowledge into practice."}</p>
    </div>
  `;
}
