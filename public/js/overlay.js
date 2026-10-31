const $ = (s) => document.querySelector(s), params = new URLSearchParams(location.search);
const stage = $('#stage'), scene = $('#scene'), dvLayer = $('#devotees'), fxLayer = $('#fx');
const fit = () => stage.style.setProperty('--s', Math.min(innerWidth / 540, innerHeight / 960)); addEventListener('resize', fit); fit();
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const A = (n) => `assets/decor/${n}.webp`;

// ---------- Bố cục điện thờ: [ảnh, x giữa, y đáy, rộng, class/id] — sửa số ở đây để chỉnh khớp ảnh mẫu ----------
const POS = { bell: [70, 520, 92], wood: [472, 520, 86], tube: [410, 472, 34], lu: [270, 478, 118] };
const LAYOUT = [
  ['nen_dien_tho', 0, 0, 540, 'bg'], ['tham_do', 270, 975, 640], ['hao_quang', 270, 340, 350, 'halo'], ['dai_sen', 270, 392, 290], ['tuong_phat', 270, 345, 250],
  ['ban_tho', 270, 515, 450], ['binh_hoa_sen', 64, 392, 100], ['binh_hoa_sen', 476, 392, 100], ['den_tho_chan_cao', 22, 420, 50], ['den_tho_chan_cao', 518, 420, 50],
  ['den_long_treo', 38, 112, 66], ['den_long_treo', 502, 112, 66], ['mam_trai_cay', 172, 462, 72], ['mam_trai_cay', 368, 462, 72],
  ['lu_huong', ...POS.lu, 'lu'], ['chuong_chua', ...POS.bell, 'bell'], ['mo_go', ...POS.wood, 'wood'], ['ong_xin_xam', ...POS.tube, 'tube'],
];
const el = {};
for (const [name, x, y, w, id] of LAYOUT) {
  const d = document.createElement('div'); d.className = 'it' + (id === 'bg' ? ' bg' : ''); Object.assign(d.style, { left: x + 'px', top: y + 'px', width: w + 'px' });
  const i = new Image(); i.src = A(name); i.alt = ''; if (id === 'halo') i.className = 'motion-halo'; d.append(i); scene.append(d); if (id) el[id] = i;
}
const label = (txt, x, y, id) => { const l = document.createElement('div'); l.className = 'lbl'; l.style.left = x + 'px'; l.style.top = y + 'px'; l.textContent = txt; l.id = id || ''; scene.append(l); return l; };
label('🔔 Thỉnh Chuông', POS.bell[0], POS.bell[1] + 4); const woodLbl = label('🪘 Gõ Mõ (0)', POS.wood[0], POS.wood[1] + 4); label('🎋 Xin Xăm', POS.tube[0] + 4, POS.tube[1] + 4);
// hiệu ứng nền lặp (animation WebP có alpha)
const amb = (n, x, y, s, c = '') => { const i = new Image(); i.src = `assets/fx/${n}.webp`; i.className = 'fx amb ' + c; Object.assign(i.style, { left: x + 'px', top: y + 'px', width: s + 'px' }); fxLayer.append(i); };
amb('24_khoi_huong', 270, 395, 150); amb('23_hat_sang', 270, 250, 420);

// ---------- Phát animation WebP một lần (blob URL riêng để luôn bắt đầu từ khung 0) ----------
const blobs = {};
['12_thap_huong','13_tha_hoa_dang','14_dang_hoa_sen','15_thinh_chuong','16_go_mo','17_xin_xam','18_dang_trai_cay','19_sen_no','22_tia_sang','23_hat_sang']
  .forEach(n => fetch(`assets/fx/${n}.webp`).then(r => r.blob()).then(b => blobs[n] = b).catch(() => {}));
function playFx(n, x, y, size, ms = 2400, cls = '') {
  const b = blobs[n], i = new Image(); i.src = b ? URL.createObjectURL(b) : `assets/fx/${n}.webp?r=${Date.now()}`; i.className = 'fx ' + cls;
  Object.assign(i.style, { left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px' }); fxLayer.append(i);
  setTimeout(() => { i.remove(); b && URL.revokeObjectURL(i.src); }, ms);
}
const pulse = (img, cls, ms = 2200) => { if (!img) return; img.classList.remove(cls); void img.offsetWidth; img.classList.add(cls); setTimeout(() => img.classList.remove(cls), ms); };

// ---------- Phật tử: sprite đi bộ -> quỳ -> cúi lễ ----------
const FRONT = [[270, 0], [212, 1], [328, 2], [154, 3], [386, 4], [96, 5], [444, 6]].map(([x]) => [x, 590]); // hạng 1..7 (giữa, trái, phải…)
const SIDE = []; for (let r = 0; r < 9; r++) { const y = 642 + r * 25; SIDE.push([38, y], [98, y], [442, y], [502, y]); }
const SLOTS = [...FRONT, ...SIDE];
const sizeAt = (y, rank) => rank === 0 ? 56 : y < 640 ? 46 : Math.round(38 + (y - 650) / 272 * 20);
const TINTS = ['none','sepia(.65) saturate(1.5)','sepia(.8) saturate(2.2) hue-rotate(-15deg)','brightness(1.18) saturate(.8)','sepia(.5) hue-rotate(150deg) saturate(1.6)'];
const dv = new Map(); let firstState = true;
function makeDv(p, instant) {
  const e = document.createElement('div'); e.className = 'dv'; e.innerHTML = '<div class="nm"></div><div class="sp"></div>';
  const o = { p, e, sp: e.querySelector('.sp'), nm: e.querySelector('.nm'), mode: 'walk', bowAt: 0, x: 270, y: 1010 };
  e.style.setProperty('--tint', TINTS[(p.tint || 0) % TINTS.length]); e.style.transition = 'none'; e.style.transform = `translate(${o.x}px,${o.y}px)`; dvLayer.append(e);
  if (instant) o.mode = 'kneel'; return o;
}
function place(o, slot, rank) {
  const [x, y] = slot, S = sizeAt(y, rank), dist = Math.hypot(x - o.x, y - o.y), moving = dist > 3;
  o.e.style.setProperty('--S', S + 'px'); o.e.style.zIndex = Math.round(y);
  o.nm.innerHTML = rank < 7 ? `<i>${rank + 1}</i>` : ''; o.nm.append(o.p.name);
  if (moving) { o.mode = 'walk'; o.e.style.setProperty('--dur', Math.max(.6, dist / 70) + 's'); void o.e.offsetWidth; o.e.style.transition = ''; o.e.style.transform = `translate(${x}px,${y}px)`;
    clearTimeout(o.t); o.t = setTimeout(() => { if (o.mode === 'walk') { o.mode = 'kneel'; if (o.pendingBow) { o.bowAt = performance.now(); o.pendingBow = false; } } }, Math.max(.6, dist / 70) * 1000); }
  o.x = x; o.y = y;
}
function reconcile(list) {
  const ranked = [...list].sort((a, b) => b.merit - a.merit || a.joined - b.joined), names = new Set(list.map(d => d.name));
  ranked.slice(0, SLOTS.length).forEach((p, i) => { let o = dv.get(p.name); if (!o) { o = makeDv(p, firstState); dv.set(p.name, o); } o.p = p; place(o, SLOTS[i], i); if (firstState) { clearTimeout(o.t); o.mode = 'kneel'; o.e.style.transition = 'none'; o.e.style.transform = `translate(${SLOTS[i][0]}px,${SLOTS[i][1]}px)`; } });
  for (const [n, o] of dv) if (!names.has(n)) { clearTimeout(o.t); o.e.style.opacity = 0; setTimeout(() => o.e.remove(), 700); dv.delete(n); }
  firstState = false;
}
(function loop(t) {
  for (const o of dv.values()) { let img, f;
    if (o.mode === 'walk') { img = 'walk'; f = Math.floor(t / 100) % 8; }
    else if (o.bowAt && t - o.bowAt < 3200) { img = 'bow'; f = Math.min(7, Math.floor((t - o.bowAt) / 400)); }
    else { o.bowAt = 0; img = 'bow'; f = 2; }
    if (o.img !== img) { o.sp.style.backgroundImage = `url(assets/sprites/${img}_strip.webp)`; o.img = img; }
    if (o.f !== f) { o.sp.style.backgroundPosition = `${f * 100 / 7}% 0`; o.f = f; } }
  requestAnimationFrame(loop);
})(0);

// ---------- Sự kiện ----------
const toasts = $('#toasts');
function toast(txt) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = txt; toasts.append(d); while (toasts.children.length > 3) toasts.firstChild.remove(); setTimeout(() => d.remove(), 4500); }
function onDv(user, fn) { const o = dv.get(user); if (o) fn(o); }
function onRitual(r) {
  toast(`${r.icon} ${r.user} ${r.say}${r.mult > 1 ? ' ×' + r.mult : ''} · +${fmt(r.gain)} công đức`);
  onDv(r.user, o => { o.e.classList.add('glow'); setTimeout(() => o.e.classList.remove('glow'), 2500); o.bowAt = performance.now(); if (o.mode === 'walk') o.pendingBow = true;
    const g = document.createElement('div'); g.className = 'gain'; g.textContent = '+' + fmt(r.gain) + ' công đức'; o.e.append(g); setTimeout(() => g.remove(), 2400);
    if (r.wish) { const s = document.createElement('div'); s.className = 'say'; s.textContent = r.wish; o.e.append(s); setTimeout(() => s.remove(), 5000); } });
  const FX = { incense: () => playFx(r.fx, 270, 410, 260), bless: () => playFx(r.fx, 270, 640, 320), lantern: () => playFx(r.fx, 270, 720, 260, 2600, 'rise'),
    woodfish: () => { pulse(el.wood, 'motion-tap', 500); playFx(r.fx, POS.wood[0], POS.wood[1] - 40, 150); }, bell: () => { pulse(el.bell, 'swing'); playFx(r.fx, POS.bell[0], POS.bell[1] - 45, 170); },
    fortune: () => { pulse(el.tube, 'motion-shake', 700); playFx(r.fx, POS.tube[0], POS.tube[1] - 30, 150); }, lotus: () => playFx(r.fx, 270, 330, 270), fruit: () => playFx(r.fx, 270, 420, 250),
    dragon: () => { playFx('19_sen_no', 270, 340, 520, 2600); playFx('22_tia_sang', 270, 300, 760, 2600); playFx('23_hat_sang', 270, 480, 640, 2600);
      $('#flash').classList.remove('on'); void $('#flash').offsetWidth; $('#flash').classList.add('on'); const b = $('#banner'); b.textContent = `🐉 ${r.user.toUpperCase()} · ĐẠI LỄ KIM LONG CHẦU PHẬT`; b.classList.remove('hidden'); setTimeout(() => b.classList.add('hidden'), 5000); } };
  (FX[r.action] || (() => {}))();
  if (r.fortune) { const s = $('#signbox'); s.textContent = `🎋 Xin xăm · Quẻ số ${r.fortuneNo} · ${r.fortune.split(' — ')[0]}`; s.classList.remove('hidden'); clearTimeout(s.t); s.t = setTimeout(() => s.classList.add('hidden'), 8000); }
  TempleAudio.play(r.action);
  TempleAudio.speak(`${r.user} ${r.say}. ${r.fortune || r.wish || ''}`);
}
function render(s) {
  $('#incense').textContent = fmt(s.incense); $('#merit').textContent = fmt(s.merit); woodLbl.textContent = `🪘 Gõ Mõ (${fmt(s.woodfish)})`;
  $('#liveTxt').textContent = `${s.live ? 'LIVE' : 'OFFLINE'} ${s.connected || ''} · ${fmt(s.viewers)} mắt`.trim();
  const b = s.board || []; $('#topName').textContent = b[0]?.name || '—'; $('#topMerit').textContent = fmt(b[0]?.score || 0);
  $('#boardList').replaceChildren(...b.map((r, i) => { const li = document.createElement('li'); li.innerHTML = `<b>${['🥇','🥈','🥉','4','5'][i]}</b><span></span><em>${fmt(r.score)}</em>`; li.querySelector('span').textContent = r.name; return li; }));
  reconcile(s.devotees || []); TempleAudio.apply(s.audio);
  $('#unlock').classList.toggle('hidden', !s.audio.enabled || TempleAudio.running || params.has('clean') || params.has('mute'));
  if (s.audio.enabled && params.has('clean') && !params.has('mute') && !TempleAudio.running) TempleAudio.unlock().catch(() => {});
}
const unlock = $('#unlock'); unlock.onclick = async () => { if (await TempleAudio.unlock()) unlock.classList.add('hidden'); };
addEventListener('pointerdown', () => TempleAudio.unlock().then(ok => ok && unlock.classList.add('hidden')), { once: true });
const sock = io(); sock.on('state', render); sock.on('ritual', onRitual); sock.on('join', j => toast(`🙏 ${j.user} vừa vào chùa`)); sock.on('toast', toast);
