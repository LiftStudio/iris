// =====================================================================
//  LES CORPS DES BOTS — squelette du socle S0 (22/10), rempli par le lot L-C
// =====================================================================
// Les fiches des amis de Haythem (js/roster.js de LA CAGE : taille, vitesse, gabarit, couleurs) et leurs corps : des Player
// (js/player.js) aux drapeaux de partie — `capFixe` (le cap vient de la commande), `sansRangs` (un bot ne se faufile pas
// dans un rang), `audible = false` (les pas viennent de la simulation), `sansSouffle` (pas de mains sur les genoux),
// `elanAir` (l'élan gardé en l'air), `discret` (le chargeur à part : pas de DefaultLoadingManager.onLoad, qui recuirait
// l'ombre du sol). Avatars `assets/tel/<id>.glb` même sur PC (≤ 6 distincts, 3 au téléphone : spec §§ 3.10, 4.5.10), copiés
// de LA CAGE par le socle. Le SQUELETTE charge `assets/haythem.glb` pour tous (déjà en cache : Haythem cloné) ; L-C règle
// et charge les vrais avatars (un par gabarit d'abord, programmes et clips attendus).
import { Player, prechargerModele } from '../player.js';
import { HAYTHEM } from '../game.js';

export const FICHES_BOTS = [
  { id: 'gabriel', nom: 'Gabriel', height: 1.79, modelHeight: 1.865, spd: 87, gabarit: 'A', model: 'assets/tel/gabriel.glb', color1: '#161618', color2: '#c4161c', skin: '#e8b49a' },
  { id: 'imad', nom: 'Imad', height: 1.89, modelHeight: 1.864, spd: 86, gabarit: 'A', model: 'assets/tel/imad.glb', color1: '#2b2b2e', color2: '#c4161c', skin: '#e8b49a' },
  { id: 'marcantoine', nom: 'Marc-Antoine', height: 1.83, modelHeight: 1.861, spd: 80, gabarit: 'A', model: 'assets/tel/marcantoine.glb', color1: '#14284b', color2: '#ffffff', skin: '#e8b49a' },
  { id: 'koji', nom: 'Koji', height: 1.75, modelHeight: 1.888, spd: 95, gabarit: 'B', model: 'assets/tel/koji.glb', color1: '#f2f2ef', color2: '#c4161c', skin: '#4a2c1a' },
  { id: 'djafar', nom: 'Djafar', height: 1.65, modelHeight: 1.886, spd: 91, gabarit: 'B', model: 'assets/tel/djafar.glb', color1: '#ffd166', color2: '#1a1a1a', skin: '#c68642' },
  { id: 'ethan', nom: 'Ethan', height: 1.85, modelHeight: 1.88, spd: 80, gabarit: 'C', model: 'assets/tel/ethan.glb', color1: '#1d3557', color2: '#f1faee', skin: '#f1c27d' },
];
// (Haythem cloné : la fiche des bots quand aucun ami n'est coché — et, au squelette, de tous)
export const FICHE_HAYTHEM = { id: 'haythem', nom: 'Haythem', height: HAYTHEM.height, modelHeight: HAYTHEM.modelHeight, spd: HAYTHEM.spd,
  gabarit: 'H', model: HAYTHEM.model, color1: HAYTHEM.color1, color2: HAYTHEM.color2, skin: HAYTHEM.skin };

// les avatars d'une partie, prêts avant l'entrée (écran PRÉPARATION) — le squelette : le modèle de Haythem, en cache
export async function preparerAvatars(game, ids, progres) {
  if (progres) progres('Les élèves arrivent', 0);
  await prechargerModele(HAYTHEM.model);
  if (progres) progres('Les élèves arrivent', 1);
}
// LE CORPS d'un bot (un Player aux drapeaux de partie), dans la scène ; `o.equipe` : sa teinte (L-C)
export function creerCorps(fiche, scene, o) {
  const f = fiche || FICHE_HAYTHEM;
  const def = { ...HAYTHEM, id: f.id, name: f.nom, discret: true };     // (squelette : le corps de Haythem pour tous)
  const p = new Player(def, scene);
  p.capFixe = true; p.sansRangs = true; p.audible = false; p.sansSouffle = true; p.elanAir = true; p.cibleRegard = null;
  p.equipe = (o && o.equipe) || null;
  return p;
}
export function libererCorps(player) { if (player) player.dispose(); }
