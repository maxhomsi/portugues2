// App.js
import { GameState, StrokeRecorder, normalizeText } from './data.js';

const { useState, useEffect, useRef } = React;
const manager = new GameState(10);

///////////////////////
// LetterHint improved: multi-step animated SVG strokes.
// Implementation approach:
// - Render the letter as SVG <text> in a path-like fashion by using stroke on text.
// - Add CSS animation on hover/click toggling stroke-dashoffset to simulate tracing.
// - Also show small numbered dots to imply stroke start points (stylized).
function LetterHint({ letter }) {
  const char = (letter || 'a').slice(0,1).toLowerCase();
  const id = `lt-${Math.random().toString(36).slice(2,8)}`;
  return React.createElement('div', { className: 'letterHint', role:'button', tabIndex:0, title: `Ver traçado: ${char}`, onClick: (e)=>{
    // animate by toggling a data attribute to restart CSS animation
    const el = e.currentTarget.querySelector('text.trace');
    if (!el) return;
    el.style.transition = 'none';
    el.style.strokeDashoffset = el.getTotalLength();
    // force reflow
    void el.getBoundingClientRect();
    el.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(.2,.9,.2,1)';
    el.style.strokeDashoffset = 0;
  } },
    React.createElement('svg', { viewBox: '0 0 64 64', width:56, height:56, xmlns:'http://www.w3.org/2000/svg' },
      React.createElement('defs', null,
        React.createElement('filter', { id: id+'-g', x:-0.2, y:-0.2, width:1.4, height:1.4 },
          React.createElement('feDropShadow', { dx:0, dy:1, stdDeviation:1.2, floodColor:'#000', floodOpacity:0.08 })
        )
      ),
      // background light shape
      React.createElement('text', {
        x:32, y:42, 'text-anchor':'middle',
        'font-family':'"Dancing Script", cursive', 'font-size':48,
        fill:'none', stroke:'rgba(170,170,170,0.28)', 'stroke-width':3, 'stroke-linecap':'round', 'stroke-linejoin':'round'
      }, char),
      // trace (animated)
      React.createElement('text', {
        className:'trace',
        x:32, y:42, 'text-anchor':'middle',
        'font-family':'"Dancing Script", cursive', 'font-size':48,
        fill:'none', stroke:'#3a6bff', 'stroke-width':3.2, 'stroke-linecap':'round', 'stroke-linejoin':'round',
        style: { strokeDasharray: 400, strokeDashoffset: 400 }
      }, char),
      // decorative start dot
      React.createElement('circle', { cx:50, cy:12, r:3.4, fill:'#ffd93d', stroke:'#fff', strokeWidth:0.7 })
    )
  );
}

///////////////////////
// Smoothing helper: quadratic interpolation between points for nicer curves
function drawSmoothPath(ctx, points) {
  if (!points || points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i+1].x) / 2;
    const yc = (points[i].y + points[i+1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  // last segment
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

///////////////////////
// Drawing canvas component: supports mouse & touch, smoothing, variable brush, export, replay info
function DrawingCanvas({ recorder, disabled, width=800, height=220 }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);

  useEffect(()=> {
    const canvas = canvasRef.current;
    // set high DPI
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
    redraw();
    // eslint-disable-next-line
  }, []);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  function redraw() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    clearCanvas();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#223149';
    const strokes = recorder.export();
    for (const s of strokes) {
      if (!s || s.length===0) continue;
      drawSmoothPath(ctx, s);
    }
  }

  // pointer coordinate helper
  useEffect(()=> {
    const el = canvasRef.current;
    if (!el) return;
    function getXY(e) {
      const rect = el.getBoundingClientRect();
      let clientX, clientY;
      if (e.touches && e.touches[0]) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
      else { clientX = e.clientX; clientY = e.clientY; }
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function start(e) {
      if (disabled) return;
      drawing.current = true;
      const p = getXY(e);
      recorder.start(p.x, p.y);
      // draw initial
      const ctx = ctxRef.current;
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#223149';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      e.preventDefault();
    }
    function move(e) {
      if (!drawing.current || disabled) return;
      const p = getXY(e);
      recorder.move(p.x, p.y);
      // redraw last stroke incrementally for responsiveness
      redraw();
      e.preventDefault();
    }
    function end(e) {
      if (!drawing.current || disabled) return;
      drawing.current = false;
      recorder.end();
      redraw();
      e.preventDefault();
    }

    el.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    el.addEventListener('touchstart', start, {passive:false});
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('touchend', end);

    return ()=> {
      el.removeEventListener('mousedown', start);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      el.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
    // eslint-disable-next-line
  }, [recorder, disabled]);

  // when recorder changes externally (clear/import), redraw
  useEffect(()=> {
    redraw();
  }, [recorder]);

  return React.createElement('canvas', { ref: canvasRef, className: 'drawingArea', role:'img', 'aria-label':'Área de traçado' });
}

///////////////////////
// Replay preview component: progressive drawing with scaling & timing
function ReplayPreview({ strokes, width=220, height=120 }) {
  const canvasRef = useRef(null);

  useEffect(()=> {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = '#223149';
    ctx.clearRect(0,0,width,height);
    if (!strokes || strokes.length === 0) return;

    // compute bounds
    let minX=1e9, minY=1e9, maxX=0, maxY=0;
    for (const s of strokes) for (const p of s) { minX = Math.min(minX,p.x); minY = Math.min(minY,p.y); maxX = Math.max(maxX,p.x); maxY = Math.max(maxY,p.y); }
    if (minX === 1e9) return;
    const pad = 8;
    const sw = Math.max(1, maxX - minX);
    const sh = Math.max(1, maxY - minY);
    const scale = Math.min((width - pad*2)/sw, (height - pad*2)/sh);
    const offsetX = (width - sw*scale)/2 - minX*scale;
    const offsetY = (height - sh*scale)/2 - minY*scale;

    // flatten points with timestamps for time-based replay
    const flat = [];
    for (const s of strokes) {
      for (const p of s) flat.push(p.t || 0);
    }
    // simple timing: use indices to step
    let si = 0, pi = 1;
    let raf;
    function step() {
      ctx.clearRect(0,0,width,height);
      // draw completed strokes
      for (let sidx=0; sidx<si; sidx++){
        const s = strokes[sidx];
        if (!s || s.length === 0) continue;
        ctx.beginPath();
        ctx.moveTo(s[0].x*scale + offsetX, s[0].y*scale + offsetY);
        for (let k=1;k<s.length;k++) ctx.lineTo(s[k].x*scale + offsetX, s[k].y*scale + offsetY);
        ctx.stroke();
      }
      // partial stroke
      const curr = strokes[si];
      if (curr) {
        ctx.beginPath();
        ctx.moveTo(curr[0].x*scale + offsetX, curr[0].y*scale + offsetY);
        for (let k=1;k<Math.min(pi, curr.length);k++){
          ctx.lineTo(curr[k].x*scale + offsetX, curr[k].y*scale + offsetY);
        }
        ctx.stroke();
        pi++;
        if (pi > curr.length) { si++; pi = 1; }
      } else {
        // done
      }
      if (si < strokes.length) raf = requestAnimationFrame(step);
    }
    step();
    return ()=> cancelAnimationFrame(raf);
  }, [strokes, width, height]);

  return React.createElement('canvas', { ref: canvasRef, width, height, style: { borderRadius:8, background:'#fff' } });
}

///////////////////////
// Fireworks (improved)
function FireworksCanvas({ running }) {
  const canvasRef = useRef(null);
  useEffect(()=> {
    if (!running) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    let raf;
    const particles = [];
    function rand(a,b){return Math.random()*(b-a)+a;}
    function hue(){return Math.floor(rand(0,360));}
    function launch(x,y){
      const hb = hue();
      const count = 90;
      for (let i=0;i<count;i++){
        particles.push({
          x,y,
          vx: Math.cos(i/count*Math.PI*2)*rand(1,8),
          vy: Math.sin(i/count*Math.PI*2)*rand(1,8),
          life: rand(50,140), age:0,
          color: `hsl(${hb+rand(-60,60)},90%,60%)`,
          size: rand(1.6,3.4)
        });
      }
    }
    function tick(){
      ctx.fillStyle = 'rgba(8,12,20,0.18)';
      ctx.fillRect(0,0,w,h);
      if (Math.random() < 0.06) launch(rand(100,w-100), rand(60,h*0.5));
      for (let i=particles.length-1;i>=0;i--){
        const p = particles[i];
        p.age++; p.vy += 0.06;
        p.x += p.vx; p.y += p.vy;
        const a = Math.max(0,1 - p.age/p.life);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
        if (p.age > p.life) particles.splice(i,1);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener('resize', ()=> { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });
    tick();
    setTimeout(()=>{ launch(w*0.3,h*0.35); launch(w*0.6,h*0.25); launch(w*0.8,h*0.45); }, 200);
    return ()=> cancelAnimationFrame(raf);
  }, [running]);
  return React.createElement('canvas', { ref: canvasRef, className:'fireworks-canvas' });
}

///////////////////////
// Main App
function AppRoot(){
  const [currentWord, setCurrentWord] = useState(manager.getCurrentWord());
  const [qIndex, setQIndex] = useState(manager.currentIndex);
  const [score, setScore] = useState(manager.score);
  const [history, setHistory] = useState(manager.history);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  const [recorder] = useState(new StrokeRecorder());
  const [disabledDraw, setDisabledDraw] = useState(false);

  useEffect(()=> {
    if (!manager.roundWords || manager.roundWords.length === 0) manager.reset();
    refresh();
    // eslint-disable-next-line
  }, []);

  function refresh() {
    setCurrentWord(manager.getCurrentWord());
    setQIndex(manager.currentIndex);
    setScore(manager.score);
    setHistory([...manager.history]);
    setShowResults(manager.finished);
  }

  function handleSubmit(e){
    e && e.preventDefault();
    const strokes = recorder.export();
    const res = manager.recordAnswer(input, strokes);
    setFeedback(res);
    // freeze drawing briefly, then clear recorder for next question
    setDisabledDraw(true);
    setTimeout(()=> {
      recorder.clear();
      setDisabledDraw(false);
      setInput('');
      refresh();
      if (manager.finished) {
        setShowResults(true);
        if (manager.score === manager.roundSize) setTimeout(()=> setFireworks(true), 300);
      }
      setFeedback(null);
    }, 700);
  }

  function handleClearDrawing(){ recorder.clear(); /* trigger slight UI refresh */ setDisabledDraw(true); setTimeout(()=> setDisabledDraw(false), 40); }

  function playAgain(){
    manager.reset();
    recorder.clear();
    setInput('');
    setFeedback(null);
    setShowResults(false);
    setFireworks(false);
    refresh();
  }

  // export full history as JSON download
  function downloadHistory(){
    const data = JSON.stringify(manager.history, null, 2);
    const blob = new Blob([data], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cursiva_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export current drawing PNG
  function exportDrawingImage(){
    // draw strokes onto temp canvas and open in new tab
    const strokes = recorder.export();
    if (!strokes || strokes.length === 0) return alert('Nada para exportar.');
    const tmp = document.createElement('canvas');
    tmp.width = 1200; tmp.height = 400;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,tmp.width,tmp.height);
    ctx.lineWidth = 6; ctx.strokeStyle = '#222'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of strokes){
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      for (let i=1;i<s.length;i++) ctx.lineTo(s[i].x, s[i].y);
      ctx.stroke();
    }
    const data = tmp.toDataURL('image/png');
    const w = window.open();
    if (w) w.document.body.style.margin='0', w.document.body.innerHTML = `<img src="${data}" style="width:100%"/>`;
  }

  const letters = (currentWord || '').split('').filter(Boolean).slice(0,9);
  const percent = manager.getPercent();
  const progressWidth = `${(qIndex / manager.roundSize) * 100}%`;

  let resultMessage = '';
  if (showResults) {
    const s = manager.score;
    if (s < 5) resultMessage = 'Vamos tentar novamente?';
    else if (s < 10) resultMessage = 'Muito bem, quase 100%!';
    else resultMessage = 'PARABENS!!!!!!';
  }

  return React.createElement('div', { className: 'app' },
    fireworks ? React.createElement(FireworksCanvas, { running: fireworks }) : null,

    React.createElement('div', { className: 'header' },
      React.createElement('div', { className: 'logo' },
        React.createElement('div', { className: 'badge' }, 'C'),
        React.createElement('div', null,
          React.createElement('div', { className: 'title' }, 'Cursiva PT-BR'),
          React.createElement('div', { className: 'subtitle' }, 'Trace, digite e aprenda — com dicas visuais!')
        )
      ),
      React.createElement('div', { className: 'topStats' },
        React.createElement('div', { className: 'stat' },
          React.createElement('div', { className: 'label' }, 'Questão'),
          React.createElement('div', { className: 'value' }, `${Math.min(qIndex+1, manager.roundSize)}/${manager.roundSize}`)
        ),
        React.createElement('div', { className: 'stat' },
          React.createElement('div', { className: 'label' }, 'Pontuação'),
          React.createElement('div', { className: 'value' }, `${score}/${manager.roundSize}`)
        )
      )
    ),

    React.createElement('div', { className: 'main' },

      // left
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'wordDisplay' },
          currentWord
            ? React.createElement('div', { className: 'cursiveWord', 'aria-live':'polite' }, currentWord)
            : React.createElement('div', { className: 'cursiveWord' }, '...carregando...')
        ),

        React.createElement('div', { className: 'canvasWrap' },
          React.createElement('div', { style: { width:'100%' } },
            React.createElement(DrawingCanvas, { recorder, disabled: disabledDraw, width:'100%', height:220 })
          ),
          React.createElement('div', { className: 'canvasControls' },
            React.createElement('button', { className: 'btn', onClick: handleClearDrawing, type:'button' }, 'Limpar'),
            React.createElement('button', { className: 'btn ghost', onClick: exportDrawingImage, type:'button' }, 'Abrir imagem'),
            React.createElement('button', { className: 'btn ghost', onClick: downloadHistory, type:'button' }, 'Baixar histórico (JSON)')
          )
        ),

        React.createElement('form', { onSubmit: (ev)=> { ev.preventDefault(); handleSubmit(); } },
          React.createElement('div', { className: 'inputRow' },
            React.createElement('input', {
              className: 'textInput',
              placeholder: 'Digite a palavra (acentos são opcionais)...',
              value: input,
              onChange: (e)=> setInput(e.target.value),
              onKeyDown: (e)=> { if (e.key === 'Enter') handleSubmit(); },
              disabled: manager.finished
            }),
            React.createElement('button', { type:'button', className:'btn', onClick: handleSubmit, disabled: manager.finished }, 'Enviar')
          )
        ),

        React.createElement('div', { className: 'feedback' },
          feedback
            ? (feedback.correct
                ? React.createElement('div', { className: 'msg' }, React.createElement('span', { className: 'check' }, '✔️ '), feedback.acceptedByTolerance ? 'Quase certo — aceito!' : 'Correto!')
                : React.createElement('div', { className: 'msg' }, React.createElement('span', { className: 'cross' }, '✖️ '), `Errado — era "${feedback.expected}"`)
              )
            : React.createElement('div', { className: 'msg' }, 'Trace a palavra e digite. Aceitamos acentos ou pequenas variações.')
        ),

        React.createElement('div', { style: { marginTop:12 } },
          React.createElement('div', { style: { fontWeight:700, fontSize:14 } }, 'Dicas de traçado'),
          React.createElement('div', { className: 'hints' }, letters.map((L, i) => React.createElement(LetterHint, { letter: L, key: i } )) ),
          React.createElement('div', { style: { marginTop:8, color:'var(--muted)', fontSize:13 } }, 'Toque em cada letra para ver o traçado animado. Use como guia ao traçar.')
        )
      ),

      // right
      React.createElement('div', { className: 'sidebar' },
        React.createElement('div', { className: 'scoreCard' },
          React.createElement('div', { style: {display:'flex', justifyContent:'space-between', alignItems:'center'} },
            React.createElement('div', null, React.createElement('div', { className:'label' }, 'Progresso'), React.createElement('div', { style:{fontWeight:700, fontSize:18} }, `Questão ${Math.min(qIndex+1, manager.roundSize)} de ${manager.roundSize}`)),
            React.createElement('div', null, React.createElement('div', { className:'label' }, 'Acertos'), React.createElement('div', { style:{fontWeight:700, fontSize:18} }, `${score}`))
          ),
          React.createElement('div', { className: 'progressBar', style: { marginTop:12 } }, React.createElement('div', { style: { width: progressWidth } })),
          React.createElement('div', { style: { marginTop:12, fontSize:13, color:'var(--muted)' } }, `Percentual: ${percent}%`),
          React.createElement('div', { style: { marginTop:10, fontSize:13, color:'var(--muted)' } }, 'Histórico desta rodada:'),
          React.createElement('div', { className: 'historyList' }, history.map((h, idx)=> React.createElement('div', { key: idx, className: `pill ${h.correct ? 'correct' : 'incorrect'}` }, h.word)))
        ),

        React.createElement('div', { className: 'scoreCard' },
          React.createElement('div', { style: { fontWeight:700, fontSize:16 } }, 'Como usar'),
          React.createElement('ul', { style: { marginTop:8, color:'var(--muted)', paddingLeft:18 } },
            React.createElement('li', null, 'Trace a palavra com dedo/mouse usando o espaço acima.'),
            React.createElement('li', null, 'Use as dicas visuais por letra (toque na letra para ver o traçado).'),
            React.createElement('li', null, 'Digite a palavra — acentos são opcionais. Aceitamos pequenos erros.'),
            React.createElement('li', null, 'Ao final, revise seus traços e veja a reprodução animada.')
          )
        ),

        React.createElement('div', null, React.createElement('button', { className:'btn', onClick: playAgain }, 'Recomeçar'))
      )
    ),

    showResults ? React.createElement('div', { className: 'overlay' },
      React.createElement('div', { className: 'results' },
        React.createElement('h2', null, `Resultado: ${manager.score}/${manager.roundSize}`),
        React.createElement('p', null, resultMessage),

        React.createElement('div', { style: { marginTop:12, textAlign:'left' } },
          React.createElement('div', { style: { fontWeight:700, marginBottom:8 } }, 'Revisão dos traços:'),
          React.createElement('div', { className: 'previewGrid' },
            manager.history.map((h, idx)=> React.createElement('div', { key: idx, className: 'previewCard' },
              React.createElement('div', { style: { fontWeight:700, color: h.correct ? 'var(--good)' : 'var(--bad)' } }, `${idx+1}. ${h.word}`),
              React.createElement(ReplayPreview, { strokes: h.strokes || [], width:220, height:120 }),
              React.createElement('div', { style: { fontSize:13, color:'var(--muted)' } }, h.correct ? 'correto' : `esperado: ${h.expected}`)
            ))
          )
        ),

        React.createElement('div', { style: { marginTop:18, display:'flex', justifyContent:'center', gap:12 } },
          React.createElement('button', { className:'btn', onClick: playAgain }, 'Jogar Novamente')
        )
      )
    ) : null
  );
}

const domRoot = document.getElementById('root');
ReactDOM.createRoot(domRoot).render(React.createElement(AppRoot));
