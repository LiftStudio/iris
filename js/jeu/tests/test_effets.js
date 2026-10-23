// =====================================================================
//  LES TESTS DU LOT L-H — EFFETS ET SONS (23/10 ; spec § 5.5.12, critères 1 à 14, et « À F2 »)
// =====================================================================
// Importés à la demande sous ?test=1 (`&rapport=1&lot=L-H`). Les effets et les sons se nourrissent d'ÉVÉNEMENTS : les
// tests en émettent de VRAIS dans une partie d'essai (`partie.evt` : un tir d'un mannequin, son impact sur une forme du
// monde solide choisie, une explosion…) et en laissent faire aux bots et à Haythem (commande forcée). Le son se lit dans
// ce qui est PROGRAMMÉ (`journalAudio`, et les valeurs posées par `.value` sur les paramètres des voix), jamais le temps
// écoulé ni `onended` (l'OfflineAudioContext de ?test=1 n'avance pas) ; le côté gauche / droit se juge en RENDANT la voix
// dans un petit OfflineAudioContext à part, avec l'auditeur et le panoramique de la partie.
import * as THREE from 'three';
import { REGLAGES_EFFETS, decalquable } from '../effets.js';
import { REGLAGES_SONS, RECETTES_TIR } from '../sons_jeu.js';
import { SPATIAL } from '../../audio.js';
import { EQUIPES, PAS } from '../constantes.js';
import { settings } from '../../settings.js';
import { MEUBLES } from '../../registre_meubles.js';

const DEG = Math.PI / 180;
const r2 = (x) => Math.round(x * 100) / 100, r3 = (x) => Math.round(x * 1000) / 1000;
const bilan = (res, attendu) => {
  const ko = res.filter((x) => !x[1]).map((x) => x[0]);
  return { ok: ko.length === 0, attendu, obtenu: ko.length ? 'faux : ' + ko.join(' | ') : res.map((x) => x[0]).join(' · ') };
};
// une voix de test : un sinus de `d` s
// l'espion des DÉPARTS de toutes les sources : le journal du harnais n'enveloppe que AudioScheduledSourceNode.start, que
// AudioBufferSourceNode.prototype.start masque (les bruits, les sons de la banque) — demande à F2 au rapport
function espionDeparts() {
  const L = [], P = [AudioScheduledSourceNode.prototype, AudioBufferSourceNode.prototype].map((o) => [o, Object.getOwnPropertyDescriptor(o, 'start')]).filter((x) => x[1]);
  for (const [o, d] of P) Object.defineProperty(o, 'start', { ...d, value: function (q = 0, ...r) { L.push(q); return d.value.call(this, q, ...r); } });
  return { L, rendre() { for (const [o, d] of P) Object.defineProperty(o, 'start', d); } };
}
const SINUS = (d = 0.3, f = 440) => (ctx, out, q) => { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(out); o.start(q); o.stop(q + d); return d; };
// LE COMPTE DES SONS DE LA BALADE (critère 9) : 5 s de course de Haythem, du départ vers la salle d'attente puis vers le
// hall ouest et retour, les `start` programmés comptés — le MÊME script, collé dans la console d'un arbre `a8b22dd`
// (sans harnais), y donne `PAS_A8B22DD` (rapport L-H, « Mesures »)
export function compterSonsBalade(game, espion) {
  const u = game.user, inp = game.input;
  const code = (id) => (inp.bind[id] || []).find((c) => c && !c.startsWith('Tactile:'));
  const tenir = (id, oui) => { const c = code(id); if (oui) inp.downSet.add(c); else inp.downSet.delete(c); };
  const D = espion ? espionDeparts() : null;
  const buts = [{ x: 9.6, z: -6.755 }, { x: 6.2, z: -3.2 }, { x: 12.2, z: -2.2 }];
  try {
    game.placerAuDepart(); u.stamina = 100;
    let b = 0;
    tenir('forward', true);
    for (let i = 0; i < 600; i++) {
      const c = buts[b % buts.length];
      if (Math.hypot(c.x - u.pos.x, c.z - u.pos.z) < 0.8) b++;
      game.camYaw = Math.atan2(-(c.x - u.pos.x), -(c.z - u.pos.z));
      game.update(1 / 120);
      if (i % 2) { game.carte.maj(1 / 60, game); game.updateCamera(1 / 60); game.audio.setListener(game.camera.position, game.camera); }
    }
  } finally { tenir('forward', false); if (D) D.rendre(); }
  game.placerAuDepart();
  return D ? D.L.length : 0;
}
// (la mesure sur a8b22dd, 23/10 : l'archive servie à côté, le même script collé dans la console après « APPUIE » — 26,
// 26 et 23 départs sur trois passes, la médiane 26 ; le seuil : ± 10 %)
export const PAS_A8B22DD = 26;

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-H', nom, fn, opts);
  const C = () => game.collisions;
  const tel = () => !!(window.__chargement && window.__chargement.telephone);
  const habillage = (h) => { const j = game.settings.data.jeu; const avant = j.habillage; j.habillage = h; return avant; };
  // une partie d'essai et ses modules d'affichage
  const essai = async (o = {}) => {
    await jeu.lancer('essai', { graine: 5, mannequins: 3, bots: 0, ...o });
    await jeu.images(2);
    const p = game.partie;
    return { p, E: p.aff.effets, S: p.aff.sons };
  };
  // l'image de l'affichage à la main (sans simuler) : la caméra, puis Partie.image (effets, sons) — rien ne bouge
  const image = (p, dt = 1 / 60) => { game.updateCamera(dt); game.audio.setListener(game.camera.position, game.camera); p.image(dt); };
  // les formes du monde solide, choisies à moins de `d` m de la caméra
  const proche = (f, d = 35) => { const c = game.camera.position, x = f.t === 'b' ? (f.x0 + f.x1) / 2 : f.t === 'o' ? f.cx : f.x, z = f.t === 'b' ? (f.z0 + f.z1) / 2 : f.t === 'o' ? f.cz : f.z; return Math.hypot(x - c.x, z - c.z) < d; };
  const formes = () => {
    const L = C().formes, c = game.camera.position;
    const yc = c.y - 1.6;
    const etage = (f) => f.y0 < yc + 2.5 && f.y1 > yc + 0.5;
    return {
      mur: L.find((f) => f.t === 'b' && !f.off && f.joueur !== false && !f.vitre && !f.mobile && !f.vantail && f.y1 - f.y0 > 2.2 && f.y1 - f.y0 < 6 && etage(f) && proche(f)
        && Math.max(f.x1 - f.x0, f.z1 - f.z0) > 1.5),
      plafond: L.find((f) => f.t === 'b' && !f.off && f.joueur === false && !f.vitre && f.y0 > yc + 2 && f.y0 < yc + 4.5 && proche(f, 25)),
      meuble: L.find((f) => f.t === 'b' && !f.off && f.joueur !== false && !f.vitre && f.y1 - f.y0 < 1.2 && f.y1 - f.y0 > 0.4 && etage(f) && proche(f)),
      vantail: L.find((f) => (f.mobile || f.vantail) && proche(f, 45)),
      vitre: L.find((f) => f.t === 'b' && f.vitre && !f.off && proche(f, 45)),
    };
  };
  // un point sur une face d'une boîte (le côté qui regarde la caméra) et sa normale ; un plafond : son dessous
  const surFace = (f, dessous = false) => {
    const c = game.camera.position;
    if (dessous) return { x: (f.x0 + f.x1) / 2, y: f.y0, z: (f.z0 + f.z1) / 2, nx: 0, ny: -1, nz: 0 };
    const y = Math.min(f.y1 - 0.2, Math.max(f.y0 + 0.2, c.y));
    const ex = f.x1 - f.x0, ez = f.z1 - f.z0;
    if (ex >= ez) { const s = c.z < (f.z0 + f.z1) / 2 ? -1 : 1; return { x: (f.x0 + f.x1) / 2, y, z: s < 0 ? f.z0 : f.z1, nx: 0, ny: 0, nz: s }; }
    const s = c.x < (f.x0 + f.x1) / 2 ? -1 : 1; return { x: s < 0 ? f.x0 : f.x1, y, z: (f.z0 + f.z1) / 2, nx: s, ny: 0, nz: 0 };
  };
  // un tir d'un acteur `a` (son œil) vers un point, et l'impact du même pas
  let seq = 1000;
  const tirVers = (p, a, q, o = {}) => {
    const e = a.oeil(new THREE.Vector3(), true), d = new THREE.Vector3(q.x - e.x, q.y - e.y, q.z - e.z).normalize();
    p.evt('tir', { a: a.id, arme: o.arme || 'fa24', ox: e.x, oy: e.y, oz: e.z, dx: d.x, dy: d.y, dz: d.z, n: 1, seq: o.seq ?? seq++ });
    if (o.impact !== false) p.evt('impact', { x: q.x, y: q.y, z: q.z, nx: q.nx ?? -d.x, ny: q.ny ?? -d.y, nz: q.nz ?? -d.z, mat: o.mat || 'mur', forme: o.forme ?? null, plomb: 0 });
  };
  const visibles = (m) => { const a = m.instanceMatrix.array; let n = 0; for (let i = 0; i < m.count; i++) { const o = i * 16; if (a[o] || a[o + 1] || a[o + 2] || a[o + 4] || a[o + 5] || a[o + 6]) n++; } return n; };
  // les appels de dessin d'un objet pendant une image rendue
  const appelsDe = (objets) => {
    const r = game.renderer, f = r.renderBufferDirect, n = new Map(objets.map((o) => [o, 0]));
    r.renderBufferDirect = function (cam, scene, geo, mat, obj, grp) { if (n.has(obj)) n.set(obj, n.get(obj) + 1); return f.call(this, cam, scene, geo, mat, obj, grp); };
    try { game.frame(1 / 60); } finally { r.renderBufferDirect = f; }
    return n;
  };
  const lumieres = () => window.__rejeuBalade.lumieres(game.scene);

  // 1. PROGRAMMES CONSTANTS pendant 10 s à 100 tirs/s, avec impacts, traceurs, douilles, éclairs, étincelles, explosions
  T('01 programmes constants : 10 s à 100 tirs/s, tous les effets', async (t) => {
    // (la qualité figée : sinon js/fx.js precompilerRepli compile en tâche de fond, toutes les 3 s, les variantes du
    // préréglage de repli des objets arrivés — les pools du jeu compris —, et le compte bouge sans que rien ne fige ;
    // et une PASSE DE CHAUFFE de 2 s d'abord, comme les cycles du test 8 du socle : à la toute première partie d'un onglet
    // frais, les corps des bots, leurs ombres, l'arme de vue… finissent de compiler — ce ne sont pas les effets)
    jeu.figerQualite(true);
    const { p, E } = await essai({ mannequins: 3, bots: 2 });
    const F = formes(), a = p.acteurParId(1), res = [];
    p.hud.points = [{ id: 'A', x: p.local.pos.x + 3, y: p.local.pos.y, z: p.local.pos.z - 3, r: 2.5, possesseur: 'A', capture: { equipe: 'B', k: 0.4 } }];
    p.hud.cibles = [{ id: 90, x: p.local.pos.x - 2, y: p.local.pos.y, z: p.local.pos.z - 4, cap: 0, k: 1, touchee: false }];
    const avant = habillage('militaire');
    const cibles = [F.mur && surFace(F.mur), F.vitre && surFace(F.vitre), F.meuble && surFace(F.meuble), F.plafond && surFace(F.plafond, true)].filter(Boolean);
    const mats = ['mur', 'vitre', 'meuble', 'plafond'];
    let tirs = 0, explosions = 0;
    // une passe : `n` images à 100 tirs/s (≈ 1,7 par image), Haythem qui tient la détente, une explosion toutes les 2 s
    // (frag, puis flash), une grenade lancée par un bot, l'habillage changé à mi-chemin
    const passe = async (n) => {
      jeu.commande(0, { tir: true }, n / 60);
      const t0 = performance.now();
      for (let k = 0; k < n && performance.now() - t0 < 30000; k++) {
        habillage(k < n / 2 ? 'militaire' : 'airsoft');
        for (let j = 0; j < (k % 3 === 2 ? 1 : 2); j++) { const i = (k * 2 + j) % cibles.length; tirVers(p, a, cibles[i], { mat: mats[i], forme: null, arme: ['fa24', 'pm9', 'fp12', 'tp50', 'p17'][k % 5] }); tirs++; }
        if (k % 120 === 60 || (n < 200 && k % 40 === 20)) { const o = p.local.pos; p.evt('explosion', { x: o.x + 2, y: o.y + 0.1, z: o.z - 3, r: 6.5, type: explosions % 2 ? 'flash' : 'frag' }); explosions++; }
        if (k === 30) p.grenades.lancer(p.acteurParId(4) || a, 'frag', 2);
        await jeu.images(1);
      }
    };
    let cles0 = null;
    try {
      await passe(120);
      await jeu.images(10);
      cles0 = new Set(game.renderer.info.programs.map((x) => x.cacheKey));
      tirs = 0; explosions = 0;
      await passe(600);
    } finally { habillage(avant); jeu.figerQualite(false); }
    const neufs = game.renderer.info.programs.filter((x) => !cles0.has(x.cacheKey)).map((x) => x.name);
    const s = E.stats;
    res.push([`programmes ${cles0.size} → ${game.renderer.info.programs.length}${neufs.length ? ' (neufs : ' + neufs.join(', ') + ')' : ''}`, neufs.length === 0]);
    res.push([`${tirs} tirs émis + ${jeu.compteurs().tirs} de la partie, ${s.decalques} décalques, ${s.traceurs} traceurs, ${s.douilles} douilles, ${s.eclairs} éclairs, ${s.gerbes} gerbes, ${explosions} explosions`,
      s.decalques > 50 && s.traceurs > 50 && s.douilles > 20 && s.eclairs > 50 && s.gerbes > 50 && explosions >= 4]);
    jeu.quitter('balade');
    return bilan(res, 'programmes constants pendant 10 s à 100 tirs/s (impacts, traceurs, douilles, éclairs, étincelles, explosions, anneaux, cibles), après 2 s de chauffe');
  }, { delai: 150 });

  // 2. 1 000 IMPACTS : un appel, ≤ 0,2 ms de mise à jour pour 256 actifs, le plus vieux recyclé
  T('02 1 000 impacts : 1 appel, mise à jour, recyclage', async (t) => {
    jeu.figerQualite(true); await jeu.qualite('moyenne');
    const { p, E } = await essai({ mannequins: 1 });
    const F = formes(), res = [];
    try {
      if (!F.mur) return { ok: false, attendu: 'un mur près du départ', obtenu: 'aucun' };
      const q = surFace(F.mur), N = REGLAGES_EFFETS.pools.impacts, a = p.acteurParId(1);
      // 1 000 impacts le long du mur, chacun à sa place (le dernier à droite)
      const ex = F.mur.x1 - F.mur.x0 >= F.mur.z1 - F.mur.z0, L = ex ? F.mur.x1 - F.mur.x0 : F.mur.z1 - F.mur.z0;
      const place = (i) => { const u = (i % 50) / 50, v = Math.floor(i / 50) / 20; return ex ? { ...q, x: F.mur.x0 + 0.1 + u * (L - 0.2), y: F.mur.y0 + 0.2 + v * 1.8 } : { ...q, z: F.mur.z0 + 0.1 + u * (L - 0.2), y: F.mur.y0 + 0.2 + v * 1.8 }; };
      const avant = habillage('militaire');
      try { for (let i = 0; i < 1000; i++) { p.evt('impact', { ...place(i), mat: 'mur', forme: F.mur.id, plomb: 0 }); if (i % 50 === 49) E.maj(1 / 60); } }
      finally { habillage(avant); }
      E.maj(1 / 60);
      const actifs = E.impactsActifs;
      // le plus vieux recyclé : les places 0 … 743 n'y sont plus, les 256 dernières oui
      const M = E.pools.impacts, m = new THREE.Matrix4(), v = new THREE.Vector3(), pos = [];
      for (let i = 0; i < M.count; i++) { M.getMatrixAt(i, m); v.setFromMatrixPosition(m); pos.push(v.clone()); }
      const trouve = (i) => { const w = place(i); return pos.some((u) => Math.hypot(u.x - w.x - w.nx * 0.002, u.y - w.y, u.z - w.z - w.nz * 0.002) < 0.003); };
      let derniers = 0, anciens = 0;
      for (let i = 1000 - N; i < 1000; i++) if (trouve(i)) derniers++;
      for (let i = 0; i < 1000 - N; i += 7) if (trouve(i)) anciens++;
      res.push([`${actifs} actifs (${N}) · ${derniers}/${N} derniers présents · ${anciens} anciens`, actifs === N && derniers === N && anciens === 0]);
      // la mise à jour, 256 actifs
      const mes = jeu.mesurer(() => E.maj(1 / 60), 200);
      const okT = t.temps('L-H maj des effets, 256 impacts (ms)', mes.med, 0.2);
      res.push([`maj ${r3(mes.med)} ms (≤ 0,2)`, okT]);
      // un seul appel de dessin pour le pool (qualité moyenne)
      const n = appelsDe([M]).get(M);
      res.push([`${n} appel(s) pour le pool des impacts`, n === 1]);
    } finally { jeu.quitter('balade'); jeu.figerQualite(false); }
    return bilan(res, `${REGLAGES_EFFETS.pools.impacts} actifs, le plus vieux recyclé ; maj ≤ 0,2 ms ; 1 appel`);
  });

  // 3. LES IMPACTS : formes hautes et plafonds seulement, jamais un vantail ni un meuble ; quad sur la normale à ± 2°
  T('03 impacts : murs et plafonds, ni vantail ni meuble, normale à ± 2°', async () => {
    const { p, E } = await essai({ mannequins: 1 });
    const F = formes(), res = [], a = p.acteurParId(1), M = E.pools.impacts, m = new THREE.Matrix4(), z = new THREE.Vector3();
    const avant = habillage('militaire');
    try {
      const cas = [['mur', F.mur, 'mur', false, true], ['plafond', F.plafond, 'plafond', true, true], ['meuble', F.meuble, 'meuble', false, false], ['vantail', F.vantail, 'mur', false, false]];
      for (const [nom, f, mat, dessous, attendu] of cas) {
        if (!f) { res.push([nom + ' : aucune forme trouvée près du départ', nom === 'vantail']); continue; }
        const q = f.t === 'b' ? surFace(f, dessous) : { x: f.cx ?? f.x, y: (f.y0 + Math.min(f.y1, f.y0 + 2)) / 2, z: f.cz ?? f.z, nx: 1, ny: 0, nz: 0 };
        const n0 = E.stats.decalques, k = E._kImp;
        tirVers(p, a, q, { mat, forme: f.id });
        E.maj(1 / 60);
        const pose = E.stats.decalques - n0;
        let angle = 0;
        if (pose) { M.getMatrixAt(k, m); z.setFromMatrixColumn(m, 2).normalize(); angle = Math.acos(Math.min(1, z.x * q.nx + z.y * q.ny + z.z * q.nz)) / DEG; }
        res.push([`${nom} (forme ${f.id}, haute ${r2(f.y1 - f.y0)}, décalquable ${decalquable(f)}) : ${pose} décalque${pose ? ', normale à ' + r2(angle) + '°' : ''}`, (pose === 1) === attendu && (!pose || angle <= 2)]);
      }
      // au sol : de la poussière, pas de décalque
      const n0 = E.stats.decalques, o = p.local.pos;
      p.evt('impact', { x: o.x + 1.5, y: o.y, z: o.z - 2, nx: 0, ny: 1, nz: 0, mat: 'sol', forme: null, plomb: 0 }); E.maj(1 / 60);
      res.push([`sol : ${E.stats.decalques - n0} décalque`, E.stats.decalques === n0]);
      // la règle elle-même, sur toutes les formes : un vantail ou une porte n'est jamais décalquable
      const fautes = C().formes.filter((f) => (f.mobile || f.vantail) && decalquable(f)).length;
      res.push([`${fautes} vantail décalquable`, fautes === 0]);
      // (relecture) un VRAI MEUBLE haut — une forme du registre, que la balistique dit 'mur' : le mur choisi, prêté au registre
      // le temps d'un tir — n'a pas de décalque
      if (F.mur) {
        const avantReg = MEUBLES.parForme.has(F.mur), n1 = E.stats.decalques;
        if (!avantReg) MEUBLES.parForme.set(F.mur, -1);
        try { tirVers(p, a, surFace(F.mur), { mat: 'mur', forme: F.mur.id }); E.maj(1 / 60); } finally { if (!avantReg) MEUBLES.parForme.delete(F.mur); }
        res.push([`meuble du registre haut de ${r2(F.mur.y1 - F.mur.y0)} m, dit « mur » : ${E.stats.decalques - n1} décalque`, E.stats.decalques === n1]);
      }
    } finally { habillage(avant); jeu.quitter('balade'); }
    return bilan(res, 'un décalque sur un mur haut et un plafond, aucun sur un meuble, un vantail ou le sol ; quad sur la normale à ± 2°');
  });

  // 4. LES LUMIÈRES de la scène : le même nombre avant, pendant et après une partie
  T('04 lumières : même nombre avant, pendant, après', async () => {
    jeu.quitter('balade');
    const l0 = lumieres();
    const { p } = await essai({ mannequins: 3, bots: 2 });
    jeu.commande(0, { tir: true }, 2); await jeu.images(30);
    p.evt('explosion', { x: p.local.pos.x + 2, y: p.local.pos.y, z: p.local.pos.z - 2, r: 6.5, type: 'frag' }); await jeu.images(10);
    const l1 = lumieres();
    jeu.quitter('balade'); await jeu.images(2);
    const l2 = lumieres();
    return { ok: l0 === l1 && l1 === l2, attendu: 'même nombre de lumières', obtenu: `${l0} → ${l1} → ${l2}` };
  });

  // 5. LES VOIX : 100 tirs/s pendant 10 s (avancer) — ≤ 24 (12 au téléphone), libérées à leur fin sur l'horloge de SonsJeu,
  // jamais par onended, 0 AudioBuffer créé par tir
  T('05 voix : ≤ 24, libérées à leur fin, 0 tampon par tir', async () => {
    const { p, S } = await essai({ mannequins: 3, bots: 2 });
    await S.pretBanque();                      // (la banque de sons rendue : ses tampons sont ceux de la préparation)
    const ctx = game.audio.ctx, res = [], N = REGLAGES_SONS.voix;
    // l'espion des tampons : createBuffer et new AudioBuffer
    let tampons = 0;
    const cb = BaseAudioContext.prototype.createBuffer, AB = window.AudioBuffer;
    BaseAudioContext.prototype.createBuffer = function (...x) { tampons++; return cb.apply(this, x); };
    window.AudioBuffer = function (...x) { tampons++; return new AB(...x); };
    const suivies = new Map(); let max = 0, enRetard = 0, enAvance = 0, libres = 0, volees = 0, tirs = 0;
    const L = game.camera.position, acteurs = p.acteurs.filter((b) => !b.local);
    try {
      let acc = 0;
      for (let k = 0; k < 1200; k++) {
        acc += 100 / 120;
        while (acc >= 1) {
          acc -= 1; const a = acteurs[tirs % acteurs.length], ang = tirs * 2.39, d = 4 + (tirs % 9) * 4;
          p.evt('tir', { a: a.id, arme: ['fa24', 'pm9', 'fp12', 'tp50', 'p17'][tirs % 5], ox: L.x + Math.cos(ang) * d, oy: L.y, oz: L.z + Math.sin(ang) * d, dx: 1, dy: 0, dz: 0, n: 1, seq: tirs });
          tirs++;
        }
        jeu.avancer(PAS);                      // (Partie.pas, puis SonsJeu.maj : son horloge avance d'un pas)
        for (const v of S.voix) if (!suivies.has(v)) suivies.set(v, true);
        max = Math.max(max, S.voix.length);
        const actives = new Set(S.voix);
        for (const v of suivies.keys()) {
          if (actives.has(v)) continue;
          suivies.delete(v);
          if (v.volee) { volees++; continue; }
          libres++;
          if (S.t < v.fin - 1e-9) enAvance++; else if (S.t - v.fin > PAS + 1e-9) enRetard++;
        }
      }
    } finally { BaseAudioContext.prototype.createBuffer = cb; window.AudioBuffer = AB; }
    const src = await fetch(new URL('../sons_jeu.js', import.meta.url), { cache: 'no-cache' }).then((r) => r.text());
    res.push([`${tirs} tirs en 10 s · au plus ${max} voix (≤ ${N})`, max <= N && tirs >= 990]);
    res.push([`${libres} libérées à leur fin (${enAvance} en avance, ${enRetard} en retard d'un pas), ${volees} volées`, libres > 100 && enAvance === 0 && enRetard === 0]);
    res.push(['aucun onended dans le code de sons_jeu.js', !/\.onended\s*=|addEventListener\(\s*['"]ended/.test(src)]);
    res.push([`${tampons} AudioBuffer créé(s) pendant les tirs`, tampons === 0]);
    res.push([`horloge ${r3(S.t)} s (contexte ${ctx.currentTime} s)`, true]);
    jeu.quitter('balade');
    return bilan(res, `≤ ${N} voix à tout instant, libérées quand t ≥ fin (± 1 pas), jamais par onended, 0 AudioBuffer par tir`);
  }, { delai: 180 });

  // 6. LE PANORAMIQUE : chaque voix à sa source (± 1 cm) ; l'auditeur à la caméra de L'IMAGE, orienté comme elle (± 1°) —
  // même sur un virage de 90° en une image ; 8 sources autour : gauche / droite justes 8 fois sur 8 (rendues à part)
  T('06 panoramique : sources, auditeur sans retard, gauche / droite 8 sur 8', async () => {
    const { p, S } = await essai({ mannequins: 1 });
    const res = [], ctx = game.audio.ctx, Lst = ctx.listener;
    // le virage de 90° en UNE image
    game.camYaw += Math.PI / 2; game.frame(1 / 60);
    const cam = game.camera, d = new THREE.Vector3(); cam.getWorldDirection(d);
    const av = new THREE.Vector3(Lst.forwardX.value, Lst.forwardY.value, Lst.forwardZ.value);
    const dp = Math.hypot(Lst.positionX.value - cam.position.x, Lst.positionY.value - cam.position.y, Lst.positionZ.value - cam.position.z);
    res.push([`auditeur à ${r3(dp)} m de la caméra, orienté à ${r2(av.angleTo(d) / DEG)}°`, dp < 1e-4 && av.angleTo(d) / DEG <= 1]);
    // 8 sources autour (à 5 m, à hauteur d'oreille), à 22,5° + k × 45° de l'avant
    const f = new THREE.Vector3(d.x, 0, d.z).normalize(), r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0));
    const L = cam.position, voix = [];
    for (let k = 0; k < 8; k++) {
      const a = (22.5 + 45 * k) * DEG, x = L.x + (f.x * Math.cos(a) + r.x * Math.sin(a)) * 5, z = L.z + (f.z * Math.cos(a) + r.z * Math.sin(a)) * 5;
      voix.push([S.jouer3d(x, L.y, z, SINUS(0.2), { gain: 0.5, rayon: 30 }), Math.sin(a) > 0 ? 'droite' : 'gauche', x, L.y, z]);
    }
    let places = 0, justes = 0; const vus = [];
    for (const [v, cote, x, y, z] of voix) {
      if (!v) continue;
      const P = v.panner, e = Math.hypot(P.positionX.value - x, P.positionY.value - y, P.positionZ.value - z);
      if (e <= 0.01) places++;
      // rendue dans un contexte à part : l'auditeur de la partie, le même panoramique
      const M = new OfflineAudioContext(2, 2205, 44100), Q = M.listener;
      for (const k of ['positionX', 'positionY', 'positionZ', 'forwardX', 'forwardY', 'forwardZ', 'upX', 'upY', 'upZ']) Q[k].value = Lst[k].value;
      const pan = M.createPanner(); pan.panningModel = SPATIAL.modele; pan.distanceModel = SPATIAL.loi; pan.refDistance = SPATIAL.reference; pan.rolloffFactor = SPATIAL.attenuation; pan.maxDistance = SPATIAL.max;
      pan.positionX.value = P.positionX.value; pan.positionY.value = P.positionY.value; pan.positionZ.value = P.positionZ.value;
      const o = M.createOscillator(); o.connect(pan); pan.connect(M.destination); o.start(0);
      const b = await M.startRendering(), g = b.getChannelData(0), dr = b.getChannelData(1);
      let eg = 0, ed = 0; for (let i = 0; i < g.length; i++) { eg += g[i] * g[i]; ed += dr[i] * dr[i]; }
      const ent = ed > eg ? 'droite' : 'gauche'; vus.push(ent[0]);
      if (ent === cote) justes++;
    }
    res.push([`${places}/8 panoramiques à leur source (± 1 cm)`, places === 8]);
    res.push([`${justes}/8 du bon côté (${vus.join('')})`, justes === 8]);
    // (relecture) LES SONS DE HAYTHEM AU MILIEU : son tir (l'œil simulé à 3 cm à droite de la caméra, un pas chassé), ses pas
    // (sous la caméra), sa recharge — sans panoramique ; la raison, rendue à part : un panoramique 'equalpower' à 3 cm à
    // droite et 1,6 m dessous met presque tout le son dans l'oreille droite
    const rendre = async (px, py, pz) => {
      const M = new OfflineAudioContext(2, 2205, 44100), Q = M.listener;
      for (const k of ['positionX', 'positionY', 'positionZ', 'forwardX', 'forwardY', 'forwardZ', 'upX', 'upY', 'upZ']) Q[k].value = Lst[k].value;
      const pan = M.createPanner(); pan.panningModel = SPATIAL.modele; pan.distanceModel = SPATIAL.loi; pan.refDistance = SPATIAL.reference; pan.rolloffFactor = SPATIAL.attenuation;
      pan.positionX.value = px; pan.positionY.value = py; pan.positionZ.value = pz;
      const o = M.createOscillator(); o.connect(pan); pan.connect(M.destination); o.start(0);
      const b = await M.startRendering(), g = b.getChannelData(0), dr = b.getChannelData(1); let eg = 0, ed = 0;
      for (let i = 0; i < g.length; i++) { eg += g[i] * g[i]; ed += dr[i] * dr[i]; }
      return ed / Math.max(1e-12, eg + ed);
    };
    const kD = await rendre(L.x + r.x * 0.03, L.y - 1.6, L.z + r.z * 0.03);
    S.maj(1, cam);
    const loc = p.local;
    p.evt('tir', { a: loc.id, arme: 'fa24', ox: L.x + r.x * 0.03, oy: L.y, oz: L.z + r.z * 0.03, dx: f.x, dy: 0, dz: f.z, n: 1, seq: 3 });
    p.evt('pas', { a: loc.id, x: L.x + r.x * 0.03, y: L.y - 1.62, z: L.z + r.z * 0.03, f: 0.7, allure: 'course' });
    p.evt('recharge', { a: loc.id, phase: 'debut', tactique: true });
    S.maj(0, cam);
    const siens = S.voix.slice(-3), centres = siens.filter((v) => v.centre && !v.panner).length;
    res.push([`sons de Haythem (tir à 3 cm, pas, recharge) : ${centres}/3 au milieu, sans panoramique (un panoramique à 3 cm à droite : ${Math.round(kD * 100)} % à droite)`,
      centres === 3]);
    jeu.quitter('balade');
    return bilan(res, 'auditeur à la caméra de l’image (± 1°, sans retard sur 90°) ; panoramiques à ± 1 cm ; 8/8 du bon côté');
  });

  // 7. L'OCCLUSION (journal : setTargetAtTime du gain et du filtre) : bloquée −9 dB / 700 Hz ; autre niveau −14 dB / 400 Hz ;
  // le retard d/343 (± 1 ms, date du start) ; 4 voix au plus par image ; rien sous −30 dB ; coût ; 0 C.rayonLibre
  T('07 occlusion, retard, 4 par image, coût', async (t) => {
    const { p, S } = await essai({ mannequins: 1 });
    const res = [], J = jeu.journalAudio, B = p.balistique, cam = game.camera;
    // l'auditeur : Haythem au départ (la caméra posée par une vraie image)
    game.frame(1 / 60);
    const L = cam.position.clone(), c = C(), yS = c.solEn(L.x, L.z, L.y - 1.2);
    // une source bloquée (même étage, derrière un mur) et une libre, à 4-14 m
    let bloque = null, libre = null;
    for (let r = 4; r <= 14 && !(bloque && libre); r += 1) for (let a = 0; a < 360 && !(bloque && libre); a += 15) {
      const x = L.x + Math.cos(a * DEG) * r, z = L.z + Math.sin(a * DEG) * r, y = c.solEn(x, z, yS + 0.3);
      if (Math.abs(y - yS) > 0.3 || !c.libre(x, z, 0.3, y)) continue;
      const vu = B.vue(L.x, L.y, L.z, x, y + 1.2, z);
      if (!vu && !bloque) bloque = { x, y: y + 1.2, z }; else if (vu && !libre) libre = { x, y: y + 1.2, z };
    }
    // une source à l'étage du dessus
    const haut = { x: L.x + 1, y: yS + 3.5 + 1.2, z: L.z - 1 };
    const occ = (v) => {
      const g = J.entrees.filter((e) => e.param === v.gain.gain && e.methode === 'setTargetAtTime').pop();
      const f = J.entrees.filter((e) => e.param === v.filtre.frequency && e.methode === 'setTargetAtTime').pop();
      return { g: g ? g.valeur : null, f: f ? f.valeur : null };
    };
    J.vider();
    const vB = bloque && S.jouer3d(bloque.x, bloque.y, bloque.z, SINUS(), { gain: 1, rayon: 30 });
    const vL = libre && S.jouer3d(libre.x, libre.y, libre.z, SINUS(), { gain: 1, rayon: 30 });
    const vH = S.jouer3d(haut.x, haut.y, haut.z, SINUS(), { gain: 1, rayon: 30 });
    S.maj(0, cam);
    const O = REGLAGES_SONS.occlusion, kB = Math.pow(10, O.bloque.db / 20), kN = Math.pow(10, O.niveau.db / 20);
    if (vB) { const o = occ(vB); res.push([`bloquée : gain ${r3(o.g)} (${r3(kB)}), filtre ${o.f} Hz`, Math.abs(o.g - kB) < 1e-3 && o.f === O.bloque.hz]); }
    else res.push(['aucune source bloquée trouvée', false]);
    if (vL) { const o = occ(vL); res.push([`libre : gain ${r3(o.g)}, filtre ${o.f} Hz`, Math.abs(o.g - 1) < 1e-3 && o.f >= 20000]); }
    if (vH) { const o = occ(vH); res.push([`autre niveau : gain ${r3(o.g)} (${r3(kN)}), filtre ${o.f} Hz`, Math.abs(o.g - kN) < 1e-3 && o.f === O.niveau.hz]); }
    // le RETARD : un tir à d m, émis juste après une image (son moment dans l'image : 0) → start à d/343
    const a = p.acteurParId(1), d = 17, dep = espionDeparts();
    try { p.evt('tir', { a: a.id, arme: 'fa24', ox: L.x + d, oy: L.y, oz: L.z, dx: -1, dy: 0, dz: 0, n: 1, seq: 7 }); S.maj(0, cam); } finally { dep.rendre(); }
    const st = dep.L.length ? Math.min(...dep.L) : null, dd = Math.hypot(d, 0, 0);
    res.push([`retard ${st !== null ? r3(st * 1000) : '—'} ms (${r3(dd / 343 * 1000)}) · ${S.banque ? 'banque' : 'direct'}`, st !== null && Math.abs(st - (game.audio.ctx.currentTime + dd / 343)) <= 0.001]);
    // 4 VOIX AU PLUS par image : 10 voix neuves d'un coup (≥ −30 dB), une image
    let vues = 0; const vue = B.vue;
    B.vue = function (...x) { vues++; return vue.apply(this, x); };
    try {
      for (let k = 0; k < 10; k++) S.jouer3d(L.x + 3 + k * 0.3, L.y, L.z - 2, SINUS(), { gain: 1, rayon: 30 });
      vues = 0; S.maj(0, cam); const n1 = vues;
      // une voix sous −30 dB (gain 0,01 à 25 m) : jamais testée
      for (let k = 0; k < 50 && S.voix.some((v) => v.aVerifier); k++) S.maj(0, cam);
      S.maj(1, cam);                           // (les voix finies libérées : au téléphone, 12 voix au plus — la plus faible serait refusée)
      const faible = S.jouer3d(L.x + 25, L.y, L.z, SINUS(), { gain: 0.01, rayon: 60 });
      let vuesFaible = 0; B.vue = function (ax, ay, az, bx, by, bz) { if (faible && Math.abs(bx - faible.x) < 1e-6 && Math.abs(bz - faible.z) < 1e-6) vuesFaible++; vues++; return vue.call(this, ax, ay, az, bx, by, bz); };
      for (let k = 0; k < 30; k++) S.maj(0, cam);
      res.push([`${n1} occlusion(s) dans l'image des 10 voix neuves (≤ 4)`, n1 <= REGLAGES_SONS.occlusion.parImage && n1 > 0]);
      res.push([`voix à ${faible ? r2(faible.niveauDb) : '—'} dB : testée ${vuesFaible} fois`, !!faible && faible.niveauDb < -30 && vuesFaible === 0]);
    } finally { B.vue = vue; }
    // LE COÛT de l'occlusion par image (24 voix actives), hors le temps de vue() elle-même ; 0 appel à C.rayonLibre hors de vue()
    for (let k = 0; k < 200 && S.voix.length < REGLAGES_SONS.voix; k++) S.jouer3d(L.x + 2 + Math.random() * 6, L.y, L.z - 3 + Math.random() * 6, SINUS(5), { gain: 1, rayon: 30 });
    let dansVue = false, msVue = 0, rl = 0;
    const rayon = c.rayonLibre;
    c.rayonLibre = function (...x) { if (!dansVue) rl++; return rayon.apply(this, x); };
    B.vue = function (...x) { const t0 = performance.now(); dansVue = true; try { return vue.apply(this, x); } finally { dansVue = false; msVue += performance.now() - t0; } };
    let ms = 0;
    try {
      for (let k = 0; k < 200; k++) { const t0 = performance.now(); S._occlusions(); ms += performance.now() - t0; }
      S.maj(1 / 60, cam);
    } finally { B.vue = vue; c.rayonLibre = rayon; }
    const hors = (ms - msVue) / 200, avecVue = ms / 200;
    t.note('L-H occlusion par image, vue() du squelette comprise (ms)', r3(avecVue));
    res.push([`occlusion ${r3(hors)} ms par image hors vue() (≤ 0,05 ; ${r3(avecVue)} avec la vue du squelette)`, t.temps('L-H occlusion par image hors vue() (ms)', hors, 0.05)]);
    res.push([`${rl} appel(s) à C.rayonLibre hors de vue()`, rl === 0]);
    jeu.quitter('balade');
    return bilan(res, 'bloquée −9 dB / 700 Hz, autre niveau −14 dB / 400 Hz, retard d/343 ± 1 ms, ≤ 4 par image, rien sous −30 dB, ≤ 0,05 ms, 0 C.rayonLibre');
  });

  // 8. AU-DELÀ DE 25 m PAS DE CLAQUEMENT ; hauteur ± 4 % d'un coup à l'autre ; les pas des ennemis + 4 dB
  T('08 claquement à 25 m, hauteur ± 4 %, pas des ennemis + 4 dB', async () => {
    const { p, S } = await essai({ mannequins: 3, bots: 2 });
    const res = [], L = game.camera.position, J = jeu.journalAudio, cam = game.camera;
    const avant = habillage('militaire');
    try {
      // (entre deux coups, l'horloge des sons avance d'une seconde : les voix finies libérées, la place faite)
      const tir = (d, a = 1, s = 1) => { S.maj(1, cam); p.evt('tir', { a, arme: 'fa24', ox: L.x + d, oy: L.y, oz: L.z, dx: -1, dy: 0, dz: 0, n: 1, seq: s }); S.maj(0, cam); return S.voix[S.voix.length - 1]; };
      const v10 = tir(10), v35 = tir(35);
      res.push([`à 10 m : claquement ${v10 && v10.parts.claquement} s ; à 35 m : ${v35 ? v35.parts.claquement ?? 'aucun' : '—'} (corps ${v35 && v35.parts.corps})`, !!v10 && !!v10.parts.claquement && !!v35 && v35.parts.claquement === undefined]);
      // 30 coups du même tireur : la hauteur (et la fréquence de départ du grave, au journal) dans ± 4 %, jamais deux fois la même
      await S.pretBanque();
      J.vider(); const H = [], V = [];
      for (let s = 1; s <= 30; s++) { const v = tir(6, 1, 100 + s); if (v && v.hauteur) { H.push(v.hauteur); V.push(v); } }
      // (le grave : la seule fréquence programmée à ± 4 % de 95 Hz — l'écho du couloir part de 85,5 Hz)
      const g = V.filter((v) => J.entrees.some((e) => e.methode === 'setValueAtTime' && (v.source ? e.param === v.source.playbackRate && Math.abs(e.valeur - v.hauteur) < 1e-6
        : Math.abs(e.valeur / RECETTES_TIR.fa24.grave[0] - v.hauteur) < 1e-6)));
      const min = Math.min(...H), max = Math.max(...H), diff = new Set(H.map((h) => h.toFixed(5))).size;
      res.push([`hauteur ${r3(min)} … ${r3(max)} sur ${H.length} coups (${diff} différentes) ; hauteur programmée au journal ${g.length} fois (${V[0] && V[0].banque ? 'playbackRate, banque' : 'grave, direct'})`, H.length === 30 && min >= 0.96 - 1e-9 && max <= 1.04 + 1e-9 && diff >= 28 && g.length >= 30]);
      // les pas : un ennemi et un allié de Haythem, même distance, même allure
      const ennemi = p.acteurs.find((b) => !b.local && p.ennemis(p.local, b)), allie = p.acteurs.find((b) => !b.local && !p.ennemis(p.local, b));
      if (ennemi && allie) {
        const pas = (a) => { S.maj(1, cam); p.evt('pas', { a: a.id, x: L.x + 5, y: L.y - 1.6, z: L.z, f: 0.7, allure: 'course' }); S.maj(0, cam); return S.voix[S.voix.length - 1]; };
        const ve = pas(ennemi), va = pas(allie), k = ve && va ? ve.base / va.base : 0;
        res.push([`pas d'un ennemi / d'un allié : × ${r3(k)} (+${r2(20 * Math.log10(k))} dB)`, Math.abs(20 * Math.log10(k) - 4) < 0.05]);
      } else res.push(['un ennemi et un allié', false]);
    } finally { habillage(avant); jeu.quitter('balade'); }
    return bilan(res, 'pas de claquement au-delà de 25 m ; hauteur ± 4 % ; pas des ennemis + 4 dB');
  });

  // 9. LA BALADE : les pas, crissements et réceptions des couches jouent encore (5 s de course : les start programmés,
  // ± 10 % de a8b22dd)
  T('09 balade : sons des couches, ± 10 % de a8b22dd', async () => {
    jeu.quitter('balade'); await jeu.images(2);
    const starts = compterSonsBalade(game, true);
    const ref = PAS_A8B22DD;
    const ok = ref ? Math.abs(starts - ref) <= 0.1 * ref : starts >= 30;
    return { ok, attendu: ref ? `${ref} ± 10 % (a8b22dd)` : '≥ 30 (référence a8b22dd non posée)', obtenu: `${starts} départs programmés en 5 s` };
  });

  // 10. fx.js : la passe superposée sur les trois chemins ; « Priorité fluidité » en partie → 1000/60 ; éteinte ou en balade →
  // BUDGET_IMAGE (1000/45)
  T('10 fx : passe superposée (3 chemins), budget « Priorité fluidité »', async () => {
    const fx = game.fx, res = [], J = game.settings.data.jeu;
    jeu.quitter('balade'); await jeu.images(2);
    const b45 = 1000 / 45, b60 = 1000 / 60;
    res.push([`balade : budget ${r2(fx.budgetImage)}, passe ${fx.passeSuperposee.enabled}`, Math.abs(fx.budgetImage - b45) < 1e-9 && !fx.passeSuperposee.enabled && fx.superpositions.length === 0]);
    const fl = J.fluidite;
    try {
      J.fluidite = true;
      const { p } = await essai({ mannequins: 1 }); await jeu.images(2);
      res.push([`partie, fluidité cochée : budget ${r2(fx.budgetImage)}, cible ${r2(fx._cible())} ms`, Math.abs(fx.budgetImage - b60) < 1e-9]);
      J.fluidite = false; await jeu.images(2);
      res.push([`partie, fluidité décochée : ${r2(fx.budgetImage)}`, Math.abs(fx.budgetImage - b45) < 1e-9]);
      J.fluidite = true; await jeu.images(2);
      // les trois chemins : le composer (qualité du moment), le chemin léger (moyenne), sans composer
      const vm = p.aff.viewmodel, r = game.renderer, rendre = r.render; let vus = 0;
      r.render = function (s, c) { if (s === vm.scene) vus++; return rendre.call(this, s, c); };
      try {
        vus = 0; game.frame(1 / 60); const comp = vus;
        jeu.figerQualite(true); await jeu.qualite('moyenne'); for (let i = 0; i < 3; i++) game.frame(1 / 60);
        vus = 0; game.frame(1 / 60); const leg = vus, legere = !!fx._legere?.();
        const en = fx.enabled; fx.enabled = false; vus = 0;
        try { game.frame(1 / 60); } finally { fx.enabled = en; }
        const sans = vus;
        const i = fx.composer.passes.indexOf(fx.passeSuperposee), io = fx.composer.passes.indexOf(fx.oeil);
        res.push([`superposition dessinée : composer ${comp}, moyenne ${leg} (chemin léger ${legere}), sans composer ${sans} ; après l’œil ${i === io + 1}`, comp === 1 && leg === 1 && sans === 1 && i === io + 1]);
      } finally { r.render = rendre; jeu.figerQualite(false); }
      jeu.quitter('balade'); await jeu.images(2);
      res.push([`sortie : budget ${r2(fx.budgetImage)}, fluidite ${fx.fluidite}, passe ${fx.passeSuperposee.enabled}`, Math.abs(fx.budgetImage - b45) < 1e-9 && !fx.fluidite && !fx.passeSuperposee.enabled]);
    } finally { J.fluidite = fl; }
    return bilan(res, 'passe superposée sur les trois chemins ; 1000/60 en partie sous « Priorité fluidité », BUDGET_IMAGE sinon et en balade');
  });

  // 11. LES ANNEAUX (3) ET LES CIBLES (12) : un appel par pool, lus dans hud.points / hud.cibles ; les cibles du stand
  T('11 anneaux et cibles : un appel par pool, lus dans le HUD ; le stand', async () => {
    jeu.figerQualite(true); await jeu.qualite('moyenne');
    const res = [];
    try {
      const { p, E } = await essai({ mannequins: 1 });
      const o = p.local.pos, img = p.image.bind(p);
      p.hud.points = ['A', 'B', 'C'].map((id, k) => ({ id, x: o.x + 2 + k * 4, y: o.y, z: o.z - 4, r: 2.5, possesseur: k === 0 ? 'A' : k === 1 ? 'B' : null, capture: { equipe: k === 2 ? 'A' : null, k: k === 2 ? 0.5 : 0 } }));
      p.hud.cibles = Array.from({ length: 12 }, (_, k) => ({ id: 200 + k, x: o.x - 6 + k * 1.1, y: o.y, z: o.z - 7, cap: 0, k: 1, touchee: k % 4 === 3 }));
      for (let i = 0; i < 30; i++) image(p);
      const A = E.pools.anneaux, Cb = E.pools.cibles, n = appelsDe([A, Cb]);
      res.push([`anneaux : ${visibles(A)} instances (3 anneaux, 1 capture, 3 lettres), ${n.get(A)} appel`, visibles(A) === 7 && n.get(A) === 1]);
      res.push([`cibles : ${visibles(Cb)} instances, ${n.get(Cb)} appel`, visibles(Cb) === 12 && n.get(Cb) === 1]);
      // une cible touchée est couchée (sa tête à moins de 0,3 m du sol), les autres debout
      const m = new THREE.Matrix4(), up = new THREE.Vector3();
      let couchees = 0, debout = 0;
      for (let i = 0; i < 12; i++) { Cb.getMatrixAt(i, m); up.setFromMatrixColumn(m, 1); if (up.y < 0.2) couchees++; else if (up.y > 0.98) debout++; }
      res.push([`${debout} debout, ${couchees} couchées`, debout === 9 && couchees === 3]);
      p.hud.points = []; p.hud.cibles = []; image(p);
      res.push(['vides : rien de dessiné', !A.visible && !Cb.visible]);
      jeu.quitter('balade');
      // le stand : ses cibles (hud.cibles des règles) dessinées à leur place
      await jeu.lancer('stand', {}); await jeu.images(3);
      const q = game.partie, H = (q.hud.cibles || []).filter((c) => !c.mannequin), M = q.aff.effets.pools.cibles, v = new THREE.Vector3();
      let places = 0;
      for (let i = 0; i < H.length; i++) { M.getMatrixAt(i, m); v.setFromMatrixPosition(m); if (Math.hypot(v.x - H[i].x, v.y - H[i].y, v.z - H[i].z) < 0.01) places++; }
      res.push([`stand : ${places}/${H.length} cibles à leur place`, H.length > 0 && places === H.length]);
    } finally { jeu.quitter('balade'); jeu.figerQualite(false); }
    return bilan(res, 'anneaux et cibles lus dans hud.points / hud.cibles, un appel par pool ; le stand');
  });

  // 12. L'HABILLAGE : Airsoft (défaut) — peinture à la couleur de l'équipe du tireur, tir « gaz » (claquement présent, plus
  // court, sans grave) ; Militaire — trous, recette pleine
  T('12 habillage : Airsoft (peinture, gaz) et Militaire (trous, recette pleine)', async () => {
    const { p, E, S } = await essai({ mannequins: 1, bots: 2 });
    const res = [], F = formes(), cam = game.camera, M = E.pools.impacts, c = new THREE.Color();
    res.push([`défaut : ${settings.data.jeu.habillage}`, (game.settings.data.jeu.habillage || 'airsoft') === 'airsoft']);
    if (!F.mur) return { ok: false, attendu: 'un mur', obtenu: 'aucun' };
    const tireur = p.acteurs.find((b) => b.equipe === 'B' && !b.local) || p.acteurParId(1);
    const essaiH = (h) => {
      const avant = habillage(h);
      try {
        const q = surFace(F.mur), k = E._kImp;
        tirVers(p, tireur, q, { mat: 'mur', forme: F.mur.id, seq: 5 });
        E.maj(1 / 60); S.maj(0, cam);
        const v = S.voix.filter((x) => x.parts && x.arme).pop();
        M.getColorAt(k, c);
        const cas = M.geometry.attributes.aFx.getX(k) === 0.5 && M.geometry.attributes.aFx.getY(k) === 0 ? 'peinture' : M.geometry.attributes.aFx.getX(k) === 0 && M.geometry.attributes.aFx.getY(k) === 0 ? 'trou' : '?';
        return { cas, c: c.clone(), v };
      } finally { habillage(avant); }
    };
    const a = essaiH('airsoft'), m = essaiH('militaire');
    const eq = new THREE.Color(EQUIPES[tireur.equipe] ? EQUIPES[tireur.equipe].couleur : '#ffffff');
    const ecart = Math.max(Math.abs(a.c.r - eq.r), Math.abs(a.c.g - eq.g), Math.abs(a.c.b - eq.b));
    res.push([`Airsoft : ${a.cas} à la couleur de l'équipe ${tireur.equipe} (écart ${r3(ecart)})`, a.cas === 'peinture' && ecart < 0.01]);
    res.push([`Militaire : ${m.cas}, blanc ${r2(m.c.r)}`, m.cas === 'trou' && m.c.r > 0.99]);
    const R = RECETTES_TIR.fa24;
    res.push([`tir « gaz » : claquement ${a.v && a.v.parts.claquement} s (militaire ${R.claquement[1]}), grave ${a.v && a.v.parts.grave ? 'présent' : 'absent'}`,
      !!a.v && a.v.gaz && a.v.parts.claquement > 0 && a.v.parts.claquement < R.claquement[1] && !a.v.parts.grave]);
    res.push([`tir militaire : claquement ${m.v && m.v.parts.claquement} s, grave ${m.v && r2(m.v.parts.grave)} Hz`, !!m.v && !m.v.gaz && m.v.parts.claquement === R.claquement[1] && m.v.parts.grave > 0]);
    jeu.quitter('balade');
    return bilan(res, 'Airsoft : peinture à la couleur de l’équipe, recette « gaz » ; Militaire : trous, recette pleine');
  });

  // 13. LE COÛT : Effets.maj ≤ 0,3 ms, SonsJeu.maj ≤ 0,2 ms par image avec 7 bots qui se battent
  T('13 coût par image : effets ≤ 0,3 ms, sons ≤ 0,2 ms (7 bots)', async (t) => {
    await jeu.lancer('equipes', { zone: 'ss', allies: 3, ennemis: 4, graine: 13 });
    const p = game.partie, E = p.aff.effets, S = p.aff.sons, res = [];
    await S.pretBanque();
    jeu.avancer(6.2); game.paused = false;
    let me = 0, ms = 0, n = 0;
    const fe = E.maj, fs = S.maj;
    E.maj = function (...a) { const t0 = performance.now(); try { return fe.apply(this, a); } finally { me += performance.now() - t0; } };
    S.maj = function (...a) { const t0 = performance.now(); try { return fs.apply(this, a); } finally { ms += performance.now() - t0; } };
    const tirs0 = jeu.compteurs().tirs;
    let valable = true;
    try {
      // (images faites à la main si l'onglet est caché)
      for (let k = 0; k < 6; k++) { const r = await jeu.images(60); valable = valable && r.valable; }
      n = 0; me = 0; ms = 0;
      for (let k = 0; k < 6; k++) { const r = await jeu.images(60); valable = valable && r.valable; n += r.n; }
    } finally { delete E.maj; delete S.maj; }
    const tirs = jeu.compteurs().tirs - tirs0, Em = me / Math.max(1, n), Sm = ms / Math.max(1, n);
    res.push([`${tirs} tirs, ${S.stats.creees} voix, ${E.stats.traceurs} traceurs, banque ${JSON.stringify(S.stats.banque || null)}`, tirs >= 20 && !!S.banque]);
    res.push([`Effets.maj ${r3(Em)} ms par image (≤ 0,3)`, t.temps('L-H Effets.maj par image, 7 bots (ms)', Em, 0.3, valable)]);
    res.push([`SonsJeu.maj ${r3(Sm)} ms par image (≤ 0,2)`, t.temps('L-H SonsJeu.maj par image, 7 bots (ms)', Sm, 0.2, valable)]);
    jeu.quitter('balade');
    return bilan(res, 'Effets.maj ≤ 0,3 ms et SonsJeu.maj ≤ 0,2 ms par image, 7 bots qui se battent');
  }, { delai: 120 });

  // 15. (relecture) LA MORT DE HAYTHEM : le son étouffé (450 Hz) le temps de la caméra de mort, puis rouvert — au journal ;
  // le spectateur du prop hunt, qui ne réapparaît pas, ne reste pas sourd jusqu'à la fin de la partie
  T('15 mort de Haythem : étouffé 3 s, puis rouvert', async () => {
    const { p, S } = await essai({ mannequins: 1 });
    const J = jeu.journalAudio, cam = game.camera, M = REGLAGES_SONS.etouffe.mort;
    S.maj(0, cam); J.vider();
    const q0 = game.audio.ctx.currentTime;
    // (une vraie mort : Partie.infliger, la seule porte des dégâts — 'touche' puis 'elim')
    const L0 = p.local, o = L0.pos; L0.protegeT = 0;
    p.infliger(L0, 500, { par: 1, arme: 'fa24', zone: 'torse', x: o.x, y: o.y + 1.2, z: o.z, dx: 1, dy: 0, dz: 0, plomb: 0 });
    S.maj(0, cam);
    const F = J.entrees.filter((e) => e.param === S.filtreBus.frequency && e.methode === 'setTargetAtTime');
    const bas = F.find((e) => e.valeur === M.hz), haut = F.find((e) => e.valeur >= 20000);
    jeu.quitter('balade');
    return { ok: !L0.vivant && !!bas && !!haut && Math.abs(haut.quand - (q0 + M.duree)) < 1e-6,
      attendu: `passe-bas ${M.hz} Hz tout de suite, rouvert à + ${M.duree} s`, obtenu: `${bas ? bas.valeur + ' Hz à ' + r3(bas.quand - q0) + ' s' : 'aucun'} · ${haut ? 'rouvert à ' + r3(haut.quand - q0) + ' s' : 'jamais rouvert'}` };
  });

  // 16. (relecture) UNE RECHARGE ANNULÉE OU INTERROMPUE (phases de plus chez L-A) ne joue rien — ni le « clac » ni la pompe
  T('16 recharge annulée ou interrompue : muette', async () => {
    const { p, S } = await essai({ mannequins: 1 });
    const cam = game.camera, a = p.local; S.maj(1, cam);
    const n0 = S.stats.creees;
    for (const phase of ['annulee', 'interrompue']) p.evt('recharge', { a: a.id, phase, tactique: true });
    S.maj(0, cam);
    const n1 = S.stats.creees;
    p.evt('recharge', { a: a.id, phase: 'fin', tactique: false }); S.maj(0, cam);
    const n2 = S.stats.creees;
    jeu.quitter('balade');
    return { ok: n1 === n0 && n2 === n1 + 1, attendu: '0 voix pour annulee / interrompue, 1 pour fin', obtenu: `${n1 - n0} voix, puis ${n2 - n1} pour fin` };
  });

  // 17. (relecture) LES PORTES 'auto' (l'événement `porte` de L-M, prop hunt) : une voix à la porte, occultée comme les autres,
  // à l'ouverture et à la fermeture ; rien au-delà de son rayon
  T('17 portes : un son à l’ouverture et à la fermeture', async () => {
    const { p, S } = await essai({ mannequins: 1 });
    const cam = game.camera, L = cam.position; S.maj(1, cam);
    const R = REGLAGES_SONS.rayons.porte, res = [];
    for (const ouvre of [true, false]) {
      const n0 = S.stats.creees;
      p.evt('porte', { nom: 'essai', x: L.x + 3, y: L.y - 1.6, z: L.z, ouvre, a: ouvre ? 1 : -1 }); S.maj(0, cam);
      const v = S.voix[S.voix.length - 1];
      res.push([`${ouvre ? 'ouverture' : 'fermeture'} : ${S.stats.creees - n0} voix à ${v ? r2(Math.hypot(v.x - L.x - 3, v.z - L.z)) : '—'} m de la porte, panoramique ${!!(v && v.panner)}`,
        S.stats.creees === n0 + 1 && !!v && !!v.panner && Math.hypot(v.x - L.x - 3, v.z - L.z) < 1e-6]);
    }
    const n0 = S.stats.creees;
    p.evt('porte', { nom: 'loin', x: L.x + R + 5, y: L.y - 1.6, z: L.z, ouvre: true, a: 1 }); S.maj(0, cam);
    res.push([`à ${R + 5} m : ${S.stats.creees - n0} voix`, S.stats.creees === n0]);
    jeu.quitter('balade');
    return bilan(res, 'une voix spatialisée à la porte, à l’ouverture et à la fermeture ; rien au-delà du rayon');
  });

  // 14. LA BALADE AU BIT PRÈS, la passe superposée éteinte, les pools hors de la scène
  T('14 balade au bit près, passe éteinte, rien du jeu dans la scène', async () => {
    jeu.quitter('balade'); await jeu.images(2);
    const r = await jeu.rejouerBalade(), fx = game.fx;
    const effets = game.scene.children.filter((o) => o.userData.effets).length;
    return { ok: r.ok && !fx.passeSuperposee.enabled && effets === 0, attendu: 'rejeu au bit près, passe superposée éteinte, 0 pool dans la scène',
      obtenu: `vue 3 ${r.vue3.pos} / ${r.vue3.cam} · vue 1 ${r.vue1.pos} / ${r.vue1.cam} · passe ${fx.passeSuperposee.enabled} · ${effets} pool(s)` };
  });

  // ---------------------------------------------------------------- À F2 (les vrais modules des autres lots)
  // l'occlusion avec la VRAIE vue de L-A : ≤ 0,05 ms par image, tout compris
  T('F1 occlusion avec la vraie vue de L-A : ≤ 0,05 ms par image', async (t) => {
    const { p, S } = await essai({ mannequins: 1 });
    const cam = game.camera, L = cam.position;
    for (let k = 0; k < 200 && S.voix.length < REGLAGES_SONS.voix; k++) S.jouer3d(L.x + 2 + Math.random() * 10, L.y, L.z - 6 + Math.random() * 12, SINUS(5), { gain: 1, rayon: 30 });
    const m = jeu.mesurer(() => S._occlusions(), 300);
    jeu.quitter('balade');
    return { ok: t.temps('L-H occlusion par image, vraie vue (ms)', m.med, 0.05), attendu: '≤ 0,05 ms', obtenu: r3(m.med) + ' ms' };
  }, { apresFusion: true });
  // les éclairs à la VRAIE bouche (acteur.aff.bouche de L-C, repère `bouche` de L-W) : à 5 cm près
  T('F2 éclairs à la bouche réelle (L-C, L-W)', async () => {
    const { p, E } = await essai({ mannequins: 0, bots: 2 });
    jeu.avancer(1, { rendu: true });
    const a = p.acteurs.find((b) => !b.local), b = a.aff.bouche, k = E.ecl.k;
    p.evt('tir', { a: a.id, arme: 'fa24', ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: -1, n: 1, seq: 1 });
    E.maj(1 / 60);
    const m = new THREE.Matrix4(); E.pools.eclairs.getMatrixAt(k, m);
    const v = new THREE.Vector3().setFromMatrixPosition(m), d = Math.hypot(v.x - b.x, v.y - b.y, v.z - b.z);
    jeu.quitter('balade');
    return { ok: d <= 0.05, attendu: '≤ 5 cm', obtenu: r3(d) + ' m' };
  }, { apresFusion: true });
  // l'éclair et la douille de Haythem en vue FPS au repère de la VRAIE arme de vue (L-V : `versMonde('bouche' | 'ejection')`)
  T('F4 éclair FPS au repère de la vraie arme de vue (L-V)', async () => {
    const { p, E } = await essai({ mannequins: 0 });
    game.frame(1 / 60);
    const vm = p.aff.viewmodel, loc = p.local, k = E.ecl.k, b = vm.versMonde && vm.versMonde('bouche', new THREE.Vector3());
    const o = loc.oeil(new THREE.Vector3(), true), d = new THREE.Vector3(); game.camera.getWorldDirection(d);
    p.evt('tir', { a: loc.id, arme: 'fa24', ox: o.x, oy: o.y, oz: o.z, dx: d.x, dy: d.y, dz: d.z, n: 1, seq: 0 });
    E.maj(1 / 60);
    const m = new THREE.Matrix4(); E.pools.eclairs.getMatrixAt(k, m);
    const v = new THREE.Vector3().setFromMatrixPosition(m), e = b ? v.distanceTo(b) : Infinity;
    jeu.quitter('balade');
    return { ok: e <= 0.01, attendu: 'l’éclair à ≤ 1 cm de versMonde(« bouche »)', obtenu: b ? r3(e) + ' m' : 'pas de versMonde' };
  }, { apresFusion: true });
  // les impacts du VRAI DDA de L-A (forme et normale données) : sur 50 tirs de Haythem vers des murs, chaque décalque
  // sur sa forme (haute) et sa normale
  T('F3 impacts du vrai DDA : forme et normale de la balle', async () => {
    const { p, E } = await essai({ mannequins: 0 });
    let ok = 0, n = 0;
    const des = p.sur('impact', (e) => { if (e.forme !== null && e.forme !== undefined) ok++; n++; });
    for (let k = 0; k < 50; k++) { game.camYaw = k * 0.7; game.camPitch = -0.1 + (k % 5) * 0.08; jeu.commande(0, { tir: true }, 0.05); jeu.avancer(0.1); }
    des();
    jeu.quitter('balade');
    return { ok: n > 20 && ok === n, attendu: 'chaque impact avec sa forme', obtenu: `${ok}/${n}` };
  }, { apresFusion: true });
}
