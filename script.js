// script.js
// Pure vanilla JS app for cursive training PT-BR

// Globals from wordList.js: WORDS (array)
const ROUND_SIZE = 10;
let roundWords = [];
let currentIndex = 0;
let score = 0;
let history = []; // {word, answer, answerNorm, correct, acceptedByTolerance, strokes}
let strokesCurrent = []; // array of strokes, each stroke = [{x,y,t}, ...]

// UI elements
const wordDisplay = document.getElementById('wordDisplay');
const qCount = document.getElementById('qCount');
const scoreEl = document.getElementById('score');
const scoreShort = document.getElementById('scoreShort');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const historyList = document.getElementById('historyList');
const hintsDiv = document.getElementById('hints');
const feedbackEl = document.getElementById('feedback');
const answerInput = document.getElementById('answerInput');
const answerForm = document.getElementById('answerForm');
const clearBtn = document.getElementById('clearBtn');
const exportImgBtn = document.getElementById('exportImgBtn');
const downloadHistoryBtn = document.getElementById('downloadHistoryBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const playAgainEndBtn = document.getElementById('playAgainEndBtn');
const overlay = document.getElementById('overlay');
const previews = document.getElementById('previews');
const finalScore = document.getElementById('finalScore');
const finalMessage = document.getElementById('finalMessage');

const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const FIREWORKS_CANVAS = document.getElementById('fireworks');
const fwCtx = FIREWORKS_CANVAS.getContext('2d');

// helpers
function normalizeText(s){
  if (typeof s !== 'string') return '';
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}

// Levenshtein distance
function levenshtein(a,b){
  a = a||''; b = b||'';
  if (a===b) return 0;
  const m = a.length, n = b.length;
  if (m===0) return n;
  if (n===0) return m;
  const dp = Array.from({length:m+1}, ()=> new Array(n+1));
  for (let i=0;i<=m;i++) dp[i][0] = i;
  for (let j=0;j<=n;j++) dp[0][j] = j;
  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      const cost = a[i-1]===b[j-1]?0:1;
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[m][n];
}

// shuffle array
function shuffle(arr){
  for (let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// init round
function initRound(){
  const copy = WORDS.slice();
  shuffle(copy);
  roundWords = copy.slice(0, ROUND_SIZE);
  currentIndex = 0;
  score = 0;
  history = [];
  strokesCurrent = [];
  updateUI();
  loadCurrent();
}

// update UI counters
function updateUI(){
  qCount.textContent = `${Math.min(currentIndex+1, ROUND_SIZE)}/${ROUND_SIZE}`;
  scoreEl.textContent = `${score}/${ROUND_SIZE}`;
  scoreShort.textContent = String(score);
  progressText.textContent = `Questão ${Math.min(currentIndex+1, ROUND_SIZE)} de ${ROUND_SIZE}`;
  progressFill.style.width = `${(currentIndex/ROUND_SIZE)*100}%`;
  // history pills
  historyList.innerHTML = '';
  history.forEach(h=>{
    const d = document.createElement('div');
    d.className = 'pill ' + (h.correct ? 'correct' : 'incorrect');
    d.textContent = h.word;
    historyList.appendChild(d);
  });
}

// load current word
function loadCurrent(){
  const word = roundWords[currentIndex];
  wordDisplay.innerHTML = '';
  const wEl = document.createElement('div');
  wEl.className = 'cursive';
  wEl.textContent = word;
  wordDisplay.appendChild(wEl);

  // prepare hints
  hintsDiv.innerHTML = '';
  const letters = word.split('').slice(0,9);
  letters.forEach(ch=>{
    const hint = window.createLetterHint(ch);
    hintsDiv.appendChild(hint);
  });

  answerInput.value = '';
  feedbackEl.textContent = 'Trace a palavra e digite. Aceitamos acento ou pequenas variações.';
  clearCanvas();
  strokesCurrent = [];
}

// Canvas drawing logic (pointer)
let drawing = false;
let currentStroke = null;

// High DPI scaling
function scaleCanvas(){
  const ratio = window.devicePixelRatio || 1;
  FIREWORKS_CANVAS.width = innerWidth * ratio;
  FIREWORKS_CANVAS.height = innerHeight * ratio;
  FIREWORKS_CANVAS.style.width = innerWidth + 'px';
  FIREWORKS_CANVAS.style.height = innerHeight + 'px';
  FIREWORKS_CANVAS.getContext('2d').scale(ratio, ratio);

  const w = canvas.clientWidth || canvas.width;
  const h = canvas.clientHeight || canvas.height;
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#223149';
  redrawStrokes();
}
window.addEventListener('resize', scaleCanvas);

// coordinate helper
function getXY(e){
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;
  if (e.touches && e.touches[0]) {clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;}
  else {clientX = e.clientX; clientY = e.clientY;}
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function startStroke(e){
  e.preventDefault();
  drawing = true;
  const p = getXY(e);
  currentStroke = [{x:p.x, y:p.y, t: Date.now()}];
}
function moveStroke(e){
  if (!drawing) return;
  e.preventDefault();
  const p = getXY(e);
  currentStroke.push({x:p.x, y:p.y, t: Date.now()});
  redrawStrokes(); // redraw includes current
}
function endStroke(e){
  if (!drawing) return;
  drawing = false;
  if (currentStroke && currentStroke.length>0) strokesCurrent.push(currentStroke);
  currentStroke = null;
  redrawStrokes();
}

canvas.addEventListener('mousedown', startStroke);
window.addEventListener('mousemove', moveStroke);
window.addEventListener('mouseup', endStroke);
canvas.addEventListener('touchstart', startStroke, {passive:false});
window.addEventListener('touchmove', moveStroke, {passive:false});
window.addEventListener('touchend', endStroke);

function clearCanvas(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  strokesCurrent = [];
  currentStroke = null;
}

function redrawStrokes(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#223149';
  strokesCurrent.forEach(s => drawSmooth(s));
  if (currentStroke) drawSmooth(currentStroke);
}

// smoothing: quadratic curve interpolation
function drawSmooth(points){
  if (!points || points.length===0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i=1;i<points.length-1;i++){
    const xc = (points[i].x + points[i+1].x)/2;
    const yc = (points[i].y + points[i+1].y)/2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  const last = points[points.length-1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

// form submit / checking answer
answerForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  submitAnswer();
});

function submitAnswer(){
  const input = answerInput.value || '';
  const word = roundWords[currentIndex];
  const expectedNorm = normalizeText(word);
  const answerNorm = normalizeText(input);
  let correct = false;
  let acceptedByTolerance = false;

  if (answerNorm === expectedNorm) correct = true;
  else {
    const d = levenshtein(answerNorm, expectedNorm);
    const threshold = expectedNorm.length <= 4 ? 0 : (expectedNorm.length <=7 ? 1 : 2);
    if (d <= threshold) { correct = true; acceptedByTolerance = true; }
  }

  if (correct) score++;
  history.push({ word, expected: word, answer: input.trim(), answerNorm, correct, acceptedByTolerance, strokes: JSON.parse(JSON.stringify(strokesCurrent)) });
  currentIndex++;
  updateUI();

  // show feedback
  if (correct){
    feedbackEl.textContent = acceptedByTolerance ? 'Quase certo — aceito!' : 'Correto! ✔️';
    feedbackEl.style.color = 'var(--good)';
  } else {
    feedbackEl.textContent = `Errado — era "${word}" ✖️`;
    feedbackEl.style.color = 'var(--bad)';
  }

  // small delay then next
  setTimeout(()=>{
    if (currentIndex >= ROUND_SIZE){
      endRound();
    } else {
      loadCurrent();
    }
  }, 650);
}

// end of round
function endRound(){
  updateUI();
  // show overlay with previews
  finalScore.textContent = `Resultado: ${score}/${ROUND_SIZE}`;
  if (score < 5) finalMessage.textContent = 'Vamos tentar novamente?';
  else if (score < 10) finalMessage.textContent = 'Muito bem, quase 100%!';
  else finalMessage.textContent = 'PARABENS!!!!!!';

  // build previews with replay
  previews.innerHTML = '';
  history.forEach((h, idx)=>{
    const card = document.createElement('div');
    card.className = 'previewCard';
    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.color = h.correct ? 'var(--good)' : 'var(--bad)';
    title.textContent = `${idx+1}. ${h.word}`;
    card.appendChild(title);

    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 220; previewCanvas.height = 120;
    previewCanvas.style.borderRadius = '8px';
    previewCanvas.style.background = '#fff';
    card.appendChild(previewCanvas);

    const note = document.createElement('div');
    note.style.fontSize = '13px';
    note.style.color = 'var(--muted)';
    note.textContent = h.correct ? 'correto' : `esperado: ${h.expected}`;
    card.appendChild(note);

    previews.appendChild(card);

    // animate preview drawing
    replayOnCanvas(previewCanvas, h.strokes || []);
  });

  overlay.classList.remove('hidden');

  // fireworks for perfect score
  if (score === ROUND_SIZE) startFireworks();
}

// replay strokes on a small canvas (progressive)
function replayOnCanvas(cnv, strokes){
  const w = cnv.width, h = cnv.height;
  const ctxp = cnv.getContext('2d');
  ctxp.lineCap = 'round'; ctxp.lineJoin = 'round'; ctxp.lineWidth = 2.6; ctxp.strokeStyle = '#223149';
  ctxp.clearRect(0,0,w,h);
  if (!strokes || strokes.length===0) return;

  // bounds
  let minX=1e9,minY=1e9,maxX=0,maxY=0;
  strokes.forEach(s => s.forEach(p => { if (p.x<minX)minX=p.x; if(p.y<minY)minY=p.y; if(p.x>maxX)maxX=p.x; if(p.y>maxY)maxY=p.y; }));
  if (minX===1e9) return;
  const pad=8; const sw = Math.max(1,maxX-minX); const sh = Math.max(1,maxY-minY);
  const scale = Math.min((w-pad*2)/sw, (h-pad*2)/sh);
  const offsetX = (w - sw*scale)/2 - minX*scale;
  const offsetY = (h - sh*scale)/2 - minY*scale;

  let si=0, pi=1;
  function step(){
    ctxp.clearRect(0,0,w,h);
    // draw completed strokes
    for (let s=0; s<si; s++){
      const stroke = strokes[s];
      if (!stroke || stroke.length===0) continue;
      ctxp.beginPath();
      ctxp.moveTo(stroke[0].x*scale + offsetX, stroke[0].y*scale + offsetY);
      for (let k=1;k<stroke.length;k++) ctxp.lineTo(stroke[k].x*scale + offsetX, stroke[k].y*scale + offsetY);
      ctxp.stroke();
    }
    const curr = strokes[si];
    if (curr){
      ctxp.beginPath();
      ctxp.moveTo(curr[0].x*scale + offsetX, curr[0].y*scale + offsetY);
      for (let k=1;k<Math.min(pi,curr.length);k++) ctxp.lineTo(curr[k].x*scale + offsetX, curr[k].y*scale + offsetY);
      ctxp.stroke();
      pi++;
      if (pi > curr.length){ si++; pi=1; }
      requestAnimationFrame(step);
    }
  }
  step();
}

// export current drawing as image (open new tab)
exportImgBtn.addEventListener('click', ()=>{
  if (!strokesCurrent || strokesCurrent.length===0) return alert('Nada para exportar.');
  const tmp = document.createElement('canvas');
  tmp.width = 1200; tmp.height = 400;
  const tctx = tmp.getContext('2d');
  tctx.fillStyle = '#fff'; tctx.fillRect(0,0,tmp.width,tmp.height);
  tctx.lineWidth = 6; tctx.strokeStyle = '#222'; tctx.lineCap='round'; tctx.lineJoin='round';
  strokesCurrent.forEach(s => {
    tctx.beginPath(); tctx.moveTo(s[0].x, s[0].y);
    for (let i=1;i<s.length;i++) tctx.lineTo(s[i].x, s[i].y);
    tctx.stroke();
  });
  const data = tmp.toDataURL('image/png');
  const w = window.open();
  if (w) w.document.body.style.margin='0', w.document.body.innerHTML = `<img src="${data}" style="width:100%"/>`;
});

// download history JSON
downloadHistoryBtn.addEventListener('click', ()=>{
  if (!history || history.length===0) return alert('Sem histórico ainda.');
  const data = JSON.stringify(history, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `cursiva_history_${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
});

// clear
clearBtn.addEventListener('click', ()=>{
  clearCanvas();
});

// play again
playAgainBtn.addEventListener('click', ()=>{ initRound(); });
playAgainEndBtn.addEventListener('click', ()=>{ overlay.classList.add('hidden'); initRound(); stopFireworks(); });

// overlay close if clicked outside
overlay.addEventListener('click', (e)=>{
  if (e.target === overlay) overlay.classList.add('hidden');
});

// Fireworks animation (lightweight)
let fwRunning = false;
let fwParticles = [];
function startFireworks(){
  FIREWORKS_CANVAS.classList.remove('hidden');
  fwRunning = true;
  fwParticles = [];
  scaleCanvas();
  fwLoop();
}
function stopFireworks(){
  fwRunning = false;
  FIREWORKS_CANVAS.classList.add('hidden');
  fwParticles = [];
  fwCtx.clearRect(0,0,FIREWORKS_CANVAS.width,FIREWORKS_CANVAS.height);
}

function fwLoop(){
  if (!fwRunning) return;
  const w = FIREWORKS_CANVAS.width / (window.devicePixelRatio || 1);
  const h = FIREWORKS_CANVAS.height / (window.devicePixelRatio || 1);
  // occasionally launch
  if (Math.random() < 0.06) launchFw(Math.random()*(w-200)+100, Math.random()*(h*0.4)+50);
  // update
  fwCtx.fillStyle = 'rgba(8,12,20,0.14)';
  fwCtx.fillRect(0,0,w,h);
  for (let i=fwParticles.length-1;i>=0;i--){
    const p = fwParticles[i];
    p.age++; p.vy+=0.06; p.x+=p.vx; p.y+=p.vy;
    const alpha = Math.max(0,1 - p.age/p.life);
    fwCtx.globalAlpha = alpha;
    fwCtx.fillStyle = p.color;
    fwCtx.beginPath(); fwCtx.arc(p.x, p.y, p.size, 0, Math.PI*2); fwCtx.fill();
    if (p.age > p.life) fwParticles.splice(i,1);
  }
  fwCtx.globalAlpha = 1;
  requestAnimationFrame(fwLoop);
}
function launchFw(x,y){
  const hue = Math.floor(Math.random()*360);
  for (let i=0;i<90;i++){
    fwParticles.push({
      x,y,
      vx: Math.cos(i/90*Math.PI*2)*(Math.random()*7+1),
      vy: Math.sin(i/90*Math.PI*2)*(Math.random()*7+1),
      life: Math.random()*90+40,
      age:0,
      color: `hsl(${hue + (Math.random()*40-20)}, 90%, 60%)`,
      size: Math.random()*2.6+1.2
    });
  }
}

// initial setup
(function start(){
  // ensure canvas sizing
  scaleCanvas();

  initRound();

  // sanity: if resize changes canvas size after loading, redraw
  window.addEventListener('resize', ()=> {
    scaleCanvas();
    redrawStrokes();
  });
})();
