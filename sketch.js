// ====== EDIT ME ======
const NAME = "SWADHA";
const TITLE_WIDE = ["HAPPY BIRTHDAY"];   // landscape / desktop
const TITLE_TALL = ["HAPPY", "BIRTHDAY"]; // portrait / mobile
// photos/p1.jpg ... p7.jpg  (fx, fy = face position 0-1, z = zoom)
const PHOTO_META = [
  {f: 'photos/p1.jpg', fx: .5,  fy: .38, z: 1},
  {f: 'photos/p2.jpg', fx: .44, fy: .47, z: 1},
  {f: 'photos/p3.jpg', fx: .52, fy: .40, z: 1},
  {f: 'photos/p4.jpg', fx: .62, fy: .55, z: 1.35},
  {f: 'photos/p5.jpg', fx: .44, fy: .44, z: 1.9},
  {f: 'photos/p6.jpg', fx: .45, fy: .50, z: 1},
  {f: 'photos/p7.jpg', fx: .50, fy: .42, z: 1.2},
];
// Optional: put a file called music.mp3 in the repo; it plays on first tap/click.
// =====================

// palette pulled from the photos: rust, marigold, mustard, teal, pink, orange, navy, cream
const PAL = ['#e8472b', '#f5a30f', '#f7d154', '#1fb5ad', '#e8478f', '#ff7a3d'];
const CREAM = '#fff3d9';
let photos = [], song, cur = 0, prev = 0, swapT = 0, bursts = [], stars = [], nextBurst = 0;

function preload() {
  for (const m of PHOTO_META) photos.push({...m, img: loadImage(m.f)});
}

function setup() {
  pixelDensity(min(2, window.devicePixelRatio || 1));
  const c = createCanvas(windowWidth, windowHeight);
  c.drop(onFile);
  noStroke();
  textFont('Bungee, Impact, "Arial Black", sans-serif');
  for (let i = 0; i < 70; i++) stars.push({x: random(), y: random(), s: random(6, 16), p: random(TWO_PI), r: random(-1, 1)});
  song = new Audio('music.mp3'); song.loop = true;
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function startMusic() { if (song && song.paused) song.play().catch(() => {}); }
function onFile(f) {
  if (f.type === 'image') loadImage(f.data, im => photos.push({img: im, fx: .5, fy: .42, z: 1}));
  else if (f.type === 'audio') { song.pause(); song = new Audio(f.data); song.loop = true; song.play(); }
}
function mousePressed() { burst(mouseX, mouseY); startMusic(); }
function touchStarted() { if (touches.length) burst(touches[0].x, touches[0].y); startMusic(); return false; }

function burst(x, y) {
  for (let i = 0; i < 28; i++) {
    const a = random(TWO_PI), v = random(2, 8);
    bursts.push({x, y, vx: cos(a) * v, vy: sin(a) * v, life: 1, c: random(PAL), star: random() < 0.5, s: random(6, 16)});
  }
}

function draw() {
  const t = frameCount / 60, W = width, H = height, m = min(W, H);
  const tall = H > W * 1.05;
  const cx = W / 2, cy = H * (tall ? 0.55 : 0.56);
  background('#101a3a');

  // retro sunburst
  push(); translate(cx, cy); rotate(t * 0.08);
  for (let i = 0; i < 24; i++) { fill(i % 2 ? '#142349' : '#1c2f63'); arc(0, 0, max(W, H) * 2.4, max(W, H) * 2.4, i * TWO_PI / 24, (i + 1) * TWO_PI / 24, PIE); }
  pop();

  // pulsing rings
  noFill();
  for (let i = 0; i < 7; i++) {
    const k = (t * 0.18 + i / 7) % 1, r = k * max(W, H) * 0.75;
    stroke(PAL[i % 6]); strokeWeight(1 + 6 * (1 - k)); circle(cx, cy, r * 2);
  }
  noStroke();

  // twinkling stars
  for (const s of stars) {
    const a = 0.5 + 0.5 * sin(t * 3 + s.p);
    fill(247, 209, 84, 255 * a); star(s.x * W, s.y * H, s.s * 0.4, s.s, 5, t * s.r);
  }

  if (photos.length > 1 && millis() - swapT > 3200) { prev = cur; cur = (cur + 1) % photos.length; swapT = millis(); }

  // arch size
  let aw, ah;
  if (tall) { aw = W * 0.6; ah = min(aw * 1.3, H * 0.4); } else { ah = H * 0.52; aw = ah * 0.76; }
  const d = m * (tall ? 0.15 : 0.13);

  // orbiting photo circles
  for (let i = 0; i < 8; i++) {
    const a = t * 0.35 + i * TWO_PI / 8;
    const x = cx + cos(a) * (aw / 2 + d * 0.9), y = cy + sin(a) * (ah / 2 + d * (tall ? 0.8 : 0.5));
    const dd = d * (1 + 0.1 * sin(t * 3 + i));
    fill(PAL[i % 6]); circle(x, y, dd * 1.25);
    const c = drawingContext; c.save(); c.beginPath(); c.arc(x, y, dd / 2, 0, TWO_PI); c.clip();
    if (photos.length) cover(photos[(cur + i) % photos.length], x, y, dd, dd, 255);
    c.restore();
  }

  // arch (mehrab) frame
  const bob = sin(t * 1.5) * 6;
  for (let k = 3; k >= 1; k--) { fill(PAL[(floor(t * 2) + k) % 6]); arch(cx, cy + bob, aw + k * 18, ah + k * 18); }
  fill('#0b1226'); arch(cx, cy + bob, aw, ah);
  drawingContext.save(); archClip(cx, cy + bob, aw, ah); drawingContext.clip();
  if (photos.length) {
    const f = constrain((millis() - swapT) / 700, 0, 1);
    cover(photos[prev % photos.length], cx, cy + bob, aw, ah, 255);
    cover(photos[cur], cx, cy + bob, aw, ah, 255 * f);
  }
  drawingContext.restore();

  // flags + LED strings
  banner(0, H * 0.035, 4, tall ? 14 : 20, t);
  leds(0, H * 0.035, 4, tall ? 28 : 40, t, 0);
  leds(H * 0.97, H * 0.015, tall ? 4 : 5, tall ? 40 : 50, t, 3);

  // text (big)
  const lines = tall ? TITLE_TALL : TITLE_WIDE;
  const tsz = fitSize(lines, W * 0.88, tall ? H * 0.085 : H * 0.12);
  const ty = H * (tall ? 0.145 : 0.17);
  lines.forEach((ln, i) => bounceText(ln, cx, ty + i * tsz * 1.12, tsz, t, 4));
  bounceText(NAME, cx, H * (tall ? 0.885 : 0.905), fitSize([NAME], W * 0.8, tall ? H * 0.075 : H * 0.085), t, 2.5);

  // fireworks
  if (millis() > nextBurst) { burst(random(W * 0.1, W * 0.9), random(H * 0.25, H * 0.8)); nextBurst = millis() + 2200; }
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i]; b.x += b.vx; b.y += b.vy; b.vy += 0.12; b.life -= 0.015;
    if (b.life <= 0) { bursts.splice(i, 1); continue; }
    const c = color(b.c); c.setAlpha(255 * b.life); fill(c);
    if (b.star) star(b.x, b.y, b.s * 0.4, b.s, 5, b.life * 6); else circle(b.x, b.y, b.s * b.life);
  }
}

// ---------- helpers ----------
function swagY(u, y0, sag, k) { return y0 + sag * abs(sin(u * k * PI)); }

function leds(y0, sag, k, n, t, seed) {
  noFill(); stroke(0, 170); strokeWeight(2); beginShape();
  for (let i = 0; i <= n; i++) vertex(i / n * width, swagY(i / n, y0, sag, k));
  endShape(); noStroke();
  for (let i = 0; i <= n; i++) {
    const x = i / n * width, y = swagY(i / n, y0, sag, k);
    const col = color(PAL[(i + seed) % 6]), on = (i + floor(t * 5)) % 4 !== 0;
    if (on) { col.setAlpha(70); fill(col); circle(x, y, 34); col.setAlpha(255); } else col.setAlpha(80);
    fill(col); circle(x, y, 12);
  }
}

function banner(y0, sag, k, n, t) {
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n;
    const x0 = u0 * width, ya = swagY(u0, y0, sag, k), x1 = u1 * width, yb = swagY(u1, y0, sag, k);
    const len = width / n * 1.1, tx = (x0 + x1) / 2 + sin(t * 2 + i) * 8, ty = (ya + yb) / 2 + len;
    fill(PAL[i % 6]); triangle(x0, ya, x1, yb, tx, ty);
    fill(CREAM); circle((x0 + x1 + tx) / 3, (ya + yb + ty) / 3, len * 0.18);
  }
}

function fitSize(lines, maxW, maxSz) {
  textSize(100);
  const w = max(lines.map(l => textWidth(l)));
  return min(maxSz, 100 * maxW / w);
}

function bounceText(s, cx, y, sz, t, spd) {
  textSize(sz); textAlign(LEFT, CENTER);
  let x = cx - textWidth(s) / 2;
  const cols = ['#e8478f', '#f5a30f', '#1fb5ad'];
  for (const ch of s) {
    const yy = y + sin(t * spd + x * 0.02) * sz * 0.1;
    for (let i = 3; i >= 1; i--) { fill(cols[i - 1]); text(ch, x + i * sz * 0.035, yy + i * sz * 0.035); }
    fill(CREAM); text(ch, x, yy);
    x += textWidth(ch);
  }
}

function star(x, y, r1, r2, n, rot) {
  beginShape();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * PI / n, r = i % 2 ? r1 : r2; vertex(x + cos(a) * r, y + sin(a) * r); }
  endShape(CLOSE);
}

function arch(x, y, w, h) {
  beginShape(); vertex(x - w / 2, y + h / 2); vertex(x - w / 2, y - h / 2 + w / 2);
  for (let a = PI; a <= TWO_PI + 0.01; a += 0.1) vertex(x + cos(a) * w / 2, y - h / 2 + w / 2 + sin(a) * w / 2);
  vertex(x + w / 2, y + h / 2); endShape(CLOSE);
}
function archClip(x, y, w, h) {
  const c = drawingContext; c.beginPath(); c.moveTo(x - w / 2, y + h / 2); c.lineTo(x - w / 2, y - h / 2 + w / 2);
  c.arc(x, y - h / 2 + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w / 2, y + h / 2); c.closePath();
}

// draw photo p cropped to w*h box centered at x,y, keeping the face (fx,fy) in view
function cover(p, x, y, w, h, a) {
  const im = p.img; if (!im || !im.width) return;
  const s = max(w / im.width, h / im.height) * p.z, dw = im.width * s, dh = im.height * s;
  const ox = constrain(p.fx * dw - w / 2, 0, dw - w), oy = constrain(p.fy * dh - h / 2, 0, dh - h);
  const c = drawingContext; c.globalAlpha = a / 255;
  image(im, x - w / 2 - ox, y - h / 2 - oy, dw, dh);
  c.globalAlpha = 1;
}
