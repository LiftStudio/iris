// =====================================================================
//  LES SONS DU JEU — lot L-H (23/10/2026 ; spec §§ 3.6, 4.5.17, 5.5.12 ; conception_cod § 7.5)
// =====================================================================
// Tout ce qu'on entend en partie, SYNTHÉTISÉ (aucun fichier, aucune licence), SPATIALISÉ et nourri par les ÉVÉNEMENTS
// de la partie (§ 4.6) et par son état — jamais appelé par la simulation. Les abonnés ne font que noter l'événement :
// le son est fabriqué dans `maj` (une fois par image, après la caméra), dans l'ordre et au décalage où les événements
// sont arrivés entre deux images (un FA-24 à 80 ms entre deux balles garde sa cadence, quelle que soit celle des images),
// et Partie.pas ne paie rien.
//
// UNE VOIX = la recette (ctx, sortie, quand) → durée, jouée dans `gain` (le niveau de la voix ET l'occlusion) →
// `filtre` (passe-bas de l'occlusion) → `panner` (js/audio.js spatial : equalpower, inverse, 2 m, 1,2, 60 m) → le bus
// du jeu (compresseur — 24 voix d'un coup ne saturent pas — puis le passe-bas des explosions, des flashs et de la mort)
// → la sortie ; et un envoi vers la réverbération de la salle (js/audio.js : 0,2 à l'intérieur). 24 voix au plus (12 au
// téléphone) : au-delà, la PLUS FAIBLE à l'auditeur (niveau estimé : gain × loi de distance × occlusion) est volée — ou
// la nouvelle refusée si c'est elle la plus faible. Une voix est LIBÉRÉE sur l'horloge de SonsJeu (`t`, avancée par
// `maj`) quand t ≥ fin = départ + retard + durée de la recette — JAMAIS sur `onended` (sous ?test=1 l'OfflineAudioContext
// n'avance pas : currentTime reste à 0 et onended ne vient jamais).
// L'OCCLUSION par la balistique (`partie.balistique.vue(auditeur, source)` : le DDA du monde solide, lecture seule —
// jamais `C.rayonLibre`, 12 à 106 µs l'appel) : 4 voix par image au plus, à tour de rôle (les nouvelles d'abord), et
// seulement celles qu'on entend encore (niveau estimé au-dessus de −30 dB). Bloquée : −9 dB et passe-bas 700 Hz ; à un
// AUTRE NIVEAU (la dalle) : −14 dB et 400 Hz ; une provocation à travers la dalle (`bas`) : ×0,35 et 900 Hz ;
// changements lissés en 0,1 s. Le RETARD du son : d / 343 s (un tir à 50 m s'entend 0,15 s après son éclair).
// LES RECETTES DE TIR (claquement / corps / grave / mécanique / queue, CoD § 7.5), hauteur ±4 % par coup tirée de la
// graine de la partie (le même coup sonne pareil au rejeu) ; au-delà de 25 m plus de claquement et le corps passe-bas
// 1,2 kHz ; l'habillage AIRSOFT (le défaut) a la recette « gaz » : même structure, claquement deux fois plus court, sans
// grave — il claque encore. Les pas viennent de l'événement `pas` (les couches sont muettes en partie), +4 dB pour un
// ennemi (en CoD on les entend). Rechargements, tir à vide, changement d'arme, balle qui frôle, marqueurs de touche
// (« tic », « ding »), élimination (son sourd + 2e tic), coup reçu (« thwack »), cœur sous 30 PV, explosions (frag,
// flash ; acouphène et passe-bas 600 Hz rouvert en 2 s à moins de 8 m), flash reçue (300 Hz + acouphène), caméra de mort
// (le son étouffé), décompte (bips), buzzer et sifflet de LA CAGE (js/audio.js), captures de la domination, grenades
// (lancer, rebonds lus dans l'état), douilles (« tink », appelé par js/jeu/effets.js). Le prop hunt (provocations,
// frottements, « pouf », bip du scanner…) est à js/jeu/sons_prop.js (L-F), qui joue par `jouer3d`.
import { TELEPHONE } from '../appareil.js';
import { niveauDe, PAS } from './constantes.js';
import { Rng, melanger } from './rng.js';

// LES CHIFFRES DES SONS (§§ 3.6, 4.5.17 ; ceux qui ne sont pas dans la spécification : réglés à l'oreille, 23/10)
export const REGLAGES_SONS = {
  voix: TELEPHONE ? 12 : 24,
  vitesseSon: 343,                                        // m/s : le retard d/343
  occlusion: { parImage: 4, seuilDb: -30, tau: 0.033,     // (τ 0,033 s : 95 % du changement en 0,1 s)
    bloque: { db: -9, hz: 700 }, niveau: { db: -14, hz: 400 }, dalle: { k: 0.35, hz: 900 } },
  claquementMax: 25,                                      // m : au-delà, ni claquement ni mécanique haute
  hauteur: 0.04,                                          // ±4 % par coup
  pasEnnemi: 4,                                           // dB de plus pour les pas d'un ennemi
  // rayons (m) : au-delà, la voix n'est pas créée (l'oreille de Haythem, plus fine que celle des bots, § 3.7)
  rayons: { tir: 75, pas: { sprint: 22, course: 15, marche: 6, accroupi: 4 }, impact: 25, recharge: 10, vide: 6, arme: 6, explosion: 90, flash: 60,
    frole: 4, corps: 15, saut: 10, grenade: 25, douille: 12 },
  // gains de base des voix (avant la loi de distance)
  gains: { tirLocal: 0.9, tir: 0.8, pas: 0.6, pasLocal: 0.3, impact: 0.55, recharge: 0.55, rechargeLocal: 0.6, vide: 0.5, arme: 0.45,
    explosion: 1, flash: 0.9, marqueur: 0.55, tete: 0.5, elim: 0.6, recu: 0.7, frole: 0.6, coeur: 0.5, phase: 0.6, capture: 0.4, douille: 0.35,
    grenade: 0.5, saut: 0.3, glissade: 0.4, corps: 0.35, apparition: 0.25, couteau: 0.5 },
  etouffe: { explosion: { hz: 600, distance: 8, reouverture: 2 }, flash: { hz: 300, reouverture: 2 }, mort: { hz: 450, duree: 3 } },
  acouphene: { hz: 3600, duree: 1.5, gain: 0.1 },
  coeur: { seuil: 30, periode: 60 / 75, hz: 55 },         // deux sinus 55 Hz, 75 battements/min, sous 30 PV
  bus: { seuil: -14, ratio: 4, attaque: 0.003, relache: 0.12 },
};

// LES RECETTES DE TIR (CoD § 7.5) : claquement [passe-haut Hz, s] · corps [filtre, Hz, s, Q] · grave [Hz de départ,
// Hz d'arrivée, s] · mécanique [genre, départ s] · queue (genre)
export const RECETTES_TIR = {
  fa24: { claquement: [2500, 0.006], corps: ['bandpass', 1100, 0.09, 0.9], grave: [95, 45, 0.11], meca: ['clic', 0.035], queue: 'echo' },
  pm9: { claquement: [3000, 0.005], corps: ['bandpass', 1500, 0.07, 0.9], grave: [120, 60, 0.08], meca: ['clicLeger', 0.03], queue: 'echoCourt' },
  fp12: { claquement: [2000, 0.010], corps: ['lowpass', 900, 0.22, 0.7], grave: [70, 35, 0.26], meca: ['pompe', 0.35], queue: 'longue' },
  tp50: { claquement: [3500, 0.008], corps: ['bandpass', 800, 0.18, 0.8], grave: [60, 30, 0.22], meca: ['culasse', 0.25], queue: 'couloir' },
  p17: { claquement: [3500, 0.004], corps: ['bandpass', 1800, 0.06, 1.0], grave: [140, 70, 0.07], meca: ['glissiere', 0.02], queue: 'courte' },
};
// la recette « gaz » de l'Airsoft, tirée de la militaire : claquement 2 × plus court et un peu plus aigu, corps plus haut
// et plus bref (le « tchak » du gaz), SANS grave, la culasse du gaz (pfft + tac) ; la queue gardée
function recetteGaz(R) {
  return { claquement: [R.claquement[0] * 1.2, R.claquement[1] * 0.5], corps: ['bandpass', R.corps[1] * 1.7, R.corps[2] * 0.6, 1.1], grave: null,
    meca: ['gaz', 0.012], queue: R.queue === 'couloir' || R.queue === 'longue' ? 'echo' : R.queue };
}

// ---------------------------------------------------------------- les briques des recettes
// (le bruit précalculé de js/audio.js, un départ au hasard dedans ; les enveloppes exponentielles ; tout rend sa fin, en
// secondes depuis `q0`)
function rafale(ctx, sortie, q0, buf, type, f, Q, dur, vol, att = 0.001, debut = 0, f1 = 0) {
  if (!buf || vol <= 0) return 0;
  const t0 = q0 + debut;
  const s = ctx.createBufferSource(); s.buffer = buf;
  const fi = ctx.createBiquadFilter(); fi.type = type; fi.Q.value = Q;
  fi.frequency.setValueAtTime(f, t0);
  if (f1) fi.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(att, dur * 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fi); fi.connect(g); g.connect(sortie);
  s.start(t0, Math.random() * Math.max(0, buf.duration - dur - 0.03)); s.stop(t0 + dur + 0.02);
  return debut + dur + 0.02;
}
function ton(ctx, sortie, q0, type, f0, f1, dur, vol, att = 0.002, debut = 0) {
  if (vol <= 0) return 0;
  const t0 = q0 + debut;
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(att, dur * 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(sortie); o.start(t0); o.stop(t0 + dur + 0.02);
  return debut + dur + 0.02;
}

// LE TIR : la recette d'une arme (`R`, RECETTES_TIR ou recetteGaz) — `h` la hauteur du coup (0,96-1,04), `loin` (> 25 m),
// `local` (Haythem tire : la mécanique et le coup sourd de près), `dehors` (la rue : l'écho de la façade, pas du couloir)
// ; `meta` reçoit les parties jouées (lues par les tests : { claquement: s, corps, grave, meca, queue })
function recetteTir(B, R, { h = 1, loin = false, local = false, dehors = false, proche = true, meta = null }) {
  return (ctx, out, q) => {
    const W = B.blanc, P = B.rose; let fin = 0;
    const M = meta || {};
    // 1. le CLAQUEMENT : l'onde de choc, un éclat de bruit passe-haut très bref (pas au-delà de 25 m : il se perd)
    if (!loin) { fin = Math.max(fin, rafale(ctx, out, q, W, 'highpass', R.claquement[0] * h, 0.7, R.claquement[1] + 0.004, 1.0, 0.0004)); M.claquement = R.claquement[1]; }
    // 2. le CORPS : le souffle de la poudre (ou du gaz) ; de loin, passe-bas 1,2 kHz
    const [ty, fc, dc, qc] = R.corps;
    fin = Math.max(fin, loin ? rafale(ctx, out, q, P, 'lowpass', 1200 * h, 0.7, dc * 1.4, 0.75, 0.002)
      : rafale(ctx, out, q, W, ty, fc * h, qc, dc, 0.7, 0.001));
    M.corps = loin ? 'passe-bas 1200' : ty + ' ' + Math.round(fc);
    // 3. le GRAVE : le coup dans la poitrine (pas de grave au gaz)
    if (R.grave) { fin = Math.max(fin, ton(ctx, out, q, 'sine', R.grave[0] * h, R.grave[1] * h, R.grave[2], loin ? 0.55 : 0.8, 0.002)); M.grave = R.grave[0] * h; }
    // (Haythem : le coup sourd de l'arme contre l'épaule, qu'on sent plus qu'on n'entend)
    if (local && R.grave) ton(ctx, out, q, 'sine', 62 * h, 38, 0.09, 0.45, 0.003);
    // 4. la MÉCANIQUE : de près seulement
    if (proche && R.meca) { fin = Math.max(fin, mecanique(ctx, out, q, B, R.meca[0], R.meca[1], h, local ? 1 : 0.6)); M.meca = R.meca[0]; }
    // 5. la QUEUE : l'écho du couloir (45 ms, −12 dB) ou de la façade (dehors : 140 ms, −18 dB), la traîne du TP-50
    const ech = dehors ? 0.14 : 0.045, ve = dehors ? 0.125 : 0.25;
    if (R.queue !== 'courte' || !dehors) {
      fin = Math.max(fin, rafale(ctx, out, q, W, ty === 'lowpass' ? 'lowpass' : 'bandpass', (loin ? 1000 : fc * 0.85) * h, 0.8, dc * 1.2, 0.7 * ve, 0.003, ech));
      if (R.grave) ton(ctx, out, q, 'sine', R.grave[0] * 0.9 * h, R.grave[1] * h, R.grave[2], 0.8 * ve, 0.004, ech);
    }
    if (R.queue === 'couloir' || R.queue === 'longue') fin = Math.max(fin, rafale(ctx, out, q, P, 'lowpass', R.queue === 'couloir' ? 520 : 700, 0.6, R.queue === 'couloir' ? 1.2 : 0.55, 0.16, 0.02, 0.03));
    M.queue = R.queue + (dehors ? ' (façade)' : '');
    return fin;
  };
}
// la mécanique d'une arme, `t` après le coup
function mecanique(ctx, out, q, B, genre, t, h, v) {
  const W = B.blanc;
  switch (genre) {
    case 'clic': return Math.max(ton(ctx, out, q, 'square', 3200 * h, 3000 * h, 0.012, 0.05 * v, 0.001, t), rafale(ctx, out, q, W, 'highpass', 4200, 0.8, 0.01, 0.06 * v, 0.0005, t));
    case 'clicLeger': return ton(ctx, out, q, 'square', 3600 * h, 3300 * h, 0.009, 0.04 * v, 0.001, t);
    case 'glissiere': return Math.max(rafale(ctx, out, q, W, 'highpass', 3500, 0.9, 0.015, 0.12 * v, 0.0005, t), ton(ctx, out, q, 'square', 2200 * h, 2000, 0.01, 0.04 * v, 0.001, t + 0.005));
    case 'pompe':                                       // « tchk-tchk » : la pompe tirée puis repoussée
      ton(ctx, out, q, 'sine', 180, 120, 0.05, 0.15 * v, 0.002, t + 0.01);
      rafale(ctx, out, q, W, 'bandpass', 2000, 2, 0.045, 0.28 * v, 0.002, t);
      return rafale(ctx, out, q, W, 'bandpass', 1500, 1.6, 0.055, 0.32 * v, 0.002, t + 0.09);
    case 'culasse':                                     // le levier levé, la culasse tirée, repoussée, verrouillée
      ton(ctx, out, q, 'square', 2600, 2500, 0.01, 0.05 * v, 0.001, t);
      rafale(ctx, out, q, W, 'bandpass', 3000, 1.5, 0.09, 0.14 * v, 0.01, t + 0.03, 3800);
      rafale(ctx, out, q, W, 'bandpass', 2500, 1.5, 0.07, 0.14 * v, 0.01, t + 0.2, 1900);
      return Math.max(ton(ctx, out, q, 'square', 1400, 1300, 0.02, 0.06 * v, 0.001, t + 0.3), rafale(ctx, out, q, W, 'lowpass', 600, 0.8, 0.04, 0.12 * v, 0.002, t + 0.3));
    case 'gaz':                                         // le gaz qui s'échappe et la culasse qui claque
      rafale(ctx, out, q, W, 'highpass', 4000, 0.7, 0.05, 0.16 * v, 0.002, t);
      return ton(ctx, out, q, 'square', 2600 * h, 2400 * h, 0.012, 0.05 * v, 0.001, t + 0.01);
    default: return 0;
  }
}

// ---------------------------------------------------------------- les autres recettes
const RECETTES = {
  // un PAS (la semelle sur le carrelage) : le coup sourd, le frottement, le talon ; `f` la force (0..1)
  pas: (B, f) => (ctx, out, q) => Math.max(
    rafale(ctx, out, q, B.blanc, 'lowpass', 480 + 520 * f, 0.7, 0.055, 0.5 + 0.4 * f, 0.002),
    rafale(ctx, out, q, B.blanc, 'bandpass', 2300 + Math.random() * 700, 1.4, 0.024, 0.16 + 0.12 * f, 0.001, 0.004),
    ton(ctx, out, q, 'sine', 90 + Math.random() * 14, 55, 0.075, 0.3 + 0.25 * f)),
  reception: (B, f) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'lowpass', 420, 0.7, 0.09, 0.8 * f + 0.2, 0.002),
    ton(ctx, out, q, 'sine', 78, 44, 0.13, 0.65 * f + 0.15), rafale(ctx, out, q, B.blanc, 'bandpass', 2200, 1.2, 0.03, 0.2, 0.001, 0.006)),
  saut: (B) => (ctx, out, q) => rafale(ctx, out, q, B.rose, 'bandpass', 900, 0.8, 0.14, 0.35, 0.03),
  glissade: (B) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'bandpass', 800, 0.9, 0.72, 0.45, 0.02, 0, 380),
    rafale(ctx, out, q, B.rose, 'lowpass', 1500, 0.7, 0.3, 0.3, 0.03)),
  // les RECHARGEMENTS (§ 4.6 `recharge` : 'debut' | 'insere' | 'fin')
  rechargeDebut: (B, id) => (ctx, out, q) => id === 'fp12' ? rafale(ctx, out, q, B.rose, 'lowpass', 1500, 0.7, 0.16, 0.25, 0.03)
    : Math.max(ton(ctx, out, q, 'square', id === 'p17' ? 3000 : 2500, 2300, 0.01, 0.25, 0.001),
      rafale(ctx, out, q, B.blanc, 'bandpass', 3000, 1.5, 0.12, 0.3, 0.02, 0.05, 2200)),
  rechargeInsere: (B, id) => (ctx, out, q) => id === 'fp12'
    ? Math.max(rafale(ctx, out, q, B.blanc, 'bandpass', 2200, 2, 0.05, 0.4, 0.004, 0, 1500), ton(ctx, out, q, 'square', 2600, 2400, 0.008, 0.15, 0.001, 0.045))
    : Math.max(rafale(ctx, out, q, B.blanc, 'bandpass', 1800, 1.2, 0.035, 0.7, 0.001), ton(ctx, out, q, 'sine', 160, 110, 0.06, 0.6, 0.002),
      ton(ctx, out, q, 'square', 3000, 2800, 0.01, 0.2, 0.001, 0.004)),
  rechargeFin: (B, id, tactique) => (ctx, out, q) => {
    if (tactique) return rafale(ctx, out, q, B.rose, 'lowpass', 1200, 0.7, 0.12, 0.2, 0.02);
    if (id === 'fp12') return mecanique(ctx, out, q, B, 'pompe', 0, 1, 1);
    if (id === 'tp50') return mecanique(ctx, out, q, B, 'culasse', 0, 1, 1);
    rafale(ctx, out, q, B.blanc, 'highpass', 2500, 0.8, 0.022, 0.55, 0.0005);
    return Math.max(ton(ctx, out, q, 'square', 1800, 1600, 0.015, 0.25, 0.001, 0.07), rafale(ctx, out, q, B.blanc, 'bandpass', 1500, 1.2, 0.045, 0.45, 0.002, 0.07));
  },
  vide: (B) => (ctx, out, q) => Math.max(ton(ctx, out, q, 'square', 4000, 3500, 0.008, 0.4, 0.0005), rafale(ctx, out, q, B.blanc, 'highpass', 5000, 0.8, 0.007, 0.3, 0.0005)),
  arme: (B) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.rose, 'lowpass', 1200, 0.7, 0.2, 0.4, 0.04), ton(ctx, out, q, 'square', 2800, 2600, 0.01, 0.2, 0.001, 0.16),
    rafale(ctx, out, q, B.blanc, 'highpass', 3500, 0.8, 0.012, 0.25, 0.0005, 0.17)),
  couteau: (B) => (ctx, out, q) => rafale(ctx, out, q, B.blanc, 'bandpass', 1500, 1.2, 0.18, 0.6, 0.03, 0, 4200),
  // les IMPACTS (§ 4.6 `impact`, mat : mur, plafond, sol, meuble, vitre ; en Airsoft, la peinture)
  impact: (B, mat, peinture) => (ctx, out, q) => {
    const W = B.blanc;
    if (peinture) return Math.max(rafale(ctx, out, q, W, 'bandpass', 750, 0.8, 0.06, 0.7, 0.002, 0, 300), ton(ctx, out, q, 'sine', 300, 150, 0.045, 0.25),
      ton(ctx, out, q, 'square', 2100, 1900, 0.008, 0.12, 0.0005));
    if (mat === 'vitre') {
      let f = rafale(ctx, out, q, W, 'highpass', 3000, 0.8, 0.09, 0.6, 0.0008);
      for (let i = 0; i < 4; i++) f = Math.max(f, ton(ctx, out, q, 'sine', 4000 + Math.random() * 3000, 0, 0.05 + Math.random() * 0.08, 0.1, 0.001, Math.random() * 0.16));
      return f;
    }
    if (mat === 'meuble') return Math.max(rafale(ctx, out, q, W, 'bandpass', 900, 1.5, 0.045, 0.7, 0.001), ton(ctx, out, q, 'triangle', 620, 420, 0.05, 0.25));
    if (mat === 'sol') return Math.max(rafale(ctx, out, q, W, 'lowpass', 500, 0.8, 0.05, 0.7, 0.001), rafale(ctx, out, q, W, 'bandpass', 1500, 1, 0.02, 0.25, 0.0005));
    return Math.max(rafale(ctx, out, q, W, 'bandpass', 2200, 1.1, 0.026, 0.6, 0.0005), rafale(ctx, out, q, W, 'lowpass', 350, 0.8, 0.045, 0.7, 0.001),
      rafale(ctx, out, q, W, 'highpass', 4500, 0.8, 0.015, 0.18, 0.0005, 0.03));
  },
  // les MARQUEURS (à l'oreille) : « tic » (triangle 1,8 kHz, 30 ms) ; tête « ding » (sinus 3,2 kHz 120 ms + harmonique) ;
  // élimination : un son sourd + un 2e tic
  tic: () => (ctx, out, q) => ton(ctx, out, q, 'triangle', 1800, 1800, 0.03, 0.6, 0.001),
  ding: () => (ctx, out, q) => Math.max(ton(ctx, out, q, 'sine', 3200, 3200, 0.12, 0.55, 0.001), ton(ctx, out, q, 'sine', 6400, 6400, 0.08, 0.15, 0.001)),
  elim: (B) => (ctx, out, q) => Math.max(ton(ctx, out, q, 'sine', 72, 48, 0.16, 0.9, 0.002), rafale(ctx, out, q, B.blanc, 'lowpass', 400, 0.7, 0.08, 0.45, 0.002),
    ton(ctx, out, q, 'triangle', 1800, 1800, 0.03, 0.55, 0.001, 0.065)),
  // le COUP REÇU : « thwack » mat (et, en Airsoft, la bille qui claque sur la tenue)
  recu: (B, bille) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.rose, 'lowpass', 700, 0.7, 0.07, 0.9, 0.001), ton(ctx, out, q, 'sine', 120, 60, 0.09, 0.8, 0.002),
    rafale(ctx, out, q, B.blanc, 'bandpass', 1200, 1, 0.02, 0.35, 0.0005), bille ? ton(ctx, out, q, 'square', 2400, 2200, 0.015, 0.18, 0.0005) : 0),
  corps: (B) => (ctx, out, q) => rafale(ctx, out, q, B.rose, 'lowpass', 500, 0.7, 0.05, 0.7, 0.001),
  // la balle qui FRÔLE (< 1,5 m de la tête) : bruit passe-bande 4 kHz balayé, 80 ms (et l'onde de choc d'une vraie balle)
  frole: (B, bille) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'bandpass', bille ? 3200 : 5200, 3, 0.08, 0.7, 0.01, 0, bille ? 1800 : 2600),
    bille ? 0 : rafale(ctx, out, q, B.blanc, 'highpass', 3000, 0.8, 0.006, 0.35, 0.0004)),
  // le CŒUR sous 30 PV : deux sinus 55 Hz
  coeur: () => (ctx, out, q) => Math.max(ton(ctx, out, q, 'sine', 55, 52, 0.09, 0.9, 0.006), ton(ctx, out, q, 'sine', 55, 50, 0.09, 0.65, 0.006, 0.16)),
  acouphene: (duree) => (ctx, out, q) => ton(ctx, out, q, 'sine', REGLAGES_SONS.acouphene.hz, REGLAGES_SONS.acouphene.hz * 0.98, duree, 1, 0.02),
  // les EXPLOSIONS : la frag (claquement, corps rose, coup de 55 Hz, débris), la grenade Airsoft (un pop, le gaz, les
  // billes), la flash (le claquement nu et sa sonnerie)
  frag: (B, loin) => (ctx, out, q) => {
    let f = 0;
    if (!loin) f = rafale(ctx, out, q, B.blanc, 'highpass', 1500, 0.7, 0.018, 1, 0.0004);
    f = Math.max(f, rafale(ctx, out, q, B.rose, 'lowpass', loin ? 500 : 900, 0.7, 0.75, 1, 0.004, 0, 220), ton(ctx, out, q, 'sine', 55, 28, 0.95, 1, 0.004),
      rafale(ctx, out, q, B.rose, 'lowpass', 380, 0.6, 1.6, 0.3, 0.05, 0.05));
    if (!loin) for (let i = 0; i < 6; i++) f = Math.max(f, rafale(ctx, out, q, B.blanc, 'bandpass', 2000 + Math.random() * 2000, 2, 0.02, 0.06 + Math.random() * 0.08, 0.001, 0.12 + Math.random() * 1.1));
    return f;
  },
  fragGaz: (B) => (ctx, out, q) => {
    let f = Math.max(rafale(ctx, out, q, B.blanc, 'highpass', 2500, 0.7, 0.014, 1, 0.0004), ton(ctx, out, q, 'sine', 140, 70, 0.12, 0.6, 0.002),
      rafale(ctx, out, q, B.blanc, 'highpass', 3500, 0.7, 0.45, 0.4, 0.004, 0.01, 1800));
    for (let i = 0; i < 8; i++) f = Math.max(f, rafale(ctx, out, q, B.blanc, 'highpass', 4500, 0.8, 0.01, 0.1, 0.0005, 0.03 + Math.random() * 0.3));
    return f;
  },
  flash: (B) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'highpass', 200, 0.5, 0.035, 1, 0.0003), ton(ctx, out, q, 'sine', 5000, 4300, 0.35, 0.18, 0.002),
    rafale(ctx, out, q, B.blanc, 'highpass', 2500, 0.7, 0.25, 0.3, 0.002, 0.01)),
  lancer: (B, frag) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'bandpass', 700, 1, 0.22, 0.45, 0.04, 0, 1500),
    frag ? Math.max(ton(ctx, out, q, 'sine', 2700, 2650, 0.15, 0.2, 0.001, 0.03), ton(ctx, out, q, 'sine', 5400, 5300, 0.1, 0.07, 0.001, 0.05)) : 0),
  rebond: (B, f) => (ctx, out, q) => Math.max(ton(ctx, out, q, 'triangle', 1150, 1100, 0.06, 0.5 * f, 0.001), ton(ctx, out, q, 'sine', 2300, 2250, 0.04, 0.2 * f, 0.001),
    rafale(ctx, out, q, B.blanc, 'lowpass', 600, 0.7, 0.03, 0.6 * f, 0.001)),
  douille: (B, cartouche) => (ctx, out, q) => cartouche ? ton(ctx, out, q, 'triangle', 1800, 1600, 0.03, 0.5, 0.001)
    : Math.max(ton(ctx, out, q, 'sine', 4200 + Math.random() * 300, 0, 0.04, 0.5, 0.0005), rafale(ctx, out, q, B.blanc, 'highpass', 5000, 0.8, 0.012, 0.2, 0.0005)),
  apparition: (B) => (ctx, out, q) => rafale(ctx, out, q, B.rose, 'lowpass', 800, 0.7, 0.45, 0.6, 0.12, 0, 2200),
  bip: (fort) => (ctx, out, q) => ton(ctx, out, q, fort ? 'square' : 'sine', fort ? 1320 : 880, 0, fort ? 0.3 : 0.12, fort ? 0.25 : 0.45, 0.002),
  // la domination : un point pris par les nôtres (arpège majeur montant) ou par l'adversaire (mineur descendant)
  capture: (ami) => (ctx, out, q) => { let f = 0; const N = ami ? [523, 659, 784] : [523, 415, 349]; for (let i = 0; i < 3; i++) f = Math.max(f, ton(ctx, out, q, 'triangle', N[i], 0, 0.14, 0.5, 0.004, i * 0.09)); return f; },
  victoire: (gagne) => (ctx, out, q) => { let f = 0; const N = gagne ? [523, 659, 784, 1047] : [392, 349, 311, 262]; for (let i = 0; i < 4; i++) f = Math.max(f, ton(ctx, out, q, 'triangle', N[i], 0, i === 3 ? 0.6 : 0.16, 0.45, 0.004, 0.95 + i * 0.13)); return f; },
};

// ---------------------------------------------------------------- SonsJeu
const MUET = 1e-4;
// le genre d'une grenade ('frag' | 'flash') dans un événement `explosion` ou `grenade` (voir brancher)
const genreGrenade = (e, quoi) => (e.arme === 'frag' || e.arme === 'flash' ? e.arme : e.type && e.type !== quoi ? e.type : e.grenade ?? e.genre ?? 'frag');
const db = (x) => 20 * Math.log10(Math.max(MUET, x));

export class SonsJeu {
  constructor(audio) {
    this.audio = audio; this.t = 0; this._voix = []; this.partie = null; this._des = [];
    this.spatial = true;                 // (js/jeu/sons_prop.js le lit : la distance et le panoramique sont faits ici)
    this._file = [];                     // les événements notés depuis la dernière image
    this._occ = 0;                       // le tour de rôle de l'occlusion
    this._mourantes = [];                // les voix volées, le temps de leur fondu
    this._oreille = { x: 0, y: 0, z: 0 };
    this._tPrec = 0; this._phase = null; this._bips = -1; this._coeurT = 0; this._gren = new Map(); this._etouffeJusque = 0;
    this.stats = { creees: 0, refusees: 0, volees: 0, occlusions: 0, horsRayon: 0 };
  }
  get voix() { return this._voix; }

  // LE BUS DU JEU (une fois par session, dès qu'il y a un contexte) : compresseur → passe-bas (étouffement) → master ;
  // les sons « à l'oreille » (marqueurs, cœur, décompte) ont le leur, à côté, jamais étouffé
  _bus() {
    const A = this.audio, ctx = A && A.ctx;
    if (!ctx || !A.master) return null;
    if (this._ctxBus === ctx) return this.entree;
    const R = REGLAGES_SONS.bus;
    this.entree = ctx.createGain();
    this.compresseur = ctx.createDynamicsCompressor();
    this.compresseur.threshold.value = R.seuil; this.compresseur.ratio.value = R.ratio; this.compresseur.knee.value = 6;
    this.compresseur.attack.value = R.attaque; this.compresseur.release.value = R.relache;
    this.filtreBus = ctx.createBiquadFilter(); this.filtreBus.type = 'lowpass'; this.filtreBus.frequency.value = 20000; this.filtreBus.Q.value = 0.7;
    this.entree.connect(this.compresseur); this.compresseur.connect(this.filtreBus); this.filtreBus.connect(A.master);
    this.ui = ctx.createGain(); this.ui.connect(A.master);
    this._ctxBus = ctx;
    return this.entree;
  }
  // les bruits précalculés de js/audio.js
  get _B() {
    const A = this.audio, b = A && A.bruitBlanc, r = A && A.bruitRose, M = this._bruitsVus;
    if (!M || M.blanc !== b || M.rose !== r) this._bruitsVus = { blanc: b, rose: r };
    return this._bruitsVus;
  }
  preparer() { if (this.audio && this.audio.ctx && !this.audio.bruitBlanc) this.audio._bruits?.(); this._bus(); }

  brancher(partie) {
    this.debrancher(); this.partie = partie;
    this._bus();
    this._tPrec = partie.t; this._phase = partie.phase; this._bips = -1; this._coeurT = 0; this._gren.clear(); this._rebondsEvt = false;
    // (l'événement noté AVEC son genre : Partie.evt fait { t, type, ...données }, et une explosion ou une grenade porte un
    // champ `type` à elle — 'frag' | 'flash' — qui écrase celui de l'événement)
    for (const quoi of ['tir', 'impact', 'touche', 'elim', 'recharge', 'arme', 'vide', 'pas', 'saut', 'reception', 'glissade', 'frole',
      'grenade', 'explosion', 'flash', 'capture', 'apparition', 'fin', 'couteau', 'rebond']) this._des.push(partie.sur(quoi, (e) => { this._file.push({ quoi, e }); }));
  }
  debrancher() {
    for (const d of this._des) d();
    this._des = []; this._file.length = 0;
    // les voix en cours s'éteignent (fondu court), le bus se rouvre
    const A = this.audio, ctx = A && A.ctx;
    for (const v of this._voix) this._voler(v);
    this._voix.length = 0;
    // (hors partie, plus de `maj` pour les débrancher : elles le sont après leur fondu)
    const M = this._mourantes.splice(0);
    if (M.length) setTimeout(() => { for (const m of M) this._liberer(m.v); }, 80);
    if (ctx && this.filtreBus) { const f = this.filtreBus.frequency; f.cancelScheduledValues(0); f.setValueAtTime(20000, ctx.currentTime); }
    this._etouffeJusque = 0;
    this.partie = null;
  }

  // ---------------------------------------------------------------- UNE VOIX
  // `o` = { gain = 1, rayon = 30, bas = false, prioritaire = false } (spec § 4.5.17) — et, ajoutés par L-H : `retard`
  // (vrai : d/343 s ; faux par défaut — un appel direct part à la date courante, test 21 du socle), `decalage` (s : le
  // moment de l'événement dans l'image), `hauteurOcc` (m au-dessus du point, pour la ligne de l'occlusion : le buste
  // d'un pas, pas ses pieds), `oreille` (vrai : un son à l'oreille, sans panoramique ni distance ni occlusion), `occlusion`
  // (faux : jamais occultée — un son de Haythem lui-même), `dalle` ('faite' : js/jeu/sons_prop.js a déjà étouffé la dalle).
  // Rend la voix, ou null (pas de contexte, trop loin, la plus faible de toutes quand elles sont 24)
  jouer3d(x, y, z, recette, o) {
    const opts = o || {};
    const { gain = 1, rayon = 30, bas = false, prioritaire = false } = opts;
    const A = this.audio, ctx = A && A.ctx;
    if (!ctx || !A.master || !this._bus()) return null;
    const oreille = !!opts.oreille, E = this._oreille;
    const d = oreille ? 0 : Math.hypot(x - E.x, y - E.y, z - E.z);
    if (d > rayon) { this.stats.horsRayon++; return null; }
    const base = gain * (A.vol ? A.vol.sfx ?? 1 : 1);
    const niveauDb = db(base * (oreille ? 1 : A.attenuation ? A.attenuation(d) : 1));
    if (!this._place(niveauDb, prioritaire)) { this.stats.refusees++; return null; }
    const g = ctx.createGain(); g.gain.value = base;
    let filtre = null, panner = null;
    if (oreille) g.connect(this.ui);
    else {
      filtre = ctx.createBiquadFilter(); filtre.type = 'lowpass'; filtre.frequency.value = 20000; filtre.Q.value = 0.7;
      panner = A.spatial ? A.spatial() : ctx.createPanner();
      if (panner.positionX) { panner.positionX.value = x; panner.positionY.value = y; panner.positionZ.value = z; } else panner.setPosition(x, y, z);
      g.connect(filtre); filtre.connect(panner); panner.connect(this.entree);
      if (A.envoi) panner.connect(A.envoi);
    }
    const retard = opts.retard && !oreille ? d / REGLAGES_SONS.vitesseSon : 0, decalage = Math.max(0, opts.decalage || 0);
    const quand = ctx.currentTime + decalage + retard;
    let duree = 0;
    try { duree = recette(ctx, g, quand) || 0; } catch (e) { console.warn('[sons]', e); }
    const v = { x, y, z, panner, filtre, gain: g, debut: this.t, fin: this.t + decalage + retard + duree, niveauDb, base, rayon, bas, retard, quand,
      dalle: opts.dalle || false, hauteurOcc: opts.hauteurOcc || 0, occ: 0, aVerifier: !oreille && opts.occlusion !== false && opts.dalle !== 'faite', oreille,
      sansOcclusion: opts.occlusion === false };
    this._voix.push(v);
    this.stats.creees++;
    return v;
  }
  // un son À L'OREILLE (marqueurs, cœur, décompte, coup reçu) : pas de panoramique, pas de distance, jamais étouffé
  jouer2d(recette, gain = 1, prioritaire = true) {
    const E = this._oreille;
    return this.jouer3d(E.x, E.y, E.z, recette, { gain, rayon: Infinity, oreille: true, prioritaire });
  }
  // une place pour une voix de ce niveau : libre, ou la plus faible volée (si la nouvelle la passe, ou est prioritaire)
  _place(niveauDb, prioritaire) {
    const N = REGLAGES_SONS.voix;
    if (this._voix.length < N) return true;
    let k = -1, min = Infinity;
    for (let i = 0; i < this._voix.length; i++) { const v = this._voix[i]; if (v.niveauDb < min) { min = v.niveauDb; k = i; } }
    if (k < 0 || (!prioritaire && niveauDb <= min)) return false;
    const [v] = this._voix.splice(k, 1);
    this._voler(v); this.stats.volees++;
    return true;
  }
  // une voix volée : un fondu de 15 ms, débranchée à l'image d'après
  _voler(v) {
    const ctx = this.audio && this.audio.ctx; v.volee = true;
    if (ctx) { try { v.gain.gain.cancelScheduledValues(ctx.currentTime); v.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.005); } catch (e) { /* débranchée */ } }
    this._mourantes.push({ v, t: this.t + 0.05 });
  }
  _liberer(v) {
    try { v.gain.disconnect(); } catch (e) { /* déjà */ }
    if (v.filtre) try { v.filtre.disconnect(); } catch (e) { /* déjà */ }
    if (v.panner) try { v.panner.disconnect(); } catch (e) { /* déjà */ }
  }

  // ---------------------------------------------------------------- L'OCCLUSION d'une voix (0 libre, 1 bloquée, 2 autre niveau, 3 dalle d'une provocation)
  _etatOcc(v) {
    const P = this.partie, E = this._oreille;
    const nE = niveauDe(E.y - 0.3), nS = niveauDe(v.y + 0.3);
    if (nE !== nS) return v.bas ? 3 : 2;
    const B = P && P.balistique;
    if (!B) return 0;
    this.stats.occlusions++;
    return B.vue(E.x, E.y, E.z, v.x, v.y + v.hauteurOcc, v.z) ? 0 : 1;
  }
  _poserOcc(v, etat, neuve) {
    const ctx = this.audio.ctx, O = REGLAGES_SONS.occlusion, now = ctx.currentTime;
    const k = etat === 1 ? Math.pow(10, O.bloque.db / 20) : etat === 2 ? Math.pow(10, O.niveau.db / 20) : etat === 3 ? O.dalle.k : 1;
    const hz = etat === 1 ? O.bloque.hz : etat === 2 ? O.niveau.hz : etat === 3 ? O.dalle.hz : 20000;
    const gv = v.base * k;
    // (une voix neuve part DÉJÀ occultée — elle n'a pas encore commencé —, puis le changement est programmé, lissé en 0,1 s)
    if (neuve) { v.gain.gain.value = gv; v.filtre.frequency.value = hz; }
    v.gain.gain.setTargetAtTime(gv, now, O.tau);
    v.filtre.frequency.setTargetAtTime(hz, now, O.tau);
    v.niveauDb += db(k) - db(v.k || 1); v.k = k; v.occ = etat;
  }
  _occlusions() {
    const O = REGLAGES_SONS.occlusion, L = this._voix;
    let n = 0;
    // les neuves d'abord (celles qu'on entend : au-dessus de −30 dB)
    for (const v of L) {
      if (n >= O.parImage) break;
      if (!v.aVerifier) continue;
      v.aVerifier = false;
      if (v.niveauDb <= O.seuilDb) continue;
      this._poserOcc(v, this._etatOcc(v), true); n++;
    }
    // puis, à tour de rôle, les voix en cours (une source ne bouge pas, mais l'auditeur oui)
    for (let essais = 0; n < O.parImage && essais < L.length; essais++) {
      this._occ = (this._occ + 1) % L.length;
      const v = L[this._occ];
      if (!v.filtre || v.dalle === 'faite' || v.oreille || v.sansOcclusion || v.niveauDb <= O.seuilDb) continue;
      const e = this._etatOcc(v); n++;
      if (e !== v.occ) this._poserOcc(v, e, false);
    }
    return n;
  }

  // ---------------------------------------------------------------- l'étouffement du bus (explosion, flash, mort)
  etouffer(hz, tenue, reouverture) {
    const ctx = this.audio && this.audio.ctx; if (!ctx || !this.filtreBus) return;
    const f = this.filtreBus.frequency, now = ctx.currentTime;
    f.cancelScheduledValues(now); f.setValueAtTime(Math.max(hz, Math.min(20000, f.value)), now);
    f.setTargetAtTime(hz, now, 0.02);
    if (reouverture > 0) f.setTargetAtTime(20000, now + Math.max(0.05, tenue), reouverture / 4);
    this._etouffeJusque = this.t + tenue + reouverture;
  }
  rouvrir(reouverture = 0.4) {
    const ctx = this.audio && this.audio.ctx; if (!ctx || !this.filtreBus) return;
    const f = this.filtreBus.frequency, now = ctx.currentTime;
    f.cancelScheduledValues(now); f.setValueAtTime(Math.min(20000, f.value), now); f.setTargetAtTime(20000, now, reouverture / 4);
  }

  // la douille qui tinte au sol (appelée par js/jeu/effets.js, qui la fait rebondir)
  douille(x, y, z, cartouche = false) {
    return this.jouer3d(x, y, z, RECETTES.douille(this._B, cartouche), { gain: REGLAGES_SONS.gains.douille, rayon: REGLAGES_SONS.rayons.douille, hauteurOcc: 0.3 });
  }

  // ---------------------------------------------------------------- L'IMAGE
  maj(dt, camera) {
    this.t += dt;
    const E = this._oreille, c = camera ? camera.position : this.audio && this.audio.listener;
    if (c) { E.x = c.x; E.y = c.y; E.z = c.z; }
    const P = this.partie, ctx = this.audio && this.audio.ctx;
    // 1. les événements notés depuis la dernière image, dans leur ordre, chacun à son moment dans l'image
    if (this._file.length) {
      const L = this._file; this._file = [];
      if (P && ctx) for (const w of L) { try { this._evenement(w.quoi, w.e, P); } catch (err) { console.warn('[sons]', w.quoi, err); } }
    }
    // 2. l'état : les rebonds des grenades, le cœur, le décompte
    if (P && ctx && dt > 0) this._etat(P);
    // 3. les voix finies libérées (sur NOTRE horloge), les volées débranchées après leur fondu
    for (let i = this._voix.length - 1; i >= 0; i--) { const v = this._voix[i]; if (this.t >= v.fin) { this._voix.splice(i, 1); this._liberer(v); } }
    for (let i = this._mourantes.length - 1; i >= 0; i--) { const m = this._mourantes[i]; if (this.t >= m.t) { this._mourantes.splice(i, 1); this._liberer(m.v); } }
    // 4. l'occlusion : 4 voix au plus
    if (ctx && this._voix.length) this._occlusions();
    if (P) this._tPrec = P.t;
  }

  // le moment d'un événement dans l'image : depuis le premier pas de l'image (un FA-24 garde ses 80 ms)
  _decalage(e) { return Math.min(0.05, Math.max(0, e.t - this._tPrec - PAS)); }
  _gaz() { const s = this.partie && this.partie.game && this.partie.game.settings; const j = s && (s.data ? s.data.jeu : s.jeu); return !j || j.habillage !== 'militaire'; }
  _ennemi(id) { const P = this.partie, L = P && P.local, a = P && P.acteurParId(id); return !!(L && a && a !== L && P.ennemis(L, a)); }
  _dehors(x, y, z) { return z > 0.5 && y > -0.4 && y < 4; }                 // (la rue, devant la façade : x −3…23, z 0…6)

  _evenement(quoi, e, P) {
    const G = REGLAGES_SONS.gains, R = REGLAGES_SONS.rayons, B = this._B, L = P.local, dec = this._decalage(e);
    const lui = (id) => !!L && id === L.id;
    switch (quoi) {
      case 'tir': {
        const a = P.acteurParId(e.a); if (!a) return;
        if (e.arme === 'couteau') { this.jouer3d(e.ox, e.oy, e.oz, RECETTES.couteau(B), { gain: G.couteau, rayon: 10, retard: true, decalage: dec, occlusion: !lui(e.a) }); return; }
        const base = RECETTES_TIR[e.arme] || RECETTES_TIR.fa24, gaz = this._gaz(), R0 = gaz ? recetteGaz(base) : base;
        const E = this._oreille, d = Math.hypot(e.ox - E.x, e.oy - E.y, e.oz - E.z);
        const h = 1 + (new Rng(melanger(P.graine, e.a, e.seq | 0)).next() * 2 - 1) * REGLAGES_SONS.hauteur;
        const meta = {};
        const v = this.jouer3d(e.ox, e.oy, e.oz, recetteTir(B, R0, { h, loin: d > REGLAGES_SONS.claquementMax, local: lui(e.a), dehors: this._dehors(e.ox, e.oy, e.oz),
          proche: d < 15, meta }), { gain: lui(e.a) ? G.tirLocal : G.tir, rayon: R.tir, retard: true, decalage: dec, prioritaire: lui(e.a), occlusion: !lui(e.a) });
        if (v) { v.parts = meta; v.hauteur = h; v.arme = e.arme; v.gaz = gaz; v.tireur = e.a; }
        return;
      }
      case 'impact': {
        if ((e.plomb | 0) > 1) return;                 // (une gerbe de plombs : deux impacts s'entendent, pas huit)
        const v = this.jouer3d(e.x, e.y, e.z, RECETTES.impact(B, e.mat, this._gaz()), { gain: G.impact * (e.plomb ? 0.5 : 1), rayon: R.impact, retard: true, decalage: dec, hauteurOcc: 0.1 });
        if (v) v.mat = e.mat;
        return;
      }
      case 'touche': {
        if (lui(e.par) && e.cible !== e.par) this.jouer2d(e.tete ? RECETTES.ding() : RECETTES.tic(), e.tete ? G.tete : G.marqueur);
        if (lui(e.cible)) this.jouer2d(RECETTES.recu(B, this._gaz()), G.recu * Math.min(1, 0.5 + e.degats / 60));
        else if (!lui(e.par)) this.jouer3d(e.x, e.y, e.z, RECETTES.corps(B), { gain: G.corps, rayon: R.corps, retard: true, decalage: dec });
        return;
      }
      case 'elim': {
        if (lui(e.par) && e.cible !== e.par) this.jouer2d(RECETTES.elim(B), G.elim);
        if (lui(e.cible)) { const M = REGLAGES_SONS.etouffe.mort; this.etouffer(M.hz, M.duree, 0); }
        return;
      }
      case 'apparition': if (lui(e.a)) { this.rouvrir(0.5); this.jouer2d(RECETTES.apparition(B), G.apparition, false); } return;
      case 'recharge': {
        const a = P.acteurParId(e.a); if (!a || !a.arsenal || !a.arsenal.arme) return;
        const id = a.arsenal.arme.id, f = e.phase === 'debut' ? RECETTES.rechargeDebut(B, id) : e.phase === 'insere' ? RECETTES.rechargeInsere(B, id) : RECETTES.rechargeFin(B, id, e.tactique);
        this._corps(a, f, lui(e.a) ? G.rechargeLocal : G.recharge, R.recharge, dec, 1.0);
        return;
      }
      case 'vide': { const a = P.acteurParId(e.a); if (a) this._corps(a, RECETTES.vide(B), G.vide, R.vide, dec, 1.2); return; }
      case 'arme': { const a = P.acteurParId(e.a); if (a) this._corps(a, RECETTES.arme(B), G.arme, R.arme, dec, 1.0); return; }
      case 'pas': {
        const allure = e.allure || 'course', r = R.pas[allure] ?? R.pas.course;
        if (!r) return;
        const local = lui(e.a), plus = this._ennemi(e.a) ? Math.pow(10, REGLAGES_SONS.pasEnnemi / 20) : 1;
        const k = allure === 'marche' ? 0.45 : allure === 'accroupi' ? 0.3 : allure === 'sprint' ? (e.tact ? 1.3 : 1.15) : 1;
        const v = this.jouer3d(e.x, e.y, e.z, RECETTES.pas(B, e.f ?? 0.6), { gain: (local ? G.pasLocal : G.pas) * plus * k,
          rayon: local ? 3 : r, retard: true, decalage: dec, hauteurOcc: 1.0, occlusion: !local });
        if (v) { v.pas = true; v.ennemi = plus > 1; v.acteur = e.a; }
        return;
      }
      case 'saut': { const a = P.acteurParId(e.a); if (a) this._corps(a, RECETTES.saut(B), G.saut, R.saut, dec, 1.0); return; }
      case 'reception': { const a = P.acteurParId(e.a); if (a) this._corps(a, RECETTES.reception(B, Math.max(0.3, e.f ?? 0.6)), G.pas * (lui(e.a) ? 0.6 : 1), R.pas.course, dec, 0.3); return; }
      case 'glissade': { if (!e.debut && e.debut !== undefined) return; const a = P.acteurParId(e.a); if (a) this._corps(a, RECETTES.glissade(B), G.glissade, R.pas.sprint, dec, 0.4); return; }
      case 'frole': if (lui(e.a)) this.jouer3d(e.x, e.y, e.z, RECETTES.frole(B, this._gaz()), { gain: G.frole, rayon: R.frole, prioritaire: true, occlusion: false }); return;
      // (deux ajouts de L-A au § 4.6 : le coup de COUTEAU — dans le vide, sur le décor ou sur un corps — et le REBOND d'une
      // grenade ; quand ils viennent, les rebonds ne sont plus lus dans l'état)
      case 'couteau': {
        const a = P.acteurParId(e.a), p = a && a.corps && a.corps.pos;
        if (p) this.jouer3d(p.x, p.y + 1.3, p.z, RECETTES.couteau(B), { gain: G.couteau, rayon: 10, retard: !lui(e.a), decalage: dec, occlusion: !lui(e.a) });
        if (e.cible >= 0) this.jouer3d(e.x, e.y, e.z, RECETTES.corps(B), { gain: G.corps * 2, rayon: R.corps, retard: true, decalage: dec + 0.05 });
        return;
      }
      case 'rebond': {
        this._rebondsEvt = true;
        const f = Math.min(1, Math.abs(e.v ?? 3) / 6);
        this.jouer3d(e.x, e.y, e.z, RECETTES.rebond(B, f), { gain: G.grenade, rayon: R.grenade, retard: true, decalage: dec, hauteurOcc: 0.3 });
        return;
      }
      case 'grenade': this.jouer3d(e.x, e.y, e.z, RECETTES.lancer(B, genreGrenade(e, 'grenade') !== 'flash'), { gain: G.grenade, rayon: R.grenade, retard: true, decalage: dec, occlusion: !lui(e.a) }); return;
      case 'explosion': {
        const E = this._oreille, d = Math.hypot(e.x - E.x, e.y - E.y, e.z - E.z), flash = genreGrenade(e, 'explosion') === 'flash';
        const f = flash ? RECETTES.flash(B) : this._gaz() ? RECETTES.fragGaz(B) : RECETTES.frag(B, d > 30);
        this.jouer3d(e.x, e.y, e.z, f, { gain: flash ? G.flash : G.explosion, rayon: flash ? R.flash : R.explosion, retard: true, decalage: dec, prioritaire: d < 15, hauteurOcc: 0.3 });
        const X = REGLAGES_SONS.etouffe.explosion;
        if (!flash && d < X.distance && L && L.vivant) {
          const k = 1 - d / X.distance;
          this.jouer2d(RECETTES.acouphene(REGLAGES_SONS.acouphene.duree), REGLAGES_SONS.acouphene.gain * k);
          this.etouffer(X.hz, 0.05, X.reouverture);
        }
        return;
      }
      case 'flash': {
        if (!lui(e.cible)) return;
        const F = REGLAGES_SONS.etouffe.flash, du = Math.min(4, e.duree || 1);
        this.etouffer(F.hz, Math.max(0.1, du - 0.6), F.reouverture);
        this.jouer2d(RECETTES.acouphene(du + 0.5), REGLAGES_SONS.acouphene.gain * 1.2);
        return;
      }
      case 'capture': {
        if (e.etat !== 'prise' || !L) return;
        this.jouer2d(RECETTES.capture(e.equipe === L.equipe), G.capture, false);
        return;
      }
      case 'fin': {
        if (P.id === 'prophunt') return;                // (le prop hunt : js/jeu/sons_prop.js)
        const A = this.audio;
        this.jouer2d((ctx, out, q) => { A.buzzer(q - A.t, out); return 0.95; }, G.phase);
        if (L) this.jouer2d(RECETTES.victoire(e.gagnant !== null && e.gagnant !== undefined && (e.gagnant === L.equipe || e.gagnant === L.id)), G.phase * 0.8, false);
        return;
      }
      default:
    }
  }
  // un bruit du CORPS d'un acteur (recharge, saut, changement d'arme…) : à sa hauteur `h` au-dessus des pieds ; le sien,
  // pour Haythem, sans occlusion
  _corps(a, recette, gain, rayon, dec, h) {
    const p = a.corps && (a.corps.posAff || a.corps.pos); if (!p) return null;
    const local = a.local;
    return this.jouer3d(p.x, (Number.isFinite(a.corps.solAff) ? a.corps.solAff : p.y) + h, p.z, recette, { gain, rayon: local ? Infinity : rayon, retard: !local, decalage: dec,
      occlusion: !local, hauteurOcc: 0 });
  }
  // L'ÉTAT lu à chaque image : les rebonds des grenades (leur vitesse verticale qui change de signe, ou la pose), le cœur
  // sous 30 PV, le décompte et les changements de phase du combat (le prop hunt a les siens : js/jeu/sons_prop.js)
  _etat(P) {
    const B = this._B, G = REGLAGES_SONS.gains;
    const gr = !this._rebondsEvt && P.grenades && P.grenades.liste;
    if (gr) {
      const vus = new Set();
      for (const g of gr) {
        vus.add(g.id);
        const avant = this._gren.get(g.id);
        if (avant && ((avant.vy < -0.6 && g.vy > avant.vy + 0.8) || (!avant.posee && g.posee && avant.vy < -0.6))) {
          const f = Math.min(1, Math.abs(avant.vy) / 6);
          this.jouer3d(g.x, g.y, g.z, RECETTES.rebond(B, f), { gain: G.grenade, rayon: REGLAGES_SONS.rayons.grenade, retard: true, hauteurOcc: 0.3 });
        }
        if (avant) { avant.vy = g.vy; avant.posee = g.posee; } else this._gren.set(g.id, { vy: g.vy, posee: g.posee });
      }
      for (const k of [...this._gren.keys()]) if (!vus.has(k)) this._gren.delete(k);
    }
    const L = P.local;
    const C = REGLAGES_SONS.coeur;
    if (L && L.vivant && L.vie > 0 && L.vie < C.seuil && !P.calme()) {
      if (this.t >= this._coeurT) { this.jouer2d(RECETTES.coeur(), G.coeur * (0.6 + 0.4 * (1 - L.vie / C.seuil)), false); this._coeurT = this.t + C.periode; }
    } else this._coeurT = Math.min(this._coeurT, this.t);
    if (P.id === 'prophunt') { this._phase = P.phase; return; }
    if (P.phase !== this._phase) {
      const avant = this._phase; this._phase = P.phase; this._bips = -1;
      const A = this.audio, buzz = (ctx, out, q) => { A.buzzer(q - A.t, out); return 0.95; }, sif = (ctx, out, q) => { A.whistle(q - A.t, out); return 0.4; };
      if (P.phase === 'manche' && (avant === 'decompte' || avant === 'mi_temps')) this.jouer2d(buzz, G.phase);
      else if (P.phase === 'mi_temps' || P.phase === 'fin_manche') this.jouer2d(sif, G.phase);
    }
    if (P.phase === 'decompte') {
      const k = Math.floor(P.phaseT + 1e-6), n = Math.round(P.phaseDuree || 3);
      if (k > this._bips && k < n) { this._bips = k; this.jouer2d(RECETTES.bip(false), G.phase); }
    }
  }
}
