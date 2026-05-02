(() => {
'use strict';

/* ─── CONFIG ─── */
const CFG = {
    ringLerp      : 0.11,
    magnetLerp    : 0.36,
    sparkInterval : 38,
    sparkMinSize  : 1.5,
    sparkMaxSize  : 8,
    sparkDurMin   : 0.38,
    sparkDurMax   : 0.72,
    sparkDistMin  : 5,
    sparkDistMax  : 30,
    /* Red hue bands in HSL */
    sparkHues     : [[0,6],[350,360],[4,12]],
    sparkLightMin : 46,
    sparkLightMax : 72,
};

/* ─── DOM ─── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
if (!dot || !ring) return;

/* ─── STATE ─── */
const mouse = { x:-300, y:-300 };
const lag   = { x:-300, y:-300 };
let raf, lastSpark = 0, hovering = false, hoveredEl = null;

/* ─── UTILS ─── */
const lerp = (a,b,t) => a + (b-a)*t;
const rand = (lo,hi) => lo + Math.random()*(hi-lo);
const pick = arr     => arr[Math.floor(Math.random()*arr.length)];

/* ─── MOUSE MOVE ─── */
document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    dot.style.left = mouse.x + 'px';
    dot.style.top  = mouse.y + 'px';
    const now = performance.now();
    if (now - lastSpark > CFG.sparkInterval) {
    spawnSpark(mouse.x, mouse.y);
    lastSpark = now;
    }
});

/* ─── HOVER ─── */
const HOV = 'a,button,input[type="submit"],.card,[role="button"],label';
document.addEventListener('mouseover', e => {
    const el = e.target.closest(HOV);
    if (!el) return;
    hovering = true; hoveredEl = el;
    dot.classList.add('hov'); ring.classList.add('hov');
});
document.addEventListener('mouseout', e => {
    const el = e.target.closest(HOV);
    if (!el) return;
    hovering = false; hoveredEl = null;
    dot.classList.remove('hov'); ring.classList.remove('hov');
});

/* ─── CLICK ─── */
document.addEventListener('mousedown', () => {
    dot.classList.add('tap'); ring.classList.add('tap');
    spawnRipple(mouse.x, mouse.y);
    for (let i=0; i<7; i++) spawnSpark(mouse.x, mouse.y, true);
});
document.addEventListener('mouseup', () => {
    dot.classList.remove('tap'); ring.classList.remove('tap');
});

/* ─── WINDOW EDGE ─── */
document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });

/* ─── MAGNETIC CENTER ─── */
function getMagCenter() {
    if (!hoveredEl) return null;
    const r = hoveredEl.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
}

/* ─── RAF LOOP ─── */
function tick() {
    const mag = hovering ? getMagCenter() : null;
    const tx  = mag ? lerp(mouse.x, mag.x, CFG.magnetLerp) : mouse.x;
    const ty  = mag ? lerp(mouse.y, mag.y, CFG.magnetLerp) : mouse.y;
    lag.x = lerp(lag.x, tx, CFG.ringLerp);
    lag.y = lerp(lag.y, ty, CFG.ringLerp);
    ring.style.left = lag.x + 'px';
    ring.style.top  = lag.y + 'px';
    raf = requestAnimationFrame(tick);
}
raf = requestAnimationFrame(tick);

/* ─── SPARK ─── */
function spawnSpark(x, y, burst=false) {
    const el = document.createElement('div');
    el.className = 'cur-spark';
    const size  = rand(burst ? 3 : CFG.sparkMinSize, burst ? CFG.sparkMaxSize+4 : CFG.sparkMaxSize);
    const angle = rand(0, Math.PI*2);
    const dist  = rand(burst ? 12 : CFG.sparkDistMin, burst ? 46 : CFG.sparkDistMax);
    const tx    = Math.cos(angle)*dist;
    const ty    = Math.sin(angle)*dist;
    const dur   = rand(CFG.sparkDurMin, CFG.sparkDurMax + (burst ? .22 : 0));
    const range = pick(CFG.sparkHues);
    const hue   = rand(range[0], range[1]);
    const light = rand(CFG.sparkLightMin, CFG.sparkLightMax);
    const color = `hsl(${hue},96%,${light}%)`;
    Object.assign(el.style, {
    left:''+x+'px', top:''+y+'px',
    width:''+size+'px', height:''+size+'px',
    background: color,
    boxShadow: `0 0 ${size*2}px ${size*.6}px ${color}`,
    '--tx': tx+'px', '--ty': ty+'px', '--d': dur+'s',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (dur+.1)*1000);
}

/* ─── RIPPLE ─── */
function spawnRipple(x, y) {
    ['cur-ripple','cur-ripple2'].forEach(cls => {
    const el = document.createElement('div');
    el.className = cls;
    Object.assign(el.style, { left: x+'px', top: y+'px' });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
    });
}

/* ─── CLEANUP ─── */
window._destroyCursor = () => cancelAnimationFrame(raf);
})();
