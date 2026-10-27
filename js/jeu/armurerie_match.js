// =====================================================================
//  L'ARMURERIE EN PARTIE — changer d'arme et de viseur sans quitter le match (27/10/2026, demande de Haythem)
// =====================================================================
// Touche B (action `armurerie` du profil combat, js/settings.js) : un panneau par-dessus la partie — elle continue, comme
// dans Call of Duty —, les quatre armes principales et les viseurs de celle qu'on choisit. 1 à 4 : l'arme ; 5 à 8 : le
// viseur ; Entrée ou ÉQUIPER : `partie.changerEquipement` (js/jeu/partie.js) — l'ancienne se range, la neuve sort, pleine ;
// B ou Échap : fermer. Le pointeur est rendu le temps du panneau (la pause n'est pas ouverte pour autant : game.menuArme),
// puis recapturé par le clic ou la touche qui ferme. Les touches tapées dans le panneau n'arrivent pas au jeu.
// De l'AFFICHAGE : rien ici ne touche la simulation hors de l'appel à changerEquipement, entre deux pas.
import { ARMES } from './armes.js';
import { VISEURS } from './series.js';
import { hideOverlay } from '../ui.js';

const PRINCIPALES = ['fa24', 'pm9', 'fp12', 'tp50'];
const CHOIX_VISEURS = [null, 'pointRouge', 'holo', 'lunette'];
const NOMS_VISEURS = { null: 'MIRE D’ORIGINE', pointRouge: 'POINT ROUGE', holo: 'HOLOGRAPHIQUE', lunette: 'LUNETTE ×3' };
const CLASSES_TXT = { assaut: 'FUSIL D’ASSAUT', 'pistolet-mitrailleur': 'PISTOLET-MITRAILLEUR', pompe: 'FUSIL À POMPE', precision: 'FUSIL DE PRÉCISION' };

// les quatre jauges d'une fiche (0..1), relatives aux quatre armes
function jauges(f) {
  const d = f.degats[0][1] * (f.plombs || 1);
  return [['DÉGÂTS', Math.min(1, d / 110)], ['CADENCE', Math.min(1, f.rpm / 900)],
    ['PORTÉE', Math.min(1, f.portee / 200)], ['MOBILITÉ', Math.min(1, (f.mobilite - 0.85) / 0.25)]];
}

const STYLE = `
#armurerie-match{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at center,rgba(8,10,14,.72),rgba(4,5,8,.9));font-family:'Oswald',sans-serif;color:#e9edf2}
#armurerie-match[hidden]{display:none}
#armurerie-match .am-boite{width:min(1040px,94vw);max-height:92vh;overflow:auto;padding:22px 26px 18px;
  background:linear-gradient(180deg,rgba(24,28,34,.96),rgba(14,16,20,.97));border:1px solid rgba(255,255,255,.08);
  border-top:3px solid #f2a71b;box-shadow:0 30px 80px rgba(0,0,0,.55)}
#armurerie-match h2{font-family:'Bebas Neue',sans-serif;font-weight:400;font-size:38px;letter-spacing:.06em;margin:0}
#armurerie-match .am-sous{font-size:13px;letter-spacing:.14em;color:#9aa4b1;margin:2px 0 16px}
#armurerie-match .am-titre{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.12em;color:#f2a71b;margin:14px 0 8px}
#armurerie-match .am-ligne{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
#armurerie-match button{font:inherit;color:inherit;text-align:left;cursor:pointer;background:rgba(255,255,255,.035);
  border:1px solid rgba(255,255,255,.09);padding:12px 12px 10px;position:relative;transition:background .12s,border-color .12s,transform .12s}
#armurerie-match button:hover:not(:disabled){background:rgba(255,255,255,.07);transform:translateY(-1px)}
#armurerie-match button.on{border-color:#f2a71b;background:rgba(242,167,27,.12)}
#armurerie-match button:disabled{opacity:.32;cursor:not-allowed}
#armurerie-match .am-cle{position:absolute;top:8px;right:9px;font-size:11px;color:#9aa4b1;border:1px solid rgba(255,255,255,.18);padding:0 5px}
#armurerie-match .am-nom{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.04em;line-height:1}
#armurerie-match .am-cl{font-size:11px;letter-spacing:.12em;color:#9aa4b1;margin:3px 0 9px}
#armurerie-match .am-j{display:grid;grid-template-columns:62px 1fr;align-items:center;gap:6px;font-size:10px;letter-spacing:.1em;color:#aab3bf;margin-top:3px}
#armurerie-match .am-j i{display:block;height:4px;background:rgba(255,255,255,.1)}
#armurerie-match .am-j i b{display:block;height:100%;background:#e9edf2}
#armurerie-match .am-v{font-size:12px;color:#aab3bf;margin-top:5px;line-height:1.35}
#armurerie-match .am-bas{display:flex;justify-content:space-between;align-items:center;margin-top:18px;gap:12px;flex-wrap:wrap}
#armurerie-match .am-aide{font-size:12px;letter-spacing:.08em;color:#8792a0}
#armurerie-match .am-ok{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.1em;padding:8px 26px;
  background:#f2a71b;color:#14161a;border:none;text-align:center}
#armurerie-match .am-ok:hover{background:#ffbb3a}
#armurerie-match .am-non{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.1em;padding:8px 18px;text-align:center}
@media (max-width:720px){#armurerie-match .am-ligne{grid-template-columns:repeat(2,1fr)}}
@media (max-height:760px){#armurerie-match .am-boite{padding:14px 18px 12px}#armurerie-match h2{font-size:30px}
  #armurerie-match .am-sous{margin-bottom:6px}#armurerie-match .am-titre{margin:8px 0 6px;font-size:17px}
  #armurerie-match button{padding:8px 10px 7px}#armurerie-match .am-nom{font-size:20px}#armurerie-match .am-cl{margin:2px 0 4px}
  #armurerie-match .am-j{margin-top:1px}#armurerie-match .am-v{font-size:11px;margin-top:3px}#armurerie-match .am-bas{margin-top:10px}}
`;

export class ArmurerieMatch {
  constructor(game) {
    this.game = game; this.ouvert = false; this.arme = 'fa24'; this.viseur = null; this.el = null;
    this._touche = (e) => this._clavier(e);
  }
  _construire() {
    if (this.el) return;
    const st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
    const el = document.createElement('div'); el.id = 'armurerie-match'; el.hidden = true;
    el.innerHTML = `<div class="am-boite" role="dialog" aria-label="Changer d'arme">
      <h2>CHANGER D’ARME</h2><div class="am-sous">LA PARTIE CONTINUE · L’ARME SORT PLEINE</div>
      <div class="am-titre">ARME PRINCIPALE</div><div class="am-ligne am-armes"></div>
      <div class="am-titre">VISEUR</div><div class="am-ligne am-viseurs"></div>
      <div class="am-bas"><div class="am-aide">1-4 ARME · 5-8 VISEUR · ENTRÉE ÉQUIPER · B / ÉCHAP FERMER</div>
        <div><button class="am-non" data-act="fermer">ANNULER</button> <button class="am-ok" data-act="ok">ÉQUIPER</button></div></div></div>`;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.arme) { this.arme = b.dataset.arme; this._garderViseur(); this._dessiner(); }
      else if (b.dataset.viseur !== undefined) { this.viseur = b.dataset.viseur || null; this._dessiner(); }
      else if (b.dataset.act === 'ok') this.equiper();
      else if (b.dataset.act === 'fermer') this.fermer(true);
    });
    document.body.appendChild(el);
    this.el = el;
  }
  // un viseur que l'arme choisie ne prend pas : retiré
  _garderViseur() { if (this.viseur && !(VISEURS[this.viseur] && VISEURS[this.viseur].armes.includes(this.arme))) this.viseur = null; }
  _dessiner() {
    const L = this.el.querySelector('.am-armes'), V = this.el.querySelector('.am-viseurs');
    L.innerHTML = PRINCIPALES.map((id, k) => {
      const f = ARMES[id];
      return `<button data-arme="${id}" class="${id === this.arme ? 'on' : ''}"><span class="am-cle">${k + 1}</span>
        <div class="am-nom">${f.nom.toUpperCase()}</div><div class="am-cl">${CLASSES_TXT[f.classe] || ''}</div>
        ${jauges(f).map(([n, v]) => `<div class="am-j">${n}<i><b style="width:${Math.round(v * 100)}%"></b></i></div>`).join('')}</button>`;
    }).join('');
    V.innerHTML = CHOIX_VISEURS.map((v, k) => {
      const S = v && VISEURS[v], ok = !v || (S && S.armes.includes(this.arme));
      const txt = !v ? (this.arme === 'tp50' ? 'La lunette de précision du TP-50.' : 'La hausse et le guidon de l’arme.') : S.texte;
      return `<button data-viseur="${v || ''}" class="${(v || null) === this.viseur ? 'on' : ''}" ${ok ? '' : 'disabled'}><span class="am-cle">${k + 5}</span>
        <div class="am-nom">${NOMS_VISEURS[v]}</div><div class="am-v">${ok ? txt : 'Ne se monte pas sur cette arme.'}</div></button>`;
    }).join('');
  }
  // ---------------------------------------------------------------- ouvrir, fermer
  peutOuvrir() {
    const P = this.game.partie, a = P && P.local;
    return !!(a && a.arsenal && a.vivant && !a.prop && P.phase !== 'fin' && (!this.game.paused || this._depuisPause) && P.dotationArmes !== false
      && a.arsenal.armes.some((f) => f && f.emplacement === 'principale'));
  }
  // (`depuisPause` : le bouton « Changer d'arme » de la pause — elle se ferme sans redemander la capture, le panneau la remplace)
  ouvrir({ depuisPause = false } = {}) {
    this._depuisPause = depuisPause;
    const ok = !this.ouvert && this.peutOuvrir();
    this._depuisPause = false;
    if (!ok) return false;
    if (depuisPause) { hideOverlay(); this.game.paused = false; }
    this._construire();
    const A = this.game.partie.local.arsenal, f = A.armes.find((x) => x && x.emplacement === 'principale');
    this.arme = PRINCIPALES.includes(f.base || f.id) ? f.base || f.id : 'fa24'; this.viseur = f.viseur || null;
    this._dessiner();
    this.ouvert = true; this.game.menuArme = true; this.el.hidden = false;
    this.game.input.purger?.();
    window.addEventListener('keydown', this._touche, true); window.addEventListener('keyup', this._bloquer = (e) => e.stopImmediatePropagation(), true);
    if (document.pointerLockElement) document.exitPointerLock?.();
    return true;
  }
  fermer(reprendre = true) {
    if (!this.ouvert) return;
    this.ouvert = false; this.el.hidden = true;
    window.removeEventListener('keydown', this._touche, true); window.removeEventListener('keyup', this._bloquer, true);
    this.game.input.purger?.();
    const P = this.game.partie;
    // (la capture redemandée dans le geste qui ferme — un clic, une touche : une activation —, le calque si elle est refusée)
    if (reprendre && P && P.besoinCapture?.() && !P.capte?.()) P.capturer().then((ok) => { if (!ok && this.game.partie === P) P.attendreClic?.(); }).finally(() => { this.game.menuArme = false; });
    else this.game.menuArme = false;
  }
  equiper() {
    const P = this.game.partie, a = P && P.local;
    const ok = !!(a && P.changerEquipement(a, { principale: this.arme, viseur: this.viseur }));
    this.fermer(true);
    return ok;
  }
  _clavier(e) {
    e.stopImmediatePropagation();
    if (e.repeat) { e.preventDefault(); return; }
    const k = e.code;
    if (k === 'Escape' || k === 'KeyB') { e.preventDefault(); this.fermer(true); return; }
    if (k === 'Enter' || k === 'NumpadEnter' || k === 'Space') { e.preventDefault(); this.equiper(); return; }
    const n = /^(Digit|Numpad)([1-8])$/.exec(k);
    if (n) {
      e.preventDefault();
      const i = +n[2];
      if (i <= 4) { this.arme = PRINCIPALES[i - 1]; this._garderViseur(); }
      else { const v = CHOIX_VISEURS[i - 5], S = v && VISEURS[v]; if (!v || (S && S.armes.includes(this.arme))) this.viseur = v; }
      this._dessiner();
    }
  }
  // chaque image (Partie.image) : la touche B ouvre ; le panneau se ferme seul si la partie ne le permet plus (mort, fin)
  maj() {
    const g = this.game;
    if (!this.ouvert) { if (g.input.pressed?.('armurerie')) this.ouvrir(); return; }
    if (!this.peutOuvrir()) this.fermer(false);
  }
}
