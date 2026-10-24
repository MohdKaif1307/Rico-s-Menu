/*
 * Rico's — cinematic 3D scene.
 * A lightweight WebGL orbital environment with perspective projection,
 * scroll-reactive camera movement, chapter palettes and a 2D fallback.
 */
import gsap from 'gsap';

const THEMES = {
  home:       { accent: [0.83, 0.67, 0.31], glow: 'rgba(6,183,145,.19)', css: '#d4af55' },
  brunch:     { accent: [0.91, 0.71, 0.39], glow: 'rgba(207,154,71,.19)', css: '#e7bf68' },
  smallplates:{ accent: [0.86, 0.74, 0.48], glow: 'rgba(154,176,119,.18)', css: '#e4c983' },
  burgers:    { accent: [0.93, 0.55, 0.39], glow: 'rgba(212,108,77,.17)', css: '#ed986f' },
  fiesta:     { accent: [0.94, 0.66, 0.35], glow: 'rgba(235,126,50,.17)', css: '#f0b15f' },
  pasta:      { accent: [0.88, 0.76, 0.47], glow: 'rgba(166,185,108,.18)', css: '#e1c47a' },
  pizza:      { accent: [0.94, 0.57, 0.36], glow: 'rgba(211,104,66,.18)', css: '#ed9565' },
  mains:      { accent: [0.87, 0.70, 0.40], glow: 'rgba(206,152,64,.17)', css: '#dfb566' },
  sundaes:    { accent: [0.92, 0.73, 0.63], glow: 'rgba(215,156,174,.16)', css: '#e9c1a2' },
};

const VERTEX = `
attribute vec3 a_position;
attribute float a_size;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform vec2 u_mouse;
uniform float u_points;
varying float v_points;
void main() {
  float yaw = u_time * 0.055 + u_scroll * 0.72 + u_mouse.x * 0.14;
  float pitch = 0.13 + sin(u_time * 0.11) * 0.035 + u_mouse.y * 0.09;
  vec3 p = a_position;
  float ca = cos(yaw), sa = sin(yaw);
  float x = p.x * ca - p.z * sa;
  float z = p.x * sa + p.z * ca;
  float cp = cos(pitch), sp = sin(pitch);
  float y = p.y * cp - z * sp;
  z = p.y * sp + z * cp;
  p = vec3(x + 0.70 + u_mouse.x * 0.10, y + u_mouse.y * 0.07, z);
  float depth = max(p.z + 4.9, 1.0);
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  gl_Position = vec4(p.x * 2.65 / (aspect * depth), p.y * 2.65 / depth, 0.0, 1.0);
  gl_PointSize = u_points > 0.5 ? a_size * (6.0 / depth) * (u_resolution.y / 820.0) : 1.0;
  v_points = u_points;
}`;

const FRAGMENT = `
precision mediump float;
uniform vec4 u_color;
varying float v_points;
void main() {
  float alpha = 1.0;
  if (v_points > 0.5) {
    float d = distance(gl_PointCoord, vec2(0.5));
    alpha = 1.0 - smoothstep(0.08, 0.5, d);
  }
  gl_FragColor = vec4(u_color.rgb, u_color.a * alpha);
}`;

let canvas, gl, program, fallback;
let locations = {};
let starBuffer = null, starCount = 0, rings = [];
let width = 1, height = 1, pixelRatio = 1;
let startTime = 0, lastFrame = 0, scrollProgress = 0;
let pointer = { x: 0, y: 0 };
let theme = THEMES.home;
let reducedMotion = false;
let initialized = false;

function compileShader(context, type, source) {
  const shader = context.createShader(type);
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    const message = context.getShaderInfoLog(shader) || 'Shader compilation failed';
    context.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}
function createProgram(context) {
  const vertex = compileShader(context, context.VERTEX_SHADER, VERTEX);
  const fragment = compileShader(context, context.FRAGMENT_SHADER, FRAGMENT);
  const linked = context.createProgram();
  context.attachShader(linked, vertex); context.attachShader(linked, fragment);
  context.linkProgram(linked);
  context.deleteShader(vertex); context.deleteShader(fragment);
  if (!context.getProgramParameter(linked, context.LINK_STATUS)) {
    const message = context.getProgramInfoLog(linked) || 'Shader link failed';
    context.deleteProgram(linked); throw new Error(message);
  }
  return linked;
}
function bufferFor(context, values) {
  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(context.ARRAY_BUFFER, new Float32Array(values), context.STATIC_DRAW);
  return buffer;
}
function makeRing(rx, ry, tiltX, tiltY, offsetY, segments = 160) {
  const points = [], cx = Math.cos(tiltX), sx = Math.sin(tiltX);
  const cy = Math.cos(tiltY), sy = Math.sin(tiltY);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * Math.PI * 2;
    const x = rx * Math.cos(t), y = ry * Math.sin(t) + offsetY, z = 0.05 * Math.sin(t * 2 + 0.7);
    const y1 = y * cx - z * sx, z1 = y * sx + z * cx;
    const x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
    points.push(x2, y1, z2, 1);
  }
  return points;
}
function createGeometry(context) {
  if (starBuffer) context.deleteBuffer(starBuffer);
  rings.forEach(r => context.deleteBuffer(r.buffer));
  const stars = [];
  const count = Math.min(620, Math.max(320, Math.floor(width * height / 2600)));
  for (let i = 0; i < count; i++) {
    stars.push((Math.random() - 0.5) * 7.8, (Math.random() - 0.5) * 4.8, (Math.random() - 0.5) * 3.7, 1.2 + Math.random() * 3.4);
  }
  starCount = count; starBuffer = bufferFor(context, stars);
  const specs = [
    [1.57,.46,.18,-.10,-.17,.52,0], [1.34,.37,.20,-.10,-.17,.38,0],
    [1.10,.28,.20,-.10,-.17,.30,1], [1.70,1.01,.89,.42,-.05,.27,1],
    [1.20,1.23,1.19,.76,-.02,.24,0], [1.84,.78,.62,-.85,.09,.20,0],
    [1.53,.24,.15,.08,-.52,.30,1], [1.42,.20,.15,.08,.20,.25,0],
  ];
  rings = specs.map(s => ({ buffer: bufferFor(context, makeRing(...s.slice(0,5))), count: 161, alpha: s[5], kind: s[6] }));
}
function bindGeometry(context, buffer) {
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.enableVertexAttribArray(locations.position);
  context.vertexAttribPointer(locations.position, 3, context.FLOAT, false, 16, 0);
  context.enableVertexAttribArray(locations.size);
  context.vertexAttribPointer(locations.size, 1, context.FLOAT, false, 16, 12);
}
function color(context, rgb, alpha) { context.uniform4f(locations.color, rgb[0], rgb[1], rgb[2], alpha); }
function drawWebGL(now) {
  if (!gl || !program) return;
  const context = gl, time = reducedMotion ? 0.4 : (now - startTime) / 1000;
  context.viewport(0, 0, canvas.width, canvas.height);
  context.clearColor(0, 0, 0, 0); context.clear(context.COLOR_BUFFER_BIT);
  context.useProgram(program);
  context.uniform2f(locations.resolution, canvas.width, canvas.height);
  context.uniform1f(locations.time, time);
  context.uniform1f(locations.scroll, scrollProgress);
  context.uniform2f(locations.mouse, pointer.x, pointer.y);
  context.enable(context.BLEND); context.blendFunc(context.SRC_ALPHA, context.ONE);
  context.disable(context.DEPTH_TEST);
  context.uniform1f(locations.points, 1);
  bindGeometry(context, starBuffer); color(context, [0.45,0.85,0.72], 0.25);
  context.drawArrays(context.POINTS, 0, starCount);
  context.uniform1f(locations.points, 0);
  rings.forEach(r => {
    bindGeometry(context, r.buffer);
    color(context, r.kind ? [0.10,0.73,0.59] : theme.accent, r.alpha * (r.kind ? 0.75 : 0.68));
    context.drawArrays(context.LINE_STRIP, 0, r.count);
  });
}
function drawFallback(now) {
  if (!fallback) return;
  const ctx = fallback;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width * 0.73, cy = canvas.height * (0.47 + pointer.y * 0.025);
  const scale = canvas.height / 850;
  ctx.save(); ctx.translate(cx + pointer.x * 35 * pixelRatio, cy);
  ctx.rotate((reducedMotion ? 0.15 : now * 0.00008) + scrollProgress * 0.4);
  ctx.scale(scale, scale * 0.62);
  for (let i=0;i<5;i++) {
    ctx.beginPath(); ctx.ellipse(0,0,150+i*24,92+i*15,i*0.18,0,Math.PI*2);
    ctx.strokeStyle = 'rgba(212,175,85,' + (0.13-i*.015) + ')'; ctx.lineWidth = 1.1; ctx.stroke();
  }
  ctx.restore();
}
function resize() {
  if (!canvas) return;
  width = window.innerWidth; height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio);
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  if (gl) { gl.viewport(0,0,canvas.width,canvas.height); createGeometry(gl); }
}
function updateScrollProgress() {
  scrollProgress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
  document.documentElement.style.setProperty('--scroll-progress', scrollProgress.toFixed(4));
  if (reducedMotion) { if (gl) drawWebGL(performance.now()); else drawFallback(performance.now()); }
}
function animate(now) {
  if (!initialized || reducedMotion) return;
  if (!document.hidden && now - lastFrame >= 22) {
    if (gl) drawWebGL(now); else drawFallback(now);
    lastFrame = now;
  }
  requestAnimationFrame(animate);
}
function installTiltInteractions() {
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer.x = Math.max(-1,Math.min(1,(event.clientX / Math.max(1,window.innerWidth)-.5)*2));
    pointer.y = Math.max(-1,Math.min(1,(event.clientY / Math.max(1,window.innerHeight)-.5)*2));
    const target = event.target.closest?.('[data-tilt]');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const dx = (event.clientX-rect.left)/Math.max(1,rect.width)-.5;
    const dy = (event.clientY-rect.top)/Math.max(1,rect.height)-.5;
    target.style.setProperty('--tilt-x', (-dy*9).toFixed(2)+'deg');
    target.style.setProperty('--tilt-y', (dx*12).toFixed(2)+'deg');
    target.style.setProperty('--tilt-z', (dx*1.8).toFixed(2)+'deg');
  },{passive:true});
  document.addEventListener('pointerout', event => {
    const target = event.target.closest?.('[data-tilt]');
    if (!target || (event.relatedTarget && target.contains(event.relatedTarget))) return;
    target.style.setProperty('--tilt-x','0deg'); target.style.setProperty('--tilt-y','0deg'); target.style.setProperty('--tilt-z','0deg');
  },{passive:true});
}
export function setSceneChapter(chapterId='home') {
  theme = THEMES[chapterId] || THEMES.home;
  document.documentElement.style.setProperty('--scene-accent', theme.css);
  document.documentElement.style.setProperty('--scene-glow', theme.glow);
  document.documentElement.dataset.scene = chapterId || 'home';
}
export function initCinematicScene() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true; startTime = performance.now();
  reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  canvas = document.createElement('canvas'); canvas.id = 'cinematic-scene';
  canvas.className = 'cinematic-scene'; canvas.setAttribute('aria-hidden','true'); document.body.prepend(canvas);
  try {
    gl = canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
    if (gl) {
      program = createProgram(gl);
      locations = {
        position:gl.getAttribLocation(program,'a_position'), size:gl.getAttribLocation(program,'a_size'),
        resolution:gl.getUniformLocation(program,'u_resolution'), time:gl.getUniformLocation(program,'u_time'),
        scroll:gl.getUniformLocation(program,'u_scroll'), mouse:gl.getUniformLocation(program,'u_mouse'),
        points:gl.getUniformLocation(program,'u_points'), color:gl.getUniformLocation(program,'u_color')
      };
    }
  } catch (error) { console.warn('Rico’s WebGL scene failed; using a canvas fallback.',error); gl=null; program=null; }
  if (!gl) fallback=canvas.getContext('2d');
  resize(); updateScrollProgress(); setSceneChapter('home'); installTiltInteractions();
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('scroll',updateScrollProgress,{passive:true});
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden && !reducedMotion) requestAnimationFrame(animate); });
  if (reducedMotion) { if(gl) drawWebGL(startTime); else drawFallback(startTime); }
  else requestAnimationFrame(animate);
}
export function setupScrollChoreography(container) {
  if (!container || !('IntersectionObserver' in window)) return;
  const targets=container.querySelectorAll('.subcategory,.pizza-badge-wrapper,.menu-note,.chapter-nav');
  if (!targets.length) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(el=>{el.classList.add('scene-in-view');gsap.set(el,{opacity:1,y:0,rotateX:0,clearProps:'transform'});});
    return;
  }
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;el.classList.add('scene-in-view');
    gsap.to(el,{opacity:1,y:0,rotateX:0,duration:.68,ease:'power2.out',overwrite:'auto'});
    observer.unobserve(el);
  }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  targets.forEach(el=>{el.classList.add('scene-scroll-reveal');gsap.set(el,{opacity:0,y:24,rotateX:2,transformPerspective:1000});observer.observe(el);});
}
