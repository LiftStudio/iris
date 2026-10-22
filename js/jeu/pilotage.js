// =====================================================================
//  LE PILOTAGE — squelette du socle S0 (22/10), rempli par le lot L-D (vague 3 : L-J)
// =====================================================================
// Le PILOTE mène un acteur vers un point (spec § 4.5.11 ; LA CAGE js/ai.js l. 88-107) : il ne vise pas — c'est le cerveau
// qui tient le lacet — il donne l'AXE relatif au lacet (un bot qui vise court en pas chassés), s'arrête avec hystérésis,
// et se dit COINCÉ quand il a fait moins de 0,6 m en 3 s. L'ERRANT est un cerveau d'essai qui va de lieu en lieu (les
// points d'apparition de la zone) ou vers une destination préférée `vers(acteur)` (le cerveau minimal y met le point
// chaud). Le squelette : la ligne droite (le monde solide fait glisser le long des murs) ; coincé, l'errant change de
// destination. L-D : le graphe, la ficelle tirée par balayage, l'évitement, les face-à-face, les franchissements.
import { pointsDe, POINTS_APPARITION } from './apparitions.js';
import { Rng, melanger } from './rng.js';

// LES 46 PASSAGES d'une pièce à l'autre (carte_monde § 7, tirés du graphe : centre en PLAN x, y et hauteur) — le
// squelette en fait un graphe de RÉGIONS : l'errant va de passage en passage jusqu'à la pièce de sa destination, en ligne
// droite dans chaque pièce (L-D le remplace par le vrai graphe)
const P_PLAN = [['attente|bureauB', 12.88, 2.5, 0], ['attente|c01', 12.47, 7.78, 0], ['attente|hall', 13.25, 3.63, 0], ['attente|hallO', 5.75, 6.62, 0],
  ['attente|si01', 10, 3.52, 0], ['c01|local', 11.5, 9, 0], ['c01|pmr', 11.49, 11.21, 0], ['c05|dc', 5.14, 12.74, 0], ['c05|hallO', 5.25, 9, 0], ['c05|wcH', 6, 11, 0],
  ['couloirEst|descenteEst', 17, 9.88, -0.12], ['couloirEst|hall', 15.22, 7.49, 0], ['couloirEst|vestEst', 15.19, 10.75, 0], ['couloirSS|hallSS', 2, 10, -3.06],
  ['descenteEst|escEstSS', 18.75, 9.88, -1.45], ['e1couloir|e1pause', 4.75, 5.69, 3.5], ['e1couloir|palier1', 1.38, 6.75, 3.05], ['e1est|e1pause', 13.5, 8.03, 3.5],
  ['e1est|escEst2', 16.03, 10.51, 3.49], ['e1kahn|e1pause', 10.44, 13, 3.5], ['e1pause|e1salle', 10.83, 5.01, 3.5], ['e2couloir|e2s1', 12.45, 6.49, 6.6],
  ['e2couloir|e2s2', 10.54, 4.49, 6.6], ['e2couloir|e2sas', 14.62, 6.49, 6.6], ['e2palier|e2sas', 14.75, 8, 6.6], ['e2palier|escEst3', 16, 9.88, 6.6],
  ['escEst|escEst2', 17.5, 9.88, 2.46], ['escEst|vestEst', 16, 11.63, 0], ['escEst2|escEst3', 17, 9.88, 6.02], ['escEstSS|palierSSE', 17, 11.63, -2.93],
  ['escalier|hallO', 2.96, 9.01, 0], ['escalier|palier1', 1.36, 9, 1.98], ['escalierSS|hallSS', 0.81, 10, -2.91], ['escalierSS|palierSS', 0.83, 5.98, -0.09],
  ['hall|porche', 15.13, 0.75, 0], ['hallO|palierSS', 1.5, 5.49, 0], ['hallO|passage', 3.55, 4, 0], ['hallO|wcF', 6, 8.5, 0], ['hallSS|pauseSS', 2.51, 10.79, -3.06],
  ['palierSSE|sasSS', 15.38, 10.75, -3.06], ['passage|rue', 3.26, -0.5, 0], ['passage|service', 1.5, 1.3, 0], ['passageSS|pauseSS', 13.01, 8.74, -3.06],
  ['passageSS|sasSS', 13.99, 9.74, -3.06], ['pauseSS|salleSS', 9.76, 14.5, -3.06], ['porche|rue', 14.83, -0.5, 0]];
export const PASSAGES = P_PLAN.map(([k, x, y, h]) => { const [a, b] = k.split('|'); return { a, b, x, y: h, z: -y }; });
const VOISINS = new Map();
for (const P of PASSAGES) for (const [u, v] of [[P.a, P.b], [P.b, P.a]]) { if (!VOISINS.has(u)) VOISINS.set(u, []); VOISINS.get(u).push({ z: v, p: P }); }
// le chemin de pièces de `de` à `a` (largeur d'abord) : la liste des passages à franchir, ou null
export function routePieces(de, a) {
  if (!de || !a || de === a) return [];
  const prec = new Map([[de, null]]), file = [de];
  for (let i = 0; i < file.length; i++) {
    const u = file[i];
    for (const { z, p } of VOISINS.get(u) || []) {
      if (prec.has(z)) continue;
      prec.set(z, { u, p }); file.push(z);
      if (z === a) {
        const L = []; let w = a;
        while (prec.get(w)) { const e = prec.get(w); L.unshift(e.p); w = e.u; }
        return L;
      }
    }
  }
  return null;
}

export class Pilote {
  constructor(acteur, nav, balistique) {
    this.acteur = acteur; this.nav = nav; this.balistique = balistique;
    this.cible = null; this.sprint = false; this.arret = 0.3; this.marge = 0.3;
    this._arrive = false; this._coince = false; this._ref = null; this._t = 0;
  }
  // `o` = { sprint, arret = 0,3, marge = 0,3 }
  allerA(x, y, z, o) {
    const { sprint = false, arret = 0.3, marge = 0.3 } = o || {};
    const nouveau = !this.cible || Math.hypot(this.cible.x - x, this.cible.z - z) > 0.5;
    this.cible = { x, y, z }; this.sprint = !!sprint; this.arret = arret; this.marge = marge;
    if (nouveau) { this._arrive = false; this._coince = false; this._ref = null; this._t = 0; }
  }
  stop() { this.cible = null; this._arrive = false; this._coince = false; }
  get arrive() { return this._arrive; }
  get coince() { return this._coince; }
  // l'axe vers la cible, relatif au lacet de la commande (x à droite, y en avant)
  pas(dt, cmd) {
    const a = this.acteur, c = this.cible;
    cmd.ax = 0; cmd.ay = 0; cmd.amp = 0; cmd.sprint = false;
    if (!c || !a.corps) return;
    const p = a.corps.pos, dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
    this._arrive = this._arrive ? d < this.arret + this.marge : d < this.arret;
    if (this._arrive) { this._ref = null; this._t = 0; return; }
    const l = cmd.lacet, fx = -Math.sin(l), fz = -Math.cos(l), rx = Math.cos(l), rz = -Math.sin(l);
    const ux = dx / d, uz = dz / d;
    cmd.ay = ux * fx + uz * fz; cmd.ax = ux * rx + uz * rz; cmd.amp = 1;
    cmd.sprint = this.sprint && cmd.ay > 0.7;
    // coincé : moins de 0,6 m en 3 s
    if (!this._ref) { this._ref = { x: p.x, z: p.z }; this._t = 0; }
    this._t += dt;
    if (this._t >= 3) {
      this._coince = Math.hypot(p.x - this._ref.x, p.z - this._ref.z) < 0.6;
      this._ref = { x: p.x, z: p.z }; this._t = 0;
    }
  }
}

// L'ERRANT : de lieu en lieu dans la zone de la partie (ou vers `vers(acteur)`), le regard dans sa marche
export class Errant {
  constructor(acteur, partie, { vers } = {}) {
    this.acteur = acteur; this.partie = partie; this.vers = vers || null;
    this.pilote = new Pilote(acteur, partie.nav, partie.balistique);
    this.rng = new Rng(melanger(partie.graine || 1, acteur.id, 0x4572));
    this.dest = null; this._detour = 0; this.route = []; this._cleRoute = null;
  }
  _zone(x, y, z) { const Lu = this.partie.game.carte && this.partie.game.carte.lumieres; const Z = Lu && Lu.zoneEn ? Lu.zoneEn(x, z, y + 0.1) : null; return Z ? Z.id : null; }
  _choisir() {
    const L0 = pointsDe(this.partie.zone || 'ecole'), L = L0.length ? L0 : POINTS_APPARITION, p = this.acteur.pos;
    const pool = L.filter((q) => Math.hypot(q.x - p.x, q.z - p.z) > 2 || Math.abs(q.y - p.y) > 1.5);
    const q = (pool.length ? pool : L)[this.rng.int((pool.length ? pool : L).length)];
    this.dest = { x: q.x, y: q.y, z: q.z };
  }
  // la route de pièces vers la destination (refaite quand la destination ou la pièce de départ changent)
  _router() {
    const a = this.acteur.pos, d = this.dest;
    const za = this._zone(a.x, a.y, a.z), zd = this._zone(d.x, d.y, d.z);
    const cle = za + '>' + zd + '>' + Math.round(d.x) + ',' + Math.round(d.z);
    if (cle === this._cleRoute) return;
    this._cleRoute = cle;
    this.route = (za && zd && routePieces(za, zd)) || [];
  }
  commande(dt, cmd) {
    const a = this.acteur, P = this.pilote;
    let cible = null;
    if (this._detour > 0) this._detour -= dt;
    else if (this.vers) cible = this.vers(a);
    if (cible) this.dest = { x: cible.x, y: cible.y, z: cible.z };
    if (!this.dest || (P.arrive && !this.route.length)) { if (!cible) this._choisir(); }
    if (P.coince) { this._choisir(); this._detour = 6; P.stop(); this._cleRoute = null; }
    this._router();
    // le prochain passage de la route, sinon la destination
    while (this.route.length && Math.hypot(this.route[0].x - a.pos.x, this.route[0].z - a.pos.z) < 0.6) this.route.shift();
    const v = this.route.length ? this.route[0] : this.dest;
    P.allerA(v.x, v.y, v.z, { sprint: false, arret: this.route.length ? 0.3 : 0.6 });
    // le regard dans la marche
    const p = a.pos, dx = v.x - p.x, dz = v.z - p.z;
    if (Math.hypot(dx, dz) > 0.2) cmd.lacet = Math.atan2(-dx, -dz);
    cmd.tangage = 0;
    P.pas(dt, cmd);
    cmd.marche = false; cmd.tir = false; cmd.visee = false; cmd.accroupi = false;
  }
}
