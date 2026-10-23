// =====================================================================
//  LE CERVEAU DES BOTS — le MINIMAL du socle S0 (22/10) ; le vrai : lot L-J (vague 3)
// =====================================================================
// Un bot remplit SA commande à chaque pas (spec §§ 3.7, 4.5.11), comme le clavier celle de Haythem : il ne lit jamais un
// état que le joueur ne « montre » pas. Cadences décalées par id : perception à 10 Hz ((tick + 7·id) % 12), décision à
// 20 Hz ((tick + 3·id) % 6), pilotage et visée à chaque pas. Le MINIMAL n'est pas un mannequin (spec § 3.7, arbitrage 43) :
//   - tant qu'il ne perçoit rien, il ERRE (js/jeu/pilotage.js Errant) vers le POINT CHAUD le plus récent — le dernier tir
//     ou la dernière mort entendus —, à défaut vers le départ adverse ;
//   - il VOIT par `balistique.vue` (cône de 60° de demi-angle, 50 m, ou à 2,5 m) : la jauge de repérage se remplit à
//     1 / tRepérage × f(d) (f = 1 à ≤ 10 m, 0,5 à 30 m, 0,3 à 50 m), PUIS la réaction de sa difficulté passe : deux délais ;
//   - il VISE le buste avec l'erreur σ∞ de sa difficulté (un écart tiré à chaque balle, de loi de Rayleigh dont la
//     MÉDIANE vaut σ∞) et une rotation bornée (°/s de sa difficulté) ; il tire par rafales de 3 à 5 avec 0,6 s de pause,
//     compense le recul (`prendreRecul`) selon sa difficulté, recharge à vide (l'arsenal le fait d'office).
import { Errant, Pilote } from './pilotage.js';
import { Rng, melanger } from './rng.js';
import { ZONES_JEU } from './constantes.js';
import { viderFronts } from './commande.js';

const DEG = Math.PI / 180;
// § 3.7 : tRepérage ET réaction (deux délais qui s'ajoutent), erreur σ0 → σ∞ (°) et son resserrage τ, part des visées à
// la tête, rotation max (°/s), compensation du recul, rafales (balles) et pause (s), repli sous 35 % de vie, cône (°)
export const DIFFICULTES = {
  recrue: { id: 'recrue', tReperage: 0.65, reaction: 0.65, sigma0: 9, sigmaInf: 2.8, tau: 0.9, tete: 0.10, rotation: 220, compensation: 0.40, rafale: [3, 5], pause: 0.6, repli: 0.30, cone: 50, grenades: false },
  regulier: { id: 'regulier', tReperage: 0.45, reaction: 0.45, sigma0: 7, sigmaInf: 1.9, tau: 0.7, tete: 0.20, rotation: 300, compensation: 0.65, rafale: [4, 7], pause: 0.45, repli: 0.50, cone: 55, grenades: true },
  aguerri: { id: 'aguerri', tReperage: 0.30, reaction: 0.30, sigma0: 5, sigmaInf: 1.2, tau: 0.5, tete: 0.35, rotation: 380, compensation: 0.85, rafale: [5, 9], pause: 0.30, repli: 0.70, cone: 60, grenades: true },
  veteran: { id: 'veteran', tReperage: 0.20, reaction: 0.20, sigma0: 3.5, sigmaInf: 0.7, tau: 0.35, tete: 0.50, rotation: 450, compensation: 0.95, rafale: [6, 12], pause: 0.22, repli: 0.85, cone: 65, grenades: true },
};
const RAYLEIGH_MED = Math.sqrt(2 * Math.log(2));   // (médiane d'une loi de Rayleigh de paramètre 1)
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class CerveauBase {
  constructor(acteur, partie, diff) {
    this.acteur = acteur; this.partie = partie;
    this.diff = typeof diff === 'string' ? DIFFICULTES[diff] || DIFFICULTES.regulier : diff || DIFFICULTES.regulier;
    this.rng = new Rng(melanger(partie.graine || 1, acteur.id, 0xc3e5));
    this.vus = new Map();            // id → { jauge, vu, repereT }
    this.indices = [];               // [{ x, y, z, t }] : ce qu'il a entendu
    this.cible = null; this._etat = 'patrouille';
    this.errant = new Errant(acteur, partie, { vers: () => this.pointChaud() });
    this.pilote = this.errant.pilote;
    this.err = { h: 0, v: 0 }; this.seqVu = -1; this.rafale = 0; this.pauseT = 0; this._r = { v: 0, h: 0 };
    this.aim = { l: acteur.cmd.lacet, t: 0 };
    this._des = partie.sur('*', (e) => this.entendre(e));
  }
  get etat() { return this._etat; }
  liberer() { if (this._des) this._des(); this._des = null; }

  // le point chaud : le dernier tir ou la dernière mort entendus, sinon le départ adverse
  pointChaud() {
    const I = this.indices[this.indices.length - 1];
    if (I && this.partie.t - I.t < 30) return I;
    const Z = ZONES_JEU[this.partie.zone] || ZONES_JEU.ecole, eq = this.acteur.equipe;
    const L = Z.departs && (eq === 'A' ? Z.departs.B : eq === 'B' ? Z.departs.A : null);
    return L && L[0] ? { x: L[0][0], y: L[0][1], z: L[0][2] } : null;
  }
  // l'ouïe (les événements de la partie) : tirs au rayon du bruit de l'arme (× 0,55 d'un niveau à l'autre), morts
  entendre(e) {
    const a = this.acteur;
    if (!a.vivant || !a.corps) return;
    if (e.type === 'tir' && e.a !== a.id) {
      const f = this.partie.ficheArme(e.arme), r = (f && f.bruit) || 40;
      const d = Math.hypot(e.ox - a.pos.x, e.oy - a.pos.y, e.oz - a.pos.z), k = Math.abs(e.oy - a.pos.y) > 2 ? 0.55 : 1;
      if (d <= r * k) this._indice(e.ox, e.oy - 1.6, e.oz);
    } else if (e.type === 'elim') this._indice(e.x, e.y, e.z);
    else if (e.type === 'touche' && e.cible === a.id) {
      const t = this.partie.acteurParId(e.par);
      if (t && t.corps) this._indice(t.pos.x, t.pos.y, t.pos.z);
    }
  }
  _indice(x, y, z) { this.indices.push({ x, y, z, t: this.partie.t }); if (this.indices.length > 8) this.indices.shift(); }

  // LA PERCEPTION (10 Hz) : la jauge de repérage de chaque ennemi vu
  percevoir() {
    const a = this.acteur, P = this.partie, B = P.balistique, D = this.diff, dtP = 0.1;
    const eo = a.oeil(this._eo || (this._eo = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } }));
    const l = a.cmd.lacet, fx = -Math.sin(l), fz = -Math.cos(l), cosCone = Math.cos(60 * DEG);
    for (const b of P.acteurs) {
      // (un corps qui n'est pas humain — un meuble — n'est pas une cible qu'on « voit » : un cerveau ne lit jamais `prop`)
      if (b === a || !b.vivant || !b.corps || !P.ennemis(a, b) || b.corps !== b.joueur) continue;
      let V = this.vus.get(b.id);
      if (!V) { V = { jauge: 0, vu: false, repereT: -1 }; this.vus.set(b.id, V); }
      const bx = b.pos.x, by = b.pos.y + 1.27 * b.h / 1.73, bz = b.pos.z;
      const dx = bx - eo.x, dy = by - eo.y, dz = bz - eo.z, d = Math.hypot(dx, dy, dz);
      let vu = false;
      if (d <= 50) {
        const dh = Math.hypot(dx, dz), cosA = dh > 1e-6 ? (dx * fx + dz * fz) / dh : 1;
        if ((cosA >= cosCone || d <= 2.5) && B.vue(eo.x, eo.y, eo.z, bx, by, bz)) vu = true;
      }
      V.vu = vu;
      if (vu) {
        const f = d <= 10 ? 1 : d <= 30 ? 1 - 0.5 * (d - 10) / 20 : Math.max(0.3, 0.5 - 0.2 * (d - 30) / 20);
        const kTir = b.cmd && b.cmd.tir ? 2 : 1;
        const avant = V.jauge;
        V.jauge = Math.min(1, V.jauge + dtP / D.tReperage * f * kTir);
        if (avant < 1 && V.jauge >= 1) V.repereT = P.t;
      } else {
        V.jauge = Math.max(0, V.jauge - dtP / 2);
        if (V.jauge < 1) V.repereT = -1;
      }
    }
  }
  // LA DÉCISION (20 Hz) : la cible (repérée et vue, la plus proche), sinon patrouiller
  penser() {
    const a = this.acteur, P = this.partie;
    let best = null, bd = Infinity;
    for (const [id, V] of this.vus) {
      if (!V.vu || V.jauge < 1) continue;
      const b = P.acteurParId(id);
      if (!b || !b.vivant) continue;
      const d = Math.hypot(b.pos.x - a.pos.x, b.pos.y - a.pos.y, b.pos.z - a.pos.z);
      if (d < bd) { bd = d; best = b; }
    }
    if (best !== this.cible) { this.cible = best; this.rafale = 0; if (best) this._tirerErreur(); }
    this._etat = best ? 'combat' : 'patrouille';
  }
  // LA VISÉE vers (x, y, z) : l'erreur de la difficulté, une rotation bornée → cmd.lacet / tangage
  viserVers(x, y, z, dt) {
    const a = this.acteur, eo = a.oeil(this._eo2 || (this._eo2 = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } }));
    const dx = x - eo.x, dy = y - eo.y, dz = z - eo.z, dh = Math.hypot(dx, dz);
    const lv = Math.atan2(-dx, -dz) + this.err.h, tv = Math.atan2(-dy, dh) + this.err.v;
    const pasMax = this.diff.rotation * DEG * dt;
    const dl = angle(lv - this.aim.l), dtg = tv - this.aim.t;
    this.aim.l = angle(this.aim.l + Math.max(-pasMax, Math.min(pasMax, dl)));
    this.aim.t += Math.max(-pasMax, Math.min(pasMax, dtg));
    a.cmd.lacet = this.aim.l; a.cmd.tangage = Math.max(-1.48, Math.min(1.48, this.aim.t));
    return Math.abs(dl) < pasMax + 1e-6 && Math.abs(dtg) < pasMax + 1e-6;
  }
  // un nouvel écart de visée : loi de Rayleigh de médiane σ∞ (degrés), direction au hasard
  _tirerErreur() {
    const s = this.diff.sigmaInf * DEG / RAYLEIGH_MED, u = Math.max(1e-12, this.rng.next()), th = 2 * Math.PI * this.rng.next();
    const r = s * Math.sqrt(-2 * Math.log(u));
    this.err.h = r * Math.cos(th); this.err.v = r * Math.sin(th);
  }
  allerA(x, y, z, opts) { this.pilote.allerA(x, y, z, opts); }

  // LA COMMANDE, à chaque pas : TOUS les champs
  commande(dt, cmd) {
    const a = this.acteur, P = this.partie, id = a.id;
    viderFronts(cmd);                              // (les fronts ne vivent qu'un pas, comme ceux du clavier)
    if (!a.vivant) { cmd.ax = 0; cmd.ay = 0; cmd.tir = false; cmd.visee = false; return; }
    if ((P.tick + 7 * id) % (P.degrade ? 24 : 12) === 0) this.percevoir();
    if ((P.tick + 3 * id) % (P.degrade ? 12 : 6) === 0) this.penser();
    // le recul accumulé : compensé selon la difficulté, le reste dérange la visée
    if (a.arsenal) { a.arsenal.prendreRecul(this._r); this.aim.t -= this._r.v * (1 - this.diff.compensation); this.aim.l -= this._r.h * (1 - this.diff.compensation); }
    cmd.letale = false; cmd.marche = false; cmd.accroupi = false; cmd.interagir = false;
    const c = this.cible;
    if (!c || !c.vivant) {
      // PATROUILLE : l'errant tient le lacet (le regard dans la marche)
      this.cible = null; this._etat = 'patrouille';
      this.errant.commande(dt, cmd);
      this.aim.l = cmd.lacet; this.aim.t = cmd.tangage;
      cmd.tir = false;
      return;
    }
    // COMBAT : arrêté, il vise le buste ; la réaction passée, il tire par rafales
    cmd.ax = 0; cmd.ay = 0; cmd.amp = 0; cmd.sprint = false; cmd.visee = false;
    const A = a.arsenal, V = this.vus.get(c.id);
    if (A && A.tirSeq !== this.seqVu) { this.seqVu = A.tirSeq; this._tirerErreur(); this.rafale++; }
    const pret = this.viserVers(c.pos.x, c.pos.y + 1.27 * c.h / 1.73, c.pos.z, dt);
    const reagi = V && V.repereT >= 0 && P.t - V.repereT >= this.diff.reaction;
    if (this.pauseT > 0) { this.pauseT -= dt; cmd.tir = false; return; }
    const rMin = 3, rMax = 5;                     // (le minimal : 3 à 5 balles, 0,6 s de pause ; la table de la difficulté : L-J)
    if (!this._nRafale) this._nRafale = rMin + this.rng.int(rMax - rMin + 1);
    if (this.rafale >= this._nRafale) { this.rafale = 0; this._nRafale = 0; this.pauseT = 0.6; cmd.tir = false; return; }
    cmd.tir = !!(reagi && pret && A && A.arme);
    if (A && A.arme && !A.arme.auto) cmd.tir = cmd.tir && !a._tirAvant;      // (semi : un front par balle)
    a._tirAvant = cmd.tir;
  }
}
// le cerveau du combat (vague 3 : L-J)
export class Cerveau extends CerveauBase { }
