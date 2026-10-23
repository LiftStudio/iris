// =====================================================================
//  LA NAVIGATION — squelette du socle S0 (22/10), rempli par le lot L-D (vague 3 : L-J)
// =====================================================================
// Le graphe des déplacements des bots, généré au lancement de la 1re partie (0,7 s sur PC) et gardé dans IndexedDB sous
// une empreinte du monde (spec §§ 4.5.11, 4.9 ; carte_monde § 7, méthode B : un nœud par case de 0,25 m ET par sol,
// représentants poussés par `C.resoudre`, liens par `C.deplacer` à 3 cm près). DEUX graphes : celui des humains (rayon
// 0,3, liens « franchir » tirés de `franchissable`) et celui des props (rayon 0,2, sans franchissement). Tableaux typés,
// liens en CSR. Le SQUELETTE est une navigation « à vol d'oiseau » : aucun nœud (`nb = 0`, `noeudPres` → −1), `demander`
// rend la cible tout de suite, `restreindre` sans effet, `distancePied` = la distance droite — le pilote va en ligne
// droite (js/jeu/pilotage.js) en glissant le long des murs.

export const BORNES_NAV = { xMin: -3, xMax: 23, zMin: -24.5, zMax: 6 };
export const VERSION_NAV = 1;

const pt = (p) => (p && typeof p === 'object' ? p : null);

export class Nav {
  // la navigation (cache sinon génération) ; `o` = { pas = 0,25, rayon = 0,3, franchir = vrai, bornes = BORNES_NAV, progres }
  static async obtenir(game, o) {
    const { pas = 0.25, rayon = 0.3, franchir = true, bornes = BORNES_NAV, progres = null } = o || {};
    if (progres) progres('Plan de l’école', 1);
    const n = new Nav();
    n.pas = pas; n.rayon = rayon; n.franchir = franchir; n.bornes = bornes;
    n.empreinte = 'vol-d-oiseau:' + rayon + ':' + (franchir ? 1 : 0) + ':v' + VERSION_NAV;
    return n;
  }
  // (`pas`, `rayon`, `franchir`, `bornes` : les options du graphe ; `depuisCache` : relu d'IndexedDB plutôt que généré — lus
  // par js/jeu/harnais.js verifierNav)
  constructor() {
    this.pas = 0.25; this.rayon = 0.3; this.franchir = true; this.bornes = BORNES_NAV; this.depuisCache = false;
    this.nb = 0;
    this.px = new Float32Array(0); this.pz = new Float32Array(0); this.ph = new Float32Array(0);
    this.zone = new Uint8Array(0); this.niveau = new Int8Array(0); this.degage = new Float32Array(0);
    this.debut = new Int32Array(1); this.liens = new Int32Array(0); this.cout = new Float32Array(0); this.typeLien = new Uint8Array(0);
    this.empreinte = 'vol-d-oiseau'; this.masque = null;
  }
  restreindre(masque) { this.masque = masque || null; }
  noeudPres(x, y, z, rayonMax = 1.5) { return -1; }
  // A* d'un bloc : `out` reçoit la liste des nœuds ; au vol d'oiseau, pas de nœud
  chemin(de, a, out) { if (out) out.length = 0; return false; }
  // A* fractionnable en file : au vol d'oiseau, la cible tout de suite
  demander(cle, de, a, rappel) { if (rappel) rappel([a], cle); }
  pasFile() { }
  champDepuis(id) { return new Float64Array(0); }
  aleatoireDans(zoneId, rng) { return -1; }
  couverts(x, y, z, menaces, rng, n) { return []; }
  // la distance à pied : au vol d'oiseau, la distance droite (entre deux points { x, y, z } ; −1 entre deux nœuds)
  distancePied(a, b) {
    const A = pt(a), B = pt(b);
    if (!A || !B) return -1;
    return Math.hypot(A.x - B.x, (A.y || 0) - (B.y || 0), A.z - B.z);
  }
}
