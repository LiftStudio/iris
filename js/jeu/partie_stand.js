// =====================================================================
//  LE STAND DE TIR — lot L-E (23/10 ; spec §§ 2.6, 3.8, 4.5.12)
// =====================================================================
// Haythem seul, dans la rue devant la façade (spec § 2.6) : une LIGNE DE TIR, trois COULOIRS où des silhouettes en carton se
// lèvent à 8, 15 et 25 m (en 0,15 s ; touchée, elle tombe — « tic », la tête « ding » et les points × 2), un MANNEQUIN fixe
// à 10 m qui dit la zone et les dégâts de chaque balle (le banc de réglage du ressenti), et quatre DÉFIS chronométrés :
//   « 20 CIBLES EN 30 S » (deux cibles levées à la fois, n'importe quelle touche compte) ;
//   « 10 TÊTES » (seules les têtes comptent ; une balle au corps fait tomber la cible : ratée ; 60 s au plus) ;
//   « 30 BALLES À 15 M » (une seule cible qui ne tombe pas : le motif de recul à apprendre — touches, groupement, dérive) ;
//   « RÉFLEXES » (20 cibles, une à la fois, debout 0,8 s : touches et temps de réaction).
// Sans défi (`opts.defi` absent) : l'ENTRAÎNEMENT LIBRE — chaque couloir lève sa cible, la suivante du couloir se lève
// une seconde après la touche, sans fin. Chaque défi : « 3, 2, 1 » (le calque « CLIQUE POUR JOUER » l'attend au
// clavier-souris), le défi, le verdict 2,5 s, puis l'événement `fin` (l'écran de fin de L-U : REJOUER relance le même).
// LA PASSE DE MESURE (23/10, monde solide de `socle`) : la rue n'a que 1,5 m libre entre les vélos garés (x 15,95-19,4,
// z 4,08-5,93) et la façade, et une voiture garée occupe x ≥ 22,69 pour z 3,28-4,96 ; la ligne de tir est donc à x = −2,7
// (et non ≈ −1 : à −1, les cibles à 25 m tomberaient DANS la voiture), le 3e couloir file en biais entre les vélos et les
// voitures d'en face. Chaque segment œil (debout, 1,62 m) → centre, tête, bords, bas et haut de chaque cible est LIBRE de
// TOUTES les formes — jardinières, vélos, bancs et voitures compris (`camera: false` : ce que le DDA de L-A arrête et que
// `rayonLibre` laisse passer) — ; le test 14 le rejoue (`balle()` et ce contrôle strict).
// Les cibles sont des acteurs `role: 'cible'` au corps CorpsFixe (panneaux de touche : js/jeu/touches.js), de vie
// « infinie » (Partie.infliger émet la touche ; la chute, c'est ici : jamais d'élimination, ni « +100 », ni poupée) ; L-H
// les DESSINE d'après `hud.cibles` (les règles ne créent aucun maillage). Le mannequin est un vrai corps (js/jeu/avatars.js),
// figé, que rien ne pousse. Les RECORDS (`iris.stand.v1`, localStorage dans un try/catch) sont lus et écrits par
// l'AFFICHAGE (`image`), jamais par la simulation : deux parties de même graine restent identiques, record ou pas.
//   opts : { defi: 'vingt'|'tetes'|'recul'|'reflexes' (absent : libre), classe, arme, graine }
import { Partie } from './partie.js';
import { TABLE_PORTES_FPS } from './monde_partie.js';
import { CLASSES, ARMES } from './armes.js';

// LA TABLE DU STAND — coordonnées EXACTES (repère MONDE), mesurées le 23/10 (voir l'en-tête) ; `cap` = atan2(fx, fz) du
// regard de la cible (vers son couloir), `couloir` = l'indice de son couloir, `distance` = depuis sa place sur la ligne
const LX = -2.7, PI = Math.PI;
const capVers = (x, z, c) => Math.atan2(c.x - x, c.z - z);
const COULOIRS = [{ x: LX, z: 2.85 }, { x: LX, z: 3.75 }, { x: LX, z: 5.8 }];
// (six silhouettes, deux par distance, deux par couloir : 8 et 15 m sur le trottoir, 15 et 25 m au milieu, 8 et 25 m dans le
// couloir en biais — depuis la ligne, aucune ne cache celle d'un autre couloir ; les neuf places mesurées restent valables)
const POSES = [[0, 8, 5.3, 0, 2.85], [0, 15, 12.3, 0, 2.85],
  [1, 15, 12.3, -0.12, 3.75], [1, 25, 22.3, -0.12, 3.75],
  [2, 8, 5.3, -0.12, 6.056], [2, 25, 22.3, -0.12, 6.6]];
export const STAND = {
  ligne: { x: LX, y: -0.12, z: 3.75, lacet: -PI / 2 },
  couloirs: COULOIRS,
  cibles: POSES.map(([k, d, x, y, z]) => ({ x, y, z, cap: capVers(x, z, COULOIRS[k]), distance: d, couloir: k })),
  // (le mannequin à 10 m, À CÔTÉ des couloirs — au milieu, il cachait la cible à 25 m du 3e couloir depuis la ligne —,
  // tourné vers le couloir du milieu ; vu de chaque place de la ligne, tête, buste et jambes)
  mannequin: { x: 7.3, y: -0.12, z: 7.2, cap: capVers(7.3, 7.2, COULOIRS[1]), distance: 10 },
  // (Haythem reste dans la rue, côté chaussée : la façade, ses jardinières et ses portes hors de portée)
  bornes: { xMin: -3, xMax: 23, zMin: 2.35, zMax: 6 },
};
// LES DÉFIS (§ 2.6) et les règles du stand
export const DEFIS = {
  libre: { id: 'libre', nom: 'ENTRAÎNEMENT LIBRE', relever: 1.0 },
  vingt: { id: 'vingt', nom: '20 CIBLES EN 30 S', objectif: 20, duree: 30, simultanees: 2, delai: 0.25 },
  tetes: { id: 'tetes', nom: '10 TÊTES', objectif: 10, duree: 60, simultanees: 2, delai: 0.4 },
  recul: { id: 'recul', nom: '30 BALLES À 15 M', objectif: 30, duree: 20, distance: 15, couloir: 1 },
  reflexes: { id: 'reflexes', nom: 'RÉFLEXES', objectif: 20, haut: 0.8, delai: [0.5, 1.2], duree: 60 },
};
export const REGLES_STAND = { decompte: 3, lever: 0.15, tomber: 0.2, annonceFin: 2.5, points: { 8: 50, 15: 75, 25: 100 }, tete: 2, coups: 12,
  vieCible: 1e9, cle: 'iris.stand.v1' };

// ---------------------------------------------------------------- LES RECORDS (affichage seulement ; jamais une erreur)
// { v: 1, records: { '<défi>:<arme>': { meilleur: résultat, essais } } }
function stockage() { try { return window.localStorage || null; } catch (e) { return null; } }
export function lireRecords() {
  try { const s = stockage(), t = s && s.getItem(REGLES_STAND.cle), o = t ? JSON.parse(t) : null; return o && o.v === 1 && o.records ? o : { v: 1, records: {} }; }
  catch (e) { return { v: 1, records: {} }; }
}
// a est-il MEILLEUR que b ? (vingt, têtes : réussi, puis le temps, puis le compte ; recul : touches puis groupement ;
// réflexes : touches puis réaction ; à égalité, les points)
export function meilleur(a, b) {
  if (!b) return true;
  if (a.defi === 'vingt' || a.defi === 'tetes') {
    if (a.reussi !== b.reussi) return a.reussi;
    if (a.reussi && a.temps !== b.temps) return a.temps < b.temps;
    if (a.compte !== b.compte) return a.compte > b.compte;
  } else if (a.defi === 'recul') {
    if (a.touches !== b.touches) return a.touches > b.touches;
    if (a.groupement !== b.groupement) return a.groupement < b.groupement;
  } else if (a.defi === 'reflexes') {
    if (a.compte !== b.compte) return a.compte > b.compte;
    if (a.reaction !== b.reaction) return a.reaction < b.reaction;
  }
  return a.points > b.points;
}
export function enregistrerRecord(res) {
  const R = lireRecords(), cle = res.defi + ':' + (res.arme || '?'), ancien = R.records[cle] || null;
  const nouveau = meilleur(res, ancien && ancien.meilleur);
  R.records[cle] = { meilleur: nouveau ? res : ancien.meilleur, essais: (ancien ? ancien.essais : 0) + 1 };
  try { const s = stockage(); if (s) s.setItem(REGLES_STAND.cle, JSON.stringify(R)); } catch (e) { /* stockage plein, refusé, privé : le record vaut pour la session */ }
  return { nouveau, meilleur: R.records[cle].meilleur, ancien: ancien ? ancien.meilleur : null, essais: R.records[cle].essais };
}

const arrondi = (v, n = 1) => Math.round(v * Math.pow(10, n)) / Math.pow(10, n);
const fmtS = (s) => arrondi(s, 1).toFixed(1).replace('.', ',');
const milliers = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');   // (sans toLocaleString : le même texte partout)

export class PartieStand extends Partie {
  constructor(game, opts, deps) {
    super(game, opts, deps);
    this.id = 'stand'; this.zone = 'ecole';
    this.defi = DEFIS[this.opts.defi] ? this.opts.defi : 'libre';
    this.D = DEFIS[this.defi];
    this.mannequin = null; this.cibles = [];
    // le défi en cours (tout entre dans l'état : bloc `stand`)
    this.S = { tDefi: 0, compte: 0, tetes: 0, rates: 0, presentees: 0, tirs: 0, touches: 0, tirsTouchants: 0, points: 0, reactions: [], impacts: [],
      file: [], derniere: -1 };
    this.coups = []; this.nCoups = 0; this.resultat = null; this.record = null; this._ecrit = false;
    this._tirPas = false; this._touchePas = false;
  }
  tablePortes() { return TABLE_PORTES_FPS; }
  _dotation() {
    const o = this.opts, base = CLASSES[o.classe] || CLASSES.assaut;
    if (!o.arme || !ARMES[o.arme] || !ARMES[o.arme].rpm) return base;
    return ARMES[o.arme].emplacement === 'secondaire' ? { ...base, principale: o.arme, secondaire: null } : { ...base, principale: o.arme };
  }
  peupler() {
    const S = STAND, L = S.ligne, C = this.game.collisions, R = REGLES_STAND;
    const sol = (x, y, z) => (C ? C.solEn(x, z, y + 0.3) : y);
    const h = this.ajouterActeur({ id: 0, nom: 'Haythem', equipe: 'A', local: true, humain: true, x: L.x, y: sol(L.x, L.y, L.z), z: L.z, lacet: L.lacet,
      dotation: this._dotation() });
    if (h.joueur) h.joueur.bounds = S.bornes;
    let id = 1;
    S.cibles.forEach((c, i) => {
      // (le lacet d'un acteur regarde vers (−sin l, −cos l) : celui du cap c est c + π)
      const a = this.ajouterActeur({ id: id++, nom: `Cible ${c.distance} m`, equipe: 'cibles', role: 'cible', corps: 'fixe', x: c.x, y: sol(c.x, c.y, c.z), z: c.z,
        lacet: c.cap + PI, vie: R.vieCible });
      a.distance = c.distance; a.couloir = c.couloir; a.pose = i;
      a.vivant = false;
      a.st = { k: 0, sens: 0, leveeT: -1, finHaut: Infinity, touchee: false, tete: false };
      this.cibles.push(a);
    });
    // LE MANNEQUIN : un vrai corps, figé (gele : ni commande ni déplacement), que les contacts ne poussent pas (fixe)
    const M = S.mannequin;
    const m = this.ajouterActeur({ id: id++, nom: 'Mannequin', equipe: 'B', x: M.x, y: sol(M.x, M.y, M.z), z: M.z, lacet: M.cap + PI, cerveau: null, vie: R.vieCible });
    m.gele = true; m.distance = M.distance;
    if (m.corps) m.corps.fixe = true;
    this.mannequin = m;
    // les règles écoutent la simulation : les tirs de Haythem (le compte du défi, la précision)
    this.sur('tir', (e) => {
      if (!this.local || e.a !== this.local.id) return;
      this._tirPas = true;
      if (this.phase === 'manche') this.S.tirs++;
    });
    if (this.defi === 'libre') {
      this.phaseVers('manche', 0);
      this.annonce(this.D.nom, 'presentation');
      for (const k of [0, 1, 2]) this._lever(this.cibles.find((c) => c.couloir === k));
    } else {
      h.gele = true; if (h.arsenal) h.arsenal.bloque = true;
      this.phaseVers('decompte', R.decompte);
      this.annonce(this.D.nom, 'presentation');
    }
    this._majCibles();
  }
  _pose(couloir, distance) { return this.cibles.find((c) => c.couloir === couloir && c.distance === distance) || null; }

  // ---------------------------------------------------------------- les cibles : levée en 0,15 s, chute en 0,2 s
  _lever(c) {
    if (!c || c.st.sens === 1 || c.vivant) return;
    c.st.sens = 1; c.st.touchee = false; c.st.tete = false; c.vivant = false;
    this.S.presentees += this.defi === 'reflexes' ? 1 : 0;
  }
  _abattre(c, touchee, tete = false) {
    c.vivant = false; c.st.sens = -1; c.st.touchee = touchee; c.st.tete = tete; c.st.finHaut = Infinity;
  }
  _animer(dt) {
    const R = REGLES_STAND, D = this.D;
    for (const c of this.cibles) {
      const s = c.st;
      if (s.sens === 1) {
        s.k = Math.min(1, s.k + dt / R.lever);
        if (s.k >= 1 - 1e-9) { s.k = 1; s.sens = 0; c.vivant = true; s.leveeT = this.t; s.finHaut = D.haut ? this.t + D.haut : Infinity; }
      } else if (s.sens === -1) {
        s.k = Math.max(0, s.k - dt / R.tomber);
        if (s.k <= 1e-9) { s.k = 0; s.sens = 0; }
      }
      // (réflexes : debout 0,8 s, puis elle tombe — ratée)
      if (c.vivant && this.t >= s.finHaut - 1e-9) { this._abattre(c, false); this.S.rates++; this._apres(c); }
    }
  }
  // une cible occupe son couloir tant qu'elle est debout, se lève, ou y est attendue
  _couloirLibre(k) {
    return !this.cibles.some((c) => c.couloir === k && (c.vivant || c.st.sens === 1)) && !this.S.file.some((f) => this.cibles[f.i].couloir === k);
  }
  // la prochaine cible, tirée par la graine : un couloir libre, pas la place de la dernière touchée
  _planifier(delai) {
    const libres = this.cibles.filter((c) => this._couloirLibre(c.couloir) && c.pose !== this.S.derniere && c.st.sens !== -1);
    const L = libres.length ? libres : this.cibles.filter((c) => !c.vivant && c.st.sens !== 1);
    if (!L.length) return;
    const c = L[this.rng.int(L.length)];
    this.S.file.push({ t: this.t + delai, i: c.pose });
  }
  _servir() {
    const F = this.S.file;
    for (let j = F.length - 1; j >= 0; j--) if (this.t >= F[j].t - 1e-9) { const c = this.cibles[F[j].i]; F.splice(j, 1); this._lever(c); }
  }
  // après la chute d'une cible (touchée ou ratée) : la suivante, selon le défi
  _apres(c) {
    const D = this.D;
    this.S.derniere = c.pose;
    if (this.defi === 'libre') {
      // (la suivante du même couloir, de la plus proche à la plus lointaine, puis on recommence)
      const L = this.cibles.filter((q) => q.couloir === c.couloir), n = L[(L.indexOf(c) + 1) % L.length];
      this.S.file.push({ t: this.t + D.relever, i: n.pose });
    } else if (this.defi === 'vingt' || this.defi === 'tetes') this._planifier(D.delai);
    else if (this.defi === 'reflexes' && this.S.presentees < D.objectif) this._planifier(D.delai[0] + this.rng.next() * (D.delai[1] - D.delai[0]));
  }

  // ---------------------------------------------------------------- les touches : la cible tombe, le mannequin note
  appliquerEffet(e) {
    if (e.genre !== 'degats') return super.appliquerEffet(e);
    const c = this.acteurParId(e.cible);
    if (!c) return;
    if (c.role === 'cible') return this._toucherCible(c, e);
    if (c === this.mannequin) return this._toucherMannequin(c, e);
    return super.appliquerEffet(e);
  }
  // AU STAND, HAYTHEM NE PREND AUCUN DÉGÂT : il y est seul, sans réapparition — sa propre frag (Grenades.pas l'inflige tout
  // de suite, sans passer par appliquerEffet) le laissait mort pour de bon, la caméra sur le mannequin
  infliger(cible, degats, o) { return cible === this.local ? 0 : super.infliger(cible, degats, o); }
  // (Partie.infliger émet la touche — « tic », « ding » — ; la vie reste pleine : jamais d'élimination)
  _infliger(c, e) {
    const d = this.infliger(c, e.degats, e);
    c.vie = c.vieMax; c._aides = []; c.derniereTouche = null;
    if (d > 0 && e.par === (this.local && this.local.id)) this._touchePas = true;
    return d;
  }
  _toucherCible(c, e) {
    if (!c.vivant) return;
    const d = this._infliger(c, e); if (d <= 0) return;
    const S = this.S, R = REGLES_STAND, tete = e.zone === 'tete', jeu = this.phase === 'manche';
    if (jeu) S.touches++;
    if (this.defi === 'recul') {
      // (la cible du recul ne tombe pas : chaque impact est noté sur le panneau, en cm — gauche/droite, haut/bas)
      if (jeu) {
        const k = Math.cos(c.corps.ang), s = Math.sin(c.corps.ang), px = e.x - c.pos.x, pz = e.z - c.pos.z;
        S.impacts.push([arrondi((px * k - pz * s) * 100, 1), arrondi((e.y - (c.pos.y + 0.75)) * 100, 1)]);
        if (tete) S.tetes++;
        S.points += R.points[c.distance] * (tete ? R.tete : 1);
      }
      return;
    }
    this._abattre(c, true, tete);
    if (!jeu) return;
    if (this.defi === 'tetes' && !tete) { S.rates++; this._apres(c); return; }
    S.compte++; if (tete) S.tetes++;
    let pts = R.points[c.distance] * (tete ? R.tete : 1);
    if (this.defi === 'reflexes') { const r = this.t - c.st.leveeT; S.reactions.push(arrondi(r, 4)); pts += Math.round(100 * Math.max(0, (this.D.haut - r) / this.D.haut)); }
    S.points += pts;
    this._apres(c);
  }
  _toucherMannequin(c, e) {
    const tireur = this.acteurParId(e.par);
    const d = this._infliger(c, e); if (d <= 0) return;
    let dist = 0;
    if (tireur) { const o = tireur.oeil({ x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } }); dist = Math.hypot(e.x - o.x, e.y - o.y, e.z - o.z); }
    this.nCoups++;
    this.coups.push({ n: this.nCoups, zone: e.zone, degats: arrondi(d, 2), distance: arrondi(dist, 2), arme: e.arme, t: this.t, x: arrondi(e.x, 3), y: arrondi(e.y, 3), z: arrondi(e.z, 3) });
    if (this.coups.length > REGLES_STAND.coups) this.coups.shift();
    if (this.phase === 'manche') this.S.touches++;
  }

  // ---------------------------------------------------------------- LES RÈGLES, à chaque pas (étape 8)
  regles(dt) {
    const S = this.S, D = this.D, R = REGLES_STAND, a = this.local;
    // (le stand ne manque jamais de balles : la réserve de l'arme principale tenue pleine — recharger reste à faire)
    if (a && a.arsenal) a.arsenal.ajouterChargeur();
    if (this._tirPas && this._touchePas && this.phase === 'manche') S.tirsTouchants++;
    this._tirPas = false; this._touchePas = false;
    if (this.phase === 'decompte') {
      if (this.phaseT >= this.phaseDuree - 1e-9) this._go();
    } else if (this.phase === 'manche') {
      S.tDefi += dt;
      this._animer(dt);
      this._servir();
      if (this.defi !== 'libre') this._suivre();
    } else if (this.phase === 'fin_manche') {
      this._animer(dt);
      if (this.phaseT >= this.phaseDuree - 1e-9) {
        this.phaseVers('fin', 0);
        this.evt('fin', { gagnant: a ? a.id : 0, scores: null, defi: this.defi, resultat: { ...this.resultat } });
      }
    }
    this._majCibles();
  }
  _go() {
    const a = this.local, D = this.D, S = this.S;
    if (a) { a.gele = false; if (a.arsenal) { a.arsenal.remplir(); a.arsenal.bloque = false; } }
    this.phaseVers('manche', D.duree || 0);
    this.annonce('GO !', 'go');
    if (this.defi === 'recul') this._lever(this._pose(D.couloir, D.distance));
    else if (this.defi === 'reflexes') this._planifier(0.3);
    else for (let k = 0; k < D.simultanees; k++) this._planifier(k * 0.15);
    S.tDefi = 0;
  }
  // la fin d'un défi : l'objectif atteint, le temps écoulé, les balles tirées
  _suivre() {
    const S = this.S, D = this.D;
    let fin = false, reussi = false;
    if (this.defi === 'vingt') { reussi = S.compte >= D.objectif; fin = reussi || S.tDefi >= D.duree - 1e-9; }
    else if (this.defi === 'tetes') { reussi = S.tetes >= D.objectif; fin = reussi || S.tDefi >= D.duree - 1e-9; }
    else if (this.defi === 'recul') { reussi = S.tirs >= D.objectif; fin = reussi || S.tDefi >= D.duree - 1e-9; }
    else if (this.defi === 'reflexes') {
      reussi = S.presentees >= D.objectif && !this.cibles.some((c) => c.vivant || c.st.sens === 1) && !S.file.length;
      fin = reussi || S.tDefi >= D.duree - 1e-9;
      reussi = reussi && S.compte >= D.objectif / 2;
    }
    if (fin) this._terminer(reussi);
  }
  _terminer(reussi) {
    const S = this.S, D = this.D, a = this.local;
    const precision = S.tirs ? arrondi(S.tirsTouchants / S.tirs, 3) : 0;
    const res = { defi: this.defi, nom: D.nom, reussi, objectif: D.objectif, compte: this.defi === 'tetes' ? S.tetes : this.defi === 'recul' ? S.touches : S.compte,
      tetes: S.tetes, rates: S.rates, tirs: S.tirs, touches: S.touches, precision, temps: arrondi(S.tDefi, 3), points: S.points,
      arme: this._dotation().principale, reaction: null, groupement: null, derive: null };
    if (this.defi === 'vingt' && reussi) res.points += Math.round(Math.max(0, D.duree - S.tDefi) * 20);
    if (this.defi === 'tetes' && reussi) res.points += Math.round(Math.max(0, D.duree - S.tDefi) * 10);
    if (S.reactions.length) res.reaction = arrondi(S.reactions.reduce((s, r) => s + r, 0) / S.reactions.length, 4);
    if (S.impacts.length) {
      const n = S.impacts.length, mx = S.impacts.reduce((s, p) => s + p[0], 0) / n, my = S.impacts.reduce((s, p) => s + p[1], 0) / n;
      res.groupement = arrondi(Math.sqrt(S.impacts.reduce((s, p) => s + (p[0] - mx) ** 2 + (p[1] - my) ** 2, 0) / n), 1);
      res.derive = { x: arrondi(mx, 1), y: arrondi(my, 1) };
    }
    this.resultat = res;
    if (a) { a.gele = true; if (a.arsenal) a.arsenal.bloque = true; }
    for (const c of this.cibles) if (c.vivant || c.st.sens === 1) this._abattre(c, false);
    S.file.length = 0;
    this.phaseVers('fin_manche', REGLES_STAND.annonceFin);
    this.annonce(this._verdict(res), 'fin');
  }
  _verdict(r) {
    const pts = `${milliers(r.points)} PTS`;
    if (r.defi === 'vingt') return r.reussi ? `RÉUSSI · 20 CIBLES EN ${fmtS(r.temps)} S · ${pts}` : `TEMPS ÉCOULÉ · ${r.compte} / 20 · ${pts}`;
    if (r.defi === 'tetes') return r.reussi ? `RÉUSSI · 10 TÊTES EN ${fmtS(r.temps)} S · ${pts}` : `TEMPS ÉCOULÉ · ${r.compte} / 10 TÊTES · ${pts}`;
    if (r.defi === 'recul') return `${r.touches} / ${r.tirs} TOUCHES` + (r.groupement !== null ? ` · GROUPEMENT ${String(r.groupement).replace('.', ',')} CM` : '') + ` · ${pts}`;
    return `RÉFLEXES · ${r.compte} / 20` + (r.reaction !== null ? ` · ${Math.round(r.reaction * 1000)} MS` : '') + ` · ${pts}`;
  }
  peutTirer(a) { return (this.phase === 'manche') && super.peutTirer(a); }

  // ---------------------------------------------------------------- le HUD : les cibles (L-H les dessine), le défi
  _majCibles() {
    const L = this.cibles.map((c) => ({ id: c.id, x: c.pos.x, y: c.pos.y, z: c.pos.z, cap: c.corps.ang, k: c.st.k, touchee: c.st.touchee,
      levee: c.vivant, tete: c.st.tete, distance: c.distance, couloir: c.couloir }));
    const m = this.mannequin;
    if (m) L.push({ id: m.id, x: m.pos.x, y: m.pos.y, z: m.pos.z, cap: STAND.mannequin.cap, k: 1, touchee: false, levee: true, mannequin: true, distance: m.distance,
      n: this.nCoups, dernier: this.coups.length ? this.coups[this.coups.length - 1] : null, coups: this.coups.slice() });
    this.hud.cibles = L;
  }
  majHud() {
    super.majHud();
    const S = this.S, D = this.D, a = this.local, H = this.hud;
    this._majCibles();
    H.classement = H.classement.filter((c) => a && c.id === a.id);
    H.chrono = D.duree ? (this.phase === 'decompte' ? D.duree : Math.max(0, D.duree - S.tDefi)) : S.tDefi;
    // (en plus du § 4.5.15 : le défi en cours, son verdict et le record — lu par l'affichage)
    H.stand = { defi: this.defi, nom: D.nom, objectif: D.objectif || null, compte: this.defi === 'tetes' ? S.tetes : this.defi === 'recul' ? S.tirs : S.compte,
      tetes: S.tetes, rates: S.rates, tirs: S.tirs, touches: S.touches, precision: S.tirs ? S.tirsTouchants / S.tirs : 0, temps: S.tDefi,
      restant: D.duree ? Math.max(0, D.duree - S.tDefi) : null, points: S.points,
      reaction: S.reactions.length ? S.reactions.reduce((s, r) => s + r, 0) / S.reactions.length : null, resultat: this.resultat, record: this.record };
  }
  // L'AFFICHAGE (une fois par image) : le record lu et écrit à la fin d'un défi — hors de la simulation ; à l'entraînement
  // libre (sans décompte, donc sans le calque du passage au décompte, Partie.image), le calque « CLIQUE POUR JOUER » à la
  // 1re image au clavier-souris (le clic du menu a expiré : sans capture, la souris ne vise pas, et rien ne le disait)
  image(dt) {
    if (!this._clicVu) { this._clicVu = true; if (this.defi === 'libre' && this.besoinCapture() && !this.capte()) this.attendreClic(); }
    super.image(dt);
    if (this.resultat && !this._ecrit) {
      this._ecrit = true;
      this.record = enregistrerRecord(this.resultat);
      if (this.record.nouveau && this.hud.annonce) this.hud.annonce = { ...this.hud.annonce, texte: this.hud.annonce.texte + ' · NOUVEAU RECORD !', record: true };
    }
  }

  // ---------------------------------------------------------------- L'ÉTAT (§ 4.7) : la base, plus le bloc du stand
  etat() {
    const e = super.etat(), S = this.S;
    e.stand = { defi: this.defi, S: { ...S, reactions: S.reactions.slice(), impacts: S.impacts.map((p) => p.slice()), file: S.file.map((f) => ({ ...f })) },
      cibles: this.cibles.map((c) => [c.id, c.st.k, c.st.sens, c.st.leveeT, Number.isFinite(c.st.finHaut) ? c.st.finHaut : null, c.st.touchee, c.st.tete]),
      coups: this.coups.map((c) => ({ ...c })), n: this.nCoups, resultat: this.resultat ? { ...this.resultat } : null };
    return e;
  }
  appliquer(e) {
    super.appliquer(e);
    const T = e.stand; if (!T) return;
    const S = T.S;
    this.S = { ...S, reactions: S.reactions.slice(), impacts: S.impacts.map((p) => p.slice()), file: S.file.map((f) => ({ ...f })) };
    for (const [id, k, sens, leveeT, finHaut, touchee, tete] of T.cibles) {
      const c = this.acteurParId(id); if (!c || !c.st) continue;
      Object.assign(c.st, { k, sens, leveeT, finHaut: finHaut === null ? Infinity : finHaut, touchee, tete });
    }
    this.coups = T.coups.map((c) => ({ ...c })); this.nCoups = T.n; this.resultat = T.resultat ? { ...T.resultat } : null;
    if (this.local && this.local.arsenal) this.local.arsenal.bloque = !!this.local.gele;
    this._majCibles();
  }
}
