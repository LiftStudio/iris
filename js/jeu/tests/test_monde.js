// =====================================================================
//  LES TESTS DU MONDE EN PARTIE (lot L-M, 23/10 ; spec § 5.5.14, acceptation, points 1 à 14)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-M`. Les portes et leurs tables, la sortie au bit près, l'ascenseur
// coupé, les barrières de chaque zone (200 trajets vers l'extérieur), la rubalise, les portes « auto pour tous » du prop
// hunt, les pièces fermées que montrent les portes ouvertes, la carte qui suit l'acteur suivi, les nœuds permis, la rue
// bornée, les vantaux solides, les dépolis, la glace de l'accueil ; et la balade au bit près après tout cela. Contre le
// squelette de js/jeu/nav.js (le vol d'oiseau) : les trajets de test vont en ligne droite, d'un point libre à l'autre.
import * as THREE from 'three';
import { Rng } from '../rng.js';
import { PAS, ZONES_JEU, BORNES_JEU, niveauDe } from '../constantes.js';
import { TABLE_PORTES_FPS, TABLE_PORTES_PROP, TABLE_DEPOLIS, PASSAGES_PIECES, regleParDefaut } from '../monde_partie.js';
import { Pilote } from '../pilotage.js';
import { MODES } from '../index.js';
import { ASC } from '../../ecole_ascenseur.js';
import { Nav } from '../nav.js';

const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const r3 = (v) => Math.round(v * 1000) / 1000;
const sansEnfants = (o) => { const c = { ...o }; delete c.enfants; return c; };
const enfantsFixes = (g) => g.scene.children.filter((o) => !o.userData.suite).length;
const ZONES_COMBAT = ['ecole', 'rdc_rue', 'ss', 'etages'], ZONES_PROP = ['ss', 'e2', 'e1', 'rdc', 'ecole_int'];
const piecesDe = (z) => { const Z = ZONES_JEU[z]; return Z.pieces === '*' ? null : new Set(Z.pieces); };
const dans = (P, id) => (P === null ? true : !!(id && P.has(id)));

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, o) => jeu.ajouterTest('L-M', nom, fn, o);
  const C = () => game.collisions, carte = () => game.carte, Lu = () => game.carte.lumieres;
  const zoneEn = (x, y, z) => { const R = Lu().zoneEn(x, z, y + 0.1); return R ? R.id : null; };
  const stabiliser = () => { for (let i = 0; i < 120; i++) carte().maj(1 / 60, game); };
  // L'ÉCOLE AU BIT PRÈS, plus fin que instantane() : chaque forme (éteinte ou non, ses drapeaux de partie), la grille, chaque
  // porte automatique (k, côté, forme, angle des vantaux), `pilotees`, la visibilité, l'ascenseur entier, la glace, les bornes,
  // la rubalise, les enfants fixes de la scène
  const empreinteMonde = () => {
    const c = C(), Po = carte().portes, S = carte().chantier._ascenseur, vis = carte().visibilite, Mi = carte().miroirAccueil;
    let cellules = 0; for (const L of c.grille.values()) cellules += L.length;
    const B = game.user.bounds;
    return {
      formes: c.formes.length, off: c.formes.map((f) => (f.off ? 1 : 0)).join(''), partie: c.formes.filter((f) => f.vantail || f.limite || f.partie || f.depoli).length,
      cases: c.grille.size, cellules, portes: Po.instantane(), forcees: vis ? vis.forcees : 'absent',
      ascenseur: S ? { phase: S.phase, k: S.k, t: S.t, cab: S.paliers.indexOf(S.cab), paliers: S.paliers.map((P) => [P.kVu, P.vLent.position.z, P.vRapide.position.z, !!P.forme.off, P.lampe ? P.lampe.type : null]) } : null,
      miroir: Mi ? Mi.coupe : null, bornes: [B.xMin, B.xMax, B.zMin, B.zMax], rubalise: game.mondePartie && game.mondePartie.rubalise ? !!game.mondePartie.rubalise.parent : false,
      enfants: enfantsFixes(game),
    };
  };
  const essai = (opts) => jeu.lancer('essai', { graine: 1, mannequins: [], bots: 0, ...opts });
  // LES NIVEAUX de chaque pièce (ses points d'échantillon, à leur sol) : un rectangle de pièce sans hauteur maximale répond
  // aussi au-dessus d'elle — le palier du 2e en dehors de ses rectangles se lit « e1pause »
  let _niveaux = null;
  const niveauxPieces = () => {
    if (_niveaux) return _niveaux;
    _niveaux = new Map();
    for (const Z of Lu().zones) {
      const S = new Set();
      for (const r of Z.rects) for (let x = r[0] + 0.1; x < r[2]; x += 0.4) for (let z = r[1] + 0.1; z < r[3]; z += 0.4) for (const y0 of [-3.06, 0, 1.75, 3.5, 5.05, 6.6]) {
        const y = C().solEn(x, z, y0 + 0.3); if (Math.abs(y - y0) > 0.9) continue;
        if (Lu().zoneEn(x, z, y + 0.1) === Z) S.add(niveauDe(y));
      }
      _niveaux.set(Z.id, S);
    }
    return _niveaux;
  };
  // DEHORS, franchement : dans une pièce hors de la zone, de ce niveau-là, et à plus de 35 cm de toute pièce de la zone (au
  // ras d'un mur, la lecture des rectangles hésite d'une pièce à l'autre)
  const dehors = (Pz, x, y, z) => {
    const N = niveauxPieces(), n = niveauDe(y);
    for (const [dx, dz] of [[0, 0], [0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35]]) {
      const id = zoneEn(x + dx, y, z + dz);
      if (!id || dans(Pz, id) || !(N.get(id) || new Set()).has(n)) return null;
    }
    return zoneEn(x, y, z);
  };

  // 1. UNE RÈGLE PAR PORTE ; l'entrée en combat les applique ; une porte FICTIVE suit la règle par défaut
  T('1 portes : une règle chacune, entrée en combat, porte fictive', async () => {
    const Po = carte().portes, L = Po.liste();
    const sansFps = L.filter((P) => TABLE_PORTES_FPS[P.nom] === undefined).map((P) => P.nom), sansProp = L.filter((P) => TABLE_PORTES_PROP[P.nom] === undefined).map((P) => P.nom);
    const noms = new Set(L.map((P) => P.nom));
    await essai({ zone: 'ecole' });
    const M = game.partie.monde, mauvais = [];
    for (const P of L) {
      const r = M.regles.get(P.nom);
      if (!r) { mauvais.push(P.nom + ' : aucune règle'); continue; }
      if (P.etat === 'auto') {
        if (r !== 'ouverte' && r !== 'fermee') mauvais.push(P.nom + ' : ' + r);
        const k = r === 'ouverte' ? 1 : 0;
        if (P.k !== k || (P.forme && !!P.forme.off !== (r === 'ouverte'))) mauvais.push(`${P.nom} : k ${P.k}, off ${P.forme && P.forme.off} pour ${r}`);
      } else if (r !== (P.etat === 'ouverte' ? 'ouverte' : 'fermee') || (P.forme && P.forme.off)) mauvais.push(P.nom + ' : fixe ' + P.etat + ' → ' + r);
    }
    const inconnues = [...M.inconnues];
    jeu.quitter('balade');
    // la porte fictive : au milieu du hall (ses deux côtés dans la zone), automatique, inconnue des tables
    const F = { nom: 'porte fictive (test L-M)', etat: 'auto', modele: 'grise', vitree: false, double: false, g: new THREE.Group(), vantaux: [], forme: { off: false },
      cx: 14.88, cz: -3.12, rot: Math.PI / 2, cote: 1, nx: 1, nz: 0, base: 0, h: 2.04, l: 0.9, libre: null, k: 0, sens: 1 };
    F.g.name = 'porte fictive (test L-M)';
    let rc = null, rp = null, ic = false, ip = false, rd = null;
    Po.toutes.push(F); Po.auto.push(F);
    try {
      rd = [regleParDefaut(F, 'ecole', 'combat'), regleParDefaut(F, 'ecole', 'prophunt'), regleParDefaut(F, 'ss', 'combat')];
      await essai({ zone: 'ecole' });
      rc = game.partie.monde.regles.get(F.nom); ic = game.partie.monde.inconnues.includes(F.nom);
      jeu.quitter('balade');
      await essai({ zone: 'ecole_int', prop: true });
      rp = game.partie.monde.regles.get(F.nom); ip = game.partie.monde.inconnues.includes(F.nom);
      jeu.quitter('balade');
    } finally { Po.toutes.splice(Po.toutes.indexOf(F), 1); Po.auto.splice(Po.auto.indexOf(F), 1); }
    const ok = noms.size === L.length && !sansFps.length && !sansProp.length && !mauvais.length && !inconnues.length
      && rc === 'ouverte' && ic && rp === 'auto' && ip && egal(rd, ['ouverte', 'auto', 'fermee']);
    return { ok, attendu: 'noms uniques ; chaque porte dans les deux tables ; en combat k / off = sa règle ; fictive : ouverte (combat), auto (prop hunt), inconnue ; hors zone : fermée',
      obtenu: `${L.length} portes (${L.filter((P) => P.etat === 'auto').length} automatiques), ${noms.size} noms · sans règle combat [${sansFps}] prop [${sansProp}] · écarts [${mauvais.join(' ; ')}] · inconnues [${inconnues}] · fictive ${rc}/${ic} ${rp}/${ip} · défaut ${rd}` };
  });

  // 2. LA SORTIE : l'école au bit près, pour chaque zone et chaque mode
  T('2 sortie : l’école au bit près, chaque zone, chaque mode', async () => {
    const res = [];
    stabiliser();
    const ref = jeu.reference && jeu.reference[window.__chargement && window.__chargement.telephone ? 'tel' : 'pc'].instantane;
    for (const [mode, zones] of [['combat', ZONES_COMBAT], ['prop', ZONES_PROP]]) {
      for (const z of zones) {
        jeu.quitter('balade'); stabiliser();
        const a = { i: sansEnfants(jeu.instantane()), m: empreinteMonde() };
        await essai({ zone: z, prop: mode === 'prop' });
        const dedans = empreinteMonde();
        jeu.quitter('balade');
        const b = { i: sansEnfants(jeu.instantane()), m: empreinteMonde() };
        stabiliser();
        const c = sansEnfants(jeu.instantane());
        res.push({ z: mode + ':' + z, egal: egal(a, b), ref: !ref || egal(c, sansEnfants(ref)), change: dedans.partie > 0 || dedans.off !== a.m.off, d: egal(a, b) ? '' : JSON.stringify([a, b]).slice(0, 400) });
      }
    }
    const ok = res.every((r) => r.egal && r.ref && r.change);
    return { ok, attendu: 'avant / après identiques (instantane et empreinte du monde) ; instantané = la référence de a8b22dd ; la partie a bien changé le monde',
      obtenu: res.map((r) => `${r.z} ${r.egal ? '=' : '≠'}${r.ref ? '' : ' (≠ réf.)'}${r.change ? '' : ' (rien changé)'}${r.d ? ' ' + r.d : ''}`).join(' · ') };
  }, { delai: 240 });

  // 3. L'ASCENSEUR COUPÉ : 120 s de bots devant et dedans, aucun transport ; rendu à la sortie
  T('3 ascenseur : coupé en partie, rendu à la sortie', async () => {
    await essai({ zone: 'ecole' });
    const p = game.partie, S = carte().chantier._ascenseur, K = ASC.cab;
    const avant = { phase: S.phase, cab: S.cab, k: S.k }, off0 = S.paliers.map((P) => !!P.forme.off);
    // trois bots dans la cabine et devant elle au RDC, un au 1er devant sa porte ; Haythem dedans
    const xIn = (K.x0 + K.x1) / 2, zIn = -(K.y0 + K.y1) / 2, zP = -(ASC.yP0 + ASC.yP1) / 2;
    const pts = [[xIn, 0, zIn], [ASC.xF - 0.7, 0, zP], [ASC.xF - 1.2, 0, zP + 0.4], [ASC.xF - 0.7, 3.5, zP]];
    pts.forEach(([x, y, z], k) => p.ajouterActeur({ id: 60 + k, nom: 'Devant ' + k, equipe: 'B', x, y, z, lacet: -Math.PI / 2, cerveau: null }));
    jeu.teleporter(0, xIn + 0.3, 0, zIn);
    const y0 = p.acteurs.map((a) => a.pos.y);
    let transports = 0;
    for (let i = 0; i < 120 * 120; i++) {
      p.pas(PAS);
      if (i % 2) carte().maj(1 / 60, p.jeuCarte);
      if (i % 240 === 0) p.acteurs.forEach((a, j) => { if (Math.abs(a.pos.y - y0[j]) > 0.5) transports++; });
    }
    const off1 = S.paliers.map((P) => !!P.forme.off), immobile = S.phase === avant.phase && S.cab === avant.cab && S.k === 0;
    jeu.quitter('balade');
    const r = jeu.verifierAscenseur();
    const ok = transports === 0 && immobile && off1.every((v) => !v) && r.appel && r.montee && r.descente;
    return { ok, attendu: '0 transport, cabine immobile portes closes, passages allumés ; après : appel, montée, descente',
      obtenu: `${transports} transports · cabine ${S.paliers.indexOf(avant.cab)} ${avant.phase} → immobile ${immobile} · passages éteints avant ${off0} pendant ${off1} · après ${r.appel}/${r.montee}/${r.descente}` };
  }, { delai: 120 });

  // 4. LES BARRIÈRES : 200 trajets par zone vers l'extérieur (rayons 0,3 et 0,2, au sprint) → personne dehors ; la caméra et
  // les balles passent
  T('4 barrières : 200 trajets vers l’extérieur par zone ; caméra et balles passent', async () => {
    const res = [];
    for (const z of ['ss', 'e2', 'e1', 'rdc', 'rdc_rue', 'etages']) {
      const prop = !ZONES_JEU[z].modes.includes('combat');
      await essai({ zone: z, prop, humain: false, graine: 23 });
      const p = game.partie, M = p.monde, Pz = piecesDe(z), rng = new Rng(23);
      const F = M.frontieres.filter((Q) => Q.forme && dans(Pz, Q.a) !== dans(Pz, Q.b));
      // la caméra et les balles au travers des barrières des passages sans porte fermée
      let cam = 0, balles = 0, nb = 0;
      for (const Q of F) {
        if (Q.porte && M.regles.get(Q.porte.nom) === 'fermee') continue;
        nb++;
        // (le même rayon, la barrière là puis retirée le temps d'une mesure : elle ne doit rien y changer)
        let okC = true, okB = true;
        for (const u of [-0.3, 0, 0.3]) {
          const s = (Q.s0 + Q.s1) / 2 + u * (Q.s1 - Q.s0), y = Q.sol + 1.2, ax = Q.bx + Q.tx * s - Q.nx * 0.4, az = Q.bz + Q.tz * s - Q.nz * 0.4;
          const c1 = C().rayonLibre(ax, y, az, ax + Q.nx * 0.8, y, az + Q.nz * 0.8, 0), b1 = p.balistique.balle(ax, y, az, Q.nx, 0, Q.nz, 0.8, {}).t;
          Q.forme.off = true;
          const c0 = C().rayonLibre(ax, y, az, ax + Q.nx * 0.8, y, az + Q.nz * 0.8, 0), b0 = p.balistique.balle(ax, y, az, Q.nx, 0, Q.nz, 0.8, {}).t;
          Q.forme.off = false;
          if (Math.abs(c1 - c0) > 1e-9) okC = false;
          if (Math.abs(b1 - b0) > 1e-9) okB = false;
        }
        if (okC) cam++;
        if (okB) balles++;
      }
      // les marcheurs : huit à la fois, chacun d'un point libre DEDANS (1,2 à 2,5 m de la limite) vers un point DEHORS
      const marcheurs = [];
      for (let k = 0; k < 8; k++) {
        const a = p.ajouterActeur({ id: 100 + k, nom: 'Marcheur ' + k, equipe: null, x: 14.88, y: 0, z: -3.12, lacet: 0, cerveau: null });
        a.joueur.rayon = k % 2 ? 0.2 : 0.3;
        const pil = new Pilote(a, p.nav, p.balistique), m = { a, pil, cible: null };
        a.cerveau = { commande(dt, cmd) {
          cmd.ax = 0; cmd.ay = 0; cmd.amp = 0; cmd.sprint = false; cmd.saut = false;
          if (!m.cible) return;
          const q = a.corps.pos; cmd.lacet = Math.atan2(-(m.cible.x - q.x), -(m.cible.z - q.z)); cmd.tangage = 0;
          pil.allerA(m.cible.x, m.cible.y, m.cible.z, { sprint: true, arret: 0.15 }); pil.pas(dt, cmd); cmd.sprint = true;
          if (p.tick % 90 === k) cmd.saut = true;          // (et des sauts : on ne passe pas par-dessus)
        } };
        marcheurs.push(m);
      }
      let trajets = 0, nDehors = 0, departs = 0, franchies = 0;
      const sorties = new Set();
      while (trajets < 200 && F.length) {
        for (const m of marcheurs) {
          let pose = null;
          for (let essaiN = 0; essaiN < 20 && !pose; essaiN++) {
            const Q = F[rng.int(F.length)], sgn = dans(Pz, Q.a) ? -1 : 1;     // (la pièce `a` est du côté −n)
            const d = 1.2 + rng.next() * 1.3, s = Q.s0 + rng.next() * (Q.s1 - Q.s0);
            const x = Q.bx + Q.nx * sgn * d + Q.tx * s, zz = Q.bz + Q.nz * sgn * d + Q.tz * s;
            const y = C().solEn(x, zz, Q.sol + 0.6);
            if (!C().libre(x, zz, 0.32, y) || !dans(Pz, zoneEn(x, y, zz))) continue;
            const e = 1.5 + rng.next() * 1.5, s2 = Q.s0 + rng.next() * (Q.s1 - Q.s0);
            pose = { x, y, z: zz, cible: { x: Q.bx - Q.nx * sgn * e + Q.tx * s2, y: Q.sol, z: Q.bz - Q.nz * sgn * e + Q.tz * s2 }, Q, sgn };
          }
          if (!pose) continue;
          jeu.teleporter(m.a.id, pose.x, pose.y, pose.z); m.cible = pose.cible; m.Q = pose.Q; m.sgn = pose.sgn; m.sorti = false; m.franchi = false; departs++;
        }
        for (let i = 0; i < 4 * 120; i++) {
          p.pas(PAS);
          if (i % 12 === 0) for (const m of marcheurs) { const q = m.a.pos, id = dehors(Pz, q.x, q.y, q.z); if (id) { m.sorti = true; sorties.add(m.Q.cle + '→' + id + '@' + q.x.toFixed(2) + ',' + q.y.toFixed(2) + ',' + q.z.toFixed(2)); } }
          // (et la barrière elle-même : le corps passé de plus de 30 cm de l'autre côté de sa limite, en face d'elle, à son niveau)
          for (const m of marcheurs) {
            if (!m.cible) continue;
            const Q = m.Q, q = m.a.pos, dx = q.x - Q.bx, dz = q.z - Q.bz, perp = (dx * Q.nx + dz * Q.nz) * m.sgn, along = dx * Q.tx + dz * Q.tz;
            if (perp < -0.3 && along > Q.s0 - 0.1 && along < Q.s1 + 0.1 && Math.abs(q.y - Q.sol) < 1.2) m.franchi = true;
          }
        }
        for (const m of marcheurs) { if (m.cible) { trajets++; if (m.sorti) nDehors++; if (m.franchi) franchies++; } m.cible = null; }
        if (!departs) break;
      }
      jeu.quitter('balade');
      res.push({ z, F: F.length, trajets, dehors: nDehors, franchies, cam, balles, nb, sorties: [...sorties] });
    }
    const ok = res.every((r) => r.trajets >= 200 && r.dehors === 0 && r.franchies === 0 && r.cam === r.nb && r.balles === r.nb);
    return { ok, attendu: '6 zones · 200 trajets chacune · 0 dehors, 0 barrière franchie · caméra et balles passent toutes les barrières ouvertes',
      obtenu: res.map((r) => `${r.z} : ${r.F} frontières, ${r.trajets} trajets, ${r.dehors} dehors, ${r.franchies} barrières franchies${r.sorties.length ? ' [' + r.sorties.join(', ') + ']' : ''}, caméra ${r.cam}/${r.nb}, balles ${r.balles}/${r.nb}`).join(' · ') };
  }, { delai: 300 });

  // 5. LA RUBALISE : un appel de dessin ; aucun programme compilé à l'entrée
  T('5 rubalise : un appel, programmes constants à l’entrée', async (t) => {
    jeu.figerQualite(true); await jeu.qualite('moyenne');
    try {
      let n0 = null;
      await game.lancerPartie(MODES.essai, { graine: 5, mannequins: [], bots: 0, zone: 'rdc_rue' }, (e, f) => { if (e === 'Armes et effets' && f === 1) n0 = game.renderer.info.programs.length; });
      const p = game.partie, M = p.monde, R = M.rubalise;
      await jeu.images(10);
      const n1 = game.renderer.info.programs.length;
      // devant le passage du hall ouest vers l'escalier, à 2,5 m, regard sur la rubalise
      const Q = M.rubans.find((q) => q.cle === 'escalier|hallO') || M.rubans[0];
      const sgn = dans(piecesDe('rdc_rue'), Q.a) ? -1 : 1, x = Q.cx + Q.nx * sgn * 2.5, z = Q.cz + Q.nz * sgn * 2.5;
      jeu.teleporter(0, x, C().solEn(x, z, Q.sol + 0.5), z, Math.atan2(-(Q.cx - x), -(Q.cz - z)));
      game.camPitch = 0.12;
      await jeu.images(4);
      // (deux rendus de la même image, la rubalise montrée puis cachée : la différence des appels)
      const inf = game.renderer.info, rendre = () => { inf.autoReset = false; inf.reset(); game.fx.render(0); const n = inf.render.calls; inf.autoReset = true; return n; };
      rendre(); const avec = rendre();
      R.visible = false; rendre(); const sans = rendre(); R.visible = true;
      const instances = R.count, enrub = M.rubans.map((q) => q.cle);
      window.__photosLM = { ...(window.__photosLM || {}), rubalise: jeu.photo('rubalise') };
      jeu.quitter('balade');
      const ok = n0 !== null && n1 === n0 && avec - sans === 1 && instances > 0;
      return { ok, attendu: 'programmes à la fin de la préparation = après 10 images ; rubalise = 1 appel',
        obtenu: `programmes ${n0} → ${n1} · appels ${avec} avec, ${sans} sans (${instances} segments, ${enrub.length} passages enrubannés : ${enrub})` };
    } finally { jeu.figerQualite(false); }
  });

  // 6. LE PROP HUNT : une porte 'auto' s'ouvre pour n'importe quel acteur vivant à son niveau, et se referme ; déterminisme
  // avec des portes en mouvement ; etat / appliquer
  T('6 prop hunt : portes auto pour tous, déterminisme, état', async () => {
    await essai({ zone: 'rdc', prop: true, mannequins: [{ x: 13.4, y: 0, z: -5.6 }], bots: 1 });
    const p = game.partie, M = p.monde, P = carte().portes.liste().find((q) => q.nom === 'Si 0.1');
    // (tous gelés : ils ne bougent que par téléportation — le bot ne va pas ouvrir la porte de lui-même)
    for (const a of p.acteurs) a.gele = true;
    const essayer = (id, x, y, z) => {
      p.acteurs.forEach((a, i) => jeu.teleporter(a.id, 12.6 + 0.6 * i, 0, -6.6));
      for (let i = 0; i < 240; i++) p.pas(PAS);                  // tout le monde loin : refermée
      const k0 = P.k;
      jeu.teleporter(id, x, y, z);
      for (let i = 0; i < 90; i++) p.pas(PAS);
      const k1 = P.k, off1 = !!P.forme.off;
      jeu.teleporter(id, 13.2, 0, -6.6);
      for (let i = 0; i < 180; i++) p.pas(PAS);
      return { k0: r3(k0), k1: r3(k1), off1, k2: r3(P.k), off2: !!P.forme.off };
    };
    // (devant elle, côté attente : à 1,2 m ; un mort au même endroit ; un vivant 3,5 m au-dessus, au 1er)
    const xd = P.cx + P.nx * 1.2, zd = P.cz + P.nz * 1.2;
    const local = essayer(0, xd, 0, zd), mannequin = essayer(1, xd, 0, zd), bot = essayer(2, xd, 0, zd);
    const m = p.acteurParId(1); m.vivant = false;
    const mort = essayer(1, xd, 0, zd); m.vivant = true;
    const haut = essayer(1, xd, 3.5, zd);
    const pilotee = M.pilotees.includes(P);
    // etat / appliquer : portes à mi-course
    jeu.teleporter(2, xd, 0, zd); for (let i = 0; i < 20; i++) p.pas(PAS);
    const e1 = M.etat();
    jeu.quitter('balade');
    await essai({ zone: 'rdc', prop: true, mannequins: [{ x: 13.4, y: 0, z: -5.6 }], bots: 1 });
    game.partie.monde.appliquer(JSON.parse(JSON.stringify(e1)));
    const e2 = game.partie.monde.etat(), offE = carte().portes.auto.every((q) => !q.forme || !!q.forme.off === (q.k > 0.02));
    jeu.quitter('balade');
    // le déterminisme, des portes en mouvement (deux bots au cerveau minimal qui errent par les portes du RDC)
    const course = async () => {
      await essai({ zone: 'rdc', prop: true, mannequins: 3, bots: 2, graine: 42 });
      jeu.harnais.figerDegrade = true; game.partie.degrade = false;
      let bouge = 0;
      const L = game.partie.monde.pilotees;
      for (let i = 0; i < 30 * 120; i++) { game.partie.pas(PAS); if (i % 12 === 0) for (const q of L) if (q.k > 0 && q.k < 1) bouge++; }
      const e = game.partie.empreinte();
      jeu.quitter('balade'); jeu.harnais.figerDegrade = false;
      return { e, bouge };
    };
    const A = await course(), B = await course();
    const ouvre = (r) => r.k0 === 0 && r.k1 === 1 && r.off1 && r.k2 === 0 && !r.off2;
    const ok = pilotee && ouvre(local) && ouvre(mannequin) && ouvre(bot) && mort.k1 === 0 && haut.k1 === 0 && egal(e1, e2) && offE && A.e === B.e && A.bouge > 0;
    return { ok, attendu: 'pilotée ; Haythem (prop), un mannequin, un bot l’ouvrent et elle se referme ; ni un mort, ni un vivant au 1er ; etat = appliquer ; même graine → même empreinte, portes en mouvement',
      obtenu: `pilotée ${pilotee} · Haythem ${JSON.stringify(local)} · mannequin ${JSON.stringify(mannequin)} · bot ${JSON.stringify(bot)} · mort ${mort.k1} · au 1er ${haut.k1} · état ${egal(e1, e2)} (off ${offE}) · ${A.e} / ${B.e}, ${A.bouge} relevés de portes à mi-course` };
  }, { delai: 180 });

  // 7. LA VISIBILITÉ : six vues par la porte ouverte de la David Clark (pièce fermée du RDC) ; rien n'y manque (rendu avec et
  // sans le tri par zones, comparé pixel à pixel), et ≤ 60 appels de plus qu'en balade à la même pose
  T('7 visibilité : six vues aux portes ouvertes des pièces fermées', async (t) => {
    jeu.figerQualite(true); await jeu.qualite('moyenne');
    const P = carte().portes.liste().find((q) => q.nom === 'salle David Clark');
    // (les poses : du couloir C05, du hall ouest, du passage — des points libres d'où la vue entre dans la salle par la porte
    // ouverte, de 2,5 m au plus loin ; six, du plus près au plus loin ; le regard sur un point à 2 m dans la salle)
    let poses = [], cible = null;
    const cam = game.camera, inf = game.renderer.info, V = carte().visibilite.V;
    const rendre = () => {
      cam.updateMatrixWorld(); carte().visibilite.maj(0, { camera: cam });
      inf.autoReset = false; inf.reset(); game.fx.render(1 / 60); const n = inf.render.calls; inf.autoReset = true;
      return n;
    };
    const pixels = () => {
      const cv = document.createElement('canvas'), W = 320, H = 180; cv.width = W; cv.height = H;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(game.renderer.domElement, 0, 0, W, H);
      return g.getImageData(0, 0, W, H).data;
    };
    const poser = ([x, y, z]) => { cam.position.set(x, y, z); cam.lookAt(cible.x, 1.2, cible.z); };
    const mesurer = (avecTri) => {
      const sup = game.fx.superpositions.splice(0);
      try {
        return poses.map((q) => {
          poser(q); V.actif = true; rendre(); const appels = rendre(); const a = pixels();
          let diff = 0;
          if (avecTri) { V.actif = false; rendre(); rendre(); const b = pixels(); for (let i = 0; i < a.length; i += 4) if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 48) diff++; V.actif = true; }
          return { appels, diff: diff / (a.length / 4) };
        });
      } finally { game.fx.superpositions.push(...sup); V.actif = true; }
    };
    try {
      await essai({ zone: 'ecole', humain: false });
      const sg = Lu().zoneEn(P.cx + P.nx * 1.5, P.cz + P.nz * 1.5, 0.1)?.id === 'dc' ? 1 : -1;
      cible = { x: P.cx + P.nx * sg * 2, z: P.cz + P.nz * sg * 2 };
      const cands = [];
      for (let x = 1; x <= 9; x += 0.5) for (let z = -12.5; z <= -1; z += 0.5) {
        const d = Math.hypot(x - P.cx, z - P.cz);
        if (d < 2.5 || Lu().zoneEn(x, z, 0.1)?.id === 'dc' || !C().libre(x, z, 0.3, 0)) continue;
        if (C().rayonLibre(x, 1.6, z, cible.x, 1.2, cible.z, 0) >= 0.999) cands.push([x, 1.6, z, d]);
      }
      cands.sort((a, b) => a[3] - b[3]);
      poses = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => cands[Math.min(cands.length - 1, Math.round(f * (cands.length - 1)))]).filter(Boolean);
      const enPartie = mesurer(true), ouverte = P.k === 1;
      jeu.quitter('balade'); stabiliser();
      // (la glace de l'accueil, peinte en partie, l'est aussi le temps de la mesure en balade : ses rendus ne sont pas la pièce)
      const Mi = carte().miroirAccueil, c0 = Mi.coupe; Mi.coupe = true;
      let balade; try { carte().maj(0, game); balade = mesurer(false); } finally { Mi.coupe = c0; }
      const ecarts = enPartie.map((m, i) => m.appels - balade[i].appels), pires = enPartie.map((m) => m.diff);
      const ok = ouverte && poses.length === 6 && ecarts.every((d) => d <= 60) && pires.every((d) => d < 0.004);
      return { ok, attendu: 'porte ouverte ; six poses ; pixels différents avec / sans le tri < 0,4 % ; appels en partie − balade ≤ 60',
        obtenu: `ouverte ${ouverte} · ${cands.length} poses possibles, distances ${poses.map((q) => q[3].toFixed(1))} m · appels +${ecarts.join(' +')} (balade ${balade.map((m) => m.appels)}) · pixels ${pires.map((d) => (d * 100).toFixed(2) + ' %').join(' ')}` };
    } finally { jeu.figerQualite(false); }
  });

  // 8. LA CARTE VIVANTE suit l'acteur suivi, sur son niveau
  T('8 jeuCarte : la carte vivante montre le niveau de l’acteur suivi', async () => {
    await essai({ zone: 'ecole', mannequins: [{ x: 12.63, y: 3.5, z: -7.87 }] });
    const p = game.partie, m = p.acteurs.find((a) => a.id === 1);
    p.suivi = m;
    for (let i = 0; i < 40; i++) carte().maj(1 / 60, p.jeuCarte);
    const z1 = Lu().zone && Lu().zone.id, u1 = p.jeuCarte.user === m.corps;
    p.suivi = p.local;
    for (let i = 0; i < 40; i++) carte().maj(1 / 60, p.jeuCarte);
    const z0 = Lu().zone && Lu().zone.id;
    jeu.quitter('balade');
    const ok = z1 === 'e1pause' && u1 && z0 === 'hall';
    return { ok, attendu: 'suivi au 1er : e1pause ; Haythem : hall', obtenu: `suivi ${z1} (user = son corps ${u1}) · Haythem ${z0}` };
  });

  // 9. LES NŒUDS PERMIS : sur un graphe d'essai (un nœud tous les 50 cm de chaque pièce, à son sol), rien dans une pièce fermée
  // par la table, rien hors des pièces de la zone, et chaque pièce de départ servie
  T('9 noeudsAutorises : rien dans une pièce fermée, rien hors de la zone', async () => {
    const c = C(), Zs = Lu().zones, px = [], pz = [], ph = [], zo = [];
    Zs.forEach((Z, zi) => {
      for (const r of Z.rects) for (let x = r[0] + 0.25; x < r[2]; x += 0.5) for (let z = r[1] + 0.25; z < r[3]; z += 0.5) {
        for (const y0 of [-3.06, 0, 3.5, 6.6]) {
          const y = c.solEn(x, z, y0 + 0.3), R = Lu().zoneEn(x, z, y + 0.1);
          if (R !== Z || !c.libre(x, z, 0.2, y) || Math.abs(y - y0) > 1.6) continue;
          px.push(x); pz.push(z); ph.push(y); zo.push(zi); break;
        }
      }
    });
    const nav = { nb: px.length, px: Float32Array.from(px), pz: Float32Array.from(pz), ph: Float32Array.from(ph), zone: Uint8Array.from(zo), debut: new Int32Array(px.length + 1), liens: new Int32Array(0) };
    if (!game.mondePartie) { await essai({ zone: 'ecole' }); jeu.quitter('balade'); }
    const M = game.mondePartie, res = [];
    // les pièces fermées attendues : celles dont TOUS les passages de la zone passent par une porte fermée de la table
    const fermees = { combat: ['wcF', 'wcH', 'pmr', 'local', 'service'], prop: ['wcF', 'wcH', 'pmr', 'local', 'service'] };
    for (const [z, mode] of [['ecole', 'equipes'], ['rdc_rue', 'equipes'], ['ss', 'equipes'], ['etages', 'equipes'], ['e2', 'prophunt'], ['e1', 'prophunt'], ['rdc', 'prophunt'], ['ecole_int', 'prophunt']]) {
      const out = M.noeudsAutorises(nav, z, mode), Pz = piecesDe(z), vus = new Map(), fautes = new Set();
      const F = new Set(fermees[mode === 'prophunt' ? 'prop' : 'combat']);
      for (let i = 0; i < nav.nb; i++) {
        const id = Zs[nav.zone[i]].id;
        if (!out[i]) continue;
        vus.set(id, (vus.get(id) || 0) + 1);
        if (!dans(Pz, id) || F.has(id)) fautes.add(id);
      }
      const departs = Object.values(ZONES_JEU[z].departs).flat().map(([x, y, zz]) => zoneEn(x, y, zz)).filter(Boolean);
      const servis = departs.every((d) => vus.get(d) > 0);
      res.push({ z, permis: out.reduce((s, v) => s + v, 0), pieces: vus.size, fautes: [...fautes], servis });
    }
    const ok = nav.nb > 3000 && res.every((r) => !r.fautes.length && r.servis && r.permis > 0) && res[0].pieces >= 30;
    return { ok, attendu: '0 nœud dans une pièce fermée (toilettes, local, PMR, service), 0 hors des pièces de la zone, chaque départ servi',
      obtenu: `${nav.nb} nœuds d'essai · ` + res.map((r) => `${r.z} : ${r.permis} permis, ${r.pieces} pièces${r.fautes.length ? ', FAUTES ' + r.fautes : ''}${r.servis ? '' : ', départ non servi'}`).join(' · ') };
  });

  // 10. LA RUE BORNÉE, le « jour » de l'escalier sans balles, les modèles vitrés
  T('10 rue bornée, « jour » de l’escalier, modèles vitrés', async () => {
    const B0 = { ...game.user.bounds };
    await essai({ zone: 'rdc_rue', mannequins: [{ x: 11.63, y: 0, z: -4.62 }] });
    const p = game.partie, rue = game.user.bounds === BORNES_JEU && p.acteurParId(1).joueur.bounds === BORNES_JEU;
    jeu.quitter('balade');
    const rendue = egal({ ...game.user.bounds }, B0);
    await essai({ zone: 'ss' });
    const sansRue = egal({ ...game.user.bounds }, B0);
    jeu.quitter('balade');
    const jour = C().formes.filter((f) => f.t === 'b' && Math.abs(f.x0 - 2.0) < 1e-6 && f.camera === false && f.y1 === 5.2);
    const L = carte().portes.liste().filter((P) => P.forme), vitres = L.filter((P) => P.vitree), autres = L.filter((P) => !P.vitree);
    const ok = rue && rendue && sansRue && jour.length === 1 && jour[0].balle === false && vitres.length >= 6 && vitres.every((P) => P.forme.vitre === true) && autres.every((P) => !P.forme.vitre);
    return { ok, attendu: 'rue : BORNES_JEU (Haythem et bots), rendues ; sans rue : inchangées ; le jour : balle === false ; modèles vitrés : vitre === true, les autres non',
      obtenu: `rue ${rue} · rendues ${rendue} · −1 ${sansRue} · jour ${jour.length} (balle ${jour[0] && jour[0].balle}) · vitrées ${vitres.length} : ${vitres.map((P) => P.nom + (P.forme.vitre ? '' : ' NON'))} · autres vitrées ${autres.filter((P) => P.forme.vitre).length}` };
  });

  // 12. LES VANTAUX SOLIDES : 20 balles dans des vantaux ouverts du combat → arrêtées ; 20 pilotes qui les frôlent → aucune
  // traversée ; hors partie, aucune boîte de vantail
  T('12 vantaux solides : balles arrêtées, aucun pilote au travers, rien hors partie', async () => {
    await essai({ zone: 'ecole' });
    const p = game.partie, V = C().formes.filter((f) => f.vantail);
    // (les tirs : à 1 m du vantail, droit sur lui, de ses deux faces, à plusieurs hauteurs et le long de lui ; ne comptent que
    // ceux que rien d'autre n'arrête — le même tir, la boîte du vantail retirée, va plus loin que lui)
    let arretees = 0, tires = 0; const det = [];
    for (let k = 0; k < 400 && tires < 20; k++) {
      const f = V[k % V.length], nx = -f.s, nz = f.c, u = ((k * 7) % 9) / 9 - 0.45, cx = f.cx + f.c * f.hx * u * 2, cz = f.cz + f.s * f.hx * u * 2;
      const y = f.y0 + 0.4 + ((k >> 2) % 5) * 0.3, sg = (k >> 1) % 2 ? 1 : -1;
      const ox = cx + nx * sg, oz = cz + nz * sg;
      f.off = true; const sans = p.balistique.balle(ox, y, oz, -nx * sg, 0, -nz * sg, 3, {}).t; f.off = false;
      if (sans < 1.2 || !C().libre(ox, oz, 0.05, f.y0)) continue;
      tires++;
      const o = p.balistique.balle(ox, y, oz, -nx * sg, 0, -nz * sg, 3, {});
      if (o.mat !== 'rien' && Math.abs(o.t - (1 - 0.035)) < 0.03) arretees++; else det.push(`${f.porte} ${r3(o.t)}`);
    }
    // les pilotes : de 1,2 m d'un côté à 1,2 m de l'autre, au travers du milieu du vantail
    const a = p.ajouterActeur({ id: 90, nom: 'Frôleur', equipe: 'B', x: 14.88, y: 0, z: -3.12, lacet: 0, cerveau: null });
    const pil = new Pilote(a, p.nav, p.balistique); let cible = null;
    a.cerveau = { commande(dt, cmd) { cmd.ax = cmd.ay = cmd.amp = 0; cmd.sprint = false; if (!cible) return; const q = a.pos; cmd.lacet = Math.atan2(-(cible.x - q.x), -(cible.z - q.z)); pil.allerA(cible.x, cible.y, cible.z, { sprint: true }); pil.pas(dt, cmd); } };
    let traversees = 0, trajets = 0;
    for (let k = 0; k < 20; k++) {
      const f = V[k % V.length], nx = -f.s, nz = f.c, u = ((k * 3) % 7) / 7 - 0.43, cx = f.cx + f.c * f.hx * u, cz = f.cz + f.s * f.hx * u;
      const sg = C().libre(cx + nx * 1.2, cz + nz * 1.2, 0.3, f.y0) ? 1 : -1;
      jeu.teleporter(90, cx + nx * 1.2 * sg, f.y0, cz + nz * 1.2 * sg);
      cible = { x: cx - nx * 1.2 * sg, y: f.y0, z: cz - nz * 1.2 * sg };
      // (une traversée : le pas qui fait changer de côté le corps EN FACE du vantail — le contourner par son bord libre n'en
      // est pas une)
      let passe = false, pp = null;
      for (let i = 0; i < 360; i++) {
        p.pas(PAS);
        const q = a.pos, dx = q.x - f.cx, dz = q.z - f.cz, along = dx * f.c + dz * f.s, perp = dx * nx + dz * nz;
        if (pp && Math.sign(perp) !== Math.sign(pp.perp) && pp.perp !== 0) {
          const w = pp.perp / (pp.perp - perp), at = pp.along + w * (along - pp.along);
          if (Math.abs(at) < f.hx) passe = true;
        }
        pp = { along, perp };
      }
      trajets++; if (passe) traversees++;
      cible = null;
    }
    const nV = V.length;
    jeu.quitter('balade');
    const hors = C().formes.filter((f) => f.vantail || f.limite || f.partie).length;
    const ref = jeu.reference && jeu.reference[window.__chargement && window.__chargement.telephone ? 'tel' : 'pc'].instantane;
    stabiliser();
    const inst = !ref || egal(sansEnfants(jeu.instantane()), sansEnfants(ref));
    const ok = nV > 0 && tires === 20 && arretees === 20 && traversees === 0 && hors === 0 && inst;
    return { ok, attendu: '20 balles arrêtées sur le vantail ; 0 traversée sur 20 trajets ; hors partie 0 boîte de partie, instantané = la référence',
      obtenu: `${nV} vantaux solides · ${arretees}/${tires} arrêtées${det.length ? ' [' + det.join(', ') + ']' : ''} · ${traversees}/${trajets} traversées · hors partie ${hors} · instantané ${inst}` };
  });

  // 13. LES DÉPOLIS : la table trouvée au monde solide, le drapeau sur elles seules en partie, nulle part hors partie
  T('13 dépolis : la table trouvée, le drapeau en partie seulement', async () => {
    await essai({ zone: 'ecole' });
    const M = game.partie.monde, en = C().formes.filter((f) => f.depoli), justes = en.length === M.depolis.length && en.every((f) => M.depolis.includes(f) && f.vitre);
    const absents = M.depolisAbsents.length;
    jeu.quitter('balade');
    const hors = C().formes.filter((f) => f.depoli).length;
    const ok = TABLE_DEPOLIS.length > 0 && absents === 0 && justes && M.depolis.length === TABLE_DEPOLIS.length && hors === 0;
    return { ok, attendu: 'table non vide, chaque entrée trouvée (forme vitre à ± 5 cm), `depoli` sur elles seules, 0 hors partie',
      obtenu: `${TABLE_DEPOLIS.length} entrées, ${M.depolis.length} trouvées, ${absents} absentes · en partie ${en.length} (justes ${justes}) · hors partie ${hors}` };
  });

  // 14. LA GLACE DE L'ACCUEIL : peinte en partie (son décor n'est plus redessiné), rendue à la sortie
  T('14 glace de l’accueil : peinte en partie, rendue à la sortie', async () => {
    jeu.figerQualite(true); await jeu.qualite('haute');
    const Mi = window.__miroirAccueil, E = Mi.etat, coupe0 = E.coupe, cam = game.camera;
    const n = new THREE.Vector3(0, 0, 1).transformDirection(Mi.m.matrixWorld), c = Mi.m.position;
    const parcours = (jeuCarte) => {
      const r0 = E.rendus;
      for (let i = 0; i < 60; i++) {
        const lat = (i % 2 ? 0.15 : -0.15);
        cam.position.set(c.x + n.x * 3 - n.z * lat, 1.6, c.z + n.z * 3 + n.x * lat); cam.lookAt(c.x, 1.6, c.z); cam.updateMatrixWorld();
        carte().maj(1 / 60, jeuCarte); game.fx.render(1 / 60);
      }
      return E.rendus - r0;
    };
    try {
      stabiliser();
      const balade = parcours(game);
      await essai({ zone: 'ecole' });
      const coupeEn = E.coupe, partie = parcours(game.partie.jeuCarte);
      jeu.quitter('balade');
      const coupe1 = E.coupe;
      const ok = coupeEn === true && partie === 0 && balade > 0 && coupe1 === coupe0;
      return { ok, attendu: 'coupe vrai en partie, 0 rendu de la glace en 60 images à 30 cm ; en balade > 0 ; rendue à sa valeur',
        obtenu: `coupe ${coupe0} → ${coupeEn} → ${coupe1} · rendus en balade ${balade}, en partie ${partie}` };
    } finally { jeu.figerQualite(false); }
  });

  // 11. LA BALADE AU BIT PRÈS (L-M touche quatre fichiers de carte), après toutes ces parties ; les 346 sièges
  T('11 balade au bit près, 346 sièges', async () => {
    const r = await jeu.rejouerBalade(), s = await jeu.verifierSieges();
    const ok = r.ok && s.total === 346 && s.assis === 346 && !s.refus.length;
    return { ok, attendu: 'écarts ≤ seuils, vue 3 et vue 1 ; 346 assis sur 346',
      obtenu: `vue 3 ${r.vue3.pos.toExponential(1)} / ${r.vue3.cam.toExponential(1)} · vue 1 ${r.vue1.pos.toExponential(1)} / ${r.vue1.cam.toExponential(1)} · même onglet ${r.identiques} · sièges ${s.assis}/${s.total} (refus ${s.refus})` };
  }, { delai: 180 });

  // ---------------------------------------------------------------- À F2 (les vrais modules des autres lots)
  // le vrai graphe (L-D) restreint : aucun nœud dans une pièce fermée ; et généré avec les vantaux du combat (avecVantaux)
  T('F2 · graphe restreint : aucun nœud dans une pièce fermée, vantaux contournés', async () => {
    const nav = await Nav.obtenir(game, {});
    if (!game.mondePartie) { await essai({ zone: 'ecole' }); jeu.quitter('balade'); }
    const M = game.mondePartie, out = M.noeudsAutorises(nav, 'ecole', 'equipes'), Zs = Lu().zones, F = new Set(['wcF', 'wcH', 'pmr', 'local', 'service']);
    let fautes = 0;
    for (let i = 0; i < nav.nb; i++) if (out[i] && nav.zone[i] !== 255 && F.has(Zs[nav.zone[i]].id)) fautes++;
    // aucun nœud du graphe DANS une boîte de vantail ouvert
    let dansVantail = 0;
    M.avecVantaux(() => { for (let i = 0; i < nav.nb; i++) if (!C().libre(nav.px[i], nav.pz[i], 0.25, nav.ph[i])) dansVantail++; });
    return { ok: nav.nb > 5000 && fautes === 0 && dansVantail === 0, attendu: '0 nœud permis dans une pièce fermée ; 0 nœud dans un vantail ouvert', obtenu: `${nav.nb} nœuds · ${fautes} fautes · ${dansVantail} dans un vantail` };
  }, { apresFusion: true });
  // la vraie balistique (L-A) : la forme touchée est le vantail ; la vue s'arrête sur un dépoli, la balle le traverse
  T('F2 · balistique : vantail touché, dépoli opaque à la vue', async () => {
    await essai({ zone: 'ecole' });
    const p = game.partie, M = p.monde, V = C().formes.filter((f) => f.vantail);
    let vantail = 0;
    for (const f of V.slice(0, 10)) { const nx = -f.s, nz = f.c, sg = C().libre(f.cx + nx, f.cz + nz, 0.1, f.y0) ? 1 : -1; const o = p.balistique.balle(f.cx + nx * sg, f.y0 + 1.2, f.cz + nz * sg, -nx * sg, 0, -nz * sg, 3, {}); if (o.forme && o.forme.vantail) vantail++; }
    let opaques = 0, traverses = 0;
    for (const f of M.depolis) {
      const cx = (f.bx0 + f.bx1) / 2, cz = (f.bz0 + f.bz1) / 2, y = Math.min(f.y1 - 0.1, Math.max(f.y0 + 0.1, (f.y0 + f.y1) / 2)), lx = f.bx1 - f.bx0, lz = f.bz1 - f.bz0;
      const nx = lx < lz ? 1 : 0, nz = lx < lz ? 0 : 1;
      if (!p.balistique.vue(cx - nx * 0.6, y, cz - nz * 0.6, cx + nx * 0.6, y, cz + nz * 0.6)) opaques++;
      const o = p.balistique.balle(cx - nx * 0.6, y, cz - nz * 0.6, nx, 0, nz, 1.2, {});
      if (o.vitre || o.t > 0.65) traverses++;
    }
    jeu.quitter('balade');
    return { ok: vantail === Math.min(10, V.length) && opaques === M.depolis.length && traverses === M.depolis.length, attendu: 'balle → forme.vantail ; vue arrêtée par chaque dépoli, balle qui le traverse',
      obtenu: `${vantail}/${Math.min(10, V.length)} vantaux · ${opaques}/${M.depolis.length} dépolis opaques · ${traverses} traversés` };
  }, { apresFusion: true });
}
