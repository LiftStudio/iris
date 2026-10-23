// Sons synthétisés en WebAudio (aucun fichier audio à charger) : les pas, le crissement des semelles sur un appui sec,
// la réception d'un saut. Repris de LA CAGE sans le ballon, le cercle, la foule ni les sons du parc.
// À L'INTÉRIEUR, une RÉVERBÉRATION de salle (une réponse impulsionnelle fabriquée : un bruit qui s'éteint en ~0,9 s,
// plus brillant au début) : dans un couloir carrelé, un pas sonne comme dans un couloir, pas comme dans un champ.
// (23/10/2026, lot L-H du jeu — combat et prop hunt, js/jeu/sons_jeu.js) Quatre choses de plus, sans rien changer à la
// balade :
//   - L'AUDITEUR ORIENTÉ : js/game.js appelle setListener(position, caméra) juste APRÈS updateCamera (la caméra de CETTE
//     image : sur un virage sec de 90°, l'ancien appel avait une image de retard) ; on pose position, avant et haut sur
//     l'auditeur du contexte, qui place les voix spatialisées du jeu ;
//   - LES BRUITS PRÉCALCULÉS : une seconde de bruit blanc et une de bruit rose faites UNE fois à init ; `_noise` allouait
//     un tampon (et tirait 2 000 nombres au hasard) à CHAQUE son — intenable au combat (12 coups/s × 8 tireurs) ;
//   - LA SORTIE SPATIALISÉE : `spatial()` rend le panoramique des voix du jeu ('equalpower', loi 'inverse', plein à 2 m,
//     atténuation 1,2, plus rien ne baisse au-delà de 60 m) et `attenuation(d)` dit la même loi en nombres (le niveau
//     estimé d'une voix à l'auditeur : la plus faible est volée quand il y en a trop) ;
//   - le BUZZER, le SIFFLET et le REFUS de LA CAGE (js/audio.js, l. 178-234 : l'avant-match et la fin d'une manche),
//     avec un départ différé et une sortie facultatifs (une voix du jeu les joue dans SA chaîne).

// LA SORTIE SPATIALISÉE des voix du jeu (spec § 4.5.17) : les mêmes chiffres pour le PannerNode et pour l'estimation
export const SPATIAL = { modele: 'equalpower', loi: 'inverse', reference: 2, attenuation: 1.2, max: 60 };
const _AVANT = [0, 0, 0], _HAUT = [0, 0, 0];

export class AudioFX {
  constructor() {
    this.ctx = null; this.master = null; this.listener = null; this.vol = { master: 0.5, sfx: 1 }; this.envoi = null; this._salle = 0;
    this.bruitBlanc = null; this.bruitRose = null;
  }

  // volumes du menu Options > Audio (0..1)
  setVolumes(v) {
    this.vol = { master: v.master ?? 0.5, sfx: v.sfx ?? 1 };
    if (this.master) this.master.gain.setTargetAtTime(this.vol.master, this.t, 0.05);
  }

  // L'AUDITEUR : sa position (la caméra : les bruits de corps s'atténuent avec la distance, _attCorps) et, quand js/game.js
  // passe la caméra (après updateCamera), son orientation sur l'auditeur du contexte — posées par `.value` (pas de
  // lissage : la voix d'un tir à droite est à droite dans CETTE image). La caméra de three regarde vers −Z, haut +Y.
  setListener(p, camera = null) {
    this.listener = p;
    const L = this.ctx && this.ctx.listener;
    if (!L || !p) return;
    if (camera) orientation(camera, _AVANT, _HAUT);
    else { _AVANT[0] = 0; _AVANT[1] = 0; _AVANT[2] = -1; _HAUT[0] = 0; _HAUT[1] = 1; _HAUT[2] = 0; }
    if (L.positionX) {
      L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z;
      L.forwardX.value = _AVANT[0]; L.forwardY.value = _AVANT[1]; L.forwardZ.value = _AVANT[2];
      L.upX.value = _HAUT[0]; L.upY.value = _HAUT[1]; L.upZ.value = _HAUT[2];
    } else {
      L.setPosition?.(p.x, p.y, p.z);
      L.setOrientation?.(_AVANT[0], _AVANT[1], _AVANT[2], _HAUT[0], _HAUT[1], _HAUT[2]);
    }
  }

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
      this._bruits();
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
  // LES BRUITS PRÉCALCULÉS (une seconde chacun, mono) : le BLANC (tous les sons de bruit de la balade, les claquements du
  // jeu) et le ROSE (−3 dB par octave, la recette de Paul Kellet : le corps des explosions, les souffles) — chaque son
  // part d'un point tiré au hasard dedans, on n'entend jamais deux fois la même seconde au même endroit
  _bruits() {
    const ctx = this.ctx, sr = ctx.sampleRate;
    this.bruitBlanc = ctx.createBuffer(1, sr, sr);
    this.bruitRose = ctx.createBuffer(1, sr, sr);
    const w = this.bruitBlanc.getChannelData(0), r = this.bruitRose.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < sr; i++) {
      const x = Math.random() * 2 - 1;
      w[i] = x;
      b0 = 0.99886 * b0 + x * 0.0555179; b1 = 0.99332 * b1 + x * 0.0750759; b2 = 0.969 * b2 + x * 0.153852;
      b3 = 0.8665 * b3 + x * 0.3104856; b4 = 0.55 * b4 + x * 0.5329522; b5 = -0.7616 * b5 - x * 0.016898;
      r[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362) * 0.11; b6 = x * 0.115926;
    }
  }

  // LA SORTIE SPATIALISÉE d'une voix du jeu (js/jeu/sons_jeu.js) : un PannerNode aux chiffres de SPATIAL
  spatial() {
    const p = this.ctx.createPanner();
    p.panningModel = SPATIAL.modele; p.distanceModel = SPATIAL.loi;
    p.refDistance = SPATIAL.reference; p.rolloffFactor = SPATIAL.attenuation; p.maxDistance = SPATIAL.max;
    p.coneInnerAngle = 360; p.coneOuterAngle = 360; p.coneOuterGain = 1;
    return p;
  }
  // la même loi en nombres : le gain d'une source à `d` m (1 jusqu'à 2 m ; 0,17 à 10 m ; 0,056 à 30 m ; 0,028 à 60 m et au-delà)
  attenuation(d) {
    const r = SPATIAL.reference, x = Math.min(SPATIAL.max, Math.max(r, d));
    return r / (r + SPATIAL.attenuation * (x - r));
  }

  get t() { return this.ctx ? this.ctx.currentTime : 0; }

  // when : départ différé (s), vol déjà atténué par l'appelant ; `sortie` : une autre destination que le master (une voix
  // du jeu, qui a sa chaîne — alors sans envoi vers la salle : la voix a le sien)
  _osc(type, f0, f1, dur, vol, when = 0, sortie = null) {
    vol *= this.vol.sfx;
    if (!this.ctx || vol <= 0.0011) return;
    const t0 = this.t + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    if (sortie) g.connect(sortie);
    else { g.connect(this.master); if (this.envoi) g.connect(this.envoi); }
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  // (23/10 : le bruit blanc PRÉCALCULÉ, un départ au hasard dedans — plus un tampon fait à chaque appel)
  _noise(dur, vol, filterType, freq, attack = 0.005, when = 0, q = 0.8) {
    vol *= this.vol.sfx;
    if (!this.ctx || vol <= 0.0011) return;
    if (!this.bruitBlanc) this._bruits();
    const t0 = this.t + when;
    const src = this.ctx.createBufferSource(); src.buffer = this.bruitBlanc;
    const boucle = dur > 0.9; src.loop = boucle;
    const f = this.ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.master); if (this.envoi) g.connect(this.envoi);
    src.start(t0, boucle ? 0 : Math.random() * (0.98 - dur)); src.stop(t0 + dur + 0.05);
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
  // LE BUZZER (le début et la fin d'une manche), le REFUS (un geste refusé : le buzzer en bref, plus grave) et le SIFFLET
  // (mi-temps) de LA CAGE — `when` : départ différé (s) ; `sortie` : la chaîne d'une voix du jeu (js/jeu/sons_jeu.js)
  buzzer(when = 0, sortie = null) { this._osc('square', 210, 210, 0.9, 0.18, when, sortie); this._osc('square', 214, 214, 0.9, 0.12, when, sortie); }
  refus(when = 0, sortie = null) { this._osc('square', 150, 146, 0.16, 0.11, when, sortie); this._osc('square', 153, 149, 0.16, 0.07, when, sortie); }
  whistle(when = 0, sortie = null) { this._osc('sine', 2300, 2500, 0.35, 0.2, when, sortie); }
}

// l'avant et le haut de la caméra dans le monde : sa rotation à elle quand elle n'a pas de parent (js/game.js : la
// matrice du monde ne serait remise à jour qu'au rendu, après nous), sinon sa matrice du monde mise à jour ici
function orientation(cam, av, ht) {
  if (cam.parent && cam.updateWorldMatrix) {
    cam.updateWorldMatrix(true, false);
    const e = cam.matrixWorld.elements, nz = Math.hypot(e[8], e[9], e[10]) || 1, ny = Math.hypot(e[4], e[5], e[6]) || 1;
    av[0] = -e[8] / nz; av[1] = -e[9] / nz; av[2] = -e[10] / nz; ht[0] = e[4] / ny; ht[1] = e[5] / ny; ht[2] = e[6] / ny;
    return;
  }
  const q = cam.quaternion, x = q.x, y = q.y, z = q.z, w = q.w;
  av[0] = -2 * (x * z + w * y); av[1] = -2 * (y * z - w * x); av[2] = -(1 - 2 * (x * x + y * y));
  ht[0] = 2 * (x * y - w * z); ht[1] = 1 - 2 * (x * x + z * z); ht[2] = 2 * (y * z + w * x);
}
