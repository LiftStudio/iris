// =====================================================================
//  LE CENTRE DU REZ-DE-CHAUSSÉE : LA PILE DU HALL, LE BUREAU DE DIRECTION, LE TOTEM (crochet de js/carte_ecole.js)
// =====================================================================
// D'après la VISITE OFFICIELLE de 2021 (references/ecole/visite_officielle/visite.mp4 : q_0026-0050, q_0371-0380, et à
// 25 i/s de 6,4 à 12,4 s) et les photos de Haythem (01, 03, 21, 22) ; relevés : hall.md § 4.5 et § 4.8, plan_global.md
// § 2.6 et § 4.1 (10/10).
//
// LA PILE (VO q_0026-0036, photo 22) : le « pilier à la plaque iris » n'est pas le pilier gris de la salle d'attente —
// c'est une pile pleine, du sol à la dalle, en face de la porte 6 et à gauche de la porte nord du hall :
//   x 13,30-14,675 (sa face est dans le plan du mur jaune du couloir est) × y 4,7-7,575 (le mur nord du hall)
//   face SUD, blanche, plinthe de bois : l'horloge à diodes ambre (« 16 39 / LUN / 26 AVR » le jour du tournage ; ici
//        l'heure de l'ordinateur), la plaque « iris » et l'annuaire du niveau 0, centrés (VO q_0028, 6,7 s)
//   face EST, jaune (#e9a03a, le jaune du couloir est) : le grand annuaire à lames bleu ardoise (VO q_0371-0373, 92,6 s) ;
//        le vantail ouvert de la porte nord s'y rabat
//   face OUEST, blanche : le radiateur, les affichettes et le haut-parleur de la photo 03 (posés par js/carte_ecole.js et
//        js/ecole_mobilier.js) — la photo 03 est prise du cou, contre cette face : au-delà de son angle sud-ouest, le
//        hall, le comptoir et toute la porte 6
// LE PASSAGE au sud-ouest de la pile (VO 7,0-9,0 s : de la porte 6, la vue passe à gauche de la pile en x 13,3 entre
// y 3,6 et 4,7, et la caméra contourne l'angle sud-ouest ; photo 03) : le bureau de direction (le « bureau B ») perd
// son angle nord-est — js/carte_ecole.js : mur est arrêté à y 2,5, retours en y 2,5 et en x 12,1 ; 2,1 m de passage
// côté hall (y 2,575-4,7), 1,13 m entre l'angle de la pile et celui du bureau.
// LE BUREAU DE DIRECTION B 0.3 (VO q_0043-0045, 10,0 s) : la plaque noire à deux lignes et son porte-nom blanc près de la
// porte, le drapeau noir à trois lignes au-dessus.
// LE TOTEM « 1ère école pour le BTS SIO en France » (VO 6,7-11,6 s : texte à empattements, doré et blanc) : en 2021
// dans la salle d'attente ; en 2026 la borne l'a remplacé (photo 21), et ni la photo 01 (le cou vu du C01, jusqu'à la
// porte vitrée du bureau) ni la 03 ni la 21 ne le montrent : posé contre le mur ouest du cou (IMAGINÉ).
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, detailPhoto } from './kit_decor.js';
import { texPeinture } from './ecole_matieres.js';

const H_DALLE = 3.25;                       // le dessous de la dalle du 1er (la pile y monte)
// la pile, en plan (le nu de ses faces)
export const PILE = { x0: 13.30, x1: 14.675, y0: 4.7, y1: 7.575 };
// le bureau de direction : le nu nord de son mur (y 4,8, épaisseur 0,12), la plaque, le drapeau
const Y_BUREAU = 4.86;
const X_PLAQUE = 10.89;

// =====================================================================
//  LES TEXTURES
// =====================================================================
// LE LOGO « ıris » (plaque, totem ; VO q_0028 et le logo officiel de l'écran de chargement) : des i SANS POINT, le premier
// une barre JAUNE de la hauteur des minuscules, « rıs » en blanc ; `carre` : le carré jaune qui chevauche le coin haut
// gauche du pavé noir (x, y, côté du pavé). `largeur` (relecture du 10/10) : la largeur voulue du mot — la taille est
// recalculée sur la police réellement chargée (la plaque de la VO q_0028-0034 : le mot remplit 80 % du pavé)
function logoIris(g, cx, y, taille, largeur = 0) {
  const police = (t) => `700 ${t}px "Century Gothic", "Avenir Next", "Futura", "Segoe UI", sans-serif`;
  const large = (t) => { g.font = police(t); return 2 * t * 0.15 + 3 * t * 0.07 + g.measureText('r').width + g.measureText('s').width; };
  if (largeur > 0) taille *= largeur / large(taille);
  g.font = police(taille);
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const m = g.measureText('x'), hx = m.actualBoundingBoxAscent || taille * 0.53;
  // (les deux i dessinés en barres : toutes les polices n'ont pas le « ı » sans point)
  const e = taille * 0.15, esp = taille * 0.07, wr = g.measureText('r').width, ws = g.measureText('s').width;
  const x0 = cx - (2 * e + 3 * esp + wr + ws) / 2;
  g.fillStyle = '#f1b40c'; g.fillRect(x0, y - hx, e, hx);
  g.fillStyle = '#ffffff'; let x = x0 + e + esp;
  g.fillText('r', x, y); x += wr + esp * 0.6;
  g.fillRect(x, y - hx, e, hx); x += e + esp * 1.2;
  g.fillText('s', x, y);
  return { x0, hx };
}
function carreJaune(g, x, y, h) {
  g.fillStyle = '#f1b40c'; g.fillRect(x - 0.16 * h, y - 0.16 * h, 0.38 * h, 0.38 * h);
}
// un QR code figuré (blanc, modules noirs, les trois repères)
function qr(g, x, y, c) {
  g.fillStyle = '#f4f4f4'; g.fillRect(x, y, c, c);
  const m = c / 25; g.fillStyle = '#111';
  for (let i = 1; i < 24; i++) for (let j = 1; j < 24; j++) if (((i * 11 + j * 5 + i * j * 3) % 5) < 2) g.fillRect(x + i * m, y + j * m, m, m);
  for (const [a, b] of [[1, 1], [17, 1], [1, 17]]) {
    g.fillStyle = '#111'; g.fillRect(x + a * m, y + b * m, 7 * m, 7 * m);
    g.fillStyle = '#f4f4f4'; g.fillRect(x + (a + 1) * m, y + (b + 1) * m, 5 * m, 5 * m);
    g.fillStyle = '#111'; g.fillRect(x + (a + 2) * m, y + (b + 2) * m, 3 * m, 3 * m);
  }
}
// une flèche blanche au trait : `sens` -1 vers la gauche, +1 vers la droite
function fleche(g, x, y, sens, r, ep = 4) {
  g.strokeStyle = '#f2f2f2'; g.lineWidth = ep; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - sens * r, y); g.lineTo(x + sens * r, y);
  g.moveTo(x + sens * (r - r * 0.62), y - r * 0.62); g.lineTo(x + sens * r, y); g.lineTo(x + sens * (r - r * 0.62), y + r * 0.62); g.stroke();
}

// LA PLAQUE « iris » (0,58 x 0,62 m ; VO q_0028-0034, hall_work/c_78_plaque et g_74_plaque) : fond blanc ; le carré
// jaune qui chevauche le coin haut gauche du pavé noir (le pavé : 75 % de la largeur, un peu décalé à gauche, 39 % de la
// hauteur) ; « ıris » qui REMPLIT le pavé (80 % de sa largeur, lettres à 57 % de sa hauteur) ; dessous, trois lignes de
// capitales grises étroites, alignées sur le i jaune, à 61, 72 et 83 % de la hauteur (relecture du 10/10 : le mot et les
// lignes étaient d'un tiers trop petits)
function texPlaqueIris() {
  return canvasTex(384, 410, (g, w, h) => {
    g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, w, h);
    const px = 38, py = 56, pw = 290, ph = 160;
    g.fillStyle = '#161616'; g.fillRect(px, py, pw, ph);
    carreJaune(g, px, py, ph * 0.86);
    const { x0 } = logoIris(g, px + pw / 2, py + ph * 0.785, 150, pw * 0.8);
    g.fillStyle = '#4a4a4a'; g.font = '600 27px "Segoe UI Semibold", "Segoe UI", Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    // (le même serrage pour les trois lignes : la plus longue tient en 60 % de la largeur)
    const L = ['INSTITUT SUPÉRIEUR', 'DE RESSOURCES', 'INFORMATIQUES'], k = Math.min(1, w * 0.6 / g.measureText(L[0]).width);
    L.forEach((t, i) => g.fillText(t, x0, 260 + i * 45, g.measureText(t).width * k));
  }, null, false, 8);
}
// L'ANNUAIRE DU NIVEAU 0 (0,60 x 0,44 m, de la largeur de la plaque : VO 7,8 s, hall_work/c_78_plaque ; texte :
// synth/annuaire_num.jpg) : noir, la large bande dorée du niveau (un dixième de la largeur) et son « 0 », sept lignes
// blanches en caractères étroits séparées de filets gris, les numéros calés à droite avant la flèche. Les codes sont
// « Si » (salles informatiques), pas « B » (plan_global.md § 2.1).
function texAnnuaire() {
  return canvasTex(512, 376, (g, w, h) => {
    g.fillStyle = '#1e1e22'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c8a76c'; g.fillRect(0, 0, 48, h);
    g.fillStyle = '#f6f2e8'; g.font = '600 36px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('0', 24, 30);
    const L = [['Accueil - Réception', '', -1], ['Salle Tim Berners-Lee', 'Si 0.1', -1], ['Salle David Clark', 'Si 0.2', -1], ['Pause extérieure', '', -1],
      ['Vers niveaux 1/2/3/4/5', '', 1], ['Vers niveaux -1/-2', '', 1], ['Direction', '', -1]];
    const lh = h / L.length;
    L.forEach(([t, num, sens], i) => {
      const yc = (i + 0.5) * lh;
      if (i) { g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(58, i * lh - 1, w - 70, 1.5); }
      g.fillStyle = '#f2f2f2'; g.textAlign = 'left'; g.font = '600 29px "Segoe UI Semibold", "Segoe UI", Arial, sans-serif';
      g.fillText(t, 60, yc + 1, num ? 316 : 400);
      if (num) { g.textAlign = 'right'; g.font = '600 26px "Segoe UI", Arial, sans-serif'; g.fillText(num, w - 60, yc + 1, 72); }
      fleche(g, w - 27, yc, sens, 13);
    });
    g.textAlign = 'left';
  }, null, false, 8);
}
// L'HORLOGE À DIODES AMBRE (0,37 x 0,33 m ; VO q_0028 : « 16 39 / LUN / 26 AVR ») : trois lignes ambre #ff8a1e sur
// fond noir, les segments éteints à peine visibles, un petit tiret allumé à gauche des deux premières. Elle suit
// l'horloge de l'ordinateur (redessinée toutes les 10 s).
function matHorloge() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 228;
  const g = c.getContext('2d'), t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
  const AMBRE = '#ff8a1e';
  const ligne = (texte, fantome, y, taille) => {
    g.font = `700 ${taille}px "Consolas", "Lucida Console", "Courier New", monospace`;
    g.shadowBlur = 0; g.fillStyle = 'rgba(255,138,30,0.08)'; g.fillText(fantome, 138, y);
    g.shadowColor = AMBRE; g.shadowBlur = 9; g.fillStyle = AMBRE; g.fillText(texte, 138, y);
  };
  const dessiner = () => {
    const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
    g.shadowBlur = 0; g.fillStyle = '#0c0908'; g.fillRect(0, 0, 256, 228);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    ligne(`${p2(d.getHours())} ${p2(d.getMinutes())}`, '88 88', 80, 68);
    ligne(JOURS[d.getDay()], '888', 148, 54);
    ligne(`${p2(d.getDate())} ${MOIS[d.getMonth()]}`, '88 8888', 210, 44);
    g.shadowColor = AMBRE; g.shadowBlur = 6; g.fillStyle = AMBRE; g.fillRect(12, 54, 13, 5); g.fillRect(12, 124, 13, 5);
    g.shadowBlur = 0;
    t.needsUpdate = true;
  };
  dessiner(); setInterval(dessiner, 10000);
  return new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.5, 1.5, 1.5) });
}
// LE GRAND ANNUAIRE À LAMES de la face jaune (≈ 0,5 x 2,0 m, seize lames ; VO q_0371-0373, hall_work/c_926_annuaire) :
// le modèle de la plaque du couloir est, en bleu ardoise ; toujours vu de biais, son texte ne se lit pas — figuré ici
// avec les noms des étages (plan_global.md § 0)
function texLames() {
  return canvasTex(256, 1024, (g, w, h) => {
    g.fillStyle = '#13202f'; g.fillRect(0, 0, w, h);
    const noms = [['Accueil - Réception', -1], ['Direction', -1], ['Salle Tim Berners-Lee', -1], ['Salle David Clark', -1],
      ['Pause extérieure', -1], ['Salle de cours S 1.3', 1], ['Salle Robert Kahn', 1], ['Salle G. E. Moore', 1], ['Espace pause', 1],
      ['Salle de cours S 1.6', 1], ['Bureau des Conseillers', 1], ['Salle Bjarne Stroustrup', 1], ['Salles S 2.7 - S 2.8', 1],
      ['Salle de cours S -1.14', 1], ['Espace pause -1', 1], ['Ascenseur', 1]];
    // (relecture du 10/10 : le bleu ardoise des lames de la plaque du couloir, js/ecole_est.js texDirection — dans la VO,
    // b_0108 contre b_0125, les deux panneaux ont la même teinte, (98 ; 101 ; 131) et (73 ; 72 ; 103) dans l'ombre)
    const lh = h / noms.length;
    noms.forEach(([t, sens], i) => {
      const y = i * lh + 2, gr = g.createLinearGradient(0, y, 0, y + lh - 4);
      gr.addColorStop(0, '#36567c'); gr.addColorStop(0.5, '#294566'); gr.addColorStop(1, '#203852');
      g.fillStyle = gr; g.fillRect(0, y, w, lh - 4);
      g.fillStyle = '#eef1f4'; g.font = '600 18px "Segoe UI", Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText(t, 12, y + lh / 2 - 1, w - 56);
      fleche(g, w - 24, y + lh / 2 - 1, sens, 10, 3);
    });
  }, null, false, 8);
}
// LA PLAQUE DE PORTE du bureau de direction (VO q_0044, hall_work/c_103_plaque) : noire, deux lignes blanches ; le
// porte-nom blanc dessous ; LE DRAPEAU noir, trois lignes (hall_work/c_103_drapeau)
function texPlaqueBureau() {
  return canvasTex(256, 98, (g, w, h) => {
    g.fillStyle = '#232221'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f0'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '600 27px "Segoe UI", Arial, sans-serif'; g.fillText('Bureau de direction', w / 2, 42, w - 24);
    g.font = '600 29px "Segoe UI", Arial, sans-serif'; g.fillText('B 0.3', w / 2, 80);
  }, null, false, 4);
}
function texPorteNom() {
  return canvasTex(128, 40, (g, w, h) => {
    g.fillStyle = '#dedcd6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c4c2bc'; g.fillRect(8, 6, w - 16, h - 12);
    g.fillStyle = 'rgba(70,70,70,0.45)'; g.fillRect(24, h / 2 - 1, w - 48, 2);
  }, null, false, 2);
}
function texDrapeau() {
  return canvasTex(256, 148, (g, w, h) => {
    g.fillStyle = '#1f1e1d'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f0'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '600 30px "Segoe UI", Arial, sans-serif'; g.fillText('Bureau', w / 2, 42); g.fillText('de direction', w / 2, 84);
    g.font = '700 31px "Segoe UI", Arial, sans-serif'; g.fillText('B 0.3', w / 2, 128);
  }, null, false, 4);
}
// LE TOTEM « 1ère école pour le BTS SIO en France » (VO a_0244-0291, photo 22) : roll-up noir ; l'équerre jaune et le
// logo ; le texte en capitales À EMPATTEMENTS — « 1ÈRE ÉCOLE / POUR LE BTS SIO / EN FRANCE » en doré (« BTS SIO » en gras),
// « ÉCOLE / DE L'INFORMATIQUE / ET DU NUMÉRIQUE » en blanc, « BAC À BAC+5 » en doré ; le site et le QR code au pied.
// (relecture du 10/10, VO a_0244, a_0260 et a_0262 : tout le texte tient dans la moitié HAUTE — doré du quart au tiers
// de la hauteur, blanc de 40 à 48 %, « BAC À BAC+5 » vers 54 %, en grandes lettres serrées qui prennent presque toute la
// largeur ; les lignes dorées et les deux dernières blanches sont calées À DROITE, « ÉCOLE » et « BAC À BAC+5 » à
// gauche ; « INFORMATIQUE » et « NUMÉRIQUE » en gras)
function texTotem() {
  return canvasTex(320, 800, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#1c1c1c'); d.addColorStop(1, '#0e0e0e');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    // (le logo en haut À GAUCHE, VO a_0260)
    carreJaune(g, 34, 34, 54);
    logoIris(g, 96, 80, 64);
    const serif = (poids, t) => `${poids} ${t}px "Didot", "Bodoni MT", "Times New Roman", Georgia, serif`;
    const OR = '#d9a43a', XD = w - 26;
    // une ligne calée à droite, faite de morceaux [texte, poids, taille, montée]
    // (resserrée en largeur si la police de repli est plus large que le Didot)
    const droite = (morceaux, y) => {
      let L = 0; for (const [t, p, s] of morceaux) { g.font = serif(p, s); L += g.measureText(t).width; }
      const k = Math.min(1, (XD - 10) / L);
      g.save(); g.translate(XD - L * k, 0); g.scale(k, 1);
      let x = 0; for (const [t, p, s, m = 0] of morceaux) { g.font = serif(p, s); g.fillText(t, x, y - m); x += g.measureText(t).width; }
      g.restore();
    };
    g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = OR;
    droite([['1', 400, 36], ['ÈRE', 400, 17, 14], [' ÉCOLE', 400, 36]], 200);
    droite([['POUR LE ', 400, 32], ['BTS SIO', 700, 32]], 233);
    droite([['EN FRANCE', 400, 32]], 266);
    g.fillStyle = '#f4f2ec';
    g.font = serif(400, 29); g.fillText('ÉCOLE', 14, 318);
    droite([["DE L'", 400, 29], ['INFORMATIQUE', 700, 29]], 351);
    droite([['ET DU ', 400, 29], ['NUMÉRIQUE', 700, 29]], 384);
    g.fillStyle = OR; g.font = serif(400, 25); g.fillText('BAC À BAC+5', 22, 430);
    g.fillStyle = '#cfcfcf'; g.font = '600 16px "Segoe UI", Arial, sans-serif'; g.fillText('www.ecoleiris.fr', 22, h - 40);
    qr(g, w - 88, h - 92, 66);
  }, null, false, 8);
}

// =====================================================================
//  LES OUTILS
// =====================================================================
// UNE PLAQUE MURALE en boîte mince (l'image entière sur sa face avant), contre la face `face` d'un mur
function plaqueMurale(ch, mat, x, y, face, w, h0, h1, ep = 0.01) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h1 - h0, ep), mat);
  const d = { E: [ep / 2, 0], W: [-ep / 2, 0], S: [0, -ep / 2], N: [0, ep / 2] }[face];
  m.position.set(x + d[0], (h0 + h1) / 2, -(y + d[1]));
  m.rotation.y = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[face];
  m.receiveShadow = true;
  ch.decor.add(m);
  return m;
}

// =====================================================================
//  LE CROCHET
// =====================================================================
export function poserRdcCentre(ch) {
  const { M, C } = ch, P = PILE, xm = (P.x0 + P.x1) / 2;
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); m.name = nom; return m; };
  // (le jaune du couloir est, recréé ici : js/ecole_est.js garde le sien)
  const jaune = std({ map: texPeinture(0xe9a03a, 4), roughness: 0.62 }, 'peinture jaune (face est de la pile)');
  detailPhoto(jaune, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  const gris = std({ color: 0x5a534b, roughness: 0.5 }, 'plinthe gris foncé (pile)');

  // =====================================================================
  //  LA PILE (x 13,30-14,675 × y 4,7-7,575)
  // =====================================================================
  // le bloc blanc, plein jusqu'à la dalle (le plafond du hall et celui du cou passent dedans), solide ; la peau jaune de
  // la face est, du nu sud jusqu'au mur nord du hall (au-delà, le mur jaune du couloir est, js/ecole_est.js)
  ch.boite(P.x0, P.y0, P.x1 - 0.004, P.y1, 0, H_DALLE, M.blanc, { collision: true });
  ch.boite(P.x1 - 0.004, P.y0, P.x1, 7.5, 0, H_DALLE, jaune);
  C.ajouterBoite(P.x1 - 0.004, -P.y0, P.x1, -7.5, { y1: H_DALLE });
  // les plinthes : de bois au sud et à l'ouest (comme tout le hall et le cou), gris foncé à l'est (comme le couloir) ;
  // au nord, le ressaut de 20 cm contre le mur du fond de la salle d'attente (x 13,5)
  ch.boite(P.x0 - 0.015, P.y0 - 0.015, P.x1, P.y0, 0, 0.08, M.bois, { ombre: false });
  ch.boite(P.x0 - 0.015, P.y0, P.x0, P.y1 + 0.015, 0, 0.08, M.bois, { ombre: false });
  ch.boite(P.x0, P.y1, 13.5, P.y1 + 0.015, 0, 0.08, M.bois, { ombre: false });
  ch.boite(P.x1, P.y0 - 0.015, P.x1 + 0.015, 7.5, 0, 0.08, gris, { ombre: false });

  // ---- LA FACE SUD : l'horloge, la plaque « iris », l'annuaire, centrés (VO q_0028, hall.md § 4.5) ----
  const S = P.y0;
  ch.boite(xm - 0.185, S - 0.06, xm + 0.185, S, 2.25, 2.58, std({ color: 0x2a2220, roughness: 0.5 }, 'boîtier de l\'horloge'), { ombre: false });
  ch.panneau(matHorloge(), 0.33, 0.29, xm, S - 0.0605, 2.415, 'S');
  plaqueMurale(ch, std({ map: texPlaqueIris(), roughness: 0.4 }, 'plaque iris'), xm, S, 'S', 0.58, 1.54, 2.16, 0.012);
  plaqueMurale(ch, std({ map: texAnnuaire(), roughness: 0.35 }, 'annuaire du niveau 0'), xm, S, 'S', 0.6, 1.08, 1.52, 0.012);

  // ---- LA FACE EST : le grand annuaire à lames (y 5,05-5,55, de 0,35 à 2,35 m ; VO q_0371-0373) ----
  plaqueMurale(ch, std({ map: texLames(), roughness: 0.4, metalness: 0.15 }, 'annuaire à lames'), P.x1, 5.3, 'E', 0.5, 0.35, 2.35, 0.015);
  for (const h of [0.37, 2.33]) ch.boite(P.x1, 5.07, P.x1 + 0.03, 5.53, h - 0.01, h + 0.01, M.aluGris, { ombre: false });

  // ---- LE PASSAGE (x 12,175-13,30 × y 2,575-4,7) : un spot rond, comme ceux du hall (VO q_0029 : spots ronds) ----
  ch.spot(12.75, 3.65, 2.6, 'cou');

  // =====================================================================
  //  LE BUREAU DE DIRECTION B 0.3 : la plaque, son porte-nom, le drapeau (VO q_0043-0045)
  // =====================================================================
  // (sur le mur nord du bureau, entre le jour dépoli et la porte vitrée : js/carte_ecole.js ; relecture du 10/10 : 21 cm
  // de large et non 18 — dans la VO, a_0260, la plaque est presque aussi large que le drapeau de 0,28 ; le porte-nom
  // blanc fait les quatre cinquièmes de la hauteur du noir, hall_work/c_103_plaque)
  plaqueMurale(ch, std({ map: texPlaqueBureau(), roughness: 0.4 }, 'plaque du bureau de direction'), X_PLAQUE, Y_BUREAU, 'N', 0.21, 1.555, 1.635, 0.006);
  plaqueMurale(ch, std({ map: texPorteNom(), roughness: 0.5 }, 'porte-nom'), X_PLAQUE, Y_BUREAU, 'N', 0.21, 1.48, 1.545, 0.006);
  // le drapeau, perpendiculaire au mur, au-dessus de la porte (de 2,28 à 2,46 m), sur sa potence
  const dr = new THREE.Group(); dr.position.set(X_PLAQUE, 2.37, -(Y_BUREAU + 0.19)); ch.decor.add(dr);
  maille(boiteM(0.012, 0.18, 0.3), M.noir, 0, 0, 0, 0, dr, { ombre: false });
  const td = std({ map: texDrapeau(), roughness: 0.45 }, 'drapeau du bureau de direction');
  for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.162), td); p.position.x = s * 0.0065; p.rotation.y = s * Math.PI / 2; dr.add(p); }
  maille(boiteM(0.016, 0.016, 0.05), M.aluGris, 0, 0.1, 0.17, 0, dr, { ombre: false });
  dr.traverse((m) => { m.userData.horsAOSol = true; });

  // =====================================================================
  //  LE TOTEM, contre le mur ouest du cou (x 10,05), tourné vers l'est
  // =====================================================================
  const totem = new THREE.Group(); totem.position.set(10.2, 0, -7.9); totem.rotation.y = Math.PI / 2; ch.decor.add(totem);
  maille(boiteM(0.86, 0.03, 0.26), M.aluGris, 0, 0.015, 0, 0, totem);
  maille(boiteM(0.8, 2.0, 0.04), M.noir, 0, 1.03, 0, 0, totem);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.96), std({ map: texTotem(), roughness: 0.5 }, 'totem BTS SIO'));
  face.position.set(0, 1.03, 0.021); face.receiveShadow = true; totem.add(face);
  C.ajouterBoite(10.06, -7.46, 10.34, -8.34, { y1: 2.05 });
}
