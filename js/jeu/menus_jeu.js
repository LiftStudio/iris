// =====================================================================
//  LES MENUS DU JEU (lot L-U, 23/10 ; spec §§ 2.1, 2.2, 2.9, 4.5.16 — vague 3 : L-P y ajoute ARMURERIE, PROFIL, la barre d'XP)
// =====================================================================
// Après « APPUIE POUR COMMENCER », le MENU PRINCIPAL sur l'école vivante : à gauche le titre IRIS et les portes du jeu
// (BALADE LIBRE · COMBAT · PROP HUNT · STAND DE TIR · OPTIONS · CRÉDITS), à droite une fiche qui dit ce qu'est la porte
// visée ; derrière, la caméra du menu glisse lentement sur trois plans de 12 s (le hall vers la pile « iris »,
// l'escalier principal, la pause orange du 1er) séparés par un fondu au noir de 1,2 s, et pose le corps FICTIF du menu
// au sol sous elle : la carte vivante le suit (game.carteMenu : lampes, portes, niveau de la pièce filmée).
// Puis les RÉGLAGES de partie (COMBAT, PROP HUNT, STAND : § 2.2, gardés dans settings.jeu), l'écran PRÉPARATION (les
// étapes de Partie.preparer, une barre, une astuce), l'écran de FIN (à lui, pas l'écran de pause : bandeau 2,5 s puis
// le bilan — podium, chiffres de Haythem, REJOUER · CHANGER DE MODE · MENU PRINCIPAL · BALADE) et les CRÉDITS (la
// licence CC BY 4.0 des danses l'exige, la base CMU impose sa formule). Chaque écran s'inscrit à la manette
// (js/manette_menus.js ajouterRacine : croix ou stick, A, B qui revient) ; au clavier, ÉCHAP revient aussi et les
// flèches parcourent l'accueil.
// Rien n'est chargé ici : les portraits des amis sont des IMAGES précalculées (js/jeu/portraits.js, balises <img>) —
// jamais un 2e contexte WebGL, jamais un avatar au menu (arbitrage 40). Affichage seulement : le menu lit l'état des
// parties et s'abonne à leurs événements (séries, manches), il ne commande aucune règle.
// VAGUE 3, L-P : les portes ARMURERIE et PROFIL (js/jeu/menu_progression.js), la barre d'XP sous le titre, les classes du
// PROFIL au réglage du combat (une classe verrouillée grisée avec son niveau, les cinq personnalisées dès le 6), l'ÉQUIPEMENT
// de la classe passé à la partie (`opts.equipement`, ce que le profil a débloqué), le BILAN D'XP à la fin (ce que la partie
// a rapporté, la barre qui avance, les niveaux et ce qu'ils débloquent, les défis du jour réussis).
import * as THREE from 'three';
import { ajouterRacine } from '../manette_menus.js';
import { entree, actionKey, padGlyph } from '../settings.js';
import { TELEPHONE } from '../appareil.js';
import { rattraperRegistre, zonerRegistre } from '../registre_meubles.js';
import { CorpsFixe } from './acteur.js';
import { ZONES_JEU, LIMITES, EQUIPES } from './constantes.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { ARMES, CLASSES } from './armes.js';
import { typesDeguisables } from './deguisements.js';
import { REGLAGES_PROP } from './partie_prop.js';
import { lireRecords, meilleur } from './partie_stand.js';
import { portrait } from './portraits.js';
import { MenuProgression } from './menu_progression.js';
import { CLASSES_DEPART } from './profil.js';
import { ACCESSOIRES, ATOUTS, MEDAILLES } from './series.js';

// ---------------------------------------------------------------- les données des écrans (§§ 2.1, 2.2, 3.8, 3.9)
// L'ACCUEIL, dans l'ordre du § 2.1 (vague 3 : L-P ajoute ses portes à cette table)
export const ACCUEIL = [
  { act: 'balade', titre: 'BALADE LIBRE', texte: 'L’école telle quelle : se promener, monter aux étages, s’asseoir, danser, lire le groupe IRIS sur le téléphone.' },
  { act: 'combat', titre: 'COMBAT', texte: 'À la première personne contre des bots : SISR contre SLAM, chacun pour soi ou domination, dans toute l’école.' },
  { act: 'prophunt', titre: 'PROP HUNT', texte: 'Deviens un vrai meuble de l’école et tiens jusqu’au bout… ou traque ceux qui se cachent parmi les chaises.' },
  { act: 'stand', titre: 'STAND DE TIR', texte: 'Dans la rue, devant la façade : des cibles à 8, 15 et 25 m, quatre défis et tes records.' },
  { act: 'options', titre: 'OPTIONS', texte: 'Graphismes, son, commandes de la balade, du combat et du prop hunt, réglages de la vue à la 1re personne.' },
  { act: 'credits', titre: 'CRÉDITS', texte: 'Qui a fait quoi : l’école, les avatars, les animations, les licences.' },
  // (L-P, vague 3 : les deux portes de la progression, SOUS LE TITRE avec la barre d'XP — `tete` : rendues là, pas dans la
  // colonne des portes du jeu, que la croix atteint en montant depuis BALADE LIBRE)
  { act: 'armurerie', titre: 'ARMURERIE', tete: true, texte: 'Tes classes : l’arme, son accessoire, l’atout, le camouflage. Cinq classes à toi dès le niveau 6.' },
  { act: 'profil', titre: 'PROFIL', tete: true, texte: 'Ton niveau, les défis du jour, tes chiffres par arme et par mode, tes médailles, ce qui reste à débloquer.' },
];
// les modes du combat ; les limites et les temps PRÉRÉGLÉS par mode (§ 3.8 : 40 éliminations — 20 au téléphone —, 20 en
// chacun pour soi, 150 points en domination ; 10:00 partout)
export const MODES_COMBAT = {
  equipes: { nom: 'Match à mort par équipes', court: 'ÉQUIPES', texte: `${EQUIPES.A.nom} contre ${EQUIPES.B.nom}, quatre contre quatre : la première équipe à la limite gagne.` },
  melee: { nom: 'Chacun pour soi', court: 'CHACUN POUR SOI', texte: 'Pas d’alliés : tout le monde est rouge. Le premier à la limite gagne, podium des trois premiers.' },
  domination: { nom: 'Domination', court: 'DOMINATION', texte: 'Trois points à tenir : A le hall, B la pause du −1, C la pause du 1er. Un point par point tenu toutes les 3 s.' },
};
export const LIMITES_MODE = {
  equipes: { score: TELEPHONE ? 20 : 40, choix: [20, 30, 40, 50, 75], unite: 'éliminations', uniteA: 'adversaires touchés' },
  melee: { score: 20, choix: [10, 15, 20, 25, 30], unite: 'éliminations', uniteA: 'adversaires touchés' },
  domination: { score: 150, choix: [100, 150, 200, 250], unite: 'points', uniteA: 'points' },
};
export const DUREES = [300, 600, 900, 1200];
export const ZONES_COMBAT = ['ecole', 'rdc_rue', 'ss', 'etages'];
export const ZONES_PROP = ['ss', 'e1', 'rdc', 'e2', 'ecole_int'];
export const DIFFS_COMBAT = [
  ['recrue', 'RECRUE', 'Les bots repèrent tard (0,65 s, puis 0,65 s pour réagir) et visent large.'],
  ['regulier', 'RÉGULIER', 'Le bon départ : 0,9 s entre leur premier regard et leur première balle, à 10 m.'],
  ['aguerri', 'AGUERRI', 'Ils réagissent en 0,6 s, lancent des grenades, jettent un œil depuis un couvert.'],
  ['veteran', 'VÉTÉRAN', 'Repérage et réaction en 0,2 s, la moitié des balles à la tête, ils pré-visent les portes.'],
  ['mixte', 'MIXTE', 'Tes alliés en Régulier, les ennemis tirés au hasard entre Recrue et Aguerri.'],
];
export const DIFFS_PROP = [
  ['facile', 'FACILE', 'Des chasseurs distraits, qui tirent une balle pour vérifier. Pour apprendre les deux rôles.'],
  ['normal', 'NORMAL', 'Ils remarquent une chaise de trop et suivent les provocations à l’oreille.'],
  ['difficile', 'DIFFICILE', 'Un œil sûr, trois balles par vérification, la grenade sur une grappe de soupçons.'],
];
export const CLASSES_MENU = [['assaut', 'ASSAUT'], ['infiltration', 'INFILTRATION'], ['defense', 'DÉFENSE'], ['tireur', 'TIREUR']];
export const DEFIS = [
  [null, 'LIBRE', 'Sans chrono : le mannequin à 10 m dit la zone et les dégâts de chaque balle. Le banc de réglage du ressenti.'],
  ['vingt', '20 CIBLES', '20 cibles en 30 s : elles se lèvent en 0,15 s à 8, 15 et 25 m.'],
  ['tetes', '10 TÊTES', 'Dix têtes, le plus vite possible : une tête compte double.'],
  ['recul', 'RECUL', '30 balles à 15 m : apprends le motif du recul et tire vers le bas pour le tenir.'],
  ['reflexes', 'RÉFLEXES', 'Des cibles qui restent levées 0,8 s.'],
];
export const PREMIERS_ROLES = [['prop', 'PROP'], ['chasseur', 'CHASSEUR'], ['hasard', 'AU HASARD']];
export const MANCHES = REGLAGES_PROP.choixManches || [4, 6, 8];
// L'HABILLAGE (arbitrage 35, R33 : en tête des réglages du combat ; la même ligne que dans Options › Combat)
export const HABILLAGES = [['airsoft', 'AIRSOFT', 'Billes de peinture, « TOUCHÉ », tir au gaz — conseillé, et pour toute vidéo publiée.'],
  ['militaire', 'MILITAIRE', 'Impacts de balles, « ÉLIMINÉ ».']];
const REGLAGES_CLE = 'iris.settings.v1';

// LA CAMÉRA DU MENU : trois plans de 12 s, un fondu au noir de 1,2 s à chaque coupe (0,6 s de chaque côté). Chaque plan
// glisse de `de` à `a` (position de la caméra et point visé), lissé aux deux bouts. Positions relevées dans l'école le
// 23/10 et regardées en 1280 × 720 (le sujet dans la moitié droite : la colonne du menu couvre la gauche) ; jamais dans
// une forme, au moins 0,5 m au-dessus du sol, sous le plafond (360 positions : test 3 de js/jeu/tests/test_menus.js).
export const DUREE_PLAN = 12, FONDU = 1.2;
export const PLANS = [
  // le hall vers la pile « iris » : la pile et Haythem (au départ) à droite de l'image, le mur d'entrée sous le menu
  { nom: 'le hall, vers la pile « iris »', de: { cam: [15.2, 1.7, -1.35], vise: [12.9, 1.45, -6.5] }, a: { cam: [14.15, 1.66, -1.55], vise: [12.7, 1.4, -6.4] } },
  // le hall ouest : on s'approche des deux battants ouverts sur l'escalier principal
  { nom: 'l’escalier principal', de: { cam: [6.0, 1.6, -6.4], vise: [2.6, 1.45, -9.5] }, a: { cam: [4.9, 1.6, -7.3], vise: [2.5, 1.55, -9.9] } },
  // la pause orange du 1er, vue de l'est : le mur orange à droite, les distributeurs, les mange-debout
  { nom: 'la pause orange du 1er', de: { cam: [13.0, 5.05, -5.7], vise: [9.0, 4.3, -9.3] }, a: { cam: [12.3, 4.95, -6.5], vise: [9.4, 4.25, -9.8] } },
];

// les ASTUCES de l'écran PRÉPARATION (les touches du profil, d'après les réglages : actionKey)
const ASTUCES_COMBAT = [
  (k) => `Double appui sur ${k('sprint')} (ou ${k('sprintTact')}) : le sprint tactique, 7,8 m/s pendant 3 s — l’arme contre l’épaule.`,
  (k) => `En plein sprint, ${k('accroupi')} : une glissade. On peut tirer en glissant, à la hanche.`,
  () => 'Le recul monte toujours de la même façon pour une arme : tire un peu vers le bas pour le tenir.',
  (k) => `${k('letale')} tenu : la goupille est tirée, la grenade part 3,5 s plus tard… même si elle est encore dans ta main.`,
  () => '4 secondes sans être touché, et la vie remonte toute seule, vite.',
  () => 'Chaque adversaire mis hors jeu te rend un chargeur de ton arme principale.',
  () => 'Un chevron bleu au-dessus d’une tête : un allié, même à travers les murs.',
  (k) => `${k('visee')} : la visée. La sensibilité suit la focale, le regard ne s’emballe pas.`,
];
const ASTUCES_PROP = [
  (k) => `Prop : vise un meuble et ${k('deguiser')} pour le devenir. ${k('verrou')} aligne ton cap sur celui des voisins.`,
  () => 'Un vrai meuble ne tressaille jamais. Un prop touché, si : bouge quand personne ne regarde.',
  () => 'Chasseur : chaque balle dans un vrai meuble te coûte 3 PV. Viser juste te soigne.',
  (k) => `La provocation obligatoire finit toujours par partir : lance-la toi-même (${k('provocVite')}) au bon moment.`,
  () => 'Une chaise de trop autour d’une table, un tabouret tourné de travers : c’est souvent là.',
];
const ASTUCES_STAND = [
  () => 'Le mannequin à 10 m affiche la zone et les dégâts de chaque balle.',
  () => 'Une tête compte double : vise un peu plus haut que le buste.',
  () => 'Tir soutenu : le recul suit un motif — à 15 m, il s’apprend en trois chargeurs.',
];

// ---------------------------------------------------------------- petits outils
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const jv = (v) => esc(JSON.stringify(v));
// (arrondi à la seconde AVANT le partage : 59,6 s font « 1:00 », pas « 0:60 »)
const mmss = (s) => { const t = Math.max(0, Math.round(+s || 0)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
// (les milliers séparés d'une espace, comme au stand : « 1 125 »)
const milliers = (v) => String(Math.round(+v || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const limites = () => (TELEPHONE ? LIMITES.tel : LIMITES.pc);
const lisse = (u) => u * u * (3 - 2 * u);
const borne = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const nomZone = (z) => (ZONES_JEU[z] ? ZONES_JEU[z].nom : z);
// la famille d'écran de réglages d'une partie (son id)
export const familleDe = (id) => (id === 'prophunt' ? 'prop' : id === 'stand' ? 'stand' : id === 'equipes' || id === 'melee' || id === 'domination' ? 'combat' : null);
// les étapes de Partie.preparer (js/jeu/partie.js), dans l'ordre où elles arrivent ; « Meubles » au prop hunt seulement
const ETAPES = [['plan', 'Plan de l’école'], ['eleves', 'Les élèves arrivent'], ['meubles', 'Meubles'], ['armes', 'Armes et effets']];
const cleEtape = (t) => { const s = String(t || '').replace(/['’]/g, '’').toLowerCase(); const E = ETAPES.find(([, n]) => n.toLowerCase() === s); return E ? E[0] : null; };
// le chargement d'une classe, en clair (FA-24 « Faucon » + P-17 « Moineau » · grenade · flash · couteau)
export function dotationTexte(id) {
  // (L-P : une classe personnalisée, ou une classe de départ avec ce que le profil lui a débloqué)
  const P = MENUS.courant && MENUS.courant.profil;
  if (P && (/^perso[1-5]$/.test(id) || CLASSES_DEPART[id])) {
    const E = P.equipement(id), n = (a) => (ARMES[a] ? ARMES[a].nom : a), t = [`${n(E.principale)}${E.accessoire ? ' + ' + ACCESSOIRES[E.accessoire].nom.toLowerCase() : ''} + ${n(E.secondaire)}`];
    if (E.letale) t.push('une grenade');
    if (E.tactique) t.push(E.tactique[1] > 1 ? '2 flashs' : 'une flash');
    if (E.atout) t.push('atout ' + ATOUTS[E.atout].nom);
    t.push('couteau');
    return t.join(' · ');
  }
  const C = CLASSES[id]; if (!C) return '';
  const n = (a) => (ARMES[a] ? ARMES[a].nom : a);
  const t = [`${n(C.principale)} + ${n(C.secondaire)}`];
  if (C.letale) t.push(C.letale[1] > 1 ? `${C.letale[1]} grenades` : 'une grenade');
  if (C.tactique) t.push(C.tactique[1] > 1 ? `${C.tactique[1]} flashs` : 'une flash');
  if (C.couteau) t.push('couteau');
  return t.join(' · ');
}

// UNE VIGNETTE DE PORTRAIT : l'image précalculée (js/jeu/portraits.js) ou, sans image, l'initiale sur un dégradé aux
// couleurs de la fiche — jamais un carré vide (une image qui ne charge pas retombe sur l'initiale)
export function vignette(fiche, cls = '') {
  const f = fiche || FICHE_HAYTHEM, url = portrait(f);
  const initiale = () => {
    const s = document.createElement('span');
    s.className = 'portrait-initiale ' + cls;
    s.style.setProperty('--c1', f.color1 || '#3a4560'); s.style.setProperty('--c2', f.color2 || '#131826');
    s.textContent = String(f.nom || f.name || '?').charAt(0).toUpperCase();
    return s;
  };
  if (!url) return initiale();
  const img = document.createElement('img');
  img.className = 'portrait ' + cls; img.src = url; img.alt = ''; img.width = 192; img.height = 192;
  img.decoding = 'async'; img.draggable = false;
  img.onerror = () => { if (img.parentNode) img.replaceWith(initiale()); };
  return img;
}

const _w = new THREE.Vector3();
// le menu de la session (un seul : js/jeu/index.js le crée) — pour les tests et la vague 3 (L-P)
export const MENUS = { courant: null };

export class MenuJeu {
  constructor(game, deps) {
    this.game = game; this.deps = deps || {}; MENUS.courant = this;
    this.corps = new CorpsFixe();                  // (le corps fictif que suit la carte vivante au menu : game.carteMenu)
    this.tCam = 0; this.plan = 0; this.fondu = 0; this.figer = null;
    this.modeReglage = null; this._lance = null; this._dernier = null;     // (la partie demandée par le menu ; la dernière lancée)
    this._imgs = new Map();                        // les vignettes des amis, faites une fois (pas de rechargement à chaque clic)
    this._tFin = null; this._tAstuce = null; this._suivi = null;
    // `compterTypes(zone)` : le nombre de types déguisables d'une zone (js/jeu/deguisements.js) — remplaçable par un test
    this.compterTypes = (z) => { this._registre(); return typesDeguisables(z).length; };
    this._rattraper();
    this._construire();
    // (L-P) l'armurerie, le profil et sa barre d'XP
    this.prog = new MenuProgression(game, this); this.profil = this.prog.profil;
    // (à la manette : B revient de chaque sous-écran ; le focus, en arrivant, sur l'action principale de l'écran)
    ajouterRacine('menu-jeu', { defaut: '#menu-jeu [data-act="balade"]' });
    ajouterRacine('reglage-jeu', { retour: '#reglage-jeu [data-act="retour"]', defaut: '#reglage-jeu [data-act="lancer"]', avant: 'menu-jeu' });
    ajouterRacine('credits-jeu', { retour: '#credits-jeu [data-act="retour"]', defaut: '#credits-jeu [data-act="retour"]', avant: 'menu-jeu' });
    ajouterRacine('fin-jeu', { defaut: '#fin-jeu [data-act="rejouer"]' });
    document.addEventListener('iris-menu', () => { this.tCam = 0; this.accueil(); });
    document.addEventListener('iris-partie', (e) => this._surPartie(e.detail || {}));
    document.addEventListener('hoops-entree', () => this._majAide());
    // ÉCHAP (ou la touche de la pause) : revient des réglages et des crédits ; sur l'écran de fin, ne rouvre pas la pause
    // par-dessus (la partie est finie). En phase de capture, avant js/input.js (qui écoute la fenêtre, à la remontée).
    window.addEventListener('keydown', (e) => this._clavier(e), true);
  }

  // ================================================================ le DOM (créé une fois)
  _construire() {
    const B = document.body;
    // le fondu au noir de la caméra du menu (sous les écrans ; caché d'office en balade et en partie : body.en-jeu)
    this.voile = Object.assign(document.createElement('div'), { id: 'menu-fondu' });
    B.appendChild(this.voile);
    // L'ACCUEIL
    const d = document.createElement('div');
    d.id = 'menu-jeu'; d.className = 'menu-jeu'; d.hidden = true;
    d.innerHTML = '<div class="mj-col"><div class="mj-tete"><div class="menu-jeu-titre mj-titre">IRIS</div>'
      + '<div class="mj-sous">L’ÉCOLE · BALADE · COMBAT · PROP HUNT</div><div class="mj-xp" hidden></div>'
      + `<div class="mj-prog">${ACCUEIL.filter((A) => A.tete).map((A) => `<button class="mj-p" data-act="${A.act}">${A.titre}</button>`).join('')}</div></div>`
      + '<nav class="menu-jeu-liste mj-liste">' + ACCUEIL.filter((A) => !A.tete).map((A, i) => `<button class="menu-jeu-bouton mj-b" data-act="${A.act}" style="--i:${i}">`
        + `<span class="mj-b-t">${A.titre}</span></button>`).join('') + '</nav><div class="mj-aide"></div></div>'
      + '<aside class="mj-info"><div class="mj-info-t"></div><div class="mj-info-x"></div></aside>';
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) this._agir(b.dataset.act); });
    d.addEventListener('mouseover', (e) => { const b = e.target.closest('.mj-b, .mj-p'); if (b) this._info(b.dataset.act); });
    d.addEventListener('focusin', (e) => { const b = e.target.closest('.mj-b, .mj-p'); if (b) this._info(b.dataset.act); });
    B.appendChild(d); this.el = d;
    // LES RÉGLAGES (un écran, trois contenus : data-screen = combat | prop | stand)
    const r = document.createElement('div');
    r.id = 'reglage-jeu'; r.className = 'reglage-jeu'; r.hidden = true;
    r.innerHTML = '<div class="rj-boite"><header class="rj-tete"><button class="back rj-retour" data-act="retour">← RETOUR</button>'
      + '<h2 class="rj-titre"></h2><span class="rj-fil"></span></header><div class="rj-corps"></div>'
      + '<footer class="rj-pied"><div class="rj-resume"></div><button class="btn-primary rj-lancer" data-act="lancer">LANCER</button></footer></div>';
    r.addEventListener('click', (e) => this._clicReglage(e));
    B.appendChild(r); this.regEl = r; this.regCorps = r.querySelector('.rj-corps');
    // LA PRÉPARATION
    const p = document.createElement('div');
    p.id = 'prep-jeu'; p.className = 'prep-jeu'; p.hidden = true;
    p.innerHTML = '<div class="pj-boite"><div class="prep-jeu-titre pj-titre">PRÉPARATION DE LA PARTIE</div><div class="pj-mode"></div>'
      + '<ol class="pj-etapes"></ol><div class="prep-jeu-barre"><div class="prep-jeu-plein"></div></div>'
      + '<div class="prep-jeu-etape pj-etape"></div><div class="pj-astuce"></div></div>';
    B.appendChild(p); this.prep = p;
    // LA FIN (un écran à elle : jamais l'écran de pause)
    const f = document.createElement('div');
    f.id = 'fin-jeu'; f.className = 'fin-jeu'; f.hidden = true;
    f.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b) this._agir(b.dataset.act); else if (!f.classList.contains('bilan')) this._montrerBilan();   // (un clic passe le bandeau)
    });
    B.appendChild(f); this.finEl = f;
    // LES CRÉDITS
    const c = document.createElement('div');
    c.id = 'credits-jeu'; c.className = 'credits-jeu'; c.hidden = true;
    c.innerHTML = CREDITS_HTML;
    c.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) this._agir(b.dataset.act); });
    B.appendChild(c); this.credEl = c;
    this._info('balade'); this._majAide();
  }

  // ================================================================ les actions (boutons de tous les écrans)
  _agir(act) {
    const D = this.deps, g = this.game;
    if (act === 'balade') {
      this.cacher(); this._fondu(0);
      if (D.quitter) D.quitter('balade'); else g.enterLobby();
      g.input?.purger?.();                         // (la touche qui a validé ne part pas en saut ou en « s'asseoir »)
    } else if (act === 'menu') { this.cacher(); if (D.quitter) D.quitter('menu'); else g.entrerMenu(); }
    else if (act === 'combat') this.reglage('combat');
    else if (act === 'prophunt') this.reglage('prop');
    else if (act === 'stand') this.reglage('stand');
    else if (act === 'armurerie') this.prog.armurerie();
    else if (act === 'mesClasses') this.prog.armurerie(null, { retour: 'combat' });
    else if (act === 'profil') this.prog.profilEcran();
    else if (act === 'options') D.options?.open?.();
    else if (act === 'credits') this.credits();
    else if (act === 'retour') this.accueil();
    else if (act === 'lancer') this._lancer();
    else if (act === 'rejouer') this._rejouer();
    else if (act === 'changer') {
      const fam = familleDe(this._finId || (g.partie && g.partie.id));
      this.cacher();
      if (D.quitter) D.quitter('menu'); else g.entrerMenu();
      if (fam) this.reglage(fam);
    }
  }
  _clavier(e) {
    const ouvert = (el) => el && !el.hidden;
    if (ouvert(document.getElementById('options')) || ouvert(document.getElementById('overlay'))) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const pause = e.code === 'Escape' || ((this.game.input && this.game.input.bind && this.game.input.bind.pause) || []).includes(e.code);
    if (ouvert(this.finEl)) {
      if (pause) { e.preventDefault(); e.stopImmediatePropagation(); if (!this.finEl.classList.contains('bilan')) this._montrerBilan(); }
      else if (this.finEl.classList.contains('bilan')) this._naviguer(e, this.finEl, '[data-act="rejouer"]');
      return;
    }
    if (this.game.mode !== 'menu') return;
    const prog = this.prog && (ouvert(this.prog.armEl) ? this.prog.armEl : ouvert(this.prog.profEl) ? this.prog.profEl : null);
    if (pause && prog) { e.preventDefault(); e.stopImmediatePropagation(); this.prog.revenir(); return; }
    if (pause && (ouvert(this.regEl) || ouvert(this.credEl))) { e.preventDefault(); e.stopImmediatePropagation(); this.accueil(); return; }
    if (prog) this._naviguer(e, prog, prog === this.prog.armEl ? '.ar-classe.on' : '[data-act="retour"]');
    else if (ouvert(this.regEl)) this._naviguer(e, this.regEl, '[data-act="lancer"]');
    else if (ouvert(this.credEl)) this._naviguer(e, this.credEl, '[data-act="retour"]');
    else if (ouvert(this.el)) this._naviguer(e, this.el, '[data-act="balade"]');
  }
  // LE CLAVIER DANS UN ÉCRAN DU MENU : js/input.js empêche l'action par défaut des touches qu'il lie (ENTRÉE = interagir,
  // ESPACE = sauter, les flèches, Tab) — un bouton focalisé ne se validait donc pas au clavier, et Tab ne parcourait rien.
  // Les flèches mènent le focus au bouton le plus proche dans leur direction (comme la croix de la manette ; le premier
  // appui le pose sur l'action principale de l'écran), ENTRÉE ou ESPACE valident le bouton focalisé. Écouté en capture :
  // js/input.js ne voit pas ces touches-là.
  _naviguer(e, ecran, defaut) {
    const DIR = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const act = document.activeElement, dedans = !!act && act.tagName === 'BUTTON' && ecran.contains(act) && !act.disabled;
    if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
      if (!dedans) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (!e.repeat) act.click();
      return;
    }
    const d = DIR[e.code]; if (!d) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const L = [...ecran.querySelectorAll('button')].filter((b) => !b.disabled && b.getClientRects().length);
    let cible = null;
    if (!dedans) cible = ecran.querySelector(defaut) || L[0];
    else {
      // (l'écart DE TRAVERS se mesure entre les bords : deux boutons d'une même colonne, de largeurs différentes et alignés à
      // gauche, se recouvrent en x — écart nul — même si leurs centres ne sont pas l'un sous l'autre)
      // Dans une fiche qui DÉFILE (le corps des réglages, des crédits), on cherche d'abord dans elle, lignes cachées comprises
      // (elles défilent jusqu'au focus) ; sinon, et depuis le dehors, parmi ce qui se voit — LANCER ne vole pas le focus à
      // la ligne suivante, cachée sous le pli.
      const a = act.getBoundingClientRect(), v = d[1] !== 0, boite = (b) => b.closest('.rj-corps, .cr-corps, .ar-detail, .ar-classes');
      const vu = (b) => { const c = boite(b); if (!c) return true; const r = b.getBoundingClientRect(), k = c.getBoundingClientRect(); return r.bottom > k.top + 2 && r.top < k.bottom - 2; };
      const meilleur = (C) => {
        let best = Infinity, m = null;
        for (const b of C) {
          if (b === act) continue;
          const r = b.getBoundingClientRect();
          const le = v ? (r.top + r.height / 2 - a.top - a.height / 2) * d[1] : (r.left + r.width / 2 - a.left - a.width / 2) * d[0];
          if (le < 4) continue;                       // (devant, dans la direction demandée)
          const travers = v ? Math.max(0, Math.max(a.left, r.left) - Math.min(a.right, r.right)) : Math.max(0, Math.max(a.top, r.top) - Math.min(a.bottom, r.bottom));
          if (!v && travers > 0) continue;            // (← → restent sur la ligne : au bout, rien ne bouge)
          const note = le + 3 * travers;
          if (note < best) { best = note; m = b; }
        }
        return m;
      };
      const B = boite(act);
      cible = (B && meilleur(L.filter((b) => boite(b) === B))) || meilleur(L.filter((b) => (!B || boite(b) !== B) && vu(b)));
    }
    if (cible) { cible.focus(); cible.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }

  // ================================================================ L'ACCUEIL
  accueil() {
    this.cacher();
    if (this.el) { this.el.hidden = false; this._majAide(); this.prog?.majBarre(); }
  }
  // tout caché (les minuteries arrêtées)
  cacher() {
    this.prog?.cacher();
    for (const e of [this.el, this.regEl, this.prep, this.finEl, this.credEl]) if (e) e.hidden = true;
    if (this.finEl) this.finEl.classList.remove('bilan');
    clearTimeout(this._tFin); this._tFin = null;
    clearInterval(this._tAstuce); this._tAstuce = null;
  }
  _info(act) {
    const A = ACCUEIL.find((x) => x.act === act); if (!A || this._infoAct === act) return;
    this._infoAct = act;
    this.el.querySelector('.mj-info-t').textContent = A.titre;
    this.el.querySelector('.mj-info-x').textContent = A.texte;
  }
  // l'aide en bas de l'accueil, dans la langue de la dernière entrée (clavier, manette, doigt)
  _majAide() {
    const a = this.el && this.el.querySelector('.mj-aide'); if (!a) return;
    const html = entree.manette ? `${padGlyph('Pad:A')} choisir · ${padGlyph('Pad:B')} revenir · croix ou stick : se déplacer`
      : document.body.classList.contains('touch') ? 'Touche une porte pour l’ouvrir' : '<kbd>↑</kbd><kbd>↓</kbd> choisir · <kbd>ENTRÉE</kbd> valider · <kbd>ÉCHAP</kbd> revenir';
    if (a.innerHTML !== html) a.innerHTML = html;
  }

  // ================================================================ LES RÉGLAGES DE PARTIE (§ 2.2)
  // les derniers choix, dans settings.jeu (remis d'aplomb : un réglage hors bornes revient dans les bornes)
  _jeu() {
    const s = this.game.settings, d = s && s.data ? s.data : (this._donnees || (this._donnees = { jeu: {} }));
    const J = d.jeu || (d.jeu = {});
    const c = J.combat || (J.combat = {});
    if (!MODES_COMBAT[c.mode]) c.mode = 'equipes';
    if (!ZONES_COMBAT.includes(c.zone)) c.zone = 'ecole';
    if (!DIFFS_COMBAT.some(([v]) => v === c.difficulte)) c.difficulte = 'regulier';
    // (L-P : une classe personnalisée est un choix permis ; une classe verrouillée — un profil neuf, un autre appareil —
    // revient à l'Assaut au lancement, pas dans les réglages)
    if (!CLASSES[c.classe] && !/^perso[1-5]$/.test(c.classe || '')) c.classe = 'assaut';
    if (!Array.isArray(c.avatars)) c.avatars = [];
    c.avatars = c.avatars.filter((id) => FICHES_BOTS.some((f) => f.id === id)).slice(0, limites().avatars);
    const L = limites();
    if (!Number.isFinite(c.allies)) c.allies = TELEPHONE ? 1 : 3;
    if (!Number.isFinite(c.ennemis)) c.ennemis = TELEPHONE ? 2 : 4;
    c.allies = borne(Math.round(c.allies), 0, 4); c.ennemis = borne(Math.round(c.ennemis), 1, 5);
    if (c.allies + c.ennemis > L.bots) { c.allies = TELEPHONE ? 1 : 3; c.ennemis = TELEPHONE ? 2 : 4; }
    // (`adversaires`, `limites` et `jeu.stand` ne sont pas dans les DEFAULTS de js/settings.js, qui les oublie à la
    // relecture : _rattraper les reprend de la sauvegarde brute au démarrage — DEMANDE 1 à INT dans le rapport L-U)
    if (!Number.isFinite(c.adversaires)) c.adversaires = TELEPHONE ? 3 : 5;
    c.adversaires = borne(Math.round(c.adversaires), 1, Math.min(5, L.bots));
    const Lm = c.limites && typeof c.limites === 'object' ? c.limites : (c.limites = {});
    for (const m of Object.keys(MODES_COMBAT)) {
      const q = Lm[m] && typeof Lm[m] === 'object' ? Lm[m] : (Lm[m] = {});
      if (!LIMITES_MODE[m].choix.includes(q.score)) q.score = LIMITES_MODE[m].score;
      if (!DUREES.includes(q.duree)) q.duree = 600;
    }
    const p = J.prop || (J.prop = {});
    if (p.zone !== null && !ZONES_PROP.includes(p.zone)) p.zone = null;
    if (!MANCHES.includes(p.manches)) p.manches = REGLAGES_PROP.manches;
    if (!Number.isFinite(p.acteurs)) p.acteurs = REGLAGES_PROP.acteurs;
    p.acteurs = borne(Math.round(p.acteurs), REGLAGES_PROP.acteursMin, Math.min(REGLAGES_PROP.acteursMax, L.bots + 1));
    if (!DIFFS_PROP.some(([v]) => v === p.difficulte)) p.difficulte = 'facile';
    if (!PREMIERS_ROLES.some(([v]) => v === p.premierRole)) p.premierRole = 'prop';
    p.chasseurSeul = !!p.chasseurSeul;
    const a = p.aides && typeof p.aides === 'object' ? p.aides : (p.aides = {});
    a.discretion = a.discretion !== false; a.oeil = a.oeil !== false; a.voirSons = a.voirSons === undefined ? TELEPHONE : !!a.voirSons;
    const st = J.stand && typeof J.stand === 'object' ? J.stand : (J.stand = {});
    if (!DEFIS.some(([v]) => v === st.defi)) st.defi = null;
    if (!CLASSES[st.classe]) st.classe = 'assaut';
    if (J.habillage !== 'militaire') J.habillage = 'airsoft';
    return J;
  }
  // LES CHOIX QUE js/settings.js NE CONNAÎT PAS ENCORE (ses DEFAULTS : DEMANDE 1 à INT) — la limite et le temps par mode,
  // les adversaires du chacun pour soi, le défi et la classe du stand : la sauvegarde les garde, mais sa relecture
  // (deepMerge contre les DEFAULTS) les oublie ; rattrapés une fois, au démarrage, depuis la sauvegarde BRUTE (lue, jamais
  // écrite ; `brut` pour les tests), puis remis d'aplomb par _jeu comme le reste. Sans effet le jour où INT les ajoute.
  _rattraper(brut) {
    if (brut === undefined) { try { brut = JSON.parse(localStorage.getItem(REGLAGES_CLE) || 'null'); } catch (e) { brut = null; } }
    const s = this.game.settings, J = s && s.data && s.data.jeu, B = brut && brut.jeu;
    if (!J || !B || typeof B !== 'object') return;
    const C = J.combat || (J.combat = {}), Cb = B.combat && typeof B.combat === 'object' ? B.combat : {};
    if (C.limites === undefined && Cb.limites && typeof Cb.limites === 'object') C.limites = JSON.parse(JSON.stringify(Cb.limites));
    if (C.adversaires === undefined && Number.isFinite(Cb.adversaires)) C.adversaires = Cb.adversaires;
    if (J.stand === undefined && B.stand && typeof B.stand === 'object') J.stand = { defi: B.stand.defi ?? null, classe: B.stand.classe };
  }
  // écrire un réglage (par settings.set : enregistré, puis game.applySettings comme tout réglage)
  _poser(chemin, v) {
    const s = this.game.settings;
    if (s && s.set) s.set(chemin, v);
    else { const ks = chemin.split('.'); let o = this._donnees || (this._donnees = { jeu: {} }); for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]] || (o[ks[i]] = {}); o[ks[ks.length - 1]] = v; }
  }
  _valeur(chemin) {
    const s = this.game.settings, d = s && s.data ? s.data : this._donnees;
    return chemin.split('.').reduce((o, k) => (o ? o[k] : undefined), d);
  }
  // le registre des meubles rangé par pièce (une fois) : c'est lui qui dit combien de types une zone peut prêter
  _registre() {
    if (this._registreFait) return;
    this._registreFait = true;
    try { rattraperRegistre(this.game.scene); zonerRegistre(this.game.carte && this.game.carte.lumieres); } catch (e) { console.warn('[menus] registre', e); }
  }
  // les zones du prop hunt : chacune avec son compte de types déguisables, grisée sous 6 (§ 2.2, R5) ; la zone par
  // défaut, calculée comme PartieProp la calcule au lancement (le −1 s'il a 6 types, sinon le 1er)
  zonesProp() {
    const R = {}, min = REGLAGES_PROP.typesMin || 6;
    for (const z of ZONES_PROP) {
      const n = this.compterTypes(z), ok = n >= min;
      R[z] = { n, ok, raison: ok ? '' : z === 'ss' && n === 0 ? 'meubles du −1 pas encore au registre (espace pause en travaux)'
        : `${n} type${n > 1 ? 's' : ''} de meuble déguisable${n > 1 ? 's' : ''} — il en faut ${min}` };
    }
    const defaut = R.ss.ok ? 'ss' : REGLAGES_PROP.zoneRepli || 'e1';
    return { R, defaut };
  }

  reglage(mode) {
    const m = mode === 'prop' || mode === 'prophunt' ? 'prop' : mode === 'stand' ? 'stand' : 'combat';
    this.cacher();
    this.modeReglage = m;
    this.regEl.dataset.screen = m;
    this._jeu();
    this._rendreReglage();
    this.regEl.hidden = false;
    this.regCorps.scrollTop = 0;
  }
  // une ligne de réglage : libellé (+ explication) à gauche, le réglage à droite
  _ligne(id, titre, sous, ctl, cls = '') {
    return `<div class="rj-ligne ${cls}" data-ligne="${id}"><div class="rj-lbl">${titre}${sous ? `<small>${sous}</small>` : ''}</div><div class="rj-ctl">${ctl}</div></div>`;
  }
  // un groupe de choix : [valeur, libellé, info-bulle, grisé (raison) ?]
  _choix(chemin, options, cur) {
    return `<div class="seg rj-seg" data-seg="rj.${chemin}">${options.map(([v, l, t, ko]) => `<button data-champ="${chemin}" data-v="${jv(v)}"`
      + ` class="${JSON.stringify(v) === JSON.stringify(cur) ? 'on' : ''}${ko ? ' ko' : ''}"${ko ? ` disabled title="${esc(ko)}"` : t ? ` title="${esc(t)}"` : ''}>${l}</button>`).join('')}</div>`;
  }
  _compteur(chemin, v, lo, hi, nom) {
    const id = chemin.replace(/\./g, '-');
    return `<div class="rj-pas" data-pas="${chemin}"><button id="rj-${id}-m" data-champ="${chemin}" data-d="-1"${v <= lo ? ' disabled' : ''} aria-label="moins">−</button>`
      + `<span class="rj-pas-v">${v}</span><button id="rj-${id}-p" data-champ="${chemin}" data-d="1"${v >= hi ? ' disabled' : ''} aria-label="plus">+</button>`
      + (nom ? `<span class="rj-pas-n">${nom}</span>` : '') + '</div>';
  }
  _bascule(chemin, v, libelle) {
    return `<button class="rj-bascule${v ? ' on' : ''}" id="rj-${chemin.replace(/\./g, '-')}" data-champ="${chemin}" data-bascule="1" role="switch" aria-checked="${!!v}">`
      + `<i></i>${libelle ? `<span>${libelle}</span>` : ''}</button>`;
  }
  _amis() {
    const J = this._jeu(), ids = J.combat.avatars, max = limites().avatars;
    let h = '<div class="rj-amis">';
    for (const f of FICHES_BOTS) {
      const on = ids.includes(f.id), plein = !on && ids.length >= max;
      h += `<button class="rj-ami${on ? ' on' : ''}" id="rj-ami-${f.id}" data-champ="jeu.combat.avatars" data-ami="${f.id}"${plein ? ' disabled title="' + max + ' visages au plus sur cet appareil"' : ''}`
        + ` aria-pressed="${on}"><span class="rj-ami-img" data-img="${f.id}"></span><b>${esc(f.nom)}</b><i class="rj-coche"></i></button>`;
    }
    return h + '</div>';
  }
  _rendreReglage() {
    const m = this.modeReglage, J = this._jeu(), L = limites();
    let h = '', titre = '', fil = '', resume = '';
    const amisSous = (ids) => (ids.length ? `Les bots prennent les visages cochés (${ids.length}${ids.length < limites().avatars ? '' : ', le plus possible ici'}). Demande à chacun avant de montrer son visage dans une vidéo.`
      : 'Aucun ami coché : les bots sont des clones de Haythem, teints aux couleurs de leur équipe.');
    if (m === 'combat') {
      const c = J.combat, Lm = LIMITES_MODE[c.mode], q = c.limites[c.mode], A = J.habillage === 'airsoft';
      titre = 'COMBAT';
      h += this._ligne('habillage', 'Habillage', 'Airsoft (conseillé) : impacts de peinture, « TOUCHÉ », tir au gaz. Pour toute vidéo publiée, reste en Airsoft.',
        this._choix('jeu.habillage', HABILLAGES, J.habillage), 'rj-tete-ligne');
      h += this._ligne('mode', 'Mode', MODES_COMBAT[c.mode].texte, this._choix('jeu.combat.mode', Object.entries(MODES_COMBAT).map(([k, v]) => [k, v.court, v.nom]), c.mode));
      const dom = c.mode === 'domination', zone = dom ? 'ecole' : c.zone;
      h += this._ligne('zone', 'Zone', dom ? 'La domination se joue sur toute l’école : A le hall, B la pause du −1, C la pause du 1er.' : 'Les zones plus petites ferment les passages par une rubalise.',
        this._choix('jeu.combat.zone', ZONES_COMBAT.map((z) => [z, nomZone(z).toUpperCase(), '', dom && z !== 'ecole' ? 'La domination n’existe que sur toute l’école' : null]), zone));
      const nb = c.mode === 'melee' ? c.adversaires : c.allies + c.ennemis;
      const avert = nb > L.conseil ? `<span class="rj-avert">${nb} bots : au-delà de ${L.conseil}, l’image peut ramer ${TELEPHONE ? 'sur ce téléphone' : 'sur ce PC'} (${L.bots} au plus).</span>` : '';
      if (c.mode === 'melee') {
        h += this._ligne('effectifs', 'Adversaires', `Toi contre ${c.adversaires} bot${c.adversaires > 1 ? 's' : ''}, chacun pour soi. ${avert}`,
          this._compteur('jeu.combat.adversaires', c.adversaires, 1, Math.min(5, L.bots), 'bots'));
      } else {
        h += this._ligne('effectifs', 'Effectifs', `${EQUIPES.A.nom} : toi + ${c.allies} allié${c.allies > 1 ? 's' : ''} · ${EQUIPES.B.nom} : ${c.ennemis} ennemi${c.ennemis > 1 ? 's' : ''} · ${nb} bots. ${avert}`,
          '<div class="rj-duo">' + this._compteur('jeu.combat.allies', c.allies, 0, Math.min(4, L.bots - c.ennemis), 'alliés')
          + this._compteur('jeu.combat.ennemis', c.ennemis, 1, Math.min(5, L.bots - c.allies), 'ennemis') + '</div>');
      }
      const D = DIFFS_COMBAT.find(([v]) => v === c.difficulte);
      h += this._ligne('difficulte', 'Difficulté', D[2], this._choix('jeu.combat.difficulte', DIFFS_COMBAT, c.difficulte));
      h += this._ligne('limite', 'Limite', `La partie s’arrête à ${q.score} ${A ? Lm.uniteA : Lm.unite} ou au bout du temps.`,
        this._choix(`jeu.combat.limites.${c.mode}.score`, Lm.choix.map((v) => [v, String(v)]), q.score));
      h += this._ligne('temps', 'Temps', '', this._choix(`jeu.combat.limites.${c.mode}.duree`, DUREES.map((v) => [v, mmss(v)]), q.duree));
      // (L-P : les quatre classes de départ — une classe verrouillée grisée avec son niveau — et, si c'est elle qu'on a prise, la
      // classe PERSONNALISÉE choisie à l'armurerie ; « MES CLASSES » ouvre l'armurerie, et y revient)
      const Lc = this.profil ? this.profil.classes() : CLASSES_MENU.map(([id, nom]) => ({ id, nom, verrou: 0 }));
      const cJ = Lc.some((x) => x.id === c.classe && !x.verrou) ? c.classe : 'assaut';
      const proposees = Lc.filter((x) => !x.perso || x.id === cJ);
      h += this._ligne('classe', 'Classe', dotationTexte(cJ) + (cJ !== c.classe ? ' (ta classe n’est pas encore débloquée)' : ''),
        this._choix('jeu.combat.classe', proposees.map((x) => [x.id, x.nom, dotationTexte(x.id), x.verrou ? `Niveau ${x.verrou}` : null]), cJ)
        + (this.profil ? '<button class="btn-secondary rj-mesclasses" data-act="mesClasses">MES CLASSES</button>' : ''), 'rj-classes');
      h += this._ligne('avatars', 'Avatars des bots', amisSous(c.avatars), this._amis(), 'rj-large');
      fil = `${MODES_COMBAT[c.mode].nom.toUpperCase()} · ${nomZone(zone).toUpperCase()}`;
      resume = [MODES_COMBAT[c.mode].court, nomZone(zone), c.mode === 'melee' ? `toi + ${c.adversaires}` : `${c.allies + 1} c. ${c.ennemis}`, D[1], `${q.score} ${Lm.unite === 'points' ? 'pts' : A ? 'touchés' : 'élim.'}`, mmss(q.duree),
        (Lc.find((x) => x.id === cJ) || { nom: 'ASSAUT' }).nom, A ? 'AIRSOFT' : 'MILITAIRE'].join(' · ');
    } else if (m === 'prop') {
      const p = J.prop, Z = this.zonesProp(), zv = p.zone && Z.R[p.zone] && Z.R[p.zone].ok ? p.zone : null, zEff = zv || Z.defaut;
      titre = 'PROP HUNT';
      const tousGrises = ZONES_PROP.every((z) => !Z.R[z].ok);
      const raisons = ZONES_PROP.filter((z) => !Z.R[z].ok).map((z) => `<span class="rj-raison"><b>${esc(nomZone(z))}</b> : ${esc(Z.R[z].raison)}</span>`).join('');
      h += this._ligne('zone', 'Zone', `AUTO : ${esc(nomZone(Z.defaut))} (le −1 dès qu’il a 6 types de meubles, sinon le 1er).`
        + (tousGrises ? ' Aucune zone n’a encore 6 types : la partie se joue au 1er avec le meuble de secours.' : '') + raisons,
        this._choix('jeu.prop.zone', [[null, 'AUTO', `Calculée au lancement : ${nomZone(Z.defaut)}`], ...ZONES_PROP.map((z) => [z, nomZone(z).toUpperCase(), `${Z.R[z].n} types déguisables`, Z.R[z].ok ? null : Z.R[z].raison])], zv), 'rj-large');
      h += this._ligne('manches', 'Manches', 'Ton rôle change à chaque manche.', this._choix('jeu.prop.manches', MANCHES.map((v) => [v, String(v)]), p.manches));
      // (l'avertissement au-delà du conseil de l'appareil — jamais sur la partie par défaut : au téléphone, ses 5 joueurs font
      // 4 bots, un de plus que le conseil de 3, et ce sont surtout des meubles, pas des avatars)
      const nC = REGLAGES_PROP.chasseurs(p.acteurs), bots = p.acteurs - 1, seuil = Math.max(L.conseil, REGLAGES_PROP.acteurs - 1);
      const avert = bots > seuil ? ` <span class="rj-avert">${bots} bots : au-delà de ${seuil}, l’image peut ramer.</span>` : '';
      h += this._ligne('acteurs', 'Joueurs', `${p.acteurs} en tout, toi compris : ${nC} chasseur${nC > 1 ? 's' : ''} et ${p.acteurs - nC} prop${p.acteurs - nC > 1 ? 's' : ''}.${avert}`,
        this._compteur('jeu.prop.acteurs', p.acteurs, REGLAGES_PROP.acteursMin, Math.min(REGLAGES_PROP.acteursMax, L.bots + 1), 'joueurs'));
      const D = DIFFS_PROP.find(([v]) => v === p.difficulte);
      h += this._ligne('difficulte', 'Difficulté', D[2], this._choix('jeu.prop.difficulte', DIFFS_PROP, p.difficulte));
      h += this._ligne('role', 'Premier rôle', 'Le rôle de la première manche ; ensuite, il alterne.', this._choix('jeu.prop.premierRole', PREMIERS_ROLES, p.premierRole));
      h += this._ligne('seul', 'Chasseur seul', 'Quand tu chasses, ton coéquipier bot devient un prop de plus.', this._bascule('jeu.prop.chasseurSeul', p.chasseurSeul, p.chasseurSeul ? 'OUI' : 'NON'));
      h += this._ligne('aides', 'Aides', 'DISCRÉTION : ta jauge de crédibilité · ŒIL : quand un chasseur te regarde · VOIR LES SONS : d’où viennent les bruits.',
        '<div class="rj-trio">' + this._bascule('jeu.prop.aides.discretion', p.aides.discretion, 'DISCRÉTION') + this._bascule('jeu.prop.aides.oeil', p.aides.oeil, 'ŒIL')
        + this._bascule('jeu.prop.aides.voirSons', p.aides.voirSons, 'VOIR LES SONS') + '</div>');
      h += this._ligne('avatars', 'Avatars des bots', amisSous(J.combat.avatars) + ' (les mêmes qu’au combat)', this._amis(), 'rj-large');
      fil = `${nomZone(zEff).toUpperCase()}${zv ? '' : ' (AUTO)'} · ${p.manches} MANCHES`;
      resume = [nomZone(zEff) + (zv ? '' : ' (auto)'), `${p.manches} manches`, `${p.acteurs} joueurs`, D[1], `d’abord ${PREMIERS_ROLES.find(([v]) => v === p.premierRole)[1].toLowerCase()}`].join(' · ');
    } else {
      const st = J.stand, D = DEFIS.find(([v]) => v === st.defi);
      titre = 'STAND DE TIR';
      h += this._ligne('defi', 'Défi', D[2], this._choix('jeu.stand.defi', DEFIS, st.defi));
      // (le stand : les classes de départ seulement — PartieStand ne lit pas l'équipement : demande à INT au rapport L-P)
      h += this._ligne('classe', 'Classe', dotationTexte(st.classe), this._choix('jeu.stand.classe', CLASSES_MENU.map(([v, l]) => [v, l, dotationTexte(v),
        this.profil && !this.profil.classeJouable(v) ? `Niveau ${CLASSES_DEPART[v].niveau}` : null]), st.classe));
      h += this._ligne('records', 'Records', 'Gardés sur cet appareil.', `<div class="rj-records">${this._records()}</div>`, 'rj-large');
      fil = 'LA RUE, DEVANT LA FAÇADE';
      resume = [D[1], CLASSES_MENU.find(([v]) => v === st.classe)[1]].join(' · ');
    }
    this.regEl.querySelector('.rj-titre').textContent = titre;
    this.regEl.querySelector('.rj-fil').textContent = fil;
    this.regEl.querySelector('.rj-resume').textContent = resume;
    this.regCorps.innerHTML = h;
    // les vignettes des amis : les mêmes nœuds d'un rendu à l'autre (une image ne se recharge pas à chaque clic)
    for (const s of this.regCorps.querySelectorAll('[data-img]')) {
      const id = s.dataset.img;
      if (!this._imgs.has(id)) this._imgs.set(id, vignette(FICHES_BOTS.find((f) => f.id === id), 'rj-portrait'));
      s.appendChild(this._imgs.get(id));
    }
  }
  // les records du stand (localStorage 'iris.stand.v1', écrit par js/jeu/partie_stand.js : lu au mieux, jamais exigé)
  // (F2 relecture : lus par lireRecords, au format qu'écrit le stand — `records['<défi>:<arme>'].meilleur` — ; le menu lisait
  // `R[défi]` et montrait « — » partout, records faits ou non ; le meilleur de chaque défi toutes armes confondues, comparé
  // par `meilleur`, la règle du stand)
  _records() {
    const R = (lireRecords() || {}).records || {}, n = (v) => milliers(v ?? 0);
    const s1 = (v) => (Number.isFinite(+v) ? (+v).toFixed(1).replace('.', ',') + ' s' : '');
    const texteDe = (r) => {
      const arme = ARMES[r.arme] ? ` (${ARMES[r.arme].nom.split(' ')[0]})` : '';
      if (r.defi === 'vingt' || r.defi === 'tetes') return (r.reussi ? `${s1(r.temps)} · ${n(r.points)} pts` : `${r.compte} / ${r.objectif} · ${n(r.points)} pts`) + arme;
      if (r.defi === 'recul') return `${r.touches} / ${r.tirs}` + (r.groupement !== null && r.groupement !== undefined ? ` · ${String(r.groupement).replace('.', ',')} cm` : '') + arme;
      return `${r.compte} / ${r.objectif}` + (r.reaction ? ` · ${Math.round(r.reaction * 1000)} ms` : '') + arme;
    };
    const lignes = DEFIS.filter(([v]) => v).map(([v, l]) => {
      let best = null;
      for (const [k, x] of Object.entries(R)) if (k.split(':')[0] === v && x && x.meilleur && meilleur(x.meilleur, best)) best = x.meilleur;
      return `<div><span>${l}</span><b>${esc(best ? texteDe(best) : '—')}</b></div>`;
    });
    return lignes.join('');
  }
  _clicReglage(e) {
    const a = e.target.closest('[data-act]');
    if (a) { this._agir(a.dataset.act); return; }
    const b = e.target.closest('[data-champ]');
    if (!b || b.disabled) return;
    const ch = b.dataset.champ;
    if (b.dataset.ami) {
      const ids = [...this._jeu().combat.avatars], i = ids.indexOf(b.dataset.ami);
      if (i >= 0) ids.splice(i, 1); else if (ids.length < limites().avatars) ids.push(b.dataset.ami);
      this._poser('jeu.combat.avatars', FICHES_BOTS.map((f) => f.id).filter((id) => ids.includes(id)));
    } else if (b.dataset.bascule) this._poser(ch, !this._valeur(ch));
    else if (b.dataset.d) this._poser(ch, (+this._valeur(ch) || 0) + (+b.dataset.d));
    else if (b.dataset.v !== undefined) {
      let v; try { v = JSON.parse(b.dataset.v); } catch (er) { v = b.dataset.v; }
      this._poser(ch, v);
      // (la domination n'existe que sur toute l'école : la zone suit)
      if (ch === 'jeu.combat.mode' && v === 'domination') this._poser('jeu.combat.zone', 'ecole');
    }
    this._jeu();                                    // (bornes : la somme des bots, les visages au plus)
    // (le bouton focalisé — au clavier — retrouvé après le nouveau rendu : le même réglage, la même valeur)
    const focalise = document.activeElement === b, sel = b.id ? '#' + b.id : `[data-champ="${ch}"]${b.dataset.v !== undefined ? `[data-v='${b.dataset.v}']` : ''}`;
    this._rendreReglage();
    if (focalise) { const n = this.regCorps.querySelector(sel); if (n && !n.disabled) n.focus(); }
  }
  // LANCER : les réglages de l'écran en options de partie (§§ 4.5.12, 4.5.14), une graine neuve à chaque partie
  optionsDe(m = this.modeReglage) {
    const J = this._jeu();
    if (m === 'combat') {
      const c = J.combat, q = c.limites[c.mode];
      // (L-P : la classe jouable — verrouillée : l'Assaut — et son ÉQUIPEMENT, tel que le profil l'a débloqué)
      const cl = this.profil && this.profil.classeJouable(c.classe) ? c.classe : CLASSES[c.classe] && !this.profil ? c.classe : 'assaut';
      return { mode: c.mode, opts: { zone: c.mode === 'domination' ? 'ecole' : c.zone, allies: c.mode === 'melee' ? 0 : c.allies, ennemis: c.mode === 'melee' ? c.adversaires : c.ennemis,
        difficulte: c.difficulte, classe: CLASSES[cl] ? cl : 'assaut', equipement: this.profil ? this.profil.equipement(cl) : undefined, avatars: [...c.avatars], scoreCible: q.score, duree: q.duree } };
    }
    if (m === 'prop') {
      const p = J.prop, Z = this.zonesProp();
      // (une zone grisée n'est pas jouée : AUTO — `null`, la zone calculée par PartieProp au lancement)
      return { mode: 'prophunt', opts: { zone: p.zone && Z.R[p.zone] && Z.R[p.zone].ok ? p.zone : null, manches: p.manches, acteurs: p.acteurs, difficulte: p.difficulte,
        premierRole: p.premierRole, chasseurSeul: p.chasseurSeul, aides: { ...p.aides }, avatars: [...J.combat.avatars] } };
    }
    return { mode: 'stand', opts: { defi: J.stand.defi, classe: this.profil && !this.profil.classeJouable(J.stand.classe) ? 'assaut' : J.stand.classe } };
  }
  _lancer(sur = null) {
    const { mode, opts } = sur || this.optionsDe();
    opts.graine = opts.graine || ((Math.random() * 0x7fffffff) >>> 0) || 1;
    this._lance = { mode, opts: { ...opts } };
    const r = this.deps.lancer ? this.deps.lancer(mode, opts) : null;
    // (une partie qui ne démarre pas : on revient à l'accueil, et on le dit)
    if (r && r.then) r.then(() => { if (this.game.partie) return; this._lance = null; if (this.game.mode === 'menu') { this.accueil(); this._dire('La partie n’a pas pu démarrer — réessaie.'); } });
    return r;
  }
  // REJOUER : les mêmes réglages, une graine neuve ; la partie finie quittée VERS LE MENU d'abord — la préparation se fait
  // alors sur l'école vivante du menu, comme après LANCER (et non sur la balade, Haythem au départ et son HUD sous l'écran),
  // et une partie qui ne démarre pas ramène à l'accueil
  _rejouer() {
    const p = this.game.partie, L = p ? { mode: p.id, opts: { ...p.opts } } : this._dernier;
    if (!L) return;
    const o = { ...L.opts }; delete o.mode; o.graine = 0;
    if (p) { this.cacher(); if (this.deps.quitter) this.deps.quitter('menu'); else this.game.entrerMenu(); }
    this._lancer({ mode: L.mode, opts: o });
  }
  _dire(t) {
    const x = this.el && this.el.querySelector('.mj-info-x');
    if (x) { x.textContent = t; this._infoAct = null; }
  }

  // ================================================================ LA PRÉPARATION (« Plan de l'école », « Les élèves
  // arrivent », « Meubles » au prop hunt, « Armes et effets » : les étapes de Partie.preparer, une barre qui ne recule pas)
  preparation(f, etape) {
    if (!this.prep) return;
    if (etape === null || etape === undefined) { if (f >= 1) { this.prep.hidden = true; clearInterval(this._tAstuce); this._tAstuce = null; } return; }
    const k = cleEtape(etape);
    if (this.prep.hidden) {
      for (const e of [this.el, this.regEl, this.finEl, this.credEl]) if (e) e.hidden = true;
      const mode = this._lance ? this._lance.mode : null;
      this._prepEtapes = ETAPES.filter(([c]) => c !== 'meubles' || mode === 'prophunt');
      this._prepMax = 0;
      this.prep.querySelector('.pj-mode').textContent = this._resumeLance();
      this._majEtapes(null);
      this._astuce(0, mode);
      clearInterval(this._tAstuce);
      let n = 0;
      this._tAstuce = setInterval(() => this._astuce(++n, mode), 3500);
      this.prep.hidden = false;
    }
    if (k === 'meubles' && !this._prepEtapes.some(([c]) => c === 'meubles')) this._prepEtapes.splice(2, 0, ETAPES[2]);
    const i = this._prepEtapes.findIndex(([c]) => c === k);
    if (i >= 0) {
      const g = (i + borne(+f || 0, 0, 1)) / this._prepEtapes.length;
      this._prepMax = Math.max(this._prepMax, g);
      this._majEtapes(i, f >= 1);
    }
    this.prep.querySelector('.prep-jeu-plein').style.width = `${(this._prepMax * 100).toFixed(1)}%`;
    this.prep.querySelector('.pj-etape').textContent = etape;
  }
  _majEtapes(i, fini = false) {
    const ol = this.prep.querySelector('.pj-etapes');
    if (i === null) ol.innerHTML = this._prepEtapes.map(([c, n]) => `<li data-etape="${c}">${esc(n)}</li>`).join('');
    if (ol.children.length !== this._prepEtapes.length) ol.innerHTML = this._prepEtapes.map(([c, n]) => `<li data-etape="${c}">${esc(n)}</li>`).join('');
    if (i === null) return;
    [...ol.children].forEach((li, j) => { li.classList.toggle('fait', j < i || (j === i && fini)); li.classList.toggle('en-cours', j === i && !fini); });
  }
  _resumeLance() {
    const L = this._lance; if (!L) return '';
    const o = L.opts;
    if (L.mode === 'prophunt') return `PROP HUNT · ${o.zone ? nomZone(o.zone).toUpperCase() : 'ZONE AUTO'} · ${o.manches || 6} MANCHES`;
    if (L.mode === 'stand') return `STAND DE TIR · ${(DEFIS.find(([v]) => v === (o.defi ?? null)) || DEFIS[0])[1]}`;
    const M = MODES_COMBAT[L.mode];
    return M ? `${M.nom.toUpperCase()} · ${nomZone(o.zone || 'ecole').toUpperCase()}` : '';
  }
  _astuce(n, mode) {
    const L = mode === 'prophunt' ? ASTUCES_PROP : mode === 'stand' ? ASTUCES_STAND : ASTUCES_COMBAT, profil = mode === 'prophunt' ? 'prop' : 'combat';
    const k = (id) => actionKey(id, profil);
    const el = this.prep.querySelector('.pj-astuce');
    try { el.textContent = 'ASTUCE · ' + L[n % L.length](k); } catch (e) { el.textContent = ''; }
  }

  // ================================================================ LA FIN (un écran à elle : bandeau, puis le bilan)
  // `resultat` : { texte } (js/jeu/index.js, sur l'événement 'fin') ; le bilan est lu sur la partie encore là ;
  // `resultat.immediat` : le bilan tout de suite (sans les 2,5 s du bandeau)
  fin(resultat) {
    if (!this.finEl) return;
    const p = this.game.partie, B = this.bilan(p, resultat || {});
    this._finId = p ? p.id : null;
    for (const e of [this.el, this.regEl, this.prep, this.credEl]) if (e) e.hidden = true;
    const f = this.finEl;
    f.className = 'fin-jeu ' + B.cls;
    f.innerHTML = `<div class="fj-bandeau"><div class="fin-jeu-titre fj-titre">${esc(B.titre)}</div><div class="fin-jeu-texte fj-sous">${esc(B.sous)}</div></div>`
      + '<div class="fj-bilan"><div class="fj-podium"></div><div class="fj-chiffres"></div>'
      + '<div class="fj-actions"><button class="btn-primary" data-act="rejouer">REJOUER</button><button class="btn-secondary" data-act="changer">CHANGER DE MODE</button>'
      + '<button class="btn-secondary" data-act="menu">MENU PRINCIPAL</button><button class="btn-secondary" data-act="balade">BALADE</button></div></div>';
    // le podium (2e, 1er, 3e) avec les portraits, puis les chiffres de Haythem
    const pod = f.querySelector('.fj-podium');
    [1, 0, 2].forEach((r) => {
      const a = B.podium[r]; if (!a) return;
      const c = document.createElement('div');
      c.className = `fj-marche fj-r${r + 1}`;
      if (a.couleur) c.style.setProperty('--eq', a.couleur);
      const v = document.createElement('div'); v.className = 'fj-vignette'; v.appendChild(vignette(a.fiche, 'fj-portrait'));
      c.appendChild(v);
      c.insertAdjacentHTML('beforeend', `<div class="fj-rang">${r + 1}</div><div class="fj-nom">${esc(a.nom)}${a.local ? ' <i>(toi)</i>' : ''}</div><div class="fj-score">${esc(a.ligne)}</div>`);
      pod.appendChild(c);
    });
    f.querySelector('.fj-chiffres').innerHTML = B.chiffres.map(([n, v]) => `<div><b>${esc(v)}</b><span>${esc(n)}</span></div>`).join('');
    this._bilanXp(f, p);
    f.hidden = false;
    // (la partie finie, GELÉE sous son écran : le pointeur que js/jeu/index.js rend à la fin déclencherait sinon la pause
    // par-dessus — game.js met en pause sur « iris-pointeur » sans capture —, et rien n'a plus à avancer)
    if (p) this.game.paused = true;
    clearTimeout(this._tFin);
    if (resultat && resultat.immediat) this._montrerBilan();
    else this._tFin = setTimeout(() => this._montrerBilan(), 2500);
  }
  _montrerBilan() {
    clearTimeout(this._tFin); this._tFin = null;
    if (!this.finEl || this.finEl.hidden) return;
    this.finEl.classList.add('bilan');
    // (L-P : la barre d'XP avance depuis l'avant de la partie — une transition CSS ; un niveau franchi la remplit, puis
    // repart du début du nouveau)
    const b = this.finEl.querySelector('.fj-xp-barre i'), X = this._xpFin;
    if (b && X) requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transform = `scaleX(${X.niveaux ? 1 : X.k.toFixed(3)})`; if (X.niveaux) setTimeout(() => { b.style.transition = 'none'; b.style.transform = 'scaleX(0)'; requestAnimationFrame(() => { b.style.transition = ''; b.style.transform = `scaleX(${X.k.toFixed(3)})`; }); }, 900); }));
  }
  // LE BILAN D'XP (L-P) : ce que la partie a rapporté, ligne par ligne, la barre, les niveaux gagnés et leurs déblocages,
  // les défis du jour réussis, les médailles
  _bilanXp(f, p) {
    this._xpFin = null;
    const Pf = this.profil, X = Pf && p && Pf.bilanPartie(); if (!X || !(X.xp > 0)) return;
    const n0 = X.avant.niveau, n1 = X.apres.niveau, k0 = n1 > n0 ? 0 : X.avant.k;
    const lignes = X.lignes.map((L) => `<div><span>${esc(L.lib)}${L.n > 1 && L.raison !== 'victoire' && L.raison !== 'fin' ? ` <small>× ${L.n}</small>` : ''}</span><b>+${milliers(L.xp)}</b></div>`).join('');
    const med = X.medailles.length ? `<div class="fj-xp-med">${[...new Set(X.medailles)].map((id) => { const k = X.medailles.filter((x) => x === id).length, M = MEDAILLES[id];
      return `<span class="${M.xp >= 75 ? 'or' : M.xp >= 50 ? 'argent' : 'bronze'}">${esc(this._jeu().habillage === 'airsoft' && M.nomA ? M.nomA : M.nom)}${k > 1 ? ` × ${k}` : ''}</span>`; }).join('')}</div>` : '';
    const deb = X.deblocages.length ? `<div class="fj-xp-deb"><b>DÉBLOQUÉ</b>${X.deblocages.map((d) => `<span>${esc(d.nom)}</span>`).join('')}</div>` : '';
    const def = X.defis.length ? `<div class="fj-xp-defis">${X.defis.map((t) => `<span>DÉFI RÉUSSI · ${esc(t)}</span>`).join('')}</div>` : '';
    const fin = X.apres.fin === null ? 'NIVEAU MAX' : `${milliers(X.apres.dans)} / ${milliers(X.apres.cout)} XP`;
    const h = `<div class="fj-xp"><div class="fj-xp-tete"><div class="fj-xp-total">+${milliers(X.xp)} <small>XP</small></div>`
      + `<div class="fj-xp-niv${n1 > n0 ? ' monte' : ''}"><span>${n1 > n0 ? 'NIVEAU SUPÉRIEUR' : 'NIVEAU'}</span><b>${n1}</b></div></div>`
      + `<div class="fj-xp-barre"><i style="transform:scaleX(${k0.toFixed(3)})"></i></div><div class="fj-xp-fin">${fin}</div>`
      + `<div class="fj-xp-lignes">${lignes}</div>${med}${deb}${def}</div>`;
    const bilan = f.querySelector('.fj-bilan'), act = f.querySelector('.fj-actions');
    if (bilan && act) act.insertAdjacentHTML('beforebegin', h);
    this._xpFin = { k: X.apres.k, niveaux: n1 > n0 };
  }
  // LE BILAN d'une partie, lu sur son état (affichage seulement) : titre, sous-titre, podium, chiffres de Haythem
  bilan(p, resultat = {}) {
    const B = { titre: 'FIN DE LA PARTIE', sous: resultat.texte || '', cls: 'neutre', podium: [], chiffres: [] };
    if (!p) return B;
    const A = this._jeu().habillage === 'airsoft', loc = p.local, S = this._suivi && this._suivi.p === p ? this._suivi : null;
    // (F2 relecture : au stand, le mannequin n'est pas un joueur — il montait sur le podium, « Mannequin / Haythem (toi) »)
    const joueurs = p.acteurs.filter((a) => a.role !== 'cible' && !(p.id === 'stand' && a === p.mannequin));
    // le classement : au chacun pour soi par ÉLIMINATIONS d'abord (la règle qui désigne le gagnant), ailleurs par points ; le
    // RANG d'un joueur compte les ex æquo (1 + ceux strictement devant : quatre joueurs à 0 point sont tous premiers)
    // (F2 relecture : au chacun pour soi, les éliminations NETTES — moins les suicides, PartieFPS._net —, comme la règle qui
    // désigne le gagnant ; sinon un suicide pouvait donner « 1re PLACE » à un autre que le vainqueur annoncé)
    const net = (a) => (p._net ? p._net(a) : a.stats.elims);
    const cmp = p.id === 'melee' ? (x, y) => net(y) - net(x) || y.stats.score - x.stats.score
      : (x, y) => y.stats.score - x.stats.score || y.stats.elims - x.stats.elims;
    const cl = [...joueurs].sort((x, y) => cmp(x, y) || x.stats.morts - y.stats.morts);
    const rang = (a) => (a ? 1 + joueurs.filter((b) => b !== a && cmp(b, a) < 0).length : 0), exAequo = (a) => joueurs.some((b) => b !== a && cmp(b, a) === 0);
    const place = (r) => (r === 1 ? '1re' : `${r}e`) + ' PLACE';
    const couleur = (a) => (a.equipe && EQUIPES[a.equipe] ? EQUIPES[a.equipe].couleur : null);
    const ficheDe = (a) => a.fiche || (a.local ? FICHE_HAYTHEM : FICHES_BOTS.find((f) => f.nom === a.nom) || null);
    const g = p.gagnant;
    if (p.id === 'equipes' || p.id === 'domination' || (p.id !== 'melee' && p.scores && p.id !== 'prophunt')) {
      const sc = p.scores || { A: 0, B: 0 };
      B.sous = `${EQUIPES.A.nom} ${sc.A} – ${sc.B} ${EQUIPES.B.nom}`;
      if (g === null || g === undefined) { B.titre = 'ÉGALITÉ'; B.cls = 'neutre'; }
      else if (loc && g === loc.equipe) { B.titre = 'VICTOIRE'; B.cls = 'victoire'; }
      else if (loc) { B.titre = 'DÉFAITE'; B.cls = 'defaite'; }
      else { B.titre = `VICTOIRE DES ${(EQUIPES[g] || { nom: g }).nom}`; B.cls = 'neutre'; }
    } else if (p.id === 'melee') {
      const r = rang(loc), gagne = !!loc && g === loc.id;
      B.titre = gagne ? 'VICTOIRE' : r ? place(r) : 'FIN DE LA PARTIE';
      B.cls = gagne ? 'victoire' : 'neutre';
      // (F2 relecture : le singulier — « 1 ADVERSAIRES TOUCHÉS » se lisait à la fin d'une partie)
      const n = loc ? loc.stats.elims : 0;
      B.sous = `${n} ${A ? (n > 1 ? 'adversaires touchés' : 'adversaire touché') : (n > 1 ? 'éliminations' : 'élimination')} · ${joueurs.length} joueurs`;
    } else if (p.id === 'prophunt') {
      const r = rang(loc), M = S ? S.manches : { props: 0, chasseurs: 0 }, seul = r === 1 && !exAequo(loc);
      B.titre = seul ? 'MEILLEUR SCORE' : r === 1 ? 'EX ÆQUO EN TÊTE' : r ? place(r) : (g === 'props' ? 'LES PROPS GAGNENT' : 'LES CHASSEURS GAGNENT');
      B.cls = seul ? 'victoire' : 'neutre';
      B.sous = `${p.nManches || p.manche || ''} manches · props ${M.props} – ${M.chasseurs} chasseurs`;
    } else if (p.id === 'stand') { B.titre = 'STAND TERMINÉ'; }
    // (F2 relecture : au stand, Haythem est seul — pas de podium, les chiffres du DÉFI : le résultat des règles,
    // PartieStand.resultat, et le record de l'appareil)
    B.podium = p.id === 'stand' ? [] : cl.slice(0, 3).map((a) => ({ nom: a.nom, local: !!a.local, fiche: ficheDe(a), couleur: couleur(a),
      ligne: p.id === 'prophunt' ? `${a.stats.score} pts` : `${a.stats.score} pts · ${a.stats.elims} / ${a.stats.morts}` }));
    if (p.id === 'stand') {
      const r = p.resultat || {}, rec = p.record, s1 = (v) => (Number.isFinite(v) ? v.toFixed(1).replace('.', ',') + ' s' : '—');
      if (rec && rec.nouveau) B.titre = 'NOUVEAU RECORD';
      B.cls = r.reussi || (rec && rec.nouveau) ? 'victoire' : 'neutre';
      B.chiffres = [[r.defi === 'tetes' ? 'têtes' : r.defi === 'recul' ? 'touches' : 'cibles', r.objectif ? `${r.compte ?? 0} / ${r.defi === 'recul' ? r.tirs ?? 0 : r.objectif}` : String(r.compte ?? 0)],
        ['temps', s1(r.temps)], ['précision', `${Math.round(100 * (r.precision || 0))} %`],
        [r.defi === 'reflexes' ? 'réaction' : r.defi === 'recul' ? 'groupement' : 'têtes', r.defi === 'reflexes' ? (r.reaction ? `${Math.round(r.reaction * 1000)} ms` : '—')
          : r.defi === 'recul' ? (r.groupement !== null && r.groupement !== undefined ? `${String(r.groupement).replace('.', ',')} cm` : '—') : String(r.tetes ?? 0)],
        ['points', milliers(r.points)], ['essais ici', String(rec ? rec.essais : 1)]];
      return B;
    }
    if (loc) {
      const s = loc.stats, tirs = S ? S.plombs.get(loc.id) || 0 : s.tirs, touches = S ? S.touches.get(loc.id) || 0 : s.touches;
      const prec = tirs ? Math.min(100, Math.round(100 * touches / tirs)) : 0;
      if (p.id === 'prophunt') {
        B.chiffres = [['points', String(s.score)], ['props trouvés', String(s.elims)], ['provocations', String(s.provocs || 0)],
          ['survie', mmss(s.survie || 0)], ['vrais meubles', String(s.rates || 0)], ['précision', `${prec} %`]];
      } else {
        B.chiffres = [[A ? 'touchés' : 'éliminations', String(s.elims)], [A ? 'sorties' : 'morts', String(s.morts)], ['assistances', String(s.assists)],
          ['précision', `${prec} %`], ['têtes', String(s.tetes)], ['plus longue série', String(S ? S.meilleure.get(loc.id) || 0 : 0)]];
      }
    }
    return B;
  }
  // une partie entre (le menu se cache, le suivi des séries et des manches commence) ou sort (l'écran de fin s'en va)
  _surPartie(d) {
    const p = this.game.partie;
    if (d.etat === 'entree' && p) {
      this.cacher(); this._fondu(0);
      this._dernier = this._lance || { mode: p.id, opts: { ...p.opts } }; this._lance = null;
      const S = this._suivi = { p, serie: new Map(), meilleure: new Map(), manches: { props: 0, chasseurs: 0 }, plombs: new Map(), touches: new Map() };
      // (la PRÉCISION du bilan : touches sur balles TIRÉES, plombs compris — les statistiques de l'acteur comptent un tir
      // de FP-12 pour un et chacun de ses huit plombs pour une touche, d'où 800 % : DEMANDE à F2 au rapport)
      p.sur('tir', (e) => { if (e.arme !== 'sentinelle') S.plombs.set(e.a, (S.plombs.get(e.a) || 0) + (e.n || 1)); });
      // (F2 relecture : les touches des armes à feu seulement — une frag dans un groupe n'est pas une balle tirée)
      p.sur('touche', (e) => { if (e.par >= 0 && e.par !== e.cible && e.arme !== 'sentinelle' && (!e.arme || (ARMES[e.arme] && ARMES[e.arme].rpm))) S.touches.set(e.par, (S.touches.get(e.par) || 0) + 1); });
      p.sur('elim', (e) => {
        if (e.cible !== undefined) S.serie.set(e.cible, 0);
        if (e.par === undefined || e.par === e.cible || e.arme === 'sentinelle') return;
        const n = (S.serie.get(e.par) || 0) + 1;
        S.serie.set(e.par, n); S.meilleure.set(e.par, Math.max(S.meilleure.get(e.par) || 0, n));
      });
      p.sur('phase', (e) => { if (e.phase === 'revelation' && (p.gagnant === 'props' || p.gagnant === 'chasseurs')) S.manches[p.gagnant]++; });
    } else if (d.etat === 'sortie') {
      if (this.finEl && !this.finEl.hidden) { this.finEl.hidden = true; this.finEl.classList.remove('bilan'); }
      clearTimeout(this._tFin); this._tFin = null;
    }
  }

  // ================================================================ LES CRÉDITS
  credits() { this.cacher(); this.credEl.hidden = false; const c = this.credEl.querySelector('.cr-corps'); if (c) c.scrollTop = 0; }

  // ================================================================ LA CAMÉRA DU MENU
  // Trois plans de 12 s (PLANS), un fondu au noir de 1,2 s à chaque coupe ; le corps fictif posé au sol sous la caméra
  // (la carte vivante y allume les lampes de la pièce filmée). `figer` ({ cam, vise }) : un plan fixe (relevés, tests).
  camera(dt, poser) {
    const g = this.game, cam = g.camera, C = g.collisions;
    this.tCam += borne(+dt || 0, 0, 0.1);
    let x, y, z;
    if (this.figer) {
      [x, y, z] = this.figer.cam; _w.set(...this.figer.vise); this.plan = -1;
      this._fondu(0);
    } else {
      const k = Math.floor(this.tCam / DUREE_PLAN), tp = this.tCam - k * DUREE_PLAN, P = PLANS[k % PLANS.length];
      this.plan = k % PLANS.length;
      const u = lisse(0.06 + 0.88 * (tp / DUREE_PLAN)) ;
      x = P.de.cam[0] + (P.a.cam[0] - P.de.cam[0]) * u; y = P.de.cam[1] + (P.a.cam[1] - P.de.cam[1]) * u; z = P.de.cam[2] + (P.a.cam[2] - P.de.cam[2]) * u;
      _w.set(P.de.vise[0] + (P.a.vise[0] - P.de.vise[0]) * u, P.de.vise[1] + (P.a.vise[1] - P.de.vise[1]) * u, P.de.vise[2] + (P.a.vise[2] - P.de.vise[2]) * u);
      // (le souffle d'une caméra tenue : 1,5 cm, à peine)
      y += 0.015 * Math.sin(this.tCam * 1.3);
      const h = FONDU / 2;
      this._fondu(tp < h ? 1 - tp / h : tp > DUREE_PLAN - h ? (tp - (DUREE_PLAN - h)) / h : 0);
    }
    cam.position.set(x, y, z);
    cam.lookAt(_w);
    cam.updateMatrixWorld();
    const sol = C ? C.solEn(x, z, y) : 0;
    this.corps.placer(x, sol, z, 0);
    // (la porte que vise la manette : sa fiche à droite)
    if (this.el && !this.el.hidden && entree.manette) { const b = this.el.querySelector('.mj-b.pad-focus, .mj-p.pad-focus'); if (b) this._info(b.dataset.act); }
    return true;
  }
  // l'opacité du fondu (le DOM n'est écrit que si la valeur affichée change, au centième)
  _fondu(f) {
    const v = Math.round(borne(f, 0, 1) * 100) / 100;
    this.fondu = v;
    if (this.voile && v !== this._fonduAff) { this._fonduAff = v; this.voile.style.opacity = String(v); }
  }
}

// LES CRÉDITS (§ 4.5.16 : l'écran de LA CAGE, index.html:319-365, sans le basket ni le parc ; CREDITS.md d'IRIS). La base
// CMU impose sa formule, reprise mot pour mot ; la licence CC BY 4.0 des danses exige l'attribution partout où le jeu va.
const CREDITS_HTML = `<div class="cr-boite"><header class="rj-tete"><button class="back rj-retour" data-act="retour">← RETOUR</button><h2 class="rj-titre">CRÉDITS</h2><span class="rj-fil">QUI A FAIT QUOI</span></header>
<div class="cr-corps">
<section class="cr-bloc"><h3>LE JEU</h3>
<p><b>IRIS</b> — l’école reconstruite en 3D, de la rue au 2<sup>e</sup> étage, d’après les photos de Haythem. Développé par <b>Haythem TALHA</b> — LiftStudio.</p>
<p>Moteur 3D <b>three.js</b> (licence MIT). Tous les sons sont synthétisés à la volée en WebAudio : il n’y a aucun fichier audio. Les armes ont des noms inventés : aucune marque.</p></section>
<section class="cr-bloc"><h3>AVATARS</h3>
<p>Haythem et ses amis — Gabriel, Imad, Marc-Antoine, Koji, Djafar et Ethan — ont été créés avec <b>Avaturn</b> (avaturn.me). Leurs visages ne servent en partie que si tu les coches dans les réglages : demande-leur avant toute vidéo.</p></section>
<section class="cr-bloc"><h3>CAPTURE DE MOUVEMENT</h3>
<p><b>CMU Graphics Lab Motion Capture Database.</b><br><i>The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.</i></p>
<p>Animations <b>Mixamo</b> (Adobe).</p></section>
<section class="cr-bloc"><h3>SKETCHFAB · CC BY 4.0</h3>
<p>Les danses de la roue des emotes : animations utilisées seules, maillage retiré, reciblées sur le squelette des avatars. Licence : <b>Creative Commons Attribution 4.0</b> — creativecommons.org/licenses/by/4.0</p>
<ul class="credits-list"><li>« Hip Hop Dance by Sarwar (3D scan) » — <b>Muhammad Rahman</b></li><li>« Josh Breakdance 1990 » — <b>Mixamo</b></li>
<li>« Kachujin G Rosales Chicken Dance » — <b>Mixamo</b></li><li>« Gangnam Style » — <b>reizibarrientos</b></li><li>« Ymca Dance Bani » — <b>Shivay gaming</b></li></ul></section>
<section class="cr-bloc"><h3>VÉHICULES</h3>
<p>Les voitures de la rue (<code>voitures.glb</code>) : quatre carrosseries du « Generic passenger car pack » de <b>Comrade1280</b> (Sketchfab), licence <b>Creative Commons Attribution 4.0</b> — modifiées (extraites, recentrées, textures réduites, repeintes dans le jeu).</p></section>
<section class="cr-bloc"><h3>TEXTURES</h3>
<p>Le relief discret des murs peints : <i>Concrete Wall 003</i>, <b>Poly Haven</b> (polyhaven.com), licence <b>CC0</b> (domaine public). Tout le reste du décor est dessiné par le code.</p></section>
<section class="cr-bloc"><h3>LOGICIELS ET POLICES</h3>
<p><b>three.js</b> r170 — licence MIT, © les auteurs de three.js. <b>es-module-shims</b> — licence MIT, Guy Bedford.</p>
<p>Polices <b>Bebas Neue</b> (Dharma Type) et <b>Oswald</b> (Vernon Adams), par Google Fonts — SIL Open Font License 1.1. Le logo « iris » est dessiné avec Century Gothic ; seules les images produites sont livrées.</p></section>
</div></div>`;
