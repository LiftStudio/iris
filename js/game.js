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
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _dir = new THREE.Vector3(), _vCam = new THREE.Vector3(), _vTete = new THREE.Vector3();
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
//   - jamais dans une AUTRE PIÈCE que lui : sa zone, ou une voisine déclarée où l'on passe sans porte, sinon le recul est
//     raccourci jusqu'au seuil — plus de cadrage à travers un chambranle (photo 24) ; sauf sur le premier mètre derrière
//     lui (RECUL_SEUIL, plus bas) ;
//   - recul libre sous 1,5 m : épaule vers le côté libre, à 1,6 m ; sous 1,2 m, champ porté à 69° (« le 0,5x du
//     téléphone ») ; à moins de 0,6 m de lui, Haythem en demi-transparence (0,35) au lieu d'être masqué.
const DEG = Math.PI / 180;
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));   // un angle ramené dans ]-π ; π]
const CHAMP = 63, CHAMP_H_MAX = 108, CHAMP_SPRINT = 7, CHAMP_MAX = 70, CHAMP_SERRE = 69;
const TANGAGE = 0.12;                     // le piqué de départ (7°)
const RECUL = 2.6, RECUL_RUE = 4.3, HAUT_CAM = 1.6, EPAULE = 0.4, VISEE_EPAULE = 0.24, VISEE_H = 1.45;
const BAIE = 2.0;                         // un passage d'au moins 2 m n'est pas une porte (la plus large, la porte 6 : 1,90)
// LE SEUIL FRANCHI (vérification finale du 11/10) : au sortir d'une porte, la règle de la pièce collait la caméra au dos
// de Haythem tant qu'il n'en était pas à 2,6 m — la vue de jeu de la photo 24 (couloir est, Haythem à 0,7 m de la porte du
// vestibule) la mettait à 0,54 m derrière lui, Haythem translucide ; au seuil de l'espace pause du -1, à 0,13 m. Elle peut
// repasser le seuil d'où il vient jusqu'à 1,1 m derrière lui — par la baie, entre les jambages (les murs et les portes
// fermées l'arrêtent toujours) : 1,12 m sur la photo 24, le chambranle et le couloir cadrés comme sur la photo ; au-delà,
// la pièce reste la règle.
const RECUL_SEUIL = 1.1;
// LA CAMÉRA DOUCE (lot X1 « caméra », 11/10 ; rapport final V2, défauts de jeu § 6 et doute 13 : dans les volées et sur
// les paliers étroits — escalier principal, escalier est, volée de tôle et palier du -1, v_010 —, elle se collait encore
// à Haythem, translucide ; en marche avec des virages, elle heurtait les murs des passages étroits ; e1hall et e1pause,
// pauseSS et salleSS : elle s'arrêtait à leur seuil). Sans toucher à une cote :
//   - LA PENTE (PENTE) : dans une volée, la caméra suit le sol qu'elle survole (_solSous) — plus HAUT quand les marches
//     montent derrière Haythem (il descend : elle passe au-dessus des marches et regarde la volée par-dessus lui), dans
//     l'AXE de la volée quand elles descendent derrière lui (il monte : sous le rampant de la volée de tôle, elle n'avait
//     que 0,6 à 1 m ; elle suit la pente et reprend du recul) ; et sous les plafonds de son chemin (le vestibule de
//     l'escalier est, plus bas que la tête de Haythem sur la volée 1 : elle descend pour passer dessous) ;
//   - AU-DESSUS DE L'ÉPAULE (LEVE) : quand le recul libre tombe sous 1,5 m, elle monte au-dessus de sa tête (38 cm, 65 cm
//     collée, moins quand l'épaule l'écarte déjà de l'axe ; 28 cm sous le plafond, jamais dans un linteau) au lieu de
//     redescendre derrière sa nuque — c'était sa tête qui bouchait l'image, d'où la demi-transparence ; et elle le garde
//     DANS L'IMAGE (sa visée à 22° au plus du centre) ;
//   - LE CAP ASSISTÉ (ASSIST_*) : au clavier seul, au joystick tactile ou à la manette, quand on ne tourne pas la caméra
//     soi-même (depuis 0,8 s) et qu'elle est à l'étroit (moins de 1,8 m de recul libre) pendant qu'il marche, elle se
//     range derrière sa marche — dans l'axe de la volée, du couloir, du palier —, à 90°/s, 180°/s collée, en accélérant et
//     en freinant ; la direction tenue au clavier ou au pouce (sauf vers l'avant) garde son cap dans le monde tant qu'on
//     la tient — on ne repart pas dans le mur parce que la caméra a tourné — et le rend quand on la lâche, ou d'autant
//     qu'on la tourne vers la caméra ;
//   - LE SEUIL SUIVI (SEUIL_FONTE) : au passage d'une porte, elle garde son recul et passe la porte derrière lui, au lieu
//     de bondir de 2,6 à 1,1 m en 0,1 s ; ce surplus fond de 1,2 m/s (plus vite s'il court) jusqu'au RECUL_SEUIL ; la
//     pièce la retient en douceur (PIECE_*), seuls les murs l'arrêtent net ; et elle se compte de proche en proche : la
//     voisine d'une voisine ouverte l'est aussi (e1hall, e1couloir, e1pause) ;
//   - LES COUPES : l'épaule elle-même reste à 20 cm de tout (plus de chute dans sa nuque au ras d'un jambage) ; si la
//     caméra perd Haythem de vue derrière un angle, elle passe sur la ligne de sa place voulue à la même distance (15° au
//     plus), sinon elle se rapproche sur sa ligne — et le regard saute avec elle au lieu de balayer l'image.
// Rejoué (banc du lot X1 : 22 parcours, volées et passages étroits des 4 niveaux, aller et retour, × 5 façons de jouer) :
// au joystick en marchant, la caméra à moins de 1 m de lui passe de 31 à 12 % des images, Haythem translucide de 21 à 3 %
// (dans les volées : 45 à 18 %, 33 à 4,5 %) ; au clavier seul, de 38 à 19 % et de 26 à 6 % ; clavier et souris, de 8 à 5 %
// et de 4,7 à 1,7 % ; le tour du -1 en virages instantanés (la mesure de la vérification finale), de 32 à 18 % et de 13 à 4 %.
const PENTE = 0.6, PENTE_MIN = 0.3, PENTE_MAX = 1.9;
const LEVE = 0.38, LEVE_COLLE = 0.27;
const ASSIST_GENE = 1.8, ASSIST_PLEIN = 0.9, ASSIST_MAX = 1.6, ASSIST_K = 2.8, ASSIST_MANU = 0.8;
const SEUIL_FONTE = 1.2, SEUIL_FONTE_V = 0.3;
const PIECE_IN = 7, PIECE_OUT = 3;
const OEIL_PHOTO = 1.45;                  // la « vue photo » : l'œil à hauteur de téléphone tenu devant soi
// le champ vertical pour un écran de rapport `aspect` : 63°, sauf si l'horizontal dépasse alors 108°
const champBase = (aspect) => Math.min(CHAMP, 2 * Math.atan(Math.tan(CHAMP_H_MAX / 2 * DEG) / Math.max(0.2, aspect || 1)) / DEG);
// LA ZONE D'UN AUTRE NIVEAU (relecture du 11/10). Les zones du rez-de-chaussée et du 1er n'ont pas de hauteur maximale
// (js/ecole_lumieres.js zoneEn) : sur le 2e, partout où ses propres zones s'arrêtent un peu avant le mur, c'est celle du
// 1er qui répond (le fond de la salle 1, le bout ouest du couloir rouge) ; au 1er, celle du rez-de-chaussée (le bord
// ouest de la Robert Kahn : la David Clark) ; au -1, celle du rez-de-chaussée (la pause : la salle A) ; et en haut d'une
// volée, le palier de l'étage. Ce n'est pas une autre pièce : la caméra y passe comme hors de toute zone (sinon elle se
// collait à Haythem contre un mur qui n'existe pas : 1 107 reculs de 2,6 m sur 91 312 rejoués coupés de plus de 0,5 m pour
// rien, au 2e, au 1er et au -1). Une zone `Z` en (x, z) est d'un autre niveau quand elle y vaut aussi un étage plus bas
// (ou plus haut) alors que la zone de Haythem `Zh` n'y vaut nulle part — la règle de zoneEn, sans liste de zones.
const ETAGE = 3.0;
const bandeAdmet = (r, y) => !(r[4] > 0 && y < r[4]) && !(r[5] !== undefined && y > r[5]);
function autreNiveau(Z, Zh, x, z, sol) {
  for (const y of [sol - ETAGE, sol + ETAGE]) {
    if (Zh.rects.some((r) => bandeAdmet(r, y))) continue;
    if (Z.rects.some((r) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3] && bandeAdmet(r, y))) return true;
  }
  return false;
}

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
    this._camLibre = undefined; this._camPiece = undefined; this._cam = null;
    this._omCap = 0; this._assistOn = false; this._decalCmd = 0; this._phiCmd = null;
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
    return `souris = caméra · ${actionKey('camera')} = vue (3e / épaule / 1re personne / photo) · ${actionKey('walk')} = marcher · ${actionKey('sprint')} = sprint · ${actionKey('jump')} = sauter · ${actionKey('emote')} = emotes · ${actionKey('phone')} = téléphone · ${actionKey('pause')} = pause`;
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
    // déplacement relatif à la caméra GTA — et au CAP ASSISTÉ près (en tête du fichier) : la direction tenue garde son cap
    // dans le monde pendant que la caméra se range (_decalCmd) ; lâchée, elle le rend ; changée dans le sens où l'on
    // rattrape la caméra (du « gauche » au « haut » une fois la caméra rangée derrière lui), elle le rend d'autant
    const a = inp.blocked ? { x: 0, y: 0 } : inp.axis();
    _dir.set(0, 0, 0);
    // (vers l'AVANT — à moins de 35° —, rien n'est retenu : on va où la caméra regarde, et c'est elle qui, rangée dans
    // l'axe du couloir, y remet Haythem ; un reste s'efface à 2 rad/s)
    const phi = a.x || a.y ? Math.atan2(a.x, a.y) : null;
    if (phi === null) this._decalCmd = 0;
    else if (this._decalCmd && this._phiCmd !== null && this._phiCmd !== undefined) {
      // (un demi-tour de la commande — de « reculer » à « avancer » une fois la caméra passée derrière lui — se compte
      // toujours vers zéro : son signe, à ±180°, ne dit rien)
      let dphi = angle(phi - this._phiCmd);
      if (Math.abs(dphi) > 2.6) dphi = -Math.sign(this._decalCmd) * Math.abs(dphi);
      const nd = this._decalCmd + dphi;
      if (dphi * this._decalCmd < 0) this._decalCmd = nd * this._decalCmd <= 0 ? 0 : nd;
      if (Math.abs(phi) < 0.6) this._decalCmd -= Math.sign(this._decalCmd) * Math.min(Math.abs(this._decalCmd), 2 * dt);
    }
    this._phiCmd = phi;
    if (a.x || a.y) {
      const lacet = this.camYaw + (this._decalCmd || 0);
      _v.set(-Math.sin(lacet), 0, -Math.cos(lacet));
      _v2.set(Math.cos(lacet), 0, -Math.sin(lacet));
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
  // ou dans une voisine DÉCLARÉE (l'une dans les `voisines` de l'autre) où l'on entre SANS PORTE (_seuilOuvert). Par une
  // porte, la caméra s'arrête 15 cm avant la zone d'à côté (photo 24 : elle ne passe plus dans le vestibule, derrière le
  // chambranle). Hors de toute zone (l'épaisseur d'un mur, un recoin sans zone), on passe sans compter — et de même dans
  // la zone d'un AUTRE NIVEAU (autreNiveau, en tête du fichier). Aucune liste de pièces : tout vient des zones et du monde
  // solide de la carte.
  _partPiece(px, py, pz, dx, dy, dz, sol, Zh, tMax = 1) {
    const Lu = this.carte.lumieres, long = Math.hypot(dx, dz);
    if (!Lu || !Zh || long < 0.05 || tMax <= 0) return tMax;
    const n = Math.ceil(long * tMax / 0.1), pas = tMax / n;
    const admises = this._admises || (this._admises = new Set());
    admises.clear(); admises.add(Zh);
    let tOk = 0;
    for (let i = 1; i <= n; i++) {
      const t = i * pas, x = px + dx * t, z = pz + dz * t, Z = Lu.zoneEn(x, z, sol);
      if (!Z) continue;
      if (admises.has(Z)) { tOk = t; continue; }
      if (autreNiveau(Z, Zh, x, z, sol)) continue;
      // (de proche en proche, lot X1 : la voisine d'une pièce déjà admise — e1hall, e1couloir, puis e1pause, à l'angle du
      // mur du local ; la caméra s'arrêtait au seuil de la troisième)
      let voisine = false;
      for (const A of admises) if ((A.voisines || []).includes(Z.id) || (Z.voisines || []).includes(A.id)) { voisine = true; break; }
      // (le seuil d'une voisine n'est jugé qu'une fois par image, pour tous les essais d'épaule : ils passent par le même)
      let ouvert = false;
      if (voisine) {
        const S = this._seuils || (this._seuils = new Map());
        ouvert = S.get(Z);
        if (ouvert === undefined) { ouvert = this._seuilOuvert(px, py, pz, dx, dy, dz, long, tOk, t, sol, tMax); S.set(Z, ouvert); }
      }
      if (ouvert) { admises.add(Z); tOk = t; continue; }
      return Math.max(0, tOk - 0.15 / long);
    }
    return tMax;
  }
  // LE SEUIL entre deux zones voisines (entre t0 et t1 du segment) : un passage ouvert, ou une PORTE ? On prend le point
  // le plus étroit du passage (largeur libre en travers, à hauteur de caméra) : 2 m ou plus, c'est ouvert ; sinon, une
  // porte se reconnaît à son LINTEAU (la hauteur libre y tombe d'au moins 8 cm sous celle d'avant et d'après : la porte
  // du vestibule et la porte nord du hall, 2,08 sous 2,53 ; la paroi vitrée du passage, 2,28 sous 2,38) ou à ses
  // JAMBAGES (la largeur y pince de 25 cm sous celle des deux côtés). La bouche d'un couloir (le C05 vu du hall ouest,
  // photo 23 ; le couloir du -1 et son hall) n'a ni l'un ni l'autre : la caméra peut s'y tenir.
  _seuilOuvert(px, py, pz, dx, dy, dz, long, t0, t1, sol, tMax) {
    const C = this.collisions, nx = -dz / long, nz = dx / long, R = BAIE * 0.6, sMax = tMax * long;
    const point = (s) => { const t = Math.max(0, Math.min(sMax, s)) / long; return [px + dx * t, py + dy * t, pz + dz * t]; };
    const largeur = (s) => {
      const [x, y, z] = point(s);
      return (C.rayonLibre(x, y, z, x + nx * R, y, z + nz * R, 0.02) + C.rayonLibre(x, y, z, x - nx * R, y, z - nz * R, 0.02)) * R;
    };
    const hauteur = (s) => { const [x, , z] = point(s); return 1.2 + 2 * C.rayonLibre(x, sol + 1.2, z, x, sol + 3.2, z, 0.02); };
    let sMin = 0, wMin = Infinity;
    for (let s = t0 * long - 0.3; s <= t1 * long + 0.3; s += 0.1) { const w = largeur(s); if (w < wMin) { wMin = w; sMin = s; } }
    if (wMin >= BAIE) return true;
    const sA = Math.max(0, sMin - 0.45), sP = Math.min(sMax, sMin + 0.45);
    // (des jambages : la largeur s'élargit des DEUX côtés dès 25 cm, l'épaisseur d'un mur — relecture du 11/10 : jugée à
    // 45 cm seulement, la bouche d'une volée vue du palier — l'escalier est, au 1er et au 2e — ou celle du C01 passaient
    // pour des portes dans 8 à 23 % des cas, et la caméra se collait à Haythem au bord du palier)
    if (wMin < Math.min(largeur(sMin - 0.25), largeur(sA), largeur(sMin + 0.25), largeur(sP)) - 0.25) return false;
    const h0 = Math.min(hauteur(sMin - 0.1), hauteur(sMin), hauteur(sMin + 0.1));
    return !(h0 < Math.min(hauteur(sA), hauteur(sP)) - 0.08);                                    // un linteau
  }

  // LE SOL SOUS LA CAMÉRA (la règle de la PENTE, en tête du fichier) : l'écart, compté depuis les pieds de Haythem `sol`,
  // du plus haut des sols déclarés (dalles, rampes des volées : js/collisions.js) qui couvrent (x, z) entre 2,5 m plus
  // bas et 2 m plus haut, borné à 1,9 m (une demi-volée) ; 0 là où aucun sol n'est déclaré (le rez-de-chaussée). Un sol
  // qu'un plafond SÉPARE de Haythem (autre que le dessous de sa propre dalle, à moins de 40 cm) n'est pas le sien : vu de
  // la volée de tôle, le sol du rez-de-chaussée, au-dessus du plafond du hall du -1
  _solSous(x, z, sol) {
    const C = this.collisions;
    let h = null;
    for (const r of C.sols) {
      if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
      const v = C._hSol(r, x, z);
      if (v > sol + 2.0 || v < sol - 2.5 || (h !== null && v <= h)) continue;
      const bas = Math.min(v, sol) + 0.3, haut = Math.max(v, sol) - 0.4;
      let separe = false;
      for (const p of C.plafonds) if (p.y > bas && p.y < haut && x >= p.x0 && x <= p.x1 && z >= p.z0 && z <= p.z1) { separe = true; break; }
      if (!separe) h = v;
    }
    return h === null ? 0 : clamp(h - sol, -PENTE_MAX, PENTE_MAX);
  }
  // le plafond au-dessus de (x, z) pour la caméra : au-dessus des pieds de Haythem, et du sol qu'elle survole — sur la
  // volée 2 de l'escalier principal, à 25 cm sous le palier du 1er, le dessous de sa dalle (3,25, le plafond du hall
  // ouest) passait pour celui du palier, et la caméra descendait sous la tête de Haythem
  _plafondCam(x, z, sol, yMin) {
    return this.collisions.plafondEn(x, z, Math.max(yMin, sol + this._solSous(x, z, sol) + 0.3));
  }

  // UN ESSAI de la caméra, cap (bx, bz) vers l'arrière, depuis l'épaule `e` (en mètres, + à droite), avec le contexte `K`
  // de l'image (_cibleCam) : la cible à sa hauteur (la PENTE, sous le plafond), puis la part libre — `fM` pour les murs et
  // les plafonds (la règle dure), `f` avec la pièce de Haythem en plus (sauf sur les `K.seuil` premiers mètres : le SEUIL
  // SUIVI)
  _essaiCam(K, bx, bz, e) {
    const C = this.collisions, { ux, uz, sol, tete, d, cp, ty0, yMin, plafU, Zh, seuil } = K;
    // (l'épaule elle-même à plus de 20 cm de tout : à moins, le monde solide ignore la forme qu'elle touche — c'est la
    // règle de rayonLibre pour la tête — et le segment passait au ras d'un jambage que la caméra posée, elle, heurtait :
    // elle tombait alors dans la nuque, de 2,7 m à rien, au seuil de la grande salle du -1 et de l'escalier principal)
    if (e) { const lp = C.rayonLibre(ux, tete, uz, ux + bz * e, tete, uz - bx * e, RAYON_CAM); if (lp < 1) e *= Math.max(0, lp - 0.05); }
    const px = ux + bz * e, pz = uz - bx * e, tx = px + bx * d * cp, tz = pz + bz * d * cp;
    // LA PENTE : des marches qui MONTENT derrière lui (il descend) relèvent la caméra d'autant (60 % ; moins de 30 cm,
    // une marche, une estrade : rien)
    const dB = this._solSous(tx, tz, sol), dS = Math.abs(dB) < PENTE_MIN ? 0 : dB;
    let ty = ty0 + (dS > 0 ? PENTE * dS : 0);
    const plaf = Math.min(plafU, this._plafondCam(tx, tz, sol, yMin));
    if (Number.isFinite(plaf)) ty = Math.min(ty, Math.max(tete + 0.05, plaf - 0.28));
    // (et SOUS LES PLAFONDS DU CHEMIN : le segment passe à 28 cm sous chacun, au quart, à la moitié, aux trois quarts — sur
    // la volée 1 de l'escalier est, la tête de Haythem est déjà au niveau du plafond du vestibule, à 2,55 : la caméra,
    // à sa hauteur, butait contre son bord à 1 m ; elle redescend pour passer dessous, comme qui monterait derrière lui ;
    // jamais à moins de 70 cm du sol qu'elle survole : le sol n'arrête pas la caméra, ce n'est pas une forme)
    const plancher = sol + dB + 0.7;
    for (const s of [0.25, 0.5, 0.75]) {
      const pS = this._plafondCam(px + (tx - px) * s, pz + (tz - pz) * s, sol, yMin);
      if (Number.isFinite(pS)) ty = Math.min(ty, Math.max(plancher, tete + (pS - 0.28 - tete) / s));
    }
    let libre = C.rayonLibre(px, tete, pz, tx, ty, tz, RAYON_CAM);
    // ... des marches qui DESCENDENT derrière lui (il monte) : la caméra suit la volée vers le bas si elle y gagne du recul
    // (sous le rampant de la volée de tôle, à hauteur de tête, elle butait à 0,6-1 m ; dans la cage ouverte de l'escalier
    // principal, elle reste à sa hauteur)
    if (dS < 0 && libre < 0.98) {
      let ty2 = ty0 + PENTE * dS;
      if (Number.isFinite(plaf)) ty2 = Math.min(ty2, plaf - 0.28);
      const l2 = C.rayonLibre(px, tete, pz, tx, ty2, tz, RAYON_CAM);
      if (l2 > libre + 0.08) { ty = ty2; libre = l2; }
    }
    const L = Math.max(0.3, Math.hypot(tx - px, ty - tete, tz - pz));
    const fM = libre < 1 ? Math.max(0, libre - 0.08 / L) : 1;          // (8 cm de marge devant un mur, pas en plein air)
    const f = Math.max(this._partPiece(px, tete, pz, tx - px, ty - tete, tz - pz, sol, Zh, fM), Math.min(fM, seuil / L));
    return { px, pz, tx, ty, tz, f, fM, dl: f * d * cp };
  }
  // le recul libre derrière Haythem pour le cap `yaw` (dans l'axe, sans épaule), avec le contexte de l'image
  _reculEn(yaw) {
    if (this._seuils) this._seuils.clear();          // (un autre cap passe par d'autres seuils)
    return this._essaiCam(this._K, Math.sin(yaw), Math.cos(yaw), 0).dl;
  }

  // LA PLACE VOULUE de la caméra (vues 2 et 3) -> this.camTarget. Son état (this._cam) garde l'épaule et son côté, le
  // recul, la pièce de Haythem, le pivot (l'épaule d'où part le segment), le recul libre obtenu `dl` (qui règle la
  // hauteur et le champ) et le surplus du seuil suivi `reste`.
  _cibleCam(p, u, dt, poser = false) {
    const C = this.collisions, S = this._cam || (this._cam = { cote: 1, tv: 0, murs: 1, epaule: null, recul: null, zone: null, dl: RECUL, px: 0, py: 0, pz: 0, reste: 0 });
    const v3 = this.vue === 3, sol = p.solAff, tete = sol + p.h * 0.93;
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    if (this._seuils) this._seuils.clear();
    const bx = Math.sin(this.camYaw), bz = Math.cos(this.camYaw), rx = bz, rz = -bx;   // vers l'arrière ; la droite de l'écran
    const lis = (v) => (poser ? 1 : dt > 0 ? damp(v, dt) : 0);
    // la PIÈCE de Haythem (sur le seuil d'une porte, entre deux zones : celle d'où il vient) ; quand il en change, LE SEUIL
    // SUIVI : la caméra garde le recul qu'elle avait au passage, et ce surplus fond de 0,8 m/s (en tête du fichier)
    const Lu = this.carte.lumieres;
    let Zh = Lu ? Lu.zoneEn(u.x, u.z, sol) : null;
    if (Zh) {
      if (S.zone && Zh !== S.zone && !poser) S.reste = Math.max(S.reste || 0, S.dl || 0);
      S.zone = Zh;
    } else Zh = S.zone;
    S.reste = poser ? 0 : Math.max(0, (S.reste || 0) - (dt > 0 ? dt : 0) * (SEUIL_FONTE + SEUIL_FONTE_V * Math.hypot(p.vel.x, p.vel.z)));
    // le RECUL : 2,6 m à l'intérieur, 4,3 m dans la rue (ou hors de toute zone et de tout plafond) ; 1,95 m en vue épaule
    const dehors = Zh ? Zh.id === 'rue' : !Number.isFinite(C.plafondEn(u.x, u.z, sol + 0.5));
    const dV = v3 ? (dehors ? RECUL_RUE : RECUL) : 1.95;
    S.recul = S.recul === null ? dV : S.recul + (dV - S.recul) * lis(2.5);
    const d = S.recul, ty0 = sol + (v3 ? HAUT_CAM : 1.62) + d * sp;
    // (les plafonds AU-DESSUS du joueur : sur le palier de l'étage, celui du hall en dessous ne compte pas)
    const yMin = sol + 0.5, plafU = C.plafondEn(u.x, u.z, yMin);
    const K = this._K = { ux: u.x, uz: u.z, sol, tete, d, cp, ty0, yMin, plafU, Zh, seuil: Math.max(RECUL_SEUIL, S.reste) };
    const essai = (e) => this._essaiCam(K, bx, bz, e);
    let E;
    if (!v3) E = essai(0);
    else {
      // L'ÉPAULE : la place libre de chaque côté de la tête (moins la sphère de la caméra et 8 cm de marge)
      const R = 1.0, cD = C.rayonLibre(u.x, tete, u.z, u.x + rx * R, tete, u.z + rz * R, 0.02) * R;
      const cG = C.rayonLibre(u.x, tete, u.z, u.x - rx * R, tete, u.z - rz * R, 0.02) * R;
      const eD = clamp(cD - RAYON_CAM - 0.08, 0, EPAULE), eG = clamp(cG - RAYON_CAM - 0.08, 0, EPAULE);
      // LE CÔTÉ (1 = épaule droite, -1 = gauche, 0 = dans l'axe) : une NOTE pour chacun — le recul libre qu'il donne,
      // compté jusqu'à 1,5 m (au-delà, il ne change plus rien) ; + 0,2 pour le côté des MURS (à droite, à gauche si un mur
      // est à moins de 0,6 m à droite, retour à droite au-delà de 0,75 m) ; + 0,15 pour le côté actuel. Le mieux noté ne
      // l'emporte qu'après 0,6 s sans interruption (0,15 s quand le recul actuel est tombé sous 1,5 m). Dans l'axe : quand
      // aucune épaule ne passe (le seuil d'une porte franchie de biais, le palier tournant d'un escalier en U), la ligne
      // droite derrière lui donne souvent le plus long recul. (Relecture du 11/10 : les deux règles d'avant se
      // contredisaient — dans le cou, le mur de la pile à 0,58 m envoyait à gauche, le recul plus long ramenait à droite —
      // et le côté changeait à CHAQUE image : 126 fois sur la marche du hall au 1er par l'escalier principal, aller et
      // retour, 55 sur celle de l'escalier est jusqu'au 2e.)
      // (les essais à gauche et dans l'axe ne se font que s'ils peuvent l'emporter : à droite, côté des murs, avec 1,5 m
      // de recul ou plus — le cas courant —, rien ne bat la droite)
      const ED = essai(eD), cote0 = S.cote;
      let EG = null, EC = null;
      const eg = () => EG || (EG = essai(-eG)), ec = () => EC || (EC = essai(0));
      S.murs = cD < 0.6 && cG > cD + 0.05 ? -1 : cD >= 0.75 || cG <= cD + 0.05 ? 1 : S.murs || 1;
      const note = (c, e) => Math.min(e.dl, 1.5) + (c === S.murs ? 0.2 : 0) + (c === cote0 && !poser ? 0.15 : 0);
      let veut = 1;
      if (!(S.murs > 0 && ED.dl >= 1.5 && (cote0 > 0 || poser))) {
        const nD = note(1, ED), nC = note(0, ec()), nG = note(-1, eg());
        veut = nD >= nC && nD >= nG ? 1 : nG >= nC ? -1 : 0;
      }
      const dlC = (cote0 > 0 ? ED : cote0 < 0 ? eg() : ec()).dl;
      S.tv = veut !== cote0 && dt > 0 ? (S.tv || 0) + dt : 0;
      S.tc = (S.tc || 0) + (dt > 0 ? dt : 0);
      if (poser) S.cote = veut;
      else if (veut !== cote0 && S.tc >= 0.3 && S.tv >= (dlC < 0.5 ? 0 : dlC < 1.5 ? 0.15 : 0.6)) {
        // (collée à moins de 0,5 m, elle part tout de suite — mais pas moins de 0,3 s après le dernier changement ; et le
        // recul du nouveau côté lui est rendu sans attendre la remontée lente de la part libre : la glissade de l'épaule
        // et celle de la caméra, 12 /s, adoucissent le passage)
        S.cote = veut; S.tv = 0; S.tc = 0;
        const N = veut > 0 ? ED : veut < 0 ? eg() : ec();
        this._camLibre = Math.max(this._camLibre ?? 1, N.fM);
        this._camPiece = Math.max(this._camPiece ?? 1, N.f);
      }
      const cote = S.cote;
      // l'épaule glisse vers son côté (d'une épaule à l'autre en ≈ 0,4 s), sans jamais entrer dans un mur
      const eV = cote > 0 ? eD : cote < 0 ? -eG : 0;
      S.epaule = clamp(S.epaule === null ? eV : S.epaule + (eV - S.epaule) * lis(5), -eG, eD);
      E = Math.abs(S.epaule - eD) < 1e-4 ? ED : Math.abs(S.epaule + eG) < 1e-4 ? eg() : Math.abs(S.epaule) < 1e-4 ? ec() : essai(S.epaule);
      // (lot X1 : en chemin vers son côté, l'épaule peut frôler un jambage — dans une porte de 0,86 m, le pivot à 19 cm du
      // milieu menait le segment droit dans le fixe dépoli de la grande salle, et la caméra tombait dans la nuque pour
      // 0,4 s ; on prend alors tout de suite la place du côté choisi, libre : 20 cm de côté, que la glissade de la caméra
      // adoucit)
      const Ev = cote > 0 ? ED : cote < 0 ? eg() : ec();
      if (E !== Ev && E.fM < Ev.fM - 0.15) { E = Ev; S.epaule = eV; }
    }
    // le lissage de la part libre : les MURS, vite quand ils arrivent (25 /s), lentement quand ils s'en vont (4 /s) ; la
    // PIÈCE, en douceur dans les deux sens (7 /s et 3 /s : au seuil d'une porte, plus de bond de 2,6 à 1,1 m en 0,1 s) ;
    // et jamais au-delà de la part libre des murs de l'image
    const c = this._camLibre ?? 1, cP = this._camPiece ?? 1;
    this._camLibre = poser ? E.fM : c + (E.fM - c) * (dt > 0 ? damp(E.fM < c ? 25 : 4, dt) : 0);
    this._camPiece = poser ? E.f : cP + (E.f - cP) * (dt > 0 ? damp(E.f < cP ? PIECE_IN : PIECE_OUT, dt) : 0);
    let k = Math.min(this._camLibre, this._camPiece, E.fM);
    S.px = E.px; S.py = tete; S.pz = E.pz;
    // la place pour la part `kk` du segment (et le recul libre `dl` qui en découle)
    const place = (kk) => {
      S.dl = kk * d * cp;
      const cx = E.px + (E.tx - E.px) * kk, cz = E.pz + (E.tz - E.pz) * kk;
      // recul libre sous 1,5 m : la caméra ne surplombe plus Haythem de toute sa hauteur voulue — elle passe AU-DESSUS DE
      // L'ÉPAULE (LEVE, en tête du fichier), plus haut quand l'épaule ne l'écarte pas de sa tête (un couloir de 0,9 m, une
      // volée), jamais à moins de 28 cm du plafond ni dans un linteau (le segment depuis l'épaule doit rester libre)
      const s9 = v3 ? clamp((S.dl - 1.5) / 0.3, 0, 1) : 1;
      let cy = tete + (E.ty - tete) * kk * s9;
      if (v3 && s9 < 1) {
        // (collée — moins de 1 m —, plus haut encore, jusqu'à 65 cm, et l'épaule ne compte plus : à 40 cm derrière lui, une
        // épaule de 40 cm la mettait contre son oreille, sa tête translucide en travers de l'image — le vestibule de la
        // photo 25, le palier de v_010, le palier de l'escalier principal ; d'en haut, on le voit, et la volée devant lui)
        const lat = Math.min(1, Math.abs(S.epaule || 0) / EPAULE) * clamp((S.dl - 0.5) / 0.5, 0, 1);
        let leve = (1 - s9) * (LEVE + LEVE_COLLE * clamp((1 - S.dl) / 0.5, 0, 1)) * (1 - 0.6 * lat);
        const plaf = Math.min(plafU, this._plafondCam(cx, cz, sol, yMin));
        if (Number.isFinite(plaf)) leve = Math.min(leve, Math.max(0, plaf - 0.28 - cy));
        let ok = 0;
        for (const fr of [1, 0.5, 0.25]) {
          if (leve * fr < 0.02) break;
          if (C.rayonLibre(E.px, tete, E.pz, cx, cy + leve * fr, cz, RAYON_CAM) >= 0.999) { ok = leve * fr; break; }
        }
        cy += ok;
      }
      this.camTarget.set(cx, cy, cz);
    };
    place(k);
    // (relecture du lot X1 : LA VUE SUR LUI — de sa place, la caméra voit sa TÊTE, pas seulement l'épaule d'où part son
    // segment. Le seuil suivi la laissait 2,3 à 2,5 m derrière lui dans la pièce d'où il sort : quand il tournait juste
    // après la porte, le jambage passait entre elle et lui — la tête cachée 0,1 à 0,2 s à chaque porte prise de biais,
    // l'escalier est, l'escalier principal, la porte grise de la volée de tôle ; elle se rapproche alors sur sa ligne
    // jusqu'à le voir, et s'y tient comme devant un mur)
    // (sa tête, celle de l'avatar : penché en montant ou en dévalant une volée, elle passe 0,2 à 0,5 m devant ses pieds)
    const os = p.avatar && p.avatar.bone ? p.avatar.bone('Head') : null;
    if (os) os.getWorldPosition(_vTete); else _vTete.set(u.x, tete - 0.12, u.z);
    // (sauf si l'épaule même ne la voit pas : rien à gagner en s'approchant)
    if (!this._voitTete(this.camTarget) && this._voitTete(_v2.set(E.px, tete, E.pz))) {
      let lo = 0, hi = 1;
      for (let i = 0; i < 5; i++) { const m = (lo + hi) / 2; place(k * m); if (this._voitTete(this.camTarget)) lo = m; else hi = m; }
      k *= lo; place(k);
      this._camLibre = Math.min(this._camLibre, k);
    }
  }
  // la tête de Haythem (_vTete, posée par _cibleCam) vue du point `P`, sans rien entre les deux
  _voitTete(P) {
    return this.collisions.rayonLibre(_vTete.x, _vTete.y, _vTete.z, P.x, P.y, P.z, 0.05) >= 0.999;
  }

  // LE CAP ASSISTÉ (en tête du fichier), après _cibleCam, pour l'image suivante : quand la caméra est à l'étroit (recul
  // libre sous 1,8 m) pendant que Haythem marche et qu'on ne la tourne pas soi-même (souris, doigt, stick droit : depuis
  // 0,8 s), elle vise le cap qui la met derrière sa marche — ou à 23° ou 46° de là, s'il lui rend nettement plus de recul
  // (le palier d'une volée, l'angle d'un couloir) — et s'y range, à 90°/s au plus, jusqu'à 180°/s quand elle est collée
  // (Haythem qui dévale la volée de tôle, 0,85 m de large, la caméra contre le mur), la vitesse lissée (pas d'à-coup).
  // Commencée, la manœuvre va au bout (le recul qui revient en chemin ne l'arrête pas à mi-course). La direction tenue au
  // clavier ou au pouce garde son cap dans le monde (this._decalCmd, lu par update).
  _assistCap(dt) {
    const u = this.user, S = this._cam;
    let voulu = 0;
    const libre = S && this._K && dt > 0 && !this.paused && this.mode === 'lobby' && (this.vue === 2 || this.vue === 3)
      && !u.assis && !u.emote && !this.input.blocked && !this.freeCam;
    const v = Math.hypot(u.vel.x, u.vel.z);
    const manu = (performance.now() - (this.camManuT ?? -1e9)) / 1000 < ASSIST_MANU;
    if (!libre || manu || v < 0.6) {
      this._assistOn = false;
      if (manu) this._omCap = 0;                         // (on reprend la caméra à la main : elle lâche tout de suite)
    } else {
      if (!this._assistOn && S.dl < ASSIST_GENE && v > 0.8) this._assistOn = true;
      if (this._assistOn) {
        const yH = Math.atan2(-u.vel.x, -u.vel.z);          // le cap qui met la caméra derrière sa marche
        const ecart = (y) => Math.abs(angle(y - this.camYaw));
        let best = yH, nb = -Infinity;
        for (const o of [0, 0.4, -0.4, 0.8, -0.8]) {
          const y = yH + o, n = Math.min(this._reculEn(y), 2.0) - 0.5 * Math.abs(o) - 0.25 * ecart(y);
          if (n > nb) { nb = n; best = y; }
        }
        const D = angle(best - this.camYaw);
        // (arrivée : moins de 4° d'écart, ou plus rien à gagner — le recul actuel vaut celui du cap visé)
        if (Math.abs(D) < 0.07 || Math.min(S.dl, 2.0) - 0.5 * Math.abs(angle(this.camYaw - yH)) >= nb - 0.05) this._assistOn = false;
        else { const m = ASSIST_MAX * (1 + clamp((ASSIST_GENE - S.dl) / (ASSIST_GENE - ASSIST_PLEIN), 0, 1)); voulu = clamp(D * ASSIST_K, -m, m); }
      }
    }
    // la vitesse de rotation lissée (≈ 0,12 s pour lancer, autant pour freiner)
    const om = (this._omCap || 0) + (voulu - (this._omCap || 0)) * (dt > 0 ? damp(8, dt) : 0);
    this._omCap = Math.abs(om) < 1e-3 && !voulu ? 0 : om;
    if (this._omCap && dt > 0) {
      this.camYaw += this._omCap * dt;
      // (la direction tenue, si elle n'est pas vers l'avant, garde son cap dans le monde : voir update)
      if (this._phiCmd !== null && this._phiCmd !== undefined && Math.abs(this._phiCmd) >= 0.6) this._decalCmd = clamp((this._decalCmd || 0) - this._omCap * dt, -Math.PI, Math.PI);
    }
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

  // LE POINT REGARDÉ `L` ramené à 22° (+ `marge`) au plus de la visée (vx, vy, vz) de Haythem, vu de la caméra (moins au
  // téléphone tenu droit : 85 % du demi-champ le plus étroit, 95 % avec la marge — ou la part `fr` donnée), à la même
  // distance. (Relecture : un écran de taille nulle — volet caché, fenêtre réduite à rien — donne un rapport `aspect` NaN ;
  // le point regardé devenait NaN, et le regard lissé le restait pour toujours : l'image ne revenait plus ; on compte
  // alors un écran carré, et un regard NaN est reposé sur la visée.)
  _dansLImage(L, vx, vy, vz, marge = 0, fr = Math.min(0.95, 0.85 + marge / 60)) {
    const cP = this.camPos;
    let hx = vx - cP.x, hy = vy - cP.y, hz = vz - cP.z;
    const lx = L.x - cP.x, ly = L.y - cP.y, lz = L.z - cP.z, nh = Math.hypot(hx, hy, hz), nl = Math.hypot(lx, ly, lz);
    if (nh < 0.05 || nl < 0.05) return;
    hx /= nh; hy /= nh; hz /= nh;
    const asp = this.camera.aspect > 0 ? this.camera.aspect : 1;
    const demi = Math.min(this.camera.fov / 2 * DEG, Math.atan(Math.tan(this.camera.fov / 2 * DEG) * asp));
    const co = (hx * lx + hy * ly + hz * lz) / nl, M = Math.min((22 + marge) * DEG, fr * demi);
    if (co >= Math.cos(M)) return;
    let qx = lx / nl - hx * co, qy = ly / nl - hy * co, qz = lz / nl - hz * co;
    const nq = Math.hypot(qx, qy, qz);
    if (nq < 1e-4) return;
    qx /= nq; qy /= nq; qz /= nq;
    const c = Math.cos(M), s = Math.sin(M);
    L.set(cP.x + (hx * c + qx * s) * nl, cP.y + (hy * c + qy * s) * nl, cP.z + (hz * c + qz * s) * nl);
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
    let coupe = false;
    if (f2 < 1) {
      const k = Math.max(0, f2 - 0.02), cP = this.camPos, T = this.camTarget;
      const rC = Math.hypot(cP.x - S.px, cP.y - S.py, cP.z - S.pz), rT = Math.hypot(T.x - S.px, T.y - S.py, T.z - S.pz);
      // LE COIN (en tête du fichier) : ramenée sur sa ligne, elle tomberait dans sa nuque (Haythem passé derrière un angle
      // pendant qu'elle glissait) — elle passe plutôt sur la ligne de sa place voulue, libre, à la même distance
      const rV = Math.min(rC, rT), s = rT > 0.05 ? rV / rT : 0;
      const ax = S.px + (T.x - S.px) * s, ay = S.py + (T.y - S.py) * s, az = S.pz + (T.z - S.pz) * s;
      // (seulement pour un petit écart d'angle, 15° au plus : au-delà, l'image pivoterait d'un coup — mieux vaut alors
      // qu'elle se rapproche sur sa ligne, le décor reste orienté)
      const cosA = rC > 0.05 && rT > 0.05 ? ((cP.x - S.px) * (T.x - S.px) + (cP.y - S.py) * (T.y - S.py) + (cP.z - S.pz) * (T.z - S.pz)) / (rC * rT) : -1;
      if (k * rC < 0.7 * rV && s > 0 && cosA > 0.966 && C.rayonLibre(S.px, S.py, S.pz, ax, ay, az, RAYON_CAM * 0.9) >= 0.999) { cP.set(ax, ay, az); coupe = true; }
      else cP.set(S.px + (cP.x - S.px) * k, S.py + (cP.y - S.py) * k, S.pz + (cP.z - S.pz) * k);
      // (un vrai saut — plus de 50 cm : le regard saute avec elle, d'un coup, plutôt que de balayer l'image sur 4 ou 5
      // images à 800°/s pour rattraper sa nouvelle place)
      if (rC - Math.hypot(cP.x - S.px, cP.y - S.py, cP.z - S.pz) > 0.5) coupe = true;
    }
    // (relecture du lot X1 : et elle VOIT SA TÊTE — sa place voulue la voit déjà ; pendant qu'elle y glisse, elle ne reste
    // pas derrière le jambage d'où il vient de tourner : elle se rapproche sur sa ligne jusqu'à le voir)
    if (v3 && !this._voitTete(this.camPos) && this._voitTete(_v2.set(S.px, S.py, S.pz))) {
      const cP = this.camPos, rC = Math.hypot(cP.x - S.px, cP.y - S.py, cP.z - S.pz);
      const ax = cP.x, ay = cP.y, az = cP.z;
      let lo = 0, hi = 1;
      for (let i = 0; i < 5; i++) {
        const m = (lo + hi) / 2;
        cP.set(S.px + (ax - S.px) * m, S.py + (ay - S.py) * m, S.pz + (az - S.pz) * m);
        if (this._voitTete(cP)) lo = m; else hi = m;
      }
      cP.set(S.px + (ax - S.px) * lo, S.py + (ay - S.py) * lo, S.pz + (az - S.pz) * lo);
      if (rC * (1 - lo) > 0.5) coupe = true;
    }
    // LE POINT VISÉ : Haythem, 0,24 m à droite (du côté de l'épaule), à 1,45 m ; vue épaule : dans l'axe, à 1,5 m. De près,
    // le regard porte devant lui (sinon, à 40 cm, il plongerait de 20° vers le sol).
    const ve = v3 ? (S.epaule || 0) * (VISEE_EPAULE / EPAULE) : 0;
    _v.set(u.x + bz * ve, (v3 ? VISEE_H : 1.5) + p.jumpY * 0.5 + p.solAff, u.z - bx * ve);
    const dh = Math.hypot(this.camPos.x - _v.x, this.camPos.z - _v.z);
    // (lot X1 : mais Haythem reste DANS L'IMAGE — sa visée à 22° au plus du centre, l'image en couvre 31° de part et
    // d'autre ; et le regard lissé aussi (à 28°), pas seulement le regard voulu : d'au-dessus de son épaule, le regard porté droit
    // devant passait au-dessus de lui — sur le palier de la volée de tôle, on ne voyait qu'un mur blanc —, et en dévalant
    // l'escalier est, le regard en retard le laissait au bord de l'image)
    // (la caméra AU-DESSUS de sa tête, presque à l'aplomb : c'est sa tête qu'on garde, au bas de l'image, et le regard porte
    // devant lui — la volée vue du vestibule de la photo 25 ou du palier de v_010 —, au lieu de plonger sur ses épaules)
    const proche = v3 && dh < 1.5, vx = _v.x, vz = _v.z, dessus = this.camPos.y > tete + 0.1;
    const vy = dessus ? tete : _v.y, plus = dessus && dh < 0.8 ? 5 : 0;
    if (proche) { const a = 1.5 - dh; _v.x -= bx * cp * a; _v.y -= sp * a; _v.z -= bz * cp * a; this._dansLImage(_v, vx, vy, vz, plus); }
    if (poser || coupe || !Number.isFinite(this.lookCur.x + this.lookCur.y + this.lookCur.z)) this.lookCur.copy(_v);
    else this.lookCur.lerp(_v, damp(v3 ? 14 : 18, dt));
    if (proche) this._dansLImage(this.lookCur, vx, vy, vz, plus + 6);
    // (relecture du lot X1 : et SA TÊTE MÊME — l'os de l'avatar, pas le point nominal : en courant dans une volée, il se
    // penche et sa tête passe 0,2 à 0,5 m devant ses pieds ; vue d'au-dessus, à 1 m, elle sortait par le bas de l'image —
    // escalier est en dévalant au joystick, Haythem hors de l'image une image sur trois. Elle reste à 78 % du demi-champ,
    // de près comme de loin : le regard lissé en retard ne la laisse plus au bord.)
    const os = v3 && p.avatar && p.avatar.bone ? p.avatar.bone('Head') : null;
    if (os) {
      os.getWorldPosition(_vTete);
      if (_vTete.distanceTo(this.camPos) > 0.35) this._dansLImage(this.lookCur, _vTete.x, _vTete.y, _vTete.z, 6, 0.78);
    }
    this.camera.position.copy(this.camPos); this.camera.lookAt(this.lookCur); this._applyShake(dt);
    this._champ(p, dt, poser);
    // TOUT PRÈS DE LUI : en demi-transparence sous 0,6 m de sa tête (fondu depuis 0,8 m) ; masqué seulement quand la
    // caméra est dans sa tête (moins de 20 cm), plutôt que d'en montrer l'intérieur. (Lot X1 : la hauteur AU-DESSUS de sa
    // tête compte une fois et demie — vue d'au-dessus de l'épaule, sa tête est sous l'image, elle ne la bouche plus)
    const dyT = this.camPos.y - tete;
    const dT = Math.hypot(this.camPos.x - u.x, dyT, this.camPos.z - u.z);
    const dV = Math.hypot(this.camPos.x - u.x, dyT > 0 ? dyT * 1.5 : dyT, this.camPos.z - u.z);
    const masque = dT < 0.2;
    if (p.mesh) p.mesh.visible = !masque;
    p.vuePremiere = masque;
    this._fantome(p, masque ? 1 : 0.35 + 0.65 * clamp((dV - 0.6) / 0.2, 0, 1));
    // et pour l'image suivante, le CAP ASSISTÉ
    this._assistCap(dt);
  }
}
