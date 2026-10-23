// =====================================================================
//  L'ARME DANS LES MAINS D'UN BOT (lot L-C, 23/10 ; spec §§ 3.6, 4.5.10, 5.5.5 — squelette du socle S0 ; banc/armer.js
//  recopié et taillé)
// =====================================================================
// Une fois par image, après la pose du corps et l'accroupi (Player.apresPose, entre deux relevés de la pose :
// js/player.js _apresDebut — `ajouter` est relatif), sur la position AFFICHÉE :
//   1. LE BUSTE : le dos est déjà droit (js/couches.js _droit, `droit`) ; il prend une part du tangage de la visée
//      (Spine 0,10 / Spine1 0,15 / Spine2 0,25 du tangage, borné), se met DE TROIS QUARTS pour un fusil (la crosse à
//      l'épaule droite, l'épaule gauche avancée : sans cela la main gauche n'atteint pas le garde-main, 0,54 m devant la
//      crosse pour un bras de 0,48 m) et la tête revient dans l'axe de la visée, qu'elle suit (le reste du tangage) ;
//   2. L'ARME (le modèle 3e personne de js/jeu/modeles_armes.js creerArme, une racine de la scène, `dynamique`) : son
//      canon EXACTEMENT dans la direction de la commande (lacet, tangage), la crosse au creux de l'épaule droite (fusils)
//      ou les bras tendus devant la poitrine (pistolet) ; abaissée au sprint, roulée à la recharge, plongée au
//      changement d'arme, au couteau, au lancer d'une grenade et au franchissement ; un ressort de RECUL à chaque tir
//      (piston et cabré de la fiche, ω 35, ζ 0,55, comme l'arme de vue) ;
//   3. LES MAINS sur les PRISES (cinématique inverse à deux os, AvatarRig.ikBras : poignée et garde-main, pistolet à deux
//      mains, chargeur à la recharge), doigts repliés ; le point de prise d'une main est le creux de sa paume (poignet +
//      55 % de la main vers les doigts + 2,2 cm hors de la paume) ;
//   4. LE SURSAUT à la touche (spec § 3.6) : le buste part à l'opposé du tireur, 0,15 rad au plus, ressort ω 18 ;
//   5. LA BOUCHE en monde dans `acteur.aff.bouche` (les éclairs et les traceurs, L-H).
// Un bot non posé à cette image (js/jeu/cadence_acteurs.js) garde son arme collée à son corps (`suivreArme`). Affichage
// seulement : rien ici n'entre dans la simulation.
import * as THREE from 'three';
import { creerArme, REPERES } from './modeles_armes.js';
import { ARMES } from './armes.js';
import { centrerTete } from './accroupi.js';

export const POSE_3E = {
  dos: { droit: 0.0, droitSprint: 0.12, penche: 0.25 },       // le dos (rad vers l'avant), le penché du groupe gardé
  tangage: { part: [0.10, 0.15, 0.25], max: 0.6 },                // part du tangage prise par Spine / Spine1 / Spine2
  troisQuarts: { fusil: 0.55, pistolet: 0.08 },                   // le buste tourné vers la droite (rad)
  joue: 0.22,                                                     // la tête penchée sur la crosse (rad)
  creux: 0.30,                                                    // le creux de l'épaule : de RightArm vers le milieu
  pistolet: { devant: 0.36, bas: 0.10, droite: 0.0 },             // la poignée du pistolet depuis le milieu des épaules (× e)
  prise: { doigts: 0.55, paume: 0.022 },                          // le creux de la paume : part de la main, hors de la paume (m × e)
  recul: { w: 35, z: 0.55 }, sursaut: { max: 0.15, w: 18, z: 0.5 },
  transitions: { sprint: 0.18, recharge: 0.15, change: 0.12, geste: 0.12 },
};
const FUSILS = new Set(['fa24', 'pm9', 'fp12', 'tp50']);
const ARMES_3E = ['fa24', 'pm9', 'fp12', 'tp50', 'p17'];
const DEG = Math.PI / 180;
const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const _M = new THREE.Vector3(), _D = new THREE.Vector3(), _G = new THREE.Vector3(), _E = new THREE.Vector3(), _P = new THREE.Vector3();
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _fd = new THREE.Vector3(), _nd = new THREE.Vector3(), _pole = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _C = new THREE.Quaternion(), _Ci = new THREE.Quaternion();
const _m = new THREE.Matrix4(), _mi = new THREE.Matrix4(), _s = new THREE.Vector3(1, 1, 1);
const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _w = new THREE.Vector3(), _n = new THREE.Vector3();
const _mg = new THREE.Vector3(), _ch = new THREE.Vector3(), _ce = new THREE.Vector3(), _ci = new THREE.Vector3(), _eu = new THREE.Euler(0, 0, 0, 'YXZ');
// (le pic d'un ressort lancé à la vitesse v0 vaut v0 / ω × c(ζ) : c(0,5) = 0,546, c(0,55) = 0,522)
const PIC = (z) => Math.exp(-z / Math.sqrt(1 - z * z) * Math.atan(Math.sqrt(1 - z * z) / z));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lisse = (k) => k * k * (3 - 2 * k);
const vers = (x, c, tau, dt) => x + (c - x) * (1 - Math.exp(-dt / tau));

// ---------------------------------------------------------------- les modèles à la 3e personne (une réserve partagée)
// Un modèle est LIBRE quand il n'est pas dans la scène (Partie._detruire le retire avec l'acteur ; un changement d'arme
// rend l'ancien) : la réserve ne grandit qu'au plus grand nombre de bots armés d'une même arme, une fois par session.
const RESERVE = new Map();
function prendre(id) {
  let L = RESERVE.get(id);
  if (!L) RESERVE.set(id, L = []);
  let g = L.find((x) => !x.parent);
  if (!g) {
    g = creerArme(id, { pourVue: false });
    g.userData.dynamique = true; g.userData.arme3e = id;
    g.matrixAutoUpdate = false;
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
    L.push(g);
  }
  g.visible = true;
  return g;
}
function rendre(g) { if (g && g.parent) g.parent.remove(g); }
// (l'image vraie d'une sonde, js/jeu/avatars.js : une arme de la réserve posée à côté d'elle, puis rendue)
export function armeSonde(scene) { const g = prendre('fa24'); g.matrixAutoUpdate = true; scene.add(g); return g; }
export function libererArmeSonde(g) { rendre(g); g.matrixAutoUpdate = false; }
const ombreArme = (g, oui) => { if (g.userData.ombre === oui) return; g.userData.ombre = oui; g.traverse((o) => { if (o.isMesh) o.castShadow = oui; }); };

// L'ARME À LA 3E PERSONNE de l'acteur (celle qu'il a en main), une racine de la scène, `dynamique` ; null s'il n'en a pas
export function armeTroisieme(acteur) {
  const A = acteur && acteur.arsenal, F = A && A.arme, id = F && ARMES_3E.includes(F.id) ? F.id : null;
  return armePour(acteur, id);
}
function armePour(acteur, id) {
  const aff = acteur.aff || (acteur.aff = { bouche: { x: 0, y: 0, z: 0 }, arme3e: null });
  const g = aff.arme3e;
  if (g && g.userData.arme3e === id) { if (!g.parent) scene(acteur).add(g); return g; }
  if (g) rendre(g);
  aff.arme3e = null;
  if (!id) return null;
  const n = prendre(id);
  scene(acteur).add(n);
  aff.arme3e = n;
  return n;
}
const scene = (acteur) => (acteur.partie && acteur.partie.game ? acteur.partie.game.scene : acteur.joueur.scene);

// À LA PRÉPARATION (js/jeu/avatars.js) : un modèle de chaque arme créé et ses programmes compilés, ombres comprises
let _armesPretes = null;
export function preparerArmes3e(game) { return game ? _armesPretes || (_armesPretes = compilerArmes3e(game)) : Promise.resolve(); }
async function compilerArmes3e(game) {
  const g = new THREE.Group(), pris = [];
  for (const id of ARMES_3E) { const a = prendre(id); a.matrixAutoUpdate = true; a.position.set(0, -50, 0); g.add(a); pris.push(a); }
  g.updateMatrixWorld(true);
  try {
    const c = game._compilerTout ? game._compilerTout(g, true) : game._compilerAsync ? game._compilerAsync(g) : null;
    if (c) await Promise.race([c, new Promise((r) => setTimeout(r, 4000))]);
  } finally { for (const a of pris) { g.remove(a); a.matrixAutoUpdate = false; } }
}

// ---------------------------------------------------------------- les ressorts (affichage)
function ressort(S, w, z, dt) {
  const n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
  for (let i = 0; i < n; i++) { S.v += (-w * w * S.x - 2 * z * w * S.v) * h; S.x += S.v * h; }
  if (Math.abs(S.x) < 1e-5 && Math.abs(S.v) < 1e-4) { S.x = 0; S.v = 0; }
}

// l'état d'affichage d'un acteur (jamais dans l'état sérialisable)
function etatPose(acteur) {
  const aff = acteur.aff;
  return aff._pose || (aff._pose = { sprint: 0, recharge: 0, change: 0, geste: 0, recul: { x: 0, v: 0 }, seq: -1, sursaut: { x: 0, v: 0, dx: 0, dz: 0 },
    tTouche: null, rel: new THREE.Matrix4(), relOk: false });
}

// le creux de la paume d'une main (monde) : la mesure des « mains sur les prises »
const _hw = new THREE.Vector3(), _hm = new THREE.Vector3(), _hf = new THREE.Vector3(), _hn = new THREE.Vector3(), _mn = new THREE.Vector3();
export function priseMain(A, cote, e, out) {
  const B = A.bones;
  B[cote + 'Hand'].getWorldPosition(_hw);
  A.repereMain(cote, _hw, _hf, _hn);
  const L = _hw.distanceTo(B[cote + 'HandMiddle1'].getWorldPosition(_hm));
  return out.copy(_hw).addScaledVector(_hf, POSE_3E.prise.doigts * L).addScaledVector(_hn, POSE_3E.prise.paume * e);
}
// la main sur une prise : le poignet visé pour que le creux de la paume y tombe, doigts `fd`, paume `nd`, coude vers `pole`
// (les matrices du haut du corps sont à jour : Spine.updateMatrixWorld(true) vient d'être fait, et ikBrasRapide tient à jour
// celles qu'elle change — les positions se lisent donc dans matrixWorld, sans remonter la chaîne à chaque lecture)
function mainSur(A, cote, prise, fd, nd, pole, plis, k, e) {
  const B = A.bones;
  const L = _hw.setFromMatrixPosition(B[cote + 'Hand'].matrixWorld).distanceTo(_hm.setFromMatrixPosition(B[cote + 'HandMiddle1'].matrixWorld));
  _fd.copy(fd).normalize(); _mn.copy(nd).addScaledVector(_fd, -_mn.dot(_fd)).normalize();
  _E.copy(prise).addScaledVector(_fd, -POSE_3E.prise.doigts * L).addScaledVector(_mn, -POSE_3E.prise.paume * e);
  ikBrasRapide(A, cote, _E, _fd, _mn, pole);
  if (plis) A.plierDoigts(cote, plis, k);
}

// LA CINÉMATIQUE INVERSE DU BRAS, une pose par image (AvatarRig.ikBras, js/avatar.js : les mêmes calculs, à k = 1). L'original
// remet à jour trois sous-arbres entiers (bras, avant-bras, main : doigts compris, une cinquantaine de matrices) et remonte
// la chaîne des parents à chaque lecture — 41 µs par bras mesurés le 23/10 ; ici seules les matrices dont la suite a besoin
// sont refaites (bras, avant-bras, main, les trois jointures de la paume) : les doigts suivent au rendu
// (scene.updateMatrixWorld). Jamais de NaN écrit dans un os.
const _iS = new THREE.Vector3(), _iE = new THREE.Vector3(), _iW = new THREE.Vector3(), _iT = new THREE.Vector3(), _iD = new THREE.Vector3();
const _iP = new THREE.Vector3(), _ie2 = new THREE.Vector3(), _iA = new THREE.Vector3(), _iB = new THREE.Vector3(), _iF = new THREE.Vector3();
const _iN = new THREE.Vector3(), _iC = new THREE.Vector3(), _iM = new THREE.Vector3(), _iI = new THREE.Vector3(), _iK = new THREE.Vector3();
const _iq = new THREE.Quaternion(), _iqa = new THREE.Quaternion(), _iqb = new THREE.Quaternion(), _iqp = new THREE.Quaternion();
const _im1 = new THREE.Matrix4(), _im2 = new THREE.Matrix4(), _iv = new THREE.Vector3(), _isc = new THREE.Vector3();
const qMonde = (o, q) => { o.matrixWorld.decompose(_iv, q, _isc); return q; };
// tourne l'os (monde) d'une rotation `qr`, puis refait sa matrice et celles de `suite` (ses descendants utiles, dans l'ordre)
function tourner(os, qr, suite) {
  qMonde(os, _iqb).premultiply(qr);
  qMonde(os.parent, _iqp).invert().multiply(_iqb);
  if (!Number.isFinite(_iqp.x + _iqp.y + _iqp.z + _iqp.w)) return false;
  os.quaternion.copy(_iqp); os.updateMatrix(); os.matrixWorld.multiplyMatrices(os.parent.matrixWorld, os.matrix);
  for (const o of suite) o.matrixWorld.multiplyMatrices(o.parent.matrixWorld, o.matrix);
  return true;
}
function viserRapide(os, de, vers, suite) {
  if (!(de.lengthSq() > 1e-10) || !(vers.lengthSq() > 1e-10)) return;
  _iq.setFromUnitVectors(de, vers);
  tourner(os, _iq, suite);
}
function ikBrasRapide(A, cote, cible, fDes, nDes, pole) {
  if (!A.aMains(cote)) return false;
  if (!Number.isFinite(cible.x + cible.y + cible.z + pole.x + pole.y + pole.z + fDes.x + fDes.y + fDes.z + nDes.x + nDes.y + nDes.z)) return false;
  const B = A.bones, bras = B[cote + 'Arm'], avant = B[cote + 'ForeArm'], main = B[cote + 'Hand'];
  const M = B[cote + 'HandMiddle1'], I = B[cote + 'HandIndex1'], K = B[cote + 'HandPinky1'];
  const doigts = [M, I, K];
  _iS.setFromMatrixPosition(bras.matrixWorld); _iE.setFromMatrixPosition(avant.matrixWorld); _iW.setFromMatrixPosition(main.matrixWorld);
  const a = _iS.distanceTo(_iE), b = _iE.distanceTo(_iW);
  _iT.copy(cible); _iD.subVectors(_iT, _iS);
  const d = Math.min(a + b - 1e-3, Math.max(Math.abs(a - b) + 1e-3, _iD.length()));
  _iD.normalize(); _iT.copy(_iS).addScaledVector(_iD, d);
  const cos = (a * a + d * d - b * b) / (2 * a * d), sin = Math.sqrt(Math.max(0, 1 - cos * cos));
  _iP.subVectors(pole, _iS); _iP.addScaledVector(_iD, -_iP.dot(_iD));
  if (_iP.lengthSq() < 1e-8) _iP.set(0, -1, 0); _iP.normalize();
  _ie2.copy(_iS).addScaledVector(_iD, cos * a).addScaledVector(_iP, sin * a);
  // (avant-bras, main et jointures suivent le bras : leurs matrices locales sont à jour, seules les monde changent)
  viserRapide(bras, _iA.subVectors(_iE, _iS).normalize(), _iB.subVectors(_ie2, _iS).normalize(), [avant, main, ...doigts]);
  _iE.setFromMatrixPosition(avant.matrixWorld); _iW.setFromMatrixPosition(main.matrixWorld);
  viserRapide(avant, _iA.subVectors(_iW, _iE).normalize(), _iB.subVectors(_iT, _iE).normalize(), [main, ...doigts]);
  // la main : son repère (doigts, paume) amené sur celui qui est demandé (AvatarRig.repereMain)
  _iW.setFromMatrixPosition(main.matrixWorld);
  _iM.setFromMatrixPosition(M.matrixWorld); _iI.setFromMatrixPosition(I.matrixWorld); _iK.setFromMatrixPosition(K.matrixWorld);
  _iF.subVectors(_iM, _iW).normalize();
  _iC.subVectors(_iI, _iK);
  if (cote === 'Right') _iN.crossVectors(_iC, _iF); else _iN.crossVectors(_iF, _iC);
  _iN.addScaledVector(_iF, -_iN.dot(_iF)).normalize();
  _iC.crossVectors(_iF, _iN); _im1.makeBasis(_iF, _iN, _iC);
  _iN.copy(nDes).addScaledVector(fDes, -nDes.dot(fDes));
  if (!(_iN.lengthSq() > 1e-8) || !(fDes.lengthSq() > 1e-8)) return true;
  _iN.normalize();
  _iC.crossVectors(fDes, _iN); _im2.makeBasis(fDes, _iN, _iC);
  _iqa.setFromRotationMatrix(_im2); _iq.setFromRotationMatrix(_im1).invert(); _iqa.multiply(_iq);
  tourner(main, _iqa, doigts);
  return true;
}

// ---------------------------------------------------------------- LA POSE
export function poserArme(acteur, dt) {
  const p = acteur && acteur.joueur, A = p && p.avatar;
  if (!A || !A.ok || acteur.corps !== p) return;
  const S = etatPose(acteur);
  const Ar = acteur.arsenal, F = Ar && Ar.arme;
  const vivant = acteur.vivant && !acteur.poupee;
  // l'arme en main (pendant un changement : l'ancienne jusqu'au rangement, la nouvelle ensuite)
  let id = vivant && F && ARMES_3E.includes(F.id) ? F.id : null;
  const et = Ar ? Ar.etatArme : 'pret', tE = Ar ? Ar.tEtat : 0;
  let kChange = 0;
  if (id && et === 'change') {
    const suiv = Ar.vers >= 0 && Ar.armes ? Ar.armes[Ar.vers] : null, tR = F.rangement || 0.2, tS = suiv ? suiv.sortie || 0.3 : 0.3;
    if (tE < tR) kChange = lisse(clamp(tE / tR, 0, 1));
    else { if (suiv && ARMES_3E.includes(suiv.id)) id = suiv.id; kChange = 1 - lisse(clamp((tE - tR) / tS, 0, 1)); }
  }
  const arme = armePour(acteur, id);
  // les drapeaux du corps armé (lus par js/couches.js à la pose suivante)
  const sprint = !!(p.sprinting || et === 'sprint');
  p.droit = arme ? (sprint ? POSE_3E.dos.droitSprint : POSE_3E.dos.droit) : undefined;
  p.penche = arme ? POSE_3E.dos.penche : undefined;
  p.sansRegard = !!arme;
  // ---- le sursaut à la touche (armé ou non)
  const T = acteur.derniereTouche;
  if (T && T.t !== S.tTouche && acteur.vivant) {
    S.tTouche = T.t;
    const tireur = acteur.partie && acteur.partie.acteurParId ? acteur.partie.acteurParId(T.par) : null;
    let dx = 0, dz = 0;
    if (tireur && tireur !== acteur && tireur.corps) { dx = p.pos.x - tireur.corps.pos.x; dz = p.pos.z - tireur.corps.pos.z; }
    const n = Math.hypot(dx, dz);
    // (le buste part dans le sens de la balle ; sans tireur connu, vers l'arrière)
    if (n > 1e-3) { S.sursaut.dx = dx / n; S.sursaut.dz = dz / n; }
    else { S.sursaut.dx = Math.sin(acteur.cmd.lacet); S.sursaut.dz = Math.cos(acteur.cmd.lacet); }
    S.sursaut.v += POSE_3E.sursaut.max * POSE_3E.sursaut.w / PIC(POSE_3E.sursaut.z);
  } else if (!T) S.tTouche = null;
  ressort(S.sursaut, POSE_3E.sursaut.w, POSE_3E.sursaut.z, dt);
  p.mesh.getWorldQuaternion(_C); _Ci.copy(_C).invert(); A.repere(_C, _Ci);
  // (accroupi : la tête ramenée au-dessus des pieds, où la simulation la compte — js/jeu/accroupi.js centrerTete —, puis le
  // sursaut par-dessus, qu'elle n'efface pas)
  const kA = acteur.accroupi || 0;
  if (!arme) { centrerTete(p, kA); sursauter(A, S); S.relOk = false; return; }

  // ---- les transitions (sprint, recharge, gestes)
  const fiche = ARMES[id] || F;
  const fusil = FUSILS.has(id), TR = POSE_3E.transitions;
  S.sprint = clamp(S.sprint + (sprint && et !== 'recharge' ? dt / TR.sprint : -dt / TR.sprint), 0, 1);
  S.recharge = clamp(S.recharge + (et === 'recharge' ? dt / TR.recharge : -dt / TR.recharge), 0, 1);
  const geste = et === 'couteau' || et === 'lancer' || et === 'franchit';
  S.geste = clamp(S.geste + (geste ? dt / TR.geste : -dt / TR.geste), 0, 1);
  S.change = kChange;
  // le recul : un coup de ressort à chaque tir
  const seq = Ar.tirSeq;
  if (S.seq >= 0 && seq > S.seq && et !== 'change') S.recul.v += POSE_3E.recul.w / PIC(POSE_3E.recul.z);
  S.seq = seq;
  ressort(S.recul, POSE_3E.recul.w, POSE_3E.recul.z, dt);
  const e = p.h / 1.73;
  // ---- la visée voulue : (−sin l·cos t, −sin t, −cos l·cos t)
  const l = acteur.cmd.lacet, t = acteur.cmd.tangage, ct = Math.cos(t);
  _f.set(-Math.sin(l) * ct, -Math.sin(t), -Math.cos(l) * ct).normalize();
  // ---- 1. le buste : une part du tangage, de trois quarts, la tête dans l'axe
  const kBas = Math.max(S.sprint, S.change, S.geste * 0.8);
  const kVise = 1 - kBas;
  const Tg = POSE_3E.tangage, tb = clamp(t, -Tg.max / 0.5, Tg.max / 0.5) * kVise;
  const bl = (fusil ? POSE_3E.troisQuarts.fusil : POSE_3E.troisQuarts.pistolet) * (1 - S.sprint);
  A.ajouter('Spine', tb * Tg.part[0], -bl * 0.3, 0);
  A.ajouter('Spine1', tb * Tg.part[1], -bl * 0.35, 0);
  A.ajouter('Spine2', tb * Tg.part[2], -bl * 0.35, 0);
  const reste = (t - tb * (Tg.part[0] + Tg.part[1] + Tg.part[2])) * kVise;
  // (la joue sur la crosse : la tête penchée vers l'arme, un fusil épaulé EN VISÉE seulement — en courant elle reste
  // droite, au-dessus des pieds, où la simulation la compte)
  const joue = fusil ? kVise * (Ar.visee || 0) * POSE_3E.joue : 0;
  A.ajouter('Neck', reste * 0.4 + joue * 0.3, bl * 0.45, joue * 0.4);
  A.ajouter('Head', reste * 0.6 + joue * 0.5, bl * 0.55, joue * 0.8);
  centrerTete(p, kA); sursauter(A, S);
  A.bone('Spine').updateMatrixWorld(true);
  // ---- 2. le repère de l'arme
  _r.crossVectors(_f, _up); if (_r.lengthSq() < 1e-8) _r.set(Math.cos(l), 0, -Math.sin(l)); _r.normalize();   // la droite
  _u.crossVectors(_r, _f).normalize();
  const B = A.bones;
  _a.setFromMatrixPosition(B.LeftArm.matrixWorld); _b.setFromMatrixPosition(B.RightArm.matrixWorld);
  _M.addVectors(_a, _b).multiplyScalar(0.5);                         // le milieu des épaules
  const R = REPERES[id] || REPERES.fa24;
  if (fusil) {
    // la crosse au creux de l'épaule droite : G = creux − u·crosse.y + f·crosse.z
    _P.copy(_b).lerp(_M, POSE_3E.creux);
    const cr = R.crosse || [0, 0.03, 0.2];
    _G.copy(_P).addScaledVector(_u, -cr[1] * e).addScaledVector(_f, cr[2] * e);
  } else {
    const Pp = POSE_3E.pistolet;
    _G.copy(_M).addScaledVector(_f, Pp.devant * e).addScaledVector(_u, -Pp.bas * e).addScaledVector(_r, Pp.droite * e);
  }
  // la base de l'arme : x = droite, y = dessus, z = vers l'ARRIÈRE (−z vers la bouche)
  _m.makeBasis(_r, _u, _D.copy(_f).negate());
  _q.setFromRotationMatrix(_m);
  // le recul : la crosse recule (piston) et l'arme se cabre autour de la poignée
  const rc = fiche.recul || {}, kr = Math.min(1.5, S.recul.x);
  if (kr) {
    _G.addScaledVector(_f, -(rc.piston || 0.03) * kr * e);
    _q2.setFromAxisAngle(_x.set(1, 0, 0), (rc.cabre || 3) * DEG * kr); _q.multiply(_q2);
  }
  // abaissée : sprint (en travers de la poitrine), recharge (roulée, plus bas), changement et gestes (plongée)
  if (S.sprint > 0) {
    const k = lisse(S.sprint);
    _P.copy(_M).addScaledVector(_f, 0.20 * e).addScaledVector(_u, -0.22 * e).addScaledVector(_r, 0.06 * e);
    _G.lerp(_P, k);
    _q2.setFromEuler(_eu.set(-0.55 * k, 0.75 * k, 0.45 * k)); _q.multiply(_q2);
  }
  if (S.recharge > 0) {
    const k = lisse(S.recharge);
    _G.addScaledVector(_u, -0.07 * k * e).addScaledVector(_f, -0.04 * k * e);
    _q2.setFromEuler(_eu.set(-0.32 * k, 0.12 * k, -0.55 * k)); _q.multiply(_q2);
  }
  const kp = Math.max(S.change, S.geste * 0.8);
  if (kp > 0) {
    const k = lisse(kp);
    _G.addScaledVector(_u, -0.20 * k * e).addScaledVector(_f, -0.06 * k * e);
    _q2.setFromEuler(_eu.set(-0.85 * k, 0.25 * k, 0.2 * k)); _q.multiply(_q2);
  }
  // À PORTÉE DE BRAS : visée très basse ou très haute, un fusil épaulé met son garde-main à 0,6 m de l'épaule gauche (le
  // bras en fait 0,48) ; on fait alors glisser l'arme vers soi le long de son axe (la crosse quitte l'épaule : sous
  // l'aisselle en visant haut, au-dessus en visant bas, comme on le fait), juste assez pour que chaque main tienne sa prise
  _z.set(0, 0, -1).applyQuaternion(_q);
  const glisse = (epaule, cible, portee) => {
    _D.subVectors(cible, epaule);
    const dz = _D.dot(_z), d2 = _D.lengthSq(), r = portee;
    if (d2 <= r * r) return 0;
    const disc = dz * dz - d2 + r * r;
    return Math.max(0, disc >= 0 ? dz - Math.sqrt(disc) : dz);
  };
  const portee = (c) => { const L = S.portees || (S.portees = {}); if (!(L[c] > 0) || L._A !== A) { L._A = A; L[c] = B[c + 'Arm'].getWorldPosition(_w).distanceTo(B[c + 'ForeArm'].getWorldPosition(_hm)) + _hm.distanceTo(B[c + 'Hand'].getWorldPosition(_hw)); } return L[c] * 0.955; };
  {
    const mgL = R.mainG || [0, 0, 0];
    // (le poignet gauche visé : la prise, moins la main — 8 cm de marge comptés pour elle)
    _P.set(mgL[0], mgL[1], mgL[2]).multiplyScalar(e).applyQuaternion(_q).add(_G);
    _a.setFromMatrixPosition(B.LeftArm.matrixWorld);
    const sG = glisse(_a, _P, portee('Left') + 0.06 * e), sD = glisse(_b, _G, portee('Right') + 0.06 * e);
    const sl = Math.max(sG, sD);
    if (sl > 0) _G.addScaledVector(_z, -sl);
    S.glisse = sl;
  }
  _s.setScalar(e);
  arme.matrix.compose(_G, _q, _s);
  arme.matrixWorld.copy(arme.matrix); arme.matrixWorldNeedsUpdate = false;
  for (const c of arme.children) c.updateMatrixWorld(true);
  arme.visible = p.mesh.visible;
  // les repères de l'arme, en monde
  const rep = (nom, out) => { const v = R[nom]; return v ? out.set(v[0], v[1], v[2]).applyMatrix4(arme.matrix) : null; };
  // ---- 3. les mains
  _x.set(1, 0, 0).applyQuaternion(_q); _y.set(0, 1, 0).applyQuaternion(_q); _z.set(0, 0, -1).applyQuaternion(_q);   // droite, dessus, canon (de l'arme)
  // main droite : la poignée (l'origine), doigts vers l'avant et le bas, paume contre la poignée ; coude dehors et bas
  _a.copy(_G);
  _fd.copy(_z).multiplyScalar(fusil ? 0.55 : 0.35).addScaledVector(_y, fusil ? -0.75 : -0.9).addScaledVector(_x, fusil ? -0.25 : -0.1);
  _nd.copy(_x).negate();
  _pole.copy(_b).addScaledVector(_r, 0.35).addScaledVector(_u, -0.55).addScaledVector(_f, -0.1);
  const recharge = S.recharge > 0 ? lisse(S.recharge) : 0;
  mainSur(A, 'Right', _a, _fd, _nd, _pole, [0.9, 1.1, 0.8], 1, e);
  // main gauche : le garde-main (fusils) ou la main droite (pistolet) ; à la recharge, le chargeur puis la ceinture
  _b.setFromMatrixPosition(B.LeftArm.matrixWorld);
  const mg = rep('mainG', _mg) || _mg.copy(_G);
  if (fusil) {
    _fd.copy(_z).multiplyScalar(0.6).addScaledVector(_x, 0.75);
    _nd.copy(_y);
  } else {
    _fd.copy(_z).multiplyScalar(0.3).addScaledVector(_y, -0.8).addScaledVector(_x, 0.4);
    _nd.copy(_x).multiplyScalar(0.75).addScaledVector(_y, 0.35);
  }
  if (recharge > 0 && et === 'recharge') {
    // la main gauche va au chargeur (sous la carcasse, devant la poignée), le sort vers la ceinture, en rapporte un
    const duree = Ar.fin > Ar.t0 ? Ar.fin - Ar.t0 : fiche.recharge && fiche.recharge.tact || 1.9;
    const u = clamp(tE / duree, 0, 1);
    const chargeur = _ch.set(0, -0.10, -0.09).applyMatrix4(arme.matrix);
    const ceinture = _ce.copy(_M).addScaledVector(_u, -0.48 * e).addScaledVector(_r, -0.10 * e).addScaledVector(_f, 0.12 * e);
    let k = 0;
    if (u < 0.13) { _ci.copy(chargeur); k = lisse(u / 0.13); }
    else if (u < 0.30) { _ci.copy(chargeur); k = 1; }
    else if (u < 0.50) { _ci.lerpVectors(chargeur, ceinture, lisse((u - 0.30) / 0.20)); k = 1; }
    else if (u < 0.71) { _ci.lerpVectors(ceinture, chargeur, lisse((u - 0.50) / 0.21)); k = 1; }
    else if (u < 0.85) { _ci.lerpVectors(chargeur, mg, lisse((u - 0.71) / 0.14)); k = 1; }
    if (k > 0) {
      mg.lerp(_ci, k);
      _fd.copy(_z).multiplyScalar(0.3).addScaledVector(_y, 0.2).addScaledVector(_x, 0.8);
      _nd.copy(_x);
    }
  }
  _pole.copy(_b).addScaledVector(_r, -0.25).addScaledVector(_u, -0.6).addScaledVector(_f, 0.05);
  mainSur(A, 'Left', mg, _fd, _nd, _pole, fusil ? [0.8, 1.0, 0.7] : [0.9, 1.0, 0.8], 1, e);
  // ---- 5. la bouche
  const bo = rep('bouche', _P);
  if (bo) { const o = acteur.aff.bouche; o.x = bo.x; o.y = bo.y; o.z = bo.z; }
  // (la place de l'arme sur le corps, pour les images où il n'est pas posé)
  _mi.copy(p.mesh.matrixWorld).invert();
  S.rel.multiplyMatrices(_mi, arme.matrix); S.relOk = true;
}

// LE SURSAUT à la touche, sur le buste (dans le repère du corps : l'avant z et la gauche x ; rx > 0 penche en avant, rz > 0
// couche vers sa droite)
function sursauter(A, S) {
  if (!S.sursaut.x) return;
  _a.set(S.sursaut.dx, 0, S.sursaut.dz).applyQuaternion(_Ci);
  const rx = S.sursaut.x * _a.z, rz = -S.sursaut.x * _a.x;
  A.ajouter('Spine1', rx * 0.5, 0, rz * 0.5); A.ajouter('Spine2', rx * 0.5, 0, rz * 0.5);
}

// UN BOT NON POSÉ À CETTE IMAGE (js/jeu/cadence_acteurs.js) : son arme suit son corps, qui a bougé (Player.presenter)
export function suivreArme(acteur, visible) {
  const g = acteur.aff && acteur.aff.arme3e, S = acteur.aff && acteur.aff._pose;
  if (!g) return;
  const vivant = acteur.vivant && !acteur.poupee;
  g.visible = !!visible && vivant && !!S && S.relOk;
  if (!g.visible) return;
  g.matrix.multiplyMatrices(acteur.joueur.mesh.matrixWorld, S.rel);
  g.matrixWorld.copy(g.matrix);
  for (const c of g.children) c.updateMatrixWorld(true);
  // (la bouche suit aussi : les éclairs d'un bot lointain partent de son arme, pas d'où elle était à sa dernière pose)
  const R = REPERES[g.userData.arme3e], o = acteur.aff.bouche;
  if (R && R.bouche && o) { _P.set(R.bouche[0], R.bouche[1], R.bouche[2]).applyMatrix4(g.matrix); o.x = _P.x; o.y = _P.y; o.z = _P.z; }
}
// l'ombre de l'arme (celle du corps : même niveau que la caméra)
export function ombreArme3e(acteur, oui) { const g = acteur.aff && acteur.aff.arme3e; if (g) ombreArme(g, !!oui); }
