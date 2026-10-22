// Sons synthétisés en WebAudio (aucun fichier audio à charger) : les pas, le crissement des semelles sur un appui sec,
// la réception d'un saut. Repris de LA CAGE sans le ballon, le cercle, la foule ni les sons du parc.
// À L'INTÉRIEUR, une RÉVERBÉRATION de salle (une réponse impulsionnelle fabriquée : un bruit qui s'éteint en ~0,9 s,
// plus brillant au début) : dans un couloir carrelé, un pas sonne comme dans un couloir, pas comme dans un champ.

export class AudioFX {
  constructor() { this.ctx = null; this.master = null; this.listener = null; this.vol = { master: 0.5, sfx: 1 }; this.envoi = null; this._salle = 0; }

  // volumes du menu Options > Audio (0..1)
  setVolumes(v) {
    this.vol = { master: v.master ?? 0.5, sfx: v.sfx ?? 1 };
    if (this.master) this.master.gain.setTargetAtTime(this.vol.master, this.t, 0.05);
  }

  // position de l'auditeur (caméra) : les sons s'atténuent avec la distance
  setListener(p) { this.listener = p; }

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      // (22/10, socle du jeu : sous ?test=1, le harnais pose `creerContexte` — un OfflineAudioContext, qui ne demande pas de
      // geste : les tests lisent ce qui est PROGRAMMÉ, js/jeu/harnais.js journalAudio)
      this.ctx = this.creerContexte ? this.creerContexte() : new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.vol.master;
      this.master.connect(this.ctx.destination);
      this._reverb();
    }
    if (this.ctx.state === 'suspended' && !(typeof OfflineAudioContext !== 'undefined' && this.ctx instanceof OfflineAudioContext)) this.ctx.resume();
  }

  // La salle : `k` = la part de son réverbéré (0 dehors ; ~0,2 dans un couloir). Posé par le jeu d'après la carte.
  salle(k) {
    this._salle = k;
    if (this.envoi) this.envoi.gain.setTargetAtTime(k, this.t, 0.2);
  }
  _reverb() {
    const sr = this.ctx.sampleRate, n = Math.floor(sr * 1.1), ir = this.ctx.createBuffer(2, n, sr);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c); let b = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr, w = Math.random() * 2 - 1;
        b = 0.82 * b + 0.18 * w;                                       // un peu plus sourd en fin de traîne
        const e = Math.exp(-t / 0.26);
        d[i] = (t < 0.04 ? w : b * 1.6) * e * (i < 64 ? i / 64 : 1);
      }
    }
    const conv = this.ctx.createConvolver(); conv.buffer = ir;
    this.envoi = this.ctx.createGain(); this.envoi.gain.value = this._salle;
    this.envoi.connect(conv); conv.connect(this.master);
  }

  get t() { return this.ctx ? this.ctx.currentTime : 0; }

  // when : départ différé (s), vol déjà atténué par l'appelant
  _osc(type, f0, f1, dur, vol, when = 0) {
    vol *= this.vol.sfx;
    if (!this.ctx || vol <= 0.0011) return;
    const t0 = this.t + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(this.master); if (this.envoi) g.connect(this.envoi);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  _noise(dur, vol, filterType, freq, attack = 0.005, when = 0, q = 0.8) {
    vol *= this.vol.sfx;
    if (!this.ctx || vol <= 0.0011) return;
    const t0 = this.t + when;
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, Math.ceil(sr * dur), sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.master); if (this.envoi) g.connect(this.envoi);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  // BRUITS DE CORPS : au-delà d'une vingtaine de mètres on ne les entend plus du tout
  _attCorps(pos) {
    if (!pos || !this.listener) return 1;
    const d = Math.hypot(pos.x - this.listener.x, (pos.y || 0) - this.listener.y, pos.z - this.listener.z);
    const k = Math.max(0, 1 - Math.max(0, d - 3) / 17);
    return k * k;
  }
  // un pas de baskets sur un sol dur : le coup sourd de la semelle et le frottement de la gomme
  pas(pos, f = 0.5) {
    const a = this._attCorps(pos) * f; if (a < 0.02) return;
    this._noise(0.05, 0.15 * a, 'lowpass', 480 + 420 * f, 0.002, 0, 0.7);
    this._noise(0.022, 0.045 * a, 'bandpass', 2400 + Math.random() * 600, 0.001, 0.004, 1.4);
    this._osc('sine', 92 + Math.random() * 12, 58, 0.07, 0.09 * a);
  }
  // crissement de semelle sur un appui sec : un petit glissando aigu qui accroche deux fois, et la gomme (sur un
  // carrelage, c'est LE son des baskets)
  crissement(pos, f = 0.6) {
    const a = this._attCorps(pos) * f; if (a < 0.03) return;
    const f0 = 1650 + Math.random() * 900;
    this._osc('triangle', f0, f0 * 1.22, 0.10, 0.045 * a);
    this._osc('triangle', f0 * 1.08, f0 * 1.3, 0.08, 0.035 * a, 0.045);
    this._osc('sine', f0 * 2.02, f0 * 2.3, 0.07, 0.012 * a);
    this._noise(0.09, 0.05 * a, 'bandpass', 3200, 0.003, 0, 2.2);
  }
  // réception d'un saut : les deux pieds ensemble, plus lourd qu'un pas
  reception(pos, f = 0.7) {
    const a = this._attCorps(pos) * f; if (a < 0.02) return;
    this._noise(0.09, 0.26 * a, 'lowpass', 420, 0.002, 0, 0.7);
    this._osc('sine', 78, 44, 0.13, 0.22 * a);
    this._noise(0.03, 0.06 * a, 'bandpass', 2200, 0.001, 0.006, 1.2);
  }
}
