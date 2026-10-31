// Âm thanh tổng hợp bằng WebAudio (bộ tài nguyên không kèm file âm thanh) + giọng đọc vi-VN.
window.TempleAudio = (() => {
  const MUTE = new URLSearchParams(location.search).has('mute');
  let ctx, master, music, droneOn = false, cfg = { enabled: false, voice: true, music: true, musicVol: .89, voiceVol: .86 };
  const ensure = () => { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
    music = ctx.createGain(); music.gain.value = 0; music.connect(ctx.destination); } return ctx; };
  const env = (g, t, a, d, peak) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const tone = (f, t, a, d, peak, type = 'sine', dest = master) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; env(g, t, a, d, peak); o.connect(g).connect(dest); o.start(t); o.stop(t + a + d + .05); return o; };
  const sfx = {
    bell() { const t = ctx.currentTime; [[196,.5],[392,.3],[588,.2],[823,.12],[1046,.08]].forEach(([f, p], i) => tone(f * (1 + i * .002), t, .01, 4.5 - i * .5, p)); },
    wood() { const t = ctx.currentTime; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(260, t + .12);
      env(g, t, .003, .16, .9); o.connect(g).connect(master); o.start(t); o.stop(t + .25); },
    chime() { const t = ctx.currentTime; [1318, 1568, 1976, 2637].forEach((f, i) => tone(f, t + i * .09, .005, 1.6, .18)); },
    soft() { const t = ctx.currentTime; tone(330, t, .3, 1.2, .12); tone(495, t + .1, .3, 1.2, .08); },
    dragon() { const t = ctx.currentTime; sfx.bell(); [0, .35, .7].forEach(d => tone(98, t + d, .05, 1.8, .35, 'sawtooth')); setTimeout(sfx.chime, 600); },
  };
  let files = {}, background; const active = new Set();
  fetch('/api/audio-files').then(r => r.json()).then(data => { files = data; }).catch(() => {});
  const BY = { incense: 'soft', bless: 'chime', lantern: 'soft', woodfish: 'wood', bell: 'bell', fortune: 'wood', lotus: 'chime', fruit: 'chime', dragon: 'dragon' };
  function drone(on) { if (!ctx) return; if (on && !droneOn) { droneOn = true; const t = ctx.currentTime;
      [110, 110.7, 165, 220.4].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = [.5,.4,.2,.12][i];
        const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = .05 + i * .03; lg.gain.value = .15; l.connect(lg).connect(g.gain); l.start(t); o.connect(g).connect(music); o.start(t); }); }
    music.gain.setTargetAtTime(on ? cfg.musicVol * .22 : 0, ctx.currentTime, .4); }
  return {
    get running() { return ctx && ctx.state === 'running'; },
    async unlock() { if (MUTE) return false; ensure(); await ctx.resume(); this.apply(cfg); return this.running; },
    apply(c) { cfg = { ...cfg, ...c }; if (MUTE) cfg.enabled = false; if (!ctx) return; if (master) master.gain.value = .8 * (cfg.enabled ? 1 : 0); if ((!cfg.enabled || !cfg.voice) && 'speechSynthesis' in window) speechSynthesis.cancel();
      if (!cfg.enabled) for (const a of active) a.pause();
      const on = cfg.enabled && cfg.music && this.running;
      if (files.background) { drone(false); if (!background) { background = new Audio(files.background); background.loop = true; } background.volume = cfg.musicVol; if (on) background.play().catch(() => drone(on)); else background.pause(); } else drone(on); },
    play(action) { if (!this.running || !cfg.enabled) return; const n = BY[action]; if (files[action]) { const a = new Audio(files[action]); active.add(a); a.onended = () => active.delete(a); a.play().catch(() => { active.delete(a); n && sfx[n](); }); } else n && sfx[n](); },
    speak(text) { if (!cfg.enabled || !cfg.voice || !('speechSynthesis' in window)) return; if (speechSynthesis.pending) return; // tránh dồn hàng đợi
      const u = new SpeechSynthesisUtterance(text); u.lang = 'vi-VN'; u.volume = cfg.voiceVol; u.rate = .95; speechSynthesis.speak(u); },
  };
})();
