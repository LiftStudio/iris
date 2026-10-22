// =====================================================================
//  LE MONDE EN PARTIE — squelette du socle S0 (22/10), rempli par le lot L-M
// =====================================================================
// L'école mise en état de partie, puis rendue EXACTEMENT telle qu'en balade (spec § 4.5.19) : les portes par table (combat :
// figées, ouvertes sur les chemins avec une boîte mince SOLIDE le long du vantail ouvert ; prop hunt : « automatiques pour
// tous les acteurs », animées dans Partie.pas — déterministes, sérialisables), l'ascenseur coupé, les barrières de la zone
// de jeu (et la rubalise), les vitres dépolies marquées, la rue bornée (`joueur.bounds = BORNES_JEU`), la glace de l'accueil
// PEINTE (son rendu redessinait le décor à chaque pas de 25 cm de la caméra). Le squelette : tables vides, règle par défaut
// (ouverte au combat, auto au prop hunt), les bornes de la rue posées et rendues ; le reste sans effet.
import { BORNES_JEU, ZONES_JEU } from './constantes.js';

export const TABLE_PORTES_FPS = {};      // nom → 'ouverte' | 'fermee'
export const TABLE_PORTES_PROP = {};     // nom → 'auto' | 'fermee' | 'ouverte'
export const TABLE_DEPOLIS = [];         // [{ x, y, z }] : les vitres dépolies parmi les 51 formes `vitre`
// une porte que les tables ne connaissent pas (le lot R en ajoute au −1)
export function regleParDefaut(porte, zoneJeu, mode) { return mode === 'prop' || mode === 'prophunt' ? 'auto' : 'ouverte'; }

export class MondePartie {
  constructor(game) { this.game = game; this.pret = false; this.bornes = null; this._bornesUser = null; this.inconnues = []; this.zone = null; }
  // une fois par session : barrières, rubalise, vantaux solides, dépolis (L-M)
  preparerSession() { this.pret = true; }
  entrer(zoneJeu, table) {
    const Z = ZONES_JEU[zoneJeu] || ZONES_JEU.ecole, u = this.game.user;
    this.zone = zoneJeu;
    this.bornes = Z.rue ? BORNES_JEU : null;
    this._bornesUser = u.bounds;
    if (this.bornes) u.bounds = this.bornes;
  }
  // l'état EXACT de la balade
  sortir() {
    const u = this.game.user;
    if (this._bornesUser) u.bounds = this._bornesUser;
    this._bornesUser = null; this.bornes = null; this.zone = null;
  }
  majPortes(dt, acteurs) { }
  verrouiller(nom, ferme) { }
  noeudsAutorises(nav, zoneJeu, mode) { return new Uint8Array((nav && nav.nb) || 0).fill(1); }
  image(dt) { }
  etat() { return []; }
  appliquer(e) { }
}
