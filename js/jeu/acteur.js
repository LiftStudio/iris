// =====================================================================
//  L'ACTEUR (socle S0, 22/10 ; spec § 4.5.4)
// =====================================================================
// Un participant d'une partie : Haythem (id 0, `local`), un bot, une cible du stand. Il porte ce que la SIMULATION sait de
// lui — sa commande, sa vie, son arme, son accroupi, son déguisement, ses comptes — et un CORPS qui bouge : un Player
// (js/player.js : Haythem ou un bot), un CorpsProp (js/jeu/corps_prop.js : tous les props, Haythem compris) ou un CorpsFixe
// (ci-dessous : les cibles du stand, le corps fictif du menu). Tout corps a pos, vel, posPrec, posAff, solAff, jumpY,
// airborne, rayon, memoriser(), presenter(a). Son état (§ 4.7) n'a que des nombres et des chaînes : il voyagera.
import * as THREE from 'three';
import { creerCommande } from './commande.js';
import { niveauDe } from './constantes.js';
import { hauteurOeil, etatMvt } from './mouvement.js';

export class Acteur {
  constructor(partie, { id, nom, equipe = null, role = 'combattant', fiche = null, local = false, humain = false }) {
    this.partie = partie;
    this.id = id; this.nom = nom; this.equipe = equipe; this.role = role;   // role : 'combattant' | 'prop' | 'chasseur' | 'cible'
    this.fiche = fiche; this.local = local; this.humain = humain;
    this.joueur = null;              // Player | null
    this.corps = null;               // ce qui bouge (voir l'en-tête)
    this.sprintLimite = false;       // sprint à endurance, sans sprint tactique (chasseurs du prop hunt)
    this.cmd = creerCommande(); this.cerveau = null;
    this.vie = 100; this.vieMax = 100; this.armure = 0; this.vivant = true;
    this.mortT = 0; this.reapparitionT = 0; this.protegeT = 0; this.gele = false; this.derniereTouche = null;
    this.arsenal = null;
    this.accroupi = 0; this.glisse = 0;          // 0..1 (simulés, js/jeu/mouvement.js)
    this.jaugeTact = 1; this.endurance = 100;     // jauge du sprint tactique ; endurance du sprint limité
    this.prop = null;                // null | { cle, T, racine, cap, fige, verrou, pv, changements, provocT, vitesseAff, rotAff }
    this.stats = { elims: 0, morts: 0, tetes: 0, assists: 0, tirs: 0, touches: 0, score: 0, degats: 0, survie: 0, provocs: 0, rates: 0 };
    this.poupee = null;
    this.dessine = true; this.aPoser = true; this.poseDt = 0; this.ombre = true;   // posés par CadenceActeurs (affichage)
    this.aff = { bouche: { x: 0, y: 0, z: 0 }, arme3e: null };                      // affichage seulement, jamais dans l'état
  }
  get pos() { return this.corps.pos; }
  get h() { return (this.joueur && this.joueur.h) || (this.fiche && this.fiche.height) || 1.73; }

  // l'œil : pieds + hauteur de l'œil (+ saut) ; `affiche` : la position AFFICHÉE (interpolée)
  oeil(out, affiche = false) {
    const c = this.corps, p = affiche ? c.posAff : c.pos;
    const sol = affiche ? (Number.isFinite(c.solAff) ? c.solAff : p.y) : p.y;
    return out.set(p.x, sol + hauteurOeil(this) + (c.jumpY || 0), p.z);
  }
  // la direction du regard voulu (commande) : (−sin l·cos t, −sin t, −cos l·cos t)
  regard(out) {
    const l = this.cmd.lacet, t = this.cmd.tangage, ct = Math.cos(t);
    return out.set(-Math.sin(l) * ct, -Math.sin(t), -Math.cos(l) * ct);
  }
  niveau() { return niveauDe(this.pos.y + 0.5); }

  // prop ↔ humain : le corps simulé change (Haythem garde son Player garé : caché, non simulé)
  changerCorps(corps) {
    const avant = this.corps;
    if (avant && corps && avant !== corps) {
      corps.pos.copy(avant.pos); if (corps.posPrec) corps.posPrec.copy(avant.pos); if (corps.posAff) corps.posAff.copy(avant.pos);
      if (Number.isFinite(avant.solAff)) corps.solAff = avant.solAff;
    }
    if (this.joueur && this.joueur.mesh) this.joueur.mesh.visible = corps === this.joueur;
    this.corps = corps;
  }

  mourir(t) {
    this.vivant = false; this.vie = 0; this.mortT = t;
    const c = this.corps;
    if (c) { c.vel.set(0, 0, 0); }
    this.cmd.tir = false; this.cmd.visee = false;
  }
  reapparaitre(x, y, z, lacet, t) {
    const c = this.corps;
    c.pos.set(x, y, z); c.vel.set(0, 0, 0);
    if (c.posPrec) c.posPrec.copy(c.pos);
    if (c.posAff) c.posAff.copy(c.pos);
    c.solAff = y; c.jumpY = 0; c.jumpVel = 0; c.airborne = false;
    if (c.setFacing) c.setFacing(-Math.sin(lacet), -Math.cos(lacet));
    c.ang = Math.atan2(-Math.sin(lacet), -Math.cos(lacet)); c.angPrec = c.ang; c.angAff = c.ang;
    this.cmd.lacet = lacet; this.cmd.tangage = 0;
    this.vivant = true; this.vie = this.vieMax; this.protegeT = t + 1.2; this.reapparitionT = 0;
    this.accroupi = 0; this.glisse = 0; this.derniereTouche = null;
    if (this.arsenal) this.arsenal.remplir();
  }

  // L'ÉTAT (§ 4.7) : nombres et chaînes
  etat() {
    const c = this.corps, A = this.arsenal, P = this.prop, s = this.stats;
    return { id: this.id, nom: this.nom, av: this.fiche ? this.fiche.id || null : null, eq: this.equipe, role: this.role,
      x: c.pos.x, y: c.pos.y, z: c.pos.z, vx: c.vel.x, vz: c.vel.z, cap: c.ang || 0, lacet: this.cmd.lacet, tangage: this.cmd.tangage,
      jy: c.jumpY || 0, jv: c.jumpVel || 0, air: !!c.airborne, acc: this.accroupi, gl: this.glisse, tact: this.jaugeTact, en: this.endurance,
      // (F2, demande de L-B : le sprint tactique EN COURS et l'épuisement d'un chasseur, que la jauge et l'endurance ne disent pas)
      tA: !!(this.mvt && this.mvt.tact), ep: !!(this.mvt && this.mvt.epuise),
      vie: this.vie, ar: this.armure, viv: this.vivant, rT: this.reapparitionT, pT: this.protegeT, mT: this.mortT, gel: this.gele,
      arme: A ? A.etat() : null,
      prop: P ? { cle: P.cle, cap: P.cap, fige: !!P.fige, verrou: !!P.verrou, pv: P.pv, chg: P.changements || 0, pT: P.provocT || 0 } : null,
      st: { e: s.elims, m: s.morts, a: s.assists, s: s.score } };
  }
  appliquer(e) {
    const c = this.corps;
    c.pos.set(e.x, e.y, e.z); c.vel.set(e.vx, 0, e.vz);
    if (c.posPrec) c.posPrec.copy(c.pos);
    if (c.setFacing) c.setFacing(Math.sin(e.cap), Math.cos(e.cap));
    c.ang = e.cap;
    c.jumpY = e.jy; c.jumpVel = e.jv; c.airborne = e.air;
    this.cmd.lacet = e.lacet; this.cmd.tangage = e.tangage;
    this.accroupi = e.acc; this.glisse = e.gl; this.jaugeTact = e.tact; this.endurance = e.en;
    if (e.tA !== undefined || e.ep !== undefined) { const M = etatMvt(this); M.tact = !!e.tA; M.epuise = !!e.ep; }
    this.vie = e.vie; this.armure = e.ar; this.vivant = e.viv; this.reapparitionT = e.rT; this.protegeT = e.pT;
    this.mortT = e.mT || 0; this.gele = !!e.gel;
    if (this.arsenal && e.arme) this.arsenal.appliquer(e.arme);
    // (le déguisement : ses champs seulement — le corps de meuble et sa racine, la partie qui sait les poser les rend,
    // js/jeu/partie_prop.js appliquer)
    if (this.prop && e.prop) Object.assign(this.prop, { cle: e.prop.cle, cap: e.prop.cap, fige: e.prop.fige, verrou: e.prop.verrou, pv: e.prop.pv, changements: e.prop.chg, provocT: e.prop.pT });
    Object.assign(this.stats, { elims: e.st.e, morts: e.st.m, assists: e.st.a, score: e.st.s });
  }
}

// Un corps qui ne bouge pas : les cibles du stand (role 'cible') et le corps FICTIF que suit la carte vivante au menu.
// (Partie.interpoler appelle corps.presenter(a) sur chaque acteur actif : une cible sans corps lèverait une exception.)
export class CorpsFixe {
  constructor(x = 0, y = 0, z = 0, cap = 0) {
    this.pos = new THREE.Vector3(x, y, z); this.posPrec = this.pos.clone(); this.posAff = this.pos.clone();
    this.vel = new THREE.Vector3(); this.solAff = y; this.jumpY = 0; this.jumpVel = 0; this.airborne = false;
    this.ang = cap; this.angPrec = cap; this.angAff = cap; this.rayon = 0.3; this.h = 1.73;
    this.fixe = true;                // (les contacts entre corps ne le poussent pas : js/jeu/mouvement.js separer)
  }
  placer(x, y, z, cap) {
    if (cap === undefined) cap = this.ang;
    this.pos.set(x, y, z); this.posPrec.copy(this.pos); this.posAff.copy(this.pos);
    this.solAff = y; this.ang = cap; this.angPrec = cap; this.angAff = cap;
  }
  memoriser() { this.posPrec.copy(this.pos); this.angPrec = this.ang; }
  presenter(a) {
    this.posAff.lerpVectors(this.posPrec, this.pos, a);
    this.solAff = this.posAff.y;
    this.angAff = this.angPrec + (this.ang - this.angPrec) * a;
  }
}
