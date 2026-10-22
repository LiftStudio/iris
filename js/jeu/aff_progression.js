// =====================================================================
//  L'AFFICHAGE DE LA PROGRESSION — squelette du socle S0 (22/10), rempli par le lot L-P (vague 3)
// =====================================================================
// Les armes au sol, la sentinelle et le drone vus dans la scène : abonné aux événements, lecteur de l'état — les fichiers
// de simulation (series.js, armes_au_sol.js) n'ont pas le droit d'importer l'affichage (spec § 5.2). Le squelette : sans
// effet ; Partie.image l'appelle par `aff.progression?.maj?.(dt)`.

export class AffProgression {
  constructor(game) { this.game = game; this.partie = null; }
  brancher(partie) { this.partie = partie; }
  debrancher() { this.partie = null; }
  maj(dt) { }
}
