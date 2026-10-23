// =====================================================================
//  LES CERVEAUX DU PROP HUNT — le MINIMAL du socle S0 (22/10) ; le vrai : lot L-O (vague 3)
// =====================================================================
// Un chasseur ne sait JAMAIS qui est prop (spec §§ 3.9, 4.5.14) : il ne lit ni `role` ni `prop` d'un acteur ; les meubles
// lui arrivent par `candidatsMeubles` (js/jeu/deguisements.js), vraies poses et props vivants MÊLÉS, sans marque. Le
// CHASSEUR minimal erre dans la zone et, toutes les 8 s, fait UN tir de test sur un candidat à moins de 10 m qu'il voit,
// tiré au hasard semé (il ne les distingue pas) ; il tire comme au combat sur un corps HUMAIN qu'il voit (un prop resté
// humain). Le CACHEUR minimal se déguise en le type le plus courant de sa pièce (le carton de secours quand le registre est
// vide) et ne bouge plus. L-O : soupçon, fouille, enquête, cachettes atteignables, fuite.
import { CerveauBase, DIFFICULTES } from './cerveau.js';
import { candidatsMeubles } from './deguisements.js';
import { MEUBLES } from '../registre_meubles.js';
import { Rng, melanger } from './rng.js';
import { viderFronts } from './commande.js';

export const DIFFICULTES_PROP = {
  facile: { id: 'facile', K: 0.25, epsMax: 0.35, ballesTest: 1, erreur: 3.5, reaction: 0.6, ouie: 0.7, sigmaOuie: 0.15, memoire: 30, grenade: false, coequipier: 'facile' },
  normal: { id: 'normal', K: 0.6, epsMax: 0.25, ballesTest: 2, erreur: 1.8, reaction: 0.4, ouie: 1.0, sigmaOuie: 0.08, memoire: 60, grenade: false, coequipier: 'facile' },
  difficile: { id: 'difficile', K: 1.2, epsMax: 0.12, ballesTest: 3, erreur: 0.8, reaction: 0.25, ouie: 1.2, sigmaOuie: 0.05, memoire: 90, grenade: true, coequipier: 'normal' },
};
// (TEST_VISE : le tir part dès que la visée est faite, passé 0,4 s ; abandonné à 1,2 s — un candidat dans le dos se tourne en
// ≈ 0,6 s à la rotation du Régulier)
const TEST_PERIODE = 8, TEST_PORTEE = 10, TEST_VISE = 1.2;

export class CerveauChasseur extends CerveauBase {
  constructor(acteur, partie, diff) {
    const dp = DIFFICULTES_PROP[diff] || DIFFICULTES_PROP.facile;
    super(acteur, partie, { ...DIFFICULTES.regulier, sigmaInf: dp.erreur, reaction: dp.reaction });
    this.dp = dp;
    this.rngTest = new Rng(melanger(partie.graine || 1, acteur.id, 0x7e57));
    this.prochainTest = TEST_PERIODE + (acteur.id % 4); this.vise = null; this.viseT = 0; this.journal = [];
    this._cands = [];
  }
  commande(dt, cmd) {
    const a = this.acteur, P = this.partie;
    if (!a.vivant || a.gele) { cmd.ax = 0; cmd.ay = 0; cmd.tir = false; return; }
    // le tir de test : viser le candidat (au moins 0,4 s), puis une balle. (F2, demande de L-F, bloquante : la patrouille de
    // CerveauBase.commande — l'errant — reposait la visée sur SON lacet à chaque pas, la visée ne se faisait jamais et le tir ne
    // partait pas : pendant la visée, seule la perception tourne ; un humain vu l'emporte, comme au combat)
    if (this.vise) {
      viderFronts(cmd);
      if ((P.tick + 7 * a.id) % (P.degrade ? 24 : 12) === 0) this.percevoir();
      if (!this.cible || !this.cible.vivant) {
        cmd.ax = 0; cmd.ay = 0; cmd.amp = 0; cmd.sprint = false; cmd.visee = false;
        const pret = this.viserVers(this.vise.x, this.vise.y + 0.3, this.vise.z, dt);
        this.viseT += dt;
        cmd.tir = pret && this.viseT >= 0.4 && !this._tire;
        if (cmd.tir) { this._tire = true; this.tirsTest = (this.tirsTest || 0) + 1; }
        if ((this._tire && !cmd.tir) || this.viseT >= TEST_VISE) { this.vise = null; this._tire = false; }
        return;
      }
      this.vise = null; this._tire = false;
    }
    // un corps humain vu : comme au combat
    super.commande(dt, cmd);
    if (this.cible) { this.vise = null; return; }
    if (P.phase === 'traque' && P.t >= this.prochainTest) {
      this.prochainTest = P.t + TEST_PERIODE;
      const eo = a.oeil(this._o || (this._o = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } }));
      const L = candidatsMeubles(P, a.pos.x, a.pos.y, a.pos.z, TEST_PORTEE, this._cands)
        .filter((c) => P.balistique.vue(eo.x, eo.y, eo.z, c.x, c.y + 0.3, c.z));
      if (L.length) {
        const c = L[this.rngTest.int(L.length)];
        this.vise = { x: c.x, y: c.y, z: c.z, ref: c.ref }; this.viseT = 0; this._tire = false;
        this.journal.push({ t: P.t, ref: c.ref, refs: L.map((k) => k.ref) });
      }
    }
  }
}

export class CerveauCacheur {
  constructor(acteur, partie, diff) {
    this.acteur = acteur; this.partie = partie; this.diff = DIFFICULTES_PROP[diff] || DIFFICULTES_PROP.facile;
    this.etat = 'cachette'; this._fait = false;
  }
  // le type le plus courant de sa pièce (le carton quand le registre est vide)
  typeDeLaPiece() {
    const a = this.acteur, z = this.partie.game.carte.lumieres?.zoneEn?.(a.pos.x, a.pos.z, a.pos.y + 0.1);
    const L = (z && MEUBLES.parZone.get(z.id)) || [];
    const n = new Map(); for (const p of L) n.set(p.cle, (n.get(p.cle) || 0) + 1);
    let best = null, bn = 0; for (const [k, v] of n) if (v > bn) { bn = v; best = k; }
    return best || 'carton';
  }
  commande(dt, cmd) {
    cmd.ax = 0; cmd.ay = 0; cmd.amp = 0; cmd.sprint = false; cmd.tir = false; cmd.deguiser = false;
    const a = this.acteur;
    if (!a.vivant) return;
    if (!a.prop && !this._fait) { cmd.deguiser = true; this.cle = this.typeDeLaPiece(); this._fait = true; }
    else if (!a.prop && this._fait && this.partie.t % 1 < 1 / 120) this._fait = false;   // (refusé faute de place : on réessaie)
  }
  entendre(evt) { }
}
