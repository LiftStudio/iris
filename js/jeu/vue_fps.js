// =====================================================================
//  LA VUE À LA 1re PERSONNE — lot L-B (23/10), sur le squelette du socle S0 (22/10) ; vague 3 : L-Q
// =====================================================================
// La caméra du jeu posée DIRECTEMENT à chaque image (spec § 3.2) : aucun lissage du regard — le geste de souris arrive à
// l'écran à l'image suivante. Rotation `(−(tangage − 0,15·reculV·DEG), lacet − 0,15·reculH·DEG, roulis, 'YXZ')`, lacet /
// tangage = game.camYaw / camPitch (tangage > 0 = regard vers le BAS : un cabré de l'arme fait regarder vers le HAUT en
// DIMINUANT le tangage) ; le recul de VISÉE n'est jamais posé ici (une fois par image : il dépendrait de la cadence) :
// lireCommande le consomme au pas. La position : l'œil LISSÉ que la simulation calcule à chaque pas (js/jeu/mouvement.js :
// les volées et les bordures adoucies, l'accroupi, la glissade, le saut, l'arc du franchissement), INTERPOLÉ comme le corps
// (la même fraction de pas que Game.interpoler), à la position affichée. Par-dessus, l'AFFICHAGE seulement :
//   - le BALANCEMENT (petit : c'est l'arme qui bouge) — fréquence 1,15 + 0,35·v Hz, 1,0 cm vertical en course, 1,8 en sprint,
//     0,6 cm latéral, 0,4° de roulis, × 0,1 en visée, nul à l'arrêt ;
//   - le ROULIS : 4° en glissade (vers la main faible), 1,5° en sprint tactique, lissés ;
//   - le CHAMP : `controls.fps.champ` (horizontal 16:9), + 5° en sprint hors visée, + 4° en glissade, lissés 0,15 s ; la VISÉE
//     zoome sur la tangente (P-17 × 1,10 · PM-9 × 1,15 · FA-24 × 1,25 · FP-12 × 1,10 · TP-50 × 4), courbe 1 − (1 − t)³ ; la
//     sensibilité suit la focale (`souris()` : tan(champV_ADS/2) / tan(champV_hanche/2) × sensVisee) ;
//   - le RECUL VISUEL (15 % du cabré de l'arme), l'IMPULSION d'une touche reçue (1,2° × dégâts/30, rendue en 0,18 s), la
//     SECOUSSE d'une explosion proche (0,06 → 0 en 0,5 s, ∝ 1 − d/8 ; réglage `secousses`), le CREUX de la réception (−3 cm,
//     ressort ω 22, ζ 0,7) ;
//   - la LUNETTE du TP-50 : le même balancement en huit que la commande (js/jeu/entrees_jeu.js), à l'heure affichée ;
//   - la CAMÉRA DE MORT (3 s) : l'œil tombe à 0,4 m en 0,8 s, roulis de 25°, puis la vue se tourne vers le tueur ;
//   - l'œil toujours à 0,10 m au moins sous le plafond.
// Le corps local est caché ; l'arme de vue est une SUPERPOSITION (js/fx.js PasseSuperposee). Sur la flash reçue, `fx.flash = 1`
// (l'appoint de l'étalonnage : l'aveuglement visible est le calque #voile-flash du HUD, L-G, piloté par partie.hud.aveugle).
import * as THREE from 'three';
import { PAS } from './constantes.js';
import { etatEntrees, ENTREES } from './entrees_jeu.js';

const DEG = Math.PI / 180, CHAMP_H_MAX = 108;
export const VUE = {
  balancement: { f0: 1.15, fv: 0.35, course: 0.010, sprint: 0.018, lateral: 0.006, roulis: 0.4, visee: 0.1, vCourse: 5.0, lisse: 0.12 },
  roulis: { glisse: 4, tact: 1.5, lisse: 0.08 },
  champ: { sprint: 5, glisse: 4, lisse: 0.05 },                     // (τ 0,05 s : 95 % en 0,15 s)
  recul: 0.15,
  reception: { creux: 0.03, omega: 22, zeta: 0.7, chute: 0.3 },
  impulsion: { deg: 1.2, parDegats: 30, retour: 0.18 },
  secousse: { amp: 0.06, distance: 8, duree: 0.5 },
  mort: { roulis: 25, oeil: 0.4, chute: 0.8, tourne: 0.9, avantTourne: 0.3, duree: 3 },
  plafond: 0.10,
  souris: 0.0025,
};
const _v = new THREE.Vector3(), _e = new THREE.Euler();
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
// (la vitesse du ressort du creux de réception qui le fait descendre à −3 cm : pic d'une impulsion dans un ressort amorti)
const vCreux = (() => { const { omega: w, zeta: z, creux } = VUE.reception, wd = w * Math.sqrt(1 - z * z), tp = Math.atan2(wd, z * w) / wd;
  return creux / (Math.exp(-z * w * tp) * Math.sin(wd * tp) / wd); })();

export class VueFPS {
  constructor(game) {
    this.game = game; this.acteur = null; this._sup = null; this._des = []; this._mort = null;
    this._champV = 0; this._champH = 0; this._roulis = 0; this._balA = 0; this._balPhi = 0; this._bob = { y: 0, lat: 0, roulis: 0 };
    this._creux = { x: 0, v: 0 }; this._imp = []; this._sec = null; this._tAff = 0; this._tirs = 0; this._tirFront = false;
    this._l = NaN; this._p = NaN; this._lV = 0; this._pV = 0;
  }
  // le champ VERTICAL (degrés) pour un champ horizontal `champ` en 16:9, plafonné à 108° d'horizontal sur un écran large
  champVPour(champ, aspect) {
    let v = 2 * Math.atan(Math.tan(champ / 2 * DEG) / (16 / 9)) / DEG;
    const h = 2 * Math.atan(Math.tan(v / 2 * DEG) * (aspect || 16 / 9)) / DEG;
    if (h > CHAMP_H_MAX) v = 2 * Math.atan(Math.tan(CHAMP_H_MAX / 2 * DEG) / (aspect || 16 / 9)) / DEG;
    return v;
  }
  _reglages() { const s = this.game.settings; return (s && s.controls && s.controls.fps) || {}; }
  // le champ vertical de la HANCHE (le réglage, sans le sprint ni la visée)
  get champHanche() { return this.champVPour(this._reglages().champ || 90, this.game.camera.aspect); }
  // le champ vertical COURANT (visée et élargissements compris) : celui que le réticule doit dire (L-G)
  get champV() { return this._champV || this.champHanche; }
  // le zoom de visée courant (sur la tangente) et la part de visée (courbe 1 − (1 − t)³)
  _zoomDe(a) {
    const A = a && a.arsenal, f = A && A.arme, vk = A && Number.isFinite(A.visee) ? A.visee : 0;
    const e = 1 - Math.pow(1 - clamp(vk, 0, 1), 3), z = (f && f.zoom) || 1;
    return { zoom: 1 + (z - 1) * e, e };
  }
  // LA SENSIBILITÉ DE LA SOURIS (rad/px, les mêmes sur les deux axes) : 0,0025 × sens, et en visée la focale — tan(champV_ADS/2)
  // / tan(champV_hanche/2) × sensVisee (la cible glisse à la même vitesse à l'écran quel que soit le zoom). Posée sur la
  // partie : Partie.souris, que lit js/game.js _onMove, délègue ici (F2).
  souris() {
    const F = this._reglages(), sens = F.sens ?? 0.45, sv = F.sensVisee ?? 1;
    const { zoom, e } = this._zoomDe(this.acteur);
    const k = VUE.souris * sens * (1 / zoom) * (1 + (sv - 1) * e);
    return [k, k];
  }
  entrer(acteur) {
    this.sortir();
    this.acteur = acteur; this._mort = null; this._champV = 0; this._roulis = 0; this._balA = 0; this._creux.x = 0; this._creux.v = 0;
    this._imp = []; this._sec = null; this._l = NaN; this._p = NaN; this._champH = 0;
    const g = this.game, P = acteur.partie, vm = P && P.aff && P.aff.viewmodel;
    if (vm && vm.superposition && g.fx && g.fx.superpositions && !g.fx.superpositions.includes(vm.superposition)) {
      this._sup = vm.superposition; g.fx.superpositions.push(this._sup);
    }
    if (P) {
      const id = acteur.id;
      // la flash reçue : l'appoint de l'étalonnage (le calque blanc #voile-flash est au HUD, L-G)
      this._des.push(P.sur('flash', (e) => { if (e.cible === id && g.fx) g.fx.flash = 1; }));
      this._des.push(P.sur('tir', (e) => { if (e.a === id) this._tirs++; }));
      // une touche reçue : l'impulsion (vers le haut, et du côté opposé au tireur)
      this._des.push(P.sur('touche', (e) => {
        if (e.cible !== id || !(e.degats > 0)) return;
        const amp = VUE.impulsion.deg * DEG * Math.min(2, e.degats / VUE.impulsion.parDegats);
        const l = g.camYaw, fx = -Math.sin(l), fz = -Math.cos(l), cote = Math.sign(fx * (e.dz || 0) - fz * (e.dx || 0)) || 1;
        this.impulsion(-amp * 0.8, amp * 0.6 * cote);
      }));
      // une explosion proche : la secousse (∝ 1 − d/8)
      this._des.push(P.sur('explosion', (e) => {
        const c = acteur.corps; if (!c) return;
        const d = Math.hypot(e.x - c.pos.x, e.y - (c.pos.y + 1), e.z - c.pos.z);
        if (d < VUE.secousse.distance) this.secousse(VUE.secousse.amp * (1 - d / VUE.secousse.distance), VUE.secousse.duree);
      }));
      // la réception d'une chute : le creux de −3 cm
      this._des.push(P.sur('reception', (e) => { if (e.a === id && (e.chute || 0) > VUE.reception.chute) this._creux.v = -vCreux; }));
      // (F2 : la sensibilité de la visée qui suit la focale — Partie.souris délègue à VueFPS.souris, demande de L-B : plus de
      // pose sur l'instance)
    }
    this._cacher();
  }
  sortir() {
    const g = this.game;
    if (this._sup && g.fx && g.fx.superpositions) { const i = g.fx.superpositions.indexOf(this._sup); if (i >= 0) g.fx.superpositions.splice(i, 1); }
    this._sup = null;
    for (const d of this._des) d(); this._des = [];
    const j = this.acteur && this.acteur.joueur;
    if (j && j.mesh) { j.mesh.visible = true; j.vuePremiere = false; }
    if (this.acteur) g.camera.rotation.reorder('XYZ');
    this.acteur = null; this._mort = null;
  }
  _cacher() {
    const j = this.acteur && this.acteur.joueur;
    if (j && j.mesh) { j.mesh.visible = false; j.vuePremiere = false; }
  }
  // l'œil (simulé, lissé) interpolé à cette image : y absolu
  _oeilY(a) {
    const P = a.partie, M = a.mvt, g = this.game;
    const af = clamp((g.acc || 0) / PAS, 0, 1);
    if (M && M.tickOeil === P.tick && Number.isFinite(M.yOeil) && Number.isFinite(M.yOeilPrec)) return M.yOeilPrec + (M.yOeil - M.yOeilPrec) * af;
    a.oeil(_v, true); return _v.y;
  }
  // `poser` : d'emblée (le regard n'est jamais lissé ; les ressorts de l'affichage repartent de zéro)
  poser(dt, poser = false) {
    const g = this.game, a = this.acteur, cam = g.camera;
    if (!a || !a.corps) return false;
    this._cacher();
    const P = a.partie, c = a.corps, F = this._reglages(), C = g.collisions;
    const d = dt > 0 ? Math.min(dt, 0.1) : 0;
    this._tAff += d;
    // le tir de cette image (l'arme de vue le lit dans etatArme)
    this._tirFront = this._tirs > 0; this._tirs = 0;
    // ---- la position : l'œil lissé, à la position affichée ----
    let x = c.posAff.x, z = c.posAff.z, y = this._oeilY(a);
    const pieds = Number.isFinite(c.solAff) ? c.solAff : c.pos.y;
    // ---- le regard ----
    let l = g.camYaw, t = g.camPitch, roulis = 0;
    // (la vitesse angulaire du regard : l'inertie de l'arme de vue)
    if (d > 0 && Number.isFinite(this._l)) { this._lV = angle(l - this._l) / d; this._pV = (t - this._p) / d; } else if (poser) { this._lV = 0; this._pV = 0; }
    this._l = l; this._p = t;
    // la lunette du TP-50 : le balancement en huit de la commande, à l'heure affichée (celle de Game.interpoler : du pas d'avant,
    // fraction 0, au dernier pas, fraction 1 — où il vaut exactement celui de la commande, d'où partent les balles)
    const E = etatEntrees(P);
    if (E.lunette > 0) {
      const tt = P.t + (clamp((g.acc || 0) / PAS, 0, 1) - 1) * PAS, L = ENTREES.lunette, w = 2 * Math.PI * L.freq, amp = L.ampDeg * DEG * E.mult * E.lunette;
      l += amp * Math.sin(w * tt); t += amp * 0.5 * Math.sin(2 * w * tt);
    }
    // ---- l'allure : balancement, roulis, champ ----
    const al = a.allure || 'arret', v = Math.hypot(c.vel.x, c.vel.z);
    const { zoom, e } = this._zoomDe(a);
    const B = VUE.balancement;
    const sprint = al === 'sprint' || al === 'tact';
    const cibleA = sprint ? B.sprint : al === 'course' || al === 'marche' || al === 'accroupi' ? B.course * Math.min(1, v / B.vCourse) : 0;
    this._balA = poser ? cibleA : this._balA + (cibleA - this._balA) * (1 - Math.exp(-d / B.lisse));
    if (cibleA === 0 && this._balA < 1e-5) this._balA = 0;
    const f = B.f0 + B.fv * v;
    this._balPhi = (this._balPhi + 2 * Math.PI * f * d) % (4 * Math.PI);
    const kv = 1 + (B.visee - 1) * e, kl = Math.min(1, this._balA / B.course);
    const by = this._balA * kv * Math.sin(this._balPhi), blat = B.lateral * kl * kv * Math.sin(this._balPhi / 2), brl = B.roulis * DEG * kl * kv * Math.sin(this._balPhi / 2);
    this._bob.y = by; this._bob.lat = blat; this._bob.roulis = brl;
    y += by; x += Math.cos(l) * blat; z += -Math.sin(l) * blat;
    const R = VUE.roulis;
    const cibleR = (a.glisse || 0) * R.glisse * DEG + (al === 'tact' ? R.tact * DEG : 0);
    this._roulis = poser ? cibleR : this._roulis + (cibleR - this._roulis) * (1 - Math.exp(-d / R.lisse));
    roulis += this._roulis + brl;
    // le champ : + 5° en sprint (hors visée), + 4° en glissade
    const H = F.champ || 90, cibleH = H + (sprint ? VUE.champ.sprint * (1 - e) : 0) + (a.glisse || 0) * VUE.champ.glisse;
    this._champH = poser || !this._champH ? cibleH : this._champH + (cibleH - this._champH) * (1 - Math.exp(-d / VUE.champ.lisse));
    // ---- les ressorts de l'affichage : creux de réception, impulsions, secousse ----
    if (d > 0) {
      const { omega: w, zeta: zt } = VUE.reception, Cx = this._creux, n = Math.max(1, Math.ceil(d / (1 / 240))), h = d / n;
      for (let i = 0; i < n; i++) { Cx.v += (-w * w * Cx.x - 2 * zt * w * Cx.v) * h; Cx.x += Cx.v * h; }
    }
    if (poser) { this._creux.x = 0; this._creux.v = 0; }
    y += this._creux.x;
    let iT = 0, iL = 0;
    const wI = 5.8 / VUE.impulsion.retour;
    this._imp = this._imp.filter((I) => { I.t += d; const k = (1 + wI * I.t) * Math.exp(-wI * I.t); iT += I.dT * k; iL += I.dL * k; return I.t < VUE.impulsion.retour * 1.5; });
    if (this._sec) {
      const S = this._sec; S.t += d;
      const k = Math.max(0, 1 - S.t / S.dur), am = S.amp * k * k * (F.secousses ?? 1), u = this._tAff;
      x += Math.sin(u * 61.3) * am; y += Math.sin(u * 47.7 + 1.3) * am; z += Math.cos(u * 53.1) * am * 0.5;
      if (k <= 0) this._sec = null;
    }
    // ---- LA CAMÉRA DE MORT : l'œil tombe à 0,4 m en 0,8 s, roulis de 25°, puis la vue se tourne vers le tueur ----
    if (this._mort) {
      const D = VUE.mort, Mo = this._mort, ts = P.t - Mo.t;
      if (a.vivant && ts > 0.1) this._mort = null;
      else {
        if (!Number.isFinite(Mo.y0)) { Mo.y0 = y; Mo.l0 = l; Mo.p0 = t; }
        const k = clamp(ts / D.chute, 0, 1), ek = 1 - (1 - k) * (1 - k);
        y = Mo.y0 + (pieds + D.oeil - Mo.y0) * ek; roulis = D.roulis * DEG * ek * Mo.sens;
        l = Mo.l0; t = Mo.p0;
        const T = Mo.tueur >= 0 && Mo.tueur !== a.id ? P.acteurParId(Mo.tueur) : null;
        if (T && T.corps) {
          const q = T.corps.posAff || T.corps.pos, hx = q.x - x, hz = q.z - z, hy = (T.corps.solAff ?? q.y) + 1.5 - y;
          const lT = Math.atan2(-hx, -hz), pT = Math.atan2(-hy, Math.hypot(hx, hz));
          const kt = clamp((ts - D.avantTourne) / D.tourne, 0, 1), et = kt * kt * (3 - 2 * kt);
          l = Mo.l0 + angle(lT - Mo.l0) * et; t = Mo.p0 + (pT - Mo.p0) * et;
        }
        this._balA = 0;
      }
    }
    // ---- l'œil sous le plafond ----
    if (C) { const plaf = C.plafondEn(x, z, pieds); if (y > plaf - VUE.plafond) y = plaf - VUE.plafond; }
    cam.position.set(x, y, z);
    const A = a.arsenal, rv = A ? A.reculV : 0, rh = A ? A.reculH : 0;
    cam.rotation.set(-(t - VUE.recul * rv * DEG + iT), l - VUE.recul * rh * DEG + iL, roulis, 'YXZ');
    // ---- le champ : celui de la hanche élargi, puis la visée sur la tangente ----
    const vH = this.champVPour(this._champH, cam.aspect);
    const fov = 2 * Math.atan(Math.tan(vH / 2 * DEG) / zoom) / DEG;
    this._champV = fov;
    if (Math.abs(fov - cam.fov) > 1e-6) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld();
    return true;
  }
  // une impulsion du regard AFFICHÉ (radians ; une touche reçue), rendue en 0,18 s
  impulsion(dTangage, dLacet) { this._imp.push({ dT: dTangage || 0, dL: dLacet || 0, t: 0 }); if (this._imp.length > 8) this._imp.shift(); }
  // une secousse (une explosion) : `amp` en mètres, `dur` en secondes ; la plus forte des deux l'emporte
  secousse(amp, dur) {
    const S = this._sec, reste = S ? S.amp * Math.max(0, 1 - S.t / S.dur) : 0;
    if (amp >= reste) this._sec = { amp, dur: dur || 0.4, t: 0 };
  }
  // LA CAMÉRA DE MORT (3 s) : appelée sur l'élimination de l'acteur local (Partie._elimVue)
  mort(tueurId) {
    if (!this.acteur) return;
    const P = this.acteur.partie;
    this._mort = { t: P.t, tueur: tueurId ?? -1, y0: NaN, l0: NaN, p0: NaN, sens: ((tueurId | 0) + this.acteur.id) % 2 ? -1 : 1 };
  }
  // ce que l'arme de vue lit (L-V) : l'état de l'arsenal et du corps, jamais une règle (champs du § 4.5.7, et en plus :
  // `franchit` 0..1, `reception` (le creux, m), `phase` / `frequence` / `balancement` (le pas de la caméra), `allure`,
  // `lateral` (la vitesse de côté, m/s, pour le pas chassé), `lunette` 0..1, `souffle`)
  etatArme() {
    const a = this.acteur, A = a && a.arsenal, c = a && a.corps, M = a && a.mvt, al = (a && a.allure) || 'arret';
    let lat = 0;
    if (c) { const l = this.game.camYaw; lat = c.vel.x * Math.cos(l) - c.vel.z * Math.sin(l); }
    const E = a ? etatEntrees(a.partie) : null;
    return { arme: A && A.arme ? A.arme.id : null, etatArme: A ? A.etatArme : 'pret', tEtat: A ? A.tEtat : 0, visee: A ? A.visee : 0,
      tirFront: this._tirFront, reculV: A ? A.reculV : 0, reculH: A ? A.reculH : 0, sprint: al === 'sprint' || al === 'tact', sprintTact: al === 'tact',
      glisse: a ? a.glisse || 0 : 0, vitesse: c ? Math.hypot(c.vel.x, c.vel.z) : 0, lacetV: this._lV, tangageV: this._pV, accroupi: a ? a.accroupi || 0 : 0,
      enAir: !!(c && c.airborne), mort: !!(a && !a.vivant),
      franchit: M && M.franchit ? M.franchit.k : 0, reception: this._creux.x, phase: this._balPhi, frequence: VUE.balancement.f0 + VUE.balancement.fv * (c ? Math.hypot(c.vel.x, c.vel.z) : 0),
      balancement: this._balA, allure: al, lateral: lat, lunette: E ? E.lunette : 0, souffle: !!(E && E.souffle.tenu) };
  }
  // LA CAPTURE DU POINTEUR (pointeur brut, repli sans option) : la promesse dit si elle est accordée
  capturer() {
    const el = this.game.renderer.domElement;
    if (document.pointerLockElement === el) return Promise.resolve(true);
    return new Promise((resolve) => {
      let fini = false, to = 0;
      const fin = (v) => {
        if (fini) return; fini = true; clearTimeout(to);
        document.removeEventListener('pointerlockchange', ch); document.removeEventListener('pointerlockerror', er);
        resolve(v);
      };
      const ch = () => fin(document.pointerLockElement === el);
      const er = () => fin(false);
      document.addEventListener('pointerlockchange', ch); document.addEventListener('pointerlockerror', er);
      to = setTimeout(() => fin(document.pointerLockElement === el), 1500);
      const essai = (opts) => { try { return opts ? el.requestPointerLock(opts) : el.requestPointerLock(); } catch (e) { return Promise.reject(e); } };
      const r = essai({ unadjustedMovement: true });
      if (r && r.catch) r.catch((e) => { if (e && e.name === 'NotSupportedError') { const r2 = essai(null); if (r2 && r2.catch) r2.catch(() => fin(false)); } else fin(false); });
    });
  }
}
