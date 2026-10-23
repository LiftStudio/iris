// =====================================================================
//  LES CORPS DES BOTS (lot L-C, 23/10 ; spec §§ 3.10, 4.5.10, 5.5.5 — squelette du socle S0)
// =====================================================================
// Les fiches des amis de Haythem (js/roster.js de LA CAGE : taille, hauteur du modèle, gabarit, couleurs) et leurs corps :
// des Player (js/player.js) aux drapeaux de partie — `capFixe` (le cap vient de la commande), `sansRangs` (un bot ne se
// faufile pas dans un rang), `audible = false` (les pas viennent de la simulation, événement `pas`), `sansSouffle` (pas
// de mains sur les genoux), `elanAir` (l'élan gardé en l'air), `discret` (un chargeur à son propre LoadingManager : jamais
// DefaultLoadingManager.onLoad, qui recuirait l'ombre du sol, la carte d'environnement et le cache d'ombre,
// js/kit_decor.js:441-452). Avatars `assets/tel/<id>.glb` MÊME SUR PC (textures 512 : 136 Mo pour les six, contre 376 en
// pleine taille, carte des personnages § 4.6) ; Haythem cloné (aucun ami coché) porte SON modèle, déjà chargé : zéro octet.
//
// LA PRÉPARATION (écran PRÉPARATION, Partie.preparer) : un corps SONDE par avatar, jamais montré, qui charge le GLB,
// recible les clips et compile ses programmes (Player.preparerRendu), puis est gardé hors de la scène pour la session
// (ses matériaux tiennent ces programmes en vie ; une partie suivante n'a plus rien à préparer). Un avatar PAR GABARIT D'ABORD (le
// 1er d'un gabarit recible les 24 clips, ≈ 300 ms ; les suivants les copient du cache de js/anim.js, 4 ms : lancés
// ensemble, deux avatars d'un même gabarit les recibleraient deux fois), les autres ensuite. Au plus 6 avatars distincts,
// 3 au téléphone (LIMITES) : un bot dont l'ami n'est pas préparé porte un des avatars préparés. Ensuite, 28 ms par corps
// (géométries, textures, clips partagés ; matériaux clonés). La préparation compile aussi ce que les corps montreront
// plus tard : la teinte et les brassards (js/jeu/teintes.js), les armes à la 3e personne (js/jeu/pose_arme.js) et la
// variante transparente de l'effacement Airsoft (js/jeu/poupee.js) — aucun programme en pleine manche.
import * as THREE from 'three';
import { Player, prechargerModele } from '../player.js';
import { HAYTHEM } from '../game.js';
import { TELEPHONE } from '../appareil.js';
import { LIMITES } from './constantes.js';
import { teinteEquipe, retirerTeinte, preparerTeintes } from './teintes.js';
import { preparerArmes3e, armeSonde, libererArmeSonde } from './pose_arme.js';
import { opaciteCorps } from './poupee.js';

export const FICHES_BOTS = [
  { id: 'gabriel', nom: 'Gabriel', height: 1.79, modelHeight: 1.865, spd: 87, gabarit: 'A', model: 'assets/tel/gabriel.glb', color1: '#161618', color2: '#c4161c', skin: '#e8b49a' },
  { id: 'imad', nom: 'Imad', height: 1.89, modelHeight: 1.864, spd: 86, gabarit: 'A', model: 'assets/tel/imad.glb', color1: '#2b2b2e', color2: '#c4161c', skin: '#e8b49a' },
  { id: 'marcantoine', nom: 'Marc-Antoine', height: 1.83, modelHeight: 1.861, spd: 80, gabarit: 'A', model: 'assets/tel/marcantoine.glb', color1: '#14284b', color2: '#ffffff', skin: '#e8b49a' },
  { id: 'koji', nom: 'Koji', height: 1.75, modelHeight: 1.888, spd: 95, gabarit: 'B', model: 'assets/tel/koji.glb', color1: '#f2f2ef', color2: '#c4161c', skin: '#4a2c1a' },
  { id: 'djafar', nom: 'Djafar', height: 1.65, modelHeight: 1.886, spd: 91, gabarit: 'B', model: 'assets/tel/djafar.glb', color1: '#ffd166', color2: '#1a1a1a', skin: '#c68642' },
  { id: 'ethan', nom: 'Ethan', height: 1.85, modelHeight: 1.88, spd: 80, gabarit: 'C', model: 'assets/tel/ethan.glb', color1: '#1d3557', color2: '#f1faee', skin: '#f1c27d' },
];
// (Haythem cloné : la fiche des bots quand aucun ami n'est coché ; gabarit A, celui de Gabriel, Imad et Marc-Antoine —
// ses clips sont déjà reciblés par son propre corps)
export const FICHE_HAYTHEM = { id: 'haythem', nom: 'Haythem', height: HAYTHEM.height, modelHeight: HAYTHEM.modelHeight, spd: HAYTHEM.spd,
  gabarit: 'A', model: HAYTHEM.model, color1: HAYTHEM.color1, color2: HAYTHEM.color2, skin: HAYTHEM.skin };

// LES AVATARS PRÊTS de la partie (preparerAvatars) : les fiches qu'un corps peut porter, dans l'ordre des amis cochés
const PRETS = { fiches: [FICHE_HAYTHEM], modeles: new Set([FICHE_HAYTHEM.model]), mesures: { ms: 0, sondes: 0 } };
const attendre = (s) => new Promise((r) => setTimeout(r, s * 1000));
// le plafond d'avatars DISTINCTS (≈ 23 Mo de textures chacun en tel/)
export const plafondAvatars = () => (TELEPHONE ? LIMITES.tel.avatars : LIMITES.pc.avatars);
// (lu par les tests : ce que la dernière préparation a fait)
export const avatarsPrets = () => ({ fiches: PRETS.fiches.map((f) => f.id), ...PRETS.mesures });

// LE CALAGE DE LA TÊTE (mesuré sur la sonde, à la préparation) : les balles touchent un bot là où la SIMULATION compte sa
// tête — 1,635 m × h / 1,73 au-dessus des pieds (js/jeu/touches.js, les proportions de Haythem) —, or les avatars des amis
// ont la tête plus BASSE dans leur boîte (cheveux, tresses : `modelHeight` les compte) : mesuré au repos le 23/10, de
// −2,7 cm (Koji, Djafar, Marc-Antoine) à −4,8 cm (Ethan), −1,2 cm pour Haythem. L'avatar est donc mis à l'échelle (× 1,01 à
// 1,03, invisible) pour que sa tête soit là où on le touche : `modelHeight` divisé par k = tête simulée / tête mesurée.
// Les fiches gardent leurs valeurs (LA CAGE js/roster.js) ; k vaut 1 pour un modèle jamais sondé.
const CALAGE = new Map();                                      // modèle → k
export const calageTete = (model) => CALAGE.get(model) || 1;
// la définition d'un Player depuis une fiche (le modèle et sa taille ; les couleurs ne servent qu'au bonhomme de secours)
function definition(f) {
  return { ...HAYTHEM, id: f.id, name: f.nom, height: f.height, modelHeight: f.modelHeight / calageTete(f.model), spd: f.spd, model: f.model,
    color1: f.color1, color2: f.color2, skin: f.skin, discret: true };
}
// LES SONDES : un corps par avatar, chargé, reciblé, compilé (sa variante transparente avec), puis RETIRÉ DE LA SCÈNE mais
// GARDÉ pour la session — jamais montré. Ses matériaux tiennent ainsi leurs programmes en vie : three détruit un programme
// quand plus aucun matériau ne s'en sert (WebGLPrograms.releaseProgram) ; une sonde rendue aurait emporté la variante
// transparente (Haythem ne l'a que s'il a frôlé la caméra en balade, js/game.js _fantome) et tout programme propre à un
// avatar d'ami, recompilés ensuite à la première poupée qui s'efface. Une préparation suivante ne refait rien (≈ 0 ms).
const SONDES = new Map();                                      // modèle → Player sonde (hors de la scène)
function sonder(game, f) {
  if (!SONDES.has(f.model)) SONDES.set(f.model, preparerSonde(game, f));
  return SONDES.get(f.model);
}
async function preparerSonde(game, f) {
  const p = new Player(definition(f), game.scene);
  p.mesh.visible = false;                                      // (jamais à l'image : seuls ses programmes comptent)
  // le GLB lu (la promesse du cache des modèles : le corps s'y est abonné le premier, son avatar est donc posé quand elle
  // rend la main — pas d'attente par minuterie : un onglet d'arrière-plan les ralentit à une par seconde), puis ses
  // programmes et ses clips (Player._pretAvatar : 6 s au plus pour les clips)
  await prechargerModele(f.model);
  if (p._pretAvatar) await Promise.race([p._pretAvatar, attendre(8)]);
  // le calage de la tête : la sonde au repos (clip d'attente), sa tête mesurée (os Head + 8,5 cm × h / 1,8 sur son axe)
  if (p.avatar && p.anim && !CALAGE.has(f.model)) {
    p.pos.set(0, 0, 0); p.vel.set(0, 0, 0);
    for (let i = 0; i < 12; i++) p.update(1 / 30);
    const B = p.avatar.bone('Head');
    if (B) {
      p.mesh.updateMatrixWorld(true);
      const v = B.getWorldPosition(new THREE.Vector3()), y = new THREE.Vector3().setFromMatrixColumn(B.matrixWorld, 1).normalize();
      const tete = v.addScaledVector(y, 0.085 * p.h / 1.8).y - p.pos.y, k = 1.635 * p.h / 1.73 / tete;
      if (Number.isFinite(k) && k > 0.9 && k < 1.1) CALAGE.set(f.model, k);
    }
  }
  // la variante transparente (l'effacement Airsoft) : compilée une fois, la sonde rendue opaque aussitôt
  if (p.avatarModel && game._compilerAsync) {
    p.avatarModel.visible = true;
    opaciteCorps(p, 0.5);
    try { await Promise.race([game._compilerAsync(p.avatarModel), attendre(8)]); } finally { opaciteCorps(p, 1); }
  }
  if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
  return p;
}
// UNE IMAGE VRAIE des sondes neuves, toutes ensemble, sous l'écran de préparation (il couvre l'image) : la compilation
// parallèle (Player.preparerRendu) ne couvre pas toutes les passes — mesuré au traceur le 23/10 : 3 programmes de
// profondeur (cheveux à alphaTest des amis, carte d'ombre sans lumières) et 2 de matériaux simples naissaient au premier
// dessin d'un bot. Une IMAGE DU JEU (game.frame, et pas le seul rendu : les ombres de contact y posent la couche des mobiles,
// sans laquelle le cache d'ombre — js/ombre_cache.js — ne dessine pas un corps neuf dans la carte d'ombre), deux fois
// opaques, une fois transparentes, teintes, brassards et une arme en main : tout ce qu'un corps montrera. Trois images en
// tout, quel que soit le nombre d'avatars.
async function imageSondes(game, L) {
  if (!L.length || !game.camera || !(game.frame || game.fx)) return;
  const cam = game.camera, d = new THREE.Vector3(), C = game.collisions;
  cam.getWorldDirection(d); d.y = 0; if (d.lengthSq() < 1e-6) d.set(0, 0, -1); d.normalize();
  const arme = armeSonde(game.scene);
  try {
    L.forEach((p, k) => {
      const o = (k - (L.length - 1) / 2) * 0.8, x = cam.position.x + d.x * 3 + d.z * o, z = cam.position.z + d.z * 3 - d.x * o;
      const y = C ? C.solEn(x, z, cam.position.y - 1.2) : cam.position.y - 1.6;
      game.scene.add(p.mesh);
      p.pos.set(x, y, z); p.setFacing(-d.x, -d.z); p.mesh.visible = true; p.avatarModel.visible = true;
      teinteEquipe(p, k % 2 ? 'B' : 'A');
      p.update(1 / 60); p.memoriser(); p.presenter(1);
      if (k === 0 && arme) { arme.position.set(x + d.z * 0.4, y + 1.3, z - d.x * 0.4); arme.updateMatrixWorld(true); }
    });
    for (const k of [1, 1, 0.5]) {
      for (const p of L) opaciteCorps(p, k);
      try { if (game.frame) game.frame(1 / 60); else game.fx.render(1 / 60); } catch (e) { /* une image manquée n'empêche pas la partie */ }
    }
  } finally {
    for (const p of L) { opaciteCorps(p, 1); teinteEquipe(p, null); p.mesh.visible = false; if (p.mesh.parent) p.mesh.parent.remove(p.mesh); }
    if (arme) libererArmeSonde(arme);
  }
}


// LES AVATARS D'UNE PARTIE, prêts avant l'entrée (écran PRÉPARATION) : `ids`, les amis cochés (FICHES_BOTS), dans l'ordre ;
// vide → Haythem cloné. Haythem cloné est toujours préparé (les mannequins, et les bots s'il n'y a personne d'autre).
export async function preparerAvatars(game, ids, progres) {
  const pr = progres || (() => {}), t0 = performance.now();
  pr('Les élèves arrivent', 0);
  const voulus = [];
  for (const id of ids || []) { const f = FICHES_BOTS.find((x) => x.id === id); if (f && !voulus.includes(f)) voulus.push(f); }
  const fiches = voulus.slice(0, plafondAvatars());
  PRETS.fiches = fiches.length ? fiches : [FICHE_HAYTHEM];
  PRETS.modeles = new Set([FICHE_HAYTHEM.model, ...fiches.map((f) => f.model)]);
  await prechargerModele(HAYTHEM.model);
  // un avatar par gabarit d'abord (Haythem ouvre le gabarit A : ses clips sont reciblés depuis le démarrage)
  const tous = [FICHE_HAYTHEM, ...fiches], premiers = [], suivants = [], gabarits = new Set();
  for (const f of tous) { if (gabarits.has(f.gabarit)) suivants.push(f); else { gabarits.add(f.gabarit); premiers.push(f); } }
  let n = 0;
  const un = async (f) => { await sonder(game, f); n++; pr('Les élèves arrivent', n / (tous.length + 1)); };
  await Promise.all(premiers.map(un));
  await Promise.all(suivants.map(un));
  // l'image vraie des sondes neuves (une fois par session et par avatar)
  const neuves = [];
  for (const f of tous) { const p = await SONDES.get(f.model); if (p && p.avatarModel && !p._imagee && !neuves.includes(p)) { p._imagee = true; neuves.push(p); } }
  await imageSondes(game, neuves);
  // ce que les corps montreront : teintes et brassards, armes à la 3e personne
  await preparerTeintes(game);
  await preparerArmes3e(game);
  PRETS.mesures = { ms: performance.now() - t0, sondes: tous.length };
  pr('Les élèves arrivent', 1);
}

// LE CORPS d'un bot (un Player aux drapeaux de partie), dans la scène ; `o.equipe` : sa teinte (posée quand l'avatar
// arrive, avant sa première image). Une fiche dont l'avatar n'est pas préparé (plafond atteint, ou corps créé hors d'une
// préparation) prend un avatar préparé — le même nom, le corps d'un autre : jamais un 7e avatar en mémoire.
export function creerCorps(fiche, scene, o) {
  let f = fiche || FICHE_HAYTHEM;
  if (!PRETS.modeles.has(f.model)) {
    const L = PRETS.fiches, k = FICHES_BOTS.indexOf(f);
    f = { ...(L[(k < 0 ? 0 : k) % L.length] || FICHE_HAYTHEM), id: f.id, nom: f.nom };
  }
  const p = new Player(definition(f), scene);
  p.capFixe = true; p.sansRangs = true; p.audible = false; p.sansSouffle = true; p.elanAir = true; p.cibleRegard = null;
  p.equipe = (o && o.equipe) || null;
  p.fiche = f;
  if (p.equipe) p.surAvatar = (q) => teinteEquipe(q, q.equipe);
  return p;
}
// LIBÉRER un corps : ses brassards détachés d'abord (géométries et matériaux PARTAGÉS : Player.dispose rendrait leur
// matériau, que portent tous les corps de l'équipe), puis Player.dispose (bonhomme de secours compris)
export function libererCorps(player) {
  if (!player) return;
  retirerTeinte(player);
  player.surAvatar = null;
  player.dispose();
}
