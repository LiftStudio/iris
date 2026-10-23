// =====================================================================
//  L'ARME DE VUE — lot L-V (23/10/2026 ; squelette du socle S0 du 22/10 ; vague 3 : L-Q)
// =====================================================================
// L'arme et les BRAS DE HAYTHEM à la 1re personne, dans LEUR scène, avec LEUR caméra (52° vertical, near 0,01, far 5) et
// LEURS trois lumières, en nombre CONSTANT (spec § 4.5.9, arbitrage 14) : jamais une lumière ajoutée à la scène de jeu
// (une de plus = 27 s d'image figée). Dessinée par-dessus la scène par la passe superposée de js/fx.js, APRÈS l'œil
// (l'arme noire ne fait pas éclaircir la scène) et avant le bloom, la sortie et l'étalonnage (VueFPS.entrer la pousse
// dans fx.superpositions). `maj` LIT l'état (VueFPS.etatArme, l'arsenal de l'acteur local) et ne commande JAMAIS une
// règle : l'animation suit l'Arsenal, les balles entrent à l'heure de la fiche, pas à celle de la main.
//
// LES BRAS sont ceux de l'avatar de Haythem (arbitrage 11) : on garde du corps et de la tenue (`avaturn_body`,
// `avaturn_look`) les seuls triangles dont les trois sommets sont portés à plus de 50 % par les os des bras
// (`/^(Left|Right)(Arm|ForeArm|Hand)/`, clavicule exclue : elle tire le cou), sur une géométrie COPIÉE (celle du GLB en
// cache est partagée avec Haythem et les bots) — mesuré : 11 746 + 3 484 triangles → ≈ 5 100, deux appels de dessin, les
// mains et les manches de sa vraie tenue. Le défaut mesuré au banc (le bras de Haythem fait 0,479 m : le garde-main est
// hors de portée depuis sa vraie épaule) disparaît parce que les ÉPAULES SONT POSÉES PAR NOUS, hors de l'image : deux
// ANCRES dans le repère de la caméra (droite (0,20 ; −0,26 ; −0,05), gauche (−0,02 ; −0,25 ; −0,30) — un buste de profil,
// l'épaule gauche en avant, comme on épaule), poussées vers la prise quand elle s'éloigne de plus de 0,45 m et redescendues
// à 4° au moins sous le bord bas de la caméra de l'arme ; chaque image, l'os du bras est posé sur son ancre, puis la
// cinématique inverse à deux os (AvatarRig.ikBras, exacte) met chaque poignet sur sa prise et `plierDoigts` ferme la main.
// Le modèle repart de sa pose de repos à chaque image : rien ne s'empile, rien ne dérive (piège 1 des persos).
//
// LES POSES (js/jeu/anim_vue.js POSES_VUE) se mélangent selon l'état : hanche, visée (le repère `visee` de l'arme sur
// l'axe à 0,24 m), sprint, sprint tactique, glissade, franchissement. Par-dessus, des RESSORTS (ω, ζ, intégrés EXACTEMENT
// pas à pas : la même courbe à 30 comme à 240 images par seconde) : l'inertie du regard (−0,0016 × la vitesse angulaire
// en °/s, ±3°, ω 18, ζ 0,8), le balancement en huit (12 mm à f/2, 8 mm à f, f = 1,15 + 0,35 v Hz ; sprint × 2,5,
// visée × 0,1), le pas chassé (3°), la réception (−2,5 cm), le recul VISUEL (§ 3.4 : piston, cabré, roulis ; ω 35, ζ 0,55 —
// celui de l'Arsenal quand il le donne, `reculV`, sinon le nôtre, au même ressort) et la respiration (±1,5 mm à 0,25 Hz).
// Et les PISTES (CHRONOS) des gestes, lues dans l'état de l'arsenal : recharges (le chargeur part avec la main gauche,
// revient à l'heure des balles entrées), FP-12 cartouche par cartouche et sa pompe, culasse du TP-50, glissière du P-17,
// changement d'arme, couteau, grenade, inspection. Une piste coupée (recharge annulée) s'éteint en 0,15 s, sans saut.
//
// LA SCÈNE DE L'ARME : une HemisphereLight, une DirectionalLight « clé » dont l'intensité suit la PIÈCE de la caméra
// (table CLE_PIECE, lissée 0,4 s : l'arme ne brille pas dans un couloir noir quand l'œil automatique éclaircit tout ;
// −1 et couloirs sombres 0,55), une PointLight de bouche (0 hors éclair) — compilées sous la préparation, jamais une de
// plus. Sa carte d'environnement est À ELLE et FIXE : un PMREM de studio (RoomEnvironment) fait UNE fois — jamais celle de
// la scène de jeu, qui change ou passe à null selon la qualité (et sa présence entre dans la clé des programmes). Ses
// programmes sont compilés pour les DEUX cibles où elle est dessinée (le tampon du composer, l'écran quand il est coupé) :
// passer de Basse à Haute ne compile rien. Pas d'ombre, pas `dynamique` (ce n'est pas la scène de jeu).
// La lunette du TP-50 : à 85 % de la visée l'arme de vue se cache, le HUD (L-G) pose le masque.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import { AvatarRig } from '../avatar.js';
import { prechargerModele } from '../player.js';
import { HAYTHEM } from '../game.js';
import { creerArme, REPERES } from './modeles_armes.js';
import { ARMES } from './armes.js';
import { POSES_VUE, POSES_ARMES, CHRONOS, VOIES, VOIES_MAIN, evaluer } from './anim_vue.js';

const DEG = Math.PI / 180;
// la caméra de l'arme (spec § 4.5.9) ; en visée, son champ se resserre (CoD § 6.4 : 52° → 44°, l'arme « vient à l'œil »)
export const CHAMP_VUE = 52, CHAMP_VISEE = 44;
// LES ÉPAULES (repère caméra, m) : posées hors du cône de vue, poussées vers la prise au-delà de PORTEE_EPAULE (le bras
// fait 0,479 m), gardées MARGE_BORD sous le bord bas de la caméra (4° demandés, 1° de marge)
export const ANCRES = { D: [0.20, -0.26, -0.05], G: [-0.02, -0.25, -0.30] };
export const PORTEE_EPAULE = 0.45, MARGE_BORD = 5 * DEG;
const POLES = { D: [0.3, -1, 0.2], G: [-0.4, -1, 0] };                 // les coudes plient de ce côté (CoD § 6.3)
const OS_BRAS = /^(Left|Right)(Arm|ForeArm|Hand)/;
const ARMES_VUE = ['fa24', 'pm9', 'fp12', 'tp50', 'p17'], TENUS = ['couteau', 'frag', 'flash'];
// LES PRISES, dans le repère de l'arme (origine = la prise de la main droite sur l'axe, −Z vers la bouche) : où va le
// POIGNET (l'os Hand ; la paume est 4 à 5 cm plus loin, vers les doigts), la direction des doigts `f` et la normale de la
// paume `n` (vers ce qu'elle tient), la flexion des doigts [phalanges 1, 2, 3] (index à part : sur la détente ou le long
// du garde-main) — `o` : le point tenu (le repère de l'arme), le poignet est `o + p`
const prise = (o, p, f, n, doigts, index = doigts, pouce = null) => ({ o, p, f: new THREE.Vector3(...f).normalize(), n: new THREE.Vector3(...n).normalize(), doigts, index, pouce });
// (le POUCE de la main qui tient — poignée, grenade, couteau — plié à 0,8 / 0,8 / 0,6 : à 0,5 / 0,3 / 0,2 il restait tendu
// au-dessus de la poignée et l'index le long du pontet faisait un « V » à chaque recharge — relecture du 23/10, photos
// avec les armes de L-W)
const POUCE_TENU = [0.8, 0.8, 0.6];
const POIGNEE = (o = [0, 0, 0]) => prise(o, [0.024, -0.075, 0.062], [-0.10, -0.30, -0.95], [-1, 0.05, 0], [1.05, 1.25, 0.9], [0.30, 0.45, 0.35], POUCE_TENU);
const GARDE = (o) => prise(o, [-0.022, -0.014, 0.046], [0.42, 0.30, -0.86], [0.25, 1, 0.12], [0.85, 1.05, 0.75], [0.55, 0.6, 0.45], [0.3, 0.2, 0.1]);
export const PRISES = {
  fa24: { d: POIGNEE(), g: GARDE(REPERES.fa24.mainG),
    chargeur: prise([0, -0.17, -0.14], [-0.045, -0.19, -0.075], [0.25, 0.35, -0.90], [1, 0.1, 0.1], [0.9, 1.0, 0.8]),
    arretoir: prise([-0.028, 0.005, -0.09], [-0.075, -0.035, -0.03], [0.55, 0.40, -0.73], [0.9, 0, 0.3], [0.3, 0.3, 0.2]) },
  pm9: { d: POIGNEE(), g: GARDE(REPERES.pm9.mainG),
    chargeur: prise([0, -0.15, -0.08], [-0.045, -0.17, -0.02], [0.25, 0.35, -0.90], [1, 0.1, 0.1], [0.9, 1.0, 0.8]),
    arretoir: prise([-0.026, 0.01, -0.06], [-0.07, -0.03, 0.0], [0.55, 0.40, -0.73], [0.9, 0, 0.3], [0.3, 0.3, 0.2]) },
  // (la pompe : la main gauche suit sa course, 9 cm vers la crosse ; « chargeur » = la fenêtre où l'on pousse les cartouches)
  fp12: { d: POIGNEE(), g: GARDE(REPERES.fp12.mainG), course: REPERES.fp12.courseMainG || 0.09,
    chargeur: prise([0, -0.05, -0.10], [-0.035, -0.10, -0.04], [0.3, 0.55, -0.78], [0.3, 1, 0], [0.7, 0.8, 0.6]),
    arretoir: prise([0, -0.05, -0.10], [-0.035, -0.10, -0.04], [0.3, 0.55, -0.78], [0.3, 1, 0], [0.7, 0.8, 0.6]) },
  tp50: { d: POIGNEE(), g: GARDE(REPERES.tp50.mainG),
    chargeur: prise([0, -0.10, -0.12], [-0.045, -0.13, -0.06], [0.25, 0.35, -0.90], [1, 0.1, 0.1], [0.9, 1.0, 0.8]),
    arretoir: prise([0.05, 0.03, 0.02], [-0.02, -0.03, 0.06], [0.6, 0.45, -0.66], [0.8, 0.2, 0.4], [0.5, 0.5, 0.4]),
    levier: prise([0.05, 0.03, 0.025], [0.075, -0.035, 0.085], [-0.35, 0.40, -0.85], [-0.55, 0.75, 0.1], [0.8, 1.0, 0.8], [0.6, 0.8, 0.6]) },
  // (le pistolet : poignée inclinée de 15°, la main gauche referme la droite)
  p17: { d: prise([0, 0, 0], [0.022, -0.072, 0.050], [-0.10, -0.24, -0.96], [-1, 0.05, 0], [1.05, 1.25, 0.9], [0.30, 0.45, 0.35], POUCE_TENU),
    g: prise(REPERES.p17.mainG, [-0.050, -0.055, 0.035], [0.55, -0.05, -0.83], [0.95, 0.2, 0.1], [1.0, 1.1, 0.8], [0.9, 1.0, 0.7], [0.2, 0.1, 0.1]),
    chargeur: prise([0, -0.12, 0.03], [-0.04, -0.16, 0.05], [0.3, 0.6, -0.74], [0.9, 0.2, 0.1], [0.9, 1.0, 0.8]),
    arretoir: prise([-0.016, 0.03, -0.02], [-0.06, -0.01, 0.03], [0.55, 0.40, -0.73], [0.9, 0, 0.3], [0.3, 0.3, 0.2]) },
};
// la main tenant un objet (couteau, grenade) : le repère de base des voies dr* (doigts vers l'avant, paume vers la gauche)
const F0 = new THREE.Vector3(0, 0, -1), N0 = new THREE.Vector3(-1, 0, 0);
// la main gauche hors champ (gl = 1) : doigts vers le bas et l'avant, paume vers la droite
const FL = new THREE.Vector3(0.2, -0.85, -0.45).normalize(), NL = new THREE.Vector3(0.9, 0.1, 0.2).normalize();
// LA CLÉ PAR PIÈCE (les 47 pièces de js/jeu/constantes.js PIECES ; absente : 1,0) — le −1 et les couloirs sombres à 0,55
export const CLE_PIECE = {
  pauseSS: 0.55, salleSS: 0.55, hallSS: 0.55, couloirSS: 0.5, passageSS: 0.5, sasSS: 0.55, palierSSE: 0.55, escalierSS: 0.55,
  escEstSS: 0.55, palierSS: 0.6, descenteEst: 0.6, e1couloir: 0.55, e2couloir: 0.7, couloirEst: 0.7, c05: 0.75, service: 0.6,
  local: 0.6, wcF: 0.75, wcH: 0.75, pmr: 0.75, vestEst: 0.8, escEst: 0.8, escEst2: 0.8, escEst3: 0.8, escalier: 0.85, palier1: 0.8,
  rue: 1.25, porche: 1.1, hall: 1.0, attente: 0.95, e1pause: 1.0,
};
const CLE_BASE = 1.35, HEMI_BASE = 0.85, ENV_BASE = 0.75, BOUCHE_ECLAIR = 2.6;

// ---------------------------------------------------------------- un ressort amorti, intégré EXACTEMENT
// (la solution de x'' = −ω²(x − c) − 2ζω x' sur `dt`, la cible tenue : la même courbe quelle que soit la cadence d'images)
class Ressort {
  constructor(w, z) { this.w = w; this.z = Math.min(z, 0.999); this.x = 0; this.v = 0; }
  pas(dt, c = 0) {
    if (!(dt > 0)) return this.x;
    const w = this.w, z = this.z, wd = w * Math.sqrt(1 - z * z), e = Math.exp(-z * w * dt), co = Math.cos(wd * dt), si = Math.sin(wd * dt);
    const A = this.x - c, B = (this.v + z * w * A) / wd;
    this.x = c + e * (A * co + B * si);
    this.v = e * ((-z * w * A + wd * B) * co + (-z * w * B - wd * A) * si);
    if (!Number.isFinite(this.x + this.v)) { this.x = c; this.v = 0; }
    return this.x;
  }
  // la vitesse à donner pour que le pic, lâché du repos, vaille `pic`
  static vitessePour(w, z, pic) { const s = Math.sqrt(1 - z * z); return pic * w / Math.exp(-z / s * Math.atan(s / z)); }
  raz() { this.x = 0; this.v = 0; }
}
const amortir = (x, c, tau, dt) => (dt > 0 ? c + (x - c) * Math.exp(-dt / tau) : x);
const borne = (x, a, b) => (x < a ? a : x > b ? b : x);

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _u = new THREE.Vector3(), _f = new THREE.Vector3(), _n = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const _pole = new THREE.Vector3(), _P = new THREE.Vector3(), _R = new THREE.Vector3(), _x = new THREE.Vector3();

export class Viewmodel {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.scene.name = 'scène de l’arme de vue';
    this.camera = new THREE.PerspectiveCamera(CHAMP_VUE, game.camera ? game.camera.aspect : 16 / 9, 0.01, 5);
    // LES TROIS LUMIÈRES de la scène de l'arme (constantes : hémisphère, clé, éclair de bouche à 0 hors tir)
    this.hemi = new THREE.HemisphereLight(0xdfe6ef, 0x3a342c, HEMI_BASE);
    this.cle = new THREE.DirectionalLight(0xfff4e8, CLE_BASE); this.cle.position.set(0.6, 1.0, 0.5);
    this.bouche = new THREE.PointLight(0xffc27a, 0, 2, 2); this.bouche.position.set(0.1, -0.05, -0.8);
    this.scene.add(this.hemi, this.cle, this.bouche);
    // l'arme (son origine = la prise de la main droite), les objets tenus à la main (couteau, grenades), les bras
    this.racine = new THREE.Group(); this.racine.name = 'arme de vue'; this.scene.add(this.racine);
    this.tenus = new THREE.Group(); this.tenus.name = 'tenus'; this.scene.add(this.tenus);
    this.armes = {}; this.objets = {}; this.courante = null; this._vitrine = null; this._supV = null; this._env = null;
    this._sup = { scene: this.scene, camera: this.camera };
    this.racine.visible = false;
    this.bras = null;                 // { groupe, model, rig, triangles, mats, os: {D:…, G:…}, repos }
    this._pret = false; this._prep = null;
    // L'ÉTAT DE L'ANIMATION (affichage seulement : rien ici n'entre dans l'état de la partie)
    this.t = 0;                                             // l'horloge de l'arme de vue (s), avancée par maj
    this.cachee = true; this._cacheeT = -1; this._sortieT = -1; this._partie = null; this._ck = 0;
    this.poids = { sprint: 0, sprintTact: 0, glisse: 0, franchit: 0 };
    this.recul = new Ressort(35, 0.55); this.reculR = new Ressort(35, 0.55); this.reculH = new Ressort(35, 0.55); this._reculSigne = 1;
    this.inertieL = new Ressort(18, 0.8); this.inertieT = new Ressort(18, 0.8);
    this.chasse = new Ressort(12, 0.999); this.reception = new Ressort(22, 0.7);
    this._phase = 0; this._amp = 0; this._lacet = null; this._tangage = 0; this._enAir = false; this._airT = 0;
    this._seq = null; this._tirT = -10; this._ressortArsenal = false; this._eclair = 0;
    this._geste = { cle: null, objet: null, poids: 0, vals: new Float64Array(VOIES.length), main: new Float64Array(VOIES_MAIN.length), poidsMain: 0 };
    this._lancer = { relache: -1, cle: null }; this._chg = { de: null, vers: null };
    this._chargeur = { capte: false, rel: new THREE.Matrix4(), decal: new THREE.Vector3(), d: 0 };
    this._inspection = -1;
    this.cleLissee = 1; this._piece = null; this._pieceN = 0;
    this._ancreD = new THREE.Vector3(...ANCRES.D); this._ancreG = new THREE.Vector3(...ANCRES.G);
    this._cibleD = { p: new THREE.Vector3(), f: new THREE.Vector3(), n: new THREE.Vector3() };
    this._cibleG = { p: new THREE.Vector3(), f: new THREE.Vector3(), n: new THREE.Vector3() };
    this._e = {};
    // ce que les tests lisent (et rien d'autre ne lit) : les erreurs des mains, les ancres, le chargeur, le recul
    this.diag = { erreurD: 0, erreurG: 0, ancreD: this._ancreD, ancreG: this._ancreG, chargeur: 0, chargeurParti: false, piston: 0, cabre: 0,
      roulis: 0, cle: 1, arme: null, geste: null, montree: false, maj: 0 };
  }

  // ---------------------------------------------------------------- la préparation (une fois par session ; ensuite, rien)
  async preparer(progres) {
    if (this._pret) return;
    if (this._prep) return this._prep;
    this._prep = this._preparer(progres).finally(() => { this._prep = null; });
    return this._prep;
  }
  async _preparer(progres) {
    const g = this.game, r = g.renderer;
    if (progres) progres('Armes et effets', 0.05);
    if (!this._env && r) {
      const pm = new THREE.PMREMGenerator(r), salle = new RoomEnvironment();
      this._envRT = pm.fromScene(salle, 0.04);
      this._env = this._envRT.texture;
      salle.dispose(); pm.dispose();
      this.scene.environment = this._env; this.scene.environmentIntensity = ENV_BASE;
    }
    for (const id of ARMES_VUE) {
      if (this.armes[id]) continue;
      const a = creerArme(id, { pourVue: true });
      a.visible = false; this._pourVue(a); this.racine.add(a); this.armes[id] = a;
    }
    for (const id of TENUS) {
      if (this.objets[id]) continue;
      const a = creerArme(id, { pourVue: true });
      a.visible = false; this._pourVue(a); this.tenus.add(a); this.objets[id] = a; this.armes[id] = a;
    }
    if (!this.bras) {
      try { await this._preparerBras(); } catch (e) { console.warn('[arme de vue] bras indisponibles :', e); }
    }
    if (progres) progres('Armes et effets', 0.3);
    // les programmes compilés pour les DEUX cibles où l'arme est dessinée (le tampon du composer ; l'écran, quand il est
    // coupé — la sortie et ses défines ne sont pas les mêmes), tout visible le temps de la compilation (8 s au plus)
    const vis = [this.racine.visible, this.tenus.visible, this.bras && this.bras.groupe.visible];
    const montres = [...Object.values(this.armes)].map((a) => [a, a.visible]);
    this.racine.visible = true; this.tenus.visible = true; if (this.bras) this.bras.groupe.visible = true;
    for (const [a] of montres) a.visible = true;
    try {
      const c = g._compilerAsync;
      const L = c ? [c.call(g, this.scene, this.scene, false, this.camera), c.call(g, this.scene, this.scene, true, this.camera)].filter(Boolean) : [];
      await Promise.race([Promise.all(L), new Promise((res) => setTimeout(res, 8000))]);
    } finally {
      for (const [a, v] of montres) a.visible = v;
      this.racine.visible = vis[0]; this.tenus.visible = vis[1]; if (this.bras) this.bras.groupe.visible = !!vis[2];
    }
    this._pret = true;
    if (progres) progres('Armes et effets', 0.5);
  }
  // une arme de la vue : jamais élaguée (ses os rigides ne recalculent pas sa sphère), sans ombre
  _pourVue(a) { a.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = false; o.receiveShadow = false; } }); }
  // LES BRAS coupés dans l'avatar de Haythem (banc/bras_fps.js, recopié et taillé)
  async _preparerBras() {
    const gltf = await prechargerModele(HAYTHEM.model);
    if (!gltf || !gltf.scene) throw new Error('avatar de Haythem absent');
    const model = skClone(gltf.scene);
    const rig = new AvatarRig(model);
    if (!rig.ok || !rig.aMains('Left') || !rig.aMains('Right')) throw new Error('squelette sans mains');
    for (const c of ['Left', 'Right']) for (let i = 1; i <= 3; i++) rig._prep(`${c}HandThumb${i}`);      // (les pouces : pas dans FINGERS)
    const vus = new Map(), jeter = [], mats = [];
    let tri = 0;
    model.traverse((o) => {
      if (!o.isMesh) return;
      const nm = (o.material && o.material.name) || '';
      if (o.isSkinnedMesh && /body|look/i.test(nm)) {
        if (!vus.has(o.material)) { const c = o.material.clone(); vus.set(o.material, c); mats.push(c); }
        o.material = vus.get(o.material);
        tri += couperBras(o);
        o.frustumCulled = false; o.castShadow = false; o.receiveShadow = false;
      } else jeter.push(o);                                   // (cheveux, chaussures : retirés, pas seulement cachés)
    });
    for (const o of jeter) o.parent && o.parent.remove(o);
    const s = HAYTHEM.height / HAYTHEM.modelHeight;
    model.scale.setScalar(s);
    const groupe = new THREE.Group(); groupe.name = 'bras de vue'; groupe.add(model);
    this.scene.add(groupe);
    // LE BUSTE posé UNE fois : tourné pour que la ligne de ses épaules suive celle des ancres de base (de profil, l'épaule
    // gauche en avant), ses épaules sur leur milieu — il ne bouge plus (on n'en dessine que les bras)
    const ep = (n) => { const v = new THREE.Vector3(); rig.bones[n].getWorldPosition(v); return v; };
    _v.set(ANCRES.G[0] - ANCRES.D[0], 0, ANCRES.G[2] - ANCRES.D[2]);
    model.rotation.set(0, Math.atan2(-_v.z, _v.x), 0);      // (la ligne droite → gauche du modèle, +x chez lui, sur celle des ancres)
    groupe.updateMatrixWorld(true);
    _w.addVectors(ep('RightArm'), ep('LeftArm')).multiplyScalar(0.5);
    model.position.set((ANCRES.D[0] + ANCRES.G[0]) / 2 - _w.x, (ANCRES.D[1] + ANCRES.G[1]) / 2 - _w.y, (ANCRES.D[2] + ANCRES.G[2]) / 2 - _w.z);
    groupe.updateMatrixWorld(true);
    // LES BRAS DÉTACHÉS DU BUSTE (Object3D.attach : leur pose de repos gardée) sous `epaules`, au repère de la scène : l'os
    // du bras se pose sur son ancre sans remonter la chaîne du buste — la cinématique inverse ne recalcule plus que bras,
    // avant-bras, main et doigts (mesuré : 0,20 → 0,06 ms par image). La peau suit les os où qu'ils soient (three :
    // os.matrixWorld × inverse de liaison) ; ce qui reste lié aux clavicules s'étire hors de l'image.
    const epaules = new THREE.Group(); epaules.name = 'épaules'; groupe.add(epaules); epaules.updateMatrixWorld(true);
    for (const n of ['RightArm', 'LeftArm']) epaules.attach(rig.bones[n]);
    // (ce qui ne bouge pas ne se recalcule pas : le buste, et les doigts tant que leur flexion ne change pas — _doigts)
    const repos = [];
    groupe.traverse((o) => {
      if (o.isBone && /^(Left|Right)(Arm|ForeArm|Hand)$/.test(o.name.replace(/^mixamorig:?/, ''))) { repos.push([o, o.position.clone(), o.quaternion.clone()]); return; }
      o.updateMatrix(); o.matrixAutoUpdate = false;
    });
    this.bras = { groupe, model, rig, triangles: tri, mats, repos, epaules, doigts: { Right: new Float64Array(9).fill(NaN), Left: new Float64Array(9).fill(NaN) },
      os: { D: rig.bones.RightArm, G: rig.bones.LeftArm }, mains: { D: rig.bones.RightHand, G: rig.bones.LeftHand } };
    groupe.visible = false;
  }

  get superposition() { return this._sup; }
  montrer(idArme) {
    const a = this.armes[idArme] || null;
    if (this.courante && this.courante !== a) this.courante.visible = false;
    this.courante = a;
    if (a) { a.visible = true; this.racine.visible = true; }
  }
  cacher() {
    this.racine.visible = false; this.tenus.visible = false;
    if (this.bras) this.bras.groupe.visible = false;
    this.bouche.intensity = 0;
    if (!this.cachee) this._cacheeT = this.t;
    this.cachee = true; this.diag.montree = false;
  }
  // l'INSPECTION (tenir R, arme pleine : CoD § 6.4) — le geste, sans règle ; à brancher sur l'entrée par F2 ou INT
  inspecter() { this._inspection = this.t; }

  // ---------------------------------------------------------------- l'état lu (VueFPS.etatArme, complété par l'arsenal)
  // L'état de VueFPS.etatArme (§ 4.5.7) ne dit pas tout ce qu'un geste montre : l'arme qui VIENT pendant un changement, la
  // durée de la recharge (le FP-12 compte ses cartouches), tactique ou à vide, le compte des tirs, la grenade et sa
  // cuisson. On les lit dans l'ARSENAL de l'acteur local (l'état, jamais une règle), un champ de `etat` passant devant.
  // (Relecture du 23/10, avant F2 : l'arsenal de L-A dit en plus `grenade` — 'frag' | 'flash' — et `phaseLancer` —
  // 'goupille' | 'tenue' | 'lance' | 'remontee' — et son `tEtat` REPART au lâcher de la grenade : lus quand il les a.)
  _lire(etat) {
    const e = this._e, P = this.game.partie, a = P && P.local, A = a && a.arsenal;
    e.arme = etat.arme || null; e.et = etat.etatArme || 'pret'; e.t = +etat.tEtat || 0; e.visee = borne(+etat.visee || 0, 0, 1);
    e.reculV = +etat.reculV || 0; e.reculH = +etat.reculH || 0; e.sprint = !!etat.sprint; e.sprintTact = !!etat.sprintTact;
    e.glisse = borne(+etat.glisse || 0, 0, 1); e.vitesse = Math.max(0, +etat.vitesse || 0); e.accroupi = +etat.accroupi || 0;
    e.enAir = !!etat.enAir; e.mort = !!etat.mort; e.tirFront = !!etat.tirFront; e.dt = 0;
    e.seq = etat.tirSeq !== undefined ? etat.tirSeq : (A ? A.tirSeq : 0);
    e.vers = etat.vers !== undefined ? etat.vers : (A && A.vers >= 0 && A.armes && A.armes[A.vers] ? A.armes[A.vers].id : null);
    e.duree = etat.duree !== undefined ? etat.duree : (A && Number.isFinite(A.fin) && Number.isFinite(A.t0) ? A.fin - A.t0 : null);
    e.tactique = etat.tactique !== undefined ? !!etat.tactique : (A ? !!A.tact : true);
    e.chargeur = etat.chargeur !== undefined ? etat.chargeur : (A ? A.chargeur : 1);
    e.grenade = etat.grenade || (A && A.grenade) || (a && a.cmd && a.cmd.tactique ? 'flash' : 'frag');
    e.cuisson = etat.cuisson !== undefined ? !!etat.cuisson : !!(a && a.cmd && a.cmd.letale);
    e.phaseLancer = etat.phaseLancer !== undefined ? etat.phaseLancer : (A && typeof A.phaseLancer === 'string' ? A.phaseLancer : null);
    // la vitesse de côté (le pas chassé) : la vitesse du corps sur la droite du regard
    if (etat.lateral !== undefined) e.lateral = +etat.lateral || 0;
    else { const c = a && a.corps, l = this.game.camYaw || 0; e.lateral = c && c.vel ? c.vel.x * Math.cos(l) - c.vel.z * Math.sin(l) : 0; }
    return e;
  }

  // ---------------------------------------------------------------- une image
  maj(dt, etat) {
    const t0 = performance.now();
    const c = this.camera, g = this.game.camera;
    if (g && Math.abs(c.aspect - g.aspect) > 1e-6) { c.aspect = g.aspect; c.updateProjectionMatrix(); }
    if (this._vitrine) { this.diag.maj = performance.now() - t0; return; }
    dt = borne(Number.isFinite(dt) ? dt : 0, 0, 0.1);
    // une partie neuve : ses compteurs à elle (le compte des tirs repart, le ressort de l'arsenal est à redécouvrir)
    if (this.game.partie !== this._partie) { this._partie = this.game.partie; this._seq = null; this._ressortArsenal = false; this._geste.poids = 0; this._geste.cle = null; this._chg.de = null; }
    const e = this._lire(etat || {});
    e.dt = dt;
    // LE CHANGEMENT D'ARME : celle qu'on range est celle qu'on tenait quand il a commencé, celle qui vient `vers` — l'arsenal
    // du squelette passe à la nouvelle à la FIN de la sortie, celui de L-A à la fin du RANGEMENT : on ne dépend d'aucun
    const chg = this._chg;
    if (e.et !== 'change') { chg.de = null; chg.vers = null; }
    else if (!chg.de) { chg.de = e.arme; chg.vers = e.vers || e.arme; }
    else if (e.vers && e.vers !== chg.de) chg.vers = e.vers;
    if (!e.arme || e.mort || !this.armes[e.arme]) { this.cacher(); this._seq = e.seq; this.diag.maj = performance.now() - t0; return; }
    this.t += dt;
    if (this.cachee) {
      // revenue (réapparition, sortie de la caméra de mort) : l'arme sort, comme d'un étui — après plus de 0,3 s cachée
      if (this.t - this._cacheeT > 0.3 && e.et !== 'change') this._sortieT = this.t;
      this.cachee = false; this.recul.raz(); this.reculR.raz(); this.reculH.raz(); this.reception.raz();
      this.inertieL.raz(); this.inertieT.raz(); this._lacet = null;
    }
    // LA LUNETTE du TP-50 : à 85 % de la visée, l'arme se cache (le HUD pose le masque) — ses ressorts tournent quand même
    const lunette = e.arme === 'tp50' && e.visee >= 0.85;
    // 1. l'arme montrée : pendant un changement, l'ancienne jusqu'au bout de son rangement, puis celle qui vient
    let id = e.arme;
    if (e.et === 'change' && chg.de) id = e.t >= ((ARMES[chg.de] && ARMES[chg.de].rangement) || 0) ? chg.vers : chg.de;
    if (!this.armes[id] || !ARMES_VUE.includes(id)) id = ARMES_VUE.includes(e.arme) ? e.arme : 'fa24';
    if (!this.courante || this.courante.userData.arme !== id) this.montrer(id);
    const f = ARMES[id], PR = PRISES[id] || PRISES.fa24;
    // 2. les tirs (le compte de l'arsenal) : le ressort du recul, l'éclair, la pièce mobile
    this._tirs(e, f, dt);
    // 3. les poses (poids lissés 0,1 s)
    const P = this.poids, veutSprint = (e.sprint || e.et === 'sprint') && e.vitesse > 3 && e.visee < 0.05;
    P.sprintTact = amortir(P.sprintTact, veutSprint && e.sprintTact ? 1 : 0, 0.09, dt);
    P.sprint = amortir(P.sprint, veutSprint && !e.sprintTact ? 1 : 0, 0.1, dt);
    P.glisse = amortir(P.glisse, e.glisse > 0.05 ? 1 : 0, 0.07, dt);
    P.franchit = amortir(P.franchit, e.et === 'franchit' ? 1 : 0, 0.06, dt);
    // (les poses qui ne vont pas avec le geste en cours : pas de sprint pendant une recharge, un couteau, une grenade)
    const geste = e.et === 'recharge' || e.et === 'couteau' || e.et === 'lancer' || e.et === 'change';
    const ks = geste ? 0.35 : 1;
    let wS = P.sprint * ks, wT = P.sprintTact * ks, wG = P.glisse, wF = P.franchit;
    const somme = wS + wT + wG + wF; if (somme > 1) { wS /= somme; wT /= somme; wG /= somme; wF /= somme; }
    const H = (POSES_ARMES[id] && POSES_ARMES[id].hanche) || POSES_VUE.hanche, kv = e.visee * (1 - wF);     // (la courbe 1 − (1 − t)³ est celle de l'Arsenal, § 3.2 : pas une 2e ici)
    const vis = REPERES[id] && REPERES[id].visee ? REPERES[id].visee : [0, 0.06, 0];
    for (let i = 0; i < 3; i++) {
      let p = H.p[i] + wS * (POSES_VUE.sprint.p[i] - H.p[i]) + wT * (POSES_VUE.sprintTact.p[i] - H.p[i]) + wG * (POSES_VUE.glisse.p[i] - H.p[i]) + wF * (POSES_VUE.franchit.p[i] - H.p[i]);
      let r = H.r[i] + wS * (POSES_VUE.sprint.r[i] - H.r[i]) + wT * (POSES_VUE.sprintTact.r[i] - H.r[i]) + wG * (POSES_VUE.glisse.r[i] - H.r[i]) + wF * (POSES_VUE.franchit.r[i] - H.r[i]);
      const pv = i === 0 ? -vis[0] : i === 1 ? -vis[1] : -0.24 - vis[2];
      _P.setComponent(i, p + (pv - p) * kv); _R.setComponent(i, r * (1 - kv));
    }
    // 4. le geste en cours (piste) et son poids
    const Gv = this._gestes(e, id, f, dt);
    const ix = CHRONOS.fa24.rechargeTact.i, w = this._geste.poids;
    _P.x += Gv[ix.x] * w; _P.y += Gv[ix.y] * w; _P.z += Gv[ix.z] * w;
    _R.x += Gv[ix.rx] * w; _R.y += Gv[ix.ry] * w; _R.z += Gv[ix.rz] * w;
    const M = this._geste.main, wm = this._geste.poidsMain, iM = CHRONOS.couteau.coup.i;
    _P.x += M[iM.x] * wm; _P.y += M[iM.y] * wm; _P.z += M[iM.z] * wm; _R.x += M[iM.rx] * wm; _R.y += M[iM.ry] * wm; _R.z += M[iM.rz] * wm;
    // la sortie de l'étui (réapparition)
    if (this._sortieT >= 0) {
      const S = CHRONOS[id] && CHRONOS[id].sortie, ts = this.t - this._sortieT;
      if (!S || ts > S.duree) this._sortieT = -1;
      else { const o = evaluer(S, ts, this._tmp || (this._tmp = new Float64Array(VOIES.length))); _P.x += o[ix.x]; _P.y += o[ix.y]; _R.x += o[ix.rx]; _R.z += o[ix.rz]; }
    }
    // 5. les ressorts : inertie du regard, balancement, pas chassé, réception, recul, respiration
    // (le facteur du balancement en huit, `bal` des poses mêlées : sprint × 2,5, glissade × 0,3, visée × 0,1)
    const V = POSES_VUE, bal = (H.bal + wS * (V.sprint.bal - H.bal) + wT * (V.sprintTact.bal - H.bal) + wG * (V.glisse.bal - H.bal) + wF * (V.franchit.bal - H.bal))
      * (1 + (V.visee.bal - 1) * kv);
    this._ressorts(e, f, dt, kv, bal);
    // 6. l'arme posée
    const A = this.racine;
    A.position.copy(_P); _e.set(_R.x, _R.y, _R.z, 'YXZ'); A.quaternion.setFromEuler(_e);
    const montree = Gv && (M[iM.vis] > 0.5 || wm < 0.5);
    A.visible = !lunette && montree;
    A.updateMatrixWorld(true);
    // 7. les pièces mobiles et le chargeur, puis les bras
    this._pieces(e, id, f, PR, Gv, w);
    this._mains(e, id, PR, Gv, w, M, wm, lunette);
    // 8. la lumière de la pièce, l'éclair de bouche, le champ
    this._lumieres(dt, id);
    const fov = CHAMP_VUE + (CHAMP_VISEE - CHAMP_VUE) * kv;
    if (Math.abs(c.fov - fov) > 1e-4) { c.fov = fov; c.updateProjectionMatrix(); }
    // L'ÉCRAN ÉTROIT (un téléphone en hauteur : 12,7° de demi-champ horizontal au lieu de 40,9° en 16:9) : la caméra de l'arme
    // tourne vers elle, la prise ramenée à 60 % du demi-champ, et revient dans l'axe en visée (en 16:9 et 4:3 : rien ou presque)
    const dh = Math.atan(Math.tan(CHAMP_VUE / 2 * DEG) * c.aspect), lacet = -Math.max(0, Math.atan2(H.p[0], -H.p[2]) - 0.6 * dh) * (1 - kv);
    if (Math.abs(c.rotation.y - lacet) > 1e-6) { c.rotation.set(0, lacet, 0); c.updateMatrixWorld(); }
    this.diag.arme = id; this.diag.montree = !lunette;
    if (lunette) { this.racine.visible = false; this.tenus.visible = false; if (this.bras) this.bras.groupe.visible = false; }
    this.diag.maj = performance.now() - t0;
  }

  // les TIRS de l'image : le compte de l'arsenal a avancé → un coup de ressort par tir (le recul visuel), l'éclair de bouche
  _tirs(e, f, dt) {
    const n = this._seq === null ? 0 : Math.max(0, Math.min(4, e.seq - this._seq));
    this._seq = e.seq;
    if (e.reculV > 1e-4) this._ressortArsenal = true;
    for (let k = 0; k < n; k++) {
      const v0 = Ressort.vitessePour(35, 0.55, 1);
      this.recul.v += v0;
      this._reculSigne = Math.random() < 0.5 ? -1 : 1;              // (affichage : le hasard du décor est permis)
      this.reculR.v += v0 * this._reculSigne * (0.4 + 0.6 * Math.random());
      this.reculH.v += v0 * (Math.random() * 2 - 1) * 0.5;
      this._tirT = this.t; this._eclair = 0.05;
    }
    this._eclair = Math.max(0, this._eclair - dt);
  }

  // LES GESTES : la piste qui joue (recharge, changement, culasse, pompe, inspection — voies d'ARME) et celle de la main
  // (couteau, grenade — voies de MAIN), lues à l'heure de l'état de l'arsenal ; une piste qui s'arrête s'éteint en 0,15 s
  _gestes(e, id, f, dt) {
    const G = this._geste, C = CHRONOS[id];
    let cle = null, P = null, t = 0;
    if (e.et === 'recharge' && C) {
      if (id === 'fp12') {
        const r = f.recharge, D = e.duree ?? (r.debut + r.parCartouche * 7 + r.fin), vide = !e.tactique;
        const nC = Math.max(0, Math.round((D - r.debut - r.fin - (vide ? r.pompe : 0)) / r.parCartouche));
        const tc = e.t - r.debut, tf = tc - nC * r.parCartouche, tp = tf - r.fin;
        if (tc < 0) { cle = 'fp12.debut'; P = C.debut; t = e.t; }
        else if (tf < 0) { cle = 'fp12.cartouche'; P = C.cartouche; t = tc % r.parCartouche; }
        else if (tp < 0 || !vide) { cle = 'fp12.fin'; P = C.fin; t = tf; }
        else { cle = 'fp12.pompe'; P = C.pompe; t = tp; }
      } else { P = e.tactique ? C.rechargeTact : C.rechargeVide; cle = id + (e.tactique ? '.tact' : '.vide'); t = e.t; }
    } else if (e.et === 'change' && C) {
      const de = this._chg.de || e.arme, fO = ARMES[de] || f;
      if (e.t < fO.rangement && CHRONOS[de]) { cle = de + '.rangement'; P = CHRONOS[de].rangement; t = e.t; }
      else { cle = id + '.sortie'; P = C.sortie; t = e.t - (fO.rangement || 0); }
    } else if (C && C.apresTir && this.t - this._tirT < C.apresTir.duree && (e.et === 'tir' || e.et === 'pret')) {
      cle = id + '.apresTir'; P = C.apresTir; t = this.t - this._tirT;
    } else if (this._inspection >= 0 && this.t - this._inspection < CHRONOS.inspection.duree && e.et === 'pret') {
      cle = 'inspection'; P = CHRONOS.inspection; t = this.t - this._inspection;
    } else this._inspection = -1;
    if (P) { evaluer(P, t, G.vals); G.cle = cle; G.poids = 1; }
    else G.poids = amortir(G.poids, 0, 0.05, dt);     // (0,15 s : 95 % éteint)
    if (G.poids < 1e-3) { G.poids = 0; G.cle = null; }
    // LA MAIN : couteau, grenade
    let PM = null, tm = 0;
    const L = this._lancer;
    if (e.et === 'couteau') { PM = CHRONOS.couteau.coup; tm = e.t; }
    else if (e.et === 'lancer') {
      const Gr = CHRONOS.grenade, ph = e.phaseLancer;
      if (L.cle === null) { L.cle = e.grenade; L.relache = -1; }
      if (ph === 'lance') { PM = Gr.lancer; tm = Math.min(e.t, Gr.lancer.duree); }
      else if (ph === 'remontee') {
        // (le `tEtat` de l'arsenal repart au lâcher : la remontée occupe la fin du geste — tout le geste si elle a éclaté en main)
        const D = Number.isFinite(e.duree) ? e.duree : Gr.lancer.duree + Gr.remontee.duree;
        PM = Gr.remontee; tm = borne(e.t - (D - Gr.remontee.duree), 0, Gr.remontee.duree);
      } else if (e.t < Gr.goupille.duree) { PM = Gr.goupille; tm = e.t; }
      else if (ph === 'tenue' || (ph === null && L.relache < 0 && e.cuisson && L.cle === 'frag')) { PM = Gr.tenue; tm = (e.t - Gr.goupille.duree) % Gr.tenue.duree; }
      else {
        if (L.relache < 0) L.relache = e.t;
        const tl = e.t - L.relache;
        if (tl < Gr.lancer.duree) { PM = Gr.lancer; tm = tl; } else { PM = Gr.remontee; tm = Math.min(tl - Gr.lancer.duree, Gr.remontee.duree); }
      }
    } else L.cle = null;
    if (PM) { evaluer(PM, tm, G.main); G.poidsMain = 1; G.objet = e.et === 'couteau' ? 'couteau' : (L.cle === 'flash' ? 'flash' : 'frag'); }
    else G.poidsMain = amortir(G.poidsMain, 0, 0.05, dt);
    if (G.poidsMain < 1e-3) { G.poidsMain = 0; G.main.fill(0); G.main[CHRONOS.couteau.coup.i.vis] = 1; }
    this.diag.geste = G.cle || (PM ? (e.et === 'couteau' ? 'couteau' : 'grenade') : null);
    return G.vals;
  }

  // LES RESSORTS posés sur _P / _R (l'arme), dans l'ordre : inertie du regard, balancement en huit, pas chassé,
  // réception, recul visuel, respiration
  _ressorts(e, f, dt, kv, bal) {
    const g = this.game, l = g.camYaw || 0, tg = g.camPitch || 0;
    // la vitesse angulaire du regard (°/s) → l'arme traîne : −0,0016 × ω, ±3°
    let wl = 0, wt = 0;
    if (this._lacet !== null && dt > 0) {
      let d = l - this._lacet; d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI;
      wl = d / dt / DEG; wt = (tg - this._tangage) / dt / DEG;
    }
    this._lacet = l; this._tangage = tg;
    const ki = 1 - 0.65 * kv;
    const cl = borne(-0.0016 * wl, -3, 3) * DEG * ki, ct = borne(0.0016 * wt, -3, 3) * DEG * ki;
    const il = this.inertieL.pas(dt, cl), it = this.inertieT.pas(dt, ct);
    _R.y += il; _R.x += it; _P.x -= il * 0.06; _P.y += it * 0.05;
    // le balancement en huit : latéral 12 mm à f/2, vertical 8 mm à f, f = 1,15 + 0,35 v ; × 2,5 au sprint, × 0,1 en visée
    // (12 mm à la course, 5 m/s, et moins en marchant ; plafonné là : le sprint fait 30 mm, pas 2,5 × 1,32 × 12 = 40 —
    // relecture du 23/10)
    const v = e.enAir ? 0 : e.vitesse, fq = 1.15 + 0.35 * v;
    this._phase = (this._phase + Math.PI * fq * dt) % (2 * Math.PI);          // (θ avance à f/2 : un pas = π)
    const kb = bal * (e.accroupi > 0.5 ? 0.7 : 1);
    this._amp = amortir(this._amp, borne(v / 5, 0, 1) * kb, 0.12, dt);
    const th = this._phase, A = this._amp;
    _P.x += 0.012 * A * Math.sin(th); _P.y += 0.008 * A * Math.sin(2 * th) - 0.003 * A;
    _R.z += -0.6 * DEG * A * Math.sin(th); _R.x += 0.4 * DEG * A * Math.sin(2 * th);
    // le pas chassé : 3° de roulis du côté où l'on glisse
    _R.z += this.chasse.pas(dt, -3 * DEG * borne(e.lateral / 5, -1, 1) * (1 - 0.7 * kv));
    // la réception : −2,5 cm (ressort ω 22, ζ 0,7) après une chute de plus de 0,3 s en l'air ; un petit saut d'arme au départ
    if (e.enAir && !this._enAir) { this._airT = 0; this.reception.v += Ressort.vitessePour(22, 0.7, 0.01); }
    if (e.enAir) this._airT += dt;
    if (!e.enAir && this._enAir) this.reception.v -= Ressort.vitessePour(22, 0.7, 0.025 * borne(this._airT / 0.3, 0.3, 1));
    this._enAir = e.enAir;
    _P.y += this.reception.pas(dt, 0) * (1 - 0.6 * kv);
    // le RECUL VISUEL (§ 3.4) : l'arme recule de `piston`, se cabre de `cabre`, roule de ±`roulis` ; le cabré de l'arsenal
    // quand il le donne (le même que la caméra reçoit à 15 %), sinon le nôtre
    const R = f.recul || {}, k = this.recul.pas(dt, 0), kr = this.reculR.pas(dt, 0), kh = this.reculH.pas(dt, 0);
    const cabre = this._ressortArsenal ? e.reculV : (R.cabre || 0) * k;
    const piston = (R.piston || 0) * (this._ressortArsenal && R.cabre ? e.reculV / R.cabre : k);
    const pv = 1 - 0.35 * kv;                                                 // (en visée, le cabré reste mais l'arme tient l'axe)
    _P.z += piston; _P.y += piston * 0.12;
    _R.x += cabre * DEG * pv; _R.z += (R.roulis || 0) * kr * DEG; _R.y += (this._ressortArsenal ? e.reculH : 0.25 * (R.roulis || 0) * kh) * DEG * pv;
    this.diag.piston = piston; this.diag.cabre = cabre; this.diag.roulis = (R.roulis || 0) * kr;
    // la respiration à l'arrêt (±1,5 mm à 0,25 Hz)
    const b = (1 - borne(this._amp, 0, 1)) * (1 - 0.9 * kv);
    _P.y += 0.0015 * b * Math.sin(this.t * 2 * Math.PI * 0.25); _R.x += 0.08 * DEG * b * Math.sin(this.t * 2 * Math.PI * 0.25 + 0.7);
  }

  // un os mobile de l'arme (L-W : `userData.os`) déplacé de `d` (m, repère de l'arme) et tourné de `q` depuis son repos
  _os(arme, nom, dx, dy, dz, q = null) {
    const os = arme.userData.os && arme.userData.os[nom];
    if (!os) return;
    const r = os.userData.repos || (os.userData.repos = { p: os.position.clone(), q: os.quaternion.clone() });
    os.position.set(r.p.x + dx, r.p.y + dy, r.p.z + dz);
    if (q) os.quaternion.copy(r.q).multiply(q); else os.quaternion.copy(r.q);
  }
  // LES PIÈCES MOBILES : détente, glissière (P-17 : 3 cm au tir, bloquée en arrière à vide), pompe (FP-12, 9 cm), culasse
  // (TP-50 : levier 60°, 8 cm ; FA-24 et PM-9 : le levier d'armement), goupille ; et le CHARGEUR qui part avec la main
  _pieces(e, id, f, PR, Gv, w) {
    const a = this.courante; if (!a) return;
    const ix = CHRONOS.fa24.rechargeTact.i, dt = this.t - this._tirT;
    // la détente : tirée 60 ms à chaque coup (et tenue au tir automatique)
    this._os(a, 'detente', 0, 0, dt < 0.06 || (f.auto && e.et === 'tir') ? 0.006 : 0);
    const culT = Gv[ix.culT] * w, cul = Gv[ix.cul] * w;
    if (id === 'p17') {
      const tir = dt < 0.09 ? (dt < 0.025 ? dt / 0.025 : 1 - (dt - 0.025) / 0.065) : 0;
      const bloquee = e.chargeur === 0 && e.et !== 'recharge' ? 1 : 0;
      this._os(a, 'glissiere', 0, 0, 0.03 * Math.max(tir, bloquee, culT));
    } else if (id === 'fp12') this._os(a, 'pompe', 0, 0, (PR.course || 0.09) * culT);
    else if (id === 'tp50') { _q.setFromAxisAngle(_u.set(0, 0, 1), 60 * DEG * cul); this._os(a, 'culasse', 0, 0, 0.08 * culT, _q); }
    else this._os(a, 'culasse', 0, 0, 0.06 * culT);
    this._ck = Gv[ix.ck] * w;
  }

  // LES MAINS : les ancres des épaules, les cibles des poignets (sur l'arme, libres, sur un objet tenu), l'IK, les doigts,
  // le chargeur qui suit la main gauche, les objets tenus
  _mains(e, id, PR, Gv, w, M, wm, lunette) {
    const B = this.bras, A = this.racine, ix = CHRONOS.fa24.rechargeTact.i, iM = CHRONOS.couteau.coup.i;
    // la main droite : la poignée, ou le levier de culasse (TP-50), ou libre (couteau, grenade)
    const cD = this._cibleD, cG = this._cibleG;
    this._priseMonde(PR.d, A, cD);
    const dl = Gv[ix.dl] * w;
    if (dl > 0 && PR.levier) { this._priseMonde(PR.levier, A, _T1); melanger(cD, _T1, dl); }
    const dk = M[iM.dk] * wm;
    if (dk > 0) {
      _e.set(M[iM.drx], M[iM.dry], M[iM.drz], 'YXZ'); _q.setFromEuler(_e);
      _T1.p.set(M[iM.dx], M[iM.dy], M[iM.dz]); _T1.f.copy(F0).applyQuaternion(_q); _T1.n.copy(N0).applyQuaternion(_q);
      melanger(cD, _T1, dk);
    }
    // la main gauche : sa prise (garde-main, pompe et sa course), vers le chargeur (gm) ou l'arrêtoir (ga), décalée, libre
    const gm = Gv[ix.gm] * w, ga = Gv[ix.ga] * w, gl = Math.max(Gv[ix.gl] * w, M[iM.gl] * wm);
    const pg = PR.g, course = id === 'fp12' ? (PR.course || 0.09) * Gv[ix.culT] * w : 0;
    _T2.p.set(pg.o[0] + pg.p[0], pg.o[1] + pg.p[1], pg.o[2] + pg.p[2] + course); _T2.f.copy(pg.f); _T2.n.copy(pg.n);
    if (gm > 0) melangerPrise(_T2, PR.chargeur, gm);
    if (ga > 0) melangerPrise(_T2, PR.arretoir, ga);
    _T2.p.x += Gv[ix.gox] * w; _T2.p.y += Gv[ix.goy] * w; _T2.p.z += Gv[ix.goz] * w;
    porter(_T2, A, cG);
    if (gl > 0) {
      const lib = M[iM.gl] * wm > Gv[ix.gl] * w;
      _T1.p.set(lib ? M[iM.gfx] : Gv[ix.gfx], lib ? M[iM.gfy] : Gv[ix.gfy], lib ? M[iM.gfz] : Gv[ix.gfz]); _T1.f.copy(FL); _T1.n.copy(NL);
      melanger(cG, _T1, gl);
    }
    // les ANCRES des épaules : à leur place, poussées vers la prise au-delà de 0,45 m, gardées sous le bord bas
    this._ancre(this._ancreD, ANCRES.D, cD.p);
    this._ancre(this._ancreG, ANCRES.G, cG.p);
    if (!B) { this.diag.erreurD = 0; this.diag.erreurG = 0; this._tenus(e, M, wm, lunette, null); return; }
    B.groupe.visible = !lunette;
    // les bras repartent de leur repos, l'os de chaque bras posé SUR son ancre
    const R = B.rig;
    for (const [b, p, q] of B.repos) { b.position.copy(p); b.quaternion.copy(q); }
    B.os.D.position.copy(this._ancreD); B.os.G.position.copy(this._ancreG);
    B.os.D.updateMatrixWorld(true); B.os.G.updateMatrixWorld(true);
    // l'IK des deux bras, exacte (deux os) ; les coudes plient vers POLES
    _pole.set(...POLES.D).multiplyScalar(0.3).add(this._ancreD);
    R.ikBras('Right', cD.p, cD.f, cD.n, _pole, 1);
    _pole.set(...POLES.G).multiplyScalar(0.3).add(this._ancreG);
    R.ikBras('Left', cG.p, cG.f, cG.n, _pole, 1);
    // les doigts : la prise (la poignée, l'index sur la détente — replié au tir —, le garde-main, le chargeur…)
    const tir = this.t - this._tirT < 0.08 || e.et === 'tir';
    const dD = dk > 0.5 ? DOIGTS_TENUS : PR.d, dG = gl > 0.5 ? DOIGTS_LIBRES : gm > 0.5 ? PR.chargeur : ga > 0.5 ? PR.arretoir : pg;
    this._doigts(B, 'Right', dD.doigts, tir && dk < 0.5 ? DETENTE : dD.index, dD.pouce || POUCE0, e.dt);
    this._doigts(B, 'Left', dG.doigts, dG.index, dG.pouce || POUCE0, e.dt);
    B.mains.D.getWorldPosition(_v); this.diag.erreurD = _v.distanceTo(cD.p);
    B.mains.G.getWorldPosition(_v); this.diag.erreurG = _v.distanceTo(cG.p);
    // le chargeur suit la main gauche (ck) : saisi tel qu'il est quand la main le prend, rendu en place à ck = 0
    this._chargeurMain(B, A, PR);
    this._tenus(e, M, wm, lunette, B);
  }
  // une ancre d'épaule : depuis sa place de base, tirée vers la cible au-delà de PORTEE_EPAULE, puis ramenée sous le bord bas
  _ancre(out, base, cible) {
    out.set(base[0], base[1], base[2]);
    const d = out.distanceTo(cible);
    if (d > PORTEE_EPAULE) out.lerp(cible, (d - PORTEE_EPAULE) / d);
    // sous le bord bas : l'angle de l'ancre sous le plan du bas du cône (champ de 52°, le plus large) d'au moins MARGE_BORD
    const h = CHAMP_VUE / 2 * DEG;
    for (let k = 0; k < 3; k++) {
      const L = out.length(), s = (out.y * Math.cos(h) - out.z * Math.sin(h)) / Math.max(1e-6, L);
      if (s <= -Math.sin(MARGE_BORD)) break;
      out.y -= (s + Math.sin(MARGE_BORD)) * L / Math.cos(h) * 1.02 + 0.002;
    }
    return out;
  }
  // une prise de l'arme (repère de l'arme) portée dans la scène : le poignet, les doigts, la paume
  _priseMonde(pr, A, out) {
    _T3.p.set(pr.o[0] + pr.p[0], pr.o[1] + pr.p[1], pr.o[2] + pr.p[2]); _T3.f.copy(pr.f); _T3.n.copy(pr.n);
    return porter(_T3, A, out);
  }
  // LE CHARGEUR : quand la main gauche le prend (ck passe au-dessus de 0), on retient sa place dans la main ; tant que ck > 0,
  // il est entre sa place dans l'arme et la main (ck = 1 : dans la main) — à ck = 0 il est EN PLACE, exactement
  _chargeurMain(B, A, PR) {
    const C = this._chargeur, ck = this._ck || 0, main = B.mains.G;
    // la place du chargeur au repos : le point tenu par la main (repère de l'arme), porté dans la scène
    const o = PR.chargeur.o;
    _m.makeTranslation(o[0], o[1], o[2]).premultiply(A.matrixWorld);                      // repos → scène
    if (ck <= 1e-4) { C.capte = false; C.decal.set(0, 0, 0); C.d = 0; this.diag.chargeur = 0; this.diag.chargeurParti = false; this._poserChargeur(A, null); return; }
    if (!C.capte) { C.capte = true; C.rel.copy(main.matrixWorld).invert().multiply(_m); }   // (la main → le chargeur, saisi)
    _m2.copy(main.matrixWorld).multiply(C.rel);                                            // dans la main
    // entre les deux : la position mélangée, l'orientation mélangée
    _v.setFromMatrixPosition(_m); _w.setFromMatrixPosition(_m2); _v.lerp(_w, ck);
    _q.setFromRotationMatrix(_m); _q2.setFromRotationMatrix(_m2); _q.slerp(_q2, ck);
    _m2.compose(_v, _q, _u.set(1, 1, 1));
    // le décalage, dans l'arme (ce que les tests mesurent ; l'os du chargeur de L-W reçoit la même transformation)
    _m.copy(A.matrixWorld).invert().multiply(_m2);
    C.decal.setFromMatrixPosition(_m).sub(_u.set(o[0], o[1], o[2]));
    C.d = C.decal.length(); this.diag.chargeur = C.d; this.diag.chargeurParti = C.d > 0.002;
    this._poserChargeur(A, _m);
  }
  // l'os `chargeur` de l'arme (L-W) : repos, ou la transformation du point tenu (`m` : le point tenu dans le repère de l'arme)
  _poserChargeur(A, m) {
    const a = this.courante, os = a && a.userData.os && a.userData.os.chargeur;
    if (!os) return;
    const r = os.userData.repos || (os.userData.repos = { p: os.position.clone(), q: os.quaternion.clone() });
    if (!m) { os.position.copy(r.p); os.quaternion.copy(r.q); return; }
    // le delta (repère de l'arme) : m · repos⁻¹ du point tenu, appliqué à l'os, exprimé dans le repère de son parent
    const o = (PRISES[a.userData.arme] || PRISES.fa24).chargeur.o;
    _m2.makeTranslation(-o[0], -o[1], -o[2]).premultiply(m);                         // delta, repère de l'arme
    os.position.copy(r.p); os.quaternion.copy(r.q); os.updateMatrix();
    a.updateMatrixWorld(true);
    _m.copy(os.parent.matrixWorld).invert().multiply(A.matrixWorld).multiply(_m2).multiply(_mm.copy(A.matrixWorld).invert()).multiply(os.matrixWorld);
    _m.decompose(os.position, os.quaternion, _u);
  }
  // les OBJETS TENUS (couteau, grenade) : dans la main droite, au repère de sa paume
  _tenus(e, M, wm, lunette, B) {
    const iM = CHRONOS.couteau.coup.i, obj = this._geste.objet, montre = wm > 0.5 && M[iM.ov] > 0.5 && !lunette;
    for (const [id, o] of Object.entries(this.objets)) o.visible = montre && id === obj;
    this.tenus.visible = montre;
    if (!montre || !this.objets[obj]) return;
    const o = this.objets[obj];
    if (B) {
      const R = B.rig; R.repereMain('Right', _v, _f, _n);
      // le manche dans la paume : l'objet a son origine au milieu de la main, son −Z le long de la ligne des jointures
      R.bones.RightHandIndex1.getWorldPosition(_w); R.bones.RightHandPinky1.getWorldPosition(_u); _u.subVectors(_w, _u).normalize();
      _w.copy(_v).addScaledVector(_f, 0.05).addScaledVector(_n, 0.02);
      _x.crossVectors(_f, _u.negate()).normalize();                        // (x de l'objet)
      _m.makeBasis(_x, _f, _u).setPosition(_w);
      o.position.setFromMatrixPosition(_m); o.quaternion.setFromRotationMatrix(_m);
    } else { o.position.copy(this._cibleD.p); o.quaternion.identity(); }
    // la goupille arrachée (grenade) : l'os `goupille` part vers la main gauche, puis se cache
    if (obj !== 'couteau') this._os(o, 'goupille', 0.04 * M[iM.pin], 0.03 * M[iM.pin], 0);
    o.updateMatrixWorld(true);
  }

  // LA LUMIÈRE : la clé suit la pièce de la caméra du jeu (lissée 0,4 s), l'environnement et l'hémisphère avec elle ;
  // l'éclair de bouche, à la bouche de l'arme, 50 ms par coup
  _lumieres(dt, id) {
    const g = this.game, Lu = g.carte && g.carte.lumieres, cam = g.camera;
    if (Lu && Lu.zoneEn && cam && (this._pieceN++ % 6 === 0)) {
      const Z = Lu.zoneEn(cam.position.x, cam.position.z, cam.position.y - 1.5);
      this._piece = Z ? Z.id : null;
    }
    const cible = this._piece && CLE_PIECE[this._piece] !== undefined ? CLE_PIECE[this._piece] : 1;
    this.cleLissee = dt > 0 ? amortir(this.cleLissee, cible, 0.4 / 3, dt) : this.cleLissee;
    const k = this.cleLissee;
    this.cle.intensity = CLE_BASE * k; this.hemi.intensity = HEMI_BASE * (0.45 + 0.55 * k); this.scene.environmentIntensity = ENV_BASE * k;
    this.diag.cle = k;
    const bo = REPERES[id] && REPERES[id].bouche;
    if (bo) { this.bouche.position.set(bo[0], bo[1], bo[2]).applyMatrix4(this.racine.matrixWorld); }
    this.bouche.intensity = this._eclair > 0 && this.racine.visible ? BOUCHE_ECLAIR * (this._eclair / 0.05) : 0;
  }

  // LES DOIGTS d'une main (index, majeur-annulaire-auriculaire, pouce ; AvatarRig._set : la pose de plierDoigts, os par
  // os, l'index à part sur la détente) : la flexion va vers sa cible en 0,06 s (d'une prise à l'autre, la main se referme
  // au lieu de sauter) ; les os des doigts ne sont reposés que quand elle change
  _doigts(B, cote, autres, index, pouce, dt) {
    const C = B.doigts[cote], R = B.rig, s = cote === 'Left' ? -1 : 1, k = dt > 0 ? 1 - Math.exp(-dt / 0.06) : 1;
    let change = false;
    for (let i = 0; i < 9; i++) {
      const c = i < 3 ? autres[i] : i < 6 ? index[i - 3] : pouce[i - 6], v = Number.isFinite(C[i]) ? C[i] + (c - C[i]) * k : c;
      if (Math.abs(v - C[i]) > 1e-4 || !Number.isFinite(C[i])) { C[i] = v; change = true; }
    }
    if (!change) return;
    for (const f of ['Middle', 'Ring', 'Pinky']) for (let i = 1; i <= 3; i++) R._set(`${cote}Hand${f}${i}`, 0, s * C[i - 1]);
    for (let i = 1; i <= 3; i++) R._set(`${cote}HandIndex${i}`, 0, s * C[2 + i]);
    for (let i = 1; i <= 3; i++) R._set(`${cote}HandThumb${i}`, 0, s * C[5 + i]);
    for (const b of B.mains[cote === 'Left' ? 'G' : 'D'].children) b.traverse((o) => { if (o.isBone) o.updateMatrix(); });
    B.mains[cote === 'Left' ? 'G' : 'D'].updateMatrixWorld(true);
  }

  // UN REPÈRE DE L'ARME DE VUE (bouche, éjection…) porté dans la SCÈNE DE JEU : le point qui se projette au même pixel
  // que lui, à la même distance de l'œil — pour les effets de L-H (l'éclair, la douille) qui vivent dans la scène de jeu
  versMonde(nom, out = new THREE.Vector3()) {
    const a = this.courante, r = a && REPERES[a.userData.arme] && REPERES[a.userData.arme][nom], cam = this.game.camera;
    if (!r || !cam) return null;
    _v.set(r[0], r[1], r[2]).applyMatrix4(this.racine.matrixWorld);
    const d = _v.length();
    _v.project(this.camera);
    out.set(_v.x, _v.y, 0.5).unproject(cam).sub(cam.position).normalize().multiplyScalar(d).add(cam.position);
    return out;
  }

  // L'ARMURERIE (vague 3) : l'arme seule qui tourne (0,6 rad/s) devant la caméra de l'arme, superposée tant qu'elle est
  // montrée — au menu aussi, où personne n'appelle `maj` : elle tourne au rendu de SA scène (Scene.onBeforeRender). Aucune
  // lumière ajoutée : ce sont les trois de la scène de l'arme.
  vitrine(idArme) {
    const fx = this.game.fx;
    if (idArme === null || idArme === undefined) {
      this._vitrine = null; this.scene.onBeforeRender = () => {};
      if (this._supV && fx && fx.superpositions) { const i = fx.superpositions.indexOf(this._supV); if (i >= 0) fx.superpositions.splice(i, 1); }
      this._supV = null;
      // (l'arme et ses pivots rendus à la vue : la vitrine les avait centrés)
      for (const a of Object.values(this.armes)) { a.position.set(0, 0, 0); a.quaternion.identity(); }
      this.tenus.position.set(0, 0, 0); this.tenus.quaternion.identity(); this.racine.rotation.set(0, 0, 0);
      this.cacher();
      return;
    }
    // (pas encore préparée — l'armurerie avant toute partie : elle se prépare, puis se montre)
    if (!this._pret) { this._vitrine = idArme; this.preparer().then(() => { if (this._vitrine === idArme) { this._vitrine = null; this.vitrine(idArme); } }); return; }
    this._vitrine = idArme; this.montrer(idArme);
    if (this.bras) this.bras.groupe.visible = false;
    this.tenus.visible = false;
    for (const [id, o] of Object.entries(this.objets)) o.visible = id === idArme;
    const a = this.armes[idArme];
    if (a && TENUS.includes(idArme)) { this.tenus.visible = true; this.racine.visible = false; }
    // le centre de l'arme (sa boîte) devant la caméra, à 0,9 m ; elle tourne autour
    const pivot = TENUS.includes(idArme) ? this.tenus : this.racine;
    pivot.position.set(0, 0, 0); pivot.quaternion.identity(); if (a) { a.position.set(0, 0, 0); a.quaternion.identity(); }
    pivot.updateMatrixWorld(true);
    const bb = a ? new THREE.Box3().setFromObject(a) : null, cx = bb && !bb.isEmpty() ? bb.getCenter(new THREE.Vector3()) : new THREE.Vector3();
    const taille = bb && !bb.isEmpty() ? bb.getSize(new THREE.Vector3()).length() : 0.8;
    if (a) a.position.copy(cx).negate();
    pivot.position.set(0, 0, -Math.max(0.35, taille * 1.05));
    this.cle.intensity = CLE_BASE; this.hemi.intensity = HEMI_BASE; this.scene.environmentIntensity = ENV_BASE; this.bouche.intensity = 0;
    let avant = performance.now();
    this.scene.onBeforeRender = () => {
      const c = this.camera, g = this.game.camera;
      if (g && Math.abs(c.aspect - g.aspect) > 1e-6) { c.aspect = g.aspect; c.updateProjectionMatrix(); }
      if (c.fov !== CHAMP_VUE) { c.fov = CHAMP_VUE; c.updateProjectionMatrix(); }
      if (c.rotation.y !== 0) { c.rotation.set(0, 0, 0); c.updateMatrixWorld(); }
      const n = performance.now(), d = Math.min(0.1, (n - avant) / 1000); avant = n;
      pivot.rotation.set(0.12, pivot.rotation.y + 0.6 * d, 0, 'YXZ');
    };
    // (sa superposition à elle — vitrine(null) ne retire pas celle de VueFPS — sauf si la scène est déjà dessinée : en
    // partie, elle le serait deux fois)
    if (!this._supV) this._supV = { scene: this.scene, camera: this.camera };
    if (fx && fx.superpositions && !fx.superpositions.some((s) => s.scene === this.scene)) fx.superpositions.push(this._supV);
    this.cachee = false; this.diag.montree = true;
  }

  // TOUT RENDRE (une arme de vue créée en plus — les tests — se libère : géométries des bras, matériaux clonés, PMREM)
  liberer() {
    this.vitrine(null);
    if (this.bras) {
      this.bras.groupe.traverse((o) => { if (o.isMesh) o.geometry.dispose(); if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose(); });
      for (const m of this.bras.mats) m.dispose();
      this.scene.remove(this.bras.groupe); this.bras = null;
    }
    if (this._envRT) { this._envRT.dispose(); this._envRT = null; this._env = null; this.scene.environment = null; }
    this._pret = false;
  }
}

// ---------------------------------------------------------------- les mains (outils)
// une cible de main : poignet `p`, doigts `f`, paume `n` (repère de la scène de l'arme)
const cible = () => ({ p: new THREE.Vector3(), f: new THREE.Vector3(), n: new THREE.Vector3() });
const _T1 = cible(), _T2 = cible(), _T3 = cible();
const _mm = new THREE.Matrix4();
// une cible du repère de l'arme portée dans la scène
function porter(T, A, out) {
  out.p.copy(T.p).applyMatrix4(A.matrixWorld);
  A.getWorldQuaternion(_q2);
  out.f.copy(T.f).applyQuaternion(_q2); out.n.copy(T.n).applyQuaternion(_q2);
  return out;
}
// la cible `a` amenée vers `b` de k (position et repère de la main)
function melanger(a, b, k) {
  a.p.lerp(b.p, k); a.f.lerp(b.f, k).normalize(); a.n.lerp(b.n, k).normalize();
}
// une cible du repère de l'arme amenée vers une prise de l'arme
function melangerPrise(T, pr, k) {
  T.p.x += (pr.o[0] + pr.p[0] - T.p.x) * k; T.p.y += (pr.o[1] + pr.p[1] - T.p.y) * k; T.p.z += (pr.o[2] + pr.p[2] - T.p.z) * k;
  T.f.lerp(pr.f, k).normalize(); T.n.lerp(pr.n, k).normalize();
}
const DOIGTS_TENUS = { doigts: [1.1, 1.25, 0.95], index: [0.9, 1.1, 0.8], pouce: [0.7, 0.7, 0.6] };
const DOIGTS_LIBRES = { doigts: [0.35, 0.45, 0.3], index: [0.25, 0.35, 0.25], pouce: null };
const DETENTE = [0.55, 0.75, 0.5], POUCE0 = [0.2, 0.15, 0.1];
// ne garde que les triangles dont les trois sommets sont « bras » à plus de `seuil` (géométrie COPIÉE : celle du GLB en
// cache est partagée avec Haythem) ; rend le nombre de triangles gardés
export function couperBras(mesh, seuil = 0.5) {
  const geo = mesh.geometry = mesh.geometry.clone();
  const sk = mesh.skeleton, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight, idx = geo.index;
  const bras = sk.bones.map((b) => OS_BRAS.test(b.name.replace(/^mixamorig:?/, '')));
  const n = geo.attributes.position.count, w = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0, t = 0; for (let k = 0; k < 4; k++) { const x = sw.getComponent(i, k); t += x; if (bras[si.getComponent(i, k)]) s += x; } w[i] = t > 0 ? s / t : 0; }
  const garde = [];
  if (idx) { const a = idx.array; for (let t = 0; t < a.length; t += 3) if (w[a[t]] > seuil && w[a[t + 1]] > seuil && w[a[t + 2]] > seuil) garde.push(a[t], a[t + 1], a[t + 2]); }
  else for (let t = 0; t < n; t += 3) if (w[t] > seuil && w[t + 1] > seuil && w[t + 2] > seuil) garde.push(t, t + 1, t + 2);
  geo.setIndex(garde);
  geo.computeBoundingSphere();
  return garde.length / 3;
}
