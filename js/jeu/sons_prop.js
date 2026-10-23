// =====================================================================
//  LES SONS DU PROP HUNT — lot L-F (23/10), sur le squelette du socle S0
// =====================================================================
// Les huit provocations, SYNTHÉTISÉES (aucun fichier, aucune licence : des oscillateurs et un bruit blanc, comme
// js/audio.js), et les petits bruits des props — frottement d'un meuble qui court, « pouf » d'un changement de forme,
// « aïe » d'un meuble touché, « crac » d'un meuble éliminé, bip du scanner, craquement du défigement, « toc » d'un petit
// saut — plus le sifflet du lâcher, les bips des 10 dernières secondes, la ritournelle de fin de manche et le « bonk » du
// chasseur qui tire dans un vrai meuble (spec §§ 3.9, 4.5.14, 5.5.9). Tout passe par `sonsJeu.jouer3d` (js/jeu/sons_jeu.js,
// L-H : spatialisation, occlusion par les murs, retard, 24 voix au plus) ; ce module n'écoute que les ÉVÉNEMENTS de la
// partie et lit son état — il ne commande jamais une règle.
//   - À TRAVERS UNE DALLE (la source et l'auditeur à deux niveaux différents) : × 0,35 et passe-bas 900 Hz — « ça vient
//     d'en dessous » (la voix porte `dalle: 'faite'` : SonsJeu n'y remet pas sa règle « autre niveau ») ;
//   - au-delà de son rayon (18 à 30 m pour une provocation, 7 m pour un frottement…), un son n'est pas joué ;
//   - tant que SonsJeu ne spatialise pas (le squelette du socle ; `sonsJeu.spatial` faux), ce module atténue lui-même
//     avec la distance (modèle inverse, référence 2 m, atténuation 1,2 : celui de L-H) et place le son à gauche ou à
//     droite (StereoPannerNode) — sans quoi le chasseur n'entendrait pas d'où vient une provocation ;
//   - Haythem CHASSEUR n'entend RIEN des props avant la traque (règle d'équité : il suivrait les frottements à l'oreille).
// Une recette = (ctx, sortie, quand, bruit) → durée (s) : ses nœuds partent à `quand` et s'arrêtent tous à `quand + durée`
// au plus tard (les tests lisent ce qui est PROGRAMMÉ, js/jeu/harnais.js journalAudio).
import { niveauDe } from './constantes.js';

// { id, label, icone, duree (s), rayon (m), points } (§ 3.9)
export const PROVOCATIONS = [
  { id: 'coucou', label: '« Coucou ! » sifflé', icone: '👋', duree: 0.6, rayon: 18, points: 5 },
  { id: 'sifflet', label: 'Sifflet d’arbitre', icone: '📣', duree: 0.7, rayon: 22, points: 6 },
  { id: 'klaxon', label: 'Klaxon pouet-pouet', icone: '📯', duree: 0.8, rayon: 25, points: 7 },
  { id: 'canard', label: 'Canard', icone: '🦆', duree: 0.9, rayon: 18, points: 5 },
  { id: 'rire', label: 'Rire « hihihi »', icone: '😜', duree: 1.2, rayon: 20, points: 6 },
  { id: 'sonnerie', label: 'Sonnerie de l’école', icone: '🔔', duree: 1.6, rayon: 30, points: 10 },
  { id: 'badumtss', label: 'Ba-dum-tss', icone: '🥁', duree: 1.0, rayon: 22, points: 7 },
  { id: 'telephone', label: 'Sonnerie de téléphone', icone: '📱', duree: 1.4, rayon: 26, points: 8 },
];
// les réglages des sons (rayons des petits bruits, la dalle, le modèle de distance du secours)
export const REGLAGES_SONS = {
  dalle: { gain: 0.35, coupure: 900 },
  rayons: { frottement: 7, pouf: 10, aie: 18, crac: 20, bip: 12, craquement: 4, toc: 6 },
  distance: { reference: 2, attenuation: 1.2, max: 60 },
  provocation: 0.42, forcee: 1.3,                   // (le volume d'une provocation ; × 1,3 forcée : elle porte plus loin)
};

// ---------------------------------------------------------------- LES BRIQUES (oscillateur, souffle, enveloppe)
const P0 = 0.0001;
// une enveloppe sur `g` : attaque jusqu'à `vol`, tenue, extinction exponentielle jusqu'à t1
function enveloppe(g, t0, t1, vol, attaque = 0.008, tenue = 0) {
  const ta = Math.min(t1, t0 + attaque), tt = Math.min(t1, Math.max(ta, t0 + tenue));
  g.gain.setValueAtTime(P0, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(P0 * 2, vol), ta);
  if (tt > ta) g.gain.setValueAtTime(Math.max(P0 * 2, vol), tt);
  g.gain.exponentialRampToValueAtTime(P0, t1);
}
// une note : oscillateur `type` de f0 à f1 (glissé exponentiel), de quand + debut pendant `duree`
function note(ctx, out, quand, { type = 'sine', f0, f1 = f0, debut = 0, duree, vol, attaque = 0.008, tenue = 0, vers = null }) {
  const t0 = quand + debut, t1 = t0 + duree, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t0);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t1);
  enveloppe(g, t0, t1, vol, attaque, tenue);
  o.connect(g); g.connect(vers || out);
  o.start(t0); o.stop(t1);
  return o;
}
// un souffle : le bruit blanc précalculé, filtré (type, f → f1), de quand + debut pendant `duree`
function souffle(ctx, out, quand, bruit, { debut = 0, duree, vol, type = 'bandpass', f = 1000, f1 = null, q = 0.8, attaque = 0.005, tenue = 0 }) {
  const t0 = quand + debut, t1 = t0 + duree, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = bruit; s.loop = true;
  fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t0);
  if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t1);
  enveloppe(g, t0, t1, vol, attaque, tenue);
  s.connect(fl); fl.connect(g); g.connect(out);
  s.start(t0, Math.random() * 0.8); s.stop(t1);
  return s;
}
// une modulation : un oscillateur basse fréquence ajouté à un paramètre (vibrato, trille, battement de cloche)
function lfo(ctx, param, quand, duree, f, prof, type = 'sine') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f; g.gain.value = prof;
  o.connect(g); g.connect(param); o.start(quand); o.stop(quand + duree);
  return o;
}

// ---------------------------------------------------------------- LES HUIT PROVOCATIONS (durées du § 3.9)
const RECETTES = {
  // « Coucou ! » sifflé : deux notes de sifflet de la bouche, la seconde plus basse (1 320 → 1 100 Hz), un peu de souffle
  coucou(ctx, out, q, b) {
    const a = note(ctx, out, q, { f0: 1320, f1: 1260, duree: 0.24, vol: 0.34, attaque: 0.03, tenue: 0.12 });
    lfo(ctx, a.frequency, q, 0.24, 6, 14);
    const c = note(ctx, out, q, { f0: 1110, f1: 1060, debut: 0.30, duree: 0.30, vol: 0.32, attaque: 0.03, tenue: 0.14 });
    lfo(ctx, c.frequency, q + 0.30, 0.30, 6, 12);
    souffle(ctx, out, q, b, { duree: 0.24, vol: 0.03, f: 2600, q: 2 });
    souffle(ctx, out, q, b, { debut: 0.30, duree: 0.30, vol: 0.03, f: 2300, q: 2 });
    return 0.6;
  },
  // le sifflet d'arbitre : la bille qui roule (trille à 28 Hz) sur un sifflement à 2,9 kHz, et le souffle
  sifflet(ctx, out, q, b) {
    const a = note(ctx, out, q, { f0: 2900, duree: 0.7, vol: 0.22, attaque: 0.015, tenue: 0.58 });
    lfo(ctx, a.frequency, q, 0.7, 28, 190, 'triangle');
    const c = note(ctx, out, q, { f0: 2960, duree: 0.68, vol: 0.06, attaque: 0.02, tenue: 0.55 });
    lfo(ctx, c.frequency, q, 0.68, 28, 200, 'triangle');
    souffle(ctx, out, q, b, { duree: 0.7, vol: 0.05, f: 3100, q: 3, tenue: 0.55 });
    return 0.7;
  },
  // le klaxon de vélo pouet-pouet : deux coups de poire, deux carrés presque à l'unisson, filtrés (la trompe)
  klaxon(ctx, out, q) {
    for (const [d, du] of [[0, 0.32], [0.42, 0.38]]) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1700; f.Q.value = 3; f.connect(out);
      note(ctx, out, q, { type: 'square', f0: 360, f1: 420, debut: d, duree: du, vol: 0.12, attaque: 0.03, tenue: du * 0.6, vers: f });
      note(ctx, out, q, { type: 'square', f0: 366, f1: 427, debut: d, duree: du, vol: 0.09, attaque: 0.03, tenue: du * 0.6, vers: f });
    }
    return 0.8;
  },
  // le canard : trois « coin » nasillards (dent de scie 640 → 380 Hz par un formant à 1,1 kHz)
  canard(ctx, out, q, b) {
    for (const [d, du] of [[0, 0.26], [0.30, 0.26], [0.60, 0.30]]) {
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1150; f.Q.value = 3.5; f.connect(out);
      note(ctx, out, q, { type: 'sawtooth', f0: 660, f1: 380, debut: d, duree: du, vol: 0.5, attaque: 0.015, tenue: du * 0.35, vers: f });
      souffle(ctx, out, q, b, { debut: d, duree: du * 0.6, vol: 0.04, f: 1000, q: 2 });
    }
    return 0.9;
  },
  // le rire « hihihi » : cinq « hi » qui descendent, triangle et son harmonique
  rire(ctx, out, q) {
    const F = [1120, 1070, 1010, 960, 900];
    F.forEach((f0, i) => {
      const d = i * 0.22, du = i === 4 ? 0.32 : 0.16;
      note(ctx, out, q, { type: 'triangle', f0, f1: f0 * 0.84, debut: d, duree: du, vol: 0.28, attaque: 0.01, tenue: du * 0.3 });
      note(ctx, out, q, { f0: f0 * 2.02, f1: f0 * 1.7, debut: d, duree: du * 0.8, vol: 0.05, attaque: 0.01 });
    });
    return 1.2;
  },
  // la sonnerie de l'école : la cloche électrique, un carré à 980 Hz battu à 22 Hz par le marteau, et son partiel
  sonnerie(ctx, out, q) {
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.9;
    const m = ctx.createGain(); m.gain.value = 0.6; m.connect(f); f.connect(out);
    lfo(ctx, m.gain, q, 1.6, 22, 0.4, 'square');
    note(ctx, out, q, { type: 'square', f0: 980, duree: 1.6, vol: 0.2, attaque: 0.01, tenue: 1.45, vers: m });
    note(ctx, out, q, { type: 'square', f0: 2460, duree: 1.55, vol: 0.05, attaque: 0.01, tenue: 1.4, vers: m });
    return 1.6;
  },
  // ba-dum-tss : deux toms, la grosse caisse, et la cymbale qui s'éteint
  badumtss(ctx, out, q, b) {
    note(ctx, out, q, { f0: 185, f1: 95, duree: 0.16, vol: 0.55, attaque: 0.003 });
    note(ctx, out, q, { f0: 145, f1: 80, debut: 0.17, duree: 0.18, vol: 0.55, attaque: 0.003 });
    note(ctx, out, q, { f0: 115, f1: 48, debut: 0.38, duree: 0.22, vol: 0.6, attaque: 0.003 });
    souffle(ctx, out, q, b, { debut: 0.38, duree: 0.62, vol: 0.22, type: 'highpass', f: 7000, q: 0.7, attaque: 0.002 });
    return 1.0;
  },
  // la sonnerie de téléphone : deux salves de la double tonalité 1 200 / 1 500 Hz alternée à 20 Hz
  telephone(ctx, out, q) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3500; f.connect(out);
    for (const [d, du] of [[0, 0.6], [0.8, 0.6]]) {
      const ga = ctx.createGain(), gb = ctx.createGain(); ga.connect(f); gb.connect(f);
      const t0 = q + d, n = Math.round(du / 0.025);
      for (let k = 0; k < n; k++) { const t = t0 + k * 0.025, A = k % 2 === 0; ga.gain.setValueAtTime(A ? 1 : 0, t); gb.gain.setValueAtTime(A ? 0 : 1, t); }
      note(ctx, out, q, { type: 'square', f0: 1200, debut: d, duree: du, vol: 0.1, attaque: 0.01, tenue: du - 0.06, vers: ga });
      note(ctx, out, q, { type: 'square', f0: 1500, debut: d, duree: du, vol: 0.1, attaque: 0.01, tenue: du - 0.06, vers: gb });
    }
    return 1.4;
  },
};

// ---------------------------------------------------------------- LES PETITS BRUITS DES PROPS (et du jeu)
const BRUITS = {
  // un meuble qui court : il frotte sur le carrelage (bois, plastique, métal mêlés)
  frottement(ctx, out, q, b) {
    const f = 650 + Math.random() * 500;
    souffle(ctx, out, q, b, { duree: 0.17, vol: 0.32, f, f1: f * 1.5, q: 1.4, attaque: 0.02 });
    souffle(ctx, out, q, b, { duree: 0.14, vol: 0.16, type: 'lowpass', f: 320, q: 0.7, attaque: 0.01 });
    return 0.17;
  },
  // « pouf » : un changement de forme (une bouffée, un coup sourd)
  pouf(ctx, out, q, b) {
    souffle(ctx, out, q, b, { duree: 0.35, vol: 0.45, type: 'lowpass', f: 2800, f1: 340, q: 0.6, attaque: 0.004 });
    note(ctx, out, q, { f0: 170, f1: 70, duree: 0.24, vol: 0.28, attaque: 0.004 });
    return 0.35;
  },
  // « aïe ! » : un meuble touché (une voix de dessin animé : dent de scie par deux formants, vibrato)
  aie(ctx, out, q) {
    const m = ctx.createGain(); m.gain.value = 1;
    for (const [fr, Q] of [[780, 7], [1250, 7], [2600, 5]]) { const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fr; f.Q.value = Q; m.connect(f); f.connect(out); }
    const o = note(ctx, out, q, { type: 'sawtooth', f0: 560, f1: 360, duree: 0.32, vol: 0.9, attaque: 0.012, tenue: 0.1, vers: m });
    lfo(ctx, o.frequency, q, 0.32, 9, 22);
    return 0.32;
  },
  // « crac » : un meuble éliminé (des éclats secs, un coup sourd, des débris qui retombent)
  crac(ctx, out, q, b) {
    [[0, 0.5], [0.04, 0.35], [0.09, 0.28], [0.15, 0.18]].forEach(([d, v]) => souffle(ctx, out, q, b, { debut: d, duree: 0.05, vol: v, type: 'highpass', f: 1500, q: 0.8, attaque: 0.001 }));
    note(ctx, out, q, { f0: 125, f1: 50, duree: 0.22, vol: 0.4, attaque: 0.002 });
    souffle(ctx, out, q, b, { debut: 0.1, duree: 0.45, vol: 0.06, f: 3200, q: 3, attaque: 0.01 });
    return 0.55;
  },
  // le bip du scanner : un « ping » de sonar qui s'éteint
  bip(ctx, out, q) {
    note(ctx, out, q, { f0: 1850, f1: 1760, duree: 0.45, vol: 0.26, attaque: 0.004 });
    note(ctx, out, q, { f0: 3700, f1: 3520, duree: 0.3, vol: 0.04, attaque: 0.004 });
    return 0.45;
  },
  // le défigement : la chaise qui craque
  craquement(ctx, out, q, b) {
    [0, 0.05, 0.11, 0.19].forEach((d, i) => souffle(ctx, out, q, b, { debut: d, duree: 0.03, vol: 0.2 - i * 0.03, f: 1700 + i * 200, q: 4, attaque: 0.001 }));
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 640; f.Q.value = 5; f.connect(out);
    note(ctx, out, q, { type: 'sawtooth', f0: 95, f1: 145, duree: 0.25, vol: 0.22, attaque: 0.02, vers: f });
    return 0.25;
  },
  // « toc » : un meuble qui retombe d'un petit saut
  toc(ctx, out, q, b) {
    note(ctx, out, q, { f0: 430, f1: 280, duree: 0.11, vol: 0.3, attaque: 0.002 });
    souffle(ctx, out, q, b, { duree: 0.04, vol: 0.16, f: 1800, q: 2, attaque: 0.001 });
    return 0.12;
  },
  // le chasseur a tiré dans un VRAI meuble : un « bonk » mat qui descend (le retour, pour lui seul)
  bonk(ctx, out, q, b) {
    note(ctx, out, q, { type: 'triangle', f0: 320, f1: 170, duree: 0.22, vol: 0.32, attaque: 0.003 });
    souffle(ctx, out, q, b, { duree: 0.08, vol: 0.12, type: 'lowpass', f: 650, q: 0.7, attaque: 0.002 });
    return 0.22;
  },
  // le lâcher des chasseurs : deux coups de sifflet d'arbitre
  lacher(ctx, out, q, b) {
    for (const [d, du] of [[0, 0.32], [0.42, 0.62]]) {
      const a = note(ctx, out, q, { f0: 2900, debut: d, duree: du, vol: 0.26, attaque: 0.012, tenue: du * 0.8 });
      lfo(ctx, a.frequency, q + d, du, 28, 190, 'triangle');
      souffle(ctx, out, q, b, { debut: d, duree: du, vol: 0.05, f: 3100, q: 3, tenue: du * 0.8 });
    }
    return 1.04;
  },
  // les 10 dernières secondes de la cachette : deux bips courts
  bips(ctx, out, q) {
    note(ctx, out, q, { f0: 990, duree: 0.08, vol: 0.18, attaque: 0.003, tenue: 0.05 });
    note(ctx, out, q, { f0: 990, debut: 0.16, duree: 0.08, vol: 0.18, attaque: 0.003, tenue: 0.05 });
    return 0.24;
  },
  // la fin d'une manche : un arpège qui monte (les props gagnent) ou qui descend (les chasseurs gagnent)
  victoireProps(ctx, out, q) {
    [523, 659, 784, 1047].forEach((f, i) => note(ctx, out, q, { type: 'triangle', f0: f, debut: i * 0.13, duree: i === 3 ? 0.55 : 0.2, vol: 0.2, attaque: 0.005, tenue: 0.06 }));
    return 0.94;
  },
  victoireChasseurs(ctx, out, q) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400; f.connect(out);
    [784, 659, 523, 392].forEach((fr, i) => note(ctx, out, q, { type: 'square', f0: fr, debut: i * 0.13, duree: i === 3 ? 0.55 : 0.2, vol: 0.09, attaque: 0.005, tenue: 0.06, vers: f }));
    return 0.94;
  },
};
export const RECETTES_PROP = { ...RECETTES, ...BRUITS };

// le bruit blanc d'une seconde, fait UNE fois par contexte audio (jamais un tampon par son)
const _bruits = new WeakMap();
function bruitDe(ctx) {
  let b = _bruits.get(ctx);
  if (!b) {
    const n = ctx.sampleRate; b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    _bruits.set(ctx, b);
  }
  return b;
}

export class SonsProp {
  constructor(sonsJeu) {
    this.sons = sonsJeu; this.partie = null; this._des = [];
    this.journal = [];               // les derniers sons joués { nom, t, x, y, z, dalle, gain } (lus par les tests et la mise au point)
    this.muets = 0;                  // ceux qu'une règle a tus (Haythem chasseur avant la traque)
  }
  brancher(partie) {
    this.debrancher();
    this.partie = partie;
    const S = (type, f) => this._des.push(partie.sur(type, f));
    const R = REGLAGES_SONS.rayons;
    S('provocation', (e) => {
      const P = PROVOCATIONS[e.n] || PROVOCATIONS.find((p) => p.id === e.id);
      if (P) this.jouer(P.id, e.x, e.y, e.z, { rayon: e.rayon || P.rayon, gain: REGLAGES_SONS.provocation * (e.forcee ? REGLAGES_SONS.forcee : 1), deProp: e.a });
    });
    S('frottement', (e) => this.jouer('frottement', e.x, e.y, e.z, { rayon: R.frottement, gain: 0.6, deProp: e.a }));
    S('deguise', (e) => this.jouer('pouf', e.x, e.y, e.z, { rayon: R.pouf, gain: 0.8, deProp: e.a }));
    S('defige', (e) => this.jouer('craquement', e.x, e.y, e.z, { rayon: R.craquement, gain: 0.8, deProp: e.a }));
    S('reception', (e) => { const a = partie.acteurParId(e.a); if (a && a.prop) this.jouer('toc', a.pos.x, a.pos.y, a.pos.z, { rayon: R.toc, gain: 0.8, deProp: e.a }); });
    S('touche', (e) => { const c = partie.acteurParId(e.cible); if (c && c.role === 'prop' && c.prop) this.jouer('aie', c.pos.x, c.pos.y, c.pos.z, { rayon: R.aie, gain: 0.55 }); });
    S('elim', (e) => { const c = partie.acteurParId(e.cible); if (c && c.role === 'prop' && c.prop) this.jouer('crac', e.x, e.y, e.z, { rayon: R.crac, gain: 0.8 }); });
    S('scanner', (e) => this._scanner(e));
    S('faux', (e) => { const L = partie.local; if (L && e.a === L.id) this.jouer('bonk', 0, 0, 0, { local: true, gain: 0.7 }); });
    S('phase', (e) => {
      if (e.phase === 'traque') this.jouer('lacher', 0, 0, 0, { local: true, gain: 0.8 });
      else if (e.phase === 'revelation') this.jouer(partie.gagnantManche === 'props' ? 'victoireProps' : 'victoireChasseurs', 0, 0, 0, { local: true, gain: 0.7 });
    });
    S('annonce', (e) => { if (e.cls === 'alerte' && /^10 /.test(e.texte)) this.jouer('bips', 0, 0, 0, { local: true, gain: 0.7 }); });
  }
  debrancher() { for (const d of this._des) d(); this._des = []; this.partie = null; }
  // le scanner : le chasseur qui scanne entend son ping ; un prop à moins de 12 m (au même niveau) l'entend aussi
  _scanner(e) {
    const P = this.partie, L = P && P.local; if (!L) return;
    if (e.a === L.id) { this.jouer('bip', e.x, e.y, e.z, { local: true, gain: 0.8 }); return; }
    if (L.role === 'prop' && L.vivant && L.corps && Math.hypot(L.pos.x - e.x, L.pos.z - e.z) < (e.portee || 12) && niveauDe(L.pos.y + 0.5) === niveauDe(e.y + 0.5))
      this.jouer('bip', e.x, e.y, e.z, { rayon: REGLAGES_SONS.rayons.bip, gain: 0.7 });
  }
  // L'OREILLE : les pieds de l'acteur que suit la caméra (le prop, le chasseur, ou celui qu'on regarde), sinon la caméra
  _auditeur() {
    const P = this.partie, g = P.game, s = P.suivi && P.suivi.corps ? P.suivi.corps : null, c = g.camera;
    const p = s ? s.posAff || s.pos : c ? c.position : { x: 0, y: 0, z: 0 };
    return { x: p.x, y: s ? (Number.isFinite(s.solAff) ? s.solAff : p.y) : p.y - 1.6, z: p.z, lacet: g.camYaw || 0 };
  }
  // JOUER `nom` aux PIEDS (x, y, z) d'une source : `o` = { rayon, gain = 1, deProp (l'id du prop dont il vient), local
  // (joué à l'oreille : un son du jeu, sans distance ni dalle) } — rend la voix de SonsJeu, ou null
  jouer(nom, x, y, z, o = {}) {
    const P = this.partie, S = this.sons, recette = RECETTES_PROP[nom];
    if (!P || !S || !recette) return null;
    const L = P.local;
    if (o.deProp !== undefined && L && L.role === 'chasseur' && P.phase !== 'traque') { this.muets++; return null; }
    const ec = this._auditeur(), D = REGLAGES_SONS;
    let gain = o.gain ?? 1, dalle = false, pan = 0, sx = x, sy = y + 0.4, sz = z;
    if (o.local) { sx = ec.x; sy = ec.y + 1.6; sz = ec.z; }
    else {
      const d = Math.hypot(x - ec.x, y - ec.y, z - ec.z);
      if (o.rayon && d > o.rayon) return null;
      dalle = niveauDe(y + 0.5) !== niveauDe(ec.y + 0.5);
      if (dalle) gain *= D.dalle.gain;
      if (!S.spatial) {
        const r = D.distance.reference;
        gain *= Math.min(1, r / (r + D.distance.attenuation * Math.max(0, d - r)));
        const dh = Math.hypot(x - ec.x, z - ec.z);
        if (dh > 0.3) pan = Math.max(-1, Math.min(1, ((x - ec.x) * Math.cos(ec.lacet) - (z - ec.z) * Math.sin(ec.lacet)) / dh)) * 0.8;
      }
    }
    const v = S.jouer3d(sx, sy, sz, (ctx, sortie, quand) => {
      // la chaîne : gain (dalle, distance) → passe-bas de la dalle → panoramique (tant que SonsJeu ne spatialise pas) → sortie
      let out = sortie;
      if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.setValueAtTime(pan, quand); p.connect(out); out = p; }
      if (dalle) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 0.7; f.frequency.setValueAtTime(D.dalle.coupure, quand); f.connect(out); out = f; }
      const g = ctx.createGain(); g.gain.setValueAtTime(gain, quand); g.connect(out);
      return recette(ctx, g, quand, bruitDe(ctx));
    }, { gain: 1, rayon: o.rayon || 30, prioritaire: !!o.local, dalle: dalle ? 'faite' : false });
    if (v) { this.journal.push({ nom, t: P.t, x, y, z, dalle, gain }); if (this.journal.length > 64) this.journal.shift(); }
    return v;
  }
  // (une provocation jouée telle quelle, à l'oreille : l'écoute des huit dans les tests et le menu)
  jouerProvocation(n, o = {}) { const P = PROVOCATIONS[n]; return P ? this.jouer(P.id, 0, 0, 0, { local: true, gain: REGLAGES_SONS.provocation, ...o }) : null; }
}
