// =====================================================================
//  LA CARTE : L'ÉCOLE IRIS — le rez-de-chaussée, l'escalier et la façade sur rue
// =====================================================================
// Reconstruit d'après les 21 photos de Haythem (references/ecole/, hors du dépôt) et leur relevé : plan coté, couleurs
// mesurées puis rééquilibrées, position de chaque prise de vue. Les longueurs sont tirées de photos au grand angle
// (± 10 à 15 %) ; ce qui est sûr, c'est ce qui mène à quoi.
//
// CE QUE LE MODULE CONSTRUIT (il a le rôle de buildArena dans LA CAGE) : les murs avec leurs portes, les sols, les
// plafonds, l'escalier, la façade, les lumières ; il déclare tout ce qui est solide au monde solide (js/collisions.js).
// Le jeu (js/game.js) ne connaît que ce qu'il rend :
//   construireCarte(scene, renderer) -> { nom, collisions, depart: { x, z, fx, fz }, bornes, sieges, maj(dt, jeu) }
// et ce qu'il pose dans scene.userData (lu par js/fx.js, js/weather.js, js/ombres_contact.js comme sur les terrains de
// LA CAGE) : env { sun, hemi, fill, clouds, court, wetMats }, sunDir, zoneOmbre, envTerrain, envLocale, sondeCiel,
// gainSonde, solContact, solCuit, interieur, animate, aoCanal, pointEnv.
//
// LES CROCHETS pour la suite : le MOBILIER (chaises, écran, présentoirs, affiches : js/ecole_mobilier.js) et la RUE
// (trottoir, chaussée, immeubles d'en face : js/ecole_rue.js) sont posés par leurs modules, qui reçoivent le chantier
// (`ch` : la scène, le décor, le monde solide, les matières, la conversion du plan, les sièges, les lampes).
//
// ---------------------------------------------------------------------------------------------------------------------
// LE PLAN (le repère du relevé, « entrée en bas ») : x le long de la façade, de 0 (nu intérieur du mitoyen ouest, côté
// impasse) à 19,8 (mitoyen est, côté n° 4) ; y depuis le nu intérieur de la façade vers le fond du bâtiment (y < 0 : le
// trottoir puis la rue). Dans le jeu : X = x, Z = -y (z vers la rue = le sud du jeu), Y vers le haut, sol du
// rez-de-chaussée à 0. Tout ce fichier parle en coordonnées du PLAN.
//
//   le passage des étudiants   x 2,175-4,425 y -0,4-4,05  grille sur rue, portes vitrées au fond (photos 07, 10, 19)
//   le hall ouest (escalier)   x 1,75-5,8    y 4,05-8,925 plan d'évacuation, porte grise, extincteur, portes coupe-feu
//                                                         (photos 06 = r01, 19, 20, 04 ; plan V2, 11/10)
//   l'escalier                 x 1,75-4,6    y 9,075-13,925 deux volées de 10 marches, palier à 1,75 m, le 1er au bout
//   le couloir C05             x 4,6-5,8     y 12,0-18,6  deux portes de toilettes, au fond la porte bleue de la salle
//                                                         David Clark (photos 05, 23)
//   la salle d'attente         x 5,8-13,5    y 9,0-12,0   le mur safran, les chaises coque, l'écran (photos 02, 21)
//   le couloir C01             x 11,7-13,5   y 12,0-20,6  toilettes, gaine technique (photo 01)
//   le « cou »                 x 9,9-13,3    y 4,8-9,0    le bureau de direction vitré, le trumeau (photo 03), le totem ;
//                                                         au sud-est, le passage au sud-ouest de la pile (y 2,5-4,7)
//   la pile du hall            x 13,3-14,65  y 4,7-7,575  la plaque « iris », l'horloge, les annuaires (VO 6,4-12,4 s) :
//                                                         js/ecole_rdc_centre.js
//   le hall d'entrée, accueil  x 13,35-19,8  y 0,3-7,5    porte n° 6, le comptoir nord-sud et l'open-space, l'angle nord-est
//                                                         ouvert (photos 03, 16, 24 ; VO) : js/ecole_hall.js
//   le couloir est, l'escalier x 14,6-19,8   y 7,575-12,45 derrière la porte nord du hall : js/ecole_est.js (photos 24-29) ;
//                                                         l'ascenseur au bout du dégagement (js/ecole_ascenseur.js), la
//                                                         descente au -1 sous la volée 2 (js/ecole_soussol_est.js)
//   les pièces fermées         la salle A, le bureau de direction, les toilettes (femmes et hommes par le C05, PMR par le
//                              C01), le local, le couloir de service, la salle David Clark Si 0.2 (au nord du C05, y
//                              18,75-24,35) : leurs portes s'ouvrent, leur intérieur est imaginé (js/ecole_pieces.js)
//   le 1er étage (3,50 m)      js/ecole_etage1.js : l'espace pause orange, la salle de cours S 1.3, la salle Robert Kahn
//                              Si 1.4 (la vidéo officielle, js/ecole_etage1_pause.js, js/ecole_kahn.js), le palier est
//   le 2e étage (6,60 m)       js/ecole_etage2.js (la vidéo officielle) : le palier, le couloir rouge, deux salles
//   le sous-sol (-3,06 m)      js/ecole_soussol.js (la vidéo de Haythem) : derrière la porte grise du hall ouest, le palier
//                              « 0 », la volée de tôle, le hall du -1, le couloir, l'espace pause ; la grande salle
//                              S -1.14 (js/ecole_amphi.js) ; à l'est, le palier -1 et le sas (js/ecole_soussol_est.js)
import * as THREE from 'three';
import { Collisions } from './collisions.js';
import { carteLocale, poserSondeLocale, planifierOcclusionSol, optimiserDecor, nePasFusionner, animerVent } from './kit_decor.js';
import { materiauxEcole, texDAE, jourDehors } from './ecole_matieres.js';
import { Portes, boiteM, maille, fenetreFacade, fenetreDepolie, fusionnerLocal, vitrophanies } from './ecole_portes.js';
import { LumieresEcole, cuireLumiereSol } from './ecole_lumieres.js';
import { poserMobilier } from './ecole_mobilier.js';
import { poserRue } from './ecole_rue.js';
import { poserPieces } from './ecole_pieces.js';
import { poserEtage1 } from './ecole_etage1.js';
import { poserSousSol } from './ecole_soussol.js';
import { poserEst } from './ecole_est.js';
import { poserSousSolEst } from './ecole_soussol_est.js';
import { poserRdcCentre } from './ecole_rdc_centre.js';
import { poserHall } from './ecole_hall.js';

// ---- les hauteurs ----
const H_DALLE = 3.25;            // le dessous de la dalle du 1er étage (les cloisons montent jusque-là)
const H_RDC = 3.5;               // d'un plancher à l'autre au rez-de-chaussée
const H_CAGE = 6.4;              // le plafond de la cage d'escalier au-dessus du palier du 1er étage
const EP = 0.15;                 // les cloisons
// ---- LE PLAN V2 (11/10/2026 : scratchpad iris_audit/plan_v2.md § 1.1 et § 2.1) : le bloc ouest du rez-de-chaussée était
// ≈ 4,2 m trop au nord (retour de Haythem du 10/10 : « la porte n'est pas aussi loin » — photo 06 rejouée : 0,97 m de la
// paroi vitrée du passage à la porte grise, le jeu en mettait 4,1). Il revient vers la rue, de trois décalages :
const DY_A = -4.20;              // la salle d'attente et son contenu (son mur sud devient la ligne y 4,8 du bureau B)
const DY_S = -4.675;             // la cage et l'escalier principal (rez-de-chaussée et 1er), le C05 : portes en y 9,0
const DY_SS = -4.09;             // l'ouest du -1, accroché à la porte grise (c 9,575 -> 5,485)
// ---- l'escalier (photos 06, 20, 04) ----
// (la volée 1 est la plus large : par le vantail ouvert, côté ouest, on voit ses premières marches et son garde-corps,
// photo 20 — son bord intérieur passe donc à l'ouest du milieu de la porte)
// (plan V2 : toute la cage recule de DY_S — la première contremarche de 14,2 à 9,525 ; l'intérieur ne change pas)
const ESC = { xE0: 3.02, xE1: 4.6, xO0: 1.75, xO1: 2.9, y0: 14.2 + DY_S, giron: 0.28, haut: 0.175, n: 10 };
ESC.yPalier = ESC.y0 + (ESC.n - 1) * ESC.giron;      // 12,045 : le bord du palier intermédiaire
ESC.hPalier = ESC.n * ESC.haut;                     // 1,75
ESC.yFond = 18.6 + DY_S;                            // 13,925 : le nu nord de la cage (le fond du palier intermédiaire)
ESC.yP1 = 12.6 + DY_S;                              // 7,925 : le nu sud du palier du 1er (sa double porte en y 7,85)
// la lumière principale (l'ensemble des plafonniers) : presque d'aplomb, elle porte les ombres douces
const DIR_LUMIERE = new THREE.Vector3(0.16, 1, 0.22).normalize();
// le rectangle du sol (ombre cuite, lumière cuite) : x -0,6-20,4, y -0,6-25,0 (09/10 : jusqu'à 25 — la salle David
// Clark, derrière la porte bleue du C05, dépasse le fond du bâtiment de 20,75 jusqu'à 24,5)
const RECT = { x0: -0.6, x1: 20.4, y0: -0.6, y1: 25.0 };

// =====================================================================
//  LE CHANTIER : des outils qui parlent en coordonnées du plan
// =====================================================================
class Chantier {
  constructor(scene) {
    this.scene = scene;
    this.C = new Collisions();
    this.M = materiauxEcole();
    this.decor = new THREE.Group(); this.decor.name = 'école IRIS';
    scene.add(this.decor);
    this.portes = new Portes(this.C, this.M, this.decor);
    this.lampes = [];            // les plafonniers et le jour (js/ecole_lumieres.js)
    this.sieges = [];
    // plan -> monde
    this.X = (x) => x; this.Z = (y) => -y;
  }

  // UNE BOÎTE posée en coordonnées du plan : x0-x1, y0-y1, h0-h1 (matériau, ombre, collision)
  boite(x0, y0, x1, y1, h0, h1, mat, { ombre = true, collision = false, camera = true, horsAO = false, parent = null } = {}) {
    const m = maille(boiteM(Math.abs(x1 - x0), h1 - h0, Math.abs(y1 - y0)), mat, (x0 + x1) / 2, (h0 + h1) / 2, -(y0 + y1) / 2, 0, parent || this.decor, { ombre });
    if (horsAO) m.userData.horsAOSol = true;
    if (collision) this.C.ajouterBoite(x0, -y0, x1, -y1, { y0: h0, y1: h1, camera });
    return m;
  }
  // UN PLAN (affiche, panneau) collé contre une face : `face` = 'N' | 'S' | 'E' | 'W' (la direction où il regarde)
  panneau(mat, w, h, x, y, hc, face, parent = null) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    p.position.set(x, hc, -y);
    p.rotation.y = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[face];
    p.receiveShadow = true;
    (parent || this.decor).add(p);
    return p;
  }

  // UN MUR de (x0, y0) à (x1, y1) — toujours parallèle à un axe —, épais de `ep`, de `base` à `h` (hauteurs absolues).
  //   mats : un matériau, ou { N, S } (mur est-ouest) / { E, W } (mur nord-sud) : chaque face a le sien (le mur est
  //          alors fait de deux demi-épaisseurs)
  //   plinthes : les faces qui reçoivent la plinthe de bois verni (8 cm), au pied de chaque morceau qui part du sol
  //   ouvertures : [{ c, l, h, bas }] — c = le centre le long du mur (x pour un mur est-ouest, y pour un nord-sud),
  //          l = la largeur, h = la hauteur du linteau (absolue), bas = l'allège (absolue) : une fenêtre
  // Le monde solide reçoit exactement les mêmes morceaux pleins que la géométrie.
  mur({ de, a, ep = EP, h = H_DALLE, base = 0, mats, plinthes = [], ouvertures = [], camera = true, ombre = false }) {
    const M = this.M, [x0, y0] = de, [x1, y1] = a;
    const axeX = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
    const debut = axeX ? Math.min(x0, x1) : Math.min(y0, y1), fin = axeX ? Math.max(x0, x1) : Math.max(y0, y1);
    const ligne = axeX ? y0 : x0;
    const ouv = ouvertures.map((o) => ({ a0: Math.max(debut, o.c - o.l / 2), a1: Math.min(fin, o.c + o.l / 2), bas: o.bas ?? base, haut: Math.min(h, o.h ?? base + 2.1) }))
      .sort((p, q) => p.a0 - q.a0);
    const pleins = [];
    let a0 = debut;
    for (const o of ouv) {
      if (o.a0 > a0 + 1e-3) pleins.push({ a0, a1: o.a0, y0: base, y1: h });
      if (o.haut < h - 1e-3) pleins.push({ a0: o.a0, a1: o.a1, y0: o.haut, y1: h });
      if (o.bas > base + 1e-3) pleins.push({ a0: o.a0, a1: o.a1, y0: base, y1: o.bas });
      a0 = Math.max(a0, o.a1);
    }
    if (fin > a0 + 1e-3) pleins.push({ a0, a1: fin, y0: base, y1: h });
    const cotes = axeX ? ['N', 'S'] : ['E', 'W'];
    const mat = (c) => (mats && mats.isMaterial ? mats : (mats && mats[c]) || M.blanc);
    const deux = mat(cotes[0]) !== mat(cotes[1]);
    for (const p of pleins) {
      // le rectangle au sol, en plan : u le long du mur, v à travers
      const R = (v0, v1) => (axeX ? [p.a0, ligne + v0, p.a1, ligne + v1] : [ligne + v0, p.a0, ligne + v1, p.a1]);
      const [bx0, by0, bx1, by1] = R(-ep / 2, ep / 2);
      this.C.ajouterBoite(bx0, -by0, bx1, -by1, { y0: p.y0, y1: p.y1, camera });
      if (!deux) this.boite(bx0, by0, bx1, by1, p.y0, p.y1, mat(cotes[0]), { ombre });
      else {
        // N (ou E) : la demi-épaisseur côté +v ; S (ou W) : côté -v
        const [ax0, ay0, ax1, ay1] = R(0, ep / 2), [cx0, cy0, cx1, cy1] = R(-ep / 2, 0);
        this.boite(ax0, ay0, ax1, ay1, p.y0, p.y1, mat(cotes[0]), { ombre });
        this.boite(cx0, cy0, cx1, cy1, p.y0, p.y1, mat(cotes[1]), { ombre });
      }
      if (p.y0 <= 0.001) {
        for (const c of plinthes) {
          const s = c === cotes[0] ? 1 : -1, v = s * (ep / 2 + 0.0075);
          const [px0, py0, px1, py1] = R(v - 0.0075, v + 0.0075);
          this.boite(px0, py0, px1, py1, 0, 0.08, M.bois, { ombre: false });
        }
      }
    }
    return { axeX, ligne, debut, fin, pleins };
  }

  // UNE PORTE dans un mur : `axe` 'x' (mur est-ouest à y = ligne) ou 'y' (mur nord-sud à x = ligne), `c` le centre le
  // long du mur, `cote` la face où se pose le vantail ('N' | 'S' | 'E' | 'W'). Le reste : js/ecole_portes.js ajouter.
  porte(axe, ligne, c, o) {
    const cx = axe === 'x' ? c : ligne, cz = axe === 'x' ? -ligne : -c;
    const rot = axe === 'x' ? 0 : Math.PI / 2;
    const cote = { S: 1, N: -1, E: 1, W: -1 }[o.cote || (axe === 'x' ? 'S' : 'E')];
    return this.portes.ajouter({ ...o, cx, cz, rot, cote });
  }

  // ---------------------------------------------------------------- les plafonds
  // UN PLAFOND sur le rectangle du plan, à la hauteur h : son dessous (plateaux perforés ou plâtre, le calepinage part
  // de l'angle x0, y0 de la pièce) et ses quatre RETOMBÉES jusqu'à la dalle (là où un plafond plus haut le borde, elles
  // dessinent les soffites des photos 01 et 04). La caméra s'y arrête.
  plafond(x0, y0, x1, y1, h, type = 'platre', { camera = true, retombees = true } = {}) {
    const M = this.M, w = x1 - x0, d = y1 - y0;
    if (camera) this.C.plafond(x0, -y1, x1, -y0, h);
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(Math.PI / 2);                                    // tourné vers le bas
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) + w / 2, p.getZ(i) + d / 2);
    // (`type` : 'plateaux' (perforés), 'dalles' (60 x 60 posées sur ossature), sinon le plâtre)
    const m = maille(g, { plateaux: M.plateaux, dalles: M.dalles }[type] || M.platre, (x0 + x1) / 2, h, -(y0 + y1) / 2, 0, this.decor, { ombre: false });
    m.userData.horsAOSol = true;
    if (retombees && h < H_DALLE - 0.01) {
      const hr = H_DALLE - h, ym = h + hr / 2;
      for (const [ax, ay, bx, by, n] of [[x0, y0, x1, y0, 'S'], [x0, y1, x1, y1, 'N'], [x0, y0, x0, y1, 'W'], [x1, y0, x1, y1, 'E']]) {
        const L = Math.hypot(bx - ax, by - ay), q = this.panneau(M.platre, L, hr, (ax + bx) / 2, (ay + by) / 2, ym, n);
        q.userData.horsAOSol = true; q.castShadow = false;
      }
    }
    return m;
  }

  // ---------------------------------------------------------------- les luminaires
  // LE SPOT ENCASTRÉ (photos 02, 03, 21) : disque lumineux de 18 cm dans une couronne blanche FINE (09/10 : la couronne
  // de 24 cm faisait un anneau gris épais autour d'un disque pâle ; sur les photos, un filet blanc autour d'un disque
  // qui éblouit), à fleur du plafond
  spot(x, y, h, zone, o = {}) {
    const M = this.M;
    const c = maille(new THREE.CylinderGeometry(0.105, 0.105, 0.012, 32), M.couronne, x, h - 0.006, -y, 0, this.decor, { ombre: false, recoit: false });
    const d = maille(new THREE.CircleGeometry(0.09, 32), M.spot, x, h - 0.0125, -y, 0, this.decor, { ombre: false, recoit: false });
    d.rotation.x = Math.PI / 2;
    c.userData.horsAOSol = d.userData.horsAOSol = true;
    this.halo(x, y, h, 1.0);
    this.lampes.push({ x, z: -y, h, zone, type: 'spot', ...o });
  }
  // L'AURÉOLE d'un plafonnier, sur le plafond autour de lui (js/ecole_matieres.js texHalo), de `d` mètres de diamètre
  halo(x, y, h, d) {
    if (!this._geoHalo) this._geoHalo = new THREE.PlaneGeometry(1, 1).rotateX(Math.PI / 2);
    const m = maille(this._geoHalo, this.M.halo, x, h - 0.004, -y, 0, this.decor, { ombre: false, recoit: false });
    m.scale.set(d, 1, d); m.renderOrder = 2; m.userData.horsAOSol = true;
    return m;
  }
  // LE HUBLOT OPALE EN APPLIQUE (photos 01, 05) : une galette blanche lumineuse de 30 à 35 cm. `mur` : posé sur une face
  // (son axe regarde alors dans la direction donnée, 'S' ou 'N'…), sinon au plafond.
  opale(x, y, h, zone, { r = 0.17, mur = null, ...o } = {}) {
    const M = this.M, g = new THREE.Group(); g.position.set(x, h, -y);
    const corps = maille(new THREE.CylinderGeometry(r, r * 0.92, 0.07, 36), M.opale, 0, -0.035, 0, 0, g, { ombre: false, recoit: false });
    maille(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.012, 36), M.couronne, 0, -0.006, 0, 0, g, { ombre: false, recoit: false });
    void corps;
    // (en applique : l'axe de la galette, qui pend vers -y au plafond, regarde vers `mur`)
    if (mur) { g.rotation.x = -Math.PI / 2; g.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[mur]); }
    g.traverse((m) => { m.userData.horsAOSol = true; });
    this.decor.add(g);
    if (!mur) this.halo(x, y, h, r * 6.5);
    this.lampes.push({ x, z: -y, h: mur ? h - 0.1 : h, zone, type: 'opale', ...o });
  }
  // LA RÉGLETTE FLUORESCENTE DU PASSAGE (photos 07, 19) : tube de 1,5 m sous une réglette blanche à embouts orange,
  // fixée haut sur le mur et penchée vers le milieu. `x` : le nu du mur, `s` : +1 si le passage est vers +x.
  tube(x, y0, y1, h, s, zone) {
    const M = this.M, g = new THREE.Group(), L = y1 - y0;
    g.position.set(x + s * 0.06, h, -(y0 + y1) / 2); g.rotation.z = -s * 0.5;
    maille(boiteM(0.05, 0.04, L), M.boitier, 0, 0.02, 0, 0, g, { ombre: false });
    const t = maille(new THREE.CylinderGeometry(0.018, 0.018, L - 0.08, 12), M.tube, 0, -0.012, 0, 0, g, { ombre: false, recoit: false });
    t.rotation.x = Math.PI / 2;
    for (const sz of [-1, 1]) maille(boiteM(0.055, 0.05, 0.05), M.embout, 0, 0, sz * (L / 2 - 0.02), 0, g, { ombre: false });
    // les deux suspentes au mur
    for (const sz of [-0.3, 0.3]) maille(boiteM(0.012, 0.012, 0.012), M.boitier, -s * 0.05, 0.03, sz * L, 0, g, { ombre: false });
    g.traverse((m) => { m.userData.horsAOSol = true; });
    this.decor.add(g);
    this.lampes.push({ x: x + s * 0.25, z: -(y0 + y1) / 2, h, zone, type: 'tube', force: 1.1 });
  }
  // LE BLOC DE SORTIE (vert, autonome, il éclaire) : regarde vers `face`. `suspendu` : sous deux tiges (près du pilier).
  sortie(x, y, h, face, { suspendu = false } = {}) {
    const M = this.M, g = new THREE.Group(); g.position.set(x, h, -y);
    g.rotation.y = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[face];
    maille(boiteM(0.36, 0.13, 0.05), M.boitier, 0, 0, 0, 0, g, { ombre: false });
    for (const z of [0.026, -0.026]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.11), M.sortie); p.position.z = z; if (z < 0) p.rotation.y = Math.PI; g.add(p);
    }
    if (suspendu) for (const sx of [-0.12, 0.12]) maille(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 6), M.inox, sx, 0.19, 0, 0, g, { ombre: false });
    g.traverse((m) => { m.userData.horsAOSol = true; });
    this.decor.add(g);
  }
}

// =====================================================================
//  LES SOLS
// =====================================================================
// Le carrelage, en un seul maillage pour tout le rez-de-chaussée : des rectangles dont les UV (en mètres) tournent avec
// la pièce — le grand côté des dalles dans l'axe nord-sud des couloirs et des halls, est-ouest dans la salle d'attente —
// et dont la seconde couche d'UV (uv1, de 0 à 1 sur le rectangle RECT, v = 1 au nord) porte l'ombre et la lumière cuites.
function geoSol(rects) {
  const pos = [], nor = [], uv = [], uv1 = [], idx = [];
  const W = RECT.x1 - RECT.x0, L = RECT.y1 - RECT.y0;
  for (const r of rects) {
    const [x0, y0, x1, y1, sens, u0 = 0, v0 = 0] = r, b = pos.length / 3;
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) {
      pos.push(x, 0, -y); nor.push(0, 1, 0);
      // 'ns' : u = y (le grand côté nord-sud), v = -x ; 'ew' : u = x, v = y ; 'droit' : u = x, v = y (passage)
      if (sens === 'ns') uv.push(y - v0, -(x - u0)); else uv.push(x - u0, y - v0);
      uv1.push((x - RECT.x0) / W, (y - RECT.y0) / L);
    }
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);           // (tournés vers le haut)
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
  g.setIndex(idx);
  return g;
}

// =====================================================================
//  L'ESCALIER (photos 06, 20, 04)
// =====================================================================
// Un escalier en U de béton : la volée 1 monte vers le nord dans la moitié est (10 contremarches de 17,5 cm, girons de
// 28 cm), le palier intermédiaire à 1,75 m, la volée 2 revient vers le sud dans la moitié ouest jusqu'au palier du
// 1er étage (3,50 m) et sa double porte coupe-feu, ouverte. Marches gris clair à nez sombre, contremarches anthracite,
// limons blanc cassé, garde-corps d'acier gris à barreaux (11 cm) et lisse plate, main courante ronde au mur. Pour le
// joueur, chaque volée est une RAMPE passant par le milieu des marches (js/collisions.js rampe).
// (plan V2 § 1.3, 11/10 : la cage, décalée de DY_S, occupe x 1,75-4,6 × y 9,075-13,925 ; l'escalier S'ARRÊTE AU 1er —
// sa partie haute était imaginée, et la vidéo officielle met la salle 1 du 2e au-dessus. Plafond de la cage à 6,40, le
// dessous de la dalle du 2e : js/ecole_etage1.js)
function construireEscalier(ch) {
  const { C, M } = ch, E = ESC, G = E.giron, R = E.haut, N = E.n, HP = E.hPalier;
  const extru = (pts, prof, mat, x, z, rotY) => {
    const sh = new THREE.Shape(); pts.forEach(([s, h], i) => (i ? sh.lineTo(s, h) : sh.moveTo(s, h)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: prof, bevelEnabled: false });
    const m = maille(geo, mat, x, 0, z, rotY, ch.decor);
    return m;
  };
  // ---- la volée 1 (est), pleine jusqu'au sol ----
  const p1 = [[0, 0], [0, R]];
  for (let i = 1; i < N - 1; i++) p1.push([i * G, i * R], [i * G, (i + 1) * R]);
  p1.push([(N - 1) * G, (N - 1) * R], [(N - 1) * G, 0]);
  extru(p1, E.xE1 - E.xE0, M.beton, E.xE0, -E.y0, Math.PI / 2);
  // ---- le palier intermédiaire, plein ----
  ch.boite(E.xO0, E.yPalier, E.xE1, E.yFond, 0, HP - 0.02, M.beton);
  ch.boite(E.xO0, E.yPalier, E.xE1, E.yFond, HP - 0.02, HP, M.solEtage);
  // ---- la volée 2 (ouest) : une dalle à paillasse inclinée, qui part du palier ----
  const p2 = [[0, HP]];
  for (let i = 0; i < N - 1; i++) p2.push([i * G, HP + (i + 1) * R], [(i + 1) * G, HP + (i + 1) * R]);
  p2.push([(N - 1) * G, HP + (N - 1) * R - 0.3], [0, HP - 0.25]);
  extru(p2, E.xO1 - E.xO0, M.beton, E.xO1, -E.yPalier, -Math.PI / 2);
  // ---- les marches (dessus gris, nez sombre) ----
  for (let i = 0; i < N - 1; i++) {
    const h = (i + 1) * R, ya = E.y0 + i * G;
    ch.boite(E.xE0, ya, E.xE1, ya + G, h, h + 0.012, M.marche);
    ch.boite(E.xE0, ya, E.xE1, ya + 0.04, h + 0.012, h + 0.016, M.nez, { ombre: false });
    const h2 = HP + (i + 1) * R, yb = E.yPalier - (i + 1) * G;
    ch.boite(E.xO0, yb, E.xO1, yb + G, h2, h2 + 0.012, M.marche);
    ch.boite(E.xO0, yb + G - 0.04, E.xO1, yb + G, h2 + 0.012, h2 + 0.016, M.nez, { ombre: false });
  }
  ch.boite(E.xE0, E.yPalier, E.xE1, E.yPalier + 0.04, HP, HP + 0.004, M.nez, { ombre: false });
  // ---- les contremarches anthracite (photos 06, 20 : seuls les limons et la sous-face sont blancs ; 09/10) : un
  // parement de 6 mm devant chaque contremarche du béton, côté de celui qui monte ----
  for (let i = 0; i < N; i++) {
    const ya = E.y0 + i * G, yb = E.yPalier - i * G;
    ch.boite(E.xE0, ya - 0.006, E.xE1, ya, i * R, (i + 1) * R, M.contremarche, { ombre: false });
    ch.boite(E.xO0, yb, E.xO1, yb + 0.006, HP + i * R, HP + (i + 1) * R, M.contremarche, { ombre: false });
  }
  // ---- le palier du 1er étage (dalle sur le nord du hall ouest, x 1,6-4,75, y 7,775-9,525 : au-dessus de son plafond
  // à 2,30, pas de conflit — plan V2 § 2.6) ----
  ch.boite(1.6, ESC.yP1 - 0.15, 4.75, E.y0, H_DALLE, 2 * HP - 0.02, M.beton);
  ch.boite(E.xO0, ESC.yP1, E.xE1, E.y0, 2 * HP - 0.02, 2 * HP, M.solEtage);
  ch.boite(E.xO1, E.y0 - 0.04, E.xE1, E.y0, 2 * HP, 2 * HP + 0.004, M.nez, { ombre: false });
  // (au-dessus, plus rien : l'escalier s'arrête au 1er, plan V2 § 1.3)
  // ---- sous la volée 2 : l'espace reste ouvert (photos 06, 20 : on y voit le sol filer sous la paillasse) ----
  const sof = (s) => HP - 0.25 + s * ((HP + (N - 1) * R - 0.3 - (HP - 0.25)) / ((N - 1) * G));

  // ---- LES GARDE-CORPS ----
  const barre = (x, y, h0, h1) => ch.boite(x - 0.007, y - 0.007, x + 0.007, y + 0.007, h0, h1, M.garde);
  const poteau = (x, y, h0, h1) => ch.boite(x - 0.025, y - 0.025, x + 0.025, y + 0.025, h0, h1, M.garde);
  const pente = Math.atan(R / G), Lv = (N - 1) * G / Math.cos(pente);
  // la lisse : une barre plate qui suit la pente (x, du bas (ya, ha) au haut (yb, hb))
  const lisse = (x, ya, ha, yb, hb) => {
    const L = Math.hypot(yb - ya, hb - ha), m = maille(boiteM(0.05, 0.012, L), M.garde, x, (ha + hb) / 2, -(ya + yb) / 2, 0, ch.decor);
    m.rotation.x = Math.atan2(hb - ha, yb - ya);
  };
  void Lv;
  // volée 1, bord intérieur (x 3,25) : un barreau tous les 11 cm, posé sur la marche, jusqu'à la ligne des nez + 0,9
  const xi1 = E.xE0 + 0.03, xi2 = E.xO1 - 0.03;
  for (let s = 0.12; s < (N - 1) * G - 0.05; s += 0.11) {
    const i = Math.floor(s / G), hm = (i + 1) * R + 0.012, hn = R + s * R / G;
    barre(xi1, E.y0 + s, hm, hn + 0.9);
    const h2 = HP + (i + 1) * R + 0.012, hn2 = HP + R + s * R / G;
    barre(xi2, E.yPalier - s, h2, hn2 + 0.9);
  }
  lisse(xi1, E.y0, R + 0.92, E.yPalier, HP + 0.92);
  lisse(xi2, E.yPalier, HP + R + 0.92, E.y0, 2 * HP + 0.92);
  poteau(xi1, E.y0 + 0.03, R, R + 0.98); poteau(xi1, E.yPalier - 0.03, HP, HP + 0.98);
  poteau(xi2, E.yPalier - 0.03, HP, HP + 0.98); poteau(xi2, E.y0 + 0.03, 2 * HP - R, 2 * HP + 0.98);
  ch.boite(xi2, E.yPalier - 0.05, xi1, E.yPalier - 0.01, HP + 0.92, HP + 0.97, M.garde);
  // AU PALIER DU 1er, le garde-corps au-dessus du vide de la volée 1 (plan V2 : la volée 3, qui partait de là vers le 2e,
  // est retirée) : barreaux, lisse, poteau d'angle contre le mur est
  for (let x = E.xO1 + 0.1; x < E.xE1 - 0.05; x += 0.11) barre(x, E.y0 - 0.03, 2 * HP, 2 * HP + 0.95);
  ch.boite(E.xO1 - 0.03, E.y0 - 0.055, E.xE1, E.y0 - 0.005, 2 * HP + 0.95, 2 * HP + 0.99, M.garde);
  poteau(E.xE1 - 0.03, E.y0 - 0.03, 2 * HP, 2 * HP + 0.99);
  // la main courante ronde, au mur, de chaque volée (supports tous les 80 cm)
  const mainCourante = (x, ya, ha, yb, hb) => {
    const L = Math.hypot(yb - ya, hb - ha), t = maille(new THREE.CylinderGeometry(0.02, 0.02, L, 10), M.garde, x, (ha + hb) / 2, -(ya + yb) / 2, 0, ch.decor);
    t.rotation.x = -Math.atan2(yb - ya, hb - ha);
    for (let k = 0.2; k < 1; k += 0.3) ch.boite(x - 0.01, ya + (yb - ya) * k - 0.01, x + (x > 3 ? 0.06 : -0.06), ya + (yb - ya) * k + 0.01, ha + (hb - ha) * k - 0.08, ha + (hb - ha) * k - 0.02, M.garde, { ombre: false });
  };
  mainCourante(E.xE1 - 0.06, E.y0, R + 0.85, E.yPalier, HP + 0.85);
  mainCourante(E.xO0 + 0.06, E.yPalier, HP + R + 0.85, E.y0, 2 * HP + 0.85);

  // ---- LE MONDE SOLIDE ----
  C.rampe(E.xE0, -(E.yPalier + G / 2), E.xE1, -(E.y0 - G / 2), 'z', -(E.y0 - G / 2), 0, -(E.yPalier + G / 2), HP);
  C.sol(E.xO0, -E.yFond, E.xE1, -E.yPalier, HP);
  C.rampe(E.xO0, -(E.yPalier + G / 2), E.xO1, -(E.y0 - G / 2), 'z', -(E.yPalier + G / 2), HP, -(E.y0 - G / 2), 2 * HP);
  C.sol(E.xO0, -E.y0, E.xE1, -ESC.yP1, 2 * HP);
  // entre les deux volées (barreaux et limons) : un mur pour le joueur, à toutes les hauteurs
  C.ajouterBoite(E.xO1, -E.yPalier, E.xE0, -E.y0, { y0: 0, y1: 5.2 });
  // le garde-corps du palier du 1er, au-dessus du vide de la volée 1
  C.ajouterBoite(E.xO1, -(E.y0 - 0.06), E.xE1, -E.y0, { y0: 2 * HP, y1: 2 * HP + 1.1 });
  // sous la volée 2, là où la paillasse descend sous 1,95 m : on ne s'y glisse plus (on s'y cognerait la tête)
  const sBas = (1.95 - sof(0)) / ((sof(1) - sof(0)));
  C.ajouterBoite(E.xO0, -E.yPalier, E.xO1, -(E.yPalier - sBas), { y0: 0, y1: 1.95 });
  // la caméra ne passe pas dans les volées ni sous le palier
  for (let i = 0; i < N - 1; i++) {
    const ya = E.y0 + i * G;
    C.ajouterBoite(E.xE0, -ya, E.xE1, -(ya + G), { y0: 0, y1: (i + 1) * R, joueur: false });
    const yb = E.yPalier - (i + 1) * G;
    C.ajouterBoite(E.xO0, -yb, E.xO1, -(yb + G), { y0: sof((i + 0.5) * G), y1: HP + (i + 1) * R, joueur: false });
  }
  C.ajouterBoite(E.xO0, -E.yPalier, E.xE1, -E.yFond, { y0: 0, y1: HP, joueur: false });
  // les plafonds : sous la dalle du 1er étage (pour qui est au rez-de-chaussée, au pied, derrière les portes), puis celui
  // du palier du 1er (le dessous de la dalle du 2e ; au-dessus des volées, le même : js/ecole_etage1.js)
  C.plafond(E.xO0, -E.y0, E.xE1, -(13.6 + DY_S), H_DALLE);
  ch.plafond(E.xO0, ESC.yP1, E.xE1, E.y0, H_CAGE, 'platre', { retombees: false });
}

// =====================================================================
//  LA FAÇADE (photos 10 à 18)
// =====================================================================
// Douze travées de 1,65 m. Au rez-de-chaussée, d'ouest en est : la porte de secours noire sous sa ventilation, le
// passage des étudiants (grille noire ouverte), trois grandes fenêtres à barreaux (salle A), deux fenêtres hautes
// (bureau B), le portail noir de l'entrée n° 6 en retrait (drapeaux, numéro), deux grandes fenêtres (accueil). Au-dessus,
// quatre étages de pierre claire à une fenêtre par travée, quelques encadrements rouges en saillie, l'attique en retrait.
const BAIES_HAUTES = [5.78, 7.43, 9.08, 17.33, 18.98];      // fenêtres de 1,2 m, allège 0,95, linteau 2,50
const BAIES_BUREAU = [10.73, 12.38];                       // allège 1,75
function construireFacade(ch) {
  const { M } = ch;
  // le mur de façade du rez-de-chaussée (40 cm : enduit blanc dedans, pierre dehors)
  ch.mur({
    de: [-0.3, -0.2], a: [20.1, -0.2], ep: 0.4, h: H_RDC, mats: { N: M.blanc, S: M.pierre }, plinthes: ['N'],
    ouvertures: [
      { c: 0.8, l: 1.0, h: 2.2 },                              // porte de secours (travée 1)
      // le passage des étudiants (ses murs font les tableaux) : 2,25 m, x 2,175-4,425, centré sur la limite des travées 2
      // et 3 (plan V2 ; photo 10, sur l'échelle des travées de 1,65 m : 2,25 — le jeu avait deux travées, 3,3 m)
      { c: 3.3, l: 2.25, h: 2.45 },
      ...BAIES_HAUTES.map((c) => ({ c, l: 1.2, bas: 0.95, h: 2.5 })),
      ...BAIES_BUREAU.map((c) => ({ c, l: 1.2, bas: 1.75, h: 2.5 })),
      { c: 14.925, l: 3.45, h: 2.9 },                          // le portail de l'entrée n° 6 (tableaux noirs, sous-face à 2,80)
    ],
  });
  // les fenêtres (repère du mur : +z vers l'intérieur = le nord du plan, donc tourné de PI)
  const fac = new THREE.Group(); fac.position.set(0, 0, 0.2); fac.rotation.y = Math.PI; ch.decor.add(fac);
  // (dans ce groupe tourné, x local = -x du plan : on passe -x)
  // (10/10 : plus de stores à lames aux deux baies de l'accueil — VO q_0373-0383 et photo 03 recadrée : le jour et les
  // barreaux s'y voient, aucune lame ; les bandes claires de la photo 03 sont les barreaux sur le ciel)
  for (const c of BAIES_HAUTES) fenetreFacade(fac, M, { x: -c, l: 1.2, bas: 0.95, haut: 2.5 });
  for (const c of BAIES_BUREAU) fenetreFacade(fac, M, { x: -c, l: 1.2, bas: 1.75, haut: 2.5, imposte: false });
  // (les vitres arrêtent la caméra ; la lumière du jour, elle, passe : `vitre`)
  for (const c of BAIES_HAUTES) ch.C.ajouterBoite(c - 0.6, 0.4, c + 0.6, 0, { y0: 0.95, y1: 2.5, vitre: true });
  for (const c of BAIES_BUREAU) ch.C.ajouterBoite(c - 0.6, 0.4, c + 0.6, 0, { y0: 1.75, y1: 2.5, vitre: true });
  // la porte de secours (vantail d'acier noir, fermée, côté rue), son panneau rouge et la ventilation au-dessus
  ch.porte('x', -0.2, 0.8, { l: 1.0, h: 2.2, ep: 0.4, modele: 'noire', etat: 'fermee', cote: 'S', huisserie: false });
  ch.boite(0.1, -0.44, 1.6, -0.4, 2.25, 2.75, M.noirMat);
  for (let h = 2.29; h < 2.74; h += 0.045) ch.boite(0.12, -0.47, 1.58, -0.44, h, h + 0.012, M.acierNoir, { ombre: false });
  ch.panneau(new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.6 }), 0.3, 0.2, 0.8, -0.45, 1.75, 'S');
  // le linteau d'acier noir du passage (35 cm) et ses deux boîtiers de contact
  ch.boite(2.175, -0.44, 4.425, -0.4, 2.45, 2.8, M.acierNoir);
  for (const x of [2.6, 4.0]) ch.boite(x - 0.06, -0.48, x + 0.06, -0.44, 2.38, 2.45, M.noirMat, { ombre: false });
  // (plan V2, photo 10 : entre la porte de secours et le passage, le cadre noir commun — un panneau d'acier noir jusqu'au
  // linteau, sur les 0,7 m de façade que l'ouverture rétrécie découvre)
  ch.boite(1.46, -0.44, 2.175, -0.4, 0, 2.8, M.noirMat);
  // la grille d'égout en fonte en travers du seuil du passage
  ch.boite(2.175, -0.4, 4.425, -0.1, 0, 0.006, M.acierNoir, { ombre: false });
  // LA GRILLE DU PASSAGE (photos 10, 13) : deux vantaux de barreaux noirs de 1,2 x 2,4 m, ouverts à 90° sur le trottoir,
  // contre les jambages (plan V2 : x 2,15 et 4,45 ; à 2,25 m d'ouverture, chacun en ferme un peu plus de la moitié —
  // photo 10 recalée, le bout du vantail est vers y -1,65)
  for (const x of [2.15, 4.45]) {
    ch.boite(x - 0.025, -1.62, x + 0.025, -0.42, 0.05, 0.11, M.acierNoir);
    ch.boite(x - 0.025, -1.62, x + 0.025, -0.42, 2.34, 2.42, M.acierNoir);
    ch.boite(x - 0.025, -1.62, x + 0.025, -0.42, 1.2, 1.24, M.acierNoir);
    for (const y of [-1.62, -0.44]) ch.boite(x - 0.025, y, x + 0.025, y + 0.04, 0.05, 2.42, M.acierNoir);
    for (let y = -1.5; y < -0.45; y += 0.13) ch.boite(x - 0.012, y, x + 0.012, y + 0.024, 0.11, 2.34, M.acierNoir);
    ch.C.ajouterBoite(x - 0.04, 1.64, x + 0.04, 0.4, { y1: 2.42 });
  }
  // LE PORTAIL N° 6 : tableaux noirs (le mur du bureau B à l'ouest, un retour à l'est), sous-face noire à 2,80 m
  ch.mur({ de: [16.575, -0.4], a: [16.575, 0.3], ep: 0.15, h: H_DALLE, mats: { W: M.noirMat, E: M.blanc } });
  // (en retrait de 2 cm du nu de la façade : sa face avant ne double pas celle du linteau de pierre)
  ch.boite(13.35, -0.38, 16.5, 0.3, 2.8, H_DALLE, M.noirMat, { ombre: false });
  // le numéro 6, noir, sur la pierre à droite du portail ; les deux projecteurs et l'écusson tricolore au-dessus
  const six = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), new THREE.MeshStandardMaterial({ map: texNumero('6'), transparent: true, roughness: 0.5 }));
  six.position.set(16.85, 2.3, 0.405); ch.decor.add(six);
  for (const x of [6.9, 16.8]) { ch.boite(x - 0.13, -0.58, x + 0.13, -0.4, 3.58, 3.76, M.noirMat); }
  // LES DRAPEAUX (photos 16 à 18) : le français à gauche, l'européen à droite, sur deux hampes qui sortent de derrière
  // l'écusson tricolore « Liberté Égalité Fraternité » et s'ouvrent EN V (17° de part et d'autre de la verticale, un peu
  // penchées vers la rue), pommeau doré. Temps sans vent : chaque toile pend le long du haut de sa hampe, drapée, presque
  // parallèle à la façade — on la voit de la rue, le bleu (ou les étoiles) contre la hampe.
  // (lot rue, 09/10/2026 : les hampes étaient à 45° droit vers la rue, les toiles vues par la tranche ; relecture : le V
  // resserré, et chaque toile pend vers l'EXTÉRIEUR, à côté de l'écusson, son bas à mi-hauteur de celui-ci — photo 16)
  const dorure = new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.35, metalness: 0.8 });
  const drapeau = (x, tex, cote) => {
    const g = new THREE.Group(); g.position.set(x, 3.48, 0.41); ch.decor.add(g);
    const d = new THREE.Vector3(cote * 0.29, 0.92, 0.26).normalize(), L = 1.3;
    const hampe = maille(new THREE.CylinderGeometry(0.012, 0.012, L, 8), M.noirMat, d.x * L / 2, d.y * L / 2, d.z * L / 2, 0, g, { ombre: false });
    hampe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    maille(new THREE.SphereGeometry(0.025, 10, 8), dorure, d.x * (L + 0.02), d.y * (L + 0.02), d.z * (L + 0.02), 0, g, { ombre: false });
    // la toile : accrochée de 0,55 à 1,15 m le long de la hampe (la hauteur du drapeau), elle retombe de 0,8 m (sa
    // longueur) en s'écartant un peu vers l'extérieur ; trois plis
    const pts = [], uvs = [], idx = [], n = 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n, sp = 0.55 + 0.6 * t, pli = Math.sin(t * Math.PI * 3) * 0.035;
      for (const [v, dy] of [[1, 0], [0.5, -0.42], [0, -0.82 - 0.06 * Math.sin(t * Math.PI)]]) {
        pts.push(d.x * sp + cote * (1 - v) * 0.12, d.y * sp + dy, d.z * sp + pli * (1 - v * 0.7) + (1 - v) * 0.02);
        uvs.push(1 - v, t);                       // (le bleu — u = 0 — contre la hampe)
      }
      if (i < n) for (let k = 0; k < 2; k++) { const b = i * 3 + k; idx.push(b, b + 1, b + 3, b + 1, b + 4, b + 3); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const toile = new THREE.Mesh(geo, jourDehors(new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }), 0.3));
    toile.userData.nofuse = true; g.add(toile);
  };
  drapeau(14.8, texDrapeau('fr'), -1); drapeau(15.05, texDrapeau('eu'), 1);
  const ecusson = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.56), jourDehors(new THREE.MeshStandardMaterial({ map: texDrapeau('ecusson'), transparent: true, roughness: 0.5 }), 0.3));
  ecusson.position.set(14.925, 3.24, 0.43); ch.decor.add(ecusson);

  // ---- LES ÉTAGES (pierre et fenêtres dessinées, une travée par tuile), la corniche, l'attique en retrait ----
  // (centrée sur x = 9,9 : la tuile de 1,65 m tombe juste sur les travées ; débordant de 30 cm sur les mitoyens)
  // (le 1er et le 2e ont leurs façades à eux, percées de vraies fenêtres : js/ecole_etage1.js, js/ecole_etage2.js — 10/10 ;
  // les étages dessinés partent du 3e, à 9,70 m — la boîte fait deux étages : le bas de sa tuile, à -3,10, tombe déjà
  // sur un plancher, rien à recaler)
  const geoEtages = boiteM(20.4, 2 * 3.1, 0.4);
  const etages = maille(geoEtages, M.etage, 9.9, H_RDC + 2 * 3.1 + 3.1, 0.2, 0, ch.decor, { ombre: false });
  etages.userData.horsAOSol = true;
  const hT = H_RDC + 4 * 3.1;
  ch.boite(-0.3, -0.55, 20.1, 0.8, hT, hT + 0.15, M.pierre, { ombre: false });
  ch.boite(0, 0.8, 19.8, 6, hT + 0.15, hT + 2.9, M.menuiserie, { ombre: false });
  for (let x = 0.4; x < 19.8; x += 1.65) ch.boite(x, 0.79, x + 0.85, 0.8, hT + 0.6, hT + 2.4, M.vitreFente, { ombre: false });
  ch.boite(-0.1, 0.7, 19.9, 6.2, hT + 2.9, hT + 3.05, M.aluGris, { ombre: false });
  for (let x = 0; x <= 19.8; x += 0.12) ch.boite(x, -0.5, x + 0.012, -0.488, hT + 0.15, hT + 1.1, M.barreaux, { ombre: false });
  ch.boite(0, -0.52, 19.8, -0.48, hT + 1.08, hT + 1.12, M.barreaux, { ombre: false });
  // les descentes d'eau pluviale, noires, aux deux bouts
  for (const x of [-0.18, 19.98]) ch.boite(x - 0.06, -0.52, x + 0.06, -0.4, 0, hT + 0.15, M.noirMat, { ombre: false });
  // LES ENCADREMENTS ROUGES en saillie (25 cm), autour de quelques fenêtres
  const cadre = (travee, etage, w, h) => {
    const x = 0.825 + (travee - 1) * 1.65, hc = H_RDC + (etage - 1) * 3.1 + 1.575, f = 0.2, y0 = -0.65, y1 = -0.4;
    ch.boite(x - w / 2, y0, x + w / 2, y1, hc + h / 2 - f, hc + h / 2, M.rougeCadre, { ombre: false });
    ch.boite(x - w / 2, y0, x + w / 2, y1, hc - h / 2, hc - h / 2 + f, M.rougeCadre, { ombre: false });
    ch.boite(x - w / 2, y0, x - w / 2 + f, y1, hc - h / 2, hc + h / 2, M.rougeCadre, { ombre: false });
    ch.boite(x + w / 2 - f, y0, x + w / 2, y1, hc - h / 2, hc + h / 2, M.rougeCadre, { ombre: false });
  };
  cadre(1, 1, 2.3, 2.0); cadre(12, 1, 1.5, 1.9); cadre(7, 2, 1.6, 1.55); cadre(11, 2, 1.6, 1.55); cadre(9, 3, 1.6, 1.55);
  cadre(3, 4, 1.6, 1.55); cadre(8, 4, 1.6, 1.55);
}
// les drapeaux et l'écusson (dessinés)
function texDrapeau(q) {
  const c = document.createElement('canvas'); c.width = 192; c.height = 128;
  const g = c.getContext('2d');
  if (q === 'fr') { g.fillStyle = '#0055a4'; g.fillRect(0, 0, 64, 128); g.fillStyle = '#f4f4f2'; g.fillRect(64, 0, 64, 128); g.fillStyle = '#ef4135'; g.fillRect(128, 0, 64, 128); }
  else if (q === 'eu') {
    g.fillStyle = '#003399'; g.fillRect(0, 0, 192, 128); g.fillStyle = '#ffcc00';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.arc(96 + Math.cos(a) * 40, 64 + Math.sin(a) * 40, 5, 0, 7); g.fill(); }
  } else {
    c.width = 100; c.height = 120; g.clearRect(0, 0, 100, 120);
    g.beginPath(); g.moveTo(4, 4); g.lineTo(96, 4); g.lineTo(96, 70); g.quadraticCurveTo(96, 104, 50, 116); g.quadraticCurveTo(4, 104, 4, 70); g.closePath();
    g.save(); g.clip(); g.fillStyle = '#0055a4'; g.fillRect(0, 0, 34, 120); g.fillStyle = '#f4f4f2'; g.fillRect(34, 0, 32, 120); g.fillStyle = '#ef4135'; g.fillRect(66, 0, 34, 120);
    g.fillStyle = '#e9c25a'; g.font = '700 9px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center';     // (lettres dorées, photo 16)
    g.fillText('LIBERTÉ', 50, 30); g.fillText('ÉGALITÉ', 50, 44); g.fillText('FRATERNITÉ', 50, 58); g.restore();
    g.strokeStyle = '#c9a24a'; g.lineWidth = 3; g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function texNumero(t) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 88;
  const g = c.getContext('2d'); g.fillStyle = '#111'; g.font = '700 80px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
  g.fillText(t, 32, 46);
  const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x;
}

// =====================================================================
//  LA PORTE N° 6 ET LA PAROI VITRÉE DU PASSAGE
// =====================================================================
// LA PORTE 6 (photos 03, 16, 31) : la ligne des vitrages à y = 0,3. Un fixe à gauche (x 13,35-14,3), la double porte de
// 2 x 0,95 m (automatique ici), un petit fixe à droite, l'imposte vitrée jusqu'au plafond ; aluminium gris. Les
// vitrophanies (une texture pour toute la largeur) sont découpées en morceaux qui suivent les vantaux.
function construireEntree(ch) {
  const { M, C } = ch, Y = 0.3, z = -Y, hP = 2.25, hT = 2.6;
  const vit = vitrophanies();
  const matRue = new THREE.MeshStandardMaterial({ map: vit.rue, alphaTest: 0.5, roughness: 0.4 });
  // (côté hall, l'adhésif est vu à contre-jour, la rue derrière lui : il s'éclaire un peu de lui-même — VO 93-95 s, le
  // visage et les arcs y sont clairs ; 10/10)
  const matHall = new THREE.MeshStandardMaterial({ map: vit.hall, alphaTest: 0.5, roughness: 0.6, emissive: 0xffffff, emissiveMap: vit.hall, emissiveIntensity: 0.32 });
  // un morceau de vitrophanie : la bande x a-b de la texture (13,45 -> 16,35), collée des deux côtés d'un vitrage
  // (10/10 : côté hall, le plan est tourné d'un demi-tour et ses u retournés — plus d'échelle négative : cousu par
  // l'optimisation du décor, le morceau du fixe ouest, miroir, tournait le dos au hall et disparaissait)
  const morceau = (parent, a, b, xl, zl) => {
    for (const [mat, s] of [[matRue, 1], [matHall, -1]]) {
      const g = new THREE.PlaneGeometry(b - a, hP);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i), uu = ((a + (s > 0 ? u : 1 - u) * (b - a)) - 13.45) / 2.9;
        uv.setX(i, uu);
      }
      const m = new THREE.Mesh(g, mat);
      m.position.set(xl, hP / 2, zl + s * 0.008);
      if (s < 0) m.rotation.y = Math.PI;
      m.castShadow = false; parent.add(m);
    }
  };
  // le cadre fixe : montants, traverse au-dessus de la porte, imposte
  const fixe = (x0, x1) => {
    ch.boite(x0, Y - 0.03, x1, Y + 0.03, 0, 0.06, M.aluGris);
    ch.boite(x0, Y - 0.03, x0 + 0.06, Y + 0.03, 0, hT, M.aluGris);
    ch.boite(x1 - 0.06, Y - 0.03, x1, Y + 0.03, 0, hT, M.aluGris);
    const v = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.12, hP - 0.06), M.verre); v.position.set((x0 + x1) / 2, (hP + 0.06) / 2, z); ch.decor.add(v);
    C.ajouterBoite(x0, -(Y + 0.04), x1, -(Y - 0.04), { y1: hT, vitre: true });
  };
  fixe(13.35, 14.3); fixe(16.2, 16.5);
  ch.boite(13.35, 0.27, 16.5, 0.29, 2.6, 2.8, M.noirMat, { ombre: false });       // le bandeau noir au-dessus de l'imposte
  morceau(ch.decor, 13.45, 14.24, (13.45 + 14.24) / 2, z);
  morceau(ch.decor, 16.24, 16.35, (16.24 + 16.35) / 2, z);
  ch.boite(13.35, Y - 0.04, 16.5, Y + 0.04, hP, hP + 0.06, M.aluGris);
  ch.boite(13.35, Y - 0.03, 16.5, Y + 0.03, hT - 0.05, hT, M.aluGris);
  const imp = new THREE.Mesh(new THREE.PlaneGeometry(3.0, hT - hP - 0.11), M.verre); imp.position.set(14.925, (hP + 0.06 + hT - 0.05) / 2, z); ch.decor.add(imp);
  C.ajouterBoite(13.35, -(Y + 0.04), 16.5, -(Y - 0.04), { y0: hP, y1: H_DALLE, vitre: true });
  // la double porte automatique : chaque vantail emporte son morceau de vitrophanie
  const P = ch.porte('x', Y, 15.25, { l: 1.9, h: hP, ep: 0.08, modele: 'vitree2', blanc: false, tirant: 'long', etat: 'auto', cote: 'S', huisserie: false, nom: 'entrée n° 6' });
  for (const v of P.vantaux) {
    // le vantail : de son gond (x local 0) vers s * 0,95 ; la bande de texture correspondante
    const xg = 15.25 - v.s * 0.95;              // le gond, en plan
    const a = Math.min(xg, xg + v.s * 0.95), b = Math.max(xg, xg + v.s * 0.95);
    const grp = new THREE.Group(); v.g.add(grp);
    morceau(grp, a + 0.05, b - 0.05, v.s * 0.475, 0);
  }
  // le bloc de sortie au-dessus, côté hall
  ch.sortie(15.25, 0.45, 2.45, 'N');
}
// LA PAROI DU PASSAGE (photos 07, 19) : en aluminium laqué blanc, la double porte automatique, et au-dessus, jusqu'au
// plafond du passage (2,60), un bandeau PLEIN d'aluminium blanc. (09/10 : les photos 07 et 19 n'ont pas d'imposte vitrée
// — la traverse haute des vantaux, à 2,30, est juste sous ce bandeau.)
// (plan V2, 11/10 : la paroi passe de la ligne y 5,0 à la ligne y 4,05, le passage de 3,0 à 2,25 m de large. Plus de
// fixes vitrés — les photos 07, 10 et 19 n'en montrent aucun, les deux vantaux remplissent le fond : la double porte
// va de la pile du plan d'évacuation (x 2,45) au mur est (x 4,425), deux vantaux de ≈ 0,99. À l'ouest, x 2,175-2,45, le
// pan plein est le dos de cette pile — crème comme le passage, une affiche (photo 10).)
function construireParoiPassage(ch) {
  const { M, C } = ch, Y = 4.05, hP = 2.3, hT = 2.6, X0 = 2.45, X1 = 4.425;
  const montant = (x) => ch.boite(x - 0.035, Y - 0.04, x + 0.035, Y + 0.04, 0, hT, M.alu);
  for (const x of [X0 + 0.035, X1 - 0.035]) montant(x);
  ch.boite(X0, Y - 0.04, X1, Y + 0.04, hP, hP + 0.08, M.alu);
  ch.boite(X0, Y - 0.04, X1, Y + 0.04, hT - 0.06, hT, M.alu);
  ch.boite(X0, Y - 0.025, X1, Y + 0.025, hP + 0.08, hT - 0.06, M.alu);
  C.ajouterBoite(X0, -(Y + 0.05), X1, -(Y - 0.05), { y0: hP, y1: H_DALLE });
  // le pan plein : le dos de la pile (construireMurs), peint en crème côté passage (son affiche : js/ecole_mobilier.js)
  ch.panneau(M.creme, X0 - 2.175, hT, (2.175 + X0) / 2, Y - 0.002, hT / 2, 'S');
  // LES AUTOCOLLANTS « iris » (photos 07, 19) : deux rangées de quatre sur le vantail EST (s = -1 : à droite vu du
  // passage), un seul au milieu du vantail ouest
  const rangs = (s) => (s < 0 ? [[0.9, 4], [1.4, 4]] : [[1.25, 1]]);
  ch.porte('x', Y, (X0 + X1) / 2, { l: X1 - X0, h: hP, ep: 0.08, modele: 'vitree2', autocollants: rangs, etat: 'auto', cote: 'S', huisserie: false, nom: 'passage' });
  // le bloc de sortie, côté hall, sous son plafond à 2,30
  ch.sortie(3.3, 4.17, 2.22, 'N');
}

// =====================================================================
//  LE REZ-DE-CHAUSSÉE
// =====================================================================
function construireMurs(ch) {
  const { M } = ch;
  const B = M.blanc, CR = M.creme;
  // ---- LE PASSAGE ET LE HALL OUEST (plan V2 § 2.2, 11/10 : le hall ouest repris MOT POUR MOT de la photo 06, retour r01
  // de Haythem — de 8,6 m à 4,9 m de long) ----
  // le mur ouest du passage (ligne x 2,1, le couloir de service derrière) et la porte blanche « Sortie », vers la rue
  // (photo 07 : à y ≈ 1,6, pas contre la paroi vitrée)
  ch.mur({ de: [2.1, -0.4], a: [2.1, 4.05], mats: { E: CR, W: B }, plinthes: ['E'], ouvertures: [{ c: 1.6, l: 0.9, h: 2.04 }] });
  ch.porte('y', 2.1, 1.6, { l: 0.9, h: 2.04, modele: 'blanche', etat: 'auto', cote: 'E', charniere: 'd', nom: 'service (passage)' });
  // le mur ouest du hall (ligne x 1,675), derrière la pile, le renfoncement de la porte grise et l'avancée nord
  ch.mur({ de: [1.675, 4.05], a: [1.675, 8.925], mats: B, plinthes: ['E'], ouvertures: [{ c: 9.575 + DY_SS, l: 0.95, h: 2.04 }] });
  // (09/10, la vidéo du sous-sol : elle ouvre sur le palier de l'escalier du -1, js/ecole_soussol.js ; on la TIRE depuis le
  // hall — vantail côté hall, gonds au sud, barre inox verticale, ferme-porte à glissière côté hall, photo 06 et v_001)
  // (plan V2 : y 5,02-5,95, à 0,97 m de la paroi vitrée — la chaîne du -1 suit, DY_SS)
  ch.porte('y', 1.675, 9.575 + DY_SS, { l: 0.93, h: 2.04, modele: 'grise', poignee: 'tirant', fermePorte: false, etat: 'auto', cote: 'E', libre: 1, nom: 'service (hall)' });
  ch.boite(1.765, 9.06 + DY_SS, 1.8, 9.6 + DY_SS, 2.06, 2.1, M.ferme, { ombre: false });
  ch.boite(1.765, 9.12 + DY_SS, 1.82, 9.4 + DY_SS, 2.1, 2.16, M.ferme, { ombre: false });
  // LES DEUX AVANCÉES DU MUR OUEST (photo 06) : la porte grise, l'extincteur et le radiateur sont dans un RENFONCEMENT
  // de 2,25 m ; de part et d'autre, le mur avance — au sud, LA PILE du plan d'évacuation, au nord, l'avancée de l'affiche
  // jaune du tri, contre l'angle des portes de l'escalier. Plinthes de bois sur les faces vues.
  // (Plan V2, la photo 06 rejouée au centimètre — retour de Haythem du 10/10 : « la porte n'est pas aussi loin ». Le pan
  // du plan d'évacuation part juste à droite du châssis de la porte vitrée du passage : c'est une vraie pile de 0,70 m de
  // profondeur sur 0,92 (x 1,75-2,45, y 4,05-4,97), dont le retour nord, l'angle rentrant, touche l'huisserie de la porte
  // grise — un carreau de 60 de renfoncement, et non 25 cm ; son dos est le pan plein de la paroi vitrée. L'avancée nord
  // fait 0,70 × 1,70 (y 7,22-8,925), le radiateur sur son retour sud, vu de chant ; son nu est (x 2,45) prolonge le jambage
  // ouest des portes de l'escalier, et le vantail ouvert s'y rabat à plat.)
  for (const [ya, yb, faces] of [[4.05, 4.97, ['E', 'N']], [7.22, 8.925, ['E', 'S']]]) {
    const xa = 2.45;
    ch.boite(1.75, ya, xa, yb, 0, H_DALLE, B, { collision: true });
    if (faces.includes('E')) ch.boite(xa, ya, xa + 0.015, yb, 0, 0.08, M.bois, { ombre: false });
    if (faces.includes('S')) ch.boite(1.75, ya - 0.015, xa + 0.015, ya, 0, 0.08, M.bois, { ombre: false });
    if (faces.includes('N')) ch.boite(1.75, yb, xa + 0.015, yb + 0.015, 0, 0.08, M.bois, { ombre: false });
  }
  // (côté passage, au pied du pan plein de la pile)
  ch.boite(2.175, 4.035, 2.45, 4.05, 0, 0.08, M.bois, { ombre: false });
  // le mur est du passage : la ligne x 4,5 (plan V2 : le trumeau des travées 3 et 4 ; derrière, la Si 0.1), jusqu'au mur
  // sud de la salle d'attente (ligne y 4,8) ; au nord, le hall s'ouvre sur la salle. (La porte de l'ex-salle A n'est plus
  // ici : sur le mur sud de la salle d'attente.)
  ch.mur({ de: [4.5, -0.4], a: [4.5, 4.05], mats: { W: CR, E: B }, plinthes: ['W'] });
  ch.mur({ de: [4.5, 4.05], a: [4.5, 4.875], mats: B, plinthes: ['W'] });
  // ---- LA SALLE D'ATTENTE ----
  // (10/10, ARBITRAGE de la visite officielle : de la porte 6, en 2021, le bout est du mur jaune et le totem se voient à
  // gauche de la pile, vers y 7,6 — 4,4 m plus au sud qu'ici ; mais la même vidéo à 11,6 s, les photos 02, 04, 05 de 2026
  // et l'ancrage du -1 sur la porte « service (hall) » tiennent la salle en y 9,0-12,075, droite. Les photos priment :
  // elle reste ici ; le détail des poses et des résidus est dans le message du commit.)
  // le sud : le mur de la salle A et ses deux jours dépolis (photos 02, 21)
  ch.mur({ de: [4.75, 9.0], a: [10.05, 9.0], mats: B, plinthes: ['N', 'S'], ouvertures: [{ c: 6.65, l: 1.3, bas: 0.95, h: 2.3 }, { c: 8.35, l: 1.3, bas: 0.95, h: 2.3 }] });
  const sud = new THREE.Group(); sud.position.set(0, 0, -9.0); ch.decor.add(sud);
  for (const c of [6.65, 8.35]) { fenetreDepolie(sud, M, { x: c, l: 1.3, bas: 0.95, haut: 2.3, ep: EP }); ch.C.ajouterBoite(c - 0.65, -8.95, c + 0.65, -9.05, { y0: 0.95, y1: 2.3, vitre: true }); }
  // la double lisse gris clair du mur sud, à 0,85 et 1,00
  for (const h of [0.82, 0.94]) ch.boite(4.9, 9.075, 9.9, 9.1, h, h + 0.04, M.lisseGrise, { ombre: false });
  // le nord : LE MUR SAFRAN (de x 5,8 à 11,7), sa lisse de PVC blanc, son panneau DAE
  ch.mur({ de: [5.8, 12.075], a: [11.7, 12.075], mats: { S: M.orange, N: B }, plinthes: ['S'] });
  ch.boite(5.8, 11.99, 11.7, 12.0, 0.85, 1.05, M.lissePVC, { ombre: false });
  for (const h of [0.85, 1.048]) ch.boite(5.8, 11.985, 11.7, 11.99, h, h + 0.004, M.lisseGrise, { ombre: false });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texDAE(), roughness: 0.4 }), 0.4, 0.1, 6.1, 11.994, 2.01, 'S');
  // l'est : le mur du fond (présentoir, radiateur) qui continue en mur est du couloir C01 (porte de la gaine)
  ch.mur({ de: [13.575, 7.5], a: [13.575, 20.75], mats: B, plinthes: ['W'], ouvertures: [{ c: 17.0, l: 1.2, h: 2.0 }] });
  ch.porte('y', 13.575, 17.0, { l: 1.2, h: 2.0, modele: 'gaine2', etat: 'fermee', cote: 'W', nom: 'gaine technique' });
  // (la trappe crème et la grille de ventilation au-dessus de la gaine : posées sur le mur, face ouest — photo 01 : la
  // trappe au-dessus du vantail NORD, côté toilettes, la grille au-dessus du vantail sud ; elles étaient inversées, 09/10)
  ch.boite(13.49, 17.1, 13.5, 17.55, 2.12, 2.6, M.creme2, { ombre: false });
  ch.boite(13.49, 16.45, 13.5, 16.9, 2.1, 2.62, M.grille, { ombre: false });
  for (let h = 2.15; h < 2.6; h += 0.05) ch.boite(13.48, 16.47, 13.49, 16.88, h, h + 0.02, M.noirMat, { ombre: false });
  // ---- LE COULOIR C05 ET LE COULOIR C01 ----
  // LES DEUX PORTES DES TOILETTES DU C05 (photo 23, 09/10) : femmes près de l'entrée (y 13,325-14,175), hommes aux deux
  // tiers (y 16,425-17,275) ; vantaux gris de 0,85, huisserie blanche, gonds au sud, béquille au nord, la fente vitrée
  // haute cerclée de bois foncé côté serrure (0,55-1,85 m ; relecture du 09/10, mesurée sur la porte des femmes de la
  // photo 23 contre la largeur des affiches A4 : 14 cm de verre et non 10, un noyer de 3,5 cm, la fente presque contre la
  // béquille — son axe à 20 cm du chant). Les plaques et les affiches : js/ecole_pieces.js (les toilettes).
  const WC_C05 = [[13.75, 'toilettes femmes'], [16.85, 'toilettes hommes']];
  ch.mur({ de: [5.875, 12.15], a: [5.875, 18.6], mats: B, plinthes: ['W'], ouvertures: WC_C05.map(([c]) => ({ c, l: 0.85, h: 2.04 })) });
  for (const [c, nom] of WC_C05) ch.porte('y', 5.875, c, { l: 0.85, h: 2.04, modele: 'grise', etat: 'auto', cote: 'W', oculus: { bas: 0.55, haut: 1.85, l: 0.14, bord: 0.2, cadre: 0.035 }, nom });
  ch.mur({ de: [11.625, 12.15], a: [11.625, 20.75], mats: B, plinthes: ['E'], ouvertures: [{ c: 13.85, l: 0.93, h: 2.04 }, { c: 19.05, l: 0.93, h: 2.04 }] });
  // (les portes du C01 n'ont pas d'oculus, photo 01)
  // (le local : gonds au nord, poignée au sud, photo 01)
  ch.porte('y', 11.625, 13.85, { l: 0.93, h: 2.04, modele: 'grise', oculus: false, etat: 'auto', cote: 'E', charniere: 'd', notices: 2, nom: 'local (C01)' });
  // (la porte des toilettes PMR : sa plaque montre un fauteuil roulant, photo 01 ; 09/10)
  ch.porte('y', 11.625, 19.05, { l: 0.93, h: 2.04, modele: 'grise', oculus: false, etat: 'auto', cote: 'E', charniere: 'd', nom: 'toilettes PMR' });
  ch.mur({ de: [11.55, 20.675], a: [13.65, 20.675], mats: B, plinthes: ['S'], ouvertures: [{ c: 12.6, l: 0.93, h: 2.04 }] });
  ch.porte('x', 20.675, 12.6, { l: 0.93, h: 2.04, modele: 'grise', etat: 'fermee', cote: 'S', nom: 'fond du C01' });
  // ---- LE « COU » ET LE BUREAU B ----
  ch.mur({ de: [9.975, 0], a: [9.975, 9.075], mats: B, plinthes: ['W', 'E'] });
  // LE BUREAU DE DIRECTION B 0.3 (le « bureau B ») ET LE PASSAGE AU SUD-OUEST DE LA PILE (10/10, VO 7,0-9,0 s et photo 03 :
  // de la porte 6, la vue passe à gauche de la pile entre y 3,6 et 4,7 ; du cou, le hall et toute la porte 6 au-delà de
  // l'angle de la pile — la pile : js/ecole_rdc_centre.js). Le bureau perd son angle nord-est : son mur est s'arrête à
  // y 2,5, deux retours (y 2,5 et x 12,1) le referment ; le passage fait 2,1 m côté hall et 1,13 m entre l'angle du bureau
  // et celui de la pile. Son mur nord garde le jour dépoli (0,62 m, la largeur que lui donne la photo 01 à côté de la
  // porte) et la porte vitrée, poussée à l'ouest ; entre les deux, la plaque du bureau de direction.
  ch.mur({ de: [10.05, 4.8], a: [12.175, 4.8], ep: 0.12, mats: B, plinthes: ['N', 'S'], ouvertures: [{ c: 10.42, l: 0.62, bas: 1.0, h: 2.4 }, { c: 11.5, l: 0.9, h: 2.1 }] });
  const nordB = new THREE.Group(); nordB.position.set(0, 0, -4.8); ch.decor.add(nordB);
  fenetreDepolie(nordB, M, { x: 10.42, l: 0.62, bas: 1.0, haut: 2.4, ep: 0.12, bandeClaire: 0.2 });
  ch.C.ajouterBoite(10.11, -4.75, 10.73, -4.85, { y0: 1.0, y1: 2.4, vitre: true });
  // (toujours vers le cou, comme sur la photo 03 où elle est ouverte de ce côté : jamais de vantail dans ce petit bureau)
  ch.porte('x', 4.8, 11.5, { l: 0.9, h: 2.1, ep: 0.12, modele: 'vitree', etat: 'auto', cote: 'S', tirant: 'court', libre: -1, nom: 'bureau B' });
  ch.mur({ de: [12.1, 2.5], a: [12.1, 4.86], mats: B, plinthes: ['E', 'W'] });
  ch.mur({ de: [12.025, 2.5], a: [13.35, 2.5], mats: B, plinthes: ['N', 'S'] });
  // le mur est du bureau B : tableau noir du portail n° 6 jusqu'à y = 0,3, puis le hall, jusqu'au retour y 2,5
  ch.mur({ de: [13.275, -0.4], a: [13.275, 0.3], mats: { E: M.noirMat, W: B } });
  ch.mur({ de: [13.275, 0.3], a: [13.275, 2.575], mats: B, plinthes: ['E', 'W'] });
  // le trumeau blanc du cou, le pilier gris de la salle d'attente (plinthes de bois tout autour)
  const pilier = (x0, y0, x1, y1, mat) => {
    ch.boite(x0, y0, x1, y1, 0, H_DALLE, mat, { collision: true });
    ch.boite(x0 - 0.015, y0 - 0.015, x1 + 0.015, y1 + 0.015, 0, 0.08, M.bois, { ombre: false });
  };
  pilier(10.8, 6.0, 11.2, 6.9, B);
  // (09/10/2026 : le pilier gris est DÉTACHÉ du mur de la salle A — photo 21 : planté dans la salle, le fond visible de
  // part et d'autre ; photo 02 : il frôle le bord gauche de l'image. Il était collé au bout du mur, y 8,9-9,5.)
  pilier(10.3, 9.75, 10.9, 10.35, M.pilier);
  // ---- LE HALL D'ENTRÉE ----
  // (09/10, photo 24 : la porte du mur nord n'est pas en x 17 mais en face de la porte 6 — 1,5 vantail, x 14,70-16,10 ;
  // à l'est, la cloison vitrée cannelée, le photocopieur devant elle côté hall (10/10 : l'angle nord-est est ouvert, VO
  // q_0026-0031). Les vantaux, la cloison, le couloir et l'escalier qui suivent : js/ecole_est.js)
  // (10/10 : à l'ouest de la porte, la pile — js/ecole_rdc_centre.js : le mur part de sa face est)
  ch.mur({ de: [14.6, 7.575], a: [16.25, 7.575], mats: B, plinthes: ['S'], ouvertures: [{ c: 15.4, l: 1.4, h: 2.1 }] });
  // (le mitoyen est du hall, x 19,95 de y -0,4 à 7,65 : peint gris ardoise côté accueil — js/ecole_hall.js, 10/10)
  // ---- L'ESCALIER : la cage (jusqu'au plafond de l'étage), les portes coupe-feu ----
  // (plan V2 : tout recule de DY_S. Le mur des portes est sur la ligne y 9,0 ; plus de trumeau entre les portes et le C05
  // — l'ouverture, élargie, va jusqu'au jambage, x 4,45, et le C05 commence au mur est de la cage)
  ch.mur({ de: [1.6, 13.675 + DY_S], a: [4.75, 13.675 + DY_S], mats: B, plinthes: ['S', 'N'], ouvertures: [{ c: 3.45, l: 2.0, h: 2.1 }] });
  ch.mur({ de: [4.675, 13.6 + DY_S], a: [4.675, 18.75 + DY_S], h: H_CAGE, mats: B, plinthes: ['E'] });
  ch.mur({ de: [1.675, 13.6 + DY_S], a: [1.675, 18.75 + DY_S], h: H_CAGE, mats: B });
  // le mur nord de la cage (ligne y 14,0 ; derrière, la salle David Clark : sa face nord est dans la salle — 09/10)
  ch.mur({ de: [1.6, 18.675 + DY_S], a: [4.75, 18.675 + DY_S], h: H_CAGE, mats: B, plinthes: ['S', 'N'] });
  // (au bout du C05, le mur de la salle David Clark : sa porte bleue et son imposte, x 4,75-5,6 jusqu'à 2,28 m — le lot du
  // fond du rez-de-chaussée)
  ch.mur({ de: [4.675, 18.675], a: [5.95, 18.675], h: H_CAGE, mats: B, plinthes: ['S', 'N'], ouvertures: [{ c: 5.175, l: 0.85, h: 2.28 }] });
  // au 1er étage : le mur sud du palier (ligne y 7,85, avec sa double porte coupe-feu) et ses retours
  ch.mur({ de: [1.6, 12.525 + DY_S], a: [4.75, 12.525 + DY_S], base: H_DALLE, h: H_CAGE, mats: B, ouvertures: [{ c: 3.5, l: 1.8, bas: 2 * ESC.hPalier, h: 2 * ESC.hPalier + 2.1 }] });
  ch.mur({ de: [1.675, 12.45 + DY_S], a: [1.675, 13.6 + DY_S], base: H_DALLE, h: H_CAGE, mats: B });
  ch.mur({ de: [4.675, 12.45 + DY_S], a: [4.675, 13.6 + DY_S], base: H_DALLE, h: H_CAGE, mats: B });
  // (ouverte à demeure, ses deux vantaux rabattus côté étage, comme celle du hall ouest : le 1er étage, js/ecole_etage1.js)
  ch.porte('x', 12.525 + DY_S, 3.5, { l: 1.8, h: 2.1, base: 2 * ESC.hPalier, modele: 'grise2', feu: true, etat: 'ouverte', ouverts: [true, true], angle: 1.6, cote: 'S', notices: 1, nom: '1er étage' });
  // LES PORTES COUPE-FEU DE L'ESCALIER (photos 04, 06, 20) : deux vantaux de 1,0 m, x 2,45-4,45 (plan V2 ; le jeu avait
  // 2 x 0,90 à partir de x 2,6). Le vantail ouest ouvert à demeure vers le hall, à 90°, À PLAT contre l'avancée nord
  // (photos 06, 20 : x 2,45-2,50, y 8,0-9,0 ; il était décollé de 25 cm) ; l'est fermé, ses deux A4 l'un au-dessus de
  // l'autre (js/ecole_mobilier.js) ; une huisserie, et le rail du ferme-porte sur toute la largeur, côté hall (photos 06,
  // 20 : la barre grise sous le soffite)
  ch.porte('x', 13.675 + DY_S, 3.45, { l: 2.0, h: 2.1, modele: 'grise2', feu: true, etat: 'ouverte', ouverts: [true, false], angle: Math.PI / 2, cote: 'S', notices: 0, noticesD: 0, nom: 'escalier' });
  ch.boite(2.45, 8.88, 4.45, 8.925, 2.16, 2.2, M.ferme, { ombre: false });
}

// LA PORTE DU FOND DE C05 (photos 05, 23) : ce n'est PAS une issue de secours (09/10) — c'est celle d'une salle
// informatique, « Salle David Clark — Si 0.2 » (sa plaque à droite de la porte, js/ecole_pieces.js) ; sur la photo 23 un
// étudiant en sort en la poussant : elle s'ouvre VERS LE COULOIR, gonds à l'ouest. Huisserie blanche, vantail de verre
// dépoli bleu (le jour des fenêtres de la salle le traverse : il « s'allume » sur la photo 05), béquille inox à droite,
// pastille rouge en haut ; au-dessus, l'imposte dépolie, plus claire, jusque sous le plafond. Plus de bloc de sortie :
// ni la photo 05 ni la 23 n'en montrent. Automatique, toujours ouverte du côté du couloir (`libre`).
function construirePorteFond(ch) {
  const { M, C } = ch, y0 = 18.6, y1 = 18.75, x0 = 4.75, x1 = 5.6, hv = 2.0, hT = 2.28, c = 0.04;
  // l'huisserie sur toute l'épaisseur du mur (elle déborde d'un centimètre), la traverse sous l'imposte, le linteau
  ch.boite(x0, y0 - 0.01, x0 + c, y1 + 0.01, 0, hT, M.alu); ch.boite(x1 - c, y0 - 0.01, x1, y1 + 0.01, 0, hT, M.alu);
  ch.boite(x0, y0 - 0.01, x1, y1 + 0.01, hv, hv + 0.05, M.alu); ch.boite(x0, y0 - 0.01, x1, y1 + 0.01, hT - c, hT, M.alu);
  const imposte = M.depoliBleu.clone(); imposte.color.set(0x6b7d99); imposte.emissiveIntensity = 0.2;
  ch.boite(x0 + c, 18.669, x1 - c, 18.681, hv + 0.05, hT - c, imposte, { ombre: false });
  C.ajouterBoite(x0, -y1, x1, -y0, { y0: hv, y1: hT, vitre: true });
  ch.porte('x', 18.675, (x0 + x1) / 2, { l: x1 - x0 - 2 * c, h: hv, modele: 'bleue', etat: 'auto', cote: 'S', huisserie: false, libre: 1, nom: 'salle David Clark' });
}

// L'ACCUEIL ET LE HALL D'ENTRÉE (VO 6,4-7,4 s et 92,5-95,8 s, photos 03, 16, 24 ; 10/10) : le comptoir n'est pas le long
// de la façade mais NORD-SUD, face à l'ouest (x 16,45-17,15, y 1,1-3,55), terminé au nord par la tablette PMR et le
// pupitre de chêne grisé ; derrière lui l'open-space du personnel, le mitoyen gris ardoise et ses affiches ; l'angle
// nord-est ouvert (photocopieur, étiquettes « INFORMATIQUE », table, présentoir de bois) ; les lignes lumineuses du
// plafond : js/ecole_hall.js.
function construireAccueil(ch) {
  const { M } = ch;
  poserHall(ch);
  // le tapis d'entrée bleu-gris foncé
  ch.boite(13.6, 0.4, 16.2, 1.9, 0, 0.012, M.tapis, { ombre: false });
}

// LES RADIATEURS (photos 03, 06, 21) : panneaux blancs, grille sur le dessus
function radiateur(ch, x, y, face, l, h0, h1) {
  const { M } = ch, e = 0.08;
  const [ax0, ay0, ax1, ay1] = face === 'E' ? [x, y - l / 2, x + e, y + l / 2] : face === 'W' ? [x - e, y - l / 2, x, y + l / 2] : face === 'S' ? [x - l / 2, y - e, x + l / 2, y] : [x - l / 2, y, x + l / 2, y + e];
  ch.boite(ax0, ay0, ax1, ay1, h0, h1, M.radiateur, { collision: true });
  ch.boite(ax0 + 0.01, ay0 + 0.01, ax1 - 0.01, ay1 - 0.01, h1, h1 + 0.005, M.grille, { ombre: false });
}

// =====================================================================
//  LA CARTE
// =====================================================================
export function construireCarte(scene, renderer = null) {
  const ch = new Chantier(scene);
  const { C, M } = ch;
  // (une copie du carrelage pour les paliers : sans l'ombre ni la lumière cuites du rez-de-chaussée)
  // (une rugosité à peine différente : l'optimisation du décor ne doit pas la confondre avec celui du rez-de-chaussée)
  M.solEtage = M.sol.clone(); M.solEtage.roughness = 0.94;
  scene.background = new THREE.Color(0xdeeaf6);         // le ciel couvert, vu par la porte 6 et le passage
  scene.fog = null;

  // ---- les sols du rez-de-chaussée ----
  // (09/10 : coupé au droit du palier et de la trémie de l'escalier du sous-sol — le palier a son sol de béton peint,
  // js/ecole_soussol.js ; plan V2 : la trémie suit la porte grise, x -0,3-1,6, y 4,95-10,175 ; le passage, rétréci à
  // x 2,175-4,425 et arrêté en y 4,05, a son carrelage à lui — solP)
  const RN = [
    [-0.3, -0.4, 2.1, 4.05, 'ns', 1.75, 0], [-0.3, 4.05, 1.6, 4.95, 'ns', 1.75, 0], [-0.3, 10.175, 1.6, 20.75, 'ns', 1.75, 0],
    [1.6, 4.05, 4.9, 20.75, 'ns', 1.75, 0], [4.5, -0.4, 4.9, 4.05, 'ns', 1.75, 0], [4.9, -0.4, 5.3, 20.75, 'ns', 1.75, 0],
    [5.3, -0.4, 13.5, 9.0, 'ns', 1.75, 0], [5.3, 9.0, 13.5, 12.0, 'ew', 5.8, 9.0], [5.3, 12.0, 13.5, 20.75, 'ns', 1.75, 0],
    // (le hall ; au nord, le lino du couloir est et de l'escalier est remplace le carrelage : js/ecole_est.js)
    [13.5, -0.4, 20.1, 7.575, 'ns', 1.75, 0], [13.5, 7.575, 14.6, 20.75, 'ns', 1.75, 0], [14.6, 12.45, 20.1, 20.75, 'ns', 1.75, 0],
    [1.6, 20.75, 9.0, 24.5, 'ns', 1.75, 0],          // la salle David Clark, au-delà du fond du bâtiment (09/10)
  ];
  const sol = new THREE.Mesh(geoSol(RN), M.sol); sol.receiveShadow = true; sol.name = 'carrelage'; nePasFusionner(sol);
  scene.add(sol);
  const solP = new THREE.Mesh(geoSol([[2.1, -0.4, 4.5, 4.05, 'droit', 2.175, 0]]), M.solPassage); solP.receiveShadow = true; nePasFusionner(solP);
  scene.add(solP);
  // LE « TERRAIN » que lisent le rendu et l'ombre cuite (js/fx.js setReflet, js/kit_decor.js) : un plan invisible qui
  // couvre RECT, du même matériau que le carrelage (l'ombre cuite posée sur son matériau vaut pour tout le carrelage)
  const W = RECT.x1 - RECT.x0, L = RECT.y1 - RECT.y0, cx = (RECT.x0 + RECT.x1) / 2, cz = -(RECT.y0 + RECT.y1) / 2;
  const court = new THREE.Mesh(new THREE.PlaneGeometry(W, L), M.sol);
  court.rotation.x = -Math.PI / 2; court.position.set(cx, -0.002, cz); court.visible = false; court.name = 'sol (repère)';
  nePasFusionner(court); scene.add(court);

  // ---- les murs, les portes, la façade, l'escalier ----
  construireFacade(ch);
  construireMurs(ch);
  construireEntree(ch);
  construireParoiPassage(ch);
  construirePorteFond(ch);
  construireEscalier(ch);
  construireAccueil(ch);
  // (le radiateur du hall ouest : entre l'extincteur et l'affiche jaune du tri — photos 02 et 06, de gauche à droite :
  // porte grise, extincteur, radiateur, affiche, portes de l'escalier. Relecture du 09/10 : il est fixé sur la face SUD
  // de l'avancée nord, perpendiculaire au mur — la photo 02 le montre de chant, la photo 06 de trois quarts)
  // (plan V2 : contre l'angle de l'avancée nord, y 7,22 — photo 06)
  radiateur(ch, 2.17, 7.22, 'S', 0.45, 0.15, 1.3);
  // le mur du fond de la salle d'attente : le radiateur à côté du présentoir (photo 21), et celui du bout du mur, près
  // de l'angle du hall d'entrée, sous le haut-parleur et l'affichette WIFI (photo 03) (09/10)
  radiateur(ch, 13.5, 10.5, 'W', 0.45, 0.15, 1.1);
  // (10/10 : celui de la photo 03 est sur la face ouest de la pile, son bout à 0,3 m de l'angle sud-ouest — l'angle
  // au-delà duquel la photo voit le hall ; relecture : la photo recalée le met en y 5,0-5,6, pas 5,35-5,85)
  radiateur(ch, 13.3, 5.32, 'W', 0.6, 0.12, 1.15);
  // la caméra de surveillance du hall ouest et son haut-parleur (au mur des portes, à droite du jambage, sous le plafond
  // à 2,30) ; le déclencheur manuel rouge (au bout ouest du mur sud de la salle d'attente : DY_A)
  const dome = maille(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.boitier, 4.2, 2.3, -8.4, 0, ch.decor, { ombre: false });
  dome.userData.horsAOSol = true;
  ch.boite(4.53, 8.855, 4.67, 8.925, 2.14, 2.26, M.boitier, { ombre: false });
  ch.boite(4.9, 9.075 + DY_A, 5.0, 9.11 + DY_A, 1.25, 1.35, M.rougeEtiquette, { ombre: false });

  // ---- les plafonds ----
  ch.plafond(2.175, 0, 4.425, 4.05, 2.6, 'platre');                  // le passage
  // le hall ouest (plan V2 : plâtre à 2,30 — photo 06, 2,25-2,30 ; le jeu avait 2,40) : la gorge derrière la paroi
  // vitrée, le hall jusqu'aux dalles de la salle d'attente (x 5,3), et devant le C05, au nord du mur safran
  ch.plafond(1.75, 4.05, 4.5, 4.875, 2.3, 'platre');
  ch.plafond(1.75, 4.875, 5.3, 8.925, 2.3, 'platre');
  ch.plafond(5.3, 12.0 + DY_A, 5.975, 8.925, 2.3, 'platre');
  // C05 : au premier tiers (y 15,2), une RETOMBÉE — le fond du couloir est plus bas (2,30), l'imposte de la porte bleue
  // vient juste sous son plafond (photos 05 et 23 : le premier hublot avant le ressaut, le second après ; 09/10)
  ch.plafond(4.6, 13.6, 5.8, 15.2, 2.4, 'platre');
  ch.plafond(4.6, 15.2, 5.8, 18.6, 2.3, 'platre');
  // la salle d'attente : les plateaux perforés, sauf au bout ouest, devant le couloir C05, où ce sont des dalles lisses
  // de 60 x 60 sur ossature (photos 04, 05 : au-dessus du photographe ; 09/10)
  ch.plafond(6.5, 9.0, 13.5, 12.0, 2.6, 'plateaux');
  ch.plafond(5.3, 9.0, 6.5, 12.0, 2.6, 'dalles', { retombees: false });
  ch.plafond(9.9, 4.8, 13.5, 9.0, 2.6, 'plateaux');                  // le cou
  ch.plafond(11.7, 12.0, 13.5, 20.6, 2.45, 'platre');                // C01
  ch.plafond(13.35, 0.3, 19.8, 7.5, 2.6, 'platre');                  // le hall d'entrée
  ch.plafond(9.9, 0, 13.35, 4.8, 2.6, 'plateaux');                    // le bureau B (visitable : js/ecole_pieces.js)
  ch.plafond(4.75, 0, 9.9, 9.0, 2.6, 'plateaux');                      // la salle A (visitable : js/ecole_pieces.js)

  // ---- les luminaires (et les lampes : ce sont les mêmes) ----
  // (plan V2 : les deux réglettes au-dessus des lièges, vers la rue — photos 07, 10)
  ch.tube(2.175, 0.9, 2.4, 2.35, 1, 'passage'); ch.tube(4.425, 0.9, 2.4, 2.35, -1, 'passage');
  ch.sortie(3.3, 0.12, 2.3, 'N');
  // (09/10 : plus de hublot en (5,2 ; 12,9), à l'entrée du C05 — ni la photo 05 ni la photo 23 n'en montrent : les deux
  // qu'on y voit sont ceux du C05 ; plan V2 : les deux du hall, l'un devant la porte grise, l'autre devant l'escalier)
  for (const [x, y] of [[3.5, 5.9], [3.6, 8.2]]) ch.opale(x, y, 2.3, 'hallO');
  // (les deux hublots du C05, photos 23 et 05 : le premier au droit de la porte des toilettes femmes, avant la
  // retombée, le second passé la retombée, sous le plafond bas — Ø 38 cm ; 09/10)
  ch.opale(5.25, 14.2, 2.4, 'c05', { r: 0.18 }); ch.opale(5.25, 16.5, 2.3, 'c05', { r: 0.18 });
  for (const [x, y] of [[6.6, 9.9], [9.0, 9.9], [11.4, 9.9], [7.8, 11.1], [10.2, 11.1], [12.6, 11.1]]) ch.spot(x, y, 2.6, 'attente');
  for (const [x, y] of [[12.3, 7.8], [11.9, 5.7]]) ch.spot(x, y, 2.6, 'cou');
  for (const [x, y] of [[12.6, 16.0], [12.6, 19.4]]) ch.opale(x, y, 2.45, 'c01');
  // (10/10, VO 92,6-94,8 s : les spots ronds du hall relevés depuis la porte nord — une rangée vers y 4,3 au bout des
  // lignes lumineuses, une vers y 3,2 au-dessus du comptoir ; au-dessus de l'open-space et dans l'angle nord-est, rouvert,
  // posés au même pas. Les huit lignes : js/ecole_hall.js)
  for (const [x, y] of [[15.4, 4.3], [16.55, 4.3], [17.7, 4.3], [17.25, 3.2], [18.75, 3.2], [17.25, 1.5], [18.75, 1.5], [15.9, 6.2], [18.3, 6.3]]) ch.spot(x, y, 2.6, 'hall');
  // (10/10 : le bureau B a perdu son angle nord-est, le passage de la pile — le second spot recule)
  for (const [x, y] of [[11.0, 2.4], [12.55, 1.55]]) ch.spot(x, y, 2.6, 'bureauB');
  // (la salle A : ses six dalles LED sont posées avec son mobilier, js/ecole_pieces.js)
  // (la cage, décalée de DY_S : l'applique du mur nord au-dessus du palier intermédiaire, le plafonnier du palier du 1er,
  // l'applique du mur est au-dessus de la volée 1 — le plafonnier du haut de la cage : js/ecole_etage1.js)
  ch.opale(3.2, 18.6 + DY_S, 3.75, 'escalier', { mur: 'S', r: 0.15 });
  ch.opale(3.2, 13.4 + DY_S, H_CAGE, 'palier1', { r: 0.18, base: 2 * ESC.hPalier });
  ch.opale(4.6, 15.5 + DY_S, 2.95, 'escalier', { r: 0.15, mur: 'W', cuire: false });
  ch.sortie(11.2, 9.6, 2.4, 'W', { suspendu: true });
  // LE JOUR qui entre (pour les spots : une lampe froide dehors, qui vise l'intérieur ; pour la lumière cuite : la source
  // au pied de l'ouverture, `ox/oz` le point d'où l'on découpe sa visibilité, dehors)
  const jour = (x, y, cible, zone, o = {}) => ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.6, cx: cible[0], cz: -cible[1], sx: x, sz: -(y + 0.3), ox: x, oz: -(y - 0.5), zone, ...o });
  jour(15.25, 0.3, [15.25, 3.2], 'hall', { poids: 1.6 });
  jour(3.3, -0.4, [3.3, 2.0], 'passage', { poids: 1.4 });
  for (const x of [17.33, 18.98]) ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.4, sx: x, sz: -0.4, ox: x, oz: 0.5, zone: 'hall', reel: false, cuireForce: 0.55 });
  for (const x of [5.78, 7.43, 9.08]) ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.4, sx: x, sz: -0.4, ox: x, oz: 0.5, zone: 'salleA', reel: false, cuireForce: 0.8 });
  for (const x of [10.73, 12.38]) ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.4, sx: x, sz: -0.6, ox: x, oz: 0.5, zone: 'bureauB', reel: false, cuireForce: 0.5 });
  // (le jour des fenêtres de la salle David Clark, à travers la porte bleue : une nappe froide au bout du C05)
  ch.lampes.push({ type: 'jour', x: 5.175, z: -19.2, h: 2.4, sx: 5.175, sz: -18.3, ox: 5.175, oz: -18.5, zone: 'c05', reel: false, cuireForce: 0.3 });

  // ---- LES CROCHETS : le mobilier, la rue ----
  poserMobilier(ch);
  // la pile du hall (plaque « iris », horloge, annuaires), le bureau de direction B 0.3, le totem : js/ecole_rdc_centre.js
  poserRdcCentre(ch);
  poserRue(ch);
  // les pièces qu'on peut maintenant visiter (salle A, bureau B, couloir de service, local, toilettes, salle David
  // Clark) et leurs zones
  const pieces = poserPieces(ch);
  // le couloir est et l'escalier est (photos 24 à 29) : la porte nord du hall, la cloison vitrée, le couloir, le
  // vestibule, les volées 1 et 2 jusqu'au 1er ; leurs zones (celles de la cage du 1er à part : en tête) et leur sol
  const est = poserEst(ch, { RECT });
  // le 1er étage (IMAGINÉ en attendant des photos : salles derrière les fenêtres de la façade, couloir, toilettes,
  // bureaux, l'escalier vers le 2e ; son palier est, d'après les photos 27 à 29, par js/ecole_est.js) : ses zones de
  // lumière et sa mise à jour reviennent ici
  const etage1 = poserEtage1(ch, renderer);
  // le SOUS-SOL (d'après la vidéo de Haythem) : derrière la porte grise du hall ouest, le palier, la volée, le hall du -1,
  // le couloir et l'espace pause ; ses zones (en tête : elles passent sous celles du rez-de-chaussée), sa mise à jour, et
  // le sol du palier (niveau 0) qui prend la lumière et l'ombre cuites d'ici
  const sousSol = poserSousSol(ch, renderer, { RECT });
  // (10/10, la visite officielle) la descente de l'escalier est au -1, son palier, le sas technique et le passage vers
  // l'espace pause ; ses zones (en tête, à hauteur maximale) et sa mise à jour
  const sousSolEst = poserSousSolEst(ch, renderer, { RECT });

  // =====================================================================
  //  LA LUMIÈRE
  // =====================================================================
  // La lumière principale, une directionnelle presque d'aplomb, figure l'ensemble des plafonniers (et dehors, le ciel
  // couvert) : c'est elle qui porte les ombres douces du moteur. L'hémisphère est le rebond des murs ; le remplissage,
  // une lumière douce de biais qui modèle les visages. Les spots qui suivent Haythem, la lumière cuite au sol et la carte
  // d'environnement reprise dans chaque pièce : js/ecole_lumieres.js.
  // (le bas de l'hémisphère : la lumière que le sol et les murs renvoient vers les plafonds — sur les photos, les plafonds
  // sont presque aussi clairs que les murs)
  // (09/10 : un rien moins chaudes — #FFF3E2 / #FFF1DE -> #FFF6EC / #FFF4E6 : les blancs viraient au crème)
  const hemi = new THREE.HemisphereLight(0xfff6ec, 0x9a948b, 0.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.0);
  const cible = new THREE.Vector3(cx, 0, cz);
  sun.position.copy(DIR_LUMIERE).multiplyScalar(40).add(cible);
  sun.target.position.copy(cible); scene.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe8eef8, 0.25);
  fill.position.set(cx - 18, 9, cz + 14); fill.target.position.copy(cible); scene.add(fill.target);
  fill.castShadow = false; fill.userData.sansOmbre = true; scene.add(fill);

  // LES ZONES (pièces) : les spots ne s'allument que dans la pièce de Haythem et celles qui s'y ouvrent ; chaque zone a
  // son point de prise de vue pour la carte d'environnement. Rectangles en monde : [x0, z0, x1, z1, hauteur mini].
  const zr = (x0, y0, x1, y1, hmin = -1) => [x0, -y1, x1, -y0, hmin];
  const zones = [
    // (plan V2 : la cage décalée de DY_S, le palier du 1er de y 7,775 à 9,525 ; le passage rétréci)
    { id: 'palier1', rects: [zr(1.6, 7.775, 4.75, 14.075, 2.6)], voisines: ['escalier', 'e1hall'], env: { x: 3.2, y: 4.9, z: -8.7 } },
    { id: 'escalier', rects: [zr(1.6, 9.0, 4.75, 14.075)], voisines: ['hallO', 'palier1'], env: { x: 3.4, y: 2.4, z: -11.3 } },
    { id: 'passage', rects: [zr(2.1, -0.45, 4.5, 4.05)], voisines: ['hallO', 'rue'], env: { x: 3.3, y: 1.6, z: -2.0 } },
    { id: 'c05', rects: [zr(4.6, 13.6, 5.9, 18.75)], voisines: ['hallO'], env: { x: 5.2, y: 1.5, z: -15.8 } },
    // (plan V2 : le hall ouest en trois rectangles — la gorge derrière la paroi vitrée, entre la pile et la ligne x 4,5 ;
    // le hall ouvert sur la salle d'attente jusqu'à x 5,8 ; devant les portes de l'escalier et le C05, au nord du mur
    // safran, jusqu'à x 6,05)
    { id: 'hallO', rects: [zr(1.6, 4.05, 4.5, 4.875), zr(1.6, 4.875, 5.8, 7.8), zr(1.6, 7.8, 6.05, 9.0)], voisines: ['passage', 'attente', 'c05', 'escalier'], env: { x: 3.6, y: 1.6, z: -6.4 } },
    { id: 'c01', rects: [zr(11.6, 12.0, 13.6, 20.75)], voisines: ['attente'], env: { x: 12.6, y: 1.5, z: -16.5 } },
    { id: 'attente', rects: [zr(5.8, 9.0, 13.6, 12.0)], voisines: ['hallO', 'cou', 'c01'], env: { x: 9.2, y: 1.6, z: -10.5 } },
    // (10/10 : le cou s'arrête à la pile et prend le passage au sud-ouest de la pile ; le hall perd la pile —
    // js/ecole_rdc_centre.js)
    { id: 'cou', rects: [zr(9.9, 4.8, 13.3, 9.0), zr(12.1, 2.5, 13.3, 4.8)], voisines: ['attente', 'hall'], env: { x: 11.9, y: 1.6, z: -7.2 } },
    { id: 'hall', rects: [zr(13.3, -0.45, 20.1, 4.7), zr(14.675, 4.7, 20.1, 7.6)], voisines: ['cou', 'rue', 'couloirEst'], env: { x: 15.8, y: 1.6, z: -4.0 } },
    { id: 'rue', rects: [zr(-25, -12, 50, -0.4)], voisines: ['hall', 'passage'], env: { x: 9.5, y: 1.7, z: 3.4 } },
    ...pieces.zones,
    ...est.zones,
  ];
  // (celles de l'étage et du sous-sol d'abord : leurs rectangles couvrent ceux du rez-de-chaussée, à d'autres hauteurs ;
  // et devant elles, la cage de l'escalier est et son palier du 1er)
  zones.unshift(...est.zonesHaut, ...etage1.zones, ...sousSolEst.zones, ...sousSol.zones);
  const lumieres = new LumieresEcole(scene, { lampes: ch.lampes.filter((l) => l.reel !== false), zones });
  // LA LUMIÈRE CUITE AU SOL (toutes les sources, découpées par les murs)
  const lm = cuireLumiereSol(C, ch.lampes, { x0: RECT.x0, z0: -RECT.y1, W, L }, { tpm: 16 });
  const solsCuits = [M.sol, M.solPassage, ...sousSol.solsRDC];
  for (const m of solsCuits) { m.lightMap = lm; m.lightMapIntensity = 1.4; m.needsUpdate = true; }
  for (const m of est.sols) { m.lightMap = lm; m.needsUpdate = true; }      // (le lino : son intensité est la sienne)
  // (le passage : le jour de la grille et les deux réglettes s'y ajoutent ; à 1,4 son carrelage sortait blanc — 09/10)
  M.solPassage.lightMapIntensity = 0.85;

  scene.userData.interieur = true;
  scene.userData.sunDir = DIR_LUMIERE.clone();
  scene.userData.env = { sun, hemi, fill, clouds: [], court, wetMats: [] };
  // l'ombre ne couvre que l'école et le trottoir : ses texels vont là où l'on marche
  // (09/10 : jusqu'à y 24,8 — la salle David Clark)
  scene.userData.zoneOmbre = { min: [-1, 0, -24.8], max: [21, H_CAGE, 3.2] };
  scene.userData.albedoSol = false;
  // la carte d'environnement : prise d'abord dans le hall d'entrée (le départ), puis reprise de pièce en pièce
  scene.userData.pointEnv = { x: 15.8, y: 1.6, z: -4.0 };
  scene.userData.envTerrain = carteLocale(scene, ['#ece8e0', '#f2eee6', '#6d6a64', '#4d4a46']); scene.userData.envLocale = true;
  poserSondeLocale(scene, 1.25, 1.15);
  scene.userData.ombreContact = { contact: 0.5, occlusion: 1.8, borne: 0.65 };
  scene.userData.occlusionSol = { rayon: 1.6, intensite: 1.0 };
  scene.userData.animate = (tps) => animerVent(tps);
  scene.userData.aoCanal = 1;
  optimiserDecor(scene);
  planifierOcclusionSol(scene, renderer, court, W, L, { cx, cz });

  // ---- LA CARTE VIVANTE (js/game.js, à chaque image) ----
  let cuit = -1;
  const maj = (dt, jeu) => {
    const u = jeu.user.pos, cam = jeu.camera.position;
    ch.portes.maj(dt, u.x, u.z, cam.x, cam.z, u.y, cam.y);
    lumieres.maj(dt, u.x, u.z, jeu.renderer, u.y);
    etage1.maj(dt, jeu);
    sousSol.maj(dt, jeu);
    sousSolEst.maj(dt, jeu);
    est.maj(dt, jeu);
    // l'ombre cuite au sol vaut aussi pour le carrelage du passage et le sol du palier du sous-sol (elle est posée sur le
    // matériau du « terrain »)
    if ((scene.userData.solCuit || 0) !== cuit && M.sol.aoMap) {
      cuit = scene.userData.solCuit || 0;
      for (const m of solsCuits) if (m !== M.sol) { m.aoMap = M.sol.aoMap; m.aoMapIntensity = M.sol.aoMapIntensity; m.needsUpdate = true; }
    }
  };
  // le départ : dans le hall d'entrée, juste passé la porte 6, plein nord, face à la pile et à sa plaque « iris » — là
  // où entre la visite officielle (VO q_0026-0028 ; 10/10)
  const d = { x: 14.9, y: 1.3 }, v = { x: 0, y: 1 }, n = Math.hypot(v.x, v.y);
  return {
    nom: 'IRIS — rez-de-chaussée',
    collisions: C,
    depart: { x: d.x, z: -d.y, fx: v.x / n, fz: -v.y / n },
    // (zMin -22 -> -25 : la salle David Clark va jusqu'à y 24,35 — 09/10)
    bornes: { xMin: -22, xMax: 47, zMin: -25, zMax: 11 },
    sieges: ch.sieges,
    maj,
    lumieres, portes: ch.portes, chantier: ch,
  };
}
