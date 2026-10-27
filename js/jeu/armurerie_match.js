// =====================================================================
//  L'ARMURERIE EN PARTIE — changer d'arme et de viseur sans quitter le match (27/10/2026, demande de Haythem)
// =====================================================================
// Touche B (action `armurerie` du profil combat, js/settings.js) : un panneau par-dessus la partie — elle continue, comme
// dans Call of Duty —, les quatre armes principales et les viseurs de celle qu'on choisit. 1 à 4 : l'arme ; 5 à 8 : le
// viseur ; Entrée ou ÉQUIPER : `partie.changerEquipement` (js/jeu/partie.js) — l'ancienne se range, la neuve sort, pleine ;
// B ou Échap : fermer. Le pointeur est rendu le temps du panneau (la pause n'est pas ouverte pour autant : game.menuArme),
// puis recapturé par le clic ou la touche qui ferme. Les touches tapées dans le panneau n'arrivent pas au jeu.
// De l'AFFICHAGE : rien ici ne touche la simulation hors de l'appel à changerEquipement, entre deux pas.
// (27/10 soir, « plus qualitatif » : la mise en page d'un écran d'équipement — la liste des armes à gauche, l'arme EN 3D au
// centre avec son viseur monté, qui tourne et se fait tourner à la souris, les caractéristiques CHIFFRÉES comparées à celle
// qu'on tient (vert : mieux, rouge : moins bien), les viseurs en vignettes avec leur réticule dessiné. L'aperçu a son propre
// petit moteur de rendu, créé à la première ouverture, qui ne tourne que panneau ouvert.)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ARMES } from './armes.js';
import { VISEURS, ficheEquipee } from './series.js';
import { creerArme, ENCOMBREMENTS } from './modeles_armes.js';
import { creerViseurs, coucherHausse } from './viseurs.js';
import { hideOverlay } from '../ui.js';

const PRINCIPALES = ['fa24', 'pm9', 'fp12', 'tp50'];
const CHOIX_VISEURS = [null, 'pointRouge', 'holo', 'lunette'];
const NOMS_VISEURS = { null: 'MIRE D’ORIGINE', pointRouge: 'POINT ROUGE', holo: 'HOLOGRAPHIQUE', lunette: 'LUNETTE ×3' };
const CLASSES_TXT = { assaut: 'FUSIL D’ASSAUT', 'pistolet-mitrailleur': 'PISTOLET-MITRAILLEUR', pompe: 'FUSIL À POMPE', precision: 'FUSIL DE PRÉCISION' };
const ROLES = {
  fa24: 'Polyvalent : précis à mi-distance, assez rapide pour les couloirs.',
  pm9: 'Le plus rapide à viser et à courir. Redoutable de près, perd vite à distance.',
  fp12: 'Huit plombs par coup : une salle de classe lui appartient, un couloir beaucoup moins.',
  tp50: 'Un tir au torse suffit. Lent à viser, lent à courir : à tenir de loin.',
};
const nomSeul = (f) => f.nom.split('«')[0].trim().toUpperCase();
const surnom = (f) => (/«\s*(.+?)\s*»/.exec(f.nom) || [])[1] || '';

// LES CARACTÉRISTIQUES d'une fiche : [nom, valeur affichée, jauge 0..1, plus grand = mieux ?]
function caracs(f) {
  const d = f.degats[0][1] * (f.plombs || 1);
  return [
    ['DÉGÂTS', f.plombs > 1 ? `${f.plombs}×${f.degats[0][1]}` : `${d}`, Math.min(1, d / 150), d, true],
    ['CADENCE', `${f.rpm} cps/min`, Math.min(1, f.rpm / 900), f.rpm, true],
    ['PORTÉE', `${f.portee} m`, Math.min(1, f.portee / 200), f.portee, true],
    ['MOBILITÉ', `${Math.round(f.mobilite * 100)} %`, Math.min(1, Math.max(0.04, (f.mobilite - 0.85) / 0.25)), f.mobilite, true],
    ['VISÉE', `${Math.round((f.ads || 0) * 1000)} ms`, Math.min(1, Math.max(0.04, 1 - ((f.ads || 0) - 0.15) / 0.35)), f.ads || 0, false],
    ['ZOOM', `× ${(f.zoom || 1).toFixed(2).replace('.', ',')}`, Math.min(1, ((f.zoom || 1) - 1) / 3.2 + 0.04), f.zoom || 1, true],
    ['CHARGEUR', `${f.chargeur} / ${f.reserve}`, Math.min(1, f.chargeur / 32), f.chargeur, true],
  ];
}

// LES RÉTICULES en vignette (SVG fait main, 64 × 64)
const SVG_VISEURS = {
  null: '<path d="M32 22v18M26 40h12" stroke="#e9edf2" stroke-width="3" fill="none"/><path d="M14 46h12M38 46h12M26 46v-8M38 46v-8" stroke="#8792a0" stroke-width="3" fill="none"/>',
  pointRouge: '<circle cx="32" cy="32" r="22" fill="none" stroke="#596270" stroke-width="2"/><circle cx="32" cy="32" r="3.4" fill="#ff3b30"/><circle cx="32" cy="32" r="7" fill="#ff3b30" opacity=".18"/>',
  holo: '<rect x="8" y="12" width="48" height="40" rx="4" fill="none" stroke="#596270" stroke-width="2"/><circle cx="32" cy="32" r="13" fill="none" stroke="#ff3b30" stroke-width="2"/><circle cx="32" cy="32" r="2.4" fill="#ff3b30"/>',
  lunette: '<circle cx="32" cy="32" r="25" fill="#0c0e12" stroke="#596270" stroke-width="3"/><path d="M7 32h18M39 32h18M32 41v16" stroke="#cfd5de" stroke-width="1.5"/><path d="M26 39l6-7 6 7" stroke="#ff3b30" stroke-width="2.2" fill="none"/><path d="M14 30v4M20 30v4M44 30v4M50 30v4" stroke="#cfd5de" stroke-width="1.2"/>',
};
const svgViseur = (v) => `<svg viewBox="0 0 64 64" aria-hidden="true">${SVG_VISEURS[v]}</svg>`;

const STYLE = `
#armurerie-match{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse 80% 70% at 60% 45%,rgba(10,13,19,.62),rgba(3,4,7,.93));font-family:'Oswald',sans-serif;color:#e9edf2;
  --am-or:#f2a71b;--am-ligne:rgba(255,255,255,.08);--am-vert:#59d98e;--am-rouge:#ff6b5e}
#armurerie-match[hidden]{display:none}
#armurerie-match .am-boite{position:relative;width:min(1240px,96vw);height:min(720px,94vh);display:grid;
  grid-template-columns:minmax(230px,300px) 1fr;grid-template-rows:auto 1fr auto auto;
  background:linear-gradient(160deg,rgba(22,26,33,.97),rgba(11,13,17,.98));border:1px solid var(--am-ligne);
  box-shadow:0 40px 120px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.04);animation:am-entree .22s cubic-bezier(.2,.8,.2,1)}
@keyframes am-entree{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
#armurerie-match .am-boite::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;background:linear-gradient(90deg,var(--am-or),rgba(242,167,27,.2) 60%,transparent)}
#armurerie-match .am-tete{grid-column:1/3;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 26px 14px;border-bottom:1px solid var(--am-ligne)}
#armurerie-match h2{font-family:'Bebas Neue',sans-serif;font-weight:400;font-size:40px;letter-spacing:.08em;margin:0;line-height:.9}
#armurerie-match h2 small{display:block;font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:.24em;color:#8792a0;margin-top:7px}
#armurerie-match .am-etat{display:flex;gap:8px;align-items:center;font-size:12px;letter-spacing:.14em;color:#aab3bf}
#armurerie-match .am-direct{display:inline-flex;align-items:center;gap:7px;padding:4px 10px;border:1px solid rgba(255,80,60,.35);color:#ffb4a8;background:rgba(255,59,48,.08)}
#armurerie-match .am-direct i{width:7px;height:7px;border-radius:50%;background:#ff3b30;box-shadow:0 0 8px #ff3b30;animation:am-pouls 1.2s infinite}
@keyframes am-pouls{50%{opacity:.35}}
/* la liste des armes */
#armurerie-match .am-liste{padding:14px 0 14px 14px;display:flex;flex-direction:column;gap:6px;overflow:auto;border-right:1px solid var(--am-ligne)}
#armurerie-match .am-liste h3,#armurerie-match .am-vis h3{font-family:'Bebas Neue',sans-serif;font-weight:400;font-size:16px;letter-spacing:.2em;color:var(--am-or);margin:2px 0 4px 10px}
#armurerie-match button{font:inherit;color:inherit;text-align:left;cursor:pointer;border:none;background:none;position:relative}
#armurerie-match .am-a{display:grid;grid-template-columns:30px 1fr;align-items:center;gap:10px;padding:10px 14px 10px 10px;
  background:linear-gradient(90deg,rgba(255,255,255,.035),rgba(255,255,255,.012));border-left:3px solid transparent;transition:background .15s,border-color .15s,padding .15s}
#armurerie-match .am-a:hover{background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.02))}
#armurerie-match .am-a.on{border-left-color:var(--am-or);background:linear-gradient(90deg,rgba(242,167,27,.2),rgba(242,167,27,.03));padding-left:14px}
#armurerie-match .am-cle{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 4px;font-size:12px;color:#c9d0da;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.25)}
#armurerie-match .am-a.on .am-cle{border-color:var(--am-or);color:var(--am-or)}
#armurerie-match .am-a-n{font-family:'Bebas Neue',sans-serif;font-size:25px;letter-spacing:.05em;line-height:1}
#armurerie-match .am-a-n em{font-style:normal;font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:.14em;color:#9aa4b1;margin-left:6px}
#armurerie-match .am-a-c{font-size:11px;letter-spacing:.14em;color:#8792a0;margin-top:3px}
#armurerie-match .am-tag{position:absolute;right:10px;top:9px;font-size:10px;letter-spacing:.16em;color:#14161a;background:#c9d0da;padding:1px 6px}
/* la scène : l'arme en 3D et ses chiffres */
#armurerie-match .am-scene{position:relative;display:grid;grid-template-columns:1fr minmax(250px,330px);min-height:0}
#armurerie-match .am-vue{position:relative;min-height:0;cursor:grab;overflow:hidden;
  background:radial-gradient(ellipse 60% 55% at 50% 55%,rgba(242,167,27,.07),transparent 70%),
  repeating-linear-gradient(90deg,rgba(255,255,255,.022) 0 1px,transparent 1px 48px),repeating-linear-gradient(0deg,rgba(255,255,255,.022) 0 1px,transparent 1px 48px)}
#armurerie-match .am-vue:active{cursor:grabbing}
#armurerie-match .am-vue canvas{position:absolute;inset:0;width:100%!important;height:100%!important}
#armurerie-match .am-vue .am-sol{position:absolute;left:12%;right:12%;bottom:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(242,167,27,.45),transparent)}
#armurerie-match .am-titre{position:absolute;left:26px;top:18px;pointer-events:none}
#armurerie-match .am-titre b{display:block;font-family:'Bebas Neue',sans-serif;font-weight:400;font-size:64px;line-height:.85;letter-spacing:.03em}
#armurerie-match .am-titre span{display:block;font-size:13px;letter-spacing:.2em;color:var(--am-or);margin-top:6px}
#armurerie-match .am-titre p{max-width:380px;font-size:13px;line-height:1.45;color:#aab3bf;margin:10px 0 0;letter-spacing:.02em}
#armurerie-match .am-tourne{position:absolute;right:16px;bottom:12px;font-size:11px;letter-spacing:.16em;color:#6f7a88;pointer-events:none}
#armurerie-match .am-stats{padding:18px 22px 10px;border-left:1px solid var(--am-ligne);background:linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.04));overflow:auto}
#armurerie-match .am-stats h3{font-family:'Bebas Neue',sans-serif;font-weight:400;font-size:16px;letter-spacing:.2em;color:var(--am-or);margin:0 0 10px}
#armurerie-match .am-s{margin-bottom:11px}
#armurerie-match .am-s-l{display:flex;justify-content:space-between;align-items:baseline;font-size:11px;letter-spacing:.16em;color:#aab3bf}
#armurerie-match .am-s-l b{font-weight:500;font-size:14px;letter-spacing:.04em;color:#e9edf2}
#armurerie-match .am-s-l b.plus{color:var(--am-vert)} #armurerie-match .am-s-l b.moins{color:var(--am-rouge)}
#armurerie-match .am-s-l b small{font-size:11px;margin-left:5px;opacity:.85}
#armurerie-match .am-j{position:relative;height:5px;margin-top:5px;background:rgba(255,255,255,.08)}
#armurerie-match .am-j i{position:absolute;left:0;top:0;bottom:0;background:#e9edf2;transition:width .25s cubic-bezier(.2,.8,.2,1)}
#armurerie-match .am-j u{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--am-or);transition:left .25s}
#armurerie-match .am-j.plus i{background:linear-gradient(90deg,#e9edf2 70%,var(--am-vert))} #armurerie-match .am-j.moins i{background:linear-gradient(90deg,#e9edf2 70%,var(--am-rouge))}
#armurerie-match .am-leg{font-size:10.5px;letter-spacing:.12em;color:#6f7a88;margin-top:12px;display:flex;align-items:center;gap:6px}
#armurerie-match .am-leg u{display:inline-block;width:2px;height:10px;background:var(--am-or)}
/* les viseurs */
#armurerie-match .am-vis{grid-column:1/3;padding:12px 18px 12px 14px;border-top:1px solid var(--am-ligne);background:rgba(0,0,0,.18)}
#armurerie-match .am-vis-l{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
#armurerie-match .am-v{display:grid;grid-template-columns:52px 1fr;gap:12px;align-items:center;padding:8px 12px 8px 8px;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);transition:background .15s,border-color .15s,transform .15s}
#armurerie-match .am-v:hover:not(:disabled){background:rgba(255,255,255,.065);transform:translateY(-1px)}
#armurerie-match .am-v.on{border-color:var(--am-or);background:linear-gradient(180deg,rgba(242,167,27,.16),rgba(242,167,27,.05));box-shadow:inset 0 -2px 0 var(--am-or)}
#armurerie-match .am-v:disabled{opacity:.3;cursor:not-allowed}
#armurerie-match .am-v svg{width:52px;height:52px;background:#07080b;border:1px solid rgba(255,255,255,.08)}
#armurerie-match .am-v-n{font-family:'Bebas Neue',sans-serif;font-size:21px;letter-spacing:.05em;line-height:1}
#armurerie-match .am-v-t{font-size:11px;line-height:1.35;color:#9aa4b1;margin-top:3px}
#armurerie-match .am-v .am-cle{position:absolute;top:6px;right:7px;min-width:18px;height:18px;font-size:10px}
/* le pied */
#armurerie-match .am-pied{grid-column:1/3;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 18px 14px 26px;border-top:1px solid var(--am-ligne);flex-wrap:wrap}
#armurerie-match .am-aide{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;letter-spacing:.12em;color:#8792a0}
#armurerie-match .am-aide kbd{font:inherit;color:#d8dde4;border:1px solid rgba(255,255,255,.22);border-bottom-width:2px;padding:0 5px;margin-right:5px;background:rgba(255,255,255,.04)}
#armurerie-match .am-ok,#armurerie-match .am-non{font-family:'Bebas Neue',sans-serif;letter-spacing:.12em;text-align:center;transition:background .15s,filter .15s}
#armurerie-match .am-ok{font-size:25px;padding:9px 34px;background:linear-gradient(180deg,#ffbb3a,#f2a71b);color:#14161a;clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)}
#armurerie-match .am-ok:hover{filter:brightness(1.1)}
#armurerie-match .am-ok.meme{background:linear-gradient(180deg,#59606b,#434852);color:#e9edf2}
#armurerie-match .am-non{font-size:20px;padding:9px 20px;border:1px solid rgba(255,255,255,.16)!important;margin-right:8px}
#armurerie-match .am-non:hover{background:rgba(255,255,255,.06)}
@media (max-width:900px){#armurerie-match .am-boite{grid-template-columns:1fr;grid-template-rows:auto auto 1fr auto auto;height:auto;max-height:96vh;overflow:auto}
  #armurerie-match .am-tete,#armurerie-match .am-vis,#armurerie-match .am-pied{grid-column:1}
  #armurerie-match .am-liste{flex-direction:row;flex-wrap:wrap;border-right:none;padding:10px}#armurerie-match .am-liste h3{display:none}
  #armurerie-match .am-a{flex:1 1 40%}#armurerie-match .am-scene{grid-template-columns:1fr;min-height:420px}
  #armurerie-match .am-vue{min-height:220px}#armurerie-match .am-vis-l{grid-template-columns:repeat(2,1fr)}#armurerie-match .am-titre b{font-size:44px}}
@media (max-height:640px){#armurerie-match .am-tete{padding:10px 20px 8px}#armurerie-match h2{font-size:30px}#armurerie-match .am-titre b{font-size:46px}
  #armurerie-match .am-titre p{display:none}#armurerie-match .am-s{margin-bottom:6px}#armurerie-match .am-v svg{width:40px;height:40px}
  #armurerie-match .am-v{grid-template-columns:40px 1fr}#armurerie-match .am-v-t{display:none}#armurerie-match .am-a{padding:6px 10px}}
@media (prefers-reduced-motion:reduce){#armurerie-match .am-boite{animation:none}#armurerie-match .am-direct i{animation:none}}
`;

// L'APERÇU 3D : un petit moteur à lui, les quatre armes (vraies, GLB) avec leurs viseurs, une seule montrée
class Apercu {
  constructor(hote) {
    this.hote = hote;
    const r = this.r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
    hote.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    const cle = new THREE.DirectionalLight(0xffe2b8, 2.2); cle.position.set(2, 3, 2); this.scene.add(cle);
    const bord = new THREE.DirectionalLight(0x9cc4ff, 1.6); bord.position.set(-3, 1.5, -2); this.scene.add(bord);
    this.camera = new THREE.PerspectiveCamera(24, 1, 0.05, 20);
    this.socle = new THREE.Group(); this.scene.add(this.socle);
    this.armes = {}; this.vis = {}; this.hausses = {};
    this.angle = 0.0; this.vitesse = 0.25; this.cible = null; this._drag = null; this._t = performance.now();
    const el = r.domElement;
    el.addEventListener('pointerdown', (e) => { this._drag = { x: e.clientX, a: this.angle }; el.setPointerCapture?.(e.pointerId); });
    el.addEventListener('pointermove', (e) => { if (this._drag) this.angle = this._drag.a + (e.clientX - this._drag.x) * 0.012; });
    const fin = () => { this._drag = null; this._reprise = performance.now(); };
    el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
  }
  _arme(id) {
    if (this.armes[id]) return this.armes[id];
    const g = creerArme(id, { pourVue: true });
    g.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    const V = creerViseurs(id, g);
    // (centrée sur sa boîte, le canon vers la droite de l'écran : l'arme est le long de −z, on la tourne d'un quart de tour)
    const pivot = new THREE.Group(); pivot.add(g);
    const b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3());
    g.position.sub(c);
    pivot.userData.long = Math.max(ENCOMBREMENTS[id] || 0.8, b.getSize(new THREE.Vector3()).z);
    this.armes[id] = pivot; this.vis[id] = V; this.hausses[id] = V ? coucherHausse(id, g) : null;
    this.socle.add(pivot);
    return pivot;
  }
  montrer(id, viseur) {
    for (const k of Object.keys(this.armes)) this.armes[k].visible = false;
    const p = this._arme(id); p.visible = true;
    const V = this.vis[id];
    if (V) for (const [t, v] of Object.entries(V)) v.groupe.visible = t === viseur;
    if (this.hausses[id]) this.hausses[id].couche(!!(V && viseur && V[viseur]));
    if (this.id !== id) { this.id = id; this._pop = 0; }
    this._cadrer();
  }
  _cadrer() {
    const w = this.hote.clientWidth || 600, h = this.hote.clientHeight || 300;
    if (w !== this._w || h !== this._h) { this._w = w; this._h = h; this.r.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
    const p = this.armes[this.id]; if (!p) return;
    // la distance qui fait tenir l'arme dans 62 % de la largeur (et 70 % de la hauteur)
    const L = p.userData.long, fov = THREE.MathUtils.degToRad(this.camera.fov);
    const dH = (L * 0.5) / Math.tan(fov / 2) / 0.62 / this.camera.aspect, dV = (L * 0.36) / Math.tan(fov / 2) / 0.7;
    this._dist = Math.max(dH, dV);
  }
  image() {
    const now = performance.now(), dt = Math.min(0.05, (now - this._t) / 1000); this._t = now;
    this._cadrer();
    if (!this._drag && (!this._reprise || now - this._reprise > 1600)) this.angle += dt * this.vitesse;
    this._pop = Math.min(1, (this._pop ?? 1) + dt * 4);
    const e = 1 - Math.pow(1 - this._pop, 3);
    // (le profil de l'arme, canon à droite, qui pivote doucement de ± 35° autour : on voit ses deux flancs sans la voir de face)
    this.socle.rotation.set(0.06 * Math.sin(now / 2600), -Math.PI / 2 + Math.sin(this.angle) * 0.62, 0);
    this.socle.position.y = -0.006 + 0.008 * Math.sin(now / 1400);
    const d = (this._dist || 1.6) * (1.12 - 0.12 * e);
    // (le regard un peu au-dessus de l'arme : elle se pose dans le bas de la vue, sous son nom et sa phrase)
    this.camera.position.set(0, d * 0.16, d); this.camera.lookAt(0, 0.075 * (this.armes[this.id]?.userData.long || 0.8), 0);
    this.r.render(this.scene, this.camera);
  }
}

export class ArmurerieMatch {
  constructor(game) {
    this.game = game; this.ouvert = false; this.arme = 'fa24'; this.viseur = null; this.el = null;
    this._touche = (e) => this._clavier(e);
    this._boucle = () => { if (!this.ouvert) return; try { this.apercu?.image(); } catch (e) { this.apercu = null; } this._raf = requestAnimationFrame(this._boucle); };
  }
  _construire() {
    if (this.el) return;
    const st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
    const el = document.createElement('div'); el.id = 'armurerie-match'; el.hidden = true;
    el.innerHTML = `<div class="am-boite" role="dialog" aria-label="Changer d'arme">
      <div class="am-tete"><h2>ÉQUIPEMENT<small>CHANGER D’ARME ET DE VISEUR</small></h2>
        <div class="am-etat"><span class="am-direct"><i></i>LA PARTIE CONTINUE</span><span>L’ARME SORT CHARGÉE</span></div></div>
      <div class="am-liste"><h3>ARME PRINCIPALE</h3><div class="am-armes" style="display:contents"></div></div>
      <div class="am-scene"><div class="am-vue"><div class="am-sol"></div><div class="am-titre"></div><div class="am-tourne">⟲ FAIRE GLISSER POUR TOURNER</div></div>
        <div class="am-stats"><h3>CARACTÉRISTIQUES</h3><div class="am-s-liste"></div>
          <div class="am-leg"><u></u>ARME TENUE · <span style="color:var(--am-vert)">MIEUX</span> / <span style="color:var(--am-rouge)">MOINS BIEN</span></div></div></div>
      <div class="am-vis"><h3>VISEUR</h3><div class="am-vis-l am-viseurs"></div></div>
      <div class="am-pied"><div class="am-aide"><span><kbd>1</kbd>–<kbd>4</kbd>ARME</span><span><kbd>5</kbd>–<kbd>8</kbd>VISEUR</span>
        <span><kbd>ENTRÉE</kbd>ÉQUIPER</span><span><kbd>B</kbd>/<kbd>ÉCHAP</kbd>FERMER</span></div>
        <div><button class="am-non" data-act="fermer">ANNULER</button><button class="am-ok" data-act="ok">ÉQUIPER</button></div></div></div>`;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.arme) { this.arme = b.dataset.arme; this._garderViseur(); this._dessiner(); }
      else if (b.dataset.viseur !== undefined) { this.viseur = b.dataset.viseur || null; this._dessiner(); }
      else if (b.dataset.act === 'ok') this.equiper();
      else if (b.dataset.act === 'fermer') this.fermer(true);
    });
    // (un clic sur le fond, hors de la boîte : fermer)
    el.addEventListener('pointerdown', (e) => { if (e.target === el) this.fermer(true); });
    document.body.appendChild(el);
    this.el = el;
    try { this.apercu = new Apercu(el.querySelector('.am-vue')); } catch (e) { this.apercu = null; }
  }
  // un viseur que l'arme choisie ne prend pas : retiré
  _garderViseur() { if (this.viseur && !(VISEURS[this.viseur] && VISEURS[this.viseur].armes.includes(this.arme))) this.viseur = null; }
  _fiche(id, viseur) {
    const P = this.game.partie, A = P && P.local && P.local.arsenal, M = (A && A.modificateurs) || {};
    return ficheEquipee(ARMES[id], M.accessoire || null, M.atout || null, viseur);
  }
  _dessiner() {
    const L = this.el.querySelector('.am-armes'), V = this.el.querySelector('.am-viseurs');
    const tenue = this._tenue, f = this._fiche(this.arme, this.viseur), ref = tenue ? this._fiche(tenue.id, tenue.viseur) : f;
    L.innerHTML = PRINCIPALES.map((id, k) => {
      const F = ARMES[id];
      return `<button class="am-a ${id === this.arme ? 'on' : ''}" data-arme="${id}"><span class="am-cle">${k + 1}</span>
        <div><div class="am-a-n">${nomSeul(F)}<em>${surnom(F).toUpperCase()}</em></div><div class="am-a-c">${CLASSES_TXT[F.classe] || ''}</div></div>
        ${tenue && tenue.id === id ? '<span class="am-tag">EN MAIN</span>' : ''}</button>`;
    }).join('');
    this.el.querySelector('.am-titre').innerHTML = `<b>${nomSeul(f)}</b><span>« ${surnom(f).toUpperCase()} » · ${CLASSES_TXT[f.classe] || ''} · ${NOMS_VISEURS[this.viseur]}</span><p>${ROLES[this.arme] || ''}</p>`;
    const C = caracs(f), R = caracs(ref);
    this.el.querySelector('.am-s-liste').innerHTML = C.map(([n, txt, k, val, plusMieux], i) => {
      const r = R[i], diff = val - r[3], mieux = Math.abs(diff) < 1e-6 ? '' : (diff > 0) === plusMieux ? 'plus' : 'moins';
      const ecart = !mieux ? '' : n === 'VISÉE' ? `${diff > 0 ? '+' : '−'}${Math.round(Math.abs(diff) * 1000)}` : '';
      return `<div class="am-s"><div class="am-s-l">${n}<b class="${mieux}">${txt}${ecart ? `<small>${ecart}</small>` : ''}</b></div>
        <div class="am-j ${mieux}"><i style="width:${Math.round(k * 100)}%"></i><u style="left:calc(${Math.round(r[2] * 100)}% - 1px)"></u></div></div>`;
    }).join('');
    V.innerHTML = CHOIX_VISEURS.map((v, k) => {
      const S = v && VISEURS[v], ok = !v || (S && S.armes.includes(this.arme));
      const txt = !v ? (this.arme === 'tp50' ? 'La lunette de précision du TP-50.' : 'Hausse et guidon de l’arme.')
        : `Zoom × ${S.zoom.toFixed(2).replace('.', ',')}${S.ads ? ` · visée + ${Math.round(S.ads * 1000)} ms` : ' · sans malus'}`;
      return `<button class="am-v ${(v || null) === this.viseur ? 'on' : ''}" data-viseur="${v || ''}" ${ok ? '' : 'disabled'}><span class="am-cle">${k + 5}</span>
        ${svgViseur(v)}<div><div class="am-v-n">${NOMS_VISEURS[v]}</div><div class="am-v-t">${ok ? txt : 'Ne se monte pas sur cette arme.'}</div></div></button>`;
    }).join('');
    const meme = tenue && tenue.id === this.arme && (tenue.viseur || null) === this.viseur;
    const ok = this.el.querySelector('.am-ok'); ok.textContent = meme ? 'DÉJÀ ÉQUIPÉE' : 'ÉQUIPER'; ok.classList.toggle('meme', !!meme);
    try { this.apercu?.montrer(this.arme, this.viseur); } catch (e) { this.apercu = null; }
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
    this._tenue = { id: this.arme, viseur: this.viseur };
    this.ouvert = true; this.game.menuArme = true; this.el.hidden = false;
    this._dessiner();
    this.game.input.purger?.();
    window.addEventListener('keydown', this._touche, true); window.addEventListener('keyup', this._bloquer = (e) => e.stopImmediatePropagation(), true);
    if (document.pointerLockElement) document.exitPointerLock?.();
    cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(this._boucle);
    return true;
  }
  fermer(reprendre = true) {
    if (!this.ouvert) return;
    this.ouvert = false; this.el.hidden = true; cancelAnimationFrame(this._raf);
    window.removeEventListener('keydown', this._touche, true); window.removeEventListener('keyup', this._bloquer, true);
    this.game.input.purger?.();
    const P = this.game.partie;
    // (la capture redemandée dans le geste qui ferme — un clic, une touche : une activation —, le calque si elle est refusée)
    if (reprendre && P && P.besoinCapture?.() && !P.capte?.()) P.capturer().then((ok) => { if (!ok && this.game.partie === P) P.attendreClic?.(); }).finally(() => { this.game.menuArme = false; });
    else this.game.menuArme = false;
  }
  equiper() {
    const P = this.game.partie, a = P && P.local, t = this._tenue;
    const meme = t && t.id === this.arme && (t.viseur || null) === this.viseur;
    const ok = meme || !!(a && P.changerEquipement(a, { principale: this.arme, viseur: this.viseur }));
    this.fermer(true);
    return ok;
  }
  _clavier(e) {
    e.stopImmediatePropagation();
    if (e.repeat) { e.preventDefault(); return; }
    const k = e.code;
    if (k === 'Escape' || k === 'KeyB') { e.preventDefault(); this.fermer(true); return; }
    if (k === 'Enter' || k === 'NumpadEnter' || k === 'Space') { e.preventDefault(); this.equiper(); return; }
    // (flèches : haut / bas l'arme, gauche / droite le viseur)
    if (k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault(); const i = PRINCIPALES.indexOf(this.arme), n = PRINCIPALES.length;
      this.arme = PRINCIPALES[(i + (k === 'ArrowDown' ? 1 : n - 1)) % n]; this._garderViseur(); this._dessiner(); return;
    }
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      e.preventDefault();
      const ok = CHOIX_VISEURS.filter((v) => !v || VISEURS[v].armes.includes(this.arme)), i = ok.indexOf(this.viseur);
      this.viseur = ok[(i + (k === 'ArrowRight' ? 1 : ok.length - 1)) % ok.length]; this._dessiner(); return;
    }
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
