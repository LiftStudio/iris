// =====================================================================
//  LES MENUS DU JEU — squelette du socle S0 (22/10), rempli par le lot L-U (vague 3 : L-P)
// =====================================================================
// Le menu principal sur l'école vivante (spec §§ 2.1, 2.2, 2.9, 4.5.16) : BALADE LIBRE · COMBAT · PROP HUNT · STAND DE TIR ·
// OPTIONS · CRÉDITS, les réglages de partie, l'écran PRÉPARATION, l'écran de fin, les crédits ; chaque écran inscrit à la
// manette par `ajouterRacine` (js/manette_menus.js) ; la caméra du menu (trois plans de 12 s, fondu de 1,2 s) qui pose le
// corps FICTIF du menu au sol sous elle — la carte vivante le suit (game.carteMenu). Le squelette : un écran #menu-jeu
// (DOM par JS) dont chaque bouton lance son mode aux réglages par défaut ; la préparation = une barre ; la fin = MENU
// PRINCIPAL · BALADE ; un plan fixe sur la pile « iris ».
import * as THREE from 'three';
import { ajouterRacine } from '../manette_menus.js';
import { CorpsFixe } from './acteur.js';

// LE PLAN DU MENU (squelette) : juste passé la porte 6, vers la pile et sa plaque « iris »
const PLAN = { cam: [14.35, 1.75, -1.35], vise: [15.0, 1.45, -6.2] };
const _v = new THREE.Vector3();

export class MenuJeu {
  constructor(game, deps) {
    this.game = game; this.deps = deps || {};
    this.corps = new CorpsFixe();
    this.el = null; this.prep = null; this.finEl = null;
    this._construire();
    ajouterRacine('menu-jeu', { defaut: '#menu-jeu [data-act="balade"]' });
    ajouterRacine('fin-jeu', { defaut: '#fin-jeu [data-act="menu"]' });
    document.addEventListener('iris-menu', () => this.accueil());
    document.addEventListener('iris-partie', () => this.cacher());
  }
  _construire() {
    const d = document.createElement('div');
    d.id = 'menu-jeu'; d.className = 'menu-jeu'; d.hidden = true;
    d.innerHTML = '<div class="menu-jeu-titre">IRIS</div><div class="menu-jeu-liste">'
      + [['balade', 'BALADE LIBRE'], ['combat', 'COMBAT'], ['prophunt', 'PROP HUNT'], ['stand', 'STAND DE TIR'], ['options', 'OPTIONS'], ['credits', 'CRÉDITS']]
        .map(([a, t]) => `<button class="menu-jeu-bouton" data-act="${a}">${t}</button>`).join('') + '</div>';
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) this._agir(b.dataset.act); });
    document.body.appendChild(d);
    this.el = d;
    const p = document.createElement('div');
    p.id = 'prep-jeu'; p.className = 'prep-jeu'; p.hidden = true;
    p.innerHTML = '<div class="prep-jeu-titre">PRÉPARATION DE LA PARTIE</div><div class="prep-jeu-etape"></div><div class="prep-jeu-barre"><div class="prep-jeu-plein"></div></div>';
    document.body.appendChild(p);
    this.prep = p;
    const f = document.createElement('div');
    f.id = 'fin-jeu'; f.className = 'fin-jeu'; f.hidden = true;
    f.innerHTML = '<div class="fin-jeu-titre">FIN DE LA PARTIE</div><div class="fin-jeu-texte"></div>'
      + '<button class="menu-jeu-bouton" data-act="menu">MENU PRINCIPAL</button><button class="menu-jeu-bouton" data-act="balade">BALADE</button>';
    f.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) this._agir(b.dataset.act); });
    document.body.appendChild(f);
    this.finEl = f;
  }
  _agir(act) {
    const D = this.deps;
    if (act === 'balade') { this.cacher(); D.quitter ? D.quitter('balade') : this.game.enterLobby(); }
    else if (act === 'menu') { this.cacher(); D.quitter ? D.quitter('menu') : this.game.entrerMenu(); }
    else if (act === 'combat') this.reglage('combat');
    else if (act === 'prophunt') this.reglage('prop');
    else if (act === 'stand') this.reglage('stand');
    else if (act === 'options') D.options?.open?.();
    else if (act === 'credits') this.credits();
  }
  accueil() { this.cacher(); if (this.el) this.el.hidden = false; }
  cacher() { for (const e of [this.el, this.prep, this.finEl]) if (e) e.hidden = true; }
  // les réglages d'un mode — le squelette lance tout de suite, aux réglages gardés (settings.jeu)
  reglage(mode) {
    const s = this.game.settings, J = (s && s.data && s.data.jeu) || {};
    if (mode === 'combat') { const c = J.combat || {}; this.deps.lancer?.(c.mode || 'equipes', { ...c }); }
    else if (mode === 'prop') { const p = J.prop || {}; this.deps.lancer?.('prophunt', { ...p }); }
    else this.deps.lancer?.('stand', {});
  }
  preparation(f, etape) {
    if (!this.prep) return;
    if (this.el) this.el.hidden = true;
    this.prep.hidden = f >= 1 && etape === null;
    this.prep.querySelector('.prep-jeu-etape').textContent = etape || '';
    this.prep.querySelector('.prep-jeu-plein').style.width = Math.round(Math.max(0, Math.min(1, f)) * 100) + '%';
  }
  fin(resultat) {
    if (!this.finEl) return;
    this.finEl.querySelector('.fin-jeu-texte').textContent = resultat && resultat.texte ? resultat.texte : '';
    this.finEl.hidden = false;
  }
  credits() { }
  // LA CAMÉRA DU MENU : le plan posé, le corps fictif au sol sous elle (la carte vivante y allume les lampes de la pièce)
  camera(dt, poser) {
    const g = this.game, cam = g.camera, C = g.collisions;
    cam.position.set(PLAN.cam[0], PLAN.cam[1], PLAN.cam[2]);
    cam.lookAt(_v.set(PLAN.vise[0], PLAN.vise[1], PLAN.vise[2]));
    cam.updateMatrixWorld();
    const sol = C ? C.solEn(PLAN.cam[0], PLAN.cam[2], PLAN.cam[1]) : 0;
    this.corps.placer(PLAN.cam[0], sol, PLAN.cam[2], 0);
    return true;
  }
}
