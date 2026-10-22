// =====================================================================
//  LA POUPÉE DE CHIFFON — squelette du socle S0 (22/10), rempli par le lot L-C
// =====================================================================
// Un bot éliminé (spec § 3.6) : poupée de chiffon Verlet (banc/ragdoll.js + murs : resoudre sur Hips, Spine2, Head),
// impulsion 2,5 m/s, 4 s au sol, s'enfonce de 0,5 m en 0,4 s, disparaît — pas de sang, aucun corps qui reste ;
// habillage Airsoft (le défaut) : 1,5 s puis effacement en 0,6 s. Affichage seulement. Le squelette : le corps reste
// debout 4 s puis se cache.

export class Poupee {
  constructor(player, impulsion, point, collisions) { this.player = player; this.t = 0; this.duree = 4; }
  pas(dt) { this.t += dt; }
  poser() { if (this.player && this.player.mesh) this.player.mesh.visible = this.t < this.duree; }
  get calme() { return this.t >= this.duree; }
}
