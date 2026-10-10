// =====================================================================
//  LA SALLE ROBERT KAHN, Si 1.4 (crochet de js/ecole_etage1.js) — la salle de TP réseau du 1er étage
// =====================================================================
// D'APRÈS LA VIDÉO OFFICIELLE DE VISITE (2021 : references/ecole/visite_officielle, 54,7 à 66,6 s, q_0220 à q_0267, et à
// 25 i/s les images du relevé reseau.md ; relevé du 10/10). Aucune photo de Haythem ne la montre : la vidéo fait foi.
// On y entre depuis l'espace pause orange du 1er, par une porte vitrée à cadre blanc (VO q_0220 : la plaque « Salle /
// Robert Kahn / Si 1.4 » à gauche, sur l'orange). Derrière, une grande salle AVEUGLE, longue et étroite (6,40 x 11,30 m),
// son grand axe vers le fond du bâtiment, éclairée d'en haut par SIX CAISSONS LUMINEUX en deux files (des lanterneaux à
// verre diffusant : une lumière froide de jour, sans ombre nette). Quatre rangées, une trentaine de postes : une contre
// chaque grand mur (les élèves face au mur), un îlot double au milieu, dos à dos sur une épine blanche ; tours noires,
// écrans de 22 pouces presque tous éteints, commutateurs et routeurs empilés sur les tours, des faisceaux de cordons
// ROUGES et CYAN. Au fond, deux tableaux blancs sur rail couverts de schémas réseau, le bureau de l'enseignant en T au
// bout de l'îlot, l'extincteur, le porte-câbles, un radiateur vertical ; dans l'angle nord-ouest, l'étagère de bois miel
// garnie de matériel et de cartons, à côté d'une PORTE GRISE fermée et d'une affiche turquoise ; côté porte, la desserte
// bleue, un radiateur et, en hauteur dans l'angle sud-ouest, la pile noire au petit écran. Moquette en dalles de 50 cm,
// deux tons d'ardoise posés au hasard ; murs blancs, plinthes gris-bleu ; plafond de plâtre, retombées à joue inclinée
// le long des grands murs (la fente noire du soufflage), poutre au droit de l'îlot et ses deux poteaux.
//
// LA PLACE (plan_global.md § 2.2, § 3.3, lot 6). La porte est dans le MUR ORANGE NORD de l'espace pause (posé par le lot
// 5 : son nu nord en y 12,0 — PROVISOIRE, en attendant sa constante), vers x 12,2-13,1. La salle part de là vers le
// nord. Recalée sur la vidéo (10/10) : sur VO 54,98 s, l'appareil est 1,34 m devant le seuil, centré sur la porte,
// tourné de 4° à gauche — le bord du tableau 1, le poteau nord, l'extincteur, le radiateur et l'angle nord-est tombent
// à 3 px de leur place pour une porte à 4,40 m du mur ouest (u 3,9-4,9) et un îlot dans l'axe u 2,82 ; VO 66,0 s (q_0265,
// le regard vers la porte) le confirme : l'angle sud-ouest, le poteau sud et les deux jambages de la porte. La porte
// n'est donc pas dans l'angle, comme le supposait le plan, et l'îlot est plus à l'ouest que dans reseau.md (u 2,45-4,0) :
// l'allée est, en face de la porte, est large (2 m), l'allée ouest étroite (1,25 m) — ce que montre la vidéo.
//   la salle             x 8,25-14,65   y 12,0-23,3    (u = x - 8,25, v = y - 12,0 : le repère de reseau.md § 3.3)
//   la porte             x 12,175-13,125 dans le mur sud (lot 5)
//   l'encoche sud-est    x 13,125-14,65 y 12,0-12,6 : le renfoncement nord du palier est (js/ecole_est.js) ; la rangée
//                        du mur est commence juste au nord, en y 12,7 (reseau.md : v 0,7)
//   la porte grise       mur ouest, y 20,9-21,8 (fermée : la pièce voisine n'est pas vue)
//   le toit              à 6,70 m, ses six lanterneaux et son acrotère : une aile basse côté cour, sous les fenêtres
//                        arrière du 2e (y 12,45)
// Le plancher (la dalle C.sol à 3,50 et, pour la caméra seule, son dessous), la moquette avec SA lumière cuite et SON
// ombre douce cuite (le rectangle cuit de l'étage, R1, s'arrête à y 12,8), la zone `e1kahn` (lumière froide, six lampes
// `dalle`), les sièges (sol 3,5) : tout est posé ici, dans le groupe de l'étage, qui le coud, l'éclaire et le cache.
//
//   poserKahn(ch, { groupe, lampes, renderer, ySud = 12.0, xPorte = 12.65 }) -> { zones }
//     groupe, lampes : ceux de l'étage (js/ecole_etage1.js) ; ySud : le nu nord du mur orange (la constante du lot 5) ;
//     xPorte : l'axe de sa porte. Tout le reste se déduit de ces deux cotes.
//
// À L'INTÉGRATION (10/10) : le mur orange, sa porte vitrée à imposte et la plaque sont ceux du lot 5 (ici, seulement le
// doublage blanc, percé de 1,05 x 2,50 m au droit de la porte). Sur master seul, l'espace pause imaginé (mur nord en
// y 12,69 et ses fenêtres « sur cour », mur est en x 12,5) et l'angle nord-est des toilettes (x 8,25-8,56, y 12,0-12,75)
// débordent dans les 75 premiers centimètres de la salle : le lot 5 les retire ; les toilettes doivent s'arrêter au mur
// orange (y 11,925) ou à l'ouest de x 8,175.
// RELECTURE (10/10) — essayée en jeu avec la branche du lot 5 (v-etage1, ea48d58) : l'appel devient
//   poserKahn(ch, { groupe, lampes, renderer, ySud: Y_MUR_ORANGE, xPorte: (SI14.x0 + SI14.x1) / 2 }) ;
//   for (const o of SI14.provisoires) { if (o.isObject3D) o.visible = false; else o.off = true; }
// (Y_MUR_ORANGE et SI14 exportés par js/ecole_etage1_pause.js, après poserPause1) : la salle tombe en x 7,975-14,375 ×
// y 12,96-24,26, sans encoche ; on entre, on traverse, on ressort, la zone passe de e1pause à e1kahn au seuil, et la vue
// de VO 54,98 s se retrouve à travers la vraie porte. Sur la cote provisoire y 12,0, les murs s'arrêtent sous la dalle
// du 2e au sud de sa façade arrière (Y_ARR_N) et le toit part de celle-ci : rien ne perce le 2e du lot 8 (essayé aussi).
// L'allée ouest est en cul-de-sac au sud (la desserte et le bout de l'îlot laissent 0,46 m) : on y entre par le nord.
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex } from './kit_decor.js';
import { texPictoExtincteur } from './ecole_matieres.js';
import { cuireLumiereSol } from './ecole_lumieres.js';
import { TELEPHONE } from './appareil.js';
import { cuireOcclusionNiveau } from './ecole_soussol.js';

// ---- les hauteurs (absolues) ----
const N1 = 3.5;                      // le plancher du 1er
const H_RET = N1 + 2.45;             // le dessous des retombées et de la poutre (reseau.md § 3.3 : 2,45 m)
const H_PL = N1 + 2.60;              // le plafond plat
const H_CAIS = N1 + 2.88;            // le fond des caissons lumineux (2,85-2,90 m)
const H_TOIT = N1 + 3.2;             // le dessus du toit (étanchéité) ; l'acrotère au-dessus
const DALLE2 = 6.4;                  // le dessous de la dalle du 2e (js/ecole_etage1.js) : sous le 2e, les murs s'y arrêtent
const H_PLAT = 0.74;                 // le dessus des plateaux, au-dessus du plancher
// ---- la salle (reseau.md § 3.3, recalé : voir l'en-tête) ----
// (PLAN V2, 11/10 — plan_v2.md § 1.4, option (a) de etage1.md § 5 : la salle sortait du bâtiment, x 7,975-14,375 ×
// y 12,96-24,26, de 1,0 à 1,1 m à l'est — ses postes du mur est hors du gabarit IGN, rdc_est/v2/dessus_e1.jpg — et de
// 0,5 m au nord. La porte (x 11,9-12,85) et le mur orange ne bougent pas : la salle glisse à l'ouest, x 6,9-13,3, la porte
// à 0,45 m de son mur est, et s'arrête au fond du bâtiment, y 23,70 — 6,40 x 10,74, dans la marge de ± 1,2 m du relevé.
// Le toit, les lanterneaux et ce qui tient au mur du fond suivent : DL, le raccourcissement)
const LARG = 6.4, LONG = 10.74;      // le nu intérieur
const U_PORTE = 5.475, L_PORTE = 0.95;
const DL = LONG - 11.3;              // (−0,56 : le mur du fond avance ; ce qui y tient le suit)
// le renfoncement nord du palier est (js/ecole_est.js poserPalierEst) : la face ouest de son mur x 13,2, la face nord du
// mur nord de la cage (y 12,525) ; la façade arrière des étages, au-dessus (le 2e s'arrête là : son nu extérieur,
// Y_ARR_N — js/ecole_etage2.js, y 12,45, ép. 0,30). Au sud de cette ligne, le 2e est au-dessus de la salle : ses murs
// s'arrêtent sous sa dalle (relecture du 10/10 : sur la cote provisoire y 12,0, ils perçaient le plancher du 2e de
// 10 cm et l'acrotère montait dans sa salle 1) ; au nord, le toit
const X_RENF = 13.125, Y_RENF = 12.6, Y_ARRIERE = 12.45, Y_ARR_N = Y_ARRIERE + 0.15;
// la lumière des caissons : un jour froid (reseau.md § 3.9 : ≈ 6 000 K). Relecture du 10/10 : #eef3ff sortait blanc
// neutre, voire tiède sous le « soleil » chaud qui figure tous les plafonniers ; la vidéo (q_0230, q_0265) montre la salle
// nettement BLEUTÉE (murs bruts #a6b9d4-#b2cae7, moquette #3d4e6d : bleu moins rouge ≈ +50), face à l'espace pause
// orange — on en garde une bonne moitié
const FROID = new THREE.Color(0xccdcff);
const DIR = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] };        // en PLAN (y vers le fond)
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };   // un groupe dont le +z local regarde vers…

let _zones = [];
// les zones de la salle (js/ecole_etage1.js les range avec les siennes)
export function zonesKahn() { return _zones; }

// =====================================================================
//  LES TEXTURES (dessinées : la salle n'ajoute aucun fichier à charger)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// LA MOQUETTE EN DALLES DE 50 CM (VO q_0222-0230, q_0258-0267 : ardoise marine et gris-bleu, posées au hasard, par
// taches de deux ou trois dalles claires ; chaque dalle tournée d'un quart de tour, ses rangs de touffes en travers de
// ceux de sa voisine ; mate, un peu chinée). Une image pour TOUTE la salle (aucune répétition) : `nx` x `ny` dalles.
function texMoquette(nx, ny) {
  const p = 64;
  return canvasTex(nx * p, ny * p, (g, w, h) => {
    const r2 = graine(1974);
    // (des grappes : une dalle est claire plus volontiers si sa voisine l'est)
    const clair = [];
    for (let j = 0; j < ny; j++) {
      clair.push([]);
      for (let i = 0; i < nx; i++) {
        const v = (i > 0 && clair[j][i - 1] ? 0.22 : 0) + (j > 0 && clair[j - 1][i] ? 0.22 : 0);
        clair[j].push(r2() < 0.2 + v);
      }
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      // (relecture du 10/10 : un rien plus marine — la vidéo, q_0265, #3d4e6d en moyenne ; le jeu sortait gris neutre)
      const c = clair[j][i] ? [104, 118, 146] : [72, 86, 116], t = (r2() - 0.5) * 6;
      const x0 = i * p, y0 = (ny - 1 - j) * p;
      g.fillStyle = rgb(c[0] + t, c[1] + t, c[2] + t); g.fillRect(x0, y0, p, p);
      // les rangs de touffes, dans un sens ou dans l'autre (le quart de tour)
      const travers = (i + j + (r2() < 0.2 ? 1 : 0)) % 2;
      for (let k = 0; k < p; k += 2) {
        g.fillStyle = k % 4 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)';
        if (travers) g.fillRect(x0 + k, y0, 1, p); else g.fillRect(x0, y0 + k, p, 1);
      }
      // le chiné
      for (let k = 0; k < 90; k++) {
        const v = r2() < 0.5 ? 'rgba(20,26,38,0.35)' : 'rgba(170,180,196,0.22)';
        g.fillStyle = v; g.fillRect(x0 + r2() * p, y0 + r2() * p, 1.2, 1.2);
      }
      // le joint (à peine : les dalles sont jointives)
      g.fillStyle = 'rgba(15,18,26,0.35)'; g.fillRect(x0, y0, p, 1); g.fillRect(x0, y0, 1, p);
    }
  }, null, false, 8);
}
// LE CONTREPLAQUÉ DE HÊTRE des coques de chaise (VO q_0258 : miel clair, le fil serré) — tuile : 0,5 m
function texHetre() {
  return canvasTex(256, 256, (g, w, h) => {
    const r2 = graine(77);
    g.fillStyle = '#c0925c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 140; k++) {
      const x = r2() * w, a = 0.04 + r2() * 0.09, c = r2() < 0.5 ? [160, 118, 72] : [236, 206, 160];
      g.strokeStyle = rgb(c[0], c[1], c[2], a); g.lineWidth = 0.6 + r2() * 1.6;
      g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 32) g.lineTo(x + Math.sin(y * 0.02 + k) * 2, y);
      g.stroke();
    }
  }, [2, 2], false, 4);
}
// LA FAÇADE D'UNE TOUR (Dell Precision, VO q_0226-0232 : noire, la baie du lecteur en haut, le bouton argent et son
// témoin, la grille d'aération perforée du bas)
function texFaceTour() {
  return canvasTex(64, 160, (g, w, h) => {
    g.fillStyle = '#17171b'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#26262c'; g.fillRect(6, 10, w - 12, 12); g.fillStyle = '#0b0b0d'; g.fillRect(8, 15, w - 16, 2);
    g.fillStyle = '#9da1a6'; g.beginPath(); g.arc(w / 2, 34, 4, 0, 7); g.fill();
    g.fillStyle = '#6fb6ff'; g.fillRect(w / 2 - 1, 42, 2, 2);
    g.fillStyle = '#0c0c0e';
    for (let y = 60; y < h - 8; y += 4) for (let x = 8 + ((y / 4) % 2) * 2; x < w - 8; x += 4) g.fillRect(x, y, 2, 2);
  }, null, false, 2);
}
// UN COMMUTATEUR 1U (VO q_0233-0241 : gris-bleu foncé, l'étiquette jaune-vert, 24 ports sur deux rangs, les voyants)
function texSwitch() {
  return canvasTex(512, 52, (g, w, h) => {
    g.fillStyle = '#2f3a46'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b6c63a'; g.fillRect(10, 12, 34, 10);
    g.fillStyle = '#1d242c'; g.fillRect(56, 6, 36, 40);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) {
      const x = 104 + i * 27 + Math.floor(i / 6) * 8, y = 6 + j * 21;
      g.fillStyle = '#7b828a'; g.fillRect(x, y, 22, 18); g.fillStyle = '#0d0f12'; g.fillRect(x + 2, y + 3, 18, 13);
      g.fillStyle = (i * 7 + j * 3) % 5 ? '#4cff7a' : '#ffb13a'; g.fillRect(x + 3, y + 1, 3, 2);
    }
    g.fillStyle = '#7b828a'; g.fillRect(450, 8, 22, 18); g.fillRect(478, 8, 22, 18);
    g.fillStyle = '#0d0f12'; g.fillRect(452, 11, 18, 13); g.fillRect(480, 11, 18, 13);
  }, null, false, 4);
}
// UN ROUTEUR 2U (VO q_0226-0230 : façade gris anthracite et argent, deux emplacements de modules, les ports, les voyants)
function texRouteur() {
  return canvasTex(512, 104, (g, w, h) => {
    g.fillStyle = '#2a2b2f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#a7abb0'; g.fillRect(0, 0, 120, h);
    g.fillStyle = '#7c8086'; for (let y = 10; y < h - 10; y += 6) g.fillRect(12, y, 96, 2);
    for (const x0 of [140, 330]) {
      g.fillStyle = '#3a3c41'; g.fillRect(x0, 12, 170, 36); g.fillStyle = '#1a1b1e'; g.fillRect(x0, 56, 170, 36);
      for (let i = 0; i < 4; i++) { g.fillStyle = '#7b828a'; g.fillRect(x0 + 10 + i * 38, 20, 26, 20); g.fillStyle = '#0d0f12'; g.fillRect(x0 + 12 + i * 38, 23, 22, 15); }
      g.fillStyle = '#4cff7a'; g.fillRect(x0 + 150, 18, 4, 4);
    }
    g.fillStyle = '#4cff7a'; g.fillRect(20, 16, 5, 5); g.fillStyle = '#ffb13a'; g.fillRect(32, 16, 5, 5);
  }, null, false, 4);
}
// LA CONSOLE d'un routeur à l'écran (VO 66 s, q_0265 : quelques écrans de l'îlot, côté ouest, en texte blanc sur noir)
function texConsole(n) {
  const L = [
    ['R1>enable', 'R1#configure terminal', 'Enter configuration commands, one per line.', 'R1(config)#interface g0/0',
      'R1(config-if)#ip address 192.168.10.1 255.255.255.0', 'R1(config-if)#no shutdown', '%LINK-5-CHANGED: Interface',
      'GigabitEthernet0/0, changed state to up', 'R1(config-if)#exit', 'R1(config)#router ospf 1',
      'R1(config-router)#network 192.168.10.0 0.0.0.255 area 0', 'R1(config-router)#'],
    ['S2#show vlan brief', '', 'VLAN Name             Status    Ports', '---- ---------------- --------- -----------',
      '1    default          active    Fa0/1, Fa0/2', '10   ADMIN            active    Fa0/3, Fa0/4', '20   ETUDIANTS        active    Fa0/5, Fa0/6',
      '99   NATIVE           active', '', 'S2#show interfaces trunk', 'Port   Mode  Encapsulation  Status', 'Gi0/1  on    802.1q         trunking', 'S2#'],
    ['R2#show ip route', 'Codes: C - connected, S - static, O - OSPF', '', 'Gateway of last resort is not set', '',
      '     10.0.0.0/30 is subnetted, 2 subnets', 'C       10.0.12.0 is directly connected, Se0/0/0',
      'O       10.0.13.0 [110/128] via 10.0.12.1', 'C    192.168.20.0/24 is directly connected, G0/0',
      'O    192.168.10.0/24 [110/65] via 10.0.12.1', 'R2#ping 192.168.10.1', '!!!!!', 'R2#'],
  ][n % 3];
  return canvasTex(256, 160, (g, w, h) => {
    g.fillStyle = '#050505'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8e8e8'; g.font = '9px Consolas, "Courier New", monospace';
    L.forEach((t, i) => g.fillText(t, 5, 12 + i * 11.4));
    g.fillRect(5 + g.measureText(L[L.length - 1]).width + 1, 4 + (L.length - 1) * 11.4, 5, 9);
  }, null, false, 2);
}
// LES TABLEAUX BLANCS (VO q_0242-0249, f_0204 : des schémas de topologie au feutre noir — routeurs en cercles barrés de
// flèches, commutateurs en rectangles, un triangle de trois routeurs, des liaisons et des adresses illisibles ; un trait
// rouge, un bleu). Le tableau 1 fait 1,50 x 1,00, le tableau 2 0,80 x 1,00.
function texTableauReseau(n) {
  return canvasTex(n === 0 ? 1024 : 560, n === 0 ? 682 : 700, (g, w, h) => {
    const r2 = graine(400 + n);
    g.fillStyle = '#f6f7f7'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 22; k++) {
      const x = r2() * w, y = r2() * h, r = 60 + r2() * 170, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(140,150,165,0.07)'); gr.addColorStop(1, 'rgba(140,150,165,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    const feutre = (c = '#26282b', l = 4) => { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = l; g.lineCap = 'round'; g.lineJoin = 'round'; };
    const ecrire = (t, x, y, s = 22, c = '#26282b') => { feutre(c); g.font = `italic 500 ${s}px "Segoe Print", "Comic Sans MS", "Segoe UI", sans-serif`; g.fillText(t, x, y); };
    const trait = (a, b, c, d) => { g.beginPath(); g.moveTo(a + (r2() - 0.5) * 3, b); g.lineTo(c, d + (r2() - 0.5) * 3); g.stroke(); };
    // le routeur : un cylindre vu de biais (une ellipse sur une autre) et ses quatre flèches en croix
    const routeur = (x, y, nom) => {
      feutre();
      g.beginPath(); g.ellipse(x, y, 40, 15, 0, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(x - 40, y); g.lineTo(x - 40, y + 22); g.ellipse(x, y + 22, 40, 15, 0, Math.PI, 0, true); g.lineTo(x + 40, y); g.stroke();
      feutre('#26282b', 3);
      for (const [a, b, c, d] of [[-18, -6, 18, 6], [18, -6, -18, 6]]) trait(x + a, y + b, x + c, y + d);
      if (nom) ecrire(nom, x - 18, y - 24, 22);
    };
    const commutateur = (x, y, nom) => {
      feutre(); g.strokeRect(x - 46, y - 16, 92, 32);
      feutre('#26282b', 3); for (const s of [-1, 1]) { trait(x - 30, y + s * 6, x + 30, y + s * 6); }
      if (nom) ecrire(nom, x - 16, y + 44, 20);
    };
    const pc = (x, y) => { feutre('#26282b', 3); g.strokeRect(x - 18, y - 14, 36, 26); trait(x, y + 12, x, y + 20); trait(x - 12, y + 20, x + 12, y + 20); };
    if (n === 0) {
      ecrire('TP 4 — OSPF multi-zones', 40, 52, 30, '#1f3e8a');
      feutre('#1f3e8a', 4); trait(40, 64, 420, 62);
      // le triangle de trois routeurs (q_0246)
      const R = [[300, 170, 'R1'], [180, 380, 'R2'], [430, 380, 'R3']];
      feutre(); trait(300, 190, 190, 360); trait(300, 190, 425, 360); trait(220, 395, 390, 395);
      for (const [x, y, t] of R) routeur(x, y, t);
      ecrire('10.0.12.0/30', 140, 270, 18); ecrire('10.0.13.0/30', 380, 270, 18); ecrire('10.0.23.0/30', 250, 430, 18);
      ecrire('S0/0/0', 228, 214, 16); ecrire('S0/0/1', 330, 214, 16); ecrire('G0/0', 120, 455, 16);
      // les deux réseaux locaux, leurs commutateurs et leurs postes
      for (const [x, y, t] of [[180, 560, 'S1'], [430, 560, 'S3']]) {
        feutre(); trait(x, 418, x, y - 16); commutateur(x, y, t);
        for (const dx of [-70, 0, 70]) { trait(x + dx * 0.4, y + 16, x + dx, y + 70); pc(x + dx, y + 86); }
      }
      ecrire('192.168.10.0/24', 70, 660, 18); ecrire('192.168.30.0/24', 360, 660, 18);
      // à droite, les routes à écrire (au feutre rouge)
      ecrire('area 0', 560, 160, 22, '#c22a2a');
      feutre('#c22a2a', 3); g.beginPath(); g.ellipse(560 + 160, 330, 200, 150, 0, 0, 7); g.stroke();
      routeur(650, 300, 'ABR'); commutateur(800, 380, null); trait(690, 318, 760, 368);
      ecrire('router ospf 1', 600, 520, 20); ecrire('network 10.0.12.0 0.0.0.3 area 0', 600, 550, 18);
      ecrire('passive-interface g0/0', 600, 580, 18);
    } else {
      ecrire('VLAN — trunk 802.1Q', 30, 50, 26, '#1f3e8a');
      routeur(280, 112, null); feutre(); trait(280, 150, 280, 200); commutateur(280, 216, 'SW-CORE');
      for (const [x, t] of [[130, 'SW-A'], [430, 'SW-B']]) {
        feutre(); trait(280, 232, x, 344); commutateur(x, 360, t);
        ecrire('trunk', (280 + x) / 2 - 24, 300, 16, '#c22a2a');
        for (const dx of [-50, 0, 50]) { trait(x + dx * 0.4, 376, x + dx, 450); pc(x + dx, 466); }
      }
      ecrire('VLAN 10 ADMIN', 40, 556, 20); ecrire('VLAN 20 ÉTUDIANTS', 40, 588, 20); ecrire('VLAN 99 natif', 40, 620, 20);
      feutre('#26282b', 3);
      for (let k = 0; k < 3; k++) trait(300, 550 + k * 32, 320 + 140 + r2() * 80, 550 + k * 32);
      ecrire('switchport mode trunk', 260, 672, 17);
    }
  }, null, false, 8);
}
// L'AFFICHE A1 TURQUOISE ET BLANCHE du mur ouest (VO q_0250-0256 : le bandeau turquoise, des colonnes de texte, trois
// ou quatre photos, des touches de rose et de rouge, la bande turquoise du bas) — illisible ; une affiche de formation
function texAfficheTurquoise() {
  return canvasTex(256, 362, (g, w, h) => {
    const r2 = graine(1931);
    g.fillStyle = '#fbfbf9'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2bb3bd'; g.fillRect(0, 0, w, 54); g.fillRect(0, h - 22, w, 22);
    g.fillStyle = '#ffffff'; g.font = '700 19px "Segoe UI", Arial, sans-serif'; g.fillText('Les réseaux', 14, 26);
    g.font = '500 12px "Segoe UI", Arial, sans-serif'; g.fillText('du câble au routage', 14, 44);
    for (const [x, y, ww, hh] of [[14, 66, 108, 70], [134, 66, 108, 50], [134, 196, 108, 62], [14, 262, 108, 56]]) {
      const gr = g.createLinearGradient(x, y, x + ww, y + hh); gr.addColorStop(0, '#5d7f9c'); gr.addColorStop(1, '#273c52');
      g.fillStyle = gr; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + ww * 0.2, y + hh * 0.3, ww * 0.5, hh * 0.35);
    }
    g.fillStyle = '#d94a7a'; g.fillRect(14, 146, 40, 6); g.fillStyle = '#c8202a'; g.fillRect(134, 126, 30, 6);
    g.fillStyle = '#8c939a';
    for (const [x, y0, y1] of [[14, 160, 254], [134, 136, 190], [134, 268, 330], [14, 326, 334]]) for (let y = y0; y < y1; y += 9) g.fillRect(x, y, 70 + r2() * 38, 4);
  }, null, false, 4);
}
// L'AFFICHE A3 JAUNE ET BLEU MARINE du mur est, au bout de la rangée (VO q_0240-0241) — illisible
function texAfficheJaune() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1d2b55'; g.fillRect(0, 0, w, 96); g.fillRect(0, 210, w, 60); g.fillRect(0, h - 30, w, 30);
    g.fillStyle = '#f2c230'; g.font = '800 26px "Segoe UI", Arial, sans-serif'; g.fillText('CYBER', 18, 46); g.fillText('SÉCURITÉ', 18, 78);
    g.fillStyle = '#1d2b55'; for (let y = 116; y < 200; y += 12) g.fillRect(18, y, 150 + (y % 5) * 12, 5);
    g.fillStyle = '#ffffff'; g.font = '600 15px "Segoe UI", Arial, sans-serif'; g.fillText('les bons réflexes', 18, 246);
    g.fillStyle = '#1d2b55'; for (let y = 286; y < h - 40; y += 12) g.fillRect(18, y, 120 + (y % 7) * 14, 5);
  }, null, false, 4);
}
// UNE FEUILLE A4 de consignes (au mur est, VO q_0236-0238)
function texFeuille(n) {
  return canvasTex(128, 181, (g, w, h) => {
    const r2 = graine(60 + n);
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#26282b'; g.fillRect(12, 14, 70, 8);
    g.fillStyle = '#7d8288'; for (let y = 34; y < h - 14; y += 8) g.fillRect(12, y, 50 + r2() * 54, 3);
  }, null, false, 2);
}
// LE VERRE DIFFUSANT D'UN CAISSON (VO q_0222, plafond_a : un champ blanc éblouissant, à peine plus sombre vers le cadre)
// — dessiné : une carte à elle seule distingue aussi sa matière (l'optimisation du décor confond deux matières qui
// éclairent dès que leurs couleurs, ramenées à 255, sont égales : sans carte, le verre froid prenait le jaune des spots)
function texDiffuseur() {
  return canvasTex(64, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, h * 0.62);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#f1f4f8'); gr.addColorStop(1, '#d9dee6');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, null, false, 2);
}
// LE GRAVIER DU TOIT (vu des fenêtres du 2e) — tuile : 1 m
function texGravier() {
  return canvasTex(256, 256, (g, w, h) => {
    const r2 = graine(3110);
    g.fillStyle = '#8d8a84'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 2600; k++) { const v = 90 + r2() * 110; g.fillStyle = rgb(v, v - 3, v - 8, 0.7); g.beginPath(); g.arc(r2() * w, r2() * h, 0.8 + r2() * 1.6, 0, 7); g.fill(); }
  }, [1, 1], false, 4);
}

// =====================================================================
//  LA SALLE
// =====================================================================
export function poserKahn(ch, { groupe, lampes, renderer = null, ySud = 12.0, xPorte = 12.65 } = {}) {
  const { C, M } = ch, t0 = performance.now();
  const x0 = xPorte - U_PORTE, x1 = x0 + LARG, y0 = ySud, y1 = ySud + LONG;
  const X = (u) => x0 + u, Y = (v) => y0 + v;
  // l'encoche du renfoncement du palier est, si la salle déborde à l'est de sa face ouest
  const encoche = x1 > X_RENF + 0.01 && y0 < Y_RENF;
  const xS = encoche ? X_RENF : x1;                       // le bout est du mur sud
  const sieges = [];
  const mesLampes = [];

  // ---- les matières ----
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const nommer = (m, n) => { m.name = n; return m; };
  // (les blancs de la salle tirent un rien vers le froid : sous la lumière des caissons, la vidéo les montre bleutés,
  // quand ceux de l'espace pause, à côté, sont chauds — VO q_0220 ; le plafond reste plus terne que les murs, et les joues
  // des trémies, que le verre éclaire, plus claires que lui — VO q_0222, q_0230 : seuls les verres éblouissent)
  // (relecture du 10/10 : plus froids — voir FROID ; le plafond un peu plus clair, la vidéo le montre gris bleuté clair
  // entre les caissons, le jeu le rendait gris moyen : #94908d contre #b6b1bd, q_0230)
  const teinte = new THREE.Color(0.78, 0.87, 1.0);
  const K = {
    blanc: nommer(M.blanc.clone(), 'peinture blanche (salle Robert Kahn)'),
    platre: nommer(M.platre.clone(), 'plafond en plâtre (salle Robert Kahn)'),
    joue: nommer(M.platre.clone(), 'joue des caissons lumineux'),
    facade: nommer(std({ color: 0xc9c6bf, roughness: 0.9 }), 'enduit extérieur de l\'aile'),
    plinthe: nommer(std({ color: 0x3a3f48, roughness: 0.55 }), 'plinthe gris-bleu'),
    moquette: nommer(std({ map: texMoquette(Math.ceil(LARG / 0.5), Math.ceil(LONG / 0.5)), roughness: 0.937 }), 'moquette en dalles (salle Robert Kahn)'),
    plateau: nommer(std({ color: 0xccc6bb, roughness: 0.42 }), 'plateau stratifié blanc cassé'),
    pied: nommer(std({ color: 0x8e9298, roughness: 0.38, metalness: 0.55 }), 'pied de bureau gris'),
    piedSombre: std({ color: 0x3a3c40, roughness: 0.4, metalness: 0.5 }),
    hetre: nommer(std({ map: texHetre(), roughness: 0.5 }), 'coque de hêtre'),
    luge: nommer(std({ color: 0x1e1e20, roughness: 0.4, metalness: 0.5 }), 'luge de chaise noire'),
    // (relecture du 10/10 : plastique MAT — à 0,38 de rugosité et 0,3 de métal, les tours prenaient le reflet de la
    // carte d'environnement : brun chocolat dans celle de l'espace pause orange, gris dans celle de la salle ; les
    // claviers, à plat sous les caissons, sortaient gris clair quand la vidéo les montre noirs — q_0230, q_0265)
    tour: nommer(std({ color: 0x141418, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.3 }), 'tour noire'),
    faceTour: std({ map: texFaceTour(), roughness: 0.6, envMapIntensity: 0.3 }),
    ecran: std({ color: 0x101012, roughness: 0.55, envMapIntensity: 0.3 }),
    eteint: nommer(std({ color: 0x07080a, roughness: 0.14, metalness: 0.2, envMapIntensity: 0.25 }), 'écran éteint'),
    clavier: std({ color: 0x141416, roughness: 0.88, envMapIntensity: 0.15 }),
    switchCorps: std({ color: 0x2c3742, roughness: 0.4, metalness: 0.5 }),
    switchFace: std({ map: texSwitch(), roughness: 0.4 }),
    routeurCorps: std({ color: 0x2a2b2e, roughness: 0.35, metalness: 0.6 }),
    routeurFace: std({ map: texRouteur(), roughness: 0.4 }),
    plastique: nommer(std({ color: 0xf0f0ec, roughness: 0.4 }), 'plastique blanc'),
    noir: std({ color: 0x18181a, roughness: 0.5 }),
    rouge: nommer(std({ color: 0xb31822, roughness: 0.55 }), 'cordon rouge'),
    cyan: nommer(std({ color: 0x5bc0de, roughness: 0.5 }), 'cordon cyan'),
    poteau: nommer(std({ color: 0xdadde0, roughness: 0.7 }), 'poteau gris très clair'),
    miel: nommer(std({ color: 0xc8853f, roughness: 0.5 }), 'étagère en bois miel'),
    montant: std({ color: 0x9a6638, roughness: 0.5 }),
    carton: nommer(std({ color: 0xb08a5c, roughness: 0.85 }), 'carton'),
    etiquette: std({ color: 0xf4f2ec, roughness: 0.7 }),
    framboise: std({ color: 0xc2386a, roughness: 0.5 }),
    turquoise: std({ color: 0x4fb8b8, roughness: 0.5 }),
    jaune: std({ color: 0xe8c23a, roughness: 0.5 }),
    argent: std({ color: 0xb8bcc0, roughness: 0.35, metalness: 0.6 }),
    grisAppareil: std({ color: 0x6a6e74, roughness: 0.4, metalness: 0.4 }),
    desserte: nommer(std({ color: 0x2a4f8c, roughness: 0.4, metalness: 0.4 }), 'desserte bleue'),
    tablette: std({ color: 0xc9cbcd, roughness: 0.45 }),
    porteGrise: nommer(std({ color: 0xb5b2b4, roughness: 0.45 }), 'vantail gris clair'),
    rail: M.aluGris,
    gravier: nommer(std({ map: texGravier(), roughness: 0.95 }), 'gravier du toit'),
    // (le dôme des lanterneaux, vu du 2e : un polycarbonate laiteux)
    dome: nommer(std({ color: 0xe9eef2, roughness: 0.3, transparent: true, opacity: 0.8, depthWrite: false }), 'dôme de lanterneau'),
    fente: std({ color: 0x0e0f11, roughness: 0.8 }),
  };
  // (les murs : un léger émissif froid tient lieu du jour diffus des six caissons, qui éclaire toute la salle d'égal — les
  // quatre spots qui suivent Haythem n'en éclairent que le coin où il est ; VO q_0265 : le mur du fond, côté porte, est
  // aussi clair que les autres)
  K.blanc.color.copy(teinte); K.blanc.emissive = new THREE.Color(0xbcd0f4); K.blanc.emissiveIntensity = 0.15;
  K.platre.color.multiply(teinte); K.platre.emissive = new THREE.Color(0xc4d5f4); K.platre.emissiveIntensity = 0.13;
  K.joue.color.multiply(teinte); K.joue.emissive = new THREE.Color(0xe2ecff); K.joue.emissiveIntensity = 0.34;
  // ce qui éclaire (au-delà de 1, le bloom les fait briller) : le verre diffusant des caissons
  const diffuseur = nommer(new THREE.MeshBasicMaterial({ map: texDiffuseur(), color: FROID.clone().multiplyScalar(4.5) }), 'caisson lumineux allumé');
  const consoles = [0, 1, 2].map((n) => new THREE.MeshBasicMaterial({ map: texConsole(n), color: new THREE.Color(0.85, 0.85, 0.85) }));

  // ---- les outils ----
  // UNE BOÎTE (plan, hauteurs absolues), UV en mètres ; l'architecture ne porte pas d'ombre (la lumière principale,
  // presque d'aplomb, figure les plafonniers : un plafond qui ferait ombre éteindrait la salle)
  const B = (xa, ya, xb, yb, h0, h1, mat, o = {}) => ch.boite(Math.min(xa, xb), Math.min(ya, yb), Math.max(xa, xb), Math.max(ya, yb), h0, h1, mat, { parent: groupe, ...o });
  const archi = (xa, ya, xb, yb, h0, h1, mat) => B(xa, ya, xb, yb, h0, h1, mat, { ombre: false });
  const panneau = (mat, w, h, x, y, hc, face) => { const p = ch.panneau(mat, w, h, x, y, hc, face, groupe); p.castShadow = false; return p; };
  // un groupe posé au sol de l'étage en (x, y), son +z local tourné vers `face` (ou un angle)
  const poser = (x, y, face, h = N1) => {
    const g = new THREE.Group(); g.position.set(x, h, -y); g.rotation.y = typeof face === 'number' ? face : ROT[face]; groupe.add(g);
    return g;
  };
  // UN MUR de la salle (de `base` à `h`), percé d'ouvertures ; ses plinthes gris-bleu (8 cm) au pied des faces nommées
  const mur = ({ de, a, ep = 0.15, base = N1, h = H_TOIT, mats, plinthes = [], ouvertures = [], collision = true }) => {
    const [xa, ya] = de, [xb, yb] = a;
    const axeX = Math.abs(xb - xa) >= Math.abs(yb - ya);
    const debut = axeX ? Math.min(xa, xb) : Math.min(ya, yb), fin = axeX ? Math.max(xa, xb) : Math.max(ya, yb);
    const ligne = axeX ? ya : xa;
    const ouv = ouvertures.map((o) => ({ a0: Math.max(debut, o.c - o.l / 2), a1: Math.min(fin, o.c + o.l / 2), haut: Math.min(h, o.h ?? base + 2.04) }))
      .sort((p, q) => p.a0 - q.a0);
    const pleins = [];
    let a0 = debut;
    for (const o of ouv) {
      if (o.a0 > a0 + 1e-3) pleins.push({ a0, a1: o.a0, h0: base, h1: h });
      if (o.haut < h - 1e-3) pleins.push({ a0: o.a0, a1: o.a1, h0: o.haut, h1: h });
      a0 = Math.max(a0, o.a1);
    }
    if (fin > a0 + 1e-3) pleins.push({ a0, a1: fin, h0: base, h1: h });
    const cotes = axeX ? ['N', 'S'] : ['E', 'W'];
    const mat = (c) => (mats && mats.isMaterial ? mats : (mats && mats[c]) || K.blanc);
    for (const p of pleins) {
      const R = (v0, v1) => (axeX ? [p.a0, ligne + v0, p.a1, ligne + v1] : [ligne + v0, p.a0, ligne + v1, p.a1]);
      const [bx0, by0, bx1, by1] = R(-ep / 2, ep / 2);
      if (collision) C.ajouterBoite(bx0, -by0, bx1, -by1, { y0: p.h0, y1: p.h1 });
      if (mat(cotes[0]) === mat(cotes[1])) archi(bx0, by0, bx1, by1, p.h0, p.h1, mat(cotes[0]));
      else {
        const [ax0, ay0, ax1, ay1] = R(0, ep / 2), [cx0, cy0, cx1, cy1] = R(-ep / 2, 0);
        archi(ax0, ay0, ax1, ay1, p.h0, p.h1, mat(cotes[0])); archi(cx0, cy0, cx1, cy1, p.h0, p.h1, mat(cotes[1]));
      }
      if (p.h0 <= base + 1e-3) for (const c of plinthes) {
        const s = c === cotes[0] ? 1 : -1, v = s * (ep / 2 + 0.006);
        const [px0, py0, px1, py1] = R(v - 0.006, v + 0.006);
        archi(px0, py0, px1, py1, base, base + 0.08, K.plinthe);
      }
    }
  };
  // UNE TIGE d'un point à un autre (repère d'un groupe) ; UN TUBE le long d'une courbe (luges, cordons)
  const _y = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3();
  const tige = (g, mat, a, b, r, seg = 8) => {
    _d.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const t = maille(new THREE.CylinderGeometry(r, r, _d.length(), seg), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 0, g);
    t.quaternion.setFromUnitVectors(_y, _d.normalize());
    return t;
  };
  const tube = (g, mat, pts, r, n = 16, ombre = true) => {
    const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal');
    return maille(new THREE.TubeGeometry(c, n, r, 5, false), mat, 0, 0, 0, 0, g, { ombre });
  };
  // UNE PLAQUE ARRONDIE extrudée (`e` d'épaisseur), à plat, cintrée : z += k·x² (la coque d'une chaise)
  const plaque = (w, d, e, r, k = 0) => {
    const s = new THREE.Shape(), a = -w / 2, b = -d / 2;
    s.moveTo(a + r, b); s.lineTo(a + w - r, b); s.quadraticCurveTo(a + w, b, a + w, b + r); s.lineTo(a + w, b + d - r);
    s.quadraticCurveTo(a + w, b + d, a + w - r, b + d); s.lineTo(a + r, b + d); s.quadraticCurveTo(a, b + d, a, b + d - r);
    s.lineTo(a, b + r); s.quadraticCurveTo(a, b, a + r, b);
    const g = new THREE.ExtrudeGeometry(s, { depth: e, bevelEnabled: false, curveSegments: 4 });
    g.translate(0, 0, -e / 2);
    if (k) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + k * p.getX(i) ** 2); g.computeVertexNormals(); }
    return g;
  };

  // =====================================================================
  //  LES MURS (blancs dedans ; l'enduit de l'aile dehors) ET LA PORTE GRISE
  // =====================================================================
  const yGrise = Y(9.35 + DL);                          // (V2 : contre l'étagère de l'angle, qui suit le mur du fond)
  // (un mur nord-sud : sous le 2e — au sud de sa façade arrière — il s'arrête sous sa dalle ; au-delà, il monte au toit)
  const murNS = (x, ya, yb, o) => {
    const dans = (p, q) => (o.ouvertures || []).filter((v) => v.c > p && v.c < q);
    if (ya < Y_ARR_N - 1e-3) mur({ ...o, de: [x, ya], a: [x, Math.min(yb, Y_ARR_N)], h: DALLE2, ouvertures: dans(ya, Y_ARR_N) });
    if (yb > Y_ARR_N + 1e-3) mur({ ...o, de: [x, Math.max(ya, Y_ARR_N)], a: [x, yb], ouvertures: dans(Y_ARR_N, yb) });
  };
  murNS(x0 - 0.075, y0 - 0.15, y1 + 0.15, { mats: { E: K.blanc, W: K.facade }, plinthes: ['E'], ouvertures: [{ c: yGrise, l: 0.93, h: N1 + 2.04 }] });
  mur({ de: [x0 - 0.15, y1 + 0.075], a: [x1 + 0.15, y1 + 0.075], mats: { S: K.blanc, N: K.facade }, plinthes: ['S'] });
  murNS(x1 + 0.075, encoche ? Y_RENF : y0 - 0.15, y1 + 0.15, { mats: { W: K.blanc, E: K.facade }, plinthes: ['W'] });
  // LE MUR SUD : le mur orange de l'espace pause (lot 5) ; de ce côté, un doublage blanc de 12 mm, percé au droit de sa
  // porte et de son imposte (VO, de l'intérieur : la porte à cadre blanc, l'imposte claire au-dessus — jusqu'à 2,50 m)
  mur({ de: [x0, y0 + 0.006], a: [xS, y0 + 0.006], ep: 0.012, h: H_PL, mats: K.blanc, plinthes: ['N'], ouvertures: [{ c: xPorte, l: L_PORTE + 0.1, h: N1 + 2.5 }] });
  if (encoche) {
    // l'encoche : les faces du renfoncement du palier (js/ecole_est.js), doublées de même
    mur({ de: [X_RENF - 0.006, y0], a: [X_RENF - 0.006, Y_RENF], ep: 0.012, h: H_PL, mats: K.blanc, plinthes: ['W'] });
    mur({ de: [X_RENF, Y_RENF + 0.006], a: [x1, Y_RENF + 0.006], ep: 0.012, h: H_PL, mats: K.blanc, plinthes: ['N'] });
  }
  // LA PORTE GRISE du mur ouest (VO q_0246-0256 : vantail plein gris clair, huisserie grise, la béquille alu côté SUD —
  // et non au nord comme le relevé ; fermée : elle mène à une pièce voisine, Si 1.5 ou réserve, que la vidéo ne montre pas)
  ch.porte('y', x0 - 0.075, yGrise, { l: 0.93, h: 2.04, base: N1, ep: 0.15, modele: 'grise', etat: 'fermee', cote: 'E', charniere: 'd', oculus: false, matVantail: K.porteGrise, notices: 0, nom: 'Si 1.4 (porte du mur ouest)' });

  // =====================================================================
  //  LE SOL : la dalle, la moquette (sa lumière et son ombre cuites à elle)
  // =====================================================================
  // le rectangle cuit de la moquette (uv1 de 0 à 1, v = 1 au nord)
  const RK = { x0: x0 - 0.2, x1: x1 + 0.2, y0: y0 - 0.2, y1: y1 + 0.2 };
  const rects = encoche ? [[x0, y0, X_RENF, Y_RENF], [x0, Y_RENF, x1, y1]] : [[x0, y0, x1, y1]];
  {
    const pos = [], nor = [], uv = [], uv1 = [], idx = [];
    const W = RK.x1 - RK.x0, L = RK.y1 - RK.y0, NX = Math.ceil(LARG / 0.5) * 0.5, NY = Math.ceil(LONG / 0.5) * 0.5;
    // (sous la porte, la moquette passe sous le seuil, jusqu'au nu sud du mur orange : pas de fente sur le vide)
    const tous = [...rects, [xPorte - L_PORTE / 2 - 0.05, y0 - 0.16, xPorte + L_PORTE / 2 + 0.05, y0]];
    for (const [xa, ya, xb, yb] of tous) {
      const b = pos.length / 3;
      for (const [x, y] of [[xa, ya], [xb, ya], [xb, yb], [xa, yb]]) {
        pos.push(x, N1, -y); nor.push(0, 1, 0);
        uv.push((x - x0) / NX, (y - y0) / NY); uv1.push((x - RK.x0) / W, (y - RK.y0) / L);
      }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, K.moquette); m.receiveShadow = true; m.castShadow = false; m.name = 'moquette de la salle Robert Kahn';
    m.userData.solEtage = true; m.userData.solKahn = true; groupe.add(m);
  }
  // le seuil (une barre d'aluminium : la moquette s'y arrête, le lino de l'espace pause reprend)
  archi(xPorte - L_PORTE / 2, y0 - 0.15, xPorte + L_PORTE / 2, y0 + 0.02, N1, N1 + 0.006, M.alu);
  // LE MONDE SOLIDE : la dalle à 3,50 (là où aucune ne couvre, solEn rendrait le rez-de-chaussée) ; pour la caméra
  // seule, le dessous du plancher
  C.sol(x0 - 0.15, -(y0 - 0.15), x1 + 0.15, -(y1 + 0.15), N1);
  C.ajouterBoite(x0 - 0.15, -y0, x1 + 0.15, -(y1 + 0.15), { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });

  // =====================================================================
  //  LE PLAFOND : retombées à joue inclinée, poutre, six caissons lumineux (VO q_0220-0230, q_0258-0265)
  // =====================================================================
  // Les caissons : 1,30 x 2,60 m, le verre diffusant à 2,88 m, au fond d'une trémie à joues inclinées de 25 cm ; deux
  // files au-dessus des allées (u 1,38 et 4,5 — VO q_0265, f_0066 ; reseau.md : 1,6 et 4,85, l'îlot plus à l'est), trois
  // par file (v 2,2 ; 5,6 ; 9,0)
  const UC = [1.38, 4.5], VC = [2.2, 5.6, 9.0], CW = 1.3, CL = 2.6, J = 0.25;
  const RET = 0.3, PENTE = 0.2;                           // la retombée : 30 cm à plat, puis la joue inclinée
  const uPoutre = 2.82;                                  // l'axe de l'îlot, de la poutre et des poteaux
  {
    // le plafond plat, en bandes autour des trémies
    const ua = RET + PENTE, ub = LARG - RET - PENTE;
    const bandes = [[ua, UC[0] - CW / 2 - J], [UC[0] + CW / 2 + J, UC[1] - CW / 2 - J], [UC[1] + CW / 2 + J, ub]];
    const plat = (uA, vA, uB, vB) => {
      if (uB - uA < 0.01 || vB - vA < 0.01) return;
      const m = maille(new THREE.PlaneGeometry(uB - uA, vB - vA).rotateX(Math.PI / 2), K.platre, X((uA + uB) / 2), H_PL, -Y((vA + vB) / 2), 0, groupe, { ombre: false });
      m.userData.horsAOSol = true;
    };
    for (const [uA, uB] of bandes) plat(uA, 0, uB, LONG);
    for (const uc of UC) {
      const uA = uc - CW / 2 - J, uB = uc + CW / 2 + J;
      let v = 0;
      for (const vc of VC) { plat(uA, v, uB, vc - CL / 2 - J); v = vc + CL / 2 + J; }
      plat(uA, v, uB, LONG);
      // chaque caisson : quatre joues inclinées (blanches, éclairées par le verre), le cadre d'aluminium, le verre allumé
      for (const vc of VC) {
        const cx = X(uc), cy = Y(vc);
        const q = (pts) => {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap(([x, y, h]) => [x, h, -y]), 3));
          g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
          const m = new THREE.Mesh(g, K.joue); m.castShadow = false; m.receiveShadow = false; m.userData.horsAOSol = true; groupe.add(m);
        };
        const a = CW / 2, b = CL / 2, A = a + J, Bb = b + J;
        // (le bord au plafond, puis le bord au verre, en tournant : la face regarde le milieu de la trémie, vers le bas)
        q([[cx - A, cy - Bb, H_PL], [cx + A, cy - Bb, H_PL], [cx + a, cy - b, H_CAIS], [cx - a, cy - b, H_CAIS]]);
        q([[cx + A, cy + Bb, H_PL], [cx - A, cy + Bb, H_PL], [cx - a, cy + b, H_CAIS], [cx + a, cy + b, H_CAIS]]);
        q([[cx - A, cy + Bb, H_PL], [cx - A, cy - Bb, H_PL], [cx - a, cy - b, H_CAIS], [cx - a, cy + b, H_CAIS]]);
        q([[cx + A, cy - Bb, H_PL], [cx + A, cy + Bb, H_PL], [cx + a, cy + b, H_CAIS], [cx + a, cy - b, H_CAIS]]);
        const v = maille(new THREE.PlaneGeometry(CW, CL).rotateX(Math.PI / 2), diffuseur, cx, H_CAIS, -cy, 0, groupe, { ombre: false, recoit: false });
        v.userData.horsAOSol = true;
        for (const [xa, ya, xb, yb] of [[cx - a, cy - b, cx + a, cy - b + 0.03], [cx - a, cy + b - 0.03, cx + a, cy + b], [cx - a, cy - b, cx - a + 0.03, cy + b], [cx + a - 0.03, cy - b, cx + a, cy + b]]) {
          archi(xa, ya, xb, yb, H_CAIS - 0.012, H_CAIS, M.alu).userData.horsAOSol = true;
        }
        // LA LAMPE du caisson (un jour froid ; cuite sur la moquette par cette salle, sur le carrelage de l'étage par lui)
        const L = { x: cx, z: -cy, h: H_PL, zone: 'e1kahn', type: 'dalle', base: N1, cuire: false, force: 1.0, couleur: FROID };
        ch.lampes.push(L); if (lampes) lampes.push(L); mesLampes.push(L);
      }
    }
    // LES RETOMBÉES le long des grands murs (30 cm à 2,45 m, la joue qui remonte au plafond, la fente noire du soufflage
    // — VO q_0258, q_0265 : bien visible côté ouest)
    for (const s of [1, -1]) {
      const uMur = s > 0 ? 0 : LARG, uBord = uMur + s * RET;
      archi(X(Math.min(uMur, uBord)), y0, X(Math.max(uMur, uBord)), y1, H_RET, H_PL, K.platre).userData.horsAOSol = true;
      const g = new THREE.BufferGeometry(), xa = X(uBord), xb = X(uBord + s * PENTE);
      const pts = [[xa, y0, H_RET], [xa, y1, H_RET], [xb, y1, H_PL], [xb, y0, H_PL]];
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap(([x, y, h]) => [x, h, -y]), 3));
      g.setIndex(s > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
      const m = new THREE.Mesh(g, K.platre); m.castShadow = false; m.userData.horsAOSol = true; groupe.add(m);
      const xf = X(uMur + s * (RET - 0.07));
      archi(xf - 0.012, y0 + 0.4, xf + 0.012, y1 - 0.4, H_RET - 0.002, H_RET, K.fente).userData.horsAOSol = true;
    }
    // LA POUTRE au droit de l'îlot (30 x 15 cm) et ses DEUX POTEAUX (18 x 18, gris très clair : VO q_0222, q_0226). Le
    // poteau sud à v 1,45, dans l'épine, et non au bout de l'îlot (v 0,8 du relevé) — relecture du 10/10 : sur VO 55,9 s
    // (f_0090, caméra au seuil recalée à 1,2 px sur le poteau nord, l'extincteur, le radiateur) et q_0224 (2,1 px), il
    // tombe à x 82 et 70 de l'image ; à v 0,8 il serait hors champ, à 40 px à gauche du bord
    for (const v of [1.45, 5.9]) B(X(uPoutre - 0.09), Y(v - 0.09), X(uPoutre + 0.09), Y(v + 0.09), N1, H_RET, K.poteau, { ombre: false, collision: true });
    // pour la caméra : le plafond (sous les retombées)
    for (const [xa, ya, xb, yb] of rects) C.plafond(xa, -yb, xb, -ya, H_RET);
    // un détecteur de fumée, entre les caissons
    maille(new THREE.CylinderGeometry(0.06, 0.065, 0.045, 20), K.plastique, X(uPoutre), H_RET - 0.022, -Y(7.3), 0, groupe, { ombre: false });
  }

  // =====================================================================
  //  LE TOIT ET SES LANTERNEAUX (vus des fenêtres arrière du 2e)
  // =====================================================================
  {
    // (du nu extérieur de la façade arrière du 2e — ni dans son mur, ni dans sa salle 1 — jusqu'au mur nord ; si le mur
    // orange est plus au nord, le toit le couvre jusqu'à la façade : pas de fente sur le vide sous les fenêtres du 2e)
    const ya = Y_ARR_N, xa = x0 - 0.15, xb = x1 + 0.15, yb = y1 + 0.15;
    const ouv = [];
    for (const uc of UC) for (const vc of VC) ouv.push([X(uc) - CW / 2, Y(vc) - CL / 2, X(uc) + CW / 2, Y(vc) + CL / 2]);
    // la dalle et son gravier, en bandes autour des trémies (de H_CAIS au dessus du toit)
    const dalle = (p, q, r, s) => { if (r - p > 0.01 && s - q > 0.01) { archi(p, q, r, s, H_CAIS, H_TOIT - 0.02, M.beton); archi(p, q, r, s, H_TOIT - 0.02, H_TOIT, K.gravier); } };
    const xs = [xa, ...ouv.filter((o, i) => i % 3 === 0).flatMap((o) => [o[0], o[2]]), xb];
    for (let i = 0; i < xs.length - 1; i++) {
      const p = xs[i], r = xs[i + 1];
      if (i % 2 === 0) { dalle(p, ya, r, yb); continue; }
      let q = ya;
      for (const o of ouv.filter((o) => Math.abs(o[0] - p) < 1e-6)) { dalle(p, q, r, o[1]); q = o[3]; }
      dalle(p, q, r, yb);
    }
    // l'acrotère (ouest, nord, est ; au sud, la façade arrière du bâtiment)
    for (const [p, q, r, s] of [[xa, ya, xa + 0.2, yb], [xa, yb - 0.2, xb, yb], [xb - 0.2, ya, xb, yb]]) archi(p, q, r, s, H_TOIT, H_TOIT + 0.35, K.facade);
    for (const [p, q, r, s] of [[xa - 0.03, ya, xa + 0.23, yb], [xa - 0.03, yb - 0.23, xb + 0.03, yb + 0.03], [xb - 0.23, ya, xb + 0.03, yb]]) archi(p, q, r, s, H_TOIT + 0.35, H_TOIT + 0.38, M.alu);
    // les lanterneaux : la costière (30 cm) et le conduit jusqu'au verre diffusant, le dessus du verre (laiteux, vu d'en
    // haut au travers du dôme), le dôme rectangulaire bombé
    const dessusVerre = nommer(std({ color: 0xdfe6ec, roughness: 0.4, emissive: 0xeef3ff, emissiveIntensity: 0.25 }), 'dessus du verre des caissons');
    const geoDome = (() => {
      const g = new THREE.PlaneGeometry(1, 1, 10, 10), pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) * 2, y = pos.getY(i) * 2; pos.setZ(i, (1 - x * x) * (1 - y * y)); }
      g.rotateX(-Math.PI / 2); g.computeVertexNormals();
      return g;
    })();
    for (const [p, q, r, s] of ouv) {
      for (const [a, b, c, d] of [[p - 0.1, q - 0.1, r + 0.1, q + 0.005], [p - 0.1, s - 0.005, r + 0.1, s + 0.1], [p - 0.1, q, p + 0.005, s], [r - 0.005, q, r + 0.1, s]]) archi(a, b, c, d, H_CAIS, H_TOIT + 0.3, K.facade);
      maille(new THREE.PlaneGeometry(r - p, s - q).rotateX(-Math.PI / 2), dessusVerre, (p + r) / 2, H_CAIS + 0.003, -(q + s) / 2, 0, groupe, { ombre: false });
      const d = new THREE.Mesh(geoDome, K.dome);
      d.scale.set(r - p + 0.2, 0.3, s - q + 0.2); d.position.set((p + r) / 2, H_TOIT + 0.3, -(q + s) / 2); d.castShadow = false;
      groupe.add(d);
    }
  }

  // =====================================================================
  //  LE MOBILIER
  // =====================================================================
  // ---- le bureau d'élève (VO q_0222-0232, f_0130 : plateau stratifié blanc cassé de 75 cm, quatre pieds en tube carré
  // gris, une ceinture ; posés bout à bout, deux pieds côte à côte à chaque jonction) ----
  const bureau = (xa, ya, xb, yb, { pieds = K.pied } = {}) => {
    archi(xa, ya, xb, yb, N1 + H_PLAT - 0.025, N1 + H_PLAT, K.plateau).castShadow = true;
    const e = 0.03, l = 0.04;
    for (const [px, py] of [[xa + e, ya + e], [xb - e - l, ya + e], [xa + e, yb - e - l], [xb - e - l, yb - e - l]]) B(px, py, px + l, py + l, N1, N1 + H_PLAT - 0.025, pieds);
    // la ceinture, sur les quatre côtés
    const c0 = N1 + H_PLAT - 0.085, c1 = N1 + H_PLAT - 0.025;
    archi(xa + e, ya + e, xb - e, ya + e + 0.02, c0, c1, pieds); archi(xa + e, yb - e - 0.02, xb - e, yb - e, c0, c1, pieds);
    archi(xa + e, ya + e, xa + e + 0.02, yb - e, c0, c1, pieds); archi(xb - e - 0.02, ya + e, xb - e, yb - e, c0, c1, pieds);
  };
  // ---- la chaise à coque de hêtre sur luge noire (VO q_0258, rang_mur_g : assise et dossier séparés, ton miel ; la luge
  // en tube noir) ; `dir` : où regarde qui s'y assied ; `sortie` : où il se relève (dans l'allée) ----
  // (l'assise creusée, les bords relevés ; le dossier cintré, ses bords vers l'avant)
  const geoAssise = plaque(0.42, 0.41, 0.012, 0.06, 0.25), geoDos = plaque(0.42, 0.25, 0.012, 0.05, 0.45);
  const geoLuge = (() => {
    const pts = [[0, 0.80, -0.215], [0, 0.6, -0.215], [0, 0.44, -0.2], [0, 0.03, -0.235], [0, 0.012, -0.2], [0, 0.012, 0.2], [0, 0.03, 0.235], [0, 0.44, 0.19]];
    const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.2);
    return new THREE.TubeGeometry(c, 28, 0.0105, 5, false);
  })();
  const chaise = (x, y, dir, sortie, { tiree = 0, angle = 0, nom = 'la chaise' } = {}) => {
    const [fx, fy] = DIR[dir];
    const g = poser(x - fx * tiree, y - fy * tiree, Math.atan2(fx, -fy) + angle);
    const s = maille(geoAssise, K.hetre, 0, 0.455, 0.0, 0, g); s.rotation.x = -Math.PI / 2;
    const d = maille(geoDos, K.hetre, 0, 0.72, -0.215, 0, g); d.rotation.x = -0.14;
    for (const sx of [-0.19, 0.19]) maille(geoLuge, K.luge, sx, 0, 0, 0, g);
    for (const [z, h] of [[-0.2, 0.44], [0.19, 0.44]]) { const t = maille(new THREE.CylinderGeometry(0.009, 0.009, 0.38, 6), K.luge, 0, h, z, 0, g, { ombre: false }); t.rotation.z = Math.PI / 2; }
    C.ajouterCercle(g.position.x, g.position.z, 0.17, { y0: N1, y1: N1 + 0.9 });
    sieges.push({ x: g.position.x + fx * 0.03, z: g.position.z - fy * 0.03, y: 0.46, fx, fz: -fy, sx: sortie[0], sz: -sortie[1], nom, sol: N1 });
    return g;
  };
  // ---- les machines : la tour (Dell Precision, quelques-unes à poignée), l'écran 22 pouces, le clavier, la souris ----
  const geoTour = boiteM(0.18, 0.42, 0.44);
  const tour = (g, a, b, { poignee = false } = {}) => {
    maille(geoTour, K.tour, b, 0.21, a, 0, g);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.41), K.faceTour); f.position.set(b, 0.21, a + 0.2205); g.add(f);
    if (poignee) {
      for (const dz of [-0.17, 0.17]) maille(boiteM(0.03, 0.05, 0.025), K.tour, b, 0.445, a + dz, 0, g, { ombre: false });
      maille(boiteM(0.03, 0.02, 0.37), K.tour, b, 0.47, a, 0, g);
    }
    return 0.42;
  };
  const ecran = (g, a, b, mat = K.eteint) => {
    maille(boiteM(0.22, 0.012, 0.17), K.ecran, b, 0.006, a, 0, g);
    maille(boiteM(0.05, 0.16, 0.03), K.ecran, b, 0.09, a - 0.03, 0, g);
    maille(boiteM(0.51, 0.31, 0.025), K.ecran, b, 0.33, a - 0.005, 0, g);
    const e = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.27), mat); e.position.set(b, 0.335, a + 0.0085); g.add(e);
  };
  // (le clavier, la souris à sa droite)
  const clavier = (g, a, b) => {
    maille(boiteM(0.44, 0.018, 0.14), K.clavier, b, 0.009, a, 0, g, { ombre: false });
    maille(boiteM(0.06, 0.022, 0.1), K.clavier, b + 0.31, 0.011, a + 0.01, 0, g, { ombre: false });
  };
  // ---- le matériel réseau (VO q_0226-0241) : commutateur 1U, routeur 2U, borne Wi-Fi blanche, routeur à deux antennes ----
  const commutateur = (g, a, b, h) => {
    maille(boiteM(0.44, 0.044, 0.3), K.switchCorps, b, h + 0.022, a, 0, g);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.044), K.switchFace); f.position.set(b, h + 0.022, a + 0.1505); g.add(f);
    return 0.044;
  };
  const routeur = (g, a, b, h) => {
    maille(boiteM(0.44, 0.088, 0.35), K.routeurCorps, b, h + 0.044, a, 0, g);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.088), K.routeurFace); f.position.set(b, h + 0.044, a + 0.1755); g.add(f);
    return 0.088;
  };
  const geoBorne = plaque(0.2, 0.2, 0.035, 0.05);
  const borne = (g, a, b, h) => { const m = maille(geoBorne, K.plastique, b, h + 0.0175, a, 0, g); m.rotation.x = -Math.PI / 2; maille(boiteM(0.012, 0.004, 0.012), consoles[0], b + 0.05, h + 0.036, a + 0.05, 0, g, { ombre: false }); };
  const routeurWifi = (g, a, b, h) => {
    maille(boiteM(0.22, 0.04, 0.15), K.noir, b, h + 0.02, a, 0, g);
    for (const s of [-1, 1]) { const t = maille(new THREE.CylinderGeometry(0.007, 0.01, 0.17, 6), K.noir, b + s * 0.08, h + 0.12, a - 0.07, 0, g); t.rotation.z = s * 0.25; }
  };
  // ---- les cordons : des courbes molles en tubes fins (VO : des dizaines de cordons rouges, des cyan). Dans le repère
  // d'un poste : ils partent des ports, devant la pile de matériel (b0, af, h), pendent sur le plateau devant la tour,
  // repartent le long de son flanc vers le fond du bureau et remontent à `fin` = [a, h] (la goulotte, le haut de l'épine,
  // ou le plateau) ; sans matériel, de l'arrière de la tour. ----
  let graineC = 7;
  const cordons = (g, mat, n, { b0, af, h, fin, dos = false }) => {
    const r2 = graine(graineC++);
    for (let k = 0; k < n; k++) {
      const s = r2() < 0.5 ? -1 : 1, bS = b0 + s * (0.12 + r2() * 0.06), [aF, hF] = fin;
      if (dos) {
        // (de l'arrière de la tour, le long du fond du bureau, jusqu'à la tour voisine — VO q_0233-0236)
        const b = b0 + (r2() - 0.5) * 0.1;
        tube(g, mat, [[b, 0.22 + r2() * 0.1, af], [b + s * 0.02, 0.05, af - 0.01], [b + s * 0.2, 0.012, aF + 0.06], [b + s * 0.48, 0.012, aF + 0.05 + r2() * 0.06], [b + s * 0.66, 0.16, af]], 0.0026, 16, false);
        continue;
      }
      // (des ports, une boucle vers l'avant, puis le long du flanc de la pile — pas devant la façade de la tour)
      // (chacun sa boucle : plus ou moins molle, plus ou moins en avant ; certains croisent devant la tour — VO q_0240)
      const b = b0 + (r2() - 0.4) * s * 0.36, hh = h - r2() * 0.03, bL = b0 + s * (0.13 + r2() * 0.12), avant = 0.06 + r2() * 0.2;
      tube(g, mat, [[b, hh, af], [b + s * 0.02, hh - 0.03, af + 0.05], [(b + bL) / 2 + (r2() - 0.5) * 0.1, hh * (0.3 + r2() * 0.35), af + avant], [bL, 0.014, af + avant * 0.6], [bS, 0.01, af - 0.2],
        [bS, 0.012, aF + 0.08], [bS + s * 0.03, Math.max(0.012, hF * 0.6), aF + 0.03], [bS + s * 0.05 + (r2() - 0.5) * 0.08, hF, aF]], 0.0026, 24, false);
    }
  };

  // UN POSTE : le bureau (centre `cx, cy`), la chaise, la machine, ce qu'il y a dessus. `dir` : où regarde l'élève ('E' ou
  // 'W'). Dans le repère du poste, +z vers l'élève (a), +x à sa droite (b) ; le fond du bureau (le mur ou l'épine) en
  // a = -P/2. `fin` : où vont les cordons ([a, h] au-dessus du plateau).
  const P = 0.75;
  const poste = (cx, cy, dir, { sortie, tour: optTour = {}, empile = [], ecranMat = null, cordon = null, fin = [-P / 2 + 0.02, 0.012], tourCote = 1, chaiseTiree = 0, angle = 0, machine = true }) => {
    const [fx] = DIR[dir];
    const g = poser(cx, cy, dir === 'E' ? ROT.W : ROT.E, N1 + H_PLAT);   // (+z vers l'élève)
    const bT = tourCote * 0.36, bE = -tourCote * 0.06, aT = -P / 2 + 0.26;
    if (machine) {
      let h = tour(g, aT, bT, optTour);
      // (le matériel posé sur la tour, sa façade au droit de celle de la tour)
      for (const e of empile) {
        if (e === 'switch') h += commutateur(g, aT + 0.07, bT, h);
        else if (e === 'routeur') h += routeur(g, aT + 0.045, bT, h);
        else if (e === 'borne') borne(g, aT + 0.02, bT, h);
        else if (e === 'wifi') routeurWifi(g, aT + 0.05, bT, h);
      }
      ecran(g, -P / 2 + 0.13, bE, ecranMat || K.eteint);
      clavier(g, P / 2 - 0.2, bE);
      // (`cordon` : [matière, nombre], ou une liste de ces paires)
      for (const [mat, n] of cordon ? (Array.isArray(cordon[0]) ? cordon : [cordon]) : []) {
        if (empile.length) cordons(g, mat, n, { b0: bT, af: aT + 0.225, h: h - 0.02, fin });
        else cordons(g, mat, n, { b0: bT, af: aT - 0.225, h: 0.3, fin, dos: true });
      }
    }
    // (rangée sous le plateau : l'assise passe à moitié sous le bord, le dossier dépasse à peine — VO q_0230, q_0265)
    chaise(cx - fx * (P / 2 - 0.04), cy, dir, sortie, { tiree: chaiseTiree, angle });
    return g;
  };

  // ---- LES RANGÉES (reseau.md § 3.5, recalé sur VO q_0220-0267) ----
  // la rangée du MUR EST : 8 postes, élèves face au mur, de v 0,7 à 10,2 ; moitié sud aux cordons cyan, moitié nord aux
  // commutateurs, à la borne blanche et aux cordons rouges (VO q_0233-0241, le travelling)
  {
    const v0 = 0.7, v1 = 10.2, n = 8, pas = (v1 - v0) / n, xa = X(LARG - P), xb = X(LARG);
    bureau(xa, Y(v0), xb, Y(v1));
    C.ajouterBoite(xa, -Y(v0), xb, -Y(v1), { y0: N1, y1: N1 + H_PLAT + 0.02 });
    for (let i = 0; i < n; i++) {
      const vc = v0 + (i + 0.5) * pas, nord = i >= 4;
      const empile = nord ? (i === 6 ? ['switch', 'switch', 'borne'] : i % 2 ? ['switch', 'switch'] : ['switch']) : [];
      poste((xa + xb) / 2, Y(vc), 'E', {
        sortie: [X(4.64), Y(vc)], tour: { poignee: i % 3 === 1 }, empile, fin: [-P / 2 + 0.06, 0.37],
        cordon: nord ? [[K.rouge, 5], [K.cyan, 2]] : [K.cyan, 2], tourCote: i % 2 ? 1 : -1, chaiseTiree: i === 2 ? 0.12 : 0,
      });
    }
    // la goulotte blanche au-dessus des bureaux (1,05-1,17 m), ses étiquettes jaunes et ses prises, des cordons rouges
    archi(xb - 0.05, Y(v0 + 0.2), xb, Y(v1 - 0.2), N1 + 1.05, N1 + 1.17, K.plastique);
    for (let i = 0; i < n; i++) {
      const y = Y(v0 + (i + 0.5) * (v1 - v0) / n) + 0.25;
      archi(xb - 0.052, y - 0.03, xb - 0.05, y + 0.03, N1 + 1.13, N1 + 1.155, K.jaune);
    }
  }
  // la rangée du MUR OUEST : 8 postes, de v 0,3 à 8,6 ; le routeur Wi-Fi à deux antennes au 3e depuis le fond, un carton
  // sur la tour du dernier (VO q_0250-0258) ; deux boîtiers de prises au mur, branchés en rouge (VO 66 s)
  {
    const v0 = 0.3, v1 = 8.6 + DL, n = 8, pas = (v1 - v0) / n, xa = X(0), xb = X(P);   // (V2 : jusqu'à la porte grise)
    bureau(xa, Y(v0), xb, Y(v1));
    C.ajouterBoite(xa, -Y(v0), xb, -Y(v1), { y0: N1, y1: N1 + H_PLAT + 0.02 });
    for (let i = 0; i < n; i++) {
      const vc = v0 + (i + 0.5) * pas;
      const g = poste((xa + xb) / 2, Y(vc), 'W', {
        sortie: [X(1.38), Y(vc)], tour: { poignee: i % 3 === 0 }, empile: i === 5 ? ['wifi'] : [], tourCote: i % 2 ? -1 : 1,
        cordon: i % 3 === 1 ? [K.rouge, 2] : null, chaiseTiree: i === 4 ? 0.15 : 0,
      });
      if (i === n - 1) maille(boiteM(0.3, 0.16, 0.34), K.carton, i % 2 ? -0.36 : 0.36, 0.42 + 0.08, -P / 2 + 0.26, 0, g);
    }
    // (relecture du 10/10 : côte à côte, v 5,0 et 5,3, vers 1,2 m — VO q_0265, x 515-565 de l'image, sous les quatre
    // étiquettes ; le relevé les donnait à v 3,6 et 6,6, où la vidéo n'en montre pas)
    for (const v of [5.0, 5.3]) {
      archi(xa, Y(v) - 0.06, xa + 0.04, Y(v) + 0.06, N1 + 1.16, N1 + 1.25, K.plastique);
      archi(xa + 0.04, Y(v) - 0.04, xa + 0.042, Y(v) + 0.04, N1 + 1.225, N1 + 1.24, K.jaune);
      // (de la prise, le long du mur jusqu'au fond du plateau, puis vers la tour voisine)
      for (let k = 0; k < 2; k++) {
        const y = Y(v) - 0.03 + k * 0.05, s = k ? 1 : -1;
        tube(groupe, K.rouge, [[xa + 0.035, N1 + 1.18, -y], [xa + 0.045, N1 + 0.98, -(y + s * 0.02)], [xa + 0.05, N1 + H_PLAT + 0.012, -(y + s * 0.06)], [xa + 0.09, N1 + H_PLAT + 0.01, -(y + s * 0.3)], [xa + 0.14, N1 + H_PLAT + 0.012, -(y + s * 0.42)]], 0.0026, 12, false);
      }
    }
  }
  // L'ÎLOT DOUBLE : deux rangées de 7 postes dos à dos (élèves de l'allée ouest face à l'est, ceux de l'allée est face à
  // l'ouest), l'épine blanche au milieu (15 cm, 30 cm au-dessus des plateaux) d'où sortent les câbles ; les routeurs 2U
  // empilés sur une tour sur deux ou trois (VO q_0226-0232) ; quelques écrans en console côté ouest (VO 66 s)
  {
    const v0 = 0.9, v1 = 8.5, n = 7, pas = (v1 - v0) / n, ue = uPoutre - 0.06, uf = uPoutre + 0.06;
    bureau(X(ue - P), Y(v0), X(ue), Y(v1)); bureau(X(uf), Y(v0), X(uf + P), Y(v1));
    C.ajouterBoite(X(ue - P), -Y(v0), X(uf + P), -Y(v1), { y0: N1, y1: N1 + H_PLAT + 0.02 });
    archi(X(ue), Y(v0), X(uf), Y(v1), N1 + 0.4, N1 + H_PLAT + 0.3, K.plastique).castShadow = true;
    for (let i = 0; i < n; i++) {
      const vc = v0 + (i + 0.5) * pas;
      // (côté ouest : élèves face à l'est ; au bout nord, pas de machine — la caisse et l'imprimante)
      poste(X(ue - P / 2), Y(vc), 'E', {
        sortie: [X(1.38), Y(vc)], empile: i % 3 === 0 ? ['routeur', 'routeur'] : i % 3 === 1 ? ['routeur'] : [], fin: [-P / 2 + 0.01, 0.29],
        ecranMat: i === 4 || i === 5 ? consoles[i % 3] : null, cordon: i % 3 !== 2 ? [i % 2 ? K.cyan : K.rouge, 3] : null,
        tourCote: i % 2 ? 1 : -1, chaiseTiree: i === 1 ? 0.1 : 0, machine: i < n - 1,
      });
      // (côté est : élèves face à l'ouest)
      poste(X(uf + P / 2), Y(vc), 'W', {
        sortie: [X(4.64), Y(vc)], empile: [['routeur'], ['routeur', 'switch'], [], ['routeur', 'routeur'], ['switch'], ['routeur'], ['routeur', 'routeur']][i], fin: [-P / 2 + 0.01, 0.29],
        cordon: i % 3 !== 0 ? [K.rouge, 4] : [K.cyan, 2], tour: { poignee: i % 2 === 0 }, tourCote: i % 2 ? -1 : 1,
      });
    }
    // la caisse blanche pleine de cordons rouges et l'imprimante, au bout nord, côté ouest (reseau.md § 3.5)
    const xc = X(ue - P / 2), yc = Y(v1 - 0.3);
    archi(xc - 0.18, yc - 0.42, xc + 0.18, yc - 0.02, N1 + H_PLAT, N1 + H_PLAT + 0.22, K.plastique).castShadow = true;
    for (let k = 0; k < 6; k++) tube(groupe, K.rouge, [[xc - 0.14 + k * 0.055, N1 + H_PLAT + 0.2, -(yc - 0.38)], [xc - 0.1 + k * 0.04, N1 + H_PLAT + 0.27, -(yc - 0.22)], [xc - 0.15 + k * 0.05, N1 + H_PLAT + 0.21, -(yc - 0.05)]], 0.004, 8, false);
    archi(xc - 0.2, yc + 0.02, xc + 0.2, yc + 0.4, N1 + H_PLAT, N1 + H_PLAT + 0.2, K.plastique).castShadow = true;
    archi(xc - 0.16, yc + 0.06, xc + 0.16, yc + 0.36, N1 + H_PLAT + 0.2, N1 + H_PLAT + 0.205, K.noir);
  }
  // LE BUREAU DE L'ENSEIGNANT (VO f_0066 : plateau blanc sur pieds sombres, en T au bout nord de l'îlot ; l'enseignant
  // assis à son bout ouest, face à la salle), son fauteuil, sa machine
  {
    const xa = X(2.95), xb = X(4.45), ya = Y(8.62), yb = Y(9.32);
    bureau(xa, ya, xb, yb, { pieds: K.piedSombre });
    C.ajouterBoite(xa, -ya, xb, -yb, { y0: N1, y1: N1 + H_PLAT + 0.02 });
    const g = poser(X(3.75), Y(8.97), ROT.N, N1 + H_PLAT);
    // (dans le repère du bureau, tourné vers l'enseignant : sa droite vers l'ouest — l'écran devant lui, la tour à l'est)
    tour(g, -0.12, -0.45); ecran(g, -0.15, 0.35); clavier(g, 0.15, 0.35);
    chaise(X(3.4), Y(9.62), 'S', [X(3.4), Y(10.3)], { nom: 'la chaise du professeur' });
  }
  // ---- le mur du fond : le rail, les deux tableaux blancs, l'extincteur et ses pictogrammes, le radiateur vertical, le
  // porte-câbles, l'affiche jaune et bleue (VO q_0242-0249, f_0066, f_0204) ----
  {
    const yN = y1 - 0.003;
    archi(X(1.5), yN - 0.03, X(4.45), yN, N1 + 2.08, N1 + 2.12, K.rail);
    archi(X(1.5), yN - 0.012, X(4.45), yN, N1 + 0.93, N1 + 0.95, K.rail);
    // les tableaux : 1,50 x 1,00 et 0,80 x 1,00 (cadre d'aluminium, auget, feutres, la brosse rose, l'aimant vert)
    const tableau = (ua, ub, n) => {
      const xa = X(ua), xb = X(ub);
      archi(xa, yN - 0.025, xb, yN, N1 + 0.95, N1 + 1.95, M.alu);
      const t = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa - 0.04, 0.96), new THREE.MeshStandardMaterial({ map: texTableauReseau(n), roughness: 0.16 }));
      t.position.set((xa + xb) / 2, N1 + 1.45, -(yN - 0.026)); t.receiveShadow = true; groupe.add(t);   // (tourné vers le sud)
      archi(xa + 0.1, yN - 0.09, xb - 0.1, yN - 0.025, N1 + 0.94, N1 + 0.96, M.alu);
      archi(xa - 0.02, yN - 0.03, xa + 0.02, yN, N1 + 1.95, N1 + 2.1, M.alu);
      archi(xb - 0.02, yN - 0.03, xb + 0.02, yN, N1 + 1.95, N1 + 2.1, M.alu);
    };
    tableau(1.8, 3.3, 0); tableau(3.35, 4.15, 1);
    for (const [k, c] of [[0, 0xc22a2a], [1, 0x111111]]) {
      const f = maille(new THREE.CylinderGeometry(0.009, 0.009, 0.13, 8), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }), X(2.3 + k * 0.1), N1 + 0.965, -(yN - 0.06), 0, groupe, { ombre: false });
      f.rotation.z = Math.PI / 2;
    }
    archi(X(1.78), yN - 0.07, X(1.84), yN - 0.026, N1 + 1.35, N1 + 1.48, std({ color: 0xe0559a, roughness: 0.5 }));
    archi(X(3.4), yN - 0.035, X(3.43), yN - 0.026, N1 + 1.0, N1 + 1.03, std({ color: 0x3caa4a, roughness: 0.5 }));
    // l'extincteur à eau (u 4,6 ; de 0,45 à 1,15 m — VO f_0066, q_0230 : son milieu sous le bas des tableaux, et non à
    // 1,0-1,75 m comme le relevé), sa console, son tuyau noir ; le pictogramme carré à 2,0 m, le petit à 1,6 m
    const ge = poser(X(4.6), yN - 0.1, ROT.S);
    maille(new THREE.CylinderGeometry(0.075, 0.075, 0.5, 16), M.rougeEtiquette, 0, 0.72, 0, 0, ge);
    maille(new THREE.CylinderGeometry(0.03, 0.045, 0.08, 10), M.noirMat, 0, 1.01, 0, 0, ge);
    tube(ge, M.noirMat, [[0.02, 0.99, 0.04], [0.08, 0.87, 0.06], [0.07, 0.57, 0.07], [0.05, 0.49, 0.05]], 0.009, 10);
    archi(X(4.6) - 0.05, yN - 0.03, X(4.6) + 0.05, yN, N1 + 0.78, N1 + 0.86, M.noirMat);
    C.ajouterCercle(X(4.6), -(yN - 0.1), 0.09, { y0: N1 + 0.4, y1: N1 + 1.1 });
    const picto = new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 });
    panneau(picto, 0.15, 0.15, X(4.6), yN - 0.001, N1 + 2.0, 'S');
    panneau(picto, 0.1, 0.1, X(4.6), yN - 0.001, N1 + 1.58, 'S');
    // le radiateur vertical de l'angle nord-est (u 5,37-5,82, de 0,30 à 1,75 m) et sa grille
    B(X(5.37), yN - 0.09, X(5.82), yN, N1 + 0.3, N1 + 1.75, M.radiateur, { collision: true });
    for (let k = 0; k < 9; k++) archi(X(5.39 + k * 0.05), yN - 0.092, X(5.41 + k * 0.05), yN - 0.09, N1 + 0.32, N1 + 1.73, M.grille);
    // le porte-câbles : un pied en épingle de tube gris (1,90 m) où pendent des cordons cyan et quelques rouges
    {
      const g = poser(X(5.15), Y(10.95 + DL), ROT.S);
      for (const s of [-1, 1]) tige(g, K.pied, [s * 0.12, 0.02, 0], [s * 0.12, 1.88, 0], 0.012);
      tige(g, K.pied, [-0.13, 1.88, 0], [0.13, 1.88, 0], 0.012);
      for (const s of [-1, 1]) tige(g, K.pied, [s * 0.12, 0.012, -0.16], [s * 0.12, 0.012, 0.16], 0.012);
      const r2 = graine(5);
      for (let k = 0; k < 16; k++) {
        const x = -0.11 + k * 0.0147, L = 0.5 + r2() * 0.8, mat = k % 6 === 3 ? K.rouge : K.cyan;
        tube(g, mat, [[x, 1.9, 0.012], [x + 0.005, 1.9 - L * 0.5, 0.025 + r2() * 0.02], [x - 0.004, 1.9 - L, 0.015]], 0.003, 8, false);
      }
      C.ajouterCercle(g.position.x, g.position.z, 0.2, { y0: N1, y1: N1 + 1.9 });
    }
    // l'affiche jaune et bleue, au bout nord de la rangée du mur est ; deux feuilles A4 au-dessus des postes
    panneau(new THREE.MeshStandardMaterial({ map: texAfficheJaune(), roughness: 0.7 }), 0.3, 0.42, X(LARG) - 0.002, Y(10.7 + DL), N1 + 1.7, 'W');
    for (const [v, n] of [[6.0, 1], [8.0, 2]]) panneau(new THREE.MeshStandardMaterial({ map: texFeuille(n), roughness: 0.7 }), 0.21, 0.297, X(LARG) - 0.002, Y(v), N1 + 1.8, 'W');
  }
  // ---- l'angle nord-ouest : l'ÉTAGÈRE de bois miel garnie (VO q_0242-0256, f_0204), l'affiche A1 turquoise ----
  {
    // dos contre le mur ouest, flanc contre le mur nord : 1,40 m le long du mur, 45 cm de fond, 1,65 m ; deux tablettes de
    // matériel, deux tiroirs, des cartons en bas ; dessus, cartons bruns étiquetés, boîtes blanches, le mug noir
    const g = poser(X(0), Y(LONG - 0.75), ROT.E);
    const lg = 1.4, pf = 0.45, ht = 1.65;
    for (const s of [-1, 1]) maille(boiteM(0.025, ht, pf), K.montant, s * (lg / 2 - 0.0125), ht / 2, pf / 2, 0, g);
    maille(boiteM(lg, ht, 0.012), K.montant, 0, ht / 2, 0.006, 0, g);
    for (const h of [0.03, 0.42, 0.62, 1.12, ht - 0.012]) maille(boiteM(lg - 0.05, 0.025, pf), K.miel, 0, h, pf / 2, 0, g);
    for (let k = 0; k < 2; k++) {
      maille(boiteM(lg - 0.06, 0.085, 0.02), K.miel, 0, 0.475 + k * 0.095, pf - 0.01, 0, g);
      maille(boiteM(0.12, 0.012, 0.015), M.alu, 0, 0.475 + k * 0.095, pf + 0.005, 0, g, { ombre: false });
    }
    const boite = (mat, b, h, w, hh, d = 0.3) => maille(boiteM(w, hh, d), mat, b, h + hh / 2, pf - d / 2 - 0.02, 0, g);
    // tablette basse : les cartons
    boite(K.carton, -0.38, 0.045, 0.55, 0.36, 0.38); boite(K.carton, 0.3, 0.045, 0.62, 0.34, 0.38);
    // tablette 2 (0,64-1,12) : deux appareils 19 pouces gris longs, les boîtes jaunes, une turquoise, des petits blancs
    boite(K.grisAppareil, -0.18, 0.645, 0.95, 0.09, 0.4); boite(K.grisAppareil, -0.2, 0.735, 0.95, 0.09, 0.4);
    for (let k = 0; k < 4; k++) boite(K.jaune, -0.55 + k * 0.24, 0.825, 0.22, 0.1, 0.3);
    boite(K.turquoise, 0.45, 0.825, 0.22, 0.1, 0.3); boite(K.plastique, 0.5, 0.645, 0.25, 0.12, 0.25);
    // tablette du haut (1,14-1,64) : des équipements 1U argent et gris empilés, la colonne de boîtes framboise, des
    // turquoise, des boîtiers noirs
    for (let k = 0; k < 6; k++) boite(k % 2 ? K.argent : K.grisAppareil, -0.42, 1.145 + k * 0.046, 0.44, 0.044, 0.32);
    for (let k = 0; k < 5; k++) boite(K.framboise, -0.05, 1.145 + k * 0.08, 0.2, 0.075, 0.28);
    for (let k = 0; k < 2; k++) boite(K.turquoise, 0.22, 1.145 + k * 0.12, 0.26, 0.11, 0.28);
    for (let k = 0; k < 4; k++) boite(K.noir, 0.5, 1.145 + k * 0.1, 0.22, 0.09, 0.26);
    // dessus : les cartons et leurs étiquettes blanches, les boîtes blanches, le mug noir
    for (const [b, w, hh, k] of [[-0.45, 0.42, 0.3, 0], [-0.02, 0.36, 0.22, 1], [0.38, 0.5, 0.36, 2]]) {
      boite(K.carton, b, ht, w, hh, 0.4);
      maille(boiteM(w * 0.4, hh * 0.3, 0.004), K.etiquette, b, ht + hh * (0.55 + 0.1 * k), pf - 0.019, 0, g, { ombre: false });
    }
    boite(K.plastique, -0.02, ht + 0.22, 0.3, 0.14, 0.3); boite(K.carton, 0.35, ht + 0.36, 0.34, 0.2, 0.32);
    maille(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 14), K.noir, -0.5, ht + 0.35, pf - 0.2, 0, g);
    C.ajouterBoite(X(0), -Y(LONG - 0.75 - lg / 2), X(pf), -Y(LONG - 0.75 + lg / 2), { y0: N1, y1: N1 + 2.2 });
    // l'affiche A1 turquoise (v 7,9-8,7, de 1,15 à 2,0 m), la prise double dessous
    panneau(new THREE.MeshStandardMaterial({ map: texAfficheTurquoise(), roughness: 0.7 }), 0.6, 0.85, X(0) + 0.002, Y(8.3 + DL), N1 + 1.575, 'E');
    archi(X(0), Y(8.3 + DL) - 0.07, X(0) + 0.03, Y(8.3 + DL) + 0.07, N1 + 1.06, N1 + 1.14, K.plastique);
    // au mur ouest, à hauteur d'œil (VO q_0265 : sur l'horizon de l'appareil, tenu vers 1,5 m — et non vers 1,9 m) : le
    // petit boîtier blanc (sonde) en v 3,9 ; la rangée de quatre étiquettes au-dessus des prises (v 5,0-5,3)
    archi(X(0), Y(3.9) - 0.05, X(0) + 0.025, Y(3.9) + 0.05, N1 + 1.45, N1 + 1.57, K.plastique);
    for (let k = 0; k < 4; k++) archi(X(0), Y(4.98) + k * 0.09, X(0) + 0.002, Y(4.98) + k * 0.09 + 0.05, N1 + 1.58, N1 + 1.61, K.etiquette);
  }
  // ---- le côté de la porte : la desserte bleue, le radiateur, la pile noire en hauteur dans l'angle sud-ouest (VO q_0258,
  // q_0262-0265, pile_ecrans) ----
  {
    // le radiateur du mur sud (u 1,0-1,55, de 0,30 à 1,30 m — VO q_0265), derrière la desserte
    B(X(1.0), y0 + 0.012, X(1.55), y0 + 0.09, N1 + 0.3, N1 + 1.3, M.radiateur, { collision: true });
    for (let k = 0; k < 10; k++) archi(X(1.02 + k * 0.054), y0 + 0.09, X(1.04 + k * 0.054), y0 + 0.092, N1 + 0.32, N1 + 1.28, M.grille);
    // la desserte : cadre de tube bleu, deux plateaux gris clair, quatre roulettes, un boîtier noir plat dessus
    const g = poser(X(1.2), Y(0.4), ROT.N);
    const w = 0.85, d = 0.5, hh = 0.85;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      tige(g, K.desserte, [sx * (w / 2 - 0.02), 0.08, sz * (d / 2 - 0.02)], [sx * (w / 2 - 0.02), hh, sz * (d / 2 - 0.02)], 0.013);
      maille(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 12), K.noir, sx * (w / 2 - 0.02), 0.04, sz * (d / 2 - 0.02), 0, g).rotation.x = Math.PI / 2;
    }
    for (const h of [0.2, hh]) {
      maille(boiteM(w, 0.02, d), K.tablette, 0, h, 0, 0, g);
      for (const s of [-1, 1]) { tige(g, K.desserte, [-w / 2, h - 0.02, s * (d / 2 - 0.02)], [w / 2, h - 0.02, s * (d / 2 - 0.02)], 0.012); tige(g, K.desserte, [s * (w / 2 - 0.02), h - 0.02, -d / 2], [s * (w / 2 - 0.02), h - 0.02, d / 2], 0.012); }
    }
    maille(boiteM(0.44, 0.045, 0.3), K.noir, 0, hh + 0.033, 0, 0, g);
    C.ajouterBoite(X(1.2) - w / 2, -(Y(0.4) - d / 2), X(1.2) + w / 2, -(Y(0.4) + d / 2), { y0: N1, y1: N1 + hh + 0.06 });
    // LA PILE NOIRE fixée en hauteur, au-dessus du bout de la rangée ouest : deux coffrets côte à côte, le petit écran
    // 4:3 gris argent posé sur le premier, un boîtier au-dessus du second, jusqu'à 2,60 m
    // (contre le mur ouest, le grand coffret et le boîtier au-dessus ; à côté, le coffret bas, l'écran posé dessus et un
    // petit boîtier noir — pile_ecrans : vue de l'allée ouest, l'écran est à gauche du grand coffret)
    const ys = y0 + 0.012, k = (xa, xb, ya, yb, h0, h1, mat) => archi(xa, ys + ya, xb, ys + yb, N1 + h0, N1 + h1, mat).castShadow = true;
    // (hauteurs relevées sur VO q_0265 : le bas juste au-dessus des tours de la rangée, le haut vers 2,40 m)
    k(X(0), X(0.38), 0, 0.4, 1.25, 2.05, K.tour);
    k(X(0.02), X(0.36), 0.02, 0.38, 2.1, 2.4, K.tour);
    k(X(0.38), X(0.86), 0, 0.4, 1.22, 1.65, K.tour);
    k(X(0.43), X(0.79), 0.08, 0.13, 1.68, 1.98, K.argent);
    k(X(0.58), X(0.64), 0.05, 0.16, 1.65, 1.68, K.argent);
    k(X(0.79), X(0.86), 0.04, 0.34, 1.65, 1.8, K.noir);
    panneau(K.eteint, 0.31, 0.24, X(0.61), ys + 0.131, N1 + 1.83, 'N');
    // (les équerres qui la tiennent au mur)
    for (const u of [0.1, 0.5, 0.8]) k(X(u) - 0.015, X(u) + 0.015, 0, 0.36, 1.17, 1.22, K.noir);
  }

  // =====================================================================
  //  LA LUMIÈRE CUITE ET L'OMBRE DOUCE DE LA MOQUETTE
  // =====================================================================
  // Le calcul de js/ecole_lumieres.js (cuireLumiereSol) sur les murs de l'étage ramenés au sol et les lampes du plancher
  // de l'étage qui peuvent l'atteindre (les siennes, et par la porte celles de l'espace pause) ; l'ombre douce, celle du
  // sous-sol (js/ecole_soussol.js) refaite pour ce plancher et ce rectangle.
  const W = RK.x1 - RK.x0, Lg = RK.y1 - RK.y0, t1 = performance.now();
  const proxy = { formes: C.formes.filter((f) => f.y0 > N1 - 0.35 && f.y0 < N1 + 0.3).map((f) => ({ ...f, y0: f.y0 - N1, y1: f.y1 - N1 })) };
  // (des lampes de l'étage, seules celles qui éclairent par la porte : à moins de 4 m de son seuil, côté espace pause)
  const pres = (L) => L.type !== 'jour' && Math.hypot(L.x - xPorte, -L.z - y0) < 4 && -L.z < y0;
  const aCuire = [...new Set([...mesLampes, ...(lampes || []).filter((L) => L.base === N1 && pres(L))])].map((L) => ({ ...L, h: L.h - N1, cuire: true }));
  const lm = cuireLumiereSol(proxy, aCuire, { x0: RK.x0, z0: -RK.y1, W, L: Lg }, { tpm: 16 });
  K.moquette.lightMap = lm; K.moquette.lightMapIntensity = 1.4;
  groupe.traverse((o) => { o.userData.horsAOSol = true; });
  if (renderer) {
    try { cuireOcclusionNiveau(renderer, groupe, [K.moquette], N1, RK, 'solEtage'); } catch (e) { console.warn('[Robert Kahn] ombre du sol non cuite :', e); }
  }
  const t2 = performance.now();
  ch.sieges.push(...sieges);

  // =====================================================================
  //  LA ZONE (pièce) de la salle, pour js/ecole_lumieres.js
  // =====================================================================
  // (pieds à 2,60 m au moins : le joueur du rez-de-chaussée, dessous, n'y est pas ; l'encoche reste au palier est)
  const zr = (xa, ya, xb, yb) => [xa, -yb, xb, -ya, 2.6];
  _zones = [{ id: 'e1kahn', rects: rects.map(([xa, ya, xb, yb]) => zr(xa, ya, xb, yb)), voisines: ['e1pause'], env: { x: X(4.64), y: N1 + 1.6, z: -Y(5.6) } }];   // (la carte : au milieu de l'allée est)
  console.info('[Robert Kahn] Si 1.4 : %d sièges, %d lampes, posée en %d ms (dont la moquette cuite : %d ms)', sieges.length, mesLampes.length, Math.round(performance.now() - t0), Math.round(t2 - t1));
  return { zones: _zones };
}
