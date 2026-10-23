// =====================================================================
//  LES RÈGLES DU COMBAT — squelette du socle S0 (22/10), rempli par le lot L-E (vague 3 : L-P)
// =====================================================================
// Match à mort par équipes (SISR contre SLAM), chacun pour soi, domination (spec §§ 2.3-2.5, 3.5, 3.8). Le squelette :
// équipes et chacun pour soi — présentation 3 s, décompte 3 s (précédé du calque « CLIQUE POUR JOUER » au clavier-souris,
// vu par Partie.image), manche, fin au score ou au temps, réapparition au bout de 3,0 s (2,0 s chacun pour soi), un
// chargeur rendu à chaque élimination ; la domination retombe sur les équipes, avec une annonce.
//   opts : { mode: 'equipes'|'melee'|'domination', zone, allies, ennemis, difficulte, duree, scoreCible, classe, avatars, graine, humain = true }
import { Partie } from './partie.js';
import { departs, choisirApparition, pointsDe } from './apparitions.js';
import { EQUIPES, ZONES_JEU } from './constantes.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { TABLE_PORTES_FPS } from './monde_partie.js';
import { TELEPHONE } from '../appareil.js';

const PRESENTATION = 3, DECOMPTE = 3;
const BOTS_CLASSES = [['assaut', 0.4], ['infiltration', 0.3], ['defense', 0.2], ['tireur', 0.1]];

export class PartieFPS extends Partie {
  constructor(game, opts, deps) {
    super(game, opts, deps);
    const o = this.opts;
    this.mode = o.mode === 'melee' || o.mode === 'domination' ? o.mode : 'equipes';
    this.id = this.mode;
    if (this.mode === 'domination') { this.mode = 'equipes'; this._dominationRepli = true; }   // (L-E)
    this.zone = o.zone || 'ecole';
    if (!ZONES_JEU[this.zone] || !ZONES_JEU[this.zone].modes.includes('combat')) this.zone = 'ecole';
    this.duree = o.duree ?? 600;
    this.scoreCible = o.scoreCible ?? (this.mode === 'melee' ? 20 : TELEPHONE ? 20 : 40);
    this.reapparition = this.mode === 'melee' ? 2.0 : 3.0;
    this.scores = this.mode === 'equipes' ? { A: 0, B: 0 } : null;
    this.gagnant = null;
  }
  tablePortes() { return TABLE_PORTES_FPS; }
  _classeBot() { let u = this.rng.next(); for (const [c, p] of BOTS_CLASSES) { if (u < p) return c; u -= p; } return 'assaut'; }
  _fiche(k) {
    const ids = this.opts.avatars || [];
    const F = ids.length ? FICHES_BOTS.filter((f) => ids.includes(f.id)) : [];
    return F.length ? F[k % F.length] : FICHE_HAYTHEM;
  }
  peupler() {
    const o = this.opts, humain = o.humain !== false;
    const nA = this.mode === 'melee' ? 0 : (o.allies ?? (TELEPHONE ? 1 : 3)) + (humain ? 1 : 0);
    const nB = this.mode === 'melee' ? 0 : (o.ennemis ?? (TELEPHONE ? 2 : 4));
    let id = 0;
    const diff = o.difficulte || 'regulier';
    if (this.mode === 'equipes') {
      const dA = departs(this.zone, 'A', nA, this.rng), dB = departs(this.zone, 'B', nB, this.rng);
      for (let k = 0; k < nA; k++) {
        const p = dA[k], loc = humain && k === 0;
        this.ajouterActeur({ id: id++, nom: loc ? 'Haythem' : this._fiche(k).nom, fiche: loc ? FICHE_HAYTHEM : this._fiche(k), equipe: 'A', local: loc, humain: loc,
          x: p.x, y: p.y, z: p.z, lacet: p.lacet, classe: loc ? o.classe || 'assaut' : this._classeBot(), cerveau: loc ? null : 'minimal', difficulte: diff });
      }
      for (let k = 0; k < nB; k++) {
        const p = dB[k];
        this.ajouterActeur({ id: id++, nom: this._fiche(k + nA).nom, fiche: this._fiche(k + nA), equipe: 'B', x: p.x, y: p.y, z: p.z, lacet: p.lacet,
          classe: this._classeBot(), cerveau: 'minimal', difficulte: diff });
      }
    } else {
      // chacun pour soi : chacun à un lieu différent de la zone
      const n = (o.ennemis ?? (TELEPHONE ? 3 : 5)) + (humain ? 1 : 0);
      const L = pointsDe(this.zone);
      for (let k = 0; k < n; k++) {
        const p = L.length ? L[k % L.length] : { x: 14.88, y: 0, z: -3.12 }, loc = humain && k === 0;
        this.ajouterActeur({ id: id++, nom: loc ? 'Haythem' : this._fiche(k).nom, fiche: loc ? FICHE_HAYTHEM : this._fiche(k), equipe: null, local: loc, humain: loc,
          x: p.x + (k >= L.length ? 1.5 : 0), y: p.y, z: p.z, lacet: 0, classe: loc ? o.classe || 'assaut' : this._classeBot(), cerveau: loc ? null : 'minimal', difficulte: diff });
      }
    }
    for (const a of this.acteurs) a.gele = true;
    this.chrono = this.duree;
    this.phaseVers('presentation', PRESENTATION);
    this.annonce(this.mode === 'melee' ? 'CHACUN POUR SOI' : `MATCH À MORT PAR ÉQUIPES · ${EQUIPES.A.nom} CONTRE ${EQUIPES.B.nom}`, 'info');
    if (this._dominationRepli) this.annonce('DOMINATION : bientôt — match à mort par équipes', 'info');
    // (une élimination : un chargeur rendu au tireur, le score ; la réapparition programmée)
    this.sur('elim', (e) => this._elim(e));
  }
  _elim(e) {
    const tireur = this.acteurParId(e.par), cible = this.acteurParId(e.cible);
    if (cible) cible.reapparitionT = this.t + this.reapparition;
    if (tireur && tireur !== cible) {
      tireur.arsenal?.ajouterChargeur();
      tireur.stats.score += 100 + (e.tete ? 25 : 0);
      if (this.scores && tireur.equipe) this.scores[tireur.equipe]++;
      this.evt('score', { equipe: tireur.equipe, valeur: this.scores ? this.scores[tireur.equipe] : tireur.stats.elims, id: tireur.id, points: 100, raison: 'elim' });
    } else if (cible) { cible.stats.elims = Math.max(0, cible.stats.elims - 1); }
  }
  regles(dt) {
    if (this.phase === 'presentation' && this.phaseT >= this.phaseDuree) this.phaseVers('decompte', DECOMPTE);
    else if (this.phase === 'decompte' && this.phaseT >= this.phaseDuree) {
      for (const a of this.acteurs) a.gele = false;
      this.phaseVers('manche', this.duree); this.annonce('GO !', 'go');
    } else if (this.phase === 'manche') {
      this.chrono = Math.max(0, this.duree - this.phaseT);
      // les réapparitions
      for (const a of this.acteurs) {
        if (a.vivant || a.role === 'cible' || !a.reapparitionT || this.t < a.reapparitionT) continue;
        const p = choisirApparition(this, a);
        a.poupee = null;
        if (a.joueur && a.joueur.mesh) a.joueur.mesh.visible = !a.local;
        a.reapparaitre(p.x, p.y, p.z, p.lacet, this.t);
        if (a.local) { this.game.camYaw = p.lacet; this.game.camPitch = 0; }
        this.evt('apparition', { a: a.id, x: p.x, y: p.y, z: p.z });
      }
      // la fin : au score ou au temps
      let fin = this.chrono <= 0;
      if (this.scores) { for (const k of ['A', 'B']) if (this.scores[k] >= this.scoreCible) fin = true; }
      else if (this.acteurs.some((a) => a.stats.elims >= this.scoreCible)) fin = true;
      if (fin) {
        const cl = this.acteurs.filter((a) => a.role !== 'cible').sort((x, y) => y.stats.elims - x.stats.elims);
        this.gagnant = this.scores ? (this.scores.A === this.scores.B ? null : this.scores.A > this.scores.B ? 'A' : 'B') : cl[0] ? cl[0].id : null;
        for (const a of this.acteurs) a.gele = true;
        this.phaseVers('fin', 0);
        this.evt('fin', { gagnant: this.gagnant, scores: this.scores ? { ...this.scores } : null });
      }
    }
  }
  majHud() { super.majHud(); this.hud.chrono = this.chrono; }
}
