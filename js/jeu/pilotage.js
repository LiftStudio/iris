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
    this.dest = null; this._detour = 0;
  }
  _choisir() {
    const L0 = pointsDe(this.partie.zone || 'ecole'), L = L0.length ? L0 : POINTS_APPARITION, p = this.acteur.pos;
    // (un lieu à son niveau d'abord : en ligne droite, on ne change pas d'étage)
    const meme = L.filter((q) => Math.abs(q.y - p.y) < 1.5 && Math.hypot(q.x - p.x, q.z - p.z) > 2);
    const pool = meme.length ? meme : L;
    const q = pool[this.rng.int(pool.length)];
    this.dest = { x: q.x, y: q.y, z: q.z };
  }
  commande(dt, cmd) {
    const a = this.acteur, P = this.pilote;
    let cible = null;
    if (this._detour > 0) this._detour -= dt;
    else if (this.vers) cible = this.vers(a);
    if (cible) this.dest = { x: cible.x, y: cible.y, z: cible.z };
    if (!this.dest || P.arrive) { if (!cible) this._choisir(); }
    if (P.coince) { this._choisir(); this._detour = 6; P.stop(); }
    P.allerA(this.dest.x, this.dest.y, this.dest.z, { sprint: false, arret: 0.6 });
    // le regard dans la marche
    const p = a.pos, dx = this.dest.x - p.x, dz = this.dest.z - p.z;
    if (Math.hypot(dx, dz) > 0.2) cmd.lacet = Math.atan2(-dx, -dz);
    cmd.tangage = 0;
    P.pas(dt, cmd);
    cmd.marche = false; cmd.tir = false; cmd.visee = false; cmd.accroupi = false;
  }
}
