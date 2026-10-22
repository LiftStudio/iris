// =====================================================================
//  LES EFFETS — squelette du socle S0 (22/10), rempli par le lot L-H (vague 3 : L-Q)
// =====================================================================
// Impacts, traceurs, douilles, éclairs, étincelles, anneaux de domination, cibles du stand, explosions (spec § 4.5.17) :
// des pools en InstancedMesh, créés et COMPILÉS à la 1re préparation (programmes constants ensuite), racines de scène,
// `dynamique`, abonnés aux ÉVÉNEMENTS de la partie (tir, impact, touche, elim, explosion, flash, faux) et lecteurs de
// `hud.points` / `hud.cibles`. Aucune lumière dans la scène de jeu : les éclairs sont des quads additifs que le bloom fait
// briller. Le squelette : abonnés vides.

export class Effets {
  constructor(game) { this.game = game; this.partie = null; this._des = []; }
  brancher(partie) { this.debrancher(); this.partie = partie; }
  debrancher() { for (const d of this._des) d(); this._des = []; this.partie = null; }
  maj(dt) { }
}
