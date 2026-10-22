// =====================================================================
//  LES ARMES — squelette du socle S0 (22/10), rempli par le lot L-A
// =====================================================================
// Les FICHES (spec §§ 3.3-3.4, au complet : cinq armes aux noms inventés, le couteau, la frag, la flash), les classes, la
// dotation du chasseur du prop hunt, `degatsDe` exact, et l'ARSENAL d'un acteur : sa machine d'état. Le squelette tire
// (cadence AVEC REPORT DU RESTE : `prochain = max(prochain, t − PAS) + 60/rpm`, au plus un tir par pas ; automatique par
// `tir` tenu, semi-automatique par front tamponné 0,1 s), recharge (tactique : il restait des balles → chargeur + 1 ; à
// vide ; les balles ENTRENT au temps de la fiche, une recharge annulée avant n'a rien changé), change d'arme (rangement
// puis sortie), vise (0 → 1 au temps d'ADS) et rend un chargeur à l'élimination. Il n'a ni recul (`prendreRecul` rend 0),
// ni dispersion, ni couteau, ni grenade : L-A. Les tirs passent par la balistique (js/jeu/balistique.js tirer) puis par
// `partie.resoudreTir`, qui DIFFÈRE leurs effets (spec § 4.3.2, étape 6) ; l'arsenal ne touche jamais une vie.
import * as THREE from 'three';
import { PAS } from './constantes.js';

const INF = Infinity;
// LES FICHES. Distances en m, temps en s, angles en DEGRÉS (dispersion, recul : noms suffixés dans les tables de L-A).
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
    dispersion: null,   // (L-A : plus large à la hanche que la FA-24)
    recul: { v: [0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.40, 0.40], h: [0.10, -0.12, 0.14, -0.16, 0.18, -0.20, 0.22, -0.22], boucle: 2,
      alea: 0.06, aleaH: 0, visee: 0.8, accroupi: 0.85, rappel: 0.40, rappelT: 0.30, rappelDelai: 0.30, piston: 0.020, cabre: 1.6, roulis: 1.0 },
    bruit: 40, son: 'pm9', portee: 100, encombrement: 0.62 },
  fp12: { id: 'fp12', nom: 'FP-12 « Bélier »', classe: 'pompe', emplacement: 'principale', auto: false, rpm: 70,
    degats: [[5, 18], [9, 11], [14, 6], [INF, 0]], plombs: 8, zones: { tete: 1.0, cou: 1.0, torse: 1.0, ventre: 1.0, jambes: 1.0 },
    chargeur: 7, reserve: 21, ads: 0.26, sprintTir: 0.18, sprintTactTir: 0.27, mobilite: 1.00, zoom: 1.10,
    // (cartouche par cartouche, interruptible : 0,35 + 0,42 par cartouche + 0,30, et 0,45 de pompe à vide)
    recharge: { tact: null, vide: null, ajout: null, debut: 0.35, parCartouche: 0.42, fin: 0.30, pompe: 0.45 }, sortie: 0.32, rangement: 0.22,
    dispersion: null,   // (L-A)
    gerbe: { centre: 1, couronne: 7, rayon: 0.6, cone: 5.0, coneVisee: 3.6, tremble: 0.3 },
    recul: { v: [4.5], h: [0], boucle: 1, alea: 0, aleaH: 0.8, visee: 0.8, accroupi: 0.85, rappel: 1.0, rappelT: 0.45, rappelDelai: 0.0,
      piston: 0.060, cabre: 8.0, roulis: 1.0 },
    bruit: 45, son: 'fp12', portee: 40, encombrement: 0.95 },
  tp50: { id: 'tp50', nom: 'TP-50 « Héron »', classe: 'precision', emplacement: 'principale', auto: false, rpm: 45,
    degats: [[INF, 105]], plombs: 1, zones: { tete: 2.0, cou: 1.5, torse: 1.0, ventre: 0.9, jambes: 0.75 },
    chargeur: 5, reserve: 20, ads: 0.42, sprintTir: 0.32, sprintTactTir: 0.48, mobilite: 0.92, zoom: 4.0,
    recharge: { tact: 2.30, vide: 2.90, ajout: 1.70 }, sortie: 0.38, rangement: 0.25,
    dispersion: null,   // (L-A : 8° « au jugé » à la hanche)
    recul: { v: [6.0], h: [0], boucle: 1, alea: 0, aleaH: 0.5, visee: 0.8, accroupi: 0.85, rappel: 1.0, rappelT: 0.60, rappelDelai: 0.0,
      piston: 0.050, cabre: 6.0, roulis: 1.0 },
    bruit: 60, son: 'tp50', portee: 200, encombrement: 1.10 },
  p17: { id: 'p17', nom: 'P-17 « Moineau »', classe: 'pistolet', emplacement: 'secondaire', auto: false, rpm: 400,
    degats: [[10, 34], [20, 25], [INF, 20]], plombs: 1, zones: { tete: 1.5, cou: 1.2, torse: 1.0, ventre: 1.0, jambes: 0.9 },
    chargeur: 12, reserve: 48, ads: 0.15, sprintTir: 0.10, sprintTactTir: 0.15, mobilite: 1.08, zoom: 1.10,
    recharge: { tact: 1.30, vide: 1.65, ajout: 0.90 }, sortie: 0.20, rangement: 0.15,
    dispersion: null,   // (L-A : plus serrée que la FA-24)
    recul: { v: [1.1], h: [0], boucle: 1, alea: 0, aleaH: 0.25, visee: 0.8, accroupi: 0.85, rappel: 0.80, rappelT: 0.20, rappelDelai: 0.0,
      piston: 0.035, cabre: 4.0, roulis: 1.0 },
    bruit: 35, son: 'p17', portee: 80, encombrement: 0.19 },
  couteau: { id: 'couteau', nom: 'Couteau', classe: 'couteau', emplacement: 'couteau', degats: [[1.6, 150]], plombs: 1,
    zones: { tete: 1, cou: 1, torse: 1, ventre: 1, jambes: 1 }, portee: 1.6, fente: 2.4, coneFente: 25, vitesseFente: 6, dureeFente: 0.15,
    coup: 0.60, touche: 0.12, mobilite: 1.10, bruit: 4, son: 'couteau' },
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

// LES DÉGÂTS d'une balle (d'un plomb) : le palier de la distance × le coefficient de la zone
export function degatsDe(fiche, distance, zone) {
  if (!fiche || !fiche.degats) return 0;
  let d = 0;
  for (const [jusqua, v] of fiche.degats) { if (distance <= jusqua) { d = v; break; } }
  const k = fiche.zones && zone && fiche.zones[zone] !== undefined ? fiche.zones[zone] : 1;
  return d * k;
}

const _o = new THREE.Vector3(), _d = new THREE.Vector3();

// L'ARSENAL d'un acteur. `et` : 'pret' | 'tir' | 'recharge' | 'change' | 'sprint' | 'couteau' | 'lancer' | 'franchit' ;
// les minuteries sont des HEURES de partie (partie.t), elles entrent dans l'état (§ 4.7).
export class Arsenal {
  constructor(acteur, dotation, modificateurs = null) {
    this.acteur = acteur; this.dotation = dotation || CLASSES.assaut; this.modificateurs = modificateurs;
    this.armes = [this.dotation.principale, this.dotation.secondaire].filter(Boolean).map((id) => ARMES[id]).filter(Boolean);
    this.ch = this.armes.map((f) => f.chargeur); this.res = this.armes.map((f) => f.reserve);
    this.i = 0; this.et = 'pret'; this.t0 = 0; this.fin = 0; this.entre = false; this.vers = -1; this.tact = false;
    this.prochain = 0; this.tirAvant = false; this.tampon = -INF; this.vk = 0; this.seq = 0; this.chaleur = 0; this.reculI = 0;
    this.let = this.dotation.letale ? this.dotation.letale[1] : 0; this.tac = this.dotation.tactique ? this.dotation.tactique[1] : 0;
    this.bloque = false; this._vide = false;
    this._res = { acteur: null, zone: null, t: 0, x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0, mat: 'rien', forme: null, traverse: false };
  }
  get arme() { return this.armes[this.i] || null; }
  get emplacement() { return this.arme ? this.arme.emplacement : null; }
  get chargeur() { return this.ch[this.i] || 0; }
  get reserve() { return this.res[this.i] || 0; }
  get etatArme() { return this.et; }
  get tEtat() { return Math.max(0, (this.acteur.partie ? this.acteur.partie.t : 0) - this.t0); }
  get visee() { return this.vk; }
  get dispersion() { return 0; }                 // rad, demi-angle (L-A)
  get reculV() { return 0; } get reculH() { return 0; }   // degrés, ressort VISUEL (L-A)
  get tirSeq() { return this.seq; }
  get letales() { return this.let; }
  get tactiques() { return this.tac; }

  _etat(et, t, duree) { this.et = et; this.t0 = t; this.fin = t + duree; }

  pas(dt, cmd, partie) {
    const a = this.acteur, f = this.arme, t = partie.t;
    if (!f || this.bloque || !a.vivant) { this.tirAvant = !!cmd.tir; return; }
    // la visée : 0 → 1 au temps d'ADS de l'arme (pas en sprint)
    const veut = cmd.visee && !(cmd.sprint && (cmd.ax || cmd.ay)) && this.et !== 'change';
    this.vk = Math.max(0, Math.min(1, this.vk + (veut ? dt / f.ads : -dt / f.ads)));
    // le front de tir (semi-automatiques, pompe, verrou) : tamponné 0,1 s
    const front = !!cmd.tir && !this.tirAvant;
    this.tirAvant = !!cmd.tir;
    if (front) this.tampon = t;
    // CHANGEMENT D'ARME demandé
    let cible = -1;
    if (cmd.armeN === 1 || cmd.armeN === 2) cible = cmd.armeN - 1;
    else if (cmd.armeSuiv || cmd.armePrec) cible = (this.i + (cmd.armeSuiv ? 1 : this.armes.length - 1)) % this.armes.length;
    if (cible >= 0 && cible < this.armes.length && cible !== this.i && this.et !== 'change') {
      // (une recharge pas encore entrée est perdue : rien n'a changé)
      this.vers = cible;
      this._etat('change', t, f.rangement + this.armes[cible].sortie);
      this.vk = 0;
      return;
    }
    if (this.et === 'change') {
      if (t + 1e-9 >= this.fin) { this.i = this.vers; this.vers = -1; this._etat('pret', t, 0); partie.evt('arme', { a: a.id, id: this.arme.id }); }
      return;
    }
    if (this.et === 'recharge') {
      // annulée par le sprint tant que les balles ne sont pas entrées
      if (cmd.sprint && (cmd.ax || cmd.ay) && !this.entre) { this._etat('pret', t, 0); return; }
      if (!this.entre && t + 1e-9 >= this.tEntrees) {
        const besoin = f.chargeur + (this.tact ? 1 : 0) - this.ch[this.i], n = Math.min(besoin, this.res[this.i]);
        this.ch[this.i] += n; this.res[this.i] -= n; this.entre = true;
        partie.evt('recharge', { a: a.id, phase: 'insere', tactique: this.tact });
      }
      if (t + 1e-9 >= this.fin) { this._etat('pret', t, 0); partie.evt('recharge', { a: a.id, phase: 'fin', tactique: this.tact }); }
      return;
    }
    // RECHARGER : sur le front, ou d'office en voulant tirer chargeur vide
    const ch = this.ch[this.i], res = this.res[this.i];
    const veutTirer = f.auto ? !!cmd.tir : t - this.tampon <= 0.1 + 1e-9;
    if ((cmd.recharger && ch < f.chargeur && res > 0) || (veutTirer && ch === 0 && res > 0)) { this._recharger(f, t, partie); return; }
    // TIRER
    if (veutTirer && ch > 0 && t + 1e-9 >= this.prochain && partie.peutTirer(a)) {
      this.prochain = Math.max(this.prochain, t - PAS) + 60 / f.rpm;
      this.tampon = -INF;
      this._tirer(f, partie);
      this.et = 'tir'; this.t0 = t; this._vide = false;
    } else if (veutTirer && ch === 0 && !this._vide) { this._vide = true; this.tampon = -INF; partie.evt('vide', { a: a.id }); }
    else if (this.et === 'tir' && t >= this.prochain) this.et = 'pret';
  }

  _recharger(f, t, partie) {
    const ch = this.ch[this.i];
    this.tact = ch > 0;
    let duree, entrees;
    if (f.recharge.parCartouche) {
      const n = Math.min(f.chargeur - ch, this.res[this.i]);
      duree = f.recharge.debut + f.recharge.parCartouche * n + f.recharge.fin + (ch === 0 ? f.recharge.pompe : 0);
      entrees = duree - f.recharge.fin;                  // (squelette : toutes à la fin ; L-A les fait entrer une à une)
    } else { duree = this.tact ? f.recharge.tact : f.recharge.vide; entrees = f.recharge.ajout; }
    this._etat('recharge', t, duree);
    this.tEntrees = t + entrees; this.entre = false;
    partie.evt('recharge', { a: this.acteur.id, phase: 'debut', tactique: this.tact });
  }

  _tirer(f, partie) {
    const a = this.acteur;
    this.ch[this.i]--; this.seq++; a.stats.tirs++;
    a.oeil(_o); a.regard(_d);
    for (let p = 0; p < (f.plombs || 1); p++) {
      const r = partie.balistique.tirer(partie, a, _o.x, _o.y, _o.z, _d.x, _d.y, _d.z, f.portee || 100, this._res);
      partie.resoudreTir(a, f, _o.x, _o.y, _o.z, _d.x, _d.y, _d.z, r, p);
    }
    partie.evt('tir', { a: a.id, arme: f.id, ox: _o.x, oy: _o.y, oz: _o.z, dx: _d.x, dy: _d.y, dz: _d.z, n: f.plombs || 1, seq: this.seq });
  }

  // le recul de VISÉE accumulé depuis le dernier appel, remis à zéro (rad) — le squelette n'en a pas
  prendreRecul(out) { out.v = 0; out.h = 0; return out; }
  // UN CHARGEUR rendu à l'élimination (§ 3.5) : à la réserve de l'arme PRINCIPALE, plafonné à la réserve de départ
  ajouterChargeur() {
    const j = this.armes.findIndex((f) => f.emplacement === 'principale');
    if (j < 0) return false;
    const f = this.armes[j], avant = this.res[j];
    this.res[j] = Math.min(f.reserve, this.res[j] + f.chargeur);
    return this.res[j] > avant;
  }
  // tout plein (une réapparition)
  remplir() {
    this.ch = this.armes.map((f) => f.chargeur); this.res = this.armes.map((f) => f.reserve);
    this.i = 0; this.et = 'pret'; this.t0 = this.acteur.partie ? this.acteur.partie.t : 0; this.fin = this.t0; this.vers = -1; this.entre = false;
    this.vk = 0; this.chaleur = 0; this.reculI = 0; this.tampon = -INF; this._vide = false;
    this.let = this.dotation.letale ? this.dotation.letale[1] : 0; this.tac = this.dotation.tactique ? this.dotation.tactique[1] : 0;
  }
  ramasser(idArme) { return false; }             // (vague 3 : les armes au sol, L-P)

  etat() {
    return { i: this.i, ch: this.ch.slice(), res: this.res.slice(), et: this.et, t: this.t0, vk: this.vk, seq: this.seq, chaleur: this.chaleur,
      reculI: this.reculI, let: this.let, tac: this.tac, fin: this.fin, ent: this.entre, tE: this.tEntrees ?? 0, vers: this.vers,
      tact: this.tact, pr: this.prochain, ta: this.tirAvant, tp: Number.isFinite(this.tampon) ? this.tampon : null, vide: this._vide };
  }
  appliquer(e) {
    this.i = e.i; this.ch = e.ch.slice(); this.res = e.res.slice(); this.et = e.et; this.t0 = e.t; this.vk = e.vk; this.seq = e.seq;
    this.chaleur = e.chaleur; this.reculI = e.reculI; this.let = e.let; this.tac = e.tac; this.fin = e.fin; this.entre = e.ent;
    this.tEntrees = e.tE; this.vers = e.vers; this.tact = e.tact; this.prochain = e.pr; this.tirAvant = e.ta;
    this.tampon = e.tp === null ? -INF : e.tp; this._vide = e.vide;
  }
}
