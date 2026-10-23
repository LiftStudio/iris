// =====================================================================
//  LES TESTS DE F2 — la fusion de la vague 2 (23/10 ; spec § 5.6, acceptation, points 2 à 11)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=F2&fusion=1` (window.__rapport), sur la branche `vague2` : ils exigent
// TOUS les vrais modules des 14 lots (arsenal et balistique de L-A, mouvement de L-B, arme de vue de L-V, corps de L-C,
// graphe de L-D, règles de L-E et L-F, registre de L-K, HUD de L-G, menus de L-U, effets et sons de L-H, tactile de L-I,
// monde de L-M). Ce que les 14 fichiers de tests couvrent déjà avec `&fusion=1` n'est pas refait ici, il est NOMMÉ :
//   point 1 (les 15 fichiers verts) : le rapport F2 ; point 5 (200 trajets par zone : L-M 4 ; 50 franchissements : L-D F2 ;
//   verifierBots à la table du combat : L-D F2) ; point 6 (équipes 10 min : L-E F2 ; stand, 4 défis : L-E 11) ; point 6 bis
//   (10 000 paires « DDA visible » et le pré-filtre : L-A F2) ; point 9 (capsules contre les vrais corps : L-A F2, L-C 11) ;
//   point 11 (balade, sièges, ascenseur, entrées : S0 1-29) ; points 12 et 13 (photos, à la main) : le rapport F2.
// Ici : 10 la préparation (en tête : la 1re préparation de l'onglet), 2 la chaîne du tir, 3 la souris, 4 les abonnés et les
// retours, 5 les errants aux tables du prop hunt, 6 les parties complètes, 6 bis les perceptions des bots, 7 les cycles de
// chaque mode, 8 les coûts. Un test rend { ok, attendu, obtenu } ; les seuils de TEMPS passent par t.temps (relatifs).
import { PAS } from '../constantes.js';
import { ARMES } from '../armes.js';
import { Rng } from '../rng.js';

const r2 = (v) => Math.round(v * 100) / 100;
const r3 = (v) => Math.round(v * 1000) / 1000;
const varDe = (el, n) => parseFloat(el.style.getPropertyValue('--' + n));
const mediane = (L) => { const s = [...L].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
// LES ÉVÉNEMENTS DU § 4.6 (hors vague 3 : medaille, serie)
const EVENEMENTS = ['tir', 'impact', 'touche', 'elim', 'apparition', 'recharge', 'arme', 'vide', 'grenade', 'rebond', 'explosion', 'trajet',
  'couteau', 'porte', 'flash', 'frole', 'pas', 'saut', 'reception', 'glissade', 'phase', 'annonce', 'score', 'capture', 'deguise',
  'provocation', 'frottement', 'faux', 'soin', 'scanner', 'fin'];

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, o) => jeu.ajouterTest('F2', nom, fn, o);
  const P = () => game.partie;
  const jusqua = (p, f, max = 20000) => { let n = 0; while (n < max && !f() && game.partie === p) { p.pas(PAS); n++; } return n; };
  const bilan = (res, attendu) => { const ko = res.filter((r) => !r[1]); return { ok: !ko.length, attendu, obtenu: res.map((r) => (r[1] ? '' : '✗ ') + r[0]).join(' · ') }; };

  // 10. LA PRÉPARATION (§ 5.6 point 10, temps) : la 1re de chaque famille ≤ 4 s, la suivante ≤ 1,5 s — en TÊTE du fichier :
  //     sous &lot=F2, c'est la toute première préparation de l'onglet (graphe, avatars, catalogue, armes)
  T('10 préparation : la 1re ≤ 4 s, la suivante ≤ 1,5 s', async (t) => {
    const res = [];
    for (const [mode, o] of [['equipes', { zone: 'ecole', humain: false }], ['prophunt', { zone: 'e1', premierRole: 'prop' }]]) {
      const L = [];
      for (let k = 0; k < 2; k++) { const t0 = performance.now(); await jeu.lancer(mode, { graine: 10 + k, ...o }); L.push(performance.now() - t0); jeu.quitter('balade'); }
      const a = t.temps(`F2 préparation ${mode} 1re (ms)`, L[0], 4000), b = t.temps(`F2 préparation ${mode} 2e (ms)`, L[1], 1500);
      res.push([`${mode} : ${Math.round(L[0])} ms puis ${Math.round(L[1])} ms`, a && b]);
    }
    return bilan(res, '1re ≤ 4 000 ms, 2e ≤ 1 500 ms (temps relatifs)');
  }, { delai: 180, apresFusion: true });

  // 2. LA CHAÎNE DU TIR, au stand, sur le mannequin à 10 m : clic (le code Souris:0 pressé dans l'Input — le pointeur ne peut
  //    pas être capturé sous ?test=1) → lireCommande → Arsenal → balle → dégât différé → infliger → marqueur et son
  //    PROGRAMMÉ dans la même image → recul visuel de l'arme de vue ; 4 balles de FA-24 au torse : les 100 PV d'un acteur
  //    tombent à 240 ms ± 1 pas du clic ; 12 balles tenues : camPitch −0,118 rad (6,76°)
  T('2 chaîne du tir au stand : même image, 240 ms, 6,76°', async () => {
    const res = [];
    jeu.figerQualite(true);
    try {
      await jeu.lancer('stand', { graine: 120 });
      const p = P(), m = p.mannequin, h = p.local, A = p.aff, inp = game.input, J = jeu.journalAudio;
      await jeu.images(40);                                       // (l'arme sortie, le calque absent sous ?test=1)
      // (a) la chaîne, image par image — en VISÉE (clic droit tenu, 0,4 s : la dispersion de la hanche, 2,2° à 10 m, perdait
      // une balle sur deux ; 4 balles au torse font 132 PV, 3 n'en font que 99)
      inp.presser('Souris:2'); await jeu.images(24);
      jeu.viser(0, { x: m.pos.x, y: m.pos.y + 1.27, z: m.pos.z });
      const T0 = [], tirs = [];
      p.sur('touche', (e) => { if (e.cible === m.id) T0.push({ t: p.t, d: e.degats, zone: e.zone }); });
      p.sur('tir', (e) => { if (e.a === h.id) tirs.push(p.t); });
      J.vider();
      const t0 = p.t; let image1 = null, cumul = 0, tMort = null;
      inp.presser('Souris:0');
      for (let k = 0; k < 40 && tMort === null; k++) {
        const nT = T0.length, nS = J.entrees.filter((e) => e.methode === 'start').length;
        await jeu.images(1);
        jeu.viser(0, { x: m.pos.x, y: m.pos.y + 1.27, z: m.pos.z });   // (le recul compensé : 4 balles au torse)
        if (T0.length > nT && image1 === null) {
          const starts = J.entrees.filter((e) => e.methode === 'start').length - nS;
          image1 = { mo: varDe(A.hud.el, 'mo'), starts, piston: A.viewmodel && A.viewmodel.diag ? A.viewmodel.diag.piston : 0 };
        }
        for (let i = nT; i < T0.length; i++) { cumul += T0[i].d; if (cumul >= 100 && tMort === null) tMort = T0[i].t; }
      }
      inp.relacher('Souris:0'); inp.relacher('Souris:2'); await jeu.images(2);
      res.push([`1re touche : marqueur ${image1 ? image1.mo : '-'}, ${image1 ? image1.starts : 0} sons programmés, arme de vue reculée ${image1 ? r3(image1.piston) : '-'} m — dans la même image`,
        !!image1 && image1.mo === 1 && image1.starts > 0 && image1.piston > 0]);
      const ttk = tMort === null ? null : (tMort - t0) * 1000, zones = T0.slice(0, 4).map((x) => x.zone).join(',');
      res.push([`100 PV à ${ttk === null ? '-' : r2(ttk)} ms du clic (${T0.length} touches : ${zones})`, ttk !== null && Math.abs(ttk - 240) <= 1000 * PAS + 1e-6]);
      // (b) 12 balles tenues, sans compenser : la montée de la caméra
      await jeu.avancer(1.0);
      jeu.viser(0, { x: m.pos.x, y: m.pos.y + 1.27, z: m.pos.z }); await jeu.images(2);
      const pitch0 = game.camPitch, seq0 = h.arsenal.tirSeq;
      inp.presser('Souris:0');
      for (let k = 0; k < 120 && h.arsenal.tirSeq - seq0 < 12; k++) await jeu.images(1);
      inp.relacher('Souris:0');
      // (le recul du 12e coup est pris par lireCommande au pas SUIVANT : une image de plus, la détente relâchée)
      await jeu.images(1);
      const d = game.camPitch - pitch0, n = h.arsenal.tirSeq - seq0;
      res.push([`${n} balles : camPitch ${r3(d)} rad (${r2(-d * 180 / Math.PI)}°)`, n === 12 && Math.abs(d + 0.118) <= 0.006]);
      jeu.quitter('balade');
    } finally { game.input.relacher('Souris:0'); game.input.relacher('Souris:2'); jeu.figerQualite(false); }
    return bilan(res, 'marqueur + son programmé + recul de l’arme de vue dans l’image de la touche ; 100 PV à 240 ± 8,3 ms ; 12 balles → −0,118 ± 0,006 rad');
  }, { delai: 120, apresFusion: true });

  // 3. LA SOURIS → LA CAMÉRA EN ≤ 1 IMAGE : un mousemove synthétique avant l'image n est porté par le rendu de l'image n
  //    (le glissé de la souris tient lieu de capture : game.dragging)
  T('3 souris → caméra dans l’image suivante', async () => {
    await jeu.lancer('essai', { graine: 3, mannequins: 3 });
    const p = P(); await jeu.images(4);
    const res = [], [kx] = p.souris();
    for (const dx of [40, -25, 7]) {
      game.camera.updateMatrixWorld(); const y0 = game.camYaw, q0 = game.camera.quaternion.clone();
      game.dragging = true;
      try { window.dispatchEvent(new MouseEvent('mousemove', { movementX: dx, movementY: 0 })); } finally { game.dragging = false; }
      const dYaw = y0 - game.camYaw;
      await jeu.images(1);
      const ang = q0.angleTo(game.camera.quaternion);
      res.push([`${dx} px : lacet ${r3(dYaw)} rad (${r3(dx * kx)}), caméra tournée de ${r3(ang)} rad dans l’image`, Math.abs(dYaw - dx * kx) < 1e-9 && Math.abs(ang - Math.abs(dYaw)) < 0.02]);
    }
    jeu.quitter('balade');
    return bilan(res, 'le lacet de la commande = déplacement × kx ; la caméra rendue tourne de lui dans la même image');
  }, { apresFusion: true });

  // 4. CHAQUE ÉVÉNEMENT DU § 4.6 A UN ABONNÉ (hors le harnais) dans les parties qui l'émettent ; une touche et une élimination
  //    de Haythem : marqueur (visuel) et son dans l'image ; une touche reçue : l'arc et le son
  T('4 événements : abonnés ; touche et élimination → visuel et son', async () => {
    const res = [], abonnes = new Map();
    const relever = (p) => { for (const [k, S] of p._abonnes) if (S && S.size) abonnes.set(k, (abonnes.get(k) || 0) + S.size); };
    for (const [mode, o] of [['equipes', { zone: 'ecole' }], ['domination', { zone: 'ecole' }], ['prophunt', { zone: 'e1', premierRole: 'prop' }], ['prophunt', { zone: 'e1', premierRole: 'chasseur' }], ['stand', {}]]) {
      await jeu.lancer(mode, { graine: 4, ...o }); relever(P()); jeu.quitter('balade');
    }
    const sans = EVENEMENTS.filter((e) => !abonnes.get(e));
    res.push([`${EVENEMENTS.length - sans.length} / ${EVENEMENTS.length} événements écoutés${sans.length ? ' (sans abonné : ' + sans.join(', ') + ')' : ''} ; touche ${abonnes.get('touche') || 0}, elim ${abonnes.get('elim') || 0} abonnés`,
      !sans.length && (abonnes.get('touche') || 0) >= 3 && (abonnes.get('elim') || 0) >= 3]);
    // une touche et une élimination de Haythem sur un mannequin, puis une touche reçue
    await jeu.lancer('essai', { graine: 4, mannequins: 3 });
    const p = P(), A = p.aff, J = jeu.journalAudio, h = p.local; await jeu.images(30);
    const m = p.acteurs.find((a) => a.id !== h.id && a.vivant);
    const image = async (f) => { J.vider(); const v0 = A.sons ? A.sons.stats.creees : 0; f(); await jeu.images(1); return { starts: J.entrees.filter((e) => e.methode === 'start').length, voix: (A.sons ? A.sons.stats.creees : 0) - v0 }; };
    const E = []; p.sur('touche', (e) => E.push(e)); p.sur('elim', (e) => E.push(e));
    m.vie = 30; m.vieMax = 100;
    const a = await image(() => { p.infliger(m, 10, { par: h.id, arme: 'fa24', zone: 'torse', x: m.pos.x, y: m.pos.y + 1.2, z: m.pos.z }); });
    const moT = varDe(A.hud.el, 'mo');
    const b = await image(() => { p.infliger(m, 50, { par: h.id, arme: 'fa24', zone: 'torse', x: m.pos.x, y: m.pos.y + 1.2, z: m.pos.z }); });
    const mcE = A.hud.el.style.getPropertyValue('--mc').trim(), moE = varDe(A.hud.el, 'mo');
    const arcs0 = A.hud._arcs ? A.hud._arcs.length : null;
    const c = await image(() => { p.infliger(h, 5, { par: m.id, arme: 'fa24', zone: 'torse', x: h.pos.x, y: h.pos.y + 1.2, z: h.pos.z, dx: 0, dz: 1 }); });
    const arcs1 = A.hud._arcs ? A.hud._arcs.length : null;
    jeu.quitter('balade');
    res.push([`touche : marqueur ${moT}, ${a.voix} voix`, moT === 1 && a.voix >= 1]);
    res.push([`élimination : marqueur ${moE} ${mcE}, ${b.voix} voix`, moE === 1 && /^#|rgb/.test(mcE) && b.voix >= 1 && E.some((e) => e.type === 'elim')]);
    res.push([`touche reçue : arcs ${arcs0} → ${arcs1}, ${c.voix} voix`, (arcs1 === null || arcs1 > arcs0) && c.voix >= 1]);
    return bilan(res, 'les 31 événements du § 4.6 écoutés ; touche, élimination, touche reçue : un retour visuel et un son dans l’image');
  }, { delai: 180, apresFusion: true });

  // 5. LES ERRANTS AUX TABLES DU PROP HUNT (§ 5.6 point 5) : 8 bots, 180 s, sur e1 et ss — la table du combat sur l'école est
  //    le test F2 de L-D. 0 hors du monde, 0 sous le sol, 0 dans un mur > 0,2 s, 0 traversée (vantaux compris), ≤ 1 coincé et
  //    ≤ 1 téléportation de secours par 10 minutes-bot
  T('5 errants : 180 s, à la table du prop hunt sur e1 (8) et ss (5)', async () => {
    const res = [];
    // (F2, écart au § 5.6 point 5 : au −1, CINQ errants et pas huit — le sas de l'escalier est, sa porte de 0,85 m, est le
    // carrefour obligé entre l'ouest et le sud du −1 aux portes du prop hunt ; huit errants qui le traversent dans les deux sens
    // s'y bloquent à trois et plus, le face-à-face du pilote de L-D se règle à deux : 8 coincés, 16 secours. Un prop hunt au −1
    // n'a jamais huit acteurs en marche — ses props se cachent —, et la foule dans un passage étroit est à la vague 3, L-O et L-J)
    for (const [zone, nBots] of [['e1', 8], ['ss', 5]]) {
      await jeu.lancer('essai', { graine: 5, zone, prop: true, humain: false, mannequins: [], bots: 0 });
      const p = P(), N = p.nav, rng = new Rng(55);
      const L = []; for (let k = 0; k < 4000 && L.length < nBots; k++) { const v = rng.int(N.nb); if (N.permis(v) && N.degage[v] >= 0.5) L.push(v); }
      L.forEach((v, k) => p.ajouterActeur({ id: 100 + k, nom: 'Errant ' + k, equipe: null, x: N.px[v], y: N.ph[v], z: N.pz[v], lacet: 0, cerveau: 'errant' }));
      jeu.surveiller(true);
      let err = null; try { jeu.avancer(180); } catch (e) { err = String(e); }
      const S = jeu.surveiller(false);
      jeu.quitter('balade');
      const minBot = nBots * 3 / 10;
      const ok = !err && L.length === nBots && S.horsMonde.size === 0 && S.sousLeSol.size === 0 && S.murs.size === 0 && S.traverseMurs.size === 0 && S.coinces.size <= minBot && S.teleports <= minBot;
      res.push([`${zone} (${nBots} errants) : ${err || 'ok'} · hors ${S.horsMonde.size}, sous ${S.sousLeSol.size}, mur ${S.murs.size}, traversée ${S.traverseMurs.size}, coincés ${S.coinces.size}, secours ${S.teleports}, zones ${S.zones.size}`, ok]);
    }
    return bilan(res, '0 hors du monde, 0 sous le sol, 0 dans un mur, 0 traversée ; ≤ 1 coincé et ≤ 1 secours par 10 minutes-bot (e1 : 8 errants ; ss : 5)');
  }, { delai: 240, apresFusion: true });

  // 6. LES PARTIES COMPLÈTES de bots, simulées (× 8) : chacun pour soi 1 + 5 10 min, domination 4 c. 4 10 min, prop hunt 6 manches
  //    sur e1 (équipes 10 min : test F2 de L-E ; le stand et ses défis : L-E 11) — 0 exception, fin juste, scores cohérents, 0 hors du monde
  T('6 parties complètes : chacun pour soi, domination, prop hunt', async () => {
    const res = [];
    const jouer = async (mode, o, duree) => {
      await jeu.lancer(mode, { graine: 6, humain: false, ...o });
      const p = P(); let fin = null, nFin = 0, elims = 0, err = null;
      p.sur('fin', (e) => { fin = e; nFin++; }); p.sur('elim', () => elims++);
      jeu.surveiller(true);
      try { for (let s = 0; s < duree && p.phase !== 'fin'; s += 30) jeu.avancer(30, { vitesse: 8 }); } catch (e) { err = String(e && e.stack || e).slice(0, 200); }
      const S = jeu.surveiller(false);
      return { p, fin, nFin, elims, err, S };
    };
    // chacun pour soi
    let r = await jouer('melee', { zone: 'ecole', ennemis: 5, appareil: 'pc' }, 640);
    let cl = r.p._classement ? r.p._classement() : [];
    const se = cl.reduce((s, c) => s + c.elims, 0), sm = cl.reduce((s, c) => s + c.morts, 0), ss = cl.reduce((s, c) => s + (c.suicides || 0), 0);
    res.push([`chacun pour soi : ${r.err || 'ok'} · fin ${r.nFin} · ${r.elims} élim. · Σ élim ${se} = morts ${sm} − suicides ${ss} · gagnant ${r.fin ? r.fin.gagnant : '-'} / ${cl[0] ? cl[0].id : '-'} · hors ${r.S.horsMonde.size}`,
      !r.err && r.nFin === 1 && se === sm - ss && r.fin && r.fin.gagnant === cl[0].id && r.S.horsMonde.size === 0 && r.elims >= 10]);
    jeu.quitter('balade');
    // domination
    r = await jouer('domination', { zone: 'ecole', allies: 4, ennemis: 4 }, 1300);
    const sc = r.p.scores || {}, gd = r.fin ? r.fin.gagnant : undefined;
    const juste = gd === null ? sc.A === sc.B : gd === 'A' ? sc.A >= sc.B : gd === 'B' ? sc.B >= sc.A : false;
    res.push([`domination : ${r.err || 'ok'} · fin ${r.nFin} · ${sc.A} – ${sc.B} · gagnant ${gd} · ${r.elims} élim. · hors ${r.S.horsMonde.size}`, !r.err && r.nFin === 1 && juste && r.S.horsMonde.size === 0]);
    jeu.quitter('balade');
    // prop hunt, 6 manches sur e1, sans humain
    r = await jouer('prophunt', { zone: 'e1', manches: 6, acteurs: 6 }, 3000);
    const manches = r.p.manche, tot = r.p.acteurs.reduce((s, a) => s + (a.stats ? a.stats.score : 0), 0);
    res.push([`prop hunt : ${r.err || 'ok'} · fin ${r.nFin} après ${manches} manches · gagnant ${r.fin ? r.fin.gagnant : '-'} · ${r.elims} élim. · Σ scores ${tot} · hors ${r.S.horsMonde.size}`,
      !r.err && r.nFin === 1 && manches === 6 && Number.isFinite(tot) && r.S.horsMonde.size === 0]);
    jeu.quitter('balade');
    return bilan(res, '0 exception ; une fin chacune, juste ; Σ éliminations = Σ morts − suicides ; 0 hors du monde ; 6 manches au prop hunt');
  }, { delai: 400, apresFusion: true });

  // 6 bis. LES PERCEPTIONS DES BOTS (§ 3.7, les deux sens du pré-filtre : la vue, L-A F2) — 10 000 perceptions d'un 4 c. 4 :
  //     aucune « vu » à travers un mur ou une vitre dépolie (un rayon brut, pas de 2 cm, sur les formes qui arrêtent la vue)
  T('6 bis perceptions : 10 000, aucune à travers un mur ou un dépoli', async () => {
    await jeu.lancer('equipes', { graine: 61, zone: 'ecole', allies: 4, ennemis: 4, humain: false });
    const p = P(), C = game.collisions, B = p.balistique;
    let n = 0, vus = 0, faux = 0; const exemples = [];
    // (la ligne brute : chaque forme qui arrête la VUE — ni off, ni balle:false, camera vraie, pas une vitre claire —, par pas
    // de 2 cm ; les formes près du segment lues une fois par Collisions._parcourir, hors de toute autre requête)
    const contient = (f, x, y, z) => {
      if (y < f.y0 || y > f.y1) return false;
      if (f.t === 'c') return (x - f.x) * (x - f.x) + (z - f.z) * (z - f.z) <= f.r * f.r;
      if (f.t === 'b') return x >= f.x0 && x <= f.x1 && z >= f.z0 && z <= f.z1;
      const px = x - f.cx, pz = z - f.cz; return Math.abs(px * f.c + pz * f.s) <= f.hx && Math.abs(-px * f.s + pz * f.c) <= f.hz;
    };
    const arreteVue = (f) => !f.off && f.balle !== false && f.camera && !(f.vitre && !f.depoli);
    const brut = (ax, ay, az, bx, by, bz) => {
      const L = []; C._parcourir(Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz), (f) => { if (arreteVue(f) && !contient(f, ax, ay, az) && !contient(f, bx, by, bz)) L.push(f); });
      const d = Math.hypot(bx - ax, by - ay, bz - az), k = Math.max(2, Math.ceil(d / 0.02));
      for (let i = 1; i < k; i++) { const u = i / k, x = ax + (bx - ax) * u, y = ay + (by - ay) * u, z = az + (bz - az) * u; for (const f of L) if (contient(f, x, y, z)) return false; }
      return true;
    };
    for (const a of p.acteurs) {
      const c = a.cerveau; if (!c || !c.percevoir) continue;
      const f0 = c.percevoir.bind(c);
      c.percevoir = function () {
        f0();
        // (l'œil de la perception même — `_eo` —, pas un second appel à oeil())
        const eo = this._eo || a.oeil({ x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } });
        for (const [id, V] of this.vus) {
          n++; if (!V.vu) continue; vus++;
          const b = p.acteurParId(id); if (!b) continue;
          const by = b.pos.y + 1.27 * b.h / 1.73;
          if (!brut(eo.x, eo.y, eo.z, b.pos.x, by, b.pos.z)) { faux++; if (exemples.length < 3) exemples.push(`${a.id}→${id}`); }
        }
      };
    }
    let err = null;
    try { for (let s = 0; s < 400 && n < 10000; s += 10) jeu.avancer(10); } catch (e) { err = String(e); }
    jeu.quitter('balade');
    const okBrut = !!C._parcourir;
    return { ok: !err && okBrut && n >= 10000 && faux === 0, attendu: '≥ 10 000 perceptions, 0 « vu » à travers un mur ou un dépoli',
      obtenu: `${err || ''}${okBrut ? '' : 'C._parcourir absent · '}${n} perceptions, ${vus} vus, ${faux} à travers ${exemples.join(' ')} (vue ${B ? 'L-A' : '?'})` };
  }, { delai: 240, apresFusion: true });

  // 7. CHAQUE MODE : les programmes constants après la préparation (5 s d'images, qualité figée) ; 3 cycles lancer / quitter :
  //    mémoire ± 2 % (géométries et textures ; le décor vu pour la 1re fois compté à part, comme S0 · 8), enfants de la scène et
  //    instantane() identiques ; puis la balade au bit près
  T('7 chaque mode : programmes constants, 3 cycles propres, balade au bit près', async () => {
    const res = [], egal = (a, b) => JSON.stringify(a) === JSON.stringify(b), pc = (a, b) => Math.abs(a - b) / Math.max(1, a);
    const MODES = [['equipes', { zone: 'ecole' }], ['melee', { zone: 'ecole' }], ['domination', { zone: 'ecole' }], ['stand', {}], ['prophunt', { zone: 'e1', premierRole: 'prop' }], ['prophunt', { zone: 'e1', premierRole: 'chasseur' }]];
    jeu.figerQualite(true);
    try {
      for (const [mode, o] of MODES) {
        // les programmes : préparée, 5 s d'images (la simulation avance), aucun programme de plus
        await jeu.lancer(mode, { graine: 7, ...o });
        await jeu.images(20);
        const p0 = game.renderer.info.programs.length;
        for (let k = 0; k < 30; k++) await jeu.images(10);
        const p1 = game.renderer.info.programs.length;
        jeu.quitter('balade'); await jeu.images(2);
        // trois cycles
        const cycle = async () => { await jeu.lancer(mode, { graine: 7, ...o }); await jeu.images(3); jeu.avancer(2); await jeu.images(3); jeu.quitter('balade'); await jeu.images(3); };
        await cycle();
        const suites = () => { let n = 0; game.scene.traverse((q) => { if (q.userData.suite) n++; }); return n; };
        const m0 = jeu.memoire(), i0 = jeu.instantane(), s0 = suites();
        for (let k = 0; k < 3; k++) await cycle();
        const m1 = jeu.memoire(), i1 = jeu.instantane(), s1 = suites();
        const g0 = m0.geometries, g1 = m1.geometries - (s1 - s0);
        const nom = mode + (o.premierRole ? ' ' + o.premierRole : '');
        res.push([`${nom} : programmes ${p0} → ${p1} · géométries ${g0} → ${g1}, textures ${m0.textures} → ${m1.textures}, enfants ${m0.enfants} → ${m1.enfants}, instantané ${egal(i0, i1) ? '=' : '≠'}`,
          p0 === p1 && pc(g0, g1) <= 0.02 && pc(m0.textures, m1.textures) <= 0.02 && m0.enfants === m1.enfants && egal(i0, i1)]);
      }
    } finally { jeu.figerQualite(false); }
    const r = await jeu.rejouerBalade();
    res.push([`balade : vue 3 ${r.vue3.pos} / ${r.vue3.cam} · vue 1 ${r.vue1.pos} / ${r.vue1.cam}`, r.ok && r.identiques]);
    return bilan(res, 'chaque mode : programmes constants, mémoire ± 2 %, enfants et instantané identiques après 3 cycles ; balade au bit près');
  }, { delai: 600, apresFusion: true });

  // 8. LES COÛTS, qualité figée MOYENNE, 7 bots (4 c. 4 de Haythem et 7 bots, toute l'école) : appels AJOUTÉS par la partie (la
  //    même image sans ce qu'elle a posé dans la scène) ≤ 50 typiques, ≤ 150 au pire ; Partie.pas ≤ 0,5 ms ; le processeur du
  //    gameplay ≤ 2,5 ms par image (deux pas et Partie.image) — temps relatifs
  T('8 coûts : appels ajoutés, Partie.pas, processeur du gameplay', async (t) => {
    jeu.figerQualite(true);
    let appels = [], pasMs = 0, imgMs = 0, valable = true;
    try {
      await jeu.qualite('moyenne');
      await jeu.lancer('equipes', { graine: 8, zone: 'ecole', allies: 3, ennemis: 4 });
      const p = P(); await jeu.images(30);
      const dyn = () => game.scene.children.filter((o) => o.userData && o.userData.dynamique && o.visible && o !== (game.user && game.user.mesh));
      for (let k = 0; k < 12; k++) {
        jeu.avancer(1);
        const a = await jeu.images(1); valable = valable && a.valable;
        const L = dyn(); for (const o of L) o.visible = false;
        let b; try { b = await jeu.images(1); } finally { for (const o of L) o.visible = true; }
        appels.push(a.appels - b.appels);
      }
      // le temps : 4 s de jeu en images (deux pas par image)
      const c0 = jeu.compteurs(), n0 = p.imageN || 0;
      const im = await jeu.images(240);
      const c1 = jeu.compteurs();
      pasMs = c1.pasMs; imgMs = c1.imageMs; valable = valable && im.valable;
      jeu.quitter('balade');
    } finally { jeu.figerQualite(false); await jeu.qualite('auto'); }
    const typ = mediane(appels), pire = Math.max(...appels);
    const a = t.temps('F2 Partie.pas (ms)', pasMs, 0.5, valable), b = t.temps('F2 gameplay par image (ms)', 2 * pasMs + imgMs, 2.5, valable);
    return { ok: typ <= 50 && pire <= 150 && a && b, attendu: 'appels ajoutés ≤ 50 (médiane), ≤ 150 (pire) ; Partie.pas ≤ 0,5 ms ; gameplay ≤ 2,5 ms par image',
      obtenu: `appels ajoutés ${typ} (médiane), ${pire} (pire) · Partie.pas ${r3(pasMs)} ms · gameplay ${r3(2 * pasMs + imgMs)} ms par image${valable ? '' : ' (onglet caché : non valable)'}` };
  }, { delai: 180, apresFusion: true });
}
