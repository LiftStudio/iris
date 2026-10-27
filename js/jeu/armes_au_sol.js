// =====================================================================
//  LES ARMES AU SOL — lot L-P (vague 3, 24/10 ; spec §§ 3.5, 5.7.3 ; CoD § 11)
// =====================================================================
// À la mort d'un acteur du combat, l'arme qu'il tenait TOMBE à ses pieds, avec ce qui restait dedans (chargeur et
// réserve ; son accessoire aussi) ; elle y reste 30 s, 10 au plus dans l'école (la plus vieille s'en va). Un joueur
// (`humain`) la RAMASSE : F (`interagir`, au front) ou deux appuis sur RECHARGER en 0,35 s (la manette et le doigt n'ont pas
// de touche « interagir » au combat — demande au rapport) à ≤ 1,4 m, au même niveau → elle remplace l'arme EN MAIN, qui
// tombe à sa place (l'échange de Call of Duty) ; il passe sur une arme du même modèle qu'une des siennes → il en prend les
// MUNITIONS (jusqu'à sa réserve de départ), d'office. Une réapparition rend la dotation de la classe (js/jeu/partie_fps.js).
// Fichier de SIMULATION (§ 4.1 règle 4) : ni hasard, ni horloge, ni entrées, ni affichage — les armes posées, on les VOIT
// par js/jeu/aff_progression.js, qui lit `liste` ; l'état entre dans `etat()` (l'hôte de demain).
// (L'Arsenal de L-A n'a pas encore de `ramasser` qui marche — `ramasser(idArme)` rend faux : vague 3, dit-il — et
// js/jeu/armes.js n'est pas à ce lot : l'échange se fait ici, par les champs de l'arsenal — `armes`, `ch`, `res`, `pr`, l'état
// 'change' du geste —, comme le ferait la méthode. Demande à INT : y ranger `ramasser(arme, ch, res)` tel quel.)
import { ARMES } from './armes.js';
import { ficheEquipee } from './series.js';

export const REGLES_SOL = { duree: 30, max: 10, portee: 1.4, hauteur: 0.9, munitions: 1.0, double: 0.35 };
const tireuse = (f) => !!(f && f.rpm && f.recharge);

export class ArmesAuSol {
  constructor(partie) {
    this.partie = partie;
    this.liste = [];                   // [{ id, arme, acc, ch, res, x, y, z, cap, t, par }]
    this.n = 0;
    this.avant = new Map();            // id d'acteur → `interagir` au pas d'avant (le front)
    this.recharges = new Map();        // id d'acteur → l'heure du dernier front `recharger` (le double appui)
    this._des = [];
  }
  brancher() {
    this.debrancher();
    this._des.push(this.partie.sur('elim', (e) => this._mort(e)));
  }
  debrancher() { for (const d of this._des) d(); this._des = []; }

  // À LA MORT : l'arme tenue (une arme à feu ; sinon sa principale) tombe à ses pieds
  _mort(e) {
    const P = this.partie, a = P.acteurParId(e.cible);
    if (!a || !a.arsenal || a.role === 'cible' || !a.corps) return;
    const A = a.arsenal;
    let i = A.i;
    if (!tireuse(A.armes[i])) i = A.armes.findIndex(tireuse);
    if (i < 0) return;
    const ch = A.ch[i] | 0, res = A.res[i] | 0;
    if (ch + res <= 0) return;
    this.poser(A.armes[i], ch, res, a.pos.x, a.pos.y, a.pos.z, a.cmd.lacet || 0, a.id);
  }
  poser(f, ch, res, x, y, z, cap, par = -1) {
    const P = this.partie;
    const s = { id: this.n++, arme: f.base || f.id, acc: f.accessoire || null, ch, res, x, y, z, cap, t: P.t, par };
    this.liste.push(s);
    while (this.liste.length > REGLES_SOL.max) { const v = this.liste.shift(); P.evt('arme_sol', { id: v.id, arme: v.arme, etat: 'partie', x: v.x, y: v.y, z: v.z }); }
    P.evt('arme_sol', { id: s.id, arme: s.arme, etat: 'posee', x, y, z });
    return s;
  }
  // l'arme au sol la plus proche de `a` à ≤ 1,4 m, au même niveau, qu'il peut PRENDRE (null : rien) — (relecture) un modèle
  // qu'il tient déjà n'en est pas une : sa réserve pleine, elle restait là et cachait l'arme d'à côté, qu'on ne pouvait ni voir à
  // l'invite ni ramasser
  proche(a) {
    if (!a || !a.corps) return null;
    const A = a.arsenal;
    let best = null, bd = REGLES_SOL.portee;
    for (const s of this.liste) {
      if (Math.abs(s.y - a.pos.y) > REGLES_SOL.hauteur) continue;
      if (A && A.armes.some((f) => (f.base || f.id) === s.arme)) continue;
      const d = Math.hypot(s.x - a.pos.x, s.z - a.pos.z);
      if (d <= bd) { bd = d; best = s; }
    }
    return best;
  }
  // RAMASSER l'arme `s` : elle prend la place de l'arme en main (qui tombe là), ses munitions avec elle → vrai
  ramasser(a, s) {
    const P = this.partie, A = a && a.arsenal, t = P.t;
    if (!A || !s || !a.vivant || this.liste.indexOf(s) < 0) return false;
    // (relecture : pas au milieu d'un geste — une frag cuite en main restait goupillée sans jamais partir ni se décompter, le
    // couteau et le franchissement coupés net ; l'arme ne s'échange que bras libres)
    if (A.et === 'lancer' || A.et === 'couteau' || A.et === 'franchit') return false;
    const i = A.i, vieille = A.armes[i];
    const base = ARMES[s.arme]; if (!tireuse(base)) return false;
    // (un modèle qu'il tient déjà : ce n'est pas un échange — les munitions se prennent en passant dessus)
    if (A.armes.some((f) => (f.base || f.id) === s.arme)) return false;
    const neuve = ficheEquipee(base, s.acc, A.modificateurs ? A.modificateurs.atout : null);
    // le geste en cours rendu (une recharge annulée), l'arme en main posée à la place de celle qu'on prend
    if (A.et === 'recharge') P.evt('recharge', { a: a.id, phase: 'annulee', tactique: !!A.tact });
    this.liste.splice(this.liste.indexOf(s), 1);
    P.evt('arme_sol', { id: s.id, arme: s.arme, etat: 'ramassee', par: a.id, x: s.x, y: s.y, z: s.z });
    if (tireuse(vieille) && (A.ch[i] | 0) + (A.res[i] | 0) > 0) this.poser(vieille, A.ch[i] | 0, A.res[i] | 0, s.x, s.y, s.z, s.cap, a.id);
    A.armes[i] = neuve; A.ch[i] = s.ch; A.res[i] = s.res; A.pr[i] = t;
    A.nC = 0; A.pp = false; A.reculI = 0; A.tampon = -Infinity;
    // (le geste de la sortie : l'état 'change' de l'arsenal, déjà « basculé » sur la neuve — elle arrive en `sortie` s)
    A.vers = i; A.basc = true; A.tB = t; A._etat('change', t, neuve.sortie || 0.3); A.vk = 0;
    P.evt('arme', { a: a.id, id: neuve.id, ramassee: true });
    return true;
  }
  // les MUNITIONS d'une arme au sol du même modèle qu'une arme tenue : prises en passant dessus (≤ 1 m), jusqu'à la réserve
  _munitions(a) {
    const A = a.arsenal; if (!A) return;
    for (let k = this.liste.length - 1; k >= 0; k--) {
      const s = this.liste[k];
      if (Math.abs(s.y - a.pos.y) > REGLES_SOL.hauteur || Math.hypot(s.x - a.pos.x, s.z - a.pos.z) > REGLES_SOL.munitions) continue;
      const j = A.armes.findIndex((f) => (f.base || f.id) === s.arme);
      if (j < 0) continue;
      const f = A.armes[j], manque = Math.max(0, f.reserve - A.res[j]);
      if (manque <= 0) continue;
      const n = Math.min(manque, s.ch + s.res);
      A.res[j] += n;
      const deRes = Math.min(s.res, n); s.res -= deRes; s.ch -= n - deRes;
      this.partie.evt('arme_sol', { id: s.id, arme: s.arme, etat: 'munitions', par: a.id, n, x: s.x, y: s.y, z: s.z });
      if (s.ch + s.res <= 0) { this.liste.splice(k, 1); this.partie.evt('arme_sol', { id: s.id, arme: s.arme, etat: 'vide', x: s.x, y: s.y, z: s.z }); }
    }
  }

  // ---------------------------------------------------------------- LE PAS (étape 8)
  pas(dt) {
    const P = this.partie, t = P.t, R = REGLES_SOL;
    for (let k = this.liste.length - 1; k >= 0; k--) {
      const s = this.liste[k];
      if (t - s.t >= R.duree - 1e-9) { this.liste.splice(k, 1); P.evt('arme_sol', { id: s.id, arme: s.arme, etat: 'disparue', x: s.x, y: s.y, z: s.z }); }
    }
    for (const a of P.acteurs) {
      if (!a.humain || !a.vivant || !a.arsenal || !a.corps || a.prop) { this.avant.delete(a.id); continue; }
      const c = a.cmd, front = !!c.interagir && !this.avant.get(a.id);
      this.avant.set(a.id, !!c.interagir);
      let double = false;
      if (c.recharger) { const t0 = this.recharges.get(a.id); double = t0 !== undefined && t - t0 <= R.double + 1e-9; this.recharges.set(a.id, double ? -Infinity : t); }
      if (this.liste.length) {
        this._munitions(a);
        if ((front || double) && P.peutTirer(a)) { const s = this.proche(a); if (s) this.ramasser(a, s); }
      }
    }
  }

  // ---------------------------------------------------------------- L'ÉTAT (§ 4.7)
  etat() {
    const fin = (v) => (Number.isFinite(v) ? v : null);
    return { n: this.n, liste: this.liste.map((s) => ({ ...s })), avant: [...this.avant], rech: [...this.recharges].map(([id, t]) => [id, fin(t)]) };
  }
  appliquer(e) {
    if (!e) return;
    this.n = e.n | 0;
    this.liste = (e.liste || []).map((s) => ({ ...s }));
    this.avant = new Map(e.avant || []);
    this.recharges = new Map((e.rech || []).map(([id, t]) => [id, t === null ? -Infinity : t]));
  }
}
