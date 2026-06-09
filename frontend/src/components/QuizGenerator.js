/**
 * QuizGenerator.js
 * Full Quiz Generator feature — upload file or enter topic, take MCQ quiz, see results.
 * Matches the existing retro dark gold theme.
 */

import { actions } from '../hooks/useGurukul.js';
import { RAG_BACKEND_URL } from '../config.js';

const RAG_URL = RAG_BACKEND_URL;

// ── State ──
let quizState = {
  mode: null,           // 'upload' | 'topic' | null (selection screen)
  questions: [],        // array of quiz questions from API
  currentIndex: 0,      // which question we're on
  answers: {},          // { questionIndex: selectedLetter }
  revealed: {},         // { questionIndex: true } — has answer been shown
  finished: false,
  loading: false,
  error: null,
  source: '',
  fileName: null,
  fileObj: null,
};

function resetQuiz() {
  quizState = {
    mode: null, questions: [], currentIndex: 0, answers: {},
    revealed: {}, finished: false, loading: false, error: null,
    source: '', fileName: null, fileObj: null,
  };
}

export function renderQuizGenerator(container) {
  resetQuiz();
  renderInner(container);
}

function renderInner(container) {
  const s = quizState;

  // ── TAKING THE QUIZ ──
  if (s.questions.length > 0 && !s.finished) {
    renderQuizPlay(container);
    return;
  }

  // ── RESULTS SCREEN ──
  if (s.finished) {
    renderResults(container);
    return;
  }

  // ── LOADING ──
  if (s.loading) {
    renderLoading(container);
    return;
  }

  // ── INPUT SCREEN (mode selection / form) ──
  renderInputScreen(container);
}

// ═══════════════════════════════════════════════════════════
// INPUT SCREEN — Mode Selection + Forms
// ═══════════════════════════════════════════════════════════
function renderInputScreen(container) {
  const s = quizState;

  container.innerHTML = `
    <div class="screen-header">
      <button class="btn btn-ghost" id="qg-back-btn">← Back</button>
      <span class="screen-header-title">📝 Quiz Generator</span>
    </div>
    <div class="qg-body" data-mode="${s.mode || ''}">
      <div class="qg-hero">
        <div class="qg-hero-icon">🧩</div>
        <h2 class="qg-hero-title">Generate Your Quiz</h2>
        <p class="qg-hero-sub">Upload a document or enter a topic to generate an interactive MCQ quiz powered by AI</p>
      </div>

      <div class="qg-mode-grid">
        <!-- Upload Card -->
        <div class="qg-mode-card ${s.mode === 'upload' ? 'selected' : ''}" id="qg-mode-upload">
          <div class="qg-mode-icon">📄</div>
          <div class="qg-mode-title">Upload File</div>
          <div class="qg-mode-desc">Upload a TXT or DOCX file and get a quiz generated from its content</div>
          <div class="qg-mode-badge">TXT, DOCX — up to 10MB</div>
        </div>

        <!-- Topic Card -->
        <div class="qg-mode-card ${s.mode === 'topic' ? 'selected' : ''}" id="qg-mode-topic">
          <div class="qg-mode-icon">💡</div>
          <div class="qg-mode-title">Enter Topic</div>
          <div class="qg-mode-desc">Write a topic and get a quiz from our knowledge base & AI</div>
          <div class="qg-mode-badge">Any educational topic</div>
        </div>
      </div>

      <!-- Upload Form -->
      <div id="qg-upload-form" class="qg-form-panel" style="display: ${s.mode === 'upload' ? 'flex' : 'none'};">
        <div class="qg-upload-zone" id="qg-drop-zone">
          <input type="file" id="qg-file-input" accept=".txt,.doc,.docx" style="display:none;" />
          <div class="qg-upload-icon">${s.fileName ? '✅' : '📁'}</div>
          <div class="qg-upload-text">${s.fileName ? s.fileName : 'Click to browse or drag & drop your file'}</div>
          <div class="qg-upload-hint">${s.fileName ? 'Click to change file' : 'Supports TXT, DOCX — up to 10MB'}</div>
        </div>

        <div class="qg-num-row">
          <label class="qg-num-label">Number of Questions</label>
          <div class="qg-slider-wrap">
            <input type="range" id="qg-upload-num" min="1" max="15" value="5" class="qg-slider" />
            <span class="qg-slider-val" id="qg-upload-num-val">5</span>
          </div>
        </div>

        <button class="btn-primary qg-generate-btn" id="qg-upload-go" ${!s.fileName ? 'disabled' : ''}>
          <span>🚀</span> Generate Quiz
        </button>
      </div>

      <!-- Topic Form -->
      <div id="qg-topic-form" class="qg-form-panel" style="display: ${s.mode === 'topic' ? 'flex' : 'none'};">
        <div class="qg-topic-input-wrap">
          <label class="qg-topic-label">Enter your topic</label>
          <input type="text" id="qg-topic-input" class="input qg-topic-field" placeholder="e.g. Bhagavad Gita, Ayurveda Doshas, Chanakya's Strategy..." />
        </div>

        <div class="qg-num-row">
          <label class="qg-num-label">Number of Questions</label>
          <div class="qg-slider-wrap">
            <input type="range" id="qg-topic-num" min="1" max="15" value="5" class="qg-slider" />
            <span class="qg-slider-val" id="qg-topic-num-val">5</span>
          </div>
        </div>

        <button class="btn-primary qg-generate-btn" id="qg-topic-go">
          <span>🚀</span> Generate Quiz
        </button>
      </div>

      ${s.error ? `<div class="qg-error"><span>⚠️</span> ${s.error}</div>` : ''}
    </div>
  `;

  // ── Event wiring ──
  container.querySelector('#qg-back-btn').addEventListener('click', () => {
    if (quizState.mode) {
      quizState.mode = null;
      renderInner(container);
    } else {
      resetQuiz();
      actions.goTo('landing');
    }
  });

  container.querySelector('#qg-mode-upload').addEventListener('click', () => {
    quizState.mode = 'upload';
    renderInner(container);
  });

  container.querySelector('#qg-mode-topic').addEventListener('click', () => {
    quizState.mode = 'topic';
    renderInner(container);
  });

  // Upload form events
  if (s.mode === 'upload') {
    const fileInput = container.querySelector('#qg-file-input');
    const dropZone = container.querySelector('#qg-drop-zone');
    const slider = container.querySelector('#qg-upload-num');
    const sliderVal = container.querySelector('#qg-upload-num-val');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        quizState.fileObj = e.dataTransfer.files[0];
        quizState.fileName = e.dataTransfer.files[0].name;
        renderInner(container);
      }
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files[0]) {
        quizState.fileObj = e.target.files[0];
        quizState.fileName = e.target.files[0].name;
        renderInner(container);
      }
    });

    slider.addEventListener('input', () => { sliderVal.textContent = slider.value; });

    container.querySelector('#qg-upload-go').addEventListener('click', () => {
      if (!quizState.fileObj) return;
      submitUploadQuiz(container, parseInt(slider.value));
    });
  }

  // Topic form events
  if (s.mode === 'topic') {
    const slider = container.querySelector('#qg-topic-num');
    const sliderVal = container.querySelector('#qg-topic-num-val');
    slider.addEventListener('input', () => { sliderVal.textContent = slider.value; });

    container.querySelector('#qg-topic-go').addEventListener('click', () => {
      const topic = container.querySelector('#qg-topic-input').value.trim();
      if (!topic) {
        quizState.error = 'Please enter a topic first.';
        renderInner(container);
        return;
      }
      submitTopicQuiz(container, topic, parseInt(slider.value));
    });

    // Allow Enter key
    container.querySelector('#qg-topic-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') container.querySelector('#qg-topic-go').click();
    });
  }
}

// ═══════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════
function renderLoading(container) {
  container.innerHTML = `
    <div class="screen-header">
      <button class="btn btn-ghost" disabled>← Back</button>
      <span class="screen-header-title">📝 Quiz Generator</span>
    </div>
    <div class="qg-loading-wrap">
      <div class="qg-loading-orb">
        <div class="qg-orb-ring"></div>
        <div class="qg-orb-ring delay"></div>
        <span class="qg-orb-icon">🧠</span>
      </div>
      <div class="qg-loading-title">Generating Your Quiz...</div>
      <div class="qg-loading-sub">AI is analyzing ${quizState.mode === 'upload' ? 'your document' : `"${quizState.source}"`} and creating questions</div>
      <div class="qg-loading-dots">
        <span class="dot-pulse"></span>
        <span class="dot-pulse"></span>
        <span class="dot-pulse"></span>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// QUIZ PLAY SCREEN — One question at a time
// ═══════════════════════════════════════════════════════════
function renderQuizPlay(container) {
  const s = quizState;
  const q = s.questions[s.currentIndex];
  const isRevealed = s.revealed[s.currentIndex];
  const selectedAnswer = s.answers[s.currentIndex];
  const isCorrect = selectedAnswer === q.correctAnswer;
  const isLast = s.currentIndex === s.questions.length - 1;

  const progressPct = ((s.currentIndex + 1) / s.questions.length * 100).toFixed(0);

  container.innerHTML = `
    <div class="screen-header">
      <button class="btn btn-ghost" id="qg-quit-btn">✕ Quit</button>
      <span class="screen-header-title">📝 Quiz — ${s.source}</span>
      <span class="qg-progress-badge">${s.currentIndex + 1} / ${s.questions.length}</span>
    </div>

    <div class="qg-play-body">
      <!-- Progress bar -->
      <div class="qg-progress-track">
        <div class="qg-progress-fill" style="width: ${progressPct}%"></div>
      </div>

      <div class="qg-question-card anim-fade-up">
        <div class="qg-q-number">Question ${s.currentIndex + 1}</div>
        <div class="qg-q-text">${q.question}</div>

        <div class="qg-options-list">
          ${Object.entries(q.options).map(([letter, text]) => {
            let cls = 'qg-option';
            if (isRevealed) {
              if (letter === q.correctAnswer) cls += ' correct';
              else if (letter === selectedAnswer && letter !== q.correctAnswer) cls += ' wrong';
              else cls += ' dimmed';
            } else if (letter === selectedAnswer) {
              cls += ' selected';
            }
            return `
              <button class="${cls}" data-letter="${letter}" ${isRevealed ? 'disabled' : ''}>
                <span class="qg-opt-letter">${letter}</span>
                <span class="qg-opt-text">${text}</span>
                ${isRevealed && letter === q.correctAnswer ? '<span class="qg-opt-check">✓</span>' : ''}
                ${isRevealed && letter === selectedAnswer && letter !== q.correctAnswer ? '<span class="qg-opt-cross">✗</span>' : ''}
              </button>
            `;
          }).join('')}
        </div>

        ${!isRevealed && selectedAnswer ? `
          <button class="btn-primary qg-submit-answer" id="qg-confirm-btn">
            <span>🔍</span> Check Answer
          </button>
        ` : ''}

        ${isRevealed ? `
          <div class="qg-feedback-box ${isCorrect ? 'correct' : 'wrong'}">
            <div class="qg-fb-header">
              <span class="qg-fb-icon">${isCorrect ? '🎉' : '😔'}</span>
              <span class="qg-fb-title">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            ${q.explanation ? `<p class="qg-fb-explain">${q.explanation}</p>` : ''}
          </div>

          <button class="btn-primary qg-next-btn" id="qg-next-btn">
            ${isLast ? '🏆 See Results' : '→ Next Question'}
          </button>
        ` : ''}
      </div>
    </div>
  `;

  // Events
  container.querySelector('#qg-quit-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
      resetQuiz();
      renderInner(container);
    }
  });

  // Option selection
  if (!isRevealed) {
    container.querySelectorAll('.qg-option').forEach(btn => {
      btn.addEventListener('click', () => {
        s.answers[s.currentIndex] = btn.dataset.letter;
        renderInner(container);
      });
    });
  }

  // Confirm answer
  const confirmBtn = container.querySelector('#qg-confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      s.revealed[s.currentIndex] = true;
      renderInner(container);
    });
  }

  // Next / Finish
  const nextBtn = container.querySelector('#qg-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isLast) {
        s.finished = true;
      } else {
        s.currentIndex++;
      }
      renderInner(container);
    });
  }
}

// ═══════════════════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════════════════
function renderResults(container) {
  const s = quizState;
  const total = s.questions.length;
  let correct = 0;
  s.questions.forEach((q, i) => {
    if (s.answers[i] === q.correctAnswer) correct++;
  });
  const pct = Math.round((correct / total) * 100);

  let grade, gradeIcon, gradeColor;
  if (pct >= 90) { grade = 'Outstanding!'; gradeIcon = '🏆'; gradeColor = '#FFD700'; }
  else if (pct >= 70) { grade = 'Great Job!'; gradeIcon = '🌟'; gradeColor = '#3A9B8C'; }
  else if (pct >= 50) { grade = 'Good Effort!'; gradeIcon = '👍'; gradeColor = '#C46B3A'; }
  else { grade = 'Keep Learning!'; gradeIcon = '📖'; gradeColor = '#E24B4A'; }

  container.innerHTML = `
    <div class="screen-header">
      <button class="btn btn-ghost" id="qg-results-back">← Home</button>
      <span class="screen-header-title">📝 Quiz Results</span>
    </div>

    <div class="qg-results-body">
      <div class="qg-results-hero">
        <div class="qg-results-orb" style="--grade-color: ${gradeColor}">
          <span class="qg-results-icon">${gradeIcon}</span>
        </div>
        <h2 class="qg-results-grade" style="color: ${gradeColor}">${grade}</h2>
        <div class="qg-results-score">
          <span class="qg-score-big">${correct}</span>
          <span class="qg-score-sep">/</span>
          <span class="qg-score-total">${total}</span>
        </div>
        <div class="qg-results-pct">${pct}% correct</div>
        <div class="qg-results-source">Source: ${s.source}</div>
      </div>

      <div class="qg-results-breakdown">
        <div class="qg-rb-title">Question Breakdown</div>
        ${s.questions.map((q, i) => {
          const userAns = s.answers[i];
          const isRight = userAns === q.correctAnswer;
          return `
            <div class="qg-rb-item ${isRight ? 'correct' : 'wrong'}">
              <div class="qg-rb-num">${i + 1}</div>
              <div class="qg-rb-content">
                <div class="qg-rb-question">${q.question}</div>
                <div class="qg-rb-answer">
                  Your answer: <strong>${userAns} — ${q.options[userAns]}</strong>
                  ${!isRight ? `<br/>Correct: <strong style="color: var(--guru)">${q.correctAnswer} — ${q.options[q.correctAnswer]}</strong>` : ''}
                </div>
              </div>
              <div class="qg-rb-badge ${isRight ? 'correct' : 'wrong'}">${isRight ? '✓' : '✗'}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="qg-results-actions">
        <button class="btn-primary" id="qg-new-quiz">🔄 New Quiz</button>
        <button class="btn btn-ghost" id="qg-go-home">🏠 Back to Home</button>
      </div>
    </div>
  `;

  container.querySelector('#qg-results-back').addEventListener('click', () => {
    resetQuiz();
    actions.goTo('landing');
  });

  container.querySelector('#qg-new-quiz').addEventListener('click', () => {
    resetQuiz();
    renderInner(container);
  });

  container.querySelector('#qg-go-home').addEventListener('click', () => {
    resetQuiz();
    actions.goTo('landing');
  });
}

// ═══════════════════════════════════════════════════════════
// API CALLS
// ═══════════════════════════════════════════════════════════
async function submitUploadQuiz(container, numQuestions) {
  quizState.loading = true;
  quizState.error = null;
  quizState.source = quizState.fileName;
  renderInner(container);

  try {
    const formData = new FormData();
    formData.append('file', quizState.fileObj);
    formData.append('numQuestions', numQuestions);

    const res = await fetch(`${RAG_URL}/quiz/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to generate quiz');

    quizState.questions = data.quiz;
    quizState.loading = false;
    quizState.currentIndex = 0;
    renderInner(container);
  } catch (err) {
    quizState.loading = false;
    quizState.error = err.message;
    renderInner(container);
  }
}

async function submitTopicQuiz(container, topic, numQuestions) {
  quizState.loading = true;
  quizState.error = null;
  quizState.source = topic;
  renderInner(container);

  try {
    const res = await fetch(`${RAG_URL}/quiz/topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, numQuestions })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to generate quiz');

    quizState.questions = data.quiz;
    quizState.loading = false;
    quizState.currentIndex = 0;
    renderInner(container);
  } catch (err) {
    quizState.loading = false;
    quizState.error = err.message;
    renderInner(container);
  }
}
