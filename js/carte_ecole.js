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
//   l'antichambre, le passage  x 10,05-13,3  y 3,0-4,675   derrière le bout du mur sud de la salle d'attente, devant le mur
//   de la pile                                            nord du bureau de direction (porte de la Si 0.1, jour du
//                                                         bureau) ; il rejoint le hall au sud-ouest de la pile ; au
//                                                         bout, la porte vitrée du bureau (photos 01, 03, r02 ; 11/10) ;
//                                                         son mur ouest, celui de la porte de la Si 0.1, en x 9,975, et
//                                                         le redan jusqu'au bout du mur sud, x 9,24, au nord de y 4,125
//                                                         (r07, 14/10)
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
import { Portes, boiteM, maille, fenetreFacade, fenetreDepolie, fusionnerLocal, vitrophanies, poserCoupe, VITRO } from './ecole_portes.js';
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
// (13/10, LA VOLÉE 2 À SA VRAIE PENTE — rapport_finitions.md doute 6 : elle passait 0,5 à 1,0 m trop haut. Photo 06 rejouée
// à sa pose, (4,95 ; 5,89) h 1,57 cap −82,8 f 600, 6 px sur dix points du hall : par le vantail ouvert, quatre nez de sa
// crémaillère blanche se lisent de profil en y 9,66 / 10,03 / 10,39 / 10,76, à 1,71 / 1,54 / 1,36 / 1,18 — des girons de
// 0,366 pour des contremarches de 0,175 (le jeu : 0,24), la lisse basse sombre 6 à 13 cm au-dessus, le dessous du limon
// 0,44 dessous ; les photos 04 et 20 le recoupent à 5-10 cm. Seize contremarches la mènent donc de son pied, y 11,49, au
// 1er en y 6,0 : elle passe DERRIÈRE l'avancée nord du hall — qui est son coffrage : l'avancée s'arrête en y 7,22, là où
// la sous-face repasse au-dessus du plafond — et au-dessus de la trémie de la volée de tôle. Le palier du 1er et sa
// double porte, imaginés, la suivent : elle arrive au bout ouest du couloir sombre, js/ecole_etage1.js. La volée 1 :
// 1re contremarche en y 9,90, bord ouest 2,42, girons de 0,32 — photo 06, le pied en (2,5 ; 9,96), la platine du poteau
// en (2,49 ; 9,87) ; photo 20 refaite à sa pose, (3,57 ; 6,51) h 1,27 cap −9,5, les nez en y 9,86 / 10,19 / 10,49 / 10,85.)
const ESC = {
  haut: 0.175,
  x1o: 2.42, x1e: 4.45, y1: 9.90, G1: 0.32, n1: 4,      // la volée 1 : bord ouest, nu est, 1re contremarche, giron
  hL: 0.70, yFond: 13.2,                                // le palier intermédiaire et le nu de son mur du fond
  x2o: 0.75, x2e: 1.975, G2: 0.366, n2: 16, yT: 6.0,    // la volée 2 : nu ouest, nu de l'échiffre, giron, son arrivée
  yP1: 5.01, hP: 3.5,                                   // le palier du 1er : le bout ouest du couloir sombre, nu sud 5,01
};
ESC.yL1 = ESC.y1 + (ESC.n1 - 1) * ESC.G1;            // 10,86 : le bord du palier intermédiaire, au haut de la volée 1
ESC.yF2 = ESC.yT + (ESC.n2 - 1) * ESC.G2;            // 11,49 : le pied de la volée 2 (sa 1re contremarche)
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
//    le hall est à un autre lot.) Les deux hublots : (5,42 ; 9,10) sous le plafond bas (relecture : il était en (5,34 ; 8,95)), (5,33 ; 11,44) sous le haut,
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
// (13/10, relecture C2 — la photo 01 rejouée à cette pose, l'appareil en (12,16 ; 11,73) : le plafond n'est pas d'une
// seule hauteur. Une RETOMBÉE le barre d'un mur à l'autre — sa ligne en v 431, son pied aux deux murs en y 9,80-9,82,
// au droit du bout nord de la gaine —, et au-dessus d'elle une bande un rien plus sombre (126 contre 131 puis 148 sous
// le hublot) jusqu'à v 388 : 12 cm. Le plafond BAS, 2,35, va de l'entrée à y 9,80, avec le premier hublot ; au nord, il
// est à 2,47 — `yR`, `hN`.)
const C01 = { xO: 11.7, xE: 13.3, xM: 13.375, yL: 8.995, lL: 0.83, yG: 9.045, lG: 1.47, yP: 11.265, lP: 0.93, hP: 2.35, yR: 9.8, hN: 2.47 };
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
    const t = maille(new THREE.CylinderGeometry(0.021, 0.021, L - 0.08, 12), M.tube, 0, -0.014, 0, 0, g, { ombre: false, recoit: false });
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
  // la sous-face du limon de la volée 2 : 0,44 sous la ligne des nez (photo 06, l'arête grise sous la crémaillère)
  const sous2 = (y) => HL - 0.26 + (E.yF2 - y) * R / G2;
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
  const p2 = [[0, sous2(E.yF2)], [0, HL + R]];
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
  // (13/10 : dans la cage, les plinthes sont de CARRELAGE gris, 10 cm — photo 06, le pied de l'échiffre ; photo 20, celui
  // du mur à affiches, de la teinte du palier —, et non de bois verni comme dans le hall)
  const PC = new THREE.MeshStandardMaterial({ color: 0x8f8b84, roughness: 0.55 }); PC.name = 'plinthe de carrelage gris (cage)';
  ch.boite(E.x2e, yPorte, E.x2e + 0.012, E.yF2, 0, 0.1, PC, { ombre: false });
  // (et le JOUR entre l'échiffre et la volée 1, x 1,975-2,42 : son fond, le front du palier, a sa plinthe)
  ch.boite(E.x2e, E.yF2 - 0.012, E.x1o, E.yF2, 0, 0.1, PC, { ombre: false });
  // (le mur des portes côté cage, de l'échiffre au jambage ouest et du jambage est au mur est)
  ch.boite(E.x2e, yPorte, 2.45, yPorte + 0.012, 0, 0.1, PC, { ombre: false });
  ch.boite(4.45, yPorte, E.x1e, yPorte + 0.012, 0, 0.1, PC, { ombre: false });
  // ---- AU SUD DU MUR DES PORTES, LA VOLÉE 2 CONTINUE (13/10) entre deux murs, derrière l'avancée nord du hall puis
  // au-dessus du plafond de son renfoncement, jusqu'au 1er en y 6,0 : le bout ouest du couloir sombre est son palier
  // (le carrelage, la double porte, le plafond : js/ecole_etage1.js). Le mur OUEST, ligne 0,675, pend au-dessus de la
  // trémie de la volée de tôle : son pied suit la sous-face du limon, par pans de 25 cm (dessous, le rampant du -1 —
  // js/ecole_soussol.js) ; le mur EST, ligne 2,05, part du dessus de l'avancée nord (3,25), puis, au sud de y 7,22, du
  // plafond du renfoncement (2,35). ----
  for (let ya = E.yT; ya < 10.25 - 1e-6; ya += 0.25) {
    const yb = Math.min(10.25, ya + 0.25);
    ch.mur({ de: [0.675, ya], a: [0.675, yb], base: Math.max(0, sous2(yb) - 0.06), h: H_CAGE, mats: M.blanc });
  }
  ch.mur({ de: [2.05, E.yT], a: [2.05, 7.22], base: 2.35, h: H_CAGE, mats: M.blanc });
  ch.mur({ de: [2.05, 7.22], a: [2.05, Y_ESC - 0.075], base: H_DALLE, h: H_CAGE, mats: M.blanc });
  // le nez de la dernière marche, au bord du palier du 1er
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
  // (13/10, la volée 2 à sa vraie pente : photo 06, la lisse basse 6 à 13 cm au-dessus des nez, la main courante 0,82
  // plus haut, un barreau tous les 14,5 cm ; le poteau sombre et sa platine en y 9,80, à 1,41 — sur le limon, 27 cm sous
  // le nez. Le garde-corps s'arrête au mur des portes : au sud, la volée est entre deux murs.)
  const xg2 = E.x2e + 0.02, yH2 = yPorte + 0.02, H2 = 0.92;
  lisse(xg2, E.yF2, nez2(E.yF2) + 0.1, yH2, nez2(yH2) + 0.1, SOMBRE, 0.045, 0.03);
  lisse(xg2, E.yF2, nez2(E.yF2) + H2, yH2, nez2(yH2) + H2, SOMBRE, 0.05, 0.035);
  // (14/10, photo 06 agrandie : ses barreaux sont du même brun sombre que ses lisses, des traits noirs sur le mur clair
  // de la cage — ceux de la volée 1, eux, sont gris ; le jeu les faisait tous gris)
  for (let y = E.yF2 - 0.06; y > yH2 + 0.03; y -= 0.145) ch.boite(xg2 - 0.007, y - 0.007, xg2 + 0.007, y + 0.007, nez2(y) + 0.1, nez2(y) + H2, SOMBRE, { ombre: false, parent: GC });
  // ses poteaux, gris foncé, fixés de côté sur le limon par une platine carrée (r01, 06, 04 : le montant sombre qui
  // descend jusqu'à sa platine, au-dessus de l'échiffre)
  for (const y of [E.yF2 - 0.04, 10.65, 9.8]) {
    ch.boite(xg2 - 0.02, y - 0.02, xg2 + 0.02, y + 0.02, sous2(y) + 0.1, nez2(y) + H2, SOMBRE, { parent: GC });
    ch.boite(E.x2e, y - 0.06, E.x2e + 0.012, y + 0.06, sous2(y) + 0.1, sous2(y) + 0.22, M.garde, { ombre: false, parent: GC });
  }
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
  // (13/10 : à 1,08 du palier — photo 20 refaite à sa pose, rang 752 : 1,85-1,9 sur le mur du fond ; photo 06 : 1,65-1,75)
  const hMC = HL + 1.08, xa = E.x2o + 0.06, xb = E.x1e - 0.06;
  tubeY(E.x1e - 0.06, E.y1, R + 1.0, E.yL1, hMC, 1);
  tubeY(E.x1e - 0.06, E.yL1, hMC, E.yFond - 0.06, hMC, 1);
  tubeY(E.x2o + 0.06, E.yT, HP + 0.9, E.yF2, nez2(E.yF2) + 0.9, -1);
  tubeY(E.x2o + 0.06, E.yF2, hMC, E.yFond - 0.06, hMC, -1);
  // (13/10 : et sur le mur est de la volée 2, du 1er au mur des portes, où le garde-corps prend le relais)
  tubeY(E.x2e - 0.06, E.yT, HP + 0.9, Y_ESC - 0.1, nez2(Y_ESC - 0.1) + 0.9, 1);
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
  // les plinthes au ras du palier (le long des murs du fond, ouest et est)
  ch.boite(E.x2o, E.yFond - 0.012, E.x1e, E.yFond, HL, HL + 0.1, PC, { ombre: false });
  ch.boite(E.x2o, E.yF2, E.x2o + 0.012, E.yFond, HL, HL + 0.1, PC, { ombre: false });
  ch.boite(E.x1e - 0.012, E.yL1, E.x1e, E.yFond, HL, HL + 0.1, PC, { ombre: false });

  // ---- LE MONDE SOLIDE ----
  // la volée 1 et le palier intermédiaire ; la volée 2 jusqu'au 1er (son palier : la dalle de l'étage, js/ecole_etage1.js)
  C.rampe(E.x1o, -(E.yL1 + G1 / 2), E.x1e, -(E.y1 - G1 / 2), 'z', -(E.y1 - G1 / 2), 0, -(E.yL1 + G1 / 2), HL);
  C.sol(E.x1o, -E.yFond, E.x1e, -E.yL1, HL);
  C.sol(E.x2o, -E.yFond, E.x1o, -E.yF2, HL);
  C.rampe(E.x2o, -(E.yF2 + G2 / 2), E.x2e, -(E.yT - G2 / 2), 'z', -(E.yF2 + G2 / 2), HL, -(E.yT - G2 / 2), HP);
  // le bord est de la volée 2 (échiffre, garde-corps), à toutes les hauteurs, du palier intermédiaire au mur des portes
  // (au sud, le mur est de la volée)
  C.ajouterBoite(1.85, -yPorte, 2.0, -E.yF2, { y0: 0, y1: 5.2 });
  // le jour (x 2,0-2,42), du mur des portes au palier, à toutes hauteurs (pour le joueur seul : la caméra y voit d'une
  // volée à l'autre)
  C.ajouterBoite(2.0, -yPorte, E.x1o, -E.yF2, { y0: 0, y1: 5.2, camera: false });
  C.ajouterCercle(xg1, -yPied, 0.04, { y0: 0, y1: 1.2 });
  // la caméra ne passe pas dans les volées ni sous le palier intermédiaire ; sous la volée 2, au-dessus de la trémie du -1
  // (y < 10,3), à partir de 25 cm sous son limon — dessous, les plafonds de caméra du rampant de la volée de tôle,
  // js/ecole_soussol.js
  for (let i = 1; i < E.n1; i++) { const ya = E.y1 + (i - 1) * G1; C.ajouterBoite(E.x1o, -ya, E.x1e, -(ya + G1), { y0: 0, y1: i * R, joueur: false }); }
  C.ajouterBoite(E.x1o, -E.yL1, E.x1e, -E.yFond, { y0: 0, y1: HL, joueur: false });
  C.ajouterBoite(E.x2o, -E.yF2, E.x1o, -E.yFond, { y0: 0, y1: HL, joueur: false });
  for (let k = 1; k < E.n2; k++) {
    const yb = E.yF2 - (k - 1) * G2;
    C.ajouterBoite(E.x2o, -(yb - G2), E.x2e, -yb, { y0: yb < 10.3 ? Math.max(0, sous2(yb) - 0.25) : 0, y1: HL + k * R, joueur: false });
  }
  // (les plafonds : celui de la cage, le dessous de la dalle du 2e, et celui de la volée 2 au sud du mur des portes :
  // js/ecole_etage1.js)
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
// (lot rue du 13/10 : la ligne des vitrages de la porte 6, 1,2 m derrière le nu de la pierre — construireEntree)
const Y_P6 = 0.8;
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
      // (lot rue du 13/10, photo 10 à sa pose : le dessous du linteau noir est à 2,57 et non 2,45)
      { c: 3.3, l: 2.25, h: 2.57 },
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
  // (vérification finale v2.0, 14/10 — photo 10 à sa pose, mesurée aux mêmes points : la porte, son bâti et le panneau
  // jusqu'au passage sont d'un noir de charbon, 28 à 50 sous le ciel couvert, les lames d'un gris de 90 ; le jeu les
  // sortait à 8-17, un noir d'encre, et ses lames d'acier à 48 — d'où ces trois matières, mates, à elles)
  const noirSecours = new THREE.MeshStandardMaterial({ color: 0x3e3d40, roughness: 0.62, metalness: 0.12 }); noirSecours.name = 'acier peint de la porte de secours';
  const noirBati = new THREE.MeshStandardMaterial({ color: 0x353437, roughness: 0.8 }); noirBati.name = 'bâti noir de la porte de secours';
  const lamesVentil = new THREE.MeshStandardMaterial({ color: 0xbab7b2, roughness: 0.5, metalness: 0.2 }); lamesVentil.name = 'lames de la ventilation';
  ch.porte('x', -0.2, 0.8, { l: 1.0, h: 2.2, ep: 0.4, modele: 'noire', matCadre: noirSecours, etat: 'fermee', cote: 'S', huisserie: false });
  // (lot rue du 13/10, photo 10 à sa pose : le bâti noir va de x 0,3 au passage et monte à 2,80 comme le linteau ; ses
  // lames grises occupent x 0,4-1,85 de 2,15 à 2,56 — elles étaient 15 cm plus haut et s'arrêtaient à 1,6)
  ch.boite(0.3, -0.44, 2.175, -0.4, 2.15, 2.8, noirBati);
  // (lot façade du 11/10, photo 10 recalée : les lames de la ventilation sont d'un gris d'acier, plus claires que leur
  // cadre ; la porte est dans un bâti noir — ses tableaux et l'entre-deux jusqu'au trumeau noir, x 1,30-1,46 — : de la
  // rue, du pilier de pierre (x 0-0,3) au passage, tout est sombre)
  for (let h = 2.18; h < 2.55; h += 0.045) ch.boite(0.4, -0.47, 1.85, -0.44, h, h + 0.012, lamesVentil, { ombre: false });
  for (const [a, b] of [[0.3, 0.32], [1.28, 1.3]]) ch.boite(a, -0.4, b, 0, 0, 2.2, noirBati, { ombre: false });
  ch.boite(0.3, -0.4, 1.3, 0, 2.18, 2.2, noirBati, { ombre: false });
  ch.boite(1.3, -0.42, 1.46, -0.4, 0, 2.25, noirBati, { ombre: false });
  ch.panneau(new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.6 }), 0.3, 0.2, 0.95, -0.45, 1.85, 'S');      // (relecture du 14/10, photo 10 : 15 cm plus à l'est, 10 cm plus haut)
  // le linteau d'acier noir du passage (35 cm) et, dessous, au milieu, le boîtier noir aux deux étiquettes blanches
  // (relecture du 11/10, photo 10 rejouée : un seul boîtier de 0,59 m, x 3,01-3,6, de 2,32 à 2,45 — pas deux petits
  // boîtiers aux jambages ; c'est lui qu'on voit de la rue, et non un bloc de sortie vert)
  // (lot rue du 13/10, photo 10 à sa pose : le linteau va de 2,57 à 2,80 — 23 cm et non 35 — et dépasse le jambage est
  // jusqu'en x 4,75 ; le boîtier pend dessous, de 2,44 à 2,57)
  ch.boite(2.175, -0.44, 4.75, -0.4, 2.57, 2.8, M.acierNoir);
  ch.boite(3.01, -0.45, 3.6, -0.35, 2.44, 2.57, M.noirMat, { ombre: false });
  const etiq = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.5 });
  for (const x of [3.12, 3.49]) ch.panneau(etiq, 0.15, 0.035, x, -0.452, 2.505, 'S');
  // LE PASSAGE VU DE LA RUE (photos 10, 11, 13, 14 : sous le ciel couvert, c'est un trou sombre et CHAUD — ses murs à
  // 108-79-44, son sol presque noir, les deux réglettes seules claires ; le jeu le montrait aussi clair que la rue, blanc).
  // (intégration v2.0, 14/10 : la zone de la rue y tendait son voile, la relecture du passage le sien, `voilePassage`,
  // réglé sur la photo 10 rejouée sans passer par la pierre de la façade — à eux deux, le passage sortait trois fois
  // trop sombre. Seul celui du passage reste : construireCarte.)
  // (plan V2, photo 10 : entre la porte de secours et le passage, le cadre noir commun — un panneau d'acier noir jusqu'au
  // linteau, sur les 0,7 m de façade que l'ouverture rétrécie découvre)
  ch.boite(1.46, -0.44, 2.175, -0.4, 0, 2.8, noirBati);
  // la grille d'égout en fonte en travers du seuil du passage
  // (13/10, photo 10 refaite à sa pose — (3,19 ; −4,93) h 1,75 cap −5,1, f 600, 2,4 px sur les quatre coins de
  // l'ouverture et de la porte du fond : la grille est DEVANT la façade, sur le trottoir, large de 0,55 m ; entre les
  // jambages, dans l'épaisseur du mur, un SEUIL de pierre claire de 25 cm. Le jeu posait la grille dans l'épaisseur.)
  // (14/10, la même pose, la colonne 870 lue au pixel : le sol du passage jusqu'au rang 584, le seuil CLAIR de 588 à
  // 598 — y −0,44 à −0,63 —, la grille de 600 à 620 — y −0,66 à −1,0 —, puis le fil du caniveau. Le seuil est donc
  // au pied de la façade, à cheval sur son nu, et la grille 22 cm plus loin sur le trottoir qu'elle n'était.)
  ch.boite(2.05, -1.06, 4.55, -0.62, 0, 0.006, M.acierNoir, { ombre: false });
  for (let x = 2.11; x < 4.5; x += 0.06) ch.boite(x, -1.02, x + 0.022, -0.66, 0.006, 0.009, M.noirMat, { ombre: false });
  // (le seuil : un béton clair, (205-216, 200-210, 193) sous une pierre de façade à (221, 223, 220) ; sa teinte d'avant,
  // sous la lampe du jour du passage, sortait blanche — un trait de lumière au pied de l'ouverture)
  ch.boite(2.175, -0.62, 4.425, -0.36, 0, 0.012, new THREE.MeshStandardMaterial({ color: 0x9a968d, roughness: 0.85 }), { ombre: false });
  // (les tableaux et la sous-face de l'ouverture sont le bâti d'acier NOIR de la grille — photos 10 et 07 ; le jeu y
  // laissait l'enduit blanc de l'épaisseur du mur, un liseré clair autour du passage vu de la rue)
  // (intégration v2.0 : jusqu'au dessous du linteau, 2,57 — la relecture de la rue, photo 10)
  ch.boite(2.175, -0.4, 2.181, 0, 0.012, 2.57, M.acierNoir, { ombre: false });
  ch.boite(4.419, -0.4, 4.425, 0, 0.012, 2.57, M.acierNoir, { ombre: false });
  ch.boite(2.175, -0.4, 4.425, 0, 2.564, 2.57, M.acierNoir, { ombre: false });
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
  // LE PORTAIL N° 6 (lot rue du 13/10 — les photos 16 et 17 rejouées à leur pose, ajustement d'ensemble des photos 08 à
  // 18 à 5 px ; trois indices qui s'accordent : la bande de sol entre le seuil et le bas des vantaux, la largeur du
  // tableau ouest vu de biais, et celle du vitrage, qui retrouve les 3,15 m de l'entrée du hall) : le renfoncement fait
  // 1,2 m, et non 0,7 — la ligne des vitrages est en y 0,8 (Y_P6). De chaque côté, 0,5 m de pierre en retour (à l'ouest,
  // la platine noire de l'interphone et son bouton), puis un panneau noir — à l'ouest, une grille de lames noires jusqu'à
  // 2 m (VO q_0019-0023) ; sous le linteau de pierre, un bandeau noir de 22 cm, puis la sous-face gris clair et sa grille
  // de ventilation, à 2,58 ; au sol, un carrelage gris anthracite derrière une cornière d'aluminium ; au pied de la
  // pierre, de part et d'autre, le soubassement taupe de 0,48 m et son filet sombre (photos 15 à 17).
  // (relecture rue du 14/10 : il part du nu INTÉRIEUR du mur de façade, y 0 — parti de -0,4, son about affleurait la pierre
  // et scintillait avec elle : une bande pointillée de 15 cm au-dessus du portail, vue des photos 16 à 18 ; de même pour le
  // mur est du passage, x 4,5, et celui de l'ouest du portail, x 13,275)
  ch.mur({ de: [16.575, 0], a: [16.575, Y_P6], ep: 0.15, h: H_DALLE, mats: { W: M.noirMat, E: M.blanc } });
  const P6 = { x0: PORTAIL.c - PORTAIL.l / 2, x1: PORTAIL.c + PORTAIL.l / 2 };
  const noirP6 = new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.6 }); noirP6.name = 'panneaux noirs du portail';
  // (photos 16, 17 : le soubassement est d'un taupe rosé, 105-94-90 sous le ciel couvert)
  M.soubassement = jourDehors(new THREE.MeshStandardMaterial({ color: 0x7f7a74, roughness: 0.9 }), 0.1);     // (relecture du 14/10 : 68 à 86 sur les photos 16 et 17, rendu à 91-99)
  M.soubassement.name = 'soubassement taupe de la façade';
  M.filetSoubassement = new THREE.MeshStandardMaterial({ color: 0x2c2829, roughness: 0.7 }); M.filetSoubassement.name = 'filet du soubassement';
  // (les lames : une tuile de 8 cm, le dessus de la lame éclairé, son dessous dans l'ombre)
  const lames = new THREE.MeshStandardMaterial({ roughness: 0.55, map: canvasTex(8, 32, (g, w, h) => {
    g.fillStyle = '#17171a'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3a3e'; g.fillRect(0, 0, w, 7); g.fillStyle = '#050506'; g.fillRect(0, h - 9, w, 9);
  }, [1, 1 / 0.08], false, 4) });
  lames.name = 'grille à lames du portail';
  for (const [xa, xb, s] of [[13.35, P6.x0, 1], [P6.x1, 16.5, -1]]) {
    const xf = s > 0 ? xb : xa;                             // (la face du tableau, vue du renfoncement)
    ch.boite(xa, 0, xb, Y_P6 - 0.04, 0, 2.6, noirP6, { ombre: false, collision: true });
    // la pierre en retour : une dalle de 1,5 cm sur le chant du mur de façade et 10 cm au-delà ; son soubassement
    ch.boite(Math.min(xf, xf + s * 0.015), -0.398, Math.max(xf, xf + s * 0.015), 0.1, 0, 2.58, M.pierre, { ombre: false });
    ch.boite(Math.min(xf, xf + s * 0.02), -0.4, Math.max(xf, xf + s * 0.02), 0.1, 0, 0.48, M.soubassement, { ombre: false });
    ch.boite(Math.min(xf, xf + s * 0.024), -0.402, Math.max(xf, xf + s * 0.024), 0.1, 0.48, 0.51, M.filetSoubassement, { ombre: false });
  }
  ch.boite(P6.x0, 0.1, P6.x0 + 0.012, Y_P6 - 0.04, 0.06, 2.0, lames, { ombre: false });
  // la platine de l'interphone (0,2 x 0,31 m, de 1,32 à 1,63 : noire, son étiquette blanche en haut) et le bouton, sur
  // le retour de pierre ouest ; au pied du même retour, le chasse-roue blanc
  const platine = new THREE.MeshStandardMaterial({ roughness: 0.4, map: canvasTex(64, 96, (g, w, h) => {
    g.fillStyle = '#141416'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3c3c40'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
    g.fillStyle = '#e9e9e6'; g.fillRect(w * 0.42, h * 0.1, w * 0.46, h * 0.22); g.fillStyle = '#8a8d90'; g.fillRect(w * 0.5, h * 0.16, w * 0.3, h * 0.03); g.fillRect(w * 0.5, h * 0.23, w * 0.22, h * 0.03);
    g.fillStyle = '#2b2b2e'; for (let k = 0; k < 4; k++) g.fillRect(w * 0.18, h * (0.5 + k * 0.08), w * 0.64, h * 0.03);
  }, null, false, 4) });
  ch.panneau(platine, 0.2, 0.31, P6.x0 + 0.017, -0.19, 1.475, 'E');
  ch.panneau(noirP6, 0.05, 0.085, P6.x0 + 0.017, -0.21, 1.18, 'E');
  maille(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 10), M.blanc, P6.x0 + 0.03, 0.25, -0.09, 0, ch.decor, { ombre: false });
  // le bandeau noir sous le linteau (en retrait de 3 cm du nu de la pierre) et le plein au-dessus de la sous-face
  // (un noir MAT : sous le ciel, le noir satiné des tableaux y prenait un grand reflet gris)
  const noirBandeau = new THREE.MeshStandardMaterial({ color: 0x121213, roughness: 1, envMapIntensity: 0.15 }); noirBandeau.name = 'bandeau noir du portail';
  ch.boite(13.35, -0.37, 16.5, Y_P6 - 0.04, 2.6, H_DALLE, noirBandeau, { ombre: false });
  ch.boite(P6.x0, -0.37, P6.x1, -0.33, 2.56, 2.6, noirBandeau, { ombre: false });
  // (relecture rue du 14/10 : 43 à 75 sur les photos 16 et 17, le jeu la rendait à 70-105 — dans l'ombre du renfoncement,
  // elle est plus sombre que le trottoir)
  const sousFace = jourDehors(new THREE.MeshStandardMaterial({ color: 0x6f7070, roughness: 0.9 }), 0.12); sousFace.name = 'sous-face du portail';
  ch.boite(P6.x0, -0.33, P6.x1, Y_P6 - 0.04, 2.585, 2.6, sousFace, { ombre: false }).userData.horsAOSol = true;
  ch.boite(13.62, -0.25, 14.14, -0.05, 2.58, 2.586, new THREE.MeshStandardMaterial({ color: 0x8f8a7c, roughness: 0.6 }), { ombre: false });
  // le sol du renfoncement : de grands carreaux gris anthracite (joints tous les 60 cm), la cornière d'aluminium du seuil
  // (photos 16, 17 : 107 à 120 de gris sous le ciel couvert, à peine plus sombre que le trottoir, un rien bleuté)
  const dalleP6 = jourDehors(new THREE.MeshStandardMaterial({ roughness: 0.78, map: canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#4b4c4f'; g.fillRect(0, 0, w, h); g.fillStyle = '#3b3c3f'; g.fillRect(0, 0, w, 1.5); g.fillRect(0, 0, 1.5, h);      // (relecture du 14/10 : 102-107 sur les photos, neutre — rendu à 124-133, bleuté)
  }, [1 / 0.6, 1 / 0.6], false, 8) }), 0.08);
  dalleP6.name = 'carrelage du seuil de la porte 6';
  ch.boite(P6.x0, -0.4, P6.x1, Y_P6, 0, 0.008, dalleP6, { ombre: false });
  ch.boite(P6.x0, -0.43, P6.x1, -0.395, 0, 0.012, M.alu, { ombre: false });
  // LE SOUBASSEMENT de la façade de part et d'autre du portail (photos 15, 16, 17 : sous les baies de l'accueil jusqu'à
  // la bande noire du mitoyen, et à gauche du portail derrière les pots ; près du passage, photos 10 et 14, la pierre
  // descend claire jusqu'au trottoir)
  for (const [a, b] of [[10.0, P6.x0], [P6.x1, 19.8]]) {
    ch.boite(a, -0.42, b, -0.4, 0, 0.48, M.soubassement, { ombre: false });
    ch.boite(a, -0.424, b, -0.4, 0.48, 0.51, M.filetSoubassement, { ombre: false });
  }
  // le numéro 6, noir, sur la pierre à droite du portail ; les deux projecteurs et l'écusson tricolore au-dessus
  // (lot façade, photos 16 et 18 : le 6 est à 0,22 m du tableau est, à 0,6 m sous le linteau, haut de 13 cm — le jeu le
  // mettait à 16,85 et à 2,30, de 22 cm ; les projecteurs sont au-dessus des tableaux est du passage et du portail, à 4,0 m
  // — photos 10, 12 redressée, 17 : x 4,95 et 16,45-16,49 —, et non en x 6,9 et 16,8 à 3,67)
  const six = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.165), new THREE.MeshStandardMaterial({ map: texNumero('6'), transparent: true, roughness: 0.5 }));
  six.position.set(P6.x1 + 0.22, PORTAIL.h - 0.6, 0.405); ch.decor.add(six);
  // (lot rue du 13/10, photos 10, 16, 17 et 18 : les boîtiers sont d'un gris ANTHRACITE, 70 sur la pierre claire — le jeu
  // les faisait gris perle, 215)
  // (relecture rue du 14/10, mesuré aux mêmes endroits sur les photos 10, 16 et 17 : 84 à 100, le jeu rendait 38 à 65)
  M.projecteur = jourDehors(new THREE.MeshStandardMaterial({ color: 0x70727a, roughness: 0.5 }), 0.25); M.projecteur.name = 'boîtier des projecteurs';
  for (const x of [4.95, 16.47]) {
    // le projecteur : une console courte, le boîtier penché vers le trottoir
    // (lot rue du 13/10, photos 16 et 18 : le boîtier est gris clair — 225 sur la photo —, sa vitre sombre dessous)
    ch.boite(x - 0.04, -0.52, x + 0.04, -0.4, 3.96, 4.04, M.aluGris, { ombre: false });
    const p = maille(boiteM(0.32, 0.22, 0.09), M.projecteur, x, 3.96, 0.58, 0, ch.decor, { ombre: false });
    p.rotation.x = 0.55;
    const v = maille(boiteM(0.26, 0.16, 0.004), M.noirMat, x, 3.96 - 0.046 * Math.cos(0.55) + 0.0, 0.58 + 0.046 * Math.sin(0.55), 0, ch.decor, { ombre: false });
    v.rotation.x = 0.55;
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
// LA PORTE 6 (photos 03, 16, 17) : la ligne des vitrages à y = Y_P6. Un fixe à gauche, la double porte (automatique ici),
// un fixe étroit à droite ; aluminium gris. Les vitrophanies (une texture pour toute la largeur) sont découpées en
// morceaux qui suivent les vantaux.
// (Lot rue du 13/10 — photos 16 et 17 rejouées à leur pose, VO q_0374-0378 de l'intérieur : la ligne des vitrages est
// 1,2 m derrière le nu de la pierre, en y 0,8 et non 0,3 ; les vantaux font 0,98 m et montent à 2,52 m — pas d'imposte
// vitrée, un caisson d'aluminium jusqu'au plafond du hall ; leur rencontre est en x 15,13 et non 15,25 ; le fixe ouest
// fait 0,8 m, le fixe est 0,2 m de vitre visible ; les vitres vont de 0,15 à 2,44 m ; deux tirants plats sur les montants
// de rencontre. Le comptoir de l'accueil finit ainsi à 0,4 m du poteau est de la porte, comme sur la VO.)
function construireEntree(ch) {
  const { M, C } = ch, Y = Y_P6, z = -Y, hP = VITRO.h, hT = 2.6, XC = 15.13, LV = 0.98, cad = 0.075;
  // (vérification finale v2.0, 14/10 : l'aluminium de la porte, un anodisé argent mat — du hall, photo 03 et VO q_0372-0380,
  // ses montants sortent clairs, presque blancs ; l'aluminium gris à 70 % de métal y prenait le reflet du carrelage et
  // du hall chaud et sortait BRUN, comme du bois. De la rue, photos 16 et 17, il reste d'un gris argent moyen)
  const alu = M.aluGris.clone(); alu.color.setHex(0xbcc0c3); alu.metalness = 0.25; alu.roughness = 0.45; alu.name = 'aluminium anodisé de la porte 6';
  const vit = vitrophanies();
  const matRue = new THREE.MeshStandardMaterial({ map: vit.rue, alphaTest: 0.5, roughness: 0.4 });
  // (côté hall, l'adhésif est vu à contre-jour, la rue derrière lui : il s'éclaire un peu de lui-même — VO 93-95 s, le
  // visage et les arcs y sont clairs ; 10/10)
  const matHall = new THREE.MeshStandardMaterial({ map: vit.hall, alphaTest: 0.5, roughness: 0.6, emissive: 0xffffff, emissiveMap: vit.hall, emissiveIntensity: 0.32 });
  // un morceau de vitrophanie : la bande x a-b de la texture (VITRO), collée des deux côtés d'un vitrage
  // (10/10 : côté hall, le plan est tourné d'un demi-tour et ses u retournés — plus d'échelle négative : cousu par
  // l'optimisation du décor, le morceau du fixe ouest, miroir, tournait le dos au hall et disparaissait)
  const morceau = (parent, a, b, xl, zl) => {
    for (const [mat, s] of [[matRue, 1], [matHall, -1]]) {
      const g = new THREE.PlaneGeometry(b - a, hP);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i), uu = ((a + (s > 0 ? u : 1 - u) * (b - a)) - VITRO.x0) / VITRO.l;
        uv.setX(i, uu);
      }
      const m = new THREE.Mesh(g, mat);
      m.position.set(xl, hP / 2, zl + s * 0.008);
      if (s < 0) m.rotation.y = Math.PI;
      m.castShadow = false; parent.add(m);
    }
  };
  // LE REFLET DE LA RUE dans les vitres de la porte (photos 16, 17 : de la rue, le hall se devine, sombre et chaud,
  // derrière le reflet du ciel — le jeu le montrait en pleine lumière, plafond blanc et lignes lumineuses) : une face
  // sombre et brillante entre la vitre et les adhésifs, tournée vers la rue seulement (du hall, elle n'existe pas)
  // (relecture rue du 14/10, photos 16 et 17 rejouées à leur pose et mesurées aux mêmes endroits : les vantaux sortaient à
  // 110-136 de gris, bleutés, pour 78-84 sur les photos, le fixe ouest à 142 pour 68 — le hall se voyait presque en clair,
  // sous un reflet de ciel bleu : la face est plus dense et son reflet plus faible)
  const refletP6 = new THREE.MeshStandardMaterial({ color: 0x211f1d, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.87, depthWrite: false, envMapIntensity: 0.4 });
  refletP6.name = 'vitre de la porte 6 vue de la rue';
  const reflet = (parent, l, xl, zl) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(l, hP - cad - VITRO.bas), refletP6); r.position.set(xl, (hP - cad + VITRO.bas) / 2, zl + 0.004); r.castShadow = false; parent.add(r); };
  // un fixe : sa traverse basse (15 cm), ses montants, sa vitre jusqu'à la traverse haute
  const fixe = (x0, x1) => {
    ch.boite(x0, Y - 0.03, x1, Y + 0.03, 0, VITRO.bas, alu);
    ch.boite(x0, Y - 0.03, x0 + cad, Y + 0.03, 0, hP, alu);
    ch.boite(x1 - cad, Y - 0.03, x1, Y + 0.03, 0, hP, alu);
    ch.boite(x0, Y - 0.03, x1, Y + 0.03, hP - cad, hP, alu);
    const v = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 2 * cad, hP - cad - VITRO.bas), M.verre); v.position.set((x0 + x1) / 2, (hP - cad + VITRO.bas) / 2, z); ch.decor.add(v);
    C.ajouterBoite(x0, -(Y + 0.04), x1, -(Y - 0.04), { y1: hT, vitre: true });
    morceau(ch.decor, x0 + cad, x1 - cad, (x0 + x1) / 2, z);
    reflet(ch.decor, x1 - x0 - 2 * cad, (x0 + x1) / 2, z);
  };
  const xo = XC - LV, xe = XC + LV;                          // les gonds : x 14,15 et 16,11
  fixe(13.35, xo); fixe(xe, 16.5);
  // le caisson d'aluminium au-dessus des vantaux et des fixes, jusqu'au plafond du hall (VO q_0374 : la barre de
  // l'opérateur, pas d'imposte vitrée)
  ch.boite(13.35, Y - 0.05, 16.5, Y + 0.05, hP, hT, alu);
  C.ajouterBoite(13.35, -(Y + 0.04), 16.5, -(Y - 0.04), { y0: hP, y1: H_DALLE, vitre: true });
  // la double porte automatique : chaque vantail emporte son morceau de vitrophanie
  const P = ch.porte('x', Y, XC, { l: 2 * LV, h: hP, ep: 0.08, modele: 'vitree2', blanc: false, matCadre: alu, tirant: 'barres', cadre: cad, basVitre: VITRO.bas, etat: 'auto', cote: 'S', huisserie: false, nom: 'entrée n° 6' });
  for (const v of P.vantaux) {
    // le vantail : de son gond (x local 0) vers s * LV ; la bande de texture correspondante
    const xg = XC - v.s * LV;                   // le gond, en plan
    const a = Math.min(xg, xg + v.s * LV), b = Math.max(xg, xg + v.s * LV);
    const grp = new THREE.Group(); v.g.add(grp);
    morceau(grp, a + cad, b - cad, v.s * LV / 2, 0);
    reflet(grp, LV - 2 * cad, v.s * LV / 2, 0);
  }
  // le bloc de sortie côté hall, sur le caisson, au-dessus des vantaux
  ch.sortie(XC, Y + 0.08, 2.565, 'N');
}
// LA PAROI DU PASSAGE (photos 07, 19) : en aluminium laqué blanc, la double porte automatique, et au-dessus, jusqu'au
// plafond du passage (2,60), un bandeau PLEIN d'aluminium blanc. (09/10 : les photos 07 et 19 n'ont pas d'imposte vitrée
// — la traverse haute des vantaux, à 2,30, est juste sous ce bandeau.)
// (plan V2, 11/10 : la paroi passe de la ligne y 5,0 à la ligne y 4,05. Plus de fixes vitrés — les photos 07, 10 et 19
// n'en montrent aucun : la double porte va de la pile du plan d'évacuation (x 2,45) au mur est (x 4,425), deux vantaux
// de ≈ 0,99. À l'ouest, x 1,75-2,45, le pan plein est le dos de cette pile — crème comme le passage, une affiche et une
// grille de ventilation basse, photo 10.)
// (13/10, photo 19 refaite à sa pose — (3,59 ; 2,72) h 1,31 cap −8,7, tangage −2,1, f 600, 9 px sur les huit coins des
// vitrages : la tête des vantaux est à 2,30, et le plafond du passage rejoint la paroi à 2,37-2,43 — au-dessus des
// vantaux, le bandeau n'a que 12 cm, et non 30. Photo 10, de la rue : le haut de la paroi à 2,33-2,40, le plafond à 2,5
// au moins derrière le linteau ; photo 07, du hall : 2,6-2,7 côté rue. Le plafond du passage est donc un RAMPANT, de
// 2,62 à la façade à 2,42 à la paroi — construireCarte ; côté hall, l'arête du haut de la pile, sur la photo 06 refaite,
// monte de 2,21 à 2,44 : la gorge du hall rejoint la paroi à la même hauteur.)
// (14/10, LA LONGUEUR DU PASSAGE, 4,45 m — TOUJOURS 0,5 À 0,6 m DE TROP, et pas tranchée ici. Le carrelage de la photo 07,
// redressé à sa pose, se compte : dix files de 26,7 cm d'un mur à l'autre, des rangs de 52,7 — de la paroi au seuil,
// 1,40 fois la largeur, soit 3,75 à 3,9 m pour 2,675 ; la photo 10 donne 3,7 à 3,95 (f 600 à 640). Mais la photo 06 tient
// la paroi à 0,97 m de la porte grise, à 5 px : raccourcir le passage, c'est avancer de 0,5 m vers la rue TOUTE la chaîne
// — hall ouest, escalier, ouest du -1, arrivée au 1er —, contre la salle d'attente, juste. L'autre lecture, que le
// carrelage soit du 30 x 60 et la porte 12 % plus grande — 2,2 x 2,55 —, ne tient pas : la photo 06 voit la tête des
// vantaux à 2,35, sous le plafond à 2,30-2,44 du hall. En attendant, le liège et les réglettes prennent le demi-mètre.)
// (14/10, RELECTURE — LA PORTE EST PLUS GRANDE, ET LE PASSAGE PLUS LARGE ; SA LONGUEUR, ELLE, EST JUSTE. Quatre photos le
// disent, chacune à sa façon. Photo 06, posée sur le hall à 15 points : le coin du vitrage ouest, en haut, côté gonds,
// tombe 65 px plus haut que dans le jeu — le verre monte à 2,34-2,37, et non 2,20 — ; au pied, du nu de la pile au verre,
// 19 cm de dormant et de montant, et non 7. Photo 07, posée sur la porte seule — 4,5 px, quand la porte du jeu en
// laissait 11,5 — : l'affichette A4 du vantail ouest y mesure 21 cm de haut si le verre monte à 2,37, 19,6 s'il s'arrête
// à 2,20 ; le haut du cadre de la porte « Sortie » sort à 2,10-2,16 ; le vitrage fait 0,86 de large, les deux
// montants de battement 17 cm, la tête des vantaux est à 2,47 ; les pieds des deux murs sont à 2,9-3,0 m l'un de
// l'autre. Photo 19 : contre les points du hall, la porte veut 6,4 % de haut en plus. Photo 10, enfin, de la rue : le
// pied de la façade et celui de la porte du fond sont au même niveau — à 4,45 m l'un de l'autre, cela met l'appareil à
// 1,59 m et non 1,75, le linteau toujours à 2,46, la porte du fond à 2,20 x 2,47 hors tout et le fond du passage à
// 2,95 m ; en ramenant la paroi à 3,7 m, on penchait l'appareil de 2° pour garder la porte de 1,975. Le carrelage dit
// la même chose : dix files d'un mur à l'autre et 1,40 fois la largeur de la paroi au seuil, ce sont des carreaux de
// 30 x 60 recoupés au bord et 2,95 m de large. Le dormant fait donc 2,25 m, de la pile (x 2,45) au mur est, qui recule
// de 4,425 à 4,70 ; les vantaux, 1,035 x 2,47, cadre de 9 cm — un verre de 0,855 x 2,25 : 0,38 de large pour 1 de haut
// sur les photos 07, 19 et 10 — ; le plafond du passage est PLAT, à 2,60 — photo 19, 25 cm au-dessus du verre —, et non
// plus un rampant de 2,62 à 2,42. Les photos 19 et 07, reposées sur cette porte : 5 à 6 px sur les vitrages, et le bout
// de mur jaune, le plafond, l'affichette, les étiquettes, les tirants y retombent à 3 cm.)
function construireParoiPassage(ch) {
  const { M, C } = ch, Y = 4.05, hP = 2.47, hT = 2.595, X0 = 2.45, X1 = 4.7, DORMANT = 0.09;
  const montant = (x) => ch.boite(x - DORMANT / 2, Y - 0.04, x + DORMANT / 2, Y + 0.04, 0, hT, M.alu);
  for (const x of [X0 + DORMANT / 2, X1 - DORMANT / 2]) montant(x);
  ch.boite(X0, Y - 0.04, X1, Y + 0.04, hP, hP + 0.06, M.alu);
  ch.boite(X0, Y - 0.025, X1, Y + 0.025, hP + 0.06, hT, M.alu);
  C.ajouterBoite(X0, -(Y + 0.05), X1, -(Y - 0.05), { y0: hP, y1: H_DALLE });
  // le pan plein : le dos de la pile (construireMurs), peint en crème côté passage (son affiche : js/ecole_mobilier.js)
  ch.panneau(M.creme, X0 - 1.75, hT, (1.75 + X0) / 2, Y - 0.002, hT / 2, 'S');
  // LES AUTOCOLLANTS « iris » (photos 07, 19) : deux rangées de quatre sur le vantail EST (s = -1 : à droite vu du
  // passage), un seul au milieu du vantail ouest (relecture du 11/10, photo 07 rejouée à sa pose, (3,86 ; 5,27) h 1,30
  // cap 193 : les rangées à 0,99 et 1,46, le seul du vantail ouest à 1,29)
  // (13/10, photo 19 refaite à sa pose : les rangées du vantail est à 0,95 et 1,425, quatre autocollants au pas de
  // 17 cm, le premier à 23,5 cm des gonds — le jeu les étalait au pas de 23 ; le seul du vantail ouest à 1,27)
  // (14/10, photo 19 agrandie : une étiquette fait 7,8 x 4,2 cm — 37 px pour un pas de 81 —, et non 11 x 4 ; les tirants
  // sont des méplats blancs coudés, de 0,22 à 1,57 : js/ecole_portes.js, `plat`)
  // (14/10, relecture, la porte à sa taille — photo 07 posée sur elle, photo 19 : les rangées du vantail est à 1,025 et
  // 1,53, quatre étiquettes de 8,2 x 4,5 cm au pas de 17,6, la première à 22,5 cm des gonds ; celle du vantail ouest à
  // 1,375, sous l'affichette ; les méplats des tirants de 0,25 à 1,68)
  const rangs = (s) => (s < 0 ? [[1.025, 4, 0.225, 0.176, 0.082, 0.045], [1.53, 4, 0.225, 0.176, 0.082, 0.045]] : [[1.375, 1, undefined, undefined, 0.082, 0.045]]);
  ch.porte('x', Y, (X0 + X1) / 2, { l: X1 - X0 - 2 * DORMANT, h: hP, ep: 0.08, modele: 'vitree2', cadre: 0.09, tirant: 'plat', plat: [0.25, 1.68], autocollants: rangs, etat: 'auto', cote: 'S', huisserie: false, nom: 'passage' });
  // LE BLOC DE SORTIE côté hall, au-dessus des vantaux, au milieu (plan V2 : (3,3 ; 4,17)). (Relecture du 11/10 : la photo
  // 07 rejouée à sa pose le montre AU-DESSUS de la traverse haute, de 2,33 à 2,45, un bloc à pictogramme — le coureur et
  // sa porte —, et non un boîtier de détecteur : le plafond du hall remonte contre la paroi, construireCarte. Du passage,
  // le bandeau plein le cache, comme sur la photo 19.)
  // (13/10, photo 07 refaite à sa pose — (3,90 ; 5,28) h 1,23 cap 194,4, tangage −10,2 —, agrandie : c'est un boîtier
  // SOMBRE, sa face d'un vert presque noir où l'on devine le coureur, un voyant AMBRE allumé en bas ; il n'éclaire pas.
  // Centré sur les vantaux, de 2,27 à 2,40, à 10 cm de la paroi. Le jeu y mettait un pictogramme vert vif.)
  {
    // (14/10, relecture, photo 07 reposée sur la porte à sa taille : il fait 28 cm et non 36 — x 3,44-3,72 —, son dessous
    // à 2,45, juste au-dessus de la tête des vantaux, pris dans la gorge du plafond)
    const g = new THREE.Group(); g.position.set((X0 + X1) / 2, 2.51, -(Y + 0.115)); g.rotation.y = Math.PI; ch.decor.add(g);
    maille(boiteM(0.28, 0.11, 0.05), M.noirMat, 0, 0, 0, 0, g, { ombre: false });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.09), new THREE.MeshStandardMaterial({ map: texSortieEteinte(), roughness: 0.35 }));
    face.position.z = 0.026; g.add(face);
    const voyant = new THREE.Mesh(new THREE.CircleGeometry(0.008, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.3, 0.25) }));
    voyant.position.set(-0.04, -0.034, 0.0265); g.add(voyant);
    g.traverse((m) => { m.userData.horsAOSol = true; });
  }
}
// la face éteinte d'un bloc de sortie : vert bouteille très sombre, le coureur et sa porte à peine plus clairs
function texSortieEteinte() {
  return canvasTex(128, 44, (g, w, h) => {
    g.fillStyle = '#0d1611'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a3a30'; g.fillRect(78, 8, 20, 30); g.fillStyle = '#0d1611'; g.fillRect(82, 12, 12, 26);
    g.fillStyle = '#34463b'; g.beginPath(); g.arc(58, 12, 4, 0, 7); g.fill();
    g.fillRect(54, 17, 8, 12); g.fillRect(48, 28, 6, 9); g.fillRect(60, 28, 6, 9); g.fillRect(46, 18, 8, 3); g.fillRect(62, 20, 9, 3);
    g.fillRect(22, 20, 18, 4); g.beginPath(); g.moveTo(22, 14); g.lineTo(12, 22); g.lineTo(22, 30); g.closePath(); g.fill();
  }, null, false, 4);
}

// =====================================================================
//  LE REZ-DE-CHAUSSÉE
// =====================================================================
function construireMurs(ch) {
  const { M } = ch;
  // (13/10, photos 07, 10 et 19 : sous ses réglettes, la peinture du passage est d'un crème JAUNE — (235, 215, 160) près
  // des tubes, (240, 225, 180) en face ; elle sortait presque blanche)
  // (14/10, photos 07 et 19 mesurées contre la porte « Sortie » et les cadres d'aluminium, blancs : au pied des murs,
  // sous le jour de la rue, la peinture est presque blanche — à 0,99 / 0,97 / 0,93 de la porte — ; c'est EN HAUT, près des
  // réglettes, qu'elle jaunit — (188, 158, 122). La teinte revient vers le blanc cassé, et la lueur jaune des réglettes
  // est peinte sur le haut des murs et le plafond : construireCarte, « les luminaires ».)
  M.creme.color.setRGB(1.0, 0.972, 0.885);
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
  // (14/10, relecture — photo 07 posée sur la porte vitrée à sa taille, (4,01 ; 5,34) h 1,42 cap 192,3 : le cadre de la
  // porte « Sortie » va de y 0,5 à 1,65 par ses angles du haut — à 2,07-2,12, la hauteur d'un cadre —, de 0,78 à 1,88 par
  // ses pieds ; la pose du 13/10, sur la porte trop petite, la lisait de 1,2 à 2,0, son cadre à 1,95. Son axe passe de
  // 1,6 à 1,3.)
  ch.mur({ de: [1.675, -0.2], a: [1.675, 4.05], mats: { E: CR, W: B }, ouvertures: [{ c: 1.3, l: 0.9, h: 2.04 }] });
  ch.porte('y', 1.675, 1.3, { l: 0.9, h: 2.04, modele: 'blanche', etat: 'auto', cote: 'E', charniere: 'd', nom: 'service (passage)' });
  for (const [a0, a1] of [[0, 0.85], [1.75, 4.05]]) ch.boite(1.75, a0, 1.762, a1, 0, 0.09, PG, { ombre: false });
  ch.boite(4.688, 0, 4.7, 4.05, 0, 0.09, PG, { ombre: false });
  ch.boite(1.75, 4.038, 2.45, 4.05, 0, 0.09, PG, { ombre: false });
  // le mur ouest du hall (ligne x 1,675), derrière la pile, le renfoncement de la porte grise et l'avancée nord
  // (13/10, la volée 2 de l'escalier principal à sa vraie pente — construireEscalier : elle passe au-dessus de ce mur, du
  // 1er, en y 6,0, jusqu'au mur des portes. Sous son palier, il monte à la dalle ; puis il s'arrête au-dessus du plafond
  // du renfoncement, à 2,45 — la sous-face est à 2,48 en y 7,22 — ; derrière l'avancée nord, à 1,60, sous le limon)
  ch.mur({ de: [1.675, 4.05], a: [1.675, ESC.yT], mats: B, plinthes: ['E'], ouvertures: [{ c: 9.575 + DY_SS, l: 0.95, h: 2.04 }] });
  ch.mur({ de: [1.675, ESC.yT], a: [1.675, 7.22], h: 2.45, mats: B, plinthes: ['E'] });
  ch.mur({ de: [1.675, 7.22], a: [1.675, 8.925], h: 1.6, mats: B });
  // (09/10, la vidéo du sous-sol : elle ouvre sur le palier de l'escalier du -1, js/ecole_soussol.js ; on la TIRE depuis le
  // hall — vantail côté hall, gonds au sud, barre inox verticale, ferme-porte à glissière côté hall, photo 06 et v_001)
  // (plan V2 : y 5,02-5,95, à 0,97 m de la paroi vitrée — la chaîne du -1 suit, DY_SS ; sa fente vitrée est la longue,
  // de 0,6 à 1,85 : photo 06 et r01, elle descend aux deux tiers de la porte, le jeu la mettait de 1,0 à 1,85)
  // (13/10 : sa fente est un vrai jour de verre clair — photo 06, on y voit le palier éclairé et son panneau jaune ;
  // elle était un vitrage posé sur un vantail plein, gris à contre-jour)
  // (14/10, photo 06 à sa pose, mesurée au pixel sur la rangée 330 — le vantail de 557 à 731 : la fente est LARGE, un
  // verre de 15,5 cm dans un cadre de noyer de 4 cm, 23,5 hors tout, son bord à 15 cm du chant — le jeu : 10 cm dans 3 ;
  // le vantail est d'un gris TAUPE soutenu, à 0,55 / 0,51 / 0,46 du mur blanc voisin — le jeu : 0,78, un gris clair ; le
  // ferme-porte : une glissière d'aluminium gris clair de 0,70 m sur la traverse de l'huisserie, depuis l'angle de la
  // pile, et un petit boîtier BLANC en haut du vantail, près des gonds — le jeu : un gros boîtier gris foncé au mur)
  const taupe = new THREE.MeshStandardMaterial({ color: 0x979795, roughness: 0.45 }); taupe.name = 'vantail gris taupe (porte grise du hall ouest)';
  // (14/10, relecture : un rien plus chaud — photo 06, 0,26 / 0,23 / 0,15 du mur du plan d'évacuation ; le jeu 0,29 / 0,25
  // / 0,21)
  taupe.color.multiply(new THREE.Color(0.94, 0.93, 0.78));
  const PG0 = ch.porte('y', 1.675, 9.575 + DY_SS, { l: 0.93, h: 2.04, modele: 'grise', oculus: { bas: 0.63, haut: 1.84, l: 0.155, bord: 0.27, cadre: 0.04, clair: true }, matVantail: taupe, poignee: 'tirant', fermePorte: false, etat: 'auto', cote: 'E', libre: 1, nom: 'service (hall)' });
  {
    const glis = new THREE.MeshStandardMaterial({ color: 0xb1b3b0, roughness: 0.45, metalness: 0.3 }); glis.name = 'glissière de ferme-porte (hall ouest)';
    ch.boite(1.762, 4.975, 1.795, 5.69, 2.05, 2.085, glis, { ombre: false });
    ch.boite(1.77, 5.14, 1.782, 5.6, 2.036, 2.05, M.ferme, { ombre: false });
    const v = PG0.vantaux[0];
    maille(boiteM(0.22, 0.06, 0.042), M.boitier, v.s * 0.21, 2.04 - 0.05, 0.041, 0, v.g, { ombre: false });
  }
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
  // (13/10 : la volée 2 à sa vraie pente passe DANS l'avancée, qui est son coffrage — à l'ouest de x 1,975, elle s'arrête
  // à 1,60, sous le limon ; sa face sud, où est le radiateur, monte jusqu'au-dessus du plafond du hall, 2,32)
  for (const [ya, yb, faces] of [[4.05, 4.97, ['E', 'N']], [7.22, 8.925, ['E', 'S']]]) {
    const xa = 2.45, xc = ya > 7 ? ESC.x2e : 1.75;
    if (xc > 1.75) { ch.boite(1.75, ya, xc, ya + 0.04, 0, 2.32, B, { collision: true }); ch.boite(1.75, ya + 0.04, xc, yb, 0, 1.6, B, { collision: true }); }
    ch.boite(xc, ya, xa, yb, 0, H_DALLE, B, { collision: true });
    if (faces.includes('E')) ch.boite(xa, ya, xa + 0.015, yb, 0, 0.08, M.bois, { ombre: false });
    if (faces.includes('S')) ch.boite(1.75, ya - 0.015, xa + 0.015, ya, 0, 0.08, M.bois, { ombre: false });
    if (faces.includes('N')) ch.boite(1.75, yb, xa + 0.015, yb + 0.015, 0, 0.08, M.bois, { ombre: false });
  }
  // (14/10, relecture — photo 06 (r01) rejouée à sa pose, les teintes rapportées au mur du plan d'évacuation, sous le
  // cadre : le mur du fond du RENFONCEMENT est dans la pénombre, à 0,96 / 0,96 / 0,79 de ce mur ; le jeu l'éclairait en
  // plein, 1,21 / 1,22 / 1,25, et d'un blanc froid. Un voile qui multiplie, à 2 mm du mur — l'ouverture de la porte
  // grise laissée libre : son vantail, lui, était juste (plus haut) ; l'huisserie, la glissière, l'extincteur et ses plaques,
  // devant, n'en sont pas touchés. Le retour nord de la pile, l'angle rentrant, de même : 0,42 / 0,40 / 0,32 sur la
  // photo, 0,82 / 0,84 / 0,87 au jeu — le décroché d'ombre à l'angle de la pile ne se voyait plus.)
  {
    const ombre = (c) => { const m = new THREE.MeshBasicMaterial({ color: c, blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false }); m.name = 'pénombre du renfoncement (hall ouest)'; return m; };
    const fond = ombre(new THREE.Color(0.75, 0.78, 0.7)), retour = ombre(new THREE.Color(0.62, 0.6, 0.55));
    const pan = (mat, w, h, x, y, z, ry) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, z, -y); m.rotation.y = ry; m.renderOrder = 1;
      m.castShadow = false; m.receiveShadow = false; m.userData.horsAOSol = true; m.userData.sansNormales = true; nePasFusionner(m); ch.decor.add(m);
    };
    pan(retour, 0.7, 2.3, 2.1, 4.972, 1.15, Math.PI);
    const yp0 = 9.575 + DY_SS - 0.465, yp1 = yp0 + 0.93;   // (l'ouverture de la porte grise : 5,02-5,95)
    pan(fond, yp0 - 4.97, 2.3, 1.752, (4.97 + yp0) / 2, 1.15, Math.PI / 2);
    pan(fond, 7.22 - yp1, 2.3, 1.752, (yp1 + 7.22) / 2, 1.15, Math.PI / 2);
    pan(fond, yp1 - yp0, 0.26, 1.752, (yp0 + yp1) / 2, 2.17, Math.PI / 2);
  }
  // le mur est du passage : la ligne x 4,5 (plan V2 : le trumeau des travées 3 et 4 ; derrière, la Si 0.1), jusqu'au mur
  // sud de la salle d'attente (ligne y 4,8) ; au nord, le hall s'ouvre sur la salle. (La porte de l'ex-salle A n'est plus
  // ici : sur le mur sud de la salle d'attente.) (Côté passage, sa plinthe grise : plus haut.)
  // (14/10, relecture — le passage fait 2,95 m, construireParoiPassage : son mur est recule au nu x 4,70. Pour ne rien
  // prendre de plus à la Si 0.1, imaginée et réglée au pas du joueur, c'est une cloison MINCE, 3 cm, nu 4,73 côté salle
  // — elle y perd 15,5 cm ; js/ecole_pieces.js. À la façade, dont l'ouverture garde ses 2,25 m, il laisse un RETOUR de
  // 27 cm derrière le jambage est, comme le trumeau de l'ouest : photo 10, le pied du mur est se perd derrière le
  // jambage 40 rangs avant le seuil ; photo 07, une bande brun sombre entre le liège et le poteau de la grille, et la
  // même, haute de 20 cm, au-dessus de l'ouverture — la face intérieure du bâti. Elle était blanche.)
  // (relecture de la rue : il part du nu intérieur de la façade, y 0 — son about ne scintille plus sur la pierre)
  ch.mur({ de: [4.715, 0], a: [4.715, 4.05], ep: 0.03, mats: { W: CR, E: B } });
  {
    const brun = new THREE.MeshStandardMaterial({ color: 0x3b3029, roughness: 0.7 }); brun.name = 'bâti de la grille, face intérieure (passage)';
    // (intégration v2.0 : l'ouverture monte maintenant à 2,57 — le linteau de la relecture de la rue, photo 10, où le
    // plafond du passage se voit juste sous le linteau, de part et d'autre du boîtier. Pendue à 2,45, la bande du haut
    // barrait l'ouverture vue de la rue : elle part de 2,57.)
    for (const [a, b, h0] of [[1.75, 2.175, 0], [4.425, 4.7, 0], [2.175, 4.425, 2.57]]) ch.boite(a, 0, b, 0.006, h0, 2.595, brun, { ombre: false });
    for (const [a, b] of [[1.75, 2.175], [4.425, 4.7]]) ch.boite(a, 0, b, 0.018, 0, 0.1, brun, { ombre: false });   // (devant la plinthe de bois de la façade)
  }
  // (r03, 12/10 : le mur sud de la salle recule de 0,20 — DY_R03 — ; ce mur s'arrête à son nu, 4,675)
  // (14/10, relecture, photo 19 agrandie : par le vantail est, tout au bord droit, ce bout de mur est JAUNE SAFRAN,
  // plinthe de bois au pied — son angle nord à 2,2 m de l'appareil. Il était blanc, et 27 cm plus à l'ouest.)
  ch.mur({ de: [4.715, 4.05], a: [4.715, ATT.ys + EP / 2], ep: 0.03, mats: { W: M.orange, E: B }, plinthes: ['W'] });
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
  // (14/10, relecture du hall ouest : il part du nu du mur est du passage, x 4,70 — plus haut)
  ch.mur({ de: [4.7, YS], a: [XE, YS], mats: B, plinthes: ['N', 'S'], ouvertures: JOURS_S.map((c) => ({ c, l: J_L, bas: J_BAS, h: J_H })) });
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
  // (13/10, relecture C2 — photo 01 : vu du C01, le bout EST du mur est blanc lui aussi — c'est l'angle du mur ouest du
  // couloir ; le jeu y montrait un filet safran de haut en bas, à gauche de la porte du local)
  ch.boite(11.7, YN - 0.075, 11.703, YN + 0.075, 0, H_DALLE, B, { ombre: false });
  // (13/10, relecture C2 — LA LISSE EST PLUS BASSE. Sur l'arête du mur jaune des photos 05 et 04, du sol à la sous-face
  // de la retombée (2,30), sans passer par la pose : photo 05 — sol v 1526, plinthe 1477, lisse 1170-1073, sous-face
  // 327 —, la lisse va de 0,745 à 0,94 ; photo 04 — 1435, 1154-1067, 414 —, de 0,68 à 0,88. Elle était à 0,85-1,05,
  // 12 cm trop haut : sur la photo 05 rejouée, elle tombait 55 px au-dessus de la vraie. Sur r02 et la photo 02, elle
  // passe bien DERRIÈRE le haut des dossiers des coques (0,80 m), qui la mordent. De 0,73 à 0,93.)
  ch.boite(C05.xE, YN - 0.085, 11.7, YN - 0.075, 0.73, 0.93, M.lissePVC, { ombre: false });
  for (const h of [0.73, 0.928]) ch.boite(C05.xE, YN - 0.09, 11.7, YN - 0.085, h, h + 0.004, M.lisseGrise, { ombre: false });
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
  // (13/10, relecture C2 — photo 23, la fente de près : du chant du vantail au bois, 12 cm et non 6 ; le cadre de noyer
  // fait 3 cm, pas 4, et la fente 22 cm hors tout, pas 25 — elle était trop large et collée à la béquille)
  for (const [c, nom] of WC_C05) ch.porte('y', C05.xM, c, { l: C05.lWC, h: 2.04, modele: 'grise', etat: 'auto', cote: 'W', retrait: 0.05, libre: 1, poignee: 'rosace', oculus: { bas: 0.63, haut: 1.82, l: 0.16, bord: 0.265, cadre: 0.03 }, nom });
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
  // (RETOUR r07 DE HAYTHEM DU 14/10 — sa capture du jeu, rejouée : la caméra en (14,72 ; 3,13) à 1,99 m, cap −78,3, piqué
  // 15,4, f 670 — seize points du retour, de la porte, de la plaque, du drapeau, du pilier, de l'angle et du jour du
  // bureau, 5,5 px —, Haythem en (12,3 ; 3,6), dans le passage de la pile, face à l'ouest : « Attention, la porte avec le
  // mur n'est pas aussi loin »,
  // puis « regarde bien les photos pour ça ». Le mur, c'est le retour de l'antichambre et la porte grise de la Si 0.1 ; il
  // était à 4,06 m de la ligne de la pile (x 9,24 -> 13,30). AUCUNE PHOTO NE LE MONTRE (r02 le voit de dos, caché par le
  // bout du mur sud ; la photo 01 s'arrête au bout du mur ouest du C01 ; la photo 03 tourne le dos ; la VO de 2021 n'en
  // montre que l'angle, la plaque du bureau de direction contre les jours) — mais r02 MESURE la profondeur de ce qui
  // l'entoure, sans pose : à 2,60 sous plafond (le sol, l'arête du plafond), le pilier fait 955 px de haut (le jeu, rejoué
  // à la pose de la relecture : 963) et le mur du fond, la face ouest de la pile, 562 px (le jeu : 515). Rapportée à celle
  // du pilier, la face de la pile est à 1,71 fois sa distance, et non 1,88 : de la ligne du bout du mur sud, la pile n'est
  // qu'à 3,3-3,5 m dans la photo (± 0,2), et non 4,06 — le bout du mur, lui, est à sa place (4,74 m de l'appareil sur r02,
  // 4,57 au jeu, à 0,18 m du cadre du jour est), comme le pilier et les jours (photos r02 et 02 : le jour ouest à 4,51 m de
  // l'appareil de la 02, le jeu 4,58 ; l'angle ouest du mur sud à 6,5, le jeu 6,49). Le mur sud ne pouvant s'allonger — sur
  // r02, à droite du pilier, l'ouverture vers le hall se fermerait — ni la pile reculer (le hall, la porte 6), C'EST LE MUR
  // DE LA PORTE QUI AVANCE : il passe sur la ligne du mur entre la Si 0.1 et le bureau, x 9,975, qui monte maintenant
  // jusqu'au mur du redan (nu est 10,05 : 0,81 m plus près, à 3,25 m de la pile) ; entre lui et le bout du mur sud, un
  // REDAN de 0,81 x 0,55, sous la ligne de visée de r02 qui rase le bout du mur (y 4,16-4,20 en x 10,05 : le redan, nu
  // 4,125, reste caché sur r02, et l'ouverture vers le hall est intacte) ; la plaque du bureau de direction reste sur le
  // chant du bout du mur, face à l'est, contre les jours (VO q_0040-0043), le drapeau sur sa face nord (r02). La Si 0.1
  // gagne l'angle x 9,09-9,9 × y 2,85-3,975.)
  // (RELECTURE r07 DU 14/10, mesures refaites : r02, hauteurs sol-plafond prises à la même colonne sur la photo et sur le
  // jeu rejoué à la même pose — le pilier 958 px (jeu 956), la face ouest de la pile près de son angle 547 px (jeu 505) :
  // 1,75 contre 1,89, la pile 0,63 m (± 0,2) plus près du pilier et du bout du mur sud qu'au jeu ; et l'ouverture vue à
  // droite du pilier ne fait que 4,9° sur la photo, 8,5° au jeu — le bout du mur est plutôt à l'est de sa place qu'à
  // l'ouest. La photo 22 (2021), posée sur la pile seule — neuf points, f 480, l'appareil juste passé la porte 6 —, voit
  // le pilier à sa place par rapport à la pile, à 0-0,4 m près selon la focale. Les deux bornent la ligne du mur de la
  // porte à 3,1-3,5 m de la pile : 3,25 est dedans. Aucune photo ne montre ce mur de face ; le redan reste caché sur r02,
  // la photo 02 et la VO, qui sont identiques avant et après.)
  const XSB = 9.975, YRD = 4.05;
  // le mur entre la Si 0.1 et le bureau, prolongé au nord jusqu'au mur du redan : c'est maintenant LE MUR DE LA PORTE de la
  // Si 0.1 (r07), sa face est fermant l'antichambre à l'ouest (y 3,0-4,125)
  const P_SI = { c: 3.53, l: 0.8 };
  ch.mur({ de: [XSB, 0], a: [XSB, YRD - EP / 2], mats: B, plinthes: ['W', 'E'], ouvertures: [{ c: P_SI.c, l: P_SI.l, h: 2.04 }] });
  // LE MUR DU REDAN (ligne y 4,05, du retour du bout du mur sud au mur de la porte) ; la plinthe de son about, côté
  // antichambre, prolonge celle du mur de la porte
  ch.mur({ de: [XE - EP, YRD], a: [XSB + EP / 2, YRD], mats: B, plinthes: ['N', 'S'] });
  ch.boite(XSB + EP / 2, YRD - EP / 2, XSB + EP / 2 + 0.015, YRD + EP / 2 + 0.015, 0, 0.08, M.bois, { ombre: false });
  // (relecture r07, 14/10 : et celle de son about ouest, côté Si 0.1 — x 9,09, de 3,975 à 4,125, entre la plinthe du mur
  // du redan et celle du retour du bout du mur sud : il manquait 15 cm de plinthe dans l'angle de la salle)
  ch.boite(XE - EP - 0.015, YRD - EP / 2 - 0.015, XE - EP, YRD + EP / 2, 0, 0.08, M.bois, { ombre: false });
  // LE MUR NORD DU BUREAU, ligne y 2,925 (x 10,05-12,575 ; r07 : il partait de x 9,09, la Si 0.1 a pris son bout ouest), et
  // son JOUR DÉPOLI (photo 01 : 0,6 m, de 1,05 à 2,5, sa bande haute claire laisse voir les barreaux de la fenêtre de façade
  // c 10,73 derrière lui ; son bord est à 0,91 m de l'angle, en x 11,63 — rétroprojeté du C01 sur la ligne 3,1, il tombe en
  // x 11,03-11,63, devant cette fenêtre)
  const JOUR_B = { c: 11.33, l: 0.6, bas: 1.05, h: 2.5 };
  ch.mur({ de: [XSB + EP / 2, YB], a: [12.575, YB], mats: B, plinthes: ['N', 'S'], ouvertures: [{ c: JOUR_B.c, l: JOUR_B.l, bas: JOUR_B.bas, h: JOUR_B.h }] });
  const nordB = new THREE.Group(); nordB.position.set(0, 0, -YB); ch.decor.add(nordB);
  fenetreDepolie(nordB, M, { x: JOUR_B.c, l: JOUR_B.l, haut: JOUR_B.h, bas: JOUR_B.bas, ep: EP, bandeClaire: 0.5 });
  ch.C.ajouterBoite(JOUR_B.c - JOUR_B.l / 2, -(YB - 0.05), JOUR_B.c + JOUR_B.l / 2, -(YB + 0.05), { y0: JOUR_B.bas, y1: JOUR_B.h, vitre: true });
  // LE RETOUR x 9,165 (nu est 9,24 ; y 3,0-4,725), entre le bout du mur sud et le mur du bureau, et LA PORTE DE LA Si 0.1
  // (IMAGINÉE : aucune photo ne la montre — r02 voit ce retour de dos ; sur la VO q_0040-0042, le bord gauche du cadre ne
  // montre que la plaque du bureau de direction, à l'angle, et le chant d'une huisserie juste au sud) : grise, 0,8 m,
  // c 3,98, elle s'ouvre toujours dans la salle, gonds au nord — son vantail ouvert se range le long du mur nord de la
  // salle, dans l'allée entre le rang du fond et la toile, et non sur le bout des tables
  // (r07, 14/10 : le retour n'est plus que le RETOUR DU BOUT DU MUR SUD, du mur du redan au mur sud — y 4,125-4,525 ; son
  // chant est, x 9,24, de 4,125 à 4,675, porte la plaque du bureau de direction. La porte de la Si 0.1 est passée dans le
  // mur x 9,975, plus haut : même porte, même sens — gonds au nord, elle s'ouvre dans la salle et son vantail ouvert se
  // range contre le mur du redan ; c 3,53, à 0,13 m du nu du bureau et 0,195 de l'angle du redan)
  const XR = XE - EP / 2;
  ch.mur({ de: [XR, YRD + EP / 2], a: [XR, YS - EP / 2], mats: B, plinthes: ['E', 'W'] });
  ch.porte('y', XSB, P_SI.c, { l: P_SI.l, h: 2.04, modele: 'grise', etat: 'auto', cote: 'W', charniere: 'd', libre: -1, nom: 'Si 0.1' });
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
  ch.mur({ de: [13.275, 0], a: [13.275, 0.3], mats: { E: M.noirMat, W: B } });
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
  // (le mitoyen est du hall, x 19,95 de y -0,4 à 7,65 : peint gris ardoise derrière le comptoir, du bord sud du miroir au
  // local technique, blanc de l'angle de la façade au miroir — js/ecole_hall.js, 10/10 ; retours r04 du 12/10, r05 du 13/10)
  // ---- L'ESCALIER : la cage (jusqu'au plafond de l'étage), les portes coupe-feu ----
  // (plan V2 : tout recule de DY_S. Le mur des portes est sur la ligne y 9,0 ; plus de trumeau entre les portes et le C05
  // — l'ouverture, élargie, va jusqu'au jambage, x 4,45, et le C05 commence au mur est de la cage)
  // (intégration du 11/10 : le mur est de la cage sur la ligne 4,525, le mur des portes arrêté à son nu est, x 4,6 — le C05
  // commence au jambage des portes, photo 23)
  // (finitions du 11/10, l'escalier refait sur les photos 20, 06 et r01 — construireEscalier : à l'ouest de l'échiffre,
  // x 1,6-1,975, le mur des portes s'arrête à 2,50, sous la volée 2 ; l'ancien mur ouest de la cage, ligne 1,675, n'est
  // plus — la cage va jusqu'au nu 0,75, au-dessus de la réserve ouest imaginée et de la trémie du -1 ; son mur du fond,
  // celui des affiches, est sur la ligne 13,275)
  // (13/10, la volée 2 à sa vraie pente : elle traverse la ligne du mur des portes de 1,6 à 2,0 m — à l'ouest de
  // l'échiffre, le mur s'arrête à 1,55 ; au-dessus des portes, il monte d'un jet jusqu'au plafond de la cage : plus de
  // palier du 1er en balcon ni de double porte ici, la volée arrive 3 m plus au sud — js/ecole_etage1.js)
  ch.mur({ de: [1.6, Y_ESC], a: [ESC.x2e, Y_ESC], h: 1.55, mats: B });
  // (13/10, lot C2 — photo 23 : du chant du vantail fermé au nu ouest du C05, 8 cm — le montant de l'huisserie, puis un
  // about de mur de 5 à 6 cm et sa plinthe ; le jeu en mettait 15, un pan blanc trois fois plus large qui cachait la
  // moitié de la porte bleue. Le mur est de la cage, sous la dalle, n'est qu'une cloison de 8 cm, du nu 4,45 de la volée 1
  // au nu 4,53 du couloir ; au-dessus de la dalle, il garde sa ligne.)
  ch.mur({ de: [ESC.x2e, Y_ESC], a: [C05.xO, Y_ESC], mats: B, plinthes: ['S'], ouvertures: [{ c: 3.45, l: 2.0, h: 2.1 }] });
  ch.mur({ de: [ESC.x2e, Y_ESC], a: [4.6, Y_ESC], base: H_DALLE, h: H_CAGE, mats: B });
  ch.mur({ de: [(ESC.x1e + C05.xO) / 2, 13.6 + DY_S], a: [(ESC.x1e + C05.xO) / 2, 18.75 + DY_S], ep: C05.xO - ESC.x1e, h: H_DALLE, mats: B, plinthes: ['E'] });
  ch.mur({ de: [4.525, 13.6 + DY_S], a: [4.525, 18.75 + DY_S], base: H_DALLE, h: H_CAGE, mats: B });
  // le mur ouest de la cage (ligne 0,675), de la trémie du -1 au mur du fond (au sud de y 10,25, au-dessus de la trémie,
  // il suit la sous-face de la volée 2 : construireEscalier)
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
  // (13/10 : au 1er étage, le mur sud du palier — ligne y 7,85 — et sa double porte coupe-feu, imaginés, ne sont plus
  // ici : la volée 2, à sa vraie pente, arrive au bout ouest du couloir sombre, en y 6,0 ; la double porte « 1er étage »
  // est en travers de ce couloir — js/ecole_etage1.js)
  // LES PORTES COUPE-FEU DE L'ESCALIER (photos 04, 06, 20) : deux vantaux de 1,0 m, x 2,45-4,45 (plan V2 ; le jeu avait
  // 2 x 0,90 à partir de x 2,6). Le vantail ouest ouvert à demeure vers le hall, À PLAT contre l'avancée nord, l'affiche
  // jaune du tri derrière lui (photos 06, 20 : x 2,45-2,50, y 8,0-9,0 ; il était décollé de 25 cm — à 88°, il frôle
  // l'affiche sans la traverser) ; l'est fermé, ses deux A4 l'un au-dessus de l'autre (js/ecole_mobilier.js) ; une
  // huisserie, et le rail du ferme-porte sur toute la largeur, côté hall (photos 06, 20 : la barre grise sous le soffite).
  // (Leur fente vitrée est la longue, de 0,6 à 1,85 — photos 06 et 20 : elle descend aux deux tiers du vantail.)
  // (13/10, les photos 20, 06 et 04 rejouées à leur pose refaite — 20 : (3,57 ; 6,51) h 1,27 cap −9,5, les quatre coins du
  // vantail fermé à 5-9 px ; 06 : (5,04 ; 5,88) h 1,37 cap −82,5, tangage −5,3, roulis −1,8, quinze points du hall à 9 px,
  // les verticales de droite enfin droites ; 04 : (6,63 ; 6,89) h 1,41 cap −50,5 :
  //  - le vantail ouest est ENTROUVERT sur la 20, pas à plat : son chant libre y est à 11-16 cm de l'avancée, (2,56-2,64 ;
  //    7,98-8,11) ; sur la 06 et la 04, il est rabattu, à 4-6 cm. Entre les deux : 85°, le chant à 9 cm — à 4 px de la 06 ;
  //  - les fentes sont des jours de verre clair : la cage éclairée s'y voit (`clair`) ;
  //  - l'étiquette rouge « porte coupe-feu » est sur la face de la CAGE du vantail ouest, en haut côté chant libre — celle
  //    qu'on voit quand il est ouvert ; la face du hall du vantail est n'en porte pas ;
  //  - le chant libre du vantail ouvert est une alaise de bois sombre ;
  //  - pas de boîtier brun sur les vantaux : le ferme-porte est un boîtier gris clair en haut du vantail est, côté hall,
  //    près des gonds, sous une glissière ;
  //  - au-dessus des portes, du linteau au plafond, un BANDEAU gris bleuté de 18 cm (photo 20 : rangs 560-600, de
  //    jambage à jambage ; photo 04 de même) : le jeu n'avait qu'un rail de 6 cm sous un bandeau crème ;
  //  - les vantaux ont DEUX TEINTES : la face du hall est d'un gris BLEUTÉ, celle du bandeau — photos 20 et 04, le vantail
  //    fermé à (150, 155, 168) sous des murs à (235, 228, 210) —, la face de la cage d'un gris beige clair — le vantail
  //    ouvert, sous la même lumière sur la 04. Le jeu les faisait tous deux du gris taupe de la porte de service.)
  // (14/10, les mêmes photos mesurées au pixel et rapportées au mur blanc voisin :
  //  - la fente est LARGE — photo 20, le vantail fermé de face, 182 px : le cadre de noyer en fait 43, 23,5 cm, le verre
  //    16,5, son bord à 15 cm du chant ; le jeu : 16 cm hors tout pour un verre de 10 ;
  //  - les deux faces sont plus SOUTENUES : celle du hall à 0,62-0,69 / 0,64-0,73 / 0,73-0,81 du mur (photos 04 et 20),
  //    celle de la cage à 0,60-0,69 / 0,56-0,67 / 0,54-0,64 (photos 06, 20, 04) — le jeu les rendait à 0,70-0,85 et
  //    0,77-0,95 ; réglées entre les trois photos, qui ne s'accordent qu'à 0,1 près ;
  //  - l'étiquette rouge est une bande de 17,5 x 5 cm à deux lignes blanches, au ras du haut du vantail, au-dessus de la
  //    fente — photo 06.)
  const bleute = new THREE.MeshStandardMaterial({ color: 0x858da0, roughness: 0.45 }); bleute.name = 'vantail gris bleuté, face du hall (escalier)';
  const beige = new THREE.MeshStandardMaterial({ color: 0xa6a4a1, roughness: 0.45 }); beige.name = 'vantail gris beige, face de la cage (escalier)';
  const OC = { bas: 0.6, l: 0.155, bord: 0.27, cadre: 0.04 };
  const PE = ch.porte('x', 13.675 + DY_S, 3.45, { l: 2.0, h: 2.1, modele: 'grise2', feu: false, oculus: { ...OC, clair: true }, fermePorte: false, matVantail: bleute, etat: 'ouverte', ouverts: [true, false], angle: 1.484, cote: 'S', notices: 0, noticesD: 0, nom: 'escalier' });
  {
    const [vo, ve] = PE.vantaux, w = 1.0, h = 2.1, e = 0.04;
    // (la face de la cage, −z : quatre pans beiges de 3 mm autour du cadre de noyer de la fente)
    for (const v of PE.vantaux) {
      const xa = w - OC.bord - OC.l / 2 - OC.cadre, xb = w - OC.bord + OC.l / 2 + OC.cadre, z = -(e / 2 + 0.0015);
      const pan = (x0, x1, y0, y1) => maille(boiteM(x1 - x0, y1 - y0, 0.003), beige, v.s * (x0 + x1) / 2, (y0 + y1) / 2, z, 0, v.g, { ombre: false });
      pan(0.006, xa, 0.006, h - 0.006); pan(xb, w - 0.012, 0.006, h - 0.006); pan(xa, xb, 0.006, OC.bas - OC.cadre); pan(xa, xb, 1.85 + OC.cadre, h - 0.006);
    }
    const etiq = new THREE.MeshStandardMaterial({ map: canvasTex(140, 40, (g, W, H) => {
      g.fillStyle = '#c3262b'; g.fillRect(0, 0, W, H); g.fillStyle = '#f3e9e6';
      g.fillRect(8, 9, 86, 7); g.fillRect(8, 23, 64, 6); g.fillRect(104, 7, 28, 24); g.fillStyle = '#c3262b'; g.fillRect(109, 12, 18, 14);
    }, null, false, 4), roughness: 0.5 }); etiq.name = 'étiquette « porte coupe-feu » (escalier)';
    { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.175, 0.05), etiq); p.position.set(w - 0.3, h - 0.058, -(e / 2 + 0.0035)); p.rotation.y = Math.PI; p.castShadow = false; vo.g.add(p); }
    maille(boiteM(0.012, h - 0.012, e + 0.004), M.noyer, w - 0.006, h / 2, 0, 0, vo.g, { ombre: false });
    const gris = new THREE.MeshStandardMaterial({ color: 0xb4b9bf, roughness: 0.5, metalness: 0.2 }); gris.name = 'ferme-porte gris clair (escalier)';
    maille(boiteM(0.2, 0.06, 0.045), gris, -0.3, h - 0.04, e / 2 + 0.024, 0, ve.g, { ombre: false });
    const bandeau = new THREE.MeshStandardMaterial({ color: 0xa3aab4, roughness: 0.55, metalness: 0.15 }); bandeau.name = 'bandeau gris bleuté (escalier principal)';
    ch.boite(2.4, 8.895, 4.5, 8.925, 2.11, 2.3, bandeau, { ombre: false });
    ch.boite(2.45, 8.88, 4.45, 8.895, 2.11, 2.135, new THREE.MeshStandardMaterial({ color: 0x858a91, roughness: 0.45, metalness: 0.3 }), { ombre: false });
  }
  // LA CAGE VUE DU HALL (14/10, relecture — photos 06, 20 et 04 rejouées à leur pose : par la porte ouverte, la cage est
  // d'un blanc CHAUD, crème — photo 06, ses murs à 0,91 / 0,84 / 0,61 du mur du plan d'évacuation ; photo 20, à 0,86 /
  // 0,76 / 0,65 du mur blanc voisin — ; le jeu la rendait d'un blanc neutre, 0,88 / 0,89 / 0,91 et 0,95 / 1,00 / 1,08.
  // Comme pour le passage : la lumière de la cage n'est pas celle du hall, et l'appareil s'est réglé sur le hall.) Un
  // voile qui multiplie, dans l'ouverture des portes, côté cage, tourné vers le hall seulement : de la cage, il n'existe
  // pas ; les vantaux, devant lui, n'en sont pas touchés.
  {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.9, 0.72), blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false });
    m.name = 'voile de la cage (vue du hall)';
    const v = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.1), m); v.position.set(3.45, 1.05, -(Y_ESC + 0.1)); v.renderOrder = 1;
    v.castShadow = false; v.receiveShadow = false; v.userData.horsAOSol = true; v.userData.sansNormales = true; nePasFusionner(v); ch.decor.add(v);
    ch.voileCage = v;    // (il s'efface quand Haythem arrive à la porte : `maj`, js/carte_ecole.js construireCarte)
  }
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
  // (13/10, relecture C2 — elle sortait à 41/44/48, presque noire : la photo 05, floue et prise de loin, la donne à
  // 86/87/83, la photo 23, nette, à 121/135/139 à gauche et 98/109/115 à droite — un gris-bleu clair, la salle allumée
  // derrière elle. Rétro-éclairée, elle vise 100/110/112.)
  const imposte = new THREE.MeshStandardMaterial({ color: 0x66727c, roughness: 0.45, emissive: 0x8d9aa2, emissiveIntensity: 0.28 }); imposte.name = 'imposte dépolie de la porte bleue';
  ch.boite(x0 + c, yL - 0.006, x1 - c, yL + 0.006, hv + 0.05, hT - c, imposte, { ombre: false });
  C.ajouterBoite(x0, -y1, x1, -y0, { y0: hv, y1: hT, vitre: true });
  ch.porte('x', yL, (x0 + x1) / 2, { l: x1 - x0 - 2 * c, h: hv, modele: 'bleue', etat: 'auto', cote: 'S', huisserie: false, libre: 1, nom: 'salle David Clark' });
  // (13/10, relecture C2 — photo 05 : entre l'angle du couloir et l'huisserie, deux plaques blanches l'une au-dessus de
  // l'autre — l'interrupteur à 1,10 m, la prise à 0,28)
  for (const h of [1.1, 0.28]) ch.boite(C05.xO + 0.045, y0 - 0.008, C05.xO + 0.125, y0, h - 0.04, h + 0.04, M.boitier, { ombre: false });
}

// L'ACCUEIL ET LE HALL D'ENTRÉE (VO 6,4-7,4 s et 92,5-95,8 s, photos 03, 16, 24 ; 10/10 ; retour r04 de Haythem du 12/10,
// sa photo de l'accueil) : le comptoir n'est pas le long de la façade mais NORD-SUD, face à l'ouest (x 16,83-17,53, y
// 1,1-3,6), terminé au nord par le décroché PMR et son caisson à tablette haute ; derrière lui l'open-space du personnel,
// le mitoyen gris ardoise et ses deux affiches, le MIROIR (retour r05 du 13/10) ; au fond, le local technique aux
// portes de bois clair, le pilier et son écran, le panneau des formations, le portant des goodies ; l'angle nord-est
// (photocopieur, étiquettes « INFORMATIQUE », meuble noir) ; la retombée et les lignes lumineuses du plafond :
// js/ecole_hall.js. Rend { maj } : le miroir, à chaque image.
function construireAccueil(ch) {
  const { M } = ch;
  const hall = poserHall(ch);
  // le tapis d'entrée bleu-gris foncé (lot rue du 13/10 : il suit la porte 6, reculée en y 0,8 — construireEntree)
  ch.boite(13.6, Y_P6 + 0.1, 16.2, Y_P6 + 1.6, 0, 0.012, M.tapis, { ombre: false });
  return hall;
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
    [1.6, 4.05, 4.9, Y_ESC, 'ns', 1.75, 0], [4.715, -0.4, 4.9, 4.05, 'ns', 1.75, 0], [4.9, -0.4, 5.3, Y_ESC, 'ns', 1.75, 0],
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
  // (13/10, photo 07 refaite à sa pose, le carrelage du passage rehaussé : DIX files de carreaux d'un mur à l'autre —
  // joints en long en x 4,09 / 3,825 / 3,56, tous les 26,5 cm —, des rangs de 51 cm ; le jeu en posait neuf de 30 x 60.
  // Et un grès plus sombre et plus chaud : photo 19, (95, 85, 70) au premier plan, à peine plus clair que celui du hall
  // vu par la vitre ; photo 10, de la rue, (100, 90, 75) ; il était gris clair.)
  // (14/10, relecture : le passage fait 2,95 m — dix files de 29,5 cm, des carreaux de 30 x 60 recoupés aux murs)
  for (const t of [M.solPassage.map, M.solPassage.normalMap]) if (t) t.repeat.set(1 / 1.18, 1 / 1.18);
  M.solPassage.color.setRGB(0.72, 0.67, 0.6);
  // (14/10, relecture C1 — photos 10, 07 et 19 rejouées : les joints du passage se devinent à peine, un trait un rien
  // plus sombre ; le jeu les dessinait en lignes claires bien marquées, une grille qu'on voyait de la rue. L'image du
  // carrelage, voilée de sa teinte moyenne à 55 %, et le relief des joints divisé par deux et demi.)
  if (M.solPassage.map && M.solPassage.map.image && M.solPassage.map.image.width) {
    const src = M.solPassage.map.image, cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
    const g = cv.getContext('2d'); g.drawImage(src, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data, moy = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) { moy[0] += d[i]; moy[1] += d[i + 1]; moy[2] += d[i + 2]; }
    const n = d.length / 4; g.globalAlpha = 0.55; g.fillStyle = `rgb(${moy.map((v) => Math.round(v / n)).join(',')})`; g.fillRect(0, 0, cv.width, cv.height);
    const t = M.solPassage.map.clone(); t.image = cv; t.needsUpdate = true; M.solPassage.map = t;
  }
  if (M.solPassage.normalScale) M.solPassage.normalScale.multiplyScalar(0.4);
  const solP = new THREE.Mesh(geoSol([[1.6, -0.4, 4.715, 4.05, 'droit', 1.75, 0]]), M.solPassage); solP.receiveShadow = true; nePasFusionner(solP);
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
  const accueil = construireAccueil(ch);
  // (le radiateur du hall ouest : entre l'extincteur et l'affiche jaune du tri — photos 02 et 06, de gauche à droite :
  // porte grise, extincteur, radiateur, affiche, portes de l'escalier. Relecture du 09/10 : il est fixé sur la face SUD
  // de l'avancée nord, perpendiculaire au mur — la photo 02 le montre de chant, la photo 06 de trois quarts)
  // (plan V2 : contre l'angle de l'avancée nord, y 7,22 ; photo 06 rejouée : de 0,12 à 1,38)
  // (13/10, photo 06 refaite à sa pose — (5,04 ; 5,88) h 1,37, tangage −5,3, roulis −1,8 —, agrandie : il est CONTRE LE
  // FOND du renfoncement, x 1,775-2,225 — entre lui et l'angle de l'avancée, 23 px de mur blanc, 22 cm ; le jeu le
  // centrait en 2,17, à 5 cm de l'angle — et son dessus est à 1,31, rang 317 et non 305 ; en haut de sa face, la
  // grille de lames)
  // (14/10, la 06 agrandie : son pied descend sous le haut de la plinthe, rang 561 et non 550 — à 6 cm du sol)
  radiateur(ch, 2.0, 7.22, 'S', 0.45, 0.06, 1.31);
  // (relecture du 11/10, photo 06 : sa face avant est un panneau en retrait, gris clair, dans un cadre blanc de 3 cm — tout
  // blanc, sous le hublot du hall, il disparaissait dans le mur)
  ch.boite(1.805, 7.135, 2.195, 7.139, 0.09, 1.16, new THREE.MeshStandardMaterial({ color: 0xd3d6d8, roughness: 0.5 }), { ombre: false });
  for (let h = 1.18; h < 1.285; h += 0.022) ch.boite(1.805, 7.135, 2.195, 7.139, h, h + 0.009, M.grille, { ombre: false });
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
  // (relecture C2 — photo 04 de près : ce n'est pas une demi-boule crème. Un SOCLE blanc, court cylindre de 11 cm, et
  // sous lui la BULLE fumée, presque noire, de 8 cm)
  const dome = maille(new THREE.CylinderGeometry(0.055, 0.05, 0.04, 20), M.boitier, 5.02, 2.28, -7.58, 0, ch.decor, { ombre: false });
  const bulle = maille(new THREE.SphereGeometry(0.04, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.bulleFumee || (M.bulleFumee = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.12, metalness: 0.3 })), 5.02, 2.262, -7.58, 0, ch.decor, { ombre: false });
  dome.userData.horsAOSol = bulle.userData.horsAOSol = true;
  // (13/10, lot C2 : plus de boîtier blanc en haut du jambage des portes de l'escalier, côté C05 — la photo 23, prise à
  // 1,7 m de lui, montre l'about du mur nu jusqu'au plafond, au-dessus du bras du ferme-porte ; le diffuseur est sur la
  // retombée, js/ecole_mobilier.js)
  ch.boite(4.9, ATT.ys + 0.075, 5.0, ATT.ys + 0.11, 1.25, 1.35, M.rougeEtiquette, { ombre: false });   // (sur le mur sud : DY_A)
  // (11/10, r02 : vu de près, un cube rouge plein ; c'est un boîtier à membrane blanche au milieu de sa face)
  ch.boite(4.925, ATT.ys + 0.11, 4.975, ATT.ys + 0.112, 1.275, 1.325, M.blanc, { ombre: false });

  // ---- les plafonds ----
  // le passage : un RAMPANT de 2,62 à la façade à 2,42 à la paroi (13/10, photos 19, 10 et 07 — construireParoiPassage),
  // d'un blanc que les réglettes jaunissent (photos 07, 10, 19)
  // (14/10, relecture : PLAT, à 2,60, jusqu'au mur est reculé — le rampant venait de la porte trop petite ; juste sous
  // les plateaux de la Si 0.1, dont le bord dépasse derrière la cloison mince)
  {
    const ya = 0, yb = 4.05, ha = 2.595, hb = 2.595, xa = 1.75, xb = 4.7;
    const g = new THREE.BufferGeometry(), L = Math.hypot(yb - ya, ha - hb);
    g.setAttribute('position', new THREE.Float32BufferAttribute([xa, ha, -ya, xb, ha, -ya, xb, hb, -yb, xa, hb, -yb], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([xa, 0, xb, 0, xb, L, xa, L], 2));
    g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
    const platrePassage = M.platre.clone(); platrePassage.name = 'plafond en plâtre (passage)'; platrePassage.color.multiply(new THREE.Color(1.0, 0.99, 0.955));
    const m = maille(g, platrePassage, 0, 0, 0, 0, ch.decor, { ombre: false }); m.userData.horsAOSol = true;
    C.plafond(xa, -yb, xb, -ya, hb);
  }
  // le hall ouest (plan V2 : plâtre à 2,30 — photo 06, 2,25-2,30 ; le jeu avait 2,40) : la gorge derrière la paroi
  // vitrée, le hall jusqu'aux dalles de la salle d'attente (x 5,3), et devant le C05, au nord du mur safran
  // (Relecture du 11/10 : contre la paroi vitrée, le plafond de la gorge REMONTE en pente jusqu'au haut du bandeau,
  // 2,60. Photo 06 rejouée à sa pose : l'arête du haut de la pile, rapportée sur son nu x 2,45, passe de 2,57 en y 4,16 à
  // 2,45 en 4,42, 2,35 en 4,64 et 2,24 en 4,91 — une droite, pas un ressaut, et le bas de la même photo tombe juste,
  // ce n'est pas la déformation de l'objectif ; photo 07 rejouée : le bloc de sortie est au-dessus de la traverse
  // haute, de 2,33 à 2,45. Le rampant va de y 4,075 (2,60) à y 4,77 (2,30), sur toute la largeur de la gorge.)
  // (13/10, LE PLAFOND DU HALL OUEST EST GRIS — photo 06 : (102, 96, 88) sous des murs à (180, 167, 154), 0,57 de leur
  // luminance ; photo 04, vu de la salle d'attente : un gris moyen sous la retombée blanche ; le jeu le rendait presque
  // aussi clair que les murs, 0,90. Une copie du plâtre, rien qu'ici, plus sombre et sans lueur propre.)
  const platreHallO = M.platre.clone(); platreHallO.name = 'plafond en plâtre (hall ouest)';
  platreHallO.color.multiplyScalar(0.68); platreHallO.emissiveIntensity *= 0.35;
  // (14/10, photos 06, 20 et 04 rapportées au mur blanc voisin : il est NEUTRE — 0,59-0,68 sur les trois canaux — ; le jeu
  // le rendait chaud, 0,70-0,88 / 0,66-0,85 / 0,58-0,81, le rebond du sol et des murs le dorait. Un rien bleuté pour
  // rester gris sous cette lumière.)
  platreHallO.color.multiply(new THREE.Color(0.92, 0.95, 1.0)); platreHallO.emissive.multiply(new THREE.Color(0.92, 0.95, 1.0));
  const grisHallO = (m) => { m.material = platreHallO; return m; };
  {
    // (13/10 : la gorge rejoint la paroi à 2,44, pas 2,60 — photo 06 refaite à sa pose, l'arête du haut de la pile passe
    // de 2,21 en y 4,91 à 2,44 en 4,12 ; le bandeau de la paroi s'arrête à 2,42, photo 19)
    // (14/10, relecture : la tête des vantaux est à 2,47 ; la gorge monte au haut du bandeau, 2,58, jusqu'au mur est reculé)
    const ya = 4.075, yb = 4.77, ha = 2.58, hb = 2.3, xa = 2.45, xb = 4.7;
    const g = new THREE.BufferGeometry(), L = Math.hypot(yb - ya, ha - hb);
    g.setAttribute('position', new THREE.Float32BufferAttribute([xa, ha, -ya, xb, ha, -ya, xb, hb, -yb, xa, hb, -yb], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([xa, 0, xb, 0, xb, L, xa, L], 2));
    g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
    const m = maille(g, platreHallO, 0, 0, 0, 0, ch.decor, { ombre: false }); m.userData.horsAOSol = true;
    ch.C.plafond(1.75, -yb, 4.7, -4.05, hb);
    grisHallO(ch.plafond(1.75, yb, 4.5, 4.875, 2.3, 'platre', { retombees: false }));
  }
  // (Relecture du 11/10, photo 04 rejouée : le plafond bas du hall s'arrête à la retombée, en x 4,85, et ne passe à l'est
  // qu'au nord de y 8,05, devant le C05 ; entre les deux, le plafond de dalles de 60 de la salle d'attente, à 2,60 —
  // ses joints calés sur ceux des dalles de la salle, qui partent de x 5,3 et de y 7,8 (plan V2, lot C) ; au nord de
  // 8,05, le plafond bas les cache)
  // (finitions du 11/10 : coupé en y 8,3 — au nord, sans retombées : celles de l'ouest et du nord, du plafond à la dalle,
  // passaient au travers de la volée 2 de l'escalier principal, au-dessus de ce plafond ; construireEscalier)
  // (13/10, la volée 2 à sa vraie pente : elle passe au-dessus du renfoncement, x 0,75-1,975, sa sous-face à 2,48 en
  // y 7,22, et dans l'avancée nord — le plafond s'arrête à l'avancée, x 2,45, et ses retombées de l'ouest, qui montaient
  // à la dalle au travers des marches, s'effacent ; reste celle de l'est, la retombée de la photo 04)
  grisHallO(ch.plafond(1.75, 4.875, 4.85, 7.22, 2.3, 'platre', { retombees: false }));
  grisHallO(ch.plafond(2.45, 7.22, 4.85, 8.925, 2.3, 'platre', { retombees: false }));
  {
    const q = ch.panneau(M.platre, 8.3 - 4.875, H_DALLE - 2.3, 4.85, (4.875 + 8.3) / 2, (2.3 + H_DALLE) / 2, 'E');
    q.userData.horsAOSol = true; q.castShadow = false;
  }
  // (13/10, lot C2 — devant le C05 : la photo 23, prise de (4,41 ; 7,11), ne voit QUE le plafond bas jusqu'au bord haut
  // de l'image, qui tombe en (5,18 ; 7,76) et (5,02 ; 7,83) — au jeu, un pan du plafond de dalles, à 2,60, entrait dans
  // le coin de l'image ; la photo 05 rejouée met l'arête est-ouest de la retombée vers y 7,9, au bout du pilier jaune :
  // elle est dans le plan de la face sud du mur safran, y 7,80, et non en 8,05. Jusqu'au nu est du couloir, 5,92.)
  // (intégration v2.0, 14/10 : le même plâtre gris neutre que le reste du plafond bas du hall ouest — un seul plan à 2,30)
  grisHallO(ch.plafond(4.85, 7.8, C05.xE, 8.925, C05.hBas, 'platre'));
  // (et SA RETOMBÉE NORD-SUD, devant la salle d'attente : les photos 05 et 04, rejouées chacune à sa pose, mettent toutes
  // deux son arête en x 5,15 — de y 7,03 à l'angle, où elle tourne vers le mur jaune —, et le dôme de la caméra en
  // (5,02 ; 7,58), contre elle ; le jeu l'arrêtait en x 4,85. Une bande de plafond bas de 30 cm de plus, du mur des jours
  // à l'angle ; le plafond de dalles de la salle, à 2,60, passe au-dessus.)
  grisHallO(ch.plafond(4.85, ATT.ys + EP / 2, 5.15, 7.8, C05.hBas, 'platre'));
  // (r03, 12/10 : le mur sud de la salle recule de 0,20 — DY_R03 — ; la bande qu'il libère, x 4,5-4,85 × y 4,675-4,875,
  // prend le plafond bas du hall et sa retombée en x 4,85 continue jusqu'au mur ; les dalles de la salle partent du mur)
  grisHallO(ch.plafond(4.5, ATT.ys + EP / 2, 4.85, 4.875, 2.3, 'platre'));
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
  { const pc = chaudPlafond(ch.plafond(C01.xO, 7.8, C01.xE, C01.yR, C01.hP, 'platre')); pc.material.color.multiplyScalar(0.86); pc.material.name = 'plafond en plâtre (C01)';   // C01 (V2 : de l'entrée, y 7,8, au fond)
    // (relecture C2 : passé la retombée de y 9,80, le plafond haut, 2,47 — photo 01, `C01` en tête du fichier)
    // (sa retombée : sur la photo elle n'est pas blanche, mais un rien plus sombre que le plafond qu'elle borde)
    ch.plafond(C01.xO, C01.yR, C01.xE, 14.4, C01.hN, 'platre').material = pc.material;
    const pr = pc.material.clone(); pr.color.multiplyScalar(0.93); pr.name = 'retombée du plafond (C01)';
    const q = ch.panneau(pr, C01.xE - C01.xO, C01.hN - C01.hP, (C01.xO + C01.xE) / 2, C01.yR + 0.002, (C01.hP + C01.hN) / 2, 'N'); q.userData.horsAOSol = true; q.castShadow = false; }
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
    // (retour r05 du 13/10, r04 rejouée : contre la façade et le miroir, le plafond est dans le JOUR des fenêtres c 17,33
    // et c 18,98 — 217, 226, 234, bleuté, au-dessus de la glace, quand le milieu de l'accueil est à 171, 168, 165 — ; le
    // jeu l'éclairait partout pareil, 157, 154, 149 près de la glace : la même lueur, plus forte et plus froide vers
    // l'angle sud-est. Les coordonnées de texture du plafond sont en mètres : u depuis x 13,35, v depuis le nord, y 7,5)
    const W = 6.45, D = 7.2;
    const t = canvasTex(64, 64, (g, w, h) => {
      const img = g.createImageData(w, h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const x = 13.35 + (i + 0.5) / w * W, y = 0.3 + (j + 0.5) / h * D;   // (le haut du dessin est le bas des v : le sud)
        // (relecture : la lueur ne se voit qu'à 1,5 m de la façade, et vers l'angle ; au milieu de l'accueil, rien)
        // (RELECTURE DU 13/10, r04 rejouée, sept pavés du plafond rétroprojetés, du nord au sud le long de x 17,3-18,1 :
        // 148, 133, 124 en y 4,5 — chaud, sous les spots — ; 155, 145, 139 en 3,9 ; 163 en 3,3 ; 170 en 2,7 ; 186, 189, 195
        // en 2,1 ; 221, 226, 232 en 1,5 ; 232, 240, 247 en 0,9, contre la glace. Le jeu restait plat, 165 à 170 partout et
        // 159 à 174 au sud. Trois choses : la lueur de base un rien plus basse et CHAUDE au nord de y 3,3 ; le jour qui monte
        // de rien, en y 2,6, à près de dix fois la base contre la façade, bleuté ; et le jour de la PORTE 6, à l'ouest de
        // x 16,5, aux six dixièmes — ce plafond-là, c'est la glace qui le montre, blanc. En unités de l'ancienne lueur,
        // 0,3 : la base 0,3, le jour jusqu'à 2,9 de plus.)
        const sud = Math.pow(Math.min(1, Math.max(0, (2.6 - y) / 1.6)), 1.2), nord = Math.min(1, Math.max(0, (y - 3.3) / 1.4));
        const jour = sud * Math.max(0.6, Math.min(1, Math.max(0, (x - 16.5) / 1.5))) * 2.9, k = (j * w + i) * 4;
        [1 - 0.03 * nord, 1 - 0.14 * nord, 1 - 0.24 * nord].forEach((b, c) => { img.data[k + c] = Math.round(255 * Math.min(1, (0.3 * b + jour * [0.9, 0.95, 1][c]) / 3.2)); });
        img.data[k + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    }, null, false, 1);
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.repeat.set(1 / W, 1 / D); t.needsUpdate = true;
    p.material.emissiveMap = t; p.material.emissiveIntensity = 3.2;
  }
  // le bureau B (visitable : js/ecole_pieces.js) et le passage au sud-ouest de la pile, d'un seul tenant (plateaux à 2,60)
  ch.plafond(9.9, 0, 13.35, ATT.ys, 2.6, 'plateaux');
  ch.plafond(4.5, 0, 9.9, ATT.ys, 2.6, 'plateaux');                   // la Si 0.1, l'ex-salle A (visitable : js/ecole_pieces.js)

  // ---- les luminaires (et les lampes : ce sont les mêmes) ----
  // (plan V2 : les deux réglettes au-dessus des lièges, vers la rue — photos 07, 10. Relecture du 11/10 : elles partent
  // de la façade — photo 10, leurs bouts touchent le linteau — et vont jusqu'à y ≈ 3,0, photo 07 rejouée ; deux tubes
  // bout à bout, photo 19 : la jonction au milieu. Une lampe chacune, comme avant.)
  // (13/10 : leur lumière est d'un blanc chaud, jaune sur les murs — photos 07, 10, 19)
  M.tube.color.multiply(new THREE.Color(1.0, 0.93, 0.7));
  // (14/10, LA LUEUR DES RÉGLETTES — photos 07 et 19 : le tube allumé bave d'un halo, et le haut du mur qui le porte est
  // JAUNE — (188, 158, 122) à 2 m quand le pied du même mur, sous le jour de la rue, est à (187, 178, 165) : autant de
  // rouge, moins de vert, bien moins de bleu. Les spots du jeu éclairent vers le bas : rien ne dorait le haut des murs.
  // Sur le haut de chaque mur et sur le plafond au-dessus du tube, deux images de même dessin — pleines à la hauteur du
  // tube, éteintes à 1,6 m de lui : un voile qui MULTIPLIE (1 / 0,89 / 0,73) et une lueur qui AJOUTE — le voile seul
  // éteignait le haut du mur, la courbe du rendu assombrit ce qu'elle sature ; plus un manchon de lumière autour du
  // tube lui-même.)
  const poids = (hTube, haut, long, portee) => (i, j, W, H) => {
    // la distance au tube (un trait de y 0,15 à 3,05 sur les 4 m du voile, à hTube du haut), en mètres
    // (14/10, relecture, photo 19 : au-delà du bout des tubes, vers la paroi, le plafond est d'un blanc neutre — (166,
    // 155, 153) au-dessus de la porte, le jeu (161, 147, 124) — : la lueur y tombe 2,2 fois plus vite)
    const u = (i + 0.5) / W * long, v = (j + 0.5) / H * haut, r = Math.hypot(2.2 * Math.max(0, 0.15 - u, u - 3.05), v - hTube);
    return Math.pow(Math.max(0, Math.min(1, 1 - (r - 0.12) / portee)), 1.3);
  };
  const texLueur = (w, mult) => canvasTex(128, 64, (g, W, H) => {
    const img = g.getImageData(0, 0, W, H), d = img.data;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const q = w(i, j, W, H), k = (j * W + i) * 4;
      if (mult) { d[k] = 255; d[k + 1] = Math.round(255 - q * 28); d[k + 2] = Math.round(255 - q * 70); } else d[k] = d[k + 1] = d[k + 2] = Math.round(255 * q);
      d[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, null, false, 4);
  const voile = (map) => new THREE.MeshBasicMaterial({ map, blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const lueur = (map, c) => new THREE.MeshBasicMaterial({ map, color: c, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  // (photo 07 agrandie : au plafond, la lueur est large — le jaune court sur 1,2 m depuis le mur, plein au-dessus du tube)
  const wMur = poids(0.22, 1.5, 4.0, 1.5), wPlaf = poids(0.2, 1.25, 4.0, 1.25);
  const lueurMur = [voile(texLueur(wMur, true)), lueur(texLueur(wMur, false), new THREE.Color(0.24, 0.15, 0.04))];
  const lueurPlafond = [voile(texLueur(wPlaf, true)), lueur(texLueur(wPlaf, false), new THREE.Color(0.2, 0.125, 0.035))];
  for (const m of [...lueurMur, ...lueurPlafond]) m.name = 'lueur des réglettes (passage)';
  const manchon = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 0.56, 0.26), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  manchon.name = 'halo du tube fluorescent (passage)';
  // (14/10, relecture — les embouts orange du côté de la paroi, pris sur les photos 07 et 10 reposées sur la porte à sa
  // taille : leurs deux rayons se croisent à 4 cm et à 6 mm. Le tube ouest finit en (2,06 ; 3,03) à 2,43 ; le tube est
  // en (4,58 ; 3,04) à 2,33 : ils sont PENDUS AU PLAFOND par des tiges — photo 07 —, celui de l'ouest à 31 cm de son mur,
  // 10 cm plus haut, celui de l'est à 12 cm du sien ; le jeu les fixait tous deux à 6 cm du mur, à 2,35. Le même
  // croisement met le bout nord du liège en (4,73 ; 2,52) : le mur est y est bien.)
  for (const [x, s, dx, ht] of [[1.75, 1, 0.25, 2.43], [4.7, -1, 0.06, 2.33]]) {
    // (14/10 : de y 0,15 à 3,05 — deux tubes de 1,45 m bout à bout ; photo 10, leur bout touche le linteau ; photo 07,
    // l'autre est à 0,9-1,1 m de la paroi)
    ch.tube(x + s * dx, 0.15, 3.05, ht, s, 'passage');
    const xj = x + s * (dx + 0.06);
    ch.boite(xj - 0.025, 1.57, xj + 0.025, 1.63, ht - 0.05, ht + 0.02, M.boitier, { ombre: false });
    for (const y of [0.55, 1.6, 2.65]) ch.boite(xj - 0.004, y - 0.004, xj + 0.004, y + 0.004, ht + 0.03, 2.595, M.boitier, { ombre: false });
    // sur le mur (y 0-4,0, de 1,12 à 2,62) et au plafond (1,25 m depuis le mur, sous le rampant 2,62 -> 2,42)
    const quad = (P, mats, idx) => mats.forEach((mat, n) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P.flat(), 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
      g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, mat); m.renderOrder = 2 + n; m.castShadow = false; m.userData.horsAOSol = true; m.userData.sansNormales = true;
      nePasFusionner(m); ch.decor.add(m);
    });
    const xm = x + s * 0.003, hp = () => 2.592;
    quad([[xm, 2.595, 0], [xm, 2.595, -4.0], [xm, 1.095, -4.0], [xm, 1.095, 0]], lueurMur, s > 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3]);
    quad([[x, hp(0), 0], [x, hp(4.0), -4.0], [x + s * 1.25, hp(4.0), -4.0], [x + s * 1.25, hp(0), 0]], lueurPlafond, s > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]);
    const h = maille(new THREE.CylinderGeometry(0.044, 0.044, 2.8, 14, 1, true), manchon, xj + s * 0.007, ht - 0.01, -1.6, 0, ch.decor, { ombre: false, recoit: false });
    h.rotation.x = Math.PI / 2; h.renderOrder = 3; h.userData.horsAOSol = true; h.userData.sansNormales = true; nePasFusionner(h);
  }
  // LE REFLET DES DEUX RÉGLETTES DANS LA PORTE VITRÉE, vu du passage (relecture du 14/10, photo 19 rejouée à sa pose —
  // (3,67 ; 2,57) h 1,39 cap −6,6, sur le vantail ouest et huit points du hall : les deux tubes s'y voient en grand, d'un
  // jaune blanc, leur embout orange au bout le plus proche — celui de l'ouest de (2,69 ; 1,99) à (3,20 ; 1,71) du vitrage
  // ouest, celui de l'est sur le vitrage est ; le jeu n'en peignait qu'un trait pâle, toujours au même endroit, quelle
  // que soit la caméra.) Le vrai reflet : les tubes, leurs halos et leurs embouts, rabattus de l'autre côté du plan du
  // verre (y 4,045), et chaque sommet ramené SUR ce plan le long du rayon de la caméra — à l'écran, au même endroit que
  // l'image virtuelle, mais à la profondeur du verre : les montants, Haythem devant la porte, le cachent comme il faut ; ce
  // qui tombe hors des deux vitrages est jeté. Visible du côté du passage, la porte fermée (`maj`). On y retrouve les
  // deux rayons de la photo 19 : de la caméra à l'image de l'embout ouest, (2,06 ; 5,05) à 2,43, le verre est coupé en
  // (2,71 ; 2,01) — la photo le montre en (2,69 ; 1,99).
  const Y_MIROIR = 4.045;
  const refletVerre = (mat) => {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uMiroir = { value: Y_MIROIR };
      sh.vertexShader = 'uniform float uMiroir;\nvarying vec3 vSurVerre;\n' + sh.vertexShader.replace('#include <project_vertex>', `
        vec4 pMonde = modelMatrix * vec4(transformed, 1.0);
        vec3 pVerre = cameraPosition + (pMonde.xyz - cameraPosition) * ((-uMiroir - cameraPosition.z) / (pMonde.z - cameraPosition.z));
        vSurVerre = pVerre;
        vec4 mvPosition = viewMatrix * vec4(pVerre, 1.0);
        gl_Position = projectionMatrix * mvPosition;`);
      sh.fragmentShader = 'varying vec3 vSurVerre;\n' + sh.fragmentShader.replace('void main() {', `void main() {
        if (vSurVerre.y < 0.09 || vSurVerre.y > 2.344 || vSurVerre.x < 2.63 || vSurVerre.x > 4.52 || (vSurVerre.x > 3.485 && vSurVerre.x < 3.665)) discard;`);
    };
    mat.customProgramCacheKey = () => 'iris-reflet-verre-passage';
    mat.name = 'reflet des réglettes (porte vitrée du passage)';
    return mat;
  };
  const refletsTubes = new THREE.Group(); refletsTubes.name = 'reflet des réglettes dans la porte vitrée (passage)';
  {
    const add = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false };
    // (photo 19 agrandie : le tube reflété est d'un JAUNE soutenu, (235, 205, 110) sur le hall à (170, 150, 110) ; l'embout,
    // d'un orange brun, (200, 120, 70) : ce qu'il faut ajouter au fond, sans bleu)
    const mTube = refletVerre(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.62, 0.08), ...add }));
    const mHalo = refletVerre(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.19, 0.02), ...add }));
    const mEmbout = refletVerre(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.13, 0.02), ...add }));
    const yM = (y) => -(2 * Y_MIROIR - y);
    for (const [x, s, dx, ht] of [[1.75, 1, 0.25, 2.43], [4.7, -1, 0.06, 2.33]]) {
      const xt = x + s * (dx + 0.06), a = -s * 0.5, xc = xt + 0.014 * Math.sin(a), hc = ht - 0.014 * Math.cos(a);
      const pose = (geo, mat, px, py, y0, ordre) => {
        const m = new THREE.Mesh(geo, mat); m.position.set(px, py, yM(y0)); m.rotation.x = Math.PI / 2; m.renderOrder = ordre;
        m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false; m.userData.horsAOSol = true; m.userData.sansNormales = true;
        refletsTubes.add(m);
      };
      pose(new THREE.CylinderGeometry(0.021, 0.021, 2.82, 10), mTube, xc, hc, 1.6, 6);
      pose(new THREE.CylinderGeometry(0.044, 0.044, 2.8, 12, 1, true), mHalo, xc + s * 0.007, ht - 0.01, 1.6, 5);
      for (const y of [0.17, 3.03]) pose(new THREE.BoxGeometry(0.055, 0.05, 0.05), mEmbout, xt, ht, y, 6);
    }
  }
  refletsTubes.visible = false; nePasFusionner(refletsTubes); scene.add(refletsTubes);
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
  // (13/10, relecture C2 — photo 23 : le centre du premier hublot, rétroprojeté à 2,25, tombe en (5,37 ; 9,02), et à 2,30 en (5,42 ; 9,12) ; le jeu
  // l'avait en (5,34 ; 8,95), 40 px trop haut sur la photo)
  ch.opale(5.42, 9.1, C05.hBas, 'c05', { r: 0.14, couleur: chaudC05 }); ch.opale(5.33, 11.44, C05.hHaut, 'c05', { r: 0.14, couleur: chaudC05 });
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
  for (const [x, y] of [[12.37, 9.21], [12.37, 11.9]]) ch.opale(x, y, y < C01.yR ? C01.hP : C01.hN, 'c01', { r: 0.14, couleur: chaudC05 });
  // (10/10, VO 92,6-94,8 s : les spots ronds du hall relevés depuis la porte nord — une rangée vers y 4,3 au bout des
  // lignes lumineuses, une vers y 3,2 au-dessus du comptoir ; au-dessus de l'open-space et dans l'angle nord-est, rouvert,
  // posés au même pas. Les huit lignes : js/ecole_hall.js)
  // (Retour r04 du 12/10, la photo de l'accueil rejouée à sa pose : (17,25 ; 3,2), (18,75 ; 3,2) et (18,75 ; 1,5) y sont, à
  // 0,1 m près ; pas de spot en (17,7 ; 4,3) — il en a un en (17,1 ; 4,95), devant la retombée ; au fond à gauche, le spot
  // est en (18,55 ; 7,1), près du mur nord, devant le local — en (18,3 ; 6,3), il tombait sur le pilier de bois clair)
  // (retour r05 du 13/10, r04 rétroprojetée au plafond : celui du bout des lignes en (17,1 ; 5,1) — en y 4,95 il tombait
  // 22 px à droite, x 130 au lieu de 108 — ; celui du fond, contre le local, en (18,72 ; 7,12) — x 50 et non 30)
  // (relecture du 13/10, les trois spots de r04 rétroprojetés un à un : (17,14 ; 3,22), (18,54 ; 3,29) et (18,54 ; 1,52) —
  // la rangée de l'est est 0,2 m plus près du comptoir que sur la VO : le spot au-dessus de l'affiche tombait 15 px trop
  // à droite, celui du coin 11 px trop bas)
  for (const [x, y] of [[15.4, 4.3], [16.55, 4.3], [17.1, 5.1], [17.15, 3.2], [18.55, 3.3], [17.25, 1.5], [18.55, 1.5], [15.9, 6.2], [18.72, 7.12]]) ch.spot(x, y, 2.6, 'hall');
  // (10/10 : le bureau B a perdu son angle nord-est, le passage de la pile — le second spot recule)
  for (const [x, y] of [[11.0, 2.4], [12.55, 1.55]]) ch.spot(x, y, 2.6, 'bureauB');
  // (la Si 0.1 : ses dalles LED sont posées avec son mobilier, js/ecole_pieces.js)
  // (la cage, décalée de DY_S : l'applique du mur nord au-dessus du palier intermédiaire, le plafonnier du palier du 1er,
  // l'applique du mur est au-dessus de la volée 1 — le plafonnier du haut de la cage : js/ecole_etage1.js)
  // (finitions du 11/10 : l'applique du mur du fond au-dessus de la volée 2, à 3,60 — au droit des affiches, à 2,9, elle
  // se verrait par la porte, et la photo 20 n'en montre pas)
  ch.opale(1.35, ESC.yFond, 3.6, 'escalier', { mur: 'S', r: 0.15 });
  // (13/10 : le plafonnier de l'ancien palier du 1er n'est plus — celui de la volée 2, entre ses deux murs, et celui
  // du haut de la cage : js/ecole_etage1.js)
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
  jour(15.13, Y_P6, [15.13, 3.4], 'hall', { poids: 1.6 });       // (la porte 6 : construireEntree)
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

  // LE PASSAGE VU DE LA RUE (13/10, rapport_finitions.md doute 4 — photos 10 et 11 : de la rue, l'intérieur du passage
  // est JAUNE et plus SOMBRE que la façade. Photo 10 refaite à sa pose, rapportée à la pierre de la façade — (221, 223,
  // 220) : le mur est à 0,59 / 0,48 / 0,34, le plafond à 0,50 / 0,39 / 0,26, le sol à 0,34 / 0,28 / 0,21 ; le jeu les
  // montrait à 1,3 fois la façade, blancs, parce que sa lumière principale figure d'un même trait les plafonniers et le
  // ciel). Un VOILE dans l'ouverture, derrière le seuil, tourné vers la rue seulement : il MULTIPLIE ce qu'on voit au
  // travers par un jaune sourd — de l'intérieur il n'existe pas —, et s'efface à mesure que la caméra approche de la
  // grille, comme l'œil s'habitue en entrant (`maj`, plus bas).
  // (14/10 : d'une seule teinte, il éteignait aussi le sol près de la grille — photo 10 : (125, 118, 108) au seuil,
  // (95, 85, 75) au fond ; le jeu, (70, 58, 45) partout. Sa teinte est maintenant une image, claire au pied — 0,82 / 0,76
  // / 0,66 — et pleine à partir de 0,85 m, là où l'on voit le fond du passage ; il se fond par son opacité :
  // dst × (1 − k × (1 − teinte)).)
  // (14/10, relecture — photo 10 reposée, les teintes rapportées à la pierre de la façade : le haut des murs, sous les
  // tubes, était juste ; mais le SOL, le bas des murs et la porte du fond restaient deux à trois fois trop clairs — le
  // sol à 0,79 / 0,64 / 0,45 de la pierre au milieu du passage quand la photo le met à 0,29 / 0,23 / 0,15, le cadre de
  // la porte à 0,93 pour 0,39 —, et le pied du passage, gris neutre au jour de la rue, sortait doré. La teinte du voile
  // suit maintenant la hauteur en trois temps : le pied neutre, une bande SOMBRE de 0,25 à 1,25 m — on y voit le sol,
  // le bas des murs et le bas de la porte —, la teinte du 13/10 au-dessus de 1,75 m, où sont les tubes.)
  // (14/10, relecture — photo 10 rejouée à sa pose, les teintes prises telles quelles, sans passer par la pierre de la
  // façade, que le jeu rend plus sombre que la photo — (144, 145, 139) contre (215, 215, 213) : les rapports à la pierre
  // assombrissaient tout. Le jeu restait deux fois trop sombre et sans bleu : le sol au milieu à (42, 27, 10) pour (70,
  // 55, 39), près du seuil à (71, 62, 53) pour (111, 104, 97), le bas du mur ouest à (77, 51, 20) pour (137, 109, 72), le
  // plafond à (92, 70, 47) pour (117, 97, 72). La bande sombre s'éclaircit et reprend du bleu, le haut aussi.)
  const TEINTE_VOILE = [0.56, 0.5, 0.4];
  const texVoile = canvasTex(4, 64, (g, w, h) => {
    const s = (v) => Math.round(255 * Math.pow(v, 1 / 2.2));
    const PTS = [[0, [0.6, 0.6, 0.62]], [0.25, [0.42, 0.37, 0.3]], [1.25, [0.42, 0.37, 0.3]], [1.75, TEINTE_VOILE], [2.57, TEINTE_VOILE]];
    for (let j = 0; j < h; j++) {
      const z = ((h - 1 - j) / (h - 1)) * 2.57, k = Math.max(1, PTS.findIndex((p) => p[0] >= z)), [z0, a] = PTS[k - 1], [z1, b] = PTS[k];
      const q = Math.max(0, Math.min(1, (z - z0) / (z1 - z0))), f = q * q * (3 - 2 * q);
      g.fillStyle = `rgb(${a.map((t, i) => s(t + (b[i] - t) * f)).join(',')})`; g.fillRect(0, j, w, 1);
    }
  }, null, false, 1);
  // (intégration v2.0 : jusqu'au linteau de la rue, 2,57 — à 2,45, une bande de 12 cm du plafond restait claire ; et au nu
  // EXTÉRIEUR de la façade, y −0,43 — derrière le seuil, le sol pris dans l'épaisseur du mur, y −0,44 à −0,13, restait
  // clair : sur la photo 10, la bande claire n'est que le seuil, y −0,44 à −0,63, et le sol du passage commence sombre)
  const voilePassage = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 2.57),
    new THREE.MeshBasicMaterial({ map: texVoile, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.OneMinusSrcAlphaFactor, premultipliedAlpha: true, opacity: 0, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
  voilePassage.name = 'voile du passage (vu de la rue)'; voilePassage.position.set(3.3, 1.285, 0.43); voilePassage.renderOrder = 4;
  voilePassage.castShadow = false; voilePassage.userData.horsAOSol = true; voilePassage.userData.sansNormales = true;
  nePasFusionner(voilePassage); scene.add(voilePassage);
  // LE PASSAGE VU DU HALL (14/10, photos 06 et 07 — l'inverse : du hall ouest, par la porte vitrée, le passage est en
  // PLEIN JOUR. Photo 06 : son mur à 1,04 / 1,15 / 1,50 du mur blanc du hall, plus clair et bleuté ; le jeu le rendait
  // à 0,82 / 0,81 / 0,72, plus sombre et jaune. Photo 07 : les cadres de la porte, à contre-jour, à 0,33 du mur du
  // passage ; le jeu : 1,03.) Un second voile, dans la porte, juste derrière les vantaux, tourné vers le hall seulement :
  // il ÉCLAIRCIT ce qu'on voit au travers — dst × (1 + teinte) — et s'efface quand la caméra, ou Haythem, arrive à la
  // porte, comme l'œil s'habitue (`maj`, plus bas). Le contre-jour de la photo 07 — les cadres sombres — n'est pas
  // cherché : c'est l'exposition de l'appareil ; le jeu garde celle de la photo 06, le hall juste et le passage clair.
  // (14/10, relecture — photos 06 et 07 rejouées à leur pose, rapportées au mur blanc du hall : vu du hall, le passage
  // est d'un blanc FROID — photo 06, son mur à (179, 182, 197) et son sol à (137, 135, 145) ; photo 07, son sol gris
  // neutre (111, 110, 112), la porte « Sortie » blanche (185, 183, 178) — ; le jeu le rendait crème, (195, 184, 163),
  // et son sol beige, (139, 131, 116). Plus de bleu, un peu moins de rouge : 1,0 / 1,25 / 2,4 et non 1,2 / 1,26 / 1,4.
  // Mais pas partout : à hauteur des tubes — de 1,55 à 2,0 m sur le voile, pour l'appareil des photos 06 et 07 —, le
  // haut des murs reste JAUNE, (200, 170, 100) près de la réglette ouest sur la photo 07 : la teinte d'avant ; et
  // plus haut, où l'on voit le plafond, d'un blanc à peine froid. Une image, multipliée par `q × 3` : `maj`.)
  const texHall = canvasTex(4, 64, (g, w, h) => {
    const s = (v) => Math.round(255 * Math.pow(v / 3, 1 / 2.2)), BAS = [1.0, 1.25, 2.4], TUBES = [1.2, 1.26, 1.4], HAUT = [1.05, 1.2, 1.9];
    const PTS = [[0, BAS], [1.2, BAS], [1.55, TUBES], [2.0, TUBES], [2.25, HAUT], [2.47, HAUT]];
    for (let j = 0; j < h; j++) {
      const z = ((h - 1 - j) / (h - 1)) * 2.47, i1 = PTS.findIndex((p) => p[0] >= z), k = i1 < 0 ? PTS.length - 1 : Math.max(1, i1);
      const [z0, a] = PTS[k - 1], [z1, b] = PTS[k], q = Math.max(0, Math.min(1, (z - z0) / (z1 - z0))), f = q * q * (3 - 2 * q);
      g.fillStyle = `rgb(${a.map((t, i) => s(t + (b[i] - t) * f)).join(',')})`; g.fillRect(0, j, w, 1);
    }
  }, null, false, 1);
  const voileHall = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 2.47),
    new THREE.MeshBasicMaterial({ color: 0x000000, map: texHall, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.OneFactor, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
  voileHall.name = 'voile du passage (vu du hall)'; voileHall.position.set(3.575, 1.235, -(4.05 - 0.075)); voileHall.rotation.y = Math.PI; voileHall.renderOrder = 1;
  voileHall.castShadow = false; voileHall.userData.horsAOSol = true; voileHall.userData.sansNormales = true;
  nePasFusionner(voileHall); scene.add(voileHall);

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
    // (13/10, la volée 2 à sa vraie pente : `palier1` est la volée entre ses deux murs, du 1er — y 6,0, où elle débouche
    // dans le couloir sombre, `e1couloir` — au mur des portes, pour des pieds au-dessus de 1,2 m, et le haut de la cage)
    { id: 'palier1', rects: [zr(0.6, ESC.yT, 2.125, 9.075, 1.2), zr(0.6, 9.0, 4.75, 14.075, 2.6)], voisines: ['escalier', 'e1couloir'], env: { x: 1.36, y: 4.6, z: -7.6 } },
    { id: 'escalier', rects: [zr(0.6, 9.0, 4.75, 14.075)], voisines: ['hallO', 'palier1'], env: { x: 3.4, y: 2.4, z: -11.3 } },
    { id: 'passage', rects: [zr(1.6, -0.45, 4.715, 4.05)], voisines: ['hallO', 'rue'], env: { x: 3.3, y: 1.6, z: -2.0 } },
    // (V2, 11/10 : le C05 de la porte de l'escalier à la porte bleue ; au-delà, l'entrée de la salle David Clark — zone `dc`,
    // js/ecole_pieces.js —, qui s'y ouvre)
    // (13/10, lot C2 : du nu de la cage, 4,53, à la ligne du mur est, 5,995 ; le mur du fond sur la ligne 12,785)
    { id: 'c05', rects: [zr(C05.xO, Y_ESC, C05.xM, C05.yFond + 0.075)], voisines: ['hallO', 'dc'], env: { x: 5.22, y: 1.5, z: -(Y_ESC + 1.8) } },
    // (plan V2 : le hall ouest en trois rectangles — la gorge derrière la paroi vitrée, entre la pile et la ligne x 4,5 ;
    // le hall ouvert sur la salle d'attente jusqu'à x 5,8 ; devant les portes de l'escalier et le C05, au nord du mur
    // safran, jusqu'à x 6,05)
    // (r03, 12/10 : jusqu'au mur sud de la salle, qui recule de 0,20 — DY_R03)
    { id: 'hallO', rects: [zr(1.6, 4.05, 4.715, 4.875), zr(1.6, ATT.ys + EP / 2, 5.8, 7.8), zr(1.6, 7.8, C05.xM, 9.0)], voisines: ['passage', 'attente', 'c05', 'escalier'], env: { x: 3.6, y: 1.6, z: -6.4 } },
    { id: 'c01', rects: [zr(11.6, 7.875, C01.xM, 14.475)], voisines: ['attente'], env: { x: 12.5, y: 1.5, z: -10.4 } },
    // (11/10, plan V2 : la salle d'attente (DY_A) et le passage au sud-ouest de la pile, au droit des deux redents du
    // bureau B, jusqu'à la face ouest de la pile — plus de « cou » ; le hall perd la pile, js/ecole_rdc_centre.js)
    // (retour r02 du 11/10 : et l'antichambre, de l'axe du retour x 9,165 à la pile, jusqu'à l'axe du mur nord du bureau)
    // (relecture : le mur nord du bureau sur la ligne 2,925)
    // (r07, 14/10 : l'antichambre commence à l'axe du mur de la porte, x 9,975 ; le redan, devant le retour du bout du mur
    // sud, de l'axe du mur du redan, y 4,05, au mur sud)
    { id: 'attente', rects: [zr(5.8, ATT.ys, 13.3, ATT.yn), zr(9.975, 2.925, 13.3, ATT.ys), zr(9.165, 4.05, 9.975, ATT.ys), zr(12.5, 2.5, 13.3, 2.925)], voisines: ['hallO', 'c01', 'hall'], env: { x: 9.2, y: 1.6, z: -(10.5 + DY_A) } },
    // (vérification finale v2.0, 14/10 : le RENFONCEMENT de la porte 6 — 1,2 m depuis la relecture de la rue, les vitrages
    // en Y_P6 — est une zone à lui, DEHORS, voisine de la rue seule ; le hall commence aux vitrages. Resté dans le hall, il
    // laissait la caméra y glisser derrière les vantaux ouverts : Haythem juste passé la porte, tourné vers l'accueil, elle
    // filmait la vitrophanie à bout portant, sans lui — et le seuil, vu de biais, passait pour ouvert. Elle s'arrête
    // maintenant aux vitrages, des deux côtés ; de la rue, elle entre dans le renfoncement. Sa carte d'environnement est
    // celle de la rue)
    { id: 'hall', rects: [zr(13.3, Y_P6, 20.1, 4.7), zr(16.575, -0.45, 20.1, Y_P6), zr(14.675, 4.7, 20.1, 7.6)], voisines: ['attente', 'rue', 'couloirEst'], env: { x: 15.8, y: 1.6, z: -4.0 } },
    { id: 'porche', rects: [zr(13.3, -0.45, 16.575, Y_P6)], voisines: ['rue'], env: { x: 9.5, y: 1.7, z: 3.4 } },
    { id: 'rue', rects: [zr(-25, -13.2, 50, -0.4)], voisines: ['hall', 'passage', 'porche'], env: { x: 9.5, y: 1.7, z: 3.4 } },
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
  const porteP = ch.portes.auto.find((P) => P.g.name === 'porte passage');
  const maj = (dt, jeu) => {
    const u = jeu.user.pos, cam = jeu.camera.position;
    // (le voile du passage : entier à 2,5 m de la grille et au-delà, nul à 30 cm)
    // (14/10 : et il s'efface aussi quand HAYTHEM arrive à l'ouverture — la caméra le suit de 2,6 m : il passait le
    // plan du voile quand elle le voyait encore plein, coupé en deux teintes à la taille ; nul à 0,5 m de l'ouverture
    // et dedans, entier à 2,1 m)
    {
      const sat = (v) => Math.max(0, Math.min(1, v)), yH = -u.z;
      const k = sat((cam.z - 0.7) / 2.2) * (yH < -0.13 ? sat((Math.hypot(u.x - 3.3, yH + 0.13) - 0.5) / 1.6) : 0);
      voilePassage.visible = k > 0.01;
      voilePassage.material.opacity = k;
      // (celui du hall : entier quand la caméra est à 1,8 m de la paroi vitrée et au-delà, nul à 30 cm ; de même pour
      // Haythem, nul à 0,7 m de la porte et dans le passage, entier à 2,2 m ; au rez-de-chaussée seulement)
      const q = cam.y > -0.5 && cam.y < 3.2 ? sat((-cam.z - 4.05 - 0.3) / 1.5) * (yH > 4.05 ? sat((Math.hypot(u.x - 3.575, yH - 4.05) - 0.7) / 1.5) : 0) : 0;
      voileHall.visible = q > 0.01;
      voileHall.material.color.setScalar(q * 3);
      // (le reflet des réglettes : la caméra du côté du passage — ou de la rue —, au rez-de-chaussée, la porte fermée)
      // (le voile de la cage, vu du hall : entier, nul quand Haythem est à 0,7 m de la porte ou dans la cage)
      if (ch.voileCage) {
        const kc = cam.y > -0.5 && cam.y < 3.2 && yH < Y_ESC ? sat((Math.hypot(u.x - 3.45, yH - Y_ESC) - 0.7) / 1.5) : 0;
        ch.voileCage.visible = kc > 0.01;
        ch.voileCage.material.color.setRGB(1, 1 - kc * 0.1, 1 - kc * 0.28);
      }
      refletsTubes.visible = cam.y > 0.3 && cam.y < 3.0 && -cam.z < Y_MIROIR - 0.02 && -cam.z > -8 && cam.x > -1 && cam.x < 8 && (!porteP || porteP.k < 0.02);
    }
    visibilite.maj(dt, jeu);
    ch.portes.maj(dt, u.x, u.z, cam.x, cam.z, u.y, cam.y);
    lumieres.maj(dt, u.x, u.z, jeu.renderer, u.y);
    etage1.maj(dt, jeu);
    sousSol.maj(dt, jeu);
    sousSolEst.maj(dt, jeu);
    est.maj(dt, jeu);
    accueil.maj(dt, jeu);
    // l'ombre cuite au sol vaut aussi pour le carrelage du passage et le sol du palier du sous-sol (elle est posée sur le
    // matériau du « terrain »)
    if ((scene.userData.solCuit || 0) !== cuit && M.sol.aoMap) {
      cuit = scene.userData.solCuit || 0;
      for (const m of solsCuits) if (m !== M.sol) { m.aoMap = M.sol.aoMap; m.aoMapIntensity = M.sol.aoMapIntensity; m.needsUpdate = true; }
    }
  };
  // le départ : dans le hall d'entrée, juste passé la porte 6, plein nord, face à la pile et à sa plaque « iris » — là
  // où entre la visite officielle (VO q_0026-0028 ; 10/10)
  // (intégration v2.0, 14/10 : la porte 6 reculée en y 0,8 — la relecture de la rue —, le départ recule d'autant, y 3,7 :
  // à 3,2, la caméra était dans le porche, derrière le vitrage, et le reflet rasant de la porte barrait le bord gauche)
  const d = { x: 14.9, y: 3.7 }, v = { x: 0, y: 1 }, n = Math.hypot(v.x, v.y);   // (11/10 : y 1,3 -> 3,2 : la caméra du lot A, 2,6 m derrière lui, est dans le hall en y 0,6 comme la VO à 6,4 s, plus dans la rue)
  return {
    nom: 'IRIS — rez-de-chaussée',
    collisions: C,
    depart: { x: d.x, z: -d.y, fx: v.x / n, fz: -v.y / n },
    // (zMin -22 -> -25 : la salle David Clark allait jusqu'à y 24,35 — 09/10 ; V2, 11/10 : -24,5, le bâtiment s'arrête à
    // y 23,7, IGN)
    bornes: { xMin: -22, xMax: 47, zMin: -24.5, zMax: 12.45 },          // (lot rue du 13/10 : jusqu'au pied du 5/7, y -12,7)
    sieges: ch.sieges,
    maj,
    lumieres, portes: ch.portes, chantier: ch,
  };
}
