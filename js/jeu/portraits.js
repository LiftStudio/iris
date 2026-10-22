// =====================================================================
//  LES PORTRAITS — squelette du socle S0 (22/10), rempli par le lot L-U
// =====================================================================
// Les portraits des amis sont des images PRÉCALCULÉES une fois par un outil (tools/portraits/, L-U) :
// `assets/portraits/<id>.webp`, 192 × 192 (spec § 4.5.16, arbitrage 40) — jamais un 2e contexte WebGL, jamais un avatar
// chargé au menu. `portrait(fiche)` rend leur URL si l'image existe (la liste PORTRAITS, figée dans le module), sinon null
// (le DOM montre alors l'initiale sur un dégradé). Le squelette : aucune image encore.

export const PORTRAITS = [];
export function portrait(fiche) { return fiche && PORTRAITS.includes(fiche.id) ? `assets/portraits/${fiche.id}.webp` : null; }
