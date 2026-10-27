// =====================================================================
//  L'ÉCRAN EN LIGNE du menu principal (27/10/2026) — le salon public d'IRIS
// =====================================================================
// Ce qu'il faut pour entrer, et rien d'autre (« rien à taper », la leçon de LA CAGE) : le serveur répond-il, combien
// d'élèves sont déjà dans l'école, l'adresse à donner aux amis sur le même wifi ; un pseudo et un visage (gardés pour la
// prochaine fois) ; JOUER. L'arme est celle de la classe COMBAT choisie au menu (l'armurerie), changeable en partie (B).
// La partie : js/jeu/partie_enligne.js ; le serveur : serveur/node.mjs (Lancer.bat le lance quand Node.js est là).
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { portrait } from './portraits.js';
import { profilEnLigne, garderProfil, etatServeur, adresseServeur } from './reseau.js';

const PERSOS = [FICHE_HAYTHEM, ...FICHES_BOTS];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const STYLE = `
#menu-enligne{position:fixed;inset:0;z-index:58;display:grid;place-items:center;font-family:Oswald,sans-serif;color:#e9edf2;
  background:linear-gradient(90deg,rgba(4,6,9,.95),rgba(4,6,9,.82) 55%,rgba(4,6,9,.6));backdrop-filter:blur(4px)}
#menu-enligne[hidden]{display:none}
#menu-enligne .me-boite{width:min(980px,94vw);max-height:94vh;overflow:auto;display:grid;grid-template-columns:1.1fr .9fr;gap:0;
  background:linear-gradient(160deg,rgba(22,26,33,.97),rgba(11,13,17,.98));border:1px solid rgba(255,255,255,.08);position:relative;animation:me-in .22s ease-out}
@keyframes me-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
#menu-enligne .me-boite::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;background:linear-gradient(90deg,#f2a71b,rgba(242,167,27,.15) 70%,transparent)}
#menu-enligne .me-g{padding:26px 28px 22px;border-right:1px solid rgba(255,255,255,.07)}
#menu-enligne .me-d{padding:26px 26px 22px;display:flex;flex-direction:column;gap:14px;background:rgba(0,0,0,.16)}
#menu-enligne h2{margin:0;font:400 54px/.9 'Bebas Neue',sans-serif;letter-spacing:.06em}
#menu-enligne h2 small{display:block;font:500 12px/1.4 Oswald,sans-serif;letter-spacing:.22em;color:#f2a71b;margin-top:8px}
#menu-enligne h3{margin:20px 0 8px;font:400 16px/1 'Bebas Neue',sans-serif;letter-spacing:.2em;color:#8792a0}
#menu-enligne input{width:100%;box-sizing:border-box;font:400 26px/1 'Bebas Neue',sans-serif;letter-spacing:.06em;color:#fff;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.14);border-bottom:2px solid #f2a71b;padding:10px 12px;outline:none}
#menu-enligne input:focus{background:rgba(255,255,255,.07)}
#menu-enligne .me-persos{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
#menu-enligne .me-p{position:relative;aspect-ratio:3/4;border:1px solid rgba(255,255,255,.1);background:#0b0d11 center/cover no-repeat;cursor:pointer;padding:0;overflow:hidden;
  transition:transform .14s,border-color .14s;font:inherit;color:inherit}
#menu-enligne .me-p:hover{transform:translateY(-2px)}
#menu-enligne .me-p.on{border:2px solid #f2a71b;box-shadow:0 0 0 3px rgba(242,167,27,.18)}
#menu-enligne .me-p span{position:absolute;left:0;right:0;bottom:0;padding:14px 2px 3px;font-size:10px;letter-spacing:.08em;text-align:center;background:linear-gradient(transparent,rgba(0,0,0,.85))}
#menu-enligne .me-p b{position:absolute;inset:0;display:grid;place-items:center;font:400 30px/1 'Bebas Neue',sans-serif;color:#cfd5de}
#menu-enligne .me-etat{padding:14px 16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}
#menu-enligne .me-etat .me-l{display:flex;align-items:center;gap:9px;font-size:13px;letter-spacing:.14em}
#menu-enligne .me-etat i{width:9px;height:9px;border-radius:50%;background:#8792a0}
#menu-enligne .me-etat.ok i{background:#59d98e;box-shadow:0 0 10px #59d98e} #menu-enligne .me-etat.ko i{background:#ff5a4e;box-shadow:0 0 10px #ff5a4e}
#menu-enligne .me-n{font:400 64px/1 'Bebas Neue',sans-serif;margin-top:8px} #menu-enligne .me-n small{font:500 13px/1 Oswald,sans-serif;letter-spacing:.14em;color:#8792a0;margin-left:8px}
#menu-enligne .me-t{font-size:12.5px;line-height:1.5;color:#aab3bf;margin-top:6px}
#menu-enligne .me-t code{font-family:Consolas,monospace;font-size:13px;color:#ffd27a;background:rgba(242,167,27,.08);padding:1px 6px;user-select:all}
#menu-enligne .me-regles{font-size:12.5px;line-height:1.55;color:#aab3bf;margin:0;padding-left:16px}
#menu-enligne .me-btns{margin-top:auto;display:flex;gap:10px;justify-content:flex-end}
#menu-enligne button.me-ok,#menu-enligne button.me-non{font:400 26px/1 'Bebas Neue',sans-serif;letter-spacing:.12em;cursor:pointer;border:none;padding:12px 34px}
#menu-enligne .me-ok{background:linear-gradient(180deg,#ffbb3a,#f2a71b);color:#14161a;clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)}
#menu-enligne .me-ok:disabled{filter:grayscale(1) brightness(.6);cursor:not-allowed}
#menu-enligne .me-non{background:none;color:#cfd5de;border:1px solid rgba(255,255,255,.18)!important;font-size:21px!important;padding:12px 20px!important}
@media (max-width:760px){#menu-enligne .me-boite{grid-template-columns:1fr}#menu-enligne .me-g{border-right:none}#menu-enligne .me-persos{grid-template-columns:repeat(4,1fr)}#menu-enligne h2{font-size:42px}}
`;

export class MenuEnLigne {
  constructor(menu) { this.menu = menu; this.el = null; this.ok = false; }
  _construire() {
    if (this.el) return;
    const st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
    const el = document.createElement('div'); el.id = 'menu-enligne'; el.hidden = true;
    el.innerHTML = `<div class="me-boite" role="dialog" aria-label="Jouer en ligne">
      <div class="me-g"><h2>EN LIGNE<small>MATCH À MORT PAR ÉQUIPES · SISR CONTRE SLAM · ENTRE ÉLÈVES</small></h2>
        <h3>TON PSEUDO</h3><input class="me-pseudo" maxlength="16" spellcheck="false" autocomplete="off">
        <h3>TON PERSONNAGE</h3><div class="me-persos"></div>
        <h3>LES RÈGLES</h3><ul class="me-regles"><li>Tu rejoins l’équipe qui a le moins d’élèves.</li><li>50 touchés ou 15 minutes ; la partie ne s’arrête pas quand tu fais pause.</li>
          <li>Ton arme : celle de ta classe de combat (ARMURERIE). En partie, <b>B</b> pour en changer.</li></ul></div>
      <div class="me-d"><div class="me-etat"><div class="me-l"><i></i><span class="me-s">RECHERCHE DU SERVEUR…</span></div><div class="me-n"></div><div class="me-t"></div></div>
        <div class="me-btns"><button class="me-non" data-act="retour">RETOUR</button><button class="me-ok" data-act="jouer" disabled>JOUER</button></div></div></div>`;
    el.addEventListener('click', (e) => {
      const p = e.target.closest('.me-p'); if (p) { this.avatar = p.dataset.av; this._persos(); return; }
      const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      if (b.dataset.act === 'retour') this.fermer(); else if (b.dataset.act === 'jouer') this.jouer();
    });
    el.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); this.fermer(); }
      else if (e.key === 'Enter' && this.ok) { e.preventDefault(); this.jouer(); }
    });
    document.body.appendChild(el); this.el = el;
  }
  _persos() {
    this.el.querySelector('.me-persos').innerHTML = PERSOS.map((f) => {
      const u = portrait(f);
      return `<button class="me-p ${f.id === this.avatar ? 'on' : ''}" data-av="${f.id}" ${u ? `style="background-image:url('${u}')"` : ''}>${u ? '' : `<b>${esc(f.nom[0])}</b>`}<span>${esc(f.nom.toUpperCase())}</span></button>`;
    }).join('');
  }
  async ouvrir() {
    this._construire();
    const P = profilEnLigne();
    this.avatar = P.avatar; this.el.querySelector('.me-pseudo').value = P.pseudo;
    this._persos();
    this.el.hidden = false;
    setTimeout(() => { try { this.el.querySelector('.me-ok').focus(); } catch (e) { /* ignore */ } }, 30);
    const E = this.el.querySelector('.me-etat'), S = E.querySelector('.me-s'), N = E.querySelector('.me-n'), T = E.querySelector('.me-t');
    E.className = 'me-etat'; S.textContent = 'RECHERCHE DU SERVEUR…'; N.textContent = ''; T.textContent = '';
    this.ok = false; this.el.querySelector('.me-ok').disabled = true;
    const r = await etatServeur();
    if (this.el.hidden) return;
    if (!r) {
      E.className = 'me-etat ko'; S.textContent = 'SERVEUR INTROUVABLE';
      T.innerHTML = `Le jeu tourne sans son serveur en ligne (lancé par Python). Ferme la fenêtre noire et relance <code>Lancer.bat</code> : avec Node.js
        installé, il ouvre le jeu ET le serveur sur le même port.<br>Adresse cherchée : <code>${esc(adresseServeur())}</code>`;
      return;
    }
    const n = r.joueurs | 0, max = r.max || 10;
    E.className = 'me-etat ok'; S.textContent = 'SERVEUR EN LIGNE';
    N.innerHTML = `${n}<small>/ ${max} ÉLÈVE${n > 1 ? 'S' : ''} DANS L’ÉCOLE</small>`;
    const ad = (r.adresses || []).slice(0, 2);
    T.innerHTML = (n >= max ? '<b style="color:#ff8a80">L’école est pleine : réessaie dans un moment.</b><br>' : '')
      + (ad.length ? `Pour qu’un ami te rejoigne sur le même wifi, il ouvre : ${ad.map((a) => `<code>${esc(a)}</code>`).join(' ou ')}` : 'Tes amis ouvrent la même adresse que toi.')
      + '<br>À distance : un tunnel (serveur/LISEZMOI.md).';
    this.ok = n < max; this.el.querySelector('.me-ok').disabled = !this.ok;
  }
  fermer() { if (this.el) this.el.hidden = true; this.menu.accueil?.(); }
  jouer() {
    const pseudo = (this.el.querySelector('.me-pseudo').value || '').trim().slice(0, 16) || profilEnLigne().pseudo;
    garderProfil({ pseudo, avatar: this.avatar });
    this.el.hidden = true;
    const c = this.menu.optionsDe ? this.menu.optionsDe('combat').opts : {};
    this.menu._lancer({ mode: 'enligne', opts: { pseudo, avatar: this.avatar, classe: c.classe, equipement: c.equipement } });
  }
}
