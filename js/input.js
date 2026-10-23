// Clavier : on lit e.code (position physique) donc ZQSD (AZERTY) et WASD (QWERTY) marchent tous les deux.
// Les actions du jeu (jump, emote, camera...) sont résolues via les touches configurées dans les options (settings.bindings).
//
// MANETTE (js/manette.js) : ses boutons deviennent des codes virtuels « Pad:A », « Pad:RT »… rangés dans les MÊMES
// ensembles que les touches (downSet / pressedSet / releasedSet). Chaque action a donc, en plus de ses deux touches,
// ses deux boutons de manette (settings.controls.pad.bindings), et tout ce qui lit `pressed('jump')` ou
// `down('sprint')` marche à la manette sans le savoir — fronts consommés compris. Seul le stick gauche passe à
// part, parce qu'il est analogique : il alimente axis() et amplitude().
import { settings } from './settings.js';
import { Manette } from './manette.js';

const PREVENT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Tab']);
// LES FRONTS VIEILLISSENT (22/10, socle du jeu) : un front qu'aucun pas n'a consommé est oublié au bout de 0,35 s (sinon une
// touche tapée en l'air ou en pause partait plus tard : un saut, une grenade, une emote « fantôme »)
const VIE_FRONT = 350;
const MOLETTE = ['Molette:haut', 'Molette:bas'];

export class Input {
  constructor(bindings = {}) {
    this.downSet = new Set();
    this.pressedSet = new Set();
    this.releasedSet = new Set();
    this.blocked = false;                // vrai quand le panneau d'options est ouvert (les touches ne vont pas au jeu)
    this.touchAxis = null; this.touchSprint = false;   // joystick tactile (js/touch.js)
    // (22/10, socle du jeu) l'âge des fronts (code -> performance.now() de l'appui / du relâcher) ; `sourisJeu` : les
    // boutons de la souris et la molette sont des codes « Souris:0 »… « Molette:haut » (en partie seulement, posé par
    // Game.appliquerProfil) ; `tCapture` : l'heure de la dernière capture du pointeur (le clic qui capture ne tire pas)
    this.fronts = new Map(); this.relaches = new Map();
    this.sourisJeu = false; this.tCapture = -Infinity; this._souris = new Set();
    this.setBindings(bindings);
    this._kd = (e) => {
      if (this.blocked) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;   // champ de texte du menu
      if (PREVENT.has(e.code) || this._codes.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      if (!this.downSet.has(e.code)) { this.downSet.add(e.code); this.pressedSet.add(e.code); this.fronts.set(e.code, performance.now()); }
    };
    this._ku = (e) => { this.downSet.delete(e.code); this.releasedSet.add(e.code); this.relaches.set(e.code, performance.now()); };
    this._blur = () => { for (const c of this.downSet) this.releasedSet.add(c); this.downSet.clear(); };
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);
    window.addEventListener('blur', this._blur);
    // LA SOURIS EN PARTIE : un bouton n'est un code que pointeur CAPTURÉ au moment de l'appui, et 150 ms après la capture
    // (le clic qui capture le pointeur ne tire jamais) ; le menu contextuel et les boutons « page précédente / suivante »
    // (4 et 5) sont coupés sur l'image du jeu
    const permise = () => this.sourisJeu && !this.blocked && !!document.pointerLockElement && document.pointerLockElement.tagName === 'CANVAS'
      && performance.now() - this.tCapture > 150;
    this._md = (e) => {
      if (!permise()) return;
      const c = 'Souris:' + e.button;
      this._souris.add(c); this.presser(c);
      if (e.button === 3 || e.button === 4) e.preventDefault();
    };
    this._mu = (e) => {
      const c = 'Souris:' + e.button;
      if (this._souris.delete(c)) this.relacher(c);
      if (this.sourisJeu && (e.button === 3 || e.button === 4)) e.preventDefault();
    };
    this._roue = (e) => { if (permise() && e.deltaY) this.presser(e.deltaY < 0 ? MOLETTE[0] : MOLETTE[1]); };
    this._menu = (e) => { if (this.sourisJeu && e.target && e.target.tagName === 'CANVAS') e.preventDefault(); };
    this._aux = (e) => { if (this.sourisJeu && (e.button === 3 || e.button === 4)) e.preventDefault(); };
    this._capture = () => {
      const capture = !!document.pointerLockElement;
      if (capture) this.tCapture = performance.now();
      else for (const c of this._souris) this.relacher(c), this._souris.delete(c);
      document.dispatchEvent(new CustomEvent('iris-pointeur', { detail: { capture } }));
    };
    window.addEventListener('mousedown', this._md);
    window.addEventListener('mouseup', this._mu);
    window.addEventListener('wheel', this._roue, { passive: true });
    window.addEventListener('contextmenu', this._menu);
    window.addEventListener('auxclick', this._aux);
    document.addEventListener('pointerlockchange', this._capture);
    // la manette : scrutée une fois par image par Game.frame (voir scruter plus bas)
    this.manette = new Manette(this);
  }
  // `pad` : les boutons de manette de chaque action, rangés DERRIÈRE ses touches. Par défaut ceux des réglages
  // (Game.applySettings n'envoie que les touches : la manette suit toute seule).
  // Les boutons TACTILES (js/touch.js) ont leur code à eux, « Tactile:jump »… : un bouton à l'écran marche même quand
  // l'action n'a plus de touche au clavier, et ses fronts ne se mélangent pas avec ceux de la touche.
  setBindings(b, pad = settings.data.controls.pad && settings.data.controls.pad.bindings) {
    this.bind = {}; this._codes = new Set(); this._lies = new Set();
    for (const id of new Set([...Object.keys(b || {}), ...Object.keys(pad || {})])) {
      const kb = (b && b[id]) || [], pb = (pad && pad[id]) || [];
      this.bind[id] = [...kb, ...pb, 'Tactile:' + id];
      for (const c of kb) if (c) this._codes.add(c);          // touches du clavier seulement (preventDefault)
      for (const c of this.bind[id]) if (c) this._lies.add(c);   // (tous les codes portés par une action : endFrame)
    }
  }

  // Scrutation de la manette : UNE fois par image, au tout début de Game.frame (la ligne `this.input.scruter`).
  scruter(game, dt) { this.manette.scruter(game, dt); }
  // Appui / relâcher d'un code virtuel (manette). Même règle que le clavier : un front par appui.
  presser(code) { if (!this.downSet.has(code)) { this.downSet.add(code); this.pressedSet.add(code); this.fronts.set(code, performance.now()); } }
  relacher(code) { if (this.downSet.delete(code)) { this.releasedSet.add(code); this.relaches.set(code, performance.now()); } }
  // LES FRONTS VIDÉS (22/10, socle du jeu) : à la reprise d'une pause, à l'entrée et à la sortie d'une partie, au
  // changement de rôle — ce qui a été tapé pendant ne part pas (les touches TENUES restent tenues)
  purger() { this.pressedSet.clear(); this.releasedSet.clear(); this.fronts.clear(); this.relaches.clear(); }

  // par touche brute (e.code)
  isDown(c)   { return this.downSet.has(c); }
  keyPressed(c)  { return this.pressedSet.has(c); }
  keyReleased(c) { return this.releasedSet.has(c); }
  // par action configurée
  _any(set, id) { const cs = this.bind[id]; if (!cs) return false; for (const c of cs) if (c && set.has(c)) return true; return false; }
  down(id)     { return this._any(this.downSet, id); }
  // Un FRONT ne se lit qu'une fois. La boucle de jeu tourne à pas fixe : une image peut exécuter zéro, un ou
  // six pas de simulation. Sans consommation, un seul appui déclenchait l'action autant de fois qu'il y avait
  // de pas, et disparaissait quand il n'y en avait aucun.
  pressed(id)  { return this._take(this.pressedSet, id); }
  released(id) { return this._take(this.releasedSet, id); }
  peek(id)     { return this._any(this.pressedSet, id); }        // lire sans consommer
  _take(set, id) {
    const cs = this.bind[id];
    if (!cs) return false;
    let hit = false;
    for (const c of cs) if (c && set.delete(c)) hit = true;
    return hit;
  }
  // Les fronts non consommés restent disponibles à l'image suivante : rien n'est perdu sur une image sans pas.
  // (22/10, socle du jeu) Mais (1) un code qu'aucune action ne porte n'y reste pas : la roue des emotes lit ses chiffres
  // DANS l'image (Game.updateEmoteInput) — gardés, un chiffre tapé roue fermée lançait une emote à la prochaine ouverture ;
  // (2) un front de plus de 0,35 s est oublié ; (3) la molette, qui n'a pas de relâcher, est relâchée.
  endFrame()  {
    const now = performance.now();
    const vieillir = (set, ages) => {
      for (const c of set) {
        if (!this._lies.has(c)) { set.delete(c); continue; }
        const t = ages.get(c);
        if (t === undefined || t > now) ages.set(c, now);
        else if (now - t > VIE_FRONT) set.delete(c);
      }
      for (const c of ages.keys()) if (!set.has(c)) ages.delete(c);
    };
    vieillir(this.pressedSet, this.fronts);
    vieillir(this.releasedSet, this.relaches);
    for (const c of MOLETTE) if (this.downSet.has(c)) this.relacher(c);
  }

  // axes bruts : x = droite(+)/gauche(-), y = avant(+)/arrière(-)
  // Priorité : le joystick tactile, puis les touches (le clavier garde la main dès qu'on appuie), puis le
  // stick gauche de la manette, ANALOGIQUE : sa direction exacte, et sa poussée dans amplitude().
  axis() {
    if (this.touchAxis) return this.touchAxis;
    const x = (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0);
    const y = (this.down('forward') ? 1 : 0) - (this.down('back') ? 1 : 0);
    if (!x && !y && this.manette.axe) return this.manette.axe;
    return { x, y };
  }
  sprint() { return this.touchSprint || this.down('sprint'); }
  // AMPLITUDE DU MANCHE, de 0 a 1. Au clavier une touche est tout ou rien, donc 1 ; au joystick tactile
  // c'est la poussee reelle du pouce. C'est ce qui permet de MARCHER sans touche dediee sur telephone :
  // on effleure le manche pour se promener, on le pousse a fond pour courir, comme sur une manette.
  // Et justement, sur une vraie manette : la poussee du stick gauche, apres zone morte et courbe de reponse.
  amplitude() {
    const a = this.touchAxis;
    if (a) return Math.min(1, Math.hypot(a.x, a.y));
    const m = this.manette.axe;
    if (m && !this.down('right') && !this.down('left') && !this.down('forward') && !this.down('back')) return m.amp;
    return 1;
  }

  dispose() {
    window.removeEventListener('keydown', this._kd);
    window.removeEventListener('keyup', this._ku);
    window.removeEventListener('blur', this._blur);
    window.removeEventListener('mousedown', this._md);
    window.removeEventListener('mouseup', this._mu);
    window.removeEventListener('wheel', this._roue);
    window.removeEventListener('contextmenu', this._menu);
    window.removeEventListener('auxclick', this._aux);
    document.removeEventListener('pointerlockchange', this._capture);
    this.manette.dispose();
  }
}
