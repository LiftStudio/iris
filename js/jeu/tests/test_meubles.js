// =====================================================================
//  LES TESTS DU LOT L-K — registre, déguisements, corps des props (23/10 ; spec § 5.5.8, acceptation 1 à 14, et F2)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-K` (window.__rapport). Tout passe par window.__jeu et par les
// modules du lot : jamais un clic à l'écran. Un test rend { ok, attendu, obtenu }. Les tests `apresFusion` (le vrai graphe
// des props de L-D, le lot R au −1, les extincteurs de L-M) ne tournent qu'avec `&fusion=1` (F2).
import * as THREE from 'three';
import { Rng } from '../rng.js';
import { PAS, ZONES_JEU } from '../constantes.js';
import { MEUBLES, copieMeuble, fermerRegistre, rattraperRegistre, zonerRegistre, _bacASable, TAILLES_REFERENCE } from '../../registre_meubles.js';
import {
  CATALOGUE, preparerCatalogue, typesDeguisables, deguisableDans, viserMeuble, deguiser, retirerProp, majProps, credibilite, cachettes,
  candidatsMeubles, toucherPoses, typeDe, pivotDe, _refEstActeur, distPassage,
} from '../deguisements.js';
import { CorpsProp, deplacerProp, coinsLibres } from '../corps_prop.js';
import { piecesDe, POINTS_APPARITION } from '../apparitions.js';
import { creerCommande } from '../commande.js';
import { Nav } from '../nav.js';

// LES ONZE ENDROITS de carte_props § 4.1 (pieds, cap) : la caméra posée à 1,6 m, un rien vers le bas, champ 16:9 — les
// appels et les triangles de la balade y sont ceux de `socle` (référence relevée sur `socle-ok` e06258f, même harnais)
export const ENDROITS = [
  ['départ (hall)', 14.9, 0, -3.7, 0], ['salle d’attente', 11.63, 0, -4.62, Math.PI / 2], ['hall ouest', 4.63, 0, -6.87, 0],
  ['rue', 15.63, 0, 9.38, 0], ['pause du −1', 9.38, -3.06, -9.37, 0], ['S −1.14', 9.63, -3.06, -22.62, 0],
  ['pause du 1er', 12.63, 3.5, -7.87, Math.PI / 2], ['S 1.3', 2.88, 3.5, -3.37, 0], ['Robert Kahn', 8.13, 3.5, -22.62, 0],
  ['salle 1 du 2e', 4.63, 6.6, -7.87, 0], ['salle David Clark', 5.38, 0, -15.12, 0]];
// (relevé sur socle-ok : [appels, triangles] par endroit — rempli par la mesure de référence, voir le rapport L-K)
export const REFERENCE_ENDROITS = null;
// le relevé aux onze endroits, en balade, caméra libre (game.freeCam), qualité figée
export async function mesurerEndroits(jeu, game, qualite) {
  jeu.figerQualite(true); await jeu.qualite(qualite);
  const u = game.user, cam = game.camera, asp = cam.aspect, R = [];
  game.freeCam = true;
  try {
    for (const [nom, x, y, z, l] of ENDROITS) {
      u.pos.set(x, y, z); if (u.posPrec) u.posPrec.copy(u.pos); if (u.posAff) u.posAff.copy(u.pos); u.solAff = y; u.vel && u.vel.set(0, 0, 0);
      cam.position.set(x, y + 1.6, z); cam.rotation.set(-0.12, l, 0, 'YXZ'); cam.aspect = 16 / 9; cam.updateProjectionMatrix();
      await jeu.images(40);
      const m = await jeu.images(6);
      R.push([nom, m.appels, m.triangles]);
    }
  } finally { game.freeCam = false; cam.aspect = asp; cam.updateProjectionMatrix(); game.placerAuDepart(); jeu.figerQualite(false); }
  return R;
}

// LES TAILLES de carte_props § 2 et conception_prophunt § 4 (l × h × p, m) — les « ≈ » du document gardés, à ± 10 %
const TAILLES = {
  'chaise-coque': [0.63, 0.80, 0.60], 'chaise-coque-noire': [0.63, 0.80, 0.60], 'tabouret-miura': [0.53, 0.85, 0.52], 'chaise-hetre': [0.44, 0.86, 0.55],
  'chaise-kahn': [0.49, 0.85, 0.55], 'chaise-ecusson': [0.42, 0.82, 0.48], 'chaise-bureau': [0.68, 1.05, 0.66], presentoir: [0.36, 1.73, 0.80],
  extincteur: [0.21, 0.64, 0.23], 'mange-debout-croix': [0.65, 1.10, 0.65], 'chaise-dc': [0.46, 0.85, 0.52], 'chaise-marine': [0.47, 0.82, 0.45],
  'chaise-visiteur': [0.5, 0.85, 0.5], 'chaise-luge': [0.45, 0.82, 0.5], 'fauteuil-accueil': [0.7, 0.8, 0.7], copieur: [0.6, 1.15, 0.6],
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
    const H = await mesurerEndroits(jeu, game, 'haute'), M = await mesurerEndroits(jeu, game, 'moyenne');
    t.note('endroits haute', JSON.stringify(H)); t.note('endroits moyenne', JSON.stringify(M));
    if (!ref) return { ok: false, attendu: 'la référence de socle-ok', obtenu: 'pas de référence pour le profil ' + profil() + ' : ' + JSON.stringify({ H, M }) };
    const diff = [];
    for (const [q, L] of [['haute', H], ['moyenne', M]]) L.forEach(([nom, a, tr], i) => { const [ra, rt] = ref[q][i]; if (a !== ra || tr !== rt) diff.push(`${q} ${nom} ${a}/${tr} au lieu de ${ra}/${rt}`); });
    return { ok: diff.length === 0, attendu: 'identiques à socle-ok (22 relevés)', obtenu: diff.length ? diff.join(' ; ') : '22 relevés identiques' };
  }, { delai: 300 });
  T('1c coût du registre à la construction ≤ 30 ms (rejoué sur une réplique)', async (t) => {
    await preparer();
    // LA RÉPLIQUE : chaque pose, une copie de son prototype à sa place, avec son étiquette ; autant de maillages non étiquetés
    // que la construction en a lus (des maillages de la scène, géométries clonées, boîtes à recalculer)
    const S = MEUBLES.stats, rep = new THREE.Group();
    for (const P of MEUBLES.poses) {
      const T0 = MEUBLES.types.get(P.cle), c = copieMeuble(P.cle); if (!c) continue;
      c.userData = { meuble: { type: T0.type, variante: T0.variante, nom: T0.nom, mural: T0.mural, surPlace: T0.surPlace, voile: T0.voile } };
      c.position.set(P.x, P.y0, P.z); c.rotation.set(0, P.cap, 0); rep.add(c);
    }
    const sources = [];
    game.scene.traverse((o) => { if (o.isMesh && !o.userData.dynamique && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count >= 8 && o.geometry.attributes.position.count <= 40000) sources.push(o); });
    const libres = new THREE.Group();
    let n = 0, s = 0;
    for (let i = 0; n < S.libres && sources.length && i < S.libres * 4; i++) {
      const o = sources[i % sources.length], g = o.geometry.clone(); g.boundingBox = null;
      const m = new THREE.Mesh(g, o.material); o.matrixWorld.decompose(m.position, m.quaternion, m.scale); libres.add(m); n++; s += g.attributes.position.count;
      if (s > S.sommets * 1.2) break;
    }
    rep.add(libres);
    const t0 = performance.now();
    const r = _bacASable((M) => { fermerRegistre(rep); rattraperRegistre(null); zonerRegistre(game.carte.lumieres, game.collisions); return { types: M.types.size, poses: M.poses.length }; });
    const ms = performance.now() - t0;
    for (const m of libres.children) m.geometry.dispose();
    const ok = t.temps('registre (ms, rejoué)', ms, 30) && r.poses === MEUBLES.poses.length;
    return { ok, attendu: '≤ 30 ms · ' + MEUBLES.poses.length + ' poses retrouvées',
      obtenu: `${ms.toFixed(1)} ms pour ${r.poses} poses, ${r.types} types, ${n} maillages libres (${s} sommets ; la construction : ${S.libres} maillages, ${S.sommets} sommets lus, ${S.coutures} coutures)` };
  }, { delai: 120 });

  // 2. LE REGISTRE HORS DU −1 : types, poses, tailles, oubliés
  T('2 verifierMeubles : ≥ 18 types, ≥ 200 poses, tailles, oubliés', async () => {
    await preparer();
    const v = jeu.verifierMeubles();
    const H = MEUBLES.poses.filter((p) => hors(p.zone)), types = new Set(H.map((p) => MEUBLES.types.get(p.cle).type));
    const tailles = [];
    for (const [cle, T0] of MEUBLES.types) {
      const ref = TAILLES[T0.type]; if (!ref) continue;
      const t3 = [T0.taille.x, T0.taille.y, T0.taille.z];
      if (t3.some((x, k) => Math.abs(x - ref[k]) > 0.1 * ref[k])) tailles.push(`${cle} ${t3.map(r3).join('×')} (réf. ${ref.join('×')})`);
    }
    // les oubliés : ceux de L-M (l'extincteur de l'ascenseur et de la bande sud, js/ecole_ascenseur.js) sont attendus ; tout autre
    // est une faute — et un type qui en garde un dans une zone n'y est pas déguisable
    const LM = (e) => e.type === 'extincteur' && /^extincteur rouge$/.test(e.materiau || '');
    const autres = v.nonEtiquetes.filter((e) => !LM(e));
    const fautes = [];
    for (const z of ['e1', 'e2', 'rdc', 'ecole_int']) {
      const P = piecesDe(z), L = new Set(typesDeguisables(z).map((c) => MEUBLES.types.get(c).type));
      for (const e of v.nonEtiquetes) if (P.has(e.zone) && L.has(e.type)) fautes.push(z + ' ' + e.type);
    }
    const ok = types.size >= 18 && H.length >= 200 && tailles.length === 0 && v.horsTolerance.length === 0 && autres.length === 0 && fautes.length === 0;
    return { ok, attendu: '≥ 18 types, ≥ 200 poses hors du −1, tailles à ± 10 %, horsTolerance vide, oubliés : ceux de L-M seulement, exclus de leur zone',
      obtenu: `${types.size} types, ${H.length} poses hors du −1 (${v.types} clés, ${v.poses} poses en tout) · tailles ${tailles.join(' ; ') || 'justes'} · horsTolerance ${JSON.stringify(v.horsTolerance)} · oubliés L-M ${v.nonEtiquetes.filter(LM).map((e) => e.zone + ' (' + r3(e.x) + ' ; ' + r3(e.y) + ' ; ' + r3(e.z) + ')').join(', ') || 'aucun'} · autres ${JSON.stringify(autres)} · fautes ${fautes.join(', ') || 'aucune'}` };
  });

  // 3. LE CATALOGUE : ≤ 600 ms, aucun programme neuf, une copie ≤ 12 appels (haute)
  T('3 preparerCatalogue ≤ 600 ms, 0 programme, une copie ≤ 12 appels (haute)', async (t) => {
    const prog = () => (game.renderer.info.programs || []).length;
    const p0 = prog(), t0 = performance.now();
    await preparerCatalogue(game);
    const ms = performance.now() - t0;
    jeu.figerQualite(true); await jeu.qualite('haute');
    const cam = game.camera, u = game.user, appels = [], trop = [];
    game.freeCam = true;
    try {
      // le hall, devant la pile : un fond fixe, puis chaque type posé à 2,2 m devant la caméra
      const x = 14.9, z = -3.4; u.pos.set(x, 0, z + 0.6); if (u.posAff) u.posAff.copy(u.pos);
      cam.position.set(x, 1.5, z); cam.rotation.set(-0.35, 0, 0, 'YXZ'); cam.aspect = 16 / 9; cam.updateProjectionMatrix();
      await jeu.images(20);
      const fond = (await jeu.images(4)).appels;
      for (const [cle, T0] of CATALOGUE) {
        const c = T0.secours ? T0.proto.clone(true) : copieMeuble(cle); c.userData.dynamique = true;
        c.position.set(x, 0, z - 2.2); game.scene.add(c);
        await jeu.images(2);
        const a = (await jeu.images(3)).appels - fond;
        game.scene.remove(c);
        appels.push(cle + ' ' + a);
        if (a > 12) trop.push(cle + ' ' + a + ' (' + T0.proto.children.length + ' maillages)');
      }
    } finally { game.freeCam = false; game.placerAuDepart(); jeu.figerQualite(false); }
    const p1 = prog();
    const ok = t.temps('preparerCatalogue (ms)', ms, 600) && p1 === p0 && trop.length === 0;
    return { ok, attendu: '≤ 600 ms · programmes constants · chaque copie ≤ 12 appels en haute (≤ 3 pour un meuble cousu seul : le −1, lot R)',
      obtenu: `${Math.round(ms)} ms · programmes ${p0} → ${p1} · ${trop.length ? 'trop : ' + trop.join(', ') : 'toutes ≤ 12'} · ${appels.join(', ')}` };
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
      // le programme : celui d'un matériau du décor de même contenu (le jumeau dédupliqué)
      c.traverse((m) => {
        if (!m.isMesh) return;
        const pr = game.renderer.properties.get(m.material).currentProgram;
        if (pr && !(game.renderer.info.programs || []).includes(pr)) fautes.push(cle + ' programme hors liste');
      });
      n++;
    }
    return { ok: fautes.length === 0 && n >= 18, attendu: 'chaque type : boîte de la copie = boîte de l’original à 1 mm, programmes existants', obtenu: `${n} types · ${fautes.join(', ') || 'tout juste'}` };
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
    // 5 cm à côté : un rayon vertical le long d'une face, hors de toute boîte
    const dehors = (x, z, y) => !L.some((Q) => y > Q.y0 - 0.05 && y < Q.y1 + 0.05 && (() => { const lx = (x - Q.cx) * Q.c + (z - Q.cz) * Q.s, lz = -(x - Q.cx) * Q.s + (z - Q.cz) * Q.c; return Math.abs(lx) <= Q.hx && Math.abs(lz) <= Q.hz; })());
    for (let k = 0; k < N && essais < 4 * N; essais++) {
      const P = L[R.int(L.length)], c = Math.cos(P.cap), s = Math.sin(P.cap), sx = R.next() < 0.5 ? 1 : -1;
      const lx = sx * (P.hx + 0.05), x = P.cx + lx * c, z = P.cz - lx * s, cy = (P.y0 + P.y1) / 2;
      if (!dehors(x, z, cy)) continue;
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
    // (a, f) la chaise coque au BOUT de sa rangée (la rangée nord de la salle d'attente, au pas de 0,7), puis tournée de 90°
    const rang = MEUBLES.poses.filter((p) => MEUBLES.types.get(p.cle).type === 'chaise-coque' && p.zone === 'attente').sort((a, b) => a.x - b.x);
    const nord = rang.filter((p) => Math.abs(p.z - rang[rang.length - 1].z) < 0.2).sort((a, b) => a.x - b.x);
    let bout = null;
    for (const P of [nord[nord.length - 1], nord[0]]) { if (!P) continue; const s = P === nord[0] ? -1 : 1, x = P.x + s * (P.pas || 0.7); if (libreT(MEUBLES.types.get(P.cle), x, P.y, P.z)) { bout = { P, x }; break; } }
    if (bout) {
      cas('chaise coque au bout de sa rangée', bout.P.cle, bout.x, bout.P.y, bout.P.z, bout.P.cap, bout.P.zone, 0.8, 1);
      cas('la même tournée de 90°', bout.P.cle, bout.x, bout.P.y, bout.P.z, bout.P.cap + Math.PI / 2, bout.P.zone, 0.5, -1);
      // (b) la même au milieu d'un couloir (le couloir est, loin de tout)
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
  T('8 CorpsProp : 100 trajets par type, sous une table, pas la place', async () => {
    await preparer();
    const Cc = C(), R = new Rng(19), types = [...CATALOGUE.values()].filter((T0) => T0.deguisable && !T0.secours), bilan = [];
    let traverse = 0, mur = 0, pas = 0;
    const departs = POINTS_APPARITION.filter((p) => p.zone !== 'rue');
    const partie = { evt() {}, game, acteurs: [] };
    for (const T0 of types) {
      let tr = 0, mu = 0;
      for (let k = 0; k < 100; k++) {
        // un départ libre près d'un lieu d'apparition
        let x, y, z, ok = false;
        for (let e = 0; e < 40 && !ok; e++) {
          const p = departs[R.int(departs.length)]; x = p.x + R.range(-2.5, 2.5); z = p.z + R.range(-2.5, 2.5); y = Cc.solEn(x, z, p.y + 0.3);
          ok = Math.abs(y - p.y) < 0.3 && Cc.libre(x, z, T0.rayon, y, T0.bande.haut, T0.bande.bas);
        }
        if (!ok) continue;
        const c = new CorpsProp(Cc, { rayon: T0.rayon, haut: T0.bande.haut, bas: T0.bande.bas, bounds: null }); c.porter(T0);
        c.pos.set(x, y, z); c.posPrec.copy(c.pos);
        const a = { id: k, corps: c, prop: { T: T0, cap: 0, fige: false, verrou: false }, endurance: 100 }, cmd = creerCommande();
        for (let s = 0; s < 180; s++) {
          if (s % 60 === 0) { cmd.lacet = R.range(-Math.PI, Math.PI); cmd.ay = 1; cmd.ax = R.range(-1, 1); cmd.sprint = R.next() < 0.5; cmd.saut = R.next() < 0.1; } else cmd.saut = false;
          const px = c.pos.x, pz = c.pos.z, py = c.pos.y, ym = py + (c.bas + c.haut) / 2;
          deplacerProp(a, cmd, PAS, partie); pas++;
          if (Math.hypot(c.pos.x - px, c.pos.z - pz) > 1e-4 && Cc.rayonLibre(px, ym, pz, c.pos.x, ym, c.pos.z, 0) < 1 - 1e-6) tr++;
          if (!Cc.libre(c.pos.x, c.pos.z, c.rayon * 0.8, c.pos.y, c.haut, c.bas)) mu++;
        }
      }
      traverse += tr; mur += mu;
      if (tr || mu) bilan.push(`${T0.cle} ${tr} traversées, ${mu} pas dans un mur`);
    }
    // SOUS UNE TABLE : la corbeille (bande 0,14-0,5) file sous un plateau — un tabouret, non
    const sous = sousUneTable(Cc);
    // PAS LA PLACE : un meuble long (le baby-foot du −1, 1,05 × 0,93 × 1,48, sur place) refusé dans une porte de 0,8 m
    const porte = pasLaPlace(Cc);
    const ok = traverse === 0 && mur === 0 && sous.ok && porte.ok;
    return { ok, attendu: '0 traversée, 0 dans un mur ; la corbeille sous une table, le tabouret non ; le baby-foot refusé dans une porte de 0,8 m',
      obtenu: `${types.length} types, ${pas} pas · ${bilan.join(' ; ') || '0 traversée, 0 dans un mur'} · ${sous.texte} · ${porte.texte}` };
  }, { delai: 300 });
  // (une table dont le plateau est une forme à lui : la corbeille passe dessous, un tabouret Miura non)
  function sousUneTable(Cc) {
    const cor = [...CATALOGUE.values()].find((T0) => T0.type === 'corbeille'), mi = [...CATALOGUE.values()].find((T0) => T0.type === 'tabouret-miura');
    if (!cor || !mi) return { ok: false, texte: 'pas de corbeille ou de Miura' };
    for (const f of Cc.formes) {
      if (f.off || !f.joueur || f.t !== 'b' || !Number.isFinite(f.y1)) continue;
      const sol = Cc.solEn((f.x0 + f.x1) / 2, (f.z0 + f.z1) / 2, f.y0 + 0.1);
      const dessous = f.y0 - sol, ep = f.y1 - f.y0;
      if (dessous < 0.55 || dessous > 0.8 || ep > 0.15 || f.x1 - f.x0 < 0.6 || f.z1 - f.z0 < 0.5) continue;
      // de part et d'autre de la table, le long de x, au sol
      const z = (f.z0 + f.z1) / 2, x0 = f.x0 - 0.4, x1 = (f.x0 + f.x1) / 2;
      if (!Cc.libre(x0, z, cor.rayon, sol, cor.bande.haut, cor.bande.bas) || !Cc.libre(x1, z, cor.rayon, sol, cor.bande.haut, cor.bande.bas)) continue;
      const essai = (T0) => {
        const c = new CorpsProp(Cc, {}); c.porter(T0); c.pos.set(x0, sol, z); c.posPrec.copy(c.pos);
        const a = { id: 0, corps: c, prop: { T: T0, cap: 0, fige: false, verrou: false }, endurance: 100 }, cmd = creerCommande();
        cmd.lacet = -Math.PI / 2; cmd.ay = 1;                     // (vers +x)
        for (let s = 0; s < 120; s++) deplacerProp(a, cmd, PAS, { evt() {}, game });
        return c.pos.x;
      };
      const xc = essai(cor), xm = essai(mi);
      const ok = xc > f.x0 + 0.1 && xm < f.x0 + 0.05;
      return { ok, texte: `sous la table (${r3((f.x0 + f.x1) / 2)} ; ${r3(z)}, plateau ${r3(dessous)} m) : corbeille jusqu’en x ${r3(xc)}, Miura arrêté en ${r3(xm)} (bord ${r3(f.x0)})` };
    }
    return { ok: false, texte: 'aucune table à plateau seul' };
  }
  function pasLaPlace(Cc) {
    // le baby-foot d'essai (aux cotes de carte_props § 2), le temps du test
    const bf = typeDe('carton'), T0 = { ...bf, cle: 'baby-foot-essai', type: 'baby-foot', nom: 'le baby-foot', secours: false, deguisable: true, surPlace: true,
      boite: new THREE.Box3(new THREE.Vector3(-0.525, 0, -0.74), new THREE.Vector3(0.525, 0.93, 0.74)), taille: new THREE.Vector3(1.05, 0.93, 1.48), rayon: 0.5, haut: 0.93,
      bande: { bas: 0.25, haut: 0.93 } };
    // une porte de 0,8 m : deux montants de part et d'autre d'un passage (cherchés parmi les passages du RDC) — à défaut, deux
    // formes posées le temps du test hors de la carte vivante n'existent pas : on mesure la largeur libre au passage
    for (const p of [{ x: 11.49, z: -11.21 }, { x: 11.5, z: -9 }, { x: 6, z: -11 }, { x: 6, z: -8.5 }, { x: 5.14, z: -12.74 }]) {
      const y = Cc.solEn(p.x, p.z, 0.3);
      if (!Cc.libre(p.x, p.z, 0.2, y)) continue;
      let w = 0.2; while (w < 0.6 && Cc.libre(p.x, p.z, w + 0.01, y)) w += 0.01;
      if (w > 0.45) continue;                                     // (une porte : moins de 0,9 m de passage)
      CATALOGUE.set(T0.cle, T0);
      try {
        const partie = { zone: 'ecole', game, evt(t, d) { this.dernier = { t, ...d }; }, acteurs: [] };
        const c = new CorpsProp(Cc, {}); c.pos.set(p.x, y, p.z);
        const a = { id: 0, corps: c, prop: null, vie: 100, vieMax: 100, changerCorps() {} };
        const r = deguiser(partie, a, T0.cle);
        return { ok: r === false && partie.dernier && partie.dernier.raison === 'place', texte: `porte de ${(2 * w).toFixed(2)} m en (${p.x} ; ${p.z}) : ${r ? 'accepté' : 'refusé (' + (partie.dernier && partie.dernier.raison) + ')'}` };
      } finally { CATALOGUE.delete(T0.cle); }
    }
    return { ok: false, texte: 'pas de porte de 0,8 m trouvée' };
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
      a.vie = Math.round(a.vieMax * 0.5); a.prop.pv = a.vie;
      const avant = JSON.stringify({ cle: a.prop.cle, vie: a.vie, x: a.corps.pos.x, z: a.corps.pos.z, r: a.corps.rayon });
      r2 = deguiser(p, a, grand.cle);
      const apres = JSON.stringify({ cle: a.prop.cle, vie: a.vie, x: a.corps.pos.x, z: a.corps.pos.z, r: a.corps.rayon });
      // au large : accepté, PV en proportion
      placer(a, 11.63, 0, -4.62);
      r3b = deguiser(p, a, grand.cle);
      pv = { attendu: Math.round(grand.pv * 0.5), obtenu: a.vie, inchange: avant === apres };
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

  // 11. L'AFFICHAGE DES PROPS : jamais penché, un voile (aucun en plus pour la chaise coque), flash sans programme neuf
  T('11 majProps : racine droite, voile, flash sans programme', async () => {
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
    await jeu.images(4);
    const rouge = (a.prop.racine.userData.mats || []).some((m) => m.emissive && m.emissive.r > 0.5);
    await jeu.images(8);
    const p1 = prog();
    jeu.quitter('balade');
    const enfants = game.scene.children.filter((o) => o.name && o.name.startsWith('prop ')).length;
    const ok = fautes.length === 0 && p1 === p0 && enfants === 0;
    return { ok, attendu: 'roulis et tangage 0 · un seul maillage transparent (le voile ; celui de la chaise coque est le sien) · flash : 0 programme · racines retirées à la sortie',
      obtenu: `${fautes.join(', ') || 'droites, un voile chacune'} · flash ${rouge ? 'rouge' : 'pas vu'}, programmes ${p0} → ${p1} · ${enfants} racine(s) restée(s)` };
  });

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
      const tmp = viser(x, z, P), L = Math.max(0, tmp.d - 0.12), u = tmp.dir.map((q) => q / tmp.d);
      const libre = Cc.rayonLibre(tmp.o.x, tmp.o.y, tmp.o.z, tmp.o.x + u[0] * L, tmp.o.y + u[1] * L, tmp.o.z + u[2] * L, 0) >= 1 - 1e-6;
      const premiere = toucherPoses(tmp.o.x, tmp.o.y, tmp.o.z, u[0], u[1], u[2], tmp.d + 0.5);
      if (quoi === 'trouve') {
        if (!libre || !premiere || premiere.pose !== P) continue;
        res.trouve++; if (!tmp.v || tmp.v.pose !== P) fautes.push(`à 2,5 m de ${P.cle} : ${tmp.v ? tmp.v.cle : 'null'}`);
      } else if (quoi === 'mur') {
        // un mur entre les deux (le rayon arrêté à plus de 0,3 m avant le meuble)
        const f = Cc.rayonLibre(tmp.o.x, tmp.o.y, tmp.o.z, tmp.o.x + u[0] * L, tmp.o.y + u[1] * L, tmp.o.z + u[2] * L, 0);
        if (f * L > L - 0.3 || Math.hypot(x - P.cx, z - P.cz) >= 2.9) continue;
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
    const ss = typesDeguisables('ss'), e2 = typesDeguisables('e2'), e1 = typesDeguisables('e1'), rdc = typesDeguisables('rdc');
    const loteR = MEUBLES.poses.some((P) => P.zone && piecesDe('ss').has(P.zone));
    const ok = (loteR || ss.length < 6) && e2.length < 6 && e1.length >= 6;
    return { ok, attendu: 'ss < 6 sans le lot R · e2 < 6 · e1 ≥ 6',
      obtenu: `ss ${ss.length}${loteR ? ' (lot R là)' : ''} · e2 ${e2.length} [${e2.join(', ')}] · e1 ${e1.length} [${e1.join(', ')}] · rdc ${rdc.length} [${rdc.join(', ')}]` };
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
    const ss = typesDeguisables('ss'), R = new Rng(36), P = posesDe('ss').filter((q) => [...MEUBLES.parForme.values()].includes(q.i));
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
