// =====================================================================
//  L'AFFICHAGE DE LA PROGRESSION — lot L-P (vague 3, 24/10 ; spec §§ 4.1, 5.7.3) — squelette du socle S0
// =====================================================================
// Ce qu'on VOIT et ENTEND de la progression dans l'école : les ARMES AU SOL (les vrais modèles de L-W, à la 3e personne,
// couchées sur le flanc là où leur porteur est tombé ; ≤ 3 appels chacune : les trois matériaux de la 3e personne, ni ombre
// portée ni ombre de contact), la SENTINELLE (une tourelle faite à la main — trépied, socle, tête qui tourne, canon, bande
// aux couleurs de l'équipe —, son éclair et ses traceurs), le DRONE de l'équipe de Haythem (un petit quadrirotor qui tourne
// au-dessus de lui pendant ses 25 s) ; et leurs sons, synthétisés (tir de la tourelle, bourdon du drone, le gilet qu'on
// serre, une série prête, une médaille, un niveau). Abonné aux événements de la partie, lecteur de son état
// (`partie.series`, `partie.armesSol`) : les fichiers de simulation (js/jeu/series.js, js/jeu/armes_au_sol.js) n'importent
// jamais ce module (§ 5.2).
// Les règles du § 4.1 (6) : trois RACINES de scène, enfants directs de `game.scene`, `userData.dynamique` (et `horsContact` :
// pas d'ombre de contact), créées UNE fois à la première préparation (js/jeu/partie_fps.js preparer → `preparer`, AVANT la
// compilation de la scène : leurs programmes sont prêts avant la première image) ; elles restent, cachées, d'une partie à
// l'autre (les comptes de la scène ne bougent pas d'un cycle au suivant). Aucune lumière : l'éclair de la tourelle est un
// quad additif `toneMapped: false` que le bloom fait briller, comme ceux de js/jeu/effets.js.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { creerArme, MATERIAUX_ARMES } from './modeles_armes.js';
import { EQUIPES } from './constantes.js';
import { SERIES } from './series.js';
import { CAMOUFLAGES } from './profil.js';

const ARMES_SOL = ['fa24', 'pm9', 'fp12', 'tp50', 'p17'];
export const REGLAGES_AFF = { distanceSol: 45, solHaut: 0.035, sentinelles: 2, eclair: 0.05, traceur: 0.06, drone: { rayon: 1.7, hauteur: 2.25, vitesse: 0.75, sous: 0.3 },
  sons: { tir: 0.55, bourdon: 0.16, bourdonPeriode: 2.4, rayonTir: 45 } };

// ---------------------------------------------------------------- les sons (les briques de js/jeu/sons_jeu.js, recopiées et taillées)
function rafale(ctx, out, q0, buf, type, f, Q, dur, vol, att = 0.001, debut = 0, f1 = 0) {
  if (!buf || vol <= 0) return 0;
  const t0 = q0 + debut, s = ctx.createBufferSource(); s.buffer = buf;
  const fi = ctx.createBiquadFilter(); fi.type = type; fi.Q.value = Q; fi.frequency.setValueAtTime(f, t0);
  if (f1) fi.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(att, dur * 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fi); fi.connect(g); g.connect(out);
  s.start(t0, Math.random() * Math.max(0, buf.duration - dur - 0.03)); s.stop(t0 + dur + 0.02);
  return debut + dur + 0.02;
}
function ton(ctx, out, q0, type, f0, f1, dur, vol, att = 0.002, debut = 0) {
  if (vol <= 0) return 0;
  const t0 = q0 + debut, o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t0);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(att, dur * 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.02);
  return debut + dur + 0.02;
}
export const SONS_PROGRESSION = {
  // la tourelle : un claquement sec et mécanique, plus métallique qu'une arme tenue
  tir: (B) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'highpass', 2800, 0.7, 0.006, 0.9, 0.0004), rafale(ctx, out, q, B.blanc, 'bandpass', 1500, 1.1, 0.07, 0.7, 0.001),
    ton(ctx, out, q, 'square', 210, 120, 0.05, 0.18, 0.001), ton(ctx, out, q, 'sine', 95, 50, 0.09, 0.5, 0.002), rafale(ctx, out, q, B.rose, 'lowpass', 900, 0.7, 0.22, 0.25, 0.01, 0.02)),
  // le drone : un bourdon de rotors qui monte et redescend
  bourdon: () => (ctx, out, q) => Math.max(ton(ctx, out, q, 'sawtooth', 150, 175, 0.9, 0.12, 0.25), ton(ctx, out, q, 'sawtooth', 302, 340, 0.9, 0.05, 0.25), ton(ctx, out, q, 'triangle', 610, 660, 0.9, 0.03, 0.3)),
  // la tourelle posée : le trépied qui se déplie, le verrou
  pose: (B) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'bandpass', 900, 1.5, 0.18, 0.5, 0.01, 0, 2400), ton(ctx, out, q, 'square', 1200, 900, 0.03, 0.25, 0.001, 0.2),
    ton(ctx, out, q, 'triangle', 320, 260, 0.12, 0.4, 0.002, 0.22), ton(ctx, out, q, 'square', 1600, 1500, 0.02, 0.2, 0.001, 0.36)),
  // la tourelle détruite : un coup sourd et des débris
  casse: (B) => (ctx, out, q) => { let f = Math.max(ton(ctx, out, q, 'sine', 120, 40, 0.35, 0.8, 0.003), rafale(ctx, out, q, B.blanc, 'lowpass', 2500, 0.7, 0.4, 0.6, 0.002, 0, 500));
    for (let i = 0; i < 5; i++) f = Math.max(f, ton(ctx, out, q, 'triangle', 2400 + Math.random() * 1600, 0, 0.04, 0.12, 0.001, 0.05 + Math.random() * 0.4)); return f; },
  // le gilet qu'on serre : deux scratchs
  gilet: (B) => (ctx, out, q) => Math.max(rafale(ctx, out, q, B.blanc, 'highpass', 2200, 0.8, 0.16, 0.35, 0.01), rafale(ctx, out, q, B.blanc, 'highpass', 2600, 0.8, 0.14, 0.3, 0.01, 0.22),
    ton(ctx, out, q, 'sine', 90, 70, 0.12, 0.25, 0.004, 0.36)),
  // une série prête : trois notes montantes, brèves
  prete: () => (ctx, out, q) => { let f = 0; const N = [659, 880, 1175]; for (let i = 0; i < 3; i++) f = Math.max(f, ton(ctx, out, q, 'triangle', N[i], 0, 0.11, 0.32, 0.003, i * 0.07)); return f; },
  // une série lancée : un appel radio (un bip et un souffle)
  lancee: (B) => (ctx, out, q) => Math.max(ton(ctx, out, q, 'square', 1046, 0, 0.07, 0.16, 0.002), ton(ctx, out, q, 'square', 1318, 0, 0.09, 0.14, 0.002, 0.09), rafale(ctx, out, q, B.rose, 'bandpass', 1800, 0.9, 0.25, 0.08, 0.02, 0.18)),
  // une médaille : un éclat clair
  medaille: () => (ctx, out, q) => Math.max(ton(ctx, out, q, 'sine', 1568, 0, 0.18, 0.22, 0.002), ton(ctx, out, q, 'sine', 2349, 0, 0.22, 0.12, 0.002, 0.05), ton(ctx, out, q, 'triangle', 784, 0, 0.16, 0.1, 0.003)),
  // un niveau gagné : un accord majeur qui s'ouvre
  niveau: () => (ctx, out, q) => { let f = 0; const N = [523, 659, 784, 1047, 1319]; for (let i = 0; i < N.length; i++) f = Math.max(f, ton(ctx, out, q, 'triangle', N[i], 0, i === N.length - 1 ? 0.9 : 0.18, 0.3, 0.004, i * 0.085)); return f; },
  // un défi réussi
  defi: () => (ctx, out, q) => { let f = 0; const N = [784, 988, 1175, 1568]; for (let i = 0; i < 4; i++) f = Math.max(f, ton(ctx, out, q, 'sine', N[i], 0, 0.14, 0.24, 0.003, i * 0.06)); return f; },
  // une arme ramassée : le clac d'une arme qu'on empoigne
  ramasse: (B) => (ctx, out, q) => Math.max(ton(ctx, out, q, 'square', 1500, 1300, 0.015, 0.25, 0.001), rafale(ctx, out, q, B.blanc, 'bandpass', 3200, 1.2, 0.05, 0.4, 0.001, 0.01),
    ton(ctx, out, q, 'triangle', 420, 380, 0.07, 0.3, 0.002, 0.04)),
};

const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _m = new THREE.Matrix4();

export class AffProgression {
  constructor(game) {
    this.game = game; this.partie = null; this._des = []; this.t = 0; this._pret = false;
    this.sol = new Map();              // id d'arme au sol → son groupe
    this.libres = new Map();           // arme → [groupes libres]
    this.sent = new Map();             // id de sentinelle → son modèle
    this.libresSent = [];
    this.stats = { solVus: 0, sentinelles: 0, drone: false, sons: 0 };
    this._flash = []; this._traceurs = []; this._bourdonT = 0; this._angle = 0;
  }
  // (posé par js/jeu/partie_fps.js preparer, AVANT la compilation de la scène)
  preparer() {
    if (this._pret) return;
    this._pret = true;
    const S = this.game.scene, racine = (nom) => { const g = new THREE.Group(); g.name = nom; g.userData.dynamique = true; g.userData.horsContact = true; S.add(g); return g; };
    this.rSol = racine('progression : armes au sol'); this.rSent = racine('progression : sentinelles'); this.rDrone = racine('progression : drone');
    // une arme de chaque modèle d'avance (ses programmes compilés avec la scène ; les autres, faites à la demande, les partagent)
    for (const id of ARMES_SOL) this._rendre(this._arme(id));
    // les matériaux de la tourelle : ceux des armes, plus la bande des deux équipes ; l'éclair et le traceur additifs
    const std = (c) => { const m = new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 0.55 }); m.userData.partage = true; return m; };
    this.mats = { A: std(EQUIPES.A.couleur), B: std(EQUIPES.B.couleur), aucun: std('#c8ccd2'),
      eclair: new THREE.MeshBasicMaterial({ color: 0xffd08a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      led: MATERIAUX_ARMES.verre };
    this.geos = this._geometriesTourelle();
    for (let k = 0; k < REGLAGES_AFF.sentinelles; k++) this.libresSent.push(this._tourelle());
    this.drone = this._drone();
    // (tout visible le temps de la compilation : Partie.preparer compile la scène entière — compileAsync parcourt aussi le
    // caché, mais la visibilité pour la première image doit déjà être la bonne : on cache à brancher)
  }
  _arme(id) {
    const g = creerArme(id);
    g.name = 'arme au sol ' + id;
    g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });
    g.userData.armeSol = id; g.visible = false;
    this.rSol.add(g);
    return g;
  }
  _prendre(id) { const L = this.libres.get(id); return L && L.length ? L.pop() : this._arme(id); }
  _rendre(g) { g.visible = false; const id = g.userData.armeSol; if (!this.libres.has(id)) this.libres.set(id, []); this.libres.get(id).push(g); }
  // LA TOURELLE, en primitives cousues par matériau : le pied (acier : trois jambes, un mât ; polymère : le socle), la tête
  // qui tourne (polymère : le boîtier ; acier : le canon et sa bouche ; la bande de l'équipe), une diode, l'éclair
  _geometriesTourelle() {
    const B = (w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) => { const g = new THREE.BoxGeometry(w, h, d); g.applyMatrix4(_m.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), new THREE.Vector3(1, 1, 1))); return g; };
    const C = (r0, r1, h, x, y, z, rx = 0, ry = 0, rz = 0, n = 12) => { const g = new THREE.CylinderGeometry(r0, r1, h, n); g.applyMatrix4(_m.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), new THREE.Vector3(1, 1, 1))); return g; };
    // (trois jambes du haut du mât, à 0,58 m, jusqu'au sol à 0,27 m de l'axe)
    const jambes = [], haut = new THREE.Vector3(0, 0.58, 0), pied0 = new THREE.Vector3(), axe = new THREE.Vector3();
    for (let k = 0; k < 3; k++) {
      const a = k * 2 * Math.PI / 3 + Math.PI / 6;
      pied0.set(Math.sin(a) * 0.27, 0, Math.cos(a) * 0.27);
      axe.subVectors(haut, pied0); const L = axe.length(); axe.normalize();
      const g = new THREE.CylinderGeometry(0.014, 0.02, L, 6);
      g.applyMatrix4(_m.compose(_v.addVectors(haut, pied0).multiplyScalar(0.5), _q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axe), new THREE.Vector3(1, 1, 1)));
      jambes.push(g);
    }
    const mat = C(0.028, 0.028, 0.32, 0, 0.62, 0, 0, 0, 0, 8);
    const pied = mergeGeometries([...jambes, mat]);
    const socle = mergeGeometries([C(0.09, 0.11, 0.08, 0, 0.8, 0, 0, 0, 0, 14), B(0.14, 0.05, 0.1, 0, 0.86, 0.02)]);
    // la tête (son pivot à 0,95 m : l'œil de la tourelle à 1 m ; −Z = le canon)
    const boitier = mergeGeometries([B(0.24, 0.16, 0.34, 0, 0, 0.02), B(0.2, 0.05, 0.12, 0, 0.1, 0.06), B(0.06, 0.14, 0.16, 0.15, -0.02, 0.06)]);
    const canon = mergeGeometries([C(0.022, 0.022, 0.42, 0, 0.02, -0.34, Math.PI / 2, 0, 0, 10), C(0.034, 0.034, 0.08, 0, 0.02, -0.56, Math.PI / 2, 0, 0, 10),
      B(0.03, 0.05, 0.05, 0, 0.11, -0.05), B(0.05, 0.035, 0.12, 0, 0.115, 0.02)]);
    const bande = mergeGeometries([B(0.245, 0.035, 0.18, 0, 0.035, 0.08), B(0.205, 0.03, 0.03, 0, 0.13, -0.002)]);
    const led = new THREE.SphereGeometry(0.012, 8, 6); led.translate(0.08, 0.085, -0.15);
    const eclair = new THREE.PlaneGeometry(0.22, 0.22); eclair.translate(0, 0, 0);
    const traceur = new THREE.BoxGeometry(0.012, 0.012, 1); traceur.translate(0, 0, -0.5);
    return { pied, socle, boitier, canon, bande, led, eclair, traceur };
  }
  _tourelle() {
    const G = this.geos, M = this.mats, g = new THREE.Group(); g.name = 'sentinelle';
    const m = (geo, mat, p = g) => { const x = new THREE.Mesh(geo, mat); x.castShadow = false; x.receiveShadow = true; p.add(x); return x; };
    m(G.pied, MATERIAUX_ARMES.acier); m(G.socle, MATERIAUX_ARMES.polymere);
    const tete = new THREE.Group(); tete.position.y = SERIES.sentinelle.oeil - 0.05; g.add(tete);
    m(G.boitier, MATERIAUX_ARMES.polymere, tete); m(G.canon, MATERIAUX_ARMES.acier, tete);
    const bande = m(G.bande, M.aucun, tete), led = m(G.led, M.led, tete);
    // l'éclair : deux quads croisés au bout du canon ; le traceur : une barre de 1 m étirée vers l'impact
    const ec = new THREE.Group(); ec.position.set(0, 0.02, -0.62); tete.add(ec);
    const e1 = m(G.eclair, M.eclair, ec), e2 = m(G.eclair, M.eclair, ec); e2.rotation.y = Math.PI / 2; e1.receiveShadow = e2.receiveShadow = false;
    const tr = m(G.traceur, M.eclair, this.rSent); tr.receiveShadow = false; tr.visible = false;
    ec.visible = false;
    g.userData = { tete, bande, led, eclair: ec, traceur: tr, flashT: -1, traceT: -1 };
    g.visible = false;
    this.rSent.add(g);
    return g;
  }
  _drone() {
    const B = (w, h, d, x, y, z, ry = 0) => { const q = new THREE.BoxGeometry(w, h, d); q.applyMatrix4(_m.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(0, ry, 0)), new THREE.Vector3(1, 1, 1))); return q; };
    const corps = mergeGeometries([B(0.16, 0.05, 0.2, 0, 0, 0), B(0.32, 0.018, 0.026, 0, 0, 0, Math.PI / 4), B(0.32, 0.018, 0.026, 0, 0, 0, -Math.PI / 4), B(0.07, 0.035, 0.04, 0, -0.04, -0.06)]);
    const rot = new THREE.CylinderGeometry(0.075, 0.075, 0.006, 16);
    const g = new THREE.Group(); g.name = 'drone';
    const c = new THREE.Mesh(corps, MATERIAUX_ARMES.polymere); c.castShadow = false; g.add(c);
    const rotors = [];
    for (const [x, z] of [[0.113, 0.113], [-0.113, 0.113], [0.113, -0.113], [-0.113, -0.113]]) {
      const r = new THREE.Mesh(rot, this.mats.aucun); r.position.set(x, 0.022, z); r.castShadow = false; r.scale.set(1, 1, 0.25); g.add(r); rotors.push(r);
    }
    const led = new THREE.Mesh(this.geos.led, MATERIAUX_ARMES.verre); led.position.set(-0.08, -0.12, 0.15); g.add(led);
    g.userData = { rotors };
    g.visible = false;
    this.rDrone.add(g);
    return g;
  }

  // ---------------------------------------------------------------- BRANCHER (à chaque partie)
  brancher(partie) {
    this.debrancher();
    this.partie = partie; this.t = 0;
    if (!partie || !partie.series) return;
    if (!this._pret) this.preparer();
    const S = (type, fn) => this._des.push(partie.sur(type, (e) => { try { fn(e); } catch (er) { console.warn('[progression]', type, er); } }));
    const L = () => partie.local;
    S('tir', (e) => {
      if (e.arme !== 'sentinelle') return;
      const s = this.sent.get(e.a); if (s) { s.userData.flashT = this.t; s.userData.dir = [e.dx, e.dy, e.dz]; }
      this._son3d(e.ox, e.oy, e.oz, 'tir', REGLAGES_AFF.sons.tir, REGLAGES_AFF.sons.rayonTir);
    });
    S('trajet', (e) => {
      const s = this.sent.get(e.a); if (!s) return;
      const T = s.userData.traceur, d = Math.hypot(e.x - e.ox, e.y - e.oy, e.z - e.oz);
      if (d < 1) return;
      T.position.set(e.ox, e.oy, e.oz); T.lookAt(e.x, e.y, e.z); T.scale.set(1, 1, Math.min(d, 30)); T.visible = true; s.userData.traceT = this.t;
    });
    S('serie', (e) => {
      const moi = L() && e.a === L().id;
      if (e.etat === 'lancee' && e.id === 'sentinelle') this._son3d(e.x, e.y, e.z, 'pose', 0.7, 25);
      else if (e.etat === 'detruite') this._son3d(e.x, e.y, e.z, 'casse', 0.8, 40);
      if (!moi) return;
      if (e.etat === 'atteinte' && e.id) this._son2d('prete', 0.6);
      else if (e.etat === 'lancee') this._son2d(e.id === 'gilet' ? 'gilet' : 'lancee', 0.7);
    });
    S('medaille', (e) => { if (L() && e.a === L().id) this._son2d('medaille', 0.5); });
    S('arme', (e) => { if (e.ramassee && L() && e.a === L().id) this._son2d('ramasse', 0.6); });
    for (const g of this.sol.values()) this._rendre(g);
    this.sol.clear();
    for (const g of this.sent.values()) { g.visible = false; g.userData.traceur.visible = false; this.libresSent.push(g); }
    this.sent.clear();
    this.drone.visible = false;
    this._camo(partie);
  }
  // LE CAMOUFLAGE de la classe de Haythem sur SON arme de vue : la teinte de l'arme remplacée par un JUMEAU (même programme ;
  // les bots, qui portent la teinte partagée à la 3e personne, n'en héritent pas), rendue à la sortie
  _camo(partie) {
    this._sansCamo();
    const E = partie && partie.opts && partie.opts.equipement, C = E && E.camo && CAMOUFLAGES[E.camo], vm = partie && partie.aff && partie.aff.viewmodel;
    const g = C && vm && vm.armes && vm.armes[E.principale], base = g && MATERIAUX_ARMES.teinte(E.principale);
    if (!g || !base) return;
    const m = base.clone(); m.color.set(C.couleur); if (C.id === 'or') { m.metalness = 0.9; m.roughness = 0.28; }
    const L = [];
    g.traverse((o) => { if (o.isMesh && o.material === base) { L.push(o); o.material = m; } });
    this._camoPose = { base, m, L };
  }
  _sansCamo() {
    const K = this._camoPose; if (!K) return;
    for (const o of K.L) o.material = K.base;
    K.m.dispose(); this._camoPose = null;
  }
  debrancher() {
    for (const d of this._des) d(); this._des = [];
    this._sansCamo();
    if (this._pret) {
      for (const g of this.sol.values()) this._rendre(g);
      this.sol.clear();
      for (const g of this.sent.values()) { g.visible = false; g.userData.traceur.visible = false; this.libresSent.push(g); }
      this.sent.clear();
      this.drone.visible = false;
    }
    this.partie = null;
  }
  // un son de la progression (jouer : un événement de la partie, ou le HUD — un niveau, un défi)
  son(nom, gain = 0.6) { this._son2d(nom, gain); }
  _bruits() { const A = this.game.audio; return { blanc: A && A.bruitBlanc, rose: A && A.bruitRose }; }
  _son2d(nom, gain) {
    const S = this.partie && this.partie.aff && this.partie.aff.sons, R = SONS_PROGRESSION[nom];
    if (!S || !R || !S.jouer2d) return null;
    this.stats.sons++;
    return S.jouer2d(R(this._bruits()), gain);
  }
  _son3d(x, y, z, nom, gain, rayon) {
    const S = this.partie && this.partie.aff && this.partie.aff.sons, R = SONS_PROGRESSION[nom];
    if (!S || !R || !S.jouer3d) return null;
    this.stats.sons++;
    return S.jouer3d(x, y, z, R(this._bruits()), { gain, rayon, retard: true });
  }

  // ---------------------------------------------------------------- L'IMAGE
  maj(dt) {
    const P = this.partie; if (!P || !P.series || !this._pret) return;
    this.t += dt || 0;
    const cam = this.game.camera, R = REGLAGES_AFF;
    // 1. LES ARMES AU SOL : une par arme posée, couchée sur le flanc, cap de son porteur
    const L = P.armesSol ? P.armesSol.liste : [], vus = new Set();
    for (const s of L) {
      vus.add(s.id);
      let g = this.sol.get(s.id);
      if (!g) {
        g = this._prendre(s.arme); this.sol.set(s.id, g);
        g.position.set(s.x, s.y + R.solHaut, s.z);
        g.rotation.set(0, s.cap + Math.PI * 0.5, Math.PI * 0.5, 'YXZ');
        g.updateMatrixWorld(true);
      }
      g.visible = !cam || Math.hypot(cam.position.x - s.x, cam.position.y - s.y, cam.position.z - s.z) < R.distanceSol;
    }
    for (const [id, g] of this.sol) if (!vus.has(id)) { this._rendre(g); this.sol.delete(id); }
    this.stats.solVus = this.sol.size;
    // 2. LES SENTINELLES : la tête tournée comme la simulation la tient, l'éclair 0,05 s, le traceur 0,06 s
    const S = P.series.sentinelles, vuesS = new Set();
    for (const s of S) {
      vuesS.add(s.id);
      let g = this.sent.get(s.id);
      if (!g) {
        g = this.libresSent.pop() || this._tourelle(); this.sent.set(s.id, g);
        g.position.set(s.x, s.y, s.z); g.rotation.set(0, s.cap, 0);
        g.userData.bande.material = s.eq === 'A' ? this.mats.A : s.eq === 'B' ? this.mats.B : this.mats.aucun;
        g.visible = true;
      }
      const U = g.userData;
      U.tete.rotation.set(-s.tg, s.l - s.cap, 0, 'YXZ');
      U.eclair.visible = this.t - U.flashT < R.eclair;
      if (U.eclair.visible) U.eclair.rotation.z = Math.random() * Math.PI;
      if (U.traceur.visible && this.t - U.traceT > R.traceur) U.traceur.visible = false;
      // (la diode : allumée tant qu'elle a une cible)
      U.led.visible = s.cible >= 0 || Math.floor(this.t * 2) % 2 === 0;
    }
    for (const [id, g] of this.sent) if (!vuesS.has(id)) { g.visible = false; g.userData.traceur.visible = false; this.sent.delete(id); this.libresSent.push(g); }
    this.stats.sentinelles = this.sent.size;
    // 3. LE DRONE de l'équipe de Haythem : il tourne au-dessus de lui (sous le plafond), le bourdon toutes les 2,4 s
    const a = P.local, D = a ? P.series.dronesPour(a) : [], g = this.drone;
    if (D.length && a && a.corps) {
      const C = this.game.collisions, c = a.corps.posAff || a.pos, Dr = R.drone;
      this._angle += Dr.vitesse * dt;
      // (relecture : son cercle se resserre devant un mur — à 1,7 m dans un couloir de 2 m, il passait dans les murs une fois
      // sur deux : la part libre du rayon, `rayonLibre`, lissée)
      const sol = c.y, ux = Math.cos(this._angle), uz = Math.sin(this._angle), p0 = C && C.plafondEn ? C.plafondEn(c.x, c.z, sol + 0.5) : sol + 3;
      const y0 = Math.max(sol + 1.3, Math.min(sol + Dr.hauteur, (Number.isFinite(p0) ? p0 : sol + 3) - Dr.sous));
      const k = C && C.rayonLibre ? C.rayonLibre(c.x, y0, c.z, c.x + ux * Dr.rayon, y0, c.z + uz * Dr.rayon, 0.22) : 1;
      const rv = Math.max(0.2, Dr.rayon * k - 0.12);
      this._rDrone = this._rDrone === undefined || !g.visible ? rv : rv < this._rDrone ? rv : this._rDrone + (rv - this._rDrone) * Math.min(1, dt * 2);
      const x = c.x + ux * this._rDrone, z = c.z + uz * this._rDrone;
      const plaf = C && C.plafondEn ? C.plafondEn(x, z, sol + 0.5) : sol + 3;
      const y = Math.min(sol + Dr.hauteur, (Number.isFinite(plaf) ? plaf : sol + 3) - Dr.sous);
      g.position.set(x, Math.max(sol + 1.3, y), z);
      g.rotation.set(0.12 * Math.sin(this.t * 1.7), -this._angle, 0.18);
      for (const r of g.userData.rotors) r.rotation.y += 70 * dt;
      g.visible = true;
      this._bourdonT -= dt;
      if (this._bourdonT <= 0) { this._bourdonT = R.sons.bourdonPeriode; this._son3d(g.position.x, g.position.y, g.position.z, 'bourdon', R.sons.bourdon, 20); }
    } else if (g.visible) g.visible = false;
    this.stats.drone = g.visible;
  }
  // les appels de dessin d'une arme au sol (le test : ≤ 3)
  static appelsArme(g) { let n = 0; g.traverse((o) => { if (o.isMesh && o.visible !== false) n++; }); return n; }
}
