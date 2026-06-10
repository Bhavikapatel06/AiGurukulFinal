/**
 * Learn.js
 * Full conversion of learn.html → ES module component.
 *
 * Usage in index.html script:
 *   import { renderLearn } from './src/components/Learn.js';
 *
 *   // Inside your render() switch, case 'learn':
 *   renderLearn(document.getElementById('screen-learn'), () => actions.goTo('landing'));
 */

/* ══════════════════════════════════════
   STYLES — injected once into <head>
══════════════════════════════════════ */
import { actions } from '../hooks/useGurukul.js';
function injectLearnStyles() {
  if (document.getElementById('learn-styles')) return;
  const s = document.createElement('style');
  s.id = 'learn-styles';
  s.textContent = `
#screen-learn{overflow-y:auto;overflow-x:hidden;background:var(--bg)}
.l-site-header{display:flex;align-items:center;gap:16px;padding:16px 28px;border-bottom:1px solid var(--gold-border);position:sticky;top:0;background:var(--bg);z-index:10}
.l-hdr-btn{background:none;border:1px solid var(--gold-border);color:var(--text-muted);border-radius:var(--r-sm);padding:8px 16px;cursor:pointer;font-family:'Lato',sans-serif;font-size:13px;transition:all .2s}
.l-hdr-btn:hover{border-color:var(--gold-border-hi);color:var(--gold)}
.l-site-title{font-family:'Cinzel',serif;font-size:18px;color:var(--gold)}
.l-tabs{display:flex;border-bottom:1px solid var(--gold-border);padding:0 28px;overflow-x:auto}
.l-tab{background:none;border:none;border-bottom:2px solid transparent;padding:13px 22px;font-family:'Cinzel',serif;font-size:13px;color:var(--text-dim);cursor:pointer;transition:all .2s;white-space:nowrap;margin-bottom:-1px}
.l-tab:hover{color:var(--text-muted)}.l-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.l-panel{display:none}.l-panel.active{display:block}
.l-topic-hdr{padding:28px 28px 20px;max-width:940px;margin:0 auto}
.l-eyebrow{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px}
.l-tname{font-family:'Cinzel',serif;font-size:28px;color:var(--gold);margin-bottom:10px}
.l-tmeta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.l-tpill{font-size:12px;color:var(--text-dim);background:var(--surface);border:1px solid var(--gold-border);border-radius:20px;padding:3px 12px}
.l-tdesc{font-size:14px;color:var(--text-muted);line-height:1.8;max-width:680px}
.l-sec-lbl{font-family:'Cinzel',serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dim);padding:0 28px 14px;max-width:940px;margin:0 auto;display:block}
.l-info-bar{margin:0 auto 20px;max-width:940px;padding:0 28px}
.l-info-inner{background:var(--gold-faint);border:1px solid var(--gold-border);border-radius:var(--r-md);padding:12px 18px;font-size:13px;color:var(--text-muted);line-height:1.6}
.l-info-inner strong{color:var(--gold)}
.l-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:14px;padding:0 28px 48px;max-width:940px;margin:0 auto}
.l-card{background:var(--surface);border:1px solid var(--gold-border);border-radius:var(--r-lg);padding:20px 20px 16px;transition:all .3s;position:relative;overflow:hidden;animation:lFadeUp .35s ease both;display:flex;flex-direction:column;gap:5px;cursor:pointer}
.l-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--gold-dim);border-radius:3px 0 0 3px;transition:background .2s}
.l-card:hover{border-color:var(--gold-border-hi);transform:translateY(-2px)}.l-card:hover::before{background:var(--gold)}
.l-card.gc::before{background:var(--green)}.l-card.oc::before{background:var(--orange)}
.lc-ey{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim)}
.lc-ey.g{color:var(--green)}.lc-ey.o{color:var(--orange)}
.lc-sk{font-family:'Noto Sans Devanagari','Cinzel',serif;font-size:16px;color:var(--gold);line-height:1.5}
.lc-ro{font-size:11px;color:var(--text-dim);font-style:italic}
.lc-hr{height:1px;background:linear-gradient(90deg,var(--gold-dim),transparent);opacity:.25;margin:4px 0}
.lc-ti{font-size:14px;font-weight:700;color:var(--text);line-height:1.4}
.lc-pr{font-size:12px;color:var(--text-dim);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lc-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
.lc-tag{font-size:10px;padding:2px 9px;border-radius:20px;background:var(--gold-faint);border:1px solid rgba(212,175,55,0.2);color:var(--gold-dim)}
.lc-tag.g{background:rgba(58,155,140,.08);border-color:rgba(58,155,140,.25);color:var(--green)}
.lc-tag.o{background:rgba(196,107,58,.08);border-color:rgba(196,107,58,.25);color:var(--orange)}
.l-rm-btn{margin-top:10px;align-self:flex-start;background:none;border:1px solid var(--gold-border);border-radius:var(--r-sm);padding:7px 16px;font-size:12px;font-family:'Cinzel',serif;color:var(--gold-dim);cursor:pointer;letter-spacing:.5px;transition:all .2s}
.l-rm-btn:hover{background:var(--gold-faint);border-color:var(--gold-border-hi);color:var(--gold)}
.l-rm-btn.g{border-color:rgba(58,155,140,.3);color:var(--green)}.l-rm-btn.g:hover{background:rgba(58,155,140,.07);border-color:var(--green)}
.l-rm-btn.o{border-color:rgba(196,107,58,.3);color:var(--orange)}.l-rm-btn.o:hover{background:rgba(196,107,58,.07);border-color:var(--orange)}
#l-detail{display:none;min-height:100vh;animation:lFadeIn .3s ease}
.l-det-hdr{display:flex;align-items:center;gap:14px;padding:16px 28px;border-bottom:1px solid var(--gold-border);position:sticky;top:0;background:var(--bg);z-index:10}
.l-close-btn{display:flex;align-items:center;gap:8px;background:none;border:1px solid var(--gold-border);color:var(--text-muted);border-radius:var(--r-sm);padding:8px 18px;cursor:pointer;font-family:'Lato',sans-serif;font-size:13px;font-weight:700;transition:all .2s}
.l-close-btn:hover{border-color:var(--gold-border-hi);color:var(--gold)}
.l-det-name{font-family:'Cinzel',serif;font-size:16px;color:var(--gold);flex:1}
.l-det-sub{font-size:12px;color:var(--text-dim)}
.l-det-body{max-width:780px;margin:0 auto;padding:36px 28px 60px}
.ld-eyebrow{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--gold-dim);margin-bottom:8px}
.ld-sk{font-family:'Noto Sans Devanagari','Cinzel',serif;font-size:30px;color:var(--gold);line-height:1.4;margin-bottom:4px}
.ld-ro{font-size:14px;color:var(--text-dim);font-style:italic;margin-bottom:10px}
.ld-title{font-family:'Cinzel',serif;font-size:22px;color:var(--text);margin-bottom:12px}
.ld-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.ld-pill{font-size:12px;background:var(--surface);border:1px solid var(--gold-border);border-radius:20px;padding:4px 14px;color:var(--text-dim)}
.ld-pill.g{border-color:rgba(58,155,140,.3);color:var(--green);background:rgba(58,155,140,.06)}
.ld-pill.o{border-color:rgba(196,107,58,.3);color:var(--orange);background:rgba(196,107,58,.06)}
.ld-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.ld-tag{font-size:12px;padding:4px 14px;border-radius:20px;background:var(--gold-faint);border:1px solid rgba(212,175,55,.2);color:var(--gold-dim)}
.ld-tag.g{background:rgba(58,155,140,.08);border-color:rgba(58,155,140,.25);color:var(--green)}
.l-gold-hr{height:1px;background:linear-gradient(90deg,var(--gold-dim),transparent);opacity:.3;margin:24px 0}
.ld-sec{margin-bottom:28px}
.ld-lbl{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;display:flex;align-items:center;gap:8px}
.ld-lbl::after{content:'';flex:1;height:1px;background:var(--gold-border)}
.l-shloka-box{background:var(--gold-faint);border-left:3px solid var(--gold-dim);border-radius:0 var(--r-md) var(--r-md) 0;padding:16px 20px;margin-bottom:8px}
.l-shloka-box.g{border-left-color:var(--green)}.l-shloka-box.o{border-left-color:var(--orange)}
.l-sk-text{font-family:'Noto Sans Devanagari',serif;font-size:18px;color:var(--gold);line-height:1.9;margin-bottom:6px}
.l-sk-trans{font-size:13px;color:var(--text-dim);font-style:italic;line-height:1.7}
.ld-text{font-size:15px;color:var(--text-muted);line-height:1.85}
.ld-text strong{color:var(--text);font-weight:700}
.l-lesson-box{background:var(--surface);border:1px solid var(--gold-border);border-radius:var(--r-md);padding:20px 24px;font-size:17px;font-style:italic;color:var(--text);line-height:1.7;border-left:4px solid var(--gold-dim)}
.l-lesson-box.g{border-left-color:var(--green)}.l-lesson-box.o{border-left-color:var(--orange)}
.l-story{background:var(--surface2);border:1px solid var(--gold-border);border-radius:var(--r-md);padding:18px 20px;margin-bottom:12px}
.l-story-t{font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px}
.l-story-s{font-size:13px;color:var(--text-muted);line-height:1.7;margin-bottom:8px}
.l-story-l{font-size:12px;color:var(--gold-dim);font-style:italic}
.l-ayur-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px}
@media(max-width:520px){.l-ayur-row{grid-template-columns:1fr}}
.l-ayur-blk{background:var(--surface2);border:1px solid var(--gold-border);border-radius:var(--r-md);padding:14px 16px}
.l-ayur-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:4px}
.l-ayur-val{font-size:13px;color:var(--text-muted);line-height:1.65}
.l-warn{background:rgba(226,75,74,.07);border:1px solid rgba(226,75,74,.25);border-radius:var(--r-md);padding:14px 18px;font-size:13px;color:#E24B4A;line-height:1.65}
.l-det-nav{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:24px;border-top:1px solid var(--gold-border)}
.l-nav-btn{background:var(--surface);border:1px solid var(--gold-border);border-radius:var(--r-sm);padding:10px 20px;font-family:'Cinzel',serif;font-size:13px;color:var(--text-muted);cursor:pointer;transition:all .2s}
.l-nav-btn:hover{border-color:var(--gold-border-hi);color:var(--gold)}.l-nav-btn:disabled{opacity:.3;cursor:not-allowed}
.l-nav-ctr{font-size:13px;color:var(--text-dim)}
@keyframes lFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes lFadeIn{from{opacity:0}to{opacity:1}}
.l-solve-btn{background:linear-gradient(135deg,#3A9B8C 0%,#2E7D71 100%);border:none;border-radius:var(--r-md);color:#ffffff;padding:12px 24px;font-family:'Cinzel',serif;font-weight:700;font-size:14px;letter-spacing:1px;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 15px rgba(58,155,140,0.25);display:inline-flex;align-items:center;gap:8px;margin-top:20px}
.l-solve-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(58,155,140,0.4);background:linear-gradient(135deg,#42b2a1 0%,#328a7c 100%)}
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════
   DATA
══════════════════════════════════════ */
const GITA = [
  { num: 1, sk: 'अर्जुन विषाद योग', ro: 'Arjuna Vishada Yoga', en: "The Yoga of Arjuna's Grief", shloka: 'धृतराष्ट्र उवाच —\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय।।', trans: '"Dhritarashtra said: O Sanjaya, after my sons and the sons of Pandu assembled at Kurukshetra, desiring to fight, what did they do?"', lesson: 'Even the greatest warrior can be paralysed by emotion. Acknowledging grief is the first step to wisdom.', modern: 'Arjuna shows classic acute stress response symptoms — racing heart, trembling limbs, mental fog. Modern psychology calls this "crisis paralysis."', preview: 'Arjuna sees his own teachers and relatives on the opposing side and drops his bow, unable to fight.', tags: ['Grief', 'Duty', 'Paralysis'] },
  { num: 2, sk: 'सांख्य योग', ro: 'Sankhya Yoga', en: 'The Yoga of Knowledge', shloka: 'न जायते म्रियते वा कदाचिन्\nनायं भूत्वा भविता वा न भूयः।\nअजो नित्यः शाश्वतोऽयं पुराणो\nन हन्यते हन्यमाने शरीरे।।', trans: '"The soul is never born nor dies at any time. It is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain."', lesson: 'You are not your body. Fear of death dissolves when you understand the self is eternal.', modern: 'Relates to "self-transcendence" in psychology — detaching identity from the physical and temporal.', preview: "Krishna explains the eternal nature of the soul and the philosophy of Sankhya to calm Arjuna's grief.", tags: ['Soul', 'Immortality', 'Knowledge'] },
  { num: 3, sk: 'कर्म योग', ro: 'Karma Yoga', en: 'The Yoga of Action', shloka: 'नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः।\nशरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः।।', trans: '"Do your duty. Action is better than inaction."', lesson: 'Do your duty without craving results. Action done selflessly purifies the soul.', modern: 'Behavioural science calls this "intrinsic motivation" — working for the work itself, not the reward.', preview: 'Krishna teaches that one must act according to duty without attachment to the fruits of action.', tags: ['Action', 'Duty', 'Selfless Work'] },
  { num: 4, sk: 'ज्ञान कर्म संन्यास योग', ro: 'Jnana Karma Sanyasa Yoga', en: 'The Yoga of Knowledge & Renunciation', shloka: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्।।', trans: '"Whenever there is a decline of righteousness and rise of unrighteousness, O Arjuna, I manifest Myself."', lesson: 'Knowledge liberates. God descends when dharma declines. Truth is cyclical, not linear.', modern: 'Jungian psychology speaks of the "archetypal hero" appearing when society is in shadow.', preview: 'Krishna reveals He appears whenever righteousness declines and teaches the path of wisdom.', tags: ['Knowledge', 'Incarnation', 'Dharma'] },
  { num: 5, sk: 'कर्म संन्यास योग', ro: 'Karma Sanyasa Yoga', en: 'The Yoga of Renunciation of Action', shloka: 'संन्यासः कर्मयोगश्च निःश्रेयसकरावुभौ।\nतयोस्तु कर्मसंन्यासात्कर्मयोगो विशिष्यते।।', trans: '"Both renunciation and action in devotion are good for liberation. But action in devotion is better."', lesson: 'True renunciation is not running away — it is acting without ego.', modern: 'Stoic philosophy: "amor fati" — love of fate, acting fully while detached from outcome.', preview: 'Krishna compares renunciation with action-in-devotion, declaring the second superior.', tags: ['Renunciation', 'Ego', 'Liberation'] },
  { num: 6, sk: 'आत्मसंयम योग', ro: 'Atma Sanyam Yoga', en: 'The Yoga of Self-Control & Meditation', shloka: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः।।', trans: '"Let a man lift himself by his own Self alone; this self alone is the friend and enemy of oneself."', lesson: 'You are your own best friend and your own worst enemy. Discipline is the highest form of self-love.', modern: 'Self-determination theory: internal locus of control predicts wellbeing more than any external factor.', preview: 'A practical guide to meditation — posture, breathing, the restless mind, and how to return to stillness.', tags: ['Meditation', 'Self-Control', 'Mind'] },
  { num: 7, sk: 'ज्ञान विज्ञान योग', ro: 'Jnana Vijnana Yoga', en: 'The Yoga of Knowledge & Realisation', shloka: 'मनुष्याणां सहस्रेषु कश्चिद्यतति सिद्धये।\nयततामपि सिद्धानां कश्चिन्मां वेत्ति तत्त्वतः।।', trans: '"Among thousands of men, scarcely one strives for perfection; and of those, scarcely one knows Me in truth."', lesson: 'Seeking truth is rare. Knowing truth is rarer still. Both are worth everything.', modern: 'The Dunning-Kruger effect inverted: the truly wise always know how little they know.', preview: 'Krishna explains how very few among humanity truly seek or attain genuine spiritual knowledge.', tags: ['Wisdom', 'God', 'Reality'] },
  { num: 8, sk: 'अक्षर ब्रह्म योग', ro: 'Aksara Brahma Yoga', en: 'The Yoga of the Imperishable Absolute', shloka: 'अन्तकाले च मामेव स्मरन्मुक्त्वा कलेवरम्।\nयः प्रयाति स मद्भावं याति नास्त्यत्र संशयः।।', trans: '"Whoever at the time of death remembers Me alone, reaches My state. Of this there is no doubt."', lesson: "What you think at your final moment reflects your entire life's deepest habit. Live accordingly today.", modern: 'Neurologically, the dying brain consolidates the patterns most reinforced throughout life.', preview: "Krishna explains what happens to the soul at death and how meditation determines one's destination.", tags: ['Death', 'Liberation', 'Consciousness'] },
  { num: 9, sk: 'राज विद्या राज गुह्य योग', ro: 'Raja Vidya Raja Guhya Yoga', en: 'The Yoga of Royal Knowledge', shloka: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्।।', trans: '"For those who worship Me with devotion — I carry what they lack and preserve what they have."', lesson: 'Surrender is not weakness. Complete devotion to a higher purpose carries you through what effort alone cannot.', modern: 'Flow state research: complete absorption beyond the ego produces peak performance and sustained wellbeing.', preview: "Called the 'king of all knowledge' — Krishna's supreme mystery of devotion and His direct promise.", tags: ['Devotion', 'Surrender', 'Grace'] },
  { num: 10, sk: 'विभूति योग', ro: 'Vibhuti Yoga', en: 'The Yoga of Divine Manifestation', shloka: 'अहमात्मा गुडाकेश सर्वभूताशयस्थितः।\nअहमादिश्च मध्यं च भूतानामन्त एव च।।', trans: '"I am the Self, dwelling in the heart of all beings. I am the beginning, the middle, and the end."', lesson: 'The divine is not outside you. It is the intelligence inside every atom, every life, every thought.', modern: 'Panpsychism — consciousness as a fundamental property of reality — now seriously engaged by modern physicists.', preview: 'Krishna describes His infinite manifestations — every river, every mountain, every silence.', tags: ['Divine', 'Manifestation', 'Self'] },
  { num: 11, sk: 'विश्वरूप दर्शन योग', ro: 'Vishwarupa Darshana Yoga', en: 'The Yoga of the Cosmic Form', shloka: 'कालोऽस्मि लोकक्षयकृत्प्रवृद्धो\nलोकान्समाहर्तुमिह प्रवृत्तः।', trans: '"I am Time, the great destroyer of worlds, and I have come here to destroy all people."', lesson: 'Time is the ultimate reality. It consumes everything. Act now. Every delay is a small death.', modern: 'Terror Management Theory: awareness of death is paradoxically the greatest driver of meaningful action.', preview: "Arjuna is granted divine vision and sees Krishna's infinite, terrifying cosmic form devouring all of creation.", tags: ['Cosmic Form', 'Time', 'Destruction'] },
  { num: 12, sk: 'भक्ति योग', ro: 'Bhakti Yoga', en: 'The Yoga of Devotion', shloka: 'मय्येव मन आधत्स्व मयि बुद्धिं निवेशय।\nनिवसिष्यसि मय्येव अत ऊर्ध्वं न संशयः।।', trans: '"Fix your mind on Me alone. Henceforth you shall live in Me. There is no doubt."', lesson: 'Love is the shortest path. Devotion dissolves the ego faster than logic ever could.', modern: "Oxytocin activates the brain's reward circuitry. Sustained devotion literally restructures neural pathways.", preview: 'Krishna describes the qualities of His most beloved devotee — equanimity, compassion, freedom from ego.', tags: ['Devotion', 'Love', 'Bhakti'] },
  { num: 13, sk: 'क्षेत्र क्षेत्रज्ञ विभाग योग', ro: 'Kshetra Kshetragyna Vibhaga Yoga', en: 'The Yoga of the Field and Its Knower', shloka: 'इदं शरीरं कौन्तेय क्षेत्रमित्यभिधीयते।\nएतद्यो वेत्ति तं प्राहुः क्षेत्रज्ञ इति तद्विदः।।', trans: '"This body is called the field. One who knows this body is called the knower of the field."', lesson: 'You are not your body. The body is the field; you are the farmer. Know the difference.', modern: 'This maps onto the "observer self" — the meta-awareness that watches thoughts without being them.', preview: 'A philosophical dissection of matter vs. consciousness.', tags: ['Body', 'Soul', 'Self-Knowledge'] },
  { num: 14, sk: 'गुणत्रय विभाग योग', ro: 'Gunatraya Vibhaga Yoga', en: 'The Yoga of the Three Qualities', shloka: 'सत्त्वं रजस्तम इति गुणाः प्रकृतिसम्भवाः।\nनिबध्नन्ति महाबाहो देहे देहिनमव्ययम्।।', trans: '"Sattva, Rajas, and Tamas — these three qualities bind the eternal soul to the body."', lesson: 'Every action, food, thought, and person either raises your energy (Sattva), agitates it (Rajas), or dulls it (Tamas). Choose deliberately.', modern: 'Modern behavioural energy management maps human states as high-positive (Sattva), high-negative (Rajas), and low-negative (Tamas).', preview: 'The three gunas framework — a classification of all matter, food, actions, and mental states.', tags: ['Sattva', 'Rajas', 'Tamas', 'Energy'] },
  { num: 15, sk: 'पुरुषोत्तम योग', ro: 'Purushottama Yoga', en: 'The Yoga of the Supreme Person', shloka: 'ऊर्ध्वमूलमधःशाखमश्वत्थं प्राहुरव्ययम्।\nछन्दांसि यस्य पर्णानि यस्तं वेद स वेदवित्।।', trans: '"They speak of an eternal peepal tree with its roots above and branches below."', lesson: 'Reality is an inverted tree — roots above in consciousness, branches below in matter. Seek the source.', modern: 'Systems thinking: visible complex phenomena arise from invisible foundational principles.', preview: "The mysterious metaphor of the inverted cosmic tree and Krishna's revelation of the Supreme Person.", tags: ['Supreme Self', 'Reality', 'Consciousness'] },
  { num: 16, sk: 'दैवासुर सम्पद विभाग योग', ro: 'Daivāsura Sampad Vibhaga Yoga', en: 'The Yoga of Divine & Demonic Qualities', shloka: 'अभयं सत्त्वसंशुद्धिर्ज्ञानयोगव्यवस्थितिः।\nदानं दमश्च यज्ञश्च स्वाध्यायस्तप आर्जवम्।।', trans: '"Fearlessness, purity of heart, steadfastness in knowledge and yoga, charity, self-control..."', lesson: 'Every human contains both divine and demonic tendencies. Awareness is what lets you choose which one grows.', modern: "Jungian shadow work: acknowledging the dark side is the first step to integrating and transcending it.", preview: 'A vivid catalogue of divine qualities vs. demonic qualities — and which path each leads to.', tags: ['Dharma', 'Character', 'Good vs Evil'] },
  { num: 17, sk: 'श्रद्धात्रय विभाग योग', ro: 'Shradhatraya Vibhaga Yoga', en: 'The Yoga of the Threefold Faith', shloka: 'त्रिविधा भवति श्रद्धा देहिनां सा स्वभावजा।\nसात्त्विकी राजसी चैव तामसी चेति तां शृणु।।', trans: '"The faith of each person is in accordance with their natural disposition. A person is made of faith."', lesson: 'You become exactly what you believe. Faith is not just religion — it is the direction your entire life points.', modern: 'The placebo effect, self-fulfilling prophecy, and confirmation bias prove that belief literally shapes physiological reality.', preview: 'Faith, food, worship, and charity divided by the three gunas — a practical framework for daily choices.', tags: ['Faith', 'Belief', 'Food', 'Worship'] },
  { num: 18, sk: 'मोक्ष संन्यास योग', ro: 'Moksha Sanyasa Yoga', en: 'The Yoga of Liberation & Renunciation', shloka: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः।।', trans: '"Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear."', lesson: 'The final teaching: let go of everything — roles, rules, duties, identities — and surrender completely.', modern: 'Psychologically maps onto radical acceptance — the most advanced states in therapeutic healing.', preview: 'The longest chapter — a complete summary of the Gita, culminating in the most famous verse: Surrender to Me alone.', tags: ['Liberation', 'Surrender', 'Final Teaching'] },
];

const PANCHA = [
  { num: 1, title: 'मित्रभेद', ro: 'Mitra Bheda', en: 'The Loss of Friends', desc: 'The longest and most famous book. A lion king Pingalaka and his bull friend Sanjeevaka are manipulated apart by the scheming jackal Damanaka. A masterclass in how envy, flattery, and political cunning can destroy the deepest bonds.', moral: 'A clever tongue can destroy what years of friendship built. Beware those who benefit from your separation.', stories: [{ t: 'The Monkey and the Crocodile', s: "A monkey and a crocodile are friends. The crocodile's jealous wife demands the monkey's heart. The crocodile invites the monkey to cross the river on his back — then reveals the trap midway. The wise monkey claims he left his heart in the tree. The foolish crocodile turns back, and the monkey escapes forever.", l: 'Greed destroys genuine friendship. A wise person thinks before the trap closes, not after.' }, { t: 'The Blue Jackal', s: 'A hungry jackal falls into a tub of indigo dye. Emerging brilliant blue, he proclaims himself a divine animal. All animals bow. One night, other jackals howl — instinct takes over, and he howls back. His true nature is revealed. He is killed by the animals he deceived.', l: 'No false identity survives scrutiny forever. You cannot outrun what you actually are.' }, { t: 'The Lion and the Hare', s: "A tyrant lion terrorises the forest, demanding one animal daily. On the hare's turn, he arrives late, telling the lion a rival lion in a well delayed him. The enraged lion rushes to the well, sees his own reflection, and leaps in — drowning himself.", l: 'Intelligence defeats strength every time. The best battle is the one where your enemy destroys himself.' }] },
  { num: 2, title: 'मित्रसम्प्राप्ति', ro: 'Mitra Samprapti', en: 'The Gaining of Friends', desc: 'A crow, a mouse, a tortoise, and a deer — four animals with nothing in common — form an unlikely, deeply loyal friendship. Each saves the others through their unique strengths.', moral: 'Friends who are different from you complete your blind spots. Seek allies, not mirrors.', stories: [{ t: 'The Crow, Mouse, Tortoise and Deer', s: "A deer is caught in a hunter's net. The mouse chews through the net. The tortoise distracts the hunter. The crow watches from above and warns of danger. Each animal contributes what the others cannot.", l: "Every weakness in a group is covered by someone else's strength. Build your circle for complementarity, not similarity." }, { t: 'The Weaver Who Loved a Princess', s: 'A poor weaver falls in love with a princess. His clever friend builds him a mechanical flying Vishnu chariot. The weaver flies to her window dressed as Lord Vishnu. The king accepts the union as divine will.', l: 'Audacity, creativity, and the right ally can achieve what conventional effort never could.' }] },
  { num: 3, title: 'काकोलूकीयम्', ro: 'Kakolukiyam', en: 'Of Crows and Owls', desc: 'The darkest book. Crows and owls are hereditary enemies. This is about war, truce, spying, and the mechanics of political betrayal between states that can never truly trust each other.', moral: 'Never trust an enemy who claims to have changed — demand proof. Never reveal your weakness to someone who benefits from it.', stories: [{ t: 'The Crow Who Infiltrated the Owls', s: 'A crow volunteers to be "banished" by his own murder — beaten publicly to look real — then approaches the owl kingdom as a refugee. He earns their trust, learns every weakness, then guides his crow family to burn the owls in their own home.', l: 'The most dangerous spy is one who earns your sympathy. Never allow an enemy inside your defenses.' }, { t: 'The Cave That Spoke', s: 'Scouts report a lion\'s tracks entering a cave but not leaving. A wise crow suggests calling out: "O Cave, do you not welcome guests?" The lion inside calls back "Come in!" — revealing himself. The crows fly away and warn the kingdom.', l: 'Before entering any situation, test it safely from a distance. Intelligence is the first weapon.' }] },
  { num: 4, title: 'लब्धप्रणाश', ro: 'Labdhapranasha', en: 'Loss of Gains', desc: 'Short and punishing. A collection of stories about losing what you already have by grasping for more. Contentment is the greatest wealth; greed is the most reliable destroyer.', moral: 'The bird in hand is worth ten in the sky. Greed is not ambition — it is the enemy of what you have already won.', stories: [{ t: 'The Monkey and the Wedge', s: 'Merchants are building a temple. A monkey curiously sits on the half-split log, tail trapped in the wedge. He pulls out the wedge to free himself. The log snaps shut, crushing him. He dies for meddling in what was not his business.', l: 'Interference in affairs that do not concern you always costs more than it gives.' }, { t: "The Brahmin's Dream", s: "A brahmin receives a pot of barley flour. He fantasises: sell the flour, buy a goat, then cattle, then marry, have children. He waves his staff in fantasy and knocks over the real pot. Every grain spills.", l: 'Daydreaming about what you do not yet have guarantees you will lose what you do.' }] },
  { num: 5, title: 'अपरीक्षितकारकम्', ro: 'Aparikshitakarakam', en: 'Ill-Considered Action', desc: 'The final book. A sustained warning against acting without full inquiry. The most famous story in all of Panchatantra lives here.', moral: 'Act only after full inquiry. Haste is the father of permanent regret. Ask one more question before you act.', stories: [{ t: 'The Brahmin and the Mongoose', s: 'A brahmin leaves his baby sleeping, trusting their loyal mongoose to guard the child. He returns to find the mongoose at the door, mouth covered in blood. He kills the mongoose instantly. Inside, his son is safe — sleeping next to the crushed body of a cobra the mongoose had killed to protect him.', l: 'Never act on incomplete evidence. The most irreversible decisions demand the most patience.' }, { t: 'The Four Scholars and the Revived Lion', s: 'Four scholars find a dead lion. Three want to revive it to prove their learning. The fourth says "This will kill us." They ignore him. He climbs a tree. The three revive the lion. It eats them immediately.', l: 'Practical wisdom outweighs academic knowledge every time.' }] },
];

const AYUR = [
  { name: 'अश्वगंधा', ro: 'Ashwagandha', en: 'Indian Ginseng / Winter Cherry', lat: 'Withania somnifera', rasa: 'Bitter, Astringent', guna: 'Heavy, Oily', effect: 'Vata-Kapha balancing', dosha: 'Reduces Vata & Kapha', when: 'Chronic stress, fatigue, low immunity, poor sleep, anxiety, low testosterone, post-illness recovery.', how: '½ tsp root powder in warm full-fat milk at night before sleep. Add honey after cooling. Or 300–500mg extract capsule.', dosage: '300–500mg standardised extract (with 5% withanolides) OR 1–2 tsp root powder daily. Most benefits seen after 8–12 weeks.', warn: 'Avoid in pregnancy and lactation. Do not combine with thyroid medications without doctor supervision. May cause sedation.', sci: '50+ human clinical trials. Reduces serum cortisol by 27.9% (Chandrasekhar et al., 2012). Improves VO₂max in athletes. Withanolides modulate HPA axis stress response.', tags: ['Stress', 'Sleep', 'Immunity', 'Strength', 'Fatigue'] },
  { name: 'तुलसी', ro: 'Tulsi', en: 'Holy Basil', lat: 'Ocimum sanctum', rasa: 'Pungent, Bitter', guna: 'Light, Dry', effect: 'Vata-Kapha reducing', dosha: 'Reduces Vata & Kapha', when: 'Cold, cough, sore throat, fever, mild anxiety, low energy, respiratory issues, monsoon immunity.', how: '5–10 fresh leaves in 1 cup boiling water. Steep 5 minutes. Add ginger and honey. Drink morning on empty stomach.', dosage: '2–3 cups tulsi tea daily OR 300–600mg dried leaf capsule. Fresh leaves are most potent.', warn: 'Avoid large doses during pregnancy. May slow blood clotting — stop 2 weeks before surgery.', sci: 'Contains eugenol (anti-inflammatory), rosmarinic acid (antioxidant), and ursolic acid. Studies show significant reduction in anxiety scores and blood glucose.', tags: ['Cold', 'Immunity', 'Stress', 'Respiratory', 'Fever'] },
  { name: 'हरिद्रा', ro: 'Haridra', en: 'Turmeric', lat: 'Curcuma longa', rasa: 'Pungent, Bitter, Astringent', guna: 'Light, Dry', effect: 'Tridoshic', dosha: 'Balances all 3 doshas', when: 'Inflammation (joints, gut, skin), poor digestion, low immunity, wound healing, skin dullness.', how: 'Golden milk: ½ tsp turmeric + pinch of black pepper in warm milk. Black pepper increases curcumin absorption by 2000%.', dosage: '500–1000mg curcumin extract with piperine daily. Always combine with black pepper or fat.', warn: 'High doses thin blood — stop 2 weeks before surgery. Avoid with anticoagulants at therapeutic doses.', sci: '12,000+ research papers on curcumin. Inhibits NF-κB — the master switch of inflammation. Compares favourably to ibuprofen for knee osteoarthritis pain in 3 human trials.', tags: ['Inflammation', 'Joints', 'Digestion', 'Skin', 'Immunity'] },
  { name: 'त्रिफला', ro: 'Triphala', en: 'Three Fruits', lat: 'Terminalia chebula + T. bellerica + Phyllanthus emblica', rasa: 'Contains 5 of the 6 tastes', guna: 'Light, Dry', effect: 'Tridoshic', dosha: 'Balances all 3 doshas', when: 'Constipation, sluggish digestion, detox, eye strain, weight management, anti-aging.', how: '1 tsp powder stirred into warm water at bedtime. Or 2 capsules (500mg each) 30 min before bed.', dosage: '3–6g powder at night or 500–1000mg extract. Consistent use for 4–6 weeks.', warn: 'May cause loose stools initially — start with ½ tsp. Avoid during pregnancy. Do not take with iron supplements.', sci: '5x the Vitamin C of oranges per gram. Proven prebiotic — feeds Lactobacillus and Bifidobacterium. 600+ peer-reviewed papers.', tags: ['Digestion', 'Detox', 'Eyes', 'Anti-aging', 'Constipation'] },
  { name: 'ब्राह्मी', ro: 'Brahmi', en: 'Water Hyssop / Bacopa', lat: 'Bacopa monnieri', rasa: 'Bitter, Astringent, Sweet', guna: 'Light', effect: 'Tridoshic — especially Vata-Pitta', dosha: 'Reduces Vata & Pitta', when: 'Poor memory, brain fog, exam stress, ADHD, anxiety, slow learning speed, age-related cognitive decline.', how: '300mg standardised extract twice daily with food. Or ½ tsp Brahmi powder in ghee/milk. Brahmi oil for scalp massage.', dosage: '300–600mg extract standardised to 20% bacosides. Must take for minimum 12 weeks — effects are cumulative.', warn: 'May cause nausea if taken on empty stomach — always take with food. Avoid with benzodiazepines or sedatives.', sci: 'Bacosides A and B repair synaptic plasticity in the hippocampus. 12-week RCT: significant improvement in verbal learning, memory consolidation, and visual processing speed vs. placebo.', tags: ['Memory', 'Brain', 'Anxiety', 'Focus', 'ADHD'] },
  { name: 'आमलकी', ro: 'Amalaki', en: 'Indian Gooseberry / Amla', lat: 'Phyllanthus emblica', rasa: 'All 6 tastes — predominantly sour', guna: 'Heavy, Cold, Moist', effect: 'Tridoshic — especially Pitta reducing', dosha: 'Strongly reduces Pitta', when: 'Low immunity, hair fall/greying, acidity, vitamin C deficiency, premature aging, eye weakness.', how: '20–30ml fresh amla juice in morning on empty stomach. Or 1–2 dried amla chewed.', dosage: '1–3g amla powder or 20–30ml fresh juice daily. Vitamin C content: ~600mg per 100g.', warn: "Avoid at night. Don't take with antacids. Very high doses may disturb digestion.", sci: 'Vitamin C content is extremely heat-stable — survives cooking and drying. Richest natural Vitamin C source globally. Multiple human trials confirm lipid-lowering and blood sugar moderating effects.', tags: ['Immunity', 'Hair', 'Vitamin C', 'Anti-aging', 'Digestion'] },
  { name: 'नीम', ro: 'Neem', en: 'Indian Lilac', lat: 'Azadirachta indica', rasa: 'Bitter', guna: 'Light, Dry', effect: 'Reduces Pitta and Kapha', dosha: 'Reduces Pitta & Kapha', when: 'Skin problems (acne, eczema, fungal), blood purification, elevated blood sugar, dental infections, intestinal worms.', how: '4–5 fresh neem leaves chewed on empty stomach in morning. Neem-infused water for skin wash. Neem twig as natural toothbrush.', dosage: '500mg dried leaf extract capsule daily OR 4–5 fresh leaves. For skin: neem oil diluted to 1–2% in carrier oil.', warn: 'Never give to children under 2 years. Avoid if trying to conceive. Do not take during pregnancy.', sci: 'Nimbidin and nimbin — proven antibacterial against 14 bacterial strains including MRSA. Multiple clinical trials confirm anti-glycaemic effects.', tags: ['Skin', 'Blood', 'Blood Sugar', 'Antibacterial', 'Dental'] },
  { name: 'शतावरी', ro: 'Shatavari', en: 'Asparagus Root', lat: 'Asparagus racemosus', rasa: 'Sweet, Bitter', guna: 'Heavy, Oily, Cold', effect: 'Vata-Pitta balancing', dosha: 'Reduces Vata & Pitta', when: 'Hormonal imbalance (women), PCOD/PCOS support, low milk production, menopause symptoms, dryness, low energy.', how: '1 tsp Shatavari powder in warm full-fat milk with honey — morning or before bed.', dosage: '500mg–2g powder daily in milk or water. Take consistently for 2–3 months for hormonal effects.', warn: 'Avoid with diuretics. May cause bloating initially. Not for men in very high doses without guidance.', sci: 'Steroidal saponins (shatavarin I–IV) demonstrate phytoestrogen activity. Human studies show significant increase in prolactin and milk volume in lactating women.', tags: ["Women's Health", 'Hormones', 'Lactation', 'Energy', 'PCOD'] },
  { name: 'गुग्गुल', ro: 'Guggul', en: 'Indian Bdellium / Commiphora resin', lat: 'Commiphora wightii', rasa: 'Bitter, Pungent, Astringent', guna: 'Light, Dry', effect: 'Reduces Kapha and Vata', dosha: 'Reduces Kapha & Vata', when: 'High cholesterol (LDL), joint pain, obesity, arthritis, hypothyroidism support.', how: 'Tablet or capsule form — always purified (shuddha) guggul only. With warm water after meals.', dosage: '500mg–1g purified guggul extract twice daily with meals. Always use pharmaceutical-grade purified resin.', warn: 'Avoid in pregnancy. May interact with thyroid medication and blood thinners. Do not use raw/unpurified guggul.', sci: 'Guggulsterone blocks FXR (farnesoid X receptor) — exact same molecular target as modern cholesterol drugs. Multiple human RCTs confirm significant LDL reduction (15–30%).', tags: ['Cholesterol', 'Joints', 'Weight', 'Thyroid', 'Arthritis'] },
  { name: 'यष्टिमधु', ro: 'Yashtimadhu', en: 'Licorice Root', lat: 'Glycyrrhiza glabra', rasa: 'Sweet', guna: 'Heavy, Oily', effect: 'Vata-Pitta balancing', dosha: 'Reduces Vata & Pitta', when: 'Sore throat, cough, acid reflux, stomach ulcers, adrenal fatigue, hyperpigmentation, hoarseness of voice.', how: '½ tsp powder in honey for throat. In milk for gastric issues. As herbal tea for respiratory.', dosage: '1–3g root powder OR 200–600mg extract daily. Do not use continuously for more than 4–6 weeks without a 2-week break.', warn: 'High doses significantly raise blood pressure — avoid entirely in hypertension. Avoid in kidney disease and during pregnancy.', sci: 'Glycyrrhizin is anti-viral against herpes simplex, hepatitis C, and SARS-CoV-1. Glabridin inhibits H. pylori — primary cause of stomach ulcers.', tags: ['Throat', 'Acidity', 'Ulcer', 'Skin', 'Cough'] },
  { name: 'गिलोय', ro: 'Giloy', en: 'Heart-Leaved Moonseed / Guduchi', lat: 'Tinospora cordifolia', rasa: 'Bitter, Astringent', guna: 'Heavy, Oily', effect: 'Tridoshic', dosha: 'Balances all 3 doshas', when: 'Fever (dengue, chikungunya, malaria), low immunity, diabetes support, liver disease, post-COVID recovery.', how: '30ml fresh Giloy stem juice daily. OR 1–2 inch fresh stem boiled in 2 cups water, reduce to 1 cup. Capsule form (500mg) twice daily.', dosage: '300–500mg extract twice daily OR 30ml fresh stem juice. For acute fever: fresh juice is most potent.', warn: 'May lower blood sugar significantly — monitor if on diabetes medication. Avoid during pregnancy.', sci: "Proven immunomodulator: increases macrophage phagocytic activity by 40–60%. Used in AYUSH Ministry's COVID recovery protocol. 300+ peer-reviewed papers.", tags: ['Fever', 'Immunity', 'Diabetes', 'Liver', 'Dengue'] },
  { name: 'शंखपुष्पी', ro: 'Shankhpushpi', en: 'Bindweed / Morning Glory', lat: 'Convolvulus pluricaulis', rasa: 'Bitter, Astringent, Sweet', guna: 'Oily, Slimy', effect: 'Reduces Vata and Pitta', dosha: 'Reduces Vata & Pitta', when: "Anxiety, insomnia, poor memory, mental exhaustion, stress-related headaches, children's learning support.", how: 'Shankhpushpi syrup: 1–2 tsp twice daily. Or ½ tsp powder in warm milk at bedtime. Best taken at night.', dosage: '250–500mg extract OR 1–2 tsp syrup twice daily. Children: half adult dose with milk.', warn: 'Avoid with phenytoin (anti-epileptic drug) — reduces its effectiveness. May potentiate sedatives. Avoid while driving.', sci: 'Scopoletin and convolvine modulate GABA-A receptors via a gentler, non-habit-forming mechanism. Mild natural SSRI-like activity.', tags: ['Anxiety', 'Sleep', 'Memory', 'Brain', 'Mental Health'] },
];

const ARTHA = [
  { num: 1, sk: 'विनयाधिकरण', ti: 'Vinayādhikaraṇa', topic: 'Training of the King', desc: "The foundation of everything. A ruler who cannot discipline himself cannot discipline a kingdom. Covers the king's daily routine, education from birth, control of the six senses, and the dangers of acting from desire or anger.", sutra: '"In the happiness of his subjects lies the king\'s happiness; in their welfare, his welfare."', mod: 'Modern leadership psychology: self-regulation and emotional intelligence are the single strongest predictors of leadership effectiveness across all cultures and industries.' },
  { num: 2, sk: 'अध्यक्षप्रचारणम्', ti: 'Adhyaksha Pracharanam', topic: 'Activities of Government Departments', desc: "A complete operating manual for a functioning state — finance ministry, treasury management, agriculture, mining, trade regulation, and auditing. The world's first civil service manual.", sutra: '"Government servants shall be paid adequately so they do not steal from the treasury. Underpaid officials are the root of all administrative corruption."', mod: 'Modern public administration independently arrived at the same principle: adequate compensation reduces institutional corruption far more effectively than punishment.' },
  { num: 3, sk: 'धर्मस्थीय', ti: 'Dharmasthiya', topic: 'Law & Civil Courts', desc: "Civil law covering contracts, property rights, marriage, inheritance, debt, and commercial disputes. Includes rules on evidence standards, burden of proof, and explicit protections for women's property rights — centuries before Roman law.", sutra: '"A contract made by fraud, coercion, or intoxication is void from the beginning. No obligation arises from an agreement extracted under duress."', mod: 'This principle — vitiated consent invalidates contract — is a cornerstone of every modern legal system.' },
  { num: 4, sk: 'कण्टकशोधन', ti: 'Kantaka Shodhana', topic: 'Removal of Thorns (Criminal Law)', desc: 'Criminal law, police operations, and intelligence methodology. Covers identification and neutralisation of criminal networks, undercover operations, entrapment law, prison administration, and investigation of financial crimes.', sutra: '"The king should identify enemies not by what they say but by what they consistently do. Speeches reveal intentions; actions reveal character."', mod: 'Modern counterintelligence doctrine operates on the same principle. Behavioral analysis over verbal analysis is the foundational rule of criminal profiling.' },
  { num: 5, sk: 'योगवृत्तम्', ti: 'Yoga Vrittam', topic: 'Secret & Covert Operations', desc: "The world's first systematic intelligence manual. Covers spy networks (four grades of agents), double agents, secret writing, coded communication, assassination, and psychological warfare.", sutra: '"A king\'s eye is his spy network. Without eyes, a king is blind — and a blind king is already half-defeated."', mod: "Sun Tzu covered similar ground, but the Arthashastra is more systematically organised. The CIA's intelligence community structure mirrors Chanakya's agent classification remarkably closely." },
  { num: 6, sk: 'मण्डलयोग', ti: 'Mandala Yoga', topic: 'Circle of States (Foreign Policy)', desc: 'The "Mandala" doctrine. Your immediate neighbour is your natural enemy. Your neighbour\'s neighbour is your natural ally. This creates a circular pattern of alliances mapped with mathematical precision.', sutra: '"The enemy of my enemy is my friend. The friend of my enemy is also my enemy. These are the natural laws of statecraft."', mod: "Balance-of-power theory in modern international relations (Morgenthau, Kissinger) is a direct re-articulation of the Mandala doctrine. NATO's structure follows Mandala logic precisely." },
  { num: 7, sk: 'षाड्गुण्य', ti: 'Shadgunya', topic: 'Six Foreign Policies', desc: 'Six diplomatic instruments: Sandhi (peace), Vigraha (war), Asana (neutrality), Yana (preparation), Samshraya (alliance), Dvaidhibhava (playing two sides). A wise king uses all six based on the current balance of power.', sutra: '"There is no permanent friend or permanent enemy in statecraft — only permanent interests. The wise king shifts policy as the wind shifts."', mod: "Henry Kissinger's realpolitik doctrine is a near-word-for-word restatement of Shadgunya." },
  { num: 8, sk: 'व्यसनाधिकरण', ti: 'Vyasanādhikaraṇa', topic: 'How Kings Destroy Themselves', desc: "How rulers self-destruct through seven vices: gambling, women, wine, hunting, harsh speech, excessive punishment, and wasteful spending. A king's vices are not private matters — they corrupt the entire state apparatus.", sutra: '"A king who is enslaved to his own pleasures will be exploited without mercy — by his ministers, his wives, and his enemies."', mod: 'Leadership failure research: the #1 predictor of a company collapse is leadership hubris combined with self-indulgence. Enron, Theranos, WeWork each follow this anatomy.' },
  { num: 9, sk: 'अभियासिक', ti: 'Abhiyāsika', topic: 'Preparing for Invasion', desc: 'Everything that happens before a single soldier crosses the border: intelligence gathering, economic strangulation, subversion of enemy alliances, recruitment of disaffected ministers, spreading disinformation.', sutra: '"A war that can be won by superior diplomacy should never be won by superior arms. Arms are expensive; intelligence is cheap."', mod: "CIA Cold War doctrine of 'rollback' and 'containment,' hybrid warfare strategy, and modern economic sanctions regimes all follow the sequential logic Chanakya documented here." },
  { num: 10, sk: 'युद्धविषयः', ti: 'Yuddha Vishayah', topic: 'Open Warfare', desc: 'Conventional military doctrine — battle formations, troop compositions, terrain selection, timing of attack, coordinated use of elephants, cavalry, and infantry. Chanakya develops "combined arms doctrine."', sutra: '"Fight only when the probability of victory clearly exceeds the cost of fighting. Any war where this calculation is unclear should be delayed."', mod: 'Cost-benefit analysis in modern military strategy — doctrine of proportionality and decisive force theory — is the formalised version of exactly this calculation.' },
  { num: 11, sk: 'संघवृत्तम्', ti: 'Sangha Vrittam', topic: 'Dealing with Republics and Oligarchies', desc: 'How to interact with republics, confederacies, and guild-states — fundamentally different from dealing with monarchies. Chanakya recognises that collective decision-making entities require different strategies.', sutra: '"United, they resist everything. Divided, they can each be handled separately. The strategy against any group is always: first, find the internal crack."', mod: "Coalition management theory in international relations directly mirrors Chanakya's principles for dealing with confederacies." },
  { num: 12, sk: 'अबलविजयी', ti: 'Abala Vijayi', topic: 'Defeating a Stronger Enemy', desc: 'The strategic doctrine for the underdog — how to defeat an enemy you cannot defeat directly. Methods: funding internal rebellions, seducing key ministers, strangling supply routes, spreading disinformation.', sutra: '"Never fight a stronger enemy with equal strength. Fight them at their weakest moment, through their internal divisions, and with weapons they cannot see."', mod: 'Asymmetric warfare doctrine, guerrilla strategy (Mao, Guevara, Ho Chi Minh), and modern hybrid warfare are all extensions of the principles in Book 12.' },
  { num: 13, sk: 'दुर्गलाभोपाय', ti: 'Durga Labhopaya', topic: 'Capture and Building of Forts', desc: 'Siege warfare and fortification doctrine. How to capture a fortified city: cut off water, subvert the garrison through bribery, create internal panic through spies, then assault at maximum weakness.', sutra: '"A fort is worthless without a garrison whose loyalty is to the king, not to their salary. A garrison that fights for money will surrender for money."', mod: 'Urban warfare doctrine, siege strategy, and modern city resilience planning all draw on fortification principles documented in texts like Book 13.' },
  { num: 14, sk: 'औपनिषदिक', ti: 'Aupanishadika', topic: 'Psychological & Mystical Warfare', desc: 'Morale operations, psychological warfare, use of religious belief and omens to shape enemy behaviour. Chanakya is coldly analytical about using superstition as a weapon.', sutra: '"What cannot be achieved through force can often be achieved through the manipulation of belief. Fear of the invisible is more powerful than fear of any visible army."', mod: 'Psychological Operations (PsyOps) and information warfare in modern militaries. The US MISO doctrine draws directly on principles Chanakya systematised first.' },
  { num: 15, sk: 'तन्त्रसंग्रह', ti: 'Tantrasamgraha', topic: 'Methodology of the Arthashastra', desc: "Chanakya's meta-analysis of his own work — the logic behind how he organised the Arthashastra, his sources, and his approach to resolving contradictions between earlier authorities.", sutra: '"This science has been composed by collecting and distilling as many prior sciences on statecraft as could be found. Where they disagreed, I have chosen the most practically effective position."', mod: "Systems thinking and meta-analysis methodology: the Arthashastra is a 2300-year-old example of what we now call a 'systematic review.'" },
];

const DATASETS = { gita: GITA, pancha: PANCHA, ayur: AYUR, artha: ARTHA };

/* ══════════════════════════════════════
   MODULE STATE
══════════════════════════════════════ */
let _c = null;   // container element (#screen-learn)
let _onBack = null;   // callback for ← Back
let curTopic = 'gita';
let curIdx = 0;
let curData = [];

/* ══════════════════════════════════════
   HTML SKELETON
══════════════════════════════════════ */
function buildSkeleton() {
  _c.innerHTML = `
    <div id="l-cards">
      <div class="l-site-header">
        <button class="l-hdr-btn" id="l-back">← Back</button>
        <span class="l-site-title">Ancient Knowledge</span>
      </div>
      <div class="l-tabs">
        <button class="l-tab active" data-t="gita">🪷 Bhagavad Gita</button>
        <button class="l-tab" data-t="panchatantra">🐘 Panchatantra</button>
        <button class="l-tab" data-t="ayurveda">🌿 Ayurveda</button>
        <button class="l-tab" data-t="arthashastra">⚖️ Arthashastra</button>
      </div>

      <div class="l-panel active" id="l-p-gita">
        <div class="l-topic-hdr">
          <div class="l-eyebrow">Sacred Scripture</div>
          <div class="l-tname">Bhagavad Gita</div>
          <div class="l-tmeta">
            <span class="l-tpill">✍️ Vyasa (Krishna–Arjuna dialogue)</span>
            <span class="l-tpill">📅 ~500 BCE – 200 BCE</span>
            <span class="l-tpill">📖 18 Chapters · 700 Shlokas</span>
            <span class="l-tpill">🌐 Part of Mahabharata</span>
          </div>
          <div class="l-tdesc">A 700-verse dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra. Each of the 18 chapters focuses on a different path to liberation — duty, action, devotion, or knowledge.</div>
        </div>
        <span class="l-sec-lbl">All 18 Chapters — click Read More for full shloka + lesson</span>
        <div class="l-grid" id="l-gita-grid"></div>
      </div>

      <div class="l-panel" id="l-p-panchatantra">
        <div class="l-topic-hdr">
          <div class="l-eyebrow">Ancient Fables</div>
          <div class="l-tname">Panchatantra</div>
          <div class="l-tmeta">
            <span class="l-tpill">✍️ Vishnu Sharma</span>
            <span class="l-tpill">📅 ~300 BCE</span>
            <span class="l-tpill">📖 5 Books · 84 Stories</span>
            <span class="l-tpill">🌐 Translated into 50+ languages</span>
          </div>
          <div class="l-tdesc">Pancha = Five, Tantra = Treatise. Five books of animal fables teaching political wisdom and practical life skills.</div>
        </div>
        <div class="l-info-bar"><div class="l-info-inner"><strong>How to read:</strong> Each book has a frame story with smaller stories nested inside. Click any card to read all the stories inside.</div></div>
        <span class="l-sec-lbl">5 Books (Tantras) — click Read Stories for full content</span>
        <div class="l-grid" id="l-pancha-grid"></div>
      </div>

      <div class="l-panel" id="l-p-ayurveda">
        <div class="l-topic-hdr">
          <div class="l-eyebrow">Ancient Medicine</div>
          <div class="l-tname">Ayurveda</div>
          <div class="l-tmeta">
            <span class="l-tpill">✍️ Charaka, Sushruta, Vagbhata</span>
            <span class="l-tpill">📅 ~1500 BCE</span>
            <span class="l-tpill">📖 आयुर्वेद — Science of Life</span>
            <span class="l-tpill">🌐 WHO-recognized</span>
          </div>
          <div class="l-tdesc">Ayu (life) + Veda (knowledge). Built on balancing Vata, Pitta, and Kapha. Click any herb to see when to use it, how to prepare it, dosage, cautions, and the modern science behind it.</div>
        </div>
        <span class="l-sec-lbl">12 Key Herbs — click Full Guide for complete information</span>
        <div class="l-grid" id="l-ayur-grid"></div>
        <div style="text-align:center; padding: 20px 20px 60px 20px; max-width: 940px; margin: 0 auto;">
           <button id="btn-ayurveda-solve" class="l-nav-btn" style="background:var(--gold-dim);color:#0D0B08;font-weight:bold;font-size:15px;padding:12px 24px;">Solve my problem - Ayurvedic Style →</button>
        </div>
      </div>

      <div class="l-panel" id="l-p-arthashastra">
        <div class="l-topic-hdr">
          <div class="l-eyebrow">Political Science</div>
          <div class="l-tname">Arthashastra</div>
          <div class="l-tmeta">
            <span class="l-tpill">✍️ Chanakya (Kautilya)</span>
            <span class="l-tpill">📅 ~300 BCE</span>
            <span class="l-tpill">📖 15 Books · 6000 Sutras</span>
            <span class="l-tpill">🌐 Rediscovered 1905 CE</span>
          </div>
          <div class="l-tdesc">Chanakya's masterwork on statecraft, economy, military strategy and governance. Lost for 1000 years, rediscovered in 1905.</div>
        </div>
        <span class="l-sec-lbl">15 Books (Adhikaranas) — click Read Sutra for Chanakya's exact words</span>
        <div class="l-grid" id="l-artha-grid"></div>
      </div>
    </div>

    <div id="l-detail">
      <div class="l-det-hdr">
        <button class="l-close-btn" id="l-close">✕ &nbsp;Close</button>
        <span class="l-det-name" id="l-dh-name"></span>
        <span class="l-det-sub"  id="l-dh-sub"></span>
      </div>
      <div class="l-det-body" id="l-det-body"></div>
    </div>
  `;
}

/* ══════════════════════════════════════
   CARD BUILDERS
══════════════════════════════════════ */
function buildCards() {
  document.getElementById('l-gita-grid').innerHTML = GITA.map((c, i) => `
    <div class="l-card" style="animation-delay:${i * 0.04}s">
      <div class="lc-ey">Chapter ${c.num} of 18</div>
      <div class="lc-sk">${c.sk}</div>
      <div class="lc-ro">${c.ro}</div>
      <div class="lc-hr"></div>
      <div class="lc-ti">${c.en}</div>
      <div class="lc-pr">${c.preview}</div>
      <div class="lc-tags">${c.tags.map(t => `<span class="lc-tag">${t}</span>`).join('')}</div>
      <button class="l-rm-btn" data-topic="gita" data-idx="${i}">Read More →</button>
    </div>`).join('');

  document.getElementById('l-pancha-grid').innerHTML = PANCHA.map((b, i) => `
    <div class="l-card" style="animation-delay:${i * 0.08}s">
      <div class="lc-ey">Book ${b.num} of 5</div>
      <div class="lc-sk">${b.title}</div>
      <div class="lc-ro">${b.ro}</div>
      <div class="lc-hr"></div>
      <div class="lc-ti">${b.en}</div>
      <div class="lc-pr">${b.desc}</div>
      <button class="l-rm-btn" data-topic="pancha" data-idx="${i}">Read Stories →</button>
    </div>`).join('');

  document.getElementById('l-ayur-grid').innerHTML = AYUR.map((h, i) => `
    <div class="l-card gc" style="animation-delay:${i * 0.04}s">
      <div class="lc-ey g">${h.lat}</div>
      <div class="lc-sk">${h.name}</div>
      <div class="lc-ro">${h.ro}</div>
      <div class="lc-hr"></div>
      <div class="lc-ti">${h.en}</div>
      <div style="font-size:11px;color:var(--text-dim);margin-top:3px">
        <span style="color:var(--green)">Taste:</span> ${h.rasa.split(',')[0]}
        &nbsp;·&nbsp;
        <span style="color:var(--green)">Effect:</span> ${h.dosha}
      </div>
      <div class="lc-tags">${h.tags.slice(0, 3).map(t => `<span class="lc-tag g">${t}</span>`).join('')}</div>
      <button class="l-rm-btn g" data-topic="ayur" data-idx="${i}">Full Guide →</button>
    </div>`).join('');

  document.getElementById('l-artha-grid').innerHTML = ARTHA.map((b, i) => `
    <div class="l-card oc" style="animation-delay:${i * 0.04}s">
      <div class="lc-ey o">Book ${b.num} of 15</div>
      <div class="lc-sk">${b.sk}</div>
      <div class="lc-ro">${b.ti}</div>
      <div class="lc-hr"></div>
      <div class="lc-ti">${b.topic}</div>
      <div class="lc-pr">${b.desc.substring(0, 110)}…</div>
      <button class="l-rm-btn o" data-topic="artha" data-idx="${i}">Read Sutra →</button>
    </div>`).join('');
}

/* ══════════════════════════════════════
   DETAIL
══════════════════════════════════════ */
function openDetail(topic, idx) {
  curTopic = topic;
  curData = DATASETS[topic];
  curIdx = idx;
  renderDetail();
  document.getElementById('l-cards').style.display = 'none';
  document.getElementById('l-detail').style.display = 'block';
  _c.scrollTop = 0;
}

function closeDetail() {
  document.getElementById('l-detail').style.display = 'none';
  document.getElementById('l-cards').style.display = 'block';
  _c.scrollTop = 0;
}

function navigate(dir) {
  curIdx += dir;
  renderDetail();
  _c.scrollTop = 0;
}

function renderDetail() {
  const item = curData[curIdx];
  const total = curData.length;
  const t = curTopic;

  document.getElementById('l-dh-name').textContent =
    item.sk || item.name || item.title || '';
  document.getElementById('l-dh-sub').textContent =
    t === 'gita' ? `Chapter ${item.num} of 18` :
      t === 'pancha' ? `Book ${item.num} of 5` :
        t === 'ayur' ? item.lat :
          `Book ${item.num} of 15`;

  let h = '';

  if (t === 'gita') {
    h = `
      <div style="margin-bottom:28px">
        <div class="ld-eyebrow">Chapter ${item.num} of 18 · Bhagavad Gita</div>
        <div class="ld-sk">${item.sk}</div>
        <div class="ld-ro">${item.ro}</div>
        <div class="ld-title">${item.en}</div>
        <div class="ld-tags">${item.tags.map(x => `<span class="ld-tag">${x}</span>`).join('')}</div>
      </div>
      <div class="l-gold-hr"></div>
      <div class="ld-sec">
        <div class="ld-lbl">Key Shloka (Sanskrit)</div>
        <div class="l-shloka-box">
          <div class="l-sk-text">${item.shloka.replace(/\n/g, '<br>')}</div>
          <div class="l-sk-trans">${item.trans}</div>
        </div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Core Lesson</div>
        <div class="l-lesson-box">${item.lesson}</div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Modern Connection</div>
        <div class="ld-text">${item.modern}</div>
      </div>`;
  }

  else if (t === 'pancha') {
    h = `
      <div style="margin-bottom:28px">
        <div class="ld-eyebrow">Book ${item.num} of 5 · Panchatantra</div>
        <div class="ld-sk">${item.title}</div>
        <div class="ld-ro">${item.ro}</div>
        <div class="ld-title">${item.en}</div>
      </div>
      <div class="l-gold-hr"></div>
      <div class="ld-sec">
        <div class="ld-lbl">About This Book</div>
        <div class="ld-text">${item.desc}</div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Core Moral</div>
        <div class="l-lesson-box">"${item.moral}"</div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Stories Inside This Book</div>
        ${item.stories.map(s => `
          <div class="l-story">
            <div class="l-story-t">📖 ${s.t}</div>
            <div class="l-story-s">${s.s}</div>
            <div class="l-story-l">💡 Lesson: ${s.l}</div>
          </div>`).join('')}
      </div>`;
  }

  else if (t === 'ayur') {
    h = `
      <div style="margin-bottom:28px">
        <div class="ld-eyebrow">Ayurveda · ${item.lat}</div>
        <div class="ld-sk">${item.name}</div>
        <div class="ld-ro">${item.ro}</div>
        <div class="ld-title">${item.en}</div>
        <div class="ld-meta">
          <span class="ld-pill g">Taste: ${item.rasa}</span>
          <span class="ld-pill g">Quality: ${item.guna}</span>
          <span class="ld-pill g">Dosha: ${item.dosha}</span>
        </div>
        <div class="ld-tags">${item.tags.map(x => `<span class="ld-tag g">${x}</span>`).join('')}</div>
      </div>
      <div class="l-gold-hr"></div>
      <div class="ld-sec">
        <div class="ld-lbl">When to Use</div>
        <div class="ld-text">${item.when}</div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">How to Use</div>
        <div class="l-shloka-box g">
          <div class="l-sk-text" style="font-family:'Lato',sans-serif;font-size:16px">${item.how}</div>
        </div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Dosage</div>
        <div class="l-ayur-row">
          <div class="l-ayur-blk">
            <div class="l-ayur-lbl">Recommended dose</div>
            <div class="l-ayur-val">${item.dosage}</div>
          </div>
          <div class="l-ayur-blk">
            <div class="l-ayur-lbl">Effect on doshas</div>
            <div class="l-ayur-val">${item.effect}</div>
          </div>
        </div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">⚠️ Caution & Contraindications</div>
        <div class="l-warn">${item.warn}</div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Modern Science</div>
        <div class="ld-text">${item.sci}</div>
      </div>
      ${curIdx === 0 ? `
      <div class="ld-sec" style="margin-top: 30px; text-align: center; border-top: 1px solid var(--gold-border); padding-top: 20px;">
        <button id="l-solve-problem-btn" class="l-solve-btn">🌿 Solve My Problem</button>
      </div>` : ''}`;
  }

  else if (t === 'artha') {
    h = `
      <div style="margin-bottom:28px">
        <div class="ld-eyebrow">Book ${item.num} of 15 · Arthashastra</div>
        <div class="ld-sk">${item.sk}</div>
        <div class="ld-ro">${item.ti}</div>
        <div class="ld-title">${item.topic}</div>
      </div>
      <div class="l-gold-hr"></div>
      <div class="ld-sec">
        <div class="ld-lbl">What This Book Covers</div>
        <div class="ld-text">${item.desc}</div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Chanakya's Sutra</div>
        <div class="l-shloka-box o">
          <div class="l-sk-text" style="font-family:'Lato',sans-serif;font-size:17px">${item.sutra}</div>
        </div>
      </div>
      <div class="ld-sec">
        <div class="ld-lbl">Modern Parallel</div>
        <div class="ld-text">${item.mod}</div>
      </div>`;
  }

  h += `
    <div class="l-det-nav">
      <button class="l-nav-btn" id="l-prev" ${curIdx === 0 ? 'disabled' : ''}>← Previous</button>
      <span class="l-nav-ctr">${curIdx + 1} / ${total}</span>
      <button class="l-nav-btn" id="l-next" ${curIdx === total - 1 ? 'disabled' : ''}>Next →</button>
    </div>`;

  document.getElementById('l-det-body').innerHTML = h;

  const prev = document.getElementById('l-prev');
  const next = document.getElementById('l-next');
  if (prev) prev.addEventListener('click', () => navigate(-1));
  if (next) next.addEventListener('click', () => navigate(1));

  const solveBtn = document.getElementById('l-solve-problem-btn');
  if (solveBtn) {
    solveBtn.addEventListener('click', () => {
      actions.setSolveMode('ayurveda');
      actions.selectPersona('guru');
    });
  }
}

/* ══════════════════════════════════════
   TAB SWITCHER
══════════════════════════════════════ */
function showTopic(topicKey) {
  _c.querySelectorAll('.l-panel').forEach(p => p.classList.remove('active'));
  _c.querySelectorAll('.l-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`l-p-${topicKey}`).classList.add('active');
  _c.querySelector(`.l-tab[data-t="${topicKey}"]`).classList.add('active');
  _c.scrollTop = 0;
}

/* ══════════════════════════════════════
   EVENT DELEGATION
══════════════════════════════════════ */
function attachEvents() {
  _c.addEventListener('click', e => {
    const el = e.target;

    // Tab switch
    if (el.classList.contains('l-tab')) {
      showTopic(el.dataset.t);
      return;
    }
    // Read More / Full Guide / Read Sutra
    if (el.classList.contains('l-rm-btn')) {
      openDetail(el.dataset.topic, parseInt(el.dataset.idx));
      return;
    }
    // Back button
    if (el.id === 'l-back') {
      if (typeof _onBack === 'function') _onBack();
      return;
    }
    // Close detail
    if (el.id === 'l-close') {
      closeDetail();
      return;
    }
    // Solve Ayurvedic — go directly to AyurvedaChat, skip persona select
    if (el.id === 'btn-ayurveda-solve') {
      actions.setSolveMode('ayurveda');
      actions.selectPersona('guru');
      return;
    }
  });
}

/* ══════════════════════════════════════
   PUBLIC EXPORT
══════════════════════════════════════ */

/**
 * renderLearn(container, onBack)
 *
 * @param {HTMLElement} container  — the #screen-learn div
 * @param {Function}    onBack     — called when user clicks ← Back
 *
 * Call this inside your render() switch for case 'learn':
 *
 *   import { renderLearn } from './src/components/Learn.js';
 *   renderLearn(document.getElementById('screen-learn'), () => actions.goTo('landing'));
 */
export function renderLearn(container, onBack) {
  _c = container;
  _onBack = onBack;

  injectLearnStyles();

  // Build DOM only once
  if (!_c.querySelector('#l-cards')) {
    buildSkeleton();
    buildCards();
    attachEvents();
  }

  // Always reset to cards view when screen becomes active
  const det = document.getElementById('l-detail');
  const cards = document.getElementById('l-cards');
  if (det) det.style.display = 'none';
  if (cards) cards.style.display = 'block';
  _c.scrollTop = 0;
}