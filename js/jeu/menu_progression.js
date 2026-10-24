// =====================================================================
//  L'ARMURERIE ET LE PROFIL — lot L-P (vague 3, 24/10 ; spec §§ 2.1, 5.7.3 ; CoD §§ 11, 12)
// =====================================================================
// Deux écrans du menu principal (ses portes ARMURERIE et PROFIL, js/jeu/menus_jeu.js), et la barre d'XP sous le titre.
//   - L'ARMURERIE : les neuf classes (les quatre de départ, puis cinq PERSONNALISÉES au niveau 6), la classe choisie en
//     détail — arme principale et son accessoire, secondaire, grenade, flash, atout, camouflage (ce qui n'est pas encore
//     débloqué est GRISÉ, avec le niveau qui le donne ; une classe de départ montre ce qu'elle gagnera) — et les chiffres de
//     l'arme (dégâts, cadence, portée, maniabilité, mobilité, chargeur : la fiche ÉQUIPÉE contre la fiche nue, l'écart en
//     clair). L'arme elle-même TOURNE à droite de l'écran : `aff.viewmodel.vitrine(id)`, la scène de l'arme de vue de L-V
//     (aucune lumière ajoutée à la scène de jeu, js/jeu/viewmodel.js pas touché), décalée par la vue de sa caméra
//     (`setViewOffset`, rendue à la sortie) pour tomber dans la moitié libre de l'écran ; son camouflage posé sur la
//     teinte de l'arme LE TEMPS DE LA VITRINE (rendue en sortant : au menu, aucun bot ne la porte). « PRENDRE CETTE
//     CLASSE » la met dans les réglages du combat.
//   - LE PROFIL : le niveau, la barre, le prochain déblocage ; les trois défis du jour ; les totaux, les chiffres par arme
//     (avec l'or à 100 têtes) et par mode ; les seize médailles ; la frise des déblocages de 1 à 40.
// Au clavier (flèches, ENTRÉE, ÉCHAP : la navigation de MenuJeu), à la manette (racines 'armurerie-jeu' et 'profil-jeu',
// B revient), au doigt. Affichage seulement : le profil (js/jeu/profil.js) est la seule chose qu'on écrit (une classe
// personnalisée), et le choix de la classe passe par `settings.jeu.combat.classe` comme les autres réglages du combat.
import { ajouterRacine } from '../manette_menus.js';
import { ARMES } from './armes.js';
import { MATERIAUX_ARMES } from './modeles_armes.js';
import { ACCESSOIRES, ATOUTS, MEDAILLES, ficheEquipee } from './series.js';
import { Profil, CLASSES_DEPART, CAMOUFLAGES, DEBLOCAGES, NIVEAU_MAX, ARMES_PROFIL, MODES_PROFIL, niveauRequis, nomArme, dateDuJour } from './profil.js';

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const milliers = (v) => String(Math.round(+v || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const pc = (a, b) => (b ? Math.round(100 * a / b) : 0);
const duree = (s) => { s = Math.round(+s || 0); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`; };
const PRINCIPALES = ['fa24', 'pm9', 'fp12', 'tp50'];
// les noms proposés pour une classe personnalisée (au clavier comme à la manette : pas de saisie)
export const NOMS_CLASSES = ['PERSO', 'POLYVALENT', 'COMBAT RAPPROCHÉ', 'LONGUE PORTÉE', 'FURTIF', 'TENIR LE POINT', 'ÉCLAIREUR', 'ASSAUT LOURD'];
// LES CHIFFRES D'UNE ARME (barres de 0 à 1, contre la meilleure de l'arsenal) : dégâts (une balle au torse à 10 m, × plombs),
// cadence, portée (le premier palier qui baisse), maniabilité (l'inverse du temps de visée), mobilité, chargeur
export function chiffresArme(f) {
  if (!f) return [];
  const tot = (g) => (g.degats[0][1] * (g.zones.torse || 1)) * (g.plombs || 1);
  const portee = (g) => { const p = g.degats.find(([d]) => Number.isFinite(d)); return p ? p[0] : 60; };
  const L = ARMES_PROFIL.map((id) => ARMES[id]);
  const max = { degats: Math.max(...L.map(tot)), rpm: Math.max(...L.map((g) => g.rpm)), portee: 30, ads: Math.min(...L.map((g) => g.ads)), mob: 1.1, ch: 48 };
  return [
    ['DÉGÂTS', Math.min(1, tot(f) / max.degats), `${Math.round(tot(f))}`],
    ['CADENCE', Math.min(1, f.rpm / max.rpm), `${f.rpm} cps/min`],
    ['PORTÉE', Math.min(1, portee(f) / max.portee), `${Math.round(portee(f) * 10) / 10} m`],
    ['MANIABILITÉ', Math.min(1, max.ads / f.ads), `${Math.round(f.ads * 100) / 100} s`],
    ['MOBILITÉ', Math.min(1, (f.mobilite || 1) / max.mob), `× ${(f.mobilite || 1).toFixed(2)}`],
    ['CHARGEUR', Math.min(1, f.chargeur / max.ch), `${f.chargeur} / ${f.reserve}`],
  ];
}

export class MenuProgression {
  constructor(game, menu) {
    this.game = game; this.menu = menu; this.profil = new Profil();
    this.sel = 'assaut'; this._vitrine = null; this._teinte = null;
    this._construire();
    ajouterRacine('armurerie-jeu', { retour: '#armurerie-jeu [data-act="retour"]', defaut: '#armurerie-jeu .ar-classe.on', avant: 'menu-jeu' });
    ajouterRacine('profil-jeu', { retour: '#profil-jeu [data-act="retour"]', defaut: '#profil-jeu [data-act="retour"]', avant: 'menu-jeu' });
    this.profil.ecouter(() => this.majBarre());
  }
  _construire() {
    const B = document.body;
    const a = this.armEl = document.createElement('div');
    a.id = 'armurerie-jeu'; a.className = 'prog-ecran armurerie-jeu'; a.hidden = true;
    a.innerHTML = '<div class="ar-panneau"><header class="rj-tete"><button class="back rj-retour" data-act="retour">← RETOUR</button><h2 class="rj-titre">ARMURERIE</h2>'
      + '<span class="rj-fil ar-fil"></span></header><div class="ar-corps"><nav class="ar-classes"></nav><div class="ar-detail"></div></div></div>'
      + '<aside class="ar-scene"><div class="ar-arme"><div class="ar-arme-nom"></div><div class="ar-arme-acc"></div></div><div class="ar-chiffres"></div></aside>';
    a.addEventListener('click', (e) => this._clicArmurerie(e));
    B.appendChild(a);
    const p = this.profEl = document.createElement('div');
    p.id = 'profil-jeu'; p.className = 'prog-ecran profil-jeu reglage-jeu'; p.hidden = true;
    p.innerHTML = '<div class="rj-boite pf-boite"><header class="rj-tete"><button class="back rj-retour" data-act="retour">← RETOUR</button><h2 class="rj-titre">PROFIL</h2>'
      + '<span class="rj-fil pf-fil"></span></header><div class="rj-corps pf-corps"></div></div>';
    p.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b && b.dataset.act === 'retour') this.menu.accueil(); });
    B.appendChild(p);
  }
  get ouvert() { return (this.armEl && !this.armEl.hidden) || (this.profEl && !this.profEl.hidden); }
  cacher() {
    if (this.armEl) this.armEl.hidden = true;
    if (this.profEl) this.profEl.hidden = true;
    this._montrerArme(null);
    if (this._fige) { this._fige = false; if (this.menu) this.menu.figer = null; }
  }
  // (la caméra du menu tenue sur son plan le temps de l'armurerie : sinon son fondu au noir, toutes les 12 s, passerait sur
  // l'arme — dessinée dans l'image, sous l'écran)
  _figerCamera() {
    if (!this.menu || this.menu.figer) return;
    const c = this.game.camera; if (!c) return;
    c.updateMatrixWorld(); const e = c.matrixWorld.elements, p = c.position;
    this.menu.figer = { cam: [p.x, p.y, p.z], vise: [p.x - e[8] * 5, p.y - e[9] * 5, p.z - e[10] * 5] };
    this._fige = true;
  }

  // ================================================================ LA BARRE D'XP SOUS LE TITRE (l'accueil)
  majBarre() {
    const el = this.menu && this.menu.el && this.menu.el.querySelector('.mj-xp'); if (!el) return;
    const P = this.profil.progression(), D = this.profil.defisDuJour(), faits = D.filter((d) => d.fini).length;
    const fin = P.fin === null ? 'NIVEAU MAX' : `${milliers(P.dans)} / ${milliers(P.cout)} XP`;
    const h = `<div class="mjx-niv"><span>NIV.</span><b>${P.niveau}</b></div><div class="mjx-col"><div class="mjx-barre"><i style="transform:scaleX(${P.k.toFixed(3)})"></i></div>`
      + `<div class="mjx-txt"><span>${fin}</span><span>DÉFIS DU JOUR ${faits} / ${D.length}</span></div></div>`;
    if (el.__h !== h) { el.__h = h; el.innerHTML = h; }
    el.hidden = false;
  }

  // ================================================================ L'ARMURERIE
  armurerie(id = null) {
    this.menu.cacher();
    const cur = this.menu._valeur ? this.menu._valeur('jeu.combat.classe') : null;
    this.sel = id || (cur && this.profil.classeJouable(cur) ? cur : this.sel) || 'assaut';
    this.armEl.hidden = false;
    this._figerCamera();
    this._rendreArmurerie();
    const b = this.armEl.querySelector('.ar-classe.on'); if (b && !document.body.classList.contains('touch')) b.focus({ preventScroll: true });
  }
  _rendreArmurerie() {
    const P = this.profil, n = P.niveau, L = P.classes(n), sel = L.find((c) => c.id === this.sel) || L[0];
    this.sel = sel.id;
    const prise = this.menu._valeur ? this.menu._valeur('jeu.combat.classe') : null;
    this.armEl.querySelector('.ar-fil').textContent = `NIVEAU ${n} · ${milliers(P.xp)} XP`;
    this.armEl.querySelector('.ar-classes').innerHTML = L.map((c) => `<button class="ar-classe${c.id === sel.id ? ' on' : ''}${c.verrou ? ' ko' : ''}${c.id === prise ? ' prise' : ''}" `
      + `data-act="classe" data-classe="${c.id}" id="ar-c-${c.id}">${c.perso ? '<i>PERSO</i>' : ''}<b>${esc(c.nom)}</b>${c.verrou ? `<small>NIVEAU ${c.verrou}</small>` : c.id === prise ? '<small>EN JEU</small>' : ''}</button>`).join('');
    const E = P.equipement(sel.id, n), D = this.armEl.querySelector('.ar-detail');
    let h = '';
    if (sel.verrou) {
      h += `<div class="ar-verrou">Cette classe se débloque au <b>niveau ${sel.verrou}</b>.</div>`;
    }
    const ligne = (id, titre, sous, ctl) => `<div class="rj-ligne ar-ligne" data-ligne="${id}"><div class="rj-lbl">${titre}${sous ? `<small>${sous}</small>` : ''}</div><div class="rj-ctl">${ctl}</div></div>`;
    const seg = (champ, opts, cur) => `<div class="seg rj-seg">${opts.map(([v, l, raison, titre]) => `<button data-act="champ" data-champ="${champ}" data-v="${esc(JSON.stringify(v))}"`
      + ` class="${JSON.stringify(v) === JSON.stringify(cur) ? 'on' : ''}${raison ? ' ko' : ''}"${raison ? ` disabled title="${esc(raison)}"` : titre ? ` title="${esc(titre)}"` : ''}>${l}</button>`).join('')}</div>`;
    const verrou = (t, x) => { const k = niveauRequis(t, x); return k > n ? `NIVEAU ${k}` : null; };
    if (!sel.perso) {
      // une classe de départ : ce qu'elle porte, et ce qu'elle gagnera
      const C = CLASSES_DEPART[sel.id];
      const futur = (t, x) => (x ? (verrou(t, x) ? `<span class="ar-futur">${esc(t === 'atout' ? ATOUTS[x].nom : ACCESSOIRES[x].nom)} au ${verrou(t, x).toLowerCase()}</span>` : esc(t === 'atout' ? ATOUTS[x].nom : ACCESSOIRES[x].nom)) : '—');
      h += ligne('principale', 'Arme principale', esc(ARMES[E.principale].nom), `<span class="ar-val">${esc(nomArme(E.principale))}</span>`);
      h += ligne('accessoire', 'Accessoire', C.accessoire ? esc(ACCESSOIRES[C.accessoire].texte) : '', `<span class="ar-val">${futur('accessoire', C.accessoire)}</span>`);
      h += ligne('secondaire', 'Arme secondaire', esc(ARMES[E.secondaire].nom), `<span class="ar-val">${esc(nomArme(E.secondaire))}</span>`);
      h += ligne('grenades', 'Grenades', '', `<span class="ar-val">${E.letale ? 'Grenade' : '—'} · ${E.tactique ? (E.tactique[1] > 1 ? '2 flashs' : 'Flash') : '—'}</span>`);
      h += ligne('atout', 'Atout', C.atout ? esc(ATOUTS[C.atout].texte) : '', `<span class="ar-val">${futur('atout', C.atout)}</span>`);
    } else {
      const c = P.classePerso(sel.id), dis = !!sel.verrou;
      const opt = (L) => (dis ? L.map(([v, l]) => [v, l, `NIVEAU ${sel.verrou}`]) : L);
      h += ligne('nom', 'Nom', '', seg('nom', opt(NOMS_CLASSES.map((x, k) => [k === 0 ? `PERSO ${sel.id.slice(5)}` : x, k === 0 ? `PERSO ${sel.id.slice(5)}` : x])), c.nom));
      h += ligne('principale', 'Arme principale', esc(ARMES[c.principale].nom), seg('principale', opt(PRINCIPALES.map((x) => [x, esc(nomArme(x)), verrou('arme', x), ARMES[x].nom])), c.principale));
      h += ligne('accessoire', 'Accessoire', c.accessoire ? esc(ACCESSOIRES[c.accessoire].texte) : 'Un seul, sur l’arme principale.',
        seg('accessoire', opt([[null, 'AUCUN'], ...Object.values(ACCESSOIRES).map((A) => [A.id, esc(A.nom.toUpperCase()), verrou('accessoire', A.id) || (A.armes.includes(c.principale) ? null : `pas sur le ${nomArme(c.principale)}`), A.texte])]), c.accessoire));
      h += ligne('secondaire', 'Arme secondaire', esc(ARMES.p17.nom), '<span class="ar-val">P-17</span>');
      h += ligne('letale', 'Grenade', '160 dégâts à 2 m.', seg('letale', opt([['frag', 'GRENADE'], [null, 'AUCUNE']]), c.letale));
      h += ligne('tactique', 'Flash', 'Aveugle 0,8 à 4 s.', seg('tactique', opt([['flash', 'UNE FLASH'], ['flash2', 'DEUX FLASHS'], [null, 'AUCUNE']]), c.tactique));
      h += ligne('atout', 'Atout', c.atout ? esc(ATOUTS[c.atout].texte) : 'Un seul.', seg('atout', opt([[null, 'AUCUN'], ...Object.values(ATOUTS).map((A) => [A.id, esc(A.nom.toUpperCase()), verrou('atout', A.id), A.texte])]), c.atout));
      h += ligne('camo', 'Camouflage', 'La teinte de l’arme principale.', seg('camo', opt([[null, 'AUCUN'], ...Object.values(CAMOUFLAGES).map((C) => [C.id,
        `<i class="ar-camo" style="--c:${C.couleur}"></i>${esc(C.nom.toUpperCase())}`, C.id === 'or' ? (P.aOr(c.principale) ? null : `100 têtes au ${nomArme(c.principale)}`) : verrou('camo', C.id)])]), c.camo));
    }
    h += `<div class="ar-pied"><button class="btn-primary ar-prendre" data-act="prendre"${sel.verrou ? ' disabled' : ''}>${sel.id === prise ? 'CLASSE EN JEU' : 'PRENDRE CETTE CLASSE'}</button></div>`;
    D.innerHTML = h;
    this._rendreArme(E);
  }
  // l'arme principale de la classe : la vitrine, son nom, son accessoire, ses chiffres (équipée contre nue)
  _rendreArme(E) {
    const base = ARMES[E.principale], f = ficheEquipee(base, E.accessoire, E.atout);
    this.armEl.querySelector('.ar-arme-nom').textContent = base.nom;
    this.armEl.querySelector('.ar-arme-acc').textContent = [E.accessoire ? ACCESSOIRES[E.accessoire].nom : null, E.atout ? 'Atout ' + ATOUTS[E.atout].nom : null, E.camo ? 'Camouflage ' + CAMOUFLAGES[E.camo].nom : null].filter(Boolean).join(' · ');
    const C0 = chiffresArme(base), C1 = chiffresArme(f);
    this.armEl.querySelector('.ar-chiffres').innerHTML = C1.map(([n, k, v], i) => {
      const d = k - C0[i][1], cls = Math.abs(d) < 0.005 ? '' : d > 0 ? ' plus' : ' moins';
      return `<div class="ar-ch${cls}"><span>${n}</span><i><b style="transform:scaleX(${Math.min(k, C0[i][1]).toFixed(3)})"></b>${Math.abs(d) >= 0.005 ? `<u style="left:${(Math.min(k, C0[i][1]) * 100).toFixed(1)}%;width:${(Math.abs(d) * 100).toFixed(1)}%"></u>` : ''}</i><em>${esc(v)}</em></div>`;
    }).join('');
    this._montrerArme(E.principale, E.camo);
  }
  // LA VITRINE : l'arme qui tourne dans la scène de l'arme de vue, décalée vers la moitié droite de l'écran
  _montrerArme(id, camo = null) {
    const A = this.game.depsJeu && id ? this.game.depsJeu.affichage : (this.game.depsJeu && this.game.depsJeu._aff) || null;
    const vm = id ? A && A.viewmodel : this._vm;
    this._camo(null);
    if (!vm || !vm.vitrine) return;
    if (!id) { if (this._vitrine) { vm.vitrine(null); if (vm.camera && vm.camera.clearViewOffset) vm.camera.clearViewOffset(); } this._vitrine = null; this._vm = null; return; }
    this._vm = vm;
    if (this._vitrine !== id) { vm.vitrine(id); this._vitrine = id; }
    this._decaler(vm);
    this._camo(id, camo);
  }
  _decaler(vm) {
    const c = vm.camera, W = window.innerWidth || 1280, H = window.innerHeight || 720; if (!c || !c.setViewOffset) return;
    const etroit = W < 760, k = etroit ? 1.7 : 1.32, cx = etroit ? 0.5 : 0.73, cy = etroit ? 0.3 : 0.44;
    c.aspect = W / H;
    c.setViewOffset(W * k, H * k, W * k / 2 - cx * W, H * k / 2 - cy * H, W, H);
  }
  // le camouflage sur la teinte de l'arme (le temps de la vitrine : rendue en sortant)
  _camo(id, camo = null) {
    if (this._teinte) { const T = this._teinte; T.mat.color.copy(T.couleur); T.mat.metalness = T.metal; T.mat.roughness = T.rugo; this._teinte = null; }
    if (!id || !camo || !CAMOUFLAGES[camo]) return;
    const mat = MATERIAUX_ARMES.teinte(id); if (!mat || !mat.color) return;
    this._teinte = { mat, couleur: mat.color.clone(), metal: mat.metalness, rugo: mat.roughness };
    mat.color.set(CAMOUFLAGES[camo].couleur);
    if (camo === 'or') { mat.metalness = 0.9; mat.roughness = 0.28; }
  }
  _clicArmurerie(e) {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const act = b.dataset.act;
    if (act === 'retour') { this.menu.accueil(); return; }
    if (act === 'classe') { this.sel = b.dataset.classe; this._rendreArmurerie(); this._refocus('#ar-c-' + this.sel); return; }
    if (act === 'prendre') {
      if (!this.profil.classeJouable(this.sel)) return;
      this.menu._poser?.('jeu.combat.classe', this.sel);
      this._rendreArmurerie(); this._refocus('.ar-prendre');
      return;
    }
    if (act === 'champ') {
      const c = this.profil.classePerso(this.sel); if (!c) return;
      let v; try { v = JSON.parse(b.dataset.v); } catch (er) { v = b.dataset.v; }
      const n = { ...c, [b.dataset.champ]: v };
      // (une arme principale changée : l'accessoire qui ne lui va pas tombe, l'or non gagné aussi)
      if (b.dataset.champ === 'principale') { if (n.accessoire && !ACCESSOIRES[n.accessoire].armes.includes(v)) n.accessoire = null; if (n.camo === 'or' && !this.profil.aOr(v)) n.camo = null; }
      this.profil.poserClasse(this.sel, n);
      const sel = `#armurerie-jeu [data-champ="${b.dataset.champ}"][data-v='${b.dataset.v}']`;
      this._rendreArmurerie(); this._refocus(sel);
    }
  }
  _refocus(sel) { const n = this.armEl.querySelector(sel) || document.querySelector(sel); if (n && !n.disabled) n.focus({ preventScroll: true }); }

  // ================================================================ LE PROFIL
  profilEcran() {
    this.menu.cacher();
    this.profEl.hidden = false;
    this._rendreProfil();
    const c = this.profEl.querySelector('.pf-corps'); if (c) c.scrollTop = 0;
  }
  _rendreProfil() {
    const P = this.profil, D = P.donnees, G = P.progression(), n = G.niveau, T = D.totaux, prochain = P.prochainDeblocage(n);
    this.profEl.querySelector('.pf-fil').textContent = `${milliers(P.xp)} XP AU TOTAL`;
    let h = `<section class="pf-tete"><div class="pf-niv"><span>NIVEAU</span><b>${n}</b></div><div class="pf-prog"><div class="mjx-barre pf-barre"><i style="transform:scaleX(${G.k.toFixed(3)})"></i></div>`
      + `<div class="pf-prog-t">${G.fin === null ? 'NIVEAU MAXIMUM ATTEINT' : `${milliers(G.dans)} / ${milliers(G.cout)} XP · encore ${milliers(G.cout - G.dans)} pour le niveau ${n + 1}`}</div>`
      + (prochain ? `<div class="pf-prochain">NIVEAU ${prochain.niveau} : ${prochain.quoi.map((q) => esc(q.nom)).join(', ')}</div>` : '') + '</div></section>';
    // les défis du jour
    const Dj = P.defisDuJour();
    h += `<h3 class="pf-h">DÉFIS DU JOUR <small>${esc(dateDuJour().split('-').reverse().join('/'))} · renouvelés à minuit</small></h3><div class="pf-defis">`
      + Dj.map((d) => `<div class="pf-defi${d.fini ? ' fini' : ''}"><b>${esc(d.texte)}</b><i><u style="transform:scaleX(${(d.fait / d.n).toFixed(3)})"></u></i><span>${d.fini ? 'RÉUSSI' : `${d.fait} / ${d.n}`} · +${d.xp} XP</span></div>`).join('') + '</div>';
    // les totaux
    const ratio = T.morts ? (T.elims / T.morts).toFixed(2).replace('.', ',') : String(T.elims);
    const chiffres = [['parties', T.parties], ['victoires', `${T.victoires} (${pc(T.victoires, T.parties)} %)`], ['éliminations', milliers(T.elims)], ['morts', milliers(T.morts)],
      ['ratio', ratio], ['précision', `${pc(T.touches, T.tirs)} %`], ['têtes', milliers(T.tetes)], ['assistances', milliers(T.assists)], ['meilleure série', T.serie], ['temps de jeu', duree(T.temps)]];
    h += '<h3 class="pf-h">EN TOUT</h3><div class="pf-totaux">' + chiffres.map(([l, v]) => `<div><b>${esc(v)}</b><span>${l}</span></div>`).join('') + '</div>';
    // par arme
    h += '<h3 class="pf-h">PAR ARME</h3><div class="pf-table"><div class="pf-tr pf-th"><span>ARME</span><span>ÉLIM.</span><span>TÊTES</span><span>PRÉCISION</span><span>MORTS</span><span>OR</span></div>'
      + ARMES_PROFIL.map((a) => { const S = D.armes[a], v = niveauRequis('arme', a) > n; return `<div class="pf-tr${v ? ' ko' : ''}"><span>${esc(nomArme(a))}${v ? ` <small>niv. ${niveauRequis('arme', a)}</small>` : ''}</span><span>${milliers(S.elims)}</span><span>${milliers(S.tetes)}</span>`
        + `<span>${pc(S.touches, S.tirs)} %</span><span>${milliers(S.morts)}</span><span>${D.ors[a] ? '<b class="pf-or">OR</b>' : `${Math.min(100, S.tetes)} / 100`}</span></div>`; }).join('') + '</div>';
    // par mode
    h += '<h3 class="pf-h">PAR MODE</h3><div class="pf-table pf-modes"><div class="pf-tr pf-th"><span>MODE</span><span>PARTIES</span><span>VICTOIRES</span><span>ÉLIM.</span><span>RATIO</span><span>XP</span></div>'
      + Object.entries(MODES_PROFIL).map(([m, nom]) => { const S = D.modes[m]; return `<div class="pf-tr"><span>${esc(nom)}</span><span>${S.parties}</span><span>${S.victoires}</span><span>${milliers(S.elims)}</span>`
        + `<span>${S.morts ? (S.elims / S.morts).toFixed(2).replace('.', ',') : S.elims}</span><span>${milliers(S.xp)}</span></div>`; }).join('') + '</div>';
    // les médailles
    h += '<h3 class="pf-h">MÉDAILLES</h3><div class="pf-medailles">' + Object.entries(MEDAILLES).map(([id, M]) => { const k = D.medailles[id] || 0;
      return `<div class="pf-med${k ? '' : ' ko'} ${M.xp >= 75 ? 'or' : M.xp >= 50 ? 'argent' : 'bronze'}" title="${esc(M.texte)}"><i></i><b>${esc(M.nom)}</b><span>× ${k}</span></div>`; }).join('') + '</div>';
    // la frise des déblocages
    h += '<h3 class="pf-h">DÉBLOCAGES</h3><div class="pf-frise">' + DEBLOCAGES.map((d) => `<div class="pf-cran${d.niveau <= n ? ' fait' : ''}"><b>${d.niveau}</b><span>${d.quoi.map((q) => esc(q.nom)).join(' · ')}</span></div>`).join('')
      + `<div class="pf-cran${n >= NIVEAU_MAX ? ' fait' : ''}"><b>${NIVEAU_MAX}</b><span>Niveau maximum</span></div></div>`;
    if (P.memoire) h += '<p class="pf-note">Le stockage de ce navigateur est indisponible : ce profil ne vit que le temps de la page.</p>';
    this.profEl.querySelector('.pf-corps').innerHTML = h;
  }
}
