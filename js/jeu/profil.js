// =====================================================================
//  LE PROFIL DU JOUEUR — lot L-P (vague 3, 24/10 ; spec § 5.7.3 ; CoD § 11) — squelette du socle S0
// =====================================================================
// Ce qui fait REJOUER : l'expérience (XP) et les 40 niveaux (passer de n à n + 1 coûte 800 + 200 (n − 1) : niveau 10 à
// 14 400 XP, 40 à 179 400 ; une partie de 10 min en Régulier en rapporte 2 500 à 3 500), les DÉBLOCAGES (les armes, les
// classes, cinq classes personnalisées au niveau 6, les accessoires de 10 à 16, les atouts de 18 à 26, les camouflages de
// 30 à 40, et l'OR d'une arme après 100 têtes avec elle), les STATISTIQUES par arme et par mode, les MÉDAILLES gagnées, les
// trois DÉFIS DU JOUR (tirés à la date : les mêmes toute la journée, d'autres demain), les CLASSES PERSONNALISÉES.
// Gardé sous 'iris.profil.v1' (jamais dans iris.settings.v1), en try/catch : sans stockage — navigation privée, quota —, le
// jeu tourne et le profil vit en mémoire. Sous ?test=1, le profil est EN MÉMOIRE (les tests des autres lots jouent au
// niveau 1, le profil de Haythem n'est jamais touché ; `Profil.utiliserStockage` pour un test qui le veut).
// Le profil est de l'AFFICHAGE (§ 4.1 règle 5) : branché à chaque partie (js/jeu/index.js le crée dans l'affichage
// partagé), il lit ses ÉVÉNEMENTS — score, elim, tir, touche, medaille, serie, fin — pour l'acteur local ; il ne commande
// aucune règle. Ce que la simulation reçoit de lui passe par les OPTIONS de la partie : `equipement(classe)`, que le menu
// met dans `opts.equipement` (js/jeu/menus_jeu.js). Toutes les instances partagent les MÊMES données (celle du menu, celle
// de l'affichage) : un seul profil par page.
import { ARMES, CLASSES } from './armes.js';
import { ACCESSOIRES, ATOUTS, MEDAILLES, SERIES } from './series.js';
import { Rng, melanger } from './rng.js';

export const PROFIL_CLE = 'iris.profil.v1';
export const VERSION_PROFIL = 1;
export const NIVEAU_MAX = 40;
// LE BARÈME D'XP (CoD § 11 ; spec § 5.7.3 point 1) — le combat : l'élimination 100 (+ 25 tête, + 25 couteau, + 50 au-delà
// de 30 m : les points du barème de L-E, `score.points`), l'assistance 25, la capture 150, la neutralisation 75, la
// défense 50 (dans les points de l'élimination), une série de 3, 5, 7… : 50 × sa longueur, la victoire 400 et une partie
// finie 200 ; les médailles 25 à 100 (js/jeu/series.js MEDAILLES). Le prop hunt : ses points positifs (provocations,
// survie, manches, props trouvés, aides…) et la fin ; le stand : 100 par défi joué, 150 de plus s'il est réussi ; la
// sentinelle ennemie détruite 50.
export const XP = { assistance: 25, capture: 150, neutralisation: 75, victoire: 400, finPartie: 200, stand: 100, standReussi: 150, sentinelle: 50 };
// ce qu'une partie apporte (les modes sans XP : l'essai, qui n'est qu'un banc)
const SANS_XP = new Set(['essai']);
// le coût d'un niveau, le cumul d'XP pour l'atteindre, le niveau d'un cumul
export const coutNiveau = (n) => 800 + 200 * (n - 1);
export function xpPourNiveau(n) { const k = Math.max(1, Math.min(NIVEAU_MAX, n | 0)) - 1; return 800 * k + 100 * k * (k - 1); }
export function niveauDe(xp) { let n = 1; while (n < NIVEAU_MAX && xp >= xpPourNiveau(n + 1)) n++; return n; }
// l'XP d'un événement `score` de l'acteur local
export function xpDeScore(e) {
  if (!e) return 0;
  switch (e.raison) {
    case 'assistance': return XP.assistance;
    case 'capture': return XP.capture;
    case 'neutralisation': return XP.neutralisation;
    case 'sentinelle': return XP.sentinelle;
    case 'point': case 'suicide': return 0;
    default: return Math.max(0, Math.round(e.points || 0));     // (l'élimination : ses points du barème ; le prop hunt : les siens)
  }
}

// ---------------------------------------------------------------- LES DÉBLOCAGES (CoD § 11)
export const CAMOUFLAGES = {
  ardoise: { id: 'ardoise', nom: 'Ardoise', niveau: 30, couleur: '#5b636c' },
  foret: { id: 'foret', nom: 'Forêt', niveau: 32, couleur: '#4b5a37' },
  desert: { id: 'desert', nom: 'Désert', niveau: 34, couleur: '#b39868' },
  nuit: { id: 'nuit', nom: 'Nuit', niveau: 36, couleur: '#1e2433' },
  corail: { id: 'corail', nom: 'Corail', niveau: 38, couleur: '#c2604b' },
  arctique: { id: 'arctique', nom: 'Arctique', niveau: 40, couleur: '#d8dce2' },
  or: { id: 'or', nom: 'Or', niveau: 1, couleur: '#d4a017', tetes: 100 },
};
// les classes de départ (CoD § 11) : leur accessoire et leur atout ne viennent qu'une fois DÉBLOQUÉS (l'Assaut gagne
// l'Endurance au niveau 18, l'Infiltration le silencieux au 16 et les Pas feutrés au 22…)
export const CLASSES_DEPART = {
  assaut: { nom: 'ASSAUT', niveau: 1, accessoire: null, atout: 'endurance' },
  infiltration: { nom: 'INFILTRATION', niveau: 2, accessoire: 'silencieux', atout: 'pasFeutres' },
  defense: { nom: 'DÉFENSE', niveau: 4, accessoire: null, atout: 'mainSure' },
  tireur: { nom: 'TIREUR', niveau: 8, accessoire: null, atout: 'recuperation' },
};
export const NIVEAU_PERSO = 6, NB_PERSO = 5;
const NIV_ARMES = { fa24: 1, p17: 1, pm9: 2, fp12: 4, tp50: 8 };
export const DEBLOCAGES = (() => {
  const L = [];
  const pose = (niveau, type, id, nom) => { let n = L.find((x) => x.niveau === niveau); if (!n) { n = { niveau, quoi: [] }; L.push(n); } n.quoi.push({ type, id, nom }); };
  for (const [id, n] of Object.entries(NIV_ARMES)) pose(n, 'arme', id, ARMES[id].nom);
  pose(1, 'letale', 'frag', 'Grenade'); pose(1, 'tactique', 'flash', 'Grenade flash');
  for (const [id, C] of Object.entries(CLASSES_DEPART)) pose(C.niveau, 'classe', id, 'Classe ' + C.nom.charAt(0) + C.nom.slice(1).toLowerCase());
  pose(NIVEAU_PERSO, 'perso', 'perso', `${NB_PERSO} classes personnalisées`);
  for (const A of Object.values(ACCESSOIRES)) pose(A.niveau, 'accessoire', A.id, A.nom);
  for (const A of Object.values(ATOUTS)) pose(A.niveau, 'atout', A.id, 'Atout ' + A.nom);
  for (const C of Object.values(CAMOUFLAGES)) if (C.id !== 'or') pose(C.niveau, 'camo', C.id, 'Camouflage ' + C.nom);
  return L.sort((a, b) => a.niveau - b.niveau);
})();
// le niveau qui débloque un objet (`type` : arme, classe, accessoire, atout, camo, perso) ; Infinity : jamais
export function niveauRequis(type, id) {
  if (type === 'arme') return NIV_ARMES[id] ?? (ARMES[id] ? 1 : Infinity);
  if (type === 'classe') return CLASSES_DEPART[id] ? CLASSES_DEPART[id].niveau : /^perso[1-5]$/.test(id) ? NIVEAU_PERSO : Infinity;
  if (type === 'accessoire') return ACCESSOIRES[id] ? ACCESSOIRES[id].niveau : Infinity;
  if (type === 'atout') return ATOUTS[id] ? ATOUTS[id].niveau : Infinity;
  if (type === 'camo') return CAMOUFLAGES[id] ? CAMOUFLAGES[id].niveau : Infinity;
  if (type === 'perso') return NIVEAU_PERSO;
  if (type === 'letale' || type === 'tactique') return 1;
  return Infinity;
}
export const ARMES_PROFIL = ['fa24', 'pm9', 'fp12', 'tp50', 'p17'];
export const nomArme = (id) => (ARMES[id] ? ARMES[id].nom.split(' «')[0] : id || '');
export const MODES_PROFIL = { equipes: 'Match à mort par équipes', melee: 'Chacun pour soi', domination: 'Domination', prophunt: 'Prop hunt', stand: 'Stand de tir' };

// ---------------------------------------------------------------- LES DÉFIS DU JOUR (CoD § 11 : trois par jour, tirés à la date)
// `n` : [bas, haut] tiré dans l'intervalle ; `arme` : une arme débloquée ; `medaille` : une parmi la liste
export const MODELES_DEFIS = [
  { id: 'elimsArme', n: [8, 12], xp: 500, texte: (d) => `${d.n} éliminations au ${nomArme(d.arme)}` },
  { id: 'tetes', n: [4, 6], xp: 400, texte: (d) => `${d.n} éliminations d’une balle à la tête` },
  { id: 'captures', n: [2, 3], xp: 400, texte: (d) => `${d.n} captures en domination` },
  { id: 'assists', n: [4, 6], xp: 300, texte: (d) => `${d.n} assistances` },
  { id: 'victoires', n: [1, 2], xp: 500, texte: (d) => (d.n > 1 ? `Gagne ${d.n} parties de combat` : 'Gagne une partie de combat') },
  { id: 'medaille', n: [1, 2], xp: 400, medailles: ['double', 'loin', 'vengeance', 'sauvetage', 'boutPortant'],
    texte: (d) => `${d.n > 1 ? d.n + ' médailles' : 'La médaille'} ${MEDAILLES[d.medaille].nom}` },
  { id: 'serie', n: [5, 5], xp: 500, texte: () => 'Une série de 5 sans mourir' },
  { id: 'couteau', n: [2, 3], xp: 400, texte: (d) => `${d.n} éliminations au couteau` },
  { id: 'grenade', n: [2, 3], xp: 400, texte: (d) => `${d.n} éliminations à la grenade` },
  { id: 'props', n: [3, 5], xp: 400, texte: (d) => `Trouve ${d.n} props au prop hunt` },
  { id: 'survie', n: [1, 2], xp: 400, texte: (d) => (d.n > 1 ? `Survis à ${d.n} manches en prop` : 'Survis à une manche en prop') },
  { id: 'stand', n: [1, 1], xp: 300, texte: () => 'Réussis un défi du stand de tir' },
];
// la date du jour, à l'heure de la machine : 'AAAA-MM-JJ'
export const dateDuJour = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// les trois défis d'une date (et d'un niveau : une arme pas encore débloquée n'est pas demandée)
export function tirerDefis(date, niveau = 1) {
  const [y, m, j] = String(date).split('-').map((x) => x | 0), R = new Rng(melanger(y, m, j, 0x0def15));
  const pool = MODELES_DEFIS.slice(), out = [];
  while (out.length < 3 && pool.length) {
    const M = pool.splice(R.int(pool.length), 1)[0];
    const d = { id: M.id, n: M.n[0] + R.int(M.n[1] - M.n[0] + 1), xp: M.xp, fait: 0, fini: false };
    if (M.id === 'elimsArme') { const L = ARMES_PROFIL.filter((a) => niveauRequis('arme', a) <= niveau); d.arme = L[R.int(L.length)]; }
    if (M.medailles) d.medaille = M.medailles[R.int(M.medailles.length)];
    d.texte = M.texte(d);
    out.push(d);
  }
  return out;
}

// ---------------------------------------------------------------- LES DONNÉES (et leur remise d'aplomb)
const entier = (v, lo = 0) => (Number.isFinite(+v) ? Math.max(lo, Math.round(+v)) : lo);
const statArme = () => ({ elims: 0, tetes: 0, tirs: 0, touches: 0, morts: 0 });
const statMode = () => ({ parties: 0, victoires: 0, elims: 0, morts: 0, assists: 0, score: 0, temps: 0, serie: 0, xp: 0 });
export function classePersoDefaut(k) {
  return { nom: `PERSO ${k + 1}`, principale: 'fa24', accessoire: null, secondaire: 'p17', letale: 'frag', tactique: 'flash', atout: null, camo: null };
}
export function profilNeuf() {
  const armes = {}, modes = {};
  for (const a of ARMES_PROFIL) armes[a] = statArme();
  for (const m of Object.keys(MODES_PROFIL)) modes[m] = statMode();
  return { v: VERSION_PROFIL, xp: 0, armes, modes, medailles: {}, ors: {}, vus: 1,
    totaux: { parties: 0, victoires: 0, elims: 0, morts: 0, assists: 0, tetes: 0, tirs: 0, touches: 0, temps: 0, serie: 0 },
    classes: Array.from({ length: NB_PERSO }, (_, k) => classePersoDefaut(k)), defis: { date: null, liste: [] } };
}
// une sauvegarde lue, remise d'aplomb champ par champ (une vieille version, un champ abîmé : le profil reste jouable)
export function reparer(d) {
  const P = profilNeuf();
  if (!d || typeof d !== 'object') return P;
  P.xp = entier(d.xp);
  P.vus = Math.max(1, Math.min(NIVEAU_MAX, entier(d.vus, 1)));
  for (const a of ARMES_PROFIL) if (d.armes && d.armes[a]) for (const k of Object.keys(P.armes[a])) P.armes[a][k] = entier(d.armes[a][k]);
  for (const m of Object.keys(MODES_PROFIL)) if (d.modes && d.modes[m]) for (const k of Object.keys(P.modes[m])) P.modes[m][k] = entier(d.modes[m][k]);
  if (d.totaux) for (const k of Object.keys(P.totaux)) P.totaux[k] = entier(d.totaux[k]);
  if (d.medailles) for (const k of Object.keys(MEDAILLES)) if (d.medailles[k]) P.medailles[k] = entier(d.medailles[k]);
  if (d.ors) for (const a of ARMES_PROFIL) if (d.ors[a]) P.ors[a] = true;
  if (Array.isArray(d.classes)) d.classes.slice(0, NB_PERSO).forEach((c, k) => { if (c && typeof c === 'object') P.classes[k] = reparerClasse(c, k); });
  if (d.defis && typeof d.defis.date === 'string' && Array.isArray(d.defis.liste)) {
    P.defis = { date: d.defis.date, liste: d.defis.liste.filter((x) => x && MODELES_DEFIS.some((M) => M.id === x.id)).slice(0, 3)
      .map((x) => ({ id: x.id, n: entier(x.n, 1), xp: entier(x.xp), fait: entier(x.fait), fini: !!x.fini, arme: ARMES[x.arme] ? x.arme : undefined,
        medaille: MEDAILLES[x.medaille] ? x.medaille : undefined, texte: String(x.texte || '') })) };
  }
  return P;
}
export function reparerClasse(c, k) {
  const D = classePersoDefaut(k), A = (id, emp) => (ARMES[id] && ARMES[id].emplacement === emp ? id : null);
  const p = A(c.principale, 'principale') || D.principale;
  return { nom: String(c.nom || D.nom).slice(0, 18).toUpperCase(), principale: p,
    accessoire: ACCESSOIRES[c.accessoire] && ACCESSOIRES[c.accessoire].armes.includes(p) ? c.accessoire : null,
    secondaire: A(c.secondaire, 'secondaire') || D.secondaire, letale: c.letale === null || c.letale === 'aucune' ? null : 'frag',
    tactique: c.tactique === null || c.tactique === 'aucune' ? null : c.tactique === 'flash2' ? 'flash2' : 'flash',
    atout: ATOUTS[c.atout] ? c.atout : null, camo: CAMOUFLAGES[c.camo] ? c.camo : null };
}

// ---------------------------------------------------------------- LE STOCKAGE (localStorage, ou la mémoire)
const TEST = (() => { try { return new URLSearchParams(location.search).get('test') === '1'; } catch (e) { return false; } })();
export function stockageMemoire() { const M = new Map(); return { getItem: (k) => (M.has(k) ? M.get(k) : null), setItem: (k, v) => { M.set(k, String(v)); }, removeItem: (k) => { M.delete(k); }, _m: M }; }
const LOCAL = { getItem: (k) => localStorage.getItem(k), setItem: (k, v) => localStorage.setItem(k, v), removeItem: (k) => localStorage.removeItem(k) };
const ETAT = { donnees: null, stockage: TEST ? stockageMemoire() : LOCAL, memoire: false, annonces: [], ecoutes: new Set() };

export class Profil {
  constructor() { this.partie = null; this._des = []; this.courante = null; this.derniere = null; }
  // (un test : un autre stockage — stockageMemoire(), un faux qui lève — ; les données relues de lui)
  static utiliserStockage(s) { ETAT.stockage = s || stockageMemoire(); ETAT.donnees = null; ETAT.memoire = false; }
  static get stockage() { return ETAT.stockage; }
  get donnees() { return ETAT.donnees || this.charger(); }
  get memoire() { return ETAT.memoire; }       // (vrai : le stockage a levé, le profil ne vit qu'en mémoire)
  charger() {
    let d = null;
    try { const s = ETAT.stockage.getItem(PROFIL_CLE); d = s ? JSON.parse(s) : null; } catch (e) { d = null; ETAT.memoire = true; }
    // (sous ?test=1, un profil vide est un profil de TEST au niveau 40 : tout débloqué — les tests des autres lots, écrits avant
    // la progression, choisissent n'importe quelle classe ; ceux de L-P posent eux-mêmes leur niveau)
    if (!d && TEST) d = { xp: xpPourNiveau(NIVEAU_MAX) };
    ETAT.donnees = reparer(d);
    return ETAT.donnees;
  }
  enregistrer() {
    try { ETAT.stockage.setItem(PROFIL_CLE, JSON.stringify(this.donnees)); ETAT.memoire = false; return true; } catch (e) { ETAT.memoire = true; return false; }
  }
  // (un test : repartir d'un profil donné — ou neuf —, sans l'écrire)
  reinitialiser(d = null) { ETAT.donnees = reparer(d); ETAT.annonces.length = 0; this._signaler(); return ETAT.donnees; }
  // qui veut savoir que le profil a bougé (la barre d'XP du menu)
  ecouter(fn) { ETAT.ecoutes.add(fn); return () => ETAT.ecoutes.delete(fn); }
  _signaler() { for (const f of [...ETAT.ecoutes]) { try { f(this); } catch (e) { console.warn('[profil]', e); } } }

  // ---------------------------------------------------------------- niveaux et déblocages
  get xp() { return this.donnees.xp; }
  get niveau() { return niveauDe(this.donnees.xp); }
  // où en est la barre : { niveau, xp, debut, fin (null au niveau 40), dans, cout, k (0..1) }
  progression(xp = this.donnees.xp) {
    const n = niveauDe(xp), debut = xpPourNiveau(n), fin = n < NIVEAU_MAX ? xpPourNiveau(n + 1) : null;
    return { niveau: n, xp, debut, fin, dans: xp - debut, cout: fin === null ? 0 : fin - debut, k: fin === null ? 1 : (xp - debut) / (fin - debut) };
  }
  deverrouille(type, id, niveau = this.niveau) {
    if (type === 'camo' && id === 'or') return false;
    return niveauRequis(type, id) <= niveau;
  }
  // l'or d'une arme (100 têtes avec elle)
  aOr(arme) { return !!this.donnees.ors[arme]; }
  // les déblocages d'un niveau
  deblocagesDe(n) { const D = DEBLOCAGES.find((x) => x.niveau === n); return D ? D.quoi : []; }
  prochainDeblocage(n = this.niveau) { return DEBLOCAGES.find((x) => x.niveau > n) || null; }

  // ---------------------------------------------------------------- les classes
  // la liste du menu : les quatre de départ puis les cinq personnalisées — { id, nom, verrou (niveau requis ou 0), perso }
  classes(niveau = this.niveau) {
    const L = Object.entries(CLASSES_DEPART).map(([id, C]) => ({ id, nom: C.nom, perso: false, verrou: C.niveau > niveau ? C.niveau : 0 }));
    this.donnees.classes.forEach((c, k) => L.push({ id: 'perso' + (k + 1), nom: c.nom, perso: true, verrou: NIVEAU_PERSO > niveau ? NIVEAU_PERSO : 0 }));
    return L;
  }
  classePerso(id) { const k = /^perso([1-5])$/.exec(id || ''); return k ? this.donnees.classes[+k[1] - 1] : null; }
  poserClasse(id, c) {
    const k = /^perso([1-5])$/.exec(id || ''); if (!k) return null;
    this.donnees.classes[+k[1] - 1] = reparerClasse(c, +k[1] - 1);
    this.enregistrer(); this._signaler();
    return this.donnees.classes[+k[1] - 1];
  }
  // une classe est-elle jouable (débloquée) ?
  classeJouable(id, niveau = this.niveau) { return niveauRequis('classe', id) <= niveau; }
  // L'ÉQUIPEMENT d'une classe, tel que la partie le reçoit (`opts.equipement`, js/jeu/partie_fps.js equipementH) — tout ce
  // qui n'est pas débloqué est retiré (l'accessoire, l'atout, une arme : celle de départ) ; une classe verrouillée → l'Assaut
  equipement(classe, niveau = this.niveau) {
    let id = this.classeJouable(classe, niveau) ? classe : 'assaut';
    const ok = (t, x) => !!x && niveauRequis(t, x) <= niveau;
    if (CLASSES_DEPART[id]) {
      const C = CLASSES[id], D = CLASSES_DEPART[id];
      return { classe: id, nom: D.nom, principale: C.principale, secondaire: C.secondaire, letale: C.letale ? C.letale.slice() : null,
        tactique: C.tactique ? C.tactique.slice() : null, accessoire: ok('accessoire', D.accessoire) ? D.accessoire : null, atout: ok('atout', D.atout) ? D.atout : null, camo: null };
    }
    const c = this.classePerso(id);
    if (!c) { id = 'assaut'; return this.equipement('assaut', niveau); }
    const p = ok('arme', c.principale) ? c.principale : 'fa24';
    return { classe: id, nom: c.nom, principale: p, secondaire: ok('arme', c.secondaire) ? c.secondaire : 'p17',
      letale: c.letale ? ['frag', 1] : null, tactique: c.tactique ? ['flash', c.tactique === 'flash2' ? 2 : 1] : null,
      accessoire: ok('accessoire', c.accessoire) && ACCESSOIRES[c.accessoire].armes.includes(p) ? c.accessoire : null,
      atout: ok('atout', c.atout) ? c.atout : null, camo: c.camo && (c.camo === 'or' ? this.aOr(p) : ok('camo', c.camo)) ? c.camo : null };
  }
  modificateurs(classe) { const e = this.equipement(classe); return { accessoire: e.accessoire, atout: e.atout }; }

  // ---------------------------------------------------------------- l'expérience
  // ajouter `n` XP (une `raison` pour le bilan de la partie) ; les niveaux franchis sont annoncés
  ajouterXp(n, raison = 'autre', lib = null) {
    n = Math.round(+n || 0);
    if (n <= 0) return 0;
    const D = this.donnees, avant = niveauDe(D.xp);
    D.xp += n;
    const apres = niveauDe(D.xp), C = this.courante;
    if (C) {
      C.xp += n;
      const L = C.lignes.get(raison) || { raison, lib: lib || LIBELLES[raison] || raison, n: 0, xp: 0 };
      L.n++; L.xp += n; C.lignes.set(raison, L);
    }
    for (let k = avant + 1; k <= apres; k++) {
      const q = this.deblocagesDe(k);
      ETAT.annonces.push({ type: 'niveau', niveau: k, texte: `NIVEAU ${k}`, sous: q.length ? 'Débloqué : ' + q.map((x) => x.nom).join(', ') : '' });
      if (C) C.niveaux.push(k);
    }
    if (apres > avant) { D.vus = Math.max(D.vus, apres); this.enregistrer(); }
    this._signaler();
    return n;
  }
  // l'annonce suivante pour le HUD (un niveau, un défi réussi, l'or d'une arme) — prise une fois
  prendreAnnonce() { return ETAT.annonces.shift() || null; }
  get annonces() { return ETAT.annonces; }

  // ---------------------------------------------------------------- les défis du jour
  defisDuJour(date = dateDuJour()) {
    const D = this.donnees;
    if (D.defis.date !== date || D.defis.liste.length !== 3) { D.defis = { date, liste: tirerDefis(date, this.niveau) }; this.enregistrer(); }
    return D.defis.liste;
  }
  // un pas de plus sur les défis d'un genre (`id`) — `filtre(d)` pour ceux qui ont un paramètre ; `max` : une valeur qui
  // compte comme atteinte (la série)
  _avancerDefi(id, n = 1, filtre = null, max = false) {
    for (const d of this.defisDuJour()) {
      if (d.fini || d.id !== id || (filtre && !filtre(d))) continue;
      d.fait = max ? Math.max(d.fait, n) : d.fait + n;
      if (d.fait >= d.n) {
        d.fait = d.n; d.fini = true;
        this.ajouterXp(d.xp, 'defi', 'DÉFIS DU JOUR');
        ETAT.annonces.push({ type: 'defi', texte: 'DÉFI RÉUSSI', sous: `${d.texte} · +${d.xp} XP` });
        if (this.courante) this.courante.defis.push(d.texte);
      }
    }
  }

  // ---------------------------------------------------------------- BRANCHÉ À UNE PARTIE : ce qu'elle rapporte
  brancher(partie) {
    this.debrancher();
    this.partie = partie;
    const L = partie && partie.local;
    if (!partie || !L || SANS_XP.has(partie.id)) { this.courante = null; return; }
    const D = this.donnees, mode = MODES_PROFIL[partie.id] ? partie.id : null, M = mode ? D.modes[mode] : null, moi = L.id;
    this.defisDuJour();
    const C = this.courante = { mode: partie.id, xpAvant: D.xp, niveauAvant: niveauDe(D.xp), xp: 0, lignes: new Map(), niveaux: [], defis: [], medailles: [], finie: false, t0: partie.t };
    this.derniere = C;
    const S = (type, fn) => this._des.push(partie.sur(type, (e) => { try { fn(e); } catch (er) { console.warn('[profil]', type, er); } }));
    const tireuse = (id) => !!(ARMES[id] && ARMES[id].rpm);
    let toucheT = -1, toucheA = null;
    S('score', (e) => {
      if (e.id !== moi) return;
      if (M && e.points > 0) M.score += e.points;
      const x = xpDeScore(e);
      if (x) this.ajouterXp(x, e.raison === 'elim' ? 'elim' : e.raison, e.raison === 'elim' && partie.id === 'prophunt' ? 'PROPS TROUVÉS' : null);
      if (e.raison === 'capture') this._avancerDefi('captures');
    });
    S('elim', (e) => {
      const A = ARMES[e.arme] ? e.arme : null;
      if (e.par === moi && e.cible !== moi && partie.phase !== 'fin') {
        D.totaux.elims++; if (M) M.elims++;
        if (A && D.armes[A]) { D.armes[A].elims++; if (e.tete) D.armes[A].tetes++; }
        if (e.tete) { D.totaux.tetes++; this._avancerDefi('tetes'); }
        if (A) this._avancerDefi('elimsArme', 1, (d) => d.arme === A);
        if (e.arme === 'couteau') this._avancerDefi('couteau');
        if (e.arme === 'frag') this._avancerDefi('grenade');
        if (partie.id === 'prophunt') this._avancerDefi('props');
        // (l'or d'une arme : 100 têtes avec elle)
        if (A && D.armes[A] && D.armes[A].tetes >= CAMOUFLAGES.or.tetes && !D.ors[A]) {
          D.ors[A] = true; ETAT.annonces.push({ type: 'or', texte: 'CAMOUFLAGE OR', sous: `${nomArme(A)} : 100 éliminations à la tête` });
        }
      } else if (e.cible === moi) {
        D.totaux.morts++; if (M) M.morts++;
        const w = L.arsenal && L.arsenal.arme ? (L.arsenal.arme.base || L.arsenal.arme.id) : null;
        if (w && D.armes[w]) D.armes[w].morts++;
      }
      if (Array.isArray(e.assists) && e.assists.includes(moi)) { D.totaux.assists++; if (M) M.assists++; this._avancerDefi('assists'); }
    });
    S('tir', (e) => { if (e.a === moi && tireuse(e.arme)) { D.totaux.tirs++; if (D.armes[e.arme]) D.armes[e.arme].tirs++; } });
    // (une touche par COUP : les plombs d'un même pas, de la même arme, ne comptent qu'une fois)
    S('touche', (e) => {
      if (e.par !== moi || e.cible === moi || !tireuse(e.arme)) return;
      if (toucheT === partie.t && toucheA === e.arme) return;
      toucheT = partie.t; toucheA = e.arme;
      D.totaux.touches++; if (D.armes[e.arme]) D.armes[e.arme].touches++;
    });
    S('medaille', (e) => {
      if (e.a !== moi || !MEDAILLES[e.id]) return;
      D.medailles[e.id] = (D.medailles[e.id] || 0) + 1;
      C.medailles.push(e.id);
      this.ajouterXp(MEDAILLES[e.id].xp, 'medaille', 'MÉDAILLES');
      this._avancerDefi('medaille', 1, (d) => d.medaille === e.id);
    });
    S('serie', (e) => {
      if (e.a !== moi || e.etat !== 'atteinte') return;
      if (e.n > D.totaux.serie) D.totaux.serie = e.n;
      if (M && e.n > M.serie) M.serie = e.n;
      if (e.xp) this.ajouterXp(e.xp, 'serie', 'SÉRIES');
      this._avancerDefi('serie', e.n, null, true);
    });
    // (le prop hunt : une manche survécue en prop)
    S('phase', (e) => {
      if (partie.id !== 'prophunt' || e.phase !== 'revelation') return;
      if ((L.role === 'prop' || L.prop) && L.vivant) this._avancerDefi('survie');
    });
    S('fin', (e) => this._fin(e));
  }
  _fin(e) {
    const P = this.partie, C = this.courante, L = P && P.local, D = this.donnees;
    if (!P || !C || C.finie || !L) return;
    C.finie = true;
    const mode = MODES_PROFIL[P.id] ? P.id : null, M = mode ? D.modes[mode] : null, g = e.gagnant;
    let gagne = false;
    if (P.id === 'stand') {
      const r = e.resultat || P.resultat || {};
      this.ajouterXp(XP.stand, 'fin', 'DÉFI JOUÉ');
      if (r.reussi) { this.ajouterXp(XP.standReussi, 'victoire', 'DÉFI RÉUSSI'); this._avancerDefi('stand'); gagne = true; }
    } else {
      gagne = g !== null && g !== undefined && (typeof g === 'string' ? g === L.equipe : g === L.id);
      this.ajouterXp(gagne ? XP.victoire : XP.finPartie, gagne ? 'victoire' : 'fin', gagne ? 'VICTOIRE' : 'PARTIE FINIE');
      if (gagne && P.id !== 'prophunt') this._avancerDefi('victoires');
    }
    D.totaux.parties++; if (gagne) D.totaux.victoires++;
    const temps = Math.round(P.tJeu ?? (P.t - C.t0));
    D.totaux.temps += temps;
    if (M) { M.parties++; if (gagne) M.victoires++; M.temps += temps; M.xp += C.xp; }
    C.gagne = gagne;
    this.enregistrer(); this._signaler();
  }
  debrancher() {
    for (const d of this._des) d(); this._des = [];
    if (this.courante) {
      const P = this.partie, M = P && MODES_PROFIL[P.id] ? this.donnees.modes[P.id] : null;
      if (M && !this.courante.finie) M.xp += this.courante.xp;
      this.enregistrer(); this._signaler();
    }
    this.courante = null; this.partie = null;
  }
  // LE BILAN D'XP d'une partie (l'écran de fin) : { xp, avant, apres, lignes: [{ lib, n, xp }], niveaux, deblocages, defis, medailles }
  bilanPartie(C = this.courante || this.derniere) {
    if (!C) return null;
    const apres = C.xpAvant + C.xp, deb = [];
    for (const n of C.niveaux) for (const q of this.deblocagesDe(n)) deb.push({ niveau: n, ...q });
    const ordre = ['elim', 'assistance', 'capture', 'neutralisation', 'medaille', 'serie', 'defi', 'victoire', 'fin'];
    const lignes = [...C.lignes.values()].sort((a, b) => (ordre.indexOf(a.raison) + 1 || 99) - (ordre.indexOf(b.raison) + 1 || 99));
    return { xp: C.xp, avant: this.progression(C.xpAvant), apres: this.progression(apres), lignes, niveaux: C.niveaux.slice(), deblocages: deb, defis: C.defis.slice(),
      medailles: C.medailles.slice(), gagne: !!C.gagne, finie: C.finie };
  }
}
const LIBELLES = { elim: 'ÉLIMINATIONS', assistance: 'ASSISTANCES', capture: 'CAPTURES', neutralisation: 'NEUTRALISATIONS', medaille: 'MÉDAILLES', serie: 'SÉRIES',
  defi: 'DÉFIS DU JOUR', victoire: 'VICTOIRE', fin: 'PARTIE FINIE', sentinelle: 'SENTINELLE DÉTRUITE', provocation: 'PROVOCATIONS', survie: 'SURVIE',
  manche: 'MANCHES SURVÉCUES', dernier: 'DERNIER PROP', aide: 'AIDES', equipe: 'MANCHES GAGNÉES' };
export { SERIES };
