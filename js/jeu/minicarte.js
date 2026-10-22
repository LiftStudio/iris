// =====================================================================
//  LA MINI-CARTE — squelette du socle S0 (22/10), rempli par le lot L-G
// =====================================================================
// En bas à gauche : la silhouette du niveau rastérisée depuis les nœuds du graphe (0,25 m = 2 px), qui tourne avec
// Haythem ; les ennemis 2 s après un tir non silencieux ; des chevrons pour un autre niveau ; et une variante « zone
// entière, sans acteurs » pour le panneau de cachette du prop hunt (spec § 4.5.15). Un canevas 2D. Le squelette : rien.

export class MiniCarte {
  constructor(game) { this.game = game; this.nav = null; }
  preparer(nav) { this.nav = nav || null; }
  maj(dt, partie) { }
}
