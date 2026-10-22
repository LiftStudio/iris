// =====================================================================
//  LA KILLCAM — squelette du socle S0 (22/10), remplie par le lot L-Q (vague 3)
// =====================================================================
// Un anneau d'images (30 Hz sur 6 s, tous les acteurs) et le rejeu de la mort de Haythem dans l'œil de son tueur, la
// simulation GELÉE, l'état rendu au bit près après (spec § 5.7.4). Le squelette : sans effet.

export class Killcam {
  constructor(game) { this.game = game; this.partie = null; }
  brancher(partie) { this.partie = partie; }
  debrancher() { this.partie = null; }
  enregistrer(partie) { }
  get pret() { return false; }
  rejouer(victimeId) { return Promise.resolve(false); }
}
