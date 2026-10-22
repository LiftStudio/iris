// =====================================================================
//  LES CONSTANTES DU JEU (socle S0, 22/10 ; FIGÉ — spec § 4.5.1)
// =====================================================================
// Ce que tous les modules du combat et du prop hunt partagent : le pas de simulation, la hauteur de l'œil, les équipes,
// les niveaux de l'école, les bornes de jeu, les limites d'effectifs, les ZONES DE JEU (pièces, départs). Repère MONDE :
// X = x du plan, Z = −y du plan, Y vers le haut ; sols : −1 à −3,06, RDC 0, 1er 3,50, 2e 6,60. Un lot n'y touche pas : une
// valeur à changer passe par F2 ou l'intégration (rapport du lot).

export const PAS = 1 / 120;
// la hauteur de l'œil au-dessus des pieds, pour une taille de 1,73 m (× h / taille) : debout 1,62 (la vue 1 de la balade
// met l'œil à 1,609 m : la taille de l'école ressentie ne change pas), accroupi 1,08, en glissade 0,85
export const OEIL = { debout: 1.62, accroupi: 1.08, glisse: 0.85, taille: 1.73 };
export const TANGAGE_MAX = 1.48;                   // ± 85° (tangage > 0 = regard vers le BAS, convention de js/game.js)
export const EQUIPES = {
  A: { id: 'A', nom: 'SISR', couleur: '#3d8bff' },
  B: { id: 'B', nom: 'SLAM', couleur: '#ff8a1f' },
  props: { id: 'props', nom: 'PROPS', couleur: '#7ed957' },
  chasseurs: { id: 'chasseurs', nom: 'CHASSEURS', couleur: '#ff5a4f' },
};
// les quatre niveaux : leur sol et leur bande de hauteur (celles de js/ecole_visibilite.js l. 52 : la dalle du 1er,
// 3,25-3,50, est aux deux niveaux)
export const NIVEAUX = [
  { n: -1, sol: -3.06, bas: -3.5, haut: -0.22 },
  { n: 0, sol: 0, bas: -0.22, haut: 3.3 },
  { n: 1, sol: 3.5, bas: 3.3, haut: 6.45 },
  { n: 2, sol: 6.6, bas: 6.45, haut: 9.7 },
];
// le niveau d'une hauteur : −1 | 0 | 1 | 2 (au-delà des bandes, le plus proche)
export function niveauDe(y) {
  if (y < NIVEAUX[0].haut) return -1;
  if (y < NIVEAUX[1].haut) return 0;
  if (y < NIVEAUX[2].haut) return 1;
  return 2;
}
// LA RUE BORNÉE en partie (le filet de Player.move, js/player.js) : la façade et la chaussée devant elle
export const BORNES_JEU = { xMin: -3, xMax: 23, zMin: -24.5, zMax: 6 };
export const LIMITES = { pc: { bots: 9, conseil: 7, avatars: 6 }, tel: { bots: 5, conseil: 3, avatars: 3 } };

// LES 47 PIÈCES de l'école (les zones de js/carte_ecole.js l. 2345-2385, lues par game.carte.lumieres.zoneEn)
export const PIECES = ['escEst2', 'e1est', 'escEst3', 'e2palier', 'e2sas', 'e2couloir', 'e2s1', 'e2s2', 'e1kahn', 'e1pause',
  'e1salle', 'e1bureau', 'e1couloir', 'e103', 'e104', 'descenteEst', 'escEstSS', 'palierSSE', 'sasSS', 'passageSS', 'palierSS',
  'escalierSS', 'hallSS', 'couloirSS', 'pauseSS', 'salleSS', 'palier1', 'escalier', 'passage', 'c05', 'hallO', 'c01', 'attente',
  'hall', 'porche', 'rue', 'si01', 'bureauB', 'service', 'local', 'wcF', 'wcH', 'pmr', 'dc', 'vestEst', 'escEst', 'couloirEst'];

// LES ZONES DE JEU (spec §§ 3.8 et 3.9) : `pieces` = id des pièces permises ('*' : toutes) ; `rue` : la rue bornée en fait
// partie ; `departs` : points INDICATIFS par camp (ramenés au nœud le plus proche par js/jeu/apparitions.js) ;
// `frontieres` : les passages fermés par une barrière (js/jeu/monde_partie.js, lot L-M).
export const ZONES_JEU = {
  ecole: { nom: 'Toute l’école', modes: ['combat'], pieces: '*', rue: true,
    departs: { A: [[15.0, 0, 3.5]], B: [[14.63, 6.6, -5.87], [4.63, 6.6, -7.87]] } },
  rdc_rue: { nom: 'RDC + rue', modes: ['combat'], rue: true,
    pieces: ['passage', 'c05', 'hallO', 'c01', 'attente', 'hall', 'porche', 'rue', 'si01', 'bureauB', 'dc', 'vestEst', 'couloirEst'],
    frontieres: ['hallO|palierSS', 'couloirEst|descenteEst', 'escalier|hallO', 'escEst|vestEst'],
    departs: { A: [[3.5, 0, 3.0]], B: [[5.38, 0, -15.12]] } },
  ss: { nom: 'Le −1', modes: ['combat', 'prop'],
    pieces: ['pauseSS', 'salleSS', 'hallSS', 'couloirSS', 'passageSS', 'sasSS', 'palierSSE', 'escalierSS', 'escEstSS'],
    frontieres: ['hallO|palierSS', 'couloirEst|descenteEst'],
    departs: { A: [[15.63, -3.06, -9.62]], B: [[1.38, -3.06, -10.87]], chasseurs: [[1.38, -3.06, -10.87]] } },
  etages: { nom: 'Les étages', modes: ['combat'],
    pieces: ['e1est', 'e1kahn', 'e1pause', 'e1salle', 'e1bureau', 'e1couloir', 'e103', 'e104', 'palier1', 'escalier',
      'e2palier', 'e2sas', 'e2couloir', 'e2s1', 'e2s2', 'escEst', 'escEst2', 'escEst3'],
    frontieres: ['escalier|hallO', 'escEst|vestEst'],
    departs: { A: [[2.88, 3.5, -3.37]], B: [[4.63, 6.6, -7.87]] } },
  e2: { nom: 'Le 2e', modes: ['prop'], pieces: ['e2couloir', 'e2s1', 'e2s2', 'e2palier', 'e2sas'],
    departs: { chasseurs: [[15.63, 6.6, -9.87]] } },
  e1: { nom: 'Le 1er', modes: ['prop'], pieces: ['e1pause', 'e1salle', 'e1kahn', 'e1couloir', 'e1bureau', 'e103', 'e104', 'e1est', 'palier1'],
    departs: { chasseurs: [[15.88, 3.5, -9.87]] } },
  rdc: { nom: 'Le RDC', modes: ['prop'],
    pieces: ['attente', 'hall', 'hallO', 'passage', 'si01', 'bureauB', 'dc', 'c05', 'c01', 'couloirEst', 'vestEst'],
    departs: { chasseurs: [[14.88, 0, -3.12]] } },
  ecole_int: { nom: 'Toute l’école', modes: ['prop'], pieces: PIECES.filter((p) => p !== 'rue' && p !== 'porche'),
    departs: { chasseurs: [[14.88, 0, -3.12]] } },
};
export const VERSION_ETAT = 1;
