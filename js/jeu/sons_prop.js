// =====================================================================
//  LES SONS DU PROP HUNT — squelette du socle S0 (22/10), rempli par le lot L-F
// =====================================================================
// Les huit provocations, synthétisées (aucune licence), et les petits bruits des props — frottement, « pouf », aïe,
// craquement, bip du scanner, défigement —, joués par `sonsJeu.jouer3d` (js/jeu/sons_jeu.js), à travers une dalle × 0,35
// et passe-bas 900 Hz (spec § 3.9). Abonnés aux événements de la partie. Le squelette : la table, sans effet.

// { id, label, icone, duree (s), rayon (m), points }
export const PROVOCATIONS = [
  { id: 'coucou', label: '« Coucou ! » sifflé', icone: '👋', duree: 0.6, rayon: 18, points: 5 },
  { id: 'sifflet', label: 'Sifflet d’arbitre', icone: '📣', duree: 0.7, rayon: 22, points: 6 },
  { id: 'klaxon', label: 'Klaxon pouet-pouet', icone: '📯', duree: 0.8, rayon: 25, points: 7 },
  { id: 'canard', label: 'Canard', icone: '🦆', duree: 0.9, rayon: 18, points: 5 },
  { id: 'rire', label: 'Rire « hihihi »', icone: '😜', duree: 1.2, rayon: 20, points: 6 },
  { id: 'sonnerie', label: 'Sonnerie de l’école', icone: '🔔', duree: 1.6, rayon: 30, points: 10 },
  { id: 'badumtss', label: 'Ba-dum-tss', icone: '🥁', duree: 1.0, rayon: 22, points: 7 },
  { id: 'telephone', label: 'Sonnerie de téléphone', icone: '📱', duree: 1.4, rayon: 26, points: 8 },
];

export class SonsProp {
  constructor(sonsJeu) { this.sons = sonsJeu; this.partie = null; }
  brancher(partie) { this.partie = partie; }
  debrancher() { this.partie = null; }
}
