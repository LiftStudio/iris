import * as THREE from 'three';
import { clamp, damp, ZERO } from './util.js';
import { construireCarte } from './carte_ecole.js';
import { Player } from './player.js';
import { Input } from './input.js';
import { HUD, showOverlay, hideOverlay, EmoteWheel } from './ui.js';
import { PostFX } from './fx.js';
import { actionKey } from './settings.js';
import { manetteActive, aideBalade } from './manette.js';
import { IS_TOUCH } from './touch.js';
import { TELEPHONE } from './appareil.js';
import { roueEmotes } from './emotes.js';
import { Weather } from './weather.js';
import { Couches } from './couches.js';
import { OmbresContact } from './ombres_contact.js';
import { avecProfondeur, sceneOmbre } from './ombre_cache.js';

// =====================================================================
//  LE JEU (IRIS) : la balade libre dans l'école
// =====================================================================
// Repris de la boucle de LA CAGE (js/game.js), réduite à sa balade libre (le mode 'lobby' de LA CAGE, dont le nom est
// gardé : la manette et les commandes tactiles le lisent) : pas de menu, de choix du joueur, de match, d'ordinateur, de
// ballon, de marchand ni de jeu en ligne. Ce qui reste :
//   - le RENDU (js/fx.js : préréglages, qualité automatique, résolution dynamique, ombres douces, étalonnage « Photo »),
//     la météo (js/weather.js, ici réglée « intérieur »), les ombres de contact, la précompilation des programmes ;
//   - LA CARTE (js/carte_ecole.js) et son monde solide (js/collisions.js) ;
//   - HAYTHEM (js/player.js) piloté au clavier et à la souris, à la manette (js/manette.js) ou au doigt (js/touch.js) :
//     marcher, courir, sprinter, sauter, s'asseoir, les emotes, le téléphone ;
//   - LES TROIS VUES de la balade (3e personne, épaule, 1re personne), à la souris façon GTA, et qui ne traversent plus les
//     murs : dans un couloir, la caméra se rapproche au lieu de passer derrière la cloison, et elle reste sous le plafond ;
//   - la simulation à PAS FIXE (1/120 s) et l'interpolation d'affichage, la limite d'images par seconde, la pause.

// Pas de simulation fixe : 120 Hz. Le rendu reste libre, seule la logique de jeu est cadencée.
const FIXED_DT = 1 / 120;
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _dir = new THREE.Vector3(), _vCam = new THREE.Vector3();
const PRECHAUFFE = [1.5, 4, 8, 14, 22];   // moments (s) où l'on précompile le décor qui vient d'arriver (prechaufferScene)
const RAYON_CAM = 0.2;                    // la caméra est une petite sphère : elle garde 20 cm des murs et du plafond

// HAYTHEM (la fiche de LA CAGE : 1,73 m, sa vitesse — js/player.js —, son avatar Avaturn ; ses couleurs ne servent qu'au
// bonhomme de secours, si l'avatar ne se charge pas)
export const HAYTHEM = { id: 'haythem', name: 'Haythem', height: 1.73, spd: 99, color1: '#e63946', color2: '#ffffff', skin: '#c68642',
  model: 'assets/haythem.glb', modelHeight: 1.84 };

export class Game {
  constructor(audio, cb, settings) {
    this.audio = audio; this.cb = cb; this.settings = settings;

    // ---- rendu ----
    this.container = document.getElementById('game');
    // MSAA du contexte : seulement en basse ENREGISTRÉE (ailleurs le rendu passe par le composer, que le MSAA du contexte
    // ne lisse pas), jamais sur un téléphone à forte densité de pixels (js/fx.js _fxaaBasse lisse au FXAA).
    const _dense = (window.devicePixelRatio || 1) >= 2 && TELEPHONE;
    const _basse = !!(settings && settings.graphics && settings.graphics.quality === 'low');
    this.renderer = new THREE.WebGLRenderer({ antialias: _basse && !_dense, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.08, 400);
    this.camera.position.set(0, 2.5, 7);
    this.lookCur = new THREE.Vector3(0, 1.4, 3);
    this.camTarget = new THREE.Vector3();
    // Trois vues, à faire tourner avec la touche caméra : 3 = 3e personne, 2 = épaule, 1 = première personne
    this.vue = (settings && settings.game.vue) || 3;

    // ---- la carte ----
    this.carte = construireCarte(this.scene, this.renderer);
    this.collisions = this.carte.collisions;
    Player.collisions = this.collisions;
    this.sieges = this.carte.sieges || [];
    if (new URLSearchParams(location.search).get('debug') === 'murs') this.collisions.afficherDebug(this.scene);

    this.fx = new PostFX(this.renderer, this.scene, this.camera);
    this.ombres = new OmbresContact(this.renderer, this.scene);   // taches douces sous le joueur et le mobilier
    this.fx.onDowngrade = (q) => {
      const noms = { extreme: 'EXTRÊME', ultra: 'ULTRA', high: 'HAUTE', medium: 'MOYENNE', low: 'BASSE' };
      this.hud.feedback(`GRAPHISMES : ${noms[q] || q}`, 'warn');
      if (this.settings) this.settings.set('graphics.quality', q);
    };
    this.input = new Input(settings ? settings.bindings : undefined);
    this.hud = new HUD();
    this.wheel = new EmoteWheel(roueEmotes(), (i) => this.doEmote(i)); this.wheelHold = 0;
    this.weather = new Weather(this.scene, this.fx);    // à l'intérieur : la lumière des plafonniers, sans pluie ni nuages
    Couches.son = this.audio;                           // pas, crissements de semelles, réceptions (js/couches.js)

    // Les programmes et les textures d'un avatar qui arrive, préparés en parallèle avant qu'il ne paraisse (js/player.js).
    // Compilés pour la cible où la scène est dessinée ; et ceux du cran du dessous en qualité automatique (js/fx.js
    // avecRepli), dessinés une fois hors écran (imageABlanc) : la première baisse automatique ne fige pas l'image.
    Player.preparerRendu = (o) => {
      const r = this.renderer;
      if (!r || !r.compileAsync) return null;
      o.traverse((m) => {
        if (!m.isMesh || !m.material) return;
        const an = (this.fx && this.fx._aniso) || 1;
        for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
          const t = m.material[k];
          if (!t) continue;
          if (t.anisotropy < an) t.anisotropy = an;
          r.initTexture(t);
        }
      });
      const pret = this._compilerTout(o, true);
      const fx = this.fx;
      const R = fx && fx.auto && fx.compilerTout && fx._etatRepli?.();
      const repli = R ? fx.avecRepli(o, (x) => this._compilerTout(x, true)) : null;
      if (repli) {
        Promise.all([pret, repli]).then(() => {
          const objets = [];
          o.traverse((m) => { if (m.isMesh && m.material) objets.push(m); });
          fx.imageABlanc(objets, R);
        }).catch(() => {});
      }
      return pret;
    };
    this.fx.compilerTout = (o) => this._compilerTout(o);

    // ---- HAYTHEM ----
    this.user = new Player(HAYTHEM, this.scene);
    this.user.bounds = this.carte.bornes || this.user.bounds;

    // ---- état ----
    this.mode = 'chargement';         // 'chargement' (sous l'écran de chargement), puis 'lobby' : la balade
    this.paused = false; this.time = 0; this.setupOpen = false;
    this.camYaw = 0; this.camPitch = 0.22; this.dragging = false;
    this.clock = new THREE.Clock(); this._raf = null;
    this.fpsT = 0; this.fpsN = 0;
    this.shake = { t: 0, dur: 1, amp: 0 };
    this.camPos = this.camera.position.clone();
    this._presSiege = null;

    // ---- souris (caméra GTA) ----
    const canvas = this.renderer.domElement;
    // Téléphone : la barre d'adresse qui se rétracte déclenche une rafale de « resize » ; la caméra tout de suite, les
    // tampons du composer une fois calmé.
    this._resizeT = null;
    this._onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight; this.camera.updateProjectionMatrix();
      clearTimeout(this._resizeT);
      this._resizeT = setTimeout(() => this.fx.resize(window.innerWidth, window.innerHeight), 160);
    };
    this._onClick = () => { if (this.mode === 'lobby' && !this.paused && !this.input.blocked && document.pointerLockElement !== canvas) { try { const r = canvas.requestPointerLock?.(); if (r && r.catch) r.catch(() => {}); } catch (e) { /* capture souris refusée (iframe, aperçu) */ } } };
    this._onDown = () => { this.dragging = true; };
    this._onUp = () => { this.dragging = false; };
    this._onMove = (e) => {
      if (this.mode !== 'lobby' || this.paused || this.input.blocked) return;
      if (document.pointerLockElement === canvas || this.dragging) {
        const c = this.settings ? this.settings.controls : { sensitivity: 1, invertY: false };
        this.camYaw -= e.movementX * 0.0025 * c.sensitivity;
        if (Math.abs(e.movementX) > 1) this.camManuT = performance.now();
        this.camPitch = clamp(this.camPitch + e.movementY * 0.002 * c.sensitivity * (c.invertY ? -1 : 1), -0.1, 0.9);
      }
    };
    window.addEventListener('resize', this._onResize);
    canvas.addEventListener('click', this._onClick);
    canvas.addEventListener('mousedown', this._onDown);
    window.addEventListener('mouseup', this._onUp);
    window.addEventListener('mousemove', this._onMove);
    // L'ORIENTATION (téléphone) : `portrait` sur un écran tactile plus haut que large. « JOUER QUAND MÊME » pose
    // `portrait-ok` : on joue alors en portrait.
    const majOrientation = () => document.body.classList.toggle('portrait', IS_TOUCH && window.innerHeight > window.innerWidth * 1.05);
    for (const ev of ['resize', 'orientationchange']) window.addEventListener(ev, () => { majOrientation(); setTimeout(majOrientation, 300); });
    majOrientation();
    const okPortrait = document.getElementById('tourner-ok');
    if (okPortrait) okPortrait.onclick = (e) => { e.stopPropagation(); document.body.classList.add('portrait-ok'); window.dispatchEvent(new Event('resize')); };

    // Le rendu peut refuser ou abandonner un préréglage : on le DIT.
    const QNOM = { low: 'BASSE', medium: 'MOYENNE', high: 'HAUTE', ultra: 'ULTRA', extreme: 'EXTRÊME' };
    document.addEventListener('hoops-qualite-bridee', (e) => {
      this.hud.feedback(`${QNOM[e.detail.demande] || e.detail.demande} impossible ici → ${QNOM[e.detail.applique] || e.detail.applique}`, 'bad');
    });
    document.addEventListener('hoops-qualite-baissee', (e) => { this.hud.feedback(`Trop lent : qualité → ${QNOM[e.detail.quality] || e.detail.quality}`, 'info'); });
    document.addEventListener('hoops-qualite-remontee', (e) => { this.hud.feedback(`Ça respire : qualité → ${QNOM[e.detail.quality] || e.detail.quality}`, 'info'); });
    document.addEventListener('hoops-qualite-lourde', (e) => {
      this.hud.feedback(`${QNOM[e.detail.quality] || e.detail.quality} : ${Math.round(1000 / e.detail.ms)} im/s ici — baisse d'un cran si ça gêne`, 'info');
    });
    // L'IMAGE PERDUE : iOS et les téléphones à court de mémoire retirent son contexte WebGL à la page. On le dit, avec
    // RECHARGER ; si le navigateur rend le contexte (js/fx.js repart alors en moyenne), on peut aussi continuer.
    document.addEventListener('hoops-gpu-perdu', () => {
      this.hud.feedback('Carte graphique saturée — recharge la page', 'bad');
      showOverlay('IMAGE PERDUE', 'La carte graphique a manqué de mémoire. Recharge le jeu : tes réglages sont enregistrés.', [
        { label: 'Recharger', cls: 'btn-primary', onClick: () => location.reload() },
      ]);
    });
    document.addEventListener('hoops-gpu-retabli', () => {
      if (this.ombres) this.ombres.cuisson = NaN;
      showOverlay('IMAGE RÉTABLIE', 'Le jeu repart en qualité moyenne. Si des textures manquent, recharge-le.', [
        { label: 'Continuer', cls: 'btn-primary', onClick: () => { hideOverlay(); if (this.paused) this.togglePause(); } },
        { label: 'Recharger', cls: 'btn-secondary', onClick: () => location.reload() },
      ]);
    });

    this.applySettings();
    this.placerAuDepart();
  }

  // réglages du menu Options (appelé au démarrage et à chaque changement)
  applySettings() {
    const s = this.settings; if (!s) return;
    // LE RENDU SEULEMENT S'IL A CHANGÉ : la touche caméra, un volume ou une touche ne repassent pas le préréglage (un
    // préréglage repassé, c'est une image figée et la qualité automatique relancée)
    const { weather, fps, fov, fpsMax, ...rendu } = s.graphics;
    const cle = JSON.stringify(rendu);
    if (cle !== this._cleRendu) { this._cleRendu = cle; this.fx.applyGraphics(s.graphics); }
    if (this.weather && (weather || 'auto') !== this._modeMeteo) { this._modeMeteo = weather || 'auto'; this.weather.setMode(this._modeMeteo); }
    this.input.setBindings(s.bindings);
    this.hud.fps(s.graphics.fps);
    if (this.mode === 'lobby') this.hud.setLobby();
  }

  // Compile en parallèle (KHR_parallel_shader_compile) les programmes de `o` tels qu'ils serviront : pour la cible où la
  // scène est dessinée — celle du post-traitement (flottante), ou l'écran quand il est coupé.
  _compilerAsync(o, scene = this.scene, ecran = this.fx && this.fx.enabled === false, camera = this.camera) {
    const r = this.renderer;
    if (!r || !r.compileAsync) return null;
    const cible = ecran ? null
      : (this._cibleCompil || (this._cibleCompil = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType })));
    const avant = r.getRenderTarget();
    try { r.setRenderTarget(cible); return r.compileAsync(o, camera, scene).catch(() => {}); }
    catch (e) { return null; } finally { r.setRenderTarget(avant); }
  }
  // Le rendu de `o` ET ses programmes des passes annexes : la carte d'ombre (js/ombre_cache.js avecProfondeur) et, pour
  // ce qui bouge (`mobile`), la carte des ombres de contact (js/ombres_contact.js avecContact).
  _compilerTout(o, mobile = false) {
    const so = this._sceneOmbre || (this._sceneOmbre = sceneOmbre(this.scene));
    const p = [this._compilerAsync(o), avecProfondeur(o, (x) => this._compilerAsync(x === this.scene ? so : x, so, false))];
    if (mobile) p.push(this.ombres.avecContact(o, (x, cam) => this._compilerAsync(x, this.scene, false, cam)));
    const prets = p.filter(Boolean);
    return prets.length > 1 ? Promise.all(prets) : prets[0] || null;
  }
  // LE DÉCOR PRÉCHAUFFÉ : les programmes de la scène compilés en parallèle (sous l'écran de chargement, puis à quelques
  // reprises pour ce qui arrive ensuite), et les variantes du préréglage de repli (js/fx.js avecRepli)
  prechaufferScene() { this._compilerTout(this.scene); this.fx.precompilerRepli(); }

  // IMAGES PAR SECONDE AU PLUS (réglage graphics.fpsMax) : AUTO = 60 au téléphone, sans limite ailleurs
  fpsMax() {
    const v = String((this.settings && this.settings.graphics && this.settings.graphics.fpsMax) || 'auto');
    if (v === 'auto') return this.fx && this.fx.dev && this.fx.dev.telephone ? 60 : 0;
    return Math.max(0, Number(v) || 0);
  }

  start() {
    if (this._raf) return;
    this.clock.start();
    let prochain = 0;
    const loop = (t = performance.now()) => {
      this._raf = requestAnimationFrame(loop);
      // la limite : une ÉCHÉANCE qui avance d'une période à chaque image rendue ; une image en avance est sautée
      const cap = this.fpsMax();
      this.fx.periodeCap = cap > 0 ? 1000 / cap : 0;
      if (cap > 0) {
        const periode = 1000 / cap;
        if (t < prochain - 2) return;
        prochain = Math.max(prochain + periode, t - periode / 2);
      }
      const dt = Math.min(this.clock.getDelta(), 0.05); this.frame(dt);
    };
    loop();
  }

  // ---------- la balade ----------
  // Haythem au point de départ de la carte, la caméra derrière lui
  placerAuDepart() {
    const u = this.user, D = this.carte.depart;
    u.stopEmote(); u.assis = null; u.tel = null;
    u.pos.set(D.x, 0, D.z); u.vel.set(0, 0, 0); u.setFacing(D.fx, D.fz);
    u.airborne = false; u.jumpY = 0; u.jumpVel = 0;
    u.memoriser();
    this.collisions.resoudre(u.pos, 0.3);             // (un départ mal posé contre un mur en est sorti)
    this.camYaw = Math.atan2(-D.fx, -D.fz); this.camPitch = 0.22;
    this.camera.fov = 58; this.camera.updateProjectionMatrix();
    this.camPos.set(u.pos.x + Math.sin(this.camYaw) * 2, 2.1, u.pos.z + Math.cos(this.camYaw) * 2);
    this.camera.position.copy(this.camPos); this.lookCur.set(u.pos.x, 1.4, u.pos.z);
    this._camLibre = undefined;
  }

  // La balade commence (l'écran de chargement vient de se lever, js/main.js)
  enterLobby() {
    this.mode = 'lobby'; this.paused = false; hideOverlay(); this.wheel.close();
    this.fx.reAdapter();          // l'œil repart de la vue de balade (js/fx.js)
    this.hud.show(); this.hud.setLobby();
    this.hud.feedback(this.carte.nom ? this.carte.nom.toUpperCase() : 'IRIS', 'info');
    // L'AIDE DES TOUCHES au milieu de l'écran : le temps de la lire (14 s, dont 6 s au moins après le premier pas), puis
    // elle s'efface — le rappel en bas à droite (.keys) reste, et Options › Commandes a tout.
    this.hud.hint(this.lobbyHint()); this._aideT = 14; this._aideMin = 6;
    this.input.blocked = false;
  }

  // L'AIDE AU MILIEU DE L'ÉCRAN quand rien de particulier ne se passe : la proposition de siège s'il y en a une, sinon
  // l'aide des touches tant qu'elle n'est pas effacée (_aideT), sinon rien
  aideRepos() {
    if (this._presSiege === 'assis') return `${actionKey('interact')} : se lever · ou bouge pour te lever`;
    if (this._presSiege) return `${actionKey('interact')} : s’asseoir sur ${this._presSiege.nom || 'le siège'}`;
    return this._aideT > 0 ? this.lobbyHint() : '';
  }
  majAide() { this.hud.hint(this.aideRepos()); }

  lobbyHint() {
    if (manetteActive()) return aideBalade();
    if (IS_TOUCH) return 'pouce à gauche = joystick (effleure : marcher, au bord : sprint) · glisse à droite = caméra · SAUT · 🕺 emotes · 📱 téléphone';
    return `souris = caméra · ${actionKey('camera')} = vue (3e / épaule / 1re personne) · ${actionKey('walk')} = marcher · ${actionKey('sprint')} = sprint · ${actionKey('jump')} = sauter · ${actionKey('emote')} = emotes · ${actionKey('phone')} = téléphone · ${actionKey('pause')} = pause`;
  }

  // ---------- emotes (roue) ----------
  // La touche emote ouvre la roue ; maintenir + souris puis relâcher, ou touches 1-8, ou clic. Rend vrai si la touche
  // pause a été « mangée » (elle referme la roue).
  updateEmoteInput(dt) {
    const inp = this.input, w = this.wheel;
    if (this.paused || this.mode !== 'lobby' || inp.blocked) { if (w.isOpen) w.close(); return false; }
    if (inp.pressed('emote')) {
      if (w.isOpen) w.close();
      else if (this.canEmote()) { w.open(); this.wheelHold = 0; }
      else this.hud.hint('Emote impossible pour l\'instant');
    }
    if (!w.isOpen) return false;
    this.wheelHold += dt;
    if (inp.released('emote') && this.wheelHold > 0.3 && w.hovered !== null) { this.doEmote(w.hovered); w.close(); return false; }
    const nk = Math.min(9, (w.emotes || []).length);
    for (let i = 1; i <= nk; i++)
      if (inp.keyPressed('Digit' + i) || inp.keyPressed('Numpad' + i)) { this.doEmote(i - 1); w.close(); return false; }
    if (inp.pressed('pause')) { w.close(); return true; }
    return false;
  }
  canEmote() { const u = this.user; return !!u && !u.airborne && !u.assis; }
  doEmote(i) {
    const e = (this.wheel.emotes || [])[i], u = this.user;
    if (!e || !this.canEmote()) return;
    if (u.startEmote(e)) { this.hud.streak(`${e.icon} ${e.label.toUpperCase()}`); this.hud.hint(`${e.label} · bouge pour arrêter`); this._aideEmote = true; }
  }

  togglePause() {
    this.paused = !this.paused;
    if (!this.paused) { hideOverlay(); return; }
    if (document.pointerLockElement) document.exitPointerLock?.();
    showOverlay('PAUSE', this.carte.nom ? `IRIS · ${this.carte.nom}` : 'IRIS', [
      { label: 'Reprendre', cls: 'btn-primary', onClick: () => this.togglePause() },
      { label: 'Options', cls: 'btn-secondary', onClick: () => this.cb.onOptions?.() },
      { label: 'Commandes', cls: 'btn-secondary', onClick: () => this.cb.onAide?.() },
      { label: 'Revenir au départ', cls: 'btn-secondary', onClick: () => { this.placerAuDepart(); this.togglePause(); } },
    ]);
  }

  frame(dt) {
    this.fx.debutImage?.();
    const enJeu = this.mode === 'lobby';
    if (enJeu !== this._enJeu) { this._enJeu = enJeu; document.body.classList.toggle('en-jeu', enJeu); }
    this.input.scruter(this, dt);                    // manette : boutons -> codes « Pad:… », sticks, menus (js/manette.js)
    this.audio.setListener(this.camera.position);
    const wheelAte = this.updateEmoteInput(dt);
    if (enJeu && !wheelAte && this.input.pressed('pause')) this.togglePause();
    if (enJeu && this.input.pressed('phone')) this.cb.onPhone?.();
    if (enJeu && this.input.pressed('camera')) {
      this.vue = this.vue === 3 ? 2 : this.vue === 2 ? 1 : 3;
      if (this.settings) this.settings.set('game.vue', this.vue);
      this.hud.feedback(this.vue === 1 ? 'VUE 1re PERSONNE' : this.vue === 2 ? 'VUE ÉPAULE' : 'VUE 3e PERSONNE', 'info');
    }
    if (!this.paused) {
      // PAS FIXE de 1/120 s : la même partie sur toutes les machines, quelle que soit la cadence de l'écran. Au
      // téléphone, cinq pas au plus par image (une image lente n'en demande pas plus qui la ralentiraient encore).
      this.acc = Math.min(0.25, (this.acc || 0) + dt);
      const maxPas = TELEPHONE ? 5 : 6;
      let nPas = 0, n = 0;
      for (let r = this.acc; r >= FIXED_DT && nPas < maxPas; r -= FIXED_DT) nPas++;
      while (this.acc >= FIXED_DT && n < maxPas && !this.paused) {
        Player.poseVisible = n === nPas - 1;
        this.time += FIXED_DT; this.update(FIXED_DT); this.acc -= FIXED_DT; n++;
      }
      Player.poseVisible = true;
      if (n >= maxPas) this.acc = Math.min(this.acc, 2 * FIXED_DT);
    }
    // AVANT la caméra : elle suit la position AFFICHÉE, pas celle du dernier pas simulé
    this.interpoler();
    this.updateCamera(this.paused ? 0 : dt);
    this.weather.update(dt, this.camera.position);
    this.cb.onTick?.(dt);
    this.scene.userData.animate?.(this.time);
    this.ombres.update(dt, this.fx.quality, this.fx.shadows, this.user);
    if ((this._chaudN || 0) < PRECHAUFFE.length) {
      this._chaudT = (this._chaudT || 0) + dt;
      if (this._chaudT >= PRECHAUFFE[this._chaudN || 0]) { this._chaudN = (this._chaudN || 0) + 1; this.prechaufferScene(); }
    }
    this.fx.calme = true;                            // (une balade : la qualité peut remonter quand la marge revient)
    this.fx.render(dt);
    this.input.endFrame();
    this.fpsT += dt; this.fpsN++;
    if (this.fpsT >= 0.5) { this.hud.setFps(this.fpsN / this.fpsT); this.fpsT = 0; this.fpsN = 0; }
  }

  addShake(amp, dur = 0.4) { const s = this.shake; s.amp = Math.max(amp, s.amp * (s.t / s.dur)); s.t = dur; s.dur = dur; }
  _applyShake(dt) {
    const s = this.shake; if (s.t <= 0) return;
    s.t -= dt; const k = Math.max(0, s.t / s.dur), a = s.amp * k * k, t = performance.now() * 0.001;
    this.camera.position.x += Math.sin(t * 61.3) * a; this.camera.position.y += Math.sin(t * 47.7 + 1.3) * a; this.camera.position.z += Math.cos(t * 53.1) * a * 0.5;
  }

  // Une fois par image, après la boucle à pas fixe : la fraction de pas déjà écoulée à l'écran mais pas encore simulée
  interpoler() {
    const a = Math.max(0, Math.min(1, (this.acc || 0) / FIXED_DT));
    this.user.presenter(a);
  }

  update(dt) {
    this.user.memoriser();
    if (this.mode !== 'lobby') { this.user.move(ZERO, false, dt); this.user.update(dt); return; }
    const u = this.user, inp = this.input;
    // déplacement relatif à la caméra GTA
    const a = inp.blocked ? { x: 0, y: 0 } : inp.axis();
    _dir.set(0, 0, 0);
    if (a.x || a.y) {
      _v.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
      _v2.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
      _dir.addScaledVector(_v, a.y).addScaledVector(_v2, a.x).normalize();
    }
    if (u.emote && (a.x || a.y)) u.stopEmote();
    if (this._aideT > 0) {
      // (le compte ne file qu'une fois qu'on bouge : qui lit l'aide sans toucher à rien la garde)
      this._aideMin -= (a.x || a.y) ? dt : 0; this._aideT -= dt;
      if (this._aideT <= 0 && this._aideMin > 0) this._aideT = 0.001;
      if (this._aideT <= 0 && !this._presSiege && this.hud.hintTxt === this.lobbyHint()) this.hud.hint('');
    }
    // l'emote finie (ou interrompue), son aide s'en va
    if (this._aideEmote && !u.emote) { this._aideEmote = false; this.majAide(); }
    this.updateSieges(u, a);
    // ALLURE : la touche de marche, ou un manche à peine poussé (comme sur une manette). Le sprint gagne toujours.
    u.marche = !inp.sprint() && (inp.down('walk') || (() => { const amp = inp.amplitude(); return amp > 0.02 && amp < 0.58; })());
    u.move(_dir, inp.sprint(), dt);
    // LE SAUT (la touche de tir de LA CAGE, sans ballon : elle faisait déjà sauter en balade)
    if (inp.pressed('jump') && !u.airborne && !u.assis && !inp.blocked) { if (u.emote) u.stopEmote(); u.jump(2.6); }
    u.update(dt);
    this.hud.stamina(u.stamina);
  }

  // ---------- s'asseoir ----------
  // Les sièges de la carte (js/carte_ecole.js : chaises, bancs). Le plus proche à moins de 1,1 m est proposé ; la touche
  // d'action assoit, et le moindre déplacement (ou la même touche, ou le saut) relève.
  updateSieges(u, a) {
    const S = this.sieges;
    if (!S.length || this.input.blocked) return;
    if (u.assis) {
      const bouge = Math.hypot(a.x, a.y) > 0.45;
      if (this.input.pressed('interact') || this.input.pressed('jump') || bouge) u.seLever();
      if (u.assisPose && this._presSiege !== 'assis') { this._presSiege = 'assis'; this.majAide(); }
      return;
    }
    let best = null, bd = 1.1;
    if (!u.airborne && !u.emote) {
      for (const s of S) {
        const d = Math.hypot(u.pos.x - s.x, u.pos.z - s.z);
        if (d < bd) { bd = d; best = s; }
      }
    }
    if (best !== this._presSiege) {
      const avant = this._presSiege;
      this._presSiege = best;
      if (best || avant) this.majAide();
      window.__touch?.refresh();
    }
    if (best && this.input.pressed('interact')) u.sasseoir(best);
  }

  // ---------- caméra ----------
  // LA CAMÉRA DANS LES MURS. Dans LA CAGE, la caméra de balade était faite pour un terrain ouvert : à 4,3 m derrière le
  // joueur, elle passait derrière la première cloison venue. Ici, la place VOULUE (recul, hauteur, angle de la souris)
  // est d'abord gardée sous le plafond (28 cm dessous), puis on demande au monde solide quelle part du chemin entre la
  // tête et elle est libre (rayonLibre, une sphère de 20 cm) : elle se rapproche d'autant — VITE quand un mur arrive
  // (25 /s), LENTEMENT quand il s'en va (4 /s), pour ne pas pomper (la règle de LA CAGE sur le relief du parc). Et après
  // le lissage, une dernière vérification : la caméra réellement posée ne peut pas être derrière un mur, même pendant
  // qu'elle glisse vers sa place. Collée au joueur (moins de 45 cm de la tête), elle le masque, comme à la première
  // personne, plutôt que de montrer l'intérieur de son crâne.
  _cibleCam(p, u, ox, oz, h, dt) {
    const C = this.collisions, tete = p.solAff + p.h * 0.93;
    let tx = u.x + ox, tz = u.z + oz, ty = p.solAff + h;
    const plaf = Math.min(C.plafondEn(u.x, u.z), C.plafondEn(tx, tz));
    if (Number.isFinite(plaf)) ty = Math.min(ty, Math.max(tete + 0.05, plaf - 0.28));
    const libre = C.rayonLibre(u.x, tete, u.z, tx, ty, tz, RAYON_CAM);
    const L = Math.max(0.3, Math.hypot(tx - u.x, ty - tete, tz - u.z));
    const f = Math.max(0, libre - 0.08 / L), c = this._camLibre ?? 1;
    this._camLibre = c + (f - c) * (dt > 0 ? damp(f < c ? 25 : 4, dt) : 0);
    const k = Math.min(this._camLibre, f < 1 ? f : 1);
    this.camTarget.set(u.x + (tx - u.x) * k, tete + (ty - tete) * k, u.z + (tz - u.z) * k);
  }

  updateCamera(dt) {
    if (this.freeCam) return;   // débogage : caméra pilotée à la main (__game.freeCam = true)
    const p = this.user, u = p.posAff, cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    const yeux = p.h * 0.93 + p.jumpY + p.solAff;
    // CHAMP DE VISION : il s'ouvre un peu quand on file (sprint) — sept degrés au plus
    if (dt > 0) {
      const fov = 58 + 7 * clamp((p.speedNow - 4.2) / 3.8, 0, 1);
      if (Math.abs(fov - this.camera.fov) > 0.01) { this.camera.fov += (fov - this.camera.fov) * damp(3, dt); this.camera.updateProjectionMatrix(); }
    }
    if (this.vue === 1) {
      // À la première personne, l'œil est dans la TÊTE de l'avatar (moitié du balancement vertical seulement)
      const tete = p.avatar && p.avatar.bone('Head');
      if (tete) {
        tete.getWorldPosition(_vCam);
        const fx = Math.sin(p.ang), fz = Math.cos(p.ang);
        this.camPos.set(_vCam.x + fx * 0.09, (_vCam.y + 0.09) * 0.5 + yeux * 0.5, _vCam.z + fz * 0.09);
      } else this.camPos.set(u.x, yeux, u.z);
      _v.set(this.camPos.x - Math.sin(this.camYaw) * 3, this.camPos.y - sp * 3.2, this.camPos.z - Math.cos(this.camYaw) * 3);
      this.lookCur.lerp(_v, damp(22, dt));
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.lookCur);
      this._applyShake(dt);
      if (p.mesh) p.mesh.visible = false;               // on ne se voit pas de l'intérieur
      p.vuePremiere = true;                             // ... mais on est bien là (pas, regards)
      return;
    }
    // 2 = épaule (1,95 m), 3 = troisième personne (4,3 m), dans l'axe du joueur
    const d = this.vue === 2 ? 1.95 : 4.3;
    const haut = this.vue === 2 ? 1.62 : 1.5;
    const dx = Math.sin(this.camYaw), dz = Math.cos(this.camYaw);
    this._cibleCam(p, u, dx * d * cp, dz * d * cp, haut + d * sp, dt);
    this.camPos.lerp(this.camTarget, damp(this.vue === 2 ? 16 : 12, dt));
    // la caméra RÉELLEMENT posée ne passe jamais derrière un mur (pendant qu'elle glisse vers sa place)
    const tete = p.solAff + p.h * 0.93, C = this.collisions;
    const f2 = C.rayonLibre(u.x, tete, u.z, this.camPos.x, this.camPos.y, this.camPos.z, RAYON_CAM * 0.9);
    if (f2 < 1) { const k = Math.max(0, f2 - 0.02); this.camPos.set(u.x + (this.camPos.x - u.x) * k, tete + (this.camPos.y - tete) * k, u.z + (this.camPos.z - u.z) * k); }
    _v.set(u.x, (this.vue === 2 ? 1.5 : 1.4) + p.jumpY * 0.5 + p.solAff, u.z);
    this.lookCur.lerp(_v, damp(this.vue === 2 ? 18 : 14, dt));
    this.camera.position.copy(this.camPos); this.camera.lookAt(this.lookCur); this._applyShake(dt);
    // collée au joueur : on le masque plutôt que de montrer l'intérieur de sa tête
    const pres = Math.hypot(this.camPos.x - u.x, this.camPos.y - tete, this.camPos.z - u.z) < 0.45;
    if (p.mesh) p.mesh.visible = !pres;
    p.vuePremiere = pres;
  }
}
