import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';
import { poserMasque, reperes, equiperShader, couperTenue, poserJambes } from './fit.js';
import { EclairagePerso } from './eclairage_perso.js';
import { BOUNDS, G, RAYON_JOUEUR } from './config.js';
import { lerp, damp, clamp } from './util.js';
import { AvatarRig } from './avatar.js';
import { Couches } from './couches.js';
import { loadManifest, loadMixamoClip, AnimPlayer } from './anim.js';
import { TELEPHONE } from './appareil.js';

// =====================================================================
//  LE JOUEUR (IRIS) : Haythem, à pied
// =====================================================================
// Repris du joueur de LA CAGE (js/player.js), SANS le ballon : plus de dribble, de tir, de passe, de contre, de geste de
// dribble ni de mise au sol ; plus de vélo, de trottinette, de skate ni de rollers. Ce qui reste est tout ce qui fait
// qu'il a un CORPS :
//   - l'avatar Avaturn et ses matériaux (tenues du shader, mains, éclairage du personnage), version allégée au téléphone ;
//   - la LOCOMOTION calée sur le sol (échelles de clips marche / trot / course / sprint, à reculons, pas chassés, phase de
//     foulée qui avance avec la distance parcourue : les pieds ne patinent pas), l'inertie (0,13 s pour partir, 0,085 s
//     pour s'arrêter), la rotation avec élan, l'endurance du sprint ;
//   - le SAUT (clip calé sur le saut physique, amorti à la réception) ;
//   - les EMOTES (clips et chorégraphies maison) ;
//   - s'ASSEOIR (une chaise, un banc : la pose est procédurale) ;
//   - le TÉLÉPHONE sorti et tapé ;
//   - les couches de vie (js/couches.js) : le corps qui penche, le regard, la respiration, les petits pas, les pas qui
//     s'entendent ;
//   - l'interpolation d'affichage entre deux pas de simulation (memoriser / presenter).
// LES MURS : le déplacement passe par le monde solide de la carte (Player.collisions, js/collisions.js), qui repousse et
// fait glisser le joueur, sans jamais le laisser traverser un mur.

const ANIM_MANIFEST = 'assets/anims/manifest.json';
const _v3 = new THREE.Vector3();
// chaîne de repli si un clip manque
const FALLBACK = { run: ['idle'], sprint: ['run', 'idle'], idle: [], walk: [], walk_back: [], walk_side: [], walk_side_m: ['walk_side'],
  saut: ['block'], block: ['idle'], victory: ['idle'] };

// ECHELLES DE LOCOMOTION. Chaque echelle est une liste de clips du plus lent au plus rapide ; le jeu choisit celui qui
// convient a sa vitesse (_choisirLoco). Les clips absents sont sautes.
const LOCO_AV = ['walk', 'run_alt', 'run', 'sprint'];      // vers l'avant
const LOCO_AR = ['walk_back', 'def_back'];                 // a reculons
const LOCO_LAT_D = ['walk_side', 'def_slide_r'];           // pas chasses vers la droite
const LOCO_LAT_G = ['walk_side_m', 'def_slide_l'];         // ... vers la gauche
// Clips d'ATTENTE dont on recale la semelle au sol, avatar par avatar (voir Player._mesurerSol)
const SOL_REPOS = ['idle'];
// LES RANGS SERRÉS (voir Player._glisserRang) : le pas chassé de qui se faufile jusqu'à sa place, et la distance à la ligne
// d'un rang d'où on y entre (moins de la moitié du pas des rangs de la grande salle, 0,95 m)
const VITESSE_RANG = 1.1, PRISE_RANG = 0.4;

const loader = new GLTFLoader();
const modelCache = {};
// AVATARS DE TÉLÉPHONE (tools/avatars_tel.py) : assets/tel/<nom>.glb, textures en 512 (le visage reste en 1024) — trois
// fois moins de mémoire graphique. Fichier absent : on retombe sur l'original.
export const urlAvatar = (url) => (TELEPHONE && /^assets\/[a-z0-9_]+\.glb$/.test(url) ? url.replace('assets/', 'assets/tel/') : url);
function loadModel(url) {
  if (!modelCache[url]) {
    const tel = urlAvatar(url);
    modelCache[url] = (tel === url ? loader.loadAsync(url) : loader.loadAsync(tel).catch(() => loader.loadAsync(url))).then(avecMipmaps);
  }
  return modelCache[url];
}
// LA PEAU SANS MIPMAPS. Les exports Avaturn règlent les textures du CORPS en filtrage linéaire SANS mipmaps : dès quelques
// mètres, la peau grésille. On les leur rend, une fois par fichier.
function avecMipmaps(gltf) {
  const vues = new Set();
  gltf.scene.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
        const t = m[k];
        if (!t || vues.has(t)) continue;
        vues.add(t);
        if (t.minFilter === THREE.LinearFilter || t.minFilter === THREE.NearestFilter) { t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; }
      }
    }
  });
  return gltf;
}
// Le modèle demandé tout de suite (l'écran de chargement l'attend, js/demarrage.js). Une erreur est avalée ici ; elle
// ressortira, avec son message, au vrai chargement.
export function prechargerModele(url) {
  return url ? loadModel(url).catch(() => {}) : null;
}

const _v = new THREE.Vector3(), _w = new THREE.Vector3();
const _mSol = new THREE.Matrix4(), _mSol2 = new THREE.Matrix4();   // mesure des semelles (Player._semelleBasse)
// téléphone en main (voir Player._placerTel)
const _tC = new THREE.Vector3(), _tX = new THREE.Vector3(), _tY = new THREE.Vector3(), _tZ = new THREE.Vector3();
const _tH = new THREE.Vector3(), _tF = new THREE.Vector3(), _tL = new THREE.Vector3(), _tU = new THREE.Vector3(0, 1, 0);
const _tW = new THREE.Vector3(), _tf = new THREE.Vector3(), _tn = new THREE.Vector3(), _tP = new THREE.Vector3(), _tQ = new THREE.Vector3();
const _tM = new THREE.Matrix4();
const lisse = (k) => k * k * (3 - 2 * k);

// Pose "neutre" : toutes les articulations (rotations en radians)
// t = cuisse (x : avant/arrière, z : écart), k = genou, a = épaule, e = coude, h = poignet
const REST = { tL: 0, tR: 0, tLz: 0, tRz: 0, kL: 0.08, kR: 0.08, aL: 0.15, aR: 0.15, aLz: 0.12, aRz: -0.12, aLy: 0, aRy: 0, eLy: 0, eRy: 0, eL: -0.25, eR: -0.25, hL: 0, hR: 0, torsoX: 0, torsoY: 0, bob: 0, headX: 0 };

// Le joueur regarde vers +z local ; sa gauche est +x, sa droite -x.
// Le téléphone du groupe : coque noire, écran allumé qui montre une conversation (bulles). Géométries et matériaux
// partagés ; l'écran ne subit pas l'étalonnage, il ÉCLAIRE.
let _telGeo = null;
function modeleTel() {
  if (!_telGeo) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#0d1117'; g.fillRect(0, 0, 128, 256);
    g.fillStyle = '#1f2937'; g.fillRect(0, 0, 128, 30);
    g.fillStyle = '#e5e7eb'; g.font = 'bold 15px sans-serif'; g.fillText('IRIS', 10, 21);
    const bulle = (x, y, w, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, 22, 9); g.fill(); };
    bulle(8, 42, 78, '#374151'); bulle(8, 72, 96, '#374151'); bulle(44, 104, 76, '#22c55e');
    bulle(8, 136, 64, '#374151'); bulle(36, 168, 84, '#22c55e'); bulle(8, 200, 88, '#374151');
    g.fillStyle = '#1f2937'; g.fillRect(0, 232, 128, 24);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    // même écran avec le CLAVIER ouvert : c'est ce qu'on voit quand il tape
    const c2 = document.createElement('canvas'); c2.width = 128; c2.height = 256;
    const g2 = c2.getContext('2d');
    g2.drawImage(c, 0, 0);
    g2.fillStyle = '#1b1f27'; g2.fillRect(0, 150, 128, 106);
    g2.fillStyle = '#0d1117'; g2.fillRect(6, 136, 116, 12);
    g2.fillStyle = '#4b5563';
    [10, 9, 7].forEach((n, r) => { const w = 11, x0 = (128 - n * (w + 1.5)) / 2; for (let i = 0; i < n; i++) { g2.beginPath(); g2.roundRect(x0 + i * (w + 1.5), 158 + r * 20, w, 16, 2.5); g2.fill(); } });
    g2.beginPath(); g2.roundRect(30, 220, 68, 16, 3); g2.fill();
    const tex2 = new THREE.CanvasTexture(c2); tex2.colorSpace = THREE.SRGBColorSpace;
    _telGeo = {
      coque: new THREE.BoxGeometry(0.074, 0.152, 0.009),
      ecran: new THREE.PlaneGeometry(0.066, 0.140),
      matCoque: new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.35, metalness: 0.5 }),
      matEcran: new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: 0xbfc8d6 }),
      matClavier: new THREE.MeshBasicMaterial({ map: tex2, toneMapped: false, color: 0xbfc8d6 }),
    };
  }
  const G2 = _telGeo, grp = new THREE.Group();
  grp.add(new THREE.Mesh(G2.coque, G2.matCoque));
  const e = new THREE.Mesh(G2.ecran, G2.matEcran); e.position.z = 0.0048; grp.add(e);
  grp.userData.ecran = e; grp.userData.mats = [G2.matEcran, G2.matClavier];
  grp.userData.dynamique = true;
  return grp;
}

export class Player {
  constructor(def, scene) {
    this.def = def; this.h = def.height;
    this.emote = null;                // emote en cours { id, clip, proc, loop, t }
    this.vel = new THREE.Vector3();   // vitesse réelle au sol : inertie (démarrage, freinage, appuis)
    this.faceWant = new THREE.Vector3(0, 0, 1);   // cap visé ; le joueur pivote progressivement vers lui
    this.landT = 0;                   // temps depuis l'atterrissage : flexion des jambes
    this.marche = false;              // allure de marche demandée : la vitesse est plafonnée à la foulée du clip
    this.locoPhase = 0;               // phase de foulée partagée (0..1) : 0 = cuisse gauche la plus en avant
    this.locoEtat = null;             // { cle, nom } : le clip de locomotion en cours pour l'echelle courante
    this.sensLoco = 'av'; this.sensT = 0;   // sens de déplacement retenu (av | ar | lat) et son temps de confirmation
    this.sprintVu = 0;                // rémanence du sprint : lisse le clignotement du drapeau
    this.locoActif = false;           // vrai quand l'avatar est piloté par le mélange de locomotion
    this.locoFoulee = 0; this.locoCad = 0;
    this.kBras = 0; this.kTronc = 0; this.kAir = 0; this.sautId = 0; this.virageVif = 0;
    this.pos = new THREE.Vector3();
    // INTERPOLATION DE RENDU. La simulation avance par crans de 1/120 s ; l'écran rafraîchit quand il veut. On garde la
    // pose du cran PRÉCÉDENT pour glisser entre les deux au moment d'afficher (Game.interpoler).
    this.posPrec = new THREE.Vector3(); this.posAff = new THREE.Vector3();
    this.angPrec = 0; this.ang = 0; this.angAff = 0;
    this.yPrec = 0; this.yAff = 0; this.solAff = 0;
    this.facing = new THREE.Vector3(0, 0, -1);
    this.stamina = 100; this.staminaMul = 1;
    this.jumpY = 0; this.jumpVel = 0; this.airborne = false;
    this.state = 'idle';              // (toujours 'idle' dans IRIS : il n'y a ni tir ni geste qui prenne le corps)
    this.speedNow = 0; this.sprinting = false; this.speedMul = 1; this.lateral = 0; this.lateralDir = 0; this.backward = 0;
    this.walkPhase = 0; this.animT = 0;
    this.cur = { ...REST };
    this.assis = null;                // assis : { de, a, bob, sx, sz, k, sortir }
    this.rang = null;                 // faufilé dans un rang serré : { R, t, ox, oz } (voir _glisserRang)
    this.couches = new Couches(this); // inclinaison, regard, respiration, pas (js/couches.js)
    this.cibleRegard = null;          // ce que le joueur regarde (posé par le jeu), ou null
    this.avatar = null; this.anim = null; this.animKey = null;
    this.bounds = BOUNDS;
    this.tel = null;                  // téléphone sorti : { k, t, tape, sortir, deux } — voir sortirTel
    this.disposed = false;
    this.scene = scene;
    this._build(scene);
    this.avatarUrl = def.model || null;
    this.solDecal = 0; this.solRepos = null;
    // Tant que l'avatar n'est pas là, on ne montre RIEN plutôt que le bonhomme en primitives. Il ne réapparaît que si
    // l'avatar ne peut pas être chargé.
    if (def.model) { this.body.visible = false; this._loadAvatar(def.model, def.modelHeight || 1.84); }
  }

  // ---------- bonhomme en primitives (secours, si l'avatar 3D ne se charge pas) ----------
  _build(scene) {
    const d = this.def;
    const root = new THREE.Group(); root.scale.setScalar(this.h / 2); root.rotation.order = 'YXZ';
    const body = new THREE.Group(); root.add(body);
    const haut = new THREE.MeshStandardMaterial({ color: d.color1, roughness: 0.65 });
    const bas = new THREE.MeshStandardMaterial({ color: d.color2, roughness: 0.65 });
    const skin = new THREE.MeshStandardMaterial({ color: d.skin, roughness: 0.7 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.9 });
    const add = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
    const torso = new THREE.Group(); torso.position.y = 0.95; body.add(torso);
    add(new THREE.BoxGeometry(0.44, 0.32, 0.3), bas, 0, -0.09, 0, torso);
    add(new THREE.BoxGeometry(0.46, 0.6, 0.28), haut, 0, 0.35, 0, torso);
    add(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), skin, 0, 0.68, 0, torso);
    const head = new THREE.Group(); head.position.set(0, 0.72, 0); torso.add(head);
    add(new THREE.SphereGeometry(0.13, 16, 12), skin, 0, 0.12, 0, head);
    add(new THREE.SphereGeometry(0.135, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), hair, 0, 0.13, 0, head);
    const leg = (x) => {
      const thigh = new THREE.Group(); thigh.position.set(x, 0.95, 0); body.add(thigh);
      add(new THREE.CylinderGeometry(0.085, 0.075, 0.48, 10), bas, 0, -0.24, 0, thigh);
      const knee = new THREE.Group(); knee.position.set(0, -0.48, 0); thigh.add(knee);
      add(new THREE.CylinderGeometry(0.07, 0.06, 0.42, 10), bas, 0, -0.21, 0, knee);
      add(new THREE.BoxGeometry(0.16, 0.09, 0.3), shoe, 0, -0.445, 0.05, knee);
      return { thigh, knee };
    };
    const arm = (x) => {
      const sh = new THREE.Group(); sh.position.set(x, 0.58, 0); torso.add(sh);
      add(new THREE.CylinderGeometry(0.065, 0.055, 0.32, 10), haut, 0, -0.16, 0, sh);
      const el = new THREE.Group(); el.position.set(0, -0.32, 0); sh.add(el);
      add(new THREE.CylinderGeometry(0.05, 0.045, 0.3, 10), skin, 0, -0.15, 0, el);
      const hand = new THREE.Group(); hand.position.set(0, -0.32, 0); el.add(hand);
      add(new THREE.SphereGeometry(0.06, 10, 8), skin, 0, 0, 0, hand);
      return { sh, el, hand };
    };
    const L = leg(0.12), R = leg(-0.12), AL = arm(0.3), AR = arm(-0.3);
    this.rig = { torso, head, thighL: L.thigh, kneeL: L.knee, thighR: R.thigh, kneeR: R.knee,
      armL: AL.sh, elbowL: AL.el, handL: AL.hand, armR: AR.sh, elbowR: AR.el, handR: AR.hand };
    scene.add(root); this.mesh = root; this.body = body;
    // (hors des « photos » du décor : la carte d'environnement prise sur place ne doit pas garder Haythem dans ses reflets)
    root.userData.dynamique = true;
    root.userData.dynamique = true;             // bouge : exclu des photos du décor (carte d'environnement, ombres cuites)
  }

  // ---------- avatar 3D (GLB Avaturn / Mixamo) ----------
  _loadAvatar(url, modelHeight) {
    loadModel(url).then((gltf) => {
      if (this.disposed || this.avatarUrl !== url) return;
      const model = skeletonClone(gltf.scene);
      // SkeletonUtils.clone ne clone QUE le squelette : on clone les matériaux par avatar (les retoucher ne doit pas
      // retoucher le modèle en cache).
      const vus = new Map();
      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
          const m = o.material;
          if (m && !Array.isArray(m)) {
            if (!vus.has(m)) { const c = m.clone(); c.userData = { srcMap: m.map || null, srcColor: m.color ? m.color.clone() : null }; vus.set(m, c); }
            o.material = vus.get(m);
          }
        }
      });
      const rig = new AvatarRig(model);
      if (!rig.ok) { console.warn('Avatar sans squelette Mixamo, on garde le bonhomme :', url); this.body.visible = true; return; }
      // Les tenues (js/fit.js) : masque de membre sur la géométrie, shader sur le matériau (cloné : propre au joueur).
      this.fitRep = null;
      model.traverse((o) => {
        if (!o.isSkinnedMesh || !/look/i.test((o.material && o.material.name) || '')) return;
        poserMasque(o);
        if (this.def.coupeHaut || this.def.coupeManche || this.def.coupeJambe || this.def.coupeBas) {
          couperTenue(o, { haut: this.def.coupeHaut || 0, manche: this.def.coupeManche || 0, jambe: this.def.coupeJambe || 0, bas: this.def.coupeBas || 0 });
        }
        if (!this.fitRep) this.fitRep = reperes(o);
        equiperShader(o.material);
      });
      model.scale.setScalar(2 / modelHeight);     // le groupe est en "unités 2 m" (scale h/2)
      this.avatarScale = this.h / modelHeight;     // unités du modèle -> mètres
      model.visible = false;                       // montré une fois ses programmes et ses clips prêts
      this.mesh.add(model);
      this.body.visible = false;
      if (this.def.coupeJambe) {
        let matCorps = null;
        model.traverse((o) => { if (!matCorps && o.isSkinnedMesh && /body/i.test(o.material?.name || '')) matCorps = o.material; });
        poserJambes(rig, this.def.skin, matCorps);
      }
      // l'éclairage du personnage (découpe, occlusion du corps, peau) : APRÈS le shader des tenues, qu'il chaîne
      this.eclairage = new EclairagePerso(); this.eclairage.equiper(model);
      this.avatar = rig; this.avatarModel = model;
      // LES CLIPS AVANT DE SE MONTRER (au plus 6 s) ; LES PROGRAMMES compilés en parallèle avant le premier dessin
      // (Player.preparerRendu, posé par js/game.js) : l'avatar paraît prêt, sans image figée.
      const clips = this._loadAnims(model, rig).catch(() => {});
      const montrer = () => { if (this.avatarModel === model) model.visible = true; };
      const prep = Player.preparerRendu;
      let pr = null;
      if (prep) { model.visible = true; try { pr = prep(model); } finally { model.visible = false; } }
      const attendre = Promise.race([clips, new Promise((r) => setTimeout(r, 6000))]);
      Promise.all([Promise.resolve(pr).catch(() => {}), attendre]).then(montrer, montrer);
      this._pretAvatar = Promise.all([Promise.resolve(pr).catch(() => {}), attendre]);
    }).catch((e) => {
      console.warn('Avatar non chargé :', url, e);
      if (!this.disposed && this.avatarUrl === url && !this.avatarModel) this.body.visible = true;   // secours : le bonhomme
    });
  }

  // clips : chargés d'après assets/anims/manifest.json ; les états sans clip gardent la pose procédurale
  async _loadAnims(model, rig) {
    const man = await loadManifest(ANIM_MANIFEST);
    if (!man || !man.clips || this.disposed || this.avatarModel !== model) return;
    const hips = rig.bone('Hips'), leg = rig.bone('LeftLeg'), foot = rig.bone('LeftFoot');
    const ref = { hipsY: hips ? hips.position.y : 0.95, legLen: leg && foot ? leg.position.length() + foot.position.length() : 0 };
    const base = ANIM_MANIFEST.slice(0, ANIM_MANIFEST.lastIndexOf('/') + 1);
    const player = new AnimPlayer(model);
    const entries = Object.entries(man.clips).filter(([, d]) => d && typeof d === 'object' && d.file);
    const results = await Promise.all(entries.map(([name, d]) => loadMixamoClip(base + d.file.split('/').map(encodeURIComponent).join('/'), name, d, ref, rig)));
    if (this.disposed || this.avatarModel !== model || this.avatar !== rig) return;
    let n = 0;
    results.forEach((r, i) => { if (r) { player.add(entries[i][0], r.clip, r.def); n++; } });
    if (n === 0) return;
    console.info(`[joueur] ${n}/${entries.length} animations chargées pour ${this.def.name}`);
    if (this.avatar) this.avatar.couchesAnnuler(Couches.OS);   // voir AvatarRig.couchesAnnuler
    this.anim = player;
    this._mesurerSol();
    player.coupe = false; this._clipAvant = undefined;
  }

  // PIEDS AU SOL. Le clip d'attente pose les semelles 4 cm AU-DESSUS du sol (la hauteur des hanches du clip est mise à
  // l'échelle par la longueur de jambe, qui ne compte ni la cheville ni la semelle). On mesure UNE FOIS, pour CET avatar et
  // chaque clip de repos, la semelle la plus basse (médiane sur le clip), et on descend l'avatar d'autant quand ce clip
  // joue, au prorata de son poids dans le mélange. Pas de pose des pieds recalculée à chaque image en mouvement : en
  // course, les deux pieds sont en l'air pendant la phase de vol.
  _mesurerSol() {
    const A = this.anim, M = this.avatarModel;
    this.solRepos = null;
    if (!A || !M) return;
    const pts = [];
    M.traverse((o) => {
      if (!o.isSkinnedMesh || !/shoe/i.test((o.material && o.material.name) || '')) return;
      const p = o.geometry.attributes.position; if (!p) return;
      let yMin = Infinity;
      for (let i = 0; i < p.count; i++) yMin = Math.min(yMin, p.getY(i));
      const idx = [];
      for (let i = 0; i < p.count; i++) if (p.getY(i) < yMin + 0.04) idx.push(i);
      pts.push({ o, idx });
    });
    if (!pts.length) return;
    const semelles = pts.map(({ o, idx }) => { const pas = Math.max(1, Math.ceil(idx.length / 300)); return { o, idx: idx.filter((_, k) => k % pas === 0) }; });
    const saved = { name: A.currentName, time: A.current ? A.current.time : 0 };
    const y0 = M.position.y; M.position.y = 0;
    const S = {};
    for (const nom of SOL_REPOS) {
      const a = A.actions[nom]; if (!a) continue;
      const clip = a.getClip(), n = 8, h = [];
      A.mixer.stopAllAction(); a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.play();
      for (let s = 0; s < n; s++) {
        A.mixer.setTime(Math.min(clip.duration - 1e-4, (s + 0.5) / n * clip.duration));
        this.mesh.updateMatrixWorld(true);
        h.push(this._semelleBasse(semelles));
      }
      h.sort((x, y) => x - y);
      const med = h[n >> 1];
      if (Number.isFinite(med) && Math.abs(med) > 0.004) S[nom] = clamp(-med, -0.08, 0.03);
    }
    A.mixer.stopAllAction(); A.current = null; A.currentName = null; this.animKey = null;
    if (saved.name && A.actions[saved.name]) { A.play(saved.name, { fade: 0 }); A.current.time = saved.time; }
    M.position.y = y0;
    this.mesh.updateMatrixWorld(true);
    this.solRepos = Object.keys(S).length ? S : null;
  }
  _semelleBasse(liste) {
    let bas = Infinity;
    _mSol.copy(this.mesh.matrixWorld).invert();
    for (const { o, idx } of liste) {
      _mSol2.multiplyMatrices(_mSol, o.matrixWorld);
      for (const i of idx) bas = Math.min(bas, o.getVertexPosition(i, _w).applyMatrix4(_mSol2).y);
    }
    return bas * this.mesh.scale.y;
  }
  _poserSol(dt, clipDriven) {
    const M = this.avatarModel; if (!M) return;
    let cible = 0;
    const A = this.anim, S = this.solRepos;
    if (clipDriven && A && S) {
      for (const n in S) {
        const a = A.actions[n];
        if (a && a.enabled && a.isRunning()) cible += S[n] * clamp(a.getEffectiveWeight(), 0, 1);
      }
    }
    // (un léger lissage : un arrêt net de tous les clips — s'asseoir — ne fait pas sauter le corps de 4 cm)
    this.solDecal += (cible - this.solDecal) * (1 - Math.exp(-dt / 0.08));
    M.position.y = this.solDecal / (this.mesh.scale.y || 1);
  }

  // ---------- s'asseoir ----------
  // `siege` = { x, z, y, sx, sz, fx, fz } : le point d'assise, sa hauteur, le point de SORTIE devant le siège, le cap à
  // prendre une fois posé. `bob` descend le maillage pour que la hanche arrive à 8 cm au-dessus de l'assise.
  sasseoir(siege) {
    if (this.assis) return;
    // (dans un rang serré, on se relèvera sur sa ligne, devant la place, et non dans l'allée : voir _glisserRang)
    const G = this.rang && siege.rang === this.rang.R ? this.rang : null;
    if (G) { G.t = clamp(siege.t, G.R.t0, G.R.t1); G.ox = 0; G.oz = 0; } else this.rang = null;
    this.assis = { de: { x: this.pos.x, z: this.pos.z }, a: { x: siege.x, z: siege.z }, bob: siege.y + 0.08 - 0.53 * this.h,
      sx: G ? G.R.ax + G.R.ux * G.t : siege.sx, sz: G ? G.R.az + G.R.uz * G.t : siege.sz === undefined ? siege.z : siege.sz, k: 0, sortir: false };
    this.vel.set(0, 0, 0);
    this.stopEmote();
    this.setFacing(siege.fx, siege.fz);
    if (this.anim) this.anim.stop(0.12);
  }
  // Se lever : on rejoue la courbe à l'envers, en visant le point de SORTIE devant le siège.
  seLever() {
    const S = this.assis;
    if (!S || S.sortir) return;
    S.de = { x: S.sx === undefined ? this.pos.x + this.facing.x * 0.6 : S.sx, z: S.sz };
    S.a = { x: this.pos.x, z: this.pos.z };
    S.sortir = true;
  }
  get assisPose() { return !!this.assis && !this.assis.sortir; }

  // ---------- animation ----------
  _resolve(name) {
    if (this.anim.has(name)) return name;
    for (const f of FALLBACK[name] || []) if (this.anim.has(f)) return f;
    return null;
  }

  // LE SENS DE DÉPLACEMENT, AVEC MÉMOIRE : au démarrage le cap n'a pas encore rattrapé la course (on file en avant en
  // regardant de côté) ; le nouveau sens doit se CONFIRMER un septième de seconde avant qu'on change de famille de clips.
  _sensLoco(dt) {
    const ar = this.sensLoco === 'ar' ? this.backward > 0.45 : this.backward > 0.62;
    const lat = this.sensLoco === 'lat' ? this.lateral > 0.55 : this.lateral > 0.72;
    const cand = ar ? 'ar' : lat ? 'lat' : 'av';
    if (cand === this.sensLoco) { this.sensT = 0; return this.sensLoco; }
    this.sensT += dt;
    if (this.sensT >= 0.14) { this.sensLoco = cand; this.sensT = 0; }
    return this.sensLoco;
  }

  // UN SEUL CLIP DE LOCOMOTION À LA FOIS (le fondu est l'affaire du lecteur). Le SPRINT est un état, pas une vitesse :
  // on prend le clip le plus rapide au-delà de 70 % de sa vitesse de référence ; sinon la frontière entre deux clips est
  // leur moyenne GÉOMÉTRIQUE, avec une marge d'hystérésis.
  _choisirLoco(echelle, hautDeGamme) {
    const A = this.anim;
    const dispo = [];
    for (const n of echelle) { const r = this._resolve(n); const d = r && A.defs[r]; if (d && d.foulee && !dispo.includes(r)) dispo.push(r); }
    if (!dispo.length) return null;
    dispo.sort((a, b) => A.defs[a].speedRef - A.defs[b].speedRef);
    const cle = echelle[0];
    let L = this.locoEtat;
    if (!L || L.cle !== cle || dispo.indexOf(L.nom) < 0) L = this.locoEtat = { cle, nom: dispo[0] };
    const v = this.speedNow, iCourant = dispo.indexOf(L.nom);
    if (hautDeGamme && dispo.length > 1) {
      const top = dispo[dispo.length - 1], vTop = A.defs[top].speedRef || 1;
      if (v > vTop * (L.nom === top ? 0.6 : 0.7)) { L.nom = top; return top; }
    }
    let cible = dispo[0];
    for (let i = 1; i < dispo.length; i++) {
      const va = A.defs[dispo[i - 1]].speedRef, vb = A.defs[dispo[i]].speedRef;
      const seuil = Math.sqrt(va * vb), marge = (vb - va) * 0.06;
      if (v > seuil + (iCourant >= i ? -marge : marge)) cible = dispo[i];
    }
    L.nom = cible;
    return cible;
  }

  // Fondu entre deux clips selon le couple
  _fondu(de, vers, once) {
    if (!de || de === vers) return once ? 0.08 : 0.22;
    if (de === 'taunt' || de === 'victory' || de.startsWith('celebrate') || de.startsWith('dance')) return 0.3;
    if (de === 'block' || de === 'saut') return 0.16;          // retombée d'un saut
    return once ? 0.1 : 0.22;
  }

  // Vers la pose procédurale : on coupe le mélangeur ; le raccord à l'écran est le fondu de pose (update).
  _versProcedural() {
    const A = this.anim;
    if (A.current || A.loco.length) A.couper();
    A.haut = null;
    this.animKey = null; this.armsOverride = false; this.locoActif = false;
    this.kBras = 0; this.kTronc = 0;
  }

  // Le clip du saut : `saut` (manifeste) s'il existe, sinon le saut de contre de LA CAGE (« Defender »).
  _clipSaut() { return this.anim.has('saut') ? 'saut' : 'block'; }

  // choisit et pilote le clip selon l'état ; retourne false si aucun clip ne convient (→ pose procédurale)
  _driveAnim(dt) {
    // EN MOUVEMENT, avec hystérésis : sous 0,4 m/s on repasse au clip d'attente, on ne repart qu'au-dessus de 0,55
    this._bougeAnim = this._bougeAnim ? this.speedNow > 0.4 : this.speedNow > 0.55;
    const A = this.anim, moving = this._bougeAnim;
    // Assis : pose ENTIÈREMENT procédurale (un clip écraserait la translation des hanches, qui pose le joueur sur l'assise)
    if (this.assis) { this._versProcedural(); return false; }
    let want = null, once = false, loco = null;
    if (this.emote) {
      // emote « maison » (procOnly) : aucun clip, c'est la chorégraphie de _pose qui pilote l'avatar
      want = this.emote.procOnly ? null : (A.has(this.emote.clip) ? this.emote.clip : (A.has('celebrate_3') ? 'celebrate_3' : 'victory'));
      once = !this.emote.loop;
      if (!want) { this._versProcedural(); return false; }
    } else if (this.airborne) { want = this._clipSaut(); once = true; }
    else if (moving) {
      // l'échelle du sens de déplacement RÉEL par rapport au cap (confirmé : _sensLoco) ; le sprint lissé (sprintVu)
      const sens = this._sensLoco(dt);
      loco = sens === 'ar' ? this._choisirLoco(LOCO_AR, false)
        : sens === 'lat' ? this._choisirLoco(this.lateralDir >= 0 ? LOCO_LAT_D : LOCO_LAT_G, false)
          : this._choisirLoco(LOCO_AV, this.sprintVu > 0);
      if (!loco) want = this.sprinting ? 'sprint' : 'run';
    } else want = 'idle';
    if (A.haut) A.stopHaut();

    // ---- le mélange de locomotion : LA PHASE AVANCE AVEC LE SOL (speedNow / foulée), bornée autour de la cadence
    // naturelle du clip (0,4 à 1,5 fois) ----
    if (loco) {
      const m = A.majPoidsLoco(loco, dt);
      const nat = m.vRef / m.foulee;
      const cad = clamp(this.speedNow / m.foulee, nat * 0.4, nat * 1.5);
      this.locoPhase = (this.locoPhase + cad * dt) % 1;
      this.locoActif = true; this.locoFoulee = m.foulee; this.locoCad = cad;
      this.armsOverride = false;
      A.appliquerLoco(this.locoPhase, dt);
      this.animKey = 'loco';
      this._poserReprises(dt);
      return true;
    }
    this.locoActif = false;
    const name = this._resolve(want);
    if (!name) { this._versProcedural(); return false; }
    const d = A.defs[name];
    this.armsOverride = d.arms === 'procedural';
    let speed = 1;
    if (d.speedRef && moving) speed = clamp(this.speedNow / d.speedRef, 0.6, 1.6);
    if (d.fit && d.duration) speed = d.duration / d.fit;
    if (d.rate) speed *= d.rate;
    // LE SAUT CALÉ SUR LE SAUT PHYSIQUE : l'apogée du clip tombe sur celle du joueur (d'après la vitesse verticale au
    // départ). `departSet` : le clip part de son impulsion (le point bas, `set`) — la flexion d'avant le saut ne se joue
    // pas en l'air.
    const sautLibre = this.airborne && once && d.apex !== undefined;
    const key = once ? `${name}:${sautLibre ? 'saut:' + this.sautId : 'geste'}` : name;
    if (key !== this.animKey) {
      const debut = sautLibre && d.departSet && d.set !== undefined ? d.set : 0;
      if (sautLibre) speed = this.jumpVel > 0.3 ? clamp((d.apex - debut) / (this.jumpVel / G), 0.6, 1.8) : 1;
      A.play(name, { restart: once, speed, fade: this._fondu(A.currentName, name, once) }); this.animKey = key;
      if (debut && A.current) A.current.time = debut;
      this._vitClip = speed;
    } else A.setSpeed(sautLibre ? this._vitClip : speed);
    A.update(dt);
    this._poserReprises(dt);
    return true;
  }

  // TOUT CE QUI SE POSE PAR-DESSUS LE MÉLANGEUR : hauteur des hanches (saut), couche du haut du corps, bras procéduraux
  // (le téléphone) en fondu de 0,12 s.
  _poserReprises(dt) {
    const A = this.anim, R = this.avatar;
    R.surDebut();
    this._ajusterHanches(dt);
    A.appliquerHaut(dt);
    const tel = this.telActif();
    const veutBras = tel || this.armsOverride, veutTronc = tel;
    const pas = dt / 0.12;
    this.kBras = clamp((this.kBras || 0) + (veutBras ? pas : -pas), 0, 1);
    this.kTronc = clamp((this.kTronc || 0) + (veutTronc ? pas : -pas), 0, 1);
    if (this.kBras > 0.001 || this.kTronc > 0.001) R.applyArms(this.cur, lisse(this.kTronc), lisse(this.kBras));
  }

  // HAUTEUR DES HANCHES EN L'AIR : on GARDE la hauteur du clip tant qu'elle est sous la station debout (flexion,
  // extension, amorti) et on n'écrête que le saut du clip lui-même, que la physique remplace.
  _ajusterHanches(dt) {
    const e = this.avatar.entries.Hips; if (!e) return;
    const air = this.airborne || this.landT > 0;
    this.kAir = clamp((this.kAir || 0) + (air ? dt / 0.05 : -dt / 0.12), 0, 1);
    if (!(this.kAir > 0) && !air) return;
    const flechi = this.landT > 0 ? -0.10 * (this.landT / 0.22) : 0;     // amorti à la réception
    const y = e.bone.position.y, plaf = e.restPos.y;
    e.bone.position.y = (y > plaf ? y - (y - plaf) * this.kAir : y) + (this.jumpY + flechi) / this.avatarScale;
  }

  // ---------- téléphone ----------
  // Ouvrir le chat, c'est SORTIR SON TÉLÉPHONE : le joueur le tire de sa poche, baisse la tête et le regarde. Écrire,
  // c'est TAPER dessus, les deux pouces qui s'agitent.
  sortirTel() { if (!this.tel) this.tel = { k: 0, t: 0, tape: 0, sortir: false }; this.tel.sortir = false; }
  rangerTel() { if (this.tel) this.tel.sortir = true; }
  taperTel(duree = 0.7) { this.sortirTel(); if (this.tel) this.tel.tape = Math.max(this.tel.tape, duree); }
  // Le téléphone ne se montre qu'au repos : un saut ou une emote passent devant.
  telActif() { return !!this.tel && !this.airborne && !this.emote; }

  // La pose : le bras droit ramène le téléphone devant la poitrine, la tête se penche dessus.
  _poseTel(P) {
    const T = this.tel;
    if (!T || !this.telActif()) return;
    const k = T.k * T.k * (3 - 2 * T.k), f = T.t;
    const mx = (cle, v) => { P[cle] = P[cle] + (v - P[cle]) * k; };
    const tape = T.tape > 0 ? 1 : 0;
    const fr = tape ? Math.sin(f * 21) : 0, lent = Math.sin(f * 1.4);
    mx('aR', -0.48); mx('aRz', 0.20); mx('aRy', 0.52); mx('eR', -1.52 + 0.06 * fr); mx('hR', -0.30 + 0.14 * fr + 0.04 * lent);
    if (!this.avatar) { mx('aL', -0.46); mx('aLz', -0.22); mx('aLy', -0.52); mx('eL', -1.48 - 0.06 * fr); mx('hL', -0.30 - 0.14 * fr); }
    mx('headX', 0.80 + 0.04 * lent + 0.04 * tape); mx('torsoX', 0.14); mx('torsoY', 0.04 * lent);
  }

  // LE TÉLÉPHONE TENU POUR DE VRAI : on décide d'abord où est le téléphone (devant la poitrine, écran tourné vers les
  // yeux), puis on AMÈNE la main dessus par cinématique inverse ; pour taper, la main gauche vient tenir l'autre bord.
  _placerTel() {
    const T = this.tel, actif = !!T && this.telActif() && this.mesh.visible;
    if (!this.telMesh) { if (!actif) return; this.telMesh = modeleTel(); this.scene.add(this.telMesh); }
    const m = this.telMesh;
    if (!actif || T.k < 0.08) { m.visible = false; return; }
    m.visible = true;
    const A = this.avatar;
    if (!A || !A.aMains('Right')) { this._placerTelSimple(T, m); return; }
    const k = T.k * T.k * (3 - 2 * T.k), deux = T.deux || 0, e2 = deux * deux * (3 - 2 * deux);
    this.mesh.getWorldDirection(_tF);
    _tL.crossVectors(_tU, _tF).normalize();
    A.bone('Head').getWorldPosition(_tH);
    const hs = this.h / 1.8;
    _tC.copy(_tH).addScaledVector(_tF, 0.27 * hs).addScaledVector(_tU, -0.31 * hs).addScaledVector(_tL, -0.045 * (1 - e2) * hs);
    _tP.copy(_tH).addScaledVector(_tU, 0.07 * hs).addScaledVector(_tF, 0.09 * hs);
    _tZ.subVectors(_tP, _tC).normalize();
    _tY.copy(_tF).addScaledVector(_tZ, -_tF.dot(_tZ)).normalize();
    _tX.crossVectors(_tY, _tZ);
    const ox = 0.070 + (0.034 - 0.070) * e2, oy = -0.028 + (-0.085 + 0.028) * e2, oz = -0.0175;
    const th = 0.245 + (1.32 - 0.245) * e2;
    _tW.copy(_tC).addScaledVector(_tX, ox).addScaledVector(_tY, oy).addScaledVector(_tZ, oz);
    _tf.copy(_tX).multiplyScalar(-Math.cos(th)).addScaledVector(_tY, Math.sin(th)).normalize();
    _tQ.copy(_tC).addScaledVector(_tU, -0.45).addScaledVector(_tL, -0.30).addScaledVector(_tF, -0.12);
    A.ikBras('Right', _tW, _tf, _tZ, _tQ, k);
    A.plierDoigts('Right', [0.30 - 0.28 * e2, 1.25 - 1.20 * e2, 0.55 - 0.50 * e2], k);
    // le téléphone suit la main RÉELLE : collé à la paume, même pendant la sortie de poche
    A.repereMain('Right', _tW, _tf, _tn);
    _tZ.copy(_tn);
    _tX.copy(_tf).applyAxisAngle(_tZ, -(Math.PI - th));
    _tX.addScaledVector(_tZ, -_tX.dot(_tZ)).normalize();
    _tY.crossVectors(_tZ, _tX);
    _tC.copy(_tW).addScaledVector(_tX, -ox).addScaledVector(_tY, -oy).addScaledVector(_tZ, -oz);
    _tM.makeBasis(_tX, _tY, _tZ); m.quaternion.setFromRotationMatrix(_tM); m.position.copy(_tC);
    m.scale.setScalar(1);
    // les pouces visent l'écran ; en frappe, ils sautent d'une touche à l'autre
    const tape = T.tape > 0, f = T.t;
    m.userData.ecran.material = m.userData.mats[tape ? 1 : 0];
    const saut = (ph) => Math.floor(f * 7 + ph) * 12.9898;
    const rx = (ph) => (Math.sin(saut(ph)) * 43758.5453) % 1;
    if (tape) _v.copy(_tC).addScaledVector(_tX, 0.004 + 0.022 * Math.abs(rx(0))).addScaledVector(_tY, -0.030 - 0.020 * Math.abs(rx(0.5)));
    else _v.copy(_tC).addScaledVector(_tX, 0.012).addScaledVector(_tY, -0.012 + 0.018 * Math.sin(f * 1.4));
    _v.addScaledVector(_tZ, 0.010 + (tape ? 0.006 * Math.max(0, Math.sin(f * 44)) : 0));
    A.viserPoint('RightHandThumb1', 'RightHandThumb2', _v, k * 0.9);
    A.viserPoint('RightHandThumb2', 'RightHandThumb3', _v, k * 0.9);
    if (e2 > 0.01 && A.aMains('Left')) {
      _tW.copy(_tC).addScaledVector(_tX, -0.034).addScaledVector(_tY, -0.085).addScaledVector(_tZ, -0.0175);
      _tf.copy(_tX).multiplyScalar(Math.cos(1.32)).addScaledVector(_tY, Math.sin(1.32)).normalize();
      _tQ.copy(_tC).addScaledVector(_tU, -0.45).addScaledVector(_tL, 0.30).addScaledVector(_tF, -0.12);
      A.ikBras('Left', _tW, _tf, _tZ, _tQ, e2 * k);
      A.plierDoigts('Left', [0.02, 0.05, 0.05], e2 * k);
      _v.copy(_tC).addScaledVector(_tX, -0.004 - 0.022 * Math.abs(rx(0.25))).addScaledVector(_tY, -0.030 - 0.020 * Math.abs(rx(0.75)));
      _v.addScaledVector(_tZ, 0.010 + 0.006 * Math.max(0, Math.sin(f * 44 + Math.PI)));
      A.viserPoint('LeftHandThumb1', 'LeftHandThumb2', _v, e2 * k * 0.9);
      A.viserPoint('LeftHandThumb2', 'LeftHandThumb3', _v, e2 * k * 0.9);
    }
  }
  _placerTelSimple(T, m) {
    this.rig.handR.getWorldPosition(_v);
    _w.set(this.posAff.x, this.h * 0.93 + this.jumpY + this.solAff, this.posAff.z);
    m.position.copy(_v); m.lookAt(_w); m.rotateX(-0.25);
    m.scale.setScalar(Math.min(1, T.k * 1.5));
  }

  // ---------- interpolation de rendu ----------
  // Appelé AVANT chaque pas de simulation : la pose affichée d'aujourd'hui devient celle d'hier.
  memoriser() { this.posPrec.copy(this.pos); this.angPrec = this.ang; this.yPrec = this.yAff; }
  // Appelé UNE FOIS par image, après la boucle de simulation, avec la fraction de pas qui reste à courir : on affiche
  // un point ENTRE le cran précédent et le cran courant. Le mouvement redevient continu sans toucher à la physique.
  presenter(a) {
    // un écart d'un mètre en 8 ms n'est pas un déplacement, c'est une téléportation : on ne l'interpole pas
    if (this.posPrec.distanceToSquared(this.pos) > 1.0) { this.posPrec.copy(this.pos); this.angPrec = this.ang; this.yPrec = this.yAff; }
    this.solAff = this.posPrec.y + (this.pos.y - this.posPrec.y) * a;
    this.posAff.set(
      this.posPrec.x + (this.pos.x - this.posPrec.x) * a,
      this.solAff + this.yPrec + (this.yAff - this.yPrec) * a,
      this.posPrec.z + (this.pos.z - this.posPrec.z) * a);
    let d = this.ang - this.angPrec;
    while (d > Math.PI) d -= Math.PI * 2;              // toujours par le plus court chemin
    while (d < -Math.PI) d += Math.PI * 2;
    this.mesh.position.copy(this.posAff);
    this.angAff = this.angPrec + d * a;
    this.mesh.rotation.set(this.couches.tangage, this.angAff, this.couches.roulis);
    this.mesh.updateMatrixWorld(true);
    if (this.tel || this.telMesh) this._placerTel();
    if (this.eclairage) this.eclairage.maj(this);   // les sphères d'occlusion suivent les os
  }

  // ---------- déplacement ----------
  // dir : direction monde (xz) normalisée ou nulle
  move(dir, sprint, dt) {
    // ASSIS : on ne se déplace plus, et l'endurance remonte deux fois plus vite qu'à l'arrêt debout
    if (this.assis) {
      this.vel.set(0, 0, 0); this.speedNow = 0; this.lateral = 0; this.backward = 0; this.sprinting = false;
      this.stamina = Math.min(100, this.stamina + 26 * dt);
      return;
    }
    const moving = dir.lengthSq() > 0.001;
    // DANS UN RANG SERRÉ (_glisserRang) : on n'y va que le long de sa ligne ; on y entre en poussant contre son bout
    if (this.rang || (moving && !this.airborne && this._entrerRang(dir))) { this._glisserRang(dir, dt); return; }
    // VITESSE (les réglages de LA CAGE) : 3,1 m/s + la vitesse de la fiche, sprint x1,32 qui use l'endurance
    let sp = (3.1 + (this.def.spd / 100) * 2.4) * this.speedMul;
    this.sprinting = false;
    if (sprint && moving && this.stamina > 3) { sp *= 1.32; this.stamina = Math.max(0, this.stamina - 22 * dt * this.staminaMul); this.sprinting = true; }
    else this.stamina = Math.min(100, this.stamina + 13 * dt);
    // MARCHER : le plafond est celui de la foulée du clip de marche (2,15 m/s), où le pied ne glisse pas
    if (this.marche && !this.sprinting) { sp = Math.min(sp, 2.15); this.stamina = Math.min(100, this.stamina + 5 * dt); }
    // drapeau de sprint LISSÉ : il s'allume tout de suite, il s'éteint en un quart de seconde
    if (this.sprinting) this.sprintVu = 0.25; else this.sprintVu = Math.max(0, this.sprintVu - dt);
    sp *= this.gasMul();                                     // jambes lourdes quand l'endurance tombe
    if (this.airborne) sp *= 0.35;
    // Inertie : on pilote une VITESSE (~0,13 s pour lancer sa course, ~0,085 s pour s'arrêter)
    const cible = _v3.set(dir.x * sp, 0, dir.z * sp);
    const k = moving && sp > 0 ? 1 - Math.exp(-dt / 0.13) : 1 - Math.exp(-dt / 0.085);
    this.vel.lerp(cible, Math.min(1, k));
    if (this.vel.lengthSq() < 1e-4) this.vel.set(0, 0, 0);
    // LES MURS (js/collisions.js) : le pas est découpé et chaque morceau sorti des murs ; la vitesse perd ce qui
    // rentrait dedans — on glisse le long d'un mur, et l'animation court à la vitesse réelle du glissement
    // (les pieds RÉELS : le sol sous le joueur — une marche, un palier — plus le saut)
    const C = Player.collisions, dx = this.vel.x * dt, dz = this.vel.z * dt;
    if (C) {
      C.deplacer(this.pos, dx, dz, RAYON_JOUEUR, this.vel, this.pos.y + this.jumpY);
      // LE SOL sous les pieds (js/collisions.js solEn) : les volées de l'escalier sont des rampes continues, les paliers
      // des dalles ; le joueur les suit (son saut reste compté au-dessus de ce sol)
      this.pos.y = C.solEn(this.pos.x, this.pos.z, this.pos.y);
    } else { this.pos.x += dx; this.pos.z += dz; }
    // (filet de sécurité : la zone de la carte)
    const B = this.bounds;
    this.pos.x = Math.max(B.xMin, Math.min(B.xMax, this.pos.x));
    this.pos.z = Math.max(B.zMin, Math.min(B.zMax, this.pos.z));
    if ((this.pos.x >= B.xMax && this.vel.x > 0) || (this.pos.x <= B.xMin && this.vel.x < 0)) this.vel.x = 0;
    if ((this.pos.z >= B.zMax && this.vel.z > 0) || (this.pos.z <= B.zMin && this.vel.z < 0)) this.vel.z = 0;
    this.speedNow = Math.hypot(this.vel.x, this.vel.z);
    if (this.speedNow > 0.1) {
      const nx = this.vel.x / this.speedNow, nz = this.vel.z / this.speedNow;
      const lat = nx * -this.facing.z + nz * this.facing.x;
      this.lateral = Math.abs(lat); this.lateralDir = Math.sign(lat);
      this.backward = -(nx * this.facing.x + nz * this.facing.z);
      if (!this.airborne) this.faceWant.set(nx, 0, nz);
    } else {
      this.lateral = 0; this.backward = 0; this.sensLoco = 'av'; this.sensT = 0;
      // poussé contre un mur, on ne bouge plus mais on se tourne vers où l'on veut aller
      if (moving && !this.airborne) this.faceWant.set(dir.x, 0, dir.z);
    }
    this.turnTo(this.faceWant, dt);
  }

  // ---------- les rangs serrés ----------
  // LES RANGS SERRÉS (11/10, finitions du plan V2 — rapport final V2 § 5 : les places au milieu des rangées, 61 dans la
  // grande salle S -1.14, 10 à 15 dans la S 1.3, 4 dans la salle 2 du 2e, qu'aucun endroit où l'on marche ne mettait à
  // moins de 1,1 m). Les rangées gardent leur pas (la VO les montre serrées : 0,95 m dans la grande salle) ; c'est
  // Haythem qui s'y FAUFILE, comme on le fait pour gagner sa place : poussé contre le bout ouvert d'un rang (à 12 cm
  // près, à PRISE_RANG au plus de sa ligne, la poussée à moins de 41° de la ligne — en biais, il longe les bouts des
  // rangs comme avant : on n'est pas happé par un rang en remontant l'allée), il se tourne vers l'avant de la salle et
  // passe en pas chassés, à VITESSE_RANG, le long de la ligne libre — entre le plateau et les dossiers, ou derrière les
  // chaises —, en les frôlant. La place devant laquelle il se trouve est proposée (js/game.js updateSieges : celles de
  // son rang seulement) ; il se relève devant elle, sur la ligne. Une poussée le long du rang l'y mène ; une poussée en
  // travers (vers le plateau, les dossiers) le ramène vers le bout ouvert le plus proche : on ne reste jamais planté dans
  // un rang. Il en ressort par un bout ouvert, là où il se tenait pour y entrer. Ni meuble ni mur ne bouge : le monde
  // solide garde le rang en un bloc, la ligne ne vaut que pour celui qui s'y est faufilé.
  // Un rang est posé par sa pièce sur ses sièges (`s.rang`, le même objet pour toute la rangée : js/ecole_amphi.js,
  // js/ecole_etage1_pause.js, js/ecole_etage2.js) :
  //   { nom, sol, ax, az, bx, bz : les deux bouts de sa ligne (monde), fx, fz : l'avant de la salle, sieges }
  // Un bout est OUVERT quand Haythem y tient (libre : c'est là qu'il se trouve, poussé contre le bout du rang), sauf s'il
  // est déclaré fermé (`ouvA` / `ouvB` à false) ; un bout fermé (un mur, les fenêtres) arrête la ligne 5 cm après la
  // dernière place. Le reste se calcule ici, une fois. (Relecture du 11/10 : libre à 5 cm près, OUVERT_RANG — le bout
  // ouest du rang 7 de la grande salle, à 0,28 m du poteau, se prend du passage ouest : Haythem, arrêté contre le bout du
  // rang, y est déjà ; à RAYON_JOUEUR, il ne s'y faufilait que par l'allée. Les autres bouts n'en changent pas : 0,31 m
  // et plus, ou dans le mur.)
  static poserRangs(sieges) {
    const C = Player.collisions, rangs = [], OUVERT_RANG = RAYON_JOUEUR - 0.05;
    for (const s of sieges) if (s.rang && !rangs.includes(s.rang)) rangs.push(s.rang);
    for (const R of rangs) {
      const dx = R.bx - R.ax, dz = R.bz - R.az, L = Math.hypot(dx, dz);
      R.L = L; R.ux = dx / L; R.uz = dz / L;
      for (const s of R.sieges) s.t = (s.x - R.ax) * R.ux + (s.z - R.az) * R.uz;
      const ts = R.sieges.map((s) => s.t);
      R.ouvA = R.ouvA !== false && (!C || C.libre(R.ax, R.az, OUVERT_RANG, R.sol));
      R.ouvB = R.ouvB !== false && (!C || C.libre(R.bx, R.bz, OUVERT_RANG, R.sol));
      R.t0 = R.ouvA ? 0 : Math.max(0, Math.min(...ts) - 0.05);
      R.t1 = R.ouvB ? L : Math.min(L, Math.max(...ts) + 0.05);
      if (!R.ouvA && !R.ouvB) console.warn('[rangs] %s : aucun bout ouvert', R.nom);
    }
    Player.rangs = rangs;
    return rangs;
  }
  // contre le bout ouvert d'un rang de son niveau, en poussant vers l'intérieur : il s'y faufile (rend vrai)
  _entrerRang(dir) {
    for (const R of Player.rangs) {
      if (Math.abs(R.sol - this.pos.y) > 0.3) continue;
      for (const b of [0, 1]) {
        if (!(b ? R.ouvB : R.ouvA)) continue;
        const s = b ? -1 : 1, ux = R.ux * s, uz = R.uz * s;          // vers l'intérieur du rang
        const ex = this.pos.x - (b ? R.bx : R.ax), ez = this.pos.z - (b ? R.bz : R.az);
        const le = ex * ux + ez * uz, tr = ez * ux - ex * uz;
        if (le < -0.12 || le > 0.3 || Math.abs(tr) > PRISE_RANG || dir.x * ux + dir.z * uz < 0.75) continue;
        const t = clamp(b ? R.L - le : le, R.t0, R.t1);
        // (l'écart à la ligne s'efface en un dixième de seconde : il glisse sur elle, sans saut)
        this.rang = { R, t, ox: this.pos.x - (R.ax + R.ux * t), oz: this.pos.z - (R.az + R.uz * t) };
        this.stopEmote();
        return true;
      }
    }
    return false;
  }
  _glisserRang(dir, dt) {
    const G = this.rang, R = G.R, moving = dir.lengthSq() > 0.001;
    let a = moving ? dir.x * R.ux + dir.z * R.uz : 0;
    if (moving && Math.abs(a) < 0.35) {
      // (en travers : vers le bout ouvert le plus proche)
      const dA = R.ouvA ? G.t - R.t0 : Infinity, dB = R.ouvB ? R.t1 - G.t : Infinity;
      a = dA <= dB ? -1 : 1;
    } else if (moving) a = Math.sign(a);
    // (la même inertie qu'en marchant : 0,13 s pour partir, 0,085 s pour s'arrêter)
    const v0 = this.vel.x * R.ux + this.vel.z * R.uz;
    let v = v0 + (a * VITESSE_RANG - v0) * (1 - Math.exp(-dt / (moving ? 0.13 : 0.085)));
    if (!moving && Math.abs(v) < 0.01) v = 0;
    G.t += v * dt;
    const kd = 1 - Math.exp(-dt / 0.1); G.ox -= G.ox * kd; G.oz -= G.oz * kd;
    if (G.t < R.t0) { if (R.ouvA) { this._sortirRang(R.ax, R.az, v); return; } G.t = R.t0; v = 0; }
    else if (G.t > R.t1) { if (R.ouvB) { this._sortirRang(R.bx, R.bz, v); return; } G.t = R.t1; v = 0; }
    this.pos.x = R.ax + R.ux * G.t + G.ox; this.pos.z = R.az + R.uz * G.t + G.oz;
    const C = Player.collisions;
    if (C) this.pos.y = C.solEn(this.pos.x, this.pos.z, this.pos.y);
    this.vel.set(R.ux * v, 0, R.uz * v);
    this.speedNow = Math.abs(v); this.sprinting = false; this.sprintVu = Math.max(0, this.sprintVu - dt);
    this.stamina = Math.min(100, this.stamina + 13 * dt);
    // (face à l'avant de la salle : le déplacement est de côté — l'échelle des pas chassés, _sensLoco)
    if (this.speedNow > 0.1) {
      const nx = this.vel.x / this.speedNow, nz = this.vel.z / this.speedNow, lat = nx * -this.facing.z + nz * this.facing.x;
      this.lateral = Math.abs(lat); this.lateralDir = Math.sign(lat);
      this.backward = -(nx * this.facing.x + nz * this.facing.z);
    } else { this.lateral = 0; this.backward = 0; this.sensLoco = 'av'; this.sensT = 0; }
    this.faceWant.set(R.fx, 0, R.fz);
    this.turnTo(this.faceWant, dt);
  }
  // sorti par le bout ouvert (x, z) : la marche reprend là, avec son élan
  _sortirRang(x, z, v) {
    const R = this.rang.R;
    this.rang = null;
    this.pos.x = x; this.pos.z = z;
    this.vel.set(R.ux * v, 0, R.uz * v);
    const C = Player.collisions;
    if (C) { C.resoudre(this.pos, RAYON_JOUEUR, this.vel, this.pos.y + this.jumpY); this.pos.y = C.solEn(this.pos.x, this.pos.z, this.pos.y); }
  }

  // ROTATION AVEC ÉLAN : la vitesse de rotation monte et redescend avec une accélération bornée. 13 rad/s jusqu'à 3 m/s,
  // 8,5 rad/s au-delà de 6 m/s (à pleine course, on plante le pied avant de repartir).
  turnTo(want, dt) {
    if (want.lengthSq() < 1e-6 || !(dt > 0)) return;
    const a = Math.atan2(this.facing.x, this.facing.z), b = Math.atan2(want.x, want.z);
    let e = b - a;
    while (e > Math.PI) e -= Math.PI * 2;
    while (e < -Math.PI) e += Math.PI * 2;
    this._aTourne = true;
    if (Math.abs(e) < 0.003 && Math.abs(this.omegaCap || 0) < 0.8) { this.facing.copy(want); this.omegaCap = 0; return; }
    const vit = Math.hypot(this.vel.x, this.vel.z);
    const vif = this.virageVif > 0;
    const wMax = vif ? 30 : this.airborne ? 6 : 13 - 4.5 * Math.min(1, Math.max(0, (vit - 3) / 3));
    const aMax = vif ? 2500 : 220;
    const wDes = Math.sign(e) * Math.min(wMax, Math.sqrt(1.8 * aMax * Math.abs(e)), Math.abs(e) / dt);
    const om = this.omegaCap || 0;
    this.omegaCap = om + Math.max(-aMax * dt, Math.min(aMax * dt, wDes - om));
    let pas = this.omegaCap * dt;
    if (pas * e > 0 && Math.abs(pas) > Math.abs(e)) { pas = e; this.omegaCap = e / dt; }
    const na = a + pas;
    this.facing.set(Math.sin(na), 0, Math.cos(na));
  }

  // 1 quand l'endurance est pleine, 0,78 quand elle est à zéro
  gasMul() { return 0.78 + 0.22 * Math.min(1, this.stamina / 55); }

  // Oriente d'un coup : cap courant ET cap visé.
  setFacing(x, z) {
    const n = Math.hypot(x, z);
    if (n < 1e-6) return;
    this.facing.set(x / n, 0, z / n); this.faceWant.copy(this.facing); this.omegaCap = 0;
  }
  // doux : cap visé, le joueur y pivote à son rythme ; sinon vite (un demi-tour en 0,1 s) ; `net` : d'un coup
  faceTo(target, doux = false, net = false) {
    const dx = target.x - this.pos.x, dz = target.z - this.pos.z;
    if (dx * dx + dz * dz <= 1e-4) return;
    this.faceWant.set(dx, 0, dz).normalize();
    if (net) { this.facing.copy(this.faceWant); this.omegaCap = 0; }
    else if (!doux) this.virageVif = 0.16;
  }

  // Le saut : rend la vitesse verticale RÉELLEMENT appliquée (la fatigue en retire)
  jump(v = 2.6) {
    if (this.airborne) return 0;
    this.airborne = true; this.sautId++;
    this.jumpVel = v * this.gasMul();
    return this.jumpVel;
  }

  // emote (roue) : seulement au sol ; annulée par tout mouvement (voir update et Game)
  startEmote(def) {
    if (this.airborne || this.assis) return false;
    this.emote = { ...def, t: 0 }; this.animKey = null;
    return true;
  }
  stopEmote() { if (this.emote) { this.emote = null; this.animKey = null; } }

  // ---------- poses procédurales ----------
  // (le bonhomme en primitives, et pour l'avatar : s'asseoir, le téléphone, les emotes « maison »)
  _pose() {
    const P = { ...REST };
    const t = this.animT, p = this.walkPhase, s = Math.sin(p), c = Math.cos(p);
    const moving = this.speedNow > 0.1, A = this.sprinting ? 1.0 : 0.72;

    // ================= ASSIS =================
    // Toute l'animation tient dans `assis.k`, qui monte de 0 à 1 en une demi-seconde (et redescend pour se relever) :
    // chaque articulation va de sa valeur DEBOUT à sa valeur ASSISE.
    if (this.assis) {
      const k = this.assis.k, e = k * k * (3 - 2 * k);
      const mx = (rest, assis) => rest + (assis - rest) * k;
      P.kL = mx(REST.kL, 1.56); P.kR = mx(REST.kR, 1.52);
      P.tL = mx(REST.tL, -1.46); P.tR = mx(REST.tR, -1.42);
      P.tLz = mx(REST.tLz, 0.15); P.tRz = mx(REST.tRz, -0.13);
      P.torsoX = mx(REST.torsoX, 0.16);
      P.headX = mx(REST.headX, -0.06 + 0.035 * Math.sin(t * 1.1));
      P.aL = mx(REST.aL, -0.10); P.aR = mx(REST.aR, -0.14);
      P.aLz = mx(REST.aLz, 0.09); P.aRz = mx(REST.aRz, -0.08);
      P.eL = mx(REST.eL, -1.08); P.eR = mx(REST.eR, -1.02);
      P.hL = mx(REST.hL, -0.10); P.hR = mx(REST.hR, -0.08);
      P.bob = this.assis.bob * e - 0.05 * Math.sin(Math.PI * k);
      this._poseTel(P);                                        // on peut aussi écrire assis
      return P;
    }
    if (!this.airborne) {
      if (moving) {
        // course : cuisses en opposition, genou fléchi pendant le passage avant, bras opposés
        P.tL = -s * A * 0.9; P.tR = s * A * 0.9;
        P.kL = 0.2 + 1.0 * Math.max(0, c) * A; P.kR = 0.2 + 1.0 * Math.max(0, -c) * A;
        P.bob = -Math.abs(c) * 0.03; P.torsoX = this.sprinting ? 0.25 : 0.12;
        P.aL = s * 0.8 * A; P.aR = -s * 0.8 * A; P.eL = -1.3; P.eR = -1.3;
      } else { P.bob = Math.sin(t * 1.8) * 0.008; P.kL = 0.12; P.kR = 0.12; }
    } else {
      // en l'air : bras qui accompagnent l'impulsion, genoux un peu groupés
      P.aL = -0.7; P.aR = -0.7; P.eL = -0.6; P.eR = -0.6; P.aLz = 0.3; P.aRz = -0.3; P.tL = -0.3; P.tR = -0.3; P.kL = 0.5; P.kR = 0.5;
    }
    if (this.emote) this._poseEmote(P);
    this._poseTel(P);
    return P;
  }
  // Les emotes sans clip (chorégraphies « maison », reprises de LA CAGE)
  _poseEmote(P) {
    const e = this.emote, tt = e.t, s = e.proc;
    if (s === 'dance') {
      const k = Math.sin(tt * 8), k2 = Math.sin(tt * 4);
      P.aL = -1.6 + 0.9 * k; P.aR = -1.6 - 0.9 * k; P.eL = -1.2; P.eR = -1.2; P.aLz = 0.6; P.aRz = -0.6;
      P.torsoY = 0.35 * k2; P.torsoX = 0.1; P.bob = Math.abs(Math.sin(tt * 8)) * 0.07;
      P.kL = 0.35 + 0.25 * Math.abs(k); P.kR = 0.35 + 0.25 * Math.abs(k); P.tL = -0.2; P.tR = -0.2;
    } else if (s === 'flap') {
      const k = Math.abs(Math.sin(tt * 9));
      P.aL = -0.3; P.aR = -0.3; P.aLz = 1.2 - 0.9 * k; P.aRz = -1.2 + 0.9 * k; P.eL = -2.4; P.eR = -2.4;
      P.bob = k * 0.05; P.kL = 0.5; P.kR = 0.5; P.tL = -0.25; P.tR = -0.25;
    } else if (s === 'arms') {
      const ph = Math.floor(tt * 1.5) % 4;
      P.aL = -3.0; P.aR = -3.0; P.aLz = [0.6, 0.15, 0.4, 0.15][ph]; P.aRz = [-0.6, -0.15, -0.4, -0.15][ph];
      P.eL = [-0.2, -0.3, -1.4, -0.9][ph]; P.eR = [-0.2, -0.3, -1.4, -0.9][ph]; P.bob = Math.abs(Math.sin(tt * 6)) * 0.04;
    } else if (s === 'clap') {
      const k = Math.abs(Math.sin(tt * 10));
      P.aL = -1.4; P.aR = -1.4; P.eL = -1.5; P.eR = -1.5; P.aLz = 0.5 - 0.45 * k; P.aRz = -0.5 + 0.45 * k;
    } else if (s === 'taunt') {
      const k = Math.sin(tt * 6);
      P.aL = -1.2; P.eL = -1.3; P.aLz = 0.4 + 0.3 * k; P.torsoX = -0.15; P.torsoY = 0.2 * k;
    } else if (s === 'muscles') {
      const k = Math.sin(tt * 3.4);
      P.aL = -1.55; P.aR = -1.55; P.aLz = 1.15; P.aRz = -1.15; P.eL = -2.5 - 0.15 * k; P.eR = -2.5 - 0.15 * k;
      P.torsoX = -0.12; P.torsoY = 0.18 * k; P.headX = -0.12; P.kL = 0.3; P.kR = 0.3; P.tL = -0.18; P.tR = -0.18;
      P.bob = -0.03 + 0.012 * Math.sin(tt * 6.8);
    } else if (s === 'robot') {
      const st4 = Math.floor(tt * 4) % 4, q = [0, 1, 0, -1][st4];
      P.aL = -1.5; P.aR = -1.5; P.aLz = 0.15; P.aRz = -0.15;
      P.eL = -1.5 - 0.9 * Math.max(0, q); P.eR = -1.5 + 0.9 * Math.min(0, q);
      P.torsoY = 0.28 * q; P.headX = 0.12 * q;
      P.kL = 0.25 + 0.2 * Math.max(0, q); P.kR = 0.25 + 0.2 * Math.max(0, -q); P.bob = -0.02;
    } else if (s === 'facepalm') {
      const k = Math.min(1, tt * 2.2), d = Math.min(1, Math.max(0, (tt - 0.5) * 1.6));
      P.aR = -2.55 * k; P.eR = -1.9 * k; P.aRz = -0.45 * k; P.hR = -0.4 * k;
      P.headX = 0.45 * d; P.torsoX = 0.22 * d; P.aL = -0.25; P.eL = -0.5; P.kL = 0.2; P.kR = 0.2;
    } else if (s === 'sleep') {
      const k = Math.sin(tt * 1.5), k2 = Math.sin(tt * 0.8);
      P.headX = 0.34 + 0.12 * k; P.torsoX = 0.16 + 0.05 * k2;
      P.aL = -0.12; P.aR = -0.12; P.eL = -0.35; P.eR = -0.35; P.aLz = 0.12; P.aRz = -0.12;
      P.kL = 0.22 + 0.06 * k2; P.kR = 0.22 + 0.06 * k2; P.bob = -0.02 + 0.02 * k2;
    } else if (s === 'moonwalk') {
      const k = Math.sin(tt * 5), a = Math.sin(tt * 5 + Math.PI);
      P.tL = -0.5 * k; P.tR = -0.5 * a;
      P.kL = 0.15 + 0.7 * Math.max(0, k); P.kR = 0.15 + 0.7 * Math.max(0, a);
      P.torsoX = 0.2; P.headX = -0.1;
      P.aL = 0.5 * a; P.aR = 0.5 * k; P.eL = -1.1; P.eR = -1.1; P.aLz = 0.3; P.aRz = -0.3;
      P.bob = -0.02 + Math.abs(k) * 0.02;
    } else if (s === 'pompes') {
      // LE GAINAGE : le corps reste droit comme une planche ; c'est le groupe entier qui bascule autour des pointes de
      // pieds (Couches.dynamique), et les mains sont plantées au sol par cinématique inverse (Couches.os).
      const k = Math.min(1, tt / 0.7);
      P.tL = 0; P.tR = 0; P.tLz = 0.02; P.tRz = 0.02; P.kL = 0.03; P.kR = 0.03;
      P.torsoX = 0; P.headX = -0.55 * k;
      P.aL = -1.45 * k; P.aR = -1.45 * k; P.aLz = 0.25 * k; P.aRz = -0.25 * k; P.eL = -0.1; P.eR = -0.1;
      P.bob = 0.10 * k;
    } else if (s === 'squat') {
      const c = 0.5 - 0.5 * Math.cos(tt * 3.6);
      P.kL = 0.15 + 1.20 * c; P.kR = 0.15 + 1.20 * c;
      P.tL = -0.10 - 0.75 * c; P.tR = -0.10 - 0.75 * c; P.tLz = 0.18; P.tRz = 0.18;
      P.torsoX = 0.08 + 0.34 * c; P.headX = -0.12 * c;
      P.aL = -0.10 - 1.45 * c; P.aR = -0.10 - 1.45 * c; P.eL = -0.25; P.eR = -0.25; P.aLz = 0.20; P.aRz = -0.20;
      P.bob = -0.24 * c;
    } else if (s === 'salut') {
      const up = Math.min(1, tt / 0.18), down = Math.min(1, Math.max(0, (tt - 1.5) / 0.35)), k = up * (1 - down);
      P.aR = -0.15 - 1.35 * k; P.aRz = -0.15 - 0.85 * k; P.eR = -0.30 - 2.05 * k; P.hR = -0.35 * k;
      P.aL = 0.05; P.aLz = 0.08; P.eL = -0.10;
      P.tLz = 0.06; P.tRz = 0.06; P.kL = 0.04; P.kR = 0.04; P.torsoX = -0.05; P.headX = -0.04; P.bob = 0.012 * k;
    } else if (s === 'telephone') {
      const m = Math.min(1, tt / 0.30), k = Math.sin(tt * 4.2);
      P.aR = -0.20 - 1.15 * m; P.aRz = -0.10 - 0.55 * m; P.eR = -0.30 - 2.00 * m; P.hR = -0.25 * m;
      P.aL = 0.25; P.aLz = 0.75; P.eL = -1.95;
      P.torsoY = 0.16 * k * m; P.headX = 0.06 + 0.05 * k; P.torsoX = -0.05; P.kL = 0.16; P.kR = 0.16;
    } else if (s === 'couronne') {
      const m = Math.min(1, tt / 0.55), d = Math.min(1, Math.max(0, (tt - 0.7) / 0.45));
      P.aL = -2.05 - 0.55 * m; P.aR = -2.05 - 0.55 * m;
      P.aLz = 0.55 - 0.30 * d; P.aRz = -0.55 + 0.30 * d;
      P.eL = -0.35 - 1.25 * d; P.eR = -0.35 - 1.25 * d; P.hL = -0.30 * d; P.hR = -0.30 * d;
      P.headX = -0.05 - 0.14 * d; P.torsoX = -0.06 * d; P.kL = 0.14; P.kR = 0.14; P.bob = 0.015 * d;
    } else if (s === 'croise') {
      const k = Math.sin(tt * 1.6);
      P.aL = -1.40; P.aR = -1.32; P.aLz = -0.62; P.aRz = 0.50;
      P.eL = -2.45; P.eR = -2.60; P.hL = -0.20; P.hR = -0.20;
      P.torsoX = -0.06; P.torsoY = 0.07 * k; P.headX = -0.10;
      P.tLz = 0.12; P.kL = 0.10; P.kR = 0.26; P.bob = -0.02;
    } else if (s === 'pointer') {
      const m = Math.min(1, tt / 0.22), k = Math.sin(tt * 5.5);
      P.aR = -0.20 - 1.42 * m; P.aRz = -0.18 + 0.06 * k; P.eR = -0.12; P.hR = -0.12;
      P.aL = 0.10; P.aLz = 0.35; P.eL = -0.80;
      P.torsoX = -0.04 + 0.05 * Math.max(0, k); P.headX = 0.05 + 0.07 * k; P.kL = 0.14; P.kR = 0.14;
    } else if (s === 'chrono') {
      const m = Math.min(1, tt / 0.25), tap = Math.max(0, Math.sin(tt * 7.5));
      P.aL = -0.55 * m; P.aLz = -0.50 * m; P.eL = -2.15 * m; P.hL = -0.50 * m;
      P.aR = -0.50 * m; P.aRz = 0.42 * m; P.eR = (-1.75 - 0.35 * tap) * m; P.hR = -0.30 * m;
      P.torsoX = 0.07 * m; P.headX = 0.22 * m; P.kL = 0.12; P.kR = 0.12;
    } else if (s === 'epaule') {
      const m = Math.min(1, tt / 0.25), sw = Math.sin(tt * 3.6);
      P.aR = (-1.25 - 0.35 * sw) * m; P.aRz = (0.82 - 0.42 * sw) * m; P.eR = (-1.95 + 0.25 * sw) * m; P.hR = -0.25 * m;
      P.aL = -0.18; P.aLz = 0.30; P.eL = -0.55;
      P.torsoY = -0.12 * m; P.headX = -0.13 * m; P.torsoX = -0.05; P.kL = 0.12; P.kR = 0.12;
    } else if (s === 'troppetit') {
      const m = Math.min(1, tt / 0.25), k = Math.sin(tt * 6);
      P.aR = (-0.42 + 0.06 * k) * m; P.aRz = -0.95 * m; P.eR = -1.52 * m; P.hR = (-1.10 + 0.15 * k) * m;
      P.aL = 0.15; P.aLz = 0.60; P.eL = -1.85;
      P.torsoY = -0.14 * m; P.headX = -0.14 * m; P.torsoX = -0.04; P.kL = 0.12; P.kR = 0.12;
    } else if (s === 'nonnon') {
      const m = Math.min(1, tt / 0.20), k = Math.sin(tt * 6.5);
      P.aR = -1.05 * m; P.aRz = (-0.32 + 0.45 * k) * m; P.eR = -1.50 * m; P.hR = -0.15 * m;
      P.aL = 0.12; P.aLz = 0.45; P.eL = -1.70;
      P.torsoY = 0.10 * k * m; P.headX = -0.08; P.kL = 0.12; P.kR = 0.12;
    } else if (s === 'shimmy') {
      const k = Math.sin(tt * 11), k2 = Math.sin(tt * 2.2);
      P.torsoY = 0.30 * k; P.torsoX = -0.06;
      P.aL = -0.85 + 0.25 * k; P.aR = -0.85 - 0.25 * k; P.aLz = 0.75; P.aRz = -0.75; P.eL = -1.50; P.eR = -1.50;
      P.headX = -0.06 + 0.04 * k2;
      P.kL = 0.30 + 0.08 * k2; P.kR = 0.30 - 0.08 * k2; P.tL = -0.12; P.tR = -0.12; P.bob = -0.05;
    } else if (s === 'mainor') {
      // tir imaginaire, poignet cassé en l'air : le suivi classique
      const arm = Math.min(1, tt / 0.35), rel = Math.min(1, Math.max(0, (tt - 0.45) / 0.22));
      P.aR = -0.90 * arm - 1.95 * rel; P.eR = -2.30 * arm + 2.15 * rel; P.hR = -0.35 * arm + 0.95 * rel; P.aRz = -0.20;
      P.aL = -1.25 * arm + 0.35 * rel; P.eL = -1.70 * arm + 0.60 * rel; P.aLz = 0.35;
      P.kL = 0.50 - 0.35 * rel; P.kR = 0.50 - 0.35 * rel; P.tL = -0.35 + 0.25 * rel; P.tR = -0.35 + 0.25 * rel;
      P.torsoX = 0.14 - 0.16 * rel; P.headX = -0.18 * rel; P.bob = -0.09 + 0.09 * rel;
    } else if (s === 'lacets') {
      const k = Math.min(1, tt * 2.4), w = Math.sin(tt * 7.0) * 0.12 * k;
      P.bob = -0.20 * k; P.torsoX = 0.72 * k; P.headX = 0.38 * k;
      P.tL = -1.45 * k; P.kL = 1.85 * k; P.tR = -0.30 * k; P.kR = 1.45 * k;
      P.aL = -0.95 * k + w; P.aR = -0.95 * k - w; P.eL = -1.55 * k; P.eR = -1.55 * k;
    } else if (s === 'etirement') {
      const ph = Math.floor(tt / 1.6) % 2, k = Math.min(1, (tt % 1.6) / 0.35);
      if (ph === 0) { P.aL = -1.50; P.aLz = -0.95 * k; P.eL = -0.15; P.aR = -1.35; P.aRz = 0.55 * k; P.eR = -0.30 - 1.55 * k; P.torsoY = -0.12 * k; }
      else { P.aR = -1.50; P.aRz = 0.95 * k; P.eR = -0.15; P.aL = -1.35; P.aLz = -0.55 * k; P.eL = -0.30 - 1.55 * k; P.torsoY = 0.12 * k; }
      P.headX = -0.05; P.kL = 0.14; P.kR = 0.14; P.bob = -0.01;
    } else {
      const k = Math.sin(tt * 10);
      P.aL = -2.6 + k * 0.2; P.aR = -2.6 - k * 0.2; P.eL = -0.5; P.eR = -0.5; P.aLz = 0.5; P.aRz = -0.5; P.bob = Math.abs(Math.sin(tt * 8)) * 0.06;
    }
  }

  update(dt) {
    // Les couches du pas précédent (regard, respiration...) sont retirées AVANT tout le reste : le mélangeur ne doit
    // jamais les voir (voir AvatarRig.couchesAnnuler)
    if (this.avatar) { this.avatar.couchesAnnuler(Couches.OS); this.avatar.surAnnuler(); }
    if (this.airborne) {
      this.jumpVel -= G * dt; this.jumpY += this.jumpVel * dt;
      if (this.jumpY <= 0) { this.landT = Math.min(0.28, 0.07 + Math.abs(this.jumpVel) * 0.04); this.jumpVelSol = this.jumpVel; this.jumpY = 0; this.jumpVel = 0; this.airborne = false; }
    }
    if (this.landT > 0) this.landT -= dt;
    if (this.emote) {
      const e = this.emote; e.t += dt;
      const clipDone = !e.loop && this.anim && this.anim.has(e.clip) && this.animKey && this.animKey.startsWith(e.clip) && this.anim.finished;
      const procDone = !e.loop && !(this.anim && this.anim.has(e.clip)) && e.t > 3;
      if (this.airborne || (this.speedNow > 0.1 && e.t > 0.3) || e.t > 14 || clipDone || procDone) this.stopEmote();
    }
    // virage vif (faceTo) : si personne n'a fait tourner le joueur à ce pas, on le fait ici
    if (this.virageVif > 0) { this.virageVif -= dt; if (!this._aTourne) this.turnTo(this.faceWant, dt); }
    this._aTourne = false;
    if (this.tel) {
      const T = this.tel;
      T.t += dt; T.tape = Math.max(0, T.tape - dt);
      // pour écrire, on prend le téléphone À DEUX MAINS ; on relâche la gauche une demi-seconde après la dernière touche
      T.deux = Math.max(0, Math.min(1, (T.deux || 0) + (T.tape > 0 ? dt / 0.22 : -dt / 0.5)));
      T.k = Math.max(0, Math.min(1, T.k + (T.sortir ? -dt / 0.35 : dt / 0.45)));
      if (T.sortir && T.k <= 0) this.tel = null;
    }

    // ---- animation ----
    this.animT += dt;
    this.walkPhase += dt * (this.speedNow > 0.1 ? 3.0 + this.speedNow * 1.6 : 0);
    // ASSIS : le coefficient monte en une demi-seconde, redescend en quatre dixièmes pour se relever, et la position
    // suit la même courbe
    if (this.assis) {
      const S = this.assis;
      S.k = Math.max(0, Math.min(1, S.k + (S.sortir ? -dt / 0.40 : dt / 0.50)));
      const e = S.k * S.k * (3 - S.k * 2);
      this.pos.x = S.de.x + (S.a.x - S.de.x) * e;
      this.pos.z = S.de.z + (S.a.z - S.de.z) * e;
      if (S.sortir && S.k <= 0) this.assis = null;
    }
    const P = this._pose(), k = damp(16, dt), cur = this.cur;
    for (const key in P) cur[key] = lerp(cur[key], P[key], k);
    let clipDriven = false;
    if (this.avatar && this.anim) clipDriven = this._driveAnim(dt);
    if (!clipDriven) this._poseDeBase();
    // avec un clip, le saut est déjà dans la translation des hanches
    this.yAff = clipDriven ? 0 : this.jumpY + cur.bob;
    // FONDU DE POSE : d'un clip à la pose procédurale ou l'inverse, on glisse en 0,16 s depuis la dernière pose affichée
    if (this.avatar) {
      const A = this.anim;
      if (this._clipAvant !== undefined && (clipDriven !== this._clipAvant || (A && A.coupe))) {
        this.avatar.fonduDepuis(0.16, (this._yAffAvant - this.yAff) / (this.avatarScale || 1));
      }
      if (A) A.coupe = false;
      this.avatar.fonduAppliquer(dt);
      this._clipAvant = clipDriven; this._yAffAvant = this.yAff;
    }
    this.ang = Math.atan2(this.facing.x, this.facing.z);
    // le corps penche (virages, accélérations) : tangage et roulis du groupe entier, voir js/couches.js
    this.couches.dynamique(dt);
    this._poserSol(dt, clipDriven);
    this.solAff = this.pos.y;
    this.posAff.set(this.pos.x, this.pos.y + this.yAff, this.pos.z);
    this.mesh.position.copy(this.posAff);
    this.mesh.rotation.set(this.couches.tangage, this.ang, this.couches.roulis);
    this.mesh.updateMatrixWorld(true);
    // regard, respiration, essoufflement, petits pas, appuis : par-dessus la pose du pas
    if (this.avatar) { this.avatar.surFin(); this.couches.os(dt); this.mesh.updateMatrixWorld(true); }
  }

  // La pose procédurale du pas (avatar ou bonhomme en primitives), sans clip.
  _poseDeBase() {
    const cur = this.cur;
    if (this.avatar) { this.avatar.apply(cur); return; }
    const r = this.rig;
    r.thighL.rotation.set(cur.tL, 0, cur.tLz); r.thighR.rotation.set(cur.tR, 0, -cur.tRz);
    r.kneeL.rotation.x = cur.kL; r.kneeR.rotation.x = cur.kR;
    r.armL.rotation.set(cur.aL, cur.aLy || 0, cur.aLz); r.armR.rotation.set(cur.aR, cur.aRy || 0, cur.aRz);
    r.elbowL.rotation.x = cur.eL; r.elbowR.rotation.x = cur.eR;
    r.handL.rotation.x = cur.hL; r.handR.rotation.x = cur.hR;
    r.torso.rotation.x = cur.torsoX; r.head.rotation.x = cur.headX;
  }
}

// Le monde solide de la carte (js/collisions.js), posé par js/game.js : propriété de CLASSE, comme les obstacles de LA CAGE.
Player.collisions = null;
// Les rangs serrés de la carte (Player.poserRangs, appelé par js/game.js) : où l'on se faufile jusqu'à sa place.
Player.rangs = [];
// Vrai sur le DERNIER pas de simulation avant une image (les couches ne posent leur IK que là : js/couches.js).
Player.poseVisible = true;
// Prépare le rendu d'un avatar qui arrive (programmes compilés en parallèle) : posé par js/game.js.
Player.preparerRendu = null;
