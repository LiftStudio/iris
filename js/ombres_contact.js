import * as THREE from 'three';
import { TELEPHONE } from './appareil.js';

// =====================================================================
//  OMBRES DE CONTACT : ce que la lumière ne voit pas sous le joueur, le mobilier, au pied des murs (repris de LA CAGE,
//  sans le relief du parc de Bécon : la fenêtre est le plan déclaré par la carte, toujours à plat)
// =====================================================================
// Le soleil ne dessine qu'UNE ombre, la sienne. Or au parc de Bécon tout le plateau est à l'ombre du pin (photos du
// 22, 26 et 27/09) : il n'y a plus de soleil, rien que le ciel, et le ciel éclaire de partout — on ne voyait donc
// AUCUNE ombre sous les joueurs, qui avaient l'air posés sur l'image. Sur les photos, chacun a pourtant sa tache
// sombre et douce sous les pieds : là, le ciel est masqué par le corps. Même chose sous un banc, au pied d'un poteau.
// Aux autres terrains, en plein soleil, la même tache manquait sur le côté éclairé des pieds.
//
// LA MÉTHODE (celle des « contact shadows » de three.js, étendue) : une caméra orthographique posée AU SOL, tournée
// vers le ciel, rend ce qui est au-dessus du plateau en une carte vue de dessous. Chaque fragment y écrit le CONTACT
// (R : ce qui touche presque le sol — les semelles, le ballon qui rebondit, les pieds d'un banc) et sa PRÉSENCE
// (G et B : tout ce qui est à moins de `HAUT` mètres, d'autant plus que c'est bas). Trois flous emboîtés : R sur 7 cm
// (la tache foncée qui déborde à peine des semelles), G sur 15 cm (l'ombre qui colle aux pieds, sous l'assise d'un
// banc), B sur 40 cm (le ciel masqué autour : un corps debout en cache encore un peu à un mètre de lui). Un plan posé
// sur l'enrobé en fait un voile noir : contact en opacité, présence en 1 - exp(-k · présence), qui sature doucement.
// La profondeur garde le fragment le plus BAS de chaque colonne, qui est aussi celui qui assombrit le plus : pas
// besoin de mélange.
//
// DEUX CARTES : la carte FIXE (bancs, poteaux, pied des murs, cage de hand, troncs) est calculée une fois, quand le décor
// a fini d'arriver (au même signal que l'ombre cuite au sol de js/court.js) ; la carte MOBILE (joueurs, ballon, vélo)
// l'est à chaque image, mais elle ne voit que ce qui est sur la couche COUCHE (posée ici sur ce qui bouge) : une passe
// de profondeur de quelques personnages, puis six passes de flou sur une image de 0,5 Mpx — 0,5 ms mesurée sur une
// Radeon intégrée (image entière : 26 ms).
//
// Le plateau (centre, taille) est déclaré par planifierOcclusionSol (js/court.js) dans scene.userData.solContact, et la
// force par terrain dans scene.userData.ombreContact (sinon DEFAUT).
//
// LA BORNE DES MOBILES. Un corps debout ne cache au sol, entre ses pieds, que 20 à 40 % du ciel ; sur les photos du
// parc à l'ombre (1000051600, 601, 20260926_185558), le bitume a la même valeur à 30 cm des pieds que plus loin, et
// seul un voile collé aux semelles, jamais noir, trahit le contact. Or 1 - exp(-k · présence) ne connaît pas de
// plafond : sous un joueur, la présence floutée vaut 2 à 2,6 et il ne restait que 1 à 5 % du ciel — une tache
// d'encre d'un mètre. La part MOBILE (joueurs, ballon, vélo) est donc bornée : elle retire au plus `borne` du ciel
// (occM = 1 - borne · (1 - exp(...))) ; le contact des semelles, lui, reste entier. La carte FIXE (bancs, poteaux,
// pied des murs) garde sa loi : sous l'assise d'un banc, le ciel est vraiment caché de partout.

const COUCHE = 7;
// contact : opacité de la tache sous les semelles ; occlusion : coefficient k de 1 - exp(-k · présence floutée) ;
// borne : part du ciel que les MOBILES peuvent retirer au plus (1 = sans borne) ; hContact : hauteur sous laquelle un
// mobile « touche » le sol (semelles, ballon qui rebondit) ; expo : loi de la présence des mobiles avec la hauteur.
// borne 0,6 hors du parc (mesuré le 30/09 à Bécon, temps « nuages » où l'allègement du soleil ne joue plus : sans
// borne, médiane de 0,33 à 0,53 fois le sol entre les pieds et 10e centile à 0,1 ; avec, 0,62 à 0,74 et 0,35 à 0,58.
// Au soleil, le cœur de l'ombre propre du joueur s'éclaircit un peu : 0,53-0,64 -> 0,65-0,77, la tache reste)
const DEFAUT = { contact: 0.45, occlusion: 1.6, borne: 0.6, hContact: 0.22, expo: 0.5, fixeContact: 0.35, fixeOcclusion: 1.2 };
const TEXELS_M = { pc: 32, tel: 16 };
const HAUT = 2.2;           // au-delà, un objet ne masque plus assez de ciel pour qu'on le voie au sol
const HAUT_FIXE = 1.6;      // décor fixe : un banc, une poubelle, le pied d'un mur (le haut d'un mur n'y change rien)
const PIED = 0.02;          // sous 2 cm : le sol lui-même, les liserés peints
// (le téléphone : la détection de tout le jeu, js/appareil.js — même règle qu'ici avant, plus `?tel=1`)

// Matériau de profondeur : il garde tout ce que three sait faire d'un maillage (squelette, instances, morphes) et ne
// change que la sortie. La caméra est orthographique, posée au sol et tournée vers le haut : la profondeur est donc la
// hauteur du fragment, à l'échelle près — hauteur = près + z * (loin - près).
// `expo` : la présence décroît avec la hauteur en (1 - h / loin)^expo. 0,5 (la racine) pour le décor fixe, partout :
// sous l'assise d'un banc à 45 cm, elle vaut encore 0,85. Un terrain peut en demander une plus raide pour les
// MOBILES seuls (ombreContact.expo) : un bassin à 1 m, des bras tendus, un ballon en l'air ne masquent presque rien
// du ciel au sol, alors que la racine leur donnait encore 0,74 — d'où le halo d'un mètre et la tache sous le ballon.
function materiauHauteur(pres, loin, contact, expo = 0.5) {
  const m = new THREE.MeshDepthMaterial({ side: THREE.DoubleSide });
  m.blending = THREE.NoBlending;
  const loi = expo === 0.5 ? 'sqrt(t)' : expo === 1 ? 't' : expo === 2 ? 't * t' : `pow(t, ${expo.toFixed(4)})`;
  m.onBeforeCompile = (sh) => {
    const hh = `float hh = ${pres.toFixed(4)} + fragCoordZ * ${(loin - pres).toFixed(4)};`;
    sh.fragmentShader = sh.fragmentShader.replace(/gl_FragColor = vec4\( vec3\( 1\.0 - fragCoordZ \), opacity \);/,
      `${hh}
        float cont = 1.0 - smoothstep(0.0, ${contact.toFixed(4)}, hh);
        float t = max(0.0, 1.0 - hh / ${loin.toFixed(4)});
        float pres = ${loi};
        gl_FragColor = vec4(cont, pres, pres, 1.0);`);
  };
  m.customProgramCacheKey = () => `ombre-contact-${pres}-${loin}-${contact}-${expo}`;
  return m;
}

// Flou gaussien séparable à 9 prises. `uCanaux` dit quels canaux sont floutés ; les autres sont recopiés tels quels.
const VS_PLEIN = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
function materiauFlou() {
  return new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uPas: { value: new THREE.Vector2() }, uCanaux: { value: new THREE.Vector3(1, 1, 1) } },
    vertexShader: VS_PLEIN,
    fragmentShader: `uniform sampler2D tSrc; uniform vec2 uPas; uniform vec3 uCanaux; varying vec2 vUv;
      void main() {
        const float W0 = 0.2270270, W1 = 0.1945946, W2 = 0.1216216, W3 = 0.0540541, W4 = 0.0162162;
        vec4 c = texture2D(tSrc, vUv);
        vec3 s = c.rgb * W0;
        s += (texture2D(tSrc, vUv + uPas).rgb + texture2D(tSrc, vUv - uPas).rgb) * W1;
        s += (texture2D(tSrc, vUv + 2.0 * uPas).rgb + texture2D(tSrc, vUv - 2.0 * uPas).rgb) * W2;
        s += (texture2D(tSrc, vUv + 3.0 * uPas).rgb + texture2D(tSrc, vUv - 3.0 * uPas).rgb) * W3;
        s += (texture2D(tSrc, vUv + 4.0 * uPas).rgb + texture2D(tSrc, vUv - 4.0 * uPas).rgb) * W4;
        gl_FragColor = vec4(mix(c.rgb, s, uCanaux), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
}

// LE VOILE D'AFFICHAGE : un plan posé sur le sol de la carte, transparent, qui assombrit.
function fragmentPlan() {
  return `#include <packing>
        uniform sampler2D tMobile, tFixe, tSoleil; uniform vec4 uForce; uniform vec2 uMin, uTaille; uniform float uFixe, uBorne;
        uniform mat4 mSoleil; uniform vec3 uSoleil;
        varying vec2 vMonde;
        void main() {
          vec2 uv = (vMonde - uMin) / uTaille;
          // les bords de la carte : on s'éteint sur 20 cm au lieu de couper net
          vec2 b = min(uv, 1.0 - uv) * uTaille;
          float bord = smoothstep(0.0, 0.2, min(b.x, b.y));
          // contact : une tache foncée qui déborde à peine des semelles ; occlusion : 1 - exp(-k · présence floutée),
          // qui sature doucement (deux joueurs collés ne font pas une tache deux fois plus noire). La part des
          // mobiles est bornée (uBorne, voir l'en-tête) : un corps debout ne cache jamais tout le ciel au sol ;
          // celle du décor fixe ne l'est pas. Avec uBorne = 1, c'est exactement l'ancienne loi.
          vec3 m = texture2D(tMobile, uv).rgb, f = texture2D(tFixe, uv).rgb * uFixe;
          float occM = 1.0 - uBorne * (1.0 - exp(-uForce.y * (1.6 * m.g + m.b)));
          float occF = exp(-uForce.w * (1.6 * f.g + f.b));
          float occ = occM * occF;
          // AU SOLEIL, le ciel masqué ne pèse que sa part de l'éclairement : la grande tache n'assombrit que cette
          // part (plus de halo sale autour des pieds sur l'enrobé ensoleillé, où l'ombre du soleil fait déjà le
          // travail). Dans l'ombre — celle du joueur, d'un arbre, tout le plateau du parc — elle reste entière.
          if (uSoleil.x > 0.5 && occ < 0.995) {
            vec4 sc = mSoleil * vec4(vMonde.x, 0.03, vMonde.y, 1.0);
            if (all(greaterThan(sc.xy, vec2(0.0))) && all(lessThan(sc.xy, vec2(1.0)))) {
              float lit = step(sc.z + uSoleil.z, unpackRGBAToDepth(texture2D(tSoleil, sc.xy)));
              occ = mix(occ, 1.0 - (1.0 - occ) * uSoleil.y, lit);
            }
          }
          float a = 1.0 - (1.0 - uForce.x * min(1.0, 1.5 * m.r)) * (1.0 - uForce.z * min(1.0, 1.5 * f.r)) * occ;
          gl_FragColor = vec4(0.0, 0.0, 0.0, a * bord);
        }`;
}

export class OmbresContact {
  constructor(renderer, scene) {
    this.renderer = renderer; this.scene = scene;
    this.actif = false; this.pret = false; this.cuisson = -1; this.n = 0; this.tRamasse = 0;
    this.dynamiques = new WeakSet();
  }

  // prépare cartes, caméra et plan d'affichage une fois le plateau connu
  _installer(S) {
    const R = TELEPHONE ? TEXELS_M.tel : TEXELS_M.pc;
    const w = Math.min(2048, Math.round(S.W * R)), h = Math.min(2048, Math.round(S.L * R));
    const cible = () => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter, depthBuffer: true, generateMipmaps: false });
    this.w = w; this.h = h; this.texelM = S.W / w;
    this.brut = cible(); this.tmp = cible(); this.mobile = cible(); this.fixe = cible();
    // sous le sol, tournée vers le ciel : +x à droite, +z en haut de l'image (le plan relit en coordonnées monde)
    this.cam = new THREE.OrthographicCamera(-S.W / 2, S.W / 2, S.L / 2, -S.L / 2, 0, HAUT);
    this.cam.position.set(S.cx, 0, S.cz); this.cam.up.set(0, 0, 1); this.cam.lookAt(S.cx, 1, S.cz);
    this.cam.layers.set(COUCHE); this.cam.updateMatrixWorld();
    const F = { ...DEFAUT, ...(this.scene.userData.ombreContact || {}) };
    // la loi des mobiles est celle du terrain (hContact : hauteur de la bande de contact ; expo : voir materiauHauteur) ;
    // celle du décor fixe est commune
    this.matMobile = materiauHauteur(0, HAUT, F.hContact, F.expo);
    this.matFixe = materiauHauteur(PIED, HAUT_FIXE, 0.3);
    this.flou = materiauFlou();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.flou);
    this.sceneQuad = new THREE.Scene(); this.sceneQuad.add(this.quad);
    this.camQuad = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.plan = new THREE.Mesh(new THREE.PlaneGeometry(S.W, S.L), new THREE.ShaderMaterial({
      uniforms: { tMobile: { value: this.mobile.texture }, tFixe: { value: this.fixe.texture },
        uForce: { value: new THREE.Vector4(F.contact, F.occlusion, F.fixeContact, F.fixeOcclusion) },
        uBorne: { value: F.borne },
        uMin: { value: new THREE.Vector2(S.cx - S.W / 2, S.cz - S.L / 2) }, uTaille: { value: new THREE.Vector2(S.W, S.L) },
        uFixe: { value: 0 },
        // la carte d'ombre du soleil : x = actif, y = part du ciel dans l'éclairement, z = biais
        tSoleil: { value: null }, mSoleil: { value: new THREE.Matrix4() }, uSoleil: { value: new THREE.Vector3(0, 0.3, -0.0006) } },
      vertexShader: `varying vec2 vMonde; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vMonde = wp.xz;
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: fragmentPlan(),
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }));
    // Juste au-dessus du plus haut revêtement opaque qui couvre le plateau : la fresque de Jemmapes est un calque
    // posé à 1,4 cm, sous lequel l'ombre disparaissait. Pas plus haut que nécessaire : ce qui est sous le plan (le
    // bas des semelles) est assombri avec le sol.
    let yRev = 0;
    const bb = new THREE.Box3(), aire = 0.15 * S.W * S.L;
    this.scene.traverse((o) => {
      if (!o.isMesh || o.userData.dynamique) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.transparent) return;
      bb.setFromObject(o);
      if (bb.max.y < 0.06 && bb.max.y - bb.min.y < 0.01 && (bb.max.x - bb.min.x) * (bb.max.z - bb.min.z) > aire) yRev = Math.max(yRev, bb.max.y);
    });
    this._yPlan = Math.max(0.012, yRev + 0.004);
    this.plan.rotation.x = -Math.PI / 2; this.plan.position.set(S.cx, this._yPlan, S.cz);
    this.plan.renderOrder = 2; this.plan.frustumCulled = false;
    this.plan.userData.dynamique = true;        // pas un obstacle pour l'ombre cuite au sol
    this.plan.name = 'ombres de contact';
    this.scene.add(this.plan);
    this.pret = true;
  }

  // Ce qui bouge passe sur la couche COUCHE : les racines marquées `dynamique` au premier niveau de la scène
  // (le joueur). Seuls les maillages opaques qui portent une ombre y vont (pas les
  // anneaux, étiquettes et marqueurs, qui flotteraient en tache sous le joueur).
  _ramasser() {
    const marquer = (racine) => racine.traverse((o) => {
      if (!(o.isMesh || o.isSkinnedMesh) || !o.castShadow) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.transparent) return;
      o.layers.enable(COUCHE);
    });
    // (F2 : `horsContact` — les armes à la 3e personne des bots, js/jeu/pose_arme.js — n'y vont pas)
    for (const o of this.scene.children) if (o.userData.dynamique && !o.userData.ombreToujours && !o.userData.horsContact && o !== this.plan) marquer(o);
  }

  // SES PROGRAMMES PRÉCOMPILÉS (06/10/2026 ; voir avecProfondeur de js/ombre_cache.js). Un avatar qui arrive (squelette,
  // morphes du visage) faisait compiler SA variante du matériau de hauteur à la première image où il entrait dans la carte
  // des mobiles — à la première image d'un match, pour dix joueurs d'un coup. On pose matMobile sur ses maillages
  // opaques qui portent une ombre (ceux que _ramasser met sur la couche), le temps de `compiler(racine, caméra)` avec
  // NOTRE caméra : elle ne voit pas la couche des lumières, la clé est donc celle du vrai rendu.
  avecContact(racine, compiler) {
    if (!this.pret || !this.matMobile) return null;
    const poses = [];
    racine.traverse((o) => {
      if (!(o.isMesh || o.isSkinnedMesh) || !o.castShadow || !o.material) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.transparent) return;
      poses.push([o, o.material]); o.material = this.matMobile;
    });
    try { return poses.length ? compiler(racine, this.cam) : null; }
    finally { for (const [o, m] of poses) o.material = m; }
  }

  _flouter(src, dst, sigmaM, canaux) {
    const pas = Math.max(0.6, sigmaM / this.texelM * 0.6);
    this.flou.uniforms.uCanaux.value.set(canaux[0], canaux[1], canaux[2]);
    this.flou.uniforms.tSrc.value = src.texture; this.flou.uniforms.uPas.value.set(pas / this.w, 0);
    this.renderer.setRenderTarget(this.tmp); this.renderer.render(this.sceneQuad, this.camQuad);
    this.flou.uniforms.tSrc.value = this.tmp.texture; this.flou.uniforms.uPas.value.set(0, pas / this.h);
    this.renderer.setRenderTarget(dst); this.renderer.render(this.sceneQuad, this.camQuad);
  }

  // Une passe complète : la vue de dessous dans `brut`, puis trois flous emboîtés. R = le contact (flou de 7 cm) ;
  // G = la présence au-dessus du sol floutée sur 15 cm (l'ombre qui colle aux pieds, sous l'assise d'un banc) ; B = la
  // même floutée sur 40 cm (le ciel masqué autour : un corps debout en cache encore un peu à un mètre de lui).
  _carte(dst, materiau, mobiles = false) {
    const r = this.renderer, sc = this.scene;
    const fond = sc.background, surcharge = sc.overrideMaterial, cible = r.getRenderTarget();
    const auto = r.shadowMap.autoUpdate, couleur = r.getClearColor(this._couleur || (this._couleur = new THREE.Color())), alpha = r.getClearAlpha();
    // Pour la carte des MOBILES, three ne remet pas à jour les matrices de TOUTE la scène avant ce rendu (le décor ne bouge
    // pas, et la passe principale les remet à jour juste après) : seulement celles de ce qui bouge. La cuisson du décor
    // fixe garde la mise à jour complète : un objet tout juste arrivé n'a pas encore de matrice monde.
    const majAuto = sc.matrixWorldAutoUpdate;
    if (mobiles) {
      sc.matrixWorldAutoUpdate = false;
      for (const o of sc.children) if (o.userData.dynamique) o.updateMatrixWorld();
    }
    sc.background = null; sc.overrideMaterial = materiau; r.shadowMap.autoUpdate = false;
    try { r.setRenderTarget(this.brut); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, this.cam); }
    finally { sc.matrixWorldAutoUpdate = majAuto; }
    sc.background = fond; sc.overrideMaterial = surcharge; r.shadowMap.autoUpdate = auto;
    // chaque flou lit une cible et en écrit une autre (brut -> tmp -> dst, puis dst -> tmp -> dst)
    this._flouter(this.brut, dst, 0.07, [1, 1, 1]);
    this._flouter(dst, dst, 0.13, [0, 1, 1]);
    this._flouter(dst, dst, 0.38, [0, 0, 1]);
    r.setRenderTarget(cible); r.setClearColor(couleur, alpha);
  }

  // Le décor fixe, une fois : tout ce qui est opaque, posé, et pas gigantesque (le ciel, le sol de 500 m). Le
  // feuillage découpé et les grillages (alphaTest) n'y vont pas : rendus pleins, ils feraient des murs d'ombre.
  _cuireFixe() {
    const sc = this.scene, cache = new Map();
    sc.traverse((o) => {
      cache.set(o, o.layers.mask);
      if (!o.isMesh || o.isSkinnedMesh || o === this.plan || o.userData.dynamique) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.transparent || m.alphaTest > 0 || m.fog === false) return;
      if (o.geometry.boundingSphere === null) o.geometry.computeBoundingSphere();
      if (o.geometry.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis() > 60) return;
      o.layers.enable(COUCHE);
    });
    // les objets qui bougent sont déjà sur la couche : on les en retire le temps de la cuisson
    for (const o of sc.children) if (o.userData.dynamique) o.traverse((d) => d.layers.disable(COUCHE));
    this.cam.near = PIED; this.cam.far = HAUT_FIXE; this.cam.updateProjectionMatrix();
    this._carte(this.fixe, this.matFixe);
    this.cam.near = 0; this.cam.far = HAUT; this.cam.updateProjectionMatrix();
    sc.traverse((o) => { if (cache.has(o)) o.layers.mask = cache.get(o); });
    this.plan.material.uniforms.uFixe.value = 1;
    this._ramasser();
  }

  update(dt, qualite, ombres) {
    const S = this.scene.userData.solContact;
    if (!S) return;
    if (!this.pret) this._installer(S);
    // réglage « ombres : non » : on garde le décor (c'est de l'éclairage, pas une carte d'ombre), plus les joueurs
    const mobiles = ombres !== 'off';
    // le décor fixe se recuit quand l'ombre du sol l'a été (même signal : tous les chargements finis)
    const cuit = this.scene.userData.solCuit || 0;
    if (cuit !== this.cuisson) { this.cuisson = cuit; this._cuireFixe(); }
    if (!mobiles) { this.plan.material.uniforms.uForce.value.x = 0; this.plan.material.uniforms.uForce.value.y = 0; return; }
    // (les réglages du terrain fondus une fois, pas à chaque image : relus seulement si le terrain en pose d'autres)
    const oc = this.scene.userData.ombreContact;
    if (!this._F || this._ocVu !== oc) { this._ocVu = oc; this._F = { ...DEFAUT, ...(oc || {}) }; }
    const F = this._F;
    this.plan.material.uniforms.uForce.value.x = F.contact; this.plan.material.uniforms.uForce.value.y = F.occlusion;
    this.plan.material.uniforms.uBorne.value = F.borne;
    // où est le soleil : la carte est RECRÉÉE à chaque changement de taille (js/fx.js), on la relit à chaque image
    const env = this.scene.userData.env, sun = env && env.sun, U = this.plan.material.uniforms;
    const actif = !!(sun && sun.castShadow && sun.shadow.map && this.renderer.shadowMap.enabled);
    U.uSoleil.value.x = actif ? 1 : 0;
    if (actif) {
      U.tSoleil.value = sun.shadow.map.texture;
      U.mSoleil.value.copy(sun.shadow.matrix);
      const sd = this.scene.userData.sunDir;
      const ciel = env.hemi.intensity + (this.scene.environment ? Math.PI * 0.65 * this.scene.environmentIntensity : 0);
      U.uSoleil.value.y = ciel / Math.max(1e-3, ciel + sun.intensity * sun.shadow.intensity * Math.max(0, sd ? sd.y : 1));
      // (environ 3,5 cm, quelle que soit la profondeur de la caméra d'ombre)
      U.uSoleil.value.z = sun.shadow.bias - 0.0003 * 119 / Math.max(1, sun.shadow.camera.far - sun.shadow.camera.near);
    }
    // un nouvel avatar, un vélo enfourché, un joueur en ligne qui arrive : on ramasse deux fois par seconde
    this.tRamasse -= dt;
    if (this.tRamasse <= 0) { this.tRamasse = 0.5; this._ramasser(); }
    // en « basse », une image sur deux : l'ombre suit avec 16 ms de retard, invisible sous un joueur qui court
    this.n++;
    if (qualite === 'low' && (this.n & 1)) return;
    this._carte(this.mobile, this.matMobile, true);
  }
}
