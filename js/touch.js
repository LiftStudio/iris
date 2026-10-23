// =====================================================================
//  COMMANDES TACTILES (téléphone, tablette) — celles de LA CAGE, sans les boutons du ballon
//
//  - À GAUCHE, un joystick FLOTTANT : il apparaît là où le pouce gauche se pose (moitié gauche de l'écran, sous la rangée
//    du haut). Zone morte, réponse analogique (effleurer = marcher, js/game.js), et un seuil de sprint net : poussé au
//    bord, l'anneau s'allume (petite vibration). Le socle SUIT le pouce qui sort du cercle : on repart dans l'autre sens
//    sans lever le doigt. Joystick FIXE au choix (Options > Commandes).
//  - À DROITE, sous le pouce : le gros bouton SAUT dans le coin, et juste à côté le bouton d'action quand il sert
//    (S'ASSEOIR près d'une chaise, DEBOUT une fois assis).
//  - Les boutons RARES, petits, en haut à gauche, loin des pouces : pause, vue, emotes, téléphone.
//  - Glisser ailleurs (moitié droite) tourne la caméra.
//
//  Chaque bouton n'apparaît que lorsqu'il sert, à une place FIXE : rien ne saute quand le contexte change. Chaque doigt
//  est suivi par son identifiant (Pointer Events) : joystick et boutons en même temps, un doigt qui glisse hors d'un
//  bouton le relâche. Les boutons passent par leurs propres codes, « Tactile:jump »... (js/input.js) : ils marchent même
//  quand l'action n'a plus de touche au clavier.
//  Taille, opacité, joystick, vibrations et places des boutons (DISPOSITION TACTILE) : Options > Commandes.
//
//  EN PARTIE (23/10/2026, lot L-I ; spec §§ 3.2, 4.5.18, 5.5.13) — façon CoD Mobile, avec des emplacements À EUX (la balade
//  garde les siens, à l'identique) :
//  - COMBAT : TIR (le gros bouton sous le pouce droit, en RÔLE MIXTE : on vise en glissant dessus, il tire tant qu'on le
//    tient), VISER (une BASCULE : un appui vise, le suivant relâche), SAUT, ACCROUPI (en sprint : la glissade — un appui, ou
//    le pouce qui glisse vers le bas), RECHARGER, ARME, GRENADE (mixte : tenue = goupille tirée, on vise, on lâche), FLASH,
//    COUTEAU, SCORES (tenu), II. Le CHASSEUR du prop hunt : sans flash ni couteau, avec SCAN.
//  - PROP : DÉGUISER (la place de TIR, mixte), FIGER, VERROU, PROVOQUER (appui long = la roue des provocations, que le
//    pouce pointe en glissant — partie.mouvementSouris — ; appui bref = la dernière), SAUT, SCORES, II.
//  - Le joystick AU BORD vers l'avant : le sprint (tenu, comme en balade). Poussé AU-DELÀ DE SON BORD (le pouce sur le bord
//    du rond, le socle flottant le suit) : le sprint VERROUILLÉ (et le sprint tactique demandé : il part s'il est prêt) ;
//    on peut lever le pouce, Haythem continue de courir tout droit ; reposer le pouce, tirer, viser ou s'accroupir (la
//    glissade) le rend.
//  - Glisser ailleurs à droite vise aussi (0,006 × sensibilité rad/px, les deux axes ; en visée, la sensibilité suit la
//    focale — Partie.souris — ; près d'un ennemi, le ralentissement de l'aide à la visée) ; le TIR AUTO et l'aimant sont
//    dans js/jeu/assistance_visee.js. Un toucher sur le calque « CLIQUE POUR JOUER » relance SANS capture du pointeur.
//  - Dans une partie, la souris qui bouge rend la main au clavier-souris (auDoigt faux : ni aide à la visée, ni tir auto).
//  Chaque contexte est sans recouvrement à 812 × 375, 915 × 412 et 1138 × 568 (places enchaînées sur les rayons réels).
// =====================================================================
import { TELEPHONE } from './appareil.js';
import { settings, entree } from './settings.js';
import { facteurStick, etatAide } from './jeu/assistance_visee.js';
import { ARMES } from './jeu/armes.js';

// un écran tactile dont le pointeur principal est grossier (la détection d'origine)
const ECRAN_TACTILE = (typeof window !== 'undefined') && (('ontouchstart' in window) || navigator.maxTouchPoints > 0)
  && window.matchMedia('(pointer: coarse)').matches;
// Les commandes tactiles suivent la détection du téléphone de TOUT le jeu (js/appareil.js) : `?tel=1` les montre aussi sur
// un PC (elles s'y cliquent à la souris) ; et tout vrai écran tactile les garde, même sous `?tel=0` — sans elles, on ne
// pourrait plus jouer du tout.
export const IS_TOUCH = TELEPHONE || ECRAN_TACTILE;
// un VRAI appareil tactile, pas un PC sous ?tel=1 : seul lui passe en plein écran au premier appui (js/main.js)
export const VRAI_TACTILE = ECRAN_TACTILE || (typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || ''));

// LES EMPLACEMENTS. Chacun a sa place fixe ; son action et son libellé suivent le contexte (_contexte). `t` : taille —
// xl le saut, l l'action, u les petits boutons du haut.
const EMPL = [
  { id: 'saut', t: 'xl' }, { id: 'b', t: 'l' },
  { id: 'pause', t: 'u' }, { id: 'cam', t: 'u' }, { id: 'emote', t: 'u' }, { id: 'tel', t: 'u' },
  // (23/10, lot L-I) LES EMPLACEMENTS DE LA PARTIE (`jeu`) : la pause est commune aux deux groupes ; `s` : petits boutons
  { id: 'tir', t: 'xl', jeu: true }, { id: 'viser', t: 'l', jeu: true }, { id: 'jsaut', t: 'l', jeu: true }, { id: 'accr', t: 'l', jeu: true },
  { id: 'rech', t: 's', jeu: true }, { id: 'arme', t: 's', jeu: true }, { id: 'gren', t: 's', jeu: true }, { id: 'tact', t: 's', jeu: true },
  { id: 'cout', t: 's', jeu: true }, { id: 'scan', t: 's', jeu: true }, { id: 'scores', t: 'u', jeu: true },
];
// la grappe de droite : sa largeur borne la zone du joystick
const GRAPPE = ['saut', 'b'];
// la rangée du haut à gauche, dans cet ordre
const RANGEE = ['pause', 'cam', 'emote', 'tel'];
// (23/10) en partie : la grappe de tir et la rangée du haut (pause, scores)
const GRAPPE_JEU = ['tir', 'viser', 'jsaut', 'accr', 'rech', 'arme', 'gren', 'tact', 'cout', 'scan'];
const RANGEE_JEU = ['pause', 'scores'];
// un emplacement du groupe : la balade (sans `jeu`) ou la partie (`jeu`, et la pause)
const DU_GROUPE = (s, gr) => (gr === 'jeu' ? !!s.jeu || s.id === 'pause' : !s.jeu);
// libellés de l'éditeur de disposition : chaque bouton à son rôle principal
const NOMS = { saut: 'SAUT', b: 'ACTION', pause: 'II', cam: 'VUE', emote: '🕺', tel: '📱',
  tir: 'TIR', viser: 'VISER', jsaut: 'SAUT', accr: 'ACCROUPI', rech: 'RECHARGER', arme: 'ARME', gren: 'GRENADE', tact: 'TACTIQUE',
  cout: 'COUTEAU', scan: 'SCAN', scores: 'SCORES' };
// le nom d'une action dans les aides quand son bouton n'est pas à l'écran à ce moment-là (nomBouton)
const NOM_ACTION = { jump: 'SAUT', interact: 'ACTION', pause: 'PAUSE', camera: 'VUE', emote: '🕺', phone: '📱',
  tir: 'TIR', visee: 'VISER', accroupi: 'ACCROUPI', recharger: 'RECHARGER', armeSuiv: 'ARME', letale: 'GRENADE', tactique: 'FLASH',
  couteau: 'COUTEAU', scanner: 'SCAN', scores: 'SCORES', deguiser: 'DÉGUISER', figer: 'FIGER', verrou: 'VERROU', provoquer: 'PROVOQUER',
  provocVite: 'PROVOQUER' };
// LES CONTEXTES DE PARTIE au complet (tout ce qu'ils peuvent montrer : la disposition est vérifiée sur eux)
export const CONTEXTES_JEU = {
  combat: ['pause', 'scores', 'tir', 'viser', 'jsaut', 'accr', 'rech', 'arme', 'gren', 'tact', 'cout'],
  chasseur: ['pause', 'scores', 'tir', 'viser', 'jsaut', 'accr', 'rech', 'arme', 'gren', 'scan'],
  prop: ['pause', 'scores', 'tir', 'viser', 'jsaut', 'accr', 'rech'],
};
// LE TACTILE EN PARTIE — les valeurs (spec § 3.2)
export const TACTILE_JEU = {
  regard: 0.006,                     // rad/px × controls.sensitivity, lacet ET tangage
  mixtes: new Set(['tir', 'gren']),  // emplacements en rôle mixte bouton + regard
  long: 0.28,                        // s : l'appui long sur PROVOQUER ouvre la roue (avant : bref = la dernière)
  gesteRoue: 14,                     // px : le pouce qui glisse avant l'appui long ouvre la roue tout de suite
  // le sprint : AU BORD vers l'avant (< 44°), tenu comme en balade tant que l'avant ≥ 0,6 ; AU-DELÀ du bord (le pouce à 1,25
  // course, là où le socle flottant se met à le suivre : le bord du rond qu'on voit), VERROUILLÉ, tenu tant que l'avant ≥ 0,3
  // de la poussée (et la poussée ≥ 0,12)
  verrou: { avant: 0.72, bord: 0.6, auDela: 1.25, garde: 0.3, lache: 0.12 },
  glissade: 0.15,                    // s : l'accroupi pressé en sprint verrouillé — le sprint tenu encore ce temps (la glissade part)
};
const DZ = 0.14;                              // zone morte du joystick, en part de sa course
const SPRINT_ON = 0.96, SPRINT_OFF = 0.85;    // seuil du sprint, avec hystérésis : il ne clignote pas au bord
const SUIT = 1.25;                            // au-delà de 1,25 course, le socle flottant suit le pouce
const FRONT_MAX = 0.35;                       // appui ou relâcher que le jeu n'a pas lu en 0,35 s : oublié (pas d'action fantôme)
const borne = (v, a, b) => Math.max(a, Math.min(b, v));
const EMOJI = /\p{Extended_Pictographic}/u;

// LA DISPOSITION d'un écran W × H (px CSS), en fonction PURE (23/10 : les tests la calculent pour d'autres tailles que la
// fenêtre) : l'unité, les rayons, la place de chaque emplacement { x, y, r } (centre et rayon, à l'écran) et celle du
// socle du joystick au repos. `T` : settings.controls.tactile (taille, places enregistrées) ; `sa` : les marges système.
export function disposition(W, H, T, sa = { t: 0, r: 0, b: 0, l: 0 }) {
  // L'UNITÉ : 1 sur un téléphone de 390 px de haut (844 × 390), un peu moins sur 360, jusqu'à 1,4 sur tablette ; la
  // largeur compte aussi (portrait). Planchers : jamais un bouton d'action sous 48 px, ni un petit bouton sous 40.
  const u = borne(Math.min(H / 390, W / 700), 0.8, 1.4) * T.taille;
  const R = { xl: Math.max(34, 44 * u), l: Math.max(26, 32 * u), s: Math.max(24, 26 * u), u: Math.max(20, 21 * u) };
  const g = 10 * u, m = 12;
  const Rb = Math.max(48, 60 * u);
  // PLACES PAR DÉFAUT, en px depuis leur coin (centre du bouton). Le saut dans le coin, l'action contre lui, à sa gauche.
  const rT = R.xl, cT = m + rT;
  const pol = (deg, d) => ({ c: 'br', x: cT + Math.cos(deg * Math.PI / 180) * d, y: cT + Math.sin(deg * Math.PI / 180) * d });
  const DEF = {
    saut: { c: 'br', x: cT, y: cT }, b: pol(-4, rT + g + R.l),
    stick: { c: 'bl', x: m + 10 + Rb, y: m + 4 + Rb },
  };
  // (en portrait, « JOUER QUAND MÊME » : la rangée du haut descend sous le message du centre)
  const portrait = H > W * 1.05;
  RANGEE.forEach((id, i) => { DEF[id] = { c: 'tl', x: m + R.u + i * (2 * R.u + g), y: m + R.u + (portrait ? 40 : 0) }; });
  // (23/10) LA PARTIE, façon CoD Mobile : ACCROUPI dans le coin, SAUT au-dessus, puis GRENADE et FLASH le long du bord ; TIR
  // (le gros) à leur gauche sous le pouce, RECHARGER au-dessus de lui, COUTEAU entre les deux ; VISER plus à gauche, en bas,
  // ARME et SCAN au-dessus de VISER ; SCORES dans la rangée du haut, à côté de la pause. Chaque place est ENCHAÎNÉE sur les
  // rayons réels (planchers compris) : au moins `g` (10 px à l'unité) entre deux boutons, à toutes les tailles.
  const l = R.l, s = R.s, x = R.xl, br = (p) => ({ c: 'br', x: p.x, y: p.y });
  const accr = { x: m + l, y: m + l }, jsaut = { x: accr.x, y: accr.y + 2 * l + g };
  const gren = { x: accr.x, y: jsaut.y + l + g + s }, tact = { x: accr.x, y: gren.y + 2 * s + g };
  const tir = { x: accr.x + l + 1.4 * g + x, y: (accr.y + jsaut.y) / 2 + 0.3 * x };
  const viser = { x: tir.x + x + 1.4 * g + l, y: m + l + 0.2 * g };
  const rech = { x: tir.x, y: tir.y + x + g + s }, arme = { x: viser.x, y: viser.y + l + 2 * g + s };
  const cout = { x: accr.x + 2 * s + g, y: tact.y - 0.4 * s }, scan = { x: viser.x, y: arme.y + 2 * s + 2 * g };
  Object.assign(DEF, { accr: br(accr), jsaut: br(jsaut), gren: br(gren), tact: br(tact), tir: br(tir), viser: br(viser), rech: br(rech),
    arme: br(arme), cout: br(cout), scan: br(scan), scores: { c: 'tl', x: m + R.u + (2 * R.u + g), y: m + R.u + (portrait ? 40 : 0) } });
  // une place enregistrée (DISPOSITION TACTILE) est en unités : elle suit la taille des boutons
  const place = (id) => { const p = T.places[id]; return p ? { c: p.c, x: p.x * u, y: p.y * u } : DEF[id]; };
  // depuis son coin, à l'intérieur de la zone sûre, tout entier à l'écran
  const ecran = (p, r) => ({
    x: borne(p.c[1] === 'r' ? W - sa.r - p.x : sa.l + p.x, sa.l + r + 2, W - sa.r - r - 2),
    y: borne(p.c[0] === 'b' ? H - sa.b - p.y : sa.t + p.y, sa.t + r + 2, H - sa.b - r - 2), r });
  const pos = {};
  for (const e of EMPL) pos[e.id] = ecran(place(e.id), R[e.t]);
  return { u, R, Rb, m, pos, repos: ecran(place('stick'), Rb) };
}

export class TouchControls {
  constructor(game) {
    this.game = game; this.input = game.input;
    const root = document.getElementById('touch'); this.root = root;
    root.innerHTML = '<div class="tc-stick repos"><div class="tc-seuil"></div><div class="tc-knob"></div></div>';
    document.body.classList.add('touch');
    this.stick = root.querySelector('.tc-stick'); this.knob = root.querySelector('.tc-knob');
    this.el = {};
    for (const s of EMPL) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tc-btn tc-' + s.t; b.dataset.slot = s.id; b.hidden = true;
      b.innerHTML = '<span class="tc-lbl"></span>';
      root.appendChild(b); this.el[s.id] = b;
    }
    // la pastille des messages non lus, sur le coin du bouton du téléphone. Celle du HUD (#phone-badge, recopiée ici à
    // chaque image) passerait SOUS le bouton : le HUD est en dessous du calque tactile.
    this.pastille = document.createElement('div');
    this.pastille.className = 'tc-pastille'; this.pastille.hidden = true;
    root.appendChild(this.pastille);
    this.badgeHud = document.getElementById('phone-badge');
    this.pos = {};                    // emplacement -> { x, y, r } à l'écran (centre et rayon, px CSS)
    this.repos = { x: 0, y: 0, r: 50 };   // socle du joystick au repos
    this.sa = { t: 0, r: 0, b: 0, l: 0 }; this.u = 1; this.Rb = 60; this.course = 47; this.zone = { x: 0, y: 0 };
    this.doigts = new Map();          // pointerId -> { role: 'stick' | 'bouton' | 'regard' | 'deplace' | 'mort', ... }
    this.stickId = null; this.regardId = null; this.stickActif = false;
    this.centre = { x: 0, y: 0 }; this.axe = { x: 0, y: 0 }; this.amp = 0; this.sprint = false;
    this.fronts = new Map(); this.lachers = new Map();   // code -> âge (s) des fronts poussés par les boutons
    this.edition = false; this.barre = null; this.cle = ''; this._bloque = false;
    // (23/10, lot L-I) en partie : les BASCULES tenues (code → emplacement), le SPRINT VERROUILLÉ et la course qui continue
    // pouce levé, les fronts à relâcher à l'image suivante, `regardBouge` (un doigt vise à cette image : le suivi de l'aide
    // à la visée le lit, js/jeu/assistance_visee.js), le groupe d'emplacements disposé (balade ou partie)
    this.verrous = new Map(); this.sprintVerrou = false; this.courseAuto = false; this._finSprintT = 0;
    this._aRelacher = []; this.regardBouge = false; this._dispoGroupe = 'balade'; this._desab = null;

    // ----- les doigts -----
    // Sur les boutons (et la barre de l'éditeur) : écouté sur le calque ; ailleurs : sur le terrain (joystick, caméra).
    // Déplacements et levers sont écoutés sur la fenêtre : un doigt reste suivi même quand le bouton qu'il tenait disparaît.
    const canvas = game.renderer.domElement;
    root.addEventListener('pointerdown', (e) => this._bas(e, true));
    canvas.addEventListener('pointerdown', (e) => this._bas(e, false));
    window.addEventListener('pointermove', (e) => this._bouge(e), { passive: true });
    window.addEventListener('pointerup', (e) => this._finDoigt(e.pointerId));
    window.addEventListener('pointercancel', (e) => this._finDoigt(e.pointerId, true));
    // iOS : ni loupe, ni menu, ni zoom au double appui sur les commandes ; nulle part de menu à l'appui long
    root.addEventListener('touchstart', (e) => { if (e.target.closest && e.target.closest('.tc-btn, .tc-stick')) e.preventDefault(); }, { passive: false });
    for (const c of [root, canvas]) c.addEventListener('contextmenu', (e) => e.preventDefault());
    // iOS ignore user-scalable=no (index.html) : deux doigts qui s'écartent — le pouce sur le joystick, l'autre qui vise un
    // bouton — zoomaient la page en plein jeu. `gesturestart` n'existe que dans Safari : ailleurs, rien ne change.
    document.addEventListener('gesturestart', (e) => { if (!this.root.hidden) e.preventDefault(); }, { passive: false });
    // Filets : plus aucun doigt sur l'écran, fenêtre quittée, appli en arrière-plan -> tout est relâché. Un « pointerup »
    // perdu ne laisse ni un bouton enfoncé ni le joueur courir tout seul.
    const plusDeDoigt = (e) => { if (!e.touches || e.touches.length === 0) this._toutLacher(); };
    window.addEventListener('touchend', plusDeDoigt, { passive: true });
    window.addEventListener('touchcancel', plusDeDoigt, { passive: true });
    // (23/10 : et en partie, la course verrouillée et les bascules)
    window.addEventListener('blur', () => { this._toutLacher(); this._desverrouillerSprint(); this._lacherVerrous(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this._toutLacher(); this._desverrouillerSprint(); this._lacherVerrous(); } });

    // ----- les aides du jeu nomment le bouton à l'écran (actionKey, js/settings.js) -----
    // ... tant que la dernière entrée est le doigt : une tablette avec clavier retrouve « ESPACE » dès qu'on tape une touche
    this.auDoigt = true;
    window.addEventListener('keydown', () => { this.auDoigt = false; }, { passive: true });
    entree.tactile = (id) => (this.auDoigt ? this.nomBouton(id) : null);
    // (23/10) dans une partie, la SOURIS qui bouge rend la main au clavier-souris : ni aide à la visée, ni tir auto, et la
    // capture du pointeur redevient exigée (Partie.besoinCapture) — la balade, elle, ne change pas
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' && this.game.partie && Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) > 6) this.auDoigt = false;
    }, { passive: true });
    // (23/10) le calque « CLIQUE POUR JOUER » touché du doigt : la partie repart SANS capture (un téléphone n'en a pas)
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      const c = e.target && e.target.closest ? e.target.closest('#calque-clic') : null, p = this.game.partie;
      if (!c || !p || !p.calqueOuvert) return;
      e.preventDefault(); e.stopPropagation();
      this.auDoigt = true; p.fermerCalque(true);
    }, true);
    // (23/10) le toucher du terrain, en partie, ne demande JAMAIS la capture du pointeur (js/game.js _onClick la demande à
    // chaque clic du canevas ; au doigt, le clic qui suit un toucher la demanderait — refusée au téléphone, et inutile)
    window.addEventListener('click', (e) => {
      if (e.target === canvas && this.game.partie && e.pointerType === 'touch') e.stopPropagation();
    }, true);
    // (23/10) une partie qui commence ou finit : ses vibrations sous le doigt, ses emplacements, la course et les bascules rendues
    document.addEventListener('iris-partie', () => this._ecouter());

    // ----- disposition : à chaque taille d'écran, et à chaque réglage (taille, opacité, places) -----
    window.addEventListener('resize', () => this.disposer());
    window.addEventListener('orientationchange', () => setTimeout(() => this.disposer(), 300));
    settings.onChange(() => this.disposer());
    // ----- chaque image : le contexte (boutons utiles, libellés), les fronts jamais lus -----
    const frame = game.frame.bind(game);
    game.frame = (dt) => { frame(dt); this.tick(dt); };
    this.disposer();
    this.refresh();
  }

  // =================================================================== disposition
  // (23/10 : `W`, `H` pour les tests ; la grappe et la rangée sont celles du groupe à l'écran — la balade, ou la partie)
  disposer(W = window.innerWidth, H = window.innerHeight) {
    // les marges système (encoche, barre de gestes) : le calque les porte en padding (css/style.css, --sa-*)
    const cs = getComputedStyle(this.root);
    const sa = this.sa = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0,
      b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
    const T = settings.controls.tactile;
    const D = disposition(W, H, T, sa), m = D.m;
    this.u = D.u;
    const Rb = this.Rb = D.Rb;
    this.course = Rb * 0.78;
    for (const s of EMPL) {
      const p = this.pos[s.id] = D.pos[s.id], r = p.r, el = this.el[s.id], d = Math.round(2 * r);
      el.style.width = el.style.height = d + 'px';
      el.style.left = Math.round(p.x - r) + 'px'; el.style.top = Math.round(p.y - r) + 'px';
      this._police(el);
    }
    this.repos = D.repos;
    this._dispoGroupe = this._groupe();
    const grappe = this._dispoGroupe === 'jeu' ? GRAPPE_JEU : GRAPPE, rangee = this._dispoGroupe === 'jeu' ? RANGEE_JEU : RANGEE;
    const Ds = Math.round(2 * Rb), rk = Math.round(Rb * 0.42);
    this.stick.style.width = this.stick.style.height = Ds + 'px';
    this.knob.style.width = this.knob.style.height = 2 * rk + 'px';
    this.knob.style.margin = `${-rk}px 0 0 ${-rk}px`;
    if (this.stickId === null) { this.centre = { x: this.repos.x, y: this.repos.y }; this._placerSocle(); }
    // LA ZONE DU JOYSTICK FLOTTANT : la moitié gauche, sous la rangée du haut, jamais sous la grappe de droite. Seuls les
    // boutons restés dans la moitié DROITE la bornent : un geste posé à gauche (DISPOSITION TACTILE) prend ses appuis
    // lui-même (_bas : les boutons d'abord) — compté ici, il réduisait la zone à la bande à sa gauche, voire à rien, et
    // envoyait la jauge de tir hors de l'écran.
    let gauche = W;
    for (const id of grappe) { const p = this.pos[id]; if (p.x > W / 2) gauche = Math.min(gauche, p.x - p.r); }
    let haut = sa.t + m;
    for (const id of rangee) { const p = this.pos[id]; if (p.y < H * 0.4 && p.x < W * 0.5) haut = Math.max(haut, p.y + p.r); }
    this.zone = { x: Math.min(W * 0.5, gauche - 12), y: haut + 6 };
    // LE HUD S'ÉCARTE (css/style.css, body.touch) : la jauge de tir passe à gauche de la grappe, les pièces sous la rangée
    // du haut. L'endurance (140 px) reste en bas au milieu, entre le joystick et les boutons ; quand une commande du bas
    // lui prend la place (portrait, boutons déplacés), elle va au milieu du plus grand espace libre entre elles, rétrécie
    // s'il le faut (jamais sous 90 px), sinon juste au-dessus. On compte TOUS les emplacements, visibles ou non : la barre
    // ne saute pas quand la passe apparaît.
    const bs = document.body.style;
    // (la jauge, 22 px de large, reste tout entière à l'écran quoi qu'il arrive)
    bs.setProperty('--tc-droite', Math.round(Math.max(0, Math.min(W - gauche, W - sa.l - 60))) + 'px');
    bs.setProperty('--tc-haut', Math.round(haut + 8) + 'px');
    const basses = [...EMPL.filter((s) => DU_GROUPE(s, this._dispoGroupe)).map((s) => this.pos[s.id]), this.repos].filter((p) => p.y + p.r > H - sa.b - 34)
      .sort((a, b) => (a.x - a.r) - (b.x - b.r));
    let ex = W / 2, ew = 140, eb = 6 + sa.b;
    if (basses.some((p) => p.x + p.r + 8 > ex - 70 && p.x - p.r - 8 < ex + 70)) {
      let trou = [0, 0], x0 = sa.l + 4;
      for (const [l, r] of [...basses.map((p) => [p.x - p.r - 8, p.x + p.r + 8]), [W - sa.r - 4, W]]) {
        if (l - x0 > trou[1] - trou[0]) trou = [x0, l];
        x0 = Math.max(x0, r);
      }
      if (trou[1] - trou[0] >= 90) { ex = (trou[0] + trou[1]) / 2; ew = Math.min(140, trou[1] - trou[0]); }
      else eb = Math.round(H - Math.min(...basses.map((p) => p.y - p.r)) + 4);
    }
    bs.setProperty('--tc-endu', eb + 'px');
    bs.setProperty('--tc-endu-x', Math.round(ex) + 'px');
    bs.setProperty('--tc-endu-l', Math.round(ew) + 'px');
    // la pastille des messages : sur le coin haut droit du bouton du téléphone
    const t = this.pos.tel;
    this.pastille.style.left = Math.round(Math.min(t.x + t.r * 0.45, W - sa.r - 24)) + 'px';
    this.pastille.style.top = Math.round(Math.max(sa.t, t.y - t.r - 4)) + 'px';
    this.root.style.setProperty('--tc-op', String(T.opacite));
    this.root.style.setProperty('--tc-op-repos', (T.opacite * 0.5).toFixed(2));   // socle au repos : à moitié (pas de calc() dans opacity)
    if (this.edition) { this._chevauchements(); this._placerBarre(); }
  }
  _placerSocle() {
    this.stick.style.left = Math.round(this.centre.x - this.Rb) + 'px';
    this.stick.style.top = Math.round(this.centre.y - this.Rb) + 'px';
  }
  // le libellé et sa taille de lettre (un mot long tient dans son rond : DESCENDRE, SONNETTE, S'ASSEOIR)
  _libelle(el, txt) {
    const s = el.firstChild;
    if (s.textContent === txt) return;
    s.textContent = txt; this._police(el);
  }
  _police(el) {
    const d = parseFloat(el.style.width) || 50, txt = el.firstChild.textContent || '';
    const f = EMOJI.test(txt) ? d * 0.46 : Math.min(d * 0.36, (d * 0.8) / ([...txt].length * 0.47 + 0.25));
    el.style.fontSize = f.toFixed(1) + 'px';
  }

  // =================================================================== contexte
  // Ce qui est utile MAINTENANT : { v: { emplacement: [action, libellé] }, stick }. Un emplacement absent est caché.
  _contexte() {
    const g = this.game, u = g.user, v = {};
    if (g.partie) return this._contexteJeu(g.partie);
    v.pause = ['pause', 'II'];
    if (!u) return { v, stick: false };
    const roue = !!(g.wheel && g.wheel.isOpen);    // roue des emotes ouverte : on choisit son emote, les actions attendent
    v.cam = ['camera', 'VUE'];
    v.emote = ['emote', '🕺']; v.tel = ['phone', '📱'];
    if (roue) return { v, stick: true };
    if (u.assis) { v.saut = ['jump', 'DEBOUT']; v.b = ['interact', 'DEBOUT']; return { v, stick: true }; }
    // (faufilé dans un rang serré, on ne saute pas — js/game.js update, js/player.js _glisserRang : le bouton s'efface)
    if (!u.rang) v.saut = ['jump', 'SAUT'];
    // la touche d'action, quand elle sert (js/game.js updateSieges : une chaise à portée)
    if (g._presSiege && g._presSiege !== 'assis') v.b = ['interact', 'S’ASSEOIR'];
    return { v, stick: true };
  }
  // (23/10) LE CONTEXTE D'UNE PARTIE, ses emplacements à elle : combat (et chasseur du prop hunt : ni flash ni couteau, le
  // SCAN en plus), prop (FIGER et VERROU une fois déguisé ; leur libellé dit l'état) ; rien que la pause et les scores
  // pendant la cachette du chasseur, la révélation et la fin ; mort au combat, SAUT devient PASSER (la caméra de mort :
  // Espace / A pour passer). GRENADE et FLASH portent leur compte (troisième case : `data-n`, et `vide` à 0).
  _contexteJeu(p) {
    const v = { pause: ['pause', 'II'] }, a = p.local;
    if (!a) return { v, stick: false };
    v.scores = ['scores', 'SCORES'];
    const ph = p.phase;
    if (ph === 'fin' || ph === 'revelation' || ph === 'preparation') return { v, stick: false };
    if (!a.vivant) { if (p.id !== 'prophunt') v.jsaut = ['jump', 'PASSER']; return { v, stick: false }; }
    if (p.profil === 'prop') {
      const P = a.prop;
      v.tir = ['deguiser', 'DÉGUISER']; v.jsaut = ['jump', 'SAUT']; v.rech = ['provoquer', 'PROVOQUER'];
      if (P) { v.viser = ['figer', P.fige ? 'BOUGER' : 'FIGER']; v.accr = ['verrou', P.verrou ? 'LIBRE' : 'VERROU']; }
      return { v, stick: true };
    }
    if (a.role === 'chasseur' && ph === 'cachette') return { v, stick: false };
    const A = a.arsenal, D = (A && A.dotation) || {}, chasseur = a.role === 'chasseur';
    v.tir = ['tir', 'TIR']; v.viser = ['visee', 'VISER']; v.jsaut = ['jump', 'SAUT']; v.accr = ['accroupi', 'ACCROUPI'];
    // (ARME porte le nom court de l'arme qu'il sort : « P-17 », « FA-24 »…)
    const autre = A && A.arme && D.principale ? (A.arme.id === D.principale ? D.secondaire : D.principale) : null;
    if (A) { v.rech = ['recharger', 'RECHARGER']; v.arme = ['armeSuiv', autre && ARMES[autre] ? ARMES[autre].nom.split(' «')[0] : 'ARME']; }
    if (A && (D.letale || A.letales > 0)) v.gren = ['letale', 'GRENADE', A.letales];
    if (A && (D.tactique || A.tactiques > 0)) v.tact = ['tactique', 'FLASH', A.tactiques];
    if (!chasseur && D.couteau !== false) v.cout = ['couteau', 'COUTEAU'];
    if (chasseur) v.scan = ['scanner', 'SCAN'];
    return { v, stick: true };
  }
  // le groupe d'emplacements à l'écran : la partie ou la balade
  _groupe() { return this.game && this.game.partie ? 'jeu' : 'balade'; }

  // affiche les contrôles en balade (pas sous l'écran de chargement) ; appelé à chaque changement (js/main.js)
  refresh() { if (!this.edition) this._maj(true); }

  // Le nom du bouton qui fait l'action `id` : son libellé du moment (VÉLO, PARLER, S'ASSEOIR...), sinon celui de sa place
  // habituelle ; null pour ce qui n'a pas de bouton (déplacement, marche, sprint : le joystick).
  nomBouton(id) {
    for (const s of EMPL) { const el = this.el[s.id]; if (!el.hidden && el.dataset.action === id) return el.firstChild.textContent; }
    return NOM_ACTION[id] || null;
  }

  // chaque image
  tick(dt) {
    this._vieillir(this.fronts, this.input.pressedSet, dt);
    // (06/10/2026) Les RELÂCHERS ne vieillissent pas pendant la pause (hors ligne, la partie ne tourne plus : personne ne
    // les lit). Le tir tenu dont on levait le doigt pendant la pause perdait son relâcher au bout de 0,35 s, et la jauge
    // reprenait à la reprise jusqu'à partir toute seule, en haut. Un nouvel appui du même bouton efface de toute façon un
    // relâcher jamais lu (_appuyer) : il n'en sort pas d'action fantôme.
    const g = this.game;
    if (!g.paused) this._vieillir(this.lachers, this.input.releasedSet, dt);
    // la manette reprend la main pendant l'éditeur : elle masque le calque (css : body.pad-actif #touch) et ne pilote pas
    // l'éditeur — on en sort (ce qui est posé est déjà enregistré) et les options reviennent, qu'elle sait parcourir
    if (this.edition) { if (entree.manette) this._quitterEdition(); return; }
    // un panneau s'ouvre (téléphone, boutique) : le joystick ne pousse plus le joueur ; il reprend à la fermeture
    if (this.input.blocked !== this._bloque) { this._bloque = this.input.blocked; this._appliquerAxe(); }
    if (g.partie) this._tickJeu(dt);
    this._maj(false);
    this.regardBouge = false;
  }
  // (23/10) chaque image d'une partie : les fronts tapés à relâcher, l'appui long sur PROVOQUER, le sprint verrouillé rendu
  // (en pause, après la glissade, quand le tir auto part), TIR éclairé pendant le tir auto, les bascules perdues
  _tickJeu(dt) {
    const g = this.game, p = g.partie, inp = this.input;
    for (const c of this._aRelacher.splice(0)) inp.relacher(c);
    // l'appui long : la roue s'ouvre (le code tenu : PartieProp.lireExtra l'ouvre au pas) ; le geste fait avant lui est rendu
    for (const d of this.doigts.values()) {
      if (d.role !== 'bouton' || !d.long) continue;
      const L = d.long;
      if (!L.ouvert) { L.t += dt; if (L.t >= TACTILE_JEU.long) this._ouvrirRoue(d); }
      if (L.ouvert && (L.ax || L.ay) && p.roueOuverte && p.roueOuverte()) { p.mouvementSouris(L.ax, L.ay); L.ax = 0; L.ay = 0; }
    }
    if (this.sprintVerrou || this.courseAuto) {
      if (g.paused) this._desverrouillerSprint();
      else if (this._finSprintT > 0 && (this._finSprintT -= dt) <= 0) this._desverrouillerSprint();
    }
    const S = etatAide(p), auto = !!(S && S.tirAuto);
    if (auto && (this.sprintVerrou || this.courseAuto)) this._desverrouillerSprint();
    const T = this.el.tir;
    if (T.classList.contains('auto') !== auto) T.classList.toggle('auto', auto);
    // RECHARGER bat quand le chargeur est vide et qu'il reste des balles (le pouce le trouve sans lire le HUD)
    const A = p.local && p.local.arsenal, Rc = this.el.rech;
    const urgent = !!(A && Rc.dataset.action === 'recharger' && A.chargeur === 0 && A.reserve > 0);
    if (Rc.classList.contains('urgent') !== urgent) Rc.classList.toggle('urgent', urgent);
    // (la fenêtre quittée vide les touches tenues, js/input.js : une bascule que l'entrée a perdue est oubliée)
    for (const c of [...this.verrous.keys()]) if (!inp.downSet.has(c)) this._lacherVerrou(c);
  }
  // une partie commence ou finit (`iris-partie`) : les vibrations sous le doigt (touché, élimination), les emplacements de
  // son groupe, la course verrouillée et les bascules rendues
  _ecouter() {
    if (this._desab) { try { this._desab(); } catch (e) { /* partie finie */ } this._desab = null; }
    for (const c of this._aRelacher.splice(0)) this.input.relacher(c);
    this._desverrouillerSprint(); this._lacherVerrous();
    const p = this.game.partie;
    if (p && p.sur) {
      const moi = (id) => !!p.local && id === p.local.id;
      const L = [p.sur('touche', (e) => { if (moi(e.cible) && this.auDoigt) this._vibrer(28); }),
        p.sur('elim', (e) => { if (moi(e.par) && !moi(e.cible) && this.auDoigt) this._vibrer(16); })];
      this._desab = () => { for (const f of L) f(); };
    }
    if (!this.edition) this.disposer();
  }
  _vieillir(fronts, set, dt) {
    for (const [c, t] of fronts) {
      if (!set.has(c)) fronts.delete(c);                                  // lu par le jeu
      else if (t + dt > FRONT_MAX) { set.delete(c); fronts.delete(c); }   // jamais lu : oublié
      else fronts.set(c, t + dt);
    }
  }
  _maj(force) {
    const g = this.game, on = g.mode === 'lobby';
    if (this.root.hidden !== !on) { this.root.hidden = !on; if (!on) this._toutLacher(); }
    if (!on) { this.cle = ''; return; }
    // (23/10 : la balade ou la partie — chacune ses emplacements, sa grappe, sa rangée)
    if (this._groupe() !== this._dispoGroupe && !this.edition) this.disposer();
    const ctx = this._contexte();
    // les messages non lus (js/phone.js tient la pastille du HUD) : sur le bouton du téléphone, quand il est là
    const bh = this.badgeHud, nonLus = ctx.v.tel && bh && !bh.hidden ? bh.textContent : '';
    // une clé courte : on ne touche au DOM que lorsque quelque chose change
    let cle = (ctx.stick ? 'S' : '-') + nonLus;
    for (const s of EMPL) { const x = ctx.v[s.id]; cle += x ? '|' + x[0] + ':' + x[1] + (x.length > 2 ? ':' + x[2] : '') : '|'; }
    if (cle === this.cle && !force) return;
    this.cle = cle;
    this.pastille.hidden = !nonLus; this.pastille.textContent = nonLus;
    this.stickActif = ctx.stick; this.stick.hidden = !ctx.stick;
    if (!ctx.stick && this.stickId !== null) this._finDoigt(this.stickId);
    if (!ctx.stick) this._desverrouillerSprint();
    for (const s of EMPL) {
      const el = this.el[s.id], x = ctx.v[s.id];
      if (!x) { el.hidden = true; continue; }
      el.hidden = false; el.dataset.action = x[0]; this._libelle(el, x[1]);
      // (23/10) le compte d'une grenade : `data-n`, et le bouton éteint à 0
      if (x.length > 2) { const n = String(x[2] ?? 0); if (el.dataset.n !== n) el.dataset.n = n; el.classList.toggle('vide', !(x[2] > 0)); }
      else if (el.dataset.n !== undefined) { delete el.dataset.n; el.classList.remove('vide'); }
    }
    // (23/10) une bascule tenue dont le bouton a disparu, ou changé d'action : relâchée
    for (const [c, slot] of [...this.verrous]) { const el = this.el[slot]; if (!el || el.hidden || 'Tactile:' + el.dataset.action !== c) this._lacherVerrou(c); }
  }

  // =================================================================== doigts
  _bas(e, surCalque) {
    if (this.root.hidden) return;
    const souris = e.pointerType === 'mouse';
    if (souris && e.button !== 0) return;
    if (!souris || surCalque) this.auDoigt = true;
    else if (this.game.partie) this.auDoigt = false;      // (23/10 : la souris sur le terrain d'une partie : le clavier-souris)
    if (this.edition) { if (surCalque) this._saisir(e); return; }
    const x = e.clientX, y = e.clientY;
    // un bouton : celui qu'on touche, ou le plus proche à quelques pixels près (un pouce ne vise pas au pixel)
    const cible = surCalque && e.target.closest ? e.target.closest('.tc-btn') : null;
    const slot = cible && !cible.hidden ? cible.dataset.slot : souris ? null : this._boutonProche(x, y);
    if (slot) { e.preventDefault(); this._appuyer(e.pointerId, slot, x, y); return; }
    if (souris || surCalque) return;            // la souris garde la caméra du PC
    // le joystick
    if (this.stickActif && this.stickId === null && this._dansZoneStick(x, y)) { e.preventDefault(); this._stickPose(e.pointerId, x, y); return; }
    // la caméra de balade : glisser ailleurs (moitié droite)
    if (this.game.mode === 'lobby' && this.regardId === null) { this.regardId = e.pointerId; this.doigts.set(e.pointerId, { role: 'regard', x, y }); }
  }
  _boutonProche(x, y) {
    let best = null, bd = 8;
    for (const s of EMPL) {
      if (this.el[s.id].hidden) continue;
      const p = this.pos[s.id], d = Math.hypot(x - p.x, y - p.y) - p.r;
      if (d < bd) { bd = d; best = s.id; }
    }
    return best;
  }
  _dansZoneStick(x, y) {
    // sur le socle, où qu'il soit : FIXE, ou FLOTTANT déplacé hors de la moitié gauche — un joystick visible répond toujours
    if (Math.hypot(x - this.repos.x, y - this.repos.y) < this.Rb * 1.6) return true;
    return settings.controls.tactile.stick !== 'fixe' && x < this.zone.x && y > this.zone.y;
  }
  _bouge(e) {
    const d = this.doigts.get(e.pointerId);
    if (!d) return;
    const x = e.clientX, y = e.clientY;
    if (d.role === 'stick') this._stickBouge(x, y);
    else if (d.role === 'bouton') {
      // (23/10) en partie, le RÔLE MIXTE (TIR, GRENADE : le doigt vise en glissant, le bouton reste tenu) et PROVOQUER (le
      // geste va à la roue)
      if (d.mixte || d.long) { this._glisseJeu(d, x, y); return; }
      // un doigt qui glisse HORS du bouton le relâche (comme en lâchant la touche) ; il ne rappuie pas en revenant
      const p = this.pos[d.slot];
      if (Math.hypot(x - p.x, y - p.y) > p.r + d.marge) this._lacherBouton(d);
    } else if (d.role === 'regard') this._regard(d, x, y);
    else if (d.role === 'deplace') this._deplacer(d, x, y);
  }
  // (`annule` : le doigt perdu — pointercancel, fenêtre quittée — plutôt que levé : un appui bref sur PROVOQUER ne part pas)
  _finDoigt(id, annule = false) {
    const d = this.doigts.get(id);
    if (!d) return;
    this.doigts.delete(id);
    if (d.role === 'stick') this._stickLeve();
    else if (d.role === 'bouton') this._lacherBouton(d, annule);
    else if (d.role === 'bascule') this.el[d.slot].classList.remove('on');
    else if (d.role === 'regard') this.regardId = null;
    else if (d.role === 'deplace') this._poser(d);
  }
  _toutLacher() { for (const id of [...this.doigts.keys()]) this._finDoigt(id, true); }

  // ----- boutons -----
  _appuyer(pid, slot, x = 0, y = 0) {
    const el = this.el[slot], action = el.dataset.action;
    const mort = () => this.doigts.set(pid, { role: 'mort' });
    if (!action) return mort();
    for (const d of this.doigts.values()) if ((d.role === 'bouton' || d.role === 'bascule') && d.slot === slot) return mort();   // déjà tenu par un autre doigt
    // un panneau ouvert (téléphone...) : seuls la pause et le téléphone répondent, comme le clavier (js/input.js, blocked)
    if (this.input.blocked && action !== 'phone' && action !== 'pause') return mort();
    const p = this.pos[slot];
    // marge avant de lâcher en glissant : large sur le gros bouton (le pouce roule)
    const d = { role: 'bouton', slot, action, marge: slot === 'saut' ? p.r * 0.8 : Math.max(14, p.r * 0.5), x, y };
    this.doigts.set(pid, d);
    el.classList.add('on');
    this._vibrer(9);
    if (this.game.partie && this._appuyerJeu(d)) return;
    const c = 'Tactile:' + action, inp = this.input;
    inp.releasedSet.delete(c); this.lachers.delete(c);    // un vieux relâcher jamais lu ne coupe pas ce nouvel appui
    inp.presser(c); this.fronts.set(c, 0);
  }
  _lacherBouton(d, annule = false) {
    const el = this.el[d.slot];
    el.classList.remove('on');
    if (d.long) {
      // (23/10) PROVOQUER : la roue ouverte se referme (PartieProp garde le secteur pointé) ; un appui bref : la dernière
      const L = d.long; d.long = null; d.role = 'mort'; el.classList.remove('roue');
      if (L.ouvert) { const c = 'Tactile:' + d.action; if (this.input.downSet.has(c)) { this.input.relacher(c); this.lachers.set(c, 0); } }
      else if (!annule) this._front('provocVite');
      return;
    }
    const c = 'Tactile:' + d.action;
    if (this.input.downSet.has(c)) { this.input.relacher(c); this.lachers.set(c, 0); }
    d.role = 'mort';
  }
  // (23/10) UN BOUTON DE LA PARTIE : le rôle mixte (TIR, GRENADE), PROVOQUER (rien de pressé avant de savoir si l'appui est
  // long ou bref), les BASCULES (VISER ; ACCROUPI si la touche est « maintenue »), et le sprint verrouillé (TIR et VISER le
  // rendent ; ACCROUPI le garde le temps que la glissade parte). Vrai : l'appui est traité ici.
  _appuyerJeu(d) {
    const a = d.action;
    if (TACTILE_JEU.mixtes.has(d.slot)) d.mixte = true;
    if (a === 'provoquer') { d.long = { t: 0, ouvert: false, ax: 0, ay: 0 }; return true; }
    if (a === 'tir') this._desverrouillerSprint();
    if (a === 'accroupi' && (this.sprintVerrou || this.courseAuto)) this._finSprintT = TACTILE_JEU.glissade;
    if (!this._bascule(a)) return false;
    const c = 'Tactile:' + a;
    d.role = 'bascule';
    if (this.verrous.has(c)) this._lacherVerrou(c);
    else {
      const inp = this.input;
      inp.releasedSet.delete(c); this.lachers.delete(c); inp.presser(c); this.fronts.set(c, 0);
      this.verrous.set(c, d.slot); this.el[d.slot].classList.add('verrouille');
      if (a === 'visee') this._desverrouillerSprint();
    }
    return true;
  }
  // une bascule au doigt ? VISER quand la visée est « maintenue » au clavier (le défaut : au pouce, on ne tient pas un bouton
  // en visant), ACCROUPI quand l'accroupi l'est ; sinon le bouton envoie l'appui tel quel et lireCommande bascule elle-même
  _bascule(action) {
    const f = (settings.controls && settings.controls.fps) || {};
    if (action === 'visee') return f.viseeMaintenue !== false;
    if (action === 'accroupi') return f.accroupiMaintenu === true;
    return false;
  }
  _lacherVerrou(c) {
    const slot = this.verrous.get(c); if (slot === undefined) return;
    this.verrous.delete(c);
    if (this.input.downSet.has(c)) { this.input.relacher(c); this.lachers.set(c, 0); }
    const el = this.el[slot]; if (el) el.classList.remove('verrouille');
  }
  _lacherVerrous() { for (const c of [...this.verrous.keys()]) this._lacherVerrou(c); }
  // un FRONT bref (sprint tactique, la dernière provocation) : pressé maintenant, relâché à l'image suivante
  _front(action) {
    const c = 'Tactile:' + action, inp = this.input;
    inp.releasedSet.delete(c); this.lachers.delete(c); inp.presser(c); this.fronts.set(c, 0);
    this._aRelacher.push(c);
  }
  // PROVOQUER tenu assez longtemps (ou le pouce qui glisse déjà) : la roue s'ouvre — le code tenu, PartieProp l'ouvre au pas
  _ouvrirRoue(d) {
    const L = d.long; if (!L || L.ouvert) return;
    L.ouvert = true;
    const c = 'Tactile:' + d.action, inp = this.input;
    inp.releasedSet.delete(c); this.lachers.delete(c); inp.presser(c); this.fronts.set(c, 0);
    this.el[d.slot].classList.add('roue'); this._vibrer(14);
  }
  // le doigt d'un bouton mixte glisse : il vise ; celui de PROVOQUER : le geste va à la roue (gardé tant qu'elle n'est pas
  // encore ouverte, rendu d'un coup ensuite)
  _glisseJeu(d, x, y) {
    const dx = x - d.x, dy = y - d.y; d.x = x; d.y = y;
    const L = d.long;
    if (L) {
      const p = this.game.partie;
      if (!L.ouvert && Math.hypot(L.ax + dx, L.ay + dy) >= TACTILE_JEU.gesteRoue) this._ouvrirRoue(d);
      L.ax += dx; L.ay += dy;
      if (L.ouvert && p && p.roueOuverte && p.roueOuverte()) { p.mouvementSouris(L.ax, L.ay); L.ax = 0; L.ay = 0; }
      return;
    }
    this._regardJeu(dx, dy);
  }

  // ----- joystick -----
  _stickPose(pid, x, y) {
    // (23/10) le pouce reposé sur le joystick reprend la main : la course verrouillée s'arrête
    if (this.sprintVerrou || this.courseAuto) this._desverrouillerSprint();
    this.doigts.set(pid, { role: 'stick' }); this.stickId = pid;
    // flottant : le socle se pose SOUS le pouce (aucun départ involontaire) ; fixe : il reste à sa place
    this.centre = settings.controls.tactile.stick === 'fixe' ? { x: this.repos.x, y: this.repos.y } : { x, y };
    this.stick.classList.remove('repos'); this.stick.classList.add('actif');
    this._placerSocle();
    this._stickBouge(x, y);
  }
  _stickBouge(x, y) {
    const Rt = this.course;
    let dx = x - this.centre.x, dy = y - this.centre.y, l = Math.hypot(dx, dy);
    const lb = l / Rt;                  // (relecture) la poussée BRUTE, au-delà du bord comprise (le sprint verrouillé, _sprintJeu)
    if (settings.controls.tactile.stick !== 'fixe' && l > Rt * SUIT) {
      const k = (l - Rt * SUIT) / l;
      this.centre.x += dx * k; this.centre.y += dy * k; dx -= dx * k; dy -= dy * k; l = Rt * SUIT;
      this._placerSocle();
    }
    const m = Math.min(1, l / Rt), kx = l > 0 ? dx / l : 0, ky = l > 0 ? dy / l : 0;
    this.knob.style.transform = `translate(${(kx * m * Rt).toFixed(1)}px, ${(ky * m * Rt).toFixed(1)}px)`;
    // réponse analogique après la zone morte : 0 au bord de la zone morte, 1 au bord du cercle
    const a = m <= DZ ? 0 : (m - DZ) / (1 - DZ);
    this.axe.x = kx * a; this.axe.y = -ky * a; this.amp = a;
    const avant = this.sprint;
    // (23/10 : en partie, le sprint VERROUILLÉ — _sprintJeu)
    if (this.game.partie) this.sprint = this._sprintJeu(m, a, lb);
    else this.sprint = avant ? m > SPRINT_OFF : m >= SPRINT_ON;
    if (this.sprint !== avant) { this.stick.classList.toggle('sprint', this.sprint); if (this.sprint) this._vibrer(6); }
    this._appliquerAxe();
  }
  // (23/10) LE SPRINT EN PARTIE. Le joystick AU BORD vers l'avant (à moins de 44°) : le sprint, tenu comme en balade (§ 4.8
  // « bord du joystick » ; jamais de côté ni en arrière : un jeu de tir ne sprinte que devant lui). Poussé AU-DELÀ de son
  // bord (§ 3.2 : le pouce à 1,25 course, le socle flottant se met à le suivre), il se VERROUILLE — et demande le sprint
  // tactique, qui part s'il est prêt (lireCommande, jamais pour un chasseur au sprint limité) ; il tient tant que la poussée
  // reste vers l'avant, et continue pouce levé (_stickLeve). (Relecture : le verrou partait dès le bord — courir à fond
  // vers l'avant brûlait le sprint tactique à chaque fois et verrouillait la course.)
  _sprintJeu(m, a, lb) {
    const V = TACTILE_JEU.verrou, avant = a > 0 ? this.axe.y / a : 0;
    if (!this.sprintVerrou && lb >= V.auDela - 1e-6 && avant >= V.avant) this._verrouillerSprint();
    else if (this.sprintVerrou && (a < V.lache || avant < V.garde)) this._desverrouillerSprint();
    if (this.sprintVerrou) return true;
    return this.sprint ? m > SPRINT_OFF && avant >= V.bord : m >= SPRINT_ON && avant >= V.avant;
  }
  _verrouillerSprint() {
    this.sprintVerrou = true; this._finSprintT = 0;
    this.stick.classList.add('verrou');
    this._front('sprintTact');
    this._vibrer(12);
    this._lacherVerrou('Tactile:visee');           // (courir ou viser : la visée tenue au doigt est relâchée)
  }
  _desverrouillerSprint() {
    if (!this.sprintVerrou && !this.courseAuto) return;
    this.sprintVerrou = false; this._finSprintT = 0;
    this.stick.classList.remove('verrou');
    if (this.courseAuto) {
      this.courseAuto = false;
      if (this.stickId === null) { this.axe.x = 0; this.axe.y = 0; this.amp = 0; this.knob.style.transform = 'translate(0px, 0px)'; }
    }
    if (this.sprint) { this.sprint = false; this.stick.classList.remove('sprint'); }
    this._appliquerAxe();
  }
  _stickLeve() {
    // (23/10) le sprint verrouillé, pouce levé : Haythem continue de courir tout droit (reposer le pouce l'arrête)
    if (this.game.partie && this.sprintVerrou) {
      this.stickId = null; this.courseAuto = true;
      this.axe.x = 0; this.axe.y = 1; this.amp = 1; this.sprint = true;
      this.stick.classList.remove('actif'); this.stick.classList.add('repos', 'sprint');
      this.centre = { x: this.repos.x, y: this.repos.y }; this._placerSocle();
      this.knob.style.transform = `translate(0px, ${(-this.course).toFixed(1)}px)`;
      this._appliquerAxe();
      return;
    }
    this.stickId = null; this.axe.x = 0; this.axe.y = 0; this.amp = 0; this.sprint = false;
    this.knob.style.transform = 'translate(0px, 0px)';
    this.stick.classList.remove('actif', 'sprint'); this.stick.classList.add('repos');
    this.centre = { x: this.repos.x, y: this.repos.y }; this._placerSocle();
    this._appliquerAxe();
  }
  _appliquerAxe() {
    const inp = this.input, on = this.amp > 0 && !inp.blocked;
    inp.touchAxis = on ? { x: this.axe.x, y: this.axe.y } : null;
    inp.touchSprint = on && this.sprint;
  }

  // ----- caméra de balade -----
  _regard(d, x, y) {
    const g = this.game, dx = x - d.x, dy = y - d.y;
    d.x = x; d.y = y;
    if (g.mode !== 'lobby' || g.paused || this.input.blocked) return;
    if (g.partie) { this._regardJeu(dx, dy); return; }             // (23/10 : la visée d'une partie)
    const s = g.settings ? g.settings.controls.sensitivity : 1;
    g.camYaw -= dx * 0.006 * s;
    if (Math.abs(dx) > 1) g.camManuT = performance.now();
    g.camPitch = borne(g.camPitch + dy * 0.004 * s * (g.settings && g.settings.controls.invertY ? -1 : 1), -0.1, 0.9);
  }

  // (23/10) VISER AU DOIGT en partie : 0,006 × sensibilité rad/px sur les deux axes ; en visée, × le rapport de la souris en
  // visée à celle de la hanche (Partie.souris : la sensibilité suit la focale) ; près d'un ennemi, × le ralentissement de
  // l'aide à la visée ; la roue des provocations ouverte, le regard ne bouge pas (seul le doigt de PROVOQUER la pointe)
  _regardJeu(dx, dy) {
    const g = this.game, p = g.partie;
    if (!p || g.paused || this.input.blocked || (!dx && !dy)) return;
    if (p.roueOuverte && p.roueOuverte()) return;
    const c = g.settings ? g.settings.controls : settings.controls, s = c.sensitivity || 1;
    const k = TACTILE_JEU.regard * s * this._rapportVisee(p) * facteurStick(g);
    const [lo, hi] = g.bornesTangage ? g.bornesTangage() : [-1.48, 1.48];
    g.camYaw -= dx * k;
    g.camPitch = borne(g.camPitch + dy * k * (c.invertY ? -1 : 1), lo, hi);
    this.regardBouge = true;
  }
  _rapportVisee(p) {
    const f = (settings.controls && settings.controls.fps) || {}, hanche = 0.0025 * (f.sens ?? 0.45);
    const k = p.souris ? p.souris()[0] : hanche;
    return hanche > 0 && Number.isFinite(k) && k > 0 ? k / hanche : 1;
  }

  // Un petit retour sous le doigt (Android ; Safari sur iPhone n'a pas navigator.vibrate). Pas avant le premier vrai appui :
  // Chrome refuse alors, et le signale en console.
  _vibrer(ms) {
    if (!settings.controls.tactile.vibrations || typeof navigator.vibrate !== 'function') return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    try { navigator.vibrate(ms); } catch (e) { /* refusé */ }
  }

  // =================================================================== DISPOSITION TACTILE (éditeur)
  // Chaque bouton et le joystick se déplacent au doigt (ou à la souris) ; la taille et l'opacité se règlent en direct. Tout
  // est enregistré dans les réglages (controls.tactile) ; une place l'est depuis le coin le plus proche, en unités : elle
  // suit la taille des boutons et tient sur un autre écran. `fin` : rappelé en sortant (js/main.js rouvre les options).
  // Pas tant que la manette est l'entrée du moment : elle masque les commandes tactiles, l'éditeur serait invisible et le
  // jeu resterait bloqué derrière (Options > Commandes le dit sous le bouton ; un appui sur l'écran rend la main au doigt).
  peutEditer() { return !this.edition && !entree.manette; }
  editer(fin = null) {
    if (!this.peutEditer()) return;
    this._toutLacher();
    this.edition = true; this._fin = fin; this._bloquait = this.input.blocked; this.input.blocked = true;
    this.root.hidden = false; this.root.classList.add('edition');
    if (!this.barre) this._construireBarre();
    this.barre.hidden = false; this._majBarre();
    this.stick.hidden = false; this.pastille.hidden = true;
    // (23/10 : les emplacements du groupe à l'écran seulement — ceux de la balade, ou ceux de la partie ouverte depuis sa pause)
    const gr = this._groupe();
    for (const s of EMPL) { const el = this.el[s.id]; el.hidden = !DU_GROUPE(s, gr); el.classList.remove('on'); this._libelle(el, NOMS[s.id]); }
    this.cle = '';
    this.disposer();
  }
  // La barre de l'éditeur, centrée en largeur : à la PREMIÈRE hauteur (du haut vers le bas) où elle ne cache aucune
  // commande — un bouton posé dessous ne se reprendrait plus —, sinon là où elle en cache le moins. Elle s'efface pendant
  // qu'on fait glisser (css : .glisse).
  _placerBarre() {
    const gr = this._groupe(), b = this.barre, H = window.innerHeight, sa = this.sa;
    const items = [...EMPL.filter((s) => DU_GROUPE(s, gr)).map((s) => this.pos[s.id]), this.repos];
    const r = b.getBoundingClientRect(), h = r.height;
    const genes = (y) => items.filter((p) => p.x + p.r > r.left && p.x - p.r < r.right && p.y + p.r > y && p.y - p.r < y + h).length;
    let best = Math.max(sa.t + 8, (H - h) / 2), min = Infinity;
    for (let y = sa.t + 8; y <= H - sa.b - h - 8; y += 6) {
      const n = genes(y);
      if (n < min) { min = n; best = y; }
      if (!n) break;
    }
    b.style.top = Math.round(best) + 'px';
  }
  _quitterEdition() {
    this._toutLacher();
    this.edition = false; this.root.classList.remove('edition', 'glisse'); this.barre.hidden = true;
    for (const s of EMPL) this.el[s.id].classList.remove('chevauche');
    this.stick.classList.remove('chevauche');
    this.input.blocked = this._bloquait;
    this._maj(true);
    const f = this._fin; this._fin = null;
    if (f) f();
  }
  _construireBarre() {
    const b = document.createElement('div');
    b.className = 'tc-barre'; b.hidden = true;
    // compacte (trois lignes) : elle doit trouver sa place entre les commandes sur un écran de 360 px de haut
    b.innerHTML = '<div class="tc-barre-haut"><b>DISPOSITION TACTILE</b>'
      + '<button type="button" class="btn-secondary" data-a="raz">Réinitialiser</button>'
      + '<button type="button" class="btn-primary" data-a="ok">Terminé</button></div>'
      + '<label>Taille <input type="range" data-k="taille" min="0.75" max="1.35" step="0.05"></label>'
      + '<label>Opacité <input type="range" data-k="opacite" min="0.25" max="1" step="0.05"></label>'
      + '<small>Fais glisser les boutons et le joystick. En rouge : deux commandes se chevauchent.</small>';
    b.querySelectorAll('input').forEach((r) => {
      // en direct pendant qu'on glisse, enregistré au lâcher
      r.oninput = () => { settings.controls.tactile[r.dataset.k] = +r.value; this.disposer(); };
      r.onchange = () => settings.set('controls.tactile.' + r.dataset.k, +r.value);
    });
    b.querySelector('[data-a="raz"]').onclick = () => { settings.resetTactile(); this._majBarre(); };
    b.querySelector('[data-a="ok"]').onclick = () => this._quitterEdition();
    this.root.appendChild(b); this.barre = b;
  }
  _majBarre() { const T = settings.controls.tactile; this.barre.querySelectorAll('input').forEach((r) => { r.value = T[r.dataset.k]; }); }
  _saisir(e) {
    const cible = e.target.closest ? e.target.closest('.tc-btn, .tc-stick') : null;
    if (!cible) return;
    e.preventDefault();
    const slot = cible === this.stick ? 'stick' : cible.dataset.slot, p = slot === 'stick' ? this.repos : this.pos[slot];
    this.doigts.set(e.pointerId, { role: 'deplace', slot, el: cible, dx: e.clientX - p.x, dy: e.clientY - p.y, x: p.x, y: p.y, r: p.r });
    cible.classList.add('on'); this.root.classList.add('glisse');
  }
  _deplacer(d, x, y) {
    const W = window.innerWidth, H = window.innerHeight, sa = this.sa;
    d.x = borne(x - d.dx, sa.l + d.r + 2, W - sa.r - d.r - 2); d.y = borne(y - d.dy, sa.t + d.r + 2, H - sa.b - d.r - 2);
    d.el.style.left = Math.round(d.x - d.r) + 'px'; d.el.style.top = Math.round(d.y - d.r) + 'px';
    const p = { x: d.x, y: d.y, r: d.r };
    if (d.slot === 'stick') { this.repos = p; this.centre = { x: d.x, y: d.y }; } else this.pos[d.slot] = p;
    this._chevauchements();
  }
  _poser(d) {
    d.el.classList.remove('on');
    if (![...this.doigts.values()].some((x) => x.role === 'deplace')) this.root.classList.remove('glisse');
    const W = window.innerWidth, H = window.innerHeight, sa = this.sa, u = this.u;
    const c = (d.y < H / 2 ? 't' : 'b') + (d.x < W / 2 ? 'l' : 'r');
    const px = c[1] === 'r' ? W - sa.r - d.x : d.x - sa.l, py = c[0] === 'b' ? H - sa.b - d.y : d.y - sa.t;
    settings.controls.tactile.places[d.slot] = { c, x: Math.round((px / u) * 10) / 10, y: Math.round((py / u) * 10) / 10 };
    settings.save();                          // -> disposer() (settings.onChange)
  }
  _chevauchements() {
    const gr = this._groupe(), items = EMPL.filter((s) => DU_GROUPE(s, gr)).map((s) => [this.el[s.id], this.pos[s.id]]);
    items.push([this.stick, this.repos]);
    const mauvais = new Set();
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i][1], b = items[j][1];
        if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + 2) { mauvais.add(items[i][0]); mauvais.add(items[j][0]); }
      }
    }
    for (const [el] of items) el.classList.toggle('chevauche', mauvais.has(el));
  }
}

// ---------------------------------------------------------------------------
// Plein écran sur mobile. Dans un navigateur, la barre d'état et la barre de navigation restent affichées
// par-dessus le jeu tant qu'on n'a pas demandé le plein écran, et le navigateur ne l'accorde QUE pendant un
// geste de l'utilisateur. On le demande donc au premier appui, puis on le redemande si on en sort (retour
// d'une notification, rotation), toujours depuis un geste.
//
// Dans l'APK Android c'est l'activité qui s'en charge (mode immersif collant, voir .github/workflows/android.yml) :
// cette fonction ne fait alors rien de plus, elle échoue silencieusement.
export function pleinEcran() {
  const el = document.documentElement;
  const demande = () => {
    if (document.fullscreenElement) return;
    const f = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!f) return;
    try {
      const p = f.call(el, { navigationUI: 'hide' });
      if (p && p.then) p.then(verrouillerPaysage).catch(() => {});
      else verrouillerPaysage();
    } catch (e) { /* refusé : on réessaiera au prochain geste */ }
  };
  const verrouillerPaysage = () => {
    // le paysage n'est verrouillable qu'en plein écran, et seulement sur certains navigateurs
    try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch (e) { /* ignore */ }
  };
  // au premier geste, puis à chaque geste tant qu'on n'y est pas
  for (const ev of ['pointerdown', 'touchend', 'keydown']) {
    window.addEventListener(ev, demande, { passive: true });
  }
  return { demande };
}
