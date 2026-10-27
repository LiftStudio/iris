// =====================================================================
//  LES RÈGLES DU COMBAT — lot L-E (23/10 ; spec §§ 2.3-2.5, 3.5, 3.8, 4.5.12) ; vague 3 : L-P (progression, séries)
// =====================================================================
// Trois modes, tous en solo contre des bots : MATCH À MORT PAR ÉQUIPES (SISR bleu contre SLAM orange, +1 par élimination,
// 40 ou 10:00), CHACUN POUR SOI (20 ou 10:00, podium des trois premiers), DOMINATION (trois anneaux — A le hall, B la pause
// du −1, C la pause du 1er —, un point d'équipe toutes les 3 s par anneau tenu, mi-temps à 75 ou 5:00 où les camps
// s'échangent, 150 ou 10:00). Une partie, seconde par seconde : PRÉSENTATION 3 s (la caméra file de derrière l'équipe
// jusque dans les yeux de Haythem, le bandeau du mode) → DÉCOMPTE 3 s (on regarde, on ne bouge pas ; au clavier-souris,
// le calque « CLIQUE POUR JOUER » l'attend : Partie.image) → MANCHE → (MI-TEMPS 5 s) → « VICTOIRE » 2,5 s → FIN (l'événement
// `fin` et son bilan : l'écran de fin de L-U s'y abonne).
// Ce que les règles tiennent, à chaque pas (étape 8 de Partie.pas, § 4.3.2) : la RÉGÉNÉRATION (4,0 s après le dernier
// dégât, puis 35 PV/s : 0 → 100 en 2,86 s), la PROTECTION d'apparition (1,2 s, posée par Acteur.reapparaitre, finie au
// premier tir), les RÉAPPARITIONS (3,0 s, 2,0 s en chacun pour soi ; Espace / A passe la caméra de mort au bout d'1 s) au
// point de `choisirApparition` (L-D) — jamais sous les yeux d'un ennemi : s'il l'est, un repli parmi les lieux de la zone,
// et à défaut on attend un quart de seconde —, le BARÈME (§ 3.8 : élimination 100, tête +25, couteau +25, au-delà de 30 m
// +50, assistance 50, capture 150, neutralisation 75, défense 50 ; suicide −1 élimination), UN CHARGEUR rendu au tireur à
// chaque élimination (§ 3.5, Arsenal.ajouterChargeur), les captures de la domination, la fin. Les dégâts, eux, ne passent
// que par Partie.infliger (la protection, le tir allié coupé, les assistances à 30 dégâts en 5 s y sont déjà).
// Tout est SIMULATION (fichier soumis à la pureté, § 4.1 règle 4) : le hasard est `partie.rng` ou un Rng semé par
// `melanger(graine, id, …)`, le temps `partie.t`, les entrées la commande ; l'affichage lit `partie.hud` et les événements
// (`phase`, `annonce`, `score`, `capture`, `apparition`, `fin`). Seule la caméra de la présentation (camera, une fois par
// image) est de l'affichage. L'état de ces règles entre dans `etat()` (bloc `fps`) : l'hôte autoritaire de demain.
//   opts : { mode: 'equipes'|'melee'|'domination', zone, allies, ennemis, difficulte, duree, scoreCible, classe, avatars, graine,
//            humain = true, campHumain = 'A', appareil ('pc'|'tel' : les effectifs d'un appareil, sinon celui-ci),
//            equipement (L-P : la classe de Haythem telle que son profil la lui donne — { classe, principale, accessoire,
//            secondaire, letale, tactique, atout } —, une DONNÉE de la partie : l'hôte de demain la reçoit telle quelle) }
// VAGUE 3, L-P (la progression) : les SÉRIES et les MÉDAILLES (js/jeu/series.js), les ARMES AU SOL (js/jeu/armes_au_sol.js),
// tenues ici à l'étape 8 ; l'équipement de Haythem (accessoire et atout : des fiches d'arme retouchées) ; ce que les atouts
// changent aux règles — Endurance (`deplacer` : la jauge du sprint tactique deux fois plus lente à vider, deux fois plus
// vite à remplir), Pas feutrés (le rayon d'audition posé sur chaque `pas`), Récupération (la régénération à 2,5 s) — ; le
// GILET (son armure prise AVANT la vie : `infliger`) ; la SENTINELLE (ses balles reçues : `resoudreTir`, un effet différé à
// elle) ; le bruit du SILENCIEUX lu par les cerveaux et la mini-carte (`ficheArme` rend la fiche du tireur pendant son `tir`).
import * as THREE from 'three';
import { Partie } from './partie.js';
import { departs, choisirApparition, ramenerPoint, POINTS_APPARITION } from './apparitions.js';
import { EQUIPES, ZONES_JEU, LIMITES, PIECES, BORNES_JEU } from './constantes.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { ARMES, CLASSES, degatsDe } from './armes.js';
import { TABLE_PORTES_FPS } from './monde_partie.js';
import { Rng, melanger } from './rng.js';
import { TELEPHONE } from '../appareil.js';
import { Series, SERIES, ATOUTS, RAYONS_PAS, FICHE_SENTINELLE, equiperArsenal, ficheEquipee } from './series.js';
import { ArmesAuSol } from './armes_au_sol.js';

// LES RÈGLES (§§ 3.5, 3.8 : valeurs de départ, réglées par la vague 3 et l'intégration)
export const REGLES_FPS = {
  presentation: 3, decompte: 3, miTemps: 5, annonceFin: 2.5,
  modes: {
    equipes: { nom: 'MATCH À MORT PAR ÉQUIPES', duree: 600, limite: { pc: 40, tel: 20 }, unite: 'ÉLIMINATIONS', reapparition: 3.0,
      effectifs: { pc: { allies: 3, ennemis: 4 }, tel: { allies: 1, ennemis: 2 } } },
    melee: { nom: 'CHACUN POUR SOI', duree: 600, limite: { pc: 20, tel: 20 }, unite: 'ÉLIMINATIONS', reapparition: 2.0,
      effectifs: { pc: { allies: 0, ennemis: 5 }, tel: { allies: 0, ennemis: 3 } } },
    domination: { nom: 'DOMINATION', duree: 600, limite: { pc: 150, tel: 150 }, unite: 'POINTS', reapparition: 3.0,
      effectifs: { pc: { allies: 3, ennemis: 4 }, tel: { allies: 1, ennemis: 2 } } },
  },
  bornes: { allies: [0, 4], ennemis: [1, 5] },     // (le menu : Alliés 0-4 / Ennemis 1-5 ; le plafond des bots : LIMITES)
  regenDelai: 4.0, regenPvS: 35,                   // (la protection d'apparition, 1,2 s, est posée par Acteur.reapparaitre)
  passer: 1.0,                                     // Espace / A : la caméra de mort passée au plus tôt 1 s après la mort
  attente: 0.25, attenteMax: 1.0,                  // aucun lieu sûr : on réessaie toutes les 0,25 s, 1 s au plus
  procheMin: 6, mortsRecentes: 5,                  // sûr = vu de personne et aucun ennemi à < 6 m ; une mort « récente » : < 5 s
  derniereMinute: 60,
  bareme: { elim: 100, tete: 25, couteau: 25, loin: 50, loinM: 30, assistance: 50, capture: 150, neutralisation: 75, defense: 50, suicide: -100 },
  // les classes des bots, tirées par la graine (§ 3.3) ; « Mixte » : alliés Réguliers, ennemis tirés entre Recrue et Aguerri
  classesBots: [['assaut', 0.4], ['infiltration', 0.3], ['defense', 0.2], ['tireur', 0.1]],
  mixte: { allies: 'regulier', ennemis: ['recrue', 'regulier', 'aguerri'] },
  difficultes: ['recrue', 'regulier', 'aguerri', 'veteran', 'mixte'],
};
// LA DOMINATION (§ 2.5) : les centres sont INDICATIFS, ramenés à la préparation (ramenerPoint, puis un disque libre de
// 1,5 m cherché autour : le lot R refait le −1, B peut tomber dans un meuble neuf)
export const DOMINATION = {
  points: [
    { id: 'A', nom: 'le hall', x: 14.88, y: 0, z: -3.12, r: 2.5 },
    { id: 'B', nom: 'la pause du −1', x: 9.38, y: -3.06, z: -9.37, r: 3 },
    { id: 'C', nom: 'la pause du 1er', x: 12.63, y: 3.5, z: -7.87, r: 3 },
  ],
  capture: 8, neutralisation: 4,                   // s, seul : un point neutre pris en 8 s ; un point adverse neutralisé en 4 s (puis 8 : 12 s)
  vitesses: [0, 1, 1.5, 2],                        // × à 1, 2, 3 et plus dans l'anneau
  retour: 0.5,                                     // une prise entamée puis abandonnée retombe à la moitié de sa vitesse
  tick: 3, hauteur: 1.6,                           // 1 point d'équipe toutes les 3 s par anneau tenu ; dans l'anneau = à ± 1,6 m de son sol
  ramener: { rayonMax: 3, degageMin: 1.5 }, defense: 1.0,   // (défense : le tireur ou sa victime à r + 1 m d'un anneau tenu)
  // le dégagement du centre : 1,5 m voulu (§ 2.5) ; à défaut le plus grand qu'on trouve à ≤ 3 m — mesuré le 23/10 sur la carte
  // du socle : la pause du −1 n'a nulle part 1,25 m libre (1,0 au point indicatif), la pause du 1er 1,25 m à 1,35 m du point
  libres: [1.5, 1.25, 1.0, 0.75],
};

const clampEntier = (v, [lo, hi]) => Math.max(lo, Math.min(hi, Math.round(Number.isFinite(+v) ? +v : lo)));
const nomCourt = (id) => { const f = ARMES[id]; return f ? f.nom.split(' «')[0] : (id || null); };

// LA CLASSE d'un bot, tirée par la graine : Assaut 40 %, Infiltration 30 %, Défense 20 %, Tireur 10 % (§ 3.3)
export function tirerClasseBot(graine, id) {
  let u = new Rng(melanger(graine >>> 0, id | 0, 0xc1a5)).next();
  for (const [c, p] of REGLES_FPS.classesBots) { if (u < p) return c; u -= p; }
  return 'assaut';
}
// LES EFFECTIFS d'une partie (le menu de L-U les montre ; § 3.10) : alliés 0-4, ennemis 1-5, au plus 9 bots sur PC (5 au
// téléphone), avertissement au-delà de 7 (3) ; chacun pour soi : `ennemis` = les bots
export function effectifs(mode, o = {}, tel = TELEPHONE) {
  const R = REGLES_FPS, M = R.modes[mode] || R.modes.equipes, E = M.effectifs[tel ? 'tel' : 'pc'], Lim = LIMITES[tel ? 'tel' : 'pc'];
  let allies = mode === 'melee' ? 0 : clampEntier(o.allies ?? E.allies, R.bornes.allies);
  let ennemis = clampEntier(o.ennemis ?? E.ennemis, mode === 'melee' ? [1, Lim.bots] : R.bornes.ennemis);
  while (allies + ennemis > Lim.bots) { if (ennemis > allies || allies === 0) ennemis--; else allies--; }
  return { allies, ennemis, bots: allies + ennemis, max: Lim.bots, conseil: Lim.conseil, avertissement: allies + ennemis > Lim.conseil };
}

const _o = new THREE.Vector3(), _f = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Vector3();

export class PartieFPS extends Partie {
  constructor(game, opts, deps) {
    super(game, opts, deps);
    const o = this.opts, R = REGLES_FPS;
    this.mode = o.mode === 'melee' || o.mode === 'domination' ? o.mode : 'equipes';
    this.id = this.mode;
    this.zone = o.zone || 'ecole';
    // (une zone inconnue, une zone du prop hunt, la domination hors de toute l'école : la partie est REFUSÉE, avec sa raison)
    const refus = PartieFPS.refus({ ...o, mode: this.mode, zone: this.zone });
    if (refus) throw new Error('[jeu] ' + refus);
    this.tel = o.appareil ? o.appareil === 'tel' : TELEPHONE;
    const M = R.modes[this.mode];
    this.nomMode = M.nom;
    this.duree = o.duree ?? M.duree;
    this.scoreCible = o.scoreCible ?? M.limite[this.tel ? 'tel' : 'pc'];
    this.miTempsCible = this.mode === 'domination' ? Math.ceil(this.scoreCible / 2) : null;
    this.reapparition = M.reapparition;
    this.dPresentation = o.presentation ?? R.presentation; this.dDecompte = o.decompte ?? R.decompte;
    this.effectifs = effectifs(this.mode, o, this.tel);
    this.scores = this.mode === 'melee' ? null : { A: 0, B: 0 };
    this.camp = o.campHumain === 'B' ? 'B' : 'A';
    this.cotes = { A: 'A', B: 'B' };              // le côté de départ de chaque équipe (échangé à la mi-temps)
    this.tJeu = 0; this.chrono = this.duree; this.gagnant = null; this.miTempsFaite = false; this.minuteDite = false;
    this.ext = new Map();                         // id → { serie, serieMax, suicides, tirsTouchants, captures, neutralisations, defenses }
    this.points = this.hud.points;                // (domination : le même tableau que hud.points — il entre dans l'état, § 4.7)
    this.mortLocal = null; this._lacet0 = null; this.replis = 0;   // (replis : les réapparitions où le point de choisirApparition n'était pas sûr)
    this._tireurs = new Set(); this._toucheurs = new Set(); this._zoneTouche = new Map(); this._candidats = null; this._mortsRecentes = [];
    // (L-P) les séries et les médailles, les armes au sol ; la fiche du tireur pendant son `tir` (ficheArme)
    this.series = new Series(this); this.armesSol = new ArmesAuSol(this); this._ficheTir = null;
  }
  // une partie qu'on ne lance pas, et pourquoi (null : elle se lance) — le menu peut griser avec la raison
  static refus(o = {}) {
    const zone = o.zone || 'ecole', Z = ZONES_JEU[zone], mode = o.mode || 'equipes';
    if (!REGLES_FPS.modes[mode]) return `mode de combat inconnu : « ${mode} »`;
    if (!Z) return `zone de jeu inconnue : « ${zone} »`;
    if (!Z.modes.includes('combat')) return `« ${Z.nom} » n’est pas une zone de combat`;
    if (mode === 'domination' && zone !== 'ecole') return `la domination ne se joue que sur toute l’école (zone « ${Z.nom} » refusée)`;
    if (o.difficulte && !REGLES_FPS.difficultes.includes(o.difficulte)) return `difficulté inconnue : « ${o.difficulte} »`;
    return null;
  }
  tablePortes() { return TABLE_PORTES_FPS; }

  // ---------------------------------------------------------------- la préparation : les anneaux de la domination
  async preparer(progres) {
    // (L-P : les modèles des armes au sol, de la sentinelle et du drone posés dans la scène AVANT sa compilation — leurs
    // programmes prêts avant la première image ; une fois par session)
    this.aff.progression?.preparer?.(this);
    await super.preparer(progres);
    if (this.mode === 'domination') this._poserAnneaux();
  }
  _poserAnneaux() {
    const D = DOMINATION;
    this.points.length = 0;
    for (const d of D.points) {
      let q = null;
      try { q = ramenerPoint(this.nav, d.x, d.y, d.z, D.ramener); } catch (e) { q = null; }
      q = this._degager(q || d, d);
      this.points.push({ id: d.id, nom: d.nom, x: q.x, y: q.y, z: q.z, r: d.r, possesseur: null, capture: { equipe: null, k: 0 }, tenu: 0,
        presents: { A: 0, B: 0 }, ecart: Math.round(Math.hypot(q.x - d.x, q.z - d.z) * 100) / 100, degage: q.degage ?? 0 });
    }
  }
  // le centre d'un anneau : un disque LIBRE au même sol, du plus grand dégagement de la liste (1,5 m, sinon 1,25, 1,0, 0,75)
  // trouvé à ≤ 3 m du point ramené, le plus proche de lui (en spirale, pas de 0,25 m) ; rien : le point tel quel
  _degager(q, d) {
    const C = this.game.collisions, Rm = DOMINATION.ramener.rayonMax;
    if (!C) return { x: q.x, y: q.y, z: q.z, degage: 0 };
    const sol = (x, z) => C.solEn(x, z, (q.y ?? d.y) + 0.3);
    const y0 = sol(q.x, q.z);
    // (F2 : à ≤ 3 m du point INDICATIF `d`, pas du point ramené — le vrai ramenerPoint de L-D rend un nœud « relevé » à ≤ 3 m
    // quand aucun n'a 1,5 m de dégagement, et la spirale autour de lui allait jusqu'à 6 m : B à 3,07 m, test 16)
    const pres = (x, z) => Math.hypot(x - d.x, z - d.z) <= Rm + 1e-9;
    for (const R of DOMINATION.libres) {
      if (Math.abs(y0 - d.y) < 0.3 && pres(q.x, q.z) && C.libre(q.x, q.z, R, y0)) return { x: q.x, y: y0, z: q.z, degage: R };
      for (let r = 0.25; r <= 2 * Rm + 1e-9; r += 0.25) {
        const n = Math.max(8, Math.round(2 * Math.PI * r / 0.25));
        for (let i = 0; i < n; i++) {
          const a = (i / n) * 2 * Math.PI, x = q.x + r * Math.cos(a), z = q.z + r * Math.sin(a);
          if (!pres(x, z)) continue;
          const y = sol(x, z);
          if (Math.abs(y - d.y) < 0.3 && C.libre(x, z, R, y)) return { x, y, z, degage: R };
        }
      }
    }
    return { x: q.x, y: y0, z: q.z, degage: 0 };
  }

  // ---------------------------------------------------------------- les acteurs
  // la fiche et le nom d'un bot : l'ami coché (dans l'ordre, un 2e « Gabriel 2 » au-delà de six), sinon Haythem cloné et
  // teint — avec le nom d'un ami tout de même (le fil des éliminations ne dit pas « Haythem [FA-24] Haythem »)
  _ficheBot(k) {
    const ids = this.opts.avatars || [], F = ids.length ? FICHES_BOTS.filter((f) => ids.includes(f.id)) : [];
    const L = F.length ? F : FICHES_BOTS, f = L[k % L.length], tour = Math.floor(k / L.length);
    const nom = f.nom + (tour ? ' ' + (tour + 1) : '');
    return F.length ? (tour ? { ...f, nom } : f) : { ...FICHE_HAYTHEM, nom };
  }
  _difficulte(id, allie) {
    const d = this.opts.difficulte || 'regulier';
    if (d !== 'mixte') return d;
    if (allie) return REGLES_FPS.mixte.allies;
    const L = REGLES_FPS.mixte.ennemis;
    return L[Math.floor(new Rng(melanger(this.graine, id, 0x6d69)).next() * L.length)];
  }
  _ext(a) {
    let x = this.ext.get(a.id);
    if (!x) { x = { serie: 0, serieMax: 0, suicides: 0, tirsTouchants: 0, captures: 0, neutralisations: 0, defenses: 0 }; this.ext.set(a.id, x); }
    return x;
  }
  // L'ÉQUIPEMENT DE HAYTHEM (L-P) : `opts.equipement` (son profil le lui donne, js/jeu/profil.js equipement) remis
  // d'aplomb contre les fiches — une arme inconnue revient à celle de la classe ; sans lui, la classe telle quelle
  // (une partie lancée par le harnais ou ?partie=, sans profil)
  equipementH() {
    const o = this.opts, classe = CLASSES[o.classe] ? o.classe : 'assaut', C = CLASSES[classe], e = o.equipement;
    if (!e || typeof e !== 'object') return { classe, dotation: C, accessoire: null, atout: null };
    const P = ARMES[e.principale] && ARMES[e.principale].emplacement === 'principale' ? e.principale : C.principale;
    const S = ARMES[e.secondaire] && ARMES[e.secondaire].emplacement === 'secondaire' ? e.secondaire : C.secondaire;
    const L = e.letale === null ? null : Array.isArray(e.letale) && e.letale[0] === 'frag' ? ['frag', Math.max(1, Math.min(2, e.letale[1] | 0))] : C.letale;
    const T = e.tactique === null ? null : Array.isArray(e.tactique) && e.tactique[0] === 'flash' ? ['flash', Math.max(1, Math.min(2, e.tactique[1] | 0))] : C.tactique;
    return { classe: e.classe || classe, dotation: { principale: P, secondaire: S, letale: L, tactique: T, couteau: true },
      accessoire: e.accessoire || null, atout: ATOUTS[e.atout] ? e.atout : null };
  }
  peupler() {
    const o = this.opts, humain = o.humain !== false, E = this.effectifs;
    const EH = this.equipementH();
    let id = 0, kBot = 0;
    const bot = (equipe, p, allie) => {
      const i = id++, f = this._ficheBot(kBot++);
      return this.ajouterActeur({ id: i, nom: f.nom, fiche: f, equipe, x: p.x, y: p.y, z: p.z, lacet: p.lacet, classe: tirerClasseBot(this.graine, i),
        cerveau: 'minimal', difficulte: this._difficulte(i, allie) });
    };
    if (this.mode === 'melee') {
      const n = E.ennemis + (humain ? 1 : 0), L = this._placerMelee(n);
      for (let k = 0; k < n; k++) {
        if (humain && k === 0) this.ajouterActeur({ id: id++, nom: 'Haythem', fiche: FICHE_HAYTHEM, equipe: null, local: true, humain: true, x: L[k].x, y: L[k].y, z: L[k].z,
          lacet: L[k].lacet, dotation: EH.dotation });
        else bot(null, L[k], false);
      }
    } else {
      const mon = humain ? this.camp : 'A', autre = mon === 'A' ? 'B' : 'A';
      const nMon = E.allies + (humain ? 1 : 0), nAutre = E.ennemis;
      const dM = departs(this.zone, this.cotes[mon], nMon, this.rng), dA = departs(this.zone, this.cotes[autre], nAutre, this.rng);
      for (let k = 0; k < nMon; k++) {
        if (humain && k === 0) this.ajouterActeur({ id: id++, nom: 'Haythem', fiche: FICHE_HAYTHEM, equipe: mon, local: true, humain: true, x: dM[k].x, y: dM[k].y, z: dM[k].z,
          lacet: dM[k].lacet, dotation: EH.dotation });
        else bot(mon, dM[k], true);
      }
      for (let k = 0; k < nAutre; k++) bot(autre, dA[k], false);
    }
    for (const a of this.acteurs) this._ext(a);
    if (this.local) this._lacet0 = this.local.cmd.lacet;
    // (L-P) l'accessoire et l'atout de Haythem ; la dotation de chacun gardée (une réapparition la rend : une arme ramassée
    // ne survit pas à la mort) ; les séries et les armes au sol à l'écoute
    if (this.local && this.local.arsenal) { this.local.atout = EH.atout; this.local.classe = EH.classe; equiperArsenal(this.local.arsenal, EH); }
    for (const a of this.acteurs) if (a.arsenal) a._fiches = a.arsenal.armes.slice();
    this._geler(true);
    this.chrono = this.duree;
    // (les règles écoutent la simulation : l'élimination, le tir — la protection finie —, la touche — la zone, la précision)
    this.sur('elim', (e) => this._elim(e));
    this.sur('tir', (e) => {
      this._tireurs.add(e.a);
      const a = this.acteurParId(e.a);
      if (a && a.protegeT > this.t) a.protegeT = this.t;
    });
    // (F2 relecture : un tir qui touche — la touche d'une frag ou d'un couteau au même pas ne fait pas un tir touchant)
    this.sur('touche', (e) => { if (!e.arme || (ARMES[e.arme] && ARMES[e.arme].rpm)) this._toucheurs.add(e.par); this._zoneTouche.set(e.cible, e.zone); });
    // (L'APPARITION VUE — affichage, comme Partie._elimVue : la poupée de chiffon rendue, le corps remontré ; le même Player
    // revient, sa poupée encore au sol en habillage Militaire — 4 s contre 3,0 s de réapparition — s'efface d'un coup)
    this.sur('apparition', (e) => {
      const a = this.acteurParId(e.a); if (!a) return;
      if (a.poupee) { a.poupee.liberer?.(); a.poupee = null; }
      if (a.joueur && a.joueur.mesh) a.joueur.mesh.visible = !a.local;
    });
    this.series.brancher(); this.armesSol.brancher();
    this.phaseVers('presentation', this.dPresentation);
    this.annonce(this._bandeau(), 'presentation');
  }
  _bandeau() {
    const M = REGLES_FPS.modes[this.mode], Z = ZONES_JEU[this.zone], mn = Math.floor(this.duree / 60), s = Math.round(this.duree % 60);
    const camps = this.mode === 'melee' ? '' : ` · ${EQUIPES.A.nom} CONTRE ${EQUIPES.B.nom}`;
    return `${M.nom}${camps} · ${this.scoreCible} ${M.unite} · ${mn}:${String(s).padStart(2, '0')} · ${Z.nom.toUpperCase()}`;
  }
  // tout le monde figé (présentation, décompte, mi-temps, fin) ou rendu au jeu : le corps ne bouge pas, l'arme ne tire pas
  _geler(v) { for (const a of this.acteurs) { a.gele = v; if (a.arsenal) a.arsenal.bloque = v; } }

  // ---------------------------------------------------------------- les lieux : départs du chacun pour soi, repli des réapparitions
  // les lieux de la zone (les points de carte_monde § 8, les départs des camps, et leurs voisins à 1,5 m), libres et au
  // même sol, dans la rue bornée ; calculés une fois par partie
  candidats() {
    if (this._candidats) return this._candidats;
    const Z = ZONES_JEU[this.zone] || ZONES_JEU.ecole, P = new Set(Z.pieces === '*' ? PIECES : Z.pieces), C = this.game.collisions, B = BORNES_JEU;
    const base = POINTS_APPARITION.filter((p) => P.has(p.zone)).map((p) => [p.x, p.y, p.z]);
    for (const k of ['A', 'B']) for (const d of (Z.departs && Z.departs[k]) || []) base.push(d);
    const L = [];
    for (const [x0, y0, z0] of base) {
      for (const [ox, oz] of [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) {
        const x = x0 + ox, z = z0 + oz;
        if (x < B.xMin + 0.3 || x > B.xMax - 0.3 || z < B.zMin + 0.3 || z > B.zMax - 0.3) continue;
        let y = y0;
        if (C) { y = C.solEn(x, z, y0 + 0.3); if (Math.abs(y - y0) > 0.3 || !C.libre(x, z, 0.3, y)) continue; }
        if (L.some((q) => Math.hypot(q.x - x, q.z - z) < 1.0 && Math.abs(q.y - y) < 1)) continue;
        L.push({ x, y, z });
      }
    }
    // (le regard : vers le milieu des lieux de la zone, au même niveau s'il y en a)
    for (const q of L) {
      const M = L.filter((r) => Math.abs(r.y - q.y) < 1.5), mx = M.reduce((s, r) => s + r.x, 0) / M.length, mz = M.reduce((s, r) => s + r.z, 0) / M.length;
      q.lacet = Math.hypot(mx - q.x, mz - q.z) > 1 ? Math.atan2(-(mx - q.x), -(mz - q.z)) : 0;
    }
    this._candidats = L;
    return L;
  }
  // chacun pour soi, au départ (§ 2.4 : « au point le plus éloigné de son plus proche ennemi, vu de personne ») : chacun au
  // lieu le plus loin de ceux déjà placés, parmi ceux qu'aucun d'eux ne voit s'il en reste (le premier tiré par la graine)
  _placerMelee(n) {
    const L = this.candidats(), out = [], B = this.balistique;
    if (!L.length) { for (let k = 0; k < n; k++) out.push({ x: 14.88 + (k % 3) * 1.5, y: 0, z: -3.12 + Math.floor(k / 3) * 1.5, lacet: 0 }); return out; }
    // (vu d'un lieu déjà pris : de son œil debout à la tête ou au buste du nouveau)
    const vu = (q) => out.some((p) => B.vue(p.x, p.y + 1.62, p.z, q.x, q.y + 1.5, q.z) || B.vue(p.x, p.y + 1.62, p.z, q.x, q.y + 0.9, q.z));
    for (let k = 0; k < n; k++) {
      let best = null;
      if (!out.length) best = L[this.rng.int(L.length)];
      else {
        // (les lieux libres du plus loin au plus proche ; le premier qu'aucun placé ne voit, sinon le plus loin)
        const D = [];
        for (let i = 0; i < L.length; i++) {
          const q = L[i]; let d = Infinity;
          for (const p of out) d = Math.min(d, Math.hypot(q.x - p.x, (q.y - p.y) * 2, q.z - p.z));
          if (d >= 1.0) D.push([d, i]);
        }
        D.sort((u, v) => v[0] - u[0] || u[1] - v[1]);
        const j = D.find(([, i]) => !vu(L[i]));
        best = L[(j || D[0] || [0, k % L.length])[1]];
      }
      out.push({ x: best.x, y: best.y, z: best.z, lacet: best.lacet });
    }
    return out;
  }
  // un lieu VU d'un ennemi vivant (sa tête ou son buste, de l'œil de l'ennemi, à ≤ 60 m)
  _vu(a, p) {
    const B = this.balistique, h = (a.h || 1.73) / 1.73;
    for (const b of this.acteurs) {
      if (b === a || !b.vivant || !b.corps || b.role === 'cible' || !this.ennemis(b, a)) continue;
      b.oeil(_o);
      if (Math.hypot(_o.x - p.x, _o.y - p.y, _o.z - p.z) > 60) continue;
      if (B.vue(_o.x, _o.y, _o.z, p.x, p.y + 1.5 * h, p.z) || B.vue(_o.x, _o.y, _o.z, p.x, p.y + 0.9 * h, p.z)) return true;
    }
    return false;
  }
  // un lieu SÛR : vu de personne, et aucun ennemi à moins de 6 m (la hauteur comptée double : un autre étage est loin)
  _sur(a, p) {
    for (const b of this.acteurs) {
      if (b === a || !b.vivant || !b.corps || b.role === 'cible' || !this.ennemis(b, a)) continue;
      if (Math.hypot(b.pos.x - p.x, (b.pos.y - p.y) * 2, b.pos.z - p.z) < REGLES_FPS.procheMin) return false;
    }
    return !this._vu(a, p);
  }
  // OÙ RÉAPPARAÎTRE : le point de choisirApparition (L-D) s'il est SÛR ; sinon (le repli, compté) le meilleur lieu sûr de la
  // zone selon le § 3.8 — en équipe, note = proximité des alliés (≤ 15 m) − 3 × danger (ennemis à ≤ 20 m, morts récentes à
  // ≤ 8 m), au départage le plus loin du plus proche ennemi ; chacun pour soi : le plus loin du plus proche ennemi, moins
  // les morts récentes — ; rien de sûr : on réessaie dans 0,25 s, et au bout d'1 s le meilleur lieu que personne ne voit
  _apparition(a) {
    const R = REGLES_FPS;
    let p = null;
    try { p = choisirApparition(this, a); } catch (e) { p = null; }
    if (p && this._sur(a, p)) return p;
    this.replis++;                                // (à F2, avec les apparitions de L-D, il ne devrait presque plus servir)
    const L = this.candidats(), notes = [], melee = this.mode === 'melee';
    for (const q of L) {
      let dE = Infinity, nE = 0, nA = 0, nM = 0;
      for (const b of this.acteurs) {
        if (b === a || !b.vivant || !b.corps || b.role === 'cible') continue;
        const d = Math.hypot(b.pos.x - q.x, (b.pos.y - q.y) * 2, b.pos.z - q.z);
        if (this.ennemis(a, b)) { dE = Math.min(dE, d); if (d <= 20) nE++; } else if (d <= 15) nA++;
      }
      for (const m of this._mortsRecentes) if (this.t - m.t <= R.mortsRecentes && Math.hypot(m.x - q.x, (m.y - q.y) * 2, m.z - q.z) <= 8) nM++;
      const n = melee ? Math.min(dE, 40) - 3 * nM : Math.min(nA, 3) - 3 * (nE + nM) + 0.05 * Math.min(dE, 40);
      notes.push({ q, n });
    }
    notes.sort((u, v) => v.n - u.n);
    for (const { q } of notes) if (this._sur(a, q)) return q;
    if (this.t - (a._attenteDepuis ?? this.t) < R.attenteMax - 1e-9) return null;
    for (const { q } of notes) if (!this._vu(a, q)) return q;
    return p || (notes[0] && notes[0].q) || null;
  }
  _reapparaitre(a) {
    if (a._attenteDepuis === undefined) a._attenteDepuis = this.t;
    const p = this._apparition(a);
    if (!p) { a.reapparitionT = this.t + REGLES_FPS.attente; return false; }
    delete a._attenteDepuis;
    this._rendreDotation(a);
    a.reapparaitre(p.x, p.y, p.z, p.lacet ?? 0, this.t);
    this.series.remettre(a);                      // (L-P : le gilet ne survit pas à la vie)
    a.gele = false; if (a.arsenal) a.arsenal.bloque = false;
    if (a.local) { this.game.camYaw = p.lacet ?? 0; this.game.camPitch = 0; this.mortLocal = null; }
    a.cerveau?.reapparu?.();
    this.evt('apparition', { a: a.id, x: p.x, y: p.y, z: p.z });
    return true;
  }

  // ---------------------------------------------------------------- les éliminations et le barème (§ 3.8)
  _valeur(a) { return this.mode === 'melee' ? this._net(a) : a.equipe && this.scores ? this.scores[a.equipe] : 0; }
  _net(a) { return a.stats.elims - this._ext(a).suicides; }
  _elim(e) {
    const R = REGLES_FPS, B = R.bareme;
    const tireur = e.par >= 0 ? this.acteurParId(e.par) : null, cible = this.acteurParId(e.cible);
    if (!cible || cible.role === 'cible') return;
    cible.reapparitionT = this.t + this.reapparition;
    const xc = this._ext(cible); xc.serie = 0;
    // (où l'on meurt : un lieu dangereux pour réapparaître pendant 5 s)
    this._mortsRecentes.push({ x: cible.pos.x, y: cible.pos.y, z: cible.pos.z, t: this.t });
    while (this._mortsRecentes.length && this.t - this._mortsRecentes[0].t > REGLES_FPS.mortsRecentes) this._mortsRecentes.shift();
    const dist = tireur && tireur !== cible ? Math.hypot(tireur.pos.x - cible.pos.x, tireur.pos.y - cible.pos.y, tireur.pos.z - cible.pos.z) : 0;
    if (cible.local) {
      this.mortLocal = { tueur: tireur && tireur !== cible ? tireur.nom : null, tueurId: e.par, arme: nomCourt(e.arme), armeId: e.arme || null,
        zone: this._zoneTouche.get(cible.id) || (e.tete ? 'tete' : null), distance: Math.round(dist * 10) / 10,
        vieTueur: tireur && tireur !== cible ? Math.ceil(tireur.vie) : 0, t: this.t, passerT: this.t + R.passer, suicide: !!tireur && tireur === cible };
    }
    // (hors de la manche — une grenade qui explose pendant la mi-temps ou après le verdict — : le score ne bouge plus)
    if (this.phase !== 'manche') return;
    // LE SUICIDE (sa propre grenade) : −1 élimination — au compte du chacun pour soi, au score de son équipe, et 100 points
    if (tireur === cible) {
      xc.suicides++;
      cible.stats.score += B.suicide;
      if (this.mode === 'equipes' && cible.equipe) this.scores[cible.equipe] = Math.max(0, this.scores[cible.equipe] - 1);
      this.evt('score', { equipe: cible.equipe, valeur: this._valeur(cible), id: cible.id, points: B.suicide, raison: 'suicide' });
      return;
    }
    if (!tireur) return;                          // (une mort sans tireur : ni crédit ni pénalité)
    // (§ 3.5 : un chargeur de réserve de l'arme principale, plafonné — L-P le GARDE avec les armes au sol : elles ne durent
    // que 30 s, là où l'on a tué, et une élimination à 25 m ne passe pas sur le corps ; une bonne vie ne tombe toujours pas
    // à sec. La sentinelle, elle, ne rend pas de chargeur et ne compte pas dans la série, comme dans Call of Duty)
    const sent = e.arme === 'sentinelle';
    if (!sent) tireur.arsenal?.ajouterChargeur();
    const xt = this._ext(tireur);
    if (!sent) { xt.serie++; xt.serieMax = Math.max(xt.serieMax, xt.serie); }
    // (relecture : une élimination de la sentinelle n'est pas « au-delà de 30 m » parce que Haythem est loin d'elle)
    const couteau = e.arme === 'couteau', loin = !sent && dist > B.loinM, defense = this._defense(tireur, cible);
    const pts = B.elim + (e.tete ? B.tete : 0) + (couteau ? B.couteau : 0) + (loin ? B.loin : 0) + (defense ? B.defense : 0);
    if (defense) xt.defenses++;
    tireur.stats.score += pts;
    if (this.mode === 'equipes' && tireur.equipe) this.scores[tireur.equipe]++;
    this.evt('score', { equipe: tireur.equipe, valeur: this._valeur(tireur), id: tireur.id, points: pts, raison: 'elim', tete: !!e.tete, couteau, loin, defense });
    for (const id of e.assists || []) {
      if (id === cible.id || id === tireur.id) continue;
      const b = this.acteurParId(id); if (!b) continue;
      b.stats.score += B.assistance;
      this.evt('score', { equipe: b.equipe, valeur: this._valeur(b), id: b.id, points: B.assistance, raison: 'assistance' });
    }
  }
  // la DÉFENSE : une élimination dont le tireur ou la victime est dans un anneau que l'équipe du tireur tient
  _defense(tireur, cible) {
    if (this.mode !== 'domination' || !tireur.equipe) return false;
    for (const P of this.points) {
      if (P.possesseur !== tireur.equipe) continue;
      for (const a of [tireur, cible]) if (Math.hypot(a.pos.x - P.x, a.pos.z - P.z) <= P.r + DOMINATION.defense && Math.abs(a.pos.y - P.y) < DOMINATION.hauteur) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- LES RÈGLES, à chaque pas (étape 8)
  regles(dt) {
    switch (this.phase) {
      case 'presentation': if (this.phaseT >= this.phaseDuree - 1e-9) this.phaseVers('decompte', this.dDecompte); break;
      case 'decompte': if (this.phaseT >= this.phaseDuree - 1e-9) this._go(); break;
      case 'manche': this._manche(dt); break;
      case 'mi_temps': if (this.phaseT >= this.phaseDuree - 1e-9) this._reprise(); break;
      case 'fin_manche': if (this.phaseT >= this.phaseDuree - 1e-9) this._fin(); break;
      default: break;
    }
    // (la précision : un tir du pas qui a touché quelqu'un — les plombs d'une même cartouche ne comptent qu'une fois)
    for (const id of this._tireurs) if (this._toucheurs.has(id)) { const a = this.acteurParId(id); if (a) this._ext(a).tirsTouchants++; }
    this._tireurs.clear(); this._toucheurs.clear();
  }
  _go() {
    this._geler(false);
    this.phaseVers('manche', Math.max(0, this.duree - this.tJeu));
    this.annonce('GO !', 'go');
  }
  _manche(dt) {
    const R = REGLES_FPS;
    this.tJeu += dt;
    this.chrono = Math.max(0, this.duree - this.tJeu);
    for (const a of this.acteurs) {
      if (a.role === 'cible') continue;
      if (a.vivant) {
        // LA RÉGÉNÉRATION : 4,0 s après le dernier dégât (2,5 s avec Récupération, L-P), 35 PV/s
        const delai = a.atout === 'recuperation' ? ATOUTS.recuperation.regenDelai : R.regenDelai;
        if (a.vie < a.vieMax && this.t - (a.derniereTouche ? a.derniereTouche.t : -Infinity) >= delai - 1e-9) a.vie = Math.min(a.vieMax, a.vie + R.regenPvS * dt);
        continue;
      }
      // LA RÉAPPARITION (Espace / A : la caméra de mort passée, au plus tôt 1 s après la mort)
      if (!a.reapparitionT) continue;
      if (a.local && a.cmd.saut && this.t - a.mortT >= R.passer - 1e-9 && a.reapparitionT > this.t) a.reapparitionT = this.t;
      if (this.t >= a.reapparitionT - 1e-9) this._reapparaitre(a);
    }
    if (this.mode === 'domination') this._dominer(dt);
    // (L-P) les séries lancées (drones, sentinelles) et les armes au sol
    this.series.pas(dt); this.armesSol.pas(dt);
    if (!this.minuteDite && this.duree > 2 * R.derniereMinute && this.chrono <= R.derniereMinute) { this.minuteDite = true; this.annonce('DERNIÈRE MINUTE', 'info'); }
    // LA FIN : au score ou au temps ; la MI-TEMPS de la domination : à la moitié du score ou du temps
    let fin = this.chrono <= 1e-9;
    if (this.scores) { if (this.scores.A >= this.scoreCible || this.scores.B >= this.scoreCible) fin = true; }
    else if (this.acteurs.some((a) => a.role !== 'cible' && this._net(a) >= this.scoreCible)) fin = true;
    if (fin) return this._finir();
    if (this.mode === 'domination' && !this.miTempsFaite && (Math.max(this.scores.A, this.scores.B) >= this.miTempsCible || this.tJeu >= this.duree / 2 - 1e-9)) this._miTemps();
  }

  // ---------------------------------------------------------------- LA DOMINATION (§ 2.5)
  _dominer(dt) {
    const D = DOMINATION, V = D.vitesses;
    for (const P of this.points) {
      const n = { A: 0, B: 0 }, dedans = { A: [], B: [] };
      for (const a of this.acteurs) {
        if (!a.vivant || !a.corps || a.role === 'cible' || (a.equipe !== 'A' && a.equipe !== 'B')) continue;
        if (Math.hypot(a.pos.x - P.x, a.pos.z - P.z) <= P.r && Math.abs(a.pos.y - P.y) < D.hauteur) { n[a.equipe]++; dedans[a.equipe].push(a); }
      }
      P.presents = n;
      const seul = n.A > 0 && n.B === 0 ? 'A' : n.B > 0 && n.A === 0 ? 'B' : null, K = P.capture;
      const T = P.possesseur ? D.neutralisation : D.capture;
      if (n.A > 0 && n.B > 0) { /* disputé : figé */ }
      else if (seul && seul !== P.possesseur) {
        const v = V[Math.min(3, n[seul])];
        if (K.equipe && K.equipe !== seul) {
          // (la prise entamée par l'autre équipe se défait d'abord)
          K.k -= dt * v / T;
          if (K.k <= 1e-9) { K.k = 0; K.equipe = null; }
        } else {
          K.equipe = seul; K.k += dt * v / T;
          if (K.k >= 1 - 1e-9) this._basculer(P, seul, dedans[seul]);
        }
      } else if (K.k > 0) {
        // les tenants défendent (à leur vitesse), personne : la prise retombe (à la moitié)
        const v = seul ? V[Math.min(3, n[seul])] : D.retour;
        K.k -= dt * v / T;
        if (K.k <= 1e-9) { K.k = 0; K.equipe = null; }
      }
      // les points tenus : 1 point d'équipe toutes les 3 s, par anneau
      if (P.possesseur) {
        P.tenu += dt;
        while (P.tenu >= D.tick - 1e-9) {
          P.tenu -= D.tick;
          this.scores[P.possesseur]++;
          this.evt('score', { equipe: P.possesseur, valeur: this.scores[P.possesseur], id: null, points: 1, raison: 'point', point: P.id });
        }
      }
    }
  }
  // un anneau qui bascule : neutralisé (il était à l'autre équipe : la prise continue, 8 s de plus) ou pris
  _basculer(P, eq, dedans) {
    const B = REGLES_FPS.bareme, mon = this.local && this.local.equipe;
    if (P.possesseur) {
      const avant = P.possesseur;
      P.possesseur = null; P.tenu = 0; P.capture = { equipe: eq, k: 0 };
      for (const a of dedans) { a.stats.score += B.neutralisation; this._ext(a).neutralisations++; this.evt('score', { equipe: eq, valeur: this.scores[eq], id: a.id, points: B.neutralisation, raison: 'neutralisation', point: P.id }); }
      this.evt('capture', { point: P.id, equipe: eq, etat: 'neutralise' });
      if (mon) this.annonce(avant === mon ? `${P.id} PERDUE` : `${P.id} NEUTRALISÉE`, avant === mon ? 'mal' : 'bon');
      else this.annonce(`${P.id} NEUTRALISÉE PAR LES ${EQUIPES[eq].nom}`, 'info');
    } else {
      P.possesseur = eq; P.tenu = 0; P.capture = { equipe: null, k: 0 };
      for (const a of dedans) { a.stats.score += B.capture; this._ext(a).captures++; this.evt('score', { equipe: eq, valeur: this.scores[eq], id: a.id, points: B.capture, raison: 'capture', point: P.id }); }
      this.evt('capture', { point: P.id, equipe: eq, etat: 'prise' });
      if (mon) this.annonce(eq === mon ? `${P.id} PRISE` : `${P.id} PRISE PAR LES ${EQUIPES[eq].nom}`, eq === mon ? 'bon' : 'mal');
      else this.annonce(`${P.id} PRISE PAR LES ${EQUIPES[eq].nom}`, 'info');
    }
  }
  // LA MI-TEMPS : 5 s figées, les anneaux rendus neutres ; à la reprise les camps s'échangent (l'école n'est pas symétrique)
  _miTemps() {
    this.miTempsFaite = true;
    this._geler(true);
    for (const P of this.points) {
      const avait = P.possesseur;
      P.possesseur = null; P.tenu = 0; P.capture = { equipe: null, k: 0 };
      if (avait) this.evt('capture', { point: P.id, equipe: null, etat: 'neutre' });
    }
    this.series.finirTout();                      // (L-P relecture : drones et sentinelles ne passent pas la mi-temps)
    this.phaseVers('mi_temps', REGLES_FPS.miTemps);
    this.annonce(`MI-TEMPS · ${EQUIPES.A.nom} ${this.scores.A} – ${this.scores.B} ${EQUIPES.B.nom} · LES CAMPS S’ÉCHANGENT`, 'mi_temps');
  }
  _reprise() {
    this.cotes = { A: this.cotes.B, B: this.cotes.A };
    for (const eq of ['A', 'B']) {
      const L = this.acteurs.filter((a) => a.equipe === eq && a.role !== 'cible');
      const D = departs(this.zone, this.cotes[eq], L.length, this.rng);
      L.forEach((a, k) => {
        const p = D[k];
        this._rendreDotation(a);
        a.reapparaitre(p.x, p.y, p.z, p.lacet, this.t);
        this.series.remettre(a);
        delete a._attenteDepuis;
        if (a.local) { this.game.camYaw = p.lacet; this.game.camPitch = 0; this.mortLocal = null; }
        a.cerveau?.reapparu?.();
        this.evt('apparition', { a: a.id, x: p.x, y: p.y, z: p.z });
      });
    }
    this._geler(false);
    this.phaseVers('manche', Math.max(0, this.duree - this.tJeu));
    this.annonce('2E MI-TEMPS · GO !', 'go');
  }

  // ---------------------------------------------------------------- LA FIN : « VICTOIRE » 2,5 s, puis l'événement `fin` et son bilan
  _finir() {
    const cl = this._classement();
    if (this.scores) this.gagnant = this.scores.A === this.scores.B ? null : this.scores.A > this.scores.B ? 'A' : 'B';
    else this.gagnant = cl[0] ? cl[0].id : null;
    this._geler(true);
    this.phaseVers('fin_manche', REGLES_FPS.annonceFin);
    this.annonce(this._verdict(cl), 'fin');
  }
  _verdict(cl) {
    const a = this.local;
    if (this.scores) {
      if (this.gagnant === null) return 'ÉGALITÉ';
      if (a && a.equipe) return a.equipe === this.gagnant ? 'VICTOIRE' : 'DÉFAITE';
      return `VICTOIRE DES ${EQUIPES[this.gagnant].nom}`;
    }
    if (!a) { const v = this.acteurParId(this.gagnant); return v ? `${v.nom.toUpperCase()} GAGNE` : 'FIN'; }
    const r = cl.findIndex((c) => c.id === a.id) + 1;
    return r === 1 ? 'VICTOIRE · 1ER' : r <= 3 ? `PODIUM · ${r}E` : `DÉFAITE · ${r}E`;
  }
  _fin() {
    this.phaseVers('fin', 0);
    this.evt('fin', { gagnant: this.gagnant, scores: this.scores ? { ...this.scores } : null, ...this.bilan() });
  }
  // LE BILAN (l'écran de fin de L-U ; la vague 3 y ajoute médailles et XP) : le classement, le podium, et Haythem
  bilan() {
    const cl = this._classement(), a = this.local;
    const moi = a ? cl.find((c) => c.id === a.id) : null;
    return { mode: this.mode, zone: this.zone, duree: this.tJeu, verdict: this._verdict(cl), classement: cl, podium: cl.slice(0, 3).map((c) => c.id),
      local: moi ? { ...moi, rang: cl.indexOf(moi) + 1 } : null };
  }
  _classement() {
    const L = this.acteurs.filter((b) => b.role !== 'cible').map((b) => {
      const x = this._ext(b), s = b.stats;
      return { id: b.id, nom: b.nom, equipe: b.equipe, elims: s.elims, morts: s.morts, assists: s.assists, score: s.score, role: b.role, vivant: b.vivant,
        av: b.fiche ? b.fiche.id || null : null, tetes: s.tetes, suicides: x.suicides, net: s.elims - x.suicides, serie: x.serie, serieMax: x.serieMax,
        ratio: Math.round(s.elims / Math.max(1, s.morts) * 100) / 100, tirs: s.tirs, precision: s.tirs ? Math.round(x.tirsTouchants / s.tirs * 1000) / 1000 : 0,
        captures: x.captures, neutralisations: x.neutralisations, defenses: x.defenses };
    });
    if (this.mode === 'melee') L.sort((p, q) => q.net - p.net || q.score - p.score || p.morts - q.morts || p.id - q.id);
    else L.sort((p, q) => q.score - p.score || q.elims - p.elims || p.morts - q.morts || p.id - q.id);
    return L;
  }

  // ---------------------------------------------------------------- LA PROGRESSION DANS LA SIMULATION (L-P)
  // la dotation de la classe rendue (une réapparition : l'arme ramassée ne survit pas à la vie)
  _rendreDotation(a) {
    const A = a.arsenal, F = a._fiches;
    if (A && F && F.length === A.armes.length && A.armes.some((f, i) => f !== F[i])) A.armes = F.slice();
  }
  // ENDURANCE : le sprint tactique dure deux fois plus (la jauge se vide deux fois moins vite), et se recharge deux fois plus
  // vite — la jauge de js/jeu/mouvement.js corrigée après son pas (rien d'autre ne la lit entre-temps)
  deplacer(a, dt) {
    if (a.atout !== 'endurance') return super.deplacer(a, dt);
    const j0 = a.jaugeTact, E = ATOUTS.endurance;
    super.deplacer(a, dt);
    const d = a.jaugeTact - j0;
    if (d < 0) a.jaugeTact = Math.max(0, j0 + d / E.tactDuree);
    else if (d > 0 && d < 0.5) a.jaugeTact = Math.min(1, j0 + d / E.tactRecharge);    // (une réapparition la remet à 1 d'un coup)
  }
  // LES ÉVÉNEMENTS : le `tir` d'une arme équipée dit son bruit (le silencieux : 8 m, et `silencieux`) et la fiche du tireur
  // reste lisible par `ficheArme` pendant qu'on l'écoute (les cerveaux l'entendent à SON bruit, la mini-carte ne montre pas un
  // tir silencieux) ; chaque `pas` dit le rayon où les bots l'entendent (§ 3.1 ; ÷ 3 avec Pas feutrés)
  evt(type, data) {
    if (type === 'pas' && data) {
      const a = this.acteurParId(data.a), r = RAYONS_PAS[data.tact ? 'tact' : data.allure] ?? RAYONS_PAS.course;
      if (a && a.atout === 'pasFeutres') { data.rayon = r * ATOUTS.pasFeutres.audition; data.feutre = true; } else data.rayon = r;
    } else if (type === 'tir' && data) {
      let f = null;
      if (data.arme === 'sentinelle') f = FICHE_SENTINELLE;
      else { const a = this.acteurParId(data.a), g = a && a.arsenal && a.arsenal.arme; if (g && g.base && g.id === data.arme) { f = g; data.bruit = g.bruit; if (g.silencieux) data.silencieux = true; } }
      if (f) { const avant = this._ficheTir; this._ficheTir = f; try { return super.evt(type, data); } finally { this._ficheTir = avant; } }
    }
    return super.evt(type, data);
  }
  ficheArme(id) { const f = this._ficheTir; return f && f.id === id ? f : super.ficheArme(id); }
  // LE GILET : son armure prend les coups AVANT la vie (la base, sans gilet, en prendrait la moitié à chaque coup) ; un coup
  // que le gilet a tout pris reste un coup (marqueur, son, régénération retardée)
  infliger(cible, degats, o) {
    const ar = cible.armure || 0;
    if (ar <= 0 || !(degats > 0) || !cible.vivant) return super.infliger(cible, degats, o);
    const O = o || {}, par = O.par ?? -1, tireur = this.acteurParId(par);
    if (tireur && tireur !== cible && !this.ennemis(tireur, cible)) return 0;
    if (cible.protegeT > this.t) return 0;
    const pris = Math.min(ar, degats), reste = degats - pris;
    cible.armure = 0;
    // (relecture : les dégâts pris par le gilet comptent à l'assistance du tireur, § 3.5 — ≥ 30 dégâts sur une cible tuée
    // dans les 5 s —, comme ceux de la vie)
    (cible._aides || (cible._aides = [])).push({ par, d: pris, t: this.t });
    let d = 0;
    if (reste > 1e-9) d = super.infliger(cible, reste, O);
    else {
      if (tireur && tireur.protegeT > this.t) tireur.protegeT = this.t;
      cible.derniereTouche = { t: this.t, par, arme: O.arme ?? null };
      // (et le coup tout pris par le gilet est une touche du tireur, à sa précision — un coup de plombs une fois)
      if (tireur) {
        const f = O.arme ? ARMES[O.arme] : null, multi = O.plomb !== undefined && f && f.plombs > 1;
        if (f && f.rpm && (!multi || tireur._seqTouche !== O.seq)) tireur.stats.touches++;
        if (multi) tireur._seqTouche = O.seq;
      }
      this.evt('touche', { par, cible: cible.id, zone: O.zone || 'torse', degats: 0, x: O.x || 0, y: O.y || 0, z: O.z || 0, tete: O.zone === 'tete', dx: O.dx || 0,
        dz: O.dz || 0, arme: O.arme ?? null, armure: pris });
    }
    if (cible.vivant) cible.armure = ar - pris;
    return d;
  }
  // LES BALLES CONTRE UNE SENTINELLE ennemie : la tourelle coupée avant le monde et les acteurs arrête la balle (effet différé
  // à elle, appliqué à l'étape 6b comme les autres) ; un impact sur son métal
  resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb) {
    if (this.series.sentinelles.length && tireur && fiche && fiche.id !== 'couteau') {
      const h = this.series.toucherSentinelle(tireur, ox, oy, oz, dx, dy, dz, res.t);
      if (h) {
        this.differer({ genre: 'sentinelle', id: h.s.id, degats: degatsDe(fiche, h.t, null), par: tireur.id });
        this.evt('impact', { x: h.x, y: h.y, z: h.z, nx: -dx, ny: -dy, nz: -dz, mat: 'meuble', forme: null, plomb, arme: fiche.id, sentinelle: h.s.id });
        return;
      }
    }
    return super.resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb);
  }
  appliquerEffet(e) {
    if (e.genre === 'sentinelle') { this.series.blesser(e.id, e.degats, e.par); return; }
    return super.appliquerEffet(e);
  }

  // ---------------------------------------------------------------- l'affichage : le HUD, la caméra de la présentation
  majHud() {
    super.majHud();
    const H = this.hud;
    H.chrono = this.chrono;
    H.scores = this.scores ? { ...this.scores } : null;
    H.classement = this._classement();
    H.mort = this.mortLocal;
    H.points = this.points;
    // (en plus du § 4.5.15 : le mode, pour le bandeau et le tableau)
    H.mode = { id: this.mode, nom: this.nomMode, zone: this.zone, scoreCible: this.scoreCible, duree: this.duree, miTemps: this.miTempsFaite,
      camp: this.local ? this.local.equipe : null };
    // (L-P) les séries de Haythem, le drone de son équipe (les ennemis balayés : `signalesMiniCarte`, que la mini-carte de
    // L-G dessine), l'arme au sol qu'il peut ramasser
    const a = this.local, S = this.series;
    if (a) {
      const K = S.acteurs.get(a.id), D = S.dronesPour(a), Dc = S.dronesContre(a), sent = S.sentinelles.filter((s) => s.a === a.id);
      H.series = { vie: K ? K.vie : 0, dispo: K ? K.dispo.slice() : [], drone: D.reduce((m, x) => Math.max(m, x.fin - this.t), 0), droneEnnemi: Dc.length > 0,
        sentinelle: sent.length ? { reste: Math.max(0, sent[0].fin - this.t), vie: sent[0].vie, vieMax: SERIES.sentinelle.vie } : null, armure: a.armure || 0 };
      const sig = H.signalesMiniCarte = [];
      for (const x of D) for (const [id, vx, , vz] of x.vus) sig.push({ id, x: vx, z: vz, t: x.prochain });
      const sol = a.vivant && a.humain && !a.prop && a.arsenal ? this.armesSol.proche(a) : null;
      H.ramassage = sol ? { id: sol.id, arme: sol.arme, acc: sol.acc, ch: sol.ch, res: sol.res } : null;
    }
  }
  peutTirer(a) { return this.phase === 'manche' && super.peutTirer(a); }
  // (F2 relecture : la ligne sous « PAUSE »)
  titrePause() { const Z = ZONES_JEU[this.zone]; return `${this.nomMode} · ${(Z ? Z.nom : this.zone).toUpperCase()}`; }
  // (pendant la présentation, la caméra est derrière Haythem : l'arme de vue, une superposition, n'y est pas — cachée après
  // sa mise à jour de l'image, avant le rendu ; elle revient d'elle-même au décompte)
  image(dt) {
    super.image(dt);
    if (this.phase === 'presentation' && this._lacet0 !== null) this.aff.viewmodel?.cacher?.();
  }
  // LA PRÉSENTATION : la caméra file de derrière Haythem (7 m en arrière, 2,2 m plus haut, gardée hors des murs) jusque dans
  // ses yeux, en 3 s ; le regard est tenu au cap du départ (la vue à la 1re personne du décompte enchaîne sans saut)
  camera(dt, poser) {
    const a = this.local, g = this.game, C = g.collisions;
    if (this.phase !== 'presentation' || !a || !a.vivant || !a.humain || a.corps !== a.joueur || this._lacet0 === null) return super.camera(dt, poser);
    const l = this._lacet0, cam = g.camera;
    g.camYaw = l; g.camPitch = 0;
    a.oeil(_o, true);
    _f.set(-Math.sin(l), 0, -Math.cos(l));
    _p.copy(_o).addScaledVector(_f, -7); _p.y += 2.2;
    if (C) { const k = C.rayonLibre(_o.x, _o.y, _o.z, _p.x, _p.y, _p.z, 0.25); _p.lerpVectors(_o, _p, Math.max(0, k - 0.04)); }
    const u = Math.min(1, Math.max(0, this.phaseT / Math.max(1e-6, this.phaseDuree))), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    cam.position.lerpVectors(_p, _o, e);
    _c.copy(_o).addScaledVector(_f, 12);
    cam.lookAt(_c);
    const v = this.vue.champV;
    if (Math.abs(v - cam.fov) > 1e-6) { cam.fov = v; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld();
    return true;
  }

  // ---------------------------------------------------------------- L'ÉTAT (§ 4.7) : celui de la base, plus le bloc des règles
  etat() {
    const e = super.etat();
    // (les anneaux copiés en profondeur : la base ne copie que le 1er niveau, et la prise en cours se modifie EN PLACE — un
    // instantané gardé par l'hôte de demain aurait bougé avec la partie)
    e.points = this.points.map((p) => ({ ...p, capture: { ...p.capture }, presents: { ...p.presents } }));
    e.fps = { mode: this.mode, tJeu: this.tJeu, gagnant: this.gagnant, mi: this.miTempsFaite, minute: this.minuteDite, cotes: { ...this.cotes },
      mort: this.mortLocal ? { ...this.mortLocal } : null,
      ext: this.acteurs.map((a) => [a.id, { ...this._ext(a) }]),
      // (ce que la simulation garde sur les acteurs hors de leur état : le dernier dégât — la régénération —, les dégâts des
      // 5 dernières secondes — les assistances —, l'attente d'un lieu non vu)
      touches: this.acteurs.map((a) => [a.id, a.derniereTouche ? [a.derniereTouche.t, a.derniereTouche.par, a.derniereTouche.arme] : null,
        (a._aides || []).map((h) => [h.par, h.d, h.t]), a._attenteDepuis ?? null]),
      zones: [...this._zoneTouche], morts: this._mortsRecentes.map((m) => ({ ...m })) };
    // (L-P) les séries — leur part par acteur dans le champ `serie` de chacun : [vie, enchaînement, son heure, son dernier
    // tueur, les séries à prendre] —, les armes au sol, l'équipement tenu (les fiches : leur arme et leur accessoire, l'atout)
    const S = this.series.etat(), act = new Map(S.act.map((x) => [x[0], x.slice(1)]));
    delete S.act;
    for (const s of e.acteurs) s.serie = act.get(s.id) || null;
    e.prog = { series: S, sol: this.armesSol.etat(),
      equip: this.acteurs.filter((a) => a.arsenal).map((a) => [a.id, a.arsenal.armes.map((f) => [f.base || f.id, f.accessoire || null]), a.atout || null]) };
    return e;
  }
  appliquer(e) {
    super.appliquer(e);
    // (les anneaux : copiés en profondeur — la base ne copie que le premier niveau, et la prise en cours se modifie en place)
    this.points = this.hud.points = this.hud.points.map((p) => ({ ...p, capture: { ...p.capture }, presents: { ...(p.presents || { A: 0, B: 0 }) } }));
    const F = e.fps; if (!F) return;
    this.tJeu = F.tJeu; this.gagnant = F.gagnant; this.miTempsFaite = F.mi; this.minuteDite = F.minute; this.cotes = { ...F.cotes };
    this.mortLocal = F.mort ? { ...F.mort } : null;
    this.ext = new Map(F.ext.map(([id, x]) => [id, { ...x }]));
    for (const [id, dT, aides, att] of F.touches) {
      const a = this.acteurParId(id); if (!a) continue;
      a.derniereTouche = dT ? { t: dT[0], par: dT[1], arme: dT[2] } : null;
      a._aides = aides.map(([par, d, t]) => ({ par, d, t }));
      if (att === null) delete a._attenteDepuis; else a._attenteDepuis = att;
    }
    this._zoneTouche = new Map(F.zones);
    this._mortsRecentes = (F.morts || []).map((m) => ({ ...m }));
    for (const a of this.acteurs) if (a.arsenal) a.arsenal.bloque = !!a.gele;
    // (L-P) l'équipement tenu (fiches refaites), les séries, les armes au sol
    const G = e.prog; if (!G) return;
    for (const [id, armes, atout] of G.equip || []) {
      const a = this.acteurParId(id); if (!a || !a.arsenal) continue;
      a.atout = atout;
      if (armes.length === a.arsenal.armes.length) a.arsenal.armes = armes.map(([k, acc]) => ficheEquipee(ARMES[k], acc, atout));
    }
    this.series.appliquer({ ...G.series, act: e.acteurs.filter((s) => s.serie).map((s) => [s.id, ...s.serie]) });
    this.armesSol.appliquer(G.sol);
  }
}
