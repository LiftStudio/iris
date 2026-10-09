// IRIS — le démarrage. Une seule partie pour toute la session : l'écran de chargement (js/chargement.js) télécharge les
// fichiers, on construit l'école et Haythem derrière lui (js/demarrage.js : avatar, animations, programmes compilés,
// première image), puis « APPUIE POUR COMMENCER » lève le rideau directement sur la balade — pas de menu.
import { Game, HAYTHEM } from './game.js';
import { AudioFX } from './audio.js';
import { buildOptions } from './ui.js';
import { Phone } from './phone.js';
import { settings } from './settings.js';
import { IS_TOUCH, VRAI_TACTILE, TouchControls, pleinEcran } from './touch.js';
import { prechargerModele } from './player.js';
import { roueEmotes } from './emotes.js';
import { preparerJeu } from './demarrage.js';

// L'ÉCRAN DE CHARGEMENT : les modules sont là ; on attend les fichiers lourds qu'il télécharge (les chargeurs du jeu
// les trouveront dans le cache), puis on construit l'école sous sa barre (le libellé est peint avant la construction,
// qui tient le fil principal d'un bloc).
const ch = window.__chargement || null;
if (ch) {
  await ch.fichiers();
  ch.etape('terrain');
  await ch.souffle();
}

const audio = new AudioFX();
audio.setVolumes(settings.audio);
// le son ne s'allume que sur un geste (règle des navigateurs) : le premier appui ou la première touche, quels qu'ils soient
for (const ev of ['pointerdown', 'keydown']) window.addEventListener(ev, () => audio.init(), { passive: true });
// écran tactile : la classe d'abord, avant le jeu — la roue des emotes, construite avec lui, s'y règle déjà
if (IS_TOUCH) document.body.classList.add('touch');

let game = null;
// le panneau d'options (pause) : les réglages s'appliquent en direct
const options = buildOptions(settings, {
  onOpen: () => { if (game) game.input.blocked = true; },
  onClose: () => { if (game) game.input.blocked = false; },
  // Commandes > DÉPLACER LES BOUTONS : la fiche s'efface le temps de placer les boutons, puis revient
  onDisposition: () => { const t = window.__touch; if (!t || !t.peutEditer()) return; options.close(); t.editer(() => options.open('controls')); },
});

game = new Game(audio, {
  onOptions: () => options.open(),
  onAide: () => options.open('controls'),
  onPhone: () => { if (!game.paused && phone) phone.toggle(); },
  onTick: (dt) => phone && phone.update(dt),        // messages du groupe qui arrivent en différé
}, settings);
audio.salle(game.scene.userData.interieur ? 0.2 : 0);   // à l'intérieur, les pas résonnent

// le téléphone : le groupe « IRIS ». L'ouvrir, c'est aussi le SORTIR dans le jeu : Haythem le regarde, et tape dessus.
const phone = new Phone({
  onOpen: () => { game.input.blocked = true; if (document.pointerLockElement) document.exitPointerLock?.(); game.user.sortirTel(); },
  onClose: () => { game.input.blocked = false; game.user.rangerTel(); },
  onType: () => game.user.taperTel(0.7),
});
window.__phone = phone;

settings.onChange(() => { audio.setVolumes(settings.audio); game.applySettings(); game.wheel.setList(roueEmotes()); });

// écran tactile : joystick + boutons (plein écran au premier appui sur un vrai téléphone)
const plein = IS_TOUCH && VRAI_TACTILE ? pleinEcran() : null;
if (IS_TOUCH) {
  const touch = new TouchControls(game);
  const entrer = game.enterLobby.bind(game);
  game.enterLobby = (...a) => { const r = entrer(...a); touch.refresh(); return r; };
  window.__touch = touch;
}
// PWA : hors ligne après la première visite (pas en file://)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const enregistrer = () => navigator.serviceWorker.register('./sw.js').catch((e) => console.info('[pwa] pas de service worker :', e.message));
  if (document.readyState === 'complete') enregistrer(); else window.addEventListener('load', enregistrer);
}
// MANETTE (js/manette.js) : quand on passe du clavier à la manette ou l'inverse, les aides à l'écran changent de langue
document.addEventListener('hoops-entree', () => {
  // (l'aide des touches revient quelques secondes, dans la langue de la nouvelle entrée)
  if (game.mode === 'lobby') { game.hud.setLobby(); game._aideT = Math.max(game._aideT || 0, 8); game._aideMin = 0; game.majAide(); }
});
// branchée / débranchée : l'onglet Commandes des options montre l'état et les bons boutons
document.addEventListener('hoops-manette', () => options.rafraichir());

window.__game = game; window.__settings = settings;   // accès console

// LE RIDEAU : Haythem et ses animations, les effets compilés, la première image — puis « APPUIE POUR COMMENCER ». Ce
// geste allume le son, passe en plein écran au téléphone (les deux exigent un geste), et la balade commence.
const _boot = document.getElementById('boot');
const commencer = () => { audio.init(); plein?.demande(); game.enterLobby(); };
if (ch && _boot) {
  preparerJeu(game, ch, { avatar: prechargerModele(HAYTHEM.model) })
    .catch((e) => console.warn('[chargement] préparation :', e))
    .then(() => {
      if (!game._raf) game.start();
      return ch.pret(commencer);
    });
} else {
  game.start();
  game.enterLobby();
  // Sans écran de chargement : on le retire APRÈS la première image peinte (sinon un éclair blanc)
  const partir = () => _boot?.remove();
  requestAnimationFrame(() => requestAnimationFrame(partir));
  setTimeout(partir, 20000);
}
