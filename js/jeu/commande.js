// =====================================================================
//  LA COMMANDE (socle S0, 22/10 ; FIGÉ — spec § 4.5.2)
// =====================================================================
// UNE COMMANDE par acteur et par pas : tout ce que la simulation a le droit de lire du dehors. Des nombres et des
// booléens : elle voyagera telle quelle (invité → hôte), 20 à 30 fois par seconde. Le clavier (js/jeu/entrees_jeu.js
// lireCommande), un cerveau de bot (js/jeu/cerveau.js) ou, plus tard, un invité réseau la remplissent ; ni Player, ni les
// armes, ni les règles ne lisent Input.
//   ax, ay : l'axe RELATIF au lacet (x à droite, y en avant, comme input.axis()), amp 0..1 ;
//   lacet, tangage : la visée VOULUE (recul et aide compris ; tangage > 0 = regard vers le bas) ;
//   TENUS : sprint, marche, accroupi, tir, visee, letale (la goupille tirée : la relâcher lance), interagir ;
//   FRONTS (un pas) : saut, sprintTact, recharger, armeSuiv, armePrec, armeN (0 rien | 1 | 2), couteau, tactique,
//   serie (0 | 1-3), deguiser, verrou, figer, provoc (−1 rien | 0-7 | 8 la dernière), scanner.
export const CHAMPS_COMMANDE = [
  'seq', 'ax', 'ay', 'amp', 'lacet', 'tangage',                                         // nombres
  'sprint', 'marche', 'accroupi', 'tir', 'visee', 'letale', 'interagir',                // TENUS
  'saut', 'sprintTact', 'recharger', 'armeSuiv', 'armePrec', 'armeN', 'couteau', 'tactique', 'serie',   // FRONTS combat
  'deguiser', 'verrou', 'figer', 'provoc', 'scanner'];                                   // FRONTS prop hunt

const NOMBRES = new Set(['seq', 'ax', 'ay', 'amp', 'lacet', 'tangage', 'armeN', 'serie', 'provoc']);
const FRONTS = ['saut', 'sprintTact', 'recharger', 'armeSuiv', 'armePrec', 'armeN', 'couteau', 'tactique', 'serie',
  'deguiser', 'verrou', 'figer', 'provoc', 'scanner'];

export function creerCommande() {
  const c = {};
  for (const k of CHAMPS_COMMANDE) c[k] = NOMBRES.has(k) ? 0 : false;
  c.provoc = -1;
  return c;
}
// les FRONTS remis à faux / 0 / −1 (au début de chaque lecture : ils ne vivent qu'un pas)
export function viderFronts(c) {
  for (const k of FRONTS) c[k] = NOMBRES.has(k) ? 0 : false;
  c.provoc = -1;
  return c;
}
export function copierCommande(de, vers) { for (const k of CHAMPS_COMMANDE) vers[k] = de[k]; return vers; }
// (le paquet réseau : 27 nombres, les booléens en 0 / 1)
export function versTableau(c) { return CHAMPS_COMMANDE.map((k) => (typeof c[k] === 'boolean' ? (c[k] ? 1 : 0) : +c[k] || 0)); }
export function depuisTableau(t, c) {
  for (let i = 0; i < CHAMPS_COMMANDE.length; i++) { const k = CHAMPS_COMMANDE[i]; c[k] = NOMBRES.has(k) ? +t[i] || 0 : !!t[i]; }
  return c;
}
