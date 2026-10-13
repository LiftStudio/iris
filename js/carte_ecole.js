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
//   le passage des étudiants   x 1,75-4,425  y -0,4-4,05  grille sur rue (2,25 m), portes vitrées au fond (07, 10, 19)
//   le hall ouest (escalier)   x 1,75-5,8    y 4,05-8,925 plan d'évacuation, porte grise, extincteur, portes coupe-feu
//                                                         (photos 06 = r01, 19, 20, 04 ; plan V2, 11/10)
//   l'escalier                 x 0,75-4,45   y 9,075-13,2 quatre marches, palier à 0,70 devant le mur à affiches, la volée
//                                                         de 16 au-dessus de l'échiffre, le 1er au bout (photos 20, 06)
//   le couloir C05             x 4,6-5,8     y 12,0-18,6  deux portes de toilettes, au fond la porte bleue de la salle
//                                                         David Clark (photos 05, 23)
//   la salle d'attente         x 5,8-13,3    y 4,6-7,875  le mur safran, les chaises coque, l'écran (photos 02, 03, 21) ;
//                                                         au fond, la face ouest de la pile (11/10, plan V2 : DY_A ;
//                                                         12/10, r03 : 3,125 m nu à nu, le mur des jours a reculé)
//   le couloir C01             x 11,7-13,5   y 12,0-20,6  toilettes, gaine technique (photo 01)
//   l'antichambre, le passage  x 9,24-13,3   y 3,0-4,675   derrière le bout du mur sud de la salle d'attente, devant le mur
//   de la pile                                            nord du bureau de direction (porte de la Si 0.1, jour du
//                                                         bureau) ; il rejoint le hall au sud-ouest de la pile ; au
//                                                         bout, la porte vitrée du bureau (photos 01, 03, r02 ; 11/10)
//   la pile du hall            x 13,3-14,65  y 4,7-7,575  la plaque « iris », l'horloge, les annuaires (VO 6,4-12,4 s) :
//                                                         js/ecole_rdc_centre.js
//   le hall d'entrée, accueil  x 13,35-19,8  y 0,3-7,5    porte n° 6, le comptoir nord-sud et l'open-space, l'angle nord-est
//                                                         ouvert (photos 03, 16, 24 ; VO) : js/ecole_hall.js
//   le couloir est, l'escalier x 14,6-19,8   y 7,575-12,45 derrière la porte nord du hall : js/ecole_est.js (photos 24-29) ;
//                                                         l'ascenseur au bout du dégagement (js/ecole_ascenseur.js), la
//                                                         descente au -1 sous la volée 2 (js/ecole_soussol_est.js)
//   les pièces fermées         la Si 0.1 (l'ex-salle A), le bureau de direction, les toilettes (femmes et hommes par le
//                              C05, PMR par le C01), le local, le couloir de service, la salle David Clark Si 0.2 (au nord
//                              du C05, y 18,75-24,35) : leurs portes s'ouvrent, leur intérieur est imaginé (js/ecole_pieces.js)
//   le 1er étage (3,50 m)      js/ecole_etage1.js : l'espace pause orange, la salle de cours S 1.3, la salle Robert Kahn
//                              Si 1.4 (la vidéo officielle, js/ecole_etage1_pause.js, js/ecole_kahn.js), le palier est
//   le 2e étage (6,60 m)       js/ecole_etage2.js (la vidéo officielle) : le palier, le couloir rouge, deux salles
//   le sous-sol (-3,06 m)      js/ecole_soussol.js (la vidéo de Haythem) : derrière la porte grise du hall ouest, le palier
//                              « 0 », la volée de tôle, le hall du -1, le couloir, l'espace pause ; la grande salle
//                              S -1.14 (js/ecole_amphi.js) ; à l'est, le palier -1 et le sas (js/ecole_soussol_est.js)
import * as THREE from 'three';
import { Collisions } from './collisions.js';
import { carteLocale, poserSondeLocale, planifierOcclusionSol, optimiserDecor, nePasFusionner, animerVent, canvasTex } from './kit_decor.js';
import { materiauxEcole, texDAE, jourDehors, texAffiche, CADRE, CADRES, texFenetreCadre } from './ecole_matieres.js';
import { Portes, boiteM, maille, fenetreFacade, fenetreDepolie, fusionnerLocal, vitrophanies, poserCoupe } from './ecole_portes.js';
import { couperParZones, poserVisibilite } from './ecole_visibilite.js';
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
// (lot D : le mur des portes de l'escalier, de la ligne 13,675 à la ligne 9,0 — d'où la photo 23 relève le C05 : porte des femmes, retombée, porte des hommes, porte bleue)
const Y_ESC = 13.675 + DY_S;     // 9,0
// ---- l'escalier (photos 06, 20, 04) ----
// (la volée 1 est la plus large : par le vantail ouvert, côté ouest, on voit ses premières marches et son garde-corps,
// photo 20 — son bord intérieur passe donc à l'ouest du milieu de la porte)
// (plan V2 : toute la cage recule de DY_S — la première contremarche de 14,2 à 9,525 ; l'intérieur ne change pas)
// (Intégration du 11/10 : le mur est de la cage passe de la ligne 4,675 à la ligne 4,525, et la volée 1 s'arrête à son
// nu, x 4,45 — 1,43 m au lieu de 1,58. Sur la photo 23 rejouée à sa pose, l'arête du jambage est des portes de
// l'escalier est le nu ouest du C05 (x ≈ 4,50) : il n'y a pas de trumeau entre les portes et le C05 ; le trumeau de
// 0,30 m du jeu cachait la porte bleue — doute 1 de la relecture du lot D, variante pl_23_trumeau de son constructeur)
// (FINITIONS du 11/10, lot « escalier principal » — rapport_final_v2.md doute 2, doutes d'intégration 1 et 2 : le BAS de
// l'escalier refait sur les photos 20, 06 et r01 rejouées à leur pose ; le U de 2 x 10 n'y était pas. Le détail : plus bas,
// construireEscalier.) La volée 1, quatre contremarches vers le nord dans la porte ; le palier intermédiaire à 0,70 devant
// le mur à affiches ; la volée 2, seize contremarches vers le sud, à l'OUEST du mur d'échiffre (x 1,975) — l'ancien mur
// ouest de la cage, ligne 1,675, s'efface : la cage va du nu 0,75 au nu 4,45 ; le palier du 1er et sa double porte ne
// bougent pas.
const ESC = {
  haut: 0.175,
  x1o: 2.38, x1e: 4.45, y1: 9.84, G1: 0.30, n1: 4,      // la volée 1 : bord ouest, nu est, 1re contremarche, giron
  hL: 0.70, yFond: 13.2,                                // le palier intermédiaire et le nu de son mur du fond
  x2o: 0.75, x2e: 1.975, G2: 0.24, n2: 16, yT: 8.35,    // la volée 2 : nu ouest, nu de l'échiffre, giron, son arrivée
  yP1: 12.6 + DY_S, y0: 14.2 + DY_S, hP: 3.5,           // le palier du 1er : nu sud 7,925 (porte en 7,85), bord nord 9,525
};
ESC.yL1 = ESC.y1 + (ESC.n1 - 1) * ESC.G1;            // 10,74 : le bord du palier intermédiaire, au haut de la volée 1
ESC.yF2 = ESC.yT + (ESC.n2 - 1) * ESC.G2;            // 11,95 : le pied de la volée 2 (sa 1re contremarche)
// LE C05 REFAIT SUR LA PHOTO 23 (13/10, lot C2). Sa pose a été refaite SANS la focale supposée (1 500 px) : les deux
// points de fuite de la photo — les joints du carrelage, le pied et le haut du mur est d'un côté, les joints en travers,
// l'arête du plafond et le haut du mur du fond de l'autre — donnent f ≈ 1 620 ; les carreaux, comptés à 60 cm, 1 600 ;
// et à 1 600 l'affiche A4 de la porte des femmes fait 0,205 m de large (0,195 à 1 500). Douze points des portes et du
// mur du fond, onze croisements de joints : 5,6 px d'écart moyen, l'appareil en (4,41 ; 7,11) à 1,29 m, cap 23,4,
// piqué 5,5. Depuis le chant est du vantail fermé des portes de l'escalier, (4,45 ; 8,94) :
//  - le nu ouest du couloir est à 4,53 — le jambage n'a que 8 cm, un montant et un bout de mur (le jeu en mettait 15, et
//    ce pan blanc cachait la moitié de la porte bleue) ; le nu est à 5,92 : 1,39 m de large ;
//  - la porte des femmes : huisserie de 7,97 à 8,99 — elle touche le dos du mur safran ; celle des hommes de 10,47 à
//    11,49 : deux vantaux de 0,93 (0,85 au jeu), posés 6 cm EN RETRAIT du nu, l'ébrasement de l'huisserie vu en biais ;
//  - le mur du fond à 12,71 (12,60 au jeu), l'huisserie de la porte bleue de 4,70 à 5,61, sa traverse à 2,05, son
//    imposte de 2,10 à 2,36, la plaque de la salle en (5,76 ; 1,635) ;
//  - LE PLAFOND : ce n'est pas une retombée au fond du couloir. Le plafond BAS du hall (2,22 mesuré le long du mur est et
//    à l'about du mur des portes) entre de 0,65 m dans le couloir, jusqu'à une arête en y 9,57 ; au-delà le plafond est
//    PLUS HAUT, à 2,45 d'un bout à l'autre du mur est (cinq points à 1 px), et non plus bas — le jeu faisait l'inverse,
//    2,40 puis 2,30. (Le plafond bas reste ici à la hauteur du hall ouest, 2,30, pour ne pas faire de ressaut au seuil :
//    le hall est à un autre lot.) Les deux hublots : (5,34 ; 8,95) sous le plafond bas, (5,33 ; 11,44) sous le haut,
//    26 à 28 cm de diamètre (36 au jeu).
const C05 = { xO: 4.53, xE: 5.92, xM: 5.995, yFond: 12.71, yRes: 9.57, hBas: 2.3, hHaut: 2.45, lWC: 0.93, yF: 8.48, yH: 10.983 };
const PF = { x0: 4.70, x1: 5.612, hv: 2.05, hT: 2.40 };      // la porte bleue du fond : son huisserie, sa traverse, le haut du cadre
// LE C01 REFAIT SUR LA PHOTO 01 (13/10, lot C2). Pose refaite sur vingt-deux points relus de près — les deux huisseries du
// local, les quatre coins des portes de la gaine, le pied des deux murs, dix croisements de joints du carrelage —, la
// largeur du couloir laissée LIBRE : 4,8 px d'écart moyen, l'appareil à 1,42 m, cap 177,5, f 650. Ce qu'elle dit :
//  - LE COULOIR N'A QUE 1,60 m DE LARGE, pas 1,80 (13 px d'écart en l'y forçant ; et sans aucune pose : au pied de
//    l'huisserie du local, la largeur du couloir fait 0,73 fois la hauteur de cette huisserie — 1,52 à 1,60 m). Son mur
//    est est au nu de la face ouest de la pile, x 13,30 : le « ressaut de 20 cm » au nord de la pile n'existe pas ;
//  - LA PORTE DU LOCAL EST À L'ENTRÉE DU COULOIR, pas à 2,8 m : le mur ouest s'arrête 0,73 m après son huisserie — on
//    voit la salle d'attente, la fenêtre du bureau et le sol juste à gauche d'elle —, et la petite plaque noire est sur
//    ce bout de mur. Tout le couloir était 1,65 m trop au nord : le vantail du local (0,83, pas 0,93) de 8,58 à 9,41 ;
//    la gaine en face, de 8,31 à 9,78 ; la porte PMR de 10,80 à 11,73, sa plaque centrée en 10,65 ;
//  - LA GAINE n'est pas une porte de 2,00 m : deux vantaux de 0,735 posés AU-DESSUS DE LA PLINTHE, qui file devant
//    eux, de 0,08 à 1,73 m ; au-dessus, la grille (0,72 x 0,46, au milieu) et la trappe crème (0,36 x 0,34, au bout
//    nord), sous un plafond à 2,35 — et non 2,45 : son arête tombe en y 7,8-7,95, au droit du mur safran ;
//  - le hublot en (12,37 ; 9,21) ; les joints du carrelage en x 12,18 et 12,50, ceux en travers tous les 0,60 depuis
//    y 9,88.
const C01 = { xO: 11.7, xE: 13.3, xM: 13.375, yL: 8.995, lL: 0.83, yG: 9.045, lG: 1.47, yP: 11.265, lP: 0.93, hP: 2.35 };
// la lumière principale (l'ensemble des plafonniers) : presque d'aplomb, elle porte les ombres douces
const DIR_LUMIERE = new THREE.Vector3(0.16, 1, 0.22).normalize();
// le rectangle du sol (ombre cuite, lumière cuite) : x -0,6-20,4, y -0,6-25,0 (09/10 : jusqu'à 25 — la salle David
// Clark, derrière la porte bleue du C05, dépasse le fond du bâtiment de 20,75 jusqu'à 24,5)
const RECT = { x0: -0.6, x1: 20.4, y0: -0.6, y1: 25.0 };

// LA SALLE D'ATTENTE RECULE VERS LA RUE (11/10, plan V2 — scratchpad iris_audit/plan_v2.md § 1.1, § 2.1 et § 2.2 ; retours
// de Haythem du 10/10 : « trop compressé », « la porte n'est pas aussi loin ») : son mur sud est le mur nord du bureau de
// direction (ligne y 4,8), son bout est la face ouest de la pile ; tout ce qui est dedans suit d'un bloc (DY_A, plus haut :
// la même déclaration, mot pour mot, que celle du lot B : la fusion n'en garde qu'une)
const ATT = { ys: 9.0 + DY_A, yn: 12.075 + DY_A };        // les lignes du mur sud (4,8) et du mur safran (7,875)
// LA SALLE D'ATTENTE S'ÉLARGIT (retour de Haythem du 12/10, r03 — sa capture du jeu, vue vers l'ouest depuis le bout est :
// « c'est beaucoup mieux, mais cette partie est trop étroite : sur la photo, c'est plus grand et plus espacé ». Mesurée sur
// la photo 02, pose refaite SANS la largeur du jeu : focale 615, le point de fuite de la salle pris sur trois joints du
// carrelage — des carreaux de 60, comptés en travers : l'appareil à 1,40-1,48 —, la porte grise du hall ouest (2,04),
// l'angle de la pile du plan d'évacuation, le bout ouest du mur sud et celui du mur jaune, les cadres des jours, la plinthe
// du mur sud, l'arête haute du mur jaune ; le plafond se cale de lui-même à 2,60 — la retombée du hall, à 4,85, vue sous
// 37 px, le confirme : 2,64-2,68. Nu à nu : 3,11 à 3,18 m (± 0,05) selon les observations gardées, l'appareil en
// (10,80 ; 6,99), h 1,50, cap −95,4 ; on ne retombe sur 2,83-2,95 qu'en forçant les chaises coque du nord contre le mur
// ou le pilier gris à sa place de la v1.7 — et les écarts doublent (5 à 7,5 px). Le jeu en avait 2,925, l'appareil de la
// relecture r02 à 0,46 m du mur jaune quand la photo l'y met à 0,8.) Le mur jaune ne bouge pas — le C05, les
// toilettes et la cage, calés sur les photos 04, 05 et 23, sont derrière lui — : c'est LE MUR DES JOURS qui recule de
// 0,20 m vers la rue, avec tout ce qu'il porte ; la Si 0.1, imaginée, perd 0,20 m de profondeur. Nu à nu : 3,125.
const DY_R03 = -0.20;
ATT.ys += DY_R03;                                          // le mur sud sur la ligne 4,6, son nu nord en 4,675

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
    if (mur) {
      maille(new THREE.CylinderGeometry(r, r * 0.92, 0.07, 36), M.opale, 0, -0.035, 0, 0, g, { ombre: false, recoit: false });
      maille(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.012, 36), M.couronne, 0, -0.006, 0, 0, g, { ombre: false, recoit: false });
    } else {
      // (13/10, lot C2 — les hublots des photos 23, 01 et 05, vus de près : ce n'est pas une galette blanche de 7 cm
      // d'épais, mais un VERRE opale bombé, peu saillant — 5 cm —, serti dans un cercle de métal satiné large de deux
      // doigts, tenu par trois griffes ; `r` : le rayon du cercle)
      // (le cercle : éclairé par son propre verre, il sort clair sur les photos — un gris perle qui luit un peu)
      if (!M.cercleHublot) { M.cercleHublot = new THREE.MeshStandardMaterial({ color: 0xdcdcd6, roughness: 0.4, metalness: 0.15, emissive: 0xfff0dc, emissiveIntensity: 0.55 }); M.cercleHublot.name = 'cercle de hublot'; }
      const rv = r * 0.88, f = 0.05, Rs = (rv * rv + f * f) / (2 * f), al = Math.asin(rv / Rs);
      maille(new THREE.SphereGeometry(Rs, 32, 6, 0, Math.PI * 2, Math.PI - al, al), M.opale, 0, Rs - f - 0.012, 0, 0, g, { ombre: false, recoit: false });
      maille(new THREE.CylinderGeometry(r, r * 0.96, 0.018, 36), M.cercleHublot, 0, -0.009, 0, 0, g, { ombre: false });
      for (let k = 0; k < 3; k++) {
        const a = Math.PI / 2 + k * Math.PI * 2 / 3;
        maille(boiteM(0.012, 0.008, 0.03), M.inox, Math.cos(a) * rv, -0.02, Math.sin(a) * rv, -a + Math.PI / 2, g, { ombre: false });
      }
    }
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
  // `simple` : une seule face verte, le dos est le boîtier (relecture du 11/10 : celui du passage, côté rue — photo 10)
  sortie(x, y, h, face, { suspendu = false, simple = false } = {}) {
    const M = this.M, g = new THREE.Group(); g.position.set(x, h, -y);
    g.rotation.y = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[face];
    maille(boiteM(0.36, 0.13, 0.05), M.boitier, 0, 0, 0, 0, g, { ombre: false });
    for (const z of simple ? [0.026] : [0.026, -0.026]) {
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
//  L'ESCALIER (photos 20, 06 = r01, 04)
// =====================================================================
// Un escalier de béton en U à volées inégales, marches gris anthracite à nez sombre, contremarches anthracite, limons et
// échiffre blanc cassé, garde-corps d'acier gris à barreaux ; pour le joueur, chaque volée est une RAMPE passant par le
// milieu des marches (js/collisions.js rampe).
// (FINITIONS du 11/10, lot « escalier principal » : rapport_final_v2.md doute 2, doutes d'intégration 1 et 2. Le jeu avait
// un U de 2 x 10, palier à 1,75 : vu du hall, par le vantail ouvert, le flanc de la volée 1 et le vide sous la volée 2.
// Les photos 20 (redressée, iris_audit/p20_rot.jpg), 06 et r01, rejouées à leur pose — photo 20 : (3,47 ; 6,48), appareil
// à 1,30, cap -7,1, f 600, point principal au rang 801, calé sur le vantail fermé ; r01 : (5,01 ; 5,92), 1,62, cap -83,4,
// f 540 —, montent toutes la même chose :)
//  - LA VOLÉE 1 part tout de suite : trois marches, quatre contremarches de 0,175 — sur la photo 20, quatre lignes claires
//    de nez (rangs 1 000, 955, 918, 885), la dernière au bord du palier, puis le sol du palier, sans 5e contremarche ;
//    girons de 0,30, 1re contremarche en y 9,84, à 0,84 m de la porte — vers le nord, de la moitié ouest de la porte
//    jusqu'au mur est (par la fente du vantail fermé, ses marches encore) ; au pied, côté ouest, le POTEAU à platine du
//    garde-corps (r01 : sa platine en (2,2-2,3 ; 10,0-10,2) ; photo 20 : (2,42 ; 9,88)) ;
//  - LE PALIER INTERMÉDIAIRE à 0,70 (« un palier vers 0,7-0,9 »), devant LE MUR À AFFICHES : sa plinthe au rang 843, la
//    main courante horizontale au rang 752, une A4 violette, un écusson vert, une affiche A2, un grand panneau blanc — à
//    6,5-7 m de l'appareil : son nu en y 13,2 (le nu nord de la cage était en 13,925 : les affiches y montaient à 3 m).
//    (La photo floue ne se raccorde pas d'un bloc : à 1,30 et f 600, les nez donnent bien des girons de 0,30, mais la
//    plinthe et la main courante voudraient un palier à 0,85 ou un mur à 8 m. Gardé : le compte des marches ; le mur est
//    à 11-13 px de sa plinthe et de sa main courante) ;
//  - LE GARDE-CORPS de la volée 1 qui, au palier, TOURNE VERS L'OUEST et repart en montant VERS LE SUD (photo 20, le
//    « Z » de la main courante sombre) : c'est LA VOLÉE 2, à l'ouest, au-dessus d'un MUR D'ÉCHIFFRE blanc à plinthe de bois
//    (nu est x 1,97 : r01, sa plinthe en (1,9-2,05 ; 9,7-10,0) ; photo 20, en (1,98 ; 10,27)), barreaux gris, lisse basse et
//    main courante sombres ; ses marches se lisent de profil au-dessus de l'échiffre (r01, 06 : la crémaillère blanche).
// L'ancien mur ouest de la cage (ligne 1,675) passait là où l'échiffre laisse voir la volée 2 : elle est à l'ouest de lui,
// sur la « réserve ouest » imaginée et au-dessus de la trémie de la volée de tôle du -1 (son rampant reste dessous). La
// cage va donc du nu 0,75 au nu 4,45, de la porte au mur à affiches.
// COMPROMIS (doute) : sur r01 et la photo 20, la volée 2 est douce (pente ≈ 0,5 : lisse à ≈ 1,07 en y 11,1, ≈ 1,86 en
// y 9,6) et arriverait au 1er vers y 6,5-7 ; on garde l'ARRIVÉE du jeu — le palier du 1er au nord du hall et sa double
// porte en y 7,85 (consigne du lot) : 16 contremarches sur des girons de 0,24 (2h + g = 0,59), son pied en y 11,95, sa
// dernière contremarche en y 8,35. Vue du hall, sa main courante tombe juste en y 11,6 (photo 20) mais passe 0,45 m
// plus haut en y 10,4 ; sa lisse basse, 0,5 m plus haut en y 11,1 (r01) et 0,8 m en y 9,6, où le linteau la cache déjà
// (photo 04 : par la porte, on ne voit plus que l'échiffre, sans les barreaux). Tout le reste tombe à sa place.
// (Pour la rendre juste, il faudrait la prolonger au sud, au-dessus du plafond du hall, jusqu'au 1er vers y 6,5-7 : c'est
// déplacer l'arrivée — le palier du 1er et sa double porte, imaginés — décision laissée à Haythem.)
// (relecture du 11/10, r01 et la photo 20 rejouées à leur pose : la vraie pente, 0,53, donne des girons de ≈ 0,33 pour
// des contremarches de 0,175 et un pied vers y 11,3 ; seize contremarches arrivent alors au 1er vers y 6,3-7,0, entre
// x 0,75 et 1,975 — dans le couloir sombre du 1er, imaginé, au-dessus du renfoncement de la porte grise. Aucune pente
// praticable ne passe par les photos ET par l'arrivée en y 8,35 : il faudrait 1,4 de pente. En haut de la volée 2, la
// plate-forme d'arrivée n'a que 0,43 m : la caméra s'y colle à Haythem ; avec la caméra du lot X1 (au-dessus de l'épaule,
// js/game.js), essayée ensemble, elle reste à 0,8 m.)
// (plan V2 § 1.3 : l'escalier S'ARRÊTE AU 1er ; plafond de la cage à 6,40, le dessous de la dalle du 2e : js/ecole_etage1.js)
function construireEscalier(ch) {
  const { C, M } = ch, E = ESC, R = E.haut, G1 = E.G1, G2 = E.G2, HL = E.hL, HP = E.hP;
  const extru = (pts, prof, mat, x, z, rotY) => {
    const sh = new THREE.Shape(); pts.forEach(([s, h], i) => (i ? sh.lineTo(s, h) : sh.moveTo(s, h)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: prof, bevelEnabled: false });
    return maille(geo, mat, x, 0, z, rotY, ch.decor);
  };
  // les lignes des nez (la hauteur du nez au droit de y) : volée 1, vers le nord ; volée 2, vers le sud
  const nez1 = (y) => R + (y - E.y1) * R / G1;
  const nez2 = (y) => HL + R + (E.yF2 - y) * R / G2;
  const sous2 = (y) => HL - 0.2 + (E.yF2 - y) * R / G2;          // la sous-face de la paillasse de la volée 2
  const yPorte = Y_ESC + 0.075;                                   // le nu nord du mur des portes
  // ---- LA VOLÉE 1 (est), pleine jusqu'au sol : trois marches ; sa 4e contremarche est le front du palier ----
  const p1 = [[0, 0], [0, R]];
  for (let i = 1; i < E.n1 - 1; i++) p1.push([i * G1, i * R], [i * G1, (i + 1) * R]);
  p1.push([(E.n1 - 1) * G1, (E.n1 - 1) * R], [(E.n1 - 1) * G1, 0]);
  extru(p1, E.x1e - E.x1o, M.beton, E.x1o, -E.y1, Math.PI / 2);
  // ---- LE PALIER INTERMÉDIAIRE (0,70), plein : devant la volée 1 et, à l'ouest, au pied de la volée 2 ----
  for (const [xa, xb, ya] of [[E.x1o, E.x1e, E.yL1], [E.x2o, E.x1o, E.yF2]]) {
    ch.boite(xa, ya, xb, E.yFond, 0, HL - 0.02, M.beton);
    ch.boite(xa, ya, xb, E.yFond, HL - 0.02, HL, M.solEtage);
  }
  // ---- LA VOLÉE 2 (ouest) : une dalle à paillasse qui part du palier vers le sud, jusqu'au palier du 1er ----
  const p2 = [[0, HL - 0.2], [0, HL + R]];
  for (let k = 1; k < E.n2; k++) p2.push([k * G2, HL + k * R], [k * G2, HL + (k + 1) * R]);
  p2.push([(E.n2 - 1) * G2, sous2(E.yT)]);
  extru(p2, E.x2e - E.x2o, M.beton, E.x2e, -E.yF2, -Math.PI / 2);
  // ---- LES MARCHES (dessus gris, nez sombre) et les contremarches anthracite (un parement de 6 mm côté de qui monte) ----
  for (let i = 1; i < E.n1; i++) {
    const h = i * R, ya = E.y1 + (i - 1) * G1;
    ch.boite(E.x1o, ya, E.x1e, ya + G1, h, h + 0.012, M.marche);
    ch.boite(E.x1o, ya, E.x1e, ya + 0.04, h + 0.012, h + 0.016, M.nez, { ombre: false });
  }
  ch.boite(E.x1o, E.yL1, E.x1e, E.yL1 + 0.04, HL, HL + 0.004, M.nez, { ombre: false });
  for (let i = 0; i < E.n1; i++) { const ya = E.y1 + i * G1; ch.boite(E.x1o, ya - 0.006, E.x1e, ya, i * R, (i + 1) * R, M.contremarche, { ombre: false }); }
  for (let k = 1; k < E.n2; k++) {
    const h = HL + k * R, yb = E.yF2 - (k - 1) * G2;
    ch.boite(E.x2o, yb - G2, E.x2e, yb, h, h + 0.012, M.marche);
    ch.boite(E.x2o, yb - 0.04, E.x2e, yb, h + 0.012, h + 0.016, M.nez, { ombre: false });
  }
  for (let k = 1; k <= E.n2; k++) { const yb = E.yF2 - (k - 1) * G2; ch.boite(E.x2o, yb, E.x2e, yb + 0.006, HL + (k - 1) * R, HL + k * R, M.contremarche, { ombre: false }); }
  // (les bords du palier intermédiaire sur le jour : le front, au pied de la volée 2, et le flanc, au haut de la volée 1)
  ch.boite(E.x2e, E.yF2, E.x1o, E.yF2 + 0.04, HL, HL + 0.004, M.nez, { ombre: false });
  ch.boite(E.x1o, E.yL1, E.x1o + 0.04, E.yF2, HL, HL + 0.004, M.nez, { ombre: false });
  // ---- LE MUR D'ÉCHIFFRE sous le bord est de la volée 2 (r01, 06, 20 : blanc, plinthe de bois) : du mur des portes au
  // palier, x 1,85-1,975, son dessus sous la paillasse — au-dessus, le flanc de la volée et ses marches de profil ----
  extru([[0, 0], [0, sous2(E.yF2)], [E.yF2 - yPorte, sous2(yPorte)], [E.yF2 - yPorte, 0]], 0.125, M.blanc, E.x2e, -E.yF2, -Math.PI / 2);
  ch.boite(E.x2e, yPorte, E.x2e + 0.015, E.yF2, 0, 0.08, M.bois, { ombre: false });
  // (et le JOUR entre l'échiffre et la volée 1, x 1,975-2,38 : son fond, le front du palier, a sa plinthe)
  ch.boite(E.x2e, E.yF2 - 0.015, E.x1o, E.yF2, 0, 0.08, M.bois, { ombre: false });
  // ---- LE PALIER DU 1er ÉTAGE (dalle au nord du hall ouest, devant sa double porte, y 7,85 : au-dessus du plafond du hall
  // à 2,30) : tout du long jusqu'en y 8,35, l'arrivée de la volée 2 ; au nord, à l'est de l'échiffre, jusqu'en y 9,525 ----
  ch.boite(0.6, E.yP1 - 0.15, 4.75, E.yT, H_DALLE, HP - 0.02, M.beton);
  ch.boite(E.x2e, E.yT, 4.75, E.y0, H_DALLE, HP - 0.02, M.beton);
  ch.boite(E.x2o, E.yP1, E.x1e, E.yT, HP - 0.02, HP, M.solEtage);
  ch.boite(E.x2e, E.yT, E.x1e, E.y0, HP - 0.02, HP, M.solEtage);
  ch.boite(E.x2e, E.y0 - 0.04, E.x1e, E.y0, HP, HP + 0.004, M.nez, { ombre: false });
  ch.boite(E.x2o, E.yT - 0.04, E.x2e, E.yT, HP, HP + 0.004, M.nez, { ombre: false });
  // (au-dessus, plus rien : l'escalier s'arrête au 1er, plan V2 § 1.3)

  // ---- LES GARDE-CORPS ----
  // (relecture du 11/10 : vus par la porte, de r01 et de la photo 20, les garde-corps posaient un MOUCHETÉ gris sale sur
  // l'échiffre et le mur blanc derrière eux — l'occlusion ambiante de l'écran (js/fx.js, GTAO, en haute qualité) prend
  // les barreaux de 14 mm et les poteaux de 5 cm, à 0,4 m du mur, pour un recoin. Ils vont dans un groupe à part, cousu
  // sur lui-même et marqué `sansNormales` : la passe de normales de l'occlusion ne les dessine plus, comme les filets des
  // paniers. Les barreaux ne portent pas non plus d'ombre : trop fins pour une carte d'ombre au centimètre.)
  const GC = new THREE.Group(); GC.name = 'garde-corps (escalier principal)'; ch.decor.add(GC);
  const barre = (x, y, h0, h1) => ch.boite(x - 0.007, y - 0.007, x + 0.007, y + 0.007, h0, h1, M.garde, { ombre: false, parent: GC });
  const poteau = (x, y, h0, h1, mat = M.garde) => ch.boite(x - 0.025, y - 0.025, x + 0.025, y + 0.025, h0, h1, mat, { parent: GC });
  // une lisse plate le long de y (x fixe), du bas (ya, ha) au haut (yb, hb) — ou d'un bout à l'autre, de niveau
  const lisse = (x, ya, ha, yb, hb, mat = M.garde, l = 0.05, e = 0.014) => {
    const L = Math.hypot(yb - ya, hb - ha), m = maille(boiteM(l, e, L), mat, x, (ha + hb) / 2, -(ya + yb) / 2, 0, GC);
    m.rotation.x = Math.atan2(hb - ha, yb - ya);
    return m;
  };
  // la volée 2 : lisse basse et main courante d'un brun très sombre (r01, 06 : sombres sur les barreaux gris ; photo 20)
  const SOMBRE = new THREE.MeshStandardMaterial({ color: 0x3b3430, roughness: 0.45, metalness: 0.25 });
  SOMBRE.name = 'main courante sombre (escalier principal)';
  // LA VOLÉE 1, bord ouest (x 2,40) : le poteau du pied, posé au sol sur sa platine devant la 1re contremarche (r01, 20),
  // lisse basse au ras des nez, main courante à 1,0 m ; puis, au palier, de niveau jusqu'au pied de la volée 2, et le
  // RETOUR VERS L'OUEST jusqu'à l'échiffre (photo 20)
  const xg1 = E.x1o + 0.02, yPied = E.y1 - 0.06, H1 = 1.0, yRet = E.yF2 + 0.025;
  ch.boite(xg1 - 0.06, yPied - 0.06, xg1 + 0.06, yPied + 0.06, 0, 0.01, M.garde, { parent: GC });
  poteau(xg1, yPied, 0.01, nez1(yPied) + H1 + 0.02);
  lisse(xg1, yPied, nez1(yPied) + H1, E.yL1, HL + H1);
  lisse(xg1, E.y1, nez1(E.y1) + 0.06, E.yL1, HL + 0.06, M.garde, 0.04, 0.012);
  lisse(xg1, E.yL1, HL + H1, yRet, HL + H1);
  lisse(xg1, E.yL1, HL + 0.06, yRet, HL + 0.06, M.garde, 0.04, 0.012);
  for (let y = E.y1 + 0.05; y < yRet - 0.04; y += 0.11) barre(xg1, y, y < E.yL1 ? nez1(y) + 0.06 : HL + 0.06, y < E.yL1 ? nez1(y) + H1 : HL + H1);
  poteau(xg1, yRet, HL, HL + H1 + 0.02);
  // le retour (y 11,975, sur le bord du palier), de x 2,40 à l'échiffre
  ch.boite(E.x2e, yRet - 0.02, xg1, yRet + 0.02, HL + H1 - 0.007, HL + H1 + 0.007, M.garde, { parent: GC });
  ch.boite(E.x2e, yRet - 0.015, xg1, yRet + 0.015, HL + 0.054, HL + 0.066, M.garde, { parent: GC });
  for (let x = E.x2e + 0.08; x < xg1 - 0.04; x += 0.11) barre(x, yRet, HL, HL + H1);
  // LA VOLÉE 2, fixé de côté contre son limon (x 1,995) : lisse basse sombre 10 cm au-dessus des nez (r01 : la crémaillère
  // se lit dessous),
  // main courante sombre à 0,95, barreaux gris ; au droit du palier du 1er (y < 9,525), les barreaux montent à 4,47 sous
  // une lisse de niveau : le garde-corps du palier, au-dessus des dernières marches
  const xg2 = E.x2e + 0.02, yH2 = E.yT + 0.4, H2 = 0.95;
  lisse(xg2, E.yF2, nez2(E.yF2) + 0.1, yH2, nez2(yH2) + 0.1, SOMBRE, 0.045, 0.03);
  lisse(xg2, E.yF2, nez2(E.yF2) + H2, yH2, nez2(yH2) + H2, SOMBRE, 0.05, 0.035);
  for (let y = E.yF2 - 0.06; y > yH2 + 0.03; y -= 0.115) barre(xg2, y, nez2(y) + 0.1, y < E.y0 ? HP + 0.97 : nez2(y) + H2);
  // ses poteaux, gris foncé, fixés de côté sur le limon par une platine carrée (r01, 06, 04 : le montant sombre qui
  // descend jusqu'à sa platine, au-dessus de l'échiffre)
  for (const y of [E.yF2 - 0.04, 10.95, 9.75]) {
    ch.boite(xg2 - 0.02, y - 0.02, xg2 + 0.02, y + 0.02, sous2(y) + 0.1, nez2(y) + H2, SOMBRE, { parent: GC });
    ch.boite(E.x2e, y - 0.06, E.x2e + 0.012, y + 0.06, sous2(y) + 0.08, sous2(y) + 0.2, M.garde, { ombre: false, parent: GC });
  }
  poteau(xg2, yH2, nez2(yH2) - 0.2, HP + 1.0);
  lisse(xg2, yH2, HP + 0.97, E.y0, HP + 0.97);
  // LE PALIER DU 1er, au-dessus du vide (bord nord, y 9,525, de l'échiffre au mur est) : barreaux, lisse, poteaux
  for (let x = E.x2e + 0.08; x < E.x1e - 0.05; x += 0.11) barre(x, E.y0 - 0.03, HP, HP + 0.95);
  ch.boite(E.x2e - 0.05, E.y0 - 0.055, E.x1e, E.y0 - 0.005, HP + 0.95, HP + 0.99, M.garde, { parent: GC });
  poteau(E.x1e - 0.03, E.y0 - 0.03, HP, HP + 0.99); poteau(xg2, E.y0 - 0.03, HP - 0.3, HP + 0.99);
  // (le groupe des garde-corps cousu par matière, gardé hors de la couture du décor, hors de la passe de normales)
  fusionnerLocal(GC); nePasFusionner(GC);
  GC.traverse((o) => { if (o.isMesh) o.userData.sansNormales = true; });
  // LES MAINS COURANTES RONDES AU MUR (supports tous les 80 cm) : le long des volées, et la main courante HORIZONTALE du
  // palier, sur le mur à affiches (photo 20 : de bout en bout, à 1,0 au-dessus du palier — comme celles des murs du palier)
  const tubeY = (x, ya, ha, yb, hb, s) => {
    const L = Math.hypot(yb - ya, hb - ha), t = maille(new THREE.CylinderGeometry(0.02, 0.02, L, 10), M.garde, x, (ha + hb) / 2, -(ya + yb) / 2, 0, ch.decor);
    t.rotation.x = -Math.atan2(yb - ya, hb - ha);
    const n = Math.max(1, Math.round(L / 0.8));
    for (let k = 0; k < n; k++) { const f = (k + 0.5) / n; ch.boite(Math.min(x, x + s * 0.06), ya + (yb - ya) * f - 0.01, Math.max(x, x + s * 0.06), ya + (yb - ya) * f + 0.01, ha + (hb - ha) * f - 0.08, ha + (hb - ha) * f - 0.02, M.garde, { ombre: false }); }
  };
  const hMC = HL + 1.0, xa = E.x2o + 0.06, xb = E.x1e - 0.06;
  tubeY(E.x1e - 0.06, E.y1, R + 1.0, E.yL1, hMC, 1);
  tubeY(E.x1e - 0.06, E.yL1, hMC, E.yFond - 0.06, hMC, 1);
  tubeY(E.x2o + 0.06, E.yT, HP + 0.9, E.yF2, nez2(E.yF2) + 0.9, -1);
  tubeY(E.x2o + 0.06, E.yF2, hMC, E.yFond - 0.06, hMC, -1);
  const mc = maille(new THREE.CylinderGeometry(0.02, 0.02, xb - xa, 10), M.garde, (xa + xb) / 2, hMC, -(E.yFond - 0.06), 0, ch.decor);
  mc.rotation.z = Math.PI / 2;
  for (let x = xa + 0.4; x < xb - 0.1; x += 0.8) ch.boite(x - 0.01, E.yFond - 0.06, x + 0.01, E.yFond, hMC - 0.08, hMC - 0.02, M.garde, { ombre: false });
  // ---- LE MUR À AFFICHES (photo 20, rejouée : les rangs et colonnes de chaque affiche reportés sur le nu y 13,2) : une A4
  // violette, un écusson vert sombre, une affiche A2 claire à dessins mauves, un grand panneau blanc à bandeau ----
  for (const [x, l, h, hc, tex] of [
    [1.48, 0.21, 0.297, 2.55, texAffiche('#5b1f4a', '#6e2a5a', 3)],
    [1.81, 0.21, 0.25, 2.56, texAffiche('#1d3a2a', '#24312a', 5)],
    [2.21, 0.5, 0.7, 2.555, texAffiche('#7466b0', '#f2f1ee', 7)],
    [3.095, 1.25, 0.5, 2.46, texAffiche('#8a3a62', '#f4f3ef', 11)],
  ]) ch.panneau(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), l, h, x, E.yFond - 0.003, hc, 'S');
  // les plinthes de bois au ras du palier (le long des murs du fond, ouest et est)
  ch.boite(E.x2o, E.yFond - 0.015, E.x1e, E.yFond, HL, HL + 0.08, M.bois, { ombre: false });
  ch.boite(E.x2o, E.yF2, E.x2o + 0.015, E.yFond, HL, HL + 0.08, M.bois, { ombre: false });
  ch.boite(E.x1e - 0.015, E.yL1, E.x1e, E.yFond, HL, HL + 0.08, M.bois, { ombre: false });

  // ---- LE MONDE SOLIDE ----
  // la volée 1 et le palier intermédiaire ; la volée 2 ; le palier du 1er (son arrivée, et son bord nord)
  C.rampe(E.x1o, -(E.yL1 + G1 / 2), E.x1e, -(E.y1 - G1 / 2), 'z', -(E.y1 - G1 / 2), 0, -(E.yL1 + G1 / 2), HL);
  C.sol(E.x1o, -E.yFond, E.x1e, -E.yL1, HL);
  C.sol(E.x2o, -E.yFond, E.x1o, -E.yF2, HL);
  C.rampe(E.x2o, -(E.yF2 + G2 / 2), E.x2e, -(E.yT - G2 / 2), 'z', -(E.yF2 + G2 / 2), HL, -(E.yT - G2 / 2), HP);
  C.sol(E.x2o, -E.yT, E.x1e, -E.yP1, HP);
  C.sol(E.x2e, -E.y0, E.x1e, -E.yT, HP);
  // le bord est de la volée 2 (échiffre, garde-corps), à toutes les hauteurs ; il s'arrête à 0,40 m de l'arrivée : entre
  // lui et le mur de la double porte, on passe de la volée au palier
  C.ajouterBoite(1.85, -yH2, 2.0, -E.yF2, { y0: 0, y1: 5.2 });
  // le jour (x 2,0-2,38), du mur des portes au palier : sous le palier du 1er, jusqu'à sa dalle ; au nord, à toutes hauteurs
  // (pour le joueur seul : la caméra y voit d'une volée à l'autre)
  C.ajouterBoite(2.0, -yPorte, E.x1o, -E.y0, { y0: 0, y1: H_DALLE, camera: false });
  C.ajouterBoite(2.0, -E.y0, E.x1o, -E.yF2, { y0: 0, y1: 5.2, camera: false });
  C.ajouterCercle(xg1, -yPied, 0.04, { y0: 0, y1: 1.2 });
  // le garde-corps du palier du 1er, au-dessus du vide
  C.ajouterBoite(E.x2e, -(E.y0 - 0.06), E.x1e, -E.y0, { y0: HP, y1: HP + 1.1 });
  // la caméra ne passe pas dans les volées ni sous le palier intermédiaire ; sous la volée 2, au-dessus de la trémie du -1
  // (y < 10,3), à partir de 1,55 — dessous, les plafonds de caméra du rampant de la volée de tôle, js/ecole_soussol.js
  for (let i = 1; i < E.n1; i++) { const ya = E.y1 + (i - 1) * G1; C.ajouterBoite(E.x1o, -ya, E.x1e, -(ya + G1), { y0: 0, y1: i * R, joueur: false }); }
  C.ajouterBoite(E.x1o, -E.yL1, E.x1e, -E.yFond, { y0: 0, y1: HL, joueur: false });
  C.ajouterBoite(E.x2o, -E.yF2, E.x1o, -E.yFond, { y0: 0, y1: HL, joueur: false });
  for (let k = 1; k < E.n2; k++) {
    const yb = E.yF2 - (k - 1) * G2;
    C.ajouterBoite(E.x2o, -(yb - G2), E.x2e, -yb, { y0: yb < 10.3 ? 1.55 : 0, y1: HL + k * R, joueur: false });
  }
  // les plafonds : sous la dalle du palier du 1er (pour qui est au pied, derrière les portes), puis celui de la cage au
  // droit du palier (le dessous de la dalle du 2e ; au-dessus des volées, le même : js/ecole_etage1.js)
  C.plafond(E.x2e, -E.y0, E.x1e, -(Y_ESC - 0.075), H_DALLE);
  ch.plafond(E.x2o, E.yP1, E.x1e, E.y0, H_CAGE, 'platre', { retombees: false });
}

// =====================================================================
//  LA FAÇADE (photos 10 à 18)
// =====================================================================
// Douze travées de 1,65 m. Au rez-de-chaussée, d'ouest en est : la porte de secours noire sous sa ventilation, le
// passage des étudiants (grille noire ouverte), trois grandes fenêtres à barreaux (salle A), deux fenêtres hautes
// (bureau B), le portail noir de l'entrée n° 6 en retrait (drapeaux, numéro), deux grandes fenêtres (accueil). Au-dessus,
// quatre étages de pierre claire à une fenêtre par travée, quelques encadrements rouges en saillie, puis le 5e étage, son
// bandeau vitré noir sous la toiture plate (lot façade du 11/10 : plus d'attique en retrait).
const BAIES_HAUTES = [5.78, 7.43, 9.08, 17.33, 18.98];      // fenêtres de 1,2 m, allège 1,10, linteau 2,75
const BAIES_BUREAU = [10.73, 12.38];                       // allège 1,75
// (lot façade du 11/10 : les photos 12 et 17 redressées sur les fenêtres du 1er — 1,3 px d'écart sur la 17 — mettent le
// haut des baies du rez-de-chaussée à 2,73-2,76, au niveau du haut du linteau du passage et de la ventilation de la
// porte de secours, photo 10 : 2,75 et non 2,50. Dedans, le faux plafond à 2,60 en cache le haut — photo 03 : les baies
// de l'accueil montent jusqu'à lui)
const H_BAIE = 2.75;
// (et leur appui à 1,07-1,15 au-dessus du trottoir, photo 17 redressée : 1,10 et non 0,95)
const BAS_BAIE = 1.1;
const PORTAIL = { c: 14.86, l: 2.88, h: 2.78 };            // le portail n° 6 : x 13,42-16,30 (lot façade, photos 16, 17)
function construireFacade(ch) {
  const { M } = ch;
  // le mur de façade du rez-de-chaussée (40 cm : enduit blanc dedans, pierre dehors)
  ch.mur({
    de: [-0.3, -0.2], a: [20.1, -0.2], ep: 0.4, h: H_RDC, mats: { N: M.blanc, S: M.pierre }, plinthes: ['N'],
    ouvertures: [
      { c: 0.8, l: 1.0, h: 2.2 },                              // porte de secours (travée 1)
      // le passage des étudiants : 2,25 m, x 2,175-4,425, centré sur la limite des travées 2 et 3 (plan V2 ; photo 10, sur
      // l'échelle des travées de 1,65 m — le jeu avait deux travées, 3,3 m) ; à l'est, le mur du passage fait le tableau,
      // à l'ouest, un trumeau de 0,43 m (le passage, derrière, part de x 1,75 : construireMurs)
      { c: 3.3, l: 2.25, h: 2.45 },
      ...BAIES_HAUTES.map((c) => ({ c, l: 1.2, bas: BAS_BAIE, h: H_BAIE })),
      ...BAIES_BUREAU.map((c) => ({ c, l: 1.2, bas: 1.75, h: H_BAIE })),
      // le portail de l'entrée n° 6 (tableaux noirs, sous-face noire). (Lot façade du 11/10, photos 16 et 17 redressées sur
      // les fenêtres du 1er — iris_vues/X4_* — : ses tableaux tombent à l'aplomb des bords extérieurs des fenêtres des
      // travées 9 et 10, x 13,42-16,30, 2,88 m et non 3,45 ; son linteau est à 2,75-2,78, au niveau des baies — l'écusson
      // pointe dessus.)
      { c: PORTAIL.c, l: PORTAIL.l, h: PORTAIL.h },
    ],
  });
  // les fenêtres (repère du mur : +z vers l'intérieur = le nord du plan, donc tourné de PI)
  const fac = new THREE.Group(); fac.position.set(0, 0, 0.2); fac.rotation.y = Math.PI; ch.decor.add(fac);
  // (dans ce groupe tourné, x local = -x du plan : on passe -x)
  // (10/10 : plus de stores à lames aux deux baies de l'accueil — VO q_0373-0383 et photo 03 recadrée : le jour et les
  // barreaux s'y voient, aucune lame ; les bandes claires de la photo 03 sont les barreaux sur le ciel)
  // (relecture du lot façade, 11/10 — photos 10, 17 de près : les baies sont dans un épais cadre sombre au nu de la pierre,
  // la bavette noire ; pas de tableau clair : `habillage`)
  for (const c of BAIES_HAUTES) fenetreFacade(fac, M, { x: -c, l: 1.2, bas: BAS_BAIE, haut: H_BAIE, habillage: true });
  for (const c of BAIES_BUREAU) fenetreFacade(fac, M, { x: -c, l: 1.2, bas: 1.75, haut: H_BAIE, imposte: false, habillage: true });
  // LE REFLET DE LA RUE dans les baies (lot façade du 11/10 : sur les photos 10, 16 à 18, derrière les barreaux, les vitres
  // sont sombres — la rue s'y reflète, on devine à peine la pièce ; le jeu les montrait claires, la salle éclairée derrière) :
  // une face sombre et brillante, tournée vers la rue seulement (de la salle, elle n'existe pas)
  const vitreRdc = new THREE.MeshStandardMaterial({ color: 0x2e353c, roughness: 0.12, metalness: 0.25, transparent: true, opacity: 0.82, depthWrite: false, envMapIntensity: 0.8 });
  vitreRdc.name = 'vitre du rez-de-chaussée vue de la rue';
  for (const [c, bas] of [...BAIES_HAUTES.map((c) => [c, BAS_BAIE]), ...BAIES_BUREAU.map((c) => [c, 1.75])]) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(1.1, H_BAIE - bas - 0.1), vitreRdc);
    r.position.set(c, (bas + H_BAIE) / 2, 0.158); r.castShadow = false; ch.decor.add(r);
  }
  // (les vitres arrêtent la caméra ; la lumière du jour, elle, passe : `vitre`)
  for (const c of BAIES_HAUTES) ch.C.ajouterBoite(c - 0.6, 0.4, c + 0.6, 0, { y0: BAS_BAIE, y1: H_BAIE, vitre: true });
  for (const c of BAIES_BUREAU) ch.C.ajouterBoite(c - 0.6, 0.4, c + 0.6, 0, { y0: 1.75, y1: H_BAIE, vitre: true });
  // la porte de secours (vantail d'acier noir, fermée, côté rue), son panneau rouge et la ventilation au-dessus
  ch.porte('x', -0.2, 0.8, { l: 1.0, h: 2.2, ep: 0.4, modele: 'noire', etat: 'fermee', cote: 'S', huisserie: false });
  ch.boite(0.1, -0.44, 1.6, -0.4, 2.25, 2.75, M.noirMat);
  // (lot façade du 11/10, photo 10 recalée : les lames de la ventilation sont d'un gris d'acier, plus claires que leur
  // cadre ; la porte est dans un bâti noir — ses tableaux et l'entre-deux jusqu'au trumeau noir, x 1,30-1,46 — : de la
  // rue, du pilier de pierre (x 0-0,3) au passage, tout est sombre)
  for (let h = 2.29; h < 2.74; h += 0.045) ch.boite(0.12, -0.47, 1.58, -0.44, h, h + 0.012, M.aluGris, { ombre: false });
  for (const [a, b] of [[0.3, 0.32], [1.28, 1.3]]) ch.boite(a, -0.4, b, 0, 0, 2.2, M.noirMat, { ombre: false });
  ch.boite(0.3, -0.4, 1.3, 0, 2.18, 2.2, M.noirMat, { ombre: false });
  ch.boite(1.3, -0.42, 1.46, -0.4, 0, 2.25, M.noirMat, { ombre: false });
  ch.panneau(new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.6 }), 0.3, 0.2, 0.8, -0.45, 1.75, 'S');
  // le linteau d'acier noir du passage (35 cm) et, dessous, au milieu, le boîtier noir aux deux étiquettes blanches
  // (relecture du 11/10, photo 10 rejouée : un seul boîtier de 0,59 m, x 3,01-3,6, de 2,32 à 2,45 — pas deux petits
  // boîtiers aux jambages ; c'est lui qu'on voit de la rue, et non un bloc de sortie vert)
  ch.boite(2.175, -0.44, 4.425, -0.4, 2.45, 2.8, M.acierNoir);
  ch.boite(3.01, -0.45, 3.6, -0.35, 2.32, 2.45, M.noirMat, { ombre: false });
  const etiq = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.5 });
  for (const x of [3.12, 3.49]) ch.panneau(etiq, 0.15, 0.035, x, -0.452, 2.385, 'S');
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
  // LE PORTAIL N° 6 : tableaux noirs (le mur du bureau B à l'ouest, un retour à l'est), sous-face noire
  ch.mur({ de: [16.575, -0.4], a: [16.575, 0.3], ep: 0.15, h: H_DALLE, mats: { W: M.noirMat, E: M.blanc } });
  // (en retrait de 2 cm du nu de la façade : sa face avant ne double pas celle du linteau de pierre)
  ch.boite(13.35, -0.38, 16.5, 0.3, 2.8, H_DALLE, M.noirMat, { ombre: false });
  // (lot façade, 11/10 : le portail rétréci à x 13,42-16,30, son linteau à 2,78 — photos 16 et 17 —, ses tableaux et sa
  // sous-face sont noirs jusqu'à la ligne de la porte 6 (y 0,3) ; les bouts de la porte 6 passent derrière la pierre)
  const P6 = { x0: PORTAIL.c - PORTAIL.l / 2, x1: PORTAIL.c + PORTAIL.l / 2 };
  for (const [a, b] of [[P6.x0, P6.x0 + 0.02], [P6.x1 - 0.02, P6.x1]]) ch.boite(a, -0.4, b, 0.3, 0, PORTAIL.h, M.noirMat, { ombre: false });
  ch.boite(13.35, -0.395, 16.5, 0.3, PORTAIL.h - 0.02, PORTAIL.h, M.noirMat, { ombre: false });
  // le numéro 6, noir, sur la pierre à droite du portail ; les deux projecteurs et l'écusson tricolore au-dessus
  // (lot façade, photos 16 et 18 : le 6 est à 0,22 m du tableau est, à 0,6 m sous le linteau, haut de 13 cm — le jeu le
  // mettait à 16,85 et à 2,30, de 22 cm ; les projecteurs sont au-dessus des tableaux est du passage et du portail, à 4,0 m
  // — photos 10, 12 redressée, 17 : x 4,95 et 16,45-16,49 —, et non en x 6,9 et 16,8 à 3,67)
  const six = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.165), new THREE.MeshStandardMaterial({ map: texNumero('6'), transparent: true, roughness: 0.5 }));
  six.position.set(P6.x1 + 0.22, PORTAIL.h - 0.6, 0.405); ch.decor.add(six);
  for (const x of [4.95, 16.47]) {
    // le projecteur : une console courte, le boîtier noir penché vers le trottoir
    ch.boite(x - 0.04, -0.52, x + 0.04, -0.4, 3.96, 4.04, M.noirMat, { ombre: false });
    const p = maille(boiteM(0.32, 0.22, 0.09), M.acierNoir, x, 3.96, 0.58, 0, ch.decor, { ombre: false });
    p.rotation.x = 0.55;
  }
  // LES DRAPEAUX (photos 16 à 18) : le français à gauche, l'européen à droite, sur deux hampes qui sortent de derrière
  // l'écusson tricolore « Liberté Égalité Fraternité » et s'ouvrent EN V (17° de part et d'autre de la verticale, un peu
  // penchées vers la rue), pommeau doré. Temps sans vent : chaque toile pend le long du haut de sa hampe, drapée, presque
  // parallèle à la façade — on la voit de la rue, le bleu (ou les étoiles) contre la hampe.
  // (lot rue, 09/10/2026 : les hampes étaient à 45° droit vers la rue, les toiles vues par la tranche ; relecture : le V
  // resserré, et chaque toile pend vers l'EXTÉRIEUR, à côté de l'écusson, son bas à mi-hauteur de celui-ci — photo 16)
  // (lot façade, 11/10 : photos 16 et 17 redressées — l'écusson est centré sur le portail, x 14,86, de 2,82 à 3,42 (0,45
  // de large, 0,6 de haut, la pointe à 4 cm du linteau) ; les pommeaux sont à 4,25 m (x 14,5 et 15,25), le bas des toiles
  // à hauteur du haut de l'écusson : les hampes ne font que 0,95 m, les toiles 0,45 de haut et 0,55 de chute — le jeu les
  // montait jusqu'à 4,7 m)
  const dorure = new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.35, metalness: 0.8 });
  const drapeau = (x, tex, cote) => {
    const g = new THREE.Group(); g.position.set(x, PORTAIL.h + 0.62, 0.41); ch.decor.add(g);
    const d = new THREE.Vector3(cote * 0.29, 0.92, 0.26).normalize(), L = 0.95;
    const hampe = maille(new THREE.CylinderGeometry(0.012, 0.012, L, 8), M.noirMat, d.x * L / 2, d.y * L / 2, d.z * L / 2, 0, g, { ombre: false });
    hampe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    maille(new THREE.SphereGeometry(0.025, 10, 8), dorure, d.x * (L + 0.02), d.y * (L + 0.02), d.z * (L + 0.02), 0, g, { ombre: false });
    // la toile : accrochée de 0,40 à 0,85 m le long de la hampe (la hauteur du drapeau), elle retombe de 0,55 m (sa
    // longueur) en s'écartant un peu vers l'extérieur ; trois plis
    const pts = [], uvs = [], idx = [], n = 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n, sp = 0.4 + 0.45 * t, pli = Math.sin(t * Math.PI * 3) * 0.035;
      for (const [v, dy] of [[1, 0], [0.5, -0.29], [0, -0.55 - 0.05 * Math.sin(t * Math.PI)]]) {
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
  drapeau(PORTAIL.c - 0.08, texDrapeau('fr'), -1); drapeau(PORTAIL.c + 0.08, texDrapeau('eu'), 1);
  const ecusson = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.6), jourDehors(new THREE.MeshStandardMaterial({ map: texDrapeau('ecusson'), transparent: true, roughness: 0.5 }), 0.3));
  ecusson.position.set(PORTAIL.c, PORTAIL.h + 0.34, 0.43); ch.decor.add(ecusson);

  // ---- LES ÉTAGES (pierre et fenêtres dessinées, une travée par tuile), le 5e étage et la toiture ----
  // (centrée sur x = 9,9 : la tuile de 1,65 m tombe juste sur les travées ; débordant de 30 cm sur les mitoyens)
  // (le 1er et le 2e ont leurs façades à eux, percées de vraies fenêtres : js/ecole_etage1.js, js/ecole_etage2.js — 10/10 ;
  // les étages dessinés partent du 3e, à 9,70 m — la boîte fait deux étages : le bas de sa tuile, à -3,10, tombe déjà
  // sur un plancher, rien à recaler)
  const geoEtages = boiteM(20.4, 2 * 3.1, 0.4);
  const etages = maille(geoEtages, M.etage, 9.9, H_RDC + 2 * 3.1 + 3.1, 0.2, 0, ch.decor, { ombre: false });
  etages.userData.horsAOSol = true;
  // LE 5e ÉTAGE ET LA TOITURE (lot façade du 11/10 : la photo 12 redressée — iris_vues/X4_p12_redressee.jpg — montre une
  // CINQUIÈME rangée, dans le plan de la façade : une allège de pierre jusqu'à 0,85 m au-dessus du plancher (16,75), un
  // appui, puis un bandeau vitré noir, coupé à chaque travée d'un poteau clair de 20 cm jusqu'à 17,9, puis plein jusqu'au
  // nez de la toiture plate, 18,6-19,2 ; l'encadrement rouge de la travée 12 est celui des autres étages. Le jeu
  // posait à 15,90 une corniche saillante, un garde-corps à barreaux et un attique en retrait de 1,2 m, que la photo
  // n'a pas : en retrait, l'attique y tomberait trois mètres plus bas, sur la rangée du 4e)
  // (cotes relues sur la photo 12 redressée, à côté du jeu redressé de même — iris_vues/X4_pl_p12_redressee.jpg : ce qui
  // est en saillie y monte de 2 à 3 %, le nez et les cadres sont comparés à leur image dans le jeu, non à la grille)
  const N5 = H_RDC + 4 * 3.1, hA = N5 + 0.85, hP = 17.9, hN = 18.6, hT = 19.2;
  ch.boite(-0.3, -0.4, 20.1, 0, N5, hA, M.pierre, { ombre: false });
  ch.boite(-0.3, -0.45, 20.1, 0.05, hA, hA + 0.07, M.pierre, { ombre: false });
  ch.boite(0, -0.28, 19.8, 6, hA + 0.07, hN, M.noirMat, { ombre: false });
  for (let k = 0; k <= 12; k++) ch.boite(Math.max(-0.3, k * 1.65 - 0.1), -0.4, Math.min(20.1, k * 1.65 + 0.1), -0.28, hA + 0.07, hP, M.pierre, { ombre: false });
  ch.boite(-0.3, -0.33, 20.1, -0.28, hP, hP + 0.06, M.menuiserie, { ombre: false });
  ch.boite(-0.3, -0.5, 20.1, 6.2, hN, hT, M.pierre, { ombre: false });
  // (la sous-face du nez, dans l'ombre : vue d'en bas, une bande sombre au-dessus du vitrage — photo 12)
  ch.boite(-0.3, -0.5, 20.1, -0.28, hN - 0.02, hN, M.noirMat, { ombre: false });
  ch.boite(-0.3, -0.47, 20.1, 6.2, hT, hT + 0.05, M.aluGris, { ombre: false });
  // LES BANDES NOIRES DES DEUX BOUTS (photos 10, 12 redressée, 16 : 30 cm d'un noir mat, de toute la hauteur, à la jonction
  // des mitoyens — le jeu n'y posait que deux descentes d'eau de 12 cm)
  for (const [a, b] of [[-0.3, 0], [19.8, 20.08]]) ch.boite(a, -0.42, b, -0.4, 0, hT, M.noirMat, { ombre: false });
  // LES ENCADREMENTS ROUGES en saillie (js/ecole_matieres.js CADRE, CADRES) ; aux étages dessinés (3e à 5e), la fenêtre haute
  // de leur jour, peinte sur un panneau qui couvre la fenêtre de la tuile ; au 1er et au 2e, la vraie (js/ecole_etage1.js,
  // js/ecole_etage2.js)
  const K = CADRE, y0 = -0.4 - K.saillie, y1 = -0.4;
  for (const { t, e, o } of CADRES) {
    const x = 0.825 + (t - 1) * 1.65, N = H_RDC + (e - 1) * 3.1, b0 = N + K.bas, b1 = N + K.haut, a = x - K.l / 2, c = x + K.l / 2;
    ch.boite(a, y0, c, y1, b1 - K.linteau, b1, M.rougeCadre, { ombre: false });
    ch.boite(a, y0, c, y1, b0, b0 + K.traverse, M.rougeCadre, { ombre: false });
    ch.boite(a, y0, a + K.montant, y1, b0 + K.traverse, b1 - K.linteau, M.rougeCadre, { ombre: false });
    ch.boite(c - K.montant, y0, c, y1, b0 + K.traverse, b1 - K.linteau, M.rougeCadre, { ombre: false });
    // l'appui blanc de la fenêtre, sur la traverse basse, du nu du cadre à la menuiserie
    ch.boite(a + K.montant, y0, c - K.montant, -0.25, b0 + K.traverse, b0 + K.traverse + 0.05, M.blanc, { ombre: false });
    if (e < 3) continue;
    if (e === 5) { ch.boite(a + K.montant, -0.42, c - K.montant, -0.4, b0 + K.traverse + 0.05, b1 - K.linteau, M.noirMat, { ombre: false }); continue; }
    const p = new THREE.Mesh(new THREE.PlaneGeometry(K.jour.l, K.jour.haut - K.jour.bas), jourDehors(new THREE.MeshStandardMaterial({ map: texFenetreCadre(o), roughness: 0.35 }), 0.15));
    p.position.set(x, N + (K.jour.bas + K.jour.haut) / 2, 0.412); p.userData.horsAOSol = true; ch.decor.add(p);
  }
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
// (plan V2, 11/10 : la paroi passe de la ligne y 5,0 à la ligne y 4,05. Plus de fixes vitrés — les photos 07, 10 et 19
// n'en montrent aucun : la double porte va de la pile du plan d'évacuation (x 2,45) au mur est (x 4,425), deux vantaux
// de ≈ 0,99. À l'ouest, x 1,75-2,45, le pan plein est le dos de cette pile — crème comme le passage, une affiche et une
// grille de ventilation basse, photo 10.)
function construireParoiPassage(ch) {
  const { M, C } = ch, Y = 4.05, hP = 2.3, hT = 2.6, X0 = 2.45, X1 = 4.425;
  const montant = (x) => ch.boite(x - 0.035, Y - 0.04, x + 0.035, Y + 0.04, 0, hT, M.alu);
  for (const x of [X0 + 0.035, X1 - 0.035]) montant(x);
  ch.boite(X0, Y - 0.04, X1, Y + 0.04, hP, hP + 0.08, M.alu);
  ch.boite(X0, Y - 0.04, X1, Y + 0.04, hT - 0.06, hT, M.alu);
  ch.boite(X0, Y - 0.025, X1, Y + 0.025, hP + 0.08, hT - 0.06, M.alu);
  C.ajouterBoite(X0, -(Y + 0.05), X1, -(Y - 0.05), { y0: hP, y1: H_DALLE });
  // le pan plein : le dos de la pile (construireMurs), peint en crème côté passage (son affiche : js/ecole_mobilier.js)
  ch.panneau(M.creme, X0 - 1.75, hT, (1.75 + X0) / 2, Y - 0.002, hT / 2, 'S');
  // LES AUTOCOLLANTS « iris » (photos 07, 19) : deux rangées de quatre sur le vantail EST (s = -1 : à droite vu du
  // passage), un seul au milieu du vantail ouest (relecture du 11/10, photo 07 rejouée à sa pose, (3,86 ; 5,27) h 1,30
  // cap 193 : les rangées à 0,99 et 1,46, le seul du vantail ouest à 1,29)
  const rangs = (s) => (s < 0 ? [[0.99, 4], [1.46, 4]] : [[1.29, 1]]);
  ch.porte('x', Y, (X0 + X1) / 2, { l: X1 - X0, h: hP, ep: 0.08, modele: 'vitree2', autocollants: rangs, etat: 'auto', cote: 'S', huisserie: false, nom: 'passage' });
  // LE BLOC DE SORTIE côté hall, au-dessus des vantaux, au milieu (plan V2 : (3,3 ; 4,17)). (Relecture du 11/10 : la photo
  // 07 rejouée à sa pose le montre AU-DESSUS de la traverse haute, de 2,33 à 2,45, un bloc à pictogramme — le coureur et
  // sa porte —, et non un boîtier de détecteur : le plafond du hall remonte contre la paroi, construireCarte. Du passage,
  // le bandeau plein le cache, comme sur la photo 19.)
  ch.sortie(3.3, Y + 0.065, 2.39, 'N', { simple: true });
}

// =====================================================================
//  LE REZ-DE-CHAUSSÉE
// =====================================================================
function construireMurs(ch) {
  const { M } = ch;
  const B = M.blanc, CR = M.creme;
  // ---- LE PASSAGE ET LE HALL OUEST (plan V2 § 2.2, 11/10 : le hall ouest repris MOT POUR MOT de la photo 06, retour r01
  // de Haythem — de 8,6 m à 4,9 m de long) ----
  // le mur ouest du passage (le couloir de service derrière) et la porte blanche « Sortie », vers la rue (photo 07 : à
  // y ≈ 1,6, pas contre la paroi vitrée).
  // (11/10, photo 10 rejouée — un ajustement à 10 mesures, 1,8 px d'écart moyen, quelle que soit la focale : le fond du
  // passage va de x 1,79 à 4,425, 2,64 m, et non 2,25 ; à x 2,175, le mur ouest laisserait 6,7 px d'écart, 15 au coin.
  // L'ouverture sur la rue garde ses 2,25 m : à l'ouest, un trumeau de 0,43 m dans l'épaisseur de la façade, noir dehors.
  // Le mur ouest reste donc sur la ligne x 1,675 de master, et le pan plein du fond est tout le dos de la pile du plan
  // d'évacuation, 0,70 m — la photo 10 y montre une affiche et une grille de ventilation basse.)
  // (Relecture du 11/10 : les plinthes du passage sont de carrelage gris, pas de bois — photo 07, le long des deux murs,
  // et photo 10 ; celles du hall sont de bois, photo 06. Posées à part : `mur` ne pose que du bois.)
  const PG = new THREE.MeshStandardMaterial({ color: 0x9a9b99, roughness: 0.55 });
  PG.name = 'plinthe de carrelage gris (passage)';
  ch.mur({ de: [1.675, -0.2], a: [1.675, 4.05], mats: { E: CR, W: B }, ouvertures: [{ c: 1.6, l: 0.9, h: 2.04 }] });
  ch.porte('y', 1.675, 1.6, { l: 0.9, h: 2.04, modele: 'blanche', etat: 'auto', cote: 'E', charniere: 'd', nom: 'service (passage)' });
  for (const [a0, a1] of [[0, 1.15], [2.05, 4.05]]) ch.boite(1.75, a0, 1.762, a1, 0, 0.09, PG, { ombre: false });
  ch.boite(4.413, 0, 4.425, 4.05, 0, 0.09, PG, { ombre: false });
  ch.boite(1.75, 4.038, 2.45, 4.05, 0, 0.09, PG, { ombre: false });
  // le mur ouest du hall (ligne x 1,675), derrière la pile, le renfoncement de la porte grise et l'avancée nord
  ch.mur({ de: [1.675, 4.05], a: [1.675, 8.3], mats: B, plinthes: ['E'], ouvertures: [{ c: 9.575 + DY_SS, l: 0.95, h: 2.04 }] });
  // (finitions du 11/10 : au nord de y 8,3, il s'arrête à 2,50, sous la volée 2 de l'escalier principal qui passe au-dessus
  // du plafond du hall — construireEscalier ; caché derrière l'avancée nord)
  ch.mur({ de: [1.675, 8.3], a: [1.675, 8.925], h: 2.5, mats: B });
  // (09/10, la vidéo du sous-sol : elle ouvre sur le palier de l'escalier du -1, js/ecole_soussol.js ; on la TIRE depuis le
  // hall — vantail côté hall, gonds au sud, barre inox verticale, ferme-porte à glissière côté hall, photo 06 et v_001)
  // (plan V2 : y 5,02-5,95, à 0,97 m de la paroi vitrée — la chaîne du -1 suit, DY_SS ; sa fente vitrée est la longue,
  // de 0,6 à 1,85 : photo 06 et r01, elle descend aux deux tiers de la porte, le jeu la mettait de 1,0 à 1,85)
  ch.porte('y', 1.675, 9.575 + DY_SS, { l: 0.93, h: 2.04, modele: 'grise', oculus: 'long', poignee: 'tirant', fermePorte: false, etat: 'auto', cote: 'E', libre: 1, nom: 'service (hall)' });
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
  // (finitions du 11/10 : l'avancée nord s'arrête à 2,50 à l'ouest de x 1,975 — au-dessus du plafond du hall, la volée 2
  // de l'escalier principal y passe ; construireEscalier)
  for (const [ya, yb, faces] of [[4.05, 4.97, ['E', 'N']], [7.22, 8.925, ['E', 'S']]]) {
    const xa = 2.45, xc = ya > 7 ? ESC.x2e : 1.75;
    if (xc > 1.75) ch.boite(1.75, ya, xc, yb, 0, 2.5, B, { collision: true });
    ch.boite(xc, ya, xa, yb, 0, H_DALLE, B, { collision: true });
    if (faces.includes('E')) ch.boite(xa, ya, xa + 0.015, yb, 0, 0.08, M.bois, { ombre: false });
    if (faces.includes('S')) ch.boite(1.75, ya - 0.015, xa + 0.015, ya, 0, 0.08, M.bois, { ombre: false });
    if (faces.includes('N')) ch.boite(1.75, yb, xa + 0.015, yb + 0.015, 0, 0.08, M.bois, { ombre: false });
  }
  // le mur est du passage : la ligne x 4,5 (plan V2 : le trumeau des travées 3 et 4 ; derrière, la Si 0.1), jusqu'au mur
  // sud de la salle d'attente (ligne y 4,8) ; au nord, le hall s'ouvre sur la salle. (La porte de l'ex-salle A n'est plus
  // ici : sur le mur sud de la salle d'attente.) (Côté passage, sa plinthe grise : plus haut.)
  ch.mur({ de: [4.5, -0.4], a: [4.5, 4.05], mats: { W: CR, E: B } });
  // (r03, 12/10 : le mur sud de la salle recule de 0,20 — DY_R03 — ; ce mur s'arrête à son nu, 4,675)
  ch.mur({ de: [4.5, 4.05], a: [4.5, ATT.ys + EP / 2], mats: B, plinthes: ['W'] });
  // ---- LA SALLE D'ATTENTE (photos 02, 03, 21, 22 ; VO q_0027-0046) ----
  // (11/10, plan V2 : elle n'est pas derrière un « cou » de 4,2 m — elle BORDE le bureau de direction et la Si 0.1, dont
  // les murs nord font son mur sud, et finit sur la face ouest de la pile : le même radiateur, les mêmes affichettes et le
  // même haut-parleur au fond de la photo 21 et à gauche de la photo 03 ; de la porte 6, la VO q_0036-0041 la voit à gauche
  // de la pile, son mur jaune tout de suite derrière. DY_A la ramène de y 9,0-12,075 à y 4,8-7,875 ; sa largeur (2,925 nu à
  // nu), sa longueur et tout son contenu ne changent pas)
  // LE MUR SUD, d'un seul tenant, du mur est du passage (x 4,5) au bout de mur de la plaque du bureau de direction (XE,
  // plus bas) : les trois jours dépolis de la Si 0.1 (photos 02, 21, r02). (Il allait jusqu'à l'angle du bureau, x 11,55,
  // avec la porte de la Si 0.1 et le jour du bureau : l'un et l'autre sont maintenant dans l'antichambre, plus bas.)
  // (RELECTURE DU 11/10, r02 : LE MUR SUD A TROIS JOURS, ET NON DEUX, PLUS PETITS ET PLUS HAUTS. La photo 02, prise du bout
  // est vers l'ouest, voit de près un jour à affiches et au loin un jour nu ; r02, prise du bout ouest vers l'est, voit
  // elle aussi de près un jour à affiches et au loin un jour nu — et ce sont les MÊMES affiches (la blanche à titre rouge
  // sur la blanche aux six carrés noir, rouge, vert, agrandies sur les deux photos). Le jour à affiches est donc au
  // milieu, entre deux jours nus : l'ouest, que voit la 02, et l'est, que voit r02 ; d'où la « contradiction » des deux
  // photos sur les affiches. La photo 02 posée sur la porte grise du hall ouest — taille comprise — et sur l'angle ouest du
  // mur sud, qu'elle voit à x 4,49 (le jeu : 4,5), met les bords des jours en 5,23 | 6,42 — 6,55 | … ; r02, ses jours du
  // milieu et de l'est en … | 7,74 — 7,87 | 9,06 : trois jours de 1,19 hors tout, trumeaux de 0,13. Sur les deux photos, le
  // haut du cadre touche presque la bande de dalles lisses du plafond et l'appui est bien au-dessus des dossiers, à 0,2 m
  // de la lisse grise : verre de 1,02 x 1,28, de 1,12 à 2,40 — cadre compris, 1,035-2,485. Ils faisaient 1,3 x 1,35, de 0,95
  // à 2,3, c 6,65 et 8,35 : vus du bout ouest, le jour est sortait 100 px trop à gauche et 0,3 m trop bas.)
  // (RETOUR DE HAYTHEM DU 11/10, r02 — LA JONCTION AVEC LE HALL. Sur sa photo, À DROITE DU PILIER, entre lui et la borne,
  // une ouverture sombre et profonde : au fond, le hall — une fenêtre à barreaux de la façade, des spots à 12-18 m de
  // l'appareil, le comptoir —, et au-dessus le drapeau noir ; le jeu y montrait le mur sud, la porte grise de la Si 0.1 et,
  // plus loin, le mur nord du bureau, en y 4,8 jusqu'à x 11,55 : le hall ne se voyait de nulle part. r02 agrandie (pose du
  // relecteur, (5,28 ; 7,20) h 1,55 cap 110,7, f 1 502) : LE MUR SUD S'ARRÊTE NET, 48 px à gauche du cadre du jour est —
  // le jeu rejoué au même point de vue met 75 px pour 0,29 m à cet endroit : 0,18 m après le cadre, x 9,24 —, et le drapeau
  // est sur ce bout de mur ; au-delà, le hall, entre le pilier et lui. VO q_0040-0043 : à l'angle, le drapeau ; sur le
  // retour, face à l'est, la plaque « Bureau de direction B 0.3 » ; les jours dépolis juste à droite de l'angle — la
  // caméra de la visite passe à côté. Derrière, une ANTICHAMBRE, jusqu'au mur nord du bureau : plus bas.)
  const YS = ATT.ys, XE = 9.24, JOURS_S = [5.825, 7.145, 8.465], J_L = 1.02, J_BAS = 1.12, J_H = 2.4;
  ch.mur({ de: [4.5, YS], a: [XE, YS], mats: B, plinthes: ['N', 'S'], ouvertures: JOURS_S.map((c) => ({ c, l: J_L, bas: J_BAS, h: J_H })) });
  // (la plinthe du chant, au bout du mur : elle rejoint celle de l'antichambre)
  ch.boite(XE, YS - EP / 2, XE + 0.015, YS + EP / 2 + 0.015, 0, 0.08, M.bois, { ombre: false });
  const sud = new THREE.Group(); sud.position.set(0, 0, -YS); ch.decor.add(sud);
  // (retour de Haythem du 11/10, r02 : « deux fenêtres à cadre blanc ÉPAIS » — 8,5 cm sur la photo 21, et non 6 ; le verre
  // est un dépoli opaque vert pâle : js/ecole_portes.js fenetreDepolie)
  for (const c of JOURS_S) { fenetreDepolie(sud, M, { x: c, l: J_L, bas: J_BAS, haut: J_H, ep: EP, cadre: 0.085 }); ch.C.ajouterBoite(c - J_L / 2, -(YS - 0.05), c + J_L / 2, -(YS + 0.05), { y0: J_BAS, y1: J_H, vitre: true }); }
  // la double lisse gris clair du mur sud (DY_A), jusqu'au bout du mur (plus de porte pour la couper)
  // (retour de Haythem du 11/10, r02 : « sous les fenêtres, la double lisse grise court le long du mur » — sur les photos
  // 21 et 02, ses deux filets passent SOUS l'appui des jours ; à 0,82-0,98, le second mordait sur le cadre. Relecture : les
  // jours remontés, elle est à 0,2 m sous leur appui, comme sur les deux photos)
  for (const h of [0.73, 0.81]) ch.boite(4.9, YS + 0.075, XE - 0.005, YS + 0.1, h, h + 0.04, M.lisseGrise, { ombre: false });
  // le nord : LE MUR SAFRAN (de x 5,8, le pilier jaune de l'entrée du C05 — photos 04, 05 —, à 11,7, l'entrée du C01), sa
  // lisse de PVC blanc, son panneau DAE (DY_A)
  const YN = ATT.yn;
  // (13/10, lot C2 — L'ENTRÉE DU C05, photos 05 et 04 rejouées sur le C05 refait (dix points de la photo 05 à 5,8 px,
  // l'appareil en (6,06 ; 6,54) ; huit points des portes de l'escalier sur la 04, (6,70 ; 6,83)) : les deux rayons de
  // l'arête du mur jaune se croisent en (5,98 ; 7,85), ceux du bas de sa lisse en (6,00 ; 7,80) — le mur safran ne
  // dépasse pas en « pilier » dans l'entrée du couloir, il s'arrête AU NU de son mur est, x 5,92 ; à 5,80, vu de la pose
  // de la photo 05, il cachait toute la porte bleue. (Les deux poses refaites avec cette arête : (5,98 ; 6,55) cap −13,1
  // pour la 05, f 640, 7,9 px sur treize points ; (6,55 ; 6,81) cap −49,6 pour la 04, f 600, 6,3 px sur onze.) Le panneau
  // DAE : son bord gauche en x 6,07 sur la 04 et 6,12 sur la 05, de 1,76 à 1,86 m — il était 20 cm plus près de l'arête
  // et 20 cm plus haut. Rien d'autre du mur ne change.
  ch.mur({ de: [C05.xE, YN], a: [11.7, YN], mats: { S: M.orange, N: B }, plinthes: ['S'] });
  ch.boite(C05.xE - 0.003, YN - 0.075, C05.xE, YN + 0.075, 0, H_DALLE, B, { ombre: false });   // (son about, blanc : le nu du mur est du C05)
  ch.boite(C05.xE - 0.015, YN - 0.09, C05.xE, YN + 0.075, 0, 0.08, M.bois, { ombre: false });
  ch.boite(C05.xE, YN - 0.085, 11.7, YN - 0.075, 0.85, 1.05, M.lissePVC, { ombre: false });
  for (const h of [0.85, 1.048]) ch.boite(C05.xE, YN - 0.09, 11.7, YN - 0.085, h, h + 0.004, M.lisseGrise, { ombre: false });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texDAE(), roughness: 0.4 }), 0.4, 0.1, 6.3, YN - 0.081, 1.81, 'S');
  // l'est : le mur du fond (présentoir, radiateur) qui continue en mur est du couloir C01 (porte de la gaine)
  // (V2, 11/10 — plan_v2.md § 2.2 : le C01 s'arrête au mur du fond, y 14,475 ; le mur avec lui, à 14,55. La gaine est EN
  // FACE DU LOCAL, presque à hauteur de l'appareil sur la photo 01 recalée — elle était 3,15 m plus au nord)
  // (13/10, lot C2 — photo 01 à sa pose refaite, C01 en tête du fichier : le mur au nu de la pile, x 13,30 ; la gaine en
  // face du local, y 8,31-9,78, ses vantaux au-dessus de la plinthe, de 0,08 à 1,73)
  ch.mur({ de: [C01.xM, 7.575], a: [C01.xM, 14.55], mats: B, plinthes: ['W'], ouvertures: [{ c: C01.yG, l: C01.lG, bas: 0.08, h: 1.73 }] });
  ch.porte('y', C01.xM, C01.yG, { l: C01.lG, h: 1.65, base: 0.08, modele: 'gaine2', etat: 'fermee', cote: 'W', nom: 'gaine technique' });
  // (la trappe crème et la grille de ventilation au-dessus de la gaine : posées sur le mur, face ouest — photo 01 : la
  // trappe au-dessus du vantail NORD, côté toilettes, la grille au-dessus du vantail sud ; elles étaient inversées, 09/10)
  // (13/10, lot C2 — photo 01 à sa pose refaite : la grille est au MILIEU, à cheval sur les deux vantaux, 0,72 de large de
  // 1,85 à 2,31, un montant en son milieu ; la trappe, plus petite, 0,36 x 0,34, au bout nord, de 1,96 à 2,30 — toutes
  // deux sous le plafond à 2,35)
  ch.boite(C01.xE - 0.01, 9.44, C01.xE, 9.8, 1.96, 2.3, M.creme2, { ombre: false });
  ch.boite(C01.xE - 0.01, 8.63, C01.xE, 9.35, 1.85, 2.31, M.grille, { ombre: false });
  // (ses lames : un gris-brun sombre, 71/65/53 sur la photo, pas du noir)
  const lame = new THREE.MeshStandardMaterial({ color: 0x5b564d, roughness: 0.6 }); lame.name = 'lames de la grille du C01';
  for (let h = 1.885; h < 2.28; h += 0.03) ch.boite(C01.xE - 0.02, 8.67, C01.xE - 0.01, 9.31, h, h + 0.016, lame, { ombre: false });
  ch.boite(C01.xE - 0.022, 8.975, C01.xE - 0.01, 9.005, 1.87, 2.29, M.grille, { ombre: false });
  // ---- LE COULOIR C05 ET LE COULOIR C01 ----
  // LES DEUX PORTES DES TOILETTES DU C05 (photo 23, 09/10) : femmes à l'entrée, hommes aux deux tiers ; vantaux gris de
  // 0,85, huisserie blanche, gonds au sud, béquille au nord, la fente vitrée haute cerclée de bois foncé côté serrure
  // (0,55-1,85 m ; relecture du 09/10, mesurée sur la porte des femmes de la photo 23 contre la largeur des affiches A4 :
  // 14 cm de verre et non 10, un noyer de 3,5 cm, la fente presque contre la béquille — son axe à 20 cm du chant). Les
  // plaques et les affiches : js/ecole_pieces.js (les toilettes).
  // (V2, 11/10 — la photo 23 recalée, rdc_ouest.md § 3.3 et ov_23.jpg : le C05 n'a que 3,6 m, de la porte de l'escalier à
  // la porte bleue, et 1,225 m de large ; son mur ouest est celui de la cage (lot B) — les photos 04, 05 et 23 le montrent
  // dans le prolongement du jambage est de la porte de l'escalier, sans trumeau. Depuis le mur des portes de
  // l'escalier (Y_ESC) : la porte des hommes à +1,63-2,47, celle des femmes JUSTE AVANT, de -0,85 à 0 — la photo la met
  // 15 cm plus au sud, mais elle doit garder 20 cm de mur au nord du mur safran de la salle d'attente)
  // (13/10, lot C2 — la photo 23 à sa pose refaite, C05 plus haut : le mur est sur la ligne 5,995, son nu en 5,92 ; les
  // deux vantaux font 0,93 ; celui des femmes va de 8,015 à 8,945 — son huisserie touche le dos du mur safran, la photo le
  // voulait bien « plus au sud » —, celui des hommes de 10,52 à 11,45 ; ils sont posés 6 cm en retrait du nu du couloir,
  // et s'ouvrent vers les toilettes, jamais vers le couloir. La fente : son noyer de 4 cm va de 0,59 à 1,86 m, de 9,5 à
  // 34,5 cm du chant libre — 17 cm de verre.)
  const WC_C05 = [[C05.yF, 'toilettes femmes'], [C05.yH, 'toilettes hommes']];
  // (le mur est du C05 se prolonge jusqu'au mur sud de la salle David Clark : c'est le mur est de son entrée)
  // (il part du dos du mur safran, y 7,95 : le mur jaune s'arrête à son nu, il n'y a plus de « pilier » — plus haut)
  ch.mur({ de: [C05.xM, 7.95], a: [C05.xM, 14.15], mats: B, plinthes: ['W'], ouvertures: WC_C05.map(([c]) => ({ c, l: C05.lWC, h: 2.04 })) });
  for (const [c, nom] of WC_C05) ch.porte('y', C05.xM, c, { l: C05.lWC, h: 2.04, modele: 'grise', etat: 'auto', cote: 'W', retrait: 0.05, libre: 1, poignee: 'rosace', oculus: { bas: 0.63, haut: 1.82, l: 0.17, bord: 0.22, cadre: 0.04 }, nom });
  // LE C01 (photo 01 recalée, V2 du 11/10) : de son entrée (y 7,8, au bout est du mur safran) à son fond (y 14,475), la
  // porte du local à 2,8 m, la porte PMR 1,37 m plus loin — du mur du bureau B au local : 5,8 m (la photo : 5,2-6,5).
  // (Relecture du 11/10 : la pose de la photo 01 refaite — les deux chants du local repointés, la gaine, les pieds des deux
  // murs du C01, large de 1,80 : 17 px d'écart au lieu de 30 — met l'appareil 0,12 m plus à l'est ; vus de là, le haut du
  // vantail PMR au bord droit tombe à 1,98 m, sa béquille à 1,09 et sa plaque fait 0,15 de haut, comme celles du C05 —
  // l'ancienne pose donnait 1,70, 1,05 et 0,10. Le vantail PMR commence en y 12,43 : la porte recule de 13,115 à 12,9)
  // (13/10, lot C2 — photo 01 à sa pose refaite, C01 en tête du fichier : la porte du local est À L'ENTRÉE du couloir,
  // son huisserie à 0,73 m du bout du mur ; un vantail de 0,83, de 8,58 à 9,41 ; la porte PMR de 10,80 à 11,73)
  ch.mur({ de: [11.625, 7.95], a: [11.625, 14.475], mats: B, plinthes: ['E'], ouvertures: [{ c: C01.yL, l: C01.lL, h: 2.04 }, { c: C01.yP, l: C01.lP, h: 2.04 }] });
  // (les portes du C01 n'ont pas d'oculus, photo 01)
  // (le local : gonds au nord, poignée au sud, photo 01)
  // (ses deux affichettes l'une au-dessus de l'autre, au milieu du vantail : js/ecole_pieces.js ; la béquille sur rosace)
  ch.porte('y', 11.625, C01.yL, { l: C01.lL, h: 2.04, modele: 'grise', oculus: false, etat: 'auto', cote: 'E', charniere: 'd', poignee: 'rosace', nom: 'local (C01)' });
  // (la porte des toilettes PMR : sa plaque montre un fauteuil roulant, photo 01 ; 09/10)
  ch.porte('y', 11.625, C01.yP, { l: C01.lP, h: 2.04, modele: 'grise', oculus: false, etat: 'auto', cote: 'E', charniere: 'd', poignee: 'rosace', nom: 'toilettes PMR' });
  // (le fond du C01 : sa porte grise, fermée, donne sur un local du fond que personne n'a vu)
  ch.mur({ de: [11.55, 14.475], a: [C01.xM + 0.075, 14.475], mats: B, plinthes: ['S'], ouvertures: [{ c: 12.5, l: 0.93, h: 2.04 }] });
  ch.porte('x', 14.475, 12.5, { l: 0.93, h: 2.04, modele: 'grise', etat: 'fermee', cote: 'S', nom: 'fond du C01' });
  // ---- LE BUREAU DE DIRECTION B 0.3 (le « bureau B ») ET LE PASSAGE AU SUD-OUEST DE LA PILE ----
  // (11/10, plan V2 : le « cou » n'existe pas — la salle d'attente touche le bureau ; son trumeau blanc était le pilier gris)
  // L'ANTICHAMBRE (retour de Haythem du 11/10, r02 ; x 9,24-13,3 × y 3,175-4,875). Le mur sud de la salle d'attente
  // s'arrête en x 9,24 (plus haut) ; derrière lui, jusqu'au mur nord du bureau, un dégagement de 1,7 m qui rejoint le
  // passage de la pile et le hall — par là, du bout ouest de la salle, on voit le hall à droite du pilier (r02). Trois
  // photos le bornent :
  //  - la photo 03, de l'angle sud-est de la salle vers le hall : à droite, le sol libre jusqu'au mur blanc dont la plinthe
  //    file vers l'ouest, la face nord de la ligne y 3,1, qui finit en (12,575 ; 3,175) (sa plinthe rétroprojetée à la pose
  //    du lot C met cette face entre 3,0 et 3,1 : gardée) ; dans le bas du cadre, le sol en (11,7 ; 4,65), là où le jeu
  //    dressait le mur nord du bureau ;
  //  - la photo 01, du C01 vers le sud : au fond, ce même mur de face, son jour dépoli à 0,9 m de l'angle, et 0,7 m plus
  //    loin la porte vitrée du bureau (hauteurs comparées : 79 px/m pour le mur, 71 pour la porte) — la porte est en y 2,5
  //    (photos 03, 22), le mur en y 3,1, et non en 4,8 ;
  //  - r02 : le mur sud s'arrête en x 9,24, le hall se voit au-delà.
  // Le mur nord du bureau devient donc la ligne y 3,1, de la Si 0.1 (x 9,09) à l'angle du passage (12,575) ; le mur ouest de
  // l'antichambre, le retour x 9,165, ferme la Si 0.1, qui perd son angle nord-est (x 9,09-9,9 × y 3,175-4,725) ; le mur
  // entre la Si 0.1 et le bureau s'arrête à la ligne y 3,1. (Avant : mur nord du bureau en y 4,8 jusqu'à x 11,55, redent en
  // x 11,55 ; le passage n'avait que 1,68 m, entre ce redent et la pile.)
  // (RELECTURE DU 11/10, r02 : LA LIGNE 2,925, nu nord 3,0, et non 3,1. La photo 03 rejouée à sa pose avec le jeu : la
  // plinthe du mur de droite tombe 15-20 px trop bas dans le jeu — le mur y est trop près de l'appareil ; rétroprojetés, le
  // pied de l'angle est en (12,65 ; 2,93) et le bord droit du cadre en (12,11 ; 2,96-3,04) : le nu est vers 3,0. Et sur r02,
  // à droite de l'ouverture, le jeu montrait sur 45 px le nu nord du bureau en plein jour (x 12,1-12,575) quand la photo n'y
  // laisse qu'un filet gris-bleu de 12 px contre le bout du mur : reculé de 0,175 m, l'angle ne mord plus que d'un filet.
  // La photo 01 le voudrait plutôt plus au nord — mais elle ne le dit qu'à travers la hauteur supposée de la porte vitrée :
  // les deux autres l'emportent.)
  const YB = 2.925;
  // le mur entre la Si 0.1 et le bureau, arrêté au mur nord du bureau
  ch.mur({ de: [9.975, 0], a: [9.975, YB - EP / 2], mats: B, plinthes: ['W', 'E'] });
  // LE MUR NORD DU BUREAU, ligne y 2,925 (x 9,09-12,575), et son JOUR DÉPOLI (photo 01 : 0,6 m, de 1,05 à 2,5, sa bande haute
  // claire laisse voir les barreaux de la fenêtre de façade c 10,73 derrière lui ; son bord est à 0,91 m de l'angle, en
  // x 11,63 — rétroprojeté du C01 sur la ligne 3,1, il tombe en x 11,03-11,63, devant cette fenêtre)
  const JOUR_B = { c: 11.33, l: 0.6, bas: 1.05, h: 2.5 };
  ch.mur({ de: [XE - EP, YB], a: [12.575, YB], mats: B, plinthes: ['N', 'S'], ouvertures: [{ c: JOUR_B.c, l: JOUR_B.l, bas: JOUR_B.bas, h: JOUR_B.h }] });
  const nordB = new THREE.Group(); nordB.position.set(0, 0, -YB); ch.decor.add(nordB);
  fenetreDepolie(nordB, M, { x: JOUR_B.c, l: JOUR_B.l, haut: JOUR_B.h, bas: JOUR_B.bas, ep: EP, bandeClaire: 0.5 });
  ch.C.ajouterBoite(JOUR_B.c - JOUR_B.l / 2, -(YB - 0.05), JOUR_B.c + JOUR_B.l / 2, -(YB + 0.05), { y0: JOUR_B.bas, y1: JOUR_B.h, vitre: true });
  // LE RETOUR x 9,165 (nu est 9,24 ; y 3,0-4,725), entre le bout du mur sud et le mur du bureau, et LA PORTE DE LA Si 0.1
  // (IMAGINÉE : aucune photo ne la montre — r02 voit ce retour de dos ; sur la VO q_0040-0042, le bord gauche du cadre ne
  // montre que la plaque du bureau de direction, à l'angle, et le chant d'une huisserie juste au sud) : grise, 0,8 m,
  // c 3,98, elle s'ouvre toujours dans la salle, gonds au nord — son vantail ouvert se range le long du mur nord de la
  // salle, dans l'allée entre le rang du fond et la toile, et non sur le bout des tables
  const XR = XE - EP / 2, P_SI = { c: 3.98, l: 0.8 };
  ch.mur({ de: [XR, YB + EP / 2], a: [XR, YS - EP / 2], mats: B, plinthes: ['E', 'W'], ouvertures: [{ c: P_SI.c, l: P_SI.l, h: 2.04 }] });
  ch.porte('y', XR, P_SI.c, { l: P_SI.l, h: 2.04, modele: 'grise', etat: 'auto', cote: 'W', charniere: 'd', libre: -1, nom: 'Si 0.1' });
  // L'ANGLE NORD-EST ÉCORNÉ DU BUREAU (photo 03, pose résolue (11,47 ; 5,68), cap 134 : de la salle, rien ne cache le hall,
  // le comptoir et la porte 6 entre l'angle de la pile, à 125°, et le bord du mur de droite, à 157° — la face nord de la
  // ligne y 3,1, à 2,9 m, qui finit en (12,575 ; 3,175), mesuré sur sa plinthe — relecture : la ligne 2,925, nu 3,0) :
  // x 12,5 de 2,925 à 2,5, puis le retour y 2,5 et la porte vitrée ; le PASSAGE s'ouvre sur le hall sur 2,1 m (y 2,575-4,7),
  // au bout de l'antichambre.
  ch.mur({ de: [12.5, 2.425], a: [12.5, YB + EP / 2], mats: B, plinthes: ['E', 'W'] });
  // LA PORTE DU BUREAU : la porte vitrée à cadre d'aluminium blanc et à affiche des photos 01, 03 et 22, au bout du
  // passage, dans le retour y 2,5 (x 12,5-13,275 ; ses huisseries mordent sur les deux murs en retour). Gonds à l'ouest,
  // tirant court à l'est : sur la photo 03 on la voit presque fermée, la poignée côté hall ; sur la photo 01, de face, son
  // affiche (js/ecole_pieces.js). Elle s'ouvre toujours dans le bureau (le plan V2 la voulait ouverte à demeure : les
  // photos de 2026 la montrent fermée ou entrouverte — automatique, elle est les deux)
  ch.mur({ de: [12.425, 2.5], a: [13.35, 2.5], mats: B, plinthes: ['N', 'S'], ouvertures: [{ c: 12.89, l: 0.75, h: 2.1 }] });
  ch.porte('x', 2.5, 12.89, { l: 0.75, h: 2.1, modele: 'vitree', etat: 'auto', cote: 'S', tirant: 'court', libre: 1, nom: 'bureau B' });
  // le mur est du bureau B : tableau noir du portail n° 6 jusqu'à y = 0,3, puis le hall, jusqu'au retour y 2,5
  ch.mur({ de: [13.275, -0.4], a: [13.275, 0.3], mats: { E: M.noirMat, W: B } });
  ch.mur({ de: [13.275, 0.3], a: [13.275, 2.575], mats: B, plinthes: ['E', 'W'] });
  // le pilier gris de la salle d'attente (plinthes de bois tout autour)
  const pilier = (x0, y0, x1, y1, mat) => {
    ch.boite(x0, y0, x1, y1, 0, H_DALLE, mat, { collision: true });
    ch.boite(x0 - 0.015, y0 - 0.015, x1 + 0.015, y1 + 0.015, 0, 0.08, M.bois, { ombre: false });
  };
  // (09/10/2026 : le pilier gris est DÉTACHÉ du mur sud — photo 21 : planté dans la salle, le fond visible de part et
  // d'autre ; photo 02 : il frôle le bord gauche de l'image. 11/10 : DY_A, x 10,3-10,9 × y 5,55-6,15. DOUTE : sur la
  // photo 21, ses arêtes, le radiateur et les affichettes du fond ne se calent ensemble, appareil dans la salle, que si
  // le pilier est 0,6-0,7 m plus au sud — ou si les affichettes de la photo 21 ne sont pas celles de la photo 03. Relecture
  // du 11/10 : à la pose de la photo 21 résolue sur ses deux jours dépolis et le bout du mur jaune, (4,94 ; 7,33), h 1,45,
  // cap 110,7, les jours, le mur jaune et le présentoir tombent à leur place, mais le pilier et la borne 0,7 m trop au
  // nord ; or la photo 02 ne laisse le pilier au bord gauche de son cadre que là où il est : gardé, le doute demeure)
  // (Retour de Haythem du 11/10, r02 — la photo 21 en pleine définition, 1 848 x 4 000 — : le pilier recule de 0,6 m vers
  // l'OUEST et de 0,3 m vers le SUD, x 9,71-10,31 × y 5,23-5,83. Vu du bout ouest, sur la photo, il se lève juste à droite
  // de l'angle de la pile, son pied à 4 m de l'appareil et à 0,35 m du mur sud ; dans le jeu, il était 7,5° trop à gauche
  // et 1,5 m trop loin. La photo 02, elle, le voit au bord gauche de son cadre : c'est lui, la bande grise des 15 premiers
  // pixels — son angle nord-ouest, dont le pied est à 1,8 m de l'appareil : (9,71 ; 5,83). Ces deux contraintes réunies
  // donnent cette place ; vu du bout ouest, l'écart à r02 tombe de 7,5° à 2,5° (le jeu le veut d'un rien plus à l'est que
  // la photo 21 : seule la photo 02, dont la pose est sûre — 12 points, 8,6 px —, le place en absolu). La porte de la Si 0.1
  // reste atteignable par sa moitié ouest, entre la borne et lui.)
  // (RELECTURE DU 11/10 : r02 et la photo 02 rejouées ENSEMBLE, chacune à sa pose — la 02 posée sur la porte grise du
  // hall ouest, taille comprise, et sur l'angle ouest du mur sud ; r02 sur ses jours et le fond. Le rayon de r02 vers
  // l'arête nord-ouest du pilier (925 px) et celui de la photo 02 vers la même arête (le bord de sa bande grise, 16 px)
  // se croisent en (8,80 ; 6,02) — et, de là, les deux pieds tombent où les photos les montrent : 2 599 px sur r02 (photo :
  // 2 580), 1 303 sur la 02 (photo : 1 313). Les arêtes sud-ouest (1 075 px) et nord-est (831 px) de r02 donnent le reste :
  // un pilier de 0,86 x 0,43, plus long que large — sa face ouest est juste assez large pour l'A2 qui la remplit sur r02 —,
  // à 0,72 m du mur sud, au milieu de la salle comme sur la VO q_0038-0046. On passe entre lui et le mur vers la porte de
  // la Si 0.1.)
  // (et il est plus SOMBRE que les murs : sur r02, sa face ouest est à 0,78 de la luminance du mur du fond, à la même
  // lumière ; le jeu le rendait à 0,92 — sa peinture grise, rien qu'ici, d'un ton plus bas)
  const grisPilier = M.pilier.clone(); grisPilier.color.multiplyScalar(0.84); grisPilier.name = 'pilier gris (salle d\'attente)';
  // (RETOUR r03 DU 12/10 — la salle élargie, DY_R03 : le pilier GLISSE SUR LE RAYON DE r02, de 0,38 m vers l'est et
  // 0,13 vers le sud, x 9,18-10,04 × y 5,46-5,89. Son arête nord-ouest reste là où r02 la voit — le rayon de la pose
  // de la relecture, (5,28 ; 7,20) vers (8,80 ; 6,02) — et là où la photo 02 refaite la voit : au bord gauche de son
  // cadre, la bande grise des 13 premiers pixels, sous 34° à gauche de l'axe de la salle depuis (10,80 ; 6,99) ; les deux
  // rayons se croisent en (9,18 ; 5,89). En (8,80 ; 6,02), à la pose refaite, il se dressait sur le premier tiers gauche de
  // l'image, devant les jours. Son pied, à 4,11 m de l'appareil de r02 au lieu de 3,71, remonte vers les 2 580 px de la
  // photo (le jeu en mettait 2 599) ; il garde 0,79 m au mur sud, et entre lui et les chaises du nord il reste 1,25 m de
  // passage, et non 1,12 : c'est là que la capture de Haythem se resserrait.)
  pilier(9.18, 5.46, 10.04, 5.89, grisPilier);
  // ---- LE HALL D'ENTRÉE ----
  // (09/10, photo 24 : la porte du mur nord n'est pas en x 17 mais en face de la porte 6 — 1,5 vantail, x 14,70-16,10 ;
  // à l'est, la cloison vitrée cannelée, le photocopieur devant elle côté hall (10/10 : l'angle nord-est est ouvert, VO
  // q_0026-0031). Les vantaux, la cloison, le couloir et l'escalier qui suivent : js/ecole_est.js)
  // (10/10 : à l'ouest de la porte, la pile — js/ecole_rdc_centre.js : le mur part de sa face est)
  ch.mur({ de: [14.6, 7.575], a: [16.25, 7.575], mats: B, plinthes: ['S'], ouvertures: [{ c: 15.4, l: 1.4, h: 2.1 }] });
  // (le mitoyen est du hall, x 19,95 de y -0,4 à 7,65 : peint gris ardoise derrière le comptoir, de la cloison biaise du
  // bureau d'angle au local technique — js/ecole_hall.js, 10/10 ; retour r04 du 12/10)
  // ---- L'ESCALIER : la cage (jusqu'au plafond de l'étage), les portes coupe-feu ----
  // (plan V2 : tout recule de DY_S. Le mur des portes est sur la ligne y 9,0 ; plus de trumeau entre les portes et le C05
  // — l'ouverture, élargie, va jusqu'au jambage, x 4,45, et le C05 commence au mur est de la cage)
  // (intégration du 11/10 : le mur est de la cage sur la ligne 4,525, le mur des portes arrêté à son nu est, x 4,6 — le C05
  // commence au jambage des portes, photo 23)
  // (finitions du 11/10, l'escalier refait sur les photos 20, 06 et r01 — construireEscalier : à l'ouest de l'échiffre,
  // x 1,6-1,975, le mur des portes s'arrête à 2,50, sous la volée 2 ; l'ancien mur ouest de la cage, ligne 1,675, n'est
  // plus — la cage va jusqu'au nu 0,75, au-dessus de la réserve ouest imaginée et de la trémie du -1 ; son mur du fond,
  // celui des affiches, est sur la ligne 13,275)
  ch.mur({ de: [1.6, Y_ESC], a: [ESC.x2e, Y_ESC], h: 2.5, mats: B });
  // (13/10, lot C2 — photo 23 : du chant du vantail fermé au nu ouest du C05, 8 cm — le montant de l'huisserie, puis un
  // about de mur de 5 à 6 cm et sa plinthe ; le jeu en mettait 15, un pan blanc trois fois plus large qui cachait la
  // moitié de la porte bleue. Le mur est de la cage, sous la dalle, n'est qu'une cloison de 8 cm, du nu 4,45 de la volée 1
  // au nu 4,53 du couloir ; au-dessus de la dalle, il garde sa ligne.)
  ch.mur({ de: [ESC.x2e, Y_ESC], a: [C05.xO, Y_ESC], mats: B, plinthes: ['S', 'N'], ouvertures: [{ c: 3.45, l: 2.0, h: 2.1 }] });
  ch.mur({ de: [(ESC.x1e + C05.xO) / 2, 13.6 + DY_S], a: [(ESC.x1e + C05.xO) / 2, 18.75 + DY_S], ep: C05.xO - ESC.x1e, h: H_DALLE, mats: B, plinthes: ['E'] });
  ch.mur({ de: [4.525, 13.6 + DY_S], a: [4.525, 18.75 + DY_S], base: H_DALLE, h: H_CAGE, mats: B });
  // le mur ouest de la cage (ligne 0,675) : du mur sud du palier du 1er au mur du fond ; au-dessus de la trémie du -1
  // (y < 10,25), il part de 1,75 — au-dessus du rampant de la volée de tôle, sous la volée 2
  ch.mur({ de: [0.675, 12.45 + DY_S], a: [0.675, 10.25], base: 1.75, h: H_CAGE, mats: B });
  ch.mur({ de: [0.675, 10.25], a: [0.675, ESC.yFond + 0.075], h: H_CAGE, mats: B });
  // le mur du fond, celui des affiches (ligne 13,275 : photo 20) ; derrière lui, jusqu'à l'ancien mur nord, un vide fermé
  ch.mur({ de: [0.6, ESC.yFond + 0.075], a: [4.6, ESC.yFond + 0.075], h: H_CAGE, mats: B });
  // l'ancien mur nord de la cage (ligne y 14,0 ; derrière, la salle David Clark : sa face nord est dans la salle — 09/10)
  ch.mur({ de: [1.6, 18.675 + DY_S], a: [4.75, 18.675 + DY_S], h: H_CAGE, mats: B, plinthes: ['S', 'N'] });
  // (V2, 11/10 : le mur du fond du C05 n'est plus celui de la cage — il est 3,6 m après le mur des portes de l'escalier,
  // photo 23 ; derrière lui, l'entrée de la salle David Clark. La cage, x 1,6-4,675, a son mur nord à elle. Il part de
  // x 4,6 : noyé dans le mur de la cage tel que le plan le place, il ferme encore l'angle si ce mur recule à l'ouest)
  // (13/10, lot C2 — photo 23 à sa pose refaite : son nu sud en 12,71, 11 cm plus loin ; l'huisserie de la porte bleue de
  // x 4,70 à 5,61, jusqu'à 2,40 sous un plafond à 2,45 — construirePorteFond)
  ch.mur({ de: [C05.xO, C05.yFond + 0.075], a: [C05.xM, C05.yFond + 0.075], mats: B, plinthes: ['S', 'N'], ouvertures: [{ c: (PF.x0 + PF.x1) / 2, l: PF.x1 - PF.x0, h: PF.hT }] });
  // au 1er étage : le mur sud du palier (ligne y 7,85, avec sa double porte coupe-feu) et ses retours
  // (finitions du 11/10 : jusqu'au mur ouest de la cage, ligne 0,675 — l'arrivée de la volée 2 est à l'ouest de la porte)
  ch.mur({ de: [0.6, 12.525 + DY_S], a: [4.75, 12.525 + DY_S], base: H_DALLE, h: H_CAGE, mats: B, ouvertures: [{ c: 3.5, l: 1.8, bas: ESC.hP, h: ESC.hP + 2.1 }] });
  ch.mur({ de: [4.525, 12.45 + DY_S], a: [4.525, 13.6 + DY_S], base: H_DALLE, h: H_CAGE, mats: B });
  // (ouverte à demeure, ses deux vantaux rabattus côté étage, comme celle du hall ouest : le 1er étage, js/ecole_etage1.js)
  ch.porte('x', 12.525 + DY_S, 3.5, { l: 1.8, h: 2.1, base: ESC.hP, modele: 'grise2', feu: true, etat: 'ouverte', ouverts: [true, true], angle: 1.6, cote: 'S', notices: 1, nom: '1er étage' });
  // LES PORTES COUPE-FEU DE L'ESCALIER (photos 04, 06, 20) : deux vantaux de 1,0 m, x 2,45-4,45 (plan V2 ; le jeu avait
  // 2 x 0,90 à partir de x 2,6). Le vantail ouest ouvert à demeure vers le hall, À PLAT contre l'avancée nord, l'affiche
  // jaune du tri derrière lui (photos 06, 20 : x 2,45-2,50, y 8,0-9,0 ; il était décollé de 25 cm — à 88°, il frôle
  // l'affiche sans la traverser) ; l'est fermé, ses deux A4 l'un au-dessus de l'autre (js/ecole_mobilier.js) ; une
  // huisserie, et le rail du ferme-porte sur toute la largeur, côté hall (photos 06, 20 : la barre grise sous le soffite).
  // (Leur fente vitrée est la longue, de 0,6 à 1,85 — photos 06 et 20 : elle descend aux deux tiers du vantail.)
  ch.porte('x', 13.675 + DY_S, 3.45, { l: 2.0, h: 2.1, modele: 'grise2', feu: true, oculus: 'long', etat: 'ouverte', ouverts: [true, false], angle: 1.53, cote: 'S', notices: 0, noticesD: 0, nom: 'escalier' });
  // (relecture du 11/10 : le rail est d'aluminium gris CLAIR, mat — photos 04 et 20 ; le métal du ferme-porte, sous la
  // carte d'environnement du hall, le rendait noir)
  ch.boite(2.45, 8.875, 4.45, 8.925, 2.15, 2.21, new THREE.MeshStandardMaterial({ color: 0xbfc3c5, roughness: 0.45, metalness: 0.15 }), { ombre: false });
}

// LA PORTE DU FOND DE C05 (photos 05, 23) : ce n'est PAS une issue de secours (09/10) — c'est celle d'une salle
// informatique, « Salle David Clark — Si 0.2 » (sa plaque à droite de la porte, js/ecole_pieces.js) ; sur la photo 23 un
// étudiant en sort en la poussant : elle s'ouvre VERS LE COULOIR, gonds à l'ouest. Huisserie blanche, vantail de verre
// dépoli bleu (le jour des fenêtres de la salle le traverse : il « s'allume » sur la photo 05), béquille inox à droite,
// pastille rouge en haut ; au-dessus, l'imposte dépolie, plus claire, jusque sous le plafond. Plus de bloc de sortie :
// ni la photo 05 ni la 23 n'en montrent. Automatique, toujours ouverte du côté du couloir (`libre`).
// (V2, 11/10 : la ligne 18,675 devient la ligne 12,675 — 3,675 m après le mur des portes de l'escalier, photo 23 ;
// la porte et son imposte ne changent pas)
// (13/10, lot C2 — photo 23 à sa pose refaite, f 1 600 : le mur du fond en 12,71 ; l'huisserie de x 4,70 — photo 05 : à
// 0,17 de l'angle — à 5,61 ; la traverse de 2,05 à 2,10, l'imposte jusqu'à 2,355, le haut du cadre à 2,40, 5 cm sous
// le plafond ; le vantail, vu par sa tranche et son chant sur la photo, est plus haut que les 2,00 du jeu)
function construirePorteFond(ch) {
  const { M, C } = ch, yL = C05.yFond + 0.075, y0 = yL - 0.075, y1 = yL + 0.075, { x0, x1, hv, hT } = PF, c = 0.045;
  // l'huisserie sur toute l'épaisseur du mur (elle déborde d'un centimètre), la traverse sous l'imposte, le linteau
  ch.boite(x0, y0 - 0.01, x0 + c, y1 + 0.01, 0, hT, M.alu); ch.boite(x1 - c, y0 - 0.01, x1, y1 + 0.01, 0, hT, M.alu);
  ch.boite(x0, y0 - 0.01, x1, y1 + 0.01, hv, hv + 0.05, M.alu); ch.boite(x0, y0 - 0.01, x1, y1 + 0.01, hT - c, hT, M.alu);
  // (13/10, lot C2 — photo 05 : l'imposte est un gris sombre, 68/69/70, plus sombre que le vitrage et sans bleu)
  const imposte = new THREE.MeshStandardMaterial({ color: 0x505c6e, roughness: 0.45 }); imposte.name = 'imposte dépolie de la porte bleue';
  ch.boite(x0 + c, yL - 0.006, x1 - c, yL + 0.006, hv + 0.05, hT - c, imposte, { ombre: false });
  C.ajouterBoite(x0, -y1, x1, -y0, { y0: hv, y1: hT, vitre: true });
  ch.porte('x', yL, (x0 + x1) / 2, { l: x1 - x0 - 2 * c, h: hv, modele: 'bleue', etat: 'auto', cote: 'S', huisserie: false, libre: 1, nom: 'salle David Clark' });
}

// L'ACCUEIL ET LE HALL D'ENTRÉE (VO 6,4-7,4 s et 92,5-95,8 s, photos 03, 16, 24 ; 10/10 ; retour r04 de Haythem du 12/10,
// sa photo de l'accueil) : le comptoir n'est pas le long de la façade mais NORD-SUD, face à l'ouest (x 16,83-17,53, y
// 1,1-3,6), terminé au nord par le décroché PMR et son caisson à tablette haute ; derrière lui l'open-space du personnel,
// le mitoyen gris ardoise et ses deux affiches, la cloison biaise du bureau d'angle ; au fond, le local technique aux
// portes de bois clair, le pilier et son écran, le panneau des formations, le portant des goodies ; l'angle nord-est
// (photocopieur, étiquettes « INFORMATIQUE », meuble noir) ; la retombée et les lignes lumineuses du plafond :
// js/ecole_hall.js.
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
  // (lot 5, 11/10 : les blocs cousus des niveaux coupés par zones de l'école, à leur couture — js/ecole_visibilite.js)
  poserCoupe(couperParZones);
  // (une copie du carrelage pour les paliers : sans l'ombre ni la lumière cuites du rez-de-chaussée)
  // (une rugosité à peine différente : l'optimisation du décor ne doit pas la confondre avec celui du rez-de-chaussée)
  M.solEtage = M.sol.clone(); M.solEtage.roughness = 0.94;
  scene.background = new THREE.Color(0xdeeaf6);         // le ciel couvert, vu par la porte 6 et le passage
  scene.fog = null;

  // ---- les sols du rez-de-chaussée ----
  // (09/10 : coupé au droit du palier et de la trémie de l'escalier du sous-sol — le palier a son sol de béton peint,
  // js/ecole_soussol.js ; plan V2 : la trémie suit la porte grise, x -0,3-1,6, y 4,95-10,175 ; le passage, arrêté en
  // y 4,05, a son carrelage à lui — solP)
  const RN = [
    // (intégration du 11/10 : la réserve ouest, au nord de la trémie, arrêtée au mur sud de la Si 0.2 ; le hall ouest et la
    // bande x 4,9-5,3 arrêtés au mur des portes de l'escalier, Y_ESC — au-delà, les rectangles du fond)
    [-0.3, -0.4, 1.6, 4.95, 'ns', 1.75, 0], [-0.3, 10.175, 1.6, 13.925, 'ns', 1.75, 0],
    [1.6, 4.05, 4.9, Y_ESC, 'ns', 1.75, 0], [4.5, -0.4, 4.9, 4.05, 'ns', 1.75, 0], [4.9, -0.4, 5.3, Y_ESC, 'ns', 1.75, 0],
    // (11/10 : la salle d'attente, ses dalles posées est-ouest, recule de DY_A — y 4,8-7,875, jusqu'à x 13,5 : sous la
    // pile, et devant elle l'entrée du C01 ; au sud, la Si 0.1, le bureau B et le passage de la pile ; au nord, le fond)
    [5.3, -0.4, 13.5, ATT.ys, 'ns', 1.75, 0], [5.3, ATT.ys, 13.5, ATT.yn, 'ew', 5.8, ATT.ys],
    // (le hall ; au nord, le lino du couloir est et de l'escalier est remplace le carrelage : js/ecole_est.js)
    // (plan V2, lot H, 11/10 : la partie est s'arrête en y 13,8 — IGN, gabarit_reel.md ; plus de carrelage au nord de
    // y 13,5 : le local de 0,9 m et le mur du fond, js/ecole_est.js fondPartieEst)
    [13.5, -0.4, 20.1, 7.575, 'ns', 1.75, 0], [13.5, 7.575, 14.6, 13.5, 'ns', 1.75, 0], [14.6, 12.45, 20.1, 13.5, 'ns', 1.75, 0],
    // (V2, 11/10 — le fond, au nord du mur des portes de l'escalier (Y_ESC) et du mur safran (y 7,875) : la cage, le C05 et
    // l'entrée de la salle David Clark, les toilettes, le local, la PMR, le C01, puis la salle David Clark. Rien au-delà
    // de y 21,075 : le bâtiment s'arrête à 23,7 (IGN) et les locaux fermés du fond n'ont pas de sol ; la réserve ouest non
    // plus. Les rectangles des autres lots s'arrêtent à ces lignes. — r06, 13/10 : la salle David Clark va jusqu'au fond,
    // sur sa moquette ; il n'y a plus de carrelage au nord de 14,15 à l'ouest de x 8,925.)
    // (13/10, lot C2 — le carrelage est en carreaux de 60 x 60, js/ecole_matieres.js ; le C05 et le C01 ont leur
    // calepinage, relevé sur les photos 23 et 01 redressées. C05 : les joints en long en x 4,56 / 5,16 / 5,76 — un filet
    // de 3 cm contre la cage, une coupe de 16 cm contre le mur est —, il se prolonge dans l'entrée de la salle David
    // Clark ; il part du joint en travers du seuil, y 9,0. C01 : la photo 01 n'y montre que DEUX joints en long, en x 12,18
    // et 12,50 — une bande de 0,32 entre deux rangs plus larges —, et les joints en travers tous les 0,60 depuis y 9,88.)
    [1.6, Y_ESC, ESC.x1e, 14.15, 'ns', 1.75, 0], [ESC.x1e, Y_ESC, C05.xM, 14.15, 'ns', 4.558, 0],
    [5.3, 7.875, C05.xM, Y_ESC, 'ns', 1.75, 0], [C05.xM, 7.875, 11.7, 14.15, 'ns', 1.75, 0], [8.925, 14.15, 11.7, 14.55, 'ns', 1.75, 0],
    [11.7, 7.875, 12.497, 14.55, 'ns', 12.179, 0.279], [12.497, 7.875, 13.5, 14.55, 'ns', 12.497, 0.279],
    // (r06, 13/10 : la salle David Clark a sa moquette, js/ecole_pieces.js — le carrelage s'arrête à son seuil)
  ];
  const sol = new THREE.Mesh(geoSol(RN), M.sol); sol.receiveShadow = true; sol.name = 'carrelage'; nePasFusionner(sol);
  scene.add(sol);
  const solP = new THREE.Mesh(geoSol([[1.6, -0.4, 4.5, 4.05, 'droit', 1.75, 0]]), M.solPassage); solP.receiveShadow = true; nePasFusionner(solP);
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
  // (plan V2 : contre l'angle de l'avancée nord, y 7,22 ; photo 06 rejouée : de 0,12 à 1,38)
  radiateur(ch, 2.17, 7.22, 'S', 0.45, 0.12, 1.38);
  // (relecture du 11/10, photo 06 : sa face avant est un panneau en retrait, gris clair, dans un cadre blanc de 3 cm — tout
  // blanc, sous le hublot du hall, il disparaissait dans le mur)
  ch.boite(1.975, 7.135, 2.365, 7.139, 0.15, 1.35, new THREE.MeshStandardMaterial({ color: 0xd3d6d8, roughness: 0.5 }), { ombre: false });
  // le mur du fond de la salle d'attente, la face ouest de la pile : son radiateur, à côté du présentoir (photo 21) et
  // sous le haut-parleur et l'affichette WIFI (photo 03), son bout à 0,3 m de l'angle sud-ouest — l'angle au-delà duquel
  // la photo 03 voit le hall (10/10). (11/10, plan V2 : c'est LE MÊME radiateur sur les deux photos ; celui du mur x 13,5,
  // en y 10,5, était un doublon)
  // (retour de Haythem du 11/10, r02 — « juste à droite du présentoir, un RADIATEUR blanc vertical, à panneau » : vu du
  // bout ouest, sur la photo 21 en pleine définition, il fait 0,5 de large sur 1,25 de haut — plus haut que large, son
  // sommet sous les affichettes, comme sur la photo 03 — et ses bords tombent en y 5,2 et 5,7 : 0,13 plus au nord)
  radiateur(ch, 13.3, 5.45, 'W', 0.5, 0.12, 1.25);
  // la caméra de surveillance du hall ouest et son haut-parleur (au mur des portes, à droite du jambage, sous le plafond
  // à 2,30) ; le déclencheur manuel rouge (au bout ouest du mur sud de la salle d'attente : DY_A)
  // (Relecture du 11/10 : le dôme est en (4,75 ; 7,75), contre la retombée du plafond de la salle d'attente, pas devant
  // les portes de l'escalier — photo 04 rejouée à sa pose, (6,53 ; 6,81) h 1,41 cap −49, à 5 px sur les deux vantaux ; le
  // diffuseur d'alarme y retombe à 4 cm de sa place ; la photo 20, prise devant les portes, ne le voit pas)
  // (13/10, lot C2 : en (5,02 ; 7,58), contre la retombée, qui est en x 5,15 — photo 04 rejouée sur les portes de l'escalier)
  const dome = maille(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.boitier, 5.02, 2.3, -7.58, 0, ch.decor, { ombre: false });
  dome.userData.horsAOSol = true;
  // (13/10, lot C2 : plus de boîtier blanc en haut du jambage des portes de l'escalier, côté C05 — la photo 23, prise à
  // 1,7 m de lui, montre l'about du mur nu jusqu'au plafond, au-dessus du bras du ferme-porte ; le diffuseur est sur la
  // retombée, js/ecole_mobilier.js)
  ch.boite(4.9, ATT.ys + 0.075, 5.0, ATT.ys + 0.11, 1.25, 1.35, M.rougeEtiquette, { ombre: false });   // (sur le mur sud : DY_A)
  // (11/10, r02 : vu de près, un cube rouge plein ; c'est un boîtier à membrane blanche au milieu de sa face)
  ch.boite(4.925, ATT.ys + 0.11, 4.975, ATT.ys + 0.112, 1.275, 1.325, M.blanc, { ombre: false });

  // ---- les plafonds ----
  ch.plafond(1.75, 0, 4.425, 4.05, 2.6, 'platre');                   // le passage
  // le hall ouest (plan V2 : plâtre à 2,30 — photo 06, 2,25-2,30 ; le jeu avait 2,40) : la gorge derrière la paroi
  // vitrée, le hall jusqu'aux dalles de la salle d'attente (x 5,3), et devant le C05, au nord du mur safran
  // (Relecture du 11/10 : contre la paroi vitrée, le plafond de la gorge REMONTE en pente jusqu'au haut du bandeau,
  // 2,60. Photo 06 rejouée à sa pose : l'arête du haut de la pile, rapportée sur son nu x 2,45, passe de 2,57 en y 4,16 à
  // 2,45 en 4,42, 2,35 en 4,64 et 2,24 en 4,91 — une droite, pas un ressaut, et le bas de la même photo tombe juste,
  // ce n'est pas la déformation de l'objectif ; photo 07 rejouée : le bloc de sortie est au-dessus de la traverse
  // haute, de 2,33 à 2,45. Le rampant va de y 4,075 (2,60) à y 4,77 (2,30), sur toute la largeur de la gorge.)
  {
    const ya = 4.075, yb = 4.77, ha = 2.6, hb = 2.3, xa = 2.45, xb = 4.5;
    const g = new THREE.BufferGeometry(), L = Math.hypot(yb - ya, ha - hb);
    g.setAttribute('position', new THREE.Float32BufferAttribute([xa, ha, -ya, xb, ha, -ya, xb, hb, -yb, xa, hb, -yb], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([xa, 0, xb, 0, xb, L, xa, L], 2));
    g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
    const m = maille(g, M.platre, 0, 0, 0, 0, ch.decor, { ombre: false }); m.userData.horsAOSol = true;
    ch.C.plafond(1.75, -yb, 4.5, -4.05, hb);
    ch.plafond(1.75, yb, 4.5, 4.875, 2.3, 'platre', { retombees: false });
  }
  // (Relecture du 11/10, photo 04 rejouée : le plafond bas du hall s'arrête à la retombée, en x 4,85, et ne passe à l'est
  // qu'au nord de y 8,05, devant le C05 ; entre les deux, le plafond de dalles de 60 de la salle d'attente, à 2,60 —
  // ses joints calés sur ceux des dalles de la salle, qui partent de x 5,3 et de y 7,8 (plan V2, lot C) ; au nord de
  // 8,05, le plafond bas les cache)
  // (finitions du 11/10 : coupé en y 8,3 — au nord, sans retombées : celles de l'ouest et du nord, du plafond à la dalle,
  // passaient au travers de la volée 2 de l'escalier principal, au-dessus de ce plafond ; construireEscalier)
  ch.plafond(1.75, 4.875, 4.85, 8.3, 2.3, 'platre');
  ch.plafond(1.75, 8.3, 4.85, 8.925, 2.3, 'platre', { retombees: false });
  // (13/10, lot C2 — devant le C05 : la photo 23, prise de (4,41 ; 7,11), ne voit QUE le plafond bas jusqu'au bord haut
  // de l'image, qui tombe en (5,18 ; 7,76) et (5,02 ; 7,83) — au jeu, un pan du plafond de dalles, à 2,60, entrait dans
  // le coin de l'image ; la photo 05 rejouée met l'arête est-ouest de la retombée vers y 7,9, au bout du pilier jaune :
  // elle est dans le plan de la face sud du mur safran, y 7,80, et non en 8,05. Jusqu'au nu est du couloir, 5,92.)
  ch.plafond(4.85, 7.8, C05.xE, 8.925, C05.hBas, 'platre');
  // (et SA RETOMBÉE NORD-SUD, devant la salle d'attente : les photos 05 et 04, rejouées chacune à sa pose, mettent toutes
  // deux son arête en x 5,15 — de y 7,03 à l'angle, où elle tourne vers le mur jaune —, et le dôme de la caméra en
  // (5,02 ; 7,58), contre elle ; le jeu l'arrêtait en x 4,85. Une bande de plafond bas de 30 cm de plus, du mur des jours
  // à l'angle ; le plafond de dalles de la salle, à 2,60, passe au-dessus.)
  ch.plafond(4.85, ATT.ys + EP / 2, 5.15, 7.8, C05.hBas, 'platre');
  // (r03, 12/10 : le mur sud de la salle recule de 0,20 — DY_R03 — ; la bande qu'il libère, x 4,5-4,85 × y 4,675-4,875,
  // prend le plafond bas du hall et sa retombée en x 4,85 continue jusqu'au mur ; les dalles de la salle partent du mur)
  ch.plafond(4.5, ATT.ys + EP / 2, 4.85, 4.875, 2.3, 'platre');
  ch.plafond(4.7, ATT.ys, 5.3, 8.4, 2.6, 'dalles', { retombees: false });
  // C05 : une RETOMBÉE — le fond du couloir est plus bas (2,30), l'imposte de la porte bleue vient juste sous son
  // plafond (photos 05 et 23 : le premier hublot avant le ressaut, le second après ; 09/10). (V2, 11/10 : de la porte de
  // l'escalier à la porte bleue ; la photo 23 recalée — pose de rdc_ouest, f 1 500 — met le bas de la retombée à 0,8 m
  // du mur des portes de l'escalier, là où elle rejoint le mur est, et non au tiers. Côté ouest, le plafond part du nu de
  // la cage, x 4,6 : la photo montre le mur ouest du C05 juste derrière l'huisserie de la porte de l'escalier.
  // Relecture du 11/10 : rejouée à la pose de la photo 23, la retombée tombe sur la sienne et le hublot de ce premier
  // plafond aussi, à 2,40 ; mais le hall ouest passe à 2,30 — au seuil du C05, un ressaut de 10 cm que ni la photo 23 ni
  // la 05 ne montrent : l'un des deux plafonds est à reprendre quand le hall et le C05 seront réunis)
  // (13/10, lot C2 — C'ÉTAIT L'INVERSE. La photo 23 à sa pose refaite, C05 en tête du fichier : le plafond BAS du hall
  // entre dans le couloir jusqu'à une arête franche en y 9,57 — une ligne est-ouest nette, du jambage au mur est, claire
  // devant, sombre derrière —, et au-delà le plafond est plus HAUT, 2,45 tout le long du mur est jusqu'à l'angle du fond ;
  // la photo 05 le voit de même : l'arête, puis une bande de plafond plus claire et le second hublot dessous. L'imposte
  // de la porte bleue s'arrête 5 cm sous ce plafond haut.)
  ch.plafond(C05.xO, Y_ESC - 0.075, C05.xE, C05.yRes, C05.hBas, 'platre');
  ch.plafond(C05.xO, C05.yRes, C05.xE, C05.yFond, C05.hHaut, 'platre', { retombees: false });
  // la salle d'attente : les plateaux perforés, sauf au bout ouest, devant le couloir C05, où ce sont des dalles lisses
  // de 60 x 60 sur ossature (photos 04, 05 : au-dessus du photographe ; 09/10). (11/10 : DY_A ; les plateaux vont jusqu'à
  // x 13,5 — le bout est passe dans la pile, et le coin x 13,3-13,5 au nord de la pile, devant le C01, reste couvert)
  // (Retour de Haythem du 11/10, r02 — le plafond : le long du mur sud, sur la photo 21 en pleine définition comme sur la
  // photo 02, les plateaux perforés laissent place à une BANDE de dalles lisses, large d'une dalle, un rien plus basse — un
  // ressaut de 2 cm, le trait clair au-dessus du jour c 8,35 —, où sont pris les spots de la rangée sud)
  // (r02 encore : vu du bout ouest, les plateaux perforés couvrent le plafond jusqu'au-dessus de l'appareil ; les dalles
  // lisses de la photo 04 ne font qu'une rangée, x 5,3-5,9, au droit du pilier jaune. Et ce plafond est plus sombre et
  // plus chaud que les murs — 0,6 de leur luminance, un beige où le rouge passe le bleu de moitié, quand le jeu le
  // rendait aussi blanc qu'eux : une copie des plateaux, rien qu'ici, d'un ton chaud un peu éteint)
  const chaudPlafond = (m) => { const c = m.material.clone(); c.color.multiply(new THREE.Color(0.97, 0.93, 0.84)); c.emissiveIntensity *= 0.8; m.material = c; return m; };
  // (RELECTURE DU 11/10 — r02 et la photo 02 agrandies, leurs joints rétroprojetés au plafond : ce ne sont pas des plateaux
  // de 60 x 120 en damier, mais des LAMES perforées de 30 cm, posées en travers de la salle, du sud au nord, d'un seul tenant
  // de la bande lisse du mur sud jusqu'à un joint en long, à y 7,42 — à 0,38 m du mur safran, le même sur les deux photos —,
  // au-delà duquel une rangée de lames courtes borde le mur jaune. Vu du bout ouest, on lit donc une suite de longues bandes
  // claires et serrées, presque parallèles, et non la grille de grands carreaux que le jeu dessinait. Les mêmes trous, la
  // même bordure lisse, le même joint creux que les plateaux : js/ecole_matieres.js.)
  const Y_LONG = 7.425;
  const lames = (L) => {
    const W = 768, H = Math.round(768 * L / 1.2);
    return canvasTex(W, H, (g, w, h) => {
      // (les trous, sur r02 agrandie : des TIRETS dans le fil de la lame, 9 x 4 mm, en files serrées ; plus pâles que ceux
      // des plateaux — la lame paraît beige, pas grise ; la bordure lisse, large de 3 cm, fait entre deux lames la bande
      // claire de 6 cm qu'on suit d'un mur à l'autre)
      const mm = w / 1200, pas = 300 * mm, joint = Math.max(2, 5 * mm), bl = 30 * mm, bb = 50 * mm;
      g.fillStyle = '#ece9e2'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        const x0 = i * pas;
        g.fillStyle = 'rgba(205,200,190,0.3)'; g.fillRect(x0 + bl, bb, pas - 2 * bl, h - 2 * bb);
        g.fillStyle = 'rgba(78,72,64,0.5)';
        const pu = 10 * mm, pv = 14 * mm, cu = Math.max(1, 4 * mm), cv = Math.max(2, 9 * mm);
        for (let y = bb + pv / 2; y < h - bb - cv / 2; y += pv) for (let x = x0 + bl + pu / 2; x < x0 + pas - bl - cu / 2; x += pu) g.fillRect(x - cu / 2, y - cv / 2, cu, cv);
        g.fillStyle = 'rgba(255,254,250,0.55)';
        g.fillRect(x0 + joint, 0, bl * 0.7, h); g.fillRect(x0 + pas - bl * 0.7, 0, bl * 0.7 - joint / 2, h);
        g.fillRect(x0, joint, pas, bb * 0.5); g.fillRect(x0, h - bb * 0.5, pas, bb * 0.5 - joint / 2);
      }
      g.fillStyle = '#7c776e';
      for (let i = 0; i <= 4; i++) g.fillRect(i * pas - joint / 2, 0, joint, h);
      g.fillRect(0, -joint / 2, w, joint); g.fillRect(0, h - joint / 2, w, joint);
      g.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i <= 4; i++) g.fillRect(i * pas - joint / 2 - Math.max(1, 2 * mm), 0, Math.max(1, 2 * mm), h);
    }, [1 / 1.2, 1 / L], false, 8);
  };
  const enLames = (m, L) => {
    const c = m.material; c.map = c.emissiveMap = lames(L); c.normalMap = null; c.name = 'plafond en lames perforées (salle d\'attente)'; c.needsUpdate = true; return m;
  };
  enLames(chaudPlafond(ch.plafond(5.9, ATT.ys + 0.675, 13.5, Y_LONG, 2.6, 'plateaux')), Y_LONG - ATT.ys - 0.675);
  enLames(chaudPlafond(ch.plafond(5.9, Y_LONG, 13.5, ATT.yn - 0.075, 2.6, 'plateaux', { retombees: false })), ATT.yn - 0.075 - Y_LONG);
  chaudPlafond(ch.plafond(5.9, ATT.ys, 13.5, ATT.ys + 0.675, 2.58, 'dalles'));
  ch.plafond(5.3, ATT.ys, 5.9, ATT.yn - 0.075, 2.6, 'dalles', { retombees: false });
  // (13/10, lot C2 — photo 01 à sa pose refaite : 2,35 et non 2,45 — la grille et la trappe du mur est s'arrêtent à 2,31
  // juste dessous, et son arête, vue du fond du couloir, tombe au droit du mur safran ; jusqu'au nu est, x 13,30)
  // (et plus sombre que les murs : 146/130/107 sur la photo, près de l'appareil, quand ils font 179/167/143 — le jeu le
  // rendait presque aussi clair qu'eux, 172/160/144)
  { const pc = chaudPlafond(ch.plafond(C01.xO, 7.8, C01.xE, 14.4, C01.hP, 'platre')); pc.material.color.multiplyScalar(0.86); pc.material.name = 'plafond en plâtre (C01)'; }   // C01 (V2 : de l'entrée, y 7,8, au fond)
  // le hall d'entrée (retour r04 du 12/10 : des plateaux perforés de 0,6 x 1,2, leurs joints nord-sud serrés — r04 au-dessus
  // de l'accueil ; photo 03 au-dessus de l'entrée —, et non du plâtre lisse ; la retombée est-ouest : js/ecole_hall.js).
  // Plus clairs que ceux des salles : sur r04, près des fenêtres, le plafond est la surface la plus blanche (174 sur 255,
  // le comptoir 138) ; au jeu, le perforé sous les seuls spots tombait à 121, le comptoir à 160.
  {
    const p = ch.plafond(13.35, 0.3, 19.8, 7.5, 2.6, 'plateaux');
    p.material = M.plateaux.clone(); p.material.emissiveIntensity = 0.5; p.material.name = 'plafond en plateaux perforés (hall)';
    // (relecture du 12/10, r04 rejouée : au-dessus du mur ardoise, 174, 176, 177 sur la photo — un blanc neutre — contre
    // 170, 161, 149 au jeu, et un quadrillage marqué là où la photo ne montre que des filets pâles : une lueur UNIE, d'un
    // blanc froid, qui relève d'autant les joints et le champ perforé — le contraste baisse, le dessin reste)
    p.material.emissive = new THREE.Color(0xe6e8ea); p.material.emissiveMap = null; p.material.emissiveIntensity = 0.3;
  }
  // le bureau B (visitable : js/ecole_pieces.js) et le passage au sud-ouest de la pile, d'un seul tenant (plateaux à 2,60)
  ch.plafond(9.9, 0, 13.35, ATT.ys, 2.6, 'plateaux');
  ch.plafond(4.5, 0, 9.9, ATT.ys, 2.6, 'plateaux');                   // la Si 0.1, l'ex-salle A (visitable : js/ecole_pieces.js)

  // ---- les luminaires (et les lampes : ce sont les mêmes) ----
  // (plan V2 : les deux réglettes au-dessus des lièges, vers la rue — photos 07, 10. Relecture du 11/10 : elles partent
  // de la façade — photo 10, leurs bouts touchent le linteau — et vont jusqu'à y ≈ 3,0, photo 07 rejouée ; deux tubes
  // bout à bout, photo 19 : la jonction au milieu. Une lampe chacune, comme avant.)
  for (const [x, s] of [[1.75, 1], [4.425, -1]]) {
    ch.tube(x, 0.35, 2.95, 2.35, s, 'passage');
    const xj = x + s * 0.06;
    ch.boite(xj - 0.025, 1.62, xj + 0.025, 1.68, 2.3, 2.37, M.boitier, { ombre: false });
  }
  // le bloc de sortie près de la rue, côté passage : sous le plafond, au-dessus de l'ouverture — de la rue, le linteau
  // le cache et l'on ne voit que le boîtier noir (photo 10), du hall il est vert (photo 07) ; et à côté de lui, à l'est,
  // le hublot rond du plafond, allumé (photo 07)
  ch.sortie(3.3, 0.2, 2.52, 'N', { simple: true });
  ch.opale(3.6, 0.3, 2.6, 'passage', { r: 0.16 });
  // (09/10 : plus de hublot en (5,2 ; 12,9), à l'entrée du C05 — ni la photo 05 ni la photo 23 n'en montrent : les deux
  // qu'on y voit sont ceux du C05 ; plan V2 : les deux du hall, l'un devant la porte grise, l'autre devant l'escalier)
  // (Relecture du 11/10 : UN SEUL hublot dans le hall, en (3,7 ; 6,5), entre la porte grise et l'extincteur — photo 02
  // rejouée à sa pose, (10,52 ; 5,62) h 1,45 cap −87, à 3-6 px : y 6,48 ; la photo 06 ne le voit pas, il est donc à
  // l'est de x 3,5 ; la photo 19 le montre au fond, au milieu. Devant les portes de l'escalier, il n'y en a pas : ni la
  // photo 04 ni la photo 20, qui voient ce plafond, n'en montrent.)
  ch.opale(3.7, 6.5, 2.3, 'hallO');
  // (les deux hublots du C05, photos 23 et 05 : le premier avant la retombée, le second passé la retombée, sous le
  // plafond bas — Ø 38 cm ; 09/10. V2, 11/10 : relevés sur la photo 23 recalée, à 0,4 et 2,0 m du mur des portes de
  // l'escalier — le premier un peu à l'est de l'axe, le second dans l'axe de la porte bleue. Relecture du 11/10 : rejoué
  // à la pose de la photo 23, le jeu les met au même x qu'elle ; la photo 05, floue et à une pose moins sûre — 15 px
  // d'écart —, les verrait plutôt dans l'axe du couloir, x 5,36 : c'est la photo 23 qui est gardée)
  // (13/10, lot C2 — photo 23 à sa pose refaite : le premier en (5,34 ; 8,95), à l'aplomb du mur des portes de l'escalier,
  // sous le plafond bas ; le second en (5,33 ; 11,44), sous le plafond haut, devant la porte des hommes — et non en y 9,4
  // et 11,0. Leur verre fait 26 à 28 cm, cerclé de métal satiné : Ø 36, ils paraissaient d'un quart trop gros.)
  // (leur lumière : chaude — sur la photo 23, les murs blancs sortent crème, le bleu à 70 % du rouge ; au jeu, 87 %)
  const chaudC05 = new THREE.Color(0xffd6a6);
  ch.opale(5.34, 8.95, C05.hBas, 'c05', { r: 0.14, couleur: chaudC05 }); ch.opale(5.33, 11.44, C05.hHaut, 'c05', { r: 0.14, couleur: chaudC05 });
  // (la salle d'attente : DY_A ; les deux spots du « cou » disparaissent avec lui, celui du passage de la pile est posé
  // avec elle, js/ecole_rdc_centre.js)
  // (Retour de Haythem du 11/10, r02 — « l'éclairage : plus chaud sur la photo » ; les spots relevés sur les photos 21 et
  // 02 rétroprojetés au plafond : une rangée SUD dans la bande de dalles lisses, à 0,3 m du mur — x 5,5 / 7,15 / 8,8 /
  // 10,45, au pas de la façade, 1,65 —, et une rangée nord vers y 6,8 — x 5,35 / 8,7 / 12,05. Sur la photo 21, aucun spot
  // au-dessus des chaises entre 6 et 8 m : le jeu en avait un en (7,8 ; 6,9). La lumière : un blanc chaud de 2 900 K.)
  const chaudAtt = new THREE.Color(0xffd5a3);
  // (retour r02 du 11/10 : l'ANTICHAMBRE n'a pas de spot à elle — par l'ouverture, r02 ne montre que ceux du hall, à 12-18 m,
  // et l'ouverture est SOMBRE : elle prend la lumière de la rangée sud de la salle, x 10,45, et du spot du passage de la
  // pile, js/ecole_rdc_centre.js) (RELECTURE DU 11/10 : r02 agrandie montre UN spot tout en haut de l'ouverture, contre
  // l'arête du pilier, 280 px au-dessus de l'horizon — rétroprojeté au plafond, (9,8-10,2 ; 4,65-4,9), aux deux poses de
  // r02 : c'est le quatrième de la rangée sud, au-dessus de l'entrée de l'antichambre. En (10,45 ; 5,15), le jeu le cachait
  // derrière le pilier et laissait le haut de l'ouverture sans lumière : il passe en (9,95 ; 4,8))
  // (r03, 12/10 : la rangée sud, dans la bande de dalles lisses, suit le mur des jours — à 0,275 m de son nu, y 4,95 ;
  // celle du nord, rétroprojetée vers y 6,8, ne bouge pas ; le spot de l'antichambre non plus, contre l'arête du pilier
  // sur r02) (Relecture r03 du 12/10 : la bande de dalles lisses, à 2,58, a suivi le mur jusqu'à y 4,6-5,275 — le spot de
  // l'antichambre, en y 4,8 à 2,60, était caché tout entier au-dessus d'elle : une lumière sans luminaire, en haut de
  // l'ouverture où r02 le montre. En v1.7, la bande partait de 4,8 et en cachait déjà la moitié. Il passe à 2,58, sous
  // la bande, comme ses voisins de la rangée sud)
  const yS = ATT.ys + 0.35;
  for (const [x, y, h] of [[5.5, yS, 2.6], [7.15, yS, 2.58], [8.8, yS, 2.58], [9.95, 4.8, 2.58], [5.35, 6.8, 2.6], [8.7, 6.8, 2.6], [12.05, 6.8, 2.6]]) ch.spot(x, y, h, 'attente', { couleur: chaudAtt });
  // (V2, 11/10 : la photo 01 recalée met le hublot qu'elle voit en (12,3 ; 10,7), au-dessus du local et de la gaine, un peu
  // à l'ouest de l'axe ; l'autre est derrière l'appareil, vers le fond)
  // (13/10, lot C2 — la pose refaite : en (12,37 ; 9,21), devant le local et la gaine ; le même verre de 28 cm, chaud)
  for (const [x, y] of [[12.37, 9.21], [12.37, 11.9]]) ch.opale(x, y, C01.hP, 'c01', { r: 0.14, couleur: chaudC05 });
  // (10/10, VO 92,6-94,8 s : les spots ronds du hall relevés depuis la porte nord — une rangée vers y 4,3 au bout des
  // lignes lumineuses, une vers y 3,2 au-dessus du comptoir ; au-dessus de l'open-space et dans l'angle nord-est, rouvert,
  // posés au même pas. Les huit lignes : js/ecole_hall.js)
  // (Retour r04 du 12/10, la photo de l'accueil rejouée à sa pose : (17,25 ; 3,2), (18,75 ; 3,2) et (18,75 ; 1,5) y sont, à
  // 0,1 m près ; pas de spot en (17,7 ; 4,3) — il en a un en (17,1 ; 4,95), devant la retombée ; au fond à gauche, le spot
  // est en (18,55 ; 7,1), près du mur nord, devant le local — en (18,3 ; 6,3), il tombait sur le pilier de bois clair)
  for (const [x, y] of [[15.4, 4.3], [16.55, 4.3], [17.1, 4.95], [17.25, 3.2], [18.75, 3.2], [17.25, 1.5], [18.75, 1.5], [15.9, 6.2], [18.55, 7.1]]) ch.spot(x, y, 2.6, 'hall');
  // (10/10 : le bureau B a perdu son angle nord-est, le passage de la pile — le second spot recule)
  for (const [x, y] of [[11.0, 2.4], [12.55, 1.55]]) ch.spot(x, y, 2.6, 'bureauB');
  // (la Si 0.1 : ses dalles LED sont posées avec son mobilier, js/ecole_pieces.js)
  // (la cage, décalée de DY_S : l'applique du mur nord au-dessus du palier intermédiaire, le plafonnier du palier du 1er,
  // l'applique du mur est au-dessus de la volée 1 — le plafonnier du haut de la cage : js/ecole_etage1.js)
  // (finitions du 11/10 : l'applique du mur du fond au-dessus de la volée 2, à 3,60 — au droit des affiches, à 2,9, elle
  // se verrait par la porte, et la photo 20 n'en montre pas)
  ch.opale(1.35, ESC.yFond, 3.6, 'escalier', { mur: 'S', r: 0.15 });
  // (pas dans la lumière cuite du rez-de-chaussée : au-dessus de la dalle du palier, il ne l'éclaire pas — décalé, il
  // peignait une flaque au pied des portes de l'escalier, dans le hall)
  ch.opale(3.2, 13.4 + DY_S, H_CAGE, 'palier1', { r: 0.18, base: ESC.hP, cuire: false });
  ch.opale(4.45, 15.5 + DY_S, 2.95, 'escalier', { r: 0.15, mur: 'W', cuire: false });
  // (relecture du 11/10 : le bloc de sortie de la photo 21 n'est pas suspendu près du pilier gris — ni elle, ni la VO
  // q_0038-0046 n'en montrent là ; il est fixé en haut du mur du fond, la face ouest de la pile, au-dessus de l'écart entre
  // le présentoir et le radiateur, sous le plafond)
  // (Relecture du 11/10, r02 agrandie : ce n'est pas un bloc vert à pictogramme mais un boîtier BLANC à deux voyants
  // ronds, côte à côte, d'un blanc bleuté — le bloc d'ambiance de l'issue vers le hall)
  {
    const b = new THREE.Group(); b.position.set(13.27, 2.45, -6.0); b.rotation.y = -Math.PI / 2; ch.decor.add(b);
    maille(boiteM(0.3, 0.11, 0.06), M.blanc, 0, 0, 0, 0, b, { ombre: false });
    const voy = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 1.3, 1.6) });
    for (const sx of [-0.065, 0.065]) { const v = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), voy); v.position.set(sx, 0, 0.031); b.add(v); }
    b.traverse((m) => { m.userData.horsAOSol = true; });
  }
  // LE JOUR qui entre (pour les spots : une lampe froide dehors, qui vise l'intérieur ; pour la lumière cuite : la source
  // au pied de l'ouverture, `ox/oz` le point d'où l'on découpe sa visibilité, dehors)
  const jour = (x, y, cible, zone, o = {}) => ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.6, cx: cible[0], cz: -cible[1], sx: x, sz: -(y + 0.3), ox: x, oz: -(y - 0.5), zone, ...o });
  jour(15.25, 0.3, [15.25, 3.2], 'hall', { poids: 1.6 });
  // (relecture du 11/10 : sa source, dehors, sous le linteau — à 2,60, à 0,5 m de lui, elle faisait une tache blanche sous
  // le linteau, vue de la rue ; la lumière cuite ne lit pas sa hauteur)
  jour(3.3, -0.4, [3.3, 2.0], 'passage', { poids: 1.4, h: 2.2 });
  for (const x of [17.33, 18.98]) ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.4, sx: x, sz: -0.4, ox: x, oz: 0.5, zone: 'hall', reel: false, cuireForce: 0.55 });
  for (const x of [5.78, 7.43, 9.08]) ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.4, sx: x, sz: -0.4, ox: x, oz: 0.5, zone: 'si01', reel: false, cuireForce: 0.8 });
  for (const x of [10.73, 12.38]) ch.lampes.push({ type: 'jour', x, z: 0.9, h: 2.4, sx: x, sz: -0.6, ox: x, oz: 0.5, zone: 'bureauB', reel: false, cuireForce: 0.5 });
  // (la lumière de la salle David Clark, à travers la porte bleue : une nappe au bout du C05 — V2, 11/10 : la source
  // dans l'entrée de la salle, la nappe au pied de la porte, côté C05 ; r06, 13/10 : la salle n'a pas de fenêtre, c'est
  // le blanc de ses luminaires à grille)
  ch.lampes.push({ type: 'jour', x: 5.156, z: -13.6, h: 2.4, sx: 5.156, sz: -(C05.yFond - 0.3), ox: 5.156, oz: -(C05.yFond - 0.1), zone: 'c05', reel: false, cuireForce: 0.25, couleur: new THREE.Color(0xf6f2ea) });

  // ---- LES CROCHETS : le mobilier, la rue ----
  poserMobilier(ch);
  // la pile du hall (plaque « iris », horloge, annuaires), le bureau de direction B 0.3 : js/ecole_rdc_centre.js
  poserRdcCentre(ch);
  poserRue(ch);
  // les pièces qu'on peut maintenant visiter (Si 0.1, bureau B, couloir de service, local, toilettes, salle David
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
    // (plan V2 : la cage décalée de DY_S, le palier du 1er de y 7,775 à 9,525 ; le passage arrêté à la paroi, y 4,05)
    // (finitions du 11/10 : la cage va jusqu'au nu 0,75 — la volée 2 et l'ouest du palier intermédiaire ; sous 0,6 m, au-dessus
    // de la trémie, c'est la volée de tôle du -1, zone escalierSS, js/ecole_soussol.js, en tête de liste)
    { id: 'palier1', rects: [zr(0.6, 7.775, 4.75, 14.075, 2.6)], voisines: ['escalier', 'e1hall'], env: { x: 3.2, y: 4.9, z: -8.7 } },
    { id: 'escalier', rects: [zr(0.6, 9.0, 4.75, 14.075)], voisines: ['hallO', 'palier1'], env: { x: 3.4, y: 2.4, z: -11.3 } },
    { id: 'passage', rects: [zr(1.6, -0.45, 4.5, 4.05)], voisines: ['hallO', 'rue'], env: { x: 3.3, y: 1.6, z: -2.0 } },
    // (V2, 11/10 : le C05 de la porte de l'escalier à la porte bleue ; au-delà, l'entrée de la salle David Clark — zone `dc`,
    // js/ecole_pieces.js —, qui s'y ouvre)
    // (13/10, lot C2 : du nu de la cage, 4,53, à la ligne du mur est, 5,995 ; le mur du fond sur la ligne 12,785)
    { id: 'c05', rects: [zr(C05.xO, Y_ESC, C05.xM, C05.yFond + 0.075)], voisines: ['hallO', 'dc'], env: { x: 5.22, y: 1.5, z: -(Y_ESC + 1.8) } },
    // (plan V2 : le hall ouest en trois rectangles — la gorge derrière la paroi vitrée, entre la pile et la ligne x 4,5 ;
    // le hall ouvert sur la salle d'attente jusqu'à x 5,8 ; devant les portes de l'escalier et le C05, au nord du mur
    // safran, jusqu'à x 6,05)
    // (r03, 12/10 : jusqu'au mur sud de la salle, qui recule de 0,20 — DY_R03)
    { id: 'hallO', rects: [zr(1.6, 4.05, 4.5, 4.875), zr(1.6, ATT.ys + EP / 2, 5.8, 7.8), zr(1.6, 7.8, C05.xM, 9.0)], voisines: ['passage', 'attente', 'c05', 'escalier'], env: { x: 3.6, y: 1.6, z: -6.4 } },
    { id: 'c01', rects: [zr(11.6, 7.875, C01.xM, 14.475)], voisines: ['attente'], env: { x: 12.5, y: 1.5, z: -10.4 } },
    // (11/10, plan V2 : la salle d'attente (DY_A) et le passage au sud-ouest de la pile, au droit des deux redents du
    // bureau B, jusqu'à la face ouest de la pile — plus de « cou » ; le hall perd la pile, js/ecole_rdc_centre.js)
    // (retour r02 du 11/10 : et l'antichambre, de l'axe du retour x 9,165 à la pile, jusqu'à l'axe du mur nord du bureau)
    // (relecture : le mur nord du bureau sur la ligne 2,925)
    { id: 'attente', rects: [zr(5.8, ATT.ys, 13.3, ATT.yn), zr(9.165, 2.925, 13.3, ATT.ys), zr(12.5, 2.5, 13.3, 2.925)], voisines: ['hallO', 'c01', 'hall'], env: { x: 9.2, y: 1.6, z: -(10.5 + DY_A) } },
    { id: 'hall', rects: [zr(13.3, -0.45, 20.1, 4.7), zr(14.675, 4.7, 20.1, 7.6)], voisines: ['attente', 'rue', 'couloirEst'], env: { x: 15.8, y: 1.6, z: -4.0 } },
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
  // CE QUE LA CAMÉRA PEUT VOIR (lot 5, 11/10) : le décor cousu du rez-de-chaussée et de la rue coupé par zones à son
  // tour, chaque morceau rangé ; à chaque rendu par la caméra du jeu, ce qu'elle ne peut pas voir n'est pas dessiné
  poserCoupe(null);
  const visibilite = poserVisibilite(scene, ch.portes.auto);

  // ---- LA CARTE VIVANTE (js/game.js, à chaque image) ----
  let cuit = -1;
  const maj = (dt, jeu) => {
    const u = jeu.user.pos, cam = jeu.camera.position;
    visibilite.maj(dt, jeu);
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
  const d = { x: 14.9, y: 3.2 }, v = { x: 0, y: 1 }, n = Math.hypot(v.x, v.y);   // (11/10 : y 1,3 -> 3,2 : la caméra du lot A, 2,6 m derrière lui, est dans le hall en y 0,6 comme la VO à 6,4 s, plus dans la rue)
  return {
    nom: 'IRIS — rez-de-chaussée',
    collisions: C,
    depart: { x: d.x, z: -d.y, fx: v.x / n, fz: -v.y / n },
    // (zMin -22 -> -25 : la salle David Clark allait jusqu'à y 24,35 — 09/10 ; V2, 11/10 : -24,5, le bâtiment s'arrête à
    // y 23,7, IGN)
    bornes: { xMin: -22, xMax: 47, zMin: -24.5, zMax: 11 },
    sieges: ch.sieges,
    maj,
    lumieres, portes: ch.portes, chantier: ch,
  };
}
