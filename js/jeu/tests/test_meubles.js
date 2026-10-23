// =====================================================================
//  LES TESTS DU LOT L-K — registre, déguisements, corps des props (23/10 ; spec § 5.5.8, acceptation 1 à 14, et F2)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-K` (window.__rapport). Tout passe par window.__jeu et par les
// modules du lot : jamais un clic à l'écran. Un test rend { ok, attendu, obtenu }. Les tests `apresFusion` (le vrai graphe
// des props de L-D, le lot R au −1, les extincteurs de L-M) ne tournent qu'avec `&fusion=1` (F2).
import * as THREE from 'three';
import { Rng } from '../rng.js';
import { PAS, ZONES_JEU } from '../constantes.js';
import { MEUBLES, copieMeuble, fermerRegistre, rattraperRegistre, zonerRegistre, _bacASable, empriseEgale } from '../../registre_meubles.js';
import {
  CATALOGUE, preparerCatalogue, typesDeguisables, typesDistincts, deguisableDans, viserMeuble, deguiser, retirerProp, majProps, credibilite, cachettes,
  candidatsMeubles, toucherPoses, typeDe, pivotDe, _refEstActeur, distPassage, PASSAGES_PIECES,
} from '../deguisements.js';
import { CorpsProp, deplacerProp, coinsLibres } from '../corps_prop.js';
import { piecesDe, POINTS_APPARITION } from '../apparitions.js';
import { creerCommande } from '../commande.js';
import { Nav } from '../nav.js';
import { capsules } from '../touches.js';

// LES ONZE ENDROITS de carte_props § 4.1 (pieds, cap) : la caméra posée à 1,6 m, un rien vers le bas, champ 16:9 — les
// appels et les triangles de la balade y sont ceux de `socle` (référence relevée sur `socle-ok` e06258f, même harnais)
export const ENDROITS = [
  ['départ (hall)', 14.9, 0, -3.7, 0], ['salle d’attente', 11.63, 0, -4.62, Math.PI / 2], ['hall ouest', 4.63, 0, -6.87, 0],
  ['rue', 15.63, 0, 9.38, 0], ['pause du −1', 9.38, -3.06, -9.37, 0], ['S −1.14', 9.63, -3.06, -22.62, 0],
  ['pause du 1er', 12.63, 3.5, -7.87, Math.PI / 2], ['S 1.3', 2.88, 3.5, -3.37, 0], ['Robert Kahn', 8.13, 3.5, -22.62, 0],
  ['salle 1 du 2e', 4.63, 6.6, -7.87, 0], ['salle David Clark', 5.38, 0, -15.12, 0]];
// (relevé sur socle-ok e06258f le 23/10, la même fonction, PC : [appels, triangles] par endroit — la qualité POSÉE par
// fx.setQuality, l'automatique coupée : `__jeu.qualite()` ne change que le réglage, et l'automatique avait pu redescendre
// le préréglage en route, d'où des relevés « haute » au nombre d'appels de la moyenne)
export const REFERENCE_ENDROITS = {
  pc: {
    haute: [[636, 456276], [785, 524376], [722, 552290], [1692, 565264], [256, 153675], [123, 116679], [606, 506380], [510, 396056], [167, 214364], [194, 265062], [220, 387368]],
    moyenne: [[348, 260734], [426, 293046], [389, 306973], [935, 315946], [141, 98410], [62, 79137], [325, 283682], [264, 228486], [83, 127894], [100, 162977], [112, 219642]],
  },
  // (relecture L-K du 23/10 : relevé sur socle-ok e06258f sous `?tel=1`, dans les conditions de la suite — après 1a, images
  // faites à la main ; sur une page fraîche, la salle d'attente et la salle 1 du 2e donnent d'autres comptes, sur les deux
  // arbres pareillement : la balade de 1a y laisse des portes et des suites du décor)
  tel: {
    haute: [[636, 448948], [785, 517048], [722, 544962], [1692, 557936], [255, 153506], [122, 116510], [606, 499052], [510, 388728], [167, 214364], [194, 257734], [220, 380412]],
    moyenne: [[348, 255406], [426, 287718], [389, 301645], [935, 310618], [140, 98241], [61, 78968], [325, 278354], [264, 223158], [83, 127894], [100, 157649], [112, 214686]],
  },
};
// le relevé aux onze endroits, en balade, caméra libre (game.freeCam), préréglage posé (`high` | `medium`), automatique coupée :
// 90 images pour que tout se pose (carte d'environnement, ombres), puis la médiane de 5
export async function mesurerEndroits(jeu, game, qualite) {
  const fx = game.fx, auto = fx.auto, q0 = fx.quality;
  fx.auto = false; fx.setQuality(qualite, true);
  const u = game.user, cam = game.camera, asp = cam.aspect, R = [];
  game.freeCam = true;
  try {
    for (const [nom, x, y, z, l] of ENDROITS) {
      u.pos.set(x, y, z); if (u.posPrec) u.posPrec.copy(u.pos); if (u.posAff) u.posAff.copy(u.pos); u.solAff = y; if (u.vel) u.vel.set(0, 0, 0);
      cam.position.set(x, y + 1.6, z); cam.rotation.set(-0.12, l, 0, 'YXZ'); cam.aspect = 16 / 9; cam.updateProjectionMatrix();
      await jeu.images(90);
      const m = await jeu.images(5);
      R.push([nom, m.appels, m.triangles]);
    }
  } finally { game.freeCam = false; cam.aspect = asp; cam.updateProjectionMatrix(); game.placerAuDepart(); fx.setQuality(q0, true); fx.auto = auto; }
  return R;
}

// LES TAILLES de carte_props § 2 et conception_prophunt § 4 (l × h × p, m) — les « ≈ » du document gardés, à ± 10 %
const TAILLES = {
  'chaise-coque': [0.63, 0.80, 0.60], 'chaise-coque-noire': [0.63, 0.80, 0.60], 'tabouret-miura': [0.53, 0.85, 0.52], 'chaise-hetre': [0.44, 0.86, 0.55],
  'chaise-kahn': [0.49, 0.85, 0.55], 'chaise-ecusson': [0.42, 0.82, 0.48], 'chaise-bureau': [0.68, 1.05, 0.66], presentoir: [0.36, 1.73, 0.80],
  extincteur: [0.21, 0.64, 0.23], 'mange-debout-croix': [0.65, 1.10, 0.65], 'chaise-dc': [0.46, 0.85, 0.52], 'chaise-marine': [0.47, 0.82, 0.45],
  'chaise-visiteur': [0.5, 0.85, 0.5], 'chaise-luge': [0.45, 0.82, 0.5], 'fauteuil-accueil': [0.7, 0.8, 0.7], copieur: [0.6, 1.15, 0.6],
};
// les écarts à ces tailles, expliqués (la copie est exacte, sommet à sommet : ce sont les mesures du document qui débordent)
const JUSTIFIES = {
  'tabouret-miura': 'carte_props 0,53 × 0,52 au sol : la boîte d’extraction (± 0,28-0,36 m autour du siège) ramassait le mange-debout voisin ; ses lames font 0,45 × 0,45',
  'chaise-hetre': 'rentrée sous sa table double : la boîte d’extraction ramassait le chant de la table (0,55) ; la chaise a 0,46 de fond',
  'chaise-kahn': 'rentrée sous son poste : la boîte d’extraction ramassait la table (0,55) ; la chaise a 0,49 de fond',
  'chaise-bureau': '« 0,68 × 0,66 » : l’étoile à cinq branches et ses roulettes mesurées en biais ; la copie fait 0,58-0,60',
  'chaise-luge': '« ≈ 0,45 × 0,82 × 0,5 » estimé par la conception, jamais mesuré ; la copie : 0,50 × 0,92 × 0,53',
  'fauteuil-accueil': '« ≈ 0,7 × 0,8 × 0,7 » estimé ; la copie : 0,60 × 1,04 × 0,62 (le dossier résille monte à 1,04)',
  copieur: '« ≈ 0,6 × 1,15 × 0,6 » estimé ; la copie : 0,71 × 1,12 × 0,67 (bac manuel et pupitre compris)',
  plante: 'carte_props le dit : « extraction polluée dans l’angle (plinthes) » ; la plante du bureau B fait 0,52 × 1,97 × 0,52',
  extincteur: 'carte_props mesurait celui du hall ouest (0,21 × 0,64 × 0,23 : sa copie y est, à 9 % près) ; les cinq autres sont d’autres modèles (CO2, 6 kg, à eau)',
};
const DEG = Math.PI / 180;
const r3 = (v) => Math.round(v * 1000) / 1000;
const hors = (zone) => zone && !piecesDe('ss').has(zone);

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-K', nom, fn, opts);
  const C = () => game.collisions;
  const profil = () => (window.__chargement && window.__chargement.telephone ? 'tel' : 'pc');
  const preparer = async () => { await preparerCatalogue(game); return MEUBLES; };
  // une partie d'essai où Haythem est un prop (corps de meuble), dans une zone du prop hunt
  const essaiProp = async (zone = 'e1') => { await jeu.lancer('essai', { graine: 19, mannequins: [], prop: true, zone }); return game.partie; };
  const posesDe = (zone) => { const P = piecesDe(zone); return MEUBLES.poses.filter((p) => P.has(p.zone)); };
  // un point libre pour le type T (son rayon, sa bande), sur le sol de la pose voisine
  const libreT = (T, x, y, z) => C().libre(x, z, T.rayon, y, T.bande.haut, T.bande.bas);
  const placer = (a, x, y, z, cap = 0) => { const c = a.corps; c.pos.set(x, y, z); c.posPrec.copy(c.pos); c.posAff.copy(c.pos); c.solAff = y; c.vel.set(0, 0, 0); c.ang = c.angPrec = c.angAff = cap; if (a.prop) a.prop.cap = cap; };

  // 1. LA CONSTRUCTION INCHANGÉE — [optim], balade au bit près, appels et triangles aux 11 endroits, coût du registre
  T('1a [optim] identique et balade au bit près', async () => {
    const R = jeu.reference[profil()], r = await jeu.rejouerBalade();
    const ok = jeu.releve.optim === R.optim && r.ok && r.identiques;
    return { ok, attendu: R.optim + ' · balade ≤ ' + r.seuils.pos, obtenu: `${jeu.releve.optim} · vue 3 ${r.vue3.pos} / ${r.vue3.cam} · vue 1 ${r.vue1.pos} / ${r.vue1.cam} · même onglet ${r.identiques}` };
  }, { delai: 120 });
  T('1b appels et triangles aux 11 endroits (haute, moyenne)', async (t) => {
    const ref = REFERENCE_ENDROITS && REFERENCE_ENDROITS[profil()];
    const H = await mesurerEndroits(jeu, game, 'high'), M = await mesurerEndroits(jeu, game, 'medium');
    t.note('endroits haute', JSON.stringify(H)); t.note('endroits moyenne', JSON.stringify(M));
    if (!ref) return { ok: false, attendu: 'la référence de socle-ok', obtenu: 'pas de référence pour le profil ' + profil() + ' : ' + JSON.stringify({ H, M }) };
    const diff = [];
    for (const [q, L] of [['haute', H], ['moyenne', M]]) L.forEach(([nom, a, tr], i) => { const [ra, rt] = ref[q][i]; if (a !== ra || tr !== rt) diff.push(`${q} ${nom} ${a}/${tr} au lieu de ${ra}/${rt}`); });
    return { ok: diff.length === 0, attendu: 'identiques à socle-ok (22 relevés)', obtenu: diff.length ? diff.join(' ; ') : '22 relevés identiques' };
  }, { delai: 300 });
  T('1c coût du registre à la construction ≤ 30 ms (rejoué sur une réplique)', async (t) => {
    await preparer();
    // LA RÉPLIQUE : chaque pose, un meuble d'AUTANT DE MAILLAGES que son original (ceux de son prototype, recopiés en boucle,
    // à leur place : relecture L-K du 23/10 — la copie cousue n'en a que 3 à 12 quand l'original en a 4 à 40, et le registre
    // paie chaque maillage d'un étiqueté : la réplique mesurait 15 ms, le vrai en coûtait davantage), à sa place, avec son
    // étiquette ; autant de maillages non étiquetés que la construction en a croisés (des maillages de la scène, géométrie
    // partagée : le registre n'en lit que deux sommets)
    const S = MEUBLES.stats, rep = new THREE.Group();
    let pieces = 0;
    for (const P of MEUBLES.poses) {
      const T0 = MEUBLES.types.get(P.cle); if (!T0 || !T0.proto) continue;
      const src = T0.proto.children.filter((m) => m.isMesh), c = new THREE.Group();
      for (let k = 0; k < Math.max(1, T0.pieces || src.length); k++) {
        const o = src[k % src.length], m = new THREE.Mesh(o.geometry, o.material);
        m.position.copy(o.position); m.quaternion.copy(o.quaternion); m.scale.copy(o.scale);
        m.castShadow = o.castShadow; c.add(m); pieces++;
      }
      c.userData = { meuble: { type: T0.type, variante: T0.variante, nom: T0.nom, mural: T0.mural, surPlace: T0.surPlace, voile: T0.voile } };
      c.position.set(P.x, P.y0, P.z); c.rotation.set(0, P.cap, 0); rep.add(c);
    }
    const sources = [];
    game.scene.traverse((o) => { if (o.isMesh && !o.userData.dynamique && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count >= 8 && o.geometry.attributes.position.count <= 40000) sources.push(o); });
    const libres = new THREE.Group();
    let n = 0, s = 0;
    const vus = S.vus || S.libres;
    for (let i = 0; n < vus && sources.length; i++) {
      const o = sources[i % sources.length], m = new THREE.Mesh(o.geometry, o.material);
      o.matrixWorld.decompose(m.position, m.quaternion, m.scale); libres.add(m); n++; s += o.geometry.attributes.position.count;
    }
    rep.add(libres);
    // (la construction ne paie que `fermerRegistre` — ce que les coutures appellent ; le rattrapage, qui achève les prototypes,
    // et les zones sont de l'écran PRÉPARATION : chronométrés à part, ils vérifient que la réplique rend toutes ses poses)
    // (relecture L-K du 23/10 : la réplique vient d'allouer 12 000 objets — le ramasse-miettes qui les suit tombait dans la
    // mesure, une seule, de 15 à 49 ms selon la charge ; deux images pour qu'il passe, puis TROIS rejeux, jugé sur la médiane,
    // le premier noté)
    await jeu.images(2);
    let msPrep = 0, r = null;
    const L = [];
    for (let k = 0; k < 3; k++) {
      r = _bacASable((M) => {
        const t0 = performance.now(); fermerRegistre(rep); L.push(performance.now() - t0);
        const t1 = performance.now(); rattraperRegistre(null); zonerRegistre(game.carte.lumieres, game.collisions); msPrep = performance.now() - t1;
        return { types: M.types.size, poses: M.poses.length };
      });
    }
    const ms = [...L].sort((a, b) => a - b)[1];
    t.note('registre, rattrapage et zones de la réplique (ms, préparation)', msPrep);
    t.note('registre, les trois rejeux (ms)', L.map((v) => +v.toFixed(1)).join(' / '));
    const ok = t.temps('registre (ms, rejoué)', ms, 30) && r.poses === MEUBLES.poses.length;
    return { ok, attendu: '≤ 30 ms (médiane de trois rejeux) · ' + MEUBLES.poses.length + ' poses retrouvées',
      obtenu: `${ms.toFixed(1)} ms à la construction (rejeux ${L.map((v) => v.toFixed(1)).join(' / ')} ; + ${msPrep.toFixed(1)} ms à la préparation) pour ${r.poses} poses (${pieces} maillages étiquetés), ${r.types} types, ${n} maillages libres (${s} sommets ; la construction : ${vus} maillages non étiquetés croisés, ${S.libres} retenus, ${S.coutures} coutures)` };
  }, { delai: 120 });

  // 2. LE REGISTRE HORS DU −1 : types, poses, tailles, oubliés
  T('2 verifierMeubles : ≥ 18 types, ≥ 200 poses, tailles, oubliés', async () => {
    await preparer();
    const v = jeu.verifierMeubles();
    const H = MEUBLES.poses.filter((p) => hors(p.zone)), types = new Set(H.map((p) => MEUBLES.types.get(p.cle).type));
    const tailles = [], justes = [];
    for (const [cle, T0] of MEUBLES.types) {
      const ref = TAILLES[T0.type]; if (!ref) continue;
      const t3 = [T0.taille.x, T0.taille.y, T0.taille.z];
      if (empriseEgale(t3, ref, 0.1)) continue;
      (JUSTIFIES[T0.type] ? justes : tailles).push(`${cle} ${t3.map(r3).join('×')} (réf. ${ref.join('×')})`);
    }
    // les oubliés : ceux de L-M (l'extincteur de l'ascenseur et de la bande sud, js/ecole_ascenseur.js) sont attendus ; tout autre
    // est une faute — et un type qui en garde un dans une zone n'y est pas déguisable
    const LM = (e) => e.type === 'extincteur' && /^extincteur rouge$/.test(e.materiau || '');
    const autres = v.nonEtiquetes.filter((e) => !LM(e));
    const fautes = [];
    for (const z of ['e1', 'e2', 'rdc', 'ecole_int']) {
      const P = piecesDe(z), L = new Set(typesDistincts(z));
      for (const e of v.nonEtiquetes) if (P.has(e.zone) && L.has(e.type)) fautes.push(z + ' ' + e.type);
    }
    const ok = types.size >= 18 && H.length >= 200 && tailles.length === 0 && v.horsTolerance.length === 0 && autres.length === 0 && fautes.length === 0;
    return { ok, attendu: '≥ 18 types, ≥ 200 poses hors du −1, tailles à ± 10 %, horsTolerance vide, oubliés : ceux de L-M seulement, exclus de leur zone',
      obtenu: `${types.size} types, ${H.length} poses hors du −1 (${v.types} clés, ${v.poses} poses en tout) · tailles ${tailles.join(' ; ') || 'justes'} (écarts justifiés au document : ${justes.join(' ; ') || 'aucun'}) · horsTolerance ${JSON.stringify(v.horsTolerance)} · oubliés L-M ${v.nonEtiquetes.filter(LM).map((e) => e.zone + ' (' + r3(e.x) + ' ; ' + r3(e.y) + ' ; ' + r3(e.z) + ')').join(', ') || 'aucun'} · autres ${JSON.stringify(autres)} · fautes ${fautes.join(', ') || 'aucune'}` };
  });

  // 3. LE CATALOGUE : ≤ 600 ms, aucun programme neuf, une copie ≤ 12 appels (haute) ; à la première image des copies, rien
  // que des variantes de PROFONDEUR des objets mobiles non animés (three les dessine lui-même dans la carte d'ombre, une par
  // face — avant, double — et par carte — avec, sans — : 6 au plus ; relecture L-K du 23/10 : 5 relevées onglet caché, 2
  // onglet devant — demande à L-H)
  T('3 preparerCatalogue ≤ 600 ms, 0 programme, une copie ≤ 12 appels (haute)', async (t) => {
    const prog = () => new Set((game.renderer.info.programs || []).map((p) => p.cacheKey));
    const p0 = prog(), t0 = performance.now();
    await preparerCatalogue(game);
    const ms = performance.now() - t0, p1 = prog();
    const fx = game.fx, auto = fx.auto, q0 = fx.quality;
    fx.auto = false; fx.setQuality('high', true);
    const cam = game.camera, u = game.user, appels = [], trop = [];
    game.freeCam = true;
    try {
      // le hall, devant la pile : chaque type déguisable posé à 2,2 m devant la caméra, le fond relevé juste avant (relevé
      // une seule fois, il dérivait de 3 appels en cours de route : toutes les copies d'un coup trop chères)
      const x = 14.9, z = -3.4; u.pos.set(x, 0, z + 0.6); if (u.posAff) u.posAff.copy(u.pos);
      cam.position.set(x, 1.5, z); cam.rotation.set(-0.35, 0, 0, 'YXZ'); cam.aspect = 16 / 9; cam.updateProjectionMatrix();
      await jeu.images(30);
      for (const [cle, T0] of CATALOGUE) {
        if (!T0.deguisable) continue;
        const fond = (await jeu.images(4)).appels;
        const c = T0.secours ? T0.proto.clone(true) : copieMeuble(cle); c.userData.dynamique = true;
        c.position.set(x, 0, z - 2.2); game.scene.add(c);
        await jeu.images(3);
        const a = (await jeu.images(3)).appels - fond;
        game.scene.remove(c);
        appels.push(cle + ' ' + a);
        if (a > 12) trop.push(cle + ' ' + a + ' (' + T0.proto.children.length + ' maillages)');
      }
    } finally { game.freeCam = false; game.placerAuDepart(); fx.setQuality(q0, true); fx.auto = auto; }
    const p2 = prog(), neufs = [...p2].filter((k) => !p1.has(k));
    t.note('programmes de profondeur à la première image d’une copie', neufs.length);
    const ok = t.temps('preparerCatalogue (ms)', ms, 600) && p1.size === p0.size && trop.length === 0 && neufs.every((k) => k.startsWith('depth')) && neufs.length <= 6;
    return { ok, attendu: '≤ 600 ms · 0 programme compilé par le catalogue · chaque copie déguisable ≤ 12 appels en haute (≤ 3 pour un meuble cousu seul : le −1, lot R) · à la première image, au plus 6 variantes de profondeur (objets mobiles)',
      obtenu: `${Math.round(ms)} ms · programmes ${p0.size} → ${p1.size} au catalogue, +${neufs.length} au rendu (${neufs.map((k) => k.split(',').slice(0, 6).join(',')).join(' ; ') || 'aucun'}) · ${trop.length ? 'trop : ' + trop.join(', ') : 'toutes ≤ 12'} · ${appels.join(', ')}` };
  }, { delai: 240 });

  // 4. CHAQUE PROTOTYPE POSÉ À LA PLACE DE SON ORIGINAL : boîtes à ± 1 mm, même programme
  T('4 prototypes à la place de leur original : boîtes ± 1 mm, même programme', async () => {
    await preparer();
    const fautes = [], b = new THREE.Box3(), v = new THREE.Vector3();
    let n = 0;
    for (const [cle, T0] of MEUBLES.types) {
      if (!T0.source) continue;
      const P = MEUBLES.poses[T0.source.i], c = copieMeuble(cle);
      c.position.set(P.x, P.y0, P.z); c.rotation.set(0, P.cap, 0); c.updateMatrixWorld(true);
      b.makeEmpty();
      c.traverse((m) => { if (!m.isMesh || m.material.transparent) return; const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) b.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld)); });
      const e = Math.max(...[...b.min.toArray(), ...b.max.toArray()].map((x, k) => Math.abs(x - [...T0.source.min, ...T0.source.max][k])));
      if (!(e <= 1e-3)) fautes.push(cle + ' ' + (e * 1000).toFixed(2) + ' mm');
      // le programme : la copie compilée pour la cible où la scène est dessinée (Game._compilerAsync, la cible du
      // post-traitement) ne crée AUCUN programme — sa clé est celle d'un programme du décor (le jumeau dédupliqué) — et chacun
      // de ses matériaux en a un de la liste (relecture L-K du 23/10 : relu seulement sur un matériau déjà dessiné, le contrôle
      // passait à vide sur une copie jamais vue)
      const n0 = (game.renderer.info.programs || []).length, pc = game._compilerAsync(c);
      if (pc) await pc;
      const n1 = (game.renderer.info.programs || []).length;
      if (n1 !== n0) fautes.push(cle + ' +' + (n1 - n0) + ' programme(s)');
      c.traverse((m) => {
        if (!m.isMesh) return;
        const pr = game.renderer.properties.get(m.material).currentProgram;
        if (!pr || !(game.renderer.info.programs || []).includes(pr)) fautes.push(cle + ' programme hors liste');
      });
      n++;
    }
    return { ok: fautes.length === 0 && n >= 18, attendu: 'chaque type : boîte de la copie = boîte de l’original à 1 mm ; compilée, 0 programme neuf, chacun de ses matériaux sur un programme existant', obtenu: `${n} types · ${fautes.join(', ') || 'tout juste'}` };
  });

  // 5. DEUX FORMES DIFFÉRENTES sous un même type ne partagent jamais un prototype
  T('5 variantes : une signature par prototype', async () => {
    await preparer();
    const fautes = [], parType = new Map();
    for (const P of MEUBLES.poses) { const T0 = MEUBLES.types.get(P.cle); if (P.empreinte !== T0.empreinte) fautes.push(P.cle + ' pose ' + P.i); }
    for (const [cle, T0] of MEUBLES.types) { if (!parType.has(T0.type)) parType.set(T0.type, new Map()); const m = parType.get(T0.type); if (m.has(T0.empreinte)) fautes.push(cle + ' = ' + m.get(T0.empreinte)); m.set(T0.empreinte, cle); }
    const variantes = [...parType].filter(([, m]) => m.size > 1).map(([t, m]) => t + ' ' + m.size);
    return { ok: fautes.length === 0, attendu: 'chaque pose a l’empreinte de son type ; deux variantes d’un type, deux empreintes', obtenu: `${MEUBLES.poses.length} poses · variantes ${variantes.join(', ')} · ${fautes.slice(0, 8).join(', ') || 'aucune faute'}` };
  });

  // 6. toucherPoses : ≤ 6 µs ; 1 000 rayons vers de vraies poses → 1 000 trouvées ; à 5 cm à côté → 0
  T('6 toucherPoses : 1 000 trouvées, 0 à 5 cm à côté, ≤ 6 µs', async (t) => {
    await preparer();
    const R = new Rng(6), L = MEUBLES.poses, N = 1000;
    let trouvees = 0, justes = 0, faux = 0, essais = 0;
    const rayons = [];
    for (let k = 0; k < N; k++) {
      const P = L[R.int(L.length)];
      // (de 1 à 3 m, au-dessus ou de biais, vers le milieu de sa boîte)
      const cy = (P.y0 + P.y1) / 2, a = R.range(0, 2 * Math.PI), el = R.range(0.5, 1.4), d = R.range(1, 3);
      const o = { x: P.cx + Math.cos(a) * Math.cos(el) * d, y: cy + Math.sin(el) * d, z: P.cz + Math.sin(a) * Math.cos(el) * d };
      const D = { x: P.cx - o.x, y: cy - o.y, z: P.cz - o.z }, l = Math.hypot(D.x, D.y, D.z);
      rayons.push([o.x, o.y, o.z, D.x / l, D.y / l, D.z / l, l + 0.05, P]);
    }
    for (const [ox, oy, oz, dx, dy, dz, tm, P] of rayons) { const r = toucherPoses(ox, oy, oz, dx, dy, dz, tm); if (r) { trouvees++; if (r.pose === P) justes++; } }
    // 5 cm à côté : un rayon vertical le long d'une face, hors de toute boîte — sur TOUTE la hauteur du rayon (F2 : le −1 du lot
    // R empile des meubles, les micro-ondes de l'étagère au-dessus d'un plan ; le rayon, du dessus de P + 0,5 jusqu'à son pied,
    // touchait la boîte d'au-dessus, que le contrôle à mi-hauteur de P ne voyait pas)
    const dehors = (x, z, ya, yb) => !L.some((Q) => Q.y1 > ya - 0.05 && Q.y0 < yb + 0.05 && (() => { const lx = (x - Q.cx) * Q.c + (z - Q.cz) * Q.s, lz = -(x - Q.cx) * Q.s + (z - Q.cz) * Q.c; return Math.abs(lx) <= Q.hx && Math.abs(lz) <= Q.hz; })());
    for (let k = 0; k < N && essais < 4 * N; essais++) {
      const P = L[R.int(L.length)], c = Math.cos(P.cap), s = Math.sin(P.cap), sx = R.next() < 0.5 ? 1 : -1;
      const lx = sx * (P.hx + 0.05), x = P.cx + lx * c, z = P.cz - lx * s;
      if (!dehors(x, z, P.y0, P.y1 + 0.5)) continue;
      k++;
      if (toucherPoses(x, P.y1 + 0.5, z, 0, -1, 0, P.y1 - P.y0 + 0.5)) faux++;
    }
    const t0 = performance.now();
    for (let rep = 0; rep < 5; rep++) for (const [ox, oy, oz, dx, dy, dz, tm] of rayons) toucherPoses(ox, oy, oz, dx, dy, dz, tm);
    const us = (performance.now() - t0) * 1000 / (5 * N);
    const ok = trouvees === N && faux === 0 && t.temps('toucherPoses (µs)', us, 6);
    return { ok, attendu: '1 000 trouvées · 0 à 5 cm à côté · ≤ 6 µs', obtenu: `${trouvees} trouvées (${justes} la pose visée) · ${faux} à côté · ${us.toFixed(2)} µs` };
  });

  // 7. LA CRÉDIBILITÉ : six situations, toutes sur des poses LIBRES au rayon et dans la bande du type
  T('7 crédibilité : six situations', async () => {
    await preparer();
    const fautes = [], notes = [];
    const cas = (nom, cle, x, y, z, cap, zone, borne, sens) => {
      const T0 = typeDe(cle); if (!T0) { fautes.push(nom + ' : pas de type ' + cle); return; }
      if (!libreT(T0, x, y, z) || !coinsLibres(C(), T0, x, y, z, cap)) { fautes.push(nom + ' : pose pas libre'); return; }
      const v = credibilite(cle, x, y, z, cap, zone);
      notes.push(`${nom} ${v.toFixed(2)}`);
      if (sens > 0 ? v < borne : v > borne) fautes.push(`${nom} ${v.toFixed(2)} (${sens > 0 ? '≥' : '≤'} ${borne})`);
    };
    // (a, f) la chaise coque au BOUT de sa rangée : au-delà d'une chaise, à l'opposé de sa voisine, au pas de la rangée — une
    // place libre (au rayon, dans la bande, coins compris) et hors de toute vraie chaise
    const coques = MEUBLES.poses.filter((p) => MEUBLES.types.get(p.cle).type === 'chaise-coque');
    let bout = null;
    for (const P of coques) {
      if (bout || !(P.pas > 0)) continue;
      const Q = coques.filter((q) => q !== P && q.zone === P.zone).sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z))[0];
      if (!Q) continue;
      const d = Math.hypot(P.x - Q.x, P.z - Q.z), x = P.x + (P.x - Q.x) / d * P.pas, z = P.z + (P.z - Q.z) / d * P.pas, T0 = MEUBLES.types.get(P.cle);
      if (!libreT(T0, x, P.y, z) || !coinsLibres(C(), T0, x, P.y, z, P.cap)) continue;
      if (MEUBLES.poses.some((q) => q !== P && Math.hypot(q.cx - x, q.cz - z) < 0.5)) continue;
      bout = { P, x, z };
    }
    if (bout) {
      cas('chaise coque au bout de sa rangée', bout.P.cle, bout.x, bout.P.y, bout.z, bout.P.cap, bout.P.zone, 0.8, 1);
      cas('la même tournée de 90°', bout.P.cle, bout.x, bout.P.y, bout.z, bout.P.cap + Math.PI / 2, bout.P.zone, 0.5, -1);
      // (b) la même au milieu d'un couloir (le couloir est, à son point d'apparition, loin de tout)
      const p = POINTS_APPARITION.find((q) => q.zone === 'couloirEst');
      cas('chaise coque au milieu du couloir', bout.P.cle, p.x, p.y, p.z, 0, 'couloirEst', 0.25, -1);
    } else fautes.push('pas de bout de rangée libre');
    // (c) le Miura du 1er contre un mange-debout (le Tolix du −1 attend le lot R)
    const md = MEUBLES.poses.filter((p) => MEUBLES.types.get(p.cle).type === 'mange-debout-croix');
    const mi = MEUBLES.poses.find((p) => MEUBLES.types.get(p.cle).type === 'tabouret-miura' && p.zone === 'e1pause');
    let fait = false;
    for (const M of md) for (let k = 0; k < 16 && !fait; k++) {
      const a = k * Math.PI / 8, d = 0.62, x = M.cx + Math.sin(a) * d, z = M.cz + Math.cos(a) * d, cap = Math.atan2(M.cx - x, M.cz - z);
      if (mi && libreT(MEUBLES.types.get(mi.cle), x, M.y, z) && !MEUBLES.poses.some((q) => q !== M && Math.hypot(q.cx - x, q.cz - z) < 0.45)) { cas('Miura contre une table', mi.cle, x, M.y, z, cap, M.zone, 0.7, 1); fait = true; }
    }
    if (!fait) fautes.push('pas de place libre contre un mange-debout');
    // (d, e) le distributeur de café contre un mur de l'espace pause du 1er, puis au milieu de la pièce
    const di = MEUBLES.poses.find((p) => MEUBLES.types.get(p.cle).type === 'distributeur-cafe');
    if (di) {
      const T0 = MEUBLES.types.get(di.cle);
      let mur = null, milieu = null;
      for (let x = 6; x < 15 && !(mur && milieu); x += 0.25) for (let z = -12.5; z < -5 && !(mur && milieu); z += 0.25) {
        if (!libreT(T0, x, 3.5, z) || game.carte.lumieres.zoneEn(x, z, 3.6)?.id !== 'e1pause') continue;
        for (const cap of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
          if (!coinsLibres(C(), T0, x, 3.5, z, cap)) continue;
          const dos = T0.dos + 0.08, dx = -Math.sin(cap), dz = -Math.cos(cap);
          const f = C().rayonLibre(x, 4.2, z, x + dx * dos, 4.2, z + dz * dos, 0);
          if (!mur && f < 1 && Math.hypot(x - di.x, z - di.z) > 2.2 && distPassage(x, 3.5, z) > 1) mur = { x, z, cap };
          if (!milieu && C().libre(x, z, 1.3, 3.5) && Math.hypot(x - di.x, z - di.z) > 2.2) milieu = { x, z, cap };
        }
      }
      if (mur) cas('distributeur contre un mur', di.cle, mur.x, 3.5, mur.z, mur.cap, 'e1pause', 0.7, 1); else fautes.push('pas de mur libre');
      if (milieu) cas('distributeur au milieu de la pièce', di.cle, milieu.x, 3.5, milieu.z, milieu.cap, 'e1pause', 0.3, -1); else fautes.push('pas de milieu libre');
    } else fautes.push('pas de distributeur de café');
    return { ok: fautes.length === 0 && notes.length === 6, attendu: 'bout de rangée ≥ 0,8 · couloir ≤ 0,25 · contre une table ≥ 0,7 · contre un mur ≥ 0,7 · milieu ≤ 0,3 · tournée de 90° ≤ 0,5',
      obtenu: notes.join(' · ') + (fautes.length ? ' · FAUTES ' + fautes.join(', ') : '') };
  });

  // 8. LE CORPS DES PROPS : 100 trajets par type déguisable → 0 traversée, 0 dans un mur ; sous une table ; « Pas la place »
  // (une TRAVERSÉE : le segment d'un pas coupe une forme du JOUEUR — celles que heurte le corps ; les marches d'escalier,
  // formes de la caméra seule, ne comptent pas — à une hauteur de la bande du corps où elle s'élève ; DANS UN MUR : plus de
  // 0,2 s d'affilée à moins de 80 % de son rayon d'une forme, comme la surveillance du harnais)
  const traverse = (Cc, ax, az, bx, bz, pieds, bas, haut) => {
    let coupe = false;
    Cc._parcourir(Math.min(ax, bx) - 0.01, Math.min(az, bz) - 0.01, Math.max(ax, bx) + 0.01, Math.max(az, bz) + 0.01, (f) => {
      if (coupe || f.off || !f.joueur) return;
      for (const h of [bas + 0.01, (bas + haut) / 2, haut - 0.01]) if (Cc._segment(f, ax, pieds + h, az, bx - ax, 0, bz - az, 0) < 1) { coupe = true; return; }
    });
    return coupe;
  };
  T('8 CorpsProp : 100 trajets par type, sous une table, pas la place', async () => {
    await preparer();
    const Cc = C(), R = new Rng(19), types = [...CATALOGUE.values()].filter((T0) => T0.deguisable && !T0.secours), bilan = [], Lu = game.carte.lumieres;
    let tr = 0, mur = 0, pas = 0;
    const departs = POINTS_APPARITION.filter((p) => p.zone !== 'rue');
    const partie = { evt() {}, game, acteurs: [] };
    for (const T0 of types) {
      let t1 = 0, m1 = 0;
      for (let k = 0; k < 100; k++) {
        // un départ libre DANS la pièce d'un lieu d'apparition
        let x, y, z, ok = false;
        for (let e = 0; e < 40 && !ok; e++) {
          const p = departs[R.int(departs.length)]; x = p.x + R.range(-2.5, 2.5); z = p.z + R.range(-2.5, 2.5); y = Cc.solEn(x, z, p.y + 0.3);
          const Z = Lu.zoneEn(x, z, y + 0.1);
          ok = Math.abs(y - p.y) < 0.3 && Z && Z.id === p.zone && Cc.libre(x, z, T0.rayon, y, T0.bande.haut, T0.bande.bas);
        }
        if (!ok) continue;
        const c = new CorpsProp(Cc, { rayon: T0.rayon, haut: T0.bande.haut, bas: T0.bande.bas, bounds: null }); c.porter(T0);
        c.pos.set(x, y, z); c.posPrec.copy(c.pos);
        const a = { id: k, corps: c, prop: { T: T0, cap: 0, fige: false, verrou: false }, endurance: 100 }, cmd = creerCommande();
        let dedans = 0;
        for (let s = 0; s < 180; s++) {
          if (s % 60 === 0) { cmd.lacet = R.range(-Math.PI, Math.PI); cmd.ay = 1; cmd.ax = R.range(-1, 1); cmd.sprint = R.next() < 0.5; cmd.saut = R.next() < 0.1; } else cmd.saut = false;
          const px = c.pos.x, pz = c.pos.z, py = c.pos.y + c.jumpY;
          deplacerProp(a, cmd, PAS, partie); pas++;
          if (Math.hypot(c.pos.x - px, c.pos.z - pz) > 1e-4 && traverse(Cc, px, pz, c.pos.x, c.pos.z, Math.min(py, c.pos.y + c.jumpY), c.bas, c.haut)) t1++;
          dedans = Cc.libre(c.pos.x, c.pos.z, c.rayon * 0.8, c.pos.y + c.jumpY, c.haut, c.bas) ? 0 : dedans + 1;
          if (dedans === 25) m1++;
        }
      }
      tr += t1; mur += m1;
      if (t1 || m1) bilan.push(`${T0.cle} ${t1} traversées, ${m1} fois dans un mur`);
    }
    // SOUS UNE TABLE : la corbeille (bande 0,14-0,5) file sous un plateau — un tabouret, non
    const sous = sousUneTable(Cc);
    // PAS LA PLACE : un meuble long (le baby-foot du −1, 1,05 × 0,93 × 1,48, sur place) refusé dans une porte de 0,8 m
    const porte = pasLaPlace(Cc);
    const ok = tr === 0 && mur === 0 && sous.ok && porte.ok;
    return { ok, attendu: '0 traversée, 0 dans un mur ; la corbeille sous une table, le tabouret non ; le baby-foot refusé dans une porte de 0,8 m',
      obtenu: `${types.length} types, ${pas} pas · ${bilan.join(' ; ') || '0 traversée, 0 dans un mur'} · ${sous.texte} · ${porte.texte}` };
  }, { delai: 300 });
  // (une table dont le plateau est une forme à lui : la corbeille passe dessous, un tabouret Miura non)
  function sousUneTable(Cc) {
    const cor = [...CATALOGUE.values()].find((T0) => T0.type === 'corbeille'), mi = [...CATALOGUE.values()].find((T0) => T0.type === 'tabouret-miura');
    if (!cor || !mi) return { ok: false, texte: 'pas de corbeille ou de Miura' };
    const essayer = (f, sol, quoi) => {
      // de part et d'autre de la table, le long de x, au sol
      const z = (f.z0 + f.z1) / 2, x0 = f.x0 - 0.4, x1 = (f.x0 + f.x1) / 2, dessous = f.y0 - sol;
      if (!Cc.libre(x0, z, cor.rayon, sol, cor.bande.haut, cor.bande.bas) || !Cc.libre(x1, z, cor.rayon, sol, cor.bande.haut, cor.bande.bas)) return null;
      const essai = (T0) => {
        const c = new CorpsProp(Cc, {}); c.porter(T0); c.pos.set(x0, sol, z); c.posPrec.copy(c.pos);
        const a = { id: 0, corps: c, prop: { T: T0, cap: 0, fige: false, verrou: false }, endurance: 100 }, cmd = creerCommande();
        cmd.lacet = -Math.PI / 2; cmd.ay = 1;                     // (vers +x)
        for (let s = 0; s < 120; s++) deplacerProp(a, cmd, PAS, { evt() {}, game });
        return c.pos.x;
      };
      const xc = essai(cor), xm = essai(mi);
      const ok = xc > f.x0 + 0.1 && xm < f.x0 + 0.05;
      return { ok, texte: `sous ${quoi} (${r3((f.x0 + f.x1) / 2)} ; ${r3(z)}, plateau ${r3(dessous)} m) : corbeille jusqu’en x ${r3(xc)}, Miura arrêté en ${r3(xm)} (bord ${r3(f.x0)})` };
    };
    for (const f of Cc.formes) {
      if (f.off || !f.joueur || f.t !== 'b' || !Number.isFinite(f.y1)) continue;
      const sol = Cc.solEn((f.x0 + f.x1) / 2, (f.z0 + f.z1) / 2, f.y0 + 0.1);
      const dessous = f.y0 - sol, ep = f.y1 - f.y0;
      if (dessous < 0.55 || dessous > 0.8 || ep > 0.15 || f.x1 - f.x0 < 0.6 || f.z1 - f.z0 < 0.5) continue;
      const r = essayer(f, sol, 'la table'); if (r) return r;
    }
    // (F2 : le −1 du lot R n'a plus de table à plateau seul — ses meubles sont des boîtes pleines, mange-debout et tables
    // hautes —, ni le reste de l'école : un plateau d'essai de 1 × 0,7 m à 0,70 m, posé le temps du test dans la rue, puis
    // retiré — dernière forme du monde, les autres gardent leur rang)
    const x0 = 6, z0 = 4.2, sol = Cc.solEn(6.5, 4.55, 0.3), n0 = Cc.formes.length, cles = new Set(Cc.grille.keys());
    const f = Cc.ajouterBoite(x0, z0, x0 + 1, z0 + 0.7, { y0: sol + 0.7, y1: sol + 0.74 });
    try { return essayer(f, sol, 'un plateau d’essai') || { ok: false, texte: 'aucune table à plateau seul, plateau d’essai pas libre' }; }
    finally {
      Cc.formes.length = n0;
      for (const [k, Lg] of Cc.grille) { const i = Lg.indexOf(f); if (i >= 0) Lg.splice(i, 1); if (!Lg.length && !cles.has(k)) Cc.grille.delete(k); }
    }
  }
  function pasLaPlace(Cc) {
    // le baby-foot d'essai (aux cotes de carte_props § 2), le temps du test
    const bf = typeDe('carton'), T0 = { ...bf, cle: 'baby-foot-essai', type: 'baby-foot', nom: 'le baby-foot', secours: false, deguisable: true, surPlace: true,
      boite: new THREE.Box3(new THREE.Vector3(-0.525, 0, -0.74), new THREE.Vector3(0.525, 0.93, 0.74)), taille: new THREE.Vector3(1.05, 0.93, 1.48), rayon: 0.5, haut: 0.93,
      bande: { bas: 0.25, haut: 0.93 } };
    // une porte de 0,8 m : parmi les passages d'une pièce à l'autre, celui dont l'ouverture libre (le plus grand disque qui y
    // tient, au pas du centimètre) est la plus proche de 0,8 m — (relecture L-K du 23/10 : le premier de 0,6 à 0,9 m était une
    // porte de 0,60 m) ; et la corbeille, elle, y passe (sinon c'est la porte qui serait fermée, pas le baby-foot trop grand)
    let porte = null;
    for (const p of PASSAGES_PIECES) {
      const y = Cc.solEn(p.x, p.z, p.y + 0.3);
      if (Math.abs(y - p.y) > 0.3 || !Cc.libre(p.x, p.z, 0.2, y)) continue;
      let w = 0.2; while (w < 0.6 && Cc.libre(p.x, p.z, w + 0.01, y)) w += 0.01;
      if (w >= 0.35 && w <= 0.45 && (!porte || Math.abs(2 * w - 0.8) < Math.abs(2 * porte.w - 0.8))) porte = { p, y, w };
    }
    if (!porte) return { ok: false, texte: 'pas de porte de 0,8 m trouvée' };
    const { p, y, w } = porte, cor = [...CATALOGUE.values()].find((U) => U.type === 'corbeille');
    CATALOGUE.set(T0.cle, T0);
    try {
      const essai = (cle) => {
        const partie = { zone: 'ecole', game, evt(t, d) { this.dernier = { t, ...d }; }, acteurs: [] };
        const c = new CorpsProp(Cc, {}); c.pos.set(p.x, y, p.z);
        const a = { id: 0, corps: c, prop: null, vie: 100, vieMax: 100, changerCorps() {} };
        return { r: deguiser(partie, a, cle), raison: partie.dernier && partie.dernier.raison };
      };
      const bf = essai(T0.cle), co = cor ? essai(cor.cle) : { r: false };
      return { ok: bf.r === false && bf.raison === 'place' && co.r === true,
        texte: `porte de ${(2 * w).toFixed(2)} m (${p.a} | ${p.b}) : baby-foot ${bf.r ? 'accepté' : 'refusé (' + bf.raison + ')'}, corbeille ${co.r ? 'acceptée' : 'refusée'}` };
    } finally { CATALOGUE.delete(T0.cle); }
  }

  // 9. SE DÉGUISER : refusé sans la place (rien ne change), PV en proportion à ± 1, 'deguise'
  T('9 deguiser : refus sans la place, PV en proportion, deguise', async () => {
    await preparer();
    const p = await essaiProp('rdc'), a = p.local, Cc = C(), ev = [];
    const des = p.sur('*', (e) => { if (e.type === 'deguise' || e.type === 'refus') ev.push(e.type + ':' + (e.raison || e.cle)); });
    const petit = [...CATALOGUE.values()].find((T0) => T0.type === 'corbeille'), grand = [...CATALOGUE.values()].find((T0) => T0.type === 'chaise-coque');
    // un coin où la corbeille tient et la chaise coque non
    let coin = null;
    for (let x = 4; x < 12 && !coin; x += 0.05) for (const z of [-4.9, -5.4, -6.3, -7.0]) {
      const y = Cc.solEn(x, z, 0.3);
      if (Math.abs(y) < 0.05 && Cc.libre(x, z, petit.rayon, y, petit.bande.haut, petit.bande.bas) && !Cc.libre(x, z, grand.rayon, y, grand.bande.haut, grand.bande.bas)) { coin = { x, y, z }; break; }
    }
    let r1 = null, r2 = null, r3b = null, pv = null;
    if (coin) {
      placer(a, coin.x, coin.y, coin.z);
      r1 = deguiser(p, a, petit.cle);
      // (touché comme par une balle : Partie.infliger entame la VIE, pas `prop.pv` — relecture L-K du 23/10 : la proportion
      // lue sur `prop.pv` rendait toute sa vie à un prop touché qui changeait de forme)
      a.protegeT = 0; p.infliger(a, Math.round(a.vieMax * 0.5), { par: -1, zone: 'torse' });
      const k = a.vie / a.vieMax;
      const avant = JSON.stringify({ cle: a.prop.cle, vie: a.vie, x: a.corps.pos.x, z: a.corps.pos.z, r: a.corps.rayon });
      r2 = deguiser(p, a, grand.cle);
      const apres = JSON.stringify({ cle: a.prop.cle, vie: a.vie, x: a.corps.pos.x, z: a.corps.pos.z, r: a.corps.rayon });
      // au large : accepté, PV en proportion
      placer(a, 11.63, 0, -4.62);
      r3b = deguiser(p, a, grand.cle);
      pv = { attendu: Math.round(grand.pv * k), obtenu: a.vie, inchange: avant === apres };
    }
    des();
    jeu.quitter('balade');
    const ok = !!coin && r1 === true && r2 === false && pv && pv.inchange && r3b === true && Math.abs(pv.obtenu - pv.attendu) <= 1
      && ev.filter((e) => e.startsWith('deguise')).length === 2 && ev.includes('refus:place');
    return { ok, attendu: 'refus sans la place (rien ne change) · PV gardés en proportion à ± 1 · un « deguise » par déguisement',
      obtenu: coin ? `coin (${r3(coin.x)} ; ${r3(coin.z)}) · corbeille ${r1} · chaise coque ${r2} (inchangé ${pv.inchange}) · au large ${r3b}, PV ${pv.obtenu} pour ${pv.attendu} · événements ${ev.join(', ')}` : 'pas de coin trouvé' };
  });

  // 10. LES CACHETTES du 1er : par lots ≤ 5 ms, ≥ 30 notées, chacune libre au rayon et dans la bande de son type
  T('10 cachettes(e1) : lots ≤ 5 ms, ≥ 30, toutes libres', async (t) => {
    await preparer();
    const nav = await Nav.obtenir(game, { rayon: 0.2, franchir: false });
    const g = cachettes('e1', nav), lots = [];
    let r, L = null;
    for (;;) { const t0 = performance.now(); r = g.next(); lots.push(performance.now() - t0); if (r.done) { L = r.value; break; } }
    const pire = Math.max(...lots), dedans = L.filter((k) => { const T0 = typeDe(k.cle); return !libreT(T0, k.x, k.y, k.z); });
    const types = new Set(L.map((k) => typeDe(k.cle).type)), bonnes = L.filter((k) => k.cred >= 0.6).length;
    t.note('cachettes e1', L.length);
    const ok = t.temps('cachettes, pire lot (ms)', pire, 5) && L.length >= 30 && dedans.length === 0 && L.every((k) => Number.isFinite(k.cred) && Number.isFinite(k.couverture));
    return { ok, attendu: 'lots ≤ 5 ms · ≥ 30 cachettes notées · 0 dans une forme',
      obtenu: `${L.length} cachettes (${types.size} types, ${bonnes} de crédibilité ≥ 0,6) en ${lots.length} lots, pire ${pire.toFixed(2)} ms · ${dedans.length} dans une forme` };
  }, { delai: 120 });

  // 11. L'AFFICHAGE DES PROPS : jamais penché, un voile (aucun en plus pour la chaise coque), flash sans programme neuf ; un
  // extincteur plaqué au verrou : tourné comme les vrais de son mur, pendu à leur hauteur — la racine affichée ET son volume de
  // touche —, sans voile
  T('11 majProps : racine droite, voile, flash sans programme, extincteur accroché', async () => {
    await preparer();
    const p = await essaiProp('rdc'), a = p.local, fautes = [];
    const coque = [...CATALOGUE.values()].find((T0) => T0.type === 'chaise-coque'), autre = [...CATALOGUE.values()].find((T0) => T0.type === 'chaise-dc');
    const transparents = (R) => { let n = 0; R.traverse((m) => { if (m.isMesh && m.material.transparent) n++; }); return n; };
    for (const T0 of [autre, coque]) {
      placer(a, 11.63, 0, -4.62, 0.3);
      if (!deguiser(p, a, T0.cle)) { fautes.push('déguisement refusé ' + T0.cle); continue; }
      jeu.commande(0, { ay: 1, lacet: 1.2, sprint: true, saut: true }, 0.6); jeu.avancer(0.6);
      await jeu.images(3);
      const R = a.prop.racine;
      if (!R || R.parent !== game.scene || !R.userData.dynamique) { fautes.push('racine absente ou pas à la racine'); continue; }
      if (R.rotation.x !== 0 || R.rotation.z !== 0) fautes.push(`${T0.cle} penché ${R.rotation.x} / ${R.rotation.z}`);
      const n = transparents(R);
      if (n !== 1) fautes.push(`${T0.cle} : ${n} maillages transparents (un voile attendu)`);
      if (T0.voile === false && R.userData.voile) fautes.push('un voile de plus sur ' + T0.cle);
    }
    // le flash rouge d'une touche : aucun programme neuf
    const prog = () => (game.renderer.info.programs || []).length, p0 = prog();
    p.evt('touche', { par: 9, cible: 0, zone: 'torse', degats: 10, x: a.pos.x, y: a.pos.y, z: a.pos.z, tete: false, dx: 0, dz: 1 });
    // (le flash dure 80 ms : vu à l'image qui suit — relevé après 4 images, il était fini dès que l'onglet tournait à 30 im/s)
    await jeu.images(1);
    const rouge = (a.prop.racine.userData.mats || []).some((m) => m.emissive && m.emissive.r > 0.5);
    await jeu.images(8);
    const p1 = prog();
    const accroches = await extincteursAccroches(p, a);
    jeu.quitter('balade');
    const enfants = game.scene.children.filter((o) => o.name && o.name.startsWith('prop ')).length;
    const ok = fautes.length === 0 && rouge && p1 === p0 && enfants === 0 && accroches.ok;
    return { ok, attendu: 'roulis et tangage 0 · un seul maillage transparent (le voile ; celui de la chaise coque est le sien) · flash rouge vu, 0 programme · racines retirées à la sortie · chaque extincteur pendu du RDC plaqué près du vrai : son cap, sa hauteur (affichée et touchable), pas de voile',
      obtenu: `${fautes.join(', ') || 'droites, un voile chacune'} · flash ${rouge ? 'rouge' : 'pas vu'}, programmes ${p0} → ${p1} · ${enfants} racine(s) restée(s) · ${accroches.texte}` };
  });

  // (chaque type d'extincteur qui PEND au mur, au RDC : le prop posé à 0,5-0,8 m d'un vrai, le long de son mur, tourné de 17°
  // de trop — l'aimant le redresse — puis de 34° — l'aimant n'y peut rien, la normale du mur si ; verrouillé 1 s, il doit
  // s'être plaqué au même mur, au cap du vrai — la façade, `face`, de l'étiquette —, à sa hauteur d'accroche : la racine
  // affichée ET la boîte de touche (js/jeu/touches.js capsules) ; et sans voile au sol)
  async function extincteursAccroches(p, a) {
    const Cc = C(), fautes = [], vus = [];
    const L = MEUBLES.poses.filter((P) => P.zone && piecesDe('rdc').has(P.zone) && MEUBLES.types.get(P.cle).type === 'extincteur' && MEUBLES.types.get(P.cle).accroche > 0.1);
    const parCle = new Map(); for (const P of L) if (!parCle.has(P.cle)) parCle.set(P.cle, P);
    for (const [cle, P] of parCle) {
      const T0 = MEUBLES.types.get(cle), ux = Math.cos(P.cap), uz = -Math.sin(P.cap), fx = Math.sin(P.cap), fz = Math.cos(P.cap);
      let pt = null;
      for (const d of [0.5, -0.5, 0.65, -0.65, 0.8, -0.8]) for (const f of [0.3, 0.4]) {
        const x = P.x + ux * d + fx * f, z = P.z + uz * d + fz * f;
        if (!pt && Math.abs(Cc.solEn(x, z, P.y + 0.3) - P.y) < 0.05 && Cc.libre(x, z, T0.rayon, P.y, T0.bande.haut, T0.bande.bas) && coinsLibres(Cc, T0, x, P.y, z, P.cap)) pt = { x, z };
      }
      if (!pt) { fautes.push(cle + ' : pas de place à côté'); continue; }
      for (const de of [0.3, 0.6]) {
        if (a.prop && a.prop.verrou) { a.prop.verrou = false; jeu.avancer(0.05); }
        placer(a, pt.x, P.y, pt.z, P.cap + de);
        if (!deguiser(p, a, cle)) { fautes.push(cle + ' refusé'); continue; }
        placer(a, pt.x, P.y, pt.z, P.cap + de);
        a.prop.verrou = true; jeu.avancer(1);
        await jeu.images(2);
        const c = a.corps, R = a.prop.racine, e = Math.abs(Math.atan2(Math.sin(c.ang - P.cap), Math.cos(c.ang - P.cap)));
        const V = capsules(a, [])[0], vo = R && R.userData.voile;
        const ry0 = R.position.y, bas = V ? V.cy - V.hy : NaN;
        vus.push(`${cle} (tourné de ${Math.round(de * 180 / Math.PI)}°) cap ${(e * 180 / Math.PI).toFixed(1)}° · pendu à ${r3(c.jumpY)} (vrai ${r3(P.y0 - P.y)}) · touche dès ${r3(bas - P.y)}`);
        if (!c.plaque) fautes.push(cle + ' pas plaqué');
        if (e > 0.05) fautes.push(`${cle} tourné de ${(e * 180 / Math.PI).toFixed(1)}° par rapport au vrai`);
        if (Math.abs(ry0 - P.y0) > 0.05 || Math.abs(c.jumpY - T0.accroche) > 1e-6) fautes.push(`${cle} affiché à ${r3(ry0)} au lieu de ${r3(P.y0)}`);
        if (!V || Math.abs(bas - ry0) > 0.02) fautes.push(`${cle} : la boîte de touche commence à ${r3(bas)}, le meuble à ${r3(ry0)}`);
        if (vo && vo.visible) fautes.push(cle + ' : un voile sous un meuble pendu');
      }
    }
    if (a.prop) a.prop.verrou = false;
    return { ok: fautes.length === 0 && vus.length >= 4, texte: (vus.join(' ; ') || 'aucun extincteur pendu') + (fautes.length ? ' · FAUTES ' + fautes.join(', ') : '') };
  }

  // 12. VISER UN MEUBLE : 20 cas (à 2,5 m → trouvé ; derrière un mur → null ; à 3,5 m → null)
  T('12 viserMeuble : 20 cas', async () => {
    await preparer();
    const p = await essaiProp('e1'), a = p.local, Cc = C(), R = new Rng(12), res = { trouve: 0, mur: 0, loin: 0 }, fautes = [];
    placer(a, 12.63, 3.5, -7.87);
    deguiser(p, a, [...CATALOGUE.values()].find((T0) => T0.type === 'corbeille' || T0.secours).cle);
    const cibles = posesDe('e1').filter((P) => deguisableDans(MEUBLES.types.get(P.cle), 'e1'));
    const viser = (x, z, P) => {
      placer(a, x, P.y, z, 0);
      const o = pivotDe(a), cy = (P.y0 + P.y1) / 2, dx = P.cx - o.x, dy = cy - o.y, dz = P.cz - o.z;
      const l = Math.atan2(-dx, -dz), t = Math.atan2(-dy, Math.hypot(dx, dz));
      return { v: viserMeuble(p, a, l, t), o, l, t, d: Math.hypot(dx, dy, dz), dir: [dx, dy, dz] };
    };
    for (let k = 0; k < 4000 && (res.trouve < 10 || res.mur < 5 || res.loin < 5); k++) {
      const P = cibles[R.int(cibles.length)], ang = R.range(0, 2 * Math.PI);
      const quoi = res.trouve < 10 ? 'trouve' : res.mur < 5 ? 'mur' : 'loin', d = quoi === 'loin' ? 3.5 : quoi === 'mur' ? R.range(1.6, 2.7) : 2.5;
      const x = P.cx + Math.sin(ang) * d, z = P.cz + Math.cos(ang) * d, y = Cc.solEn(x, z, P.y + 0.3);
      if (Math.abs(y - P.y) > 0.05 || !Cc.libre(x, z, 0.3, y)) continue;
      // (la ligne libre jusqu'à l'ENTRÉE dans la boîte du meuble, moins 9 cm : sa propre forme l'enveloppe à quelques centimètres)
      const tmp = viser(x, z, P), u = tmp.dir.map((q) => q / tmp.d);
      const premiere = toucherPoses(tmp.o.x, tmp.o.y, tmp.o.z, u[0], u[1], u[2], tmp.d + 0.5), L = Math.max(0, (premiere ? premiere.t : tmp.d) - 0.09);
      const libre = Cc.rayonLibre(tmp.o.x, tmp.o.y, tmp.o.z, tmp.o.x + u[0] * L, tmp.o.y + u[1] * L, tmp.o.z + u[2] * L, 0) >= 1 - 1e-6;
      if (quoi === 'trouve') {
        if (!libre || !premiere || premiere.pose !== P) continue;
        res.trouve++; if (!tmp.v || tmp.v.pose !== P) fautes.push(`à 2,5 m de ${P.cle} : ${tmp.v ? tmp.v.cle : 'null'}`);
      } else if (quoi === 'mur') {
        // un mur entre les deux (le rayon arrêté à plus de 0,3 m avant le meuble)
        const f = Cc.rayonLibre(tmp.o.x, tmp.o.y, tmp.o.z, tmp.o.x + u[0] * L, tmp.o.y + u[1] * L, tmp.o.z + u[2] * L, 0);
        if (f * L > L - 0.3 || Math.hypot(x - P.cx, z - P.cz) >= 2.9 || !premiere || premiere.pose !== P) continue;
        res.mur++; if (tmp.v) fautes.push(`derrière un mur, ${P.cle} trouvé`);
      } else {
        if (!libre) continue;
        res.loin++; if (tmp.v && tmp.v.pose === P) fautes.push(`à 3,5 m, ${P.cle} trouvé`);
      }
    }
    jeu.quitter('balade');
    const ok = res.trouve === 10 && res.mur === 5 && res.loin === 5 && fautes.length === 0;
    return { ok, attendu: '10 trouvés à 2,5 m · 5 derrière un mur → null · 5 à 3,5 m → null', obtenu: `${res.trouve} / ${res.mur} / ${res.loin} cas · ${fautes.join(', ') || 'tous justes'}` };
  });

  // 13. LES ZONES : sans le lot R le −1 a moins de 6 types (noté), le 2e aussi ; le 1er (repli) au moins 6
  T('13 typesDeguisables : ss < 6 (sans le lot R), e2 < 6, e1 ≥ 6', async () => {
    await preparer();
    const n = (z) => ({ cles: typesDeguisables(z), types: typesDistincts(z) });
    const ss = n('ss'), e2 = n('e2'), e1 = n('e1'), rdc = n('rdc');
    const loteR = MEUBLES.poses.some((P) => P.zone && piecesDe('ss').has(P.zone));
    const ok = (loteR || ss.types.length < 6) && e2.types.length < 6 && e1.types.length >= 6 && e1.cles.length >= e1.types.length;
    const t = (o) => `${o.types.length} types (${o.cles.length} clés) [${o.types.join(', ')}]`;
    return { ok, attendu: 'types distincts : ss < 6 sans le lot R · e2 < 6 · e1 ≥ 6', obtenu: `ss ${t(ss)}${loteR ? ' (lot R là)' : ''} · e2 ${t(e2)} · e1 ${t(e1)} · rdc ${t(rdc)}` };
  });

  // 14. CE QUE VOIT UN CHASSEUR : un prop parmi de vrais meubles de son type est indiscernable ; ≤ 0,05 ms pour 10 m
  T('14 candidatsMeubles : prop indiscernable, ≤ 0,05 ms', async (t) => {
    await preparer();
    const p = await essaiProp('rdc'), a = p.local;
    const vrais = MEUBLES.poses.filter((P) => MEUBLES.types.get(P.cle).type === 'chaise-dc');
    const T0 = MEUBLES.types.get(vrais[0].cle);
    const cache = [...cachettes('rdc', null)].flat().find((k) => k.cle === T0.cle) || null;
    let ok = false, texte = 'pas de cachette de chaise moutarde';
    if (cache) {
      placer(a, cache.x, cache.y, cache.z, cache.cap);
      deguiser(p, a, T0.cle);
      const L = candidatsMeubles(p, cache.x, cache.y, cache.z, 10, []);
      const lui = L.find((c) => _refEstActeur(c.ref)), autres = L.filter((c) => c !== lui);
      const cles = (o) => Object.keys(o).sort().join(','), types = (o) => Object.values(o).map((v) => typeof v).join(',');
      const memes = autres.filter((c) => c.cle === T0.cle);
      const schema = lui && autres.every((c) => cles(c) === cles(lui) && types(c) === types(lui));
      const refs = L.map((c) => c.ref), opaques = refs.every((r) => Number.isInteger(r) && r > 1000) && new Set(refs).size === refs.length;
      const t0 = performance.now(); for (let k = 0; k < 1000; k++) candidatsMeubles(p, cache.x, cache.y, cache.z, 10, L);
      const ms = (performance.now() - t0) / 1000;
      ok = !!lui && memes.length >= 3 && schema && opaques && lui.cle === T0.cle && t.temps('candidatsMeubles 10 m (ms)', ms, 0.05);
      texte = `${L.length} candidats dont le prop et ${memes.length} vraies chaises moutarde · mêmes champs ${schema} · refs opaques ${opaques} · ${ms.toFixed(4)} ms`;
    }
    jeu.quitter('balade');
    return { ok, attendu: 'le prop parmi ≥ 3 vraies chaises de son type, mêmes champs, même type, ref opaque · ≤ 0,05 ms', obtenu: texte };
  });

  // ---- À F2 (le vrai graphe des props de L-D, le lot R au −1, les extincteurs de L-M) ----
  T('F2 atteignabilité sur le graphe des props : ≥ 70 % des poses crédibles, ≥ 20 cachettes ≥ 0,6 par zone', async () => {
    await preparer();
    const nav = await Nav.obtenir(game, { rayon: 0.2, franchir: false }), L = [];
    for (const z of ['e1', 'ss']) {
      const sans = [...cachettes(z, null)].flat().filter((k) => k.cred >= 0.6), avec = [...cachettes(z, nav)].flat().filter((k) => k.cred >= 0.6);
      L.push({ z, part: sans.length ? avec.length / sans.length : 0, n: avec.length });
    }
    const ok = nav.nb > 0 && L.every((e) => e.part >= 0.7 && e.n >= 20);
    return { ok, attendu: '≥ 70 % atteignables, ≥ 20 par zone', obtenu: `graphe ${nav.nb} nœuds · ` + L.map((e) => `${e.z} ${(e.part * 100).toFixed(0)} %, ${e.n}`).join(' · ') };
  }, { apresFusion: true, delai: 180 });
  T('F2 le −1 : types du lot R, 200 tirs reconnus par leur forme, aucun oublié', async () => {
    await preparer();
    const ss = typesDistincts('ss'), R = new Rng(36), P = posesDe('ss').filter((q) => [...MEUBLES.parForme.values()].includes(q.i));
    let ok200 = 0;
    const formes = [...MEUBLES.parForme.entries()];
    for (let k = 0; k < 200 && formes.length; k++) {
      const [f, i] = formes[R.int(formes.length)], q = MEUBLES.poses[i];
      const r = toucherPoses(q.cx, q.y1 + 0.5, q.cz, 0, -1, 0, q.y1 - q.y0 + 0.5, f);
      if (r && r.pose === q) ok200++;
    }
    const oublies = MEUBLES.nonEtiquetes.filter((e) => deguisableDans(MEUBLES.types.get(e.cle) || { deguisable: true, type: e.type }, 'ecole_int'));
    const ok = ss.length >= 6 && ok200 === 200 && MEUBLES.nonEtiquetes.length === 0;
    return { ok, attendu: '≥ 6 types au −1, 200 / 200 par parForme, nonEtiquetes vide', obtenu: `${ss.length} types [${ss.join(', ')}] · ${P.length} poses à forme · ${ok200} / 200 · oubliés ${JSON.stringify(MEUBLES.nonEtiquetes)} ${oublies.length}` };
  }, { apresFusion: true });
}
