// =====================================================================
//  L'ARME DE VUE — squelette du socle S0 (22/10), rempli par le lot L-V (vague 3 : L-Q)
// =====================================================================
// L'arme et les bras à la 1re personne, dans LEUR scène, avec LEUR caméra (52° vertical, near 0,01, far 5) et LEURS trois
// lumières, en nombre CONSTANT (spec § 4.5.9, arbitrage 14) : jamais une lumière ajoutée à la scène de jeu (une de plus =
// 27 s d'image figée). Dessinée par-dessus la scène par la passe superposée de js/fx.js (VueFPS.entrer la pousse dans
// fx.superpositions). Sa carte d'environnement est À ELLE et FIXE : un PMREM de studio fait une fois à la préparation —
// jamais celle de la scène de jeu, qui change ou passe à null selon la qualité. Le squelette : la boîte de l'arme posée
// en hanche, montrer / cacher, `vitrine` (la boîte qui tourne, pour l'armurerie de la vague 3) ; `preparer` compile.
// `maj` lit l'état (VueFPS.etatArme) et ne commande JAMAIS une règle.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { creerArme } from './modeles_armes.js';

export class Viewmodel {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, game.camera ? game.camera.aspect : 16 / 9, 0.01, 5);
    // LES TROIS LUMIÈRES de la scène de l'arme (constantes : hémisphère, clé, éclair de bouche à 0 hors tir)
    this.hemi = new THREE.HemisphereLight(0xdfe6ef, 0x3a342c, 0.9);
    this.cle = new THREE.DirectionalLight(0xffffff, 1.4); this.cle.position.set(0.6, 1.0, 0.8);
    this.bouche = new THREE.PointLight(0xffc27a, 0, 2, 2); this.bouche.position.set(0.1, -0.05, -0.8);
    this.scene.add(this.hemi, this.cle, this.bouche);
    this.racine = new THREE.Group(); this.racine.name = 'arme de vue'; this.scene.add(this.racine);
    this.armes = {}; this.courante = null; this._vitrine = null; this._supV = null; this._env = null;
    this._sup = { scene: this.scene, camera: this.camera };
    this.racine.visible = false;
  }
  async preparer(progres) {
    const r = this.game.renderer;
    if (!this._env && r) {
      const pm = new THREE.PMREMGenerator(r);
      this._env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
      pm.dispose();
      this.scene.environment = this._env;
    }
    for (const id of ['fa24', 'pm9', 'fp12', 'tp50', 'p17', 'couteau', 'frag', 'flash']) {
      if (this.armes[id]) continue;
      const a = creerArme(id, { pourVue: true });
      a.visible = false; this.racine.add(a); this.armes[id] = a;
    }
    // les programmes compilés pour la cible où l'arme est dessinée, toutes visibles le temps de la compilation
    const vis = this.racine.visible;
    this.racine.visible = true;
    for (const a of Object.values(this.armes)) a.visible = true;
    try { await (this.game._compilerAsync?.(this.scene, this.scene, undefined, this.camera) || null); }
    finally { for (const a of Object.values(this.armes)) a.visible = a === this.courante; this.racine.visible = vis; }
  }
  get superposition() { return this._sup; }
  montrer(idArme) {
    const a = this.armes[idArme] || null;
    if (this.courante && this.courante !== a) this.courante.visible = false;
    this.courante = a;
    if (a) { a.visible = true; this.racine.visible = true; }
  }
  cacher() { this.racine.visible = false; }
  // POSE DE HANCHE (repère caméra : 0,135 ; −0,125 ; −0,32 ; lacet 0,035) — L-V : poses, ressorts, pistes
  maj(dt, etat) {
    const c = this.camera, g = this.game.camera;
    if (g && Math.abs(c.aspect - g.aspect) > 1e-6) { c.aspect = g.aspect; c.updateProjectionMatrix(); }
    if (etat && etat.arme && (!this.courante || this.courante.userData.arme !== etat.arme)) this.montrer(etat.arme);
    if (etat && etat.mort) { this.cacher(); return; }
    if (this.courante && !this._vitrine) { this.racine.visible = true; this.racine.position.set(0.135, -0.125, -0.32); this.racine.rotation.set(0, 0.035, 0); }
    if (this._vitrine) { this.racine.position.set(0, -0.02, -0.75); this.racine.rotation.y += dt * 0.6; }
  }
  // L'ARMURERIE (vague 3) : l'arme seule qui tourne devant la caméra de l'arme, superposée tant qu'elle est montrée
  vitrine(idArme) {
    const fx = this.game.fx;
    if (idArme === null || idArme === undefined) {
      this._vitrine = null;
      if (this._supV && fx && fx.superpositions) { const i = fx.superpositions.indexOf(this._supV); if (i >= 0) fx.superpositions.splice(i, 1); }
      this._supV = null; this.cacher();
      return;
    }
    this._vitrine = idArme; this.montrer(idArme); this.racine.rotation.set(0, 0, 0);
    if (!this._supV && fx && fx.superpositions) { this._supV = this._sup; if (!fx.superpositions.includes(this._supV)) fx.superpositions.push(this._supV); }
  }
}
