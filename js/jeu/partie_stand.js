// =====================================================================
//  LE STAND DE TIR — squelette du socle S0 (22/10), rempli par le lot L-E
// =====================================================================
// Haythem seul, la rue bornée devant la façade (spec § 2.6) : une ligne de tir, des silhouettes à 8, 15 et 25 m sur trois
// couloirs (des acteurs `role: 'cible'` au corps CorpsFixe, panneaux de touche : js/jeu/touches.js), les défis, le
// mannequin qui dit zone et dégâts, les records. Le squelette : six cibles fixes, sans défi ; une cible touchée « tombe »
// (elle ne compte plus) et se relève au bout de 2 s. L-E fixe les coordonnées EXACTES (table STAND) après une passe de
// mesure (la ligne de tir voit chaque cible sans un vélo, une jardinière ni une voiture entre les deux).
//   opts : { defi: 'vingt'|'tetes'|'recul'|'reflexes' }
import { Partie } from './partie.js';

// (squelette : la ligne à x ≈ −1 face à l'est, les couloirs à z 2,6 et 4,4 ; L-E mesure)
export const STAND = {
  ligne: { x: -1, y: 0, z: 3.5, lacet: -Math.PI / 2 },
  couloirs: [{ x: -1, z: 2.6 }, { x: -1, z: 3.5 }, { x: -1, z: 4.4 }],
  cibles: [
    { x: 7, y: 0, z: 2.6, cap: -Math.PI / 2, distance: 8 }, { x: 7, y: 0, z: 4.4, cap: -Math.PI / 2, distance: 8 },
    { x: 14, y: 0, z: 2.6, cap: -Math.PI / 2, distance: 15 }, { x: 14, y: 0, z: 4.4, cap: -Math.PI / 2, distance: 15 },
    { x: 24, y: 0, z: 2.6, cap: -Math.PI / 2, distance: 25 }, { x: 24, y: 0, z: 4.4, cap: -Math.PI / 2, distance: 25 },
  ],
};

export class PartieStand extends Partie {
  constructor(game, opts, deps) { super(game, opts, deps); this.id = 'stand'; this.zone = 'ecole'; }
  peupler() {
    const L = STAND.ligne, C = this.game.collisions;
    this.ajouterActeur({ id: 0, nom: 'Haythem', equipe: 'A', local: true, humain: true, x: L.x, y: C ? C.solEn(L.x, L.z, 0) : L.y, z: L.z, lacet: L.lacet,
      classe: this.opts.classe || 'assaut' });
    let id = 1;
    for (const c of STAND.cibles) {
      // (le cap d'une cible : elle regarde la ligne de tir, vers l'ouest — lacet + π de la ligne)
      const a = this.ajouterActeur({ id: id++, nom: 'Cible ' + c.distance + ' m', equipe: 'cibles', role: 'cible', corps: 'fixe',
        x: c.x, y: C ? C.solEn(c.x, c.z, 0) : c.y, z: c.z, lacet: L.lacet + Math.PI, vie: 1 });
      a.distance = c.distance;
    }
    this.phaseVers('manche', 0);
    this.sur('elim', (e) => { const c = this.acteurParId(e.cible); if (c && c.role === 'cible') c.reapparitionT = this.t + 2; });
  }
  regles(dt) {
    for (const a of this.acteurs) {
      if (a.role !== 'cible' || a.vivant || this.t < a.reapparitionT) continue;
      a.vivant = true; a.vie = a.vieMax; a.reapparitionT = 0;
    }
  }
  majHud() {
    super.majHud();
    this.hud.cibles = this.acteurs.filter((a) => a.role === 'cible').map((a) => ({ id: a.id, x: a.pos.x, y: a.pos.y, z: a.pos.z, cap: a.corps.ang, k: a.vivant ? 1 : 0, touchee: !a.vivant }));
  }
}
