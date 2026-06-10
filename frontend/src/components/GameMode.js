/**
 * GameMode.js
 * Main component for the gamified version of AiGurukul.
 * Features: Jigsaw puzzles, hinting system, scoring, and store.
 */

import { state, actions } from '../hooks/useGurukul.js';
import { GAME_USERS, LEVELS, SHOP_ITEMS } from '../data/gameData.js';

let currentLevelData = null;
let revealedHints = [];
let puzzlePieces = []; // { id, correctlyPlaced }
let boardState = []; // indices of pieces in current positions
let gridRows = 3;
let gridCols = 4;
let lastGuessPoints = 100;
let hintModalTimeout = null;
let puzzleCompleted = false;
let correctlyGuessed = false;
let currentScreen = '';
let currentLevelLoaded = null;
let tutorialsShown = {};

export function renderGame(container) {
  const screen = state.screen;
  
  // If the screen hasn't changed, just update specific dynamic elements
  if (currentScreen === screen && container.innerHTML !== '') {
    const coinDisplay = container.querySelector('#game-coins');
    if (coinDisplay) coinDisplay.innerText = state.game.coins;
    return;
  }
  
  currentScreen = screen;

  if (screen === 'game-main') {
    renderUserSelect(container);
  } else if (screen === 'game-levels') {
    renderLevelSelect(container);
  } else if (screen === 'game-play') {
    renderPuzzlePlay(container);
  } else if (screen === 'game-store') {
    renderStore(container);
  }
}

// ── Header Component ────────────────────────────────────────────────────────
function getGameHeaderHTML(title = 'Gurukul Game') {
  return `
    <div class="game-header">
      <div class="game-header-left">
        <button class="btn-game" id="game-back-btn">← Exit</button>
        <span class="game-title">${title}</span>
      </div>
      <div class="game-header-right">
        <div class="coin-display">
          <span>🪙</span>
          <span id="game-coins">${state.game.coins}</span>
        </div>
        <button class="btn-game shop-btn" id="game-shop-btn">🏪 Shop</button>
      </div>
    </div>
  `;
}

function attachHeaderEvents(container) {
  const backBtn = container.querySelector('#game-back-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      if (state.screen === 'game-main') {
        actions.goTo('landing');
      } else if (state.screen === 'game-levels') {
        state.screen = 'game-main';
        actions.goTo('game-main');
      } else if (state.screen === 'game-play' || state.screen === 'game-store') {
        state.screen = 'game-levels';
         actions.goTo('game-levels');
      }
    };
  }
  const shopBtn = container.querySelector('#game-shop-btn');
  if (shopBtn) {
    shopBtn.onclick = () => {
      state.screen = 'game-store';
      actions.goTo('game-store');
    };
  }
}

// ── User Selection ──────────────────────────────────────────────────────────
function renderUserSelect(container) {
  container.innerHTML = `
    ${getGameHeaderHTML('Select Your Avatar')}
    <div class="game-user-grid">
      ${GAME_USERS.map(u => `
        <div class="user-card" id="user-opt-${u.id}">
          <span class="user-icon">${u.icon}</span>
          <h3>${u.name}</h3>
          <p>${u.title}</p>
        </div>
      `).join('')}
    </div>
  `;

  GAME_USERS.forEach(u => {
    container.querySelector(`#user-opt-${u.id}`).onclick = () => {
      actions.gameSwitchUser(u.id);
    };
  });
  attachHeaderEvents(container);
}

// ── Level Selection (Landscape Saga Map) ───────────────────────────────────
function renderLevelSelect(container) {
  const user = state.game.selectedUser;
  const userData = GAME_USERS.find(u => u.id === user);
  if (!userData) {
    actions.goTo('game-main');
    return;
  }
  const unlocked = state.game.unlockedLevels[user] || 1;
  const completed = state.game.completedLevels;

  container.innerHTML = `
    ${getGameHeaderHTML(`${userData.name} Saga Map`)}
    
    <div class="landscape-map-container">
      <!-- Unique Winding Path (SVG) -->
      <svg class="saga-path-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <path id="saga-trail" d="M 50,300 C 150,100 350,100 500,300 C 650,500 850,500 950,300" stroke="var(--gold-border)" stroke-width="4" fill="none" stroke-dasharray="10 10" />
      </svg>
      
      <div class="saga-nodes-layer">
        ${Array.from({ length: 20 }).map((_, i) => {
          const lvlNum = i + 1;
          const isLocked = lvlNum > unlocked;
          const isCompleted = completed.includes(`${user}-${lvlNum}`);
          const isCurrent = lvlNum === unlocked;
          
          // Calculate positions for an S-curve on 1000x500 box
          const t = i / 19; 
          const x = 50 + t * 900;
          const y = 300 + Math.sin(t * Math.PI * 2) * 180;

          return `
            <div class="saga-node ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}" 
                 id="level-opt-${lvlNum}"
                 style="left: ${x / 10}%; top: ${y / 6}%">
              <div class="saga-node-inner">
                <span class="node-num">${lvlNum}</span>
                ${isCompleted ? '<span class="node-check">✓</span>' : ''}
                ${isCurrent ? '<div class="node-pulse"></div>' : ''}
              </div>
              <div class="saga-node-label">Level ${lvlNum}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  for (let i = 1; i <= 20; i++) {
    const btn = container.querySelector(`#level-opt-${i}`);
    if (btn && i <= unlocked) {
      btn.onclick = () => actions.gameSelectLevel(i);
    }
  }
  attachHeaderEvents(container);
}

// ── Jigsaw Puzzle Play ───────────────────────────────────────────────────────
function renderPuzzlePlay(container) {
  const user = state.game.selectedUser;
  const level = state.game.currentLevel;
  const userData = GAME_USERS.find(u => u.id === user);
  
  const levelKey = `${user}-${level}`;
  
  // Only initialize state if it's a NEW level arrival
  if (currentLevelLoaded !== levelKey) {
    currentLevelLoaded = levelKey;
    currentLevelData = LEVELS[user].find(l => l.id === level);
    revealedHints = [];
    lastGuessPoints = 100;

    // Initialize Sliding Grid (3x4 = 12 cells)
    gridRows = 3;
    gridCols = 4;
    const total = gridRows * gridCols;
    puzzlePieces = [];
    boardState = [];
    puzzleCompleted = false;
    correctlyGuessed = false;

    for (let i = 0; i < total - 1; i++) {
      puzzlePieces.push({ id: i, correct: i });
      boardState.push(i);
    }
    // Add empty slot (represented by -1)
    boardState.push(-1);

    // Shuffle board while ensuring it is solvable (apply random valid moves)
    shuffle(boardState);
  }

  container.innerHTML = `
    ${getGameHeaderHTML(`Level ${level}: ${userData.name} Challenge`)}
    <div id="game-modal-portal"></div>
    <div class="puzzle-container">
      <div class="puzzle-board" id="game-puzzle-board" 
           style="grid-template-columns: repeat(${gridCols}, 100px); grid-template-rows: repeat(${gridRows}, 100px);">
        <!-- Generated by JS -->
      </div>

      <div class="hints-reveal" id="hints-mount">
        <p style="color: var(--game-primary); margin-bottom:10px; font-weight:bold;">✨ Divine Hints (Revealed on placement):</p>
        <div id="hints-list"></div>
      </div>

      <div class="guess-box">
        <h3 style="${correctlyGuessed ? 'display:none;' : ''}">Guess the Name</h3>
        <p style="font-size: 12px; margin-bottom:10px; color: #aaa; ${correctlyGuessed ? 'display:none;' : ''}">Current Guess Reward: <span id="current-reward">100</span> 🪙</p>
        <input type="text" id="guess-input" placeholder="Type name here..." style="${correctlyGuessed ? 'display:none;' : ''}">
        <button class="btn-game" id="guess-btn" style="${correctlyGuessed ? 'display:none;' : ''}">Submit Guess</button>
        <div id="guess-feedback" style="margin-top:10px;">
          ${correctlyGuessed ? `<div style="padding:15px; background:rgba(50,205,50,0.1); border:1px solid var(--game-accent); border-radius:12px;">
            <h3 style="color:var(--game-accent); margin-bottom:5px;">🌟 Excellent!</h3>
            <p>Yeah! You answered correctly and earned <b>${lastGuessPoints} points</b>!</p>
            <p style="font-size:12px; margin-top:5px; color:#aaa;">Now finish the puzzle to complete the level.</p>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;

  renderPuzzleBoard(container);
  
  container.querySelector('#guess-btn').onclick = () => handleGuess(container);
  container.querySelector('#guess-input').onkeyup = (e) => { if (e.key === 'Enter') handleGuess(container); };

  attachHeaderEvents(container);

  if (level === 1 && !tutorialsShown[user]) {
    tutorialsShown[user] = true;
    showTutorialModal(container);
  }
}

function renderPuzzleBoard(container) {
  const boardEl = container.querySelector('#game-puzzle-board');
  boardEl.innerHTML = '';

  boardState.forEach((pieceId, index) => {
    const isCorrect = pieceId === index;
    const piece = document.createElement('div');
    piece.className = `puzzle-piece ${isCorrect ? 'placed' : ''}`;
    piece.style.width = '100px';
    piece.style.height = '100px';
    
    // Background math
    if (pieceId !== -1) {
      const r = Math.floor(pieceId / gridCols);
      const c = pieceId % gridCols;
      const bgX = (c / (gridCols - 1)) * 100 + '%';
      const bgY = (r / (gridRows - 1)) * 100 + '%';
      
      piece.style.backgroundImage = `url('${currentLevelData.image}')`;
      piece.style.backgroundSize = `${gridCols * 100}% ${gridRows * 100}%`;
      piece.style.backgroundPosition = `${bgX} ${bgY}`;
      
      piece.onclick = () => moveSlidingPiece(index, container);
    } else {
      piece.className = 'puzzle-piece empty';
    }

    if (isCorrect && !puzzleCompleted) {
      // We no longer trigger hints here initially to follow user's request.
      // addHintForPiece is only called inside moveSlidingPiece now.
    }

    boardEl.appendChild(piece);
  });

  checkCompletion(container);
}

function moveSlidingPiece(index, container) {
  const emptyIndex = boardState.indexOf(-1);
  const row = Math.floor(index / gridCols);
  const col = index % gridCols;
  const emptyRow = Math.floor(emptyIndex / gridCols);
  const emptyCol = emptyIndex % gridCols;

  // Check adjacency
  const dist = Math.abs(row - emptyRow) + Math.abs(col - emptyCol);
  if (dist === 1) {
    // Swap
    const temp = boardState[index];
    boardState[index] = boardState[emptyIndex];
    boardState[emptyIndex] = temp;
    
    // Check if the piece moved into its correct position
    if (boardState[emptyIndex] === emptyIndex) {
      addHintForPiece(boardState[emptyIndex], container);
    }
    
    renderPuzzleBoard(container);
  }
}

function swapPiece(index, container) {
  // Simple logic: user clicks a piece, it swaps with the next/random if not locked?
  // Let's do: click first, click second to swap.
  const prevSelected = container.querySelector('.puzzle-piece.selected');
  if (prevSelected) {
    const prevIndex = parseInt(prevSelected.dataset.index);
    const targetIndex = index;
    
    // Swap in state
    const temp = boardState[prevIndex];
    boardState[prevIndex] = boardState[targetIndex];
    boardState[targetIndex] = temp;
    
    // Decrease points for each swap/hint needed
    lastGuessPoints = Math.max(20, lastGuessPoints - 5);
    container.querySelector('#current-reward').innerText = lastGuessPoints;

    renderPuzzleBoard(container);
  } else {
    const pieces = container.querySelectorAll('.puzzle-piece');
    pieces[index].classList.add('selected');
    pieces[index].style.border = '2px solid #fff';
    pieces[index].dataset.index = index;
  }
}

function addHintForPiece(pieceId, container) {
  if (pieceId === -1) return;
  const hintIndex = pieceId % currentLevelData.hints.length;
  const hint = currentLevelData.hints[hintIndex];
  
  if (!revealedHints.includes(hint)) {
    revealedHints.push(hint);
    showHintModal(hint, container);
    
    // Decrease points for each hint revealed
    if (!correctlyGuessed) {
      lastGuessPoints = Math.max(10, lastGuessPoints - 8);
      const rewardEl = container.querySelector('#current-reward');
      if (rewardEl) rewardEl.innerText = lastGuessPoints;
    }

    const list = container.querySelector('#hints-list');
    if (list) {
      const hEl = document.createElement('div');
      hEl.className = 'hint-item';
      hEl.innerHTML = `• ${hint}`;
      list.appendChild(hEl);
    }
  }
}

function showTutorialModal(container) {
  const portal = container.querySelector('#game-modal-portal');
  if (!portal) return;
  portal.innerHTML = `
    <div class="hint-modal-overlay" id="tutorial-overlay">
      <div class="hint-modal-content tutorial-modal" style="max-width: 450px; padding: 40px 25px;">
        <button class="hint-modal-close" id="tutorial-close-btn">&times;</button>
        
        <div class="tutorial-header">
          <div class="hint-icon" style="font-size: 50px; animation: floatIcon 3s ease-in-out infinite;">📜</div>
          <h2 style="font-size: 26px; margin-bottom: 5px; color: var(--gold);">How to Play</h2>
          <p style="color: #aaa; font-size: 12px; margin-bottom: 25px; letter-spacing: 2px; text-transform: uppercase;">Your Journey Begins Here</p>
        </div>

        <div class="tutorial-steps">
          <div class="tutorial-step">
            <div class="step-icon">🧩</div>
            <div class="step-text">
              <h4>Slide Pieces</h4>
              <p>Tap a puzzle piece next to the empty slot to slide it.</p>
            </div>
          </div>
          
          <div class="tutorial-step">
            <div class="step-icon">💡</div>
            <div class="step-text">
              <h4>Unlock Hints</h4>
              <p>Place a piece in its correct spot to reveal a Divine Hint.</p>
            </div>
          </div>
          
          <div class="tutorial-step">
            <div class="step-icon">🤔</div>
            <div class="step-text">
              <h4>Guess the Name</h4>
              <p>Use hints to guess the answer! Earlier guesses earn more 🪙.</p>
            </div>
          </div>
          
          <div class="tutorial-step">
            <div class="step-icon">🏆</div>
            <div class="step-text">
              <h4>Complete & Earn</h4>
              <p>Finish the puzzle to progress and unlock Avatar shop items!</p>
            </div>
          </div>
        </div>

        <button class="btn-game tutorial-start-btn" id="tutorial-start-btn">START JOURNEY ✨</button>
      </div>
    </div>
  `;
  
  const closeHandler = () => { portal.innerHTML = ''; };
  portal.querySelector('#tutorial-close-btn').onclick = closeHandler;
  portal.querySelector('#tutorial-start-btn').onclick = closeHandler;
}

function showHintModal(hint, container) {
  const portal = container.querySelector('#game-modal-portal');
  portal.innerHTML = `
    <div class="hint-modal-overlay">
      <div class="hint-modal-content">
        <button class="hint-modal-close" id="hint-modal-close-btn">&times;</button>
        <div class="hint-icon">💡</div>
        <h2>Divine Insight</h2>
        <div class="hint-text-box">
          <p>"${hint}"</p>
        </div>
        <p class="hint-subtext">Look at the clues to Guess the Name!</p>
      </div>
    </div>
  `;
  
  const closeBtn = portal.querySelector('#hint-modal-close-btn');
  closeBtn.onclick = () => {
    portal.innerHTML = '';
    if (hintModalTimeout) clearTimeout(hintModalTimeout);
  };
  
  if (hintModalTimeout) clearTimeout(hintModalTimeout);
  hintModalTimeout = setTimeout(() => {
    portal.innerHTML = '';
    hintModalTimeout = null;
  }, 6000);
}

function handleGuess(container) {
  const input = container.querySelector('#guess-input');
  const feedback = container.querySelector('#guess-feedback');
  const val = input.value.trim().toLowerCase();

  if (val === currentLevelData.answer.toLowerCase()) {
    if (correctlyGuessed) return;
    correctlyGuessed = true;
    feedback.innerHTML = `<div style="padding:15px; background:rgba(50,205,50,0.1); border:1px solid var(--game-accent); border-radius:12px;">
      <h3 style="color:var(--game-accent); margin-bottom:5px;">🌟 Excellent!</h3>
      <p>Yeah! You answered correctly and earned <b>${lastGuessPoints} coins</b>!</p>
      <p style="font-size:12px; margin-top:5px; color:#aaa;">Now finish the puzzle to complete the level.</p>
    </div>`;
    actions.gameAwardCoins(lastGuessPoints);
    
    // Hide input and button as requested
    input.style.display = 'none';
    container.querySelector('#guess-btn').style.display = 'none';
    container.querySelector('.guess-box h3').style.display = 'none';
    container.querySelector('.guess-box p:not(#guess-feedback p)').style.display = 'none';

  } else {
    feedback.innerHTML = `<span style="color: #f44; font-weight:bold;">Incorrect Guess. Try again!</span>`;
    lastGuessPoints = Math.max(10, lastGuessPoints - 10);
    container.querySelector('#current-reward').innerText = lastGuessPoints;
  }
}

function checkCompletion(container) {
  const allCorrect = boardState.every((id, idx) => {
    if (idx === boardState.length - 1) return id === -1;
    return id === idx;
  });
  if (allCorrect && !puzzleCompleted) {
    puzzleCompleted = true;
    const feedback = container.querySelector('#guess-feedback');
    feedback.innerHTML = `<p style="color: #fff;">Puzzle Complete! If you haven't guessed, it was <b>${currentLevelData.name}</b>.</p>`;
    
    // Automatic completion if puzzle finished
    const user = state.game.selectedUser;
    const lvl = state.game.currentLevel;
    const tag = `${user}-${lvl}`;
    if (!state.game.completedLevels.includes(tag)) {
       actions.gameAwardCoins(20); // Base completion reward
       actions.gameCompleteLevel(user, lvl);
    }
    
    setTimeout(() => {
      state.screen = 'game-levels';
      actions.goTo('game-levels');
    }, 3000);
  }
}

// ── Store ───────────────────────────────────────────────────────────────────
function renderStore(container) {
  const user = state.game.selectedUser;
  const userData = GAME_USERS.find(u => u.id === user);
  if (!userData) {
    actions.goTo('game-main');
    return;
  }
  const items = SHOP_ITEMS.filter(i => i.forUser.includes(user));
  const ownedItemRefs = state.game.inventory.filter(i => i.purchasedFor === user);
  
  // Fully hydrate the owned item data from SHOP_ITEMS
  const ownedItems = ownedItemRefs.map(ref => {
    const item = SHOP_ITEMS.find(i => i.id === ref.id);
    return { ...item, ...ref };
  });

  const defaultAvatars = {
    'ramayana': 'src/assets/game/rama_3d.png',
    'mahabharata': 'src/assets/game/krishna_3d.png',
    'ayurveda': 'https://images.unsplash.com/photo-1624494052342-990520bc973c?q=80&w=600&h=600&auto=format&fit=crop',
    'temples': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&h=600&auto=format&fit=crop'
  };

  container.innerHTML = `
    ${getGameHeaderHTML(`${userData.name}'s Divine Boutique`)}
    <div class="store-layout">
      <!-- Left side: Avatar Preview -->
      <div class="avatar-preview-section">
        <div class="avatar-container" id="avatar-container">
          <img src="${currentLevelData ? currentLevelData.cartoon : defaultAvatars[user]}" class="avatar-base-img" alt="${userData.name}">
          
          <!-- Layered Owned Items -->
          <div class="avatar-overlays" id="avatar-overlays">
            ${ownedItems.map(item => `
              <div class="item-overlay ${item.id}-overlay" title="${item.name}">${item.icon}</div>
            `).join('')}
          </div>
        </div>
        <div class="avatar-info">
          <h2 class="divine-name">${userData.name}</h2>
          <p class="divine-rank">${userData.title}</p>
        </div>
      </div>

      <!-- Right side: Purchase List -->
      <div class="store-items-section">
        <div class="store-grid-compact">
          ${items.map(item => {
            const owned = state.game.inventory.find(i => i.id === item.id && i.purchasedFor === user);
            return `
              <div class="compact-shop-item ${owned ? 'owned' : ''}">
                <div class="item-info-row">
                  <span class="compact-icon">${item.icon}</span>
                  <div class="compact-text">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${owned ? '<span style="color:var(--game-accent)">✓ OWNED</span>' : `${item.price} 🪙`}</span>
                  </div>
                </div>
                <button class="btn-game buy-btn-small" id="buy-btn-${item.id}" ${owned ? 'disabled' : ''}>
                  ${owned ? 'Equipped' : 'Buy'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  items.forEach(item => {
    const btn = container.querySelector(`#buy-btn-${item.id}`);
    if (btn) {
      btn.onclick = () => {
        if (actions.gamePurchaseItem(item)) {
          // Success: No full re-render needed, but let's re-render store to show new item
          renderStore(container);
        } else {
          alert('Not enough coins!');
        }
      };
    }
  });

  // 3D Tilt interaction for Talking-Tom vibe
  const avatarCont = container.querySelector('#avatar-container');
  if (avatarCont) {
    avatarCont.onmousemove = (e) => {
      const rect = avatarCont.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (y - centerY) / 10;
      const tiltY = (centerX - x) / 10;
      avatarCont.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    };
    avatarCont.onmouseleave = () => {
      avatarCont.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };
  }

  attachHeaderEvents(container);
}

// ── Utils ──────────────────────────────────────────────────────────────────
function shuffle(array) {
  // To ensure solvability, we start from a solved state and apply random valid moves
  const totalMoves = 100;
  let emptyIdx = array.length - 1; // start with last cell empty
  
  for (let i = 0; i < totalMoves; i++) {
    const adj = getAdjacentIndices(emptyIdx, gridRows, gridCols);
    const moveIdx = adj[Math.floor(Math.random() * adj.length)];
    // Swap
    [array[emptyIdx], array[moveIdx]] = [array[moveIdx], array[emptyIdx]];
    emptyIdx = moveIdx;
  }
}

function getAdjacentIndices(idx, rows, cols) {
  const r = Math.floor(idx / cols);
  const c = idx % cols;
  const adj = [];
  if (r > 0) adj.push(idx - cols);
  if (r < rows - 1) adj.push(idx + cols);
  if (c > 0) adj.push(idx - 1);
  if (c < cols - 1) adj.push(idx + 1);
  return adj;
}
