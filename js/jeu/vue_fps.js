// =====================================================================
//  LA VUE À LA 1re PERSONNE — squelette du socle S0 (22/10), rempli par le lot L-B (vague 3 : L-Q)
// =====================================================================
// La caméra du jeu posée DIRECTEMENT à chaque image (spec § 3.2) : à l'œil de l'acteur local (position affichée + hauteur
// de l'œil + saut), rotation `(−(tangage − 0,15·reculV·DEG), lacet − 0,15·reculH·DEG, roulis, 'YXZ')` — aucun lissage : le
// geste de souris arrive à l'écran à l'image suivante ; lacet / tangage = game.camYaw / camPitch (tangage > 0 = regard vers
// le BAS : un cabré de l'arme fait regarder vers le HAUT en DIMINUANT le tangage). Le recul de VISÉE n'est jamais posé
// ici (une fois par image : il dépendrait de la cadence) : lireCommande le consomme au pas. Le champ vient de
// `controls.fps.champ` (horizontal équivalent 16:9). Le corps local est caché ; l'arme de vue est une SUPERPOSITION
// (js/fx.js PasseSuperposee). Le squelette : reculs à 0, ni balancement ni roulis, caméra de mort de 3 s qui s'affaisse.
import * as THREE from 'three';

const DEG = Math.PI / 180, CHAMP_H_MAX = 108;
const _v = new THREE.Vector3();

export class VueFPS {
  constructor(game) {
    this.game = game; this.acteur = null; this._sup = null; this._des = []; this._mort = null; this._champ = 0;
  }
  // le champ VERTICAL (degrés) pour un champ horizontal `champ` en 16:9, plafonné à 108° d'horizontal sur un écran large
  champVPour(champ, aspect) {
    let v = 2 * Math.atan(Math.tan(champ / 2 * DEG) / (16 / 9)) / DEG;
    const h = 2 * Math.atan(Math.tan(v / 2 * DEG) * (aspect || 16 / 9)) / DEG;
    if (h > CHAMP_H_MAX) v = 2 * Math.atan(Math.tan(CHAMP_H_MAX / 2 * DEG) / (aspect || 16 / 9)) / DEG;
    return v;
  }
  get champV() {
    const s = this.game.settings, f = s && s.controls && s.controls.fps;
    return this.champVPour((f && f.champ) || 90, this.game.camera.aspect);
  }
  entrer(acteur) {
    this.sortir();
    this.acteur = acteur; this._mort = null;
    const g = this.game, P = acteur.partie, vm = P && P.aff && P.aff.viewmodel;
    if (vm && vm.superposition && g.fx && g.fx.superpositions && !g.fx.superpositions.includes(vm.superposition)) {
      this._sup = vm.superposition; g.fx.superpositions.push(this._sup);
    }
    // la flash reçue : l'appoint de l'étalonnage (le calque blanc #voile-flash est au HUD, L-G)
    if (P) this._des.push(P.sur('flash', (e) => { if (e.cible === acteur.id && g.fx) g.fx.flash = 1; }));
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
    this.acteur = null;
  }
  _cacher() {
    const j = this.acteur && this.acteur.joueur;
    if (j && j.mesh) { j.mesh.visible = false; j.vuePremiere = false; }
  }
  // `poser` : d'emblée (sans lissage — il n'y en a de toute façon pas)
  poser(dt, poser = false) {
    const g = this.game, a = this.acteur, cam = g.camera;
    if (!a || !a.corps) return false;
    this._cacher();
    a.oeil(_v, true);
    let roulis = 0;
    if (this._mort) {
      // LA CAMÉRA DE MORT (squelette) : l'œil tombe vers 0,4 m en 0,8 s, roulis de 25°
      const k = Math.min(1, (a.partie.t - this._mort.t) / 0.8);
      const pieds = Number.isFinite(a.corps.solAff) ? a.corps.solAff : a.corps.pos.y;
      _v.y = _v.y + (pieds + 0.4 - _v.y) * k; roulis = 25 * DEG * k;
      if (a.vivant && a.partie.t - this._mort.t > 0.1) this._mort = null;
    }
    cam.position.copy(_v);
    const A = a.arsenal, rv = A ? A.reculV : 0, rh = A ? A.reculH : 0;
    cam.rotation.set(-(g.camPitch - 0.15 * rv * DEG), g.camYaw - 0.15 * rh * DEG, roulis, 'YXZ');
    const v = this.champV;
    if (Math.abs(v - cam.fov) > 1e-6) { cam.fov = v; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld();
    return true;
  }
  impulsion(dTangage, dLacet) { }
  secousse(amp, dur) { this.game.addShake?.(amp, dur); }
  mort(tueurId) { if (this.acteur) this._mort = { t: this.acteur.partie.t, tueur: tueurId }; }
  // ce que l'arme de vue lit (L-V) : l'état de l'arsenal et du corps, jamais une règle
  etatArme() {
    const a = this.acteur, A = a && a.arsenal, c = a && a.corps;
    return { arme: A && A.arme ? A.arme.id : null, etatArme: A ? A.etatArme : 'pret', tEtat: A ? A.tEtat : 0, visee: A ? A.visee : 0,
      tirFront: false, reculV: A ? A.reculV : 0, reculH: A ? A.reculH : 0, sprint: !!(a && a.cmd.sprint), sprintTact: false,
      glisse: a ? a.glisse : 0, vitesse: c ? Math.hypot(c.vel.x, c.vel.z) : 0, lacetV: 0, tangageV: 0, accroupi: a ? a.accroupi : 0,
      enAir: !!(c && c.airborne), mort: !!(a && !a.vivant) };
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
