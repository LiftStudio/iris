// =====================================================================
//  LES TESTS DU LOT L-E — règles du combat et stand de tir (23/10 ; spec § 5.5.7, acceptation, points 1 à 16)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-E` (window.__rapport), PC puis `?tel=1`. Ils jouent CONTRE LES
// SQUELETTES du socle (armes sans dispersion, navigation à vol d'oiseau, apparitions au plus loin, cerveau minimal) : les
// parties de bots se jouent au −1 (`ss`, compact : le cerveau minimal y trouve ses ennemis), le reste par
// `__jeu.teleporter`, `commande`, `tirer` et des appels directs à `Partie.infliger` — jamais un clic à l'écran. Ce qui exige
// les vrais modules des autres lots (apparitions à pied, portes de L-M, duels de bots armés pour de vrai) est en
// `apresFusion: true` : F2 le rejoue avec `&fusion=1`. Un test rend { ok, attendu, obtenu }.
import * as THREE from 'three';
import { PAS, ZONES_JEU } from '../constantes.js';
import { CLASSES, ARMES, Arsenal } from '../armes.js';
import { PartieFPS, REGLES_FPS, DOMINATION, effectifs, tirerClasseBot } from '../partie_fps.js';
import { STAND, DEFIS, REGLES_STAND, enregistrerRecord, lireRecords } from '../partie_stand.js';

const r2 = (v) => Math.round(v * 100) / 100;
const typeDe = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

// LE SCHÉMA DE `partie.hud` (§ 4.5.15) : chaque champ et son type (« ? » : ou null)
const SCHEMA_HUD = { vie: 'number', vieMax: 'number', armure: 'number', arme: 'object?', dispersion: 'number', visee: 'number', letales: 'number', tactiques: 'number',
  chrono: 'number', phase: 'string', phaseT: 'number', phaseDuree: 'number', manche: 'number', nManches: 'number', scores: 'object?', classement: 'array',
  annonce: 'object?', mort: 'object?', reapparitionT: 'number', points: 'array', cibles: 'array', prop: 'object?', aveugle: 'object?', signalesMiniCarte: 'array',
  allies: 'array' };
const SCHEMA_ARME = { id: 'string', nom: 'string', chargeur: 'number', reserve: 'number', etat: 'string', k: 'number' };
const SCHEMA_CLASSEMENT = { id: 'number', nom: 'string', equipe: 'string?', elims: 'number', morts: 'number', assists: 'number', score: 'number', role: 'string', vivant: 'boolean' };
const SCHEMA_MORT = { tueur: 'string?', arme: 'string?', zone: 'string?', distance: 'number', vieTueur: 'number', t: 'number' };
const SCHEMA_POINT = { id: 'string', x: 'number', y: 'number', z: 'number', r: 'number', possesseur: 'string?', capture: 'object' };
const SCHEMA_CIBLE = { id: 'number', x: 'number', y: 'number', z: 'number', cap: 'number', k: 'number', touchee: 'boolean' };
const SCHEMA_ALLIE = { id: 'number', nom: 'string', x: 'number', y: 'number', z: 'number' };
// les fautes d'un objet contre un schéma (nom du champ : type attendu / obtenu)
function fautes(o, S, ou = '') {
  const L = [];
  if (!o || typeof o !== 'object') return [`${ou || 'objet'} absent`];
  for (const [k, t] of Object.entries(S)) {
    const v = o[k], opt = t.endsWith('?'), tt = opt ? t.slice(0, -1) : t;
    if (!(k in o)) { L.push(`${ou}${k} absent`); continue; }
    if (v === null && opt) continue;
    if (typeDe(v) !== tt || (tt === 'number' && !Number.isFinite(v))) L.push(`${ou}${k} : ${t} / ${typeDe(v)}`);
  }
  return L;
}
function fautesHud(H, mode) {
  const L = fautes(H, SCHEMA_HUD);
  if (H.arme) L.push(...fautes(H.arme, SCHEMA_ARME, 'arme.'));
  if (H.scores) { if (!Number.isFinite(H.scores.A) || !Number.isFinite(H.scores.B)) L.push('scores.A/B'); }
  (H.classement || []).forEach((c, i) => L.push(...fautes(c, SCHEMA_CLASSEMENT, `classement[${i}].`)));
  if (H.mort) L.push(...fautes(H.mort, SCHEMA_MORT, 'mort.'));
  (H.points || []).forEach((p, i) => { L.push(...fautes(p, SCHEMA_POINT, `points[${i}].`)); if (p.capture && (!('equipe' in p.capture) || typeof p.capture.k !== 'number')) L.push(`points[${i}].capture`); });
  (H.cibles || []).forEach((c, i) => L.push(...fautes(c, SCHEMA_CIBLE, `cibles[${i}].`)));
  (H.allies || []).forEach((c, i) => L.push(...fautes(c, SCHEMA_ALLIE, `allies[${i}].`)));
  if (H.annonce && (typeof H.annonce.texte !== 'string' || typeof H.annonce.cls !== 'string')) L.push('annonce');
  if (H.aveugle && (typeof H.aveugle.t !== 'number' || typeof H.aveugle.duree !== 'number')) L.push('aveugle');
  if ((H.allies || []).length > 4) L.push('allies > 4');
  if (mode === 'melee' && (H.allies || []).length) L.push('allies non vide en chacun pour soi');
  return L.map((f) => mode + ' : ' + f);
}
// LE SEGMENT LIBRE DE TOUTES LES FORMES (camera ou non, joueur ou non : jardinières, vélos, voitures), sauf `off` et
// `balle === false` — le contrôle strict de la passe de mesure du stand (ce que le DDA de L-A arrêtera)
function libreTout(C, ax, ay, az, bx, by, bz, r = 0.03) {
  let tMin = 1, qui = null;
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  C._parcourir(Math.min(ax, bx) - r, Math.min(az, bz) - r, Math.max(ax, bx) + r, Math.max(az, bz) + r, (s) => {
    if (s.off || s.balle === false) return;
    const cam = s.camera; s.camera = true;
    const t = C._segment(s, ax, ay, az, dx, dy, dz, r);
    s.camera = cam;
    if (t < tMin) { tMin = t; qui = s.id; }
  });
  return { t: tMin, qui };
}
// retirer du monde solide une forme ajoutée par un test (la dernière) : le monde rendu tel quel
function retirerForme(C, f) {
  const i = C.formes.indexOf(f);
  if (i >= 0) C.formes.splice(i, 1);
  for (const L of C.grille.values()) { const j = L.indexOf(f); if (j >= 0) L.splice(j, 1); }
}

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-E', nom, fn, opts);
  const tel = () => !!(window.__chargement && window.__chargement.telephone);
  const _o = new THREE.Vector3();
  // jusqu'au « GO » (présentation + décompte), puis un pas
  const versManche = (p) => { for (let i = 0; i < 4000 && p.phase !== 'manche'; i++) p.pas(PAS); };
  // un acteur figé (ni pas, ni tir) — la réapparition le rend au jeu : on le refige
  const figer = (a) => { a.gele = true; if (a.arsenal) a.arsenal.bloque = true; };
  const pasJusqua = (p, f, max = 20000) => { let n = 0; while (n < max && !f()) { p.pas(PAS); n++; } return n; };

  // 1. LES PHASES : présentation 3 s → décompte 3 s → manche (± 1 pas) ; avant le GO, la commande n'a pas d'effet
  T('1 phases : présentation, décompte, manche ; rien avant le GO', async () => {
    await jeu.lancer('equipes', { graine: 101, zone: 'ss', allies: 1, ennemis: 1 });
    const p = game.partie, h = p.local, ph = [];
    p.sur('phase', (e) => ph.push([e.phase, p.tick]));
    const tirs = []; p.sur('tir', (e) => tirs.push([e.a, p.phase]));
    const x0 = h.pos.clone();
    jeu.commande(0, { ay: 1, amp: 1, tir: true, sprint: true, recharger: true }, 8);
    let peutAvant = false, bougeAvant = 0, tick0 = p.tick;
    for (let i = 0; i < 1000 && p.phase !== 'manche'; i++) {
      p.pas(PAS);
      if (p.phase !== 'manche') { if (p.peutTirer(h)) peutAvant = true; bougeAvant = Math.max(bougeAvant, h.pos.distanceTo(x0)); }
    }
    const tD = (ph.find((e) => e[0] === 'decompte') || [0, -1])[1] - tick0, tM = (ph.find((e) => e[0] === 'manche') || [0, -1])[1] - tick0;
    const tirsAvant = tirs.filter((e) => e[1] !== 'manche' && e[0] === 0).length;
    jeu.avancer(1);
    const bougeApres = h.pos.distanceTo(x0), tirsApres = tirs.filter((e) => e[0] === 0).length;
    jeu.quitter('balade');
    const ok = Math.abs(tD - 360) <= 1 && Math.abs(tM - 720) <= 1 && !peutAvant && bougeAvant < 1e-6 && tirsAvant === 0 && bougeApres > 1 && tirsApres > 0;
    return { ok, attendu: 'décompte au pas 360 ± 1, manche au pas 720 ± 1 ; avant le GO : peutTirer faux, immobile, aucun tir ; après : il court et tire',
      obtenu: `décompte ${tD} · manche ${tM} · peutTirer avant ${peutAvant} · bougé avant ${r2(bougeAvant)} m · tirs avant ${tirsAvant} · après : ${r2(bougeApres)} m, ${tirsApres} tirs` };
  });

  // 2. CHACUN POUR SOI, 6 bots au −1, 10 min simulées : la fin, les comptes, le classement
  T('2 chacun pour soi : fin, Σ élim. = Σ morts − suicides, classement, fin émise', async () => {
    await jeu.lancer('melee', { graine: 102, zone: 'ss', ennemis: 6, humain: false });
    const p = game.partie; let fin = null, nFin = 0;
    p.sur('fin', (e) => { fin = e; nFin++; });
    jeu.avancer(615, { vitesse: 8 });
    const cl = p._classement(), se = cl.reduce((s, c) => s + c.elims, 0), sm = cl.reduce((s, c) => s + c.morts, 0), ss = cl.reduce((s, c) => s + c.suicides, 0);
    const trie = cl.every((c, i) => i === 0 || cl[i - 1].net > c.net || (cl[i - 1].net === c.net && cl[i - 1].score >= c.score));
    const parScore = cl.some((c) => c.net >= p.scoreCible), parTemps = p.tJeu >= p.duree - 1e-6;
    const ok = !!fin && nFin === 1 && p.phase === 'fin' && (parScore || parTemps) && se === sm - ss && trie && fin.gagnant === cl[0].id && cl.length === 6
      && (!parScore || p.tJeu < p.duree);
    jeu.quitter('balade');
    return { ok, attendu: 'fin à 20 éliminations ou à 10:00, émise une fois avec le gagnant (1er du classement) ; Σ élim. = Σ morts − suicides ; classement trié',
      obtenu: `fin ${!!fin} ×${nFin} · ${parScore ? 'au score' : parTemps ? 'au temps' : '?'} (${r2(p.tJeu)} s, meilleur ${cl[0] ? cl[0].net : '-'}) · Σ élim ${se}, morts ${sm}, suicides ${ss} · trié ${trie} · gagnant ${fin ? fin.gagnant : '-'} / ${cl[0] ? cl[0].id : '-'}` };
  }, { delai: 240 });

  // 3. ÉQUIPES : +1 par élimination, fin au score (40, 20 au téléphone) ; les balles traversent les alliés
  T('3 équipes : +1 par élimination, fin au score, 2 000 tirs à travers un allié', async () => {
    // (a) le score cible par défaut, sur chaque appareil
    const cPc = new PartieFPS(game, { mode: 'equipes', appareil: 'pc' }, {}).scoreCible, cTel = new PartieFPS(game, { mode: 'equipes', appareil: 'tel' }, {}).scoreCible;
    // (b) 4 c. 4 de bots au −1 : chaque élimination +1 à l'équipe du tireur ; fin au score (ici 8, pour que le score finisse)
    await jeu.lancer('equipes', { graine: 103, zone: 'ss', allies: 4, ennemis: 4, humain: false, scoreCible: 8 });
    let p = game.partie, faux = 0, nElim = 0, finTick = -1, elimTick = -1;
    p.sur('elim', (e) => {
      const t = p.acteurParId(e.par), c = p.acteurParId(e.cible);
      if (!t || t === c) return;
      nElim++; elimTick = p.tick;
      const s = p.scores;
      if (s.A + s.B !== nElim) faux++;
    });
    p.sur('phase', (e) => { if (e.phase === 'fin_manche') finTick = p.tick; });
    jeu.avancer(400, { vitesse: 8 });
    const sc = { ...p.scores }, finScore = Math.max(sc.A, sc.B) === 8 && finTick === elimTick && finTick > 0;
    jeu.quitter('balade');
    // (c) 2 000 tirs forcés à travers un allié, dans la rue : Haythem (A), un allié à 3 m, un ennemi à 8 m derrière lui
    await jeu.lancer('equipes', { graine: 113, zone: 'ecole', allies: 1, ennemis: 1 });
    p = game.partie; versManche(p);
    const h = p.local, al = p.acteurs.find((a) => a.equipe === 'A' && !a.local), en = p.acteurs.find((a) => a.equipe === 'B');
    for (const a of [al, en]) figer(a);
    jeu.teleporter(h.id, -2.7, -0.12, 3.75, -Math.PI / 2); jeu.teleporter(al.id, 0.3, -0.12, 3.75, Math.PI / 2); jeu.teleporter(en.id, 5.3, -0.12, 3.75, Math.PI / 2);
    en.vie = en.vieMax = 1e9;
    let degAllie = 0, toucheEn = 0, viaAllie = 0;
    const des = p.sur('touche', (e) => { if (e.cible === al.id) degAllie += e.degats; if (e.cible === en.id) toucheEn++; });
    const res = {}, f = ARMES.fa24, H = [1.635, 1.48, 1.27, 1.0, 0.5];
    for (let k = 0; k < 2000; k++) {
      h.oeil(_o);
      const y = en.pos.y + H[k % H.length], dx = en.pos.x - _o.x, dy = y - _o.y, dz = en.pos.z - _o.z + ((k * 7) % 5 - 2) * 0.02, L = Math.hypot(dx, dy, dz);
      const r = p.balistique.tirer(p, h, _o.x, _o.y, _o.z, dx / L, dy / L, dz / L, 100, res);
      // (le rayon passe-t-il par l'allié ? sa distance à l'axe de l'allié, à sa hauteur)
      const t = (al.pos.x - _o.x) / (dx / L); if (Math.abs(_o.z + dz / L * t - al.pos.z) < 0.2) viaAllie++;
      p.resoudreTir(h, f, _o.x, _o.y, _o.z, dx / L, dy / L, dz / L, r, 0);
      p.appliquerEffets();
    }
    des();
    const direct = p.infliger(al, 50, { par: h.id, arme: 'fa24', zone: 'torse' });
    jeu.quitter('balade');
    const ok = cPc === 40 && cTel === 20 && faux === 0 && nElim >= 8 && finScore && degAllie === 0 && toucheEn === 2000 && viaAllie > 1500 && direct === 0 && al.vie === 100;
    return { ok, attendu: 'défaut 40 (PC) / 20 (tél.) ; A + B = éliminations à chaque élimination ; fin au pas de la 8e ; 2 000 tirs : 0 dégât à l’allié, 2 000 touches sur l’ennemi derrière',
      obtenu: `${cPc} / ${cTel} · ${nElim} élim., ${faux} faux · fin ${finScore} (${sc.A}–${sc.B}) · allié ${degAllie} dégâts (tir direct ${direct}), ennemi ${toucheEn} touches (${viaAllie} rayons par l’allié)` };
  }, { delai: 180 });

  // 4. RÉAPPARITION 3,0 s (2,0 en chacun pour soi), PROTECTION 1,2 s finie au premier tir, RÉGÉNÉRATION
  T('4 réapparition, protection, régénération', async () => {
    const res = [];
    const mesurer = async (mode, attendu) => {
      await jeu.lancer(mode, { graine: 104, zone: 'ss', allies: 0, ennemis: 1 });
      const p = game.partie; versManche(p);
      const h = p.local, b = p.acteurs.find((a) => a !== h); figer(b);
      p.infliger(h, 1000, { par: b.id, arme: 'fa24', zone: 'torse' }); p.infliger(b, 1000, { par: h.id, arme: 'fa24', zone: 'torse' });
      const n = pasJusqua(p, () => h.vivant, 2000);
      res.push([mode + ' réapparition', Math.abs(n - attendu * 120) <= 1, n]);
      return { p, h, b };
    };
    await mesurer('melee', 2.0); jeu.quitter('balade');
    const { p, h, b } = await mesurer('equipes', 3.0);
    // la protection : 1,2 s, puis vulnérable ; finie au premier tir
    figer(b); b.vivant = true;
    const d0 = p.infliger(h, 10, { par: b.id }); pasJusqua(p, () => p.t >= h.protegeT - 0.1);
    const d1 = p.infliger(h, 10, { par: b.id }); pasJusqua(p, () => p.t > h.protegeT + PAS);
    const d2 = p.infliger(h, 10, { par: b.id });
    res.push(['protégé 1,2 s', d0 === 0 && d1 === 0 && d2 === 10, `${d0} · ${d1} · ${d2}`]);
    p.infliger(h, 1000, { par: b.id }); pasJusqua(p, () => h.vivant, 2000);
    const prot = h.protegeT - p.t;
    jeu.commande(0, { tir: true }, PAS); p.pas(PAS); p.pas(PAS);
    const d3 = p.infliger(h, 10, { par: b.id });
    res.push(['finie au premier tir', prot > 1.1 && d3 === 10, `${r2(prot)} s restait · ${d3}`]);
    // la régénération : rien pendant 4,0 s, puis 35 PV/s (0 → 100 en 2,857 s)
    jeu.avancer(5);
    p.infliger(h, h.vie - 0.01, { par: b.id });
    const v0 = h.vie; let nAvant = 0, nRegen = 0;
    for (let i = 0; i < 2000 && h.vie < h.vieMax - 1e-9; i++) { const v = h.vie; p.pas(PAS); if (h.vie > v) nRegen++; else nAvant++; }
    res.push(['régénération', Math.abs(nAvant - 479) <= 1 && Math.abs(nRegen - 99.99 / 35 * 120) <= 1, `${r2(v0)} PV · ${nAvant} pas sans · ${nRegen} pas de régénération (${r2(nRegen / 120)} s)`]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'réapparition 240 / 360 pas ± 1 ; protection 1,2 s puis finie au premier tir ; 4,0 s sans soin puis 35 PV/s (343 pas ± 1)',
      obtenu: res.map((r) => `${r[0]} ${r[2]}${r[1] ? '' : ' ✗'}`).join(' · ') };
  });

  // 5. LE BARÈME (§ 3.8) : chaque ligne provoquée une fois ; assistance à 30 dégâts (29 : rien)
  T('5 barème et assistances', async () => {
    const B = REGLES_FPS.bareme, res = [];
    await jeu.lancer('equipes', { graine: 105, zone: 'ss', allies: 1, ennemis: 3 });
    let p = game.partie; versManche(p);
    const h = p.local, al = p.acteurs.find((a) => a.equipe === 'A' && !a.local), E = p.acteurs.filter((a) => a.equipe === 'B');
    for (const a of p.acteurs) if (!a.local) figer(a);
    const pts = []; p.sur('score', (e) => pts.push(e));
    const cas = (nom, fn, attendus) => {
      pts.length = 0;
      for (const a of p.acteurs) { if (!a.local) figer(a); a.protegeT = 0; if (!a.vivant) { a.reapparaitre(a.pos.x, a.pos.y, a.pos.z, 0, p.t); a.protegeT = 0; figer(a); } }
      fn();
      const obt = pts.map((e) => `${e.id}:${e.raison}:${e.points}`).sort().join(' '), att = attendus.slice().sort().join(' ');
      res.push([nom, obt === att, obt || '(rien)']);
    };
    const tue = (c, o) => p.infliger(c, 1000, { par: h.id, arme: 'fa24', zone: 'torse', ...o });
    cas('élimination', () => tue(E[0]), [`0:elim:${B.elim}`]);
    cas('tête', () => tue(E[0], { zone: 'tete' }), [`0:elim:${B.elim + B.tete}`]);
    cas('couteau', () => tue(E[0], { arme: 'couteau' }), [`0:elim:${B.elim + B.couteau}`]);
    cas('au-delà de 30 m', () => { jeu.teleporter(E[1].id, h.pos.x + 31, h.pos.y, h.pos.z); tue(E[1]); }, [`0:elim:${B.elim + B.loin}`]);
    cas('assistance (30)', () => { p.infliger(E[2], 30, { par: al.id }); tue(E[2]); }, [`0:elim:${B.elim}`, `${al.id}:assistance:${B.assistance}`]);
    cas('pas d’assistance (29)', () => { p.infliger(E[0], 29, { par: al.id }); tue(E[0]); }, [`0:elim:${B.elim}`]);
    const avant = { ...p.scores };
    cas('suicide', () => p.infliger(h, 1000, { par: h.id, arme: 'frag' }), [`0:suicide:${B.suicide}`]);
    res.push(['suicide : équipe −1, élim. inchangées', p.scores.A === avant.A - 1 && p._ext(h).suicides === 1, `${avant.A} → ${p.scores.A}`]);
    const score = h.stats.score, attenduScore = 6 * B.elim + B.tete + B.couteau + B.loin + B.suicide;
    res.push(['score de Haythem', score === attenduScore, `${score} / ${attenduScore}`]);
    jeu.quitter('balade');
    // la domination : capture 150, neutralisation 75, défense 50
    await jeu.lancer('domination', { graine: 115, allies: 1, ennemis: 1 });
    p = game.partie; versManche(p);
    const h2 = p.local, en = p.acteurs.find((a) => a.equipe === 'B'), al2 = p.acteurs.find((a) => a.equipe === 'A' && !a.local), A = p.points[0];
    for (const a of p.acteurs) if (!a.local) figer(a);
    const loin = (a) => jeu.teleporter(a.id, -2.5 - a.id * 0.8, -0.12, 5.5);
    for (const a of [en, al2]) loin(a);
    const sc = []; p.sur('score', (e) => { if (e.raison !== 'point') sc.push(`${e.id}:${e.raison}:${e.points}`); });
    jeu.teleporter(h2.id, A.x, A.y, A.z); pasJusqua(p, () => A.possesseur === 'A', 2000);
    jeu.teleporter(en.id, A.x + 0.5, A.y, A.z); p.infliger(en, 1000, { par: h2.id, arme: 'fa24', zone: 'torse' });     // (défense : A est à nous)
    pasJusqua(p, () => en.vivant, 1000); figer(en); loin(h2);
    jeu.teleporter(en.id, A.x, A.y, A.z); pasJusqua(p, () => !A.possesseur, 2000);
    const att = [`0:capture:${B.capture}`, `0:elim:${B.elim + B.defense}`, `${en.id}:neutralisation:${B.neutralisation}`];
    res.push(['capture, défense, neutralisation', sc.slice().sort().join(' ') === att.slice().sort().join(' '), sc.join(' ')]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'chaque ligne : ses points exacts (§ 3.8), assistance à 30 et pas à 29',
      obtenu: res.map((r) => `${r[0]} [${r[2]}]${r[1] ? '' : ' ✗'}`).join(' · ') };
  });

  // 6. LA DOMINATION : 8 s seul, 5,33 s à deux, 4 s à trois ; disputé figé ; adverse 4 s puis 12 s ; 1 point / 3 s ;
  //    mi-temps à 75 ou 5:00 (camps échangés) ; fin à 150 ou 10:00 ; hud.points à jour
  T('6 domination : captures, points, mi-temps, fin', async () => {
    const res = [];
    await jeu.lancer('domination', { graine: 106, allies: 3, ennemis: 3, humain: false });
    let p = game.partie; versManche(p);
    const A = p.acteurs.filter((a) => a.equipe === 'A'), Bq = p.acteurs.filter((a) => a.equipe === 'B');
    for (const a of p.acteurs) figer(a);
    const ranger = () => p.acteurs.forEach((a, i) => jeu.teleporter(a.id, -2.6 + (i % 4) * 0.8, -0.12, 4.2 + Math.floor(i / 4) * 0.8));
    const dans = (L, P) => L.forEach((a, i) => jeu.teleporter(a.id, P.x + [0, 0.7, -0.7][i], P.y, P.z + [0, 0.4, -0.4][i]));
    const remettre = (P, poss = null) => { P.possesseur = poss; P.capture = { equipe: null, k: 0 }; P.tenu = 0; };
    const prise = (P, eq) => pasJusqua(p, () => P.possesseur === eq, 3000);
    // seul, à deux, à trois (un point neutre)
    for (const [n, P, att] of [[1, p.points[0], 960], [2, p.points[2], 640], [3, p.points[1], 480]]) {
      ranger(); remettre(P); dans(A.slice(0, n), P);
      const k = prise(P, 'A'); res.push([`${n} dans ${P.id}`, Math.abs(k - att) <= 1, k]);
    }
    // disputé : figé
    ranger(); const P0 = p.points[0]; remettre(P0); dans(A.slice(0, 1), P0); for (let i = 0; i < 240; i++) p.pas(PAS);
    const k0 = P0.capture.k; jeu.teleporter(Bq[0].id, P0.x - 0.6, P0.y, P0.z - 0.6); for (let i = 0; i < 360; i++) p.pas(PAS);
    res.push(['disputé figé', Math.abs(P0.capture.k - k0) < 1e-9 && k0 > 0.2, `${r2(k0)} → ${r2(P0.capture.k)}`]);
    // un point adverse : neutralisé en 4 s, pris en 12 s
    ranger(); remettre(P0, 'A'); dans(Bq.slice(0, 1), P0);
    const kN = pasJusqua(p, () => !P0.possesseur, 2000), kP = kN + prise(P0, 'B');
    res.push(['adverse : neutralisé, pris', Math.abs(kN - 480) <= 1 && Math.abs(kP - 1440) <= 2, `${kN} · ${kP}`]);
    // les points tenus : 2 anneaux à A pendant 30 s → 20 points
    ranger(); for (const P of p.points) remettre(P); remettre(p.points[0], 'A'); remettre(p.points[1], 'A');
    const sA = p.scores.A; for (let i = 0; i < 30 * 120; i++) p.pas(PAS);
    res.push(['1 point / 3 s / anneau', p.scores.A - sA === 20, p.scores.A - sA]);
    // hud.points à jour
    p.majHud(); res.push(['hud.points', p.hud.points.length === 3 && p.hud.points.every((q, i) => q.possesseur === p.points[i].possesseur && q.id === p.points[i].id), p.hud.points.map((q) => q.id + ':' + q.possesseur).join(' ')]);
    // la mi-temps à 75 : camps échangés (l'équipe A repart du côté des SLAM)
    for (const P of p.points) remettre(P); remettre(p.points[0], 'A');
    p.scores.A = 74; p.scores.B = 10;
    pasJusqua(p, () => p.phase === 'mi_temps', 1000);
    const enMi = p.phase === 'mi_temps' && p.acteurs.every((a) => a.gele);
    pasJusqua(p, () => p.phase === 'manche', 1000);
    const DB = ZONES_JEU.ecole.departs.B, cote = A.every((a) => DB.some((d) => Math.hypot(a.pos.x - d[0], a.pos.z - d[2]) < 6 && Math.abs(a.pos.y - d[1]) < 0.5));
    res.push(['mi-temps à 75, camps échangés', enMi && cote && p.cotes.A === 'B' && p.points.every((P) => !P.possesseur), `${enMi} · ${cote} · ${p.cotes.A}`]);
    // la fin à 150
    for (const a of p.acteurs) figer(a);
    remettre(p.points[0], 'B'); p.scores.B = 149;
    pasJusqua(p, () => p.phase !== 'manche', 1000);
    res.push(['fin à 150', p.phase === 'fin_manche' && p.scores.B === 150 && p.gagnant === 'B', `${p.phase} ${p.scores.A}–${p.scores.B}`]);
    jeu.quitter('balade');
    // au temps : mi-temps à la moitié (ici 10 s sur 20), fin à 20 s
    await jeu.lancer('domination', { graine: 116, allies: 1, ennemis: 1, humain: false, duree: 20 });
    p = game.partie; versManche(p); for (const a of p.acteurs) figer(a); p.acteurs.forEach((a, i) => jeu.teleporter(a.id, -2.6 + i, -0.12, 4.5));
    const t0 = p.tJeu; pasJusqua(p, () => p.phase === 'mi_temps', 3000); const tMi = p.tJeu - t0;
    pasJusqua(p, () => p.phase === 'manche', 1000); for (const a of p.acteurs) figer(a); p.acteurs.forEach((a, i) => jeu.teleporter(a.id, -2.6 + i, -0.12, 4.5));
    pasJusqua(p, () => p.phase === 'fin_manche', 3000);
    res.push(['au temps : mi-temps 10 s, fin 20 s', Math.abs(p.tJeu - 20) < 0.02 && Math.abs(tMi + t0 - 10) < 0.02, `${r2(tMi + t0)} · ${r2(p.tJeu)}`]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: '960 / 640 / 480 pas ± 1 ; disputé figé ; 480 puis 1 440 ; +20 en 30 s ; mi-temps (75, 5:00) et fin (150, 10:00)',
      obtenu: res.map((r) => `${r[0]} [${r[2]}]${r[1] ? '' : ' ✗'}`).join(' · ') };
  }, { delai: 180 });

  // 7. 10 min de CHACUN POUR SOI : jamais une apparition sous les yeux d'un ennemi ; ≤ 2 % des morts < 2 s après l'apparition
  const apparitionsSures = async (o) => {
    await jeu.lancer('melee', o);
    const p = game.partie, B = p.balistique, apparu = new Map();
    let vues = 0, n = 0, morts = 0, tot = 0;
    p.sur('apparition', (e) => {
      n++; apparu.set(e.a, p.t);
      const a = p.acteurParId(e.a);
      for (const b of p.acteurs) {
        if (b === a || !b.vivant || !p.ennemis(b, a)) continue;
        b.oeil(_o);
        if (B.vue(_o.x, _o.y, _o.z, e.x, e.y + 1.5, e.z) || B.vue(_o.x, _o.y, _o.z, e.x, e.y + 0.9, e.z)) { vues++; break; }
      }
    });
    p.sur('elim', (e) => { tot++; if (apparu.has(e.cible) && p.t - apparu.get(e.cible) < 2) morts++; });
    jeu.avancer(606, { vitesse: 8 });
    const r = { n, vues, morts, tot, replis: p.replis || 0 };
    jeu.quitter('balade');
    return r;
  };
  T('7 apparitions : jamais vues, ≤ 2 % de morts dans les 2 s', async () => {
    const r = await apparitionsSures({ graine: 107, zone: 'ss', ennemis: 6, humain: false, scoreCible: 1000 });
    const ok = r.n > 20 && r.vues === 0 && r.morts <= 0.02 * r.tot;
    return { ok, attendu: '0 apparition vue d’un ennemi ; morts < 2 s après l’apparition ≤ 2 % des morts',
      obtenu: `${r.n} apparitions, ${r.vues} vues (${r.replis} replis) · ${r.morts} morts rapides sur ${r.tot} (${r2(100 * r.morts / Math.max(1, r.tot))} %)` };
  }, { delai: 240 });

  // 8. LES CLASSES : dotations exactes ; 1 000 tirages de classe de bots → 40 / 30 / 20 / 10 % ± 3 points
  T('8 classes : dotations, tirage 40/30/20/10', async () => {
    const res = [];
    for (const classe of Object.keys(CLASSES)) {
      await jeu.lancer('equipes', { graine: 108, zone: 'ss', allies: 1, ennemis: 2, classe });
      const p = game.partie, D = CLASSES[classe];
      // (l'arme en main au départ : la principale ; la liste des armes, si l'arsenal la montre ; létales et tactiques)
      const dot = (a, K) => { const A = a.arsenal; return !!A && !!A.arme && A.arme.id === K.principale
        && (!Array.isArray(A.armes) || A.armes.map((f) => f.id).join(',') === [K.principale, K.secondaire].filter(Boolean).join(','))
        && A.letales === (K.letale ? K.letale[1] : 0) && A.tactiques === (K.tactique ? K.tactique[1] : 0); };
      res.push([classe, dot(p.local, D) && p.acteurs.filter((a) => !a.local).every((a) => dot(a, CLASSES[tirerClasseBot(p.graine, a.id)]))]);
      jeu.quitter('balade');
    }
    const n = { assaut: 0, infiltration: 0, defense: 0, tireur: 0 };
    for (let g = 1; g <= 50; g++) for (let id = 0; id < 20; id++) n[tirerClasseBot(g * 7919, id)]++;
    const part = { assaut: 40, infiltration: 30, defense: 20, tireur: 10 }, ecarts = Object.keys(n).map((k) => [k, n[k] / 10, Math.abs(n[k] / 10 - part[k])]);
    const ok = res.every((r) => r[1]) && ecarts.every((e) => e[2] <= 3);
    return { ok, attendu: 'Haythem et chaque bot : armes, létales, tactiques de leur classe ; tirages à ± 3 points',
      obtenu: res.map((r) => `${r[0]} ${r[1]}`).join(' · ') + ' · ' + ecarts.map((e) => `${e[0]} ${e[1]} %`).join(' ') };
  }, { delai: 120 });

  // 9. LES 4 ZONES DE COMBAT se lancent avec leurs départs ; la domination hors de toute l'école est refusée
  T('9 zones et départs ; domination hors école refusée', async () => {
    const res = [];
    for (const zone of ['ecole', 'rdc_rue', 'ss', 'etages']) {
      let err = null;
      try { await jeu.lancer('equipes', { graine: 109, zone }); } catch (e) { err = String(e); }
      const p = game.partie, D = ZONES_JEU[zone].departs;
      const pres = (a) => (D[a.equipe] || []).some((d) => Math.hypot(a.pos.x - d[0], a.pos.z - d[2]) < 6 && Math.abs(a.pos.y - d[1]) < 0.5);
      const ok = !err && !!p && p.zone === zone && p.acteurs.length >= 4 && p.acteurs.every(pres);
      res.push([zone, ok, err || (p ? p.acteurs.filter((a) => !pres(a)).map((a) => `${a.id}@${r2(a.pos.x)},${r2(a.pos.y)},${r2(a.pos.z)}`).join(' ') : 'pas de partie')]);
      jeu.quitter('balade');
    }
    let msg = null; try { await jeu.lancer('domination', { zone: 'ss' }); } catch (e) { msg = String(e && e.message || e); }
    const refuse = !!msg && /domination/i.test(msg) && !game.partie;
    let msg2 = null; try { await jeu.lancer('equipes', { zone: 'e1' }); } catch (e) { msg2 = String(e && e.message || e); }
    jeu.quitter('balade');
    const ok = res.every((r) => r[1]) && refuse && !!msg2 && PartieFPS.refus({ mode: 'domination', zone: 'ecole' }) === null;
    return { ok, attendu: 'chaque zone : partie lancée, chaque acteur à ≤ 6 m d’un départ de son camp ; domination au −1 : refusée, avec un message',
      obtenu: res.map((r) => `${r[0]} ${r[1] ? 'ok' : '✗ ' + r[2]}`).join(' · ') + ` · refus « ${msg} » · zone du prop hunt « ${msg2} »` };
  }, { delai: 120 });

  // 10. LES EFFECTIFS : PC 4 c. 4 et 1 + 5, 9 bots au plus ; téléphone 2 c. 2 et 1 + 3, 5 bots au plus (et sous ?tel=1, d'office)
  T('10 effectifs PC et téléphone', async () => {
    const res = [];
    const pc = [effectifs('equipes', {}, false), effectifs('melee', {}, false), effectifs('equipes', { allies: 9, ennemis: 9 }, false)];
    res.push(['PC', pc[0].allies === 3 && pc[0].ennemis === 4 && pc[1].ennemis === 5 && pc[2].bots === 9, `${pc[0].allies}+1 c. ${pc[0].ennemis} · 1 + ${pc[1].ennemis} · max ${pc[2].bots}`]);
    const t = [effectifs('equipes', {}, true), effectifs('melee', {}, true), effectifs('equipes', { allies: 4, ennemis: 5 }, true), effectifs('melee', { ennemis: 9 }, true)];
    res.push(['tél.', t[0].allies === 1 && t[0].ennemis === 2 && t[1].ennemis === 3 && t[2].bots === 5 && t[3].bots === 5, `${t[0].allies}+1 c. ${t[0].ennemis} · 1 + ${t[1].ennemis} · max ${t[2].bots} / ${t[3].bots}`]);
    // les parties lancées avec les effectifs du téléphone (d'office sous ?tel=1)
    const o = tel() ? {} : { appareil: 'tel' };
    await jeu.lancer('equipes', { graine: 110, zone: 'ss', ...o }); const nE = game.partie.acteurs.length, sE = game.partie.scoreCible; jeu.quitter('balade');
    await jeu.lancer('melee', { graine: 110, zone: 'ss', ...o }); const nM = game.partie.acteurs.length; jeu.quitter('balade');
    await jeu.lancer('equipes', { graine: 110, zone: 'ss', allies: 4, ennemis: 5, ...o }); const nX = game.partie.acteurs.length - 1; jeu.quitter('balade');
    res.push(['parties tél.', nE === 4 && nM === 4 && nX === 5 && sE === 20, `2 c. 2 → ${nE} · 1 + 3 → ${nM} · bots ${nX} · score ${sE}`]);
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'PC : 4 c. 4, 1 + 5, 9 bots au plus ; téléphone : 2 c. 2, 1 + 3, 5 bots au plus, 20 éliminations',
      obtenu: (tel() ? '(?tel=1) ' : '') + res.map((r) => `${r[0]} [${r[2]}]${r[1] ? '' : ' ✗'}`).join(' · ') };
  });

  // 11. LE STAND : chaque défi au bout ; levée en 0,15 s, chute à la touche, tête × 2 ; record écrit (stockage qui lève :
  //     0 erreur) ; le mannequin dit zone et dégâts de CHAQUE balle
  // (Haythem scripté : il vise la cible levée — le buste, ou la tête —, épaulé, et tire une balle)
  const jouerDefi = (p, { tete = false, pause = 0.12 } = {}) => {
    jeu.commande(0, { visee: true }, 999);
    for (let n = 0; n < 6000 && p.phase === 'manche'; n++) {
      const c = p.cibles.filter((q) => q.vivant).sort((u, v) => u.distance - v.distance)[0];
      if (!c) { jeu.commande(0, { visee: true, tir: false }, 999); jeu.avancer(0.05); continue; }
      jeu.viser(0, { x: c.pos.x, y: c.pos.y + (tete ? 1.6 : 0.75), z: c.pos.z });
      jeu.commande(0, { visee: true, tir: true }, 999); jeu.avancer(PAS);
      jeu.commande(0, { visee: true, tir: false }, 999); jeu.avancer(pause);
    }
    jeu.commande(0, { visee: false, tir: false }, PAS);
  };
  T('11 stand : quatre défis, cibles, tête × 2, records, mannequin', async () => {
    const res = [], S0 = (() => { try { return localStorage.getItem(REGLES_STAND.cle); } catch (e) { return null; } })();
    const lancerDefi = async (defi) => { await jeu.lancer('stand', { graine: 111, defi }); const p = game.partie; for (let i = 0; i < 400 && p.phase === 'decompte'; i++) p.pas(PAS); return p; };
    // « 20 cibles en 30 s » (et la levée, la chute, la tête × 2)
    let p = await lancerDefi('vingt');
    p.pas(PAS);
    const c0 = p.cibles.find((c) => c.st.sens === 1);
    let nLeve = 0; if (c0) nLeve = pasJusqua(p, () => c0.vivant, 100);
    res.push(['levée 0,15 s', !!c0 && Math.abs(nLeve - 18) <= 1, nLeve]);
    const unePts = (tete) => { const c = p.cibles.filter((q) => q.vivant)[0]; const avant = p.S.points; jeu.viser(0, { x: c.pos.x, y: c.pos.y + (tete ? 1.6 : 0.75), z: c.pos.z });
      jeu.commande(0, { visee: true, tir: true }, PAS); p.pas(PAS); const tombe = !c.vivant; jeu.commande(0, { tir: false }, PAS); p.pas(PAS); return { d: c.distance, pts: p.S.points - avant, tombe }; };
    jeu.commande(0, { visee: true }, 999); jeu.avancer(0.4);
    const corps = unePts(false); pasJusqua(p, () => p.cibles.some((q) => q.vivant), 600);
    const tete = p.cibles.some((q) => q.vivant) ? unePts(true) : null;
    res.push(['chute à la touche, tête × 2', corps.tombe && !!tete && tete.tombe && tete.pts === 2 * REGLES_STAND.points[tete.d] && corps.pts === REGLES_STAND.points[corps.d],
      `${corps.pts} à ${corps.d} m · tête ${tete ? tete.pts : '-'} à ${tete ? tete.d : '-'} m`]);
    jouerDefi(p);
    let r = p.resultat; pasJusqua(p, () => p.phase === 'fin', 400); await jeu.images(2);
    res.push(['20 cibles en 30 s', !!r && r.reussi && r.compte === 20 && r.temps < 30 && p.phase === 'fin', r ? `${r.compte} en ${r2(r.temps)} s, ${r.points} pts, précision ${r.precision}` : '-']);
    const rec = lireRecords().records['vingt:fa24'];
    res.push(['record écrit', !!rec && rec.meilleur.compte === 20 && !!p.record, rec ? `${rec.essais} essai(s)` : 'absent']);
    jeu.quitter('balade');
    // « 10 têtes »
    p = await lancerDefi('tetes'); jouerDefi(p, { tete: true }); r = p.resultat;
    res.push(['10 têtes', !!r && r.reussi && r.compte === 10, r ? `${r.compte} têtes en ${r2(r.temps)} s` : '-']); jeu.quitter('balade');
    // « 30 balles à 15 m » (la rafale tenue)
    p = await lancerDefi('recul');
    const cR = p.cibles.find((c) => c.distance === 15 && c.couloir === DEFIS.recul.couloir); pasJusqua(p, () => cR.vivant, 100);
    jeu.viser(0, { x: cR.pos.x, y: cR.pos.y + 1.0, z: cR.pos.z });
    jeu.commande(0, { visee: true, tir: true }, 999);
    pasJusqua(p, () => p.phase !== 'manche', 5000); jeu.commande(0, { tir: false, visee: false }, PAS); r = p.resultat;
    res.push(['30 balles à 15 m', !!r && r.tirs === 30 && r.touches > 0 && r.groupement !== null, r ? `${r.touches} / ${r.tirs}, groupement ${r.groupement} cm` : '-']); jeu.quitter('balade');
    // « Réflexes » (debout 0,8 s)
    p = await lancerDefi('reflexes'); jouerDefi(p, { pause: 0.03 }); r = p.resultat;
    res.push(['réflexes', !!r && r.compte >= 18 && r.reaction !== null && r.reaction < DEFIS.reflexes.haut, r ? `${r.compte} / 20, ${Math.round((r.reaction || 0) * 1000)} ms` : '-']); jeu.quitter('balade');
    // un stockage qui lève : 0 erreur, le record vaut pour la session
    const P = Storage.prototype, g = P.getItem, s = P.setItem; let err = null, rec2 = null;
    P.getItem = () => { throw new Error('refusé'); }; P.setItem = () => { throw new Error('plein'); };
    try { rec2 = enregistrerRecord({ defi: 'vingt', arme: 'fa24', reussi: true, temps: 12, compte: 20, points: 1 }); lireRecords(); } catch (e) { err = String(e); }
    finally { P.getItem = g; P.setItem = s; }
    res.push(['stockage qui lève', !err && !!rec2, err || 'aucune erreur']);
    try { if (S0 === null) localStorage.removeItem(REGLES_STAND.cle); else localStorage.setItem(REGLES_STAND.cle, S0); } catch (e) { /* */ }
    // le mannequin à 10 m : zone et dégâts de chaque balle
    await jeu.lancer('stand', { graine: 112 }); p = game.partie;
    const m = p.mannequin, tch = []; p.sur('touche', (e) => { if (e.cible === m.id) tch.push(e); });
    const H = [1.635, 1.48, 1.27, 1.0, 0.5, 1.635, 1.3, 1.05, 0.7, 0.3];
    jeu.commande(0, { visee: true }, 999); jeu.avancer(0.4);
    for (const y of H) { jeu.viser(0, { x: m.pos.x, y: m.pos.y + y, z: m.pos.z }); jeu.commande(0, { visee: true, tir: true }, 999); jeu.avancer(PAS); jeu.commande(0, { visee: true, tir: false }, 999); jeu.avancer(0.1); }
    p.majHud();
    const mc = p.hud.cibles.find((c) => c.mannequin), coups = mc ? mc.coups.slice(-tch.length) : [];
    const accord = tch.length === H.length && mc.n === H.length && coups.every((c, i) => c.zone === tch[i].zone && Math.abs(c.degats - tch[i].degats) < 0.01);
    const zones = new Set(coups.map((c) => c.zone));
    res.push(['mannequin', accord && zones.size >= 4 && m.vivant, `${mc ? mc.n : 0} coups · ${coups.map((c) => c.zone + ' ' + c.degats).join(', ')}`]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]);
    return { ok: !ko.length, attendu: 'chaque défi au bout ; levée en 18 pas ± 1 ; chute à la touche ; tête × 2 ; record écrit ; stockage qui lève sans erreur ; chaque balle au mannequin',
      obtenu: res.map((r) => `${r[0]} [${r[2]}]${r[1] ? '' : ' ✗'}`).join(' · ') };
  }, { delai: 240 });

  // 12. LE DÉTERMINISME (4 c. 4 de bots, 60 s) ; L'ÉTAT en manche, à la mi-temps, à la fin (et au stand)
  T('12 déterminisme 4 c. 4 ; état en manche, mi-temps, fin', async () => {
    const d = await jeu.verifierDeterminisme(42, 60, { mode: 'equipes', zone: 'ss', allies: 4, ennemis: 4, humain: false });
    const phases = [];
    const etat = async (o) => { const v = await jeu.verifierEtat(o); phases.push((jeu._dernierEtat ? jeu._dernierEtat.e1.phase : '?') + ' ' + v); return v; };
    const e1 = await etat({ mode: 'equipes', zone: 'ss', allies: 4, ennemis: 4, humain: false, secondes: 30 });
    const e2 = await etat({ mode: 'domination', allies: 3, ennemis: 3, humain: false, duree: 20, secondes: 18 });
    const e3 = await etat({ mode: 'melee', zone: 'ss', ennemis: 4, humain: false, duree: 5, secondes: 15 });
    const e4 = await etat({ mode: 'stand', defi: 'vingt', secondes: 8 });
    const ok = d.egal && e1 && e2 && e3 && e4 && phases[0].startsWith('manche') && phases[1].startsWith('mi_temps') && phases[2].startsWith('fin');
    return { ok, attendu: 'empreintes égales ; état vrai en manche, mi-temps, fin (et au stand)', obtenu: `${d.a} / ${d.b} · ${phases.join(' · ')}` };
  }, { delai: 180 });

  // 13. LE HUD : tous les champs du § 4.5.15, typés, dans chaque mode ; allies vide en chacun pour soi, ≤ 4 sinon
  T('13 partie.hud : schéma dans chaque mode', async () => {
    const F = [], vus = [];
    for (const [mode, o] of [['equipes', { allies: 4, ennemis: 4 }], ['melee', {}], ['domination', { allies: 4, ennemis: 4 }], ['stand', { defi: 'vingt' }], ['stand', {}]]) {
      await jeu.lancer(mode, { graine: 113, zone: mode === 'domination' || mode === 'stand' ? undefined : 'ss', ...o });
      const p = game.partie; await jeu.images(2); F.push(...fautesHud(p.hud, mode));
      jeu.avancer(7); p.majHud(); F.push(...fautesHud(p.hud, mode + ' (manche)'));
      // la mort de Haythem : la carte « éliminé par »
      if (mode !== 'stand') { const b = p.acteurs.find((a) => !a.local && p.ennemis(a, p.local)); p.local.protegeT = 0; p.infliger(p.local, 1000, { par: b.id, arme: 'fa24', zone: 'tete' }); p.majHud();
        F.push(...fautesHud(p.hud, mode + ' (mort)')); if (!p.hud.mort || p.hud.mort.tueur !== b.nom || p.hud.reapparitionT <= 0) F.push(mode + ' : carte de mort'); }
      vus.push(`${mode} ${p.hud.allies.length} alliés`);
      jeu.quitter('balade');
    }
    return { ok: !F.length, attendu: 'aucune faute de schéma ; allies vide en chacun pour soi, ≤ 4 sinon', obtenu: F.length ? F.slice(0, 12).join(' · ') : vus.join(' · ') };
  }, { delai: 120 });

  // 14. LE STAND : de la ligne de tir (œil debout) au centre de chaque cible, `balle()` libre jusqu'à elle — et le contrôle
  //     strict (toutes les formes : vélos, jardinières, voitures) ; 10 s de stand sans exception
  T('14 stand : lignes de tir libres, 10 s sans exception', async () => {
    await jeu.lancer('stand', { graine: 114 });
    const p = game.partie, C = game.collisions, out = {}, F = [];
    for (const c of STAND.cibles) {
      const L = STAND.couloirs[c.couloir], ys = C.solEn(L.x, L.z, 0.3), yc = C.solEn(c.x, c.z, 0.3);
      const ox = L.x, oy = ys + 1.62, oz = L.z;
      for (const [nom, h] of [['buste', 0.75], ['tête', 1.6]]) {
        const tx = c.x, ty = yc + h, tz = c.z, d = Math.hypot(tx - ox, ty - oy, tz - oz);
        p.balistique.balle(ox, oy, oz, (tx - ox) / d, (ty - oy) / d, (tz - oz) / d, d + 0.5, out);
        if (out.t < d - 0.02) F.push(`${c.distance} m couloir ${c.couloir} ${nom} : balle arrêtée à ${r2(out.t)} m`);
        const s = libreTout(C, ox, oy, oz, tx, ty, tz);
        if (s.t < 0.999) F.push(`${c.distance} m couloir ${c.couloir} ${nom} : forme ${s.qui} à ${r2(s.t * d)} m`);
      }
      if (!C.libre(c.x, c.z, 0.3, yc)) F.push(`cible ${c.distance} m couloir ${c.couloir} dans une forme`);
    }
    let err = null;
    try { jeu.avancer(10); await jeu.images(10); } catch (e) { err = String(e); }
    const nC = p.cibles.length;
    jeu.quitter('balade');
    return { ok: !F.length && !err && nC === 9, attendu: '9 cibles, chaque ligne libre (balle() et toutes les formes) ; 10 s sans exception',
      obtenu: F.length ? F.join(' · ') : `${nC} cibles, ${STAND.cibles.length * 2} lignes libres · ${err || '10 s sans exception'}` };
  });

  // 15. LES MUNITIONS : 0 en réserve + 1 élimination → 30 ; à 90 → 90 ; 60 éliminations d'affilée → jamais au-delà de 90
  T('15 munitions : un chargeur par élimination, plafonné', async () => {
    await jeu.lancer('equipes', { graine: 115, zone: 'ss', allies: 0, ennemis: 1, classe: 'assaut' });
    const p = game.partie; versManche(p);
    const h = p.local, b = p.acteurs.find((a) => !a.local), A = h.arsenal; figer(b);
    const tuer = () => { if (!b.vivant) b.reapparaitre(b.pos.x, b.pos.y, b.pos.z, 0, p.t); b.protegeT = 0; figer(b); p.infliger(b, 1000, { par: h.id, arme: 'fa24', zone: 'torse' }); };
    // (la réserve vidée : par le champ de l'arsenal du socle, sinon par son état)
    const vider = () => { if (Array.isArray(A.res)) { A.res[0] = 0; return true; } const e = A.etat(); if (Array.isArray(e.res)) { e.res[0] = 0; A.appliquer(e); return true; } return false; };
    if (!vider() || A.reserve !== 0) { jeu.quitter('balade'); return { ok: false, attendu: 'une réserve vidable', obtenu: 'réserve inaccessible (' + A.reserve + ')' }; }
    tuer(); const r1 = A.reserve;
    tuer(); tuer(); tuer(); const r2b = A.reserve;
    let max = 0; for (let i = 0; i < 60; i++) { tuer(); max = Math.max(max, A.reserve); }
    jeu.quitter('balade');
    const ok = r1 === 30 && r2b === 90 && max === 90;
    return { ok, attendu: '30, puis 90, jamais au-delà de 90', obtenu: `${r1} · ${r2b} · max ${max} sur 60 éliminations` };
  });

  // 16. LES ANNEAUX : libres au rayon de 1,5 m, même avec un −1 modifié (un meuble posé sur le point B indicatif)
  T('16 domination : anneaux libres, B déplacé par un meuble', async () => {
    const C = game.collisions, D = DOMINATION;
    const lire = async () => { await jeu.lancer('domination', { graine: 116, allies: 1, ennemis: 1, humain: false }); const L = game.partie.points.map((q) => ({ ...q })); jeu.quitter('balade'); return L; };
    const L0 = await lire();
    const B0 = D.points[1], f = C.ajouterBoite(B0.x - 0.6, B0.z - 0.6, B0.x + 0.6, B0.z + 0.6, { y0: B0.y, y1: B0.y + 1.1 });
    let L1;
    try { L1 = await lire(); } finally { retirerForme(C, f); }
    const libre = (q) => C.libre(q.x, q.z, D.libre, q.y);
    const ok0 = L0.length === 3 && L0.every(libre), bL = L1[1], dep = Math.hypot(bL.x - B0.x, bL.z - B0.z);
    const ok1 = L1.length === 3 && L1.every(libre) && dep > 0.5 && dep <= D.ramener.rayonMax + 0.01 && Math.abs(bL.y - B0.y) < 0.3;
    return { ok: ok0 && ok1, attendu: 'A, B, C libres à 1,5 m ; avec un meuble sur B : B déplacé (≤ 3 m), libre, au même sol',
      obtenu: L0.map((q) => `${q.id} (${r2(q.x)}, ${r2(q.z)}) écart ${q.ecart}`).join(' · ') + ` · meuble : B → (${r2(bL.x)}, ${r2(bL.z)}) à ${r2(dep)} m, libre ${libre(bL)}` };
  });

  // ---------------------------------------------------------------- À F2 (les vrais modules des autres lots : &fusion=1)
  // les apparitions de L-D (à pied, vues) : le repli de L-E ne sert presque plus
  T('F2 · apparitions réelles : jamais vues, sans repli', async () => {
    const r = await apparitionsSures({ graine: 207, zone: 'ecole', ennemis: 5, humain: false, scoreCible: 1000 });
    const ok = r.vues === 0 && r.morts <= 0.02 * r.tot && r.replis <= 0.05 * r.n;
    return { ok, attendu: '0 vue ; ≤ 2 % de morts rapides ; replis de L-E ≤ 5 % des apparitions', obtenu: `${r.n} apparitions, ${r.vues} vues, ${r.replis} replis · ${r.morts} / ${r.tot}` };
  }, { delai: 240, apresFusion: true });
  // une partie de 10 min, 4 c. 4 de bots, toute l'école, les portes de L-M
  T('F2 · 10 min 4 c. 4 sur toute l’école', async () => {
    await jeu.lancer('equipes', { graine: 208, zone: 'ecole', allies: 4, ennemis: 4, humain: false });
    const p = game.partie; let fin = null, elims = 0, err = null;
    p.sur('fin', (e) => { fin = e; }); p.sur('elim', () => elims++);
    jeu.surveiller(true);
    try { jeu.avancer(610, { vitesse: 8 }); } catch (e) { err = String(e); }
    const S = jeu.surveiller(false);
    jeu.quitter('balade');
    const ok = !err && !!fin && elims >= 10 && S.horsMonde.size === 0;
    return { ok, attendu: 'fin, ≥ 10 éliminations, 0 hors du monde, 0 exception', obtenu: `${err || 'ok'} · fin ${!!fin} · ${elims} élim. · hors monde ${S.horsMonde.size}` };
  }, { delai: 240, apresFusion: true });
  // 100 duels FA-24 contre FA-24 à 15 m, deux bots Réguliers symétriques : le plus petit id n'a aucun avantage
  T('F2 · 100 duels symétriques : aucun avantage au plus petit id', async () => {
    let g0 = 0, g1 = 0, deux = 0;
    for (let k = 0; k < 100; k++) {
      await jeu.lancer('equipes', { graine: 3000 + k, zone: 'ecole', allies: 1, ennemis: 1, humain: false, difficulte: 'regulier' });
      const p = game.partie; versManche(p);
      const [a, b] = p.acteurs;
      for (const x of [a, b]) x.arsenal = new Arsenal(x, CLASSES.assaut);
      jeu.teleporter(a.id, -2.7, -0.12, 3.75, -Math.PI / 2); jeu.teleporter(b.id, 12.3, -0.12, 3.75, Math.PI / 2);
      pasJusqua(p, () => !a.vivant || !b.vivant, 120 * 20);
      if (!a.vivant && !b.vivant) { g0++; g1++; deux++; } else if (!b.vivant) g0++; else if (!a.vivant) g1++;
      jeu.quitter('balade');
    }
    return { ok: g0 >= 30 && g1 >= 30, attendu: 'chacun ≥ 30 victoires (les morts simultanées comptent pour les deux)', obtenu: `id ${0} : ${g0} · id 1 : ${g1} · ${deux} simultanées` };
  }, { delai: 240, apresFusion: true });
}
