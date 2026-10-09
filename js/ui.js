// L'interface d'IRIS : le panneau d'OPTIONS (graphismes, audio, commandes, emotes), le HUD de la balade, la roue des
// emotes et l'écran de pause. Repris de LA CAGE (js/ui.js) sans le menu principal, le choix du joueur, le choix du
// match, la boutique, les vœux ni le salon en ligne : IRIS part directement dans l'école.
import { ACTIONS, QUALITIES, SHADOWS, WEATHERS_OPT, keyLabel, actionKey, entree, padLabel, padGlyph } from './settings.js';
import { capturerBouton, annulerCapture, infoManette } from './manette.js';
import { EMOTES, EMOTE_SLOTS, EMOTE_CATS, roueEmotes } from './emotes.js';
import { IS_TOUCH } from './touch.js';            // Options > Commandes : le bloc COMMANDES TACTILES

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- OPTIONS ----------
export function buildOptions(settings, cb = {}) {
  const box = $('options'), panels = $('opt-panels'), tabs = $('opt-tabs');
  let tab = 'graphics', listening = null;

  const row = (label, sub, ctl) => `<div class="opt-row"><div class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</div><div class="ctl">${ctl}</div></div>`;
  // `dispo` (facultatif) grise les choix que la machine ne peut PAS tenir
  const RESOLUTIONS = [['auto', 'Auto'], ['720', '720p'], ['1080', '1080p'], ['1440', '1440p'], ['2160', '4K']];
  const seg = (path, opts, cur, dispo = null) => `<div class="seg" data-seg="${path}">${opts.map(([v, l]) => {
    const ko = dispo && !dispo(v);
    return `<button data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}${ko ? ' ko' : ''}"${ko ? ' disabled title="Ta machine ne peut pas tenir ce préréglage"' : ''}>${l}</button>`;
  }).join('')}</div>`;
  const range = (path, min, max, step, cur, fmt) => `<input type="range" data-range="${path}" min="${min}" max="${max}" step="${step}" value="${cur}" data-fmt="${fmt}"><span class="val" data-val="${path}">${format(fmt, cur)}</span>`;
  const toggle = (path, cur) => `<div class="toggle ${cur ? 'on' : ''}" data-toggle="${path}" role="switch" aria-checked="${!!cur}"></div>`;
  const format = (fmt, v) => fmt === 'pct' ? `${Math.round(v * 100)} %` : fmt === 'deg' ? `${v}°` : fmt === 'x' ? `${(+v).toFixed(2)}×` : String(v);

  // Bloc MANETTE de l'onglet Commandes : état, réglages des sticks et des vibrations, puis la disposition par défaut
  // dessinée avec les boutons de la manette branchée.
  function renderManette(pad) {
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
    const d = (id) => { const a = ACTIONS.find((x) => x.id === id); return (a.pad || []).filter(Boolean).map((c2) => padGlyph(c2)).join(''); };
    const g2 = (n) => padGlyph('Pad:' + n);
    const lignes = [
      ['<span class="pad-g">STICK G</span>', 'Se déplacer : effleure pour marcher, pousse pour courir'],
      ['<span class="pad-g">STICK D</span>', 'La caméra'],
      [d('sprint'), 'Sprint'],
      [d('jump'), 'Sauter'],
      [d('interact'), 'S’asseoir, se lever'],
      [d('emote'), 'Roue des emotes (vise au stick droit, relâche ou valide)'],
      [d('camera'), 'Changer de vue (3e personne, épaule, 1re personne)'],
      [d('phone'), 'Téléphone'],
      [d('pause'), 'Pause'],
      [d('walk'), 'Marcher (garder le pas)'],
      [`${g2('Up')}${g2('Down')}${g2('A')}${g2('B')}${g2('LB')}${g2('RB')}`, 'Dans les menus : croix ou stick gauche pour te déplacer, valider, revenir, changer d\'onglet ; stick droit pour défiler'],
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
      html += row('Sensibilité souris', 'La caméra', range('controls.sensitivity', 0.1, 3, 0.05, c.sensitivity, 'x'));
      html += row('Inverser l\'axe vertical', '', toggle('controls.invertY', c.invertY));
      html += '<div class="opt-group">TOUCHES</div><div class="bind-head"><span>Action</span><span>Principale</span><span>Secondaire</span><span>Manette</span></div>';
      let group = null;
      for (const act of ACTIONS) {
        if (act.group !== group) { group = act.group; html += `<div class="opt-note">${group}</div>`; }
        const b = settings.bindings[act.id], pb = settings.padBindings[act.id];
        const padCell = act.stick
          ? `<div class="pad-cell fixe" title="Le stick gauche déplace Haythem : effleure-le pour marcher, pousse-le pour courir">STICK G ${act.stick}</div>`
          : `<div class="pad-cell">${[0, 1].map((s) => `<button class="key-btn pad-btn ${pb[s] ? '' : 'empty'}" data-padbind="${act.id}" data-slot="${s}" title="${pb[s] ? padLabel(pb[s]) : 'libre'}">${pb[s] ? padGlyph(pb[s]) : '—'}</button>`).join('')}</div>`;
        html += `<div class="bind-row"><div class="lbl">${act.label}</div>${[0, 1].map((s) => `<button class="key-btn ${b[s] ? '' : 'empty'}" data-bind="${act.id}" data-slot="${s}">${keyLabel(b[s])}</button>`).join('')}${padCell}</div>`;
      }
      html += '<div class="opt-note">Clique sur une touche puis appuie sur la nouvelle · ÉCHAP annule · RETOUR ARRIÈRE efface l\'emplacement. Une touche déjà utilisée ailleurs est libérée automatiquement. Colonne MANETTE : choisis un emplacement, puis appuie sur le bouton de la manette — ÉCHAP annule, RETOUR ARRIÈRE vide l\'emplacement.</div>';
      html += renderManette(c.pad);
    }
    panels.innerHTML = html;
    panels.querySelectorAll('[data-seg]').forEach((sg) => sg.querySelectorAll('button').forEach((b) => {
      b.onclick = () => { settings.set(sg.dataset.seg, b.dataset.v); render(); };
    }));
    panels.querySelectorAll('[data-range]').forEach((r) => {
      const val = panels.querySelector(`[data-val="${r.dataset.range}"]`);
      r.oninput = () => { val.textContent = format(r.dataset.fmt, +r.value); };
      r.onchange = () => { settings.set(r.dataset.range, +r.value); };
    });
    panels.querySelectorAll('[data-toggle]').forEach((t) => { t.onclick = () => { settings.set(t.dataset.toggle, !settings.get(t.dataset.toggle)); render(); }; });
    panels.querySelectorAll('[data-bind]').forEach((b) => { b.onclick = () => listen(b); });
    panels.querySelectorAll('[data-padbind]').forEach((b) => { b.onclick = () => listenPad(b); });
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
  // arrête l'écoute en cours (touche ou bouton de manette) et remet son libellé
  function arreter() {
    if (!listening) return;
    const el = listening.el;
    window.removeEventListener('keydown', listening.h, true);
    if (listening.pad) annulerCapture();
    listening = null;
    el.classList.remove('listening');
    if (el.dataset.bind) el.textContent = keyLabel(settings.bindings[el.dataset.bind][+el.dataset.slot]);
    else { const c = settings.padBindings[el.dataset.padbind][+el.dataset.slot]; el.innerHTML = c ? padGlyph(c) : '—'; }
  }
  function listenPad(btn) {
    arreter();
    const id = btn.dataset.padbind, slot = +btn.dataset.slot;
    if (!infoManette()) { btn.textContent = 'BRANCHE-LA'; setTimeout(() => { if (!listening && !box.hidden) render(); }, 1100); return; }
    btn.classList.add('listening'); btn.textContent = 'APPUIE…';
    const h = (e) => {
      if (e.code !== 'Escape' && e.code !== 'Backspace' && e.code !== 'Delete') return;
      e.preventDefault(); e.stopImmediatePropagation();
      window.removeEventListener('keydown', h, true); annulerCapture(); listening = null;
      if (e.code !== 'Escape') settings.unbindPad(id, slot);
      render();
    };
    listening = { el: btn, h, pad: true };
    window.addEventListener('keydown', h, true);
    capturerBouton((code) => {
      window.removeEventListener('keydown', h, true); listening = null;
      if (code) settings.bindPad(id, slot, code);
      render();
    });
  }
  function listen(btn) {
    arreter();
    btn.classList.add('listening'); btn.textContent = 'APPUIE…';
    const h = (e) => {
      e.preventDefault(); e.stopImmediatePropagation();
      window.removeEventListener('keydown', h, true); listening = null;
      const id = btn.dataset.bind, slot = +btn.dataset.slot;
      if (e.code === 'Escape' && id !== 'pause') { render(); return; }
      if (e.code === 'Backspace' || e.code === 'Delete') settings.unbind(id, slot); else settings.bind(id, slot, e.code);
      render();
    };
    listening = { el: btn, h };
    window.addEventListener('keydown', h, true);
  }
  const choisirOnglet = (t) => { tab = t; tabs.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.tab === tab)); };
  tabs.querySelectorAll('button').forEach((b) => { b.onclick = () => { choisirOnglet(b.dataset.tab); render(); }; });
  const close = () => { arreter(); box.hidden = true; cb.onClose?.(); };
  $('opt-close').onclick = close; $('opt-ok').onclick = close;
  $('opt-reset').onclick = () => {
    if (tab === 'emotes') settings.set('game.emotes', []);
    else settings.reset(tab === 'controls' ? 'controls' : tab);
    render();
  };
  window.addEventListener('keydown', (e) => { if (!box.hidden && e.code === 'Escape' && !listening) { e.stopImmediatePropagation(); close(); } }, true);
  // À la manette (js/manette_menus.js), B pendant qu'une case attend une touche du CLAVIER : on annule l'attente
  box.addEventListener('pad-annuler', (e) => { if (listening && !listening.pad) { arreter(); e.preventDefault(); } });
  document.addEventListener('hoops-keylayout', () => { if (!box.hidden) render(); });
  return {
    open(startTab = null) { if (startTab) choisirOnglet(startTab); box.hidden = false; render(); cb.onOpen?.(); },
    close, get isOpen() { return !box.hidden; },
    rafraichir() { if (!box.hidden && !listening) render(); },
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
