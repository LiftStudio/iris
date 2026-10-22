// =====================================================================
//  LE PROFIL DU JOUEUR — squelette du socle S0 (22/10), rempli par le lot L-P (vague 3)
// =====================================================================
// L'expérience, les niveaux, les déblocages, les statistiques par arme et par mode, les défis du jour (spec § 5.7.3),
// gardés sous 'iris.profil.v1' (jamais dans iris.settings.v1 ; try/catch : le jeu tourne sans stockage). Le squelette :
// sans effet.

export const PROFIL_CLE = 'iris.profil.v1';
export class Profil {
  constructor() { this.donnees = { xp: 0, niveau: 1 }; this.partie = null; }
  charger() { return this.donnees; }
  enregistrer() { }
  brancher(partie) { this.partie = partie; }
  debrancher() { this.partie = null; }
  get niveau() { return this.donnees.niveau; }
  get xp() { return this.donnees.xp; }
  modificateurs(classe) { return null; }
}
