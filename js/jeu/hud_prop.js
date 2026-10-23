// =====================================================================
//  LE HUD DU PROP HUNT (lot L-G, 23/10 ; spec §§ 2.7-2.8, 3.9, 4.5.15, 5.5.10 ; conception_prophunt §§ 1, 8, 11, 13.2)
// =====================================================================
// Haythem PROP : en bas au centre, la forme qu'il a prise (« LE TABOURET VERT ») et ce qu'il lui reste de changements
// (●●○ pendant la traque, ∞ pendant la cachette), le verrou du cap 🔒 et le gel ❄ ; l'ANNEAU DE PROVOCATION qui se vide
// (40 s, « 0:12 » ; à zéro elle part seule) ; la jauge DISCRÉTION en étoiles (⌈discretion × 5⌉, la même crédibilité que
// celle des bots chasseurs) ; l'ŒIL qui se remplit quand un chasseur le regarde et le soupçonne (« REPÉRÉ ! » au-delà de
// 70 %) ; au centre le point de visée et l'aide « E : devenir le tabouret vert » ; les ÉTIQUETTES de ses alliés (≤ 4, leur
// nom au-dessus d'eux, projeté à chaque image) — et, à la révélation, le nom de chaque prop survivant ; la ROUE DES
// PROVOCATIONS (son dessin seulement, d'après `hud.prop.roue` ; la saisie est à PartieProp — jamais game.wheel).
// Haythem CHASSEUR : pendant la cachette, le PANNEAU NOIR #voile-cachette (z-index 12, opaque — pas fx.flash, qui est
// blanc) avec le chrono « LES PROPS SE CACHENT · 0:24 », le tableau des rôles, la mini-carte de la ZONE (silhouette,
// pièces, portes, aucun acteur : js/jeu/minicarte.js dessinerZone) et deux astuces qui changent toutes les 8 s ; pendant
// la traque, le SCANNER (charges ●●○, arcs autour du réticule vers les props à < 12 m, teintés < 4 / < 8 / < 12 m, 2 s)
// et « VRAI MEUBLE −3 » quand il a tiré sur un vrai meuble. Pour tous : les arcs « VOIR LES SONS » au bord de l'écran
// vers chaque provocation (2 s ; l'aide, au téléphone par défaut).
// Mêmes règles du DOM que js/jeu/hud_jeu.js : créé une fois sous #hud (`data-jeu`), textes et classes écrits quand ils
// changent, ce qui bouge par les variables CSS d'UNE racine (une écriture par image), l'horloge du HUD, aucune lecture de
// mise en page. Il lit `partie.hud.prop` et les événements (provocation, scanner, faux, deguise).
import { PROVOCATIONS } from './sons_prop.js';
import { REGLAGES_PROP } from './partie_prop.js';
import * as DG from './deguisements.js';
import { texte, classe, cacher, contenu, elt, Cadre, projeter, angleEcran, ECRAN, REGLAGES_HUD } from './hud_jeu.js';
import { actionKey } from '../settings.js';

export const REGLAGES_HUD_PROP = {
  etiquettes: 8, nom: 30, sons: { slots: 4, duree: 2, cercle: 0.42 }, scanner: { slots: 6, duree: 2, rayon: 64, couleurs: ['#ff3b30', '#ff8a1f', '#ffd166'], bandes: ['< 4 m', '4-8 m', '8-12 m'] },
  faux: 1.3, repere: 0.7, astuces: 8, viseHz: 10,
};
// une icône pour la forme (d'après la clé ou le nom du meuble)
const ICONES = [[/tabouret|miura|tolix/, '🪑'], [/chaise|fauteuil|coque|luge|siège/, '🪑'], [/poubelle|corbeille/, '🗑️'], [/plante/, '🪴'], [/extincteur/, '🧯'],
  [/distributeur/, '🥤'], [/micro/, '📟'], [/baby/, '⚽'], [/carton/, '📦'], [/photocop|affranch/, '🖨️'], [/table|mange/, '🍽️']];
const icone = (s) => { s = String(s || '').toLowerCase(); for (const [re, i] of ICONES) if (re.test(s)) return i; return '📦'; };
const mmss = (s) => { s = Math.max(0, Math.ceil((s || 0) - 1e-6)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SVG_ANNEAU = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="f" cx="22" cy="22" r="18"/><circle class="v" cx="22" cy="22" r="18"/></svg>';
const SVG_OEIL = '<svg viewBox="0 0 32 20" aria-hidden="true"><defs><clipPath id="hp-oeil-c"><path d="M1 10C6 2.5 26 2.5 31 10 26 17.5 6 17.5 1 10z"/></clipPath></defs>'
  + '<path class="c" d="M1 10C6 2.5 26 2.5 31 10 26 17.5 6 17.5 1 10z"/><g clip-path="url(#hp-oeil-c)"><rect class="r" x="0" y="0" width="32" height="20"/></g><circle class="p" cx="16" cy="10" r="3.6"/></svg>';
const SVG_ARC_SON = '<svg viewBox="-60 -60 120 120" aria-hidden="true"><path d="M-21-52A56 56 0 0 1 21-52"/><path class="o" d="M-12-40A42 42 0 0 1 12-40"/></svg>';
const SVG_ARC_SCAN = '<svg viewBox="-80 -80 160 160" aria-hidden="true"><path d="M-21.9-60.1A64 64 0 0 1 21.9-60.1"/></svg>';

export class HudProp {
  constructor(game) { this.game = game; this.el = null; this.roue = null; this.partie = null; this._des = []; this.t = 0; this._raz(); }
  _raz() { this.t = 0; this._sons = []; this._scans = []; this._faux = null; this._viseT = -1; this._vise = null; this._zoneDessinee = null; this.etiquettes = 0; }
  preparer() { this._creer(); }
  _creer() {
    if (this.el) return;
    const hud = document.getElementById('hud'); if (!hud) return;
    const R = this.el = elt('div', 'hp', null); R.id = 'hud-prop'; R.dataset.jeu = '1'; cacher(R, true);
    this.cadre = new Cadre(R);
    const N = (cls, p = R, t) => elt('div', cls, p, t);
    // les arcs « voir les sons » et ceux du scanner, les étiquettes
    const So = N('hp-sons'); this.eSons = [];
    for (let i = 0; i < REGLAGES_HUD_PROP.sons.slots; i++) { const a = N('hp-son s' + i, So); a.innerHTML = SVG_ARC_SON + '<b></b>'; this.eSons.push(a); }
    const Sc = N('hp-scans'); this.eScans = [];
    for (let i = 0; i < REGLAGES_HUD_PROP.scanner.slots; i++) { const a = N('hp-scan-arc s' + i, Sc); a.innerHTML = SVG_ARC_SCAN + '<b></b>'; this.eScans.push(a); }
    const Et = N('hp-etiquettes'); this.eEtiq = [];
    for (let i = 0; i < REGLAGES_HUD_PROP.etiquettes; i++) { const e = N('hp-etiq s' + i, Et); e.innerHTML = '<b></b><small></small>'; this.eEtiq.push(e); }
    // le point de visée et l'aide « E : devenir … »
    this.eVise = N('hp-vise'); this.eVise.innerHTML = '<i></i><span></span>';
    this.eFaux = N('hp-faux', R, '');
    // le bloc du prop (bas centre) : l'anneau de provocation, la forme et ses changements, verrou et gel, la discrétion et
    // l'œil ; les touches dessous
    const Bl = this.eBloc = N('hp-bloc');
    this.eProvoc = elt('div', 'hp-provoc', Bl); this.eProvoc.innerHTML = SVG_ANNEAU + '<b></b><small>PROVOC.</small>';
    this.eIcone = elt('span', 'hp-icone', Bl, ''); const f = elt('div', 'hp-forme', Bl);
    this.eNom = elt('b', null, f, ''); this.eChg = elt('span', 'hp-chg', f, '');
    const et = elt('div', 'hp-etat', Bl); this.eVerrou = elt('span', 'hp-verrou', et, '🔒'); this.eFige = elt('span', 'hp-fige', et, '❄');
    const jg = this.eJauges = elt('div', 'hp-jauges', Bl);
    this.eDisc = elt('div', 'hp-disc', jg); this.eDisc.innerHTML = '<small>DISCRÉTION</small><span></span>';
    this.eOeil = elt('div', 'hp-oeil', jg); this.eOeil.innerHTML = SVG_OEIL + '<b>REPÉRÉ !</b>';
    this.eTouches = N('hp-touches', R, '');
    // le scanner du chasseur
    this.eScan = N('hp-scan'); this.eScan.innerHTML = '<small>SCANNER</small><span></span><em></em>';
    hud.appendChild(R);
    this.roue = new RoueProvocations(hud);
    // LE PANNEAU DE CACHETTE (le chasseur, pendant que les props se cachent) : hors de #hud, z-index 12, noir opaque
    const V = this.eVoile = document.getElementById('voile-cachette') || elt('div', null, document.body);
    V.id = 'voile-cachette'; V.dataset.jeu = '1'; V.innerHTML = '';
    const bx = elt('div', 'vc-boite', V);
    const h = elt('div', 'vc-haut', bx); this.eVcTitre = elt('div', 'vc-titre', h, 'LES PROPS SE CACHENT'); this.eVcChrono = elt('div', 'vc-chrono', h, '');
    const m = elt('div', 'vc-milieu', bx);
    this.eVcRoles = elt('div', 'vc-roles', m);
    const cw = elt('div', 'vc-carte', m); this.eVcCarte = elt('canvas', null, cw); this.eVcCarte.width = 520; this.eVcCarte.height = 300;
    this.eVcBas = elt('div', 'vc-bas', bx); this.eVcA = [elt('p', null, this.eVcBas, ''), elt('p', null, this.eVcBas, '')];
    this.eVcManche = elt('div', 'vc-manche', bx, '');
    cacher(V, true);
  }

  brancher(partie) {
    this._creer(); if (!this.el) return;
    this.debrancher(true);
    this.partie = partie; this._raz();
    const S = (type, fn) => this._des.push(partie.sur(type, fn));
    // les provocations entendues (« voir les sons ») : pas les siennes ; jamais pour le chasseur pendant la cachette
    S('provocation', (e) => {
      const L = partie.local; if (!L || e.a === L.id) return;
      if (L.role === 'chasseur' && partie.phase === 'cachette') return;
      const p = PROVOCATIONS.find((q) => q.id === e.id) || PROVOCATIONS[e.id] || null;
      const A = this._sons; if (A.length >= REGLAGES_HUD_PROP.sons.slots) A.shift();
      A.push({ t0: this.t, x: e.x, y: e.y, z: e.z, icone: p ? p.icone : '🔊', forcee: !!e.forcee });
    });
    // le scanner : un arc par prop trouvé, sa bande (< 4 / < 8 / < 12 m)
    S('scanner', (e) => {
      const L = partie.local; if (!L || e.a !== L.id) return;
      this._scans = (e.resultats || []).slice(0, REGLAGES_HUD_PROP.scanner.slots).map((r) => ({ t0: this.t, dir: r.dir, bande: r.bande }));
      this._scanT = this.t;
    });
    S('faux', (e) => { const L = partie.local; if (L && e.a === L.id) this._faux = { t0: this.t, pv: e.pv }; });
    this.cadre.oublier();
    // (hors du prop hunt, il dort : rien n'est dessiné ni écrit — sauf un état fabriqué qui porte `prop`, voir maj)
    cacher(this.el, partie.id !== 'prophunt');
  }
  debrancher(garder = false) {
    for (const d of this._des) d(); this._des = [];
    if (!garder) this.partie = null;
    if (!this.el) return;
    cacher(this.el, true); cacher(this.eVoile, true);
    if (this.roue) this.roue.maj(null, PROVOCATIONS);
  }
  _aides() {
    const P = this.partie, o = P && P.opts && P.opts.aides, s = this.game.settings, j = s && s.data && s.data.jeu && s.data.jeu.prop && s.data.jeu.prop.aides;
    return { discretion: (o && o.discretion) ?? (j && j.discretion) ?? true, oeil: (o && o.oeil) ?? (j && j.oeil) ?? true, voirSons: (o && o.voirSons) ?? (j && j.voirSons) ?? false };
  }

  maj(dt, hud) {
    if (!this.el) return;
    const H = hud || {}, Pr = H.prop || null, P = this.partie, g = this.game, cam = g.camera;
    // (au combat, le HUD du prop hunt dort ; il se réveille dès que l'état porte `prop`)
    const actif = !!P && (P.id === 'prophunt' || !!Pr);
    cacher(this.el, !actif);
    if (!actif) { if (this.roue) this.roue.maj(null, PROVOCATIONS); cacher(this.eVoile, true); return; }
    this.t += dt || 0;
    const L = P ? P.local : null, C = this.cadre; C.debut();
    const role = Pr ? Pr.role : L ? L.role : null, phase = H.phase || (P && P.phase) || '';
    const prop = role === 'prop' && !!L && L.vivant !== false, chasseur = role === 'chasseur' && !!L && L.vivant !== false;
    const A = this._aides();
    // ---- le bloc du prop ----
    cacher(this.eBloc, !(Pr && prop));
    if (Pr && prop) {
      const nom = Pr.nomForme || (Pr.forme ? (DG.typeDe?.(Pr.forme) || {}).nom : null);
      texte(this.eIcone, Pr.forme ? icone(Pr.forme + ' ' + (nom || '')) : '🧍');
      texte(this.eNom, nom ? String(nom).toUpperCase() : 'HUMAIN');
      const max = (REGLAGES_PROP.changements && REGLAGES_PROP.changements.traque) || 3;
      const reste = Math.max(0, max - (Pr.changements | 0));
      texte(this.eChg, !Pr.forme ? 'vise un meuble' : phase === 'traque' ? '●'.repeat(reste) + '○'.repeat(Math.max(0, max - reste)) : phase === 'cachette' || phase === 'presentation' ? 'changements : ∞' : '');
      classe(this.eVerrou, 'on', !!Pr.verrou); classe(this.eFige, 'on', !!Pr.fige);
      texte(this.eTouches, `${actionKey('deguiser')} SE DÉGUISER · ${actionKey('verrou')} VERROU · ${actionKey('figer')} FIGER · ${actionKey('provoquer')} PROVOQUER`);
    }
    cacher(this.eTouches, !(Pr && prop));
    // ---- l'anneau de provocation (le temps qu'il reste avant la provocation forcée) ----
    const pm = Pr && Pr.provocMax > 0 ? Pr.provocMax : 0, pk = pm ? clamp((Pr.provocT || 0) / pm, 0, 1) : 0;
    cacher(this.eProvoc, !(prop && pm && phase === 'traque'));
    C.v('pk', r2(pk));
    if (prop && pm) { texte(this.eProvoc.children[1], mmss(Pr.provocT || 0)); classe(this.eProvoc, 'urgent', (Pr.provocT || 0) < 5); }
    // ---- la discrétion, l'œil ----
    const disc = clamp(Pr && typeof Pr.discretion === 'number' ? Pr.discretion : 0, 0, 1), et = Math.ceil(disc * 5 - 1e-9);
    // (la discrétion est celle du DÉGUISEMENT : rien à juger tant qu'il est humain)
    cacher(this.eDisc, !(prop && A.discretion && Pr && Pr.forme));
    if (prop) { texte(this.eDisc.lastChild, '★'.repeat(et) + '☆'.repeat(5 - et)); this.etoiles = et; }
    const oe = clamp(Pr && typeof Pr.oeil === 'number' ? Pr.oeil : 0, 0, 1);
    cacher(this.eOeil, !(prop && A.oeil && phase === 'traque'));
    C.v('oe', r2(oe));
    classe(this.eOeil, 'repere', oe > REGLAGES_HUD_PROP.repere);
    cacher(this.eJauges, this.eDisc.__h && this.eOeil.__h);
    // ---- le point de visée et l'aide « E : devenir … » (le meuble visé : `hud.prop.vise` si les règles le donnent, sinon
    //      viserMeuble, 10 fois par seconde — une lecture, comme les bots la feraient) ----
    let vise = null;
    if (prop && Pr && (phase === 'cachette' || phase === 'traque' || phase === 'presentation')) {
      if (Pr.vise !== undefined) vise = Pr.vise ? (typeof Pr.vise === 'string' ? Pr.vise : Pr.vise.nom) : null;
      else {
        if (this.t - this._viseT >= 1 / REGLAGES_HUD_PROP.viseHz || this._viseT < 0) {
          this._viseT = this.t;
          let v = null;
          try { v = DG.viserMeuble(P, L, g.camYaw, g.camPitch); } catch (e) { v = null; }
          this._vise = v && v.cle !== Pr.forme ? ((DG.typeDe?.(v.cle) || {}).nom || v.cle) : null;
        }
        vise = this._vise;
      }
    }
    cacher(this.eVise, !prop);
    texte(this.eVise.lastChild, vise ? `${actionKey('deguiser')} : devenir ${vise}` : '');
    classe(this.eVise, 'cible', !!vise);
    this.aide = vise ? this.eVise.lastChild.textContent : '';
    // ---- « VRAI MEUBLE −3 » (le chasseur a tiré sur un vrai meuble) ----
    const F = this._faux, fa = F ? this.t - F.t0 : 99;
    if (F && fa < REGLAGES_HUD_PROP.faux) texte(this.eFaux, `VRAI MEUBLE −${Math.round(F.pv || REGLAGES_PROP.penalite.meuble)}`);
    C.v('fo', r2(fa < REGLAGES_HUD_PROP.faux ? clamp((REGLAGES_HUD_PROP.faux - fa) / 0.3, 0, 1) : 0));
    C.v('fk', r2(fa < 0.15 ? 1.25 - fa / 0.15 * 0.25 : 1));
    // ---- le scanner du chasseur ----
    const Sn = Pr && Pr.scanner;
    cacher(this.eScan, !(chasseur && Sn && phase === 'traque'));
    if (chasseur && Sn) {
      const n = Math.max(0, Sn.charges | 0), max = (REGLAGES_PROP.scanner && REGLAGES_PROP.scanner.charges) || 3;
      texte(this.eScan.children[1], '●'.repeat(Math.min(n, max)) + '○'.repeat(Math.max(0, max - n)));
      texte(this.eScan.children[2], Sn.t > 0.05 ? mmss(Sn.t) : n > 0 ? `${actionKey('scanner')} PRÊT` : '');
    }
    const Rs = REGLAGES_HUD_PROP.scanner;
    for (let s = 0; s < Rs.slots; s++) {
      const a = this._scans[s], age = a ? this.t - a.t0 : 99;
      if (!a || age > Rs.duree) { C.v('s' + s + 'o', 0); C.v('s' + s + 'r', 0); continue; }
      // (dir : la direction du prop dans le MONDE — un lacet en radians, ou un vecteur { x, z } ; bande : 0 / 1 / 2, ou 4 / 8 / 12 m)
      const ang = typeof a.dir === 'number' ? (g.camYaw - a.dir) * 180 / Math.PI : a.dir && typeof a.dir.x === 'number' ? angleEcran(g.camYaw, a.dir.x, a.dir.z) : 0;
      C.v('s' + s + 'r', r1(((ang % 360) + 540) % 360 - 180)); C.v('s' + s + 'o', r2(clamp((Rs.duree - age) / 0.4, 0, 1)));
      const bb = a.bande | 0, b = clamp(bb > 2 ? (bb <= 4 ? 0 : bb <= 8 ? 1 : 2) : bb, 0, 2);
      for (let k = 0; k < 3; k++) classe(this.eScans[s], 'b' + k, k === b);
      // (la bande écrite sur l'arc, droite quel que soit l'angle : « 4-8 m », § 2.8)
      texte(this.eScans[s].lastChild, Rs.bandes[b]);
    }
    // ---- « voir les sons » : un arc au bord de l'écran vers chaque provocation, 2 s ----
    const Rn = REGLAGES_HUD_PROP.sons;
    for (let s = 0; s < Rn.slots; s++) {
      const a = A.voirSons && L ? this._sons[s] : null, age = a ? this.t - a.t0 : 99;
      if (!a || age > Rn.duree) { C.v('n' + s + 'o', 0); C.v('n' + s + 'r', 0); continue; }
      const ang = angleEcran(g.camYaw, a.x - L.pos.x, a.z - L.pos.z);
      C.v('n' + s + 'r', r1(ang)); C.v('n' + s + 'o', r2(clamp((Rn.duree - age) / 0.5, 0, 1)));
      texte(this.eSons[s].lastChild, a.icone); classe(this.eSons[s], 'forcee', a.forcee);
      const dy = a.y - L.pos.y; classe(this.eSons[s], 'dessous', dy < -1.6); classe(this.eSons[s], 'dessus', dy > 1.6);
    }
    for (let i = this._sons.length - 1; i >= 0; i--) if (this.t - this._sons[i].t0 > Rn.duree) this._sons.splice(i, 1);
    // ---- les étiquettes : les alliés (≤ 4) ; à la révélation, chaque prop survivant et sa forme ----
    const etiq = [];
    if (P && cam) {
      if (phase === 'revelation' || phase === 'fin') {
        for (const a of P.acteurs) if (a.vivant && (a.role === 'prop' || a.prop) && a.corps) {
          const c = a.corps.posAff || a.corps.pos, h = a.prop && a.prop.T && a.prop.T.haut ? a.prop.T.haut : 1.0;
          etiq.push({ x: c.x, y: (Number.isFinite(a.corps.solAff) ? a.corps.solAff : c.y) + h + 0.35, z: c.z, nom: a.nom, forme: a.prop && a.prop.T ? a.prop.T.nom : '', rev: true });
        }
      } else if (Array.isArray(H.allies)) for (const a of H.allies.slice(0, 4)) {
        const b = P.acteurParId(a.id), h = b && b.prop && b.prop.T && b.prop.T.haut;
        etiq.push({ x: a.x, y: h ? (Number.isFinite(b.corps.solAff) ? b.corps.solAff : b.pos.y) + h + 0.3 : a.y, z: a.z, nom: a.nom, forme: '', rev: false });
      }
    }
    this.etiquettes = 0;
    for (let s = 0; s < REGLAGES_HUD_PROP.etiquettes; s++) {
      const a = etiq[s], e = this.eEtiq[s];
      if (!a) { C.v('e' + s + 'x', 0); C.v('e' + s + 'y', 0); C.v('e' + s + 'o', 0); continue; }
      const q = projeter(cam, a.x, a.y, a.z);
      const ok = q.devant && q.x > -40 && q.x < ECRAN.w + 40 && q.y > -40 && q.y < ECRAN.h + 40 && (a.rev || q.d <= REGLAGES_HUD_PROP.nom);
      C.v('e' + s + 'x', r1(q.x)); C.v('e' + s + 'y', r1(q.y)); C.v('e' + s + 'o', ok ? 1 : 0);
      if (ok) this.etiquettes++;
      texte(e.children[0], String(a.nom || '').toUpperCase()); texte(e.children[1], a.forme ? String(a.forme) : '');
      classe(e, 'rev', a.rev);
    }
    C.ecrire();
    // ---- la roue (son dessin), le panneau de cachette ----
    if (this.roue) this.roue.maj(prop && Pr ? Pr.roue : null, PROVOCATIONS);
    this._majCachette(H, Pr, P);
  }

  // LE PANNEAU DE CACHETTE : `hud.prop.cachette` = { chrono, roles: [{ id, nom, role, vivant }], astuces: [texte] }
  _majCachette(H, Pr, P) {
    const K = Pr && Pr.cachette;
    cacher(this.eVoile, !K);
    if (!K) return;
    texte(this.eVcChrono, mmss(K.chrono ?? H.chrono ?? 0));
    const roles = Array.isArray(K.roles) ? K.roles : [];
    const col = (r, titre, cls) => `<div class="vc-col ${cls}"><h4>${titre}</h4>` + roles.filter((x) => x.role === r).map((x) =>
      `<p class="${x.vivant === false ? 'mort' : ''}${P && P.local && x.id === P.local.id ? ' moi' : ''}">${esc(x.nom)}</p>`).join('') + '</div>';
    contenu(this.eVcRoles, col('prop', 'PROPS', 'props') + col('chasseur', 'CHASSEURS', 'chasseurs'));
    // deux astuces, qui changent toutes les 8 s (si les règles en donnent plus de deux)
    const As = Array.isArray(K.astuces) ? K.astuces : [];
    const tour = As.length > 2 ? Math.floor(Math.max(0, (H.phaseDuree || 0) - (K.chrono ?? 0)) / REGLAGES_HUD_PROP.astuces) : 0;
    for (let i = 0; i < 2; i++) texte(this.eVcA[i], As.length ? As[(tour * 2 + i) % As.length] || '' : '');
    texte(this.eVcManche, H.nManches > 1 ? `MANCHE ${H.manche || 1} / ${H.nManches}` : '');
    // la mini-carte de la zone, dessinée une fois par zone
    const zone = P ? P.zone : null, M = P && P.aff && P.aff.minicarte;
    if (M && M.dessinerZone && zone && this._zoneDessinee !== zone) { this._zoneDessinee = zone; this.zoneDessin = M.dessinerZone(this.eVcCarte, zone); }
  }
}

// LA ROUE DES PROVOCATIONS (le DESSIN) : 8 secteurs — 0 en haut, sens horaire, comme la saisie (PartieProp._secteur) —,
// chacun avec son icône, son nom et son rayon ; le secteur `choix` en surbrillance dans la MÊME image que le changement de
// `hud.prop.roue.choix` ; cachée quand `ouverte` est faux. Jamais game.wheel.
export class RoueProvocations {
  constructor(parent) {
    this.el = document.createElement('div'); this.el.id = 'roue-provocations'; this.el.className = 'roue-provocations'; this.el.dataset.jeu = '1';
    this.el.hidden = true; this.el.__h = true;
    this.secteurs = []; this._liste = null; this._choix = null;
    this.eCentre = elt('div', 'rp-centre', this.el); this.eCentreI = elt('b', null, this.eCentre, ''); this.eCentreT = elt('span', null, this.eCentre, ''); this.eCentreR = elt('small', null, this.eCentre, '');
    if (parent) parent.appendChild(this.el);
  }
  _construire(L) {
    for (const s of this.secteurs) s.remove();
    this.secteurs = L.map((p, i) => {
      const s = elt('div', 'rp-sec s' + i, this.el);
      const a = i * Math.PI / 4;
      s.style.setProperty('--sx', (Math.sin(a)).toFixed(4)); s.style.setProperty('--sy', (-Math.cos(a)).toFixed(4));
      s.innerHTML = `<i>${esc(p.icone)}</i><span>${esc(p.label)}</span><small>${p.rayon} m · +${p.points}</small><em>${i + 1}</em>`;
      return s;
    });
    this._liste = L;
  }
  maj(roue, provocations) {
    const ouverte = !!(roue && roue.ouverte);
    cacher(this.el, !ouverte);
    if (!ouverte) { this._choix = null; return; }
    const L = provocations || [];
    if (this._liste !== L) this._construire(L);
    // (420 px de diamètre : réduite sur un petit écran, à l'ouverture seulement)
    const k = Math.round(Math.min(1, ECRAN.h / 470, ECRAN.w / 520) * 100) / 100;
    if (k !== this._k) { this._k = k; this.el.style.transform = k < 1 ? `scale(${k})` : ''; }
    const c = typeof roue.choix === 'number' ? roue.choix : -1;
    if (c === this._choix) return;
    this._choix = c;
    this.secteurs.forEach((s, i) => classe(s, 'on', i === c));
    const p = L[c];
    texte(this.eCentreI, p ? p.icone : '📢'); texte(this.eCentreT, p ? p.label : 'CHOISIS UNE PROVOCATION');
    texte(this.eCentreR, p ? `entendue à ${p.rayon} m · +${p.points} points` : 'glisse vers un secteur, puis lâche');
  }
  get choix() { return this._choix; }
}
