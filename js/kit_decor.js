// =====================================================================
//  LA BOÎTE À OUTILS DU DÉCOR (IRIS)
// =====================================================================
// Ce que les constructeurs de carte (js/carte_ecole.js, et les cartes de l'école à venir) réutilisent, repris de
// js/court.js de LA CAGE — le reste de ce fichier (les terrains de basket) n'existe plus dans IRIS :
//   - TEXTURES dessinées en code (canvasTex, allégées de moitié au téléphone), répétées à l'échelle d'un objet (tiled),
//     leur relief tiré d'une grille dessinée (normalesDepuisGrille, avecRelief), le grain d'une photo multiplié dans la
//     couleur (poserGrain) et le détail photographique du béton (detailPhoto : normales, rugosité, grain ; Poly Haven,
//     CC0, assets/tex/beton_*) ;
//   - LA CARTE D'ENVIRONNEMENT PRISE SUR PLACE (carteLocale) : le décor photographié en cube depuis un point de la carte,
//     filtré en PMREM — la lumière qui rebondit des murs et du sol, et les reflets ; et sa SONDE de neuf coefficients
//     pour la basse, la moyenne sans carte et le téléphone (poserSondeLocale, js/sonde_ciel.js) ;
//   - L'OMBRE DOUCE CUITE AU SOL (planifierOcclusionSol) : le pied des murs, des meubles et des piliers, calculé une
//     fois quand le décor a fini d'arriver ; et le plan des OMBRES DE CONTACT (js/ombres_contact.js) qui l'accompagne ;
//   - L'OPTIMISATION du décor (optimiserDecor) : matériaux identiques fusionnés, géométries statiques cousues par
//     matériau — une école, ce sont des centaines de boîtes ;
//   - LES FEUILLAGES au vent (windify, transmissionSoleil, animerVent) : pour les plantes de l'entrée.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { sondeCiel } from './sonde_ciel.js';
import { TELEPHONE } from './appareil.js';

const MOBILE = TELEPHONE;     // (js/appareil.js : la même détection pour tout le jeu, `?tel=1` compris)
export const rnd = (a, b) => a + Math.random() * (b - a);

// =====================================================================
//  TEXTURES
// =====================================================================
// Une texture dessinée sur un canevas. SUR TÉLÉPHONE, le bitmap final est réduit de moitié (pas la surface de dessin :
// les dessins tracent en coordonnées fixes) — c'est la mémoire vidéo d'un téléphone qui décide.
export function canvasTex(w, h, draw, repeat, transparent = false, aniso = 8) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (transparent) g.clearRect(0, 0, w, h);
  draw(g, w, h);
  let src = c;
  if (MOBILE && Math.max(w, h) > 256) {
    const d = document.createElement('canvas');
    d.width = Math.max(1, Math.round(w / 2)); d.height = Math.max(1, Math.round(h / 2));
    d.getContext('2d').drawImage(c, 0, 0, d.width, d.height);
    src = d;
  }
  const t = new THREE.CanvasTexture(src);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.anisotropy = aniso;
  return t;
}
// clone d'une texture répétée, adapté aux dimensions d'un objet (1 tuile = `tile` m)
export function tiled(tex, w, h, tile) { const t = tex.clone(); t.repeat.set(w / tile, h / tile); t.needsUpdate = true; return t; }

// Le relief d'un motif dessiné sur une grille FIXE (carrelage, dalles de plafond, briques) : la même grille retracée
// en carte de hauteur — carreau en saillie, joint en creux, arêtes adoucies par un flou — puis en normales. Le relief
// tombe pile sur les joints dessinés. `tuile(g, w, h)` dessine UNE tuile en blanc sur noir (répétée autour avant le
// flou, sinon le flou creuserait un faux joint au bord de la tuile).
export function normalesDepuisGrille(w, h, tuile, force, flou) {
  const p = Math.ceil(flou * 3), c = document.createElement('canvas'); c.width = w + 2 * p; c.height = h + 2 * p;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  g.filter = `blur(${flou}px)`;
  const t = document.createElement('canvas'); t.width = w; t.height = h;
  const tg = t.getContext('2d'); tg.fillStyle = '#000'; tg.fillRect(0, 0, w, h); tg.fillStyle = '#fff'; tuile(tg, w, h);
  for (const dy of [-h, 0, h]) for (const dx of [-w, 0, w]) g.drawImage(t, p + dx, p + dy);
  g.filter = 'none';
  const src = g.getImageData(p, p, w, h).data, H = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) H[i] = src[i * 4] / 255;
  const at = (x, y) => H[((y + h) % h) * w + ((x + w) % w)];
  const out = tg.createImageData(w, h), o = out.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // l'axe y du canevas descend alors que v monte dans la texture : la pente en y change de signe
    const nx = -(at(x + 1, y) - at(x - 1, y)) * force, ny = (at(x, y + 1) - at(x, y - 1)) * force, l = Math.hypot(nx, ny, 1);
    const k = (y * w + x) * 4;
    o[k] = (nx / l * 0.5 + 0.5) * 255; o[k + 1] = (ny / l * 0.5 + 0.5) * 255; o[k + 2] = (1 / l * 0.5 + 0.5) * 255; o[k + 3] = 255;
  }
  tg.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(t);
  tex.colorSpace = THREE.NoColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
  return tex;
}
// normale clonée avec la répétition de la couleur qu'elle accompagne
export function avecRelief(mat, normales, force = 1) {
  const n = normales.clone(); n.repeat.copy(mat.map.repeat); n.offset.copy(mat.map.offset); n.needsUpdate = true;
  mat.normalMap = n; mat.normalScale.set(force, force);
  return mat;
}

// LE GRAIN d'une photo MULTIPLIÉ dans la couleur, sur un matériau qui a DÉJÀ une `map` : injecté juste après
// <map_fragment>, donc avant tout le bloc PBR (le grain reçoit l'éclairage comme le reste). Centré sur le gris moyen :
// les teintes dessinées ne bougent pas, la matière gagne son grain. Clé de programme CONSTANTE (tout passe par les
// uniformes), sinon three réutiliserait le premier programme compilé pour tous.
export function poserGrain(mat, tex, tuileM, largeurM, longueurM, force = 0.5) {
  const u = {
    uGrain: { value: tex },
    uGrainRep: { value: new THREE.Vector2(largeurM / tuileM, longueurM / tuileM) },
    uGrainForce: { value: force },
  };
  mat.__grain = u;                    // (jamais dans userData : Material.copy le passerait au JSON)
  mat.onBeforeCompile = (sh) => {
    for (const k in u) sh.uniforms[k] = u[k];
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uGrain;\nuniform vec2 uGrainRep;\nuniform float uGrainForce;')
      .replace('#include <map_fragment>', '#include <map_fragment>\n{\n  float gr = texture2D(uGrain, vMapUv * uGrainRep).r;\n'
        + '  diffuseColor.rgb *= 1.0 + (gr - 0.5) * 2.0 * uGrainForce;\n}');
  };
  mat.customProgramCacheKey = () => 'iris-grain-1';
  mat.needsUpdate = true;
  return u;
}

// LE DÉTAIL PHOTOGRAPHIQUE (Poly Haven, CC0), posé PAR-DESSUS une texture dessinée : le relief (normales), la brillance
// qui varie (rugosité) et le grain de la couleur. Une tuile = la surface réelle photographiée (3 m pour le béton).
// Téléphones : versions 1k. Si les fichiers manquent, rien ne change. Les trois images sont chargées UNE fois par
// photo, puis clonées par matériau (même image en mémoire, répétition propre à chacun).
const PHOTOS = { beton: { fichier: 'assets/tex/beton', tuile: 3.0 } };
const _photos = {};
function chargerPhoto(cle) {
  if (!_photos[cle]) {
    const D = PHOTOS[cle], suffixe = MOBILE ? '_1k' : '';
    const charger = (url) => new Promise((ok, ko) => new THREE.TextureLoader().load(url, ok, undefined, ko));
    _photos[cle] = Promise.all(['normal', 'rugo', 'grain'].map((n) => charger(`${D.fichier}_${n}${suffixe}.jpg`))).then((l) => {
      for (const t of l) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; }
      return l;
    });
  }
  return _photos[cle];
}
// `w`, `h` : la taille de la surface (m) ; `relief` : force des normales (0 = pas de normales) ; `grain` : force du grain ;
// `rugo` : false pour garder la rugosité uniforme (un sol ciré, une peinture satinée)
export function detailPhoto(mat, cle, w, h, { relief = 0.6, grain = 0.25, rugo = true } = {}) {
  const D = PHOTOS[cle];
  if (!D) return Promise.resolve(mat);
  return chargerPhoto(cle).then(([nor, rug, gra]) => {
    const rx = w / D.tuile, ry = h / D.tuile;
    if (relief > 0) { mat.normalMap = nor.clone(); mat.normalMap.repeat.set(rx, ry); mat.normalScale.set(relief, relief); mat.normalMap.needsUpdate = true; }
    if (rugo) { mat.roughnessMap = rug.clone(); mat.roughnessMap.repeat.set(rx, ry); mat.roughnessMap.needsUpdate = true; }
    if (grain > 0 && mat.map) {
      const rep = mat.map.repeat;
      poserGrain(mat, gra, 1, rx / rep.x, ry / rep.y, grain);
    }
    mat.needsUpdate = true;
    return mat;
  }).catch((e) => { console.warn('[décor] détail photo non chargé (' + cle + ')', e && e.message); return mat; });
}

// =====================================================================
//  LA CARTE D'ENVIRONNEMENT PRISE SUR PLACE
// =====================================================================
// Le décor PHOTOGRAPHIÉ en cube depuis un point de la carte (scene.userData.pointEnv, sinon le centre du plan des
// ombres de contact à 1,60 m) : un cube de 256 px (128 au téléphone), une face par image pour ne pas faire d'à-coup,
// puis filtré en PMREM DANS la cible de la carte d'attente (même taille : aucun matériau à recompiler). À l'intérieur,
// c'est elle qui fait la lumière qui REBONDIT : le blanc des murs, le jaune du mur d'accent, le gris du carrelage.
// On ne photographie que le FIXE (le joueur, la pluie, les sprites exclus). Refaite quand le décor a fini d'arriver
// (planifierOcclusionSol) et quand la météo a changé (js/weather.js). Même interface que celle de LA CAGE : js/fx.js
// setEnv la charge (`charger`) et la fait avancer (`avancer`).
// Sa SONDE (32 px, neuf coefficients, lue sans attendre la carte graphique) sert là où la carte est éteinte.
const FACE_ENV = MOBILE ? 128 : 256;
const FACE_SONDE = 32;
function rendreFace(renderer, scene, cube, cam, f) {
  const caches = [];
  for (const o of scene.children) if (o.visible && (o.userData.dynamique || o.isPoints || o.isSprite || o.isReflector)) { o.visible = false; caches.push(o); }
  const auto = renderer.shadowMap.autoUpdate, avant = renderer.getRenderTarget();
  renderer.shadowMap.autoUpdate = false;              // la carte d'ombre de l'image précédente suffit
  renderer.setRenderTarget(cube, f); renderer.render(scene, cam.children[f]);
  renderer.setRenderTarget(avant); renderer.shadowMap.autoUpdate = auto;
  for (const o of caches) o.visible = true;
}
function pointEnv(scene) {
  const p = scene.userData.pointEnv;
  if (p) return p;
  const S = scene.userData.solContact || { cx: 0, cz: 0 };
  return { x: S.cx, y: 1.6, z: S.cz };
}
export function carteLocale(scene, attente = ['#e9e5dc', '#f3efe6', '#7a7670', '#4a4743']) {
  const t = { carte: null, sortie: null, pmrem: null, r: null, cube: null, cam: null, f: -1, envPret: false,
    garder: false, fs: -1, cubeS: null, camS: null, lecture: false, sh: null, versionSonde: 0, _sonde: null, _sondeOk: null,
    charger(renderer) {
      t.r = renderer;
      if (!t.carte) {
        // l'attente : un dégradé plafond / sol À LA BONNE TAILLE (4 x la face), le temps de la première capture
        const c = document.createElement('canvas'); c.width = FACE_ENV * 4; c.height = FACE_ENV * 2;
        const g = c.getContext('2d'), d = g.createLinearGradient(0, 0, 0, c.height);
        d.addColorStop(0, attente[0]); d.addColorStop(0.5, attente[1]); d.addColorStop(0.52, attente[2]); d.addColorStop(1, attente[3]);
        g.fillStyle = d; g.fillRect(0, 0, c.width, c.height);
        const tex = new THREE.CanvasTexture(c); tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace;
        t.pmrem = new THREE.PMREMGenerator(renderer);      // gardé : ses cibles resservent à chaque capture
        t.sortie = t.pmrem.fromEquirectangular(tex); t.carte = t.sortie.texture; tex.dispose();
      }
      if (!t.envPret) t.capturer(renderer);
      return t.carte;
    },
    capturer(renderer) { t.r = renderer || t.r; if (t.r) t.f = 0; if (t._sonde) t.fs = 0; },
    sonde() {
      if (!t._sonde) t._sonde = new Promise((ok) => { t._sondeOk = ok; });
      if (!t.sh && t.fs < 0 && !t.lecture) t.fs = 0;
      return t._sonde;
    },
    // appelé à chaque image par js/fx.js render : UNE face par image en tout (la sonde d'abord, puis la carte)
    avancer(renderer) {
      if (t.fs >= 0 && !t.lecture) { avancerSonde(renderer); return; }
      if (t.f < 0) return;
      if (t.garder && !t.carte && renderer) t.charger(renderer);
      if (!t.carte || (scene.environment !== t.carte && !t.garder)) { t.f = -1; return; }     // environnement éteint
      if (t.f === 0) {
        if (!t.cube) {
          const hf = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
          t.cube = new THREE.WebGLCubeRenderTarget(FACE_ENV, { type: hf ? THREE.HalfFloatType : THREE.UnsignedByteType, generateMipmaps: false });
          t.cam = new THREE.CubeCamera(0.05, 300, t.cube);
          t.cam.coordinateSystem = renderer.coordinateSystem; t.cam.updateCoordinateSystem();
        }
        const P = pointEnv(scene);
        t.cam.position.set(P.x, P.y, P.z); t.cam.updateMatrixWorld(true);
      }
      rendreFace(renderer, scene, t.cube, t.cam, t.f);
      if (++t.f < 6) return;
      t.f = -1;
      t.pmrem.fromCubemap(t.cube.texture, t.sortie);                // réécrite EN PLACE
      t.envPret = true;
    } };
  const avancerSonde = (renderer) => {
    if (!t.cubeS) {
      const hf = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
      t.cubeS = new THREE.WebGLCubeRenderTarget(FACE_SONDE, { type: hf ? THREE.HalfFloatType : THREE.UnsignedByteType, generateMipmaps: false });
      t.camS = new THREE.CubeCamera(0.05, 300, t.cubeS);
      t.camS.coordinateSystem = renderer.coordinateSystem; t.camS.updateCoordinateSystem();
    }
    if (t.fs === 0) {
      const P = pointEnv(scene);
      t.camS.position.set(P.x, P.y, P.z); t.camS.updateMatrixWorld(true);
    }
    rendreFace(renderer, scene, t.cubeS, t.camS, t.fs);
    if (++t.fs < 6) return;
    t.fs = -1; t.lecture = true;
    harmoniquesCube(renderer, t.cubeS)
      .then((sh) => {
        t.sh = sh; t.versionSonde++; t.lecture = false;
        if (t._sondeOk) { t._sondeOk(sh); t._sondeOk = null; }
      })
      .catch((e) => { t.lecture = false; console.warn('[décor] sonde de lumière non lue :', e && e.message); });
  };
  return t;
}
// LES NEUF COEFFICIENTS D'UN CUBE RENDU, LUS SANS ATTENDRE LA PUCE : les six faces partent dans des tampons de lecture
// (PBO), une barrière, puis on revient les chercher quand la puce a fini — jamais de lecture synchrone qui arrêterait
// l'image. Le calcul est celui de LightProbeGenerator de three (chaque texel pondéré par son angle solide).
async function harmoniquesCube(renderer, rt) {
  const gl = renderer.getContext(), n = rt.width, demi = rt.texture.type === THREE.HalfFloatType;
  const avant = renderer.getRenderTarget(), faceAv = renderer.getActiveCubeFace(), mipAv = renderer.getActiveMipmapLevel();
  const tampons = [];
  for (let f = 0; f < 6; f++) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, b);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, n * n * 4 * (demi ? 2 : 1), gl.STREAM_READ);
    renderer.setRenderTarget(rt, f);
    gl.readPixels(0, 0, n, n, gl.RGBA, demi ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    tampons.push(b);
  }
  renderer.setRenderTarget(avant, faceAv, mipAv);
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0); gl.flush();
  for (let k = 0; k < 1000; k++) {
    const e = gl.clientWaitSync(sync, 0, 0);
    if (e === gl.ALREADY_SIGNALED || e === gl.CONDITION_SATISFIED || e === gl.WAIT_FAILED) break;
    await new Promise((r) => setTimeout(r, 4));
  }
  gl.deleteSync(sync);
  const flip = renderer.coordinateSystem === THREE.WebGLCoordinateSystem ? -1 : 1, px = 2 / n;
  const sh = new THREE.SphericalHarmonics3(), c = sh.coefficients, base = new Array(9).fill(0);
  const coord = new THREE.Vector3(), data = demi ? new Uint16Array(n * n * 4) : new Uint8Array(n * n * 4), de = THREE.DataUtils.fromHalfFloat;
  let total = 0;
  for (let f = 0; f < 6; f++) {
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, tampons[f]);
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, data);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    gl.deleteBuffer(tampons[f]);
    for (let i = 0; i < data.length; i += 4) {
      const r = demi ? de(data[i]) : data[i] / 255, v = demi ? de(data[i + 1]) : data[i + 1] / 255, bl = demi ? de(data[i + 2]) : data[i + 2] / 255;
      const p = i / 4, col = (1 - (p % n + 0.5) * px) * flip, row = 1 - (Math.floor(p / n) + 0.5) * px;
      switch (f) {
        case 0: coord.set(-1 * flip, row, col * flip); break;
        case 1: coord.set(1 * flip, row, -col * flip); break;
        case 2: coord.set(col, 1, -row); break;
        case 3: coord.set(col, -1, row); break;
        case 4: coord.set(col, row, 1); break;
        default: coord.set(-col, row, -1);
      }
      const l2 = coord.lengthSq(), w = 4 / (Math.sqrt(l2) * l2);
      total += w;
      THREE.SphericalHarmonics3.getBasisAt(coord.normalize(), base);
      for (let j = 0; j < 9; j++) { c[j].x += base[j] * r * w; c[j].y += base[j] * v * w; c[j].z += base[j] * bl * w; }
    }
  }
  const k = 4 * Math.PI / total;
  for (const v of c) v.multiplyScalar(k);
  return sh;
}

// La sonde de lumière de la carte (js/sonde_ciel.js) : js/fx.js l'allume là où la carte d'environnement est éteinte,
// js/weather.js lui donne l'intensité de la carte multipliée par `gain` (la part de lumière que la carte donnait en
// reflets aux surfaces mates). `gainTel` au téléphone.
export function poserSondeLocale(scene, gain = 1.3, gainTel = 1.2) {
  scene.userData.sondeCiel = sondeCiel(scene, scene.userData.envTerrain);
  scene.userData.gainSonde = TELEPHONE ? gainTel : gain;
}

// =====================================================================
//  L'OMBRE DOUCE CUITE AU SOL (occlusion ambiante « cuite »)
// =====================================================================
// Au pied d'un mur, d'un comptoir, d'un pilier, le sol voit moins de lumière qu'au milieu d'une pièce. GTAO le calcule à
// l'écran, mais seulement à partir de « haute » et seulement pour ce qui est dans l'image. Ici on le calcule pour tout
// le décor FIXE, une fois au chargement : une carte des hauteurs vue de dessus, puis pour chaque texel du sol l'horizon
// dans 16 directions — le ciel masqué vaut sin² de l'élévation de l'horizon. Le résultat devient l'aoMap du sol (`sol`) :
// il n'assombrit que la lumière indirecte (hémisphère, carte, sonde), jamais la lumière directe.
// PORTE-À-FAUX : la scène est aussi rendue par en dessous ; n'est un obstacle que ce qui part du sol (un pied de table,
// un mur) — pas un plateau, un néon, une étagère murale.
// À L'INTÉRIEUR : les PLAFONDS (et tout objet marqué `userData.horsAOSol`) sont cachés pendant la cuisson — vus de dessus,
// ils recouvriraient tout et il n'y aurait plus d'horizon nulle part.
// `sol` : un maillage plan posé à y = 0, sur un PlaneGeometry de `W` x `L` centré en (cx, cz), UV de 0 à 1.
const AO_SOL = { rayon: 2.2, marge: 2.4, texelsParMetre: 32, intensite: 0.85, pied: 0.35, pas: 12 };
function cuireOcclusionSol(scene, renderer, sol, W, L, o = {}) {
  const A = { ...AO_SOL, ...(scene.userData.occlusionSol || {}) };
  A.marge = Math.max(A.marge, A.rayon);
  const WH = W + 2 * A.marge, LH = L + 2 * A.marge;
  const CX = o.cx ?? sol.position.x, CZ = o.cz ?? sol.position.z;
  const echelle = MOBILE ? 0.5 : 1;
  // (une très grande carte — toute l'école — garde des cibles raisonnables : 4096 texels au plus de côté)
  const tpm = Math.min(A.texelsParMetre * echelle, 4096 / Math.max(WH, LH));
  const hw = Math.round(WH * tpm), hh = Math.round(LH * tpm);
  const aw = Math.round(W * tpm), ah = Math.round(L * tpm);
  const cible = () => new THREE.WebGLRenderTarget(hw, hh, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true });
  const cibleHaut = cible(), cibleBas = cible();
  const hauteur = new THREE.ShaderMaterial({
    vertexShader: `#include <common>
      varying float vH;
      void main() {
        #include <begin_vertex>
        vec4 wp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
        #endif
        vH = (modelMatrix * wp).y;
        #include <project_vertex>
      }`,
    fragmentShader: 'varying float vH; void main() { gl_FragColor = vec4(vH, 0.0, 0.0, 1.0); }',
    side: THREE.DoubleSide,
  });
  const camHaut = new THREE.OrthographicCamera(-WH / 2, WH / 2, LH / 2, -LH / 2, 0.1, 200);
  camHaut.position.set(CX, 100, CZ); camHaut.up.set(0, 0, -1); camHaut.lookAt(CX, 0, CZ); camHaut.updateMatrixWorld();
  const camBas = camHaut.clone();
  camBas.position.set(CX, -100, CZ); camBas.up.set(0, 0, 1); camBas.lookAt(CX, 0, CZ); camBas.updateMatrixWorld();
  const cache = new Map(), bb = new THREE.Box3(), plats = [];
  const horsAO = (x) => { for (let n = x; n; n = n.parent) if (n.userData && n.userData.horsAOSol) return true; return false; };
  scene.traverse((x) => {
    cache.set(x, x.visible);
    if (x.isSprite || x.isPoints || x.isLine || x.userData.dynamique || horsAO(x)) { x.visible = false; return; }
    if (!x.isMesh) return;
    const m = Array.isArray(x.material) ? x.material[0] : x.material;
    if (x.isSkinnedMesh || !m || m.transparent || m.alphaTest > 0 || m.fog === false) { x.visible = false; return; }
    if (x.geometry.boundingSphere === null) x.geometry.computeBoundingSphere();
    if (x.geometry.boundingSphere.radius * x.matrixWorld.getMaxScaleOnAxis() > 120) { x.visible = false; return; }
    if (!x.isInstancedMesh && bb.setFromObject(x).max.y < A.pied) plats.push(x);   // sols, plinthes basses : pas des obstacles
  });
  const fond = scene.background, surcharge = scene.overrideMaterial, brouillard = scene.fog;
  const couleur = renderer.getClearColor(new THREE.Color()), alpha = renderer.getClearAlpha(), auto = renderer.shadowMap.autoUpdate;
  scene.background = null; scene.overrideMaterial = hauteur; scene.fog = null; renderer.shadowMap.autoUpdate = false;
  renderer.setRenderTarget(cibleHaut); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camHaut);
  for (const x of plats) x.visible = false;             // vu d'en bas, le sol masquerait tout
  renderer.setRenderTarget(cibleBas); renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.render(scene, camBas);
  scene.overrideMaterial = null;
  scene.traverse((x) => { if (cache.has(x)) x.visible = cache.get(x); });
  scene.background = fond; scene.overrideMaterial = surcharge; scene.fog = brouillard; renderer.shadowMap.autoUpdate = auto;

  // horizon dans 16 directions tournées au hasard d'un texel à l'autre (sinon les pieds fins font des étoiles),
  // `pas` pas resserrés près du texel, puis un flou léger qui fond le bruit
  const cibleBrute = new THREE.WebGLRenderTarget(aw, ah, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const cibleAO = new THREE.WebGLRenderTarget(aw, ah, { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true });
  const vs = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const pas = Math.max(4, Math.round(A.pas));
  const calcul = new THREE.ShaderMaterial({
    uniforms: { tHaut: { value: cibleHaut.texture }, tBas: { value: cibleBas.texture }, uTaille: { value: new THREE.Vector2(WH, LH) },
                uTerrain: { value: new THREE.Vector2(W, L) }, uR: { value: A.rayon }, uPied: { value: A.pied } },
    vertexShader: vs,
    fragmentShader: `uniform sampler2D tHaut, tBas; uniform vec2 uTaille, uTerrain; uniform float uR, uPied; varying vec2 vUv;
      float h(vec2 p) {
        vec2 t = p / uTaille + 0.5;
        float bas = texture2D(tBas, vec2(t.x, 1.0 - t.y)).r;           // vu d'en bas, l'axe z est retourné
        return bas < uPied ? texture2D(tHaut, t).r : 0.0;              // ne compte que ce qui part du sol
      }
      float bruit(vec2 c) { return fract(52.9829189 * fract(dot(c, vec2(0.06711056, 0.00583715)))); }
      void main() {
        vec2 p = (vUv - 0.5) * uTerrain;
        float h0 = h(p), masque = 0.0, rot = bruit(gl_FragCoord.xy) * 0.3926991, dec = bruit(gl_FragCoord.yx + 7.0);
        for (int d = 0; d < 16; d++) {
          float a = (float(d) + 0.5) * 0.3926991 + rot;
          vec2 dir = vec2(cos(a), sin(a));
          float pente = 0.0;
          for (int s = 0; s < ${pas}; s++) {
            float t = uR * pow((float(s) + dec) / ${pas}.0, 1.6) + 0.02;
            pente = max(pente, (h(p + dir * t) - h0) / t);
          }
          masque += pente * pente / (1.0 + pente * pente);            // sin² de l'élévation de l'horizon
        }
        gl_FragColor = vec4(vec3(1.0 - masque / 16.0), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const flou = new THREE.ShaderMaterial({
    uniforms: { tAO: { value: cibleBrute.texture }, uPas: { value: new THREE.Vector2(1 / aw, 1 / ah) } },
    vertexShader: vs,
    fragmentShader: `uniform sampler2D tAO; uniform vec2 uPas; varying vec2 vUv;
      void main() {
        float s = 0.0, n = 0.0;
        for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++) {
          float w = 1.0 / (1.0 + float(x * x + y * y));
          s += texture2D(tAO, vUv + vec2(float(x), float(y)) * uPas * 1.5).r * w; n += w;
        }
        gl_FragColor = vec4(vec3(s / n), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), calcul), sceneAO = new THREE.Scene(); sceneAO.add(quad);
  renderer.setRenderTarget(cibleBrute); renderer.render(sceneAO, camHaut);
  quad.material = flou; renderer.setRenderTarget(cibleAO); renderer.render(sceneAO, camHaut);
  renderer.setRenderTarget(null); renderer.setClearColor(couleur, alpha);
  calcul.dispose(); flou.dispose(); hauteur.dispose(); quad.geometry.dispose(); cibleHaut.dispose(); cibleBas.dispose(); cibleBrute.dispose();

  const m = sol.material;
  if (m.aoMap && m.aoMap.__cibleAO) m.aoMap.__cibleAO.dispose();
  cibleAO.texture.__cibleAO = cibleAO;
  cibleAO.texture.channel = scene.userData.aoCanal ?? 0;     // (un sol dont les UV sont en mètres lit l'ombre sur uv1)
  m.aoMap = cibleAO.texture; m.aoMapIntensity = A.intensite; m.needsUpdate = true;
  // les ombres de contact du décor fixe (js/ombres_contact.js) se recuisent au même signal
  scene.userData.solCuit = (scene.userData.solCuit || 0) + 1;
}
// Le décor se remplit en plusieurs fois (des modèles arrivent de leurs fichiers) : on recuit l'ombrage dès que tous les
// chargements en cours sont finis, une fois de plus si d'autres arrivent ensuite — et la carte d'environnement est
// reprise au même moment. Passé 30 s, le décor est complet : on n'écoute plus.
// Pose aussi le plan des ombres de contact (scene.userData.solContact : le même rectangle).
export function planifierOcclusionSol(scene, renderer, sol, W, L, o = {}) {
  scene.userData.solContact = { cx: o.cx ?? sol.position.x, cz: o.cz ?? sol.position.z, W, L };
  if (!renderer) return;
  let minuterie = 0;
  const fin = performance.now() + 30000;
  const cuire = () => {
    if (performance.now() > fin) return;
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      try { cuireOcclusionSol(scene, renderer, sol, W, L, o); } catch (e) { console.warn('[décor] ombre du sol non cuite :', e); }
      scene.userData.envTerrain?.capturer?.(renderer);
    }, 200);
  };
  const avant = THREE.DefaultLoadingManager.onLoad;
  THREE.DefaultLoadingManager.onLoad = (...a) => { if (avant) avant(...a); cuire(); };
  cuire();
}

// =====================================================================
//  OPTIMISATION DU DÉCOR : dédupliquer les matériaux, coudre les géométries
// =====================================================================
// Ce qui coûte dans une image, c'est le nombre d'APPELS DE DESSIN (le processeur prépare chaque maillage), bien plus
// que les triangles. Une école construite boîte par boîte, c'est des centaines de maillages : on les rassemble UNE fois,
// le décor construit.
//   1. DÉDUPLIQUER : deux matériaux de même type, mêmes couleurs, mêmes réglages et mêmes cartes sont le même ;
//   2. COUDRE : tous les maillages statiques qui partagent un matériau et leurs réglages d'ombre deviennent UN maillage
//      (géométries passées dans le repère du monde).
// Ce qu'on ne touche pas : les maillages à squelette, les matériaux à shader maison (`onBeforeCompile` : vent, grain…),
// les transparents (leur ordre de dessin dépend de la caméra), les maillages à plusieurs matériaux, et tout ce qui porte
// `userData.nofuse` (ou dont un parent le porte) — à commencer par le sol, que js/fx.js retrouve par
// scene.userData.env.court (reflet du sol mouillé, ombre cuite).
// PIÈGE : `material.onBeforeCompile` n'est jamais absent (une fonction vide sur le prototype) : on compare à elle.
const ONBC_NATIF = THREE.Material.prototype.onBeforeCompile;
const shaderMaison = (m) => m.onBeforeCompile !== ONBC_NATIF;
function signatureMateriau(m) {
  const t = (x) => (x ? x.uuid : '-');
  return [m.type, m.color && m.color.getHexString(), m.roughness, m.metalness,
          m.emissive && m.emissive.getHexString(), m.emissiveIntensity, m.opacity, m.transparent,
          m.side, m.flatShading, m.alphaTest, m.depthWrite, m.depthTest, m.polygonOffset,
          m.polygonOffsetFactor, m.wireframe, m.bumpScale, m.envMapIntensity, m.toneMapped,
          t(m.map), t(m.bumpMap), t(m.normalMap), t(m.roughnessMap), t(m.emissiveMap), t(m.alphaMap), t(m.aoMap)].join('|');
}
function dedupliquerMateriaux(scene) {
  const parSig = new Map(), remap = new Map();
  scene.traverse((o) => {
    if (!o.isMesh && !o.isLine && !o.isPoints) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!m || remap.has(m.uuid) || shaderMaison(m)) continue;
      const sig = signatureMateriau(m), garde = parSig.get(sig);
      if (garde) remap.set(m.uuid, garde); else { parSig.set(sig, m); remap.set(m.uuid, m); }
    }
  });
  let remplaces = 0;
  scene.traverse((o) => {
    if (!o.isMesh && !o.isLine && !o.isPoints) return;
    if (Array.isArray(o.material)) o.material = o.material.map((m) => { const r = m && remap.get(m.uuid); if (r && r !== m) remplaces++; return r || m; });
    else if (o.material) { const r = remap.get(o.material.uuid); if (r && r !== o.material) { o.material = r; remplaces++; } }
  });
  const env = scene.userData.env;
  if (env && env.wetMats) env.wetMats = [...new Set(env.wetMats.map((m) => (m && remap.get(m.uuid)) || m).filter(Boolean))];
  return { remplaces, distincts: parSig.size };
}
const protege = (o) => { for (let n = o; n; n = n.parent) if (n.userData && n.userData.nofuse) return true; return false; };
export function nePasFusionner(o) { if (o && o.userData) o.userData.nofuse = true; return o; }
function fusionnerDecor(scene) {
  const familles = new Map();
  let candidats = 0;
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) return;
    if (o.children.length || protege(o) || o.userData.dynamique) return;
    const m = o.material;
    if (!m || Array.isArray(m) || m.transparent || shaderMaison(m)) return;
    const g = o.geometry;
    if (!g || !g.attributes.position || (g.morphAttributes && Object.keys(g.morphAttributes).length)) return;
    // même matériau, mêmes réglages d'ombre, MÊMES ATTRIBUTS (coudre une géométrie à UV et une sans décalerait tout),
    // même drapeau « hors de l'ombre cuite » (les plafonds)
    const cle = [m.uuid, o.castShadow, o.receiveShadow, Object.keys(g.attributes).sort().join(','), !!g.index, !!o.userData.horsAOSol].join('#');
    if (!familles.has(cle)) familles.set(cle, []);
    familles.get(cle).push(o);
    candidats++;
  });
  let fusionnes = 0, crees = 0;
  for (const [, lot] of familles) {
    if (lot.length < 2) continue;
    const geos = lot.map((o) => { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); return g; });
    let melange = null;
    try { melange = mergeGeometries(geos, false); } catch (e) { melange = null; }
    for (const g of geos) g.dispose();
    if (!melange) continue;
    const modele = lot[0];
    const bloc = new THREE.Mesh(melange, modele.material);
    bloc.castShadow = modele.castShadow; bloc.receiveShadow = modele.receiveShadow;
    bloc.userData.horsAOSol = !!modele.userData.horsAOSol;
    bloc.matrixAutoUpdate = false;                       // il ne bougera plus : une matrice de moins par image
    scene.add(bloc);
    for (const o of lot) { if (o.parent) o.parent.remove(o); o.geometry.dispose(); }
    fusionnes += lot.length; crees++;
  }
  return { candidats, fusionnes, crees };
}
export function optimiserDecor(scene) {
  const u = scene.userData;
  if (u.env && u.env.court) nePasFusionner(u.env.court);
  const d = dedupliquerMateriaux(scene);
  const f = fusionnerDecor(scene);
  console.info('[optim] matériaux : %d remplacés, %d distincts · géométries : %d maillages cousus en %d blocs (sur %d candidats)',
    d.remplaces, d.distincts, f.fusionnes, f.crees, f.candidats);
}

// =====================================================================
//  LES FEUILLAGES AU VENT (plantes de l'entrée, bambous des jardinières)
// =====================================================================
// Le vent : un balancement des plans de feuilles injecté dans le shader, ombres comprises (le matériau de profondeur
// reçoit le même), en espace OBJET (le feuillage d'une plante pivote autour de son pied). `animerVent(t)` le fait
// avancer (js/game.js : scene.userData.animate). `transmissionSoleil` : la lumière qui traverse une feuille vue par son
// revers (10 à 30 % du soleil, filtrée en vert-jaune), dans la boucle des lumières, pour la première directionnelle.
const VENT = { value: 0 };
export function animerVent(t) { VENT.value = t; }
export function transmissionSoleil(sh, force) {
  const CH = THREE.ShaderChunk.lights_fragment_begin;
  const A = '#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )';
  const k = CH.lastIndexOf('RE_Direct( directLight');
  if (!CH.includes(A) || k < 0) return;
  const T = `#if ( UNROLLED_LOOP_INDEX == 0 )
  {
    float dos = saturate( 0.3 - 0.7 * dot( geometryNormal, directLight.direction ) );
    float avant = pow( saturate( dot( - geometryViewDir, directLight.direction ) ), 6.0 );
    vec3 vert = material.diffuseColor * vec3( 1.08, 1.12, 0.55 );
    reflectedLight.directDiffuse += vert * uTransSol * dos * ( 0.3 * soleilBrut + directLight.color * ( 0.7 + 2.5 * avant ) );
  }
  #endif
  `;
  const ch = (CH.slice(0, k) + T + CH.slice(k)).replace(A, `#if ( UNROLLED_LOOP_INDEX == 0 )
  vec3 soleilBrut = directLight.color;
  #endif
  ${A}`);
  sh.uniforms.uTransSol = { value: force };
  sh.fragmentShader = 'uniform float uTransSol;\n' + sh.fragmentShader.replace('#include <lights_fragment_begin>', ch);
}
// `hauteurDebut` : sous cette hauteur (m, repère de l'objet), rien ne bouge (le pot, la tige) ; `extra(sh)` : une retouche
// de plus (transmissionSoleil)
export function windify(mat, extra = null, hauteurDebut = 0.3, hauteurPleine = 1.5) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = VENT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWind;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float wk = smoothstep(${hauteurDebut.toFixed(3)}, ${hauteurPleine.toFixed(3)}, position.y);
        float ph = uWind * 1.3 + position.x * 0.35 + position.z * 0.27;
        float raf = 0.65 + 0.35 * sin(uWind * 0.21 + position.x * 0.015) * sin(uWind * 0.13 + 1.3);
        float fr = uWind * 6.3 + dot(position, vec3(4.1, 3.3, 3.7));
        vec3 frm = vec3(sin(fr), 0.6 * sin(fr * 1.37 + 1.7), cos(fr * 0.83)) * 0.02 * wk * raf;
        transformed.x += (sin(ph) * 0.05 + sin(ph * 2.7) * 0.015) * wk * raf + frm.x;
        transformed.z += cos(ph * 0.8) * 0.04 * wk * raf + frm.z;
        transformed.y += sin(ph * 1.9) * 0.015 * wk * raf + frm.y;`);
    if (extra) extra(sh);
  };
  mat.customProgramCacheKey = () => 'iris-vent-1-' + hauteurDebut + '-' + hauteurPleine + (extra ? '-t' : '');
  return mat;
}
