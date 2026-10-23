// =====================================================================
//  LES TESTS DU LOT L-F — les règles du prop hunt et ses sons (spec § 5.5.9 ; 23/10)
// =====================================================================
// `?test=1&rapport=1&lot=L-F` (jamais un clic : tout passe par window.__jeu). Zone de test : le 1er (`e1`) — le 2e n'a que 3
// types déguisables et le −1 attend le lot R. Le registre du socle est VIDE (aucune étiquette avant L-K) : les tests qui
// ont besoin de vrais meubles posent des types et des poses FICTIFS dans le registre (et les retirent), et la pose touchée
// par une balle passe par `PartieProp.poseTouchee`, une méthode que le test remplace sur la partie. Ce qu'il faut du VRAI
// travail des autres lots (le catalogue de L-K, les sons spatialisés de L-H, le sprint à endurance de L-B) est dans les
// tests `apresFusion` (F2).
import * as THREE from 'three';
import { PAS, niveauDe } from '../constantes.js';
import { REGLAGES_PROP } from '../partie_prop.js';
import { PROVOCATIONS, RECETTES_PROP, REGLAGES_SONS } from '../sons_prop.js';
import { CerveauChasseur } from '../cerveau_prop.js';
import { typesDeguisables, CATALOGUE } from '../deguisements.js';
import { MEUBLES } from '../../registre_meubles.js';
import { piecesDe } from '../apparitions.js';

const r2 = (v) => Math.round(v * 100) / 100, DEG = Math.PI / 180;
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, o) => jeu.ajouterTest('L-F', nom, fn, o);
  const P = () => game.partie;
  const lancer = (o = {}) => jeu.lancer('prophunt', { graine: 1, zone: 'e1', acteurs: 5, difficulte: 'facile', ...o });
  // la simulation seule jusqu'à la phase `ph` (au plus `max` s)
  const jusqua = (ph, max = 400) => { const p = P(); for (let i = 0; i < max / PAS && p.phase !== ph && game.partie === p; i++) p.pas(PAS); return p.phase === ph; };
  // jusqu'à l'heure de partie `t` (le pas où partie.t atteint t)
  const jusquA = (t) => { const p = P(); while (p.t < t - PAS / 2 && game.partie === p) p.pas(PAS); };
  // UN FRONT (ou des champs) de commande pour le seul pas suivant
  const front = (id, champs) => { jeu.commande(id, champs, 1.5 * PAS); P().pas(PAS); };
  const ev = (types) => { const L = []; const d = P().sur('*', (e) => { if (!types || types.includes(e.type)) L.push(e); }); return { L, fin: d }; };
  const touche = (code, bas = true) => window.dispatchEvent(new KeyboardEvent(bas ? 'keydown' : 'keyup', { code }));
  const roles = (p) => p.acteurs.map((a) => a.role);
  const compte = (p, r) => p.acteurs.filter((a) => a.role === r).length;
  // un point libre (disque de 0,32 m) à `d` m de (x, y, z), sur le même sol ; `vue` : vu de (x, y + 1,62, z)
  const autour = (x, y, z, d, { k0 = 0, vue = false, cy = 0.3 } = {}) => {
    const C = game.collisions, p = P();
    for (let k = 0; k < 48; k++) {
      const an = (k0 + k) * Math.PI / 24, qx = x + d * Math.cos(an), qz = z + d * Math.sin(an), sy = C.solEn(qx, qz, y + 0.3);
      if (Math.abs(sy - y) > 0.05 || !C.libre(qx, qz, 0.32, sy)) continue;
      if (vue && !p.balistique.vue(qx, sy + 1.62, qz, x, y + cy, z)) continue;
      return { x: qx, y: sy, z: qz };
    }
    return null;
  };
  // DES MEUBLES FICTIFS dans le registre (une boîte 0,45 × 0,75 × 0,45), retirés à la fin (`fn` les reçoit)
  const fictif = (cle, nom) => {
    const geo = new THREE.BoxGeometry(0.45, 0.75, 0.45).translate(0, 0.375, 0), proto = new THREE.Group();
    proto.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x55779a, roughness: 0.8 })));
    const V = 0.45 * 0.75 * 0.45;
    return { cle, type: cle, variante: null, nom, proto, boite: new THREE.Box3(new THREE.Vector3(-0.225, 0, -0.225), new THREE.Vector3(0.225, 0.75, 0.225)),
      taille: new THREE.Vector3(0.45, 0.75, 0.45), rayon: 0.2025, haut: 0.75, volume: V, pv: REGLAGES_PROP.pvProp(V), vitesse: REGLAGES_PROP.vitesseProp(V),
      mural: false, surPlace: false, deguisable: true, voile: true };
  };
  const pose = (cle, x, y, z, zone = null) => ({ i: MEUBLES.poses.length, cle, x, y, z, cap: 0, zone, cx: x, cz: z, hx: 0.225, hz: 0.225, y0: y, y1: y + 0.75, c: 1, s: 0 });
  const avecFictifs = async (fn) => {
    const A = fictif('tabouret_fictif', 'le tabouret fictif'), B = fictif('poubelle_fictive', 'la poubelle fictive'), n0 = MEUBLES.poses.length;
    const zones = new Map([...MEUBLES.parZone].map(([k, L]) => [k, L.length]));
    MEUBLES.types.set(A.cle, A); MEUBLES.types.set(B.cle, B);
    const ajouter = (P0) => { P0.i = MEUBLES.poses.length; MEUBLES.poses.push(P0); if (!MEUBLES.parZone.has(P0.zone)) MEUBLES.parZone.set(P0.zone, []); MEUBLES.parZone.get(P0.zone).push(P0); return P0; };
    try { return await fn({ A, B, ajouter }); }
    finally {
      MEUBLES.types.delete(A.cle); MEUBLES.types.delete(B.cle); MEUBLES.poses.length = n0;
      for (const [k, L] of [...MEUBLES.parZone]) { if (!zones.has(k)) MEUBLES.parZone.delete(k); else L.length = zones.get(k); }
    }
  };
  const zoneId = (x, y, z) => { const Lu = game.carte.lumieres, Z = Lu && Lu.zoneEn ? Lu.zoneEn(x, z, y + 0.1) : null; return Z ? Z.id : null; };
  // une VRAIE pose fictive touchée par toute balle, juste avant ce qu'elle touche (la méthode de la partie remplacée)
  const poseSousLeTir = (p, P0) => { p.poseTouchee = (ox, oy, oz, dx, dy, dz, tMax) => ({ pose: P0, t: Math.min(2.5, tMax - 0.04) }); };

  // 1. LES PHASES ET LEURS DURÉES (bots, 6 manches au 1er, × 8) ; les rôles alternés ; le premier rôle ; la zone par défaut
  T('1 phases dans l’ordre, durées du 1er, rôles alternés, premier rôle, zone par défaut', async () => {
    const R = REGLAGES_PROP, [tC, tT] = R.durees.e1, res = [];
    await lancer({ graine: 11, humain: false, manches: 6 });
    let p = P();
    const L = p.phase === 'presentation' && p.t === 0 ? [{ phase: 'presentation', t: 0, manche: 1 }] : [], fins = [];
    const d1 = p.sur('phase', (e) => {
      L.push({ phase: e.phase, t: p.t, manche: p.manche });
      // (la 1re manche va au bout du chrono : ses props tiennent)
      if (e.phase === 'traque' && p.manche === 1) for (const a of p.acteurs) if (a.role === 'prop') a.vie = a.vieMax = 1e9;
    });
    const d2 = p.sur('fin', (e) => fins.push(e));
    jeu.avancer(6 * (3 + tC + tT + 6) + 5, { vitesse: 8 });
    d1(); d2();
    const ordre = ['presentation', 'cachette', 'traque', 'revelation'];
    let okOrdre = L.length === 6 * 4 + 1 && L[L.length - 1].phase === 'fin', okDur = true, traque1 = 0;
    for (let i = 0; i < L.length - 1; i++) {
      const ph = L[i].phase, du = L[i + 1].t - L[i].t;
      if (i < 24 && ph !== ordre[i % 4]) okOrdre = false;
      if (ph === 'presentation' && Math.abs(du - R.presentation) > PAS * 1.5) okDur = false;
      if (ph === 'cachette' && Math.abs(du - tC) > PAS * 1.5) okDur = false;
      if (ph === 'revelation' && Math.abs(du - R.revelation) > PAS * 1.5) okDur = false;
      if (ph === 'traque') { if (du > tT + PAS * 1.5) okDur = false; if (L[i].manche === 1) traque1 = du; }
    }
    if (Math.abs(traque1 - tT) > PAS * 1.5) okDur = false;
    res.push(['phases ' + L.length + (okOrdre ? '' : ' (désordre)'), okOrdre], ['durées (traque 1 : ' + r2(traque1) + ' s)', okDur], ['fin émise', fins.length === 1 && p.phase === 'fin']);
    // (b) avec Haythem : le premier rôle, puis l'alternance
    const roleManche = async (o, n) => {
      await lancer(o); const q = P(), out = [q.local.role];
      for (let k = 1; k < n; k++) { jusqua('traque'); q._finir('props'); jusqua('presentation', 10); out.push(q.local.role); }
      return out;
    };
    const a1 = await roleManche({ graine: 3, premierRole: 'prop' }, 3), a2 = await roleManche({ graine: 3, premierRole: 'chasseur' }, 2);
    res.push(['prop → chasseur → prop : ' + a1.join(' → '), a1.join() === 'prop,chasseur,prop'], ['chasseur → prop : ' + a2.join(' → '), a2.join() === 'chasseur,prop']);
    // (c) au hasard semé : la même graine, le même rôle ; plusieurs graines, les deux rôles
    const H = [];
    for (const g of [1, 2, 3, 4, 5, 6]) { await lancer({ graine: g, premierRole: 'hasard' }); H.push(P().local.role); }
    await lancer({ graine: 4, premierRole: 'hasard' }); const bis = P().local.role;
    res.push(['hasard ' + H.join(','), H.includes('prop') && H.includes('chasseur') && bis === H[3]]);
    // (d) la zone par défaut : settings.jeu.prop.zone === null → le −1 s'il a 6 types, sinon le 1er
    const S = game.settings.data.jeu.prop;
    await lancer({ zone: undefined }); p = P();
    const attendue = typesDeguisables('ss').length >= R.typesMin ? 'ss' : 'e1';
    res.push([`zone par défaut ${p.zone} (réglage ${S.zone}, attendu ${attendue})`, S.zone === null && p.zone === attendue]);
    await lancer({ zone: 'e2' }); const z2 = P().zone, rz = P().zoneRemplacee;
    res.push([`e2 demandé → ${z2}${rz ? ' (' + rz.raison + ')' : ''}`, typesDeguisables('e2').length >= R.typesMin ? z2 === 'e2' : z2 === attendue && !!rz]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'phases dans l’ordre, présentation 3 s, cachette 35 s, traque ≤ 3:30 (= 3:30 au chrono), révélation 6 s ; rôles alternés ; zone par défaut',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  }, { delai: 300 });

  // 2. LA COMPOSITION : arrondi(N/3) chasseurs ; « chasseur seul »
  T('2 composition : arrondi(N/3) chasseurs, chasseur seul', async () => {
    const res = [];
    for (let N = 4; N <= 8; N++) {
      await lancer({ acteurs: N, premierRole: 'prop' }); const a = P(), nP = compte(a, 'chasseur'), nA = a.acteurs.length;
      await lancer({ acteurs: N, premierRole: 'chasseur' }); const b = P(), nC = compte(b, 'chasseur');
      // (les bots toujours props n'ont pas de corps d'élève)
      const sansAvatar = b.acteurs.filter((x) => !x.pool && !x.local).every((x) => !x.joueur);
      res.push([`N ${N} : ${nP} / ${nC} chasseurs (${Math.round(N / 3)})`, nP === Math.round(N / 3) && nC === Math.round(N / 3) && nA === N && b.acteurs.length === N && sansAvatar]);
    }
    await lancer({ acteurs: 5, premierRole: 'chasseur', chasseurSeul: true }); const s = P();
    res.push([`chasseur seul : ${compte(s, 'chasseur')} chasseur, ${compte(s, 'prop')} props`, compte(s, 'chasseur') === 1 && compte(s, 'prop') === 4 && s.local.role === 'chasseur']);
    jusqua('traque'); s._finir('props'); jusqua('presentation', 10);
    res.push([`chasseur seul, manche 2 (Haythem prop) : ${compte(s, 'chasseur')} chasseurs`, compte(s, 'chasseur') === 2 && s.local.role === 'prop']);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'N 4…8 → 1, 2, 2, 2, 3 chasseurs (dans les deux rôles de Haythem) ; chasseur seul → 1 chasseur, le coéquipier en prop',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  }, { delai: 180 });

  // 3. LA CACHETTE : chasseurs figés et sans tir, caméra fixe, panneau rempli, cerveaux et sons SOURDS aux props
  T('3 cachette : chasseurs figés, 0 tir, caméra fixe, panneau, sourds aux props', async () => {
    const res = [], proto = CerveauChasseur.prototype, avant = Object.getOwnPropertyDescriptor(proto, 'entendre'), base = proto.entendre;
    let recus = 0, recusTraque = 0;
    await lancer({ graine: 5, premierRole: 'chasseur' });
    const p = P(), loc = p.local, SP = p.aff.sonsProp, jL = SP.n;
    const dePropOuSon = (e) => ['provocation', 'frottement', 'deguise', 'defige'].includes(e.type) || (e.a !== undefined && (p.acteurParId(e.a) || {}).role === 'prop');
    proto.entendre = function (e) { if (dePropOuSon(e)) { if (p.phase === 'traque') recusTraque++; else recus++; } return base.call(this, e); };
    try {
      const E = ev(['tir']);
      jusqua('cachette');
      const ch = p.acteurs.filter((a) => a.role === 'chasseur'), pos0 = ch.map((a) => a.pos.clone());
      const prop = p.acteurs.find((a) => a.role === 'prop' && !a.local);
      // un prop bot qui court pendant la cachette (il frotte), les chasseurs le « veulent » suivre
      const muets0 = SP.muets;
      jeu.commande(prop.id, { ax: 0, ay: 1, amp: 1, sprint: true, lacet: prop.cmd.lacet }, 3);
      for (const h of ch) if (!h.local) jeu.commande(h.id, { ax: 0, ay: 1, amp: 1, sprint: true, tir: true }, 3);
      jeu.avancer(3.2);
      // la caméra de Haythem chasseur, FIXE : il a beau tourner la tête
      await jeu.images(2);
      const q0 = game.camera.quaternion.clone(); game.camYaw += 1.2; game.camPitch = 0.4;
      await jeu.images(3);
      const dq = q0.angleTo(game.camera.quaternion);
      // le panneau (hud.prop.cachette) et ses astuces qui changent toutes les 8 s
      p.majHud(); const C1 = p.hud.prop && p.hud.prop.cachette;
      const a1 = C1 ? C1.astuces.join('|') : '';
      jusquA(p.t + 8.1); p.majHud(); const C2 = p.hud.prop && p.hud.prop.cachette, a2 = C2 ? C2.astuces.join('|') : '';
      const bouges = ch.map((a, i) => r2(Math.hypot(a.pos.x - pos0[i].x, a.pos.z - pos0[i].z)));
      const tirs = E.L.filter((e) => ch.some((h) => h.id === e.a)).length;
      const frottes = SP.muets - muets0, joues = SP.journal.filter((j) => j.n > jL).filter((j) => ['frottement', 'pouf', 'craquement', 'toc'].includes(j.nom) || PROVOCATIONS.some((q) => q.id === j.nom)).length;
      // (le témoin : à la traque, un prop qui court près de Haythem s'entend, et les cerveaux l'entendent)
      jusqua('traque');
      const pr = { x: loc.pos.x, y: loc.pos.y, z: loc.pos.z }, q = autour(pr.x, pr.y, pr.z, 2.5) || pr;
      jeu.teleporter(prop.id, q.x, q.y, q.z);
      const j0 = SP.n;
      jeu.commande(prop.id, { ax: 0, ay: 1, amp: 1, sprint: true, lacet: prop.cmd.lacet }, 1.5);
      jeu.avancer(1.6);
      const temoin = SP.journal.filter((j) => j.n > j0).filter((j) => j.nom === 'frottement').length;
      E.fin();
      res.push([`chasseurs déplacés ${bouges.join(', ')} m`, bouges.every((d) => d === 0)], [`${tirs} tir de chasseur`, tirs === 0],
        [`caméra ${dq.toExponential(1)} rad`, dq < 1e-6], [`panneau ${C1 ? 'chrono ' + r2(C1.chrono) + ', ' + C1.roles.length + ' rôles' : 'absent'}`, !!C1 && C1.chrono > 0 && C1.roles.length === 5],
        [`astuces ${C1 ? C1.astuces.length : 0} qui changent`, !!C1 && C1.astuces.length >= 2 && !!C2 && a1 !== a2],
        [`${recus} sons de props reçus par un cerveau de chasseur`, recus === 0], [`sons tus ${frottes}, joués ${joues}`, frottes > 0 && joues === 0],
        [`témoin : ${temoin} frottements entendus, ${recusTraque} reçus à la traque`, temoin > 0 && recusTraque > 0]);
    } finally { if (avant) Object.defineProperty(proto, 'entendre', avant); else delete proto.entendre; jeu.quitter('balade'); }
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'déplacements 0, 0 tir, caméra fixe, panneau (chrono, rôles, ≥ 2 astuces qui changent en 8 s), 0 son de prop vers un chasseur (cerveau, sons)',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  }, { delai: 120 });

  // 4. LA FIN DE LA CACHETTE : un prop resté humain est déguisé en le meuble le plus courant de SA pièce
  T('4 lâcher : le prop resté humain, déguisé en le type le plus courant de sa pièce', async () => avecFictifs(async ({ A, B, ajouter }) => {
    await lancer({ graine: 9, premierRole: 'prop' });
    const p = P(), loc = p.local, z = zoneId(loc.pos.x, loc.pos.y, loc.pos.z);
    // sa pièce : 60 tabourets fictifs et 10 poubelles ; le reste de la zone : 80 poubelles (loin, hors de vue)
    for (let k = 0; k < 60; k++) ajouter(pose(A.cle, 200 + k, loc.pos.y, 200, z));
    for (let k = 0; k < 10; k++) ajouter(pose(B.cle, 300 + k, loc.pos.y, 200, z));
    for (let k = 0; k < 80; k++) ajouter(pose(B.cle, 400 + k, loc.pos.y, 200, 'e1kahn' === z ? 'e1salle' : 'e1kahn'));
    p._deguisables.add(A.cle); p._deguisables.add(B.cle);
    const humainAvant = !loc.prop && loc.corps === loc.joueur;
    jusqua('traque');
    const cle = loc.prop ? loc.prop.cle : null, visible = loc.joueur.mesh.visible;
    // sans meuble au registre : le carton de secours
    await lancer({ graine: 9, premierRole: 'prop' }); const q = P(); q._deguisables.clear(); jusqua('traque');
    const cle2 = q.local.prop ? q.local.prop.cle : null;
    jeu.quitter('balade');
    return { ok: humainAvant && cle === A.cle && !visible && cle2 === 'carton', attendu: `humain jusqu’au lâcher → ${A.cle} (sa pièce ${z}), avatar caché ; registre vide → carton`,
      obtenu: `humain avant ${humainAvant} → ${cle}, avatar visible ${visible} ; registre vide → ${cle2}` };
  }), { delai: 90 });

  // 5. LES PÉNALITÉS : un vrai meuble −3 (FP-12 : −1 par plomb, −6 au plus par coup), « faux », −2 points ; mur ou sol : 0 ;
  //    grenade : 0 ; le chasseur à 0 PV, spectateur jusqu'à la fin de la manche
  T('5 vrai meuble : −3, plombs −1 (≤ −6), −2 points ; mur 0 ; grenade 0 ; à 0 PV spectateur', async () => avecFictifs(async ({ A }) => {
    const res = [];
    await lancer({ graine: 13, premierRole: 'chasseur' });
    const p = P(), loc = p.local; jusqua('traque');
    const P0 = pose(A.cle, 0, 0, 0); P0.i = 777; p._deguisables.add(A.cle);
    const E = ev(['faux', 'score', 'tir', 'elim']);
    const viser = () => { game.camYaw = loc.cmd.lacet; game.camPitch = 0; };
    // (a) une balle de PM-9 dans un vrai meuble
    poseSousLeTir(p, P0); viser();
    let v0 = loc.vie, s0 = loc.stats.score;
    front(0, { tir: true }); jeu.avancer(0.2);
    const f1 = E.L.filter((e) => e.type === 'faux'), tirs1 = E.L.filter((e) => e.type === 'tir' && e.a === 0).length;
    res.push([`PM-9 : ${tirs1} tir, vie ${v0} → ${r2(loc.vie)}, faux ${f1.map((e) => e.pv).join(',')}, score ${loc.stats.score - s0}`,
      tirs1 === 1 && Math.abs(loc.vie - (v0 - 3)) < 1e-9 && f1.length === 1 && f1[0].pv === 3 && f1[0].pose === 777 && loc.stats.score - s0 === -2 && loc.stats.rates === 1]);
    // (b) le FP-12 : 8 plombs → −6 (le plafond d'un coup), une seule ligne « VRAI MEUBLE »
    front(0, { armeN: 2 }); jeu.avancer(0.8);
    v0 = loc.vie; s0 = loc.stats.score; E.L.length = 0;
    front(0, { tir: true }); jeu.avancer(0.2);
    const f2 = E.L.filter((e) => e.type === 'faux');
    res.push([`FP-12 (${loc.arsenal.arme.id}) : vie ${v0} → ${r2(loc.vie)}, faux ${f2.map((e) => e.pv + '/' + e.n).join(',')}, score ${loc.stats.score - s0}`,
      loc.arsenal.arme.id === 'fp12' && Math.abs(loc.vie - (v0 - 6)) < 1e-9 && f2.length === 1 && f2[0].pv === 6 && f2[0].n === 8 && loc.stats.score - s0 === -2]);
    // (c) un mur ou un sol : rien
    delete p.poseTouchee; jeu.avancer(0.9);
    v0 = loc.vie; E.L.length = 0;
    front(0, { tir: true }); jeu.avancer(0.2); game.camPitch = 1.4; jeu.avancer(0.8); front(0, { tir: true }); jeu.avancer(0.2);
    res.push([`mur et sol : vie ${v0} → ${r2(loc.vie)}, ${E.L.filter((e) => e.type === 'faux').length} faux`, loc.vie === v0 && !E.L.some((e) => e.type === 'faux')]);
    // (d) une grenade (loin de tout le monde) sur un tas de vrais meubles : rien non plus
    poseSousLeTir(p, P0); v0 = loc.vie; E.L.length = 0;
    const g = p.grenades.lancer(loc, 'frag', 0.3); g.x = loc.pos.x + 40; g.y = loc.pos.y + 0.2; g.z = loc.pos.z; g.vx = g.vy = g.vz = 0; g.posee = true;
    jeu.avancer(0.5);
    res.push([`grenade : vie ${v0} → ${r2(loc.vie)}, ${E.L.filter((e) => e.type === 'faux').length} faux`, loc.vie === v0 && !E.L.some((e) => e.type === 'faux')]);
    // (e) à 0 PV : éliminé par les meubles, spectateur d'un vivant jusqu'à la fin de la manche
    front(0, { armeN: 1 }); jeu.avancer(0.6); loc.vie = 2; E.L.length = 0; viser();
    front(0, { tir: true }); jeu.avancer(0.2);
    const el = E.L.find((e) => e.type === 'elim' && e.cible === 0);
    jeu.avancer(5); p.majHud();
    const spect = p.hud.prop && p.hud.prop.spectateur, suivi = p.suivi;
    res.push([`à 0 PV : éliminé ${!!el} (${el ? el.arme : '-'}), phase ${p.phase}, suivi ${suivi ? suivi.nom : '-'}`, !!el && el.arme === 'meuble' && !loc.vivant && p.phase === 'traque' && !!suivi && suivi !== loc && suivi.vivant && !!spect]);
    p._finir('props'); jusqua('presentation', 10);
    res.push([`manche suivante : vivant ${loc.vivant}`, loc.vivant && loc.role === 'prop']);
    E.fin(); jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: '−3 / −6 (8 plombs), « faux » une fois par coup, −2 points ; mur, sol, grenade : 0 ; 0 PV → spectateur, vivant à la manche suivante',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  }), { delai: 90 });

  // 6. LE SOIN : + 25 % des dégâts faits à un prop, plafond 100
  T('6 soin : +25 % des dégâts faits à un prop, plafond 100', async () => {
    await lancer({ graine: 17, premierRole: 'chasseur' });
    const p = P(), loc = p.local; jusqua('traque');
    const prop = p.acteurs.find((a) => a.role === 'prop' && a.prop);
    const c = prop.pos, h = prop.prop.T.haut, q = autour(c.x, c.y, c.z, 3, { vue: true, cy: h / 2 });
    if (!q) { jeu.quitter('balade'); return { ok: false, attendu: 'un point à 3 m du prop', obtenu: 'aucun' }; }
    jeu.teleporter(0, q.x, q.y, q.z); p.pas(PAS);
    const E = ev(['touche', 'soin']);
    const tirer = (vie) => { loc.vie = vie; jeu.viser(0, { x: c.x, y: c.y + h / 2, z: c.z }); front(0, { tir: true }); jeu.avancer(0.2); };
    tirer(50);
    const t1 = E.L.find((e) => e.type === 'touche' && e.cible === prop.id), apres1 = loc.vie;
    E.L.length = 0; jeu.avancer(0.2);
    tirer(99);
    const t2 = E.L.find((e) => e.type === 'touche' && e.cible === prop.id), s2 = E.L.find((e) => e.type === 'soin' && e.a === 0);
    E.fin(); jeu.quitter('balade');
    const ok = !!t1 && Math.abs(apres1 - (50 + 0.25 * t1.degats)) < 1e-9 && !!t2 && loc.vie === 100 && !!s2 && Math.abs(s2.pv - 1) < 1e-9;
    return { ok, attendu: 'vie 50 + 25 % des dégâts ; à 99, plafonnée à 100 (soin de 1)',
      obtenu: `touche ${t1 ? r2(t1.degats) : '-'} → vie ${r2(apres1)} · puis ${t2 ? r2(t2.degats) : '-'} → ${r2(loc.vie)} (soin ${s2 ? r2(s2.pv) : '-'})` };
  });

  // 7. LES FINS DE MANCHE
  T('7 fins : props morts → chasseurs ; chrono à 0 → props ; chasseurs morts → props', async () => {
    const res = [];
    const un = async (fn) => { await lancer({ graine: 19, humain: false }); const p = P(); jusqua('traque'); fn(p); for (let i = 0; i < 4; i++) p.pas(PAS); const g = p.gagnantManche, ph = p.phase; return `${g}/${ph}`; };
    const a = await un((p) => { const h = p.acteurs.find((x) => x.role === 'chasseur'); for (const x of p.acteurs) if (x.role === 'prop') p.infliger(x, 1e9, { par: h.id }); });
    const b = await un((p) => { for (const x of p.acteurs) if (x.role === 'prop') x.vie = x.vieMax = 1e9; p.phaseT = p.phaseDuree - 2 * PAS; });
    const c = await un((p) => { for (const x of p.acteurs) if (x.role === 'chasseur') p.infliger(x, 1e9, { par: -1 }); });
    jeu.quitter('balade');
    res.push(['props morts ' + a, a === 'chasseurs/revelation'], ['chrono ' + b, b === 'props/revelation'], ['chasseurs morts ' + c, c === 'props/revelation']);
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'chasseurs / props / props, puis la révélation', obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  });

  // 8. LES CHANGEMENTS DE FORME : illimités en cachette ; 3 en traque, 5 s entre deux
  T('8 changements : illimités en cachette, 3 en traque à 5 s d’écart', async () => avecFictifs(async ({ A, B, ajouter }) => {
    await lancer({ graine: 21, premierRole: 'prop' });
    const p = P(), loc = p.local; p._deguisables.add(A.cle); p._deguisables.add(B.cle);
    jusqua('cachette');
    // un vrai meuble fictif à 0,9 m devant lui (visé), qui change de type entre deux essais
    const l = loc.cmd.lacet, P0 = ajouter(pose(A.cle, loc.pos.x - Math.sin(l) * 0.9, loc.pos.y, loc.pos.z - Math.cos(l) * 0.9));
    const E = ev(['deguise', 'refus']);
    // (le meuble visé : jamais la forme qu'il a déjà — celle-là ne change rien)
    const essai = () => { P0.cle = loc.prop && loc.prop.cle === A.cle ? B.cle : A.cle; game.camYaw = l; front(0, { deguiser: true }); };
    for (let k = 0; k < 6; k++) { essai(); jeu.avancer(0.3); }
    const enCachette = E.L.filter((e) => e.type === 'deguise' && e.a === 0).length, chgC = loc.prop ? loc.prop.changements : -1;
    // (relecture) figé, il le reste sous sa nouvelle forme ; puis F le défige en 0,25 s
    front(0, { figer: true }); const f0 = !!(loc.prop && loc.prop.fige);
    essai(); const f1 = !!(loc.prop && loc.prop.fige), cle1 = loc.prop ? loc.prop.cle : null;
    front(0, { figer: true }); jeu.avancer(0.3); const f2 = !!(loc.prop && loc.prop.fige);
    const okFige = f0 && f1 && !f2 && cle1 === P0.cle;
    jusqua('traque');
    const t0 = p.t + 0.5, ok = [];
    const a = (dt) => { jusquA(t0 + dt - PAS); const n0 = E.L.length; essai(); return E.L.slice(n0).some((e) => e.type === 'deguise' && e.a === 0); };
    ok.push(a(0), a(4.9), a(5.0), a(10.0), a(15.0));
    E.fin(); jeu.quitter('balade');
    const attendu = [true, false, true, true, false];
    return { ok: enCachette === 6 && chgC === 0 && okFige && ok.join() === attendu.join(), attendu: '6 changements en cachette (compteur 0) ; figé gardé au changement ; traque : oui, non à 4,9 s, oui à 5 s, oui, non (le 4e)',
      obtenu: `${enCachette} en cachette (compteur ${chgC}) ; figé ${f0} → changé en ${cle1} : figé ${f1}, puis défigé ${!f2} ; traque ${ok.map((x) => (x ? 'oui' : 'non')).join(', ')}` };
  }), { delai: 90 });

  // 9. LES PROVOCATIONS : forcées toutes les 40 s (départ décalé de 0 à 15 s), 20 s dans la dernière minute, 25 s pour le
  //    dernier prop, au sifflet et rayon × 1,3 ; volontaires : recharge 4 s, compteur remis à zéro, points (× 2 près d'un chasseur)
  T('9 provocations forcées (40 / 20 / 25 s) et volontaires (4 s, points, × 2)', async () => {
    const R = REGLAGES_PROP, res = [];
    // (a) une traque entière, props immortels
    await lancer({ graine: 23, humain: false });
    let p = P(); jusqua('traque');
    const t0 = p.t, props = p.acteurs.filter((a) => a.role === 'prop');
    for (const a of props) a.vie = a.vieMax = 1e9;
    let E = ev(['provocation']);
    jusqua('revelation', R.durees.e1[1] + 1);
    E.fin();
    const sif = PROVOCATIONS.find((x) => x.id === 'sifflet');
    let okF = true, okI = true; const dec = [], dm = t0 + R.durees.e1[1] - R.derniereMinute;
    for (const a of props) {
      const L = E.L.filter((e) => e.a === a.id).map((e) => { if (!e.forcee || e.id !== 'sifflet' || Math.abs(e.rayon - sif.rayon * 1.3) > 1e-9) okF = false; return e.t; });
      if (!L.length) { okI = false; continue; }
      const d = L[0] - t0 - R.provocation.periode; dec.push(r2(d));
      if (d < -PAS || d > 15 + PAS) okI = false;
      for (let i = 1; i < L.length; i++) {
        const D = L[i] - L[i - 1];
        if (L[i] < dm - PAS && Math.abs(D - 40) > 1.5 * PAS) okI = false;                     // avant la dernière minute : 40 s
        if (L[i - 1] > dm + PAS && Math.abs(D - 20) > 1.5 * PAS) okI = false;                 // dedans : 20 s
      }
    }
    res.push([`forcées : sifflet × 1,3 ${okF}`, okF], [`décalages ${dec.join(', ')} s, intervalles 40 puis 20`, okI && new Set(dec).size > 1]);
    // (b) le dernier prop : 25 s
    await lancer({ graine: 29, humain: false }); p = P(); jusqua('traque'); p.pas(PAS);
    const pr = p.acteurs.filter((a) => a.role === 'prop'), h = p.acteurs.find((a) => a.role === 'chasseur');
    for (const a of pr) a.vie = a.vieMax = 1e9;
    const dernier = pr[0]; for (const a of pr.slice(1)) { a.vie = 1; p.infliger(a, 10, { par: h.id }); }
    const ref = dernier.pp.provocRef;
    E = ev(['provocation']); jusquA(ref + 25 * 2 + 1); E.fin();
    const L = E.L.filter((e) => e.a === dernier.id).map((e) => e.t);
    res.push([`dernier prop : ${L.map((x) => r2(x - ref)).join(', ')} s après sa référence`, L.length >= 2 && Math.abs(L[0] - ref - 25) <= 1.5 * PAS && Math.abs(L[1] - L[0] - 25) <= 1.5 * PAS]);
    // (c) volontaires : Haythem prop
    await lancer({ graine: 31, premierRole: 'prop' }); p = P(); const loc = p.local; jusqua('traque');
    const loin = () => { for (const c of p.acteurs) if (c.role === 'chasseur') { const q = autour(loc.pos.x, loc.pos.y, loc.pos.z, 14) || { x: loc.pos.x + 30, y: loc.pos.y, z: loc.pos.z }; jeu.teleporter(c.id, q.x, q.y, q.z); } };
    loin(); E = ev(['provocation', 'score', 'refus']);
    const v = (n) => { const k = E.L.length; front(0, { provoc: n }); return E.L.slice(k); };
    const e1 = v(3), tA = p.t, refA = loc.pp.provocRef;
    jusquA(tA + 2); const e2 = v(0);
    jusquA(tA + 4); loin(); const e3 = v(5);
    const c0 = p.acteurs.find((a) => a.role === 'chasseur'), q = autour(loc.pos.x, loc.pos.y, loc.pos.z, 4) || { x: loc.pos.x + 1, y: loc.pos.y, z: loc.pos.z };
    jusquA(tA + 8.1); jeu.teleporter(c0.id, q.x, q.y, q.z); const e4 = v(1);
    E.fin(); jeu.quitter('balade');
    const pts = (L2) => L2.filter((e) => e.type === 'score' && e.raison === 'provocation').map((e) => e.points).join(',');
    const pr1 = e1.find((e) => e.type === 'provocation');
    res.push([`canard ${pr1 ? pr1.id : '-'} +${pts(e1)} (compteur remis : ${refA === tA})`, !!pr1 && pr1.id === 'canard' && !pr1.forcee && pts(e1) === '5' && refA === tA],
      [`à 2 s : ${e2.some((e) => e.type === 'provocation') ? 'jouée' : 'refusée'}`, !e2.some((e) => e.type === 'provocation') && e2.some((e) => e.type === 'refus')],
      [`à 4 s : sonnerie +${pts(e3)}`, pts(e3) === '10'], [`chasseur à < 10 m : sifflet +${pts(e4)}`, pts(e4) === '12']);
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'forcées au sifflet (rayon × 1,3), 1re à 40 + [0, 15] s, puis 40, 20 dans la dernière minute, 25 pour le dernier ; volontaires 4 s, +5 / +10, × 2',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  }, { delai: 120 });

  // 10. LE SCANNER : 3 charges, 8 s, 12 m, même niveau, arc ± 20° semé, bandes ; le bip des props à moins de 12 m
  T('10 scanner : 3 charges, 8 s, 12 m, même niveau, ± 20°, bandes ; bip à < 12 m', async () => {
    const res = [];
    const scan = async (graine) => {
      await lancer({ graine, premierRole: 'chasseur', chasseurSeul: true, acteurs: 6 });
      const p = P(), loc = p.local;
      // (relecture) X pendant la cachette : refusé, avec sa raison, et rien de scanné
      jusqua('cachette'); const E0 = ev(['scanner', 'refus']); front(0, { scanner: true }); E0.fin();
      const avant = E0.L.map((e) => e.type + (e.raison ? ' « ' + e.raison + ' »' : '')).join(', '), scans0 = E0.L.filter((e) => e.type === 'scanner').length;
      jusqua('traque');
      // Haythem au milieu de la pause orange ; cinq props à 3, 6, 10, 13 m (même niveau) et un au RDC juste en dessous
      const c = { x: 12.63, y: 3.5, z: -7.87 }; jeu.teleporter(0, c.x, c.y, c.z, 0); p.pas(PAS);
      const pr = p.acteurs.filter((a) => a.role === 'prop'), D = [3, 6, 10, 13], vrais = [];
      pr.forEach((a, i) => jeu.teleporter(a.id, 5.38 + i * 0.8, 0, -15.12));
      D.forEach((d, i) => { const q = autour(c.x, c.y, c.z, d, { k0: i * 11 }); if (q) { jeu.teleporter(pr[i].id, q.x, q.y, q.z); vrais.push({ id: pr[i].id, d, az: Math.atan2(-(q.x - c.x), -(q.z - c.z)) }); } });
      const qb = autour(c.x, 0, c.z, 1.5) || { x: c.x, y: 0, z: c.z }; jeu.teleporter(pr[4].id, qb.x, qb.y, qb.z);
      const E = ev(['scanner', 'refus']);
      front(0, { scanner: true });
      const s1 = E.L.find((e) => e.type === 'scanner');
      jusquA(p.t + 1); front(0, { scanner: true }); const r1 = E.L.filter((e) => e.type === 'refus').length;
      jusquA(p.t + 7.5); front(0, { scanner: true }); jusquA(p.t + 8.05); front(0, { scanner: true });
      const n = E.L.filter((e) => e.type === 'scanner').length, charges = loc.pp.scanCharges;
      jusquA(p.t + 8.05); front(0, { scanner: true }); const vide = E.L.filter((e) => e.type === 'refus').pop();
      E.fin();
      // (relecture) « Voir les sons » : ce qu'il entendrait — une provocation à 5 m, une au RDC juste en dessous (3,5 m, à
      // travers la dalle), une à 30 m (hors de ses 18 m) ; jamais celles de Haythem
      p.opts.aides.voirSons = true;
      const coucou = (id, x, y, z) => p.evt('provocation', { a: id, id: 'coucou', n: 0, x, y, z, forcee: false, rayon: 18, duree: 0.6, points: 0 });
      coucou(pr[0].id, c.x + 5, c.y, c.z); coucou(pr[1].id, c.x, 0, c.z); coucou(pr[2].id, c.x + 30, c.y, c.z); coucou(0, c.x + 1, c.y, c.z);
      p.majHud(); const sons = (p.hud.prop.sons || []).map((s) => `${r2(Math.hypot(s.x - c.x, s.y - c.y, s.z - c.z))} m${s.dalle ? ' (dalle)' : ''}`).sort();
      return { s1, vrais, r1, n, charges, vide, autres: vrais.length, avant, scans0, sons };
    };
    const A = await scan(37), B = await scan(37);
    const S1 = A.s1 ? A.s1.resultats : [];
    const bandes = S1.map((r) => r.bande).sort().join(','), attendu = A.vrais.filter((v) => v.d < 12).map((v) => (v.d < 4 ? 0 : v.d < 8 ? 1 : 2)).sort().join(',');
    // chaque résultat dans ± 20° de la direction vraie d'un prop de sa bande
    const arcs = S1.every((r) => A.vrais.some((v) => v.d < 12 && (v.d < 4 ? 0 : v.d < 8 ? 1 : 2) === r.bande && Math.abs(angle(r.dir - v.az)) <= 20 * DEG + 1e-9));
    const seme = !!B.s1 && JSON.stringify(B.s1.resultats) === JSON.stringify(S1);
    res.push([`1er scan : bandes ${bandes} (attendu ${attendu}, ${A.autres} props posés)`, bandes === attendu && S1.length === 3], [`arcs ± 20° ${arcs}`, arcs], [`semé ${seme}`, seme],
      [`recharge : refusé à 1 s (${A.r1}), ${A.n} scans, charges ${A.charges}, puis « ${A.vide ? A.vide.raison : '-'} »`, A.r1 === 1 && A.n === 3 && A.charges === 0 && !!A.vide && /vide/i.test(A.vide.raison)],
      [`en cachette : ${A.avant || 'rien'}`, /^refus « [^»]*traque »$/.test(A.avant) && A.scans0 === 0],
      [`voir les sons : ${A.sons.join(', ') || 'rien'}`, A.sons.join() === '3.5 m (dalle),5 m']);
    // le bip : Haythem prop, un chasseur bot qui scanne à 8 m (entendu), puis à 14 m (pas entendu)
    await lancer({ graine: 41, premierRole: 'prop' }); const p = P(), loc = p.local; jusqua('traque');
    const SP = p.aff.sonsProp, h = p.acteurs.find((a) => a.role === 'chasseur');
    const bip = (d) => { const q = autour(loc.pos.x, loc.pos.y, loc.pos.z, d) || { x: loc.pos.x + d, y: loc.pos.y, z: loc.pos.z }; jeu.teleporter(h.id, q.x, q.y, q.z); p.aff.sons.maj(5, game.camera); const j0 = SP.n; front(h.id, { scanner: true }); return SP.journal.filter((j) => j.n > j0).filter((j) => j.nom === 'bip').length; };
    const b8 = bip(8); jusquA(p.t + 8.1); const b14 = bip(14);
    jeu.quitter('balade');
    res.push([`bip à 8 m : ${b8}, à 14 m : ${b14}`, b8 === 1 && b14 === 0]);
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: '3 résultats (bandes 0, 1, 2 ; ni 13 m ni l’autre niveau), ± 20°, semés ; 3 charges à 8 s d’écart ; bip à 8 m, pas à 14 m',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  }, { delai: 120 });

  // 11. LE BARÈME du § 3.9 : chaque ligne une fois
  T('11 barème : survie, provocation, manche, dernier, élimination, aide, vrai meuble, équipe', async () => avecFictifs(async ({ A }) => {
    const R = REGLAGES_PROP.points, res = [];
    await lancer({ graine: 43, premierRole: 'prop' });
    const p = P(), loc = p.local; jusqua('traque');
    const E = ev(['score']), t0 = p.t;
    const props = p.acteurs.filter((a) => a.role === 'prop' && !a.local), ch = p.acteurs.filter((a) => a.role === 'chasseur');
    for (const a of p.acteurs) if (a.role === 'prop') a.vie = a.vieMax = 1e9;
    for (const c of ch) { const q = autour(loc.pos.x, loc.pos.y, loc.pos.z, 15) || { x: loc.pos.x + 30, y: loc.pos.y, z: loc.pos.z }; jeu.teleporter(c.id, q.x, q.y, q.z); }
    // la survie : 30 s
    jusquA(t0 + 30 + PAS);
    const surv = E.L.filter((e) => e.raison === 'survie' && e.id === 0).map((e) => e.points);
    // une provocation volontaire loin des chasseurs (le rire : 6)
    for (const c of ch) { const q = autour(loc.pos.x, loc.pos.y, loc.pos.z, 15) || { x: loc.pos.x + 30, y: loc.pos.y, z: loc.pos.z }; jeu.teleporter(c.id, q.x, q.y, q.z); }
    front(0, { provoc: 4 });
    const pv = E.L.filter((e) => e.raison === 'provocation' && e.id === 0).map((e) => e.points);
    // deux props bots éliminés : le premier par ch[0] avec 30 % de ch[1] (aide), le second par ch[0] avec 20 % de ch[1] (pas d'aide)
    const [P1, P2] = props, [H1, H2] = ch;
    for (const [Pk, part] of [[P1, 0.3], [P2, 0.2]]) { Pk.vie = Pk.vieMax = 100; Pk.pp.deg = {}; p.infliger(Pk, 100 * part, { par: H2.id }); p.infliger(Pk, 1e9, { par: H1.id }); }
    const elims = E.L.filter((e) => e.raison === 'elim' && e.id === H1.id).length, aides = E.L.filter((e) => e.raison === 'aide' && e.id === H2.id).length;
    // une balle de chasseur dans un vrai meuble (fictif) : −2
    const P0 = pose(A.cle, 0, 0, 0); p._deguisables.add(A.cle); poseSousLeTir(p, P0);
    H1.arsenal.prochain = 0; jeu.commande(H1.id, { tir: true, lacet: H1.cmd.lacet, tangage: 0 }, 1.5 * PAS); p.pas(PAS); jeu.avancer(0.1);
    const meuble = E.L.filter((e) => e.raison === 'meuble' && e.id === H1.id).map((e) => e.points);
    delete p.poseTouchee;
    // la fin au chrono, Haythem dernier prop vivant
    p.phaseT = p.phaseDuree - 2 * PAS; for (let i = 0; i < 4; i++) p.pas(PAS);
    const fin = (id, r) => E.L.filter((e) => e.id === id && e.raison === r).map((e) => e.points).join(',');
    E.fin(); jeu.quitter('balade');
    res.push([`survie 30 s +${surv.join(',')}`, surv.join() === String(R.survie30)], [`provocation (rire) +${pv.join(',')}`, pv.join() === '6'],
      [`élimination ${elims} × ${R.propElimine}, aide ${aides} × ${R.aide}`, elims === 2 && aides === 1], [`vrai meuble ${meuble.join(',')}`, meuble.join() === String(R.vraiMeuble)],
      [`Haythem : manche +${fin(0, 'manche')}, dernier +${fin(0, 'dernier')}, équipe +${fin(0, 'equipe')} ; prop mort : équipe +${fin(P1.id, 'equipe')} ; chasseur : équipe ${fin(H1.id, 'equipe') || 'rien'}`,
        fin(0, 'manche') === String(R.mancheSurvecue) && fin(0, 'dernier') === String(R.dernierProp) && fin(0, 'equipe') === String(R.equipeGagnante) && fin(P1.id, 'equipe') === String(R.equipeGagnante) && !fin(H1.id, 'equipe')]);
    // l'équipe des chasseurs gagnante : +50 chacun
    await lancer({ graine: 47, premierRole: 'chasseur' }); const q = P(); jusqua('traque');
    const F = ev(['score']); for (const a of q.acteurs) if (a.role === 'prop') q.infliger(a, 1e9, { par: 0 }); q.pas(PAS); F.fin();
    const eqC = q.acteurs.filter((a) => a.role === 'chasseur').map((a) => F.L.filter((e) => e.id === a.id && e.raison === 'equipe').map((e) => e.points).join(','));
    jeu.quitter('balade');
    res.push([`chasseurs gagnants : ${eqC.join(' / ')}`, eqC.every((s) => s === String(R.equipeGagnante))]);
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: '+10 · +6 · +100 et +40 (30 %, pas à 20 %) · −2 · +50 +25 +50 au dernier prop, +50 à chaque prop de l’équipe gagnante · +50 à chaque chasseur gagnant',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  }), { delai: 90 });

  // 12. LE CHANGEMENT DE RÔLE : le profil de touches changé et purgé (prop : E = déguiser ; chasseur : R = recharger)
  T('12 changement de rôle : appliquerProfil({ purger: true }), E déguiser / R recharger', async () => {
    const res = [], inp = game.input, ap = game.appliquerProfil, appels = [];
    game.appliquerProfil = function (o) { appels.push(!!(o && o.purger)); return ap.call(this, o); };
    try {
      await lancer({ graine: 53, premierRole: 'prop' });
      const p = P();
      res.push([`manche 1 : ${p.profil}, E → ${(inp.bind.deguiser || []).includes('KeyE')}`, p.profil === 'prop' && (inp.bind.deguiser || []).includes('KeyE')]);
      for (const [n, role, profil] of [[2, 'chasseur', 'combat'], [3, 'prop', 'prop']]) {
        jusqua('traque'); p._finir('props'); jusqua('revelation', 1);
        appels.length = 0; inp.presser('KeyZ'); inp.relacher('KeyZ'); touche('KeyQ'); touche('KeyQ', false);
        jusqua('presentation', 10);
        const vide = inp.pressedSet.size === 0 && inp.releasedSet.size === 0;
        const cle = role === 'prop' ? (inp.bind.deguiser || []).includes('KeyE') : (inp.bind.recharger || []).includes('KeyR') && !inp.bind.deguiser;
        res.push([`manche ${n} : ${p.local.role} / ${p.profil}, purge ${appels.join(',')} (vidé ${vide}), touche ${cle}`, p.local.role === role && p.profil === profil && appels.includes(true) && vide && cle]);
      }
    } finally { game.appliquerProfil = ap; jeu.quitter('balade'); }
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'prop (E déguiser) → chasseur (R recharger, profil combat) → prop, chaque fois appliquerProfil({ purger: true }) et les fronts vidés',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  });

  // 13. LA ROUE DES PROVOCATIONS : chiffres sans pas, G, geste, stick, T sans choix ; jamais game.wheel ; pas d'emote fantôme
  T('13 roue : chiffres sans pas, G = la dernière, 8 directions (souris, stick), T sans choix ; jamais game.wheel', async () => {
    const res = [], inp = game.input;
    await lancer({ graine: 59, premierRole: 'prop' });
    const p = P(), c = p.local.cmd;
    // (a) provoc1-8 pressés pendant une image SANS pas → la commande du pas suivant
    const chiffres = [];
    for (let n = 1; n <= 8; n++) { touche('Digit' + n); touche('Digit' + n, false); inp.endFrame(); p.pas(PAS); chiffres.push(c.provoc === n - 1); }
    res.push([`chiffres ${chiffres.filter(Boolean).length} / 8`, chiffres.every(Boolean)]);
    // (b) les 8 directions, à la souris (game._onMove) puis au stick, roue ouverte : la caméra ne bouge pas
    jusqua('cachette');
    const souris = [], stick = [];
    let yawFixe = true;
    for (let k = 0; k < 8; k++) {
      touche('KeyT'); p.pas(PAS);
      const yaw = game.camYaw, th = k * Math.PI / 4;
      window.dispatchEvent(new MouseEvent('mousemove', { movementX: Math.round(60 * Math.sin(th)), movementY: Math.round(-60 * Math.cos(th)) }));
      souris.push(p.roue.choix); if (game.camYaw !== yaw) yawFixe = false;
      touche('KeyT', false); p.pas(PAS);
      const lache = c.provoc;
      touche('KeyT'); p.pas(PAS); p.mouvementStick(Math.sin(th), -Math.cos(th)); stick.push(p.roue.choix); touche('KeyT', false); p.pas(PAS);
      if (lache !== k) souris[k] = 'lâché ' + lache;
    }
    res.push([`souris ${souris.join(',')}`, souris.join() === '0,1,2,3,4,5,6,7'], [`stick ${stick.join(',')}`, stick.join() === '0,1,2,3,4,5,6,7'], [`caméra immobile ${yawFixe}`, yawFixe]);
    // (c) T relâché sans choix : rien
    touche('KeyT'); p.pas(PAS); touche('KeyT', false); p.pas(PAS);
    res.push([`T sans choix : provoc ${c.provoc}`, c.provoc === -1 && !p.roueOuverte()]);
    // (d) G = la dernière (en traque : la provocation part)
    jusqua('traque');
    const E = ev(['provocation']);
    touche('Digit3'); touche('Digit3', false); p.pas(PAS);
    jusquA(p.t + 4.2); touche('KeyG'); touche('KeyG', false); p.pas(PAS);
    E.fin();
    const ids = E.L.filter((e) => e.a === 0 && !e.forcee).map((e) => e.id);
    res.push([`provoc3 puis G : ${ids.join(', ')}`, ids.length === 2 && ids[0] === PROVOCATIONS[2].id && ids[1] === PROVOCATIONS[2].id]);
    // (e) game.wheel jamais ouverte ; pas d'emote fantôme, roue fermée puis ouverte
    const f = await jeu.verifierEntrees();
    touche('KeyT'); p.pas(PAS); const ouverte = p.roueOuverte();
    const o = await jeu.verifierEntrees();
    touche('KeyT', false);
    res.push([`game.wheel ${game.wheel.isOpen ? 'ouverte' : 'fermée'} ; emote fantôme ${f.emoteFantome} / ${o.emoteFantome} (roue ${ouverte ? 'ouverte' : '?'})`, !game.wheel.isOpen && f.emoteFantome === 0 && o.emoteFantome === 0 && ouverte]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: '8 chiffres, 8 secteurs à la souris et au stick dans l’ordre, caméra immobile, T sans choix → rien, G = la dernière, game.wheel fermée, 0 emote fantôme',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  });

  // 14. LES SONS : 8 recettes aux durées ± 0,05 s (journalAudio), ≤ 24 voix, la dalle × 0,35 et 900 Hz
  T('14 sons : 8 provocations aux durées ± 0,05 s, ≤ 24 voix, dalle × 0,35 / 900 Hz', async () => {
    const res = [], J = jeu.journalAudio;
    await lancer({ graine: 61, premierRole: 'prop' });
    const p = P(), SP = p.aff.sonsProp, S = p.aff.sons, loc = p.local;
    jeu.avancer(0.5);
    // (a) les durées programmées (premier start → dernier stop)
    const dur = PROVOCATIONS.map((q, n) => {
      J.vider(); SP.jouerProvocation(n);
      const st = J.entrees.filter((e) => e.methode === 'start').map((e) => e.quand), sp = J.entrees.filter((e) => e.methode === 'stop').map((e) => e.quand);
      return st.length && sp.length ? Math.max(...sp) - Math.min(...st) : -1;
    });
    const okD = dur.every((d, n) => Math.abs(d - PROVOCATIONS[n].duree) <= 0.05);
    res.push([`durées ${dur.map(r2).join(' / ')}`, okD]);
    // (b) toutes les recettes jouent (les petits bruits compris), sans exception
    let err = null; for (const nom of Object.keys(RECETTES_PROP)) { try { SP.jouer(nom, 0, 0, 0, { local: true }); } catch (e) { err = nom + ' : ' + e.message; } }
    res.push([`${Object.keys(RECETTES_PROP).length} recettes ${err || 'sans exception'}`, !err]);
    // (c) 40 provocations d'un coup : 24 voix au plus (12 au téléphone)
    for (let k = 0; k < 40; k++) SP.jouerProvocation(k % 8);
    const max = window.__chargement && window.__chargement.telephone ? 12 : 24;
    res.push([`voix ${S.voix.length} (max ${max})`, S.voix.length <= max]);
    jeu.avancer(2);
    // (d) la dalle : une même provocation sous les pieds de Haythem, au même niveau puis au niveau d'en dessous
    const x = loc.pos.x, y = loc.pos.y, z = loc.pos.z;
    J.vider(); SP.jouer('coucou', x, y, z, { rayon: 30, gain: 1 }); const A0 = J.entrees.slice();
    J.vider(); SP.jouer('coucou', x, y - 3.5, z, { rayon: 30, gain: 1 }); const B0 = J.entrees.slice();
    const g1 = A0[0] && A0[0].methode === 'setValueAtTime' ? A0[0].valeur : NaN, i9 = B0.findIndex((e) => e.methode === 'setValueAtTime' && e.valeur === REGLAGES_SONS.dalle.coupure);
    const g2 = i9 >= 0 && B0[i9 + 1] ? B0[i9 + 1].valeur : NaN, D = REGLAGES_SONS.distance;
    const att = S.spatial ? 1 : D.reference / (D.reference + D.attenuation * (3.5 - D.reference));
    const okDalle = !A0.some((e) => e.valeur === REGLAGES_SONS.dalle.coupure) && i9 >= 0 && Math.abs(g2 / g1 - REGLAGES_SONS.dalle.gain * att) < 0.01 && niveauDe(y + 0.5) !== niveauDe(y - 3.5 + 0.5);
    res.push([`dalle : 900 Hz ${i9 >= 0}, gain ${r2(g1)} → ${g2.toFixed(3)} (× ${r2(g2 / g1)}, attendu × ${r2(REGLAGES_SONS.dalle.gain * att)})`, okDalle]);
    // (e) hors de portée : rien
    const v = SP.jouer('frottement', x + 9, y, z, { rayon: REGLAGES_SONS.rayons.frottement });
    res.push([`frottement à 9 m (rayon 7) : ${v ? 'joué' : 'rien'}`, !v]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'durées 0,6 / 0,7 / 0,8 / 0,9 / 1,2 / 1,6 / 1,0 / 1,4 ± 0,05 ; ≤ 24 voix ; à travers la dalle 900 Hz et × 0,35 ; rien hors de portée',
      obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') };
  });

  // 14 bis. CE QUE L'ON ENTENDRAIT : chaque recette rendue hors ligne (OfflineAudioContext, sans geste) au volume d'une voix
  //     — ni NaN, ni saturation (crête < 1), assez forte pour s'entendre (efficace ≥ 0,01) ; mesures notées
  T('14b sons : chaque recette rendue hors ligne — ni NaN, ni saturation, audible', async (t) => {
    const sr = 22050, L = [];
    const bruit = (ctx) => { const b = ctx.createBuffer(1, sr, sr), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
    for (const [nom, rec] of Object.entries(RECETTES_PROP)) {
      const ctx = new OfflineAudioContext(1, Math.ceil(sr * 2), sr), g = ctx.createGain();
      g.gain.value = PROVOCATIONS.some((q) => q.id === nom) ? REGLAGES_SONS.provocation * REGLAGES_SONS.forcee : 0.8; g.connect(ctx.destination);
      const duree = rec(ctx, g, 0.01, bruit(ctx));
      const x = (await ctx.startRendering()).getChannelData(0);
      let crete = 0, e = 0, nan = false;
      for (let i = 0; i < x.length; i++) { const v = x[i]; if (!Number.isFinite(v)) nan = true; else { crete = Math.max(crete, Math.abs(v)); e += v * v; } }
      L.push({ nom, duree, crete, eff: Math.sqrt(e / Math.max(1, duree * sr)), nan });
    }
    t.note('sons rendus (nom : crête / efficace)', L.map((s) => `${s.nom} ${s.crete.toFixed(2)}/${s.eff.toFixed(3)}`).join(' · '));
    const ko = L.filter((s) => s.nan || s.crete >= 1 || s.eff < 0.01);
    return { ok: !ko.length, attendu: 'crête < 1, efficace ≥ 0,01, aucun NaN, pour les ' + L.length + ' recettes',
      obtenu: ko.length ? 'hors bornes : ' + ko.map((s) => `${s.nom} ${s.crete.toFixed(2)}/${s.eff.toFixed(3)}${s.nan ? ' NaN' : ''}`).join(', ') : L.map((s) => `${s.nom} ${s.crete.toFixed(2)}/${s.eff.toFixed(3)}`).join(' · ') };
  });

  // 15. LE DÉTERMINISME ET L'ÉTAT : verifierDeterminisme(42, 60) ; verifierEtat en cachette, traque, révélation (et une manche
  //     où les rôles ont tourné, avec Haythem)
  T('15 verifierDeterminisme(42, 60), verifierEtat en cachette, traque, révélation', async () => {
    const o = { mode: 'prophunt', zone: 'e1', acteurs: 5, humain: false, difficulte: 'normal' };
    const d = await jeu.verifierDeterminisme(42, 60, o);
    // l'heure de la 1re révélation (la même graine, la même partie)
    await jeu.lancer('prophunt', { ...o, graine: 71 }); const p = P(); jusqua('revelation', 300); const tRev = p.t; jeu.quitter('balade');
    const eC = await jeu.verifierEtat({ ...o, graine: 71, secondes: 10 });
    const eT = await jeu.verifierEtat({ ...o, graine: 71, secondes: 60 });
    const eR = await jeu.verifierEtat({ ...o, graine: 71, secondes: tRev + 2 });
    const phR = jeu._dernierEtat ? jeu._dernierEtat.e1.phase : null;
    // avec Haythem (sans clavier), la traque de la manche 2 : il chasse, un chasseur bot est devenu prop — l'état rendu
    // dans une partie neuve (encore à la manche 1) refait les rôles
    const oH = { ...o, humain: true, premierRole: 'prop', graine: 73 };
    await jeu.lancer('prophunt', oH); const q = P(); let tM2 = -1;
    const dq = q.sur('phase', (e) => { if (e.phase === 'traque' && q.manche === 2 && tM2 < 0) tM2 = q.t; });
    jeu.avancer(2 * 260); dq(); jeu.quitter('balade');
    const eM = tM2 > 0 && await jeu.verifierEtat({ ...oH, secondes: tM2 + 2 });
    const rM = jeu._dernierEtat ? jeu._dernierEtat.e1.acteurs.find((a) => a.id === 0) : null;
    return { ok: d.egal && eC && eT && eR && phR === 'revelation' && eM && !!rM && rM.role === 'chasseur', attendu: 'déterminisme égal ; état vrai en cachette, traque, révélation, et à la manche 2 (rôles tournés)',
      obtenu: `${d.a} / ${d.b} · cachette ${eC} · traque ${eT} · révélation ${eR} (${phR}, à ${r2(tRev + 2)} s) · manche 2 ${eM} (Haythem ${rM ? rM.role : '-'}, à ${r2(tM2 + 2)} s)` };
  }, { delai: 300 });

  // 16. LES CHASSEURS : sprint à endurance en traque (sprintLimite), jamais de sprint tactique (double Maj, SOURIS 5)
  T('16 chasseurs : sprintLimite en traque, pas de sprint tactique', async () => {
    await lancer({ graine: 79, premierRole: 'chasseur' });
    const p = P(), inp = game.input, c = p.local.cmd; jusqua('traque');
    const lim = p.acteurs.filter((a) => a.role === 'chasseur').every((a) => a.sprintLimite), props = p.acteurs.filter((a) => a.role === 'prop').every((a) => !a.sprintLimite);
    let tact = false;
    touche('ShiftLeft'); p.pas(PAS); tact = tact || c.sprintTact; touche('ShiftLeft', false); p.pas(PAS);
    touche('ShiftLeft'); p.pas(PAS); tact = tact || c.sprintTact; touche('ShiftLeft', false); p.pas(PAS);
    inp.presser('Souris:4'); p.pas(PAS); tact = tact || c.sprintTact; inp.relacher('Souris:4'); p.pas(PAS);
    jeu.quitter('balade');
    return { ok: lim && props && !tact, attendu: 'chasseurs sprintLimite, props non ; double Maj et SOURIS 5 sans sprint tactique', obtenu: `chasseurs ${lim} · props ${props} · tactique ${tact}` };
  });

  // ---------------------------------------------------------------- À F2 (les vrais modules des autres lots)
  // le vrai catalogue (L-K) : la zone par défaut, une balle dans une VRAIE pose (sans pose fictive) → « faux »
  T('F2 · catalogue réel : zone par défaut, une balle dans un vrai meuble', async () => {
    const z = typesDeguisables('ss').length >= REGLAGES_PROP.typesMin ? 'ss' : 'e1';
    await lancer({ graine: 83, premierRole: 'chasseur', zone: z });
    const p = P(); jusqua('traque');
    const pieces = piecesDe(p.zone), L = MEUBLES.poses.filter((q) => p._deguisables.has(q.cle) && pieces.has(q.zone));
    let cible = null, q = null;
    for (const P0 of L) { q = autour(P0.cx, P0.y0, P0.cz, 2.5, { vue: true, cy: (P0.y1 - P0.y0) / 2 }); if (q) { cible = P0; break; } }
    if (!cible) { jeu.quitter('balade'); return { ok: false, attendu: 'une vraie pose déguisable visible à 2,5 m', obtenu: `${L.length} poses, aucune visible` }; }
    jeu.teleporter(0, q.x, q.y, q.z); p.pas(PAS);
    jeu.viser(0, { x: cible.cx, y: (cible.y0 + cible.y1) / 2, z: cible.cz });
    const E = ev(['faux']); front(0, { tir: true }); jeu.avancer(0.2); E.fin();
    jeu.quitter('balade');
    return { ok: E.L.length === 1 && E.L[0].pose === cible.i, attendu: `zone ${z} ; « faux » sur la pose ${cible.i} (${cible.cle})`, obtenu: `${E.L.map((e) => e.pose + ' −' + e.pv).join(', ') || 'rien'}` };
  }, { apresFusion: true });

  // la poursuite (L-B : sprint à endurance ; L-K : la vitesse d'un prop) : 6 m d'avance, pas rattrapé en 4 s ; puis l'écart
  // se referme à ≤ 0,5 m/s
  T('F2 · poursuite : 6 m d’avance tenus 4 s, puis l’écart se referme à ≤ 0,5 m/s', async () => {
    await lancer({ graine: 89, premierRole: 'chasseur', chasseurSeul: true });
    const p = P(); jusqua('traque');
    // le type le plus proche de 4,5 m/s (le Tolix) ; une ligne droite libre de 40 m (sinon 30) dans l'école
    const types = [...CATALOGUE.values()].filter((T0) => T0.deguisable && p._deguisables.has(T0.cle));
    types.sort((a, b) => Math.abs(a.vitesse - 4.5) - Math.abs(b.vitesse - 4.5));
    const T0 = types[0], C = game.collisions;
    let ligne = null;
    for (const L of [40, 30]) {
      for (const y of [0, 3.5, 6.6, -3.06]) for (let z = -24; z <= 5 && !ligne; z += 0.5) for (let x = -2; x + L <= 23 && !ligne; x += 1) {
        if (Math.abs(C.solEn(x, z, y + 0.3) - y) > 0.05 || Math.abs(C.solEn(x + L, z, y + 0.3) - y) > 0.05) continue;
        if (C.rayonLibre(x, y + 0.5, z, x + L, y + 0.5, z, 0.55) >= 0.999 && C.rayonLibre(x, y + 1.5, z, x + L, y + 1.5, z, 0.4) >= 0.999) ligne = { x, y, z, L };
      }
      if (ligne) break;
    }
    if (!T0 || !ligne) { jeu.quitter('balade'); return { ok: false, attendu: 'un type et une ligne droite', obtenu: `${T0 ? T0.cle : 'aucun type'} · ${ligne ? 'ligne' : 'aucune ligne'}` }; }
    const prop = p.acteurs.find((a) => a.role === 'prop');
    jeu.teleporter(prop.id, ligne.x + 6, ligne.y, ligne.z); p._deguiser(prop, T0.cle); prop.cerveau = null; prop.vie = prop.vieMax = 1e9;
    jeu.teleporter(0, ligne.x, ligne.y, ligne.z, -Math.PI / 2);
    jeu.commande(prop.id, { ax: 0, ay: 1, amp: 1, sprint: true, lacet: -Math.PI / 2 }, 8);
    jeu.commande(0, { ax: 0, ay: 1, amp: 1, sprint: true, lacet: -Math.PI / 2, tangage: 0 }, 8);
    const ecart = () => prop.pos.x - p.local.pos.x;
    jeu.avancer(4); const e4 = ecart();
    jeu.avancer(1); const e5 = ecart(); jeu.avancer(1); const e6 = ecart();
    jeu.quitter('balade');
    const ferme = e5 - e6;
    return { ok: e4 > 0 && ferme > 0 && ferme <= 0.5 + 0.05, attendu: '> 0 m d’écart à 4 s ; puis il se referme de 0 à 0,5 m/s', obtenu: `${T0.cle} (${r2(T0.vitesse)} m/s) · écart ${r2(e4)} m à 4 s · ${r2(ferme)} m/s ensuite` };
  }, { apresFusion: true, delai: 60 });

  // les sons spatialisés (L-H) : SonsProp n'atténue plus ni ne place le son lui-même ; la voix a son PannerNode
  T('F2 · sons spatialisés : la voix de SonsJeu, sans panoramique de secours', async () => {
    await lancer({ graine: 97, premierRole: 'prop' });
    const p = P(), SP = p.aff.sonsProp, S = p.aff.sons, loc = p.local, J = jeu.journalAudio;
    jusqua('traque');
    J.vider(); const v = SP.jouer('coucou', loc.pos.x + 5, loc.pos.y, loc.pos.z, { rayon: 18 });
    jeu.quitter('balade');
    return { ok: !!S.spatial && !!v && !!v.panner, attendu: 'sonsJeu.spatial vrai ; la voix a un panneau', obtenu: `spatial ${!!S.spatial} · voix ${!!v} · panneau ${!!(v && v.panner)}` };
  }, { apresFusion: true });
}
