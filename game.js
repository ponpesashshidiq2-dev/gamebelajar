'use strict';

/* ==================== UTIL ==================== */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = randi(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function rr(c, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ==================== BANK SOAL AWAL ==================== */
const DEFAULT_QUESTIONS = [
  { q: 'Berapa hasil dari 12 x 8?', opts: ['86', '96', '106', '94'], ans: 1, subj: 'Matematika' },
  { q: 'Bilangan prima berikut adalah...', opts: ['21', '27', '29', '33'], ans: 2, subj: 'Matematika' },
  { q: 'Hasil dari 144 : 12 adalah...', opts: ['10', '11', '12', '14'], ans: 2, subj: 'Matematika' },
  { q: '0,75 jika ditulis dalam bentuk pecahan adalah...', opts: ['3/4', '7/5', '4/3', '75/10'], ans: 0, subj: 'Matematika' },
  { q: 'Akar kuadrat dari 169 adalah...', opts: ['11', '12', '13', '14'], ans: 2, subj: 'Matematika' },
  { q: 'Bagian tumbuhan yang menyerap air dari tanah adalah...', opts: ['Daun', 'Akar', 'Batang', 'Bunga'], ans: 1, subj: 'IPA' },
  { q: 'Proses tumbuhan membuat makanan disebut...', opts: ['Fotosintesis', 'Respirasi', 'Transpirasi', 'Osmosis'], ans: 0, subj: 'IPA' },
  { q: 'Satuan SI untuk mengukur gaya adalah...', opts: ['Joule', 'Watt', 'Newton', 'Pascal'], ans: 2, subj: 'IPA' },
  { q: 'Planet terbesar dalam tata surya adalah...', opts: ['Bumi', 'Saturnus', 'Mars', 'Jupiter'], ans: 3, subj: 'IPA' },
  { q: 'Sinonim dari kata "ramah" adalah...', opts: ['Sombong', 'Sopan', 'Galak', 'Pemalu'], ans: 1, subj: 'B. Indonesia' },
  { q: 'Pembacaan jam 14.30 adalah...', opts: ['Setengah tiga sore', 'Setengah empat sore', 'Tiga lewat sepuluh', 'Setengah tiga pagi'], ans: 0, subj: 'B. Indonesia' },
  { q: '"Dia pergi ke pasar." Kata kerja pada kalimat tersebut adalah...', opts: ['Dia', 'Pergi', 'Ke', 'Pasar'], ans: 1, subj: 'B. Indonesia' },
  { q: 'Huruf vokal dalam bahasa Inggris adalah...', opts: ['a, e, i, o, u', 'b, c, d, f, g', 'y, z, x, w, v', 'h, j, k, l, m'], ans: 0, subj: 'B. Inggris' },
  { q: 'Arti kata "library" adalah...', opts: ['Laboratorium', 'Perpustakaan', 'Perkantoran', 'Toko buku'], ans: 1, subj: 'B. Inggris' },
  { q: 'Bentuk jam 3:15 dalam bahasa Inggris adalah...', opts: ['Quarter past three', 'Quarter to three', 'Half past three', 'Three o\'clock'], ans: 0, subj: 'B. Inggris' },
  { q: 'Ibu kota negara Indonesia adalah...', opts: ['Bandung', 'Surabaya', 'Jakarta', 'Medan'], ans: 2, subj: 'Umum' },
  { q: 'Semboyan negara Indonesia adalah...', opts: ['Bhinneka Tunggal Ika', 'Merdeka atau Mati', 'Juang Bahagia', 'Pancasila Sakti'], ans: 0, subj: 'Umum' },
  { q: 'Rumus luas lingkaran adalah...', opts: ['2 x pi x r', 'pi x r', 'pi x r kuadrat', '4 x pi x r kuadrat'], ans: 2, subj: 'Matematika' }
];

/* ==================== PENYIMPANAN ==================== */
const LS = { best: 'lb_best', bank: 'lb_bank', interval: 'lb_interval', kelas: 'lb_kelas', session: 'lb_session', admin: 'lb_admin', scores: 'lb_scores', music: 'lb_music' };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* ==================== LOGIN (ADMIN & PEMAIN) ==================== */
const DEFAULT_ADMIN = { user: 'admin', pass: 'admin123' };
const AUTH = { role: 'player', name: '' };
function adminCreds() { return store.get(LS.admin, DEFAULT_ADMIN); }
function isAdmin() { return AUTH.role === 'admin'; }
function setSession(role, name) {
  AUTH.role = role;
  AUTH.name = name;
  store.set(LS.session, { role: role, name: name });
}
function loginPlayer(name) {
  const n = String(name || '').trim().slice(0, 24);
  if (!n) return { ok: false, msg: 'Nama pemain tidak boleh kosong.' };
  setSession('player', n);
  showMenu();
  return { ok: true };
}
function loginAdmin(user, pass) {
  const c = adminCreds();
  if (String(user).trim() !== c.user || String(pass) !== c.pass)
    return { ok: false, msg: 'Nama pengguna atau kata sandi salah.' };
  setSession('admin', c.user);
  showMenu();
  return { ok: true };
}
function logout() {
  store.del(LS.session);
  AUTH.role = 'player'; AUTH.name = '';
  G.mode = 'login';
  $('#menu').classList.add('hidden');
  $('#hud').classList.add('hidden');
  $('#login').classList.remove('hidden');
  $('#loginError').textContent = '';
  $('#loginPass').value = '';
}
function showMenu() {
  G.mode = 'menu';
  AudioEngine.stop();
  $('#login').classList.add('hidden');
  $('#menu').classList.remove('hidden');
  $('#hud').classList.add('hidden');
  $('#gameOver').classList.add('hidden');
  $('#questionModal').classList.add('hidden');
  $('#pauseModal').classList.add('hidden');
  applyRoleUI();
  refreshMenu();
}
function applyRoleUI() {
  const admin = isAdmin();
  $('#btnImport').classList.toggle('hidden', !admin);
  $('#btnBank').classList.toggle('hidden', !admin);
  $('#bankChip').classList.toggle('hidden', !admin);
  $('#intervalField').classList.toggle('hidden', !admin);
  $('#adminTools').classList.toggle('hidden', !admin);
  $('#passBox').classList.toggle('hidden', !admin);
  $('#importTitle').textContent = admin ? 'Kelola Soal' : 'Bank Soal';
  $('#whoami').innerHTML = (admin ? 'ADMIN: ' : 'PEMAIN: ') + '<b>' + escapeHtml(AUTH.name) + '</b>';
}

/* ==================== STATE ==================== */
const KELAS_LEVEL = {
  1: { speed: 10, max: 16, gap: 20, lives: 5 },
  2: { speed: 11, max: 18, gap: 19, lives: 5 },
  3: { speed: 13, max: 21, gap: 16, lives: 4 },
  4: { speed: 14, max: 23, gap: 15, lives: 4 },
  5: { speed: 15, max: 25, gap: 14, lives: 3 },
  6: { speed: 16, max: 27, gap: 13, lives: 3 }
};
function levelOf(k) { return KELAS_LEVEL[k] || KELAS_LEVEL[1]; }

const G = {
  mode: 'login',
  kelas: clamp(parseInt(store.get(LS.kelas, 1), 10) || 1, 1, 6),
  interval: store.get(LS.interval, 300),
  dist: 0, speed: 13, time: 0,
  score: 0, coins: 0, lives: 3,
  lane: 0, x: 0, y: 0, vy: 0,
  objs: [], parts: [], spawnAt: 0,
  nextQ: 300, qStartInterval: 300,
  bank: [], queue: [], qi: 0,
  asked: 0, firstTry: 0, miss: 0, tries: 0,
  current: null, qOpenAt: 0, answered: false, wrongAt: 0,
  invuln: 0, shake: 0, flash: 0,
  puJump: 0, puCoin: 0
};

const BANK_BY_KELAS = (typeof BANK_BY_CLASS !== 'undefined') ? BANK_BY_CLASS : null;

function shuffleOptions(o) {
  const perm = shuffle(o.opts.map((_, i) => i));
  return { q: o.q, opts: perm.map(i => o.opts[i]), ans: perm.indexOf(o.ans), subj: o.subj, src: o.src, kelas: o.kelas };
}
function buildBank() {
  const kelas = G.kelas;
  const custom = store.get(LS.bank, []).filter(c => Number(c.kelas || kelas) === kelas);
  const raw = (BANK_BY_KELAS && BANK_BY_KELAS[kelas]) || DEFAULT_QUESTIONS;
  const base = raw.map(normalizeDefault);
  const ok = [];
  custom.forEach(c => { const n = normalizeAny(c); if (n) ok.push(n); });
  G.bank = ok.concat(base).map(shuffleOptions);
  G.queue = shuffle(G.bank.map((_, i) => i));
  G.qi = 0;
}
function normalizeDefault(o) {
  return { q: o.q, opts: o.opts.slice(), ans: o.ans, subj: o.subj || 'Umum', src: 'bawaan' };
}
function nextQuestionIndex() {
  if (!G.bank.length) return -1;
  if (G.qi >= G.queue.length) { G.queue = shuffle(G.bank.map((_, i) => i)); G.qi = 0; }
  return G.queue[G.qi++];
}

/* ==================== CANVAS ==================== */
const canvas = $('#game');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
let R3 = null;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (R3) {
    R3.renderer.setPixelRatio(DPR);
    R3.renderer.setSize(W, H, false);
    R3.camera.aspect = W / H;
    R3.camera.updateProjectionMatrix();
    if (R3.flash) {
      const fd = 0.5, fh = 2 * fd * Math.tan(R3.camera.fov * Math.PI / 360);
      R3.flash.scale.set(fh * (W / H) * 1.1, fh * 1.1, 1);
    }
  }
}
window.addEventListener('resize', resize);
resize();

const Z_MAX = 58;
const PLAYER_D = 1.1;
function horizonY() { return H * 0.34; }
function kOf(d) { return 1 / (1 + Math.max(0, d) * 0.16); }
function roadHalf(k) { return W * 0.5 * (0.17 + 0.5 * k); }
function project(lx, d) {
  const k = kOf(d);
  const hz = horizonY();
  return { x: W / 2 + lx * roadHalf(k) * 0.62, y: hz + (H - hz) * k, k: k };
}

/* ==================== GAME FLOW ==================== */
function resetGame() {
  const d = levelOf(G.kelas);
  G.dist = 0; G.speed = d.speed; G.time = 0;
  G.score = 0; G.coins = 0; G.lives = d.lives;
  G.lane = 0; G.x = 0; G.y = 0; G.vy = 0;
  G.objs = []; G.parts = []; G.spawnAt = 60;
  G.qStartInterval = G.interval;
  G.nextQ = Math.min(500, G.interval * 0.7);
  G.asked = 0; G.firstTry = 0; G.miss = 0;
  G.invuln = 0; G.shake = 0; G.flash = 0;
  G.puJump = 0; G.puCoin = 0;
  G.queue = shuffle(G.bank.map((_, i) => i)); G.qi = 0;
}
function startGame() {
  if (G.mode === 'login') return;
  resetGame();
  G.mode = 'running';
  $('#menu').classList.add('hidden');
  $('#hud').classList.remove('hidden');
  $('#gameOver').classList.add('hidden');
  $('#pauseModal').classList.add('hidden');
  AudioEngine.start();
}
function toMenu() {
  showMenu();
}
function saveScore() {
  const arr = store.get(LS.scores, []);
  arr.push({
    name: AUTH.name || 'Tamu',
    role: AUTH.role,
    kelas: G.kelas,
    score: Math.floor(G.score),
    at: Date.now()
  });
  arr.sort((a, b) => b.score - a.score);
  store.set(LS.scores, arr.slice(0, 30));
}
function renderScores() {
  const ul = $('#scoreList');
  if (!ul) return;
  const arr = store.get(LS.scores, []).slice(0, 5);
  ul.innerHTML = arr.length
    ? arr.map((s, i) => `<li><b>#${i + 1}</b> ${escapeHtml(s.name)} <span class="src">Kelas ${s.kelas} · ${s.score} poin</span></li>`).join('')
    : '<li class="src">Belum ada skor. Jadilah yang pertama!</li>';
}
function gameOver() {
  G.mode = 'over';
  AudioEngine.stop();
  const best = Math.max(store.get(LS.best, 0), Math.floor(G.score));
  store.set(LS.best, best);
  saveScore();
  renderScores();
  const acc = G.asked ? Math.round(G.firstTry / G.asked * 100) : 0;
  $('#goStats').innerHTML = [
    ['Jarak', Math.floor(G.dist) + ' m'],
    ['Skor', Math.floor(G.score)],
    ['Koin', G.coins],
    ['Soal dijawab benar', G.firstTry + ' / ' + G.asked],
    ['Akurasi langsung', acc + '%'],
    ['Rekor', best]
  ].map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
  $('#gameOver').classList.remove('hidden');
}
function pauseGame() {
  if (G.mode !== 'running') return;
  G.mode = 'paused';
  AudioEngine.setPaused(true);
  $('#pauseModal').classList.remove('hidden');
}
function resumeGame() {
  if (G.mode !== 'paused') return;
  G.mode = 'running';
  AudioEngine.setPaused(false);
  $('#pauseModal').classList.add('hidden');
}

/* ==================== SOAL ==================== */
function openQuestion() {
  const idx = nextQuestionIndex();
  if (idx < 0) { G.nextQ = G.dist + G.interval * 2; return; }
  G.current = G.bank[idx];
  G.mode = 'question';
  G.tries = 0; G.answered = false;
  G.qOpenAt = performance.now();
  G.qStartInterval = G.qStartInterval || G.interval;

  $('#qSubject').textContent = 'Kelas ' + G.kelas + ' · ' + G.current.subj;
  $('#qCounter').textContent = 'Soal ' + (G.asked + 1);
  $('#qText').textContent = G.current.q;
  $('#qFeedback').textContent = '';
  $('#qFeedback').className = 'feedback';
  $('#qBtnContinue').classList.add('hidden');

  const box = $('#qOptions');
  box.innerHTML = '';
  const keys = ['1', '2', '3', '4', '5', '6'];
  G.current.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="key">${keys[i] || (i + 1)}</span><span>${escapeHtml(o)}</span>`;
    b.addEventListener('click', () => answer(i, b));
    box.appendChild(b);
  });
  $('#questionModal').classList.remove('hidden');
  AudioEngine.stop();
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function answer(i, btn) {
  if (G.mode !== 'question' || G.answered) return;
  if (i === G.current.ans) {
    G.answered = true;
    G.asked++;
    const first = G.tries === 0;
    if (first) G.firstTry++;
    const bonus = first ? 50 : 20;
    G.score += bonus;
    btn.classList.add('correct');
    Array.from($('#qOptions').children).forEach(el => { el.disabled = true; });
    const fb = $('#qFeedback');
    fb.className = 'feedback good';
    fb.textContent = first ? `Benar! Jawaban pertama kali. +${bonus} poin` : `Benar! +${bonus} poin`;
    $('#qBtnContinue').classList.remove('hidden');
    $('#qBtnContinue').focus();
    toast('Jawaban benar! Lanjut berlari', 'good');
    AudioEngine.sfx('good');
  } else {
    G.tries++;
    G.miss++;
    btn.classList.add('wrong');
    Array.from($('#qOptions').children).forEach(el => { el.disabled = true; });
    const qcard = $('.qcard');
    qcard.classList.remove('shake');
    void qcard.offsetWidth;
    qcard.classList.add('shake');
    const fb = $('#qFeedback');
    fb.className = 'feedback bad';
    fb.textContent = 'Jawaban salah! Permainan diulangi dari awal...';
    toast('Jawaban salah! Ulangi dari awal', 'bad');
    AudioEngine.sfx('bad');
    G.mode = 'wrong';
    G.wrongAt = performance.now();
  }
}
function continueRun() {
  if (G.mode !== 'question' || !G.answered) return;
  $('#questionModal').classList.add('hidden');
  G.mode = 'running';
  G.qStartInterval = G.interval * rand(0.9, 1.15);
  G.nextQ = G.dist + G.qStartInterval;
  G.score += 10;
  AudioEngine.start();
}

/* ==================== SPAWN ==================== */
const POWER_KINDS = ['jump', 'coin2'];
function spawnPattern() {
  const z = Z_MAX;
  const r = Math.random();
  const lanes = [-1, 0, 1];
  const free = randi(0, 2);
  const busy = lanes.filter(l => l !== free);

  // hadiah power-up sesekali di lajur bebas
  if (Math.random() < 0.30) {
    const kind = POWER_KINDS[randi(0, POWER_KINDS.length - 1)];
    G.objs.push({ type: 'power', kind: kind, lane: lanes[free], d: z + rand(2, 5), hit: false, spin: rand(0, 6) });
  }

  if (r < 0.30) {
    // deret koin di satu lajur
    const l = lanes[randi(0, 2)];
    for (let i = 0; i < 5; i++) G.objs.push({ type: 'coin', lane: l, d: z + i * 2.2, hit: false });
  } else if (r < 0.55) {
    // 1 penghalang + koin lajur lain
    const l = lanes[randi(0, 2)];
    G.objs.push({ type: 'barrier', lane: l, d: z, hit: false });
    const l2 = lanes.filter(x => x !== l)[randi(0, 1)];
    for (let i = 0; i < 4; i++) G.objs.push({ type: 'coin', lane: l2, d: z + 2 + i * 2.2, hit: false });
  } else if (r < 0.78) {
    // 2 penghalang, satu lajur bebas berisi koin
    busy.forEach(l => G.objs.push({ type: 'barrier', lane: l, d: z + rand(0, 3), hit: false }));
    for (let i = 0; i < 4; i++) G.objs.push({ type: 'coin', lane: free, d: z + 1 + i * 2.2, hit: false });
  } else {
    // kereta panjang di satu lajur
    const l = lanes[randi(0, 2)];
    G.objs.push({ type: 'train', lane: l, d: z, len: 9, hit: false });
    const others = lanes.filter(x => x !== l);
    const cl = others[randi(0, 1)];
    for (let i = 0; i < 4; i++) G.objs.push({ type: 'coin', lane: cl, d: z + i * 2.4, hit: false });
  }
}

/* ==================== UPDATE ==================== */
function update(dt) {
  if (G.mode === 'menu') {
    G.dist += 7 * dt;
    return;
  }
  if (G.mode === 'question') {
    $('#qTimer').textContent = Math.floor((performance.now() - G.qOpenAt) / 1000) + 's';
    return;
  }
  if (G.mode === 'wrong') {
    if (performance.now() - G.wrongAt > 1600) {
      $('#questionModal').classList.add('hidden');
      startGame();
      toast('Jawaban salah! Permainan diulangi dari awal', 'bad');
    }
    return;
  }
  if (G.mode !== 'running') return;

  const d = levelOf(G.kelas);
  G.time += dt;
  G.speed = Math.min(d.max, d.speed + dt * 0.16);
  G.dist += G.speed * dt;
  G.score += G.speed * dt * 1.2;

  // gerak lajur
  const target = G.lane;
  G.x += (target - G.x) * Math.min(1, dt * 12);

  // lompat
  if (G.y > 0 || G.vy > 0) {
    G.vy -= 8.4 * dt;
    G.y += G.vy * dt;
    if (G.y <= 0) { G.y = 0; G.vy = 0; }
  }

  if (G.invuln > 0) G.invuln -= dt;
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 40);
  if (G.puJump > 0) G.puJump = Math.max(0, G.puJump - dt);
  if (G.puCoin > 0) G.puCoin = Math.max(0, G.puCoin - dt);

  // spawn
  if (G.dist >= G.spawnAt) {
    spawnPattern();
    G.spawnAt = G.dist + d.gap * rand(0.85, 1.25);
  }

  // objek bergerak relatif
  for (const o of G.objs) o.d -= G.speed * dt;
  G.objs = G.objs.filter(o => o.d > -14 && !o.gone);

  // tabrakan
  for (const o of G.objs) {
    if (o.hit) continue;
    const sameLane = Math.abs(G.x - o.lane) < 0.55;
    if (!sameLane) continue;
    let near = false;
    if (o.type === 'train') near = o.d < PLAYER_D + 0.5 && o.d + (o.len || 0) > PLAYER_D - 0.5;
    else near = o.d < PLAYER_D + 0.5 && o.d > PLAYER_D - 0.7;
    if (!near) continue;

    if (o.type === 'coin') {
      o.hit = true; o.gone = true;
      const dbl = G.puCoin > 0;
      const gain = dbl ? 2 : 1;
      G.coins += gain;
      G.score += 10 * gain;
      pop(o.lane, dbl ? 'Koin ×2 +20' : 'Koin +10', '#ffd93d');
      AudioEngine.sfx(dbl ? 'coin2' : 'coin');
      continue;
    }
    if (o.type === 'power') {
      o.hit = true; o.gone = true;
      if (o.kind === 'jump') {
        G.puJump = 10;
        pop(o.lane, 'LONCAT TINGGI!', '#4ade80');
        toast('Hadiah: Lompatan tinggi 10 detik!', 'good');
      } else {
        G.puCoin = 12;
        pop(o.lane, 'KOIN ×2!', '#fde047');
        toast('Hadiah: Koin ganda 12 detik!', 'good');
      }
      AudioEngine.sfx('power');
      continue;
    }
    const cleared = (o.type === 'barrier' && G.y > 0.45) ||
      (o.type === 'train' && G.y > 1.55);
    if (cleared) continue;
    if (G.invuln > 0) continue;

    o.hit = true;
    if (o.type === 'train') o.d = -(o.len || 0) - 14;
    else o.gone = true;
    G.lives--;
    G.invuln = 1.4;
    G.shake = 14;
    G.flash = 0.5;
    pop(G.lane, 'Tabrak!', '#ff6b6b');
    toast('Hati-hati! Nyawa berkurang', 'bad');
    AudioEngine.sfx('hit');
    if (G.lives <= 0) { AudioEngine.sfx('over'); gameOver(); return; }
  }

  // pertanyaan
  if (G.dist >= G.nextQ) openQuestion();
  updateHud();
}
function pop(lane, text, color) {
  const p = project(lane, PLAYER_D);
  G.parts.push({ x: p.x, y: p.y - H * 0.16, vy: -60, life: 1, text: text, color: color });
}
function updateParts(dt) {
  for (const p of G.parts) { p.y += p.vy * dt; p.life -= dt; }
  G.parts = G.parts.filter(p => p.life > 0);
}

function updateHud() {
  $('#hudWho').textContent = (isAdmin() ? 'ADMIN ' : 'PEMAIN ') + (AUTH.name || 'Tamu');
  $('#hudKelas').textContent = 'KELAS ' + G.kelas;
  $('#hudScore').textContent = 'SKOR ' + Math.floor(G.score);
  $('#hudCoins').textContent = 'KOIN ' + G.coins;
  $('#hudDist').textContent = Math.floor(G.dist) + ' M';
  $('#hudTime').textContent = 'WAKTU ' + Math.floor(G.time) + 's';
  const livesEl = $('#hudLives');
  livesEl.textContent = 'NYAWA ' + '\u25AE'.repeat(Math.max(0, G.lives));
  livesEl.classList.toggle('alert', G.lives <= 1);

  const remain = G.nextQ - G.dist;
  const pct = clamp(1 - remain / Math.max(1, G.qStartInterval), 0, 1);
  $('#qFill').style.width = (pct * 100).toFixed(1) + '%';
  $('#qLabel').textContent = 'Soal berikutnya dalam ' + Math.max(0, Math.ceil(remain)) + ' m';

  const puJ = $('#hudPuJump'), puC = $('#hudPuCoin');
  puJ.classList.toggle('hidden', G.puJump <= 0);
  if (G.puJump > 0) puJ.textContent = '↑ LOMPAT ' + Math.ceil(G.puJump) + 's';
  puC.classList.toggle('hidden', G.puCoin <= 0);
  if (G.puCoin > 0) puC.textContent = 'KOIN ×2 ' + Math.ceil(G.puCoin) + 's';
}

/* ==================== RENDER ==================== */
const SPRITES = {};
(function loadSprites() {
  if (typeof Image === 'undefined') return;
  const list = {
    player: 'sprites/player.svg',
    playerPhoto: 'sprites/player-school.png',
    train: 'sprites/train.svg',
    barrier: 'sprites/barrier.svg',
    coin: 'sprites/coin.svg'
  };
  Object.keys(list).forEach(k => {
    const img = new Image();
    img.onload = () => { SPRITES[k] = img; };
    img.src = list[k];
  });
})();

const buildings = [];
(function initBuildings() {
  for (let i = 0; i < 26; i++) {
    buildings.push({ off: rand(0, 1), w: rand(0.03, 0.075), h: rand(0.05, 0.2), c: i % 3 });
  }
})();

function render() {
  if (R3) { render3D(); return; }
  const hz = horizonY();
  const sky = ctx.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, '#2a3f8f');
  sky.addColorStop(0.6, '#4f74d6');
  sky.addColorStop(1, '#8fb6f0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, hz + 2);

  // matahari
  ctx.fillStyle = 'rgba(255,236,150,.9)';
  ctx.beginPath(); ctx.arc(W * 0.78, hz * 0.45, Math.min(W, H) * 0.06, 0, Math.PI * 2); ctx.fill();

  // gedung
  const scroll = (G.dist * 0.0016) % 1;
  const cols = ['#243055', '#1d2747', '#2b3a63'];
  buildings.forEach((b, i) => {
    let x = ((b.off - scroll + 2) % 1) * (W + 120) - 60;
    const bw = b.w * W, bh = b.h * hz * 1.5;
    ctx.fillStyle = cols[b.c];
    ctx.fillRect(x, hz - bh, bw, bh);
    ctx.fillStyle = 'rgba(255,225,140,.5)';
    for (let r = 0; r < 4; r++)
      for (let c2 = 0; c2 < 3; c2++)
        if ((i + r + c2) % 3 === 0)
          ctx.fillRect(x + 6 + c2 * (bw / 3.4), hz - bh + 8 + r * (bh / 5), 4, 6);
  });

  // tanah
  const gr = ctx.createLinearGradient(0, hz, 0, H);
  gr.addColorStop(0, '#3f7d43');
  gr.addColorStop(1, '#2c5c31');
  ctx.fillStyle = gr;
  ctx.fillRect(0, hz, W, H - hz);

  drawRoad();

  // objek: jauh dulu
  const objs = G.objs.slice().sort((a, b) => b.d - a.d);
  for (const o of objs) {
    if (o.d > Z_MAX + 16 || o.d < -6) continue;
    if (o.type === 'coin') drawCoin(o);
    else if (o.type === 'barrier') drawBarrier(o);
    else if (o.type === 'train') drawTrain(o);
    else if (o.type === 'power') drawPower(o);
  }

  if (G.mode !== 'menu') drawPlayer();

  for (const p of G.parts) {
    ctx.globalAlpha = clamp(p.life, 0, 1);
    ctx.fillStyle = p.color;
    ctx.font = '800 16px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
  }

  if (G.flash > 0) {
    ctx.fillStyle = `rgba(255,60,60,${G.flash * 0.5})`;
    ctx.fillRect(0, 0, W, H);
    G.flash = Math.max(0, G.flash - 0.03);
  }
}

function drawRoad() {
  const near = 0, far = Z_MAX;
  const eL0 = project(-1.8, near), eR0 = project(1.8, near);
  const eL1 = project(-1.8, far), eR1 = project(1.8, far);

  // alas balast (kerikil)
  ctx.fillStyle = '#7c7568';
  ctx.beginPath();
  ctx.moveTo(eL1.x, eL1.y); ctx.lineTo(eR1.x, eR1.y);
  ctx.lineTo(eR0.x, eR0.y); ctx.lineTo(eL0.x, eL0.y);
  ctx.closePath(); ctx.fill();

  // bintik kerikil yang ikut bergulir
  for (let i = 0; i < 110; i++) {
    const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const r2 = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const u = r1 - Math.floor(r1), v = r2 - Math.floor(r2);
    const lx = u * 3.6 - 1.8;
    const d = ((v * Z_MAX - G.dist) % Z_MAX + Z_MAX) % Z_MAX;
    const p = project(lx, d);
    if (p.k <= 0.02) continue;
    const r = Math.max(1, p.k * H * 0.011);
    ctx.fillStyle = u > 0.5 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.22)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // bantalan rel (sleepers) tiap lajur
  const sPeriod = 1.7;
  const sOff = sPeriod - (G.dist % sPeriod);
  for (let d = sOff - sPeriod; d < Z_MAX; d += sPeriod) {
    const idx = Math.floor((d + G.dist) / sPeriod);
    const col = idx % 2 ? '#5d4732' : '#4f3c2a';
    [-1, 0, 1].forEach(lx => {
      const a = project(lx - 0.44, d), b = project(lx + 0.44, d);
      const c = project(lx + 0.44, d + 0.7), e = project(lx - 0.44, d + 0.7);
      if (b.k <= 0.02) return;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y); ctx.lineTo(e.x, e.y);
      ctx.closePath(); ctx.fill();
    });
  }

  // rel baja: bayangan + badan + sorot
  function railQuad(lx, hw, dy, color) {
    const a = project(lx - hw, 0), b = project(lx + hw, 0);
    const c = project(lx + hw, Z_MAX), e = project(lx - hw, Z_MAX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y + dy); ctx.lineTo(c.x, c.y + dy);
    ctx.lineTo(b.x, b.y + dy); ctx.lineTo(a.x, a.y + dy);
    ctx.closePath(); ctx.fill();
  }
  [-1, 0, 1].forEach(lx => {
    [lx - 0.3, lx + 0.3].forEach(rx => {
      railQuad(rx, 0.07, 2, 'rgba(0,0,0,.35)');
      railQuad(rx, 0.055, 0, '#8a919c');
      railQuad(rx, 0.032, 0, '#e3e8ee');
    });
  });

  // strip merah-putih di bahu rel
  const off2 = 5 - (G.dist % 5);
  for (let d = off2; d < Z_MAX; d += 5) {
    [-1.8, 1.8].forEach(lx => {
      const a = project(lx, d), b = project(lx, d + 2.5);
      const cIdx = Math.floor((d + G.dist) / 5) % 2;
      ctx.strokeStyle = cIdx ? '#ffffff' : '#ef4444';
      ctx.lineWidth = Math.max(2, a.k * 9);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
  }
}

function drawCoin(o) {
  const p = project(o.lane, o.d);
  if (p.k <= 0.02) return;
  const r = Math.max(2, p.k * H * 0.035);
  const cy = p.y - p.k * H * 0.07 - r;
  const sq = Math.abs(Math.sin(performance.now() / 260 + o.d));
  if (SPRITES.coin) {
    const w = r * 2 * (0.45 + 0.55 * sq), h = r * 2;
    ctx.save();
    ctx.translate(p.x, cy);
    ctx.drawImage(SPRITES.coin, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(p.x, cy);
  ctx.scale(0.45 + 0.55 * sq, 1);
  ctx.fillStyle = '#ffcf3f';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c99700';
  ctx.lineWidth = Math.max(1, r * 0.16);
  ctx.stroke();
  ctx.fillStyle = '#fff3b8';
  ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBarrier(o) {
  const p = project(o.lane, o.d);
  if (p.k <= 0.02) return;
  const u = p.k * H;
  if (SPRITES.barrier) {
    const w = u * 0.2, h = u * 0.14;
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, w * 0.5, h * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(SPRITES.barrier, p.x - w / 2, p.y - h, w, h);
    return;
  }
  const w = u * 0.17, h = u * 0.11;
  const x = p.x - w / 2, y = p.y - h;
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y, w * 0.55, h * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  rr(ctx, x, y, w, h, u * 0.012);
  ctx.fillStyle = '#ff8a3d'; ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, u * 0.022);
  for (let i = -2; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * w * 0.34, y + h);
    ctx.lineTo(x + i * w * 0.34 + w * 0.4, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5;
  rr(ctx, x, y, w, h, u * 0.012); ctx.stroke();
  // kaki
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(x + w * 0.1, y + h, w * 0.1, h * 0.35);
  ctx.fillRect(x + w * 0.8, y + h, w * 0.1, h * 0.35);
}

function drawPower(o) {
  const p = project(o.lane, o.d);
  if (p.k <= 0.02) return;
  const r = Math.max(3, p.k * H * 0.05);
  const cy = p.y - p.k * H * 0.1 - r;
  const t = performance.now() / 1000;
  const bob = Math.sin(t * 4 + (o.spin || 0)) * r * 0.18;
  const isJump = o.kind === 'jump';
  const col = isJump ? '#4ade80' : '#fde047';
  const colD = isJump ? '#16a34a' : '#f59e0b';

  ctx.save();
  ctx.translate(p.x, cy + bob);
  ctx.rotate(Math.sin(t * 2 + (o.spin || 0)) * 0.14);

  // glow
  ctx.shadowColor = col;
  ctx.shadowBlur = r * 1.1;

  // kotak hadiah bulat
  rr(ctx, -r, -r, r * 2, r * 2, r * 0.34);
  ctx.fillStyle = col;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1.5, r * 0.16);
  ctx.strokeStyle = colD;
  ctx.stroke();

  ctx.fillStyle = '#0b1a10';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (isJump) {
    // panah atas
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(r * 0.5, -r * 0.05);
    ctx.lineTo(r * 0.2, -r * 0.05);
    ctx.lineTo(r * 0.2, r * 0.55);
    ctx.lineTo(-r * 0.2, r * 0.55);
    ctx.lineTo(-r * 0.2, -r * 0.05);
    ctx.lineTo(-r * 0.5, -r * 0.05);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.font = '900 ' + Math.round(r * 0.95) + 'px Segoe UI, Arial';
    ctx.fillStyle = '#7c4a00';
    ctx.fillText('×2', 0, r * 0.06);
  }
  ctx.restore();
}

function drawTrain(o) {
  const pN = project(o.lane, o.d);
  const pF = project(o.lane, o.d + (o.len || 8));
  if (pN.k <= 0.02) return;
  const wN = pN.k * H * 0.21, hN = pN.k * H * 0.36;
  const wF = pF.k * H * 0.21, hF = pF.k * H * 0.36;

  // --- sisi panjang (putih dengan strip merah) ---
  const sideTop = { x: pF.x + wF / 2, y: pF.y - hF };
  const sideBot = { x: pF.x + wF / 2, y: pF.y };
  const nearTop = { x: pN.x + wN / 2, y: pN.y - hN };
  const nearBot = { x: pN.x + wN / 2, y: pN.y };

  function quad(a, b, c, d, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
    ctx.closePath(); ctx.fill();
  }

  // atap
  quad(
    { x: pN.x - wN / 2, y: pN.y - hN }, { x: pN.x + wN / 2, y: pN.y - hN },
    { x: pF.x + wF / 2, y: pF.y - hF }, { x: pF.x - wF / 2, y: pF.y - hF },
    '#d9d4cb'
  );

  // sisi kanan: bodi putih
  quad(nearTop, sideTop, sideBot, nearBot, '#f7f4ef');
  // strip merah di sisi (14%-100% tinggi)
  const lerpP = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const band = (t0, t1, color) => {
    const a = lerpP(nearTop, nearBot, t0), b = lerpP(nearTop, nearBot, t1);
    const c = lerpP(sideTop, sideBot, t1), d = lerpP(sideTop, sideBot, t0);
    quad(a, b, c, d, color);
  };
  band(0.14, 0.36, '#2f3540');   // deret jendela
  band(0.55, 0.78, '#e8342c');   // strip merah
  band(0.78, 0.86, '#b71f19');   // garis merah tua
  band(0.9, 1.0, '#4b5563');     // sasis

  // muka depan
  const fx = pN.x - wN / 2, fy = pN.y - hN;
  if (SPRITES.train) {
    ctx.drawImage(SPRITES.train, fx, fy, wN, hN);
  } else {
    rr(ctx, fx, fy, wN, hN, wN * 0.16);
    ctx.fillStyle = '#f7f4ef'; ctx.fill();
    ctx.save();
    ctx.clip();
    // strip merah depan
    ctx.fillStyle = '#e8342c';
    ctx.fillRect(fx, fy + hN * 0.58, wN, hN * 0.26);
    // kaca depan ganda
    ctx.fillStyle = '#9fd8ff';
    rr(ctx, fx + wN * 0.12, fy + hN * 0.26, wN * 0.3, hN * 0.24, wN * 0.05); ctx.fill();
    rr(ctx, fx + wN * 0.56, fy + hN * 0.26, wN * 0.3, hN * 0.24, wN * 0.05); ctx.fill();
    // lampu kuning
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath(); ctx.arc(fx + wN * 0.26, fy + hN * 0.7, wN * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(fx + wN * 0.74, fy + hN * 0.7, wN * 0.09, 0, Math.PI * 2); ctx.fill();
    // lampu atas
    ctx.beginPath(); ctx.ellipse(fx + wN * 0.5, fy + hN * 0.1, wN * 0.1, hN * 0.05, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    rr(ctx, fx, fy, wN, hN, wN * 0.16);
    ctx.strokeStyle = '#cfc8bd'; ctx.lineWidth = Math.max(1.5, pN.k * 3); ctx.stroke();
    // sasis depan
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(fx + wN * 0.08, pN.y - hN * 0.1, wN * 0.84, hN * 0.1);
  }
}

function drawPlayer() {
  const feet = project(0, PLAYER_D).y;
  const p = project(G.x, PLAYER_D);
  const jumpPx = G.y * H * 0.22;
  const U = H * 0.17;
  const x = p.x, y = feet - jumpPx;
  const t = performance.now() / 1000;
  const running = G.mode === 'running';
  const swing = running ? Math.sin(t * 13) : 0;
  const blink = G.invuln > 0 && Math.floor(t * 12) % 2 === 0;

  ctx.save();
  if (blink) ctx.globalAlpha = 0.45;

  // bayangan
  ctx.fillStyle = `rgba(0,0,0,${0.35 - G.y * 0.18})`;
  ctx.beginPath();
  ctx.ellipse(x, feet, U * 0.3 * (1 - G.y * 0.2), U * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  if (SPRITES.playerPhoto || SPRITES.player) {
    const sp = SPRITES.playerPhoto || SPRITES.player;
    const hipF = SPRITES.playerPhoto ? 0.635 : 0.62;
    const iw = sp.naturalWidth || 1;
    const ih = sp.naturalHeight || 1;
    const aspect = iw / ih;
    const bob = running ? Math.abs(Math.sin(t * 13)) * U * 0.05 : 0;
    const tilt = clamp((G.lane - G.x) * 0.35, -0.28, 0.28);
    const fullH = U * 1.5;
    const bodyH = fullH * hipF;
    const legH = fullH * (1 - hipF);
    const w = fullH * aspect;
    const hipY = -legH;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);

    // kaki berlari
    const fw = U * 0.13, fh = U * 0.065;
    const lFX = -U * 0.07 + swing * U * 0.16;
    const rFX = U * 0.07 - swing * U * 0.16;
    const lFY = -Math.max(0, swing) * U * 0.1;
    const rFY = -Math.max(0, -swing) * U * 0.1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f2a44';
    ctx.lineWidth = Math.max(2, U * 0.115);
    ctx.beginPath();
    ctx.moveTo(-U * 0.07, hipY);
    ctx.lineTo(lFX, lFY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(U * 0.07, hipY);
    ctx.lineTo(rFX, rFY);
    ctx.stroke();
    ctx.fillStyle = '#e23b4c';
    ctx.beginPath(); ctx.ellipse(lFX, lFY - fh * 0.2, fw, fh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(rFX, rFY - fh * 0.2, fw, fh, 0, 0, Math.PI * 2); ctx.fill();

    // badan: foto dipotong di pinggul
    ctx.drawImage(sp, 0, 0, iw, ih * hipF, -w / 2, -fullH + bob, w, bodyH);

    ctx.restore();
    ctx.restore();
    return;
  }

  const hip = y - U * 0.42;
  const shoulder = y - U * 0.8;

  // kaki
  ctx.strokeStyle = '#1f2a44';
  ctx.lineWidth = U * 0.13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - U * 0.06, hip);
  ctx.lineTo(x - U * 0.06 + swing * U * 0.16, y - Math.max(0, swing) * U * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + U * 0.06, hip);
  ctx.lineTo(x + U * 0.06 - swing * U * 0.16, y - Math.max(0, -swing) * U * 0.1);
  ctx.stroke();

  // tas punggung
  rr(ctx, x - U * 0.26, y - U * 0.82, U * 0.18, U * 0.34, U * 0.05);
  ctx.fillStyle = '#f97316'; ctx.fill();

  // badan
  rr(ctx, x - U * 0.17, shoulder, U * 0.34, U * 0.4, U * 0.09);
  ctx.fillStyle = '#3b82f6'; ctx.fill();

  // lengan
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = U * 0.11;
  ctx.beginPath();
  ctx.moveTo(x - U * 0.15, shoulder + U * 0.06);
  ctx.lineTo(x - U * 0.15 - swing * U * 0.14, shoulder + U * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + U * 0.15, shoulder + U * 0.06);
  ctx.lineTo(x + U * 0.15 + swing * U * 0.14, shoulder + U * 0.3);
  ctx.stroke();

  // kepala
  ctx.fillStyle = '#ffd7b0';
  ctx.beginPath(); ctx.arc(x, y - U * 0.93, U * 0.14, 0, Math.PI * 2); ctx.fill();

  // topi
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(x, y - U * 0.96, U * 0.145, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#dc2626';
  rr(ctx, x - U * 0.02, y - U * 0.98, U * 0.24, U * 0.05, U * 0.02); ctx.fill();

  ctx.restore();
}

/* ==================== 3D (Three.js) ==================== */
function makeRoadTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 512;
  const g = c.getContext('2d');
  // balast (kerikil)
  g.fillStyle = '#7c7568';
  g.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = Math.random() > 0.5
      ? 'rgba(255,255,255,' + (Math.random() * 0.12) + ')'
      : 'rgba(0,0,0,' + (Math.random() * 0.18) + ')';
    g.fillRect(Math.random() * 128, Math.random() * 512,
      1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  // bantalan rel (sleepers), 8 baris per tile (64px = ~1.75 unit)
  const laneC = [27, 64, 101];
  for (let i = 0; i < 8; i++) {
    const y = i * 64 + 12;
    g.fillStyle = i % 2 ? '#5d4732' : '#4f3c2a';
    laneC.forEach(cx => {
      g.fillRect(cx - 16, y, 32, 26);
      g.fillStyle = 'rgba(0,0,0,.25)';
      g.fillRect(cx - 16, y + 24, 32, 3);
      g.fillStyle = i % 2 ? '#5d4732' : '#4f3c2a';
    });
  }
  // rel baja sepanjang lintasan di tiap lajur (jarak lebar ±0.66 unit)
  laneC.forEach(cx => {
    [-11, 11].forEach(dx => {
      g.fillStyle = '#4b5563';
      g.fillRect(cx + dx - 3, 0, 7, 512);
      g.fillStyle = '#c5ccd4';
      g.fillRect(cx + dx - 2, 0, 4, 512);
      g.fillStyle = '#eef1f5';
      g.fillRect(cx + dx - 1, 0, 2, 512);
    });
  });
  // tepi
  g.fillStyle = '#e8eaed';
  g.fillRect(2, 0, 5, 512);
  g.fillRect(121, 0, 5, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 160 / 14);
  return tex;
}
function makeStripeTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ff8a3d';
  g.fillRect(0, 0, 128, 64);
  g.strokeStyle = '#ffffff';
  g.lineWidth = 18;
  for (let i = -2; i < 8; i++) {
    g.beginPath();
    g.moveTo(i * 34 - 24, 84);
    g.lineTo(i * 34 + 44, -20);
    g.stroke();
  }
  return new THREE.CanvasTexture(c);
}
function makeWindowTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#101527';
  g.fillRect(0, 0, 64, 64);
  for (let r = 0; r < 5; r++) {
    for (let c2 = 0; c2 < 5; c2++) {
      if (Math.random() < 0.55) {
        g.fillStyle = Math.random() < 0.7 ? '#ffd98a' : '#bfe3ff';
        g.fillRect(5 + c2 * 12, 5 + r * 12, 8, 8);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
function makePlayer3D() {
  const P = new THREE.Group();
  const skin = new THREE.MeshLambertMaterial({ color: 0xffd7b0 });
  const shirt = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
  const pants = new THREE.MeshLambertMaterial({ color: 0x2b3a67 });
  const red = new THREE.MeshLambertMaterial({ color: 0xef4444 });
  const shoe = new THREE.MeshLambertMaterial({ color: 0xe23b4c });
  const orange = new THREE.MeshLambertMaterial({ color: 0xf97316 });
  function limb(w, h, d, mat, pivotY, x) {
    const grp = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.y = -h / 2;
    grp.add(m);
    grp.position.set(x, pivotY, 0);
    P.add(grp);
    return grp;
  }
  const legL = limb(0.24, 0.7, 0.28, pants, 0.72, -0.15);
  const legR = limb(0.24, 0.7, 0.28, pants, 0.72, 0.15);
  [legL, legR].forEach(l => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.36), shoe);
    s.position.set(0, -0.7, 0.04);
    l.add(s);
  });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.64, 0.34), shirt);
  torso.position.y = 1.06;
  P.add(torso);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.5, 0.2), orange);
  pack.position.set(0, 1.1, 0.26);
  P.add(pack);
  const armL = limb(0.17, 0.55, 0.2, shirt, 1.3, -0.38);
  const armR = limb(0.17, 0.55, 0.2, shirt, 1.3, 0.38);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skin);
  head.position.y = 1.62;
  P.add(head);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.15, 0.44), red);
  cap.position.y = 1.87;
  P.add(cap);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.2),
    new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
  brim.position.set(0, 1.8, -0.3);
  P.add(brim);
  return { group: P, legL: legL, legR: legR, armL: armL, armR: armR };
}
function makePhoto3D(img, hipFrac) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, img.width, img.height).data;
  let x0 = img.width, x1 = -1, y0 = img.height, y1 = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (data[(y * img.width + x) * 4 + 3] > 16) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < x0) throw new Error('foto kosong');
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  const cropH = hipFrac ? Math.max(1, Math.round(bh * hipFrac)) : bh;
  const crop = document.createElement('canvas');
  crop.width = bw;
  crop.height = cropH;
  crop.getContext('2d').drawImage(c, x0, y0, bw, cropH, 0, 0, bw, cropH);
  const tex = new THREE.CanvasTexture(crop);
  const h = 2.0 * (cropH / bh);
  const w = h * (bw / cropH);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide
    }));
  mesh.position.y = hipFrac ? 0.72 + h / 2 : h / 2;
  return mesh;
}
function makeObjMesh(o) {
  if (o.type === 'coin') {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 24),
      new THREE.MeshLambertMaterial({ color: 0xffcf3f, emissive: 0x6b5200 }));
    m.rotation.x = Math.PI / 2;
    g.add(m);
    R3.scene.add(g);
    return g;
  }
  if (o.type === 'power') {
    const g = new THREE.Group();
    const isJump = o.kind === 'jump';
    const col = isJump ? 0x4ade80 : 0xfde047;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9),
      new THREE.MeshLambertMaterial({ color: col, emissive: isJump ? 0x0d5a2c : 0x6b5200 }));
    g.add(box);
    const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
    if (isJump) {
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.06), white);
      shaft.position.set(0, -0.1, 0.47);
      g.add(shaft);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.28, 4), white);
      tip.position.set(0, 0.24, 0.47);
      tip.rotation.x = Math.PI / 2;
      tip.rotation.z = Math.PI / 4;
      g.add(tip);
    } else {
      const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.06), white);
      bar1.position.set(0, 0, 0.47);
      g.add(bar1);
      const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.06), white);
      bar2.position.set(0, 0, 0.47);
      g.add(bar2);
      const dotA = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), white);
      dotA.position.set(-0.3, 0.3, 0.47);
      g.add(dotA);
      const dotB = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), white);
      dotB.position.set(0.3, -0.3, 0.47);
      g.add(dotB);
    }
    R3.scene.add(g);
    return g;
  }
  if (o.type === 'barrier') {
    const g = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.3),
      new THREE.MeshLambertMaterial({ map: R3.stripeTex }));
    board.position.y = 0.75;
    g.add(board);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x4b5563 });
    [-0.8, 0.8].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), legMat);
      leg.position.set(x, 0.25, 0);
      g.add(leg);
    });
    R3.scene.add(g);
    return g;
  }
  // kereta merah-putih ala gambar
  const len = o.len || 9;
  const g = new THREE.Group();
  const white = new THREE.MeshLambertMaterial({ color: 0xf7f4ef });
  const red = new THREE.MeshLambertMaterial({ color: 0xe8342c });
  const redDark = new THREE.MeshLambertMaterial({ color: 0xb71f19 });
  const glass = new THREE.MeshLambertMaterial({ color: 0x8fb8d6, emissive: 0x1a2a38 });
  const gray = new THREE.MeshLambertMaterial({ color: 0x4b5563 });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xd9d4cb });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, len), white);
  body.position.y = 1.4;
  g.add(body);

  // strip merah memanjang
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.7, len * 1.002), red);
  stripe.position.y = 0.85;
  g.add(stripe);
  const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.16, len * 1.004), redDark);
  stripe2.position.y = 1.28;
  g.add(stripe2);

  // jendela samping
  const winCount = Math.max(3, Math.floor(len / 1.4));
  for (let i = 0; i < winCount; i++) {
    const wz = -len / 2 + (i + 0.5) * (len / winCount);
    [1.12, -1.12].forEach(sx => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, len / winCount * 0.6), glass);
      w.position.set(sx, 1.85, wz);
      g.add(w);
    });
  }

  // atap
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.22, len * 0.98), roofMat);
  roof.position.y = 2.7;
  g.add(roof);

  // sasis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, len * 0.96), gray);
  chassis.position.y = 0.28;
  g.add(chassis);

  // muka depan: kaca ganda + lampu (menghadap +z ke arah pemain? tidak — muka menghadap pemain = -z depan objek)
  // objek bergerak ke arah pemain, muka = sisi +z (dekat pemain)
  const fz = len / 2;
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.3, 0.12), white);
  face.position.set(0, 1.4, fz + 0.02);
  g.add(face);
  const faceStripe = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.7, 0.14), red);
  faceStripe.position.set(0, 0.85, fz + 0.03);
  g.add(faceStripe);
  [-0.5, 0.5].forEach(x => {
    const ws = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.72, 0.1), glass);
    ws.position.set(x, 2.0, fz + 0.06);
    g.add(ws);
    const wl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06),
      new THREE.MeshLambertMaterial({ color: 0x2f3540 }));
    wl.position.set(x + (x < 0 ? 0.2 : -0.2), 2.0, fz + 0.1);
    wl.rotation.z = x < 0 ? -0.5 : 0.5;
    g.add(wl);
  });
  // lampu kuning besar
  [-0.55, 0.55].forEach(x => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe27a }));
    l.position.set(x, 0.85, fz + 0.12);
    g.add(l);
  });
  // lampu atas
  const topL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffe27a }));
  topL.position.set(0, 2.6, fz + 0.08);
  g.add(topL);
  // sasis depan
  const buf = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.4, 0.2), gray);
  buf.position.set(0, 0.3, fz + 0.1);
  g.add(buf);

  R3.scene.add(g);
  return g;
}
function init3D() {
  if (typeof THREE === 'undefined' || R3) return !!R3;
  try {
    const c3 = $('#game3d');
    const renderer = new THREE.WebGLRenderer({ canvas: c3, antialias: true });
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8fb6f0);
    scene.fog = new THREE.Fog(0x8fb6f0, 42, 115);
    const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 260);
    camera.position.set(0, 4.6, 8);
    scene.add(camera);
    camera.lookAt(0, 1.5, -10);

    scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x3f7d43, 1.0));
    const dir = new THREE.DirectionalLight(0xfff3c4, 0.85);
    dir.position.set(14, 24, 8);
    scene.add(dir);

    const sun = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffec96, fog: false }));
    sun.position.set(30, 26, -95);
    scene.add(sun);

    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false });
    for (let i = 0; i < 7; i++) {
      const cl = new THREE.Group();
      for (let j = 0; j < 3; j++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(rand(2, 3.6), 10, 8), cloudMat);
        s.position.set(j * 3 - 3 + rand(-1, 1), rand(-0.5, 0.5), rand(-1, 1));
        s.scale.y = 0.55;
        cl.add(s);
      }
      cl.position.set(rand(-60, 60), rand(14, 26), rand(-120, -40));
      scene.add(cl);
    }

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(340, 340),
      new THREE.MeshLambertMaterial({ color: 0x3f7d43 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, -120);
    scene.add(ground);

    const roadTex = makeRoadTexture();
    const road = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 160),
      new THREE.MeshLambertMaterial({ map: roadTex }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -65);
    scene.add(road);

    const winTex = makeWindowTexture();
    winTex.repeat.set(1, 2);
    const bMats = [0x243055, 0x1d2747, 0x2b3a63].map(col => new THREE.MeshLambertMaterial({
      color: col, map: winTex, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: 0.5
    }));
    const bData = [];
    for (let i = 0; i < 34; i++) {
      const w = rand(2.5, 6), h = rand(4, 16), dp = rand(3, 7);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dp), bMats[i % 3]);
      m.position.x = (i % 2 ? 1 : -1) * rand(7.5, 16);
      m.position.y = h / 2 - 0.05;
      bData.push({ m: m, base: rand(0, 160) });
      scene.add(m);
    }

    const player = makePlayer3D();
    scene.add(player.group);
    if (typeof Image !== 'undefined') {
      const photo = new Image();
      photo.onload = () => {
        if (!R3) return;
        try {
          const mesh = makePhoto3D(photo, 0.635);
          for (const ch of player.group.children.slice()) {
            if (ch !== player.legL && ch !== player.legR) ch.visible = false;
          }
          player.group.add(mesh);
          player.photo = mesh;
        } catch (e) {
          if (typeof console !== 'undefined') console.warn('foto pemain gagal dipakai.', e);
        }
      };
      photo.src = 'sprites/player-school.png';
    }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    scene.add(shadow);

    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xff3c3c, transparent: true, opacity: 0, depthTest: false, depthWrite: false
    });
    const flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flashMat);
    flash.position.set(0, 0, -0.5);
    flash.renderOrder = 999;
    camera.add(flash);

    R3 = {
      renderer: renderer, scene: scene, camera: camera, roadTex: roadTex,
      bData: bData, player: player, shadow: shadow,
      flash: flash, flashMat: flashMat, stripeTex: makeStripeTexture(), active: []
    };
    c3.style.display = 'block';
    canvas.style.display = 'none';
    resize();
    return true;
  } catch (e) {
    R3 = null;
    if (typeof console !== 'undefined') console.warn('WebGL tidak tersedia, memakai mode 2D.', e);
    return false;
  }
}
function render3D() {
  const R = R3;
  const t = performance.now() / 1000;

  R.roadTex.offset.y = (G.dist / 14) % 1;
  for (const b of R.bData) b.m.position.z = ((b.base + G.dist) % 160) - 160 + 14;

  const seen = new Set();
  for (const o of G.objs) {
    if (o.d > Z_MAX + 16 || o.d < -8) continue;
    if (!o._m) o._m = makeObjMesh(o);
    const m = o._m;
    m.visible = true;
    seen.add(o);
    const z = -(o.d - PLAYER_D);
    if (o.type === 'coin') {
      m.position.set(o.lane * 2.2, 1.05 + Math.sin(t * 3 + o.d) * 0.12, z);
      m.rotation.y = t * 4 + o.d;
    } else if (o.type === 'power') {
      m.position.set(o.lane * 2.2, 1.15 + Math.sin(t * 4 + (o.spin || 0)) * 0.16, z);
      m.rotation.y = t * 2.2 + (o.spin || 0);
      m.rotation.z = Math.sin(t * 2 + (o.spin || 0)) * 0.15;
    } else if (o.type === 'barrier') {
      m.position.set(o.lane * 2.2, 0, z);
    } else {
      m.position.set(o.lane * 2.2, 0, z - (o.len || 9) / 2);
    }
  }
  for (const o of R.active) if (!seen.has(o) && o._m) o._m.visible = false;
  R.active = G.objs.slice();

  const P = R.player;
  const showP = G.mode !== 'menu';
  if (showP) {
    const running = G.mode === 'running';
    const swing = running ? Math.sin(t * 13) : 0;
    P.group.position.set(
      G.x * 2.2,
      G.y * 3.4 + (running ? Math.abs(Math.sin(t * 13)) * 0.06 : 0),
      0
    );
    P.group.rotation.z = clamp((G.lane - G.x) * -0.4, -0.3, 0.3);
    P.legL.rotation.x = swing * 0.8;
    P.legR.rotation.x = -swing * 0.8;
    P.armL.rotation.x = -swing * 0.7;
    P.armR.rotation.x = swing * 0.7;
    if (P.photo) P.photo.rotation.z = running ? Math.sin(t * 13) * 0.05 : 0;
    P.group.visible = !(G.invuln > 0 && Math.floor(t * 12) % 2 === 0);
    R.shadow.visible = true;
    R.shadow.position.x = G.x * 2.2;
    const sc = 1 - Math.min(0.5, G.y * 0.3);
    R.shadow.scale.set(sc, sc, 1);
    R.shadow.material.opacity = 0.3 * sc;
  } else {
    P.group.visible = false;
    R.shadow.visible = false;
  }

  const sh = G.shake;
  R.camera.position.set(
    sh > 0 ? rand(-sh, sh) * 0.05 : 0,
    4.6 + (sh > 0 ? rand(-sh, sh) * 0.04 : 0),
    8
  );
  R.camera.lookAt(0, 1.5, -10);

  R.flashMat.opacity = clamp(G.flash * 0.5, 0, 0.5);
  if (G.flash > 0) G.flash = Math.max(0, G.flash - 0.03);

  R.renderer.render(R.scene, R.camera);
}

/* ==================== LOOP ==================== */
let last = performance.now();
function loop(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05);
  last = now;
  if (G.shake > 0 && !R3) {
    ctx.save();
    ctx.translate(rand(-G.shake, G.shake) * 0.4, rand(-G.shake, G.shake) * 0.4);
  }
  update(dt);
  updateParts(dt);
  if (G.mode !== 'paused') render();
  if (G.shake > 0 && !R3) ctx.restore();
  requestAnimationFrame(loop);
}

/* ==================== TOAST ==================== */
let toastTimer = null;
function toast(msg, kind) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast ' + (kind || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 1800);
}

/* ==================== MUSIK & SFX (Web Audio) ==================== */
const AudioEngine = (function () {
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let seqTimer = null, step = 0, nextTime = 0, playing = false;
  let muted = !!store.get(LS.music, false);

  const BPM = 138;
  const STEP = 60 / BPM / 4;
  const nf = m => 440 * Math.pow(2, (m - 69) / 12);

  // Melodi ringan bergaya runner (orinal, bukan salinan lagu siapa pun) — 32 langkah
  const LEAD = [
    76, 79, 83, 86, 83, 79, 81, null,
    74, 77, 81, 84, 81, 77, 79, null,
    72, 76, 79, 84, 79, 76, 77, null,
    71, 74, 78, 83, 79, 76, 74, 71
  ];
  const BASS = [
    [45, .5], [45, .5], [52, .5], [45, .5], [45, .5], [52, .5], [45, .5], [52, .5],
    [41, .5], [41, .5], [48, .5], [41, .5], [41, .5], [48, .5], [41, .5], [48, .5],
    [48, .5], [48, .5], [55, .5], [48, .5], [48, .5], [55, .5], [48, .5], [55, .5],
    [43, .5], [43, .5], [50, .5], [43, .5], [43, .5], [50, .5], [43, .5], [50, .5]
  ];

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.34;
      musicGain.connect(master);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.5;
      sfxGain.connect(master);
      return true;
    } catch (e) { return false; }
  }
  function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  }
  function tone(t, freq, dur, type, vol, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function noiseHit(t, dur, vol, hp) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(musicGain);
    src.start(t);
  }
  function schedule() {
    if (!playing || !ctx) return;
    while (nextTime < ctx.currentTime + 0.16) {
      const i = step % 32;
      const bar = Math.floor(step / 32);
      if (i % 4 === 0) {
        tone(nextTime, 140, 0.14, 'sine', 0.9, musicGain);
        tone(nextTime, 55, 0.16, 'sine', 0.7, musicGain);
      }
      if (i % 8 === 4) noiseHit(nextTime, 0.09, 0.5, 1600);
      if (i % 2 === 0) noiseHit(nextTime, 0.03, 0.18, 6500);
      const b = BASS[i];
      tone(nextTime, nf(b[0] - 12), STEP * b[1] * 1.8, 'sawtooth', 0.16, musicGain);
      const ln = LEAD[i];
      if (ln != null) {
        tone(nextTime, nf(ln), STEP * 3.2, 'triangle', 0.13, musicGain);
        if (bar % 2 === 1 && i % 8 === 0) tone(nextTime, nf(ln + 12), STEP * 5, 'triangle', 0.06, musicGain);
      }
      nextTime += STEP;
      step++;
    }
  }
  return {
    unlock,
    get muted() { return muted; },
    start() {
      if (!ensure()) return;
      unlock();
      if (playing) return;
      playing = true;
      step = 0;
      nextTime = ctx.currentTime + 0.06;
      seqTimer = setInterval(schedule, 40);
      schedule();
    },
    stop() {
      playing = false;
      if (seqTimer) { clearInterval(seqTimer); seqTimer = null; }
    },
    setPaused(p) {
      if (!ctx) return;
      if (p) this.stop();
      else if (G.mode === 'running' || G.mode === 'menu') this.start();
    },
    toggleMute() {
      muted = !muted;
      store.set(LS.music, muted);
      if (master) master.gain.value = muted ? 0 : 0.9;
      return muted;
    },
    sfx(kind) {
      if (!ensure() || muted) return;
      unlock();
      const t = ctx.currentTime;
      if (kind === 'coin') {
        tone(t, 988, 0.07, 'square', 0.2, sfxGain);
        tone(t + 0.06, 1319, 0.12, 'square', 0.18, sfxGain);
      } else if (kind === 'coin2') {
        [784, 988, 1319, 1568].forEach((f, i) => tone(t + i * 0.05, f, 0.14, 'square', 0.2, sfxGain));
      } else if (kind === 'jump') {
        tone(t, 340, 0.16, 'sine', 0.3, sfxGain, 0);
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(300, t);
        o.frequency.exponentialRampToValueAtTime(760, t + 0.16);
        g.gain.setValueAtTime(0.28, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g); g.connect(sfxGain);
        o.start(t); o.stop(t + 0.24);
      } else if (kind === 'power') {
        [523, 659, 784, 1047, 1319].forEach((f, i) => tone(t + i * 0.06, f, 0.18, 'triangle', 0.24, sfxGain));
      } else if (kind === 'hit') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(70, t + 0.28);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g); g.connect(sfxGain);
        o.start(t); o.stop(t + 0.34);
        noiseHit2(t, 0.2, 0.3);
      } else if (kind === 'good') {
        [659, 880, 1047].forEach((f, i) => tone(t + i * 0.08, f, 0.2, 'triangle', 0.22, sfxGain));
      } else if (kind === 'bad') {
        [330, 247, 196].forEach((f, i) => tone(t + i * 0.1, f, 0.22, 'square', 0.16, sfxGain));
      } else if (kind === 'over') {
        [523, 466, 392, 311, 262].forEach((f, i) => tone(t + i * 0.14, f, 0.32, 'triangle', 0.2, sfxGain));
      }
      function noiseHit2(tt, dur, vol) {
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const g = ctx.createGain(); g.gain.value = vol;
        src.connect(g); g.connect(sfxGain);
        src.start(tt);
      }
    }
  };
})();

/* ==================== IMPORT SOAL ==================== */
function splitLine(line, d) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === d) { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}
function toIndex(ans, n) {
  if (Array.isArray(ans)) return ans.length ? toIndex(ans[0], n) : -1;
  if (typeof ans === 'number' && isFinite(ans)) {
    if (ans === 0) return 0;
    if (ans >= 1 && ans <= n) return ans - 1;
    return -1;
  }
  const s = String(ans).trim();
  if (!s) return -1;
  if (/^[1-9]\d*$/.test(s)) { const v = parseInt(s, 10); return v >= 1 && v <= n ? v - 1 : -1; }
  if (/^[A-Za-z]$/.test(s)) {
    const v = s.toUpperCase().charCodeAt(0) - 65;
    return v >= 0 && v < n ? v : -1;
  }
  return -1;
}
function normalizeAny(o) {
  if (!o) return null;
  const q = o.q || o.question || o.pertanyaan || o.soal;
  let opts = o.opts || o.options || o.opsi || o.pilihan;
  if (!Array.isArray(opts)) {
    opts = [o.opsi_a || o.a, o.opsi_b || o.b, o.opsi_c || o.c, o.opsi_d || o.d].filter(v => v != null && String(v).trim() !== '');
  }
  opts = opts.map(v => String(v).trim()).filter(Boolean);
  if (!q || opts.length < 2) return null;
  let ans = o.ans != null ? o.ans : (o.answer != null ? o.answer : o.jawaban);
  let idx = toIndex(ans, opts.length);
  if (idx < 0 && ans != null) {
    idx = opts.findIndex(x => x.toLowerCase() === String(ans).trim().toLowerCase());
  }
  if (idx < 0) return null;
  return { q: String(q).trim(), opts: opts, ans: idx, subj: String(o.subj || o.subject || o.subjek || 'Umum').trim(), src: 'impor' };
}
function parseQuestions(text) {
  const res = { list: [], errors: [] };
  const t = text.replace(/^\uFEFF/, '').trim();
  if (!t) { res.errors.push('Teks kosong.'); return res; }

  if (t[0] === '[' || t[0] === '{') {
    let data;
    try { data = JSON.parse(t); }
    catch (e) { res.errors.push('JSON tidak valid: ' + e.message); return res; }
    if (!Array.isArray(data)) data = [data];
    data.forEach((o, i) => {
      const n = normalizeAny(o);
      if (n) res.list.push(n); else res.errors.push('Baris JSON #' + (i + 1) + ' tidak valid (butuh question/options/answer).');
    });
    return res;
  }

  const lines = t.split(/\r?\n/).filter(l => l.trim() !== '');
  const head = lines[0] || '';
  const semi = (head.match(/;/g) || []).length;
  const coma = (head.match(/,/g) || []).length;
  const delim = semi >= coma ? ';' : ',';
  let rows = lines.map(l => splitLine(l, delim));
  const first = (rows[0][0] || '').toLowerCase();
  if (/pertanyaan|question|soal/.test(first)) rows = rows.slice(1);

  rows.forEach((cols, i) => {
    if (cols.length < 4) { res.errors.push('Baris ' + (i + 1) + ': kolom kurang dari 4.'); return; }
    const q = cols[0];
    const opts = cols.slice(1, 5).filter(v => v !== '');
    const ans = cols[5] != null ? cols[5] : '';
    const subj = cols[6] || 'Umum';
    const n = normalizeAny({ question: q, options: opts, answer: ans, subject: subj });
    if (n) res.list.push(n);
    else res.errors.push('Baris ' + (i + 1) + ': jawaban "' + ans + '" tidak cocok dengan opsi.');
  });
  return res;
}
function saveCustom(list) {
  const cur = store.get(LS.bank, []);
  const tagged = list.map(o => Object.assign({}, o, { kelas: G.kelas }));
  const merged = cur.concat(tagged);
  store.set(LS.bank, merged);
  buildBank();
}
function importText(text, origin) {
  const res = parseQuestions(text);
  const box = $('#importResult');
  if (res.list.length) saveCustom(res.list);
  let msg = '';
  if (res.list.length) msg += 'Berhasil impor ' + res.list.length + ' soal dari ' + origin + ' ke Kelas ' + G.kelas + '.\n';
  if (res.errors.length) msg += 'Dilewati ' + res.errors.length + ' baris:\n- ' + res.errors.slice(0, 6).join('\n- ');
  box.textContent = msg.trim() || 'Tidak ada soal yang terbaca.';
  box.className = 'result ' + (res.list.length ? 'ok' : 'err');
  renderBankList();
  refreshMenu();
}
function renderBankList() {
  const ul = $('#bankList');
  ul.innerHTML = '';
  G.bank.forEach(o => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="tag">${escapeHtml(o.subj)}</span><span class="qline">${escapeHtml(o.q)}<br><span class="src">${escapeHtml(o.opts[o.ans])} (benar) · ${o.src}</span></span>`;
    ul.appendChild(li);
  });
  $('#bankCount').textContent = G.bank.length;
  $('#bankKelas').textContent = G.kelas;
}
function refreshMenu() {
  $('#bestScore').textContent = store.get(LS.best, 0);
  const kelasCustom = store.get(LS.bank, []).filter(c => Number(c.kelas || G.kelas) === G.kelas).length;
  $('#bankInfo').textContent = G.bank.length + (kelasCustom ? ' (' + kelasCustom + ' impor)' : '');
  $('#intervalRange').value = G.interval;
  $('#intVal').textContent = G.interval;
  $('#kelasVal').textContent = G.kelas;
  Array.from($('#kelasSeg').children).forEach(b => b.classList.toggle('on', Number(b.dataset.kelas) === G.kelas));
  applyRoleUI();
  renderScores();
}
function downloadTemplate() {
  const csv = [
    'pertanyaan;opsi_a;opsi_b;opsi_c;opsi_d;jawaban;subjek',
    '"Berapa hasil 5 x 6?";25;30;35;40;B;Matematika',
    '"Ibu kota Jepang adalah?";Tokyo;Kyoto;Osaka;Sapporo;Tokyo;Geografi',
    '"12 + 27 = ?";39;49;38;37;1;Matematika'
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'template-soal.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ==================== INPUT ==================== */
function move(dir) {
  if (G.mode !== 'running') return;
  G.lane = clamp(G.lane + dir, -1, 1);
}
function jump() {
  if (G.mode !== 'running') return;
  if (G.y === 0) {
    G.vy = G.puJump > 0 ? 6.2 : 3.5;
    AudioEngine.sfx('jump');
  }
}
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (G.mode === 'question') {
    if (['1', '2', '3', '4', '5', '6'].includes(k)) {
      const idx = parseInt(k, 10) - 1;
      const btn = $('#qOptions').children[idx];
      if (btn && !btn.disabled) answer(idx, btn);
      e.preventDefault();
    } else if (k === 'enter' || k === ' ') {
      if (G.answered) continueRun();
      e.preventDefault();
    }
    return;
  }
  if (k === 'arrowleft' || k === 'a') { move(-1); e.preventDefault(); }
  else if (k === 'arrowright' || k === 'd') { move(1); e.preventDefault(); }
  else if (k === 'arrowup' || k === 'w' || k === ' ') { jump(); e.preventDefault(); }
  else if (k === 'p') { G.mode === 'running' ? pauseGame() : resumeGame(); }
  else if (k === 'escape') { if (G.mode === 'running') pauseGame(); else if (G.mode === 'paused') resumeGame(); }
  else if (k === 'enter') { if (G.mode === 'menu') startGame(); else if (G.mode === 'over') startGame(); }
});

let tsX = 0, tsY = 0, tsT = 0;
[canvas, $('#game3d')].forEach(cv => {
  cv.addEventListener('touchstart', e => {
    const t = e.changedTouches[0];
    tsX = t.clientX; tsY = t.clientY; tsT = performance.now();
  }, { passive: true });
  cv.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - tsX, dy = t.clientY - tsY;
    if (performance.now() - tsT > 700) return;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { jump(); return; }
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1);
    else if (dy < 0) jump();
  }, { passive: true });
});

/* ==================== UI WIRING ==================== */
$('#btnPlay').addEventListener('click', startGame);
$('#btnRestart').addEventListener('click', startGame);
$('#btnMenu').addEventListener('click', toMenu);
$('#btnQuit').addEventListener('click', toMenu);
$('#btnPause').addEventListener('click', pauseGame);
$('#btnResume').addEventListener('click', resumeGame);
$('#qBtnContinue').addEventListener('click', continueRun);
$('#btnMusic').addEventListener('click', () => {
  const muted = AudioEngine.toggleMute();
  $('#btnMusic').classList.toggle('off', muted);
  $('#btnMusic').textContent = muted ? '♪ MUSIK OFF' : '♪ MUSIK';
  toast(muted ? 'Musik dimatikan' : 'Musik dinyalakan');
});
// buka kunci audio pada interaksi pertama (kebijakan autoplay browser)
['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
  document.addEventListener(ev, () => AudioEngine.unlock(), { once: true, passive: true }));

$('#kelasSeg').addEventListener('click', e => {
  const b = e.target.closest('button[data-kelas]');
  if (!b) return;
  G.kelas = clamp(parseInt(b.dataset.kelas, 10), 1, 6);
  store.set(LS.kelas, G.kelas);
  buildBank();
  refreshMenu();
  renderBankList();
  toast('Soal Kelas ' + G.kelas + ' siap dimainkan');
});
$('#intervalRange').addEventListener('input', e => {
  G.interval = parseInt(e.target.value, 10);
  $('#intVal').textContent = G.interval;
  store.set(LS.interval, G.interval);
});

/* ---- layar login ---- */
let loginRole = 'player';
$('#roleSeg').addEventListener('click', e => {
  const b = e.target.closest('button[data-role]');
  if (!b) return;
  loginRole = b.dataset.role;
  Array.from($('#roleSeg').children).forEach(x => x.classList.toggle('on', x.dataset.role === loginRole));
  $('#fPlayer').classList.toggle('hidden', loginRole !== 'player');
  $('#fAdmin').classList.toggle('hidden', loginRole !== 'admin');
  $('#loginError').textContent = '';
});
function doLogin() {
  const err = $('#loginError');
  const res = loginRole === 'admin'
    ? loginAdmin($('#loginUser').value, $('#loginPass').value)
    : loginPlayer($('#loginName').value);
  if (!res.ok) { err.textContent = res.msg; return; }
  err.textContent = '';
}
$('#btnLogin').addEventListener('click', doLogin);
$('#loginName').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('#loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('#btnLogout').addEventListener('click', () => { logout(); toast('Anda telah keluar'); });
$('#btnPass').addEventListener('click', () => {
  const v = $('#newPass').value.trim();
  const box = $('#passResult');
  if (v.length < 4) { box.textContent = 'Kata sandi minimal 4 karakter.'; box.className = 'result err'; return; }
  store.set(LS.admin, { user: adminCreds().user, pass: v });
  $('#newPass').value = '';
  box.textContent = 'Kata sandi admin berhasil diganti.';
  box.className = 'result ok';
});

function openImport() {
  $('#importModal').classList.remove('hidden');
  $('#importResult').textContent = '';
  $('#importResult').className = 'result';
  renderBankList();
}
$('#btnImport').addEventListener('click', openImport);
$('#btnBank').addEventListener('click', openImport);
$('#btnCloseImport').addEventListener('click', () => $('#importModal').classList.add('hidden'));
$('#btnTemplate').addEventListener('click', downloadTemplate);
$('#btnResetBank').addEventListener('click', () => {
  store.set(LS.bank, []);
  buildBank(); renderBankList(); refreshMenu();
  $('#importResult').textContent = 'Hasil impor dihapus. Bank kembali ke soal bawaan.';
  $('#importResult').className = 'result ok';
});
$('#btnPasteImport').addEventListener('click', () => {
  const v = $('#pasteArea').value;
  if (!v.trim()) { $('#importResult').textContent = 'Tempel dulu isi soalnya.'; $('#importResult').className = 'result err'; return; }
  importText(v, 'tempelan teks');
  $('#pasteArea').value = '';
});
function handleFile(file) {
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => importText(String(rd.result), file.name);
  rd.onerror = () => {
    $('#importResult').textContent = 'Gagal membaca file.';
    $('#importResult').className = 'result err';
  };
  rd.readAsText(file, 'utf-8');
}
$('#fileInput').addEventListener('change', e => { handleFile(e.target.files[0]); e.target.value = ''; });

const dz = $('#dropZone');
['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('over'); }));
dz.addEventListener('drop', e => { handleFile(e.dataTransfer.files[0]); });
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());

/* ==================== INIT ==================== */
if (AudioEngine.muted) {
  $('#btnMusic').classList.add('off');
  $('#btnMusic').textContent = '♪ MUSIK OFF';
}
init3D();
buildBank();
renderBankList();
updateHud();
requestAnimationFrame(loop);

const savedSession = store.get(LS.session, null);
if (savedSession && savedSession.name) {
  AUTH.role = savedSession.role === 'admin' ? 'admin' : 'player';
  AUTH.name = savedSession.name;
  showMenu();
} else {
  G.mode = 'login';
  refreshMenu();
  renderScores();
}

function ensureLogin() {
  if (G.mode !== 'login') return;
  loginPlayer('Tamu');
}
if (location.hash === '#play') {
  ensureLogin();
  startGame();
  G.dist = 320;
  G.objs.push(
    { type: 'barrier', lane: -1, d: 15, hit: false },
    { type: 'barrier', lane: 1, d: 15, hit: false },
    { type: 'train', lane: 0, d: 30, len: 9, hit: false }
  );
  for (let i = 0; i < 5; i++) G.objs.push({ type: 'coin', lane: 0, d: 12 + i * 2.2, hit: false });
  updateHud();
}
if (location.hash === '#soal') { ensureLogin(); startGame(); openQuestion(); }
if (location.hash === '#impor') {
  const c = adminCreds();
  loginAdmin(c.user, c.pass);
  openImport();
}
