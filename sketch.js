// ====== EDIT ME ======
const NAME = "SWADHA";
const STRETCH_WIDE = 1.35, STRETCH_TALL = 1.15; // make title/name text wider (1 = normal)
const DATE = "13 OCT";                    // repeated in the background
const TITLE_WIDE = ["HAPPY BIRTHDAY"];   // landscape / desktop
const TITLE_TALL = ["HAPPY", "BIRTHDAY"]; // portrait / mobile
// Center arch: solo photos. (fx, fy = face position 0-1, z = zoom)
const PHOTO_META = [
  {f: 'photos/p1.jpg', fx: .5,  fy: .38, z: 1},
  {f: 'photos/p2.jpg', fx: .44, fy: .47, z: 1},
  {f: 'photos/p3.jpg', fx: .52, fy: .40, z: 1},
  {f: 'photos/p4.jpg', fx: .62, fy: .55, z: 1.35},
  {f: 'photos/p5.jpg', fx: .44, fy: .44, z: 1.9},
  {f: 'photos/p6.jpg', fx: .45, fy: .50, z: 1},
  {f: 'photos/p7.jpg', fx: .50, fy: .42, z: 1.2},
];
// Outer circles: group photos. Tap a circle to open the full photo.
const GROUP_META = [
  {f: 'photos/g1.jpg', fx: .39, fy: .62, z: 2.4},
  {f: 'photos/g2.jpg', fx: .21, fy: .28, z: 2.2},
  {f: 'photos/g3.jpg', fx: .69, fy: .26, z: 1.8},
  {f: 'photos/g4.jpg', fx: .26, fy: .67, z: 2.2},
  {f: 'photos/g5.jpg', fx: .68, fy: .55, z: 2.4},
  {f: 'photos/g6.jpg', fx: .45, fy: .68, z: 2.4},
  {f: 'photos/g7.jpg', fx: .20, fy: .39, z: 2.2},
  {f: 'photos/g8.jpg', fx: .30, fy: .50, z: 2.2},
  {f: 'photos/g9.jpg', fx: .17, fy: .36, z: 2.4},
];
// Optional: put a file called music.mp3 in the repo; it plays on first tap/click.
// =====================

// palette pulled from the photos: rust, marigold, mustard, teal, pink, orange, navy, cream
const PAL = ['#e8472b', '#f5a30f', '#f7d154', '#1fb5ad', '#e8478f', '#ff7a3d'];
const CREAM = '#fff3d9';
const CONF = [...PAL, CREAM, '#7b5cff'];
let photos = [], groups = [], song, cur = 0, prev = 0, swapT = 0;
let bursts = [], stars = [], nextBurst = 0, confs = [], tapCandles = [], cpos = [];
const lb = {idx: -1, last: 0, t: 0};

function preload() {
  for (const m of PHOTO_META) photos.push({...m, img: loadImage(m.f)});
  for (const m of GROUP_META) groups.push({...m, img: loadImage(m.f)});
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
function mousePressed() { handleTap(mouseX, mouseY); }
function touchStarted() { if (touches.length) handleTap(touches[0].x, touches[0].y); return false; }

function handleTap(x, y) {
  startMusic();
  if (lb.idx >= 0) { lb.idx = -1; confetti(x, y, 40); return; }           // close photo
  for (const c of cpos) {                                                   // tapped a circle?
    if (dist(x, y, c.x, c.y) < c.r) { lb.idx = lb.last = c.i; rain(90); return; }
  }
  confetti(x, y, 70);                                                       // confetti + candle
  tapCandles.push({x, y, born: millis(), c: random(PAL)});
  if (tapCandles.length > 12) tapCandles.shift();
}

function burst(x, y) {
  for (let i = 0; i < 28; i++) {
    const a = random(TWO_PI), v = random(2, 8);
    bursts.push({x, y, vx: cos(a) * v, vy: sin(a) * v, life: 1, c: random(PAL), star: random() < 0.5, s: random(6, 16)});
  }
}
function confetti(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = random(-PI * 0.95, -PI * 0.05), v = random(4, 13);
    confs.push(cp(x, y, cos(a) * v, sin(a) * v, 1));
  }
}
function rain(n) {
  for (let i = 0; i < n; i++) confs.push(cp(random(width), random(-height * 0.5, -10), random(-1, 1), random(1, 3), 1.5));
}
function cp(x, y, vx, vy, life) {
  return {x, y, vx, vy, life, c: random(CONF), w: random(6, 12), h: random(4, 8), rot: random(TWO_PI), vr: random(-0.2, 0.2),
          fl: random(TWO_PI), fs: random(0.1, 0.3), ph: random(TWO_PI), sq: random() < 0.75};
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

  dateWall(t, W, H);

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
  if (tall) { aw = W * 0.6; ah = min(aw * 1.3, H * 0.4); } else { ah = H * 0.48; aw = ah * 0.76; }
  const d = m * (tall ? 0.15 : 0.13);

  // orbiting group-photo circles (tappable)
  cpos = []; let over = false;
  for (let i = 0; i < groups.length; i++) {
    const a = t * 0.35 + i * TWO_PI / groups.length;
    const x = cx + cos(a) * (aw / 2 + d * 0.9), y = cy + sin(a) * (ah / 2 + d * (tall ? 0.8 : 0.5));
    const dd = d * (1 + 0.1 * sin(t * 3 + i));
    cpos.push({x, y, r: dd * 0.7, i});
    if (lb.idx < 0 && dist(mouseX, mouseY, x, y) < dd * 0.7) over = true;
    fill(PAL[i % 6]); circle(x, y, dd * 1.25);
    const c = drawingContext; c.save(); c.beginPath(); c.arc(x, y, dd / 2, 0, TWO_PI); c.clip();
    cover(groups[i], x, y, dd, dd, 255);
    c.restore();
  }
  cursor(over ? HAND : ARROW);

  // arch (mehrab) frame with solo photos
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
  STRETCH = tall ? STRETCH_TALL : STRETCH_WIDE;
  const lines = tall ? TITLE_TALL : TITLE_WIDE;
  const tsz = fitSize(lines, W * 0.97, tall ? H * 0.085 : H * 0.17);
  const ty = H * (tall ? 0.145 : 0.2);
  lines.forEach((ln, i) => bounceText(ln, cx, ty + i * tsz * 1.12, tsz, t, 4));
  bounceText(NAME, cx, H * (tall ? 0.885 : 0.895), fitSize([NAME], W * 0.9, tall ? H * 0.075 : H * 0.12), t, 2.5);

  // auto sparkle bursts
  if (millis() > nextBurst) { burst(random(W * 0.1, W * 0.9), random(H * 0.25, H * 0.8)); nextBurst = millis() + 2200; }
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i]; b.x += b.vx; b.y += b.vy; b.vy += 0.12; b.life -= 0.015;
    if (b.life <= 0) { bursts.splice(i, 1); continue; }
    const c = color(b.c); c.setAlpha(255 * b.life); fill(c);
    if (b.star) star(b.x, b.y, b.s * 0.4, b.s, 5, b.life * 6); else circle(b.x, b.y, b.s * b.life);
  }

  // candles planted by taps
  for (let i = tapCandles.length - 1; i >= 0; i--) {
    const c = tapCandles[i], age = millis() - c.born;
    if (age > 4500) { tapCandles.splice(i, 1); continue; }
    const h = m * 0.11 * easeOutBack(min(1, age / 260));
    drawingContext.globalAlpha = age > 3800 ? 1 - (age - 3800) / 700 : 1;
    candle(c.x, c.y + h / 2, h, t, c.x, c.c);
    drawingContext.globalAlpha = 1;
  }

  // photo viewer
  lb.t = constrain(lb.t + (lb.idx >= 0 ? 0.07 : -0.1), 0, 1);
  if (lb.t > 0) drawLightbox(lb.last, lb.t, t);
  if (lb.idx >= 0 && frameCount % 5 === 0) rain(2);

  // confetti (always on top)
  if (confs.length > 500) confs.splice(0, confs.length - 500);
  for (let i = confs.length - 1; i >= 0; i--) {
    const c = confs[i];
    c.vx *= 0.985; c.vy = (c.vy + 0.16) * 0.985;
    c.x += c.vx + sin(c.ph + frameCount * 0.1) * 0.6; c.y += c.vy; c.rot += c.vr; c.life -= 0.006;
    if (c.life <= 0 || c.y > H + 30) { confs.splice(i, 1); continue; }
    drawingContext.globalAlpha = min(1, c.life / 0.3);
    fill(c.c); push(); translate(c.x, c.y); rotate(c.rot); scale(1, cos(c.fl + frameCount * c.fs));
    if (c.sq) rect(-c.w / 2, -c.h / 2, c.w, c.h); else circle(0, 0, c.w * 0.8);
    pop();
  }
  drawingContext.globalAlpha = 1;

  // music hint until audio starts (browsers need a tap first)
  if (song && song.paused) {
    drawingContext.globalAlpha = 0.6 + 0.4 * sin(t * 4); fill(CREAM);
    textAlign(RIGHT, CENTER); textSize(min(18, W * 0.035)); text('♪ TAP FOR MUSIC', W - 14, H * 0.935);
    drawingContext.globalAlpha = 1;
  }
}

// ---------- photo viewer: polaroid "cake" with candles ----------
function drawLightbox(i, k, t) {
  const im = groups[i].img; if (!im || !im.width) return;
  const W = width, H = height;
  fill(8, 12, 32, 225 * k); rect(0, 0, W, H);
  const s = min(W * 0.86 / im.width, H * 0.62 / im.height), pw = im.width * s, ph = im.height * s;
  const pad = 14, bot = 46, fw = pw + pad * 2, fh = ph + pad + bot, ch = min(70, H * 0.09);
  push(); translate(W / 2, H * 0.57); rotate(-0.03 * (1 - k) + sin(t) * 0.008); scale(easeOutBack(k));
  drawingContext.globalAlpha = k;
  fill(0, 90); rect(-fw / 2 + 8, -fh / 2 + 10, fw, fh, 6);
  fill(CREAM); rect(-fw / 2, -fh / 2, fw, fh, 6);
  image(im, -pw / 2, -fh / 2 + pad, pw, ph);
  fill('#e8472b'); textAlign(CENTER, CENTER); textSize(min(22, fw * 0.06)); text('HAPPY BIRTHDAY!', 0, fh / 2 - bot / 2);
  for (let j = 0; j < 5; j++) candle(-fw / 2 + fw * (j + 0.5) / 5, -fh / 2, ch, t, j * 1.7, PAL[j % 6]);
  drawingContext.globalAlpha = 1;
  pop();
}

function candle(x, y, h, t, seed, col) {
  const w = h * 0.2;
  fill(col); rect(x - w / 2, y - h, w, h, 2);
  fill(CREAM); for (let i = 0; i < 3; i++) rect(x - w / 2, y - h + h * 0.2 + i * h * 0.25, w, h * 0.08);
  fill('#2a2a2a'); rect(x - 1, y - h - 5, 2, 5);
  const fl = 1 + 0.25 * sin(t * 14 + seed) + 0.12 * sin(t * 23 + seed * 2), fy = y - h - 5 - h * 0.1 * fl, sx = sin(t * 9 + seed) * 1.5;
  fill(255, 170, 40, 45); circle(x, fy, h * 1.1 * fl);
  fill(255, 210, 70, 110); circle(x, fy, h * 0.55 * fl);
  fill('#ffd23f'); ellipse(x + sx, fy, h * 0.2, h * 0.4 * fl);
  fill('#fff6d6'); ellipse(x + sx, fy + h * 0.04, h * 0.09, h * 0.2 * fl);
}
function easeOutBack(k) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * pow(k - 1, 3) + c1 * pow(k - 1, 2); }

// ---------- background birth date, tiled and drifting ----------
function dateWall(t, W, H) {
  const sz = max(W, H) * 0.16, gx = sz * 3.6, gy = sz * 1.25, R = sqrt(W * W + H * H) / 2 + gx * 0.5;
  push(); translate(W / 2, H / 2); rotate(-0.2);
  textSize(sz); textAlign(CENTER, CENTER); strokeJoin(ROUND);
  for (let j = -ceil(R / gy); j <= ceil(R / gy); j++) {
    const dir = j % 2 ? -1 : 1, off = ((t * 8 * dir) % gx) + (j % 2 ? gx / 2 : 0);   // slow drift
    drawingContext.globalAlpha = 0.16; fill(PAL[(j + 12) % 6]); stroke(PAL[(j + 12) % 6]); strokeWeight(sz * 0.05); // bold
    for (let i = -ceil(R / gx) - 1; i <= ceil(R / gx) + 1; i++) text(DATE, i * gx + off, j * gy);
  }
  drawingContext.globalAlpha = 1; noStroke(); pop();
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

let STRETCH = 1;
function fitSize(lines, maxW, maxSz) {
  textSize(100);
  const w = max(lines.map(l => textWidth(l))) * STRETCH;
  return min(maxSz, 100 * maxW / w);
}

function bounceText(s, cx, y, sz, t, spd) {
  textSize(sz); textAlign(LEFT, CENTER);
  let x = cx - textWidth(s) * STRETCH / 2;
  const cols = ['#e8478f', '#f5a30f', '#1fb5ad'];
  for (const ch of s) {
    const yy = y + sin(t * spd + x * 0.02) * sz * 0.1;
    push(); translate(x, yy); scale(STRETCH, 1);
    for (let i = 3; i >= 1; i--) { fill(cols[i - 1]); text(ch, i * sz * 0.035, i * sz * 0.035); }
    fill(CREAM); text(ch, 0, 0);
    pop();
    x += textWidth(ch) * STRETCH;
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
