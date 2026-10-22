// =====================================================================
//  LES RÈGLES DU PROP HUNT — squelette du socle S0 (22/10), rempli par le lot L-F (vague 3 : L-O)
// =====================================================================
// Les props sont les VRAIS meubles de l'école ; les chasseurs traquent, chaque balle sur un vrai meuble leur coûte des PV
// (spec §§ 2.7-2.8, 3.9, 4.5.14). Le squelette : UNE manche présentation (3 s) → cachette → traque → révélation (6 s),
// rôles fixes, fin quand les props sont morts ou au chrono ; les chasseurs au sprint limité ; la SAISIE de la roue des
// provocations (hors simulation, hors état : `roue`, `roueOuverte`, `mouvementSouris`, `mouvementStick`, `lireExtra` —
// T tenu et le geste, les chiffres provoc1-8, G = la dernière ; JAMAIS game.wheel) ; se déguiser (le meuble visé, le carton
// de secours quand le registre est vide), se figer, verrouiller le cap. L-F : manches alternées, pénalités et soins,
// provocations forcées, scanner, points, panneau de cachette.
//   opts : { zone, manches, acteurs, difficulte, premierRole, chasseurSeul, aides, graine, humain = vrai }
import { Partie } from './partie.js';
import { ZONES_JEU } from './constantes.js';
import { DOTATION_CHASSEUR } from './armes.js';
import { departs, pointsDe } from './apparitions.js';
import { CerveauChasseur, CerveauCacheur } from './cerveau_prop.js';
import { typesDeguisables, viserMeuble, deguiser } from './deguisements.js';
import { CorpsProp } from './corps_prop.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { PROVOCATIONS } from './sons_prop.js';

const cbrt = Math.cbrt, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// § 3.9 : toutes les constantes du mode
export const REGLAGES_PROP = {
  manches: 6, choixManches: [4, 6, 8], presentation: 3, revelation: 6,
  // [cachette, traque] (s) par zone
  durees: { ss: [30, 180], e2: [30, 180], e1: [35, 210], rdc: [40, 240], ecole_int: [50, 330] },
  acteurs: 5, acteursMin: 4, acteursMax: 8, chasseurs: (n) => Math.round(n / 3),
  chasseur: { pv: 100, course: 5.0, sprint: 6.6, endurance: 100, perteSprint: 25, regain: 15, seuilSprint: 20, sprintTactique: false },
  penalite: { meuble: 3, plomb: 1, maxParCoup: 6 }, soin: 0.25,
  pvProp: (V) => Math.round(clamp(40 + 90 * cbrt(V), 60, 145)),
  vitesseProp: (V) => 4.6 * clamp(1.15 - 0.35 * cbrt(V), 0.72, 1.05),
  marcheProp: 1.4, sprintProp: 1.2, enduranceProp: { perte: 33, regain: 15 }, sautProp: 1.8, tocSaut: 6,
  rayonProp: (l, p) => clamp(Math.max(l, p) / 2 * 0.9, 0.15, 0.5),
  bandeProp: (h) => [Math.min(0.25, 0.4 * h), Math.max(h, 0.5)],
  changements: { traque: 3, entre: 5 }, pouf: 10,
  provocation: { periode: 40, decalage: [0, 15], derniereMinute: 20, dernierProp: 25, rayonForcee: 1.3 },
  provocationVolontaire: { recharge: 4, points: [5, 10], procheChasseur: 10, multiplicateur: 2 },
  scanner: { charges: 3, entre: 8, portee: 12, arc: 20, bandes: [4, 8, 12] },
  points: { survie30: 10, provocation: [5, 10], mancheSurvecue: 50, dernierProp: 25, propElimine: 100, aide: 40, aideSeuil: 0.25, vraiMeuble: -2, equipeGagnante: 50 },
  zoneRepli: 'e1', typesMin: 6, figeVu: { facile: 0.5, normal: 0.25, difficile: 0.1 },
};

export class PartieProp extends Partie {
  static prerequis = { nav: true, navProps: true, avatars: true, catalogue: true };
  constructor(game, opts, deps) {
    super(game, opts, deps);
    this.id = 'prophunt';
    const z = this.opts.zone;
    this.zone = z && ZONES_JEU[z] && ZONES_JEU[z].modes.includes('prop') ? z : null;
    this.roue = { ouverte: false, ax: 0, ay: 0, choix: -1 };
    this.gagnant = null; this.nManches = this.opts.manches || REGLAGES_PROP.manches;
  }
  async preparer(progres) {
    // la zone par défaut, calculée au lancement : le −1 s'il a 6 types déguisables, sinon le 1er (§ 3.9)
    await super.preparer(progres);
    if (!this.zone) this.zone = typesDeguisables('ss').length >= REGLAGES_PROP.typesMin ? 'ss' : REGLAGES_PROP.zoneRepli;
  }
  _fiche(k) { const ids = this.opts.avatars || []; const F = ids.length ? FICHES_BOTS.filter((f) => ids.includes(f.id)) : []; return F.length ? F[k % F.length] : FICHE_HAYTHEM; }
  peupler() {
    const o = this.opts, humain = o.humain !== false, N = clamp(o.acteurs || REGLAGES_PROP.acteurs, REGLAGES_PROP.acteursMin, REGLAGES_PROP.acteursMax);
    const nC = REGLAGES_PROP.chasseurs(N);
    let roleH = o.premierRole || 'prop';
    if (roleH === 'hasard') roleH = this.rng.next() < 0.5 ? 'prop' : 'chasseur';
    const dC = departs(this.zone, 'chasseurs', nC, this.rng);
    const P = pointsDe(this.zone), diff = o.difficulte || 'facile';
    let id = 0, kc = 0, kp = 0;
    const lieuProp = (k) => { const p = P.length ? P[k % P.length] : { x: dC[0].x, y: dC[0].y, z: dC[0].z }; return { x: p.x + (k >= P.length ? 1 : 0), y: p.y, z: p.z }; };
    // Haythem d'abord (acteur 0)
    if (humain) {
      if (roleH === 'chasseur') {
        const p = dC[kc++];
        this.ajouterActeur({ id: id++, nom: 'Haythem', equipe: 'chasseurs', role: 'chasseur', local: true, humain: true, x: p.x, y: p.y, z: p.z, lacet: p.lacet, dotation: DOTATION_CHASSEUR });
      } else {
        const p = lieuProp(kp++);
        this.ajouterActeur({ id: id++, nom: 'Haythem', equipe: 'props', role: 'prop', local: true, humain: true, x: p.x, y: p.y, z: p.z, lacet: 0 });
      }
    }
    while (kc < nC) {
      const p = dC[kc++];
      this.ajouterActeur({ id: id++, nom: this._fiche(id).nom, fiche: this._fiche(id), equipe: 'chasseurs', role: 'chasseur', x: p.x, y: p.y, z: p.z, lacet: p.lacet,
        dotation: DOTATION_CHASSEUR, cerveau: null });
    }
    while (this.acteurs.length < N) {
      const p = lieuProp(kp++);
      this.ajouterActeur({ id: id++, nom: this._fiche(id).nom, fiche: this._fiche(id), equipe: 'props', role: 'prop', corps: 'prop', x: p.x, y: p.y, z: p.z, lacet: 0 });
    }
    for (const a of this.acteurs) {
      if (a.role === 'chasseur') { a.sprintLimite = true; if (!a.local) a.cerveau = new CerveauChasseur(a, this, diff); }
      else if (!a.local) a.cerveau = new CerveauCacheur(a, this, diff);
    }
    this.phaseVers('presentation', REGLAGES_PROP.presentation);
    const loc = this.local;
    this.annonce(loc && loc.role === 'prop' ? 'TU ES PROP — CACHE-TOI !' : 'TU ES CHASSEUR', 'info');
    this.sur('elim', () => this._verifierFin());
  }
  get dureesZone() { return REGLAGES_PROP.durees[this.zone] || REGLAGES_PROP.durees.e1; }
  regles(dt) {
    const [tC, tT] = this.dureesZone;
    // les chasseurs, figés pendant la présentation et la cachette
    const figes = this.phase === 'presentation' || this.phase === 'cachette' || this.phase === 'revelation' || this.phase === 'fin';
    for (const a of this.acteurs) if (a.role === 'chasseur') a.gele = figes;
    // les fronts des props : se déguiser, se figer, verrouiller, provoquer
    for (const a of this.acteurs) if (a.role === 'prop' && a.vivant) this._actionsProp(a);
    if (this.phase === 'presentation' && this.phaseT >= this.phaseDuree) this.phaseVers('cachette', tC);
    else if (this.phase === 'cachette') {
      this.chrono = Math.max(0, tC - this.phaseT);
      if (this.phaseT >= this.phaseDuree) {
        // un prop resté humain est déguisé d'office (le carton au squelette)
        for (const a of this.acteurs) if (a.role === 'prop' && a.vivant && !a.prop) this._deguiser(a, 'carton', true);
        this.phaseVers('traque', tT); this.annonce('LES CHASSEURS SONT LÂCHÉS', 'go');
      }
    } else if (this.phase === 'traque') {
      this.chrono = Math.max(0, tT - this.phaseT);
      if (this.chrono <= 0) this._finir('props');
    } else if (this.phase === 'revelation' && this.phaseT >= this.phaseDuree) {
      this.phaseVers('fin', 0);
      this.evt('fin', { gagnant: this.gagnant, scores: null });
    }
  }
  _verifierFin() {
    if (this.phase !== 'traque' && this.phase !== 'cachette') return;
    if (!this.acteurs.some((a) => a.role === 'prop' && a.vivant)) this._finir('chasseurs');
    else if (!this.acteurs.some((a) => a.role === 'chasseur' && a.vivant)) this._finir('props');
  }
  _finir(g) { if (this.phase === 'revelation' || this.phase === 'fin') return; this.gagnant = g; this.phaseVers('revelation', REGLAGES_PROP.revelation); this.annonce(g === 'props' ? 'LES PROPS GAGNENT' : 'LES CHASSEURS GAGNENT', 'info'); }
  _deguiser(a, cle, force = false) {
    if (a.corps === a.joueur) {
      // l'humain devient meuble : son Player garé (caché, non simulé), un CorpsProp à sa place
      a.changerCorps(new CorpsProp(this.game.collisions, { rayon: 0.3, haut: 1, bas: 0.1, bounds: this.monde && this.monde.bornes }));
      if (a.local && this.game.camYaw !== undefined) a.corps.ang = a.joueur ? Math.atan2(a.joueur.facing.x, a.joueur.facing.z) : 0;
    }
    return deguiser(this, a, cle);
  }
  _actionsProp(a) {
    const c = a.cmd;
    if (c.deguiser && (this.phase === 'cachette' || this.phase === 'traque' || this.phase === 'presentation')) {
      const v = viserMeuble(this, a, c.lacet, c.tangage);
      const cle = v ? v.cle : (a.cerveau && a.cerveau.cle) || 'carton';
      this._deguiser(a, cle);
    }
    if (a.prop) {
      if (c.figer) a.prop.fige = !a.prop.fige;
      if (c.verrou) a.prop.verrou = !a.prop.verrou;
    }
    if (c.provoc >= 0) {
      const t = this.t;
      if (t - (a._provocT ?? -Infinity) >= REGLAGES_PROP.provocationVolontaire.recharge) {
        a._provocT = t; a.stats.provocs++;
        const id = c.provoc >= 8 ? (a._derniereProvoc ?? 0) : c.provoc;
        a._derniereProvoc = id;
        this.evt('provocation', { a: a.id, id: PROVOCATIONS[id] ? PROVOCATIONS[id].id : id, x: a.pos.x, y: a.pos.y, z: a.pos.z, forcee: false });
      }
    }
  }
  // ---------------------------------------------------------------- LA ROUE DES PROVOCATIONS (saisie hors simulation)
  roueOuverte() { return this.roue.ouverte; }
  _secteur(x, y) { const a = Math.atan2(x, -y); return ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8; }
  mouvementSouris(dx, dy) {
    const R = this.roue; if (!R.ouverte) return;
    R.ax += dx; R.ay += dy;
    if (Math.hypot(R.ax, R.ay) >= 40) R.choix = this._secteur(R.ax, R.ay);
  }
  mouvementStick(x, y) { const R = this.roue; if (R.ouverte && Math.hypot(x, y) >= 0.5) R.choix = this._secteur(x, y); }
  lireExtra(input, game, cmd) {
    if (this.profil !== 'prop') return;
    const R = this.roue;
    if (input.down('provoquer')) { if (!R.ouverte) { R.ouverte = true; R.ax = 0; R.ay = 0; R.choix = -1; } }   // hors simulation
    else if (R.ouverte) { R.ouverte = false; if (R.choix >= 0) cmd.provoc = R.choix; }
    for (let n = 1; n <= 8; n++) if (input.pressed('provoc' + n)) cmd.provoc = n - 1;   // hors simulation
    if (input.pressed('provocVite')) cmd.provoc = 8;   // hors simulation
  }
  majHud() {
    super.majHud();
    const a = this.local, P = a && a.prop;
    this.hud.nManches = this.nManches;
    this.hud.prop = a ? { forme: P ? P.cle : null, nomForme: P && P.T ? P.T.nom : null, changements: P ? P.changements : 0, verrou: !!(P && P.verrou),
      fige: !!(P && P.fige), provocT: 0, provocMax: REGLAGES_PROP.provocation.periode, discretion: 0.5, oeil: 0, scanner: { charges: 0, t: 0 },
      propsRestants: this.acteurs.filter((b) => b.role === 'prop' && b.vivant).length,
      chasseursRestants: this.acteurs.filter((b) => b.role === 'chasseur' && b.vivant).length, role: a.role,
      roue: { ouverte: this.roue.ouverte, choix: this.roue.choix }, cachette: null } : null;
  }
  // le prop (même encore humain) en orbite ; le chasseur pendant la cachette : caméra fixe à son œil
  camera(dt, poser) {
    const a = this.local;
    if (a && a.vivant && a.role === 'prop') { this.orbite.viser(a.corps, { distance: a.prop ? 2.4 : 2.6, hauteur: a.prop ? 0.8 : 1.4, tangage: this.bornesTangage() }); return this.orbite.poser(dt, poser); }
    return super.camera(dt, poser);
  }
  bornesTangage() { return this.local && this.local.role === 'prop' ? [-0.7, 1.25] : super.bornesTangage(); }
  get profil() { return this.local && this.local.role === 'prop' ? 'prop' : 'combat'; }
}
