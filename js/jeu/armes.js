// =====================================================================
//  LES ARMES — fiches, classes et ARSENAL de chaque acteur (lot L-A, 23/10 ; spec §§ 3.3-3.5, 4.5.6)
// =====================================================================
// Les FICHES (cinq armes aux noms inventés, le couteau, la frag, la flash : aucune marque), les classes, la dotation du
// chasseur du prop hunt, `degatsDe`, et l'ARSENAL d'un acteur : sa machine d'état, en SIMULATION (Partie.pas, étape 6 ; ni
// hasard du navigateur, ni horloge, ni entrées : la commande, `partie.t`, des Rng semés par `melanger`). Ce qu'il tient :
//   - le TIR : automatique par `tir` tenu, semi-automatique (pistolet, pompe, verrou) par front tamponné 0,1 s (un clic un
//     peu tôt part au bout de la cadence) ; cadence À REPORT DU RESTE (§ 3.3 : 80 ms font 9,6 pas — `prochain =
//     max(prochain, t − PAS) + 60/rpm`, un tir au plus par pas : 30 balles de FA-24 en 2,32 s et non 2,417) ;
//   - la DISPERSION de hanche (§ 3.4 : la base interpolée en 0,12 s entre repos, marche, course, sortie de sprint et saut,
//     × 0,8 accroupi, + la chaleur des tirs ; 0 en visée immobile ; × 1,3 en glissade), tirée dans un disque uniforme
//     (r = s·√u, θ = 2πv) par `Rng(melanger(graine, id, tirSeq))` — le même tirage sur l'hôte et l'invité de demain ; la
//     gerbe du FP-12 (1 plomb au centre, 7 en couronne à 0,6 × le cône, tournée au hasard, ± 0,3°) ;
//   - le RECUL de visée à MOTIF (on l'apprend : la FA-24 monte de 6,76° en 12 balles en dessinant un « 7 »), sa boucle,
//     son aléa, son rappel (300 ms après le dernier tir, 40 % de la montée revient en 0,30 s), exposé par `prendreRecul`
//     (radians, remis à zéro) que lit le lecteur de la commande — lireCommande pour Haythem, le cerveau d'un bot — : la
//     visée bouge VRAIMENT, et l'on compense en tirant vers le bas ;
//   - le RESSORT VISUEL de l'arme (piston, cabré, roulis ; ω 35 rad/s, ζ 0,55 : la crête d'un tir isolé vaut la fiche) :
//     de l'affichage tenu ici parce qu'il naît des tirs, hors de l'état sérialisé (§ 4.7 : il ne change rien au jeu) ;
//   - la VISÉE 0 → 1 au temps d'ADS sur la courbe 1 − (1 − t)³ (pas en sprint, ni 0,1 s après un décollage, ni dans les
//     0,35 premières secondes d'une glissade) ;
//   - les RECHARGES : tactique (il restait des balles : chargeur + 1, la chambre) ou à vide, les balles ENTRENT au temps de
//     la fiche (annulées avant par le sprint, un changement d'arme, le couteau ou une grenade : rien n'a changé) ; le FP-12
//     cartouche par cartouche (0,35 + 0,42 par cartouche + 0,30, + 0,45 de pompe à vide), interrompu par un tir ;
//   - le SPRINT (arme baissée, pas de tir ; en sortir — un tir demandé, la visée, l'arrêt — coûte `sprintTir`, ou
//     `sprintTactTir` après un sprint tactique) ; le FRANCHISSEMENT (rien en main) ;
//   - le COUTEAU (150 : il tue ; 1,6 m ; la FENTE jusqu'à 2,4 m vers un ennemi du cône de 25°, à 6 m/s pendant 0,15 s au
//     plus, par le monde solide ; 0,60 s par coup, touche à 0,12 s) ;
//   - les GRENADES tenues : la frag CUITE (goupille tirée à l'appui, la mèche de 3,5 s court dans la main, elle part au
//     relâché — après 0,15 s de goupille au moins — et explose EN MAIN au bout de la mèche), la flash lancée d'un appui ;
//   - le CHANGEMENT d'arme (rangement puis sortie : l'arme change à mi-geste, événement 'arme').
// Les tirs passent par la balistique (js/jeu/balistique.js tirer) puis par `partie.resoudreTir`, qui DIFFÈRE leurs effets
// (spec § 4.3.2, étape 6) : l'arsenal ne touche jamais une vie. Événements : 'tir', 'trajet' (un par plomb : de l'œil au
// point d'arrivée, pour les traceurs), 'recharge', 'arme', 'vide', 'couteau' ; 'grenade' par js/jeu/grenade.js.
import * as THREE from 'three';
import { PAS } from './constantes.js';
import { Rng, melanger } from './rng.js';

const INF = Infinity, DEG = Math.PI / 180;
// LES FICHES. Distances en m, temps en s, angles en DEGRÉS (dispersion, recul, gerbe).
// Dispersion (demi-angles, °) : la FA-24 est celle du § 3.4 ; les autres sont réglées ici (§ 3.4 : « PM-9 plus large à la
// hanche, P-17 plus serrée, TP-50 8° au jugé ») — la PM-9 s'ouvre plus au repos (2,6°) mais chauffe moins (0,18° par
// balle, plafond 2,2°, refroidit à 9°/s) : au corps à corps sa cadence compense ; le P-17 est serré (1,6°) mais chauffe
// vite au clic répété ; le TP-50 tire « au jugé » à la hanche (8°), juste en visée immobile.
export const ARMES = {
  fa24: { id: 'fa24', nom: 'FA-24 « Faucon »', classe: 'assaut', emplacement: 'principale', auto: true, rpm: 750,
    degats: [[15, 30], [30, 24], [INF, 20]], plombs: 1, zones: { tete: 1.4, cou: 1.2, torse: 1.1, ventre: 1.0, jambes: 0.9 },
    chargeur: 30, reserve: 90, ads: 0.26, sprintTir: 0.20, sprintTactTir: 0.30, mobilite: 1.00, zoom: 1.25,
    recharge: { tact: 1.90, vide: 2.45, ajout: 1.35 }, sortie: 0.30, rangement: 0.20,
    dispersion: { repos: 2.2, marche: 3.4, course: 4.6, sprint: 5.5, saut: 8.0, parTir: 0.30, max: 3.0, retour: 7.0, visee: 0.0, viseeMouvement: 0.15 },
    recul: { v: [0.45, 0.50, 0.55, 0.60, 0.62, 0.62, 0.60, 0.58, 0.58, 0.56, 0.55, 0.55],
      h: [0.05, 0.08, 0.10, 0.06, -0.04, -0.12, -0.18, -0.15, -0.05, 0.10, 0.18, 0.12], boucle: 6, alea: 0.08, aleaH: 0,
      visee: 0.8, accroupi: 0.85, rappel: 0.40, rappelT: 0.30, rappelDelai: 0.30, piston: 0.028, cabre: 2.2, roulis: 1.0 },
    bruit: 45, son: 'fa24', portee: 150, encombrement: 0.84 },
  pm9: { id: 'pm9', nom: 'PM-9 « Guêpe »', classe: 'pistolet-mitrailleur', emplacement: 'principale', auto: true, rpm: 900,
    degats: [[8, 26], [16, 20], [INF, 15]], plombs: 1, zones: { tete: 1.25, cou: 1.1, torse: 1.0, ventre: 1.0, jambes: 0.9 },
    chargeur: 32, reserve: 96, ads: 0.20, sprintTir: 0.13, sprintTactTir: 0.20, mobilite: 1.06, zoom: 1.15,
    recharge: { tact: 1.65, vide: 2.15, ajout: 1.15 }, sortie: 0.25, rangement: 0.18,
    dispersion: { repos: 2.6, marche: 3.6, course: 4.6, sprint: 5.2, saut: 7.0, parTir: 0.18, max: 2.2, retour: 9.0, visee: 0.0, viseeMouvement: 0.25 },
    recul: { v: [0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.40, 0.40], h: [0.10, -0.12, 0.14, -0.16, 0.18, -0.20, 0.22, -0.22], boucle: 2,
      alea: 0.06, aleaH: 0, visee: 0.8, accroupi: 0.85, rappel: 0.40, rappelT: 0.30, rappelDelai: 0.30, piston: 0.020, cabre: 1.6, roulis: 1.0 },
    bruit: 40, son: 'pm9', portee: 100, encombrement: 0.62 },
  fp12: { id: 'fp12', nom: 'FP-12 « Bélier »', classe: 'pompe', emplacement: 'principale', auto: false, rpm: 70,
    degats: [[5, 18], [9, 11], [14, 6], [INF, 0]], plombs: 8, zones: { tete: 1.0, cou: 1.0, torse: 1.0, ventre: 1.0, jambes: 1.0 },
    chargeur: 7, reserve: 21, ads: 0.26, sprintTir: 0.18, sprintTactTir: 0.27, mobilite: 1.00, zoom: 1.10,
    // (cartouche par cartouche, interruptible : 0,35 + 0,42 par cartouche + 0,30, et 0,45 de pompe à vide)
    recharge: { tact: null, vide: null, ajout: null, debut: 0.35, parCartouche: 0.42, fin: 0.30, pompe: 0.45 }, sortie: 0.32, rangement: 0.22,
    dispersion: null,   // (la gerbe, ci-dessous : fixe, le cône est celui de la hanche ou de la visée)
    gerbe: { centre: 1, couronne: 7, rayon: 0.6, cone: 5.0, coneVisee: 3.6, tremble: 0.3 },
    recul: { v: [4.5], h: [0], boucle: 1, alea: 0, aleaH: 0.8, visee: 0.8, accroupi: 0.85, rappel: 1.0, rappelT: 0.45, rappelDelai: 0.0,
      piston: 0.060, cabre: 8.0, roulis: 1.0 },
    bruit: 45, son: 'fp12', portee: 40, encombrement: 0.95 },
  tp50: { id: 'tp50', nom: 'TP-50 « Héron »', classe: 'precision', emplacement: 'principale', auto: false, rpm: 45,
    degats: [[INF, 105]], plombs: 1, zones: { tete: 2.0, cou: 1.5, torse: 1.0, ventre: 0.9, jambes: 0.75 },
    chargeur: 5, reserve: 20, ads: 0.42, sprintTir: 0.32, sprintTactTir: 0.48, mobilite: 0.92, zoom: 4.0,
    recharge: { tact: 2.30, vide: 2.90, ajout: 1.70 }, sortie: 0.38, rangement: 0.25,
    dispersion: { repos: 8.0, marche: 9.0, course: 10.0, sprint: 11.0, saut: 12.0, parTir: 0.0, max: 0.0, retour: 10.0, visee: 0.0, viseeMouvement: 0.6 },
    recul: { v: [6.0], h: [0], boucle: 1, alea: 0, aleaH: 0.5, visee: 0.8, accroupi: 0.85, rappel: 1.0, rappelT: 0.60, rappelDelai: 0.0,
      piston: 0.050, cabre: 6.0, roulis: 1.0 },
    bruit: 60, son: 'tp50', portee: 200, encombrement: 1.10 },
  p17: { id: 'p17', nom: 'P-17 « Moineau »', classe: 'pistolet', emplacement: 'secondaire', auto: false, rpm: 400,
    degats: [[10, 34], [20, 25], [INF, 20]], plombs: 1, zones: { tete: 1.5, cou: 1.2, torse: 1.0, ventre: 1.0, jambes: 0.9 },
    chargeur: 12, reserve: 48, ads: 0.15, sprintTir: 0.10, sprintTactTir: 0.15, mobilite: 1.08, zoom: 1.10,
    recharge: { tact: 1.30, vide: 1.65, ajout: 0.90 }, sortie: 0.20, rangement: 0.15,
    dispersion: { repos: 1.6, marche: 2.4, course: 3.4, sprint: 4.2, saut: 6.0, parTir: 0.45, max: 2.0, retour: 8.0, visee: 0.0, viseeMouvement: 0.10 },
    recul: { v: [1.1], h: [0], boucle: 1, alea: 0, aleaH: 0.25, visee: 0.8, accroupi: 0.85, rappel: 0.80, rappelT: 0.20, rappelDelai: 0.0,
      piston: 0.035, cabre: 4.0, roulis: 1.0 },
    bruit: 35, son: 'p17', portee: 80, encombrement: 0.19 },
  couteau: { id: 'couteau', nom: 'Couteau', classe: 'couteau', emplacement: 'couteau', degats: [[1.6, 150]], plombs: 1,
    zones: { tete: 1, cou: 1, torse: 1, ventre: 1, jambes: 1 }, portee: 1.6, fente: 2.4, coneFente: 25, vitesseFente: 6, dureeFente: 0.15,
    coup: 0.60, touche: 0.12, mobilite: 1.10, bruit: 4, son: 'couteau', coneTouche: 35, contact: 0.9 },
  frag: { id: 'frag', nom: 'Grenade', classe: 'letale', meche: 3.5, lancer: 15, haut: 2.5, restitution: 0.35, frottement: 0.6, arret: 0.4,
    degatsMax: 160, rPlein: 2.0, rMax: 6.5, degatsMin: 25, rayonVue: 0.3, bruit: 60, son: 'frag' },
  flash: { id: 'flash', nom: 'Grenade flash', classe: 'tactique', meche: 1.6, lancer: 15, haut: 2.5, restitution: 0.35, frottement: 0.6, arret: 0.4,
    rayon: 14, base: 0.8, face: 3.2, max: 4.0, bruit: 50, son: 'flash' },
};
// LES CLASSES (§ 3.3) : { principale, secondaire, letale: [id, n] | null, tactique: [id, n] | null, couteau }
export const CLASSES = {
  assaut: { principale: 'fa24', secondaire: 'p17', letale: ['frag', 1], tactique: ['flash', 1], couteau: true },
  infiltration: { principale: 'pm9', secondaire: 'p17', letale: ['frag', 1], tactique: ['flash', 1], couteau: true },
  defense: { principale: 'fp12', secondaire: 'p17', letale: ['frag', 1], tactique: ['flash', 2], couteau: true },
  tireur: { principale: 'tp50', secondaire: 'p17', letale: null, tactique: ['flash', 1], couteau: true },
};
export const DOTATION_CHASSEUR = { principale: 'pm9', secondaire: 'fp12', letale: ['frag', 1], tactique: null, couteau: false };
// LES GESTES (s) : la grenade (goupille, lancer, remontée de l'arme : les temps de l'arme de vue, spec § 4.5.9) ; la sortie
// d'une recharge du FP-12 interrompue par un tir (la pompe d'abord si le tube était vide)
export const GESTES = { goupille: 0.15, lancer: 0.35, remontee: 0.25, sortieRecharge: 0.10 };
// le ressort VISUEL (§ 3.2) : ω 35 rad/s, ζ 0,55 — une vitesse initiale de crête × ω / 0,5215 donne une crête de `crête`
const OMEGA = 35, ZETA = 0.55, IMPULSION = OMEGA / 0.5215;
// (F2, demande de L-V : le ressort intégré EXACTEMENT sur un pas — la solution de x'' + 2ζωx' + ω²x = 0 sur PAS, ses
// coefficients constants —, et non plus par Euler semi-implicite, qui mangeait le quart de la crête à 120 Hz : 0,72 × la
// fiche au lieu de 1. La crête tombe à t* = 34 ms, à 0,05 % près sur l'échantillon du 4e pas.)
const RES_A = ZETA * OMEGA, RES_B = OMEGA * Math.sqrt(1 - ZETA * ZETA);
const RES_E = Math.exp(-RES_A * PAS), RES_C = Math.cos(RES_B * PAS), RES_S = Math.sin(RES_B * PAS);
const BASCULE = 0.12;              // s : l'interpolation de la base de la dispersion entre deux allures

// LES DÉGÂTS d'une balle (d'un plomb) : le palier de la distance × le coefficient de la zone
export function degatsDe(fiche, distance, zone) {
  if (!fiche || !fiche.degats) return 0;
  let d = 0;
  for (const [jusqua, v] of fiche.degats) { if (distance <= jusqua) { d = v; break; } }
  const k = fiche.zones && zone && fiche.zones[zone] !== undefined ? fiche.zones[zone] : 1;
  return d * k;
}

// L'ÉCART d'une balle dans le cône de demi-angle `s` (rad) : un point uniforme du disque, r = s·√u, θ = 2πv (le tirage du
// § 3.4, exporté pour les tests : 10 000 tirages, 100 % dans le disque, rayon moyen 2/3 de s)
export function tirage(rng, s, out) {
  out = out || { r: 0, th: 0 };
  out.r = s * Math.sqrt(rng.next()); out.th = 2 * Math.PI * rng.next();
  return out;
}
const _t = { r: 0, th: 0 };
const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3();
const _pos = { x: 0, z: 0 };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// L'ARSENAL d'un acteur. `et` : 'pret' | 'tir' | 'recharge' | 'change' | 'sprint' | 'couteau' | 'lancer' | 'franchit' ;
// les minuteries sont des HEURES de partie (partie.t) : elles entrent dans l'état (§ 4.7), l'arsenal se rejoue au bit près.
export class Arsenal {
  constructor(acteur, dotation, modificateurs = null) {
    this.acteur = acteur; this.dotation = dotation || CLASSES.assaut; this.modificateurs = modificateurs;
    this.armes = [this.dotation.principale, this.dotation.secondaire].filter(Boolean).map((id) => ARMES[id]).filter(Boolean);
    this.bloque = false;
    this._rng = new Rng(1);
    this._res = []; for (let p = 0; p < 8; p++) this._res.push({ acteur: null, zone: null, t: 0, x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0, mat: 'rien', forme: null, traverse: false });
    this._remise(0);
  }
  // tout l'état à zéro, armes pleines (construction, réapparition)
  _remise(t) {
    this.ch = this.armes.map((f) => f.chargeur); this.res = this.armes.map((f) => f.reserve);
    this.i = 0; this.et = 'pret'; this.t0 = t; this.fin = t; this.vers = -1; this.basc = false; this.tB = 0;
    this.entre = false; this.tEntrees = 0; this.tact = false; this.nC = 0; this.tC = 0; this.pp = false;
    this.pr = this.armes.map(() => 0); this.tirAvant = false; this.tampon = -INF; this._vide = false; this.tA = -INF; this.sT = -INF; this.spTac = false;
    this.vk = 0; this.seq = 0; this.chaleur = 0; this.reculI = 0;
    const f = this.armes[0], D = f && (f.dispersion || null), b = D ? D.repos : 0;
    this.bDe = b; this.bVers = b; this.bT0 = -INF; this._s = (f && f.gerbe ? f.gerbe.cone : b) * DEG;
    this.envol = -INF; this.air = false; this.glT = -INF; this.gl = false;
    this.kC = -1; this.kF = false; this.kFin = -INF;
    this.gTy = ''; this.gT0 = 0; this.gTe = false; this.gRl = false; this.gLa = false; this.la = false;
    this.dT = -INF; this.cumV = 0; this.rT0 = -1; this.rTot = 0; this.rFait = 0; this.aV = 0; this.aH = 0;
    this.let = this.dotation.letale ? this.dotation.letale[1] : 0; this.tac = this.dotation.tactique ? this.dotation.tactique[1] : 0;
    // (le ressort visuel : affichage, hors de l'état)
    this.rv = 0; this.rvV = 0; this.rh = 0; this.rhV = 0; this.ps = 0; this.psV = 0; this.ro = 0; this.roV = 0;
  }

  get arme() { return this.armes[this.i] || null; }
  // l'heure du prochain tir permis, PAR ARME : le verrou du TP-50 (1,33 s) ou la pompe du FP-12 ne retiennent pas le pistolet
  // sorti juste après (relecture du 23/10 : une seule heure pour l'arsenal bloquait le P-17 jusqu'au bout du verrou)
  get prochain() { return this.pr[this.i]; }
  set prochain(v) { this.pr[this.i] = v; }
  get emplacement() { return this.arme ? this.arme.emplacement : null; }
  get chargeur() { return this.ch[this.i] || 0; }
  get reserve() { return this.res[this.i] || 0; }
  get etatArme() { return this.et; }
  get tEtat() { return Math.max(0, (this.acteur.partie ? this.acteur.partie.t : 0) - this.t0); }
  get visee() { const k = 1 - this.vk; return 1 - k * k * k; }        // (la courbe 1 − (1 − t)³ ; `vk` est le temps linéaire)
  get dispersion() { return this._s; }                                // rad, demi-angle courant (le réticule dit la vérité)
  get reculV() { return this.rv; } get reculH() { return this.rh; }  // degrés, ressort VISUEL (cabré > 0 ; à droite > 0)
  // (F2, demande de L-A (e) — lu par js/jeu/mouvement.js : le front `recharger` coupe le sprint du corps quand une recharge
  // peut partir, sinon l'arme baissée du sprint la perdait) une recharge peut-elle partir maintenant ?
  peutRecharger() {
    const f = this.arme; if (!f || !f.recharge) return false;
    const ch = this.ch[this.i], res = this.res[this.i], capMax = f.chargeur + (f.recharge.parCartouche || ch === 0 ? 0 : 1);
    return res > 0 && ch < capMax && (this.et === 'pret' || this.et === 'tir' || this.et === 'sprint');
  }
  get piston() { return this.ps; } get roulis() { return this.ro; }  // m (l'arme recule) ; degrés
  get tirSeq() { return this.seq; }
  get letales() { return this.let; }
  get tactiques() { return this.tac; }
  // (ce que lisent l'arme de vue et le HUD, en plus du contrat)
  get versArme() { return this.vers >= 0 ? this.armes[this.vers].id : null; }       // l'arme qui sort pendant un changement
  get dernierTir() { return this.dT; }
  get grenade() { return this.gTy || null; }                                        // 'frag' | 'flash' pendant un lancer
  get cuisson() { return this.gTe && this.acteur.partie ? this.acteur.partie.t - this.gT0 : 0; }   // s de mèche brûlée en main
  get phaseLancer() {
    if (this.et !== 'lancer') return null;
    const t = this.acteur.partie ? this.acteur.partie.t : 0;
    if (!this.gLa) return t - this.gT0 < GESTES.goupille ? 'goupille' : 'tenue';
    return this.fin - t > GESTES.remontee ? 'lance' : 'remontee';
  }
  get cartouches() { return this.nC; }                                              // FP-12 : cartouches à entrer encore

  _etat(et, t, duree) { this.et = et; this.t0 = t; this.fin = t + duree; }

  // ---------------------------------------------------------------- LE PAS (Partie.pas, étape 6)
  pas(dt, cmd, partie) {
    const a = this.acteur, f = this.arme, t = partie.t;
    this._ressorts(dt);
    this._rappel(t);
    const letale = !!cmd.letale;
    if (!f || this.bloque || !a.vivant) { this.tirAvant = !!cmd.tir; this.la = letale; return; }
    const c = a.corps, v = c && c.vel ? Math.hypot(c.vel.x, c.vel.z) : 0, enAir = !!(c && c.airborne);
    if (enAir && !this.air) this.envol = t;
    this.air = enAir;
    const gl = (a.glisse || 0) > 0.05;
    if (gl && !this.gl) this.glT = t;
    this.gl = gl;
    // les fronts : le tir (semi-automatiques : tamponné 0,1 s), la grenade (tenue : l'appui tire la goupille)
    const front = !!cmd.tir && !this.tirAvant;
    this.tirAvant = !!cmd.tir;
    if (front) this.tampon = t;
    const frontLetale = letale && !this.la;
    this.la = letale;
    this.chaleur = Math.max(0, this.chaleur - (f.dispersion ? f.dispersion.retour : 7) * dt);
    const sprinte = this._sprinte(a, cmd);
    const veutTirer = f.auto ? !!cmd.tir : t - this.tampon <= 0.1 + 1e-9;
    this._viser(dt, cmd, t, sprinte, enAir, gl);
    this._machine(cmd, partie, t, sprinte, veutTirer, frontLetale, letale, v);
    if (!cmd.tir) this._vide = false;
    this._disperser(t, v, enAir, gl);
  }

  // le corps sprinte-t-il ? (un Player : son drapeau de course ; un autre corps : la commande)
  _sprinte(a, cmd) {
    const j = a.joueur;
    if (j && a.corps === j) return !!j.sprinting;
    return !!cmd.sprint && !!(cmd.ax || cmd.ay) && !cmd.visee;
  }
  // un sprint TACTIQUE ? (le drapeau de js/jeu/mouvement.js s'il le pose, sinon la vitesse : 7,8 m/s contre 6,6)
  _tactique(a, v) { return a.sprintTactique !== undefined ? !!a.sprintTactique : v > 7.2; }

  // LA VISÉE (0 → 1 au temps d'ADS ; la sortie au même rythme)
  _viser(dt, cmd, t, sprinte, enAir, gl) {
    const f = this.arme;
    let veut = !!cmd.visee && !sprinte && (this.et === 'pret' || this.et === 'tir' || this.et === 'recharge');
    if (enAir && t - this.envol < 0.1) veut = false;
    if (gl && t - this.glT < 0.35) veut = false;
    this.vk = clamp(this.vk + (veut ? dt : -dt) / f.ads, 0, 1);
  }

  _machine(cmd, partie, t, sprinte, veutTirer, frontLetale, letale, v) {
    const a = this.acteur, f = this.arme;
    const peut = partie.peutTirer(a);
    // 1. LE FRANCHISSEMENT (js/jeu/mouvement.js pose `acteur.franchit` pendant le geste) : rien en main
    if (a.franchit && this.et !== 'lancer' && this.et !== 'couteau') {
      if (this.et !== 'franchit') { this._annulerRecharge(partie); this._etat('franchit', t, 0); this.vk = 0; }
      return;
    }
    if (this.et === 'franchit') { this._etat('pret', t, 0); this.tA = Math.max(this.tA, t + f.sprintTir); this.sT = this.tA; }
    // 2. UN GESTE EN COURS : la grenade, le couteau, le changement d'arme
    if (this.et === 'lancer') { this._lancer(partie, t, letale); return; }
    if (this.et === 'couteau') { this._couteau(partie, t); return; }
    if (this.et === 'change') {
      if (!this.basc && t + 1e-9 >= this.tB) {
        this.i = this.vers; this.basc = true; this.tampon = -INF; this.reculI = 0;     // (le motif de recul repart du début)
        partie.evt('arme', { a: a.id, id: this.arme.id });
      }
      if (t + 1e-9 >= this.fin) { this.vers = -1; this._etat('pret', t, 0); }
      return;
    }
    // 3. LES GESTES DEMANDÉS : le couteau, la frag (appui = goupille), la flash
    if (peut) {
      if (cmd.couteau && this.dotation.couteau !== false) { this._annulerRecharge(partie); this._debutCouteau(partie, t); return; }
      if (frontLetale && this.let > 0 && this.dotation.letale) { this._annulerRecharge(partie); this._debutLancer(this.dotation.letale[0], t); return; }
      if (cmd.tactique && this.tac > 0 && this.dotation.tactique) { this._annulerRecharge(partie); this._debutLancer(this.dotation.tactique[0], t); return; }
    }
    // 4. LE CHANGEMENT D'ARME demandé (rangement, puis sortie)
    let cible = -1;
    if (cmd.armeN === 1 || cmd.armeN === 2) cible = cmd.armeN - 1;
    else if (cmd.armeSuiv || cmd.armePrec) cible = (this.i + (cmd.armeSuiv ? 1 : this.armes.length - 1)) % this.armes.length;
    if (cible >= 0 && cible < this.armes.length && cible !== this.i) {
      this._annulerRecharge(partie);
      this.vers = cible; this.basc = false; this.tB = t + f.rangement;
      this._etat('change', t, f.rangement + this.armes[cible].sortie);
      this.vk = 0;
      return;
    }
    // 5. LA RECHARGE en cours
    if (this.et === 'recharge') {
      this._recharge(partie, t, sprinte, veutTirer, peut);
      if (this.et === 'recharge') return;
    }
    // 6. LE SPRINT : arme baissée ; en sortir coûte `sprintTir` (sprint tactique : `sprintTactTir`)
    const tact = this._tactique(a, v);
    if (this.et === 'sprint') {
      if (!sprinte || veutTirer || cmd.visee) {
        this._etat('pret', t, 0);
        this.tA = Math.max(this.tA, t + (this.spTac ? f.sprintTactTir : f.sprintTir)); this.sT = this.tA;
        if (veutTirer && !f.auto) this.tampon = this.tA;    // (le clic qui a fait sortir du sprint part au bout de la sortie)
      } else { if (tact) this.spTac = true; return; }
    } else if (sprinte && !veutTirer && (this.et === 'pret' || (this.et === 'tir' && t + 1e-9 >= this.prochain))) {
      this._etat('sprint', t, 0); this.spTac = tact;
      return;
    }
    // 7. RECHARGER : sur le front, ou d'office à vide (la cadence du dernier tir finie)
    // (F2 : une arme sans recharge — le couteau tenu en main, une dotation de test de L-B — ne recharge pas)
    const ch = this.ch[this.i], res = this.res[this.i];
    const capMax = f.recharge ? f.chargeur + (f.recharge.parCartouche || ch === 0 ? 0 : 1) : 0;
    if (f.recharge && res > 0 && ((cmd.recharger && ch < capMax) || (ch === 0 && (this.et !== 'tir' || t + 1e-9 >= this.prochain)))) {
      if (this.et === 'pret' || this.et === 'tir') { this._recharger(f, t, partie); return; }
    }
    // 8. TIRER
    if (veutTirer && peut && t + 1e-9 >= this.tA) {
      if (ch > 0 && t + 1e-9 >= this.prochain) {
        this.prochain = Math.max(this.prochain, t - PAS) + 60 / f.rpm;
        this.tampon = -INF;
        this._etat('tir', t, 60 / f.rpm);
        this._tirer(f, partie, t);
        this._vide = false;
        return;
      }
      if (ch === 0 && res === 0 && !this._vide) { this._vide = true; this.tampon = -INF; partie.evt('vide', { a: a.id }); }
    }
    if (this.et === 'tir' && t + 1e-9 >= this.prochain) this.et = 'pret';
  }

  // ---------------------------------------------------------------- les recharges
  _recharger(f, t, partie) {
    const ch = this.ch[this.i];
    this.tact = ch > 0;
    if (f.recharge.parCartouche) {
      const R = f.recharge, n = Math.min(f.chargeur - ch, this.res[this.i]);
      this.nC = n; this.pp = ch === 0; this.tC = t + R.debut + R.parCartouche;
      this._etat('recharge', t, R.debut + R.parCartouche * n + (this.pp ? R.pompe : 0) + R.fin);
      this.entre = false;
    } else {
      this._etat('recharge', t, this.tact ? f.recharge.tact : f.recharge.vide);
      this.tEntrees = t + f.recharge.ajout; this.entre = false;
    }
    partie.evt('recharge', { a: this.acteur.id, phase: 'debut', tactique: this.tact });
  }
  // la recharge en cours : les balles entrent à leur heure ; le sprint l'annule avant ; le FP-12 entre ses cartouches une à
  // une, et un tir l'interrompt (s'il y a de quoi tirer)
  _recharge(partie, t, sprinte, veutTirer, peut) {
    const a = this.acteur, f = this.arme, R = f.recharge;
    if (R.parCartouche) {
      while (this.nC > 0 && t + 1e-9 >= this.tC && this.res[this.i] > 0) {
        this.ch[this.i]++; this.res[this.i]--; this.nC--; this.tC += R.parCartouche; this.entre = true;
        partie.evt('recharge', { a: a.id, phase: 'insere', tactique: this.tact, n: 1 });
      }
      if (veutTirer && peut && this.ch[this.i] > 0 && this.nC > 0) {
        // interrompue : la pompe d'abord si le tube était vide, sinon la main revient à la poignée
        this._etat('pret', t, 0); this.nC = 0;
        this.tA = Math.max(this.tA, t + (this.pp ? R.pompe : GESTES.sortieRecharge)); this.pp = false;
        this.tampon = this.tA;                              // (le coup demandé part dès que la main est revenue)
        partie.evt('recharge', { a: a.id, phase: 'interrompue', tactique: this.tact });
        return;
      }
      if (sprinte && this.nC > 0) { this._etat('pret', t, 0); this.nC = 0; partie.evt('recharge', { a: a.id, phase: 'annulee', tactique: this.tact }); return; }
      if (t + 1e-9 >= this.fin) { this._etat('pret', t, 0); this.nC = 0; this.pp = false; partie.evt('recharge', { a: a.id, phase: 'fin', tactique: this.tact }); }
      return;
    }
    if (!this.entre && sprinte) { this._etat('pret', t, 0); partie.evt('recharge', { a: a.id, phase: 'annulee', tactique: this.tact }); return; }
    if (!this.entre && t + 1e-9 >= this.tEntrees) {
      const besoin = f.chargeur + (this.tact ? 1 : 0) - this.ch[this.i], n = Math.max(0, Math.min(besoin, this.res[this.i]));
      this.ch[this.i] += n; this.res[this.i] -= n; this.entre = true;
      partie.evt('recharge', { a: a.id, phase: 'insere', tactique: this.tact, n });
    }
    // (balles entrées : le sprint ou la fin du geste rendent l'arme)
    if (t + 1e-9 >= this.fin || (this.entre && sprinte)) { this._etat('pret', t, 0); partie.evt('recharge', { a: a.id, phase: 'fin', tactique: this.tact }); }
  }
  // un geste qui coupe la recharge : avant l'entrée des balles, rien n'a changé ; le FP-12 garde ses cartouches entrées.
  // Chaque 'debut' est fermé par UN 'fin' | 'annulee' | 'interrompue' (balles déjà entrées : 'fin', le geste est fait)
  _annulerRecharge(partie) {
    if (this.et !== 'recharge') return;
    partie.evt('recharge', { a: this.acteur.id, phase: this.entre && this.nC === 0 ? 'fin' : 'annulee', tactique: this.tact });
    this.nC = 0; this.pp = false;
  }

  // ---------------------------------------------------------------- le tir
  _tirer(f, partie, t) {
    const a = this.acteur, B = partie.balistique;
    this.ch[this.i]--; this.seq++; a.stats.tirs++; this.dT = t;
    a.oeil(_o); a.regard(_d);
    const R = this._rng.seed(melanger(partie.graine | 0, a.id | 0, this.seq));
    // la base perpendiculaire à la visée : la droite (horizontale) et le haut de l'écran
    // (droite = (cos l, 0, −sin l) ; haut = droite × regard)
    const l = a.cmd.lacet, rx = Math.cos(l), rz = -Math.sin(l);
    const hx = -rz * _d.y, hy = rz * _d.x - rx * _d.z, hz = rx * _d.y;
    const n = f.plombs || 1, G = f.gerbe, s = this._s;
    partie.evt('tir', { a: a.id, arme: f.id, ox: _o.x, oy: _o.y, oz: _o.z, dx: _d.x, dy: _d.y, dz: _d.z, n, seq: this.seq, visee: this.visee });
    const phi0 = 2 * Math.PI * R.next();
    for (let p = 0; p < n; p++) {
      let r, th;
      if (G) {
        const cone = s / DEG;
        if (p < G.centre) { r = R.next() * G.tremble; th = 2 * Math.PI * R.next(); }
        else { r = G.rayon * cone + (2 * R.next() - 1) * G.tremble; th = phi0 + 2 * Math.PI * (p - G.centre) / G.couronne + (2 * R.next() - 1) * 0.05; }
        r *= DEG;
      } else { tirage(R, s, _t); r = _t.r; th = _t.th; }
      const cr = Math.cos(r), sr = Math.sin(r), ct = Math.cos(th), st = Math.sin(th);
      let dx = cr * _d.x + sr * (ct * rx + st * hx), dy = cr * _d.y + sr * (st * hy), dz = cr * _d.z + sr * (ct * rz + st * hz);
      const k = 1 / Math.hypot(dx, dy, dz); dx *= k; dy *= k; dz *= k;
      const res = B.tirer(partie, a, _o.x, _o.y, _o.z, dx, dy, dz, f.portee || 100, this._res[p] || (this._res[p] = {}), p);
      partie.resoudreTir(a, f, _o.x, _o.y, _o.z, dx, dy, dz, res, p);
      partie.evt('trajet', { a: a.id, plomb: p, ox: _o.x, oy: _o.y, oz: _o.z, x: res.x, y: res.y, z: res.z, mat: res.mat });
    }
    if (f.dispersion) this.chaleur = Math.min(f.dispersion.max, this.chaleur + f.dispersion.parTir);
    this._recul(f, a, R);
  }

  // LE RECUL d'un tir : le motif (puis sa boucle et son aléa), × visée × accroupi, accumulé pour `prendreRecul` ; le ressort
  // visuel reçoit son impulsion
  _recul(f, a, R) {
    const M = f.recul; if (!M) return;
    const i = this.reculI++, L = M.v.length;
    let v, h;
    if (i < L) { v = M.v[i]; h = M.h[i] || 0; }
    else {
      const j = L - M.boucle + ((i - L) % M.boucle);
      v = M.v[j] + (2 * R.next() - 1) * M.alea; h = (M.h[j] || 0) + (2 * R.next() - 1) * M.alea;
    }
    if (M.aleaH) h += (2 * R.next() - 1) * M.aleaH;
    const k = (1 - (1 - M.visee) * this.visee) * (1 - (1 - M.accroupi) * (a.accroupi || 0));
    v *= k; h *= k;
    // (un rappel en cours s'arrête : ce qu'il a déjà rendu n'est plus à rendre)
    if (this.rT0 >= 0) { this.cumV -= this.rFait; this.rT0 = -1; this.rFait = 0; this.rTot = 0; }
    this.aV += v * DEG; this.aH += h * DEG; this.cumV += v * DEG;
    // le ressort visuel : le cabré et le piston de la fiche, un roulis d'un côté ou de l'autre, le coup de côté du motif
    // (F2, demande de L-V : l'aléa du cabré tenu à ± 5 %, celui du critère des pics)
    this.rvV += M.cabre * IMPULSION * (0.95 + 0.1 * R.next());
    this.psV += M.piston * IMPULSION;
    this.roV += (R.next() < 0.5 ? -1 : 1) * M.roulis * IMPULSION * (0.5 + 0.5 * R.next());
    this.rhV += h * 2 * IMPULSION;
  }
  // LE RAPPEL : `rappelDelai` après le dernier tir, `rappel` × la montée accumulée revient en `rappelT` (le motif repart
  // de zéro ensuite)
  _rappel(t) {
    const f = this.arme, M = f && f.recul;
    if (!M || this.cumV <= 0) return;
    const debut = this.dT + (M.rappelDelai || 0);
    if (t + 1e-9 < debut) return;
    if (this.rT0 < 0) { this.rT0 = debut; this.rTot = M.rappel * this.cumV; this.rFait = 0; }
    const k = M.rappelT > 0 ? Math.min(1, (t - this.rT0) / M.rappelT) : 1;
    const voulu = this.rTot * k;
    this.aV -= voulu - this.rFait; this.rFait = voulu;
    if (k >= 1 - 1e-9) { this.cumV = 0; this.rT0 = -1; this.rFait = 0; this.rTot = 0; this.reculI = 0; }
  }
  // le ressort visuel, intégré exactement sur le pas (au pas fixe PAS ; un autre dt — jamais aujourd'hui — prend les mêmes
  // formules à ses coefficients)
  _ressorts(dt) {
    let E = RES_E, Cc = RES_C, Ss = RES_S;
    if (Math.abs(dt - PAS) > 1e-12) { E = Math.exp(-RES_A * dt); Cc = Math.cos(RES_B * dt); Ss = Math.sin(RES_B * dt); }
    const w2 = OMEGA * OMEGA, un = (x, v) => {
      const B = (v + RES_A * x) / RES_B;
      return [E * (x * Cc + B * Ss), E * (v * Cc - (RES_A * v + w2 * x) / RES_B * Ss)];
    };
    [this.rv, this.rvV] = un(this.rv, this.rvV);
    [this.rh, this.rhV] = un(this.rh, this.rhV);
    [this.ps, this.psV] = un(this.ps, this.psV);
    [this.ro, this.roV] = un(this.ro, this.roV);
  }

  // LA DISPERSION courante (rad) : la base de l'allure (interpolée en 0,12 s), × 0,8 accroupi, + la chaleur ; × 1,3 en
  // glissade ; vers la valeur de visée (immobile / en mouvement) selon la visée. Le FP-12 : son cône (hanche → visée).
  _disperser(t, v, enAir, gl) {
    const a = this.acteur, f = this.arme, k = this.visee;
    let hanche, visee;
    if (f.gerbe) { hanche = f.gerbe.cone; visee = f.gerbe.coneVisee; }
    else {
      const D = f.dispersion;
      if (!D) { this._s = 0; return; }
      const cible = enAir ? D.saut : (this.et === 'sprint' || t < this.sT) ? D.sprint : v > 3 ? D.course : v > 0.3 ? D.marche : D.repos;
      if (cible !== this.bVers) { this.bDe = this._base(t); this.bVers = cible; this.bT0 = t; }
      hanche = this._base(t) * (1 - 0.2 * (a.accroupi || 0)) + this.chaleur;
      visee = v > 0.3 ? D.viseeMouvement : D.visee;
    }
    if (gl) hanche *= 1.3;
    this._s = (hanche + (visee - hanche) * k) * DEG;
  }
  _base(t) { const k = clamp((t - this.bT0) / BASCULE, 0, 1); return this.bDe + (this.bVers - this.bDe) * k; }

  // ---------------------------------------------------------------- le couteau
  // l'ennemi le plus proche dans le cône (degrés, autour du regard au sol), à ≤ `portee` m (centres), à son niveau, vu
  _cibleCouteau(partie, portee, cone) {
    const a = this.acteur, p = a.corps.pos, l = a.cmd.lacet, fx = -Math.sin(l), fz = -Math.cos(l), cosC = Math.cos(cone * DEG);
    a.oeil(_o);
    let best = null, bd = INF;
    for (const b of partie.acteurs) {
      if (b === a || !b.vivant || !b.corps || !partie.ennemis(a, b)) continue;
      const q = b.corps.pos, dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
      if (d > portee + 1e-6 || Math.abs(q.y - p.y) > 1.0) continue;
      if (d > 0.35 && (dx * fx + dz * fz) / d < cosC) continue;
      // (la LIGNE LIBRE d'un objet, pas la vue : une vitre claire laisse voir, pas passer la lame — relecture du 23/10)
      if (!partie.balistique.libre(_o.x, _o.y, _o.z, q.x, q.y + 1.2 * b.h / 1.73, q.z)) continue;
      if (d < bd) { bd = d; best = b; }
    }
    this._dCouteau = bd;
    return best;
  }
  _debutCouteau(partie, t) {
    const K = ARMES.couteau;
    this._etat('couteau', t, K.coup); this.vk = 0; this.kF = false; this.kC = -1; this.kFin = -INF;
    const b = this._cibleCouteau(partie, K.fente, K.coneFente);
    if (b && this._dCouteau > K.portee + 1e-6) { this.kC = b.id; this.kFin = t + K.dureeFente; }
  }
  _couteau(partie, t) {
    const a = this.acteur, K = ARMES.couteau, c = a.corps, C = partie.game && partie.game.collisions;
    // LA FENTE : tiré vers lui à 6 m/s, par le monde solide (≤ 0,05 m par pas), jusqu'au contact
    if (this.kC >= 0 && t <= this.kFin + 1e-9) {
      const b = partie.acteurParId(this.kC);
      if (!b || !b.vivant || !b.corps) this.kC = -1;
      else {
        const p = c.pos, dx = b.corps.pos.x - p.x, dz = b.corps.pos.z - p.z, d = Math.hypot(dx, dz);
        if (d > K.contact) {
          const pas = Math.min(K.vitesseFente * PAS, d - K.contact);
          _pos.x = p.x; _pos.z = p.z;
          if (C) C.deplacer(_pos, dx / d * pas, dz / d * pas, c.rayon ?? 0.3, null, p.y + (c.jumpY || 0), c.hautCorps, c.basCorps);
          else { _pos.x += dx / d * pas; _pos.z += dz / d * pas; }
          p.x = _pos.x; p.z = _pos.z;
          if (C) p.y = C.solEn(p.x, p.z, p.y);
        }
      }
    }
    // LA TOUCHE, à 0,12 s : l'ennemi à portée (1,6 m de son bord : son centre à ≤ 1,6 + 0,3), dans un cône de 35°
    if (!this.kF && t + 1e-9 >= this.t0 + K.touche) {
      this.kF = true;
      const b = this._cibleCouteau(partie, K.portee + 0.3, K.coneTouche);
      a.oeil(_o); a.regard(_d);
      const res = this._res[0];
      if (b) {
        const q = b.corps.pos, e = b.h / 1.73;
        // (la tête si le regard la croise, sinon le buste)
        const hx = q.x - _o.x, hz = q.z - _o.z, ht = q.y + 1.635 * e - _o.y, d = Math.hypot(hx, ht, hz);
        const tete = d > 1e-6 && (hx * _d.x + ht * _d.y + hz * _d.z) / d > Math.cos(12 * DEG) && _d.y > -0.2;
        _p.set(q.x - _o.x, q.y + (tete ? 1.635 : 1.27) * e - _o.y, q.z - _o.z);
        const L = _p.length() || 1; _p.multiplyScalar(1 / L);
        res.acteur = b; res.zone = tete ? 'tete' : 'torse'; res.t = Math.min(this._dCouteau, K.portee);
        res.x = q.x; res.y = q.y + (tete ? 1.635 : 1.27) * e; res.z = q.z; res.nx = -_p.x; res.ny = -_p.y; res.nz = -_p.z;
        res.mat = 'corps'; res.forme = null; res.traverse = false;
        partie.resoudreTir(a, K, _o.x, _o.y, _o.z, _p.x, _p.y, _p.z, res, 0);
        partie.evt('couteau', { a: a.id, cible: b.id, x: res.x, y: res.y, z: res.z });
      } else {
        // dans le vide, ou sur le décor à portée
        const m = partie.balistique.balle(_o.x, _o.y, _o.z, _d.x, _d.y, _d.z, K.portee, res);
        res.acteur = null; res.zone = null; res.traverse = false;
        if (m.mat !== 'rien') partie.resoudreTir(a, K, _o.x, _o.y, _o.z, _d.x, _d.y, _d.z, res, 0);
        partie.evt('couteau', { a: a.id, cible: -1, x: res.x, y: res.y, z: res.z });
      }
    }
    if (t + 1e-9 >= this.fin) { this.kC = -1; this._etat('pret', t, 0); }
  }

  // ---------------------------------------------------------------- les grenades
  _debutLancer(type, t) {
    this._etat('lancer', t, INF); this.vk = 0;
    this.gTy = type; this.gT0 = t; this.gTe = type === 'frag'; this.gRl = type !== 'frag'; this.gLa = false;
  }
  // la grenade en main : la goupille (0,15 s), puis tenue (la frag cuit) jusqu'au relâché ; lancée ; l'arme remonte
  _lancer(partie, t, letale) {
    const a = this.acteur, F = ARMES[this.gTy], G = GESTES;
    if (!this.gLa) {
      if (!letale && this.gTy === 'frag') this.gRl = true;
      const cuite = t - this.gT0;
      if (this.gTy === 'frag' && cuite + 1e-9 >= F.meche) {
        // la mèche au bout, EN MAIN (dégâts à soi comptés)
        partie.grenades.lancer(a, 'frag', 0);
        this.let--; this.gLa = true; this.gTe = false; this.t0 = t; this.fin = t + G.remontee;
        return;
      }
      if (this.gRl && cuite + 1e-9 >= G.goupille) {
        partie.grenades.lancer(a, this.gTy, this.gTy === 'frag' ? F.meche - cuite : F.meche);
        if (this.gTy === 'frag') this.let--; else this.tac--;
        this.gLa = true; this.gTe = false; this.t0 = t; this.fin = t + G.lancer + G.remontee;
      }
      return;
    }
    if (t + 1e-9 >= this.fin) { this.gTy = ''; this._etat('pret', t, 0); }
  }

  // ---------------------------------------------------------------- le contrat
  // le recul de VISÉE accumulé depuis le dernier appel, remis à zéro (rad ; v > 0 = vers le HAUT : camPitch −= v)
  prendreRecul(out) { out.v = this.aV; out.h = this.aH; this.aV = 0; this.aH = 0; return out; }
  // UN CHARGEUR rendu à l'élimination (§ 3.5) : à la réserve de l'arme PRINCIPALE, plafonné à la réserve de départ
  ajouterChargeur() {
    const j = this.armes.findIndex((f) => f.emplacement === 'principale');
    if (j < 0) return false;
    const f = this.armes[j], avant = this.res[j];
    this.res[j] = Math.min(f.reserve, this.res[j] + f.chargeur);
    return this.res[j] > avant;
  }
  // tout plein (une réapparition)
  remplir() { this._remise(this.acteur.partie ? this.acteur.partie.t : 0); }
  ramasser(idArme) { return false; }             // (vague 3 : les armes au sol, L-P)

  etat() {
    const fin = (v) => (Number.isFinite(v) ? v : null);
    return { i: this.i, ch: this.ch.slice(), res: this.res.slice(), et: this.et, t: this.t0, vk: this.vk, seq: this.seq, chaleur: this.chaleur,
      reculI: this.reculI, let: this.let, tac: this.tac, fin: fin(this.fin), ent: this.entre, tE: this.tEntrees, vers: this.vers, basc: this.basc, tB: this.tB,
      tact: this.tact, nC: this.nC, tC: this.tC, pp: this.pp, pr: this.pr.slice(), ta: this.tirAvant, tp: fin(this.tampon), vide: this._vide,
      tA: fin(this.tA), sT: fin(this.sT), spT: this.spTac, bD: this.bDe, bV: this.bVers, bT: fin(this.bT0), s: this._s,
      env: fin(this.envol), air: this.air, glT: fin(this.glT), gl: this.gl, kC: this.kC, kF: this.kF, kFin: fin(this.kFin), dC: fin(this._dCouteau ?? null),
      gTy: this.gTy, gT0: this.gT0, gTe: this.gTe, gRl: this.gRl, gLa: this.gLa, la: this.la,
      dT: fin(this.dT), cumV: this.cumV, rT0: this.rT0, rTot: this.rTot, rF: this.rFait, aV: this.aV, aH: this.aH };
  }
  appliquer(e) {
    const inf = (v) => (v === null || v === undefined ? -INF : v);
    this.i = e.i; this.ch = e.ch.slice(); this.res = e.res.slice(); this.et = e.et; this.t0 = e.t; this.vk = e.vk; this.seq = e.seq;
    this.chaleur = e.chaleur; this.reculI = e.reculI; this.let = e.let; this.tac = e.tac; this.fin = e.fin === null ? INF : e.fin;
    this.entre = e.ent; this.tEntrees = e.tE ?? 0; this.vers = e.vers; this.basc = !!e.basc; this.tB = e.tB ?? 0;
    this.tact = e.tact; this.nC = e.nC ?? 0; this.tC = e.tC ?? 0; this.pp = !!e.pp; this.pr = Array.isArray(e.pr) ? e.pr.slice() : this.armes.map(() => e.pr ?? 0); this.tirAvant = e.ta;
    this.tampon = inf(e.tp); this._vide = e.vide; this.tA = inf(e.tA); this.sT = inf(e.sT); this.spTac = !!e.spT;
    this.bDe = e.bD ?? this.bDe; this.bVers = e.bV ?? this.bVers; this.bT0 = inf(e.bT); this._s = e.s ?? this._s;
    this.envol = inf(e.env); this.air = !!e.air; this.glT = inf(e.glT); this.gl = !!e.gl;
    this.kC = e.kC ?? -1; this.kF = !!e.kF; this.kFin = inf(e.kFin); this._dCouteau = e.dC === null || e.dC === undefined ? undefined : e.dC;
    this.gTy = e.gTy || ''; this.gT0 = e.gT0 ?? 0; this.gTe = !!e.gTe; this.gRl = !!e.gRl; this.gLa = !!e.gLa; this.la = !!e.la;
    this.dT = inf(e.dT); this.cumV = e.cumV ?? 0; this.rT0 = e.rT0 ?? -1; this.rTot = e.rTot ?? 0; this.rFait = e.rF ?? 0; this.aV = e.aV ?? 0; this.aH = e.aH ?? 0;
  }
}
