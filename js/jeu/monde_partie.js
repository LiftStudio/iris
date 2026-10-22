// =====================================================================
//  LE MONDE EN PARTIE — squelette du socle S0 (22/10), rempli par le lot L-M
// =====================================================================
// L'école mise en état de partie, puis rendue EXACTEMENT telle qu'en balade (spec § 4.5.19) : les portes par table (combat :
// figées, ouvertes sur les chemins avec une boîte mince SOLIDE le long du vantail ouvert ; prop hunt : « automatiques pour
// tous les acteurs », animées dans Partie.pas — déterministes, sérialisables), l'ascenseur coupé, les barrières de la zone
// de jeu (et la rubalise), les vitres dépolies marquées, la rue bornée (`joueur.bounds = BORNES_JEU`), la glace de l'accueil
// PEINTE (son rendu redessinait le décor à chaque pas de 25 cm de la caméra). Le squelette : tables vides, règle par défaut
// (ouverte au combat, auto au prop hunt), les bornes de la rue posées et rendues ; et, pour que les bots passent les portes
// automatiques (la carte vivante ne les ouvre que devant l'acteur que suit la caméra), une règle MINIMALE dans le pas : à
// l'entrée, toutes fermées (un départ canonique : deux parties de même graine partent des mêmes portes) ; une porte
// s'OUVRE quand un acteur vivant est à moins de 2,1 m de son centre, à son niveau (la règle de Portes.maj) ; la refermer
// reste à la carte vivante (une image). Le reste sans effet (L-M : tables, vantaux solides, `Portes.pilotees`).
import { BORNES_JEU, ZONES_JEU } from './constantes.js';

const RAYON_AUTO = 2.1, DUREE = 0.38, ANGLE_AUTO = 1.45;   // (js/ecole_portes.js l. 298-300)

export const TABLE_PORTES_FPS = {};      // nom → 'ouverte' | 'fermee'
export const TABLE_PORTES_PROP = {};     // nom → 'auto' | 'fermee' | 'ouverte'
export const TABLE_DEPOLIS = [];         // [{ x, y, z }] : les vitres dépolies parmi les 51 formes `vitre`
// une porte que les tables ne connaissent pas (le lot R en ajoute au −1)
export function regleParDefaut(porte, zoneJeu, mode) { return mode === 'prop' || mode === 'prophunt' ? 'auto' : 'ouverte'; }

export class MondePartie {
  constructor(game) { this.game = game; this.pret = false; this.bornes = null; this._bornesUser = null; this.inconnues = []; this.zone = null; }
  // une fois par session : barrières, rubalise, vantaux solides, dépolis (L-M)
  preparerSession() { this.pret = true; }
  get portes() { const P = this.game.carte && this.game.carte.portes; return (P && P.auto) || []; }
  _poser(P, k) {
    P.k = k;
    const e = k * k * (3 - 2 * k);
    for (const v of P.vantaux || []) v.g.rotation.y = -v.s * (P.sens || 1) * ANGLE_AUTO * e;
    if (P.forme) P.forme.off = k > 0.02;
  }
  entrer(zoneJeu, table) {
    const Z = ZONES_JEU[zoneJeu] || ZONES_JEU.ecole, u = this.game.user;
    this.zone = zoneJeu;
    this.bornes = Z.rue ? BORNES_JEU : null;
    this._bornesUser = u.bounds;
    if (this.bornes) u.bounds = this.bornes;
    for (const P of this.portes) { P.sens = 1; this._poser(P, 0); }
  }
  // l'état EXACT de la balade
  sortir() {
    const u = this.game.user;
    if (this._bornesUser) u.bounds = this._bornesUser;
    this._bornesUser = null; this.bornes = null; this.zone = null;
  }
  // (dans Partie.pas, étape 5 : déterministe)
  majPortes(dt, acteurs) {
    const L = this.portes;
    for (let i = 0; i < L.length; i++) {
      const P = L[i];
      let qui = null;
      for (const a of acteurs) {
        if (!a.vivant || !a.corps) continue;
        const p = a.corps.pos;
        if (p.y > P.base - 1.2 && p.y < P.base + 2.2 && Math.hypot(p.x - P.cx, p.z - P.cz) < RAYON_AUTO) { qui = p; break; }
      }
      if (!qui || P.k >= 1) continue;
      if (P.k <= 0.001) { const cote = (qui.x - P.cx) * P.nx + (qui.z - P.cz) * P.nz; P.sens = P.libre || (cote > 0 ? -1 : 1); }
      this._poser(P, Math.min(1, P.k + dt / DUREE));
    }
  }
  verrouiller(nom, ferme) { }
  noeudsAutorises(nav, zoneJeu, mode) { return new Uint8Array((nav && nav.nb) || 0).fill(1); }
  image(dt) { }
  etat() { return this.portes.map((P, i) => ({ i, k: P.k, sens: P.sens || 1 })); }
  appliquer(e) { const L = this.portes; for (const s of e || []) { const P = L[s.i]; if (P) { P.sens = s.sens; this._poser(P, s.k); } } }
}
