// L'interface d'IRIS : le panneau d'OPTIONS (graphismes, audio, commandes, emotes ; 23/10 : combat, et les commandes du
// combat et du prop hunt), le HUD de la balade, la roue des emotes et l'écran de pause. Repris de LA CAGE (js/ui.js) sans le menu principal, le choix du joueur, le choix du
// match, la boutique, les vœux ni le salon en ligne : IRIS part directement dans l'école.
import { ACTIONS, LISTES_ACTIONS, QUALITIES, SHADOWS, WEATHERS_OPT, keyLabel, actionKey, entree, padLabel, padGlyph, defaultBindings, defaultPadBindings } from './settings.js';
import { capturerBouton, annulerCapture, infoManette } from './manette.js';
import { EMOTES, EMOTE_SLOTS, EMOTE_CATS, roueEmotes } from './emotes.js';
import { IS_TOUCH } from './touch.js';            // Options > Commandes : le bloc COMMANDES TACTILES

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- OPTIONS ----------
// (23/10, lot L-U du jeu : l'onglet COMBAT — la vue à la 1re personne, l'habillage, la priorité fluidité, le démarrage —,
// ajouté ICI par le code (index.html ne change pas) ; dans COMMANDES, trois profils BALADE / COMBAT / PROP HUNT, chacun sa
// table complète (js/settings.js LISTES_ACTIONS, bindingsDe / bind(…, profil)) ; en COMBAT et en PROP HUNT, une case qui
// attend une touche prend aussi un bouton de la souris ou la molette ; un Ctrl lié est signalé (Ctrl + W ferme l'onglet))
const PROFILS = [['balade', 'BALADE'], ['combat', 'COMBAT'], ['prop', 'PROP HUNT']];
// les couleurs du réticule (jamais le rouge : c'est celui d'un ennemi visé)
const RETICULES = [['#ffffff', 'Blanc'], ['#7dff6b', 'Vert'], ['#ffe14d', 'Jaune'], ['#4de1ff', 'Cyan'], ['#ff7ae0', 'Rose']];
const CTRL = new Set(['ControlLeft', 'ControlRight']);
// un Ctrl lié dans un profil (Ctrl + W ferme l'onglet sans recours ; en AZERTY, Ctrl + Z — le code KeyW, « avancer » — aussi)
export const ctrlLie = (settings, p) => { const B = settings.bindingsDe ? settings.bindingsDe(p) : settings.bindings; return Object.values(B || {}).some((b) => (b || []).some((c) => CTRL.has(c))); };
// cm par tour de souris à 800 ppp pour la sensibilité FPS `s` (0,0025 × s rad par point : 0,45 → 5 585 points, 17,7 cm)
export const cmParTour = (s) => (2 * Math.PI / (0.0025 * Math.max(0.01, s))) / 800 * 2.54;

export function buildOptions(settings, cb = {}) {
  const box = $('options'), panels = $('opt-panels'), tabs = $('opt-tabs');
  let tab = 'graphics', listening = null, prof = 'balade';
  // l'onglet COMBAT, en dernier (les quatre d'aujourd'hui gardent leur place)
  if (tabs && !tabs.querySelector('[data-tab="combat"]')) {
    const b = document.createElement('button'); b.dataset.tab = 'combat'; b.textContent = 'COMBAT'; tabs.appendChild(b);
  }

  const row = (label, sub, ctl) => `<div class="opt-row"><div class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</div><div class="ctl">${ctl}</div></div>`;
  // `dispo` (facultatif) grise les choix que la machine ne peut PAS tenir ; `type` : 'bool' ou 'num' (la valeur écrite)
  const RESOLUTIONS = [['auto', 'Auto'], ['720', '720p'], ['1080', '1080p'], ['1440', '1440p'], ['2160', '4K']];
  const seg = (path, opts, cur, dispo = null, type = null) => `<div class="seg" data-seg="${path}"${type ? ` data-type="${type}"` : ''}>${opts.map(([v, l]) => {
    const ko = dispo && !dispo(v);
    return `<button data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}${ko ? ' ko' : ''}"${ko ? ' disabled title="Ta machine ne peut pas tenir ce préréglage"' : ''}>${l}</button>`;
  }).join('')}</div>`;
  const range = (path, min, max, step, cur, fmt) => `<input type="range" data-range="${path}" min="${min}" max="${max}" step="${step}" value="${cur}" data-fmt="${fmt}"><span class="val" data-val="${path}">${format(fmt, cur)}</span>`;
  const toggle = (path, cur) => `<div class="toggle ${cur ? 'on' : ''}" data-toggle="${path}" role="switch" aria-checked="${!!cur}"></div>`;
  const format = (fmt, v) => fmt === 'pct' ? `${Math.round(v * 100)} %` : fmt === 'deg' ? `${v}°` : fmt === 'x' ? `${(+v).toFixed(2)}×`
    : fmt === 'cm' ? `${cmParTour(+v).toFixed(1).replace('.', ',')} cm` : String(v);

  // Bloc MANETTE de l'onglet Commandes : état, réglages des sticks et des vibrations, puis la disposition par défaut
  // dessinée avec les boutons de la manette branchée — celle du profil montré (balade, combat, prop hunt).
  function renderManette(pad, p = 'balade') {
    const info = infoManette();
    let h = '<div class="opt-group">MANETTE</div>';
    h += row('Manette', info
      ? `${info.nom} · la première manette qui s'active pilote Haythem. Débranchée en pleine partie : le jeu se met en pause.`
        + (info.standard ? '' : ' Le navigateur ne connaît pas sa disposition : seul son stick gauche est lu, et ses boutons peuvent être ailleurs — réaffecte-les dans la colonne MANETTE.')
      : 'Aucune manette détectée : branche-la (USB ou Bluetooth), puis appuie sur un de ses boutons.',
    `<span class="pad-etat${info ? ' on' : ''}">${info ? 'CONNECTÉE' : 'ABSENTE'}</span>`);
    h += row('Zone morte des sticks', 'En dessous de ce seuil, un stick ne compte pas. Monte-la si Haythem avance tout seul (stick usé), baisse-la pour plus de réactivité.',
      range('controls.pad.deadzone', 0.05, 0.4, 0.01, pad.deadzone, 'pct'));
    h += row('Sensibilité caméra au stick', 'Stick droit', range('controls.pad.sens', 0.3, 2.5, 0.05, pad.sens, 'x'));
    h += row('Inverser l\'axe vertical (stick droit)', '', toggle('controls.pad.invertY', pad.invertY));
    h += row('Vibrations', 'De courtes secousses discrètes', toggle('controls.pad.vibrations', pad.vibrations));
    const L = LISTES_ACTIONS[p] || ACTIONS;
    const d = (id) => { const a = L.find((x) => x.id === id); return a ? (a.pad || []).filter(Boolean).map((c2) => padGlyph(c2)).join('') : ''; };
    const g2 = (n) => padGlyph('Pad:' + n);
    const menus = [`${g2('Up')}${g2('Down')}${g2('A')}${g2('B')}${g2('LB')}${g2('RB')}`, 'Dans les menus : croix ou stick gauche pour te déplacer, valider, revenir, changer d\'onglet ; stick droit pour défiler'];
    const lignes = p === 'combat' ? [
      ['<span class="pad-g">STICK G</span>', 'Se déplacer : effleure pour marcher, pousse pour courir'],
      ['<span class="pad-g">STICK D</span>', 'Viser (le regard)'],
      [d('sprint'), 'Sprint (deux appuis : sprint tactique)'],
      [d('jump'), 'Sauter, franchir'],
      [d('accroupi'), 'Accroupi (en sprint : glissade)'],
      [d('tir'), 'Tirer'], [d('visee'), 'Viser'], [d('recharger'), 'Recharger'], [d('armeSuiv'), 'Changer d’arme'],
      [d('couteau'), 'Couteau'], [d('letale'), 'Grenade (tenir : la cuire)'], [d('tactique'), 'Grenade flash'],
      [d('scanner'), 'Scanner (chasseur du prop hunt)'], [`${d('serie1')}${d('serie2')}${d('serie3')}`, 'Séries'],
      [d('scores'), 'Tableau des scores (tenir)'], [d('pause'), 'Pause'], menus,
    ] : p === 'prop' ? [
      ['<span class="pad-g">STICK G</span>', 'Se déplacer (un prop marche sans bruit en effleurant)'],
      ['<span class="pad-g">STICK D</span>', 'La caméra — roue ouverte : choisir la provocation'],
      [d('sprint'), 'Sprint'], [d('jump'), 'Sauter'],
      [d('deguiser'), 'Devenir le meuble visé'], [d('verrou'), 'Verrouiller le cap'], [d('figer'), 'Se figer'],
      [d('provoquer'), 'Roue des provocations (tenir)'], [d('provocVite'), 'Provocation (la dernière)'],
      [d('scores'), 'Tableau des scores (tenir)'], [d('pause'), 'Pause'], menus,
    ] : [
      ['<span class="pad-g">STICK G</span>', 'Se déplacer : effleure pour marcher, pousse pour courir'],
      ['<span class="pad-g">STICK D</span>', 'La caméra'],
      [d('sprint'), 'Sprint'],
      [d('jump'), 'Sauter'],
      [d('interact'), 'S’asseoir, se lever'],
      [d('emote'), 'Roue des emotes (vise au stick droit, relâche ou valide)'],
      [d('camera'), 'Changer de vue (3e personne, épaule, 1re personne, vue photo)'],
      [d('phone'), 'Téléphone'],
      [d('pause'), 'Pause'],
      [d('walk'), 'Marcher (garder le pas)'],
      menus,
    ];
    h += '<div class="opt-note">Disposition par défaut :</div><div class="pad-doc">'
      + lignes.map(([k, t]) => `<div class="k">${k}</div><div>${t}</div>`).join('') + '</div>';
    return h;
  }

  // L'onglet EMOTES : les huit de la roue, choisies parmi toutes (un appui ajoute ou retire)
  function renderEmotes() {
    const roue = roueEmotes().map((e) => e.id);
    let h = `<div class="opt-note">La roue montre huit emotes (touches 1 à 8). Touche une emote pour la mettre sur la roue ou l'en retirer — <b>${roue.length} / ${EMOTE_SLOTS}</b>.</div>`;
    for (const cat of EMOTE_CATS) {
      h += `<div class="opt-group">${cat.toUpperCase()}</div><div class="emote-choix">`;
      for (const e of EMOTES.filter((x) => x.cat === cat)) {
        const on = roue.includes(e.id);
        h += `<button class="emote-c${on ? ' on' : ''}" data-emote="${e.id}" title="${esc(e.desc || e.label)}"><span class="ico">${e.icon}</span><span>${esc(e.label)}</span></button>`;
      }
      h += '</div>';
    }
    h += `<div class="opt-row"><div class="lbl">Remettre la roue de départ</div><div class="ctl"><button class="btn-secondary" data-emote-raz="1">RÉINITIALISER</button></div></div>`;
    return h;
  }

  // L'onglet COMBAT (lot L-U, spec § 4.5.16) : la vue à la 1re personne (`controls.fps`), l'habillage (`jeu.habillage`,
  // Airsoft par défaut : la même ligne que dans les réglages du combat), la priorité fluidité (`jeu.fluidite`), et ce
  // qui suit « APPUIE POUR COMMENCER » (`game.demarrage` : le menu, ou la balade directe d'avant)
  function renderCombat() {
    const F = settings.controls.fps || {}, J = settings.data.jeu || {}, G = settings.game || {};
    let h = '<div class="opt-group">LA VUE À LA 1RE PERSONNE</div>';
    h += row('Champ de vision', 'Horizontal, pour un écran 16:9. 90° par défaut ; plus large, on voit plus, mais tout paraît plus loin.', range('controls.fps.champ', 75, 110, 1, F.champ ?? 90, 'deg'));
    h += row('Sensibilité de la souris', 'La distance que parcourt la souris pour un tour complet, à 800 ppp (0,45 par défaut : 17,7 cm). Moins de centimètres = plus rapide.',
      range('controls.fps.sens', 0.1, 2, 0.01, F.sens ?? 0.45, 'cm'));
    h += row('Sensibilité en visée', 'Multiplie la sensibilité quand tu vises (elle suit déjà le zoom : à 1,00 la sensation reste la même).', range('controls.fps.sensVisee', 0.5, 1.5, 0.05, F.sensVisee ?? 1, 'x'));
    h += row('Visée', 'MAINTENUE : on vise tant que le bouton est tenu. BASCULE : un appui pour viser, un autre pour arrêter.',
      seg('controls.fps.viseeMaintenue', [[true, 'Maintenue'], [false, 'Bascule']], F.viseeMaintenue !== false, null, 'bool'));
    h += row('Accroupi maintenu', 'Activé : accroupi tant que la touche est tenue. Sinon un appui pour s’accroupir, un autre pour se relever.', toggle('controls.fps.accroupiMaintenu', !!F.accroupiMaintenu));
    h += row('Sprint automatique', 'Le sprint part tout seul quand on pousse franchement vers l’avant.', toggle('controls.fps.sprintAuto', !!F.sprintAuto));
    h += row('Aide à la visée', 'À la manette et au doigt seulement, jamais à la souris : la visée ralentit sur un ennemi et le suit un peu.', toggle('controls.fps.aideVisee', F.aideVisee !== false));
    h += row('Tir automatique (tactile)', 'Au doigt : le tir part seul quand le réticule reste sur un ennemi à 30 m ou moins.', toggle('controls.fps.tirAuto', !!F.tirAuto));
    h += row('Couleur du réticule', 'Il passe au bleu sur un allié et au rouge sur un ennemi.',
      seg('controls.fps.reticule', RETICULES.map(([v, l]) => [v, `<i class="reticule-pastille" style="background:${v}"></i>${l}`]), F.reticule || '#ffffff'));
    h += row('Secousses', 'Les secousses de la caméra aux explosions. 0 % : aucune.', range('controls.fps.secousses', 0, 1, 0.05, F.secousses ?? 1, 'pct'));
    h += '<div class="opt-group">HABILLAGE</div>';
    h += row('Habillage', 'AIRSOFT (par défaut, conseillé — et pour toute vidéo publiée) : billes de peinture, « TOUCHÉ », tir au gaz. MILITAIRE : impacts de balles, « ÉLIMINÉ ».',
      seg('jeu.habillage', [['airsoft', 'Airsoft'], ['militaire', 'Militaire']], J.habillage === 'militaire' ? 'militaire' : 'airsoft'));
    h += '<div class="opt-group">RENDU</div>';
    h += row('Priorité fluidité', 'En partie, la qualité automatique vise 60 images par seconde au lieu de 45 : elle baisse d’un cran plus tôt.', toggle('jeu.fluidite', !!J.fluidite));
    h += '<div class="opt-group">DÉMARRAGE</div>';
    h += row('Après « appuie pour commencer »', 'MENU : le menu principal du jeu. BALADE : directement dans l’école, comme avant.',
      seg('game.demarrage', [['menu', 'Menu'], ['balade', 'Balade']], G.demarrage === 'balade' ? 'balade' : 'menu'));
    return h;
  }

  function render() {
    const g = settings.graphics, a = settings.audio, c = settings.controls;
    const fx = window.__game && window.__game.fx;
    const ud = (window.__game && window.__game.scene && window.__game.scene.userData) || {};
    let html = '';
    if (tab === 'graphics') {
      // (à l'intérieur, pas de météo : la lumière est celle des plafonniers)
      if (!ud.interieur) html += row('Météo', 'Auto = le temps change tout seul (soleil, ciel couvert, pluie)', seg('graphics.weather', WEATHERS_OPT, g.weather || 'auto'));
      html += row('Qualité', 'Auto = sonde le matériel (départ en ULTRA sur une machine costaude, en HAUTE sur un PC ordinaire, en MOYENNE sur un PC modeste, en MOYENNE ou BASSE sur téléphone), puis mesure le coût des images et descend ou monte d\'un cran à la fois. ULTRA et EXTRÊME ajoutent les ombres douces resserrées et le suréchantillonnage : il faut une carte graphique dédiée. Les préréglages grisés dépassent ce que ta machine peut tenir.',
        seg('graphics.quality', QUALITIES, g.quality, (v) => v === 'auto' || !fx || fx.disponible(v)));
      // LE PRÉRÉGLAGE VRAIMENT APPLIQUÉ et la puce qui calcule l'image
      if (fx) {
        const QN = { low: 'BASSE', medium: 'MOYENNE', high: 'HAUTE', ultra: 'ULTRA', extreme: 'EXTRÊME' };
        const brut = fx.dev.gpu || '';
        const m = /ANGLE \([^,]*,\s*([^,]+?)(?:\s*\(0x[0-9a-f]+\))?(?:\s+(?:Direct3D|vs_|OpenGL|Vulkan).*)?,/i.exec(brut);
        const puce = (m ? m[1] : brut).trim() || 'puce inconnue';
        const origine = g.quality === 'auto' || !g.quality ? (fx.auto && !fx._decided ? 'Auto, mesure en cours' : 'choisi par Auto')
          : fx.quality !== g.quality ? 'bridé par la machine' : 'choisi à la main';
        const bandeauDedie = fx.dev.integre && /Windows/.test(navigator.userAgent) && !fx.dev.telephone;
        if (bandeauDedie) {
          html += `<div class="opt-note" style="border:1px solid var(--accent2, #e8622a); border-radius:8px; margin:8px 8px 4px; padding:10px 12px; color:inherit; line-height:1.45">`
            + `<b>Le jeu tourne sur la puce graphique intégrée</b> (${esc(puce)}). Si ton PC a aussi une carte graphique dédiée, donne-la au navigateur : `
            + `<b>Paramètres Windows › Système › Écran › Graphiques</b> › ton navigateur › Options › <b>Hautes performances</b>, puis ferme complètement le navigateur et relance-le. `
            + `Carte NVIDIA : <b>Panneau de configuration NVIDIA › Gérer les paramètres 3D › Processeur graphique préféré › Processeur NVIDIA hautes performances</b>.</div>`;
        }
        html += row('Préréglage appliqué', 'Ce que le jeu utilise vraiment en ce moment, et la puce graphique qui calcule l\'image.',
          `<div class="qtable"><div><b>${QN[fx.quality] || esc(fx.quality)}</b><span>${origine} · ${esc(puce)}${fx.dev.telephone ? ' · téléphone' : fx.dev.costaud ? ' · machine costaude' : fx.dev.integre ? ' · intégrée' : ''}</span></div></div>`);
      }
      html += row('Détail du rendu', 'Ce que chaque préréglage change', `<div class="qtable">`
        + `<div><b>Basse</b><span>rendu direct, lissage FXAA · ombres 1024 — le mode des petits téléphones</span></div>`
        + `<div><b>Moyenne</b><span>${fx && fx._legere && fx._legere('medium') ? 'étalonnage complet et anticrénelage FXAA réaffûté (la chaîne légère de ta machine)' : 'bloom · anticrénelage (SMAA)'} · ombres 2048 · la lumière des murs par la sonde</span></div>`
        + `<div><b>Haute</b><span>+ carte d'environnement prise sur place (reflets, lumière qui rebondit) · occlusion ambiante · ombres douces 3072</span></div>`
        + `<div><b>Ultra</b><span>+ ombres douces 4096 resserrées · filtrage 16× · suréchantillonnage</span></div>`
        + `<div><b>Extrême</b><span>+ occlusion 32 échantillons · suréchantillonnage 1,3×</span></div>`
        + `</div>`);
      html += row('Résolution dynamique', `Toujours active : la résolution interne baisse dans les moments chargés puis remonte, sans jamais descendre sous ${fx ? Math.round(fx._dynMin() * 100) : 80} % ici.`,
        `<div class="qtable"><div><b>${fx ? Math.round(fx.dyn * 100) + ' %' : '—'}</b><span>${fx ? (fx._pxRendus() / 1e6).toFixed(2) + ' Mpx rendus · ' + (fx.dev.telephone ? 'profil téléphone' : fx.dev.costaud ? 'profil machine costaude' : 'profil standard') : ''}</span></div></div>`);
      html += row('Résolution de rendu', `Hauteur à laquelle le jeu est calculé, avant que l'écran ne l'étire. AUTO suit ta machine et ta fenêtre. Au-dessus de ton écran, c'est du suréchantillonnage ; en dessous, tu gagnes des images et le réaffûtage rattrape le flou.`
        + (fx ? ` Ici : <b>${Math.round(window.innerWidth * fx._curRatio)}×${Math.round(window.innerHeight * fx._curRatio)}</b> pour une fenêtre de ${window.innerWidth}×${window.innerHeight}.` : ''),
        seg('graphics.res', RESOLUTIONS, g.res || 'auto'));
      html += row('Réaffûtage', 'Rend son piquant à l\'image quand on calcule en dessous de la résolution de l\'écran.', range('graphics.sharp', 0, 0.8, 0.05, g.sharp === undefined ? 0.35 : g.sharp, 'pct'));
      html += row('Échelle de rendu', 'Plafond de résolution interne quand la résolution est sur AUTO (baisser = plus fluide).', range('graphics.scale', 0.5, 1, 0.05, g.scale, 'pct'));
      html += row('Images par seconde max', 'AUTO : 60 au téléphone (il chauffe moins), sans limite sur ordinateur. 30 : pour un téléphone qui peine ou pour économiser la batterie.',
        seg('graphics.fpsMax', [['auto', 'Auto'], ['30', '30'], ['60', '60'], ['0', 'Sans limite']], String(g.fpsMax || 'auto')));
      html += row('Ombres', 'Taille de la carte d\'ombre', seg('graphics.shadows', SHADOWS, g.shadows));
      html += row('Occlusion ambiante (GTAO)', 'Ombrage des recoins, coûteux', toggle('graphics.ao', g.ao));
      html += row("Style d'image", "PHOTO (par défaut) : réaliste, le rendu d'un appareil photo — couleurs justes, matières nettes. VIF : couleurs plus riches, contraste plus franc, façon jeu vidéo. Sans coût, l'un comme l'autre.", seg('graphics.look', [['photo', 'Photo'], ['vif', 'Vif']], g.look || 'photo'));
      html += row('Rendu des couleurs', 'CINÉMA : contrasté et saturé. NATUREL (AgX) : hautes lumières plus douces.', seg('graphics.tonemap', [['aces', 'Cinéma'], ['agx', 'Naturel']], g.tonemap || 'aces'));
      html += row('Bloom', 'Halo lumineux sur les zones claires (les spots du plafond)', toggle('graphics.bloom', g.bloom));
      html += row('Anticrénelage (SMAA)', 'Lisse les bords', toggle('graphics.aa', g.aa));
      if (fx) {
        const ici = (actif, pourquoi, coche = true) => (actif ? ' <b>Active ici.</b>' : ` <b>Sans effet ici</b> : ${coche ? pourquoi : 'case décochée'}.`);
        const fort = fx.dev.costaud && !fx.dev.telephone, sansCarte = 'réservé aux cartes graphiques dédiées (pas aux puces intégrées ni aux téléphones)';
        html += '<div class="opt-group">OPTIONS COÛTEUSES</div>';
        html += row('MSAA x4', 'Quatre échantillons par pixel sur l\'image de la scène, en plus du SMAA : les arêtes fines (pieds de chaises, chambranles) ne crénellent plus. Environ 7 % du temps d\'image d\'une puce intégrée, moins d\'une milliseconde sur une carte dédiée.'
          + ici(fx.renderPass.msaa > 0, !fort ? sansCarte : fx.quality === 'low' ? 'pas en basse' : 'image déjà suréchantillonnée au-delà de 5 Mpx', g.msaa !== false),
          toggle('graphics.msaa', g.msaa !== false));
        html += row('Basse étalonnée', 'En BASSE, l\'image reçoit l\'étalonnage (contraste, teintes, saturation, vignette), puis le lissage FXAA.'
          + ici(!!(fx.sortieBasse && fx.sortieBasse.enabled), fx.quality !== 'low' ? 'seulement en BASSE (les autres préréglages l\'ont déjà)' : 'désactivée', g.etalonnageBasse !== false),
          toggle('graphics.etalonnageBasse', g.etalonnageBasse !== false));
        html += row('Sonde de lumière', 'Sans carte d\'environnement (BASSE, MOYENNE, téléphone), la lumière qui rebondit des murs vient de la pièce photographiée et résumée en neuf coefficients, au lieu d\'un dégradé plat. Rien de plus par pixel.'
          + ici(!!(ud.sondeCiel && ud.sondeCiel.active), !ud.sondeCiel ? 'la carte n\'en a pas' : 'seulement sans carte d\'environnement (BASSE, MOYENNE, téléphone)', g.sonde !== false),
          toggle('graphics.sonde', g.sonde !== false));
      }
      html += row('Compteur d\'images', 'Affiche les FPS en haut à gauche', toggle('graphics.fps', g.fps));
    } else if (tab === 'audio') {
      html += row('Volume général', '', range('audio.master', 0, 1, 0.05, a.master, 'pct'));
      html += row('Effets', 'Pas, réceptions, crissements', range('audio.sfx', 0, 1, 0.05, a.sfx, 'pct'));
    } else if (tab === 'emotes') {
      html += renderEmotes();
    } else if (tab === 'combat') {
      html += renderCombat();
    } else {
      // COMMANDES TACTILES (js/touch.js) : en tête de l'onglet, au téléphone et à la tablette
      if (IS_TOUCH && c.tactile) {
        const T = c.tactile;
        html += '<div class="opt-group">COMMANDES TACTILES</div>';
        html += row('Taille des boutons', 'Les boutons et le joystick. Les boutons d’action ne descendent jamais sous 48 px.', range('controls.tactile.taille', 0.75, 1.35, 0.05, T.taille, 'pct'));
        html += row('Opacité', 'Plus bas, on voit mieux l’école derrière les boutons. Un bouton appuyé s’allume toujours en plein.', range('controls.tactile.opacite', 0.25, 1, 0.05, T.opacite, 'pct'));
        html += row('Joystick', 'FLOTTANT : il apparaît sous ton pouce, n’importe où dans la moitié gauche de l’écran. FIXE : toujours au même endroit. Effleure pour marcher, pousse jusqu’au bord pour sprinter (l’anneau s’allume).',
          seg('controls.tactile.stick', [['flottant', 'Flottant'], ['fixe', 'Fixe']], T.stick));
        html += row('Vibrations', 'Un petit retour sous le doigt à chaque appui et au passage en sprint (Android).', toggle('controls.tactile.vibrations', T.vibrations));
        html += row('Disposition', 'Déplace chaque bouton et le joystick au doigt, et règle taille et opacité en voyant le résultat.'
          + '<span class="tc-opt-manette">Manette active : elle masque les commandes tactiles. Touche l’écran pour les déplacer.</span>',
          '<button class="btn-secondary" data-tactile="editer">DÉPLACER LES BOUTONS</button><button class="btn-secondary" data-tactile="raz">RÉINITIALISER</button>');
      }
      // LES TROIS PROFILS DE TOUCHES (une table chacun : une touche ne sert qu'une action DANS son profil)
      html += `<div class="sous-onglets" role="tablist">${PROFILS.map(([p, l]) => `<button id="cmd-${p}" data-prof="${p}" role="tab" aria-selected="${p === prof}" class="${p === prof ? 'on' : ''}">${l}</button>`).join('')}</div>`;
      if (prof === 'balade') {
        html += row('Sensibilité souris', 'La caméra', range('controls.sensitivity', 0.1, 3, 0.05, c.sensitivity, 'x'));
        html += row('Inverser l\'axe vertical', '', toggle('controls.invertY', c.invertY));
      } else {
        html += `<div class="opt-note">Les touches ${prof === 'combat' ? 'du COMBAT (et du chasseur du prop hunt)' : 'du PROP (quand tu es un meuble)'} : à part de celles de la balade. Une case qui attend une touche prend aussi un bouton de la souris (clic gauche, droit, molette, boutons de côté) ou un cran de molette. La sensibilité et le champ de la vue à la 1re personne sont dans l’onglet COMBAT ; l’axe vertical inversé est celui de la balade.</div>`;
      }
      if (PROFILS.some(([p]) => ctrlLie(settings, p))) {
        html += '<div class="opt-avert">⚠ <b>Ctrl + W ferme l’onglet</b> du navigateur sans recours (en AZERTY, Ctrl + Z est Ctrl + W ; Ctrl + S, Ctrl + D ouvrent aussi des fenêtres) : '
          + 'une touche Ctrl est liée ici. En plein écran, le jeu demande au navigateur de lui garder ces touches ; sinon, préfère C ou un bouton de la souris.</div>';
      }
      html += '<div class="opt-group">TOUCHES</div><div class="bind-head"><span>Action</span><span>Principale</span><span>Secondaire</span><span>Manette</span></div>';
      const B = settings.bindingsDe ? settings.bindingsDe(prof) : settings.bindings, PB = settings.padBindingsDe ? settings.padBindingsDe(prof) : settings.padBindings;
      let group = null;
      for (const act of LISTES_ACTIONS[prof] || ACTIONS) {
        if (act.group !== group) { group = act.group; html += `<div class="opt-note">${group}</div>`; }
        const b = B[act.id] || [null, null], pb = PB[act.id] || [null, null];
        const padCell = act.stick
          ? `<div class="pad-cell fixe" title="Le stick gauche déplace Haythem : effleure-le pour marcher, pousse-le pour courir">STICK G ${act.stick}</div>`
          : `<div class="pad-cell">${[0, 1].map((s) => `<button class="key-btn pad-btn ${pb[s] ? '' : 'empty'}" data-padbind="${act.id}" data-slot="${s}" data-prof="${prof}" title="${pb[s] ? padLabel(pb[s]) : 'libre'}">${pb[s] ? padGlyph(pb[s]) : '—'}</button>`).join('')}</div>`;
        html += `<div class="bind-row"><div class="lbl">${act.label}</div>${[0, 1].map((s) => `<button class="key-btn ${b[s] ? '' : 'empty'}" data-bind="${act.id}" data-slot="${s}" data-prof="${prof}">${keyLabel(b[s])}</button>`).join('')}${padCell}</div>`;
      }
      html += '<div class="opt-note">Clique sur une touche puis appuie sur la nouvelle · ÉCHAP annule · RETOUR ARRIÈRE efface l\'emplacement. Une touche déjà utilisée ailleurs dans le même profil est libérée automatiquement. Colonne MANETTE : choisis un emplacement, puis appuie sur le bouton de la manette — ÉCHAP annule, RETOUR ARRIÈRE vide l\'emplacement.</div>';
      html += renderManette(c.pad, prof);
    }
    panels.innerHTML = html;
    panels.querySelectorAll('[data-seg]').forEach((sg) => sg.querySelectorAll('button').forEach((b) => {
      b.onclick = () => {
        const t = sg.dataset.type, v = t === 'bool' ? b.dataset.v === 'true' : t === 'num' ? +b.dataset.v : b.dataset.v;
        settings.set(sg.dataset.seg, v); render();
      };
    }));
    panels.querySelectorAll('[data-range]').forEach((r) => {
      const val = panels.querySelector(`[data-val="${r.dataset.range}"]`);
      r.oninput = () => { val.textContent = format(r.dataset.fmt, +r.value); };
      r.onchange = () => { settings.set(r.dataset.range, +r.value); };
    });
    panels.querySelectorAll('[data-toggle]').forEach((t) => { t.onclick = () => { settings.set(t.dataset.toggle, !settings.get(t.dataset.toggle)); render(); }; });
    panels.querySelectorAll('[data-bind]').forEach((b) => { b.onclick = () => listen(b); });
    panels.querySelectorAll('[data-padbind]').forEach((b) => { b.onclick = () => listenPad(b); });
    panels.querySelectorAll('[data-prof]:not([data-bind]):not([data-padbind])').forEach((b) => { b.onclick = () => { arreter(); prof = b.dataset.prof; render(); }; });
    panels.querySelectorAll('[data-tactile]').forEach((b) => {
      b.onclick = () => { if (b.dataset.tactile === 'raz') { settings.resetTactile(); render(); } else cb.onDisposition?.(); };
    });
    panels.querySelectorAll('[data-emote]').forEach((b) => {
      b.onclick = () => {
        const roue = roueEmotes().map((e) => e.id), id = b.dataset.emote, i = roue.indexOf(id);
        if (i >= 0) { if (roue.length > 1) roue.splice(i, 1); } else if (roue.length < EMOTE_SLOTS) roue.push(id);
        else { roue[roue.length - 1] = id; }
        settings.set('game.emotes', roue); render();
      };
    });
    panels.querySelectorAll('[data-emote-raz]').forEach((b) => { b.onclick = () => { settings.set('game.emotes', []); render(); }; });
  }
  // (les touches d'un profil, et ses boutons de manette)
  const touchesDe = (p) => (settings.bindingsDe ? settings.bindingsDe(p) : settings.bindings);
  const boutonsDe = (p) => (settings.padBindingsDe ? settings.padBindingsDe(p) : settings.padBindings);
  // arrête l'écoute en cours (touche, souris, molette, ou bouton de manette) et remet son libellé
  function arreter() {
    if (!listening) return;
    const L = listening, el = L.el, p = el.dataset.prof || 'balade';
    window.removeEventListener('keydown', L.h, true);
    if (L.hm) { window.removeEventListener('mousedown', L.hm, true); window.removeEventListener('wheel', L.hw, true); window.removeEventListener('contextmenu', L.hc, true); }
    if (L.pad) annulerCapture();
    listening = null;
    el.classList.remove('listening');
    if (el.dataset.bind) el.textContent = keyLabel((touchesDe(p)[el.dataset.bind] || [])[+el.dataset.slot]);
    else { const c = (boutonsDe(p)[el.dataset.padbind] || [])[+el.dataset.slot]; el.innerHTML = c ? padGlyph(c) : '—'; }
  }
  function listenPad(btn) {
    arreter();
    const id = btn.dataset.padbind, slot = +btn.dataset.slot, p = btn.dataset.prof || 'balade';
    if (!infoManette()) { btn.textContent = 'BRANCHE-LA'; setTimeout(() => { if (!listening && !box.hidden) render(); }, 1100); return; }
    btn.classList.add('listening'); btn.textContent = 'APPUIE…';
    const h = (e) => {
      if (e.code !== 'Escape' && e.code !== 'Backspace' && e.code !== 'Delete') return;
      e.preventDefault(); e.stopImmediatePropagation();
      window.removeEventListener('keydown', h, true); annulerCapture(); listening = null;
      if (e.code !== 'Escape') { if (p === 'balade') settings.unbindPad(id, slot); else settings.bindPad(id, slot, null, p); }
      render();
    };
    listening = { el: btn, h, pad: true };
    window.addEventListener('keydown', h, true);
    capturerBouton((code) => {
      window.removeEventListener('keydown', h, true); listening = null;
      if (code) { if (p === 'balade') settings.bindPad(id, slot, code); else settings.bindPad(id, slot, code, p); }
      render();
    });
  }
  // UNE CASE QUI ATTEND : la prochaine touche — en COMBAT et en PROP HUNT, aussi le prochain bouton de la souris (« Souris:0 »
  // à « Souris:4 ») ou cran de molette (« Molette:haut / bas ») : js/input.js les produit en partie, pointeur capturé. (En
  // balade la souris n'est pas une touche : elle tourne la caméra.) Le clic qui a ouvert la case est déjà passé (on écoute
  // après lui) ; celui qu'on capte ne clique rien d'autre.
  function listen(btn) {
    arreter();
    const id = btn.dataset.bind, slot = +btn.dataset.slot, p = btn.dataset.prof || 'balade', souris = p !== 'balade';
    btn.classList.add('listening'); btn.textContent = souris ? 'TOUCHE OU CLIC…' : 'APPUIE…';
    const lier = (code) => {
      if (code === null) { if (p === 'balade') settings.unbind(id, slot); else settings.bind(id, slot, null, p); }
      else if (p === 'balade') settings.bind(id, slot, code); else settings.bind(id, slot, code, p);
      verrouClavier();
    };
    const fin = (code, effacer = false) => { arreter(); if (effacer) lier(null); else if (code) lier(code); render(); };
    const h = (e) => {
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.code === 'Escape' && id !== 'pause') { fin(null); return; }
      if (e.code === 'Backspace' || e.code === 'Delete') fin(null, true); else fin(e.code);
    };
    const L = { el: btn, h };
    if (souris) {
      L.hm = (e) => {
        e.preventDefault(); e.stopImmediatePropagation();
        // (le mouseup, le clic et le menu contextuel qui suivent ne cliquent rien ; les boutons 4 et 5 ne font pas « page précédente »)
        const avale = (ev) => { ev.preventDefault(); ev.stopImmediatePropagation(); if (ev.type === 'mouseup') setTimeout(lacher, 300); else if (ev.type !== 'contextmenu') lacher(); };
        const lacher = () => { for (const t of ['mouseup', 'click', 'auxclick', 'contextmenu']) window.removeEventListener(t, avale, true); };
        for (const t of ['mouseup', 'click', 'auxclick', 'contextmenu']) window.addEventListener(t, avale, true);
        setTimeout(lacher, 3000);
        fin('Souris:' + e.button);
      };
      L.hw = (e) => { if (!e.deltaY) return; e.preventDefault(); e.stopImmediatePropagation(); fin(e.deltaY < 0 ? 'Molette:haut' : 'Molette:bas'); };
      L.hc = (e) => { e.preventDefault(); e.stopImmediatePropagation(); };
      window.addEventListener('mousedown', L.hm, true);
      window.addEventListener('wheel', L.hw, { capture: true, passive: false });
      window.addEventListener('contextmenu', L.hc, true);
    }
    listening = L;
    window.addEventListener('keydown', h, true);
  }
  // EN PLEIN ÉCRAN, avec un Ctrl lié : le navigateur laisse au jeu les lettres et les chiffres (navigator.keyboard.lock,
  // Chrome et Edge) — Ctrl + W, Ctrl + S, Ctrl + D, Ctrl + 1… ne ferment ni n'ouvrent plus rien. Ces touches-là seulement :
  // ÉCHAP reste au navigateur (un appui sort du plein écran et rend le pointeur, la pause s'ouvre comme d'habitude ; verrouillé,
  // il faudrait le TENIR 2 s) et Tab aussi (Alt + Tab reste à Windows)
  const VERROUILLEES = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((c) => 'Key' + c).concat([...'0123456789'].map((c) => 'Digit' + c));
  function verrouClavier() {
    const K = navigator.keyboard; if (!K || !K.lock) return;
    try { if (document.fullscreenElement && PROFILS.some(([p]) => ctrlLie(settings, p))) K.lock(VERROUILLEES).catch(() => {}); else K.unlock(); } catch (e) { /* refusé */ }
  }
  document.addEventListener('fullscreenchange', verrouClavier);
  const choisirOnglet = (t) => { tab = t; tabs.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.tab === tab)); };
  tabs.querySelectorAll('button').forEach((b) => { b.onclick = () => { arreter(); choisirOnglet(b.dataset.tab); render(); }; });
  const close = () => { arreter(); box.hidden = true; cb.onClose?.(); };
  $('opt-close').onclick = close; $('opt-ok').onclick = close;
  // « Réinitialiser cet onglet » : COMBAT remet la vue à la 1re personne, l'habillage, la priorité fluidité et le démarrage ;
  // COMMANDES, les touches du profil montré (BALADE : tout le reste des commandes, comme avant — sans toucher aux profils du jeu)
  const remettre = (section, garder) => {
    const avant = JSON.parse(JSON.stringify(settings.data[section]));
    settings.reset(section);
    const neuf = settings.data[section], out = avant;
    for (const k of garder) out[k] = neuf[k];
    settings.data[section] = out; settings.save();
  };
  $('opt-reset').onclick = () => {
    arreter();
    if (tab === 'emotes') settings.set('game.emotes', []);
    else if (tab === 'combat') {
      remettre('controls', ['fps']); remettre('jeu', ['habillage', 'fluidite']); remettre('game', ['demarrage']);
    } else if (tab === 'controls' && prof !== 'balade') {
      const L = LISTES_ACTIONS[prof];
      settings.data.controls[prof] = { bindings: defaultBindings(L), pad: defaultPadBindings(L) }; settings.save();
    } else if (tab === 'controls') {
      const garde = { combat: settings.data.controls.combat, prop: settings.data.controls.prop, fps: settings.data.controls.fps };
      settings.reset('controls'); Object.assign(settings.data.controls, garde); settings.save();
    } else settings.reset(tab);
    verrouClavier();
    render();
  };
  window.addEventListener('keydown', (e) => { if (!box.hidden && e.code === 'Escape' && !listening) { e.stopImmediatePropagation(); close(); } }, true);
  // À la manette (js/manette_menus.js), B pendant qu'une case attend une touche du CLAVIER : on annule l'attente
  box.addEventListener('pad-annuler', (e) => { if (listening && !listening.pad) { arreter(); e.preventDefault(); } });
  document.addEventListener('hoops-keylayout', () => { if (!box.hidden) render(); });
  return {
    // (« Commandes » ouvert depuis une partie : le profil de la partie d'abord)
    open(startTab = null) {
      if (startTab) choisirOnglet(startTab);
      if (startTab === 'controls') { const P = window.__game && window.__game.partie; prof = P ? P.profil : 'balade'; }
      box.hidden = false; render(); cb.onOpen?.();
    },
    close, get isOpen() { return !box.hidden; },
    rafraichir() { if (!box.hidden && !listening) render(); },
    // (les tests : le profil montré dans COMMANDES, l'onglet courant)
    get profil() { return prof; }, set profil(p) { if (LISTES_ACTIONS[p]) { arreter(); prof = p; if (!box.hidden) render(); } },
    get onglet() { return tab; },
  };
}

// ---------- HUD ----------
export class HUD {
  constructor() {
    this.el = $('hud');
    this.fb = $('hud-feedback'); this.hintEl = $('hud-hint');
    this.stam = $('stamina-fill');
    this.streakEl = $('hud-streak');
    this.fpsEl = $('hud-fps'); this.keysEl = $('hud-keys');
  }
  show() { this.el.hidden = false; }
  hide() { this.el.hidden = true; }
  hint(text) {
    this.hintTxt = text;
    if (this.hintEl.textContent !== text) this.hintEl.textContent = text;
  }
  feedback(text, cls = 'info') {
    this.fb.textContent = text; this.fb.className = 'feedback ' + cls;
    void this.fb.offsetWidth; // relance l'animation
    this.fb.classList.add('pop');
    // Les temps forts vus du joueur passent tous par ici : la manette y accroche ses vibrations (js/manette.js).
    document.dispatchEvent(new CustomEvent('hoops-feedback', { detail: { text, cls } }));
  }
  fps(show) { this.fpsEl.hidden = !show; }
  setFps(v) { if (!this.fpsEl.hidden) this.fpsEl.textContent = `${Math.round(v)} FPS`; }
  // (au demi-pour-cent ; le DOM n'est touché que si la valeur affichée change : c'est appelé à chaque pas)
  stamina(v) {
    const w = Math.round(Math.max(0, Math.min(100, v)) * 2) / 2;
    if (w !== this._vStam) { this._vStam = w; this.stam.style.width = `${w}%`; }
  }
  // petit texte sous le feedback (l'emote lancée)
  streak(text) {
    this.streakEl.textContent = text; this.streakEl.className = 'streak';
    void this.streakEl.offsetWidth; this.streakEl.classList.add('pop');
  }
  // le rappel des touches d'après les réglages ; à la manette, ses boutons
  setLobby() {
    const k = (id) => actionKey(id);
    if (entree.manette) {
      this.keysEl.textContent = `STICK G marcher / courir · STICK D caméra · ${k('sprint')} sprint · ${k('jump')} saut · ${k('emote')} emotes · ${k('camera')} vue · ${k('phone')} téléphone · ${k('pause')} pause`;
      return;
    }
    const move = `${k('forward')}${k('left')}${k('back')}${k('right')}`;
    this.keysEl.textContent = `${move} marcher · souris caméra · ${k('sprint')} sprint · ${k('jump')} saut · ${k('interact')} s’asseoir · ${k('emote')} emotes · ${k('camera')} vue · ${k('phone')} téléphone · ${k('pause')} pause`;
  }
}

// ---------- Roue des emotes ----------
export class EmoteWheel {
  constructor(emotes, onPick) {
    this.el = $('emote-wheel'); this.onPick = onPick; this.hovered = null; this.isOpen = false;
    this.setList(emotes);
    // sélection à la souris : direction depuis le centre de la roue
    this._move = (ev) => {
      if (!this.isOpen) return;
      const r = this.el.getBoundingClientRect(), dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 45) { this.setHover(null); return; }
      const n = this.emotes.length, step = (Math.PI * 2) / n, i = ((Math.round((Math.atan2(dy, dx) + Math.PI / 2) / step) % n) + n) % n;
      this.setHover(i);
    };
    window.addEventListener('mousemove', this._move);
  }
  // (re)construit la roue : le nombre de cases suit les emotes choisies
  setList(emotes) {
    if (this.emotes && this.emotes.length === emotes.length && this.emotes.every((e, i) => e.id === emotes[i].id)) return;
    this.emotes = emotes;
    this.el.innerHTML = '<div class="wheel-center" id="wheel-center">EMOTES</div>';
    this.center = $('wheel-center');
    const n = emotes.length, tactile = document.body.classList.contains('touch');
    const seg = tactile ? 88 : 106;
    const R = Math.max(tactile ? 120 : 150, Math.round(((seg + 16) * n) / (2 * Math.PI)));
    this.segs = emotes.map((e, i) => {
      const onPick = this.onPick;
      const b = document.createElement('button'); b.className = 'wheel-seg';
      b.innerHTML = `<span class="num">${i + 1}</span><span class="ico">${e.icon}</span><span class="lbl">${e.label}</span>`;
      const ang = -Math.PI / 2 + (i * Math.PI * 2) / n;
      b.style.left = `calc(50% + ${Math.round(Math.cos(ang) * R)}px)`; b.style.top = `calc(50% + ${Math.round(Math.sin(ang) * R)}px)`;
      b.onmouseenter = () => this.setHover(i);
      b.onclick = (ev) => { ev.stopPropagation(); onPick(i); this.close(); };
      this.el.appendChild(b); return b;
    });
    this.setHover(null);
  }
  open() { this.isOpen = true; this.el.hidden = false; this.setHover(null); }
  close() { this.isOpen = false; this.el.hidden = true; }
  setHover(i) {
    this.hovered = i;
    this.segs.forEach((s, k) => s.classList.toggle('on', k === i));
    this.center.textContent = i === null ? 'EMOTES' : this.emotes[i].label.toUpperCase();
  }
}

// ---------- Écran de pause ----------
// buttons : [{ label, cls: 'btn-primary' | 'btn-secondary', onClick }]
export function showOverlay(title, text, buttons) {
  const o = $('overlay');
  $('overlay-title').textContent = title;
  $('overlay-text').textContent = text;
  const row = $('overlay-buttons'); row.innerHTML = '';
  for (const b of buttons) { const el = document.createElement('button'); el.className = b.cls || 'btn-secondary'; el.textContent = b.label; el.onclick = b.onClick; row.appendChild(el); }
  o.hidden = false;
}
export function hideOverlay() { $('overlay').hidden = true; }
