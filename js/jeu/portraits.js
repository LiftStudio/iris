// =====================================================================
//  LES PORTRAITS (lot L-U, 23/10 ; spec § 4.5.16, arbitrage 40)
// =====================================================================
// Les portraits des amis (et de Haythem) sont des images PRÉCALCULÉES une fois par l'outil tools/portraits/ (le moteur de
// portraits de LA CAGE : buste sur l'os de la tête, lumière de studio, fond transparent) : `assets/portraits/<id>.webp`,
// 192 × 192, 3 à 6 Ko chacun (23/10). Jamais un 2e contexte WebGL, jamais un avatar chargé au menu : ce module ne fait que
// rendre une URL, et le DOM (balise <img>) charge l'image quand un écran la montre — les réglages de partie, le podium de
// la fin, le tableau des scores. `portrait(fiche)` rend cette URL si l'image existe (la liste PORTRAITS, figée ici :
// aucun aller-retour réseau pour le savoir), sinon null — le DOM montre alors l'initiale sur un dégradé aux couleurs de la
// fiche (js/jeu/menus_jeu.js vignette). À refaire seulement si un avatar change : servir l'arbre, ouvrir
// /tools/portraits/?envoyer=<port> avec `python -I tools/portraits/ecrire.py --ecouter <port> assets/portraits/` lancé.

export const PORTRAITS = ['haythem', 'gabriel', 'imad', 'marcantoine', 'koji', 'djafar', 'ethan'];
const _connus = new Set(PORTRAITS);
export function portrait(fiche) { return fiche && _connus.has(fiche.id) ? `assets/portraits/${fiche.id}.webp` : null; }
