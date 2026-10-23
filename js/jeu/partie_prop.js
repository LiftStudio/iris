// =====================================================================
//  LES RÈGLES DU PROP HUNT — lot L-F (23/10), sur le squelette du socle S0 (vague 3 : L-O)
// =====================================================================
// Les props sont les VRAIS meubles de l'école ; les chasseurs traquent, chaque balle sur un vrai meuble leur coûte des PV
// (spec §§ 2.7-2.8, 3.9, 4.5.14). Une partie = N manches (4 / 6 / 8) ; le rôle de Haythem ALTERNE d'une manche à l'autre
// (premier rôle : prop, chasseur ou au hasard semé). Une manche :
//   présentation 3 s (tout le monde figé, les props bots déjà en meubles) → CACHETTE (les props se déguisent et se
//   placent, changements illimités ; les chasseurs figés à leur départ, aveugles — caméra fixe et panneau de cachette de
//   L-G — et SOURDS aux props : ni leur cerveau ni les sons de Haythem chasseur ne reçoivent rien d'un prop) → TRAQUE (un
//   prop resté humain est déguisé d'office en le meuble le plus courant de sa pièce ; 3 changements de forme, 5 s entre
//   deux ; provocation obligatoire toutes les 40 s, 20 dans la dernière minute, 25 pour le dernier prop ; scanner des
//   chasseurs ; −3 PV par balle dans un VRAI meuble, −1 par plomb, −6 au plus par coup ; +25 % des dégâts faits à un prop
//   rendus au chasseur) → RÉVÉLATION 6 s (les points de la manche) → la manche suivante, ou la fin.
// La composition : chasseurs = arrondi(N/3) ; Haythem prop : lui + des props bots contre arrondi(N/3) chasseurs bots ;
// Haythem chasseur : lui + arrondi(N/3) − 1 coéquipiers (un cran moins doués) contre les props bots ; « chasseur seul » : il
// chasse seul. Les acteurs vivent toute la partie : Haythem (id 0), les bots qui chassent un jour (un corps d'élève chacun,
// garé quand ils sont meubles), les bots toujours props (un CorpsProp seul : jamais d'avatar, arbitrage 19).
// Tout ce qu'appelle Partie.pas est PUR : le hasard est `this.rng` (décalage des provocations, arc du scanner, premier
// rôle au hasard), le temps `this.t` ; la roue des provocations est lue HORS simulation (lireExtra). Les règles émettent
// (`provocation`, `faux`, `scanner`, `score`, `refus`, `defige`…) ; les sons (js/jeu/sons_prop.js) et le HUD (L-G) écoutent.
//   opts : { zone, manches, acteurs, difficulte, premierRole, chasseurSeul, aides, graine, humain = vrai, avatars,
//            forcerZone (tests : une zone grisée gardée) } — un champ absent vient des derniers choix (settings.jeu.prop)
import * as THREE from 'three';
import { Partie } from './partie.js';
import { Rng, melanger } from './rng.js';
import { PAS, ZONES_JEU, niveauDe } from './constantes.js';
import { Acteur } from './acteur.js';
import { Arsenal, DOTATION_CHASSEUR, degatsDe } from './armes.js';
import { departs, pointsDe, piecesDe } from './apparitions.js';
import { CerveauChasseur, CerveauCacheur, DIFFICULTES_PROP } from './cerveau_prop.js';
import { typesDeguisables, viserMeuble, deguiser, retirerProp, toucherPoses, credibilite, typeDe } from './deguisements.js';
import { MEUBLES } from '../registre_meubles.js';
import * as Pilotage from './pilotage.js';
import { CorpsProp } from './corps_prop.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { PROVOCATIONS } from './sons_prop.js';
import { TABLE_PORTES_PROP } from './monde_partie.js';

const cbrt = Math.cbrt, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const DEG = Math.PI / 180, JAMAIS = -1e9;          // (une date « jamais » finie : l'état passe par JSON, -Infinity y deviendrait null)
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const _v = new THREE.Vector3();

// § 3.9 : toutes les constantes du mode (le socle les a posées ; L-F y ajoute ce que ses règles lisent en plus)
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
  // (forcée = le sifflet d'arbitre, rayon × 1,3 ; la 1re de chaque prop 40 s + un décalage de 0 à 15 s après le lâcher)
  provocation: { periode: 40, decalage: [0, 15], derniereMinute: 20, dernierProp: 25, rayonForcee: 1.3, forcee: 'sifflet' },
  provocationVolontaire: { recharge: 4, points: [5, 10], procheChasseur: 10, multiplicateur: 2 },
  // (`duree` : les arcs du scanner restent 2 s au HUD)
  scanner: { charges: 3, entre: 8, portee: 12, arc: 20, bandes: [4, 8, 12], duree: 2 },
  points: { survie30: 10, provocation: [5, 10], mancheSurvecue: 50, dernierProp: 25, propElimine: 100, aide: 40, aideSeuil: 0.25, vraiMeuble: -2, equipeGagnante: 50 },
  zoneRepli: 'e1', typesMin: 6, figeVu: { facile: 0.5, normal: 0.25, difficile: 0.1 },
  // (L-F) « 10 SECONDES ! » avant la fin de la cachette ; la dernière minute de la traque ; la survie comptée par 30 s ;
  // se défiger prend 0,25 s (un « craquement ») ; les astuces du panneau de cachette changent toutes les 8 s
  annonceCachette: 10, derniereMinute: 60, survie: 30, defige: 0.25, astuces: 8,
};
const ID_FORCEE = Math.max(0, PROVOCATIONS.findIndex((p) => p.id === REGLAGES_PROP.provocation.forcee));

// LES ASTUCES du panneau de cachette (Haythem chasseur) et du prop (le HUD les montre deux par deux)
export const ASTUCES_PROP = {
  chasseur: [
    'Un meuble qui tressaille quand tu le touches : c’est un prop.',
    'Chaque balle dans un VRAI meuble te coûte 3 PV. Toucher un prop te soigne.',
    'Une porte qui s’ouvre toute seule : quelqu’un vient de passer.',
    'Une provocation étouffée et sourde vient d’un autre étage.',
    'Le scanner (X) donne la direction et la distance des props à moins de 12 m.',
    'Un tabouret de trop autour d’une table, une chaise tournée de travers : méfie-toi.',
    'Ton sprint s’épuise en 4 s : un prop repéré peut encore te semer.',
    'La grenade ne coûte rien sur les vrais meubles : elle teste un tas de chaises.',
  ],
  prop: [
    'Verrouille ton cap (R) : un meuble qui tourne avec la caméra se voit.',
    'Fige-toi (F) quand un chasseur approche : un vrai meuble ne bouge jamais.',
    'Marcher est silencieux ; courir fait frotter le meuble sur le sol.',
    'La DISCRÉTION dit si ta place est crédible : une chaise de plus dans une rangée.',
    'Toutes les 40 s une provocation part toute seule : provoque avant, ça rapporte.',
    'Trois changements de forme pendant la traque, 5 s entre deux.',
  ],
};

export class PartieProp extends Partie {
  static prerequis = { nav: true, navProps: true, avatars: true, catalogue: true };
  constructor(game, opts, deps) {
    super(game, opts, deps);
    this.id = 'prophunt';
    // les champs absents : les derniers choix du menu (settings.jeu.prop), puis les défauts du § 3.9
    const o = this.opts, S = (game.settings && game.settings.data && game.settings.data.jeu && game.settings.data.jeu.prop) || {};
    for (const k of ['manches', 'acteurs', 'difficulte', 'premierRole', 'chasseurSeul']) if (o[k] === undefined && S[k] !== undefined && S[k] !== null) o[k] = S[k];
    o.aides = { discretion: true, oeil: true, voirSons: false, ...(S.aides || {}), ...(o.aides || {}) };
    const z = o.zone !== undefined && o.zone !== null ? o.zone : S.zone;
    // (une zone du prop hunt ; null = calculée au lancement, § 3.9 — preparer)
    this.zone = z && ZONES_JEU[z] && ZONES_JEU[z].modes.includes('prop') ? z : null;
    this.zoneRemplacee = null;
    this.nManches = clamp(Math.round(o.manches || REGLAGES_PROP.manches), 1, 12);
    this.diff = DIFFICULTES_PROP[o.difficulte] ? o.difficulte : 'facile';
    this.roue = { ouverte: false, ax: 0, ay: 0, choix: -1 };
    this.gagnant = null; this.gagnantManche = null; this.resultats = []; this.roleH0 = null; this.roleH = null;
    this._deguisables = new Set();     // les types déguisables DANS la zone (tous leurs exemplaires au registre)
    this._coups = new Map();           // (les pénalités d'un pas, par coup : le plafond de 6 PV d'un coup de FP-12)
    this._refus = null; this._hudT = -1e9; this._jauges = { discretion: 0, oeil: 0, vise: null }; this._tirSpect = false;
  }
  // LA ZONE par défaut, calculée au lancement : le −1 s'il a 6 types déguisables, sinon le 1er (§ 3.9). Un choix explicite
  // est gardé tant que sa zone n'est pas grisée (moins de 6 types : le menu la grise) — sinon la zone par défaut, notée dans
  // `zoneRemplacee`. Le compte des types demande le catalogue, prêt APRÈS la navigation : les deux graphes sont alors
  // restreints à la zone retenue.
  async preparer(progres) {
    const z0 = this.zone;
    await super.preparer(progres);
    const R = REGLAGES_PROP, assez = (z) => typesDeguisables(z).length >= R.typesMin;
    const defaut = assez('ss') ? 'ss' : R.zoneRepli;
    if (!this.zone || (!this.opts.forcerZone && !assez(this.zone))) {
      if (this.zone && this.zone !== defaut) this.zoneRemplacee = { demandee: this.zone, raison: `moins de ${R.typesMin} types de meubles déguisables` };
      this.zone = defaut;
    }
    if (this.zone !== z0) for (const n of [this.nav, this.navProps]) if (n) n.restreindre(this.monde.noeudsAutorises(n, this.zone, this.id));
    this._deguisables = new Set(typesDeguisables(this.zone));
  }
  tablePortes() { return TABLE_PORTES_PROP; }
  get dureesZone() { return REGLAGES_PROP.durees[this.zone] || REGLAGES_PROP.durees.e1; }

  // ---------------------------------------------------------------- LES ACTEURS (une fois pour toute la partie)
  // les noms et les corps des bots : les chasseurs possibles (les premiers) portent l'avatar d'un ami coché, sinon Haythem
  // cloné ; le nom est toujours celui d'un ami (le tableau des rôles et le fil des éliminations en ont besoin)
  _fichesBots(n, nPool) {
    const ids = this.opts.avatars || [], F = ids.length ? FICHES_BOTS.filter((f) => ids.includes(f.id)) : [];
    const out = [], pris = new Set();
    for (let k = 0; k < n; k++) {
      const avatar = k < nPool && F.length ? F[k % F.length] : null;
      let nom = avatar ? avatar.nom : null;
      if (!nom || pris.has(nom)) nom = (FICHES_BOTS.find((f) => !pris.has(f.nom)) || {}).nom || `Élève ${k + 2}`;
      pris.add(nom);
      out.push({ nom, fiche: avatar || (k < nPool ? FICHE_HAYTHEM : FICHES_BOTS.find((f) => f.nom === nom) || FICHE_HAYTHEM) });
    }
    return out;
  }
  // un bot toujours prop : un acteur sans Player (un CorpsProp seul)
  _ajouterPropBot(def) {
    const a = new Acteur(this, { id: def.id, nom: def.nom, equipe: 'props', role: 'prop', fiche: def.fiche || FICHE_HAYTHEM });
    a.corps = a._corpsProp = this._nouveauCorpsProp();
    a.reapparaitre(def.x, def.y, def.z, 0, this.t); a.protegeT = 0;
    this.acteurs.push(a);
    return a;
  }
  _nouveauCorpsProp() { return new CorpsProp(this.game.collisions, { rayon: 0.3, haut: 1, bas: 0.1, bounds: this.monde && this.monde.bornes }); }
  peupler() {
    const o = this.opts, R = REGLAGES_PROP, humain = o.humain !== false;
    const N = clamp(Math.round(o.acteurs || R.acteurs), R.acteursMin, R.acteursMax);
    this.N = N; this.nC = R.chasseurs(N); this.chasseurSeul = !!o.chasseurSeul;
    let r = o.premierRole || 'prop';
    // (au hasard SEMÉ : un tirage à lui — les premiers tirages d'un xorshift semé d'un petit entier sont tous proches de 0)
    if (r === 'hasard') r = new Rng(melanger(this.graine, 0x7201e)).next() < 0.5 ? 'prop' : 'chasseur';
    this.roleH0 = humain ? (r === 'chasseur' ? 'chasseur' : 'prop') : null;
    const d0 = departs(this.zone, 'chasseurs', 1, this.rng)[0];
    const nPool = this.nC, fiches = this._fichesBots(N - (humain ? 1 : 0), nPool);
    let id = 0;
    if (humain) this.ajouterActeur({ id: id++, nom: 'Haythem', fiche: FICHE_HAYTHEM, equipe: 'props', role: 'prop', local: true, humain: true, x: d0.x, y: d0.y, z: d0.z, lacet: 0 });
    fiches.forEach((f, k) => {
      if (k < nPool) {
        const a = this.ajouterActeur({ id: id++, nom: f.nom, fiche: f.fiche, equipe: 'chasseurs', role: 'chasseur', x: d0.x, y: d0.y, z: d0.z, lacet: 0, dotation: DOTATION_CHASSEUR, cerveau: null });
        a.pool = true; a._arsenalChasseur = a.arsenal;
      } else this._ajouterPropBot({ id: id++, nom: f.nom, fiche: f.fiche, x: d0.x, y: d0.y, z: d0.z });
    });
    // (les points d'élimination et d'aide, les fins de manche)
    this.sur('touche', (e) => this._surTouche(e));
    this.sur('elim', (e) => this._surElim(e));
    this._debutManche(true);
  }
  // LE RÔLE d'un acteur pour la manche, posé à son départ `p` : son corps (Player d'élève pour un chasseur ; CorpsProp pour
  // un prop — Haythem commence la manche en humain), son arsenal, son cerveau, ses compteurs de manche
  _poserRole(a, role, p, { coequipier = false } = {}) {
    const R = REGLAGES_PROP, avaitPoupee = !!a.poupee;
    if (a.prop) retirerProp(this, a);
    a.cerveau?.liberer?.(); a.cerveau = null;
    a.role = role; a.equipe = role === 'chasseur' ? 'chasseurs' : 'props'; a.poupee = null; a.coequipier = coequipier;
    if (role === 'chasseur') {
      if (a.joueur && a.corps !== a.joueur) a.changerCorps(a.joueur);
      a.sprintLimite = true;
      a.arsenal = a._arsenalChasseur || (a._arsenalChasseur = new Arsenal(a, DOTATION_CHASSEUR));
      a.vieMax = R.chasseur.pv;
      if (!a.local) a.cerveau = this._cerveauChasseur(a, coequipier ? DIFFICULTES_PROP[this.diff].coequipier : this.diff);
    } else {
      a.sprintLimite = false; a.arsenal = null;
      const c = a._corpsProp || (a._corpsProp = this._nouveauCorpsProp());
      if (a.local && a.joueur) { if (a.corps !== a.joueur) a.changerCorps(a.joueur); }
      else if (a.corps !== c) a.changerCorps(c);
      c.rayon = 0.3;
      a.vieMax = 100;
      if (!a.local) a.cerveau = new CerveauCacheur(a, this, this.diff);
    }
    // (un élève qui a fini la manche d'avant en poupée de chiffon : son Player remis — les clips coupés PUIS la clé oubliée,
    // piège 2 des persos —, et montré s'il est son corps ; Haythem chasseur, lui, est caché par la vue à la 1re personne)
    const j = a.joueur;
    if (j && avaitPoupee && j !== this.game.user && j.anim && j.anim.couper) { j.anim.couper(); j.animKey = null; }
    if (j && j.mesh) j.mesh.visible = a.corps === j;
    a.reapparaitre(p.x, p.y, p.z, p.lacet || 0, this.t); a.protegeT = 0; a.vie = a.vieMax; a.gele = true;
    a.pp = { provocRef: this.t, provocVolT: JAMAIS, derniere: a.pp ? a.pp.derniere : 0, chgT: JAMAIS, defigeT: JAMAIS,
      scanCharges: R.scanner.charges, scanT: this.t, deg: {} };
  }
  // le cerveau d'un chasseur bot, SOURD aux props avant la traque (règle d'équité : il ne suit pas les frottements à
  // l'oreille pendant que les props se cachent)
  _cerveauChasseur(a, diff) {
    // (l'oreille du cerveau telle qu'il l'a — la sienne ou celle d'une sous-classe de L-O —, enveloppée)
    const c = new CerveauChasseur(a, this, diff), oreille = c.entendre;
    c.entendre = (e) => (this.sourd(e) ? undefined : oreille.call(c, e));
    return c;
  }
  // un événement qu'un chasseur n'entend pas : tout ce qui vient d'un prop, hors de la traque
  sourd(e) {
    if (this.phase === 'traque') return false;
    if (e.type === 'provocation' || e.type === 'frottement' || e.type === 'deguise' || e.type === 'defige') return true;
    const b = e.a !== undefined ? this.acteurParId(e.a) : null;
    return !!(b && b.role === 'prop');
  }
  // un point libre au sol (le disque d'un humain, 0,3 m), sur le sol du point demandé ; null sinon
  _placer(x, y, z) {
    const C = this.game.collisions; if (!C) return { x, y, z };
    const sol = C.solEn(x, z, y + 0.3); if (Math.abs(sol - y) > 0.3) return null;
    const p = { x, z }; C.resoudre(p, 0.3, null, sol);
    const s2 = C.solEn(p.x, p.z, sol + 0.3);
    return C.libre(p.x, p.z, 0.3, sol) && Math.abs(s2 - y) <= 0.3 ? { x: p.x, y: s2, z: p.z } : null;
  }
  // un point dans un passage d'une pièce à l'autre (à moins de 0,75 m de son centre, à son niveau : une porte fait 0,75 à
  // 0,9 m) : un meuble posé là boucherait la porte
  // (les 46 passages de carte_monde § 7 : `PASSAGES` du squelette de js/jeu/pilotage.js, lu s'il y est
  // encore — L-D remplace l'errant par le graphe)
  _dansUnPassage(q) { return (Pilotage.PASSAGES || []).some((P) => Math.hypot(P.x - q.x, P.z - q.z) < 0.75 && Math.abs(P.y - q.y) < 1.5); }
  // LES DÉPARTS DES PROPS : les lieux de la zone hors de la pièce des chasseurs, à tour de rôle d'une manche à l'autre,
  // espacés de 1,5 m (Haythem prend le premier : l'espace pause au −1, la pause orange au 1er)
  _lieuxProps(n) {
    const dC = departs(this.zone, 'chasseurs', 1, this.rng)[0], P = pointsDe(this.zone);
    // (hors du lieu des chasseurs : au 1er, la pause orange, à 3,8 m du palier est, reste aux props — les chasseurs y sont
    // figés et aveugles pendant toute la cachette ; c'est l'espace ouvert d'où l'on part se cacher)
    const L = P.filter((q) => Math.hypot(q.x - dC.x, q.z - dC.z) > 3 || Math.abs(q.y - dC.y) > 1.5);
    const base = L.length ? L : P.length ? P : [dC];
    const OFF = [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5], [1.5, 1.5], [-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5]];
    const out = [], k0 = (this.manche - 1) % base.length;
    for (let k = 0; out.length < n && k < base.length * OFF.length; k++) {
      const b = base[(k0 + k) % base.length], o = OFF[Math.floor(k / base.length)];
      const q = this._placer(b.x + o[0], b.y, b.z + o[1]);
      if (!q || out.some((w) => Math.hypot(w.x - q.x, w.z - q.z) < 1.2) || this._dansUnPassage(q)) continue;
      out.push({ x: q.x, y: q.y, z: q.z, lacet: Math.atan2(-(dC.x - q.x), -(dC.z - q.z)) + Math.PI });
    }
    while (out.length < n) { const b = base[out.length % base.length]; out.push({ x: b.x, y: b.y, z: b.z, lacet: 0 }); }
    return out;
  }

  // ---------------------------------------------------------------- LA MANCHE
  _debutManche(premiere = false) {
    const g = this.game, m = this.manche - 1, loc = this.local;
    const roleH = loc ? (m % 2 === 0 ? this.roleH0 : this.roleH0 === 'prop' ? 'chasseur' : 'prop') : null;
    this.roleH = roleH;
    // qui chasse : les bots du « pool » (tous quand Haythem est prop ; tous sauf un, à tour de rôle, quand il chasse ; aucun
    // en « chasseur seul »)
    const pool = this.acteurs.filter((a) => a.pool);
    let chasse;
    if (!loc || roleH === 'prop') chasse = new Set(pool);
    else if (this.chasseurSeul) chasse = new Set();
    else { const sauf = pool.length ? pool[Math.floor(m / 2) % pool.length] : null; chasse = new Set(pool.filter((a) => a !== sauf)); }
    const C = [], P = [];
    for (const a of this.acteurs) ((a.local ? roleH === 'chasseur' : chasse.has(a)) ? C : P).push(a);
    const dC = departs(this.zone, 'chasseurs', Math.max(1, C.length), this.rng), dP = this._lieuxProps(P.length);
    // (les chasseurs tournés vers le cœur de la zone — les lieux d'où partent les props —, pas vers le mur du palier)
    const L = pointsDe(this.zone);
    if (L.length) {
      const cx = L.reduce((s, q) => s + q.x, 0) / L.length, cz = L.reduce((s, q) => s + q.z, 0) / L.length;
      for (const d of dC) if (Math.hypot(cx - d.x, cz - d.z) > 0.5) d.lacet = Math.atan2(-(cx - d.x), -(cz - d.z));
    }
    C.forEach((a, k) => this._poserRole(a, 'chasseur', dC[k], { coequipier: !!loc && roleH === 'chasseur' && !a.local }));
    P.forEach((a, k) => this._poserRole(a, 'prop', dP[k]));
    // Haythem : la vue de son rôle (à la 1re manche, Partie.entrer la pose), le regard, ses touches (profil changé : purgé)
    if (loc) {
      const d = roleH === 'chasseur' ? dC[C.indexOf(loc)] : dP[P.indexOf(loc)];
      g.camYaw = d.lacet || 0; g.camPitch = roleH === 'prop' ? 0.3 : 0;
      if (!premiere) {
        if (roleH === 'chasseur') { this.vue.entrer(loc); this.aff.viewmodel?.montrer?.(loc.arsenal && loc.arsenal.arme ? loc.arsenal.arme.id : 'pm9'); }
        else { this.vue.sortir(); this.aff.viewmodel?.cacher?.(); }
        g.appliquerProfil?.({ purger: true });
      }
      this.suivi = loc;
    }
    this._regardFixe = null; this.gagnantManche = null; this.chrono = 0;
    this.roue.ouverte = false; this.roue.choix = -1;
    this.phaseVers('presentation', REGLAGES_PROP.presentation);
    const n = `MANCHE ${this.manche} / ${this.nManches}`;
    this.annonce(!loc ? n : roleH === 'prop' ? `${n} · TU ES PROP — CACHE-TOI !` : `${n} · TU ES CHASSEUR — ILS SE CACHENT`, 'info');
  }
  // une durée de phase écoulée (comptée en pas : phaseT est une somme de pas de 1/120 s)
  _fini() { return Math.round(this.phaseT / PAS) >= Math.round(this.phaseDuree / PAS); }
  // le pas où le temps de phase franchit `s`
  _franchi(s) { return s > 0 && Math.round(this.phaseT / PAS) === Math.round(s / PAS); }

  regles(dt) {
    const ph = this.phase, [tC, tT] = this.dureesZone;
    for (const a of this.acteurs) if (a.prop && a.vivant) a.prop.pv = a.vie;       // (les PV du meuble sont ceux de l'acteur)
    // les gestes : déguisement, gel, verrou, provocation (props) ; scanner (chasseurs)
    for (const a of this.acteurs) if (a.vivant) { if (a.role === 'prop') this._actionsProp(a); else if (a.role === 'chasseur') this._actionsChasseur(a); }
    if (ph === 'presentation') { if (this._fini()) this.phaseVers('cachette', tC); }
    else if (ph === 'cachette') {
      this.chrono = Math.max(0, tC - this.phaseT);
      if (this._franchi(tC - REGLAGES_PROP.annonceCachette)) this.annonce('10 SECONDES !', 'alerte');
      if (this._fini()) this._lacher();
    } else if (ph === 'traque') {
      this.chrono = Math.max(0, tT - this.phaseT);
      this._traque(dt);
      if (this.phase === 'traque' && this._fini()) this._finir('props');
    } else if (ph === 'revelation' && this._fini()) {
      if (this.manche < this.nManches) { this.manche++; this._debutManche(); }
      else this._terminer();
    }
    this._majGeles();
    if (this.local && !this.local.vivant) this._spectateur();
  }
  // qui bouge au pas suivant : personne à la présentation, à la révélation, à la fin ; les props seuls pendant la cachette ;
  // tout le monde pendant la traque (les chasseurs gardent leur arme bloquée jusque-là : ni tir, ni recharge, ni changement)
  _majGeles() {
    const ph = this.phase;
    for (const a of this.acteurs) {
      a.gele = !(ph === 'traque' || (ph === 'cachette' && a.role === 'prop'));
      if (a.arsenal) a.arsenal.bloque = ph !== 'traque';
    }
  }
  // LE LÂCHER (fin de la cachette) : un prop resté humain déguisé d'office, les compteurs de la traque posés
  _lacher() {
    const R = REGLAGES_PROP, [, tT] = this.dureesZone, [d0, d1] = R.provocation.decalage;
    for (const a of this.acteurs) {
      if (a.role === 'prop' && a.vivant) {
        if (!a.prop) {
          const ok = this._deguiserDOffice(a);
          if (ok && a.local) this.annonce(`DÉGUISÉ D’OFFICE : ${a.prop.T.nom.toUpperCase()}`, 'alerte');
        }
        if (a.prop) a.prop.changements = 0;
        a.pp.provocRef = this.t + this.rng.range(d0, d1); a.pp.chgT = JAMAIS;
      } else if (a.role === 'chasseur') { a.pp.scanCharges = R.scanner.charges; a.pp.scanT = this.t; }
    }
    this.phaseVers('traque', tT);
    this.annonce('LES CHASSEURS SONT LÂCHÉS', 'go');
  }
  // le type le plus courant de sa pièce (parmi les déguisables de la zone), sinon de la zone, sinon le carton ; si la place
  // manque, le suivant, puis le carton
  _deguiserDOffice(a) {
    const essais = [...this._typesCourants(a), 'carton'];
    for (const cle of essais) if (this._deguiser(a, cle)) return true;
    return false;
  }
  _typesCourants(a) {
    const Lu = this.game.carte && this.game.carte.lumieres, p = a.pos;
    const Z = Lu && Lu.zoneEn ? Lu.zoneEn(p.x, p.z, p.y + 0.1) : null, pieces = piecesDe(this.zone);
    const compter = (L) => {
      const n = new Map();
      for (const q of L || []) if (this._deguisable(q.cle)) n.set(q.cle, (n.get(q.cle) || 0) + 1);
      return [...n].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map((e) => e[0]);
    };
    const ici = compter(Z && MEUBLES.parZone.get(Z.id)), zone = compter(MEUBLES.poses.filter((q) => pieces.has(q.zone)));
    return [...new Set([...ici, ...zone])];
  }
  _deguisable(cle) { return this._deguisables.has(cle); }
  // se déguiser : l'humain devient meuble (son Player garé, caché, non simulé ; son CorpsProp à sa place) ; refusé, il
  // reste humain
  _deguiser(a, cle) {
    let devenu = false;
    if (a.corps === a.joueur) {
      const c = a._corpsProp || (a._corpsProp = this._nouveauCorpsProp());
      c.rayon = 0.3; c.vel.set(0, 0, 0); c.jumpY = 0; c.jumpVel = 0; c.airborne = false;
      a.changerCorps(c);
      c.ang = a.joueur ? Math.atan2(a.joueur.facing.x, a.joueur.facing.z) : 0; c.angPrec = c.ang; c.angAff = c.ang;
      devenu = true;
    }
    if (a.prop) a.prop.pv = a.vie;
    const ok = deguiser(this, a, cle);
    if (!ok && devenu && a.joueur) a.changerCorps(a.joueur);
    return ok;
  }
  _refuser(a, raison) {
    if (!a.local) return;
    this._refus = { texte: raison, t: this.t };
    this.evt('refus', { a: a.id, raison });
  }
  // LES GESTES D'UN PROP (les fronts de sa commande)
  _actionsProp(a) {
    const c = a.cmd, R = REGLAGES_PROP, ph = this.phase;
    // (le défigement : le meuble repart 0,25 s après la demande)
    if (a.prop && a.prop.fige && a.pp.defigeT > 0 && this.t >= a.pp.defigeT - 1e-9) { a.prop.fige = false; a.pp.defigeT = JAMAIS; }
    if (!(ph === 'presentation' || ph === 'cachette' || ph === 'traque')) return;
    if (c.deguiser) this._changerForme(a);
    if (a.prop) {
      if (c.figer) {
        if (!a.prop.fige) { a.prop.fige = true; a.pp.defigeT = JAMAIS; }
        else if (a.pp.defigeT < 0) { a.pp.defigeT = this.t + R.defige; this.evt('defige', { a: a.id, x: a.pos.x, y: a.pos.y, z: a.pos.z }); }
      }
      if (c.verrou) a.prop.verrou = !a.prop.verrou;
    }
    if (c.provoc >= 0) {
      if (ph !== 'traque') this._refuser(a, 'Les provocations, c’est pendant la traque');
      else if (this.t - a.pp.provocVolT < R.provocationVolontaire.recharge - 1e-9) this._refuser(a, 'Provocation : attends un peu');
      else this._provoquer(a, c.provoc >= 8 ? a.pp.derniere : c.provoc, false);
    }
  }
  // CHANGER DE FORME : le meuble visé (ou le coéquipier visé) ; rien de visé : un humain prend le type le plus courant de
  // sa pièce (le cerveau d'un bot dit le sien), un meuble ne change pas. Illimité avant la traque ; pendant : 3, 5 s entre deux
  _changerForme(a) {
    const R = REGLAGES_PROP, c = a.cmd, enTraque = this.phase === 'traque';
    const v = viserMeuble(this, a, c.lacet, c.tangage);
    let cle = v && (v.acteur || this._deguisable(v.cle)) ? v.cle : null;
    if (!cle) {
      if (a.prop) { if (v) this._refuser(a, 'Ce meuble-là ne se copie pas'); return; }
      const k = a.cerveau && a.cerveau.cle;
      cle = k && (k === 'carton' || this._deguisable(k)) ? k : this._typesCourants(a)[0] || 'carton';
    }
    if (a.prop && a.prop.cle === cle) return;
    if (enTraque && a.prop) {
      if (a.prop.changements >= R.changements.traque) { this._refuser(a, 'Plus de changement de forme'); return; }
      if (this.t - a.pp.chgT < R.changements.entre - 1e-9) { this._refuser(a, 'Changement de forme : attends 5 s'); return; }
    }
    const n = a.prop ? a.prop.changements || 0 : 0, fige = !!(a.prop && a.prop.fige), verrou = !!(a.prop && a.prop.verrou);
    if (!this._deguiser(a, cle)) { this._refuser(a, 'Pas la place'); return; }
    // (figé, il le reste sous sa nouvelle forme — un meuble qui repart tout seul au moindre appui se trahit — ; le verrou aussi)
    a.prop.changements = enTraque ? n + 1 : 0; a.prop.fige = fige; a.prop.verrou = verrou;
    if (enTraque) a.pp.chgT = this.t;
  }
  // l'intervalle de la provocation obligatoire de `a` : 40 s ; 20 s dans la dernière minute ; 25 s pour le dernier prop
  _intervalleProvoc(nVivants) {
    const R = REGLAGES_PROP.provocation;
    let I = R.periode;
    if (this.phase === 'traque' && this.chrono <= REGLAGES_PROP.derniereMinute + 1e-9) I = Math.min(I, R.derniereMinute);
    if (nVivants === 1) I = Math.min(I, R.dernierProp);
    return I;
  }
  // UNE PROVOCATION (`n` : l'index dans PROVOCATIONS) : forcée = le sifflet, rayon × 1,3, sans points ; volontaire = ses
  // points, × 2 si un chasseur est à moins de 10 m ; les deux remettent le compteur de l'obligatoire à zéro
  _provoquer(a, n, forcee) {
    const R = REGLAGES_PROP, P = PROVOCATIONS[n]; if (!P) return false;
    const p = a.pos;
    a.pp.provocRef = this.t; a.stats.provocs++;
    let pts = 0;
    if (!forcee) {
      a.pp.provocVolT = this.t; a.pp.derniere = n;
      const V = R.provocationVolontaire;
      const proche = this.acteurs.some((b) => b.role === 'chasseur' && b.vivant && b.corps && Math.hypot(b.pos.x - p.x, b.pos.y - p.y, b.pos.z - p.z) < V.procheChasseur);
      pts = P.points * (proche ? V.multiplicateur : 1);
    }
    this.evt('provocation', { a: a.id, id: P.id, n, x: p.x, y: p.y, z: p.z, forcee: !!forcee, rayon: P.rayon * (forcee ? R.provocation.rayonForcee : 1), duree: P.duree, points: pts });
    if (pts) this._points(a, pts, 'provocation');
    return true;
  }
  // LE SCANNER d'un chasseur : 3 charges, 8 s entre deux ; chaque prop vivant à moins de 12 m, au même niveau : sa direction
  // (± 20°, semée) et sa bande de distance (< 4, < 8, < 12 m) — jamais qui, jamais un meuble
  _actionsChasseur(a) {
    if (!a.cmd.scanner) return;
    if (this.phase !== 'traque') { if (this.phase === 'presentation' || this.phase === 'cachette') this._refuser(a, 'Le scanner, c’est pendant la traque'); return; }
    const S = REGLAGES_PROP.scanner;
    if (a.pp.scanCharges <= 0) { this._refuser(a, 'Scanner vide'); return; }
    if (this.t < a.pp.scanT - 1e-9) { this._refuser(a, 'Le scanner recharge'); return; }
    a.pp.scanCharges--; a.pp.scanT = this.t + S.entre;
    const res = [], nv = a.niveau(), l = a.cmd.lacet;
    for (const b of this.acteurs) {
      if (b.role !== 'prop' || !b.vivant || !b.corps || b.niveau() !== nv) continue;
      const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz);
      if (d >= S.portee) continue;
      const dir = angle(Math.atan2(-dx, -dz) + this.rng.range(-S.arc, S.arc) * DEG);
      res.push({ dir, rel: angle(dir - l), bande: d < S.bandes[0] ? 0 : d < S.bandes[1] ? 1 : 2 });
    }
    this.evt('scanner', { a: a.id, x: a.pos.x, y: a.pos.y, z: a.pos.z, portee: S.portee, resultats: res });
  }
  // LA TRAQUE, à chaque pas : la survie (+10 toutes les 30 s), la provocation obligatoire, la dernière minute
  _traque(dt) {
    const R = REGLAGES_PROP, n = Math.round(this.phaseT / PAS), nS = Math.round(R.survie / PAS);
    if (this._franchi(this.phaseDuree - R.derniereMinute)) this.annonce('DERNIÈRE MINUTE !', 'alerte');
    const vivants = this.acteurs.filter((a) => a.role === 'prop' && a.vivant);
    const I = this._intervalleProvoc(vivants.length);
    for (const a of vivants) {
      a.stats.survie += dt;
      if (n > 0 && n % nS === 0) this._points(a, R.points.survie30, 'survie');
      if (this.t - a.pp.provocRef >= I - 1e-9) this._provoquer(a, ID_FORCEE, true);
    }
  }
  // le spectateur (Haythem éliminé) : la caméra suit un coéquipier vivant ; saut, déguiser ou un clic : le suivant
  _spectateur() {
    const loc = this.local, c = loc.cmd;
    const L = this.acteurs.filter((b) => b !== loc && b.vivant && b.corps);
    if (!L.length) return;
    const E = L.filter((b) => b.role === loc.role), K = E.length ? E : L;
    const s = this.suivi;
    const suivant = c.saut || c.deguiser || (c.tir && !this._tirSpect);
    this._tirSpect = !!c.tir;
    if (!s || s === loc || !s.vivant || !K.includes(s)) this.suivi = K[0];
    else if (suivant) this.suivi = K[(K.indexOf(s) + 1) % K.length];
  }

  // ---------------------------------------------------------------- LES POINTS, LA FIN DE MANCHE, LA FIN
  _points(a, pts, raison) {
    if (!pts) return;
    a.stats.score += pts;
    this.evt('score', { equipe: a.equipe, valeur: a.stats.score, id: a.id, points: pts, raison });
  }
  _surTouche(e) {
    const c = this.acteurParId(e.cible);
    if (!c || c.role !== 'prop' || !c.pp || e.par < 0) return;
    const k = String(e.par);
    c.pp.deg[k] = (c.pp.deg[k] || 0) + e.degats;
  }
  _surElim(e) {
    const P = REGLAGES_PROP.points, c = this.acteurParId(e.cible), t = this.acteurParId(e.par);
    if (c && c.role === 'prop') {
      if (t && t !== c && t.role === 'chasseur') this._points(t, P.propElimine, 'elim');
      // l'aide : un AUTRE chasseur qui a fait au moins 25 % des dégâts du prop
      const D = c.pp ? c.pp.deg : {}, tot = Object.values(D).reduce((s, v) => s + v, 0);
      for (const k of Object.keys(D)) {
        const h = this.acteurParId(+k);
        if (h && h !== t && h.role === 'chasseur' && tot > 0 && D[k] >= P.aideSeuil * tot - 1e-9) this._points(h, P.aide, 'aide');
      }
      if (this.phase === 'traque' && this.acteurs.filter((a) => a.role === 'prop' && a.vivant).length === 1) this.annonce('DERNIER PROP !', 'alerte');
    }
    this._verifierFin();
  }
  _verifierFin() {
    if (this.phase !== 'traque' && this.phase !== 'cachette') return;
    if (!this.acteurs.some((a) => a.role === 'prop' && a.vivant)) this._finir('chasseurs');
    else if (!this.acteurs.some((a) => a.role === 'chasseur' && a.vivant)) this._finir('props');
  }
  // LA FIN D'UNE MANCHE : +50 aux props survivants (+25 au dernier, seul survivant), +50 à chaque membre de l'équipe gagnante
  _finir(g) {
    if (this.phase === 'revelation' || this.phase === 'fin') return;
    const P = REGLAGES_PROP.points;
    this.gagnantManche = g; this.resultats.push(g);
    const vivants = this.acteurs.filter((a) => a.role === 'prop' && a.vivant);
    for (const a of vivants) this._points(a, P.mancheSurvecue, 'manche');
    if (vivants.length === 1) this._points(vivants[0], P.dernierProp, 'dernier');
    for (const a of this.acteurs) if (a.role === (g === 'props' ? 'prop' : 'chasseur')) this._points(a, P.equipeGagnante, 'equipe');
    for (const a of this.acteurs) a.gele = true;
    this.phaseVers('revelation', REGLAGES_PROP.revelation);
    this.annonce(g === 'props' ? 'LES PROPS GAGNENT LA MANCHE' : 'LES CHASSEURS GAGNENT LA MANCHE', 'info');
  }
  // LA FIN DE LA PARTIE : le meilleur total gagne (`gagnant` : son id)
  _terminer() {
    const cl = this.acteurs.slice().sort((x, y) => y.stats.score - x.stats.score || x.id - y.id);
    this.gagnant = cl[0] ? cl[0].id : null;
    for (const a of this.acteurs) a.gele = true;
    this.phaseVers('fin', 0);
    this.annonce(cl[0] ? `FIN · ${cl[0].nom.toUpperCase()} GAGNE (${cl[0].stats.score} POINTS)` : 'FIN DE LA PARTIE', 'info');
    const points = {}; for (const a of cl) points[a.id] = a.stats.score;
    this.evt('fin', { gagnant: this.gagnant, scores: { points, manches: this.resultats.slice(), classement: cl.map((a) => a.id) } });
  }

  // ---------------------------------------------------------------- LES TIRS (§ 4.5.14)
  // personne ne tire hors de la traque ; un prop jamais
  peutTirer(a) { return !!a.vivant && !a.gele && !a.prop && a.role === 'chasseur' && this.phase === 'traque'; }
  // la VRAIE pose touchée par un rayon avant tMax (le registre, L-K) — une méthode à elle : un test y pose de vrais meubles
  // fictifs tant que le registre est vide (le socle n'a aucune étiquette)
  poseTouchee(ox, oy, oz, dx, dy, dz, tMax) { return toucherPoses(ox, oy, oz, dx, dy, dz, tMax); }
  // TROIS LISTES : le monde, les props vivants (leur boîte, par la balistique), les VRAIES poses jusqu'à t + 0,03 (la boîte
  // d'une pose enveloppe le meuble : touchée à 3 cm près de sa forme, c'est le meuble qui compte). Le prop avant la pose :
  // ses dégâts et le soin du tireur ; la pose avant (et déguisable) : « VRAI MEUBLE » ; sinon l'impact du monde. Tout DIFFÉRÉ.
  resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb) {
    const v = this.poseTouchee(ox, oy, oz, dx, dy, dz, res.t + 0.03);
    const vrai = v && v.pose && this._deguisable(v.pose.cle) ? v : null;
    if (res.acteur && !(vrai && vrai.t < res.t)) {
      const deg = degatsDe(fiche, res.t, res.zone) * (res.traverse ? 0.8 : 1);
      const E = { genre: 'degats', cible: res.acteur.id, degats: deg, par: tireur.id, arme: fiche.id, zone: res.zone, x: res.x, y: res.y, z: res.z, dx, dy, dz, plomb };
      this.differer(E);
      if (res.acteur.role === 'prop' && tireur.role === 'chasseur') this.differer({ genre: 'soin', cible: tireur.id, k: REGLAGES_PROP.soin, de: E });
      this._froles(tireur, ox, oy, oz, dx, dy, dz, res.t, res.acteur);
      return;
    }
    if (vrai) {
      const t = vrai.t, x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
      this.evt('impact', { x, y, z, nx: -dx, ny: -dy, nz: -dz, mat: 'meuble', forme: null, plomb });
      this.differer({ genre: 'faux', a: tireur.id, pose: vrai.pose.i, cle: vrai.pose.cle, seq: tireur.arsenal ? tireur.arsenal.tirSeq : 0,
        plombs: (fiche.plombs || 1) > 1, x, y, z });
      this._froles(tireur, ox, oy, oz, dx, dy, dz, t, null);
      return;
    }
    super.resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb);
  }
  // la balle qui frôle une tête (< 1,5 m) sans la toucher (la règle de Partie.resoudreTir)
  _froles(tireur, ox, oy, oz, dx, dy, dz, tMax, touche) {
    for (const b of this.acteurs) {
      if (b === tireur || b === touche || !b.vivant || !b.corps || b.role === 'cible') continue;
      b.oeil(_v);
      const px = _v.x - ox, py = _v.y - oy, pz = _v.z - oz, t = px * dx + py * dy + pz * dz;
      if (t <= 0 || t >= tMax) continue;
      const qx = ox + dx * t - _v.x, qy = oy + dy * t - _v.y, qz = oz + dz * t - _v.z;
      if (qx * qx + qy * qy + qz * qz < 2.25) this.evt('frole', { a: b.id, x: ox + dx * t, y: oy + dy * t, z: oz + dz * t });
    }
  }
  // les effets du pas (6b) ; puis une seule annonce par COUP (les 8 plombs d'un FP-12 : « VRAI MEUBLE −6 », pas huit), et
  // le chasseur à 0 PV éliminé — spectateur jusqu'à la fin de la manche
  appliquerEffets() {
    this._coups.clear();
    super.appliquerEffets();
    for (const K of this._coups.values()) {
      this.evt('faux', { a: K.a, pose: K.pose, pv: K.pv, n: K.n, x: K.x, y: K.y, z: K.z });
      this._mortParMeubles(K.h);
    }
    this._coups.clear();
  }
  appliquerEffet(e) {
    if (e.genre === 'degats') { const c = this.acteurParId(e.cible); e.applique = c ? this.infliger(c, e.degats, e) : 0; }
    else if (e.genre === 'soin') { const c = this.acteurParId(e.cible), pv = e.k * ((e.de && e.de.applique) || 0); if (c && pv > 0) this.soigner(c, pv, 'prop'); }
    else if (e.genre === 'faux') this._penaliser(e);
    else super.appliquerEffet(e);
  }
  // LA PÉNALITÉ (−3 par balle, −1 par plomb, −6 au plus par coup) et ses points (−2 par coup)
  _penaliser(e) {
    const R = REGLAGES_PROP.penalite, h = this.acteurParId(e.a);
    if (!h || !h.vivant) return;
    const cle = e.a + ':' + e.seq;
    let K = this._coups.get(cle);
    if (!K) {
      K = { a: e.a, h, pose: e.pose, pv: 0, n: 0, x: e.x, y: e.y, z: e.z };
      this._coups.set(cle, K);
      h.stats.rates++;
      this._points(h, REGLAGES_PROP.points.vraiMeuble, 'meuble');
    }
    const pv = Math.min(e.plombs ? R.plomb : R.meuble, R.maxParCoup - K.pv, h.vie);
    K.n++;
    if (pv <= 0) return;
    h.vie -= pv; K.pv += pv;
    h.derniereTouche = { t: this.t, par: h.id, arme: 'meuble' };
  }
  _mortParMeubles(h) {
    if (!h.vivant || h.vie > 1e-9) return;
    const p = h.pos;
    h.vie = 0; h.mourir(this.t); h.stats.morts++;
    this.evt('elim', { par: h.id, cible: h.id, arme: 'meuble', tete: false, x: p.x, y: p.y, z: p.z, ix: 0, iy: 0, iz: 0, assists: [], px: p.x, py: p.y + 1, pz: p.z });
  }

  // ---------------------------------------------------------------- L'ÉTAT (§ 4.7, plus les compteurs du prop hunt)
  etat() {
    const e = super.etat();
    // (par acteur, en plus de ses compteurs de manche : les colonnes du prop hunt au tableau — survie, provocations, vrais
    // meubles —, que l'état de base n'a pas : `st` n'y garde que éliminations, morts, aides, score)
    e.pp = { nManches: this.nManches, roleH0: this.roleH0, roleH: this.roleH, gagnantManche: this.gagnantManche, resultats: this.resultats.slice(),
      gagnant: this.gagnant, acteurs: this.acteurs.map((a) => ({ id: a.id, coeq: !!a.coequipier, sv: a.stats.survie, pr: a.stats.provocs, ra: a.stats.rates, ...copiePP(a.pp) })) };
    return e;
  }
  // L'ÉTAT RENDU : les rôles (corps, arme, cerveau) et les déguisements d'abord — le corps de meuble posé à la forme de
  // l'état ; un prop redevenu humain retrouve son Player —, puis le reste (Partie.appliquer), puis les compteurs
  appliquer(e) {
    const X = e.pp || null;
    if (X) { this.nManches = X.nManches; this.roleH0 = X.roleH0; this.roleH = X.roleH; this.gagnantManche = X.gagnantManche; this.resultats = X.resultats.slice(); this.gagnant = X.gagnant; }
    for (const s of e.acteurs || []) {
      const a = this.acteurParId(s.id); if (!a) continue;
      const q = X ? X.acteurs.find((k) => k.id === s.id) : null;
      if (s.role !== a.role) this._poserRole(a, s.role, { x: s.x, y: s.y, z: s.z, lacet: s.lacet }, { coequipier: !!(q && q.coeq) });
      if (s.prop && (!a.prop || a.prop.cle !== s.prop.cle)) { a.corps.pos.set(s.x, s.y, s.z); this._deguiser(a, s.prop.cle); }
      else if (!s.prop && a.prop) { retirerProp(this, a); if (a.joueur) a.changerCorps(a.joueur); }
    }
    super.appliquer(e);
    if (X) for (const q of X.acteurs) {
      const a = this.acteurParId(q.id); if (!a) continue;
      a.pp = copiePP(q); a.coequipier = !!q.coeq;
      Object.assign(a.stats, { survie: q.sv || 0, provocs: q.pr || 0, rates: q.ra || 0 });
    }
  }
  _detruire(a) {
    super._detruire(a);
    if (a._corpsProp && a._corpsProp !== a.corps) a._corpsProp.dispose?.();
  }

  // ---------------------------------------------------------------- LA ROUE DES PROVOCATIONS (saisie hors simulation)
  roueOuverte() { return this.roue.ouverte; }
  // le secteur d'un geste : 8, 0 en haut, sens horaire
  _secteur(x, y) { const a = Math.atan2(x, -y); return ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8; }
  mouvementSouris(dx, dy) {
    const R = this.roue; if (!R.ouverte) return;
    R.ax += dx; R.ay += dy;
    if (Math.hypot(R.ax, R.ay) >= 40) R.choix = this._secteur(R.ax, R.ay);
  }
  mouvementStick(x, y) { const R = this.roue; if (R.ouverte && Math.hypot(x, y) >= 0.5) R.choix = this._secteur(x, y); }
  lireExtra(input, game, cmd) {
    const R = this.roue, a = this.local;
    if (this.profil !== 'prop' || !a || !a.vivant) { R.ouverte = false; R.choix = -1; return; }
    if (input.down('provoquer')) { if (!R.ouverte) { R.ouverte = true; R.ax = 0; R.ay = 0; R.choix = -1; } }   // hors simulation
    else if (R.ouverte) { R.ouverte = false; if (R.choix >= 0) cmd.provoc = R.choix; }
    for (let n = 1; n <= 8; n++) if (input.pressed('provoc' + n)) cmd.provoc = n - 1;   // hors simulation
    if (input.pressed('provocVite')) cmd.provoc = 8;   // hors simulation
  }

  // ---------------------------------------------------------------- L'AFFICHAGE (une fois par image)
  // le calque « CLIQUE POUR JOUER » au début de la cachette (clavier-souris sans capture : la souris doit viser) ; puis
  // l'image de la base
  image(dt) {
    if (this.phase !== this._phaseVue && this.phase === 'cachette' && this.besoinCapture() && !this.capte()) this.attendreClic();
    super.image(dt);
    // Haythem prop encore HUMAIN se voit à la 3e personne : son corps posé une fois par image, si la cadence ne l'a pas fait
    // (celle du socle ne pose jamais l'acteur local, caché en vue à la 1re personne)
    const a = this.local;
    if (a && a.vivant && a.role === 'prop' && a.joueur && a.corps === a.joueur && !a.aPoser && dt > 0) a.joueur.poser(dt, true);
  }
  // les jauges de Haythem prop, 4 fois par seconde : DISCRÉTION (la crédibilité de sa place, la même formule que celle des
  // chasseurs bots) ; ŒIL (un chasseur qui le regarde : le soupçon de son cerveau s'il en dit un — L-O —, sinon la part du
  // regard : à ≤ 18 m, dans un cône de 50°, ligne de vue libre) ; le meuble visé (« E : devenir … »)
  _majJauges(a) {
    const J = this._jauges, P = a.prop, Lu = this.game.carte && this.game.carte.lumieres, p = a.pos;
    J.discretion = 0; J.oeil = 0; J.vise = null;
    if (a.role !== 'prop' || !a.vivant) return;
    if (P) {
      const Z = Lu && Lu.zoneEn ? Lu.zoneEn(p.x, p.z, p.y + 0.1) : null;
      J.discretion = clamp(credibilite(P.cle, p.x, p.y, p.z, P.cap, Z ? Z.id : null) || 0, 0, 1);
    }
    const B = this.balistique, cy = p.y + (P && P.T ? P.T.haut * 0.6 : 1.2);
    for (const h of this.acteurs) {
      if (h.role !== 'chasseur' || !h.vivant || !h.corps || h.gele) continue;
      let k = h.cerveau && h.cerveau.oeil ? h.cerveau.oeil(a) : null;
      if (k === null || k === undefined) {
        h.oeil(_v);
        const dx = p.x - _v.x, dy = cy - _v.y, dz = p.z - _v.z, d = Math.hypot(dx, dy, dz);
        if (d > 18 || d < 1e-6) continue;
        const l = h.cmd.lacet, t = h.cmd.tangage, ct = Math.cos(t);
        const ca = (dx * -Math.sin(l) * ct + dy * -Math.sin(t) + dz * -Math.cos(l) * ct) / d, ang = Math.acos(clamp(ca, -1, 1)) / DEG;
        if (ang > 50 || !B.vue(_v.x, _v.y, _v.z, p.x, cy, p.z)) continue;
        k = (1 - d / 18) * (1 - ang / 50);
      }
      J.oeil = Math.max(J.oeil, clamp(k, 0, 1));
    }
    if (this.phase === 'presentation' || this.phase === 'cachette' || this.phase === 'traque') {
      const v = viserMeuble(this, a, a.cmd.lacet, a.cmd.tangage);
      if (v && (v.acteur || this._deguisable(v.cle))) { const T = typeDe(v.cle); J.vise = { cle: v.cle, nom: T ? T.nom : v.cle }; }
    }
  }
  majHud() {
    super.majHud();
    const H = this.hud, a = this.local, R = REGLAGES_PROP, P = a && a.prop, ph = this.phase, t = this.t;
    H.nManches = this.nManches; H.chrono = this.chrono; H.scores = null;
    // le tableau : les colonnes du prop hunt (trouvés, survie, provocations, vrais meubles)
    for (const l of H.classement) {
      const b = this.acteurParId(l.id); if (!b) continue;
      l.trouves = b.stats.elims; l.survie = Math.round(b.stats.survie); l.provocs = b.stats.provocs; l.rates = b.stats.rates;
    }
    // les étiquettes des alliés : au-dessus du meuble, pas d'une tête d'élève
    for (const l of H.allies) { const b = this.acteurParId(l.id); if (b && b.prop && b.prop.T) l.y = b.corps.posAff.y + b.prop.T.haut + 0.35; }
    if (!a) { H.prop = null; return; }
    if (t - this._hudT >= 0.25 || t < this._hudT) { this._hudT = t; this._majJauges(a); }
    const vivants = this.acteurs.filter((b) => b.role === 'prop' && b.vivant);
    const I = this._intervalleProvoc(vivants.length);
    const scan = a.role === 'chasseur' ? this._dernier('scanner', a.id, R.scanner.duree) : null;
    const Z = ZONES_JEU[this.zone];
    H.prop = {
      forme: P ? P.cle : null, nomForme: P && P.T ? P.T.nom : a.role === 'prop' ? 'humain' : null,
      changements: P && ph === 'traque' ? Math.max(0, R.changements.traque - (P.changements || 0)) : R.changements.traque,
      changementsIllimites: ph !== 'traque', changementT: P && ph === 'traque' ? Math.max(0, a.pp.chgT + R.changements.entre - t) : 0,
      verrou: !!(P && P.verrou), fige: !!(P && P.fige),
      provocT: ph === 'traque' && a.role === 'prop' ? clamp(a.pp.provocRef + I - t, 0, I) : I, provocMax: I,
      provocPrete: ph === 'traque' && t - a.pp.provocVolT >= R.provocationVolontaire.recharge,
      discretion: this._jauges.discretion, oeil: this._jauges.oeil, vise: this._jauges.vise,
      scanner: { charges: a.pp.scanCharges, t: Math.max(0, a.pp.scanT - t), resultats: scan ? scan.resultats : [], age: scan ? t - scan.t : 0 },
      propsRestants: vivants.length, chasseursRestants: this.acteurs.filter((b) => b.role === 'chasseur' && b.vivant).length, role: a.role,
      roue: { ouverte: this.roue.ouverte, choix: this.roue.choix },
      cachette: a.role === 'chasseur' && (ph === 'cachette' || ph === 'presentation') ? {
        chrono: ph === 'cachette' ? this.chrono : this.dureesZone[0], zone: Z ? Z.nom : this.zone, manche: this.manche, nManches: this.nManches,
        roles: this.acteurs.map((b) => ({ id: b.id, nom: b.nom, role: b.role, vivant: b.vivant, score: b.stats.score })),
        astuces: this._astuces('chasseur') } : null,
      astuces: a.role === 'prop' && ph !== 'traque' ? this._astuces('prop') : null,
      manche: this.manche, nManches: this.nManches, zone: this.zone, zoneNom: Z ? Z.nom : this.zone, zoneRemplacee: this.zoneRemplacee,
      refus: this._refus && t - this._refus.t < 1.5 ? this._refus : null,
      revelation: ph === 'revelation' || ph === 'fin' ? vivants.map((b) => ({ id: b.id, nom: b.nom, cle: b.prop ? b.prop.cle : null,
        nomForme: b.prop && b.prop.T ? b.prop.T.nom : 'humain', x: b.corps.posAff.x, y: b.corps.posAff.y, z: b.corps.posAff.z })) : null,
      resultat: this.gagnantManche ? { gagnant: this.gagnantManche, manches: this.resultats.slice() } : null,
      aides: this.opts.aides, sons: this.opts.aides.voirSons ? this._sonsRecents(a) : [],
      spectateur: !a.vivant && this.suivi && this.suivi !== a ? { id: this.suivi.id, nom: this.suivi.nom } : null,
    };
  }
  // deux astuces, qui changent toutes les 8 s (décalées d'une manche à l'autre)
  _astuces(role) {
    const L = ASTUCES_PROP[role], i = Math.floor(this.phaseT / REGLAGES_PROP.astuces) + 3 * this.manche;
    return [L[(2 * i) % L.length], L[(2 * i + 1) % L.length]];
  }
  // le dernier événement `type` de l'acteur `id` dans les `age` dernières secondes
  _dernier(type, id, age) {
    for (let i = this._anneau.length - 1; i >= 0; i--) { const e = this._anneau[i]; if (this.t - e.t > age) break; if (e.type === type && e.a === id) return e; }
    return null;
  }
  // « Voir les sons » (l'aide de qui n'entend pas) : les provocations des 2 dernières secondes (pas les siennes) qu'il
  // ENTENDRAIT — dans leur rayon autour de l'acteur que suit la caméra, comme js/jeu/sons_prop.js ; `dalle` : d'un autre niveau
  _sonsRecents(a) {
    const out = [], s = this.suivi && this.suivi.corps ? this.suivi : a, o = s.pos, nv = niveauDe(o.y + 0.5);
    for (let i = this._anneau.length - 1; i >= 0; i--) {
      const e = this._anneau[i]; if (this.t - e.t > 2) break;
      if (e.type !== 'provocation' || e.a === a.id || Math.hypot(e.x - o.x, e.y - o.y, e.z - o.z) > (e.rayon || 30)) continue;
      out.push({ x: e.x, y: e.y, z: e.z, id: e.id, forcee: e.forcee, age: this.t - e.t, dalle: niveauDe(e.y + 0.5) !== nv });
    }
    return out;
  }
  // le prop (même encore humain) en orbite, aux chiffres du prop (§ 4.5.7 : pivot à max(0,5 ; 0,75 h), recul
  // clamp(1,4 + 1,6 × max(l, h, p), 2,0, 3,6)) ; Haythem éliminé qui suit un prop, de même (après la caméra de mort d'un
  // chasseur : pas à 1,4 m au-dessus d'un carton de 35 cm) ; le chasseur pendant la cachette : caméra fixe (Partie.camera)
  camera(dt, poser) {
    const a = this.local, s = this.suivi;
    let b = a && a.vivant && a.role === 'prop' ? a : null;
    if (!b && a && !a.vivant && s && s !== a && s.vivant && s.prop && s.corps && !(a.corps === a.joueur && this.t - a.mortT < 3)) b = s;
    if (b) {
      const T = b.prop && b.prop.T, S = T && T.taille;
      const o = S ? { distance: clamp(1.4 + 1.6 * Math.max(S.x, S.y, S.z), 2.0, 3.6), hauteur: Math.max(0.5, 0.75 * S.y) } : { distance: 2.6, hauteur: 1.4 };
      this.orbite.viser(b.corps, { ...o, tangage: b === a ? this.bornesTangage() : [-0.7, 1.25] });
      return this.orbite.poser(dt, poser);
    }
    return super.camera(dt, poser);
  }
  bornesTangage() { return this.local && this.local.role === 'prop' ? [-0.7, 1.25] : super.bornesTangage(); }
  get profil() { return this.local && this.local.role === 'prop' ? 'prop' : 'combat'; }
}

// (les compteurs de manche d'un acteur, copiés : nombres et un objet de nombres)
function copiePP(p) {
  if (!p) return { provocRef: 0, provocVolT: JAMAIS, derniere: 0, chgT: JAMAIS, defigeT: JAMAIS, scanCharges: 0, scanT: 0, deg: {} };
  return { provocRef: p.provocRef, provocVolT: p.provocVolT, derniere: p.derniere, chgT: p.chgT, defigeT: p.defigeT, scanCharges: p.scanCharges, scanT: p.scanT, deg: { ...p.deg } };
}
