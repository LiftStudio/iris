// =====================================================================
//  LE TABLEAU DES SCORES (lot L-G, 23/10 ; spec §§ 2.3, 3.8, 3.9, 4.5.15, 5.5.10 ; CoD § 9.2)
// =====================================================================
// Tenu par Tab (ou Back à la manette, SCORES au doigt) — ou ouvert depuis la pause (« Tableau des scores » : `basculer`).
// NON interactif, PAS dans les racines de la manette (js/manette_menus.js) : la manette ne passe pas en contexte menu
// pendant qu'on le regarde. En combat : rang, portrait 32 px (l'image PRÉCALCULÉE de js/jeu/portraits.js, sinon
// l'initiale sur un dégradé), nom, score, É(liminations), M(orts), A(ssistances), ratio, série en cours ; deux colonnes
// d'équipe (SISR bleu, SLAM orange) au match à mort par équipes et en domination, une seule liste en chacun pour soi. Au
// prop hunt : rôle, points, props trouvés, survie, provocations, tirs sur de « vrais meubles ». En tête : le mode, le
// score, le chrono. Une ligne par acteur, gardée d'une image à l'autre : seuls les textes qui changent sont écrits, et
// l'ordre n'est refait que quand le classement change ; rien n'est écrit tant qu'il est caché.
import { EQUIPES } from './constantes.js';
import { portrait } from './portraits.js';
import { texte, classe, cacher, elt } from './hud_jeu.js';

const TITRES = { equipes: 'MATCH À MORT PAR ÉQUIPES', melee: 'CHACUN POUR SOI', domination: 'DOMINATION', stand: 'STAND DE TIR', essai: 'ESSAI', prophunt: 'PROP HUNT' };
export const COLONNES = {
  combat: [['score', 'SCORE'], ['e', 'É'], ['m', 'M'], ['a', 'A'], ['ratio', 'RATIO'], ['serie', 'SÉRIE']],
  prop: [['role', 'RÔLE'], ['score', 'POINTS'], ['trouves', 'TROUVÉS'], ['survie', 'SURVIE'], ['provocs', 'PROVOC.'], ['faux', 'VRAIS MEUBLES']],
};
const ROLES = { prop: 'PROP', chasseur: 'CHASSEUR', combattant: '', cible: '' };
const mmss = (s) => { s = Math.max(0, Math.ceil((s || 0) - 1e-6)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export class TableauScores {
  constructor(game) { this.game = game; this.el = null; this._force = false; this._lignes = new Map(); this._partie = null; this._des = []; this._series = new Map(); this.montre = false; }
  _creer() {
    if (this.el) return;
    const hud = document.getElementById('hud'); if (!hud) return;
    const R = this.el = elt('div', 'tableau-scores', null); R.id = 'tableau-scores'; R.dataset.jeu = '1'; cacher(R, true);
    const B = elt('div', 'ts-boite', R);
    const T = elt('div', 'ts-tete', B);
    this.eTitre = elt('b', 'ts-titre', T, ''); this.eScore = elt('span', 'ts-score', T, ''); this.eChrono = elt('span', 'ts-chrono', T, '');
    this.eCorps = elt('div', 'ts-corps', B);
    this.eCols = [0, 1].map(() => { const c = elt('div', 'ts-col', this.eCorps); const h = elt('div', 'ts-entete', c); const l = elt('div', 'ts-lignes', c); return { c, h, l }; });
    this.ePied = elt('div', 'ts-pied', B, '');
    hud.appendChild(R);
  }
  // la pause : « Tableau des scores » l'ouvre et le ferme (Partie.boutonsPause)
  basculer(partie) { this._force = !this._force; this.maj(partie, false); }
  // les séries en cours (éliminations depuis la dernière mort), lues dans les événements de la partie
  _brancher(P) {
    for (const d of this._des) d(); this._des = [];
    this._partie = P; this._series.clear(); this._force = false;
    for (const L of this._lignes.values()) L.el.remove();
    this._lignes.clear();
    if (!P) return;
    this._des.push(P.sur('elim', (e) => {
      if (e.par !== e.cible && e.par >= 0) this._series.set(e.par, (this._series.get(e.par) || 0) + 1);
      this._series.set(e.cible, 0);
    }));
  }
  maj(partie, montre) {
    this._creer(); if (!this.el) return;
    if (partie !== this._partie) this._brancher(partie || null);
    const on = !!partie && !!(montre || this._force);
    this.montre = on;
    cacher(this.el, !on);
    if (!on) return;
    const P = partie, H = P.hud || {}, id = P.id, prop = id === 'prophunt', L = P.local;
    const sc = H.scores && typeof H.scores.A === 'number' ? H.scores : null;
    texte(this.eTitre, TITRES[id] || 'PARTIE');
    texte(this.eScore, sc ? `${EQUIPES.A.nom} ${sc.A} – ${sc.B} ${EQUIPES.B.nom}` : prop && H.nManches > 1 ? `MANCHE ${H.manche || 1} / ${H.nManches}` : '');
    texte(this.eChrono, typeof H.chrono === 'number' && H.chrono > 0 ? mmss(H.chrono) : '');
    // les colonnes : deux équipes (combat par équipes), sinon une liste
    const cols = prop ? COLONNES.prop : COLONNES.combat;
    const deux = !!sc && !prop;
    const groupes = deux ? (L && L.equipe === 'B' ? ['B', 'A'] : ['A', 'B']) : [null];
    const cl = Array.isArray(H.classement) ? H.classement : [];
    const vus = new Set();
    groupes.forEach((eq, gi) => {
      const G = this.eCols[gi];
      cacher(G.c, false);
      classe(G.c, 'eqA', eq === 'A'); classe(G.c, 'eqB', eq === 'B');
      const ent = `<span class="ts-rg">#</span><span class="ts-nom">${eq ? (EQUIPES[eq] || {}).nom || eq : 'JOUEUR'}${eq && sc ? ` · ${sc[eq]}` : ''}</span>` + cols.map(([, t]) => `<span>${t}</span>`).join('');
      if (G.h.__html !== ent) { G.h.__html = ent; G.h.innerHTML = `<span class="ts-pt"></span>` + ent; }
      const membres = cl.filter((c) => !eq || c.equipe === eq);
      let ordre = '';
      membres.forEach((c, i) => {
        vus.add(c.id); ordre += c.id + ',';
        const ln = this._ligne(c, P, cols);
        texte(ln.rang, i + 1);
        const b = P.acteurParId ? P.acteurParId(c.id) : null, st = (b && b.stats) || {};
        const e = c.elims ?? st.elims ?? 0, m = c.morts ?? st.morts ?? 0;
        const val = { score: c.score ?? st.score ?? 0, e, m, a: c.assists ?? st.assists ?? 0, ratio: (e / Math.max(1, m)).toFixed(2).replace('.', ','),
          serie: this._series.get(c.id) || 0, role: ROLES[c.role] ?? '', trouves: c.role === 'chasseur' ? e : st.trouves ?? '—',
          survie: Math.round(st.survie || 0) + ' s', provocs: st.provocs || 0, faux: st.vraisMeubles ?? st.faux ?? st.rates ?? 0 };
        cols.forEach(([k], j) => texte(ln.vals[j], val[k]));
        classe(ln.el, 'moi', !!L && c.id === L.id); classe(ln.el, 'mort', c.vivant === false);
        classe(ln.el, 'r-prop', c.role === 'prop'); classe(ln.el, 'r-chasseur', c.role === 'chasseur');
        if (ln.el.parentNode !== G.l || ln.groupe !== gi) { G.l.appendChild(ln.el); ln.groupe = gi; G.ordre = null; }
      });
      if (G.ordre !== ordre) { G.ordre = ordre; for (const c of membres) G.l.appendChild(this._lignes.get(c.id).el); }
    });
    for (let gi = groupes.length; gi < 2; gi++) cacher(this.eCols[gi].c, true);
    for (const [k, ln] of this._lignes) if (!vus.has(k)) { ln.el.remove(); this._lignes.delete(k); }
    classe(this.eCorps, 'deux', deux);
    texte(this.ePied, this._force ? '' : 'relâche pour fermer');
  }
  // une ligne par acteur (gardée) : point, rang, portrait 32 px, nom, les valeurs
  _ligne(c, P, cols) {
    let ln = this._lignes.get(c.id);
    if (ln && ln.n === cols.length) { texte(ln.nom, c.nom); return ln; }
    if (ln) ln.el.remove();
    const el = elt('div', 'ts-ligne');
    elt('span', 'ts-pt', el);
    const rang = elt('span', 'ts-rg', el, '');
    const ph = elt('span', 'ts-portrait', el);
    const a = P.acteurParId ? P.acteurParId(c.id) : null, url = a && a.fiche ? portrait(a.fiche) : null;
    if (url) { const im = elt('img', null, ph); im.alt = ''; im.decoding = 'async'; im.loading = 'eager'; im.width = 32; im.height = 32; im.src = url; }
    else { ph.textContent = String(c.nom || '?').trim().charAt(0).toUpperCase(); ph.classList.add('initiale'); }
    const nom = elt('span', 'ts-nom', el, c.nom || '');
    const vals = cols.map(() => elt('span', 'ts-v', el, ''));
    ln = { el, rang, nom, vals, n: cols.length, groupe: -1 };
    this._lignes.set(c.id, ln);
    return ln;
  }
}
