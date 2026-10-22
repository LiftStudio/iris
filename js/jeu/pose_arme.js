// =====================================================================
//  L'ARME DANS LES MAINS D'UN BOT — squelette du socle S0 (22/10), rempli par le lot L-C
// =====================================================================
// Une fois par image, après la pose du corps (Player.apresPose) : les deux bras par cinématique inverse sur l'arme à la
// 3e personne (js/jeu/modeles_armes.js, banc/armer.js recopié), le canon dans la direction de la commande ; la bouche
// écrite dans `acteur.aff.bouche` (les éclairs, L-H). Affichage seulement. Le squelette : rien.

export function poserArme(acteur, dt) { }
// l'arme à la 3e personne de l'acteur : une racine de scène, `dynamique` (L-C) — le squelette n'en a pas
export function armeTroisieme(acteur) { return null; }
