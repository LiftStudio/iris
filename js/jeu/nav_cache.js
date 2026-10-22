// =====================================================================
//  LE CACHE DE LA NAVIGATION — squelette du socle S0 (22/10), rempli par le lot L-D
// =====================================================================
// Le graphe gardé dans IndexedDB ('iris.nav') sous l'empreinte du monde : relu en ≈ 30 ms au lieu de 0,7 s de génération
// (spec § 4.9). Toujours sous try/catch : navigation privée, quota — le jeu tourne sans. Le squelette : sans effet.

export function lireNav(cle) { return Promise.resolve(null); }
export function ecrireNav(cle, donnees) { return Promise.resolve(); }
