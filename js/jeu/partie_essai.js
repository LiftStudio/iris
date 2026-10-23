// =====================================================================
//  LA PARTIE D'ESSAI (socle S0, 22/10)
// =====================================================================
// Haythem armé (ou en meuble : `prop: true`) au départ du hall, face à des MANNEQUINS (des corps immobiles, sans cerveau,
// de l'équipe d'en face) et, si on en demande, des bots au cerveau minimal — sans règles : ni phases, ni score, ni fin.
// C'est le banc des tests du socle et des lots (`?partie=essai`, `__jeu.lancer('essai', …)`).
//   opts : { graine, mannequins: [{ x, y, z }] | n, bots: n (2 au plus utiles), difficulte, classe ('assaut'), prop, humain = vrai }
import { Partie } from './partie.js';
import { TABLE_PORTES_FPS, TABLE_PORTES_PROP } from './monde_partie.js';
import { Player } from '../player.js';

// les mannequins par défaut : la salle d'attente, devant le départ (trois points libres, vérifiés au monde solide)
const MANNEQUINS = [[11.63, 0, -4.62], [10.6, 0, -5.6], [12.4, 0, -6.2]];
const BOTS = [[13.2, 0, -5.4], [9.8, 0, -4.4]];

function libre(x, y, z) {
  const C = Player.collisions; if (!C) return { x, y, z };
  const p = { x, z }; C.resoudre(p, 0.3, null, y);
  return { x: p.x, y: C.solEn(p.x, p.z, y + 0.3), z: p.z };
}

export class PartieEssai extends Partie {
  constructor(game, opts, deps) {
    super(game, opts, deps);
    this.id = 'essai';
    this.zone = this.opts.zone || 'ecole';
  }
  // (le banc du combat : les portes du combat ; Haythem en meuble, celles du prop hunt)
  tablePortes() { return this.opts.prop ? TABLE_PORTES_PROP : TABLE_PORTES_FPS; }
  peupler() {
    const g = this.game, o = this.opts, D = g.carte.depart;
    const lacet0 = Math.atan2(-D.fx, -D.fz);
    if (o.humain !== false) {
      this.ajouterActeur({ id: 0, nom: 'Haythem', equipe: 'A', local: true, humain: true, x: D.x, y: g.collisions.solEn(D.x, D.z, D.y || 0), z: D.z,
        lacet: lacet0, classe: o.prop ? null : o.classe || 'assaut', corps: o.prop ? 'prop' : 'joueur' });
    }
    let M = o.mannequins;
    if (typeof M === 'number') M = MANNEQUINS.slice(0, M).map(([x, y, z]) => ({ x, y, z }));
    if (!Array.isArray(M)) M = MANNEQUINS.map(([x, y, z]) => ({ x, y, z }));
    let id = 1;
    for (const m of M) {
      const p = libre(m.x, m.y ?? 0, m.z);
      this.ajouterActeur({ id: id++, nom: 'Mannequin ' + (id - 1), equipe: 'B', x: p.x, y: p.y, z: p.z, lacet: m.lacet ?? 0, cerveau: null, mannequin: true });
    }
    const nb = o.bots | 0;
    for (let k = 0; k < nb; k++) {
      const b = BOTS[k % BOTS.length], p = libre(b[0], b[1], b[2] + Math.floor(k / BOTS.length) * 1.5);
      this.ajouterActeur({ id: id++, nom: 'Bot ' + (k + 1), equipe: k % 2 ? 'B' : 'A', x: p.x, y: p.y, z: p.z, lacet: k % 2 ? 0 : Math.PI,
        classe: o.classeBots || 'assaut', cerveau: 'minimal', difficulte: o.difficulte || 'regulier' });
    }
    this.phaseVers('manche', 0);
  }
  regles(dt) { }
}
