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
//   - LES VUES de la balade (3e personne, épaule, 1re personne, « vue photo »), à la souris façon GTA, et qui ne traversent
//     plus les murs : dans un couloir, la caméra se rapproche au lieu de passer derrière la cloison, elle reste sous le
//     plafond et dans la pièce de Haythem (la caméra V2 du 11/10, voir « caméra » plus bas) ;
//   - la simulation à PAS FIXE (1/120 s) et l'interpolation d'affichage, la limite d'images par seconde, la pause.

// Pas de simulation fixe : 120 Hz. Le rendu reste libre, seule la logique de jeu est cadencée.
const FIXED_DT = 1 / 120;
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _dir = new THREE.Vector3(), _vCam = new THREE.Vector3();
const PRECHAUFFE = [1.5, 4, 8, 14, 22];   // moments (s) où l'on précompile le décor qui vient d'arriver (prechaufferScene)
const RAYON_CAM = 0.2;                    // la caméra est une petite sphère : elle garde 20 cm des murs et du plafond
// LA CAMÉRA V2 (11/10 ; plan V2 § 3, audit gabarit_camera § 5 ; retours de Haythem du 10/10 : « les salles sont trop
// compressées », r01 « la porte n'est pas aussi loin ») — les cotes de la carte n'y sont pour rien, c'est le regard :
//   - CHAMP vertical de 63°, celui des photos de Haythem (Galaxy S25 Ultra, ultra grand-angle 13 mm : 106° × 63°), avec
//     l'horizontal plafonné à 108° (pas d'effet fish-eye en ultra-large) ; +7° au sprint, 70° au plus ;
//   - RECUL de 2,6 m à l'intérieur (4,3 m dans la rue), caméra à 1,6 + recul × sin(tangage) ≈ 1,9 m, 7° de piqué (au lieu
//     de 4,3 m, 2,1-2,4 m et 13° : la salle d'attente au premier plan de la photo 06, trop de sol, pas assez de mur) ;
//   - ÉPAULE : 0,4 m à droite (à gauche si un mur est à moins de 0,6 m à droite), visée 0,24 m à droite à 1,45 m : Haythem
//     ne bouche plus le point de fuite des couloirs (photo 01, VO q_0300) ;
//   - jamais dans une AUTRE PIÈCE que lui : sa zone, ou une voisine déclarée par une ouverture large, sinon le recul est
//     raccourci jusqu'au seuil — plus de cadrage à travers un chambranle (photo 24) ;
//   - recul libre sous 1,5 m : épaule vers le côté libre, à 1,6 m ; sous 1,2 m, champ porté à 69° (« le 0,5x du
//     téléphone ») ; à moins de 0,6 m de lui, Haythem en demi-transparence (0,35) au lieu d'être masqué.
const DEG = Math.PI / 180;
const CHAMP = 63, CHAMP_H_MAX = 108, CHAMP_SPRINT = 7, CHAMP_MAX = 70, CHAMP_SERRE = 69;
const TANGAGE = 0.12;                     // le piqué de départ (7°)
const RECUL = 2.6, RECUL_RUE = 4.3, HAUT_CAM = 1.6, EPAULE = 0.4, VISEE_EPAULE = 0.24, VISEE_H = 1.45;
const BAIE = 2.0;                         // une ouverture plus étroite est une baie de porte (la plus large, la porte 6 : 1,90)
const OEIL_PHOTO = 1.45;                  // la « vue photo » : l'œil à hauteur de téléphone tenu devant soi
// le champ vertical pour un écran de rapport `aspect` : 63°, sauf si l'horizontal dépasse alors 108°
const champBase = (aspect) => Math.min(CHAMP, 2 * Math.atan(Math.tan(CHAMP_H_MAX / 2 * DEG) / Math.max(0.2, aspect || 1)) / DEG);

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
    this.camera = new THREE.PerspectiveCamera(champBase(window.innerWidth / window.innerHeight), window.innerWidth / window.innerHeight, 0.08, 400);
    this.camera.position.set(0, 2.5, 7);
    this.lookCur = new THREE.Vector3(0, 1.4, 3);
    this.camTarget = new THREE.Vector3();
    // Quatre vues, à faire tourner avec la touche caméra : 3 = 3e personne, 2 = épaule, 1 = première personne, 4 = « vue
    // photo » (l'œil à 1,45 m, 63° : pour comparer pièce par pièce avec les photos de Haythem)
    const vue = settings && settings.game.vue;
    this.vue = [1, 2, 3, 4].includes(vue) ? vue : 3;

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
    this.camYaw = 0; this.camPitch = TANGAGE; this.dragging = false;
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
    u.pos.y = this.collisions.solEn(D.x, D.z, D.y || 0);   // (un départ sur un palier de l'escalier)
    u.airborne = false; u.jumpY = 0; u.jumpVel = 0;
    u.memoriser();
    this.collisions.resoudre(u.pos, 0.3, null, u.pos.y);   // (un départ mal posé contre un mur en est sorti)
    this.camYaw = Math.atan2(-D.fx, -D.fz); this.camPitch = TANGAGE;
    this.camera.fov = champBase(this.camera.aspect); this.camera.updateProjectionMatrix();
    // la caméra POSÉE d'emblée à sa place, sans glisser depuis l'ancienne (au départ : 2,6 m derrière lui, dans le hall,
    // comme la VO à 6,4 s — et non plus dans la rue, derrière la porte 6)
    u.presenter(1);
    this._camLibre = undefined; this._cam = null;
    this.updateCamera(0, true);
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
      // 3 -> épaule -> 1re personne -> vue photo -> 3
      this.vue = this.vue === 3 ? 2 : this.vue === 2 ? 1 : this.vue === 1 ? 4 : 3;
      if (this.settings) this.settings.set('game.vue', this.vue);
      this.hud.feedback(this.vue === 1 ? 'VUE 1re PERSONNE' : this.vue === 2 ? 'VUE ÉPAULE' : this.vue === 4 ? 'VUE PHOTO (œil à 1,45 m)' : 'VUE 3e PERSONNE', 'info');
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
    // LA CARTE VIVANTE (js/carte_ecole.js maj) : les portes qui s'ouvrent devant Haythem, les lampes qui le suivent,
    // la carte d'environnement reprise dans la pièce où il entre
    this.carte.maj?.(this.paused ? 0 : dt, this);
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
  // joueur, elle passait derrière la première cloison venue. Ici, la place VOULUE (recul, hauteur, angle de la souris,
  // épaule) est d'abord gardée sous le plafond (28 cm dessous), puis on demande au monde solide quelle part du chemin entre
  // l'épaule et elle est libre (rayonLibre, une sphère de 20 cm), et aux zones quelle part reste dans la pièce de Haythem
  // (_partPiece) : elle se rapproche d'autant — VITE quand un mur arrive (25 /s), LENTEMENT quand il s'en va (4 /s), pour ne
  // pas pomper (la règle de LA CAGE sur le relief du parc). Et après le lissage, une dernière vérification : la caméra
  // réellement posée ne peut pas être derrière un mur, même pendant qu'elle glisse vers sa place.
  // (11/10, caméra V2 : les réglages en tête du fichier. Les plafonds bas — hall ouest 2,30, 2e 2,40 — la baissent d'eux-
  // mêmes, puisqu'elle reste 28 cm dessous : rien à compenser.)

  // LA PIÈCE DE LA CAMÉRA. La part du segment P -> P + D (au pas de 10 cm, jusqu'à `tMax`) qui reste dans la pièce de
  // Haythem — sa zone `Zh` (js/ecole_lumieres.js zoneEn, à ses pieds `sol` : les étages et le sous-sol ont leurs zones) —
  // ou dans une voisine DÉCLARÉE (l'une dans les `voisines` de l'autre) où l'on entre par une OUVERTURE LARGE. Moins de
  // BAIE (2 m) entre les jambages, c'est une porte : la caméra s'arrête 15 cm avant la zone d'à côté (photo 24 : elle ne
  // passe plus dans le vestibule, derrière le chambranle). Hors de toute zone (l'épaisseur d'un mur, un recoin sans zone),
  // on passe sans compter. Aucune liste de pièces : tout vient des zones de la carte.
  _partPiece(px, py, pz, dx, dy, dz, sol, Zh, tMax = 1) {
    const Lu = this.carte.lumieres, long = Math.hypot(dx, dz);
    if (!Lu || !Zh || long < 0.05 || tMax <= 0) return tMax;
    const n = Math.ceil(long * tMax / 0.1), pas = tMax / n;
    const admises = this._admises || (this._admises = new Set());
    admises.clear(); admises.add(Zh);
    let tOk = 0;
    for (let i = 1; i <= n; i++) {
      const t = i * pas, Z = Lu.zoneEn(px + dx * t, pz + dz * t, sol);
      if (!Z) continue;
      if (admises.has(Z)) { tOk = t; continue; }
      const voisine = (Zh.voisines || []).includes(Z.id) || (Z.voisines || []).includes(Zh.id);
      if (voisine && this._ouvertureLarge(px, py, pz, dx, dy, dz, long, tOk, t)) { admises.add(Z); tOk = t; continue; }
      return Math.max(0, tOk - 0.15 / long);
    }
    return tMax;
  }
  // l'ouverture entre deux zones (entre t0 et t1 du segment, 30 cm de part et d'autre) : la plus petite largeur libre prise
  // en travers, à hauteur de caméra (sous le linteau d'une porte) — vrai si elle atteint BAIE partout
  _ouvertureLarge(px, py, pz, dx, dy, dz, long, t0, t1) {
    const C = this.collisions, nx = -dz / long, nz = dx / long, R = BAIE * 0.6;
    for (let s = t0 * long - 0.3; s <= t1 * long + 0.3; s += 0.1) {
      const t = Math.max(0, s / long), x = px + dx * t, y = py + dy * t, z = pz + dz * t;
      const w = (C.rayonLibre(x, y, z, x + nx * R, y, z + nz * R, 0.02) + C.rayonLibre(x, y, z, x - nx * R, y, z - nz * R, 0.02)) * R;
      if (w < BAIE) return false;
    }
    return true;
  }

  // LA PLACE VOULUE de la caméra (vues 2 et 3) -> this.camTarget. Son état (this._cam) garde l'épaule et son côté, le
  // recul, la pièce de Haythem, le pivot (l'épaule d'où part le segment) et le recul libre obtenu `dl` (qui règle la
  // hauteur et le champ).
  _cibleCam(p, u, dt, poser = false) {
    const C = this.collisions, S = this._cam || (this._cam = { cote: 1, epaule: null, recul: null, zone: null, dl: RECUL, px: 0, py: 0, pz: 0 });
    const v3 = this.vue === 3, sol = p.solAff, tete = sol + p.h * 0.93;
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    const bx = Math.sin(this.camYaw), bz = Math.cos(this.camYaw), rx = bz, rz = -bx;   // vers l'arrière ; la droite de l'écran
    const lis = (v) => (poser ? 1 : dt > 0 ? damp(v, dt) : 0);
    // la PIÈCE de Haythem (sur le seuil d'une porte, entre deux zones : celle d'où il vient)
    const Lu = this.carte.lumieres;
    let Zh = Lu ? Lu.zoneEn(u.x, u.z, sol) : null;
    if (Zh) S.zone = Zh; else Zh = S.zone;
    // le RECUL : 2,6 m à l'intérieur, 4,3 m dans la rue (ou hors de toute zone et de tout plafond) ; 1,95 m en vue épaule
    const dehors = Zh ? Zh.id === 'rue' : !Number.isFinite(C.plafondEn(u.x, u.z, sol + 0.5));
    const dV = v3 ? (dehors ? RECUL_RUE : RECUL) : 1.95;
    S.recul = S.recul === null ? dV : S.recul + (dV - S.recul) * lis(2.5);
    const d = S.recul, ty0 = sol + (v3 ? HAUT_CAM : 1.62) + d * sp;
    // (les plafonds AU-DESSUS du joueur : sur le palier de l'étage, celui du hall en dessous ne compte pas)
    const yMin = sol + 0.5, plafU = C.plafondEn(u.x, u.z, yMin);
    // UN ESSAI depuis l'épaule `e` (en mètres, + à droite) : la cible sous le plafond, puis la part libre (murs, pièce)
    const essai = (e) => {
      const px = u.x + rx * e, pz = u.z + rz * e, tx = px + bx * d * cp, tz = pz + bz * d * cp;
      let ty = ty0;
      const plaf = Math.min(plafU, C.plafondEn(tx, tz, yMin));
      if (Number.isFinite(plaf)) ty = Math.min(ty, Math.max(tete + 0.05, plaf - 0.28));
      const libre = C.rayonLibre(px, tete, pz, tx, ty, tz, RAYON_CAM);
      const L = Math.max(0.3, Math.hypot(tx - px, ty - tete, tz - pz));
      let f = libre < 1 ? Math.max(0, libre - 0.08 / L) : 1;          // (8 cm de marge devant un mur, pas en plein air)
      f = Math.min(f, this._partPiece(px, tete, pz, tx - px, ty - tete, tz - pz, sol, Zh, f));
      return { px, pz, tx, ty, tz, f, dl: f * d * cp };
    };
    let E;
    if (!v3) E = essai(0);
    else {
      // L'ÉPAULE : la place libre de chaque côté de la tête (moins la sphère de la caméra et 8 cm de marge)
      const R = 1.0, cD = C.rayonLibre(u.x, tete, u.z, u.x + rx * R, tete, u.z + rz * R, 0.02) * R;
      const cG = C.rayonLibre(u.x, tete, u.z, u.x - rx * R, tete, u.z - rz * R, 0.02) * R;
      const eD = clamp(cD - RAYON_CAM - 0.08, 0, EPAULE), eG = clamp(cG - RAYON_CAM - 0.08, 0, EPAULE);
      // LE CÔTÉ : à droite, sauf un mur à moins de 0,6 m à droite ; et quand le recul libre tombe sous 1,5 m, le côté où il
      // est le plus long (avec de l'hystérésis : la caméra ne bat pas d'une épaule à l'autre)
      const ED = essai(eD);
      let EG = null;
      const gauche = () => EG || (EG = essai(-eG));
      let cote = S.cote;
      if (poser) cote = cD < 0.6 && cG > cD + 0.05 ? -1 : 1;
      if (cote > 0) {
        if ((cD < 0.6 && cG > cD + 0.05) || (ED.dl < 1.5 && gauche().dl > ED.dl + 0.3)) cote = -1;
      } else {
        const G = gauche();
        if ((cD >= 0.75 && ED.dl >= Math.min(1.5, G.dl - 0.1)) || (G.dl < 1.5 && ED.dl > G.dl + 0.3)) cote = 1;
      }
      S.cote = cote;
      // l'épaule glisse vers son côté (d'une épaule à l'autre en ≈ 0,4 s), sans jamais entrer dans un mur
      const eV = cote > 0 ? eD : -eG;
      S.epaule = clamp(S.epaule === null ? eV : S.epaule + (eV - S.epaule) * lis(5), -eG, eD);
      E = Math.abs(S.epaule - eD) < 1e-4 ? ED : EG && Math.abs(S.epaule + eG) < 1e-4 ? EG : essai(S.epaule);
    }
    // le lissage de la part libre (vite quand un mur ou un seuil arrive, lentement quand il s'en va)
    const c = this._camLibre ?? 1;
    this._camLibre = poser ? E.f : c + (E.f - c) * (dt > 0 ? damp(E.f < c ? 25 : 4, dt) : 0);
    const k = Math.min(this._camLibre, E.f);
    S.dl = k * d * cp;
    // recul libre sous 1,5 m : la caméra redescend à hauteur d'épaule (1,6 m) au lieu de surplomber Haythem
    const s9 = v3 ? clamp((S.dl - 1.5) / 0.3, 0, 1) : 1;
    S.px = E.px; S.py = tete; S.pz = E.pz;
    this.camTarget.set(E.px + (E.tx - E.px) * k, tete + (E.ty - tete) * k * s9, E.pz + (E.tz - E.pz) * k);
  }

  // LE CHAMP voulu : 63° (l'horizontal plafonné à 108°) ; +7° au sprint, 70° au plus ; en vue 3, porté à 69° quand le
  // recul libre tombe sous 1,2 m (le « 0,5x » du téléphone : c'est ainsi que Haythem photographie les couloirs) ; la vue
  // photo garde ses 63°
  _champ(p, dt, poser) {
    const base = champBase(this.camera.aspect), plafond = CHAMP_MAX * base / CHAMP;
    let fov = base;
    if (this.vue !== 4) fov = Math.min(plafond, base + CHAMP_SPRINT * clamp((p.speedNow - 4.2) / 3.8, 0, 1));
    if (this.vue === 3 && this._cam) {
      const serre = clamp((1.2 - this._cam.dl) / 0.4, 0, 1);
      fov = Math.min(plafond, Math.max(fov, base * (1 + (CHAMP_SERRE / CHAMP - 1) * serre)));
    }
    if (poser) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); return; }
    if (dt > 0 && Math.abs(fov - this.camera.fov) > 0.01) { this.camera.fov += (fov - this.camera.fov) * damp(3, dt); this.camera.updateProjectionMatrix(); }
  }

  // HAYTHEM EN DEMI-TRANSPARENCE (opacité `k`, 1 = opaque) quand la caméra le frôle : on garde le repère du personnage au
  // lieu de le masquer. Ses matériaux passent « transparents » le temps qu'il faut ; les programmes de cette variante sont
  // compilés une fois, dès que l'avatar paraît (le premier frôlement ne fige pas l'image).
  _fantome(p, k) {
    if (!this._fantomePret && p.avatarModel && p.avatarModel.visible) {
      this._fantomePret = true;
      const avant = p._opacite ?? 1;
      this._opacite(p, 0.35); this._compilerAsync(p.avatarModel); this._opacite(p, avant);
    }
    k = Math.round(k * 40) / 40;
    if ((p._opacite ?? 1) !== k) this._opacite(p, k);
  }
  // (chaque maille a son JUMEAU de profondeur — même géométrie, même squelette —, dessiné avec les objets opaques et sans
  // couleur : la demi-transparence ne montre que la surface la plus proche, pas l'oreille à travers la joue)
  _opacite(p, k) {
    p._opacite = k;
    const mailles = [];
    for (const o of [p.avatarModel, p.body]) if (o) o.traverse((m) => { if (m.isMesh && m.material && !m.userData.jumeauProf) mailles.push(m); });
    for (const m of mailles) {
      for (const M of Array.isArray(m.material) ? m.material : [m.material]) {
        const O = M.userData.opaque || (M.userData.opaque = { o: M.opacity, t: M.transparent });
        const t = O.t || k < 1;
        if (M.transparent !== t) { M.transparent = t; M.needsUpdate = true; }
        M.opacity = O.o * k;
      }
      const J = this._jumeaux || (this._jumeaux = new WeakMap());
      let j = J.get(m);
      if (!j && k < 1) {
        const mat = this._matProf || (this._matProf = new THREE.MeshBasicMaterial({ colorWrite: false }));
        j = m.isSkinnedMesh ? new THREE.SkinnedMesh(m.geometry, mat) : new THREE.Mesh(m.geometry, mat);
        if (m.isSkinnedMesh) j.bind(m.skeleton, m.bindMatrix);
        if (m.morphTargetInfluences) { j.morphTargetInfluences = m.morphTargetInfluences; j.morphTargetDictionary = m.morphTargetDictionary; }
        j.frustumCulled = false; j.castShadow = false; j.receiveShadow = false;
        j.userData.jumeauProf = true; j.userData.dynamique = true;
        J.set(m, j); m.add(j);
      }
      if (j) j.visible = k < 1;
    }
  }

  // `poser` : la caméra posée d'emblée à sa place, sans lissage (le départ)
  updateCamera(dt, poser = false) {
    if (this.freeCam) return;   // débogage : caméra pilotée à la main (__game.freeCam = true)
    const p = this.user, u = p.posAff, cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    const yeux = p.h * 0.93 + p.jumpY + p.solAff;
    const bx = Math.sin(this.camYaw), bz = Math.cos(this.camYaw);
    if (this.vue === 1 || this.vue === 4) {
      this._champ(p, dt, poser);
      if (this.vue === 4) {
        // LA VUE PHOTO : l'œil à 1,45 m, là où Haythem tient son téléphone (un peu devant lui), sans le balancement de la
        // tête — pour comparer pièce par pièce avec ses photos
        this.camPos.set(u.x - bx * 0.12, p.solAff + OEIL_PHOTO + p.jumpY, u.z - bz * 0.12);
      } else {
        // À la première personne, l'œil est dans la TÊTE de l'avatar (moitié du balancement vertical seulement)
        const tete = p.avatar && p.avatar.bone('Head');
        if (tete) {
          tete.getWorldPosition(_vCam);
          const fx = Math.sin(p.ang), fz = Math.cos(p.ang);
          this.camPos.set(_vCam.x + fx * 0.09, (_vCam.y + 0.09) * 0.5 + yeux * 0.5, _vCam.z + fz * 0.09);
        } else this.camPos.set(u.x, yeux, u.z);
      }
      _v.set(this.camPos.x - bx * 3, this.camPos.y - sp * 3.2, this.camPos.z - bz * 3);
      if (poser) this.lookCur.copy(_v); else this.lookCur.lerp(_v, damp(22, dt));
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.lookCur);
      this._applyShake(dt);
      this._fantome(p, 1);
      if (p.mesh) p.mesh.visible = false;               // on ne se voit pas de l'intérieur
      p.vuePremiere = true;                             // ... mais on est bien là (pas, regards)
      return;
    }
    // 2 = épaule (1,95 m, dans l'axe), 3 = troisième personne (2,6 m, à l'épaule droite)
    const v3 = this.vue === 3;
    this._cibleCam(p, u, dt, poser);
    const S = this._cam, C = this.collisions, tete = p.solAff + p.h * 0.93;
    if (poser) this.camPos.copy(this.camTarget); else this.camPos.lerp(this.camTarget, damp(v3 ? 12 : 16, dt));
    // la caméra RÉELLEMENT posée ne passe jamais derrière un mur (pendant qu'elle glisse vers sa place), vue de l'épaule
    const f2 = C.rayonLibre(S.px, S.py, S.pz, this.camPos.x, this.camPos.y, this.camPos.z, RAYON_CAM * 0.9);
    if (f2 < 1) { const k = Math.max(0, f2 - 0.02); this.camPos.set(S.px + (this.camPos.x - S.px) * k, S.py + (this.camPos.y - S.py) * k, S.pz + (this.camPos.z - S.pz) * k); }
    // LE POINT VISÉ : Haythem, 0,24 m à droite (du côté de l'épaule), à 1,45 m ; vue épaule : dans l'axe, à 1,5 m. De près,
    // le regard porte devant lui (sinon, à 40 cm, il plongerait de 20° vers le sol).
    const ve = v3 ? (S.epaule || 0) * (VISEE_EPAULE / EPAULE) : 0;
    _v.set(u.x + bz * ve, (v3 ? VISEE_H : 1.5) + p.jumpY * 0.5 + p.solAff, u.z - bx * ve);
    const dh = Math.hypot(this.camPos.x - _v.x, this.camPos.z - _v.z);
    if (v3 && dh < 1.5) { const a = 1.5 - dh; _v.x -= bx * cp * a; _v.y -= sp * a; _v.z -= bz * cp * a; }
    if (poser) this.lookCur.copy(_v); else this.lookCur.lerp(_v, damp(v3 ? 14 : 18, dt));
    this.camera.position.copy(this.camPos); this.camera.lookAt(this.lookCur); this._applyShake(dt);
    this._champ(p, dt, poser);
    // TOUT PRÈS DE LUI : en demi-transparence sous 0,6 m de sa tête (fondu depuis 0,8 m) ; masqué seulement quand la
    // caméra est dans sa tête (moins de 20 cm), plutôt que d'en montrer l'intérieur
    const dT = Math.hypot(this.camPos.x - u.x, this.camPos.y - tete, this.camPos.z - u.z);
    const masque = dT < 0.2;
    if (p.mesh) p.mesh.visible = !masque;
    p.vuePremiere = masque;
    this._fantome(p, masque ? 1 : 0.35 + 0.65 * clamp((dT - 0.6) / 0.2, 0, 1));
  }
}
