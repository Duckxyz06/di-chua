import express from 'express';
import { commentAction, consumeLikes, giftRitual } from './lib/rules.js';
import http from 'http';
import fs from 'fs';
import { Server } from 'socket.io';

const CFG_PATH = new URL('./config.json', import.meta.url);
let cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'));
const app = express(), server = http.createServer(app), io = new Server(server);
app.use(express.json()); app.use(express.static('public'));

// ---------- Trạng thái (nguồn sự thật duy nhất, nằm ở server) ----------
const state = { merit: 0, incense: 0, woodfish: 0, viewers: 0, scores: Object.create(null), devotees: Object.create(null), connected: '', live: false,
  audio: { enabled: false, voice: true, music: true, musicVol: 0.89, voiceVol: 0.86 } };
let generation = 0;
let conn = null, simTimer = null, retry = 0, retryTimer = null, likeAcc = Object.create(null);

const board = () => Object.entries(state.scores).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, score]) => ({ name, score }));
const devotees = () => Object.entries(state.devotees).sort((a, b) => b[1].last - a[1].last).slice(0, cfg.maxDevotees)
  .map(([name, d]) => ({ name, merit: state.scores[name] || 0, joined: d.joined, last: d.last, tint: d.tint }));
const publicState = () => ({ merit: state.merit, incense: state.incense, woodfish: state.woodfish, viewers: state.viewers,
  board: board(), devotees: devotees(), audio: state.audio, connected: state.connected, live: state.live,
  simulation: !!simTimer, actions: cfg.actions, fortunes: cfg.fortunes.length });
const push = () => io.emit('state', publicState());
const toast = (msg) => io.emit('toast', msg);

function touch(name) {
  if (!state.devotees[name]) state.devotees[name] = { joined: Date.now(), tint: Math.floor(Math.random() * 360) };
  state.devotees[name].last = Date.now();
  const keys = Object.keys(state.devotees);                     // tối đa N phật tử, người mới đẩy người cũ ra
  if (keys.length > Math.min(40, cfg.maxDevotees)) { keys.sort((a, b) => state.devotees[a].last - state.devotees[b].last);
    keys.slice(0, keys.length - Math.min(40, cfg.maxDevotees)).forEach(k => delete state.devotees[k]); }
}

function ritual(user, action, wish = '', mult = 1) {
  if (!Object.hasOwn(cfg.actions, action)) return false;
  user = String(user || 'Khách').slice(0, 80); wish = String(wish || '').slice(0, 500);
  const a = cfg.actions[action];
  const gain = a.merit * Math.max(1, mult);
  state.merit += gain; state.scores[user] = (state.scores[user] || 0) + gain; touch(user);
  if (action === 'incense') state.incense += mult;
  if (action === 'woodfish') state.woodfish += mult;
  const fortuneNo = action === 'fortune' ? 1 + Math.floor(Math.random() * 60) : 0;
  const fortune = fortuneNo ? cfg.fortunes[Math.floor(Math.random() * cfg.fortunes.length)] : '';
  push();
  io.emit('ritual', { user, action, icon: a.icon, label: a.label, fx: a.fx, say: a.say, wish, gain, mult, fortune, fortuneNo, big: action === 'dragon' });
  return true;
}
const join = (user) => { touch(user); io.emit('join', { user }); push(); };

// ---------- TikTok LIVE (adapter chịu được cả v1 và v2 của tiktok-live-connector) ----------
const who = d => d.user?.nickname || d.nickname || d.user?.uniqueId || d.uniqueId || 'Phật tử';
async function connectTikTok(username) {
  const ticket = ++generation;
  clearTimeout(retryTimer); retryTimer = null;
  const old = conn; conn = null; if (old) { try { old.disconnect(); } catch {} }
  const u = String(username || '').replace(/^@/, '').trim();
  if (!/^[\w.]{2,64}$/.test(u)) return toast('Nhập tài khoản TikTok hợp lệ');
  setSim(false); state.connected = '@' + u; state.live = false; push();
  let mod; try { mod = await import('tiktok-live-connector'); } catch { return toast('Chưa cài tiktok-live-connector (npm install)'); }
  if (ticket !== generation) return;
  const Conn = mod.TikTokLiveConnection || mod.WebcastPushConnection, E = { ...mod.WebcastEvent, ...mod.ControlEvent };
  const current = conn = new Conn(u);
  const on = (ev, fb, fn) => current.on(E[ev] || fb, d => { if (ticket === generation) fn(d); });
  on('CHAT', 'chat', d => ritual(who(d), commentAction(d.comment), d.comment));
  on('LIKE', 'like', d => { const n = who(d);
    const result = consumeLikes(likeAcc[n] || 0, d.likeCount ?? 1, cfg.likesPerBless);
    likeAcc[n] = result.remainder;
    if (result.mult) ritual(n, 'bless', '', result.mult);
  });
  on('MEMBER', 'member', d => join(who(d)));
  on('ROOM_USER', 'roomUser', d => { state.viewers = d.viewerCount ?? state.viewers; push(); });
  on('GIFT', 'gift', d => { const gift = giftRitual(d, cfg); if (gift) ritual(who(d), gift.action, '', gift.mult); });
  const lost = (why) => { if (ticket !== generation) return; state.live = false; push(); toast(why); if (state.connected) scheduleRetry(u); };
  on('DISCONNECTED', 'disconnected', () => lost('Mất kết nối TikTok, đang thử lại…'));
  on('ERROR', 'error', e => toast('Lỗi TikTok: ' + (e?.exception?.message || e?.info || e?.message || String(e))));
  try { await current.connect(); if (ticket !== generation) { current.disconnect(); return; } retry = 0; state.connected = '@' + u; state.live = true; push(); toast('Đã kết nối @' + u); }
  catch (e) { if (ticket !== generation) return; state.connected = '@' + u; lost('Không kết nối được @' + u + ': ' + (e.message || e) + ' (phòng chưa LIVE hoặc bị giới hạn)'); }
}
function scheduleRetry(u) { clearTimeout(retryTimer); const wait = Math.min(60000, 3000 * 2 ** retry++); retryTimer = setTimeout(() => connectTikTok(u), wait); }

// ---------- Giả lập người xem (chỉ để test) ----------
const pick = a => a[Math.floor(Math.random() * a.length)];
function setSim(on) {
  clearInterval(simTimer); simTimer = null; if (!on) { push(); return; }
  if (state.connected) { toast('Ngắt kết nối LIVE trước khi bật giả lập thử nghiệm'); push(); return; }
  simTimer = setInterval(() => {
    const n = pick(cfg.fakeNames) + ' · TEST ' + (1 + Math.floor(Math.random() * 40)); if (Math.random() < 0.25) join(n);
    const keys = Object.keys(cfg.actions).filter(k => k !== 'dragon'); ritual(n, pick(keys), pick(cfg.fakeWishes));
    state.viewers = 30 + Math.floor(Math.random() * 30);
  }, 1800);
  push();
}

// ---------- REST ----------
const ok = (res) => res.json({ ok: true });
app.post('/api/connect', (q, r) => { if (!/^[\w.]{2,64}$/.test(String(q.body.username || '').replace(/^@/, '').trim())) return r.status(400).json({ok:false,error:'Nhập tài khoản TikTok hợp lệ'}); retry = 0; connectTikTok(q.body.username).catch(e => toast('Lỗi kết nối: ' + e.message)); ok(r); });
app.post('/api/disconnect', (_q, r) => { ++generation; clearTimeout(retryTimer); retry = 0; state.connected = ''; try { conn?.disconnect(); } catch {} conn = null; state.connected = ''; state.live = false; push(); ok(r); });
app.post('/api/trigger', (q, r) => { const { user = 'Khách', action, wish = '' } = q.body; r.json({ ok: ritual(user, action, wish) }); });
app.post('/api/simulate', (q, r) => { setSim(!!q.body.on); ok(r); });
app.post('/api/audio', (q, r) => { for (const key of ['enabled','voice','music']) if (typeof q.body[key] === 'boolean') state.audio[key] = q.body[key];
  for (const key of ['musicVol','voiceVol']) if (Number.isFinite(q.body[key])) state.audio[key] = Math.max(0, Math.min(1, q.body[key])); push(); ok(r); });
app.post('/api/reset', (_q, r) => { likeAcc = Object.create(null); Object.assign(state, { merit: 0, incense: 0, woodfish: 0, scores: Object.create(null), devotees: Object.create(null) }); push(); ok(r); });
app.get('/api/state', (_q, r) => r.json(publicState()));
app.get('/api/audio-files', (_q, r) => { const found = {}; for (const name of [...Object.keys(cfg.actions), 'background']) { for (const ext of ['mp3','ogg','wav']) { const file = `assets/audio/${name}.${ext}`; if (fs.existsSync(new URL('./public/' + file, import.meta.url))) { found[name] = file; break; } } } r.json(found); });
app.get('/api/actions', (_q, r) => r.json(cfg.actions));
app.get('/api/config', (_q, r) => r.json(cfg));
app.post('/api/config', (q, r) => { const next = q.body;
  if (!next || !next.actions || !next.giftMap || !next.unknownGift || !Number.isInteger(next.likesPerBless) || next.likesPerBless < 1 || !Number.isInteger(next.maxDevotees) || next.maxDevotees < 1 || next.maxDevotees > 40 || !['fortunes','fakeNames','fakeWishes'].every(k => Array.isArray(next[k]) && next[k].length && next[k].every(v => typeof v === 'string')) || !Object.keys(cfg.actions).every(k => next.actions[k] && Number.isFinite(next.actions[k].merit) && next.actions[k].merit >= 0) || !Object.values(next.giftMap).every(k => Object.hasOwn(next.actions,k))) return r.status(400).json({ok:false,error:'Cấu hình không hợp lệ; kiểm tra nghi thức, điểm, danh sách và giới hạn 1–40 phật tử'});
  cfg = next; fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2)); push(); ok(r); });
io.on('connection', s => s.emit('state', publicState()));

const PORT = process.env.PORT || 3000;
server.listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`Overlay:  http://localhost:${PORT}/overlay.html\nĐiều khiển: http://localhost:${PORT}/control.html\nAdmin:    http://localhost:${PORT}/admin.html`));
