// =====================================================================
//  LES POSES ET LES PISTES DE L'ARME DE VUE — squelette du socle S0 (22/10), rempli par le lot L-V (vague 3 : L-Q)
// =====================================================================
// Les poses de l'arme dans le repère de la caméra de l'arme (m, rad ; spec § 4.5.9, CoD § 6.4) et les chronologies des
// gestes (recharges, changement, couteau, grenade) — leurs temps viennent des FICHES (js/jeu/armes.js) : l'animation lit
// l'état de l'arsenal, jamais l'inverse. Le squelette : les poses complètes, les chronologies sans clés, `evaluer` linéaire
// (L-V : Hermite).
import { ARMES } from './armes.js';

// { p: [x, y, z], r: [x, y, z] } ; la visée : le repère `visee` de l'arme sur l'axe, à 0,24 m (L-V le calcule)
export const POSES_VUE = {
  hanche: { p: [0.135, -0.125, -0.32], r: [0, 0.035, 0] },
  visee: { p: [0, 0, -0.24], r: [0, 0, 0], repere: 'visee' },
  sprint: { p: [0.06, -0.19, -0.25], r: [-0.55, 0.65, 0.35] },
  sprintTact: { p: [0.10, -0.10, -0.30], r: [0.9, 0.2, -0.4] },
  glisse: { p: [0.115, -0.155, -0.32], r: [0, 0.035, -0.25] },
  franchit: { p: [0.12, -0.22, -0.22], r: [-0.3, 0.4, 0.45] },
};
// les pistes, par arme : { duree, cles: [] } (le squelette : les durées des fiches, sans clés)
const piste = (duree) => ({ duree, cles: [] });
const chronosArme = (f) => ({
  rechargeTact: piste(f.recharge.tact ?? (f.recharge.debut + f.recharge.fin)),
  rechargeVide: piste(f.recharge.vide ?? (f.recharge.debut + f.recharge.fin + (f.recharge.pompe || 0))),
  sortie: piste(f.sortie), rangement: piste(f.rangement),
});
export const CHRONOS = {
  fa24: chronosArme(ARMES.fa24), pm9: chronosArme(ARMES.pm9), fp12: chronosArme(ARMES.fp12), tp50: chronosArme(ARMES.tp50), p17: chronosArme(ARMES.p17),
  couteau: { coup: piste(ARMES.couteau.coup) },
  grenade: { goupille: piste(0.15), lancer: piste(0.35), remontee: piste(0.25) },
  inspection: piste(3.0),
};
// la valeur d'une piste à l'instant t : `out` (un tableau de nombres) — linéaire entre deux clés { t, v: [] }
export function evaluer(piste, t, out) {
  const K = (piste && piste.cles) || [];
  if (!K.length) return out;
  if (t <= K[0].t) { for (let i = 0; i < K[0].v.length; i++) out[i] = K[0].v[i]; return out; }
  for (let j = 1; j < K.length; j++) {
    if (t <= K[j].t) {
      const a = K[j - 1], b = K[j], k = (t - a.t) / Math.max(1e-9, b.t - a.t);
      for (let i = 0; i < a.v.length; i++) out[i] = a.v[i] + (b.v[i] - a.v[i]) * k;
      return out;
    }
  }
  const z = K[K.length - 1]; for (let i = 0; i < z.v.length; i++) out[i] = z.v[i];
  return out;
}
