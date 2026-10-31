const $ = (s) => document.querySelector(s), post = (u, b = {}) => fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(async r => { const data = await r.json(); if (!r.ok) { $('#status').textContent = data.error || 'Yêu cầu thất bại'; } return data; }).catch(() => { $('#status').textContent = 'Mất kết nối máy chủ'; return {ok:false}; });
let audio = {}, simOn = false;
const setTg = (b, on, txt) => { b.classList.toggle('on', on); b.classList.toggle('off', !on); b.textContent = txt; };
const slider = (id, vid, key) => { const r = $(id), v = $(vid), set = () => { v.textContent = r.value + '%'; r.style.setProperty('--v', r.value + '%'); };
  r.oninput = set; r.onchange = () => post('/api/audio', { [key]: r.value / 100 }); set(); return { r, set }; };
const sM = slider('#rMusic', '#vMusic', 'musicVol'), sV = slider('#rVoice', '#vVoice', 'voiceVol');

$('#btnAudio').onclick = async () => { await TempleAudio.unlock(); await post('/api/audio', { enabled: !audio.enabled }); };
$('#btnDisconnect').onclick = () => post('/api/disconnect');
$('#tgVoice').onclick = () => post('/api/audio', { voice: !audio.voice });
$('#tgMusic').onclick = () => post('/api/audio', { music: !audio.music });
$('#btnConnect').onclick = () => { $('#status').textContent = 'Đang kết nối…'; post('/api/connect', { username: $('#user').value }); };
$('#tgSim').onclick = () => { simOn = !simOn; post('/api/simulate', { on: simOn }); setTg($('#tgSim'), simOn, `🤖 Tự động Giả lập Người Xem: ${simOn ? 'BẬT' : 'TẮT'}`); };
$('#btnReset').onclick = () => confirm('Xoá toàn bộ công đức và phật tử?') && post('/api/reset');
document.querySelectorAll('[data-a]').forEach(b => b.onclick = () => post('/api/trigger', { user: $('#name').value.trim() || 'Khách', action: b.dataset.a, wish: $('#wish').value }));

const sock = io();
sock.on('state', s => { audio = s.audio; TempleAudio.apply(audio); simOn = s.simulation;
  setTg($('#tgSim'), simOn, `🤖 Giả lập thử nghiệm: ${simOn ? 'BẬT' : 'TẮT'}`);
  setTg($('#tgVoice'), audio.voice, `🎙️ Giọng Đọc: ${audio.voice ? 'BẬT' : 'TẮT'}`); setTg($('#tgMusic'), audio.music, `🎵 Nhạc Nền: ${audio.music ? 'BẬT' : 'TẮT'}`);
  $('#btnAudio').style.opacity = audio.enabled ? 1 : .75; $('#btnAudio').title = audio.enabled ? 'Âm thanh đang BẬT – bấm để tắt' : 'Bấm để bật âm thanh';
  if (document.activeElement !== sM.r) { sM.r.value = Math.round(audio.musicVol * 100); sM.set(); } if (document.activeElement !== sV.r) { sV.r.value = Math.round(audio.voiceVol * 100); sV.set(); }
  $('#status').textContent = s.connected ? `${s.live ? '🟢 Đã kết nối' : '🟠 Đang thử lại'} ${s.connected} · ${s.viewers} người xem` : 'Chưa kết nối'; });
sock.on('toast', m => $('#status').textContent = m);

sock.on('ritual', r => { TempleAudio.play(r.action); TempleAudio.speak(`${r.user} ${r.say}. ${r.fortune || r.wish || ''}`); });
