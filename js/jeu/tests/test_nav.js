// =====================================================================
//  LES TESTS DU LOT L-D — navigation, pilotage, apparitions (23/10 ; spec § 5.5.6, acceptation, points 1 à 16)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-D` (window.__rapport). Tout passe par window.__jeu et par les
// modules eux-mêmes : jamais un clic. Les seuils de TEMPS par `t.temps` (relatifs pendant la vague : d'autres agents
// tournent) ; les COMPTES ne sont jamais relatifs. Les tests `apresFusion` attendent les vrais modules de la vague 2
// (tables des portes de L-M, `vue` de L-A, franchissement de L-B, cachettes de L-K) : F2 les lance (`&fusion=1`).
import { Nav, BORNES_NAV } from '../nav.js';
import { lireNav, oublierBase } from '../nav_cache.js';
import { Pilote } from '../pilotage.js';
import { POINTS_APPARITION, departs, choisirApparition, ramenerPoint, piecesDe, candidatsApparition } from '../apparitions.js';
import { ZONES_JEU, PIECES } from '../constantes.js';
import { Rng, hacher } from '../rng.js';
import { franchissable } from '../mouvement.js';
import { Player } from '../../player.js';

const PAS = 1 / 120;
const mediane = (L) => { const s = L.slice().sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
const centile = (L, p) => { const s = L.slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };
const r2 = (v) => Math.round(v * 100) / 100;
const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// UN CONDUCTEUR d'essai : un Pilote vers `cible`, le regard dans la marche (comme l'errant) — `b.cerveau.pilote` est lu par
// le face-à-face des autres pilotes
class Conduite {
  constructor(a, partie) { this.a = a; this.partie = partie; this.pilote = new Pilote(a, partie.nav, partie.balistique); this.regard = a.cmd.lacet || 0; this.cible = null; this.etat = 'conduite'; }
  commande(dt, cmd) {
    cmd.saut = false;
    const c = this.cible, P = this.pilote;
    if (!c) { cmd.ax = 0; cmd.ay = 0; cmd.amp = 0; return; }
    P.allerA(c.x, c.y, c.z, { arret: c.arret ?? 0.4, marge: 0.3 });
    P.pas(dt, cmd);
    if (P.dir) {
      const voulu = Math.atan2(-P.dir.x, -P.dir.z), e = angle(voulu - this.regard), m = 9 * dt;
      this.regard = angle(this.regard + Math.max(-m, Math.min(m, e * (1 - Math.exp(-dt / 0.09)))));
      const l = this.regard, fx = -Math.sin(l), fz = -Math.cos(l), rx = Math.cos(l), rz = -Math.sin(l);
      cmd.ay = P.dir.x * fx + P.dir.z * fz; cmd.ax = P.dir.x * rx + P.dir.z * rz;
    }
    cmd.lacet = this.regard; cmd.tangage = 0;
  }
}

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-D', nom, fn, opts);
  const C = () => game.collisions;
  // le graphe des humains (le cache de la session)
  const humains = () => Nav.obtenir(game, {});
  // une partie d'essai vide (ni Haythem, ni mannequin), ses portes automatiques toutes ouvertes s'il le faut
  const partieVide = async (graine = 1, { portes = true } = {}) => {
    await jeu.lancer('essai', { graine, mannequins: [], bots: 0, humain: false });
    const p = game.partie;
    if (portes) ouvrirPortes(p);
    return p;
  };
  const ouvrirPortes = (p) => {
    for (const P of (game.carte.portes && game.carte.portes.auto) || []) {
      if (p && p.monde && p.monde._poser) p.monde._poser(P, 1); else { P.k = 1; if (P.forme) P.forme.off = true; }
    }
  };
  const conducteur = (p, id, x, y, z) => {
    const a = p.ajouterActeur({ id, nom: 'Pilote ' + id, equipe: null, x, y, z, lacet: 0, cerveau: null });
    a.cerveau = new Conduite(a, p);
    return a;
  };
  const placer = (a, x, y, z, lacet = 0) => jeu.teleporter(a.id, x, y, z, lacet);
  // un nœud permis au hasard (dans un masque, sur un niveau)
  const auHasard = (N, rng, filtre = null) => { for (let k = 0; k < 10000; k++) { const v = rng.int(N.nb); if (N.permis(v) && (!filtre || filtre(v))) return v; } return -1; };
  const oeil = (a) => { const o = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } }; return a.oeil(o); };

  // ---------------------------------------------------------------- 1. verifierNav
  T('1 graphe des humains : nœuds, liens, composante, apparitions, niveaux, cabine, temps, cache', async (t) => {
    const g = await jeu.verifierNav({ refaire: true });
    Nav.oublier();                                           // (la session oublie : la 2e lecture vient d'IndexedDB)
    const c = await jeu.verifierNav({});
    const m = await jeu.verifierNav({});
    const niv = [-1, 0, 1, 2, 3].map((k) => g.parNiveau[k] || 0);
    const ok = Math.abs(g.noeuds - 8956) <= 8956 * 0.05 && g.liens >= 55000 && g.liens <= 65000 && g.composantes === 1 && g.apparitions === 20 &&
      niv.every((a) => a >= 60) && g.cabine === 0 && !g.cache && c.cache && m.cache && c.noeuds === g.noeuds && c.liens === g.liens && c.empreinte === g.empreinte;
    const tG = t.temps('L-D generation ms', g.ms, 1000), tC = t.temps('L-D lecture du cache ms', c.ms, 50);
    t.note('L-D graphe', { noeuds: g.noeuds, liens: g.liens, parNiveau: g.parNiveau, zones: g.zonesAtteintes });
    return { ok: ok && tG && tC, attendu: '8956 ± 5 %, 55-65 k liens, 1 composante, 20/20, ≥ 60 m² × 5, cabine 0, génération ≤ 1 s, cache ≤ 50 ms et vrai',
      obtenu: `${g.noeuds} nœuds, ${g.liens} liens, ${g.composantes} comp., ${g.apparitions}/20, m² ${niv.join('/')}, cabine ${g.cabine}, ${Math.round(g.ms)} ms ; cache ${c.cache} ${r2(c.ms)} ms (IndexedDB), ${m.cache} ${r2(m.ms)} ms (session)` };
  });

  // ---------------------------------------------------------------- 2. l'empreinte
  T('2 empreinte : stable (portes, rechargement), changée par une forme, revenue sans elle', async (t) => {
    const c = C(), e1 = Nav.empreinteDe(game, {});
    // (les portes ouvertes ou fermées n'y entrent pas : l'état où les trouve un rechargement ne compte pas)
    const mob = c.formes.filter((f) => f.mobile), avant = mob.map((f) => f.off);
    mob.forEach((f) => { f.off = !f.off; });
    const eP = Nav.empreinteDe(game, {});
    mob.forEach((f, j) => { f.off = avant[j]; });
    // une forme ajoutée, puis retirée (la liste et les cases de la grille)
    const f = c.ajouterBoite(6.0, -19.6, 6.2, -19.4, { y0: 0, y1: 0.9 });
    const e2 = Nav.empreinteDe(game, {});
    c.formes.pop();
    for (const [k, L] of c.grille) { const i = L.indexOf(f); if (i >= 0) { L.splice(i, 1); if (!L.length) c.grille.delete(k); } }
    const e3 = Nav.empreinteDe(game, {});
    // d'un rechargement à l'autre : la valeur du chargement précédent de cet onglet (sessionStorage), et le graphe relu
    // d'IndexedDB sous elle au test 1
    let precedent = null;
    try { precedent = sessionStorage.getItem('iris.test.L-D.empreinte'); sessionStorage.setItem('iris.test.L-D.empreinte', e1); } catch (e) { /* stockage indisponible */ }
    const ok = e1 === eP && e2 !== e1 && e3 === e1 && (precedent === null || precedent === e1) && e1 !== Nav.empreinteDe(game, { rayon: 0.2, franchir: false });
    return { ok, attendu: 'portes sans effet, + forme ≠, − forme =, = au chargement précédent, ≠ graphe des props', obtenu: `${e1} · portes ${eP} · +forme ${e2} · −forme ${e3} · précédent ${precedent ?? '(premier chargement)'}` };
  });

  // ---------------------------------------------------------------- 3. l'école rendue
  T('3 instantane() identique avant et après la génération (portes, limites, vantaux rallumés)', async () => {
    // (dans la MÊME tâche : aucune image de la carte vivante entre les deux — elle anime les portes devant Haythem)
    const i1 = JSON.stringify(jeu.instantane());
    const off1 = C().formes.map((f) => !!f.off).join('');
    Nav.genererSync(game, {});
    const i2 = JSON.stringify(jeu.instantane()), off2 = C().formes.map((f) => !!f.off).join('');
    return { ok: i1 === i2 && off1 === off2, attendu: 'identiques (instantané et `off` de chaque forme)', obtenu: i1 === i2 ? (off1 === off2 ? 'identiques' : 'off différent') : 'instantané différent' };
  });

  // ---------------------------------------------------------------- 4. A*
  T('4 A* sur 200 paires (graine 13) : médiane ≤ 3 ms, p95 ≤ 8 ms ; demander par tranches ≤ 1,5 ms, même liste', async (t) => {
    const N = await humains(), rng = new Rng(13), paires = [];
    for (let k = 0; k < 200; k++) paires.push([auHasard(N, rng), auHasard(N, rng)]);
    const ms = [], listes = [];
    for (const [u, v] of paires) { const L = []; const t0 = performance.now(); N.chemin(u, v, L); ms.push(performance.now() - t0); listes.push(L.join(',')); }
    const tranches = []; let memes = 0, ouverts = 0;
    for (let k = 0; k < paires.length; k++) {
      let rendu = null, fini = false;
      N.demander('t' + k, paires[k][0], paires[k][1], (L) => { rendu = L; fini = true; });
      for (let n = 0; n < 200 && !fini; n++) { const t0 = performance.now(); N.pasFile(); tranches.push(performance.now() - t0); }
      if (fini && (rendu ? rendu.join(',') : '') === listes[k]) memes++;
    }
    const med = mediane(ms), p95 = centile(ms, 0.95), tr = centile(tranches, 0.95), trMax = Math.max(...tranches);
    const a = t.temps('L-D A* médiane ms', med, 3), b = t.temps('L-D A* p95 ms', p95, 8), c = t.temps('L-D tranche p95 ms', tr, 1.5);
    const trouves = listes.filter((s) => s.length).length;
    return { ok: a && b && c && memes === 200 && trouves === 200, attendu: 'médiane ≤ 3, p95 ≤ 8, tranches ≤ 1,5 ms, 200/200 mêmes listes, 200 chemins',
      obtenu: `médiane ${r2(med)} ms, p95 ${r2(p95)} ms, tranches p95 ${r2(tr)} (max ${r2(trMax)}) ms, mêmes ${memes}/200, trouvés ${trouves}` };
  });

  // ---------------------------------------------------------------- 5. champs, noeudPres
  T('5 champDepuis ≤ 15 ms et en cache ; noeudPres ≤ 20 µs, un nœud à ≤ 1,5 m pour ≥ 99 % de 1 000 points libres', async (t) => {
    const N = await humains(), c = C(), rng = new Rng(5);
    const u = N.noeudPres(14.88, 0, -3.12);
    const t0 = performance.now(); const F = N.champDepuis(u); const ms = performance.now() - t0;
    const t1 = performance.now(); const F2 = N.champDepuis(u); const ms2 = performance.now() - t1;
    let atteints = 0; for (let i = 0; i < N.nb; i++) if (Number.isFinite(F[i])) atteints++;
    // les points libres : au hasard dans les rectangles des pièces que le graphe atteint, à leur sol, debout (plafond > 1,8 m),
    // le disque du corps libre
    const Z = game.carte.lumieres.zones, atteintes = new Set(); for (let i = 0; i < N.nb; i++) if (N.zone[i] !== 255) atteintes.add(PIECES[N.zone[i]]);
    const rects = []; for (const z of Z) if (atteintes.has(z.id)) for (const r of z.rects) rects.push({ z: z.id, r });
    const pts = [];
    for (let k = 0; k < 40000 && pts.length < 1000; k++) {
      const { z, r } = rects[rng.int(rects.length)];
      const x = r[0] + rng.next() * (r[2] - r[0]), zz = r[1] + rng.next() * (r[3] - r[1]);
      if (x < BORNES_NAV.xMin || x > BORNES_NAV.xMax || zz < BORNES_NAV.zMin || zz > BORNES_NAV.zMax) continue;
      const base = r[4] > 0 ? r[4] : r[5] !== undefined && r[5] < 0 ? -3.06 : 0;
      const y = c.solEn(x, zz, base + 0.4), Zp = game.carte.lumieres.zoneEn(x, zz, y + 0.1);
      if (!Zp || Zp.id !== z || !c.libre(x, zz, 0.3, y) || c.plafondEn(x, zz, y) < y + 1.8) continue;
      pts.push({ x, y, z: zz });
    }
    let bons = 0; const rates = [];
    for (const q of pts) { if (N.noeudPres(q.x, q.y, q.z, 1.5) >= 0) bons++; else if (rates.length < 6) rates.push([r2(q.x), r2(q.y), r2(q.z)]); }
    const M = jeu.mesurer((i) => { const q = pts[i % pts.length]; N.noeudPres(q.x, q.y, q.z, 1.5); }, 2000);
    const a = t.temps('L-D champDepuis ms', ms, 15), b = t.temps('L-D noeudPres µs', M.med * 1000, 20);
    return { ok: a && b && F2 === F && ms2 < 1 && atteints > N.nb * 0.99 && pts.length === 1000 && bons >= 990,
      attendu: 'champ ≤ 15 ms, le même objet ensuite, ≥ 99 % atteints ; noeudPres ≤ 20 µs ; ≥ 990 / 1000',
      obtenu: `champ ${r2(ms)} ms puis ${r2(ms2)} ms (${F2 === F ? 'en cache' : 'recalculé'}), ${atteints}/${N.nb} atteints ; noeudPres ${r2(M.med * 1000)} µs (p95 ${r2(M.p95 * 1000)}) ; ${bons}/${pts.length} points${rates.length ? ' · ratés ' + JSON.stringify(rates) : ''}` };
  });

  // ---------------------------------------------------------------- 6. verifierBots
  T('6 verifierBots 180 s, 8 errants, portes ouvertes : 0 hors monde / sous le sol / dans un mur / traversée, ≤ 1 coincé et ≤ 1 secours par 10 min-bot, toutes les pièces', async (t) => {
    const N = await humains(), atteintes = new Set(); for (let i = 0; i < N.nb; i++) if (N.zone[i] !== 255) atteintes.add(N.zone[i]);
    const ouvre = (e) => { if (e.detail.etat === 'entree' && game.partie) ouvrirPortes(game.partie); };
    document.addEventListener('iris-partie', ouvre);
    let r;
    const t0 = performance.now();
    try { r = await jeu.verifierBots({ duree: 180, bots: 8, cerveau: 'errant' }); } finally { document.removeEventListener('iris-partie', ouvre); }
    const minBot = 180 * 8 / 60, max = Math.floor(minBot / 10 + 1e-9) + 0.4;   // (24 minutes-bot : 2,4 au plus, donc 2)
    const ok = !r.horsMonde.length && !r.sousLeSol.length && !r.dansUnMur.length && !r.traverseMurs.length && r.coinces.length <= max && r.teleportsSecours <= max &&
      r.zonesVisitees >= atteintes.size;
    t.note('L-D verifierBots ms', Math.round(performance.now() - t0));
    return { ok, attendu: `0 / 0 / 0 / 0, coincés ≤ ${Math.floor(max)}, secours ≤ ${Math.floor(max)}, ${atteintes.size} pièces atteignables visitées (47 moins e1bureau, e103, e104 : derrière des portes fermées)`,
      obtenu: `hors monde ${r.horsMonde.length}, sous le sol ${r.sousLeSol.length}, mur ${r.dansUnMur.length}, traversées ${r.traverseMurs.length}, coincés ${r.coinces.length}, secours ${r.teleportsSecours}, pièces ${r.zonesVisitees}` };
  }, { delai: 300 });

  // ---------------------------------------------------------------- 7. restreindre
  T('7 restreindre à la zone ss : 200 chemins tirés n\'en sortent jamais', async () => {
    const N = await humains(), avant = Nav.derniere, P = piecesDe('ss');
    const M = N.masquePieces(P);
    N.restreindre(M);
    const rng = new Rng(7);
    let sorties = 0, trouves = 0, n = 0;
    try {
      for (let k = 0; k < 200; k++) {
        const u = auHasard(N, rng), v = auHasard(N, rng), L = [];
        if (!N.chemin(u, v, L)) continue;
        trouves++;
        for (const w of L) { n++; if (!M[w] || !P.has(N.pieceDe(w))) { sorties++; break; } }
      }
      // (et un chemin vers un nœud hors de la zone : refusé)
      const dehors = N.noeudPres(14.88, 0, -3.12, 1.5);
      const refus = !N.chemin(auHasard(N, rng), dehors, []);
      return { ok: sorties === 0 && trouves === 200 && refus, attendu: '200 chemins, 0 sortie, le hall refusé', obtenu: `${trouves} chemins (${n} nœuds), ${sorties} sorties, hall ${refus ? 'refusé' : 'atteint'}` };
    } finally { N.restreindre(null); Nav.derniere = avant; }
  });

  // ---------------------------------------------------------------- 8. le Pilote
  T('8 Pilote : 100 trajets entre niveaux (escaliers compris) → ≥ 98 arrivés en ≤ 1,5 × le temps à pied', async (t) => {
    const p = await partieVide(8), N = p.nav, rng = new Rng(88);
    const a = conducteur(p, 50, 14.88, 0, -3.12);
    let arrives = 0, dans = 0; const rapports = [], lents = [];
    for (let k = 0; k < 100; k++) {
      const u = auHasard(N, rng, (v) => N.niveau[v] >= -1 && N.niveau[v] <= 2 && N.degage[v] >= 0.5);
      const v = auHasard(N, rng, (w) => N.niveau[w] !== N.niveau[u] && N.niveau[w] <= 3 && N.degage[w] >= 0.5);
      const L = []; if (!N.chemin(u, v, L)) { k--; continue; }
      const aPied = N.longueur(L) / 5.0;
      placer(a, N.px[u], N.ph[u], N.pz[u], 0);
      a.cerveau.pilote.stop(); a.cerveau.cible = { x: N.px[v], y: N.ph[v], z: N.pz[v], arret: 0.4 };
      let tt = 0;
      for (; tt < aPied * 2 + 2; tt += PAS) { jeu.avancer(PAS); if (a.cerveau.pilote.arrive) break; }
      if (a.cerveau.pilote.arrive) { arrives++; rapports.push(tt / aPied); if (tt <= aPied * 1.5 + 0.3) dans++; else if (lents.length < 4) lents.push(r2(tt / aPied)); }
      else if (lents.length < 4) lents.push('raté ' + [N.px[u], N.ph[u], N.pz[u]].map(r2).join(',') + ' → ' + [N.px[v], N.ph[v], N.pz[v]].map(r2).join(','));
    }
    jeu.quitter('balade');
    return { ok: dans >= 98, attendu: '≥ 98 / 100 arrivés en ≤ 1,5 × (+ 0,3 s d\'élan)', obtenu: `${arrives} arrivés, ${dans} dans le temps ; rapport médian ${r2(mediane(rapports))}, p95 ${r2(centile(rapports, 0.95))}${lents.length ? ' · ' + lents.join(' ; ') : ''}` };
  }, { delai: 200 });

  // ---------------------------------------------------------------- 9. les départs
  T('9 departs : 5 points par camp et par zone de combat, à ≥ 1,5 m, dégagés ≥ 0,75 m ; les camps à ≥ 15 m à pied', async () => {
    const N = await humains(), avant = Nav.derniere, lignes = []; let ok = true;
    try {
      for (const z of Object.keys(ZONES_JEU).filter((k) => ZONES_JEU[k].modes.includes('combat'))) {
        N.restreindre(z === 'ecole' ? null : N.masquePieces(piecesDe(z)));
        const rng = new Rng(9), A = departs(z, 'A', 5, rng, N), B = departs(z, 'B', 5, rng, N);
        let esp = Infinity, deg = Infinity, hors = 0;
        for (const L of [A, B]) for (let i = 0; i < L.length; i++) {
          const v = N.noeudPres(L[i].x, L[i].y, L[i].z, 0.05);
          deg = Math.min(deg, v >= 0 ? N.degage[v] : 0); if (v < 0 || !N.permis(v)) hors++;
          for (let j = i + 1; j < L.length; j++) if (Math.abs(L[i].y - L[j].y) < 1.5) esp = Math.min(esp, Math.hypot(L[i].x - L[j].x, L[i].z - L[j].z));
        }
        const F = N.champMulti(A.map((q) => ({ x: q.x, y: q.y, z: q.z })), Infinity);
        let dAB = Infinity; for (const q of B) { const v = N.noeudPres(q.x, q.y, q.z, 0.05); if (v >= 0) dAB = Math.min(dAB, F[v]); }
        // (ce que la zone PERMET : par camp, combien de nœuds dégagés de 0,75 m, à 1,5 m l'un de l'autre, à ≤ 30 m à pied de sa
        // base et à ≥ 15 m de la base d'en face — au −1, la pause entière est à moins de 15 m de la sas : 5 est impossible, le
        // dégagement est alors relâché, et c'est dit)
        const possible = (moi, lui) => {
          const bm = N.noeudPres(moi[0], moi[1], moi[2], 4), bl = N.noeudPres(lui[0], lui[1], lui[2], 4);
          const Pm = N.champMulti([bm], 30).slice(), Pl = N.champMulti([bl], Infinity).slice(), pris = [];
          for (let v = 0; v < N.nb; v++) if (N.permis(v) && N.degage[v] >= 0.75 && Pm[v] <= 30 && Pl[v] >= 15 && pris.every((w) => Math.hypot(N.px[w] - N.px[v], N.pz[w] - N.pz[v]) >= 1.5 || Math.abs(N.ph[w] - N.ph[v]) > 1.5)) pris.push(v);
          return pris.length;
        };
        const D = ZONES_JEU[z].departs, pA = possible(D.A[0], D.B[0]), pB = possible(D.B[0], D.A[0]), faisable = pA >= 5 && pB >= 5;
        const bon = A.length === 5 && B.length === 5 && esp >= 1.5 - 1e-6 && (faisable ? deg >= 0.75 : deg >= 0.3 - 1e-6) && hors === 0 && dAB >= 15;
        ok = ok && bon;
        lignes.push(`${z} esp ${r2(esp)} dég ${r2(deg)} à pied ${r2(dAB)} m${faisable ? '' : ` (0,75 m impossible : ${pA} / ${pB} nœuds dégagés à 15 m de l'autre base)`}${hors ? ' hors ' + hors : ''}${bon ? '' : ' ✗'}`);
      }
    } finally { N.restreindre(null); Nav.derniere = avant; }
    return { ok, attendu: '4 zones × 2 camps : 5 points, ≥ 1,5 m, ≥ 0,75 m, ≥ 15 m à pied', obtenu: lignes.join(' · ') };
  });

  // ---------------------------------------------------------------- 10. la réapparition
  T('10 choisirApparition : 1 000 tirages (graine 17), jamais à < 20 m à pied d\'un ennemi qui voit le point ; chacun pour soi : le plus loin exactement', async () => {
    const p = await partieVide(17), N = p.nav, rng = new Rng(17), B = p.balistique;
    const moi = p.ajouterActeur({ id: 10, nom: 'Moi', equipe: 'A', x: 14.88, y: 0, z: -3.12, cerveau: null });
    const ennemis = [], allies = [];
    for (let k = 0; k < 4; k++) ennemis.push(p.ajouterActeur({ id: 20 + k, nom: 'E' + k, equipe: 'B', x: 14.88, y: 0, z: -3.12, cerveau: null }));
    for (let k = 0; k < 2; k++) allies.push(p.ajouterActeur({ id: 30 + k, nom: 'A' + k, equipe: 'A', x: 14.88, y: 0, z: -3.12, cerveau: null }));
    const poserAuHasard = (a) => { const v = auHasard(N, rng, (w) => N.degage[w] >= 0.5 && N.niveau[w] <= 3); a.corps.pos.set(N.px[v], N.ph[v], N.pz[v]); a.corps.posPrec.copy(a.corps.pos); };
    let fautes = 0, essais = 0; const ms = []; const exemples = [];
    for (let k = 0; k < 1000; k++) {
      for (const a of [...ennemis, ...allies]) poserAuHasard(a);
      const t0 = performance.now(); const q = choisirApparition(p, moi); ms.push(performance.now() - t0);
      essais++;
      for (const e of ennemis) {
        const d = N.distancePied({ x: q.x, y: q.y, z: q.z }, e.pos), o = oeil(e);
        if (d < 20 && B.vue(o.x, o.y, o.z, q.x, q.y + 1.6, q.z)) { fautes++; if (exemples.length < 3) exemples.push(`${r2(d)} m`); break; }
      }
    }
    // CHACUN POUR SOI : 100 tirages, 5 ennemis
    moi.equipe = null; for (const a of [...ennemis, ...allies]) a.equipe = null;
    const L = candidatsApparition(N); let exacts = 0;
    for (let k = 0; k < 100; k++) {
      for (const a of [...ennemis, ...allies]) poserAuHasard(a);
      const autres = [...ennemis, ...allies], yeux = autres.map(oeil);
      const F = N.champMulti(autres.map((a) => a.pos), Infinity);
      const vu = (v) => yeux.some((o) => Math.hypot(o.x - N.px[v], o.z - N.pz[v]) <= 50 && B.vue(o.x, o.y, o.z, N.px[v], N.ph[v] + 1.6, N.pz[v]));
      let best = -1, bd = -1;
      for (const v of L) if (!vu(v) && F[v] > bd) { bd = F[v]; best = v; }
      const q = choisirApparition(p, moi);
      if (best >= 0 && Math.hypot(q.x - N.px[best], q.z - N.pz[best]) < 1e-4 && Math.abs(q.y - N.ph[best]) < 1e-4) exacts++;
    }
    jeu.quitter('balade');
    return { ok: fautes === 0 && exacts === 100, attendu: '0 faute sur 1 000 ; chacun pour soi 100/100 exacts',
      obtenu: `${fautes} fautes / ${essais}${exemples.length ? ' (' + exemples.join(', ') + ')' : ''}, ${r2(mediane(ms))} ms par tirage (p95 ${r2(centile(ms, 0.95))}) ; chacun pour soi ${exacts}/100 ; ${L.length} candidats` };
  }, { delai: 300 });

  // ---------------------------------------------------------------- 11. déterminisme, IndexedDB qui lève
  T('11 même graine → mêmes chemins, mêmes apparitions ; IndexedDB qui lève → génération normale, 0 erreur', async () => {
    const une = async () => {
      const p = await partieVide(9);
      const L = pointsDe9();
      for (let k = 0; k < 8; k++) { const q = L[k % L.length]; p.ajouterActeur({ id: 100 + k, nom: 'E' + k, equipe: null, x: q.x, y: q.y, z: q.z, lacet: 0, cerveau: 'errant' }); }
      jeu.avancer(40);
      const chemins = p.acteurs.map((a) => a.cerveau.pilote.chemin.join(','));
      const app = []; const moi = p.ajouterActeur({ id: 9, nom: 'Moi', equipe: 'A', x: 14.88, y: 0, z: -3.12, cerveau: null });
      for (let k = 0; k < 20; k++) { const q = choisirApparition(p, moi); app.push([q.x, q.y, q.z, q.lacet]); }
      const e = hacher([p.empreinte(), chemins, app], 1e-9);
      jeu.quitter('balade');
      return e;
    };
    const pointsDe9 = () => POINTS_APPARITION;
    const a = await une(), b = await une();
    const D = await jeu.verifierDeterminisme(42, 30);
    // IndexedDB qui lève : la base refermée, `indexedDB.open` qui lance une exception ; la session oubliée
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB') || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(globalThis), 'indexedDB');
    const erreurs = []; const err = console.error; console.error = (...x) => { erreurs.push(x.join(' ')); err.apply(console, x); };
    let n2 = null, exc = null;
    try {
      oublierBase(); Nav.oublier();
      Object.defineProperty(globalThis, 'indexedDB', { configurable: true, get() { return { open() { throw new Error('IndexedDB indisponible (test)'); } }; } });
      n2 = await Nav.obtenir(game, {});
      const l = await lireNav('nimporte');
      if (l !== null) exc = 'lireNav ≠ null';
    } catch (e) { exc = String(e); } finally {
      delete globalThis.indexedDB; if (desc && !Object.getOwnPropertyDescriptor(globalThis, 'indexedDB') && desc.configurable !== false && !('indexedDB' in globalThis)) Object.defineProperty(globalThis, 'indexedDB', desc);
      console.error = err; oublierBase();
    }
    const ok = a === b && D.egal && n2 && !n2.depuisCache && Math.abs(n2.nb - 8956) <= 450 && !exc && !erreurs.length && typeof indexedDB !== 'undefined';
    return { ok, attendu: 'empreintes égales ; verifierDeterminisme égal ; régénéré sans cache, 0 exception, 0 console.error',
      obtenu: `${a} / ${b} ; ${D.a} / ${D.b} ; ${n2 ? n2.nb + ' nœuds, cache ' + n2.depuisCache : 'rien'} ; ${exc || '0 exception'}, ${erreurs.length} erreurs` };
  });

  // ---------------------------------------------------------------- 12. la pureté
  T('12 pureté : 0 faute dans nav, pilotage, apparitions (ni hasard, ni horloge, ni entrée, ni Raycaster, ni lumière)', async () => {
    const JETONS = [/Math\.random/, /performance\.now/, /Date\.now/, /Raycaster/, /DecalGeometry/, /Light\(/, /\.input\./, /\bInput\b/];
    const fautes = [];
    for (const f of ['nav.js', 'pilotage.js', 'apparitions.js']) {
      const src = await fetch(new URL('../' + f, import.meta.url), { cache: 'no-cache' }).then((r) => r.text());
      let bloc = false;
      src.split(/\r?\n/).forEach((ligne, i) => {
        let code = '', j = 0;
        while (j < ligne.length) {
          if (bloc) { const k = ligne.indexOf('*/', j); if (k < 0) { j = ligne.length; } else { bloc = false; j = k + 2; } continue; }
          if (ligne.startsWith('/*', j)) { bloc = true; j += 2; continue; }
          if (ligne.startsWith('//', j)) break;
          code += ligne[j++];
        }
        for (const J of JETONS) if (J.test(code)) fautes.push(`${f}:${i + 1} ${J}`);
      });
    }
    return { ok: !fautes.length, attendu: '0 faute', obtenu: fautes.length ? fautes.slice(0, 5).join(' · ') : '0 faute (et tools/verifier_proprietaires.py au terminal)' };
  });

  // ---------------------------------------------------------------- 13. le graphe des props
  T('13 graphe des props (rayon 0,2, sans franchir) : 1 composante, ≥ 10 % de nœuds de plus dans les pièces meublées, clé à lui, ≤ 1 s', async (t) => {
    const g = await jeu.verifierNav({ rayon: 0.2, franchir: false, refaire: true });
    const H = await humains(), P = await Nav.obtenir(game, { rayon: 0.2, franchir: false });
    const compte = (N, z) => { let n = 0; for (let i = 0; i < N.nb; i++) if (N.pieceDe(i) === z) n++; return n; };
    const lignes = [], ok3 = ['attente', 'e1salle', 'e1pause'].every((z) => { const a = compte(H, z), b = compte(P, z); lignes.push(`${z} ${a} → ${b} (×${r2(b / a)})`); return b >= a * 1.1; });
    let fr = 0; for (let j = 0; j < P.typeLien.length; j++) fr += P.typeLien[j];
    const tG = t.temps('L-D generation props ms', g.ms, 1000);
    return { ok: g.composantes === 1 && ok3 && g.empreinte !== H.empreinte && fr === 0 && tG, attendu: '1 composante, ≥ ×1,1 dans attente, S 1.3, pause du 1er, empreinte ≠, 0 franchissement, ≤ 1 s',
      obtenu: `${g.noeuds} nœuds, ${g.composantes} comp., ${lignes.join(', ')}, ${g.empreinte}, ${fr} franchir, ${Math.round(g.ms)} ms` };
  });

  // ---------------------------------------------------------------- 14. les liens « franchir »
  T('14 liens « franchir » : chacun redonné par franchissable, sur les banquettes de l\'attente, aucun dans un rang serré, pris par A* quand le détour est > 2 ×', async () => {
    const N = await humains(), c = C();
    // (l'état de la génération : portes automatiques ouvertes, barrières éteintes, vantaux allumés)
    const garde = []; for (const f of c.formes) { if (f.mobile || f.limite) { garde.push(f, f.off); f.off = true; } else if (f.vantail) { garde.push(f, f.off); f.off = false; } }
    const liens = []; let verifies = 0, faux = [];
    try {
      for (let u = 0; u < N.nb; u++) for (let j = N.debut[u]; j < N.debut[u + 1]; j++) {
        if (N.typeLien[j] !== 1) continue;
        const v = N.liens[j]; liens.push([u, v, j]);
        // la direction du lien : celle des 8 la plus proche
        const dx = N.px[v] - N.px[u], dz = N.pz[v] - N.pz[u]; let best = null, bd = -2;
        for (const [a, b] of D8) { const l = Math.hypot(a, b), d = (a * dx + b * dz) / l / Math.hypot(dx, dz); if (d > bd) { bd = d; best = [a / l, b / l]; } }
        const F = franchissable(c, N.px[u], N.ph[u], N.pz[u], best[0], best[1]);
        if (F && Math.hypot(F.x - N.px[v], F.z - N.pz[v]) <= 0.3 && Math.abs(F.y - N.ph[v]) <= 0.3) verifies++; else if (faux.length < 3) faux.push([N.px[u], N.pz[u]].map(r2).join(','));
      }
    } finally { for (let j = 0; j < garde.length; j += 2) garde[j].off = garde[j + 1]; }
    const attente = liens.filter(([u, v]) => N.pieceDe(u) === 'attente' && N.pieceDe(v) === 'attente').length;
    // le comptoir haut de l'accueil : 1,18 m (js/ecole_hall.js CPT.h) — au-dessus des 1,15 m de `franchissable` : aucun lien
    const comptoir = liens.filter(([u, v]) => { const mx = (N.px[u] + N.px[v]) / 2, mz = (N.pz[u] + N.pz[v]) / 2; return Math.abs(N.ph[u]) < 0.3 && mx > 16.7 && mx < 18.1 && mz > -3.65 && mz < -1.05; }).length;
    // les rangs serrés (js/player.js Player.rangs) : aucune arrivée sur la ligne d'un rang, entre ses bouts
    let rangs = 0;
    for (const [u, v] of liens) for (const R of Player.rangs || []) {
      if (Math.abs(R.sol - N.ph[v]) > 0.3) continue;
      const ex = N.px[v] - R.ax, ez = N.pz[v] - R.az, l = ex * R.ux + ez * R.uz, tr = Math.abs(ez * R.ux - ex * R.uz);
      if (l > 0.3 && l < R.L - 0.3 && tr < 0.25) rangs++;
    }
    // A* : sur les liens dont le tour à pied fait plus de 2 × leur longueur (+ 5 %), le chemin d'un bout à l'autre les prend
    const marche = (u, v) => {                                 // (Dijkstra par la marche seule, borné à 30 m)
      const g = new Map([[u, 0]]), file = [[0, u]];
      while (file.length) {
        file.sort((a, b) => a[0] - b[0]); const [d, w] = file.shift();
        if (w === v) return d; if (d > 30 || d > g.get(w)) continue;
        for (let j = N.debut[w]; j < N.debut[w + 1]; j++) { if (N.typeLien[j]) continue; const x = N.liens[j], e = d + N.cout[j]; if (!(g.get(x) <= e)) { g.set(x, e); file.push([e, x]); } }
      }
      return Infinity;
    };
    let candidats = 0, pris = 0;
    for (const [u, v, j] of liens) {
      if (candidats >= 30) break;
      const lf = N.cout[j], m = marche(u, v);
      if (!(m > lf * 1.05)) continue;
      candidats++;
      const L = []; N.chemin(u, v, L);
      if (L.length === 2 && L[0] === u && L[1] === v) pris++;
    }
    const ok = liens.length > 0 && verifies === liens.length && attente >= 1 && rangs === 0 && candidats > 0 && pris === candidats;
    return { ok, attendu: 'tous redonnés à ≤ 0,3 m, ≥ 1 sur les banquettes de l\'attente, 0 dans un rang, A* les prend (le comptoir : 0, il fait 1,18 m)',
      obtenu: `${liens.length} liens, ${verifies} redonnés${faux.length ? ' (faux ' + faux.join(' ; ') + ')' : ''}, attente ${attente}, comptoir ${comptoir}, rangs ${rangs}, A* ${pris}/${candidats}` };
  });

  // ---------------------------------------------------------------- 15. les face-à-face
  T('15 face-à-face : deux Pilote l\'un vers l\'autre dans la volée de tôle puis dans le couloir du −1 : 20/20 croisés en ≤ 6 s, 0 coincé', async () => {
    const p = await partieVide(15), N = p.nav;
    const n = (x, y, z) => { const v = N.noeudPres(x, y, z, 0.6); return { x: N.px[v], y: N.ph[v], z: N.pz[v], v }; };
    // (la volée de tôle, 0,85 m, entre le hall ouest et la pause du −1 : 10,8 m à pied ; le couloir du −1, 0,8 m, un cul-de-sac
    // au nord du hall du −1 : 7,8 m — celui qui sort ne peut pas reculer, c'est l'autre qui recule)
    const lieux = [
      ['volée de tôle', n(3.125, 0, -6.125), n(3.625, -3.06, -11.125)],
      ['couloir du −1', n(2.12, -3.06, -4.375), n(3.625, -3.06, -11.125)],
    ];
    const a = conducteur(p, 60, 0, 0, 0), b = conducteur(p, 61, 0, 0, 0);
    let reussis = 0, coinces = 0; const lignes = [];
    for (const [nom, X, Y] of lieux) {
      let r = 0; const temps = [];
      for (let k = 0; k < 10; k++) {
        // (les rôles changent : le plus petit id part tantôt d'en haut, tantôt d'en bas)
        const [P, Q] = k % 2 ? [a, b] : [b, a];
        for (const [A, D, F] of [[P, X, Y], [Q, Y, X]]) { placer(A, D.x, D.y, D.z, 0); A.cerveau.pilote.stop(); A.cerveau.pilote.coincements = 0; A.cerveau.pilote.secours = 0; A.cerveau.cible = { x: F.x, y: F.y, z: F.z, arret: 0.35 }; }
        let tt = 0;
        for (; tt < 6; tt += PAS) { jeu.avancer(PAS); if (a.cerveau.pilote.arrive && b.cerveau.pilote.arrive) break; }
        const co = a.cerveau.pilote.secours + b.cerveau.pilote.secours + (a.cerveau.pilote.coincements ? 1 : 0) + (b.cerveau.pilote.coincements ? 1 : 0);
        coinces += co;
        if (a.cerveau.pilote.arrive && b.cerveau.pilote.arrive && tt <= 6) { r++; temps.push(tt); }
      }
      reussis += r; lignes.push(`${nom} ${r}/10 (médiane ${r2(mediane(temps))} s, max ${r2(Math.max(0, ...temps))} s)`);
    }
    jeu.quitter('balade');
    return { ok: reussis === 20 && coinces === 0, attendu: '20/20 en ≤ 6 s, 0 coincé', obtenu: `${lignes.join(' · ')} ; coincés ${coinces}` };
  });

  // ---------------------------------------------------------------- 16. les anneaux
  // (les pauses du −1 et du 1er sont meublées : aucun nœud n'y a 1,5 m de dégagement à 8 m à la ronde — 1,0 au mieux. Les
  // points B et C sont donc RELEVÉS : le plus dégagé à ≤ 3 m, libre à son dégagement, le meilleur de la ronde ; A, au hall,
  // l'est à 1,5 m. Écart noté au rapport, demande à F2 / L-E.)
  T('16 ramenerPoint : les 3 anneaux de domination ramenés à ≤ 3 m (dégagés de 1,5 m, sinon au mieux de la ronde), libres', async () => {
    const N = await humains(), c = C(), A = [['A', 14.88, 0, -3.12], ['B', 9.38, -3.06, -9.37], ['C', 12.63, 3.5, -7.87]];
    const lignes = []; let ok = true;
    for (const [k, x, y, z] of A) {
      const q = ramenerPoint(N, x, y, z, { rayonMax: 3, degageMin: 1.5 });
      let mieux = 0; for (const v of N.dans(x, y, z, 3, [], 0.6)) mieux = Math.max(mieux, N.degage[v]);
      const deg = q ? (q.releve ? q.degage : 1.5) : 0;
      const bon = !!q && Math.hypot(q.x - x, q.z - z) <= 3 && Math.abs(q.y - y) < 0.5 && c.libre(q.x, q.z, deg, q.y) && (!q.releve || (q.degage === mieux && mieux < 1.5));
      ok = ok && bon && (k !== 'A' || !q.releve);
      lignes.push(q ? `${k} (${r2(q.x)} ; ${r2(q.y)} ; ${r2(q.z)}) à ${r2(Math.hypot(q.x - x, q.z - z))} m, dégagé ${deg}${q.releve ? ' (relevé : ' + mieux + ' au mieux)' : ''}${bon ? '' : ' ✗'}` : `${k} aucun`);
    }
    return { ok, attendu: 'A dégagé de 1,5 m ; B, C au mieux de la ronde ; libres', obtenu: lignes.join(' · ') };
  });

  // ---------------------------------------------------------------- 17. le ressenti (en plus)
  T('17 ressenti des errants : jamais ralentis (≈ 5 m/s en ligne droite), regard sans saccade (≤ 9 rad/s), arrêts sans tremblement', async () => {
    const p = await partieVide(17);
    const L = POINTS_APPARITION;
    for (let k = 0; k < 6; k++) { const q = L[(k * 3) % L.length]; p.ajouterActeur({ id: 100 + k, nom: 'E' + k, equipe: null, x: q.x, y: q.y, z: q.z, lacet: 0, cerveau: 'errant' }); }
    const vites = [], rot = [], prec = new Map(); let demiTours = 0;
    for (let i = 0; i < 120 * 40; i++) {
      jeu.avancer(PAS);
      for (const a of p.acteurs) {
        const P = prec.get(a.id), c = a.corps;
        if (P) {
          rot.push(Math.abs(angle(a.cmd.lacet - P.l)) / PAS);
          const v = Math.hypot(c.pos.x - P.x, c.pos.z - P.z) / PAS;
          if (a.cerveau.pilote.dir && Math.abs(angle(a.cmd.lacet - P.l)) < 1e-3 && !c.airborne) vites.push(v);
          // (un arrêt qui tremble : la commande qui change de sens d'un pas à l'autre, à l'arrêt)
          if (P.ax !== undefined && (a.cmd.ax * P.ax + a.cmd.ay * P.ay) < -0.5) demiTours++;
        }
        prec.set(a.id, { x: c.pos.x, z: c.pos.z, l: a.cmd.lacet, ax: a.cmd.ax, ay: a.cmd.ay });
      }
    }
    jeu.quitter('balade');
    const vm = mediane(vites), rmax = Math.max(...rot);
    return { ok: vm >= 4.7 && rmax <= 9 + 1e-6 && demiTours <= 12, attendu: 'vitesse médiane en ligne droite ≥ 4,7 m/s, rotation ≤ 9 rad/s, ≤ 12 demi-tours de commande en 40 s × 6',
      obtenu: `${r2(vm)} m/s (${vites.length} pas), rotation max ${r2(rmax)} rad/s, demi-tours ${demiTours}` };
  });

  // ================================================================ À F2 (les vrais modules de la vague 2)
  T('F2 · verifierBots avec les tables de L-M (combat, portes figées) : mêmes seuils', async () => {
    const r = await jeu.verifierBots({ duree: 180, bots: 8, cerveau: 'errant' });
    const ok = !r.horsMonde.length && !r.sousLeSol.length && !r.dansUnMur.length && !r.traverseMurs.length && r.coinces.length <= 2 && r.teleportsSecours <= 2;
    return { ok, attendu: '0 / 0 / 0 / 0, ≤ 2, ≤ 2', obtenu: JSON.stringify({ ...r, coinces: r.coinces.length }) };
  }, { delai: 300, apresFusion: true });
  T('F2 · départs adverses sans ligne de vue (vraie vue de L-A)', async () => {
    const N = await humains(), avant = Nav.derniere, Bal = (await import('../balistique.js')).Balistique, B = new Bal(C()); let vus = 0; const lignes = [];
    try {
      for (const z of Object.keys(ZONES_JEU).filter((k) => ZONES_JEU[k].modes.includes('combat'))) {
        N.restreindre(z === 'ecole' ? null : N.masquePieces(piecesDe(z)));
        const rng = new Rng(9), A = departs(z, 'A', 5, rng, N), Bv = departs(z, 'B', 5, rng, N); let v = 0;
        for (const a of A) for (const b of Bv) if (B.vue(a.x, a.y + 1.62, a.z, b.x, b.y + 1.62, b.z)) v++;
        vus += v; lignes.push(`${z} ${v}`);
      }
    } finally { N.restreindre(null); Nav.derniere = avant; }
    return { ok: vus === 0, attendu: '0 paire vue', obtenu: lignes.join(' · ') };
  }, { apresFusion: true });
  T('F2 · 50 franchissements de bots sur les liens « franchir » (vrai franchissement de L-B) : ≥ 48 réussis, 0 coincé', async () => {
    const p = await partieVide(50), N = p.nav, a = conducteur(p, 70, 0, 0, 0), rng = new Rng(50);
    const liens = []; for (let u = 0; u < N.nb; u++) for (let j = N.debut[u]; j < N.debut[u + 1]; j++) if (N.typeLien[j] === 1) liens.push([u, N.liens[j]]);
    let ok = 0, essais = 0, coinces = 0;
    for (let k = 0; k < 400 && essais < 50; k++) {
      const [u, v] = liens[rng.int(liens.length)], L = [];
      if (!N.chemin(u, v, L) || L.length !== 2) continue;           // (seulement ceux que l'A* prend)
      essais++;
      placer(a, N.px[u], N.ph[u], N.pz[u], Math.atan2(-(N.px[v] - N.px[u]), -(N.pz[v] - N.pz[u])));
      a.cerveau.pilote.stop(); a.cerveau.pilote.coincements = 0; a.cerveau.cible = { x: N.px[v], y: N.ph[v], z: N.pz[v], arret: 0.35 };
      let tt = 0; for (; tt < 4; tt += PAS) { jeu.avancer(PAS); if (a.cerveau.pilote.arrive) break; }
      if (a.cerveau.pilote.arrive) ok++;
      if (a.cerveau.pilote.coincements) coinces++;
    }
    jeu.quitter('balade');
    return { ok: essais === 50 && ok >= 48 && coinces === 0, attendu: '≥ 48 / 50, 0 coincé', obtenu: `${ok}/${essais}, coincés ${coinces}` };
  }, { delai: 200, apresFusion: true });
  T('F2 · cachettes de L-K atteignables sur le graphe des props (e1)', async () => {
    const { cachettes } = await import('../deguisements.js');
    const P = await Nav.obtenir(game, { rayon: 0.2, franchir: false }), avant = Nav.derniere;
    P.restreindre(P.masquePieces(piecesDe('e1')));
    try {
      let R = []; for (const lot of cachettes('e1', P)) if (Array.isArray(lot) && lot.length) R = lot;
      const hors = R.filter((c) => P.noeudPres(c.x, c.y, c.z, 0.6) < 0).length;
      return { ok: R.length > 0 && hors === 0, attendu: '> 0 cachettes, 0 sans nœud à ≤ 0,6 m', obtenu: `${R.length} cachettes, ${hors} hors du graphe` };
    } finally { P.restreindre(null); Nav.derniere = avant; }
  }, { apresFusion: true });
}
